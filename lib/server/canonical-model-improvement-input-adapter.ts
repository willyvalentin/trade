import "server-only";

import {
  canonicalModelImprovementDigest,
  createCanonicalModelImprovementEngine,
  type CanonicalModelImprovementPreviousBindingLookup,
  type CanonicalModelImprovementRegistryAuthority,
  type CanonicalModelImprovementResult,
  type CanonicalModelImprovementTrustBoundary,
  type CanonicalModelVersionTuple,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  parseCanonicalExplicitInstant,
  verifyAndProjectCanonicalModelImprovementUpstreams,
  type CanonicalModelImprovementUpstreamProjection,
  type CanonicalModelImprovementUpstreamSources,
} from "@/lib/server/canonical-model-improvement-upstream-verification";

export const CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION =
  "canonical_completed_improvement_evidence_adapter_v2" as const;
export const CANONICAL_IMPROVEMENT_PROPOSAL_REPLAY_VERSION =
  "canonical_improvement_proposal_replay_v2" as const;
export const CANONICAL_IMPROVEMENT_REPLAY_INPUT_PROJECTION_VERSION =
  "canonical_improvement_replay_input_projection_v1" as const;
export const CANONICAL_PREVIOUS_BINDING_REQUEST_IDENTITY_VERSION =
  "canonical_previous_binding_request_identity_v1" as const;
export const DEFAULT_OFF_IMPROVEMENT_REPLAY_ENABLED = false;
export const DEFAULT_OFF_IMPROVEMENT_REPLAY_KILL_SWITCH_ENGAGED = true;

export type CanonicalCompletedImprovementProducerBindings = {
  cohort: string;
  period: {
    start: string;
    end: string;
  };
  metric_inventory_digest: string;
  baseline_versions: CanonicalModelVersionTuple;
  candidate_versions: CanonicalModelVersionTuple;
  row_stability_inventory_digest: string;
  evidence_root_digest: string;
  experiment_identity_inventory: string[];
};

export type CanonicalCompletedImprovementEvidenceBundle = {
  bundle_version:
    typeof CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION;
  bundle_identity: string;
  source_namespace: "completed_canonical_improvement_evidence";
  completed_at: string;
  trusted_input_identity: string;
  trusted_input_digest: string;
  trust_boundary: CanonicalModelImprovementTrustBoundary;
  upstream_sources: CanonicalModelImprovementUpstreamSources;
  producer_bindings: CanonicalCompletedImprovementProducerBindings;
};

export type CanonicalCompletedImprovementAdapterCounters = {
  request_reads: number;
  clones: number;
  registry_lookups: number;
  previous_binding_lookups: number;
  upstream_verifications: number;
  proposal_builds: number;
  replay_attempts: number;
  input_digests: number;
};

export type CanonicalCompletedImprovementMapping = {
  adapter_version:
    typeof CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION;
  bundle_identity: string;
  bundle_digest: string;
  trusted_input_identity: string;
  trusted_input_digest: string;
  registry_authority_identity: string;
  registry_authority_manifest_digest: string;
  upstream_projection: CanonicalModelImprovementUpstreamProjection;
  proposal_result: CanonicalModelImprovementResult;
  mapping_digest_algorithm: "sha256_canonical_json_v1";
  mapping_digest: string;
};

type CanonicalImprovementOfflineSafety = {
  shadow_only: true;
  live_ranking_effect: false;
  automatic_training_allowed: false;
  automatic_parameter_change_allowed: false;
  automatic_threshold_change_allowed: false;
  automatic_model_change_allowed: false;
  automatic_promotion_allowed: false;
  causal_improvement_claimed: false;
};

export type CanonicalCompletedImprovementAdapterResult =
  | ({
      status: "mapped";
      mapping: CanonicalCompletedImprovementMapping;
      reason_codes: [];
    } & CanonicalImprovementOfflineSafety)
  | ({
      status: "conflicting" | "unmappable";
      mapping: null;
      reason_codes: string[];
    } & CanonicalImprovementOfflineSafety);

export type CanonicalCompletedImprovementAdapterDependencies = {
  previous_binding_lookup: CanonicalModelImprovementPreviousBindingLookup;
  counters?: CanonicalCompletedImprovementAdapterCounters;
};

