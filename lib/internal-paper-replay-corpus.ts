import { createHash } from "node:crypto";

import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import type { InternalPaperReplayAccountConfig } from "@/lib/internal-paper-market-replay";
import type { InternalPaperReplayExecutionPolicy } from "@/lib/internal-paper-replay-execution";
import {
  INTERNAL_PAPER_REPLAY_SESSION_VERSION,
  runInternalPaperReplaySession,
  type InternalPaperReplaySessionInput,
  type InternalPaperReplaySessionResult,
} from "@/lib/internal-paper-replay-session";

export const INTERNAL_PAPER_REPLAY_CORPUS_VERSION =
  "internal_paper_replay_corpus_v1" as const;
export const INTERNAL_PAPER_REPLAY_CORPUS_MANIFEST_VERSION =
  "internal_paper_replay_corpus_manifest_v1" as const;
export const INTERNAL_PAPER_REPLAY_CORPUS_RESULT_VERSION =
  "internal_paper_replay_corpus_result_v1" as const;

export type InternalPaperReplayCorpusSessionBinding = Readonly<{
  session_id: string;
  trading_date: string;
  session_open: string;
  session_close: string;
  universe_as_of: string;
  observed_universe_version: string;
  eligible_symbols: string[];
  session_input_digest: string;
}>;

export type InternalPaperReplayCorpusManifest = Readonly<{
  manifest_version: typeof INTERNAL_PAPER_REPLAY_CORPUS_MANIFEST_VERSION;
  manifest_id: string;
  corpus_id: string;
  dataset_collection_id: string;
  dataset_collection_version: string;
  decision_provider_source: string;
  source_reference: string;
  entitlement_reference: string;
  retention_rights_reference: string;
  permitted_use: "internal_research_replay";
  frozen_at: string;
  coverage_start_date: string;
  coverage_end_date: string;
  session_calendar_reference: string;
  corporate_action_policy_version: string;
  session_bindings: InternalPaperReplayCorpusSessionBinding[];
  manifest_digest: string;
}>;

export type InternalPaperReplayCorpusManifestInput = Readonly<{
  manifest_id: string;
  corpus_id: string;
  dataset_collection_id: string;
  dataset_collection_version: string;
  decision_provider_source: string;
  source_reference: string;
  entitlement_reference: string;
  retention_rights_reference: string;
  permitted_use: "internal_research_replay";
  frozen_at: string;
  session_calendar_reference: string;
  corporate_action_policy_version: string;
  sessions: Array<
    Readonly<{
      session: InternalPaperReplaySessionInput;
      universe_as_of: string;
    }>
  >;
}>;

export type InternalPaperReplayCorpusInput = Readonly<{
  corpus_version: typeof INTERNAL_PAPER_REPLAY_CORPUS_VERSION;
  corpus_id: string;
  deterministic_seed: string;
  owner_user_id: string;
  account_id: string;
  account: InternalPaperReplayAccountConfig;
  execution_policy: InternalPaperReplayExecutionPolicy;
  manifest: InternalPaperReplayCorpusManifest;
  sessions: InternalPaperReplaySessionInput[];
}>;

export type InternalPaperReplayCorpusBlockReason =
  | "account_policy_invalid"
  | "account_policy_mismatch"
  | "corpus_identity_invalid"
  | "cross_session_identity_collision"
  | "economic_result_out_of_range"
  | "execution_policy_invalid"
  | "execution_policy_mismatch"
  | "manifest_coverage_invalid"
  | "manifest_digest_mismatch"
  | "manifest_identity_invalid"
  | "point_in_time_universe_invalid"
  | "session_blocked"
  | "session_input_digest_mismatch"
  | "session_manifest_mismatch"
  | "session_order_invalid"
  | "source_lineage_mismatch"
  | "strategy_policy_mismatch";

export type InternalPaperReplayCorpusSessionResult = Readonly<{
  sequence: number;
  trading_date: string;
  session_id: string;
  session_input_digest: string;
  session_result_digest: string;
  decision_count: number;
  accepted_count: number;
  rejected_count: number;
  no_trade_count: number;
  executed_position_count: 0 | 1;
  realized_gross_pnl: number;
  realized_net_pnl: number;
  execution_cost: number;
  r_multiple: number | null;
}>;

