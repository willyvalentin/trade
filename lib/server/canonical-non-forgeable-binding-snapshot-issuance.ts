import "server-only";

import { createPublicKey, verify as verifySignature } from "node:crypto";

import {
  CANONICAL_BINDING_BACKED_REPLAY_REQUEST_VERSION,
  CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY,
  CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
  CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
  validateCanonicalBoundedSnapshotPayload,
} from "@/lib/server/canonical-governed-binding-snapshot-admission";
import {
  canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest,
  createCanonicalGovernedBindingSnapshotIssuanceHarness,
  createCanonicalGovernedBindingSnapshotIssuerAuthority,
  verifyCanonicalGovernedBindingSnapshotIssuanceResult,
  type CanonicalGovernedBindingSnapshotIssuanceDependencies,
  type CanonicalGovernedBindingSnapshotIssuanceRequest,
  type CanonicalGovernedBindingSnapshotIssuanceResult,
  type CanonicalGovernedBindingSnapshotIssuerAuthority,
} from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor";
import {
  canonicalModelImprovementDigest,
} from "@/lib/server/canonical-model-improvement-proposal";

export const CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION =
  "canonical_non_forgeable_binding_snapshot_issuance_v2" as const;
export const CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_VERSION =
  "canonical_non_forgeable_issuer_authority_v2" as const;
export const CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION =
  "canonical_non_forgeable_issuer_authority_envelope_v2" as const;
export const CANONICAL_NON_FORGEABLE_NESTED_SCHEMA_VERSION =
  "canonical_non_forgeable_nested_request_schema_v2" as const;
export const CANONICAL_NON_FORGEABLE_INVALID_REQUEST_OBSERVATION_VERSION =
  "canonical_non_forgeable_invalid_request_observation_v2" as const;
export const DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ENABLED =
  false;
export const DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_KILL_SWITCH =
  true;
export const CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_STATUSES = [
  "issued",
  "incomplete",
  "conflicting",
  "not_point_in_time_safe",
  "rollback_rejected",
] as const;

export const CANONICAL_NON_FORGEABLE_AUTHORITY_PINNED_ANCHOR =
  "89cc8f4e5957ca6f932b4094b01f6f9f9083b24def90451d2938ed5e889cc97a";
export const CANONICAL_NON_FORGEABLE_AUTHORITY_PINNED_ROOT =
  "817e896f5d3217c92009f3f24926507f9159e2c44cba8e36c009573d11733d8c";
export const CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID =
  "action-666bv-external-owner-session-v2";
export const CANONICAL_NON_FORGEABLE_AUTHORITY_PUBLIC_KEY_PEM = [
  "-----BEGIN PUBLIC KEY-----",
  "MCowBQYDK2VwAyEAXXSSE12Vx1SSmiClOnTZxx2RkGWCmiqKMLzdpi/+aQM=",
  "-----END PUBLIC KEY-----",
  "",
].join("\n");

export const CANONICAL_NON_FORGEABLE_NESTED_REQUEST_BUDGETS =
  Object.freeze({
    budget_version: "canonical_non_forgeable_nested_request_budget_v2",
    validator_version: CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
    policy: CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY,
    policy_digest: CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
  });
export const CANONICAL_NON_FORGEABLE_NESTED_REQUEST_BUDGET_DIGEST =
  canonicalModelImprovementDigest(
    CANONICAL_NON_FORGEABLE_NESTED_REQUEST_BUDGETS,
  );

export const CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ARTIFACT_ROLES =
  Object.freeze({
    "lib/server/canonical-non-forgeable-binding-snapshot-issuance.ts":
      "implementation",
    "lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures.ts":
      "synthetic_fixtures",
    "tests/e2e/action-666bv-non-forgeable-snapshot-issuance.spec.ts":
      "focused_tests",
    "docs/action-666bv-non-forgeable-snapshot-issuance.md":
      "contract_documentation",
    "docs/action-666bv-golden-non-forgeable-snapshot-issuance-report.json":
      "synthetic_golden_report",
  } as const);

