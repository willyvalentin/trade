import { expect, test } from "@playwright/test";

import {
  buildCandidateDecisionCapture,
  buildCandidateDecisionRecord,
} from "@/lib/candidate-decision-record";
import { buildCandidateDecisionLearningAttribution } from "@/lib/candidate-decision-learning-attribution";
import { buildRecommendationLearningBaselineReadiness } from "@/lib/recommendation-learning-baseline-readiness";
import { buildRecommendationLearningBaselineSegmentation } from "@/lib/recommendation-learning-baseline-segments";
import { buildRecommendationLearningEvaluationPlans } from "@/lib/recommendation-learning-evaluation-plan";
import { CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION } from "@/lib/recommendation-outcome-canonical-coverage";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import { computeRecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION } from "@/lib/research-snapshot-candidate-linkage";
import { buildRecommendationScanRun } from "@/lib/recommendation-scan-run";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { buildScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import type { ScannerCandidate } from "@/lib/scanner";

const DECIDED_AT = "2026-09-17T14:30:00.000Z";

function candidate(ticker = "TST"): ScannerCandidate & { local_score: number } {
  return {
    ticker,
    company_name: `${ticker} Incorporated`,
    sector: "Technology",
    mock_current_price: 100,
    mock_trend: "uptrend",
    mock_volume_context: "expanding volume",
    mock_support: 96,
    mock_resistance: 110,
    mock_news_context: "No adverse news",
    latest_close: 100,
    volume_ratio: 1.8,
    recent_volume_ratio: 1.8,
    proposed_entry_low: 99,
    proposed_entry_high: 100,
    proposed_stop_loss: 96,
    proposed_target_1: 106,
    proposed_target_2: 110,
    proposed_risk_reward: 2.5,
    intraday_indicators: {
      vwap: 99,
      latestPrice: 100,
      priceVsVwapPercent: 1,
      isAboveVwap: true,
      recentHigh: 101,
      recentLow: 98,
      recentRangePercent: 3,
      momentumPercent: 2,
      momentumDirection: "up",
      volumeTrend: "expanding",
      latestVolume: 1800,
      averageVolume: 1000,
      warnings: [],
    },
    intraday_indicator_source: "fresh",
    intraday_indicator_cached_at: DECIDED_AT,
    intraday_indicator_stale: false,
    reference_price_timestamp: DECIDED_AT,
    reference_price_provider: "twelve_data",
    local_score: 96,
  };
}

function completeAttribution({
  recommendationPublishPolicyVersion = "selective_policy_test_v1",
  buildIdentity = "test-build-v1",
}: {
  recommendationPublishPolicyVersion?: string;
  buildIdentity?: string;
} = {}) {
  return buildCandidateDecisionLearningAttribution({
    recommendationPublishPolicyVersion,
    canonicalEvaluationVersions: {
      engine_version: "ture_engine_test_v1",
      scoring_version: "score_test_v1",
      ranking_version: "ranking_test_v1",
      setup_taxonomy_version: "setup_taxonomy_not_recorded_v1",
      confidence_contract_version: "ordinal_confidence_not_calibrated_v1",
      evaluator_version: "canonical_outcome_evaluator_v1",
      provider_contract_version: "provider_test_v1",
      git_commit: "a".repeat(40),
      build_identity: buildIdentity,
    },
  });
}

function persistedPublishedScan({
  ticker = "TST",
  learningAttribution = completeAttribution(),
  observedAt = DECIDED_AT,
  scheduledScanRunId = null,
}: {
  ticker?: string;
  learningAttribution?: ReturnType<typeof completeAttribution>;
  observedAt?: string;
  scheduledScanRunId?: string | null;
} = {}) {
  const scannerCandidate = candidate(ticker);
  const ranking = buildScannerCandidateRankingSummary({
    candidates: [scannerCandidate],
    targetMin: 1,
    targetMax: 1,
    now: new Date(DECIDED_AT),
  });
  const scanRun = buildRecommendationScanRun({
    trading_date: "2026-09-17",
    observed_at: observedAt,
    completed_at: observedAt,
    window: "morning",
    source: "supabase",
    scheduled_scan_run_id: scheduledScanRunId,
    scanned_ticker_count: 1,
    raw_candidate_count: 1,
  });
  const capture = buildCandidateDecisionCapture({
    captureTimestamp: DECIDED_AT,
    universe: [scannerCandidate],
    observedCandidates: [scannerCandidate],
    ranking,
    eligibleCandidateTickers: [ticker],
    publishableThreshold: 70,
    publishedTickers: [ticker],
    recommendationBuildPath: "published",
  });
  const record = buildCandidateDecisionRecord({
    scanRun,
    capture,
    scoringVersion: "score_test_v1",
    buildVersion: "test-build-v1",
    learningAttribution,
  });

  expect(record).not.toBeNull();
  return {
    run: {
      ...scanRun,
      payload_json: {
        ...scanRun.payload_json,
        candidate_decision_record: record,
      },
    },
    record: record!,
  };
}

function persistedResearchScan({
  additionalRankedCandidate = false,
}: {
  additionalRankedCandidate?: boolean;
} = {}) {
  const scannerCandidates = [
    candidate(),
    ...(additionalRankedCandidate ? [candidate("ALT")] : []),
  ];
  const ranking = buildScannerCandidateRankingSummary({
    candidates: scannerCandidates,
    targetMin: 1,
    targetMax: 1,
    now: new Date(DECIDED_AT),
  });
  const scanRun = buildRecommendationScanRun({
    trading_date: "2026-09-17",
    observed_at: DECIDED_AT,
    completed_at: DECIDED_AT,
    window: "morning",
    source: "supabase",
    scanned_ticker_count: scannerCandidates.length,
    raw_candidate_count: scannerCandidates.length,
  });
  const capture = buildCandidateDecisionCapture({
    captureTimestamp: DECIDED_AT,
    universe: scannerCandidates,
    observedCandidates: scannerCandidates,
    ranking,
    eligibleCandidateTickers: scannerCandidates.map((scannerCandidate) =>
      scannerCandidate.ticker,
    ),
    publishableThreshold: 70,
    recommendationBuildPath: "no_publishable_candidate",
  });
  const record = buildCandidateDecisionRecord({
    scanRun,
    capture,
    scoringVersion: "score_test_v1",
    buildVersion: "test-build-v1",
    learningAttribution: completeAttribution(),
  });

  expect(record).not.toBeNull();
  expect(record?.candidates.some(
    (candidateRecord) =>
      candidateRecord.disposition === "selected_not_published",
  )).toBe(true);
  return {
    run: {
      ...scanRun,
      payload_json: {
        ...scanRun.payload_json,
        candidate_decision_record: record,
      },
    },
    record: record!,
  };
}

function persistedRejectedScan() {
  const scannerCandidate = candidate("REJ");
  const scanRun = buildRecommendationScanRun({
    trading_date: "2026-09-17",
    observed_at: DECIDED_AT,
    completed_at: DECIDED_AT,
    window: "morning",
    source: "supabase",
    scanned_ticker_count: 1,
    raw_candidate_count: 1,
  });
  const capture = buildCandidateDecisionCapture({
    captureTimestamp: DECIDED_AT,
    universe: [scannerCandidate],
    observedCandidates: [scannerCandidate],
    ranking: null,
    eligibleCandidateTickers: [],
    eligibilityRejectionCodes: {
      REJ: ["current_recommendation_exists"],
    },
    recommendationBuildPath: "no_publishable_candidate",
  });
  const record = buildCandidateDecisionRecord({
    scanRun,
    capture,
    scoringVersion: "score_test_v1",
    buildVersion: "test-build-v1",
    learningAttribution: completeAttribution(),
  });

  expect(record).not.toBeNull();
  expect(record?.candidates).toMatchObject([
    { ticker: "REJ", disposition: "filtered_before_ranking" },
  ]);
  return {
    run: {
      ...scanRun,
      payload_json: {
        ...scanRun.payload_json,
        candidate_decision_record: record,
      },
    },
    record: record!,
  };
}

function snapshotFor(
  scanRunFingerprint: string,
  { ticker = "TST" }: { ticker?: string } = {},
) {
  return buildRecommendationSnapshot({
    recommendation_id: `rec_${ticker.toLowerCase()}`,
    scan_run_id: scanRunFingerprint,
    ticker,
    company_name: `${ticker} Incorporated`,
    recommended_at: DECIDED_AT,
    app_timestamp: DECIDED_AT,
    window: "morning",
    source_mode: "supabase",
    is_visible: true,
    is_real: true,
    entry: 100,
    stop: 96,
    target: 108,
    side: "long",
    confidence: 82,
    payload: {
      confidence_label: "high",
    },
  });
}

function researchSnapshotFor({
  scanRunFingerprint,
  candidateId,
  ticker = "TST",
  candidateDisposition = "selected_not_published",
  linkageVersion,
}: {
  scanRunFingerprint: string;
  candidateId: string;
  ticker?: string;
  candidateDisposition?:
    | "selected_not_published"
    | "ranked_not_selected"
    | "filtered_before_ranking";
  linkageVersion?: string;
}) {
  return buildRecommendationSnapshot({
    recommendation_id: null,
    scan_run_id: scanRunFingerprint,
    ticker,
    company_name: `${ticker} Incorporated`,
    recommended_at: DECIDED_AT,
    app_timestamp: DECIDED_AT,
    window: "morning",
    source_mode: "research_only",
    data_mode: "research_only",
    is_visible: false,
    is_real: true,
    entry: 100,
    stop: 96,
    target: 108,
    side: "long",
    confidence: 82,
    payload: {
      visibility_status: "research_only",
      learning_acceleration_sample: true,
      research_only: true,
      learning_scope: "research_only",
      candidate_id: candidateId,
      candidate_decision_id: candidateId,
      candidate_decision_disposition: candidateDisposition,
      candidate_decision_linkage_version:
        linkageVersion ?? RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION,
      candidate_decision_linkage_status: "verified",
    },
  });
}

function completeOutcome(
  snapshot: ReturnType<typeof snapshotFor>,
  horizon = "60m",
  includeCanonicalCoverage = true,
) {
  const evaluationAnchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot);
  expect(evaluationAnchor).not.toBeNull();
  const outcome = computeRecommendationOutcome({
    snapshot,
    horizon,
    evaluated_at: "2026-09-17T15:35:00.000Z",
    source: "intraday_candles",
    provider: "twelve_data",
    data_completeness: "complete",
    candles: [
      {
        timestamp: "2026-09-17T14:31:00.000Z",
        open: 100,
        high: 109,
        low: 99,
        close: 108,
      },
    ],
  }).outcome;

  const result = {
    ...outcome,
    payload_json: {
      ...outcome.payload_json,
      ...(includeCanonicalCoverage
        ? {
            canonical_provider_coverage: {
              contract_version:
                CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION,
              provider_status: "available",
              freshness: "fresh",
              expected_candle_count: 1,
              observed_candle_count: 1,
              malformed_candle_count: 0,
              blockers: [],
              candle_interval: "5min",
              horizon,
              request_start_at: evaluationAnchor!.evaluation_anchor_start_at,
              request_end_at: "2026-09-17T15:30:00.000Z",
              required_horizon_end_at: "2026-09-17T15:30:00.000Z",
              horizon_elapsed: true,
              response_status: "available",
              evaluation_anchor_contract_version:
                "recommendation_outcome_evaluation_anchor_v1",
              decision_timestamp: evaluationAnchor!.decision_timestamp,
              evaluation_anchor_start_at:
                evaluationAnchor!.evaluation_anchor_start_at,
              decision_to_anchor_seconds:
                evaluationAnchor!.decision_to_anchor_seconds,
              decision_timestamp_interval_aligned:
                evaluationAnchor!.decision_timestamp_interval_aligned,
            },
          }
        : {}),
    },
  };

  return result;
}

