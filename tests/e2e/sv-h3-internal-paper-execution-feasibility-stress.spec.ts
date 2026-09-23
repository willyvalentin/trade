import { expect, test } from "@playwright/test";

import {
  INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_VERSION,
  buildInternalPaperExecutionFeasibilityStressManifest,
  runInternalPaperExecutionFeasibilityStress,
  verifyInternalPaperExecutionFeasibilityStressDigest,
} from "@/lib/internal-paper-execution-feasibility-stress";
import { INTERNAL_PAPER_MARKET_REPLAY_VERSION } from "@/lib/internal-paper-market-replay";
import {
  INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
  type InternalPaperReplayExecutionInput,
} from "@/lib/internal-paper-replay-execution";

const BASELINE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
const PARTIAL_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2";
const DELAYED_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3";

function execution(): InternalPaperReplayExecutionInput {
  const open = Date.parse("2026-09-21T13:30:00.000Z");
  return {
    execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
    order_id: "33333333-3333-4333-8333-333333333333",
    base_replay: {
      replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
      replay_id: "sv-h3-frozen-aapl-2026-09-21",
      deterministic_seed: "sv-h3-seed-v1",
      dataset: {
        dataset_id: "licensed-aapl-minute-fixture",
        dataset_version: "2026-09-21.v1",
        source_reference: "fixture://sv-h3/aapl/2026-09-21",
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
        account_config_version: "sv-h3-paper-config-v1",
        initial_cash: 100_000,
        per_trade_risk_cap: 1_000,
        daily_loss_cap: 2_000,
        spread_bps: 10,
        slippage_bps: 5,
        commission_per_order: 1,
        target_exit_fraction_bps: 5_000,
      },
      entry: {
        command_version: "internal_paper_entry_command_v1",
        fill_model_version: "internal_paper_immediate_costed_fill_v1",
        owner_user_id: "11111111-1111-4111-8111-111111111111",
        account_id: "22222222-2222-4222-8222-222222222222",
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
      },
      candles: Array.from({ length: 390 }, (_, index) => ({
        candle_id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
        candle: {
          contract_version: "shared_candle_cache_v1" as const,
          provider: "licensed_fixture",
          ticker: "AAPL",
          interval: "1min" as const,
          timestamp: new Date(open + index * 60_000).toISOString(),
          open: index === 2 ? 101 : 100,
          high: index === 2 ? 101.25 : 100.25,
          low: index === 2 ? 100.75 : 99.75,
          close: index === 389 ? 100.1 : index === 2 ? 101 : 100,
          volume: 1_000,
          timezone: "America/New_York",
          adjusted: true,
          market_session: "regular" as const,
          fetched_at: "2026-09-21T20:01:00.000Z",
          source_request_id: "fixture-request-2026-09-21",
          validation_status: "valid" as const,
        },
      })),
    },
    policy: {
      policy_version: "sv-h3-ioc-v1",
      order_type: "limit",
      time_in_force: "ioc",
      limit_price: 100.2,
      latency_ms: 0,
      max_volume_participation_bps: 1_000,
      minimum_fill_quantity: 1,
      maximum_order_quantity: 100,
    },
  };
}

function fixture() {
  const base_execution = execution();
  const scenarios = [
    { scenario_id: BASELINE_ID, latency_ms: 0, max_volume_participation_bps: 1_000 },
    { scenario_id: PARTIAL_ID, latency_ms: 0, max_volume_participation_bps: 50 },
    { scenario_id: DELAYED_ID, latency_ms: 60_000, max_volume_participation_bps: 1_000 },
  ];
  const manifest = buildInternalPaperExecutionFeasibilityStressManifest({
    matrix_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    frozen_at: "2026-09-22T20:30:00.000Z",
    base_execution,
    scenarios,
  });
  if (!manifest) throw new Error("execution-feasibility manifest must be valid");
  return {
    stress_version: INTERNAL_PAPER_EXECUTION_FEASIBILITY_STRESS_VERSION,
    manifest,
    base_execution,
    scenarios,
  } as const;
}

