export type CandidateBuildRejectionReason =
  | "built"
  | "below_publish_threshold"
  | "not_selected_by_ranking"
  | "ranking_selected_but_not_qualified"
  | "fallback_builder_limit_reached"
  | "missing_fresh_reference_price"
  | "scanner_cache_reference_too_old"
  | "stale_reference_price"
  | "future_reference_timestamp"
  | "missing_reference_source"
  | "missing_reference_timestamp"
  | "invalid_risk_geometry"
  | "weak_risk_reward"
  | "sanitizer_rejected"
  | "openai_no_trade"
  | "openai_skipped_deterministic_fallback"
  | "provider_data_unavailable"
  | "stale_market_data"
  | "unknown_build_rejection";

export type CandidateBuildRejectionCategory =
  | "built"
  | "quality"
  | "data_quality"
  | "safety"
  | "builder_limit"
  | "provider"
  | "openai"
  | "unknown";

export type SelectedCandidateBuildDiagnostic = {
  ticker: string;
  side: "long" | "short" | "unknown";
  score: number | null;
  tier: string | null;
  setup_type: string | null;
  source: string | null;
  reference_price_status: string | null;
  reference_price_source: string | null;
  reference_price_read_path: string | null;
  reference_price_age_minutes: number | null;
  vwap_status: string | null;
  momentum_status: string | null;
  volume_status: string | null;
  risk_geometry_status: string | null;
  enough_data_to_build_plan: boolean;
  built: boolean;
  rejection_reason: CandidateBuildRejectionReason;
  rejection_category: CandidateBuildRejectionCategory;
  explanation: string;
};

export type SelectedToBuiltDropOffSummary = {
  selected_count: number;
  built_count: number;
  rejected_count: number;
  rejection_counts: Partial<Record<CandidateBuildRejectionReason, number>>;
  category_counts: Partial<Record<CandidateBuildRejectionCategory, number>>;
  examples_by_reason: Partial<Record<CandidateBuildRejectionReason, string[]>>;
  output_below_target_reason_category:
    | "healthy_caution"
    | "data_quality"
    | "safety"
    | "builder_limit"
    | "implementation_bottleneck"
    | "unknown";
  output_below_target_explanation: string;
};

export function normalizeCandidateBuildRejectionReason(
  value: string | null | undefined,
): CandidateBuildRejectionReason {
  const text = (value ?? "").trim().toLowerCase();

  if (!text) return "unknown_build_rejection";
  if (text === "built") return "built";
  if (text.includes("below_publish_threshold")) return "below_publish_threshold";
  if (text.includes("not_selected_by_ranking")) return "not_selected_by_ranking";
  if (text.includes("ranking_selected_but_not_qualified")) {
    return "ranking_selected_but_not_qualified";
  }
  if (text.includes("fallback_builder_limit_reached")) {
    return "fallback_builder_limit_reached";
  }
  if (text.includes("scanner_cache_reference_too_old")) {
    return "scanner_cache_reference_too_old";
  }
  if (text.includes("stale_reference_price")) return "stale_reference_price";
  if (text.includes("future_reference_timestamp")) return "future_reference_timestamp";
  if (text.includes("missing_reference_source")) return "missing_reference_source";
  if (text.includes("missing_reference_timestamp")) {
    return "missing_reference_timestamp";
  }
  if (text.includes("missing_fresh_reference_price")) {
    return "missing_fresh_reference_price";
  }
  if (text.includes("invalid_risk_geometry")) return "invalid_risk_geometry";
  if (text.includes("weak_risk_reward")) return "weak_risk_reward";
  if (text.includes("sanitizer")) return "sanitizer_rejected";
  if (text.includes("openai") && text.includes("no_trade")) return "openai_no_trade";
  if (text.includes("openai") && text.includes("skipped")) {
    return "openai_skipped_deterministic_fallback";
  }
  if (text.includes("provider") || text.includes("unavailable")) {
    return "provider_data_unavailable";
  }
  if (text.includes("stale_market_data")) return "stale_market_data";

  return "unknown_build_rejection";
}

export function categoryForCandidateBuildRejection(
  reason: CandidateBuildRejectionReason,
): CandidateBuildRejectionCategory {
  if (reason === "built") return "built";
  if (
    reason === "missing_fresh_reference_price" ||
    reason === "scanner_cache_reference_too_old" ||
    reason === "stale_reference_price" ||
    reason === "future_reference_timestamp" ||
    reason === "missing_reference_source" ||
    reason === "missing_reference_timestamp" ||
    reason === "stale_market_data"
  ) {
    return "data_quality";
  }
  if (reason === "provider_data_unavailable") return "provider";
  if (reason === "invalid_risk_geometry" || reason === "weak_risk_reward") {
    return "safety";
  }
  if (
    reason === "below_publish_threshold" ||
    reason === "not_selected_by_ranking" ||
    reason === "ranking_selected_but_not_qualified"
  ) {
    return "quality";
  }
  if (reason === "fallback_builder_limit_reached") return "builder_limit";
  if (
    reason === "openai_no_trade" ||
    reason === "openai_skipped_deterministic_fallback" ||
    reason === "sanitizer_rejected"
  ) {
    return "openai";
  }

  return "unknown";
}

