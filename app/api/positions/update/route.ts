import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  getOrRefreshIntradayIndicators,
  MAX_FRESH_INDICATOR_FETCHES_PER_RUN,
  POSITION_UPDATE_INDICATOR_MAX_AGE_MINUTES,
} from "@/lib/intraday-indicator-cache";
import type { IntradayIndicators } from "@/lib/intraday-indicators";
import { getQuote } from "@/lib/market-data";
import { supabase } from "@/lib/supabase";

type PositionRow = {
  id: string;
  ticker: string;
  recommendation_id?: string | null;
  recommendations?: {
    setup_type?: string | null;
    invalidation?: string | null;
  } | null;
  direction?: string | null;
  entry_price: number | string | null;
  current_stop: number | string | null;
  target_1: number | string | null;
  target_2: number | string | null;
};

type PositionAction =
  | "CLOSE_POSITION"
  | "TAKE_PROFIT"
  | "TAKE_PARTIAL_PROFIT"
  | "MOVE_STOP_TO_BREAKEVEN"
  | "HOLD";

type PositionUpdateResult = {
  position_id: string;
  ticker: string;
  action: PositionAction;
  recommendation: string;
  explanation: string;
  new_stop: number | null;
  current_price: number;
  unrealized_percent: number;
  risk_per_share: number;
  unrealized_r_multiple: number;
  reason: string;
  warnings: string[];
  intraday_indicators: IntradayIndicators | null;
};

type AiPositionCommentary = {
  commentary: string;
  next_trigger: string;
  risk_note: string;
};

type PositionCommentaryInput = {
  ticker: string;
  entry_price: number;
  current_price: number;
  current_stop: number;
  target_1: number | null;
  target_2: number | null;
  unrealized_percent: number;
  unrealized_r_multiple: number;
  rule_based_action: PositionAction;
  rule_based_recommendation: string;
  rule_based_warnings: string[];
};

const positionCommentarySchema = {
  type: "object",
  additionalProperties: false,
  required: ["commentary", "next_trigger", "risk_note"],
  properties: {
    commentary: { type: "string" },
    next_trigger: { type: "string" },
    risk_note: { type: "string" },
  },
};

