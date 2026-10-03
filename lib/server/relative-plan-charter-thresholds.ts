import "server-only";
import { verifiedRelativePlanProspectiveFreeze } from "@/lib/server/relative-plan-prospective-comparison";
import type { summarizeRelativePlanCharterQuality } from "@/lib/server/relative-plan-charter-quality";
import type { summarizeRelativePlanCharterOperational } from "@/lib/server/relative-plan-charter-operational";

export const RELATIVE_PLAN_CHARTER_THRESHOLDS_VERSION = "relative_plan_charter_thresholds_v1" as const;

/** Absolute measurements are one indivisible frozen charter, not a precision
 * proxy. This summary does NOT verify enrollment, the materialized model or
 * mature windows, and therefore cannot itself make a terminal policy decision.
 * The integrated reader must independently verify those source contracts. */
export function summarizeRelativePlanCharterThresholds(input: {
  owner: string; freeze: unknown;
  quality: ReturnType<typeof summarizeRelativePlanCharterQuality>;
  operational: ReturnType<typeof summarizeRelativePlanCharterOperational>;
}) {
  const freeze = verifiedRelativePlanProspectiveFreeze(input.freeze, input.owner);
  if (!freeze) return null;
  const { quality: q, operational: op } = input;
  const { thresholds: t, concentration_limits: c } = freeze.plan.charter;
  const gaps = new Set<string>(), failures = new Set<string>();
  const checks: Array<{ dimension: string; value: number | null; limit: number; direction: "minimum" | "maximum";
    status: "unavailable" | "pass" | "fail" }> = [];
  const check = (dimension: string, value: number | null | undefined, limit: number, direction: "minimum" | "maximum", unit = true) => {
    const known = typeof value === "number" && Number.isFinite(value) && (!unit || value >= 0 && value <= 1);
    const status = !known ? "unavailable" : (direction === "minimum" ? value >= limit : value <= limit) ? "pass" : "fail";
    if (status === "unavailable") gaps.add(`${dimension}_evidence_unavailable`);
    if (status === "fail") failures.add(`${dimension}_charter_limit_not_met`);
    checks.push({ dimension, value: known ? value : null, limit, direction, status });
  };
  check("challenger_precision_at_3", q.challenger.precision_at_3?.value, t.minimum_precision_at_k, "minimum");
  check("challenger_expectancy_r", q.challenger.expectancy_r, t.minimum_expectancy_r, "minimum", false);
  check("challenger_calibration_error", q.calibration?.challenger?.expected_calibration_error, t.maximum_calibration_error, "maximum");
  check("outcome_coverage", q.outcome_coverage?.value, t.minimum_outcome_coverage, "minimum");
  check("evidence_missingness", q.evidence_missingness?.value, t.maximum_missingness, "maximum");
  check("runtime_reliability", op.reliability?.value?.value, t.minimum_reliability, "minimum");
  const cost = op.cost?.credits_per_decision;
  check("provider_credits_per_decision", typeof cost === "number" && cost >= 0 ? cost : null,
    t.maximum_provider_credits_per_decision, "maximum", false);
  for (const [dimension, limit] of [["ticker", c.maximum_single_ticker_share], ["sector", c.maximum_single_sector_share],
    ["setup", c.maximum_single_setup_share], ["regime", c.maximum_single_regime_share]] as const) {
    check(`${dimension}_concentration`, q.context.concentration[dimension].maximum_single_share?.value, limit, "maximum");
  }
  if (!q.context.same_original_population) gaps.add("same_original_population_required");
  if (!q.context.feasibility.complete) gaps.add("required_disclosed_feasibility_incomplete");
  // Nonbinary outcomes are explicitly not losses, but cannot excuse an
  // under-sampled score bucket from predicting an original forward identity.
  if (!q.calibration || q.calibration.original_probability_coverage !== 1 || q.calibration.binary_probability_coverage !== 1 ||
    !q.calibration.baseline || !q.calibration.challenger ||
    ![q.calibration.baseline.brier_score, q.calibration.challenger.brier_score].every(value =>
      Number.isFinite(value) && value >= 0 && value <= 1)) {
    gaps.add("complete_original_probability_error_required");
  }
  for (const gap of op.blockers) gaps.add(gap);
  return {
    contract_version: RELATIVE_PLAN_CHARTER_THRESHOLDS_VERSION,
    charter_fingerprint: freeze.plan.charter_fingerprint, checks,
    evidence_complete: gaps.size === 0, absolute_limits_passed: gaps.size === 0 && failures.size === 0,
    missing_dimensions: [...gaps].sort(), measured_limit_failures: [...failures].sort(),
    terminal_quality_decision: null, quality_improvement_claimed: false, authority: freeze.plan.authority,
  };
}
