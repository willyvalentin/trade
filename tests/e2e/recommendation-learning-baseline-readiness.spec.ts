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
import {
  computeRecommendationOutcome,
  entryBoundExcursionFromOutcome,
} from "@/lib/recommendation-outcome-tracker";
import { RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION } from "@/lib/research-snapshot-candidate-linkage";
import { buildRecommendationScanRun } from "@/lib/recommendation-scan-run";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { recommendationDecisionFeatureVectorFromScannerCandidate } from "@/lib/recommendation-decision-feature-vector";
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

const DECISION_SOURCE_PROVENANCE = {
  data_timestamp: "2026-09-17T14:29:00.000Z",
  intraday_indicator_response_identity: {
    contract_version: "twelve_data_response_identity_v1",
    digest_algorithm: "sha256",
    payload_sha256:
      "sha256:8e53ed153f5f4bd3e09229af1091eb0b8d5bc7a6cb8c20b99e1c246fcc9f0c22",
    payload_byte_length: 214,
  },
  decision_feature_vector:
    recommendationDecisionFeatureVectorFromScannerCandidate(candidate()),
  provider_source: "twelve_data",
  provider_version: "twelve_data_test_contract_v1",
  market_data_adapter_version: "automation_scan_market_data_adapter_v1",
  build_marker: "test-build-marker-v1",
  source_feed_class: "us_equities_intraday_indicators",
  provider_plan_profile_mode: "test_configured_profile_v1",
  observed_provider_entitlement_profile: "test_observed_entitlement_v1",
  source_coverage_scope: "us_equities:test-signal-inputs",
  source_request_cost_credits: 1,
  source_response_quality_disposition: "accepted",
  source_observation_time_band: "regular",
  source_observation_integrity_policy_version:
    "recommendation_source_observation_integrity_policy_v1",
  source_maximum_upstream_age_seconds: 120,
  source_maximum_response_latency_seconds: 10,
  source_expected_record_count: 500,
  source_observed_record_count: 500,
  source_request_started_at: "2026-09-17T14:29:01.000Z",
  source_response_received_at: "2026-09-17T14:29:03.000Z",
  source_operation_time_band: "regular",
  source_operation_budget_policy_version:
    "recommendation_source_operation_budget_policy_v1",
  source_operation_time_band_credit_budget: 100,
  source_operation_committed_credits_before_operation: 60,
  source_operation_cost_credits: 5,
  source_operation_reserved_retry_credits: 10,
  source_operation_maximum_attempt_count: 3,
  source_operation_attempt_number: 1,
  source_operation_backoff_until: null,
};

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

