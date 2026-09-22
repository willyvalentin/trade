import { expect, test } from "@playwright/test";

import { buildCandidateDecisionLearningAttribution } from "@/lib/candidate-decision-learning-attribution";
import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { buildCurrentDecisionStrategyReference } from "@/lib/decision-strategy-registry";
import {
  buildInternalPaperReplayCorpusManifest,
  INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
  runInternalPaperReplayCorpus,
  type InternalPaperReplayCorpusInput,
} from "@/lib/internal-paper-replay-corpus";
import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import {
  INTERNAL_PAPER_MARKET_REPLAY_VERSION,
  type InternalPaperReplayAccountConfig,
} from "@/lib/internal-paper-market-replay";
import {
  INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
  type InternalPaperReplayExecutionInput,
  type InternalPaperReplayExecutionPolicy,
} from "@/lib/internal-paper-replay-execution";
import {
  INTERNAL_PAPER_REPLAY_SESSION_VERSION,
  type InternalPaperReplaySessionInput,
} from "@/lib/internal-paper-replay-session";
import type { SharedCandleCacheCandle } from "@/lib/shared-candle-cache";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ACCOUNT_ID = "22222222-2222-4222-8222-222222222222";
const CORPUS_ID = "33333333-3333-4333-8333-333333333333";
const MANIFEST_ID = "44444444-4444-4444-8444-444444444444";
const SEED = "sv-e4-corpus-seed-v1";
const SOURCE_REFERENCE = "fixture://sv-e4/frozen-corpus";
const ENTITLEMENT_REFERENCE = "repository-fixture-internal-research-only";
const RETENTION_REFERENCE = "repository-fixture-retained";
const CALENDAR_REFERENCE = "fixture-calendar:regular-session-v1";

const ACCOUNT: InternalPaperReplayAccountConfig = {
  account_config_version: "sv-e4-paper-config-v1",
  initial_cash: 100_000,
  per_trade_risk_cap: 1_000,
  daily_loss_cap: 2_000,
  spread_bps: 10,
  slippage_bps: 5,
  commission_per_order: 1,
  target_exit_fraction_bps: 5_000,
};

const EXECUTION_POLICY: InternalPaperReplayExecutionPolicy = {
  policy_version: "sv-e4-ioc-v1",
  order_type: "market",
  time_in_force: "ioc",
  limit_price: null,
  latency_ms: 0,
  max_volume_participation_bps: 100,
  minimum_fill_quantity: 1,
  maximum_order_quantity: 100,
};

function learningAttribution(policyVersion = "recommendation_publish_policy_v1") {
  return buildCandidateDecisionLearningAttribution({
    recommendationPublishPolicyVersion: policyVersion,
    canonicalEvaluationVersions: {
      engine_version: "ture_intelligence_engine_v1",
      scoring_version: "day_trade_score_v1",
      ranking_version: "scanner_candidate_ranking_v1",
      setup_taxonomy_version: "setup_taxonomy_v1",
      confidence_contract_version: "ordinal_confidence_v1",
      evaluator_version: "canonical_outcome_evaluator_v1",
      provider_contract_version: "licensed_fixture_v1",
      git_commit: "0123456789abcdef0123456789abcdef01234567",
      build_identity: "sv-e4-fixture-build-v1",
    },
  });
}

function sessionTimes(date: string) {
  return {
    open: `${date}T13:30:00.000Z`,
    close: `${date}T19:59:00.000Z`,
    fetched: `${date}T20:01:00.000Z`,
    pointInTime: `${date}T20:05:00.000Z`,
  };
}

