import "server-only";

import {
  canonicalModelImprovementDigest,
  createCanonicalModelImprovementEngine,
  type CanonicalModelImprovementPreviousBindingLookup,
  type CanonicalModelImprovementTrustBoundary,
  type CanonicalModelVersionTuple,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION,
  parseCanonicalExplicitInstant,
  verifyAndProjectCanonicalModelImprovementUpstreams,
  type CanonicalModelImprovementUpstreamProjection,
  type CanonicalModelImprovementUpstreamSources,
} from "@/lib/server/canonical-model-improvement-upstream-verification";
import {
  CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
  canonicalCompletedImprovementEvidenceBundleDigest,
  type CanonicalCompletedImprovementEvidenceBundle,
} from "@/lib/server/canonical-model-improvement-input-adapter";

export const CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_VERSION =
  "canonical_completed_improvement_evidence_capture_v2" as const;
export const CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_REQUEST_VERSION =
  "canonical_completed_improvement_evidence_capture_request_v1" as const;
export const CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_AUTHORITY_VERSION =
  "canonical_completed_improvement_evidence_capture_authority_v1" as const;
export const CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_BINDING_VERSION =
  "canonical_completed_improvement_evidence_capture_binding_v1" as const;
export const CANONICAL_COMPLETED_IMPROVEMENT_LOOKUP_OBSERVATION_VERSION =
  "canonical_completed_improvement_lookup_observation_v1" as const;
export const CANONICAL_COMPLETED_IMPROVEMENT_TERMINAL_RESULT_VERSION =
  "canonical_completed_improvement_terminal_result_v1" as const;
export const CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_STATUSES = [
  "captured",
  "conflicting",
  "incomplete",
] as const;
export const DEFAULT_OFF_COMPLETED_IMPROVEMENT_CAPTURE_ENABLED = false;
export const DEFAULT_OFF_COMPLETED_IMPROVEMENT_CAPTURE_KILL_SWITCH_ENGAGED =
  true;

type CanonicalCompletedImprovementCaptureStatus =
  (typeof CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_STATUSES)[number];

type CanonicalCompletedImprovementCaptureSafety = {
  shadow_only: true;
  live_ranking_effect: false;
  persistence_performed: false;
  automatic_training_allowed: false;
  automatic_change_allowed: false;
  automatic_promotion_allowed: false;
};

export type CanonicalCompletedImprovementLookupObservation = {
  lookup_observation_version:
    typeof CANONICAL_COMPLETED_IMPROVEMENT_LOOKUP_OBSERVATION_VERSION;
  lookup_contract_version:
    | "canonical_model_improvement_previous_binding_lookup_v1"
    | "canonical_completed_improvement_capture_binding_lookup_v1";
  lookup_namespace:
    | "previous_proposal_binding"
    | "previous_experiment_binding"
    | "capture_identity_binding";
  capture_request_identity: string;
  queried_binding_identity: string;
  observed_status:
    | "absent"
    | "matching"
    | "conflicting"
    | "lookup_failed";
  observed_binding_digest: string | null;
  expected_binding_digest: string;
  collision_identity: string | null;
  collision_digest: string | null;
  sanitized_failure_classification:
    | "none"
    | "previous_binding_lookup_failed"
    | "capture_identity_lookup_failed"
    | "semantic_collision";
  lookup_observation_digest_algorithm: "sha256_canonical_json_v1";
  lookup_observation_digest: string;
};

type CanonicalCompletedImprovementTerminalEvidence = {
  terminal_result_version:
    typeof CANONICAL_COMPLETED_IMPROVEMENT_TERMINAL_RESULT_VERSION;
  lookup_observations: CanonicalCompletedImprovementLookupObservation[];
  lookup_observation_inventory_digest: string;
  terminal_result_digest_algorithm: "sha256_canonical_json_v1";
  terminal_result_digest: string;
};

export type CanonicalCompletedImprovementCaptureSourceDigests =
  CanonicalModelImprovementUpstreamProjection["namespace_digests"];

export type CanonicalCompletedImprovementCaptureDeclaredBindings = {
  cohort: string;
  period: {
    start: string;
    end: string;
  };
  baseline_versions: CanonicalModelVersionTuple;
  candidate_versions: CanonicalModelVersionTuple;
  quality_metric_inventory_digest: string;
  protected_metric_inventory_digest: string;
  opportunity_membership_digest: string;
  outcome_evaluator_lineage_digest: string;
  provider_context_provenance_digest: string;
  point_in_time_evidence_digest: string;
};

export type CanonicalCompletedImprovementCaptureRequest = {
  request_version:
    typeof CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_REQUEST_VERSION;
  source_namespace: "completed_improvement_capture_inputs";
  producer_capture_identity: string;
  completed_at: string;
  trusted_input_identity: string;
  trusted_input_digest: string;
  expected_registry_root_digest: string;
  declared_bindings: CanonicalCompletedImprovementCaptureDeclaredBindings;
  source_artifact_digests: CanonicalCompletedImprovementCaptureSourceDigests;
  upstream_sources: CanonicalModelImprovementUpstreamSources;
};

export type CanonicalCompletedImprovementCaptureAuthority = {
  authority_version:
    typeof CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_AUTHORITY_VERSION;
  authority_identity: string;
  proposal_registry_authority_identity: string;
  proposal_registry_manifest_digest: string;
  proposal_registry_root_digest: string;
  upstream_verifier_version:
    typeof CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION;
  trust_boundary: CanonicalModelImprovementTrustBoundary;
  authority_digest_algorithm: "sha256_canonical_json_v1";
  authority_digest: string;
};

export type CanonicalCompletedImprovementCaptureBindingLookup = {
  lookup_capture_binding: (
    captureIdentity: string,
  ) => { semantic_digest: string } | null;
};

export type CanonicalCompletedImprovementCaptureCounters = {
  request_reads: number;
  clones: number;
  authority_checks: number;
  registry_lookups: number;
  upstream_verifications: number;
  previous_binding_reads: number;
  capture_binding_reads: number;
  lookup_observations_built: number;
  bundle_constructions: number;
  input_digests: number;
};

