import {
  candidateDecisionCandidateId,
  INPUT_ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION,
  PRE_PUBLICATION_DECISION_CLOCK_VERSION,
  type CandidateDecisionRecord,
} from "@/lib/candidate-decision-record";
import {
  COMPLETED_DAILY_DECISION_SCANNER_VERSION,
  COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION,
  isScannerDecisionInputPublishable,
  scannerDecisionInputSnapshotFromUnknown,
} from "@/lib/scanner-decision-input-snapshot";
import {
  buildRecommendationOutcomeEvaluationAnchor,
  recommendationOutcomeEvaluationAnchorFromSnapshot,
} from "@/lib/recommendation-outcome-evaluation-anchor";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export const COMPLETED_INPUT_PUBLISHED_CAPTURE_VERSION = "completed_input_published_capture_v1" as const;

function evidence(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(evidence).join(",")}]`;
  if (value !== null && typeof value === "object") return `{${Object.entries(value)
    .sort(([a], [b]) => a.localeCompare(b)).map(([name, item]) => `${JSON.stringify(name)}:${evidence(item)}`).join(",")}}`;
  return JSON.stringify(value) ?? "null";
}

/** Published inputs have a separate writer marker. Never reinterpret a legacy
 * publication, invent a research counterpart or shift the canonical horizon.
 * The owned durable run/lineage is admitted by the caller, not this matcher. */
export function completedInputPublishedSnapshotMatchesDecision(
  snapshot: RecommendationSnapshot, record: CandidateDecisionRecord | null,
): boolean {
  const p = snapshot.payload_json;
  if (!record || record.record_version !== INPUT_ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION ||
    record.decision_clock?.contract_version !== PRE_PUBLICATION_DECISION_CLOCK_VERSION ||
    record.versions.input_policy_version !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION ||
    record.versions.scanner_version !== COMPLETED_DAILY_DECISION_SCANNER_VERSION ||
    p.published_input_capture_version !== COMPLETED_INPUT_PUBLISHED_CAPTURE_VERSION ||
    p.scanner_input_policy_version !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION ||
    p.decision_timestamp !== record.decision_timestamp || snapshot.scan_run_id !== record.scan_run_fingerprint ||
    !snapshot.ticker || !snapshot.recommendation_id || snapshot.is_visible !== true || snapshot.status !== "visible" ||
    snapshot.source_mode !== "supabase" || snapshot.data_mode !== "supabase_record" || snapshot.side !== "long" ||
    snapshot.is_real !== true || snapshot.is_demo === true || snapshot.is_mock === true ||
    p.diagnostic_run === true || p.dry_run === true || p.research_capture_version !== undefined ||
    p.candidate_decision_disposition !== "published" || p.candidate_decision_linkage_status !== "verified") return false;
  const matches = record.candidates.filter(candidate => candidate.ticker === snapshot.ticker);
  const candidate = matches.length === 1 ? matches[0] : null;
  const recommendation = p.recommendation;
  if (!candidate || candidate.disposition !== "published" || candidate.eligibility !== "eligible" ||
    candidate.candidate_id !== candidateDecisionCandidateId(record.scan_run_id, snapshot.ticker) ||
    candidate.candidate_id !== p.candidate_id || p.candidate_decision_id !== candidate.candidate_id ||
    !record.final_decision.published_tickers.includes(snapshot.ticker) ||
    candidate.data.freshness !== "fresh" || candidate.data.gap_codes.length !== 0 ||
    candidate.data.provider_source !== "twelve_data" || p.provider_source !== "twelve_data" ||
    recommendation === null || typeof recommendation !== "object" || Array.isArray(recommendation)) return false;
  const originalRecommendation = recommendation as Record<string, unknown>;
  if (originalRecommendation.id !== snapshot.recommendation_id || originalRecommendation.ticker !== snapshot.ticker ||
    (originalRecommendation.setup_type ?? null) !== snapshot.type ||
    Date.parse(String(originalRecommendation.created_at)) !== Date.parse(snapshot.recommended_at ?? "") ||
    !Number.isFinite(Date.parse(snapshot.recommended_at ?? "")) ||
    Date.parse(snapshot.recommended_at!) < Date.parse(record.decision_timestamp)) return false;
  const originalAnchor = buildRecommendationOutcomeEvaluationAnchor(record.decision_timestamp);
  const publicationAnchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot);
  if (originalAnchor.status !== "anchored" || !publicationAnchor ||
    originalAnchor.evaluation_anchor_start_at !== publicationAnchor.evaluation_anchor_start_at) return false;
  const input = scannerDecisionInputSnapshotFromUnknown(p.scanner_decision_input_snapshot,
    snapshot.ticker, record.decision_timestamp);
  if (!input?.current_session || !isScannerDecisionInputPublishable(input, snapshot.ticker, new Date(record.decision_timestamp)) ||
    evidence(input) !== evidence(candidate.data.input_snapshot) ||
    p.original_source_timestamp !== candidate.data.source_timestamp ||
    p.original_source_timestamp !== input.current_session.latest_bar_started_at ||
    !Number.isFinite(Date.parse(String(p.data_timestamp))) ||
    Date.parse(String(p.data_timestamp)) > Date.parse(record.decision_timestamp)) return false;
  const f = input.features;
  return f.proposed_entry_low !== null && f.proposed_entry_high !== null && f.proposed_stop_loss !== null &&
    f.proposed_target_1 !== null && snapshot.entry_low === f.proposed_entry_low && snapshot.entry_high === f.proposed_entry_high &&
    snapshot.entry === (f.proposed_entry_low + f.proposed_entry_high) / 2 && snapshot.stop === f.proposed_stop_loss &&
    snapshot.target === f.proposed_target_1 && snapshot.planned_risk_reward === f.proposed_risk_reward &&
    snapshot.risk_per_share === snapshot.entry - f.proposed_stop_loss &&
    snapshot.reward_per_share === f.proposed_target_1 - snapshot.entry;
}

/** Only the normal writer attaches this evidence to an unchanged publication.
 * No cache lookup, provider acquisition, visibility or recommendation mutation. */
export function attachCompletedInputPublishedEvidence(
  snapshot: RecommendationSnapshot, record: CandidateDecisionRecord | null,
): RecommendationSnapshot {
  const matches = record?.candidates.filter(candidate => candidate.ticker === snapshot.ticker) ?? [];
  if (!record || matches.length !== 1 || !matches[0].data.input_snapshot) return snapshot;
  const captured = { ...snapshot, payload_json: { ...snapshot.payload_json,
    published_input_capture_version: COMPLETED_INPUT_PUBLISHED_CAPTURE_VERSION,
    scanner_input_policy_version: record.versions.input_policy_version,
    decision_timestamp: record.decision_timestamp,
    original_source_timestamp: matches[0].data.source_timestamp,
    scanner_decision_input_snapshot: structuredClone(matches[0].data.input_snapshot),
    // These original fields have no top-level persistence columns. Retain
    // their actual writer values, not reconstructed or relaxed geometry.
    entry_low: snapshot.entry_low,
    entry_high: snapshot.entry_high,
    risk_per_share: snapshot.risk_per_share,
    reward_per_share: snapshot.reward_per_share,
    type: snapshot.type,
    confidence: snapshot.confidence,
    score: snapshot.score,
    rating: snapshot.rating,
    label: snapshot.label,
  } };
  return completedInputPublishedSnapshotMatchesDecision(captured, record) ? captured : snapshot;
}
