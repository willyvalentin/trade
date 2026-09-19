import { expect, test } from "@playwright/test";

import {
  linkResearchSnapshotToCandidateDecision,
  RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION,
} from "@/lib/research-snapshot-candidate-linkage";
import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";

const record = {
  candidates: [
    {
      candidate_id: "scanner_candidate:v1:scan-1:ABC",
      ticker: "ABC",
      disposition: "selected_not_published" as const,
    },
    {
      candidate_id: "scanner_candidate:v1:scan-1:XYZ",
      ticker: "XYZ",
      disposition: "published" as const,
    },
    {
      candidate_id: "scanner_candidate:v1:scan-1:REJ",
      ticker: "REJ",
      disposition: "filtered_before_ranking" as const,
    },
  ],
} as unknown as CandidateDecisionRecord;

test("research snapshot linkage is exact, normalized, and excludes published candidates", () => {
  expect(
    linkResearchSnapshotToCandidateDecision({ record, ticker: " abc " }),
  ).toEqual({
    linkage_version: RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION,
    linkage_status: "verified",
    candidate_id: "scanner_candidate:v1:scan-1:ABC",
    candidate_disposition: "selected_not_published",
  });

  expect(
    linkResearchSnapshotToCandidateDecision({ record, ticker: "XYZ" }),
  ).toMatchObject({
    linkage_status: "unavailable",
    candidate_id: null,
    candidate_disposition: null,
  });

  expect(
    linkResearchSnapshotToCandidateDecision({ record, ticker: "rej" }),
  ).toEqual({
    linkage_version: RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION,
    linkage_status: "verified",
    candidate_id: "scanner_candidate:v1:scan-1:REJ",
    candidate_disposition: "filtered_before_ranking",
  });
});

test("research snapshot linkage fails closed for absent or ambiguous candidates", () => {
  expect(
    linkResearchSnapshotToCandidateDecision({ record: null, ticker: "ABC" }),
  ).toMatchObject({ linkage_status: "unavailable", candidate_id: null });

  const ambiguous = {
    candidates: [
      record.candidates[0],
      {
        candidate_id: "scanner_candidate:v1:scan-1:ABC:duplicate",
        ticker: "ABC",
        disposition: "ranked_not_selected" as const,
      },
    ],
  } as unknown as CandidateDecisionRecord;

  expect(
    linkResearchSnapshotToCandidateDecision({ record: ambiguous, ticker: "ABC" }),
  ).toMatchObject({ linkage_status: "unavailable", candidate_id: null });
});
