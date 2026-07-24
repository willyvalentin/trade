import type { Action336IntelligenceContextStaticFixture } from "@/lib/intelligence-context-static-fixtures";
import type {
  Action335LearningDatasetRow,
  LearningDatasetContext,
  LearningDatasetContextValue,
  LearningDatasetOutcome,
  LearningDatasetProvenance,
} from "@/lib/learning-dataset-static-fixtures";
import { LEARNING_DATASET_STATIC_FIXTURE_SCHEMA_VERSION } from "@/lib/learning-dataset-static-fixtures";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export type SnapshotToLearningDatasetMapperInput = Readonly<{
  recommendationSnapshot: Readonly<RecommendationSnapshot>;
  contextSnapshot: Readonly<Action336IntelligenceContextStaticFixture> | null;
  outcome: Readonly<RecommendationOutcome> | null;
}>;

export type SnapshotToLearningDatasetMapperIssueCode =
  | "missing_required_identity"
  | "invalid_linkage"
  | "conflicting_aliases"
  | "invalid_timestamp"
  | "temporal_violation"
  | "future_leakage"
  | "invalid_provenance"
  | "invalid_outcome"
  | "invalid_input"
  | "missing_optional_context"
  | "missing_optional_outcome"
  | "unknown_setup"
  | "unavailable_source"
  | "partial_provenance";

export type SnapshotToLearningDatasetMapperIssue = Readonly<{
  code: SnapshotToLearningDatasetMapperIssueCode;
  path: string;
  severity: "error" | "warning";
  messageKey: `mapper.issue.${SnapshotToLearningDatasetMapperIssueCode}`;
}>;

export type SnapshotToLearningDatasetMapperSuccessStatus =
  | "mapped"
  | "mapped_with_missing_optional_data";

export type SnapshotToLearningDatasetMapperBlockedStatus =
  | "blocked_missing_required_identity"
  | "blocked_invalid_linkage"
  | "blocked_conflicting_aliases"
  | "blocked_temporal_violation"
  | "blocked_future_leakage"
  | "blocked_invalid_provenance"
  | "blocked_invalid_outcome"
  | "blocked_invalid_input";

export type SnapshotToLearningDatasetMapperResult =
  | Readonly<{
      status: SnapshotToLearningDatasetMapperSuccessStatus;
      row: Action335LearningDatasetRow;
      issues: readonly SnapshotToLearningDatasetMapperIssue[];
      consumable: true;
    }>
  | Readonly<{
      status: SnapshotToLearningDatasetMapperBlockedStatus;
      row: null;
      issues: readonly SnapshotToLearningDatasetMapperIssue[];
      consumable: false;
    }>;

type UnknownRecord = Record<string, unknown>;

type ResolvedAliases = Readonly<{
  recommendationAt: string;
  snapshotAt: string;
  contextCapturedAt: string | null;
  contextEffectiveAt: string | null;
  outcomeAt: string | null;
  side: "long" | "short";
  setupFamily: string;
  numericConfidence: number;
  confidenceLabel: "low" | "medium" | "high" | "unknown";
}>;

