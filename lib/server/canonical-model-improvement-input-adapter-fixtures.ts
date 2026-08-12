import "server-only";

import {
  canonicalModelImprovementDigest,
  type CanonicalModelImprovementPreviousBindingLookup,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  action666vInsufficientFixture,
  action666vNoChangeFixture,
  action666vStableImprovementFixture,
} from "@/lib/server/canonical-model-improvement-proposal-fixtures";
import {
  CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
  canonicalCompletedImprovementEvidenceBundleDigest,
  type CanonicalCompletedImprovementEvidenceBundle,
} from "@/lib/server/canonical-model-improvement-input-adapter";

type SourceFixture = typeof action666vStableImprovementFixture;

export const action666acEmptyPreviousBindingLookup = {
  lookup_proposal_binding: () => null,
  lookup_experiment_binding: () => null,
} satisfies CanonicalModelImprovementPreviousBindingLookup;

export function action666acCompletedBundle(
  fixture: SourceFixture,
): CanonicalCompletedImprovementEvidenceBundle {
  const plan = fixture.post.payload.experiment_plan;
  return {
    bundle_version:
      CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
    bundle_identity: `action-666ac:completed:${fixture.name}`,
    source_namespace: "completed_canonical_improvement_evidence",
    completed_at: "2026-07-28T12:00:00.000000000Z",
    trusted_input_identity: fixture.post.trusted_input_identity,
    trusted_input_digest: fixture.post.semantic_digest,
    trust_boundary: fixture.trustBoundary,
    upstream_sources: fixture.post.payload.upstream_sources,
    producer_bindings: {
      cohort: fixture.post.payload.evidence.quality_metrics.cohort,
      period: structuredClone(
        fixture.post.payload.evidence.quality_metrics.period,
      ),
      metric_inventory_digest:
        fixture.post.payload.evidence.quality_metrics.metric_inventory
          .inventory_digest,
      baseline_versions: structuredClone(
        fixture.post.payload.evidence.shadow_evaluation.baseline_versions,
      ),
      candidate_versions: structuredClone(
        fixture.post.payload.evidence.shadow_evaluation.candidate_versions,
      ),
      row_stability_inventory_digest:
        fixture.post.payload.evidence.offline_learning.row_level_stability
          .inventory_digest,
      evidence_root_digest:
        fixture.post.payload.evidence.evidence_root_digest,
      experiment_identity_inventory: plan ? [plan.plan_identity] : [],
    },
  };
}

function clonedBundle(
  source: CanonicalCompletedImprovementEvidenceBundle,
) {
  const clone = structuredClone(source);
  clone.trust_boundary = source.trust_boundary;
  return clone;
}

export const action666acMappedBundle = action666acCompletedBundle(
  action666vStableImprovementFixture,
);
export const action666acNoChangeBundle = action666acCompletedBundle(
  action666vNoChangeFixture as SourceFixture,
);
export const action666acInsufficientDiversityBundle =
  action666acCompletedBundle(
    action666vInsufficientFixture as SourceFixture,
  );

export function action666acMissingMembershipBundle() {
  const bundle = clonedBundle(action666acMappedBundle);
  bundle.bundle_identity =
    "action-666ac:unmappable:missing-opportunity-membership";
  bundle.upstream_sources.opportunity_sets[0].candidates.pop();
  return bundle;
}

export function action666acOutcomeLineageConflictBundle() {
  const bundle = clonedBundle(action666acMappedBundle);
  bundle.bundle_identity =
    "action-666ac:conflicting:outcome-lineage";
  const candidate =
    bundle.upstream_sources.opportunity_sets[0].candidates[0];
  candidate.expected_outcome_lineage.expected_outcome_lineage_key =
    "tampered:outcome-lineage";
  return bundle;
}

export function action666acMetricInventoryDriftBundle() {
  const bundle = clonedBundle(action666acMappedBundle);
  bundle.bundle_identity =
    "action-666ac:conflicting:metric-inventory";
  bundle.producer_bindings.metric_inventory_digest = "a".repeat(64);
  return bundle;
}

export function action666acModelVersionDriftBundle() {
  const bundle = clonedBundle(action666acMappedBundle);
  bundle.bundle_identity =
    "action-666ac:conflicting:model-version";
  bundle.producer_bindings.candidate_versions.ranking =
    "caller-substituted-ranking-version";
  return bundle;
}

