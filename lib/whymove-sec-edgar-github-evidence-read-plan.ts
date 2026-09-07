import {
  validateWhyMoveSecEdgarExternalReadEvidenceBundle,
  type NormalizedWhyMoveSecEdgarExternalReadEvidenceBundle,
} from "./whymove-sec-edgar-external-read-evidence-bundle";

export const WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_READ_PLAN_VERSION =
  "whymove_sec_edgar_github_evidence_read_plan_v1" as const;

export type WhyMoveSecEdgarGitHubEvidenceReadPlanAuthority = Readonly<{
  mode: "provider_free_github_evidence_read_plan";
  may_request_github: false;
  may_read_external_response: false;
  may_use_credentials: false;
  may_read_environment: false;
  may_change_ci_policy: false;
  may_change_branch_protection: false;
  may_persist: false;
  may_bind_runtime: false;
  may_deploy: false;
  may_influence_advisory: false;
  may_invoke_broker: false;
  may_access_production: false;
}>;

export const WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_READ_PLAN_AUTHORITY: WhyMoveSecEdgarGitHubEvidenceReadPlanAuthority =
  Object.freeze({
    mode: "provider_free_github_evidence_read_plan",
    may_request_github: false,
    may_read_external_response: false,
    may_use_credentials: false,
    may_read_environment: false,
    may_change_ci_policy: false,
    may_change_branch_protection: false,
    may_persist: false,
    may_bind_runtime: false,
    may_deploy: false,
    may_influence_advisory: false,
    may_invoke_broker: false,
    may_access_production: false,
  });

export type NormalizedWhyMoveSecEdgarGitHubEvidenceReadPlan = Readonly<{
  plan_id: string;
  github_repository: "willyvalentin/trade";
  protected_branch: "main";
  required_check: "provider-free-verification";
  evidence_bundle_id: string;
  execution_scope_id: string;
  operator_record_id: string;
  containment: "cancel_before_network_on_missing_or_mismatched_evidence";
  network_activity: "not_performed";
  identity_requirement: Readonly<{
    identity_class: "dedicated_fine_grained_read_only";
    permissions: Readonly<{
      actions: "read";
      administration: "read";
      metadata: "read";
    }>;
    token_handling: "injected_one_shot_not_returned";
  }>;
  planned_readbacks: readonly Readonly<{
    evidence_kind:
      | "ready_candidate_run"
      | "exact_main_run"
      | "independent_sweep_run"
      | "main_branch_protection"
      | "repository_rulesets";
    method: "GET";
    path: string;
    response_handling: "redact_and_bind_observed_metadata_only";
  }>[];
}>;

export type WhyMoveSecEdgarGitHubEvidenceReadPlanResult = Readonly<{
  version: typeof WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_READ_PLAN_VERSION;
  disposition:
    | "invalid_input"
    | "not_admitted_evidence_bundle_unvalidated"
    | "not_admitted_github_read_plan_mismatch"
    | "github_evidence_read_plan_locally_shaped_not_authorized_not_executed";
  reasons: readonly string[];
  planned_readback: NormalizedWhyMoveSecEdgarGitHubEvidenceReadPlan | null;
  authority: WhyMoveSecEdgarGitHubEvidenceReadPlanAuthority;
}>;

type PlainDataRecord = Readonly<Record<string, unknown>>;

const INPUT_KEYS = ["evidence_bundle_input", "github_readback_plan"] as const;
const PLAN_KEYS = [
  "containment",
  "github_repository",
  "identity_requirement",
  "independent_sweep_run_id",
  "independent_sweep_trigger",
  "network_activity",
  "plan_id",
  "protected_branch",
  "ready_candidate_run_id",
  "ready_candidate_sha",
  "required_check",
  "exact_main_run_id",
  "exact_main_sha",
] as const;
const IDENTITY_KEYS = ["identity_class", "permissions", "token_handling"] as const;
const PERMISSION_KEYS = ["actions", "administration", "metadata"] as const;
const PLAN_ID = /^[a-z0-9][a-z0-9:_-]{2,127}$/;
const SHA = /^[0-9a-f]{40}$/;

function freeze<T>(value: T): T {
  return Object.freeze(value);
}

function hasExactlyDataKeys(
  value: unknown,
  keys: readonly string[],
): value is PlainDataRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) return false;
  if (Object.getOwnPropertySymbols(value).length > 0) return false;

  const ownKeys = Object.getOwnPropertyNames(value).sort();
  const expectedKeys = [...keys].sort();
  if (
    ownKeys.length !== expectedKeys.length ||
    ownKeys.some((key, index) => key !== expectedKeys[index])
  ) {
    return false;
  }
  return ownKeys.every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== undefined && "value" in descriptor;
  });
}