export type CanonicalImprovementReplayRequest = {
  bundle: CanonicalCompletedImprovementEvidenceBundle;
  expected_bundle_digest: string;
};

export type CanonicalImprovementReplayResult = {
  replay_version: typeof CANONICAL_IMPROVEMENT_PROPOSAL_REPLAY_VERSION;
  adapter_version:
    typeof CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION;
  status:
    | "mapped"
    | "conflicting"
    | "unmappable"
    | "input_digest_mismatch";
  adapter_result: CanonicalCompletedImprovementAdapterResult | null;
  reason_codes: string[];
  input_projection: CanonicalImprovementReplayInputProjection;
  replay_digest_algorithm: "sha256_canonical_json_v1";
  replay_digest: string;
} & CanonicalImprovementOfflineSafety;

export type CanonicalImprovementReplayInputProjection = {
  projection_version:
    typeof CANONICAL_IMPROVEMENT_REPLAY_INPUT_PROJECTION_VERSION;
  replay_version: typeof CANONICAL_IMPROVEMENT_PROPOSAL_REPLAY_VERSION;
  adapter_version:
    typeof CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION;
  projection_kind: "verified_input_projection" | "fail_closed_failure_projection";
  bundle_identity: string | null;
  observed_bundle_digest: string;
  expected_bundle_digest: string | null;
  expected_bundle_binding_digest: string;
  registry_root_digest: string | null;
  registry_authority_manifest_digest: string | null;
  registry_authority_binding_digest: string | null;
  previous_binding_request_identity: string | null;
  mapping_status: CanonicalImprovementReplayResult["status"];
  reason_codes: string[];
  verified_mapping_digest: string | null;
  projection_digest_algorithm: "sha256_canonical_json_v1";
  projection_digest: string;
};

export type CanonicalImprovementReplayVerification = {
  valid: boolean;
  canonical_result: CanonicalImprovementReplayResult | null;
  reason_codes: string[];
};

const offlineSafety = {
  shadow_only: true,
  live_ranking_effect: false,
  automatic_training_allowed: false,
  automatic_parameter_change_allowed: false,
  automatic_threshold_change_allowed: false,
  automatic_model_change_allowed: false,
  automatic_promotion_allowed: false,
  causal_improvement_claimed: false,
} as const;

const fullShaPattern = /^[a-f0-9]{64}$/;
const forbiddenCallerAuthorityFields = [
  "approved",
  "comparable",
  "complete",
  "out_of_sample",
  "point_in_time_safe",
  "proposal_ready",
  "reproducible",
  "trusted",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
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

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort();
}

function exact(first: unknown, second: unknown) {
  return (
    canonicalModelImprovementDigest(first) ===
    canonicalModelImprovementDigest(second)
  );
}

function emptyCounters(): CanonicalCompletedImprovementAdapterCounters {
  return {
    request_reads: 0,
    clones: 0,
    registry_lookups: 0,
    previous_binding_lookups: 0,
    upstream_verifications: 0,
    proposal_builds: 0,
    replay_attempts: 0,
    input_digests: 0,
  };
}

function failure(
  status: "conflicting" | "unmappable",
  reasonCodes: string[],
): CanonicalCompletedImprovementAdapterResult {
  return deepFreeze({
    ...offlineSafety,
    status,
    mapping: null,
    reason_codes: uniqueSorted(reasonCodes),
  });
}

function structuralReasons(value: unknown) {
  if (!isRecord(value)) {
    return ["completed_improvement_bundle_missing"];
  }
  const reasons: string[] = [];
  if (
    value.bundle_version !==
    CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION
  ) {
    reasons.push("completed_improvement_bundle_version_missing");
  }
  if (
    typeof value.bundle_identity !== "string" ||
    !value.bundle_identity.trim()
  ) {
    reasons.push("completed_improvement_bundle_identity_missing");
  }
  if (
    value.source_namespace !== "completed_canonical_improvement_evidence"
  ) {
    reasons.push("completed_improvement_source_namespace_missing");
  }
  if (
    typeof value.completed_at !== "string" ||
    parseCanonicalExplicitInstant(value.completed_at) === null
  ) {
    reasons.push("completed_improvement_timestamp_missing_or_invalid");
  }
  if (
    typeof value.trusted_input_identity !== "string" ||
    !value.trusted_input_identity.trim()
  ) {
    reasons.push("trusted_input_identity_missing");
  }
  if (
    typeof value.trusted_input_digest !== "string" ||
    !fullShaPattern.test(value.trusted_input_digest)
  ) {
    reasons.push("trusted_input_digest_missing");
  }
  if (!isRecord(value.trust_boundary)) {
    reasons.push("proposal_registry_trust_boundary_missing");
  }
  if (!isRecord(value.upstream_sources)) {
    reasons.push("completed_upstream_sources_missing");
  }
  if (!isRecord(value.producer_bindings)) {
    reasons.push("completed_producer_bindings_missing");
  }
  return uniqueSorted(reasons);
}

