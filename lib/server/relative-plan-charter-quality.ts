import "server-only";
import { createHash } from "node:crypto";
import { canonicalQualityPublishabilityPolicy } from "@/lib/canonical-quality-metrics";
import { getNyMarketTime } from "@/lib/market-session";
import { buildRelativePlanCharterContext, relativePlanCharterProportion } from "@/lib/server/relative-plan-charter-context";
import type { RelativePlanCharterObservations } from "@/lib/server/relative-plan-charter-observations";
import type { buildRelativePlanProbabilityMeasurement } from "@/lib/server/relative-plan-probability-measurement";

export const RELATIVE_PLAN_CHARTER_QUALITY_VERSION = "relative_plan_charter_quality_v1" as const;
type Observation = RelativePlanCharterObservations;
type Probability = ReturnType<typeof buildRelativePlanProbabilityMeasurement>;

function clusteredDelta(observations: Observation[], seed: string) {
  const byDay = new Map<string, Observation[]>();
  for (const observation of [...observations].sort((a, b) => (a.decision_at ?? "").localeCompare(b.decision_at ?? "") ||
    a.scan_run_fingerprint.localeCompare(b.scan_run_fingerprint))) {
    const day = getNyMarketTime(observation.decision_at!).ny_date;
    byDay.set(day, [...(byDay.get(day) ?? []), observation]);
  }
  if (byDay.size < canonicalQualityPublishabilityPolicy.minimum_trading_days) return null;
  const clusters = [...byDay].sort(([left], [right]) => left.localeCompare(right)).map(([, values]) => values);
  let state = createHash("sha256").update(seed).digest().readUInt32BE(0) || 1;
  const random = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 0x1_0000_0000; };
  const values = [];
  for (let iteration = 0; iteration < canonicalQualityPublishabilityPolicy.bootstrap_iterations; iteration++) {
    let baselineWins = 0, challengerWins = 0, denominator = 0;
    for (let index = 0; index < clusters.length; index++) for (const row of clusters[Math.floor(random() * clusters.length)]) {
      baselineWins += row.comparison.baseline.precision_at_3.numerator!;
      challengerWins += row.comparison.challenger.precision_at_3.numerator!;
      denominator += row.comparison.baseline.expected_count;
    }
    if (denominator <= 0) return null;
    values.push((challengerWins - baselineWins) / denominator);
  }
  values.sort((a, b) => a - b);
  return { lower: values[Math.floor((values.length - 1) * 0.025)], upper: values[Math.ceil((values.length - 1) * 0.975)],
    method: "seeded_trading_day_cluster_bootstrap_v1", confidence_level: 0.95, bootstrap_seed: seed,
    bootstrap_iterations: canonicalQualityPublishabilityPolicy.bootstrap_iterations, trading_day_count: clusters.length };
}

/** Same-original-population quality measurements only. The integrated consumer
 * must independently verify the frozen model and runtime/cost evidence before
 * any indivisible full-charter decision. This does not authorize a policy and
 * cannot declare alpha from a synthetic or historical population. */
