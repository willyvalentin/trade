import { normalizeUnknownError } from "@/lib/error-logging";
import { classifySupabasePersistenceError } from "@/lib/persistence-error-classifier";
import { computePlanPriceFreshnessDiagnostics } from "@/lib/plan-price-freshness";
import { entryTypeMetadataForSnapshot } from "@/lib/recommendation-entry-type";
import {
  parseRecommendationConfidenceMetadata,
  planReferenceMetadataDiagnostics,
} from "@/lib/recommendation-inline-metadata";
import { buildConfidenceProjectionObservationSnapshotContract } from "@/lib/confidence-projection-observation-contract";

export type RecommendationSnapshotStatus =
  | "visible"
  | "hidden"
  | "taken"
  | "ignored"
  | "expired"
  | "invalid"
  | "unknown";

export type RecommendationSnapshotSource =
  | "supabase"
  | "local_storage"
  | "demo"
  | "dev_preview"
  | "unknown";

export type RecommendationSnapshotWindow =
  | "morning"
  | "midday"
  | "power_hour"
  | "unknown";

export type RecommendationSnapshotQuality = {
  intake_quality_result?: unknown;
  scan_observability_summary?: unknown;
  empty_state_summary?: unknown;
  data_mode_clarity_summary?: unknown;
  risk_controls_context?: unknown;
  pre_trade_risk_context?: unknown;
  trade_eligibility_context?: unknown;
  decision_stack_context?: unknown;
  position_sizing_summary?: unknown;
};

export type RecommendationSnapshotInput = {
  recommendation_id?: string | null;
  scan_run_id?: string | null;
  ticker?: string | null;
  company_name?: string | null;
  recommended_at?: string | Date | null;
  app_timestamp?: string | Date | null;
  window?: RecommendationSnapshotWindow | string | null;
  market_session_phase?: string | null;
  market_session_risk?: string | null;
  market_session_source?: string | null;
  source_mode?: RecommendationSnapshotSource | string | null;
  data_mode?: string | null;
  is_visible?: boolean | null;
  is_demo?: boolean | null;
  is_mock?: boolean | null;
  is_real?: boolean | null;
  entry?: number | null;
  entry_low?: number | null;
  entry_high?: number | null;
  stop?: number | null;
  target?: number | null;
  side?: string | null;
  direction?: string | null;
  trade_direction?: string | null;
  recommendation_side?: string | null;
  risk_per_share?: number | null;
  reward_per_share?: number | null;
  planned_risk_reward?: number | null;
  confidence?: number | string | null;
  score?: number | string | null;
  rating?: string | null;
  label?: string | null;
  type?: string | null;
  rationale?: string | null;
  reason?: string | null;
  catalyst?: string | null;
  primary_risk?: string | null;
  market_data_snapshot?: unknown;
  quote_price?: number | null;
  volume?: number | null;
  liquidity?: string | number | null;
  spread?: number | null;
  freshness?: string | null;
  data_age_minutes?: number | null;
  quality?: RecommendationSnapshotQuality | null;
  was_taken?: boolean | null;
  linked_position_id?: string | null;
  payload?: Record<string, unknown>;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
};

export type RecommendationSnapshot = {
  id: string;
  snapshot_fingerprint: string;
  recommendation_id: string | null;
  scan_run_id: string | null;
  ticker: string | null;
  company_name: string | null;
  recommended_at: string | null;
  app_timestamp: string;
  window: RecommendationSnapshotWindow;
  status: RecommendationSnapshotStatus;
  source_mode: string;
  data_mode: string;
  market_session_phase: string | null;
  market_session_risk: string | null;
  market_session_source: string | null;
  is_visible: boolean;
  is_demo: boolean;
  is_mock: boolean;
  is_real: boolean;
  entry: number | null;
  entry_low: number | null;
  entry_high: number | null;
  stop: number | null;
  target: number | null;
  side: string;
  risk_per_share: number | null;
  reward_per_share: number | null;
  planned_risk_reward: number | null;
  confidence: number | string | null;
  score: number | string | null;
  rating: string | null;
  label: string | null;
  type: string | null;
  rationale: string | null;
  reason: string | null;
  catalyst: string | null;
  primary_risk: string | null;
  market_data_snapshot: unknown;
  quote_price: number | null;
  volume: number | null;
  liquidity: string | number | null;
  spread: number | null;
  freshness: string | null;
  data_age_minutes: number | null;
  intake_quality_json: unknown;
  scan_observability_json: unknown;
  empty_state_json: unknown;
  quality_json: RecommendationSnapshotQuality | null;
  payload_json: Record<string, unknown>;
  was_taken: boolean;
  linked_position_id: string | null;
  created_at: string;
  updated_at: string;
};

