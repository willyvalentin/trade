import { expect, test } from "@playwright/test";

import {
  attributeBrokerNeutralTransactionCosts,
  TRANSACTION_COST_ATTRIBUTION_VERSION,
} from "@/lib/broker-neutral-transaction-cost-attribution";
import {
  buildIbkrOrderReference,
  IBKR_ORDER_EVENT_VERSION,
  IBKR_ORDER_INTENT_VERSION,
  IBKR_ORDER_RECONCILIATION_VERSION,
  reconcileIbkrPaperOrderEvidence,
  type IbkrOrderEvidenceEvent,
  type IbkrOrderReconciliationInput,
} from "@/lib/ibkr-order-reconciliation";
import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import { INTERNAL_PAPER_MARKET_REPLAY_VERSION } from "@/lib/internal-paper-market-replay";
import {
  INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION,
  INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
  runInternalPaperReplayExecution,
  type InternalPaperReplayExecutionInput,
} from "@/lib/internal-paper-replay-execution";
import type { SharedCandleCacheCandle } from "@/lib/shared-candle-cache";
import {
  IBKR_TRANSACTION_COST_BENCHMARK_EVIDENCE_VERSION,
  INTERNAL_REPLAY_DECISION_BENCHMARK_EVIDENCE_VERSION,
  projectIbkrPaperOrderTransactionCostLeg,
  projectInternalReplayTransactionCostLegs,
  SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION,
  type IbkrTransactionCostBenchmarkEvidence,
  type IbkrTransactionCostProjectionInput,
  type InternalReplayDecisionBenchmarkEvidence,
  type InternalReplayTransactionCostProjectionInput,
} from "@/lib/source-bound-transaction-cost-projection";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ACCOUNT_ID = "22222222-2222-4222-8222-222222222222";
const INTENT_ID = "33333333-3333-4333-8333-333333333333";
const ORDER_ID = "44444444-4444-4444-8444-444444444444";
const ATTRIBUTION_ID = "55555555-5555-4555-8555-555555555555";
const DECISION_FINGERPRINT = "b".repeat(64);
const ORDER_REF = buildIbkrOrderReference(INTENT_ID)!;

function ibkrBase(eventId: string, observedAt: string) {
  return {
    event_version: IBKR_ORDER_EVENT_VERSION,
    event_id: eventId,
    owner_user_id: OWNER_ID,
    broker_account_id: "paper-account-1",
    intent_id: INTENT_ID,
    order_ref: ORDER_REF,
    conid: 265598,
    broker_order_id: "order-9001",
    perm_id: "perm-8001",
    observed_at: observedAt,
  } as const;
}

function ibkrEvents(terminal: "Filled" | "Cancelled" = "Filled"):
  IbkrOrderEvidenceEvent[] {
  const partial = terminal === "Cancelled";
  return [
    {
      ...ibkrBase("ack-1", "2026-09-25T15:45:00.000Z"),
      event_type: "order_acknowledgement",
      status: "Submitted",
    },
    {
      ...ibkrBase("status-1", "2026-09-25T15:45:01.000Z"),
      event_type: "order_status",
      status: "Submitted",
      filled_quantity: 0,
      remaining_quantity: 10,
      average_fill_price: null,
    },
    {
      ...ibkrBase("exec-1", "2026-09-25T15:45:02.000Z"),
      event_type: "execution",
      execution_id: "execution-1",
      quantity: 4,
      price: "180.100000",
      executed_at: "2026-09-25T15:45:01.900Z",
    },
    {
      ...ibkrBase("commission-1", "2026-09-25T15:45:02.200Z"),
      event_type: "commission",
      execution_id: "execution-1",
      commission: "0.400000",
      commission_currency: "USD",
    },
    ...(!partial
      ? ([
          {
            ...ibkrBase("exec-2", "2026-09-25T15:45:03.000Z"),
            event_type: "execution",
            execution_id: "execution-2",
            quantity: 6,
            price: "180.300000",
            executed_at: "2026-09-25T15:45:02.900Z",
          },
          {
            ...ibkrBase("commission-2", "2026-09-25T15:45:03.200Z"),
            event_type: "commission",
            execution_id: "execution-2",
            commission: "0.600000",
            commission_currency: "USD",
          },
        ] satisfies IbkrOrderEvidenceEvent[])
      : []),
    {
      ...ibkrBase("status-2", "2026-09-25T15:45:04.000Z"),
      event_type: "order_status",
      status: terminal,
      filled_quantity: partial ? 4 : 10,
      remaining_quantity: partial ? 6 : 0,
      average_fill_price: partial ? "180.100000" : "180.220000",
    },
  ];
}