function publishedEvidenceForSegment({
  index,
  learningAttribution,
}: {
  index: number;
  learningAttribution: ReturnType<typeof completeAttribution>;
}) {
  const ticker = `SEG${String(index).padStart(2, "0")}`;
  const observedAt = new Date(DECIDED_AT);
  observedAt.setUTCMinutes(observedAt.getUTCMinutes() + index);
  const { run } = persistedPublishedScan({
    ticker,
    learningAttribution,
    observedAt: observedAt.toISOString(),
    scheduledScanRunId: `segment-${index}`,
  });
  const snapshot = snapshotFor(run.run_fingerprint, { ticker });

  return {
    run,
    snapshot,
    outcome: completeOutcome(snapshot),
  };
}

test.describe("recommendation learning baseline readiness", () => {
  test("selects one 60m primary outcome from an exactly linked published decision without treating ordinal confidence as probability", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const outcome = completeOutcome(snapshot);
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [snapshot],
      outcomes: [outcome],
    });

    expect(readiness.decision_records).toMatchObject({
      attributable_count: 1,
      complete_population_count: 1,
    });
    expect(readiness.policy_attribution.status).toBe("complete");
    expect(readiness.visible_outcomes).toMatchObject({
      exact_snapshot_link_count: 1,
      primary_outcome_count: 1,
      primary_outcome_by_horizon: { "15m": 0, "30m": 0, "60m": 1 },
    });
    expect(readiness.confidence_calibration).toEqual({
      status: "blocked_ordinal_confidence",
      numeric_probability_sample_count: 0,
    });
    expect(readiness.status).toBe("not_ready");
    expect(readiness.blockers).toContain(
      "insufficient_visible_primary_outcomes_for_baseline_freeze",
    );
  });

  test("fails closed when a published candidate has duplicate primary-horizon rows", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const outcome = completeOutcome(snapshot);
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [snapshot],
      outcomes: [outcome, { ...outcome, id: "duplicate_60m_outcome" }],
    });

    expect(readiness.visible_outcomes).toMatchObject({
      exact_snapshot_link_count: 1,
      primary_outcome_count: 0,
      incomplete_or_conflicting_outcome_count: 1,
    });
    expect(readiness.blockers).toContain(
      "published_candidate_primary_outcome_incomplete_or_conflicting",
    );
  });

  test("does not call a complete legacy candle outcome a canonical primary outcome without persisted coverage evidence", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [snapshot],
      outcomes: [completeOutcome(snapshot, "60m", false)],
    });

    expect(readiness.visible_outcomes).toMatchObject({
      exact_snapshot_link_count: 1,
      primary_outcome_count: 0,
      incomplete_or_conflicting_outcome_count: 1,
    });
    expect(readiness.blockers).toContain(
      "published_candidate_primary_outcome_incomplete_or_conflicting",
    );
  });

  test("requires a decision-bound v2 coverage receipt instead of accepting an older unanchored receipt", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const outcome = completeOutcome(snapshot);
    const legacyCoverageOutcome = {
      ...outcome,
      payload_json: {
        ...outcome.payload_json,
        canonical_provider_coverage: {
          ...(outcome.payload_json.canonical_provider_coverage as Record<string, unknown>),
          contract_version: "canonical_outcome_provider_coverage_receipt_v1",
        },
      },
    };
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [snapshot],
      outcomes: [legacyCoverageOutcome],
    });

    expect(readiness.visible_outcomes.primary_outcome_count).toBe(0);
    expect(readiness.blockers).toContain(
      "published_candidate_primary_outcome_coverage_receipt_missing_or_unversioned_or_unanchored",
    );
  });

  test("fails closed when a linked outcome predates the decision", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const outcome = {
      ...completeOutcome(snapshot),
      evaluated_at: "2026-09-17T14:00:00.000Z",
    };
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [snapshot],
      outcomes: [outcome],
    });

    expect(readiness.visible_outcomes).toMatchObject({
      exact_snapshot_link_count: 0,
      pre_decision_outcome_count: 1,
      primary_outcome_count: 0,
    });
    expect(readiness.blockers).toContain("outcome_precedes_candidate_decision");
  });

  test("fails closed when an outcome fingerprint is paired with a conflicting snapshot identity", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [snapshot],
      outcomes: [
        {
          ...completeOutcome(snapshot),
          snapshot_id: "conflicting_snapshot_id",
        },
      ],
    });

    expect(readiness.visible_outcomes).toMatchObject({
      exact_snapshot_link_count: 1,
      primary_outcome_count: 0,
      incomplete_or_conflicting_outcome_count: 1,
    });
    expect(readiness.blockers).toContain(
      "outcome_snapshot_or_recommendation_relation_conflict",
    );
  });

  test("keeps legacy decision records out of a policy-attributed learning baseline", () => {
    const { run, record } = persistedPublishedScan();
    const legacyRecord = {
      ...record,
      record_version: "candidate_decision_record_v1",
    };
    delete (legacyRecord as { learning_attribution?: unknown }).learning_attribution;
    const legacyRun = {
      ...run,
      payload_json: {
        ...run.payload_json,
        candidate_decision_record: legacyRecord,
      },
    };
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [legacyRun],
      snapshots: [],
      outcomes: [],
    });

    expect(readiness.decision_records.attributable_count).toBe(1);
    expect(readiness.policy_attribution).toMatchObject({
      status: "incomplete",
      complete_record_count: 0,
      incomplete_record_count: 1,
    });
    expect(readiness.blockers).toContain("canonical_policy_attribution_incomplete");
  });

  test("does not turn research, rejected, or no-trade decisions into invented outcomes", () => {
    const { run } = persistedPublishedScan();
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [],
      outcomes: [],
    });

    expect(readiness.counterfactual_coverage).toEqual({
      research_candidate_outcomes_required: 0,
      research_candidate_outcomes_collected: 0,
      rejected_candidate_outcomes_required: 0,
      rejected_candidate_outcomes_collected: 0,
      no_trade_outcomes_required: 0,
      no_trade_outcomes_collected: 0,
      status: "not_required",
    });
    expect(readiness.decision_population).toMatchObject({
      published_candidate_count: 1,
      research_candidate_count: 0,
      rejected_candidate_count: 0,
      explicit_no_trade_count: 0,
    });
  });

  test("counts only an exactly linked research snapshot with a decision-bound complete outcome", () => {
    const { run, record } = persistedResearchScan();
    const researchCandidate = record.candidates[0]!;
    const snapshot = researchSnapshotFor({
      scanRunFingerprint: run.run_fingerprint,
      candidateId: researchCandidate.candidate_id,
    });
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [snapshot],
      outcomes: [completeOutcome(snapshot)],
    });

    expect(readiness.counterfactual_coverage).toEqual({
      research_candidate_outcomes_required: 1,
      research_candidate_outcomes_collected: 1,
      rejected_candidate_outcomes_required: 0,
      rejected_candidate_outcomes_collected: 0,
      no_trade_outcomes_required: 1,
      no_trade_outcomes_collected: 1,
      status: "complete",
    });
    expect(readiness.blockers).not.toContain(
      "research_candidate_counterfactual_outcomes_incomplete",
    );
    expect(readiness.blockers).not.toContain(
      "explicit_no_trade_counterfactual_outcomes_not_collected",
    );
  });

  test("counts a rejected candidate only through a v2 exact link to its recorded scanner plan", () => {
    const { run, record } = persistedRejectedScan();
    const rejectedCandidate = record.candidates[0]!;
    const snapshot = researchSnapshotFor({
      scanRunFingerprint: run.run_fingerprint,
      candidateId: rejectedCandidate.candidate_id,
      ticker: rejectedCandidate.ticker,
      candidateDisposition: "filtered_before_ranking",
    });
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [snapshot],
      outcomes: [completeOutcome(snapshot)],
    });

    expect(readiness.counterfactual_coverage).toMatchObject({
      research_candidate_outcomes_required: 0,
      rejected_candidate_outcomes_required: 1,
      rejected_candidate_outcomes_collected: 1,
      no_trade_outcomes_required: 1,
      no_trade_outcomes_collected: 0,
      status: "partial",
    });
    expect(readiness.blockers).not.toContain(
      "rejected_candidate_counterfactual_outcomes_not_collected",
    );
  });

  test("does not allow a legacy research link to cover a filtered candidate", () => {
    const { run, record } = persistedRejectedScan();
    const rejectedCandidate = record.candidates[0]!;
    const snapshot = researchSnapshotFor({
      scanRunFingerprint: run.run_fingerprint,
      candidateId: rejectedCandidate.candidate_id,
      ticker: rejectedCandidate.ticker,
      candidateDisposition: "filtered_before_ranking",
      linkageVersion: "research_snapshot_candidate_decision_linkage_v1",
    });
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [snapshot],
      outcomes: [completeOutcome(snapshot)],
    });

    expect(readiness.counterfactual_coverage).toMatchObject({
      rejected_candidate_outcomes_required: 1,
      rejected_candidate_outcomes_collected: 0,
    });
    expect(readiness.blockers).toContain(
      "rejected_candidate_counterfactual_outcomes_not_collected",
    );
  });

  test("does not call an explicit no-trade covered until every ranked research candidate has an exact outcome", () => {
    const { run, record } = persistedResearchScan({
      additionalRankedCandidate: true,
    });
    expect(record.candidates).toHaveLength(2);
    const firstCandidate = record.candidates.find(
      (candidateRecord) =>
        candidateRecord.disposition === "selected_not_published" ||
        candidateRecord.disposition === "ranked_not_selected",
    );
    expect(firstCandidate).toBeDefined();
    const snapshot = researchSnapshotFor({
      scanRunFingerprint: run.run_fingerprint,
      candidateId: firstCandidate!.candidate_id,
      ticker: firstCandidate!.ticker,
      candidateDisposition: firstCandidate!.disposition as
        | "selected_not_published"
        | "ranked_not_selected",
    });
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [snapshot],
      outcomes: [completeOutcome(snapshot)],
    });

    expect(readiness.counterfactual_coverage).toEqual({
      research_candidate_outcomes_required: 2,
      research_candidate_outcomes_collected: 1,
      rejected_candidate_outcomes_required: 0,
      rejected_candidate_outcomes_collected: 0,
      no_trade_outcomes_required: 1,
      no_trade_outcomes_collected: 0,
      status: "partial",
    });
    expect(readiness.blockers).toContain(
      "explicit_no_trade_counterfactual_outcomes_not_collected",
    );
  });

  test("requires a complete captured candidate population before counting no-trade evidence", () => {
    const { run, record } = persistedResearchScan({
      additionalRankedCandidate: true,
    });
    const researchCandidates = record.candidates.filter(
      (candidateRecord) =>
        candidateRecord.disposition === "selected_not_published" ||
        candidateRecord.disposition === "ranked_not_selected",
    );
    expect(researchCandidates).toHaveLength(2);
    const snapshots = researchCandidates.map((candidateRecord) =>
      researchSnapshotFor({
        scanRunFingerprint: run.run_fingerprint,
        candidateId: candidateRecord.candidate_id,
        ticker: candidateRecord.ticker,
        candidateDisposition: candidateRecord.disposition as
          | "selected_not_published"
          | "ranked_not_selected",
      }),
    );
    const incompleteRecord = structuredClone(record);
    incompleteRecord.candidates[0]!.disposition = "not_evaluated";
    const incompleteRun = {
      ...run,
      payload_json: {
        ...run.payload_json,
        candidate_decision_record: incompleteRecord,
      },
    };
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [incompleteRun],
      snapshots,
      outcomes: snapshots.map((snapshot) => completeOutcome(snapshot)),
    });

    expect(readiness.decision_records.incomplete_population_count).toBe(1);
    expect(readiness.counterfactual_coverage).toMatchObject({
      research_candidate_outcomes_required: 1,
      research_candidate_outcomes_collected: 1,
      no_trade_outcomes_required: 1,
      no_trade_outcomes_collected: 0,
      status: "partial",
    });
    expect(readiness.blockers).toContain("candidate_population_incomplete");
    expect(readiness.blockers).toContain(
      "explicit_no_trade_counterfactual_outcomes_not_collected",
    );
  });

  test("fails closed when a research snapshot claims a different candidate identity", () => {
    const { run, record } = persistedResearchScan();
    const snapshot = researchSnapshotFor({
      scanRunFingerprint: run.run_fingerprint,
      candidateId: record.candidates[0]!.candidate_id,
    });
    const tamperedSnapshot = {
      ...snapshot,
      payload_json: {
        ...snapshot.payload_json,
        candidate_decision_id: "scanner_candidate:v1:other:TST",
      },
    };
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [tamperedSnapshot],
      outcomes: [completeOutcome(tamperedSnapshot)],
    });

    expect(readiness.counterfactual_coverage).toMatchObject({
      research_candidate_outcomes_required: 1,
      research_candidate_outcomes_collected: 0,
      status: "not_collected",
    });
    expect(readiness.blockers).toContain(
      "research_candidate_counterfactual_outcomes_incomplete",
    );
  });

  test("fails closed when a research snapshot claims a different candidate disposition", () => {
    const { run, record } = persistedResearchScan();
    const snapshot = researchSnapshotFor({
      scanRunFingerprint: run.run_fingerprint,
      candidateId: record.candidates[0]!.candidate_id,
    });
    const tamperedSnapshot = {
      ...snapshot,
      payload_json: {
        ...snapshot.payload_json,
        candidate_decision_disposition: "ranked_not_selected",
      },
    };
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [tamperedSnapshot],
      outcomes: [completeOutcome(tamperedSnapshot)],
    });

    expect(readiness.counterfactual_coverage).toMatchObject({
      research_candidate_outcomes_required: 1,
      research_candidate_outcomes_collected: 0,
      status: "not_collected",
    });
    expect(readiness.blockers).toContain(
      "research_candidate_counterfactual_outcomes_incomplete",
    );
  });

  test("keeps policy-version populations separate so a comparable segment can become freeze-eligible", () => {
    const baselineAttribution = completeAttribution();
    const comparableEvidence = Array.from({ length: 20 }, (_, index) =>
      publishedEvidenceForSegment({
        index,
        learningAttribution: baselineAttribution,
      }),
    );
    const newerEvidence = publishedEvidenceForSegment({
      index: 99,
      learningAttribution: completeAttribution({
        buildIdentity: "test-build-v2",
      }),
    });
    const scanRuns = [...comparableEvidence, newerEvidence].map(
      (evidence) => evidence.run,
    );
    const snapshots = [...comparableEvidence, newerEvidence].map(
      (evidence) => evidence.snapshot,
    );
    const outcomes = [...comparableEvidence, newerEvidence].map(
      (evidence) => evidence.outcome,
    );

    const mixedReadiness = buildRecommendationLearningBaselineReadiness({
      scanRuns,
      snapshots,
      outcomes,
    });
    const segmentation = buildRecommendationLearningBaselineSegmentation({
      scanRuns,
      snapshots,
      outcomes,
    });

    expect(mixedReadiness.policy_attribution.status).toBe("mixed");
    expect(mixedReadiness.status).toBe("not_ready");
    expect(segmentation).toMatchObject({
      status: "eligible_segments_require_explicit_freeze",
      source_scan_runs: {
        considered_count: 21,
        comparable_count: 21,
        invalid_decision_record_count: 0,
        incomplete_policy_attribution_count: 0,
        duplicate_scan_run_fingerprint_count: 0,
      },
    });
    expect(segmentation.segments).toHaveLength(2);
    expect(segmentation.segments[0]).toMatchObject({
      decision_records: { count: 20 },
      policy_attribution: {
        recommendation_publish_policy_version: "selective_policy_test_v1",
        canonical_evaluation_versions: { build_identity: "test-build-v1" },
      },
      readiness: {
        status: "eligible_for_explicit_freeze",
        visible_outcomes: { primary_outcome_count: 20 },
      },
    });
    expect(segmentation.segments[1]).toMatchObject({
      decision_records: { count: 1 },
      policy_attribution: {
        canonical_evaluation_versions: { build_identity: "test-build-v2" },
      },
      readiness: { status: "not_ready" },
    });
  });

  test("uses only one canonical primary outcome per exact candidate when preparing fixed baseline metrics", () => {
    const baselineAttribution = completeAttribution();
    const comparableEvidence = Array.from({ length: 20 }, (_, index) =>
      publishedEvidenceForSegment({
        index,
        learningAttribution: baselineAttribution,
      }),
    );
    const newerEvidence = publishedEvidenceForSegment({
      index: 99,
      learningAttribution: completeAttribution({
        buildIdentity: "test-build-v2",
      }),
    });
    const scanRuns = [...comparableEvidence, newerEvidence].map(
      (evidence) => evidence.run,
    );
    const snapshots = [...comparableEvidence, newerEvidence].map(
      (evidence) => evidence.snapshot,
    );
    const outcomes = [...comparableEvidence, newerEvidence].map(
      (evidence) => evidence.outcome,
    );
    const segmentation = buildRecommendationLearningBaselineSegmentation({
      scanRuns,
      snapshots,
      outcomes,
    });
    const plans = buildRecommendationLearningEvaluationPlans({
      segmentation,
      scanRuns,
      snapshots,
      outcomes,
    });

    expect(plans).toMatchObject({
      contract_version: "recommendation_learning_evaluation_plan_v1",
      status: "eligible_segments_require_explicit_freeze",
    });
    expect(plans.plans).toHaveLength(2);
    expect(plans.plans[0]).toMatchObject({
      status: "ready_for_explicit_freeze",
      decision_records: {
        count: 20,
        scan_run_fingerprints: expect.arrayContaining([
          comparableEvidence[0]!.run.run_fingerprint,
        ]),
      },
      outcome_population: {
        visible_primary_outcome_count: 20,
        research_primary_outcome_count: 0,
        rejected_primary_outcome_count: 0,
        primary_outcome_by_horizon: { "15m": 0, "30m": 0, "60m": 20 },
      },
      metrics: {
        entry: {
          known_count: 20,
          triggered_count: 20,
          not_triggered_count: 0,
          unknown_count: 0,
          triggered_rate: 1,
        },
        horizon_r: { observed_count: 0, mean: null, median: null },
        excursion: {
          status: "not_measurable_until_entry_bound_excursion_contract",
        },
      },
    });
    expect(plans.plans[1]).toMatchObject({
      status: "not_freeze_eligible",
      metrics: null,
    });
  });

  test("does not create metrics for a duplicate decision identity excluded from every segment", () => {
    const evidence = publishedEvidenceForSegment({
      index: 1,
      learningAttribution: completeAttribution(),
    });
    const scanRuns = [evidence.run, structuredClone(evidence.run)];
    const segmentation = buildRecommendationLearningBaselineSegmentation({
      scanRuns,
      snapshots: [evidence.snapshot],
      outcomes: [evidence.outcome],
    });
    const plans = buildRecommendationLearningEvaluationPlans({
      segmentation,
      scanRuns,
      snapshots: [evidence.snapshot],
      outcomes: [evidence.outcome],
    });

    expect(plans).toEqual({
      contract_version: "recommendation_learning_evaluation_plan_v1",
      status: "no_comparable_segments",
      plans: [],
    });
  });

  test("excludes duplicate scan identities from every comparable baseline segment", () => {
    const evidence = publishedEvidenceForSegment({
      index: 1,
      learningAttribution: completeAttribution(),
    });
    const segmentation = buildRecommendationLearningBaselineSegmentation({
      scanRuns: [evidence.run, structuredClone(evidence.run)],
      snapshots: [evidence.snapshot],
      outcomes: [evidence.outcome],
    });

    expect(segmentation).toEqual({
      contract_version: "recommendation_learning_baseline_segmentation_v1",
      status: "no_comparable_segments",
      source_scan_runs: {
        considered_count: 2,
        comparable_count: 0,
        invalid_decision_record_count: 0,
        incomplete_policy_attribution_count: 0,
        duplicate_scan_run_fingerprint_count: 2,
      },
      segments: [],
    });
  });

  test("excludes incomplete policy attribution instead of pooling it with a complete segment", () => {
    const completeEvidence = publishedEvidenceForSegment({
      index: 1,
      learningAttribution: completeAttribution(),
    });
    const incompleteEvidence = publishedEvidenceForSegment({
      index: 2,
      learningAttribution: buildCandidateDecisionLearningAttribution({
        recommendationPublishPolicyVersion: null,
        canonicalEvaluationVersions: null,
      }),
    });
    const segmentation = buildRecommendationLearningBaselineSegmentation({
      scanRuns: [completeEvidence.run, incompleteEvidence.run],
      snapshots: [completeEvidence.snapshot, incompleteEvidence.snapshot],
      outcomes: [completeEvidence.outcome, incompleteEvidence.outcome],
    });

    expect(segmentation).toMatchObject({
      status: "segments_not_ready",
      source_scan_runs: {
        considered_count: 2,
        comparable_count: 1,
        invalid_decision_record_count: 0,
        incomplete_policy_attribution_count: 1,
        duplicate_scan_run_fingerprint_count: 0,
      },
      segments: [
        {
          decision_records: { count: 1 },
          readiness: { status: "not_ready" },
        },
      ],
    });
  });
});
