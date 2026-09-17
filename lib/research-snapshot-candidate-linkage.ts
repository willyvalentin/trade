import type {
  CandidateDecisionDisposition,
  CandidateDecisionRecord,
} from "@/lib/candidate-decision-record";

export const RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION =
  "research_snapshot_candidate_decision_linkage_v1" as const;

export type ResearchSnapshotCandidateDecisionLink = {
  linkage_version: typeof RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION;
  linkage_status: "verified" | "unavailable";
  candidate_id: string | null;
  candidate_disposition:
    | Extract<
        CandidateDecisionDisposition,
        "selected_not_published" | "ranked_not_selected"
      >
  | null;
};

type ResearchEligibleCandidate = CandidateDecisionRecord["candidates"][number] & {
  disposition: "selected_not_published" | "ranked_not_selected";
};

function normalizedTicker(value: string) {
  return value.trim().toUpperCase();
}

/**
 * A research-only plan may be evaluated only when it is bound to exactly one
 * non-published immutable candidate in the scan's decision record. Ticker-only
 * matching is deliberately insufficient once the decision leaves the writer.
 */
export function linkResearchSnapshotToCandidateDecision({
  record,
  ticker,
}: {
  record: CandidateDecisionRecord | null;
  ticker: string;
}): ResearchSnapshotCandidateDecisionLink {
  const matches = (record?.candidates ?? []).filter(
    (candidate): candidate is ResearchEligibleCandidate =>
      normalizedTicker(candidate.ticker) === normalizedTicker(ticker) &&
      (candidate.disposition === "selected_not_published" ||
        candidate.disposition === "ranked_not_selected"),
  );

  if (matches.length !== 1) {
    return {
      linkage_version: RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION,
      linkage_status: "unavailable",
      candidate_id: null,
      candidate_disposition: null,
    };
  }

  const candidate = matches[0];

  return {
    linkage_version: RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION,
    linkage_status: "verified",
    candidate_id: candidate.candidate_id,
    candidate_disposition: candidate.disposition,
  };
}
