import {
  continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
  continuousIntelligenceShadowCanaryManualAuthorizationPurpose,
} from "@/lib/continuous-intelligence-shadow-canary-manual-authorization";
import {
  continuousIntelligenceShadowCanaryManualExecutionLeaseContractVersion,
} from "@/lib/continuous-intelligence-shadow-canary-manual-execution-lease";
import { normalizeContinuousIntelligenceShadowCanaryTimestamp } from "@/lib/continuous-intelligence-shadow-canary-timestamp";

export const continuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponseContractVersion =
  "continuous_intelligence_shadow_canary_manual_authorization_issuance_response_v1" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationIssuanceFailureTerminalStatus =
  "atomic_issuance_failed_before_execution" as const;

export type ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceDiagnosticCode =
  | "issuance_response_schema_mismatch"
  | "issuance_response_version_unsupported"
  | "issuance_response_missing_required_field"
  | "issuance_response_binding_mismatch"
  | "issuance_response_expired"
  | "issuance_response_invalid_timestamp";

export type ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceValidation =
  | {
      ok: true;
      diagnostic_code: null;
      terminal_status: null;
    }
  | {
      ok: false;
      diagnostic_code: ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceDiagnosticCode;
      terminal_status: typeof continuousIntelligenceShadowCanaryManualAuthorizationIssuanceFailureTerminalStatus;
      validation_stage: string;
      failed_fields: readonly string[];
    };

type RecordValue = Record<string, unknown>;

const authorizationTextFields = [
  "authorization_id",
  "request_fingerprint",
  "execution_id",
  "claim_id",
  "ticker",
  "interval",
  "requested_start",
  "requested_end",
  "calendar_contract_version",
  "calendar_fingerprint",
  "budget_policy_version",
  "canary_contract_version",
  "claim_contract_version",
  "deployment_commit",
  "deployment_build_marker",
  "purpose",
] as const;

const leaseTextFields = [
  "execution_lease_id",
  "authorization_id",
  "request_fingerprint",
  "execution_id",
  "claim_id",
  "ticker",
  "interval",
  "requested_start",
  "requested_end",
] as const;

const sharedBindingFields = [
  "authorization_id",
  "request_fingerprint",
  "execution_id",
  "claim_id",
  "ticker",
  "interval",
  "policy_total_credits",
  "policy_hard_reserve_credits",
  "policy_normal_planned_max_credits",
  "estimated_credits",
] as const;

const timestampFields = ["issued_at", "expires_at", "requested_start", "requested_end"] as const;

function record(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as RecordValue
    : null;
}

function failed(
  diagnosticCode: ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceDiagnosticCode,
  validationStage: string,
  failedFields: readonly string[],
): ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceValidation {
  return {
    ok: false,
    diagnostic_code: diagnosticCode,
    terminal_status: continuousIntelligenceShadowCanaryManualAuthorizationIssuanceFailureTerminalStatus,
    validation_stage: validationStage,
    failed_fields: failedFields,
  };
}

function missingFields(value: RecordValue, fields: readonly string[]) {
  return fields.filter((field) => value[field] === undefined);
}

function nonTextFields(value: RecordValue, fields: readonly string[]) {
  return fields.filter((field) => typeof value[field] !== "string" || (value[field] as string).length === 0);
}

function canonicalTimestamp(value: unknown) {
  return typeof value === "string"
    ? normalizeContinuousIntelligenceShadowCanaryTimestamp(value)
    : null;
}

/**
 * Validates the public, sanitized issuance response before an operator can
 * construct the separate canonical execution request. It intentionally checks
 * only fields that the route promises for each object.
 */
