import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { candidateDecisionCandidateId, INPUT_ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION } from "@/lib/candidate-decision-record";
import type { LearningAccelerationResearchSample } from "@/lib/learning-acceleration-mode";
import type { RealScannerCandidate } from "@/lib/real-scanner-candidate-generation";
import {
  COMPLETED_DAILY_DECISION_SCANNER_VERSION,
  COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION,
  isScannerDecisionInputPublishable,
  scannerDecisionInputSnapshotFromUnknown,
  type ScannerDecisionInputSnapshot,
} from "@/lib/scanner-decision-input-snapshot";
import { twelveDataResponseIdentityFromUnknown } from "@/lib/twelve-data-response-identity";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { recommendationDecisionFeatureVectorFromUnknown } from "@/lib/recommendation-decision-feature-vector";

export const COMPLETED_INPUT_RESEARCH_CAPTURE_VERSION = "completed_input_research_capture_v1" as const;
export type CompletedInputResearchEvidence = {
  capture_version: typeof COMPLETED_INPUT_RESEARCH_CAPTURE_VERSION;
  candidate_id: string;
  decision_timestamp: string;
  input_snapshot: ScannerDecisionInputSnapshot;
};

const key = (ticker: string) => ticker.trim().toUpperCase();

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
    .map(([name, item]) => `${JSON.stringify(name)}:${canonicalJson(item)}`).join(",")}}`;
  return JSON.stringify(value);
}

/** Evaluation may run later, but the source must match its original fresh
 * decision, geometry and immutable inputs. Stored visibility stays hidden. */
export function completedInputResearchSnapshotMatchesDecision(snapshot: RecommendationSnapshot, record: CandidateDecisionRecord | null): boolean {
  const p = snapshot.payload_json;
  if (!record || record.record_version !== INPUT_ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION ||
    record.versions.input_policy_version !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION ||
    record.versions.scanner_version !== COMPLETED_DAILY_DECISION_SCANNER_VERSION ||
    p.research_capture_version !== COMPLETED_INPUT_RESEARCH_CAPTURE_VERSION ||
    p.scanner_input_policy_version !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION ||
    snapshot.is_visible !== false || snapshot.status !== "hidden" || snapshot.source_mode !== "research_only" ||
    snapshot.recommendation_id !== null || snapshot.scan_run_id !== record.scan_run_fingerprint ||
    p.decision_timestamp !== record.decision_timestamp || snapshot.recommended_at !== record.decision_timestamp ||
    !snapshot.ticker || p.diagnostic_run === true || p.dry_run === true) return false;
  const matches = record.candidates.filter(candidate => key(candidate.ticker) === key(snapshot.ticker!));
  if (matches.length !== 1) return false;
  const decision = matches[0];
  const input = scannerDecisionInputSnapshotFromUnknown(p.scanner_decision_input_snapshot, key(snapshot.ticker), record.decision_timestamp);
  if (!input?.current_session || decision.candidate_id !== p.candidate_id || decision.data.freshness !== "fresh" ||
    !["selected_not_published", "ranked_not_selected", "filtered_before_ranking"].includes(decision.disposition) ||
    !isScannerDecisionInputPublishable(input, key(snapshot.ticker), new Date(record.decision_timestamp)) ||
    canonicalJson(input) !== canonicalJson(decision.data.input_snapshot) ||
    p.data_timestamp !== decision.data.source_timestamp || p.data_timestamp !== input.current_session.latest_bar_started_at) return false;
  const f = input.features;
  return f.proposed_entry_low !== null && f.proposed_entry_high !== null && snapshot.side === "long" &&
    snapshot.entry === (f.proposed_entry_low + f.proposed_entry_high) / 2 && snapshot.stop === f.proposed_stop_loss &&
    snapshot.target === f.proposed_target_1;
}

/** Retain existing decision-time plans throughout the verified regular session.
 * This is hidden outcome-source capture, not a ranking or publication policy.
 * No cache lookup, plan invention, provider request or old-cohort admission. */
export function selectCompletedInputResearchSamples({
  record, candidates, excludedTickers, maxSamples,
}: {
  record: CandidateDecisionRecord;
  candidates: RealScannerCandidate[];
  excludedTickers: string[];
  maxSamples: number;
}): LearningAccelerationResearchSample[] {
  if (record.record_version !== INPUT_ATTRIBUTED_CANDIDATE_DECISION_RECORD_VERSION ||
    record.versions.input_policy_version !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION ||
    record.versions.scanner_version !== COMPLETED_DAILY_DECISION_SCANNER_VERSION) return [];
  const excluded = new Set(excludedTickers.map(key));
  const samples: LearningAccelerationResearchSample[] = [];
  const ordered = [...record.candidates].sort((a, b) =>
    (a.ranking?.rank ?? Infinity) - (b.ranking?.rank ?? Infinity) || a.candidate_id.localeCompare(b.candidate_id));
  for (const decision of ordered) {
    if (samples.length >= maxSamples) break;
    const ticker = key(decision.ticker);
    if (excluded.has(ticker) || !["selected_not_published", "ranked_not_selected", "filtered_before_ranking"].includes(decision.disposition) ||
      decision.candidate_id !== candidateDecisionCandidateId(record.scan_run_id, ticker) ||
      record.candidates.filter(row => key(row.ticker) === ticker).length !== 1) continue;
    const matches = candidates.filter(candidate => key(candidate.ticker) === ticker);
    if (matches.length !== 1) continue;
    const candidate = matches[0];
    const snapshot = scannerDecisionInputSnapshotFromUnknown(decision.data.input_snapshot, ticker, record.decision_timestamp);
    const current = snapshot?.current_session;
    if (!snapshot || !current || !isScannerDecisionInputPublishable(snapshot, ticker, new Date(record.decision_timestamp)) ||
      decision.data.freshness !== "fresh" || decision.data.gap_codes.length !== 0 ||
      decision.data.provider_source !== "twelve_data" || candidate.provider_source !== "twelve_data" ||
      candidate.stale || !["fresh", "cache"].includes(candidate.data_source ?? "") ||
      decision.data.source_timestamp !== current.latest_bar_started_at ||
      candidate.reference_price_timestamp !== current.latest_bar_started_at ||
      decision.reason_codes.some(code => code === "candidate_provider_gap" || code === "provider_data_stale")) continue;
    const identity = twelveDataResponseIdentityFromUnknown(candidate.intraday_indicator_response_identity);
    if (!identity || identity.payload_sha256 !== current.response_identity.payload_sha256 ||
      identity.payload_byte_length !== current.response_identity.payload_byte_length) continue;
    const f = snapshot.features;
    const featureVector = recommendationDecisionFeatureVectorFromUnknown(candidate.decision_feature_vector);
    if (!featureVector || featureVector.feature_values.latest_price !== f.latest_close ||
      featureVector.feature_values.planned_risk_reward !== f.proposed_risk_reward ||
      featureVector.feature_values.daily_change_5d_percent !== f.change_5d_percent ||
      featureVector.feature_values.intraday_recent_change_percent !== f.recent_change_percent ||
      featureVector.feature_values.intraday_recent_range_position !== f.recent_range_position) continue;
    if (candidate.entry_low !== f.proposed_entry_low || candidate.entry_high !== f.proposed_entry_high ||
      candidate.stop_loss !== f.proposed_stop_loss || candidate.target_1 !== f.proposed_target_1 ||
      candidate.target_2 !== f.proposed_target_2 || candidate.risk_reward !== f.proposed_risk_reward) continue;
    const low = f.proposed_entry_low, high = f.proposed_entry_high;
    const stop = f.proposed_stop_loss, target = f.proposed_target_1;
    if (low === null || high === null || stop === null || target === null ||
      low <= 0 || high < low || stop <= 0 || stop >= low || target <= high ||
      !Number.isFinite(candidate.score.value)) continue;
    samples.push({
      ticker, company_name: candidate.company_name, sector: candidate.sector,
      setup_type: candidate.setup_type ?? "UNKNOWN", tier: candidate.tier,
      score: decision.ranking?.score ?? candidate.score.value, rank: decision.ranking?.rank ?? null,
      entry_low: low, entry_high: high, entry: (low + high) / 2, stop, target,
      target_2: f.proposed_target_2, risk_reward: f.proposed_risk_reward,
      provider_source: "twelve_data", market_data_source: candidate.data_source ?? null,
      market_data_timestamp: current.latest_bar_started_at,
      intraday_indicator_response_identity: identity,
      decision_feature_vector: JSON.parse(JSON.stringify(featureVector)),
      rejection_publish_reason: decision.reason_codes.join(",") || "non_published_decision",
      sample_quality: "good", ranking_reason: decision.ranking?.rank_reason ?? "Decision-time scanner plan; hidden research only.",
      ranking_warnings: decision.reason_codes, explicit_metadata_gaps: [],
      input_research_evidence: {
        capture_version: COMPLETED_INPUT_RESEARCH_CAPTURE_VERSION,
        candidate_id: decision.candidate_id, decision_timestamp: record.decision_timestamp,
        input_snapshot: JSON.parse(JSON.stringify(snapshot)) as ScannerDecisionInputSnapshot,
      },
    });
  }
  return samples;
}
