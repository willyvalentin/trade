import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import {
  buildCanonicalEvaluationStoragePayload,
} from "@/lib/canonical-evaluation-persistence-contract";
import { action664cVisibleEnvelopeResult } from "@/lib/canonical-evaluation-persistence-fixtures";
import {
  computeCanonicalQualityMetrics,
  type CanonicalCounterfactualOpportunitySet,
} from "@/lib/canonical-quality-metrics";
import {
  canonicalQualitySemanticDigest,
  compareCanonicalQualityScorecards,
  deriveCanonicalPairBoundComparabilityEvidence,
  evaluateCanonicalShadowModelChangeGates,
  verifyCanonicalPairBoundComparabilityEvidence,
  verifyCanonicalQualityVersionComparisonDigest,
  type CanonicalQualityVersionComparison,
  type CanonicalScorecardVersions,
} from "@/lib/canonical-quality-scorecard";
import {
  action664hBaselineAssembly,
  action664hBaselineCandidates,
  action664hBaselineMetrics,
  action664hBaselineVersions,
  action664hBootstrapSeed,
  action664hCandidateImprovementAssembly,
  action664hCandidateVersions,
  action664hComparableImprovement,
  assembleAction664hFixtureScorecard,
  resignAction664hFixtureScorecard,
} from "@/lib/canonical-quality-scorecard-fixtures";
import {
  diagnoseCanonicalEvaluationStorageWrite,
  verifyCanonicalEvaluationStorageInsertDigest,
  verifyCanonicalEvaluationStorageReadbackDigest,
  type CanonicalEvaluationStorageReadback,
} from "@/lib/server/canonical-evaluation-storage-writer";
import type { CanonicalEvaluationMetricsCandidate } from "@/lib/server/canonical-evaluation-quality-read-model";

function readyVisibleStoragePayload() {
  expect(action664cVisibleEnvelopeResult.status).toBe("ready");
  expect(action664cVisibleEnvelopeResult.value).not.toBeNull();
  const result = buildCanonicalEvaluationStoragePayload(
    action664cVisibleEnvelopeResult.value!,
  );
  expect(result.status).toBe("ready");
  expect(result.value).not.toBeNull();
  return result.value!;
}

test("Major 1: scorecard versions and provenance come only from included metric evidence", () => {
  const runtimeOverride = {
    metrics: action664hBaselineMetrics,
    cohort: "visible_recommendation_quality" as const,
    versions: {
      engine: "caller-engine",
      scoring: "caller-scoring",
      ranking: "caller-ranking",
      evaluator: "caller-evaluator",
      provider: "caller-provider",
    },
  };
  const assembly = assembleAction664hFixtureScorecard(
    runtimeOverride as Parameters<
      typeof assembleAction664hFixtureScorecard
    >[0],
  );

  expect(assembly.status).toBe("assembled");
  expect(assembly.scorecard.versions).toEqual(action664hBaselineVersions);
  expect(assembly.scorecard.version_provenance).toMatchObject({
    method: "sha256_sorted_metric_version_evidence_v1",
    evidence_identity_count: 120,
  });
  expect(assembly.scorecard.version_provenance.evidence_sha256).toMatch(
    /^[a-f0-9]{64}$/,
  );
  expect(assembly.scorecard.semantic_digest).not.toBe(
    canonicalQualitySemanticDigest(runtimeOverride.versions),
  );
});

test("Major 1: missing or mixed metric versions fail closed", () => {
  const mixed = structuredClone(action664hBaselineMetrics);
  mixed.comparison_evidence.eligible_identity_observations[0].versions.engine =
    "mixed-engine";
  const mixedAssembly = assembleAction664hFixtureScorecard({ metrics: mixed });
  expect(mixedAssembly.status).toBe("conflicting");
  expect(mixedAssembly.reason_codes).toContain("mixed_metric_versions");

  const missing = structuredClone(action664hBaselineMetrics);
  missing.comparison_evidence.eligible_identity_observations[0].versions.engine =
    "";
  const missingAssembly = assembleAction664hFixtureScorecard({
    metrics: missing,
  });
  expect(missingAssembly.status).toBe("conflicting");
  expect(missingAssembly.reason_codes).toContain(
    "version_metadata_incomplete",
  );
});

