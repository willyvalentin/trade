import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import {
  computeCanonicalQualityMetrics,
  type CanonicalQualityMetricsScorecard,
} from "@/lib/canonical-quality-metrics";
import {
  CANONICAL_QUALITY_ROLLBACK_METADATA_VERSION,
  CANONICAL_QUALITY_SCORECARD_VERSION,
  CANONICAL_QUALITY_VERSION_COMPARISON_VERSION,
  CANONICAL_SHADOW_MODEL_CHANGE_GATE_VERSION,
  canonicalQualitySemanticDigest,
  canonicalScorecardComparabilityPolicy,
  canonicalShadowModelChangePolicy,
  compareCanonicalQualityScorecards,
  verifyCanonicalQualityScorecardDigest,
  type CanonicalQualityScorecard,
} from "@/lib/canonical-quality-scorecard";
import {
  action664hBaselineAssembly,
  action664hBaselineCandidates,
  action664hBaselineMetrics,
  action664hBaselineRankingSets,
  action664hBaselineVersions,
  action664hBootstrapSeed,
  action664hCandidateImprovementAssembly,
  action664hCandidateImprovementCandidates,
  action664hCandidateRankingSets,
  action664hComparableImprovement,
  action664hGeneratedAt,
  action664hGitCommit,
  action664hIdenticalComparison,
  action664hRegressionComparison,
  action664hRollbackMetadata,
  action664hShadowGateAdvice,
  action664hWorseCalibrationComparison,
  action664hWorseExpectancyComparison,
  assembleAction664hFixtureScorecard,
  resignAction664hFixtureScorecard,
} from "@/lib/canonical-quality-scorecard-fixtures";

function filesRecursively(root: string): string[] {
  if (!statSync(root).isDirectory()) return [root];
  return readdirSync(root).flatMap((name) =>
    filesRecursively(path.join(root, name)),
  );
}

function importsModule(source: string, moduleName: string): boolean {
  const escapedModuleName = moduleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const quotedModule = `(?:\"[^\"\\n]*${escapedModuleName}(?:\\.[cm]?[jt]sx?)?\"|'[^'\\n]*${escapedModuleName}(?:\\.[cm]?[jt]sx?)?')`;
  const staticImport = new RegExp(
    `(?:^|\\n)\\s*(?:import|export)\\s+(?:(?:type\\s+)?[^;]*?\\s+from\\s+)?${quotedModule}`,
  );
  const callImport = new RegExp(
    `\\b(?:import|require)\\s*\\(\\s*${quotedModule}\\s*\\)`,
  );
  return staticImport.test(source) || callImport.test(source);
}

function allFiniteOrNull(value: unknown): boolean {
  if (value === null) return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(allFiniteOrNull);
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every(
      allFiniteOrNull,
    );
  }
  return true;
}

test("scorecard contract freezes versions and assembles only a computed 664G result", () => {
  expect(action664hBaselineAssembly.status).toBe("assembled");
  expect(action664hBaselineAssembly.scorecard).toMatchObject({
    scorecard_version: CANONICAL_QUALITY_SCORECARD_VERSION,
    metrics_policy_version: "canonical_quality_metrics_v1",
    synthetic_test_evidence_only: true,
    production_baseline: false,
    status: "publishable",
    cohort: "visible_recommendation_quality",
    generated_at: action664hGeneratedAt,
    build: {
      git_commit: action664hGitCommit,
      build_identity: "action664h-baseline-build",
    },
    automatic_promotion_allowed: false,
  });
  expect(action664hBaselineAssembly.scorecard.metrics).toEqual(
    action664hBaselineMetrics,
  );
  expect(action664hBaselineAssembly.scorecard.semantic_digest).toMatch(
    /^[a-f0-9]{64}$/,
  );
  expect(
    verifyCanonicalQualityScorecardDigest(
      action664hBaselineAssembly.scorecard,
    ),
  ).toBe(true);
});

test("denominator identity is unique, explicit, and content-addressed", () => {
  const denominator =
    action664hBaselineAssembly.scorecard.denominator_identity;
  const identities =
    action664hBaselineMetrics.comparison_evidence.eligible_identity_observations
      .map((item) => item.canonical_identity)
      .sort();
  expect(denominator).toEqual({
    method: "sha256_sorted_canonical_identities_v1",
    canonical_identity_count: 120,
    canonical_identity_set_sha256: canonicalQualitySemanticDigest(identities),
    opportunity_set_count: 30,
    opportunity_set_sha256: canonicalQualitySemanticDigest(
      action664hBaselineMetrics.comparison_evidence.complete_ranking_opportunity_sets
        .map((item) => item.opportunity_set_id)
        .sort(),
    ),
  });
});

