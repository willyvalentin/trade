import { expect, test } from "@playwright/test";

import {
  action666fTrainableRequest,
  action666hTrustedLearningBoundary,
} from "@/lib/server/canonical-offline-learning-engine-fixtures";
import {
  action666hMissingOutcomeIntervalBoundary,
  action666hMissingOutcomeIntervalRequest,
  action666hCorrelatedFeaturesBoundary,
  action666hCorrelatedFeaturesRequest,
  action666hNearZeroVarianceBoundary,
  action666hNearZeroVarianceRequest,
  action666hNumericMinimumBoundary,
  action666hNumericMinimumRequest,
  action666hNumericOverflowBoundary,
  action666hNumericOverflowRequest,
  action666hOutcomeCompletionPurgeBoundary,
  action666hOutcomeCompletionPurgeRequest,
  action666hOverlapIsolationBoundary,
  action666hOverlapIsolationRequest,
  action666hSelfConsistentMaliciousBoundary,
  action666hSelfConsistentMaliciousRequest,
  action666hTamperedRegistry,
  action666hUnderflowBoundary,
  action666hUnderflowRequest,
  action666hUnknownRenamedFeatureRequest,
  createTrustedBoundaryForRequest,
} from "@/lib/server/canonical-offline-learning-remediation-fixtures";
import {
  createDefaultOffCanonicalOfflineLearningEngine,
  trainCanonicalOfflineLearningModels,
  verifyCanonicalOfflineLearningResult,
  type CanonicalOfflineLearningRequest,
} from "@/lib/server/canonical-offline-learning-engine";

function train(
  request = action666fTrainableRequest,
  boundary = action666hTrustedLearningBoundary,
) {
  return trainCanonicalOfflineLearningModels(request, boundary);
}

