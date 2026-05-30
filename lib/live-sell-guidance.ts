export type LiveSellAction =
  | "hold"
  | "watch"
  | "take_profit"
  | "close_position"
  | "review_required";

export type LiveSellUrgency = "low" | "medium" | "high" | "critical";

export type LiveSellTrigger =
  | "target_reached"
  | "stop_reached"
  | "stop_breached"
  | "strong_profit"
  | "profit_fading"
  | "eod_risk"
  | "stale_price"
  | "missing_current_price"
  | "missing_entry"
  | "missing_stop"
  | "missing_target"
  | "missing_position_size"
  | "position_losing"
  | "no_action_needed"
  | "demo_take_profit";

export type LiveSellGuidanceConfidence = "high" | "medium" | "low" | "unknown";

export type LiveSellGuidanceInput = {
  position_id?: string | null;
  ticker?: string | null;
  direction?: "Long" | "Short" | string | null;
  current_price?: number | null;
  entry_price?: number | null;
  stop_price?: number | null;
  target_price?: number | null;
  position_size?: number | null;
  opened_at?: string | null;
  last_updated_at?: string | null;
  is_market_open?: boolean;
  eod_safety_status?: {
    status?: string | null;
    severity?: string | null;
    message?: string | null;
  } | null;
  rule_action?: string | null;
  previous_best_price?: number | null;
  is_demo?: boolean;
  now?: Date | string | null;
};

export type LiveSellGuidance = {
  action: LiveSellAction;
  urgency: LiveSellUrgency;
  primary_label: string;
  primary_message: string;
  next_step: string;
  trigger: LiveSellTrigger;
  trigger_price: number | null;
  distance_to_target: number | null;
  distance_to_stop: number | null;
  unrealized_pnl: number | null;
  unrealized_pnl_percent: number | null;
  current_r: number | null;
  best_price: number | null;
  best_r: number | null;
  profit_fade_from_best: number | null;
  profit_fade_percent: number | null;
  is_profit_fading: boolean;
  why_now: string;
  protective_action_reason: string | null;
  confidence: LiveSellGuidanceConfidence;
  blockers: string[];
  warnings: string[];
  should_show_close_cta: boolean;
  should_prepare_sell_handoff: boolean;
  evaluated_at: string;
};

const stalePriceMinutes = 15;
const veryStalePriceMinutes = 30;
const closeToTargetDistancePercent = 0.35;
const closeToTargetRewardRemainingPercent = 20;

// V2 R-tier thresholds are intentionally simple and deterministic:
// <= -1R means stop/risk failure, 0R is breakeven, >= 1R deserves active watch,
// >= 1.5R or near-target deserves take-profit review, and >= 1.8R is strong profit.
const activeProfitR = 1;
const takeProfitReviewR = 1.5;
const strongProfitR = 1.8;
const materialFadeR = 0.5;
const severeFadeR = 1;
const materialFadePercent = 35;
const nearBreakevenR = 0.25;

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isoNow(now: LiveSellGuidanceInput["now"]) {
  if (now instanceof Date && !Number.isNaN(now.getTime())) {
    return now.toISOString();
  }

  if (typeof now === "string") {
    const parsed = new Date(now);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date().toISOString();
}

function minutesSince(value: string | null | undefined, nowIso: string) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  const now = new Date(nowIso).getTime();

  if (Number.isNaN(timestamp) || Number.isNaN(now)) {
    return null;
  }

  return (now - timestamp) / (60 * 1000);
}

function buildResult(
  base: Omit<
    LiveSellGuidance,
    | "primary_label"
    | "best_price"
    | "best_r"
    | "profit_fade_from_best"
    | "profit_fade_percent"
    | "is_profit_fading"
    | "why_now"
    | "protective_action_reason"
    | "should_show_close_cta"
    | "should_prepare_sell_handoff"
  > &
    Partial<
      Pick<
        LiveSellGuidance,
        | "best_price"
        | "best_r"
        | "profit_fade_from_best"
        | "profit_fade_percent"
        | "is_profit_fading"
        | "why_now"
        | "protective_action_reason"
      >
    >,
): LiveSellGuidance {
  const labels: Record<LiveSellAction, string> = {
    hold: "HOLD",
    watch: "WATCH",
    take_profit: "TAKE PROFIT",
    close_position: "CLOSE POSITION",
    review_required: "REVIEW REQUIRED",
  };
  const shouldPrepareSellHandoff =
    base.action === "take_profit" || base.action === "close_position";

  return {
    ...base,
    primary_label: labels[base.action],
    best_price: base.best_price ?? null,
    best_r: base.best_r ?? null,
    profit_fade_from_best: base.profit_fade_from_best ?? null,
    profit_fade_percent: base.profit_fade_percent ?? null,
    is_profit_fading: base.is_profit_fading ?? false,
    why_now: base.why_now ?? base.primary_message,
    protective_action_reason: base.protective_action_reason ?? null,
    should_show_close_cta:
      shouldPrepareSellHandoff || base.action === "review_required",
    should_prepare_sell_handoff: shouldPrepareSellHandoff,
  };
}