type InternalPaperReplayCorpusAuthority = Readonly<{
  can_request_provider_data: false;
  can_change_ranking_or_publication: false;
  can_promote_strategy: false;
  can_execute_broker_action: false;
}>;

export type InternalPaperReplayCorpusResult =
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_REPLAY_CORPUS_RESULT_VERSION;
      corpus_version: typeof INTERNAL_PAPER_REPLAY_CORPUS_VERSION;
      status: "blocked";
      reason_codes: InternalPaperReplayCorpusBlockReason[];
      input_digest: string;
      manifest_digest: string | null;
      blocked_trading_date: string | null;
      blocked_session: InternalPaperReplaySessionResult | null;
      authority: InternalPaperReplayCorpusAuthority;
      result_digest: string;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_REPLAY_CORPUS_RESULT_VERSION;
      corpus_version: typeof INTERNAL_PAPER_REPLAY_CORPUS_VERSION;
      status: "completed";
      reason_codes: [];
      input_digest: string;
      manifest_digest: string;
      policy_lineage: InternalPaperReplayCorpusPolicyLineage;
      source_lineage: Readonly<{
        dataset_collection_id: string;
        dataset_collection_version: string;
        decision_provider_source: string;
        source_reference: string;
        entitlement_reference: string;
        retention_rights_reference: string;
        permitted_use: "internal_research_replay";
        session_calendar_reference: string;
        corporate_action_policy_version: string;
        rights_evidence_status: "declared_reference_hash_bound_not_independently_verified";
        execution_dataset_count: number;
        sessions_without_execution_dataset: number;
      }>;
      authority: InternalPaperReplayCorpusAuthority;
      sessions: InternalPaperReplayCorpusSessionResult[];
      summary: Readonly<{
        capital_model: "fixed_session_starting_equity_cumulative_research_curve_v1";
        pnl_semantics: "fill_price_gross_commission_net_with_explicit_modeled_cost_v1";
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
        realized_gross_pnl: number;
        realized_net_pnl: number;
        execution_cost: number;
        average_net_pnl_per_position: number | null;
        expectancy_r: number | null;
        maximum_drawdown: number;
        initial_equity: number;
        ending_equity: number;
      }>;
      result_digest: string;
    }>;

type InternalPaperReplayCorpusPolicyLineage = Readonly<{
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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const TRADING_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CORPUS_SESSIONS = 250;
const DECIMAL_SCALE = BigInt(1_000_000);
const MAX_SAFE_SCALED_NUMBER = BigInt(Number.MAX_SAFE_INTEGER);
const AUTHORITY = {
  can_request_provider_data: false,
  can_change_ranking_or_publication: false,
  can_promote_strategy: false,
  can_execute_broker_action: false,
} as const;

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

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function tradingDate(value: unknown): value is string {
  const parsed =
    typeof value === "string" && TRADING_DATE_PATTERN.test(value)
      ? Date.parse(`${value}T00:00:00.000Z`)
      : Number.NaN;
  return (
    typeof value === "string" &&
    TRADING_DATE_PATTERN.test(value) &&
    Number.isFinite(parsed) &&
    new Date(parsed).toISOString().slice(0, 10) === value
  );
}

function normalizedTicker(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function uniqueSorted<T extends string>(values: T[]) {
  return Array.from(new Set(values)).sort();
}

function toScaled(value: number) {
  const negative = value < 0;
  const [whole, fraction = ""] = Math.abs(value).toFixed(6).split(".");
  const scaled = BigInt(whole) * DECIMAL_SCALE + BigInt(fraction.padEnd(6, "0"));
  return negative ? -scaled : scaled;
}

function fromScaled(value: bigint) {
  if (value > MAX_SAFE_SCALED_NUMBER || value < -MAX_SAFE_SCALED_NUMBER) {
    throw new RangeError("replay corpus result exceeds the safe decimal range");
  }
  return Number(value) / Number(DECIMAL_SCALE);
}

function scaledResultIsSafe(value: bigint) {
  return value <= MAX_SAFE_SCALED_NUMBER && value >= -MAX_SAFE_SCALED_NUMBER;
}

function safeDecimal(value: unknown, positive = false): value is number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    (positive ? value <= 0 : value < 0) ||
    Math.abs(value) > Number.MAX_SAFE_INTEGER / Number(DECIMAL_SCALE)
  ) {
    return false;
  }
  const normalized = Number(value.toFixed(6));
  const tolerance = Math.max(1, Math.abs(value)) * Number.EPSILON * 4;
  return Math.abs(value - normalized) <= tolerance;
}

