import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import goldenReport from "@/docs/action-666aq-golden-governed-improvement-end-to-end-report.json";
import {
  action666aqAdapterConflictDependencies,
  action666aqAdapterTrustRootProjection,
  action666aqAdapterUnmappableDependencies,
  action666aqCallerAuthorityRequest,
  action666aqCapturePreviousBindingCollisionDependencies,
  action666aqCaptureTrustRootDriftRequest,
  action666aqCaptureTrustRootProjection,
  action666aqDependencies,
  action666aqGoldenScenarios,
  action666aqMatchingStageBindingDependencies,
  action666aqNoChangeDependencies,
  action666aqNoChangeRequest,
  action666aqProposalReadyRequest,
  action666aqProposalTrustRootProjection,
  action666aqReorderedRequest,
  action666aqStableDependencies,
} from "@/lib/server/canonical-governed-improvement-end-to-end-replay-fixtures";
import {
  CANONICAL_GOVERNED_IMPROVEMENT_COMPLETED_PROPOSAL_STATUSES,
  CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REPLAY_VERSION,
  CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_STATUSES,
  DEFAULT_OFF_GOVERNED_IMPROVEMENT_END_TO_END_KILL_SWITCH_ENGAGED,
  DEFAULT_OFF_GOVERNED_IMPROVEMENT_END_TO_END_REPLAY_ENABLED,
  createCanonicalGovernedImprovementEndToEndReplayHarness,
  verifyCanonicalGovernedImprovementEndToEndResult,
  type CanonicalGovernedImprovementEndToEndCounters,
  type CanonicalGovernedImprovementEndToEndDependencies,
  type CanonicalGovernedImprovementEndToEndRequest,
} from "@/lib/server/canonical-governed-improvement-end-to-end-replay";
import {
  canonicalModelImprovementDigest,
} from "@/lib/server/canonical-model-improvement-proposal";

function zeroCounters(): CanonicalGovernedImprovementEndToEndCounters {
  return {
    request_reads: 0,
    clones: 0,
    trust_lookups: 0,
    capture_executions: 0,
    capture_rebuild_verifications: 0,
    adapter_executions: 0,
    adapter_rebuild_verifications: 0,
    proposal_executions: 0,
    proposal_rebuild_verifications: 0,
    stage_projection_reads: 0,
    digest_operations: 0,
  };
}

function replay(
  request: CanonicalGovernedImprovementEndToEndRequest =
    action666aqProposalReadyRequest,
  dependencies: CanonicalGovernedImprovementEndToEndDependencies =
    action666aqStableDependencies,
) {
  const harness = replayHarness(dependencies);
  if (!harness.replay) throw new Error("action_666aq_harness_not_ready");
  return harness.replay(request);
}

function replayHarness(
  dependencies: CanonicalGovernedImprovementEndToEndDependencies =
    action666aqStableDependencies,
) {
  return createCanonicalGovernedImprovementEndToEndReplayHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies,
  });
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

