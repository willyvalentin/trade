import { createHash } from "node:crypto";

import type { ExecutionMode } from "@/lib/execution";
import type { ExecutionRuntimeIdentityContext } from "@/lib/execution-runtime-identity";

export const avanzaAdapterIdentityContractVersion =
  "avanza_adapter_execution_identity_v1" as const;

export type AvanzaAdapterOrderPayload = Readonly<{
  schema_version: "avanza_adapter_order_payload_v1";
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  order_type: "LIMIT" | "MARKET" | "STOP_LIMIT";
  limit_price: number | null;
  stop_price: number | null;
  position_id: string | null;
  execution_mode: ExecutionMode;
  authority_scope: "manual_final_confirmation" | "automatic_final_submit";
  created_at: string;
}>;

export type AvanzaAdapterExecutionIdentity = Readonly<{
  contract_version: typeof avanzaAdapterIdentityContractVersion;
  execution_id: string;
  lifecycle_id: string;
  handoff_id: string;
  payload_id: string;
  payload_fingerprint: string;
  broker_request_id: string;
  idempotency_key: string;
  correlation_id: string;
  created_at: string;
}>;

export type AvanzaAdapterRequest = Readonly<{
  identity: AvanzaAdapterExecutionIdentity;
  payload: AvanzaAdapterOrderPayload;
  mode: ExecutionMode;
  requires_manual_confirmation: boolean;
  may_submit: boolean;
}>;

export type AvanzaAdapterIdentityValidation = Readonly<{
  ok: boolean;
  reason:
    | "ok"
    | "identity_missing"
    | "identity_mismatch"
    | "payload_mismatch"
    | "progress_mismatch"
    | "confirmation_mismatch"
    | "secret_field_rejected";
}>;

export type AvanzaAdapterProgress = Readonly<{
  execution_id: string;
  payload_fingerprint: string;
  broker_request_id: string;
  correlation_id: string;
  side: "BUY" | "SELL";
  ticker: string;
  quantity?: number;
}>;

export type AvanzaAdapterConfirmation = AvanzaAdapterProgress &
  Readonly<{
    terminal_status: "filled" | "rejected" | "cancelled" | "unknown";
    broker_order_id: string;
  }>;

export type AvanzaAdapterConfirmationReconciliation = Readonly<{
  status: "accepted" | "duplicate" | "needs_review" | "rejected";
  confirmation: AvanzaAdapterConfirmation | null;
}>;

const secretKey = /(authorization|cookie|credential|password|secret|session|token|api[_-]?key)/i;

function requiredText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function canonicalTimestamp(value: unknown) {
  const timestamp = requiredText(value);

  if (!timestamp || !Number.isFinite(Date.parse(timestamp))) {
    return null;
  }

  return new Date(timestamp).toISOString();
}

function canonicalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Number(value) : null;
}

function hash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function hasSecretField(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasSecretField);
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.entries(value as Record<string, unknown>).some(
    ([key, nested]) => secretKey.test(key) || hasSecretField(nested),
  );
}

export function canonicalizeAvanzaAdapterPayload(input: {
  ticker: unknown;
  side: unknown;
  quantity: unknown;
  order_type: unknown;
  limit_price?: unknown;
  stop_price?: unknown;
  position_id?: unknown;
  execution_mode: unknown;
  authority_scope: unknown;
  created_at: unknown;
}): AvanzaAdapterOrderPayload | null {
  const ticker = requiredText(input.ticker)?.toUpperCase() ?? null;
  const side = requiredText(input.side)?.toUpperCase();
  const orderType = requiredText(input.order_type)?.toUpperCase();
  const positionId = input.position_id == null ? null : requiredText(input.position_id);
  const createdAt = canonicalTimestamp(input.created_at);
  const quantity = canonicalNumber(input.quantity);
  const limitPrice = input.limit_price == null ? null : canonicalNumber(input.limit_price);
  const stopPrice = input.stop_price == null ? null : canonicalNumber(input.stop_price);

  if (
    !ticker ||
    (side !== "BUY" && side !== "SELL") ||
    !quantity ||
    quantity <= 0 ||
    (orderType !== "LIMIT" && orderType !== "MARKET" && orderType !== "STOP_LIMIT") ||
    (input.execution_mode !== "semi_automatic" && input.execution_mode !== "automatic") ||
    (input.authority_scope !== "manual_final_confirmation" && input.authority_scope !== "automatic_final_submit") ||
    !createdAt ||
    (limitPrice !== null && limitPrice <= 0) ||
    (stopPrice !== null && stopPrice <= 0)
  ) {
    return null;
  }

  return Object.freeze({
    schema_version: "avanza_adapter_order_payload_v1",
    ticker,
    side,
    quantity,
    order_type: orderType,
    limit_price: limitPrice,
    stop_price: stopPrice,
    position_id: positionId,
    execution_mode: input.execution_mode,
    authority_scope: input.authority_scope,
    created_at: createdAt,
  });
}

export function fingerprintAvanzaAdapterPayload(payload: AvanzaAdapterOrderPayload) {
  return `avanza_payload_${hash(payload)}`;
}

