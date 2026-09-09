import "server-only";

import { createHash } from "node:crypto";

import {
  SEMI_AUTOMATIC_EXECUTION_AUTHORITY,
  validateExecutionIntent,
  type ExecutionIntent,
  type ExecutionSafetyCheck,
  type ExecutionForbiddenAgentAction,
} from "@/lib/execution";

// This module defines a source-only C-01 pre-broker audit boundary. It does
// not create a client, read credentials, call a database, persist an audit,
// invoke a route, prepare an order, call a broker, or enable any runtime.

export const CANONICAL_EXECUTION_INTENT_AUDIT_CONTRACT_VERSION =
  "canonical_execution_intent_audit_v1" as const;

export type CanonicalExecutionIntentAuditContractVersion =
  typeof CANONICAL_EXECUTION_INTENT_AUDIT_CONTRACT_VERSION;

export const CANONICAL_EXECUTION_INTENT_AUDIT_DISPOSITION =
  "canonical_intent_audit_prepared_not_persisted" as const;

export type CanonicalExecutionIntentAuditDisposition =
  typeof CANONICAL_EXECUTION_INTENT_AUDIT_DISPOSITION;

export type CanonicalExecutionIntentAuditAuthorityBoundaries = {
  mayPersistAudit: false;
  mayReadDatabase: false;
  mayCreateDatabaseClient: false;
  mayCallRoute: false;
  mayPrepareBrokerOrder: false;
  mayCallBroker: false;
  maySubmitBrokerOrder: false;
  mayEnableAutomaticExecution: false;
};

export const CANONICAL_EXECUTION_INTENT_AUDIT_AUTHORITY_BOUNDARIES = {
  mayPersistAudit: false,
  mayReadDatabase: false,
  mayCreateDatabaseClient: false,
  mayCallRoute: false,
  mayPrepareBrokerOrder: false,
  mayCallBroker: false,
  maySubmitBrokerOrder: false,
  mayEnableAutomaticExecution: false,
} as const satisfies CanonicalExecutionIntentAuditAuthorityBoundaries;

export type CanonicalExecutionIntentAuditInput = {
  ownerUserId: string;
  intent: ExecutionIntent;
};

export type CanonicalExecutionIntentAuditPayload = {
  contract_version: CanonicalExecutionIntentAuditContractVersion;
  owner_user_id: string;
  intent: {
    intent_version: "1.0";
    intent_id: string;
    created_at: string;
    mode: "semi_automatic";
    action: "buy" | "sell";
    trigger_type: ExecutionIntent["trigger_type"];
    trigger_priority: number;
    broker_hint: "AVANZA";
    source: ExecutionIntent["source"];
    authority: {
      authority_version: "1.0";
      mode: "semi_automatic";
      can_create_execution_intent: true;
      can_prepare_broker_form: true;
      can_submit_broker_order: false;
      allowFinalSubmit: false;
      requires_human_final_confirmation: true;
      final_confirmation_actor: "human";
      required_safety_checks: ExecutionSafetyCheck[];
      forbidden_agent_actions: ExecutionForbiddenAgentAction[];
    };
    trading_package: {
      package_version: "1.0";
      recommendation_id: string | null;
      live_position_id: string | null;
      ticker: string;
      market: string;
      quantity: number;
      order_type: ExecutionIntent["trading_package"]["order_type"];
      limit_price: number | null;
      stop_loss: number | null;
      target_price: number | null;
      expires_at: string | null;
      payload_id: string | null;
      payload_fingerprint: string | null;
    };
    safety_warnings: string[];
  };
};

export type CanonicalExecutionIntentAuditInsertCandidate = {
  owner_user_id: string;
  canonical_intent_identity: string;
  semantic_payload_sha256: string;
  idempotency_key: string;
  authority_contract_version: CanonicalExecutionIntentAuditContractVersion;
  audit_event_type: "intent_issued";
  audit_status: "prepared";
  intent_id: string;
  intent_created_at: string;
  execution_mode: "semi_automatic";
  action: "buy" | "sell";
  trigger_type: ExecutionIntent["trigger_type"];
  trigger_priority: number;
  broker_hint: "AVANZA";
  intent_source: ExecutionIntent["source"];
  recommendation_id: string | null;
  position_id: string | null;
  ticker: string;
  market: string;
  quantity: number;
  order_type: ExecutionIntent["trading_package"]["order_type"];
  limit_price: number | null;
  stop_loss: number | null;
  target_price: number | null;
  expires_at: string | null;
  payload_id: string | null;
  payload_fingerprint: string | null;
  safety_warnings: string[];
  intent_payload: CanonicalExecutionIntentAuditPayload;
  audit_envelope: {
    contract_version: CanonicalExecutionIntentAuditContractVersion;
    canonical_intent_identity: string;
    semantic_payload_sha256: string;
    idempotency_key: string;
    owner_user_id: string;
    intent_id: string;
    audit_event_type: "intent_issued";
    audit_status: "prepared";
  };
};

