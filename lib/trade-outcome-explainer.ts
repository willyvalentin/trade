import type { BrokerExecutionMetadata } from "@/lib/broker-execution-metadata";
import type { ExecutionQualityMetrics } from "@/lib/execution-quality";
import type { ExecutionImprovementSuggestion } from "@/lib/execution-improvement-suggestions";
import type { HandoffQualityResult } from "@/lib/handoff-quality";
import { getSetupTypeLabel, normalizeSetupType } from "@/lib/setup-types";

export type TradeOutcomeClassification =
  | "strong_win"
  | "small_win"
  | "breakeven"
  | "small_loss"
  | "hard_loss"
  | "unknown";

export type TradeOutcomePrimaryDriver =
  | "setup_quality"
  | "execution_quality"
  | "risk_management"
  | "market_follow_through"
  | "handoff_quality"
  | "costs"
  | "eod_discipline"
  | "unknown";

export type TradeOutcomeDriverImpact =
  | "positive"
  | "neutral"
  | "negative"
  | "unknown";

export type TradeOutcomeDriver = {
  code: string;
  label: string;
  impact: TradeOutcomeDriverImpact;
  description: string;
};

export type TradeOutcomeExplanation = {
  classification: TradeOutcomeClassification;
  primary_driver: TradeOutcomePrimaryDriver;
  summary: string;
  simple_explanation: string;
  drivers: TradeOutcomeDriver[];
  what_to_watch_next_time: string[];
  confidence: "high" | "medium" | "low";
  generated_at: string;
};

