import "server-only";

import {
  CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_VERSION,
  CANONICAL_COMPLETED_IMPROVEMENT_TERMINAL_RESULT_VERSION,
  createCanonicalCompletedImprovementCaptureHarness,
  verifyCanonicalCompletedImprovementCaptureResult,
  type CanonicalCompletedImprovementCaptureAuthority,
  type CanonicalCompletedImprovementCaptureBindingLookup,
  type CanonicalCompletedImprovementCaptureRequest,
  type CanonicalCompletedImprovementCaptureResult,
  type CanonicalCompletedImprovementLookupObservation,
} from "@/lib/server/canonical-completed-improvement-evidence-capture";
import {
  CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
  CANONICAL_IMPROVEMENT_PROPOSAL_REPLAY_VERSION,
  canonicalCompletedImprovementEvidenceBundleDigest,
  createCanonicalImprovementProposalReplayHarness,
  verifyCanonicalImprovementReplayResult,
  type CanonicalImprovementReplayResult,
} from "@/lib/server/canonical-model-improvement-input-adapter";
import {
  CANONICAL_MODEL_IMPROVEMENT_MULTIPLE_TESTING_POLICY_VERSION,
  CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION,
  CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_VERSION,
  canonicalModelImprovementDigest,
  createCanonicalModelImprovementEngine,
  verifyCanonicalModelImprovementResult,
  type CanonicalModelImprovementPreviousBindingLookup,
  type CanonicalModelImprovementProposalStatus,
  type CanonicalModelImprovementResult,
  type CanonicalModelVersionTuple,
} from "@/lib/server/canonical-model-improvement-proposal";

export const CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REPLAY_VERSION =
  "canonical_governed_improvement_end_to_end_replay_v1" as const;
export const CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REQUEST_VERSION =
  "canonical_governed_improvement_end_to_end_request_v1" as const;
export const CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_LINEAGE_VERSION =
  "canonical_governed_improvement_end_to_end_lineage_v1" as const;
export const CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_STAGE_VERSION =
  "canonical_governed_improvement_end_to_end_stage_v1" as const;
export const CANONICAL_GOVERNED_IMPROVEMENT_STAGE_LOOKUP_OBSERVATION_VERSION =
  "canonical_governed_improvement_stage_lookup_observation_v1" as const;
export const CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_STATUSES = [
  "completed",
  "conflicting",
  "incomplete",
  "rejected",
] as const;
export const CANONICAL_GOVERNED_IMPROVEMENT_COMPLETED_PROPOSAL_STATUSES = [
  "proposal_ready",
  "no_change",
  "research_only",
  "insufficient_evidence",
] as const;
export const DEFAULT_OFF_GOVERNED_IMPROVEMENT_END_TO_END_REPLAY_ENABLED =
  false;
export const DEFAULT_OFF_GOVERNED_IMPROVEMENT_END_TO_END_KILL_SWITCH_ENGAGED =
  true;

type CanonicalGovernedImprovementEndToEndStatus =
  (typeof CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_STATUSES)[number];
type CanonicalGovernedImprovementCompletedProposalStatus =
  (typeof CANONICAL_GOVERNED_IMPROVEMENT_COMPLETED_PROPOSAL_STATUSES)[number];

type CanonicalGovernedImprovementSafety = {
  shadow_only: true;
  live_ranking_effect: false;
  persistence_performed: false;
  automatic_training_allowed: false;
  automatic_parameter_change_allowed: false;
  automatic_threshold_change_allowed: false;
  automatic_model_change_allowed: false;
  automatic_promotion_allowed: false;
  external_ai_canonical_truth_authority: false;
  causal_improvement_claimed: false;
  synthetic_evidence: true;
  not_publishable: true;
};

export type CanonicalGovernedImprovementEndToEndRequest = {
  request_version:
    typeof CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REQUEST_VERSION;
  source_namespace: "completed_governed_improvement_replay_input";
  completed_capture_request: CanonicalCompletedImprovementCaptureRequest;
};

export type CanonicalGovernedImprovementEndToEndCounters = {
  request_reads: number;
  clones: number;
  trust_lookups: number;
  capture_executions: number;
  capture_rebuild_verifications: number;
  adapter_executions: number;
  adapter_rebuild_verifications: number;
  proposal_executions: number;
  proposal_rebuild_verifications: number;
  stage_projection_reads: number;
  digest_operations: number;
};

export type CanonicalGovernedImprovementStageEvidence = {
  stage_version:
    typeof CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_STAGE_VERSION;
  stage_sequence: 1 | 2 | 3;
  stage: "capture" | "adapter" | "proposal";
  contract_versions: string[];
  status: string;
  identity: string | null;
  canonical_artifact_digest: string | null;
  observed_stage_result_digest: string;
  rebuild_verified: boolean;
  reason_codes: string[];
  stage_evidence_digest: string;
};

