import { expect, test } from "@playwright/test";

import goldenReport from "@/docs/action-666m-golden-predictive-explanation-report.json";
import {
  action666mAssociationFixture,
  action666mCorrectRejectionFixture,
  action666mCostReversalFixture,
  action666mExplicitNoTradeFixture,
  action666mFalseNegativeFixture,
  action666mFalsePositiveFixture,
  action666mFixtureCases,
  action666mOverconfidenceFixture,
  action666mSuccessfulTradeEngine,
  action666mSuccessfulTradePayload,
  action666mSuccessfulTradeRequest,
  action666mSuccessfulTradeTrustBoundary,
  action666oCreateBasePayload,
  action666oFixtureFromPayload,
} from "@/lib/server/canonical-predictive-outcome-explanation-fixtures";
import {
  CANONICAL_PREDICTIVE_FAILURE_TAXONOMY_VERSION,
  CANONICAL_PREDICTIVE_OUTCOME_EXPLANATION_VERSION,
  CANONICAL_PREDICTIVE_OUTCOME_TAXONOMY,
  CANONICAL_PREDICTIVE_PRIMARY_CLASSIFICATION_POLICY_VERSION,
  CANONICAL_PREDICTIVE_RESEARCH_HYPOTHESIS_VERSION,
  CANONICAL_PREDICTIVE_SENSITIVITY_VERSION,
  canonicalPredictiveOutcomeExplanationDigest,
  createCanonicalPredictiveExplanationEngine,
  createCanonicalPredictiveResearchHypothesis,
  createCanonicalPredictiveTrustedInputPost,
  createCanonicalPredictiveTrustedInputRegistry,
  verifyCanonicalPredictiveOutcomeExplanation,
  type CanonicalPredictiveExplanationExecutionCounters,
  type CanonicalPredictiveOutcomeExplanationResult,
  type CanonicalPredictiveResearchHypothesis,
  type CanonicalPredictiveTrustedInputPayload,
} from "@/lib/server/canonical-predictive-outcome-explanation";

type Fixture = (typeof action666mFixtureCases)[number];

function explain(fixture: Fixture = action666mFixtureCases[0]) {
  if (!fixture.engine.explain) throw new Error("fixture_engine_disabled");
  return fixture.engine.explain(fixture.request);
}

function requireExplanation(fixture: Fixture = action666mFixtureCases[0]) {
  const result = explain(fixture);
  expect(result.status).toBe("explainable");
  expect(result.explanation).not.toBeNull();
  return result.explanation!;
}

function resignOutcomeEvidence(
  payload: ReturnType<typeof action666oCreateBasePayload>,
) {
  const point = payload.outcome_path[0];
  const pointPayload = Object.fromEntries(
    Object.entries(point).filter(([key]) => key !== "evidence_digest"),
  );
  point.evidence_digest =
    canonicalPredictiveOutcomeExplanationDigest(pointPayload);
  payload.outcome_evidence.path_inventory_digest =
    canonicalPredictiveOutcomeExplanationDigest(
      [...payload.outcome_path]
        .sort((first, second) => first.horizon.localeCompare(second.horizon))
        .map((item) => item.evidence_digest),
    );
  const outcomePayload = Object.fromEntries(
    Object.entries(payload.outcome_evidence).filter(
      ([key]) => key !== "evidence_digest",
    ),
  );
  payload.outcome_evidence.evidence_digest =
    canonicalPredictiveOutcomeExplanationDigest(outcomePayload);
}

function counters(): CanonicalPredictiveExplanationExecutionCounters {
  return {
    request_reads: 0,
    clones: 0,
    trust_lookups: 0,
    registry_lookups: 0,
    digest_computations: 0,
    classifications: 0,
    sensitivity_runs: 0,
    outputs_built: 0,
  };
}

function researchHypothesis(
  payload: CanonicalPredictiveTrustedInputPayload,
  statement: string,
) {
  return createCanonicalPredictiveResearchHypothesis({
    canonical_decision_identity: payload.canonical_decision_identity,
    explained_candidate_identity: payload.explained_candidate_identity,
    opportunity_set_identity:
      payload.opportunity_set.opportunity_set_identity,
    statement,
  });
}

function explanationFromPayload(
  name: string,
  payload: CanonicalPredictiveTrustedInputPayload,
) {
  const fixture = action666oFixtureFromPayload({ name, payload });
  if (!fixture.engine.explain) throw new Error("fixture_engine_disabled");
  return {
    fixture,
    result: fixture.engine.explain(fixture.request),
  };
}

type RuntimePath = Array<string | number>;

function runtimeRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function runtimeObjectFieldPaths(
  value: unknown,
  path: RuntimePath = [],
): RuntimePath[] {
  if (Array.isArray(value)) {
    return value.length > 0
      ? runtimeObjectFieldPaths(value[0], [...path, 0])
      : [];
  }
  if (!runtimeRecord(value)) return [];
  return Object.entries(value).flatMap(([key, item]) => {
    const itemPath = [...path, key];
    return [itemPath, ...runtimeObjectFieldPaths(item, itemPath)];
  });
}