function callerAuthorityReasons(value: Record<string, unknown>) {
  const producerBindings = isRecord(value.producer_bindings)
    ? value.producer_bindings
    : {};
  return forbiddenCallerAuthorityFields
    .flatMap((field) => [
      ...(field in value
        ? [`caller_authority_field_forbidden:${field}`]
        : []),
      ...(field in producerBindings
        ? [`caller_producer_authority_field_forbidden:${field}`]
        : []),
    ])
    .sort();
}

function incompleteJoinReasons(
  sources: CanonicalModelImprovementUpstreamSources,
) {
  const reasons: string[] = [];
  if (
    !sources.quality ||
    !sources.shadow ||
    !sources.learning ||
    !Array.isArray(sources.opportunity_sets) ||
    !Array.isArray(sources.explanations)
  ) {
    return ["completed_upstream_join_inputs_missing"];
  }
  if (sources.opportunity_sets.length === 0) {
    reasons.push("opportunity_set_inventory_missing");
  }
  for (const opportunitySet of sources.opportunity_sets) {
    if (
      !Array.isArray(opportunitySet.candidates) ||
      opportunitySet.expected_candidate_count !==
        opportunitySet.observed_candidate_count ||
      opportunitySet.observed_candidate_count !==
        opportunitySet.candidates.length
    ) {
      reasons.push("opportunity_membership_incomplete");
      continue;
    }
    if (
      opportunitySet.candidates.some(
        (candidate) =>
          candidate.outcome === null ||
          !candidate.expected_outcome_lineage ||
          !candidate.expected_outcome_lineage.expected_outcome_lineage_key,
      )
    ) {
      reasons.push("candidate_outcome_lineage_unjoinable");
    }
  }
  if (sources.explanations.length === 0) {
    reasons.push("canonical_explanation_evidence_missing");
  }
  if (
    !Array.isArray(sources.learning.request?.rows) ||
    sources.learning.request.rows.length === 0
  ) {
    reasons.push("offline_learning_row_inventory_missing");
  }
  return uniqueSorted(reasons);
}

function producerBindingReasons(input: {
  bundle: CanonicalCompletedImprovementEvidenceBundle;
  projection: CanonicalModelImprovementUpstreamProjection;
  trustedPost: CanonicalModelImprovementTrustBoundary["registry"]["posts"][number];
}) {
  const { bundle, projection, trustedPost } = input;
  const reasons: string[] = [];
  const bindings = bundle.producer_bindings;
  const payload = trustedPost.payload;
  const expectedExperimentIdentities = payload.experiment_plan
    ? [payload.experiment_plan.plan_identity]
    : [];
  if (
    new Set(bindings.experiment_identity_inventory).size !==
    bindings.experiment_identity_inventory.length
  ) {
    reasons.push("duplicate_experiment_identity");
  }
  if (
    bindings.cohort !== projection.quality.cohort ||
    !exact(bindings.period, projection.quality.period) ||
    bindings.metric_inventory_digest !==
      payload.evidence.quality_metrics.metric_inventory.inventory_digest ||
    !exact(
      bindings.baseline_versions,
      payload.evidence.shadow_evaluation.baseline_versions,
    ) ||
    !exact(
      bindings.candidate_versions,
      payload.evidence.shadow_evaluation.candidate_versions,
    ) ||
    bindings.row_stability_inventory_digest !==
      payload.evidence.offline_learning.row_level_stability.inventory_digest ||
    bindings.evidence_root_digest !== payload.evidence.evidence_root_digest ||
    !exact(
      [...bindings.experiment_identity_inventory].sort(),
      expectedExperimentIdentities,
    )
  ) {
    reasons.push("completed_producer_binding_conflicting");
  }
  const versionValues = [
    ...Object.values(bindings.baseline_versions),
    ...Object.values(bindings.candidate_versions),
  ];
  if (
    versionValues.some(
      (version) => typeof version !== "string" || !version.trim(),
    )
  ) {
    reasons.push("model_version_provenance_incomplete");
  }
  if (
    payload.evidence.quality_metrics.cohort !== projection.quality.cohort ||
    !exact(payload.evidence.quality_metrics.period, projection.quality.period) ||
    payload.evidence.offline_learning.row_level_stability.rows.length === 0 ||
    payload.evidence.offline_learning.row_level_stability.splits.length === 0
  ) {
    reasons.push("cohort_period_or_row_stability_conflicting");
  }
  return uniqueSorted(reasons);
}