const safety = {
  shadow_only: true,
  live_ranking_effect: false,
  live_impact: false,
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

const shaPattern = /^[a-f0-9]{64}$/;
const identityPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{2,255}$/;
const signaturePattern = /^[A-Za-z0-9+/]+={0,2}$/;
const verifiedRuntimeAuthorities = new WeakSet<object>();
const publicKey = createPublicKey(
  CANONICAL_NON_FORGEABLE_AUTHORITY_PUBLIC_KEY_PEM,
);

type BindingPlan =
  CanonicalGovernedBindingSnapshotIssuerAuthority["binding_plan"];
type Predecessor =
  CanonicalGovernedBindingSnapshotIssuerAuthority["predecessor"];
type Status =
  (typeof CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_STATUSES)[number];

export type CanonicalNonForgeableIssuerAuthorityPayload = {
  authority_version:
    typeof CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_VERSION;
  authority_session_identity:
    typeof CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID;
  authority_identity: string;
  external_owner_identity: string;
  owner_boundary_identity: string;
  issuer_identity: string;
  issuer_implementation_version: string;
  pinned_anchor_digest: string;
  pinned_root_digest: string;
  expected_request_identity: string;
  expected_nested_schema_digest: string;
  expected_semantic_scope_digest: string;
  minimum_publication_epoch: number;
  publication_sequence: number;
  publication_epoch: number;
  predecessor: Predecessor;
  issued_at: string;
  evidence_cutoff: string;
  effective_at: string;
  registry_authority_identity: string;
  authority_manifest_digest: string;
  authority_root_digest: string;
  binding_plan: BindingPlan;
  authority_payload_digest_algorithm: "sha256_canonical_json_v1";
  authority_payload_digest: string;
};

export type CanonicalNonForgeableIssuerAuthorityEnvelope = {
  envelope_version:
    typeof CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION;
  payload: CanonicalNonForgeableIssuerAuthorityPayload;
  signature_algorithm: "ed25519_sha256_digest_v1";
  signature_base64: string;
};

export type CanonicalNonForgeableIssuerAuthorityDependency = {
  owner_boundary_version:
    "canonical_non_forgeable_issuer_owner_boundary_v2";
  owner_boundary_identity: string;
  read_external_authority: () => unknown;
};

export type CanonicalNonForgeableBindingSnapshotIssuanceDependencies = {
  authority_dependency: CanonicalNonForgeableIssuerAuthorityDependency;
  predecessor_dependencies: Omit<
    CanonicalGovernedBindingSnapshotIssuanceDependencies,
    "issuer_authority_dependency"
  >;
};

export type CanonicalNonForgeableBindingSnapshotIssuanceCounters = {
  request_reads: number;
  request_validations: number;
  clones: number;
  authority_reads: number;
  authority_validations: number;
  authority_signature_verifications: number;
  authority_snapshot_freezes: number;
  nested_schema_validations: number;
  predecessor_executions: number;
  predecessor_rebuilds: number;
  digest_operations: number;
};

export type CanonicalNonForgeableInvalidRequestObservation = {
  observation_version:
    typeof CANONICAL_NON_FORGEABLE_INVALID_REQUEST_OBSERVATION_VERSION;
  rejection_stage:
    | "preclone_bounded_validation"
    | "request_clone"
    | "authority_read"
    | "authority_verification"
    | "nested_schema"
    | "semantic_scope"
    | "external_input_exception";
  observation_status: "complete" | "truncated" | "inaccessible";
  top_level_type: string;
  issuance_identity: string | null;
  request_digest: string | null;
  bounded_prefix_digest: string;
  nested_schema_digest: string | null;
  reason_codes: string[];
  validation_projection: unknown;
  observation_digest_algorithm: "sha256_canonical_json_v1";
  observation_digest: string;
};

export type CanonicalNonForgeableBindingSnapshotIssuanceResult = {
  issuance_version:
    typeof CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION;
  status: Status;
  issuance_identity: string | null;
  request_digest: string;
  nested_schema_version:
    typeof CANONICAL_NON_FORGEABLE_NESTED_SCHEMA_VERSION;
  nested_schema_digest: string | null;
  nested_schema_closed: boolean;
  authority_identity: string | null;
  authority_snapshot_digest: string | null;
  authority_root_digest: string | null;
  authority_signature_verified: boolean;
  runtime_provenance_verified: boolean;
  predecessor_result: CanonicalGovernedBindingSnapshotIssuanceResult | null;
  predecessor_result_verified: boolean;
  invalid_request_observation:
    | CanonicalNonForgeableInvalidRequestObservation
    | null;
  reason_codes: string[];
  issuance_digest_algorithm: "sha256_canonical_json_v1";
  issuance_digest: string;
} & typeof safety;

function emptyCounters(): CanonicalNonForgeableBindingSnapshotIssuanceCounters {
  return {
    request_reads: 0,
    request_validations: 0,
    clones: 0,
    authority_reads: 0,
    authority_validations: 0,
    authority_signature_verifications: 0,
    authority_snapshot_freezes: 0,
    nested_schema_validations: 0,
    predecessor_executions: 0,
    predecessor_rebuilds: 0,
    digest_operations: 0,
  };
}

function digest(
  value: unknown,
  counters?: CanonicalNonForgeableBindingSnapshotIssuanceCounters,
) {
  if (counters) counters.digest_operations += 1;
  return canonicalModelImprovementDigest(value);
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function exactKeys(value: Record<string, unknown>, expected: string[]) {
  return (
    Object.keys(value).sort().join("\0") ===
    [...expected].sort().join("\0")
  );
}

function validIdentity(value: unknown): value is string {
  return typeof value === "string" && identityPattern.test(value);
}

function deepFreezeIterative<T>(value: T): T {
  if (!value || typeof value !== "object") return value;
  const stack = [value as object];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const descriptor of Object.values(
      Object.getOwnPropertyDescriptors(current),
    )) {
      if (
        "value" in descriptor &&
        descriptor.value &&
        typeof descriptor.value === "object"
      ) {
        stack.push(descriptor.value as object);
      }
    }
    Object.freeze(current);
  }
  return value;
}

