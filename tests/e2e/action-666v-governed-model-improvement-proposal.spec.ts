import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import goldenReport from "@/docs/action-666v-golden-model-improvement-proposal-report.json";
import {
  action666mFixtureCases,
} from "@/lib/server/canonical-predictive-outcome-explanation-fixtures";
import {
  action666vDuplicateProposalFixture,
  action666vFeatureTrustDriftFixture,
  action666vFixtureCases,
  action666vInSampleOnlyFixture,
  action666vMultipleTestingRiskFixture,
  action666vNoChangeFixture,
  action666vProbabilityMissingFixture,
  action666vProtectedRegressionFixture,
  action666vReorderedStableFixture,
  action666vStableImprovementFixture,
  action666vTamperedPlanFixture,
  action666x1ProposalRegistryAuthorityManifest,
  action666x1TrustedProposalRegistry,
  action666x2EmptyPreviousBindingLookup,
} from "@/lib/server/canonical-model-improvement-proposal-fixtures";
import {
  CANONICAL_MODEL_EXPERIMENT_PREREGISTRATION_VERSION,
  CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_CLASSES,
  CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION,
  CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_TYPES,
  CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_VERSION,
  CANONICAL_MODEL_IMPROVEMENT_FROZEN_REGISTRY_MANIFEST_DIGEST,
  DEFAULT_OFF_MODEL_IMPROVEMENT_ENABLED,
  DEFAULT_OFF_MODEL_IMPROVEMENT_KILL_SWITCH_ENGAGED,
  canonicalModelImprovementDigest,
  createCanonicalModelImprovementEngine,
  createCanonicalModelImprovementRegistryAuthority,
  createCanonicalModelImprovementRegistryAuthorityManifest,
  createCanonicalModelImprovementTrustedPost,
  createCanonicalModelImprovementTrustedRegistry,
  createCanonicalModelImprovementRowStability,
  createCanonicalModelImprovementMetricInventory,
  createCanonicalMultipleTestingEvidence,
  deriveGateStatus,
  validateEvidence,
  validateMultipleTesting,
  validatePlan,
  verifyCanonicalModelImprovementRegistryIdentityUniqueness,
  verifyCanonicalModelImprovementEvidenceSourceNamespaces,
  verifyCanonicalModelImprovementResult,
  type CanonicalModelImprovementExecutionCounters,
  type CanonicalModelImprovementPreviousBindingLookup,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  canonicalQualitySemanticDigest,
} from "@/lib/canonical-quality-scorecard";
import {
  CANONICAL_MODEL_IMPROVEMENT_TEMPORAL_POLICY_VERSION,
  CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION,
  parseCanonicalExplicitInstant,
  verifyAndProjectCanonicalModelImprovementUpstreams,
} from "@/lib/server/canonical-model-improvement-upstream-verification";

type Fixture = (typeof action666vFixtureCases)[number];

function build(fixture: Fixture = action666vStableImprovementFixture) {
  if (!fixture.engine.build) throw new Error("fixture_engine_disabled");
  return fixture.engine.build(fixture.request);
}

function proposal(fixture: Fixture = action666vStableImprovementFixture) {
  const result = build(fixture);
  expect(result.proposal).not.toBeNull();
  return result.proposal!;
}

function zeroCounters(): CanonicalModelImprovementExecutionCounters {
  return {
    request_reads: 0,
    clones: 0,
    trust_lookups: 0,
    registry_lookups: 0,
    validations: 0,
    proposals_built: 0,
  };
}