function wrapPreviousBindingLookup(
  lookup: CanonicalModelImprovementPreviousBindingLookup,
  counters: CanonicalCompletedImprovementAdapterCounters,
  state: { failed: boolean },
): CanonicalModelImprovementPreviousBindingLookup {
  return {
    lookup_proposal_binding: (identity) => {
      counters.previous_binding_lookups += 1;
      try {
        return lookup.lookup_proposal_binding(identity);
      } catch {
        state.failed = true;
        return null;
      }
    },
    lookup_experiment_binding: (identity) => {
      counters.previous_binding_lookups += 1;
      try {
        return lookup.lookup_experiment_binding(identity);
      } catch {
        state.failed = true;
        return null;
      }
    },
  };
}

export function canonicalCompletedImprovementEvidenceBundleDigest(
  bundle: CanonicalCompletedImprovementEvidenceBundle,
) {
  return canonicalModelImprovementDigest(bundle);
}

function projectCanonicalCompletedImprovementEvidenceInternal(
  value: unknown,
  dependencies: CanonicalCompletedImprovementAdapterDependencies,
): CanonicalCompletedImprovementAdapterResult {
  const counters = dependencies.counters ?? emptyCounters();
  const structural = structuralReasons(value);
  if (structural.length > 0) {
    return failure("unmappable", structural);
  }
  const bundle = value as CanonicalCompletedImprovementEvidenceBundle;
  const callerAuthority = callerAuthorityReasons(
    value as Record<string, unknown>,
  );
  if (callerAuthority.length > 0) {
    return failure("conflicting", callerAuthority);
  }
  if (
    !dependencies.previous_binding_lookup ||
    typeof dependencies.previous_binding_lookup.lookup_proposal_binding !==
      "function" ||
    typeof dependencies.previous_binding_lookup.lookup_experiment_binding !==
      "function"
  ) {
    return failure("unmappable", ["previous_binding_lookup_missing"]);
  }
  const joinReasons = incompleteJoinReasons(bundle.upstream_sources);
  if (joinReasons.length > 0) {
    return failure("unmappable", joinReasons);
  }
  counters.registry_lookups += 1;
  const registry = bundle.trust_boundary.registry;
  if (!registry || !Array.isArray(registry.posts)) {
    return failure("unmappable", ["proposal_registry_posts_missing"]);
  }
  const trustedPost = registry.posts.find(
    (post) => post.trusted_input_identity === bundle.trusted_input_identity,
  );
  if (!trustedPost) {
    return failure("unmappable", ["trusted_input_registry_join_missing"]);
  }
  if (
    trustedPost.semantic_digest !== bundle.trusted_input_digest ||
    !exact(trustedPost.payload.upstream_sources, bundle.upstream_sources)
  ) {
    return failure("conflicting", [
      "completed_bundle_trusted_post_semantic_conflict",
    ]);
  }
  counters.upstream_verifications += 1;
  const upstreamVerification =
    verifyAndProjectCanonicalModelImprovementUpstreams(
      bundle.upstream_sources,
    );
  if (upstreamVerification.status === "not_point_in_time_safe") {
    return failure("conflicting", upstreamVerification.reason_codes);
  }
  if (upstreamVerification.status !== "verified") {
    return failure(
      upstreamVerification.reason_codes.includes(
        "canonical_upstream_verifier_inputs_missing",
      )
        ? "unmappable"
        : "conflicting",
      upstreamVerification.reason_codes,
    );
  }
  const opportunityProjection =
    upstreamVerification.projection.opportunity_sets;
  if (
    !opportunityProjection.complete_membership ||
    opportunityProjection.expected_candidate_count !==
      opportunityProjection.observed_candidate_count
  ) {
    return failure("unmappable", [
      "complete_opportunity_membership_not_available",
    ]);
  }
  if (
    !opportunityProjection.complete_outcome_lineage ||
    opportunityProjection.evaluated_candidate_count !==
      opportunityProjection.expected_candidate_count
  ) {
    return failure("unmappable", [
      "complete_outcome_coverage_not_available",
    ]);
  }
  const bindingReasons = producerBindingReasons({
    bundle,
    projection: upstreamVerification.projection,
    trustedPost,
  });
  if (bindingReasons.length > 0) {
    return failure("conflicting", bindingReasons);
  }
  const completedAt = parseCanonicalExplicitInstant(bundle.completed_at)!;
  const periodEnd = parseCanonicalExplicitInstant(
    upstreamVerification.projection.quality.period.end,
  );
  if (
    !periodEnd ||
    completedAt.epoch_nanoseconds < periodEnd.epoch_nanoseconds
  ) {
    return failure("conflicting", [
      "completed_evidence_precedes_canonical_period_end",
    ]);
  }
  const previousBindingState = { failed: false };
  const engine = createCanonicalModelImprovementEngine({
    enabled: true,
    kill_switch_engaged: false,
    trust_boundary: bundle.trust_boundary,
    previous_binding_lookup: wrapPreviousBindingLookup(
      dependencies.previous_binding_lookup,
      counters,
      previousBindingState,
    ),
  });
  if (!engine.build || engine.status !== "ready") {
    return failure("conflicting", [
      "external_proposal_registry_authority_conflicting",
    ]);
  }
  counters.proposal_builds += 1;
  const proposalResult = engine.build({
    evidence_class: "synthetic_fixture_only",
    trusted_input_identity: bundle.trusted_input_identity,
    trusted_input_digest: bundle.trusted_input_digest,
  });
  if (previousBindingState.failed) {
    return failure("unmappable", ["previous_binding_lookup_failed"]);
  }
  if (
    proposalResult.status === "conflicting" ||
    proposalResult.status === "non_reproducible" ||
    proposalResult.status === "not_point_in_time_safe"
  ) {
    return failure("conflicting", proposalResult.reason_codes);
  }
  const authority: CanonicalModelImprovementRegistryAuthority =
    bundle.trust_boundary.registry_authority;
  const mappingPayload = {
    adapter_version:
      CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
    bundle_identity: bundle.bundle_identity,
    bundle_digest: canonicalCompletedImprovementEvidenceBundleDigest(bundle),
    trusted_input_identity: bundle.trusted_input_identity,
    trusted_input_digest: bundle.trusted_input_digest,
    registry_authority_identity: authority.authority_identity,
    registry_authority_manifest_digest: authority.frozen_manifest_digest,
    upstream_projection: upstreamVerification.projection,
    proposal_result: proposalResult,
    mapping_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...offlineSafety,
    status: "mapped",
    mapping: {
      ...mappingPayload,
      mapping_digest: canonicalModelImprovementDigest(mappingPayload),
    },
    reason_codes: [],
  });
}