test.describe("SV-H3 frozen execution feasibility sensitivity", () => {
  test("shows full, partial and absent IOC fills on one frozen opportunity", () => {
    const input = fixture();
    const result = runInternalPaperExecutionFeasibilityStress(input);

    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.scenarios).toEqual([
      expect.objectContaining({
        scenario_id: BASELINE_ID,
        status: "completed",
        requested_quantity: 10,
        filled_quantity: 10,
        unfilled_quantity: 0,
        costed_fill_price: 100.1,
      }),
      expect.objectContaining({
        scenario_id: PARTIAL_ID,
        status: "completed",
        requested_quantity: 10,
        filled_quantity: 5,
        unfilled_quantity: 5,
      }),
      expect.objectContaining({
        scenario_id: DELAYED_ID,
        status: "unfilled",
        reason: "limit_not_reached",
        requested_quantity: 10,
        filled_quantity: 0,
      }),
    ]);
    expect(result.summary).toMatchObject({
      full_fill_count: 1,
      partial_fill_count: 1,
      unfilled_count: 1,
      rejected_count: 0,
    });
    if (result.scenarios[0]?.status === "completed") {
      expect(result.scenarios[0].modeled_execution_cost).toBeGreaterThan(0);
    }
    expect(result.authority).toEqual({
      can_request_provider_data: false,
      can_change_ranking_or_publication: false,
      can_promote_strategy: false,
      can_execute_broker_action: false,
    });
    expect(result.evidence_limits).toContain(
      "single_frozen_order_not_strategy_evaluation",
    );
    expect(result.baseline_scenario_id).toBe(BASELINE_ID);
    expect(verifyInternalPaperExecutionFeasibilityStressDigest(result)).toBe(true);
    expect(verifyInternalPaperExecutionFeasibilityStressDigest({
      ...result,
      summary: { ...result.summary, full_fill_count: 2 },
    })).toBe(false);
    expect(runInternalPaperExecutionFeasibilityStress(input)).toEqual(result);
  });

  test("rejects duplicate assumptions and a matrix without its base policy", () => {
    const input = fixture();
    expect(buildInternalPaperExecutionFeasibilityStressManifest({
      matrix_id: input.manifest.matrix_id,
      frozen_at: input.manifest.frozen_at,
      base_execution: input.base_execution,
      scenarios: [input.scenarios[0], { ...input.scenarios[0], scenario_id: PARTIAL_ID }],
    })).toBeNull();
    expect(buildInternalPaperExecutionFeasibilityStressManifest({
      matrix_id: input.manifest.matrix_id,
      frozen_at: input.manifest.frozen_at,
      base_execution: input.base_execution,
      scenarios: input.scenarios.slice(1),
    })).toBeNull();
    expect(buildInternalPaperExecutionFeasibilityStressManifest({
      matrix_id: input.manifest.matrix_id,
      frozen_at: input.manifest.frozen_at,
      base_execution: input.base_execution,
      scenarios: [input.scenarios[0], { ...input.scenarios[1], max_volume_participation_bps: 0 }],
    })).toBeNull();
  });

  test("blocks post-freeze market, policy and scenario mutation", () => {
    const input = fixture();
    input.base_execution.base_replay.candles[1].candle.volume = 10;
    expect(runInternalPaperExecutionFeasibilityStress(input)).toMatchObject({
      status: "blocked",
      reason_codes: ["stress_manifest_input_mismatch"],
    });
    const changed = fixture();
    const mutatedScenarios = changed.scenarios.map((scenario) => ({ ...scenario }));
    mutatedScenarios[1]!.latency_ms = 120_000;
    expect(runInternalPaperExecutionFeasibilityStress({
      ...changed,
      scenarios: mutatedScenarios,
    })).toMatchObject({
      status: "blocked",
      reason_codes: ["stress_manifest_input_mismatch"],
    });
  });

  test("retains missing liquidity as blocked, never as a zero fill", () => {
    const input = fixture();
    input.base_execution.base_replay.candles[1].candle.volume = null;
    const manifest = buildInternalPaperExecutionFeasibilityStressManifest({
      matrix_id: input.manifest.matrix_id,
      frozen_at: input.manifest.frozen_at,
      base_execution: input.base_execution,
      scenarios: input.scenarios,
    });
    if (!manifest) throw new Error("modified frozen fixture must be valid");
    expect(runInternalPaperExecutionFeasibilityStress({
      ...input,
      manifest,
    })).toMatchObject({
      status: "blocked",
      reason_codes: ["stress_execution_blocked"],
      blocked_scenario_id: BASELINE_ID,
      underlying_reason: "liquidity_evidence_missing",
    });
  });

  test("attributes a later missing-volume block to the delayed scenario", () => {
    const input = fixture();
    input.base_execution.base_replay.candles[2].candle.open = 99;
    input.base_execution.base_replay.candles[2].candle.high = 99.25;
    input.base_execution.base_replay.candles[2].candle.low = 98.75;
    input.base_execution.base_replay.candles[2].candle.close = 99;
    input.base_execution.base_replay.candles[2].candle.volume = null;
    const manifest = buildInternalPaperExecutionFeasibilityStressManifest({
      matrix_id: input.manifest.matrix_id,
      frozen_at: input.manifest.frozen_at,
      base_execution: input.base_execution,
      scenarios: input.scenarios,
    });
    if (!manifest) throw new Error("modified frozen fixture must be valid");
    expect(runInternalPaperExecutionFeasibilityStress({
      ...input,
      manifest,
    })).toMatchObject({
      status: "blocked",
      reason_codes: ["stress_execution_blocked"],
      blocked_scenario_id: DELAYED_ID,
      underlying_reason: "liquidity_evidence_missing",
    });
  });

  test("keeps an admission rejection separate from an unfilled IOC", () => {
    const input = fixture();
    const baseExecution = {
      ...input.base_execution,
      policy: { ...input.base_execution.policy, maximum_order_quantity: 5 },
    };
    const manifest = buildInternalPaperExecutionFeasibilityStressManifest({
      matrix_id: input.manifest.matrix_id,
      frozen_at: input.manifest.frozen_at,
      base_execution: baseExecution,
      scenarios: input.scenarios,
    });
    if (!manifest) throw new Error("modified frozen fixture must be valid");
    expect(runInternalPaperExecutionFeasibilityStress({
      ...input,
      manifest,
      base_execution: baseExecution,
    })).toMatchObject({
      status: "completed",
      summary: {
        full_fill_count: 0,
        partial_fill_count: 0,
        unfilled_count: 0,
        rejected_count: 3,
      },
      scenarios: [
        expect.objectContaining({ status: "rejected", reason: "order_quantity_limit" }),
        expect.objectContaining({ status: "rejected", reason: "order_quantity_limit" }),
        expect.objectContaining({ status: "rejected", reason: "order_quantity_limit" }),
      ],
    });
  });
});
