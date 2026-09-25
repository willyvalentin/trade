import { expect, test } from "@playwright/test";

import {
  MULTI_EXIT_TRANSACTION_COST_ATTRIBUTION_VERSION,
  attributeBrokerNeutralMultiExitTransactionCosts,
} from "@/lib/broker-neutral-multi-exit-transaction-cost-attribution";
import {
  IBKR_ORDER_EVENT_VERSION,
  IBKR_ORDER_INTENT_VERSION,
  IBKR_ORDER_RECONCILIATION_VERSION,
  buildIbkrOrderReference,
  reconcileIbkrPaperOrderEvidence,
  type IbkrOrderEvidenceEvent,
  type IbkrOrderReconciliationInput,
} from "@/lib/ibkr-order-reconciliation";
import {
  SOURCE_BOUND_IBKR_MULTI_ORDER_PROJECTION_VERSION,
  projectSourceBoundIbkrMultiOrderTransactionCosts,
  type SourceBoundIbkrMultiOrderProjectionInput,
} from "@/lib/source-bound-ibkr-multi-order-transaction-cost-projection";
import {
  IBKR_TRANSACTION_COST_BENCHMARK_EVIDENCE_VERSION,
  SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION,
  type IbkrTransactionCostProjectionInput,
} from "@/lib/source-bound-transaction-cost-projection";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const DECISION_FINGERPRINT = "b".repeat(64);
const PROJECTED_AT = "2026-09-25T20:00:00.000Z";
const PROJECTION_ID = "55555555-5555-4555-8555-555555555555";
const ATTRIBUTION_ID = "66666666-6666-4666-8666-666666666666";

type OrderFixtureOptions = Readonly<{
  index: number;
  role: "entry" | "exit";
  hour: number;
  quantity: number;
  filledQuantity?: number;
  terminal?: "Filled" | "Cancelled";
  price: string;
  decisionFingerprint?: string;
  ownerUserId?: string;
  brokerAccountId?: string;
  conid?: number;
}>;

