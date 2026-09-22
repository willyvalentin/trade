import { createHash } from "node:crypto";

import {
  candidateDecisionLearningAttributionFromUnknown,
} from "@/lib/candidate-decision-learning-attribution";
import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import {
  buildDecisionLineageReceipt,
  type DecisionLineageReceipt,
} from "@/lib/decision-lineage-receipt";
import { decisionStrategyReferenceFromUnknown } from "@/lib/decision-strategy-registry";
import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import {
  INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
  runInternalPaperReplayExecution,
  type InternalPaperReplayExecutionInput,
  type InternalPaperReplayExecutionResult,
} from "@/lib/internal-paper-replay-execution";

export const INTERNAL_PAPER_REPLAY_SESSION_VERSION =
  "internal_paper_replay_session_v1" as const;
export const INTERNAL_PAPER_REPLAY_SESSION_RESULT_VERSION =
  "internal_paper_replay_session_result_v1" as const;

export type InternalPaperReplaySessionInputRejectionReason =
  | "data_quality_rejected"
  | "entry_admission_rejected"
  | "portfolio_policy_rejected"
  | "risk_policy_rejected";

export type InternalPaperReplaySessionBlockReason =
  | "decision_disposition_invalid"
  | "decision_event_out_of_order"
  | "decision_execution_binding_invalid"
  | "decision_identity_invalid"
  | "decision_lineage_incomplete"
  | "decision_rejection_reason_missing"
  | "execution_blocked"
  | "pilot_symbol_scope_invalid"
  | "session_identity_invalid";

export type InternalPaperReplaySessionDecisionInput = Readonly<{
  decision: CandidateDecisionRecord;
  execution: InternalPaperReplayExecutionInput | null;
  rejection_reason_codes: InternalPaperReplaySessionInputRejectionReason[];
}>;

export type InternalPaperReplaySessionInput = Readonly<{
  session_version: typeof INTERNAL_PAPER_REPLAY_SESSION_VERSION;
  session_id: string;
  deterministic_seed: string;
  owner_user_id: string;
  account_id: string;
  trading_date: string;
  session_open: string;
  session_close: string;
  eligible_symbols: string[];
  decisions: InternalPaperReplaySessionDecisionInput[];
}>;

export type InternalPaperReplaySessionEvent = Readonly<{
  sequence: number;
  occurred_at: string;
  scan_run_id: string;
  scan_run_fingerprint: string;
  disposition: "accepted" | "rejected" | "no_trade";
  reason_codes: string[];
  lineage: DecisionLineageReceipt;
  candidates: Array<
    Readonly<{
      candidate_id: string;
      ticker: string;
      disposition: CandidateDecisionRecord["candidates"][number]["disposition"];
      eligibility: CandidateDecisionRecord["candidates"][number]["eligibility"];
      reason_codes: string[];
    }>
  >;
  execution: InternalPaperReplayExecutionResult | null;
}>;

export type InternalPaperReplaySessionResult =
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_REPLAY_SESSION_RESULT_VERSION;
      session_version: typeof INTERNAL_PAPER_REPLAY_SESSION_VERSION;
      status: "blocked";
      reason_codes: InternalPaperReplaySessionBlockReason[];
      input_digest: string;
      blocked_scan_run_id: string | null;
      blocked_execution: InternalPaperReplayExecutionResult | null;
      result_digest: string;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_REPLAY_SESSION_RESULT_VERSION;
      session_version: typeof INTERNAL_PAPER_REPLAY_SESSION_VERSION;
      status: "completed";
      reason_codes: [];
      input_digest: string;
      events: InternalPaperReplaySessionEvent[];
      summary: Readonly<{
        decision_count: number;
        accepted_count: number;
        rejected_count: number;
        no_trade_count: number;
        executed_position_count: 0 | 1;
      }>;
      result_digest: string;
    }>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TRADING_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PILOT_SYMBOLS = 10;

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

