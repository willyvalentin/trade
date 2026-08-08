import { createHash } from "node:crypto";

type PredicateKind =
  | "not_equal"
  | "immutable_binding"
  | "receipt_binding"
  | "equal"
  | "ordered_time"
  | "future_time"
  | "deadline"
  | "enum_not"
  | "boolean_false"
  | "enum_equal";

type PrecedenceRow = Readonly<{
  operation: "transition";
  ordinal: number;
  predicate_id: string;
  predicate_kind: PredicateKind;
  fact_dependencies: readonly string[];
  result_code: string;
  result_schema: "result_error";
  first_error: true;
}>;

type ProjectionSegment = Readonly<{
  segment_id: string;
  source_path: string;
  canonical_encoding: "utf8-nfc-no-nul-length-prefixed-v1";
  expected_operation: "SHA-256" | "HMAC-SHA-256";
  remediated_gap: boolean;
}>;

type Projection = Readonly<{
  projection_id: "binding" | "provenance";
  schema_id: "binding" | "provenance";
  frame: string;
  version: string;
  algorithm: "SHA-256" | "HMAC-SHA-256";
  key_selection_rule: "none" | "by_key_id_segment";
  key_domain?: "provenance_hmac";
  key_id_segment?: "key_id";
  segments: readonly ProjectionSegment[];
}>;

type RuntimeFieldRule = Readonly<{
  kind: "canonical_string" | "base64url_sha256" | "safe_integer" | "boolean" | "enum";
  values?: readonly string[];
}>;

type RuntimeRecordSchema = Readonly<{
  prototype: "Object.prototype";
  exact_own_enumerable_data_fields: readonly string[];
  fields: Readonly<Record<string, RuntimeFieldRule | { schema: string }>>;
}>;

const deepFreeze = <T>(value: T): T => {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const key of Reflect.ownKeys(value)) deepFreeze(Reflect.get(value, key));
  return Object.freeze(value);
};

const rows: readonly PrecedenceRow[] = [
  { operation: "transition", ordinal: 10, predicate_id: "predecessor", predicate_kind: "not_equal", fact_dependencies: ["predecessor.claims_digest", "literal:claims-ok"], result_code: "predecessor_invalid", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 20, predicate_id: "successor", predicate_kind: "immutable_binding", fact_dependencies: ["predecessor.session_id", "predecessor.principal_id", "predecessor.registry_version", "predecessor.protocol_version", "successor.session_id", "successor.principal_id", "successor.registry_version", "successor.protocol_version"], result_code: "successor_invalid", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 30, predicate_id: "receipt", predicate_kind: "receipt_binding", fact_dependencies: ["receipt.predecessor_session_id", "receipt.successor_session_id", "predecessor.session_id", "successor.session_id"], result_code: "receipt_invalid", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 40, predicate_id: "snapshot_binding", predicate_kind: "equal", fact_dependencies: ["predecessor.snapshot_id", "successor.snapshot_id"], result_code: "snapshot_binding_mismatch", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 45, predicate_id: "registry_metadata", predicate_kind: "boolean_false", fact_dependencies: ["predecessor.registry_metadata_valid"], result_code: "registry_metadata_invalid", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 50, predicate_id: "time_equation", predicate_kind: "ordered_time", fact_dependencies: ["successor.issued_at", "successor.expires_at"], result_code: "time_equation_invalid", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 60, predicate_id: "future_time", predicate_kind: "future_time", fact_dependencies: ["successor.issued_at", "now"], result_code: "future_time_invalid", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 70, predicate_id: "registry_snapshot_expiry", predicate_kind: "deadline", fact_dependencies: ["now", "predecessor.registry_snapshot_expires_at"], result_code: "registry_snapshot_expired", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 80, predicate_id: "family_expiry", predicate_kind: "deadline", fact_dependencies: ["now", "predecessor.family_expires_at"], result_code: "family_expired", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 90, predicate_id: "idle_expiry", predicate_kind: "deadline", fact_dependencies: ["now", "predecessor.idle_expires_at"], result_code: "idle_expired", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 100, predicate_id: "handle_expiry", predicate_kind: "deadline", fact_dependencies: ["now", "predecessor.handle_expires_at"], result_code: "handle_expired", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 110, predicate_id: "key_availability", predicate_kind: "enum_not", fact_dependencies: ["predecessor.key_status", "literal:available"], result_code: "key_unavailable", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 120, predicate_id: "hmac_integrity", predicate_kind: "boolean_false", fact_dependencies: ["predecessor.evidence.hmac_valid"], result_code: "hmac_mismatch", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 130, predicate_id: "principal_revocation", predicate_kind: "enum_equal", fact_dependencies: ["predecessor.principal_status", "literal:revoked"], result_code: "principal_revoked", result_schema: "result_error", first_error: true },
  { operation: "transition", ordinal: 140, predicate_id: "rotation_grace", predicate_kind: "deadline", fact_dependencies: ["now", "receipt.rotation_grace_until"], result_code: "rotation_grace_expired", result_schema: "result_error", first_error: true },
];

