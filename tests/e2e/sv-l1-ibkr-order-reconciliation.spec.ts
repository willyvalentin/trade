import { expect, test } from "@playwright/test";

import {
  buildIbkrOrderReference,
  IBKR_ORDER_EVENT_VERSION,
  IBKR_ORDER_INTENT_VERSION,
  IBKR_ORDER_RECONCILIATION_VERSION,
  reconcileIbkrPaperOrderEvidence,
  type IbkrOrderEvidenceEvent,
  type IbkrOrderReconciliationInput,
} from "@/lib/ibkr-order-reconciliation";

const owner = "11111111-1111-4111-8111-111111111111";
const intentId = "22222222-2222-4222-8222-222222222222";
const orderRef = buildIbkrOrderReference(intentId)!;

function input(
  overrides: Partial<IbkrOrderReconciliationInput> = {},
): IbkrOrderReconciliationInput {
  return {
    reconciliation_version: IBKR_ORDER_RECONCILIATION_VERSION,
    reconciled_at: "2026-09-25T15:45:30.000Z",
    intent: {
      intent_version: IBKR_ORDER_INTENT_VERSION,
      intent_id: intentId,
      owner_user_id: owner,
      broker_account_id: "paper-account-1",
      account_mode: "paper",
      source_internal_paper_intent_id: "internal-paper-intent-1",
      source_internal_paper_intent_digest: "a".repeat(64),
      decision_fingerprint: "b".repeat(64),
      risk_policy_version: "risk-policy-v1",
      conid: 265598,
      symbol: "AAPL",
      security_type: "STK",
      currency: "USD",
      exchange: "SMART",
      side: "BUY",
      quantity: 10,
      order_type: "LMT",
      limit_price: "180.250000",
      time_in_force: "DAY",
      outside_regular_trading_hours: false,
      order_ref: orderRef,
      persisted_at: "2026-09-25T15:44:59.000Z",
      expires_at: "2026-09-25T15:46:00.000Z",
      submission_state: "submission_acknowledged",
    },
    events: [],
    ...overrides,
  };
}

function base(eventId: string, observedAt: string) {
  return {
    event_version: IBKR_ORDER_EVENT_VERSION,
    event_id: eventId,
    owner_user_id: owner,
    broker_account_id: "paper-account-1",
    intent_id: intentId,
    order_ref: orderRef,
    conid: 265598,
    broker_order_id: "order-9001",
    perm_id: "perm-8001",
    observed_at: observedAt,
  } as const;
}

function filledEvents(): IbkrOrderEvidenceEvent[] {
  return [
    {
      ...base("ack-1", "2026-09-25T15:45:00.000Z"),
      event_type: "order_acknowledgement",
      status: "Submitted",
    },
    {
      ...base("status-1", "2026-09-25T15:45:01.000Z"),
      event_type: "order_status",
      status: "Submitted",
      filled_quantity: 0,
      remaining_quantity: 10,
      average_fill_price: null,
    },
    {
      ...base("exec-1", "2026-09-25T15:45:02.000Z"),
      event_type: "execution",
      execution_id: "execution-1",
      quantity: 4,
      price: "180.100000",
      executed_at: "2026-09-25T15:45:01.900Z",
    },
    {
      ...base("commission-1", "2026-09-25T15:45:02.200Z"),
      event_type: "commission",
      execution_id: "execution-1",
      commission: "0.400000",
      commission_currency: "USD",
    },
    {
      ...base("exec-2", "2026-09-25T15:45:03.000Z"),
      event_type: "execution",
      execution_id: "execution-2",
      quantity: 6,
      price: "180.300000",
      executed_at: "2026-09-25T15:45:02.900Z",
    },
    {
      ...base("commission-2", "2026-09-25T15:45:03.200Z"),
      event_type: "commission",
      execution_id: "execution-2",
      commission: "0.600000",
      commission_currency: "USD",
    },
    {
      ...base("status-2", "2026-09-25T15:45:04.000Z"),
      event_type: "order_status",
      status: "Filled",
      filled_quantity: 10,
      remaining_quantity: 0,
      average_fill_price: "180.220000",
    },
  ];
}