test.describe("Action 666H learning trust and split remediation", () => {
  test("trusted registries are external, versioned and bound through every digest layer", () => {
    const result = train();
    expect(result.status, result.reason_codes.join(",")).toBe("trainable");
    expect(action666fTrainableRequest).not.toHaveProperty(
      "feature_context_registry",
    );
    expect(action666fTrainableRequest).not.toHaveProperty(
      "training_input_registry",
    );
    expect(result.trust_evidence).toEqual({
      feature_context_registry_root_digest:
        action666hTrustedLearningBoundary
          .expected_feature_context_registry_root_digest,
      training_input_manifest_identity:
        action666fTrainableRequest
          .trusted_training_input_manifest_identity,
      training_input_manifest_digest:
        result.dataset?.training_input_manifest_digest,
      training_input_registry_root_digest:
        action666hTrustedLearningBoundary
          .expected_training_input_registry_root_digest,
      trust_source: "version_controlled_synthetic_fixture_registry",
    });
    expect(
      result.models.every(
        (model) =>
          model.feature_context_registry_root_digest ===
            result.trust_evidence
              ?.feature_context_registry_root_digest &&
          model.training_input_manifest_digest ===
            result.trust_evidence?.training_input_manifest_digest &&
          model.training_input_registry_root_digest ===
            result.trust_evidence
              ?.training_input_registry_root_digest,
      ),
    ).toBe(true);
    expect(result.shadow_evaluation_binding).toMatchObject({
      feature_context_registry_root_digest:
        result.trust_evidence?.feature_context_registry_root_digest,
      training_input_manifest_digest:
        result.trust_evidence?.training_input_manifest_digest,
      training_input_registry_root_digest:
        result.trust_evidence?.training_input_registry_root_digest,
    });
  });

  test("unknown, renamed and semantically changed features fail the owned registry root", () => {
    expect(
      train(
        action666hUnknownRenamedFeatureRequest,
        action666hTrustedLearningBoundary,
      ),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining([
        "trusted_feature_membership_mismatch",
        "trusted_training_input_rows_mismatch",
      ]),
    });

    const tamperedBoundary = structuredClone(
      action666hTrustedLearningBoundary,
    );
    tamperedBoundary.feature_context_registry =
      action666hTamperedRegistry;
    expect(train(action666fTrainableRequest, tamperedBoundary)).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining([
        "trusted_feature_context_registry_root_mismatch",
      ]),
    });
  });

  test("regime, sector and provider context require capture evidence and a closed cohort policy", () => {
    const contextTamper = structuredClone(action666fTrainableRequest);
    contextTamper.rows[0].contexts.sector.value = "future_sector";
    expect(train(contextTamper)).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining([
        "trusted_training_input_rows_mismatch",
      ]),
    });

    const incompatible = structuredClone(action666fTrainableRequest);
    incompatible.cohort = "visible_recommendation_quality";
    incompatible.sample_type = "shadow";
    for (const row of incompatible.rows) {
      row.quality_candidate.cohort = "visible_recommendation_quality";
      row.quality_candidate.sample_type = "shadow";
    }
    const incompatibleBoundary = createTrustedBoundaryForRequest({
      request: incompatible,
    });
    expect(train(incompatible, incompatibleBoundary)).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining([
        "sample_cohort_compatibility_not_trusted",
      ]),
    });
  });

  test("self-consistent malicious features, labels and lineage cannot replace the external root anchor", () => {
    const result = train(
      action666hSelfConsistentMaliciousRequest,
      action666hSelfConsistentMaliciousBoundary,
    );
    expect(result).toMatchObject({
      status: "conflicting",
      models: [],
      result_digest: null,
      reason_codes: expect.arrayContaining([
        "trusted_training_input_registry_root_mismatch",
      ]),
    });
    const canonical = train();
    expect(
      verifyCanonicalOfflineLearningResult({
        request: action666hSelfConsistentMaliciousRequest,
        result: canonical,
        trust_boundary: action666hSelfConsistentMaliciousBoundary,
      }),
    ).toMatchObject({
      valid: false,
      canonical_result: null,
      reason_codes: expect.arrayContaining([
        "trusted_training_input_registry_root_mismatch",
      ]),
    });
  });

  test("overlap graph keeps opportunity and evaluator groups off both sides of a split", () => {
    const result = train(
      action666hOverlapIsolationRequest,
      action666hOverlapIsolationBoundary,
    );
    expect(result.status, result.reason_codes.join(",")).toBe("trainable");
    const first = result.splits[0];
    expect(first.purged_days).toContain("2026-06-01");
    const componentByIdentity = new Map(
      result.dataset?.overlap_graph.nodes.map((node) => [
        node.canonical_decision_identity,
        node.component_identity,
      ]),
    );
    for (const split of result.splits) {
      const trainingComponents = new Set(
        split.training_identities.map((identity) =>
          componentByIdentity.get(identity),
        ),
      );
      expect(
        split.test_identities.some((identity) =>
          trainingComponents.has(componentByIdentity.get(identity)),
        ),
      ).toBe(false);
    }
  });

  test("purge and embargo derive from actual outcome completion timestamps", () => {
    const result = train(
      action666hOutcomeCompletionPurgeRequest,
      action666hOutcomeCompletionPurgeBoundary,
    );
    expect(result.status, result.reason_codes.join(",")).toBe("trainable");
    expect(result.splits[0].purged_days).toContain("2026-06-08");
    for (const split of result.splits) {
      const latestTestCompletion = Math.max(
        ...(result.dataset?.rows ?? [])
          .filter((row) => split.test_days.includes(row.decision_day))
          .map((row) => Date.parse(row.outcome_completed_at)),
      );
      expect(Date.parse(split.embargo_until)).toBe(
        latestTestCompletion +
          action666hOutcomeCompletionPurgeRequest.split_policy
            .embargo_minutes *
            60_000,
      );
    }
  });

  test("missing outcome interval is not trainable and never receives a default", () => {
    expect(
      train(
        action666hMissingOutcomeIntervalRequest,
        action666hMissingOutcomeIntervalBoundary,
      ),
    ).toMatchObject({
      status: "not_trainable",
      models: [],
      reason_codes: [
        "canonical_overlap_interval_or_completion_missing",
      ],
    });
  });

  test("max/min finite and overflow paths return structured failures without throwing", () => {
    for (const [request, boundary] of [
      [
        action666hNumericOverflowRequest,
        action666hNumericOverflowBoundary,
      ],
      [
        action666hNumericMinimumRequest,
        action666hNumericMinimumBoundary,
      ],
    ] as const) {
      expect(() => train(request, boundary)).not.toThrow();
      const result = train(request, boundary);
      expect(result).toMatchObject({
        status: "non_reproducible",
        models: [],
      });
      expect([
        "correlation_intermediate_non_finite",
        "standardization_intermediate_non_finite",
      ]).toContain(result.reason_codes[0]);
    }
  });

  test("underflow and near-zero variance remain finite and explicitly diagnosed", () => {
    const underflow = train(
      action666hUnderflowRequest,
      action666hUnderflowBoundary,
    );
    const nearZero = train(
      action666hNearZeroVarianceRequest,
      action666hNearZeroVarianceBoundary,
    );
    for (const result of [underflow, nearZero]) {
      expect(result.status, result.reason_codes.join(",")).toBe("trainable");
      expect(JSON.stringify(result)).not.toContain("NaN");
      expect(JSON.stringify(result)).not.toContain("Infinity");
      expect(
        result.split_model_evidence.some((evidence) =>
          evidence.preprocessing.reason_codes.some((reason) =>
            reason.startsWith("near_zero_variance_feature:"),
          ),
        ),
      ).toBe(true);
    }
  });

  test("disabled and kill-switched modes perform zero request or trust reads", () => {
    let requestReads = 0;
    let registryReads = 0;
    let trainingCalls = 0;
    const request = new Proxy({} as CanonicalOfflineLearningRequest, {
      get() {
        requestReads += 1;
        throw new Error("disabled_request_read");
      },
    });
    const trust = new Proxy(
      {} as typeof action666hTrustedLearningBoundary,
      {
        get() {
          registryReads += 1;
          throw new Error("disabled_registry_read");
        },
      },
    );
    for (const engine of [
      createDefaultOffCanonicalOfflineLearningEngine({
        enabled: false,
        kill_switch_engaged: false,
        trust_boundary: trust,
        train() {
          trainingCalls += 1;
          throw new Error("disabled_training_call");
        },
      }),
      createDefaultOffCanonicalOfflineLearningEngine({
        enabled: true,
        kill_switch_engaged: true,
        trust_boundary: trust,
        train() {
          trainingCalls += 1;
          throw new Error("kill_switched_training_call");
        },
      }),
    ]) {
      const result = engine.run(request);
      expect(result.executed).toBe(false);
      expect(result.execution_counters).toEqual({
        request_reads: 0,
        clones: 0,
        registry_lookups: 0,
        dataset_builds: 0,
        training_iterations: 0,
        predictions: 0,
      });
    }
    expect(requestReads).toBe(0);
    expect(registryReads).toBe(0);
    expect(trainingCalls).toBe(0);
  });

  test("attribution scales distinguish logistic log-odds from canonical R", () => {
    const result = train();
    expect(result.status).toBe("trainable");
    for (const prediction of result.predictions) {
      const local = prediction.local_prediction_contribution;
      if (
        prediction.family ===
        "regularized_logistic_target_before_stop"
      ) {
        expect(local.attribution_scale).toBe("log_odds");
        expect(local.attribution_unit).toBe(
          "log_odds_target_before_stop",
        );
        expect(local.probability_delta).not.toBeNull();
      } else {
        expect(local.attribution_scale).toBe("canonical_r");
        expect(local.attribution_unit).toBe(
          "r_target_before_stop_cost_adjusted",
        );
        expect(local.probability_delta).toBeNull();
      }
    }
  });

  test("training-window correlation diagnostics are deterministic and non-causal", () => {
    const first = train(
      action666hCorrelatedFeaturesRequest,
      action666hCorrelatedFeaturesBoundary,
    );
    const second = train(
      structuredClone(action666hCorrelatedFeaturesRequest),
      action666hCorrelatedFeaturesBoundary,
    );
    expect(second.correlation_evidence).toEqual(
      first.correlation_evidence,
    );
    expect(first.correlation_evidence).toHaveLength(
      first.splits.length,
    );
    expect(
      first.correlation_evidence.every(
        (item) =>
          item.causal_effect_claimed === false &&
          item.pairs.every((pair) =>
            Number.isFinite(pair.pearson_correlation),
          ),
      ),
    ).toBe(true);
    expect(
      first.correlation_evidence.some((item) =>
        item.reason_codes.includes(
          "strong_feature_correlation_predictive_attribution_unstable",
        ),
      ),
    ).toBe(true);
  });
});
