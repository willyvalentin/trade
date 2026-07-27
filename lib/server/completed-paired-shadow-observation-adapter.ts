import "server-only";

import { createHash } from "node:crypto";

import {
  buildCanonicalShadowEvaluationArm,
  deriveCanonicalShadowVersionDifferenceSet,
  type CanonicalShadowAlgorithmVersions,
  type CanonicalShadowCandidateObservation,
  type CanonicalShadowEvaluationArm,
  type CanonicalShadowPairComparisonInput,
  type CanonicalShadowSampleType,
  type CanonicalShadowThresholdPolicy,
  type CanonicalShadowVersionDifference,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import type {
  CanonicalCounterfactualOpportunitySetContract,
  CanonicalNoTradeSemantics,
} from "@/lib/canonical-counterfactual-opportunity-set";
import type { CanonicalEvaluationCohort } from "@/lib/server/canonical-evaluation-quality-read-model";

export const COMPLETED_PAIRED_SHADOW_OBSERVATION_BUNDLE_VERSION =
  "completed_paired_shadow_observation_bundle_v1" as const;
export const COMPLETED_PAIRED_SHADOW_OBSERVATION_ADAPTER_VERSION =
  "completed_paired_shadow_observation_adapter_v1" as const;
export const COMPLETED_PAIRED_SHADOW_OUTCOME_INVENTORY_VERSION =
  "completed_paired_shadow_outcome_inventory_v1" as const;
export const COMPLETED_PAIRED_SHADOW_COVERAGE_EVIDENCE_VERSION =
  "completed_paired_shadow_coverage_evidence_v1" as const;
export const COMPLETED_PAIRED_SHADOW_REPRODUCIBILITY_EVIDENCE_VERSION =
  "completed_paired_shadow_reproducibility_evidence_v1" as const;

export type CompletedPairedShadowAdapterStatus =
  | "mapped"
  | "conflicting"
  | "unmappable";

export type CompletedShadowOutcomeInventoryEntry = {
  canonical_candidate_identity: string;
  candidate_identity: string;
  expected_outcome_lineage_key: string;
  outcome_identity: string;
  evaluator_version: string;
  provider_contract_version: string;
  outcome_evaluable: boolean;
  reproducible: boolean;
  terminal_outcome: string;
  r_result: number | null;
  outcome_semantic_digest: string;
};

export type CompletedShadowPreTruncationMembership = {
  evidence_digest: string;
  complete_membership_declared: boolean;
  expected_candidate_count: number;
  observed_candidate_count: number;
  canonical_candidate_identities: string[];
};

export type CompletedShadowCoverageEvidence = {
  evidence_version:
    typeof COMPLETED_PAIRED_SHADOW_COVERAGE_EVIDENCE_VERSION;
  coverage_denominator: string;
  expected_observation_count: number;
  observed_observation_count: number;
  freshness: string;
  provider_contract_version: string;
  coverage_complete: boolean;
};

export type CompletedShadowReproducibilityEvidence = {
  evidence_version:
    typeof COMPLETED_PAIRED_SHADOW_REPRODUCIBILITY_EVIDENCE_VERSION;
  all_outcomes_joinable: boolean;
  all_outcomes_reproducible: boolean;
  outcome_inventory_digest: string;
};

export type CompletedShadowObservationVersions =
  CanonicalShadowAlgorithmVersions & {
    evaluator_contract_version: string;
  };

export type CompletedShadowObservationArmBundle = {
  arm: "baseline" | "candidate";
  observation_identity: string;
  producer_decision_identity: string;
  decision_timestamp: string;
  point_in_time_cutoff: string;
  cohort: CanonicalEvaluationCohort;
  sample_type: CanonicalShadowSampleType;
  opportunity_set: CanonicalCounterfactualOpportunitySetContract;
  pre_truncation_membership: CompletedShadowPreTruncationMembership;
  ranking: CanonicalShadowCandidateObservation[];
  threshold_policy: CanonicalShadowThresholdPolicy;
  versions: CompletedShadowObservationVersions;
  outcome_inventory_version:
    typeof COMPLETED_PAIRED_SHADOW_OUTCOME_INVENTORY_VERSION;
  outcome_inventory: CompletedShadowOutcomeInventoryEntry[];
  no_trade_evidence: CanonicalNoTradeSemantics | null;
  coverage_evidence: CompletedShadowCoverageEvidence | null;
  reproducibility_evidence:
    | CompletedShadowReproducibilityEvidence
    | null;
};

export type CompletedPairedShadowObservationBundle = {
  bundle_version: typeof COMPLETED_PAIRED_SHADOW_OBSERVATION_BUNDLE_VERSION;
  paired_observation_identity: string;
  producer_decision_identity: string;
  source_namespace: string;
  completed_at: string;
  fixture_identity: string;
  baseline: CompletedShadowObservationArmBundle;
  candidate: CompletedShadowObservationArmBundle;
  declared_version_differences: CanonicalShadowVersionDifference[];
  engine_change_intended: boolean;
  bootstrap_seed: string;
  input_digest_algorithm: "sha256_canonical_json_v1";
  input_digest: string;
};

export type CompletedPairedShadowObservationAdapterResult =
  | {
      adapter_version:
        typeof COMPLETED_PAIRED_SHADOW_OBSERVATION_ADAPTER_VERSION;
      status: "mapped";
      comparison_input: CanonicalShadowPairComparisonInput;
      input_digest: string;
      reason_codes: [];
      offline_shadow_only: true;
    }
  | {
      adapter_version:
        typeof COMPLETED_PAIRED_SHADOW_OBSERVATION_ADAPTER_VERSION;
      status: "conflicting" | "unmappable";
      comparison_input: null;
      input_digest: string | null;
      reason_codes: string[];
      offline_shadow_only: true;
    };

type ValidationIssue = {
  classification: "conflicting" | "unmappable";
  reason_code: string;
};

const instantPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const identityPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,255}$/;
const fullShaPattern = /^[0-9a-f]{64}$/;
const versionFields = [
  "engine_version",
  "scoring_version",
  "ranking_version",
  "threshold_policy_version",
  "setup_taxonomy_version",
  "confidence_contract_version",
  "evaluator_version",
  "provider_contract_version",
] as const satisfies readonly CanonicalShadowVersionDifference[];

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}
function semanticDigest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function normalizedArmForDigest(arm: CompletedShadowObservationArmBundle) {
  return {
    ...arm,
    pre_truncation_membership: {
      ...arm.pre_truncation_membership,
      canonical_candidate_identities: [
        ...arm.pre_truncation_membership.canonical_candidate_identities,
      ].sort(),
    },
    ranking: [...arm.ranking].sort((first, second) =>
      first.canonical_candidate_identity.localeCompare(
        second.canonical_candidate_identity,
      ),
    ),
    threshold_policy: {
      ...arm.threshold_policy,
      thresholds: [...arm.threshold_policy.thresholds].sort(
        (first, second) => first - second,
      ),
    },
    outcome_inventory: [...arm.outcome_inventory].sort(
      (first, second) =>
        first.canonical_candidate_identity.localeCompare(
          second.canonical_candidate_identity,
        ) || first.outcome_identity.localeCompare(second.outcome_identity),
    ),
  };
}

