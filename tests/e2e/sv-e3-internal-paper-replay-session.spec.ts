import { expect, test } from "@playwright/test";

import { buildCandidateDecisionLearningAttribution } from "@/lib/candidate-decision-learning-attribution";
import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { buildCurrentDecisionStrategyReference } from "@/lib/decision-strategy-registry";
import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import { INTERNAL_PAPER_MARKET_REPLAY_VERSION } from "@/lib/internal-paper-market-replay";
import {
  INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION,
  INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
  type InternalPaperReplayExecutionInput,
} from "@/lib/internal-paper-replay-execution";
import {
  INTERNAL_PAPER_REPLAY_SESSION_VERSION,
  runInternalPaperReplaySession,
  type InternalPaperReplaySessionInput,
} from "@/lib/internal-paper-replay-session";
import type { SharedCandleCacheCandle } from "@/lib/shared-candle-cache";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ACCOUNT_ID = "22222222-2222-4222-8222-222222222222";
const SESSION_ID = "33333333-3333-4333-8333-333333333333";
const SESSION_OPEN = "2026-09-21T13:30:00.000Z";
const SESSION_CLOSE = "2026-09-21T19:59:00.000Z";
const SESSION_SEED = "sv-e3-session-seed-v1";

function learningAttribution() {
  return buildCandidateDecisionLearningAttribution({
    recommendationPublishPolicyVersion: "recommendation_publish_policy_v1",
    canonicalEvaluationVersions: {
      engine_version: "ture_intelligence_engine_v1",
      scoring_version: "day_trade_score_v1",
      ranking_version: "scanner_candidate_ranking_v1",
      setup_taxonomy_version: "setup_taxonomy_v1",
      confidence_contract_version: "ordinal_confidence_v1",
      evaluator_version: "canonical_outcome_evaluator_v1",
      provider_contract_version: "licensed_fixture_v1",
      git_commit: "0123456789abcdef0123456789abcdef01234567",
      build_identity: "sv-e3-fixture-build-v1",
    },
  });
}

function decision({
  index,
  ticker,
  decidedAt,
  published,
}: {
  index: number;
  ticker: string;
  decidedAt: string;
  published: boolean;
}): CandidateDecisionRecord {
  const scanRunId = `scan-2026-09-21-${index}`;
  const fingerprint = `rec_scan_run_fixture_${index}`;
  return {
    record_version: "candidate_decision_record_v3",
    record_kind: "candidate_decision_record",
    scan_run_id: scanRunId,
    scan_run_fingerprint: fingerprint,
    decision_timestamp: decidedAt,
    strategy_reference: buildCurrentDecisionStrategyReference(
      "pilot-universe-2026-09-21-v1",
    ),
    versions: {
      scanner_version: "scanner_v1",
      universe_version: "pilot-universe-2026-09-21-v1",
      scoring_version: "day_trade_score_v1",
      ranking_version: "scanner_candidate_ranking_v1",
      build_version: "sv-e3-fixture-build-v1",
      provider_contract_version: "licensed_fixture_v1",
    },
    learning_attribution: learningAttribution(),
    coverage: {
      expected_candidate_count: 1,
      observed_candidate_count: 1,
      ranked_candidate_count: 1,
      full_membership_declared: true,
      full_membership_captured: true,
      membership_reason_codes: [],
      pre_truncation_capture_evidence: null,
    },
    candidates: [
      {
        candidate_id: `scanner_candidate:v1:${scanRunId}:${ticker}`,
        ticker,
        company_name: `${ticker} fixture`,
        sector: "Technology",
        disposition: published ? "published" : "ranked_not_selected",
        eligibility: published ? "eligible" : "ineligible",
        reason_codes: published ? [] : ["below_publish_threshold"],
        data: {
          provider_source: "licensed_fixture",
          source_timestamp: new Date(Date.parse(decidedAt) - 60_000).toISOString(),
          freshness: "fresh",
          indicator_source: "fresh",
          gap_codes: [],
        },
        ranking: {
          rank: 1,
          score: published ? 92 : 51,
          tier: published ? "strong" : "weak",
          selected: published,
          selection_bucket: published ? "publishable" : "below_threshold",
          rank_reason: "fixture",
          tie_break_key: ticker,
          components: {} as NonNullable<
            CandidateDecisionRecord["candidates"][number]["ranking"]
          >["components"],
          warnings: [],
          gaps: [],
        },
        build: published
          ? { built: true, rejection_reason: null, explanation: "fixture" }
          : null,
      },
    ],
    final_decision: published
      ? {
          disposition: "recommendations_published",
          published_tickers: [ticker],
          no_trade_reason: null,
          recommendation_build_path: "deterministic_fixture",
        }
      : {
          disposition: "no_trade",
          published_tickers: [],
          no_trade_reason: "below_publish_threshold",
          recommendation_build_path: null,
        },
  };
}