test("undefined denominator and missing version evidence fail closed", () => {
  const emptyMetrics = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: [],
    bootstrap_seed: action664hBootstrapSeed,
  });
  const result = assembleAction664hFixtureScorecard({
    metrics: emptyMetrics,
  });
  expect(result.status).toBe("conflicting");
  expect(result.scorecard.status).toBe("conflicting");
  expect(result.reason_codes).toContain("denominator_undefined");
  expect(result.reason_codes).toContain("version_evidence_missing");
  expect(result.scorecard.denominator_identity.canonical_identity_count).toBe(
    0,
  );
});

test("metric policy, cohort, and period conflicts fail closed", () => {
  const metrics = structuredClone(
    action664hBaselineMetrics,
  ) as unknown as Record<string, unknown>;
  metrics.policy_version = "canonical_quality_metrics_v999";
  const result = assembleAction664hFixtureScorecard({
    metrics: metrics as unknown as CanonicalQualityMetricsScorecard,
    cohort: "research_only_recommendation_quality",
  });
  expect(result.status).toBe("conflicting");
  expect(result.reason_codes).toEqual(
    expect.arrayContaining([
      "metrics_policy_version_conflict",
      "explicit_cohort_conflict",
    ]),
  );
});

test("assembly is deterministic across 664G input ordering", () => {
  const reversedMetrics = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: structuredClone(action664hBaselineCandidates).reverse(),
    ranking_opportunity_sets: structuredClone(
      action664hBaselineRankingSets,
    ).reverse(),
    bootstrap_seed: action664hBootstrapSeed,
  });
  expect(reversedMetrics).toEqual(action664hBaselineMetrics);
  const reversedAssembly = assembleAction664hFixtureScorecard({
    metrics: reversedMetrics,
    build_identity: "action664h-baseline-build",
  });
  expect(reversedAssembly.scorecard).toEqual(
    action664hBaselineAssembly.scorecard,
  );
});

test("comparable A/B scorecards produce versioned deltas with clustered uncertainty", () => {
  expect(action664hComparableImprovement).toMatchObject({
    comparison_version: CANONICAL_QUALITY_VERSION_COMPARISON_VERSION,
    comparability_status: "comparable",
    classification: "candidate_improvement",
    paired_identity_evidence: true,
    paired_opportunity_set_evidence: true,
    causal_improvement_claimed: false,
    automatic_promotion_executed: false,
  });
  expect(action664hComparableImprovement.deltas.expectancy_r.delta).toBeGreaterThan(
    0,
  );
  expect(
    action664hComparableImprovement.deltas.expectancy_r.confidence_interval,
  ).toMatchObject({
    method: "seeded_trading_day_cluster_bootstrap_v1",
    bootstrap_seed: `${action664hBootstrapSeed}:expectancy_r`,
    bootstrap_iterations: 1_000,
  });
  expect(
    action664hComparableImprovement.deltas.brier_score.delta,
  ).toBeLessThan(0);
  expect(
    action664hComparableImprovement.deltas.precision_at_k["5"].delta,
  ).toBeGreaterThan(0);
});

test("identical scorecards are non-inferior and never promoted", () => {
  expect(action664hIdenticalComparison).toMatchObject({
    comparability_status: "comparable",
    classification: "non_inferior",
    automatic_promotion_executed: false,
    causal_improvement_claimed: false,
  });
  expect(action664hIdenticalComparison.deltas.expectancy_r.delta).toBe(0);
  expect(action664hIdenticalComparison.deltas.brier_score.delta).toBe(0);
});

test("different cohorts are not comparable", () => {
  const research = structuredClone(
    action664hCandidateImprovementAssembly.scorecard,
  );
  research.cohort = "research_only_recommendation_quality";
  research.metrics.cohort = "research_only_recommendation_quality";
  research.metrics.diagnostics.explicit_cohort =
    "research_only_recommendation_quality";
  const resigned = resignAction664hFixtureScorecard(research);
  const comparison = compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: resigned,
    bootstrap_seed: action664hBootstrapSeed,
  });
  expect(comparison.comparability_status).toBe("not_comparable");
  expect(comparison.classification).toBe("not_comparable");
  expect(comparison.reason_codes).toContain("cohort_not_comparable");
});

test("different denominator and opportunity set are not implicitly compared", () => {
  const smallerMetrics = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: action664hCandidateImprovementCandidates.slice(1),
    ranking_opportunity_sets: action664hCandidateRankingSets.slice(1),
    bootstrap_seed: action664hBootstrapSeed,
  });
  const smaller = assembleAction664hFixtureScorecard({
    metrics: smallerMetrics,
  });
  const comparison = compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: smaller.scorecard,
    bootstrap_seed: action664hBootstrapSeed,
  });
  expect(comparison.comparability_status).toBe("not_comparable");
  expect(comparison.reason_codes).toEqual(
    expect.arrayContaining([
      "denominator_not_comparable",
      "opportunity_set_not_comparable",
    ]),
  );
});