export type CanonicalCompletedImprovementCaptureEvidence = {
  capture_version: typeof CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_VERSION;
  capture_binding_version:
    typeof CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_BINDING_VERSION;
  capture_identity: string;
  producer_capture_identity: string;
  capture_input_digest: string;
  completed_at: string;
  cohort: string;
  period: {
    start: string;
    end: string;
  };
  baseline_versions: CanonicalModelVersionTuple;
  candidate_versions: CanonicalModelVersionTuple;
  source_artifact_digests: CanonicalCompletedImprovementCaptureSourceDigests;
  source_artifact_inventory_digest: string;
  upstream_projection_digest: string;
  upstream_source_digest: string;
  opportunity_membership_digest: string;
  outcome_evaluator_lineage_digest: string;
  provider_context_provenance_digest: string;
  point_in_time_evidence_digest: string;
  quality_metric_inventory_digest: string;
  protected_metric_inventory_digest: string;
  feature_context_registry_root_digest: string;
  training_input_registry_root_digest: string;
  proposal_registry_root_digest: string;
  proposal_registry_authority_digest: string;
  previous_binding_snapshot_digest: string;
  semantic_binding_digest: string;
  bundle: CanonicalCompletedImprovementEvidenceBundle;
  bundle_digest: string;
  capture_digest_algorithm: "sha256_canonical_json_v1";
  capture_digest: string;
};

export type CanonicalCompletedImprovementCaptureResult =
  | ({
      status: "captured";
      capture: CanonicalCompletedImprovementCaptureEvidence;
      capture_identity: string;
      capture_input_digest: string;
      reason_codes: [];
    } & CanonicalCompletedImprovementCaptureSafety &
      CanonicalCompletedImprovementTerminalEvidence)
  | ({
      status: "conflicting" | "incomplete";
      capture: null;
      capture_identity: string | null;
      capture_input_digest: string;
      reason_codes: string[];
    } & CanonicalCompletedImprovementCaptureSafety &
      CanonicalCompletedImprovementTerminalEvidence);

export type CanonicalCompletedImprovementCaptureVerification = {
  valid: boolean;
  canonical_result: CanonicalCompletedImprovementCaptureResult | null;
  reason_codes: string[];
};

const safety = {
  shadow_only: true,
  live_ranking_effect: false,
  persistence_performed: false,
  automatic_training_allowed: false,
  automatic_change_allowed: false,
  automatic_promotion_allowed: false,
} as const;

