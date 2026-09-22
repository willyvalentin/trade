import { expect, test } from "@playwright/test";

import { buildCandidateDecisionLearningAttribution } from "@/lib/candidate-decision-learning-attribution";
import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { buildCurrentDecisionStrategyReference } from "@/lib/decision-strategy-registry";
import {
  buildInternalPaperReplayCorpusManifest,
  INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
  type InternalPaperReplayCorpusInput,
} from "@/lib/internal-paper-replay-corpus";
import {
  buildInternalPaperReplayExperimentManifest,
  INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
  runInternalPaperReplayExperiment,
  type InternalPaperReplayExperimentManifest,
  type InternalPaperReplayExperimentPartition,
} from "@/lib/internal-paper-replay-experiment";
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
const BASELINE_CORPUS_ID = "33333333-3333-4333-8333-333333333331";
const CANDIDATE_CORPUS_ID = "33333333-3333-4333-8333-333333333332";
const BASELINE_MANIFEST_ID = "44444444-4444-4444-8444-444444444441";
const CANDIDATE_MANIFEST_ID = "44444444-4444-4444-8444-444444444442";
const EXPERIMENT_ID = "77777777-7777-4777-8777-777777777777";
const SEED = "sv-f1-paired-replay-seed-v1";
const SOURCE_REFERENCE = "fixture://sv-f1/frozen-paired-corpora";
const ENTITLEMENT_REFERENCE = "repository-fixture-internal-research-only";
const RETENTION_REFERENCE = "repository-fixture-retained";
const CALENDAR_REFERENCE = "fixture-calendar:regular-session-v1";
const DATES = ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17"];

const ACCOUNT: InternalPaperReplayAccountConfig = {
  account_config_version: "sv-f1-paper-config-v1",
  initial_cash: 100_000,
  per_trade_risk_cap: 1_000,
  daily_loss_cap: 2_000,
  spread_bps: 10,
  slippage_bps: 5,
  commission_per_order: 1,
  target_exit_fraction_bps: 5_000,
};

const EXECUTION_POLICY: InternalPaperReplayExecutionPolicy = {
  policy_version: "sv-f1-ioc-v1",
  order_type: "market",
  time_in_force: "ioc",
  limit_price: null,
  latency_ms: 0,
  max_volume_participation_bps: 100,
  minimum_fill_quantity: 1,
  maximum_order_quantity: 100,
};