function safeTopLevel(value: unknown) {
  const type =
    value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  let issuanceIdentity: string | null = null;
  try {
    if (value && typeof value === "object") {
      const descriptor = Object.getOwnPropertyDescriptor(
        value,
        "issuance_identity",
      );
      if (
        descriptor &&
        "value" in descriptor &&
        validIdentity(descriptor.value)
      ) {
        issuanceIdentity = descriptor.value;
      }
    }
  } catch {
    issuanceIdentity = null;
  }
  return { type, issuanceIdentity };
}

function boundedPrefixDigest(value: unknown) {
  const tokens: string[] = [];
  const seen = new WeakMap<object, number>();
  const queue: Array<{ value: unknown; path: string }> = [
    { value, path: "$" },
  ];
  let objectIndex = 0;
  while (queue.length > 0 && tokens.length < 256) {
    const current = queue.shift()!;
    const candidate = current.value;
    if (
      candidate === null ||
      typeof candidate === "boolean" ||
      typeof candidate === "number" ||
      typeof candidate === "string"
    ) {
      tokens.push(
        `${current.path}:${typeof candidate}:${String(candidate).slice(0, 128)}`,
      );
      continue;
    }
    if (typeof candidate !== "object") {
      tokens.push(`${current.path}:${typeof candidate}`);
      continue;
    }
    const prior = seen.get(candidate);
    if (prior !== undefined) {
      tokens.push(`${current.path}:cycle:${prior}`);
      continue;
    }
    seen.set(candidate, objectIndex);
    objectIndex += 1;
    try {
      const keys = Reflect.ownKeys(candidate);
      tokens.push(
        `${current.path}:${Array.isArray(candidate) ? "array" : "object"}:${keys.length}`,
      );
      for (const key of keys
        .filter((entry): entry is string => typeof entry === "string")
        .sort()
        .slice(0, 64)) {
        const descriptor = Object.getOwnPropertyDescriptor(candidate, key);
        if (!descriptor || !("value" in descriptor)) {
          tokens.push(`${current.path}.${key}:inaccessible`);
          continue;
        }
        queue.push({
          value: descriptor.value,
          path: `${current.path}.${key}`.slice(0, 512),
        });
      }
    } catch {
      tokens.push(`${current.path}:introspection_failed`);
    }
  }
  return canonicalModelImprovementDigest({
    observation_version: "bounded_prefix_observation_v2",
    tokens,
    truncated: queue.length > 0,
  });
}

