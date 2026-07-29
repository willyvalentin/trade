import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import goldenReport from "@/docs/action-666ax-golden-improvement-binding-store-report.json";
import {
  action666axAdapters,
  action666axCaptureCollisionSnapshot,
  action666axCapturedWithStore,
  action666axCrossTypeCollisionSnapshot,
  action666axDuplicateSnapshot,
  action666axEmptySnapshot,
  action666axFutureSnapshot,
  action666axGoldenLookupScenarios,
  action666axLookupAsOf,
  action666axMappedWithStore,
  action666axMatchingCaptureSnapshot,
  action666axOwnerDependency,
  action666axPreviousBindingSnapshot,
  action666axPreviousCollisionSnapshot,
  action666axPreviousOwnerDependency,
  action666axReplayWithStore,
  action666axRollbackPair,
  action666axStore,
  action666axTrustRootSubstitution,
} from "@/lib/server/canonical-improvement-binding-store-fixtures";
import {
  CANONICAL_IMPROVEMENT_BINDING_ENTRY_TYPES,
  CANONICAL_IMPROVEMENT_BINDING_LOOKUP_STATUSES,
  CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION,
  CANONICAL_IMPROVEMENT_BINDING_STORE_VERSION,
  DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_ENABLED,
  DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_KILL_SWITCH_ENGAGED,
  createCanonicalImprovementBindingStoreHarness,
  type CanonicalImprovementBindingStoreCounters,
} from "@/lib/server/canonical-improvement-binding-store";
import {
  action666vStableImprovementFixture,
} from "@/lib/server/canonical-model-improvement-proposal-fixtures";

function zeroCounters(): CanonicalImprovementBindingStoreCounters {
  return {
    request_reads: 0,
    snapshot_reads: 0,
    clones: 0,
    authority_lookups: 0,
    entry_lookups: 0,
    digest_operations: 0,
    downstream_aj_ac_aq_executions: 0,
  };
}

function proposalIdentity() {
  return action666vStableImprovementFixture.post.payload
    .proposal_candidates[0].proposal_identity;
}