const shaPattern = /^[a-f0-9]{64}$/;
const recognizedAuthorities = new WeakSet<object>();
const forbiddenCallerAuthorityFields = [
  "verified",
  "complete",
  "comparable",
  "out_of_sample",
  "point_in_time_safe",
  "reproducible",
] as const;
const forbiddenCallerGeneratedEvidenceFields = [
  "lookup_observations",
  "lookup_observation_digest",
  "lookup_observation_inventory_digest",
  "terminal_result_digest",
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

function emptyCounters(): CanonicalCompletedImprovementCaptureCounters {
  return {
    request_reads: 0,
    clones: 0,
    authority_checks: 0,
    registry_lookups: 0,
    upstream_verifications: 0,
    previous_binding_reads: 0,
    capture_binding_reads: 0,
    lookup_observations_built: 0,
    bundle_constructions: 0,
    input_digests: 0,
  };
}

export function createCanonicalCompletedImprovementCaptureAuthority(
  trustBoundary: CanonicalModelImprovementTrustBoundary,
): CanonicalCompletedImprovementCaptureAuthority {
  const validationEngine = createCanonicalModelImprovementEngine({
    enabled: true,
    kill_switch_engaged: false,
    trust_boundary: trustBoundary,
    previous_binding_lookup: {
      lookup_proposal_binding: () => null,
      lookup_experiment_binding: () => null,
    },
  });
  if (validationEngine.status !== "ready" || !validationEngine.build) {
    throw new Error("completed_improvement_capture_authority_not_recognized");
  }
  const authorityPayload = {
    authority_version:
      CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_AUTHORITY_VERSION,
    authority_identity: `completed-improvement-capture-authority:${canonicalModelImprovementDigest(
      {
        proposal_registry_authority_identity:
          trustBoundary.registry_authority.authority_identity,
        proposal_registry_manifest_digest:
          trustBoundary.registry_authority.frozen_manifest_digest,
        proposal_registry_root_digest: trustBoundary.registry.root_digest,
      },
    )}`,
    proposal_registry_authority_identity:
      trustBoundary.registry_authority.authority_identity,
    proposal_registry_manifest_digest:
      trustBoundary.registry_authority.frozen_manifest_digest,
    proposal_registry_root_digest: trustBoundary.registry.root_digest,
    upstream_verifier_version:
      CANONICAL_MODEL_IMPROVEMENT_UPSTREAM_VERIFIER_VERSION,
    trust_boundary: trustBoundary,
    authority_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const authority = deepFreeze({
    ...authorityPayload,
    authority_digest: canonicalModelImprovementDigest(authorityPayload),
  });
  recognizedAuthorities.add(authority);
  return authority;
}

function captureInputDigest(value: unknown) {
  return canonicalModelImprovementDigest(value);
}

function captureIdentity(value: unknown) {
  if (
    !isRecord(value) ||
    typeof value.producer_capture_identity !== "string" ||
    !value.producer_capture_identity.trim() ||
    typeof value.trusted_input_identity !== "string" ||
    !value.trusted_input_identity.trim() ||
    !isRecord(value.declared_bindings) ||
    typeof value.declared_bindings.cohort !== "string" ||
    !value.declared_bindings.cohort.trim() ||
    !isRecord(value.declared_bindings.period)
  ) {
    return null;
  }
  return `canonical-completed-improvement-capture:${canonicalModelImprovementDigest(
    {
      capture_version: CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_VERSION,
      producer_capture_identity: value.producer_capture_identity,
      trusted_input_identity: value.trusted_input_identity,
      cohort: value.declared_bindings.cohort,
      period: value.declared_bindings.period,
    },
  )}`;
}

function buildLookupObservation(input: {
  lookup_contract_version:
    | "canonical_model_improvement_previous_binding_lookup_v1"
    | "canonical_completed_improvement_capture_binding_lookup_v1";
  lookup_namespace:
    | "previous_proposal_binding"
    | "previous_experiment_binding"
    | "capture_identity_binding";
  capture_request_identity: string;
  queried_binding_identity: string;
  observed_status:
    | "absent"
    | "matching"
    | "conflicting"
    | "lookup_failed";
  observed_binding_digest: string | null;
  expected_binding_digest: string;
}, counters: CanonicalCompletedImprovementCaptureCounters): CanonicalCompletedImprovementLookupObservation {
  counters.lookup_observations_built += 1;
  const collisionPayload =
    input.observed_status === "conflicting"
      ? {
          collision_version:
            "canonical_completed_improvement_lookup_collision_v1",
          lookup_namespace: input.lookup_namespace,
          capture_request_identity: input.capture_request_identity,
          queried_binding_identity: input.queried_binding_identity,
          expected_binding_digest: input.expected_binding_digest,
          observed_binding_digest: input.observed_binding_digest,
        }
      : null;
  const collisionDigest = collisionPayload
    ? canonicalModelImprovementDigest(collisionPayload)
    : null;
  const payload = {
    lookup_observation_version:
      CANONICAL_COMPLETED_IMPROVEMENT_LOOKUP_OBSERVATION_VERSION,
    lookup_contract_version: input.lookup_contract_version,
    lookup_namespace: input.lookup_namespace,
    capture_request_identity: input.capture_request_identity,
    queried_binding_identity: input.queried_binding_identity,
    observed_status: input.observed_status,
    observed_binding_digest: input.observed_binding_digest,
    expected_binding_digest: input.expected_binding_digest,
    collision_identity: collisionDigest
      ? `canonical-completed-improvement-lookup-collision:${collisionDigest}`
      : null,
    collision_digest: collisionDigest,
    sanitized_failure_classification:
      input.observed_status === "lookup_failed"
        ? input.lookup_namespace === "capture_identity_binding"
          ? ("capture_identity_lookup_failed" as const)
          : ("previous_binding_lookup_failed" as const)
        : input.observed_status === "conflicting"
          ? ("semantic_collision" as const)
          : ("none" as const),
    lookup_observation_digest_algorithm:
      "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...payload,
    lookup_observation_digest: canonicalModelImprovementDigest(payload),
  });
}

function canonicalLookupObservationOrder(
  observations: CanonicalCompletedImprovementLookupObservation[],
) {
  return observations
    .map((observation) => structuredClone(observation))
    .sort((first, second) =>
      [
        first.lookup_namespace,
        first.queried_binding_identity,
        first.lookup_observation_digest,
      ]
        .join(":")
        .localeCompare(
          [
            second.lookup_namespace,
            second.queried_binding_identity,
            second.lookup_observation_digest,
          ].join(":"),
        ),
    );
}

function terminalResult<T extends Record<string, unknown>>(
  payload: T,
  observations: CanonicalCompletedImprovementLookupObservation[],
) {
  const orderedObservations = canonicalLookupObservationOrder(observations);
  const observationIdentities = orderedObservations.map(
    (observation) =>
      `${observation.lookup_namespace}:${observation.queried_binding_identity}`,
  );
  if (new Set(observationIdentities).size !== observationIdentities.length) {
    throw new Error("duplicate_capture_lookup_observation");
  }
  const lookupObservationInventoryDigest = canonicalModelImprovementDigest({
    lookup_observation_version:
      CANONICAL_COMPLETED_IMPROVEMENT_LOOKUP_OBSERVATION_VERSION,
    observations: orderedObservations,
  });
  const terminalPayload = {
    ...payload,
    terminal_result_version:
      CANONICAL_COMPLETED_IMPROVEMENT_TERMINAL_RESULT_VERSION,
    lookup_observations: orderedObservations,
    lookup_observation_inventory_digest: lookupObservationInventoryDigest,
    terminal_result_digest_algorithm:
      "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...terminalPayload,
    terminal_result_digest:
      canonicalModelImprovementDigest(terminalPayload),
  });
}

function failure(
  status: Exclude<CanonicalCompletedImprovementCaptureStatus, "captured">,
  value: unknown,
  reasonCodes: string[],
  observations: CanonicalCompletedImprovementLookupObservation[] = [],
): CanonicalCompletedImprovementCaptureResult {
  return terminalResult(
    {
      ...safety,
      status,
      capture: null,
      capture_identity: captureIdentity(value),
      capture_input_digest: captureInputDigest(value),
      reason_codes: uniqueSorted(reasonCodes),
    },
    observations,
  ) as CanonicalCompletedImprovementCaptureResult;
}

function structuralReasons(value: unknown) {
  if (!isRecord(value)) return ["capture_request_missing"];
  const reasons: string[] = [];
  if (
    value.request_version !==
    CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_REQUEST_VERSION
  ) {
    reasons.push("capture_request_version_missing");
  }
  if (value.source_namespace !== "completed_improvement_capture_inputs") {
    reasons.push("capture_source_namespace_missing");
  }
  if (
    typeof value.producer_capture_identity !== "string" ||
    !value.producer_capture_identity.trim()
  ) {
    reasons.push("producer_capture_identity_missing");
  }
  if (
    typeof value.completed_at !== "string" ||
    parseCanonicalExplicitInstant(value.completed_at) === null
  ) {
    reasons.push("capture_completion_timestamp_missing_or_invalid");
  }
  if (
    typeof value.trusted_input_identity !== "string" ||
    !value.trusted_input_identity.trim()
  ) {
    reasons.push("trusted_input_identity_missing");
  }
  if (
    typeof value.trusted_input_digest !== "string" ||
    !shaPattern.test(value.trusted_input_digest)
  ) {
    reasons.push("trusted_input_digest_missing");
  }
  if (
    typeof value.expected_registry_root_digest !== "string" ||
    !shaPattern.test(value.expected_registry_root_digest)
  ) {
    reasons.push("expected_registry_root_digest_missing");
  }
  if (!isRecord(value.declared_bindings)) {
    reasons.push("capture_declared_bindings_missing");
  }
  if (!isRecord(value.source_artifact_digests)) {
    reasons.push("capture_source_artifact_digests_missing");
  }
  if (!isRecord(value.upstream_sources)) {
    reasons.push("capture_upstream_outputs_missing");
  }
  return uniqueSorted(reasons);
}

