import { expect, test } from "@playwright/test";

import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import { INTERNAL_PAPER_MARKET_REPLAY_VERSION } from "@/lib/internal-paper-market-replay";
import {
  INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION,
  INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
  runInternalPaperReplayExecution,
  type InternalPaperReplayExecutionInput,
} from "@/lib/internal-paper-replay-execution";
import {
  MULTI_EXIT_TRANSACTION_COST_ATTRIBUTION_VERSION,
  attributeBrokerNeutralMultiExitTransactionCosts,
} from "@/lib/broker-neutral-multi-exit-transaction-cost-attribution";
import type { SharedCandleCacheCandle } from "@/lib/shared-candle-cache";
import {
  INTERNAL_REPLAY_DECISION_BENCHMARK_EVIDENCE_VERSION,
  type InternalReplayDecisionBenchmarkEvidence,
} from "@/lib/source-bound-transaction-cost-projection";
import {
  SOURCE_BOUND_INTERNAL_REPLAY_MULTI_EXIT_PROJECTION_VERSION,
  projectSourceBoundInternalReplayMultiExit,
  type SourceBoundInternalReplayMultiExitProjectionInput,
} from "@/lib/source-bound-internal-replay-multi-exit-projection";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ACCOUNT_ID = "22222222-2222-4222-8222-222222222222";
const ORDER_ID = "44444444-4444-4444-8444-444444444444";
const ATTRIBUTION_ID = "55555555-5555-4555-8555-555555555555";
const DECISION_FINGERPRINT = "b".repeat(64);

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
    target_price: 100.1,
    submitted_at: "2026-09-21T13:31:00.000Z",
  };
}