test("creates a deterministic broker order reference", () => {
  expect(orderRef).toMatch(/^ture:22222222-2222-4222-8222-222222222222:[0-9a-f]{12}$/);
  expect(buildIbkrOrderReference(intentId.toUpperCase())).toBe(orderRef);
  expect(buildIbkrOrderReference("not-a-uuid")).toBeNull();
});

test("keeps a durable unsent intent prepared without authorizing transport", () => {
  const request = input();
  const result = reconcileIbkrPaperOrderEvidence({
    ...request,
    intent: { ...request.intent, submission_state: "persisted_not_submitted" },
  });

  expect(result).toMatchObject({
    status: "completed",
    disposition: "prepared_not_submitted",
    reason_codes: ["intent_persisted_before_send"],
    filled_quantity: 0,
    remaining_quantity: 10,
    unique_event_count: 0,
    safety: {
      paper_only: true,
      broker_transport_present: false,
      broker_submission_authorized: false,
      automatic_resubmission_authorized: false,
      live_account_authorized: false,
      database_write_authorized: false,
    },
  });
});

test("reconciles out-of-order partial executions into one fully costed fill", () => {
  const events = filledEvents();
  const ordered = reconcileIbkrPaperOrderEvidence(input({ events }));
  const reversed = reconcileIbkrPaperOrderEvidence(
    input({ events: [...events].reverse() }),
  );

  expect(ordered).toMatchObject({
    status: "completed",
    disposition: "filled",
    reason_codes: ["filled_and_costed"],
    broker_order_id: "order-9001",
    perm_id: "perm-8001",
    terminal_order_status: "Filled",
    filled_quantity: 10,
    remaining_quantity: 0,
    average_fill_price: "180.220000",
    commission_total: "1.000000",
    execution_ids: ["execution-1", "execution-2"],
    unique_event_count: 7,
  });
  expect(reversed.result_digest).toBe(ordered.result_digest);
  expect(reversed.input_digest).toBe(ordered.input_digest);
  expect(Object.isFrozen(ordered)).toBe(true);
  expect(Object.isFrozen(ordered.safety)).toBe(true);
  expect(Object.isFrozen(ordered.execution_ids)).toBe(true);
});

test("deduplicates exact event retries and blocks conflicting reuse", () => {
  const events = filledEvents();
  const exactRetry = reconcileIbkrPaperOrderEvidence(
    input({ events: [...events, { ...events[0] }] }),
  );
  expect(exactRetry.status).toBe("completed");
  expect(exactRetry.unique_event_count).toBe(7);
  expect(exactRetry.duplicate_event_count).toBe(1);

  const conflict = {
    ...events[0],
    status: "PreSubmitted",
  } as IbkrOrderEvidenceEvent;
  const rejected = reconcileIbkrPaperOrderEvidence(
    input({ events: [...events, conflict] }),
  );
  expect(rejected).toMatchObject({
    status: "blocked",
    disposition: "blocked",
    reason_codes: ["conflicting_event_id_reuse"],
  });
});

test("blocks cross-account, cross-intent and conflicting broker identity evidence", () => {
  const events = filledEvents();
  const crossAccount = {
    ...events[0],
    broker_account_id: "another-paper-account",
  } as IbkrOrderEvidenceEvent;
  expect(
    reconcileIbkrPaperOrderEvidence(input({ events: [crossAccount] })),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["broker_event_scope_mismatch"],
  });

  const conflictingOrder = {
    ...events[1],
    broker_order_id: "order-9002",
  } as IbkrOrderEvidenceEvent;
  expect(
    reconcileIbkrPaperOrderEvidence(
      input({ events: [events[0], conflictingOrder] }),
    ),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["conflicting_broker_order_identity"],
  });
});

