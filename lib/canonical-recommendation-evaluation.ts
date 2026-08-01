import type { RecommendationOutcomeHorizon } from "@/lib/recommendation-outcome-tracker";

export const CANONICAL_RECOMMENDATION_EVALUATION_CONTRACT_VERSION =
  "canonical_recommendation_evaluation_v1" as const;
export const CANONICAL_RECOMMENDATION_IDENTITY_VERSION =
  "canonical_recommendation_identity_v1" as const;
export const CANONICAL_OUTCOME_EVALUATOR_VERSION =
  "canonical_outcome_evaluator_v1" as const;

export const canonicalSampleTypes = [
  "visible",
  "research_only",
  "shadow",
  "historical_synthetic",
  "rejected_candidate",
  "no_trade",
] as const;

export type CanonicalSampleType = (typeof canonicalSampleTypes)[number];
export type CanonicalPrimaryHorizon = Extract<
  RecommendationOutcomeHorizon,
  "15m" | "30m" | "60m"
>;
export type CanonicalConfidenceLabel = "low" | "medium" | "high";
export type CanonicalSide = "long" | "short";
export type CanonicalEntryPolicy =
  | "immediate_at_recommendation"
  | "touch_after_recommendation";

export type CanonicalContractResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

export type CanonicalRecommendationIdentityInput = {
  source_namespace: string;
  decision_id: string;
  decided_at: string;
};

export type CanonicalRecommendationIdentity = {
  contract_version: typeof CANONICAL_RECOMMENDATION_IDENTITY_VERSION;
  value: string;
  source_namespace: string;
  decision_id: string;
  decided_at: string;
};

export type CanonicalEvaluationVersions = {
  engine_version: string;
  scoring_version: string;
  ranking_version: string;
  setup_taxonomy_version: string;
  confidence_contract_version: string;
  evaluator_version: string;
  provider_contract_version: string;
  git_commit: string;
  build_identity: string;
};

export type CanonicalConfidence = {
  numeric_confidence: number | null;
  numeric_confidence_scale: "probability_0_1";
  confidence_label: CanonicalConfidenceLabel | null;
};

export type CanonicalRecommendationDecisionInput = {
  identity: CanonicalRecommendationIdentityInput;
  sample_type: unknown;
  versions: CanonicalEvaluationVersions;
  confidence: CanonicalConfidence;
};

export type CanonicalRecommendationDecision = {
  contract_version: typeof CANONICAL_RECOMMENDATION_EVALUATION_CONTRACT_VERSION;
  identity: CanonicalRecommendationIdentity;
  sample_type: CanonicalSampleType;
  versions: CanonicalEvaluationVersions;
  confidence: CanonicalConfidence;
};

export type CanonicalProviderStatus =
  | "available"
  | "gap"
  | "error"
  | "unavailable"
  | "not_requested";
export type CanonicalFreshness = "fresh" | "stale" | "unknown";
export type CanonicalCoverageStatus =
  | "complete"
  | "provider_gap"
  | "stale"
  | "incomplete";

export type CanonicalCoverageInput = {
  provider_status: CanonicalProviderStatus;
  freshness: CanonicalFreshness;
  expected_candle_count: number | null;
  observed_candle_count: number;
  plan_complete: boolean;
  malformed_candle_count?: number;
  blockers?: string[];
};

export type CanonicalCoverage = {
  status: CanonicalCoverageStatus;
  expected_candle_count: number | null;
  observed_candle_count: number;
  reason_codes: string[];
};

export type CanonicalEvaluationCandle = {
  start_at: string;
  end_at: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number | null;
};

export type CanonicalExcludedCandleReason =
  | "invalid_timestamp"
  | "invalid_interval"
  | "invalid_ohlc"
  | "pre_recommendation_or_overlapping"
  | "duplicate_interval";

export type CanonicalExcludedCandle = {
  candle: CanonicalEvaluationCandle;
  original_index: number;
  reason: CanonicalExcludedCandleReason;
};

export type CanonicalCandleCutoffResult = {
  recommended_at: string | null;
  eligible_candles: CanonicalEvaluationCandle[];
  excluded_candles: CanonicalExcludedCandle[];
  malformed_candle_count: number;
  pre_recommendation_or_overlapping_count: number;
  duplicate_interval_count: number;
};

export type CanonicalOutcomeClassification =
  | "target_before_stop"
  | "stop_before_target"
  | "ambiguous_same_candle"
  | "no_entry"
  | "neither"
  | "incomplete";

