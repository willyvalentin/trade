import { expect, test } from "@playwright/test";

import {
  aggregateCanonicalProjectionCoverage,
  projectHistoricalSyntheticDecision,
  projectRecommendationBatchDecision,
  projectRecommendationOutcomeBundle,
  projectRecommendationScanRunDecision,
  projectRecommendationSnapshotDecision,
  projectScannerCandidateDecision,
  type CanonicalProjectionResult,
} from "../../lib/canonical-evaluation-projection-adapters";
import {
  action664bContextOnlyBatch,
  action664bDuplicateHorizonOutcomes,
  action664bDuplicateHorizonSnapshot,
  action664bFixtureMetadata,
  action664bHistoricalMetadata,
  action664bHistoricalReplay,
  action664bLegacySnapshotWithoutDecisionId,
  action664bMissingVersionsSnapshot,
  action664bNoTradeBatch,
  action664bNoTradeMetadata,
  action664bProviderGapOutcomes,
  action664bProviderGapSnapshot,
  action664bRejectedBatch,
  action664bRejectedBuildDiagnostic,
  action664bRejectedCandidate,
  action664bRejectedMetadata,
  action664bRejectedRanking,
  action664bResearchMetadata,
  action664bResearchSnapshot,
  action664bSampleConflictSnapshot,
  action664bScanRun,
  action664bShadowCandidate,
  action664bShadowMetadata,
  action664bVisibleBatch,
  action664bVisibleMetadata,
  action664bVisibleOutcomes,
  action664bVisibleSnapshot,
} from "../../lib/canonical-evaluation-projection-fixtures";
import { action664aGoldenVersions } from "../../lib/canonical-recommendation-evaluation-fixtures";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function diagnosticCodes(result: CanonicalProjectionResult) {
  return result.diagnostics.map((item) => item.code);
}

function allFixtureResults() {
  const visible = projectRecommendationOutcomeBundle({
    snapshot: action664bVisibleSnapshot,
    outcomes: action664bVisibleOutcomes,
    batch: action664bVisibleBatch,
    scan_run: action664bScanRun,
    metadata: action664bVisibleMetadata,
  });
  const research = projectRecommendationSnapshotDecision({
    snapshot: action664bResearchSnapshot,
    metadata: action664bResearchMetadata,
  });
  const shadow = projectScannerCandidateDecision({
    candidate: action664bShadowCandidate,
    metadata: action664bShadowMetadata,
  });
  const historical = projectHistoricalSyntheticDecision({
    replay: action664bHistoricalReplay,
    metadata: action664bHistoricalMetadata,
  });
  const rejected = projectScannerCandidateDecision({
    candidate: action664bRejectedCandidate,
    ranking: action664bRejectedRanking,
    build_diagnostic: action664bRejectedBuildDiagnostic,
    batch: action664bRejectedBatch,
    metadata: action664bRejectedMetadata,
  });
  const noTrade = projectRecommendationBatchDecision({
    batch: action664bNoTradeBatch,
    scan_run: action664bScanRun,
    metadata: action664bNoTradeMetadata,
  });
  const legacy = projectRecommendationSnapshotDecision({
    snapshot: action664bLegacySnapshotWithoutDecisionId,
    metadata: action664bFixtureMetadata(),
  });
  const sampleConflict = projectRecommendationSnapshotDecision({
    snapshot: action664bSampleConflictSnapshot,
    metadata: action664bFixtureMetadata(),
  });
  const missingVersions = projectRecommendationSnapshotDecision({
    snapshot: action664bMissingVersionsSnapshot,
  });
  const duplicateHorizon = projectRecommendationOutcomeBundle({
    snapshot: action664bDuplicateHorizonSnapshot,
    outcomes: action664bDuplicateHorizonOutcomes,
    metadata: action664bFixtureMetadata(),
  });
  const providerGap = projectRecommendationOutcomeBundle({
    snapshot: action664bProviderGapSnapshot,
    outcomes: action664bProviderGapOutcomes,
    metadata: action664bFixtureMetadata(),
  });
  const rejectedWithoutBatch = projectScannerCandidateDecision({
    candidate: action664bRejectedCandidate,
    ranking: action664bRejectedRanking,
    build_diagnostic: action664bRejectedBuildDiagnostic,
    metadata: action664bRejectedMetadata,
  });

  return {
    visible,
    research,
    shadow,
    historical,
    rejected,
    noTrade,
    legacy,
    sampleConflict,
    missingVersions,
    duplicateHorizon,
    providerGap,
    rejectedWithoutBatch,
    all: [
      visible,
      research,
      shadow,
      historical,
      rejected,
      noTrade,
      legacy,
      sampleConflict,
      missingVersions,
      duplicateHorizon,
      providerGap,
      rejectedWithoutBatch,
    ],
  };
}