function ibkrInput(events = ibkrEvents()): IbkrOrderReconciliationInput {
  return {
    reconciliation_version: IBKR_ORDER_RECONCILIATION_VERSION,
    reconciled_at: "2026-09-25T15:45:30.000Z",
    intent: {
      intent_version: IBKR_ORDER_INTENT_VERSION,
      intent_id: INTENT_ID,
      owner_user_id: OWNER_ID,
      broker_account_id: "paper-account-1",
      account_mode: "paper",
      source_internal_paper_intent_id: "internal-paper-intent-1",
      source_internal_paper_intent_digest: "a".repeat(64),
      decision_fingerprint: DECISION_FINGERPRINT,
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
      order_ref: ORDER_REF,
      persisted_at: "2026-09-25T15:44:59.000Z",
      expires_at: "2026-09-25T15:46:00.000Z",
      submission_state: "submission_acknowledged",
    },
    events,
  };
}

function ibkrBenchmark(
  sourceResultDigest: string,
  overrides: Partial<IbkrTransactionCostBenchmarkEvidence> = {},
): IbkrTransactionCostBenchmarkEvidence {
  return {
    evidence_version: IBKR_TRANSACTION_COST_BENCHMARK_EVIDENCE_VERSION,
    evidence_id: "ibkr-benchmark-aapl-entry-1",
    source_result_digest: sourceResultDigest,
    owner_user_id: OWNER_ID,
    decision_fingerprint: DECISION_FINGERPRINT,
    symbol: "AAPL",
    position_direction: "long",
    role: "entry",
    decision_observed_at: "2026-09-25T15:44:50.000Z",
    decision_reference_price_usd: "180.000000",
    arrival_observed_at: "2026-09-25T15:44:58.000Z",
    arrival_reference_price_usd: "180.050000",
    arrival_benchmark_version: "ibkr-paper-nbbo-arrival-v1",
    order_submitted_at: "2026-09-25T15:45:00.000Z",
    other_fees_usd: "0.050000",
    unfilled_opportunity: {
      benchmark_price_usd: null,
      benchmark_observed_at: null,
    },
    spread_cost_estimate: {
      amount_usd: "0.500000",
      estimate_version: "ibkr-paper-nbbo-spread-v1",
    },
    market_impact_estimate: {
      amount_usd: null,
      estimate_version: null,
    },
    ...overrides,
  };
}

function ibkrProjection(
  sourceInput = ibkrInput(),
  benchmarkOverrides: Partial<IbkrTransactionCostBenchmarkEvidence> = {},
): IbkrTransactionCostProjectionInput {
  const sourceResult = reconcileIbkrPaperOrderEvidence(sourceInput);
  return {
    projection_version: SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION,
    projected_at: "2026-09-25T15:46:00.000Z",
    leg_id: "ibkr-aapl-entry-1",
    source_input: sourceInput,
    source_result: sourceResult,
    benchmark: ibkrBenchmark(sourceResult.result_digest, benchmarkOverrides),
  };
}

