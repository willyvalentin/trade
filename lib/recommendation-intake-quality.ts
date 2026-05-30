export type RecommendationIntakeQualityStatus =
  | "accepted"
  | "needs_review"
  | "rejected"
  | "incomplete";

export type RecommendationIntakeQualityGrade =
  | "A"
  | "B"
  | "C"
  | "D"
  | "F"
  | "unknown";

export type RecommendationIntakeQualityCheckStatus =
  | "pass"
  | "warning"
  | "blocked"
  | "incomplete"
  | "not_applicable";

export type RecommendationIntakeQualitySource =
  | "recommendation"
  | "price_plan"
  | "market_data"
  | "market_session"
  | "risk_controls"
  | "existing_recommendations"
  | "internal_quality_gate";

export type RecommendationIntakeQualityReason = {
  reason_id: string;
  label: string;
  message: string;
  source: RecommendationIntakeQualitySource;
};

export type RecommendationIntakeQualityWarning =
  RecommendationIntakeQualityReason & {
    severity: "info" | "warning";
  };

export type RecommendationIntakeQualityBlocker =
  RecommendationIntakeQualityReason & {
    severity: "critical";
  };

export type RecommendationIntakeQualityCheck = {
  check_id: string;
  label: string;
  status: RecommendationIntakeQualityCheckStatus;
  message: string;
  source: RecommendationIntakeQualitySource;
  blocker_ids: string[];
  warning_ids: string[];
};

export type RecommendationIntakeQualityInput = {
  recommendation_id?: string | null;
  ticker?: string | null;
  company_name?: string | null;
  entry_price?: number | null;
  entry_low?: number | null;
  entry_high?: number | null;
  stop_price?: number | null;
  target_price?: number | null;
  current_price?: number | null;
  confidence_score?: number | null;
  setup_type?: string | null;
  reason_text?: string | null;
  generated_at?: string | Date | null;
  market_data_timestamp?: string | Date | null;
  latest_volume?: number | null;
  average_volume?: number | null;
  spread_percent?: number | null;
  market_session?: {
    phase?: string | null;
    risk_level?: string | null;
    source?: string | null;
    is_market_open?: boolean | null;
  } | null;
  existing_recommendations?: Array<{
    id?: string | null;
    ticker?: string | null;
    setup_type?: string | null;
    status?: string | null;
    archived?: boolean | null;
  }>;
  risk_controls?: {
    enabled?: boolean | null;
    mode?: string | null;
    allowed_tickers?: string[] | null;
    blocked_tickers?: string[] | null;
    status?: string | null;
  } | null;
  now?: Date | string | null;
};

export type RecommendationIntakeQualityResult = {
  result_id: string;
  result_version: "1.0";
  result_kind: "recommendation_intake_quality";
  evaluated_at: string;
  recommendation_id: string | null;
  ticker: string | null;
  status: RecommendationIntakeQualityStatus;
  grade: RecommendationIntakeQualityGrade;
  accepted_for_visible_list: boolean;
  internal_only: true;
  risk_reward_ratio: number | null;
  data_age_minutes: number | null;
  checks: RecommendationIntakeQualityCheck[];
  blockers: RecommendationIntakeQualityBlocker[];
  warnings: RecommendationIntakeQualityWarning[];
  top_reasons: RecommendationIntakeQualityReason[];
  summary: string;
};

type EvaluationChunk = {
  checks: RecommendationIntakeQualityCheck[];
  blockers: RecommendationIntakeQualityBlocker[];
  warnings: RecommendationIntakeQualityWarning[];
};

const genericReasonFragments = [
  "good setup",
  "strong setup",
  "technical setup",
  "momentum",
  "looks good",
  "buy signal",
];

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function positiveNumber(value: unknown): number | null {
  const numberValue = finiteNumber(value);
  return numberValue !== null && numberValue > 0 ? numberValue : null;
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : null;
}

