import { expect, test } from "@playwright/test";

import { buildBatchCandidateAuditSummary } from "../../lib/batch-candidate-audit";
import {
  buildSelectedCandidateBuildDiagnostic,
  normalizeCandidateBuildRejectionReason,
  summarizeSelectedCandidateBuildDiagnostics,
} from "../../lib/recommendation-build-diagnostics";

test("broad no-trade candidate reasons split into exact build reasons", () => {
  expect(
    normalizeCandidateBuildRejectionReason(
      "AMD: scanner_cache_reference_too_old (scanner_candidate.latest_close)",
    ),
  ).toBe("scanner_cache_reference_too_old");
  expect(
    normalizeCandidateBuildRejectionReason(
      "NVDA: missing_fresh_reference_price (unknown_source)",
    ),
  ).toBe("missing_fresh_reference_price");
  expect(normalizeCandidateBuildRejectionReason("sanitizer rejected plan")).toBe(
    "sanitizer_rejected",
  );
});

test("selected candidates produce build diagnostics with examples", () => {
  const diagnostics = [
    buildSelectedCandidateBuildDiagnostic({
      ticker: "AMD",
      score: 86,
      tier: "strong",
      setupType: "VWAP_HOLD_CONTINUATION",
      source: "base_universe",
      referencePriceStatus: "complete",
      vwapStatus: "above_vwap",
      momentumStatus: "bullish",
      volumeStatus: "rising",
      riskGeometryStatus: "valid",
      enoughDataToBuildPlan: true,
      built: true,
    }),
    buildSelectedCandidateBuildDiagnostic({
      ticker: "MSFT",
      score: 78,
      tier: "valid",
      setupType: "PULLBACK_RECLAIM",
      source: "base_universe",
      referencePriceStatus: "missing_price",
      vwapStatus: "unknown",
      momentumStatus: "mixed",
      volumeStatus: "flat",
      riskGeometryStatus: "not_checked",
      enoughDataToBuildPlan: false,
      built: false,
      rejectionReason: "missing_fresh_reference_price",
    }),
  ];

  const summary = summarizeSelectedCandidateBuildDiagnostics(diagnostics, 6);

  expect(summary.selected_count).toBe(2);
  expect(summary.built_count).toBe(1);
  expect(summary.rejection_counts.missing_fresh_reference_price).toBe(1);
  expect(summary.examples_by_reason.missing_fresh_reference_price).toEqual([
    "MSFT",
  ]);
  expect(summary.output_below_target_reason_category).toBe("data_quality");
});

test("batch audit uses exact selected-to-built diagnostics instead of generic no-trade", () => {
  const diagnostics = [
    buildSelectedCandidateBuildDiagnostic({
      ticker: "AMD",
      built: true,
      enoughDataToBuildPlan: true,
      riskGeometryStatus: "valid",
    }),
    buildSelectedCandidateBuildDiagnostic({
      ticker: "AAPL",
      built: false,
      enoughDataToBuildPlan: false,
      rejectionReason: "scanner_cache_reference_too_old",
    }),
    buildSelectedCandidateBuildDiagnostic({
      ticker: "MSFT",
      built: false,
      enoughDataToBuildPlan: false,
      rejectionReason: "missing_fresh_reference_price",
    }),
  ];

  const audit = buildBatchCandidateAuditSummary({
    rawCandidatesCount: 3,
    rankedCandidatesCount: 3,
    selectedCandidatesCount: 3,
    builtRecommendationsCount: 1,
    publishedRecommendationsCount: 1,
    persistedRecommendationRowsCount: 1,
    selectedCandidateBuildDiagnostics: diagnostics,
  });

  expect(audit.drop_off_reasons.no_trade_candidate).toBe(0);
  expect(audit.drop_off_reasons.scanner_cache_reference_too_old).toBe(1);
  expect(audit.drop_off_reasons.missing_fresh_reference_price).toBe(1);
  expect(audit.selected_to_built_drop_off?.rejected_count).toBe(2);
});