function runtimeObjectPaths(
  value: unknown,
  path: RuntimePath = [],
): RuntimePath[] {
  if (Array.isArray(value)) {
    return value.length > 0
      ? runtimeObjectPaths(value[0], [...path, 0])
      : [];
  }
  if (!runtimeRecord(value)) return [];
  return [
    path,
    ...Object.entries(value).flatMap(([key, item]) =>
      runtimeObjectPaths(item, [...path, key]),
    ),
  ];
}

function runtimePathParent(root: unknown, path: RuntimePath) {
  let current = root;
  for (const segment of path.slice(0, -1)) {
    if (typeof segment === "number") {
      if (!Array.isArray(current)) throw new Error("runtime_path_not_array");
      current = current[segment];
    } else {
      if (!runtimeRecord(current)) throw new Error("runtime_path_not_object");
      current = current[segment];
    }
  }
  return current;
}

function runtimePathValue(root: unknown, path: RuntimePath) {
  const parent = runtimePathParent(root, path);
  const key = path[path.length - 1];
  if (typeof key === "number") {
    if (!Array.isArray(parent)) throw new Error("runtime_path_not_array");
    return parent[key];
  }
  if (!runtimeRecord(parent)) throw new Error("runtime_path_not_object");
  return parent[key];
}

function setRuntimePath(root: unknown, path: RuntimePath, value: unknown) {
  const parent = runtimePathParent(root, path);
  const key = path[path.length - 1];
  if (typeof key === "number") {
    if (!Array.isArray(parent)) throw new Error("runtime_path_not_array");
    parent[key] = value;
    return;
  }
  if (!runtimeRecord(parent)) throw new Error("runtime_path_not_object");
  parent[key] = value;
}

function deleteRuntimePath(root: unknown, path: RuntimePath) {
  const parent = runtimePathParent(root, path);
  const key = path[path.length - 1];
  if (typeof key === "number") {
    if (!Array.isArray(parent)) throw new Error("runtime_path_not_array");
    parent.splice(key, 1);
    return;
  }
  if (!runtimeRecord(parent)) throw new Error("runtime_path_not_object");
  delete parent[key];
}

function invalidRuntimeValue(value: unknown): unknown {
  if (typeof value === "string") return 0;
  if (typeof value === "number") return "not-a-number";
  if (typeof value === "boolean") return "not-a-boolean";
  if (Array.isArray(value)) return { not: "an-array" };
  if (runtimeRecord(value)) return "not-an-object";
  return { not: "nullable" };
}

function runtimeResultForPayload(value: unknown) {
  const post = createCanonicalPredictiveTrustedInputPost({
    trusted_input_identity: "trusted-input:runtime-shape-adversary",
    payload: value as CanonicalPredictiveTrustedInputPayload,
  });
  const registry = createCanonicalPredictiveTrustedInputRegistry([post]);
  const engine = createCanonicalPredictiveExplanationEngine({
    enabled: true,
    kill_switch: false,
    trust_boundary: {
      trust_source: "version_controlled_synthetic_explanation_registry",
      registry,
      expected_registry_root_digest: registry.root_digest,
    },
  });
  if (!engine.explain) throw new Error("runtime_shape_engine_disabled");
  return engine.explain({
    evidence_class: "synthetic_fixture_only",
    trusted_input_identity: post.trusted_input_identity,
    trusted_input_digest: post.semantic_digest,
  });
}

