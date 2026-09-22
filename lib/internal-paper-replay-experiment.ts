import { createHash } from "node:crypto";

import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import {
  INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
  runInternalPaperReplayCorpus,
  type InternalPaperReplayCorpusInput,
  type InternalPaperReplayCorpusResult,
  type InternalPaperReplayCorpusSessionResult,
} from "@/lib/internal-paper-replay-corpus";

export const INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION =
  "internal_paper_replay_experiment_v1" as const;
export const INTERNAL_PAPER_REPLAY_EXPERIMENT_MANIFEST_VERSION =
  "internal_paper_replay_experiment_manifest_v1" as const;
export const INTERNAL_PAPER_REPLAY_EXPERIMENT_RESULT_VERSION =
  "internal_paper_replay_experiment_result_v1" as const;

export type InternalPaperReplayExperimentPartition =
  | "training"
  | "validation"
  | "held_out"
  | "walk_forward";

type PolicyLineage = Readonly<{
  strategy_id: string;
  strategy_version: string;
  strategy_registry_version: string;
  strategy_rollback_identity: string;
  symbol_selection_policy_id: string;
  symbol_selection_policy_version: string;
  recommendation_publish_policy_version: string;
  canonical_evaluation_versions: NonNullable<
    CandidateDecisionRecord["learning_attribution"]["canonical_evaluation_versions"]
  >;
}>;

type FrozenCorpusBinding = Readonly<{
  corpus_id: string;
  corpus_manifest_digest: string;
  account_policy_digest: string;
  execution_policy_digest: string;
  policy_lineage: PolicyLineage;
}>;

export type InternalPaperReplayExperimentSessionBinding = Readonly<{
  sequence: number;
  trading_date: string;
  session_open: string;
  session_close: string;
  partition: InternalPaperReplayExperimentPartition;
  opportunity_set_digest: string;
  opportunity_count: number;
  baseline_session_input_digest: string;
  candidate_session_input_digest: string;
}>;

export type InternalPaperReplayExperimentManifest = Readonly<{
  manifest_version: typeof INTERNAL_PAPER_REPLAY_EXPERIMENT_MANIFEST_VERSION;
  experiment_id: string;
  frozen_at: string;
  baseline_fingerprint: string;
  evaluation_charter_fingerprint: string;
  primary_outcome_horizon_minutes: 15 | 30 | 60;
  source_lineage_digest: string;
  baseline: FrozenCorpusBinding;
  candidate: FrozenCorpusBinding;
  sessions: InternalPaperReplayExperimentSessionBinding[];
  partition_session_counts: Record<InternalPaperReplayExperimentPartition, number>;
  minimum_transition_gap_minutes: number;
  manifest_digest: string;
}>;

export type InternalPaperReplayExperimentManifestInput = Readonly<{
  experiment_id: string;
  frozen_at: string;
  baseline_fingerprint: string;
  evaluation_charter_fingerprint: string;
  primary_outcome_horizon_minutes: 15 | 30 | 60;
  baseline: InternalPaperReplayCorpusInput;
  candidate: InternalPaperReplayCorpusInput;
  partitions: ReadonlyArray<
    Readonly<{
      trading_date: string;
      partition: InternalPaperReplayExperimentPartition;
    }>
  >;
}>;

export type InternalPaperReplayExperimentInput = Readonly<{
  experiment_version: typeof INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION;
  manifest: InternalPaperReplayExperimentManifest;
  baseline: InternalPaperReplayCorpusInput;
  candidate: InternalPaperReplayCorpusInput;
}>;

export type InternalPaperReplayExperimentPolicyMetrics = Readonly<{
  session_count: number;
  sessions_with_position: number;
  sessions_without_position: number;
  decision_count: number;
  accepted_count: number;
  rejected_count: number;
  no_trade_count: number;
  winning_position_count: number;
  losing_position_count: number;
  flat_position_count: number;
  realized_net_pnl: number;
  execution_cost: number;
  expectancy_r: number | null;
  maximum_drawdown: number;
}>;

