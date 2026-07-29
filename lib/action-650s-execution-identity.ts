import { createHash } from "node:crypto";

export const action650sRuntimeIdentityContractVersion =
  "action_650s_runtime_identity_v1" as const;
export const action650sOrderPayloadContractVersion =
  "action_650s_canonical_order_payload_v1" as const;
export const action650sHandoffIdentityContractVersion =
  "action_650s_handoff_identity_v1" as const;

export type Action650sRuntimeIdentityContext = Readonly<{
  contract_version: typeof action650sRuntimeIdentityContractVersion;
  execution_identity: string;
  lifecycle_identity: string;
  runtime_instance_identity: string;
  runtime_session_identity: string;
  created_at: string;
  context_digest: string;
}>;

export type Action650sCanonicalOrderPayload = Readonly<{
  contract_version: typeof action650sOrderPayloadContractVersion;
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  order_type: "LIMIT" | "MARKET" | "STOP_LIMIT";
  limit_price: number | null;
  stop_price: number | null;
  execution_mode: "semi_automatic";
  authority_scope: "manual_confirmation_bound_simulation";
  created_at: string;
}>;

export type Action650sExecutionHandoffIdentity = Readonly<{
  contract_version: typeof action650sHandoffIdentityContractVersion;
  execution_identity: string;
  lifecycle_identity: string;
  runtime_identity_context_digest: string;
  handoff_identity: string;
  handoff_digest: string;
  canonical_order_payload_digest: string;
  broker_request_identity: string;
  idempotency_identity: string;
  correlation_identity: string;
}>;

export type Action650sPreparedHandoff = Readonly<{
  identity: Action650sExecutionHandoffIdentity;
  payload: Action650sCanonicalOrderPayload;
  requires_manual_confirmation: true;
  permits_real_submission: false;
}>;

const runtimeIdentityProvenance = new WeakSet<object>();
const restrictedMaterialKey =
  /(?:authorization|bankid|broker.?session|cookie|credential|password|secret|token|api.?key)/i;

export function canonicalizeAction650sTimestamp(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const milliseconds = Date.parse(value);

  return Number.isFinite(milliseconds) ? new Date(milliseconds).toISOString() : null;
}

function requiredIdentity(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function canonicalPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Number(value)
    : null;
}

function stableCanonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableCanonicalValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stableCanonicalValue(nested)]),
    );
  }

  return value;
}

export function hashAction650sCanonicalValue(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(stableCanonicalValue(value)))
    .digest("hex");
}

export function deepFreezeAction650s<T>(value: T): Readonly<T> {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreezeAction650s(nested);
  }

  return Object.freeze(value);
}

export function containsAction650sRestrictedMaterial(value: unknown): boolean {
  const seen = new WeakSet<object>();

  function scan(nestedValue: unknown): boolean {
    if (!nestedValue || typeof nestedValue !== "object") {
      return false;
    }

    if (seen.has(nestedValue)) {
      return true;
    }

    seen.add(nestedValue);

    if (Array.isArray(nestedValue)) {
      return nestedValue.some(scan);
    }

    return Object.entries(nestedValue as Record<string, unknown>).some(
      ([key, nested]) => restrictedMaterialKey.test(key) || scan(nested),
    );
  }

  return scan(value);
}

/**
 * Explicit runtime boundary. Core replay code accepts only the registered
 * object instance returned here; a structurally identical caller claim fails.
 */
export function createAction650sRuntimeIdentityContext(input: {
  execution_identity: unknown;
  runtime_instance_identity: unknown;
  runtime_session_identity: unknown;
  created_at: unknown;
}): Action650sRuntimeIdentityContext | null {
  if (containsAction650sRestrictedMaterial(input)) {
    return null;
  }

  const executionIdentity = requiredIdentity(input.execution_identity);
  const runtimeInstanceIdentity = requiredIdentity(input.runtime_instance_identity);
  const runtimeSessionIdentity = requiredIdentity(input.runtime_session_identity);
  const createdAt = canonicalizeAction650sTimestamp(input.created_at);

  if (
    !executionIdentity ||
    !runtimeInstanceIdentity ||
    !runtimeSessionIdentity ||
    !createdAt
  ) {
    return null;
  }

  const lifecycleIdentity = `action_650s_lifecycle_${hashAction650sCanonicalValue({
    execution_identity: executionIdentity,
  }).slice(0, 24)}`;
  const unsigned = {
    contract_version: action650sRuntimeIdentityContractVersion,
    execution_identity: executionIdentity,
    lifecycle_identity: lifecycleIdentity,
    runtime_instance_identity: runtimeInstanceIdentity,
    runtime_session_identity: runtimeSessionIdentity,
    created_at: createdAt,
  } as const;
  const context = deepFreezeAction650s({
    ...unsigned,
    context_digest: `action_650s_runtime_${hashAction650sCanonicalValue(unsigned)}`,
  }) as Action650sRuntimeIdentityContext;

  runtimeIdentityProvenance.add(context);

  return context;
}

