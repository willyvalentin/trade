import { calculateTradePlanRiskReward } from "@/lib/trade-plan-quality";

type DisplayPlan = {
  direction?: string;
  entryZone: string;
  stopLoss: string;
  target1: string;
  target2?: string;
};

function displayPrice(value: string | undefined): number | null {
  const text = value?.trim();
  // Accept only the app's plain USD price notation, never partial numbers,
  // locale-ambiguous grouping, free text or inferred missing values.
  if (!text || text.length > 100 || !/^\$?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(text)) {
    return null;
  }
  const price = Number(text.replace(/[$,]/g, ""));
  return Number.isFinite(price) && price > 0 ? price : null;
}

export const PLAN_RISK_REWARD_DISPLAY_NOTE =
  "R/R is calculated from displayed prices at the worst entry in the range, before fees and slippage. It describes the plan, not an achieved return or success probability.";

/** Read-only presentation geometry. Never replaces stored or decision-time R/R. */
export function buildPlanRiskRewardDisplay(plan: DisplayPlan) {
  const direction = plan.direction?.trim().toLowerCase();
  const side = direction === "long" || direction === "short" ? direction : null;
  const zone = plan.entryZone.length <= 205
    ? plan.entryZone.split(/\s*[-–—]\s*/)
    : [];
  const low = displayPrice(zone[0]);
  const high = zone.length === 1 ? low : displayPrice(zone[1]);
  const stop = displayPrice(plan.stopLoss);
  const validZone = zone.length >= 1 && zone.length <= 2 &&
    low !== null && high !== null && low <= high;
  const validStop = validZone && stop !== null && side !== null &&
    (side === "long" ? stop < low : stop > high);
  const entry = validStop ? (side === "long" ? high : low) : null;

  function targetRatio(value: string | undefined) {
    const target = displayPrice(value);
    if (entry === null || side === null || target === null ||
        (side === "long" ? target <= entry : target >= entry)) return "Not available";
    const result = calculateTradePlanRiskReward({
      entryPrice: entry, stopPrice: stop, targetPrice: target, side,
    });
    return result.risk_reward_ratio !== null && result.risk_reward_ratio > 0
      ? `≈${result.risk_reward_ratio.toFixed(2)}`
      : "Not available";
  }

  return {
    target1: targetRatio(plan.target1),
    target2: targetRatio(plan.target2),
    basis: entry === null ? "Not available" : "Worst entry; before costs",
  };
}
