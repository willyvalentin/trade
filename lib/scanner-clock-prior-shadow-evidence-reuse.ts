import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import {
  scannerClockPriorShadowAttributionFromUnknown,
} from "@/lib/scanner-ranking-clock-prior-shadow-attribution";
import {
  scannerClockPriorShadowComparisonFromUnknown,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import type {
  ScannerIntradayLiquidityShadowEvidenceCaptureReceipt,
  ScannerIntradayLiquidityShadowEvidenceSample,
} from "@/lib/scanner-intraday-liquidity-shadow-evidence-capture";
import { isScannerIntradayLiquidityShadowEvidenceCaptureVersion } from "@/lib/scanner-intraday-liquidity-shadow-evidence-contract";

export const SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION =
  "scanner_clock_prior_shadow_evidence_reuse_v1" as const;

export type ScannerClockPriorShadowEvidenceReuseReceipt = {
  reuse_version: typeof SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION;
  reuse_kind: "scanner_clock_prior_shadow_evidence_reuse";
  status: "not_applicable" | "ready" | "incomplete" | "conflicting";
  scan_run_id: string | null;
  scan_run_fingerprint: string | null;
  comparison_version: string | null;
  baseline_policy_version: string | null;
  shadow_policy_version: string | null;
  candidate_count: number;
  visible_snapshot_tickers: string[];
  research_snapshot_tickers: string[];
  missing_snapshot_tickers: string[];
  covered_candidate_count: number;
  complete_population_reused: boolean;
  source_capture_version: string | null;
  provider_requests_added: 0;
  provider_credits_added: 0;
  live_ranking_effect: false;
  publication_effect: false;
  execution_effect: false;
  quality_improvement_claimed: false;
  reason_codes: string[];
};

export type ScannerClockPriorShadowEvidenceReusePlan = {
  receipt: ScannerClockPriorShadowEvidenceReuseReceipt;
  samples: ScannerIntradayLiquidityShadowEvidenceSample[];
};

function ticker(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.map(ticker).filter(Boolean))).sort();
}

function sameValues(left: string[], right: string[]) {
  return uniqueSorted(left).join("|") === uniqueSorted(right).join("|");
}

/**
 * Proves that the clock-prior experiment can reuse the already captured exact
 * ranked population. Both shadows are produced from the same immutable
 * decision boundary, so duplicating snapshots would create ambiguous outcome
 * joins. Reuse is accepted only when every identity and coverage count agrees.
 */
