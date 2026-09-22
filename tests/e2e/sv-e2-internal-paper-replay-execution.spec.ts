import { expect, test } from "@playwright/test";

import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import {
  INTERNAL_PAPER_MARKET_REPLAY_VERSION,
  runInternalPaperMarketReplay,
} from "@/lib/internal-paper-market-replay";
import {
  INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
  runInternalPaperReplayExecution,
  type InternalPaperReplayExecutionInput,
} from "@/lib/internal-paper-replay-execution";
import type { SharedCandleCacheCandle } from "@/lib/shared-candle-cache";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ACCOUNT_ID = "22222222-2222-4222-8222-222222222222";
const ORDER_ID = "33333333-3333-4333-8333-333333333333";

function candleId(index: number) {
  return `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
}

function candles(
  overrides: Record<number, Partial<SharedCandleCacheCandle>> = {},
) {
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

function entry(): InternalPaperEntryCommand {
  return {
    command_version: "internal_paper_entry_command_v1",
    fill_model_version: "internal_paper_immediate_costed_fill_v1",
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    scan_run_id: "scan-2026-09-21",
    scan_run_fingerprint: "scan-fingerprint",
    snapshot_id: "snapshot-1",
    snapshot_fingerprint: "snapshot-fingerprint",
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

function input(
  overrides: Partial<InternalPaperReplayExecutionInput> = {},
): InternalPaperReplayExecutionInput {
  return {
    execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
    order_id: ORDER_ID,
    base_replay: {
      replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
      replay_id: "sv-e2-aapl-2026-09-21",
      deterministic_seed: "sv-e2-seed-v1",
      dataset: {
        dataset_id: "licensed-aapl-minute-fixture",
        dataset_version: "2026-09-21.v1",
        source_reference: "fixture://sv-e2/aapl/2026-09-21",
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
        account_config_version: "sv-e2-paper-config-v1",
        initial_cash: 100_000,
        per_trade_risk_cap: 1_000,
        daily_loss_cap: 2_000,
        spread_bps: 10,
        slippage_bps: 5,
        commission_per_order: 1,
        target_exit_fraction_bps: 5_000,
      },
      entry: entry(),
      candles: candles(),
    },
    policy: {
      policy_version: "sv-e2-ioc-v1",
      order_type: "market",
      time_in_force: "ioc",
      limit_price: null,
      latency_ms: 120_000,
      max_volume_participation_bps: 100,
      minimum_fill_quantity: 1,
      maximum_order_quantity: 100,
    },
    ...overrides,
  };
}

test.describe("SV-E2 deterministic replay execution realism", () => {
  test("applies latency and volume participation before replaying a partial fill", () => {
    const value = input();
    value.base_replay.candles[3].candle.volume = 500;
    value.base_replay.candles[3].candle.low = 90;

    const result = runInternalPaperReplayExecution(value);

    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result).toMatchObject({
      requested_quantity: 10,
      filled_quantity: 5,
      unfilled_quantity: 5,
      fill_reference_price: 100,
      fill_candle_id: candleId(3),
      fill_occurred_at: "2026-09-21T13:33:00.000Z",
    });
    expect(result.replay.status).toBe("completed");
    if (result.replay.status !== "completed") return;
    expect(result.replay.events[0]).toMatchObject({
      event_type: "entry_fill",
      occurred_at: "2026-09-21T13:33:00.000Z",
      quantity: 5,
    });
    expect(result.replay.events.some((event) => event.reason === "stop_loss")).toBe(
      false,
    );
    expect(result.result_digest).toMatch(/^[0-9a-f]{64}$/);
  });

  test("vetoes the whole requested order before a partial fill can occur", () => {
    const base = input();
    const value = input({
      base_replay: {
        ...base.base_replay,
        account: {
          ...base.base_replay.account,
          initial_cash: 600,
          per_trade_risk_cap: 15,
        },
      },
    });
    value.base_replay.candles[3].candle.volume = 500;

    expect(runInternalPaperReplayExecution(value)).toMatchObject({
      status: "blocked",
      reason: "base_replay_blocked",
      base_replay_reason_codes: ["entry_risk_rejected"],
    });
  });

  test("rechecks the actual fill price after the full order passes admission", () => {
    const base = input();
    const value = input({
      base_replay: {
        ...base.base_replay,
        account: {
          ...base.base_replay.account,
          per_trade_risk_cap: 22,
        },
      },
    });
    value.base_replay.candles[3].candle.volume = 500;
    value.base_replay.candles[3].candle.open = 105;
    value.base_replay.candles[3].candle.high = 105.25;
    value.base_replay.candles[3].candle.low = 104.75;
    value.base_replay.candles[3].candle.close = 105;

    expect(runInternalPaperReplayExecution(value)).toMatchObject({
      status: "blocked",
      reason: "base_replay_blocked",
      base_replay_reason_codes: ["entry_risk_rejected"],
    });
  });

  test("fills a crossed limit at the better opening price after latency", () => {
    const value = input({
      policy: {
        ...input().policy,
        order_type: "limit",
        limit_price: 99,
        latency_ms: 0,
        max_volume_participation_bps: 10_000,
      },
    });
    value.base_replay.candles[4].candle.open = 98.5;
    value.base_replay.candles[4].candle.high = 99;
    value.base_replay.candles[4].candle.low = 97;
    value.base_replay.candles[4].candle.close = 98.5;

    const result = runInternalPaperReplayExecution(value);

    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result).toMatchObject({
      filled_quantity: 10,
      unfilled_quantity: 0,
      fill_reference_price: 98.5,
      fill_candle_id: candleId(4),
    });
  });

  test("returns an honest unfilled result when a limit is never reached", () => {
    const value = input({
      policy: {
        ...input().policy,
        order_type: "limit",
        limit_price: 90,
      },
    });

    expect(runInternalPaperReplayExecution(value)).toMatchObject({
      status: "unfilled",
      reason: "limit_not_reached",
      requested_quantity: 10,
      inspected_through: "2026-09-21T19:59:00.000Z",
    });
  });

  test("does not read a future exit outcome before reporting an unfilled order", () => {
    const base = input();
    const value = input({
      policy: {
        ...base.policy,
        order_type: "limit",
        limit_price: 90,
      },
    });
    value.base_replay.candles[389].candle.open = 2_000_000_000;
    value.base_replay.candles[389].candle.high = 2_000_000_000;
    value.base_replay.candles[389].candle.low = 2_000_000_000;
    value.base_replay.candles[389].candle.close = 2_000_000_000;

    expect(runInternalPaperMarketReplay(value.base_replay)).toMatchObject({
      status: "blocked",
      reason_codes: ["economic_result_out_of_range"],
    });

    expect(runInternalPaperReplayExecution(value)).toMatchObject({
      status: "unfilled",
      reason: "limit_not_reached",
      requested_quantity: 10,
    });
  });

  test("separates insufficient known liquidity from missing liquidity evidence", () => {
    const known = input();
    known.base_replay.candles[3].candle.volume = 50;
    expect(runInternalPaperReplayExecution(known)).toMatchObject({
      status: "unfilled",
      reason: "insufficient_liquidity",
    });

    const unknown = input();
    unknown.base_replay.candles[3].candle.volume = null;
    expect(runInternalPaperReplayExecution(unknown)).toMatchObject({
      status: "blocked",
      reason: "liquidity_evidence_missing",
    });
  });

  test("rejects orders above the frozen maximum before reading a fill candle", () => {
    const value = input({
      policy: {
        ...input().policy,
        maximum_order_quantity: 5,
      },
    });
    value.base_replay.candles[3].candle.volume = null;

    expect(runInternalPaperReplayExecution(value)).toMatchObject({
      status: "rejected",
      reason: "order_quantity_limit",
      requested_quantity: 10,
    });
  });

  test("is deterministic and fails closed on invalid policy input", () => {
    const first = runInternalPaperReplayExecution(input());
    const second = runInternalPaperReplayExecution(input());
    expect(second).toEqual(first);

    expect(
      runInternalPaperReplayExecution(
        input({
          policy: {
            ...input().policy,
            latency_ms: 30 * 60_000 + 1,
          },
        }),
      ),
    ).toMatchObject({
      status: "blocked",
      reason: "execution_input_invalid",
    });
  });

  test("never masks an invalid base replay as an execution outcome", () => {
    const value = input();
    value.base_replay.candles[20].candle.high = 99;

    expect(runInternalPaperReplayExecution(value)).toMatchObject({
      status: "blocked",
      reason: "base_replay_blocked",
      base_replay_reason_codes: ["market_event_invalid"],
    });
  });

  test("reports an expired market fill window instead of inventing a fill", () => {
    const value = input({
      base_replay: {
        ...input().base_replay,
        entry: {
          ...entry(),
          submitted_at: "2026-09-21T19:58:00.000Z",
        },
      },
    });

    expect(runInternalPaperReplayExecution(value)).toMatchObject({
      status: "unfilled",
      reason: "fill_window_expired",
      inspected_through: "2026-09-21T19:59:00.000Z",
    });
  });
});