export function buildSelectedCandidateBuildDiagnostic(input: {
  ticker: string;
  side?: "long" | "short" | "unknown";
  score?: number | null;
  tier?: string | null;
  setupType?: string | null;
  source?: string | null;
  referencePriceStatus?: string | null;
  referencePriceSource?: string | null;
  referencePriceReadPath?: string | null;
  referencePriceAgeMinutes?: number | null;
  vwapStatus?: string | null;
  momentumStatus?: string | null;
  volumeStatus?: string | null;
  riskGeometryStatus?: string | null;
  enoughDataToBuildPlan?: boolean;
  built?: boolean;
  rejectionReason?: string | null;
  explanation?: string | null;
}): SelectedCandidateBuildDiagnostic {
  const reason = input.built
    ? "built"
    : normalizeCandidateBuildRejectionReason(input.rejectionReason);
  const category = categoryForCandidateBuildRejection(reason);

  return {
    ticker: input.ticker.trim().toUpperCase(),
    side: input.side ?? "unknown",
    score: numberOrNull(input.score),
    tier: textOrNull(input.tier),
    setup_type: textOrNull(input.setupType),
    source: textOrNull(input.source),
    reference_price_status: textOrNull(input.referencePriceStatus),
    reference_price_source: textOrNull(input.referencePriceSource),
    reference_price_read_path: textOrNull(input.referencePriceReadPath),
    reference_price_age_minutes: numberOrNull(input.referencePriceAgeMinutes),
    vwap_status: textOrNull(input.vwapStatus),
    momentum_status: textOrNull(input.momentumStatus),
    volume_status: textOrNull(input.volumeStatus),
    risk_geometry_status: textOrNull(input.riskGeometryStatus),
    enough_data_to_build_plan: Boolean(input.enoughDataToBuildPlan),
    built: Boolean(input.built),
    rejection_reason: reason,
    rejection_category: category,
    explanation:
      textOrNull(input.explanation) ??
      (reason === "built"
        ? "Recommendation was built for this selected candidate."
        : `Selected candidate was not built: ${reason}.`),
  };
}

export function summarizeSelectedCandidateBuildDiagnostics(
  diagnostics: SelectedCandidateBuildDiagnostic[],
  targetMin = 6,
): SelectedToBuiltDropOffSummary {
  const selectedCount = diagnostics.length;
  const builtCount = diagnostics.filter((item) => item.built).length;
  const rejected = diagnostics.filter((item) => !item.built);
  const rejectionCounts: Partial<Record<CandidateBuildRejectionReason, number>> = {};
  const categoryCounts: Partial<Record<CandidateBuildRejectionCategory, number>> = {};
  const examplesByReason: Partial<Record<CandidateBuildRejectionReason, string[]>> = {};

  for (const item of rejected) {
    rejectionCounts[item.rejection_reason] =
      (rejectionCounts[item.rejection_reason] ?? 0) + 1;
    categoryCounts[item.rejection_category] =
      (categoryCounts[item.rejection_category] ?? 0) + 1;
    const examples = examplesByReason[item.rejection_reason] ?? [];
    if (examples.length < 5) {
      examples.push(item.ticker);
      examplesByReason[item.rejection_reason] = examples;
    }
  }

  const reasonCategory = outputBelowTargetReasonCategory({
    builtCount,
    targetMin,
    categoryCounts,
    rejectedCount: rejected.length,
  });

  return {
    selected_count: selectedCount,
    built_count: builtCount,
    rejected_count: rejected.length,
    rejection_counts: rejectionCounts,
    category_counts: categoryCounts,
    examples_by_reason: examplesByReason,
    output_below_target_reason_category: reasonCategory,
    output_below_target_explanation: outputBelowTargetExplanation(reasonCategory),
  };
}

function outputBelowTargetReasonCategory(input: {
  builtCount: number;
  targetMin: number;
  categoryCounts: Partial<Record<CandidateBuildRejectionCategory, number>>;
  rejectedCount: number;
}): SelectedToBuiltDropOffSummary["output_below_target_reason_category"] {
  if (input.builtCount >= input.targetMin) return "healthy_caution";
  if (input.rejectedCount === 0) return "unknown";

  const dataQuality =
    (input.categoryCounts.data_quality ?? 0) + (input.categoryCounts.provider ?? 0);
  const safety = input.categoryCounts.safety ?? 0;
  const quality = input.categoryCounts.quality ?? 0;
  const builderLimit = input.categoryCounts.builder_limit ?? 0;
  const unknown = input.categoryCounts.unknown ?? 0;

  if (dataQuality >= Math.max(safety, quality, builderLimit, unknown)) {
    return "data_quality";
  }
  if (safety >= Math.max(quality, builderLimit, unknown)) return "safety";
  if (builderLimit > 0) return "builder_limit";
  if (unknown > 0) return "implementation_bottleneck";
  return "healthy_caution";
}

function outputBelowTargetExplanation(
  category: SelectedToBuiltDropOffSummary["output_below_target_reason_category"],
) {
  if (category === "data_quality") {
    return "Output is below target mainly because selected candidates lacked fresh provider/reference data.";
  }
  if (category === "safety") {
    return "Output is below target because selected candidates failed safety geometry or risk/reward checks.";
  }
  if (category === "builder_limit") {
    return "Output is below target because the builder reached a configured recommendation limit.";
  }
  if (category === "implementation_bottleneck") {
    return "Output is below target because at least one selected candidate lacks a specific build rejection reason.";
  }
  if (category === "healthy_caution") {
    return "Output is below target because candidate quality/data did not justify forcing more recommendations.";
  }

  return "Output is below target and needs additional diagnostics.";
}

function textOrNull(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