function candleId(index: number, ticker: string) {
  const prefix = ticker === "AAPL" ? "1" : "2";
  return `00000000-0000-4000-8000-${prefix}${String(index + 1).padStart(11, "0")}`;
}

function candles(ticker: string) {
  const open = Date.parse(SESSION_OPEN);
  return Array.from({ length: 390 }, (_, index) => ({
    candle_id: candleId(index, ticker),
    candle: {
      contract_version: "shared_candle_cache_v1",
      provider: "licensed_fixture",
      ticker,
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
      source_request_id: `fixture-request-${ticker}-2026-09-21`,
      validation_status: "valid",
    } satisfies SharedCandleCacheCandle,
  }));
}

function execution(
  value: CandidateDecisionRecord,
  ticker: string,
  orderIndex: number,
): InternalPaperReplayExecutionInput {
  const strategy = value.strategy_reference!;
  const submittedAt = new Date(
    Date.parse(value.decision_timestamp) + 60_000,
  ).toISOString();
  const entry: InternalPaperEntryCommand = {
    command_version: "internal_paper_entry_command_v1",
    fill_model_version: "internal_paper_immediate_costed_fill_v1",
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    scan_run_id: value.scan_run_id,
    scan_run_fingerprint: value.scan_run_fingerprint,
    snapshot_id: `snapshot-${orderIndex}`,
    snapshot_fingerprint: `snapshot-fingerprint-${orderIndex}`,
    candidate_identity: value.candidates[0].candidate_id,
    strategy_id: strategy.strategy_id,
    strategy_version: strategy.strategy_version,
    strategy_rollback_identity: strategy.rollback_identity,
    symbol_selection_policy_id: strategy.symbol_selection.policy_id,
    symbol_selection_policy_version: strategy.symbol_selection.policy_version,
    observed_universe_version: strategy.symbol_selection.observed_universe_version,
    ticker,
    quantity: 10,
    arrival_price: 100,
    stop_price: 98,
    target_price: 110,
    submitted_at: submittedAt,
  };
  return {
    execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
    order_id: `44444444-4444-4444-8444-${String(orderIndex).padStart(12, "0")}`,
    base_replay: {
      replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
      replay_id: `sv-e3-${ticker}-${orderIndex}`,
      deterministic_seed: SESSION_SEED,
      dataset: {
        dataset_id: `licensed-${ticker}-minute-fixture`,
        dataset_version: "2026-09-21.v1",
        source_reference: `fixture://sv-e3/${ticker}/2026-09-21`,
        entitlement_reference: "test-fixture-no-external-distribution",
        retention_rights_reference: "repository-test-fixture",
        point_in_time_as_of: "2026-09-21T20:05:00.000Z",
        ticker,
        trading_date: "2026-09-21",
        session_open: SESSION_OPEN,
        session_close: SESSION_CLOSE,
        session_calendar_reference: "fixture-calendar:regular-session",
        corporate_action_status: "verified_none",
        corporate_action_reference: "fixture-corporate-actions:none",
        complete_regular_session: true,
      },
      account: {
        account_config_version: "sv-e3-paper-config-v1",
        initial_cash: 100_000,
        per_trade_risk_cap: 1_000,
        daily_loss_cap: 2_000,
        spread_bps: 10,
        slippage_bps: 5,
        commission_per_order: 1,
        target_exit_fraction_bps: 5_000,
      },
      entry,
      candles: candles(ticker),
    },
    policy: {
      policy_version: "sv-e3-ioc-v2",
      order_type: "market",
      time_in_force: "ioc",
      limit_price: null,
      latency_ms: 0,
      liquidity_proxy_version: INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION,
      max_volume_participation_bps: 100,
      minimum_fill_quantity: 1,
      maximum_order_quantity: 100,
    },
  };
}

