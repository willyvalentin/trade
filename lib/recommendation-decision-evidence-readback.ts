import {
  recommendationDecisionSourceProvenanceFromSnapshot,
  type RecommendationDecisionSourceProvenanceBlocker,
} from "@/lib/recommendation-decision-source-provenance";
import type { RecommendationDecisionFeatureVector } from "@/lib/recommendation-decision-feature-vector";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { TwelveDataResponseIdentity } from "@/lib/twelve-data-response-identity";

export const RECOMMENDATION_DECISION_EVIDENCE_READBACK_VERSION =
  "recommendation_decision_evidence_readback_v1" as const;

const DEFAULT_ENTRY_LIMIT = 3;
const MAX_ENTRY_LIMIT = 10;

type DecisionEvidenceSnapshot = Pick<
  RecommendationSnapshot,
  | "snapshot_fingerprint"
  | "ticker"
  | "recommended_at"
  | "created_at"
  | "source_mode"
  | "is_demo"
  | "is_mock"
  | "payload_json"
>;

export type RecommendationDecisionEvidenceReadbackEntry = {
  snapshot_fingerprint: string;
  ticker: string | null;
  decision_timestamp: string | null;
  source_timestamp: string | null;
  status: "admissible" | "incomplete";
  blockers: RecommendationDecisionSourceProvenanceBlocker[];
  intraday_indicator_response_identity: TwelveDataResponseIdentity | null;
  decision_feature_vector: RecommendationDecisionFeatureVector | null;
  provider_source: string | null;
  provider_version: string | null;
  market_data_adapter_version: string | null;
  source_build_marker: string | null;
};

export type RecommendationDecisionEvidenceReadback = {
  contract_version: typeof RECOMMENDATION_DECISION_EVIDENCE_READBACK_VERSION;
  status: "available" | "partial" | "unavailable";
  considered_snapshot_count: number;
  server_owned_snapshot_count: number;
  excluded_non_server_owned_snapshot_count: number;
  entries: RecommendationDecisionEvidenceReadbackEntry[];
};

function isoTimestampOrNull(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) return null;

  const timestamp = new Date(value);
  return Number.isFinite(timestamp.getTime()) ? timestamp.toISOString() : null;
}

function snapshotSortTimestamp(snapshot: DecisionEvidenceSnapshot) {
  return (
    isoTimestampOrNull(snapshot.recommended_at) ??
    isoTimestampOrNull(snapshot.created_at)
  );
}

function compareSnapshotsByNewest(
  left: DecisionEvidenceSnapshot,
  right: DecisionEvidenceSnapshot,
) {
  const leftTimestamp = snapshotSortTimestamp(left);
  const rightTimestamp = snapshotSortTimestamp(right);
  const leftMillis = leftTimestamp ? Date.parse(leftTimestamp) : Number.NEGATIVE_INFINITY;
  const rightMillis = rightTimestamp
    ? Date.parse(rightTimestamp)
    : Number.NEGATIVE_INFINITY;

  if (leftMillis !== rightMillis) return rightMillis - leftMillis;

  return left.snapshot_fingerprint.localeCompare(right.snapshot_fingerprint);
}

function isServerOwnedDecisionEvidenceSnapshot(
  snapshot: DecisionEvidenceSnapshot,
) {
  return (
    snapshot.source_mode === "supabase" &&
    snapshot.is_demo !== true &&
    snapshot.is_mock !== true &&
    snapshot.payload_json.diagnostic_mode !== true
  );
}

function normalizeEntryLimit(limit: number | undefined) {
  if (!Number.isFinite(limit)) return DEFAULT_ENTRY_LIMIT;

  return Math.min(
    Math.max(Math.trunc(limit as number), 1),
    MAX_ENTRY_LIMIT,
  );
}

function readbackEntry(
  snapshot: DecisionEvidenceSnapshot,
): RecommendationDecisionEvidenceReadbackEntry {
  const provenance = recommendationDecisionSourceProvenanceFromSnapshot(snapshot);

  return {
    snapshot_fingerprint: snapshot.snapshot_fingerprint,
    ticker: snapshot.ticker,
    decision_timestamp: provenance.decision_timestamp,
    source_timestamp: provenance.source_timestamp,
    status: provenance.status,
    blockers: provenance.blockers,
    intraday_indicator_response_identity:
      provenance.intraday_indicator_response_identity,
    decision_feature_vector: provenance.decision_feature_vector,
    provider_source: provenance.provider_source,
    provider_version: provenance.provider_version,
    market_data_adapter_version: provenance.market_data_adapter_version,
    source_build_marker: provenance.source_build_marker,
  };
}

/**
 * Produces a bounded, decision-time audit readback for Engine Insights. It
 * accepts only persisted server-owned snapshots and projects them through the
 * same strict provenance parser used by learning-baseline admission. Raw
 * provider responses and malformed feature vectors are deliberately omitted.
 */
export function buildRecommendationDecisionEvidenceReadback({
  snapshots,
  limit,
}: {
  snapshots: DecisionEvidenceSnapshot[];
  limit?: number;
}): RecommendationDecisionEvidenceReadback {
  const serverOwnedSnapshots = snapshots.filter(
    isServerOwnedDecisionEvidenceSnapshot,
  );
  const entries = [...serverOwnedSnapshots]
    .sort(compareSnapshotsByNewest)
    .slice(0, normalizeEntryLimit(limit))
    .map(readbackEntry);
  const incompleteEntryCount = entries.filter(
    (entry) => entry.status === "incomplete",
  ).length;

  return {
    contract_version: RECOMMENDATION_DECISION_EVIDENCE_READBACK_VERSION,
    status:
      entries.length === 0
        ? "unavailable"
        : incompleteEntryCount > 0
          ? "partial"
          : "available",
    considered_snapshot_count: snapshots.length,
    server_owned_snapshot_count: serverOwnedSnapshots.length,
    excluded_non_server_owned_snapshot_count:
      snapshots.length - serverOwnedSnapshots.length,
    entries,
  };
}