test("different policy versions are not comparable", () => {
  const changed = structuredClone(
    action664hCandidateImprovementAssembly.scorecard,
  ) as unknown as Record<string, unknown>;
  changed.metrics_policy_version = "canonical_quality_metrics_v2";
  const resigned = resignAction664hFixtureScorecard(
    changed as unknown as CanonicalQualityScorecard,
  );
  const comparison = compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: resigned,
    bootstrap_seed: action664hBootstrapSeed,
  });
  expect(comparison.comparability_status).toBe("not_comparable");
  expect(comparison.reason_codes).toContain(
    "metrics_policy_not_comparable",
  );
});

test("insufficient sample is classified without a misleading comparison", () => {
  const smallMetrics = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: action664hCandidateImprovementCandidates.slice(0, 10),
    ranking_opportunity_sets: action664hCandidateRankingSets,
    bootstrap_seed: action664hBootstrapSeed,
  });
  const small = assembleAction664hFixtureScorecard({
    metrics: smallMetrics,
  });
  const comparison = compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: small.scorecard,
    bootstrap_seed: action664hBootstrapSeed,
  });
  expect(comparison.comparability_status).toBe("not_comparable");
  expect(comparison.classification).toBe("not_comparable");
  expect(comparison.deltas.expectancy_r.delta).toBeNull();
});

test("expectancy/calibration tradeoffs remain explicit", () => {
  expect(action664hWorseCalibrationComparison.comparability_status).toBe(
    "comparable",
  );
  expect(
    action664hWorseCalibrationComparison.deltas.expectancy_r.delta,
  ).toBeGreaterThan(0);
  expect(
    action664hWorseCalibrationComparison.deltas.brier_score.delta,
  ).toBeGreaterThan(0);
  expect(action664hWorseCalibrationComparison.classification).not.toBe(
    "candidate_improvement",
  );

  expect(action664hWorseExpectancyComparison.comparability_status).toBe(
    "comparable",
  );
  expect(
    action664hWorseExpectancyComparison.deltas.brier_score.delta,
  ).toBeLessThan(0);
  expect(
    action664hWorseExpectancyComparison.deltas.expectancy_r.delta,
  ).toBeLessThan(0);
  expect(action664hWorseExpectancyComparison.classification).not.toBe(
    "candidate_improvement",
  );
});

test("clear regression is classified as regression", () => {
  expect(action664hRegressionComparison).toMatchObject({
    comparability_status: "comparable",
    classification: "regression",
  });
  expect(action664hRegressionComparison.deltas.expectancy_r.delta).toBeLessThan(
    0,
  );
  expect(
    action664hRegressionComparison.deltas.precision_at_k["5"].delta,
  ).toBeLessThan(0);
});

test("comparison is input-order deterministic with a stable seed", () => {
  const reversedMetrics = computeCanonicalQualityMetrics({
    cohort: "visible_recommendation_quality",
    candidates: structuredClone(
      action664hCandidateImprovementCandidates,
    ).reverse(),
    ranking_opportunity_sets: structuredClone(
      action664hCandidateRankingSets,
    ).reverse(),
    bootstrap_seed: action664hBootstrapSeed,
  });
  const reversedAssembly = assembleAction664hFixtureScorecard({
    metrics: reversedMetrics,
    build_identity: "action664h-candidate-build",
  });
  const comparison = compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: reversedAssembly.scorecard,
    bootstrap_seed: action664hBootstrapSeed,
  });
  expect(comparison).toEqual(action664hComparableImprovement);
});

test("tampered scorecard digest fails the comparability gate", () => {
  const tampered = structuredClone(
    action664hCandidateImprovementAssembly.scorecard,
  );
  tampered.versions.engine = "tampered-engine";
  expect(verifyCanonicalQualityScorecardDigest(tampered)).toBe(false);
  const comparison = compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: tampered,
    bootstrap_seed: action664hBootstrapSeed,
  });
  expect(comparison.comparability_status).toBe("not_comparable");
  expect(comparison.reason_codes).toContain(
    "scorecard_semantic_digest_mismatch",
  );
});