export function buildAvanzaAdapterExecutionIdentity(
  runtime: ExecutionRuntimeIdentityContext,
  payload: AvanzaAdapterOrderPayload,
): AvanzaAdapterExecutionIdentity | null {
  if (
    !requiredText(runtime.executionId) ||
    !requiredText(runtime.lifecycleId) ||
    canonicalTimestamp(runtime.now) !== payload.created_at
  ) {
    return null;
  }

  const payloadFingerprint = fingerprintAvanzaAdapterPayload(payload);
  const executionId = runtime.executionId;
  const scopedHash = hash({ executionId, lifecycleId: runtime.lifecycleId, payloadFingerprint });

  return Object.freeze({
    contract_version: avanzaAdapterIdentityContractVersion,
    execution_id: executionId,
    lifecycle_id: runtime.lifecycleId,
    handoff_id: `avanza_handoff_${scopedHash.slice(0, 24)}`,
    payload_id: `avanza_payload_${scopedHash.slice(0, 24)}`,
    payload_fingerprint: payloadFingerprint,
    broker_request_id: `avanza_request_${scopedHash.slice(0, 24)}`,
    idempotency_key: `avanza_idempotency_${scopedHash}`,
    correlation_id: `avanza_correlation_${scopedHash.slice(0, 24)}`,
    created_at: payload.created_at,
  });
}

export function buildAvanzaAdapterRequest(input: {
  runtime: ExecutionRuntimeIdentityContext;
  payload: AvanzaAdapterOrderPayload;
  automatic_authority_granted: boolean;
}): AvanzaAdapterRequest | null {
  if (hasSecretField(input.payload)) {
    return null;
  }

  const identity = buildAvanzaAdapterExecutionIdentity(input.runtime, input.payload);

  if (!identity) {
    return null;
  }

  const automatic = input.payload.execution_mode === "automatic";
  const maySubmit = automatic && input.automatic_authority_granted && input.payload.authority_scope === "automatic_final_submit";

  return Object.freeze({
    identity,
    payload: input.payload,
    mode: input.payload.execution_mode,
    requires_manual_confirmation: !automatic,
    may_submit: maySubmit,
  });
}

function identityMatches(
  request: AvanzaAdapterRequest,
  event: AvanzaAdapterProgress,
) {
  return (
    event.execution_id === request.identity.execution_id &&
    event.payload_fingerprint === request.identity.payload_fingerprint &&
    event.broker_request_id === request.identity.broker_request_id &&
    event.correlation_id === request.identity.correlation_id &&
    event.side === request.payload.side &&
    event.ticker.toUpperCase() === request.payload.ticker &&
    (event.quantity === undefined || event.quantity === request.payload.quantity)
  );
}

export function validateAvanzaAdapterProgress(
  request: AvanzaAdapterRequest | null | undefined,
  progress: AvanzaAdapterProgress | null | undefined,
): AvanzaAdapterIdentityValidation {
  if (!request || !progress) {
    return { ok: false, reason: "identity_missing" };
  }

  return identityMatches(request, progress)
    ? { ok: true, reason: "ok" }
    : { ok: false, reason: "progress_mismatch" };
}

export function validateAvanzaAdapterConfirmation(
  request: AvanzaAdapterRequest | null | undefined,
  confirmation: AvanzaAdapterConfirmation | null | undefined,
): AvanzaAdapterIdentityValidation {
  if (!request || !confirmation || !requiredText(confirmation.broker_order_id)) {
    return { ok: false, reason: "identity_missing" };
  }

  return identityMatches(request, confirmation)
    ? { ok: true, reason: "ok" }
    : { ok: false, reason: "confirmation_mismatch" };
}

export function reconcileAvanzaAdapterTerminalConfirmation(input: {
  request: AvanzaAdapterRequest | null | undefined;
  accepted: AvanzaAdapterConfirmation | null;
  incoming: AvanzaAdapterConfirmation | null | undefined;
}): AvanzaAdapterConfirmationReconciliation {
  const validation = validateAvanzaAdapterConfirmation(input.request, input.incoming);

  if (!validation.ok || !input.incoming) {
    return { status: "rejected", confirmation: input.accepted };
  }

  if (!input.accepted) {
    return { status: "accepted", confirmation: input.incoming };
  }

  const sameTerminal =
    input.accepted.broker_order_id === input.incoming.broker_order_id &&
    input.accepted.terminal_status === input.incoming.terminal_status &&
    input.accepted.execution_id === input.incoming.execution_id &&
    input.accepted.payload_fingerprint === input.incoming.payload_fingerprint;

  return sameTerminal
    ? { status: "duplicate", confirmation: input.accepted }
    : { status: "needs_review", confirmation: input.accepted };
}

export function toAvanzaAdapterLogSafeRequest(request: AvanzaAdapterRequest) {
  return {
    identity: request.identity,
    payload: request.payload,
    mode: request.mode,
    requires_manual_confirmation: request.requires_manual_confirmation,
    may_submit: request.may_submit,
  };
}
