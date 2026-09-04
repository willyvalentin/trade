import "server-only";

export const B03_STAGING_ADMISSION_ATTESTATION_CANDIDATE_VERSION =
  "b03_staging_admission_attestation_candidate_v1" as const;

const INPUT_FIELDS = Object.freeze([
  "attestation_version",
  "private_transport_criteria_reference",
  "protected_material_provenance_reference",
  "rollback_containment_plan_reference",
  "staging_principal_reference",
  "staging_scope_reference",
  "target_environment",
  "writer_grant_matrix_reference",
] as const);

const REFERENCE_PREFIXES = Object.freeze({
  private_transport_criteria_reference: "private_transport_criteria_ref",
  protected_material_provenance_reference: "material_provenance_ref",
  rollback_containment_plan_reference: "rollback_containment_plan_ref",
  staging_principal_reference: "staging_principal_ref",
  staging_scope_reference: "staging_scope_ref",
  writer_grant_matrix_reference: "writer_grant_matrix_ref",
});

type ReferenceField = keyof typeof REFERENCE_PREFIXES;

export type B03StagingAdmissionAttestationCandidate = Readonly<{
  attestation_version: typeof B03_STAGING_ADMISSION_ATTESTATION_CANDIDATE_VERSION;
  authority: Readonly<{
    production: "not_authorized";
    remote_connection: "not_authorized";
    runtime_binding: "not_authorized";
    writer_invocation: "not_authorized";
  }>;
  private_transport_criteria_reference: string;
  protected_material_provenance_reference: string;
  remote_staging_admission: "not_admitted";
  review_status: "candidate_requires_independent_review";
  rollback_containment_plan_reference: string;
  staging_principal_reference: string;
  staging_scope_reference: string;
  target_environment: "staging";
  writer_grant_matrix_reference: string;
}>;

export class B03StagingAdmissionAttestationCandidateError extends Error {
  constructor() {
    super("invalid_b03_staging_admission_attestation_candidate");
    this.name = "B03StagingAdmissionAttestationCandidateError";
  }
}

function reject(): never {
  throw new B03StagingAdmissionAttestationCandidateError();
}

function isExactPlainRecord(value: unknown): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype;
}

function readExactValues(
  value: unknown,
  fields: readonly string[],
): ReadonlyMap<string, unknown> {
  if (!isExactPlainRecord(value)) return reject();

  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== fields.length ||
    keys.some((key) => typeof key !== "string") ||
    [...keys].sort().some((key, index) => key !== fields[index])
  ) {
    return reject();
  }

  const values = new Map<string, unknown>();
  for (const field of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
      return reject();
    }
    values.set(field, descriptor.value);
  }

  return values;
}

function requireOpaqueReference(value: unknown, field: ReferenceField): string {
  const prefix = REFERENCE_PREFIXES[field];
  const pattern = new RegExp(`^${prefix}:ref_[a-z0-9]{12,64}$`);

  if (typeof value !== "string" || !pattern.test(value)) return reject();
  return value;
}

/**
 * Validates a value-free candidate for the five B-03 remote-admission inputs.
 * It deliberately accepts opaque references only and permanently returns a
 * non-admission result: a separate independent review is required before any
 * staging connection, writer invocation, runtime binding, or production work.
 */
export function createB03StagingAdmissionAttestationCandidate(
  input: unknown,
): B03StagingAdmissionAttestationCandidate {
  try {
    const values = readExactValues(input, INPUT_FIELDS);

    if (
      values.get("attestation_version") !==
        B03_STAGING_ADMISSION_ATTESTATION_CANDIDATE_VERSION ||
      values.get("target_environment") !== "staging"
    ) {
      return reject();
    }

    return Object.freeze({
      attestation_version: B03_STAGING_ADMISSION_ATTESTATION_CANDIDATE_VERSION,
      authority: Object.freeze({
        production: "not_authorized" as const,
        remote_connection: "not_authorized" as const,
        runtime_binding: "not_authorized" as const,
        writer_invocation: "not_authorized" as const,
      }),
      private_transport_criteria_reference: requireOpaqueReference(
        values.get("private_transport_criteria_reference"),
        "private_transport_criteria_reference",
      ),
      protected_material_provenance_reference: requireOpaqueReference(
        values.get("protected_material_provenance_reference"),
        "protected_material_provenance_reference",
      ),
      remote_staging_admission: "not_admitted" as const,
      review_status: "candidate_requires_independent_review" as const,
      rollback_containment_plan_reference: requireOpaqueReference(
        values.get("rollback_containment_plan_reference"),
        "rollback_containment_plan_reference",
      ),
      staging_principal_reference: requireOpaqueReference(
        values.get("staging_principal_reference"),
        "staging_principal_reference",
      ),
      staging_scope_reference: requireOpaqueReference(
        values.get("staging_scope_reference"),
        "staging_scope_reference",
      ),
      target_environment: "staging" as const,
      writer_grant_matrix_reference: requireOpaqueReference(
        values.get("writer_grant_matrix_reference"),
        "writer_grant_matrix_reference",
      ),
    });
  } catch {
    return reject();
  }
}
