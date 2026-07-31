import { expect, test } from "@playwright/test";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import goldenReport from "@/docs/action-666bv-golden-non-forgeable-snapshot-issuance-report.json";
import {
  action666bvAlternativeRootEnvelope,
  action666bvAuthorityEnvelope,
  action666bvAuthorityPayload,
  action666bvCrossSessionEnvelope,
  action666bvDependencies,
  action666bvIssue,
  action666bvMalformedNestedRequest,
  action666bvNestedSemanticDriftRequest,
  action666bvPredecessorAuthorityMintingAttack,
  action666bvPredecessorAuthorityRoot,
  action666bvReorderedRequest,
} from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import {
  CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ARTIFACT_ROLES,
  CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_STATUSES,
  CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION,
  CANONICAL_NON_FORGEABLE_NESTED_REQUEST_BUDGETS,
  CANONICAL_NON_FORGEABLE_NESTED_REQUEST_BUDGET_DIGEST,
  DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ENABLED,
  DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_KILL_SWITCH,
  canonicalNonForgeableBindingSnapshotIssuanceDigest,
  createCanonicalNonForgeableBindingSnapshotIssuanceHarness,
  verifyCanonicalNonForgeableBindingSnapshotIssuanceResult,
  type CanonicalNonForgeableBindingSnapshotIssuanceCounters,
  type CanonicalNonForgeableBindingSnapshotIssuanceResult,
} from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance";
import { action666bqRequest } from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures";