export type CanonicalOutcomeInput = {
  recommended_at: string;
  side: CanonicalSide;
  entry_policy: CanonicalEntryPolicy;
  entry: number | null;
  stop: number | null;
  target: number | null;
  candles: CanonicalEvaluationCandle[];
  coverage: Omit<
    CanonicalCoverageInput,
    "observed_candle_count" | "malformed_candle_count" | "plan_complete"
  >;
};

export type CanonicalOutcome = {
  evaluator_version: typeof CANONICAL_OUTCOME_EVALUATOR_VERSION;
  classification: CanonicalOutcomeClassification;
  coverage: CanonicalCoverage;
  entry_triggered: boolean | null;
  entry_triggered_at: string | null;
  terminal_at: string | null;
  reason_codes: string[];
  candle_cutoff: CanonicalCandleCutoffResult;
};

export type CanonicalHorizonOutcome<T = unknown> = {
  horizon: CanonicalPrimaryHorizon;
  coverage: CanonicalCoverage;
  outcome: T;
};

export type CanonicalPrimaryOutcomeSelection<T = unknown> = {
  status: "selected" | "incomplete";
  primary_horizon: CanonicalPrimaryHorizon | null;
  primary_outcome: CanonicalHorizonOutcome<T> | null;
  diagnostic_outcomes: CanonicalHorizonOutcome<T>[];
  canonical_outcome_count: 0 | 1;
  reason_codes: string[];
};

const explicitInstantPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const sourceNamespacePattern = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const fullGitCommitPattern = /^[0-9a-f]{40}$/;
const controlCharacterPattern = /[\u0000-\u001f\u007f]/;
const primaryHorizonPriority: CanonicalPrimaryHorizon[] = [
  "60m",
  "30m",
  "15m",
];

function explicitInstant(value: unknown) {
  if (typeof value !== "string" || !explicitInstantPattern.test(value)) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function canonicalText(value: unknown, maxLength = 160) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maxLength ||
    value !== value.trim() ||
    value !== value.normalize("NFC") ||
    controlCharacterPattern.test(value)
  ) {
    return null;
  }

  return value;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function invalidCandleReason(
  candle: CanonicalEvaluationCandle,
): CanonicalExcludedCandleReason | null {
  const start = explicitInstant(candle.start_at);
  const end = explicitInstant(candle.end_at);

  if (!start || !end) return "invalid_timestamp";
  if (Date.parse(end) <= Date.parse(start)) return "invalid_interval";
  if (
    !finiteNumber(candle.open) ||
    !finiteNumber(candle.high) ||
    !finiteNumber(candle.low) ||
    !finiteNumber(candle.close) ||
    candle.low > candle.high ||
    candle.open < candle.low ||
    candle.open > candle.high ||
    candle.close < candle.low ||
    candle.close > candle.high
  ) {
    return "invalid_ohlc";
  }

  return null;
}

function touchesEntry(
  candle: CanonicalEvaluationCandle,
  entry: number,
) {
  return candle.low <= entry && candle.high >= entry;
}

function touchesTarget(
  candle: CanonicalEvaluationCandle,
  target: number,
  side: CanonicalSide,
) {
  return side === "long" ? candle.high >= target : candle.low <= target;
}

function touchesStop(
  candle: CanonicalEvaluationCandle,
  stop: number,
  side: CanonicalSide,
) {
  return side === "long" ? candle.low <= stop : candle.high >= stop;
}

function validPlan(
  side: CanonicalSide,
  entry: number | null,
  stop: number | null,
  target: number | null,
) {
  if (
    !finiteNumber(entry) ||
    !finiteNumber(stop) ||
    !finiteNumber(target)
  ) {
    return false;
  }

  return side === "long"
    ? stop < entry && entry < target
    : target < entry && entry < stop;
}

export function buildCanonicalRecommendationIdentity(
  input: CanonicalRecommendationIdentityInput,
): CanonicalContractResult<CanonicalRecommendationIdentity> {
  const errors: string[] = [];
  const sourceNamespace = canonicalText(input.source_namespace, 64);
  const decisionId = canonicalText(input.decision_id, 240);
  const decidedAt = explicitInstant(input.decided_at);

  if (!sourceNamespace || !sourceNamespacePattern.test(sourceNamespace)) {
    errors.push("invalid_source_namespace");
  }
  if (!decisionId) errors.push("invalid_decision_id");
  if (!decidedAt) errors.push("invalid_decided_at");

  if (errors.length > 0 || !sourceNamespace || !decisionId || !decidedAt) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      contract_version: CANONICAL_RECOMMENDATION_IDENTITY_VERSION,
      value: [
        "rec_decision",
        "v1",
        encodeURIComponent(sourceNamespace),
        encodeURIComponent(decisionId),
        String(Date.parse(decidedAt)),
      ].join(":"),
      source_namespace: sourceNamespace,
      decision_id: decisionId,
      decided_at: decidedAt,
    },
  };
}