function numberValue(value: number | string | null, fieldName: string) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} is missing or invalid.`);
  }

  return parsed;
}

function optionalNumberValue(value: number | string | null) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : null;
}

function isShortPosition(position: PositionRow) {
  return position.direction?.toLowerCase() === "short";
}

function hasHitStop(position: PositionRow, currentPrice: number, currentStop: number) {
  if (isShortPosition(position)) {
    return currentPrice >= currentStop;
  }

  return currentPrice <= currentStop;
}

function hasHitTarget(
  position: PositionRow,
  currentPrice: number,
  targetPrice: number,
) {
  if (isShortPosition(position)) {
    return currentPrice <= targetPrice;
  }

  return currentPrice >= targetPrice;
}

function actionPriority(action: PositionAction) {
  if (action === "CLOSE_POSITION") return 1;
  if (action === "TAKE_PROFIT") return 2;
  if (action === "TAKE_PARTIAL_PROFIT") return 3;
  if (action === "MOVE_STOP_TO_BREAKEVEN") return 4;
  return 5;
}

function getNewYorkTimeInMinutes() {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
    timeZone: "America/New_York",
  }).formatToParts(new Date());
  const valueByType = new Map(parts.map((part) => [part.type, part.value]));

  return (
    Number(valueByType.get("hour") ?? "0") * 60 +
    Number(valueByType.get("minute") ?? "0")
  );
}

function getIntradayInvalidationLevel(position: PositionRow) {
  const invalidation = position.recommendations?.invalidation;

  if (!invalidation) {
    return null;
  }

  const match = invalidation.match(
    /(?:below|under|breaks below|breaches|above|over|breaks above)\s+\$?(\d+(?:\.\d+)?)/i,
  );

  return match ? Number(match[1]) : null;
}

function getAction(
  position: PositionRow,
  currentPrice: number,
  currentStop: number,
  entryPrice: number,
  riskPerShare: number,
  target1: number | null,
  target2: number | null,
  unrealizedRMultiple: number,
  intradayIndicators: IntradayIndicators | null,
): Pick<PositionUpdateResult, "action" | "recommendation" | "reason" | "warnings"> {
  const isShort = isShortPosition(position);
  const stopIsBreakevenOrBetter = isShort
    ? currentStop <= entryPrice
    : currentStop >= entryPrice;
  const warnings: string[] = [];
  const candidates: Pick<
    PositionUpdateResult,
    "action" | "recommendation" | "reason"
  >[] = [];
  const targetPrice = target2 ?? target1;
  const targetR =
    targetPrice === null || riskPerShare <= 0
      ? 2
      : Math.max(1, (isShort ? entryPrice - targetPrice : targetPrice - entryPrice) / riskPerShare);
  const nyMinutes = getNewYorkTimeInMinutes();

  function add(action: PositionAction, reason: string) {
    candidates.push({
      action,
      recommendation: reason,
      reason,
    });
  }

  if (hasHitStop(position, currentPrice, currentStop) || unrealizedRMultiple <= -1) {
    add("CLOSE_POSITION", "Stop loss area reached or breached.");
  }

  const invalidationLevel = getIntradayInvalidationLevel(position);

  if (
    invalidationLevel !== null &&
    (isShort ? currentPrice >= invalidationLevel : currentPrice <= invalidationLevel)
  ) {
    add("CLOSE_POSITION", "Intraday invalidation level breached.");
  }

  if (nyMinutes >= 16 * 60) {
    add("CLOSE_POSITION", "Market is closed. Review this day trade immediately.");
  } else if (nyMinutes >= 15 * 60 + 45) {
    add(
      "CLOSE_POSITION",
      "Final minutes of session. Day trades should usually be closed or actively managed.",
    );
  } else if (nyMinutes >= 15 * 60 + 30) {
    warnings.push("Market close approaching. Prepare exit plan.");
  }

  if (
    !isShort &&
    intradayIndicators?.isAboveVwap === false &&
    intradayIndicators.momentumDirection === "down"
  ) {
    warnings.push("Price is below VWAP and momentum is weakening.");
  }

  if (
    (targetPrice !== null && hasHitTarget(position, currentPrice, targetPrice)) ||
    unrealizedRMultiple >= targetR
  ) {
    add("TAKE_PROFIT", "Target area reached.");
  }

  if (
    (target2 !== null &&
      target1 !== null &&
      hasHitTarget(position, currentPrice, target1)) ||
    unrealizedRMultiple >= 1.5
  ) {
    add("TAKE_PARTIAL_PROFIT", "Trade reached +1.5R. Consider taking partial profit.");
  }

  if (unrealizedRMultiple >= 1 && !stopIsBreakevenOrBetter) {
    add(
      "MOVE_STOP_TO_BREAKEVEN",
      "Trade reached +1R. Consider protecting downside.",
    );
  }

  // TODO: Add VWAP/momentum-loss rule when intraday indicator data is available.

  const selected = candidates.sort(
    (first, second) => actionPriority(first.action) - actionPriority(second.action),
  )[0] ?? {
    action: "HOLD" as const,
    recommendation:
      "No action needed. Position has not hit stop, target, or active risk trigger.",
    reason:
      "No action needed. Position has not hit stop, target, or active risk trigger.",
  };

  return {
    ...selected,
    warnings,
  };
}

function textValue(value: unknown, fieldName: string) {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${fieldName} cannot be empty.`);
  }

  return trimmed;
}

