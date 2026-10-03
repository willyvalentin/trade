import "server-only";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { decisionLineageReceiptFromScanRun } from "@/lib/decision-lineage-receipt";
import { getNyMarketTime } from "@/lib/market-session";
import { recommendationResearchLearningSourceProvenance } from "@/lib/completed-input-learning-provenance";
import { marketRegimeDecisionContextFromPayload, marketRegimeValueFromPayload } from "@/lib/market-regime-decision-context";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { buildRelativePlanContextOutcomeComparison } from "@/lib/scanner-relative-plan-context-outcomes";
import { SETUP_TYPES, type SetupType } from "@/lib/setup-types";
import { relativePlanSemanticFingerprint, relativePlanSemanticJson } from "@/lib/server/relative-plan-prospective-comparison";

export const RELATIVE_PLAN_CHARTER_OBSERVATIONS_VERSION = "relative_plan_charter_observations_v1" as const;
type Source = RecommendationLearningBaselineSource;

function observedNonNegative(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}
function observedText(value: unknown) {
  return typeof value === "string" && value.trim() && value.trim().toUpperCase() !== "UNKNOWN" ? value.trim() : null;
}

/** Normalize the *original* complete assessed population, not the resolved or
 * top-K subset. This new input basis must never impersonate the legacy shadow
 * adapter. No current market context, ordinal probability, or default zero can
 * fill missing point-in-time evidence. The caller supplies a complete owned
 * source from the existing server reader; this function grants no authority. */