export function validateCanonicalSampleType(
  value: unknown,
): CanonicalContractResult<CanonicalSampleType> {
  if (
    typeof value === "string" &&
    canonicalSampleTypes.some((sampleType) => sampleType === value)
  ) {
    return { ok: true, value: value as CanonicalSampleType };
  }

  return { ok: false, errors: ["invalid_or_nonexclusive_sample_type"] };
}

export function validateCanonicalEvaluationVersions(
  versions: CanonicalEvaluationVersions,
): CanonicalContractResult<CanonicalEvaluationVersions> {
  const errors: string[] = [];
  const versionFields = [
    "engine_version",
    "scoring_version",
    "ranking_version",
    "setup_taxonomy_version",
    "confidence_contract_version",
    "evaluator_version",
    "provider_contract_version",
    "build_identity",
  ] as const;

  for (const field of versionFields) {
    if (!canonicalText(versions[field], 160)) {
      errors.push(`invalid_${field}`);
    }
  }

  if (!fullGitCommitPattern.test(versions.git_commit)) {
    errors.push("invalid_git_commit");
  }

  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, value: { ...versions } };
}

export function validateCanonicalConfidence(
  confidence: CanonicalConfidence,
): CanonicalContractResult<CanonicalConfidence> {
  const errors: string[] = [];

  if (
    confidence.numeric_confidence !== null &&
    (!finiteNumber(confidence.numeric_confidence) ||
      confidence.numeric_confidence < 0 ||
      confidence.numeric_confidence > 1)
  ) {
    errors.push("numeric_confidence_must_be_probability_0_1_or_null");
  }

  if (confidence.numeric_confidence_scale !== "probability_0_1") {
    errors.push("invalid_numeric_confidence_scale");
  }

  if (
    confidence.confidence_label !== null &&
    !["low", "medium", "high"].includes(confidence.confidence_label)
  ) {
    errors.push("invalid_confidence_label");
  }

  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, value: { ...confidence } };
}

export function buildCanonicalRecommendationDecision(
  input: CanonicalRecommendationDecisionInput,
): CanonicalContractResult<CanonicalRecommendationDecision> {
  const identity = buildCanonicalRecommendationIdentity(input.identity);
  const sampleType = validateCanonicalSampleType(input.sample_type);
  const versions = validateCanonicalEvaluationVersions(input.versions);
  const confidence = validateCanonicalConfidence(input.confidence);
  const errors = [
    ...(identity.ok ? [] : identity.errors),
    ...(sampleType.ok ? [] : sampleType.errors),
    ...(versions.ok ? [] : versions.errors),
    ...(confidence.ok ? [] : confidence.errors),
  ];

  if (
    errors.length > 0 ||
    !identity.ok ||
    !sampleType.ok ||
    !versions.ok ||
    !confidence.ok
  ) {
    return { ok: false, errors: unique(errors) };
  }

  return {
    ok: true,
    value: {
      contract_version: CANONICAL_RECOMMENDATION_EVALUATION_CONTRACT_VERSION,
      identity: identity.value,
      sample_type: sampleType.value,
      versions: versions.value,
      confidence: confidence.value,
    },
  };
}

export function classifyCanonicalCoverage(
  input: CanonicalCoverageInput,
): CanonicalCoverage {
  const reasonCodes: string[] = [];
  const malformedCandleCount = input.malformed_candle_count ?? 0;
  const blockers = input.blockers ?? [];

  if (["gap", "error", "unavailable"].includes(input.provider_status)) {
    reasonCodes.push(`provider_${input.provider_status}`);
  } else if (input.provider_status === "not_requested") {
    reasonCodes.push("provider_not_requested");
  }

  if (input.freshness === "stale") reasonCodes.push("stale_data");
  if (input.freshness === "unknown") reasonCodes.push("freshness_unknown");
  if (!input.plan_complete) reasonCodes.push("plan_incomplete");
  if (
    input.expected_candle_count === null ||
    !Number.isInteger(input.expected_candle_count) ||
    input.expected_candle_count <= 0
  ) {
    reasonCodes.push("expected_candle_count_invalid");
  } else if (input.observed_candle_count < input.expected_candle_count) {
    reasonCodes.push("candle_coverage_incomplete");
  }
  if (
    !Number.isInteger(input.observed_candle_count) ||
    input.observed_candle_count < 0
  ) {
    reasonCodes.push("observed_candle_count_invalid");
  }
  if (malformedCandleCount > 0) reasonCodes.push("malformed_candles");
  if (blockers.length > 0) reasonCodes.push("evaluation_blockers");

  let status: CanonicalCoverageStatus;

  if (["gap", "error", "unavailable"].includes(input.provider_status)) {
    status = "provider_gap";
  } else if (input.freshness === "stale") {
    status = "stale";
  } else if (reasonCodes.length > 0) {
    status = "incomplete";
  } else {
    status = "complete";
  }

  return {
    status,
    expected_candle_count: input.expected_candle_count,
    observed_candle_count: input.observed_candle_count,
    reason_codes: unique(reasonCodes),
  };
}