function learningAttribution(policyVersion: string) {
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
      build_identity: "sv-f1-fixture-build-v1",
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
  policyVersion,
  published,
}: {
  date: string;
  policyVersion: string;
  published: boolean;
}): CandidateDecisionRecord {
  const scanRunId = `scan-${date}`;
  const fingerprint = `rec_scan_run_${date}`;
  const universeVersion = `pilot-universe-${date}-v1`;
  const decidedAt = new Date(
    Date.parse(sessionTimes(date).open) + 60_000,
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
      build_version: "sv-f1-fixture-build-v1",
      provider_contract_version: "licensed_fixture_v1",
    },
    learning_attribution: learningAttribution(policyVersion),
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
        candidate_id: `scanner_candidate:v1:${scanRunId}:AAPL`,
        ticker: "AAPL",
        company_name: "AAPL fixture",
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
          tie_break_key: "AAPL",
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
          published_tickers: ["AAPL"],
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

function candles({
  date,
  sessionIndex,
  outcome,
}: {
  date: string;
  sessionIndex: number;
  outcome: "win" | "loss";
}) {
  const open = Date.parse(sessionTimes(date).open);
  return Array.from({ length: 390 }, (_, index) => {
    const target = outcome === "win" && (index === 10 || index === 11);
    const stop = outcome === "loss" && index === 10;
    return {
      candle_id: `00000000-0000-4000-8000-${String(
        sessionIndex * 1_000 + index + 1,
      ).padStart(12, "0")}`,
      candle: {
        contract_version: "shared_candle_cache_v1",
        provider: "licensed_fixture",
        ticker: "AAPL",
        interval: "1min",
        timestamp: new Date(open + index * 60_000).toISOString(),
        open: 100,
        high: target ? 111 : 100.25,
        low: stop ? 97 : 99.75,
        close: 100,
        volume: 10_000,
        timezone: "America/New_York",
        adjusted: true,
        market_session: "regular",
        fetched_at: sessionTimes(date).fetched,
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
  const entry: InternalPaperEntryCommand = {
    command_version: "internal_paper_entry_command_v1",
    fill_model_version: "internal_paper_immediate_costed_fill_v1",
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    scan_run_id: value.scan_run_id,
    scan_run_fingerprint: value.scan_run_fingerprint,
    snapshot_id: `snapshot-${date}`,
    snapshot_fingerprint: `snapshot-fingerprint-${date}`,
    candidate_identity: value.candidates[0]!.candidate_id,
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
    submitted_at: new Date(
      Date.parse(value.decision_timestamp) + 60_000,
    ).toISOString(),
  };
  return {
    execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
    order_id: `55555555-5555-4555-8555-${String(sessionIndex).padStart(12, "0")}`,
    base_replay: {
      replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
      replay_id: `sv-f1-AAPL-${date}`,
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

function session({
  date,
  sessionIndex,
  policyVersion,
  outcome,
}: {
  date: string;
  sessionIndex: number;
  policyVersion: string;
  outcome: "win" | "loss" | null;
}): InternalPaperReplaySessionInput {
  const value = decision({
    date,
    policyVersion,
    published: outcome !== null,
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
      {
        decision: value,
        execution:
          outcome === null
            ? null
            : execution({ value, date, sessionIndex, outcome }),
        rejection_reason_codes: [],
      },
    ],
  };
}

function corpus({
  corpusId,
  manifestId,
  policyVersion,
  outcomes,
}: {
  corpusId: string;
  manifestId: string;
  policyVersion: string;
  outcomes: Array<"win" | "loss" | null>;
}): InternalPaperReplayCorpusInput {
  const sessions = DATES.map((date, index) =>
    session({
      date,
      sessionIndex: index + 1,
      policyVersion,
      outcome: outcomes[index] ?? null,
    }),
  );
  const manifest = buildInternalPaperReplayCorpusManifest({
    manifest_id: manifestId,
    corpus_id: corpusId,
    dataset_collection_id: "sv-f1-repository-fixture",
    dataset_collection_version: "2026-09-v1",
    decision_provider_source: "licensed_fixture",
    source_reference: SOURCE_REFERENCE,
    entitlement_reference: ENTITLEMENT_REFERENCE,
    retention_rights_reference: RETENTION_REFERENCE,
    permitted_use: "internal_research_replay",
    frozen_at: "2026-09-17T20:10:00.000Z",
    session_calendar_reference: CALENDAR_REFERENCE,
    corporate_action_policy_version: "fixture-corporate-action-policy-v1",
    sessions: sessions.map((item) => ({
      session: item,
      universe_as_of: new Date(
        Date.parse(item.session_open) - 60_000,
      ).toISOString(),
    })),
  });
  if (!manifest) throw new Error("fixture corpus manifest must be valid");
  return {
    corpus_version: INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
    corpus_id: corpusId,
    deterministic_seed: SEED,
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    account: { ...ACCOUNT },
    execution_policy: { ...EXECUTION_POLICY },
    manifest,
    sessions,
  };
}

function corpora() {
  return {
    baseline: corpus({
      corpusId: BASELINE_CORPUS_ID,
      manifestId: BASELINE_MANIFEST_ID,
      policyVersion: "recommendation_publish_policy_v1",
      outcomes: [null, null, null, null],
    }),
    candidate: corpus({
      corpusId: CANDIDATE_CORPUS_ID,
      manifestId: CANDIDATE_MANIFEST_ID,
      policyVersion: "recommendation_publish_policy_v2_shadow",
      outcomes: [null, "win", "loss", "win"],
    }),
  };
}

function partitionAssignments() {
  return [
    { trading_date: DATES[0]!, partition: "training" },
    { trading_date: DATES[1]!, partition: "validation" },
    { trading_date: DATES[2]!, partition: "held_out" },
    { trading_date: DATES[3]!, partition: "walk_forward" },
  ] satisfies Array<{
    trading_date: string;
    partition: InternalPaperReplayExperimentPartition;
  }>;
}

function manifest(
  values = corpora(),
): {
  value: InternalPaperReplayExperimentManifest;
  baseline: InternalPaperReplayCorpusInput;
  candidate: InternalPaperReplayCorpusInput;
} {
  const value = buildInternalPaperReplayExperimentManifest({
    experiment_id: EXPERIMENT_ID,
    frozen_at: "2026-09-17T20:15:00.000Z",
    baseline_fingerprint: "a".repeat(64),
    evaluation_charter_fingerprint: "b".repeat(64),
    primary_outcome_horizon_minutes: 60,
    baseline: values.baseline,
    candidate: values.candidate,
    partitions: partitionAssignments(),
  });
  if (!value) throw new Error("fixture experiment manifest must be valid");
  return { value, ...values };
}

function rebuildCorpusManifest(input: InternalPaperReplayCorpusInput) {
  const value = buildInternalPaperReplayCorpusManifest({
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
    sessions: input.sessions.map((item) => ({
      session: item,
      universe_as_of: new Date(
        Date.parse(item.session_open) - 60_000,
      ).toISOString(),
    })),
  });
  if (!value) throw new Error("rebuilt corpus manifest must be valid");
  Object.assign(input, { manifest: value });
}

test.describe("SV-F1 frozen paired replay experiment", () => {
  test("replays exact frozen train, validation, held-out and walk-forward partitions deterministically", () => {
    const fixture = manifest();
    const input = {
      experiment_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
      manifest: fixture.value,
      baseline: fixture.baseline,
      candidate: fixture.candidate,
    } as const;
    const first = runInternalPaperReplayExperiment(input);
    const second = runInternalPaperReplayExperiment(input);

    expect(first).toEqual(second);
    expect(first.status).toBe("completed");
    if (first.status !== "completed") return;
    expect(first.scientific_disposition).toBe(
      "research_engine_result_not_strategy_accepted",
    );
    expect(first.partitions.map(({ partition }) => partition)).toEqual([
      "training",
      "validation",
      "held_out",
      "walk_forward",
    ]);
    expect(first.partitions[0]).toMatchObject({
      baseline: { sessions_with_position: 0, no_trade_count: 1 },
      candidate: { sessions_with_position: 0, no_trade_count: 1 },
      paired_deltas: { realized_net_pnl: 0, expectancy_r: null },
    });
    expect(first.partitions[1]).toMatchObject({
      baseline: { sessions_with_position: 0 },
      candidate: {
        sessions_with_position: 1,
        winning_position_count: 1,
        realized_net_pnl: 44.95,
      },
      paired_deltas: { realized_net_pnl: 44.95 },
    });
    expect(first.partitions[2]).toMatchObject({
      candidate: {
        sessions_with_position: 1,
        losing_position_count: 1,
        realized_net_pnl: -23.98,
      },
      paired_deltas: { realized_net_pnl: -23.98 },
    });
    expect(first.partitions[3]).toMatchObject({
      candidate: {
        sessions_with_position: 1,
        winning_position_count: 1,
        realized_net_pnl: 44.95,
      },
      paired_deltas: { realized_net_pnl: 44.95 },
    });
    expect(first.evidence_limits).toEqual([
      "no_calibrated_probability_assessment",
      "no_charter_threshold_verdict",
      "no_uncertainty_or_effective_sample_assessment",
      "no_forward_shadow_evidence",
      "source_rights_references_not_independently_verified",
    ]);
    expect(first.authority).toEqual({
      can_request_provider_data: false,
      can_change_ranking_or_publication: false,
      can_promote_strategy: false,
      can_execute_broker_action: false,
    });
  });

  test("freezes all four ordered partitions and a horizon-safe transition gap", () => {
    const values = corpora();
    expect(
      buildInternalPaperReplayExperimentManifest({
        experiment_id: EXPERIMENT_ID,
        frozen_at: "2026-09-17T20:15:00.000Z",
        baseline_fingerprint: "a".repeat(64),
        evaluation_charter_fingerprint: "b".repeat(64),
        primary_outcome_horizon_minutes: 60,
        ...values,
        partitions: partitionAssignments(),
      }),
    ).toMatchObject({
      partition_session_counts: {
        training: 1,
        validation: 1,
        held_out: 1,
        walk_forward: 1,
      },
      minimum_transition_gap_minutes: 1_051,
    });

    const outOfOrder = partitionAssignments();
    outOfOrder[1] = { ...outOfOrder[1]!, partition: "held_out" };
    outOfOrder[2] = { ...outOfOrder[2]!, partition: "validation" };
    expect(
      buildInternalPaperReplayExperimentManifest({
        experiment_id: EXPERIMENT_ID,
        frozen_at: "2026-09-17T20:15:00.000Z",
        baseline_fingerprint: "a".repeat(64),
        evaluation_charter_fingerprint: "b".repeat(64),
        primary_outcome_horizon_minutes: 60,
        ...values,
        partitions: outOfOrder,
      }),
    ).toBeNull();
  });

  test("rejects post-freeze decision mutation instead of evaluating changed inputs", () => {
    const fixture = manifest();
    fixture.candidate.sessions[2]!.decisions[0]!.decision.candidates[0]!.ranking!.score = 99;
    const result = runInternalPaperReplayExperiment({
      experiment_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
      manifest: fixture.value,
      baseline: fixture.baseline,
      candidate: fixture.candidate,
    });
    expect(result.status).toBe("blocked");
    expect(result.reason_codes).toContain("experiment_manifest_input_mismatch");
  });

  test("rejects mismatched opportunity populations even when each corpus manifest is re-frozen", () => {
    const values = corpora();
    values.candidate.sessions[2]!.decisions[0]!.decision.candidates[0]!.candidate_id =
      "scanner_candidate:v1:different-opportunity:AAPL";
    rebuildCorpusManifest(values.candidate);
    expect(
      buildInternalPaperReplayExperimentManifest({
        experiment_id: EXPERIMENT_ID,
        frozen_at: "2026-09-17T20:15:00.000Z",
        baseline_fingerprint: "a".repeat(64),
        evaluation_charter_fingerprint: "b".repeat(64),
        primary_outcome_horizon_minutes: 60,
        ...values,
        partitions: partitionAssignments(),
      }),
    ).toBeNull();

    const sourceTimeMismatch = corpora();
    sourceTimeMismatch.candidate.sessions[2]!.decisions[0]!.decision.candidates[0]!.data.source_timestamp =
      "2026-09-16T13:20:00.000Z";
    rebuildCorpusManifest(sourceTimeMismatch.candidate);
    expect(
      buildInternalPaperReplayExperimentManifest({
        experiment_id: EXPERIMENT_ID,
        frozen_at: "2026-09-17T20:15:00.000Z",
        baseline_fingerprint: "a".repeat(64),
        evaluation_charter_fingerprint: "b".repeat(64),
        primary_outcome_horizon_minutes: 60,
        ...sourceTimeMismatch,
        partitions: partitionAssignments(),
      }),
    ).toBeNull();
  });

  test("rejects mixed source lineage, account policy or execution policy", () => {
    const sourceMismatch = corpora();
    Object.assign(sourceMismatch.candidate, {
      manifest: {
        ...sourceMismatch.candidate.manifest,
        source_reference: "fixture://different-source",
      },
    });
    expect(
      buildInternalPaperReplayExperimentManifest({
        experiment_id: EXPERIMENT_ID,
        frozen_at: "2026-09-17T20:15:00.000Z",
        baseline_fingerprint: "a".repeat(64),
        evaluation_charter_fingerprint: "b".repeat(64),
        primary_outcome_horizon_minutes: 60,
        ...sourceMismatch,
        partitions: partitionAssignments(),
      }),
    ).toBeNull();

    const accountMismatch = corpora();
    Object.assign(accountMismatch.candidate, {
      account: {
        ...accountMismatch.candidate.account,
        initial_cash: 99_000,
      },
    });
    expect(
      buildInternalPaperReplayExperimentManifest({
        experiment_id: EXPERIMENT_ID,
        frozen_at: "2026-09-17T20:15:00.000Z",
        baseline_fingerprint: "a".repeat(64),
        evaluation_charter_fingerprint: "b".repeat(64),
        primary_outcome_horizon_minutes: 60,
        ...accountMismatch,
        partitions: partitionAssignments(),
      }),
    ).toBeNull();
  });

  test("rejects identical baseline and candidate policy lineage", () => {
    const values = corpora();
    values.candidate = corpus({
      corpusId: CANDIDATE_CORPUS_ID,
      manifestId: CANDIDATE_MANIFEST_ID,
      policyVersion: "recommendation_publish_policy_v1",
      outcomes: [null, null, null, null],
    });
    expect(
      buildInternalPaperReplayExperimentManifest({
        experiment_id: EXPERIMENT_ID,
        frozen_at: "2026-09-17T20:15:00.000Z",
        baseline_fingerprint: "a".repeat(64),
        evaluation_charter_fingerprint: "b".repeat(64),
        primary_outcome_horizon_minutes: 60,
        ...values,
        partitions: partitionAssignments(),
      }),
    ).toBeNull();
  });

  test("rejects a forged experiment manifest even when the corpus inputs remain valid", () => {
    const fixture = manifest();
    const result = runInternalPaperReplayExperiment({
      experiment_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
      manifest: {
        ...fixture.value,
        baseline_fingerprint: "c".repeat(64),
      },
      baseline: fixture.baseline,
      candidate: fixture.candidate,
    });
    expect(result.status).toBe("blocked");
    expect(result.reason_codes).toContain(
      "experiment_manifest_digest_mismatch",
    );
  });

  test("propagates a blocked child corpus instead of shrinking its frozen population", () => {
    const values = corpora();
    const executionValue = values.candidate.sessions[1]!.decisions[0]!.execution!;
    Object.assign(executionValue.base_replay.candles[2]!.candle, {
      volume: null,
    });
    rebuildCorpusManifest(values.candidate);
    const fixture = manifest(values);
    const result = runInternalPaperReplayExperiment({
      experiment_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
      manifest: fixture.value,
      baseline: fixture.baseline,
      candidate: fixture.candidate,
    });
    expect(result.status).toBe("blocked");
    expect(result.reason_codes).toContain("candidate_corpus_replay_blocked");
  });

  test("keeps an all-no-trade paired experiment honest and completed", () => {
    const values = {
      baseline: corpus({
        corpusId: BASELINE_CORPUS_ID,
        manifestId: BASELINE_MANIFEST_ID,
        policyVersion: "recommendation_publish_policy_v1",
        outcomes: [null, null, null, null],
      }),
      candidate: corpus({
        corpusId: CANDIDATE_CORPUS_ID,
        manifestId: CANDIDATE_MANIFEST_ID,
        policyVersion: "recommendation_publish_policy_v2_shadow",
        outcomes: [null, null, null, null],
      }),
    };
    const fixture = manifest(values);
    const result = runInternalPaperReplayExperiment({
      experiment_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
      manifest: fixture.value,
      baseline: fixture.baseline,
      candidate: fixture.candidate,
    });
    expect(result.status).toBe("completed");
    if (result.status !== "completed") return;
    expect(
      result.partitions.every(
        ({ baseline, candidate, paired_deltas }) =>
          baseline.sessions_without_position === 1 &&
          candidate.sessions_without_position === 1 &&
          paired_deltas.realized_net_pnl === 0 &&
          paired_deltas.expectancy_r === null,
      ),
    ).toBe(true);
  });
});