function candleId(index: number) {
  return `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
}

function candles(overrides: Record<number, Partial<SharedCandleCacheCandle>> = {}) {
  const open = Date.parse("2026-09-21T13:30:00.000Z");
  return Array.from({ length: 390 }, (_, index) => ({
    candle_id: candleId(index),
    candle: {
      contract_version: "shared_candle_cache_v1",
      provider: "licensed_fixture",
      ticker: "AAPL",
      interval: "1min",
      timestamp: new Date(open + index * 60_000).toISOString(),
      open: 100,
      high: index === 389 ? 101.25 : 100.25,
      low: 99.75,
      close: index === 389 ? 101 : 100,
      volume: 10_000,
      timezone: "America/New_York",
      adjusted: true,
      market_session: "regular",
      fetched_at: "2026-09-21T20:01:00.000Z",
      source_request_id: "fixture-request-2026-09-21",
      validation_status: "valid",
      ...overrides[index],
    } satisfies SharedCandleCacheCandle,
  }));
}

function replayEntry(): InternalPaperEntryCommand {
  return {
    command_version: "internal_paper_entry_command_v1",
    fill_model_version: "internal_paper_immediate_costed_fill_v1",
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    scan_run_id: "scan-2026-09-21",
    scan_run_fingerprint: "a".repeat(64),
    snapshot_id: "snapshot-1",
    snapshot_fingerprint: DECISION_FINGERPRINT,
    candidate_identity: "candidate-aapl",
    strategy_id: "pilot-long",
    strategy_version: "1.0.0",
    strategy_rollback_identity: "pilot-long@0.9.0",
    symbol_selection_policy_id: "pilot-ten",
    symbol_selection_policy_version: "1.0.0",
    observed_universe_version: "pilot-universe-2026-09-21",
    ticker: "AAPL",
    quantity: 10,
    arrival_price: 100,
    stop_price: 98,
    target_price: 110,
    submitted_at: "2026-09-21T13:31:00.000Z",
  };
}

function replayInput(): InternalPaperReplayExecutionInput {
  return {
    execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
    order_id: ORDER_ID,
    base_replay: {
      replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
      replay_id: "sv-n2-aapl-2026-09-21",
      deterministic_seed: "sv-n2-seed-v1",
      dataset: {
        dataset_id: "licensed-aapl-minute-fixture",
        dataset_version: "2026-09-21.v1",
        source_reference: "fixture://sv-n2/aapl/2026-09-21",
        entitlement_reference: "test-fixture-no-external-distribution",
        retention_rights_reference: "repository-test-fixture",
        point_in_time_as_of: "2026-09-21T20:05:00.000Z",
        ticker: "AAPL",
        trading_date: "2026-09-21",
        session_open: "2026-09-21T13:30:00.000Z",
        session_close: "2026-09-21T19:59:00.000Z",
        session_calendar_reference: "fixture-calendar:regular-session",
        corporate_action_status: "verified_none",
        corporate_action_reference: "fixture-corporate-actions:none",
        complete_regular_session: true,
      },
      account: {
        account_config_version: "sv-n2-paper-config-v1",
        initial_cash: 100_000,
        per_trade_risk_cap: 1_000,
        daily_loss_cap: 2_000,
        spread_bps: 10,
        slippage_bps: 5,
        commission_per_order: 1,
        target_exit_fraction_bps: 5_000,
      },
      entry: replayEntry(),
      candles: candles(),
    },
    policy: {
      policy_version: "sv-n2-ioc-v1",
      order_type: "market",
      time_in_force: "ioc",
      limit_price: null,
      latency_ms: 120_000,
      liquidity_proxy_version: INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION,
      max_volume_participation_bps: 100,
      minimum_fill_quantity: 1,
      maximum_order_quantity: 100,
    },
  };
}

function replayBenchmark(
  sourceResultDigest: string,
  overrides: Partial<InternalReplayDecisionBenchmarkEvidence> = {},
): InternalReplayDecisionBenchmarkEvidence {
  return {
    evidence_version: INTERNAL_REPLAY_DECISION_BENCHMARK_EVIDENCE_VERSION,
    evidence_id: "replay-decision-aapl-1",
    source_result_digest: sourceResultDigest,
    owner_user_id: OWNER_ID,
    decision_fingerprint: DECISION_FINGERPRINT,
    symbol: "AAPL",
    decision_observed_at: "2026-09-21T13:30:30.000Z",
    decision_reference_price_usd: "99.900000",
    unfilled_opportunity: {
      benchmark_price_usd: null,
      benchmark_observed_at: null,
    },
    ...overrides,
  };
}

function replayProjection(
  sourceInput = replayInput(),
  benchmarkOverrides: Partial<InternalReplayDecisionBenchmarkEvidence> = {},
): InternalReplayTransactionCostProjectionInput {
  const sourceResult = runInternalPaperReplayExecution(sourceInput);
  return {
    projection_version: SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION,
    projected_at: "2026-09-21T20:10:00.000Z",
    entry_leg_id: "replay-aapl-entry-1",
    exit_leg_id: "replay-aapl-exit-1",
    source_input: sourceInput,
    source_result: sourceResult,
    decision_benchmark: replayBenchmark(sourceResult.result_digest, benchmarkOverrides),
  };
}

test("projects recomputed, fully filled IBKR paper evidence into one immutable N.1 leg", () => {
  const input = ibkrProjection();
  const first = projectIbkrPaperOrderTransactionCostLeg(input);
  const second = projectIbkrPaperOrderTransactionCostLeg(input);

  expect(first).toMatchObject({
    status: "ready",
    source_kind: "ibkr_paper_reconciliation",
    source_input_digest: input.source_result.input_digest,
    source_result_digest: input.source_result.result_digest,
    benchmark_evidence_ids: ["ibkr-benchmark-aapl-entry-1"],
    reason_codes: [],
    safety: {
      source_core_recomputed: true,
      claimed_source_result_trusted_without_recomputation: false,
      provider_request_authorized: false,
      broker_action_authorized: false,
    },
  });
  expect(first.legs[0]).toMatchObject({
    role: "entry",
    side: "BUY",
    disposition: "filled",
    requested_quantity: 10,
    commission_usd: "1.000000",
    source_execution_digest: input.source_result.result_digest,
    fills: [
      { fill_id: "execution-1", quantity: 4, price_usd: "180.100000" },
      { fill_id: "execution-2", quantity: 6, price_usd: "180.300000" },
    ],
  });
  expect(first.projection_digest).toBe(second.projection_digest);
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.legs)).toBe(true);
  expect(Object.isFrozen(first.legs[0].fills)).toBe(true);
});

test("maps a terminal IBKR partial cancellation without inventing missing opportunity cost", () => {
  const input = ibkrProjection(ibkrInput(ibkrEvents("Cancelled")));
  const result = projectIbkrPaperOrderTransactionCostLeg(input);

  expect(result.status).toBe("ready");
  expect(result.legs[0]).toMatchObject({
    disposition: "partially_filled_cancelled",
    requested_quantity: 10,
    commission_usd: "0.400000",
    unfilled_opportunity_benchmark_price_usd: null,
  });
  const attributed = attributeBrokerNeutralTransactionCosts({
    attribution_version: TRANSACTION_COST_ATTRIBUTION_VERSION,
    attribution_id: ATTRIBUTION_ID,
    owner_user_id: OWNER_ID,
    decision_fingerprint: DECISION_FINGERPRINT,
    symbol: "AAPL",
    position_direction: "long",
    evidence_cohort: "ibkr_paper_observed",
    benchmark_policy_version: "sv-n2-benchmark-v1",
    cost_policy_version: "sv-n1-cost-v1",
    decision_expected_gross_edge_usd: null,
    legs: result.legs,
    attributed_at: input.projected_at,
  });
  expect(attributed).toMatchObject({
    status: "completed",
    disposition: "attributed_with_incomplete_cost",
    total_attributable_cost_usd: null,
  });
});

test("rejects forged IBKR results, unbound benchmarks and nonterminal source dispositions", () => {
  const valid = ibkrProjection();
  const forged: IbkrTransactionCostProjectionInput = {
    ...valid,
    source_result: { ...valid.source_result, filled_quantity: 9 },
  };
  expect(projectIbkrPaperOrderTransactionCostLeg(forged)).toMatchObject({
    status: "blocked",
    reason_codes: ["claimed_source_result_mismatch"],
  });

  const unbound = ibkrProjection(undefined, { decision_fingerprint: "c".repeat(64) });
  expect(projectIbkrPaperOrderTransactionCostLeg(unbound)).toMatchObject({
    status: "blocked",
    reason_codes: ["benchmark_source_binding_mismatch"],
  });

  const workingInput = ibkrInput(ibkrEvents().slice(0, 2));
  expect(projectIbkrPaperOrderTransactionCostLeg(ibkrProjection(workingInput))).toMatchObject({
    status: "blocked",
    reason_codes: ["source_outcome_not_terminal_attributable"],
  });

  const futureSource = {
    ...ibkrProjection(),
    projected_at: "2026-09-25T15:45:05.000Z",
  };
  expect(projectIbkrPaperOrderTransactionCostLeg(futureSource)).toMatchObject({
    status: "blocked",
    reason_codes: ["source_cutoff_after_projection"],
  });

  const incompleteCommissionInput = ibkrInput(
    ibkrEvents("Cancelled").filter((event) => event.event_type !== "commission"),
  );
  expect(
    projectIbkrPaperOrderTransactionCostLeg(
      ibkrProjection(incompleteCommissionInput),
    ),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["source_commission_evidence_incomplete"],
  });
});

test("projects recomputed internal replay entry and single exit into N.1 round-trip legs", () => {
  const input = replayProjection();
  const projected = projectInternalReplayTransactionCostLegs(input);

  expect(projected).toMatchObject({
    status: "ready",
    source_kind: "internal_paper_replay_execution",
    source_input_digest: input.source_result.input_digest,
    source_result_digest: input.source_result.result_digest,
    benchmark_evidence_ids: ["replay-decision-aapl-1"],
    reason_codes: [],
  });
  expect(projected.legs).toHaveLength(2);
  expect(projected.legs[0]).toMatchObject({
    role: "entry",
    side: "BUY",
    disposition: "filled",
    requested_quantity: 10,
    arrival_reference_price_usd: "100.000000",
    commission_usd: "1.000000",
  });
  expect(projected.legs[1]).toMatchObject({
    role: "exit",
    side: "SELL",
    disposition: "filled",
    requested_quantity: 10,
    commission_usd: "1.000000",
  });

  const attributed = attributeBrokerNeutralTransactionCosts({
    attribution_version: TRANSACTION_COST_ATTRIBUTION_VERSION,
    attribution_id: ATTRIBUTION_ID,
    owner_user_id: OWNER_ID,
    decision_fingerprint: DECISION_FINGERPRINT,
    symbol: "AAPL",
    position_direction: "long",
    evidence_cohort: "internal_paper_modeled",
    benchmark_policy_version: "sv-n2-replay-benchmark-v1",
    cost_policy_version: "sv-n1-cost-v1",
    decision_expected_gross_edge_usd: "10.000000",
    legs: projected.legs,
    attributed_at: input.projected_at,
  });
  expect(attributed).toMatchObject({
    status: "completed",
    disposition: "attributed",
    round_trip_matched_quantity: 10,
  });
});

test("preserves replay partial-fill incompleteness instead of inventing zero opportunity cost", () => {
  const sourceInput = replayInput();
  sourceInput.base_replay.candles[2].candle.volume = 500;
  const projected = projectInternalReplayTransactionCostLegs(replayProjection(sourceInput));

  expect(projected.status).toBe("ready");
  expect(projected.legs[0]).toMatchObject({
    disposition: "partially_filled_cancelled",
    requested_quantity: 10,
    fills: [{ quantity: 5 }],
    unfilled_opportunity_benchmark_price_usd: null,
  });
  const attributed = attributeBrokerNeutralTransactionCosts({
    attribution_version: TRANSACTION_COST_ATTRIBUTION_VERSION,
    attribution_id: ATTRIBUTION_ID,
    owner_user_id: OWNER_ID,
    decision_fingerprint: DECISION_FINGERPRINT,
    symbol: "AAPL",
    position_direction: "long",
    evidence_cohort: "internal_paper_modeled",
    benchmark_policy_version: "sv-n2-replay-benchmark-v1",
    cost_policy_version: "sv-n1-cost-v1",
    decision_expected_gross_edge_usd: null,
    legs: projected.legs,
    attributed_at: "2026-09-21T20:10:00.000Z",
  });
  expect(attributed).toMatchObject({
    disposition: "attributed_with_incomplete_cost",
    total_attributable_cost_usd: null,
  });
});

test("rejects forged replay results, future decision evidence and multi-order exits", () => {
  const valid = replayProjection();
  const forged: InternalReplayTransactionCostProjectionInput = {
    ...valid,
    source_result: { ...valid.source_result, result_digest: "f".repeat(64) },
  };
  expect(projectInternalReplayTransactionCostLegs(forged)).toMatchObject({
    status: "blocked",
    reason_codes: ["claimed_source_result_mismatch"],
  });

  const future = replayProjection(undefined, {
    decision_observed_at: "2026-09-21T13:32:00.000Z",
  });
  expect(projectInternalReplayTransactionCostLegs(future)).toMatchObject({
    status: "blocked",
    reason_codes: ["benchmark_chronology_invalid"],
  });

  const futureDataset = {
    ...replayProjection(),
    projected_at: "2026-09-21T20:02:00.000Z",
  };
  expect(projectInternalReplayTransactionCostLegs(futureDataset)).toMatchObject({
    status: "blocked",
    reason_codes: ["source_cutoff_after_projection"],
  });

  const baseMultiExitInput = replayInput();
  const multiExitInput: InternalPaperReplayExecutionInput = {
    ...baseMultiExitInput,
    base_replay: {
      ...baseMultiExitInput.base_replay,
      entry: { ...baseMultiExitInput.base_replay.entry, target_price: 100.1 },
    },
  };
  expect(
    projectInternalReplayTransactionCostLegs(replayProjection(multiExitInput)),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["multiple_exit_orders_not_supported"],
  });
});

test("rejects extra projection authority fields and keeps every action authority false", () => {
  const input = replayProjection() as unknown as Record<string, unknown>;
  input.publish = true;
  const result = projectInternalReplayTransactionCostLegs(input);
  expect(result).toMatchObject({
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
});

test("fails closed on cyclic inputs and throwing accessors", () => {
  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;
  expect(projectIbkrPaperOrderTransactionCostLeg(cyclic)).toMatchObject({
    status: "blocked",
    reason_codes: ["invalid_projection_input"],
  });

  const hostile = replayProjection() as unknown as Record<string, unknown>;
  Object.defineProperty(hostile, "decision_benchmark", {
    enumerable: true,
    get() {
      throw new Error("must not escape the projection boundary");
    },
  });
  expect(projectInternalReplayTransactionCostLegs(hostile)).toMatchObject({
    status: "blocked",
    reason_codes: ["projection_input_unreadable"],
    legs: [],
  });
});
