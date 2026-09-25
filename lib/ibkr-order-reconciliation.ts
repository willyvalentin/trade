import { createHash } from "node:crypto";

export const IBKR_ORDER_RECONCILIATION_VERSION =
  "ibkr_order_reconciliation_v1" as const;
export const IBKR_ORDER_INTENT_VERSION = "ibkr_order_intent_v1" as const;
export const IBKR_ORDER_EVENT_VERSION = "ibkr_order_event_v1" as const;

export type IbkrOrderStatus =
  | "PendingSubmit"
  | "PreSubmitted"
  | "Submitted"
  | "PendingCancel"
  | "ApiCancelled"
  | "Cancelled"
  | "Filled"
  | "Inactive";

export type IbkrPaperOrderIntent = Readonly<{
  intent_version: typeof IBKR_ORDER_INTENT_VERSION;
  intent_id: string;
  owner_user_id: string;
  broker_account_id: string;
  account_mode: "paper";
  source_internal_paper_intent_id: string;
  source_internal_paper_intent_digest: string;
  decision_fingerprint: string;
  risk_policy_version: string;
  conid: number;
  symbol: string;
  security_type: "STK";
  currency: "USD";
  exchange: "SMART";
  side: "BUY" | "SELL";
  quantity: number;
  order_type: "MKT" | "LMT";
  limit_price: string | null;
  time_in_force: "DAY" | "IOC";
  outside_regular_trading_hours: false;
  order_ref: string;
  persisted_at: string;
  expires_at: string;
  submission_state:
    | "persisted_not_submitted"
    | "submission_outcome_unknown"
    | "submission_acknowledged";
}>;

type IbkrEventBase = Readonly<{
  event_version: typeof IBKR_ORDER_EVENT_VERSION;
  event_id: string;
  owner_user_id: string;
  broker_account_id: string;
  intent_id: string;
  order_ref: string;
  conid: number;
  broker_order_id: string;
  perm_id: string | null;
  observed_at: string;
}>;

export type IbkrOrderAcknowledgementEvent = IbkrEventBase &
  Readonly<{
    event_type: "order_acknowledgement";
    status: "PendingSubmit" | "PreSubmitted" | "Submitted";
  }>;

export type IbkrOrderStatusEvent = IbkrEventBase &
  Readonly<{
    event_type: "order_status";
    status: IbkrOrderStatus;
    filled_quantity: number;
    remaining_quantity: number;
    average_fill_price: string | null;
  }>;

export type IbkrExecutionEvent = IbkrEventBase &
  Readonly<{
    event_type: "execution";
    execution_id: string;
    quantity: number;
    price: string;
    executed_at: string;
  }>;

export type IbkrExecutionCorrectionEvent = IbkrEventBase &
  Readonly<{
    event_type: "execution_correction";
    execution_id: string;
    replaces_execution_id: string;
    quantity: number;
    price: string;
    executed_at: string;
  }>;

export type IbkrCommissionEvent = IbkrEventBase &
  Readonly<{
    event_type: "commission";
    execution_id: string;
    commission: string;
    commission_currency: "USD";
  }>;

export type IbkrOrderEvidenceEvent =
  | IbkrOrderAcknowledgementEvent
  | IbkrOrderStatusEvent
  | IbkrExecutionEvent
  | IbkrExecutionCorrectionEvent
  | IbkrCommissionEvent;

export type IbkrOrderReconciliationInput = Readonly<{
  reconciliation_version: typeof IBKR_ORDER_RECONCILIATION_VERSION;
  intent: IbkrPaperOrderIntent;
  events: readonly IbkrOrderEvidenceEvent[];
  reconciled_at: string;
}>;

export type IbkrOrderReconciliationDisposition =
  | "prepared_not_submitted"
  | "awaiting_broker_acknowledgement"
  | "working"
  | "partially_filled"
  | "filled"
  | "cancelled"
  | "inactive"
  | "reconcile_required"
  | "manual_review"
  | "blocked";