function input(): InternalPaperReplaySessionInput {
  const first = decision({
    index: 1,
    ticker: "MSFT",
    decidedAt: "2026-09-21T13:31:00.000Z",
    published: false,
  });
  const second = decision({
    index: 2,
    ticker: "AAPL",
    decidedAt: "2026-09-21T13:32:00.000Z",
    published: true,
  });
  return {
    session_version: INTERNAL_PAPER_REPLAY_SESSION_VERSION,
    session_id: SESSION_ID,
    deterministic_seed: SESSION_SEED,
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    trading_date: "2026-09-21",
    session_open: SESSION_OPEN,
    session_close: SESSION_CLOSE,
    eligible_symbols: ["AAPL", "MSFT"],
    decisions: [
      { decision: first, execution: null, rejection_reason_codes: [] },
      {
        decision: second,
        execution: execution(second, "AAPL", 1),
        rejection_reason_codes: [],
      },
    ],
  };
}

test.describe("SV-E3 deterministic internal-paper session replay", () => {
  test("preserves chronological no-trade and accepts one realistically filled position", () => {
    const result = runInternalPaperReplaySession(input());

    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.summary).toEqual({
      decision_count: 2,
      accepted_count: 1,
      rejected_count: 0,
      no_trade_count: 1,
      executed_position_count: 1,
    });
    expect(result.events.map((event) => event.disposition)).toEqual([
      "no_trade",
      "accepted",
    ]);
    expect(result.events[0]).toMatchObject({
      occurred_at: "2026-09-21T13:31:00.000Z",
      reason_codes: ["below_publish_threshold"],
      lineage: { status: "reconstructable" },
      candidates: [{ ticker: "MSFT", disposition: "ranked_not_selected" }],
    });
    expect(result.events[1]).toMatchObject({
      occurred_at: "2026-09-21T13:32:00.000Z",
      disposition: "accepted",
      execution: { status: "completed", filled_quantity: 10 },
      candidates: [{ ticker: "AAPL", disposition: "published" }],
    });
    expect(result.result_digest).toMatch(/^[0-9a-f]{64}$/);
    expect(runInternalPaperReplaySession(input())).toEqual(result);
  });

  test("retains an explicitly rejected published decision without executing it", () => {
    const value = input();
    value.decisions[1] = {
      decision: value.decisions[1].decision,
      execution: null,
      rejection_reason_codes: ["risk_policy_rejected"],
    };

    const result = runInternalPaperReplaySession(value);
    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.events[1]).toMatchObject({
      disposition: "rejected",
      reason_codes: ["risk_policy_rejected"],
      execution: null,
    });
    expect(result.summary.executed_position_count).toBe(0);
  });

  test("enforces the one-position pilot cap across later accepted requests", () => {
    const value = input();
    const third = decision({
      index: 3,
      ticker: "MSFT",
      decidedAt: "2026-09-21T13:34:00.000Z",
      published: true,
    });
    value.decisions.push({
      decision: third,
      execution: execution(third, "MSFT", 2),
      rejection_reason_codes: [],
    });

    const result = runInternalPaperReplaySession(value);
    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.summary).toMatchObject({
      accepted_count: 1,
      rejected_count: 1,
      executed_position_count: 1,
    });
    expect(result.events[2]).toMatchObject({
      disposition: "rejected",
      reason_codes: ["position_capacity_exceeded"],
      execution: null,
    });
  });

  test("can continue after an honest unfilled attempt and accept a later candidate", () => {
    const value = input();
    const firstExecution = value.decisions[1].execution!;
    value.decisions[1] = {
      ...value.decisions[1],
      execution: {
        ...firstExecution,
        policy: {
          ...firstExecution.policy,
          order_type: "limit",
          limit_price: 90,
        },
      },
    };
    const third = decision({
      index: 3,
      ticker: "MSFT",
      decidedAt: "2026-09-21T13:34:00.000Z",
      published: true,
    });
    value.decisions.push({
      decision: third,
      execution: execution(third, "MSFT", 2),
      rejection_reason_codes: [],
    });

    const result = runInternalPaperReplaySession(value);
    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.events[1]).toMatchObject({
      disposition: "rejected",
      reason_codes: ["execution_unfilled:limit_not_reached"],
      execution: { status: "unfilled" },
    });
    expect(result.events[2]).toMatchObject({ disposition: "accepted" });
    expect(result.summary.executed_position_count).toBe(1);
  });

  test("fails closed outside the ten-symbol pilot scope", () => {
    const value = {
      ...input(),
      eligible_symbols: Array.from({ length: 11 }, (_, index) => `T${index}`),
    };

    expect(runInternalPaperReplaySession(value)).toMatchObject({
      status: "blocked",
      reason_codes: ["pilot_symbol_scope_invalid"],
    });
  });

  test("fails closed on non-chronological decisions and incomplete lineage", () => {
    const outOfOrder = input();
    outOfOrder.decisions.reverse();
    expect(runInternalPaperReplaySession(outOfOrder)).toMatchObject({
      status: "blocked",
      reason_codes: ["decision_event_out_of_order"],
    });

    const incomplete = input();
    incomplete.decisions[0].decision.learning_attribution =
      {} as CandidateDecisionRecord["learning_attribution"];
    expect(runInternalPaperReplaySession(incomplete)).toMatchObject({
      status: "blocked",
      reason_codes: ["decision_lineage_incomplete"],
    });
  });

  test("rejects a command that is not bound to the exact published decision", () => {
    const value = input();
    const current = value.decisions[1].execution!;
    value.decisions[1] = {
      ...value.decisions[1],
      execution: {
        ...current,
        base_replay: {
          ...current.base_replay,
          entry: {
            ...current.base_replay.entry,
            scan_run_fingerprint: "f".repeat(64),
          },
        },
      },
    };

    expect(runInternalPaperReplaySession(value)).toMatchObject({
      status: "blocked",
      reason_codes: ["decision_execution_binding_invalid"],
    });
  });

  test("requires one account configuration and unique replay identity per session", () => {
    const value = input();
    const third = decision({
      index: 3,
      ticker: "MSFT",
      decidedAt: "2026-09-21T13:34:00.000Z",
      published: true,
    });
    const conflicting = execution(third, "MSFT", 2);
    value.decisions.push({
      decision: third,
      execution: {
        ...conflicting,
        base_replay: {
          ...conflicting.base_replay,
          replay_id: value.decisions[1].execution!.base_replay.replay_id,
          account: {
            ...conflicting.base_replay.account,
            account_config_version: "different-config-v2",
          },
        },
      },
      rejection_reason_codes: [],
    });

    expect(runInternalPaperReplaySession(value)).toMatchObject({
      status: "blocked",
      reason_codes: ["decision_execution_binding_invalid"],
    });
  });

  test("propagates missing execution evidence as a blocked session", () => {
    const value = input();
    const current = value.decisions[1].execution!;
    current.base_replay.candles[2].candle.volume = null;

    expect(runInternalPaperReplaySession(value)).toMatchObject({
      status: "blocked",
      reason_codes: ["execution_blocked"],
      blocked_scan_run_id: value.decisions[1].decision.scan_run_id,
      blocked_execution: {
        status: "blocked",
        reason: "liquidity_evidence_missing",
      },
    });
  });
});