export function buildScannerClockPriorShadowEvidenceReusePlan({
  comparison: comparisonInput,
  attribution: attributionInput,
  decisionRecord,
  sharedCapture,
  sharedSamples,
}: {
  comparison: unknown;
  attribution: unknown;
  decisionRecord: CandidateDecisionRecord | null;
  sharedCapture: ScannerIntradayLiquidityShadowEvidenceCaptureReceipt;
  sharedSamples: ScannerIntradayLiquidityShadowEvidenceSample[];
}): ScannerClockPriorShadowEvidenceReusePlan {
  const comparison = scannerClockPriorShadowComparisonFromUnknown(
    comparisonInput,
  );
  const attribution = scannerClockPriorShadowAttributionFromUnknown(
    attributionInput,
  );
  const base = {
    reuse_version: SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION,
    reuse_kind: "scanner_clock_prior_shadow_evidence_reuse" as const,
    scan_run_id: attribution?.scan_run_id ?? null,
    scan_run_fingerprint: attribution?.scan_run_fingerprint ?? null,
    comparison_version: comparison?.comparison_version ?? null,
    baseline_policy_version: comparison?.baseline_policy_version ?? null,
    shadow_policy_version: comparison?.shadow_policy_version ?? null,
    candidate_count: comparison?.candidate_count ?? 0,
    source_capture_version: sharedCapture.capture_version ?? null,
    provider_requests_added: 0 as const,
    provider_credits_added: 0 as const,
    live_ranking_effect: false as const,
    publication_effect: false as const,
    execution_effect: false as const,
    quality_improvement_claimed: false as const,
  };
  const terminal = (
    status: ScannerClockPriorShadowEvidenceReuseReceipt["status"],
    reasonCodes: string[],
    visible: string[] = [],
    research: string[] = [],
    missing: string[] = comparison?.candidate_tickers ?? [],
    samples: ScannerIntradayLiquidityShadowEvidenceSample[] = [],
  ): ScannerClockPriorShadowEvidenceReusePlan => ({
    receipt: {
      ...base,
      status,
      visible_snapshot_tickers: uniqueSorted(visible),
      research_snapshot_tickers: uniqueSorted(research),
      missing_snapshot_tickers: uniqueSorted(missing),
      covered_candidate_count: uniqueSorted([...visible, ...research]).length,
      complete_population_reused:
        status === "ready" && uniqueSorted(missing).length === 0,
      reason_codes: Array.from(new Set(reasonCodes)).sort(),
    },
    samples,
  });

  if (comparisonInput === null || comparisonInput === undefined) {
    return terminal("not_applicable", ["clock_prior_comparison_not_present"]);
  }
  if (!comparison || !attribution || !decisionRecord) {
    return terminal("conflicting", [
      !comparison
        ? "clock_prior_comparison_invalid"
        : !attribution
          ? "clock_prior_attribution_invalid_or_missing"
          : "candidate_decision_record_missing",
    ]);
  }
  if (comparison.status !== "comparable" || attribution.status !== "attributed") {
    return terminal("conflicting", [
      "clock_prior_comparison_or_attribution_not_comparable",
    ]);
  }
  // Keep this boundary identical to the attribution builder: provider gaps and
  // pre-ranking rejections remain in the complete decision record but are not
  // members of the ranked comparison population.
  const rankedDecisionCandidates = decisionRecord.candidates.filter(
    (candidate) => candidate.ranking !== null,
  );
  const rankedDecisionTickers = rankedDecisionCandidates.map((candidate) =>
    ticker(candidate.ticker),
  );
  const attributedTickers = attribution.candidates.map((candidate) =>
    ticker(candidate.ticker),
  );
  if (
    attribution.scan_run_id !== decisionRecord.scan_run_id ||
    attribution.scan_run_fingerprint !== decisionRecord.scan_run_fingerprint ||
    attribution.comparison_version !== comparison.comparison_version ||
    attribution.candidate_count !== comparison.candidate_count ||
    attribution.candidate_count !== rankedDecisionCandidates.length ||
    !sameValues(rankedDecisionTickers, comparison.candidate_tickers) ||
    !sameValues(attributedTickers, comparison.candidate_tickers)
  ) {
    return terminal("conflicting", ["clock_prior_evidence_identity_mismatch"]);
  }

  if (comparison.candidate_count === 0) {
    return terminal("ready", [], [], [], [], []);
  }

  const sharedVisible = uniqueSorted(sharedCapture.visible_snapshot_tickers);
  const sharedResearch = uniqueSorted(sharedCapture.research_snapshot_tickers);
  const sharedCovered = uniqueSorted([...sharedVisible, ...sharedResearch]);
  if (
    sharedCapture.status !== "ready" ||
    sharedCapture.complete_population_planned !== true ||
    sharedCapture.scan_run_id !== attribution.scan_run_id ||
    sharedCapture.scan_run_fingerprint !== attribution.scan_run_fingerprint ||
    sharedCapture.candidate_count !== comparison.candidate_count ||
    sharedCapture.covered_candidate_count !== comparison.candidate_count ||
    !sameValues(sharedCovered, comparison.candidate_tickers)
  ) {
    return terminal("incomplete", [
      "shared_full_population_capture_not_reusable",
    ]);
  }

  const decisionByTicker = new Map(
    decisionRecord.candidates.map((candidate) => [
      ticker(candidate.ticker),
      candidate,
    ]),
  );
  const attributedByTicker = new Map(
    attribution.candidates.map((candidate) => [ticker(candidate.ticker), candidate]),
  );
  const samplesByTicker = new Map<string, ScannerIntradayLiquidityShadowEvidenceSample[]>();
  for (const sample of sharedSamples) {
    const key = ticker(sample.ticker);
    samplesByTicker.set(key, [...(samplesByTicker.get(key) ?? []), sample]);
  }
  const missing: string[] = [];
  const reusedSamples: ScannerIntradayLiquidityShadowEvidenceSample[] = [];
  for (const candidateTicker of comparison.candidate_tickers) {
    const key = ticker(candidateTicker);
    const decision = decisionByTicker.get(key);
    const attributed = attributedByTicker.get(key);
    if (
      !decision ||
      !attributed ||
      decision.candidate_id !== attributed.candidate_id
    ) {
      missing.push(key);
      continue;
    }
    if (sharedVisible.includes(key)) {
      if (decision.disposition !== "published") missing.push(key);
      continue;
    }
    const matches = samplesByTicker.get(key) ?? [];
    if (
      !sharedResearch.includes(key) ||
      matches.length !== 1 ||
      matches[0]!.candidate_id !== attributed.candidate_id
    ) {
      missing.push(key);
      continue;
    }
    reusedSamples.push(matches[0]!);
  }

  if (missing.length > 0 || reusedSamples.length !== sharedResearch.length) {
    return terminal(
      "conflicting",
      ["shared_candidate_identity_or_snapshot_coverage_conflicting"],
      sharedVisible,
      sharedResearch,
      missing,
    );
  }

  return terminal(
    "ready",
    [],
    sharedVisible,
    sharedResearch,
    [],
    reusedSamples,
  );
}