test.describe("Action 666M/O predictive outcome explanation", () => {
  test("fixture matrix is fail-closed with expected statuses", () => {
    for (const fixture of action666mFixtureCases) {
      expect(explain(fixture).status, fixture.name).toBe(
        fixture.expected_status,
      );
    }
  });

  test("golden report has byte-level digest parity for every successful scenario", () => {
    expect(goldenReport).toMatchObject({
      report_version:
        "action_666t_golden_predictive_explanation_report_v1",
      research_hypothesis_version:
        CANONICAL_PREDICTIVE_RESEARCH_HYPOTHESIS_VERSION,
      synthetic_evidence: true,
      not_ture_performance: true,
      not_publishable: true,
      shadow_only: true,
      live_ranking_effect: false,
      automatic_promotion_allowed: false,
      causal_claimed: false,
    });
    const expected = action666mFixtureCases
      .map((fixture) => ({
        name: fixture.name,
        result: explain(fixture),
      }))
      .filter(({ result }) => result.explanation)
      .map(({ name, result }) => ({
        name,
        status: result.status,
        canonical_explanation_digest:
          result.explanation!.canonical_explanation_digest,
        canonical_result_bytes_sha256:
          canonicalPredictiveOutcomeExplanationDigest(result),
      }));
    expect(goldenReport.successful_explanations).toEqual(expected);
  });

  test("successful explanation binds external registry root and all safety flags", () => {
    const explanation = requireExplanation();
    expect(explanation).toMatchObject({
      contract_version: CANONICAL_PREDICTIVE_OUTCOME_EXPLANATION_VERSION,
      taxonomy_version: CANONICAL_PREDICTIVE_FAILURE_TAXONOMY_VERSION,
      primary_classification_policy_version:
        CANONICAL_PREDICTIVE_PRIMARY_CLASSIFICATION_POLICY_VERSION,
      trusted_registry_root_digest:
        action666mFixtureCases[0].trustBoundary.registry.root_digest,
      primary_classification: "correct_positive_trade",
      shadow_only: true,
      live_ranking_effect: false,
      automatic_promotion_allowed: false,
      automatic_parameter_change_allowed: false,
      automatic_threshold_change_allowed: false,
      automatic_model_change_allowed: false,
      external_ai_canonical_truth_authority: false,
      research_hypotheses_affect_ranking: false,
      causal_claimed: false,
      synthetic_evidence: true,
      not_publishable: true,
    });
  });

  test("Major 1 positive: request only carries trusted post reference", () => {
    expect(action666mSuccessfulTradeRequest).toEqual({
      evidence_class: "synthetic_fixture_only",
      trusted_input_identity: expect.any(String),
      trusted_input_digest: expect.stringMatching(/^[0-9a-f]{64}$/),
    });
    expect(action666mSuccessfulTradeRequest).not.toHaveProperty(
      "feature_context_registry_root_digest",
    );
    expect(action666mSuccessfulTradeRequest).not.toHaveProperty(
      "training_input_registry_root_digest",
    );
  });

  test("Major 1 negative: wrong external root and caller replacement digest fail closed", () => {
    const wrongRootEngine = createCanonicalPredictiveExplanationEngine({
      enabled: true,
      kill_switch: false,
      trust_boundary: {
        ...action666mSuccessfulTradeTrustBoundary,
        expected_registry_root_digest: "a".repeat(64),
      },
    });
    expect(wrongRootEngine.explain!(action666mSuccessfulTradeRequest)).toMatchObject({
      status: "conflicting",
      explanation: null,
      reason_codes: expect.arrayContaining([
        "trusted_explanation_registry_or_root_conflicting",
      ]),
    });
    expect(
      action666mSuccessfulTradeEngine.explain!({
        ...action666mSuccessfulTradeRequest,
        trusted_input_digest: "b".repeat(64),
      }),
    ).toMatchObject({
      status: "conflicting",
      explanation: null,
      reason_codes: ["trusted_explanation_request_digest_conflicting"],
    });
  });

  test("Major 1 negative: self-consistent altered post cannot retain the frozen root", () => {
    const payload = structuredClone(action666mSuccessfulTradePayload);
    payload.context_evidence.regime = "tampered-regime";
    const alteredPost = createCanonicalPredictiveTrustedInputPost({
      trusted_input_identity:
        action666mSuccessfulTradeRequest.trusted_input_identity,
      payload,
    });
    const alteredRegistry =
      createCanonicalPredictiveTrustedInputRegistry([alteredPost]);
    const engine = createCanonicalPredictiveExplanationEngine({
      enabled: true,
      kill_switch: false,
      trust_boundary: {
        trust_source: "version_controlled_synthetic_explanation_registry",
        registry: alteredRegistry,
        expected_registry_root_digest:
          action666mSuccessfulTradeTrustBoundary.registry.root_digest,
      },
    });
    expect(
      engine.explain!({
        ...action666mSuccessfulTradeRequest,
        trusted_input_digest: alteredPost.semantic_digest,
      }),
    ).toMatchObject({
      status: "conflicting",
      explanation: null,
    });
  });

  test("Major 2 positive: model artifact reproduces OOS probability and attribution", () => {
    const explanation = requireExplanation();
    expect(explanation.prediction_digest).toBe(
      action666mSuccessfulTradePayload.model_result.oos_prediction
        .semantic_digest,
    );
    expect(explanation.candidate_model.model_artifact_digest).toBe(
      action666mSuccessfulTradePayload.model_result
        .candidate_model_artifact_digest,
    );
    expect(explanation.sensitivity.threshold_policy_digest).toBe(
      action666mSuccessfulTradePayload.model_result.threshold_policy
        .semantic_digest,
    );
  });

  test("Major 2 negative: re-signed prediction or model feature drift is non-reproducible", () => {
    const payload = action666oCreateBasePayload();
    payload.model_result.oos_prediction.prediction = 0.99;
    const fixture = action666oFixtureFromPayload({
      name: "resigned-prediction-drift",
      payload,
    });
    expect(fixture.engine.explain!(fixture.request)).toMatchObject({
      status: "non_reproducible",
      explanation: null,
      reason_codes: expect.arrayContaining([
        "prediction_model_rebuild_non_reproducible",
      ]),
    });

    const featurePayload = action666oCreateBasePayload();
    featurePayload.model_result.candidate_model_artifact_payload.features[0]
      .standardized_coefficient = 0.9;
    const featureFixture = action666oFixtureFromPayload({
      name: "model-feature-drift",
      payload: featurePayload,
    });
    expect(featureFixture.engine.explain!(featureFixture.request).status).toBe(
      "non_reproducible",
    );
  });

  test("Major 3 positive: temporal outcome, cost and calibration lineage is complete", () => {
    const explanation = requireExplanation();
    expect(
      explanation.outcome_path.every(
        (point) =>
          point.point_in_time_eligible &&
          point.evaluator_input_identity ===
            explanation.outcome_evidence.evaluator_input_identity,
      ),
    ).toBe(true);
    expect(explanation.cost_evidence.evaluator_input_identity).toBe(
      explanation.outcome_evidence.evaluator_input_identity,
    );
    expect(explanation.calibration_bucket).toMatchObject({
      evidence_version: "canonical_explanation_calibration_evidence_v1",
      cohort: "shadow_recommendation_quality",
      denominator_count: 100,
    });
  });

  test("Major 3 negative: self-consistent future path and removed cost fail closed", () => {
    const future = action666oCreateBasePayload();
    future.outcome_path[0].event_timestamp =
      "2026-07-26T14:00:00.000Z";
    resignOutcomeEvidence(future);
    const futureFixture = action666oFixtureFromPayload({
      name: "future-outcome-path",
      payload: future,
    });
    expect(futureFixture.engine.explain!(futureFixture.request)).toMatchObject({
      status: "not_point_in_time_safe",
      explanation: null,
    });

    const missingCost = action666oCreateBasePayload() as unknown as Record<
      string,
      unknown
    >;
    delete missingCost.cost_evidence;
    const missingCostFixture = action666oFixtureFromPayload({
      name: "missing-cost",
      payload: missingCost as never,
    });
    expect(
      missingCostFixture.engine.explain!(missingCostFixture.request),
    ).toMatchObject({
      status: "insufficient_evidence",
      explanation: null,
      reason_codes: expect.arrayContaining([
        "authoritative_cost_evidence_missing",
      ]),
    });
  });

  test("Major 3 boundary: malformed timestamps fail closed without throwing", () => {
    const malformed = action666oCreateBasePayload();
    malformed.outcome_path[0].event_timestamp = "not-a-timestamp";
    resignOutcomeEvidence(malformed);
    const fixture = action666oFixtureFromPayload({
      name: "malformed-outcome-timestamp",
      payload: malformed,
    });
    expect(() => fixture.engine.explain!(fixture.request)).not.toThrow();
    expect(fixture.engine.explain!(fixture.request)).toMatchObject({
      status: "not_point_in_time_safe",
      explanation: null,
    });
  });

  test("Major 3 negative: calibration cannot be re-signed without trusted metrics semantics", () => {
    const payload = action666oCreateBasePayload();
    payload.model_result.calibration_evidence.denominator_count = 10;
    payload.model_result.calibration_evidence.count = 20;
    const fixture = action666oFixtureFromPayload({
      name: "calibration-denominator-drift",
      payload,
    });
    expect(fixture.engine.explain!(fixture.request)).toMatchObject({
      status: "conflicting",
      explanation: null,
      reason_codes: expect.arrayContaining([
        "trusted_calibration_evidence_conflicting",
      ]),
    });
  });

  test("Major 4: exactly one primary classification covers all eight combinations", () => {
    const fixtures = [
      action666oCreateBasePayload({
        candidateIndex: 0,
        probability: 0.82,
        disposition: "published_trade",
      }),
      action666oCreateBasePayload({
        candidateIndex: 1,
        probability: 0.82,
        disposition: "published_trade",
      }),
      action666oCreateBasePayload({
        candidateIndex: 2,
        probability: 0.82,
        disposition: "rejected_candidate",
      }),
      action666oCreateBasePayload({
        candidateIndex: 3,
        probability: 0.82,
        disposition: "rejected_candidate",
      }),
      action666oCreateBasePayload({
        candidateIndex: 0,
        probability: 0.3,
        disposition: "published_trade",
      }),
      action666oCreateBasePayload({
        candidateIndex: 1,
        probability: 0.3,
        disposition: "published_trade",
      }),
      action666oCreateBasePayload({
        candidateIndex: 2,
        probability: 0.3,
        disposition: "rejected_candidate",
      }),
      action666oCreateBasePayload({
        candidateIndex: 3,
        probability: 0.3,
        disposition: "rejected_candidate",
      }),
    ].map((payload, index) =>
      action666oFixtureFromPayload({
        name: `primary-table-${index}`,
        payload,
      }),
    );
    const primaries = fixtures.map((fixture) => {
      const result = fixture.engine.explain!(fixture.request);
      expect(result.status).toBe("explainable");
      expect(
        result.explanation!.taxonomy_codes.filter((code) =>
          [
            "correct_positive_trade",
            "correct_rejection_or_no_trade",
            "false_positive",
            "false_negative",
            "correct_positive_override",
            "correct_rejection_override",
            "false_positive_override",
            "false_negative_override",
          ].includes(code),
        ),
      ).toHaveLength(1);
      return result.explanation!.primary_classification;
    });
    expect(new Set(primaries).size).toBe(8);
  });

  test("Major 4: gross-positive/net-negative is false positive, not correct positive", () => {
    const explanation = requireExplanation(action666mCostReversalFixture);
    expect(explanation.primary_classification).toBe("false_positive");
    expect(explanation.taxonomy_codes).toContain(
      "edge_consumed_by_cost_or_slippage",
    );
    expect(explanation.taxonomy_codes).not.toContain("correct_positive_trade");
  });

  test("Major 5: disabled and kill-switched factories expose null builders and do zero work", () => {
    for (const configuration of [
      { enabled: false, kill_switch: false },
      { enabled: true, kill_switch: true },
    ]) {
      const executionCounters = counters();
      const engine = createCanonicalPredictiveExplanationEngine({
        ...configuration,
        trust_boundary: action666mSuccessfulTradeTrustBoundary,
        counters: executionCounters,
      });
      expect(engine).toMatchObject({
        enabled: false,
        build: null,
        explain: null,
        counters: {
          request_reads: 0,
          clones: 0,
          trust_lookups: 0,
          registry_lookups: 0,
          digest_computations: 0,
          classifications: 0,
          sensitivity_runs: 0,
          outputs_built: 0,
        },
      });
    }
  });

  test("Action 666CJ remediation: kill switch must be the literal boolean false", () => {
    const runtimeConfigurations: Array<Record<string, unknown>> = [
      { enabled: true },
      { enabled: true, kill_switch: undefined },
      { enabled: true, kill_switch: null },
      { enabled: true, kill_switch: 0 },
      { enabled: true, kill_switch: 1 },
      { enabled: true, kill_switch: "false" },
      { enabled: true, kill_switch: "true" },
      { enabled: true, kill_switch: {} },
      { enabled: true, kill_switch: [] },
    ];

    for (const configuration of runtimeConfigurations) {
      let trustReads = 0;
      const inaccessibleBoundary = new Proxy(
        action666mSuccessfulTradeTrustBoundary,
        {
          get() {
            trustReads += 1;
            throw new Error("invalid_kill_switch_touched_trust_boundary");
          },
        },
      );
      const executionCounters = counters();
      const engine = createCanonicalPredictiveExplanationEngine({
        ...configuration,
        trust_boundary: inaccessibleBoundary,
        counters: executionCounters,
      } as never);
      expect(engine, JSON.stringify(configuration)).toMatchObject({
        enabled: false,
        build: null,
        explain: null,
        counters: counters(),
      });
      expect(trustReads, JSON.stringify(configuration)).toBe(0);
    }
  });

  test("Action 666CJ remediation: registry is an immutable construction-time snapshot", () => {
    const boundary = structuredClone(
      action666mSuccessfulTradeTrustBoundary,
    );
    const originalRoot = boundary.registry.root_digest;
    const engine = createCanonicalPredictiveExplanationEngine({
      enabled: true,
      kill_switch: false,
      trust_boundary: boundary,
    });
    if (!engine.explain) throw new Error("snapshot_engine_disabled");

    const replacement = structuredClone(action666mFalsePositiveFixture.post);
    const replacementRegistry =
      createCanonicalPredictiveTrustedInputRegistry([replacement]);
    boundary.registry.posts = [replacement];
    boundary.registry.root_digest = replacementRegistry.root_digest;
    boundary.expected_registry_root_digest = replacementRegistry.root_digest;
    replacement.payload.canonical_decision_identity =
      "decision:mutated-after-construction";

    const original = engine.explain(action666mSuccessfulTradeRequest);
    expect(original).toMatchObject({
      status: "explainable",
      explanation: {
        trusted_registry_root_digest: originalRoot,
        primary_classification: "correct_positive_trade",
      },
    });
    expect(engine.explain(action666mFalsePositiveFixture.request)).toMatchObject({
      status: "conflicting",
      explanation: null,
      reason_codes: ["trusted_explanation_input_unknown"],
    });
  });

  test("Action 666CJ remediation: every malformed trusted shape fails closed without throwing", () => {
    const baseline: unknown = structuredClone(
      action666mSuccessfulTradePayload,
    );
    const fieldPaths = runtimeObjectFieldPaths(baseline);
    const objectPaths = runtimeObjectPaths(baseline);
    let mutationCount = 0;

    for (const path of fieldPaths) {
      const deleted = structuredClone(baseline);
      deleteRuntimePath(deleted, path);
      const deletedResult = runtimeResultForPayload(deleted);
      expect(deletedResult.explanation, `delete:${path.join(".")}`).toBeNull();
      expect(deletedResult.status, `delete:${path.join(".")}`).not.toBe(
        "explainable",
      );
      mutationCount += 1;

      const wrongType = structuredClone(baseline);
      setRuntimePath(
        wrongType,
        path,
        invalidRuntimeValue(runtimePathValue(wrongType, path)),
      );
      const wrongTypeResult = runtimeResultForPayload(wrongType);
      expect(
        wrongTypeResult.explanation,
        `wrong-type:${path.join(".")}`,
      ).toBeNull();
      expect(
        wrongTypeResult.status,
        `wrong-type:${path.join(".")}`,
      ).not.toBe("explainable");
      mutationCount += 1;
    }

    for (const path of objectPaths) {
      const extra = structuredClone(baseline);
      let target: unknown = extra;
      for (const segment of path) {
        if (typeof segment === "number") {
          if (!Array.isArray(target)) throw new Error("extra_path_not_array");
          target = target[segment];
        } else {
          if (!runtimeRecord(target)) throw new Error("extra_path_not_object");
          target = target[segment];
        }
      }
      if (!runtimeRecord(target)) throw new Error("extra_target_not_object");
      target.__unexpected_runtime_field = true;
      const result = runtimeResultForPayload(extra);
      expect(result.explanation, `extra:${path.join(".")}`).toBeNull();
      expect(result.status, `extra:${path.join(".")}`).not.toBe(
        "explainable",
      );
      mutationCount += 1;
    }

    expect(mutationCount).toBe(707);
  });

  test("Action 666CJ remediation: malformed requests return structured failures", () => {
    const requests: unknown[] = [
      null,
      [],
      {},
      {
        ...action666mSuccessfulTradeRequest,
        unexpected: true,
      },
      {
        ...action666mSuccessfulTradeRequest,
        trusted_input_digest: 0,
      },
      {
        ...action666mSuccessfulTradeRequest,
        trusted_input_identity: null,
      },
    ];
    for (const request of requests) {
      const result = action666mSuccessfulTradeEngine.explain!(request as never);
      expect(result).toMatchObject({
        status: "conflicting",
        explanation: null,
        reason_codes: [
          "trusted_explanation_request_runtime_shape_conflicting",
        ],
      });
    }
  });

  test("Minor 1: sensitivity is model-derived and threshold-policy-bound", () => {
    const explanation = requireExplanation();
    expect(explanation.sensitivity).toMatchObject({
      sensitivity_version: CANONICAL_PREDICTIVE_SENSITIVITY_VERSION,
      threshold_policy_identity: "threshold-policy:action-666o-fixture",
      causal_claimed: false,
    });
    expect(explanation.sensitivity.threshold_crossing).toHaveLength(3);
  });

  test("Minor 1 negative: duplicate threshold variants and rounding drift are rejected", () => {
    const duplicate = action666oCreateBasePayload();
    duplicate.model_result.threshold_policy.allowed_threshold_variants = [
      0.5,
      0.5,
    ];
    const duplicateFixture = action666oFixtureFromPayload({
      name: "duplicate-threshold",
      payload: duplicate,
    });
    expect(
      duplicateFixture.engine.explain!(duplicateFixture.request),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining(["threshold_policy_conflicting"]),
    });

    const precision = action666oCreateBasePayload();
    precision.model_result.threshold_policy.allowed_threshold_variants = [
      0.7,
      0.7000000000001,
    ];
    const precisionFixture = action666oFixtureFromPayload({
      name: "threshold-precision-drift",
      payload: precision,
    });
    expect(precisionFixture.engine.explain!(precisionFixture.request).status)
      .toBe("conflicting");
  });

  test("Minor 1 boundary: extreme model arithmetic fails closed", () => {
    const extreme = action666oCreateBasePayload();
    extreme.model_result.candidate_model_artifact_payload.intercept =
      Number.MAX_VALUE;
    extreme.model_result.candidate_model_artifact_payload.features[0]
      .log_odds_contribution = Number.MAX_VALUE;
    const fixture = action666oFixtureFromPayload({
      name: "extreme-model-arithmetic",
      payload: extreme,
    });
    expect(() => fixture.engine.explain!(fixture.request)).not.toThrow();
    expect(fixture.engine.explain!(fixture.request).status).toBe(
      "non_reproducible",
    );
  });

  test("Minor 2: correlated feature warnings accompany attribution without causal claims", () => {
    const explanation = requireExplanation();
    expect(explanation.correlation_warnings).toHaveLength(1);
    const attribution = explanation.evidence.filter(
      (item) => item.evidence_kind === "predictive_attribution",
    );
    expect(
      attribution.every(
        (item) =>
          item.statement.includes("correlation") &&
          !item.statement.toLowerCase().includes("caused"),
      ),
    ).toBe(true);
    expect(explanation.causal_claimed).toBe(false);
  });

  test("Minor 3: duplicate feature and ablation identities fail closed", () => {
    const duplicateFeature = action666oCreateBasePayload();
    duplicateFeature.model_result.candidate_model_artifact_payload.features.push(
      structuredClone(
        duplicateFeature.model_result.candidate_model_artifact_payload
          .features[0],
      ),
    );
    duplicateFeature.model_result.candidate_model_artifact_payload
      .feature_order.push("momentum_strength");
    const featureFixture = action666oFixtureFromPayload({
      name: "duplicate-feature",
      payload: duplicateFeature,
    });
    expect(["conflicting", "non_reproducible"]).toContain(
      featureFixture.engine.explain!(featureFixture.request).status,
    );

    const duplicateAblation = action666oCreateBasePayload();
    duplicateAblation.model_result.feature_ablation.push(
      structuredClone(duplicateAblation.model_result.feature_ablation[0]),
    );
    const ablationFixture = action666oFixtureFromPayload({
      name: "duplicate-ablation",
      payload: duplicateAblation,
    });
    expect(ablationFixture.engine.explain!(ablationFixture.request)).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining([
        "feature_ablation_identity_or_model_binding_conflicting",
      ]),
    });
  });

  test("primary and secondary taxonomies are closed and versioned", () => {
    expect(CANONICAL_PREDICTIVE_OUTCOME_TAXONOMY).toEqual(
      expect.arrayContaining([
        "correct_positive_trade",
        "correct_rejection_or_no_trade",
        "false_positive",
        "false_negative",
        "edge_consumed_by_cost_or_slippage",
        "regime_associated_mismatch",
        "calibration_overconfidence",
        "opportunity_cost_miss",
        "conflicting_evidence",
      ]),
    );
  });

  test("false positive, false negative, rejection and no-trade remain distinct", () => {
    expect(requireExplanation(action666mFalsePositiveFixture)
      .primary_classification).toBe("false_positive");
    expect(requireExplanation(action666mFalseNegativeFixture)
      .primary_classification).toBe("false_negative_override");
    expect(requireExplanation(action666mCorrectRejectionFixture)
      .primary_classification).toBe("correct_rejection_or_no_trade");
    expect(requireExplanation(action666mExplicitNoTradeFixture)
      .decision_disposition).toBe("explicit_no_trade");
  });

  test("regime/sector and calibration remain association-only diagnostics", () => {
    const association = requireExplanation(action666mAssociationFixture);
    expect(association.secondary_diagnostics).toEqual(
      expect.arrayContaining([
        "regime_associated_mismatch",
        "sector_associated_mismatch",
      ]),
    );
    expect(
      requireExplanation(action666mOverconfidenceFixture)
        .secondary_diagnostics,
    ).toContain("calibration_overconfidence");
    expect(association.causal_claimed).toBe(false);
  });

  test("evidence kinds cannot elevate attribution, sensitivity or hypotheses to truth", () => {
    const kinds = new Set(
      requireExplanation().evidence.map((item) => item.evidence_kind),
    );
    expect(kinds).toEqual(
      new Set([
        "observed_fact",
        "canonical_derived_fact",
        "predictive_attribution",
        "counterfactual_sensitivity",
        "research_hypothesis",
      ]),
    );
  });

  test("Action 666T: two deep-frozen hypotheses canonicalize without mutation or order drift", () => {
    const firstPayload = action666oCreateBasePayload();
    const first = researchHypothesis(
      firstPayload,
      "Research-only: validate sector stability in a separately frozen OOS cohort.",
    );
    const second = researchHypothesis(
      firstPayload,
      "Research-only: validate regime stability in a separately frozen OOS cohort.",
    );
    firstPayload.research_hypotheses = [first, second];
    const firstFixture = action666oFixtureFromPayload({
      name: "two-frozen-hypotheses",
      payload: firstPayload,
    });
    expect(Object.isFrozen(firstFixture.post.payload.research_hypotheses)).toBe(
      true,
    );
    expect(
      firstFixture.post.payload.research_hypotheses.every(Object.isFrozen),
    ).toBe(true);
    const before = JSON.stringify(firstFixture.post.payload);
    const firstResult = firstFixture.engine.explain!(firstFixture.request);
    expect(firstResult.status).toBe("explainable");
    expect(JSON.stringify(firstFixture.post.payload)).toBe(before);

    const reorderedPayload = action666oCreateBasePayload();
    reorderedPayload.research_hypotheses = [second, first];
    const reordered = explanationFromPayload(
      "two-frozen-hypotheses",
      reorderedPayload,
    ).result;
    expect(JSON.stringify(reordered)).toBe(JSON.stringify(firstResult));
  });

  test("Action 666T: many unique hypotheses retain stable identities and research-only semantics", () => {
    const payload = action666oCreateBasePayload();
    payload.research_hypotheses = Array.from({ length: 12 }, (_, index) =>
      researchHypothesis(
        payload,
        `Research-only: frozen follow-up hypothesis ${String(index).padStart(2, "0")}.`,
      ),
    ).reverse();
    const { result } = explanationFromPayload("many-hypotheses", payload);
    expect(result.status).toBe("explainable");
    const hypothesisEvidence = result.explanation!.evidence.filter(
      (item) => item.evidence_kind === "research_hypothesis",
    );
    expect(hypothesisEvidence).toHaveLength(12);
    expect(
      hypothesisEvidence.map((item) => item.evidence_code),
    ).toEqual(
      [...hypothesisEvidence]
        .map((item) => item.evidence_code)
        .sort((first, second) => first.localeCompare(second)),
    );
    expect(result).toMatchObject({
      research_hypotheses_affect_ranking: false,
      live_ranking_effect: false,
      automatic_promotion_allowed: false,
      causal_claimed: false,
    });
  });

  test("Action 666T: duplicate hypothesis identities fail closed for identical and conflicting bytes", () => {
    const identicalPayload = action666oCreateBasePayload();
    const hypothesis = researchHypothesis(
      identicalPayload,
      "Research-only: duplicate identity probe.",
    );
    identicalPayload.research_hypotheses = [hypothesis, hypothesis];
    const identical = explanationFromPayload(
      "duplicate-identical-hypothesis",
      identicalPayload,
    ).result;
    expect(identical).toMatchObject({
      status: "conflicting",
      reason_codes: ["duplicate_research_hypothesis_identity"],
    });

    const conflictingPayload = action666oCreateBasePayload();
    const original = researchHypothesis(
      conflictingPayload,
      "Research-only: original identity-bound statement.",
    );
    const conflictingStatement =
      "Research-only: conflicting bytes under the original identity.";
    const conflicting: CanonicalPredictiveResearchHypothesis = {
      hypothesis_version:
        CANONICAL_PREDICTIVE_RESEARCH_HYPOTHESIS_VERSION,
      hypothesis_identity: original.hypothesis_identity,
      statement: conflictingStatement,
      semantic_digest: canonicalPredictiveOutcomeExplanationDigest({
        hypothesis_version:
          CANONICAL_PREDICTIVE_RESEARCH_HYPOTHESIS_VERSION,
        hypothesis_identity: original.hypothesis_identity,
        statement: conflictingStatement,
      }),
    };
    conflictingPayload.research_hypotheses = [original, conflicting];
    const conflictResult = explanationFromPayload(
      "duplicate-conflicting-hypothesis",
      conflictingPayload,
    ).result;
    expect(conflictResult.status).toBe("conflicting");
    expect(conflictResult.reason_codes).toEqual(
      expect.arrayContaining([
        "conflicting_research_hypothesis_identity",
        "research_hypothesis_identity_conflicting",
      ]),
    );
  });

  test("Action 666T: malformed hypotheses fail closed while an empty list is valid", () => {
    const malformedPayload = action666oCreateBasePayload();
    malformedPayload.research_hypotheses = [
      {
        hypothesis_version:
          CANONICAL_PREDICTIVE_RESEARCH_HYPOTHESIS_VERSION,
        hypothesis_identity: "",
        statement: "Research-only: malformed identity.",
        semantic_digest: "not-a-sha",
      },
    ];
    expect(
      explanationFromPayload("malformed-hypothesis", malformedPayload).result,
    ).toMatchObject({
      status: "conflicting",
      reason_codes: ["research_hypothesis_malformed"],
    });

    const emptyPayload = action666oCreateBasePayload();
    emptyPayload.research_hypotheses = [];
    const empty = explanationFromPayload("empty-hypotheses", emptyPayload)
      .result;
    expect(empty.status).toBe("explainable");
    expect(
      empty.explanation!.evidence.filter(
        (item) => item.evidence_kind === "research_hypothesis",
      ),
    ).toHaveLength(0);
  });

  test("Action 666T: semantic hypothesis changes alter the canonical explanation digest", () => {
    const firstPayload = action666oCreateBasePayload();
    firstPayload.research_hypotheses = [
      researchHypothesis(
        firstPayload,
        "Research-only: first semantic hypothesis.",
      ),
    ];
    const secondPayload = action666oCreateBasePayload();
    secondPayload.research_hypotheses = [
      researchHypothesis(
        secondPayload,
        "Research-only: semantically changed hypothesis.",
      ),
    ];
    const first = explanationFromPayload(
      "hypothesis-semantic-change-a",
      firstPayload,
    ).result;
    const second = explanationFromPayload(
      "hypothesis-semantic-change-b",
      secondPayload,
    ).result;
    expect(first.status).toBe("explainable");
    expect(second.status).toBe("explainable");
    expect(first.explanation!.primary_classification).toBe(
      second.explanation!.primary_classification,
    );
    expect(first.explanation!.canonical_explanation_digest).not.toBe(
      second.explanation!.canonical_explanation_digest,
    );
  });

  test("Action 666T: disabled factory does not read or canonicalize hypotheses", () => {
    let trustReads = 0;
    const inaccessibleTrustBoundary = new Proxy(
      action666mSuccessfulTradeTrustBoundary,
      {
        get() {
          trustReads += 1;
          throw new Error("disabled_engine_touched_trust_boundary");
        },
      },
    );
    const executionCounters = counters();
    const engine = createCanonicalPredictiveExplanationEngine({
      enabled: false,
      kill_switch: false,
      trust_boundary: inaccessibleTrustBoundary,
      counters: executionCounters,
    });
    expect(engine).toMatchObject({
      enabled: false,
      build: null,
      explain: null,
      counters: counters(),
    });
    expect(trustReads).toBe(0);
  });

  test("output tampering and byte-level replay verification fail closed", () => {
    const result = action666mSuccessfulTradeEngine.explain!(
      action666mSuccessfulTradeRequest,
    );
    const tampered = structuredClone(result);
    tampered.explanation!.primary_classification = "false_positive";
    expect(
      verifyCanonicalPredictiveOutcomeExplanation({
        engine: action666mSuccessfulTradeEngine,
        request: action666mSuccessfulTradeRequest,
        explanation_result: tampered,
      }),
    ).toEqual({
      valid: false,
      canonical_result: null,
      reason_codes: ["canonical_predictive_explanation_tampered"],
    });
  });

  test("input order, retry, immutability and deep-freeze are deterministic", () => {
    const before = JSON.stringify(action666mSuccessfulTradeRequest);
    const first = action666mSuccessfulTradeEngine.explain!(
      action666mSuccessfulTradeRequest,
    );
    const second = action666mSuccessfulTradeEngine.explain!(
      action666mSuccessfulTradeRequest,
    );
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(JSON.stringify(action666mSuccessfulTradeRequest)).toBe(before);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.explanation)).toBe(true);
    expect(
      verifyCanonicalPredictiveOutcomeExplanation({
        engine: action666mSuccessfulTradeEngine,
        request: action666mSuccessfulTradeRequest,
        explanation_result: first,
      }),
    ).toMatchObject({ valid: true });
  });

  test("trusted registry post ordering does not change its external root", () => {
    const first = action666mFixtureCases[0].post;
    const second = action666mFixtureCases[1].post;
    expect(
      createCanonicalPredictiveTrustedInputRegistry([first, second])
        .root_digest,
    ).toBe(
      createCanonicalPredictiveTrustedInputRegistry([second, first])
        .root_digest,
    );
  });

  test("no live-effect flag can be promoted by fixture results", () => {
    const result: CanonicalPredictiveOutcomeExplanationResult =
      action666mSuccessfulTradeEngine.explain!(
        action666mSuccessfulTradeRequest,
      );
    expect(result).toMatchObject({
      shadow_only: true,
      live_ranking_effect: false,
      automatic_promotion_allowed: false,
      automatic_parameter_change_allowed: false,
      automatic_threshold_change_allowed: false,
      automatic_model_change_allowed: false,
      external_ai_canonical_truth_authority: false,
      research_hypotheses_affect_ranking: false,
      causal_claimed: false,
      synthetic_evidence: true,
      not_publishable: true,
    });
  });
});
