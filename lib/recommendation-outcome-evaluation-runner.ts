import {
  computeRecommendationOutcome,
  recommendationOutcomesJson,
  resolveRecommendationOutcomeSide,
  type RecommendationOutcome,
  type RecommendationOutcomeCandle,
  type RecommendationOutcomeHorizon,
  type RecommendationOutcomePersistenceResult,
} from "@/lib/recommendation-outcome-tracker";
import {
  simulateCounterfactualVariant,
  type CounterfactualEntryVariantLabel,
} from "@/lib/recommendation-outcome-learning-insights";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import {
  summarizePlanPriceFreshness,
  type PlanPriceFreshnessDiagnostics,
  type PlanPriceFreshnessSummary,
} from "@/lib/plan-price-freshness";
import {
  entryTypeMetadataForSnapshot,
  evaluateEntryTypeAwareTrigger,
  summarizeEntryTypeTriggerDiagnostics,
  type EntryTypeAwareTriggerDiagnostics,
  type EntryTypeTriggerSummary,
  type RecommendationEntryTypeMetadata,
} from "@/lib/recommendation-entry-type";
import {
  buildPlanReferenceMetadataTrace,
  type PlanReferenceMetadataTraceSummary,
} from "@/lib/plan-reference-metadata-trace";

export type RecommendationOutcomeEvaluationRunStatus =
  | "idle"
  | "ready"
  | "running"
  | "completed"
  | "partial"
  | "blocked"
  | "failed"
  | "unknown";

export type RecommendationOutcomeEvaluationCandidateStatus =
  | "pending"
  | "pending_provider_budget"
  | "pending_candles"
  | "evaluated"
  | "incomplete_data"
  | "missing_snapshot_fields"
  | "missing_candles"
  | "provider_error"
  | "skipped"
  | "unknown";

export type RecommendationOutcomeEvaluationWarning = {
  warning_id: string;
  snapshot_fingerprint: string | null;
  ticker: string | null;
  horizon: RecommendationOutcomeHorizon;
  message: string;
};

export type RecommendationOutcomeCandleRequest = {
  request_id: string;
  snapshot_id: string | null;
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  ticker: string;
  horizon: RecommendationOutcomeHorizon;
  start_at: string;
  end_at: string;
  interval: "5min" | "15min";
};

export type RecommendationOutcomeCandleResult = {
  request: RecommendationOutcomeCandleRequest;
  status: "available" | "missing_candles" | "provider_error" | "skipped";
  candles: RecommendationOutcomeCandle[];
  provider: string | null;
  error: string | null;
  warnings: string[];
  diagnostics?: Record<string, unknown> | null;
};

export type RecommendationOutcomeEvaluationCandidate = {
  candidate_id: string;
  snapshot_id: string | null;
  snapshot_fingerprint: string | null;
  recommendation_id: string | null;
  ticker: string | null;
  horizon: RecommendationOutcomeHorizon;
  status: RecommendationOutcomeEvaluationCandidateStatus;
  candle_request: RecommendationOutcomeCandleRequest | null;
  candle_count: number;
  reused_candle_count?: number | null;
  horizon_filtered_candle_count?: number | null;
  first_reused_candle_time?: string | null;
  last_reused_candle_time?: string | null;
  first_horizon_candle_time?: string | null;
  last_horizon_candle_time?: string | null;
  horizon_filter_start_at?: string | null;
  horizon_filter_end_at?: string | null;
  outcome_id: string | null;
  outcome_status: RecommendationOutcome["status"] | null;
  persistence_mode: RecommendationOutcomePersistenceResult["mode"] | "unknown";
  plan_price_freshness?: PlanPriceFreshnessDiagnostics | null;
  entry_type_metadata?: RecommendationEntryTypeMetadata | null;
  entry_type_aware_trigger?: EntryTypeAwareTriggerDiagnostics | null;
  warnings: string[];
  error: string | null;
};

export type RecommendationOutcomeEvaluationResult = {
  candidate: RecommendationOutcomeEvaluationCandidate;
  outcome: RecommendationOutcome | null;
  persistence: RecommendationOutcomePersistenceResult | null;
};

export type RecommendationOutcomeEvaluationRun = {
  run_id: string;
  run_version: "1.0";
  status: RecommendationOutcomeEvaluationRunStatus;
  started_at: string;
  completed_at: string | null;
  horizons: RecommendationOutcomeHorizon[];
  source: "manual" | "auto" | "api" | "unknown";
  provider: string | null;
  eligible_snapshot_count: number;
  evaluated_snapshot_count: number;
  incomplete_snapshot_count: number;
  missing_candle_count: number;
  provider_error_count: number;
  persisted_outcome_count: number;
  candle_requests_planned: number;
  candle_requests_executed: number;
  candle_requests_saved_by_reuse: number;
  provider_budget_limit: number | null;
  skipped_due_to_budget_count: number;
  pending_provider_budget_count: number;
  retry_incomplete_count: number;
  unique_candle_requests_count: number;
  empty_candle_response_count: number;
  provider_limit_count: number;
  enrichment_mode: boolean;
  completed_outcomes_seen_count: number;
  completed_outcomes_enriched_count: number;
  completed_outcomes_skipped_already_enriched_count: number;
  retained_candles_added_count: number;
  counterfactual_ready_count: number;
  shadow_entry_trial_count: number;
  shadow_entry_triggered_count: number;
  plan_price_freshness_summary: PlanPriceFreshnessSummary | null;
  plan_reference_metadata_trace: PlanReferenceMetadataTraceSummary | null;
  entry_type_trigger_summary: EntryTypeTriggerSummary | null;
  candle_request_debug_sample: Record<string, unknown>[];
  candidates: RecommendationOutcomeEvaluationCandidate[];
  outcomes: RecommendationOutcome[];
  warnings: RecommendationOutcomeEvaluationWarning[];
  summary: string;
};