export type CanonicalExecutionIntentAuditPreparedResult = {
  valid: true;
  persisted: false;
  disposition: CanonicalExecutionIntentAuditDisposition;
  errors: [];
  warnings: string[];
  payload: CanonicalExecutionIntentAuditPayload;
  canonicalIntentIdentity: string;
  semanticPayloadSha256: string;
  idempotencyKey: string;
  insertCandidate: CanonicalExecutionIntentAuditInsertCandidate;
  authority: CanonicalExecutionIntentAuditAuthorityBoundaries;
};

export type CanonicalExecutionIntentAuditRejectedResult = {
  valid: false;
  persisted: false;
  disposition: "canonical_intent_audit_rejected";
  errors: string[];
  warnings: [];
  authority: CanonicalExecutionIntentAuditAuthorityBoundaries;
};

export type CanonicalExecutionIntentAuditResult =
  | CanonicalExecutionIntentAuditPreparedResult
  | CanonicalExecutionIntentAuditRejectedResult;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const exitTriggerTypes = new Set<ExecutionIntent["trigger_type"]>([
  "exit_stop_loss_reached",
  "exit_risk_required",
  "exit_end_of_day",
  "exit_target_reached",
  "manual_exit_requested",
]);

const admittedTriggerTypes = new Set<ExecutionIntent["trigger_type"]>([
  ...exitTriggerTypes,
  "entry_recommendation_ready",
  "manual_entry_requested",
]);

const admittedIntentSources = new Set<ExecutionIntent["source"]>([
  "recommendation",
  "live_day_trade_position",
  "manual",
  "risk_control",
]);

const admittedOrderTypes = new Set<
  ExecutionIntent["trading_package"]["order_type"]
>(["market", "limit", "market_reference", "limit_reference"]);

function isNonEmptyText(value: unknown, maximum = 256): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maximum &&
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isInspectablePlainData(
  value: unknown,
  seen = new Set<object>(),
): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value !== "object") {
    return typeof value !== "function";
  }

  const objectValue = value as object;
  if (seen.has(objectValue)) {
    return false;
  }
  seen.add(objectValue);

  if (Array.isArray(objectValue)) {
    const lengthDescriptor = Object.getOwnPropertyDescriptor(
      objectValue,
      "length",
    );
    if (
      !lengthDescriptor ||
      !("value" in lengthDescriptor) ||
      typeof lengthDescriptor.value !== "number" ||
      !Number.isSafeInteger(lengthDescriptor.value) ||
      lengthDescriptor.value < 0
    ) {
      return false;
    }

    for (let index = 0; index < lengthDescriptor.value; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(
        objectValue,
        String(index),
      );
      if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
        return false;
      }
      if (!isInspectablePlainData(descriptor.value, seen)) {
        return false;
      }
    }

    return Reflect.ownKeys(objectValue).every((key) => {
      if (key === "length") {
        return true;
      }
      if (typeof key !== "string" || !/^(?:0|[1-9][0-9]*)$/.test(key)) {
        return false;
      }
      const index = Number(key);
      return index >= 0 && index < lengthDescriptor.value;
    });
  }

  const prototype = Object.getPrototypeOf(objectValue);
  // Do not compare identity with this realm's Object.prototype: callers may
  // legitimately cross a server/runtime realm boundary. A plain object's
  // prototype is nevertheless itself a root prototype (its prototype is
  // null); class, Date and custom-prototype instances do not satisfy that
  // shape. Null-prototype records are rejected so every accepted record has
  // the normal plain-data semantics expected by the canonicalizer.
  if (!prototype || Object.getPrototypeOf(prototype) !== null) {
    return false;
  }

  for (const key of Reflect.ownKeys(objectValue)) {
    if (typeof key !== "string") {
      return false;
    }
    const descriptor = Object.getOwnPropertyDescriptor(objectValue, key);
    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor) ||
      !isInspectablePlainData(descriptor.value, seen)
    ) {
      return false;
    }
  }

  return true;
}