export type ExplainTradeOutcomeInput = {
  setup_type?: unknown;
  confidence_score?: number | null;
  pnl?: number | null;
  r_multiple?: number | null;
  entry_price?: number | null;
  stop_loss?: number | null;
  target_price?: number | null;
  exit_price?: number | null;
  closed_at?: string | null;
  execution_metadata?: BrokerExecutionMetadata | null;
  execution_quality_metrics?: ExecutionQualityMetrics | null;
  handoff_quality?: HandoffQualityResult | null;
  improvement_suggestions?: ExecutionImprovementSuggestion[] | null;
  eod_status?: string | null;
  final_rule_action?: string | null;
  generatedAt?: string;
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function driver(
  code: string,
  label: string,
  impact: TradeOutcomeDriverImpact,
  description: string,
): TradeOutcomeDriver {
  return { code, label, impact, description };
}

function classifyOutcome(
  rMultiple: number | null,
  pnl: number | null,
): { classification: TradeOutcomeClassification; confidence: "high" | "medium" | "low" } {
  if (rMultiple !== null) {
    if (rMultiple >= 1) return { classification: "strong_win", confidence: "high" };
    if (rMultiple >= 0.1) return { classification: "small_win", confidence: "high" };
    if (rMultiple > -0.1) return { classification: "breakeven", confidence: "high" };
    if (rMultiple > -1) return { classification: "small_loss", confidence: "high" };
    return { classification: "hard_loss", confidence: "high" };
  }

  if (pnl !== null) {
    if (pnl > 1) return { classification: "small_win", confidence: "medium" };
    if (pnl < -1) return { classification: "small_loss", confidence: "medium" };
    return { classification: "breakeven", confidence: "medium" };
  }

  return { classification: "unknown", confidence: "low" };
}

function classificationLabel(value: TradeOutcomeClassification) {
  if (value === "strong_win") return "strong win";
  if (value === "small_win") return "small win";
  if (value === "breakeven") return "breakeven trade";
  if (value === "small_loss") return "small loss";
  if (value === "hard_loss") return "hard loss";
  return "unknown outcome";
}

function primaryDriverLabel(value: TradeOutcomePrimaryDriver) {
  if (value === "setup_quality") return "setup quality";
  if (value === "execution_quality") return "execution quality";
  if (value === "risk_management") return "risk outcome";
  if (value === "market_follow_through") return "market follow-through";
  if (value === "handoff_quality") return "handoff quality";
  if (value === "costs") return "costs";
  if (value === "eod_discipline") return "end-of-day discipline";
  return "unknown";
}

function pickPrimaryDriver(
  classification: TradeOutcomeClassification,
  drivers: TradeOutcomeDriver[],
): TradeOutcomePrimaryDriver {
  const has = (code: string, impact?: TradeOutcomeDriverImpact) =>
    drivers.some(
      (item) => item.code === code && (!impact || item.impact === impact),
    );

  if (classification === "hard_loss" || classification === "small_loss") {
    if (has("risk_reached", "negative")) return "risk_management";
    if (has("poor_execution", "negative") || has("worse_slippage", "negative")) {
      return "execution_quality";
    }
    if (has("eod_risk", "negative")) return "eod_discipline";
    if (has("limited_follow_through", "negative")) return "market_follow_through";
    if (has("low_confidence_loss", "negative") || has("high_confidence_loss", "negative")) {
      return "setup_quality";
    }
  }

  if (classification === "strong_win" || classification === "small_win") {
    if (has("target_or_strong_r", "positive")) return "market_follow_through";
    if (has("good_execution", "positive")) return "execution_quality";
    if (has("good_handoff", "positive")) return "handoff_quality";
    if (has("positive_setup_context", "positive")) return "setup_quality";
  }

  if (classification === "breakeven") {
    if (has("risk_contained", "positive")) return "risk_management";
    if (has("limited_follow_through", "neutral")) return "market_follow_through";
    if (has("cost_drag", "negative")) return "costs";
  }

  return "unknown";
}

function addUnique(items: string[], value: string) {
  if (!items.includes(value)) {
    items.push(value);
  }
}

function buildSimpleExplanation(
  classification: TradeOutcomeClassification,
  primaryDriver: TradeOutcomePrimaryDriver,
  confidence: "high" | "medium" | "low",
) {
  const outcome = classificationLabel(classification);
  const driverLabel = primaryDriverLabel(primaryDriver);
  const confidenceCopy =
    confidence === "high"
      ? "based on the saved R multiple"
      : confidence === "medium"
        ? "based on PnL because R data is limited"
        : "with limited saved outcome data";

  if (classification === "unknown") {
    return "There is not enough saved outcome data to explain this trade confidently yet.";
  }

  if (primaryDriver === "unknown") {
    return `This trade was a ${outcome}. Based on available data, the main driver is not clear enough to name confidently.`;
  }

  return `This trade was a ${outcome}. The main reason appears to be ${driverLabel}, ${confidenceCopy}.`;
}

export function explainTradeOutcome({
  setup_type,
  confidence_score,
  pnl,
  r_multiple,
  entry_price,
  stop_loss,
  target_price,
  exit_price,
  closed_at,
  execution_metadata,
  execution_quality_metrics,
  handoff_quality,
  improvement_suggestions = [],
  eod_status,
  final_rule_action,
  generatedAt = new Date().toISOString(),
}: ExplainTradeOutcomeInput): TradeOutcomeExplanation {
  const pnlValue = finiteNumber(pnl);
  const rValue = finiteNumber(r_multiple);
  const entry = finiteNumber(entry_price);
  const stop = finiteNumber(stop_loss);
  const target = finiteNumber(target_price);
  const exit = finiteNumber(exit_price);
  const confidenceScore = finiteNumber(confidence_score);
  const setupType = normalizeSetupType(setup_type);
  const classificationResult = classifyOutcome(rValue, pnlValue);
  const drivers: TradeOutcomeDriver[] = [];
  const watch: string[] = [];
  const netR = execution_metadata?.broker_cost_estimate?.estimated_net_r ?? null;
  const grossR = execution_metadata?.broker_cost_estimate?.estimated_gross_r ?? null;
  const quality = execution_quality_metrics?.quality_rating ?? "unknown";

  if (quality === "excellent" || quality === "good") {
    drivers.push(
      driver(
        "good_execution",
        "Execution quality",
        "positive",
        "The actual fill appears close to or better than the planned entry.",
      ),
    );
  } else if (quality === "poor") {
    drivers.push(
      driver(
        "poor_execution",
        "Execution quality",
        "negative",
        "Execution quality was poor, so the broker fill may have made the trade harder to manage.",
      ),
    );
    addUnique(watch, "Avoid entries that are materially worse than the planned entry.");
  }

  if (
    execution_quality_metrics?.slippage_bps !== null &&
    execution_quality_metrics?.slippage_bps !== undefined &&
    execution_quality_metrics.slippage_bps > 15
  ) {
    drivers.push(
      driver(
        "worse_slippage",
        "Entry slippage",
        "negative",
        `The actual fill was about ${execution_quality_metrics.slippage_bps.toFixed(0)} bps worse than planned.`,
      ),
    );
    addUnique(watch, "Re-check limit price discipline before confirming in Avanza.");
  }

  if (execution_quality_metrics?.is_partial_fill) {
    drivers.push(
      driver(
        "partial_fill",
        "Partial fill",
        "neutral",
        "The trade used only the filled shares, so the actual position differed from the plan.",
      ),
    );
    addUnique(watch, "Confirm share quantity matches the plan before creating the live trade.");
  }

  if (handoff_quality?.rating === "excellent" || handoff_quality?.rating === "good") {
    drivers.push(
      driver(
        "good_handoff",
        "Handoff quality",
        "positive",
        "The broker handoff was well documented and internally consistent.",
      ),
    );
  } else if (handoff_quality?.rating === "poor") {
    drivers.push(
      driver(
        "poor_handoff",
        "Handoff quality",
        "negative",
        "The handoff quality was poor, which can increase the chance of execution mistakes.",
      ),
    );
    addUnique(watch, "Prioritize clean handoff sessions with passed dry run and integrity check.");
  } else if (!execution_metadata) {
    drivers.push(
      driver(
        "handoff_unknown",
        "Handoff data",
        "unknown",
        "No broker execution metadata was available for this older trade.",
      ),
    );
  }

  if (rValue !== null && rValue >= 1) {
    drivers.push(
      driver(
        "target_or_strong_r",
        "Market follow-through",
        "positive",
        "Price moved far enough in your favor to produce at least a 1R result.",
      ),
    );
  } else if (rValue !== null && rValue <= -1) {
    drivers.push(
      driver(
        "risk_reached",
        "Risk outcome",
        "negative",
        "The trade reached or exceeded the planned 1R risk area.",
      ),
    );
    addUnique(watch, "Confirm the setup is still valid before entering near the planned risk area.");
  } else if (rValue !== null && Math.abs(rValue) < 0.1) {
    drivers.push(
      driver(
        "risk_contained",
        "Risk control",
        "positive",
        "The trade finished close to breakeven, so risk appears contained.",
      ),
    );
  }

  if (rValue !== null && rValue > -0.1 && rValue < 1) {
    drivers.push(
      driver(
        "limited_follow_through",
        "Market follow-through",
        rValue >= 0.1 ? "neutral" : "negative",
        "The setup did not produce enough follow-through for a large R result.",
      ),
    );
    addUnique(watch, "Check that price is still following through after entry.");
  }

  if (grossR !== null && netR !== null && grossR - netR >= 0.15) {
    drivers.push(
      driver(
        "cost_drag",
        "Estimated costs",
        "negative",
        "Estimated broker costs materially reduced the net R estimate.",
      ),
    );
    addUnique(watch, "Check net R after estimated costs before taking lower-R setups.");
  } else if (execution_metadata?.broker_cost_estimate?.enabled) {
    drivers.push(
      driver(
        "costs_available",
        "Estimated costs",
        "neutral",
        "Broker cost estimates were available for review.",
      ),
    );
  }

  if (eod_status === "overnight_risk" || /overnight|after close/i.test(final_rule_action ?? "")) {
    drivers.push(
      driver(
        "eod_risk",
        "End-of-day discipline",
        "negative",
        "The trade appears to have carried end-of-day or overnight risk.",
      ),
    );
    addUnique(watch, "Avoid holding day trades into the market close.");
  } else if (closed_at) {
    drivers.push(
      driver(
        "closed_recorded",
        "Close recorded",
        "neutral",
        "The trade has a saved close timestamp for review.",
      ),
    );
  }

  if (confidenceScore !== null && confidenceScore >= 80 && rValue !== null && rValue <= -1) {
    drivers.push(
      driver(
        "high_confidence_loss",
        "Setup quality",
        "negative",
        "A high-confidence setup still produced a hard loss, so the setup may not have followed through.",
      ),
    );
    addUnique(watch, "Be cautious with this setup type until more positive outcomes appear.");
  } else if (
    (confidenceScore === null || confidenceScore < 70) &&
    rValue !== null &&
    rValue < -0.1
  ) {
    drivers.push(
      driver(
        "low_confidence_loss",
        "Setup quality",
        "negative",
        "The setup had lower or missing confidence and then lost money.",
      ),
    );
    addUnique(watch, "Require stronger confirmation before taking lower-confidence setups.");
  } else if (rValue !== null && rValue > 0 && confidenceScore !== null && confidenceScore >= 70) {
    drivers.push(
      driver(
        "positive_setup_context",
        "Setup quality",
        "positive",
        `${getSetupTypeLabel(setupType)} had enough confidence and produced a positive result.`,
      ),
    );
  }

  if (entry !== null && stop !== null && stop >= entry) {
    drivers.push(
      driver(
        "invalid_stop_context",
        "Risk data",
        "unknown",
        "Saved stop data does not look valid for a long trade.",
      ),
    );
    addUnique(watch, "Verify stop placement before creating future live trades.");
  }

  if (
    target !== null &&
    exit !== null &&
    entry !== null &&
    Math.abs(exit - target) / Math.max(Math.abs(target), 1) <= 0.01
  ) {
    drivers.push(
      driver(
        "exit_near_target",
        "Target area",
        "positive",
        "The exit was close to the saved target area.",
      ),
    );
  }

  for (const suggestion of improvement_suggestions ?? []) {
    if (suggestion.priority === "high") {
      addUnique(watch, suggestion.suggested_action);
    }
  }

  if (watch.length === 0) {
    addUnique(watch, "Keep following normal validation, risk controls, and manual broker confirmation.");
  }

  const primaryDriver = pickPrimaryDriver(
    classificationResult.classification,
    drivers,
  );
  const summary =
    classificationResult.classification === "unknown"
      ? "Outcome explanation unavailable."
      : `${classificationLabel(classificationResult.classification)} · ${primaryDriverLabel(primaryDriver)}`;

  return {
    classification: classificationResult.classification,
    primary_driver: primaryDriver,
    summary,
    simple_explanation: buildSimpleExplanation(
      classificationResult.classification,
      primaryDriver,
      classificationResult.confidence,
    ),
    drivers: drivers.slice(0, 6),
    what_to_watch_next_time: watch.slice(0, 4),
    confidence: classificationResult.confidence,
    generated_at: generatedAt,
  };
}