test("Major 2: coverage rates are derived from a mutually exclusive count partition", () => {
  const assembly = assembleAction664hFixtureScorecard({
    metrics: action664hBaselineMetrics,
    coverage: {
      expected_identity_count: 125,
      eligible_identity_count: 120,
      missing_identity_count: 2,
      incomplete_identity_count: 1,
      ambiguous_identity_count: 1,
      conflicting_identity_count: 0,
      excluded_identity_count: 1,
      reason_codes: ["synthetic_partition"],
      ...({ coverage_rate: 0.01, reproducibility_rate: 0.01 } as object),
    },
  });
  expect(assembly.status).toBe("assembled");
  expect(assembly.scorecard.coverage.coverage_rate).toBe(0.984);
  expect(assembly.scorecard.coverage.reproducibility_rate).toBe(0.96);
});

test("Major 2: negative, overlapping, or inconsistent coverage counts are rejected", () => {
  for (const coverage of [
    {
      expected_identity_count: 120,
      eligible_identity_count: 120,
      missing_identity_count: -1,
      incomplete_identity_count: 0,
      ambiguous_identity_count: 0,
      conflicting_identity_count: 0,
      excluded_identity_count: 1,
      reason_codes: [],
    },
    {
      expected_identity_count: 120,
      eligible_identity_count: 120,
      missing_identity_count: 1,
      incomplete_identity_count: 0,
      ambiguous_identity_count: 0,
      conflicting_identity_count: 0,
      excluded_identity_count: 0,
      reason_codes: [],
    },
  ]) {
    const assembly = assembleAction664hFixtureScorecard({
      metrics: action664hBaselineMetrics,
      coverage,
    });
    expect(assembly.status).toBe("conflicting");
    expect(assembly.reason_codes).toContain("coverage_arithmetic_conflict");
  }
});

test("Major 3: comparability evidence is derived and cryptographically pair-bound", () => {
  const evidence = deriveCanonicalPairBoundComparabilityEvidence({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: action664hCandidateImprovementAssembly.scorecard,
  });
  expect(evidence).toMatchObject({
    baseline_scorecard_digest:
      action664hBaselineAssembly.scorecard.semantic_digest,
    candidate_scorecard_digest:
      action664hCandidateImprovementAssembly.scorecard.semantic_digest,
    cohort: "visible_recommendation_quality",
    metrics_policy_version: "canonical_quality_metrics_v1",
    status: "comparable",
  });
  expect(action664hComparableImprovement.comparison_evidence).toEqual(
    evidence,
  );
  expect(verifyCanonicalQualityVersionComparisonDigest(
    action664hComparableImprovement,
  )).toBe(true);
});

test("Major 3: a standalone forged override cannot bypass the pair gate", () => {
  const changed = structuredClone(
    action664hCandidateImprovementAssembly.scorecard,
  );
  changed.period.decided_at_or_after = "2026-06-02T00:00:00.000Z";
  const resigned = resignAction664hFixtureScorecard(changed);
  const comparison = compareCanonicalQualityScorecards({
    baseline: action664hBaselineAssembly.scorecard,
    candidate: resigned,
    bootstrap_seed: action664hBootstrapSeed,
    ...({
      documented_comparability: {
        evidence_sha256: "a".repeat(64),
        period_comparable: true,
        denominator_comparable: true,
      },
    } as object),
  });
  expect(comparison.comparability_status).toBe("not_comparable");
  expect(comparison.reason_codes).toContain("period_not_comparable");

  const forged = structuredClone(comparison);
  forged.comparison_evidence.status = "comparable";
  expect(verifyCanonicalQualityVersionComparisonDigest(forged)).toBe(false);
});

function counterfactualFixture(input: {
  versions: CanonicalScorecardVersions;
  opportunityCost: number;
}) {
  const template = action664hBaselineCandidates[0];
  const candidates: CanonicalEvaluationMetricsCandidate[] = [];
  const sets: CanonicalCounterfactualOpportunitySet[] = [];
  for (let index = 0; index < 120; index += 1) {
    const day = `2026-06-${String((index % 30) + 1).padStart(2, "0")}`;
    const identity = `rec_decision:v1:action664j:no-trade-${String(index).padStart(3, "0")}:1880001${String(index).padStart(6, "0")}`;
    candidates.push({
      ...structuredClone(template),
      canonical_identity: identity,
      sample_type: "no_trade",
      cohort: "no_trade_counterfactual",
      decision_day: day,
      decision_timestamp: `${day}T14:30:00.000Z`,
      ticker: `NT${String(index % 20).padStart(2, "0")}`,
      versions: structuredClone(input.versions),
      terminal_outcome: "incomplete",
      r_result: null,
      target_before_stop: "not_applicable",
      standard_visible_quality_eligible: false,
      cohort_quality_eligible: false,
      eligibility_status: "counterfactual_not_evaluable",
      reason_codes: ["counterfactual_only"],
    });
    sets.push({
      opportunity_set_id: `action664j-no-trade-set-${String(index).padStart(3, "0")}`,
      decision_canonical_identity: identity,
      cohort: "no_trade_counterfactual",
      decision_day: day,
      complete: true,
      candidates: [
        {
          canonical_identity: `${identity}:candidate`,
          ticker: `NT${String(index % 20).padStart(2, "0")}`,
          outcome_evaluable: true,
          r_result: input.opportunityCost,
        },
      ],
    });
  }
  const metrics = computeCanonicalQualityMetrics({
    cohort: "no_trade_counterfactual",
    candidates,
    counterfactual_opportunity_sets: sets,
    bootstrap_seed: action664hBootstrapSeed,
  });
  return assembleAction664hFixtureScorecard({
    metrics,
    cohort: "no_trade_counterfactual",
    coverage: {
      expected_identity_count: 120,
      eligible_identity_count: 120,
      missing_identity_count: 0,
      incomplete_identity_count: 0,
      ambiguous_identity_count: 0,
      conflicting_identity_count: 0,
      excluded_identity_count: 0,
      reason_codes: [],
    },
    build_identity: `action664j-no-trade-${input.versions.engine}`,
  });
}

