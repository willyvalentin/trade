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
  const explanation = [
    `${position.ticker} is trading at ${currentPrice}.`,
    `Entry is ${entryPrice}, current stop is ${currentStop}, target 1 is ${target1}, and target 2 is ${target2}.`,
    `Unrealized result is ${unrealizedPercent.toFixed(2)}% and ${unrealizedRMultiple.toFixed(2)}R.`,
  ].join(" ");

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