function invalidObservation(input: {
  raw: unknown;
  stage: CanonicalNonForgeableInvalidRequestObservation["rejection_stage"];
  reasons: string[];
  validationProjection: unknown;
  requestDigest: string | null;
  nestedSchemaDigest: string | null;
  counters: CanonicalNonForgeableBindingSnapshotIssuanceCounters;
}) {
  const top = safeTopLevel(input.raw);
  const payload = {
    observation_version:
      CANONICAL_NON_FORGEABLE_INVALID_REQUEST_OBSERVATION_VERSION,
    rejection_stage: input.stage,
    observation_status:
      input.requestDigest === null ? ("truncated" as const) : ("complete" as const),
    top_level_type: top.type,
    issuance_identity: top.issuanceIdentity,
    request_digest: input.requestDigest,
    bounded_prefix_digest: boundedPrefixDigest(input.raw),
    nested_schema_digest: input.nestedSchemaDigest,
    reason_codes: uniqueSorted(input.reasons),
    validation_projection: input.validationProjection,
    observation_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
  return deepFreezeIterative({
    ...payload,
    observation_digest: digest(payload, input.counters),
  });
}

function schemaTokens(value: unknown) {
  const tokens: string[] = [];
  const stack: Array<{ value: unknown; path: string }> = [
    { value, path: "$" },
  ];
  while (stack.length > 0) {
    const current = stack.pop()!;
    const candidate = current.value;
    if (candidate === null) {
      tokens.push(`${current.path}:null`);
      continue;
    }
    if (Array.isArray(candidate)) {
      tokens.push(`${current.path}:array:${candidate.length}`);
      const descriptors = Object.getOwnPropertyDescriptors(candidate);
      for (let index = candidate.length - 1; index >= 0; index -= 1) {
        const descriptor = descriptors[String(index)];
        if (!descriptor || !("value" in descriptor)) {
          throw new Error("nested_request_array_descriptor_invalid");
        }
        stack.push({
          value: descriptor.value,
          path: `${current.path}[${index}]`,
        });
      }
      continue;
    }
    if (typeof candidate === "object") {
      const descriptors = Object.getOwnPropertyDescriptors(candidate);
      const keys = Object.keys(descriptors).sort();
      tokens.push(`${current.path}:object:${keys.join(",")}`);
      for (const key of [...keys].reverse()) {
        const descriptor = descriptors[key];
        if (!descriptor || !("value" in descriptor)) {
          throw new Error("nested_request_descriptor_invalid");
        }
        stack.push({
          value: descriptor.value,
          path: `${current.path}.${key}`,
        });
      }
      continue;
    }
    tokens.push(`${current.path}:${typeof candidate}`);
  }
  return tokens;
}

export function canonicalNonForgeableNestedRequestSchemaDigest(
  value: unknown,
) {
  return canonicalModelImprovementDigest({
    schema_version: CANONICAL_NON_FORGEABLE_NESTED_SCHEMA_VERSION,
    tokens: schemaTokens(value),
  });
}

function authorityPayloadProjection(
  value: CanonicalNonForgeableIssuerAuthorityPayload,
) {
  const projection = structuredClone(value) as Partial<
    CanonicalNonForgeableIssuerAuthorityPayload
  >;
  delete projection.authority_payload_digest;
  return projection;
}

export function canonicalNonForgeableIssuerAuthorityPayloadDigest(
  value: CanonicalNonForgeableIssuerAuthorityPayload,
) {
  return canonicalModelImprovementDigest(authorityPayloadProjection(value));
}

function authorityPayloadSchemaValid(
  value: unknown,
): value is CanonicalNonForgeableIssuerAuthorityPayload {
  if (!isRecord(value)) return false;
  const expectedKeys = [
    "authority_version",
    "authority_session_identity",
    "authority_identity",
    "external_owner_identity",
    "owner_boundary_identity",
    "issuer_identity",
    "issuer_implementation_version",
    "pinned_anchor_digest",
    "pinned_root_digest",
    "expected_request_identity",
    "expected_nested_schema_digest",
    "expected_semantic_scope_digest",
    "minimum_publication_epoch",
    "publication_sequence",
    "publication_epoch",
    "predecessor",
    "issued_at",
    "evidence_cutoff",
    "effective_at",
    "registry_authority_identity",
    "authority_manifest_digest",
    "authority_root_digest",
    "binding_plan",
    "authority_payload_digest_algorithm",
    "authority_payload_digest",
  ];
  if (!exactKeys(value, expectedKeys)) return false;
  return (
    value.authority_version ===
      CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_VERSION &&
    value.authority_session_identity ===
      CANONICAL_NON_FORGEABLE_AUTHORITY_SESSION_ID &&
    [
      value.authority_identity,
      value.external_owner_identity,
      value.owner_boundary_identity,
      value.issuer_identity,
      value.issuer_implementation_version,
      value.expected_request_identity,
      value.registry_authority_identity,
    ].every(validIdentity) &&
    [
      value.pinned_anchor_digest,
      value.pinned_root_digest,
      value.expected_nested_schema_digest,
      value.expected_semantic_scope_digest,
      value.authority_manifest_digest,
      value.authority_root_digest,
      value.authority_payload_digest,
    ].every((entry) => typeof entry === "string" && shaPattern.test(entry)) &&
    Number.isSafeInteger(value.minimum_publication_epoch) &&
    Number(value.minimum_publication_epoch) >= 1 &&
    Number.isSafeInteger(value.publication_sequence) &&
    Number(value.publication_sequence) >= 1 &&
    Number.isSafeInteger(value.publication_epoch) &&
    Number(value.publication_epoch) >= 1 &&
    isRecord(value.predecessor) &&
    Array.isArray(value.binding_plan) &&
    value.authority_payload_digest_algorithm === "sha256_canonical_json_v1"
  );
}

function verifyAuthority(input: {
  raw: unknown;
  dependency: CanonicalNonForgeableIssuerAuthorityDependency;
  counters: CanonicalNonForgeableBindingSnapshotIssuanceCounters;
}) {
  input.counters.authority_validations += 1;
  const bounded = validateCanonicalBoundedSnapshotPayload(input.raw);
  if (bounded.status !== "valid") {
    return { snapshot: null, reasons: ["external_authority_payload_invalid"] };
  }
  let cloned: unknown;
  try {
    cloned = structuredClone(input.raw);
  } catch {
    return { snapshot: null, reasons: ["external_authority_clone_failed"] };
  }
  if (
    !isRecord(cloned) ||
    !exactKeys(cloned, [
      "envelope_version",
      "payload",
      "signature_algorithm",
      "signature_base64",
    ]) ||
    cloned.envelope_version !==
      CANONICAL_NON_FORGEABLE_ISSUER_AUTHORITY_ENVELOPE_VERSION ||
    cloned.signature_algorithm !== "ed25519_sha256_digest_v1" ||
    typeof cloned.signature_base64 !== "string" ||
    !signaturePattern.test(cloned.signature_base64) ||
    !authorityPayloadSchemaValid(cloned.payload)
  ) {
    return { snapshot: null, reasons: ["external_authority_schema_invalid"] };
  }
  const envelope =
    cloned as unknown as CanonicalNonForgeableIssuerAuthorityEnvelope;
  const payload = envelope.payload;
  if (
    payload.pinned_anchor_digest !==
      CANONICAL_NON_FORGEABLE_AUTHORITY_PINNED_ANCHOR ||
    payload.pinned_root_digest !==
      CANONICAL_NON_FORGEABLE_AUTHORITY_PINNED_ROOT ||
    payload.authority_root_digest !==
      CANONICAL_NON_FORGEABLE_AUTHORITY_PINNED_ROOT ||
    payload.owner_boundary_identity !==
      input.dependency.owner_boundary_identity ||
    payload.authority_payload_digest !==
      canonicalNonForgeableIssuerAuthorityPayloadDigest(payload)
  ) {
    return { snapshot: null, reasons: ["external_authority_pin_mismatch"] };
  }
  input.counters.authority_signature_verifications += 1;
  let signatureValid = false;
  try {
    signatureValid = verifySignature(
      null,
      Buffer.from(payload.authority_payload_digest, "hex"),
      publicKey,
      Buffer.from(envelope.signature_base64, "base64"),
    );
  } catch {
    signatureValid = false;
  }
  if (!signatureValid) {
    return {
      snapshot: null,
      reasons: ["external_authority_signature_invalid"],
    };
  }
  input.counters.authority_snapshot_freezes += 1;
  const snapshot = deepFreezeIterative(structuredClone(envelope));
  verifiedRuntimeAuthorities.add(snapshot);
  return { snapshot, reasons: [] };
}

function result(input: {
  status: Status;
  request: CanonicalGovernedBindingSnapshotIssuanceRequest | null;
  requestDigest: string;
  nestedSchemaDigest: string | null;
  nestedSchemaClosed: boolean;
  authority: CanonicalNonForgeableIssuerAuthorityEnvelope | null;
  predecessorResult: CanonicalGovernedBindingSnapshotIssuanceResult | null;
  predecessorVerified: boolean;
  invalidObservation: CanonicalNonForgeableInvalidRequestObservation | null;
  reasons: string[];
  counters: CanonicalNonForgeableBindingSnapshotIssuanceCounters;
}) {
  const payload = {
    issuance_version:
      CANONICAL_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_VERSION,
    status: input.status,
    issuance_identity: input.request?.issuance_identity ?? null,
    request_digest: input.requestDigest,
    nested_schema_version:
      CANONICAL_NON_FORGEABLE_NESTED_SCHEMA_VERSION,
    nested_schema_digest: input.nestedSchemaDigest,
    nested_schema_closed: input.nestedSchemaClosed,
    authority_identity: input.authority?.payload.authority_identity ?? null,
    authority_snapshot_digest: input.authority
      ? digest(input.authority, input.counters)
      : null,
    authority_root_digest:
      input.authority?.payload.authority_root_digest ?? null,
    authority_signature_verified: input.authority !== null,
    runtime_provenance_verified:
      input.authority !== null &&
      verifiedRuntimeAuthorities.has(input.authority),
    predecessor_result: input.predecessorResult,
    predecessor_result_verified: input.predecessorVerified,
    invalid_request_observation: input.invalidObservation,
    reason_codes: uniqueSorted(input.reasons),
    issuance_digest_algorithm: "sha256_canonical_json_v1" as const,
    ...safety,
  };
  return deepFreezeIterative({
    ...payload,
    issuance_digest: digest(payload, input.counters),
  });
}

function sanitizedFailure(input: {
  raw: unknown;
  stage: CanonicalNonForgeableInvalidRequestObservation["rejection_stage"];
  reasons: string[];
  validationProjection: unknown;
  requestDigest: string | null;
  nestedSchemaDigest: string | null;
  authority?: CanonicalNonForgeableIssuerAuthorityEnvelope | null;
  counters: CanonicalNonForgeableBindingSnapshotIssuanceCounters;
}) {
  const observation = invalidObservation({
    raw: input.raw,
    stage: input.stage,
    reasons: input.reasons,
    validationProjection: input.validationProjection,
    requestDigest: input.requestDigest,
    nestedSchemaDigest: input.nestedSchemaDigest,
    counters: input.counters,
  });
  return result({
    status: input.stage.startsWith("authority")
      ? "conflicting"
      : "incomplete",
    request: null,
    requestDigest:
      input.requestDigest ?? observation.observation_digest,
    nestedSchemaDigest: input.nestedSchemaDigest,
    nestedSchemaClosed: false,
    authority: input.authority ?? null,
    predecessorResult: null,
    predecessorVerified: false,
    invalidObservation: observation,
    reasons: input.reasons,
    counters: input.counters,
  });
}

function execute(input: {
  rawRequest: unknown;
  dependencies: CanonicalNonForgeableBindingSnapshotIssuanceDependencies;
  counters: CanonicalNonForgeableBindingSnapshotIssuanceCounters;
}) {
  input.counters.request_reads += 1;
  input.counters.request_validations += 1;
  const bounded = validateCanonicalBoundedSnapshotPayload(input.rawRequest);
  if (bounded.status !== "valid") {
    return sanitizedFailure({
      raw: input.rawRequest,
      stage: "preclone_bounded_validation",
      reasons:
        bounded.status === "budget_exceeded"
          ? [
              "nested_request_validation_budget_exceeded",
              `nested_request_budget:${bounded.budget_kind}`,
            ]
          : ["nested_request_payload_invalid"],
      validationProjection: bounded,
      requestDigest: null,
      nestedSchemaDigest: null,
      counters: input.counters,
    });
  }
  input.counters.clones += 1;
  let cloned: unknown;
  try {
    cloned = structuredClone(input.rawRequest);
  } catch {
    return sanitizedFailure({
      raw: input.rawRequest,
      stage: "request_clone",
      reasons: ["nested_request_clone_failed"],
      validationProjection: bounded,
      requestDigest: null,
      nestedSchemaDigest: null,
      counters: input.counters,
    });
  }
  const requestDigest = digest(cloned, input.counters);

  input.counters.authority_reads += 1;
  let rawAuthority: unknown;
  try {
    rawAuthority =
      input.dependencies.authority_dependency.read_external_authority();
  } catch {
    return sanitizedFailure({
      raw: cloned,
      stage: "authority_read",
      reasons: ["external_authority_read_failed"],
      validationProjection: bounded,
      requestDigest,
      nestedSchemaDigest: null,
      counters: input.counters,
    });
  }
  const authorityVerification = verifyAuthority({
    raw: rawAuthority,
    dependency: input.dependencies.authority_dependency,
    counters: input.counters,
  });
  if (!authorityVerification.snapshot) {
    return sanitizedFailure({
      raw: cloned,
      stage: "authority_verification",
      reasons: authorityVerification.reasons,
      validationProjection: bounded,
      requestDigest,
      nestedSchemaDigest: null,
      counters: input.counters,
    });
  }
  const authority = authorityVerification.snapshot;

  input.counters.nested_schema_validations += 1;
  let nestedSchemaDigest: string;
  try {
    nestedSchemaDigest =
      canonicalNonForgeableNestedRequestSchemaDigest(cloned);
  } catch {
    return sanitizedFailure({
      raw: cloned,
      stage: "nested_schema",
      reasons: ["nested_request_schema_introspection_failed"],
      validationProjection: bounded,
      requestDigest,
      nestedSchemaDigest: null,
      authority,
      counters: input.counters,
    });
  }
  if (
    nestedSchemaDigest !==
    authority.payload.expected_nested_schema_digest
  ) {
    return sanitizedFailure({
      raw: cloned,
      stage: "nested_schema",
      reasons: ["nested_request_closed_schema_mismatch"],
      validationProjection: bounded,
      requestDigest,
      nestedSchemaDigest,
      authority,
      counters: input.counters,
    });
  }

  const request =
    cloned as CanonicalGovernedBindingSnapshotIssuanceRequest;
  let semanticScopeDigest: string;
  try {
    semanticScopeDigest =
      canonicalGovernedBindingSnapshotIssuanceSemanticScopeDigest(request);
  } catch {
    return sanitizedFailure({
      raw: cloned,
      stage: "semantic_scope",
      reasons: ["nested_request_semantic_projection_failed"],
      validationProjection: bounded,
      requestDigest,
      nestedSchemaDigest,
      authority,
      counters: input.counters,
    });
  }
  if (
    request.binding_backed_replay_request.request_version !==
      CANONICAL_BINDING_BACKED_REPLAY_REQUEST_VERSION ||
    request.issuance_identity !==
      authority.payload.expected_request_identity ||
    semanticScopeDigest !==
      authority.payload.expected_semantic_scope_digest
  ) {
    return sanitizedFailure({
      raw: cloned,
      stage: "semantic_scope",
      reasons: ["nested_request_semantic_scope_mismatch"],
      validationProjection: bounded,
      requestDigest,
      nestedSchemaDigest,
      authority,
      counters: input.counters,
    });
  }
  if (!verifiedRuntimeAuthorities.has(authority)) {
    return sanitizedFailure({
      raw: cloned,
      stage: "authority_verification",
      reasons: ["external_authority_runtime_provenance_missing"],
      validationProjection: bounded,
      requestDigest,
      nestedSchemaDigest,
      counters: input.counters,
    });
  }

  const predecessorAuthority =
    createCanonicalGovernedBindingSnapshotIssuerAuthority({
      authority_identity: authority.payload.authority_identity,
      owner_boundary_identity:
        authority.payload.owner_boundary_identity,
      external_owner_identity:
        authority.payload.external_owner_identity,
      issuer_identity: authority.payload.issuer_identity,
      issuer_implementation_version:
        authority.payload.issuer_implementation_version,
      issuer_authority_anchor:
        authority.payload.pinned_anchor_digest,
      registry_authority_identity:
        authority.payload.registry_authority_identity,
      authority_manifest_digest:
        authority.payload.authority_manifest_digest,
      authority_root_digest:
        authority.payload.authority_root_digest,
      publication_sequence: authority.payload.publication_sequence,
      publication_epoch: authority.payload.publication_epoch,
      predecessor: authority.payload.predecessor,
      issued_at: authority.payload.issued_at,
      evidence_cutoff: authority.payload.evidence_cutoff,
      effective_at: authority.payload.effective_at,
      binding_plan: authority.payload.binding_plan,
      semantic_scope_digest: semanticScopeDigest,
      expected_request_identity:
        authority.payload.expected_request_identity,
    });
  const predecessorDependencies: CanonicalGovernedBindingSnapshotIssuanceDependencies =
    {
      ...input.dependencies.predecessor_dependencies,
      issuer_authority_dependency: {
        owner_boundary_version:
          "canonical_governed_binding_snapshot_issuer_owner_boundary_v3",
        owner_boundary_identity:
          authority.payload.owner_boundary_identity,
        minimum_publication_epoch:
          authority.payload.minimum_publication_epoch,
        read_expected_authority: () => predecessorAuthority,
      },
    };
  const predecessorHarness =
    createCanonicalGovernedBindingSnapshotIssuanceHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies: predecessorDependencies,
    });
  if (!predecessorHarness.issue) {
    return result({
      status: "conflicting",
      request,
      requestDigest,
      nestedSchemaDigest,
      nestedSchemaClosed: true,
      authority,
      predecessorResult: null,
      predecessorVerified: false,
      invalidObservation: null,
      reasons: ["predecessor_issuance_unavailable"],
      counters: input.counters,
    });
  }
  input.counters.predecessor_executions += 1;
  const predecessorResult = predecessorHarness.issue(request);
  input.counters.predecessor_rebuilds += 1;
  const predecessorVerification =
    verifyCanonicalGovernedBindingSnapshotIssuanceResult({
      request,
      result: predecessorResult,
      dependencies: predecessorDependencies,
    });
  const predecessorVerified = predecessorVerification.valid;
  const reasons = predecessorVerified
    ? predecessorResult.reason_codes
    : ["predecessor_issuance_rebuild_failed"];
  return result({
    status: predecessorVerified ? predecessorResult.status : "conflicting",
    request,
    requestDigest,
    nestedSchemaDigest,
    nestedSchemaClosed: true,
    authority,
    predecessorResult,
    predecessorVerified,
    invalidObservation: null,
    reasons,
    counters: input.counters,
  });
}