const segment = (
  segment_id: string,
  source_path: string,
  remediated_gap: boolean,
  expected_operation: ProjectionSegment["expected_operation"],
): ProjectionSegment => ({
  segment_id,
  source_path,
  canonical_encoding: "utf8-nfc-no-nul-length-prefixed-v1",
  expected_operation,
  remediated_gap,
});

const projections: readonly Projection[] = [
  {
    projection_id: "binding", schema_id: "binding", frame: "trade.session.v2.binding.v2", version: "session-v2-binding-snapshot-v2", algorithm: "SHA-256", key_selection_rule: "none",
    segments: [segment("binding_version", "binding.binding_version", true, "SHA-256"), segment("session_id", "binding.session_id", false, "SHA-256"), segment("principal_id", "binding.principal_id", true, "SHA-256"), segment("registry_version", "binding.registry_version", false, "SHA-256"), segment("snapshot_id", "binding.snapshot_id", false, "SHA-256"), segment("claims_digest", "binding.claims_digest", true, "SHA-256"), segment("expires_at", "binding.expires_at", true, "SHA-256"), segment("key_id", "binding.key_id", true, "SHA-256")],
  },
  {
    projection_id: "provenance", schema_id: "provenance", frame: "trade.session.v2.provenance.v2", version: "session-v2-provenance-snapshot-v2", algorithm: "HMAC-SHA-256", key_selection_rule: "by_key_id_segment", key_domain: "provenance_hmac", key_id_segment: "key_id",
    segments: [segment("provenance_version", "provenance.provenance_version", true, "HMAC-SHA-256"), segment("snapshot_id", "provenance.snapshot_id", false, "HMAC-SHA-256"), segment("provenance_id", "provenance.provenance_id", false, "HMAC-SHA-256"), segment("registry_version", "provenance.registry_version", false, "HMAC-SHA-256"), segment("key_id", "provenance.key_id", false, "HMAC-SHA-256"), segment("principal_id", "provenance.principal_id", true, "HMAC-SHA-256"), segment("binding_digest", "provenance.binding_digest", true, "HMAC-SHA-256")],
  },
];

const transitionSchemas: Readonly<Record<string, RuntimeRecordSchema>> = {
  transition_root: {
    prototype: "Object.prototype",
    exact_own_enumerable_data_fields: ["now", "predecessor", "successor", "receipt"],
    fields: {
      now: { kind: "safe_integer" }, predecessor: { schema: "transition_predecessor" },
      successor: { schema: "transition_successor" }, receipt: { schema: "transition_receipt" },
    },
  },
  transition_predecessor: {
    prototype: "Object.prototype",
    exact_own_enumerable_data_fields: ["session_id", "principal_id", "registry_version", "protocol_version", "claims_digest", "snapshot_id", "registry_metadata_valid", "registry_snapshot_expires_at", "family_expires_at", "idle_expires_at", "handle_expires_at", "key_status", "principal_status", "evidence"],
    fields: {
      session_id: { kind: "canonical_string" }, principal_id: { kind: "canonical_string" }, registry_version: { kind: "canonical_string" },
      protocol_version: { kind: "enum", values: ["v2"] }, claims_digest: { kind: "canonical_string" }, snapshot_id: { kind: "canonical_string" },
      registry_metadata_valid: { kind: "boolean" }, registry_snapshot_expires_at: { kind: "safe_integer" }, family_expires_at: { kind: "safe_integer" },
      idle_expires_at: { kind: "safe_integer" }, handle_expires_at: { kind: "safe_integer" }, key_status: { kind: "enum", values: ["available", "unavailable"] },
      principal_status: { kind: "enum", values: ["active", "revoked"] }, evidence: { schema: "transition_evidence" },
    },
  },
  transition_evidence: {
    prototype: "Object.prototype",
    exact_own_enumerable_data_fields: ["hmac_valid"],
    fields: { hmac_valid: { kind: "boolean" } },
  },
  transition_successor: {
    prototype: "Object.prototype",
    exact_own_enumerable_data_fields: ["session_id", "principal_id", "registry_version", "protocol_version", "snapshot_id", "issued_at", "expires_at"],
    fields: {
      session_id: { kind: "canonical_string" }, principal_id: { kind: "canonical_string" }, registry_version: { kind: "canonical_string" },
      protocol_version: { kind: "enum", values: ["v2"] }, snapshot_id: { kind: "canonical_string" }, issued_at: { kind: "safe_integer" }, expires_at: { kind: "safe_integer" },
    },
  },
  transition_receipt: {
    prototype: "Object.prototype",
    exact_own_enumerable_data_fields: ["predecessor_session_id", "successor_session_id", "rotation_grace_until"],
    fields: {
      predecessor_session_id: { kind: "canonical_string" }, successor_session_id: { kind: "canonical_string" }, rotation_grace_until: { kind: "safe_integer" },
    },
  },
};

