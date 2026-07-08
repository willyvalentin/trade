export type TureSetupFamily =
  | "momentum_breakout"
  | "vwap_pullback"
  | "opening_range_continuation"
  | "gap_continuation"
  | "gap_fade"
  | "trend_day_pullback"
  | "mean_reversion_after_overreaction"
  | "high_relative_volume_continuation"
  | "market_reference_momentum"
  | "news_catalyst_momentum"
  | "power_hour_continuation"
  | "unknown";

export type TureSetupConfidence = "low" | "medium" | "high";

export type TureSetupLabel = {
  setup_family: TureSetupFamily;
  setup_confidence: TureSetupConfidence;
  reason_codes: string[];
  caution_flags: string[];
  evidence: {
    has_vwap_context?: boolean;
    has_momentum_context?: boolean;
    has_gap_context?: boolean;
    has_volume_context?: boolean;
    has_opening_range_context?: boolean;
    has_catalyst_context?: boolean;
    has_trend_context?: boolean;
  };
  advisory_only: true;
};

export type TureSetupLabelInput = {
  ticker?: string | null;
  window?: string | null;
  tier?: string | null;
  visibility?: "visible" | "research_only" | "unknown" | string | null;
  setup_type?: string | null;
  entry_type?: string | null;
  entry_trigger_semantics?: string | null;
  reason_text?: string | null;
  payloads?: Array<Record<string, unknown> | null | undefined>;
};

export type SetupLabelingSummaryInput = {
  labels: Array<{
    visibility?: "visible" | "research_only" | "unknown" | string | null;
    label: TureSetupLabel;
  }>;
  currentBatchLabels?: Array<{
    visibility?: "visible" | "research_only" | "unknown" | string | null;
    label: TureSetupLabel;
  }>;
};

export type SetupLabelingSummary = {
  advisory_mode: true;
  current_batch_labeled_count: number;
  current_batch_total_count: number;
  known_setup_label_count: number;
  unknown_setup_label_count: number;
  setup_mix: Partial<Record<TureSetupFamily, number>>;
  visible_setup_mix: Partial<Record<TureSetupFamily, number>>;
  research_only_setup_mix: Partial<Record<TureSetupFamily, number>>;
  low_confidence_label_count: number;
  top_setup_label_gaps: Record<string, number>;
};

const emptyLabel: TureSetupLabel = {
  setup_family: "unknown",
  setup_confidence: "low",
  reason_codes: ["insufficient_setup_metadata"],
  caution_flags: [
    "missing_vwap_context",
    "missing_momentum_context",
    "missing_volume_context",
  ],
  evidence: {},
  advisory_only: true,
};

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function valueText(value: unknown, depth = 0): string[] {
  if (depth > 3 || value === null || value === undefined) return [];
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => valueText(item, depth + 1));
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, item]) => [key, ...valueText(item, depth + 1)],
    );
  }
  return [];
}