export type RecommendationSnapshotPersistenceResult = {
  status: "saved" | "duplicate" | "failed";
  mode: "supabase" | "localStorage" | "none";
  snapshot: RecommendationSnapshot;
  error: string | null;
};

export type RecommendationSnapshotDeduplicationResult = {
  is_duplicate: boolean;
  snapshot_fingerprint: string;
  existing_snapshot_id: string | null;
};

export type RecommendationSnapshotShadowEntryTrialSummary = {
  shadow_snapshot_metadata_present_count: number;
  shadow_snapshot_metadata_missing_count: number;
  shadow_snapshot_variant_counts: Record<string, number>;
  shadow_snapshot_source_counts: Record<string, number>;
  shadow_snapshot_not_live_signal_count: number;
};

type SupabaseMutationResult = {
  error?: { message?: string } | null;
};

type SupabaseQueryBuilder = {
  upsert?: (
    value: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => PromiseLike<SupabaseMutationResult>;
  update?: (value: Record<string, unknown>) => {
    eq: (column: string, value: string) => PromiseLike<SupabaseMutationResult>;
  };
};

export type RecommendationSnapshotSupabaseClient = {
  from: (table: string) => SupabaseQueryBuilder;
};

export const recommendationSnapshotLocalStorageKey =
  "trade-recommendation-snapshots-v1";

const maxLocalSnapshots = 500;

function textOrNull(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toIso(value: string | Date | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }

  return null;
}

function normalizeWindow(
  value: RecommendationSnapshotInput["window"],
): RecommendationSnapshotWindow {
  if (value === "morning" || value === "opening" || value === "morning_momentum") {
    return "morning";
  }

  if (value === "midday" || value === "afternoon") {
    return "midday";
  }

  if (value === "power_hour") {
    return "power_hour";
  }

  return "unknown";
}

function normalizeSide(value: string | null | undefined) {
  const side = value?.trim().toLowerCase();

  if (side === "short" || side === "sell") {
    return "short";
  }

  if (side === "long" || side === "buy") {
    return "long";
  }

  return "unknown";
}

function sideFromPayload(payload: Record<string, unknown>) {
  const tradePlan =
    typeof payload.trade_plan === "object" && payload.trade_plan !== null
      ? (payload.trade_plan as Record<string, unknown>)
      : null;
  const recommendation =
    typeof payload.recommendation === "object" && payload.recommendation !== null
      ? (payload.recommendation as Record<string, unknown>)
      : null;

  return normalizeSide(
    String(
      payload.side ??
        payload.direction ??
        payload.trade_direction ??
        payload.recommendation_side ??
        tradePlan?.side ??
        tradePlan?.direction ??
        recommendation?.side ??
        recommendation?.direction ??
        "",
    ),
  );
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function compactFingerprintPart(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toFixed(4) : "unknown";
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : "unknown";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return "unknown";
}

function getEntry(input: RecommendationSnapshotInput) {
  const direct = finiteNumber(input.entry);

  if (direct !== null) {
    return direct;
  }

  const entryLow = finiteNumber(input.entry_low);
  const entryHigh = finiteNumber(input.entry_high);

  if (entryLow !== null && entryHigh !== null) {
    return (entryLow + entryHigh) / 2;
  }

  return entryHigh ?? entryLow;
}

function calculateRiskPerShare(
  entry: number | null,
  stop: number | null,
  side: string,
) {
  if (entry === null || stop === null) {
    return null;
  }

  const value = side === "short" ? stop - entry : entry - stop;
  return value > 0 ? value : null;
}

function calculateRewardPerShare(
  entry: number | null,
  target: number | null,
  side: string,
) {
  if (entry === null || target === null) {
    return null;
  }

  const value = side === "short" ? entry - target : target - entry;
  return value > 0 ? value : null;
}

function calculateRiskReward(
  riskPerShare: number | null,
  rewardPerShare: number | null,
) {
  if (
    riskPerShare === null ||
    rewardPerShare === null ||
    riskPerShare <= 0
  ) {
    return null;
  }

  return rewardPerShare / riskPerShare;
}

function shouldAttachShadowEntryTrial(input: RecommendationSnapshotInput) {
  const payload = input.payload ?? {};

  return (
    input.is_visible !== false &&
    input.is_demo !== true &&
    input.is_mock !== true &&
    input.source_mode === "supabase" &&
    payload.diagnostic_mode !== true &&
    payload.not_live_trade_signal !== true &&
    payload.visible_in_primary_recommendations !== false &&
    payload.batch_type !== "diagnostic" &&
    payload.source_mode !== "diagnostic"
  );
}

function shadowEntryTrialPayload(input: RecommendationSnapshotInput) {
  if (!shouldAttachShadowEntryTrial(input)) {
    return {};
  }

  return {
    shadow_entry_variant: "first_candle_close_entry",
    shadow_entry_source: "entry_tuning_proposal",
    shadow_entry_trial: true,
    shadow_entry_confidence: "low",
    shadow_entry_recommended_action: "paper_test_variant",
    shadow_entry_not_live_signal: true,
    shadow_entry_plan: {
      variant: "first_candle_close_entry",
      source: "entry_tuning_proposal",
      trial: true,
      confidence: "low",
      recommended_action: "paper_test_variant",
      not_live_signal: true,
    },
  };
}

export function recommendationSnapshotHasShadowEntryTrialMetadata(
  snapshot: Pick<RecommendationSnapshot, "payload_json">,
) {
  const payload = snapshot.payload_json ?? {};

  return (
    payload.shadow_entry_trial === true &&
    payload.shadow_entry_variant === "first_candle_close_entry" &&
    payload.shadow_entry_source === "entry_tuning_proposal" &&
    payload.shadow_entry_not_live_signal === true
  );
}

export function summarizeRecommendationSnapshotShadowEntryTrialMetadata(
  snapshots: Array<Pick<RecommendationSnapshot, "payload_json">>,
): RecommendationSnapshotShadowEntryTrialSummary {
  const summary: RecommendationSnapshotShadowEntryTrialSummary = {
    shadow_snapshot_metadata_present_count: 0,
    shadow_snapshot_metadata_missing_count: 0,
    shadow_snapshot_variant_counts: {},
    shadow_snapshot_source_counts: {},
    shadow_snapshot_not_live_signal_count: 0,
  };

  for (const snapshot of snapshots) {
    const payload = snapshot.payload_json ?? {};
    const hasMetadata = recommendationSnapshotHasShadowEntryTrialMetadata(snapshot);

    if (hasMetadata) {
      summary.shadow_snapshot_metadata_present_count += 1;
    } else {
      summary.shadow_snapshot_metadata_missing_count += 1;
    }

    if (payload.shadow_entry_not_live_signal === true) {
      summary.shadow_snapshot_not_live_signal_count += 1;
    }

    const variant =
      typeof payload.shadow_entry_variant === "string"
        ? payload.shadow_entry_variant
        : hasMetadata
          ? "first_candle_close_entry"
          : "missing";
    const source =
      typeof payload.shadow_entry_source === "string"
        ? payload.shadow_entry_source
        : hasMetadata
          ? "entry_tuning_proposal"
          : "missing";

    summary.shadow_snapshot_variant_counts[variant] =
      (summary.shadow_snapshot_variant_counts[variant] ?? 0) + 1;
    summary.shadow_snapshot_source_counts[source] =
      (summary.shadow_snapshot_source_counts[source] ?? 0) + 1;
  }

  return summary;
}

export function buildRecommendationSnapshotFingerprint(
  input: RecommendationSnapshotInput,
) {
  const ticker = textOrNull(input.ticker)?.toUpperCase() ?? "UNKNOWN";
  const recommendationId = textOrNull(input.recommendation_id);
  const recommendedAt = toIso(input.recommended_at);
  const appTimestamp = toIso(input.app_timestamp);
  const timeAnchor = recommendedAt ?? appTimestamp?.slice(0, 10) ?? "unknown";
  const rationaleAnchor = textOrNull(input.rationale ?? input.reason);
  const rationaleHash = rationaleAnchor ? stableHash(rationaleAnchor) : "no-rationale";
  const window = normalizeWindow(input.window);
  const side =
    normalizeSide(
      input.side ??
        input.direction ??
        input.trade_direction ??
        input.recommendation_side,
    ) || "unknown";
  const entry = getEntry(input);
  const stop = finiteNumber(input.stop);
  const target = finiteNumber(input.target);
  const parts = [
    recommendationId ?? "no-recommendation-id",
    ticker,
    timeAnchor,
    compactFingerprintPart(entry),
    compactFingerprintPart(stop),
    compactFingerprintPart(target),
    window,
    side,
    rationaleHash,
  ];

  return `rec_snap_${stableHash(parts.join("|"))}`;
}

export function buildRecommendationSnapshot(
  input: RecommendationSnapshotInput,
): RecommendationSnapshot {
  const appTimestamp = toIso(input.app_timestamp) ?? new Date().toISOString();
  const createdAt = toIso(input.created_at) ?? appTimestamp;
  const updatedAt = toIso(input.updated_at) ?? appTimestamp;
  const entry = getEntry(input);
  const stop = finiteNumber(input.stop);
  const target = finiteNumber(input.target);
  const side = normalizeSide(input.side);
  const riskPerShare =
    finiteNumber(input.risk_per_share) ?? calculateRiskPerShare(entry, stop, side);
  const rewardPerShare =
    finiteNumber(input.reward_per_share) ??
    calculateRewardPerShare(entry, target, side);
  const plannedRiskReward =
    finiteNumber(input.planned_risk_reward) ??
    calculateRiskReward(riskPerShare, rewardPerShare);
  const snapshotFingerprint = buildRecommendationSnapshotFingerprint(input);
  const quality = input.quality ?? null;
  const inputPayload = input.payload ?? {};
  const payloadRecommendation = objectOrNull(inputPayload.recommendation);
  const inlineMetadata = parseRecommendationConfidenceMetadata(
    typeof payloadRecommendation?.reason_to_avoid === "string"
      ? payloadRecommendation.reason_to_avoid
      : null,
  );
  const planReferenceMetadata =
    objectOrNull(inlineMetadata?.plan_reference_price) ?? inlineMetadata;
  const hasInlineReferencePrice =
    finiteNumber(planReferenceMetadata?.reference_price_used_for_plan) !== null;
  const planReferenceStatus = planReferenceMetadataDiagnostics({
    referencePrice:
      planReferenceMetadata?.reference_price_used_for_plan ??
      inputPayload.reference_price_used_for_plan,
    entry,
    stop,
    target,
  });
  const payloadJson = {
    ...inputPayload,
    ...(hasInlineReferencePrice ? planReferenceMetadata : {}),
    plan_reference_price: hasInlineReferencePrice
      ? {
          ...(objectOrNull(inputPayload.plan_reference_price) ?? {}),
          ...planReferenceMetadata,
        }
      : objectOrNull(inputPayload.plan_reference_price) ?? null,
    ...planReferenceStatus,
    ...shadowEntryTrialPayload(input),
    side,
    direction: side,
    trade_direction: side,
    recommendation_side: side,
    trade_plan: {
      ...((input.payload?.trade_plan &&
      typeof input.payload.trade_plan === "object" &&
      !Array.isArray(input.payload.trade_plan)
        ? input.payload.trade_plan
        : {}) as Record<string, unknown>),
      side,
      direction: side,
      action: side === "short" ? "sell" : side === "long" ? "buy" : null,
      ...(hasInlineReferencePrice ? planReferenceMetadata : {}),
      ...planReferenceStatus,
    },
  };
  const payloadJsonRecord = payloadJson as Record<string, unknown>;
  const entryTypeMetadata = entryTypeMetadataForSnapshot({
    ticker: textOrNull(input.ticker)?.toUpperCase() ?? null,
    entry,
    side,
    quote_price: finiteNumber(input.quote_price),
    payload_json: payloadJsonRecord,
  });
  const planPriceFreshness = computePlanPriceFreshnessDiagnostics({
    snapshot: {
      snapshot_fingerprint: snapshotFingerprint,
      ticker: textOrNull(input.ticker)?.toUpperCase() ?? null,
      recommended_at: toIso(input.recommended_at),
      entry,
      stop,
      target,
      quote_price: finiteNumber(input.quote_price),
      market_data_snapshot: input.market_data_snapshot ?? null,
      payload_json: payloadJsonRecord,
    },
  });
  const snapshotContractBase = {
    id: snapshotFingerprint,
    snapshot_fingerprint: snapshotFingerprint,
    recommendation_id: textOrNull(input.recommendation_id),
    ticker: textOrNull(input.ticker)?.toUpperCase() ?? null,
    side,
    recommended_at: toIso(input.recommended_at),
    window: normalizeWindow(input.window),
    recommendation_tier: textOrNull(input.rating) ?? textOrNull(input.label),
    setup_type: textOrNull(input.type),
    entry,
    stop,
    target,
    risk_per_share: riskPerShare,
    reward_per_share: rewardPerShare,
    planned_risk_reward: plannedRiskReward,
    original_confidence:
      finiteNumber(input.confidence) ??
      finiteNumber(input.score) ??
      textOrNull(String(input.confidence ?? "")) ??
      textOrNull(String(input.score ?? "")),
    captured_at: createdAt,
  };
  const confidenceProjectionObservationContract =
    buildConfidenceProjectionObservationSnapshotContract(snapshotContractBase);
  const payloadJsonWithDiagnostics = {
    ...payloadJson,
    confidence_projection_observation_contract:
      confidenceProjectionObservationContract,
    ...entryTypeMetadata,
    entry_type_metadata: entryTypeMetadata,
    trade_plan: {
      ...(objectOrNull(payloadJsonRecord.trade_plan) ?? {}),
      ...entryTypeMetadata,
    },
    recommendation:
      payloadJsonRecord.recommendation &&
      typeof payloadJsonRecord.recommendation === "object" &&
      !Array.isArray(payloadJsonRecord.recommendation)
        ? {
            ...(payloadJsonRecord.recommendation as Record<string, unknown>),
            ...(hasInlineReferencePrice ? planReferenceMetadata : {}),
            ...planReferenceStatus,
            ...entryTypeMetadata,
          }
        : payloadJsonRecord.recommendation,
    plan_price_freshness: planPriceFreshness,
  };

  return {
    id: snapshotFingerprint,
    snapshot_fingerprint: snapshotFingerprint,
    recommendation_id: textOrNull(input.recommendation_id),
    scan_run_id: textOrNull(input.scan_run_id),
    ticker: textOrNull(input.ticker)?.toUpperCase() ?? null,
    company_name: textOrNull(input.company_name),
    recommended_at: toIso(input.recommended_at),
    app_timestamp: appTimestamp,
    window: normalizeWindow(input.window),
    status: input.is_visible === false ? "hidden" : "visible",
    source_mode: textOrNull(String(input.source_mode ?? "")) ?? "unknown",
    data_mode: textOrNull(input.data_mode) ?? "unknown",
    market_session_phase: textOrNull(input.market_session_phase),
    market_session_risk: textOrNull(input.market_session_risk),
    market_session_source: textOrNull(input.market_session_source),
    is_visible: input.is_visible !== false,
    is_demo: input.is_demo === true,
    is_mock: input.is_mock === true,
    is_real: input.is_real === true,
    entry,
    entry_low: finiteNumber(input.entry_low),
    entry_high: finiteNumber(input.entry_high),
    stop,
    target,
    side,
    risk_per_share: riskPerShare,
    reward_per_share: rewardPerShare,
    planned_risk_reward: plannedRiskReward,
    confidence: finiteNumber(input.confidence) ?? textOrNull(String(input.confidence ?? "")),
    score: finiteNumber(input.score) ?? textOrNull(String(input.score ?? "")),
    rating: textOrNull(input.rating),
    label: textOrNull(input.label),
    type: textOrNull(input.type),
    rationale: textOrNull(input.rationale),
    reason: textOrNull(input.reason),
    catalyst: textOrNull(input.catalyst),
    primary_risk: textOrNull(input.primary_risk),
    market_data_snapshot: input.market_data_snapshot ?? null,
    quote_price: finiteNumber(input.quote_price),
    volume: finiteNumber(input.volume),
    liquidity: finiteNumber(input.liquidity) ?? textOrNull(String(input.liquidity ?? "")),
    spread: finiteNumber(input.spread),
    freshness: textOrNull(input.freshness),
    data_age_minutes: finiteNumber(input.data_age_minutes),
    intake_quality_json: quality?.intake_quality_result ?? null,
    scan_observability_json: quality?.scan_observability_summary ?? null,
    empty_state_json: quality?.empty_state_summary ?? null,
    quality_json: quality,
    payload_json: payloadJsonWithDiagnostics,
    was_taken: input.was_taken === true,
    linked_position_id: textOrNull(input.linked_position_id),
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

export function recommendationSnapshotJson(
  snapshot: RecommendationSnapshot,
): string {
  return JSON.stringify(snapshot, null, 2);
}

export function recommendationSnapshotsJson(
  snapshots: RecommendationSnapshot[],
): string {
  return JSON.stringify(
    {
      snapshot_count: snapshots.length,
      snapshots,
    },
    null,
    2,
  );
}

export function readRecommendationSnapshotsFromLocalStorage(
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
) {
  if (!storage) {
    return [];
  }

  try {
    const parsed = JSON.parse(
      storage.getItem(recommendationSnapshotLocalStorageKey) ?? "[]",
    );
    return Array.isArray(parsed) ? (parsed as RecommendationSnapshot[]) : [];
  } catch {
    return [];
  }
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeStatus(value: unknown): RecommendationSnapshotStatus {
  if (
    value === "visible" ||
    value === "hidden" ||
    value === "taken" ||
    value === "ignored" ||
    value === "expired" ||
    value === "invalid" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

export function recommendationSnapshotFromPersistenceRow(
  row: Record<string, unknown>,
): RecommendationSnapshot | null {
  const snapshotFingerprint = textOrNull(
    String(row.snapshot_fingerprint ?? row.id ?? ""),
  );

  if (!snapshotFingerprint) return null;

  const payloadJson = objectOrNull(row.payload_json) ?? {};
  const recommendedAt = toIso(String(row.recommended_at ?? ""));
  const createdAt =
    toIso(String(row.created_at ?? "")) ?? recommendedAt ?? new Date().toISOString();
  const updatedAt = toIso(String(row.updated_at ?? "")) ?? createdAt;
  const status = normalizeStatus(row.status);
  const sourceMode = textOrNull(String(row.source_mode ?? "")) ?? "unknown";
  const dataMode = textOrNull(String(row.data_mode ?? "")) ?? "unknown";
  const entry = finiteNumber(row.entry);
  const stop = finiteNumber(row.stop);
  const target = finiteNumber(row.target);
  const side = sideFromPayload(payloadJson);
  const riskPerShare =
    finiteNumber(payloadJson.risk_per_share) ??
    calculateRiskPerShare(entry, stop, side);
  const rewardPerShare =
    finiteNumber(payloadJson.reward_per_share) ??
    calculateRewardPerShare(entry, target, side);
  const plannedRiskReward =
    finiteNumber(row.risk_reward) ??
    finiteNumber(payloadJson.planned_risk_reward) ??
    calculateRiskReward(riskPerShare, rewardPerShare);

  return {
    id: textOrNull(String(row.id ?? "")) ?? snapshotFingerprint,
    snapshot_fingerprint: snapshotFingerprint,
    recommendation_id: textOrNull(String(row.recommendation_id ?? "")),
    scan_run_id: textOrNull(String(row.scan_run_id ?? "")),
    ticker: textOrNull(String(row.ticker ?? ""))?.toUpperCase() ?? null,
    company_name: textOrNull(String(payloadJson.company_name ?? "")),
    recommended_at: recommendedAt,
    app_timestamp:
      toIso(String(payloadJson.app_timestamp ?? "")) ?? recommendedAt ?? createdAt,
    window: normalizeWindow(String(row.window ?? payloadJson.window ?? "")),
    status,
    source_mode: sourceMode,
    data_mode: dataMode,
    market_session_phase: textOrNull(String(row.market_session_phase ?? "")),
    market_session_risk: textOrNull(String(payloadJson.market_session_risk ?? "")),
    market_session_source: textOrNull(
      String(payloadJson.market_session_source ?? ""),
    ),
    is_visible: status === "visible" || status === "taken",
    is_demo: payloadJson.is_demo === true,
    is_mock: payloadJson.is_mock === true,
    is_real: payloadJson.is_real === true || sourceMode === "supabase",
    entry,
    entry_low: finiteNumber(payloadJson.entry_low),
    entry_high: finiteNumber(payloadJson.entry_high),
    stop,
    target,
    side,
    risk_per_share: riskPerShare,
    reward_per_share: rewardPerShare,
    planned_risk_reward: plannedRiskReward,
    confidence:
      finiteNumber(row.confidence) ?? textOrNull(String(payloadJson.confidence ?? "")),
    score: finiteNumber(row.score) ?? textOrNull(String(payloadJson.score ?? "")),
    rating: textOrNull(String(payloadJson.rating ?? "")),
    label: textOrNull(String(payloadJson.label ?? "")),
    type: textOrNull(String(payloadJson.type ?? "")),
    rationale: textOrNull(String(row.rationale ?? payloadJson.rationale ?? "")),
    reason: textOrNull(String(payloadJson.reason ?? "")),
    catalyst: textOrNull(String(payloadJson.catalyst ?? "")),
    primary_risk: textOrNull(String(payloadJson.primary_risk ?? "")),
    market_data_snapshot: payloadJson.market_data_snapshot ?? null,
    quote_price: finiteNumber(payloadJson.quote_price),
    volume: finiteNumber(payloadJson.volume),
    liquidity:
      finiteNumber(payloadJson.liquidity) ??
      textOrNull(String(payloadJson.liquidity ?? "")),
    spread: finiteNumber(payloadJson.spread),
    freshness: textOrNull(String(payloadJson.freshness ?? "")),
    data_age_minutes: finiteNumber(payloadJson.data_age_minutes),
    intake_quality_json: row.intake_quality_json ?? null,
    scan_observability_json: row.scan_observability_json ?? null,
    empty_state_json: payloadJson.empty_state_json ?? null,
    quality_json: objectOrNull(payloadJson.quality_json),
    payload_json: payloadJson,
    was_taken: row.was_taken === true,
    linked_position_id: textOrNull(String(row.linked_position_id ?? "")),
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

export function checkRecommendationSnapshotDeduplication(
  snapshot: RecommendationSnapshot,
  existingSnapshots: RecommendationSnapshot[],
): RecommendationSnapshotDeduplicationResult {
  const existingSnapshot = existingSnapshots.find(
    (item) => item.snapshot_fingerprint === snapshot.snapshot_fingerprint,
  );

  return {
    is_duplicate: existingSnapshot !== undefined,
    snapshot_fingerprint: snapshot.snapshot_fingerprint,
    existing_snapshot_id: existingSnapshot?.id ?? null,
  };
}

export function persistRecommendationSnapshotToLocalStorage(
  snapshot: RecommendationSnapshot,
  storage: Storage | undefined =
    typeof window === "undefined" ? undefined : window.localStorage,
): RecommendationSnapshotPersistenceResult {
  if (!storage) {
    return {
      status: "failed",
      mode: "none",
      snapshot,
      error: "localStorage is unavailable.",
    };
  }

  try {
    const existingSnapshots = readRecommendationSnapshotsFromLocalStorage(storage);
    const deduplication = checkRecommendationSnapshotDeduplication(
      snapshot,
      existingSnapshots,
    );

    if (deduplication.is_duplicate) {
      return {
        status: "duplicate",
        mode: "localStorage",
        snapshot,
        error: null,
      };
    }

    storage.setItem(
      recommendationSnapshotLocalStorageKey,
      JSON.stringify([snapshot, ...existingSnapshots].slice(0, maxLocalSnapshots)),
    );

    return {
      status: "saved",
      mode: "localStorage",
      snapshot,
      error: null,
    };
  } catch (error) {
    return {
      status: "failed",
      mode: "localStorage",
      snapshot,
      error: error instanceof Error ? error.message : "Unknown localStorage error.",
    };
  }
}

function toSupabaseRow(snapshot: RecommendationSnapshot) {
  return {
    id: snapshot.id,
    snapshot_fingerprint: snapshot.snapshot_fingerprint,
    recommendation_id: snapshot.recommendation_id,
    scan_run_id: snapshot.scan_run_id,
    ticker: snapshot.ticker,
    recommended_at: snapshot.recommended_at,
    window: snapshot.window,
    status: snapshot.status,
    source_mode: snapshot.source_mode,
    data_mode: snapshot.data_mode,
    market_session_phase: snapshot.market_session_phase,
    entry: snapshot.entry,
    stop: snapshot.stop,
    target: snapshot.target,
    confidence: finiteNumber(snapshot.confidence),
    score: finiteNumber(snapshot.score),
    risk_reward: snapshot.planned_risk_reward,
    rationale: snapshot.rationale,
    payload_json: snapshot.payload_json,
    intake_quality_json: snapshot.intake_quality_json,
    scan_observability_json: snapshot.scan_observability_json,
    was_taken: snapshot.was_taken,
    linked_position_id: snapshot.linked_position_id,
    created_at: snapshot.created_at,
    updated_at: snapshot.updated_at,
  };
}

export async function persistRecommendationSnapshot(
  snapshot: RecommendationSnapshot,
  options: {
    supabaseClient?: RecommendationSnapshotSupabaseClient | null;
    storage?: Storage;
    server?: boolean;
    unavailableReason?: string | null;
  } = {},
): Promise<RecommendationSnapshotPersistenceResult> {
  if (options.supabaseClient?.from) {
    try {
      const result = await options.supabaseClient
        .from("recommendation_snapshots")
        .upsert?.(toSupabaseRow(snapshot), {
          onConflict: "snapshot_fingerprint",
          ignoreDuplicates: true,
        });

      if (!result?.error) {
        return {
          status: "saved",
          mode: "supabase",
          snapshot,
          error: null,
        };
      }

      console.error("[recommendation-snapshot] supabase_persistence_error", {
        source: "supabase.recommendation_snapshots",
        operation: "upsert_snapshot",
        snapshotFingerprint: snapshot.snapshot_fingerprint,
        recommendationId: snapshot.recommendation_id,
        error: normalizeUnknownError(result.error),
      });
      return {
        status: "failed",
        mode: "supabase",
        snapshot,
        error:
          `${classifySupabasePersistenceError(result.error)}:${
            result.error.message ??
            "Unknown Supabase recommendation snapshot persistence error."
          }`,
      };
    } catch (error) {
      console.error("[recommendation-snapshot] supabase_persistence_exception", {
        source: "supabase.recommendation_snapshots",
        operation: "upsert_snapshot",
        snapshotFingerprint: snapshot.snapshot_fingerprint,
        recommendationId: snapshot.recommendation_id,
        error: normalizeUnknownError(error),
      });
      return {
        status: "failed",
        mode: "supabase",
        snapshot,
        error:
          `${classifySupabasePersistenceError(error)}:${
            error instanceof Error
              ? error.message
              : "Unknown Supabase recommendation snapshot persistence error."
          }`,
      };
    }
  }

  if (options.server) {
    return {
      status: "failed",
      mode: "none",
      snapshot,
      error: options.unavailableReason
        ? `server_persistence_unavailable:${options.unavailableReason}`
        : "server_persistence_unavailable",
    };
  }

  return persistRecommendationSnapshotToLocalStorage(snapshot, options.storage);
}

export async function markRecommendationSnapshotTaken(
  input: {
    snapshot_fingerprint?: string | null;
    recommendation_id?: string | null;
    linked_position_id?: string | null;
    taken_at?: string | Date | null;
  },
  options: {
    supabaseClient?: RecommendationSnapshotSupabaseClient | null;
    storage?: Storage;
  } = {},
): Promise<RecommendationSnapshotPersistenceResult | null> {
  const updatedAt = toIso(input.taken_at) ?? new Date().toISOString();
  const fingerprint = textOrNull(input.snapshot_fingerprint);
  const recommendationId = textOrNull(input.recommendation_id);
  const linkedPositionId = textOrNull(input.linked_position_id);

  if (options.supabaseClient?.from && (fingerprint || recommendationId)) {
    try {
      const builder = options.supabaseClient.from("recommendation_snapshots");
      const update = builder.update?.({
        status: "taken",
        was_taken: true,
        linked_position_id: linkedPositionId,
        updated_at: updatedAt,
      });
      const result = fingerprint
        ? await update?.eq("snapshot_fingerprint", fingerprint)
        : recommendationId
          ? await update?.eq("recommendation_id", recommendationId)
          : null;

      if (!result?.error && fingerprint) {
        return {
          status: "saved",
          mode: "supabase",
          snapshot: buildRecommendationSnapshot({
            recommendation_id: recommendationId,
            linked_position_id: linkedPositionId,
            app_timestamp: updatedAt,
            was_taken: true,
          }),
          error: null,
        };
      }
    } catch {
      // Fall through to localStorage. Taken marking is best-effort metadata only.
    }
  }

  const snapshots = readRecommendationSnapshotsFromLocalStorage(options.storage);
  const nextSnapshots = snapshots.map((snapshot) => {
    const matchesFingerprint =
      fingerprint !== null && snapshot.snapshot_fingerprint === fingerprint;
    const matchesRecommendation =
      recommendationId !== null && snapshot.recommendation_id === recommendationId;

    if (!matchesFingerprint && !matchesRecommendation) {
      return snapshot;
    }

    return {
      ...snapshot,
      status: "taken" as const,
      was_taken: true,
      linked_position_id: linkedPositionId,
      updated_at: updatedAt,
    };
  });

  if (nextSnapshots === snapshots || nextSnapshots.length === 0) {
    return null;
  }

  try {
    const storage =
      options.storage ??
      (typeof window === "undefined" ? undefined : window.localStorage);
    storage?.setItem(
      recommendationSnapshotLocalStorageKey,
      JSON.stringify(nextSnapshots),
    );
    const snapshot = nextSnapshots.find(
      (item) =>
        (fingerprint !== null && item.snapshot_fingerprint === fingerprint) ||
        (recommendationId !== null && item.recommendation_id === recommendationId),
    );

    return snapshot
      ? {
          status: "saved",
          mode: "localStorage",
          snapshot,
          error: null,
        }
      : null;
  } catch (error) {
    const snapshot = snapshots[0];

    return snapshot
      ? {
          status: "failed",
          mode: "localStorage",
          snapshot,
          error:
            error instanceof Error
              ? error.message
              : "Unknown localStorage error.",
        }
      : null;
  }
}