const mapperVersion = "snapshot_to_learning_dataset_mapper_v1" as const;
const outcomeContextKeys = [
  "outcome_status",
  "target_hit",
  "stop_hit",
  "gross_r_multiple",
  "max_favorable_excursion_r",
  "max_adverse_excursion_r",
] as const;
const supportedSetups = new Set([
  "momentum_continuation",
  "vwap_reclaim",
  "opening_drive",
  "pullback_to_support",
  "breakout_continuation",
  "reversal_from_exhaustion",
  "range_break",
  "news_or_catalyst_momentum",
]);
const supportedOutcomeStatuses = new Set([
  "pending",
  "entry_not_triggered",
  "entry_triggered",
  "target_hit",
  "stop_hit",
  "target_before_stop",
  "stop_before_target",
  "neither_hit",
  "expired",
  "incomplete",
]);
const supportedHorizons = new Set(["15m", "30m", "60m"]);
const supportedWindows = new Set(["morning", "midday", "power_hour", "unknown"]);
const supportedContextStates = new Set([
  "present",
  "explicit_null",
  "unavailable",
  "unknown",
]);
const supportedFreshnessStates = new Set([
  "fresh",
  "stale",
  "unknown",
  "unavailable",
]);
const supportedContextCategories = {
  indexDirection: new Set(["up", "down", "neutral"]),
  marketRegime: new Set(["bullish", "bearish", "mixed"]),
  volatilityRegime: new Set(["low", "elevated"]),
  sectorRelativeStrength: new Set(["strong", "weak", "conflicting"]),
  intradayRelativeStrength: new Set(["positive", "negative", "conflicting"]),
  catalystType: new Set([
    "product_announcement",
    "earnings",
    "guidance",
    "fda",
    "sec",
    "sec_filing",
    "neutral_company_update",
    "company_update",
  ]),
  eventType: new Set([
    "macro_release",
    "cpi",
    "fomc",
    "jobs_report",
    "options_expiration",
  ]),
  eventRisk: new Set(["none", "moderate", "high"]),
} as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function owns(record: UnknownRecord, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function nested(record: UnknownRecord, path: readonly string[]): unknown {
  let current: unknown = record;
  for (const segment of path) {
    if (!isRecord(current)) return undefined;
    current = current[segment];
  }
  return current;
}

function issue(
  code: SnapshotToLearningDatasetMapperIssueCode,
  path: string,
  severity: "error" | "warning",
): SnapshotToLearningDatasetMapperIssue {
  return {
    code,
    path,
    severity,
    messageKey: `mapper.issue.${code}`,
  };
}

function orderedIssues(
  values: readonly SnapshotToLearningDatasetMapperIssue[],
): SnapshotToLearningDatasetMapperIssue[] {
  const seen = new Set<string>();
  const deduped: SnapshotToLearningDatasetMapperIssue[] = [];
  for (const value of values) {
    const key = `${value.code}\u0000${value.path}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(value);
    }
  }
  return deduped.sort(
    (left, right) =>
      left.path.localeCompare(right.path) || left.code.localeCompare(right.code),
  );
}

function blocked(
  status: SnapshotToLearningDatasetMapperBlockedStatus,
  issues: readonly SnapshotToLearningDatasetMapperIssue[],
): SnapshotToLearningDatasetMapperResult {
  return { status, row: null, issues: orderedIssues(issues), consumable: false };
}

function timestamp(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) ? new Date(milliseconds).toISOString() : null;
}

function populatedTimestampAliases(
  values: readonly Readonly<{ path: string; value: unknown }>[],
) {
  return values.filter((item) => text(item.value) !== null);
}

function conflictingTimestampIssues(
  values: readonly Readonly<{ path: string; value: unknown }>[],
): SnapshotToLearningDatasetMapperIssue[] {
  const populated = populatedTimestampAliases(values);
  const valid = populated
    .map((item) => ({ ...item, normalized: timestamp(item.value) }))
    .filter((item): item is typeof item & { normalized: string } =>
      Boolean(item.normalized),
    );
  if (new Set(valid.map((item) => item.normalized)).size <= 1) return [];
  return valid.map((item) => issue("conflicting_aliases", item.path, "error"));
}

function canonicalSide(value: unknown): "long" | "short" | null {
  const normalized = text(value)?.toLowerCase();
  if (normalized === "long" || normalized === "buy") return "long";
  if (normalized === "short" || normalized === "sell") return "short";
  return null;
}

function canonicalSetup(value: unknown): string | null {
  const normalized = text(value)?.toLowerCase();
  return normalized && supportedSetups.has(normalized) ? normalized : null;
}

function normalizedConfidence(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim().length > 0
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return null;
  return parsed <= 1 ? parsed : parsed / 100;
}

function confidenceLabel(
  value: unknown,
): "low" | "medium" | "high" | "unknown" | null {
  const normalized = text(value)?.toLowerCase();
  return normalized === "low" ||
    normalized === "medium" ||
    normalized === "high" ||
    normalized === "unknown"
    ? normalized
    : null;
}

function aliasConflictIssues<T>(
  aliases: readonly Readonly<{ path: string; raw: unknown; normalized: T | null }>[],
): SnapshotToLearningDatasetMapperIssue[] {
  const populated = aliases.filter((alias) => text(alias.raw) !== null || typeof alias.raw === "number");
  const valid = populated.filter(
    (alias): alias is typeof alias & { normalized: T } => alias.normalized !== null,
  );
  if (new Set(valid.map((alias) => String(alias.normalized))).size <= 1) return [];
  return valid.map((alias) => issue("conflicting_aliases", alias.path, "error"));
}

function asPayload(snapshot: RecommendationSnapshot): UnknownRecord {
  return isRecord(snapshot.payload_json) ? snapshot.payload_json : {};
}

function validateInputShape(
  input: unknown,
): input is SnapshotToLearningDatasetMapperInput {
  if (!isRecord(input) || !isRecord(input.recommendationSnapshot)) return false;
  if (input.contextSnapshot !== null && !isRecord(input.contextSnapshot)) return false;
  return input.outcome === null || isRecord(input.outcome);
}

function requiredIdentityIssues(
  snapshot: RecommendationSnapshot,
  context: Action336IntelligenceContextStaticFixture | null,
  outcome: RecommendationOutcome | null,
) {
  const issues: SnapshotToLearningDatasetMapperIssue[] = [];
  if (!text(snapshot.id)) issues.push(issue("missing_required_identity", "/recommendationSnapshot/id", "error"));
  if (!text(snapshot.snapshot_fingerprint)) issues.push(issue("missing_required_identity", "/recommendationSnapshot/snapshot_fingerprint", "error"));
  if (!text(snapshot.ticker)) issues.push(issue("missing_required_identity", "/recommendationSnapshot/ticker", "error"));
  if (context) {
    if (!text(context.fixture_id)) issues.push(issue("missing_required_identity", "/contextSnapshot/fixture_id", "error"));
    if (!text(context.context?.context_snapshot_id)) issues.push(issue("missing_required_identity", "/contextSnapshot/context/context_snapshot_id", "error"));
  }
  if (outcome && !text(outcome.id)) issues.push(issue("missing_required_identity", "/outcome/id", "error"));
  return issues;
}

function horizonLiteralIssues(
  snapshot: RecommendationSnapshot,
  outcome: RecommendationOutcome | null,
) {
  const payload = asPayload(snapshot);
  const payloadIssues: SnapshotToLearningDatasetMapperIssue[] = [];
  const outcomeIssues: SnapshotToLearningDatasetMapperIssue[] = [];
  const payloadHorizon = payload.outcome_horizon;

  if (
    payloadHorizon !== null &&
    payloadHorizon !== undefined &&
    (typeof payloadHorizon !== "string" || !supportedHorizons.has(payloadHorizon))
  ) {
    payloadIssues.push(issue(
      "invalid_input",
      "/recommendationSnapshot/payload_json/outcome_horizon",
      "error",
    ));
  }
  if (
    outcome &&
    (typeof outcome.horizon !== "string" || !supportedHorizons.has(outcome.horizon))
  ) {
    outcomeIssues.push(issue("invalid_outcome", "/outcome/horizon", "error"));
  }
  return { payloadIssues, outcomeIssues };
}

function linkageIssues(
  snapshot: RecommendationSnapshot,
  context: Action336IntelligenceContextStaticFixture | null,
  outcome: RecommendationOutcome | null,
) {
  const issues: SnapshotToLearningDatasetMapperIssue[] = [];
  const payload = asPayload(snapshot);
  if (context) {
    if (context.recommendation_linkage.recommendation_snapshot_id !== snapshot.id) {
      issues.push(issue("invalid_linkage", "/contextSnapshot/recommendation_linkage/recommendation_snapshot_id", "error"));
    }
    if (context.context.recommendation_snapshot_id !== snapshot.id) {
      issues.push(issue("invalid_linkage", "/contextSnapshot/context/recommendation_snapshot_id", "error"));
    }
    if (context.recommendation_linkage.recommendation_id !== snapshot.recommendation_id || context.context.recommendation_id !== snapshot.recommendation_id) {
      issues.push(issue("invalid_linkage", "/contextSnapshot/recommendation_linkage/recommendation_id", "error"));
    }
  }
  if (outcome) {
    if (outcome.snapshot_id !== null && outcome.snapshot_id !== snapshot.id) {
      issues.push(issue("invalid_linkage", "/outcome/snapshot_id", "error"));
    }
    if (outcome.snapshot_fingerprint !== null && outcome.snapshot_fingerprint !== snapshot.snapshot_fingerprint) {
      issues.push(issue("invalid_linkage", "/outcome/snapshot_fingerprint", "error"));
    }
    if (outcome.recommendation_id !== null && outcome.recommendation_id !== snapshot.recommendation_id) {
      issues.push(issue("invalid_linkage", "/outcome/recommendation_id", "error"));
    }
    if (outcome.ticker !== null && outcome.ticker !== snapshot.ticker) {
      issues.push(issue("invalid_linkage", "/outcome/ticker", "error"));
    }
    const payloadHorizon = typeof payload.outcome_horizon === "string"
      ? payload.outcome_horizon
      : null;
    const outcomeHorizon = outcome.horizon;
    if (
      payloadHorizon !== null &&
      payloadHorizon !== outcomeHorizon
    ) {
      issues.push(issue("invalid_linkage", "/recommendationSnapshot/payload_json/outcome_horizon", "error"));
      issues.push(issue("invalid_linkage", "/outcome/horizon", "error"));
    }
  }
  return issues;
}

function resolveAliases(snapshot: RecommendationSnapshot) {
  const payload = asPayload(snapshot);
  const tradePlan = isRecord(payload.trade_plan) ? payload.trade_plan : {};
  const recommendation = isRecord(payload.recommendation) ? payload.recommendation : {};
  const timestampAliases = [
    { path: "/recommendationSnapshot/recommended_at", value: snapshot.recommended_at },
    { path: "/recommendationSnapshot/app_timestamp", value: snapshot.app_timestamp },
    { path: "/recommendationSnapshot/created_at", value: snapshot.created_at },
  ];
  const captureAliases = [
    { path: "/recommendationSnapshot/app_timestamp", value: snapshot.app_timestamp },
    { path: "/recommendationSnapshot/created_at", value: snapshot.created_at },
  ];
  const sideAliases = [
    { path: "/recommendationSnapshot/side", raw: snapshot.side, normalized: canonicalSide(snapshot.side) },
    { path: "/recommendationSnapshot/payload_json/side", raw: payload.side, normalized: canonicalSide(payload.side) },
    { path: "/recommendationSnapshot/payload_json/direction", raw: payload.direction, normalized: canonicalSide(payload.direction) },
    { path: "/recommendationSnapshot/payload_json/trade_direction", raw: payload.trade_direction, normalized: canonicalSide(payload.trade_direction) },
    { path: "/recommendationSnapshot/payload_json/recommendation_side", raw: payload.recommendation_side, normalized: canonicalSide(payload.recommendation_side) },
    { path: "/recommendationSnapshot/payload_json/trade_plan/side", raw: tradePlan.side, normalized: canonicalSide(tradePlan.side) },
    { path: "/recommendationSnapshot/payload_json/trade_plan/direction", raw: tradePlan.direction, normalized: canonicalSide(tradePlan.direction) },
    { path: "/recommendationSnapshot/payload_json/recommendation/side", raw: recommendation.side, normalized: canonicalSide(recommendation.side) },
    { path: "/recommendationSnapshot/payload_json/recommendation/direction", raw: recommendation.direction, normalized: canonicalSide(recommendation.direction) },
  ];
  const setupAliases = [
    { path: "/recommendationSnapshot/payload_json/setup_family", raw: payload.setup_family, normalized: canonicalSetup(payload.setup_family) },
    { path: "/recommendationSnapshot/payload_json/setup_type", raw: payload.setup_type, normalized: canonicalSetup(payload.setup_type) },
    { path: "/recommendationSnapshot/type", raw: snapshot.type, normalized: canonicalSetup(snapshot.type) },
    { path: "/recommendationSnapshot/label", raw: snapshot.label, normalized: canonicalSetup(snapshot.label) },
  ];
  const confidenceAliases = [
    { path: "/recommendationSnapshot/confidence", raw: snapshot.confidence, normalized: normalizedConfidence(snapshot.confidence) },
    { path: "/recommendationSnapshot/score", raw: snapshot.score, normalized: normalizedConfidence(snapshot.score) },
    { path: "/recommendationSnapshot/payload_json/numeric_confidence", raw: payload.numeric_confidence, normalized: normalizedConfidence(payload.numeric_confidence) },
    { path: "/recommendationSnapshot/payload_json/confidence", raw: payload.confidence, normalized: normalizedConfidence(payload.confidence) },
    { path: "/recommendationSnapshot/payload_json/score", raw: payload.score, normalized: normalizedConfidence(payload.score) },
  ];
  const conflicts = [
    ...conflictingTimestampIssues(timestampAliases),
    ...conflictingTimestampIssues(captureAliases),
    ...aliasConflictIssues(sideAliases),
    ...aliasConflictIssues(setupAliases),
    ...aliasConflictIssues(confidenceAliases.filter((item) => item.normalized !== null)),
  ];
  const invalids = [
    ...sideAliases
      .filter((item) => text(item.raw) !== null && item.normalized === null)
      .map((item) => issue("invalid_input", item.path, "error")),
    ...confidenceAliases
      .filter(
        (item) =>
          (text(item.raw) !== null || typeof item.raw === "number") &&
          item.normalized === null,
      )
      .map((item) => issue("invalid_input", item.path, "error")),
  ];

  const recommendationAt = timestamp(
    timestampAliases.find((item) => text(item.value) !== null)?.value,
  );
  const snapshotAt = timestamp(
    captureAliases.find((item) => text(item.value) !== null)?.value,
  );
  const selectedSide = sideAliases.find((item) => item.normalized !== null)?.normalized ?? null;
  const selectedSetup = setupAliases.find((item) => item.normalized !== null)?.normalized ?? "unknown";
  const selectedConfidence = confidenceAliases.find((item) => item.normalized !== null)?.normalized ?? null;
  const labelAliases = [payload.confidence_label, snapshot.rating, snapshot.label];
  const selectedLabel = labelAliases.map(confidenceLabel).find((item) => item !== null) ?? "unknown";

  return {
    conflicts,
    invalids,
    recommendationAt,
    snapshotAt: snapshotAt ?? recommendationAt,
    side: selectedSide,
    setupFamily: selectedSetup,
    numericConfidence: selectedConfidence,
    confidenceLabel: selectedLabel,
  };
}

function timestampIssues(
  snapshot: RecommendationSnapshot,
  context: Action336IntelligenceContextStaticFixture | null,
  outcome: RecommendationOutcome | null,
  aliases: ReturnType<typeof resolveAliases>,
) {
  const invalid: SnapshotToLearningDatasetMapperIssue[] = [];
  for (const [path, value] of [
    ["/recommendationSnapshot/recommended_at", snapshot.recommended_at],
    ["/recommendationSnapshot/app_timestamp", snapshot.app_timestamp],
    ["/recommendationSnapshot/created_at", snapshot.created_at],
  ] as const) {
    if (text(value) !== null && timestamp(value) === null) invalid.push(issue("invalid_timestamp", path, "error"));
  }
  if (!aliases.recommendationAt) invalid.push(issue("invalid_timestamp", "/recommendationSnapshot/recommended_at", "error"));
  if (!aliases.snapshotAt) invalid.push(issue("invalid_timestamp", "/recommendationSnapshot/app_timestamp", "error"));

  const contextCapturedAt = context ? timestamp(context.context.captured_at) : null;
  const contextEffectiveAt = context ? timestamp(context.effective_at) : null;
  const outcomeAt = outcome
    ? timestamp(outcome.evaluated_at) ?? timestamp(outcome.updated_at) ?? timestamp(outcome.created_at)
    : null;
  if (context && !contextCapturedAt) invalid.push(issue("invalid_timestamp", "/contextSnapshot/context/captured_at", "error"));
  if (context && !contextEffectiveAt) invalid.push(issue("invalid_timestamp", "/contextSnapshot/effective_at", "error"));
  if (outcome && !outcomeAt) invalid.push(issue("invalid_timestamp", "/outcome/evaluated_at", "error"));
  if (invalid.length > 0) return { issues: invalid, contextCapturedAt, contextEffectiveAt, outcomeAt };

  const temporal: SnapshotToLearningDatasetMapperIssue[] = [];
  const recommendationMs = Date.parse(aliases.recommendationAt as string);
  if (Date.parse(aliases.snapshotAt as string) < recommendationMs) temporal.push(issue("temporal_violation", "/recommendationSnapshot/app_timestamp", "error"));
  if (contextCapturedAt && Date.parse(contextCapturedAt) > recommendationMs) temporal.push(issue("temporal_violation", "/contextSnapshot/context/captured_at", "error"));
  if (contextEffectiveAt && Date.parse(contextEffectiveAt) > recommendationMs) temporal.push(issue("temporal_violation", "/contextSnapshot/effective_at", "error"));
  if (outcomeAt && Date.parse(outcomeAt) < recommendationMs) temporal.push(issue("temporal_violation", "/outcome/evaluated_at", "error"));
  return { issues: temporal, contextCapturedAt, contextEffectiveAt, outcomeAt };
}

function futureLeakageIssues(
  context: Action336IntelligenceContextStaticFixture | null,
  recommendationAt: string,
) {
  if (!context) return [];
  const issues: SnapshotToLearningDatasetMapperIssue[] = [];
  const contextRecord = context as unknown as UnknownRecord;
  if (!owns(contextRecord, "anti_leakage_status") || contextRecord.anti_leakage_status !== "passed") {
    issues.push(issue("future_leakage", "/contextSnapshot/anti_leakage_status", "error"));
  }
  if (context.context.available_at_snapshot_time !== true) {
    issues.push(issue("future_leakage", "/contextSnapshot/context/available_at_snapshot_time", "error"));
  }
  const recommendationMs = Date.parse(recommendationAt);
  const catalystAt = timestamp(context.context.news_catalyst.catalyst_timestamp);
  if (catalystAt && Date.parse(catalystAt) > recommendationMs) issues.push(issue("future_leakage", "/contextSnapshot/context/news_catalyst/catalyst_timestamp", "error"));
  if (outcomeContextKeys.some((key) => JSON.stringify(context.context).includes(key))) issues.push(issue("future_leakage", "/contextSnapshot/context", "error"));
  context.excluded_future_context.forEach((excluded, index) => {
    const excludedAt = timestamp(excluded.effective_at);
    if (excluded.included_in_snapshot_context !== false || !excludedAt || Date.parse(excludedAt) <= recommendationMs) {
      issues.push(issue("future_leakage", `/contextSnapshot/excluded_future_context/${index}`, "error"));
    }
  });
  return issues;
}

type ContextValueKind =
  | Readonly<{ type: "category"; values: ReadonlySet<string> }>
  | Readonly<{ type: "identifier" }>
  | Readonly<{ type: "number" }>
  | Readonly<{ type: "boolean" }>;

function contextValueIssues(
  value: unknown,
  path: string,
  kind: ContextValueKind,
): SnapshotToLearningDatasetMapperIssue[] {
  if (!isRecord(value)) {
    return [issue("invalid_provenance", path, "error")];
  }
  const state = value.state;
  if (typeof state !== "string" || !supportedContextStates.has(state)) {
    return [issue("invalid_provenance", `${path}/state`, "error")];
  }
  if (state === "explicit_null" || state === "unavailable") {
    return value.value === null
      ? []
      : [issue("invalid_provenance", `${path}/value`, "error")];
  }
  if (state === "unknown") {
    return value.value === "unknown"
      ? []
      : [issue("invalid_provenance", `${path}/value`, "error")];
  }

  if (kind.type === "category") {
    return typeof value.value === "string" && kind.values.has(value.value)
      ? []
      : [issue("invalid_provenance", `${path}/value`, "error")];
  }
  if (kind.type === "identifier") {
    return text(value.value) !== null
      ? []
      : [issue("invalid_provenance", `${path}/value`, "error")];
  }
  if (kind.type === "number") {
    return finite(value.value) !== null
      ? []
      : [issue("invalid_provenance", `${path}/value`, "error")];
  }
  return typeof value.value === "boolean"
    ? []
    : [issue("invalid_provenance", `${path}/value`, "error")];
}

function contextDomainIssues(context: Action336IntelligenceContextStaticFixture) {
  const issues: SnapshotToLearningDatasetMapperIssue[] = [];
  const market = context.context.market;
  const sector = context.context.sector_industry;
  const strength = context.context.relative_strength;
  const news = context.context.news_catalyst;
  const event = context.context.calendar_event;

  if (!["complete", "partial", "unavailable"].includes(market.completeness)) {
    issues.push(issue("invalid_provenance", "/contextSnapshot/context/market/completeness", "error"));
  }
  for (const [field, value] of [
    ["spy_direction", market.spy_direction],
    ["qqq_direction", market.qqq_direction],
    ["iwm_direction", market.iwm_direction],
  ] as const) {
    issues.push(...contextValueIssues(
      value,
      `/contextSnapshot/context/market/${field}`,
      { type: "category", values: supportedContextCategories.indexDirection },
    ));
  }
  issues.push(
    ...contextValueIssues(market.market_regime, "/contextSnapshot/context/market/market_regime", { type: "category", values: supportedContextCategories.marketRegime }),
    ...contextValueIssues(market.volatility_regime, "/contextSnapshot/context/market/volatility_regime", { type: "category", values: supportedContextCategories.volatilityRegime }),
    ...contextValueIssues(sector.sector, "/contextSnapshot/context/sector_industry/sector", { type: "identifier" }),
    ...contextValueIssues(sector.industry, "/contextSnapshot/context/sector_industry/industry", { type: "identifier" }),
    ...contextValueIssues(sector.sector_relative_strength, "/contextSnapshot/context/sector_industry/sector_relative_strength", { type: "category", values: supportedContextCategories.sectorRelativeStrength }),
    ...contextValueIssues(strength.stock_vs_spy, "/contextSnapshot/context/relative_strength/stock_vs_spy", { type: "number" }),
    ...contextValueIssues(strength.stock_vs_sector, "/contextSnapshot/context/relative_strength/stock_vs_sector", { type: "number" }),
    ...contextValueIssues(strength.intraday_label, "/contextSnapshot/context/relative_strength/intraday_label", { type: "category", values: supportedContextCategories.intradayRelativeStrength }),
    ...contextValueIssues(news.catalyst_detected, "/contextSnapshot/context/news_catalyst/catalyst_detected", { type: "boolean" }),
    ...contextValueIssues(news.catalyst_type, "/contextSnapshot/context/news_catalyst/catalyst_type", { type: "category", values: supportedContextCategories.catalystType }),
    ...contextValueIssues(event.event_type, "/contextSnapshot/context/calendar_event/event_type", { type: "category", values: supportedContextCategories.eventType }),
    ...contextValueIssues(event.event_risk_label, "/contextSnapshot/context/calendar_event/event_risk_label", { type: "category", values: supportedContextCategories.eventRisk }),
  );
  if (!["present", "absent", "unavailable"].includes(news.availability)) {
    issues.push(issue("invalid_provenance", "/contextSnapshot/context/news_catalyst/availability", "error"));
  }
  if (!["present", "absent", "unavailable"].includes(event.availability)) {
    issues.push(issue("invalid_provenance", "/contextSnapshot/context/calendar_event/availability", "error"));
  }
  return issues;
}

function freshnessIssues(context: Action336IntelligenceContextStaticFixture) {
  const contextRecord = context as unknown as UnknownRecord;
  const freshness = contextRecord.freshness;
  if (!isRecord(freshness)) {
    return [issue("invalid_provenance", "/contextSnapshot/freshness", "error")];
  }
  const issues: SnapshotToLearningDatasetMapperIssue[] = [];
  const state = freshness.state;
  const age = freshness.age_minutes_at_recommendation;
  if (typeof state !== "string" || !supportedFreshnessStates.has(state)) {
    issues.push(issue("invalid_provenance", "/contextSnapshot/freshness/state", "error"));
    return issues;
  }
  if (state === "fresh" && (finite(age) === null || (age as number) < 0 || (age as number) >= 60)) {
    issues.push(issue("invalid_provenance", "/contextSnapshot/freshness/age_minutes_at_recommendation", "error"));
  }
  if (state === "stale" && (finite(age) === null || (age as number) < 60)) {
    issues.push(issue("invalid_provenance", "/contextSnapshot/freshness/age_minutes_at_recommendation", "error"));
  }
  if ((state === "unknown" || state === "unavailable") && age !== null) {
    issues.push(issue("invalid_provenance", "/contextSnapshot/freshness/age_minutes_at_recommendation", "error"));
  }
  if (state === "stale" && freshness.fresh === true) {
    issues.push(issue("invalid_provenance", "/contextSnapshot/freshness/fresh", "error"));
  }
  if (state === "fresh" && freshness.stale === true) {
    issues.push(issue("invalid_provenance", "/contextSnapshot/freshness/stale", "error"));
  }
  if (state === "stale" && context.data_provenance.state === "complete") {
    issues.push(issue("invalid_provenance", "/contextSnapshot/data_provenance/state", "error"));
  }
  if (
    state === "fresh" &&
    (context.data_provenance.state === "unavailable" ||
      context.data_provenance.missing_data_flags.includes("stale_source") ||
      context.expected_context_labels.data_provenance_label === "stale")
  ) {
    issues.push(issue("invalid_provenance", "/contextSnapshot/freshness/state", "error"));
  }
  return issues;
}

function provenanceIssues(
  context: Action336IntelligenceContextStaticFixture | null,
  recommendationAt: string,
) {
  if (!context) return [];
  const provenance = context.data_provenance;
  const issues: SnapshotToLearningDatasetMapperIssue[] = [
    ...contextDomainIssues(context),
    ...freshnessIssues(context),
  ];
  if (!provenance || !["complete", "partial", "unavailable"].includes(provenance.state)) issues.push(issue("invalid_provenance", "/contextSnapshot/data_provenance/state", "error"));
  if (provenance.state === "complete" && (!text(provenance.provider) || !timestamp(provenance.source_timestamp))) issues.push(issue("invalid_provenance", "/contextSnapshot/data_provenance/provider", "error"));
  if (provenance.state === "complete" && (provenance.audit_readback_status !== "verified" || provenance.missing_data_flags.length > 0)) issues.push(issue("invalid_provenance", "/contextSnapshot/data_provenance/audit_readback_status", "error"));
  if (provenance.state === "partial" && (provenance.audit_readback_status !== "partial" || provenance.missing_data_flags.length === 0)) issues.push(issue("invalid_provenance", "/contextSnapshot/data_provenance/missing_data_flags", "error"));
  if (provenance.state === "unavailable" && (provenance.provider !== null || provenance.source_timestamp !== null || provenance.source_confidence !== null || provenance.audit_readback_status !== "unavailable" || provenance.completeness_score !== 0)) issues.push(issue("invalid_provenance", "/contextSnapshot/data_provenance", "error"));
  if (provenance.source_timestamp !== null) {
    const sourceAt = timestamp(provenance.source_timestamp);
    if (!sourceAt || Date.parse(sourceAt) > Date.parse(recommendationAt)) issues.push(issue("invalid_provenance", "/contextSnapshot/data_provenance/source_timestamp", "error"));
  }
  if (provenance.source_confidence !== null && (!Number.isFinite(provenance.source_confidence) || provenance.source_confidence < 0 || provenance.source_confidence > 1)) issues.push(issue("invalid_provenance", "/contextSnapshot/data_provenance/source_confidence", "error"));
  if (!Number.isFinite(provenance.completeness_score) || provenance.completeness_score < 0 || provenance.completeness_score > 1) issues.push(issue("invalid_provenance", "/contextSnapshot/data_provenance/completeness_score", "error"));
  if (context.conflict_metadata.state === "conflicting" && (context.conflict_metadata.source_ids.length < 2 || !text(context.conflict_metadata.details))) issues.push(issue("invalid_provenance", "/contextSnapshot/conflict_metadata", "error"));
  if (context.context.market.completeness === "complete" && Object.values(context.context.market).some((value) => isRecord(value) && value.state === "unavailable")) issues.push(issue("invalid_provenance", "/contextSnapshot/context/market/completeness", "error"));
  return issues;
}

function outcomeIssues(outcome: RecommendationOutcome | null, side: "long" | "short") {
  if (!outcome) return [];
  const issues: SnapshotToLearningDatasetMapperIssue[] = [];
  if (!supportedOutcomeStatuses.has(outcome.status) || !supportedHorizons.has(outcome.horizon)) issues.push(issue("invalid_outcome", "/outcome/status", "error"));
  const outcomeSide = canonicalSide(outcome.side);
  if (outcomeSide === null || outcomeSide !== side) issues.push(issue("invalid_outcome", "/outcome/side", "error"));
  const numericPaths: readonly [string, unknown][] = [
    ["/outcome/entry", outcome.entry],
    ["/outcome/stop", outcome.stop],
    ["/outcome/target", outcome.target],
    ["/outcome/best_r", outcome.best_r],
    ["/outcome/worst_r", outcome.worst_r],
    ["/outcome/eod_r", outcome.eod_r],
    ["/outcome/current_r", outcome.current_r],
  ];
  for (const [path, value] of numericPaths) {
    if (value !== null && value !== undefined && finite(value) === null) issues.push(issue("invalid_outcome", path, "error"));
  }
  return issues;
}

function requiredInputIssues(
  snapshot: RecommendationSnapshot,
  outcome: RecommendationOutcome | null,
  aliases: ReturnType<typeof resolveAliases>,
) {
  const payload = asPayload(snapshot);
  const issues: SnapshotToLearningDatasetMapperIssue[] = [];
  if (!aliases.side) issues.push(issue("invalid_input", "/recommendationSnapshot/side", "error"));
  if (aliases.numericConfidence === null) issues.push(issue("invalid_input", "/recommendationSnapshot/confidence", "error"));
  for (const [path, value] of [
    ["/recommendationSnapshot/entry", snapshot.entry],
    ["/recommendationSnapshot/stop", snapshot.stop],
    ["/recommendationSnapshot/target", snapshot.target],
    ["/recommendationSnapshot/risk_per_share", snapshot.risk_per_share],
    ["/recommendationSnapshot/reward_per_share", snapshot.reward_per_share],
    ["/recommendationSnapshot/planned_risk_reward", snapshot.planned_risk_reward],
  ] as const) {
    if (finite(value) === null) issues.push(issue("invalid_input", path, "error"));
  }
  for (const [path, value] of [
    ["/recommendationSnapshot/scan_run_id", snapshot.scan_run_id],
    ["/recommendationSnapshot/payload_json/candidate_id", payload.candidate_id],
    ["/recommendationSnapshot/payload_json/batch_fingerprint", payload.batch_fingerprint],
    ["/recommendationSnapshot/payload_json/trading_day", payload.trading_day],
    ["/recommendationSnapshot/payload_json/invalidation_logic", payload.invalidation_logic],
  ] as const) {
    if (!text(value)) issues.push(issue("invalid_input", path, "error"));
  }
  if (typeof payload.sanitizer_passed !== "boolean") issues.push(issue("invalid_input", "/recommendationSnapshot/payload_json/sanitizer_passed", "error"));
  if (typeof payload.risk_geometry_valid !== "boolean") issues.push(issue("invalid_input", "/recommendationSnapshot/payload_json/risk_geometry_valid", "error"));
  if (!["complete", "partial", "low"].includes(String(payload.snapshot_completeness))) issues.push(issue("invalid_input", "/recommendationSnapshot/payload_json/snapshot_completeness", "error"));
  if (!outcome && !supportedHorizons.has(String(payload.outcome_horizon))) issues.push(issue("invalid_input", "/recommendationSnapshot/payload_json/outcome_horizon", "error"));
  return issues;
}

function snapshotDomainIssues(snapshot: RecommendationSnapshot) {
  return supportedWindows.has(String(snapshot.window))
    ? []
    : [issue("invalid_input", "/recommendationSnapshot/window", "error")];
}

function unavailableValue(): LearningDatasetContextValue {
  return { state: "unavailable", value: null };
}

function missingContext(snapshot: RecommendationSnapshot, recommendationAt: string): LearningDatasetContext {
  const contextId = `context:missing:${encodeURIComponent(snapshot.snapshot_fingerprint.normalize("NFC"))}`;
  return {
    context_snapshot_id: contextId,
    recommendation_snapshot_id: snapshot.id,
    recommendation_id: snapshot.recommendation_id,
    captured_at: recommendationAt,
    available_at_snapshot_time: true,
    market: {
      completeness: "unavailable",
      spy_direction: unavailableValue(),
      qqq_direction: unavailableValue(),
      iwm_direction: unavailableValue(),
      market_regime: unavailableValue(),
      volatility_regime: unavailableValue(),
    },
    sector_industry: {
      sector: unavailableValue(),
      industry: unavailableValue(),
      sector_relative_strength: unavailableValue(),
    },
    relative_strength: {
      stock_vs_spy: unavailableValue(),
      stock_vs_sector: unavailableValue(),
      intraday_label: unavailableValue(),
    },
    news_catalyst: {
      availability: "unavailable",
      catalyst_detected: unavailableValue(),
      catalyst_type: unavailableValue(),
      catalyst_timestamp: null,
      headline_summary: null,
    },
    calendar_event: {
      availability: "unavailable",
      event_type: unavailableValue(),
      event_risk_label: unavailableValue(),
    },
  };
}

function missingProvenance(): LearningDatasetProvenance {
  return {
    state: "unavailable",
    provider: null,
    source_timestamp: null,
    interval: null,
    adjusted_or_unadjusted: "unknown",
    source_confidence: null,
    audit_readback_status: "unavailable",
    missing_data_flags: ["context_snapshot_unavailable"],
    completeness_score: 0,
  };
}

function mappedOutcome(
  snapshot: RecommendationSnapshot,
  outcome: RecommendationOutcome | null,
  outcomeAt: string | null,
): LearningDatasetOutcome {
  if (!outcome || outcome.status === "pending") {
    const payload = asPayload(snapshot);
    return {
      availability: "not_yet_available",
      evaluated_outcome_id: null,
      recommendation_snapshot_id: snapshot.id,
      recommendation_id: snapshot.recommendation_id,
      outcome_window: String(payload.outcome_horizon) as "15m" | "30m" | "60m",
      outcome_status: "not_yet_available",
      evaluated_at: null,
      entry_touched: null,
      target_hit: null,
      stop_hit: null,
      no_entry_triggered: null,
      open_at_window_end: null,
      gross_r_multiple: null,
      max_favorable_excursion_r: null,
      max_adverse_excursion_r: null,
    };
  }

  const status =
    outcome.status === "entry_not_triggered"
      ? "no_entry_triggered"
      : outcome.status === "target_hit" || outcome.status === "target_before_stop"
        ? "target_hit"
        : outcome.status === "stop_hit" || outcome.status === "stop_before_target"
          ? "stop_hit"
          : "open_at_window_end";
  const availability = outcome.status === "incomplete" ? "incomplete" : "complete";
  return {
    availability,
    evaluated_outcome_id: outcome.id,
    recommendation_snapshot_id: snapshot.id,
    recommendation_id: snapshot.recommendation_id,
    outcome_window: outcome.horizon as "15m" | "30m" | "60m",
    outcome_status: status,
    evaluated_at: outcomeAt,
    entry_touched: outcome.entry_triggered,
    target_hit: outcome.target_hit,
    stop_hit: outcome.stop_hit,
    no_entry_triggered: outcome.entry_triggered === null ? null : !outcome.entry_triggered,
    open_at_window_end:
      status === "open_at_window_end" ? true : outcome.first_terminal_event === "unknown",
    gross_r_multiple: finite(outcome.payload_json.gross_r_multiple),
    max_favorable_excursion_r: outcome.best_r,
    max_adverse_excursion_r: outcome.worst_r,
  };
}

function canonicalIdentityComponent(value: string) {
  return encodeURIComponent(value.normalize("NFC"));
}

function optionalWarnings(
  context: Action336IntelligenceContextStaticFixture | null,
  outcome: RecommendationOutcome | null,
  setupFamily: string,
) {
  const issues: SnapshotToLearningDatasetMapperIssue[] = [];
  if (!context) issues.push(issue("missing_optional_context", "/contextSnapshot", "warning"));
  if (!outcome) issues.push(issue("missing_optional_outcome", "/outcome", "warning"));
  if (outcome?.status === "pending" || outcome?.status === "incomplete") issues.push(issue("missing_optional_outcome", "/outcome", "warning"));
  if (setupFamily === "unknown") issues.push(issue("unknown_setup", "/recommendationSnapshot/payload_json/setup_family", "warning"));
  if (context?.data_provenance.state === "unavailable") issues.push(issue("unavailable_source", "/contextSnapshot/data_provenance", "warning"));
  if (context?.data_provenance.state === "partial") issues.push(issue("partial_provenance", "/contextSnapshot/data_provenance", "warning"));
  return orderedIssues(issues);
}

function constructRow(
  input: SnapshotToLearningDatasetMapperInput,
  aliases: ResolvedAliases,
  warnings: readonly SnapshotToLearningDatasetMapperIssue[],
): Action335LearningDatasetRow {
  const { recommendationSnapshot: snapshot, contextSnapshot: context, outcome } = input;
  const payload = asPayload(snapshot);
  const horizon = outcome?.horizon ?? "pending";
  const outcomeId = outcome?.id ?? "pending";
  const identityComponents = [
    LEARNING_DATASET_STATIC_FIXTURE_SCHEMA_VERSION,
    snapshot.snapshot_fingerprint,
    horizon,
    outcomeId,
  ].map(canonicalIdentityComponent);
  const learningRowKey = identityComponents.join("|");
  const outputContext = context ? clone(context.context) : missingContext(snapshot, aliases.recommendationAt);
  const provenance = context ? clone(context.data_provenance) : missingProvenance();
  const outcomeFields = mappedOutcome(snapshot, outcome, aliases.outcomeAt);
  const pending = outcomeFields.availability === "not_yet_available";
  const limited = warnings.length > 0 || outcomeFields.availability === "incomplete";
  const tierValue = text(payload.tier)?.toLowerCase();
  const tier = tierValue === "strong" || tierValue === "valid" || tierValue === "experimental" ? tierValue : "unknown";
  const sourceType = payload.visibility_status === "research_only" || payload.not_live_signal === true ? "research_only" : "visible";
  const setupSuccessLabel = pending
    ? "pending"
    : outcomeFields.availability === "incomplete"
      ? "incomplete"
      : outcomeFields.outcome_status === "target_hit"
        ? "success"
        : "failure";

  return {
    schema_version: LEARNING_DATASET_STATIC_FIXTURE_SCHEMA_VERSION,
    fixture_family_tags: [],
    identity: {
      dataset_row_id: `learning_row:v1:${learningRowKey}`,
      learning_row_key: learningRowKey,
      recommendation_snapshot_id: snapshot.id,
      recommendation_id: snapshot.recommendation_id,
      candidate_id: text(payload.candidate_id) as string,
      context_snapshot_id: outputContext.context_snapshot_id,
      evaluated_outcome_id: outcomeFields.evaluated_outcome_id,
      batch_fingerprint: text(payload.batch_fingerprint) as string,
      scan_run_id: snapshot.scan_run_id as string,
      ticker: snapshot.ticker as string,
      trading_day: text(payload.trading_day) as string,
      trading_window: snapshot.window,
      source_type: sourceType,
    },
    snapshot_time_inputs: {
      recommendation_created_at: aliases.recommendationAt,
      snapshot_captured_at: aliases.snapshotAt,
      enrichment_version: text(payload.enrichment_version) ?? mapperVersion,
    },
    trade_plan: {
      direction: aliases.side,
      entry: snapshot.entry as number,
      stop: snapshot.stop as number,
      target: snapshot.target as number,
      planned_risk: snapshot.risk_per_share as number,
      planned_reward: snapshot.reward_per_share as number,
      planned_r_multiple: snapshot.planned_risk_reward as number,
      invalidation_logic: text(payload.invalidation_logic) as string,
    },
    setup_and_confidence: {
      setup_family: aliases.setupFamily,
      setup_variant: text(payload.setup_variant) ?? "unknown",
      numeric_confidence: aliases.numericConfidence,
      confidence_label: aliases.confidenceLabel,
      tier,
    },
    quality_gates: {
      sanitizer_passed: payload.sanitizer_passed as boolean,
      risk_geometry_valid: payload.risk_geometry_valid as boolean,
      snapshot_completeness: payload.snapshot_completeness as "complete" | "partial" | "low",
      rejection_reason: snapshot.reason,
    },
    context: outputContext,
    data_provenance: provenance,
    outcome_fields: outcomeFields,
    derived_learning_fields: {
      setup_success_label: setupSuccessLabel,
      confidence_bucket: aliases.confidenceLabel,
      recommendation_should_have_been_filtered: null,
    },
    anti_leakage_status: "passed",
    learning_eligibility_status: pending ? "pending" : limited ? "limited" : "full",
    missing_context_reasons: context ? [...context.missing_context_reasons] : ["context_snapshot_unavailable"],
    fixture_expected_status: pending ? "pending_outcome" : limited ? "valid_with_gaps" : "valid",
    completeness_score: provenance.completeness_score,
  };
}

export function mapSnapshotToLearningDataset(
  input: SnapshotToLearningDatasetMapperInput,
): SnapshotToLearningDatasetMapperResult {
  if (!validateInputShape(input)) {
    return blocked("blocked_invalid_input", [
      issue("invalid_input", "/", "error"),
    ]);
  }

  const snapshot = input.recommendationSnapshot;
  const context = input.contextSnapshot;
  const outcome = input.outcome;

  const identities = requiredIdentityIssues(snapshot, context, outcome);
  if (identities.length > 0) return blocked("blocked_missing_required_identity", identities);

  const horizonLiterals = horizonLiteralIssues(snapshot, outcome);
  if (horizonLiterals.payloadIssues.length > 0) {
    return blocked("blocked_invalid_input", horizonLiterals.payloadIssues);
  }
  if (horizonLiterals.outcomeIssues.length > 0) {
    return blocked("blocked_invalid_outcome", horizonLiterals.outcomeIssues);
  }

  const linkages = linkageIssues(snapshot, context, outcome);
  if (linkages.length > 0) return blocked("blocked_invalid_linkage", linkages);

  const aliases = resolveAliases(snapshot);
  if (aliases.conflicts.length > 0) return blocked("blocked_conflicting_aliases", aliases.conflicts);
  if (aliases.invalids.length > 0) return blocked("blocked_invalid_input", aliases.invalids);

  const times = timestampIssues(snapshot, context, outcome, aliases);
  if (times.issues.length > 0) return blocked("blocked_temporal_violation", times.issues);

  const leakage = futureLeakageIssues(context, aliases.recommendationAt as string);
  if (leakage.length > 0) return blocked("blocked_future_leakage", leakage);

  const provenance = provenanceIssues(context, aliases.recommendationAt as string);
  if (provenance.length > 0) return blocked("blocked_invalid_provenance", provenance);

  const snapshotDomain = snapshotDomainIssues(snapshot);
  if (snapshotDomain.length > 0) return blocked("blocked_invalid_input", snapshotDomain);

  if (!aliases.side) {
    return blocked("blocked_invalid_input", [issue("invalid_input", "/recommendationSnapshot/side", "error")]);
  }
  const invalidOutcome = outcomeIssues(outcome, aliases.side);
  if (invalidOutcome.length > 0) return blocked("blocked_invalid_outcome", invalidOutcome);

  const requiredInput = requiredInputIssues(snapshot, outcome, aliases);
  if (requiredInput.length > 0) return blocked("blocked_invalid_input", requiredInput);

  const warnings = optionalWarnings(context, outcome, aliases.setupFamily);
  const resolved: ResolvedAliases = {
    recommendationAt: aliases.recommendationAt as string,
    snapshotAt: aliases.snapshotAt as string,
    contextCapturedAt: times.contextCapturedAt,
    contextEffectiveAt: times.contextEffectiveAt,
    outcomeAt: times.outcomeAt,
    side: aliases.side,
    setupFamily: aliases.setupFamily,
    numericConfidence: aliases.numericConfidence as number,
    confidenceLabel: aliases.confidenceLabel,
  };
  const row = constructRow(input, resolved, warnings);
  return {
    status: warnings.length > 0 ? "mapped_with_missing_optional_data" : "mapped",
    row,
    issues: warnings,
    consumable: true,
  };
}