function combinedText(input: TureSetupLabelInput) {
  return [
    input.ticker,
    input.window,
    input.tier,
    input.visibility,
    input.setup_type,
    input.entry_type,
    input.entry_trigger_semantics,
    input.reason_text,
    ...(input.payloads ?? []).flatMap((payload) => valueText(payload)),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .replace(/[_-]+/g, " ")
    .toLowerCase();
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function confidenceFor(input: {
  directContext: boolean;
  evidenceCount: number;
  reasonCount: number;
}): TureSetupConfidence {
  if (input.directContext && input.evidenceCount >= 2) return "high";
  if (input.evidenceCount >= 1 || input.reasonCount >= 1) return "medium";
  return "low";
}

function buildLabel(input: {
  family: TureSetupFamily;
  directContext: boolean;
  reasonCodes: string[];
  cautionFlags: string[];
  evidence: TureSetupLabel["evidence"];
}): TureSetupLabel {
  const evidenceCount = Object.values(input.evidence).filter(Boolean).length;
  return {
    setup_family: input.family,
    setup_confidence: confidenceFor({
      directContext: input.directContext,
      evidenceCount,
      reasonCount: input.reasonCodes.length,
    }),
    reason_codes: unique(input.reasonCodes),
    caution_flags: unique(input.cautionFlags),
    evidence: input.evidence,
    advisory_only: true,
  };
}

export function buildSetupLabel(input: TureSetupLabelInput): TureSetupLabel {
  try {
    const text = combinedText(input);
    const hasAnyMetadata =
      text.trim().length > 0 || (input.payloads ?? []).some(Boolean);

    if (!hasAnyMetadata) return { ...emptyLabel };

    const evidence = {
      has_vwap_context: includesAny(text, ["vwap"]),
      has_momentum_context: includesAny(text, [
        "momentum",
        "breakout",
        "break above",
        "continuation",
        "relative strength",
        "trend",
      ]),
      has_gap_context: includesAny(text, ["gap", "gapped", "gapper"]),
      has_volume_context: includesAny(text, [
        "relative volume",
        "rel volume",
        "rvol",
        "high volume",
        "unusual volume",
        "volume spike",
        "volume rising",
      ]),
      has_opening_range_context: includesAny(text, [
        "opening range",
        "orb",
        "first 15",
        "first candle",
        "opening drive",
      ]),
      has_catalyst_context: includesAny(text, [
        "news",
        "catalyst",
        "earnings",
        "upgrade",
        "downgrade",
        "guidance",
      ]),
      has_trend_context: includesAny(text, [
        "trend day",
        "trend",
        "higher low",
        "higher high",
        "pullback",
      ]),
    };
    const missingFlags = [
      ...(evidence.has_vwap_context ? [] : ["missing_vwap_context"]),
      ...(evidence.has_momentum_context ? [] : ["missing_momentum_context"]),
      ...(evidence.has_volume_context ? [] : ["missing_volume_context"]),
    ];

    if (
      evidence.has_vwap_context &&
      includesAny(text, ["pullback", "reclaim", "hold", "bounce", "near vwap"])
    ) {
      return buildLabel({
        family: "vwap_pullback",
        directContext: true,
        reasonCodes: ["vwap_pullback_context"],
        cautionFlags: missingFlags,
        evidence,
      });
    }

    if (
      evidence.has_gap_context &&
      includesAny(text, ["fade", "reversal", "fill", "mean reversion"])
    ) {
      return buildLabel({
        family: "gap_fade",
        directContext: true,
        reasonCodes: ["gap_fade_context"],
        cautionFlags: missingFlags,
        evidence,
      });
    }

    if (
      evidence.has_gap_context &&
      includesAny(text, ["continuation", "momentum", "trend", "follow through"])
    ) {
      return buildLabel({
        family: "gap_continuation",
        directContext: true,
        reasonCodes: ["gap_continuation_context"],
        cautionFlags: missingFlags,
        evidence,
      });
    }

    if (
      evidence.has_opening_range_context &&
      includesAny(text, ["continuation", "break", "high", "range"])
    ) {
      return buildLabel({
        family: "opening_range_continuation",
        directContext: true,
        reasonCodes: ["opening_range_continuation_context"],
        cautionFlags: missingFlags,
        evidence,
      });
    }

    if (
      text.includes("power hour") &&
      includesAny(text, ["continuation", "momentum", "trend", "breakout"])
    ) {
      return buildLabel({
        family: "power_hour_continuation",
        directContext: true,
        reasonCodes: ["power_hour_continuation_context"],
        cautionFlags: missingFlags,
        evidence,
      });
    }

    if (
      evidence.has_volume_context &&
      includesAny(text, ["continuation", "momentum", "breakout", "trend"])
    ) {
      return buildLabel({
        family: "high_relative_volume_continuation",
        directContext: true,
        reasonCodes: ["high_relative_volume_continuation_context"],
        cautionFlags: missingFlags,
        evidence,
      });
    }

    if (
      includesAny(text, [
        "overreaction",
        "mean reversion",
        "reversal",
        "oversold",
        "overbought",
      ])
    ) {
      return buildLabel({
        family: "mean_reversion_after_overreaction",
        directContext: evidence.has_momentum_context,
        reasonCodes: ["mean_reversion_after_overreaction_context"],
        cautionFlags: missingFlags,
        evidence,
      });
    }

    if (
      evidence.has_catalyst_context &&
      includesAny(text, ["momentum", "continuation", "breakout", "trend"])
    ) {
      return buildLabel({
        family: "news_catalyst_momentum",
        directContext: true,
        reasonCodes: ["news_catalyst_momentum_context"],
        cautionFlags: missingFlags,
        evidence,
      });
    }

    if (
      evidence.has_trend_context &&
      includesAny(text, ["pullback", "higher low", "trend day"])
    ) {
      return buildLabel({
        family: "trend_day_pullback",
        directContext: true,
        reasonCodes: ["trend_day_pullback_context"],
        cautionFlags: missingFlags,
        evidence,
      });
    }

    if (
      evidence.has_momentum_context &&
      includesAny(text, ["breakout", "break above", "range high", "new high"])
    ) {
      return buildLabel({
        family: "momentum_breakout",
        directContext: true,
        reasonCodes: ["momentum_breakout_context"],
        cautionFlags: missingFlags,
        evidence,
      });
    }

    if (
      includesAny(text, ["market reference", "latest reference", "reference entry"]) &&
      evidence.has_momentum_context
    ) {
      return buildLabel({
        family: "market_reference_momentum",
        directContext: false,
        reasonCodes: ["market_reference_momentum_context"],
        cautionFlags: missingFlags,
        evidence,
      });
    }

    return {
      setup_family: "unknown",
      setup_confidence: "low",
      reason_codes: ["insufficient_setup_metadata"],
      caution_flags: unique(["insufficient_setup_metadata", ...missingFlags]),
      evidence,
      advisory_only: true,
    };
  } catch {
    return { ...emptyLabel };
  }
}

function increment(
  counts: Partial<Record<TureSetupFamily, number>>,
  key: TureSetupFamily,
) {
  counts[key] = (counts[key] ?? 0) + 1;
}

function incrementString(counts: Record<string, number>, key: string) {
  counts[key] = (counts[key] ?? 0) + 1;
}

function normalizedVisibility(value: unknown) {
  const text = textOrNull(value)?.toLowerCase();
  return text === "visible" || text === "research_only" ? text : "unknown";
}

export function buildSetupLabelingSummary(
  input: SetupLabelingSummaryInput,
): SetupLabelingSummary {
  const setupMix: Partial<Record<TureSetupFamily, number>> = {};
  const visibleMix: Partial<Record<TureSetupFamily, number>> = {};
  const researchMix: Partial<Record<TureSetupFamily, number>> = {};
  const gaps: Record<string, number> = {};

  for (const item of input.labels) {
    const family = item.label.setup_family;
    increment(setupMix, family);

    const visibility = normalizedVisibility(item.visibility);
    if (visibility === "visible") increment(visibleMix, family);
    if (visibility === "research_only") increment(researchMix, family);

    for (const reason of [
      ...item.label.reason_codes,
      ...item.label.caution_flags,
    ]) {
      incrementString(gaps, reason);
    }
  }

  return {
    advisory_mode: true,
    current_batch_labeled_count: input.currentBatchLabels?.length ?? 0,
    current_batch_total_count: input.currentBatchLabels?.length ?? 0,
    known_setup_label_count: input.labels.filter(
      (item) => item.label.setup_family !== "unknown",
    ).length,
    unknown_setup_label_count: input.labels.filter(
      (item) => item.label.setup_family === "unknown",
    ).length,
    setup_mix: setupMix,
    visible_setup_mix: visibleMix,
    research_only_setup_mix: researchMix,
    low_confidence_label_count: input.labels.filter(
      (item) => item.label.setup_confidence === "low",
    ).length,
    top_setup_label_gaps: Object.fromEntries(
      Object.entries(gaps).sort((first, second) => second[1] - first[1]),
    ),
  };
}