function replayInput(
  candleOverrides: Record<number, Partial<SharedCandleCacheCandle>> = {},
): InternalPaperReplayExecutionInput {
  return {
    execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
    order_id: ORDER_ID,
    base_replay: {
      replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
      replay_id: "sv-n4-aapl-2026-09-21",
      deterministic_seed: "sv-n4-seed-v1",
      dataset: {
        dataset_id: "licensed-aapl-minute-fixture",
        dataset_version: "2026-09-21.v1",
        source_reference: "fixture://sv-n4/aapl/2026-09-21",
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
        account_config_version: "sv-n4-paper-config-v1",
        initial_cash: 100_000,
        per_trade_risk_cap: 1_000,
        daily_loss_cap: 2_000,
        spread_bps: 10,
        slippage_bps: 5,
        commission_per_order: 1,
        target_exit_fraction_bps: 5_000,
      },
      entry: replayEntry(),
      candles: candles(candleOverrides),
    },
    policy: {
      policy_version: "sv-n4-ioc-v1",
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

function benchmark(
  sourceResultDigest: string,
  overrides: Partial<InternalReplayDecisionBenchmarkEvidence> = {},
): InternalReplayDecisionBenchmarkEvidence {
  return {
    evidence_version: INTERNAL_REPLAY_DECISION_BENCHMARK_EVIDENCE_VERSION,
    evidence_id: "replay-decision-aapl-n4-1",
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

function projectionInput(
  sourceInput = replayInput(),
  overrides: Partial<SourceBoundInternalReplayMultiExitProjectionInput> = {},
): SourceBoundInternalReplayMultiExitProjectionInput {
  const sourceResult = runInternalPaperReplayExecution(sourceInput);
  return {
    projection_version: SOURCE_BOUND_INTERNAL_REPLAY_MULTI_EXIT_PROJECTION_VERSION,
    projected_at: "2026-09-21T20:10:00.000Z",
    entry_leg_id: "replay-aapl-entry-n4-1",
    exit_leg_ids: ["replay-aapl-exit-n4-1", "replay-aapl-exit-n4-2"],
    source_input: sourceInput,
    source_result: sourceResult,
    decision_benchmark: benchmark(sourceResult.result_digest),
    ...overrides,
  };
}

function attribute(
  projected: ReturnType<typeof projectSourceBoundInternalReplayMultiExit>,
  attributedAt = "2026-09-21T20:10:00.000Z",
) {
  return attributeBrokerNeutralMultiExitTransactionCosts({
    attribution_version: MULTI_EXIT_TRANSACTION_COST_ATTRIBUTION_VERSION,
    attribution_id: ATTRIBUTION_ID,
    owner_user_id: OWNER_ID,
    decision_fingerprint: DECISION_FINGERPRINT,
    symbol: "AAPL",
    position_direction: "long",
    evidence_cohort: "internal_paper_modeled",
    benchmark_policy_version: "sv-n4-replay-benchmark-v2",
    cost_policy_version: "sv-n3-cost-v2",
    decision_expected_gross_edge_usd: "10.000000",
    legs: projected.legs,
    attributed_at: attributedAt,
  });
}

test("projects every ordered replay exit and feeds N.3 without collapsing lifecycles", () => {
  const input = projectionInput();
  const projected = projectSourceBoundInternalReplayMultiExit(input);

  expect(projected).toMatchObject({
    status: "ready",
    source_kind: "internal_paper_replay_execution",
    owner_user_id: OWNER_ID,
    decision_fingerprint: DECISION_FINGERPRINT,
    symbol: "AAPL",
    source_input_digest: input.source_result.input_digest,
    source_result_digest: input.source_result.result_digest,
    benchmark_evidence_id: "replay-decision-aapl-n4-1",
    reason_codes: [],
    safety: {
      source_core_recomputed: true,
      v1_projection_semantics_mutated: false,
      source_event_order_preserved: true,
      broker_action_authorized: false,
    },
  });
  expect(projected.source_lineage_digest).toMatch(/^[0-9a-f]{64}$/);
  expect(projected.execution_lineage_digest).toMatch(/^[0-9a-f]{64}$/);
  expect(projected.legs).toHaveLength(3);
  expect(projected.legs.map((leg) => leg.role)).toEqual(["entry", "exit", "exit"]);
  expect(projected.legs.slice(1).map((leg) => leg.arrival_benchmark_version)).toEqual([
    "internal_paper_exit_target_partial_reference_v1",
    "internal_paper_exit_eod_reference_v1",
  ]);
  expect(projected.legs.slice(1).map((leg) => leg.requested_quantity)).toEqual([5, 5]);

  expect(attribute(projected)).toMatchObject({
    status: "completed",
    disposition: "attributed",
    entered_quantity: 10,
    exited_quantity: 10,
    remaining_open_quantity: 0,
    safety: { fees_double_counted: false, over_exit_allowed: false },
  });
});

test("preserves a partial entry as incomplete cost while reconciling every exit", () => {
  const sourceInput = replayInput({ 2: { volume: 500 } });
  const input = projectionInput(sourceInput);
  const projected = projectSourceBoundInternalReplayMultiExit(input);

  expect(projected.status).toBe("ready");
  expect(projected.legs).toHaveLength(3);
  expect(projected.legs[0]).toMatchObject({
    disposition: "partially_filled_cancelled",
    requested_quantity: 10,
    fills: [{ quantity: 5 }],
    unfilled_opportunity_benchmark_price_usd: null,
  });
  expect(projected.legs.slice(1).map((leg) => leg.requested_quantity)).toEqual([2, 3]);
  expect(attribute(projected)).toMatchObject({
    status: "completed",
    disposition: "attributed_with_incomplete_cost",
    entered_quantity: 5,
    exited_quantity: 5,
    remaining_open_quantity: 0,
    total_attributable_cost_usd: null,
  });
});

test("rejects a forged source receipt before projecting any leg", () => {
  const valid = projectionInput();
  const forged = {
    ...valid,
    source_result: { ...valid.source_result, result_digest: "f".repeat(64) },
  };

  expect(projectSourceBoundInternalReplayMultiExit(forged)).toMatchObject({
    status: "blocked",
    reason_codes: ["claimed_source_result_mismatch"],
    legs: [],
  });
});

test("requires one unique supplied identity for every source exit", () => {
  expect(
    projectSourceBoundInternalReplayMultiExit(
      projectionInput(undefined, { exit_leg_ids: ["only-one-exit-id"] }),
    ),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["exit_leg_identity_count_mismatch"],
  });

  expect(
    projectSourceBoundInternalReplayMultiExit(
      projectionInput(undefined, { exit_leg_ids: ["duplicate-id", "duplicate-id"] }),
    ),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["invalid_projection_input"],
  });
});

test("blocks unbound decision evidence, future evidence and future source cutoffs", () => {
  const validUnboundSource = projectionInput();
  const unbound = {
    ...validUnboundSource,
    decision_benchmark: benchmark(validUnboundSource.source_result.result_digest, {
      decision_fingerprint: "c".repeat(64),
    }),
  };
  expect(projectSourceBoundInternalReplayMultiExit(unbound)).toMatchObject({
    status: "blocked",
    reason_codes: ["benchmark_source_binding_mismatch"],
  });

  const validFutureSource = projectionInput();
  const futureDecision = {
    ...validFutureSource,
    decision_benchmark: benchmark(validFutureSource.source_result.result_digest, {
      decision_observed_at: "2026-09-21T13:32:00.000Z",
    }),
  };
  expect(projectSourceBoundInternalReplayMultiExit(futureDecision)).toMatchObject({
    status: "blocked",
    reason_codes: ["benchmark_chronology_invalid"],
  });

  expect(
    projectSourceBoundInternalReplayMultiExit(
      projectionInput(undefined, { projected_at: "2026-09-21T20:02:00.000Z" }),
    ),
  ).toMatchObject({
    status: "blocked",
    reason_codes: ["source_cutoff_after_projection"],
  });
});

test("is deterministic and deeply immutable", () => {
  const input = projectionInput();
  const first = projectSourceBoundInternalReplayMultiExit(input);
  const second = projectSourceBoundInternalReplayMultiExit(structuredClone(input));

  expect(first).toEqual(second);
  expect(first.projection_digest).toBe(second.projection_digest);
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.legs)).toBe(true);
  expect(Object.isFrozen(first.legs[0].fills)).toBe(true);
  expect(() => {
    Reflect.apply(Array.prototype.push, first.legs, [first.legs[0]]);
  }).toThrow();
});

test("rejects added authority and contains hostile accessor input", () => {
  const extra = projectionInput() as unknown as Record<string, unknown>;
  extra.publish = true;
  expect(projectSourceBoundInternalReplayMultiExit(extra)).toMatchObject({
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

  const hostile = projectionInput() as unknown as Record<string, unknown>;
  Object.defineProperty(hostile, "decision_benchmark", {
    enumerable: true,
    get() {
      throw new Error("must not escape the projection boundary");
    },
  });
  expect(projectSourceBoundInternalReplayMultiExit(hostile)).toMatchObject({
    status: "blocked",
    reason_codes: ["invalid_projection_input"],
    legs: [],
  });
});