export function buildRelativePlanCharterObservations(input: {
  scanRun: Source["scanRuns"][number]; source: Source; now: Date;
}) {
  if (!Number.isFinite(input.now.getTime())) return null;
  const source = { ...input.source, outcomes: input.source.outcomes.filter(row =>
    Number.isFinite(Date.parse(row.evaluated_at)) && Number.isFinite(Date.parse(row.created_at)) &&
    Date.parse(row.created_at) >= Date.parse(row.evaluated_at) &&
    Date.parse(row.evaluated_at) <= input.now.getTime() && Date.parse(row.created_at) <= input.now.getTime()) };
  // Rebuild canonical attribution rather than accepting a caller's claimed
  // comparison, terminal label or feature vector.
  const comparison = buildRelativePlanContextOutcomeComparison({ scanRun: input.scanRun, ...source });
  const record = candidateDecisionRecordFromScanRun(input.scanRun);
  const decisionAt = record?.decision_timestamp ?? null;
  const matchingRuns = source.scanRuns.filter(run => run.run_fingerprint === input.scanRun.run_fingerprint);
  const originalBound = Boolean(record && matchingRuns.length === 1 &&
    matchingRuns[0].id === input.scanRun.id && matchingRuns[0].trading_date === input.scanRun.trading_date &&
    relativePlanSemanticJson(input.scanRun) === relativePlanSemanticJson(matchingRuns[0]) &&
    input.scanRun.trading_date === getNyMarketTime(record.decision_timestamp).ny_date &&
    relativePlanSemanticJson(record) === relativePlanSemanticJson(candidateDecisionRecordFromScanRun(matchingRuns[0])) &&
    decisionLineageReceiptFromScanRun(input.scanRun, record));
  const observedDecision = Boolean(decisionAt && Date.parse(decisionAt) <= input.now.getTime());
  const runContext = marketRegimeDecisionContextFromPayload(input.scanRun.payload_json);
  const runRegime = marketRegimeValueFromPayload(input.scanRun.payload_json);
  const rows = comparison.candidates.map(row => {
    const blockers = new Set<string>();
    const original = record?.candidates.filter(candidate => candidate.candidate_id === row.candidate_id && candidate.ticker === row.ticker);
    const decision = original?.length === 1 ? original[0] : null;
    const matches = source.snapshots.filter(snapshot => snapshot.scan_run_id === input.scanRun.run_fingerprint &&
      (snapshot.ticker === row.ticker || snapshot.payload_json.candidate_id === row.candidate_id ||
        snapshot.payload_json.candidate_decision_id === row.candidate_id));
    const snapshot = matches.length === 1 ? matches[0] : null;
    const provenance = snapshot ? recommendationResearchLearningSourceProvenance(snapshot, source.scanRuns) : null;
    const admissible = Boolean(originalBound && observedDecision && decision && snapshot && snapshot.ticker === row.ticker &&
      snapshot.payload_json.candidate_id === row.candidate_id && snapshot.payload_json.candidate_decision_id === row.candidate_id &&
      provenance?.contract_version === "completed_input_learning_provenance_v1" && provenance.status === "admissible");
    if (!admissible) blockers.add("original_normalized_source_missing_or_conflicting");
    if (!observedDecision) blockers.add("original_decision_not_yet_observed");
    const values = admissible ? provenance!.decision_feature_vector?.feature_values : null;
    const sector = admissible ? observedText(decision!.sector) : null;
    if (!sector) blockers.add("original_sector_unavailable");
    // Setup comes only from explicit original hidden snapshot metadata. Its
    // scope is disclosed: the v4 decision record does not itself retain it.
    const rawSetup = admissible ? snapshot!.payload_json.setup_type : null;
    const setup: SetupType | null = typeof rawSetup === "string" && rawSetup !== "UNKNOWN" &&
      SETUP_TYPES.includes(rawSetup as SetupType) ? rawSetup as SetupType : null;
    if (!setup) blockers.add("original_setup_unavailable_or_unclassified");
    const snapshotContext = admissible ? marketRegimeDecisionContextFromPayload(snapshot!.payload_json) : null;
    const explicitRegime = admissible ? marketRegimeValueFromPayload(snapshot!.payload_json) : null;
    const regime = snapshotContext && runContext && runRegime === runContext.regime && explicitRegime === snapshotContext.regime &&
      snapshotContext.regime === runContext.regime && snapshotContext.captured_at === runContext.captured_at &&
      Date.parse(snapshotContext.captured_at) <= Date.parse(decisionAt!) ? snapshotContext.regime : null;
    if (!regime) blockers.add("original_market_regime_context_missing_or_conflicting");
    const liquidity = {
      intraday_recent_volume_ratio: observedNonNegative(values?.intraday_recent_volume_ratio),
      intraday_latest_volume: observedNonNegative(values?.intraday_latest_volume),
      intraday_average_volume: observedNonNegative(values?.intraday_average_volume),
    };
    const volatility = {
      intraday_average_range_percent: observedNonNegative(values?.intraday_average_range_percent),
      intraday_latest_range_percent: observedNonNegative(values?.intraday_latest_range_percent),
      intraday_range_expansion_ratio: observedNonNegative(values?.intraday_range_expansion_ratio),
      intraday_recent_range_percent: observedNonNegative(values?.intraday_recent_range_percent),
    };
    if (Object.values(liquidity).some(value => value === null)) blockers.add("original_liquidity_features_unavailable");
    if (Object.values(volatility).some(value => value === null)) blockers.add("original_volatility_features_unavailable");
    const outcome = admissible && row.outcome_status === "resolved" && row.outcome_id
      ? source.outcomes.find(value => value.id === row.outcome_id) : null;
    const trigger = typeof outcome?.entry_triggered === "boolean" ? outcome.entry_triggered : null;
    if (trigger === null) blockers.add("canonical_trigger_attainment_unavailable");
    return {
      candidate_id: row.candidate_id, ticker: row.ticker, decision_at: decisionAt,
      snapshot_fingerprint: admissible ? snapshot!.snapshot_fingerprint : null,
      baseline_rank: row.baseline_rank, challenger_rank: row.shadow_rank,
      sector, setup, regime,
      metadata_scope: { sector: "original_decision_record", setup: "explicit_original_research_snapshot",
        regime: "matching_original_scan_and_snapshot_context" },
      decision_feature_vector_version: admissible ? provenance!.decision_feature_vector?.contract_version ?? null : null,
      liquidity, volatility, trigger_attainment: trigger,
      unavailable_disclosed: { spread: true, halt_risk: true, conservative_slippage: true },
      outcome_status: observedDecision ? row.outcome_status : "missing",
      terminal_outcome: outcome ? row.terminal_outcome : null,
      positive_outcome: outcome ? row.positive_outcome : null,
      r_result: outcome ? row.r_result : null,
      blockers: [...blockers].sort(),
    };
  });
  return {
    contract_version: RELATIVE_PLAN_CHARTER_OBSERVATIONS_VERSION,
    source_basis: "completed_input_learning_provenance_v1",
    scan_run_fingerprint: input.scanRun.run_fingerprint, decision_at: decisionAt,
    expected_original_population_count: comparison.original_population_count,
    retained_original_population_count: rows.length,
    // Fingerprint deliberately excludes labels and missingness. Arrival or
    // correction of outcomes must not select a different original population.
    original_membership_fingerprint: relativePlanSemanticFingerprint(rows.map(row => ({
      candidate_id: row.candidate_id, ticker: row.ticker,
      baseline_rank: row.baseline_rank, challenger_rank: row.challenger_rank }))),
    status: originalBound && rows.length > 0 && rows.length === comparison.original_population_count &&
      comparison.status === "linked_complete" && rows.every(row => row.blockers.length === 0) ? "observed" : "evidence_incomplete",
    rows, comparison, terminal_quality_decision: null, quality_improvement_claimed: false,
    authority: { collection: false, provider: false, ranking: false, publication: false, promotion: false, broker: false },
  };
}

export type RelativePlanCharterObservations = NonNullable<ReturnType<typeof buildRelativePlanCharterObservations>>;