function decision({
  date,
  decisionIndex,
  ticker,
  published,
}: {
  date: string;
  decisionIndex: number;
  ticker: string;
  published: boolean;
}): CandidateDecisionRecord {
  const scanRunId = `scan-${date}-${decisionIndex}`;
  const fingerprint = `rec_scan_run_${date}_${decisionIndex}`;
  const universeVersion = `pilot-universe-${date}-v1`;
  const decidedAt = new Date(
    Date.parse(sessionTimes(date).open) + decisionIndex * 60_000,
  ).toISOString();
  return {
    record_version: "candidate_decision_record_v3",
    record_kind: "candidate_decision_record",
    scan_run_id: scanRunId,
    scan_run_fingerprint: fingerprint,
    decision_timestamp: decidedAt,
    strategy_reference: buildCurrentDecisionStrategyReference(universeVersion),
    versions: {
      scanner_version: "scanner_v1",
      universe_version: universeVersion,
      scoring_version: "day_trade_score_v1",
      ranking_version: "scanner_candidate_ranking_v1",
      build_version: "sv-e4-fixture-build-v1",
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

function candleId(sessionIndex: number, index: number) {
  const suffix = sessionIndex * 1_000 + index + 1;
  return `00000000-0000-4000-8000-${String(suffix).padStart(12, "0")}`;
}

function candles({
  date,
  sessionIndex,
  outcome,
}: {
  date: string;
  sessionIndex: number;
  outcome: "win" | "loss";
}) {
  const times = sessionTimes(date);
  const open = Date.parse(times.open);
  return Array.from({ length: 390 }, (_, index) => {
    const winningTarget = outcome === "win" && (index === 10 || index === 11);
    const losingStop = outcome === "loss" && index === 10;
    return {
      candle_id: candleId(sessionIndex, index),
      candle: {
        contract_version: "shared_candle_cache_v1",
        provider: "licensed_fixture",
        ticker: "AAPL",
        interval: "1min",
        timestamp: new Date(open + index * 60_000).toISOString(),
        open: 100,
        high: winningTarget ? 111 : 100.25,
        low: losingStop ? 97 : 99.75,
        close: 100,
        volume: 10_000,
        timezone: "America/New_York",
        adjusted: true,
        market_session: "regular",
        fetched_at: times.fetched,
        source_request_id: `fixture-request-AAPL-${date}`,
        validation_status: "valid",
      } satisfies SharedCandleCacheCandle,
    };
  });
}

function execution({
  value,
  date,
  sessionIndex,
  outcome,
}: {
  value: CandidateDecisionRecord;
  date: string;
  sessionIndex: number;
  outcome: "win" | "loss";
}): InternalPaperReplayExecutionInput {
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
    snapshot_id: `snapshot-${date}`,
    snapshot_fingerprint: `snapshot-fingerprint-${date}`,
    candidate_identity: value.candidates[0].candidate_id,
    strategy_id: strategy.strategy_id,
    strategy_version: strategy.strategy_version,
    strategy_rollback_identity: strategy.rollback_identity,
    symbol_selection_policy_id: strategy.symbol_selection.policy_id,
    symbol_selection_policy_version: strategy.symbol_selection.policy_version,
    observed_universe_version: strategy.symbol_selection.observed_universe_version,
    ticker: "AAPL",
    quantity: 10,
    arrival_price: 100,
    stop_price: 98,
    target_price: 110,
    submitted_at: submittedAt,
  };
  return {
    execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
    order_id: `55555555-5555-4555-8555-${String(sessionIndex).padStart(12, "0")}`,
    base_replay: {
      replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
      replay_id: `sv-e4-AAPL-${date}`,
      deterministic_seed: SEED,
      dataset: {
        dataset_id: `licensed-AAPL-${date}`,
        dataset_version: `${date}.v1`,
        source_reference: SOURCE_REFERENCE,
        entitlement_reference: ENTITLEMENT_REFERENCE,
        retention_rights_reference: RETENTION_REFERENCE,
        point_in_time_as_of: sessionTimes(date).pointInTime,
        ticker: "AAPL",
        trading_date: date,
        session_open: sessionTimes(date).open,
        session_close: sessionTimes(date).close,
        session_calendar_reference: CALENDAR_REFERENCE,
        corporate_action_status: "verified_none",
        corporate_action_reference: `fixture-corporate-actions:${date}:none`,
        complete_regular_session: true,
      },
      account: { ...ACCOUNT },
      entry,
      candles: candles({ date, sessionIndex, outcome }),
    },
    policy: { ...EXECUTION_POLICY },
  };
}

function tradingSession({
  date,
  sessionIndex,
  outcome,
}: {
  date: string;
  sessionIndex: number;
  outcome: "win" | "loss";
}): InternalPaperReplaySessionInput {
  const noTrade = decision({
    date,
    decisionIndex: 1,
    ticker: "MSFT",
    published: false,
  });
  const published = decision({
    date,
    decisionIndex: 2,
    ticker: "AAPL",
    published: true,
  });
  return {
    session_version: INTERNAL_PAPER_REPLAY_SESSION_VERSION,
    session_id: `66666666-6666-4666-8666-${String(sessionIndex).padStart(12, "0")}`,
    deterministic_seed: SEED,
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    trading_date: date,
    session_open: sessionTimes(date).open,
    session_close: sessionTimes(date).close,
    eligible_symbols: ["AAPL", "MSFT"],
    decisions: [
      { decision: noTrade, execution: null, rejection_reason_codes: [] },
      {
        decision: published,
        execution: execution({ value: published, date, sessionIndex, outcome }),
        rejection_reason_codes: [],
      },
    ],
  };
}

function noTradeSession(date: string, sessionIndex: number) {
  const noTrade = decision({
    date,
    decisionIndex: 1,
    ticker: "AAPL",
    published: false,
  });
  return {
    session_version: INTERNAL_PAPER_REPLAY_SESSION_VERSION,
    session_id: `66666666-6666-4666-8666-${String(sessionIndex).padStart(12, "0")}`,
    deterministic_seed: SEED,
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    trading_date: date,
    session_open: sessionTimes(date).open,
    session_close: sessionTimes(date).close,
    eligible_symbols: ["AAPL"],
    decisions: [
      { decision: noTrade, execution: null, rejection_reason_codes: [] },
    ],
  } satisfies InternalPaperReplaySessionInput;
}

function corpusInput(): InternalPaperReplayCorpusInput {
  const sessions = [
    tradingSession({ date: "2026-09-21", sessionIndex: 1, outcome: "win" }),
    noTradeSession("2026-09-22", 2),
    tradingSession({ date: "2026-09-23", sessionIndex: 3, outcome: "loss" }),
  ];
  const manifest = buildInternalPaperReplayCorpusManifest({
    manifest_id: MANIFEST_ID,
    corpus_id: CORPUS_ID,
    dataset_collection_id: "sv-e4-repository-fixture",
    dataset_collection_version: "2026-09-v1",
    decision_provider_source: "licensed_fixture",
    source_reference: SOURCE_REFERENCE,
    entitlement_reference: ENTITLEMENT_REFERENCE,
    retention_rights_reference: RETENTION_REFERENCE,
    permitted_use: "internal_research_replay",
    frozen_at: "2026-09-23T20:10:00.000Z",
    session_calendar_reference: CALENDAR_REFERENCE,
    corporate_action_policy_version: "fixture-corporate-action-policy-v1",
    sessions: sessions.map((session) => ({
      session,
      universe_as_of: new Date(
        Date.parse(session.session_open) - 60_000,
      ).toISOString(),
    })),
  });
  if (!manifest) throw new Error("fixture manifest must be valid");
  return {
    corpus_version: INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
    corpus_id: CORPUS_ID,
    deterministic_seed: SEED,
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    account: { ...ACCOUNT },
    execution_policy: { ...EXECUTION_POLICY },
    manifest,
    sessions,
  };
}

function rebuildManifest(input: InternalPaperReplayCorpusInput) {
  const manifest = buildInternalPaperReplayCorpusManifest({
    manifest_id: input.manifest.manifest_id,
    corpus_id: input.corpus_id,
    dataset_collection_id: input.manifest.dataset_collection_id,
    dataset_collection_version: input.manifest.dataset_collection_version,
    decision_provider_source: input.manifest.decision_provider_source,
    source_reference: input.manifest.source_reference,
    entitlement_reference: input.manifest.entitlement_reference,
    retention_rights_reference: input.manifest.retention_rights_reference,
    permitted_use: input.manifest.permitted_use,
    frozen_at: input.manifest.frozen_at,
    session_calendar_reference: input.manifest.session_calendar_reference,
    corporate_action_policy_version:
      input.manifest.corporate_action_policy_version,
    sessions: input.sessions.map((session) => ({
      session,
      universe_as_of: new Date(
        Date.parse(session.session_open) - 60_000,
      ).toISOString(),
    })),
  });
  if (!manifest) throw new Error("rebuilt fixture manifest must be valid");
  Object.assign(input, { manifest });
}

test.describe("SV-E4 deterministic replay corpus", () => {
  test("replays a frozen multi-session corpus deterministically with costed aggregate evidence", () => {
    const first = runInternalPaperReplayCorpus(corpusInput());
    const second = runInternalPaperReplayCorpus(corpusInput());

    expect(first).toEqual(second);
    expect(first.status).toBe("completed");
    if (first.status !== "completed") return;
    expect(first.sessions.map((session) => session.trading_date)).toEqual([
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
    ]);
    expect(first.summary).toEqual({
      capital_model:
        "fixed_session_starting_equity_cumulative_research_curve_v1",
      pnl_semantics:
        "fill_price_gross_commission_net_with_explicit_modeled_cost_v1",
      session_count: 3,
      sessions_with_position: 2,
      sessions_without_position: 1,
      decision_count: 5,
      accepted_count: 2,
      rejected_count: 0,
      no_trade_count: 3,
      winning_position_count: 1,
      losing_position_count: 1,
      flat_position_count: 0,
      realized_gross_pnl: 25.97,
      realized_net_pnl: 20.97,
      execution_cost: 9.03,
      average_net_pnl_per_position: 10.485,
      expectancy_r: 0.476591,
      maximum_drawdown: 23.98,
      initial_equity: 100_000,
      ending_equity: 100_020.97,
    });
    expect(first.source_lineage).toMatchObject({
      execution_dataset_count: 2,
      sessions_without_execution_dataset: 1,
      permitted_use: "internal_research_replay",
      rights_evidence_status:
        "declared_reference_hash_bound_not_independently_verified",
    });
    expect(first.authority).toEqual({
      can_request_provider_data: false,
      can_change_ranking_or_publication: false,
      can_promote_strategy: false,
      can_execute_broker_action: false,
    });
    expect(first.result_digest).toMatch(/^[0-9a-f]{64}$/);
  });

  test("rejects any candle or decision mutation after the corpus manifest is frozen", () => {
    const candleMutation = corpusInput();
    candleMutation.sessions[0].decisions[1].execution!.base_replay.candles[10]
      .candle.high = 112;
    expect(runInternalPaperReplayCorpus(candleMutation)).toMatchObject({
      status: "blocked",
      reason_codes: ["session_input_digest_mismatch"],
    });

    const decisionMutation = corpusInput();
    decisionMutation.sessions[1].decisions[0].decision.final_decision.no_trade_reason =
      "mutated_after_freeze";
    expect(runInternalPaperReplayCorpus(decisionMutation)).toMatchObject({
      status: "blocked",
      reason_codes: ["session_input_digest_mismatch"],
    });
  });

  test("rejects a forged manifest and a future-known universe snapshot", () => {
    const forged = corpusInput();
    Object.assign(forged.manifest, {
      dataset_collection_version: "rewritten-after-freeze",
    });
    expect(runInternalPaperReplayCorpus(forged)).toMatchObject({
      status: "blocked",
      reason_codes: ["manifest_digest_mismatch"],
    });

    const value = corpusInput();
    expect(
      buildInternalPaperReplayCorpusManifest({
        manifest_id: MANIFEST_ID,
        corpus_id: CORPUS_ID,
        dataset_collection_id: "future-universe",
        dataset_collection_version: "v1",
        decision_provider_source: "licensed_fixture",
        source_reference: SOURCE_REFERENCE,
        entitlement_reference: ENTITLEMENT_REFERENCE,
        retention_rights_reference: RETENTION_REFERENCE,
        permitted_use: "internal_research_replay",
        frozen_at: value.manifest.frozen_at,
        session_calendar_reference: CALENDAR_REFERENCE,
        corporate_action_policy_version: "v1",
        sessions: value.sessions.map((session) => ({
          session,
          universe_as_of: new Date(
            Date.parse(session.session_open) + 60_000,
          ).toISOString(),
        })),
      }),
    ).toBeNull();
  });

  test("rejects mixed data rights or calendar lineage", () => {
    const rights = corpusInput();
    Object.assign(
      rights.sessions[2].decisions[1].execution!.base_replay.dataset,
      { entitlement_reference: "different-entitlement" },
    );
    rebuildManifest(rights);
    expect(runInternalPaperReplayCorpus(rights)).toMatchObject({
      status: "blocked",
      reason_codes: ["source_lineage_mismatch"],
    });

    const calendar = corpusInput();
    Object.assign(
      calendar.sessions[0].decisions[1].execution!.base_replay.dataset,
      { session_calendar_reference: "different-calendar" },
    );
    rebuildManifest(calendar);
    expect(runInternalPaperReplayCorpus(calendar)).toMatchObject({
      status: "blocked",
      reason_codes: ["source_lineage_mismatch"],
    });

    const noTradeProvider = corpusInput();
    noTradeProvider.sessions[1].decisions[0].decision.candidates[0].data.provider_source =
      "different_decision_provider";
    rebuildManifest(noTradeProvider);
    expect(runInternalPaperReplayCorpus(noTradeProvider)).toMatchObject({
      status: "blocked",
      reason_codes: ["source_lineage_mismatch"],
    });
  });

  test("rejects mixed account and execution policies", () => {
    const account = corpusInput();
    Object.assign(account.sessions[2].decisions[1].execution!.base_replay, {
      account: { ...ACCOUNT, daily_loss_cap: 1_500 },
    });
    rebuildManifest(account);
    expect(runInternalPaperReplayCorpus(account)).toMatchObject({
      status: "blocked",
      reason_codes: ["account_policy_mismatch"],
    });

    const executionPolicy = corpusInput();
    Object.assign(executionPolicy.sessions[2].decisions[1].execution!, {
      policy: { ...EXECUTION_POLICY, latency_ms: 1_000 },
    });
    rebuildManifest(executionPolicy);
    expect(runInternalPaperReplayCorpus(executionPolicy)).toMatchObject({
      status: "blocked",
      reason_codes: ["execution_policy_mismatch"],
    });
  });

  test("validates frozen account and execution policies even for all-no-trade corpora", () => {
    const invalidAccount = corpusInput();
    Object.assign(invalidAccount, {
      sessions: [
        noTradeSession("2026-09-21", 1),
        noTradeSession("2026-09-22", 2),
        noTradeSession("2026-09-23", 3),
      ],
    });
    rebuildManifest(invalidAccount);
    Object.assign(invalidAccount, {
      account: { ...ACCOUNT, initial_cash: -1 },
    });
    expect(runInternalPaperReplayCorpus(invalidAccount)).toMatchObject({
      status: "blocked",
      reason_codes: ["account_policy_invalid"],
    });

    const invalidExecution = corpusInput();
    Object.assign(invalidExecution, {
      sessions: [
        noTradeSession("2026-09-21", 1),
        noTradeSession("2026-09-22", 2),
        noTradeSession("2026-09-23", 3),
      ],
    });
    rebuildManifest(invalidExecution);
    Object.assign(invalidExecution, {
      execution_policy: {
        ...EXECUTION_POLICY,
        latency_ms: -1,
      },
    });
    expect(runInternalPaperReplayCorpus(invalidExecution)).toMatchObject({
      status: "blocked",
      reason_codes: ["execution_policy_invalid"],
    });
  });

  test("keeps an all-no-trade corpus as a complete zero-position research result", () => {
    const value = corpusInput();
    Object.assign(value, {
      sessions: [
        noTradeSession("2026-09-21", 1),
        noTradeSession("2026-09-22", 2),
        noTradeSession("2026-09-23", 3),
      ],
    });
    rebuildManifest(value);

    const result = runInternalPaperReplayCorpus(value);
    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(result.summary).toMatchObject({
      sessions_with_position: 0,
      sessions_without_position: 3,
      decision_count: 3,
      accepted_count: 0,
      no_trade_count: 3,
      realized_gross_pnl: 0,
      realized_net_pnl: 0,
      execution_cost: 0,
      average_net_pnl_per_position: null,
      expectancy_r: null,
      maximum_drawdown: 0,
      initial_equity: 100_000,
      ending_equity: 100_000,
    });
    expect(result.source_lineage).toMatchObject({
      execution_dataset_count: 0,
      sessions_without_execution_dataset: 3,
    });
  });

  test("rejects a mixed strategy or publication-policy population", () => {
    const value = corpusInput();
    value.sessions[2].decisions[0].decision.learning_attribution =
      learningAttribution("different_publish_policy_v2");
    value.sessions[2].decisions[1].decision.learning_attribution =
      learningAttribution("different_publish_policy_v2");
    rebuildManifest(value);

    expect(runInternalPaperReplayCorpus(value)).toMatchObject({
      status: "blocked",
      reason_codes: ["strategy_policy_mismatch"],
      blocked_trading_date: "2026-09-23",
    });
  });

  test("rejects cross-session decision and durable market identity collisions", () => {
    const decisions = corpusInput();
    decisions.sessions[2].decisions[0].decision.scan_run_id =
      decisions.sessions[0].decisions[0].decision.scan_run_id;
    decisions.sessions[2].decisions[0].decision.scan_run_fingerprint =
      decisions.sessions[0].decisions[0].decision.scan_run_fingerprint;
    rebuildManifest(decisions);
    expect(runInternalPaperReplayCorpus(decisions)).toMatchObject({
      status: "blocked",
      reason_codes: ["cross_session_identity_collision"],
    });

    const candles = corpusInput();
    Object.assign(
      candles.sessions[2].decisions[1].execution!.base_replay.candles[0],
      {
        candle_id:
          candles.sessions[0].decisions[1].execution!.base_replay.candles[0]
            .candle_id,
      },
    );
    rebuildManifest(candles);
    expect(runInternalPaperReplayCorpus(candles)).toMatchObject({
      status: "blocked",
      reason_codes: ["cross_session_identity_collision"],
    });
  });

  test("propagates a blocked replay session instead of shrinking the corpus", () => {
    const value = corpusInput();
    value.sessions[2].decisions[1].execution!.base_replay.candles[3].candle.volume =
      null;
    rebuildManifest(value);

    expect(runInternalPaperReplayCorpus(value)).toMatchObject({
      status: "blocked",
      reason_codes: ["session_blocked"],
      blocked_trading_date: "2026-09-23",
      blocked_session: {
        status: "blocked",
        reason_codes: ["execution_blocked"],
        blocked_execution: { reason: "liquidity_evidence_missing" },
      },
    });
  });

  test("requires unique chronological coverage and a complete date range", () => {
    const value = corpusInput();
    const reversed = [...value.sessions].reverse();
    expect(
      buildInternalPaperReplayCorpusManifest({
        manifest_id: MANIFEST_ID,
        corpus_id: CORPUS_ID,
        dataset_collection_id: "out-of-order",
        dataset_collection_version: "v1",
        decision_provider_source: "licensed_fixture",
        source_reference: SOURCE_REFERENCE,
        entitlement_reference: ENTITLEMENT_REFERENCE,
        retention_rights_reference: RETENTION_REFERENCE,
        permitted_use: "internal_research_replay",
        frozen_at: value.manifest.frozen_at,
        session_calendar_reference: CALENDAR_REFERENCE,
        corporate_action_policy_version: "v1",
        sessions: reversed.map((session) => ({
          session,
          universe_as_of: new Date(
            Date.parse(session.session_open) - 60_000,
          ).toISOString(),
        })),
      }),
    ).toBeNull();

    const omitted = corpusInput();
    omitted.sessions.pop();
    expect(runInternalPaperReplayCorpus(omitted)).toMatchObject({
      status: "blocked",
      reason_codes: ["manifest_coverage_invalid"],
    });
  });
});
