import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { types as nodeTypes } from "node:util";

import goldenReport from "@/docs/action-666bd-golden-binding-backed-replay-report.json";
import {
  action666bdAuthority,
  action666bdAuthorityConflictDependencies,
  action666bdCallerAuthorityRequest,
  action666bdCapturedAt,
  action666bdCrossTypeCollisionDependencies,
  action666bdDependencies,
  action666bdDependenciesFromJson,
  action666bdDuplicateEntriesDependencies,
  action666bdEvidenceAfterCutoffDependencies,
  action666bdExternalSnapshot,
  action666bdFutureSnapshotDependencies,
  action666bdGetterSnapshotDependencies,
  action666bdGoldenScenarios,
  action666bdHarness,
  action666bdIncompleteSnapshotDependencies,
  action666bdLookupAsOf,
  action666bdPredecessorMismatchDependencies,
  action666bdProposalReadyDependencies,
  action666bdProposalReadyRequest,
  action666bdReorderedRequest,
  action666bdReplay,
  action666bdSelfConsistentReplacementDependencies,
  action666bdSnapshotDigestMismatchDependencies,
  action666bdStatusDigestConflictDependencies,
} from "@/lib/server/canonical-governed-binding-snapshot-admission-fixtures";
import {
  CANONICAL_BINDING_BACKED_IMPROVEMENT_REPLAY_VERSION,
  CANONICAL_BINDING_SNAPSHOT_ADMISSION_STATUSES,
  CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION,
  CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY,
  CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
  CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_VERSION,
  CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
  CANONICAL_EXTERNAL_SNAPSHOT_MAX_JSON_BYTES,
  CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_ADMISSION_VERSION,
  DEFAULT_OFF_BINDING_SNAPSHOT_ADMISSION_ENABLED,
  DEFAULT_OFF_BINDING_SNAPSHOT_ADMISSION_KILL_SWITCH_ENGAGED,
  canonicalBindingBackedReplayDigest,
  createCanonicalBindingBackedImprovementReplayHarness,
  createCanonicalBindingSnapshotAdmissionAuthority,
  createCanonicalBindingSnapshotJsonSource,
  createCanonicalExternalImprovementBindingEntry,
  createCanonicalExternalImprovementBindingSnapshot,
  validateCanonicalBoundedSnapshotPayload,
  verifyCanonicalBindingBackedImprovementReplayResult,
  type CanonicalBindingBackedReplayResult,
  type CanonicalBindingSnapshotAdmissionCounters,
} from "@/lib/server/canonical-governed-binding-snapshot-admission";

function zeroCounters(): CanonicalBindingSnapshotAdmissionCounters {
  return {
    request_reads: 0,
    snapshot_reads: 0,
    clones: 0,
    authority_reads: 0,
    authority_verifications: 0,
    digest_operations: 0,
    admission_rebuilds: 0,
    store_constructions: 0,
    store_rebuilds: 0,
    lookup_adapter_constructions: 0,
    end_to_end_executions: 0,
    end_to_end_rebuilds: 0,
  };
}

function replayWith(dependencies = action666bdProposalReadyDependencies) {
  return action666bdReplay(
    action666bdProposalReadyRequest,
    dependencies,
  );
}

function nestedObjectAtDepth(depth: number) {
  const root: Record<string, unknown> = {};
  let cursor = root;
  for (let index = 0; index < depth; index += 1) {
    const next: Record<string, unknown> = {};
    cursor.next = next;
    cursor = next;
  }
  return root;
}

function valueWithExactNodeCount(targetNodes: number) {
  if (targetNodes < 1) throw new Error("target_nodes_must_be_positive");
  if (targetNodes === 1) return null;
  const groupCount = Math.ceil((targetNodes - 2) / 2_050);
  let remainingPrimitives = targetNodes - 2 - groupCount * 2;
  const root: number[][] = [];
  for (let group = 0; group < groupCount; group += 1) {
    const length = Math.min(2_048, remainingPrimitives);
    root.push(Array.from({ length }, (_, index) => index));
    remainingPrimitives -= length;
  }
  if (remainingPrimitives !== 0) {
    throw new Error("exact_node_fixture_construction_failed");
  }
  return root;
}

function replayWithValidationProbe(probe: unknown) {
  const source = action666bdExternalSnapshot();
  let depth = 0;
  let cursor = probe;
  while (
    cursor !== null &&
    typeof cursor === "object" &&
    !Array.isArray(cursor) &&
    Object.keys(cursor).length === 1 &&
    Object.hasOwn(cursor, "next")
  ) {
    depth += 1;
    cursor = (cursor as { next: unknown }).next;
  }
  const probeJson =
    cursor !== null &&
    typeof cursor === "object" &&
    !Array.isArray(cursor) &&
    Object.keys(cursor).length === 0
      ? `${'{"next":'.repeat(depth)}{}${"}".repeat(depth)}`
      : JSON.stringify(probe);
  const sourceJson = JSON.stringify(source);
  const snapshotJson = `${sourceJson.slice(0, -1)},"validation_probe":${probeJson}}`;
  const dependencies = action666bdDependenciesFromJson(
    snapshotJson,
    action666bdAuthority(source),
  );
  return {
    dependencies,
    result: action666bdReplay(
      action666bdProposalReadyRequest,
      dependencies,
    ),
  };
}

function recomputeTamperedFailure(
  value: CanonicalBindingBackedReplayResult,
) {
  const changed = structuredClone(value);
  const admissionPayload = structuredClone(changed.admission_result);
  delete (
    admissionPayload as Partial<typeof admissionPayload>
  ).admission_digest;
  changed.admission_result.admission_digest =
    canonicalBindingBackedReplayDigest(admissionPayload);
  changed.lineage.admission_digest =
    changed.admission_result.admission_digest;
  changed.lineage.snapshot_digest =
    changed.admission_result.observed_snapshot_digest;
  const lineagePayload = structuredClone(changed.lineage);
  delete (
    lineagePayload as Partial<typeof lineagePayload>
  ).lineage_digest;
  changed.lineage.lineage_digest =
    canonicalBindingBackedReplayDigest(lineagePayload);
  const replayPayload = structuredClone(changed);
  delete (
    replayPayload as Partial<CanonicalBindingBackedReplayResult>
  ).replay_digest;
  changed.replay_digest =
    canonicalBindingBackedReplayDigest(replayPayload);
  return changed;
}

