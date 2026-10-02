import { candidateDecisionRecordFromUnknown } from "@/lib/candidate-decision-readback";
import { evaluateRetainedScannerRankingComponents } from "@/lib/scanner-candidate-ranking";
import { isScannerDecisionInputPublishable } from "@/lib/scanner-decision-input-snapshot";
import { candidateDecisionCandidateId, type CandidateDecisionRecord } from "@/lib/candidate-decision-record";

export const RELATIVE_PLAN_CONTEXT_SHADOW_VERSION = "relative_plan_context_shadow_v1" as const;
export const relativePlanContextPolicy = Object.freeze({
  baseline: "scanner_candidate_ranking_v1.2",
  outcome_horizon_minutes: 60,
  bar_interval_minutes: 5,
  minimum_closed_bars: 12,
  no_penalty_range_multiple: 2,
  penalty_per_doubling: 20,
  maximum_component_penalty: 60,
  comparison_k: 3,
  range_semantics: "last_12_closed_5min_bars_divided_by_latest_price",
  plan_distance_basis: "first_target_minus_worst_long_entry_divided_by_worst_long_entry",
  rounding: "round_component_then_unchanged_weighted_aggregate",
  top_k_semantics: "diagnostic_priority_not_publication_selection",
});

const weights = Object.freeze({data_completeness:0.16,freshness:0.14,price_plan_quality:0.16,
  signal_strength:0.18,liquidity_volume:0.12,source_quality:0.09,window_fit:0.1,warnings_penalty:0.05});
type Candidate = CandidateDecisionRecord["candidates"][number];
export type RelativePlanContextShadowRow = {
  candidate_id: string;
  ticker: string;
  baseline_rank: number | null;
  shadow_rank: number | null;
  baseline_score: number | null;
  shadow_score: number | null;
  baseline_plan_score: number | null;
  shadow_plan_score: number | null;
  baseline_tier: string | null;
  shadow_tier: string | null;
  context_status: "assessed" | "unassessed" | "conflicting";
  reason: string | null;
  first_target_distance_percent: number | null;
  observed_60m_range_percent: number | null;
  relative_range_multiple: number | null;
  component_penalty: number;
};
export type RelativePlanContextShadow = {
  comparison_version: typeof RELATIVE_PLAN_CONTEXT_SHADOW_VERSION;
  status: "comparable" | "partial" | "unavailable" | "conflicting";
  policy: typeof relativePlanContextPolicy;
  scan_run_fingerprint: string | null;
  decision_timestamp: string | null;
  original_population_count: number;
  assessed_count: number;
  unassessed_count: number;
  baseline_top_k: string[];
  shadow_top_k: string[];
  candidates: RelativePlanContextShadowRow[];
  reason_codes: string[];
  live_ranking_effect: false;
  publication_effect: false;
  quality_improvement_claimed: false;
  quality_evidence_status: "not_evaluated";
};

const round = (value: number) => Math.round(value * 1e6) / 1e6;