test.describe("Action 664B canonical evaluation projection adapters", () => {
  test("fully mapped visible recommendation preserves identity, lineage, confidence, versions, and context", () => {
    const result = allFixtureResults().visible;

    expect(result.status).toBe("mapped");
    expect(result.projection).toMatchObject({
      source: "recommendation_outcome_bundle",
      source_namespace: "recommendation_snapshot",
      producer_decision_id: "recommendation-visible-001",
      decision_timestamp: "2026-07-08T13:32:00.000Z",
      sample_type: "visible",
      confidence: {
        numeric_confidence: 0.78,
        numeric_confidence_scale: "probability_0_1",
        confidence_label: null,
      },
      relations: {
        candidate_id: "candidate-visible-001",
        batch_id: "batch-001",
        batch_fingerprint: "batch-fingerprint-001",
        scan_run_id: "scan-run-001",
        scan_run_fingerprint: "scan-run-fingerprint-001",
        snapshot_id: "snapshot-visible-001",
        recommendation_id: "recommendation-visible-001",
      },
      context: {
        regime: "risk_on",
        sector: "Technology",
        freshness: "fresh",
        provider: "golden_provider",
      },
    });
    expect(result.projection.canonical_identity).toBe(
      "rec_decision:v1:recommendation_snapshot:recommendation-visible-001:1783517520000",
    );
    expect(result.projection.versions).toEqual(action664aGoldenVersions);
  });

  test("existing 15m, 30m, and 60m rows use the 664A primary policy without inflation", () => {
    const result = allFixtureResults().visible;

    expect(result.projection.outcome_rows.map((row) => row.horizon)).toEqual([
      "15m",
      "30m",
      "60m",
    ]);
    expect(result.projection.primary_outcome).toMatchObject({
      status: "selected",
      primary_horizon: "60m",
      canonical_outcome_count: 1,
    });
    expect(result.projection.primary_outcome?.diagnostic_outcomes).toHaveLength(
      2,
    );
  });

  test("all six exclusive sample types have a fully mapped fixture", () => {
    const fixtures = allFixtureResults();
    const mapped = [
      fixtures.visible,
      fixtures.research,
      fixtures.shadow,
      fixtures.historical,
      fixtures.rejected,
      fixtures.noTrade,
    ];

    expect(mapped.map((item) => item.status)).toEqual([
      "mapped",
      "mapped",
      "mapped",
      "mapped",
      "mapped",
      "mapped",
    ]);
    expect(mapped.map((item) => item.projection.sample_type)).toEqual([
      "visible",
      "research_only",
      "shadow",
      "historical_synthetic",
      "rejected_candidate",
      "no_trade",
    ]);
  });

  test("legacy snapshot ID and fingerprint never substitute for missing producer decision ID", () => {
    const result = allFixtureResults().legacy;

    expect(result.status).toBe("unmappable");
    expect(result.projection.producer_decision_id).toBeNull();
    expect(result.projection.canonical_identity).toBeNull();
    expect(diagnosticCodes(result)).toContain("missing_producer_decision_id");
  });

  test("visible and research-only evidence for one snapshot is conflicting", () => {
    const result = allFixtureResults().sampleConflict;

    expect(result.status).toBe("conflicting");
    expect(result.projection.sample_type).toBeNull();
    expect(diagnosticCodes(result)).toContain("conflicting_sample_type");
  });

  test("missing versions metadata is unmappable and no defaults are invented", () => {
    const result = allFixtureResults().missingVersions;

    expect(result.status).toBe("unmappable");
    expect(result.projection.versions).toBeNull();
    expect(result.projection.decision).toBeNull();
    expect(diagnosticCodes(result)).toContain("missing_versions_metadata");
  });

  test("duplicate horizons remain visible and block primary selection", () => {
    const result = allFixtureResults().duplicateHorizon;

    expect(result.status).toBe("conflicting");
    expect(result.projection.outcome_rows).toHaveLength(3);
    expect(result.projection.primary_outcome).toMatchObject({
      status: "incomplete",
      primary_horizon: null,
      canonical_outcome_count: 0,
      reason_codes: ["duplicate_60m_outcome"],
    });
    expect(diagnosticCodes(result)).toContain("duplicate_60m_outcome");
  });

  test("provider-gap outcome maps the decision but remains evaluation-incomplete", () => {
    const result = allFixtureResults().providerGap;

    expect(result.status).toBe("mapped");
    expect(result.projection.evaluation_readiness).toBe("incomplete");
    expect(result.projection.outcome_rows[0].coverage.status).toBe(
      "provider_gap",
    );
    expect(result.projection.primary_outcome).toMatchObject({
      status: "incomplete",
      primary_horizon: null,
      canonical_outcome_count: 0,
    });
  });

  test("no-trade decision maps without pretending counterfactual coverage exists", () => {
    const result = allFixtureResults().noTrade;

    expect(result.status).toBe("mapped");
    expect(result.projection.sample_type).toBe("no_trade");
    expect(result.projection.evaluation_readiness).toBe("not_evaluable");
    expect(result.projection.context.provider_coverage).toBeNull();
    expect(diagnosticCodes(result)).toContain(
      "no_trade_counterfactual_not_evaluable",
    );
  });

  test("rejected candidate requires an explicit joinable batch", () => {
    const fixtures = allFixtureResults();

    expect(fixtures.rejected.status).toBe("mapped");
    expect(fixtures.rejected.projection.relations).toMatchObject({
      candidate_id: "candidate-rejected-001",
      batch_id: "batch-rejected-context-001",
      batch_fingerprint: "batch-rejected-context-fingerprint-001",
    });
    expect(fixtures.rejectedWithoutBatch.status).toBe("unmappable");
    expect(diagnosticCodes(fixtures.rejectedWithoutBatch)).toContain(
      "rejected_candidate_missing_joinable_batch",
    );
  });

  test("ranking score is not silently converted to numeric confidence", () => {
    const result = projectScannerCandidateDecision({
      candidate: action664bShadowCandidate,
      ranking: {
        ...action664bRejectedRanking,
        ticker: action664bShadowCandidate.ticker,
        score: {
          ...action664bRejectedRanking.score,
          normalized_score: 91,
        },
      },
      metadata: {
        ...action664bShadowMetadata,
        numeric_confidence: null,
        confidence_label: null,
      },
    });

    expect(result.status).toBe("mapped");
    expect(result.projection.confidence.numeric_confidence).toBeNull();
    expect(result.projection.confidence.confidence_label).toBeNull();
  });

  test("out-of-range legacy confidence is rejected instead of rescaled", () => {
    const result = projectRecommendationSnapshotDecision({
      snapshot: {
        ...action664bVisibleSnapshot,
        confidence: 78,
      },
      metadata: action664bFixtureMetadata(),
    });

    expect(result.status).toBe("unmappable");
    expect(result.projection.confidence.numeric_confidence).toBeNull();
    expect(diagnosticCodes(result)).toContain(
      "numeric_confidence_not_probability",
    );
  });

  test("snapshot, batch, scan-run, and outcome relation contradictions are explicit", () => {
    const result = projectRecommendationOutcomeBundle({
      snapshot: action664bVisibleSnapshot,
      outcomes: [
        {
          ...action664bVisibleOutcomes[0],
          recommendation_id: "different-recommendation",
        },
      ],
      batch: {
        ...action664bVisibleBatch,
        recommendation_snapshot_ids: [],
        recommendation_snapshot_fingerprints: [],
      },
      scan_run: {
        ...action664bScanRun,
        id: "different-scan-run",
      },
      metadata: action664bVisibleMetadata,
    });

    expect(result.status).toBe("conflicting");
    expect(diagnosticCodes(result)).toEqual(
      expect.arrayContaining([
        "outcome_recommendation_relation_conflict",
        "snapshot_batch_membership_conflict",
        "snapshot_scan_run_conflict",
      ]),
    );
  });

  test("normal batches and scan runs remain context-only instead of becoming fabricated decisions", () => {
    const normalBatch = projectRecommendationBatchDecision({
      batch: action664bContextOnlyBatch,
      scan_run: action664bScanRun,
      metadata: action664bFixtureMetadata(),
    });
    const scanRun = projectRecommendationScanRunDecision({
      scan_run: action664bScanRun,
      metadata: action664bFixtureMetadata({
        producer_decision_id: "must-not-promote-scan-run",
        decision_timestamp: "2026-07-08T13:31:00.000Z",
        sample_type: "visible",
      }),
    });

    expect(normalBatch.status).toBe("unmappable");
    expect(diagnosticCodes(normalBatch)).toContain(
      "batch_is_context_not_single_decision",
    );
    expect(scanRun.status).toBe("unmappable");
    expect(diagnosticCodes(scanRun)).toContain(
      "scan_run_is_context_not_recommendation_decision",
    );
  });

  test("coverage aggregator counts status per source and sample type", () => {
    const coverage = aggregateCanonicalProjectionCoverage(
      allFixtureResults().all,
    );

    expect(coverage.overall).toEqual({
      total: 12,
      mapped: 7,
      conflicting: 2,
      unmappable: 3,
    });
    expect(coverage.by_source).toEqual({
      historical_replay: {
        total: 1,
        mapped: 1,
        conflicting: 0,
        unmappable: 0,
      },
      recommendation_batch: {
        total: 1,
        mapped: 1,
        conflicting: 0,
        unmappable: 0,
      },
      recommendation_outcome_bundle: {
        total: 3,
        mapped: 2,
        conflicting: 1,
        unmappable: 0,
      },
      recommendation_snapshot: {
        total: 4,
        mapped: 1,
        conflicting: 1,
        unmappable: 2,
      },
      scanner_candidate: {
        total: 3,
        mapped: 2,
        conflicting: 0,
        unmappable: 1,
      },
    });
    expect(coverage.by_sample_type).toEqual({
      historical_synthetic: {
        total: 1,
        mapped: 1,
        conflicting: 0,
        unmappable: 0,
      },
      no_trade: {
        total: 1,
        mapped: 1,
        conflicting: 0,
        unmappable: 0,
      },
      rejected_candidate: {
        total: 2,
        mapped: 1,
        conflicting: 0,
        unmappable: 1,
      },
      research_only: {
        total: 1,
        mapped: 1,
        conflicting: 0,
        unmappable: 0,
      },
      shadow: {
        total: 1,
        mapped: 1,
        conflicting: 0,
        unmappable: 0,
      },
      unknown: {
        total: 1,
        mapped: 0,
        conflicting: 1,
        unmappable: 0,
      },
      visible: {
        total: 5,
        mapped: 2,
        conflicting: 1,
        unmappable: 2,
      },
    });
  });

  test("adapter replay and coverage aggregation are deterministic and immutable", () => {
    const frozen = deepFreeze({
      snapshot: clone(action664bVisibleSnapshot),
      outcomes: clone(action664bVisibleOutcomes),
      batch: clone(action664bVisibleBatch),
      scan_run: clone(action664bScanRun),
      metadata: clone(action664bVisibleMetadata),
    });
    const first = projectRecommendationOutcomeBundle(frozen);
    const second = projectRecommendationOutcomeBundle(frozen);
    const firstCoverage = aggregateCanonicalProjectionCoverage([first, second]);
    const secondCoverage = aggregateCanonicalProjectionCoverage([first, second]);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(JSON.stringify(firstCoverage)).toBe(JSON.stringify(secondCoverage));
    expect(frozen.snapshot).toEqual(action664bVisibleSnapshot);
  });
});