export type CanonicalGovernedImprovementStageLookupObservation = {
  observation_version:
    typeof CANONICAL_GOVERNED_IMPROVEMENT_STAGE_LOOKUP_OBSERVATION_VERSION;
  stage: "adapter" | "proposal";
  lookup_contract_version:
    "canonical_model_improvement_previous_binding_lookup_v1";
  capture_request_identity: string;
  binding_type: "proposal" | "experiment";
  queried_binding_identity: string;
  observed_status:
    | "absent"
    | "matching"
    | "conflicting"
    | "lookup_failed";
  observed_binding_digest: string | null;
  expected_binding_digest: string;
  sanitized_failure_classification:
    | "none"
    | "semantic_collision"
    | "previous_binding_lookup_failed";
  observation_digest_algorithm: "sha256_canonical_json_v1";
  observation_digest: string;
};

export type CanonicalGovernedImprovementEndToEndLineage = {
  lineage_version:
    typeof CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_LINEAGE_VERSION;
  request_digest: string;
  capture_identity: string | null;
  capture_digest: string | null;
  capture_terminal_digest: string | null;
  capture_lookup_observations: CanonicalCompletedImprovementLookupObservation[];
  capture_lookup_observation_inventory_digest: string | null;
  stage_previous_binding_observations:
    CanonicalGovernedImprovementStageLookupObservation[];
  stage_previous_binding_observation_inventory_digest: string | null;
  adapter_bundle_identity: string | null;
  adapter_observed_bundle_digest: string | null;
  adapter_expected_bundle_digest: string | null;
  adapter_replay_digest: string | null;
  adapter_mapping_digest: string | null;
  mapping_status: CanonicalImprovementReplayResult["status"] | null;
  mapping_reason_codes: string[];
  proposal_identity: string | null;
  proposal_status: CanonicalModelImprovementProposalStatus | null;
  proposal_digest: string | null;
  experiment_preregistration_identity: string | null;
  metric_policy_version: string | null;
  multiple_testing_policy_version: string | null;
  multiple_testing_evidence_digest: string | null;
  cohort: string | null;
  period: { start: string; end: string } | null;
  opportunity_membership_digest: string | null;
  baseline_versions: CanonicalModelVersionTuple | null;
  candidate_versions: CanonicalModelVersionTuple | null;
  outcome_evaluator_lineage_digest: string | null;
  explanation_lineage_digest: string | null;
  proposal_registry_root_digest: string | null;
  proposal_registry_authority_digest: string | null;
  feature_context_registry_root_digest: string | null;
  training_input_registry_root_digest: string | null;
  stage_inventory: CanonicalGovernedImprovementStageEvidence[];
  stage_inventory_digest: string;
  lineage_digest_algorithm: "sha256_canonical_json_v1";
  lineage_digest: string;
};

type CanonicalGovernedImprovementEndToEndLineageValues = Omit<
  CanonicalGovernedImprovementEndToEndLineage,
  | "lineage_version"
  | "request_digest"
  | "stage_inventory"
  | "stage_inventory_digest"
  | "lineage_digest_algorithm"
  | "lineage_digest"
>;

export type CanonicalGovernedImprovementEndToEndResult = {
  replay_version:
    typeof CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REPLAY_VERSION;
  status: CanonicalGovernedImprovementEndToEndStatus;
  proposal_status: CanonicalGovernedImprovementCompletedProposalStatus | null;
  reason_codes: string[];
  lineage: CanonicalGovernedImprovementEndToEndLineage;
  end_to_end_digest_algorithm: "sha256_canonical_json_v1";
  end_to_end_digest: string;
} & CanonicalGovernedImprovementSafety;

export type CanonicalGovernedImprovementUntrustedStageProjection = {
  capture?: (
    canonicalResult: CanonicalCompletedImprovementCaptureResult,
  ) => CanonicalCompletedImprovementCaptureResult;
  adapter?: (
    canonicalResult: CanonicalImprovementReplayResult,
  ) => CanonicalImprovementReplayResult;
  proposal?: (
    canonicalResult: CanonicalModelImprovementResult,
  ) => CanonicalModelImprovementResult;
};

export type CanonicalGovernedImprovementEndToEndDependencies = {
  capture_authority: CanonicalCompletedImprovementCaptureAuthority;
  capture_previous_binding_lookup: CanonicalModelImprovementPreviousBindingLookup;
  adapter_previous_binding_lookup: CanonicalModelImprovementPreviousBindingLookup;
  proposal_previous_binding_lookup: CanonicalModelImprovementPreviousBindingLookup;
  capture_binding_lookup: CanonicalCompletedImprovementCaptureBindingLookup;
  untrusted_stage_projection?: CanonicalGovernedImprovementUntrustedStageProjection;
  counters?: CanonicalGovernedImprovementEndToEndCounters;
};