function counterfactualComparison(input: {
  baselineVersions?: CanonicalScorecardVersions;
  candidateVersions?: CanonicalScorecardVersions;
}) {
  const baseline = counterfactualFixture({
    versions: input.baselineVersions ?? action664hBaselineVersions,
    opportunityCost: 1,
  });
  const candidate = counterfactualFixture({
    versions: input.candidateVersions ?? action664hCandidateVersions,
    opportunityCost: 0.8,
  });
  expect(baseline.status).toBe("assembled");
  expect(candidate.status).toBe("assembled");
  return compareCanonicalQualityScorecards({
    baseline: baseline.scorecard,
    candidate: candidate.scorecard,
    bootstrap_seed: action664hBootstrapSeed,
  });
}

function resignComparison(
  comparison: CanonicalQualityVersionComparison,
) {
  const payload = structuredClone(comparison) as Omit<
    CanonicalQualityVersionComparison,
    "semantic_digest"
  > & { semantic_digest?: string };
  delete payload.semantic_digest;
  return {
    ...payload,
    semantic_digest: canonicalQualitySemanticDigest(payload),
  } as CanonicalQualityVersionComparison;
}

test("Major 4: no-trade opportunity cost passes only through the pair-bound main gate", () => {
  const comparison = counterfactualComparison({});
  expect(comparison.comparability_status).toBe("comparable");
  expect(comparison.deltas.opportunity_cost_r.delta).toBe(-0.2);

  const advice = evaluateCanonicalShadowModelChangeGates({
    comparison: action664hComparableImprovement,
    candidate_scorecard:
      action664hCandidateImprovementAssembly.scorecard,
    no_trade_comparison: comparison,
  });
  expect(
    advice.gates.find(
      (gate) => gate.gate === "no_trade_opportunity_cost",
    )?.status,
  ).toBe("pass");
});

test("Major 4: a no-trade contract mismatch is not evaluable, never an advisory pass", () => {
  const baseline = counterfactualFixture({
    versions: action664hBaselineVersions,
    opportunityCost: 1,
  });
  const candidate = counterfactualFixture({
    versions: action664hCandidateVersions,
    opportunityCost: 0.8,
  });
  const mismatched = structuredClone(candidate.scorecard);
  mismatched.period.decided_before = "2026-07-02T00:00:00.000Z";
  const comparison = compareCanonicalQualityScorecards({
    baseline: baseline.scorecard,
    candidate: resignAction664hFixtureScorecard(mismatched),
    bootstrap_seed: action664hBootstrapSeed,
  });
  expect(comparison.comparability_status).toBe("not_comparable");
  const advice = evaluateCanonicalShadowModelChangeGates({
    comparison: action664hComparableImprovement,
    candidate_scorecard:
      action664hCandidateImprovementAssembly.scorecard,
    no_trade_comparison: comparison,
  });
  expect(
    advice.gates.find(
      (gate) => gate.gate === "no_trade_opportunity_cost",
    )?.status,
  ).toBe("not_evaluable");
  expect(advice.status).not.toBe("advisory_pass");
});

