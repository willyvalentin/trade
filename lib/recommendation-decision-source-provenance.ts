import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export const RECOMMENDATION_DECISION_SOURCE_PROVENANCE_VERSION =
  "recommendation_decision_source_provenance_v1" as const;

export const recommendationDecisionSourceProvenanceBlockers = [
  "decision_timestamp_missing_or_invalid",
  "source_timestamp_missing_or_invalid",
  "source_timestamp_after_decision",
  "provider_source_missing",
  "provider_version_missing",
  "market_data_adapter_version_missing",
  "source_build_marker_missing",
] as const;

export type RecommendationDecisionSourceProvenanceBlocker =
  (typeof recommendationDecisionSourceProvenanceBlockers)[number];

export type RecommendationDecisionSourceProvenance = {
  contract_version: typeof RECOMMENDATION_DECISION_SOURCE_PROVENANCE_VERSION;
  status: "admissible" | "incomplete";
  decision_timestamp: string | null;
  source_timestamp: string | null;
  provider_source: string | null;
  provider_version: string | null;
  market_data_adapter_version: string | null;
  source_build_marker: string | null;
  blockers: RecommendationDecisionSourceProvenanceBlocker[];
};

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isoOrNull(value: unknown) {
  const text = textOrNull(value);
  if (!text) return null;

  const date = new Date(text);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

/**
 * Returns the narrow data-lineage gate used before a persisted decision can
 * contribute to a learning baseline. It deliberately does not infer a missing
 * provider version from a plan name, API key, or Ture adapter version: a later
 * freeze must retain that evidence gap rather than claim a reproducible input.
 */
export function recommendationDecisionSourceProvenanceFromSnapshot(
  snapshot: Pick<RecommendationSnapshot, "recommended_at" | "payload_json">,
): RecommendationDecisionSourceProvenance {
  const decisionTimestamp = isoOrNull(snapshot.recommended_at);
  const sourceTimestamp = isoOrNull(snapshot.payload_json.data_timestamp);
  const providerSource = textOrNull(snapshot.payload_json.provider_source);
  const providerVersion = textOrNull(snapshot.payload_json.provider_version);
  const adapterVersion = textOrNull(
    snapshot.payload_json.market_data_adapter_version,
  );
  const buildMarker = textOrNull(snapshot.payload_json.build_marker);
  const blockers: RecommendationDecisionSourceProvenanceBlocker[] = [];

  if (!decisionTimestamp) {
    blockers.push("decision_timestamp_missing_or_invalid");
  }
  if (!sourceTimestamp) {
    blockers.push("source_timestamp_missing_or_invalid");
  }
  if (
    decisionTimestamp &&
    sourceTimestamp &&
    Date.parse(sourceTimestamp) > Date.parse(decisionTimestamp)
  ) {
    blockers.push("source_timestamp_after_decision");
  }
  if (!providerSource) {
    blockers.push("provider_source_missing");
  }
  if (!providerVersion) {
    blockers.push("provider_version_missing");
  }
  if (!adapterVersion) {
    blockers.push("market_data_adapter_version_missing");
  }
  if (!buildMarker) {
    blockers.push("source_build_marker_missing");
  }

  return {
    contract_version: RECOMMENDATION_DECISION_SOURCE_PROVENANCE_VERSION,
    status: blockers.length === 0 ? "admissible" : "incomplete",
    decision_timestamp: decisionTimestamp,
    source_timestamp: sourceTimestamp,
    provider_source: providerSource,
    provider_version: providerVersion,
    market_data_adapter_version: adapterVersion,
    source_build_marker: buildMarker,
    blockers,
  };
}