function hasInspectableExecutionIntentShape(
  value: unknown,
): value is ExecutionIntent {
  if (
    !isInspectablePlainData(value) ||
    !isRecord(value) ||
    !isRecord(value.authority) ||
    !isRecord(value.trading_package)
  ) {
    return false;
  }

  const { authority, trading_package: tradingPackage } = value;

  return (
    typeof value.intent_id === "string" &&
    typeof value.created_at === "string" &&
    typeof value.mode === "string" &&
    typeof value.action === "string" &&
    typeof value.trigger_type === "string" &&
    typeof value.broker_hint === "string" &&
    typeof value.source === "string" &&
    Array.isArray(value.safety_warnings) &&
    Array.isArray(authority.required_safety_checks) &&
    Array.isArray(authority.forbidden_agent_actions) &&
    typeof tradingPackage.ticker === "string" &&
    typeof tradingPackage.market === "string" &&
    typeof tradingPackage.order_type === "string"
  );
}

function canonicalText(
  value: string | null | undefined,
  maximum = 256,
): string | null {
  return isNonEmptyText(value, maximum) ? value.trim() : null;
}

function canonicalTimestamp(value: string): string | null {
  const parsed = Date.parse(value);

  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

function canonicalPrice(value: number | null): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function exactList<T extends string>(actual: readonly T[], expected: readonly T[]) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function authorityMatchesSemiAutomaticIntent(intent: ExecutionIntent): boolean {
  const actual = intent.authority;
  const expected = SEMI_AUTOMATIC_EXECUTION_AUTHORITY;

  return (
    actual.authority_version === expected.authority_version &&
    actual.mode === expected.mode &&
    actual.can_create_execution_intent ===
      expected.can_create_execution_intent &&
    actual.can_prepare_broker_form === expected.can_prepare_broker_form &&
    actual.can_submit_broker_order === expected.can_submit_broker_order &&
    actual.allowFinalSubmit === expected.allowFinalSubmit &&
    actual.requires_human_final_confirmation ===
      expected.requires_human_final_confirmation &&
    actual.final_confirmation_actor === expected.final_confirmation_actor &&
    exactList(
      actual.required_safety_checks,
      expected.required_safety_checks,
    ) &&
    exactList(
      actual.forbidden_agent_actions,
      expected.forbidden_agent_actions,
    )
  );
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
    Object.freeze(value);
  }

  return value;
}

function reject(errors: string[]): CanonicalExecutionIntentAuditRejectedResult {
  return {
    valid: false,
    persisted: false,
    disposition: "canonical_intent_audit_rejected",
    errors,
    warnings: [],
    authority: CANONICAL_EXECUTION_INTENT_AUDIT_AUTHORITY_BOUNDARIES,
  };
}

