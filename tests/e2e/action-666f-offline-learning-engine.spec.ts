import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

import { action664fVisibleRow } from "@/lib/canonical-evaluation-quality-read-model-fixtures";
import {
  action666fChangedHyperparameterRequest,
  action666fChangedSeedRequest,
  action666fChangedVersionRequest,
  action666fCohortDriftRequest,
  action666fContradictoryLineageRequest,
  action666fDuplicateIdentityRequest,
  action666fFixtureCases,
  action666fFutureTimestampRequest,
  action666fInsufficientEvidenceRequest,
  action666fLabelImbalanceRequest,
  action666fLeakageFeatureRequest,
  action666fReorderedRequest,
  action666fShuffledLabelsRequest,
  action666fTrainableRequest,
  action666hTrustedLearningBoundary,
} from "@/lib/server/canonical-offline-learning-engine-fixtures";
import {
  createDefaultOffCanonicalOfflineLearningEngine,
  DEFAULT_OFF_OFFLINE_LEARNING_ENGINE_ENABLED,
  trainCanonicalOfflineLearningModels,
  verifyCanonicalOfflineLearningResult,
  type CanonicalCandidateModelArtifact,
  type CanonicalOfflineLearningResult,
} from "@/lib/server/canonical-offline-learning-engine";
import { buildCanonicalEvaluationQualityReadModel } from "@/lib/server/canonical-evaluation-quality-read-model";

function trained(
  request = action666fTrainableRequest,
): CanonicalOfflineLearningResult {
  const result = trainCanonicalOfflineLearningModels(
    request,
    action666hTrustedLearningBoundary,
  );
  expect(result.status, result.reason_codes.join(",")).toBe("trainable");
  if (result.status !== "trainable") {
    throw new Error(result.reason_codes.join(","));
  }
  return result;
}

function run(request: typeof action666fTrainableRequest) {
  return trainCanonicalOfflineLearningModels(
    request,
    action666hTrustedLearningBoundary,
  );
}

function model(
  result: CanonicalOfflineLearningResult,
  family: CanonicalCandidateModelArtifact["family"],
) {
  const found = result.models.find((item) => item.family === family);
  if (!found) throw new Error(`model_missing:${family}`);
  return found;
}

