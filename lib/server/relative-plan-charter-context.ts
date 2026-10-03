import "server-only";
import { RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION } from "@/lib/recommendation-decision-feature-vector";
import type { RelativePlanCharterObservations } from "@/lib/server/relative-plan-charter-observations";

export const RELATIVE_PLAN_CHARTER_CONTEXT_VERSION = "relative_plan_charter_context_v1" as const;

/** Descriptive Wilson intervals use the same fixed 95% convention as the
 * existing charter evaluator. They do not prove independent market samples,
 * replace day-clustered paired ranking uncertainty, or grant a pass. */
export function relativePlanCharterProportion(numerator: number, denominator: number) {
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) ||
    denominator <= 0 || numerator < 0 || numerator > denominator) return null;
  const value = numerator / denominator, z = 1.959963984540054, squared = z * z;
  const adjusted = 1 + squared / denominator;
  const center = (value + squared / (2 * denominator)) / adjusted;
  const margin = z * Math.sqrt((value * (1 - value) + squared / (4 * denominator)) / denominator) / adjusted;
  return { value, numerator, denominator, lower: Math.max(0, center - margin), upper: Math.min(1, center + margin),
    confidence_level: 0.95, method: "wilson_score" };
}

/** Coverage and concentration share the complete original population. Unknown
 * categories cannot be silently removed from the denominator, treated as a
 * measured category, or replaced with current/majority context. */
export function buildRelativePlanCharterContext(observations: RelativePlanCharterObservations[]) {
  const rows = observations.flatMap(observation => observation.rows);
  const expected = observations.reduce((sum, observation) => sum + observation.expected_original_population_count, 0);
  const uniqueScans = new Set(observations.map(observation => observation.scan_run_fingerprint));
  const uniqueRows = new Set(observations.flatMap(observation => observation.rows.map(row =>
    `${observation.scan_run_fingerprint}:${row.candidate_id}`)));
  const samePopulation = expected > 0 && expected === rows.length && uniqueScans.size === observations.length && uniqueRows.size === expected;
  const valid = (value: number | null) => value !== null && Number.isFinite(value) && value >= 0;
  const coverage = (count: number) => ({ observed_count: count, expected_count: expected,
    missing_count: samePopulation ? expected - count : null, coverage: samePopulation ? relativePlanCharterProportion(count, expected) : null,
    complete: samePopulation && count === expected });
  const liquidity = coverage(rows.filter(row => Object.values(row.liquidity).every(valid)).length);
  const volatility = coverage(rows.filter(row => Object.values(row.volatility).every(valid)).length);
  const trigger = coverage(rows.filter(row => typeof row.trigger_attainment === "boolean").length);
  const versions = [...new Set(rows.map(row => row.decision_feature_vector_version))];
  const vectorSupported = samePopulation && versions.length === 1 && versions[0] === RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION;
  const concentration = Object.fromEntries((["ticker", "sector", "setup", "regime"] as const).map(dimension => {
    const values = rows.map(row => row[dimension]);
    const known = values.filter((value): value is string => typeof value === "string" && value.length > 0);
    const frequencies = new Map<string, number>();
    for (const value of known) frequencies.set(value, (frequencies.get(value) ?? 0) + 1);
    const groups = [...frequencies].sort(([left], [right]) => left.localeCompare(right)).map(([value, count]) =>
      ({ value, count, share: samePopulation ? relativePlanCharterProportion(count, expected) : null }));
    const largest = [...groups].sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))[0] ?? null;
    const complete = samePopulation && known.length === expected;
    return [dimension, { expected_count: expected, observed_count: known.length, missing_count: samePopulation ? expected - known.length : null,
      groups, complete, maximum_single_share: complete ? largest?.share ?? null : null }];
  }));
  const disclosed = rows.every(row => Object.values(row.unavailable_disclosed).every(value => value === true));
  return {
    contract_version: RELATIVE_PLAN_CHARTER_CONTEXT_VERSION,
    status: samePopulation ? "summarized" : "conflicting",
    same_original_population: samePopulation, original_population_count: expected, retained_row_count: rows.length,
    feasibility: { decision_feature_vector_version: vectorSupported ? versions[0] : null,
      supported_original_vector: vectorSupported, liquidity, volatility, trigger_attainment: trigger,
      unavailable_disclosed: { spread: "unavailable_disclosed", halt_risk: "unavailable_disclosed", conservative_slippage: "unavailable_disclosed" },
      complete: vectorSupported && liquidity.complete && volatility.complete && trigger.complete && disclosed },
    concentration, terminal_quality_decision: null, quality_improvement_claimed: false,
  };
}
