import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import goldenReport from "@/docs/action-666bq-golden-binding-snapshot-issuance-successor-report.json";
import {
  action666bqAuthority,
  action666bqCollisionDependencies,
  action666bqDependencies,
  action666bqFutureAuthority,
  action666bqGoldenScenarioNames,
  action666bqIssue,
  action666bqMalformedExtraRequest,
  action666bqMatchingDependencies,
  action666bqReorderedRequest,
  action666bqRequest,
  action666bqRollbackDependencies,
  action666bqSelfConsistentReplacementDependencies,
} from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures";
import {
  CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_ARTIFACT_ROLES,
  CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGETS,
  CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGET_DIGEST,
  CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_STATUSES,
  CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_SUCCESSOR_VERSION,
  DEFAULT_OFF_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_ENABLED,
  DEFAULT_OFF_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_KILL_SWITCH,
  canonicalGovernedBindingSnapshotIssuanceDigest,
  createCanonicalGovernedBindingSnapshotIssuanceHarness,
  verifyCanonicalGovernedBindingSnapshotIssuanceResult,
  type CanonicalGovernedBindingSnapshotIssuanceCounters,
  type CanonicalGovernedBindingSnapshotIssuanceResult,
} from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor";

function counters(): CanonicalGovernedBindingSnapshotIssuanceCounters {
  return {
    request_reads: 0,
    clones: 0,
    authority_reads: 0,
    authority_verifications: 0,
    store_constructions: 0,
    entry_lookups: 0,
    snapshot_constructions: 0,
    bd_replay_executions: 0,
    independent_rebuilds: 0,
    digest_operations: 0,
  };
}

function nested(depth: number) {
  const root: Record<string, unknown> = {};
  let cursor = root;
  for (let index = 0; index < depth; index += 1) {
    const next: Record<string, unknown> = {};
    cursor.next = next;
    cursor = next;
  }
  return root;
}

function recomputeResult(result: CanonicalGovernedBindingSnapshotIssuanceResult) {
  const changed = structuredClone(result);
  const payload = structuredClone(changed);
  delete (
    payload as Partial<CanonicalGovernedBindingSnapshotIssuanceResult>
  ).issuance_digest;
  changed.issuance_digest =
    canonicalGovernedBindingSnapshotIssuanceDigest(payload);
  return changed;
}