test("Action 664N.1: valid primary and no-trade comparisons bind the same model transition", () => {
  const noTradeComparison = counterfactualComparison({});
  const advice = evaluateCanonicalShadowModelChangeGates({
    comparison: action664hComparableImprovement,
    candidate_scorecard:
      action664hCandidateImprovementAssembly.scorecard,
    no_trade_comparison: noTradeComparison,
  });

  expect(
    verifyCanonicalPairBoundComparabilityEvidence(
      action664hComparableImprovement.comparison_evidence,
    ),
  ).toBe(true);
  expect(
    action664hComparableImprovement.comparison_evidence
      .model_version_transition,
  ).toMatchObject({
    baseline: {
      engine: action664hBaselineVersions.engine,
      scoring: action664hBaselineVersions.scoring,
      ranking: action664hBaselineVersions.ranking,
    },
    candidate: {
      engine: action664hCandidateVersions.engine,
      scoring: action664hCandidateVersions.scoring,
      ranking: action664hCandidateVersions.ranking,
    },
  });
  expect(
    advice.gates.find(
      (gate) => gate.gate === "primary_pair_bound_comparison",
    )?.status,
  ).toBe("pass");
  expect(
    advice.gates.find(
      (gate) => gate.gate === "candidate_scorecard_pair_binding",
    )?.status,
  ).toBe("pass");
  expect(
    advice.gates.find(
      (gate) => gate.gate === "no_trade_pair_bound_comparison",
    )?.status,
  ).toBe("pass");
  expect(advice.automatic_promotion_executed).toBe(false);
});

test("Action 664N.1: a manipulated primary comparison digest is rejected", () => {
  const tampered = structuredClone(action664hComparableImprovement);
  tampered.semantic_digest = "0".repeat(64);
  const advice = evaluateCanonicalShadowModelChangeGates({
    comparison: tampered,
    candidate_scorecard:
      action664hCandidateImprovementAssembly.scorecard,
    no_trade_comparison: counterfactualComparison({}),
  });

  expect(advice.status).toBe("advisory_reject");
  expect(advice.reason_codes).toContain(
    "primary_comparison_digest_or_pair_binding_invalid",
  );
  expect(advice.automatic_promotion_executed).toBe(false);
});

test("Action 664N.1: a candidate scorecard whose digest no longer recomputes is rejected", () => {
  const tamperedCandidate = structuredClone(
    action664hCandidateImprovementAssembly.scorecard,
  );
  tamperedCandidate.versions.engine = "tampered-candidate-engine";
  const advice = evaluateCanonicalShadowModelChangeGates({
    comparison: action664hComparableImprovement,
    candidate_scorecard: tamperedCandidate,
    no_trade_comparison: counterfactualComparison({}),
  });

  expect(advice.status).toBe("advisory_reject");
  expect(advice.reason_codes).toContain(
    "candidate_scorecard_digest_invalid",
  );
});

test("Action 664N.1: a comparison with the wrong baseline pair is rejected even when re-signed", () => {
  const wrongPair = structuredClone(action664hComparableImprovement);
  wrongPair.baseline_scorecard_digest =
    action664hCandidateImprovementAssembly.scorecard.semantic_digest;
  const resigned = resignComparison(wrongPair);
  const advice = evaluateCanonicalShadowModelChangeGates({
    comparison: resigned,
    candidate_scorecard:
      action664hCandidateImprovementAssembly.scorecard,
    no_trade_comparison: counterfactualComparison({}),
  });

  expect(advice.status).toBe("advisory_reject");
  expect(advice.reason_codes).toContain(
    "primary_baseline_scorecard_digest_mismatch",
  );
});

test("Action 664N.1: no-trade with a different candidate model version is rejected", () => {
  const noTradeComparison = counterfactualComparison({
    candidateVersions: {
      ...action664hCandidateVersions,
      engine: "engine-shadow-c-v1",
    },
  });
  const advice = evaluateCanonicalShadowModelChangeGates({
    comparison: action664hComparableImprovement,
    candidate_scorecard:
      action664hCandidateImprovementAssembly.scorecard,
    no_trade_comparison: noTradeComparison,
  });

  expect(advice.status).toBe("advisory_reject");
  expect(advice.reason_codes).toContain(
    "no_trade_candidate_engine_version_mismatch",
  );
});

test("Action 664N.1: no-trade with a different baseline model version is rejected", () => {
  const noTradeComparison = counterfactualComparison({
    baselineVersions: {
      ...action664hBaselineVersions,
      ranking: "ranking-shadow-legacy-v1",
    },
  });
  const advice = evaluateCanonicalShadowModelChangeGates({
    comparison: action664hComparableImprovement,
    candidate_scorecard:
      action664hCandidateImprovementAssembly.scorecard,
    no_trade_comparison: noTradeComparison,
  });

  expect(advice.status).toBe("advisory_reject");
  expect(advice.reason_codes).toContain(
    "no_trade_baseline_ranking_version_mismatch",
  );
});

