import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";

import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import {
  INTERNAL_PAPER_MARKET_REPLAY_VERSION,
  runInternalPaperMarketReplay,
} from "@/lib/internal-paper-market-replay";
import type { SharedCandleCacheCandle } from "@/lib/shared-candle-cache";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ACCOUNT_ID = "22222222-2222-4222-8222-222222222222";

function canonical(value: unknown): unknown {
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
      volume: 10_000 + index,
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
    target_price: 102,
    submitted_at: "2026-09-21T13:31:00.000Z",
  };
}

function replay(
  overrides: Partial<Parameters<typeof runInternalPaperMarketReplay>[0]> = {},
) {
  return {
    replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
    replay_id: "sv-e1-aapl-2026-09-21",
    deterministic_seed: "sv-e1-seed-v1",
    dataset: {
      dataset_id: "licensed-aapl-minute-fixture",
      dataset_version: "2026-09-21.v1",
      source_reference: "fixture://sv-e1/aapl/2026-09-21",
      entitlement_reference: "test-fixture-no-external-distribution",
      retention_rights_reference: "repository-test-fixture",
      point_in_time_as_of: "2026-09-21T20:05:00.000Z",
      ticker: "AAPL",
      trading_date: "2026-09-21",
      session_open: "2026-09-21T13:30:00.000Z",
      session_close: "2026-09-21T19:59:00.000Z",
      session_calendar_reference: "fixture-calendar:regular-session",
      corporate_action_status: "verified_none" as const,
      corporate_action_reference: "fixture-corporate-actions:none",
      complete_regular_session: true,
    },
    account: {
      account_config_version: "sv-e1-paper-config-v1",
      initial_cash: 100_000,
      per_trade_risk_cap: 1_000,
      daily_loss_cap: 2_000,
      spread_bps: 10,
      slippage_bps: 5,
      commission_per_order: 1,
      target_exit_fraction_bps: 5_000,
    },
    entry: entry(),
    candles: candles({
      1: { high: 103 },
      2: { high: 102.5 },
    }),
    ...overrides,
  } satisfies Parameters<typeof runInternalPaperMarketReplay>[0];
}

