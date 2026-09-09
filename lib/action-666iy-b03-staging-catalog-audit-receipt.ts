export const ACTION_666IY_B03_STAGING_CATALOG_AUDIT_RECEIPT_VERSION =
  "action_666iy_b03_staging_catalog_audit_receipt_v1" as const;

export type Action666iyB03StagingCatalogAuditObservation = Readonly<{
  private_schema_present: boolean;
  writer_routine_present: boolean;
  writer_routine_security_definer: boolean;
  idempotency_relation_present: boolean;
  idempotency_relation_rls_enabled: boolean;
  idempotency_relation_has_zero_policies: boolean;
  anon_can_execute_writer: boolean;
  authenticated_can_execute_writer: boolean;
  service_role_can_execute_writer: boolean;
  anon_has_direct_relation_access: boolean;
  authenticated_has_direct_relation_access: boolean;
  service_role_has_direct_relation_access: boolean;
  writer_package_migration_observed: boolean;
  writer_repair_migration_observed: boolean;
  dedicated_writer_role_migration_observed: boolean;
}>;

export type Action666iyB03StagingCatalogAuditReceipt = Readonly<{
  contract_version: typeof ACTION_666IY_B03_STAGING_CATALOG_AUDIT_RECEIPT_VERSION;
  target_environment: "staging";
  project_class: "ture_staging";
  read_operation: "single_read_only_catalog_query";
  observations: Action666iyB03StagingCatalogAuditObservation;
}>;

export type Action666iyB03StagingCatalogAuditResult = Readonly<{
  version: typeof ACTION_666IY_B03_STAGING_CATALOG_AUDIT_RECEIPT_VERSION;
  disposition:
    | "invalid_input"
    | "not_admitted_catalog_receipt_mismatch"
    | "staging_catalog_audit_validated_not_admitted";
  validated_receipt: Action666iyB03StagingCatalogAuditReceipt | null;
  authority: Readonly<{
    may_contact_staging: false;
    may_read_rows_or_secrets: false;
    may_change_identity_or_grants: false;
    may_apply_migration: false;
    may_invoke_writer: false;
    may_bind_runtime: false;
    may_deploy: false;
    may_contact_provider_or_broker: false;
    may_access_production: false;
  }>;
}>;

type PlainDataRecord = Readonly<Record<string, unknown>>;

const RECEIPT_KEYS = [
  "contract_version",
  "observations",
  "project_class",
  "read_operation",
  "target_environment",
] as const;
const OBSERVATION_KEYS = [
  "anon_can_execute_writer",
  "anon_has_direct_relation_access",
  "authenticated_can_execute_writer",
  "authenticated_has_direct_relation_access",
  "dedicated_writer_role_migration_observed",
  "idempotency_relation_has_zero_policies",
  "idempotency_relation_present",
  "idempotency_relation_rls_enabled",
  "private_schema_present",
  "service_role_can_execute_writer",
  "service_role_has_direct_relation_access",
  "writer_package_migration_observed",
  "writer_repair_migration_observed",
  "writer_routine_present",
  "writer_routine_security_definer",
] as const;

const AUTHORITY = Object.freeze({
  may_contact_staging: false,
  may_read_rows_or_secrets: false,
  may_change_identity_or_grants: false,
  may_apply_migration: false,
  may_invoke_writer: false,
  may_bind_runtime: false,
  may_deploy: false,
  may_contact_provider_or_broker: false,
  may_access_production: false,
});

function hasExactlyDataKeys(
  value: unknown,
  expectedKeys: readonly string[],
): value is PlainDataRecord {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }
    if (Object.getPrototypeOf(value) !== Object.prototype) return false;
    if (Object.getOwnPropertySymbols(value).length > 0) return false;

    const actualKeys = Object.getOwnPropertyNames(value).sort();
    const sortedExpected = [...expectedKeys].sort();
    if (
      actualKeys.length !== sortedExpected.length ||
      actualKeys.some((key, index) => key !== sortedExpected[index])
    ) {
      return false;
    }

    return actualKeys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return descriptor !== undefined && "value" in descriptor;
    });
  } catch {
    return false;
  }
}

function isExpectedObservation(
  value: PlainDataRecord,
): value is Action666iyB03StagingCatalogAuditObservation {
  if (!hasExactlyDataKeys(value, OBSERVATION_KEYS)) return false;

  return (
    value.private_schema_present === true &&
    value.writer_routine_present === true &&
    value.writer_routine_security_definer === true &&
    value.idempotency_relation_present === true &&
    value.idempotency_relation_rls_enabled === true &&
    value.idempotency_relation_has_zero_policies === true &&
    value.anon_can_execute_writer === false &&
    value.authenticated_can_execute_writer === false &&
    value.service_role_can_execute_writer === true &&
    value.anon_has_direct_relation_access === false &&
    value.authenticated_has_direct_relation_access === false &&
    value.service_role_has_direct_relation_access === false &&
    value.writer_package_migration_observed === true &&
    value.writer_repair_migration_observed === true &&
    value.dedicated_writer_role_migration_observed === true
  );
}

function result(
  disposition: Action666iyB03StagingCatalogAuditResult["disposition"],
  receipt: Action666iyB03StagingCatalogAuditReceipt | null = null,
): Action666iyB03StagingCatalogAuditResult {
  return Object.freeze({
    version: ACTION_666IY_B03_STAGING_CATALOG_AUDIT_RECEIPT_VERSION,
    disposition,
    validated_receipt:
      receipt === null
        ? null
        : Object.freeze({
            ...receipt,
            observations: Object.freeze({ ...receipt.observations }),
          }),
    authority: AUTHORITY,
  });
}

/**
 * Validates caller-supplied, value-free catalog booleans from exactly one
 * staging read. It performs no database, environment, network or runtime I/O
 * and never converts a valid receipt into writer or runtime authority.
 */
export function validateAction666iyB03StagingCatalogAuditReceipt(
  input: unknown,
): Action666iyB03StagingCatalogAuditResult {
  if (!hasExactlyDataKeys(input, RECEIPT_KEYS)) {
    return result("invalid_input");
  }
  if (!hasExactlyDataKeys(input.observations, OBSERVATION_KEYS)) {
    return result("invalid_input");
  }
  if (
    input.contract_version !==
      ACTION_666IY_B03_STAGING_CATALOG_AUDIT_RECEIPT_VERSION ||
    input.target_environment !== "staging" ||
    input.project_class !== "ture_staging" ||
    input.read_operation !== "single_read_only_catalog_query"
  ) {
    return result("not_admitted_catalog_receipt_mismatch");
  }
  if (!isExpectedObservation(input.observations)) {
    return result("not_admitted_catalog_receipt_mismatch");
  }

  return result("staging_catalog_audit_validated_not_admitted", {
    contract_version: ACTION_666IY_B03_STAGING_CATALOG_AUDIT_RECEIPT_VERSION,
    target_environment: "staging",
    project_class: "ture_staging",
    read_operation: "single_read_only_catalog_query",
    observations: input.observations,
  });
}