export function createCanonicalNonForgeableBindingSnapshotIssuanceHarness(
  input: {
    enabled?: boolean;
    kill_switch_engaged?: boolean;
    dependencies?: CanonicalNonForgeableBindingSnapshotIssuanceDependencies;
    counters?: CanonicalNonForgeableBindingSnapshotIssuanceCounters;
  } = {},
) {
  const enabled =
    input.enabled ??
    DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_ENABLED;
  const killSwitch =
    input.kill_switch_engaged ??
    DEFAULT_OFF_NON_FORGEABLE_BINDING_SNAPSHOT_ISSUANCE_KILL_SWITCH;
  const counters = input.counters ?? emptyCounters();
  if (!enabled || killSwitch) {
    return deepFreezeIterative({
      enabled: false as const,
      status: !enabled
        ? ("disabled" as const)
        : ("kill_switch_engaged" as const),
      issue: null,
      counters,
      ...safety,
    });
  }
  const dependencies = input.dependencies;
  if (
    !dependencies ||
    dependencies.authority_dependency.owner_boundary_version !==
      "canonical_non_forgeable_issuer_owner_boundary_v2" ||
    !validIdentity(
      dependencies.authority_dependency.owner_boundary_identity,
    )
  ) {
    return deepFreezeIterative({
      enabled: true as const,
      status: "unavailable" as const,
      issue: null,
      counters,
      reason_codes: ["non_forgeable_issuance_dependencies_invalid"],
      ...safety,
    });
  }
  return {
    enabled: true as const,
    status: "ready" as const,
    issue: (request: unknown) => {
      try {
        return execute({
          rawRequest: request,
          dependencies,
          counters,
        });
      } catch {
        return sanitizedFailure({
          raw: request,
          stage: "external_input_exception",
          reasons: ["external_input_processing_failed"],
          validationProjection: {
            validator_version:
              CANONICAL_BOUNDED_SNAPSHOT_VALIDATOR_VERSION,
            budget_policy_digest:
              CANONICAL_BOUNDED_SNAPSHOT_BUDGET_POLICY_DIGEST,
          },
          requestDigest: null,
          nestedSchemaDigest: null,
          counters,
        });
      }
    },
    counters,
    ...safety,
  };
}

