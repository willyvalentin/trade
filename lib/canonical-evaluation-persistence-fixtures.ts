import {
  buildCanonicalEvaluationPersistenceEnvelope,
  buildCanonicalLegacyReadinessReport,
  roundTripCanonicalEvaluationPersistence,
  type BuildCanonicalPersistenceEnvelopeInput,
  type CanonicalLegacyReadinessInput,
  type CanonicalPersistenceReplayMetadata,
  type CanonicalPersistenceTradePlan,
} from "@/lib/canonical-evaluation-persistence-contract";
import {
  projectHistoricalSyntheticDecision,
  projectRecommendationBatchDecision,
  projectRecommendationOutcomeBundle,
  projectRecommendationSnapshotDecision,
  projectScannerCandidateDecision,
} from "@/lib/canonical-evaluation-projection-adapters";
import {
  action664bDuplicateHorizonOutcomes,
  action664bDuplicateHorizonSnapshot,
  action664bFixtureMetadata,
  action664bHistoricalMetadata,
  action664bHistoricalReplay,
  action664bLegacySnapshotWithoutDecisionId,
  action664bNoTradeBatch,
  action664bNoTradeMetadata,
  action664bProviderGapOutcomes,
  action664bProviderGapSnapshot,
  action664bRejectedBatch,
  action664bRejectedBuildDiagnostic,
  action664bRejectedCandidate,
  action664bRejectedMetadata,
  action664bRejectedRanking,
  action664bResearchMetadata,
  action664bResearchSnapshot,
  action664bSampleConflictSnapshot,
  action664bScanRun,
  action664bShadowCandidate,
  action664bShadowMetadata,
  action664bVisibleBatch,
  action664bVisibleMetadata,
  action664bVisibleOutcomes,
  action664bVisibleSnapshot,
} from "@/lib/canonical-evaluation-projection-fixtures";
import { action664aGoldenVersions } from "@/lib/canonical-recommendation-evaluation-fixtures";

const providerSourceTimestamp = "2026-07-08T14:32:00.000Z";
const replayTimestamp = "2026-07-08T15:00:00.000Z";

export const action664cGoldenTradePlan: CanonicalPersistenceTradePlan = {
  side: "long",
  entry: 210,
  stop: 207,
  target: 216,
  entry_policy: "immediate_at_recommendation",
};

export const action664cGoldenReplay: CanonicalPersistenceReplayMetadata = {
  replay_id: "canonical-replay-001",
  replayed_at: replayTimestamp,
  source_type: "historical_synthetic",
  source_commit: action664aGoldenVersions.git_commit,
  deterministic_input_hash: "sha256:canonical-replay-input-001",
  lookahead_safety_passed: true,
  provider_call_executed: false,
  persistence_write_executed: false,
};

export const action664cVisibleProjection =
  projectRecommendationOutcomeBundle({
    snapshot: action664bVisibleSnapshot,
    outcomes: action664bVisibleOutcomes,
    batch: action664bVisibleBatch,
    scan_run: action664bScanRun,
    metadata: action664bVisibleMetadata,
  });

export const action664cResearchProjection =
  projectRecommendationSnapshotDecision({
    snapshot: action664bResearchSnapshot,
    metadata: {
      ...action664bResearchMetadata,
      batch_id: "batch-research-001",
      batch_fingerprint: "batch-research-fingerprint-001",
      scan_run_id: "scan-run-001",
      scan_run_fingerprint: "scan-run-fingerprint-001",
    },
  });

export const action664cShadowProjection = projectScannerCandidateDecision({
  candidate: action664bShadowCandidate,
  metadata: {
    ...action664bShadowMetadata,
    batch_id: "batch-shadow-001",
    batch_fingerprint: "batch-shadow-fingerprint-001",
    scan_run_id: "scan-run-shadow-001",
    scan_run_fingerprint: "scan-run-shadow-fingerprint-001",
  },
});

export const action664cHistoricalProjection =
  projectHistoricalSyntheticDecision({
    replay: action664bHistoricalReplay,
    metadata: action664bHistoricalMetadata,
  });

export const action664cRejectedProjection = projectScannerCandidateDecision({
  candidate: action664bRejectedCandidate,
  ranking: action664bRejectedRanking,
  build_diagnostic: action664bRejectedBuildDiagnostic,
  batch: action664bRejectedBatch,
  metadata: action664bRejectedMetadata,
});