test("never turns an unknown submission outcome into an automatic retry", () => {
  const request = input();
  const result = reconcileIbkrPaperOrderEvidence({
    ...request,
    intent: {
      ...request.intent,
      submission_state: "submission_outcome_unknown",
    },
  });
  expect(result).toMatchObject({
    status: "completed",
    disposition: "reconcile_required",
    reason_codes: ["submission_outcome_requires_broker_readback"],
    safety: { automatic_resubmission_authorized: false },
  });
});

test("requires complete execution and commission evidence before a filled receipt", () => {
  const withoutExecution = filledEvents().filter(
    (event) => event.event_id !== "exec-2" && event.event_id !== "commission-2",
  );
  expect(
    reconcileIbkrPaperOrderEvidence(input({ events: withoutExecution })),
  ).toMatchObject({
    status: "completed",
    disposition: "reconcile_required",
    reason_codes: ["execution_evidence_incomplete"],
  });

  const withoutCommission = filledEvents().filter(
    (event) => event.event_id !== "commission-2",
  );
  expect(
    reconcileIbkrPaperOrderEvidence(input({ events: withoutCommission })),
  ).toMatchObject({
    status: "completed",
    disposition: "reconcile_required",
    reason_codes: ["commission_evidence_incomplete"],
  });
});

test("blocks impossible quantity evidence and broker evidence before submission", () => {
  const events = filledEvents();
  const overfill = {
    ...events[2],
    quantity: 11,
  } as IbkrOrderEvidenceEvent;
  expect(
    reconcileIbkrPaperOrderEvidence(input({ events: [events[0], overfill] })),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["execution_quantity_exceeds_intent"],
  });

  const request = input({ events: [events[0]] });
  expect(
    reconcileIbkrPaperOrderEvidence({
      ...request,
      intent: { ...request.intent, submission_state: "persisted_not_submitted" },
    }),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["broker_evidence_before_submission"],
  });
});

test("quarantines execution corrections for explicit manual review", () => {
  const events = filledEvents().slice(0, 4);
  const correction: IbkrOrderEvidenceEvent = {
    ...base("correction-1", "2026-09-25T15:45:02.500Z"),
    event_type: "execution_correction",
    execution_id: "execution-1.02",
    replaces_execution_id: "execution-1",
    quantity: 4,
    price: "180.090000",
    executed_at: "2026-09-25T15:45:02.400Z",
  };
  const result = reconcileIbkrPaperOrderEvidence(
    input({ events: [...events, correction] }),
  );
  expect(result).toMatchObject({
    status: "completed",
    disposition: "manual_review",
    reason_codes: ["execution_correction_requires_manual_review"],
    safety: { automatic_resubmission_authorized: false },
  });
});

test("quarantines non-monotonic status history instead of inventing state", () => {
  const events = filledEvents();
  const regressed: IbkrOrderEvidenceEvent = {
    ...base("status-regressed", "2026-09-25T15:45:05.000Z"),
    event_type: "order_status",
    status: "Submitted",
    filled_quantity: 4,
    remaining_quantity: 6,
    average_fill_price: "180.100000",
  };
  expect(
    reconcileIbkrPaperOrderEvidence(input({ events: [...events, regressed] })),
  ).toMatchObject({
    status: "completed",
    disposition: "manual_review",
    reason_codes: ["non_monotonic_status_history"],
    safety: { automatic_resubmission_authorized: false },
  });
});

test("fails closed on live, malformed price and malformed time inputs", () => {
  const request = input();
  expect(
    reconcileIbkrPaperOrderEvidence({
      ...request,
      intent: { ...request.intent, account_mode: "live" as "paper" },
    }),
  ).toMatchObject({ status: "blocked", reason_codes: ["invalid_reconciliation_input"] });
  expect(
    reconcileIbkrPaperOrderEvidence({
      ...request,
      intent: { ...request.intent, limit_price: "180.1234567" },
    }),
  ).toMatchObject({ status: "blocked", reason_codes: ["invalid_reconciliation_input"] });
  expect(
    reconcileIbkrPaperOrderEvidence({ ...request, reconciled_at: "2026-09-25" }),
  ).toMatchObject({ status: "blocked", reason_codes: ["invalid_reconciliation_input"] });
});