function readString(record: PlainDataRecord, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function result(
  disposition: WhyMoveSecEdgarGitHubEvidenceReadPlanResult["disposition"],
  reasons: readonly string[] = [],
  plannedReadback: NormalizedWhyMoveSecEdgarGitHubEvidenceReadPlan | null = null,
): WhyMoveSecEdgarGitHubEvidenceReadPlanResult {
  return freeze({
    version: WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_READ_PLAN_VERSION,
    disposition,
    reasons: freeze([...new Set(reasons)].sort()),
    planned_readback: plannedReadback,
    authority: WHY_MOVE_SEC_EDGAR_GITHUB_EVIDENCE_READ_PLAN_AUTHORITY,
  });
}

function makeReadbacks(plan: PlainDataRecord) {
  const repository = "willyvalentin/trade";
  const responseHandling = "redact_and_bind_observed_metadata_only" as const;
  return freeze([
    freeze({ evidence_kind: "ready_candidate_run" as const, method: "GET" as const, path: `/repos/${repository}/actions/runs/${plan.ready_candidate_run_id}`, response_handling: responseHandling }),
    freeze({ evidence_kind: "exact_main_run" as const, method: "GET" as const, path: `/repos/${repository}/actions/runs/${plan.exact_main_run_id}`, response_handling: responseHandling }),
    freeze({ evidence_kind: "independent_sweep_run" as const, method: "GET" as const, path: `/repos/${repository}/actions/runs/${plan.independent_sweep_run_id}`, response_handling: responseHandling }),
    freeze({ evidence_kind: "main_branch_protection" as const, method: "GET" as const, path: `/repos/${repository}/branches/main/protection`, response_handling: responseHandling }),
    freeze({ evidence_kind: "repository_rulesets" as const, method: "GET" as const, path: `/repos/${repository}/rulesets`, response_handling: responseHandling }),
  ]);
}

/**
 * Shapes, but never executes, the exact GitHub GET-only proof that a later
 * separately authorized operator must bind to a CAT-00.9 evidence bundle.
 */
export function validateWhyMoveSecEdgarGitHubEvidenceReadPlan(
  input: unknown,
): WhyMoveSecEdgarGitHubEvidenceReadPlanResult {
  if (!hasExactlyDataKeys(input, INPUT_KEYS)) {
    return result("invalid_input", ["invalid_input_shape"]);
  }

  const evidence = validateWhyMoveSecEdgarExternalReadEvidenceBundle(
    input.evidence_bundle_input,
  );
  if (
    evidence.disposition !==
      "sec_edgar_external_read_evidence_bundle_locally_shaped_not_authorized_not_executed" ||
    evidence.validated_evidence_bundle === null
  ) {
    return result("not_admitted_evidence_bundle_unvalidated");
  }
  if (!hasExactlyDataKeys(input.github_readback_plan, PLAN_KEYS)) {
    return result("invalid_input", ["accessor_or_non_plain_input"]);
  }

  const plan = input.github_readback_plan;
  const reasons: string[] = [];
  const planId = readString(plan, "plan_id");
  const readySha = readString(plan, "ready_candidate_sha");
  const exactMainSha = readString(plan, "exact_main_sha");
  const scalarKeys = [
    "github_repository",
    "protected_branch",
    "required_check",
    "containment",
    "network_activity",
    "independent_sweep_trigger",
  ];
  if (!planId || !readySha || !exactMainSha || scalarKeys.some((key) => !readString(plan, key))) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }
  if (!PLAN_ID.test(planId)) reasons.push("invalid_plan_id");
  if (!SHA.test(readySha) || !SHA.test(exactMainSha)) reasons.push("invalid_commit_sha");
  if (!Number.isSafeInteger(plan.ready_candidate_run_id) || (plan.ready_candidate_run_id as number) < 1) reasons.push("invalid_ready_candidate_run_id");
  if (!Number.isSafeInteger(plan.exact_main_run_id) || (plan.exact_main_run_id as number) < 1) reasons.push("invalid_exact_main_run_id");
  if (!Number.isSafeInteger(plan.independent_sweep_run_id) || (plan.independent_sweep_run_id as number) < 1) reasons.push("invalid_independent_sweep_run_id");
  if (plan.github_repository !== "willyvalentin/trade") reasons.push("github_repository_mismatch");
  if (plan.protected_branch !== "main") reasons.push("protected_branch_mismatch");
  if (plan.required_check !== "provider-free-verification") reasons.push("required_check_mismatch");
  if (plan.containment !== "cancel_before_network_on_missing_or_mismatched_evidence") reasons.push("containment_not_fail_closed");
  if (plan.network_activity !== "not_performed") reasons.push("network_activity_unsafe");
  if (plan.independent_sweep_trigger !== "schedule" && plan.independent_sweep_trigger !== "workflow_dispatch") reasons.push("independent_sweep_trigger_unsafe");
  if (!hasExactlyDataKeys(plan.identity_requirement, IDENTITY_KEYS)) {
    reasons.push("identity_requirement_invalid");
  } else {
    const identity = plan.identity_requirement;
    if (identity.identity_class !== "dedicated_fine_grained_read_only" || identity.token_handling !== "injected_one_shot_not_returned") reasons.push("identity_requirement_invalid");
    if (!hasExactlyDataKeys(identity.permissions, PERMISSION_KEYS) || identity.permissions.actions !== "read" || identity.permissions.administration !== "read" || identity.permissions.metadata !== "read") reasons.push("identity_permissions_not_read_only");
  }
  if (reasons.length > 0) return result("not_admitted_github_read_plan_mismatch", reasons);

  const bundle: NormalizedWhyMoveSecEdgarExternalReadEvidenceBundle = evidence.validated_evidence_bundle;
  return result(
    "github_evidence_read_plan_locally_shaped_not_authorized_not_executed",
    [],
    freeze({
      plan_id: planId,
      github_repository: "willyvalentin/trade",
      protected_branch: "main",
      required_check: "provider-free-verification",
      evidence_bundle_id: bundle.evidence_bundle_id,
      execution_scope_id: bundle.execution_scope_id,
      operator_record_id: bundle.operator_record_id,
      containment: "cancel_before_network_on_missing_or_mismatched_evidence",
      network_activity: "not_performed",
      identity_requirement: freeze({
        identity_class: "dedicated_fine_grained_read_only",
        permissions: freeze({ actions: "read", administration: "read", metadata: "read" }),
        token_handling: "injected_one_shot_not_returned",
      }),
      planned_readbacks: makeReadbacks(plan),
    }),
  );
}
