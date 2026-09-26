import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import type { LearningAccelerationResearchSample } from "@/lib/learning-acceleration-mode";
import type { RealScannerCandidate } from "@/lib/real-scanner-candidate-generation";
import {
  scannerIntradayLiquidityShadowAttributionFromUnknown,
  type ScannerIntradayLiquidityShadowAttribution,
} from "@/lib/scanner-ranking-intraday-liquidity-shadow-attribution";
import {
  scannerIntradayLiquidityShadowComparisonFromUnknown,
  type ScannerIntradayLiquidityShadowComparison,
} from "@/lib/scanner-ranking-intraday-liquidity-shadow";

export const SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION =
  "scanner_intraday_liquidity_shadow_evidence_capture_v1" as const;
export const SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_MAX_POPULATION = 100;

export type ScannerIntradayLiquidityShadowEvidenceSample =
  LearningAccelerationResearchSample & {
    candidate_id: string;
  };

export type ScannerIntradayLiquidityShadowEvidenceCaptureReceipt = {
  capture_version:
    typeof SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION;
  capture_kind: "scanner_intraday_liquidity_shadow_evidence_capture";
  status:
    | "not_applicable"
    | "ready"
    | "incomplete"
    | "conflicting"
    | "population_cap_exceeded";
  scan_run_id: string | null;
  scan_run_fingerprint: string | null;
  comparison_version: string | null;
  baseline_policy_version: string | null;
  shadow_policy_version: string | null;
  candidate_count: number;
  max_population_size: number;
  visible_snapshot_tickers: string[];
  research_snapshot_tickers: string[];
  missing_snapshot_tickers: string[];
  covered_candidate_count: number;
  complete_population_planned: boolean;
  provider_requests_added: 0;
  provider_credits_added: 0;
  live_ranking_effect: false;
  publication_effect: false;
  execution_effect: false;
  quality_improvement_claimed: false;
  reason_codes: string[];
};

export type ScannerIntradayLiquidityShadowEvidenceCapturePlan = {
  receipt: ScannerIntradayLiquidityShadowEvidenceCaptureReceipt;
  samples: ScannerIntradayLiquidityShadowEvidenceSample[];
};

function tickerKey(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.map(tickerKey).filter(Boolean))).sort();
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function exactTimestamp(value: string | null | undefined) {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString()
    : null;
}

function isOfficialWindow(scanWindow: IntradayScanWindow | "unknown") {
  return (
    scanWindow === "morning_momentum" ||
    scanWindow === "midday" ||
    scanWindow === "power_hour"
  );
}

function candidateGeometry(candidate: RealScannerCandidate) {
  const entryLow = finiteNumber(candidate.entry_low);
  const entryHigh = finiteNumber(candidate.entry_high);
  const stop = finiteNumber(candidate.stop_loss);
  const target = finiteNumber(candidate.target_1);
  const target2 = finiteNumber(candidate.target_2);
  const entry =
    entryLow !== null && entryHigh !== null
      ? (entryLow + entryHigh) / 2
      : entryHigh ?? entryLow;

  if (
    entryLow === null ||
    entryHigh === null ||
    entry === null ||
    stop === null ||
    target === null ||
    entryLow > entryHigh ||
    stop >= entry ||
    target <= entry
  ) {
    return null;
  }

  return { entryLow, entryHigh, entry, stop, target, target2 };
}

function receiptBase({
  comparison,
  attribution,
  maxPopulationSize,
}: {
  comparison: ScannerIntradayLiquidityShadowComparison | null;
  attribution: ScannerIntradayLiquidityShadowAttribution | null;
  maxPopulationSize: number;
}): Omit<
  ScannerIntradayLiquidityShadowEvidenceCaptureReceipt,
  | "status"
  | "visible_snapshot_tickers"
  | "research_snapshot_tickers"
  | "missing_snapshot_tickers"
  | "covered_candidate_count"
  | "complete_population_planned"
  | "reason_codes"
> {
  return {
    capture_version:
      SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_CAPTURE_VERSION,
    capture_kind: "scanner_intraday_liquidity_shadow_evidence_capture",
    scan_run_id: attribution?.scan_run_id ?? null,
    scan_run_fingerprint: attribution?.scan_run_fingerprint ?? null,
    comparison_version: comparison?.comparison_version ?? null,
    baseline_policy_version: comparison?.baseline_policy_version ?? null,
    shadow_policy_version: comparison?.shadow_policy_version ?? null,
    candidate_count: comparison?.candidate_count ?? 0,
    max_population_size: maxPopulationSize,
    provider_requests_added: 0,
    provider_credits_added: 0,
    live_ranking_effect: false,
    publication_effect: false,
    execution_effect: false,
    quality_improvement_claimed: false,
  };
}

/**
 * Plans owner-bound research snapshots for every ranked candidate in one
 * intraday-liquidity shadow comparison. It consumes only data already fetched
 * by the scan, adds no provider work and refuses to label a partial population
 * complete. Visible recommendations are counted only when the immutable
 * decision says that exact candidate was published.
 */