function intakeQualityReceipt({
  resultVersion = "1.1",
  status = "accepted",
  grade = "A",
  acceptedForVisibleList = true,
}: {
  resultVersion?: string;
  status?: "accepted" | "needs_review" | "rejected" | "incomplete";
  grade?: "A" | "B" | "C" | "D" | "F" | "unknown";
  acceptedForVisibleList?: boolean;
} = {}) {
  return {
    result_kind: "recommendation_intake_quality",
    result_version: resultVersion,
    status,
    grade,
    accepted_for_visible_list: acceptedForVisibleList,
    internal_only: true,
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
    quality: {
      intake_quality_result: intakeQualityReceipt(),
    },
    payload: {
      ...DECISION_SOURCE_PROVENANCE,
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
      ...DECISION_SOURCE_PROVENANCE,
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
        high: 101,
        low: 99,
        close: 100,
      },
      {
        timestamp: "2026-09-17T14:36:00.000Z",
        open: 100,
        high: 106,
        low: 98,
        close: 104,
      },
      {
        timestamp: "2026-09-17T14:41:00.000Z",
        open: 104,
        high: 107,
        low: 99,
        close: 105,
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
              expected_candle_count: 3,
              observed_candle_count: 3,
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

  test("excludes a linked outcome from baseline learning when its upstream provider version is absent", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const missingProviderVersionSnapshot = {
      ...snapshot,
      payload_json: {
        ...snapshot.payload_json,
        provider_version: null,
      },
    };
    const outcome = completeOutcome(missingProviderVersionSnapshot);
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [missingProviderVersionSnapshot],
      outcomes: [outcome],
    });
    const segmentation = buildRecommendationLearningBaselineSegmentation({
      scanRuns: [run],
      snapshots: [missingProviderVersionSnapshot],
      outcomes: [outcome],
    });
    const plans = buildRecommendationLearningEvaluationPlans({
      segmentation,
      scanRuns: [run],
      snapshots: [missingProviderVersionSnapshot],
      outcomes: [outcome],
    });

    expect(readiness.visible_outcomes).toMatchObject({
      exact_snapshot_link_count: 0,
      primary_outcome_count: 0,
      incomplete_or_conflicting_outcome_count: 1,
    });
    expect(readiness.decision_time_source_provenance).toMatchObject({
      assessed_snapshot_count: 1,
      admissible_snapshot_count: 0,
      incomplete_snapshot_count: 1,
      blocker_counts: { provider_version_missing: 1 },
    });
    expect(readiness.blockers).toContain(
      "published_candidate_decision_source_provenance_incomplete",
    );
    expect(plans.plans).toHaveLength(1);
    expect(plans.plans[0]?.blockers).toContain(
      "visible_primary_outcome_decision_source_provenance_incomplete",
    );
  });

  test("excludes a snapshot whose source timestamp is after its decision", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const lookaheadSnapshot = {
      ...snapshot,
      payload_json: {
        ...snapshot.payload_json,
        data_timestamp: "2026-09-17T14:31:00.000Z",
      },
    };
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [lookaheadSnapshot],
      outcomes: [completeOutcome(lookaheadSnapshot)],
    });

    expect(readiness.visible_outcomes.primary_outcome_count).toBe(0);
    expect(readiness.decision_time_source_provenance.blocker_counts).toMatchObject({
      source_timestamp_after_decision: 1,
    });
    expect(readiness.blockers).toContain(
      "published_candidate_decision_source_provenance_incomplete",
    );
  });

  test("excludes a snapshot whose intraday response fingerprint is absent", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const missingIdentitySnapshot = {
      ...snapshot,
      payload_json: {
        ...snapshot.payload_json,
        intraday_indicator_response_identity: null,
      },
    };
    const outcome = completeOutcome(missingIdentitySnapshot);
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [missingIdentitySnapshot],
      outcomes: [outcome],
    });
    const segmentation = buildRecommendationLearningBaselineSegmentation({
      scanRuns: [run],
      snapshots: [missingIdentitySnapshot],
      outcomes: [outcome],
    });
    const plans = buildRecommendationLearningEvaluationPlans({
      segmentation,
      scanRuns: [run],
      snapshots: [missingIdentitySnapshot],
      outcomes: [outcome],
    });

    expect(readiness.decision_time_source_provenance).toMatchObject({
      assessed_snapshot_count: 1,
      intraday_indicator_response_identity_count: 0,
      incomplete_snapshot_count: 1,
      blocker_counts: {
        intraday_indicator_response_identity_missing_or_invalid: 1,
      },
    });
    expect(readiness.blockers).toContain(
      "published_candidate_decision_source_provenance_incomplete",
    );
    expect(plans.plans[0]?.blockers).toContain(
      "visible_primary_outcome_decision_source_provenance_incomplete",
    );
  });

  test("excludes a snapshot whose decision feature vector is absent", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const missingFeatureVectorSnapshot = {
      ...snapshot,
      payload_json: {
        ...snapshot.payload_json,
        decision_feature_vector: null,
      },
    };
    const outcome = completeOutcome(missingFeatureVectorSnapshot);
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [run],
      snapshots: [missingFeatureVectorSnapshot],
      outcomes: [outcome],
    });
    const segmentation = buildRecommendationLearningBaselineSegmentation({
      scanRuns: [run],
      snapshots: [missingFeatureVectorSnapshot],
      outcomes: [outcome],
    });
    const plans = buildRecommendationLearningEvaluationPlans({
      segmentation,
      scanRuns: [run],
      snapshots: [missingFeatureVectorSnapshot],
      outcomes: [outcome],
    });

    expect(readiness.decision_time_source_provenance).toMatchObject({
      assessed_snapshot_count: 1,
      decision_feature_vector_count: 0,
      incomplete_snapshot_count: 1,
      blocker_counts: {
        decision_feature_vector_missing_or_invalid: 1,
      },
    });
    expect(readiness.blockers).toContain(
      "published_candidate_decision_source_provenance_incomplete",
    );
    expect(plans.plans[0]?.blockers).toContain(
      "visible_primary_outcome_decision_source_provenance_incomplete",
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
    expect(readiness.strategy_attribution).toMatchObject({
      status: "incomplete",
      complete_record_count: 0,
      incomplete_record_count: 1,
    });
    expect(readiness.blockers).toContain("canonical_policy_attribution_incomplete");
    expect(readiness.blockers).toContain(
      "decision_strategy_attribution_incomplete",
    );
  });

  test("keeps attributed v2 decisions without a strategy registry out of learning segments", () => {
    const { run, record } = persistedPublishedScan();
    const attributedV2Record = {
      ...record,
      record_version: "candidate_decision_record_v2",
    };
    delete (attributedV2Record as { strategy_reference?: unknown })
      .strategy_reference;
    const attributedV2Run = {
      ...run,
      payload_json: {
        ...run.payload_json,
        candidate_decision_record: attributedV2Record,
      },
    };
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: [attributedV2Run],
      snapshots: [],
      outcomes: [],
    });
    const segmentation = buildRecommendationLearningBaselineSegmentation({
      scanRuns: [attributedV2Run],
      snapshots: [],
      outcomes: [],
    });

    expect(readiness.policy_attribution.status).toBe("complete");
    expect(readiness.strategy_attribution).toMatchObject({
      status: "incomplete",
      complete_record_count: 0,
      incomplete_record_count: 1,
      distinct_strategy_identity_count: 0,
    });
    expect(readiness.blockers).toContain(
      "decision_strategy_attribution_incomplete",
    );
    expect(segmentation).toMatchObject({
      status: "no_comparable_segments",
      source_scan_runs: {
        considered_count: 1,
        comparable_count: 0,
        invalid_decision_record_count: 0,
        incomplete_policy_attribution_count: 1,
      },
      segments: [],
    });
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

  test("blocks an otherwise complete baseline when intake-quality receipts are missing or malformed", () => {
    const baselineAttribution = completeAttribution();
    const evidence = Array.from({ length: 20 }, (_, index) =>
      publishedEvidenceForSegment({
        index,
        learningAttribution: baselineAttribution,
      }),
    );
    const snapshots = evidence.map((item, index) =>
      index === 0
        ? { ...item.snapshot, intake_quality_json: null }
        : index === 1
          ? {
              ...item.snapshot,
              intake_quality_json: {
                result_kind: "recommendation_intake_quality",
              },
            }
          : item.snapshot,
    );
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: evidence.map((item) => item.run),
      snapshots,
      outcomes: evidence.map((item) => item.outcome),
    });
    const segmentation = buildRecommendationLearningBaselineSegmentation({
      scanRuns: evidence.map((item) => item.run),
      snapshots,
      outcomes: evidence.map((item) => item.outcome),
    });

    expect(readiness).toMatchObject({
      status: "not_ready",
      intake_quality_provenance: {
        status: "incomplete",
        eligible_snapshot_count: 20,
        valid_receipt_count: 18,
        missing_receipt_count: 1,
        invalid_receipt_count: 1,
        result_versions: ["1.1"],
      },
    });
    expect(readiness.blockers).toContain(
      "outcome_sample_intake_quality_incomplete",
    );
    expect(segmentation).toMatchObject({
      status: "segments_not_ready",
      segments: [
        {
          readiness: {
            status: "not_ready",
            intake_quality_provenance: { status: "incomplete" },
          },
        },
      ],
    });
  });

  test("keeps mixed intake-quality result versions out of a baseline freeze", () => {
    const baselineAttribution = completeAttribution();
    const evidence = Array.from({ length: 20 }, (_, index) =>
      publishedEvidenceForSegment({
        index,
        learningAttribution: baselineAttribution,
      }),
    );
    const snapshots = evidence.map((item, index) =>
      index === 0
        ? {
            ...item.snapshot,
            intake_quality_json: intakeQualityReceipt({ resultVersion: "1.0" }),
          }
        : item.snapshot,
    );
    const readiness = buildRecommendationLearningBaselineReadiness({
      scanRuns: evidence.map((item) => item.run),
      snapshots,
      outcomes: evidence.map((item) => item.outcome),
    });

    expect(readiness).toMatchObject({
      status: "not_ready",
      intake_quality_provenance: {
        status: "mixed",
        valid_receipt_count: 20,
        result_versions: ["1.0", "1.1"],
      },
    });
    expect(readiness.blockers).toContain(
      "multiple_intake_quality_result_versions_require_segmented_baseline",
    );
  });

  test("refuses missing, incomplete, and changed source cohorts from a learning baseline", () => {
    const baselineAttribution = completeAttribution();
    const evidence = Array.from({ length: 20 }, (_, index) =>
      publishedEvidenceForSegment({
        index,
        learningAttribution: baselineAttribution,
      }),
    );
    const missing = evidence.map((item, index) =>
      index === 0
        ? {
            ...item.snapshot,
            payload_json: {
              ...item.snapshot.payload_json,
              source_cohort_receipt: undefined,
            },
          }
        : item.snapshot,
    );
    const incomplete = evidence.map((item, index) =>
      index === 0
        ? {
            ...item.snapshot,
            payload_json: {
              ...item.snapshot.payload_json,
              source_cohort_receipt: {
                ...((item.snapshot.payload_json.source_cohort_receipt ?? {}) as Record<
                  string,
                  unknown
                >),
                request_cost_credits: null,
              },
            },
          }
        : item.snapshot,
    );
    const changed = evidence.map((item, index) =>
      index === 0
        ? buildRecommendationSnapshot({
            ...item.snapshot,
            created_at: item.snapshot.created_at,
            payload: {
              ...item.snapshot.payload_json,
              provider_source: "future_provider",
              market_data_source: "future_provider",
            },
          })
        : item.snapshot,
    );

    const baselineInput = {
      scanRuns: evidence.map((item) => item.run),
      outcomes: evidence.map((item) => item.outcome),
    };
    expect(buildRecommendationLearningBaselineReadiness({
      ...baselineInput,
      snapshots: missing,
    })).toMatchObject({
      status: "not_ready",
      source_cohort_provenance: { status: "incomplete", missing_receipt_count: 1 },
      blockers: expect.arrayContaining(["outcome_sample_source_cohort_incomplete"]),
    });
    expect(buildRecommendationLearningBaselineReadiness({
      ...baselineInput,
      snapshots: incomplete,
    })).toMatchObject({
      status: "not_ready",
      source_cohort_provenance: { status: "incomplete", invalid_receipt_count: 1 },
      blockers: expect.arrayContaining(["outcome_sample_source_cohort_incomplete"]),
    });
    expect(buildRecommendationLearningBaselineReadiness({
      ...baselineInput,
      snapshots: changed,
    })).toMatchObject({
      status: "not_ready",
      source_cohort_provenance: { status: "mixed", complete_receipt_count: 20 },
      blockers: expect.arrayContaining([
        "multiple_source_cohorts_require_segmented_baseline",
      ]),
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
          contract_version: "recommendation_outcome_entry_bound_excursion_v1",
          status: "entry_bound_excursion_measured_with_explicit_missingness",
          triggered_outcome_count: 20,
          contract_missing_count: 0,
          mfe_r: { observed_count: 20, mean: 1.75, median: 1.75 },
          mae_r: { observed_count: 20, mean: -0.5, median: -0.5 },
          paired_mfe_mae_count: 20,
          mfe_missing_count: 0,
          mae_missing_count: 0,
        },
      },
    });
    expect(plans.plans[1]).toMatchObject({
      status: "not_freeze_eligible",
      metrics: null,
    });
  });

  test("measures MFE and MAE only from candles strictly after a pending entry trigger", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const outcome = computeRecommendationOutcome({
      snapshot,
      horizon: "60m",
      evaluated_at: "2026-09-17T15:35:00.000Z",
      source: "intraday_candles",
      provider: "twelve_data",
      data_completeness: "complete",
      candles: [
        {
          timestamp: "2026-09-17T14:31:00.000Z",
          open: 105,
          high: 110,
          low: 101,
          close: 103,
        },
        {
          timestamp: "2026-09-17T14:36:00.000Z",
          open: 103,
          high: 101,
          low: 99,
          close: 100,
        },
        {
          timestamp: "2026-09-17T14:41:00.000Z",
          open: 100,
          high: 106,
          low: 97,
          close: 104,
        },
      ],
    }).outcome;
    const excursion = entryBoundExcursionFromOutcome(outcome);

    expect(outcome.best_r).toBe(2.5);
    expect(excursion).toMatchObject({
      contract_version: "recommendation_outcome_entry_bound_excursion_v1",
      status: "measured",
      entry_triggered_at: "2026-09-17T14:36:00.000Z",
      post_entry_complete_candle_count: 1,
      mfe_r: { status: "measured", r: 1.5 },
      mae_r: { status: "measured", r: -0.75 },
    });
  });

  test("withholds an excursion when the trigger or terminal candle has unresolved intrabar order", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const triggeredAndTargetedTogether = computeRecommendationOutcome({
      snapshot,
      horizon: "60m",
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
    const targetAfterEntry = computeRecommendationOutcome({
      snapshot,
      horizon: "60m",
      evaluated_at: "2026-09-17T15:35:00.000Z",
      source: "intraday_candles",
      provider: "twelve_data",
      data_completeness: "complete",
      candles: [
        {
          timestamp: "2026-09-17T14:31:00.000Z",
          open: 100,
          high: 101,
          low: 99,
          close: 100,
        },
        {
          timestamp: "2026-09-17T14:36:00.000Z",
          open: 100,
          high: 109,
          low: 97,
          close: 108,
        },
      ],
    }).outcome;

    expect(entryBoundExcursionFromOutcome(triggeredAndTargetedTogether)).toMatchObject({
      status: "not_measurable",
      mfe_r: {
        status: "not_measurable",
        reason: "terminal_event_in_entry_trigger_candle",
      },
      mae_r: {
        status: "not_measurable",
        reason: "terminal_event_in_entry_trigger_candle",
      },
    });
    expect(entryBoundExcursionFromOutcome(targetAfterEntry)).toMatchObject({
      status: "partially_measured",
      mfe_r: { status: "measured", r: 2 },
      mae_r: {
        status: "not_measurable",
        reason: "target_terminal_candle_intrabar_order_unknown",
      },
    });
  });

  test("rejects a malformed entry-bound receipt instead of falling back to legacy excursion fields", () => {
    const { run } = persistedPublishedScan();
    const snapshot = snapshotFor(run.run_fingerprint);
    const outcome = completeOutcome(snapshot);
    const outcomePayload = outcome.payload_json as Record<string, unknown>;
    const forgedTrace = {
      ...outcome,
      payload_json: {
        ...outcomePayload,
        entry_bound_excursion: {
          ...(outcomePayload.entry_bound_excursion as Record<string, unknown>),
          blockers: ["forged_blocker"],
        },
      },
    };
    const tampered = {
      ...outcome,
      payload_json: {
        ...outcomePayload,
        entry_bound_excursion: {
          ...(outcomePayload.entry_bound_excursion as Record<string, unknown>),
          mfe_r: { status: "measured", r: -1, reason: null },
        },
      },
    };

    expect(entryBoundExcursionFromOutcome(forgedTrace)).toBeNull();
    expect(entryBoundExcursionFromOutcome(tampered)).toBeNull();
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
      contract_version: "recommendation_learning_baseline_segmentation_v2",
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