export function hasAction650sRuntimeIdentityProvenance(
  value: unknown,
): value is Action650sRuntimeIdentityContext {
  return Boolean(
    value &&
      typeof value === "object" &&
      runtimeIdentityProvenance.has(value as object),
  );
}

export function canonicalizeAction650sOrderPayload(input: {
  ticker: unknown;
  side: unknown;
  quantity: unknown;
  order_type: unknown;
  limit_price?: unknown;
  stop_price?: unknown;
  execution_mode: unknown;
  authority_scope: unknown;
  created_at: unknown;
}): Action650sCanonicalOrderPayload | null {
  if (containsAction650sRestrictedMaterial(input)) {
    return null;
  }

  const ticker = requiredIdentity(input.ticker)?.toUpperCase() ?? null;
  const side = requiredIdentity(input.side)?.toUpperCase();
  const orderType = requiredIdentity(input.order_type)?.toUpperCase();
  const quantity = canonicalPositiveNumber(input.quantity);
  const limitPrice =
    input.limit_price == null ? null : canonicalPositiveNumber(input.limit_price);
  const stopPrice =
    input.stop_price == null ? null : canonicalPositiveNumber(input.stop_price);
  const createdAt = canonicalizeAction650sTimestamp(input.created_at);

  if (
    !ticker ||
    (side !== "BUY" && side !== "SELL") ||
    !quantity ||
    (orderType !== "LIMIT" &&
      orderType !== "MARKET" &&
      orderType !== "STOP_LIMIT") ||
    input.execution_mode !== "semi_automatic" ||
    input.authority_scope !== "manual_confirmation_bound_simulation" ||
    !createdAt
  ) {
    return null;
  }

  if (
    (orderType === "LIMIT" && (!limitPrice || stopPrice !== null)) ||
    (orderType === "MARKET" && (limitPrice !== null || stopPrice !== null)) ||
    (orderType === "STOP_LIMIT" && (!limitPrice || !stopPrice))
  ) {
    return null;
  }

  return deepFreezeAction650s({
    contract_version: action650sOrderPayloadContractVersion,
    ticker,
    side,
    quantity,
    order_type: orderType,
    limit_price: limitPrice,
    stop_price: stopPrice,
    execution_mode: "semi_automatic" as const,
    authority_scope: "manual_confirmation_bound_simulation" as const,
    created_at: createdAt,
  }) as Action650sCanonicalOrderPayload;
}

export function digestAction650sOrderPayload(
  payload: Action650sCanonicalOrderPayload,
) {
  return `action_650s_payload_${hashAction650sCanonicalValue(payload)}`;
}

export function buildAction650sPreparedHandoff(input: {
  runtime: Action650sRuntimeIdentityContext;
  payload: Action650sCanonicalOrderPayload;
}): Action650sPreparedHandoff | null {
  if (
    !hasAction650sRuntimeIdentityProvenance(input.runtime) ||
    input.payload.execution_mode !== "semi_automatic"
  ) {
    return null;
  }

  const canonicalOrderPayloadDigest = digestAction650sOrderPayload(input.payload);
  const identitySeed = {
    execution_identity: input.runtime.execution_identity,
    lifecycle_identity: input.runtime.lifecycle_identity,
    runtime_identity_context_digest: input.runtime.context_digest,
    canonical_order_payload_digest: canonicalOrderPayloadDigest,
  };
  const scopedDigest = hashAction650sCanonicalValue(identitySeed);
  const unsignedIdentity = {
    contract_version: action650sHandoffIdentityContractVersion,
    ...identitySeed,
    handoff_identity: `action_650s_handoff_${scopedDigest.slice(0, 24)}`,
    broker_request_identity: `action_650s_broker_request_${scopedDigest.slice(0, 24)}`,
    idempotency_identity: `action_650s_idempotency_${scopedDigest}`,
    correlation_identity: `action_650s_correlation_${scopedDigest.slice(0, 24)}`,
  };
  const identity = {
    ...unsignedIdentity,
    handoff_digest: `action_650s_handoff_digest_${hashAction650sCanonicalValue(
      unsignedIdentity,
    )}`,
  };

  return deepFreezeAction650s({
    identity,
    payload: input.payload,
    requires_manual_confirmation: true as const,
    permits_real_submission: false as const,
  }) as Action650sPreparedHandoff;
}