function uuid(index: number) {
  return `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

function orderFixture(options: OrderFixtureOptions): IbkrTransactionCostProjectionInput {
  const {
    index,
    role,
    hour,
    quantity,
    filledQuantity = quantity,
    terminal = "Filled",
    price,
    decisionFingerprint = DECISION_FINGERPRINT,
    ownerUserId = OWNER_ID,
    brokerAccountId = "paper-account-1",
    conid = 265598,
  } = options;
  const intentId = uuid(index);
  const orderRef = buildIbkrOrderReference(intentId)!;
  const prefix = `2026-09-25T${String(hour).padStart(2, "0")}:00`;
  const side: "BUY" | "SELL" = role === "entry" ? "BUY" : "SELL";
  const terminalFilled = terminal === "Filled" ? quantity : filledQuantity;
  const intent = {
    intent_version: IBKR_ORDER_INTENT_VERSION,
    intent_id: intentId,
    owner_user_id: ownerUserId,
    broker_account_id: brokerAccountId,
    account_mode: "paper" as const,
    source_internal_paper_intent_id: `internal-paper-intent-${index}`,
    source_internal_paper_intent_digest: String(index % 10).repeat(64),
    decision_fingerprint: decisionFingerprint,
    risk_policy_version: "risk-policy-v1",
    conid,
    symbol: "AAPL",
    security_type: "STK" as const,
    currency: "USD" as const,
    exchange: "SMART" as const,
    side,
    quantity,
    order_type: "LMT" as const,
    limit_price: price,
    time_in_force: "DAY" as const,
    outside_regular_trading_hours: false as const,
    order_ref: orderRef,
    persisted_at: `${prefix}:01.000Z`,
    expires_at: `${prefix}:30.000Z`,
    submission_state: "submission_acknowledged" as const,
  };
  const base = (eventId: string, observedAt: string) => ({
    event_version: IBKR_ORDER_EVENT_VERSION,
    event_id: `${eventId}-${index}`,
    owner_user_id: ownerUserId,
    broker_account_id: brokerAccountId,
    intent_id: intentId,
    order_ref: orderRef,
    conid,
    broker_order_id: `order-${index}`,
    perm_id: `perm-${index}`,
    observed_at: observedAt,
  });
  const events: IbkrOrderEvidenceEvent[] = [
    {
      ...base("ack", `${prefix}:02.000Z`),
      event_type: "order_acknowledgement",
      status: "Submitted",
    },
    {
      ...base("status-working", `${prefix}:02.100Z`),
      event_type: "order_status",
      status: "Submitted",
      filled_quantity: 0,
      remaining_quantity: quantity,
      average_fill_price: null,
    },
  ];
  if (filledQuantity > 0) {
    events.push(
      {
        ...base("execution", `${prefix}:03.100Z`),
        event_type: "execution",
        execution_id: `execution-${index}`,
        quantity: filledQuantity,
        price,
        executed_at: `${prefix}:03.000Z`,
      },
      {
        ...base("commission", `${prefix}:03.200Z`),
        event_type: "commission",
        execution_id: `execution-${index}`,
        commission: "0.500000",
        commission_currency: "USD",
      },
    );
  }
  events.push({
    ...base("status-terminal", `${prefix}:04.000Z`),
    event_type: "order_status",
    status: terminal,
    filled_quantity: terminalFilled,
    remaining_quantity: quantity - terminalFilled,
    average_fill_price: terminalFilled > 0 ? price : null,
  });

  const sourceInput: IbkrOrderReconciliationInput = {
    reconciliation_version: IBKR_ORDER_RECONCILIATION_VERSION,
    intent,
    events,
    reconciled_at: `${prefix}:10.000Z`,
  };
  const sourceResult = reconcileIbkrPaperOrderEvidence(sourceInput);
  const hasUnfilled = terminalFilled < quantity;
  return {
    projection_version: SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION,
    projected_at: PROJECTED_AT,
    leg_id: `ibkr-${role}-leg-${index}`,
    source_input: sourceInput,
    source_result: sourceResult,
    benchmark: {
      evidence_version: IBKR_TRANSACTION_COST_BENCHMARK_EVIDENCE_VERSION,
      evidence_id: `ibkr-benchmark-${role}-${index}`,
      source_result_digest: sourceResult.result_digest,
      owner_user_id: ownerUserId,
      decision_fingerprint: decisionFingerprint,
      symbol: "AAPL",
      position_direction: "long",
      role,
      decision_observed_at: `${prefix}:00.000Z`,
      decision_reference_price_usd: price,
      arrival_observed_at: `${prefix}:01.500Z`,
      arrival_reference_price_usd: price,
      arrival_benchmark_version: "ibkr-paper-nbbo-arrival-v1",
      order_submitted_at: `${prefix}:02.000Z`,
      other_fees_usd: "0.000000",
      unfilled_opportunity: hasUnfilled
        ? {
            benchmark_price_usd: role === "exit" ? "101.000000" : "100.000000",
            benchmark_observed_at: `${prefix}:05.000Z`,
          }
        : { benchmark_price_usd: null, benchmark_observed_at: null },
      spread_cost_estimate: {
        amount_usd: "0.200000",
        estimate_version: "ibkr-paper-nbbo-spread-v1",
      },
      market_impact_estimate: { amount_usd: null, estimate_version: null },
    },
  };
}

function projection(
  orders: readonly IbkrTransactionCostProjectionInput[] = [
    orderFixture({ index: 1, role: "entry", hour: 14, quantity: 10, price: "100.000000" }),
    orderFixture({ index: 2, role: "exit", hour: 15, quantity: 4, price: "102.000000" }),
    orderFixture({ index: 3, role: "exit", hour: 16, quantity: 6, price: "101.000000" }),
  ],
  overrides: Partial<SourceBoundIbkrMultiOrderProjectionInput> = {},
): SourceBoundIbkrMultiOrderProjectionInput {
  return {
    projection_version: SOURCE_BOUND_IBKR_MULTI_ORDER_PROJECTION_VERSION,
    projection_id: PROJECTION_ID,
    projected_at: PROJECTED_AT,
    orders,
    ...overrides,
  };
}

function attribute(
  projected: ReturnType<typeof projectSourceBoundIbkrMultiOrderTransactionCosts>,
) {
  return attributeBrokerNeutralMultiExitTransactionCosts({
    attribution_version: MULTI_EXIT_TRANSACTION_COST_ATTRIBUTION_VERSION,
    attribution_id: ATTRIBUTION_ID,
    owner_user_id: OWNER_ID,
    decision_fingerprint: DECISION_FINGERPRINT,
    symbol: "AAPL",
    position_direction: "long",
    evidence_cohort: "ibkr_paper_observed",
    benchmark_policy_version: "sv-n5-ibkr-paper-benchmark-v2",
    cost_policy_version: "sv-n3-cost-v2",
    decision_expected_gross_edge_usd: "20.000000",
    legs: projected.legs,
    attributed_at: PROJECTED_AT,
  });
}

test("binds one IBKR entry and two exits into an N.3-compatible lifecycle", () => {
  const input = projection();
  const projected = projectSourceBoundIbkrMultiOrderTransactionCosts(input);

  expect(projected).toMatchObject({
    status: "ready",
    projection_id: PROJECTION_ID,
    owner_user_id: OWNER_ID,
    decision_fingerprint: DECISION_FINGERPRINT,
    symbol: "AAPL",
    position_direction: "long",
    broker_account_id: "paper-account-1",
    conid: 265598,
    reason_codes: [],
    blocked_order_index: null,
    safety: {
      each_source_core_recomputed: true,
      v1_projection_semantics_mutated: false,
      source_order_lifecycles_collapsed: false,
      broker_action_authorized: false,
    },
  });
  expect(projected.legs.map((leg) => leg.role)).toEqual(["entry", "exit", "exit"]);
  expect(projected.source_result_digests).toHaveLength(3);
  expect(new Set(projected.source_result_digests).size).toBe(3);
  expect(attribute(projected)).toMatchObject({
    status: "completed",
    disposition: "attributed",
    entered_quantity: 10,
    exited_quantity: 10,
    remaining_open_quantity: 0,
  });
});

test("retains an unfilled cancelled exit as a costed lifecycle before a retry", () => {
  const orders = [
    orderFixture({ index: 1, role: "entry", hour: 14, quantity: 10, price: "100.000000" }),
    orderFixture({
      index: 2,
      role: "exit",
      hour: 15,
      quantity: 10,
      filledQuantity: 0,
      terminal: "Cancelled",
      price: "102.000000",
    }),
    orderFixture({ index: 3, role: "exit", hour: 16, quantity: 10, price: "101.000000" }),
  ];
  const projected = projectSourceBoundIbkrMultiOrderTransactionCosts(projection(orders));

  expect(projected.status).toBe("ready");
  expect(projected.legs[1]).toMatchObject({
    disposition: "cancelled",
    requested_quantity: 10,
    fills: [],
    unfilled_opportunity_benchmark_price_usd: "101.000000",
  });
  expect(attribute(projected)).toMatchObject({
    status: "completed",
    disposition: "attributed",
    entered_quantity: 10,
    exited_quantity: 10,
    remaining_open_quantity: 0,
  });
});

test("preserves a partially filled cancellation before the remaining exit", () => {
  const orders = [
    orderFixture({ index: 1, role: "entry", hour: 14, quantity: 10, price: "100.000000" }),
    orderFixture({
      index: 2,
      role: "exit",
      hour: 15,
      quantity: 10,
      filledQuantity: 4,
      terminal: "Cancelled",
      price: "102.000000",
    }),
    orderFixture({ index: 3, role: "exit", hour: 16, quantity: 6, price: "101.000000" }),
  ];
  const projected = projectSourceBoundIbkrMultiOrderTransactionCosts(projection(orders));

  expect(projected.status).toBe("ready");
  expect(projected.legs[1]).toMatchObject({
    disposition: "partially_filled_cancelled",
    requested_quantity: 10,
    fills: [{ quantity: 4 }],
  });
  expect(attribute(projected)).toMatchObject({
    status: "completed",
    entered_quantity: 10,
    exited_quantity: 10,
    remaining_open_quantity: 0,
  });
});

test("surfaces the exact child index when an N.2 source projection blocks", () => {
  const orders = [...projection().orders];
  orders[1] = {
    ...orders[1],
    source_result: { ...orders[1].source_result, result_digest: "f".repeat(64) },
  };

  expect(projectSourceBoundIbkrMultiOrderTransactionCosts(projection(orders))).toMatchObject({
    status: "blocked",
    reason_codes: ["source_order_projection_blocked"],
    source_reason_codes: ["claimed_source_result_mismatch"],
    blocked_order_index: 1,
    legs: [],
  });
});

test("blocks individually valid orders that do not share one source decision", () => {
  const orders = [
    orderFixture({ index: 1, role: "entry", hour: 14, quantity: 10, price: "100.000000" }),
    orderFixture({
      index: 2,
      role: "exit",
      hour: 15,
      quantity: 10,
      price: "101.000000",
      decisionFingerprint: "c".repeat(64),
    }),
  ];

  expect(projectSourceBoundIbkrMultiOrderTransactionCosts(projection(orders))).toMatchObject({
    status: "blocked",
    reason_codes: ["cross_order_source_binding_mismatch"],
  });
});

test("blocks duplicate receipts, out-of-order exits and exit overcommitment", () => {
  const baseOrders = projection().orders;
  expect(
    projectSourceBoundIbkrMultiOrderTransactionCosts(
      projection([baseOrders[0], baseOrders[1], baseOrders[1]]),
    ),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["duplicate_order_lifecycle_identity"],
  });

  const outOfOrder = [
    orderFixture({ index: 1, role: "entry", hour: 14, quantity: 10, price: "100.000000" }),
    orderFixture({ index: 2, role: "exit", hour: 16, quantity: 4, price: "102.000000" }),
    orderFixture({ index: 3, role: "exit", hour: 15, quantity: 6, price: "101.000000" }),
  ];
  expect(
    projectSourceBoundIbkrMultiOrderTransactionCosts(projection(outOfOrder)),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["ordered_exit_lifecycle_invalid"],
    blocked_order_index: 2,
  });

  const overcommitted = [
    orderFixture({ index: 1, role: "entry", hour: 14, quantity: 10, price: "100.000000" }),
    orderFixture({ index: 2, role: "exit", hour: 15, quantity: 6, price: "102.000000" }),
    orderFixture({ index: 3, role: "exit", hour: 16, quantity: 5, price: "101.000000" }),
  ];
  expect(
    projectSourceBoundIbkrMultiOrderTransactionCosts(projection(overcommitted)),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["ordered_exit_lifecycle_invalid"],
    blocked_order_index: 2,
  });
});

test("is deterministic, immutable and rejects added authority or hostile input", () => {
  const input = projection();
  const first = projectSourceBoundIbkrMultiOrderTransactionCosts(input);
  const second = projectSourceBoundIbkrMultiOrderTransactionCosts(structuredClone(input));

  expect(first).toEqual(second);
  expect(first.result_digest).toBe(second.result_digest);
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.legs)).toBe(true);
  expect(Object.isFrozen(first.legs[0].fills)).toBe(true);

  const extra = { ...input, submit_orders: true };
  expect(projectSourceBoundIbkrMultiOrderTransactionCosts(extra)).toMatchObject({
    status: "blocked",
    reason_codes: ["invalid_projection_input"],
    safety: {
      provider_request_authorized: false,
      database_write_authorized: false,
      ranking_change_authorized: false,
      publication_authorized: false,
      broker_transport_present: false,
      broker_action_authorized: false,
    },
  });

  const hostile = Object.defineProperty({}, "orders", {
    enumerable: true,
    get() {
      throw new Error("must not escape the projection boundary");
    },
  });
  expect(projectSourceBoundIbkrMultiOrderTransactionCosts(hostile)).toMatchObject({
    status: "blocked",
    reason_codes: ["invalid_projection_input"],
    legs: [],
  });
});