test("Action 664N.1: tampered pair-bound evidence is rejected even when the outer comparison is re-signed", () => {
  const tampered = structuredClone(action664hComparableImprovement);
  tampered.comparison_evidence.denominator_sha256 = "0".repeat(64);
  const resigned = resignComparison(tampered);
  const advice = evaluateCanonicalShadowModelChangeGates({
    comparison: resigned,
    candidate_scorecard:
      action664hCandidateImprovementAssembly.scorecard,
    no_trade_comparison: counterfactualComparison({}),
  });

  expect(
    verifyCanonicalQualityVersionComparisonDigest(resigned),
  ).toBe(false);
  expect(advice.status).toBe("advisory_reject");
  expect(advice.reason_codes).toContain(
    "primary_pair_bound_evidence_invalid",
  );
  expect(advice.automatic_promotion_executed).toBe(false);
});

test("Major 5: the versioned standard command owns the react-server condition", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };
  const runner = readFileSync(
    "scripts/action-664j-run-intelligence-foundation-tests.mjs",
    "utf8",
  );
  expect(packageJson.scripts["test:intelligence-foundation"]).toBe(
    "node scripts/action-664j-run-intelligence-foundation-tests.mjs",
  );
  expect(runner).toContain("action_664_foundation_test_command_v1");
  expect(runner).toContain("--conditions=${ACTION_664_REQUIRED_NODE_CONDITION}");
  expect(runner).toContain('PLAYWRIGHT_SKIP_WEB_SERVER: "true"');

  const withoutCondition = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", "import('server-only')"],
    { encoding: "utf8", env: { ...process.env, NODE_OPTIONS: "" } },
  );
  expect(withoutCondition.status).not.toBe(0);
  const withCondition = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", "import('server-only')"],
    {
      encoding: "utf8",
      env: { ...process.env, NODE_OPTIONS: "--conditions=react-server" },
    },
  );
  expect(withCondition.status).toBe(0);
});

test("Minor 1: a Wilson interval difference has its own method identifier", () => {
  expect(
    action664hComparableImprovement.deltas.win_rate.confidence_interval
      ?.method,
  ).toBe("conservative_wilson_interval_difference_v1");
  expect(
    action664hComparableImprovement.deltas.win_rate.confidence_interval
      ?.method,
  ).not.toBe("wilson_score_interval_v1");
});

test("Minor 2: application recomputes canonical digest before insert and after readback", () => {
  const payload = readyVisibleStoragePayload();
  const diagnostic = diagnoseCanonicalEvaluationStorageWrite(payload, null);
  expect(diagnostic.status).toBe("would_insert");
  if (diagnostic.status !== "would_insert") return;
  expect(
    verifyCanonicalEvaluationStorageInsertDigest(diagnostic.insert),
  ).toBe(true);

  const tamperedInsert = structuredClone(diagnostic.insert);
  tamperedInsert.semantic_payload_sha256 = "0".repeat(64);
  expect(verifyCanonicalEvaluationStorageInsertDigest(tamperedInsert)).toBe(
    false,
  );

  const readback: CanonicalEvaluationStorageReadback = {
    canonical_identity: diagnostic.insert.canonical_identity,
    semantic_payload_sha256: diagnostic.insert.semantic_payload_sha256,
    persistence_envelope: structuredClone(
      diagnostic.insert.persistence_envelope,
    ),
  };
  expect(verifyCanonicalEvaluationStorageReadbackDigest(readback)).toBe(true);

  const tamperedReadback = structuredClone(readback);
  tamperedReadback.persistence_envelope.sample_type = "shadow";
  expect(
    verifyCanonicalEvaluationStorageReadbackDigest(tamperedReadback),
  ).toBe(false);
  expect(
    diagnoseCanonicalEvaluationStorageWrite(payload, tamperedReadback),
  ).toMatchObject({
    status: "semantic_conflict",
    reason_codes: ["stored_envelope_digest_mismatch"],
  });
});

test("Minor 2: SQL documents format/parity trust and does not add a JSON canonicalizer", () => {
  const migration = readFileSync(
    "supabase/migrations/20260726001000_create_canonical_evaluation_decisions.sql",
    "utf8",
  );
  expect(migration).toContain(
    "PostgreSQL validates digest format and normalized/envelope parity",
  );
  expect(migration).toContain(
    "server application must recompute it immediately before insert and after every readback",
  );
  expect(migration).not.toMatch(
    /create\s+(?:or\s+replace\s+)?function[\s\S]*canonical[\s_-]*json/i,
  );
});
