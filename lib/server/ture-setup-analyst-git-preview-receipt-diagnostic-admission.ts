import "server-only";

/**
 * AI-02.16 freezes the only safe shape of a future diagnostic for a missing
 * deploy-preview receipt. It validates an in-memory plan only: it does not
 * inspect a deploy, read a credential, invoke an endpoint or open staging.
 */
export const TURE_SETUP_ANALYST_GIT_PREVIEW_RECEIPT_DIAGNOSTIC_ADMISSION_VERSION =
  "ture_setup_analyst_git_preview_receipt_diagnostic_admission_v1" as const;

export type TureSetupAnalystGitPreviewReceiptDiagnosticAdmissionAuthority =
  Readonly<{
    mode: "server_only_git_preview_receipt_diagnostic_admission";
    may_access_staging: false;
    may_access_production: false;
    may_access_secrets: false;
    may_perform_io: false;
    may_read_source_rows: false;
    may_read_credential_values: false;
    may_read_credential_names: false;
    may_read_application_owner_identifier: false;
    may_read_deploy_identifier_or_url: false;
    may_read_response_body: false;
    may_read_response_headers: false;
    may_invoke_provider: false;
    may_invoke_evaluator: false;
    may_deploy_branch_adapter: false;
    may_persist_recommendation_outcome: false;
    may_apply_active_evidence_migration: false;
    may_write_active_evidence: false;
    may_form_offline_dataset: false;
    may_run_offline_evaluation: false;
    may_bind_runtime: false;
    may_place_or_cancel_orders: false;
    may_submit_broker_instructions: false;
  }>;

export const TURE_SETUP_ANALYST_GIT_PREVIEW_RECEIPT_DIAGNOSTIC_ADMISSION_AUTHORITY: TureSetupAnalystGitPreviewReceiptDiagnosticAdmissionAuthority =
  Object.freeze({
    mode: "server_only_git_preview_receipt_diagnostic_admission",
    may_access_staging: false,
    may_access_production: false,
    may_access_secrets: false,
    may_perform_io: false,
    may_read_source_rows: false,
    may_read_credential_values: false,
    may_read_credential_names: false,
    may_read_application_owner_identifier: false,
    may_read_deploy_identifier_or_url: false,
    may_read_response_body: false,
    may_read_response_headers: false,
    may_invoke_provider: false,
    may_invoke_evaluator: false,
    may_deploy_branch_adapter: false,
    may_persist_recommendation_outcome: false,
    may_apply_active_evidence_migration: false,
    may_write_active_evidence: false,
    may_form_offline_dataset: false,
    may_run_offline_evaluation: false,
    may_bind_runtime: false,
    may_place_or_cancel_orders: false,
    may_submit_broker_instructions: false,
  });

export type AdmitTureSetupAnalystGitPreviewReceiptDiagnosticInput = Readonly<{
  plan: Readonly<{
    environment: "staging";
    transport: "git_deploy_preview";
    diagnostic_operation: "token_protected_response_status_only";
    request_method: "GET";
    maximum_request_count: 1;
    response_status_observation: "not_observed";
    receipt_shape_observation: "not_observed";
    credential_values: "not_returned";
    credential_names: "not_returned";
    application_owner_identifier: "not_returned";
    deploy_identifier_or_url: "not_returned";
    response_body: "not_returned";
    response_headers: "not_returned";
    source_rows: "not_returned";
    staging_connection: "not_opened";
    provider_evaluator: "not_invoked";
    branch_adapter: "not_deployed";
    outcome_persistence: "not_admitted";
    active_evidence_migration: "not_admitted";
    active_evidence_write: "not_admitted";
    offline_dataset: "not_admitted";
    offline_evaluation: "not_admitted";
    runtime_binding: "not_admitted";
    broker_binding: "not_admitted";
    production_binding: "not_admitted";
  }>;
}>;

export type TureSetupAnalystGitPreviewReceiptDiagnosticAdmission = Readonly<{
  admission_version: typeof TURE_SETUP_ANALYST_GIT_PREVIEW_RECEIPT_DIAGNOSTIC_ADMISSION_VERSION;
  mode: "server_only_git_preview_receipt_diagnostic_admission";
  admission_status: "git_preview_receipt_diagnostic_plan_validated_not_authorized_not_executed";
  minimized_plan: Readonly<{
    environment: "staging";
    transport: "git_deploy_preview";
    diagnostic_operation: "token_protected_response_status_only";
    request_method: "GET";
    maximum_request_count: 1;
  }>;
  permitted_future_observations: readonly [
    "response_status_class_only",
    "receipt_shape_only",
  ];
  required_redactions: readonly [
    "credential_values_not_returned",
    "credential_names_not_returned",
    "application_owner_identifier_not_returned",
    "deploy_identifier_or_url_not_returned",
    "response_body_not_returned",
    "response_headers_not_returned",
    "source_rows_not_returned",
  ];
  excluded_authority: readonly [
    "staging_connection",
    "provider_invocation",
    "evaluator_invocation",
    "branch_adapter_deploy",
    "recommendation_outcome_persistence",
    "active_evidence_migration",
    "active_evidence_write",
    "offline_dataset",
    "offline_evaluation",
    "runtime",
    "broker",
    "production",
  ];
  next_gate: "separately_authorized_read_only_git_preview_receipt_diagnostic";
  authority: TureSetupAnalystGitPreviewReceiptDiagnosticAdmissionAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["plan"] as const;
const planKeys = [
  "active_evidence_migration",
  "active_evidence_write",
  "application_owner_identifier",
  "branch_adapter",
  "broker_binding",
  "credential_names",
  "credential_values",
  "deploy_identifier_or_url",
  "diagnostic_operation",
  "environment",
  "maximum_request_count",
  "offline_dataset",
  "offline_evaluation",
  "outcome_persistence",
  "production_binding",
  "provider_evaluator",
  "receipt_shape_observation",
  "request_method",
  "response_body",
  "response_headers",
  "response_status_observation",
  "runtime_binding",
  "source_rows",
  "staging_connection",
  "transport",
] as const;

function hasExactOwnDataKeys(
  value: unknown,
  keys: readonly string[],
): value is PlainRecord {
  try {
    if (!value || typeof value !== "object" || !Object.isFrozen(value)) {
      return false;
    }
    if (Object.getPrototypeOf(value) !== Object.prototype) return false;
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key !== "string")) return false;
    if (ownKeys.length !== keys.length) return false;
    if (![...ownKeys].every((key) => keys.includes(key as never))) return false;
    return ownKeys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return Boolean(
        descriptor &&
          descriptor.enumerable &&
          Object.prototype.hasOwnProperty.call(descriptor, "value"),
      );
    });
  } catch {
    return false;
  }
}

