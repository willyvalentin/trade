import { expect, test } from "@playwright/test";

import { buildRejectedCandidateResearchSelection } from "@/lib/rejected-candidate-research-selection";
import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import type { RealScannerCandidate } from "@/lib/real-scanner-candidate-generation";

const OBSERVED_AT = "2026-09-17T14:30:00.000Z";

function candidate(
  overrides: Partial<RealScannerCandidate> = {},
): RealScannerCandidate {
  return {
    ticker: "REJ",
    company_name: "Rejected Incorporated",
    sector: "Technology",
    tier: "rejected",
    score: { value: 54, tier: "rejected", reasons: [], warnings: [] },
    signals: [],
    warnings: [],
    data_source: "fresh",
    provider_source: "twelve_data",
    market_data_timestamp: OBSERVED_AT,
    reference_price_timestamp: OBSERVED_AT,
    stale: false,
    entry_low: 99,
    entry_high: 100,
    stop_loss: 96,
    target_1: 106,
    target_2: 110,
    risk_reward: 2,
    ...overrides,
  };
}

function record(
  overrides: Record<string, unknown> = {},
): CandidateDecisionRecord {
  return {
    decision_timestamp: OBSERVED_AT,
    candidates: [
      {
        candidate_id: "scanner_candidate:v1:scan-1:REJ",
        ticker: "REJ",
        disposition: "filtered_before_ranking",
        reason_codes: ["current_recommendation_exists"],
        data: {
          provider_source: "twelve_data",
          source_timestamp: OBSERVED_AT,
          freshness: "fresh",
          gap_codes: [],
        },
      },
    ],
    ...overrides,
  } as unknown as CandidateDecisionRecord;
}

test("selects only a fresh, exact rejected candidate with pre-existing valid scanner geometry", () => {
  const selection = buildRejectedCandidateResearchSelection({
    enabled: true,
    record: record(),
    candidates: [candidate()],
    scanWindow: "morning_momentum",
    maxSamples: 1,
  });

  expect(selection.samples).toEqual([
    expect.objectContaining({
      candidate_id: "scanner_candidate:v1:scan-1:REJ",
      ticker: "REJ",
      entry: 99.5,
      stop: 96,
      target: 106,
      provider_source: "twelve_data",
      market_data_source: "fresh",
      market_data_timestamp: OBSERVED_AT,
    }),
  ]);
  expect(selection).toMatchObject({
    rejected_candidates_considered_count: 1,
    skipped_candidate_input_mismatch_count: 0,
    skipped_not_fresh_count: 0,
    skipped_invalid_geometry_count: 0,
  });
});

test("fails closed for stale, mismatched, or geometry-incomplete rejected inputs", () => {
  const stale = buildRejectedCandidateResearchSelection({
    enabled: true,
    record: record(),
    candidates: [candidate({ stale: true })],
    scanWindow: "morning_momentum",
    maxSamples: 1,
  });
  expect(stale.samples).toEqual([]);
  expect(stale.skipped_not_fresh_count).toBe(1);

  const shiftedTimestamp = buildRejectedCandidateResearchSelection({
    enabled: true,
    record: record(),
    candidates: [
      candidate({
        market_data_timestamp: "2026-09-17T14:31:00.000Z",
        reference_price_timestamp: "2026-09-17T14:31:00.000Z",
      }),
    ],
    scanWindow: "morning_momentum",
    maxSamples: 1,
  });
  expect(shiftedTimestamp.samples).toEqual([]);
  expect(shiftedTimestamp.skipped_not_fresh_count).toBe(1);

  const missingStop = buildRejectedCandidateResearchSelection({
    enabled: true,
    record: record(),
    candidates: [candidate({ stop_loss: null })],
    scanWindow: "morning_momentum",
    maxSamples: 1,
  });
  expect(missingStop.samples).toEqual([]);
  expect(missingStop.skipped_invalid_geometry_count).toBe(1);

  const futureSource = buildRejectedCandidateResearchSelection({
    enabled: true,
    record: record({ decision_timestamp: "2026-09-17T14:29:59.000Z" }),
    candidates: [candidate()],
    scanWindow: "morning_momentum",
    maxSamples: 1,
  });
  expect(futureSource.samples).toEqual([]);
  expect(futureSource.skipped_not_fresh_count).toBe(1);
});

test("uses the captured reference-price time rather than an unrelated cache-write time", () => {
  const selection = buildRejectedCandidateResearchSelection({
    enabled: true,
    record: record(),
    candidates: [
      candidate({
        market_data_timestamp: "2026-09-17T14:30:02.000Z",
        reference_price_timestamp: OBSERVED_AT,
      }),
    ],
    scanWindow: "morning_momentum",
    maxSamples: 1,
  });

  expect(selection.samples).toHaveLength(1);
  expect(selection.samples[0]?.market_data_timestamp).toBe(OBSERVED_AT);
});

test("fails closed when the candidate input is absent or ambiguous", () => {
  const absent = buildRejectedCandidateResearchSelection({
    enabled: true,
    record: record(),
    candidates: [],
    scanWindow: "morning_momentum",
    maxSamples: 1,
  });
  expect(absent.samples).toEqual([]);
  expect(absent.skipped_candidate_input_mismatch_count).toBe(1);

  const ambiguous = buildRejectedCandidateResearchSelection({
    enabled: true,
    record: record(),
    candidates: [candidate(), candidate({ company_name: "Duplicate" })],
    scanWindow: "morning_momentum",
    maxSamples: 1,
  });
  expect(ambiguous.samples).toEqual([]);
  expect(ambiguous.skipped_candidate_input_mismatch_count).toBe(1);

  const ambiguousDecision = buildRejectedCandidateResearchSelection({
    enabled: true,
    record: record({
      candidates: [
        ...(record().candidates as CandidateDecisionRecord["candidates"]),
        {
          ...(record().candidates[0] as CandidateDecisionRecord["candidates"][number]),
          candidate_id: "scanner_candidate:v1:scan-1:REJ:duplicate",
          disposition: "ranked_not_selected",
        },
      ],
    }),
    candidates: [candidate()],
    scanWindow: "morning_momentum",
    maxSamples: 1,
  });
  expect(ambiguousDecision.samples).toEqual([]);
  expect(ambiguousDecision.skipped_candidate_input_mismatch_count).toBe(1);
});

test("does not create a rejected research sample outside an official scan window", () => {
  const selection = buildRejectedCandidateResearchSelection({
    enabled: true,
    record: record(),
    candidates: [candidate()],
    scanWindow: "closed",
    maxSamples: 1,
  });

  expect(selection.samples).toEqual([]);
});