function canonicalizeIntent(
  input: CanonicalExecutionIntentAuditInput,
): { payload: CanonicalExecutionIntentAuditPayload; errors: string[] } {
  const errors: string[] = [];
  const { intent } = input;
  const validation = validateExecutionIntent(intent);
  const ownerUserId = canonicalText(input.ownerUserId);
  const intentId = canonicalText(intent.intent_id);
  const intentCreatedAt = canonicalTimestamp(intent.created_at);
  const ticker = canonicalText(intent.trading_package.ticker, 32);
  const market = canonicalText(intent.trading_package.market, 32);
  const recommendationId = canonicalText(intent.trading_package.recommendation_id);
  const positionId = canonicalText(intent.trading_package.live_position_id);
  const payloadId = canonicalText(intent.trading_package.payload_id);
  const payloadFingerprint = canonicalText(intent.trading_package.payload_fingerprint);
  const expiresAt = intent.trading_package.expires_at
    ? canonicalTimestamp(intent.trading_package.expires_at)
    : null;
  const quantity = intent.trading_package.quantity;
  const limitPrice = canonicalPrice(intent.trading_package.limit_price);
  const stopLoss = canonicalPrice(intent.trading_package.stop_loss);
  const targetPrice = canonicalPrice(intent.trading_package.target_price);

  if (!validation.valid) {
    errors.push(...validation.errors.map((error) => `execution_intent_invalid:${error}`));
  }

  if (!ownerUserId || !uuidPattern.test(ownerUserId)) {
    errors.push("owner_user_id_invalid");
  }

  if (!intentId) {
    errors.push("intent_id_invalid");
  }

  if (!intentCreatedAt) {
    errors.push("intent_created_at_invalid");
  }

  if (intent.intent_version !== "1.0") {
    errors.push("intent_version_not_admitted");
  }

  if (intent.mode !== "semi_automatic") {
    errors.push("execution_mode_not_semi_automatic");
  }

  if (intent.action !== "buy" && intent.action !== "sell") {
    errors.push("execution_action_not_admitted");
  }

  if (!admittedTriggerTypes.has(intent.trigger_type)) {
    errors.push("execution_trigger_type_not_admitted");
  }

  if (intent.broker_hint !== "AVANZA") {
    errors.push("broker_hint_not_admitted");
  }

  if (!admittedIntentSources.has(intent.source)) {
    errors.push("intent_source_not_admitted");
  }

  if (intent.trading_package.package_version !== "1.0") {
    errors.push("trading_package_version_not_admitted");
  }

  if (!admittedOrderTypes.has(intent.trading_package.order_type)) {
    errors.push("order_type_not_admitted");
  }

  if (!authorityMatchesSemiAutomaticIntent(intent)) {
    errors.push("execution_authority_not_exact_semi_automatic");
  }

  if (intent.broker_result !== null) {
    errors.push("pre_broker_intent_must_not_include_broker_result");
  }

  if (!ticker) {
    errors.push("ticker_invalid");
  }

  if (!market) {
    errors.push("market_invalid");
  }

  if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity <= 0) {
    errors.push("quantity_invalid");
  }

  if (limitPrice !== intent.trading_package.limit_price) {
    errors.push("limit_price_invalid");
  }

  if (stopLoss !== intent.trading_package.stop_loss) {
    errors.push("stop_loss_invalid");
  }

  if (targetPrice !== intent.trading_package.target_price) {
    errors.push("target_price_invalid");
  }

  if (
    ["limit", "limit_reference"].includes(intent.trading_package.order_type) &&
    (!limitPrice || limitPrice <= 0)
  ) {
    errors.push("limit_order_requires_positive_limit_price");
  }

  if (
    ["market", "market_reference"].includes(intent.trading_package.order_type) &&
    limitPrice !== null
  ) {
    errors.push("market_order_must_not_include_limit_price");
  }

  if (stopLoss !== null && stopLoss <= 0) {
    errors.push("stop_loss_must_be_positive_when_present");
  }

  if (targetPrice !== null && targetPrice <= 0) {
    errors.push("target_price_must_be_positive_when_present");
  }

  if (intent.trading_package.expires_at && !expiresAt) {
    errors.push("expires_at_invalid");
  }

  if (
    intentCreatedAt &&
    expiresAt &&
    Date.parse(expiresAt) <= Date.parse(intentCreatedAt)
  ) {
    errors.push("expires_at_must_follow_intent_creation");
  }

  if (exitTriggerTypes.has(intent.trigger_type)) {
    if (!positionId) {
      errors.push("exit_intent_requires_position_id");
    }
  } else if (!recommendationId) {
    errors.push("entry_intent_requires_recommendation_id");
  }

  const payload: CanonicalExecutionIntentAuditPayload = {
    contract_version: CANONICAL_EXECUTION_INTENT_AUDIT_CONTRACT_VERSION,
    owner_user_id: ownerUserId?.toLowerCase() ?? "",
    intent: {
      intent_version: "1.0",
      intent_id: intentId ?? "",
      created_at: intentCreatedAt ?? "",
      mode: "semi_automatic",
      action: intent.action,
      trigger_type: intent.trigger_type,
      trigger_priority: intent.trigger_priority,
      broker_hint: "AVANZA",
      source: intent.source,
      authority: {
        authority_version: "1.0",
        mode: "semi_automatic",
        can_create_execution_intent: true,
        can_prepare_broker_form: true,
        can_submit_broker_order: false,
        allowFinalSubmit: false,
        requires_human_final_confirmation: true,
        final_confirmation_actor: "human",
        required_safety_checks: [
          ...SEMI_AUTOMATIC_EXECUTION_AUTHORITY.required_safety_checks,
        ],
        forbidden_agent_actions: [
          ...SEMI_AUTOMATIC_EXECUTION_AUTHORITY.forbidden_agent_actions,
        ],
      },
      trading_package: {
        package_version: "1.0",
        recommendation_id: recommendationId,
        live_position_id: positionId,
        ticker: ticker?.toUpperCase() ?? "",
        market: market?.toUpperCase() ?? "",
        quantity: typeof quantity === "number" ? quantity : Number.NaN,
        order_type: intent.trading_package.order_type,
        limit_price: limitPrice,
        stop_loss: stopLoss,
        target_price: targetPrice,
        expires_at: expiresAt,
        payload_id: payloadId,
        payload_fingerprint: payloadFingerprint,
      },
      safety_warnings: [...new Set(intent.safety_warnings.map((warning) => warning.trim()))]
        .filter(Boolean)
        .sort(),
    },
  };

  return { payload, errors };
}