test.describe("Action 666V governed model-improvement proposals", () => {
  test("proposal registry manifest matches the independently frozen root anchor", () => {
    expect(action666x1ProposalRegistryAuthorityManifest.manifest_digest).toBe(
      CANONICAL_MODEL_IMPROVEMENT_FROZEN_REGISTRY_MANIFEST_DIGEST,
    );
  });

  test("fixture matrix is deterministic and fail-closed", () => {
    for (const fixture of action666vFixtureCases) {
      const result = build(fixture);
      expect(result.status, `${fixture.name}:${result.reason_codes.join(",")}`).toBe(
        fixture.expected_status,
      );
    }
  });

  test("golden report matches canonical fixture output bytes", () => {
    const canonicalScenarios = action666vFixtureCases.map((fixture) => {
      const result = build(fixture);
      return {
        name: fixture.name,
        status: result.status,
        reason_codes: result.reason_codes,
        canonical_proposal_digest:
          result.proposal?.canonical_proposal_digest ?? null,
        canonical_result_bytes_sha256:
          canonicalModelImprovementDigest(result),
      };
    });
    expect(goldenReport).toMatchObject({
      report_version:
        "action_666v_golden_model_improvement_proposal_report_v1",
      proposal_contract_version:
        CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_VERSION,
      proposal_policy_version: CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION,
      upstream_verifier_version:
        CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION,
      temporal_policy_version:
        CANONICAL_MODEL_IMPROVEMENT_TEMPORAL_POLICY_VERSION,
      registry_authority_manifest_digest:
        CANONICAL_MODEL_IMPROVEMENT_FROZEN_REGISTRY_MANIFEST_DIGEST,
      synthetic_evidence: true,
      not_ture_performance: true,
      not_publishable: true,
      shadow_only: true,
      live_ranking_effect: false,
      automatic_training_allowed: false,
      automatic_parameter_change_allowed: false,
      automatic_promotion_allowed: false,
      causal_claimed: false,
    });
    expect(goldenReport.scenarios).toEqual(canonicalScenarios);
  });

  test("ready proposal binds every evidence family and a locked experiment plan", () => {
    const ready = proposal();
    expect(ready).toMatchObject({
      proposal_version: CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_VERSION,
      policy_version: CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION,
      status: "proposal_ready",
      shadow_only: true,
      live_ranking_effect: false,
      automatic_training_allowed: false,
      automatic_parameter_change_allowed: false,
      automatic_promotion_allowed: false,
      experiment_execution_allowed: false,
      external_ai_canonical_decision_authority: false,
      causal_claimed: false,
      synthetic_evidence: true,
      not_publishable: true,
    });
    expect(ready.experiment_plan).toMatchObject({
      plan_version: CANONICAL_MODEL_EXPERIMENT_PREREGISTRATION_VERSION,
      primary_metric: "cost_adjusted_expectancy_r",
      preregistered: true,
      no_automatic_promotion: true,
      validation_design: {
        method: "chronological_trading_day_walk_forward_with_holdout_v1",
        holdout_locked: true,
        purge_and_embargo_required: true,
      },
    });
    expect(
      ready.evidence_items.map((item) => item.evidence_class).sort(),
    ).toEqual([...CANONICAL_MODEL_IMPROVEMENT_EVIDENCE_CLASSES].sort());
    expect(
      ready.evidence_items.every((item) => item.causal_claimed === false),
    ).toBe(true);
  });

  test("all supported proposal types are closed and no type mutates Ture", () => {
    expect(CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_TYPES).toEqual([
      "feature_addition",
      "feature_removal",
      "feature_transformation",
      "regularization_or_model_hyperparameter_candidate",
      "ranking_threshold_candidate",
      "calibrated_confidence_threshold_candidate",
      "regime_specific_abstention_candidate",
      "no_trade_or_selectivity_candidate",
      "stop_target_or_horizon_research_candidate",
      "data_quality_or_provider_coverage_candidate",
      "no_change",
    ]);
    for (const fixture of action666vFixtureCases) {
      const result = build(fixture);
      expect(result).toMatchObject({
        shadow_only: true,
        live_ranking_effect: false,
        automatic_training_allowed: false,
        automatic_parameter_change_allowed: false,
        automatic_promotion_allowed: false,
        causal_claimed: false,
        synthetic_evidence: true,
        not_publishable: true,
      });
    }
  });

  test("caller-asserted in-sample flags conflict while uncontrolled selection remains research only", () => {
    expect(build(action666vInSampleOnlyFixture)).toMatchObject({
      status: "conflicting",
      reason_codes: [
        "action_666_learning_verified_projection_mismatch",
      ],
    });
    expect(build(action666vMultipleTestingRiskFixture)).toMatchObject({
      status: "research_only",
      reason_codes: [
        "multiple_testing_or_selection_risk_uncontrolled",
      ],
    });
  });

  test("score or evidence strength is never converted into probability", () => {
    expect(build(action666vProbabilityMissingFixture)).toMatchObject({
      status: "research_only",
      reason_codes: ["probability_semantics_missing"],
    });
  });

  test("protected metric regression blocks threshold proposal approval", () => {
    expect(build(action666vProtectedRegressionFixture)).toMatchObject({
      status: "research_only",
      reason_codes: [
        "protected_metric_regression_blocks_experiment",
        "quality_comparison_regression_blocks_experiment",
      ],
    });
  });

  test("M3: metric taxonomy requires exact primary, secondary, protected, and verified evidence sets", () => {
    const payload = action666vStableImprovementFixture.payload;
    const inventory = payload.evidence.quality_metrics.metric_inventory;
    expect(inventory.primary_metric).toBe("cost_adjusted_expectancy_r");
    expect(inventory.secondary_metrics).toEqual([
      "brier_score",
      "expected_calibration_error",
      "precision_at_3",
      "win_rate",
    ]);
    expect(inventory.protected_metrics).toEqual([
      "precision_at_3",
      "win_rate",
    ]);
    const reordered = createCanonicalModelImprovementMetricInventory({
      primary_metric: inventory.primary_metric,
      secondary_metrics: [...inventory.secondary_metrics].reverse(),
      protected_metrics: [...inventory.protected_metrics].reverse(),
      metrics: [...inventory.metrics].reverse().map((metric) => {
        const copy = structuredClone(metric);
        delete (copy as { semantic_digest?: string }).semantic_digest;
        return { ...copy, roles: [...copy.roles].reverse() };
      }),
    });
    expect(reordered).toEqual(inventory);
    const missingProtected = structuredClone(payload.evidence);
    missingProtected.quality_metrics.metric_inventory.protected_metrics.pop();
    expect(validateEvidence(missingProtected)).toContain(
      "canonical_metric_inventory_conflicting",
    );
    const duplicatedSecondary = structuredClone(payload.evidence);
    duplicatedSecondary.quality_metrics.metric_inventory.secondary_metrics.push(
      duplicatedSecondary.quality_metrics.metric_inventory.secondary_metrics[0],
    );
    expect(validateEvidence(duplicatedSecondary)).toContain(
      "canonical_metric_inventory_conflicting",
    );
    const duplicatedPlanMetric = structuredClone(payload.experiment_plan!);
    duplicatedPlanMetric.secondary_metrics.push(
      duplicatedPlanMetric.secondary_metrics[0],
    );
    expect(
      validatePlan({
        plan: duplicatedPlanMetric,
        candidate: payload.proposal_candidates[0],
        evidence: payload.evidence,
        multipleTesting: payload.multiple_testing,
      }),
    ).toEqual(expect.arrayContaining([
      "experiment_metric_set_binding_conflicting",
      "experiment_plan_digest_or_identity_conflicting",
    ]));
    const swappedPlan = structuredClone(payload.experiment_plan!);
    swappedPlan.primary_metric = "win_rate";
    expect(
      validatePlan({
        plan: swappedPlan,
        candidate: payload.proposal_candidates[0],
        evidence: payload.evidence,
        multipleTesting: payload.multiple_testing,
      }),
    ).toEqual(expect.arrayContaining([
      "experiment_metric_set_binding_conflicting",
      "experiment_plan_digest_or_identity_conflicting",
    ]));
  });

  test("M4: every preregistered plan field changes experiment identity and previous bindings fail closed", () => {
    const payload = action666vStableImprovementFixture.payload;
    const changed = structuredClone(payload.experiment_plan!);
    changed.sample_minimum.identities += 1;
    expect(
      validatePlan({
        plan: changed,
        candidate: payload.proposal_candidates[0],
        evidence: payload.evidence,
        multipleTesting: payload.multiple_testing,
      }),
    ).toContain("experiment_plan_digest_or_identity_conflicting");
    const lookup = {
      lookup_proposal_binding: () => ({
        semantic_digest:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      }),
      lookup_experiment_binding: () => null,
    };
    const engine = createCanonicalModelImprovementEngine({
      enabled: true,
      kill_switch_engaged: false,
      trust_boundary: action666vStableImprovementFixture.trustBoundary,
      previous_binding_lookup: lookup,
    });
    expect(engine.build?.(action666vStableImprovementFixture.request)).toMatchObject({
      status: "conflicting",
      reason_codes: ["previous_proposal_binding_semantic_conflict"],
    });
    const experimentConflictEngine = createCanonicalModelImprovementEngine({
      enabled: true,
      kill_switch_engaged: false,
      trust_boundary: action666vStableImprovementFixture.trustBoundary,
      previous_binding_lookup: {
        lookup_proposal_binding: () => null,
        lookup_experiment_binding: () => ({
          semantic_digest:
            "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        }),
      },
    });
    expect(
      experimentConflictEngine.build?.(
        action666vStableImprovementFixture.request,
      ),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: ["previous_experiment_binding_semantic_conflict"],
    });
    const identicalRetryEngine = createCanonicalModelImprovementEngine({
      enabled: true,
      kill_switch_engaged: false,
      trust_boundary: action666vStableImprovementFixture.trustBoundary,
      previous_binding_lookup: {
        lookup_proposal_binding: () => ({
          semantic_digest: payload.proposal_candidates[0].semantic_digest,
        }),
        lookup_experiment_binding: () => ({
          semantic_digest: payload.experiment_plan!.semantic_digest,
        }),
      },
    });
    expect(
      identicalRetryEngine.build?.(
        action666vStableImprovementFixture.request,
      ),
    ).toMatchObject({ status: "proposal_ready" });
    const duplicatePost = createCanonicalModelImprovementTrustedPost({
      trusted_input_identity: "action-666x2:cross-post-duplicate",
      payload,
    });
    expect(
      verifyCanonicalModelImprovementRegistryIdentityUniqueness([
        action666vStableImprovementFixture.post,
        duplicatePost,
      ]),
    ).toEqual(expect.arrayContaining([
      "duplicate_experiment_identity_across_registry",
      "duplicate_proposal_identity_across_registry",
    ]));
  });

  test("M5: Holm and BH adjusted p-values are deterministically recomputed from canonical hypotheses", () => {
    const base = action666vStableImprovementFixture.payload.multiple_testing;
    const holm = createCanonicalMultipleTestingEvidence({
      correction_method: "holm_bonferroni_v1",
      family_identity: base.family_identity,
      preregistration_identity: base.preregistration_identity,
      hypotheses: base.hypotheses,
    });
    const bh = createCanonicalMultipleTestingEvidence({
      correction_method: "benjamini_hochberg_fdr_v1",
      family_identity: base.family_identity,
      preregistration_identity: base.preregistration_identity,
      hypotheses: [...base.hypotheses].reverse(),
    });
    expect(holm.adjusted_results.find((item) =>
      item.hypothesis_identity.endsWith(":expectancy")
    )?.adjusted_p_value).toBe(0.04);
    expect(bh.adjusted_results.find((item) =>
      item.hypothesis_identity.endsWith(":expectancy")
    )?.adjusted_p_value).toBe(0.04);
    const tampered = structuredClone(holm);
    tampered.adjusted_results[0].adjusted_p_value = 0.000001;
    expect(validateMultipleTesting(tampered)).toEqual([
      "multiple_testing_evidence_conflicting",
    ]);
    const inventoryDrift = structuredClone(holm);
    inventoryDrift.hypotheses[0].raw_p_value = 0.9;
    expect(validateMultipleTesting(inventoryDrift)).toEqual([
      "multiple_testing_evidence_conflicting",
    ]);
    const invalidDirection = structuredClone(holm);
    invalidDirection.hypotheses[0].test_direction = "caller_defined" as never;
    expect(validateMultipleTesting(invalidDirection)).toEqual([
      "multiple_testing_evidence_conflicting",
    ]);
    const invalidMethod = structuredClone(holm);
    invalidMethod.correction_method = "caller_adjusted" as never;
    expect(validateMultipleTesting(invalidMethod)).toEqual([
      "multiple_testing_evidence_conflicting",
    ]);
  });

  test("M6: no-change traverses stability and selection gates instead of bypassing them", () => {
    const payload = structuredClone(action666vNoChangeFixture.payload);
    payload.evidence.offline_learning.stable_split_count = 0;
    payload.evidence.offline_learning.row_level_stability.stable_split_count = 0;
    expect(
      deriveGateStatus(payload, payload.proposal_candidates[0]),
    ).toMatchObject({
      status: "research_only",
      reasonCodes: expect.arrayContaining([
        "effect_not_stable_across_walk_forward_splits",
        "verified_evidence_does_not_support_no_change",
      ]),
    });
    expect(build(action666vMultipleTestingRiskFixture)).toMatchObject({
      status: "research_only",
      reason_codes: ["multiple_testing_or_selection_risk_uncontrolled"],
    });
  });

  test("M7: split direction and diversity are derived from canonical immutable rows", () => {
    const stability =
      action666vStableImprovementFixture.payload.evidence.offline_learning
        .row_level_stability;
    expect(stability.identity_count).toBe(
      new Set(stability.rows.map((row) => row.canonical_decision_identity)).size,
    );
    expect(stability.trading_day_count).toBe(
      new Set(stability.rows.map((row) => row.trading_day)).size,
    );
    const reordered = createCanonicalModelImprovementRowStability({
      primary_metric: stability.primary_metric,
      cohort: stability.cohort,
      rows: [...stability.rows].reverse().map((row) => {
        const copy = structuredClone(row);
        delete (copy as { row_digest?: string }).row_digest;
        return copy;
      }),
    });
    expect(reordered).toEqual(stability);
    expect(() =>
      createCanonicalModelImprovementRowStability({
        primary_metric: stability.primary_metric,
        cohort: stability.cohort,
        rows: [
          ...stability.rows,
          {
            ...stability.rows[0],
            row_digest: undefined,
          },
        ].map((row) => {
          const copy = structuredClone(row);
          delete (copy as { row_digest?: string }).row_digest;
          return copy;
        }),
      }),
    ).toThrow("canonical_row_stability_inventory_conflicting");
    expect(() =>
      createCanonicalModelImprovementRowStability({
        primary_metric: stability.primary_metric,
        cohort: stability.cohort,
        rows: [
          ...stability.rows,
          {
            ...stability.rows[0],
            row_identity: `${stability.rows[0].row_identity}:alternate`,
            verified_prediction_digest:
              "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          },
        ].map((row) => {
          const copy = structuredClone(row);
          delete (copy as { row_digest?: string }).row_digest;
          return copy;
        }),
      }),
    ).toThrow("canonical_row_stability_inventory_conflicting");
    const tampered = structuredClone(
      action666vStableImprovementFixture.payload.evidence,
    );
    tampered.offline_learning.row_level_stability.splits[0].direction =
      "unfavorable";
    tampered.offline_learning.row_level_stability.ticker_count += 10;
    expect(validateEvidence(tampered)).toContain(
      "canonical_row_level_stability_conflicting",
    );
  });

  test("no-change is explicit and carries no executable experiment plan", () => {
    const result = build(action666vNoChangeFixture);
    expect(result.status).toBe("no_change");
    expect(result.proposal?.proposal_type).toBe("no_change");
    expect(result.proposal?.experiment_plan).toBeNull();
  });

  test("duplicate identity and experiment-plan tampering fail closed", () => {
    expect(build(action666vDuplicateProposalFixture)).toMatchObject({
      status: "conflicting",
      proposal: null,
    });
    expect(build(action666vTamperedPlanFixture)).toMatchObject({
      status: "conflicting",
      proposal: null,
      reason_codes: expect.arrayContaining([
        "experiment_metric_set_binding_conflicting",
        "experiment_plan_digest_or_identity_conflicting",
      ]),
    });
  });

  test("caller-asserted feature trust-root drift conflicts with verified learning evidence", () => {
    expect(build(action666vFeatureTrustDriftFixture)).toMatchObject({
      status: "conflicting",
      proposal: null,
      reason_codes: [
        "action_666_learning_verified_projection_mismatch",
        "external_learning_trust_root_conflicting",
      ],
    });
  });

  test("self-consistent registry, post, root, and caller replacement cannot replace the external authority", () => {
    const replacementPost = createCanonicalModelImprovementTrustedPost({
      trusted_input_identity: "action-666x1:attacker-replacement",
      payload: action666vStableImprovementFixture.payload,
    });
    const replacementRegistry =
      createCanonicalModelImprovementTrustedRegistry([replacementPost]);
    const replacementManifest =
      createCanonicalModelImprovementRegistryAuthorityManifest({
        authority_identity:
          action666x1ProposalRegistryAuthorityManifest.authority_identity,
        registry_root_digests: [replacementRegistry.root_digest],
        feature_context_registry_root_digest:
          action666x1ProposalRegistryAuthorityManifest
            .feature_context_registry_root_digest,
        training_input_registry_root_digest:
          action666x1ProposalRegistryAuthorityManifest
            .training_input_registry_root_digest,
        upstream_verifier_version:
          action666x1ProposalRegistryAuthorityManifest
            .upstream_verifier_version,
      });
    expect(replacementRegistry.root_digest).not.toBe(
      action666x1TrustedProposalRegistry.root_digest,
    );
    expect(replacementManifest.manifest_digest).not.toBe(
      CANONICAL_MODEL_IMPROVEMENT_FROZEN_REGISTRY_MANIFEST_DIGEST,
    );
    expect(() =>
      createCanonicalModelImprovementRegistryAuthority(replacementManifest),
    ).toThrow("proposal_registry_manifest_not_externally_authorized");
  });

  test("canonical upstream adapters reject each Action 664-666 trust-boundary mutation", () => {
    const canonicalSources =
      action666vStableImprovementFixture.payload.upstream_sources;

    const qualityTamper = structuredClone(canonicalSources);
    qualityTamper.quality.comparison.classification = "regression";
    const qualityComparisonPayload = Object.fromEntries(
      Object.entries(qualityTamper.quality.comparison).filter(
        ([key]) => key !== "semantic_digest",
      ),
    );
    qualityTamper.quality.comparison.semantic_digest =
      canonicalQualitySemanticDigest(qualityComparisonPayload);
    expect(
      verifyAndProjectCanonicalModelImprovementUpstreams(qualityTamper),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: ["action_664_quality_replay_conflicting"],
    });

    const opportunityTamper = structuredClone(canonicalSources);
    opportunityTamper.opportunity_sets[0].candidates[0].ticker = "TAMPER";
    expect(
      verifyAndProjectCanonicalModelImprovementUpstreams(opportunityTamper),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: ["action_665_opportunity_replay_conflicting"],
    });

    const shadowTamper = structuredClone(canonicalSources);
    if (!shadowTamper.shadow.evaluation_result.evaluation) {
      throw new Error("shadow_fixture_not_evaluable");
    }
    shadowTamper.shadow.evaluation_result.evaluation.candidate.ranking
      .precision_at_k["1"].value = 0;
    expect(
      verifyAndProjectCanonicalModelImprovementUpstreams(shadowTamper),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: ["action_666_shadow_replay_conflicting"],
    });

    const learningTamper = structuredClone(canonicalSources);
    learningTamper.learning.result.reason_codes = [
      "caller_asserted_reproducible",
    ];
    expect(
      verifyAndProjectCanonicalModelImprovementUpstreams(learningTamper),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: ["action_666_learning_replay_conflicting"],
    });

    const explanationTamper = structuredClone(canonicalSources);
    explanationTamper.explanations[0].result.reason_codes = [
      "caller_asserted_canonical",
    ];
    expect(
      verifyAndProjectCanonicalModelImprovementUpstreams(explanationTamper),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: ["action_666_explanation_replay_conflicting"],
    });
  });

  test("standalone digest literals and caller-asserted summary booleans are not verifier inputs", () => {
    const incomplete = {
      verifier_version:
        action666vStableImprovementFixture.payload.upstream_sources
          .verifier_version,
      quality: {
        comparison_digest:
          action666vStableImprovementFixture.payload.evidence.quality_metrics
            .comparison_digest,
        comparable: true,
      },
    };
    expect(
      verifyAndProjectCanonicalModelImprovementUpstreams(
        incomplete as never,
      ),
    ).toEqual({
      status: "conflicting",
      projection: null,
      reason_codes: ["canonical_upstream_verifier_inputs_missing"],
    });
  });

  test("explicit instants preserve timezone equivalence and nanosecond ordering", () => {
    const utc = parseCanonicalExplicitInstant(
      "2026-07-26T10:00:00.123456789Z",
    );
    const offset = parseCanonicalExplicitInstant(
      "2026-07-26T12:00:00.123456789+02:00",
    );
    expect(utc?.epoch_nanoseconds).toBe(offset?.epoch_nanoseconds);
    expect(
      parseCanonicalExplicitInstant("2026-07-26T10:00:00.123456789"),
    ).toBeNull();
    expect(
      parseCanonicalExplicitInstant("2026-07-26T10:00:00.123456788Z")!
        .epoch_nanoseconds,
    ).toBeLessThan(utc!.epoch_nanoseconds);
  });

  test("canonical future evidence is classified by verified temporal lineage", () => {
    const sources = structuredClone(
      action666vStableImprovementFixture.payload.upstream_sources,
    );
    const futureFixture = action666mFixtureCases[10];
    if (!futureFixture.engine.explain) {
      throw new Error("future_explanation_fixture_disabled");
    }
    sources.explanations = [
      {
        trust_boundary: futureFixture.trustBoundary,
        request: futureFixture.request,
        result: futureFixture.engine.explain(futureFixture.request),
      },
    ];
    expect(
      verifyAndProjectCanonicalModelImprovementUpstreams(sources),
    ).toMatchObject({
      status: "not_point_in_time_safe",
      reason_codes: ["canonical_explanation_not_point_in_time_safe"],
    });
  });

  test("evidence namespaces reject valid SHA values from the wrong section, duplicates, and omissions", () => {
    const evidence = action666vStableImprovementFixture.payload.evidence;
    const canonicalItem =
      action666vStableImprovementFixture.payload.proposal_candidates[0]
        .evidence_items.find(
          (item) => item.evidence_class === "observed_pattern",
        );
    if (!canonicalItem) throw new Error("observed_pattern_fixture_missing");
    const wrongNamespace = structuredClone(canonicalItem);
    wrongNamespace.sources = [
      {
        namespace: "offline_learning",
        digest:
          evidence.upstream_verification.namespace_digests.offline_learning,
      },
    ];
    expect(
      verifyCanonicalModelImprovementEvidenceSourceNamespaces({
        item: wrongNamespace,
        evidence,
      }),
    ).toEqual(["proposal_evidence_source_namespace_conflicting"]);
    const duplicate = structuredClone(canonicalItem);
    duplicate.sources.push(structuredClone(duplicate.sources[0]));
    expect(
      verifyCanonicalModelImprovementEvidenceSourceNamespaces({
        item: duplicate,
        evidence,
      }),
    ).toEqual(["proposal_evidence_source_namespace_conflicting"]);
    const missing = structuredClone(canonicalItem);
    missing.sources = [];
    expect(
      verifyCanonicalModelImprovementEvidenceSourceNamespaces({
        item: missing,
        evidence,
      }),
    ).toEqual(["proposal_evidence_source_namespace_conflicting"]);
  });

  test("upstream verification preserves immutable caller input bytes", () => {
    const sources =
      action666vStableImprovementFixture.post.payload.upstream_sources;
    const before = canonicalModelImprovementDigest(sources);
    expect(Object.isFrozen(sources)).toBe(true);
    expect(
      verifyAndProjectCanonicalModelImprovementUpstreams(sources).status,
    ).toBe("verified");
    expect(canonicalModelImprovementDigest(sources)).toBe(before);
  });

  test("default-off gate performs zero request, registry, authority, or upstream verifier work", () => {
    const counters = zeroCounters();
    let trustBoundaryReads = 0;
    const options = {
      enabled: false,
      kill_switch_engaged: false,
      counters,
    } as Parameters<typeof createCanonicalModelImprovementEngine>[0];
    Object.defineProperty(options, "trust_boundary", {
      get() {
        trustBoundaryReads += 1;
        throw new Error("default_off_must_not_read_trust_boundary");
      },
    });
    Object.defineProperty(options, "previous_binding_lookup", {
      get() {
        trustBoundaryReads += 1;
        throw new Error("default_off_must_not_read_previous_bindings");
      },
    });
    const engine = createCanonicalModelImprovementEngine(options);
    expect(engine).toMatchObject({
      enabled: false,
      status: "disabled",
      build: null,
    });
    expect(trustBoundaryReads).toBe(0);
    expect(counters).toEqual(zeroCounters());
  });

  test("current-main remediation: only literal enabled true and kill-switch false activate", () => {
    const invalidEnabled: unknown[] = [
      undefined,
      null,
      false,
      0,
      1,
      "true",
      {},
      [],
    ];
    const invalidKillSwitch: unknown[] = [
      undefined,
      null,
      true,
      0,
      1,
      "false",
      {},
      [],
    ];
    for (const [enabled, killSwitch] of [
      ...invalidEnabled.map((value) => [value, false]),
      ...invalidKillSwitch.map((value) => [true, value]),
    ] as Array<[unknown, unknown]>) {
      let trustReads = 0;
      const inaccessibleBoundary = new Proxy(
        action666vStableImprovementFixture.trustBoundary,
        {
          get() {
            trustReads += 1;
            throw new Error("disabled_engine_read_trust_boundary");
          },
        },
      );
      const executionCounters = zeroCounters();
      const engine = createCanonicalModelImprovementEngine({
        enabled: enabled as never,
        kill_switch_engaged: killSwitch as never,
        trust_boundary: inaccessibleBoundary,
        previous_binding_lookup: action666x2EmptyPreviousBindingLookup,
        counters: executionCounters,
      });
      expect(engine.build).toBeNull();
      expect(engine.enabled).toBe(false);
      expect(trustReads).toBe(0);
      expect(executionCounters).toEqual(zeroCounters());
    }
  });

  test("current-main remediation: boundary and lookup are construction-time snapshots", () => {
    const fixture = action666vStableImprovementFixture;
    const boundary = {
      trust_source: fixture.trustBoundary.trust_source,
      registry: structuredClone(fixture.trustBoundary.registry),
      registry_authority: fixture.trustBoundary.registry_authority,
    };
    const lookup: CanonicalModelImprovementPreviousBindingLookup = {
      ...action666x2EmptyPreviousBindingLookup,
    };
    const engine = createCanonicalModelImprovementEngine({
      enabled: true,
      kill_switch_engaged: false,
      trust_boundary: boundary,
      previous_binding_lookup: lookup,
    });
    if (!engine.build) throw new Error("snapshot_engine_disabled");
    const before = engine.build(fixture.request);
    expect(before.status).toBe("proposal_ready");

    boundary.registry.posts = [];
    boundary.registry.root_digest = "0".repeat(64);
    lookup.lookup_proposal_binding = () => ({
      semantic_digest: "0".repeat(64),
    });
    lookup.lookup_experiment_binding = () => ({
      semantic_digest: "0".repeat(64),
    });

    expect(engine.build(fixture.request)).toEqual(before);
  });

  test("current-main remediation: malformed boundaries fail closed without throwing", () => {
    const fixture = action666vStableImprovementFixture;
    const missingPayload = {
      trust_source: fixture.trustBoundary.trust_source,
      registry: structuredClone(fixture.trustBoundary.registry),
      registry_authority: fixture.trustBoundary.registry_authority,
    };
    delete (missingPayload.registry.posts[0] as {
      payload?: unknown;
    }).payload;
    const undefinedPayloadField = {
      trust_source: fixture.trustBoundary.trust_source,
      registry: structuredClone(fixture.trustBoundary.registry),
      registry_authority: fixture.trustBoundary.registry_authority,
    };
    (undefinedPayloadField.registry.posts[0].payload as unknown as {
      unexpected?: unknown;
    }).unexpected = undefined;
    const hiddenPayloadField = {
      trust_source: fixture.trustBoundary.trust_source,
      registry: structuredClone(fixture.trustBoundary.registry),
      registry_authority: fixture.trustBoundary.registry_authority,
    };
    Object.defineProperty(hiddenPayloadField.registry.posts[0].payload, "hidden", {
      configurable: true,
      enumerable: false,
      value: true,
    });
    const symbolPayloadField = {
      trust_source: fixture.trustBoundary.trust_source,
      registry: structuredClone(fixture.trustBoundary.registry),
      registry_authority: fixture.trustBoundary.registry_authority,
    };
    Object.defineProperty(
      symbolPayloadField.registry.posts[0].payload,
      Symbol("unexpected"),
      { configurable: true, enumerable: true, value: true },
    );
    const sparseCandidates = {
      trust_source: fixture.trustBoundary.trust_source,
      registry: structuredClone(fixture.trustBoundary.registry),
      registry_authority: fixture.trustBoundary.registry_authority,
    };
    sparseCandidates.registry.posts[0].payload.proposal_candidates.length += 1;
    const extraArrayField = {
      trust_source: fixture.trustBoundary.trust_source,
      registry: structuredClone(fixture.trustBoundary.registry),
      registry_authority: fixture.trustBoundary.registry_authority,
    };
    Object.assign(
      extraArrayField.registry.posts[0].payload.proposal_candidates,
      { unexpected: true },
    );
    const malformedBoundaries: unknown[] = [
      null,
      [],
      {},
      {
        trust_source: fixture.trustBoundary.trust_source,
        registry: null,
        registry_authority: fixture.trustBoundary.registry_authority,
      },
      {
        trust_source: fixture.trustBoundary.trust_source,
        registry: {
          ...structuredClone(fixture.trustBoundary.registry),
          posts: null,
        },
        registry_authority: fixture.trustBoundary.registry_authority,
      },
      missingPayload,
      undefinedPayloadField,
      hiddenPayloadField,
      symbolPayloadField,
      sparseCandidates,
      extraArrayField,
    ];
    for (const boundary of malformedBoundaries) {
      let engine: ReturnType<typeof createCanonicalModelImprovementEngine>;
      expect(() => {
        engine = createCanonicalModelImprovementEngine({
          enabled: true,
          kill_switch_engaged: false,
          trust_boundary: boundary as never,
          previous_binding_lookup: action666x2EmptyPreviousBindingLookup,
        });
      }).not.toThrow();
      expect(engine!.build).not.toBeNull();
      expect(() => engine!.build!(fixture.request)).not.toThrow();
      expect(engine!.build!(fixture.request)).toMatchObject({
        status: "conflicting",
        proposal: null,
      });
    }
  });

  test("current-main remediation: malformed requests return structured failures", () => {
    const fixture = action666vStableImprovementFixture;
    if (!fixture.engine.build) throw new Error("fixture_engine_disabled");
    const undefinedRequestField = {
      ...fixture.request,
      unexpected: undefined,
    };
    const hiddenRequestField = { ...fixture.request };
    Object.defineProperty(hiddenRequestField, "hidden", {
      enumerable: false,
      value: true,
    });
    const symbolRequestField = { ...fixture.request };
    Object.defineProperty(symbolRequestField, Symbol("unexpected"), {
      enumerable: true,
      value: true,
    });
    const malformedRequests: unknown[] = [
      null,
      [],
      {},
      {
        ...fixture.request,
        unexpected: true,
      },
      {
        ...fixture.request,
        trusted_input_digest: 0,
      },
      {
        ...fixture.request,
        trusted_input_identity: null,
      },
      undefinedRequestField,
      hiddenRequestField,
      symbolRequestField,
      new Proxy(fixture.request, {
        get() {
          throw new Error("request_not_cloneable");
        },
      }),
    ];
    for (const request of malformedRequests) {
      expect(() => fixture.engine.build!(request as never)).not.toThrow();
      expect(fixture.engine.build!(request as never)).toMatchObject({
        status: "conflicting",
        proposal: null,
      });
    }
  });

  test("caller cannot override comparability or proposal status through request", () => {
    expect(action666vStableImprovementFixture.request).toEqual({
      evidence_class: "synthetic_fixture_only",
      trusted_input_identity:
        action666vStableImprovementFixture.post.trusted_input_identity,
      trusted_input_digest:
        action666vStableImprovementFixture.post.semantic_digest,
    });
    expect(action666vStableImprovementFixture.request).not.toHaveProperty(
      "comparability_override",
    );
    expect(action666vStableImprovementFixture.request).not.toHaveProperty(
      "status",
    );
    expect(action666vStableImprovementFixture.request).not.toHaveProperty(
      "trust_root",
    );
  });

  test("input order and retry do not change canonical output", () => {
    const first = build();
    const second = build();
    expect(second).toEqual(first);
    expect(canonicalModelImprovementDigest(second)).toBe(
      canonicalModelImprovementDigest(first),
    );
    const reordered = action666vReorderedStableFixture();
    if (!reordered.engine.build) throw new Error("reordered_engine_disabled");
    const reorderedResult = reordered.engine.build(reordered.request);
    expect(reorderedResult.proposal?.candidate).toEqual(
      first.proposal?.candidate,
    );
    expect(reorderedResult.proposal?.experiment_plan).toEqual(
      first.proposal?.experiment_plan,
    );
  });

  test("trusted inputs remain deeply frozen and byte-identical", () => {
    const fixture = action666vStableImprovementFixture;
    const before = canonicalModelImprovementDigest(fixture.post);
    expect(Object.isFrozen(fixture.post)).toBe(true);
    expect(Object.isFrozen(fixture.post.payload.evidence)).toBe(true);
    expect(Object.isFrozen(fixture.post.payload.proposal_candidates)).toBe(
      true,
    );
    build(fixture);
    expect(canonicalModelImprovementDigest(fixture.post)).toBe(before);
  });

  test("result verification rejects metric and digest tampering", () => {
    const result = build();
    const tampered = structuredClone(result);
    if (!tampered.proposal) throw new Error("ready_proposal_missing");
    tampered.proposal.reason_codes = ["caller_claimed_success"];
    expect(
      verifyCanonicalModelImprovementResult({
        engine: action666vStableImprovementFixture.engine,
        request: action666vStableImprovementFixture.request,
        result: tampered,
      }),
    ).toEqual({
      valid: false,
      canonical_result: null,
      reason_codes: ["canonical_model_improvement_result_tampered"],
    });
  });

  test("registry/root tampering is rejected even when caller supplies matching request bytes", () => {
    const post = action666vStableImprovementFixture.post;
    const registry = createCanonicalModelImprovementTrustedRegistry([post]);
    const boundary = {
      ...action666vStableImprovementFixture.trustBoundary,
      registry,
      expected_registry_root_digest:
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    };
    const engine = createCanonicalModelImprovementEngine({
      enabled: true,
      kill_switch_engaged: false,
      trust_boundary: boundary,
      previous_binding_lookup: action666x2EmptyPreviousBindingLookup,
    });
    if (!engine.build) throw new Error("tampered_engine_disabled");
    expect(engine.build(action666vStableImprovementFixture.request)).toMatchObject({
      status: "conflicting",
      proposal: null,
    });
  });

  test("default-off and kill switch do no proposal work", () => {
    expect(DEFAULT_OFF_MODEL_IMPROVEMENT_ENABLED).toBe(false);
    expect(DEFAULT_OFF_MODEL_IMPROVEMENT_KILL_SWITCH_ENGAGED).toBe(true);
    const disabledCounters = zeroCounters();
    const disabled = createCanonicalModelImprovementEngine({
      counters: disabledCounters,
    });
    expect(disabled).toMatchObject({
      enabled: false,
      status: "disabled",
      build: null,
    });
    expect(disabledCounters).toEqual(zeroCounters());
    const killedCounters = zeroCounters();
    const killed = createCanonicalModelImprovementEngine({
      enabled: true,
      kill_switch_engaged: true,
      counters: killedCounters,
    });
    expect(killed).toMatchObject({
      enabled: false,
      status: "kill_switch_engaged",
      build: null,
    });
    expect(killedCounters).toEqual(zeroCounters());
  });

  test("foundation remains server-only and has no live import", () => {
    const root = process.cwd();
    const liveRoots = ["app", "components"];
    const importNeedles = [
      "canonical-model-improvement-proposal",
      "canonical-model-improvement-proposal-fixtures",
    ];
    const offenders: string[] = [];
    for (const liveRoot of liveRoots) {
      const absolute = path.join(root, liveRoot);
      if (!fs.existsSync(absolute)) continue;
      const stack = [absolute];
      while (stack.length > 0) {
        const current = stack.pop()!;
        for (const entry of fs.readdirSync(current, {
          withFileTypes: true,
        })) {
          const child = path.join(current, entry.name);
          if (entry.isDirectory()) stack.push(child);
          else if (
            /\.(?:ts|tsx|js|jsx)$/.test(entry.name) &&
            importNeedles.some((needle) =>
              fs.readFileSync(child, "utf8").includes(needle),
            )
          ) {
            offenders.push(path.relative(root, child));
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