export function validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse(input: {
  http_status: number;
  body: unknown;
  now: Date;
  expected: {
    authorization_id: string;
    execution_lease_id: string;
  };
}): ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceValidation {
  if (input.http_status !== 200) {
    return failed("issuance_response_schema_mismatch", "transport_status", ["http_status"]);
  }
  const body = record(input.body);
  if (!body) return failed("issuance_response_schema_mismatch", "response_shape", ["body"]);
  if (body.contract_version !== continuousIntelligenceShadowCanaryManualAuthorizationContractVersion) {
    return failed("issuance_response_version_unsupported", "response_contract", ["contract_version"]);
  }
  const rootRequired = ["issued", "authorization", "execution_lease", "authorization_token", "raw_token_returned_once"];
  const rootMissing = missingFields(body, rootRequired);
  if (rootMissing.length > 0) return failed("issuance_response_missing_required_field", "response_shape", rootMissing);
  if (
    body.issued !== true ||
    body.raw_token_returned_once !== true ||
    typeof body.authorization_token !== "string" ||
    body.authorization_token.length < 32 ||
    body.authorization_token.length > 256 ||
    body.provider_calls_executed !== false ||
    body.claims_created !== false ||
    body.attempts_begun !== false ||
    body.audit_or_ledger_writes_executed !== false
  ) {
    return failed("issuance_response_schema_mismatch", "response_semantics", ["issuance_response"]);
  }
  const authorization = record(body.authorization);
  const lease = record(body.execution_lease);
  if (!authorization || !lease) {
    return failed("issuance_response_schema_mismatch", "credential_pair_shape", ["authorization", "execution_lease"]);
  }
  if (authorization.contract_version !== continuousIntelligenceShadowCanaryManualAuthorizationContractVersion) {
    return failed("issuance_response_version_unsupported", "authorization_contract", ["authorization.contract_version"]);
  }
  if (lease.contract_version !== continuousIntelligenceShadowCanaryManualExecutionLeaseContractVersion) {
    return failed("issuance_response_version_unsupported", "lease_contract", ["execution_lease.contract_version"]);
  }
  const authorizationMissing = missingFields(authorization, authorizationTextFields);
  const leaseMissing = missingFields(lease, leaseTextFields);
  const authorizationTimestampMissing = missingFields(authorization, timestampFields);
  const leaseTimestampMissing = missingFields(lease, timestampFields);
  const policyFields = ["policy_total_credits", "policy_hard_reserve_credits", "policy_normal_planned_max_credits", "estimated_credits"];
  const policyMissing = [
    ...missingFields(authorization, policyFields).map((field) => `authorization.${field}`),
    ...missingFields(lease, policyFields).map((field) => `execution_lease.${field}`),
  ];
  const missing = [
    ...authorizationMissing.map((field) => `authorization.${field}`),
    ...leaseMissing.map((field) => `execution_lease.${field}`),
    ...authorizationTimestampMissing.map((field) => `authorization.${field}`),
    ...leaseTimestampMissing.map((field) => `execution_lease.${field}`),
    ...policyMissing,
  ];
  if (missing.length > 0) return failed("issuance_response_missing_required_field", "credential_pair_required_fields", missing);
  const malformed = [
    ...nonTextFields(authorization, authorizationTextFields).map((field) => `authorization.${field}`),
    ...nonTextFields(lease, leaseTextFields).map((field) => `execution_lease.${field}`),
  ];
  if (malformed.length > 0) return failed("issuance_response_schema_mismatch", "credential_pair_field_types", malformed);
  if (
    typeof input.expected.authorization_id !== "string" ||
    input.expected.authorization_id.length === 0 ||
    typeof input.expected.execution_lease_id !== "string" ||
    input.expected.execution_lease_id.length === 0
  ) {
    return failed("issuance_response_schema_mismatch", "persistence_identity", ["expected"]);
  }
  if (authorization.authorization_id !== input.expected.authorization_id) {
    return failed("issuance_response_binding_mismatch", "authorization_identity", ["authorization_id"]);
  }
  if (lease.execution_lease_id !== input.expected.execution_lease_id) {
    return failed("issuance_response_binding_mismatch", "lease_identity", ["execution_lease_id"]);
  }
  const normalized = new Map<string, string>();
  for (const [owner, value] of [["authorization", authorization], ["execution_lease", lease]] as const) {
    for (const field of timestampFields) {
      const valueAtField = canonicalTimestamp(value[field]);
      if (!valueAtField) return failed("issuance_response_invalid_timestamp", "timestamp_normalization", [`${owner}.${field}`]);
      normalized.set(`${owner}.${field}`, valueAtField);
    }
  }
  const timestampMismatch = timestampFields.filter(
    (field) => normalized.get(`authorization.${field}`) !== normalized.get(`execution_lease.${field}`),
  );
  if (timestampMismatch.length > 0) {
    return failed("issuance_response_binding_mismatch", "timestamp_binding", timestampMismatch);
  }
  const bindingMismatch = sharedBindingFields.filter(
    (field) => authorization[field] !== lease[field],
  );
  if (bindingMismatch.length > 0) {
    return failed("issuance_response_binding_mismatch", "shared_binding", bindingMismatch);
  }
  if (
    authorization.status !== "issued" ||
    lease.status !== "issued" ||
    authorization.consumed_at !== null ||
    lease.consumed_at !== null ||
    authorization.ticker !== "AAPL" ||
    authorization.interval !== "5min" ||
    authorization.purpose !== continuousIntelligenceShadowCanaryManualAuthorizationPurpose ||
    authorization.policy_total_credits !== 377 ||
    authorization.policy_hard_reserve_credits !== 57 ||
    authorization.policy_normal_planned_max_credits !== 320 ||
    authorization.estimated_credits !== 1 ||
    Date.parse(normalized.get("authorization.requested_end")!) - Date.parse(normalized.get("authorization.requested_start")!) !== 30 * 60 * 1000 ||
    Date.parse(normalized.get("authorization.expires_at")!) - Date.parse(normalized.get("authorization.issued_at")!) > 60 * 1000
  ) {
    return failed("issuance_response_binding_mismatch", "bounded_contract", ["credential_pair"]);
  }
  if (Date.parse(normalized.get("authorization.expires_at")!) <= input.now.getTime()) {
    return failed("issuance_response_expired", "credential_ttl", ["authorization.expires_at"]);
  }
  return { ok: true, diagnostic_code: null, terminal_status: null };
}

/**
 * Reproduces the Action 596 operator-side validator defect. The lease response
 * deliberately does not expose deployment_commit, so treating it as a shared
 * response field rejects an otherwise valid issuance response.
 */
export function diagnoseAction596HistoricalIssuanceValidation(input: {
  http_status: number;
  body: unknown;
  now: Date;
  expected: {
    authorization_id: string;
    execution_lease_id: string;
  };
}): ContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceValidation {
  const canonical = validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse(input);
  if (!canonical.ok) return canonical;
  const body = record(input.body)!;
  const authorization = record(body.authorization)!;
  const lease = record(body.execution_lease)!;
  if (authorization.deployment_commit !== lease.deployment_commit) {
    return failed("issuance_response_binding_mismatch", "historical_non_contract_pair_comparison", ["deployment_commit"]);
  }
  return canonical;
}