export function summarizeRelativePlanCharterQuality(input: {
  observations: Observation[]; probability: Probability | null; bootstrapSeed: string;
}) {
  const context = buildRelativePlanCharterContext(input.observations);
  const rows = input.observations.flatMap(observation => observation.rows);
  const days = new Set(input.observations.filter(row => row.decision_at).map(row => getNyMarketTime(row.decision_at!).ny_date));
  const tickers = new Set(rows.map(row => row.ticker));
  const allOutcomes = context.same_original_population && input.observations.every(observation =>
    observation.comparison.status === "linked_complete" && observation.rows.every(row => row.outcome_status === "resolved" &&
      typeof row.positive_outcome === "boolean" && row.r_result !== null && Number.isFinite(row.r_result)));
  const arm = (name: "baseline" | "challenger") => {
    const expected = input.observations.reduce((sum, row) => sum + row.comparison[name].expected_count, 0);
    const resolved = input.observations.reduce((sum, row) => sum + row.comparison[name].resolved_count, 0);
    const complete = allOutcomes && expected === 3 * input.observations.length && resolved === expected;
    const wins = input.observations.reduce((sum, row) => sum + (row.comparison[name].precision_at_3.numerator ?? 0), 0);
    const sumR = input.observations.reduce((sum, row) => sum + row.comparison[name].expectancy_r.numerator, 0);
    return { expected_top_k_count: expected, resolved_top_k_count: resolved, missing_top_k_count: expected - resolved,
      precision_at_3: complete ? relativePlanCharterProportion(wins, expected) : null,
      expectancy_r: complete && expected > 0 ? sumR / expected : null,
      no_entry_count: input.observations.reduce((sum, row) => sum + row.comparison[name].no_entry_count, 0) };
  };
  const baseline = arm("baseline"), challenger = arm("challenger");
  const resolved = rows.filter(row => row.outcome_status === "resolved" && row.r_result !== null).length;
  const snapshotCount = rows.filter(row => row.snapshot_fingerprint !== null).length;
  const probability = input.probability;
  const probabilityMembership = probability?.forward?.rows;
  const boundProbability = probability?.status === "measured" && probability.forward !== null &&
    probability.forward.original_population_count === rows.length &&
    probabilityMembership?.length === rows.length && new Set(probabilityMembership.map(row => row.candidate_id)).size === rows.length &&
    input.observations.every(observation => observation.rows.every(row => probabilityMembership.some(value =>
      value.run_fingerprint === observation.scan_run_fingerprint && value.candidate_id === row.candidate_id &&
      value.decision_at === observation.decision_at)));
  const enoughSample = input.observations.length >= canonicalQualityPublishabilityPolicy.minimum_ranking_opportunity_sets &&
    days.size >= canonicalQualityPublishabilityPolicy.minimum_trading_days && tickers.size >= canonicalQualityPublishabilityPolicy.minimum_tickers;
  const pairedInterval = enoughSample && baseline.precision_at_3 && challenger.precision_at_3
    ? clusteredDelta(input.observations, input.bootstrapSeed) : null;
  const qualitySlices = (["baseline", "challenger"] as const).map(name => {
    const selected = rows.filter(row => {
      const rank = name === "baseline" ? row.baseline_rank : row.challenger_rank;
      return rank !== null && rank >= 1 && rank <= 3;
    });
    return { arm: name, original_selected_candidate_count: selected.length,
      dimensions: (["ticker", "sector", "setup", "regime"] as const).map(dimension => {
        const unknown = selected.filter(row => row[dimension] === null);
        const keys = [...new Set(selected.flatMap(row => row[dimension] === null ? [] : [row[dimension]!]))].sort();
        return { dimension, original_selected_candidate_count: selected.length, missing_context_count: unknown.length,
          // Unknown members remain in the original arm denominator; they are
          // never a measured category or reassigned to a known context.
          groups: keys.map(key => {
            const members = selected.filter(row => row[dimension] === key);
            const resolved = members.filter(row => row.outcome_status === "resolved" && typeof row.positive_outcome === "boolean" && row.r_result !== null);
            const complete = context.same_original_population && resolved.length === members.length;
            return { key, selected_candidate_count: members.length, resolved_outcome_count: resolved.length,
              positive_outcome_count: resolved.filter(row => row.positive_outcome === true).length,
              precision: complete ? relativePlanCharterProportion(resolved.filter(row => row.positive_outcome === true).length, members.length) : null,
              expectancy_r: complete && members.length > 0 ? resolved.reduce((sum, row) => sum + row.r_result!, 0) / members.length : null };
          }) };
      }) };
  });
  return {
    contract_version: RELATIVE_PLAN_CHARTER_QUALITY_VERSION,
    original_decision_count: input.observations.length, original_population_count: rows.length,
    trading_day_count: days.size, ticker_count: tickers.size, sample_diversity_sufficient: enoughSample,
    original_outcome_population_complete: allOutcomes,
    outcome_coverage: context.same_original_population ? relativePlanCharterProportion(resolved, rows.length) : null,
    evidence_missingness: context.same_original_population ? relativePlanCharterProportion(rows.length - snapshotCount, rows.length) : null,
    baseline, challenger, precision_delta: baseline.precision_at_3 && challenger.precision_at_3
      ? challenger.precision_at_3.value - baseline.precision_at_3.value : null,
    paired_precision_interval: pairedInterval,
    calibration: boundProbability ? probability.forward : null,
    context, quality_slices: qualitySlices, context_triage: null,
    terminal_quality_decision: null, quality_improvement_claimed: false,
  };
}