const cryptoSchemas: Readonly<Record<string, RuntimeRecordSchema>> = {
  crypto_root: {
    prototype: "Object.prototype",
    exact_own_enumerable_data_fields: ["binding", "provenance"],
    fields: { binding: { schema: "binding" }, provenance: { schema: "provenance" } },
  },
  binding: {
    prototype: "Object.prototype",
    exact_own_enumerable_data_fields: ["binding_version", "session_id", "principal_id", "registry_version", "snapshot_id", "claims_digest", "expires_at", "key_id"],
    fields: {
      binding_version: { kind: "canonical_string" }, session_id: { kind: "canonical_string" }, principal_id: { kind: "canonical_string" },
      registry_version: { kind: "canonical_string" }, snapshot_id: { kind: "canonical_string" }, claims_digest: { kind: "base64url_sha256" },
      expires_at: { kind: "canonical_string" }, key_id: { kind: "canonical_string" },
    },
  },
  provenance: {
    prototype: "Object.prototype",
    exact_own_enumerable_data_fields: ["provenance_version", "snapshot_id", "provenance_id", "registry_version", "key_id", "principal_id", "binding_digest"],
    fields: {
      provenance_version: { kind: "canonical_string" }, snapshot_id: { kind: "canonical_string" }, provenance_id: { kind: "canonical_string" },
      registry_version: { kind: "canonical_string" }, key_id: { kind: "canonical_string" }, principal_id: { kind: "canonical_string" },
      binding_digest: { kind: "base64url_sha256" },
    },
  },
};

export const SESSION_V2_CONTRACT = deepFreeze({
  protocol: "trade.session.v2",
  version: "v2",
  authority: "external_r10_r10_1_bound_source_candidate",
  r10_bindings: {
    formal_precedence_registry_sha256: "7cc1ef133f7ac2d7befb4e1282f85ec5e274030fe8cdd945773457a26e24a2d6",
    crypto_projection_registry_sha256: "3f3d24ad52df951643a1e4ac9a803113b96fffc94c8b6a3b11f3a054235a0814",
  },
  default_off: true,
  closed_predicate_kind_set: ["not_equal", "immutable_binding", "receipt_binding", "equal", "ordered_time", "future_time", "deadline", "enum_not", "boolean_false", "enum_equal"] as const,
  precedence: { operation: "transition" as const, selection: "lowest_ordinal_among_failed_registry_predicates", rows },
  runtime_schemas: { transition: transitionSchemas, crypto: cryptoSchemas },
  crypto: {
    canonical_encoding: "utf8-nfc-no-nul-length-prefixed-v1" as const,
    required_segment_order: {
      binding: ["binding_version", "session_id", "principal_id", "registry_version", "snapshot_id", "claims_digest", "expires_at", "key_id"],
      provenance: ["provenance_version", "snapshot_id", "provenance_id", "registry_version", "key_id", "principal_id", "binding_digest"],
    },
    projections,
    materialization_stages: ["exact_schema", "binding_sha256", "binding_digest_equality", "runtime_key_copy", "provenance_hmac", "opaque_authority_emission"] as const,
    runtime_key_boundary: "exact_same_realm_uint8array_32_guarded_copy" as const,
  },
});

export const candidateContractDigest = createHash("sha256")
  .update(JSON.stringify(SESSION_V2_CONTRACT))
  .digest("hex");