function parsePositionCommentary(outputText: string): AiPositionCommentary {
  try {
    const parsed = JSON.parse(outputText) as {
      commentary?: unknown;
      next_trigger?: unknown;
      risk_note?: unknown;
    };

    return {
      commentary: textValue(parsed.commentary, "commentary"),
      next_trigger: textValue(parsed.next_trigger, "next_trigger"),
      risk_note: textValue(parsed.risk_note, "risk_note"),
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Unknown JSON parsing error.";

    throw new Error(`OpenAI returned invalid commentary JSON: ${message}`);
  }
}

function formatAiExplanation(commentary: AiPositionCommentary) {
  return [
    `Commentary: ${commentary.commentary}`,
    `Next trigger: ${commentary.next_trigger}`,
    `Risk note: ${commentary.risk_note}`,
  ].join("\n\n");
}

function appendWarningsToExplanation(explanation: string, warnings: string[]) {
  if (warnings.length === 0) {
    return explanation;
  }

  return `${explanation}\n\nWarnings: ${warnings.join(" ")}`;
}

async function generatePositionCommentary(
  input: PositionCommentaryInput,
): Promise<AiPositionCommentary> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to .env.local.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    instructions: [
      "You are a private trading co-pilot.",
      "You do not place trades.",
      "You are not allowed to change the rule-based action.",
      "The rule engine action is final. Do not override it. Explain it clearly and conservatively.",
      "You must explain the action clearly.",
      "Be concise and practical.",
      "Do not invent prices.",
      "Do not suggest increasing position size.",
      "Do not recommend revenge trading.",
      "Do not mention that you are an AI.",
      "Return JSON only.",
    ].join("\n"),
    input: JSON.stringify(input),
    text: {
      format: {
        type: "json_schema",
        name: "position_update_commentary",
        strict: true,
        schema: positionCommentarySchema,
      },
    },
    temperature: 0.2,
    max_output_tokens: 500,
    store: false,
  });

  if (!response.output_text) {
    throw new Error("OpenAI returned an empty commentary response.");
  }

  return parsePositionCommentary(response.output_text);
}

