export type TureMarketRegimeLabel =
  | "risk_on"
  | "risk_off"
  | "trend_day_candidate"
  | "choppy"
  | "high_volatility"
  | "low_volatility"
  | "sector_rotation"
  | "news_driven"
  | "mixed"
  | "unknown";

export type TureMarketRegimeConfidence = "low" | "medium" | "high";

export type TureMarketRegimeEvidence = {
  negative_momentum_count?: number;
  positive_momentum_count?: number;
  choppy_structure_count?: number;
  strong_trend_count?: number;
  stale_data_count?: number;
  strong_candidate_count?: number;
  valid_candidate_count?: number;
  experimental_candidate_count?: number;
  no_trade_candidate_count?: number;
  sector_concentration?: Record<string, number>;
  volatility_signal?: string | null;
};

export type TureMarketRegimeSummary = {
  regime_label: TureMarketRegimeLabel;
  regime_confidence: TureMarketRegimeConfidence;
  sample_confidence: TureMarketRegimeConfidence;
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
  evidence: TureMarketRegimeEvidence;
  advisory_only: true;
};

export type MarketRegimeLabelInput = {
  explicit_regime?: string | null;
  text_signals?: Array<string | null | undefined>;
  sector_mix?: Record<string, number> | null;
  setup_family_mix?: Record<string, number> | null;
  ticker_profile_status_mix?: Record<string, number> | null;
  strong_candidate_count?: number | null;
  valid_candidate_count?: number | null;
  experimental_candidate_count?: number | null;
  no_trade_candidate_count?: number | null;
  stale_data_count?: number | null;
  positive_momentum_count?: number | null;
  negative_momentum_count?: number | null;
  choppy_structure_count?: number | null;
  strong_trend_count?: number | null;
  volatility_signal?: string | null;
  outcome_count?: number | null;
};

function compactNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function countTextMatches(signals: string[], terms: string[]) {
  return signals.filter((signal) => includesAny(signal, terms)).length;
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function normalizedRegime(value: string | null | undefined): TureMarketRegimeLabel | null {
  const text = normalizeText(value).replace(/[\s-]+/g, "_");

  if (
    text === "risk_on" ||
    text === "risk_off" ||
    text === "trend_day_candidate" ||
    text === "choppy" ||
    text === "high_volatility" ||
    text === "low_volatility" ||
    text === "sector_rotation" ||
    text === "news_driven" ||
    text === "mixed" ||
    text === "unknown"
  ) {
    return text;
  }

  if (text === "neutral") return "mixed";
  return null;
}

function sampleConfidence(outcomeCount: number): TureMarketRegimeConfidence {
  if (outcomeCount >= 100) return "high";
  if (outcomeCount >= 30) return "medium";
  return "low";
}

function sectorConcentration(sectorMix: Record<string, number> | null | undefined) {
  const entries = Object.entries(sectorMix ?? {}).filter(
    ([, value]) => typeof value === "number" && value > 0,
  );
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  if (total === 0) return null;

  const [sector, count] = entries.sort((first, second) => second[1] - first[1])[0] ?? [
    "unknown",
    0,
  ];

  return {
    sector,
    count,
    total,
    ratio: count / total,
  };
}

function confidenceFor(input: {
  reasonCount: number;
  metadataGapCount: number;
  explicitRegime: boolean;
  outcomeCount: number;
}): TureMarketRegimeConfidence {
  if (input.reasonCount === 0 || input.metadataGapCount >= 2) return "low";
  if (input.explicitRegime && input.reasonCount >= 2) return "high";
  if (input.reasonCount >= 3 && input.outcomeCount >= 30) return "high";
  if (input.reasonCount >= 2) return "medium";
  return "low";
}

export function buildMarketRegimeLabel(
  input: MarketRegimeLabelInput | null | undefined = {},
): TureMarketRegimeSummary {
  const safeInput = input ?? {};
  const signals = (safeInput.text_signals ?? [])
    .map(normalizeText)
    .filter((value) => value.length > 0);
  const joinedSignals = signals.join(" ");
  const explicitRegime = normalizedRegime(safeInput.explicit_regime);
  const outcomeCount = compactNumber(safeInput.outcome_count);
  const sector = sectorConcentration(safeInput.sector_mix);
  const negativeMomentumCount =
    compactNumber(safeInput.negative_momentum_count) +
    countTextMatches(signals, [
      "negative momentum",
      "momentum is weak",
      "weak momentum",
      "risk_off",
      "risk off",
      "bearish",
    ]);
  const positiveMomentumCount =
    compactNumber(safeInput.positive_momentum_count) +
    countTextMatches(signals, [
      "positive momentum",
      "momentum is supportive",
      "risk_on",
      "risk on",
      "supportive",
      "higher lows",
    ]);
  const choppyStructureCount =
    compactNumber(safeInput.choppy_structure_count) +
    countTextMatches(signals, ["choppy", "range", "sideways", "tight range"]);
  const strongTrendCount =
    compactNumber(safeInput.strong_trend_count) +
    countTextMatches(signals, [
      "strong trend",
      "trend day",
      "clean uptrend",
      "above ma20",
      "above ma50",
      "breakout",
    ]);
  const staleDataCount =
    compactNumber(safeInput.stale_data_count) +
    countTextMatches(signals, ["stale", "missing market regime", "unavailable"]);
  const strongCandidateCount = compactNumber(safeInput.strong_candidate_count);
  const validCandidateCount = compactNumber(safeInput.valid_candidate_count);
  const experimentalCandidateCount = compactNumber(
    safeInput.experimental_candidate_count,
  );
  const noTradeCandidateCount = compactNumber(safeInput.no_trade_candidate_count);
  const volatilitySignal = normalizeText(safeInput.volatility_signal) || null;
  const evidence: TureMarketRegimeEvidence = {
    negative_momentum_count: negativeMomentumCount,
    positive_momentum_count: positiveMomentumCount,
    choppy_structure_count: choppyStructureCount,
    strong_trend_count: strongTrendCount,
    stale_data_count: staleDataCount,
    strong_candidate_count: strongCandidateCount,
    valid_candidate_count: validCandidateCount,
    experimental_candidate_count: experimentalCandidateCount,
    no_trade_candidate_count: noTradeCandidateCount,
    sector_concentration: safeInput.sector_mix ?? undefined,
    volatility_signal: volatilitySignal,
  };
  const reasonCodes: string[] = [];
  const cautionFlags: string[] = [];
  const metadataGaps: string[] = [];

  if (explicitRegime) pushUnique(reasonCodes, `explicit_${explicitRegime}`);
  if (negativeMomentumCount > 0) pushUnique(reasonCodes, "negative_momentum");
  if (positiveMomentumCount > 0) pushUnique(reasonCodes, "positive_momentum");
  if (choppyStructureCount > 0) pushUnique(reasonCodes, "bearish_choppy_structure");
  if (strongTrendCount > 0) pushUnique(reasonCodes, "strong_trend_structure");
  if (strongCandidateCount > 0) pushUnique(reasonCodes, "has_strong_candidates");
  if (validCandidateCount > 0) pushUnique(reasonCodes, "has_valid_candidates");
  if (experimentalCandidateCount > strongCandidateCount + validCandidateCount) {
    pushUnique(reasonCodes, "experimental_heavy_candidate_mix");
  }
  if (sector && sector.ratio >= 0.6 && sector.total >= 3) {
    pushUnique(reasonCodes, "sector_concentration");
  }
  if (
    includesAny(joinedSignals, ["news", "catalyst", "earnings", "upgrade", "downgrade"])
  ) {
    pushUnique(reasonCodes, "news_or_catalyst_context");
  }
  if (volatilitySignal === "high" || includesAny(joinedSignals, ["high volatility"])) {
    pushUnique(reasonCodes, "high_volatility_signal");
  }
  if (volatilitySignal === "low" || includesAny(joinedSignals, ["low volatility"])) {
    pushUnique(reasonCodes, "low_volatility_signal");
  }

  if (negativeMomentumCount > 0 || explicitRegime === "risk_off") {
    pushUnique(cautionFlags, "long_setups_require_confirmation");
  }
  if (choppyStructureCount > 0) pushUnique(cautionFlags, "chop_risk");
  if (staleDataCount > 0) pushUnique(cautionFlags, "stale_market_context");
  if (experimentalCandidateCount > strongCandidateCount + validCandidateCount) {
    pushUnique(cautionFlags, "weak_candidate_mix");
  }

  if (signals.length === 0 && !explicitRegime) {
    pushUnique(metadataGaps, "missing_market_regime_text_signals");
  }
  if (!safeInput.sector_mix || Object.keys(safeInput.sector_mix).length === 0) {
    pushUnique(metadataGaps, "missing_sector_mix");
  }
  if (
    !safeInput.setup_family_mix ||
    Object.keys(safeInput.setup_family_mix).length === 0
  ) {
    pushUnique(metadataGaps, "missing_setup_mix");
  }
  if (reasonCodes.length === 0) {
    pushUnique(reasonCodes, "insufficient_market_regime_metadata");
  }

  let regimeLabel: TureMarketRegimeLabel = "unknown";

  if (explicitRegime && explicitRegime !== "mixed" && explicitRegime !== "unknown") {
    regimeLabel = explicitRegime;
  } else if (negativeMomentumCount > 0 && choppyStructureCount > 0) {
    regimeLabel = negativeMomentumCount >= choppyStructureCount ? "risk_off" : "choppy";
  } else if (negativeMomentumCount > 0) {
    regimeLabel = "risk_off";
  } else if (strongTrendCount > 0 && positiveMomentumCount > 0) {
    regimeLabel = strongCandidateCount > 0 ? "risk_on" : "trend_day_candidate";
  } else if (sector && sector.ratio >= 0.6 && sector.total >= 3) {
    regimeLabel = "sector_rotation";
  } else if (reasonCodes.includes("news_or_catalyst_context")) {
    regimeLabel = "news_driven";
  } else if (choppyStructureCount > 0 || reasonCodes.includes("experimental_heavy_candidate_mix")) {
    regimeLabel = "choppy";
  } else if (reasonCodes.includes("high_volatility_signal")) {
    regimeLabel = "high_volatility";
  } else if (reasonCodes.includes("low_volatility_signal")) {
    regimeLabel = "low_volatility";
  } else if (explicitRegime === "mixed" || reasonCodes.length > 1) {
    regimeLabel = "mixed";
  }

  return {
    regime_label: regimeLabel,
    regime_confidence: confidenceFor({
      reasonCount: reasonCodes.filter(
        (reason) => reason !== "insufficient_market_regime_metadata",
      ).length,
      metadataGapCount: metadataGaps.length,
      explicitRegime: explicitRegime !== null,
      outcomeCount,
    }),
    sample_confidence: sampleConfidence(outcomeCount),
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    metadata_gaps: metadataGaps,
    evidence,
    advisory_only: true,
  };
}
