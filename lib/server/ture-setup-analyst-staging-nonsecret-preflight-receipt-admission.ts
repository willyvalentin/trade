import "server-only";

/**
 * AI-02.15 validates a minimized, caller-supplied receipt shape for a future
 * staging nonsecret preflight. It has no environment, identity-provider,
 * Netlify, Supabase or provider dependency, and a valid receipt authorizes
 * neither the preflight nor a subsequent one-shot operation.
 */
export const TURE_SETUP_ANALYST_STAGING_NONSECRET_PREFLIGHT_RECEIPT_ADMISSION_VERSION =
  "ture_setup_analyst_staging_nonsecret_preflight_receipt_admission_v1" as const;

export type TureSetupAnalystStagingNonsecretPreflightReceiptAdmissionAuthority =
  Readonly<{
    mode: "server_only_staging_nonsecret_preflight_receipt_admission";
    may_access_staging: false;
    may_access_production: false;
    may_access_secrets: false;
    may_perform_io: false;
    may_read_source_rows: false;
    may_read_credential_values: false;
    may_read_credential_names: false;
    may_read_application_owner_identifier: false;
    may_read_deploy_identifier_or_url: false;
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

export const TURE_SETUP_ANALYST_STAGING_NONSECRET_PREFLIGHT_RECEIPT_ADMISSION_AUTHORITY: TureSetupAnalystStagingNonsecretPreflightReceiptAdmissionAuthority =
  Object.freeze({
    mode: "server_only_staging_nonsecret_preflight_receipt_admission",
    may_access_staging: false,
    may_access_production: false,
    may_access_secrets: false,
    may_perform_io: false,
    may_read_source_rows: false,
    may_read_credential_values: false,
    may_read_credential_names: false,
    may_read_application_owner_identifier: false,
    may_read_deploy_identifier_or_url: false,
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

export type AdmitTureSetupAnalystStagingNonsecretPreflightReceiptInput =
  Readonly<{
    receipt: Readonly<{
      environment: "staging";
      source_relation: "public.recommendation_outcomes";
      existing_source_availability: "no_completed_bundle_available";
      credential_presence: "present" | "absent";
      application_owner_preflight: "confirmed" | "not_confirmed";
      deploy_preview_transport: "available" | "unavailable";
      credential_values: "not_returned";
      credential_names: "not_returned";
      application_owner_identifier: "not_returned";
      deploy_identifier_or_url: "not_returned";
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

export type TureSetupAnalystStagingNonsecretPreflightReceiptAdmission =
  Readonly<{
    admission_version: typeof TURE_SETUP_ANALYST_STAGING_NONSECRET_PREFLIGHT_RECEIPT_ADMISSION_VERSION;
    mode: "server_only_staging_nonsecret_preflight_receipt_admission";
    admission_status: "nonsecret_preflight_receipt_validated_not_authorized_not_executed";
    minimized_observation: Readonly<{
      environment: "staging";
      credential_presence: "present" | "absent";
      application_owner_preflight: "confirmed" | "not_confirmed";
      deploy_preview_transport: "available" | "unavailable";
    }>;
    required_redactions: readonly [
      "credential_values_not_returned",
      "credential_names_not_returned",
      "application_owner_identifier_not_returned",
      "deploy_identifier_or_url_not_returned",
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
    next_gate: "separately_authorized_staging_one_shot_adapter_preparation_after_minimized_preflight_review";
    authority: TureSetupAnalystStagingNonsecretPreflightReceiptAdmissionAuthority;
  }>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["receipt"] as const;
const receiptKeys = [
  "active_evidence_migration",
  "active_evidence_write",
  "application_owner_identifier",
  "application_owner_preflight",
  "branch_adapter",
  "broker_binding",
  "credential_names",
  "credential_presence",
  "credential_values",
  "deploy_identifier_or_url",
  "deploy_preview_transport",
  "environment",
  "existing_source_availability",
  "offline_dataset",
  "offline_evaluation",
  "outcome_persistence",
  "production_binding",
  "provider_evaluator",
  "runtime_binding",
  "source_relation",
  "source_rows",
  "staging_connection",
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

function hasRequiredReceiptShape(value: unknown): boolean {
  if (!hasExactOwnDataKeys(value, receiptKeys)) return false;

  const credentialPresence = ownData(value, "credential_presence");
  const ownerPreflight = ownData(value, "application_owner_preflight");
  const transport = ownData(value, "deploy_preview_transport");

  return (
    ownData(value, "environment") === "staging" &&
    ownData(value, "source_relation") === "public.recommendation_outcomes" &&
    ownData(value, "existing_source_availability") ===
      "no_completed_bundle_available" &&
    (credentialPresence === "present" || credentialPresence === "absent") &&
    (ownerPreflight === "confirmed" || ownerPreflight === "not_confirmed") &&
    (transport === "available" || transport === "unavailable") &&
    ownData(value, "credential_values") === "not_returned" &&
    ownData(value, "credential_names") === "not_returned" &&
    ownData(value, "application_owner_identifier") === "not_returned" &&
    ownData(value, "deploy_identifier_or_url") === "not_returned" &&
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

export function admitTureSetupAnalystStagingNonsecretPreflightReceipt(
  input: AdmitTureSetupAnalystStagingNonsecretPreflightReceiptInput,
): TureSetupAnalystStagingNonsecretPreflightReceiptAdmission {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError(
      "Invalid Ture Setup Analyst staging nonsecret preflight receipt admission input.",
    );
  }
  const receipt = ownData(input, "receipt");
  if (!hasRequiredReceiptShape(receipt)) {
    throw new TypeError(
      "Invalid Ture Setup Analyst staging nonsecret preflight receipt admission input.",
    );
  }

  const receiptData = receipt as PlainRecord;
  return Object.freeze({
    admission_version:
      TURE_SETUP_ANALYST_STAGING_NONSECRET_PREFLIGHT_RECEIPT_ADMISSION_VERSION,
    mode: "server_only_staging_nonsecret_preflight_receipt_admission",
    admission_status:
      "nonsecret_preflight_receipt_validated_not_authorized_not_executed",
    minimized_observation: Object.freeze({
      environment: "staging",
      credential_presence: ownData(receiptData, "credential_presence") as
        | "present"
        | "absent",
      application_owner_preflight: ownData(
        receiptData,
        "application_owner_preflight",
      ) as "confirmed" | "not_confirmed",
      deploy_preview_transport: ownData(receiptData, "deploy_preview_transport") as
        | "available"
        | "unavailable",
    }),
    required_redactions: Object.freeze([
      "credential_values_not_returned",
      "credential_names_not_returned",
      "application_owner_identifier_not_returned",
      "deploy_identifier_or_url_not_returned",
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
    next_gate:
      "separately_authorized_staging_one_shot_adapter_preparation_after_minimized_preflight_review",
    authority:
      TURE_SETUP_ANALYST_STAGING_NONSECRET_PREFLIGHT_RECEIPT_ADMISSION_AUTHORITY,
  });
}
