import { buildConfidenceProjectionObservationPreview } from "./confidence-calibration-recommendation-advisory-projection-observation";
import { normalizeSetupType } from "./setup-types";

export const confidenceProjectionObservationContractVersion =
  "confidence_projection_observation_contract_v1";

export type ConfidenceProjectionObservationContractVersion =
  typeof confidenceProjectionObservationContractVersion;

export type ConfidenceProjectionOutcomeCompletionClassification =
  | "completed_success"
  | "completed_failure"
  | "incomplete"
  | "unsupported";

export type ConfidenceProjectionObservationProjectionSource =
  | "stored_projection"
  | "deterministically_recomputable"
  | "unavailable";

type JsonRecord = Record<string, unknown>;

type SnapshotContractInput = {
  id: string;
  snapshot_fingerprint: string;
  recommendation_id: string | null;
  ticker: string | null;
  side: string | null;
  recommended_at: string | null;
  window: string | null;
  recommendation_tier: string | null;
  setup_type: string | null;
  entry: number | null;
  stop: number | null;
  target: number | null;
  risk_per_share: number | null;
  reward_per_share: number | null;
  planned_risk_reward: number | null;
  original_confidence: number | string | null;
  captured_at: string;
};

type OutcomeContractInput = {
  snapshot_id: string | null;
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  ticker: string | null;
  side: string;
  recommended_at: string | null;
  evaluated_at: string;
  horizon: string;
  status: string;
  target_hit: boolean | null;
  stop_hit: boolean | null;
  first_terminal_event: string;
  eod_r: number | null;
  current_r: number | null;
  best_r: number | null;
  data_completeness: string;
  source: string;
};

function numberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function clampConfidence(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function explanationCategory(setupType: string | null) {
  const normalized = (setupType ?? "").toLowerCase();
  if (normalized.includes("breakout")) return "breakout_continuation";
  if (normalized.includes("continuation") || normalized.includes("vwap")) {
    return "momentum_continuation";
  }
  if (normalized.includes("reversal") || normalized.includes("reclaim")) {
    return "reversal_or_reclaim";
  }
  return "unknown";
}

export function classifyConfidenceProjectionOutcomeCompletion(
  outcome: Pick<
    OutcomeContractInput,
    | "status"
    | "target_hit"
    | "stop_hit"
    | "first_terminal_event"
    | "eod_r"
    | "current_r"
    | "best_r"
    | "data_completeness"
    | "source"
  >,
): {
  classification: ConfidenceProjectionOutcomeCompletionClassification;
  binary_success_score: 0 | 100 | null;
} {
  const status = outcome.status;
  const firstTerminalEvent = outcome.first_terminal_event;
  const hasEvaluatedMarketData =
    (outcome.data_completeness === "complete" ||
      outcome.data_completeness === "partial") &&
    outcome.source !== "snapshot_only";

  if (
    outcome.target_hit === true ||
    firstTerminalEvent === "target_hit" ||
    status === "target_hit" ||
    status === "target_before_stop"
  ) {
    return {
      classification: "completed_success",
      binary_success_score: 100,
    };
  }

  if (
    outcome.stop_hit === true ||
    firstTerminalEvent === "stop_hit" ||
    status === "stop_hit" ||
    status === "stop_before_target" ||
    (status === "neither_hit" && hasEvaluatedMarketData)
  ) {
    return {
      classification: "completed_failure",
      binary_success_score: 0,
    };
  }

  if (
    status === "entry_not_triggered" &&
    hasEvaluatedMarketData
  ) {
    return {
      classification: "completed_failure",
      binary_success_score: 0,
    };
  }

  const realizedR =
    numberOrNull(outcome.eod_r) ??
    numberOrNull(outcome.current_r) ??
    numberOrNull(outcome.best_r);
  if (status === "entry_triggered" && realizedR !== null) {
    return {
      classification: realizedR > 0 ? "completed_success" : "completed_failure",
      binary_success_score: realizedR > 0 ? 100 : 0,
    };
  }

  if (status === "invalid" || status === "unknown") {
    return {
      classification: "unsupported",
      binary_success_score: null,
    };
  }

  return {
    classification: "incomplete",
    binary_success_score: null,
  };
}

export function buildConfidenceProjectionObservationSnapshotContract(
  input: SnapshotContractInput,
) {
  const originalConfidence = numberOrNull(input.original_confidence);
  const normalizedOriginalConfidence =
    originalConfidence === null ? null : clampConfidence(originalConfidence);
  const normalizedSetupType = normalizeSetupType(input.setup_type);
  const preview = buildConfidenceProjectionObservationPreview({
    previewEnabled: true,
    confidenceScore: normalizedOriginalConfidence,
    direction: input.side,
    setupType: normalizedSetupType,
    ticker: input.ticker,
  });
  const projectedConfidence =
    preview.proposed_preview_confidence_basis_points === null
      ? null
      : preview.proposed_preview_confidence_basis_points / 100;
  const projectionDelta =
    preview.proposed_preview_delta_basis_points === null
      ? null
      : preview.proposed_preview_delta_basis_points / 100;
  const projectionSource: ConfidenceProjectionObservationProjectionSource =
    projectedConfidence === null ? "unavailable" : "stored_projection";

  return {
    version: confidenceProjectionObservationContractVersion,
    captured_at: input.captured_at,
    identity: {
      recommendation_id: input.recommendation_id,
      snapshot_id: input.id,
      snapshot_fingerprint: input.snapshot_fingerprint,
    },
    snapshot_time_confidence: {
      original_confidence: normalizedOriginalConfidence,
      projected_confidence: projectedConfidence,
      projection_delta: projectionDelta,
      projection_source: projectionSource,
      deterministic_recompute_available:
        normalizedOriginalConfidence !== null && normalizedSetupType !== "UNKNOWN",
      calibration_status: preview.calibration_status,
      explanation: preview.explanation,
      historical_basis: preview.historical_basis,
      explanation_category: explanationCategory(normalizedSetupType),
      projection_contract_version:
        "confidence_calibration_recommendation_advisory_projection_preview_v1",
    },
    setup_metadata: {
      ticker: input.ticker,
      side: input.side,
      recommended_at: input.recommended_at,
      trading_window: input.window,
      recommendation_tier: input.recommendation_tier,
      setup_type: normalizedSetupType,
    },
    trade_plan: {
      entry: input.entry,
      stop: input.stop,
      target: input.target,
      risk_per_share: input.risk_per_share,
      reward_per_share: input.reward_per_share,
      planned_risk_reward: input.planned_risk_reward,
    },
    no_effects: {
      ranking_affected: false,
      scanner_affected: false,
      publication_affected: false,
      execution_affected: false,
      add_trade_affected: false,
      risk_affected: false,
      sizing_affected: false,
      provider_called: false,
      supabase_write_executed: false,
      persistence_created: false,
      learning_write_executed: false,
      replay_executed: false,
    },
  } satisfies JsonRecord;
}

export function buildConfidenceProjectionObservationOutcomeContract(
  input: OutcomeContractInput,
) {
  const completion = classifyConfidenceProjectionOutcomeCompletion(input);

  return {
    version: confidenceProjectionObservationContractVersion,
    captured_at: input.evaluated_at,
    identity: {
      recommendation_id: input.recommendation_id,
      snapshot_id: input.snapshot_id,
      snapshot_fingerprint: input.snapshot_fingerprint,
    },
    outcome_semantics: {
      evaluation_status: input.status,
      completed_outcome_classification: completion.classification,
      binary_success_score: completion.binary_success_score,
      target_reached: input.target_hit,
      stop_reached: input.stop_hit,
      realized_r:
        numberOrNull(input.eod_r) ??
        numberOrNull(input.current_r) ??
        numberOrNull(input.best_r),
      evaluated_at: input.evaluated_at,
      horizon: input.horizon,
      data_completeness: input.data_completeness,
      source: input.source,
    },
    setup_metadata: {
      ticker: textOrNull(input.ticker),
      side: input.side,
      recommended_at: input.recommended_at,
    },
    no_effects: {
      ranking_affected: false,
      scanner_affected: false,
      publication_affected: false,
      execution_affected: false,
      add_trade_affected: false,
      risk_affected: false,
      sizing_affected: false,
      provider_called: false,
      supabase_write_executed: false,
      persistence_created: false,
      learning_write_executed: false,
      replay_executed: false,
    },
  } satisfies JsonRecord;
}

export function isConfidenceProjectionObservationContract(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as { version?: unknown }).version ===
      confidenceProjectionObservationContractVersion
  );
}