export function verifyCanonicalNonForgeableBindingSnapshotIssuanceResult(
  input: {
    request: unknown;
    result: CanonicalNonForgeableBindingSnapshotIssuanceResult;
    rebuild_dependencies:
      CanonicalNonForgeableBindingSnapshotIssuanceDependencies;
  },
) {
  const harness =
    createCanonicalNonForgeableBindingSnapshotIssuanceHarness({
      enabled: true,
      kill_switch_engaged: false,
      dependencies: input.rebuild_dependencies,
    });
  if (!harness.issue) {
    return deepFreezeIterative({
      valid: false,
      canonical_result: null,
      reason_codes: ["non_forgeable_issuance_rebuild_unavailable"],
    });
  }
  const canonicalResult = harness.issue(input.request);
  const valid =
    canonicalResult.issuance_digest === input.result.issuance_digest &&
    canonicalModelImprovementDigest(canonicalResult) ===
      canonicalModelImprovementDigest(input.result);
  return deepFreezeIterative({
    valid,
    canonical_result: valid ? canonicalResult : null,
    reason_codes: valid
      ? []
      : ["non_forgeable_issuance_result_tampered"],
  });
}

export function canonicalNonForgeableBindingSnapshotIssuanceDigest(
  value: unknown,
) {
  return canonicalModelImprovementDigest(value);
}