const safety = {
  shadow_only: true,
  live_ranking_effect: false,
  persistence_performed: false,
  automatic_training_allowed: false,
  automatic_parameter_change_allowed: false,
  automatic_threshold_change_allowed: false,
  automatic_model_change_allowed: false,
  automatic_promotion_allowed: false,
  external_ai_canonical_truth_authority: false,
  causal_improvement_claimed: false,
  synthetic_evidence: true,
  not_publishable: true,
} as const;

const forbiddenCallerAuthorityFields = [
  "verified",
  "complete",
  "mapped",
  "proposal_ready",
  "approved",
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

function emptyCounters(): CanonicalGovernedImprovementEndToEndCounters {
  return {
    request_reads: 0,
    clones: 0,
    trust_lookups: 0,
    capture_executions: 0,
    capture_rebuild_verifications: 0,
    adapter_executions: 0,
    adapter_rebuild_verifications: 0,
    proposal_executions: 0,
    proposal_rebuild_verifications: 0,
    stage_projection_reads: 0,
    digest_operations: 0,
  };
}

function digest(
  value: unknown,
  counters: CanonicalGovernedImprovementEndToEndCounters,
) {
  counters.digest_operations += 1;
  return canonicalModelImprovementDigest(value);
}

function structuralReasons(value: unknown) {
  if (!isRecord(value)) return ["end_to_end_request_missing"];
  const reasons: string[] = [];
  if (
    value.request_version !==
    CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REQUEST_VERSION
  ) {
    reasons.push("end_to_end_request_version_missing");
  }
  if (
    value.source_namespace !==
    "completed_governed_improvement_replay_input"
  ) {
    reasons.push("end_to_end_source_namespace_missing");
  }
  if (!isRecord(value.completed_capture_request)) {
    reasons.push("completed_capture_request_missing");
  }
  for (const field of forbiddenCallerAuthorityFields) {
    if (field in value) {
      reasons.push(`end_to_end_caller_authority_field_forbidden:${field}`);
    }
  }
  return uniqueSorted(reasons);
}

function stageEvidence(input: {
  stage_sequence: 1 | 2 | 3;
  stage: CanonicalGovernedImprovementStageEvidence["stage"];
  contract_versions: string[];
  status: string;
  identity: string | null;
  canonical_artifact_digest: string | null;
  result: unknown;
  rebuild_verified: boolean;
  reason_codes: string[];
  counters: CanonicalGovernedImprovementEndToEndCounters;
}) {
  const payload = {
    stage_version: CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_STAGE_VERSION,
    stage_sequence: input.stage_sequence,
    stage: input.stage,
    contract_versions: [...input.contract_versions].sort(),
    status: input.status,
    identity: input.identity,
    canonical_artifact_digest: input.canonical_artifact_digest,
    observed_stage_result_digest: digest(input.result, input.counters),
    rebuild_verified: input.rebuild_verified,
    reason_codes: uniqueSorted(input.reason_codes),
  };
  return deepFreeze({
    ...payload,
    stage_evidence_digest: digest(payload, input.counters),
  });
}

function emptyLineageValues(): CanonicalGovernedImprovementEndToEndLineageValues {
  return {
    capture_identity: null,
    capture_digest: null,
    capture_terminal_digest: null,
    capture_lookup_observations: [],
    capture_lookup_observation_inventory_digest: null,
    stage_previous_binding_observations: [],
    stage_previous_binding_observation_inventory_digest: null,
    adapter_bundle_identity: null,
    adapter_observed_bundle_digest: null,
    adapter_expected_bundle_digest: null,
    adapter_replay_digest: null,
    adapter_mapping_digest: null,
    mapping_status: null,
    mapping_reason_codes: [],
    proposal_identity: null,
    proposal_status: null,
    proposal_digest: null,
    experiment_preregistration_identity: null,
    metric_policy_version: null,
    multiple_testing_policy_version: null,
    multiple_testing_evidence_digest: null,
    cohort: null,
    period: null,
    opportunity_membership_digest: null,
    baseline_versions: null,
    candidate_versions: null,
    outcome_evaluator_lineage_digest: null,
    explanation_lineage_digest: null,
    proposal_registry_root_digest: null,
    proposal_registry_authority_digest: null,
    feature_context_registry_root_digest: null,
    training_input_registry_root_digest: null,
  };
}

function buildLineage(input: {
  requestDigest: string;
  stageInventory: CanonicalGovernedImprovementStageEvidence[];
  values?: Partial<CanonicalGovernedImprovementEndToEndLineageValues>;
  counters: CanonicalGovernedImprovementEndToEndCounters;
}) {
  const stageInventory = [...input.stageInventory]
    .map((stage) => structuredClone(stage))
    .sort((first, second) => first.stage_sequence - second.stage_sequence);
  const stageInventoryDigest = digest(
    {
      stage_version: CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_STAGE_VERSION,
      stages: stageInventory,
    },
    input.counters,
  );
  const payload = {
    lineage_version:
      CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_LINEAGE_VERSION,
    request_digest: input.requestDigest,
    ...emptyLineageValues(),
    ...input.values,
    stage_inventory: stageInventory,
    stage_inventory_digest: stageInventoryDigest,
    lineage_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreeze({
    ...payload,
    lineage_digest: digest(payload, input.counters),
  });
}

function terminalResult(input: {
  status: CanonicalGovernedImprovementEndToEndStatus;
  proposalStatus?: CanonicalGovernedImprovementCompletedProposalStatus | null;
  reasonCodes: string[];
  lineage: CanonicalGovernedImprovementEndToEndLineage;
  counters: CanonicalGovernedImprovementEndToEndCounters;
}) {
  const payload = {
    replay_version:
      CANONICAL_GOVERNED_IMPROVEMENT_END_TO_END_REPLAY_VERSION,
    status: input.status,
    proposal_status: input.proposalStatus ?? null,
    reason_codes: uniqueSorted(input.reasonCodes),
    lineage: input.lineage,
    end_to_end_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreeze({
    ...payload,
    end_to_end_digest: digest(payload, input.counters),
  });
}

function captureLineageValues(
  result: CanonicalCompletedImprovementCaptureResult,
) {
  return {
    capture_identity: result.capture_identity,
    capture_digest: result.capture?.capture_digest ?? null,
    capture_terminal_digest: result.terminal_result_digest,
    capture_lookup_observations: structuredClone(result.lookup_observations),
    capture_lookup_observation_inventory_digest:
      result.lookup_observation_inventory_digest,
    cohort: result.capture?.cohort ?? null,
    period: result.capture ? structuredClone(result.capture.period) : null,
    opportunity_membership_digest:
      result.capture?.opportunity_membership_digest ?? null,
    baseline_versions: result.capture
      ? structuredClone(result.capture.baseline_versions)
      : null,
    candidate_versions: result.capture
      ? structuredClone(result.capture.candidate_versions)
      : null,
    outcome_evaluator_lineage_digest:
      result.capture?.outcome_evaluator_lineage_digest ?? null,
    explanation_lineage_digest:
      result.capture?.source_artifact_digests.explanation_cohort ?? null,
    proposal_registry_root_digest:
      result.capture?.proposal_registry_root_digest ?? null,
    proposal_registry_authority_digest:
      result.capture?.proposal_registry_authority_digest ?? null,
    feature_context_registry_root_digest:
      result.capture?.feature_context_registry_root_digest ?? null,
    training_input_registry_root_digest:
      result.capture?.training_input_registry_root_digest ?? null,
  };
}

function adapterLineageValues(result: CanonicalImprovementReplayResult) {
  return {
    adapter_bundle_identity: result.input_projection.bundle_identity,
    adapter_observed_bundle_digest:
      result.input_projection.observed_bundle_digest,
    adapter_expected_bundle_digest:
      result.input_projection.expected_bundle_digest,
    adapter_replay_digest: result.replay_digest,
    adapter_mapping_digest:
      result.adapter_result?.mapping?.mapping_digest ?? null,
    mapping_status: result.status,
    mapping_reason_codes: structuredClone(result.reason_codes),
  };
}

function expectedPreviousBindings(
  captureResult: CanonicalCompletedImprovementCaptureResult,
) {
  if (captureResult.status !== "captured") return new Map<string, string>();
  const bundle = captureResult.capture.bundle;
  const post = bundle.trust_boundary.registry.posts.find(
    (candidate) =>
      candidate.trusted_input_identity === bundle.trusted_input_identity,
  );
  if (!post) return new Map<string, string>();
  return new Map([
    ...post.payload.proposal_candidates.map(
      (proposal) =>
        [
          `proposal:${proposal.proposal_identity}`,
          proposal.semantic_digest,
        ] as const,
    ),
    ...(post.payload.experiment_plan
      ? [
          [
            `experiment:${post.payload.experiment_plan.plan_identity}`,
            post.payload.experiment_plan.semantic_digest,
          ] as const,
        ]
      : []),
  ]);
}

function wrapObservedPreviousBindingLookup(input: {
  stage: "adapter" | "proposal";
  lookup: CanonicalModelImprovementPreviousBindingLookup;
  captureRequestIdentity: string;
  expectedBindings: Map<string, string>;
  observations: CanonicalGovernedImprovementStageLookupObservation[];
  counters: CanonicalGovernedImprovementEndToEndCounters;
}): CanonicalModelImprovementPreviousBindingLookup {
  const observe = (
    bindingType: "proposal" | "experiment",
    identity: string,
    read: () => { semantic_digest: string } | null,
  ) => {
    const expected =
      input.expectedBindings.get(`${bindingType}:${identity}`) ??
      canonicalModelImprovementDigest({
        missing_expected_previous_binding: {
          binding_type: bindingType,
          identity,
        },
      });
    let observed: { semantic_digest: string } | null;
    let status:
      | "absent"
      | "matching"
      | "conflicting"
      | "lookup_failed";
    try {
      const value: unknown = read();
      if (
        value !== null &&
        (!isRecord(value) ||
          typeof value.semantic_digest !== "string" ||
          !/^[a-f0-9]{64}$/.test(value.semantic_digest))
      ) {
        throw new Error("invalid_previous_binding_lookup_result");
      }
      observed = value as { semantic_digest: string } | null;
      status =
        observed === null
          ? "absent"
          : observed.semantic_digest === expected
            ? "matching"
            : "conflicting";
    } catch {
      observed = null;
      status = "lookup_failed";
    }
    const payload = {
      observation_version:
        CANONICAL_GOVERNED_IMPROVEMENT_STAGE_LOOKUP_OBSERVATION_VERSION,
      stage: input.stage,
      lookup_contract_version:
        "canonical_model_improvement_previous_binding_lookup_v1" as const,
      capture_request_identity: input.captureRequestIdentity,
      binding_type: bindingType,
      queried_binding_identity: identity,
      observed_status: status,
      observed_binding_digest: observed?.semantic_digest ?? null,
      expected_binding_digest: expected,
      sanitized_failure_classification:
        status === "lookup_failed"
          ? ("previous_binding_lookup_failed" as const)
          : status === "conflicting"
            ? ("semantic_collision" as const)
            : ("none" as const),
      observation_digest_algorithm: "sha256_canonical_json_v1" as const,
    };
    input.observations.push(
      deepFreeze({
        ...payload,
        observation_digest: digest(payload, input.counters),
      }),
    );
    if (status === "lookup_failed") {
      throw new Error("sanitized_previous_binding_lookup_failed");
    }
    return observed;
  };
  return {
    lookup_proposal_binding: (identity) =>
      observe("proposal", identity, () =>
        input.lookup.lookup_proposal_binding(identity),
      ),
    lookup_experiment_binding: (identity) =>
      observe("experiment", identity, () =>
        input.lookup.lookup_experiment_binding(identity),
      ),
  };
}

function stageLookupLineageValues(
  observations: CanonicalGovernedImprovementStageLookupObservation[],
  counters: CanonicalGovernedImprovementEndToEndCounters,
) {
  const ordered = observations
    .map((observation) => structuredClone(observation))
    .sort((first, second) =>
      [
        first.stage,
        first.binding_type,
        first.queried_binding_identity,
        first.observation_digest,
      ]
        .join(":")
        .localeCompare(
          [
            second.stage,
            second.binding_type,
            second.queried_binding_identity,
            second.observation_digest,
          ].join(":"),
        ),
    );
  return {
    stage_previous_binding_observations: ordered,
    stage_previous_binding_observation_inventory_digest: digest(
      {
        observation_version:
          CANONICAL_GOVERNED_IMPROVEMENT_STAGE_LOOKUP_OBSERVATION_VERSION,
        observations: ordered,
      },
      counters,
    ),
  };
}

function proposalLineageValues(result: CanonicalModelImprovementResult) {
  const proposal = result.proposal;
  return {
    proposal_identity: proposal?.proposal_identity ?? null,
    proposal_status:
      result.status === "disabled" || result.status === "kill_switch_engaged"
        ? null
        : result.status,
    proposal_digest: proposal?.canonical_proposal_digest ?? null,
    experiment_preregistration_identity:
      proposal?.experiment_plan?.plan_identity ?? null,
    metric_policy_version: proposal?.policy_version ?? null,
    multiple_testing_policy_version:
      proposal?.multiple_testing.policy_version ?? null,
    multiple_testing_evidence_digest:
      proposal?.multiple_testing.evidence_digest ?? null,
  };
}

function applyUntrustedProjection<T>(
  canonicalResult: T,
  projection: ((value: T) => T) | undefined,
  counters: CanonicalGovernedImprovementEndToEndCounters,
) {
  if (!projection) return canonicalResult;
  counters.stage_projection_reads += 1;
  return projection(canonicalResult);
}

function rejectedForProjectionFailure(input: {
  requestDigest: string;
  stageInventory: CanonicalGovernedImprovementStageEvidence[];
  lineageValues?: Partial<CanonicalGovernedImprovementEndToEndLineageValues>;
  reasonCode: string;
  counters: CanonicalGovernedImprovementEndToEndCounters;
}) {
  return terminalResult({
    status: "rejected",
    reasonCodes: [input.reasonCode],
    lineage: buildLineage({
      requestDigest: input.requestDigest,
      stageInventory: input.stageInventory,
      values: input.lineageValues,
      counters: input.counters,
    }),
    counters: input.counters,
  });
}

function executeEndToEnd(input: {
  request: CanonicalGovernedImprovementEndToEndRequest;
  dependencies: CanonicalGovernedImprovementEndToEndDependencies;
  counters: CanonicalGovernedImprovementEndToEndCounters;
}): CanonicalGovernedImprovementEndToEndResult {
  input.counters.request_reads += 1;
  const requestDigest = digest(input.request, input.counters);
  const structural = structuralReasons(input.request);
  if (structural.length > 0) {
    return terminalResult({
      status: structural.some((reason) => reason.includes("forbidden"))
        ? "conflicting"
        : "incomplete",
      reasonCodes: structural,
      lineage: buildLineage({
        requestDigest,
        stageInventory: [],
        counters: input.counters,
      }),
      counters: input.counters,
    });
  }

  input.counters.clones += 1;
  const request = structuredClone(input.request);
  input.counters.trust_lookups += 1;
  const captureHarness =
    createCanonicalCompletedImprovementCaptureHarness({
      enabled: true,
      kill_switch_engaged: false,
      authority: input.dependencies.capture_authority,
      previous_binding_lookup:
        input.dependencies.capture_previous_binding_lookup,
      capture_binding_lookup: input.dependencies.capture_binding_lookup,
    });
  if (!captureHarness.capture) {
    return terminalResult({
      status: "rejected",
      reasonCodes: ["capture_stage_unavailable"],
      lineage: buildLineage({
        requestDigest,
        stageInventory: [],
        counters: input.counters,
      }),
      counters: input.counters,
    });
  }

  input.counters.capture_executions += 1;
  const canonicalCapture = captureHarness.capture(
    request.completed_capture_request,
  );
  let captureResult: CanonicalCompletedImprovementCaptureResult;
  try {
    captureResult = applyUntrustedProjection(
      canonicalCapture,
      input.dependencies.untrusted_stage_projection?.capture,
      input.counters,
    );
  } catch {
    return rejectedForProjectionFailure({
      requestDigest,
      stageInventory: [],
      reasonCode: "capture_stage_projection_failed",
      counters: input.counters,
    });
  }
  input.counters.capture_rebuild_verifications += 1;
  const captureVerification =
    verifyCanonicalCompletedImprovementCaptureResult({
      request: request.completed_capture_request,
      result: captureResult,
      authority: input.dependencies.capture_authority,
      previous_binding_lookup:
        input.dependencies.capture_previous_binding_lookup,
      capture_binding_lookup: input.dependencies.capture_binding_lookup,
    });
  const captureStage = stageEvidence({
    stage_sequence: 1,
    stage: "capture",
    contract_versions: [
      CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_VERSION,
      CANONICAL_COMPLETED_IMPROVEMENT_TERMINAL_RESULT_VERSION,
    ],
    status: captureResult.status,
    identity: captureResult.capture_identity,
    canonical_artifact_digest: captureResult.capture?.capture_digest ?? null,
    result: captureResult,
    rebuild_verified: captureVerification.valid,
    reason_codes: captureVerification.valid
      ? captureResult.reason_codes
      : captureVerification.reason_codes,
    counters: input.counters,
  });
  const captureValues = captureLineageValues(captureResult);
  if (!captureVerification.valid) {
    return rejectedForProjectionFailure({
      requestDigest,
      stageInventory: [captureStage],
      lineageValues: captureValues,
      reasonCode: "capture_stage_rebuild_verification_failed",
      counters: input.counters,
    });
  }
  if (captureResult.status !== "captured" || !captureResult.capture) {
    return terminalResult({
      status:
        captureResult.status === "conflicting"
          ? "conflicting"
          : "incomplete",
      reasonCodes: captureResult.reason_codes.map(
        (reason) => `capture:${reason}`,
      ),
      lineage: buildLineage({
        requestDigest,
        stageInventory: [captureStage],
        values: captureValues,
        counters: input.counters,
      }),
      counters: input.counters,
    });
  }

  const stageLookupObservations:
    CanonicalGovernedImprovementStageLookupObservation[] = [];
  const expectedBindings = expectedPreviousBindings(captureResult);
  const adapterHarness = createCanonicalImprovementProposalReplayHarness({
    enabled: true,
    kill_switch_engaged: false,
    previous_binding_lookup: wrapObservedPreviousBindingLookup({
      stage: "adapter",
      lookup: input.dependencies.adapter_previous_binding_lookup,
      captureRequestIdentity: captureResult.capture.capture_identity,
      expectedBindings,
      observations: stageLookupObservations,
      counters: input.counters,
    }),
  });
  if (!adapterHarness.replay) {
    return rejectedForProjectionFailure({
      requestDigest,
      stageInventory: [captureStage],
      lineageValues: captureValues,
      reasonCode: "adapter_stage_unavailable",
      counters: input.counters,
    });
  }
  const adapterRequest = {
    bundle: captureResult.capture.bundle,
    expected_bundle_digest:
      canonicalCompletedImprovementEvidenceBundleDigest(
        captureResult.capture.bundle,
      ),
  };
  input.counters.adapter_executions += 1;
  const canonicalAdapter = adapterHarness.replay(adapterRequest);
  let adapterResult: CanonicalImprovementReplayResult;
  try {
    adapterResult = applyUntrustedProjection(
      canonicalAdapter,
      input.dependencies.untrusted_stage_projection?.adapter,
      input.counters,
    );
  } catch {
    return rejectedForProjectionFailure({
      requestDigest,
      stageInventory: [captureStage],
      lineageValues: captureValues,
      reasonCode: "adapter_stage_projection_failed",
      counters: input.counters,
    });
  }
  input.counters.adapter_rebuild_verifications += 1;
  const adapterVerification = verifyCanonicalImprovementReplayResult({
    request: adapterRequest,
    result: adapterResult,
    previous_binding_lookup:
      input.dependencies.adapter_previous_binding_lookup,
  });
  const adapterStage = stageEvidence({
    stage_sequence: 2,
    stage: "adapter",
    contract_versions: [
      CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
      CANONICAL_IMPROVEMENT_PROPOSAL_REPLAY_VERSION,
    ],
    status: adapterResult.status,
    identity: adapterResult.input_projection.bundle_identity,
    canonical_artifact_digest:
      adapterResult.adapter_result?.mapping?.mapping_digest ?? null,
    result: adapterResult,
    rebuild_verified: adapterVerification.valid,
    reason_codes: adapterVerification.valid
      ? adapterResult.reason_codes
      : adapterVerification.reason_codes,
    counters: input.counters,
  });
  const adapterValues = {
    ...captureValues,
    ...adapterLineageValues(adapterResult),
    ...stageLookupLineageValues(
      stageLookupObservations,
      input.counters,
    ),
  };
  if (!adapterVerification.valid) {
    return rejectedForProjectionFailure({
      requestDigest,
      stageInventory: [captureStage, adapterStage],
      lineageValues: adapterValues,
      reasonCode: "adapter_stage_rebuild_verification_failed",
      counters: input.counters,
    });
  }
  if (adapterResult.status !== "mapped") {
    return terminalResult({
      status:
        adapterResult.status === "conflicting"
          ? "conflicting"
          : "incomplete",
      reasonCodes: adapterResult.reason_codes.map(
        (reason) => `adapter:${reason}`,
      ),
      lineage: buildLineage({
        requestDigest,
        stageInventory: [captureStage, adapterStage],
        values: adapterValues,
        counters: input.counters,
      }),
      counters: input.counters,
    });
  }

  const proposalEngine = createCanonicalModelImprovementEngine({
    enabled: true,
    kill_switch_engaged: false,
    trust_boundary: captureResult.capture.bundle.trust_boundary,
    previous_binding_lookup: wrapObservedPreviousBindingLookup({
      stage: "proposal",
      lookup: input.dependencies.proposal_previous_binding_lookup,
      captureRequestIdentity: captureResult.capture.capture_identity,
      expectedBindings,
      observations: stageLookupObservations,
      counters: input.counters,
    }),
  });
  if (!proposalEngine.build || proposalEngine.status !== "ready") {
    return rejectedForProjectionFailure({
      requestDigest,
      stageInventory: [captureStage, adapterStage],
      lineageValues: adapterValues,
      reasonCode: "proposal_stage_unavailable",
      counters: input.counters,
    });
  }
  const proposalRequest = {
    evidence_class: "synthetic_fixture_only" as const,
    trusted_input_identity:
      captureResult.capture.bundle.trusted_input_identity,
    trusted_input_digest:
      captureResult.capture.bundle.trusted_input_digest,
  };
  input.counters.proposal_executions += 1;
  const canonicalProposal = proposalEngine.build(proposalRequest);
  let proposalResult: CanonicalModelImprovementResult;
  try {
    proposalResult = applyUntrustedProjection(
      canonicalProposal,
      input.dependencies.untrusted_stage_projection?.proposal,
      input.counters,
    );
  } catch {
    return rejectedForProjectionFailure({
      requestDigest,
      stageInventory: [captureStage, adapterStage],
      lineageValues: adapterValues,
      reasonCode: "proposal_stage_projection_failed",
      counters: input.counters,
    });
  }
  input.counters.proposal_rebuild_verifications += 1;
  const proposalVerificationEngine = createCanonicalModelImprovementEngine({
    enabled: true,
    kill_switch_engaged: false,
    trust_boundary: captureResult.capture.bundle.trust_boundary,
    previous_binding_lookup:
      input.dependencies.proposal_previous_binding_lookup,
  });
  const proposalVerification = verifyCanonicalModelImprovementResult({
    engine: proposalVerificationEngine,
    request: proposalRequest,
    result: proposalResult,
  });
  const proposalStage = stageEvidence({
    stage_sequence: 3,
    stage: "proposal",
    contract_versions: [
      CANONICAL_MODEL_IMPROVEMENT_PROPOSAL_VERSION,
      CANONICAL_MODEL_IMPROVEMENT_POLICY_VERSION,
      CANONICAL_MODEL_IMPROVEMENT_MULTIPLE_TESTING_POLICY_VERSION,
    ],
    status: proposalResult.status,
    identity: proposalResult.proposal?.proposal_identity ?? null,
    canonical_artifact_digest:
      proposalResult.proposal?.canonical_proposal_digest ?? null,
    result: proposalResult,
    rebuild_verified: proposalVerification.valid,
    reason_codes: proposalVerification.valid
      ? proposalResult.reason_codes
      : proposalVerification.reason_codes,
    counters: input.counters,
  });
  const proposalValues = {
    ...adapterValues,
    ...proposalLineageValues(proposalResult),
    ...stageLookupLineageValues(
      stageLookupObservations,
      input.counters,
    ),
  };
  if (!proposalVerification.valid) {
    return rejectedForProjectionFailure({
      requestDigest,
      stageInventory: [captureStage, adapterStage, proposalStage],
      lineageValues: proposalValues,
      reasonCode: "proposal_stage_rebuild_verification_failed",
      counters: input.counters,
    });
  }
  const adapterProposal =
    adapterResult.adapter_result?.mapping?.proposal_result;
  if (
    !adapterProposal ||
    canonicalModelImprovementDigest(adapterProposal) !==
      canonicalModelImprovementDigest(proposalResult)
  ) {
    return terminalResult({
      status: "rejected",
      reasonCodes: ["adapter_proposal_result_parity_mismatch"],
      lineage: buildLineage({
        requestDigest,
        stageInventory: [captureStage, adapterStage, proposalStage],
        values: proposalValues,
        counters: input.counters,
      }),
      counters: input.counters,
    });
  }
  if (
    !CANONICAL_GOVERNED_IMPROVEMENT_COMPLETED_PROPOSAL_STATUSES.includes(
      proposalResult.status as CanonicalGovernedImprovementCompletedProposalStatus,
    )
  ) {
    return terminalResult({
      status: "conflicting",
      reasonCodes: proposalResult.reason_codes.map(
        (reason) => `proposal:${reason}`,
      ),
      lineage: buildLineage({
        requestDigest,
        stageInventory: [captureStage, adapterStage, proposalStage],
        values: proposalValues,
        counters: input.counters,
      }),
      counters: input.counters,
    });
  }
  return terminalResult({
    status: "completed",
    proposalStatus:
      proposalResult.status as CanonicalGovernedImprovementCompletedProposalStatus,
    reasonCodes: proposalResult.reason_codes,
    lineage: buildLineage({
      requestDigest,
      stageInventory: [captureStage, adapterStage, proposalStage],
      values: proposalValues,
      counters: input.counters,
    }),
    counters: input.counters,
  });
}

export function createCanonicalGovernedImprovementEndToEndReplayHarness(input: {
  enabled?: boolean;
  kill_switch_engaged?: boolean;
  dependencies?: CanonicalGovernedImprovementEndToEndDependencies;
  counters?: CanonicalGovernedImprovementEndToEndCounters;
} = {}) {
  const enabled =
    input.enabled ??
    DEFAULT_OFF_GOVERNED_IMPROVEMENT_END_TO_END_REPLAY_ENABLED;
  const killSwitch =
    input.kill_switch_engaged ??
    DEFAULT_OFF_GOVERNED_IMPROVEMENT_END_TO_END_KILL_SWITCH_ENGAGED;
  const counters = input.counters ?? emptyCounters();
  if (!enabled || killSwitch) {
    return deepFreeze({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      replay: null,
      counters,
      ...safety,
    });
  }
  if (!input.dependencies) {
    return deepFreeze({
      enabled: true as const,
      status: "unavailable" as const,
      replay: null,
      reason_codes: ["end_to_end_dependencies_missing"],
      counters,
      ...safety,
    });
  }
  const dependencies = input.dependencies;
  return {
    enabled: true as const,
    status: "ready" as const,
    replay: (request: CanonicalGovernedImprovementEndToEndRequest) =>
      executeEndToEnd({ request, dependencies, counters }),
    counters,
    ...safety,
  };
}

export function verifyCanonicalGovernedImprovementEndToEndResult(input: {
  request: CanonicalGovernedImprovementEndToEndRequest;
  result: CanonicalGovernedImprovementEndToEndResult;
  dependencies: CanonicalGovernedImprovementEndToEndDependencies;
}) {
  const harness = createCanonicalGovernedImprovementEndToEndReplayHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies: input.dependencies,
  });
  if (!harness.replay) {
    return deepFreeze({
      valid: false,
      canonical_result: null,
      reason_codes: ["end_to_end_rebuild_unavailable"],
    });
  }
  const canonicalResult = harness.replay(input.request);
  const valid =
    canonicalModelImprovementDigest(canonicalResult) ===
    canonicalModelImprovementDigest(input.result);
  return deepFreeze({
    valid,
    canonical_result: valid ? canonicalResult : null,
    reason_codes: valid
      ? []
      : ["canonical_governed_improvement_end_to_end_result_tampered"],
  });
}

export function canonicalGovernedImprovementEndToEndRequestDigest(
  request: CanonicalGovernedImprovementEndToEndRequest,
) {
  return canonicalModelImprovementDigest(request);
}