export const action664cNoTradeProjection =
  projectRecommendationBatchDecision({
    batch: action664bNoTradeBatch,
    scan_run: action664bScanRun,
    metadata: action664bNoTradeMetadata,
  });

export const action664cProviderGapProjection =
  projectRecommendationOutcomeBundle({
    snapshot: action664bProviderGapSnapshot,
    outcomes: action664bProviderGapOutcomes,
    metadata: {
      ...action664bFixtureMetadata(),
      candidate_id: "candidate-provider-gap-001",
      batch_id: "batch-provider-gap-001",
      batch_fingerprint: "batch-provider-gap-fingerprint-001",
      scan_run_id: "scan-run-provider-gap-001",
      scan_run_fingerprint: "scan-run-provider-gap-fingerprint-001",
    },
  });

export const action664cMissingDecisionProjection =
  projectRecommendationSnapshotDecision({
    snapshot: action664bLegacySnapshotWithoutDecisionId,
    metadata: action664bFixtureMetadata({
      candidate_id: "candidate-missing-decision-001",
      batch_id: "batch-missing-decision-001",
      batch_fingerprint: "batch-missing-decision-fingerprint-001",
      scan_run_id: "scan-run-missing-decision-001",
      scan_run_fingerprint: "scan-run-missing-decision-fingerprint-001",
    }),
  });

export const action664cSampleConflictProjection =
  projectRecommendationSnapshotDecision({
    snapshot: action664bSampleConflictSnapshot,
    metadata: action664bFixtureMetadata({
      candidate_id: "candidate-sample-conflict-001",
      batch_id: "batch-sample-conflict-001",
      batch_fingerprint: "batch-sample-conflict-fingerprint-001",
      scan_run_id: "scan-run-sample-conflict-001",
      scan_run_fingerprint: "scan-run-sample-conflict-fingerprint-001",
    }),
  });

export const action664cInvalidConfidenceProjection =
  projectRecommendationSnapshotDecision({
    snapshot: {
      ...action664bVisibleSnapshot,
      id: "snapshot-invalid-confidence-001",
      snapshot_fingerprint: "snapshot-invalid-confidence-fingerprint-001",
      recommendation_id: "recommendation-invalid-confidence-001",
      confidence: 78,
    },
    metadata: action664bFixtureMetadata({
      candidate_id: "candidate-invalid-confidence-001",
      batch_id: "batch-invalid-confidence-001",
      batch_fingerprint: "batch-invalid-confidence-fingerprint-001",
      scan_run_id: "scan-run-invalid-confidence-001",
      scan_run_fingerprint: "scan-run-invalid-confidence-fingerprint-001",
    }),
  });

export const action664cIncompleteVersionsProjection =
  projectRecommendationSnapshotDecision({
    snapshot: {
      ...action664bVisibleSnapshot,
      id: "snapshot-incomplete-versions-001",
      snapshot_fingerprint: "snapshot-incomplete-versions-fingerprint-001",
      recommendation_id: "recommendation-incomplete-versions-001",
    },
    metadata: action664bFixtureMetadata({
      versions: {
        ...action664aGoldenVersions,
        provider_contract_version: "",
      },
      candidate_id: "candidate-incomplete-versions-001",
      batch_id: "batch-incomplete-versions-001",
      batch_fingerprint: "batch-incomplete-versions-fingerprint-001",
      scan_run_id: "scan-run-incomplete-versions-001",
      scan_run_fingerprint: "scan-run-incomplete-versions-fingerprint-001",
    }),
  });

export const action664cDuplicateHorizonProjection =
  projectRecommendationOutcomeBundle({
    snapshot: action664bDuplicateHorizonSnapshot,
    outcomes: action664bDuplicateHorizonOutcomes,
    metadata: action664bFixtureMetadata({
      candidate_id: "candidate-duplicate-horizon-001",
      batch_id: "batch-duplicate-horizon-001",
      batch_fingerprint: "batch-duplicate-horizon-fingerprint-001",
      scan_run_id: "scan-run-duplicate-horizon-001",
      scan_run_fingerprint: "scan-run-duplicate-horizon-fingerprint-001",
    }),
  });

export const action664cBrokenLineageProjection = structuredClone(
  action664cVisibleProjection,
);
action664cBrokenLineageProjection.projection.relations.batch_id = null;
action664cBrokenLineageProjection.projection.relations.batch_fingerprint = null;