function accountPolicyIsValid(account: InternalPaperReplayAccountConfig) {
  return (
    text(account.account_config_version) &&
    safeDecimal(account.initial_cash, true) &&
    safeDecimal(account.per_trade_risk_cap, true) &&
    safeDecimal(account.daily_loss_cap, true) &&
    safeDecimal(account.spread_bps) &&
    account.spread_bps <= 10_000 &&
    safeDecimal(account.slippage_bps) &&
    account.slippage_bps <= 10_000 &&
    account.spread_bps / 2 + account.slippage_bps < 10_000 &&
    safeDecimal(account.commission_per_order) &&
    Number.isSafeInteger(account.target_exit_fraction_bps) &&
    account.target_exit_fraction_bps >= 1 &&
    account.target_exit_fraction_bps <= 10_000
  );
}

function executionPolicyIsValid(policy: InternalPaperReplayExecutionPolicy) {
  return (
    text(policy.policy_version) &&
    (policy.order_type === "market" || policy.order_type === "limit") &&
    policy.time_in_force === "ioc" &&
    ((policy.order_type === "market" && policy.limit_price === null) ||
      (policy.order_type === "limit" && safeDecimal(policy.limit_price, true))) &&
    Number.isSafeInteger(policy.latency_ms) &&
    policy.latency_ms >= 0 &&
    policy.latency_ms <= 30 * 60_000 &&
    Number.isSafeInteger(policy.max_volume_participation_bps) &&
    policy.max_volume_participation_bps >= 1 &&
    policy.max_volume_participation_bps <= 10_000 &&
    Number.isSafeInteger(policy.minimum_fill_quantity) &&
    policy.minimum_fill_quantity >= 1 &&
    Number.isSafeInteger(policy.maximum_order_quantity) &&
    policy.maximum_order_quantity >= policy.minimum_fill_quantity
  );
}

function divideScaled(numerator: bigint, denominator: bigint) {
  if (denominator === BigInt(0)) return null;
  const negative = (numerator < BigInt(0)) !== (denominator < BigInt(0));
  const absoluteNumerator = numerator < BigInt(0) ? -numerator : numerator;
  const absoluteDenominator = denominator < BigInt(0) ? -denominator : denominator;
  const rounded =
    (absoluteNumerator * DECIMAL_SCALE + absoluteDenominator / BigInt(2)) /
    absoluteDenominator;
  return fromScaled(negative ? -rounded : rounded);
}

function averageScaled(total: bigint, count: number) {
  if (!Number.isSafeInteger(count) || count < 1) return null;
  const divisor = BigInt(count);
  const negative = total < BigInt(0);
  const absolute = negative ? -total : total;
  const rounded = (absolute + divisor / BigInt(2)) / divisor;
  return fromScaled(negative ? -rounded : rounded);
}

function manifestWithoutDigest(manifest: InternalPaperReplayCorpusManifest) {
  const { manifest_digest: manifestDigest, ...value } = manifest;
  void manifestDigest;
  return value;
}

function observedUniverseVersion(session: InternalPaperReplaySessionInput) {
  const versions = uniqueSorted(
    session.decisions
      .map(
        ({ decision }) =>
          decision.strategy_reference?.symbol_selection.observed_universe_version ??
          "",
      )
      .filter(Boolean),
  );
  return versions.length === 1 ? versions[0] : null;
}

function normalizedSymbols(values: string[]) {
  return values.map(normalizedTicker);
}

