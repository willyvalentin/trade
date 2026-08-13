import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import goldenReport from "@/docs/action-666bd-golden-binding-backed-replay-report.json";
import {
  action666bdAuthority,
  action666bdAuthorityConflictDependencies,
  action666bdCallerAuthorityRequest,
  action666bdCapturedAt,
  action666bdCrossTypeCollisionDependencies,
  action666bdDependencies,
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
  CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_ADMISSION_VERSION,
  DEFAULT_OFF_BINDING_SNAPSHOT_ADMISSION_ENABLED,
  DEFAULT_OFF_BINDING_SNAPSHOT_ADMISSION_KILL_SWITCH_ENGAGED,
  canonicalBindingBackedReplayDigest,
  createCanonicalBindingBackedImprovementReplayHarness,
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
  const snapshot = {
    ...structuredClone(source),
    validation_probe: probe,
  };
  const dependencies = action666bdDependencies(
    undefined,
    snapshot,
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

  test("rejects getter/prototype payloads without invoking the getter", () => {
    const result = replayWith(action666bdGetterSnapshotDependencies());
    expect(result.status).toBe("unmappable");
    expect(result.reason_codes.join(" ")).toContain(
      "snapshot_payload_accessor_forbidden",
    );

    const source = action666bdExternalSnapshot();
    const customPrototype = structuredClone(source);
    Object.setPrototypeOf(customPrototype, {
      caller_claimed_trusted_snapshot: true,
    });
    const prototypeResult = replayWith(
      action666bdDependencies(
        undefined,
        customPrototype,
        action666bdAuthority(source),
      ),
    );
    expect(prototypeResult.status).toBe("unmappable");
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

  test("authority is read exactly once and post-callback mutation cannot change admitted bytes", () => {
    const snapshot = structuredClone(action666bdExternalSnapshot());
    const authority = action666bdAuthority(snapshot);
    let authorityReads = 0;
    let snapshotReads = 0;
    const dependencies = action666bdDependencies(
      undefined,
      snapshot,
      authority,
    );
    dependencies.authority_dependency.read_expected_authority = () => {
      authorityReads += 1;
      return authority;
    };
    dependencies.snapshot_dependency.read_snapshot = () => {
      snapshotReads += 1;
      return snapshot;
    };
    const result = replayWith(dependencies);
    const before = JSON.stringify(result);
    snapshot.snapshot_identity = "external-binding-snapshot:mutated:9:9";
    expect(authorityReads).toBe(1);
    expect(snapshotReads).toBe(1);
    expect(JSON.stringify(result)).toBe(before);
    expect(result.status).toBe("admitted");
  });

  test("snapshot mutation after authority read fails closed", () => {
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
    expect(result.status).toBe("conflicting");
    expect(result.reason_codes).toContain(
      "binding_admission_authority_snapshot_conflict",
    );
    expect(result.reason_codes).toContain(
      "binding_admission_snapshot_digest_mismatch",
    );
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
        action666bdProposalReadyDependencies.snapshot_dependency.read_snapshot(),
      ),
    ).toMatchObject({
      status: "valid",
      observed_depth: 2,
      observed_nodes: 35,
    });
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
    let snapshotReads = 0;
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
          snapshot_dependency: {
            ...source.snapshot_dependency,
            read_snapshot: () => {
              snapshotReads += 1;
              return source.snapshot_dependency.read_snapshot();
            },
          },
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
    expect(snapshotReads).toBe(0);
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