async function monitorPosition(
  position: PositionRow,
  options: { allowFreshIndicatorFetch: boolean },
): Promise<PositionUpdateResult & { indicator_source?: string }> {
  const entryPrice = numberValue(position.entry_price, "Entry price");
  const currentStop = numberValue(position.current_stop, "Current stop");
  const target1 = optionalNumberValue(position.target_1);
  const target2 = optionalNumberValue(position.target_2);
  const quote = await getQuote(position.ticker);
  const indicatorResult = await getOrRefreshIntradayIndicators(position.ticker, {
    source: "position_update",
    maxAgeMinutes: POSITION_UPDATE_INDICATOR_MAX_AGE_MINUTES,
    allowFreshFetch: options.allowFreshIndicatorFetch,
  });
  const intradayIndicators = indicatorResult.indicators;
  const currentPrice = quote.current_price;
  const isShort = isShortPosition(position);
  const riskPerShare = isShort ? currentStop - entryPrice : entryPrice - currentStop;
  const unrealizedDollars = isShort
    ? entryPrice - currentPrice
    : currentPrice - entryPrice;
  const unrealizedPercent = (unrealizedDollars / entryPrice) * 100;
  const unrealizedRMultiple =
    riskPerShare > 0 ? unrealizedDollars / riskPerShare : 0;
  const { action, recommendation, reason, warnings } = getAction(
    position,
    currentPrice,
    currentStop,
    entryPrice,
    riskPerShare,
    target1,
    target2,
    unrealizedRMultiple,
    intradayIndicators,
  );
  const indicatorWarnings = [
    ...warnings,
    ...(indicatorResult.source === "unavailable"
      ? ["Intraday confirmation unavailable for this position update."]
      : []),
    ...(indicatorResult.stale && indicatorResult.indicators
      ? ["Intraday confirmation is using stale cached data."]
      : []),
  ];
  const newStop = action === "MOVE_STOP_TO_BREAKEVEN" ? entryPrice : null;
  const fallbackExplanation = [
    `${position.ticker} is trading at ${currentPrice}.`,
    `Entry is ${entryPrice}, current stop is ${currentStop}, target 1 is ${target1 ?? "not set"}, and target 2 is ${target2 ?? "not set"}.`,
    `Unrealized result is ${unrealizedPercent.toFixed(2)}% and ${unrealizedRMultiple.toFixed(2)}R.`,
  ].join(" ");
  let explanation = fallbackExplanation;

  try {
    const commentary = await generatePositionCommentary({
      ticker: position.ticker,
      entry_price: entryPrice,
      current_price: currentPrice,
      current_stop: currentStop,
      target_1: target1,
      target_2: target2,
      unrealized_percent: Number(unrealizedPercent.toFixed(2)),
      unrealized_r_multiple: Number(unrealizedRMultiple.toFixed(2)),
      rule_based_action: action,
      rule_based_recommendation: recommendation,
      rule_based_warnings: indicatorWarnings,
    });

    explanation = formatAiExplanation(commentary);
  } catch (error) {
    console.error("OpenAI position commentary failed", {
      position_id: position.id,
      ticker: position.ticker,
      error: error instanceof Error ? error.message : error,
    });
  }

  explanation = appendWarningsToExplanation(explanation, indicatorWarnings);

  console.log("[positions/update] rule_result", {
    position_id: position.id,
    ticker: position.ticker,
    action,
    current_r: Number(unrealizedRMultiple.toFixed(2)),
    reason,
    warnings: indicatorWarnings,
    current_price: currentPrice,
    indicator_source: indicatorResult.source,
    indicator_cached_at: indicatorResult.cached_at,
    indicator_stale: indicatorResult.stale,
    intraday_indicators: intradayIndicators
      ? {
          vwap: intradayIndicators.vwap,
          priceVsVwapPercent: intradayIndicators.priceVsVwapPercent,
          momentumDirection: intradayIndicators.momentumDirection,
          momentumPercent: intradayIndicators.momentumPercent,
          volumeTrend: intradayIndicators.volumeTrend,
          recentHigh: intradayIndicators.recentHigh,
          recentLow: intradayIndicators.recentLow,
        }
      : null,
    timestamp: new Date().toISOString(),
  });

  const { error: insertError } = await supabase.from("position_updates").insert({
    position_id: position.id,
    action,
    recommendation,
    explanation,
    new_stop: newStop,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  if (action === "MOVE_STOP_TO_BREAKEVEN") {
    const { error: updateError } = await supabase
      .from("positions")
      .update({ current_stop: entryPrice })
      .eq("id", position.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  return {
    position_id: position.id,
    ticker: position.ticker,
    action,
    recommendation,
    explanation,
    new_stop: newStop,
    current_price: currentPrice,
    unrealized_percent: unrealizedPercent,
    risk_per_share: riskPerShare,
    unrealized_r_multiple: unrealizedRMultiple,
    reason,
    warnings: indicatorWarnings,
    intraday_indicators: intradayIndicators,
    indicator_source: indicatorResult.source,
  };
}

export async function POST() {
  try {
    const { data, error } = await supabase
      .from("positions")
      .select("*, recommendations(setup_type,invalidation)")
      .eq("status", "open");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const positions = (data || []) as PositionRow[];
    const updates = [];
    const errors = [];
    let freshIndicatorFetchesUsed = 0;

    for (const position of positions) {
      try {
        const update = await monitorPosition(position, {
          allowFreshIndicatorFetch:
            freshIndicatorFetchesUsed < MAX_FRESH_INDICATOR_FETCHES_PER_RUN,
        });
        if (update.indicator_source === "fresh") {
          freshIndicatorFetchesUsed += 1;
        }
        updates.push(update);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        errors.push({
          position_id: position.id,
          ticker: position.ticker,
          error: message,
        });
      }
    }

    return NextResponse.json({
      updates,
      errors,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