test.describe("Action 666F offline learning engine", () => {
  test("default-off returns before training execution", () => {
    let calls = 0;
    const engine = createDefaultOffCanonicalOfflineLearningEngine({
      train(request) {
        calls += 1;
        return trainCanonicalOfflineLearningModels(
          request,
          action666hTrustedLearningBoundary,
        );
      },
    });

    expect(DEFAULT_OFF_OFFLINE_LEARNING_ENGINE_ENABLED).toBe(false);
    expect(engine.enabled).toBe(false);
    expect(engine.run(action666fTrainableRequest)).toMatchObject({
      status: "not_trainable",
      executed: false,
      evidence_class: "not_inspected_default_off",
      dataset: null,
      models: [],
      predictions: [],
      result_digest: null,
      reason_codes: ["offline_learning_engine_disabled"],
      execution_counters: {
        request_reads: 0,
        clones: 0,
        registry_lookups: 0,
        dataset_builds: 0,
        training_iterations: 0,
        predictions: 0,
      },
      shadow_only: true,
      live_ranking_effect: false,
      automatic_promotion_allowed: false,
      causal_improvement_claimed: false,
    });
    expect(calls).toBe(0);
  });

  test("golden scenario matrix is conflict-first and never emits empty models", () => {
    for (const fixture of action666fFixtureCases) {
      const result = run(fixture.request);
      expect(result.status, fixture.name).toBe(fixture.expected_status);
      if (result.status !== "trainable") {
        expect(result.dataset, fixture.name).toBeNull();
        expect(result.models, fixture.name).toEqual([]);
        expect(result.predictions, fixture.name).toEqual([]);
        expect(result.result_digest, fixture.name).toBeNull();
      }
    }
  });

  test("dataset binds one eligible canonical identity to one opportunity set", () => {
    const result = trained();
    expect(result.dataset).not.toBeNull();
    if (!result.dataset) throw new Error("dataset_missing");

    expect(result.dataset.identity_count).toBe(
      action666fTrainableRequest.rows.length,
    );
    expect(result.dataset.rows).toHaveLength(
      action666fTrainableRequest.rows.length,
    );
    expect(
      new Set(
        result.dataset.rows.map(
          (row) => row.canonical_decision_identity,
        ),
      ).size,
    ).toBe(result.dataset.identity_count);
    expect(
      result.dataset.rows.every(
        (row) =>
          row.opportunity_set_identity.length > 0 &&
          /^[0-9a-f]{64}$/.test(row.opportunity_set_digest),
      ),
    ).toBe(true);
    expect(result.dataset.cohort).toBe("shadow_recommendation_quality");
    expect(result.dataset.sample_type).toBe("shadow");
  });

  test("diagnostic horizons never become extra samples or change training", () => {
    const model = buildCanonicalEvaluationQualityReadModel([
      action664fVisibleRow,
    ]);
    const withDiagnostics = structuredClone(action666fTrainableRequest);
    withDiagnostics.rows[0].quality_candidate.diagnostic_horizons =
      structuredClone(model.candidates[0].diagnostic_horizons);
    expect(
      withDiagnostics.rows[0].quality_candidate.diagnostic_horizons,
    ).toHaveLength(2);

    const baseline = trained();
    const diagnostic = trained(withDiagnostics);
    expect(JSON.stringify(diagnostic)).toBe(JSON.stringify(baseline));
  });

  test("walk-forward is chronological, purged, embargoed and identity-disjoint", () => {
    const result = trained();
    expect(result.splits.length).toBeGreaterThan(1);
    for (const split of result.splits) {
      expect(split.purge_derived_from_outcome_intervals).toBe(true);
      expect(new Date(split.embargo_until).toISOString()).toBe(
        split.embargo_until,
      );
      expect(
        split.training_days.at(-1)! < split.test_days[0],
      ).toBe(true);
      expect(
        split.training_identities.some((identity) =>
          split.test_identities.includes(identity),
        ),
      ).toBe(false);
      expect(split.preprocessing_fit_identity_count).toBe(
        split.training_identities.length,
      );
      const graph = result.dataset?.overlap_graph;
      const componentByIdentity = new Map(
        graph?.nodes.map((node) => [
          node.canonical_decision_identity,
          node.component_identity,
        ]),
      );
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
    expect(result.split_model_evidence).toHaveLength(
      result.splits.length * 2,
    );
    for (const evidence of result.split_model_evidence) {
      const split = result.splits.find(
        (item) => item.split_identity === evidence.split_identity,
      );
      expect(split).toBeDefined();
      expect(evidence.preprocessing.fitted_identity_count).toBe(
        split?.training_identities.length,
      );
      expect(evidence.training_identity_count).toBe(
        split?.training_identities.length,
      );
    }
  });

  test("both transparent regularized reference models are finite and versioned", () => {
    const result = trained();
    expect(result.models.map((item) => item.family).sort()).toEqual([
      "regularized_linear_canonical_r",
      "regularized_logistic_target_before_stop",
    ]);
    for (const artifact of result.models) {
      expect(artifact.artifact_digest).toMatch(/^[0-9a-f]{64}$/);
      expect(artifact.candidate_model_identity).toContain(
        artifact.artifact_digest,
      );
      expect(artifact.feature_order).toEqual(
        [...artifact.feature_order].sort(),
      );
      expect(Number.isFinite(artifact.intercept)).toBe(true);
      expect(
        Object.values(artifact.standardized_coefficients).every(
          Number.isFinite,
        ),
      ).toBe(true);
      expect(artifact.hyperparameters.iterations).toBe(350);
      expect(artifact.hyperparameters.convergence_policy).toBe(
        "fixed_iterations_no_early_stop_v1",
      );
    }
  });

  test("out-of-sample outputs cover split, day, ticker, regime and cohort", () => {
    const result = trained();
    expect(result.predictions.length).toBeGreaterThan(0);
    expect(result.coverage.out_of_sample_predictions).toBe(
      result.predictions.length,
    );
    expect(Object.keys(result.coverage.by_split).length).toBe(
      result.splits.length,
    );
    expect(Object.keys(result.coverage.by_day).length).toBeGreaterThan(1);
    expect(Object.keys(result.coverage.by_ticker).length).toBeGreaterThan(1);
    expect(Object.keys(result.coverage.by_regime).sort()).toEqual([
      "bear",
      "bull",
    ]);
    expect(result.coverage.by_cohort).toEqual({
      shadow_recommendation_quality: result.predictions.length,
    });
  });

  test("calibration uses explicit probability semantics and remains synthetic", () => {
    const result = trained();
    expect(result.calibration_evidence).toMatchObject({
      family: "regularized_logistic_target_before_stop",
      semantics: "probability_target_before_stop",
      not_publishable: true,
      reason_codes: ["synthetic_fixture_evidence_not_publishable"],
    });
    expect(result.calibration_evidence?.brier_score).not.toBeNull();
    expect(result.calibration_evidence?.buckets).toHaveLength(5);
    expect(
      result.predictions
        .filter(
          (prediction) =>
            prediction.family ===
            "regularized_logistic_target_before_stop",
        )
        .every(
          (prediction) =>
            prediction.prediction >= 0 && prediction.prediction <= 1,
        ),
    ).toBe(true);
  });

  test("attribution is predictive, local, ablation-based and never causal", () => {
    const result = trained();
    expect(result.attribution_evidence).toHaveLength(2);
    for (const attribution of result.attribution_evidence) {
      expect(attribution.interpretation).toBe("predictive_association");
      expect(attribution.local_interpretation).toBe(
        "local_prediction_contribution",
      );
      expect(attribution.causal_effect_claimed).toBe(false);
      expect(attribution.ablations).toHaveLength(
        result.dataset?.feature_order.length ?? 0,
      );
      expect(
        attribution.ablations.every(
          (ablation) =>
            Number.isFinite(ablation.original_loss) &&
            Number.isFinite(ablation.ablated_loss) &&
            Number.isFinite(ablation.loss_delta) &&
            ablation.causal_effect_claimed === false,
        ),
      ).toBe(true);
    }
    for (const prediction of result.predictions) {
      const local = prediction.local_prediction_contribution;
      expect(local.predictive_association).toBe(true);
      expect(local.causal_effect_claimed).toBe(false);
      expect(Number.isFinite(local.reconstructed_prediction_scale_value)).toBe(
        true,
      );
    }
  });

  test("real synthetic signal and interactions remain distinct from spurious evidence", () => {
    const result = trained();
    const logistic = result.attribution_evidence.find(
      (item) =>
        item.family === "regularized_logistic_target_before_stop",
    );
    if (!logistic) throw new Error("logistic_attribution_missing");
    expect(Math.abs(logistic.standardized_coefficients.true_signal)).toBeGreaterThan(
      0.01,
    );
    expect(
      Math.abs(logistic.standardized_coefficients.interaction_term),
    ).toBeGreaterThan(0.01);
    expect(
      logistic.ablations.find(
        (item) => item.feature === "spurious_in_sample",
      ),
    ).toBeDefined();
    expect(
      logistic.ablations.find(
        (item) => item.feature === "irrelevant_noise",
      ),
    ).toBeDefined();
  });

  test("leakage and future timestamps fail closed", () => {
    expect(
      run(
        action666fLeakageFeatureRequest,
      ),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining([
        "trusted_feature_membership_mismatch",
        "trusted_training_input_rows_mismatch",
      ]),
    });
    expect(
      run(
        action666fFutureTimestampRequest,
      ),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining([
        "trusted_training_input_rows_mismatch",
      ]),
    });
  });

  test("cohort drift and duplicate identity fail before training", () => {
    expect(
      run(action666fCohortDriftRequest),
    ).toMatchObject({
      status: "conflicting",
      executed: true,
      models: [],
      reason_codes: expect.arrayContaining([
        "trusted_training_input_rows_mismatch",
      ]),
    });
    expect(
      run(
        action666fDuplicateIdentityRequest,
      ),
    ).toMatchObject({
      status: "conflicting",
      models: [],
      reason_codes: expect.arrayContaining([
        "trusted_training_input_rows_mismatch",
      ]),
    });
    expect(
      run(
        action666fContradictoryLineageRequest,
      ),
    ).toMatchObject({
      status: "conflicting",
      models: [],
      reason_codes: expect.arrayContaining([
        "trusted_training_input_rows_mismatch",
      ]),
    });
  });

  test("insufficient evidence and label imbalance yield not_trainable", () => {
    expect(
      run(
        action666fInsufficientEvidenceRequest,
      ),
    ).toMatchObject({
      status: "not_trainable",
      models: [],
      reason_codes: expect.arrayContaining([
        "minimum_identities_not_met",
        "minimum_trading_days_not_met",
      ]),
    });
    expect(
      run(
        action666fLabelImbalanceRequest,
      ),
    ).toMatchObject({
      status: "not_trainable",
      models: [],
      reason_codes: expect.arrayContaining([
        "minimum_negative_outcomes_not_met",
      ]),
    });
  });

  test("input order cannot affect dataset, model, attribution or predictions", () => {
    const ordered = trained();
    const reordered = trained(action666fReorderedRequest);
    expect(JSON.stringify(reordered)).toBe(JSON.stringify(ordered));
  });

  test("same frozen input is byte-identical and remains immutable", () => {
    const before = JSON.stringify(action666fTrainableRequest);
    const first = trained();
    const second = trained(structuredClone(action666fTrainableRequest));

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(JSON.stringify(action666fTrainableRequest)).toBe(before);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.dataset)).toBe(true);
    expect(Object.isFrozen(first.models)).toBe(true);
    expect(Object.isFrozen(first.predictions)).toBe(true);
    expect(Object.isFrozen(first.attribution_evidence)).toBe(true);
  });

  test("seed, hyperparameter and model-contract versions alter model evidence", () => {
    const baseline = trained();
    for (const changedRequest of [
      action666fChangedSeedRequest,
      action666fChangedHyperparameterRequest,
      action666fChangedVersionRequest,
    ]) {
      const changed = trained(changedRequest);
      expect(changed.model_artifact_digest).not.toBe(
        baseline.model_artifact_digest,
      );
      expect(changed.result_digest).not.toBe(baseline.result_digest);
    }
  });

  test("shuffled labels change model and calibration evidence", () => {
    const baseline = trained();
    const shuffled = trained(action666fShuffledLabelsRequest);
    expect(shuffled.dataset_digest).not.toBe(baseline.dataset_digest);
    expect(shuffled.model_artifact_digest).not.toBe(
      baseline.model_artifact_digest,
    );
    expect(shuffled.calibration_evidence?.semantic_digest).not.toBe(
      baseline.calibration_evidence?.semantic_digest,
    );
  });

  test("candidate-model and prediction tampering is detected by deterministic rebuild", () => {
    const canonical = trained();
    const tampered = structuredClone(canonical);
    const logistic = model(
      tampered,
      "regularized_logistic_target_before_stop",
    );
    logistic.standardized_coefficients.true_signal += 0.5;
    tampered.predictions[0].prediction = 0.999;

    expect(
      verifyCanonicalOfflineLearningResult({
        request: action666fTrainableRequest,
        result: tampered,
        trust_boundary: action666hTrustedLearningBoundary,
      }),
    ).toEqual({
      valid: false,
      reason_codes: [
        "offline_learning_result_or_candidate_model_tampered",
      ],
      canonical_result: null,
    });
    expect(
      verifyCanonicalOfflineLearningResult({
        request: action666fTrainableRequest,
        result: canonical,
        trust_boundary: action666hTrustedLearningBoundary,
      }).valid,
    ).toBe(true);
  });

  test("candidate predictions are bound to Action 666 without a live producer", () => {
    const result = trained();
    expect(result.shadow_evaluation_binding).toMatchObject({
      binding_version: "canonical_learning_shadow_binding_v1",
      action_666_evaluation_version:
        "canonical_shadow_ranking_confidence_evaluation_v1",
      dataset_identity: result.dataset?.dataset_identity,
      candidate_model_identities: result.models.map(
        (item) => item.candidate_model_identity,
      ),
      candidate_model_artifact_digests: result.models.map(
        (item) => item.artifact_digest,
      ),
      shadow_only: true,
      live_producer_created: false,
    });
    expect(result.shadow_evaluation_binding?.prediction_digest).toMatch(
      /^[0-9a-f]{64}$/,
    );
  });

  test("no output contains NaN, Infinity or a publish/promotion claim", () => {
    const serialized = JSON.stringify(trained());
    expect(serialized).not.toContain("NaN");
    expect(serialized).not.toContain("Infinity");
    expect(serialized).toContain('"not_publishable":true');
    expect(serialized).toContain('"automatic_promotion_allowed":false');
    expect(serialized).toContain('"causal_improvement_claimed":false');
  });

  test("machine-readable golden report matches synthetic contract evidence", () => {
    const report = JSON.parse(
      readFileSync(
        path.join(
          process.cwd(),
          "docs",
          "action-666f-golden-learning-report.json",
        ),
        "utf8",
      ),
    ) as {
      fixture_status_counts: Record<string, number>;
      trainable_reference: {
        identities: number;
        trading_days: number;
        tickers: number;
        regimes: number;
        walk_forward_splits: number;
        model_families: number;
        out_of_sample_predictions: number;
        dataset_digest: string;
        split_digest: string;
        model_artifact_digest: string;
        result_digest: string;
        shadow_binding_digest: string;
        candidate_model_identities: string[];
        candidate_model_artifact_digests: string[];
        synthetic_brier_score: number | null;
      };
      not_ture_performance: boolean;
      not_publishable: boolean;
    };
    const result = trained();
    const counts = Object.fromEntries(
      [
        "trainable",
        "not_trainable",
        "conflicting",
        "non_reproducible",
      ].map((status) => [
        status,
        action666fFixtureCases.filter(
          (fixture) => fixture.expected_status === status,
        ).length,
      ]),
    );

    expect(report.fixture_status_counts).toEqual(counts);
    expect(report.trainable_reference).toEqual({
      identities: result.dataset?.identity_count,
      trading_days: result.dataset?.trading_days.length,
      tickers: result.dataset?.tickers.length,
      regimes: result.dataset?.regimes.length,
      walk_forward_splits: result.splits.length,
      model_families: result.models.length,
      out_of_sample_predictions: result.predictions.length,
      dataset_digest: result.dataset_digest,
      split_digest: result.split_digest,
      model_artifact_digest: result.model_artifact_digest,
      result_digest: result.result_digest,
      shadow_binding_digest:
        result.shadow_evaluation_binding?.semantic_digest,
      candidate_model_identities: result.models.map(
        (item) => item.candidate_model_identity,
      ),
      candidate_model_artifact_digests: result.models.map(
        (item) => item.artifact_digest,
      ),
      synthetic_brier_score:
        result.calibration_evidence?.brier_score ?? null,
    });
    expect(report.not_ture_performance).toBe(true);
    expect(report.not_publishable).toBe(true);
  });
});