function callerAuthorityReasons(value: Record<string, unknown>) {
  return [
    ...forbiddenCallerAuthorityFields
      .filter((field) => field in value)
      .map((field) => `capture_caller_authority_field_forbidden:${field}`),
    ...forbiddenCallerGeneratedEvidenceFields
      .filter((field) => field in value)
      .map(
        (field) =>
          `capture_caller_generated_evidence_forbidden:${field}`,
      ),
  ].sort();
}

function producerCompletenessReasons(
  sources: CanonicalModelImprovementUpstreamSources,
) {
  if (
    !sources.quality ||
    !sources.shadow ||
    !sources.learning ||
    !Array.isArray(sources.opportunity_sets) ||
    !Array.isArray(sources.explanations)
  ) {
    return ["capture_required_producer_output_missing"];
  }
  const reasons: string[] = [];
  if (sources.opportunity_sets.length === 0) {
    reasons.push("capture_opportunity_set_inventory_missing");
  }
  for (const set of sources.opportunity_sets) {
    if (
      !Array.isArray(set.candidates) ||
      set.expected_candidate_count !== set.observed_candidate_count ||
      set.observed_candidate_count !== set.candidates.length
    ) {
      reasons.push("capture_complete_opportunity_membership_missing");
      continue;
    }
    if (
      set.candidates.some(
        (candidate) =>
          candidate.outcome === null ||
          !candidate.expected_outcome_lineage ||
          !candidate.expected_outcome_lineage.expected_outcome_lineage_key,
      )
    ) {
      reasons.push("capture_complete_outcome_lineage_missing");
    }
  }
  if (
    !Array.isArray(sources.learning.request?.rows) ||
    sources.learning.request.rows.length === 0
  ) {
    reasons.push("capture_offline_learning_rows_missing");
  }
  if (sources.explanations.length === 0) {
    reasons.push("capture_explanation_cohort_missing");
  }
  return uniqueSorted(reasons);
}

function protectedMetricInventoryDigest(
  projectionPost: CanonicalModelImprovementTrustBoundary["registry"]["posts"][number],
) {
  const inventory =
    projectionPost.payload.evidence.quality_metrics.metric_inventory;
  return canonicalModelImprovementDigest({
    protected_metric_identities: [...inventory.protected_metrics].sort(),
    protected_metrics: inventory.metrics
      .filter((metric) => metric.roles.includes("protected"))
      .sort((first, second) =>
        first.metric_identity.localeCompare(second.metric_identity),
      ),
  });
}

function outcomeEvaluatorLineageDigest(
  sources: CanonicalModelImprovementUpstreamSources,
) {
  return canonicalModelImprovementDigest({
    opportunity_sets: sources.opportunity_sets
      .map((set) => ({
        opportunity_set_identity: set.opportunity_set_identity,
        semantic_digest: set.semantic_digest,
        candidates: set.candidates
          .map((candidate) => ({
            candidate_identity: candidate.candidate_identity,
            expected_outcome_lineage: candidate.expected_outcome_lineage,
            outcome: candidate.outcome,
          }))
          .sort((first, second) =>
            first.candidate_identity.localeCompare(second.candidate_identity),
          ),
      }))
      .sort((first, second) =>
        first.opportunity_set_identity.localeCompare(
          second.opportunity_set_identity,
        ),
      ),
    shadow_evaluation_digest:
      sources.shadow.evaluation_result.evaluation?.evaluation_digest ?? null,
    learning_result_digest: sources.learning.result.result_digest,
    explanation_result_digests: sources.explanations
      .map(
        (source) =>
          source.result.explanation?.canonical_explanation_digest ?? null,
      )
      .sort(),
  });
}

function providerContextProvenanceDigest(
  sources: CanonicalModelImprovementUpstreamSources,
) {
  return canonicalModelImprovementDigest({
    opportunity_sets: sources.opportunity_sets
      .map((set) => ({
        opportunity_set_identity: set.opportunity_set_identity,
        point_in_time_cutoff: set.point_in_time_cutoff,
        provider_context: set.provider_context,
        candidates: set.candidates
          .map((candidate) => ({
            candidate_identity: candidate.candidate_identity,
            provider_source_timestamp: candidate.provider_source_timestamp,
          }))
          .sort((first, second) =>
            first.candidate_identity.localeCompare(second.candidate_identity),
          ),
      }))
      .sort((first, second) =>
        first.opportunity_set_identity.localeCompare(
          second.opportunity_set_identity,
        ),
      ),
    learning_overlap_evidence: sources.learning.request.rows
      .map((row) => ({
        canonical_decision_identity: row.canonical_decision_identity,
        overlap_evidence: row.overlap_evidence,
      }))
      .sort((first, second) =>
        first.canonical_decision_identity.localeCompare(
          second.canonical_decision_identity,
        ),
      ),
    explanation_context: sources.explanations
      .map((source) => source.result.explanation?.context_evidence ?? null)
      .sort((first, second) =>
        canonicalModelImprovementDigest(first).localeCompare(
          canonicalModelImprovementDigest(second),
        ),
      ),
  });
}