function ownData(value: PlainRecord, key: string): unknown {
  return Object.getOwnPropertyDescriptor(value, key)?.value;
}

function hasRequiredPlanShape(value: unknown): boolean {
  if (!hasExactOwnDataKeys(value, planKeys)) return false;

  return (
    ownData(value, "environment") === "staging" &&
    ownData(value, "transport") === "git_deploy_preview" &&
    ownData(value, "diagnostic_operation") ===
      "token_protected_response_status_only" &&
    ownData(value, "request_method") === "GET" &&
    ownData(value, "maximum_request_count") === 1 &&
    ownData(value, "response_status_observation") === "not_observed" &&
    ownData(value, "receipt_shape_observation") === "not_observed" &&
    ownData(value, "credential_values") === "not_returned" &&
    ownData(value, "credential_names") === "not_returned" &&
    ownData(value, "application_owner_identifier") === "not_returned" &&
    ownData(value, "deploy_identifier_or_url") === "not_returned" &&
    ownData(value, "response_body") === "not_returned" &&
    ownData(value, "response_headers") === "not_returned" &&
    ownData(value, "source_rows") === "not_returned" &&
    ownData(value, "staging_connection") === "not_opened" &&
    ownData(value, "provider_evaluator") === "not_invoked" &&
    ownData(value, "branch_adapter") === "not_deployed" &&
    ownData(value, "outcome_persistence") === "not_admitted" &&
    ownData(value, "active_evidence_migration") === "not_admitted" &&
    ownData(value, "active_evidence_write") === "not_admitted" &&
    ownData(value, "offline_dataset") === "not_admitted" &&
    ownData(value, "offline_evaluation") === "not_admitted" &&
    ownData(value, "runtime_binding") === "not_admitted" &&
    ownData(value, "broker_binding") === "not_admitted" &&
    ownData(value, "production_binding") === "not_admitted"
  );
}

export function admitTureSetupAnalystGitPreviewReceiptDiagnostic(
  input: AdmitTureSetupAnalystGitPreviewReceiptDiagnosticInput,
): TureSetupAnalystGitPreviewReceiptDiagnosticAdmission {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError(
      "Invalid Ture Setup Analyst Git preview receipt diagnostic admission input.",
    );
  }
  const plan = ownData(input, "plan");
  if (!hasRequiredPlanShape(plan)) {
    throw new TypeError(
      "Invalid Ture Setup Analyst Git preview receipt diagnostic admission input.",
    );
  }

  return Object.freeze({
    admission_version:
      TURE_SETUP_ANALYST_GIT_PREVIEW_RECEIPT_DIAGNOSTIC_ADMISSION_VERSION,
    mode: "server_only_git_preview_receipt_diagnostic_admission",
    admission_status:
      "git_preview_receipt_diagnostic_plan_validated_not_authorized_not_executed",
    minimized_plan: Object.freeze({
      environment: "staging",
      transport: "git_deploy_preview",
      diagnostic_operation: "token_protected_response_status_only",
      request_method: "GET",
      maximum_request_count: 1,
    }),
    permitted_future_observations: Object.freeze([
      "response_status_class_only",
      "receipt_shape_only",
    ] as const),
    required_redactions: Object.freeze([
      "credential_values_not_returned",
      "credential_names_not_returned",
      "application_owner_identifier_not_returned",
      "deploy_identifier_or_url_not_returned",
      "response_body_not_returned",
      "response_headers_not_returned",
      "source_rows_not_returned",
    ] as const),
    excluded_authority: Object.freeze([
      "staging_connection",
      "provider_invocation",
      "evaluator_invocation",
      "branch_adapter_deploy",
      "recommendation_outcome_persistence",
      "active_evidence_migration",
      "active_evidence_write",
      "offline_dataset",
      "offline_evaluation",
      "runtime",
      "broker",
      "production",
    ] as const),
    next_gate: "separately_authorized_read_only_git_preview_receipt_diagnostic",
    authority:
      TURE_SETUP_ANALYST_GIT_PREVIEW_RECEIPT_DIAGNOSTIC_ADMISSION_AUTHORITY,
  });
}