export type InternalPaperReplayExperimentPartitionResult = Readonly<{
  partition: InternalPaperReplayExperimentPartition;
  session_count: number;
  trading_dates: string[];
  baseline: InternalPaperReplayExperimentPolicyMetrics;
  candidate: InternalPaperReplayExperimentPolicyMetrics;
  paired_deltas: Readonly<{
    sessions_with_position: number;
    realized_net_pnl: number;
    execution_cost: number;
    expectancy_r: number | null;
    maximum_drawdown: number;
  }>;
}>;

export type InternalPaperReplayExperimentBlockReason =
  | "baseline_corpus_replay_blocked"
  | "candidate_corpus_replay_blocked"
  | "economic_result_out_of_range"
  | "experiment_identity_invalid"
  | "experiment_manifest_digest_mismatch"
  | "experiment_manifest_input_mismatch"
  | "paired_result_mismatch"
  | "policy_lineage_mismatch";

type Authority = Readonly<{
  can_request_provider_data: false;
  can_change_ranking_or_publication: false;
  can_promote_strategy: false;
  can_execute_broker_action: false;
}>;

export type InternalPaperReplayExperimentResult =
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_REPLAY_EXPERIMENT_RESULT_VERSION;
      experiment_version: typeof INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION;
      status: "blocked";
      reason_codes: InternalPaperReplayExperimentBlockReason[];
      experiment_id: string | null;
      manifest_digest: string | null;
      baseline_result_digest: string | null;
      candidate_result_digest: string | null;
      authority: Authority;
      result_digest: string;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_REPLAY_EXPERIMENT_RESULT_VERSION;
      experiment_version: typeof INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION;
      status: "completed";
      reason_codes: [];
      scientific_disposition: "research_engine_result_not_strategy_accepted";
      experiment_id: string;
      manifest_digest: string;
      baseline_result_digest: string;
      candidate_result_digest: string;
      partitions: InternalPaperReplayExperimentPartitionResult[];
      evidence_limits: readonly [
        "no_calibrated_probability_assessment",
        "no_charter_threshold_verdict",
        "no_uncertainty_or_effective_sample_assessment",
        "no_forward_shadow_evidence",
        "source_rights_references_not_independently_verified",
      ];
      authority: Authority;
      result_digest: string;
    }>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const DECIMAL_SCALE = BigInt(1_000_000);
const MAX_SAFE_SCALED_NUMBER = BigInt(Number.MAX_SAFE_INTEGER);
const PARTITIONS = [
  "training",
  "validation",
  "held_out",
  "walk_forward",
] as const;
const PARTITION_ORDER: Record<InternalPaperReplayExperimentPartition, number> = {
  training: 0,
  validation: 1,
  held_out: 2,
  walk_forward: 3,
};
const AUTHORITY = {
  can_request_provider_data: false,
  can_change_ranking_or_publication: false,
  can_promote_strategy: false,
  can_execute_broker_action: false,
} as const;
const EVIDENCE_LIMITS = [
  "no_calibrated_probability_assessment",
  "no_charter_threshold_verdict",
  "no_uncertainty_or_effective_sample_assessment",
  "no_forward_shadow_evidence",
  "source_rights_references_not_independently_verified",
] as const;

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

