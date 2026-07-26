import type { CanonicalProjectionMetadata } from "@/lib/canonical-evaluation-projection-adapters";
import {
  action664bDuplicateHorizonOutcomes,
  action664bDuplicateHorizonSnapshot,
  action664bFixtureMetadata,
  action664bProviderGapOutcomes,
  action664bProviderGapSnapshot,
  action664bScanRun,
  action664bVisibleBatch,
  action664bVisibleOutcomes,
  action664bVisibleSnapshot,
} from "@/lib/canonical-evaluation-projection-fixtures";
import { action664cGoldenTradePlan } from "@/lib/canonical-evaluation-persistence-fixtures";
import type {
  CompletedRecommendationOutcomeCaptureInput,
} from "@/lib/server/canonical-evaluation-capture-orchestrator";

const providerSourceTimestamp = "2026-07-08T14:32:00.000Z";

function explicitMetadata(
  input: {
    snapshot_id: string;
    snapshot_fingerprint: string;
    recommendation_id: string | null;
    decision_timestamp: string | null;
    sample_type: "visible" | "research_only";
    numeric_confidence: number | null;
    confidence_label: "low" | "medium" | "high" | null;
    candidate_id: string;
    batch_id: string;
    batch_fingerprint: string;
    scan_run_id: string;
    scan_run_fingerprint: string;
  },
  overrides: CanonicalProjectionMetadata = {},
): CanonicalProjectionMetadata {
  return action664bFixtureMetadata({
    producer_decision_id: input.recommendation_id,
    decision_timestamp: input.decision_timestamp,
    sample_type: input.sample_type,
    numeric_confidence: input.numeric_confidence,
    confidence_label: input.confidence_label,
    candidate_id: input.candidate_id,
    batch_id: input.batch_id,
    batch_fingerprint: input.batch_fingerprint,
    scan_run_id: input.scan_run_id,
    scan_run_fingerprint: input.scan_run_fingerprint,
    snapshot_id: input.snapshot_id,
    snapshot_fingerprint: input.snapshot_fingerprint,
    recommendation_id: input.recommendation_id,
    ...overrides,
  });
}

export const action664eVisibleInput: CompletedRecommendationOutcomeCaptureInput =
  {
    snapshot: structuredClone(action664bVisibleSnapshot),
    outcomes: structuredClone(action664bVisibleOutcomes),
    batch: structuredClone(action664bVisibleBatch),
    scan_run: structuredClone(action664bScanRun),
    metadata: explicitMetadata({
      snapshot_id: action664bVisibleSnapshot.id,
      snapshot_fingerprint:
        action664bVisibleSnapshot.snapshot_fingerprint,
      recommendation_id:
        action664bVisibleSnapshot.recommendation_id,
      decision_timestamp: action664bVisibleSnapshot.recommended_at,
      sample_type: "visible",
      numeric_confidence: 0.78,
      confidence_label: "high",
      candidate_id: "candidate-visible-001",
      batch_id: action664bVisibleBatch.id,
      batch_fingerprint: action664bVisibleBatch.batch_fingerprint,
      scan_run_id: action664bScanRun.id,
      scan_run_fingerprint: action664bScanRun.run_fingerprint,
    }),
    provider_source_timestamp: providerSourceTimestamp,
    candle_interval: "5m",
    evaluator_input_identity:
      "eval_input:v1:visible-completed-bundle:2026-07-08T14:32:00.000Z",
    trade_plan: structuredClone(action664cGoldenTradePlan),
  };

const researchDecisionId = "recommendation-research-complete-001";
const researchSnapshot = {
  ...structuredClone(action664bVisibleSnapshot),
  id: "snapshot-research-complete-001",
  snapshot_fingerprint: "snapshot-fingerprint-research-complete-001",
  recommendation_id: researchDecisionId,
  status: "hidden" as const,
  source_mode: "research_only",
  data_mode: "research_only",
  is_visible: false,
  payload_json: {
    ...structuredClone(action664bVisibleSnapshot.payload_json),
    candidate_id: "candidate-research-complete-001",
    visibility_status: "research_only",
  },
};
const researchOutcomes = action664bVisibleOutcomes.map((outcome) => ({
  ...structuredClone(outcome),
  id: `outcome-research-complete-${outcome.horizon}`,
  snapshot_id: researchSnapshot.id,
  snapshot_fingerprint: researchSnapshot.snapshot_fingerprint,
  recommendation_id: researchDecisionId,
}));
const researchBatch = {
  ...structuredClone(action664bVisibleBatch),
  id: "batch-research-complete-001",
  batch_fingerprint: "batch-fingerprint-research-complete-001",
  recommendation_snapshot_ids: [researchSnapshot.id],
  recommendation_snapshot_fingerprints: [
    researchSnapshot.snapshot_fingerprint,
  ],
  recommendation_tickers: researchSnapshot.ticker
    ? [researchSnapshot.ticker]
    : [],
  source_mode: "research_only",
  data_mode: "research_only",
};

