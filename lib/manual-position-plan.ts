export type ManualPositionPlanInput = {
  stopLoss: unknown;
  target1: unknown;
  target2: unknown;
};

export type CoherentLongManualPositionPlanInput = ManualPositionPlanInput & {
  entryPrice: unknown;
};

const positiveDecimalPattern = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

function isPositiveDecimal(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }

  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim();
  if (!positiveDecimalPattern.test(normalized)) {
    return false;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0;
}

/**
 * Mirrors the plan fields accepted by the owner-bound position writer.
 * A recommendation without all three values is informative only: it cannot
 * become a durable manual position until a fresh complete plan exists.
 */
export function hasRecordableManualPositionPlan(
  plan: ManualPositionPlanInput,
) {
  return (
    isPositiveDecimal(plan.stopLoss) &&
    isPositiveDecimal(plan.target1) &&
    isPositiveDecimal(plan.target2)
  );
}

/**
 * The current recommendation generator is long-only. A complete long plan
 * must therefore place its stop below the actual fill and its two distinct
 * targets above that fill in ascending order.
 */
export function hasCoherentLongManualPositionPlan(
  plan: CoherentLongManualPositionPlanInput,
) {
  if (!hasRecordableManualPositionPlan(plan) || !isPositiveDecimal(plan.entryPrice)) {
    return false;
  }

  const entryPrice = Number(plan.entryPrice);
  const stopLoss = Number(plan.stopLoss);
  const target1 = Number(plan.target1);
  const target2 = Number(plan.target2);

  return stopLoss < entryPrice && entryPrice < target1 && target1 < target2;
}