function envelopeInput(
  overrides: Partial<BuildCanonicalPersistenceEnvelopeInput> & {
    projection: BuildCanonicalPersistenceEnvelopeInput["projection"];
    decision_kind: BuildCanonicalPersistenceEnvelopeInput["decision_kind"];
  },
): BuildCanonicalPersistenceEnvelopeInput {
  return {
    provider_source_timestamp: providerSourceTimestamp,
    candle_interval: "5m",
    evaluator_input_identity:
      "eval_input:v1:golden-provider:2026-07-08T14:32:00.000Z",
    trade_plan: action664cGoldenTradePlan,
    ...overrides,
  };
}

export const action664cVisibleEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope(
    envelopeInput({
      projection: action664cVisibleProjection,
      decision_kind: "recommendation",
    }),
  );

export const action664cResearchEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope({
    projection: action664cResearchProjection,
    decision_kind: "recommendation",
    provider_source_timestamp: null,
    candle_interval: null,
    evaluator_input_identity: null,
    trade_plan: null,
    evaluation_reason_codes: ["outcome_not_yet_available"],
  });

export const action664cShadowEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope({
    projection: action664cShadowProjection,
    decision_kind: "recommendation",
    provider_source_timestamp: null,
    candle_interval: null,
    evaluator_input_identity: null,
    trade_plan: null,
    evaluation_reason_codes: ["shadow_outcome_not_yet_available"],
  });

export const action664cHistoricalEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope(
    envelopeInput({
      projection: action664cHistoricalProjection,
      decision_kind: "historical_synthetic",
      provider_source_timestamp: "2026-06-01T14:35:00.000Z",
      evaluator_input_identity:
        "eval_input:v1:historical-candidate-001:2026-06-01",
      replay: action664cGoldenReplay,
    }),
  );

export const action664cRejectedEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope({
    projection: action664cRejectedProjection,
    decision_kind: "rejection",
    provider_source_timestamp: null,
    candle_interval: null,
    evaluator_input_identity: null,
    trade_plan: null,
    evaluation_reason_codes: ["rejected_before_publication"],
  });

export const action664cNoTradeEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope({
    projection: action664cNoTradeProjection,
    decision_kind: "no_trade",
    provider_source_timestamp: null,
    candle_interval: null,
    evaluator_input_identity: null,
    trade_plan: null,
    context_reason_codes: ["market_level_decision"],
    provider_reason_codes: ["counterfactual_coverage_not_retained"],
    evaluation_reason_codes: ["no_trade_without_counterfactual"],
  });

export const action664cProviderGapEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope(
    envelopeInput({
      projection: action664cProviderGapProjection,
      decision_kind: "recommendation",
      evaluator_input_identity:
        "eval_input:v1:provider-gap:2026-07-08T14:32:00.000Z",
      evaluation_reason_codes: ["provider_gap_preserved"],
    }),
  );

export const action664cMissingDecisionEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope({
    projection: action664cMissingDecisionProjection,
    decision_kind: "recommendation",
  });

export const action664cSampleConflictEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope({
    projection: action664cSampleConflictProjection,
    decision_kind: "recommendation",
  });

export const action664cInvalidConfidenceEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope({
    projection: action664cInvalidConfidenceProjection,
    decision_kind: "recommendation",
  });

export const action664cIncompleteVersionsEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope({
    projection: action664cIncompleteVersionsProjection,
    decision_kind: "recommendation",
  });

export const action664cBrokenLineageEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope(
    envelopeInput({
      projection: action664cBrokenLineageProjection,
      decision_kind: "recommendation",
    }),
  );

export const action664cDuplicateHorizonEnvelopeResult =
  buildCanonicalEvaluationPersistenceEnvelope({
    projection: action664cDuplicateHorizonProjection,
    decision_kind: "recommendation",
  });

export const action664cCompleteRoundTrip =
  action664cVisibleEnvelopeResult.value
    ? roundTripCanonicalEvaluationPersistence(
        action664cVisibleEnvelopeResult.value,
      )
    : null;

function readinessInput(
  input: Omit<CanonicalLegacyReadinessInput, "raw_payload" | "observed_at"> & {
    raw_payload?: Record<string, unknown> | null;
    observed_at?: string | null;
  },
): CanonicalLegacyReadinessInput {
  return {
    raw_payload: { fixture_id: input.fixture_id },
    observed_at: providerSourceTimestamp,
    ...input,
  };
}