function terminal<T extends object>(value: T): T & { result_digest: string } {
  return { ...value, result_digest: digest(value) };
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function arraysEqual(left: unknown[], right: unknown[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function manifestWithoutDigest(manifest: InternalPaperReplayExperimentManifest) {
  const { manifest_digest: manifestDigest, ...unsigned } = manifest;
  void manifestDigest;
  return unsigned;
}

function policyLineageFromDecision(
  decision: CandidateDecisionRecord,
): PolicyLineage | null {
  const strategy = decision.strategy_reference;
  const attribution = decision.learning_attribution;
  const versions = attribution.canonical_evaluation_versions;
  if (!strategy || attribution.attribution_status !== "complete" || !versions) {
    return null;
  }
  return {
    strategy_id: strategy.strategy_id,
    strategy_version: strategy.strategy_version,
    strategy_registry_version: strategy.registry_version,
    strategy_rollback_identity: strategy.rollback_identity,
    symbol_selection_policy_id: strategy.symbol_selection.policy_id,
    symbol_selection_policy_version: strategy.symbol_selection.policy_version,
    recommendation_publish_policy_version:
      attribution.recommendation_publish_policy_version,
    canonical_evaluation_versions: versions,
  };
}

function corpusPolicyLineage(input: InternalPaperReplayCorpusInput) {
  const lineages = input.sessions.flatMap((session) =>
    session.decisions.map(({ decision }) => policyLineageFromDecision(decision)),
  );
  if (lineages.length === 0 || lineages.some((lineage) => lineage === null)) {
    return null;
  }
  const values = lineages as PolicyLineage[];
  return values.every((value) => digest(value) === digest(values[0]))
    ? values[0]
    : null;
}

function sourceLineage(input: InternalPaperReplayCorpusInput) {
  const manifest = input.manifest;
  return {
    dataset_collection_id: manifest.dataset_collection_id,
    dataset_collection_version: manifest.dataset_collection_version,
    decision_provider_source: manifest.decision_provider_source,
    source_reference: manifest.source_reference,
    entitlement_reference: manifest.entitlement_reference,
    retention_rights_reference: manifest.retention_rights_reference,
    permitted_use: manifest.permitted_use,
    session_calendar_reference: manifest.session_calendar_reference,
    corporate_action_policy_version: manifest.corporate_action_policy_version,
  };
}

function corpusBinding(
  input: InternalPaperReplayCorpusInput,
  lineage: PolicyLineage,
): FrozenCorpusBinding {
  return {
    corpus_id: input.corpus_id,
    corpus_manifest_digest: input.manifest.manifest_digest,
    account_policy_digest: digest(input.account),
    execution_policy_digest: digest(input.execution_policy),
    policy_lineage: lineage,
  };
}

function opportunityIdentity(session: InternalPaperReplayCorpusInput["sessions"][number]) {
  return session.decisions.map(({ decision }) => ({
    scan_run_id: decision.scan_run_id,
    scan_run_fingerprint: decision.scan_run_fingerprint,
    decision_timestamp: decision.decision_timestamp,
    observed_candidate_count: decision.coverage.observed_candidate_count,
    full_membership_captured: decision.coverage.full_membership_captured,
    candidates: decision.candidates
      .map((candidate) => ({
        candidate_id: candidate.candidate_id,
        ticker: candidate.ticker.trim().toUpperCase(),
        company_name: candidate.company_name,
        sector: candidate.sector,
        provider_source: candidate.data.provider_source,
        source_timestamp: candidate.data.source_timestamp,
        freshness: candidate.data.freshness,
        indicator_source: candidate.data.indicator_source,
        gap_codes: [...candidate.data.gap_codes].sort(),
      }))
      .sort((left, right) => left.candidate_id.localeCompare(right.candidate_id)),
  }));
}

function manifestSessionDigestIsValid(input: InternalPaperReplayCorpusInput) {
  return input.sessions.every(
    (session, index) =>
      input.manifest.session_bindings[index]?.session_id === session.session_id &&
      input.manifest.session_bindings[index]?.trading_date === session.trading_date &&
      input.manifest.session_bindings[index]?.session_input_digest === digest(session),
  );
}

function compatibleCorpusInputs(
  baseline: InternalPaperReplayCorpusInput,
  candidate: InternalPaperReplayCorpusInput,
) {
  if (
    baseline.corpus_version !== INTERNAL_PAPER_REPLAY_CORPUS_VERSION ||
    candidate.corpus_version !== INTERNAL_PAPER_REPLAY_CORPUS_VERSION ||
    baseline.corpus_id === candidate.corpus_id ||
    baseline.owner_user_id !== candidate.owner_user_id ||
    baseline.account_id !== candidate.account_id ||
    baseline.deterministic_seed !== candidate.deterministic_seed ||
    digest(baseline.account) !== digest(candidate.account) ||
    digest(baseline.execution_policy) !== digest(candidate.execution_policy) ||
    digest(sourceLineage(baseline)) !== digest(sourceLineage(candidate)) ||
    baseline.sessions.length !== candidate.sessions.length ||
    baseline.sessions.length < 4 ||
    !manifestSessionDigestIsValid(baseline) ||
    !manifestSessionDigestIsValid(candidate)
  ) {
    return false;
  }

  return baseline.sessions.every((session, index) => {
    const peer = candidate.sessions[index];
    const baselineBinding = baseline.manifest.session_bindings[index];
    const candidateBinding = candidate.manifest.session_bindings[index];
    return Boolean(
      peer &&
        baselineBinding &&
        candidateBinding &&
        session.trading_date === peer.trading_date &&
        session.session_open === peer.session_open &&
        session.session_close === peer.session_close &&
        baselineBinding.universe_as_of === candidateBinding.universe_as_of &&
        baselineBinding.observed_universe_version ===
          candidateBinding.observed_universe_version &&
        arraysEqual(
          baselineBinding.eligible_symbols,
          candidateBinding.eligible_symbols,
        ) &&
        arraysEqual(opportunityIdentity(session), opportunityIdentity(peer)),
    );
  });
}

/**
 * Freezes a paired replay experiment before either corpus result is inspected.
 * The exact baseline/candidate inputs, source lineage, opportunity population,
 * chronological partitions and label-horizon transition gap are hash-bound.
 */
export function buildInternalPaperReplayExperimentManifest(
  input: InternalPaperReplayExperimentManifestInput,
): InternalPaperReplayExperimentManifest | null {
  if (
    !UUID_PATTERN.test(input.experiment_id) ||
    !explicitInstant(input.frozen_at) ||
    !SHA256_PATTERN.test(input.baseline_fingerprint) ||
    !SHA256_PATTERN.test(input.evaluation_charter_fingerprint) ||
    ![15, 30, 60].includes(input.primary_outcome_horizon_minutes) ||
    !compatibleCorpusInputs(input.baseline, input.candidate) ||
    input.partitions.length !== input.baseline.sessions.length
  ) {
    return null;
  }

  const baselinePolicy = corpusPolicyLineage(input.baseline);
  const candidatePolicy = corpusPolicyLineage(input.candidate);
  if (
    !baselinePolicy ||
    !candidatePolicy ||
    digest(baselinePolicy) === digest(candidatePolicy) ||
    Date.parse(input.frozen_at) <
      Math.max(
        Date.parse(input.baseline.manifest.frozen_at),
        Date.parse(input.candidate.manifest.frozen_at),
      )
  ) {
    return null;
  }

  const assignmentByDate = new Map(
    input.partitions.map(({ trading_date, partition }) => [trading_date, partition]),
  );
  if (
    assignmentByDate.size !== input.partitions.length ||
    input.partitions.some(
      ({ trading_date, partition }) =>
        !input.baseline.sessions.some((session) => session.trading_date === trading_date) ||
        !PARTITIONS.includes(partition),
    )
  ) {
    return null;
  }

  const sessions = input.baseline.sessions.map((session, index) => {
    const partition = assignmentByDate.get(session.trading_date)!;
    const opportunities = opportunityIdentity(session);
    return {
      sequence: index + 1,
      trading_date: session.trading_date,
      session_open: session.session_open,
      session_close: session.session_close,
      partition,
      opportunity_set_digest: digest(opportunities),
      opportunity_count: opportunities.length,
      baseline_session_input_digest:
        input.baseline.manifest.session_bindings[index]!.session_input_digest,
      candidate_session_input_digest:
        input.candidate.manifest.session_bindings[index]!.session_input_digest,
    } satisfies InternalPaperReplayExperimentSessionBinding;
  });
  if (
    sessions.some(({ partition }) => partition === undefined) ||
    sessions.some(
      ({ partition }, index) =>
        index > 0 &&
        PARTITION_ORDER[partition] < PARTITION_ORDER[sessions[index - 1]!.partition],
    )
  ) {
    return null;
  }

  const counts = Object.fromEntries(
    PARTITIONS.map((partition) => [
      partition,
      sessions.filter((session) => session.partition === partition).length,
    ]),
  ) as Record<InternalPaperReplayExperimentPartition, number>;
  if (PARTITIONS.some((partition) => counts[partition] < 1)) return null;

  const transitionGaps = sessions.flatMap((session, index) => {
    const next = sessions[index + 1];
    if (!next || next.partition === session.partition) return [];
    const gap = (Date.parse(next.session_open) - Date.parse(session.session_close)) / 60_000;
    return Number.isFinite(gap) ? [gap] : [];
  });
  if (
    transitionGaps.length !== PARTITIONS.length - 1 ||
    transitionGaps.some(
      (gap) => gap < input.primary_outcome_horizon_minutes,
    )
  ) {
    return null;
  }

  const unsigned = {
    manifest_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_MANIFEST_VERSION,
    experiment_id: input.experiment_id,
    frozen_at: input.frozen_at,
    baseline_fingerprint: input.baseline_fingerprint,
    evaluation_charter_fingerprint: input.evaluation_charter_fingerprint,
    primary_outcome_horizon_minutes: input.primary_outcome_horizon_minutes,
    source_lineage_digest: digest(sourceLineage(input.baseline)),
    baseline: corpusBinding(input.baseline, baselinePolicy),
    candidate: corpusBinding(input.candidate, candidatePolicy),
    sessions,
    partition_session_counts: counts,
    minimum_transition_gap_minutes: Math.min(...transitionGaps),
  } as const;
  return { ...unsigned, manifest_digest: digest(unsigned) };
}

function invalidResult({
  input,
  reasons,
  baselineResult,
  candidateResult,
}: {
  input: InternalPaperReplayExperimentInput;
  reasons: InternalPaperReplayExperimentBlockReason[];
  baselineResult?: InternalPaperReplayCorpusResult;
  candidateResult?: InternalPaperReplayCorpusResult;
}): InternalPaperReplayExperimentResult {
  return terminal({
    result_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_RESULT_VERSION,
    experiment_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
    status: "blocked" as const,
    reason_codes: Array.from(new Set(reasons)).sort(),
    experiment_id: UUID_PATTERN.test(input.manifest.experiment_id)
      ? input.manifest.experiment_id
      : null,
    manifest_digest: SHA256_PATTERN.test(input.manifest.manifest_digest)
      ? input.manifest.manifest_digest
      : null,
    baseline_result_digest: baselineResult?.result_digest ?? null,
    candidate_result_digest: candidateResult?.result_digest ?? null,
    authority: AUTHORITY,
  });
}

function toScaled(value: number) {
  const negative = value < 0;
  const [whole, fraction = ""] = Math.abs(value).toFixed(6).split(".");
  const scaled = BigInt(whole) * DECIMAL_SCALE + BigInt(fraction.padEnd(6, "0"));
  return negative ? -scaled : scaled;
}

function fromScaled(value: bigint) {
  if (value > MAX_SAFE_SCALED_NUMBER || value < -MAX_SAFE_SCALED_NUMBER) {
    throw new RangeError("experiment result exceeds the safe decimal range");
  }
  return Number(value) / Number(DECIMAL_SCALE);
}

function averageScaled(values: bigint[]) {
  if (values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, BigInt(0));
  const divisor = BigInt(values.length);
  const negative = total < BigInt(0);
  const absolute = negative ? -total : total;
  const rounded = (absolute + divisor / BigInt(2)) / divisor;
  return fromScaled(negative ? -rounded : rounded);
}

function metrics(
  sessions: InternalPaperReplayCorpusSessionResult[],
): InternalPaperReplayExperimentPolicyMetrics {
  let cumulative = BigInt(0);
  let peak = BigInt(0);
  let maximumDrawdown = BigInt(0);
  for (const session of sessions) {
    cumulative += toScaled(session.realized_net_pnl);
    if (cumulative > peak) peak = cumulative;
    const drawdown = peak - cumulative;
    if (drawdown > maximumDrawdown) maximumDrawdown = drawdown;
  }
  const rValues = sessions.flatMap(({ r_multiple }) =>
    r_multiple === null ? [] : [toScaled(r_multiple)],
  );
  const netPnl = sessions.reduce(
    (sum, session) => sum + toScaled(session.realized_net_pnl),
    BigInt(0),
  );
  const executionCost = sessions.reduce(
    (sum, session) => sum + toScaled(session.execution_cost),
    BigInt(0),
  );
  return {
    session_count: sessions.length,
    sessions_with_position: sessions.filter(
      ({ executed_position_count }) => executed_position_count === 1,
    ).length,
    sessions_without_position: sessions.filter(
      ({ executed_position_count }) => executed_position_count === 0,
    ).length,
    decision_count: sessions.reduce((sum, session) => sum + session.decision_count, 0),
    accepted_count: sessions.reduce((sum, session) => sum + session.accepted_count, 0),
    rejected_count: sessions.reduce((sum, session) => sum + session.rejected_count, 0),
    no_trade_count: sessions.reduce((sum, session) => sum + session.no_trade_count, 0),
    winning_position_count: sessions.filter(
      ({ realized_net_pnl }) => realized_net_pnl > 0,
    ).length,
    losing_position_count: sessions.filter(
      ({ realized_net_pnl }) => realized_net_pnl < 0,
    ).length,
    flat_position_count: sessions.filter(
      ({ executed_position_count, realized_net_pnl }) =>
        executed_position_count === 1 && realized_net_pnl === 0,
    ).length,
    realized_net_pnl: fromScaled(netPnl),
    execution_cost: fromScaled(executionCost),
    expectancy_r: averageScaled(rValues),
    maximum_drawdown: fromScaled(maximumDrawdown),
  };
}

function completedCorpus(
  result: InternalPaperReplayCorpusResult,
): result is Extract<InternalPaperReplayCorpusResult, { status: "completed" }> {
  return result.status === "completed";
}

/**
 * Runs the exact paired corpora and returns deterministic partitioned research
 * metrics. Completion proves reproducibility of this frozen engine experiment,
 * not OOS quality, calibrated probabilities, forward shadow success or a
 * promotion decision.
 */
export function runInternalPaperReplayExperiment(
  input: InternalPaperReplayExperimentInput,
): InternalPaperReplayExperimentResult {
  const reasons: InternalPaperReplayExperimentBlockReason[] = [];
  if (
    input.experiment_version !== INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION ||
    input.manifest.manifest_version !==
      INTERNAL_PAPER_REPLAY_EXPERIMENT_MANIFEST_VERSION ||
    !UUID_PATTERN.test(input.manifest.experiment_id)
  ) {
    reasons.push("experiment_identity_invalid");
  }
  if (
    !SHA256_PATTERN.test(input.manifest.manifest_digest) ||
    digest(manifestWithoutDigest(input.manifest)) !== input.manifest.manifest_digest
  ) {
    reasons.push("experiment_manifest_digest_mismatch");
  }
  const rebuilt = buildInternalPaperReplayExperimentManifest({
    experiment_id: input.manifest.experiment_id,
    frozen_at: input.manifest.frozen_at,
    baseline_fingerprint: input.manifest.baseline_fingerprint,
    evaluation_charter_fingerprint:
      input.manifest.evaluation_charter_fingerprint,
    primary_outcome_horizon_minutes:
      input.manifest.primary_outcome_horizon_minutes,
    baseline: input.baseline,
    candidate: input.candidate,
    partitions: input.manifest.sessions.map(({ trading_date, partition }) => ({
      trading_date,
      partition,
    })),
  });
  if (!rebuilt || rebuilt.manifest_digest !== input.manifest.manifest_digest) {
    reasons.push("experiment_manifest_input_mismatch");
  }
  if (reasons.length > 0) return invalidResult({ input, reasons });

  const baselineResult = runInternalPaperReplayCorpus(input.baseline);
  if (!completedCorpus(baselineResult)) {
    return invalidResult({
      input,
      reasons: ["baseline_corpus_replay_blocked"],
      baselineResult,
    });
  }
  const candidateResult = runInternalPaperReplayCorpus(input.candidate);
  if (!completedCorpus(candidateResult)) {
    return invalidResult({
      input,
      reasons: ["candidate_corpus_replay_blocked"],
      baselineResult,
      candidateResult,
    });
  }
  if (
    digest(baselineResult.policy_lineage) !== digest(input.manifest.baseline.policy_lineage) ||
    digest(candidateResult.policy_lineage) !== digest(input.manifest.candidate.policy_lineage)
  ) {
    return invalidResult({
      input,
      reasons: ["policy_lineage_mismatch"],
      baselineResult,
      candidateResult,
    });
  }
  if (
    baselineResult.sessions.length !== input.manifest.sessions.length ||
    candidateResult.sessions.length !== input.manifest.sessions.length ||
    input.manifest.sessions.some((binding, index) => {
      const baselineSession = baselineResult.sessions[index];
      const candidateSession = candidateResult.sessions[index];
      return (
        !baselineSession ||
        !candidateSession ||
        baselineSession.trading_date !== binding.trading_date ||
        candidateSession.trading_date !== binding.trading_date ||
        baselineSession.session_input_digest !== binding.baseline_session_input_digest ||
        candidateSession.session_input_digest !== binding.candidate_session_input_digest
      );
    })
  ) {
    return invalidResult({
      input,
      reasons: ["paired_result_mismatch"],
      baselineResult,
      candidateResult,
    });
  }

  let partitions: InternalPaperReplayExperimentPartitionResult[];
  try {
    partitions = PARTITIONS.map((partition) => {
      const indices = input.manifest.sessions.flatMap((session, index) =>
        session.partition === partition ? [index] : [],
      );
      const baselineMetrics = metrics(
        indices.map((index) => baselineResult.sessions[index]!),
      );
      const candidateMetrics = metrics(
        indices.map((index) => candidateResult.sessions[index]!),
      );
      return {
        partition,
        session_count: indices.length,
        trading_dates: indices.map(
          (index) => input.manifest.sessions[index]!.trading_date,
        ),
        baseline: baselineMetrics,
        candidate: candidateMetrics,
        paired_deltas: {
          sessions_with_position:
            candidateMetrics.sessions_with_position -
            baselineMetrics.sessions_with_position,
          realized_net_pnl: fromScaled(
            toScaled(candidateMetrics.realized_net_pnl) -
              toScaled(baselineMetrics.realized_net_pnl),
          ),
          execution_cost: fromScaled(
            toScaled(candidateMetrics.execution_cost) -
              toScaled(baselineMetrics.execution_cost),
          ),
          expectancy_r:
            candidateMetrics.expectancy_r === null ||
            baselineMetrics.expectancy_r === null
              ? null
              : fromScaled(
                  toScaled(candidateMetrics.expectancy_r) -
                    toScaled(baselineMetrics.expectancy_r),
                ),
          maximum_drawdown: fromScaled(
            toScaled(candidateMetrics.maximum_drawdown) -
              toScaled(baselineMetrics.maximum_drawdown),
          ),
        },
      } satisfies InternalPaperReplayExperimentPartitionResult;
    });
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return invalidResult({
      input,
      reasons: ["economic_result_out_of_range"],
      baselineResult,
      candidateResult,
    });
  }

  return terminal({
    result_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_RESULT_VERSION,
    experiment_version: INTERNAL_PAPER_REPLAY_EXPERIMENT_VERSION,
    status: "completed" as const,
    reason_codes: [] as [],
    scientific_disposition:
      "research_engine_result_not_strategy_accepted" as const,
    experiment_id: input.manifest.experiment_id,
    manifest_digest: input.manifest.manifest_digest,
    baseline_result_digest: baselineResult.result_digest,
    candidate_result_digest: candidateResult.result_digest,
    partitions,
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}