export type IbkrOrderReconciliationResult = Readonly<{
  reconciliation_version: typeof IBKR_ORDER_RECONCILIATION_VERSION;
  status: "completed" | "blocked";
  disposition: IbkrOrderReconciliationDisposition;
  reason_codes: readonly string[];
  intent_id: string | null;
  broker_account_id: string | null;
  broker_order_id: string | null;
  perm_id: string | null;
  terminal_order_status: IbkrOrderStatus | null;
  filled_quantity: number;
  remaining_quantity: number | null;
  average_fill_price: string | null;
  commission_total: string | null;
  execution_ids: readonly string[];
  unique_event_count: number;
  duplicate_event_count: number;
  input_digest: string;
  result_digest: string;
  safety: Readonly<{
    paper_only: true;
    intent_must_precede_send: true;
    broker_transport_present: false;
    broker_submission_authorized: false;
    automatic_resubmission_authorized: false;
    live_account_authorized: false;
    provider_request_authorized: false;
    database_write_authorized: false;
  }>;
}>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:._/-]{0,159}$/;
const ACCOUNT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/;
const ORDER_REF_PATTERN = /^ture:[0-9a-f-]{36}:[0-9a-f]{12}$/;
const SYMBOL_PATTERN = /^[A-Z][A-Z0-9.]{0,15}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const DECIMAL_PATTERN = /^(?:0|[1-9]\d{0,11})(?:\.(\d{1,6}))?$/;
const MAX_QUANTITY = 1_000_000;
const DECIMAL_MICROS = BigInt(1_000_000);
const ZERO_MICROS = BigInt(0);

const SAFETY = Object.freeze({
  paper_only: true as const,
  intent_must_precede_send: true as const,
  broker_transport_present: false as const,
  broker_submission_authorized: false as const,
  automatic_resubmission_authorized: false as const,
  live_account_authorized: false as const,
  provider_request_authorized: false as const,
  database_write_authorized: false as const,
});

function canonical(value: unknown): unknown {
  if (typeof value === "number" && !Number.isFinite(value)) {
    return { __invalid_non_finite_number__: String(value) };
  }
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const item of Object.values(value as Record<string, unknown>)) {
      deepFreeze(item);
    }
    Object.freeze(value);
  }
  return value;
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function safePositiveInteger(value: unknown, maximum = Number.MAX_SAFE_INTEGER) {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= maximum
  );
}

function safeNonNegativeInteger(value: unknown, maximum = Number.MAX_SAFE_INTEGER) {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= maximum
  );
}

