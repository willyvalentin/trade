import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { types as nodeTypes } from "node:util";

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
  canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest,
  createCanonicalGovernedBindingSnapshotIssuanceHarness,
  createCanonicalGovernedBindingSnapshotIssuerAuthority,
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

function mutatePath(
  source: unknown,
  pathParts: readonly string[],
  value: unknown,
) {
  const changed = structuredClone(source) as Record<string, unknown>;
  let cursor = changed;
  for (const pathPart of pathParts.slice(0, -1)) {
    const next = cursor[pathPart];
    if (!next || typeof next !== "object") {
      throw new Error("action_666bq_mutation_path_invalid");
    }
    cursor = next as Record<string, unknown>;
  }
  cursor[pathParts.at(-1)!] = value;
  return changed;
}

function deletePath(source: unknown, pathParts: readonly string[]) {
  const changed = structuredClone(source) as Record<string, unknown>;
  let cursor = changed;
  for (const pathPart of pathParts.slice(0, -1)) {
    const next = cursor[pathPart];
    if (!next || typeof next !== "object") {
      throw new Error("action_666bq_deletion_path_invalid");
    }
    cursor = next as Record<string, unknown>;
  }
  delete cursor[pathParts.at(-1)!];
  return changed;
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

function issuerAuthorityInput() {
  const authority = action666bqAuthority();
  return {
    authority_identity: authority.authority_identity,
    owner_boundary_identity: authority.owner_boundary_identity,
    external_owner_identity: authority.external_owner_identity,
    issuer_identity: authority.issuer_identity,
    issuer_implementation_version: authority.issuer_implementation_version,
    issuer_authority_anchor: authority.issuer_authority_anchor,
    registry_authority_identity: authority.registry_authority_identity,
    authority_manifest_digest: authority.authority_manifest_digest,
    authority_root_digest: authority.authority_root_digest,
    publication_sequence: authority.publication_sequence,
    publication_epoch: authority.publication_epoch,
    predecessor: structuredClone(authority.predecessor),
    issued_at: authority.issued_at,
    evidence_cutoff: authority.evidence_cutoff,
    effective_at: authority.effective_at,
    binding_plan: structuredClone(authority.binding_plan),
    semantic_scope_digest: authority.semantic_scope_digest,
    expected_request_identity: authority.expected_request_identity,
  };
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
    const harness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: action666bqDependencies(),
      });
    expect(harness.issue).not.toBeNull();
    const issued = harness.issue!(action666bqRequest);
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
        harness,
      }),
    ).toMatchObject({ valid: true, reason_codes: [] });
    expect(Object.isFrozen(issued)).toBe(true);
    expect(Object.isFrozen(issued.external_snapshot)).toBe(true);
  });

  test("rejects every semantic-scope literal drift before authority reads", () => {
    const harness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: action666bqDependencies(),
      });
    expect(harness.issue).not.toBeNull();
    const cases = [
      [["request_version"], "wrong"],
      [["source_namespace"], "wrong"],
      [["issuance_identity"], "bad identity"],
      [["binding_backed_replay_request", "request_version"], "wrong"],
      [["binding_backed_replay_request", "source_namespace"], "wrong"],
      [["binding_backed_replay_request", "admission_identity"], "bad identity"],
      [["binding_backed_replay_request", "lookup_as_of"], "not-an-instant"],
      [["binding_backed_replay_request", "end_to_end_request", "request_version"], "wrong"],
      [["binding_backed_replay_request", "end_to_end_request", "source_namespace"], "wrong"],
      [["binding_backed_replay_request", "end_to_end_request", "completed_capture_request", "request_version"], "wrong"],
      [["binding_backed_replay_request", "end_to_end_request", "completed_capture_request", "source_namespace"], "wrong"],
    ] as const;
    for (const [pathParts, value] of cases) {
      const malformed = mutatePath(action666bqRequest, pathParts, value);
      expect(() =>
        canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest(
          malformed as never,
        ),
      ).toThrow("governed_binding_snapshot_issuance_scope_invalid");
      expect(harness.issue!(malformed)).toMatchObject({
        status: "incomplete",
        reason_codes: ["issuance_request_schema_invalid"],
      });
    }
    expect(harness.counters.authority_reads).toBe(0);
    expect(harness.counters.authority_verifications).toBe(0);
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

  test("contains issuer callback failures after exactly one read", () => {
    const dependencies = action666bqDependencies();
    let reads = 0;
    dependencies.issuer_authority_dependency.read_expected_authority = () => {
      reads += 1;
      throw new Error("issuer_backend_detail");
    };
    const harness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies,
      });
    const result = harness.issue!(action666bqRequest);
    expect(result).toMatchObject({
      status: "conflicting",
      reason_codes: ["issuance_external_authority_read_failed"],
    });
    expect(JSON.stringify(result)).not.toContain("issuer_backend_detail");
    expect(reads).toBe(1);
    expect(harness.counters.authority_reads).toBe(1);
    expect(harness.counters.authority_verifications).toBe(0);
    expect(harness.counters.store_constructions).toBe(0);
  });

  test("fails closed on malformed issuer-authority builder surfaces", () => {
    expect(() =>
      createCanonicalGovernedBindingSnapshotIssuerAuthority(
        issuerAuthorityInput(),
      ),
    ).not.toThrow();

    const unknownEntryType = issuerAuthorityInput();
    (unknownEntryType.binding_plan[0] as { entry_type: string }).entry_type =
      "unexpected_binding";
    expect(() =>
      createCanonicalGovernedBindingSnapshotIssuerAuthority(
        unknownEntryType as never,
      ),
    ).toThrow("governed_issuance_binding_plan_invalid");

    const malformedInputs: unknown[] = [];
    const extra = issuerAuthorityInput() as Record<string, unknown>;
    extra.unexpected = true;
    malformedInputs.push(extra);

    const hidden = issuerAuthorityInput();
    Object.defineProperty(hidden, "hidden", {
      value: true,
      enumerable: false,
    });
    malformedInputs.push(hidden);

    const symbol = issuerAuthorityInput();
    Object.defineProperty(symbol, Symbol("unexpected"), {
      value: true,
      enumerable: true,
    });
    malformedInputs.push(symbol);

    let getterReads = 0;
    const accessor = issuerAuthorityInput();
    Object.defineProperty(accessor, "authority_identity", {
      enumerable: true,
      get() {
        getterReads += 1;
        throw new Error("authority_getter_executed");
      },
    });
    malformedInputs.push(accessor);

    const wrongDigestType = issuerAuthorityInput() as unknown as
      Record<string, unknown>;
    wrongDigestType.authority_root_digest = [
      wrongDigestType.authority_root_digest,
    ];
    malformedInputs.push(wrongDigestType);

    let proxyTraps = 0;
    malformedInputs.push(new Proxy(issuerAuthorityInput(), {
      get() {
        proxyTraps += 1;
        throw new Error("authority_proxy_get");
      },
      getPrototypeOf() {
        proxyTraps += 1;
        throw new Error("authority_proxy_prototype");
      },
      ownKeys() {
        proxyTraps += 1;
        throw new Error("authority_proxy_keys");
      },
    }));

    for (const malformed of malformedInputs) {
      expect(() =>
        createCanonicalGovernedBindingSnapshotIssuerAuthority(
          malformed as never,
        ),
      ).toThrow("governed_issuance_authority_invalid");
    }
    expect(getterReads).toBe(0);
    expect(proxyTraps).toBe(0);
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
    const harness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: action666bqDependencies(),
      });
    expect(harness.issue).not.toBeNull();
    const issued = harness.issue!(action666bqRequest);
    const changed = structuredClone(issued);
    changed.status = "conflicting";
    changed.reason_codes = ["tampered_but_recomputed"];
    const tampered = recomputeResult(changed);
    expect(
      verifyCanonicalGovernedBindingSnapshotIssuanceResult({
        request: action666bqRequest,
        result: tampered,
        harness,
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

  test("requires literal activation gates without touching blocked dependencies", () => {
    for (const enabled of [undefined, null, false, 0, 1, "true", {}]) {
      let dependencyReads = 0;
      const blockedDependency = new Proxy({}, {
        get() {
          dependencyReads += 1;
          throw new Error("blocked_dependency_read");
        },
        getPrototypeOf() {
          dependencyReads += 1;
          throw new Error("blocked_dependency_prototype");
        },
        ownKeys() {
          dependencyReads += 1;
          throw new Error("blocked_dependency_keys");
        },
      });
      const harness =
        createCanonicalGovernedBindingSnapshotIssuanceHarness({
          enabled,
          kill_switch_engaged: false,
          dependencies: blockedDependency,
        } as never);
      expect(harness.issue).toBeNull();
      expect(harness.counters).toEqual(counters());
      expect(dependencyReads).toBe(0);
    }
    for (const killSwitch of [undefined, null, true, 0, 1, "false", {}]) {
      let dependencyReads = 0;
      const blockedDependency = new Proxy({}, {
        get() {
          dependencyReads += 1;
          throw new Error("blocked_dependency_read");
        },
        getPrototypeOf() {
          dependencyReads += 1;
          throw new Error("blocked_dependency_prototype");
        },
        ownKeys() {
          dependencyReads += 1;
          throw new Error("blocked_dependency_keys");
        },
      });
      const harness =
        createCanonicalGovernedBindingSnapshotIssuanceHarness({
          enabled: true,
          kill_switch_engaged: killSwitch,
          dependencies: blockedDependency,
        } as never);
      expect(harness.issue).toBeNull();
      expect(harness.counters).toEqual(counters());
      expect(dependencyReads).toBe(0);
    }
    let optionTraps = 0;
    const optionProxy = new Proxy({}, {
      get() {
        optionTraps += 1;
        throw new Error("option_get");
      },
      getPrototypeOf() {
        optionTraps += 1;
        throw new Error("option_prototype");
      },
      ownKeys() {
        optionTraps += 1;
        throw new Error("option_keys");
      },
    });
    const proxyHarness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness(
        optionProxy as never,
      );
    expect(proxyHarness.issue).toBeNull();
    expect(proxyHarness.counters).toEqual(counters());
    expect(optionTraps).toBe(0);
  });

  test("rejects malformed dependency shells without authority reads or traps", () => {
    const base = action666bqDependencies();
    const issuerExtra = {
      ...base.issuer_authority_dependency,
      unexpected: true,
    };
    const issuerMissing = {
      ...base.issuer_authority_dependency,
    } as Partial<typeof base.issuer_authority_dependency>;
    delete issuerMissing.expected_authority_digest;
    const malformedDependencies: unknown[] = [
      { ...base, unexpected: true },
      {
        ax_owner_dependency: base.ax_owner_dependency,
        issuer_authority_dependency: base.issuer_authority_dependency,
      },
      { ...base, issuer_authority_dependency: issuerExtra },
      { ...base, issuer_authority_dependency: issuerMissing },
    ];

    let getterReads = 0;
    const accessor = { ...base };
    Object.defineProperty(accessor, "capture_authority", {
      enumerable: true,
      get() {
        getterReads += 1;
        throw new Error("dependency_getter_executed");
      },
    });
    malformedDependencies.push(accessor);

    let proxyTraps = 0;
    malformedDependencies.push(new Proxy(base, {
      get() {
        proxyTraps += 1;
        throw new Error("dependency_proxy_get");
      },
      getPrototypeOf() {
        proxyTraps += 1;
        throw new Error("dependency_proxy_prototype");
      },
      ownKeys() {
        proxyTraps += 1;
        throw new Error("dependency_proxy_keys");
      },
    }));

    for (const dependencies of malformedDependencies) {
      const harness =
        createCanonicalGovernedBindingSnapshotIssuanceHarness({
          enabled: true,
          kill_switch_engaged: false,
          dependencies: dependencies as never,
        });
      expect(harness.status).toBe("unavailable");
      expect(harness.issue).toBeNull();
      expect(harness.counters).toEqual(counters());
    }
    expect(getterReads).toBe(0);
    expect(proxyTraps).toBe(0);
  });

  test("rejects missing and extra nested replay fields before authority reads", () => {
    const harness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: action666bqDependencies(),
      });
    const missing = deletePath(action666bqRequest, [
      "binding_backed_replay_request",
      "admission_identity",
    ]);
    const extra = mutatePath(
      action666bqRequest,
      ["binding_backed_replay_request", "unexpected"],
      true,
    );
    const nestedExtra = mutatePath(
      action666bqRequest,
      ["binding_backed_replay_request", "end_to_end_request", "unexpected"],
      true,
    );
    for (const malformed of [missing, extra, nestedExtra]) {
      expect(harness.issue!(malformed)).toMatchObject({
        status: "incomplete",
        reason_codes: ["issuance_request_schema_invalid"],
      });
    }
    expect(harness.counters.authority_reads).toBe(0);
    expect(harness.counters.authority_verifications).toBe(0);
  });

  test("captures dependency callbacks and owner pins at construction", () => {
    const authority = action666bqAuthority();
    const dependencies = action666bqDependencies({ authority });
    let authorityReads = 0;
    dependencies.issuer_authority_dependency.read_expected_authority = () => {
      authorityReads += 1;
      return authority;
    };
    const originalAxAuthorityReader =
      dependencies.ax_owner_dependency.read_expected_authority;
    const originalAxSnapshotReader =
      dependencies.ax_owner_dependency.read_verified_snapshot;
    const harness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies,
      });
    dependencies.issuer_authority_dependency.read_expected_authority = () => {
      throw new Error("post_construction_authority_substitution");
    };
    dependencies.ax_owner_dependency.read_expected_authority = () => {
      throw new Error("post_construction_ax_authority_substitution");
    };
    dependencies.ax_owner_dependency.read_verified_snapshot = () => {
      throw new Error("post_construction_ax_snapshot_substitution");
    };
    dependencies.capture_authority = {} as never;
    dependencies.ax_owner_dependency = {} as never;
    expect(harness.issue!(action666bqRequest).status).toBe("issued");
    expect(authorityReads).toBe(1);
    expect(originalAxAuthorityReader).not.toBe(
      dependencies.ax_owner_dependency.read_expected_authority,
    );
    expect(originalAxSnapshotReader).not.toBe(
      dependencies.ax_owner_dependency.read_verified_snapshot,
    );
  });

  test("contains post-import primordial replacement without throwing", () => {
    const harness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: action666bqDependencies(),
      });
    const originals = {
      structuredClone: globalThis.structuredClone,
      jsonStringify: JSON.stringify,
      objectFreeze: Object.freeze,
      arrayEvery: Array.prototype.every,
      arrayMap: Array.prototype.map,
      arraySome: Array.prototype.some,
      arraySort: Array.prototype.sort,
      weakMapGet: WeakMap.prototype.get,
      weakMapHas: WeakMap.prototype.has,
      weakMapSet: WeakMap.prototype.set,
      weakSetAdd: WeakSet.prototype.add,
      weakSetHas: WeakSet.prototype.has,
      isProxy: nodeTypes.isProxy,
    };
    let observed: unknown = null;
    let thrown: unknown = null;
    try {
      globalThis.structuredClone = () => {
        throw new Error("post_import_clone_poison");
      };
      JSON.stringify = () => {
        throw new Error("post_import_stringify_poison");
      };
      Object.freeze = () => {
        throw new Error("post_import_freeze_poison");
      };
      Array.prototype.every = (() => {
        throw new Error("post_import_every_poison");
      }) as typeof Array.prototype.every;
      Array.prototype.map = () => {
        throw new Error("post_import_map_poison");
      };
      Array.prototype.some = () => {
        throw new Error("post_import_some_poison");
      };
      Array.prototype.sort = () => {
        throw new Error("post_import_sort_poison");
      };
      WeakMap.prototype.get = () => {
        throw new Error("post_import_weak_map_get_poison");
      };
      WeakMap.prototype.has = () => {
        throw new Error("post_import_weak_map_has_poison");
      };
      WeakMap.prototype.set = () => {
        throw new Error("post_import_weak_map_set_poison");
      };
      WeakSet.prototype.add = () => {
        throw new Error("post_import_weak_set_add_poison");
      };
      WeakSet.prototype.has = () => {
        throw new Error("post_import_weak_set_has_poison");
      };
      nodeTypes.isProxy = () => false;
      observed = harness.issue!(action666bqRequest);
    } catch (error) {
      thrown = error;
    } finally {
      globalThis.structuredClone = originals.structuredClone;
      JSON.stringify = originals.jsonStringify;
      Object.freeze = originals.objectFreeze;
      Array.prototype.every = originals.arrayEvery;
      Array.prototype.map = originals.arrayMap;
      Array.prototype.some = originals.arraySome;
      Array.prototype.sort = originals.arraySort;
      WeakMap.prototype.get = originals.weakMapGet;
      WeakMap.prototype.has = originals.weakMapHas;
      WeakMap.prototype.set = originals.weakMapSet;
      WeakSet.prototype.add = originals.weakSetAdd;
      WeakSet.prototype.has = originals.weakSetHas;
      nodeTypes.isProxy = originals.isProxy;
    }
    expect(thrown).toBeNull();
    expect(observed).toMatchObject({
      issuance_version:
        CANONICAL_GOVERNED_BINDING_SNAPSHOT_ISSUANCE_SUCCESSOR_VERSION,
    });
    expect(Object.isFrozen(observed)).toBe(true);
    expect(JSON.stringify(observed)).not.toContain("post_import_");
  });

  test("keeps counters private and leaves caller counters untouched while active", () => {
    const callerCounters = counters();
    const harness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: action666bqDependencies(),
        counters: callerCounters,
      });
    expect(harness.issue!(action666bqRequest).status).toBe("issued");
    expect(callerCounters).toEqual(counters());
    expect(harness.counters.request_reads).toBe(1);
    expect(harness.counters.authority_reads).toBe(1);
    expect(Object.isFrozen(harness.counters)).toBe(true);
  });

  test("binds verification to the private originating harness", () => {
    const firstHarness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: action666bqDependencies(),
      });
    const secondHarness =
      createCanonicalGovernedBindingSnapshotIssuanceHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies: action666bqMatchingDependencies(),
      });
    const issued = firstHarness.issue!(action666bqRequest);
    expect(
      verifyCanonicalGovernedBindingSnapshotIssuanceResult({
        request: action666bqRequest,
        result: issued,
        harness: firstHarness,
      }).valid,
    ).toBe(true);
    for (const harness of [secondHarness, { ...firstHarness }, {}]) {
      expect(
        verifyCanonicalGovernedBindingSnapshotIssuanceResult({
          request: action666bqRequest,
          result: issued,
          harness,
        }).valid,
      ).toBe(false);
    }
    let resultTraps = 0;
    const proxyResult = new Proxy(issued, {
      get() {
        resultTraps += 1;
        throw new Error("result_get");
      },
      getPrototypeOf() {
        resultTraps += 1;
        throw new Error("result_prototype");
      },
      ownKeys() {
        resultTraps += 1;
        throw new Error("result_keys");
      },
    });
    expect(
      verifyCanonicalGovernedBindingSnapshotIssuanceResult({
        request: action666bqRequest,
        result: proxyResult,
        harness: firstHarness,
      }).valid,
    ).toBe(false);
    expect(resultTraps).toBe(0);
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