export const action664cFixtureReadinessInputs: CanonicalLegacyReadinessInput[] =
  [
    readinessInput({
      fixture_id: "01_visible_complete_round_trip",
      source: "recommendation_outcome_bundle",
      source_record_id: "snapshot-visible-001",
      projection: action664cVisibleProjection,
      envelope_result: action664cVisibleEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: true,
      reason_codes: ["reproducible_outcome"],
    }),
    readinessInput({
      fixture_id: "02_research_only",
      source: "recommendation_snapshot",
      source_record_id: "snapshot-research-001",
      projection: action664cResearchProjection,
      envelope_result: action664cResearchEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: false,
    }),
    readinessInput({
      fixture_id: "03_shadow",
      source: "scanner_candidate",
      source_record_id: "candidate-shadow-001",
      projection: action664cShadowProjection,
      envelope_result: action664cShadowEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: false,
    }),
    readinessInput({
      fixture_id: "04_historical_synthetic",
      source: "historical_replay",
      source_record_id: "historical-candidate-001",
      projection: action664cHistoricalProjection,
      envelope_result: action664cHistoricalEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: true,
      reason_codes: ["reproducible_outcome"],
    }),
    readinessInput({
      fixture_id: "05_rejected_candidate",
      source: "scanner_candidate",
      source_record_id: "candidate-rejected-001",
      projection: action664cRejectedProjection,
      envelope_result: action664cRejectedEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: false,
    }),
    readinessInput({
      fixture_id: "06_no_trade",
      source: "recommendation_batch",
      source_record_id: "batch-no-trade-001",
      projection: action664cNoTradeProjection,
      envelope_result: action664cNoTradeEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: false,
      reason_codes: ["counterfactual_not_evaluable"],
    }),
    readinessInput({
      fixture_id: "07_missing_decision_id",
      source: "recommendation_snapshot",
      source_record_id: "snapshot-legacy-no-decision-id",
      projection: action664cMissingDecisionProjection,
      envelope_result: action664cMissingDecisionEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: true,
    }),
    readinessInput({
      fixture_id: "08_sample_type_conflict",
      source: "recommendation_snapshot",
      source_record_id: "snapshot-sample-conflict",
      projection: action664cSampleConflictProjection,
      envelope_result: action664cSampleConflictEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: true,
    }),
    readinessInput({
      fixture_id: "09_confidence_outside_probability",
      source: "recommendation_snapshot",
      source_record_id: "snapshot-invalid-confidence-001",
      projection: action664cInvalidConfidenceProjection,
      envelope_result: action664cInvalidConfidenceEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: true,
    }),
    readinessInput({
      fixture_id: "10_incomplete_versions",
      source: "recommendation_snapshot",
      source_record_id: "snapshot-incomplete-versions-001",
      projection: action664cIncompleteVersionsProjection,
      envelope_result: action664cIncompleteVersionsEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: true,
    }),
    readinessInput({
      fixture_id: "11_broken_lineage",
      source: "recommendation_outcome_bundle",
      source_record_id: "snapshot-visible-001",
      projection: action664cBrokenLineageProjection,
      envelope_result: action664cBrokenLineageEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: true,
    }),
    readinessInput({
      fixture_id: "12_provider_gap",
      source: "recommendation_outcome_bundle",
      source_record_id: "snapshot-provider-gap",
      projection: action664cProviderGapProjection,
      envelope_result: action664cProviderGapEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: false,
      reason_codes: ["provider_gap"],
    }),
    readinessInput({
      fixture_id: "13_duplicate_horizon",
      source: "recommendation_outcome_bundle",
      source_record_id: "snapshot-duplicate-horizon",
      projection: action664cDuplicateHorizonProjection,
      envelope_result: action664cDuplicateHorizonEnvelopeResult,
      preservation_policy: "none",
      quality_metrics_required: true,
    }),
    readinessInput({
      fixture_id: "14_legacy_preservable_not_quality_usable",
      source: "recommendation_snapshot",
      source_record_id: "snapshot-legacy-preservable-001",
      projection: action664cIncompleteVersionsProjection,
      envelope_result: action664cIncompleteVersionsEnvelopeResult,
      preservation_policy: "raw_audit_only",
      quality_metrics_required: true,
      reason_codes: ["legacy_quality_fields_incomplete"],
      raw_payload: {
        snapshot_id: "snapshot-legacy-preservable-001",
        confidence: "high",
        score: 78,
      },
    }),
  ];

export const action664cFixtureReadinessReport =
  buildCanonicalLegacyReadinessReport(action664cFixtureReadinessInputs);