export function scannerClockPriorShadowEvidenceReuseReceiptFromUnknown(
  value: unknown,
): ScannerClockPriorShadowEvidenceReuseReceipt | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const receipt = value as Partial<ScannerClockPriorShadowEvidenceReuseReceipt>;
  if (
    receipt.reuse_version !== SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION ||
    receipt.reuse_kind !== "scanner_clock_prior_shadow_evidence_reuse" ||
    !["not_applicable", "ready", "incomplete", "conflicting"].includes(
      String(receipt.status),
    ) ||
    !Number.isInteger(receipt.candidate_count) ||
    (receipt.candidate_count ?? -1) < 0 ||
    !Array.isArray(receipt.visible_snapshot_tickers) ||
    !Array.isArray(receipt.research_snapshot_tickers) ||
    !Array.isArray(receipt.missing_snapshot_tickers) ||
    !Array.isArray(receipt.reason_codes) ||
    !Number.isInteger(receipt.covered_candidate_count) ||
    (receipt.covered_candidate_count ?? -1) < 0 ||
    typeof receipt.complete_population_reused !== "boolean" ||
    receipt.provider_requests_added !== 0 ||
    receipt.provider_credits_added !== 0 ||
    receipt.live_ranking_effect !== false ||
    receipt.publication_effect !== false ||
    receipt.execution_effect !== false ||
    receipt.quality_improvement_claimed !== false ||
    (receipt.source_capture_version !== null &&
      !isScannerIntradayLiquidityShadowEvidenceCaptureVersion(
        receipt.source_capture_version,
      ))
  ) {
    return null;
  }
  const arrays = [
    receipt.visible_snapshot_tickers,
    receipt.research_snapshot_tickers,
    receipt.missing_snapshot_tickers,
    receipt.reason_codes,
  ];
  if (arrays.some((items) => items.some((item) => typeof item !== "string"))) {
    return null;
  }
  const visible = uniqueSorted(receipt.visible_snapshot_tickers);
  const research = uniqueSorted(receipt.research_snapshot_tickers);
  const missing = uniqueSorted(receipt.missing_snapshot_tickers);
  const listedPopulation = uniqueSorted([...visible, ...research, ...missing]);
  const listedCoveredPopulation = uniqueSorted([...visible, ...research]);
  if (
    visible.length !== receipt.visible_snapshot_tickers.length ||
    research.length !== receipt.research_snapshot_tickers.length ||
    missing.length !== receipt.missing_snapshot_tickers.length ||
    listedPopulation.length !== receipt.candidate_count ||
    listedCoveredPopulation.length !== receipt.covered_candidate_count ||
    visible.some((item) => research.includes(item))
  ) {
    return null;
  }
  if (
    receipt.status === "ready" &&
    (receipt.complete_population_reused !== true ||
      !isScannerIntradayLiquidityShadowEvidenceCaptureVersion(
        receipt.source_capture_version,
      ) ||
      missing.length > 0 ||
      receipt.covered_candidate_count !== receipt.candidate_count)
  ) {
    return null;
  }
  if (
    receipt.status !== "ready" &&
    receipt.complete_population_reused !== false
  ) {
    return null;
  }
  return receipt as ScannerClockPriorShadowEvidenceReuseReceipt;
}