function normalizedTicker(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function uniqueSorted<T extends string>(values: T[]) {
  return Array.from(new Set(values)).sort();
}

function newYorkDate(instant: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(instant));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function sessionIdentityIsValid(input: InternalPaperReplaySessionInput) {
  return (
    input.session_version === INTERNAL_PAPER_REPLAY_SESSION_VERSION &&
    UUID_PATTERN.test(input.session_id) &&
    input.deterministic_seed.trim().length > 0 &&
    UUID_PATTERN.test(input.owner_user_id) &&
    UUID_PATTERN.test(input.account_id) &&
    TRADING_DATE_PATTERN.test(input.trading_date) &&
    explicitInstant(input.session_open) &&
    explicitInstant(input.session_close) &&
    Date.parse(input.session_open) < Date.parse(input.session_close) &&
    newYorkDate(input.session_open) === input.trading_date &&
    newYorkDate(input.session_close) === input.trading_date &&
    input.decisions.length > 0
  );
}

function commandMatchesDecision(
  command: InternalPaperEntryCommand,
  decision: CandidateDecisionRecord,
) {
  const ticker = normalizedTicker(command.ticker);
  const candidate = decision.candidates.find(
    (item) => normalizedTicker(item.ticker) === ticker,
  );
  const strategy = decision.strategy_reference;

  return (
    command.owner_user_id.length > 0 &&
    command.scan_run_id === decision.scan_run_id &&
    command.scan_run_fingerprint === decision.scan_run_fingerprint &&
    candidate?.candidate_id === command.candidate_identity &&
    candidate.disposition === "published" &&
    candidate.eligibility === "eligible" &&
    candidate.data.freshness === "fresh" &&
    decision.final_decision.published_tickers
      .map(normalizedTicker)
      .includes(ticker) &&
    strategy !== null &&
    command.strategy_id === strategy.strategy_id &&
    command.strategy_version === strategy.strategy_version &&
    command.strategy_rollback_identity === strategy.rollback_identity &&
    command.symbol_selection_policy_id === strategy.symbol_selection.policy_id &&
    command.symbol_selection_policy_version ===
      strategy.symbol_selection.policy_version &&
    command.observed_universe_version ===
      strategy.symbol_selection.observed_universe_version &&
    explicitInstant(command.submitted_at) &&
    Date.parse(command.submitted_at) >= Date.parse(decision.decision_timestamp)
  );
}

function executionMatchesSession(
  input: InternalPaperReplaySessionInput,
  item: InternalPaperReplaySessionDecisionInput,
) {
  const execution = item.execution;
  if (!execution) return false;
  const replay = execution.base_replay;
  const command = replay.entry;
  const ticker = normalizedTicker(command.ticker);

  return (
    execution.execution_version === INTERNAL_PAPER_REPLAY_EXECUTION_VERSION &&
    command.owner_user_id === input.owner_user_id &&
    command.account_id === input.account_id &&
    commandMatchesDecision(command, item.decision) &&
    replay.deterministic_seed === input.deterministic_seed &&
    replay.dataset.trading_date === input.trading_date &&
    replay.dataset.session_open === input.session_open &&
    replay.dataset.session_close === input.session_close &&
    normalizedTicker(replay.dataset.ticker) === ticker &&
    input.eligible_symbols.map(normalizedTicker).includes(ticker) &&
    Date.parse(command.submitted_at) <= Date.parse(input.session_close)
  );
}

function decisionReasons(
  input: InternalPaperReplaySessionInput,
  eligibleSymbols: Set<string>,
) {
  const reasons: InternalPaperReplaySessionBlockReason[] = [];
  const scanRunIds = new Set<string>();
  const scanFingerprints = new Set<string>();
  const orderIds = new Set<string>();
  const replayIds = new Set<string>();
  let accountConfigDigest: string | null = null;
  let previousDecisionTime = Number.NEGATIVE_INFINITY;

  for (const item of input.decisions) {
    const decision = item.decision;
    const decisionTime = Date.parse(decision.decision_timestamp);
    const candidateTickers = decision.candidates.map((candidate) =>
      normalizedTicker(candidate.ticker),
    );
    const candidateIds = decision.candidates.map(
      (candidate) => candidate.candidate_id,
    );
    const publishedCandidates = decision.candidates
      .filter((candidate) => candidate.disposition === "published")
      .map((candidate) => normalizedTicker(candidate.ticker))
      .sort();
    const finalPublished = decision.final_decision.published_tickers
      .map(normalizedTicker)
      .sort();
    const attribution = candidateDecisionLearningAttributionFromUnknown(
      decision.learning_attribution,
    );
    const strategy = decision.strategy_reference
      ? decisionStrategyReferenceFromUnknown(
          decision.strategy_reference,
          decision.versions.universe_version,
        )
      : null;

    if (
      decision.record_version !== "candidate_decision_record_v3" ||
      decision.record_kind !== "candidate_decision_record" ||
      !decision.scan_run_id.trim() ||
      !decision.scan_run_fingerprint.trim() ||
      !explicitInstant(decision.decision_timestamp) ||
      decisionTime < Date.parse(input.session_open) ||
      decisionTime > Date.parse(input.session_close) ||
      scanRunIds.has(decision.scan_run_id) ||
      scanFingerprints.has(decision.scan_run_fingerprint) ||
      decision.coverage.expected_candidate_count !== decision.candidates.length ||
      decision.coverage.observed_candidate_count !== decision.candidates.length ||
      decision.coverage.full_membership_declared !== true ||
      new Set(candidateTickers).size !== candidateTickers.length ||
      candidateTickers.some((ticker) => !ticker || !eligibleSymbols.has(ticker)) ||
      new Set(candidateIds).size !== candidateIds.length
    ) {
      reasons.push("decision_identity_invalid");
    }
    if (decisionTime <= previousDecisionTime) {
      reasons.push("decision_event_out_of_order");
    }
    previousDecisionTime = decisionTime;
    scanRunIds.add(decision.scan_run_id);
    scanFingerprints.add(decision.scan_run_fingerprint);

    let lineage: DecisionLineageReceipt | null = null;
    if (
      attribution?.attribution_status === "complete" &&
      strategy !== null &&
      decision.coverage.full_membership_captured
    ) {
      try {
        lineage = buildDecisionLineageReceipt(decision);
      } catch {
        lineage = null;
      }
    }
    if (lineage?.status !== "reconstructable") {
      reasons.push("decision_lineage_incomplete");
    }

    const isNoTrade = decision.final_decision.disposition === "no_trade";
    const dispositionIsConsistent = isNoTrade
      ? publishedCandidates.length === 0 &&
        finalPublished.length === 0 &&
        Boolean(decision.final_decision.no_trade_reason?.trim())
      : publishedCandidates.length > 0 &&
        JSON.stringify(publishedCandidates) === JSON.stringify(finalPublished) &&
        decision.final_decision.no_trade_reason === null;
    if (!dispositionIsConsistent) {
      reasons.push("decision_disposition_invalid");
    }

    if (isNoTrade) {
      if (item.execution !== null || item.rejection_reason_codes.length > 0) {
        reasons.push("decision_disposition_invalid");
      }
      continue;
    }

    if (item.execution === null) {
      if (item.rejection_reason_codes.length === 0) {
        reasons.push("decision_rejection_reason_missing");
      }
      continue;
    }

    if (
      item.rejection_reason_codes.length > 0 ||
      !executionMatchesSession(input, item) ||
      orderIds.has(item.execution.order_id) ||
      replayIds.has(item.execution.base_replay.replay_id)
    ) {
      reasons.push("decision_execution_binding_invalid");
    }
    const currentAccountConfigDigest = digest(item.execution.base_replay.account);
    if (
      accountConfigDigest !== null &&
      accountConfigDigest !== currentAccountConfigDigest
    ) {
      reasons.push("decision_execution_binding_invalid");
    }
    accountConfigDigest = currentAccountConfigDigest;
    orderIds.add(item.execution.order_id);
    replayIds.add(item.execution.base_replay.replay_id);
  }

  return uniqueSorted(reasons);
}

function candidateTrace(decision: CandidateDecisionRecord) {
  return decision.candidates.map((candidate) => ({
    candidate_id: candidate.candidate_id,
    ticker: normalizedTicker(candidate.ticker),
    disposition: candidate.disposition,
    eligibility: candidate.eligibility,
    reason_codes: uniqueSorted(candidate.reason_codes),
  }));
}

/**
 * Replays a complete pilot decision session without provider, storage,
 * publication or broker effects. Existing v3 decision records remain the sole
 * recommendation truth; this layer only orders them and admits at most one
 * realistically filled paper position.
 */
export function runInternalPaperReplaySession(
  input: InternalPaperReplaySessionInput,
): InternalPaperReplaySessionResult {
  const inputDigest = digest(input);
  const symbols = input.eligible_symbols.map(normalizedTicker);
  const eligibleSymbols = new Set(symbols);
  const reasons: InternalPaperReplaySessionBlockReason[] = [];

  if (!sessionIdentityIsValid(input)) {
    reasons.push("session_identity_invalid");
  }
  if (
    symbols.length < 1 ||
    symbols.length > MAX_PILOT_SYMBOLS ||
    eligibleSymbols.size !== symbols.length ||
    symbols.some((ticker) => !ticker)
  ) {
    reasons.push("pilot_symbol_scope_invalid");
  }
  if (reasons.length === 0) {
    reasons.push(...decisionReasons(input, eligibleSymbols));
  }
  if (reasons.length > 0) {
    return terminal({
      result_version: INTERNAL_PAPER_REPLAY_SESSION_RESULT_VERSION,
      session_version: INTERNAL_PAPER_REPLAY_SESSION_VERSION,
      status: "blocked" as const,
      reason_codes: uniqueSorted(reasons),
      input_digest: inputDigest,
      blocked_scan_run_id: null,
      blocked_execution: null,
    });
  }

  const events: InternalPaperReplaySessionEvent[] = [];
  let executedPositionCount: 0 | 1 = 0;

  for (const item of input.decisions) {
    const decision = item.decision;
    const lineage = buildDecisionLineageReceipt(decision);
    const baseEvent = {
      sequence: events.length + 1,
      occurred_at: decision.decision_timestamp,
      scan_run_id: decision.scan_run_id,
      scan_run_fingerprint: decision.scan_run_fingerprint,
      lineage,
      candidates: candidateTrace(decision),
    };

    if (decision.final_decision.disposition === "no_trade") {
      events.push({
        ...baseEvent,
        disposition: "no_trade",
        reason_codes: [decision.final_decision.no_trade_reason as string],
        execution: null,
      });
      continue;
    }

    if (item.execution === null) {
      events.push({
        ...baseEvent,
        disposition: "rejected",
        reason_codes: uniqueSorted(item.rejection_reason_codes),
        execution: null,
      });
      continue;
    }

    if (executedPositionCount === 1) {
      events.push({
        ...baseEvent,
        disposition: "rejected",
        reason_codes: ["position_capacity_exceeded"],
        execution: null,
      });
      continue;
    }

    const execution = runInternalPaperReplayExecution(item.execution);
    if (execution.status === "blocked") {
      return terminal({
        result_version: INTERNAL_PAPER_REPLAY_SESSION_RESULT_VERSION,
        session_version: INTERNAL_PAPER_REPLAY_SESSION_VERSION,
        status: "blocked" as const,
        reason_codes: ["execution_blocked"],
        input_digest: inputDigest,
        blocked_scan_run_id: decision.scan_run_id,
        blocked_execution: execution,
      });
    }
    if (execution.status === "completed") {
      executedPositionCount = 1;
      events.push({
        ...baseEvent,
        disposition: "accepted",
        reason_codes: [],
        execution,
      });
      continue;
    }

    events.push({
      ...baseEvent,
      disposition: "rejected",
      reason_codes: [`execution_${execution.status}:${execution.reason}`],
      execution,
    });
  }

  return terminal({
    result_version: INTERNAL_PAPER_REPLAY_SESSION_RESULT_VERSION,
    session_version: INTERNAL_PAPER_REPLAY_SESSION_VERSION,
    status: "completed" as const,
    reason_codes: [] as [],
    input_digest: inputDigest,
    events,
    summary: {
      decision_count: events.length,
      accepted_count: events.filter((event) => event.disposition === "accepted")
        .length,
      rejected_count: events.filter((event) => event.disposition === "rejected")
        .length,
      no_trade_count: events.filter((event) => event.disposition === "no_trade")
        .length,
      executed_position_count: executedPositionCount,
    },
  });
}