test("shadow gates are advisory and include every required safeguard", () => {
  expect(CANONICAL_SHADOW_MODEL_CHANGE_GATE_VERSION).toBe(
    "canonical_shadow_model_change_gate_v1",
  );
  expect(canonicalShadowModelChangePolicy).toMatchObject({
    minimum_identities: 100,
    minimum_trading_days: 20,
    minimum_tickers: 20,
    minimum_coverage_rate: 0.95,
    minimum_reproducibility_rate: 0.99,
    maximum_brier_regression: 0.01,
    maximum_incomplete_rate: 0.02,
    maximum_ambiguous_rate: 0.01,
  });
  expect(action664hShadowGateAdvice.advisory_only).toBe(true);
  expect(action664hShadowGateAdvice.automatic_promotion_executed).toBe(false);
  expect(action664hShadowGateAdvice.status).toBe("advisory_reject");
  expect(action664hShadowGateAdvice.gates.map((gate) => gate.gate)).toEqual(
    expect.arrayContaining([
      "minimum_identities",
      "minimum_trading_days",
      "minimum_tickers",
      "coverage_rate",
      "reproducibility_rate",
      "expectancy_non_inferiority",
      "win_rate_uncertainty",
      "brier_regression",
      "ece_regression",
      "precision_at_5",
      "no_trade_opportunity_cost",
      "missing_rate",
      "incomplete_rate",
      "ambiguous_rate",
    ]),
  );
  expect(
    action664hShadowGateAdvice.gates.find(
      (gate) => gate.gate === "no_trade_opportunity_cost",
    )?.status,
  ).toBe("not_evaluable");
});

test("rollback metadata is explicit and forbids automatic promotion", () => {
  expect(action664hRollbackMetadata).toMatchObject({
    metadata_version: CANONICAL_QUALITY_ROLLBACK_METADATA_VERSION,
    previous_versions: action664hBaselineVersions,
    candidate_versions:
      action664hCandidateImprovementAssembly.scorecard.versions,
    kill_switch_owner: "UNASSIGNED",
    no_automatic_promotion: true,
  });
  expect(action664hRollbackMetadata.evidence_digests).toHaveLength(3);
  expect(
    action664hRollbackMetadata.evidence_digests.every((digest) =>
      /^[a-f0-9]{64}$/.test(digest),
    ),
  ).toBe(true);
});

test("comparison policy and every numeric output are finite", () => {
  expect(canonicalScorecardComparabilityPolicy).toMatchObject({
    minimum_identities: 20,
    minimum_trading_days: 5,
    minimum_tickers: 4,
    bootstrap_iterations: 1_000,
  });
  expect(allFiniteOrNull(action664hComparableImprovement)).toBe(true);
  expect(JSON.stringify(action664hComparableImprovement)).not.toMatch(
    /NaN|Infinity/,
  );
});

test("synthetic versions report matches the computed contract", () => {
  const report = JSON.parse(
    readFileSync(
      "docs/action-664h-golden-version-comparison.json",
      "utf8",
    ),
  ) as {
    scorecard_version: string;
    comparison_version: string;
    synthetic_test_evidence_only: boolean;
    production_baseline: boolean;
    golden_comparison: {
      classification: string;
      expectancy_delta_r: number;
      baseline_digest: string;
      candidate_digest: string;
    };
  };
  expect(report).toMatchObject({
    scorecard_version: CANONICAL_QUALITY_SCORECARD_VERSION,
    comparison_version: CANONICAL_QUALITY_VERSION_COMPARISON_VERSION,
    synthetic_test_evidence_only: true,
    production_baseline: false,
  });
  expect(report.golden_comparison).toEqual({
    classification: action664hComparableImprovement.classification,
    expectancy_delta_r:
      action664hComparableImprovement.deltas.expectancy_r.delta,
    baseline_digest:
      action664hBaselineAssembly.scorecard.semantic_digest,
    candidate_digest:
      action664hCandidateImprovementAssembly.scorecard.semantic_digest,
  });
});

test("scorecard and comparison contracts remain absent from live consumers", () => {
  const source = readFileSync("lib/canonical-quality-scorecard.ts", "utf8");
  expect(source).not.toMatch(
    /supabase|provider-fetch|scanner|collector|fetch\s*\(|\.insert\s*\(|\.upsert\s*\(|\.delete\s*\(|\.rpc\s*\(/i,
  );
  expect(source).toContain("automatic_promotion_executed: false");
  expect(source).toContain("no_automatic_promotion: true");

  const importers = ["app", "components", "scripts"]
    .flatMap(filesRecursively)
    .filter((file) => /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(file))
    .filter((file) =>
      importsModule(readFileSync(file, "utf8"), "canonical-quality-scorecard"),
    );
  expect(importers).toEqual([]);
  expect(
    importsModule(
      'const testPath = "tests/e2e/action-664h-canonical-quality-scorecard.spec.ts";',
      "canonical-quality-scorecard",
    ),
  ).toBe(false);
  expect(
    importsModule(
      'import { compareCanonicalQualityScorecards } from "@/lib/canonical-quality-scorecard";',
      "canonical-quality-scorecard",
    ),
  ).toBe(true);
  expect(
    importsModule(
      'const scorecard = require("../lib/canonical-quality-scorecard");',
      "canonical-quality-scorecard",
    ),
  ).toBe(true);
  expect(
    importsModule(
      'const scorecard = import("../lib/canonical-quality-scorecard");',
      "canonical-quality-scorecard",
    ),
  ).toBe(true);
});