export function projectCanonicalCompletedImprovementEvidence(
  value: unknown,
  dependencies: CanonicalCompletedImprovementAdapterDependencies,
): CanonicalCompletedImprovementAdapterResult {
  try {
    return projectCanonicalCompletedImprovementEvidenceInternal(
      value,
      dependencies,
    );
  } catch {
    return failure("unmappable", [
      "completed_improvement_bundle_shape_unmappable",
    ]);
  }
}

function replayIdentityValue(value: unknown) {
  return isRecord(value) &&
    typeof value.bundle_identity === "string" &&
    value.bundle_identity.trim()
    ? value.bundle_identity
    : null;
}

function replayRegistryProvenance(value: unknown) {
  if (!isRecord(value) || !isRecord(value.trust_boundary)) {
    return {
      registry_root_digest: null,
      registry_authority_manifest_digest: null,
      registry_authority_binding_digest: null,
    };
  }
  const registry = isRecord(value.trust_boundary.registry)
    ? value.trust_boundary.registry
    : null;
  const authority = isRecord(value.trust_boundary.registry_authority)
    ? value.trust_boundary.registry_authority
    : null;
  const registryRoot =
    registry &&
    typeof registry.root_digest === "string" &&
    fullShaPattern.test(registry.root_digest)
      ? registry.root_digest
      : null;
  const authorityManifest =
    authority &&
    typeof authority.frozen_manifest_digest === "string" &&
    fullShaPattern.test(authority.frozen_manifest_digest)
      ? authority.frozen_manifest_digest
      : null;
  const authorityIdentity =
    authority &&
    typeof authority.authority_identity === "string" &&
    authority.authority_identity.trim()
      ? authority.authority_identity
      : null;
  return {
    registry_root_digest: registryRoot,
    registry_authority_manifest_digest: authorityManifest,
    registry_authority_binding_digest:
      registryRoot && authorityManifest && authorityIdentity
        ? canonicalModelImprovementDigest({
            authority_identity: authorityIdentity,
            frozen_manifest_digest: authorityManifest,
            registry_root_digest: registryRoot,
          })
        : null,
  };
}