function textOrNull(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

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

function minutesBetween(later: Date, earlier: Date) {
  return Math.max(0, Math.round((later.getTime() - earlier.getTime()) / 60000));
}

function buildReason(
  reason_id: string,
  label: string,
  message: string,
  source: RecommendationIntakeQualitySource,
): RecommendationIntakeQualityReason {
  return { reason_id, label, message, source };
}

function buildCheck(
  check_id: string,
  label: string,
  status: RecommendationIntakeQualityCheckStatus,
  message: string,
  source: RecommendationIntakeQualitySource,
  blockers: RecommendationIntakeQualityBlocker[] = [],
  warnings: RecommendationIntakeQualityWarning[] = [],
): RecommendationIntakeQualityCheck {
  return {
    check_id,
    label,
    status,
    message,
    source,
    blocker_ids: blockers.map((blocker) => blocker.reason_id),
    warning_ids: warnings.map((warning) => warning.reason_id),
  };
}

function warning(
  reason_id: string,
  label: string,
  message: string,
  source: RecommendationIntakeQualitySource,
  severity: "info" | "warning" = "warning",
): RecommendationIntakeQualityWarning {
  return {
    ...buildReason(reason_id, label, message, source),
    severity,
  };
}

function blocker(
  reason_id: string,
  label: string,
  message: string,
  source: RecommendationIntakeQualitySource,
): RecommendationIntakeQualityBlocker {
  return {
    ...buildReason(reason_id, label, message, source),
    severity: "critical",
  };
}

function getEntryPrice(input: RecommendationIntakeQualityInput) {
  const direct = positiveNumber(input.entry_price);
  if (direct !== null) {
    return direct;
  }

  const entryLow = positiveNumber(input.entry_low);
  const entryHigh = positiveNumber(input.entry_high);
  if (entryLow !== null && entryHigh !== null) {
    return (entryLow + entryHigh) / 2;
  }

  return entryHigh ?? entryLow;
}

function calculateRiskRewardRatio(input: RecommendationIntakeQualityInput) {
  const entry = getEntryPrice(input);
  const stop = positiveNumber(input.stop_price);
  const target = positiveNumber(input.target_price);

  if (entry === null || stop === null || target === null) {
    return null;
  }

  const riskPerShare = entry - stop;
  const rewardPerShare = target - entry;

  if (riskPerShare <= 0 || rewardPerShare <= 0) {
    return null;
  }

  return rewardPerShare / riskPerShare;
}

export function evaluateRecommendationCompleteness(
  input: RecommendationIntakeQualityInput,
): EvaluationChunk {
  const blockers: RecommendationIntakeQualityBlocker[] = [];
  const warnings: RecommendationIntakeQualityWarning[] = [];
  const ticker = normalizeTicker(input.ticker);
  const entry = getEntryPrice(input);
  const stop = positiveNumber(input.stop_price);
  const target = positiveNumber(input.target_price);
  const setup = textOrNull(input.setup_type);
  const reason = textOrNull(input.reason_text);

  if (!ticker) {
    blockers.push(
      blocker(
        "missing_ticker",
        "Missing ticker",
        "Recommendation is missing a ticker.",
        "recommendation",
      ),
    );
  }

  if (entry === null) {
    blockers.push(
      blocker(
        "missing_entry",
        "Missing entry",
        "Recommendation is missing a usable entry price.",
        "recommendation",
      ),
    );
  }

  if (stop === null) {
    blockers.push(
      blocker(
        "missing_stop",
        "Missing stop",
        "Recommendation is missing a usable stop price.",
        "recommendation",
      ),
    );
  }

  if (target === null) {
    blockers.push(
      blocker(
        "missing_target",
        "Missing target",
        "Recommendation is missing a usable target price.",
        "recommendation",
      ),
    );
  }

  if (!setup) {
    warnings.push(
      warning(
        "missing_setup_type",
        "Missing setup type",
        "Recommendation setup type is unavailable.",
        "recommendation",
      ),
    );
  }

  if (!reason) {
    warnings.push(
      warning(
        "missing_reason",
        "Missing reason",
        "Recommendation is missing catalyst/rationale text.",
        "recommendation",
      ),
    );
  }

  const status =
    blockers.length > 0
      ? "blocked"
      : warnings.length > 0
        ? "warning"
        : "pass";

  return {
    checks: [
      buildCheck(
        "completeness",
        "Required fields",
        status,
        status === "pass"
          ? "Ticker, entry, stop, target, setup, and rationale are present."
          : "One or more recommendation intake fields need review.",
        "recommendation",
        blockers,
        warnings,
      ),
    ],
    blockers,
    warnings,
  };
}

export function evaluateRecommendationPricePlan(
  input: RecommendationIntakeQualityInput,
): EvaluationChunk {
  const blockers: RecommendationIntakeQualityBlocker[] = [];
  const warnings: RecommendationIntakeQualityWarning[] = [];
  const entry = getEntryPrice(input);
  const stop = positiveNumber(input.stop_price);
  const target = positiveNumber(input.target_price);
  const currentPrice = positiveNumber(input.current_price);
  const riskRewardRatio = calculateRiskRewardRatio(input);

  if (entry === null || stop === null || target === null) {
    return {
      checks: [
        buildCheck(
          "price_plan",
          "Entry / stop / target",
          "incomplete",
          "Price plan cannot be checked until entry, stop, and target are present.",
          "price_plan",
        ),
      ],
      blockers,
      warnings,
    };
  }

  if (stop >= entry) {
    blockers.push(
      blocker(
        "invalid_stop_entry_relationship",
        "Invalid stop",
        "For a long recommendation, stop must be below entry.",
        "price_plan",
      ),
    );
  }

  if (target <= entry) {
    blockers.push(
      blocker(
        "invalid_target_entry_relationship",
        "Invalid target",
        "For a long recommendation, target must be above entry.",
        "price_plan",
      ),
    );
  }

  if (riskRewardRatio !== null && riskRewardRatio < 1) {
    blockers.push(
      blocker(
        "risk_reward_below_minimum",
        "Weak R/R",
        "Risk/reward is below 1.0R.",
        "price_plan",
      ),
    );
  } else if (riskRewardRatio !== null && riskRewardRatio < 1.5) {
    warnings.push(
      warning(
        "risk_reward_needs_review",
        "Review R/R",
        "Risk/reward is between 1.0R and 1.5R.",
        "price_plan",
      ),
    );
  }

  if (currentPrice !== null && currentPrice >= target) {
    warnings.push(
      warning(
        "current_price_at_or_above_target",
        "Target already reached",
        "Current price is already at or above the target.",
        "market_data",
      ),
    );
  }

  if (currentPrice !== null && currentPrice <= stop) {
    warnings.push(
      warning(
        "current_price_at_or_below_stop",
        "Stop already reached",
        "Current price is already at or below the stop.",
        "market_data",
      ),
    );
  }

  const status =
    blockers.length > 0
      ? "blocked"
      : warnings.length > 0
        ? "warning"
        : "pass";

  return {
    checks: [
      buildCheck(
        "price_plan",
        "Entry / stop / target",
        status,
        status === "pass"
          ? "Long price plan is internally coherent."
          : "Price plan needs review before reaching the visible list.",
        "price_plan",
        blockers,
        warnings,
      ),
    ],
    blockers,
    warnings,
  };
}

export function evaluateRecommendationDataFreshness(
  input: RecommendationIntakeQualityInput,
): EvaluationChunk {
  const warnings: RecommendationIntakeQualityWarning[] = [];
  const blockers: RecommendationIntakeQualityBlocker[] = [];
  const now = toDate(input.now) ?? new Date();
  const marketDataDate = toDate(input.market_data_timestamp);
  const generatedDate = toDate(input.generated_at);
  const referenceDate = marketDataDate ?? generatedDate;

  if (!referenceDate) {
    warnings.push(
      warning(
        "freshness_timestamp_missing",
        "Freshness unknown",
        "Recommendation or market-data timestamp is unavailable.",
        "market_data",
      ),
    );
  } else {
    const ageMinutes = minutesBetween(now, referenceDate);
    if (ageMinutes > 180) {
      blockers.push(
        blocker(
          "market_data_severely_stale",
          "Stale data",
          "Recommendation data is more than 180 minutes old.",
          "market_data",
        ),
      );
    } else if (ageMinutes > 45) {
      warnings.push(
        warning(
          "market_data_stale",
          "Check freshness",
          "Recommendation data is more than 45 minutes old.",
          "market_data",
        ),
      );
    }
  }

  const status =
    blockers.length > 0
      ? "blocked"
      : warnings.length > 0
        ? "warning"
        : "pass";

  return {
    checks: [
      buildCheck(
        "data_freshness",
        "Data freshness",
        status,
        status === "pass"
          ? "Timestamp is fresh enough for intake review."
          : "Freshness needs review before relying on the recommendation.",
        "market_data",
        blockers,
        warnings,
      ),
    ],
    blockers,
    warnings,
  };
}

export function evaluateRecommendationReasonQuality(
  input: RecommendationIntakeQualityInput,
): EvaluationChunk {
  const warnings: RecommendationIntakeQualityWarning[] = [];
  const reason = textOrNull(input.reason_text);
  const normalizedReason = reason?.toLowerCase() ?? "";

  if (!reason) {
    warnings.push(
      warning(
        "reason_missing",
        "Rationale missing",
        "Recommendation rationale is unavailable.",
        "recommendation",
      ),
    );
  } else if (reason.length < 32) {
    warnings.push(
      warning(
        "reason_too_short",
        "Rationale too short",
        "Recommendation rationale is too short to show meaningful analysis.",
        "recommendation",
      ),
    );
  } else if (
    genericReasonFragments.some((fragment) => normalizedReason === fragment)
  ) {
    warnings.push(
      warning(
        "reason_generic",
        "Generic rationale",
        "Recommendation rationale is generic and should be reviewed.",
        "recommendation",
      ),
    );
  }

  return {
    checks: [
      buildCheck(
        "reason_quality",
        "Reason quality",
        warnings.length > 0 ? "warning" : "pass",
        warnings.length > 0
          ? "Rationale needs review."
          : "Rationale includes enough context for intake.",
        "recommendation",
        [],
        warnings,
      ),
    ],
    blockers: [],
    warnings,
  };
}

export function evaluateRecommendationDuplicateRisk(
  input: RecommendationIntakeQualityInput,
): EvaluationChunk {
  const warnings: RecommendationIntakeQualityWarning[] = [];
  const ticker = normalizeTicker(input.ticker);
  const setupType = textOrNull(input.setup_type);

  if (!ticker || !Array.isArray(input.existing_recommendations)) {
    return {
      checks: [
        buildCheck(
          "duplicate_risk",
          "Duplicate risk",
          "not_applicable",
          "Duplicate risk cannot be checked without ticker/list context.",
          "existing_recommendations",
        ),
      ],
      blockers: [],
      warnings,
    };
  }

  const duplicates = input.existing_recommendations.filter((item) => {
    const itemTicker = normalizeTicker(item.ticker);
    if (!itemTicker || itemTicker !== ticker) {
      return false;
    }

    if (item.id && input.recommendation_id && item.id === input.recommendation_id) {
      return false;
    }

    return item.archived !== true && item.status !== "taken";
  });

  const sameSetupDuplicate = duplicates.some(
    (item) => textOrNull(item.setup_type) === setupType,
  );

  if (sameSetupDuplicate) {
    warnings.push(
      warning(
        "duplicate_same_ticker_setup",
        "Duplicate setup",
        "Another active recommendation has the same ticker and setup type.",
        "existing_recommendations",
      ),
    );
  } else if (duplicates.length > 0) {
    warnings.push(
      warning(
        "duplicate_same_ticker",
        "Duplicate ticker",
        "Another active recommendation already exists for this ticker.",
        "existing_recommendations",
        "info",
      ),
    );
  }

  return {
    checks: [
      buildCheck(
        "duplicate_risk",
        "Duplicate risk",
        warnings.length > 0 ? "warning" : "pass",
        warnings.length > 0
          ? "Duplicate ticker/setup context needs review."
          : "No same-ticker duplicate recommendation detected.",
        "existing_recommendations",
        [],
        warnings,
      ),
    ],
    blockers: [],
    warnings,
  };
}

function evaluateConfidence(input: RecommendationIntakeQualityInput): EvaluationChunk {
  const warnings: RecommendationIntakeQualityWarning[] = [];
  const score = finiteNumber(input.confidence_score);

  if (score === null) {
    warnings.push(
      warning(
        "confidence_missing",
        "Confidence missing",
        "Recommendation confidence score is unavailable.",
        "recommendation",
        "info",
      ),
    );
  } else if (score < 0 || score > 100) {
    warnings.push(
      warning(
        "confidence_out_of_range",
        "Confidence range",
        "Recommendation confidence score is outside the expected 0-100 range.",
        "recommendation",
      ),
    );
  } else if (score < 55) {
    warnings.push(
      warning(
        "confidence_low",
        "Low confidence",
        "Recommendation confidence is below the conservative intake threshold.",
        "recommendation",
      ),
    );
  }

  return {
    checks: [
      buildCheck(
        "confidence",
        "Confidence",
        warnings.length > 0 ? "warning" : "pass",
        warnings.length > 0
          ? "Confidence needs review."
          : "Confidence score is in expected range.",
        "recommendation",
        [],
        warnings,
      ),
    ],
    blockers: [],
    warnings,
  };
}

function evaluateMarketMicrostructure(
  input: RecommendationIntakeQualityInput,
): EvaluationChunk {
  const warnings: RecommendationIntakeQualityWarning[] = [];
  const latestVolume = finiteNumber(input.latest_volume);
  const averageVolume = finiteNumber(input.average_volume);
  const spreadPercent = finiteNumber(input.spread_percent);

  if (latestVolume !== null && averageVolume !== null && averageVolume > 0) {
    if (averageVolume < 50000) {
      warnings.push(
        warning(
          "volume_low",
          "Low volume",
          "Average intraday volume looks low for a day-trade recommendation.",
          "market_data",
        ),
      );
    }

    if (latestVolume / averageVolume < 0.25) {
      warnings.push(
        warning(
          "volume_contracting",
          "Weak current volume",
          "Latest volume is materially below recent average volume.",
          "market_data",
          "info",
        ),
      );
    }
  }

  if (spreadPercent !== null && spreadPercent > 1) {
    warnings.push(
      warning(
        "spread_wide",
        "Wide spread",
        "Spread appears wide for a day-trade recommendation.",
        "market_data",
      ),
    );
  }

  return {
    checks: [
      buildCheck(
        "liquidity_spread",
        "Liquidity / spread",
        warnings.length > 0 ? "warning" : "pass",
        warnings.length > 0
          ? "Market microstructure needs review."
          : "No liquidity or spread warning was detected from available data.",
        "market_data",
        [],
        warnings,
      ),
    ],
    blockers: [],
    warnings,
  };
}

function evaluateMarketSession(
  input: RecommendationIntakeQualityInput,
): EvaluationChunk {
  const warnings: RecommendationIntakeQualityWarning[] = [];
  const phase = input.market_session?.phase ?? null;
  const riskLevel = input.market_session?.risk_level ?? null;

  if (!phase || phase === "unknown") {
    warnings.push(
      warning(
        "market_session_unknown",
        "Session unknown",
        "Market session could not be confirmed during intake.",
        "market_session",
      ),
    );
  } else if (
    phase === "closed" ||
    phase === "holiday" ||
    phase === "after_hours" ||
    phase === "pre_market"
  ) {
    warnings.push(
      warning(
        "market_session_outside_regular",
        "Outside regular session",
        "Recommendation was evaluated outside the regular intraday trading window.",
        "market_session",
      ),
    );
  } else if (phase === "power_hour" || phase === "closing_soon") {
    warnings.push(
      warning(
        "market_session_late_day",
        "Late-session risk",
        "Recommendation was evaluated during a higher-risk late-session window.",
        "market_session",
        "info",
      ),
    );
  }

  if (riskLevel === "high" || riskLevel === "critical") {
    warnings.push(
      warning(
        "market_session_high_risk",
        "Session risk elevated",
        "Market session risk is elevated.",
        "market_session",
      ),
    );
  }

  return {
    checks: [
      buildCheck(
        "market_session",
        "Market session",
        warnings.length > 0 ? "warning" : "pass",
        warnings.length > 0
          ? "Session context needs review."
          : "Market session context is compatible with intake.",
        "market_session",
        [],
        warnings,
      ),
    ],
    blockers: [],
    warnings,
  };
}

function evaluateRiskControlsContext(
  input: RecommendationIntakeQualityInput,
): EvaluationChunk {
  const warnings: RecommendationIntakeQualityWarning[] = [];
  const ticker = normalizeTicker(input.ticker);
  const riskControls = input.risk_controls;

  if (!riskControls || riskControls.enabled === false) {
    return {
      checks: [
        buildCheck(
          "risk_controls_context",
          "Risk controls context",
          "not_applicable",
          "Risk controls are unavailable or disabled for intake diagnostics.",
          "risk_controls",
        ),
      ],
      blockers: [],
      warnings,
    };
  }

  const blockedTickers = (riskControls.blocked_tickers ?? []).map((item) =>
    item.trim().toUpperCase(),
  );
  const allowedTickers = (riskControls.allowed_tickers ?? []).map((item) =>
    item.trim().toUpperCase(),
  );

  if (ticker && blockedTickers.includes(ticker)) {
    warnings.push(
      warning(
        "risk_controls_blocked_ticker",
        "Blocked ticker",
        "Ticker appears in Risk Controls blocked tickers.",
        "risk_controls",
      ),
    );
  }

  if (ticker && allowedTickers.length > 0 && !allowedTickers.includes(ticker)) {
    warnings.push(
      warning(
        "risk_controls_not_allowed_ticker",
        "Ticker not allowed",
        "Ticker is not present in Risk Controls allowed tickers.",
        "risk_controls",
      ),
    );
  }

  if (riskControls.status === "blocked") {
    warnings.push(
      warning(
        "risk_controls_blocked_status",
        "Risk controls blocked",
        "Risk Controls currently report blocked status.",
        "risk_controls",
      ),
    );
  }

  return {
    checks: [
      buildCheck(
        "risk_controls_context",
        "Risk controls context",
        warnings.length > 0 ? "warning" : "pass",
        warnings.length > 0
          ? "Risk controls context needs review."
          : "Risk controls do not flag this recommendation at intake.",
        "risk_controls",
        [],
        warnings,
      ),
    ],
    blockers: [],
    warnings,
  };
}

function determineStatus(
  checks: RecommendationIntakeQualityCheck[],
  blockers: RecommendationIntakeQualityBlocker[],
  warnings: RecommendationIntakeQualityWarning[],
): RecommendationIntakeQualityStatus {
  if (blockers.length > 0) {
    return "rejected";
  }

  if (checks.some((check) => check.status === "incomplete")) {
    return "incomplete";
  }

  if (warnings.length > 0) {
    return "needs_review";
  }

  return "accepted";
}

function determineGrade(
  status: RecommendationIntakeQualityStatus,
  riskRewardRatio: number | null,
  confidenceScore: number | null,
  blockers: RecommendationIntakeQualityBlocker[],
): RecommendationIntakeQualityGrade {
  if (status === "incomplete") {
    return "unknown";
  }

  if (status === "rejected") {
    return blockers.length > 1 ? "F" : "D";
  }

  if (status === "needs_review") {
    return "C";
  }

  if (
    (riskRewardRatio === null || riskRewardRatio >= 2) &&
    (confidenceScore === null || confidenceScore >= 70)
  ) {
    return "A";
  }

  return "B";
}

function buildSummary(
  status: RecommendationIntakeQualityStatus,
  blockers: RecommendationIntakeQualityBlocker[],
  warnings: RecommendationIntakeQualityWarning[],
) {
  if (status === "accepted") {
    return "Recommendation intake checks passed. This does not predict profit.";
  }

  if (status === "rejected") {
    return `Recommendation has ${blockers.length} intake blocker${
      blockers.length === 1 ? "" : "s"
    }. Keep card filtering internal until scanner integration is ready.`;
  }

  if (status === "incomplete") {
    return "Recommendation intake quality is incomplete because required context is missing.";
  }

  return `Recommendation needs review with ${warnings.length} warning${
    warnings.length === 1 ? "" : "s"
  }.`;
}

export function buildRecommendationIntakeQualityResult(
  input: RecommendationIntakeQualityInput,
): RecommendationIntakeQualityResult {
  const evaluatedAt = (toDate(input.now) ?? new Date()).toISOString();
  const chunks = [
    evaluateRecommendationCompleteness(input),
    evaluateRecommendationPricePlan(input),
    evaluateRecommendationDataFreshness(input),
    evaluateRecommendationReasonQuality(input),
    evaluateRecommendationDuplicateRisk(input),
    evaluateConfidence(input),
    evaluateMarketMicrostructure(input),
    evaluateMarketSession(input),
    evaluateRiskControlsContext(input),
  ];
  const checks = chunks.flatMap((chunk) => chunk.checks);
  const blockers = chunks.flatMap((chunk) => chunk.blockers);
  const warnings = chunks.flatMap((chunk) => chunk.warnings);
  const riskRewardRatio = calculateRiskRewardRatio(input);
  const referenceDate =
    toDate(input.market_data_timestamp) ?? toDate(input.generated_at);
  const evaluatedDate = toDate(evaluatedAt) ?? new Date();
  const dataAgeMinutes = referenceDate
    ? minutesBetween(evaluatedDate, referenceDate)
    : null;
  const status = determineStatus(checks, blockers, warnings);
  const grade = determineGrade(
    status,
    riskRewardRatio,
    finiteNumber(input.confidence_score),
    blockers,
  );
  const topReasons: RecommendationIntakeQualityReason[] = [
    ...blockers,
    ...warnings,
  ].slice(0, 5);

  return {
    result_id: `recommendation-intake-${input.recommendation_id ?? "unknown"}`,
    result_version: "1.0",
    result_kind: "recommendation_intake_quality",
    evaluated_at: evaluatedAt,
    recommendation_id: input.recommendation_id ?? null,
    ticker: normalizeTicker(input.ticker),
    status,
    grade,
    accepted_for_visible_list: status === "accepted" || status === "needs_review",
    internal_only: true,
    risk_reward_ratio: riskRewardRatio,
    data_age_minutes: dataAgeMinutes,
    checks,
    blockers,
    warnings,
    top_reasons: topReasons,
    summary: buildSummary(status, blockers, warnings),
  };
}

export function recommendationIntakeQualityResultJson(
  result: RecommendationIntakeQualityResult,
) {
  return JSON.stringify(result, null, 2);
}