export function applyCanonicalCandleCutoff(
  candles: CanonicalEvaluationCandle[],
  recommendedAt: string,
): CanonicalCandleCutoffResult {
  const canonicalRecommendedAt = explicitInstant(recommendedAt);
  const recommendedTimestamp = canonicalRecommendedAt
    ? Date.parse(canonicalRecommendedAt)
    : null;
  const excluded: CanonicalExcludedCandle[] = [];
  const eligible: Array<{
    candle: CanonicalEvaluationCandle;
    originalIndex: number;
    start: number;
    end: number;
  }> = [];
  const seenIntervals = new Set<string>();

  candles.forEach((candle, originalIndex) => {
    const invalidReason = invalidCandleReason(candle);

    if (invalidReason) {
      excluded.push({
        candle,
        original_index: originalIndex,
        reason: invalidReason,
      });
      return;
    }

    const start = Date.parse(candle.start_at);
    const end = Date.parse(candle.end_at);
    const intervalKey = `${new Date(start).toISOString()}|${new Date(end).toISOString()}`;

    if (seenIntervals.has(intervalKey)) {
      excluded.push({
        candle,
        original_index: originalIndex,
        reason: "duplicate_interval",
      });
      return;
    }
    seenIntervals.add(intervalKey);

    if (recommendedTimestamp === null || start < recommendedTimestamp) {
      excluded.push({
        candle,
        original_index: originalIndex,
        reason:
          recommendedTimestamp === null
            ? "invalid_timestamp"
            : "pre_recommendation_or_overlapping",
      });
      return;
    }

    eligible.push({ candle, originalIndex, start, end });
  });

  eligible.sort(
    (first, second) =>
      first.start - second.start ||
      first.end - second.end ||
      first.originalIndex - second.originalIndex,
  );
  excluded.sort(
    (first, second) => first.original_index - second.original_index,
  );

  return {
    recommended_at: canonicalRecommendedAt,
    eligible_candles: eligible.map((item) => item.candle),
    excluded_candles: excluded,
    malformed_candle_count: excluded.filter((item) =>
      ["invalid_timestamp", "invalid_interval", "invalid_ohlc"].includes(
        item.reason,
      ),
    ).length,
    pre_recommendation_or_overlapping_count: excluded.filter(
      (item) => item.reason === "pre_recommendation_or_overlapping",
    ).length,
    duplicate_interval_count: excluded.filter(
      (item) => item.reason === "duplicate_interval",
    ).length,
  };
}