export function prepareCanonicalExecutionIntentAudit(
  input: CanonicalExecutionIntentAuditInput,
): CanonicalExecutionIntentAuditResult {
  try {
    if (
      !isInspectablePlainData(input) ||
      !isRecord(input) ||
      !hasInspectableExecutionIntentShape(input.intent)
    ) {
      return reject(["canonical_execution_intent_audit_input_invalid"]);
    }

    const { payload, errors } = canonicalizeIntent(input);

    if (errors.length > 0) {
      return reject([...new Set(errors)]);
    }

    const frozenPayload = deepFreeze(payload);
    const semanticPayloadSha256 = createHash("sha256")
      .update(JSON.stringify(frozenPayload), "utf8")
      .digest("hex");
    const canonicalIntentIdentity =
      `execution_intent:v1:${semanticPayloadSha256}`;
    const idempotencyKey =
      `execution_intent_audit:v1:${canonicalIntentIdentity}`;
    const auditEnvelope = deepFreeze({
      contract_version: CANONICAL_EXECUTION_INTENT_AUDIT_CONTRACT_VERSION,
      canonical_intent_identity: canonicalIntentIdentity,
      semantic_payload_sha256: semanticPayloadSha256,
      idempotency_key: idempotencyKey,
      owner_user_id: frozenPayload.owner_user_id,
      intent_id: frozenPayload.intent.intent_id,
      audit_event_type: "intent_issued" as const,
      audit_status: "prepared" as const,
    });
    const insertCandidate = deepFreeze({
      owner_user_id: frozenPayload.owner_user_id,
      canonical_intent_identity: canonicalIntentIdentity,
      semantic_payload_sha256: semanticPayloadSha256,
      idempotency_key: idempotencyKey,
      authority_contract_version: CANONICAL_EXECUTION_INTENT_AUDIT_CONTRACT_VERSION,
      audit_event_type: "intent_issued" as const,
      audit_status: "prepared" as const,
      intent_id: frozenPayload.intent.intent_id,
      intent_created_at: frozenPayload.intent.created_at,
      execution_mode: "semi_automatic" as const,
      action: frozenPayload.intent.action,
      trigger_type: frozenPayload.intent.trigger_type,
      trigger_priority: frozenPayload.intent.trigger_priority,
      broker_hint: "AVANZA" as const,
      intent_source: frozenPayload.intent.source,
      recommendation_id: frozenPayload.intent.trading_package.recommendation_id,
      position_id: frozenPayload.intent.trading_package.live_position_id,
      ticker: frozenPayload.intent.trading_package.ticker,
      market: frozenPayload.intent.trading_package.market,
      quantity: frozenPayload.intent.trading_package.quantity,
      order_type: frozenPayload.intent.trading_package.order_type,
      limit_price: frozenPayload.intent.trading_package.limit_price,
      stop_loss: frozenPayload.intent.trading_package.stop_loss,
      target_price: frozenPayload.intent.trading_package.target_price,
      expires_at: frozenPayload.intent.trading_package.expires_at,
      payload_id: frozenPayload.intent.trading_package.payload_id,
      payload_fingerprint: frozenPayload.intent.trading_package.payload_fingerprint,
      safety_warnings: [...frozenPayload.intent.safety_warnings],
      intent_payload: frozenPayload,
      audit_envelope: auditEnvelope,
    });

    return deepFreeze({
      valid: true,
      persisted: false,
      disposition: CANONICAL_EXECUTION_INTENT_AUDIT_DISPOSITION,
      errors: [],
      warnings: [
        "canonical_intent_audit_prepared_only",
        "future_private_server_writer_required",
      ],
      payload: frozenPayload,
      canonicalIntentIdentity,
      semanticPayloadSha256,
      idempotencyKey,
      insertCandidate,
      authority: CANONICAL_EXECUTION_INTENT_AUDIT_AUTHORITY_BOUNDARIES,
    });
  } catch {
    return reject(["canonical_execution_intent_audit_input_invalid"]);
  }
}
