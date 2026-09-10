export type ManualPositionPlanInput = {
  stopLoss: unknown;
  target1: unknown;
  target2: unknown;
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