export function classifyCanonicalOutcome(
  input: CanonicalOutcomeInput,
): CanonicalOutcome {
  const candleCutoff = applyCanonicalCandleCutoff(
    input.candles,
    input.recommended_at,
  );
  const planComplete = validPlan(
    input.side,
    input.entry,
    input.stop,
    input.target,
  );
  const coverage = classifyCanonicalCoverage({
    ...input.coverage,
    observed_candle_count: candleCutoff.eligible_candles.length,
    malformed_candle_count:
      candleCutoff.malformed_candle_count +
      candleCutoff.duplicate_interval_count,
    plan_complete: planComplete,
    blockers: candleCutoff.recommended_at
      ? input.coverage.blockers
      : [...(input.coverage.blockers ?? []), "invalid_recommended_at"],
  });
  const base = {
    evaluator_version: CANONICAL_OUTCOME_EVALUATOR_VERSION,
    coverage,
    candle_cutoff: candleCutoff,
  } as const;

  if (
    coverage.status !== "complete" ||
    !planComplete ||
    input.entry === null ||
    input.stop === null ||
    input.target === null
  ) {
    return {
      ...base,
      classification: "incomplete",
      entry_triggered: null,
      entry_triggered_at: null,
      terminal_at: null,
      reason_codes: unique(["coverage_not_complete", ...coverage.reason_codes]),
    };
  }

  const entryIndex =
    input.entry_policy === "immediate_at_recommendation"
      ? 0
      : candleCutoff.eligible_candles.findIndex((candle) =>
          touchesEntry(candle, input.entry as number),
        );

  if (entryIndex < 0) {
    return {
      ...base,
      classification: "no_entry",
      entry_triggered: false,
      entry_triggered_at: null,
      terminal_at: null,
      reason_codes: ["entry_not_touched_after_cutoff"],
    };
  }

  const entryCandle = candleCutoff.eligible_candles[entryIndex];

  for (
    let index = entryIndex;
    index < candleCutoff.eligible_candles.length;
    index += 1
  ) {
    const candle = candleCutoff.eligible_candles[index];
    const targetTouched = touchesTarget(candle, input.target, input.side);
    const stopTouched = touchesStop(candle, input.stop, input.side);
    const entryAndTerminalShareCandle =
      input.entry_policy === "touch_after_recommendation" &&
      index === entryIndex &&
      (targetTouched || stopTouched);

    if (
      (targetTouched && stopTouched) ||
      entryAndTerminalShareCandle
    ) {
      return {
        ...base,
        classification: "ambiguous_same_candle",
        entry_triggered: true,
        entry_triggered_at: entryCandle.start_at,
        terminal_at: candle.start_at,
        reason_codes: [
          targetTouched && stopTouched
            ? "target_and_stop_same_candle"
            : "entry_and_terminal_same_candle",
          "intrabar_sequence_unknown",
        ],
      };
    }

    if (targetTouched) {
      return {
        ...base,
        classification: "target_before_stop",
        entry_triggered: true,
        entry_triggered_at: entryCandle.start_at,
        terminal_at: candle.start_at,
        reason_codes: ["target_touched_first"],
      };
    }

    if (stopTouched) {
      return {
        ...base,
        classification: "stop_before_target",
        entry_triggered: true,
        entry_triggered_at: entryCandle.start_at,
        terminal_at: candle.start_at,
        reason_codes: ["stop_touched_first"],
      };
    }
  }

  return {
    ...base,
    classification: "neither",
    entry_triggered: true,
    entry_triggered_at: entryCandle.start_at,
    terminal_at: null,
    reason_codes: ["no_terminal_event_in_complete_horizon"],
  };
}

export function selectCanonicalPrimaryOutcome<T>(
  outcomes: CanonicalHorizonOutcome<T>[],
): CanonicalPrimaryOutcomeSelection<T> {
  const counts = new Map<CanonicalPrimaryHorizon, number>();

  for (const outcome of outcomes) {
    counts.set(outcome.horizon, (counts.get(outcome.horizon) ?? 0) + 1);
  }

  const duplicateHorizons = primaryHorizonPriority.filter(
    (horizon) => (counts.get(horizon) ?? 0) > 1,
  );
  const sorted = [...outcomes].sort(
    (first, second) =>
      primaryHorizonPriority.indexOf(first.horizon) -
      primaryHorizonPriority.indexOf(second.horizon),
  );

  if (duplicateHorizons.length > 0) {
    return {
      status: "incomplete",
      primary_horizon: null,
      primary_outcome: null,
      diagnostic_outcomes: sorted,
      canonical_outcome_count: 0,
      reason_codes: duplicateHorizons.map(
        (horizon) => `duplicate_${horizon}_outcome`,
      ),
    };
  }

  const primary =
    primaryHorizonPriority
      .map((horizon) =>
        sorted.find(
          (outcome) =>
            outcome.horizon === horizon &&
            outcome.coverage.status === "complete",
        ),
      )
      .find(
        (outcome): outcome is CanonicalHorizonOutcome<T> =>
          outcome !== undefined,
      ) ?? null;

  if (!primary) {
    return {
      status: "incomplete",
      primary_horizon: null,
      primary_outcome: null,
      diagnostic_outcomes: sorted,
      canonical_outcome_count: 0,
      reason_codes: ["no_complete_supported_horizon"],
    };
  }

  return {
    status: "selected",
    primary_horizon: primary.horizon,
    primary_outcome: primary,
    diagnostic_outcomes: sorted.filter((outcome) => outcome !== primary),
    canonical_outcome_count: 1,
    reason_codes: [`selected_complete_${primary.horizon}`],
  };
}