function latestCompletionTimestamp(
  sources: CanonicalModelImprovementUpstreamSources,
  periodEnd: string,
) {
  const timestamps = [
    periodEnd,
    ...sources.opportunity_sets.flatMap((set) =>
      set.candidates.flatMap((candidate) =>
        candidate.outcome ? [candidate.outcome.evaluated_at] : [],
      ),
    ),
    ...sources.learning.request.rows.map(
      (row) => row.overlap_evidence.outcome_completed_at,
    ),
    ...sources.explanations.flatMap((source) => {
      const evidence = source.result.explanation?.outcome_evidence;
      return evidence
        ? [
            evidence.canonical_completion_timestamp,
            evidence.outcome_evaluated_at,
          ]
        : [];
    }),
  ];
  const parsed = timestamps
    .map((timestamp) => parseCanonicalExplicitInstant(timestamp))
    .filter((instant): instant is NonNullable<typeof instant> => instant !== null)
    .sort((first, second) =>
      first.epoch_nanoseconds < second.epoch_nanoseconds
        ? -1
        : first.epoch_nanoseconds > second.epoch_nanoseconds
          ? 1
          : 0,
    );
  return parsed.at(-1) ?? null;
}

function previousBindingSnapshot(input: {
  post: CanonicalModelImprovementTrustBoundary["registry"]["posts"][number];
  lookup: CanonicalModelImprovementPreviousBindingLookup;
  captureRequestIdentity: string;
  counters: CanonicalCompletedImprovementCaptureCounters;
}) {
  const entries = [
    ...input.post.payload.proposal_candidates.map((proposal) => ({
      binding_type: "proposal" as const,
      binding_identity: proposal.proposal_identity,
      expected_semantic_digest: proposal.semantic_digest,
    })),
    ...(input.post.payload.experiment_plan
      ? [
          {
            binding_type: "experiment" as const,
            binding_identity:
              input.post.payload.experiment_plan.plan_identity,
            expected_semantic_digest:
              input.post.payload.experiment_plan.semantic_digest,
          },
        ]
      : []),
  ].sort((first, second) =>
    `${first.binding_type}:${first.binding_identity}`.localeCompare(
      `${second.binding_type}:${second.binding_identity}`,
    ),
  );
  const reasons: string[] = [];
  const observations: CanonicalCompletedImprovementLookupObservation[] = [];
  for (const entry of entries) {
    try {
      input.counters.previous_binding_reads += 1;
      const previousValue: unknown =
        entry.binding_type === "proposal"
          ? input.lookup.lookup_proposal_binding(entry.binding_identity)
          : input.lookup.lookup_experiment_binding(entry.binding_identity);
      if (
        previousValue !== null &&
        (!isRecord(previousValue) ||
          typeof previousValue.semantic_digest !== "string" ||
          !shaPattern.test(previousValue.semantic_digest))
      ) {
        observations.push(
          buildLookupObservation({
            lookup_contract_version:
              "canonical_model_improvement_previous_binding_lookup_v1",
            lookup_namespace:
              entry.binding_type === "proposal"
                ? "previous_proposal_binding"
                : "previous_experiment_binding",
            capture_request_identity: input.captureRequestIdentity,
            queried_binding_identity: entry.binding_identity,
            observed_status: "lookup_failed",
            observed_binding_digest: null,
            expected_binding_digest: entry.expected_semantic_digest,
          }, input.counters),
        );
        continue;
      }
      const previous = previousValue as { semantic_digest: string } | null;
      const observedStatus = previous === null
        ? ("absent" as const)
        : previous.semantic_digest === entry.expected_semantic_digest
          ? ("matching" as const)
          : ("conflicting" as const);
      observations.push(
        buildLookupObservation({
          lookup_contract_version:
            "canonical_model_improvement_previous_binding_lookup_v1",
          lookup_namespace:
            entry.binding_type === "proposal"
              ? "previous_proposal_binding"
              : "previous_experiment_binding",
          capture_request_identity: input.captureRequestIdentity,
          queried_binding_identity: entry.binding_identity,
          observed_status: observedStatus,
          observed_binding_digest: previous?.semantic_digest ?? null,
          expected_binding_digest: entry.expected_semantic_digest,
        }, input.counters),
      );
      if (observedStatus === "conflicting") {
        reasons.push("previous_binding_semantic_collision");
      }
    } catch {
      observations.push(
        buildLookupObservation({
          lookup_contract_version:
            "canonical_model_improvement_previous_binding_lookup_v1",
          lookup_namespace:
            entry.binding_type === "proposal"
              ? "previous_proposal_binding"
              : "previous_experiment_binding",
          capture_request_identity: input.captureRequestIdentity,
          queried_binding_identity: entry.binding_identity,
          observed_status: "lookup_failed",
          observed_binding_digest: null,
          expected_binding_digest: entry.expected_semantic_digest,
        }, input.counters),
      );
    }
  }
  const orderedObservations = canonicalLookupObservationOrder(observations);
  return {
    lookup_failed: orderedObservations.some(
      (observation) => observation.observed_status === "lookup_failed",
    ),
    reason_codes: uniqueSorted(reasons),
    snapshot_digest: canonicalModelImprovementDigest({
      snapshot_version: "canonical_previous_binding_snapshot_v1",
      observations: orderedObservations,
    }),
    observations: orderedObservations,
  };
}

function sourceBindingReasons(input: {
  request: CanonicalCompletedImprovementCaptureRequest;
  projection: CanonicalModelImprovementUpstreamProjection;
  post: CanonicalModelImprovementTrustBoundary["registry"]["posts"][number];
}) {
  const { request, projection, post } = input;
  const declared = request.declared_bindings;
  const evidence = post.payload.evidence;
  const reasons: string[] = [];
  if (!exact(request.source_artifact_digests, projection.namespace_digests)) {
    reasons.push("capture_source_artifact_digest_conflicting");
  }
  if (
    declared.cohort !== projection.quality.cohort ||
    !exact(declared.period, projection.quality.period)
  ) {
    reasons.push("capture_period_or_cohort_conflicting");
  }
  if (
    !exact(declared.baseline_versions, evidence.shadow_evaluation.baseline_versions) ||
    !exact(
      declared.candidate_versions,
      evidence.shadow_evaluation.candidate_versions,
    )
  ) {
    reasons.push("capture_model_version_tuple_conflicting");
  }
  if (
    declared.quality_metric_inventory_digest !==
      evidence.quality_metrics.metric_inventory.inventory_digest ||
    declared.protected_metric_inventory_digest !==
      protectedMetricInventoryDigest(post)
  ) {
    reasons.push("capture_metric_inventory_conflicting");
  }
  if (
    declared.opportunity_membership_digest !==
      projection.namespace_digests.opportunity_sets
  ) {
    reasons.push("capture_opportunity_membership_digest_conflicting");
  }
  if (
    declared.outcome_evaluator_lineage_digest !==
      outcomeEvaluatorLineageDigest(request.upstream_sources)
  ) {
    reasons.push("capture_outcome_evaluator_lineage_conflicting");
  }
  if (
    declared.provider_context_provenance_digest !==
      providerContextProvenanceDigest(request.upstream_sources)
  ) {
    reasons.push("capture_provider_context_provenance_conflicting");
  }
  if (
    declared.point_in_time_evidence_digest !==
      projection.temporal_evidence_digest
  ) {
    reasons.push("capture_point_in_time_evidence_conflicting");
  }
  return uniqueSorted(reasons);
}