export const action664eResearchInput: CompletedRecommendationOutcomeCaptureInput =
  {
    snapshot: researchSnapshot,
    outcomes: researchOutcomes,
    batch: researchBatch,
    scan_run: structuredClone(action664bScanRun),
    metadata: explicitMetadata({
      snapshot_id: researchSnapshot.id,
      snapshot_fingerprint: researchSnapshot.snapshot_fingerprint,
      recommendation_id: researchDecisionId,
      decision_timestamp: researchSnapshot.recommended_at,
      sample_type: "research_only",
      numeric_confidence: 0.78,
      confidence_label: "high",
      candidate_id: "candidate-research-complete-001",
      batch_id: researchBatch.id,
      batch_fingerprint: researchBatch.batch_fingerprint,
      scan_run_id: action664bScanRun.id,
      scan_run_fingerprint: action664bScanRun.run_fingerprint,
    }),
    provider_source_timestamp: providerSourceTimestamp,
    candle_interval: "5m",
    evaluator_input_identity:
      "eval_input:v1:research-completed-bundle:2026-07-08T14:32:00.000Z",
    trade_plan: structuredClone(action664cGoldenTradePlan),
  };

export const action664eProviderGapInput: CompletedRecommendationOutcomeCaptureInput =
  {
    snapshot: structuredClone(action664bProviderGapSnapshot),
    outcomes: structuredClone(action664bProviderGapOutcomes),
    metadata: explicitMetadata({
      snapshot_id: action664bProviderGapSnapshot.id,
      snapshot_fingerprint:
        action664bProviderGapSnapshot.snapshot_fingerprint,
      recommendation_id:
        action664bProviderGapSnapshot.recommendation_id,
      decision_timestamp: action664bProviderGapSnapshot.recommended_at,
      sample_type: "visible",
      numeric_confidence: 0.78,
      confidence_label: "high",
      candidate_id: "candidate-provider-gap-001",
      batch_id: "batch-provider-gap-001",
      batch_fingerprint: "batch-provider-gap-fingerprint-001",
      scan_run_id: "scan-run-provider-gap-001",
      scan_run_fingerprint: "scan-run-provider-gap-fingerprint-001",
    }),
    provider_source_timestamp: providerSourceTimestamp,
    candle_interval: "5m",
    evaluator_input_identity:
      "eval_input:v1:provider-gap:2026-07-08T14:32:00.000Z",
    trade_plan: structuredClone(action664cGoldenTradePlan),
  };

export const action664eMissingDecisionInput =
  structuredClone(action664eVisibleInput);
action664eMissingDecisionInput.metadata.producer_decision_id = null;

export const action664eSampleConflictInput =
  structuredClone(action664eResearchInput);
action664eSampleConflictInput.metadata.sample_type = "visible";

export const action664eDuplicateHorizonInput: CompletedRecommendationOutcomeCaptureInput =
  {
    snapshot: structuredClone(action664bDuplicateHorizonSnapshot),
    outcomes: structuredClone(action664bDuplicateHorizonOutcomes),
    metadata: explicitMetadata({
      snapshot_id: action664bDuplicateHorizonSnapshot.id,
      snapshot_fingerprint:
        action664bDuplicateHorizonSnapshot.snapshot_fingerprint,
      recommendation_id:
        action664bDuplicateHorizonSnapshot.recommendation_id,
      decision_timestamp:
        action664bDuplicateHorizonSnapshot.recommended_at,
      sample_type: "visible",
      numeric_confidence: 0.78,
      confidence_label: "high",
      candidate_id: "candidate-duplicate-horizon-001",
      batch_id: "batch-duplicate-horizon-001",
      batch_fingerprint: "batch-duplicate-horizon-fingerprint-001",
      scan_run_id: "scan-run-duplicate-horizon-001",
      scan_run_fingerprint:
        "scan-run-duplicate-horizon-fingerprint-001",
    }),
    provider_source_timestamp: providerSourceTimestamp,
    candle_interval: "5m",
    evaluator_input_identity:
      "eval_input:v1:duplicate-horizon:2026-07-08T14:32:00.000Z",
    trade_plan: structuredClone(action664cGoldenTradePlan),
  };

export const action664eBrokenLineageInput =
  structuredClone(action664eVisibleInput);
action664eBrokenLineageInput.metadata.batch_id = null;
action664eBrokenLineageInput.metadata.batch_fingerprint = null;
action664eBrokenLineageInput.batch = null;

export const action664eSemanticCollisionInput =
  structuredClone(action664eVisibleInput);
action664eSemanticCollisionInput.context_reason_codes = [
  "semantic_collision_fixture",
];