test("batch audit reconciles sparse scan-run counters from persisted rows", () => {
  const audit = buildBatchCandidateAuditSummary({
    scanRunFingerprint: "rec_scan_run_vlz162",
    batchFingerprint: "rec_batch_1vxtb7z",
    rawCandidatesCount: 22,
    rankedCandidatesCount: 22,
    selectedCandidatesCount: 14,
    builtRecommendationsCount: 0,
    publishedRecommendationsCount: 0,
    persistedRecommendationRowsCount: 6,
    persistedSnapshotRowsCount: 12,
    uniqueSnapshotFingerprintsCount: 6,
    visibleGridCardsCount: 6,
    outcomeEligibleSnapshotCount: 6,
    selectedToBuiltDropOff: {
      selected_count: 14,
      built_count: 6,
      rejected_count: 8,
      rejection_counts: {
        below_publish_threshold: 8,
      },
      category_counts: {
        data_quality: 8,
      },
      examples_by_reason: {
        below_publish_threshold: ["BAC", "JPM", "MSFT"],
      },
      output_below_target_reason_category: "healthy_caution",
      output_below_target_explanation:
        "8 selected candidates were below the publish threshold.",
    },
  });

  expect(audit.raw_scan_run_built_count).toBe(0);
  expect(audit.raw_scan_run_published_count).toBe(0);
  expect(audit.built_recommendations_count).toBe(6);
  expect(audit.published_recommendations_count).toBe(6);
  expect(audit.effective_built_recommendations_count).toBe(6);
  expect(audit.effective_published_recommendations_count).toBe(6);
  expect(audit.reconciled_from_persisted_rows).toBe(true);
  expect(audit.counter_reconciliation).toBe(
    "scan_run_sparse_reconciled_from_persisted_rows",
  );
  expect(audit.counter_reconciliation_note).toContain(
    "reconciled from persisted recommendation rows",
  );
  expect(audit.batch_completeness).toBe("complete");
  expect(audit.largest_drop_off_stage).toBe("selected_to_published_or_threshold");
  expect(audit.largest_drop_off_count).toBe(8);
  expect(audit.drop_off_reasons.below_publish_threshold).toBe(8);
  expect(audit.drop_off_reasons.no_trade_candidate).toBe(0);
  expect(audit.drop_off_reasons.duplicate_snapshot_fingerprint).toBe(6);
  expect(audit.missing_snapshot_count).toBe(0);
});

test("batch audit keeps truly empty batches at zero", () => {
  const audit = buildBatchCandidateAuditSummary({
    scanRunFingerprint: "rec_scan_run_empty",
    batchFingerprint: null,
    rawCandidatesCount: 0,
    rankedCandidatesCount: 0,
    selectedCandidatesCount: 0,
    builtRecommendationsCount: 0,
    publishedRecommendationsCount: 0,
    persistedRecommendationRowsCount: 0,
    persistedSnapshotRowsCount: 0,
    uniqueSnapshotFingerprintsCount: 0,
    visibleGridCardsCount: 0,
    outcomeEligibleSnapshotCount: 0,
  });

  expect(audit.raw_scan_run_built_count).toBe(0);
  expect(audit.raw_scan_run_published_count).toBe(0);
  expect(audit.effective_built_recommendations_count).toBe(0);
  expect(audit.effective_published_recommendations_count).toBe(0);
  expect(audit.reconciled_from_persisted_rows).toBe(false);
  expect(audit.counter_reconciliation).toBe("none");
  expect(audit.batch_completeness).toBe("empty");
});

test("missing provider or reference data is not mislabeled as generic no-trade", () => {
  const diagnostic = buildSelectedCandidateBuildDiagnostic({
    ticker: "META",
    built: false,
    enoughDataToBuildPlan: false,
    referencePriceStatus: "missing_price",
    rejectionReason: "provider_data_unavailable",
  });
  const summary = summarizeSelectedCandidateBuildDiagnostics([diagnostic], 6);

  expect(diagnostic.rejection_reason).toBe("provider_data_unavailable");
  expect(diagnostic.rejection_category).toBe("provider");
  expect(summary.rejection_counts.provider_data_unavailable).toBe(1);
});

test("valid deterministic fallback candidate can be marked built", () => {
  const diagnostic = buildSelectedCandidateBuildDiagnostic({
    ticker: "AMD",
    side: "long",
    score: 84,
    tier: "strong",
    setupType: "BREAKOUT_CONTINUATION",
    source: "dynamic_mover",
    referencePriceStatus: "complete",
    referencePriceSource: "provider_quote_price",
    vwapStatus: "above_vwap",
    momentumStatus: "bullish",
    volumeStatus: "rising",
    riskGeometryStatus: "valid",
    enoughDataToBuildPlan: true,
    built: true,
  });

  expect(diagnostic.built).toBe(true);
  expect(diagnostic.rejection_reason).toBe("built");
  expect(diagnostic.enough_data_to_build_plan).toBe(true);
});

test("invalid risk geometry blocks safely with safety category", () => {
  const diagnostic = buildSelectedCandidateBuildDiagnostic({
    ticker: "TSLA",
    built: false,
    enoughDataToBuildPlan: false,
    riskGeometryStatus: "invalid_long_geometry",
    rejectionReason: "invalid_risk_geometry",
  });
  const summary = summarizeSelectedCandidateBuildDiagnostics([diagnostic], 6);

  expect(diagnostic.rejection_category).toBe("safety");
  expect(summary.output_below_target_reason_category).toBe("safety");
});