function previousBindingRequestIdentity(value: unknown) {
  if (
    !isRecord(value) ||
    typeof value.trusted_input_identity !== "string" ||
    !isRecord(value.trust_boundary) ||
    !isRecord(value.trust_boundary.registry) ||
    !Array.isArray(value.trust_boundary.registry.posts)
  ) {
    return null;
  }
  const post = value.trust_boundary.registry.posts.find(
    (candidate) =>
      isRecord(candidate) &&
      candidate.trusted_input_identity === value.trusted_input_identity,
  );
  if (!isRecord(post) || !isRecord(post.payload)) return null;
  const proposalIdentities = Array.isArray(post.payload.proposal_candidates)
    ? post.payload.proposal_candidates
        .map((candidate) =>
          isRecord(candidate) && typeof candidate.proposal_identity === "string"
            ? candidate.proposal_identity
            : null,
        )
        .filter((identity): identity is string => identity !== null)
        .sort()
    : [];
  const experimentIdentity =
    isRecord(post.payload.experiment_plan) &&
    typeof post.payload.experiment_plan.plan_identity === "string"
      ? post.payload.experiment_plan.plan_identity
      : null;
  if (proposalIdentities.length === 0 && !experimentIdentity) return null;
  return canonicalModelImprovementDigest({
    identity_version: CANONICAL_PREVIOUS_BINDING_REQUEST_IDENTITY_VERSION,
    trusted_input_identity: value.trusted_input_identity,
    proposal_identities: proposalIdentities,
    experiment_identity: experimentIdentity,
  });
}

function expectedBundleBindingDigest(value: unknown) {
  return typeof value === "string" && fullShaPattern.test(value)
    ? value
    : canonicalModelImprovementDigest({
        invalid_expected_bundle_digest: canonicalModelImprovementDigest(value),
      });
}

function replayInputProjection(input: {
  request: CanonicalImprovementReplayRequest;
  observedBundleDigest: string;
  status: CanonicalImprovementReplayResult["status"];
  adapterResult: CanonicalCompletedImprovementAdapterResult | null;
}) {
  const registry = replayRegistryProvenance(input.request.bundle);
  const reasonCodes = uniqueSorted(
    input.adapterResult?.reason_codes ??
      (input.status === "input_digest_mismatch"
        ? ["input_digest_mismatch"]
        : []),
  );
  const payload = {
    projection_version: CANONICAL_IMPROVEMENT_REPLAY_INPUT_PROJECTION_VERSION,
    replay_version: CANONICAL_IMPROVEMENT_PROPOSAL_REPLAY_VERSION,
    adapter_version:
      CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
    projection_kind:
      input.status === "mapped"
        ? ("verified_input_projection" as const)
        : ("fail_closed_failure_projection" as const),
    bundle_identity: replayIdentityValue(input.request.bundle),
    observed_bundle_digest: input.observedBundleDigest,
    expected_bundle_digest:
      typeof input.request.expected_bundle_digest === "string" &&
      fullShaPattern.test(input.request.expected_bundle_digest)
        ? input.request.expected_bundle_digest
        : null,
    expected_bundle_binding_digest: expectedBundleBindingDigest(
      input.request.expected_bundle_digest,
    ),
    ...registry,
    previous_binding_request_identity: previousBindingRequestIdentity(
      input.request.bundle,
    ),
    mapping_status: input.status,
    reason_codes: reasonCodes,
    verified_mapping_digest:
      input.adapterResult?.mapping?.mapping_digest ?? null,
    projection_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...payload,
    projection_digest: canonicalModelImprovementDigest(payload),
  });
}