function normalizedBundlePayload(
  bundle: CompletedPairedShadowObservationBundle,
) {
  const { input_digest: _inputDigest, ...payload } = bundle;
  void _inputDigest;
  return {
    ...payload,
    baseline: normalizedArmForDigest(bundle.baseline),
    candidate: normalizedArmForDigest(bundle.candidate),
    declared_version_differences: [
      ...bundle.declared_version_differences,
    ].sort(),
  };
}

export function completedPairedShadowObservationInputDigest(
  bundle: CompletedPairedShadowObservationBundle,
) {
  return semanticDigest(normalizedBundlePayload(bundle));
}

export function completedShadowOutcomeSemanticDigest(input: {
  expected_outcome_lineage_key: string;
  outcome: CanonicalCounterfactualOpportunitySetContract["candidates"][number]["outcome"];
}) {
  return semanticDigest(input);
}

export function completedShadowOutcomeInventoryDigest(
  inventory: CompletedShadowOutcomeInventoryEntry[],
) {
  return semanticDigest(
    [...inventory].sort(
      (first, second) =>
        first.canonical_candidate_identity.localeCompare(
          second.canonical_candidate_identity,
        ) || first.outcome_identity.localeCompare(second.outcome_identity),
    ),
  );
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function stableIdentity(value: unknown) {
  return typeof value === "string" && identityPattern.test(value);
}

function explicitInstant(value: unknown) {
  return (
    typeof value === "string" &&
    instantPattern.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function exactJson(first: unknown, second: unknown) {
  return (
    JSON.stringify(canonicalize(first)) ===
    JSON.stringify(canonicalize(second))
  );
}

function issue(
  classification: ValidationIssue["classification"],
  reasonCode: string,
): ValidationIssue {
  return { classification, reason_code: reasonCode };
}

function membershipIssues(arm: CompletedShadowObservationArmBundle) {
  const issues: ValidationIssue[] = [];
  const setIdentities = arm.opportunity_set.candidates
    .map((candidate) => candidate.canonical_candidate_identity)
    .sort();
  const evidenceIdentities = [
    ...arm.pre_truncation_membership.canonical_candidate_identities,
  ].sort();
  const rankingIdentities = arm.ranking
    .map((candidate) => candidate.canonical_candidate_identity)
    .sort();
  if (!arm.pre_truncation_membership.complete_membership_declared) {
    issues.push(issue("unmappable", "pre_truncation_membership_not_complete"));
  }
  if (
    arm.pre_truncation_membership.evidence_digest !==
    arm.opportunity_set.pre_truncation_capture_evidence_digest
  ) {
    issues.push(issue("conflicting", "pre_truncation_evidence_digest_mismatch"));
  }
  if (
    arm.pre_truncation_membership.expected_candidate_count !==
      setIdentities.length ||
    arm.pre_truncation_membership.observed_candidate_count !==
      setIdentities.length
  ) {
    issues.push(issue("unmappable", "pre_truncation_candidate_count_incomplete"));
  }
  if (
    !exactJson(evidenceIdentities, setIdentities) ||
    !exactJson(rankingIdentities, setIdentities)
  ) {
    issues.push(issue("unmappable", "full_candidate_membership_missing"));
  }
  if (
    new Set(evidenceIdentities).size !== evidenceIdentities.length ||
    new Set(rankingIdentities).size !== rankingIdentities.length
  ) {
    issues.push(issue("conflicting", "candidate_identity_duplicate"));
  }
  return issues;
}

function rankingIssues(arm: CompletedShadowObservationArmBundle) {
  const issues: ValidationIssue[] = [];
  if (
    arm.ranking.some(
      (candidate) =>
        !Number.isInteger(candidate.rank) ||
        candidate.rank < 1 ||
        !candidate.tie_break_key.trim() ||
        !Number.isFinite(candidate.score),
    )
  ) {
    issues.push(issue("unmappable", "ranking_observation_incomplete"));
  }
  const tieBreaks = arm.ranking.map((candidate) => candidate.tie_break_key);
  if (new Set(tieBreaks).size !== tieBreaks.length) {
    issues.push(issue("conflicting", "ranking_tie_break_duplicate"));
  }
  const uniqueRanks = Array.from(
    new Set(arm.ranking.map((candidate) => candidate.rank)),
  ).sort((first, second) => first - second);
  if (uniqueRanks.some((rank, index) => rank !== index + 1)) {
    issues.push(issue("conflicting", "ranking_rank_gap"));
  }
  return issues;
}

function versionIssues(arm: CompletedShadowObservationArmBundle) {
  const issues: ValidationIssue[] = [];
  const requiredVersions = [
    ...versionFields,
    "provider_contract_version",
    "evaluator_contract_version",
    "evaluator_version",
  ] as const;
  if (
    requiredVersions.some(
      (field) =>
        typeof arm.versions[field] !== "string" ||
        !arm.versions[field].trim(),
    )
  ) {
    issues.push(issue("unmappable", "shadow_versions_incomplete"));
  }
  const evaluatorContracts = uniqueSorted(
    arm.opportunity_set.candidates.map(
      (candidate) =>
        candidate.expected_outcome_lineage.evaluator_contract_version,
    ),
  );
  if (
    arm.versions.provider_contract_version !==
      arm.opportunity_set.versions.provider_contract_version ||
    arm.versions.evaluator_version !==
      arm.opportunity_set.versions.evaluator_version ||
    evaluatorContracts.length !== 1 ||
    arm.versions.evaluator_contract_version !== evaluatorContracts[0]
  ) {
    issues.push(issue("conflicting", "provider_or_evaluator_version_mismatch"));
  }
  if (
    arm.versions.threshold_policy_version !== arm.threshold_policy.version
  ) {
    issues.push(issue("conflicting", "threshold_policy_version_mismatch"));
  }
  return issues;
}

function outcomeIssues(arm: CompletedShadowObservationArmBundle) {
  const issues: ValidationIssue[] = [];
  if (
    arm.outcome_inventory_version !==
    COMPLETED_PAIRED_SHADOW_OUTCOME_INVENTORY_VERSION
  ) {
    issues.push(issue("unmappable", "outcome_inventory_version_missing"));
  }
  const inventoryByCandidate = new Map<
    string,
    CompletedShadowOutcomeInventoryEntry[]
  >();
  for (const entry of arm.outcome_inventory) {
    const current =
      inventoryByCandidate.get(entry.canonical_candidate_identity) ?? [];
    current.push(entry);
    inventoryByCandidate.set(entry.canonical_candidate_identity, current);
  }
  if (
    [...inventoryByCandidate.values()].some((entries) => entries.length > 1) ||
    new Set(arm.outcome_inventory.map((entry) => entry.outcome_identity)).size !==
      arm.outcome_inventory.length
  ) {
    issues.push(issue("conflicting", "outcome_inventory_duplicate"));
  }
  for (const candidate of arm.opportunity_set.candidates) {
    const entries =
      inventoryByCandidate.get(candidate.canonical_candidate_identity) ?? [];
    if (!candidate.outcome || entries.length === 0) {
      issues.push(issue("unmappable", "candidate_outcome_missing"));
      continue;
    }
    if (entries.length !== 1) continue;
    const entry = entries[0];
    const expectedDigest = completedShadowOutcomeSemanticDigest({
      expected_outcome_lineage_key:
        candidate.expected_outcome_lineage.expected_outcome_lineage_key,
      outcome: candidate.outcome,
    });
    if (
      entry.candidate_identity !== candidate.candidate_identity ||
      entry.expected_outcome_lineage_key !==
        candidate.expected_outcome_lineage.expected_outcome_lineage_key ||
      entry.outcome_identity !== candidate.outcome.outcome_identity ||
      entry.evaluator_version !== candidate.outcome.evaluator_version ||
      entry.provider_contract_version !==
        candidate.outcome.provider_contract_version ||
      entry.outcome_evaluable !== candidate.outcome.outcome_evaluable ||
      entry.reproducible !== candidate.outcome.reproducible ||
      entry.terminal_outcome !== candidate.outcome.terminal_outcome ||
      entry.r_result !== candidate.outcome.r_result ||
      entry.outcome_semantic_digest !== expectedDigest
    ) {
      issues.push(issue("conflicting", "candidate_outcome_lineage_mismatch"));
    }
  }
  if (arm.outcome_inventory.length !== arm.opportunity_set.candidates.length) {
    issues.push(issue("unmappable", "outcome_inventory_membership_incomplete"));
  }
  return issues;
}

function noTradeIssues(arm: CompletedShadowObservationArmBundle) {
  const issues: ValidationIssue[] = [];
  const binding = arm.opportunity_set.decision_semantic_binding;
  if (binding.decision_disposition === "explicit_no_trade") {
    if (!arm.no_trade_evidence) {
      issues.push(issue("unmappable", "explicit_no_trade_evidence_missing"));
    } else if (
      !exactJson(arm.no_trade_evidence, binding.no_trade_semantics) ||
      arm.no_trade_evidence.producer_decision_id !==
        arm.producer_decision_identity
    ) {
      issues.push(issue("conflicting", "explicit_no_trade_evidence_mismatch"));
    }
  } else if (arm.no_trade_evidence !== null) {
    issues.push(issue("conflicting", "no_trade_evidence_without_disposition"));
  }
  return issues;
}

function coverageAndReproducibilityIssues(
  arm: CompletedShadowObservationArmBundle,
) {
  const issues: ValidationIssue[] = [];
  const coverage = arm.coverage_evidence;
  if (!coverage) {
    issues.push(issue("unmappable", "coverage_evidence_missing"));
  } else {
    const provider = arm.opportunity_set.provider_context;
    if (
      coverage.evidence_version !==
        COMPLETED_PAIRED_SHADOW_COVERAGE_EVIDENCE_VERSION ||
      coverage.coverage_denominator !== provider.coverage_denominator ||
      coverage.expected_observation_count !==
        provider.expected_observation_count ||
      coverage.observed_observation_count !==
        provider.observed_observation_count ||
      coverage.freshness !== provider.freshness ||
      coverage.provider_contract_version !==
        arm.opportunity_set.versions.provider_contract_version
    ) {
      issues.push(issue("conflicting", "coverage_evidence_mismatch"));
    }
    if (
      !coverage.coverage_complete ||
      coverage.expected_observation_count <= 0 ||
      coverage.expected_observation_count !==
        coverage.observed_observation_count ||
      coverage.freshness !== "fresh"
    ) {
      issues.push(issue("unmappable", "counterfactual_coverage_incomplete"));
    }
  }
  const reproducibility = arm.reproducibility_evidence;
  if (!reproducibility) {
    issues.push(issue("unmappable", "reproducibility_evidence_missing"));
  } else {
    const expectedInventoryDigest = completedShadowOutcomeInventoryDigest(
      arm.outcome_inventory,
    );
    if (
      reproducibility.evidence_version !==
        COMPLETED_PAIRED_SHADOW_REPRODUCIBILITY_EVIDENCE_VERSION ||
      reproducibility.outcome_inventory_digest !== expectedInventoryDigest
    ) {
      issues.push(issue("conflicting", "reproducibility_evidence_mismatch"));
    }
    if (
      !reproducibility.all_outcomes_joinable ||
      !reproducibility.all_outcomes_reproducible ||
      arm.opportunity_set.candidates.some(
        (candidate) =>
          !candidate.outcome?.outcome_evaluable ||
          !candidate.outcome.reproducible,
      )
    ) {
      issues.push(issue("unmappable", "outcomes_not_reproducible"));
    }
  }
  return issues;
}

function identityAndTimeIssues(
  bundle: CompletedPairedShadowObservationBundle,
  arm: CompletedShadowObservationArmBundle,
) {
  const issues: ValidationIssue[] = [];
  if (
    !stableIdentity(arm.observation_identity) ||
    !stableIdentity(arm.producer_decision_identity)
  ) {
    issues.push(issue("unmappable", "observation_or_decision_identity_missing"));
  }
  if (
    arm.producer_decision_identity !== bundle.producer_decision_identity ||
    arm.producer_decision_identity !== arm.opportunity_set.decision_identity
  ) {
    issues.push(issue("conflicting", "producer_decision_identity_mismatch"));
  }
  if (
    !explicitInstant(arm.decision_timestamp) ||
    !explicitInstant(arm.point_in_time_cutoff)
  ) {
    issues.push(issue("unmappable", "decision_timestamp_or_cutoff_missing"));
  }
  if (
    arm.decision_timestamp !== arm.opportunity_set.decision_timestamp ||
    arm.point_in_time_cutoff !== arm.opportunity_set.point_in_time_cutoff
  ) {
    issues.push(issue("conflicting", "decision_timestamp_or_cutoff_mismatch"));
  }
  return issues;
}

function validateArm(
  bundle: CompletedPairedShadowObservationBundle,
  armBundle: CompletedShadowObservationArmBundle,
) {
  const issues = [
    ...identityAndTimeIssues(bundle, armBundle),
    ...membershipIssues(armBundle),
    ...rankingIssues(armBundle),
    ...versionIssues(armBundle),
    ...outcomeIssues(armBundle),
    ...noTradeIssues(armBundle),
    ...coverageAndReproducibilityIssues(armBundle),
  ];
  const armResult = buildCanonicalShadowEvaluationArm({
    arm: armBundle.arm,
    opportunity_set: armBundle.opportunity_set,
    cohort: armBundle.cohort,
    sample_type: armBundle.sample_type,
    versions: {
      engine_version: armBundle.versions.engine_version,
      scoring_version: armBundle.versions.scoring_version,
      ranking_version: armBundle.versions.ranking_version,
      threshold_policy_version:
        armBundle.versions.threshold_policy_version,
      setup_taxonomy_version:
        armBundle.versions.setup_taxonomy_version,
      confidence_contract_version:
        armBundle.versions.confidence_contract_version,
      evaluator_version: armBundle.versions.evaluator_version,
      provider_contract_version:
        armBundle.versions.provider_contract_version,
    },
    threshold_policy: armBundle.threshold_policy,
    candidates: armBundle.ranking,
  });
  if (armResult.status !== "built") {
    for (const reasonCode of armResult.reason_codes) {
      issues.push(
        issue(
          reasonCode.includes("membership")
            ? "unmappable"
            : "conflicting",
          `canonical_arm_${reasonCode}`,
        ),
      );
    }
  }
  return {
    issues,
    arm: armResult.status === "built" ? armResult.arm : null,
  };
}

function pairIssues(
  bundle: CompletedPairedShadowObservationBundle,
  baseline: CanonicalShadowEvaluationArm,
  candidate: CanonicalShadowEvaluationArm,
) {
  const issues: ValidationIssue[] = [];
  const baselineBinding = baseline.pairing_binding;
  const candidateBinding = candidate.pairing_binding;
  const exactFields = [
    "opportunity_set_identity",
    "authoritative_opportunity_set_digest",
    "full_candidate_set_digest",
    "full_membership_identity_digest",
    "decision_timestamp",
    "point_in_time_cutoff",
    "outcome_evaluator_lineage_digest",
    "provider_contract",
    "evaluator_contract",
    "cohort",
    "sample_type",
    "terminal_outcome_policy",
    "coverage_denominator",
    "expected_coverage",
    "observed_coverage",
  ] as const;
  for (const field of exactFields) {
    if (baselineBinding[field] !== candidateBinding[field]) {
      issues.push(issue("conflicting", `paired_${field}_mismatch`));
    }
  }
  if (
    !exactJson(
      baselineBinding.trading_days,
      candidateBinding.trading_days,
    ) ||
    !exactJson(
      baselineBinding.opportunity_set_inventory,
      candidateBinding.opportunity_set_inventory,
    )
  ) {
    issues.push(issue("conflicting", "paired_inventory_or_days_mismatch"));
  }

  const declared = new Set(bundle.declared_version_differences);
  if (declared.size !== bundle.declared_version_differences.length) {
    issues.push(issue("conflicting", "declared_version_difference_duplicate"));
  }
  const derived = deriveCanonicalShadowVersionDifferenceSet({
    baseline: baseline.versions,
    candidate: candidate.versions,
  });
  const declaredSorted = [...declared].sort();
  if (!exactJson(declaredSorted, derived.differences)) {
    issues.push(issue("conflicting", "declared_version_difference_set_mismatch"));
  }
  if (
    derived.differences.includes("engine_version") &&
    !bundle.engine_change_intended
  ) {
    issues.push(issue("conflicting", "engine_change_not_explicitly_intended"));
  }
  if (
    bundle.engine_change_intended &&
    !derived.differences.includes("engine_version")
  ) {
    issues.push(
      issue("conflicting", "engine_change_intent_without_engine_difference"),
    );
  }
  return issues;
}

function result(
  status: "conflicting" | "unmappable",
  bundle: CompletedPairedShadowObservationBundle,
  reasons: string[],
): CompletedPairedShadowObservationAdapterResult {
  return {
    adapter_version: COMPLETED_PAIRED_SHADOW_OBSERVATION_ADAPTER_VERSION,
    status,
    comparison_input: null,
    input_digest: fullShaPattern.test(bundle.input_digest)
      ? bundle.input_digest
      : null,
    reason_codes: uniqueSorted(reasons),
    offline_shadow_only: true,
  };
}

function classification(issues: ValidationIssue[]) {
  return issues.some((item) => item.classification === "conflicting")
    ? ("conflicting" as const)
    : ("unmappable" as const);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

export function adaptCompletedPairedShadowObservationBundle(
  input: CompletedPairedShadowObservationBundle,
): CompletedPairedShadowObservationAdapterResult {
  let bundle: CompletedPairedShadowObservationBundle;
  try {
    bundle = structuredClone(input);
  } catch {
    return {
      adapter_version: COMPLETED_PAIRED_SHADOW_OBSERVATION_ADAPTER_VERSION,
      status: "unmappable",
      comparison_input: null,
      input_digest: null,
      reason_codes: ["bundle_not_cloneable"],
      offline_shadow_only: true,
    };
  }

  const topLevelIssues: ValidationIssue[] = [];
  if (
    bundle.bundle_version !==
    COMPLETED_PAIRED_SHADOW_OBSERVATION_BUNDLE_VERSION
  ) {
    topLevelIssues.push(issue("unmappable", "bundle_version_missing"));
  }
  if (
    !stableIdentity(bundle.paired_observation_identity) ||
    !stableIdentity(bundle.producer_decision_identity) ||
    !stableIdentity(bundle.source_namespace) ||
    !stableIdentity(bundle.fixture_identity)
  ) {
    topLevelIssues.push(issue("unmappable", "bundle_identity_missing"));
  }
  if (!explicitInstant(bundle.completed_at) || !bundle.bootstrap_seed.trim()) {
    topLevelIssues.push(
      issue("unmappable", "bundle_completion_or_bootstrap_identity_missing"),
    );
  }
  if (
    bundle.input_digest_algorithm !== "sha256_canonical_json_v1" ||
    !fullShaPattern.test(bundle.input_digest)
  ) {
    topLevelIssues.push(issue("unmappable", "input_digest_format_invalid"));
  } else if (
    completedPairedShadowObservationInputDigest(bundle) !==
    bundle.input_digest
  ) {
    topLevelIssues.push(issue("conflicting", "input_digest_mismatch"));
  }
  if (
    bundle.baseline.arm !== "baseline" ||
    bundle.candidate.arm !== "candidate" ||
    bundle.baseline.observation_identity ===
      bundle.candidate.observation_identity
  ) {
    topLevelIssues.push(issue("conflicting", "paired_arm_identity_conflict"));
  }
  if (
    bundle.source_namespace !==
      bundle.baseline.opportunity_set.source_namespace ||
    bundle.source_namespace !==
      bundle.candidate.opportunity_set.source_namespace
  ) {
    topLevelIssues.push(issue("conflicting", "source_namespace_mismatch"));
  }
  if (topLevelIssues.length > 0) {
    return result(
      classification(topLevelIssues),
      bundle,
      topLevelIssues.map((item) => item.reason_code),
    );
  }

  const baseline = validateArm(bundle, bundle.baseline);
  const candidate = validateArm(bundle, bundle.candidate);
  const armIssues = [...baseline.issues, ...candidate.issues];
  if (armIssues.length > 0 || !baseline.arm || !candidate.arm) {
    return result(
      classification(armIssues),
      bundle,
      armIssues.map((item) => item.reason_code),
    );
  }
  const pairedIssues = pairIssues(bundle, baseline.arm, candidate.arm);
  if (pairedIssues.length > 0) {
    return result(
      classification(pairedIssues),
      bundle,
      pairedIssues.map((item) => item.reason_code),
    );
  }

  const comparisonInput: CanonicalShadowPairComparisonInput = {
    baseline: baseline.arm,
    candidate: candidate.arm,
    declared_version_differences: [
      ...bundle.declared_version_differences,
    ].sort(),
    engine_change_intended: bundle.engine_change_intended,
    bootstrap_seed: bundle.bootstrap_seed,
  };
  return {
    adapter_version: COMPLETED_PAIRED_SHADOW_OBSERVATION_ADAPTER_VERSION,
    status: "mapped",
    comparison_input: deepFreeze(comparisonInput),
    input_digest: bundle.input_digest,
    reason_codes: [],
    offline_shadow_only: true,
  };
}
