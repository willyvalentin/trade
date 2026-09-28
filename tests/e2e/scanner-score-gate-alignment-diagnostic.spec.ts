import { expect, test } from "@playwright/test";

import type { ScanLogEntry } from "@/lib/scan-log-core";
import {
  buildScannerScoreGateAlignmentCohortDiagnostic,
  scannerScoreGateAlignmentCohortDiagnosticFromUnknown,
  scannerScoreGateAlignmentDiagnosticFromScanLog,
  scannerScoreGateAlignmentDiagnosticFromUnknown,
} from "@/lib/scanner-score-gate-alignment-diagnostic";

function scanLog({
  ticker = "NVO",
  rankingScore = 77,
  localScore = 59,
  threshold = 60,
  built = false,
}: {
  ticker?: string;
  rankingScore?: number;
  localScore?: number;
  threshold?: number;
  built?: boolean;
} = {}): ScanLogEntry {
  return {
    created_at: "2026-09-28T18:15:40.548Z",
    source: "scheduled",
    scan_window: "continuous",
    market_status: "open",
    result: built ? "recommendation_created" : "no_high_quality_setup",
    message: "fixture",
    recommendations_created: built ? 1 : 0,
    publishable_threshold: threshold,
    scanner_candidate_ranking: {
      selected_count: 1,
      results: [
        {
          ticker,
          rank: 1,
          selected: true,
          score: {
            normalized_score: rankingScore,
            tier: "valid",
          },
        },
      ],
      selection: { selected_tickers: [ticker] },
    },
    selected_candidate_build_diagnostics: [
      {
        ticker,
        score: localScore,
        built,
        rejection_reason: built ? "built" : "below_publish_threshold",
      },
    ],
  } as unknown as ScanLogEntry;
}

test("exposes the reproduced 77-to-59 dual-score gate without changing authority", () => {
  const result = scannerScoreGateAlignmentDiagnosticFromScanLog(scanLog(), true);

  expect(result).toMatchObject({
    status: "observed",
    publishable_threshold: 60,
    reason_codes: ["ranking_and_local_score_gate_diverge"],
    counts: {
      selected: 1,
      ranking_qualified_local_block: 1,
      built: 0,
    },
    candidates: [
      {
        ticker: "NVO",
        ranking_score: 77,
        local_score: 59,
        score_gap: 18,
        ranking_gate_passed: true,
        local_publish_gate_passed: false,
        alignment: "ranking_qualified_local_block",
      },
    ],
  });
  expect(Object.values(result.authority).every((value) => value === false)).toBe(
    true,
  );
  expect(scannerScoreGateAlignmentDiagnosticFromUnknown(result)).toEqual(result);
  expect(
    scannerScoreGateAlignmentDiagnosticFromUnknown({
      ...result,
      candidates: result.candidates.map((candidate) => ({
        ...candidate,
        built: true,
        rejection_reason: "built",
      })),
      counts: { ...result.counts, built: 1 },
    }).status,
  ).toBe("invalid");
});

test("keeps genuinely aligned candidates separate from score-contract divergence", () => {
  const result = scannerScoreGateAlignmentDiagnosticFromScanLog(
    scanLog({ localScore: 68, built: true }),
    true,
  );

  expect(result).toMatchObject({
    status: "observed",
    reason_codes: ["ranking_and_local_score_gate_aligned"],
    counts: {
      aligned_qualified: 1,
      ranking_qualified_local_block: 0,
      built: 1,
    },
  });
});

test("fails closed when selected ranking and build denominators do not match", () => {
  const input = scanLog();
  input.selected_candidate_build_diagnostics = [];

  expect(scannerScoreGateAlignmentDiagnosticFromScanLog(input, true)).toMatchObject({
    status: "invalid",
    reason_codes: ["score_gate_alignment_inconsistent"],
  });
});

test("requires repeated cycles before prioritizing score-semantic unification", () => {
  const divergent = scannerScoreGateAlignmentDiagnosticFromScanLog(scanLog(), true);
  const one = buildScannerScoreGateAlignmentCohortDiagnostic([divergent]);
  expect(one).toMatchObject({
    status: "insufficient_evidence",
    signal: "insufficient_evidence",
    investigation_priority: "observe_more",
  });

  const repeated = buildScannerScoreGateAlignmentCohortDiagnostic([
    divergent,
    divergent,
  ]);
  expect(repeated).toMatchObject({
    status: "available",
    cycle_counts: { observed: 2, with_divergence: 2 },
    candidate_counts: { ranking_qualified_local_block: 2 },
    score_gap: { average: 18, maximum: 18 },
    signal: "repeated_score_contract_divergence",
    investigation_priority: "unify_score_gate_semantics",
  });
  expect(
    scannerScoreGateAlignmentCohortDiagnosticFromUnknown(repeated),
  ).not.toBeNull();
  expect(
    scannerScoreGateAlignmentCohortDiagnosticFromUnknown({
      ...repeated,
      cycle_counts: { ...repeated.cycle_counts, with_divergence: 0 },
    }),
  ).toBeNull();
  expect(
    scannerScoreGateAlignmentCohortDiagnosticFromUnknown({
      ...repeated,
      score_gap: { ...repeated.score_gap, maximum: null },
    }),
  ).toBeNull();
});
