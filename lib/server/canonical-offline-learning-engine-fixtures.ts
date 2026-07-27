import "server-only";

import { createHash } from "node:crypto";

import type { CanonicalEvaluationMetricsCandidate } from "@/lib/server/canonical-evaluation-quality-read-model";
import {
  CANONICAL_CHRONOLOGICAL_SPLIT_POLICY_VERSION,
  CANONICAL_FEATURE_SCHEMA_VERSION,
  CANONICAL_LABEL_POLICY_VERSION,
  CANONICAL_LEARNING_SHADOW_BINDING_VERSION,
  CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION,
  CANONICAL_STANDARDIZATION_VERSION,
  CANONICAL_TRAINING_IMPLEMENTATION_VERSION,
  buildCanonicalTrainingInputRowBinding,
  type CanonicalOfflineLearningRequest,
  type CanonicalOfflineLearningRow,
} from "@/lib/server/canonical-offline-learning-engine";
import { CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION } from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import {
  CANONICAL_CAPTURE_EVIDENCE_VERSION,
  CANONICAL_TRUSTED_FEATURE_CONTEXT_REGISTRY_VERSION,
  canonicalCaptureEvidenceDigest,
  createCanonicalFrozenTrainingInputManifest,
  createCanonicalFrozenTrainingInputRegistry,
  createCanonicalTrustedFeatureContextRegistry,
  type CanonicalOfflineLearningTrustBoundary,
  type CanonicalSampleCohortCompatibility,
  type CanonicalTrustedFeatureDefinition,
} from "@/lib/server/canonical-offline-learning-trust-registry";

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