function originalRow(candidate: Candidate): RelativePlanContextShadowRow {
  const ranking = candidate.ranking;
  return {candidate_id:candidate.candidate_id,ticker:candidate.ticker,
    baseline_rank:ranking?.rank??null,shadow_rank:ranking?.rank??null,
    baseline_score:ranking?.score??null,shadow_score:ranking?.score??null,
    baseline_plan_score:null,shadow_plan_score:null,baseline_tier:ranking?.tier??null,shadow_tier:ranking?.tier??null,
    context_status:"unassessed",reason:null,first_target_distance_percent:null,observed_60m_range_percent:null,
    relative_range_multiple:null,component_penalty:0};
}
function assess(candidate: Candidate, decision: string): RelativePlanContextShadowRow {
  const ranking=candidate.ranking;
  const row=originalRow(candidate);
  if (!ranking) { row.reason="original_candidate_unranked"; return row; }
  const components=ranking.components;
  // The historical record reader validates only scalar ranking shape. Do not
  // trust its TypeScript assertion for nested archived component evidence.
  if (!Array.isArray(components) || components.length!==8 ||
    components.some(c=>!c || typeof c!=="object" || !Object.hasOwn(weights,c.component) ||
      !Number.isFinite(c.score) || c.score<0 || c.score>100 ||
      c.weight!==weights[c.component] || !Number.isFinite(c.contribution) ||
      Math.abs(c.contribution-c.score*c.weight)>1e-6 || typeof c.reason!=="string") ||
    new Set(components.map(c=>c.component)).size!==8 || !Array.isArray(ranking.warnings) ||
    ranking.warnings.some(w=>!w || typeof w!=="object" || !["info","warning","blocked"].includes(w.severity) ||
      typeof w.warning_id!=="string" || typeof w.message!=="string")) {
    row.context_status="conflicting"; row.reason="baseline_components_do_not_reconstruct"; return row;
  }
  const baseline=evaluateRetainedScannerRankingComponents(components,ranking.warnings);
  if (baseline.score!==ranking.score || baseline.tier!==ranking.tier) {
    row.context_status="conflicting"; row.reason="baseline_components_do_not_reconstruct"; return row;
  }
  const plan=components.find(c=>c.component==="price_plan_quality")!;
  row.baseline_plan_score=plan.score; row.shadow_plan_score=plan.score;
  const input=candidate.data.input_snapshot;
  if (candidate.data.freshness!=="fresh" || candidate.data.gap_codes.length>0 ||
    !isScannerDecisionInputPublishable(input,candidate.ticker,new Date(decision))) {
    row.reason="original_input_not_fresh_complete"; return row;
  }
  const current=input?.current_session, indicators=input?.intraday_indicators;
  if (!current || current.interval!=="5min") { row.reason="range_window_not_60m"; return row; }
  const barCount=(Date.parse(current.latest_bar_closed_at)-Date.parse(current.session_open_at))/300000;
  if (!Number.isInteger(barCount) || barCount<12) { row.reason="short_closed_range_window"; return row; }
  const range=indicators?.recentRangePercent, high=indicators?.recentHigh, low=indicators?.recentLow;
  const price=indicators?.latestPrice;
  if (range==null || high==null || low==null || price==null || range<=0 || high<=low || low<=0 || price<=0) {
    row.reason="positive_observed_range_unavailable"; return row;
  }
  if (Math.abs(Math.round((high-low)/price*10000)/100-range)>1e-6) {
    row.context_status="conflicting"; row.reason="retained_range_inconsistent"; return row;
  }
  const features=input!.features;
  const entry=features.proposed_entry_high, target=features.proposed_target_1;
  const lowEntry=features.proposed_entry_low, stop=features.proposed_stop_loss;
  const secondTarget=features.proposed_target_2, ratio=features.proposed_risk_reward;
  if (entry==null || target==null || lowEntry==null || stop==null || secondTarget==null || ratio==null || plan.score===0) {
    row.reason="original_long_plan_unavailable"; return row;
  }
  if (Math.min(entry,target,lowEntry,stop,secondTarget,ratio)<=0 || stop>=lowEntry || lowEntry>entry ||
    target<=entry || secondTarget<=target || Math.abs((secondTarget-entry)/(entry-stop)-ratio)>0.05) {
    row.context_status="conflicting"; row.reason="original_plan_geometry_conflicting"; return row;
  }
  const distance=(target-entry)/entry*100;
  const multiple=distance/range;
  const roundedDistance=round(distance), roundedMultiple=round(multiple);
  if (!Number.isFinite(distance) || !Number.isFinite(multiple) ||
    !Number.isFinite(roundedDistance) || !Number.isFinite(roundedMultiple) || distance<=0 || multiple<=0) {
    row.context_status="conflicting"; row.reason="relative_plan_distance_not_finite"; return row;
  }
  const penalty=Math.min(60,20*Math.max(0,Math.log2(multiple/2)));
  // Match the live component's rounding, then its unchanged weighted aggregate.
  const shadowPlan=Math.max(0,Math.min(100,Math.round(plan.score-penalty)));
  const changed=components.map(c=>c.component==="price_plan_quality"
    ? {...c,score:shadowPlan,contribution:shadowPlan*c.weight} : c);
  const shadow=evaluateRetainedScannerRankingComponents(changed,ranking.warnings);
  return {...row,context_status:"assessed",reason:null,first_target_distance_percent:roundedDistance,
    observed_60m_range_percent:range,relative_range_multiple:roundedMultiple,component_penalty:round(penalty),
    shadow_plan_score:shadowPlan,shadow_score:shadow.score,shadow_tier:shadow.tier};
}

