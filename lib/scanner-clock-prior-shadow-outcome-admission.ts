import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION } from "@/lib/scanner-clock-prior-shadow-evidence-reuse";

export const SCANNER_CLOCK_PRIOR_SHADOW_OUTCOME_ADMISSION_VERSION =
  "scanner_clock_prior_shadow_outcome_admission_v1" as const;

export type ScannerClockPriorShadowOutcomeAdmission = {
  admission_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_OUTCOME_ADMISSION_VERSION;
  status: "not_applicable" | "admitted" | "rejected";
  reason_codes: string[];
  snapshot_fingerprint: string | null;
  scan_run_fingerprint: string | null;
  candidate_decision_id: string | null;
  provider_requests_authorized: 0;
  live_ranking_effect: false;
  publication_effect: false;
  execution_effect: false;
  quality_improvement_claimed: false;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function exactTimestamp(value: unknown) {
  const parsed = text(value);
  if (!parsed) return null;
  const timestamp = Date.parse(parsed);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

/**
 * Admits only the exact clock-prior research identities proven reusable from
 * the same immutable full ranked population. The surrounding scheduled credit
 * guard remains the only authority for provider work.
 */
export function assessScannerClockPriorShadowOutcomeAdmission(
  snapshot: RecommendationSnapshot,
): ScannerClockPriorShadowOutcomeAdmission {
  const payload = snapshot.payload_json;
  const targetCohort =
    payload.clock_prior_shadow_evidence_sample === true ||
    payload.clock_prior_shadow_evidence_reuse_version !== undefined;
  const base = {
    admission_version: SCANNER_CLOCK_PRIOR_SHADOW_OUTCOME_ADMISSION_VERSION,
    snapshot_fingerprint: text(snapshot.snapshot_fingerprint),
    scan_run_fingerprint:
      text(payload.scan_run_fingerprint) ?? text(snapshot.scan_run_id),
    candidate_decision_id: text(payload.candidate_decision_id),
    provider_requests_authorized: 0 as const,
    live_ranking_effect: false as const,
    publication_effect: false as const,
    execution_effect: false as const,
    quality_improvement_claimed: false as const,
  };

  if (!targetCohort) {
    return {
      ...base,
      status: "not_applicable",
      reason_codes: ["not_clock_prior_full_population"],
    };
  }

  const reasons: string[] = [];
  const scanRunId = text(snapshot.scan_run_id);
  const payloadScanRunFingerprint = text(payload.scan_run_fingerprint);
  const candidateId = text(payload.candidate_id);
  const candidateDecisionId = text(payload.candidate_decision_id);
  const sourceTimestamp = exactTimestamp(payload.data_timestamp);
  const recommendedAt = exactTimestamp(snapshot.recommended_at);
  const disposition = text(payload.candidate_decision_disposition);
  const explicitMetadataGaps = Array.isArray(payload.explicit_metadata_gaps)
    ? payload.explicit_metadata_gaps
    : null;

  if (
    payload.clock_prior_shadow_evidence_sample !== true ||
    payload.clock_prior_shadow_evidence_reuse_version !==
      SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION
  ) {
    reasons.push("capture_contract_mismatch");
  }
  if (
    snapshot.source_mode !== "research_only" ||
    snapshot.data_mode !== "research_only" ||
    snapshot.is_visible !== false ||
    snapshot.is_real !== true ||
    snapshot.is_demo === true ||
    snapshot.is_mock === true ||
    payload.visibility_status !== "research_only" ||
    payload.research_only !== true ||
    payload.learning_scope !== "research_only" ||
    payload.not_live_trade_signal !== true ||
    payload.visible_in_primary_recommendations !== false
  ) {
    reasons.push("research_containment_mismatch");
  }
  if (
    !scanRunId ||
    !payloadScanRunFingerprint ||
    scanRunId !== payloadScanRunFingerprint ||
    !text(payload.batch_fingerprint)
  ) {
    reasons.push("scan_or_batch_identity_mismatch");
  }
  if (
    !candidateId ||
    !candidateDecisionId ||
    candidateId !== candidateDecisionId ||
    payload.candidate_decision_linkage_status !== "verified" ||
    (disposition !== "selected_not_published" &&
      disposition !== "ranked_not_selected")
  ) {
    reasons.push("candidate_decision_lineage_mismatch");
  }
  if (
    payload.sample_quality !== "good" ||
    explicitMetadataGaps === null ||
    explicitMetadataGaps.length > 0 ||
    !text(payload.provider_source) ||
    !sourceTimestamp ||
    !recommendedAt ||
    Date.parse(sourceTimestamp) > Date.parse(recommendedAt)
  ) {
    reasons.push("point_in_time_evidence_incomplete");
  }

  return {
    ...base,
    status: reasons.length === 0 ? "admitted" : "rejected",
    reason_codes: Array.from(new Set(reasons)).sort(),
  };
}
