import { expect, test } from "@playwright/test";

import { buildCandidateDecisionLearningAttribution } from "@/lib/candidate-decision-learning-attribution";
import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { buildCurrentDecisionStrategyReference } from "@/lib/decision-strategy-registry";
import {
  buildInternalPaperCounterfactualFamilyManifest,
  INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION,
  runInternalPaperCounterfactualFamily,
  verifyInternalPaperCounterfactualFamilyDigest,
  type InternalPaperCounterfactualVariantInput,
} from "@/lib/internal-paper-counterfactual-family";
import {
  buildInternalPaperCounterfactualCostStressManifest,
  INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_VERSION,
  runInternalPaperCounterfactualCostStress,
  verifyInternalPaperCounterfactualCostStressDigest,
} from "@/lib/internal-paper-counterfactual-cost-stress";
import {
  buildInternalPaperReplayCorpusManifest,
  INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
  runInternalPaperReplayCorpus,
  type InternalPaperReplayCorpusInput,
} from "@/lib/internal-paper-replay-corpus";
import {
  buildInternalPaperReplayExperimentManifest,
  INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
  runInternalPaperReplayExperiment,
  type InternalPaperReplayExperimentManifest,
  type InternalPaperReplayExperimentPartition,
} from "@/lib/internal-paper-replay-experiment";
import {
  evaluateInternalPaperReplayRegimeAttributedScorecard,
  verifyInternalPaperReplayRegimeAttributedScorecardDigest,
} from "@/lib/internal-paper-replay-regime-attribution";
import {
  evaluateInternalPaperRegimeShadowPolicy,
  verifyInternalPaperRegimeShadowPolicyDigest,
} from "@/lib/internal-paper-regime-shadow-policy";
import {
  buildInternalPaperReplayCharterEvidence,
  evaluateInternalPaperReplayCharterScorecard,
  INTERNAL_PAPER_REPLAY_CHARTER_EVIDENCE_VERSION,
  verifyInternalPaperReplayCharterEvidenceDigest,
  verifyInternalPaperReplayCharterScorecardDigest,
} from "@/lib/internal-paper-replay-charter-scorecard";
import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import {
  INTERNAL_PAPER_MARKET_REPLAY_VERSION,
  type InternalPaperReplayAccountConfig,
} from "@/lib/internal-paper-market-replay";
import {
  INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION,
  INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
  type InternalPaperReplayExecutionInput,
  type InternalPaperReplayExecutionPolicy,
} from "@/lib/internal-paper-replay-execution";
import {
  INTERNAL_PAPER_REPLAY_SESSION_VERSION,
  type InternalPaperReplaySessionInput,
} from "@/lib/internal-paper-replay-session";
import {
  buildRecommendationEvaluationCharterInput,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import type { RecommendationLearningBaselineFreeze } from "@/lib/recommendation-learning-baseline-freeze-store";
import type { SharedCandleCacheCandle } from "@/lib/shared-candle-cache";
import type { MarketContextIntelligenceV2Input } from "@/lib/market-context-intelligence-lab/contract-v2";
import {
  marketContextHistoricalShadowReplayGoldenFixtures,
  marketContextShadowReplayFixtureProducerVersions,
} from "@/lib/market-context-intelligence-lab/shadow-replay-fixtures-v1";
import {
  sealMarketContextShadowReplayV1Input,
  type MarketContextShadowReplayV1Input,
} from "@/lib/market-context-intelligence-lab/shadow-replay-v1";

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
  policy_version: "sv-f1-ioc-v2",
  order_type: "market",
  time_in_force: "ioc",
  limit_price: null,
  latency_ms: 0,
  liquidity_proxy_version: INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION,
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
  ticker = "AAPL",
}: {
  date: string;
  policyVersion: string;
  published: boolean;
  ticker?: string;
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

function candles({
  date,
  sessionIndex,
  outcome,
  ticker = "AAPL",
}: {
  date: string;
  sessionIndex: number;
  outcome: "win" | "loss";
  ticker?: string;
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
        ticker,
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
        source_request_id: `fixture-request-${ticker}-${date}`,
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
  const ticker = value.candidates[0]!.ticker;
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
    ticker,
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
      replay_id: `sv-f1-${ticker}-${date}`,
      deterministic_seed: SEED,
      dataset: {
        dataset_id: `licensed-${ticker}-${date}`,
        dataset_version: `${date}.v1`,
        source_reference: SOURCE_REFERENCE,
        entitlement_reference: ENTITLEMENT_REFERENCE,
        retention_rights_reference: RETENTION_REFERENCE,
        point_in_time_as_of: sessionTimes(date).pointInTime,
        ticker,
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
      candles: candles({ date, sessionIndex, outcome, ticker }),
    },
    policy: { ...EXECUTION_POLICY },
  };
}

function session({
  date,
  sessionIndex,
  policyVersion,
  outcome,
  ticker = "AAPL",
}: {
  date: string;
  sessionIndex: number;
  policyVersion: string;
  outcome: "win" | "loss" | null;
  ticker?: string;
}): InternalPaperReplaySessionInput {
  const value = decision({
    date,
    policyVersion,
    published: outcome !== null,
    ticker,
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
    eligible_symbols: [ticker],
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
  dates = DATES,
  tickers = [],
}: {
  corpusId: string;
  manifestId: string;
  policyVersion: string;
  outcomes: Array<"win" | "loss" | null>;
  dates?: string[];
  tickers?: string[];
}): InternalPaperReplayCorpusInput {
  const sessions = dates.map((date, index) =>
    session({
      date,
      sessionIndex: index + 1,
      policyVersion,
      outcome: outcomes[index] ?? null,
      ticker: tickers[index] ?? "AAPL",
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

function counterfactualExperiment({
  experimentId,
  baseline,
  candidate,
}: {
  experimentId: string;
  baseline: InternalPaperReplayCorpusInput;
  candidate: InternalPaperReplayCorpusInput;
}) {
  const value = buildInternalPaperReplayExperimentManifest({
    experiment_id: experimentId,
    frozen_at: "2026-09-22T20:15:00.000Z",
    baseline_fingerprint: "c".repeat(64),
    evaluation_charter_fingerprint: "d".repeat(64),
    primary_outcome_horizon_minutes: 60,
    baseline,
    candidate,
    partitions: partitionAssignments(),
  });
  if (!value) throw new Error("counterfactual experiment manifest must be valid");
  return {
    experiment_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
    manifest: value,
    baseline,
    candidate,
  } as const;
}

function retainRejectedFirstOpportunity(input: InternalPaperReplayCorpusInput) {
  const session = input.sessions[0]!;
  const first = session.decisions[0]!;
  session.decisions[0] = {
    ...first,
    execution: null,
    rejection_reason_codes: ["risk_policy_rejected"],
  };
  rebuildCorpusManifest(input);
}

function applyCounterfactualCosts(
  input: InternalPaperReplayCorpusInput,
  costs: Pick<
    InternalPaperReplayAccountConfig,
    "spread_bps" | "slippage_bps" | "commission_per_order"
  >,
) {
  Object.assign(input, { account: { ...input.account, ...costs } });
  for (const session of input.sessions) {
    const item = session.decisions[0]!;
    if (item.execution) {
      session.decisions[0] = {
        ...item,
        execution: {
          ...item.execution,
          base_replay: {
            ...item.execution.base_replay,
            account: { ...item.execution.base_replay.account, ...costs },
          },
        },
      };
    }
  }
  rebuildCorpusManifest(input);
}

function counterfactualFamilyFixture({ stressed = false } = {}) {
  const outcomes = ["win", "win", "loss", "win"] as const;
  const corpusIds = stressed
    ? [
        "33333333-3333-4333-8333-333333333361",
        "33333333-3333-4333-8333-333333333362",
        "33333333-3333-4333-8333-333333333363",
      ]
    : [
        "33333333-3333-4333-8333-333333333351",
        "33333333-3333-4333-8333-333333333352",
        "33333333-3333-4333-8333-333333333353",
      ];
  const manifestIds = stressed
    ? [
        "44444444-4444-4444-8444-444444444471",
        "44444444-4444-4444-8444-444444444472",
        "44444444-4444-4444-8444-444444444473",
      ]
    : [
        "44444444-4444-4444-8444-444444444461",
        "44444444-4444-4444-8444-444444444462",
        "44444444-4444-4444-8444-444444444463",
      ];
  const baseline = corpus({
    corpusId: corpusIds[0]!,
    manifestId: manifestIds[0]!,
    policyVersion: "recommendation_publish_policy_h1_baseline",
    outcomes: [...outcomes],
  });
  const sizingCandidate = corpus({
    corpusId: corpusIds[1]!,
    manifestId: manifestIds[1]!,
    policyVersion: "recommendation_publish_policy_h1_sizing",
    outcomes: [...outcomes],
  });
  const stopCandidate = corpus({
    corpusId: corpusIds[2]!,
    manifestId: manifestIds[2]!,
    policyVersion: "recommendation_publish_policy_h1_stop",
    outcomes: [...outcomes],
  });
  for (const value of [baseline, sizingCandidate, stopCandidate]) {
    retainRejectedFirstOpportunity(value);
    if (stressed) {
      applyCounterfactualCosts(value, {
        spread_bps: 30,
        slippage_bps: 20,
        commission_per_order: 3,
      });
    }
  }
  for (const value of sizingCandidate.sessions) {
    const item = value.decisions[0]!;
    if (item.execution) {
      value.decisions[0] = {
        ...item,
        execution: {
          ...item.execution,
          base_replay: {
            ...item.execution.base_replay,
            entry: { ...item.execution.base_replay.entry, quantity: 5 },
          },
        },
      };
    }
  }
  rebuildCorpusManifest(sizingCandidate);
  for (const value of stopCandidate.sessions) {
    const item = value.decisions[0]!;
    if (item.execution) {
      value.decisions[0] = {
        ...item,
        execution: {
          ...item.execution,
          base_replay: {
            ...item.execution.base_replay,
            entry: { ...item.execution.base_replay.entry, stop_price: 97 },
          },
        },
      };
    }
  }
  rebuildCorpusManifest(stopCandidate);

  const variants: InternalPaperCounterfactualVariantInput[] = [
    {
      variant_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
      intervention_dimension: "sizing",
      experiment: counterfactualExperiment({
        experimentId: stressed
          ? "77777777-7777-4777-8777-777777777791"
          : "77777777-7777-4777-8777-777777777781",
        baseline,
        candidate: sizingCandidate,
      }),
    },
    {
      variant_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
      intervention_dimension: "stop",
      experiment: counterfactualExperiment({
        experimentId: stressed
          ? "77777777-7777-4777-8777-777777777792"
          : "77777777-7777-4777-8777-777777777782",
        baseline,
        candidate: stopCandidate,
      }),
    },
  ];
  const manifest = buildInternalPaperCounterfactualFamilyManifest({
    family_id: stressed
      ? "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
      : "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    frozen_at: "2026-09-22T20:30:00.000Z",
    cost_fill_scenario_id: stressed
      ? "sv-h2-stressed-cost-scenario-v1"
      : "sv-h1-fixed-cost-fill-scenario-v1",
    variants,
  });
  if (!manifest) throw new Error("counterfactual family manifest must be valid");
  return { manifest, variants };
}

const SCORECARD_SEGMENT_KEY =
  '["recommendation_publish_policy_v1","sv_f2_replay_fixture"]';

function scorecardPolicyAttribution() {
  return {
    recommendation_publish_policy_version: "recommendation_publish_policy_v1",
    canonical_evaluation_versions: {
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
  } as const;
}

function scorecardCharter(): RecommendationEvaluationCharter {
  const definition: RecommendationEvaluationCharter["charter"] = {
    contract_version: "recommendation_evaluation_charter_v1",
    hypothesis:
      "The frozen shadow policy improves paired replay quality without weakening calibration, reliability, cost or feasibility.",
    eligible_universe:
      "Exact point-in-time paired internal-paper replay decisions in held-out and walk-forward partitions.",
    setup_slices: ["breakout"],
    regime_slices: ["risk_on_trending"],
    outcome_rules: {
      primary_horizon: "60m",
      diagnostic_horizons: ["15m", "30m", "60m"],
      semantics:
        "Positive realized replay R is a successful selected decision; explicit no-trade remains in the complete decision denominator.",
    },
    evaluation_window: {
      minimum_complete_decisions: 20,
      held_out_decision_count: 10,
      walk_forward_decision_count: 10,
    },
    thresholds: {
      minimum_precision_at_k: 0.55,
      minimum_expectancy_r: 0.1,
      maximum_calibration_error: 0.15,
      minimum_outcome_coverage: 0.95,
      maximum_missingness: 0.05,
      maximum_provider_credits_per_decision: 1,
      minimum_reliability: 0.99,
    },
    concentration_limits: {
      maximum_single_ticker_share: 1,
      maximum_single_sector_share: 1,
      maximum_single_setup_share: 1,
      maximum_single_regime_share: 1,
    },
    feasibility_inputs: {
      spread: "required",
      liquidity: "required",
      volatility: "required",
      halt_risk: "unavailable_disclosed",
      trigger_attainment: "required",
      conservative_slippage: "unavailable_disclosed",
    },
  };
  const input = buildRecommendationEvaluationCharterInput({
    ownerUserId: OWNER_ID,
    segmentKey: SCORECARD_SEGMENT_KEY,
    policy: scorecardPolicyAttribution(),
    charter: definition,
  });
  if (!input) throw new Error("scorecard fixture charter must be valid");
  return {
    charter_id: "88888888-8888-4888-8888-888888888888",
    charter_fingerprint: input.charter_fingerprint,
    owner_user_id: OWNER_ID,
    segment_key: SCORECARD_SEGMENT_KEY,
    policy_attribution: scorecardPolicyAttribution(),
    charter: definition,
    created_at: "2026-09-14T12:00:00.000Z",
  };
}

function scorecardBaseline(
  charter: RecommendationEvaluationCharter,
  dates = DATES,
): RecommendationLearningBaselineFreeze {
  return {
    baseline_id: "99999999-9999-4999-8999-999999999999",
    baseline_fingerprint: "a".repeat(64),
    owner_user_id: OWNER_ID,
    segment_key: SCORECARD_SEGMENT_KEY,
    decision_record_fingerprints: dates.map((date) => `rec_scan_run_${date}`),
    evaluation_plan: {
      contract_version: "recommendation_learning_evaluation_plan_v1",
      segment_key: SCORECARD_SEGMENT_KEY,
      status: "ready_for_explicit_freeze",
      policy_attribution: scorecardPolicyAttribution(),
      decision_records: {
        count: dates.length,
        earliest_decision_timestamp: `${dates[0]}T13:31:00.000Z`,
        latest_decision_timestamp: `${dates.at(-1)}T13:31:00.000Z`,
        scan_run_fingerprints: dates.map((date) => `rec_scan_run_${date}`),
      },
      outcome_population: {
        visible_primary_outcome_count: 0,
        research_primary_outcome_count: dates.length,
        rejected_primary_outcome_count: 0,
        explicit_no_trade_decision_count: dates.length,
        primary_outcome_by_horizon: { "15m": 0, "30m": 0, "60m": dates.length },
      },
      metrics: {
        entry: {
          known_count: 0,
          triggered_count: 0,
          not_triggered_count: 0,
          unknown_count: dates.length,
          triggered_rate: null,
        },
        terminal: {
          target_first_count: 0,
          stop_first_count: 0,
          neither_count: 0,
          unknown_count: dates.length,
        },
        horizon_r: { observed_count: 0, mean: null, median: null },
        excursion: {
          contract_version: "recommendation_outcome_entry_bound_excursion_v1",
          status: "entry_bound_excursion_measured_with_explicit_missingness",
          triggered_outcome_count: 0,
          contract_missing_count: 0,
          mfe_r: { observed_count: 0, mean: null, median: null },
          mae_r: { observed_count: 0, mean: null, median: null },
          paired_mfe_mae_count: 0,
          mfe_missing_count: 0,
          mae_missing_count: 0,
        },
      },
      blockers: [],
      notes: [],
    },
    evaluation_charter_fingerprint: charter.charter_fingerprint,
    frozen_at: "2026-09-14T12:05:00.000Z",
  };
}

function scorecardFixture() {
  const charter = scorecardCharter();
  const baseline = scorecardBaseline(charter);
  const values = corpora();
  const experimentManifest = buildInternalPaperReplayExperimentManifest({
    experiment_id: EXPERIMENT_ID,
    frozen_at: "2026-09-17T20:15:00.000Z",
    baseline_fingerprint: baseline.baseline_fingerprint,
    evaluation_charter_fingerprint: charter.charter_fingerprint,
    primary_outcome_horizon_minutes: 60,
    ...values,
    partitions: partitionAssignments(),
  });
  if (!experimentManifest) {
    throw new Error("scorecard fixture experiment manifest must be valid");
  }
  const feasible = {
    spread: true,
    liquidity: true,
    volatility: true,
    halt_risk: null,
    trigger_attainment: true,
    conservative_slippage: null,
  } as const;
  const evidence = buildInternalPaperReplayCharterEvidence({
      evidence_version: INTERNAL_PAPER_REPLAY_CHARTER_EVIDENCE_VERSION,
      evaluated_at: "2026-09-17T20:20:00.000Z",
      bootstrap_seed: "sv-f2-charter-scorecard-fixture-v1",
      decisions: DATES.map((date) => ({
        scan_run_fingerprint: `rec_scan_run_${date}`,
        trading_date: date,
        setup: "breakout",
        regime: "risk_on_trending",
        baseline: {
          predicted_probability: null,
          provider_cost_credits: 0.5,
          source_reliable: true,
          feasibility: { ...feasible },
        },
        candidate: {
          predicted_probability: null,
          provider_cost_credits: 0.5,
          source_reliable: true,
          feasibility: { ...feasible },
        },
      })),
  });
  if (!evidence) throw new Error("scorecard fixture evidence must be valid");
  return {
    charter,
    baseline,
    experiment: {
      experiment_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
      manifest: experimentManifest,
      ...values,
    } as const,
    evidence,
  };
}

function rebaseMarketContextInput(
  input: MarketContextIntelligenceV2Input,
  decisionTimestamp: string,
) {
  const value = structuredClone(input);
  const decisionMs = Date.parse(decisionTimestamp);
  const pointTimestamp = new Date(decisionMs - 5 * 60_000).toISOString();
  const receivedTimestamp = new Date(decisionMs - 4 * 60_000).toISOString();
  value.decision_timestamp = decisionTimestamp;
  for (const benchmark of value.benchmarks) {
    if (benchmark.provider.source_timestamp !== null) {
      benchmark.provider.source_timestamp = pointTimestamp;
    }
    benchmark.provider.received_timestamp = receivedTimestamp;
    for (const point of [...benchmark.intraday, ...benchmark.multi_day]) {
      point.timestamp = pointTimestamp;
    }
  }
  if (value.breadth) {
    value.breadth.timestamp = pointTimestamp;
    if (value.breadth.provider.source_timestamp !== null) {
      value.breadth.provider.source_timestamp = pointTimestamp;
    }
    value.breadth.provider.received_timestamp = receivedTimestamp;
  }
  for (const sector of value.sectors ?? []) {
    if (sector.provider.source_timestamp !== null) {
      sector.provider.source_timestamp = pointTimestamp;
    }
    sector.provider.received_timestamp = receivedTimestamp;
    for (const point of [
      ...sector.short_horizon,
      ...sector.medium_horizon,
    ]) {
      point.timestamp = pointTimestamp;
    }
  }
  return value;
}

function regimeReplayFor({
  dates,
  tickers,
  replayId,
}: {
  dates: string[];
  tickers: string[];
  replayId: string;
}): MarketContextShadowReplayV1Input {
  const source = marketContextHistoricalShadowReplayGoldenFixtures.find(
    (item) => item.id === "clear_risk_on_day",
  )?.input.dataset.decisions[0]?.context_input;
  if (!source) throw new Error("risk-on context fixture must exist");
  return sealMarketContextShadowReplayV1Input({
    replay_id: replayId,
    dataset: {
      identity: {
        dataset_id: replayId,
        dataset_version: "2026-09-v1",
        source_kind: "synthetic_repository_fixture",
      },
      decisions: dates.map((date, index) => {
        const decisionTimestamp = `${date}T13:31:00.000Z`;
        return {
          decision_id: `rec_scan_run_${date}`,
          ticker: tickers[index] ?? "AAPL",
          session_label: date,
          context_input: rebaseMarketContextInput(source, decisionTimestamp),
        };
      }),
    },
    producer_versions: {
      ...marketContextShadowReplayFixtureProducerVersions,
    },
  });
}

function regimeReplay(): MarketContextShadowReplayV1Input {
  return regimeReplayFor({
    dates: DATES,
    tickers: DATES.map(() => "AAPL"),
    replayId: "sv-g1-regime-attribution-fixture-v1",
  });
}

function unavailableRegimeReplay(): MarketContextShadowReplayV1Input {
  const source = regimeReplay();
  const decisions = structuredClone(source.dataset.decisions);
  for (const decision of decisions) {
    const staleTimestamp = new Date(
      Date.parse(decision.context_input.decision_timestamp) - 3 * 86_400_000,
    ).toISOString();
    for (const benchmark of decision.context_input.benchmarks) {
      benchmark.provider.source_timestamp = staleTimestamp;
    }
  }
  return sealMarketContextShadowReplayV1Input({
    replay_id: `${source.replay_id}-unavailable`,
    dataset: { ...source.dataset, decisions },
    producer_versions: source.producer_versions,
  });
}

function regimeAttributionFixture() {
  const fixture = scorecardFixture();
  return {
    ...fixture,
    evidence: {
      evaluated_at: fixture.evidence.evaluated_at,
      bootstrap_seed: fixture.evidence.bootstrap_seed,
      decisions: fixture.evidence.decisions.map((item) => ({
        scan_run_fingerprint: item.scan_run_fingerprint,
        trading_date: item.trading_date,
        setup: item.setup,
        baseline: item.baseline,
        candidate: item.candidate,
      })),
    },
    contextReplay: regimeReplay(),
  };
}

function weekdayDates(start: string, count: number) {
  const values: string[] = [];
  const cursor = new Date(`${start}T00:00:00.000Z`);
  while (values.length < count) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) values.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return values;
}

function passingRegimePolicyFixture() {
  const dates = weekdayDates("2026-07-06", 44);
  const tickers = dates.map(
    (_, index) => ["AAPL", "MSFT", "NVDA", "META"][index % 4]!,
  );
  const definition: RecommendationEvaluationCharter["charter"] = {
    ...scorecardCharter().charter,
    evaluation_window: {
      minimum_complete_decisions: 40,
      held_out_decision_count: 20,
      walk_forward_decision_count: 20,
    },
  };
  const charterInput = buildRecommendationEvaluationCharterInput({
    ownerUserId: OWNER_ID,
    segmentKey: SCORECARD_SEGMENT_KEY,
    policy: scorecardPolicyAttribution(),
    charter: definition,
  });
  if (!charterInput) throw new Error("G.2 charter must be valid");
  const charter: RecommendationEvaluationCharter = {
    charter_id: "88888888-8888-4888-8888-888888888889",
    charter_fingerprint: charterInput.charter_fingerprint,
    owner_user_id: OWNER_ID,
    segment_key: SCORECARD_SEGMENT_KEY,
    policy_attribution: scorecardPolicyAttribution(),
    charter: definition,
    created_at: "2026-01-02T12:00:00.000Z",
  };
  const baseline = {
    ...scorecardBaseline(charter, dates),
    baseline_id: "99999999-9999-4999-8999-999999999998",
    frozen_at: "2026-01-02T12:05:00.000Z",
  };
  const values = {
    baseline: corpus({
      corpusId: "33333333-3333-4333-8333-333333333341",
      manifestId: "44444444-4444-4444-8444-444444444451",
      policyVersion: "recommendation_publish_policy_v1",
      outcomes: dates.map(() => null),
      dates,
      tickers,
    }),
    candidate: corpus({
      corpusId: "33333333-3333-4333-8333-333333333342",
      manifestId: "44444444-4444-4444-8444-444444444452",
      policyVersion: "recommendation_publish_policy_v2_shadow",
      outcomes: dates.map(() => "win" as const),
      dates,
      tickers,
    }),
  };
  const partitions = dates.map((trading_date, index) => ({
    trading_date,
    partition:
      index < 2
        ? "training"
        : index < 4
          ? "validation"
          : index < 24
            ? "held_out"
            : "walk_forward",
  })) satisfies Array<{
    trading_date: string;
    partition: InternalPaperReplayExperimentPartition;
  }>;
  const experimentManifest = buildInternalPaperReplayExperimentManifest({
    experiment_id: "77777777-7777-4777-8777-777777777778",
    frozen_at: "2026-09-17T20:15:00.000Z",
    baseline_fingerprint: baseline.baseline_fingerprint,
    evaluation_charter_fingerprint: charter.charter_fingerprint,
    primary_outcome_horizon_minutes: 60,
    ...values,
    partitions,
  });
  if (!experimentManifest) throw new Error("G.2 experiment manifest must be valid");
  const feasible = {
    spread: true,
    liquidity: true,
    volatility: true,
    halt_risk: null,
    trigger_attainment: true,
    conservative_slippage: null,
  } as const;
  return {
    charter,
    baseline,
    experiment: {
      experiment_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
      manifest: experimentManifest,
      ...values,
    } as const,
    evidence: {
      evaluated_at: "2026-09-17T20:20:00.000Z",
      bootstrap_seed: "sv-g2-regime-shadow-policy-fixture-v1",
      decisions: dates.map((date) => ({
        scan_run_fingerprint: `rec_scan_run_${date}`,
        trading_date: date,
        setup: "breakout",
        baseline: {
          predicted_probability: null,
          provider_cost_credits: 0.5,
          source_reliable: true,
          feasibility: { ...feasible },
        },
        candidate: {
          predicted_probability: 0.9,
          provider_cost_credits: 0.5,
          source_reliable: true,
          feasibility: { ...feasible },
        },
      })),
    },
    contextReplay: regimeReplayFor({
      dates,
      tickers,
      replayId: "sv-g2-regime-shadow-policy-fixture-v1",
    }),
  };
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
    Object.assign(executionValue.base_replay.candles[1]!.candle, {
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

test.describe("SV-F2 charter-bound replay scorecard", () => {
  test("keeps the complete paired population but returns inconclusive for a tiny uncalibrated fixture", () => {
    const fixture = scorecardFixture();
    const result = evaluateInternalPaperReplayCharterScorecard(fixture);
    const repeated = evaluateInternalPaperReplayCharterScorecard(fixture);

    expect(result).toEqual(repeated);
    expect(verifyInternalPaperReplayCharterEvidenceDigest(fixture.evidence)).toBe(
      true,
    );
    expect(verifyInternalPaperReplayCharterScorecardDigest(result)).toBe(true);
    expect(result).toMatchObject({
      status: "completed",
      verdict: "inconclusive",
      scientific_disposition: "research_scorecard_not_strategy_accepted",
      population: {
        expected_decision_count: 4,
        evidenced_decision_count: 4,
        complete_paired_decision_coverage: true,
        explicit_no_trade_decision_count: 4,
      },
      authority: {
        can_request_provider_data: false,
        can_change_ranking_or_publication: false,
        can_promote_strategy: false,
        can_execute_broker_action: false,
      },
    });
    if (result.status !== "completed") return;
    expect(result.partitions.map(({ partition, verdict }) => ({ partition, verdict }))).toEqual([
      { partition: "held_out", verdict: "inconclusive" },
      { partition: "walk_forward", verdict: "inconclusive" },
    ]);
    expect(result.reason_codes).toEqual(expect.arrayContaining([
      "minimum_complete_decision_count_not_met",
      "minimum_complete_selected_decisions_not_met",
      "minimum_effective_trading_days_not_met",
      "calibrated_probability_missing",
    ]));
    expect(
      verifyInternalPaperReplayCharterScorecardDigest({
        ...result,
        verdict: "fail",
      }),
    ).toBe(false);
  });

  test("blocks missing, duplicate or extra decision evidence instead of shrinking the denominator", () => {
    const missing = scorecardFixture();
    const missingEvidence = buildInternalPaperReplayCharterEvidence({
      ...missing.evidence,
      decisions: missing.evidence.decisions.slice(0, -1),
    });
    if (!missingEvidence) throw new Error("missing evidence fixture must rebuild");
    const missingResult = evaluateInternalPaperReplayCharterScorecard({
      ...missing,
      evidence: missingEvidence,
    });
    expect(missingResult.status).toBe("blocked");
    expect(missingResult.reason_codes).toContain(
      "paired_decision_population_incomplete_or_mismatched",
    );

    const duplicate = scorecardFixture();
    const duplicateEvidence = buildInternalPaperReplayCharterEvidence({
      ...duplicate.evidence,
      decisions: [
        ...duplicate.evidence.decisions.slice(0, -1),
        structuredClone(duplicate.evidence.decisions[2]!),
      ],
    });
    if (!duplicateEvidence) {
      throw new Error("duplicate evidence fixture must rebuild");
    }
    const duplicateResult = evaluateInternalPaperReplayCharterScorecard({
      ...duplicate,
      evidence: duplicateEvidence,
    });
    expect(duplicateResult.status).toBe("blocked");
    expect(duplicateResult.reason_codes).toContain("duplicate_decision_evidence");
  });

  test("blocks tampered evidence and observations outside the frozen charter slices", () => {
    const fixture = scorecardFixture();
    const tamperedResult = evaluateInternalPaperReplayCharterScorecard({
      ...fixture,
      evidence: {
        ...fixture.evidence,
        bootstrap_seed: "tampered-after-freeze",
      },
    });
    expect(tamperedResult.status).toBe("blocked");
    expect(tamperedResult.reason_codes).toContain("charter_evidence_invalid");

    const outsideEvidence = buildInternalPaperReplayCharterEvidence({
      ...fixture.evidence,
      decisions: fixture.evidence.decisions.map((decision, index) =>
        index === 0 ? { ...decision, regime: "risk_off" } : decision,
      ),
    });
    if (!outsideEvidence) throw new Error("outside-slice evidence must rebuild");
    const outsideResult = evaluateInternalPaperReplayCharterScorecard({
      ...fixture,
      evidence: outsideEvidence,
    });
    expect(outsideResult.status).toBe("blocked");
    expect(outsideResult.reason_codes).toContain(
      "decision_outside_charter_setup_or_regime_slices",
    );
  });

  test("blocks a changed charter, policy segment or primary horizon before scoring", () => {
    const fixture = scorecardFixture();
    const result = evaluateInternalPaperReplayCharterScorecard({
      ...fixture,
      experiment: {
        ...fixture.experiment,
        manifest: {
          ...fixture.experiment.manifest,
          evaluation_charter_fingerprint: "f".repeat(64),
        },
      },
    });
    expect(result.status).toBe("blocked");
    expect(result.reason_codes).toContain(
      "baseline_charter_experiment_binding_mismatch",
    );
  });
});

test.describe("SV-G1 replay-bound regime attribution", () => {
  test("derives every F2 regime from the exact point-in-time context replay", () => {
    const fixture = regimeAttributionFixture();
    const result = evaluateInternalPaperReplayRegimeAttributedScorecard(fixture);
    const repeated = evaluateInternalPaperReplayRegimeAttributedScorecard(fixture);

    expect(result).toEqual(repeated);
    expect(verifyInternalPaperReplayRegimeAttributedScorecardDigest(result)).toBe(
      true,
    );
    expect(result).toMatchObject({
      status: "completed",
      scientific_disposition: "research_context_binding_not_strategy_accepted",
      context_source_kind: "synthetic_repository_fixture",
      measurable_regime_count: 4,
      unavailable_or_conflicting_regime_count: 0,
      scorecard: {
        status: "completed",
        verdict: "inconclusive",
      },
      authority: {
        can_request_provider_data: false,
        can_change_ranking_or_publication: false,
        can_promote_strategy: false,
        can_execute_broker_action: false,
      },
    });
    expect(result.bindings).toHaveLength(4);
    expect(
      result.bindings.every(
        (binding) =>
          binding.classification === "risk_on_trending" &&
          binding.context_version === "market_context_intelligence_v2" &&
          /^[a-f0-9]{64}$/.test(binding.context_evidence_digest),
      ),
    ).toBe(true);
    expect(result.reason_codes).toContain(
      "synthetic_context_source_fixture_only",
    );
  });

  test("blocks a context decision that does not match ticker, date or instant", () => {
    const fixture = regimeAttributionFixture();
    const contextReplay = sealMarketContextShadowReplayV1Input({
      replay_id: fixture.contextReplay.replay_id,
      dataset: {
        ...fixture.contextReplay.dataset,
        decisions: fixture.contextReplay.dataset.decisions.map(
          (decision, index) =>
            index === 0 ? { ...decision, ticker: "MSFT" } : decision,
        ),
      },
      producer_versions: fixture.contextReplay.producer_versions,
    });
    const result = evaluateInternalPaperReplayRegimeAttributedScorecard({
      ...fixture,
      contextReplay,
    });

    expect(result.status).toBe("blocked");
    expect(result.reason_codes).toContain("regime_decision_binding_mismatch");
    expect(result.scorecard).toBeNull();
  });

  test("blocks a changed sealed replay and an incomplete context population", () => {
    const changed = regimeAttributionFixture();
    changed.contextReplay.dataset.decisions[0]!.ticker = "MSFT";
    const changedResult = evaluateInternalPaperReplayRegimeAttributedScorecard(
      changed,
    );
    expect(changedResult.status).toBe("blocked");
    expect(changedResult.reason_codes).toContain(
      "market_context_shadow_replay_invalid",
    );

    const incomplete = regimeAttributionFixture();
    const contextReplay = sealMarketContextShadowReplayV1Input({
      replay_id: incomplete.contextReplay.replay_id,
      dataset: {
        ...incomplete.contextReplay.dataset,
        decisions: incomplete.contextReplay.dataset.decisions.slice(0, -1),
      },
      producer_versions: incomplete.contextReplay.producer_versions,
    });
    const incompleteResult =
      evaluateInternalPaperReplayRegimeAttributedScorecard({
        ...incomplete,
        contextReplay,
      });
    expect(incompleteResult.status).toBe("blocked");
    expect(incompleteResult.reason_codes).toContain(
      "regime_decision_population_incomplete_or_extra",
    );
  });

  test("retains unavailable regime bindings but never evaluates them as neutral", () => {
    const fixture = regimeAttributionFixture();
    const result = evaluateInternalPaperReplayRegimeAttributedScorecard({
      ...fixture,
      contextReplay: unavailableRegimeReplay(),
    });

    expect(result.status).toBe("blocked");
    expect(result.reason_codes).toContain("regime_attribution_incomplete");
    expect(result.measurable_regime_count).toBe(0);
    expect(result.unavailable_or_conflicting_regime_count).toBe(4);
    expect(
      result.bindings.every(
        (binding) => binding.classification === "insufficient_data",
      ),
    ).toBe(true);
    expect(result.scorecard).toBeNull();
  });
});

test.describe("SV-G2 replay-only regime shadow policy", () => {
  test("keeps a small valid regime sample as insufficient rather than enabling it", () => {
    const fixture = regimeAttributionFixture();
    const result = evaluateInternalPaperRegimeShadowPolicy(fixture);
    const repeated = evaluateInternalPaperRegimeShadowPolicy(fixture);

    expect(result).toEqual(repeated);
    expect(verifyInternalPaperRegimeShadowPolicyDigest(result)).toBe(true);
    expect(result).toMatchObject({
      status: "completed",
      scientific_disposition: "replay_shadow_policy_not_strategy_accepted",
      enabled_regime_count: 0,
      disabled_regime_count: 0,
      insufficient_regime_count: 1,
      authority: {
        can_request_provider_data: false,
        can_change_ranking_or_publication: false,
        can_promote_strategy: false,
        can_execute_broker_action: false,
      },
    });
    expect(result.decisions[0]).toMatchObject({
      regime: "risk_on_trending",
      action: "insufficient_evidence",
    });
    expect(
      result.decisions[0]!.partitions.every(
        (partition) => partition.verdict === "inconclusive",
      ),
    ).toBe(true);
  });

  test("enables only replay shadow when both OOS partitions clear every regime gate", () => {
    const fixture = passingRegimePolicyFixture();
    const candidateCorpusResult = runInternalPaperReplayCorpus(
      fixture.experiment.candidate,
    );
    expect(
      candidateCorpusResult.status,
      JSON.stringify(candidateCorpusResult, null, 2),
    ).toBe("completed");
    const experimentResult = runInternalPaperReplayExperiment(
      fixture.experiment,
    );
    expect(
      experimentResult.status,
      JSON.stringify(experimentResult, null, 2),
    ).toBe("completed");
    const attribution =
      evaluateInternalPaperReplayRegimeAttributedScorecard(fixture);
    expect(attribution.status, JSON.stringify(attribution, null, 2)).toBe(
      "completed",
    );
    const result = evaluateInternalPaperRegimeShadowPolicy(fixture);

    expect(verifyInternalPaperRegimeShadowPolicyDigest(result)).toBe(true);
    expect(result.status, JSON.stringify(result, null, 2)).toBe("completed");
    expect(result).toMatchObject({
      status: "completed",
      enabled_regime_count: 1,
      disabled_regime_count: 0,
      insufficient_regime_count: 0,
      decisions: [
        {
          regime: "risk_on_trending",
          action: "shadow_enabled",
        },
      ],
    });
    expect(
      result.decisions[0]!.partitions.every(
        (partition) =>
          partition.verdict === "pass" &&
          partition.complete_selected_count === 20 &&
          partition.effective_ticker_count === 4 &&
          partition.gates.every((gate) => gate.status === "pass"),
      ),
    ).toBe(true);
    expect(result.evidence_limits).toContain("no_automatic_policy_promotion");
  });

  test("disables replay shadow when reliability violates the frozen charter", () => {
    const fixture = passingRegimePolicyFixture();
    fixture.evidence.decisions[4]!.candidate.source_reliable = false;
    const result = evaluateInternalPaperRegimeShadowPolicy(fixture);

    expect(result.status, JSON.stringify(result, null, 2)).toBe("completed");
    expect(result.enabled_regime_count).toBe(0);
    expect(result.disabled_regime_count).toBe(1);
    expect(result.decisions[0]!.action).toBe("shadow_disabled");
    expect(
      result.decisions[0]!.partitions.some((partition) =>
        partition.gates.some(
          (gate) => gate.gate === "minimum_reliability" && gate.status === "fail",
        ),
      ),
    ).toBe(true);
  });

  test("blocks changed point-in-time context before any shadow decision", () => {
    const fixture = regimeAttributionFixture();
    fixture.contextReplay.dataset.decisions[0]!.ticker = "MSFT";
    const result = evaluateInternalPaperRegimeShadowPolicy(fixture);

    expect(result.status).toBe("blocked");
    expect(result.reason_codes).toContain("regime_attribution_not_completed");
    expect(result.decisions).toEqual([]);
  });
});

test.describe("SV-H1 frozen counterfactual opportunity family", () => {
  test("runs isolated stop and sizing portfolios on the exact shared denominator", () => {
    const fixture = counterfactualFamilyFixture();
    const input = {
      family_version: INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION,
      ...fixture,
    } as const;
    const first = runInternalPaperCounterfactualFamily(input);
    const second = runInternalPaperCounterfactualFamily(input);

    expect(first).toEqual(second);
    expect(verifyInternalPaperCounterfactualFamilyDigest(first)).toBe(true);
    expect(first.status, JSON.stringify(first, null, 2)).toBe("completed");
    if (first.status !== "completed") return;
    expect(first).toMatchObject({
      scientific_disposition:
        "replay_counterfactual_family_not_strategy_accepted",
      authority: {
        can_request_provider_data: false,
        can_change_ranking_or_publication: false,
        can_promote_strategy: false,
        can_execute_broker_action: false,
      },
    });
    expect(first.variants.map(({ intervention_dimension }) => intervention_dimension)).toEqual([
      "sizing",
      "stop",
    ]);
    expect(new Set(first.variants.map(({ portfolio_identity }) => portfolio_identity)).size).toBe(
      2,
    );
    expect(
      new Set(first.variants.map(({ baseline_result_digest }) => baseline_result_digest))
        .size,
    ).toBe(1);
    expect(
      new Set(first.variants.map(({ candidate_result_digest }) => candidate_result_digest))
        .size,
    ).toBe(2);
    for (const variant of first.variants) {
      expect(
        variant.partitions.reduce(
          (sum, partition) => sum + partition.opportunity_count,
          0,
        ),
      ).toBe(4);
      expect(variant.partitions[0]).toMatchObject({
        opportunity_count: 1,
        baseline: { decision_count: 1, rejected_count: 1 },
        candidate: { decision_count: 1, rejected_count: 1 },
      });
    }
    expect(first.evidence_limits).toContain(
      "single_frozen_cost_fill_scenario_only",
    );
    expect(first.evidence_limits).toContain("no_forward_shadow_acceptance");
  });

  test("rejects a falsely declared intervention dimension before evaluation", () => {
    const fixture = counterfactualFamilyFixture();
    const variants: InternalPaperCounterfactualVariantInput[] = [
      { ...fixture.variants[0]!, intervention_dimension: "exit" },
      fixture.variants[1]!,
    ];

    expect(
      buildInternalPaperCounterfactualFamilyManifest({
        family_id: fixture.manifest.family_id,
        frozen_at: fixture.manifest.frozen_at,
        cost_fill_scenario_id: fixture.manifest.cost_fill_scenario_id,
        variants,
      }),
    ).toBeNull();
  });

  test("blocks post-freeze market-evidence mutation instead of comparing it", () => {
    const fixture = counterfactualFamilyFixture();
    const execution =
      fixture.variants[0]!.experiment.candidate.sessions[1]!.decisions[0]!
        .execution;
    if (!execution) throw new Error("fixture execution must exist");
    execution.base_replay.candles[0]!.candle.high = 123;

    const result = runInternalPaperCounterfactualFamily({
      family_version: INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION,
      ...fixture,
    });
    expect(result.status).toBe("blocked");
    expect(result.reason_codes).toContain(
      "counterfactual_family_manifest_input_mismatch",
    );
    expect(result.authority.can_promote_strategy).toBe(false);
  });

  test("rejects unequal market evidence even when each child is independently re-frozen", () => {
    const fixture = counterfactualFamilyFixture();
    const changed = fixture.variants[1]!.experiment;
    const execution = changed.candidate.sessions[1]!.decisions[0]!.execution;
    if (!execution) throw new Error("fixture execution must exist");
    execution.base_replay.candles[0]!.candle.high = 123;
    rebuildCorpusManifest(changed.candidate);
    const refreshed = counterfactualExperiment({
      experimentId: changed.manifest.experiment_id,
      baseline: changed.baseline,
      candidate: changed.candidate,
    });
    const variants: InternalPaperCounterfactualVariantInput[] = [
      fixture.variants[0]!,
      { ...fixture.variants[1]!, experiment: refreshed },
    ];

    expect(
      buildInternalPaperCounterfactualFamilyManifest({
        family_id: fixture.manifest.family_id,
        frozen_at: fixture.manifest.frozen_at,
        cost_fill_scenario_id: fixture.manifest.cost_fill_scenario_id,
        variants,
      }),
    ).toBeNull();
  });
});

function counterfactualCostStressFixture() {
  const base = counterfactualFamilyFixture();
  const stressed = counterfactualFamilyFixture({ stressed: true });
  const scenarios = [
    {
      scenario_id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd1",
      family: {
        family_version: INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION,
        ...base,
      },
    },
    {
      scenario_id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd2",
      family: {
        family_version: INTERNAL_PAPER_COUNTERFACTUAL_FAMILY_VERSION,
        ...stressed,
      },
    },
  ] as const;
  const manifest = buildInternalPaperCounterfactualCostStressManifest({
    matrix_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    frozen_at: "2026-09-22T20:45:00.000Z",
    scenarios,
  });
  if (!manifest) throw new Error("counterfactual cost stress manifest must be valid");
  return { manifest, scenarios };
}

test.describe("SV-H2 frozen counterfactual cost stress", () => {
  test("reports worst-case paired diagnostics across equal-budget cost scenarios", () => {
    const fixture = counterfactualCostStressFixture();
    const input = {
      stress_version: INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_VERSION,
      ...fixture,
    } as const;
    const first = runInternalPaperCounterfactualCostStress(input);
    const second = runInternalPaperCounterfactualCostStress(input);

    expect(first).toEqual(second);
    expect(verifyInternalPaperCounterfactualCostStressDigest(first)).toBe(true);
    expect(first.status, JSON.stringify(first, null, 2)).toBe("completed");
    if (first.status !== "completed") return;
    expect(first).toMatchObject({
      scientific_disposition:
        "replay_cost_stress_diagnostic_not_strategy_accepted",
      authority: {
        can_request_provider_data: false,
        can_change_ranking_or_publication: false,
        can_promote_strategy: false,
        can_execute_broker_action: false,
      },
    });
    expect(first.variants).toHaveLength(2);
    for (const variant of first.variants) {
      expect(variant.scenarios).toHaveLength(2);
      expect(variant.partition_stress).toHaveLength(4);
      expect(
        variant.partition_stress.every(
          (partition) => partition.scenario_count === 2,
        ),
      ).toBe(true);
      expect(
        variant.scenarios.every(
          (scenario) =>
            scenario.partitions[0]!.opportunity_count === 1 &&
            scenario.partitions[0]!.rejected_count === 1,
        ),
      ).toBe(true);
    }
    expect(first.evidence_limits).toContain(
      "no_fill_latency_or_market_impact_uncertainty",
    );
    expect(first.evidence_limits).toContain("no_automatic_policy_promotion");
  });

  test("blocks a post-freeze cost mutation instead of mixing scenarios", () => {
    const fixture = counterfactualCostStressFixture();
    const stressed = fixture.scenarios[1]!.family.variants[0]!.experiment.baseline;
    Object.assign(stressed, {
      account: { ...stressed.account, commission_per_order: 4 },
    });

    const result = runInternalPaperCounterfactualCostStress({
      stress_version: INTERNAL_PAPER_COUNTERFACTUAL_COST_STRESS_VERSION,
      ...fixture,
    });
    expect(result.status).toBe("blocked");
    expect(result.reason_codes).toContain("cost_stress_manifest_input_mismatch");
    expect(result.authority.can_promote_strategy).toBe(false);
  });

  test("refuses duplicate scenario families instead of double-counting evidence", () => {
    const fixture = counterfactualCostStressFixture();
    expect(
      buildInternalPaperCounterfactualCostStressManifest({
        matrix_id: fixture.manifest.matrix_id,
        frozen_at: fixture.manifest.frozen_at,
        scenarios: [
          fixture.scenarios[0]!,
          {
            scenario_id: "dddddddd-dddd-4ddd-8ddd-ddddddddddd3",
            family: fixture.scenarios[0]!.family,
          },
        ],
      }),
    ).toBeNull();
  });
});