/** Same immutable information set and full population, never reconstructed
 * local-score features, mutable cache, future candles or execution authority.
 * Past range is a context feature, not a forecast or attainable-target ceiling. */
export function buildRelativePlanContextShadow(value: unknown): RelativePlanContextShadow {
  const record=candidateDecisionRecordFromUnknown(value);
  const output: RelativePlanContextShadow={comparison_version:RELATIVE_PLAN_CONTEXT_SHADOW_VERSION,
    status:"unavailable",policy:relativePlanContextPolicy,scan_run_fingerprint:record?.scan_run_fingerprint??null,
    decision_timestamp:record?.decision_timestamp??null,original_population_count:record?.candidates.length??0,
    assessed_count:0,unassessed_count:record?.candidates.length??0,baseline_top_k:[],shadow_top_k:[],candidates:[],reason_codes:[],
    live_ranking_effect:false,publication_effect:false,quality_improvement_claimed:false,quality_evidence_status:"not_evaluated"};
  if (!record || record.record_version!=="candidate_decision_record_v4" ||
    record.versions.ranking_version!==relativePlanContextPolicy.baseline ||
    record.decision_clock?.contract_version!=="pre_publication_decision_clock_v1") {
    output.reason_codes=["original_versioned_decision_or_clock_unavailable"];
    output.candidates=record?.candidates.map(c=>({...originalRow(c),reason:output.reason_codes[0]}))??[];
    return output;
  }
  output.candidates=record.candidates.map(c=>assess(c,record.decision_timestamp));
  const ranked=output.candidates.filter(c=>c.baseline_rank!==null);
  const populationValid=new Set(record.candidates.map(c=>c.candidate_id)).size===record.candidates.length &&
    new Set(record.candidates.map(c=>c.ticker)).size===record.candidates.length &&
    record.candidates.every(c=>c.candidate_id===candidateDecisionCandidateId(record.scan_run_id,c.ticker));
  const baselineOrdered=[...ranked].sort((a,b)=>b.baseline_score!-a.baseline_score! || a.ticker.localeCompare(b.ticker));
  const ranksValid=baselineOrdered.every((c,i)=>c.baseline_rank===i+1);
  output.baseline_top_k=[...ranked].sort((a,b)=>a.baseline_rank!-b.baseline_rank!).slice(0,3).map(c=>c.candidate_id);
  const shadow=[...ranked].sort((a,b)=>b.shadow_score!-a.shadow_score! || a.ticker.localeCompare(b.ticker));
  shadow.forEach((c,i)=>{c.shadow_rank=i+1;});
  output.shadow_top_k=shadow.slice(0,3).map(c=>c.candidate_id);
  output.assessed_count=output.candidates.filter(c=>c.context_status==="assessed").length;
  output.unassessed_count=output.candidates.length-output.assessed_count;
  output.status=!populationValid || !ranksValid || output.candidates.some(c=>c.context_status==="conflicting")?"conflicting"
    : output.assessed_count===0?"unavailable":output.unassessed_count>0?"partial":"comparable";
  output.reason_codes=[...new Set(output.candidates.map(c=>c.reason).filter((v):v is string=>v!==null))].sort();
  if (!populationValid) output.reason_codes.push("original_population_identity_conflicting");
  if (!ranksValid) output.reason_codes.push("original_baseline_rank_conflicting");
  if (output.status==="conflicting") output.shadow_top_k=[];
  return output;
}