export type RecommendationOutcomeEvaluationRunnerOptions = {
  snapshots: RecommendationSnapshot[];
  existingOutcomes?: RecommendationOutcome[];
  horizons?: RecommendationOutcomeHorizon[];
  now?: Date | string | null;
  source?: RecommendationOutcomeEvaluationRun["source"];
  provider?: string | null;
  maxSnapshots?: number;
  maxCandleRequests?: number | null;
  snapshotOrder?: "newest_first" | "input";
  enrichCompletedOutcomes?: boolean;
  fetchCandles?: (
    request: RecommendationOutcomeCandleRequest,
  ) => Promise<RecommendationOutcomeCandleResult>;
  persistOutcome?: (
    outcome: RecommendationOutcome,
  ) => Promise<RecommendationOutcomePersistenceResult>;
};

export const recommendationOutcomeEvaluationRunStorageKey =
  "trade-recommendation-outcome-evaluation-runs-v1";

const defaultHorizons: RecommendationOutcomeHorizon[] = ["15m", "30m", "60m"];
const defaultMaxSnapshots = 6;

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function horizonMs(horizon: RecommendationOutcomeHorizon) {
  if (horizon === "15m") return 15 * 60 * 1000;
  if (horizon === "30m") return 30 * 60 * 1000;
  if (horizon === "60m") return 60 * 60 * 1000;
  return null;
}

function hasRequiredSnapshotFields(snapshot: RecommendationSnapshot) {
  const side = resolveRecommendationOutcomeSide({ snapshot }).side;

  return Boolean(
    snapshot.snapshot_fingerprint &&
      snapshot.ticker &&
      snapshot.recommended_at &&
      snapshot.entry !== null &&
      snapshot.stop !== null &&
      snapshot.target !== null &&
      (side === "long" || side === "short"),
  );
}

function isOutcomePending(outcome: RecommendationOutcome | undefined) {
  if (!outcome) {
    return true;
  }

  return (
    outcome.status === "pending" ||
    outcome.status === "incomplete" ||
    outcome.status === "unknown" ||
    outcome.status === "invalid"
  );
}