export function buildLiveSellGuidance(
  input: LiveSellGuidanceInput,
): LiveSellGuidance {
  const evaluatedAt = isoNow(input.now);
  const direction = input.direction === "Short" ? "Short" : "Long";
  const currentPrice = finiteNumber(input.current_price);
  const entryPrice = finiteNumber(input.entry_price);
  const stopPrice = finiteNumber(input.stop_price);
  const targetPrice = finiteNumber(input.target_price);
  const positionSize = finiteNumber(input.position_size);
  const blockers: string[] = [];
  const warnings: string[] = [];
  const eodStatus = input.eod_safety_status?.status ?? "ok";
  const eodSeverity = input.eod_safety_status?.severity ?? "none";
  const ageMinutes = minutesSince(input.last_updated_at, evaluatedAt);
  const isPriceStale =
    input.is_market_open === true &&
    (ageMinutes === null || ageMinutes > stalePriceMinutes);
  const isPriceVeryStale =
    input.is_market_open === true &&
    (ageMinutes === null || ageMinutes > veryStalePriceMinutes);
  const distanceToTarget =
    currentPrice !== null && targetPrice !== null
      ? direction === "Long"
        ? targetPrice - currentPrice
        : currentPrice - targetPrice
      : null;
  const distanceToStop =
    currentPrice !== null && stopPrice !== null
      ? direction === "Long"
        ? currentPrice - stopPrice
        : stopPrice - currentPrice
      : null;
  const unrealizedPnl =
    currentPrice !== null && entryPrice !== null && positionSize !== null
      ? direction === "Long"
        ? (currentPrice - entryPrice) * positionSize
        : (entryPrice - currentPrice) * positionSize
      : null;
  const unrealizedPnlPercent =
    currentPrice !== null && entryPrice !== null && entryPrice !== 0
      ? direction === "Long"
        ? ((currentPrice - entryPrice) / entryPrice) * 100
        : ((entryPrice - currentPrice) / entryPrice) * 100
      : null;
  const riskPerShare =
    entryPrice !== null && stopPrice !== null
      ? direction === "Long"
        ? entryPrice - stopPrice
        : stopPrice - entryPrice
      : null;
  const currentR =
    currentPrice !== null &&
    entryPrice !== null &&
    riskPerShare !== null &&
    riskPerShare > 0
      ? direction === "Long"
        ? (currentPrice - entryPrice) / riskPerShare
        : (entryPrice - currentPrice) / riskPerShare
      : null;
  const previousBestPrice = finiteNumber(input.previous_best_price);
  const hasReliableBestPrice =
    previousBestPrice !== null && currentPrice !== null && entryPrice !== null;
  const bestPrice = previousBestPrice ?? currentPrice;
  const bestR =
    bestPrice !== null &&
    entryPrice !== null &&
    riskPerShare !== null &&
    riskPerShare > 0
      ? direction === "Long"
        ? (bestPrice - entryPrice) / riskPerShare
        : (entryPrice - bestPrice) / riskPerShare
      : currentR;
  const profitFadeFromBest =
    hasReliableBestPrice &&
    bestR !== null &&
    currentR !== null &&
    bestR > currentR
      ? bestR - currentR
      : null;
  const profitFadePercent =
    profitFadeFromBest !== null && bestR !== null && bestR > 0
      ? (profitFadeFromBest / bestR) * 100
      : null;
  const isProfitFading =
    hasReliableBestPrice &&
    bestR !== null &&
    currentR !== null &&
    currentR > 0 &&
    bestR >= activeProfitR &&
    profitFadeFromBest !== null &&
    (profitFadeFromBest >= materialFadeR ||
      (profitFadePercent !== null && profitFadePercent >= materialFadePercent));
  const plannedRewardPerShare =
    entryPrice !== null && targetPrice !== null
      ? direction === "Long"
        ? targetPrice - entryPrice
        : entryPrice - targetPrice
      : null;
  const remainingRewardPercent =
    distanceToTarget !== null &&
    plannedRewardPerShare !== null &&
    plannedRewardPerShare > 0
      ? (distanceToTarget / plannedRewardPerShare) * 100
      : null;
  const isNearTarget =
    distanceToTarget !== null &&
    distanceToTarget > 0 &&
    ((remainingRewardPercent !== null &&
      remainingRewardPercent <= closeToTargetRewardRemainingPercent) ||
      (currentPrice !== null &&
        targetPrice !== null &&
        targetPrice !== 0 &&
        Math.abs(distanceToTarget / targetPrice) * 100 <=
          closeToTargetDistancePercent));
  const v2Context = {
    best_price: bestPrice,
    best_r: bestR,
    profit_fade_from_best: profitFadeFromBest,
    profit_fade_percent: profitFadePercent,
    is_profit_fading: isProfitFading,
  };

  if (currentPrice === null) blockers.push("Missing current price.");
  if (entryPrice === null) blockers.push("Missing entry price.");
  if (stopPrice === null) blockers.push("Missing stop price.");
  if (targetPrice === null) blockers.push("Missing target price.");
  if (positionSize === null || positionSize <= 0) {
    blockers.push("Missing or invalid position size.");
  }

  if (direction === "Short") {
    warnings.push("Short support is defensive and should be reviewed manually.");
  }

  if (input.is_demo) {
    warnings.push("DEMO ONLY - no broker order is submitted.");
  }

  if (isPriceVeryStale) {
    warnings.push("Position price is very stale. Refresh before acting.");
  } else if (isPriceStale) {
    warnings.push("Position price is stale. Refresh before acting.");
  }

  if (!hasReliableBestPrice && currentR !== null && currentR >= activeProfitR) {
    warnings.push(
      "High-water mark is unavailable; profit-fade detection is disabled.",
    );
  }

  if (blockers.length > 0) {
    const trigger: LiveSellTrigger =
      currentPrice === null
        ? "missing_current_price"
        : entryPrice === null
          ? "missing_entry"
          : stopPrice === null
            ? "missing_stop"
            : targetPrice === null
              ? "missing_target"
              : "missing_position_size";

    return buildResult({
      action: "review_required",
      urgency: "high",
      primary_message: "Required live trade data is missing.",
      next_step: "Review trade data before taking action.",
      trigger,
      trigger_price: null,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "unknown",
      blockers,
      warnings,
      evaluated_at: evaluatedAt,
      why_now:
        "A required price, risk, target, or position-size field is missing.",
      protective_action_reason:
        "Ture cannot evaluate exit guidance safely without complete live trade data.",
      ...v2Context,
    });
  }

  if (eodStatus === "overnight_risk") {
    const profitable = currentR !== null && currentR > 0;
    return buildResult({
      action: profitable ? "take_profit" : "close_position",
      urgency: "critical",
      primary_message: profitable
        ? "Profitable day trade has overnight risk."
        : "Day trade remains open after market close.",
      next_step:
        "Prepare sell order and manually confirm in Avanza if you decide to exit.",
      trigger: "eod_risk",
      trigger_price: currentPrice,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "high",
      blockers,
      warnings: [
        ...warnings,
        input.eod_safety_status?.message ?? "End-of-day overnight risk is active.",
      ],
      evaluated_at: evaluatedAt,
      why_now: profitable
        ? "End-of-day risk is active while the position still has open profit."
        : "End-of-day risk is active and the position should be reviewed immediately.",
      protective_action_reason:
        "Day-trade recordkeeping should happen only after any manual broker exit confirmation.",
      ...v2Context,
    });
  }

  if (eodStatus === "review_required" || eodSeverity === "critical") {
    const profitable = currentR !== null && currentR >= activeProfitR;
    const losing = currentR !== null && currentR < 0;
    return buildResult({
      action: profitable ? "take_profit" : "review_required",
      urgency: "high",
      primary_message: profitable
        ? "End-of-day risk is active with meaningful open profit."
        : "End-of-day review is required for this day trade.",
      next_step:
        profitable
          ? "Review whether to lock gains before the session ends."
          : losing
            ? "Review the losing position before carrying risk."
            : "Review the position and prepare a sell order if you decide to exit.",
      trigger: "eod_risk",
      trigger_price: currentPrice,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "high",
      blockers,
      warnings: [
        ...warnings,
        input.eod_safety_status?.message ?? "End-of-day review is active.",
      ],
      evaluated_at: evaluatedAt,
      why_now: profitable
        ? "The position is profitable and EOD safety requires manual review."
        : "Session timing has introduced EOD risk that overrides normal hold guidance.",
      protective_action_reason:
        "EOD review is advisory; Ture will not submit or close broker orders.",
      ...v2Context,
    });
  }

  if (isPriceVeryStale) {
    return buildResult({
      action: "review_required",
      urgency: "high",
      primary_message: "Live price is very stale during market hours.",
      next_step: "Refresh live trade data before making an exit decision.",
      trigger: "stale_price",
      trigger_price: currentPrice,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "low",
      blockers,
      warnings,
      evaluated_at: evaluatedAt,
      why_now:
        "The last live update is too old to trust for a sell decision during market hours.",
      protective_action_reason:
        "Refresh live data before preparing any sell handoff.",
      ...v2Context,
    });
  }

  if (
    (distanceToStop !== null && distanceToStop <= 0) ||
    (currentR !== null && currentR <= -1)
  ) {
    return buildResult({
      action: "close_position",
      urgency: "critical",
      primary_message: "Latest price is at or beyond the stop area.",
      next_step:
        "Prepare sell order and manually confirm in Avanza if you decide to exit.",
      trigger:
        (distanceToStop !== null && distanceToStop < 0) ||
        (currentR !== null && currentR < -1)
          ? "stop_breached"
          : "stop_reached",
      trigger_price: stopPrice,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "high",
      blockers,
      warnings,
      evaluated_at: evaluatedAt,
      why_now:
        "Price has reached the planned stop area or the trade is at approximately -1R.",
      protective_action_reason:
        "Stop discipline is active; prepare a sell order only if you decide to exit manually.",
      ...v2Context,
    });
  }

  if (input.is_demo && input.rule_action === "TAKE_PROFIT") {
    return buildResult({
      action: "take_profit",
      urgency: "high",
      primary_message: "DEMO ONLY: simulated target area reached.",
      next_step: "Open Close Trade and prefill the demo sell exit.",
      trigger: "demo_take_profit",
      trigger_price: targetPrice,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "high",
      blockers,
      warnings,
      evaluated_at: evaluatedAt,
      why_now: "Demo trade is intentionally staged near take-profit for E2E QA.",
      protective_action_reason:
        "Demo guidance only fills local test state and cannot contact Avanza.",
      ...v2Context,
    });
  }

  if (distanceToTarget !== null && distanceToTarget <= 0) {
    return buildResult({
      action: "take_profit",
      urgency: "high",
      primary_message: "Target area has been reached.",
      next_step: "Prepare sell order or review whether to lock gains.",
      trigger: "target_reached",
      trigger_price: targetPrice,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "high",
      blockers,
      warnings,
      evaluated_at: evaluatedAt,
      why_now:
        "Current price has reached or passed the planned target reference.",
      protective_action_reason:
        "Target reached; user must decide whether to manually confirm any broker sell.",
      ...v2Context,
    });
  }

  if (isProfitFading) {
    const severeFade =
      (profitFadeFromBest !== null && profitFadeFromBest >= severeFadeR) ||
      (bestR !== null &&
        bestR >= takeProfitReviewR &&
        currentR !== null &&
        currentR <= nearBreakevenR);

    return buildResult({
      action: severeFade ? "take_profit" : "watch",
      urgency: severeFade ? "high" : "medium",
      primary_message: severeFade
        ? "Strong open profit is fading toward breakeven."
        : "Open profit is fading from the best known level.",
      next_step: severeFade
        ? "Review whether to protect remaining gains and prepare sell handoff if exiting."
        : "Watch closely and decide whether the trade still deserves risk.",
      trigger: "profit_fading",
      trigger_price: currentPrice,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "medium",
      blockers,
      warnings: [
        ...warnings,
        `Best known R ${bestR?.toFixed(2) ?? "—"} has faded to ${
          currentR?.toFixed(2) ?? "—"
        }R.`,
      ],
      evaluated_at: evaluatedAt,
      why_now:
        "The trade was meaningfully profitable and has pulled back materially from the best known price.",
      protective_action_reason: severeFade
        ? "Remaining profit is compressing; consider protecting gains before the trade returns to breakeven."
        : "Profit fade is active but not yet severe.",
      ...v2Context,
    });
  }

  if (
    (currentR !== null && currentR >= takeProfitReviewR) ||
    isNearTarget
  ) {
    const shouldTakeProfit =
      (currentR !== null && currentR >= strongProfitR) || isNearTarget;
    return buildResult({
      action: shouldTakeProfit ? "take_profit" : "watch",
      urgency: shouldTakeProfit ? "high" : "medium",
      primary_message:
        shouldTakeProfit
          ? "Trade has strong open profit before target."
          : "Trade is close to target or has strong open profit.",
      next_step:
        shouldTakeProfit
          ? "Review whether to lock gains and prepare sell handoff if exiting."
          : "Watch closely and be ready to prepare sell handoff.",
      trigger: "strong_profit",
      trigger_price: currentPrice,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "medium",
      blockers,
      warnings,
      evaluated_at: evaluatedAt,
      why_now: shouldTakeProfit
        ? "Current R or target proximity has moved into the take-profit review zone."
        : "The position has reached at least 1.5R or is approaching target.",
      protective_action_reason:
        "Open profit is meaningful; prepare sell handoff only after deciding manually.",
      ...v2Context,
    });
  }

  if (isPriceStale) {
    return buildResult({
      action: "review_required",
      urgency: "medium",
      primary_message: "Live price is stale.",
      next_step: "Refresh live trade data before making an exit decision.",
      trigger: "stale_price",
      trigger_price: currentPrice,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "low",
      blockers,
      warnings,
      evaluated_at: evaluatedAt,
      why_now:
        "The live price is stale enough that current guidance should be reviewed before action.",
      protective_action_reason:
        "Refresh live data before preparing any sell order.",
      ...v2Context,
    });
  }

  if (currentR !== null && currentR < 0) {
    return buildResult({
      action: "watch",
      urgency: "medium",
      primary_message: "Position is losing but has not hit the stop.",
      next_step: "Watch stop discipline and avoid adjusting risk without review.",
      trigger: "position_losing",
      trigger_price: currentPrice,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "medium",
      blockers,
      warnings,
      evaluated_at: evaluatedAt,
      why_now:
        "The trade is below entry but has not reached the planned stop area.",
      protective_action_reason:
        "Avoid moving stop or adding risk without manual review.",
      ...v2Context,
    });
  }

  if (currentR !== null && currentR >= activeProfitR) {
    return buildResult({
      action: "watch",
      urgency: "medium",
      primary_message: "Position has meaningful open profit.",
      next_step: "Watch for target approach, profit fade, or EOD risk.",
      trigger: "strong_profit",
      trigger_price: currentPrice,
      distance_to_target: distanceToTarget,
      distance_to_stop: distanceToStop,
      unrealized_pnl: unrealizedPnl,
      unrealized_pnl_percent: unrealizedPnlPercent,
      current_r: currentR,
      confidence: "medium",
      blockers,
      warnings,
      evaluated_at: evaluatedAt,
      why_now:
        "Current R is at or above 1.0, so the trade has moved from passive hold into active monitoring.",
      protective_action_reason:
        "Open profit is present but target/fade/stop triggers are not yet decisive.",
      ...v2Context,
    });
  }

  return buildResult({
    action: "hold",
    urgency: "low",
    primary_message:
      "Position has not hit stop, target, or active risk trigger.",
    next_step: "Keep monitoring the live trade.",
    trigger: "no_action_needed",
    trigger_price: currentPrice,
    distance_to_target: distanceToTarget,
    distance_to_stop: distanceToStop,
    unrealized_pnl: unrealizedPnl,
    unrealized_pnl_percent: unrealizedPnlPercent,
    current_r: currentR,
    confidence: "medium",
    blockers,
    warnings,
    evaluated_at: evaluatedAt,
    why_now:
      currentR !== null && Math.abs(currentR) <= nearBreakevenR
        ? "The trade is near breakeven with no active stop, target, fade, stale-price, or EOD trigger."
        : "No stop, target, fade, stale-price, or EOD trigger is active.",
    protective_action_reason: null,
    ...v2Context,
  });
}