export function buildScannerIntradayLiquidityShadowEvidenceCapturePlan({
  comparison: comparisonInput,
  attribution: attributionInput,
  decisionRecord,
  candidates,
  visibleTickers = [],
  scanWindow,
  maxPopulationSize =
    SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_MAX_POPULATION,
}: {
  comparison: unknown;
  attribution: unknown;
  decisionRecord: CandidateDecisionRecord | null;
  candidates: RealScannerCandidate[];
  visibleTickers?: string[];
  scanWindow: IntradayScanWindow | "unknown";
  maxPopulationSize?: number;
}): ScannerIntradayLiquidityShadowEvidenceCapturePlan {
  const comparison =
    scannerIntradayLiquidityShadowComparisonFromUnknown(comparisonInput);
  const attribution =
    scannerIntradayLiquidityShadowAttributionFromUnknown(attributionInput);
  const maxPopulation = Math.max(
    0,
    Math.min(
      SCANNER_INTRADAY_LIQUIDITY_SHADOW_EVIDENCE_MAX_POPULATION,
      Math.floor(maxPopulationSize),
    ),
  );
  const base = receiptBase({
    comparison,
    attribution,
    maxPopulationSize: maxPopulation,
  });
  const empty = (
    status: ScannerIntradayLiquidityShadowEvidenceCaptureReceipt["status"],
    reasonCodes: string[],
    missingSnapshotTickers: string[] = [],
  ): ScannerIntradayLiquidityShadowEvidenceCapturePlan => ({
    receipt: {
      ...base,
      status,
      visible_snapshot_tickers: [],
      research_snapshot_tickers: [],
      missing_snapshot_tickers: uniqueSorted(missingSnapshotTickers),
      covered_candidate_count: 0,
      complete_population_planned: false,
      reason_codes: Array.from(new Set(reasonCodes)).sort(),
    },
    samples: [],
  });

  if (comparisonInput === null || comparisonInput === undefined) {
    return empty("not_applicable", ["shadow_comparison_not_present"]);
  }
  if (!comparison) {
    return empty("conflicting", ["shadow_comparison_invalid"]);
  }
  if (!attribution || !decisionRecord) {
    return empty(
      "conflicting",
      [
        !attribution
          ? "shadow_attribution_invalid_or_missing"
          : "candidate_decision_record_missing",
      ],
      comparison.candidate_tickers,
    );
  }
  if (!isOfficialWindow(scanWindow)) {
    return empty(
      "incomplete",
      ["scan_window_not_regular_session_research_window"],
      comparison.candidate_tickers,
    );
  }
  if (comparison.status !== "comparable" || attribution.status !== "attributed") {
    return empty(
      "conflicting",
      ["shadow_comparison_or_attribution_not_comparable"],
      comparison.candidate_tickers,
    );
  }
  if (
    attribution.scan_run_id !== decisionRecord.scan_run_id ||
    attribution.scan_run_fingerprint !== decisionRecord.scan_run_fingerprint ||
    attribution.comparison_version !== comparison.comparison_version ||
    attribution.candidate_count !== comparison.candidate_count
  ) {
    return empty(
      "conflicting",
      ["shadow_evidence_identity_mismatch"],
      comparison.candidate_tickers,
    );
  }
  if (
    comparison.candidate_count === 0 ||
    comparison.candidate_count > maxPopulation
  ) {
    return empty(
      comparison.candidate_count === 0
        ? "incomplete"
        : "population_cap_exceeded",
      [
        comparison.candidate_count === 0
          ? "ranked_population_empty"
          : "shadow_evidence_population_cap_exceeded",
      ],
      comparison.candidate_tickers,
    );
  }

  const visible = new Set(visibleTickers.map(tickerKey).filter(Boolean));
  const decisionCandidatesByTicker = new Map(
    decisionRecord.candidates.map((candidate) => [
      tickerKey(candidate.ticker),
      candidate,
    ]),
  );
  const realCandidatesByTicker = new Map<string, RealScannerCandidate[]>();
  for (const candidate of candidates) {
    const ticker = tickerKey(candidate.ticker);
    realCandidatesByTicker.set(ticker, [
      ...(realCandidatesByTicker.get(ticker) ?? []),
      candidate,
    ]);
  }
  const displacementByTicker = new Map(
    comparison.displacements.map((item) => [tickerKey(item.ticker), item]),
  );
  const visibleSnapshotTickers: string[] = [];
  const researchSnapshotTickers: string[] = [];
  const missingSnapshotTickers: string[] = [];
  const reasonCodes: string[] = [];
  const samples: ScannerIntradayLiquidityShadowEvidenceSample[] = [];

  for (const attributed of [...attribution.candidates].sort(
    (left, right) => left.baseline_rank - right.baseline_rank,
  )) {
    const ticker = tickerKey(attributed.ticker);
    const decisionCandidate = decisionCandidatesByTicker.get(ticker);
    const displacement = displacementByTicker.get(ticker);
    if (
      !decisionCandidate ||
      !decisionCandidate.ranking ||
      decisionCandidate.candidate_id !== attributed.candidate_id ||
      !displacement
    ) {
      missingSnapshotTickers.push(ticker);
      reasonCodes.push("candidate_decision_or_displacement_missing");
      continue;
    }

    if (visible.has(ticker)) {
      if (decisionCandidate.disposition !== "published") {
        missingSnapshotTickers.push(ticker);
        reasonCodes.push("visible_candidate_not_published_in_decision");
        continue;
      }
      visibleSnapshotTickers.push(ticker);
      continue;
    }
    if (decisionCandidate.disposition === "published") {
      missingSnapshotTickers.push(ticker);
      reasonCodes.push("published_candidate_missing_visible_snapshot_plan");
      continue;
    }
    if (
      decisionCandidate.disposition !== "selected_not_published" &&
      decisionCandidate.disposition !== "ranked_not_selected"
    ) {
      missingSnapshotTickers.push(ticker);
      reasonCodes.push("candidate_disposition_not_research_linkable");
      continue;
    }

    const realMatches = realCandidatesByTicker.get(ticker) ?? [];
    const candidate = realMatches.length === 1 ? realMatches[0]! : null;
    const sourceTimestamp = exactTimestamp(
      candidate?.reference_price_timestamp ?? candidate?.market_data_timestamp,
    );
    const decisionSourceTimestamp = exactTimestamp(
      decisionCandidate.data.source_timestamp,
    );
    const decisionTimestamp = Date.parse(decisionRecord.decision_timestamp);
    if (!candidate) {
      missingSnapshotTickers.push(ticker);
      reasonCodes.push("candidate_input_missing_or_duplicate");
      continue;
    }
    if (
      candidate.stale ||
      candidate.provider_source === null ||
      decisionCandidate.data.freshness !== "fresh" ||
      decisionCandidate.data.provider_source !== candidate.provider_source ||
      decisionCandidate.data.gap_codes.length > 0 ||
      sourceTimestamp === null ||
      decisionSourceTimestamp === null ||
      sourceTimestamp !== decisionSourceTimestamp ||
      !Number.isFinite(decisionTimestamp) ||
      Date.parse(sourceTimestamp) > decisionTimestamp
    ) {
      missingSnapshotTickers.push(ticker);
      reasonCodes.push("candidate_point_in_time_evidence_inadmissible");
      continue;
    }
    const geometry = candidateGeometry(candidate);
    if (!geometry) {
      missingSnapshotTickers.push(ticker);
      reasonCodes.push("candidate_trade_geometry_invalid");
      continue;
    }
    if (
      Math.abs(decisionCandidate.ranking.score - displacement.baseline_score) >
        0.000001 ||
      decisionCandidate.ranking.rank !== displacement.baseline_rank ||
      decisionCandidate.ranking.tier !== displacement.baseline_tier ||
      decisionCandidate.ranking.selected !== displacement.baseline_selected
    ) {
      missingSnapshotTickers.push(ticker);
      reasonCodes.push("baseline_ranking_evidence_conflict");
      continue;
    }

    samples.push({
      candidate_id: decisionCandidate.candidate_id,
      ticker,
      company_name: candidate.company_name,
      tier: candidate.tier,
      score: displacement.baseline_score,
      rank: displacement.baseline_rank,
      entry_low: geometry.entryLow,
      entry_high: geometry.entryHigh,
      entry: geometry.entry,
      stop: geometry.stop,
      target: geometry.target,
      target_2: geometry.target2,
      risk_reward: finiteNumber(candidate.risk_reward),
      provider_source: candidate.provider_source,
      market_data_source: candidate.data_source ?? null,
      market_data_timestamp: sourceTimestamp,
      intraday_indicator_response_identity:
        candidate.intraday_indicator_response_identity,
      decision_feature_vector: candidate.decision_feature_vector,
      rejection_publish_reason:
        "intraday_liquidity_shadow_full_population_research",
      sample_quality: "good",
      ranking_reason: decisionCandidate.ranking.rank_reason,
      ranking_warnings: decisionCandidate.ranking.warnings.map(
        (warning) => warning.message,
      ),
      explicit_metadata_gaps: [],
    });
    researchSnapshotTickers.push(ticker);
  }

  const covered = uniqueSorted([
    ...visibleSnapshotTickers,
    ...researchSnapshotTickers,
  ]);
  const required = uniqueSorted(comparison.candidate_tickers);
  const missing = uniqueSorted([
    ...missingSnapshotTickers,
    ...required.filter((ticker) => !covered.includes(ticker)),
  ]);
  const complete =
    missing.length === 0 &&
    covered.length === comparison.candidate_count &&
    samples.length === researchSnapshotTickers.length;

  return {
    receipt: {
      ...base,
      status: complete ? "ready" : "incomplete",
      visible_snapshot_tickers: uniqueSorted(visibleSnapshotTickers),
      research_snapshot_tickers: uniqueSorted(researchSnapshotTickers),
      missing_snapshot_tickers: missing,
      covered_candidate_count: covered.length,
      complete_population_planned: complete,
      reason_codes: complete
        ? []
        : Array.from(new Set(reasonCodes)).sort(),
    },
    samples,
  };
}