function decimalMicros(value: unknown, allowZero: boolean) {
  if (typeof value !== "string" || !DECIMAL_PATTERN.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  const micros =
    BigInt(whole) * DECIMAL_MICROS + BigInt(fraction.padEnd(6, "0"));
  if (!allowZero && micros <= ZERO_MICROS) return null;
  return micros;
}

function formatMicros(value: bigint) {
  const whole = value / DECIMAL_MICROS;
  const fraction = (value % DECIMAL_MICROS).toString().padStart(6, "0");
  return `${whole}.${fraction}`;
}

export function buildIbkrOrderReference(intentId: string) {
  if (!UUID_PATTERN.test(intentId)) return null;
  return `ture:${intentId.toLowerCase()}:${digest({
    intent_id: intentId.toLowerCase(),
    namespace: IBKR_ORDER_INTENT_VERSION,
  }).slice(0, 12)}`;
}

function validateIntent(intent: IbkrPaperOrderIntent, reconciledAt: string) {
  const expectedOrderRef = buildIbkrOrderReference(intent.intent_id);
  const limitMicros =
    intent.limit_price === null ? null : decimalMicros(intent.limit_price, false);
  return (
    intent.intent_version === IBKR_ORDER_INTENT_VERSION &&
    UUID_PATTERN.test(intent.intent_id) &&
    UUID_PATTERN.test(intent.owner_user_id) &&
    ACCOUNT_PATTERN.test(intent.broker_account_id) &&
    intent.account_mode === "paper" &&
    IDENTIFIER_PATTERN.test(intent.source_internal_paper_intent_id) &&
    SHA256_PATTERN.test(intent.source_internal_paper_intent_digest) &&
    SHA256_PATTERN.test(intent.decision_fingerprint) &&
    IDENTIFIER_PATTERN.test(intent.risk_policy_version) &&
    safePositiveInteger(intent.conid) &&
    SYMBOL_PATTERN.test(intent.symbol) &&
    intent.security_type === "STK" &&
    intent.currency === "USD" &&
    intent.exchange === "SMART" &&
    (intent.side === "BUY" || intent.side === "SELL") &&
    safePositiveInteger(intent.quantity, MAX_QUANTITY) &&
    (intent.order_type === "MKT" || intent.order_type === "LMT") &&
    ((intent.order_type === "MKT" && intent.limit_price === null) ||
      (intent.order_type === "LMT" && limitMicros !== null)) &&
    (intent.time_in_force === "DAY" || intent.time_in_force === "IOC") &&
    intent.outside_regular_trading_hours === false &&
    ORDER_REF_PATTERN.test(intent.order_ref) &&
    intent.order_ref === expectedOrderRef &&
    explicitInstant(intent.persisted_at) &&
    explicitInstant(intent.expires_at) &&
    Date.parse(intent.persisted_at) < Date.parse(intent.expires_at) &&
    Date.parse(intent.persisted_at) <= Date.parse(reconciledAt) &&
    [
      "persisted_not_submitted",
      "submission_outcome_unknown",
      "submission_acknowledged",
    ].includes(intent.submission_state)
  );
}

function validateEventBase(event: IbkrOrderEvidenceEvent) {
  return (
    event.event_version === IBKR_ORDER_EVENT_VERSION &&
    IDENTIFIER_PATTERN.test(event.event_id) &&
    UUID_PATTERN.test(event.owner_user_id) &&
    ACCOUNT_PATTERN.test(event.broker_account_id) &&
    UUID_PATTERN.test(event.intent_id) &&
    ORDER_REF_PATTERN.test(event.order_ref) &&
    safePositiveInteger(event.conid) &&
    IDENTIFIER_PATTERN.test(event.broker_order_id) &&
    (event.perm_id === null || IDENTIFIER_PATTERN.test(event.perm_id)) &&
    explicitInstant(event.observed_at)
  );
}

function validateEvent(event: IbkrOrderEvidenceEvent) {
  if (!validateEventBase(event)) return false;
  if (event.event_type === "order_acknowledgement") {
    return ["PendingSubmit", "PreSubmitted", "Submitted"].includes(event.status);
  }
  if (event.event_type === "order_status") {
    return (
      [
        "PendingSubmit",
        "PreSubmitted",
        "Submitted",
        "PendingCancel",
        "ApiCancelled",
        "Cancelled",
        "Filled",
        "Inactive",
      ].includes(event.status) &&
      safeNonNegativeInteger(event.filled_quantity, MAX_QUANTITY) &&
      safeNonNegativeInteger(event.remaining_quantity, MAX_QUANTITY) &&
      event.filled_quantity + event.remaining_quantity <= MAX_QUANTITY &&
      (event.average_fill_price === null ||
        decimalMicros(event.average_fill_price, false) !== null)
    );
  }
  if (
    event.event_type === "execution" ||
    event.event_type === "execution_correction"
  ) {
    return (
      IDENTIFIER_PATTERN.test(event.execution_id) &&
      (event.event_type !== "execution_correction" ||
        IDENTIFIER_PATTERN.test(event.replaces_execution_id)) &&
      safePositiveInteger(event.quantity, MAX_QUANTITY) &&
      decimalMicros(event.price, false) !== null &&
      explicitInstant(event.executed_at) &&
      Date.parse(event.executed_at) <= Date.parse(event.observed_at)
    );
  }
  return (
    event.event_type === "commission" &&
    IDENTIFIER_PATTERN.test(event.execution_id) &&
    decimalMicros(event.commission, true) !== null &&
    event.commission_currency === "USD"
  );
}

function eventOrder(event: IbkrOrderEvidenceEvent) {
  return {
    order_acknowledgement: 0,
    order_status: 1,
    execution: 2,
    execution_correction: 3,
    commission: 4,
  }[event.event_type];
}

function terminalStatus(statuses: readonly IbkrOrderStatus[]) {
  const terminal = statuses.filter((status) =>
    ["ApiCancelled", "Cancelled", "Filled", "Inactive"].includes(status),
  );
  return terminal.length > 0 ? terminal[terminal.length - 1] : null;
}

function blocked(inputDigest: string, reasonCodes: readonly string[]) {
  const projection = {
    reconciliation_version: IBKR_ORDER_RECONCILIATION_VERSION,
    status: "blocked" as const,
    disposition: "blocked" as const,
    reason_codes: Array.from(new Set(reasonCodes)).sort(),
    intent_id: null,
    broker_account_id: null,
    broker_order_id: null,
    perm_id: null,
    terminal_order_status: null,
    filled_quantity: 0,
    remaining_quantity: null,
    average_fill_price: null,
    commission_total: null,
    execution_ids: [] as string[],
    unique_event_count: 0,
    duplicate_event_count: 0,
    input_digest: inputDigest,
    safety: SAFETY,
  };
  return deepFreeze({
    ...projection,
    result_digest: digest(projection),
  }) satisfies IbkrOrderReconciliationResult;
}

/**
 * Reconciles already supplied IBKR paper-order evidence. It never connects to
 * IBKR, submits or retries an order, reads credentials, or writes persistence.
 */
export function reconcileIbkrPaperOrderEvidence(
  input: IbkrOrderReconciliationInput,
): IbkrOrderReconciliationResult {
  const inputDigest = digest(input);
  if (
    input.reconciliation_version !== IBKR_ORDER_RECONCILIATION_VERSION ||
    !explicitInstant(input.reconciled_at) ||
    !validateIntent(input.intent, input.reconciled_at) ||
    !Array.isArray(input.events)
  ) {
    return blocked(inputDigest, ["invalid_reconciliation_input"]);
  }

  const eventById = new Map<string, IbkrOrderEvidenceEvent>();
  const eventDigestById = new Map<string, string>();
  let duplicateEventCount = 0;
  for (const event of input.events) {
    if (!validateEvent(event)) {
      return blocked(inputDigest, ["invalid_broker_event"]);
    }
    const eventDigest = digest(event);
    const existingDigest = eventDigestById.get(event.event_id);
    if (existingDigest) {
      if (existingDigest !== eventDigest) {
        return blocked(inputDigest, ["conflicting_event_id_reuse"]);
      }
      duplicateEventCount += 1;
      continue;
    }
    eventById.set(event.event_id, event);
    eventDigestById.set(event.event_id, eventDigest);
  }

  const events = Array.from(eventById.values()).sort((left, right) =>
    left.observed_at.localeCompare(right.observed_at) ||
    eventOrder(left) - eventOrder(right) ||
    left.event_id.localeCompare(right.event_id),
  );
  if (
    events.some(
      (event) =>
        event.owner_user_id !== input.intent.owner_user_id ||
        event.broker_account_id !== input.intent.broker_account_id ||
        event.intent_id !== input.intent.intent_id ||
        event.order_ref !== input.intent.order_ref ||
        event.conid !== input.intent.conid ||
        Date.parse(event.observed_at) < Date.parse(input.intent.persisted_at) ||
        Date.parse(event.observed_at) > Date.parse(input.reconciled_at),
    )
  ) {
    return blocked(inputDigest, ["broker_event_scope_mismatch"]);
  }
  if (
    input.intent.submission_state === "persisted_not_submitted" &&
    events.length > 0
  ) {
    return blocked(inputDigest, ["broker_evidence_before_submission"]);
  }

  const orderIds = new Set(events.map((event) => event.broker_order_id));
  const permIds = new Set(
    events.flatMap((event) => (event.perm_id === null ? [] : [event.perm_id])),
  );
  if (orderIds.size > 1 || permIds.size > 1) {
    return blocked(inputDigest, ["conflicting_broker_order_identity"]);
  }

  const statuses = events.flatMap((event) =>
    event.event_type === "order_acknowledgement" ||
    event.event_type === "order_status"
      ? [event.status]
      : [],
  );
  const statusEvents = events.filter(
    (event): event is IbkrOrderStatusEvent => event.event_type === "order_status",
  );
  const executions = events.filter(
    (event): event is IbkrExecutionEvent => event.event_type === "execution",
  );
  const corrections = events.filter(
    (event): event is IbkrExecutionCorrectionEvent =>
      event.event_type === "execution_correction",
  );
  const commissions = events.filter(
    (event): event is IbkrCommissionEvent => event.event_type === "commission",
  );
  const executionIds = new Set<string>();
  for (const execution of executions) {
    if (executionIds.has(execution.execution_id)) {
      return blocked(inputDigest, ["duplicate_execution_identity"]);
    }
    executionIds.add(execution.execution_id);
  }
  if (corrections.some((event) => !executionIds.has(event.replaces_execution_id))) {
    return blocked(inputDigest, ["orphan_execution_correction"]);
  }
  if (commissions.some((event) => !executionIds.has(event.execution_id))) {
    return blocked(inputDigest, ["orphan_commission"]);
  }

  const filledQuantity = executions.reduce(
    (total, execution) => total + execution.quantity,
    0,
  );
  if (filledQuantity > input.intent.quantity) {
    return blocked(inputDigest, ["execution_quantity_exceeds_intent"]);
  }
  if (
    statusEvents.some(
      (event) =>
        event.filled_quantity > input.intent.quantity ||
        event.remaining_quantity > input.intent.quantity ||
        event.filled_quantity + event.remaining_quantity !== input.intent.quantity,
    )
  ) {
    return blocked(inputDigest, ["order_status_quantity_mismatch"]);
  }

  const terminal = terminalStatus(statuses);
  const terminalKinds = new Set(
    statuses.filter((status) =>
      ["ApiCancelled", "Cancelled", "Filled", "Inactive"].includes(status),
    ),
  );
  const latestStatus = statusEvents.at(-1) ?? null;
  const nonMonotonicStatus = statusEvents.some((event, index) => {
    const prior = statusEvents[index - 1];
    return (
      prior !== undefined &&
      (event.filled_quantity < prior.filled_quantity ||
        event.remaining_quantity > prior.remaining_quantity)
    );
  });
  const commissionExecutionIds = commissions.map((event) => event.execution_id);
  const duplicateCommission =
    new Set(commissionExecutionIds).size !== commissionExecutionIds.length;
  const missingExecutions =
    latestStatus !== null && latestStatus.filled_quantity !== filledQuantity;
  const commissionIds = new Set(commissions.map((event) => event.execution_id));
  const missingCommissions = executions.some(
    (execution) => !commissionIds.has(execution.execution_id),
  );

  const executionValueMicros = executions.reduce(
    (total, execution) =>
      total + BigInt(execution.quantity) * decimalMicros(execution.price, false)!,
    ZERO_MICROS,
  );
  const averageFillPrice =
    filledQuantity === 0
      ? null
      : formatMicros(executionValueMicros / BigInt(filledQuantity));
  const commissionTotalMicros = commissions.reduce(
    (total, commission) =>
      total + decimalMicros(commission.commission, true)!,
    ZERO_MICROS,
  );

  const reasons = new Set<string>();
  let disposition: IbkrOrderReconciliationDisposition;
  if (input.intent.submission_state === "persisted_not_submitted") {
    disposition = "prepared_not_submitted";
    reasons.add("intent_persisted_before_send");
  } else if (events.length === 0 || statuses.length === 0) {
    disposition = "reconcile_required";
    reasons.add("submission_outcome_requires_broker_readback");
  } else if (
    corrections.length > 0 ||
    terminalKinds.size > 1 ||
    nonMonotonicStatus ||
    duplicateCommission
  ) {
    disposition = "manual_review";
    if (corrections.length > 0) {
      reasons.add("execution_correction_requires_manual_review");
    }
    if (terminalKinds.size > 1) reasons.add("conflicting_terminal_statuses");
    if (nonMonotonicStatus) reasons.add("non_monotonic_status_history");
    if (duplicateCommission) reasons.add("duplicate_commission_requires_review");
  } else if (missingExecutions || (terminal === "Filled" && missingCommissions)) {
    disposition = "reconcile_required";
    if (missingExecutions) reasons.add("execution_evidence_incomplete");
    if (missingCommissions) reasons.add("commission_evidence_incomplete");
  } else if (terminal === "Filled") {
    if (filledQuantity !== input.intent.quantity) {
      disposition = "reconcile_required";
      reasons.add("filled_status_without_complete_execution_quantity");
    } else {
      disposition = "filled";
      reasons.add("filled_and_costed");
    }
  } else if (terminal === "ApiCancelled" || terminal === "Cancelled") {
    disposition = "cancelled";
    reasons.add(filledQuantity > 0 ? "cancelled_after_partial_fill" : "cancelled_unfilled");
  } else if (terminal === "Inactive") {
    disposition = "inactive";
    reasons.add("inactive_requires_rejection_context");
  } else if (filledQuantity > 0) {
    disposition = "partially_filled";
    reasons.add(missingCommissions ? "partial_fill_cost_pending" : "partial_fill_observed");
  } else if (statuses.some((status) => status === "Submitted" || status === "PreSubmitted")) {
    disposition = "working";
    reasons.add("working_order_observed");
  } else {
    disposition = "awaiting_broker_acknowledgement";
    reasons.add("broker_acknowledgement_pending");
  }

  const projection = {
    reconciliation_version: IBKR_ORDER_RECONCILIATION_VERSION,
    status: "completed" as const,
    disposition,
    reason_codes: Array.from(reasons).sort(),
    intent_id: input.intent.intent_id,
    broker_account_id: input.intent.broker_account_id,
    broker_order_id: orderIds.values().next().value ?? null,
    perm_id: permIds.values().next().value ?? null,
    terminal_order_status: terminal,
    filled_quantity: filledQuantity,
    remaining_quantity: latestStatus?.remaining_quantity ??
      (events.length === 0 ? input.intent.quantity : null),
    average_fill_price: averageFillPrice,
    commission_total:
      commissions.length === 0 ? null : formatMicros(commissionTotalMicros),
    execution_ids: Array.from(executionIds).sort(),
    unique_event_count: events.length,
    duplicate_event_count: duplicateEventCount,
    input_digest: digest({ ...input, events }),
    safety: SAFETY,
  };
  return deepFreeze({
    ...projection,
    result_digest: digest(projection),
  }) satisfies IbkrOrderReconciliationResult;
}
