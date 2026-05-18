import OpenAI from "openai";
import { NextResponse } from "next/server";

import { getQuote } from "@/lib/market-data";
import { supabase } from "@/lib/supabase";

type PositionRow = {
  id: string;
  ticker: string;
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
  target_1: number;
  target_2: number;
  unrealized_percent: number;
  unrealized_r_multiple: number;
  rule_based_action: PositionAction;
  rule_based_recommendation: string;
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

function getAction(
  position: PositionRow,
  currentPrice: number,
  currentStop: number,
  target1: number,
  target2: number,
  unrealizedRMultiple: number,
): Pick<PositionUpdateResult, "action" | "recommendation"> {
  if (hasHitStop(position, currentPrice, currentStop)) {
    return {
      action: "CLOSE_POSITION",
      recommendation: "Price has hit or fallen below the current stop.",
    };
  }

  if (hasHitTarget(position, currentPrice, target2)) {
    return {
      action: "TAKE_PROFIT",
      recommendation:
        "Price has reached target 2. Consider closing the remaining position.",
    };
  }

  if (hasHitTarget(position, currentPrice, target1)) {
    return {
      action: "TAKE_PARTIAL_PROFIT",
      recommendation: "Price has reached target 1. Consider taking partial profit.",
    };
  }

  if (unrealizedRMultiple >= 1) {
    return {
      action: "MOVE_STOP_TO_BREAKEVEN",
      recommendation:
        "Position is up at least 1R. Consider moving stop to breakeven.",
    };
  }

  return {
    action: "HOLD",
    recommendation:
      "No action needed. Position has not hit stop, target, or 1R trigger.",
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

async function monitorPosition(position: PositionRow): Promise<PositionUpdateResult> {
  const entryPrice = numberValue(position.entry_price, "Entry price");
  const currentStop = numberValue(position.current_stop, "Current stop");
  const target1 = numberValue(position.target_1, "Target 1");
  const target2 = numberValue(position.target_2, "Target 2");
  const quote = await getQuote(position.ticker);
  const currentPrice = quote.current_price;
  const isShort = isShortPosition(position);
  const riskPerShare = isShort ? currentStop - entryPrice : entryPrice - currentStop;
  const unrealizedDollars = isShort
    ? entryPrice - currentPrice
    : currentPrice - entryPrice;
  const unrealizedPercent = (unrealizedDollars / entryPrice) * 100;
  const unrealizedRMultiple =
    riskPerShare > 0 ? unrealizedDollars / riskPerShare : 0;
  const { action, recommendation } = getAction(
    position,
    currentPrice,
    currentStop,
    target1,
    target2,
    unrealizedRMultiple,
  );
  const newStop = action === "MOVE_STOP_TO_BREAKEVEN" ? entryPrice : null;
  const fallbackExplanation = [
    `${position.ticker} is trading at ${currentPrice}.`,
    `Entry is ${entryPrice}, current stop is ${currentStop}, target 1 is ${target1}, and target 2 is ${target2}.`,
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
    });

    explanation = formatAiExplanation(commentary);
  } catch (error) {
    console.error("OpenAI position commentary failed", {
      position_id: position.id,
      ticker: position.ticker,
      error: error instanceof Error ? error.message : error,
    });
  }

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
  };
}

export async function POST() {
  try {
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("status", "open");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const positions = (data || []) as PositionRow[];
    const updates = [];
    const errors = [];

    for (const position of positions) {
      try {
        const update = await monitorPosition(position);
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