function capturedResult(input: {
  request: CanonicalCompletedImprovementCaptureRequest;
  authority: CanonicalCompletedImprovementCaptureAuthority;
  previousBindingLookup: CanonicalModelImprovementPreviousBindingLookup;
  captureBindingLookup: CanonicalCompletedImprovementCaptureBindingLookup;
  counters: CanonicalCompletedImprovementCaptureCounters;
}): CanonicalCompletedImprovementCaptureResult {
  const structural = structuralReasons(input.request);
  if (structural.length > 0) {
    return failure("incomplete", input.request, structural);
  }
  const callerAuthority = callerAuthorityReasons(
    input.request as unknown as Record<string, unknown>,
  );
  if (callerAuthority.length > 0) {
    return failure("conflicting", input.request, callerAuthority);
  }
  const producerCompleteness = producerCompletenessReasons(
    input.request.upstream_sources,
  );
  if (producerCompleteness.length > 0) {
    return failure("incomplete", input.request, producerCompleteness);
  }
  input.counters.clones += 1;
  const request = structuredClone(input.request);
  const captureId = captureIdentity(request)!;
  input.counters.upstream_verifications += 1;
  const upstreamVerification =
    verifyAndProjectCanonicalModelImprovementUpstreams(
      request.upstream_sources,
    );
  if (upstreamVerification.status !== "verified") {
    return failure(
      upstreamVerification.reason_codes.includes(
        "canonical_upstream_verifier_inputs_missing",
      )
        ? "incomplete"
        : "conflicting",
      request,
      upstreamVerification.reason_codes,
    );
  }
  const projection = upstreamVerification.projection;
  if (
    !projection.opportunity_sets.complete_membership ||
    projection.opportunity_sets.expected_candidate_count !==
      projection.opportunity_sets.observed_candidate_count
  ) {
    return failure("incomplete", request, [
      "capture_complete_opportunity_membership_missing",
    ]);
  }
  if (
    !projection.opportunity_sets.complete_outcome_lineage ||
    projection.opportunity_sets.evaluated_candidate_count !==
      projection.opportunity_sets.expected_candidate_count
  ) {
    return failure("incomplete", request, [
      "capture_complete_outcome_lineage_missing",
    ]);
  }
  if (
    !projection.shadow.reproducible ||
    !projection.shadow.out_of_sample ||
    !projection.learning.reproducible ||
    !projection.learning.frozen_result ||
    projection.learning.in_sample_only ||
    projection.explanations.conflicting_count > 0 ||
    !projection.explanations.point_in_time_safe
  ) {
    return failure("conflicting", request, [
      "capture_verified_upstream_eligibility_conflicting",
    ]);
  }
  input.counters.registry_lookups += 1;
  const boundary = input.authority.trust_boundary;
  const post = boundary.registry.posts.find(
    (candidate) =>
      candidate.trusted_input_identity === request.trusted_input_identity,
  );
  if (!post) {
    return failure("incomplete", request, [
      "capture_trusted_producer_output_not_joinable",
    ]);
  }
  if (
    request.expected_registry_root_digest !==
      input.authority.proposal_registry_root_digest ||
    request.expected_registry_root_digest !== boundary.registry.root_digest
  ) {
    return failure("conflicting", request, [
      "capture_registry_root_substitution",
    ]);
  }
  if (
    post.semantic_digest !== request.trusted_input_digest ||
    !exact(post.payload.upstream_sources, request.upstream_sources)
  ) {
    return failure("conflicting", request, [
      "capture_trusted_upstream_semantic_conflict",
    ]);
  }
  if (
    projection.learning.feature_context_registry_root_digest !==
      boundary.registry_authority
        .expected_feature_context_registry_root_digest ||
    projection.learning.training_input_registry_root_digest !==
      boundary.registry_authority
        .expected_training_input_registry_root_digest
  ) {
    return failure("conflicting", request, [
      "capture_external_context_or_training_root_conflicting",
    ]);
  }
  const bindingReasons = sourceBindingReasons({
    request,
    projection,
    post,
  });
  if (bindingReasons.length > 0) {
    return failure("conflicting", request, bindingReasons);
  }
  const completedAt = parseCanonicalExplicitInstant(request.completed_at)!;
  const latestCompletion = latestCompletionTimestamp(
    request.upstream_sources,
    projection.quality.period.end,
  );
  if (
    !latestCompletion ||
    completedAt.epoch_nanoseconds < latestCompletion.epoch_nanoseconds
  ) {
    return failure("conflicting", request, [
      "capture_precedes_completed_upstream_evidence",
    ]);
  }
  const previousSnapshot = previousBindingSnapshot({
    post,
    lookup: input.previousBindingLookup,
    captureRequestIdentity: captureId,
    counters: input.counters,
  });
  if (previousSnapshot.lookup_failed) {
    return failure("incomplete", request, [
      "capture_previous_binding_lookup_failed",
    ], previousSnapshot.observations);
  }
  if (previousSnapshot.reason_codes.length > 0) {
    return failure(
      "conflicting",
      request,
      previousSnapshot.reason_codes,
      previousSnapshot.observations,
    );
  }
  const evidence = post.payload.evidence;
  const experimentIdentityInventory = post.payload.experiment_plan
    ? [post.payload.experiment_plan.plan_identity]
    : [];
  const sourceArtifactInventoryDigest = canonicalModelImprovementDigest(
    request.source_artifact_digests,
  );
  const upstreamProjectionDigest =
    canonicalModelImprovementDigest(projection);
  const upstreamSourceDigest = canonicalModelImprovementDigest(
    request.upstream_sources,
  );
  const semanticBindingPayload = {
    capture_binding_version:
      CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_BINDING_VERSION,
    capture_identity: captureId,
    producer_capture_identity: request.producer_capture_identity,
    completed_at: request.completed_at,
    cohort: projection.quality.cohort,
    period: projection.quality.period,
    baseline_versions: evidence.shadow_evaluation.baseline_versions,
    candidate_versions: evidence.shadow_evaluation.candidate_versions,
    source_artifact_inventory_digest: sourceArtifactInventoryDigest,
    upstream_projection_digest: upstreamProjectionDigest,
    upstream_source_digest: upstreamSourceDigest,
    opportunity_membership_digest:
      projection.namespace_digests.opportunity_sets,
    outcome_evaluator_lineage_digest:
      request.declared_bindings.outcome_evaluator_lineage_digest,
    provider_context_provenance_digest:
      request.declared_bindings.provider_context_provenance_digest,
    point_in_time_evidence_digest: projection.temporal_evidence_digest,
    quality_metric_inventory_digest:
      evidence.quality_metrics.metric_inventory.inventory_digest,
    protected_metric_inventory_digest:
      request.declared_bindings.protected_metric_inventory_digest,
    feature_context_registry_root_digest:
      projection.learning.feature_context_registry_root_digest,
    training_input_registry_root_digest:
      projection.learning.training_input_registry_root_digest,
    proposal_registry_root_digest:
      input.authority.proposal_registry_root_digest,
    proposal_registry_authority_digest: input.authority.authority_digest,
    previous_binding_snapshot_digest: previousSnapshot.snapshot_digest,
  };
  const semanticBindingDigest = canonicalModelImprovementDigest(
    semanticBindingPayload,
  );
  let priorCapture: { semantic_digest: string } | null;
  let captureLookupObservation: CanonicalCompletedImprovementLookupObservation;
  try {
    input.counters.capture_binding_reads += 1;
    const priorCaptureValue: unknown =
      input.captureBindingLookup.lookup_capture_binding(captureId);
    if (
      priorCaptureValue !== null &&
      (!isRecord(priorCaptureValue) ||
        typeof priorCaptureValue.semantic_digest !== "string" ||
        !shaPattern.test(priorCaptureValue.semantic_digest))
    ) {
      throw new Error("capture_identity_lookup_result_invalid");
    }
    priorCapture = priorCaptureValue as { semantic_digest: string } | null;
    captureLookupObservation = buildLookupObservation({
      lookup_contract_version:
        "canonical_completed_improvement_capture_binding_lookup_v1",
      lookup_namespace: "capture_identity_binding",
      capture_request_identity: captureId,
      queried_binding_identity: captureId,
      observed_status: !priorCapture
        ? "absent"
        : priorCapture.semantic_digest === semanticBindingDigest
          ? "matching"
          : "conflicting",
      observed_binding_digest: priorCapture?.semantic_digest ?? null,
      expected_binding_digest: semanticBindingDigest,
    }, input.counters);
  } catch {
    captureLookupObservation = buildLookupObservation({
      lookup_contract_version:
        "canonical_completed_improvement_capture_binding_lookup_v1",
      lookup_namespace: "capture_identity_binding",
      capture_request_identity: captureId,
      queried_binding_identity: captureId,
      observed_status: "lookup_failed",
      observed_binding_digest: null,
      expected_binding_digest: semanticBindingDigest,
    }, input.counters);
    return failure("incomplete", request, [
      "capture_identity_lookup_failed",
    ], [...previousSnapshot.observations, captureLookupObservation]);
  }
  if (
    priorCapture &&
    priorCapture.semantic_digest !== semanticBindingDigest
  ) {
    return failure("conflicting", request, [
      "capture_identity_semantic_collision",
    ], [...previousSnapshot.observations, captureLookupObservation]);
  }
  const lookupObservations = [
    ...previousSnapshot.observations,
    captureLookupObservation,
  ];
  const bundle: CanonicalCompletedImprovementEvidenceBundle = {
    bundle_version:
      CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
    bundle_identity: `completed-improvement-bundle:${captureId}`,
    source_namespace: "completed_canonical_improvement_evidence",
    completed_at: request.completed_at,
    trusted_input_identity: post.trusted_input_identity,
    trusted_input_digest: post.semantic_digest,
    trust_boundary: boundary,
    upstream_sources: request.upstream_sources,
    producer_bindings: {
      cohort: projection.quality.cohort,
      period: structuredClone(projection.quality.period),
      metric_inventory_digest:
        evidence.quality_metrics.metric_inventory.inventory_digest,
      baseline_versions: structuredClone(
        evidence.shadow_evaluation.baseline_versions,
      ),
      candidate_versions: structuredClone(
        evidence.shadow_evaluation.candidate_versions,
      ),
      row_stability_inventory_digest:
        evidence.offline_learning.row_level_stability.inventory_digest,
      evidence_root_digest: evidence.evidence_root_digest,
      experiment_identity_inventory: experimentIdentityInventory,
    },
  };
  input.counters.bundle_constructions += 1;
  const bundleDigest =
    canonicalCompletedImprovementEvidenceBundleDigest(bundle);
  const capturePayload = {
    capture_version: CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_VERSION,
    capture_binding_version:
      CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_BINDING_VERSION,
    capture_identity: captureId,
    producer_capture_identity: request.producer_capture_identity,
    capture_input_digest: captureInputDigest(request),
    completed_at: request.completed_at,
    cohort: projection.quality.cohort,
    period: structuredClone(projection.quality.period),
    baseline_versions: structuredClone(
      evidence.shadow_evaluation.baseline_versions,
    ),
    candidate_versions: structuredClone(
      evidence.shadow_evaluation.candidate_versions,
    ),
    source_artifact_digests: structuredClone(
      request.source_artifact_digests,
    ),
    source_artifact_inventory_digest: sourceArtifactInventoryDigest,
    upstream_projection_digest: upstreamProjectionDigest,
    upstream_source_digest: upstreamSourceDigest,
    opportunity_membership_digest:
      projection.namespace_digests.opportunity_sets,
    outcome_evaluator_lineage_digest:
      request.declared_bindings.outcome_evaluator_lineage_digest,
    provider_context_provenance_digest:
      request.declared_bindings.provider_context_provenance_digest,
    point_in_time_evidence_digest: projection.temporal_evidence_digest,
    quality_metric_inventory_digest:
      evidence.quality_metrics.metric_inventory.inventory_digest,
    protected_metric_inventory_digest:
      request.declared_bindings.protected_metric_inventory_digest,
    feature_context_registry_root_digest:
      projection.learning.feature_context_registry_root_digest!,
    training_input_registry_root_digest:
      projection.learning.training_input_registry_root_digest!,
    proposal_registry_root_digest:
      input.authority.proposal_registry_root_digest,
    proposal_registry_authority_digest: input.authority.authority_digest,
    previous_binding_snapshot_digest: previousSnapshot.snapshot_digest,
    semantic_binding_digest: semanticBindingDigest,
    bundle,
    bundle_digest: bundleDigest,
    capture_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  const capture = deepFreeze({
    ...capturePayload,
    capture_digest: canonicalModelImprovementDigest(capturePayload),
  });
  return terminalResult(
    {
      ...safety,
      status: "captured",
      capture,
      capture_identity: capture.capture_identity,
      capture_input_digest: capture.capture_input_digest,
      reason_codes: [],
    },
    lookupObservations,
  ) as CanonicalCompletedImprovementCaptureResult;
}

export function createCanonicalCompletedImprovementCaptureHarness(input: {
  enabled?: boolean;
  kill_switch_engaged?: boolean;
  authority?: CanonicalCompletedImprovementCaptureAuthority;
  previous_binding_lookup?: CanonicalModelImprovementPreviousBindingLookup;
  capture_binding_lookup?: CanonicalCompletedImprovementCaptureBindingLookup;
  counters?: CanonicalCompletedImprovementCaptureCounters;
} = {}) {
  const enabled =
    input.enabled ?? DEFAULT_OFF_COMPLETED_IMPROVEMENT_CAPTURE_ENABLED;
  const killSwitch =
    input.kill_switch_engaged ??
    DEFAULT_OFF_COMPLETED_IMPROVEMENT_CAPTURE_KILL_SWITCH_ENGAGED;
  const counters = input.counters ?? emptyCounters();
  if (!enabled || killSwitch) {
    return deepFreeze({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      capture: null,
      counters,
      ...safety,
    });
  }
  counters.authority_checks += 1;
  if (
    !input.authority ||
    !recognizedAuthorities.has(input.authority) ||
    !input.previous_binding_lookup ||
    !input.capture_binding_lookup
  ) {
    return deepFreeze({
      enabled: true as const,
      status: "unavailable" as const,
      capture: null,
      reason_codes: [
        !input.authority || !recognizedAuthorities.has(input.authority)
          ? "capture_external_authority_missing_or_unrecognized"
          : !input.previous_binding_lookup
            ? "capture_previous_binding_lookup_missing"
            : "capture_identity_lookup_missing",
      ],
      counters,
      ...safety,
    });
  }
  const authority = input.authority;
  const previousBindingLookup = input.previous_binding_lookup;
  const captureBindingLookup = input.capture_binding_lookup;
  const capture = (
    request: CanonicalCompletedImprovementCaptureRequest,
  ): CanonicalCompletedImprovementCaptureResult => {
    counters.request_reads += 1;
    counters.input_digests += 1;
    try {
      return capturedResult({
        request,
        authority,
        previousBindingLookup,
        captureBindingLookup,
        counters,
      });
    } catch {
      return failure("incomplete", request, [
        "capture_input_shape_unmappable",
      ]);
    }
  };
  return {
    enabled: true as const,
    status: "ready" as const,
    capture,
    counters,
    ...safety,
  };
}

export function verifyCanonicalCompletedImprovementCaptureResult(input: {
  request: CanonicalCompletedImprovementCaptureRequest;
  result: CanonicalCompletedImprovementCaptureResult;
  authority: CanonicalCompletedImprovementCaptureAuthority;
  previous_binding_lookup: CanonicalModelImprovementPreviousBindingLookup;
  capture_binding_lookup: CanonicalCompletedImprovementCaptureBindingLookup;
}): CanonicalCompletedImprovementCaptureVerification {
  const harness = createCanonicalCompletedImprovementCaptureHarness({
    enabled: true,
    kill_switch_engaged: false,
    authority: input.authority,
    previous_binding_lookup: input.previous_binding_lookup,
    capture_binding_lookup: input.capture_binding_lookup,
  });
  if (!harness.capture) {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["capture_rebuild_unavailable"],
    });
  }
  const canonicalResult = harness.capture(input.request);
  const valid = exact(canonicalResult, input.result);
  return deepFreeze({
    valid,
    canonical_result: valid ? canonicalResult : null,
    reason_codes: valid
      ? []
      : ["canonical_completed_improvement_capture_result_tampered"],
  });
}

export function canonicalCompletedImprovementCaptureRequestDigest(
  request: CanonicalCompletedImprovementCaptureRequest,
) {
  return captureInputDigest(request);
}

export function canonicalCompletedImprovementOutcomeLineageDigest(
  sources: CanonicalModelImprovementUpstreamSources,
) {
  return outcomeEvaluatorLineageDigest(sources);
}

export function canonicalCompletedImprovementProviderContextDigest(
  sources: CanonicalModelImprovementUpstreamSources,
) {
  return providerContextProvenanceDigest(sources);
}

export function canonicalCompletedImprovementProtectedMetricDigest(
  post: CanonicalModelImprovementTrustBoundary["registry"]["posts"][number],
) {
  return protectedMetricInventoryDigest(post);
}