test.describe("Action 666AX frozen improvement binding snapshot and read-only store", () => {
  test("freezes exact contract taxonomies and immutable snapshot bytes", () => {
    expect(CANONICAL_IMPROVEMENT_BINDING_ENTRY_TYPES).toEqual([
      "previous_binding",
      "capture_binding",
    ]);
    expect(CANONICAL_IMPROVEMENT_BINDING_LOOKUP_STATUSES).toEqual([
      "found",
      "absent",
      "conflicting",
      "not_effective",
      "invalid_snapshot",
    ]);
    expect(action666axEmptySnapshot.snapshot_version).toBe(
      CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION,
    );
    expect(Object.isFrozen(action666axEmptySnapshot)).toBe(true);
    expect(Object.isFrozen(action666axEmptySnapshot.entry_inventory)).toBe(
      true,
    );
  });

  test("returns deterministic absent and found results bound to snapshot and entry", () => {
    const absent = action666axStore().lookup_capture_binding({
      capture_identity: "capture:first",
      as_of: action666axLookupAsOf,
    });
    expect(absent).toMatchObject({
      status: "absent",
      snapshot_identity: action666axEmptySnapshot.snapshot_identity,
      snapshot_digest: action666axEmptySnapshot.snapshot_digest,
      entry_identity: null,
      observed_binding_digest: null,
    });
    const found = action666axStore(
      action666axPreviousOwnerDependency,
    ).lookup_previous_binding({
      binding_identity_type: "proposal",
      binding_identity: proposalIdentity(),
      as_of: action666axLookupAsOf,
    });
    expect(found).toMatchObject({
      status: "found",
      snapshot_identity:
        action666axPreviousBindingSnapshot.snapshot_identity,
      snapshot_digest:
        action666axPreviousBindingSnapshot.snapshot_digest,
      observed_binding_digest:
        action666vStableImprovementFixture.post.payload
          .proposal_candidates[0].semantic_digest,
      reason_codes: [],
    });
    expect(found.entry_identity).not.toBeNull();
    expect(found.entry_digest).toMatch(/^[a-f0-9]{64}$/);
  });

  test("canonicalizes offset-equivalent as-of instants identically", () => {
    const store = action666axStore();
    const utc = store.lookup_capture_binding({
      capture_identity: "capture:offset-parity",
      as_of: "2026-07-28T12:00:00.123456789Z",
    });
    const offset = store.lookup_capture_binding({
      capture_identity: "capture:offset-parity",
      as_of: "2026-07-28T14:00:00.123456789+02:00",
    });
    expect(offset).toEqual(utc);
    expect(offset.as_of).toBe("2026-07-28T12:00:00.123456789Z");
  });

  test("fails closed for naive, malformed, and future visibility", () => {
    const naive = action666axStore().lookup_capture_binding({
      capture_identity: "capture:naive",
      as_of: "2026-07-28T12:00:00",
    });
    expect(naive).toMatchObject({
      status: "not_effective",
      reason_codes: ["lookup_as_of_not_explicit_instant"],
    });
    const future = action666axStore(
      action666axOwnerDependency(action666axFutureSnapshot()),
    ).lookup_capture_binding({
      capture_identity: "capture:future",
      as_of: action666axLookupAsOf,
    });
    expect(future).toMatchObject({
      status: "not_effective",
      reason_codes: ["snapshot_not_effective_at_lookup"],
    });
  });

  test("rejects external-root substitution and rollback against a newer epoch", () => {
    const substituted = action666axStore(
      action666axTrustRootSubstitution(),
    ).lookup_capture_binding({
      capture_identity: "capture:substituted",
      as_of: action666axLookupAsOf,
    });
    expect(substituted.status).toBe("invalid_snapshot");
    expect(substituted.reason_codes).toContain(
      "snapshot_authority_binding_mismatch",
    );
    expect(substituted.reason_codes).toContain(
      "snapshot_external_trust_root_mismatch",
    );
    expect(substituted.snapshot_identity).not.toBeNull();
    expect(substituted.authority_identity).not.toBeNull();
    expect(substituted.authority_digest).toMatch(/^[a-f0-9]{64}$/);
    expect(substituted.expected_external_trust_root).toMatch(
      /^[a-f0-9]{64}$/,
    );

    const rollback = action666axStore(
      action666axRollbackPair().rollback_dependency,
    ).lookup_capture_binding({
      capture_identity: "capture:rollback",
      as_of: action666axLookupAsOf,
    });
    expect(rollback).toMatchObject({
      status: "invalid_snapshot",
    });
    expect(rollback.reason_codes).toContain(
      "snapshot_authority_binding_mismatch",
    );
  });

  test("rejects duplicate keys and cross-type identity collisions", () => {
    const duplicate = action666axStore(
      action666axDuplicateSnapshot(),
    ).lookup_previous_binding({
      binding_identity_type: "proposal",
      binding_identity: proposalIdentity(),
      as_of: action666axLookupAsOf,
    });
    expect(duplicate.status).toBe("invalid_snapshot");
    expect(duplicate.reason_codes).toEqual(
      expect.arrayContaining([
        "snapshot_entry_identity_duplicate",
        "snapshot_lookup_key_duplicate",
      ]),
    );
    const crossType = action666axStore(
      action666axCrossTypeCollisionSnapshot(),
    ).lookup_previous_binding({
      binding_identity_type: "proposal",
      binding_identity: proposalIdentity(),
      as_of: action666axLookupAsOf,
    });
    expect(crossType).toMatchObject({ status: "invalid_snapshot" });
    expect(crossType.reason_codes).toContain(
      "snapshot_cross_type_identity_collision",
    );
  });

  test("rejects unknown entry type and caller authority fields through closed schemas", () => {
    const changed = structuredClone(action666axPreviousBindingSnapshot);
    (
      changed.entry_inventory[0] as unknown as Record<string, unknown>
    ).entry_type = "unknown_binding";
    const invalid = action666axStore(
      action666axOwnerDependency(changed),
    ).lookup_previous_binding({
      binding_identity_type: "proposal",
      binding_identity: proposalIdentity(),
      as_of: action666axLookupAsOf,
    });
    expect(invalid.status).toBe("invalid_snapshot");
    expect(invalid.reason_codes).toContain("snapshot_entry_type_unknown");

    const callerAuthority = action666axStore().lookup_capture_binding({
      capture_identity: "capture:caller-authority",
      as_of: action666axLookupAsOf,
      expected_snapshot_root: "a".repeat(64),
      owner_approval: true,
    } as never);
    expect(callerAuthority).toMatchObject({
      status: "conflicting",
      reason_codes: ["lookup_request_schema_invalid"],
    });
  });

  test("AJ captures with absent, matching previous, and matching capture bindings", () => {
    expect(action666axCapturedWithStore()).toMatchObject({
      status: "captured",
      reason_codes: [],
    });
    expect(
      action666axCapturedWithStore(
        action666axPreviousOwnerDependency,
      ),
    ).toMatchObject({
      status: "captured",
      reason_codes: [],
    });
    const matchingCapture = action666axMatchingCaptureSnapshot();
    expect(
      action666axCapturedWithStore(
        action666axOwnerDependency(matchingCapture),
      ),
    ).toMatchObject({
      status: "captured",
      reason_codes: [],
    });
  });

  test("AJ distinguishes previous-binding and capture-binding collisions", () => {
    const previous = action666axCapturedWithStore(
      action666axOwnerDependency(
        action666axPreviousCollisionSnapshot(),
      ),
    );
    expect(previous.status).toBe("conflicting");
    expect(previous.reason_codes).toContain(
      "previous_binding_semantic_collision",
    );
    const capture = action666axCapturedWithStore(
      action666axOwnerDependency(
        action666axCaptureCollisionSnapshot(),
      ),
    );
    expect(capture.status).toBe("conflicting");
    expect(capture.reason_codes).toContain(
      "capture_identity_semantic_collision",
    );
  });

  test("AC maps and AQ replays deterministically through exact lookup adapters", () => {
    expect(action666axMappedWithStore()).toMatchObject({
      status: "mapped",
      reason_codes: [],
    });
    const first = action666axReplayWithStore();
    const second = action666axReplayWithStore();
    expect(first).toMatchObject({
      status: "completed",
      proposal_status: "proposal_ready",
      live_ranking_effect: false,
      automatic_promotion_allowed: false,
      external_ai_canonical_truth_authority: false,
    });
    expect(second).toEqual(first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  test("lookup adapters expose no write, append, rotate, approve, or persistence surface", () => {
    const store = action666axStore();
    expect(Object.keys(store).sort()).toEqual(
      [
        "automatic_change_allowed",
        "automatic_promotion_allowed",
        "automatic_training_allowed",
        "authority_digest",
        "authority_identity",
        "expected_external_trust_root",
        "external_ai_canonical_truth_authority",
        "live_ranking_effect",
        "lookup_capture_binding",
        "lookup_previous_binding",
        "not_publishable",
        "owner_boundary_identity",
        "shadow_only",
        "snapshot_digest",
        "snapshot_identity",
        "store_version",
        "synthetic_evidence",
        "validation_reason_codes",
        "validation_status",
      ].sort(),
    );
    const adapters = action666axAdapters();
    expect(Object.keys(adapters).sort()).toEqual([
      "capture_binding_lookup",
      "previous_binding_lookup",
    ]);
    expect(
      Object.keys(adapters.previous_binding_lookup).sort(),
    ).toEqual([
      "lookup_experiment_binding",
      "lookup_proposal_binding",
    ]);
    expect(Object.keys(adapters.capture_binding_lookup)).toEqual([
      "lookup_capture_binding",
    ]);
  });

  test("default-off and kill switch perform true zero work", () => {
    expect(DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_ENABLED).toBe(false);
    expect(
      DEFAULT_OFF_IMPROVEMENT_BINDING_STORE_KILL_SWITCH_ENGAGED,
    ).toBe(true);
    for (const options of [
      { enabled: false, kill_switch_engaged: false },
      { enabled: true, kill_switch_engaged: true },
    ]) {
      const counters = zeroCounters();
      let dependencyReads = 0;
      const input = {
        ...options,
        counters,
        get owner_dependency(): never {
          dependencyReads += 1;
          throw new Error("disabled_store_must_not_read_dependency");
        },
      };
      const harness =
        createCanonicalImprovementBindingStoreHarness(input);
      expect(harness.store).toBeNull();
      expect(dependencyReads).toBe(0);
      expect(counters).toEqual(zeroCounters());
      expect(harness.external_ai_canonical_truth_authority).toBe(false);
    }
  });

  test("input order and frozen owner bytes do not change deterministic results", () => {
    const frozen = structuredClone(action666axEmptySnapshot);
    Object.freeze(frozen.entry_inventory);
    Object.freeze(frozen);
    const before = JSON.stringify(frozen);
    const first = action666axStore(
      action666axOwnerDependency(frozen),
    ).lookup_capture_binding({
      capture_identity: "capture:deterministic",
      as_of: action666axLookupAsOf,
    });
    const reordered = Object.fromEntries(
      Object.entries(frozen).reverse(),
    );
    const second = action666axStore(
      action666axOwnerDependency(
        reordered,
        action666axOwnerDependency(frozen).read_expected_authority(),
      ),
    ).lookup_capture_binding({
      capture_identity: "capture:deterministic",
      as_of: action666axLookupAsOf,
    });
    expect(second).toEqual(first);
    expect(JSON.stringify(frozen)).toBe(before);
    expect(Object.isFrozen(frozen)).toBe(true);
  });

  test("golden report is deterministic synthetic evidence without performance claims", () => {
    const scenarios = action666axGoldenLookupScenarios.map(
      (scenario) => {
        const lookup = scenario.run();
        return {
          name: scenario.name,
          status: lookup.status,
          result_digest: lookup.result_digest,
        };
      },
    );
    const capture = action666axCapturedWithStore();
    const adapter = action666axMappedWithStore();
    const replay = action666axReplayWithStore();
    const actual = {
      report_version:
        "action_666ax_golden_improvement_binding_store_report_v1",
      snapshot_version:
        CANONICAL_IMPROVEMENT_BINDING_SNAPSHOT_VERSION,
      store_version: CANONICAL_IMPROVEMENT_BINDING_STORE_VERSION,
      evidence_classification: "synthetic_fixture_only",
      performance_claimed: false,
      publishable: false,
      scenarios,
      interop: {
        aj_capture_status: capture.status,
        ac_adapter_status: adapter.status,
        aq_replay_status: replay.status,
        aq_proposal_status: replay.proposal_status,
      },
      safety: {
        shadow_only: true,
        live_ranking_effect: false,
        automatic_training_allowed: false,
        automatic_change_allowed: false,
        automatic_promotion_allowed: false,
        external_ai_canonical_truth_authority: false,
        synthetic_evidence: true,
        not_publishable: true,
      },
    };
    if (process.env.ACTION_666AX_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666AX_GOLDEN=${JSON.stringify(actual)}`);
    }
    expect(goldenReport).toEqual(actual);
  });

  test("foundation remains server-only and absent from live consumers", () => {
    const root = process.cwd();
    const implementation =
      "lib/server/canonical-improvement-binding-store.ts";
    const text = fs.readFileSync(
      path.join(root, implementation),
      "utf8",
    );
    expect(text).toContain('import "server-only";');
    expect(text).not.toMatch(
      /\.(insert|update|delete|upsert)\s*\(|\b(writeFile|appendFile|fetch)\s*\(/,
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
              .includes("canonical-improvement-binding-store")
          ) {
            importingLiveFiles.push(path.relative(root, nested));
          }
        }
      }
    }
    expect(importingLiveFiles).toEqual([]);
  });
});
