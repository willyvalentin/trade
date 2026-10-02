import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { INPUT_ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION } from "@/lib/candidate-decision-record";
import {
  COMPLETED_INPUT_RESEARCH_CAPTURE_VERSION,
  completedInputResearchSnapshotMatchesDecision,
} from "@/lib/completed-input-research-selection";
import { decisionLineageReceiptFromScanRun } from "@/lib/decision-lineage-receipt";
import {
  recommendationDecisionSourceProvenanceFromSnapshot,
  recommendationDecisionSourceProvenanceBlockers,
  type RecommendationDecisionSourceProvenance,
  type RecommendationDecisionSourceProvenanceBlocker,
} from "@/lib/recommendation-decision-source-provenance";
import type { LearningBaselineScanRun } from "@/lib/recommendation-learning-baseline-readiness";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { recommendationDecisionFeatureVectorFromScannerCandidate, RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION } from "@/lib/recommendation-decision-feature-vector";

export const COMPLETED_INPUT_LEARNING_PROVENANCE_VERSION =
  "completed_input_learning_provenance_v1" as const;

export const completedInputLearningProvenanceBlockers = [
  ...recommendationDecisionSourceProvenanceBlockers,
  "completed_input_decision_or_lineage_missing_or_ambiguous",
  "completed_input_snapshot_or_geometry_mismatch",
  "completed_input_response_identity_mismatch",
  "completed_input_feature_vector_mismatch",
  "completed_input_upstream_version_not_retained",
] as const;

export type LearningSourceProvenanceBlocker =
  (typeof completedInputLearningProvenanceBlockers)[number];
export type CompletedInputLearningProvenance = Omit<
  RecommendationDecisionSourceProvenance, "contract_version" | "blockers"
> & {
  contract_version: typeof COMPLETED_INPUT_LEARNING_PROVENANCE_VERSION;
  reproduction_scope: "retained_normalized_inputs_and_original_geometry_only";
  excluded_feature_names: readonly ["scanner_local_score"];
  upstream_provider_version_status: "unavailable";
  blockers: LearningSourceProvenanceBlocker[];
};
export type LearningSourceProvenance =
  | RecommendationDecisionSourceProvenance
  | CompletedInputLearningProvenance;

/** New hidden v4 research can attribute outcomes to retained normalized inputs
 * without pretending to know the upstream API version or replay raw candles.
 * Legacy/published provenance remains v1. The owner-bound scan population must
 * come from the existing learning reader; a snapshot alone cannot authorize it.
 */
export function recommendationResearchLearningSourceProvenance(
  snapshot: RecommendationSnapshot,
  scanRuns: LearningBaselineScanRun[],
): LearningSourceProvenance {
  const legacy = recommendationDecisionSourceProvenanceFromSnapshot(snapshot);
  const matches = scanRuns.filter(run => run.run_fingerprint === snapshot.scan_run_id);
  const records = matches.map(candidateDecisionRecordFromScanRun);
  const isNewResearch = snapshot.payload_json.research_capture_version === COMPLETED_INPUT_RESEARCH_CAPTURE_VERSION ||
    records.some(record => record?.record_version === INPUT_ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION);
  if (!isNewResearch) return legacy;

  const run = matches.length === 1 ? matches[0] : null;
  const record = run ? records[0] : null;
  const candidate = record?.candidates.find(row => row.candidate_id === snapshot.payload_json.candidate_id);
  const bound = Boolean(run && record && decisionLineageReceiptFromScanRun(run, record));
  const matchesDecision = bound && completedInputResearchSnapshotMatchesDecision(snapshot, record ?? null);
  // Only the new basis replaces the upstream-version prerequisite. Every
  // other legacy requirement and the stronger archive/lineage checks remain.
  const blockers: LearningSourceProvenanceBlocker[] = legacy.blockers.filter(
    (blocker: RecommendationDecisionSourceProvenanceBlocker) => blocker !== "provider_version_missing",
  );
  // This capture contract did not retain an upstream API version. A later
  // snapshot string cannot supply that missing original evidence.
  if (legacy.provider_version !== null) {
    blockers.push("completed_input_upstream_version_not_retained");
  }
  if (!bound) blockers.push("completed_input_decision_or_lineage_missing_or_ambiguous");
  if (!matchesDecision || snapshot.is_demo === true || snapshot.is_mock === true ||
    legacy.provider_source !== "twelve_data" ||
    candidate?.data.provider_source !== legacy.provider_source || candidate?.data.gap_codes.length !== 0 ||
    legacy.market_data_adapter_version !== "automation_scan_market_data_adapter_v1" ||
    !legacy.source_build_marker || !record?.versions.build_version.endsWith(`:${legacy.source_build_marker}`) ||
    snapshot.payload_json.recommendation_publish_policy_version !== record?.learning_attribution.recommendation_publish_policy_version ||
    snapshot.payload_json.research_purpose !== "learning_acceleration" ||
    snapshot.payload_json.clock_prior_shadow_evidence_sample === true ||
    snapshot.payload_json.intraday_liquidity_shadow_evidence_sample === true) {
    blockers.push("completed_input_snapshot_or_geometry_mismatch");
  }
  const input = candidate?.data.input_snapshot;
  const currentIdentity = input?.current_session?.response_identity;
  const identity = legacy.intraday_indicator_response_identity;
  if (!identity || !currentIdentity || identity.payload_sha256 !== currentIdentity.payload_sha256 ||
    identity.payload_byte_length !== currentIdentity.payload_byte_length) {
    blockers.push("completed_input_response_identity_mismatch");
  }
  const vector = legacy.decision_feature_vector?.feature_values;
  const features = input?.features;
  const expectedVector = features && input && record ? recommendationDecisionFeatureVectorFromScannerCandidate({
    latest_close: features.latest_close ?? undefined,
    distance_to_20d_high: features.distance_to_20d_high ?? undefined,
    change_5d_percent: features.change_5d_percent ?? undefined,
    recent_change_percent: features.recent_change_percent ?? undefined,
    recent_range_position: features.recent_range_position ?? undefined,
    average_range_percent: features.average_range_percent ?? undefined,
    latest_range_percent: features.latest_range_percent ?? undefined,
    range_expansion_ratio: features.range_expansion_ratio ?? undefined,
    proposed_risk_reward: features.proposed_risk_reward ?? undefined,
    intraday_indicators: input.intraday_indicators ?? undefined,
    intraday_indicator_stale: false,
  }, Date.parse(record.decision_timestamp) / 1000) : null;
  // Reconstruct all observed market features. The local ordinal score is not
  // an archived market input and is explicitly outside this replay basis.
  if (!vector || legacy.decision_feature_vector?.contract_version !== RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION ||
    !expectedVector || Object.entries(expectedVector.feature_values).some(
    ([name,value]) => name !== "scanner_local_score" && vector[name as keyof typeof vector] !== value,
  )) {
    blockers.push("completed_input_feature_vector_mismatch");
  }
  return {
    ...legacy,
    provider_version: null,
    contract_version: COMPLETED_INPUT_LEARNING_PROVENANCE_VERSION,
    status: blockers.length === 0 ? "admissible" : "incomplete",
    reproduction_scope: "retained_normalized_inputs_and_original_geometry_only",
    excluded_feature_names: ["scanner_local_score"],
    upstream_provider_version_status: "unavailable",
    blockers,
  };
}