function isProviderLimitOutcome(outcome: RecommendationOutcome | undefined) {
  if (!outcome) {
    return false;
  }

  const text = [
    ...outcome.warnings,
    ...outcome.blockers,
    outcome.payload_json.provider_error,
    outcome.payload_json.error,
    outcome.payload_json.pending_reason,
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return (
    outcome.status === "incomplete" &&
    (text.includes("rate limit") ||
      text.includes("api limit") ||
      text.includes("credit") ||
      text.includes("budget"))
  );
}

function hasProviderLimitText(values: Array<string | null | undefined>) {
  const text = values
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return (
    text.includes("rate limit") ||
    text.includes("api limit") ||
    text.includes("credit") ||
    text.includes("budget")
  );
}

function annotateOutcome(
  outcome: RecommendationOutcome,
  payload: Record<string, unknown>,
) {
  return {
    ...outcome,
    payload_json: {
      ...outcome.payload_json,
      ...payload,
    },
  };
}

function planPriceFreshnessFromOutcome(
  outcome: RecommendationOutcome | null | undefined,
): PlanPriceFreshnessDiagnostics | null {
  const value = outcome?.payload_json.plan_price_freshness;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const classification = (value as Record<string, unknown>).classification;
  if (typeof classification !== "string") {
    return null;
  }
  return value as PlanPriceFreshnessDiagnostics;
}

function entryTypeMetadataFromOutcome(
  outcome: RecommendationOutcome | null | undefined,
): RecommendationEntryTypeMetadata | null {
  const value = outcome?.payload_json.entry_type_metadata;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  if (typeof (value as Record<string, unknown>).entry_type !== "string") {
    return null;
  }
  return value as RecommendationEntryTypeMetadata;
}

function entryTypeTriggerFromOutcome(
  outcome: RecommendationOutcome | null | undefined,
): EntryTypeAwareTriggerDiagnostics | null {
  const value = outcome?.payload_json.entry_type_trigger_diagnostics;
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  if (
    typeof (value as Record<string, unknown>)
      .entry_type_aware_trigger_semantics !== "string"
  ) {
    return null;
  }
  return value as EntryTypeAwareTriggerDiagnostics;
}

function entryTypeDiagnosticPayload(input: {
  snapshot: RecommendationSnapshot;
  outcome: RecommendationOutcome;
  candles: RecommendationOutcomeCandle[];
}) {
  const metadata = entryTypeMetadataForSnapshot(input.snapshot);
  const trigger = evaluateEntryTypeAwareTrigger({
    metadata,
    side: input.outcome.side,
    entry: input.outcome.entry,
    stop: input.outcome.stop,
    target: input.outcome.target,
    candles: input.candles,
    officialEntryTriggered: input.outcome.entry_triggered,
    officialStatus: input.outcome.status,
  });

  return {
    ...metadata,
    entry_type_metadata: metadata,
    ...trigger,
    entry_type_trigger_diagnostics: trigger,
  };
}

function compactOutcomeCandles(candles: RecommendationOutcomeCandle[]) {
  return candles.slice(0, 96).map((candle) => {
    const time =
      candle.timestamp instanceof Date
        ? candle.timestamp.toISOString()
        : typeof candle.timestamp === "number"
          ? new Date(
              candle.timestamp > 10_000_000_000
                ? candle.timestamp
                : candle.timestamp * 1000,
            ).toISOString()
          : candle.timestamp;

    return {
      time,
      timestamp: time,
      open: candle.open ?? null,
      high: candle.high ?? null,
      low: candle.low ?? null,
      close: candle.close ?? null,
      volume: candle.volume ?? null,
    };
  });
}

function hasRetainedCounterfactualCandles(outcome: RecommendationOutcome | undefined) {
  if (!outcome) {
    return false;
  }

  return (
    outcome.payload_json.retained_candles_available === true ||
    outcome.payload_json.counterfactual_ready === true ||
    (Array.isArray(outcome.payload_json.counterfactual_candles) &&
      outcome.payload_json.counterfactual_candles.length > 0)
  );
}

function outcomeNeedsOfficialTriggerSemanticsRefresh(input: {
  outcome: RecommendationOutcome | undefined;
  snapshot: RecommendationSnapshot;
}) {
  if (!input.outcome) {
    return false;
  }

  const metadata =
    entryTypeMetadataFromOutcome(input.outcome) ??
    entryTypeMetadataForSnapshot(input.snapshot);

  if (
    metadata.entry_type !== "market_reference" ||
    metadata.entry_trigger_semantics !== "immediate_reference"
  ) {
    return false;
  }

  const trigger = entryTypeTriggerFromOutcome(input.outcome);

  return (
    input.outcome.payload_json.official_trigger_semantics_used !==
      "immediate_reference" ||
    trigger?.official_trigger_semantics_used !== "immediate_reference" ||
    (input.outcome.entry_triggered === false &&
      trigger?.entry_type_aware_entry_triggered === true)
  );
}

function retainedCandlePayload(candles: RecommendationOutcomeCandle[]) {
  const retainedCandles = compactOutcomeCandles(candles);

  return {
    counterfactual_candles: retainedCandles,
    counterfactual_candle_source: "horizon_filtered_intraday_candles",
    retained_candles_available: retainedCandles.length > 0,
    retained_candle_count: retainedCandles.length,
    counterfactual_ready: retainedCandles.length > 0,
  };
}

function shadowEntryVariant(snapshot: RecommendationSnapshot) {
  const payload = snapshot.payload_json;
  const variant =
    typeof payload.shadow_entry_variant === "string"
      ? payload.shadow_entry_variant
      : null;

  if (
    payload.shadow_entry_trial !== true ||
    payload.shadow_entry_not_live_signal !== true ||
    variant !== "first_candle_close_entry"
  ) {
    return null;
  }

  return variant as CounterfactualEntryVariantLabel;
}

function shadowExecutionQualityLabel(result: {
  entry_triggered: boolean | null;
  target_hit: boolean | null;
  stop_hit: boolean | null;
  best_r: number | null;
  invalid_reason?: string | null;
}) {
  if (
    result.invalid_reason === "long_stop_above_or_equal_shadow_entry" ||
    result.invalid_reason === "short_stop_below_or_equal_shadow_entry"
  ) {
    return "shadow_risk_model_invalid";
  }
  if (result.target_hit === true) return "target_hit";
  if (result.stop_hit === true) return "stop_hit";
  if (result.entry_triggered === false) {
    return (result.best_r ?? 0) > 0
      ? "missed_but_favorable"
      : "missed_and_unfavorable";
  }
  if (result.entry_triggered === true) return "triggered_no_followthrough";
  return "data_incomplete";
}

function shadowEntryTrialPayload(input: {
  snapshot: RecommendationSnapshot;
  sourceOutcome: RecommendationOutcome;
  candles: RecommendationOutcomeCandle[];
}) {
  const variant = shadowEntryVariant(input.snapshot);
  const firstCandle = input.candles[0] ?? null;
  const firstClose =
    typeof firstCandle?.close === "number" && Number.isFinite(firstCandle.close)
      ? firstCandle.close
      : null;

  if (!variant || firstClose === null) {
    return {};
  }

  const result = simulateCounterfactualVariant({
    snapshot: input.snapshot,
    sourceOutcome: input.sourceOutcome,
    candles: input.candles,
    variant,
    entry: firstClose,
  });
  const riskModelInvalid =
    result.invalid_reason === "long_stop_above_or_equal_shadow_entry" ||
    result.invalid_reason === "short_stop_below_or_equal_shadow_entry";

  return {
    shadow_entry_trial: {
      variant,
      entry: result.entry,
      triggered: result.entry_triggered,
      target_hit: result.target_hit,
      stop_hit: result.stop_hit,
      neither_hit: result.neither_hit,
      best_r: result.best_r,
      worst_r: result.worst_r,
      time_to_entry_minutes: result.time_to_entry_minutes,
      execution_quality_label: shadowExecutionQualityLabel(result),
      risk_per_share: result.risk_per_share,
      risk_width_ratio_vs_original: result.risk_width_ratio_vs_original,
      risk_warning: result.risk_warning,
      not_live_signal: true,
      source: "entry_tuning_proposal",
      status: riskModelInvalid ? "risk_model_invalid" : "collecting_data",
    },
  };
}

function createRunId(startedAt: string) {
  return `rec_out_eval_${stableHash(startedAt)}`;
}

function buildCandleRequest({
  snapshot,
  horizon,
  now,
}: {
  snapshot: RecommendationSnapshot;
  horizon: RecommendationOutcomeHorizon;
  now: Date;
}): { request: RecommendationOutcomeCandleRequest | null; warnings: string[] } {
  const warnings: string[] = [];
  const ticker = snapshot.ticker?.trim().toUpperCase() ?? "";
  const recommendedAt = toDate(snapshot.recommended_at);
  const fixedHorizonMs = horizonMs(horizon);

  if (horizon === "eod") {
    warnings.push(
      "EOD candle window is not safely known in this runner yet; use fixed intraday horizons for now.",
    );
    return { request: null, warnings };
  }

  if (horizon === "next_open") {
    warnings.push(
      "Next-open candle window is not safely known in this runner yet.",
    );
    return { request: null, warnings };
  }

  if (!ticker || !recommendedAt || !fixedHorizonMs) {
    if (!fixedHorizonMs) {
      warnings.push("Evaluation horizon is unknown.");
    }
    return { request: null, warnings };
  }

  const requestedEnd = new Date(recommendedAt.getTime() + fixedHorizonMs);
  const end = requestedEnd.getTime() > now.getTime() ? now : requestedEnd;

  if (end.getTime() <= recommendedAt.getTime()) {
    warnings.push("Horizon has not elapsed yet; candle window is not ready.");
    return { request: null, warnings };
  }

  return {
    request: {
      request_id: `candle_${stableHash(
        `${snapshot.snapshot_fingerprint}|${horizon}`,
      )}`,
      snapshot_id: snapshot.id,
      snapshot_fingerprint: snapshot.snapshot_fingerprint,
      recommendation_id: snapshot.recommendation_id,
      ticker,
      horizon,
      start_at: recommendedAt.toISOString(),
      end_at: end.toISOString(),
      interval: "5min",
    },
    warnings,
  };
}

function buildReusableCandleRequest({
  snapshot,
  requests,
}: {
  snapshot: RecommendationSnapshot;
  requests: RecommendationOutcomeCandleRequest[];
}) {
  const sortedRequests = [...requests].sort(
    (first, second) =>
      new Date(second.end_at).getTime() - new Date(first.end_at).getTime(),
  );
  const maxRequest = sortedRequests[0] ?? null;

  if (!maxRequest) {
    return null;
  }

  return {
    ...maxRequest,
    request_id: `candle_${stableHash(
      `${snapshot.snapshot_fingerprint}|reused|max_horizon`,
    )}`,
    horizon: maxRequest.horizon,
  };
}

function candlesForRequestWindow(
  candles: RecommendationOutcomeCandle[],
  request: RecommendationOutcomeCandleRequest,
) {
  const start = new Date(request.start_at).getTime();
  const end = new Date(request.end_at).getTime();
  const intervalMs = request.interval === "15min" ? 15 * 60 * 1000 : 5 * 60 * 1000;

  return candles.filter((candle) => {
    const rawTimestamp =
      typeof candle.timestamp === "number"
        ? candle.timestamp
        : toDate(candle.timestamp)?.getTime();
    const timestamp =
      typeof rawTimestamp === "number" && rawTimestamp < 1_000_000_000_000
        ? rawTimestamp * 1000
        : rawTimestamp;
    const candleEnd = typeof timestamp === "number" ? timestamp + intervalMs : null;

    return (
      typeof timestamp === "number" &&
      typeof candleEnd === "number" &&
      Number.isFinite(timestamp) &&
      Number.isFinite(candleEnd) &&
      timestamp <= end &&
      candleEnd > start
    );
  });
}

function candleTime(candle: RecommendationOutcomeCandle | null | undefined) {
  if (!candle) {
    return null;
  }

  const rawTimestamp =
    typeof candle.timestamp === "number"
      ? candle.timestamp
      : toDate(candle.timestamp)?.getTime();
  const timestamp =
    typeof rawTimestamp === "number" && rawTimestamp < 1_000_000_000_000
      ? rawTimestamp * 1000
      : rawTimestamp;

  return typeof timestamp === "number" && Number.isFinite(timestamp)
    ? new Date(timestamp).toISOString()
    : null;
}

function warning(
  snapshot: RecommendationSnapshot,
  horizon: RecommendationOutcomeHorizon,
  warningId: string,
  message: string,
): RecommendationOutcomeEvaluationWarning {
  return {
    warning_id: warningId,
    snapshot_fingerprint: snapshot.snapshot_fingerprint,
    ticker: snapshot.ticker,
    horizon,
    message,
  };
}

function summarizeRun(run: Omit<RecommendationOutcomeEvaluationRun, "summary">) {
  if (run.status === "blocked") {
    return "Outcome evaluation is blocked because there are no eligible recommendation snapshots.";
  }

  if (run.status === "failed") {
    return "Outcome evaluation failed for all eligible snapshots.";
  }

  if (run.status === "partial") {
    return "Outcome evaluation completed partially; some snapshots need more candle data or provider recovery.";
  }

  if (run.status === "completed") {
    return "Outcome evaluation completed for eligible recent recommendation snapshots.";
  }

  return "Outcome evaluation is ready.";
}

export async function runRecommendationOutcomeEvaluation(
  options: RecommendationOutcomeEvaluationRunnerOptions,
): Promise<RecommendationOutcomeEvaluationRun> {
  const startedAt = (toDate(options.now ?? null) ?? new Date()).toISOString();
  const now = new Date(startedAt);
  const horizons = options.horizons?.length ? options.horizons : defaultHorizons;
  const existingOutcomes = options.existingOutcomes ?? [];
  const maxSnapshots = options.maxSnapshots ?? defaultMaxSnapshots;
  const fetchCandles = options.fetchCandles;
  const enrichmentMode = options.enrichCompletedOutcomes === true;
  const visibleSnapshots = [...options.snapshots].filter(
    (snapshot) => snapshot.is_visible !== false,
  );
  const sortedSnapshots =
    options.snapshotOrder === "input"
      ? visibleSnapshots.slice(0, maxSnapshots)
      : visibleSnapshots
          .sort((first, second) => {
            const firstTime = toDate(first.recommended_at)?.getTime() ?? 0;
            const secondTime = toDate(second.recommended_at)?.getTime() ?? 0;
            return secondTime - firstTime;
          })
          .slice(0, maxSnapshots);
  const candidates: RecommendationOutcomeEvaluationCandidate[] = [];
  const outcomes: RecommendationOutcome[] = [];
  const warnings: RecommendationOutcomeEvaluationWarning[] = [];

  if (sortedSnapshots.length === 0) {
    const planReferenceMetadataTrace = buildPlanReferenceMetadataTrace({
      snapshots: [],
      candidates: [],
      outcomes: [],
    });
    const blockedRun = {
      run_id: createRunId(startedAt),
      run_version: "1.0" as const,
      status: "blocked" as const,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      horizons,
      source: options.source ?? "unknown",
      provider: options.provider ?? null,
      eligible_snapshot_count: 0,
      evaluated_snapshot_count: 0,
      incomplete_snapshot_count: 0,
      missing_candle_count: 0,
      provider_error_count: 0,
      persisted_outcome_count: 0,
      candle_requests_planned: 0,
      candle_requests_executed: 0,
      candle_requests_saved_by_reuse: 0,
      provider_budget_limit: options.maxCandleRequests ?? null,
      skipped_due_to_budget_count: 0,
      pending_provider_budget_count: 0,
      retry_incomplete_count: 0,
      unique_candle_requests_count: 0,
      empty_candle_response_count: 0,
      provider_limit_count: 0,
      enrichment_mode: enrichmentMode,
      completed_outcomes_seen_count: 0,
      completed_outcomes_enriched_count: 0,
      completed_outcomes_skipped_already_enriched_count: 0,
      retained_candles_added_count: 0,
      counterfactual_ready_count: 0,
      shadow_entry_trial_count: 0,
      shadow_entry_triggered_count: 0,
      plan_price_freshness_summary: null,
      plan_reference_metadata_trace: planReferenceMetadataTrace,
      entry_type_trigger_summary: summarizeEntryTypeTriggerDiagnostics([]),
      candle_request_debug_sample: [],
      candidates,
      outcomes,
      warnings,
    };

    return { ...blockedRun, summary: summarizeRun(blockedRun) };
  }

  const providerBudgetLimit =
    typeof options.maxCandleRequests === "number" &&
    Number.isFinite(options.maxCandleRequests)
      ? Math.max(0, Math.floor(options.maxCandleRequests))
      : null;
  let candleRequestsPlanned = 0;
  let candleRequestsExecuted = 0;
  let candleRequestsBeforeReuse = 0;
  let skippedDueToBudgetCount = 0;
  let retryIncompleteCount = 0;
  let completedOutcomesSeenCount = 0;
  let completedOutcomesEnrichedCount = 0;
  let completedOutcomesSkippedAlreadyEnrichedCount = 0;
  let retainedCandlesAddedCount = 0;
  let counterfactualReadyCount = 0;
  let shadowEntryTrialCount = 0;
  let shadowEntryTriggeredCount = 0;
  const candleRequestDebugSample: Record<string, unknown>[] = [];

  for (const snapshot of sortedSnapshots) {
    const reusableHorizonWork: Array<{
      horizon: RecommendationOutcomeHorizon;
      existingOutcome: RecommendationOutcome | undefined;
      request: RecommendationOutcomeCandleRequest;
      requestWarnings: string[];
    }> = [];

    for (const horizon of horizons) {
      const existingOutcome = existingOutcomes.find(
        (outcome) =>
          outcome.snapshot_fingerprint === snapshot.snapshot_fingerprint &&
          outcome.horizon === horizon,
      );

      if (isProviderLimitOutcome(existingOutcome)) {
        retryIncompleteCount += 1;
      }

      const existingOutcomeCompleted = !isOutcomePending(existingOutcome);
      const existingOutcomeNeedsEnrichment =
        existingOutcomeCompleted && !hasRetainedCounterfactualCandles(existingOutcome);
      const existingOutcomeNeedsOfficialSemanticsRefresh =
        existingOutcomeCompleted &&
        outcomeNeedsOfficialTriggerSemanticsRefresh({
          outcome: existingOutcome,
          snapshot,
        });

      if (existingOutcomeCompleted) {
        completedOutcomesSeenCount += 1;
      }

      if (
        existingOutcomeCompleted &&
        enrichmentMode &&
        !existingOutcomeNeedsEnrichment &&
        !existingOutcomeNeedsOfficialSemanticsRefresh
      ) {
        completedOutcomesSkippedAlreadyEnrichedCount += 1;
      }

      if (
        existingOutcomeCompleted &&
        !existingOutcomeNeedsOfficialSemanticsRefresh &&
        (!enrichmentMode || !existingOutcomeNeedsEnrichment)
      ) {
        const existingEntryTypeMetadata =
          entryTypeMetadataFromOutcome(existingOutcome) ??
          entryTypeMetadataForSnapshot(snapshot);
        const existingEntryTypeTrigger =
          entryTypeTriggerFromOutcome(existingOutcome);
        candidates.push({
          candidate_id: `${snapshot.snapshot_fingerprint}:${horizon}`,
          snapshot_id: snapshot.id,
          snapshot_fingerprint: snapshot.snapshot_fingerprint,
          recommendation_id: snapshot.recommendation_id,
          ticker: snapshot.ticker,
          horizon,
          status: "skipped",
          candle_request: null,
          candle_count: 0,
          outcome_id: existingOutcome?.id ?? null,
          outcome_status: existingOutcome?.status ?? null,
          persistence_mode: "unknown",
          entry_type_metadata: existingEntryTypeMetadata,
          entry_type_aware_trigger: existingEntryTypeTrigger,
          warnings: [
            enrichmentMode && !existingOutcomeNeedsEnrichment
              ? "Outcome already has retained candles for counterfactual simulation."
              : "Outcome already has a terminal or completed status.",
          ],
          error: null,
        });
        continue;
      }

      if (!hasRequiredSnapshotFields(snapshot)) {
        const result = computeRecommendationOutcome({
          snapshot,
          horizon,
          evaluated_at: now,
          source: "snapshot_only",
          data_completeness: "none",
          warnings: ["Required snapshot fields are missing."],
        });
        const outcome = annotateOutcome(
          result.outcome,
          entryTypeDiagnosticPayload({
            snapshot,
            outcome: result.outcome,
            candles: [],
          }),
        );
        const persistence = options.persistOutcome
          ? await options.persistOutcome(outcome)
          : null;

        outcomes.push(outcome);
        candidates.push({
          candidate_id: `${snapshot.snapshot_fingerprint}:${horizon}`,
          snapshot_id: snapshot.id,
          snapshot_fingerprint: snapshot.snapshot_fingerprint,
          recommendation_id: snapshot.recommendation_id,
          ticker: snapshot.ticker,
          horizon,
          status: "missing_snapshot_fields",
          candle_request: null,
          candle_count: 0,
          outcome_id: outcome.id,
          outcome_status: outcome.status,
          persistence_mode: persistence?.mode ?? "unknown",
          entry_type_metadata: entryTypeMetadataFromOutcome(outcome),
          entry_type_aware_trigger: entryTypeTriggerFromOutcome(outcome),
          warnings: outcome.warnings,
          error: outcome.blockers[0] ?? null,
        });
        warnings.push(
          warning(
            snapshot,
            horizon,
            "missing_snapshot_fields",
            "Required snapshot fields are missing.",
          ),
        );
        continue;
      }

      const { request, warnings: requestWarnings } = buildCandleRequest({
        snapshot,
        horizon,
        now,
      });

      if (!request || !fetchCandles) {
        const reason = !fetchCandles
          ? "Candle provider is unavailable."
          : requestWarnings[0] ?? "Candle request is not ready.";
        const result = computeRecommendationOutcome({
          snapshot,
          horizon,
          evaluated_at: now,
          source: "snapshot_only",
          data_completeness: "none",
          warnings: [reason],
        });
        const outcome = annotateOutcome(
          result.outcome,
          entryTypeDiagnosticPayload({
            snapshot,
            outcome: result.outcome,
            candles: [],
          }),
        );
        const persistence = options.persistOutcome
          ? await options.persistOutcome(outcome)
          : null;

        outcomes.push(outcome);
        candidates.push({
          candidate_id: `${snapshot.snapshot_fingerprint}:${horizon}`,
          snapshot_id: snapshot.id,
          snapshot_fingerprint: snapshot.snapshot_fingerprint,
          recommendation_id: snapshot.recommendation_id,
          ticker: snapshot.ticker,
          horizon,
          status: !options.fetchCandles ? "provider_error" : "missing_candles",
          candle_request: request,
          candle_count: 0,
          outcome_id: outcome.id,
          outcome_status: outcome.status,
          persistence_mode: persistence?.mode ?? "unknown",
          entry_type_metadata: entryTypeMetadataFromOutcome(outcome),
          entry_type_aware_trigger: entryTypeTriggerFromOutcome(outcome),
          warnings: outcome.warnings,
          error: reason,
        });
        warnings.push(
          warning(snapshot, horizon, "missing_candles", reason),
        );
        continue;
      }

      reusableHorizonWork.push({
        horizon,
        existingOutcome,
        request,
        requestWarnings,
      });
    }

    if (reusableHorizonWork.length === 0) {
      continue;
    }

    candleRequestsPlanned += 1;
    candleRequestsBeforeReuse += reusableHorizonWork.length;

    if (
      providerBudgetLimit !== null &&
      candleRequestsExecuted >= providerBudgetLimit
    ) {
      skippedDueToBudgetCount += 1;

      for (const work of reusableHorizonWork) {
        const reason =
          "Outcome evaluation is pending because the provider budget guard stopped before this candle request.";

        candidates.push({
          candidate_id: `${snapshot.snapshot_fingerprint}:${work.horizon}`,
          snapshot_id: snapshot.id,
          snapshot_fingerprint: snapshot.snapshot_fingerprint,
          recommendation_id: snapshot.recommendation_id,
          ticker: snapshot.ticker,
          horizon: work.horizon,
          status: "pending_provider_budget",
          candle_request: work.request,
          candle_count: 0,
          outcome_id: work.existingOutcome?.id ?? null,
          outcome_status: work.existingOutcome?.status ?? "pending",
          persistence_mode: "unknown",
          plan_price_freshness: planPriceFreshnessFromOutcome(work.existingOutcome),
          entry_type_metadata:
            entryTypeMetadataFromOutcome(work.existingOutcome) ??
            entryTypeMetadataForSnapshot(snapshot),
          entry_type_aware_trigger: entryTypeTriggerFromOutcome(work.existingOutcome),
          warnings: [reason],
          error: null,
        });
        warnings.push(
          warning(snapshot, work.horizon, "pending_provider_budget", reason),
        );
      }

      continue;
    }

    const reusableRequest = buildReusableCandleRequest({
      snapshot,
      requests: reusableHorizonWork.map((work) => work.request),
    });

    if (!reusableRequest) {
      continue;
    }

    if (!fetchCandles) {
      continue;
    }

    candleRequestsExecuted += 1;
    const candleResult = await fetchCandles(reusableRequest);

    if (candleResult.diagnostics && candleRequestDebugSample.length < 8) {
      candleRequestDebugSample.push(candleResult.diagnostics);
    }

    for (const work of reusableHorizonWork) {
      const reusedCandles = candleResult.candles;
      const horizonCandles =
        candleResult.status === "available"
          ? candlesForRequestWindow(reusedCandles, work.request)
          : [];
      const firstReusedCandleTime = candleTime(reusedCandles[0]);
      const lastReusedCandleTime = candleTime(reusedCandles.at(-1));
      const firstHorizonCandleTime = candleTime(horizonCandles[0]);
      const lastHorizonCandleTime = candleTime(horizonCandles.at(-1));
      const horizonFilterDiagnostics = {
        reused_candle_count: reusedCandles.length,
        horizon_filtered_candle_count: horizonCandles.length,
        first_reused_candle_time: firstReusedCandleTime,
        last_reused_candle_time: lastReusedCandleTime,
        first_horizon_candle_time: firstHorizonCandleTime,
        last_horizon_candle_time: lastHorizonCandleTime,
        horizon_filter_start_at: work.request.start_at,
        horizon_filter_end_at: work.request.end_at,
      };

      if (candleResult.status !== "available" || horizonCandles.length === 0) {
        const reason =
          candleResult.status === "available" && reusedCandles.length > 0
            ? `horizon_filter_removed_all_candles: no reused candles overlapped ${work.request.start_at} to ${work.request.end_at}.`
            : candleResult.error ??
              candleResult.warnings[0] ??
              "No post-recommendation candles were returned for the requested horizon window.";
        const result = computeRecommendationOutcome({
          snapshot,
          horizon: work.horizon,
          evaluated_at: now,
          source: "intraday_candles",
          provider: candleResult.provider,
          data_completeness: "none",
          warnings: [reason, ...candleResult.warnings],
        });
        const outcome = annotateOutcome(result.outcome, {
          ...entryTypeDiagnosticPayload({
            snapshot,
            outcome: result.outcome,
            candles: horizonCandles,
          }),
          retryable: true,
          pending_reason:
            candleResult.status === "provider_error"
              ? "provider_error"
              : "missing_candles",
          provider_error:
            candleResult.status === "provider_error" ? reason : null,
          candle_request_debug: candleResult.diagnostics ?? null,
          ...horizonFilterDiagnostics,
        });
        const shouldRetainExistingCompleted =
          enrichmentMode &&
          work.existingOutcome !== undefined &&
          !isOutcomePending(work.existingOutcome);
        const persistence =
          shouldRetainExistingCompleted || !options.persistOutcome
            ? null
            : await options.persistOutcome(outcome);

        if (!shouldRetainExistingCompleted) {
          outcomes.push(outcome);
        }
        candidates.push({
          candidate_id: `${snapshot.snapshot_fingerprint}:${work.horizon}`,
          snapshot_id: snapshot.id,
          snapshot_fingerprint: snapshot.snapshot_fingerprint,
          recommendation_id: snapshot.recommendation_id,
          ticker: snapshot.ticker,
          horizon: work.horizon,
          status: shouldRetainExistingCompleted
            ? "skipped"
            : candleResult.status === "provider_error"
              ? "provider_error"
              : "pending_candles",
          candle_request: work.request,
          candle_count: horizonCandles.length,
          ...horizonFilterDiagnostics,
          outcome_id: shouldRetainExistingCompleted
            ? work.existingOutcome?.id ?? outcome.id
            : outcome.id,
          outcome_status: shouldRetainExistingCompleted
            ? work.existingOutcome?.status ?? outcome.status
            : outcome.status,
          persistence_mode: persistence?.mode ?? "unknown",
          entry_type_metadata: entryTypeMetadataFromOutcome(outcome),
          entry_type_aware_trigger: entryTypeTriggerFromOutcome(outcome),
          warnings: shouldRetainExistingCompleted
            ? [
                "Completed outcome retained unchanged; enrichment candles were unavailable.",
                ...outcome.warnings,
              ]
            : outcome.warnings,
          error: shouldRetainExistingCompleted ? null : reason,
        });
        warnings.push(
          warning(
            snapshot,
            work.horizon,
            candleResult.status === "provider_error"
              ? "provider_error"
              : "missing_candles",
            reason,
          ),
        );
        continue;
      }

      const result = computeRecommendationOutcome({
        snapshot,
        horizon: work.horizon,
        evaluated_at: now,
        source: "intraday_candles",
        provider: candleResult.provider,
        data_completeness: "complete",
        candles: horizonCandles,
        warnings: candleResult.warnings,
      });
      const outcome = annotateOutcome(result.outcome, {
        ...entryTypeDiagnosticPayload({
          snapshot,
          outcome: result.outcome,
          candles: horizonCandles,
        }),
        ...horizonFilterDiagnostics,
        ...retainedCandlePayload(horizonCandles),
        ...shadowEntryTrialPayload({
          snapshot,
          sourceOutcome: result.outcome,
          candles: horizonCandles,
        }),
      });
      if (outcome.payload_json.shadow_entry_trial) {
        shadowEntryTrialCount += 1;
        const shadowTrial =
          typeof outcome.payload_json.shadow_entry_trial === "object" &&
          outcome.payload_json.shadow_entry_trial !== null
            ? (outcome.payload_json.shadow_entry_trial as Record<string, unknown>)
            : null;

        if (shadowTrial?.triggered === true) {
          shadowEntryTriggeredCount += 1;
        }
      }
      const persistence = options.persistOutcome
        ? await options.persistOutcome(outcome)
        : null;

      outcomes.push(outcome);
      if (
        enrichmentMode &&
        work.existingOutcome !== undefined &&
        !isOutcomePending(work.existingOutcome)
      ) {
        completedOutcomesEnrichedCount += 1;
      }
      if (horizonCandles.length > 0) {
        retainedCandlesAddedCount += 1;
        counterfactualReadyCount += 1;
      }
      candidates.push({
        candidate_id: `${snapshot.snapshot_fingerprint}:${work.horizon}`,
        snapshot_id: snapshot.id,
        snapshot_fingerprint: snapshot.snapshot_fingerprint,
        recommendation_id: snapshot.recommendation_id,
        ticker: snapshot.ticker,
        horizon: work.horizon,
        status: result.can_compute_terminal_events
          ? "evaluated"
          : "incomplete_data",
        candle_request: work.request,
        candle_count: horizonCandles.length,
        ...horizonFilterDiagnostics,
        outcome_id: outcome.id,
        outcome_status: outcome.status,
        persistence_mode: persistence?.mode ?? "unknown",
        entry_type_metadata: entryTypeMetadataFromOutcome(outcome),
        entry_type_aware_trigger: entryTypeTriggerFromOutcome(outcome),
        warnings: outcome.warnings,
        error: persistence?.error ?? null,
      });
    }
  }

  const evaluatedCount = candidates.filter(
    (candidate) => candidate.status === "evaluated",
  ).length;
  const incompleteCount = candidates.filter(
    (candidate) =>
      candidate.status === "incomplete_data" ||
      candidate.status === "missing_snapshot_fields",
  ).length;
  const missingCandleCount = candidates.filter(
    (candidate) =>
      candidate.status === "missing_candles" ||
      candidate.status === "pending_candles",
  ).length;
  const providerErrorCount = candidates.filter(
    (candidate) => candidate.status === "provider_error",
  ).length;
  const pendingBudgetCount = candidates.filter(
    (candidate) => candidate.status === "pending_provider_budget",
  ).length;
  const emptyCandleResponseCount = candleRequestDebugSample.filter(
    (debug) => debug.response_status === "empty",
  ).length;
  const providerLimitCount =
    candidates.filter((candidate) =>
      hasProviderLimitText([candidate.error, ...candidate.warnings]),
    ).length +
    candleRequestDebugSample.filter((debug) =>
      hasProviderLimitText([
        typeof debug.provider_message === "string"
          ? debug.provider_message
          : null,
        typeof debug.response_category === "string"
          ? debug.response_category
          : null,
      ]),
    ).length;
  const persistedOutcomeCount = candidates.filter(
    (candidate) => candidate.persistence_mode !== "unknown",
  ).length;
  const attemptedCount = candidates.filter(
    (candidate) => candidate.status !== "skipped",
  ).length;
  const status: RecommendationOutcomeEvaluationRunStatus =
    attemptedCount === 0
      ? "blocked"
      : evaluatedCount === attemptedCount
        ? "completed"
        : evaluatedCount > 0
          ? "partial"
          : providerErrorCount > 0 && missingCandleCount + incompleteCount === 0
            ? "failed"
            : "partial";
  const outcomesById = new Map(outcomes.map((outcome) => [outcome.id, outcome]));
  const candidatesWithPlanFreshness = candidates.map((candidate) => ({
    ...candidate,
    plan_price_freshness:
      candidate.plan_price_freshness ??
      planPriceFreshnessFromOutcome(
        candidate.outcome_id ? outcomesById.get(candidate.outcome_id) : null,
      ),
    entry_type_metadata:
      candidate.entry_type_metadata ??
      entryTypeMetadataFromOutcome(
        candidate.outcome_id ? outcomesById.get(candidate.outcome_id) : null,
      ),
    entry_type_aware_trigger:
      candidate.entry_type_aware_trigger ??
      entryTypeTriggerFromOutcome(
        candidate.outcome_id ? outcomesById.get(candidate.outcome_id) : null,
      ),
  }));
  const planPriceFreshnessSummary = summarizePlanPriceFreshness(
    candidatesWithPlanFreshness.map((candidate) => ({
      ticker: candidate.ticker,
      snapshot_fingerprint: candidate.snapshot_fingerprint,
      horizon: candidate.horizon,
      diagnostics: candidate.plan_price_freshness ?? null,
    })),
  );
  const entryTypeTriggerSummary = summarizeEntryTypeTriggerDiagnostics(
    candidatesWithPlanFreshness.map((candidate) => {
      const outcome = candidate.outcome_id
        ? outcomesById.get(candidate.outcome_id)
        : undefined;

      return {
        ticker: candidate.ticker,
        entryType: candidate.entry_type_metadata ?? null,
        trigger: candidate.entry_type_aware_trigger ?? null,
        currentRouteTriggered: outcome?.entry_triggered ?? null,
        officialTriggered: outcome?.entry_triggered ?? null,
      };
    }),
  );
  const planReferenceMetadataTrace = buildPlanReferenceMetadataTrace({
    snapshots: sortedSnapshots,
    candidates: candidatesWithPlanFreshness,
    outcomes,
  });
  const completedRun = {
    run_id: createRunId(startedAt),
    run_version: "1.0" as const,
    status,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    horizons,
    source: options.source ?? "unknown",
    provider: options.provider ?? null,
    eligible_snapshot_count: sortedSnapshots.length,
    evaluated_snapshot_count: evaluatedCount,
    incomplete_snapshot_count: incompleteCount,
    missing_candle_count: missingCandleCount,
    provider_error_count: providerErrorCount,
    persisted_outcome_count: persistedOutcomeCount,
    candle_requests_planned: candleRequestsPlanned,
    candle_requests_executed: candleRequestsExecuted,
    candle_requests_saved_by_reuse: Math.max(
      0,
      candleRequestsBeforeReuse - candleRequestsPlanned,
    ),
    provider_budget_limit: providerBudgetLimit,
    skipped_due_to_budget_count: skippedDueToBudgetCount,
    pending_provider_budget_count: pendingBudgetCount,
    retry_incomplete_count: retryIncompleteCount,
    unique_candle_requests_count: candleRequestsExecuted,
    empty_candle_response_count: emptyCandleResponseCount,
    provider_limit_count: providerLimitCount,
    enrichment_mode: enrichmentMode,
    completed_outcomes_seen_count: completedOutcomesSeenCount,
    completed_outcomes_enriched_count: completedOutcomesEnrichedCount,
    completed_outcomes_skipped_already_enriched_count:
      completedOutcomesSkippedAlreadyEnrichedCount,
    retained_candles_added_count: retainedCandlesAddedCount,
    counterfactual_ready_count: counterfactualReadyCount,
    shadow_entry_trial_count: shadowEntryTrialCount,
    shadow_entry_triggered_count: shadowEntryTriggeredCount,
    plan_price_freshness_summary: planPriceFreshnessSummary,
    plan_reference_metadata_trace: planReferenceMetadataTrace,
    entry_type_trigger_summary: entryTypeTriggerSummary,
    candle_request_debug_sample: candleRequestDebugSample,
    candidates: candidatesWithPlanFreshness,
    outcomes,
    warnings,
  };

  return { ...completedRun, summary: summarizeRun(completedRun) };
}

export function recommendationOutcomeEvaluationRunJson(
  run: RecommendationOutcomeEvaluationRun,
) {
  return JSON.stringify(
    {
      ...run,
      outcomes_json: JSON.parse(recommendationOutcomesJson(run.outcomes)),
    },
    null,
    2,
  );
}

export function readRecommendationOutcomeEvaluationRunsFromLocalStorage(
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
) {
  if (!storage) {
    return [];
  }

  try {
    const parsed = JSON.parse(
      storage.getItem(recommendationOutcomeEvaluationRunStorageKey) ?? "[]",
    );
    return Array.isArray(parsed) ? (parsed as RecommendationOutcomeEvaluationRun[]) : [];
  } catch {
    return [];
  }
}

export function writeRecommendationOutcomeEvaluationRunToLocalStorage(
  run: RecommendationOutcomeEvaluationRun,
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
) {
  if (!storage) {
    return;
  }

  try {
    const existingRuns = readRecommendationOutcomeEvaluationRunsFromLocalStorage(
      storage,
    );
    storage.setItem(
      recommendationOutcomeEvaluationRunStorageKey,
      JSON.stringify([run, ...existingRuns].slice(0, 25)),
    );
  } catch {
    // Diagnostics are best-effort only.
  }
}