test.describe("Action 666BD governed binding snapshot admission", () => {
  test("freezes exact admission taxonomy and safety policy", () => {
    expect(CANONICAL_BINDING_SNAPSHOT_ADMISSION_STATUSES).toEqual([
      "admitted",
      "incomplete",
      "conflicting",
      "not_point_in_time_safe",
      "unmappable",
    ]);
    const result = replayWith();
    expect(result).toMatchObject({
      replay_version:
        CANONICAL_BINDING_BACKED_IMPROVEMENT_REPLAY_VERSION,
      status: "admitted",
      proposal_status: "proposal_ready",
      shadow_only: true,
      live_ranking_effect: false,
      live_impact: false,
      persistence_performed: false,
      automatic_training_allowed: false,
      automatic_model_change_allowed: false,
      automatic_promotion_allowed: false,
      external_ai_canonical_truth_authority: false,
      synthetic_evidence: true,
      not_publishable: true,
    });
  });

  test("admits, freezes, constructs AX store, and independently rebuilds AQ", () => {
    const result = replayWith();
    expect(result.admission_result).toMatchObject({
      admission_version:
        CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_ADMISSION_VERSION,
      status: "admitted",
      reason_codes: [],
    });
    expect(result.admission_result.projection).not.toBeNull();
    expect(result.lineage).toMatchObject({
      admission_rebuild_verified: true,
      store_rebuild_verified: true,
      end_to_end_rebuild_verified: true,
      proposal_status: "proposal_ready",
    });
    expect(result.lineage.ax_store_snapshot_digest).toBe(
      result.admission_result.projection?.ax_snapshot_digest,
    );
    expect(result.end_to_end_result).toMatchObject({
      status: "completed",
      proposal_status: "proposal_ready",
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.admission_result)).toBe(true);
    expect(
      Object.isFrozen(
        result.admission_result.projection?.ax_snapshot,
      ),
    ).toBe(true);
  });

  test("covers all completed proposal classifications through the real store", () => {
    const observed = action666bdGoldenScenarios
      .slice(0, 4)
      .map((scenario) =>
        action666bdReplay(scenario.request, scenario.dependencies),
      );
    expect(
      observed.map((result) => result.proposal_status),
    ).toEqual([
      "proposal_ready",
      "no_change",
      "research_only",
      "insufficient_evidence",
    ]);
    expect(observed.every((result) => result.status === "admitted")).toBe(
      true,
    );
  });

  test("binds previous- and capture-binding collisions into distinct results", () => {
    const previous = action666bdGoldenScenarios[4];
    const capture = action666bdGoldenScenarios[5];
    const previousResult = action666bdReplay(
      previous.request,
      previous.dependencies,
    );
    const captureResult = action666bdReplay(
      capture.request,
      capture.dependencies,
    );
    expect(previousResult.status).toBe("conflicting");
    expect(captureResult.status).toBe("conflicting");
    expect(previousResult.replay_digest).not.toBe(
      captureResult.replay_digest,
    );
    expect(previousResult.reason_codes.join(" ")).toContain(
      "previous_binding",
    );
    expect(captureResult.reason_codes.join(" ")).toContain(
      "capture_identity",
    );
  });

  test("classifies incomplete, authority conflict, and point-in-time violation", () => {
    expect(
      replayWith(action666bdIncompleteSnapshotDependencies()).status,
    ).toBe("incomplete");
    expect(
      replayWith(action666bdAuthorityConflictDependencies()).status,
    ).toBe("conflicting");
    expect(
      replayWith(action666bdFutureSnapshotDependencies()).status,
    ).toBe("not_point_in_time_safe");
  });

  test("rejects self-consistent authority/root replacement against replay authority", () => {
    const dependencies =
      action666bdSelfConsistentReplacementDependencies();
    const harness = action666bdHarness(dependencies);
    const result = harness.replay?.(
      action666bdProposalReadyRequest,
    );
    expect(result?.status).toBe("conflicting");
    expect(result?.reason_codes).toContain(
      "binding_admission_replay_authority_mismatch",
    );
    expect(harness.counters.snapshot_reads).toBe(0);
    expect(harness.counters.clones).toBe(0);
  });

  test("rejects snapshot digest mismatch, predecessor drift, and evidence after cutoff", () => {
    const snapshot = replayWith(
      action666bdSnapshotDigestMismatchDependencies(),
    );
    const predecessor = replayWith(
      action666bdPredecessorMismatchDependencies(),
    );
    const cutoff = replayWith(
      action666bdEvidenceAfterCutoffDependencies(),
    );
    expect(snapshot.status).toBe("conflicting");
    expect(snapshot.reason_codes).toEqual(
      expect.arrayContaining([
        "binding_admission_authority_snapshot_conflict",
        "binding_admission_snapshot_digest_mismatch",
      ]),
    );
    expect(predecessor.status).toBe("conflicting");
    expect(predecessor.reason_codes).toEqual(
      expect.arrayContaining([
        "binding_admission_epoch_rollback_or_predecessor_drift",
      ]),
    );
    expect(cutoff.status).toBe("conflicting");
    expect(cutoff.reason_codes).toContain(
      "binding_admission_entry_after_evidence_cutoff",
    );
  });

  test("rejects duplicate identities, cross-type collisions, and status contradiction", () => {
    const duplicate = replayWith(
      action666bdDuplicateEntriesDependencies(),
    );
    const crossType = replayWith(
      action666bdCrossTypeCollisionDependencies(),
    );
    const contradiction = replayWith(
      action666bdStatusDigestConflictDependencies(),
    );
    expect(duplicate.status).toBe("conflicting");
    expect(duplicate.reason_codes).toEqual(
      expect.arrayContaining([
        "binding_admission_duplicate_entry_identity",
        "binding_admission_duplicate_lookup_identity",
      ]),
    );
    expect(crossType.status).toBe("conflicting");
    expect(crossType.reason_codes).toContain(
      "binding_admission_cross_type_collision",
    );
    expect(contradiction.status).toBe("conflicting");
    expect(contradiction.reason_codes).toContain(
      "binding_admission_entry_status_digest_conflict",
    );
  });

  test("rejects caller authority and live/promotion claims through closed request schema", () => {
    const harness =
      createCanonicalBindingBackedImprovementReplayHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: action666bdProposalReadyDependencies,
      });
    expect(harness.replay).not.toBeNull();
    const result = harness.replay!(
      action666bdCallerAuthorityRequest() as never,
    );
    expect(result.status).toBe("unmappable");
    expect(result.reason_codes).toContain(
      "binding_backed_replay_request_schema_invalid",
    );
    expect(result.lineage.ax_store_version).toBeNull();
  });

  test("rejects unrecognized sources before payload reads and rejects non-JSON surfaces", () => {
    const unrecognized = action666bdHarness(
      action666bdGetterSnapshotDependencies(),
    );
    expect(unrecognized).toMatchObject({
      status: "unavailable",
      replay: null,
    });
    expect(unrecognized.counters.snapshot_reads).toBe(0);

    const source = action666bdExternalSnapshot();
    const customPrototype = structuredClone(source);
    Object.setPrototypeOf(customPrototype, {
      caller_claimed_trusted_snapshot: true,
    });
    const prototypeResult = validateCanonicalBoundedSnapshotPayload(
      customPrototype,
    );
    expect(prototypeResult.status).toBe("invalid");
    expect(prototypeResult.reason_codes.join(" ")).toContain(
      "snapshot_payload_prototype_forbidden",
    );
  });

  test("rejects unknown and missing entry fields without reconstructing them", () => {
    const source = action666bdExternalSnapshot();
    const proposal =
      source.entry_inventory.length > 0
        ? source.entry_inventory[0]
        : null;
    const unknown = structuredClone(source);
    unknown.entry_inventory = [
      {
        ...(proposal ?? {
          entry_version:
            "canonical_external_improvement_binding_entry_v1",
          entry_identity:
            "admission-entry:previous_binding:proposal:proposal:unknown",
          entry_type: "previous_binding",
          bound_identity_type: "proposal",
          bound_identity: "proposal:unknown",
          observed_status: "matching",
          observed_binding_digest: "a".repeat(64),
          expected_binding_digest: "a".repeat(64),
          source_evidence_namespace:
            "canonical_previous_binding_evidence",
          source_section_digest: "b".repeat(64),
          effective_at: "2026-07-28T09:00:00.000000000Z",
          entry_digest_algorithm: "sha256_canonical_json_v1",
          entry_digest: "c".repeat(64),
        }),
        caller_approved: true,
      } as never,
    ];
    const unknownResult = replayWith(
      action666bdDependencies(
        undefined,
        unknown,
        action666bdAuthority(source),
      ),
    );
    expect(unknownResult.status).toBe("conflicting");
    expect(unknownResult.reason_codes).toContain(
      "binding_admission_entry_schema_invalid",
    );

    const missing = structuredClone(unknown);
    delete (
      missing.entry_inventory[0] as unknown as Record<string, unknown>
    ).expected_binding_digest;
    const missingResult = replayWith(
      action666bdDependencies(
        undefined,
        missing,
        action666bdAuthority(source),
      ),
    );
    expect(missingResult.status).toBe("conflicting");
    expect(missingResult.reason_codes).toContain(
      "binding_admission_entry_schema_invalid",
    );
  });

  test("authority is read exactly once and source bytes are isolated from later mutation", () => {
    const snapshot = structuredClone(action666bdExternalSnapshot());
    const authority = action666bdAuthority(snapshot);
    let authorityReads = 0;
    const dependencies = action666bdDependencies(
      undefined,
      snapshot,
      authority,
    );
    dependencies.authority_dependency.read_expected_authority = () => {
      authorityReads += 1;
      return authority;
    };
    snapshot.snapshot_identity = "external-binding-snapshot:mutated:9:9";
    const harness = action666bdHarness(dependencies);
    const result = harness.replay!(action666bdProposalReadyRequest);
    const before = JSON.stringify(result);
    expect(authorityReads).toBe(1);
    expect(harness.counters.snapshot_reads).toBe(1);
    expect(JSON.stringify(result)).toBe(before);
    expect(result.status).toBe("admitted");
  });

  test("source bytes remain immutable when caller mutates its former object during authority read", () => {
    const snapshot = structuredClone(action666bdExternalSnapshot());
    const authority = action666bdAuthority(snapshot);
    const dependencies = action666bdDependencies(
      undefined,
      snapshot,
      authority,
    );
    dependencies.authority_dependency.read_expected_authority = () => {
      snapshot.snapshot_identity = "external-binding-snapshot:mutated:9:9";
      return authority;
    };
    const result = replayWith(dependencies);
    expect(result.status).toBe("admitted");
    expect(result.reason_codes).toEqual([
      "all_experiment_candidate_gates_passed",
    ]);
  });

  test("input order is canonical and caller input remains immutable", () => {
    const reordered = action666bdReorderedRequest();
    const before = JSON.stringify(reordered);
    const canonical = replayWith();
    const result = action666bdReplay(
      reordered,
      action666bdProposalReadyDependencies,
    );
    expect(result).toEqual(canonical);
    expect(JSON.stringify(reordered)).toBe(before);
  });

  test("retry is byte-identical", () => {
    const first = replayWith();
    const second = replayWith();
    expect(second).toEqual(first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  test("independent verifier rejects terminal and stage tampering even after digest recomputation", () => {
    const canonical = replayWith();
    const changed = structuredClone(
      canonical,
    ) as CanonicalBindingBackedReplayResult;
    if (!changed.end_to_end_result) {
      throw new Error("action_666bd_missing_e2e_fixture");
    }
    changed.end_to_end_result.lineage.stage_inventory[0].stage_version =
      "tampered_stage_version" as never;
    changed.end_to_end_result.end_to_end_digest =
      canonicalBindingBackedReplayDigest({
        self_consistent_alternative_end_to_end: changed.end_to_end_result,
      });
    const replayPayload = structuredClone(changed);
    delete (
      replayPayload as Partial<CanonicalBindingBackedReplayResult>
    ).replay_digest;
    changed.replay_digest =
      canonicalBindingBackedReplayDigest(replayPayload);
    const verification =
      verifyCanonicalBindingBackedImprovementReplayResult({
        request: action666bdProposalReadyRequest,
        result: changed,
        harness: action666bdHarness(
          action666bdProposalReadyDependencies,
        ),
      });
    expect(verification).toMatchObject({
      valid: false,
      canonical_result: null,
      reason_codes: [
        "canonical_binding_backed_replay_result_tampered",
      ],
    });
  });

  test("independent verifier rejects self-consistently recomputed failure results", () => {
    const canonical = replayWith(
      action666bdAuthorityConflictDependencies(),
    );
    const changed = structuredClone(
      canonical,
    ) as CanonicalBindingBackedReplayResult;
    changed.reason_codes = ["caller_reclassified_authority_conflict"];
    const payload = structuredClone(changed);
    delete (
      payload as Partial<CanonicalBindingBackedReplayResult>
    ).replay_digest;
    changed.replay_digest = canonicalBindingBackedReplayDigest(payload);
    const verification =
      verifyCanonicalBindingBackedImprovementReplayResult({
        request: action666bdProposalReadyRequest,
        result: changed,
        harness: action666bdHarness(
          action666bdAuthorityConflictDependencies(),
        ),
      });
    expect(verification.valid).toBe(false);
    expect(verification.reason_codes).toEqual([
      "canonical_binding_backed_replay_result_tampered",
    ]);
  });

  test("binds immutable validator policy with generous golden-fixture margin", () => {
    expect(CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION).toBe(
      "canonical_bounded_snapshot_validator_v1",
    );
    expect(CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY).toEqual({
      policy_version:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_VERSION,
      max_depth: 128,
      max_nodes: 131_072,
      max_keys_per_container: 4_096,
      max_array_length: 2_048,
      max_string_bytes: 65_536,
      max_total_string_bytes: 8_388_608,
    });
    expect(CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(
      validateCanonicalBoundedSnapshotPayload(
        action666bdExternalSnapshot(),
      ),
    ).toMatchObject({
      status: "valid",
      observed_depth: 2,
      observed_nodes: 35,
    });
  });

  test("bounds raw JSON before parse and recognizes only module-created sources", () => {
    const originalParse = JSON.parse;
    let parseCalls = 0;
    let oversizedError: unknown;
    let oversizedParseCalls = -1;
    JSON.parse = ((...parameters: Parameters<typeof JSON.parse>) => {
      parseCalls += 1;
      return originalParse(...parameters);
    }) as typeof JSON.parse;
    try {
      try {
        createCanonicalBindingSnapshotJsonSource(
          " ".repeat(CANONICAL_EXTERNAL_SNAPSHOT_MAX_JSON_BYTES + 1),
        );
      } catch (error) {
        oversizedError = error;
      }
      oversizedParseCalls = parseCalls;
    } finally {
      JSON.parse = originalParse;
    }
    expect(oversizedError).toEqual(
      new Error("canonical_binding_snapshot_json_source_too_large"),
    );
    expect(oversizedParseCalls).toBe(0);

    const validSource = createCanonicalBindingSnapshotJsonSource(
      JSON.stringify(action666bdExternalSnapshot()),
    );
    expect(validSource).toEqual({
      source_contract_version:
        "canonical_external_binding_snapshot_source_v1",
    });
    expect(Object.isFrozen(validSource)).toBe(true);
    expect(action666bdHarness().status).toBe("ready");

    const unrecognizedDependencies = {
      ...action666bdProposalReadyDependencies,
      snapshot_dependency: {
        source_contract_version:
          "canonical_external_binding_snapshot_source_v1" as const,
      },
    };
    const unrecognizedHarness = action666bdHarness(
      unrecognizedDependencies,
    );
    expect(unrecognizedHarness).toMatchObject({
      status: "unavailable",
      replay: null,
    });
    expect(unrecognizedHarness.counters.snapshot_reads).toBe(0);

    const canonicalSnapshotJson = JSON.stringify(
      action666bdExternalSnapshot(),
    );
    const authorityRootProperty = `"authority_root_digest":"${
      action666bdExternalSnapshot().authority_root_digest
    }"`;
    const duplicateKeyJson = canonicalSnapshotJson.replace(
      authorityRootProperty,
      `"authority_root_digest":"${"e".repeat(64)}",${authorityRootProperty}`,
    );
    expect(() =>
      createCanonicalBindingSnapshotJsonSource(duplicateKeyJson),
    ).toThrow("canonical_binding_snapshot_json_source_noncanonical");
    for (const noncanonicalJson of [
      '{"nested":{"key":1,"key":2}}',
      '{"whitespace": 1}',
      '{"escape":"\\u0061"}',
    ]) {
      expect(() =>
        createCanonicalBindingSnapshotJsonSource(noncanonicalJson),
      ).toThrow("canonical_binding_snapshot_json_source_noncanonical");
    }

    const primordialProbeJson =
      '{"action_666cp_primordial_probe":1}';
    let substitutedParseCalls = 0;
    let getterReads = 0;
    JSON.parse = ((
      text: string,
      reviver?: Parameters<typeof JSON.parse>[1],
    ) => {
      if (text !== primordialProbeJson) {
        return originalParse(text, reviver);
      }
      substitutedParseCalls += 1;
      const substituted = {} as Record<string, unknown>;
      Object.defineProperty(substituted, "leak", {
        enumerable: true,
        get() {
          getterReads += 1;
          throw new Error("caller_getter_executed");
        },
      });
      return substituted;
    }) as typeof JSON.parse;
    let primordialSource;
    try {
      primordialSource = createCanonicalBindingSnapshotJsonSource(
        primordialProbeJson,
      );
    } finally {
      JSON.parse = originalParse;
    }
    expect(substitutedParseCalls).toBe(0);
    expect(getterReads).toBe(0);
    const primordialResult = replayWith({
      ...action666bdProposalReadyDependencies,
      snapshot_dependency: primordialSource,
    });
    expect(primordialResult.status).not.toBe("admitted");
    expect(getterReads).toBe(0);
  });

  test("captures clone, freeze, introspection, and digest primordials", () => {
    const originalFreeze = Object.freeze;
    const originalIsFrozen = Object.isFrozen;
    const originalEntries = Object.entries;
    const originalGetOwnPropertyDescriptor =
      Object.getOwnPropertyDescriptor;
    const originalGetPrototypeOf = Object.getPrototypeOf;
    const originalHasOwn = Object.hasOwn;
    const originalOwnKeys = Reflect.ownKeys;
    const originalArrayIsArray = Array.isArray;
    const originalArrayEvery = Array.prototype.every;
    const originalArrayFilter = Array.prototype.filter;
    const originalArrayMap = Array.prototype.map;
    const originalArraySome = Array.prototype.some;
    const originalArraySort = Array.prototype.sort;
    const originalWeakMapGet = WeakMap.prototype.get;
    const originalWeakMapHas = WeakMap.prototype.has;
    const originalWeakMapSet = WeakMap.prototype.set;
    const originalWeakSetAdd = WeakSet.prototype.add;
    const originalWeakSetDelete = WeakSet.prototype.delete;
    const originalWeakSetHas = WeakSet.prototype.has;
    const originalNodeIsProxy = nodeTypes.isProxy;
    const originalStructuredClone = structuredClone;
    const originalStringify = JSON.stringify;
    const sourceSnapshot = action666bdExternalSnapshot();
    const builderInput = {
      owner_authority_identity:
        sourceSnapshot.owner_authority_identity,
      registry_authority_identity:
        sourceSnapshot.registry_authority_identity,
      authority_manifest_digest:
        sourceSnapshot.authority_manifest_digest,
      authority_root_digest: sourceSnapshot.authority_root_digest,
      publication_sequence: sourceSnapshot.publication_sequence,
      publication_epoch: sourceSnapshot.publication_epoch,
      predecessor: sourceSnapshot.predecessor,
      captured_at: sourceSnapshot.captured_at,
      evidence_cutoff: sourceSnapshot.evidence_cutoff,
      effective_at: sourceSnapshot.effective_at,
      entry_inventory: sourceSnapshot.entry_inventory,
    };
    let getterReads = 0;
    let rebuiltSnapshot;
    let rebuiltAuthority;
    let disabledHarness;
    let poisonedHarness;
    let recognizedSource;
    let copiedSourceHarness;
    let proxyValidation;
    let digestDistinct = false;
    let proxyTrapReads = 0;
    const callerSnapshot = action666bdExternalSnapshot();
    const canonicalSnapshotJson = JSON.stringify(callerSnapshot);
    const copiedSource = Object.freeze({
      source_contract_version:
        "canonical_external_binding_snapshot_source_v1" as const,
    });
    const poisonedCaptureAuthority = {
      ...action666bdProposalReadyDependencies.capture_authority,
    };
    Object.defineProperty(
      poisonedCaptureAuthority,
      "authority_version",
      {
        enumerable: true,
        get() {
          getterReads += 1;
          return "poisoned_authority_version";
        },
      },
    );
    const poisonedDependencies = {
      ...action666bdProposalReadyDependencies,
      capture_authority: poisonedCaptureAuthority,
    };
    try {
      Object.freeze = ((value: object) => value) as typeof Object.freeze;
      Object.isFrozen = (() => false) as typeof Object.isFrozen;
      Object.entries = (() => {
        throw new Error("patched_entries");
      }) as typeof Object.entries;
      Object.getOwnPropertyDescriptor = (() => {
        throw new Error("patched_descriptor");
      }) as typeof Object.getOwnPropertyDescriptor;
      Object.getPrototypeOf = (() => {
        throw new Error("patched_prototype");
      }) as typeof Object.getPrototypeOf;
      Object.hasOwn = (() => false) as typeof Object.hasOwn;
      Reflect.ownKeys = (() => {
        throw new Error("patched_own_keys");
      }) as typeof Reflect.ownKeys;
      Array.isArray = (() => false) as unknown as typeof Array.isArray;
      Array.prototype.every = (() =>
        true) as unknown as typeof Array.prototype.every;
      Array.prototype.filter = (() =>
        []) as unknown as typeof Array.prototype.filter;
      Array.prototype.map = (() =>
        []) as unknown as typeof Array.prototype.map;
      Array.prototype.some = (() =>
        false) as unknown as typeof Array.prototype.some;
      Array.prototype.sort = (function (this: unknown[]) {
        return this;
      }) as unknown as typeof Array.prototype.sort;
      WeakMap.prototype.get = (() =>
        () => callerSnapshot) as unknown as typeof WeakMap.prototype.get;
      WeakMap.prototype.has = (() =>
        true) as unknown as typeof WeakMap.prototype.has;
      WeakMap.prototype.set = (() => {
        throw new Error("patched_weak_map_set");
      }) as unknown as typeof WeakMap.prototype.set;
      WeakSet.prototype.add = (() => {
        throw new Error("patched_weak_set_add");
      }) as unknown as typeof WeakSet.prototype.add;
      WeakSet.prototype.delete = (() => {
        throw new Error("patched_weak_set_delete");
      }) as unknown as typeof WeakSet.prototype.delete;
      WeakSet.prototype.has = (() =>
        true) as unknown as typeof WeakSet.prototype.has;
      (nodeTypes as { isProxy: typeof nodeTypes.isProxy }).isProxy =
        (() => false) as typeof nodeTypes.isProxy;
      globalThis.structuredClone = (() => {
        const injected: Record<string, unknown> = {};
        Object.defineProperty(injected, "leak", {
          enumerable: true,
          get() {
            getterReads += 1;
            throw new Error("injected_getter");
          },
        });
        return injected;
      }) as typeof structuredClone;
      JSON.stringify = (() => "constant") as typeof JSON.stringify;

      rebuiltSnapshot =
        createCanonicalExternalImprovementBindingSnapshot(builderInput);
      rebuiltAuthority =
        createCanonicalBindingSnapshotAdmissionAuthority({
          authority_identity: "authority:primordial-probe",
          owner_boundary_identity: "owner-boundary:primordial-probe",
          snapshot: rebuiltSnapshot,
        });
      disabledHarness =
        createCanonicalBindingBackedImprovementReplayHarness();
      poisonedHarness =
        createCanonicalBindingBackedImprovementReplayHarness({
          enabled: true,
          kill_switch_engaged: false,
          dependencies: poisonedDependencies,
        });
      recognizedSource = createCanonicalBindingSnapshotJsonSource(
        canonicalSnapshotJson,
      );
      copiedSourceHarness =
        createCanonicalBindingBackedImprovementReplayHarness({
          enabled: true,
          kill_switch_engaged: false,
          dependencies: {
            ...action666bdProposalReadyDependencies,
            snapshot_dependency: copiedSource,
          },
        });
      proxyValidation = validateCanonicalBoundedSnapshotPayload(
        new Proxy(
          { probe: true },
          {
            getPrototypeOf(target) {
              proxyTrapReads += 1;
              return originalGetPrototypeOf(target);
            },
          },
        ),
      );
      digestDistinct =
        canonicalBindingBackedReplayDigest({ probe: 1 }) !==
        canonicalBindingBackedReplayDigest({ probe: 2 });
    } finally {
      Object.freeze = originalFreeze;
      Object.isFrozen = originalIsFrozen;
      Object.entries = originalEntries;
      Object.getOwnPropertyDescriptor =
        originalGetOwnPropertyDescriptor;
      Object.getPrototypeOf = originalGetPrototypeOf;
      Object.hasOwn = originalHasOwn;
      Reflect.ownKeys = originalOwnKeys;
      Array.isArray = originalArrayIsArray;
      Array.prototype.every = originalArrayEvery;
      Array.prototype.filter = originalArrayFilter;
      Array.prototype.map = originalArrayMap;
      Array.prototype.some = originalArraySome;
      Array.prototype.sort = originalArraySort;
      WeakMap.prototype.get = originalWeakMapGet;
      WeakMap.prototype.has = originalWeakMapHas;
      WeakMap.prototype.set = originalWeakMapSet;
      WeakSet.prototype.add = originalWeakSetAdd;
      WeakSet.prototype.delete = originalWeakSetDelete;
      WeakSet.prototype.has = originalWeakSetHas;
      (nodeTypes as { isProxy: typeof nodeTypes.isProxy }).isProxy =
        originalNodeIsProxy;
      globalThis.structuredClone = originalStructuredClone;
      JSON.stringify = originalStringify;
    }
    const recognizedSourceHarness =
      createCanonicalBindingBackedImprovementReplayHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: {
          ...action666bdProposalReadyDependencies,
          snapshot_dependency: recognizedSource,
        },
      });
    expect(getterReads).toBe(0);
    expect(digestDistinct).toBe(true);
    expect(originalIsFrozen(rebuiltSnapshot)).toBe(true);
    expect(originalIsFrozen(rebuiltAuthority)).toBe(true);
    expect(originalIsFrozen(disabledHarness)).toBe(true);
    expect(originalIsFrozen(disabledHarness.counters)).toBe(true);
    expect(poisonedHarness).toMatchObject({
      enabled: true,
      status: "unavailable",
      replay: null,
    });
    expect(poisonedHarness.counters).toEqual(zeroCounters());
    expect(recognizedSourceHarness).toMatchObject({
      enabled: true,
      status: "ready",
    });
    expect(copiedSourceHarness).toMatchObject({
      enabled: true,
      status: "unavailable",
      replay: null,
    });
    expect(copiedSourceHarness.counters).toEqual(zeroCounters());
    expect(proxyTrapReads).toBe(0);
    expect(proxyValidation).toMatchObject({
      status: "invalid",
      reason_codes: ["snapshot_payload_proxy_forbidden:$"],
    });
    const implementationSource = fs.readFileSync(
      path.join(
        process.cwd(),
        "lib/server/canonical-governed-binding-snapshot-admission.ts",
      ),
      "utf8",
    );
    expect(implementationSource).not.toMatch(
      /\.(every|filter|includes|join|map|pop|push|some|sort)\s*\(/,
    );
    expect(implementationSource).not.toMatch(
      /\.(add|delete|get|has|set)\s*\(/,
    );
    expect(implementationSource).not.toContain("nodeTypes.isProxy(");
  });

  test("captures regex parsing, avoids live iterators, and orders Unicode bytes deterministically", () => {
    const validEntryInput = {
      entry_type: "previous_binding" as const,
      bound_identity_type: "proposal" as const,
      bound_identity: "proposal:primordial-order-probe",
      observed_binding_digest: "a".repeat(64),
      expected_binding_digest: "a".repeat(64),
      source_evidence_namespace:
        "canonical_previous_binding_evidence" as const,
      source_section_digest: "b".repeat(64),
      effective_at: action666bdCapturedAt,
    };
    const originalRegExpExec = RegExp.prototype.exec;
    RegExp.prototype.exec = (() => null) as typeof RegExp.prototype.exec;
    let validEntry;
    try {
      validEntry = createCanonicalExternalImprovementBindingEntry(
        validEntryInput,
      );
    } finally {
      RegExp.prototype.exec = originalRegExpExec;
    }
    expect(validEntry.entry_identity).toContain(
      validEntryInput.bound_identity,
    );

    const originalRegExpTest = RegExp.prototype.test;
    RegExp.prototype.test = (() => true) as typeof RegExp.prototype.test;
    let invalidShaAccepted = false;
    try {
      createCanonicalExternalImprovementBindingEntry({
        ...validEntryInput,
        observed_binding_digest: "x",
        expected_binding_digest: "x",
        source_section_digest: "x",
      });
      invalidShaAccepted = true;
    } catch {
      invalidShaAccepted = false;
    } finally {
      RegExp.prototype.test = originalRegExpTest;
    }
    expect(invalidShaAccepted).toBe(false);

    const source = action666bdExternalSnapshot();
    const duplicateEntry = structuredClone(source.entry_inventory[0]);
    const duplicateSnapshotInput = {
      owner_authority_identity: source.owner_authority_identity,
      registry_authority_identity: source.registry_authority_identity,
      authority_manifest_digest: source.authority_manifest_digest,
      authority_root_digest: source.authority_root_digest,
      publication_sequence: source.publication_sequence,
      publication_epoch: source.publication_epoch,
      predecessor: source.predecessor,
      captured_at: source.captured_at,
      evidence_cutoff: source.evidence_cutoff,
      effective_at: source.effective_at,
      entry_inventory: [duplicateEntry, structuredClone(duplicateEntry)],
    };
    const originalArrayIterator = Array.prototype[Symbol.iterator];
    Array.prototype[Symbol.iterator] = (function* (this: unknown[]) {
      if (this.length > 0) yield this[0];
    }) as unknown as typeof originalArrayIterator;
    let duplicateAccepted = false;
    try {
      createCanonicalExternalImprovementBindingSnapshot(
        duplicateSnapshotInput,
      );
      duplicateAccepted = true;
    } catch {
      duplicateAccepted = false;
    } finally {
      Array.prototype[Symbol.iterator] = originalArrayIterator;
    }
    expect(duplicateAccepted).toBe(false);

    const composed = "\u00e9";
    const decomposed = "e\u0301";
    const forward = { [composed]: 1, [decomposed]: 2 };
    const reverse = { [decomposed]: 2, [composed]: 1 };
    expect(canonicalBindingBackedReplayDigest(forward)).toBe(
      canonicalBindingBackedReplayDigest(reverse),
    );

    const implementationSource = fs.readFileSync(
      path.join(
        process.cwd(),
        "lib/server/canonical-governed-binding-snapshot-admission.ts",
      ),
      "utf8",
    );
    expect(implementationSource).not.toMatch(/\.(test|exec)\s*\(/);
    expect(implementationSource).not.toContain("localeCompare");
    expect(implementationSource).not.toMatch(
      /for\s*\(\s*const\s+[^)]*\s+of\s+/,
    );
    expect(implementationSource).not.toMatch(/\[\s*\.\.\./);
  });

  test("accepts exact depth and node budgets and rejects plus one deterministically", () => {
    const exactDepth = validateCanonicalBoundedSnapshotPayload(
      nestedObjectAtDepth(
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_depth,
      ),
    );
    const excessiveDepth = validateCanonicalBoundedSnapshotPayload(
      nestedObjectAtDepth(
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_depth + 1,
      ),
    );
    expect(exactDepth.status).toBe("valid");
    expect(excessiveDepth).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_depth",
      observed_depth:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_depth + 1,
      reason_codes: ["snapshot_validation_budget_exceeded"],
    });

    const exactNodes = validateCanonicalBoundedSnapshotPayload(
      valueWithExactNodeCount(
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_nodes,
      ),
    );
    const excessiveNodes = validateCanonicalBoundedSnapshotPayload(
      valueWithExactNodeCount(
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_nodes + 1,
      ),
    );
    expect(exactNodes).toMatchObject({
      status: "valid",
      observed_nodes:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_nodes,
    });
    expect(excessiveNodes).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_nodes",
      observed_nodes:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_nodes + 1,
    });
  });

  test("enforces key, array, string, and total UTF-8 budgets at exact boundaries", () => {
    const exactKeys = Object.fromEntries(
      Array.from(
        {
          length:
            CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_keys_per_container,
        },
        (_, index) => [`key_${index.toString().padStart(5, "0")}`, 0],
      ),
    );
    const excessiveKeys = {
      ...exactKeys,
      one_more_key: 0,
    };
    expect(
      validateCanonicalBoundedSnapshotPayload(exactKeys).status,
    ).toBe("valid");
    expect(
      validateCanonicalBoundedSnapshotPayload(excessiveKeys),
    ).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_keys",
      observed_own_keys:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_keys_per_container +
        1,
    });

    const hundredThousandKeys: Record<string, number> = {};
    for (let index = 0; index < 100_000; index += 1) {
      hundredThousandKeys[`attacker_key_${index}`] = index;
    }
    const originalObjectOwnKeys = Reflect.ownKeys;
    let oversizedObjectOwnKeyReads = 0;
    Reflect.ownKeys = ((target: object) => {
      if (target === hundredThousandKeys) {
        oversizedObjectOwnKeyReads += 1;
      }
      return originalObjectOwnKeys(target);
    }) as typeof Reflect.ownKeys;
    let hundredThousandKeysResult;
    try {
      hundredThousandKeysResult =
        validateCanonicalBoundedSnapshotPayload(
          hundredThousandKeys,
        );
    } finally {
      Reflect.ownKeys = originalObjectOwnKeys;
    }
    expect(oversizedObjectOwnKeyReads).toBe(0);
    expect(hundredThousandKeysResult).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_keys",
      observed_own_keys:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY
          .max_keys_per_container + 1,
    });

    const exactArray = Array.from(
      {
        length:
          CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_array_length,
      },
      () => 0,
    );
    const excessiveArray = Array.from(
      {
        length:
          CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_array_length + 1,
      },
      () => 0,
    );
    expect(
      validateCanonicalBoundedSnapshotPayload(exactArray).status,
    ).toBe("valid");
    expect(
      validateCanonicalBoundedSnapshotPayload(excessiveArray),
    ).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_array_length",
      observed_array_length:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_array_length + 1,
    });

    const firstOversizedSparseArray: unknown[] = [];
    firstOversizedSparseArray.length =
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_array_length + 1;
    const maximalSparseArray: unknown[] = [];
    maximalSparseArray.length = 0xffff_ffff;
    const originalOwnKeys = Reflect.ownKeys;
    let oversizedArrayOwnKeyReads = 0;
    Reflect.ownKeys = ((target: object) => {
      if (
        target === firstOversizedSparseArray ||
        target === maximalSparseArray
      ) {
        oversizedArrayOwnKeyReads += 1;
      }
      return originalOwnKeys(target);
    }) as typeof Reflect.ownKeys;
    let firstOversizedSparseResult;
    let maximalSparseResult;
    try {
      firstOversizedSparseResult =
        validateCanonicalBoundedSnapshotPayload(
          firstOversizedSparseArray,
        );
      maximalSparseResult = validateCanonicalBoundedSnapshotPayload(
        maximalSparseArray,
      );
    } finally {
      Reflect.ownKeys = originalOwnKeys;
    }
    expect(oversizedArrayOwnKeyReads).toBe(0);
    expect(firstOversizedSparseResult).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_array_length",
      observed_array_length:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_array_length + 1,
      observed_own_keys: 0,
    });
    expect(maximalSparseResult).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_array_length",
      observed_array_length: 0xffff_ffff,
      observed_own_keys: 0,
    });

    const exactString = "å".repeat(
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes / 2,
    );
    const excessiveString = `${exactString}å`;
    expect(
      validateCanonicalBoundedSnapshotPayload(exactString).status,
    ).toBe("valid");
    expect(
      validateCanonicalBoundedSnapshotPayload(excessiveString),
    ).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_string_bytes",
      observed_string_bytes:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes + 2,
    });

    const chunkCount =
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY
        .max_total_string_bytes /
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes;
    const arrayKeyBytes =
      Array.from({ length: chunkCount }, (_, index) =>
        Buffer.byteLength(String(index)),
      ).reduce((sum, bytes) => sum + bytes, Buffer.byteLength("length"));
    let remainingStringBytes =
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY
        .max_total_string_bytes - arrayKeyBytes;
    const chunks = Array.from({ length: chunkCount }, () => {
      const bytes = Math.min(
        remainingStringBytes,
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes,
      );
      remainingStringBytes -= bytes;
      return "x".repeat(bytes);
    });
    expect(remainingStringBytes).toBe(0);
    expect(
      validateCanonicalBoundedSnapshotPayload(chunks).status,
    ).toBe("valid");
    const excessiveTotal = validateCanonicalBoundedSnapshotPayload([
      ...chunks,
      "x",
    ]);
    expect(excessiveTotal).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_total_string_bytes",
    });
    expect(excessiveTotal.observed_total_string_bytes).toBeGreaterThan(
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_total_string_bytes,
    );

    const oversizedKey = {
      ["k".repeat(
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes + 1,
      )]: 0,
    };
    const oversizedKeyResult =
      validateCanonicalBoundedSnapshotPayload(oversizedKey);
    expect(oversizedKeyResult).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_string_bytes",
      observed_string_bytes:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes + 1,
    });
    if (oversizedKeyResult.status !== "budget_exceeded") {
      throw new Error("expected oversized key to exceed budget");
    }
    expect(oversizedKeyResult.first_rejected_path.length).toBeLessThan(
      128,
    );

    const hugeString = "x".repeat(
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes * 256,
    );
    const hugeStringResult =
      validateCanonicalBoundedSnapshotPayload(hugeString);
    expect(hugeStringResult).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_string_bytes",
      observed_string_bytes:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes + 1,
    });
    const hugeKeyResult = validateCanonicalBoundedSnapshotPayload({
      [hugeString]: 0,
    });
    expect(hugeKeyResult).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_string_bytes",
      observed_string_bytes:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes + 1,
    });
    if (hugeKeyResult.status !== "budget_exceeded") {
      throw new Error("expected huge key to exceed budget");
    }
    expect(hugeKeyResult.first_rejected_path.length).toBeLessThan(128);
    const oversizedOrderKey = "o".repeat(
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes + 1,
    );
    const hugeKeyForward = validateCanonicalBoundedSnapshotPayload({
      ordinary: 0,
      [oversizedOrderKey]: 0,
    });
    const hugeKeyReverse = validateCanonicalBoundedSnapshotPayload({
      [oversizedOrderKey]: 0,
      ordinary: 0,
    });
    expect(hugeKeyReverse).toEqual(hugeKeyForward);

    const hugeCommonPrefix = "p".repeat(2_000_001);
    const firstHugeKey = `${hugeCommonPrefix}a`;
    const secondHugeKey = `${hugeCommonPrefix}b`;
    const originalLocaleCompare = String.prototype.localeCompare;
    let localeComparisons = 0;
    String.prototype.localeCompare = function (
      that: string,
      locales?: Intl.LocalesArgument,
      options?: Intl.CollatorOptions,
    ) {
      localeComparisons += 1;
      return originalLocaleCompare.call(this, that, locales, options);
    };
    let hugeCommonPrefixResult;
    try {
      hugeCommonPrefixResult =
        validateCanonicalBoundedSnapshotPayload({
          [firstHugeKey]: 0,
          [secondHugeKey]: 0,
        });
    } finally {
      String.prototype.localeCompare = originalLocaleCompare;
    }
    expect(localeComparisons).toBe(0);
    expect(hugeCommonPrefixResult).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_string_bytes",
      observed_string_bytes:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes + 1,
    });

    const excessiveTotalKeyBytes: Record<string, number> = {};
    const allowedKeyPrefix = "t".repeat(
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes - 64,
    );
    for (let index = 0; index < 130; index += 1) {
      excessiveTotalKeyBytes[`${allowedKeyPrefix}_${index}`] = index;
    }
    let totalKeyLocaleComparisons = 0;
    String.prototype.localeCompare = function (
      that: string,
      locales?: Intl.LocalesArgument,
      options?: Intl.CollatorOptions,
    ) {
      totalKeyLocaleComparisons += 1;
      return originalLocaleCompare.call(this, that, locales, options);
    };
    let excessiveTotalKeyBytesResult;
    try {
      excessiveTotalKeyBytesResult =
        validateCanonicalBoundedSnapshotPayload(
          excessiveTotalKeyBytes,
        );
    } finally {
      String.prototype.localeCompare = originalLocaleCompare;
    }
    expect(totalKeyLocaleComparisons).toBe(0);
    expect(excessiveTotalKeyBytesResult).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_total_string_bytes",
    });
    const reversedTotalKeyBytes = Object.fromEntries(
      Object.entries(excessiveTotalKeyBytes).reverse(),
    );
    expect(
      validateCanonicalBoundedSnapshotPayload(reversedTotalKeyBytes),
    ).toEqual(excessiveTotalKeyBytesResult);

    const hugeAndTotalForward = {
      [oversizedOrderKey]: 0,
      ...excessiveTotalKeyBytes,
    };
    const hugeAndTotalReverse = Object.fromEntries(
      Object.entries(hugeAndTotalForward).reverse(),
    );
    const hugeAndTotalResult =
      validateCanonicalBoundedSnapshotPayload(hugeAndTotalForward);
    expect(hugeAndTotalResult).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_string_bytes",
      observed_own_keys: 0,
      observed_string_bytes:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_string_bytes + 1,
    });
    expect(
      validateCanonicalBoundedSnapshotPayload(hugeAndTotalReverse),
    ).toEqual(hugeAndTotalResult);

    const allKeyLimitsEntries = Object.entries(excessiveTotalKeyBytes);
    for (
      let index = allKeyLimitsEntries.length;
      index <
      CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_keys_per_container;
      index += 1
    ) {
      allKeyLimitsEntries.push([`bounded_filler_${index}`, index]);
    }
    const allKeyLimitsForward = Object.fromEntries([
      [oversizedOrderKey, 0],
      ...allKeyLimitsEntries,
    ]);
    const allKeyLimitsReverse = Object.fromEntries(
      Object.entries(allKeyLimitsForward).reverse(),
    );
    const allKeyLimitsResult =
      validateCanonicalBoundedSnapshotPayload(allKeyLimitsForward);
    expect(allKeyLimitsResult).toMatchObject({
      status: "budget_exceeded",
      budget_kind: "max_keys",
      observed_own_keys:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_keys_per_container + 1,
      observed_string_bytes: null,
    });
    expect(
      validateCanonicalBoundedSnapshotPayload(allKeyLimitsReverse),
    ).toEqual(allKeyLimitsResult);
  });

  test("returns a rebuildable bounded failure for twenty-thousand-level input", () => {
    const { dependencies, result } = replayWithValidationProbe(
      nestedObjectAtDepth(20_000),
    );
    expect(result.status).toBe("unmappable");
    expect(result.reason_codes).toEqual([
      "snapshot_validation_budget_exceeded",
    ]);
    expect(result.admission_result.validation_failure).toMatchObject({
      validator_version: CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
      budget_policy_version:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_VERSION,
      budget_policy_digest:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
      reason: "snapshot_validation_budget_exceeded",
      budget_kind: "max_depth",
      observed_depth:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY.max_depth + 1,
      full_snapshot_digest_computed: false,
      full_snapshot_digest: null,
      bounded_observation_digest_algorithm:
        "sha256_canonical_json_v1",
    });
    expect(
      result.admission_result.validation_failure
        ?.first_rejected_path,
    ).toMatch(/^\$\.validation_probe/);
    expect(
      Object.keys(
        result.admission_result.validation_failure ?? {},
      ).sort(),
    ).toEqual([
      "bounded_observation_digest",
      "bounded_observation_digest_algorithm",
      "budget_kind",
      "budget_policy_digest",
      "budget_policy_version",
      "first_rejected_path",
      "full_snapshot_digest",
      "full_snapshot_digest_computed",
      "observed_array_length",
      "observed_depth",
      "observed_nodes",
      "observed_own_keys",
      "observed_string_bytes",
      "observed_total_string_bytes",
      "reason",
      "validator_version",
    ]);
    expect(
      result.admission_result.validation_failure
        ?.bounded_observation_digest,
    ).toBe(result.admission_result.observed_snapshot_digest);
    expect(
      verifyCanonicalBindingBackedImprovementReplayResult({
        request: action666bdProposalReadyRequest,
        result,
        harness: action666bdHarness(dependencies),
      }),
    ).toMatchObject({
      valid: true,
      reason_codes: [],
    });
  });

  test("fails closed for cycles, accessors, throwing proxies, prototypes, symbols, and unsupported values", () => {
    const cycle: Record<string, unknown> = {};
    cycle.self = cycle;
    let getterReads = 0;
    const accessor: Record<string, unknown> = {};
    Object.defineProperty(accessor, "secret", {
      enumerable: true,
      get() {
        getterReads += 1;
        throw new Error("sensitive_getter_message");
      },
    });
    const undefinedAccessor: Record<string, unknown> = {};
    Object.defineProperty(undefinedAccessor, "unreadable", {
      enumerable: true,
      get: undefined,
      set: undefined,
    });
    const proxy = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("sensitive_proxy_message");
        },
      },
    );
    const prototype = Object.create({ caller_trusted: true });
    const symbol = { safe: true } as Record<PropertyKey, unknown>;
    symbol[Symbol("secret")] = true;
    const cases = [
      {
        input: cycle,
        reason: "snapshot_payload_cycle:",
      },
      {
        input: accessor,
        reason: "snapshot_payload_accessor_forbidden:",
      },
      {
        input: undefinedAccessor,
        reason: "snapshot_payload_accessor_forbidden:",
      },
      {
        input: proxy,
        reason: "snapshot_payload_proxy_forbidden:",
      },
      {
        input: prototype,
        reason: "snapshot_payload_prototype_forbidden:",
      },
      {
        input: symbol,
        reason: "snapshot_payload_symbol_key_forbidden:",
      },
      {
        input: { unsupported: BigInt(1) },
        reason: "snapshot_payload_value_unsupported",
      },
    ];
    for (const scenario of cases) {
      let result:
        | ReturnType<typeof validateCanonicalBoundedSnapshotPayload>
        | undefined;
      expect(() => {
        result = validateCanonicalBoundedSnapshotPayload(
          scenario.input,
        );
      }).not.toThrow();
      expect(result?.status).toBe("invalid");
      expect(result?.reason_codes.join(" ")).toContain(
        scenario.reason,
      );
      expect(result?.reason_codes.join(" ")).not.toMatch(
        /sensitive_(getter|proxy)_message/,
      );
    }
    expect(getterReads).toBe(0);
  });

  test("rejects self-consistent budget failure, policy, path, and counter tampering", () => {
    const { dependencies, result } = replayWithValidationProbe(
      nestedObjectAtDepth(20_000),
    );
    const mutations: ((
      changed: CanonicalBindingBackedReplayResult,
    ) => void)[] = [
      (changed) => {
        changed.admission_result.snapshot_budget_policy_digest =
          "a".repeat(64);
        if (!changed.admission_result.validation_failure) return;
        changed.admission_result.validation_failure.budget_policy_digest =
          "a".repeat(64);
        changed.admission_result.validation_failure
          .bounded_observation_digest =
          canonicalBindingBackedReplayDigest({
            caller_recomputed_budget_policy_failure: true,
          });
        changed.admission_result.observed_snapshot_digest =
          changed.admission_result.validation_failure
            .bounded_observation_digest;
      },
      (changed) => {
        if (!changed.admission_result.validation_failure) return;
        changed.admission_result.validation_failure.first_rejected_path =
          "$.caller_rewritten_path";
        changed.admission_result.validation_failure
          .bounded_observation_digest =
          canonicalBindingBackedReplayDigest({
            caller_recomputed_alternative_failure: true,
          });
        changed.admission_result.observed_snapshot_digest =
          changed.admission_result.validation_failure
            .bounded_observation_digest;
      },
      (changed) => {
        if (!changed.admission_result.validation_failure) return;
        changed.admission_result.validation_failure.observed_nodes += 1;
        changed.admission_result.validation_failure
          .bounded_observation_digest =
          canonicalBindingBackedReplayDigest({
            caller_recomputed_counter_failure: true,
          });
        changed.admission_result.observed_snapshot_digest =
          changed.admission_result.validation_failure
            .bounded_observation_digest;
      },
    ];
    for (const mutate of mutations) {
      const changed = structuredClone(result);
      mutate(changed);
      const selfConsistent = recomputeTamperedFailure(changed);
      const verification =
        verifyCanonicalBindingBackedImprovementReplayResult({
          request: action666bdProposalReadyRequest,
          result: selfConsistent,
          harness: action666bdHarness(dependencies),
        });
      expect(verification.valid).toBe(false);
      expect(verification.reason_codes).toEqual([
        "canonical_binding_backed_replay_result_tampered",
      ]);
    }
  });

  test("default-off and kill switch perform true zero work", () => {
    expect(DEFAULT_OFF_BINDING_SNAPSHOT_ADMISSION_ENABLED).toBe(false);
    expect(
      DEFAULT_OFF_BINDING_SNAPSHOT_ADMISSION_KILL_SWITCH_ENGAGED,
    ).toBe(true);
    const disabledValues: unknown[] = [
      undefined,
      null,
      false,
      0,
      1,
      "true",
      {},
    ];
    const engagedValues: unknown[] = [
      undefined,
      null,
      true,
      0,
      1,
      "false",
      {},
    ];
    const scenarios = [
      ...disabledValues.map((enabled) => ({
        enabled,
        kill_switch_engaged: false,
      })),
      ...engagedValues.map((kill_switch_engaged) => ({
        enabled: true,
        kill_switch_engaged,
      })),
    ];
    for (const options of scenarios) {
      const counters = zeroCounters();
      let dependencyReads = 0;
      const input = {
        ...options,
        counters,
        get dependencies(): never {
          dependencyReads += 1;
          throw new Error("disabled_harness_must_not_read_dependencies");
        },
      };
      const harness =
        createCanonicalBindingBackedImprovementReplayHarness(
          input as Parameters<
            typeof createCanonicalBindingBackedImprovementReplayHarness
          >[0],
        );
      expect(harness.replay).toBeNull();
      expect(dependencyReads).toBe(0);
      expect(counters).toEqual(zeroCounters());
    }
  });

  test("rejects active shell drift without trusting caller counters", () => {
    const counters = zeroCounters();
    const dependencies = action666bdProposalReadyDependencies;
    const valid = createCanonicalBindingBackedImprovementReplayHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies,
      counters,
    });
    expect(valid.status).toBe("ready");
    expect(valid.replay?.(action666bdProposalReadyRequest).status).toBe(
      "admitted",
    );
    expect(counters).toEqual(zeroCounters());
    expect(valid.counters.request_reads).toBeGreaterThan(0);

    const invalidInputs: unknown[] = [
      {
        enabled: true,
        kill_switch_engaged: false,
        dependencies,
        unexpected: true,
      },
      {
        enabled: true,
        kill_switch_engaged: false,
        dependencies: new Proxy(dependencies, {}),
      },
      {
        enabled: true,
        kill_switch_engaged: false,
        dependencies,
        counters: { ...zeroCounters(), unexpected: 0 },
      },
    ];
    for (const input of invalidInputs) {
      const harness =
        createCanonicalBindingBackedImprovementReplayHarness(
          input as Parameters<
            typeof createCanonicalBindingBackedImprovementReplayHarness
          >[0],
        );
      expect(harness).toMatchObject({
        enabled: true,
        status: "unavailable",
        replay: null,
      });
      expect(harness.counters).toEqual(zeroCounters());
    }
  });

  test("rejects a rehashed but unrecognized capture authority before owner reads", () => {
    const source = action666bdProposalReadyDependencies;
    const captureAuthority = structuredClone(source.capture_authority);
    captureAuthority.authority_identity = "authority:substituted-capture";
    const capturePayload = structuredClone(captureAuthority);
    delete (
      capturePayload as Partial<typeof capturePayload>
    ).authority_digest;
    captureAuthority.authority_digest =
      canonicalBindingBackedReplayDigest(capturePayload);
    let authorityReads = 0;
    const harness =
      createCanonicalBindingBackedImprovementReplayHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: {
          ...source,
          authority_dependency: {
            ...source.authority_dependency,
            read_expected_authority: () => {
              authorityReads += 1;
              return source.authority_dependency.read_expected_authority();
            },
          },
          snapshot_dependency: source.snapshot_dependency,
          capture_authority: captureAuthority,
          expected_capture_authority_identity:
            captureAuthority.authority_identity,
          expected_capture_authority_digest:
            captureAuthority.authority_digest,
        },
      });
    expect(harness).toMatchObject({
      enabled: true,
      status: "unavailable",
      replay: null,
    });
    expect(authorityReads).toBe(0);
    expect(harness.counters).toEqual(zeroCounters());
  });

  test("golden report is deterministic synthetic and not publishable", () => {
    const scenarios = action666bdGoldenScenarios.map((scenario) => {
      const result = action666bdReplay(
        scenario.request,
        scenario.dependencies,
      );
      return {
        name: scenario.name,
        status: result.status,
        proposal_status: result.proposal_status,
        snapshot_digest:
          result.admission_result.observed_snapshot_digest,
        admission_digest: result.admission_result.admission_digest,
        end_to_end_digest:
          result.end_to_end_result?.end_to_end_digest ?? null,
        replay_digest: result.replay_digest,
      };
    });
    const actual = {
      report_version:
        "action_666bd_golden_binding_backed_replay_report_v1",
      contract_version:
        CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_ADMISSION_VERSION,
      replay_version:
        CANONICAL_BINDING_BACKED_IMPROVEMENT_REPLAY_VERSION,
      validator_version:
        CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
      budget_policy_version:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_VERSION,
      budget_policy_digest:
        CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
      budget_policy: CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY,
      evidence_classification: "synthetic_fixture_only",
      performance_claimed: false,
      scenarios,
      safety: {
        synthetic_evidence: true,
        not_publishable: true,
        live_impact: false,
        automatic_training_allowed: false,
        automatic_model_change_allowed: false,
        automatic_promotion_allowed: false,
        external_ai_canonical_truth_authority: false,
      },
    };
    if (process.env.ACTION_666BD_PRINT_GOLDEN === "1") {
      console.log(
        `ACTION_666BD_GOLDEN=${JSON.stringify(actual)}`,
      );
    }
    expect(goldenReport).toEqual(actual);
  });

  test("foundation is server-only and absent from live consumers and write surfaces", () => {
    const root = process.cwd();
    const implementation =
      "lib/server/canonical-governed-binding-snapshot-admission.ts";
    const source = fs.readFileSync(
      path.join(root, implementation),
      "utf8",
    );
    expect(source).toContain('import "server-only";');
    expect(source).not.toContain("TextEncoder");
    expect(source).not.toMatch(
      /\.(insert|update|upsert)\s*\(|\b(writeFile|appendFile|fetch)\s*\(/,
    );
    expect(source).not.toMatch(
      /\b(supabase|postgres|database_url|provider_request)\b/i,
    );
    const importingLiveFiles: string[] = [];
    for (const liveRoot of ["app", "components", "pages"]) {
      const absolute = path.join(root, liveRoot);
      if (!fs.existsSync(absolute)) continue;
      const pending = [absolute];
      while (pending.length > 0) {
        const current = pending.pop()!;
        for (const entry of fs.readdirSync(current, {
          withFileTypes: true,
        })) {
          const nested = path.join(current, entry.name);
          if (entry.isDirectory()) pending.push(nested);
          else if (
            /\.[cm]?[jt]sx?$/.test(entry.name) &&
            fs
              .readFileSync(nested, "utf8")
              .includes("canonical-governed-binding-snapshot-admission")
          ) {
            importingLiveFiles.push(path.relative(root, nested));
          }
        }
      }
    }
    expect(importingLiveFiles).toEqual([]);
  });

  test("fixture capture instant and lookup instant remain point-in-time ordered", () => {
    expect(action666bdCapturedAt < action666bdLookupAsOf).toBe(true);
    expect(
      action666bdProposalReadyDependencies.authority_dependency
        .owner_boundary_version,
    ).toBe(CANONICAL_BINDING_SNAPSHOT_OWNER_BOUNDARY_VERSION);
  });
});