function replayResult(
  status: CanonicalImprovementReplayResult["status"],
  adapterResult: CanonicalCompletedImprovementAdapterResult | null,
  request: CanonicalImprovementReplayRequest,
  observedBundleDigest: string,
) {
  const inputProjection = replayInputProjection({
    request,
    observedBundleDigest,
    status,
    adapterResult,
  });
  const payload = {
    replay_version: CANONICAL_IMPROVEMENT_PROPOSAL_REPLAY_VERSION,
    adapter_version:
      CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
    status,
    adapter_result: adapterResult,
    reason_codes: inputProjection.reason_codes,
    input_projection: inputProjection,
    replay_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...offlineSafety,
  };
  return deepFreeze({
    ...payload,
    replay_digest: canonicalModelImprovementDigest(payload),
  });
}

export function createCanonicalImprovementProposalReplayHarness(input: {
  enabled?: boolean;
  kill_switch_engaged?: boolean;
  previous_binding_lookup?: CanonicalModelImprovementPreviousBindingLookup;
  counters?: CanonicalCompletedImprovementAdapterCounters;
} = {}) {
  const enabled =
    input.enabled ?? DEFAULT_OFF_IMPROVEMENT_REPLAY_ENABLED;
  const killSwitch =
    input.kill_switch_engaged ??
    DEFAULT_OFF_IMPROVEMENT_REPLAY_KILL_SWITCH_ENGAGED;
  const counters = input.counters ?? emptyCounters();
  if (!enabled || killSwitch) {
    return deepFreeze({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      replay: null,
      counters,
      ...offlineSafety,
    });
  }
  const previousBindingLookup = input.previous_binding_lookup;
  if (!previousBindingLookup) {
    return deepFreeze({
      enabled: true as const,
      status: "unmappable" as const,
      replay: null,
      reason_codes: ["previous_binding_lookup_missing"],
      counters,
      ...offlineSafety,
    });
  }
  const replay = (
    request: CanonicalImprovementReplayRequest,
  ): CanonicalImprovementReplayResult => {
    counters.replay_attempts += 1;
    counters.request_reads += 1;
    const observedDigest =
      canonicalCompletedImprovementEvidenceBundleDigest(request.bundle);
    counters.input_digests += 1;
    if (
      !fullShaPattern.test(request.expected_bundle_digest) ||
      observedDigest !== request.expected_bundle_digest
    ) {
      return replayResult(
        "input_digest_mismatch",
        null,
        request,
        observedDigest,
      );
    }
    counters.clones += 1;
    const clonedBundle = {
      ...structuredClone(request.bundle),
      trust_boundary: request.bundle.trust_boundary,
    };
    const adapterResult = projectCanonicalCompletedImprovementEvidence(
      clonedBundle,
      {
        previous_binding_lookup: previousBindingLookup,
        counters,
      },
    );
    return replayResult(
      adapterResult.status,
      adapterResult,
      request,
      observedDigest,
    );
  };
  return {
    enabled: true as const,
    status: "ready" as const,
    replay,
    counters,
    ...offlineSafety,
  };
}

export function verifyCanonicalImprovementReplayResult(input: {
  request: CanonicalImprovementReplayRequest;
  result: CanonicalImprovementReplayResult;
  previous_binding_lookup: CanonicalModelImprovementPreviousBindingLookup;
}): CanonicalImprovementReplayVerification {
  const harness = createCanonicalImprovementProposalReplayHarness({
    enabled: true,
    kill_switch_engaged: false,
    previous_binding_lookup: input.previous_binding_lookup,
  });
  if (!harness.replay) {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["canonical_improvement_replay_rebuild_unavailable"],
    });
  }
  const canonicalResult = harness.replay(input.request);
  const valid = exact(canonicalResult, input.result);
  return deepFreeze({
    valid,
    canonical_result: valid ? canonicalResult : null,
    reason_codes: valid
      ? []
      : ["canonical_improvement_replay_result_tampered"],
  });
}