const tickers = ["AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "AMD", "AVGO"];

const canonicalCompatibility: CanonicalSampleCohortCompatibility[] = [
  {
    sample_type: "visible",
    cohort: "visible_recommendation_quality",
  },
  {
    sample_type: "research_only",
    cohort: "research_only_recommendation_quality",
  },
  {
    sample_type: "shadow",
    cohort: "shadow_recommendation_quality",
  },
  {
    sample_type: "historical_synthetic",
    cohort: "historical_synthetic_recommendation_quality",
  },
  {
    sample_type: "rejected_candidate",
    cohort: "rejected_candidate_counterfactual",
  },
  {
    sample_type: "no_trade",
    cohort: "no_trade_counterfactual",
  },
];

export const action666fFeatureDefinitions: CanonicalTrustedFeatureDefinition[] =
  [
    {
      feature_id: "interaction_a",
      value_type: "finite_number",
      unit: "synthetic_signal_unit",
      minimum: -20,
      maximum: 20,
      source_namespace: "synthetic_point_in_time_generator_v1",
      capture_evidence_type: "synthetic_feature_capture_v1",
      timestamp_semantics: "observed_at_lte_cutoff_and_decision",
      availability_policy: "captured_by_owned_point_in_time_producer",
      allowed_sample_cohort_combinations: canonicalCompatibility,
    },
    {
      feature_id: "interaction_b",
      value_type: "finite_number",
      unit: "synthetic_signal_unit",
      minimum: -20,
      maximum: 20,
      source_namespace: "synthetic_point_in_time_generator_v1",
      capture_evidence_type: "synthetic_feature_capture_v1",
      timestamp_semantics: "observed_at_lte_cutoff_and_decision",
      availability_policy: "captured_by_owned_point_in_time_producer",
      allowed_sample_cohort_combinations: canonicalCompatibility,
    },
    {
      feature_id: "interaction_term",
      value_type: "finite_number",
      unit: "synthetic_interaction_unit",
      minimum: -50,
      maximum: 50,
      source_namespace: "synthetic_point_in_time_generator_v1",
      capture_evidence_type: "synthetic_feature_capture_v1",
      timestamp_semantics: "observed_at_lte_cutoff_and_decision",
      availability_policy: "captured_by_owned_point_in_time_producer",
      allowed_sample_cohort_combinations: canonicalCompatibility,
    },
    {
      feature_id: "irrelevant_noise",
      value_type: "finite_number",
      unit: "synthetic_signal_unit",
      minimum: -20,
      maximum: 20,
      source_namespace: "synthetic_point_in_time_generator_v1",
      capture_evidence_type: "synthetic_feature_capture_v1",
      timestamp_semantics: "observed_at_lte_cutoff_and_decision",
      availability_policy: "captured_by_owned_point_in_time_producer",
      allowed_sample_cohort_combinations: canonicalCompatibility,
    },
    {
      feature_id: "regime_signal",
      value_type: "finite_number",
      unit: "synthetic_signal_unit",
      minimum: -20,
      maximum: 20,
      source_namespace: "synthetic_point_in_time_generator_v1",
      capture_evidence_type: "synthetic_feature_capture_v1",
      timestamp_semantics: "observed_at_lte_cutoff_and_decision",
      availability_policy: "captured_by_owned_point_in_time_producer",
      allowed_sample_cohort_combinations: canonicalCompatibility,
    },
    {
      feature_id: "spurious_in_sample",
      value_type: "finite_number",
      unit: "synthetic_signal_unit",
      minimum: -20,
      maximum: 20,
      source_namespace: "synthetic_point_in_time_generator_v1",
      capture_evidence_type: "synthetic_feature_capture_v1",
      timestamp_semantics: "observed_at_lte_cutoff_and_decision",
      availability_policy: "captured_by_owned_point_in_time_producer",
      allowed_sample_cohort_combinations: canonicalCompatibility,
    },
    {
      feature_id: "true_signal",
      value_type: "finite_number",
      unit: "synthetic_signal_unit",
      minimum: -20,
      maximum: 20,
      source_namespace: "synthetic_point_in_time_generator_v1",
      capture_evidence_type: "synthetic_feature_capture_v1",
      timestamp_semantics: "observed_at_lte_cutoff_and_decision",
      availability_policy: "captured_by_owned_point_in_time_producer",
      allowed_sample_cohort_combinations: canonicalCompatibility,
    },
  ];

export const action666hTrustedFeatureContextRegistry =
  createCanonicalTrustedFeatureContextRegistry({
    feature_definitions: action666fFeatureDefinitions,
    context_definitions: [
      {
        context_id: "regime",
        value_type: "non_empty_string",
        unit: "categorical",
        source_namespace: "synthetic_market_context_v1",
        capture_evidence_type: "synthetic_context_capture_v1",
        timestamp_semantics: "observed_at_lte_cutoff_and_decision",
        availability_policy: "captured_by_owned_point_in_time_producer",
        allowed_values: ["bear", "bull"],
        allowed_sample_cohort_combinations: canonicalCompatibility,
      },
      {
        context_id: "sector",
        value_type: "non_empty_string",
        unit: "categorical",
        source_namespace: "synthetic_market_context_v1",
        capture_evidence_type: "synthetic_context_capture_v1",
        timestamp_semantics: "observed_at_lte_cutoff_and_decision",
        availability_policy: "captured_by_owned_point_in_time_producer",
        allowed_values: ["synthetic_technology"],
        allowed_sample_cohort_combinations: canonicalCompatibility,
      },
      {
        context_id: "provider",
        value_type: "non_empty_string",
        unit: "categorical",
        source_namespace: "synthetic_provider_snapshot_v1",
        capture_evidence_type: "synthetic_context_capture_v1",
        timestamp_semantics: "observed_at_lte_cutoff_and_decision",
        availability_policy: "captured_by_owned_point_in_time_producer",
        allowed_values: ["provider-fixture-v1"],
        allowed_sample_cohort_combinations: canonicalCompatibility,
      },
    ],
    compatibility_policy: canonicalCompatibility,
  });

function qualityCandidate(input: {
  identity: string;
  timestamp: string;
  day: string;
  ticker: string;
  regime: string;
  positive: boolean;
  rResult: number;
  confidence: number;
}): CanonicalEvaluationMetricsCandidate {
  return {
    read_model_version: "canonical_evaluation_quality_read_model_v1",
    canonical_identity: input.identity,
    sample_type: "shadow",
    cohort: "shadow_recommendation_quality",
    primary_horizon: "60m",
    terminal_outcome: input.positive
      ? "target_before_stop"
      : "stop_before_target",
    r_result: input.rResult,
    mfe_r: input.positive ? 1.7 : 0.4,
    mae_r: input.positive ? -0.3 : -1.1,
    max_favorable_excursion: input.positive ? 1.7 : 0.4,
    max_adverse_excursion: input.positive ? -0.3 : -1.1,
    target_before_stop: input.positive ? "yes" : "no",
    numeric_confidence: input.confidence,
    confidence_probability_semantics: "probability_0_1",
    setup: "synthetic_breakout_v1",
    window: "morning",
    regime: input.regime,
    sector: "synthetic_technology",
    ticker: input.ticker,
    decision_timestamp: input.timestamp,
    decision_day: input.day,
    versions: {
      engine: "engine-fixture-v1",
      scoring: "scoring-fixture-v1",
      ranking: "ranking-fixture-v1",
      evaluator: "evaluator-fixture-v1",
      provider: "provider-fixture-v1",
    },
    coverage: {
      status: "complete",
      expected_candle_count: 60,
      observed_candle_count: 60,
      freshness: "fresh",
    },
    parity_verified: true,
    reproducible: true,
    standard_visible_quality_eligible: false,
    cohort_quality_eligible: true,
    eligibility_status: "eligible",
    reason_codes: [],
    diagnostic_horizons: [],
  };
}

function feature(
  featureId: string,
  value: number,
  observedAt: string,
) {
  const sourceNamespace = "synthetic_point_in_time_generator_v1";
  const evidenceIdentity = `feature-capture:${featureId}:${observedAt}:${digest(
    String(value),
  ).slice(0, 16)}`;
  const evidenceType = "synthetic_feature_capture_v1";
  return {
    value,
    observed_at: observedAt,
    source_namespace: sourceNamespace,
    capture_evidence: {
      evidence_version: CANONICAL_CAPTURE_EVIDENCE_VERSION,
      evidence_identity: evidenceIdentity,
      evidence_type: evidenceType,
      evidence_digest: canonicalCaptureEvidenceDigest({
        value_kind: "feature",
        value_id: featureId,
        value,
        observed_at: observedAt,
        source_namespace: sourceNamespace,
        evidence_identity: evidenceIdentity,
        evidence_type: evidenceType,
      }),
    },
  };
}

function context(
  contextId: "regime" | "sector" | "provider",
  value: string,
  observedAt: string,
) {
  const sourceNamespace =
    contextId === "provider"
      ? "synthetic_provider_snapshot_v1"
      : "synthetic_market_context_v1";
  const evidenceIdentity = `context-capture:${contextId}:${observedAt}`;
  const evidenceType = "synthetic_context_capture_v1";
  return {
    value,
    observed_at: observedAt,
    source_namespace: sourceNamespace,
    capture_evidence: {
      evidence_version: CANONICAL_CAPTURE_EVIDENCE_VERSION,
      evidence_identity: evidenceIdentity,
      evidence_type: evidenceType,
      evidence_digest: canonicalCaptureEvidenceDigest({
        value_kind: "context",
        value_id: contextId,
        value,
        observed_at: observedAt,
        source_namespace: sourceNamespace,
        evidence_identity: evidenceIdentity,
        evidence_type: evidenceType,
      }),
    },
  };
}

function buildRows(): CanonicalOfflineLearningRow[] {
  const rows: CanonicalOfflineLearningRow[] = [];
  for (let dayIndex = 0; dayIndex < 18; dayIndex += 1) {
    const day = `2026-06-${String(dayIndex + 1).padStart(2, "0")}`;
    const timestamp = `${day}T14:00:00.000Z`;
    const observedAt = `${day}T13:59:00.000Z`;
    const outcomeCompletedAt = `${day}T15:00:00.000Z`;
    const regime = dayIndex % 6 < 3 ? "bull" : "bear";
    const opportunitySetIdentity = `opportunity-set:action-666f:${day}`;
    for (let item = 0; item < 4; item += 1) {
      const ordinal = dayIndex * 4 + item;
      const ticker = tickers[ordinal % tickers.length];
      const trueSignal = ((ordinal * 17) % 23 - 11) / 5;
      const interactionA = ((ordinal * 7) % 11 - 5) / 3;
      const interactionB = ((ordinal * 13) % 9 - 4) / 2;
      const interactionTerm = interactionA * interactionB;
      const regimeSignal = regime === "bull" ? trueSignal : -trueSignal;
      const irrelevantNoise = ((ordinal * 31) % 29 - 14) / 7;
      const deterministicJitter = ((ordinal * 19) % 7 - 3) / 10;
      const latent =
        trueSignal * 1.1 +
        interactionTerm * 0.75 +
        regimeSignal * 0.6 +
        deterministicJitter;
      const positive = latent > 0;
      const spurious =
        dayIndex < 8
          ? positive
            ? 2
            : -2
          : positive
            ? -2
            : 2;
      const identity = `canonical-learning-decision:${day}:${ticker}:${item}`;
      const rResult = positive
        ? 1.4 + Math.abs(trueSignal) * 0.15
        : -1 + trueSignal * 0.04;
      rows.push({
        canonical_decision_identity: identity,
        opportunity_set_identity: opportunitySetIdentity,
        opportunity_set_digest: digest(
          `opportunity-set-evidence:${opportunitySetIdentity}`,
        ),
        point_in_time_cutoff: timestamp,
        quality_candidate: qualityCandidate({
          identity,
          timestamp,
          day,
          ticker,
          regime,
          positive,
          rResult,
          confidence: Math.max(
            0.05,
            Math.min(0.95, 0.5 + latent * 0.12),
          ),
        }),
        contexts: {
          regime: context("regime", regime, observedAt),
          sector: context(
            "sector",
            "synthetic_technology",
            observedAt,
          ),
          provider: context(
            "provider",
            "provider-fixture-v1",
            observedAt,
          ),
        },
        overlap_evidence: {
          scan_run_identity: `scan-run:action-666f:${day}`,
          evaluator_input_identity: `evaluator-input:${identity}`,
          provider_snapshot_identity: `provider-snapshot:action-666f:${day}`,
          provider_snapshot_timestamp: observedAt,
          outcome_interval_start: timestamp,
          outcome_interval_end: outcomeCompletedAt,
          outcome_completed_at: outcomeCompletedAt,
        },
        features: {
          interaction_a: feature(
            "interaction_a",
            interactionA,
            observedAt,
          ),
          interaction_b: feature(
            "interaction_b",
            interactionB,
            observedAt,
          ),
          interaction_term: feature(
            "interaction_term",
            interactionTerm,
            observedAt,
          ),
          irrelevant_noise: feature(
            "irrelevant_noise",
            irrelevantNoise,
            observedAt,
          ),
          regime_signal: feature(
            "regime_signal",
            regimeSignal,
            observedAt,
          ),
          spurious_in_sample: feature(
            "spurious_in_sample",
            spurious,
            observedAt,
          ),
          true_signal: feature("true_signal", trueSignal, observedAt),
        },
      });
    }
  }
  return rows;
}

const rows = buildRows();

export const action666fTrainableRequest: CanonicalOfflineLearningRequest = {
  engine_version: CANONICAL_OFFLINE_LEARNING_ENGINE_VERSION,
  evidence_class: "synthetic_fixture_only",
  cohort: "shadow_recommendation_quality",
  sample_type: "shadow",
  feature_schema: {
    feature_schema_version: CANONICAL_FEATURE_SCHEMA_VERSION,
    trusted_registry_version:
      CANONICAL_TRUSTED_FEATURE_CONTEXT_REGISTRY_VERSION,
    trusted_registry_root_digest:
      action666hTrustedFeatureContextRegistry.root_digest,
    feature_ids: action666fFeatureDefinitions
      .map((definition) => definition.feature_id)
      .sort(),
  },
  label_policy: {
    label_policy_version: CANONICAL_LABEL_POLICY_VERSION,
    binary_outcome: "target_before_stop",
    binary_positive_terminal_outcome: "target_before_stop",
    binary_negative_terminal_outcome: "stop_before_target",
    linear_outcome: "canonical_r_cost_adjusted",
    transaction_cost_r: 0.05,
    ambiguous_and_no_entry_policy: "exclude",
  },
  split_policy: {
    split_policy_version: CANONICAL_CHRONOLOGICAL_SPLIT_POLICY_VERSION,
    initial_training_days: 8,
    test_days: 2,
    step_days: 2,
    purge_policy: "derive_from_canonical_outcome_intervals_v1",
    embargo_policy: "after_latest_outcome_completion_v1",
    embargo_minutes: 60,
    outcome_horizon_minutes: 60,
    expanding_training_window: true,
  },
  training_config: {
    training_implementation_version:
      CANONICAL_TRAINING_IMPLEMENTATION_VERSION,
    standardization_version: CANONICAL_STANDARDIZATION_VERSION,
    candidate_model_contract_version: "candidate-model-fixture-v1",
    random_seed: "action-666f-deterministic-seed-v1",
    minimum_evidence: {
      minimum_identities: 40,
      minimum_trading_days: 10,
      minimum_tickers: 6,
      minimum_positive_outcomes: 10,
      minimum_negative_outcomes: 10,
      minimum_regimes: 2,
    },
    models: [
      {
        family: "regularized_logistic_target_before_stop",
        learning_rate: 0.05,
        l2_regularization: 0.02,
        iterations: 350,
        convergence_policy: "fixed_iterations_no_early_stop_v1",
      },
      {
        family: "regularized_linear_canonical_r",
        learning_rate: 0.03,
        l2_regularization: 0.03,
        iterations: 350,
        convergence_policy: "fixed_iterations_no_early_stop_v1",
      },
    ],
  },
  shadow_evaluation_binding: {
    binding_version: CANONICAL_LEARNING_SHADOW_BINDING_VERSION,
    action_666_evaluation_version:
      CANONICAL_SHADOW_RANKING_CONFIDENCE_EVALUATION_VERSION,
    evaluator_contract_version: "evaluator-contract-fixture-v1",
    provider_contract_version: "provider-fixture-v1",
    terminal_outcome_policy: "primary_60m_else_30m_else_15m_v1",
    opportunity_set_inventory: Array.from(
      new Set(rows.map((row) => row.opportunity_set_identity)),
    ).sort(),
  },
  trusted_training_input_manifest_identity: "pending",
  rows,
};

export const action666fReorderedRequest = structuredClone(
  action666fTrainableRequest,
);
action666fReorderedRequest.rows.reverse();
action666fReorderedRequest.feature_schema.feature_ids.reverse();
for (const row of action666fReorderedRequest.rows) {
  row.features = Object.fromEntries(Object.entries(row.features).reverse());
}

export const action666fLeakageFeatureRequest = structuredClone(
  action666fTrainableRequest,
);
action666fLeakageFeatureRequest.feature_schema.feature_ids.push(
  "future_outcome_label",
);
for (const row of action666fLeakageFeatureRequest.rows) {
  row.features.future_outcome_label = feature(
    "future_outcome_label",
    row.quality_candidate.terminal_outcome === "target_before_stop" ? 1 : 0,
    row.point_in_time_cutoff,
  );
}

export const action666fFutureTimestampRequest = structuredClone(
  action666fTrainableRequest,
);
action666fFutureTimestampRequest.rows[0].features.true_signal.observed_at =
  "2026-07-01T00:00:00.000Z";

export const action666fCohortDriftRequest = structuredClone(
  action666fTrainableRequest,
);
action666fCohortDriftRequest.rows[0].quality_candidate.cohort =
  "research_only_recommendation_quality";
action666fCohortDriftRequest.rows[0].quality_candidate.sample_type =
  "research_only";

export const action666fDuplicateIdentityRequest = structuredClone(
  action666fTrainableRequest,
);
action666fDuplicateIdentityRequest.rows.push(
  structuredClone(action666fDuplicateIdentityRequest.rows[0]),
);

export const action666fContradictoryLineageRequest = structuredClone(
  action666fTrainableRequest,
);
action666fContradictoryLineageRequest.rows[1].opportunity_set_identity =
  action666fContradictoryLineageRequest.rows[0].opportunity_set_identity;
action666fContradictoryLineageRequest.rows[1].opportunity_set_digest =
  digest("contradictory-opportunity-set-evidence");
action666fContradictoryLineageRequest.shadow_evaluation_binding
  .opportunity_set_inventory = Array.from(
  new Set(
    action666fContradictoryLineageRequest.rows.map(
      (row) => row.opportunity_set_identity,
    ),
  ),
).sort();

export const action666fNonReproducibleRequest = structuredClone(
  action666fTrainableRequest,
);
action666fNonReproducibleRequest.rows[0].quality_candidate.reproducible =
  false;
action666fNonReproducibleRequest.rows[0].quality_candidate
  .eligibility_status = "non_reproducible";

export const action666fInsufficientEvidenceRequest = structuredClone(
  action666fTrainableRequest,
);
action666fInsufficientEvidenceRequest.rows =
  action666fInsufficientEvidenceRequest.rows.slice(0, 12);
action666fInsufficientEvidenceRequest.shadow_evaluation_binding
  .opportunity_set_inventory = Array.from(
  new Set(
    action666fInsufficientEvidenceRequest.rows.map(
      (row) => row.opportunity_set_identity,
    ),
  ),
).sort();

export const action666fLabelImbalanceRequest = structuredClone(
  action666fTrainableRequest,
);
for (let index = 0; index < action666fLabelImbalanceRequest.rows.length; index += 1) {
  const row = action666fLabelImbalanceRequest.rows[index];
  const positive = index > 1;
  row.quality_candidate.terminal_outcome = positive
    ? "target_before_stop"
    : "stop_before_target";
  row.quality_candidate.target_before_stop = positive ? "yes" : "no";
  row.quality_candidate.r_result = positive ? 1.2 : -1;
}

export const action666fShuffledLabelsRequest = structuredClone(
  action666fTrainableRequest,
);
const rotatedLabels = action666fShuffledLabelsRequest.rows.map((row) => ({
  terminal_outcome: row.quality_candidate.terminal_outcome,
  target_before_stop: row.quality_candidate.target_before_stop,
  r_result: row.quality_candidate.r_result,
}));
for (let index = 0; index < action666fShuffledLabelsRequest.rows.length; index += 1) {
  const source = rotatedLabels[(index + 17) % rotatedLabels.length];
  const candidate =
    action666fShuffledLabelsRequest.rows[index].quality_candidate;
  candidate.terminal_outcome = source.terminal_outcome;
  candidate.target_before_stop = source.target_before_stop;
  candidate.r_result = source.r_result;
}

export const action666fChangedSeedRequest = structuredClone(
  action666fTrainableRequest,
);
action666fChangedSeedRequest.training_config.random_seed =
  "action-666f-deterministic-seed-v2";

export const action666fChangedHyperparameterRequest = structuredClone(
  action666fTrainableRequest,
);
action666fChangedHyperparameterRequest.training_config.models[0]
  .l2_regularization = 0.08;

export const action666fChangedVersionRequest = structuredClone(
  action666fTrainableRequest,
);
action666fChangedVersionRequest.training_config
  .candidate_model_contract_version = "candidate-model-fixture-v2";

function trustedManifestFor(request: CanonicalOfflineLearningRequest) {
  return createCanonicalFrozenTrainingInputManifest({
    feature_context_registry_root_digest:
      action666hTrustedFeatureContextRegistry.root_digest,
    cohort: request.cohort,
    sample_type: request.sample_type,
    row_bindings: request.rows.map(buildCanonicalTrainingInputRowBinding),
  });
}

const baselineManifest = trustedManifestFor(action666fTrainableRequest);
const nonReproducibleManifest = trustedManifestFor(
  action666fNonReproducibleRequest,
);
const insufficientManifest = trustedManifestFor(
  action666fInsufficientEvidenceRequest,
);
const imbalanceManifest = trustedManifestFor(
  action666fLabelImbalanceRequest,
);
const shuffledManifest = trustedManifestFor(
  action666fShuffledLabelsRequest,
);

for (const request of [
  action666fTrainableRequest,
  action666fReorderedRequest,
  action666fLeakageFeatureRequest,
  action666fFutureTimestampRequest,
  action666fCohortDriftRequest,
  action666fDuplicateIdentityRequest,
  action666fContradictoryLineageRequest,
  action666fChangedSeedRequest,
  action666fChangedHyperparameterRequest,
  action666fChangedVersionRequest,
]) {
  request.trusted_training_input_manifest_identity =
    baselineManifest.manifest_identity;
}
action666fNonReproducibleRequest.trusted_training_input_manifest_identity =
  nonReproducibleManifest.manifest_identity;
action666fInsufficientEvidenceRequest.trusted_training_input_manifest_identity =
  insufficientManifest.manifest_identity;
action666fLabelImbalanceRequest.trusted_training_input_manifest_identity =
  imbalanceManifest.manifest_identity;
action666fShuffledLabelsRequest.trusted_training_input_manifest_identity =
  shuffledManifest.manifest_identity;

export const action666hTrustedTrainingInputRegistry =
  createCanonicalFrozenTrainingInputRegistry([
    baselineManifest,
    nonReproducibleManifest,
    insufficientManifest,
    imbalanceManifest,
    shuffledManifest,
  ]);

export const action666hTrustedLearningBoundary: CanonicalOfflineLearningTrustBoundary =
  {
    feature_context_registry: action666hTrustedFeatureContextRegistry,
    training_input_registry: action666hTrustedTrainingInputRegistry,
    expected_feature_context_registry_root_digest:
      action666hTrustedFeatureContextRegistry.root_digest,
    expected_training_input_registry_root_digest:
      action666hTrustedTrainingInputRegistry.root_digest,
    trust_source: "version_controlled_synthetic_fixture_registry",
  };

export type Action666fFixtureCase = {
  name: string;
  request: CanonicalOfflineLearningRequest;
  expected_status:
    | "trainable"
    | "not_trainable"
    | "conflicting"
    | "non_reproducible";
};

export const action666fFixtureCases: Action666fFixtureCase[] = [
  {
    name: "synthetic_signal_interactions_noise_spurious_and_regime",
    request: action666fTrainableRequest,
    expected_status: "trainable",
  },
  {
    name: "leakage_feature",
    request: action666fLeakageFeatureRequest,
    expected_status: "conflicting",
  },
  {
    name: "future_timestamp",
    request: action666fFutureTimestampRequest,
    expected_status: "conflicting",
  },
  {
    name: "cohort_drift",
    request: action666fCohortDriftRequest,
    expected_status: "conflicting",
  },
  {
    name: "duplicated_identity",
    request: action666fDuplicateIdentityRequest,
    expected_status: "conflicting",
  },
  {
    name: "contradictory_opportunity_set_lineage",
    request: action666fContradictoryLineageRequest,
    expected_status: "conflicting",
  },
  {
    name: "non_reproducible_row",
    request: action666fNonReproducibleRequest,
    expected_status: "non_reproducible",
  },
  {
    name: "insufficient_evidence",
    request: action666fInsufficientEvidenceRequest,
    expected_status: "not_trainable",
  },
  {
    name: "label_imbalance",
    request: action666fLabelImbalanceRequest,
    expected_status: "not_trainable",
  },
  {
    name: "shuffled_labels",
    request: action666fShuffledLabelsRequest,
    expected_status: "trainable",
  },
];