test.describe("Action 666BQ governed issuance successor", () => {
  test("freezes the successor taxonomy, roles, budgets and safety", () => {
    expect(CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_STATUSES).toEqual([
      "issued",
      "incomplete",
      "conflicting",
      "not_point_in_time_safe",
      "rollback_rejected",
    ]);
    expect(Object.keys(
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_ARTIFACT_ROLES,
    )).toHaveLength(5);
    expect(CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGET_DIGEST)
      .toMatch(/^[a-f0-9]{64}$/);
    expect(
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGETS
        .inherited_snapshot_budget_policy.max_depth,
    ).toBeGreaterThan(32);
    expect(DEFAULT_OFF_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_ENABLED).toBe(
      false,
    );
    expect(
      DEFAULT_OFF_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_KILL_SWITCH,
    ).toBe(true);
  });

  test("issues and independently rebuilds BD → AX → AJ → AC → V → AQ", () => {
    const issued = action666bqIssue();
    expect(issued).toMatchObject({
      issuance_version:
        CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_SUCCESSOR_VERSION,
      status: "issued",
      binding_backed_replay_verified: true,
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
    expect(issued.binding_backed_replay_result).toMatchObject({
      status: "admitted",
      proposal_status: "proposal_ready",
    });
    expect(
      verifyCanonicalGovernedBindingSnapshotIssuanceResult({
        request: action666bqRequest,
        result: issued,
        dependencies: action666bqDependencies(),
      }),
    ).toMatchObject({ valid: true, reason_codes: [] });
    expect(Object.isFrozen(issued)).toBe(true);
    expect(Object.isFrozen(issued.external_snapshot)).toBe(true);
  });

  test("reads external issuer authority exactly once", () => {
    const base = action666bqDependencies();
    let reads = 0;
    const result = action666bqIssue(action666bqRequest, {
      ...base,
      issuer_authority_dependency: {
        ...base.issuer_authority_dependency,
        read_expected_authority: () => {
          reads += 1;
          return action666bqAuthority();
        },
      },
    });
    expect(result.status).toBe("issued");
    expect(reads).toBe(1);
  });

  test("binds matching previous entries through AX read-only lookups", () => {
    const result = action666bqIssue(
      action666bqRequest,
      action666bqMatchingDependencies(),
    );
    expect(result.status).toBe("issued");
    expect(
      result.lookup_observations.filter(
        (observation) => observation.observed_status === "matching",
      ),
    ).toHaveLength(2);
    expect(result.external_snapshot?.entry_inventory).toHaveLength(2);
  });

  test("classifies verified AX collision as conflicting", () => {
    const result = action666bqIssue(
      action666bqRequest,
      action666bqCollisionDependencies(),
    );
    expect(result.status).toBe("conflicting");
    expect(result.reason_codes).toEqual([
      "issuance_ax_binding_collision",
    ]);
    expect(result.external_snapshot).toBeNull();
  });

  test("rejects epoch rollback against owner minimum", () => {
    const result = action666bqIssue(
      action666bqRequest,
      action666bqRollbackDependencies(),
    );
    expect(result.status).toBe("rollback_rejected");
    expect(result.reason_codes).toContain(
      "issuance_owner_epoch_rollback_rejected",
    );
  });

  test("rejects future issuance at nanosecond boundary", () => {
    const result = action666bqIssue(
      action666bqRequest,
      action666bqDependencies({
        authority: action666bqFutureAuthority(),
      }),
    );
    expect(result.status).toBe("not_point_in_time_safe");
    expect(result.reason_codes).toContain(
      "issuance_future_or_post_cutoff_evidence",
    );
  });

  test("rejects self-consistent external root replacement", () => {
    const result = action666bqIssue(
      action666bqRequest,
      action666bqSelfConsistentReplacementDependencies(),
    );
    expect(result.status).toBe("conflicting");
    expect(result.reason_codes).toEqual([
      "issuance_external_authority_unrecognized",
    ]);
  });

  test("rejects caller authority and approval fields through closed schema", () => {
    const first = action666bqIssue(
      action666bqMalformedExtraRequest("a"),
    );
    const second = action666bqIssue(
      action666bqMalformedExtraRequest("b"),
    );
    expect(first.status).toBe("incomplete");
    expect(first.reason_codes).toEqual(["issuance_request_schema_invalid"]);
    expect(first.invalid_request_observation?.full_request_digest_computed)
      .toBe(true);
    expect(first.issuance_digest).not.toBe(second.issuance_digest);
  });

  test("is deterministic under input key reordering", () => {
    const original = action666bqIssue();
    const reordered = action666bqIssue(action666bqReorderedRequest());
    expect(reordered).toEqual(original);
  });

  test("fails closed on twenty-thousand-level input without RangeError", () => {
    const request = nested(20_000);
    expect(() => action666bqIssue(request)).not.toThrow();
    const result = action666bqIssue(request);
    expect(result.status).toBe("incomplete");
    expect(result.reason_codes).toContain(
      "issuance_request_validation_budget_exceeded",
    );
    expect(
      result.invalid_request_observation?.full_request_digest_computed,
    ).toBe(false);
  });

  test("accepts the exact depth budget and rejects budget plus one", () => {
    const maximum =
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGETS
        .inherited_snapshot_budget_policy.max_depth;
    const exact = action666bqIssue(nested(maximum));
    const exceeded = action666bqIssue(nested(maximum + 1));
    expect(exact.reason_codes).toContain("issuance_request_schema_invalid");
    expect(exceeded.reason_codes).toContain(
      "issuance_request_validation_budget_exceeded",
    );
    expect(exceeded.reason_codes).toContain("issuance_budget:max_depth");
  });

  test("sanitizes and distinguishes cycles", () => {
    const first: Record<string, unknown> = { marker: "first" };
    first.self = first;
    const second: Record<string, unknown> = { marker: "second" };
    second.self = second;
    const firstResult = action666bqIssue(first);
    const secondResult = action666bqIssue(second);
    expect(firstResult.status).toBe("incomplete");
    expect(firstResult.issuance_digest).not.toBe(
      secondResult.issuance_digest,
    );
    expect(JSON.stringify(firstResult)).not.toContain("stack");
  });

  test("rejects accessors without executing them", () => {
    let getterReads = 0;
    const request = {};
    Object.defineProperty(request, "issuance_identity", {
      enumerable: true,
      get() {
        getterReads += 1;
        throw new Error("sensitive_backend_detail");
      },
    });
    const result = action666bqIssue(request);
    expect(result.status).toBe("incomplete");
    expect(getterReads).toBe(0);
    expect(JSON.stringify(result)).not.toContain("sensitive_backend_detail");
  });

  test("rejects throwing proxies without leaking backend details", () => {
    const request = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("proxy_backend_secret");
        },
      },
    );
    const result = action666bqIssue(request);
    expect(result.status).toBe("incomplete");
    expect(JSON.stringify(result)).not.toContain("proxy_backend_secret");
  });

  test("binds oversized strings to structured budget evidence", () => {
    const size =
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_BUDGETS
        .inherited_snapshot_budget_policy.max_string_bytes + 1;
    const result = action666bqIssue({ value: "x".repeat(size) });
    expect(result.status).toBe("incomplete");
    expect(result.reason_codes).toContain(
      "issuance_budget:max_string_bytes",
    );
    expect(
      result.invalid_request_observation?.bounded_structural_digest,
    ).toMatch(/^[a-f0-9]{64}$/);
  });

  test("independent rebuild rejects self-consistent result tampering", () => {
    const issued = action666bqIssue();
    const changed = structuredClone(issued);
    changed.status = "conflicting";
    changed.reason_codes = ["tampered_but_recomputed"];
    const tampered = recomputeResult(changed);
    expect(
      verifyCanonicalGovernedBindingSnapshotIssuanceResult({
        request: action666bqRequest,
        result: tampered,
        dependencies: action666bqDependencies(),
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: [
        "governed_binding_snapshot_issuance_result_tampered",
      ],
    });
  });

  test("returns byte-identical retry and preserves input immutability", () => {
    const request = structuredClone(action666bqRequest);
    const before = JSON.stringify(request);
    const first = action666bqIssue(request);
    const second = action666bqIssue(request);
    expect(second).toEqual(first);
    expect(JSON.stringify(request)).toBe(before);
  });

  test("default-off and kill switch perform literal zero work", () => {
    for (const mode of [
      { enabled: false, kill_switch_engaged: false },
      { enabled: true, kill_switch_engaged: true },
    ]) {
      const observed = counters();
      const dependencies = action666bqDependencies();
      const harness =
        createCanonicalGovernedBindingSnapshotIssuanceHarness({
          ...mode,
          dependencies: {
            ...dependencies,
            issuer_authority_dependency: {
              ...dependencies.issuer_authority_dependency,
              read_expected_authority: () => {
                throw new Error("must_not_read");
              },
            },
          },
          counters: observed,
        });
      expect(harness.issue).toBeNull();
      expect(observed).toEqual(counters());
    }
  });

  test("keeps exact synthetic golden scenario and safety parity", () => {
    expect(goldenReport.contract_version).toBe(
      CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_SUCCESSOR_VERSION,
    );
    expect(
      goldenReport.scenarios.map((scenario) => scenario.name),
    ).toEqual(action666bqGoldenScenarioNames);
    expect(
      goldenReport.lost_historical_commitments.recovery_claimed,
    ).toBe(false);
    const actualStatuses = [
      action666bqIssue().status,
      action666bqIssue(
        action666bqRequest,
        action666bqMatchingDependencies(),
      ).status,
      action666bqIssue(
        action666bqRequest,
        action666bqCollisionDependencies(),
      ).status,
      action666bqIssue(
        action666bqRequest,
        action666bqRollbackDependencies(),
      ).status,
      action666bqIssue(
        action666bqRequest,
        action666bqDependencies({
          authority: action666bqFutureAuthority(),
        }),
      ).status,
      action666bqIssue(
        action666bqRequest,
        action666bqSelfConsistentReplacementDependencies(),
      ).status,
      action666bqIssue(
        action666bqMalformedExtraRequest("golden"),
      ).status,
      action666bqIssue(action666bqReorderedRequest()).status,
    ];
    expect(actualStatuses).toEqual(
      goldenReport.scenarios.map((scenario) => scenario.expected_status),
    );
  });

  test("five-artifact role manifest is closed and all paths exist", () => {
    const expected = [
      "docs/action-666bq-golden-binding-snapshot-issuance-successor-report.json",
      "docs/action-666bq-governed-binding-snapshot-issuance-successor.md",
      "lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures.ts",
      "lib/server/canonical-governed-binding-snapshot-issuance-successor.ts",
      "tests/e2e/action-666bq-governed-binding-snapshot-issuance-successor.spec.ts",
    ];
    expect(
      Object.keys(
        CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_ARTIFACT_ROLES,
      ).sort(),
    ).toEqual(expected);
    expect(
      expected.every((entry) => fs.existsSync(path.resolve(entry))),
    ).toBe(true);
  });
});
