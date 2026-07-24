import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";

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

function completenessRank(outcome: RecommendationOutcome) {
  const completeness = outcome.data_completeness;
  if (completeness === "complete") return 3;
  if (completeness === "partial") return 2;
  if (completeness === "none") return 1;
  return 0;
}

function statusRank(outcome: RecommendationOutcome) {
  if (
    outcome.status === "target_hit" ||
    outcome.status === "stop_hit" ||
    outcome.status === "target_before_stop" ||
    outcome.status === "stop_before_target" ||
    outcome.status === "neither_hit" ||
    outcome.status === "entry_not_triggered" ||
    outcome.status === "entry_triggered"
  ) {
    return 3;
  }

  if (outcome.status === "incomplete" || outcome.status === "unknown") return 1;
  if (outcome.status === "pending" || outcome.status === "invalid") return 0;
  return 2;
}

function isMarketReferenceImmediateOutcome(outcome: RecommendationOutcome) {
  return (
    outcome.payload_json.entry_type === "market_reference" &&
    outcome.payload_json.entry_trigger_semantics === "immediate_reference"
  );
}

function hasOfficialTriggerSemanticsUpgrade(
  nextOutcome: RecommendationOutcome,
  existingOutcome: RecommendationOutcome | undefined,
) {
  if (!existingOutcome) return false;
  if (!isMarketReferenceImmediateOutcome(nextOutcome)) return false;

  return (
    nextOutcome.payload_json.official_trigger_semantics_used ===
      "immediate_reference" &&
    (existingOutcome.payload_json.official_trigger_semantics_used !==
      "immediate_reference" ||
      (existingOutcome.entry_triggered === false &&
        nextOutcome.entry_triggered === true))
  );
}

function candleCount(outcome: RecommendationOutcome) {
  const count = finiteNumber(outcome.payload_json.candle_count);
  return count === null ? 0 : count;
}

function hasRetainedCounterfactualCandles(outcome: RecommendationOutcome) {
  return (
    outcome.payload_json.retained_candles_available === true ||
    outcome.payload_json.counterfactual_ready === true ||
    (Array.isArray(outcome.payload_json.counterfactual_candles) &&
      outcome.payload_json.counterfactual_candles.length > 0)
  );
}

export function hasBetterOutcomeCoverage(
  nextOutcome: RecommendationOutcome,
  existingOutcome: RecommendationOutcome | undefined,
) {
  if (!existingOutcome) return true;
  if (hasOfficialTriggerSemanticsUpgrade(nextOutcome, existingOutcome)) {
    return true;
  }

  const nextScore =
    completenessRank(nextOutcome) * 100 +
    statusRank(nextOutcome) * 10 +
    candleCount(nextOutcome);
  const existingScore =
    completenessRank(existingOutcome) * 100 +
    statusRank(existingOutcome) * 10 +
    candleCount(existingOutcome);

  if (nextScore > existingScore) return true;

  return (
    nextScore === existingScore &&
    nextOutcome.status === existingOutcome.status &&
    !hasRetainedCounterfactualCandles(existingOutcome) &&
    hasRetainedCounterfactualCandles(nextOutcome)
  );
}