function counters(): CanonicalNonForgeableBindingSnapshotIssuanceCounters {
  return {
    request_reads: 0,
    request_validations: 0,
    clones: 0,
    authority_reads: 0,
    authority_validations: 0,
    authority_signature_verifications: 0,
    authority_snapshot_freezes: 0,
    nested_schema_validations: 0,
    predecessor_executions: 0,
    predecessor_rebuilds: 0,
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

function recompute(
  result: CanonicalNonForgeableBindingSnapshotIssuanceResult,
) {
  const changed = structuredClone(result);
  const payload = structuredClone(changed);
  delete (
    payload as Partial<CanonicalNonForgeableBindingSnapshotIssuanceResult>
  ).issuance_digest;
  changed.issuance_digest =
    canonicalNonForgeableBindingSnapshotIssuanceDigest(payload);
  return changed;
}

test.describe("Action 666BV non-forgeable issuance V2", () => {
  test("freezes the V2 taxonomy, budgets, scope and safety", () => {
    expect(CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_STATUSES)
      .toEqual([
        "issued",
        "incomplete",
        "conflicting",
        "not_point_in_time_safe",
        "rollback_rejected",
      ]);
    expect(
      Object.keys(
        CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ARTIFACT_ROLES,
      ),
    ).toHaveLength(5);
    expect(CANONICAL_NON_FORGEABLE_NESTED_REQUEST_BUDGET_DIGEST)
      .toMatch(/^[a-f0-9]{64}$/);
    expect(
      CANONICAL_NON_FORGEABLE_NESTED_REQUEST_BUDGETS.policy.max_depth,
    ).toBe(128);
    expect(DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ENABLED)
      .toBe(false);
    expect(
      DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_KILL_SWITCH,
    ).toBe(true);
  });

  test("keeps the signed authority payload deterministic", () => {
    if (process.env.ACTION_666BV_PRINT_AUTHORITY === "1") {
      console.log(
        `ACTION_666BV_AUTHORITY_DIGEST=${action666bvAuthorityPayload.authority_payload_digest}`,
      );
      console.log(
        `ACTION_666BV_PREDECESSOR_ROOT=${action666bvPredecessorAuthorityRoot}`,
      );
    }
    expect(action666bvAuthorityPayload.authority_payload_digest)
      .toMatch(/^[a-f0-9]{64}$/);
    expect(action666bvAuthorityEnvelope.signature_base64)
      .toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
  });

  test("issues through V2 → BD → AX → AJ → AC → V → AQ", () => {
    const issued = action666bvIssue();
    expect(issued).toMatchObject({
      issuance_version:
        CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION,
      status: "issued",
      nested_schema_closed: true,
      authority_signature_verified: true,
      runtime_provenance_verified: true,
      predecessor_result_verified: true,
      shadow_only: true,
      live_impact: false,
      persistence_performed: false,
      automatic_model_change_allowed: false,
      automatic_promotion_allowed: false,
      external_ai_canonical_truth_authority: false,
      synthetic_evidence: true,
      not_publishable: true,
    });
    expect(issued.predecessor_result).toMatchObject({
      status: "issued",
      binding_backed_replay_verified: true,
    });
    expect(
      verifyCanonicalNonForgeableBindingSnapshotIssuanceResult({
        request: action666bqRequest,
        result: issued,
        rebuild_dependencies: action666bvDependencies(),
      }),
    ).toMatchObject({ valid: true, reason_codes: [] });
  });

  test("reads the external authority atomically exactly once", () => {
    const dependencies = action666bvDependencies();
    const original =
      dependencies.authority_dependency.read_external_authority;
    let reads = 0;
    dependencies.authority_dependency.read_external_authority = () => {
      reads += 1;
      return original();
    };
    const result = action666bvIssue(action666bqRequest, dependencies);
    expect(result.status).toBe("issued");
    expect(reads).toBe(1);
  });

  test("reproduces predecessor minting and rejects it at V2 pins", () => {
    const predecessorAttack =
      action666bvPredecessorAuthorityMintingAttack();
    expect(predecessorAttack.reason_codes).not.toContain(
      "issuance_external_authority_unrecognized",
    );
    const v2 = action666bvIssue(
      action666bqRequest,
      action666bvDependencies(
        action666bvAlternativeRootEnvelope(),
      ),
    );
    expect(v2.status).toBe("conflicting");
    expect(v2.reason_codes).toContain(
      "external_authority_pin_mismatch",
    );
    expect(v2.predecessor_result).toBeNull();
  });

  test("rejects a cross-session authority before downstream work", () => {
    const result = action666bvIssue(
      action666bqRequest,
      action666bvDependencies(action666bvCrossSessionEnvelope()),
    );
    expect(result.status).toBe("conflicting");
    expect(result.reason_codes).toContain(
      "external_authority_schema_invalid",
    );
    expect(result.predecessor_result).toBeNull();
  });

  test("fails closed for the original semantically incomplete nested request", () => {
    expect(() =>
      action666bvIssue(action666bvMalformedNestedRequest()),
    ).not.toThrow();
    const result = action666bvIssue(
      action666bvMalformedNestedRequest(),
    );
    expect(result.status).toBe("incomplete");
    expect(result.reason_codes).toEqual([
      "nested_request_closed_schema_mismatch",
    ]);
    expect(result.invalid_request_observation).toMatchObject({
      rejection_stage: "nested_schema",
      observation_status: "complete",
    });
    expect(result.predecessor_result).toBeNull();
  });

  test("distinguishes invalid nested requests with the same terminal reason", () => {
    const first = action666bvIssue(
      action666bvMalformedNestedRequest("first"),
    );
    const second = action666bvIssue(
      action666bvMalformedNestedRequest("second"),
    );
    expect(first.reason_codes).toEqual(second.reason_codes);
    expect(first.request_digest).not.toBe(second.request_digest);
    expect(first.invalid_request_observation?.observation_digest)
      .not.toBe(second.invalid_request_observation?.observation_digest);
    expect(first.issuance_digest).not.toBe(second.issuance_digest);
  });

  test("binds semantic drift after the closed schema check", () => {
    const first = action666bvIssue(
      action666bvNestedSemanticDriftRequest(
        "trusted-input-semantic-drift-a",
      ),
    );
    const second = action666bvIssue(
      action666bvNestedSemanticDriftRequest(
        "trusted-input-semantic-drift-b",
      ),
    );
    expect(first.status).toBe("incomplete");
    expect(first.reason_codes).toEqual([
      "nested_request_semantic_scope_mismatch",
    ]);
    expect(first.issuance_digest).not.toBe(second.issuance_digest);
  });

  test("bounds twenty-thousand nesting without RangeError", () => {
    expect(() => action666bvIssue(nested(20_000))).not.toThrow();
    const result = action666bvIssue(nested(20_000));
    expect(result.status).toBe("incomplete");
    expect(result.reason_codes).toContain(
      "nested_request_validation_budget_exceeded",
    );
    expect(result.reason_codes).toContain(
      "nested_request_budget:max_depth",
    );
    expect(result.invalid_request_observation?.request_digest).toBeNull();
  });

  test("rejects cycles, accessors and throwing proxies without leakage", () => {
    const cycle: Record<string, unknown> = { marker: "cycle" };
    cycle.self = cycle;
    let getterReads = 0;
    const accessor: Record<string, unknown> = {};
    Object.defineProperty(accessor, "secret", {
      enumerable: true,
      get() {
        getterReads += 1;
        throw new Error("sensitive_getter_detail");
      },
    });
    const proxy = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("sensitive_proxy_detail");
        },
      },
    );
    for (const candidate of [cycle, accessor, proxy]) {
      expect(() => action666bvIssue(candidate)).not.toThrow();
      const result = action666bvIssue(candidate);
      expect(result.status).toBe("incomplete");
      expect(JSON.stringify(result)).not.toMatch(
        /sensitive_(getter|proxy)_detail|RangeError|stack/i,
      );
    }
    expect(getterReads).toBe(0);
  });

  test("is deterministic under input key reordering", () => {
    expect(action666bvIssue(action666bvReorderedRequest()))
      .toEqual(action666bvIssue());
  });

  test("rejects self-consistent terminal-result tampering", () => {
    const issued = action666bvIssue();
    const changed = structuredClone(issued);
    changed.authority_signature_verified = false;
    const tampered = recompute(changed);
    expect(
      verifyCanonicalNonForgeableBindingSnapshotIssuanceResult({
        request: action666bqRequest,
        result: tampered,
        rebuild_dependencies: action666bvDependencies(),
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["non_forgeable_issuance_result_tampered"],
    });
  });

  test("does true zero work when disabled or killed", () => {
    for (const options of [
      { enabled: false, kill_switch_engaged: false },
      { enabled: true, kill_switch_engaged: true },
    ]) {
      const observedCounters = counters();
      let dependencyReads = 0;
      const input = {
        ...options,
        counters: observedCounters,
        get dependencies(): never {
          dependencyReads += 1;
          throw new Error("disabled_must_not_read_dependencies");
        },
      };
      const harness =
        createCanonicalNonForgeableBindingSnapshotIssuanceHarness(input);
      expect(harness.issue).toBeNull();
      expect(dependencyReads).toBe(0);
      expect(observedCounters).toEqual(counters());
    }
  });

  test("preserves predecessor bytes and exports no general V2 authority factory", () => {
    const root = process.cwd();
    const predecessorPath = path.join(
      root,
      "lib/server/canonical-governed-binding-snapshot-issuance-successor.ts",
    );
    expect(
      crypto
        .createHash("sha256")
        .update(fs.readFileSync(predecessorPath))
        .digest("hex"),
    ).toBe("a7fd77396ef0c2f75253222d8166cc1d9e459dcc925114c7d8428d41fa7954d2");
    const source = fs.readFileSync(
      path.join(
        root,
        "lib/server/canonical-non-forgeable-binding-snapshot-issuance.ts",
      ),
      "utf8",
    );
    expect(source).not.toMatch(
      /export function createCanonicalNonForgeableIssuerAuthority/,
    );
    expect(source).toContain("verifiedRuntimeAuthorities");
  });

  test("keeps the V2 foundation server-only and outside live consumers", () => {
    const root = process.cwd();
    const moduleName =
      "canonical-non-forgeable-binding-snapshot-issuance";
    const implementation = fs.readFileSync(
      path.join(root, `lib/server/${moduleName}.ts`),
      "utf8",
    );
    expect(implementation.startsWith('import "server-only";')).toBe(true);
    expect(implementation).not.toMatch(
      /\.(insert|update|upsert)\s*\(|\b(writeFile|appendFile|fetch)\s*\(/,
    );
    expect(implementation).not.toMatch(
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
          const nestedPath = path.join(current, entry.name);
          if (entry.isDirectory()) pending.push(nestedPath);
          else if (
            /\.[cm]?[jt]sx?$/.test(entry.name) &&
            fs.readFileSync(nestedPath, "utf8").includes(moduleName)
          ) {
            importingLiveFiles.push(path.relative(root, nestedPath));
          }
        }
      }
    }
    expect(importingLiveFiles).toEqual([]);
  });

  test("matches deterministic synthetic golden evidence", () => {
    const scenarios = [
      {
        name: "issued",
        result: action666bvIssue(),
      },
      {
        name: "alternative_root",
        result: action666bvIssue(
          action666bqRequest,
          action666bvDependencies(
            action666bvAlternativeRootEnvelope(),
          ),
        ),
      },
      {
        name: "cross_session",
        result: action666bvIssue(
          action666bqRequest,
          action666bvDependencies(
            action666bvCrossSessionEnvelope(),
          ),
        ),
      },
      {
        name: "nested_schema_missing",
        result: action666bvIssue(
          action666bvMalformedNestedRequest(),
        ),
      },
      {
        name: "nested_semantic_drift",
        result: action666bvIssue(
          action666bvNestedSemanticDriftRequest(
            "trusted-input-semantic-drift-golden",
          ),
        ),
      },
    ].map(({ name, result }) => ({
      name,
      status: result.status,
      reason_codes: result.reason_codes,
      request_digest: result.request_digest,
      observation_digest:
        result.invalid_request_observation?.observation_digest ?? null,
      issuance_digest: result.issuance_digest,
    }));
    const actual = {
      report_version:
        "action_666bv_synthetic_non_forgeable_issuance_report_v1",
      contract_version:
        CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION,
      evidence_class: "synthetic_fixture_only",
      performance_claimed: false,
      authority_payload_digest:
        action666bvAuthorityPayload.authority_payload_digest,
      scenarios,
      safety: {
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
      },
    };
    if (process.env.ACTION_666BV_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666BV_GOLDEN=${JSON.stringify(actual)}`);
    }
    expect(goldenReport).toEqual(actual);
  });
});
