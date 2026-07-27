import "server-only";

import {
  buildCanonicalCounterfactualOpportunitySet,
  type CanonicalCounterfactualOpportunitySetContract,
} from "@/lib/canonical-counterfactual-opportunity-set";
import {
  action666aCompleteOpportunitySetInput,
  action666aCutoffDriftPair,
  action666aEvaluatorProviderDriftPair,
  action666aMissingRejectedOutcomePair,
  action666aScoreAsProbabilityPair,
  action666aValidPair,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation-fixtures";
import {
  buildCanonicalShadowEvaluationArm,
  type CanonicalShadowEvaluationArm,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import {
  COMPLETED_PAIRED_SHADOW_COVERAGE_EVIDENCE_VERSION,
  COMPLETED_PAIRED_SHADOW_OBSERVATION_BUNDLE_VERSION,
  COMPLETED_PAIRED_SHADOW_OUTCOME_INVENTORY_VERSION,
  COMPLETED_PAIRED_SHADOW_REPRODUCIBILITY_EVIDENCE_VERSION,
  completedPairedShadowObservationInputDigest,
  completedShadowOutcomeInventoryDigest,
  completedShadowOutcomeSemanticDigest,
  type CompletedPairedShadowAdapterStatus,
  type CompletedPairedShadowObservationBundle,
  type CompletedShadowObservationArmBundle,
} from "@/lib/server/completed-paired-shadow-observation-adapter";
import {
  buildTrustedPairedShadowFixtureRegistry,
  trustedPairedShadowFixtureAnchor,
} from "@/lib/server/trusted-paired-shadow-fixture-registry";

function armBundle(
  arm: CanonicalShadowEvaluationArm,
  fixtureIdentity: string,
): CompletedShadowObservationArmBundle {
  const set = arm.opportunity_set;
  const outcomeInventory = set.candidates.flatMap((candidate) => {
    if (!candidate.outcome) return [];
    return [
      {
        canonical_candidate_identity: candidate.canonical_candidate_identity,
        candidate_identity: candidate.candidate_identity,
        expected_outcome_lineage_key:
          candidate.expected_outcome_lineage.expected_outcome_lineage_key,
        outcome_identity: candidate.outcome.outcome_identity,
        evaluator_version: candidate.outcome.evaluator_version,
        provider_contract_version:
          candidate.outcome.provider_contract_version,
        outcome_evaluable: candidate.outcome.outcome_evaluable,
        reproducible: candidate.outcome.reproducible,
        terminal_outcome: candidate.outcome.terminal_outcome,
        r_result: candidate.outcome.r_result,
        outcome_semantic_digest: completedShadowOutcomeSemanticDigest({
          expected_outcome_lineage_key:
            candidate.expected_outcome_lineage
              .expected_outcome_lineage_key,
          outcome: candidate.outcome,
        }),
      },
    ];
  });
  const evaluatorContracts = Array.from(
    new Set(
      set.candidates.map(
        (candidate) =>
          candidate.expected_outcome_lineage.evaluator_contract_version,
      ),
    ),
  );
  if (evaluatorContracts.length !== 1) {
    throw new Error("Fixture evaluator contract must be singular.");
  }
  return {
    arm: arm.arm,
    observation_identity: [
      "shadow-observation",
      fixtureIdentity,
      arm.arm,
    ].join(":"),
    producer_decision_identity: set.decision_identity,
    decision_timestamp: set.decision_timestamp,
    point_in_time_cutoff: set.point_in_time_cutoff,
    cohort: arm.pairing_binding.cohort,
    sample_type: arm.pairing_binding.sample_type,
    opportunity_set: set,
    pre_truncation_membership: {
      evidence_digest: set.pre_truncation_capture_evidence_digest,
      complete_membership_declared: true,
      expected_candidate_count: set.candidates.length,
      observed_candidate_count: set.candidates.length,
      canonical_candidate_identities: set.candidates.map(
        (candidate) => candidate.canonical_candidate_identity,
      ),
    },
    ranking: structuredClone(arm.candidates),
    threshold_policy: structuredClone(arm.threshold_policy),
    versions: {
      ...structuredClone(arm.versions),
      provider_contract_version: set.versions.provider_contract_version,
      evaluator_contract_version: evaluatorContracts[0],
      evaluator_version: set.versions.evaluator_version,
    },
    outcome_inventory_version:
      COMPLETED_PAIRED_SHADOW_OUTCOME_INVENTORY_VERSION,
    outcome_inventory: outcomeInventory,
    no_trade_evidence: set.decision_semantic_binding.no_trade_semantics
      ? structuredClone(
          set.decision_semantic_binding.no_trade_semantics,
        )
      : null,
    coverage_evidence: {
      evidence_version:
        COMPLETED_PAIRED_SHADOW_COVERAGE_EVIDENCE_VERSION,
      coverage_denominator: set.provider_context.coverage_denominator,
      expected_observation_count:
        set.provider_context.expected_observation_count,
      observed_observation_count:
        set.provider_context.observed_observation_count,
      freshness: set.provider_context.freshness,
      provider_contract_version: set.versions.provider_contract_version,
      coverage_complete:
        set.provider_context.freshness === "fresh" &&
        set.provider_context.expected_observation_count > 0 &&
        set.provider_context.expected_observation_count ===
          set.provider_context.observed_observation_count,
    },
    reproducibility_evidence: {
      evidence_version:
        COMPLETED_PAIRED_SHADOW_REPRODUCIBILITY_EVIDENCE_VERSION,
      all_outcomes_joinable:
        outcomeInventory.length === set.candidates.length,
      all_outcomes_reproducible:
        outcomeInventory.length === set.candidates.length &&
        outcomeInventory.every(
          (outcome) => outcome.outcome_evaluable && outcome.reproducible,
        ),
      outcome_inventory_digest:
        completedShadowOutcomeInventoryDigest(outcomeInventory),
    },
  };
}

function completeBundle(input: {
  fixture_identity: string;
  baseline: CanonicalShadowEvaluationArm;
  candidate: CanonicalShadowEvaluationArm;
}): CompletedPairedShadowObservationBundle {
  const bundle: CompletedPairedShadowObservationBundle = {
    bundle_version: COMPLETED_PAIRED_SHADOW_OBSERVATION_BUNDLE_VERSION,
    paired_observation_identity: `paired-shadow:${input.fixture_identity}`,
    producer_decision_identity:
      input.baseline.opportunity_set.decision_identity,
    source_namespace: input.baseline.opportunity_set.source_namespace,
    completed_at: "2026-07-26T14:00:00.000Z",
    fixture_identity: input.fixture_identity,
    baseline: armBundle(input.baseline, input.fixture_identity),
    candidate: armBundle(input.candidate, input.fixture_identity),
    declared_version_differences: [
      "ranking_version",
      "scoring_version",
      "threshold_policy_version",
      "confidence_contract_version",
    ],
    engine_change_intended: false,
    bootstrap_seed: `action-666b:${input.fixture_identity}:seed-v1`,
    input_digest_algorithm: "sha256_canonical_json_v1",
    input_digest: "",
  };
  bundle.input_digest =
    completedPairedShadowObservationInputDigest(bundle);
  return bundle;
}

function refreshDigest(bundle: CompletedPairedShadowObservationBundle) {
  bundle.input_digest =
    completedPairedShadowObservationInputDigest(bundle);
  return bundle;
}

function requireSet(
  input: Parameters<typeof buildCanonicalCounterfactualOpportunitySet>[0],
) {
  const result = buildCanonicalCounterfactualOpportunitySet(input);
  if (result.status !== "built") {
    throw new Error(result.reason_codes.join(","));
  }
  return result.opportunity_set;
}

function requireArm(input: {
  template: CanonicalShadowEvaluationArm;
  set: CanonicalCounterfactualOpportunitySetContract;
  cohort?: CanonicalShadowEvaluationArm["pairing_binding"]["cohort"];
  sample_type?: CanonicalShadowEvaluationArm["pairing_binding"]["sample_type"];
}) {
  const result = buildCanonicalShadowEvaluationArm({
    arm: input.template.arm,
    opportunity_set: input.set,
    cohort: input.cohort ?? input.template.pairing_binding.cohort,
    sample_type:
      input.sample_type ?? input.template.pairing_binding.sample_type,
    versions: structuredClone(input.template.versions),
    threshold_policy: structuredClone(input.template.threshold_policy),
    candidates: structuredClone(input.template.candidates),
  });
  if (result.status !== "built") {
    throw new Error(result.reason_codes.join(","));
  }
  return result.arm;
}

export const action666bCompleteMappedBundle = completeBundle({
  fixture_identity: "complete-mapped-pair",
  baseline: action666aValidPair.baseline,
  candidate: action666aValidPair.candidate,
});

export const action666bTruncatedMembershipBundle = structuredClone(
  action666bCompleteMappedBundle,
);
action666bTruncatedMembershipBundle.fixture_identity =
  "truncated-membership";
action666bTruncatedMembershipBundle.baseline.ranking.pop();
action666bTruncatedMembershipBundle.baseline.pre_truncation_membership
  .canonical_candidate_identities.pop();
action666bTruncatedMembershipBundle.baseline.pre_truncation_membership
  .complete_membership_declared = false;
action666bTruncatedMembershipBundle.baseline.pre_truncation_membership
  .observed_candidate_count -= 1;
refreshDigest(action666bTruncatedMembershipBundle);

export const action666bRankGapBundle = structuredClone(
  action666bCompleteMappedBundle,
);
action666bRankGapBundle.fixture_identity = "rank-gap";
action666bRankGapBundle.candidate.ranking[9].rank = 12;
refreshDigest(action666bRankGapBundle);

export const action666bDuplicateTieBreakBundle = structuredClone(
  action666bCompleteMappedBundle,
);
action666bDuplicateTieBreakBundle.fixture_identity =
  "duplicate-tie-break";
action666bDuplicateTieBreakBundle.candidate.ranking[1].tie_break_key =
  action666bDuplicateTieBreakBundle.candidate.ranking[0].tie_break_key;
refreshDigest(action666bDuplicateTieBreakBundle);

const digestDriftInput = structuredClone(
  action666aCompleteOpportunitySetInput,
);
digestDriftInput.candidates[0].original_score = 93;
const digestDriftSet = requireSet(digestDriftInput);
const digestDriftCandidateArm = requireArm({
  template: action666aValidPair.candidate,
  set: digestDriftSet,
});
export const action666bCandidateSetDigestDriftBundle = completeBundle({
  fixture_identity: "candidate-set-digest-drift",
  baseline: action666aValidPair.baseline,
  candidate: digestDriftCandidateArm,
});

export const action666bCutoffDriftBundle = completeBundle({
  fixture_identity: "cutoff-drift",
  baseline: action666aCutoffDriftPair.baseline,
  candidate: action666aCutoffDriftPair.candidate,
});

export const action666bProviderEvaluatorDriftBundle = completeBundle({
  fixture_identity: "provider-evaluator-drift",
  baseline: action666aEvaluatorProviderDriftPair.baseline,
  candidate: action666aEvaluatorProviderDriftPair.candidate,
});

export const action666bMissingRejectedOutcomeBundle = completeBundle({
  fixture_identity: "missing-rejected-outcome",
  baseline: action666aMissingRejectedOutcomePair.baseline,
  candidate: action666aMissingRejectedOutcomePair.candidate,
});

export const action666bDuplicatedOutcomeBundle = structuredClone(
  action666bCompleteMappedBundle,
);
action666bDuplicatedOutcomeBundle.fixture_identity =
  "duplicated-outcome";
action666bDuplicatedOutcomeBundle.candidate.outcome_inventory.push(
  structuredClone(
    action666bDuplicatedOutcomeBundle.candidate.outcome_inventory[0],
  ),
);
action666bDuplicatedOutcomeBundle.candidate.reproducibility_evidence!
  .outcome_inventory_digest = completedShadowOutcomeInventoryDigest(
  action666bDuplicatedOutcomeBundle.candidate.outcome_inventory,
);
refreshDigest(action666bDuplicatedOutcomeBundle);

function completeNoTradeSet() {
  const input = structuredClone(action666aCompleteOpportunitySetInput);
  input.decision_semantics = {
    decision_disposition: "explicit_no_trade",
    decision_lineage_nodes: [
      {
        node_kind: "no_trade",
        decision_identity: input.decision_identity,
        candidate_identity: null,
        snapshot_identity: null,
      },
    ],
    no_trade_semantics: {
      explicit_decision_recorded: true,
      producer_decision_id: input.decision_identity,
      decision_timestamp: input.decision_timestamp,
      decision_reason_code: "no_publishable_candidate",
      decision_reason_detail: null,
      decision_source: "scanner_policy_v1",
      ai_no_trade_observed: false,
      deterministic_fallback_used: false,
    },
  };
  for (const candidate of input.candidates) {
    candidate.lineage.recommendation_decision_identity =
      input.decision_identity;
    candidate.lineage.snapshot_identity = null;
    candidate.expected_outcome_lineage.recommendation_decision_identity =
      input.decision_identity;
    candidate.expected_outcome_lineage.snapshot_identity = null;
  }
  return requireSet(input);
}

const noTradeSet = completeNoTradeSet();
const noTradeBaselineArm = requireArm({
  template: action666aValidPair.baseline,
  set: noTradeSet,
  cohort: "no_trade_counterfactual",
  sample_type: "no_trade",
});
const noTradeCandidateArm = requireArm({
  template: action666aValidPair.candidate,
  set: noTradeSet,
  cohort: "no_trade_counterfactual",
  sample_type: "no_trade",
});
export const action666bCompleteNoTradeBundle = completeBundle({
  fixture_identity: "complete-explicit-no-trade",
  baseline: noTradeBaselineArm,
  candidate: noTradeCandidateArm,
});

export const action666bNoTradeWithoutCoverageBundle = structuredClone(
  action666bCompleteNoTradeBundle,
);
action666bNoTradeWithoutCoverageBundle.fixture_identity =
  "no-trade-without-counterfactual-coverage";
action666bNoTradeWithoutCoverageBundle.candidate.coverage_evidence = null;
refreshDigest(action666bNoTradeWithoutCoverageBundle);

export const action666bCalibratedProbabilityBundle = completeBundle({
  fixture_identity: "calibrated-probability",
  baseline: action666aValidPair.baseline,
  candidate: action666aValidPair.candidate,
});

export const action666bScoreAsProbabilityBundle = completeBundle({
  fixture_identity: "score-as-probability",
  baseline: action666aScoreAsProbabilityPair.baseline,
  candidate: action666aScoreAsProbabilityPair.candidate,
});

export const action666bTamperedInputDigestBundle = structuredClone(
  action666bCompleteMappedBundle,
);
action666bTamperedInputDigestBundle.candidate.ranking[0].score = 0;

export const action666bReorderedBundle = structuredClone(
  action666bCompleteMappedBundle,
);
action666bReorderedBundle.baseline.ranking.reverse();
action666bReorderedBundle.candidate.ranking.reverse();
action666bReorderedBundle.baseline.outcome_inventory.reverse();
action666bReorderedBundle.candidate.outcome_inventory.reverse();
action666bReorderedBundle.baseline.pre_truncation_membership
  .canonical_candidate_identities.reverse();
action666bReorderedBundle.candidate.pre_truncation_membership
  .canonical_candidate_identities.reverse();
action666bReorderedBundle.declared_version_differences.reverse();
refreshDigest(action666bReorderedBundle);

export type Action666bAdapterFixtureCase = {
  name: string;
  scenario_class: string;
  bundle: CompletedPairedShadowObservationBundle;
  expected_status: CompletedPairedShadowAdapterStatus;
};

export const action666bAdapterFixtureCases: Action666bAdapterFixtureCase[] = [
  {
    name: "complete_mapped_baseline_candidate_pair",
    scenario_class: "complete_pair",
    bundle: action666bCompleteMappedBundle,
    expected_status: "mapped",
  },
  {
    name: "truncated_membership",
    scenario_class: "membership",
    bundle: action666bTruncatedMembershipBundle,
    expected_status: "unmappable",
  },
  {
    name: "rank_gap",
    scenario_class: "ranking",
    bundle: action666bRankGapBundle,
    expected_status: "conflicting",
  },
  {
    name: "duplicate_tie_break",
    scenario_class: "ranking",
    bundle: action666bDuplicateTieBreakBundle,
    expected_status: "conflicting",
  },
  {
    name: "candidate_set_digest_drift",
    scenario_class: "membership_digest",
    bundle: action666bCandidateSetDigestDriftBundle,
    expected_status: "conflicting",
  },
  {
    name: "different_cutoff",
    scenario_class: "point_in_time",
    bundle: action666bCutoffDriftBundle,
    expected_status: "conflicting",
  },
  {
    name: "different_provider_evaluator",
    scenario_class: "contracts",
    bundle: action666bProviderEvaluatorDriftBundle,
    expected_status: "conflicting",
  },
  {
    name: "missing_rejected_outcome",
    scenario_class: "outcomes",
    bundle: action666bMissingRejectedOutcomeBundle,
    expected_status: "unmappable",
  },
  {
    name: "duplicated_outcome",
    scenario_class: "outcomes",
    bundle: action666bDuplicatedOutcomeBundle,
    expected_status: "conflicting",
  },
  {
    name: "explicit_no_trade_complete_set",
    scenario_class: "no_trade",
    bundle: action666bCompleteNoTradeBundle,
    expected_status: "mapped",
  },
  {
    name: "no_trade_without_counterfactual_coverage",
    scenario_class: "no_trade",
    bundle: action666bNoTradeWithoutCoverageBundle,
    expected_status: "unmappable",
  },
  {
    name: "calibrated_probability",
    scenario_class: "confidence",
    bundle: action666bCalibratedProbabilityBundle,
    expected_status: "mapped",
  },
  {
    name: "score_presented_as_probability",
    scenario_class: "confidence",
    bundle: action666bScoreAsProbabilityBundle,
    expected_status: "mapped",
  },
  {
    name: "tampered_input_digest",
    scenario_class: "input_digest",
    bundle: action666bTamperedInputDigestBundle,
    expected_status: "conflicting",
  },
  {
    name: "input_order_determinism",
    scenario_class: "determinism",
    bundle: action666bReorderedBundle,
    expected_status: "mapped",
  },
  {
    name: "immutable_replay",
    scenario_class: "determinism",
    bundle: action666bCompleteMappedBundle,
    expected_status: "mapped",
  },
];

export const action666bTrustedFixtureRegistry =
  buildTrustedPairedShadowFixtureRegistry([
    action666bCompleteMappedBundle,
    action666bCompleteNoTradeBundle,
    action666bCalibratedProbabilityBundle,
    action666bScoreAsProbabilityBundle,
  ]);

export const action666bTrustedFixtureAnchor =
  trustedPairedShadowFixtureAnchor(action666bTrustedFixtureRegistry);