test.describe("Action 666AQ governed improvement end-to-end replay", () => {
  test("freezes exact terminal and completed-proposal taxonomies", () => {
    expect(CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_STATUSES).toEqual([
      "completed",
      "conflicting",
      "incomplete",
      "rejected",
    ]);
    expect(
      CANONICAL_GOVERNED_IMPROVEMENT_COMPLETED_PROPOSAL_STATUSES,
    ).toEqual([
      "proposal_ready",
      "no_change",
      "research_only",
      "insufficient_evidence",
    ]);
    expect(
      new Set(CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_STATUSES).size,
    ).toBe(4);
  });

  test("golden matrix composes capture, adapter, and proposal fail-closed", () => {
    for (const scenario of action666aqGoldenScenarios) {
      const result = replay(scenario.request, scenario.dependencies);
      expect(
        result.status,
        `${scenario.name}:${result.reason_codes.join(",")}`,
      ).toBe(scenario.expected_status);
      expect(result.proposal_status).toBe(
        scenario.expected_proposal_status,
      );
      expect(
        verifyCanonicalGovernedImprovementEndToEndResult({
          request: scenario.request,
          result,
          harness: replayHarness(scenario.dependencies),
        }),
      ).toMatchObject({ valid: true, reason_codes: [] });
    }
  });

  test("completed proposal-ready lineage binds every canonical stage", () => {
    const result = replay();
    expect(result).toMatchObject({
      replay_version:
        CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REPLAY_VERSION,
      status: "completed",
      proposal_status: "proposal_ready",
      reason_codes: ["all_experiment_candidate_gates_passed"],
      shadow_only: true,
      live_ranking_effect: false,
      persistence_performed: false,
      automatic_training_allowed: false,
      automatic_parameter_change_allowed: false,
      automatic_threshold_change_allowed: false,
      automatic_model_change_allowed: false,
      automatic_promotion_allowed: false,
      external_ai_canonical_truth_authority: false,
      causal_improvement_claimed: false,
      synthetic_evidence: true,
      not_publishable: true,
    });
    expect(result.lineage.stage_inventory.map((stage) => stage.stage)).toEqual([
      "capture",
      "adapter",
      "proposal",
    ]);
    expect(
      result.lineage.stage_inventory.every(
        (stage) => stage.rebuild_verified,
      ),
    ).toBe(true);
    expect(result.lineage.capture_identity).toMatch(
      /^canonical-completed-improvement-capture:/,
    );
    expect(result.lineage.adapter_bundle_identity).toMatch(
      /^completed-improvement-bundle:/,
    );
    expect(result.lineage.proposal_identity).toBeTruthy();
    expect(result.lineage.experiment_preregistration_identity).toBeTruthy();
    expect(result.lineage.metric_policy_version).toBe(
      "canonical_model_improvement_policy_v1",
    );
    expect(result.lineage.multiple_testing_policy_version).toBe(
      "canonical_model_improvement_multiple_testing_policy_v1",
    );
    expect(
      result.lineage.stage_previous_binding_observations.map(
        (observation) => observation.stage,
      ),
    ).toEqual(["adapter", "adapter", "proposal", "proposal"]);
    expect(
      result.lineage.stage_previous_binding_observations.every(
        (observation) => observation.observed_status === "absent",
      ),
    ).toBe(true);
    for (const digest of [
      result.lineage.capture_digest,
      result.lineage.adapter_replay_digest,
      result.lineage.adapter_mapping_digest,
      result.lineage.proposal_digest,
      result.lineage.opportunity_membership_digest,
      result.lineage.outcome_evaluator_lineage_digest,
      result.lineage.explanation_lineage_digest,
      result.lineage.stage_inventory_digest,
      result.lineage
        .stage_previous_binding_observation_inventory_digest,
      result.lineage.lineage_digest,
      result.end_to_end_digest,
    ]) {
      expect(digest).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  test("absent and matching stage binding observations change end-to-end evidence", () => {
    const absent = replay();
    const matching = replay(
      action666aqProposalReadyRequest,
      action666aqMatchingStageBindingDependencies,
    );
    expect(matching.status).toBe("completed");
    expect(matching.proposal_status).toBe("proposal_ready");
    expect(
      matching.lineage.stage_previous_binding_observations.every(
        (observation) => observation.observed_status === "matching",
      ),
    ).toBe(true);
    expect(
      matching.lineage.stage_previous_binding_observation_inventory_digest,
    ).not.toBe(
      absent.lineage.stage_previous_binding_observation_inventory_digest,
    );
    expect(matching.lineage.lineage_digest).not.toBe(
      absent.lineage.lineage_digest,
    );
    expect(matching.end_to_end_digest).not.toBe(absent.end_to_end_digest);
  });

  test("no-change is completed evidence without an experiment or change authority", () => {
    const result = replay(
      action666aqNoChangeRequest,
      action666aqNoChangeDependencies,
    );
    expect(result).toMatchObject({
      status: "completed",
      proposal_status: "no_change",
      automatic_parameter_change_allowed: false,
      automatic_threshold_change_allowed: false,
      automatic_model_change_allowed: false,
      automatic_promotion_allowed: false,
      lineage: {
        experiment_preregistration_identity: null,
        proposal_status: "no_change",
      },
    });
  });

  test("capture failures stop before adapter and proposal execution", () => {
    for (const scenario of action666aqGoldenScenarios.filter((item) =>
      ["incomplete_capture", "capture_conflict"].includes(item.name),
    )) {
      const result = replay(scenario.request, scenario.dependencies);
      expect(result.lineage.stage_inventory.map((stage) => stage.stage)).toEqual(
        ["capture"],
      );
      expect(result.lineage.adapter_replay_digest).toBeNull();
      expect(result.lineage.proposal_digest).toBeNull();
    }
  });

  test("adapter conflicting and unmappable remain distinct terminal evidence", () => {
    const conflicting = replay(
      action666aqProposalReadyRequest,
      action666aqAdapterConflictDependencies,
    );
    const unmappable = replay(
      action666aqProposalReadyRequest,
      action666aqAdapterUnmappableDependencies,
    );
    expect(conflicting.status).toBe("conflicting");
    expect(conflicting.lineage.mapping_status).toBe("conflicting");
    expect(unmappable.status).toBe("incomplete");
    expect(unmappable.lineage.mapping_status).toBe("unmappable");
    expect(conflicting.end_to_end_digest).not.toBe(
      unmappable.end_to_end_digest,
    );
    for (const result of [conflicting, unmappable]) {
      expect(result.lineage.stage_inventory.map((stage) => stage.stage)).toEqual(
        ["capture", "adapter"],
      );
      expect(result.lineage.proposal_digest).toBeNull();
    }
  });

  test("research-only and insufficient evidence are completed but non-executable", () => {
    for (const scenario of action666aqGoldenScenarios.filter((item) =>
      [
        "proposal_research_only",
        "proposal_insufficient_evidence",
      ].includes(item.name),
    )) {
      const result = replay(scenario.request, scenario.dependencies);
      expect(result.status).toBe("completed");
      expect(result.proposal_status).toBe(scenario.expected_proposal_status);
      expect(result.automatic_training_allowed).toBe(false);
      expect(result.automatic_promotion_allowed).toBe(false);
      expect(result.not_publishable).toBe(true);
    }
  });

  test("capture trust-root drift is a canonical conflict", () => {
    const result = replay(action666aqCaptureTrustRootDriftRequest);
    expect(result.status).toBe("conflicting");
    expect(result.reason_codes).toContain(
      "capture:capture_registry_root_substitution",
    );
    expect(result.lineage.stage_inventory).toHaveLength(1);
  });

  test("self-consistent capture trust-root replacement is rejected by rebuild", () => {
    const dependencies = action666aqDependencies(undefined, {
      untrusted_stage_projection: action666aqCaptureTrustRootProjection(),
    });
    const result = replay(action666aqProposalReadyRequest, dependencies);
    expect(result).toMatchObject({
      status: "rejected",
      reason_codes: ["capture_stage_rebuild_verification_failed"],
    });
    expect(result.lineage.stage_inventory[0]).toMatchObject({
      stage: "capture",
      rebuild_verified: false,
    });
    expect(
      verifyCanonicalGovernedImprovementEndToEndResult({
        request: action666aqProposalReadyRequest,
        result,
        harness: replayHarness(dependencies),
      }).valid,
    ).toBe(true);
  });

  test("self-consistent adapter trust-root replacement is rejected by rebuild", () => {
    const dependencies = action666aqDependencies(undefined, {
      untrusted_stage_projection: action666aqAdapterTrustRootProjection(),
    });
    const result = replay(action666aqProposalReadyRequest, dependencies);
    expect(result).toMatchObject({
      status: "rejected",
      reason_codes: ["adapter_stage_rebuild_verification_failed"],
    });
    expect(result.lineage.stage_inventory.at(-1)).toMatchObject({
      stage: "adapter",
      rebuild_verified: false,
    });
  });

  test("self-consistent proposal trust-root replacement is rejected by rebuild", () => {
    const dependencies = action666aqDependencies(undefined, {
      untrusted_stage_projection: action666aqProposalTrustRootProjection(),
    });
    const result = replay(action666aqProposalReadyRequest, dependencies);
    expect(result).toMatchObject({
      status: "rejected",
      reason_codes: ["proposal_stage_rebuild_verification_failed"],
    });
    expect(result.lineage.stage_inventory.at(-1)).toMatchObject({
      stage: "proposal",
      rebuild_verified: false,
    });
  });

  test("previous-binding collision is observed before downstream stages", () => {
    const result = replay(
      action666aqProposalReadyRequest,
      action666aqCapturePreviousBindingCollisionDependencies,
    );
    expect(result.status).toBe("conflicting");
    expect(result.reason_codes).toContain(
      "capture:previous_binding_semantic_collision",
    );
    expect(
      result.lineage.capture_lookup_observations.some(
        (observation) => observation.observed_status === "conflicting",
      ),
    ).toBe(true);
  });

  test("caller-supplied authority flags are rejected without stage execution", () => {
    const result = replay(action666aqCallerAuthorityRequest());
    expect(result.status).toBe("conflicting");
    expect(result.reason_codes).toEqual([
      "end_to_end_caller_authority_field_forbidden:approved",
      "end_to_end_caller_authority_field_forbidden:complete",
      "end_to_end_caller_authority_field_forbidden:mapped",
      "end_to_end_caller_authority_field_forbidden:proposal_ready",
      "end_to_end_caller_authority_field_forbidden:verified",
    ]);
    expect(result.lineage.stage_inventory).toEqual([]);
  });

  test("external AI canonical-truth authority is exactly false for every terminal status", () => {
    const results = action666aqGoldenScenarios.map((scenario) =>
      replay(scenario.request, scenario.dependencies),
    );
    results.push(
      replay(
        action666aqProposalReadyRequest,
        action666aqDependencies(undefined, {
          untrusted_stage_projection:
            action666aqCaptureTrustRootProjection(),
        }),
      ),
    );
    expect(new Set(results.map((result) => result.status))).toEqual(
      new Set(["completed", "conflicting", "incomplete", "rejected"]),
    );
    for (const result of results) {
      expect(result.external_ai_canonical_truth_authority).toBe(false);
      expect(
        JSON.parse(JSON.stringify(result))
          .external_ai_canonical_truth_authority,
      ).toBe(false);
    }
  });

  test("external AI authority omission, type drift, truth elevation, and recomputed digests fail rebuild", () => {
    const canonical = replay();
    const altered: Array<Record<string, unknown>> = [];

    const missing = structuredClone(canonical) as unknown as Record<
      string,
      unknown
    >;
    delete missing.external_ai_canonical_truth_authority;
    altered.push(missing);

    const elevated = structuredClone(canonical) as unknown as Record<
      string,
      unknown
    >;
    elevated.external_ai_canonical_truth_authority = true;
    altered.push(elevated);

    const wrongType = structuredClone(canonical) as unknown as Record<
      string,
      unknown
    >;
    wrongType.external_ai_canonical_truth_authority = "false";
    altered.push(wrongType);

    for (const candidate of altered) {
      const terminalPayload = structuredClone(candidate);
      delete terminalPayload.end_to_end_digest;
      candidate.end_to_end_digest =
        canonicalModelImprovementDigest(terminalPayload);
      expect(
        verifyCanonicalGovernedImprovementEndToEndResult({
          request: action666aqProposalReadyRequest,
          result:
            candidate as unknown as ReturnType<typeof replay>,
          harness: replayHarness(),
        }),
      ).toMatchObject({
        valid: false,
        canonical_result: null,
        reason_codes: [
          "canonical_governed_improvement_end_to_end_result_tampered",
        ],
      });
    }
  });

  test("final result tampering fails independent full rebuild", () => {
    const result = replay();
    const tampered = structuredClone(result);
    tampered.lineage.proposal_identity = "tampered:proposal";
    tampered.lineage.lineage_digest = canonicalModelImprovementDigest({
      self_consistent_alternative_lineage: tampered.lineage,
    });
    tampered.end_to_end_digest = canonicalModelImprovementDigest({
      self_consistent_alternative_result: tampered,
    });
    expect(
      verifyCanonicalGovernedImprovementEndToEndResult({
        request: action666aqProposalReadyRequest,
        result: tampered,
        harness: replayHarness(),
      }),
    ).toMatchObject({
      valid: false,
      canonical_result: null,
      reason_codes: [
        "canonical_governed_improvement_end_to_end_result_tampered",
      ],
    });
  });

  test("input ordering does not change canonical output", () => {
    const canonical = replay();
    const reordered = replay(action666aqReorderedRequest());
    expect(reordered).toEqual(canonical);
    expect(reordered.end_to_end_digest).toBe(canonical.end_to_end_digest);
  });

  test("byte-identical retry is deterministic and does not mutate frozen input", () => {
    const request = deepFreeze(
      structuredClone(action666aqProposalReadyRequest),
    );
    const before = JSON.stringify(request);
    const first = replay(request);
    const second = replay(request);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(second.end_to_end_digest).toBe(first.end_to_end_digest);
    expect(JSON.stringify(request)).toBe(before);
    expect(Object.isFrozen(request)).toBe(true);
    expect(Object.isFrozen(request.completed_capture_request)).toBe(true);
  });

  test("default-off and kill switch perform true zero work", () => {
    expect(DEFAULT_OFF_GOVERNED_IMPROVEMENT_END_TO_END_REPLAY_ENABLED).toBe(
      false,
    );
    expect(
      DEFAULT_OFF_GOVERNED_IMPROVEMENT_END_TO_END_KILL_SWITCH_ENGAGED,
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
        get dependencies(): CanonicalGovernedImprovementEndToEndDependencies {
          dependencyReads += 1;
          throw new Error("default_off_must_not_read_dependencies");
        },
      };
      const harness =
        createCanonicalGovernedImprovementEndToEndReplayHarness(input);
      expect(harness.replay).toBeNull();
      expect(harness.external_ai_canonical_truth_authority).toBe(false);
      expect(dependencyReads).toBe(0);
      expect(counters).toEqual(zeroCounters());
    }
  });

  test("runtime activation requires literal true and literal false before dependency reads", () => {
    const disabledValues: unknown[] = [
      undefined,
      null,
      false,
      0,
      1,
      "true",
      {},
    ];
    const nonClearKillSwitchValues: unknown[] = [
      undefined,
      null,
      true,
      0,
      1,
      "false",
      {},
    ];
    for (const enabled of disabledValues) {
      let dependencyReads = 0;
      const harness = createCanonicalGovernedImprovementEndToEndReplayHarness({
        enabled: enabled as boolean,
        kill_switch_engaged: false,
        get dependencies(): CanonicalGovernedImprovementEndToEndDependencies {
          dependencyReads += 1;
          throw new Error("closed_gate_dependency_read");
        },
      });
      expect(harness.replay).toBeNull();
      expect(dependencyReads).toBe(0);
      expect(harness.counters).toEqual(zeroCounters());
    }
    for (const kill_switch_engaged of nonClearKillSwitchValues) {
      let dependencyReads = 0;
      const harness = createCanonicalGovernedImprovementEndToEndReplayHarness({
        enabled: true,
        kill_switch_engaged: kill_switch_engaged as boolean,
        get dependencies(): CanonicalGovernedImprovementEndToEndDependencies {
          dependencyReads += 1;
          throw new Error("closed_gate_dependency_read");
        },
      });
      expect(harness.replay).toBeNull();
      expect(dependencyReads).toBe(0);
      expect(harness.counters).toEqual(zeroCounters());
    }
  });

  test("active options and dependency shells are exact and descriptor-safe", () => {
    for (const mutate of [
      (value: Record<PropertyKey, unknown>) => {
        value.unexpected = true;
      },
      (value: Record<PropertyKey, unknown>) => {
        Object.defineProperty(value, "hidden", { value: true });
      },
      (value: Record<PropertyKey, unknown>) => {
        value[Symbol("unexpected")] = true;
      },
    ]) {
      const dependencies = {
        ...action666aqStableDependencies,
      } as unknown as Record<PropertyKey, unknown>;
      mutate(dependencies);
      const harness = createCanonicalGovernedImprovementEndToEndReplayHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies:
          dependencies as unknown as CanonicalGovernedImprovementEndToEndDependencies,
      });
      expect(harness).toMatchObject({
        status: "unavailable",
        replay: null,
      });
    }

    const optionWithAccessor = {
      enabled: true,
      kill_switch_engaged: false,
      get dependencies(): CanonicalGovernedImprovementEndToEndDependencies {
        throw new Error("dependency_accessor_must_not_execute");
      },
    };
    expect(() =>
      createCanonicalGovernedImprovementEndToEndReplayHarness(
        optionWithAccessor,
      ),
    ).not.toThrow();
    expect(
      createCanonicalGovernedImprovementEndToEndReplayHarness(
        optionWithAccessor,
      ).replay,
    ).toBeNull();
  });

  test("construction snapshots lookup methods and keeps execution counters private", () => {
    const dependencies = {
      ...action666aqStableDependencies,
      capture_previous_binding_lookup: {
        ...action666aqStableDependencies.capture_previous_binding_lookup,
      },
      adapter_previous_binding_lookup: {
        ...action666aqStableDependencies.adapter_previous_binding_lookup,
      },
      proposal_previous_binding_lookup: {
        ...action666aqStableDependencies.proposal_previous_binding_lookup,
      },
      capture_binding_lookup: {
        ...action666aqStableDependencies.capture_binding_lookup,
      },
    };
    const callerCounters = zeroCounters();
    const harness = createCanonicalGovernedImprovementEndToEndReplayHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies,
      counters: callerCounters,
    });
    if (!harness.replay) throw new Error("snapshot_harness_not_ready");
    dependencies.adapter_previous_binding_lookup.lookup_proposal_binding =
      () => {
        throw new Error("post_construction_mutation");
      };
    dependencies.proposal_previous_binding_lookup.lookup_experiment_binding =
      () => ({ semantic_digest: "f".repeat(64) });
    const result = harness.replay(action666aqProposalReadyRequest);
    expect(result.status).toBe("completed");
    expect(callerCounters).toEqual(zeroCounters());
    expect(harness.counters.request_reads).toBeGreaterThan(0);
    expect(Object.isFrozen(harness.counters)).toBe(true);
  });

  test("request and result proxies, extra keys, symbols, and copied harnesses have no verifier authority", () => {
    const harness = replayHarness();
    if (!harness.replay) throw new Error("proxy_harness_not_ready");
    const proxyRequest = new Proxy(action666aqProposalReadyRequest, {});
    const proxyResult = harness.replay(proxyRequest);
    expect(proxyResult).toMatchObject({
      status: "rejected",
      reason_codes: ["end_to_end_request_runtime_shape_conflicting"],
    });

    const canonical = harness.replay(action666aqProposalReadyRequest);
    expect(
      verifyCanonicalGovernedImprovementEndToEndResult({
        request: action666aqProposalReadyRequest,
        result: new Proxy(canonical, {}),
        harness,
      }).valid,
    ).toBe(false);
    expect(
      verifyCanonicalGovernedImprovementEndToEndResult({
        request: action666aqProposalReadyRequest,
        result: canonical,
        harness: { ...harness },
      }).valid,
    ).toBe(false);
    expect(
      verifyCanonicalGovernedImprovementEndToEndResult({
        request: action666aqProposalReadyRequest,
        result: canonical,
        harness,
      }).valid,
    ).toBe(true);
    expect(
      verifyCanonicalGovernedImprovementEndToEndResult({
        request: action666aqProposalReadyRequest,
        result: { ...canonical, unexpected: undefined },
        harness,
      } as Parameters<
        typeof verifyCanonicalGovernedImprovementEndToEndResult
      >[0]).valid,
    ).toBe(false);

    for (const request of [
      {
        ...action666aqProposalReadyRequest,
        unexpected: true,
      },
      Object.assign(
        structuredClone(action666aqProposalReadyRequest),
        { [Symbol("unexpected")]: true },
      ),
    ]) {
      expect(harness.replay(request).status).toBe("rejected");
    }
  });

  test("golden report is exact synthetic evidence, never performance", () => {
    const actualScenarios = action666aqGoldenScenarios.map((scenario) => {
      const result = replay(scenario.request, scenario.dependencies);
      return {
        name: scenario.name,
        terminal_status: result.status,
        proposal_status: result.proposal_status,
        stage_count: result.lineage.stage_inventory.length,
        end_to_end_digest: result.end_to_end_digest,
      };
    });
    expect(goldenReport).toEqual({
      report_version:
        "action_666aq_golden_governed_improvement_end_to_end_report_v1",
      contract_version:
        CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REPLAY_VERSION,
      evidence_classification: "synthetic_fixture_only",
      performance_claimed: false,
      publishable: false,
      scenarios: actualScenarios,
      safety: {
        shadow_only: true,
        live_ranking_effect: false,
        persistence_performed: false,
        automatic_training_allowed: false,
        automatic_parameter_change_allowed: false,
        automatic_threshold_change_allowed: false,
        automatic_model_change_allowed: false,
        automatic_promotion_allowed: false,
        external_ai_canonical_truth_authority: false,
        causal_improvement_claimed: false,
        synthetic_evidence: true,
        not_publishable: true,
      },
    });
  });

  test("foundation remains server-only with no live import or mutation boundary", () => {
    const root = process.cwd();
    const implementation =
      "lib/server/canonical-governed-improvement-end-to-end-replay.ts";
    const fixture =
      "lib/server/canonical-governed-improvement-end-to-end-replay-fixtures.ts";
    expect(
      fs.readFileSync(path.join(root, implementation), "utf8"),
    ).toContain('import "server-only";');
    const liveRoots = ["app", "components", "pages"];
    const importingLiveFiles: string[] = [];
    for (const liveRoot of liveRoots) {
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
              .includes("canonical-governed-improvement-end-to-end-replay")
          ) {
            importingLiveFiles.push(path.relative(root, nested));
          }
        }
      }
    }
    expect(importingLiveFiles).toEqual([]);
    const scopedDiff = fs
      .readFileSync(path.join(root, implementation), "utf8")
      .concat(fs.readFileSync(path.join(root, fixture), "utf8"));
    expect(scopedDiff).not.toMatch(
      /createClient|supabase|DATABASE_URL|fetch\(|process\.env/,
    );
    expect(scopedDiff).not.toMatch(
      /\.from\([^)]*\)[\s\S]{0,80}\.(?:insert|update|delete)\(/,
    );
  });
});