export function action666acPointInTimeViolationBundle() {
  const bundle = clonedBundle(action666acMappedBundle);
  bundle.bundle_identity =
    "action-666ac:conflicting:point-in-time";
  bundle.completed_at = "2026-01-01T00:00:00.000000000Z";
  return bundle;
}

export function action666acTrustRootSubstitutionBundle() {
  const bundle = clonedBundle(action666acMappedBundle);
  bundle.bundle_identity =
    "action-666ac:conflicting:trust-root-substitution";
  bundle.trust_boundary = {
    ...bundle.trust_boundary,
    registry: {
      ...bundle.trust_boundary.registry,
      root_digest: "b".repeat(64),
    },
  };
  return bundle;
}

export function action666acDuplicateExperimentIdentityBundle() {
  const bundle = clonedBundle(action666acMappedBundle);
  bundle.bundle_identity =
    "action-666ac:conflicting:duplicate-experiment-identity";
  bundle.producer_bindings.experiment_identity_inventory.push(
    bundle.producer_bindings.experiment_identity_inventory[0],
  );
  return bundle;
}

export const action666acPreviousBindingCollisionLookup = {
  lookup_proposal_binding: () => ({
    semantic_digest: "c".repeat(64),
  }),
  lookup_experiment_binding: () => ({
    semantic_digest: "d".repeat(64),
  }),
} satisfies CanonicalModelImprovementPreviousBindingLookup;

export function action666acReorderedBundle() {
  const source = action666acMappedBundle;
  const entries = Object.entries(source).reverse();
  return Object.fromEntries(entries) as
    CanonicalCompletedImprovementEvidenceBundle;
}

export function action666acTamperedDigestRequest() {
  return {
    bundle: action666acMappedBundle,
    expected_bundle_digest: canonicalModelImprovementDigest({
      tampered: true,
    }),
  };
}

export const action666acGoldenScenarios = [
  {
    name: "complete_mapped",
    bundle: action666acMappedBundle,
    previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    expected_mapping_status: "mapped",
    expected_proposal_status: "proposal_ready",
  },
  {
    name: "explicit_no_change",
    bundle: action666acNoChangeBundle,
    previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    expected_mapping_status: "mapped",
    expected_proposal_status: "no_change",
  },
  {
    name: "missing_opportunity_membership",
    bundle: action666acMissingMembershipBundle(),
    previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    expected_mapping_status: "unmappable",
    expected_proposal_status: null,
  },
  {
    name: "outcome_lineage_conflict",
    bundle: action666acOutcomeLineageConflictBundle(),
    previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    expected_mapping_status: "conflicting",
    expected_proposal_status: null,
  },
  {
    name: "metric_inventory_drift",
    bundle: action666acMetricInventoryDriftBundle(),
    previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    expected_mapping_status: "conflicting",
    expected_proposal_status: null,
  },
  {
    name: "model_version_drift",
    bundle: action666acModelVersionDriftBundle(),
    previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    expected_mapping_status: "conflicting",
    expected_proposal_status: null,
  },
  {
    name: "point_in_time_violation",
    bundle: action666acPointInTimeViolationBundle(),
    previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    expected_mapping_status: "conflicting",
    expected_proposal_status: null,
  },
  {
    name: "trust_root_substitution",
    bundle: action666acTrustRootSubstitutionBundle(),
    previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    expected_mapping_status: "conflicting",
    expected_proposal_status: null,
  },
  {
    name: "previous_binding_collision",
    bundle: action666acMappedBundle,
    previous_binding_lookup: action666acPreviousBindingCollisionLookup,
    expected_mapping_status: "conflicting",
    expected_proposal_status: null,
  },
  {
    name: "duplicate_experiment_identity",
    bundle: action666acDuplicateExperimentIdentityBundle(),
    previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    expected_mapping_status: "conflicting",
    expected_proposal_status: null,
  },
  {
    name: "insufficient_diversity",
    bundle: action666acInsufficientDiversityBundle,
    previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    expected_mapping_status: "mapped",
    expected_proposal_status: "insufficient_evidence",
  },
] as const;

export const action666acMappedBundleDigest =
  canonicalCompletedImprovementEvidenceBundleDigest(
    action666acMappedBundle,
  );