function arraysEqual(left: unknown[], right: unknown[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function policyLineage(
  decision: CandidateDecisionRecord,
): InternalPaperReplayCorpusPolicyLineage | null {
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

function executionInputs(session: InternalPaperReplaySessionInput) {
  return session.decisions.flatMap((item) =>
    item.execution === null ? [] : [item.execution],
  );
}

function bindingFromSession(
  session: InternalPaperReplaySessionInput,
  universeAsOf: string,
): InternalPaperReplayCorpusSessionBinding | null {
  const universeVersion = observedUniverseVersion(session);
  const symbols = normalizedSymbols(session.eligible_symbols);
  if (
    !universeVersion ||
    !tradingDate(session.trading_date) ||
    !explicitInstant(session.session_open) ||
    !explicitInstant(session.session_close) ||
    Date.parse(session.session_open) >= Date.parse(session.session_close) ||
    !explicitInstant(universeAsOf) ||
    Date.parse(universeAsOf) > Date.parse(session.session_open) ||
    symbols.some((symbol) => !symbol) ||
    new Set(symbols).size !== symbols.length ||
    !arraysEqual(symbols, [...symbols].sort())
  ) {
    return null;
  }
  return {
    session_id: session.session_id,
    trading_date: session.trading_date,
    session_open: session.session_open,
    session_close: session.session_close,
    universe_as_of: universeAsOf,
    observed_universe_version: universeVersion,
    eligible_symbols: symbols,
    session_input_digest: digest(session),
  };
}

/**
 * Freezes the exact replay inputs before their results are inspected. The
 * manifest is serializable and every later run independently verifies its
 * digest, chronological coverage and complete session-input hashes.
 */
export function buildInternalPaperReplayCorpusManifest(
  input: InternalPaperReplayCorpusManifestInput,
): InternalPaperReplayCorpusManifest | null {
  if (
    !UUID_PATTERN.test(input.manifest_id) ||
    !UUID_PATTERN.test(input.corpus_id) ||
    !text(input.dataset_collection_id) ||
    !text(input.dataset_collection_version) ||
    !text(input.decision_provider_source) ||
    !text(input.source_reference) ||
    !text(input.entitlement_reference) ||
    !text(input.retention_rights_reference) ||
    input.permitted_use !== "internal_research_replay" ||
    !explicitInstant(input.frozen_at) ||
    !text(input.session_calendar_reference) ||
    !text(input.corporate_action_policy_version) ||
    input.sessions.length < 2 ||
    input.sessions.length > MAX_CORPUS_SESSIONS
  ) {
    return null;
  }

  const sessionBindings = input.sessions.map(({ session, universe_as_of }) =>
    bindingFromSession(session, universe_as_of),
  );
  if (sessionBindings.some((binding) => binding === null)) return null;
  const bindings = sessionBindings as InternalPaperReplayCorpusSessionBinding[];
  const dates = bindings.map((binding) => binding.trading_date);
  if (
    dates.some((date) => !tradingDate(date)) ||
    !arraysEqual(dates, [...dates].sort()) ||
    new Set(dates).size !== dates.length ||
    new Set(bindings.map((binding) => binding.session_id)).size !== bindings.length ||
    Date.parse(input.frozen_at) <
      Math.max(...bindings.map((binding) => Date.parse(binding.session_close)))
  ) {
    return null;
  }

  const unsigned = {
    manifest_version: INTERNAL_PAPER_REPLAY_CORPUS_MANIFEST_VERSION,
    manifest_id: input.manifest_id,
    corpus_id: input.corpus_id,
    dataset_collection_id: input.dataset_collection_id,
    dataset_collection_version: input.dataset_collection_version,
    decision_provider_source: input.decision_provider_source,
    source_reference: input.source_reference,
    entitlement_reference: input.entitlement_reference,
    retention_rights_reference: input.retention_rights_reference,
    permitted_use: input.permitted_use,
    frozen_at: input.frozen_at,
    coverage_start_date: dates[0],
    coverage_end_date: dates.at(-1) as string,
    session_calendar_reference: input.session_calendar_reference,
    corporate_action_policy_version: input.corporate_action_policy_version,
    session_bindings: bindings,
  } as const;
  return { ...unsigned, manifest_digest: digest(unsigned) };
}

function validateManifest(input: InternalPaperReplayCorpusInput) {
  const reasons: InternalPaperReplayCorpusBlockReason[] = [];
  const manifest = input.manifest;
  const dates = manifest.session_bindings.map((binding) => binding.trading_date);
  if (
    manifest.manifest_version !== INTERNAL_PAPER_REPLAY_CORPUS_MANIFEST_VERSION ||
    !UUID_PATTERN.test(manifest.manifest_id) ||
    manifest.corpus_id !== input.corpus_id ||
    !text(manifest.dataset_collection_id) ||
    !text(manifest.dataset_collection_version) ||
    !text(manifest.decision_provider_source) ||
    !text(manifest.source_reference) ||
    !text(manifest.entitlement_reference) ||
    !text(manifest.retention_rights_reference) ||
    manifest.permitted_use !== "internal_research_replay" ||
    !explicitInstant(manifest.frozen_at) ||
    !text(manifest.session_calendar_reference) ||
    !text(manifest.corporate_action_policy_version)
  ) {
    reasons.push("manifest_identity_invalid");
  }
  if (
    !SHA256_PATTERN.test(manifest.manifest_digest) ||
    digest(manifestWithoutDigest(manifest)) !== manifest.manifest_digest
  ) {
    reasons.push("manifest_digest_mismatch");
  }
  if (
    manifest.session_bindings.length < 2 ||
    manifest.session_bindings.length > MAX_CORPUS_SESSIONS ||
    manifest.session_bindings.length !== input.sessions.length ||
    dates.some((date) => !tradingDate(date)) ||
    !arraysEqual(dates, [...dates].sort()) ||
    new Set(dates).size !== dates.length ||
    manifest.coverage_start_date !== dates[0] ||
    manifest.coverage_end_date !== dates.at(-1)
  ) {
    reasons.push("manifest_coverage_invalid");
  }
  return reasons;
}

function validateSessions(input: InternalPaperReplayCorpusInput) {
  const reasons: InternalPaperReplayCorpusBlockReason[] = [];
  const sessionIds = new Set<string>();
  const scanRunIds = new Set<string>();
  const scanFingerprints = new Set<string>();
  const orderIds = new Set<string>();
  const replayIds = new Set<string>();
  const candleIds = new Set<string>();
  let previousDate = "";

  input.sessions.forEach((session, index) => {
    const binding = input.manifest.session_bindings[index];
    const symbols = normalizedSymbols(session.eligible_symbols);
    if (
      session.session_version !== INTERNAL_PAPER_REPLAY_SESSION_VERSION ||
      session.owner_user_id !== input.owner_user_id ||
      session.account_id !== input.account_id ||
      session.deterministic_seed !== input.deterministic_seed ||
      sessionIds.has(session.session_id)
    ) {
      reasons.push("session_manifest_mismatch");
    }
    if (session.trading_date <= previousDate) {
      reasons.push("session_order_invalid");
    }
    previousDate = session.trading_date;
    sessionIds.add(session.session_id);

    if (
      !binding ||
      binding.session_id !== session.session_id ||
      binding.trading_date !== session.trading_date ||
      binding.session_open !== session.session_open ||
      binding.session_close !== session.session_close ||
      binding.observed_universe_version !== observedUniverseVersion(session) ||
      !arraysEqual(binding.eligible_symbols, symbols)
    ) {
      reasons.push("session_manifest_mismatch");
    }
    if (
      !binding ||
      !explicitInstant(binding.universe_as_of) ||
      Date.parse(binding.universe_as_of) > Date.parse(session.session_open)
    ) {
      reasons.push("point_in_time_universe_invalid");
    }
    if (
      !binding ||
      !SHA256_PATTERN.test(binding.session_input_digest) ||
      binding.session_input_digest !== digest(session)
    ) {
      reasons.push("session_input_digest_mismatch");
    }

    for (const item of session.decisions) {
      if (
        scanRunIds.has(item.decision.scan_run_id) ||
        scanFingerprints.has(item.decision.scan_run_fingerprint)
      ) {
        reasons.push("cross_session_identity_collision");
      }
      scanRunIds.add(item.decision.scan_run_id);
      scanFingerprints.add(item.decision.scan_run_fingerprint);
      if (
        item.decision.candidates.some(
          (candidate) =>
            candidate.data.provider_source !==
            input.manifest.decision_provider_source,
        )
      ) {
        reasons.push("source_lineage_mismatch");
      }
    }

    for (const execution of executionInputs(session)) {
      if (
        orderIds.has(execution.order_id) ||
        replayIds.has(execution.base_replay.replay_id)
      ) {
        reasons.push("cross_session_identity_collision");
      }
      orderIds.add(execution.order_id);
      replayIds.add(execution.base_replay.replay_id);
      if (digest(execution.base_replay.account) !== digest(input.account)) {
        reasons.push("account_policy_mismatch");
      }
      if (digest(execution.policy) !== digest(input.execution_policy)) {
        reasons.push("execution_policy_mismatch");
      }
      const dataset = execution.base_replay.dataset;
      if (
        dataset.source_reference !== input.manifest.source_reference ||
        dataset.entitlement_reference !== input.manifest.entitlement_reference ||
        dataset.retention_rights_reference !==
          input.manifest.retention_rights_reference ||
        dataset.session_calendar_reference !==
          input.manifest.session_calendar_reference ||
        Date.parse(dataset.point_in_time_as_of) >
          Date.parse(input.manifest.frozen_at)
      ) {
        reasons.push("source_lineage_mismatch");
      }
      for (const candle of execution.base_replay.candles) {
        if (candleIds.has(candle.candle_id)) {
          reasons.push("cross_session_identity_collision");
        }
        candleIds.add(candle.candle_id);
      }
    }
  });
  return reasons;
}

function corpusIdentityReasons(input: InternalPaperReplayCorpusInput) {
  const reasons: InternalPaperReplayCorpusBlockReason[] = [];
  if (
    input.corpus_version !== INTERNAL_PAPER_REPLAY_CORPUS_VERSION ||
    !UUID_PATTERN.test(input.corpus_id) ||
    input.manifest.corpus_id !== input.corpus_id ||
    !text(input.deterministic_seed) ||
    !UUID_PATTERN.test(input.owner_user_id) ||
    !UUID_PATTERN.test(input.account_id)
  ) {
    reasons.push("corpus_identity_invalid");
  }
  if (!accountPolicyIsValid(input.account)) {
    reasons.push("account_policy_invalid");
  }
  if (!executionPolicyIsValid(input.execution_policy)) {
    reasons.push("execution_policy_invalid");
  }
  return reasons;
}

function completedPositionMetrics(
  session: InternalPaperReplaySessionResult & { status: "completed" },
) {
  const accepted = session.events.find(
    (event) =>
      event.disposition === "accepted" &&
      event.execution?.status === "completed" &&
      event.execution.replay.status === "completed",
  );
  if (
    !accepted ||
    accepted.execution?.status !== "completed" ||
    accepted.execution.replay.status !== "completed"
  ) {
    return null;
  }
  const replay = accepted.execution.replay;
  const entryEvent = replay.events.find((event) => event.event_type === "entry_fill");
  if (!entryEvent) return null;
  const executionCost = replay.events.reduce(
    (total, event) =>
      total +
      toScaled(event.spread_cost) +
      toScaled(event.slippage_cost) +
      toScaled(event.commission),
    BigInt(0),
  );
  return {
    realized_gross_pnl: replay.final_state.realized_gross_pnl,
    realized_net_pnl: replay.final_state.realized_net_pnl,
    execution_cost: fromScaled(executionCost),
    entry_fill_price: entryEvent.fill_price,
    filled_quantity: accepted.execution.filled_quantity,
    scan_run_id: accepted.scan_run_id,
  };
}

function riskForAcceptedPosition(
  source: InternalPaperReplaySessionInput,
  scanRunId: string,
  entryFillPrice: number,
  filledQuantity: number,
) {
  const execution = source.decisions.find(
    (item) => item.decision.scan_run_id === scanRunId,
  )?.execution;
  if (!execution) return null;
  const priceRisk =
    (toScaled(entryFillPrice) - toScaled(execution.base_replay.entry.stop_price)) *
    BigInt(filledQuantity);
  const risk = priceRisk + toScaled(execution.base_replay.account.commission_per_order);
  return risk > BigInt(0) ? risk : null;
}

/**
 * Replays an exact frozen multi-session corpus. It has no provider, storage,
 * publication or broker effects and makes no claim that repository fixtures
 * are licensed historical evidence or that a completed corpus has positive
 * alpha.
 */
export function runInternalPaperReplayCorpus(
  input: InternalPaperReplayCorpusInput,
): InternalPaperReplayCorpusResult {
  const inputDigest = digest(input);
  const structuralReasons = uniqueSorted([
    ...corpusIdentityReasons(input),
    ...validateManifest(input),
    ...validateSessions(input),
  ]);
  if (structuralReasons.length > 0) {
    return terminal({
      result_version: INTERNAL_PAPER_REPLAY_CORPUS_RESULT_VERSION,
      corpus_version: INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
      status: "blocked" as const,
      reason_codes: structuralReasons,
      input_digest: inputDigest,
      manifest_digest: SHA256_PATTERN.test(input.manifest.manifest_digest)
        ? input.manifest.manifest_digest
        : null,
      blocked_trading_date: null,
      blocked_session: null,
      authority: AUTHORITY,
    });
  }

  let frozenPolicy: InternalPaperReplayCorpusPolicyLineage | null = null;
  const sessionResults: InternalPaperReplayCorpusSessionResult[] = [];
  let totalR = BigInt(0);
  let rCount = 0;
  let cumulativeNet = BigInt(0);
  let equityPeak = BigInt(0);
  let maximumDrawdown = BigInt(0);
  let executionDatasetCount = 0;

  for (let index = 0; index < input.sessions.length; index += 1) {
    const source = input.sessions[index];
    const result = runInternalPaperReplaySession(source);
    if (result.status === "blocked") {
      return terminal({
        result_version: INTERNAL_PAPER_REPLAY_CORPUS_RESULT_VERSION,
        corpus_version: INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
        status: "blocked" as const,
        reason_codes: ["session_blocked"] as InternalPaperReplayCorpusBlockReason[],
        input_digest: inputDigest,
        manifest_digest: input.manifest.manifest_digest,
        blocked_trading_date: source.trading_date,
        blocked_session: result,
        authority: AUTHORITY,
      });
    }

    for (const item of source.decisions) {
      const currentPolicy = policyLineage(item.decision);
      if (!currentPolicy) {
        return terminal({
          result_version: INTERNAL_PAPER_REPLAY_CORPUS_RESULT_VERSION,
          corpus_version: INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
          status: "blocked" as const,
          reason_codes: ["strategy_policy_mismatch"] as InternalPaperReplayCorpusBlockReason[],
          input_digest: inputDigest,
          manifest_digest: input.manifest.manifest_digest,
          blocked_trading_date: source.trading_date,
          blocked_session: null,
          authority: AUTHORITY,
        });
      }
      if (frozenPolicy === null) frozenPolicy = currentPolicy;
      if (digest(currentPolicy) !== digest(frozenPolicy)) {
        return terminal({
          result_version: INTERNAL_PAPER_REPLAY_CORPUS_RESULT_VERSION,
          corpus_version: INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
          status: "blocked" as const,
          reason_codes: ["strategy_policy_mismatch"] as InternalPaperReplayCorpusBlockReason[],
          input_digest: inputDigest,
          manifest_digest: input.manifest.manifest_digest,
          blocked_trading_date: source.trading_date,
          blocked_session: null,
          authority: AUTHORITY,
        });
      }
    }

    executionDatasetCount += executionInputs(source).length;
    const position = completedPositionMetrics(result);
    let rMultiple: number | null = null;
    if (position) {
      const risk = riskForAcceptedPosition(
        source,
        position.scan_run_id,
        position.entry_fill_price,
        position.filled_quantity,
      );
      if (risk !== null) {
        rMultiple = divideScaled(toScaled(position.realized_net_pnl), risk);
        if (rMultiple !== null) {
          totalR += toScaled(rMultiple);
          rCount += 1;
        }
      }
    }
    const sessionNet = toScaled(position?.realized_net_pnl ?? 0);
    cumulativeNet += sessionNet;
    if (cumulativeNet > equityPeak) equityPeak = cumulativeNet;
    const drawdown = equityPeak - cumulativeNet;
    if (drawdown > maximumDrawdown) maximumDrawdown = drawdown;

    sessionResults.push({
      sequence: index + 1,
      trading_date: source.trading_date,
      session_id: source.session_id,
      session_input_digest:
        input.manifest.session_bindings[index].session_input_digest,
      session_result_digest: result.result_digest,
      decision_count: result.summary.decision_count,
      accepted_count: result.summary.accepted_count,
      rejected_count: result.summary.rejected_count,
      no_trade_count: result.summary.no_trade_count,
      executed_position_count: result.summary.executed_position_count,
      realized_gross_pnl: position?.realized_gross_pnl ?? 0,
      realized_net_pnl: position?.realized_net_pnl ?? 0,
      execution_cost: position?.execution_cost ?? 0,
      r_multiple: rMultiple,
    });
  }

  if (frozenPolicy === null) {
    return terminal({
      result_version: INTERNAL_PAPER_REPLAY_CORPUS_RESULT_VERSION,
      corpus_version: INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
      status: "blocked" as const,
      reason_codes: ["strategy_policy_mismatch"] as InternalPaperReplayCorpusBlockReason[],
      input_digest: inputDigest,
      manifest_digest: input.manifest.manifest_digest,
      blocked_trading_date: null,
      blocked_session: null,
      authority: AUTHORITY,
    });
  }

  const sum = (field: "realized_gross_pnl" | "realized_net_pnl" | "execution_cost") =>
    sessionResults.reduce((total, session) => total + toScaled(session[field]), BigInt(0));
  const gross = sum("realized_gross_pnl");
  const net = sum("realized_net_pnl");
  const costs = sum("execution_cost");
  const positionCount = sessionResults.filter(
    (session) => session.executed_position_count === 1,
  ).length;
  const initialEquity = toScaled(input.account.initial_cash);
  const endingEquity = initialEquity + net;
  if (
    ![
      gross,
      net,
      costs,
      totalR,
      maximumDrawdown,
      initialEquity,
      endingEquity,
    ].every(scaledResultIsSafe)
  ) {
    return terminal({
      result_version: INTERNAL_PAPER_REPLAY_CORPUS_RESULT_VERSION,
      corpus_version: INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
      status: "blocked" as const,
      reason_codes: [
        "economic_result_out_of_range",
      ] as InternalPaperReplayCorpusBlockReason[],
      input_digest: inputDigest,
      manifest_digest: input.manifest.manifest_digest,
      blocked_trading_date: null,
      blocked_session: null,
      authority: AUTHORITY,
    });
  }

  return terminal({
    result_version: INTERNAL_PAPER_REPLAY_CORPUS_RESULT_VERSION,
    corpus_version: INTERNAL_PAPER_REPLAY_CORPUS_VERSION,
    status: "completed" as const,
    reason_codes: [] as [],
    input_digest: inputDigest,
    manifest_digest: input.manifest.manifest_digest,
    policy_lineage: frozenPolicy,
    source_lineage: {
      dataset_collection_id: input.manifest.dataset_collection_id,
      dataset_collection_version: input.manifest.dataset_collection_version,
      decision_provider_source: input.manifest.decision_provider_source,
      source_reference: input.manifest.source_reference,
      entitlement_reference: input.manifest.entitlement_reference,
      retention_rights_reference: input.manifest.retention_rights_reference,
      permitted_use: input.manifest.permitted_use,
      session_calendar_reference: input.manifest.session_calendar_reference,
      corporate_action_policy_version:
        input.manifest.corporate_action_policy_version,
      rights_evidence_status:
        "declared_reference_hash_bound_not_independently_verified" as const,
      execution_dataset_count: executionDatasetCount,
      sessions_without_execution_dataset: input.sessions.filter(
        (session) => executionInputs(session).length === 0,
      ).length,
    },
    authority: AUTHORITY,
    sessions: sessionResults,
    summary: {
      capital_model:
        "fixed_session_starting_equity_cumulative_research_curve_v1" as const,
      pnl_semantics:
        "fill_price_gross_commission_net_with_explicit_modeled_cost_v1" as const,
      session_count: sessionResults.length,
      sessions_with_position: positionCount,
      sessions_without_position: sessionResults.length - positionCount,
      decision_count: sessionResults.reduce(
        (total, session) => total + session.decision_count,
        0,
      ),
      accepted_count: sessionResults.reduce(
        (total, session) => total + session.accepted_count,
        0,
      ),
      rejected_count: sessionResults.reduce(
        (total, session) => total + session.rejected_count,
        0,
      ),
      no_trade_count: sessionResults.reduce(
        (total, session) => total + session.no_trade_count,
        0,
      ),
      winning_position_count: sessionResults.filter(
        (session) => session.executed_position_count === 1 && session.realized_net_pnl > 0,
      ).length,
      losing_position_count: sessionResults.filter(
        (session) => session.executed_position_count === 1 && session.realized_net_pnl < 0,
      ).length,
      flat_position_count: sessionResults.filter(
        (session) => session.executed_position_count === 1 && session.realized_net_pnl === 0,
      ).length,
      realized_gross_pnl: fromScaled(gross),
      realized_net_pnl: fromScaled(net),
      execution_cost: fromScaled(costs),
      average_net_pnl_per_position:
        positionCount === 0 ? null : averageScaled(net, positionCount),
      expectancy_r: rCount === 0 ? null : averageScaled(totalR, rCount),
      maximum_drawdown: fromScaled(maximumDrawdown),
      initial_equity: input.account.initial_cash,
      ending_equity: fromScaled(endingEquity),
    },
  });
}
