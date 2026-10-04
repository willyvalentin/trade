import { relativePlanEvidence } from "./relative-plan-context-evidence";
import { reproducibleOriginalEvidence } from "./original-input-archive-evidence";
import { prospectiveInput } from "./relative-plan-prospective";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { recommendationDecisionFeatureVectorFromScannerCandidate } from "@/lib/recommendation-decision-feature-vector";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import { computeRecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { buildCanonicalOutcomeProviderCoverageReceipt } from "@/lib/recommendation-outcome-canonical-coverage";
import { buildCandidateDecisionLearningAttribution } from "@/lib/candidate-decision-learning-attribution";
import { CANONICAL_OUTCOME_EVALUATOR_VERSION } from "@/lib/canonical-recommendation-evaluation";
import { BUILD_MARKER, RECOMMENDATION_PUBLISH_POLICY_VERSION } from "@/lib/publish-path-versions";
import { CANDIDATE_DECISION_PROVIDER_CONTRACT_VERSION } from "@/lib/candidate-decision-record";

// Synthetic CLOSED point-in-time source. Future fixture dates are never market evidence.
export async function prospectiveSource(options: { now?: Date; missingInputs?: boolean; missingOutcome?: boolean; allLosses?: boolean; positiveTickers?: string[]; rankedCount?: 4 | 8; originalInputs?: boolean; historicalFieldPresenceWording?: true } = {}) {
  const now = options.now ?? new Date("2026-10-12T17:00:00.000Z"), revision = prospectiveInput.source_revision;
  const { run, record, observed } = await (options.originalInputs ? reproducibleOriginalEvidence : relativePlanEvidence)({ rankedCount: options.rankedCount ?? 4, now,
    ...(options.historicalFieldPresenceWording ? { historicalFieldPresenceWording: true as const } : {}),
    missing: options.missingInputs ?? false, buildVersion: revision.build_identity,
    learningAttribution: buildCandidateDecisionLearningAttribution({
      recommendationPublishPolicyVersion: RECOMMENDATION_PUBLISH_POLICY_VERSION,
      canonicalEvaluationVersions: { engine_version: "ture_intelligence_engine_v1", scoring_version: "synthetic_original_score",
        ranking_version: "scanner_candidate_ranking_v1.2", setup_taxonomy_version: "setup_taxonomy_not_recorded_v1",
        confidence_contract_version: "ordinal_confidence_not_calibrated_v1", evaluator_version: CANONICAL_OUTCOME_EVALUATOR_VERSION,
        provider_contract_version: CANDIDATE_DECISION_PROVIDER_CONTRACT_VERSION, git_commit: revision.commit_ref, build_identity: revision.build_identity },
    }) });
  const snapshots = observed.map(candidate => {
    const original = record.candidates.find(row => row.ticker === candidate.ticker)!, input = original.data.input_snapshot!;
    const plan = options.originalInputs ? { entry_low: candidate.proposed_entry_low!, entry_high: candidate.proposed_entry_high!,
      stop: candidate.proposed_stop_loss!, target: candidate.proposed_target_1!, planned_risk_reward: candidate.proposed_risk_reward! }
      : { entry_low: 99, entry_high: 100, stop: 96, target: 108, planned_risk_reward: 2.5 };
    return buildRecommendationSnapshot({ ticker: candidate.ticker, scan_run_id: run.run_fingerprint,
      recommended_at: record.decision_timestamp, app_timestamp: record.decision_timestamp,
      source_mode: "research_only", data_mode: "research_only", is_visible: false, is_real: true,
      side: "long", ...plan, entry: (plan.entry_low + plan.entry_high) / 2, freshness: "fresh", payload: {
        // Match the real hidden-source producer's persisted plan metadata;
        // these values must survive the actual persistence-row decoder.
        side: "long", entry_low: plan.entry_low, entry_high: plan.entry_high, is_real: true,
        research_capture_version: "completed_input_research_capture_v1", research_purpose: "learning_acceleration",
        scanner_input_policy_version: "completed_daily_intraday_input_v1", scanner_decision_input_snapshot: input,
        decision_timestamp: record.decision_timestamp, data_timestamp: input.current_session!.latest_bar_started_at,
        candidate_id: original.candidate_id, candidate_decision_id: original.candidate_id,
        candidate_decision_disposition: original.disposition, candidate_decision_linkage_status: "verified",
        candidate_decision_linkage_version: "research_snapshot_candidate_decision_linkage_v2",
        provider_source: "twelve_data", provider_version: null, build_marker: BUILD_MARKER,
        market_data_adapter_version: "automation_scan_market_data_adapter_v1",
        recommendation_publish_policy_version: record.learning_attribution.recommendation_publish_policy_version,
        intraday_indicator_response_identity: input.current_session!.response_identity,
        decision_feature_vector: recommendationDecisionFeatureVectorFromScannerCandidate(candidate, now.getTime() / 1000),
      } });
  });
  const outcomes = snapshots.map((snapshot, i) => {
    const anchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot)!;
    const start = Date.parse(anchor.evaluation_anchor_start_at), wins = options.positiveTickers
      ? typeof snapshot.ticker === "string" && options.positiveTickers.includes(snapshot.ticker) : !options.allLosses && i !== 0;
    const candles = Array.from({ length: 12 }, (_, bar) => ({ timestamp: new Date(start + bar * 300000).toISOString(),
      open: 100, high: wins ? 109 : 101, low: wins ? 99 : 95, close: wins ? 108 : 96, volume: 1000 }));
    const outcome = computeRecommendationOutcome({ snapshot, horizon: "60m", evaluated_at: new Date(start + 3600000), candles,
      current_price: candles.at(-1)!.close, provider: "twelve_data", source: "intraday_candles", data_completeness: "complete" }).outcome;
    const coverage = buildCanonicalOutcomeProviderCoverageReceipt({ candles, request: { interval: "5min", horizon: "60m",
      start_at: anchor.evaluation_anchor_start_at, end_at: new Date(start + 3600000).toISOString(),
      decision_timestamp: anchor.decision_timestamp, evaluation_anchor_start_at: anchor.evaluation_anchor_start_at,
      decision_to_anchor_seconds: anchor.decision_to_anchor_seconds, decision_timestamp_interval_aligned: anchor.decision_timestamp_interval_aligned },
      result: { status: "available", provider: "twelve_data" } });
    return { ...outcome, payload_json: { ...outcome.payload_json, canonical_provider_coverage: coverage } };
  });
  return { scanRuns: [run], snapshots, outcomes: options.missingOutcome ? outcomes.slice(1) : outcomes };
}