test.describe("SV-E1 deterministic one-day internal-paper replay", () => {
  test("replays the C1/C2 fill, target and EOD accounting semantics exactly", () => {
    const result = runInternalPaperMarketReplay(replay());

    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result).toMatchObject({
      result_version: "internal_paper_market_replay_result_v1",
      replay_version: "internal_paper_market_replay_v1",
    });
    expect(result.events).toEqual([
      {
        sequence: 1,
        event_type: "entry_fill",
        occurred_at: "2026-09-21T13:31:00.000Z",
        ticker: "AAPL",
        quantity: 10,
        reason: "entry",
        reference_price: 100,
        fill_price: 100.1,
        spread_cost: 0.5,
        slippage_cost: 0.5,
        commission: 1,
        cash_delta: -1002,
        realized_net_pnl: 0,
        evidence_id: "snapshot-fingerprint",
      },
      {
        sequence: 2,
        event_type: "exit_fill",
        occurred_at: "2026-09-21T13:32:00.000Z",
        ticker: "AAPL",
        quantity: 5,
        reason: "target_partial",
        reference_price: 102,
        fill_price: 101.898,
        spread_cost: 0.255,
        slippage_cost: 0.255,
        commission: 1,
        cash_delta: 508.49,
        realized_net_pnl: 7.49,
        evidence_id: candleId(2),
      },
      {
        sequence: 3,
        event_type: "exit_fill",
        occurred_at: "2026-09-21T19:59:00.000Z",
        ticker: "AAPL",
        quantity: 5,
        reason: "eod",
        reference_price: 101,
        fill_price: 100.899,
        spread_cost: 0.2525,
        slippage_cost: 0.2525,
        commission: 1,
        cash_delta: 503.495,
        realized_net_pnl: 2.495,
        evidence_id: candleId(389),
      },
    ]);
    expect(result.final_state).toMatchObject({
      cash_balance: 100_009.985,
      remaining_quantity: 0,
      remaining_cost_basis: 0,
      remaining_entry_commission: 0,
      realized_gross_pnl: 12.985,
      realized_net_pnl: 9.985,
      total_commission_paid: 3,
      target_exit_completed: true,
      closed_at: "2026-09-21T19:59:00.000Z",
    });
    expect(result.result_digest).toMatch(/^[0-9a-f]{64}$/);
    expect(result.source_lineage).toMatchObject({
      dataset_id: "licensed-aapl-minute-fixture",
      entitlement_reference: "test-fixture-no-external-distribution",
      retention_rights_reference: "repository-test-fixture",
      session_calendar_reference: "fixture-calendar:regular-session",
    });
    expect(result.execution_lineage).toEqual({
      deterministic_seed: "sv-e1-seed-v1",
      account_config_version: "sv-e1-paper-config-v1",
      entry_command_version: "internal_paper_entry_command_v1",
      entry_fill_model_version: "internal_paper_immediate_costed_fill_v1",
      exit_fill_model_version: "internal_paper_immediate_costed_exit_v1",
      snapshot_fingerprint: "snapshot-fingerprint",
    });
  });

  test("does not expose the entry candle or any future candle to exit logic", () => {
    const result = runInternalPaperMarketReplay(replay());
    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.events[1]).toMatchObject({
      occurred_at: "2026-09-21T13:32:00.000Z",
      reason: "target_partial",
    });
  });

  test("gives stop precedence when one bar crosses both stop and target", () => {
    const result = runInternalPaperMarketReplay(
      replay({ candles: candles({ 2: { open: 99, high: 103, low: 97, close: 100 } }) }),
    );
    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.events).toHaveLength(2);
    expect(result.events[1]).toMatchObject({
      reason: "stop_loss",
      quantity: 10,
      reference_price: 98,
      fill_price: 97.902,
    });
  });

  test("blocks a triggered gap stop whose sale cannot cover its commission", () => {
    const base = replay();
    const result = runInternalPaperMarketReplay(replay({
      account: {
        ...base.account,
        commission_per_order: 60,
        per_trade_risk_cap: 200,
        target_exit_fraction_bps: 10_000,
      },
      candles: candles({
        2: { open: 5, high: 5, low: 5, close: 5 },
        3: { high: 103 },
      }),
    }));

    expect(result).toMatchObject({
      status: "blocked",
      reason_codes: ["economic_result_out_of_range"],
    });
  });

  test("blocks an unpayable end-of-day exit instead of leaving an open position", () => {
    const base = replay();
    const result = runInternalPaperMarketReplay(replay({
      account: {
        ...base.account,
        commission_per_order: 2_000,
        per_trade_risk_cap: 3_000,
      },
      candles: candles(),
    }));

    expect(result).toMatchObject({
      status: "blocked",
      reason_codes: ["economic_result_out_of_range"],
    });
  });

  test("matches the durable C1/C2 PostgreSQL entry and gap-stop reference vector", () => {
    const result = runInternalPaperMarketReplay(
      replay({
        entry: { ...entry(), stop_price: 95, target_price: 112 },
        candles: candles({
          30: { open: 94, high: 96, low: 93, close: 95 },
        }),
      }),
    );
    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.events).toHaveLength(2);
    expect(result.events[0]).toMatchObject({
      fill_price: 100.1,
      spread_cost: 0.5,
      slippage_cost: 0.5,
      cash_delta: -1002,
    });
    expect(result.events[1]).toMatchObject({
      reason: "stop_loss",
      reference_price: 94,
      fill_price: 93.906,
      spread_cost: 0.47,
      slippage_cost: 0.47,
      cash_delta: 938.06,
      realized_net_pnl: -63.94,
    });
    expect(result.final_state).toMatchObject({
      cash_balance: 99_936.06,
      remaining_quantity: 0,
      realized_gross_pnl: -61.94,
      realized_net_pnl: -63.94,
      total_commission_paid: 2,
    });
  });

  test("rounds exact half-micro costs away from zero like PostgreSQL numeric", () => {
    const result = runInternalPaperMarketReplay(
      replay({
        account: {
          ...replay().account,
          spread_bps: 0,
          slippage_bps: 0.00005,
          commission_per_order: 0,
        },
        entry: { ...entry(), target_price: 120 },
        candles: candles(),
      }),
    );
    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.events[0]).toMatchObject({
      fill_price: 100.000001,
      slippage_cost: 0.000005,
    });
  });

  test("is restart-equivalent and rejects a modified checkpoint", () => {
    const input = replay();
    const uninterrupted = runInternalPaperMarketReplay(input);
    const paused = runInternalPaperMarketReplay(input, {
      pause_before_candle_index: 200,
    });
    expect(paused.status).toBe("paused");
    if (paused.status !== "paused") return;

    const resumed = runInternalPaperMarketReplay(input, {
      checkpoint: paused.checkpoint,
    });
    expect(resumed).toEqual(uninterrupted);

    const tampered = {
      ...paused.checkpoint,
      next_candle_index: paused.checkpoint.next_candle_index + 1,
    };
    expect(
      runInternalPaperMarketReplay(input, { checkpoint: tampered }),
    ).toMatchObject({
      status: "blocked",
      reason_codes: ["replay_checkpoint_invalid"],
    });

    const forgedPayload = {
      checkpoint_version: paused.checkpoint.checkpoint_version,
      replay_version: paused.checkpoint.replay_version,
      input_digest: paused.checkpoint.input_digest,
      next_candle_index: paused.checkpoint.next_candle_index,
      state: {
        ...paused.checkpoint.state,
        cash_balance: paused.checkpoint.state.cash_balance + 1,
      },
      events: paused.checkpoint.events,
    };
    const forged = {
      ...forgedPayload,
      checkpoint_digest: digest(forgedPayload),
    };
    expect(
      runInternalPaperMarketReplay(input, { checkpoint: forged }),
    ).toMatchObject({
      status: "blocked",
      reason_codes: ["replay_checkpoint_invalid"],
    });
  });

  test("fails closed on a gap, duplicate/order mutation or incomplete provenance", () => {
    const missing = candles();
    missing.splice(100, 1);
    expect(
      runInternalPaperMarketReplay(replay({ candles: missing })),
    ).toMatchObject({
      status: "blocked",
      reason_codes: expect.arrayContaining(["market_day_incomplete"]),
    });

    const reordered = candles();
    [reordered[10], reordered[11]] = [reordered[11], reordered[10]];
    expect(
      runInternalPaperMarketReplay(replay({ candles: reordered })),
    ).toMatchObject({
      status: "blocked",
      reason_codes: expect.arrayContaining(["market_event_out_of_order"]),
    });

    expect(
      runInternalPaperMarketReplay(
        replay({
          dataset: {
            ...replay().dataset,
            entitlement_reference: "",
            corporate_action_reference: "",
          },
        }),
      ),
    ).toMatchObject({
      status: "blocked",
      reason_codes: [
        "corporate_action_evidence_missing",
        "dataset_identity_invalid",
      ],
    });
  });

  test("rejects non-point-in-time data and entry risk beyond the frozen cap", () => {
    const futureFetch = candles({
      10: { fetched_at: "2026-09-21T20:06:00.000Z" },
    });
    expect(
      runInternalPaperMarketReplay(replay({ candles: futureFetch })),
    ).toMatchObject({
      status: "blocked",
      reason_codes: ["market_event_invalid"],
    });

    expect(
      runInternalPaperMarketReplay(
        replay({
          account: { ...replay().account, per_trade_risk_cap: 10 },
        }),
      ),
    ).toMatchObject({
      status: "blocked",
      reason_codes: ["entry_risk_rejected"],
    });

    expect(
      runInternalPaperMarketReplay(
        replay({
          account: { ...replay().account, slippage_bps: 0.0000001 },
        }),
      ),
    ).toMatchObject({
      status: "blocked",
      reason_codes: ["account_config_invalid"],
    });

    expect(
      runInternalPaperMarketReplay(
        replay({
          account: {
            ...replay().account,
            initial_cash: 9_000_000_000,
            per_trade_risk_cap: 9_000_000_000,
            daily_loss_cap: 9_000_000_000,
            spread_bps: 0,
            slippage_bps: 0,
            commission_per_order: 0,
          },
          entry: {
            ...entry(),
            quantity: 4_500_000_000_000_000,
            arrival_price: 0.000002,
            stop_price: 0.000001,
            target_price: 8_000_000_000,
          },
          candles: candles(),
        }),
      ),
    ).toMatchObject({
      status: "blocked",
      reason_codes: ["economic_result_out_of_range"],
    });
  });

  test("rejects malformed volume anywhere but permits missing price-only volume", () => {
    for (const volume of [
      -1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]) {
      expect(
        runInternalPaperMarketReplay(
          replay({ candles: candles({ 100: { volume } }) }),
        ),
      ).toMatchObject({
        status: "blocked",
        reason_codes: ["market_event_invalid"],
      });
    }

    const nullVolume = runInternalPaperMarketReplay(
      replay({ candles: candles({ 100: { volume: null } }) }),
    );
    const nanVolume = runInternalPaperMarketReplay(
      replay({ candles: candles({ 100: { volume: Number.NaN } }) }),
    );
    const infiniteVolume = runInternalPaperMarketReplay(
      replay({ candles: candles({ 100: { volume: Number.POSITIVE_INFINITY } }) }),
    );
    expect(nullVolume).toMatchObject({ status: "completed" });
    expect(nanVolume.input_digest).not.toBe(nullVolume.input_digest);
    expect(infiniteVolume.input_digest).not.toBe(nullVolume.input_digest);
    expect(infiniteVolume.input_digest).not.toBe(nanVolume.input_digest);
  });
});
