import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { decisionStrategyReferenceFromUnknown } from "@/lib/decision-strategy-registry";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export const INTERNAL_PAPER_ENTRY_COMMAND_VERSION =
  "internal_paper_entry_command_v1" as const;
export const INTERNAL_PAPER_FILL_MODEL_VERSION =
  "internal_paper_immediate_costed_fill_v1" as const;

export type InternalPaperEntryReasonCode =
  | "account_identity_invalid"
  | "decision_identity_mismatch"
  | "decision_lineage_incomplete"
  | "decision_not_publishable"
  | "decision_candidate_missing"
  | "decision_candidate_not_tradeable"
  | "decision_candidate_data_not_fresh"
  | "snapshot_identity_mismatch"
  | "snapshot_not_real_live_evidence"
  | "snapshot_trade_plan_invalid"
  | "pilot_symbol_scope_invalid"
  | "quantity_invalid"
  | "submission_time_invalid";

export type InternalPaperEntryCommand = Readonly<{
  command_version: typeof INTERNAL_PAPER_ENTRY_COMMAND_VERSION;
  fill_model_version: typeof INTERNAL_PAPER_FILL_MODEL_VERSION;
  owner_user_id: string;
  account_id: string;
  scan_run_id: string;
  scan_run_fingerprint: string;
  snapshot_id: string;
  snapshot_fingerprint: string;
  candidate_identity: string;
  strategy_id: string;
  strategy_version: string;
  strategy_rollback_identity: string;
  symbol_selection_policy_id: string;
  symbol_selection_policy_version: string;
  observed_universe_version: string;
  ticker: string;
  quantity: number;
  arrival_price: number;
  stop_price: number;
  target_price: number;
  submitted_at: string;
}>;

export type InternalPaperEntryBuildResult =
  | Readonly<{
      status: "ready";
      reason_codes: [];
      command: InternalPaperEntryCommand;
    }>
  | Readonly<{
      status: "blocked" | "no_trade";
      reason_codes: InternalPaperEntryReasonCode[];
      command: null;
    }>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizedTicker(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function positiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function blocked(
  ...reasonCodes: InternalPaperEntryReasonCode[]
): InternalPaperEntryBuildResult {
  return {
    status: "blocked",
    reason_codes: Array.from(new Set(reasonCodes)).sort(),
    command: null,
  };
}

/**
 * Converts one already-published, fully attributable recommendation into the
 * brokerless entry command consumed by the internal-paper database boundary.
 * It does not rank, publish, fetch data or grant execution authority.
 */
export function buildInternalPaperEntryCommand(input: {
  owner_user_id: string;
  account_id: string;
  scan_run_id: string;
  decision: CandidateDecisionRecord;
  snapshot: RecommendationSnapshot;
  eligible_symbols: string[];
  quantity: number;
}): InternalPaperEntryBuildResult {
  const reasons: InternalPaperEntryReasonCode[] = [];
  const ticker = normalizedTicker(input.snapshot.ticker);
  const eligibleSymbols = Array.from(
    new Set(input.eligible_symbols.map(normalizedTicker).filter(Boolean)),
  );

  if (!UUID_PATTERN.test(input.owner_user_id) || !UUID_PATTERN.test(input.account_id)) {
    reasons.push("account_identity_invalid");
  }

  if (
    input.decision.record_version !== "candidate_decision_record_v3" ||
    input.decision.scan_run_id !== input.scan_run_id ||
    !explicitInstant(input.decision.decision_timestamp)
  ) {
    reasons.push("decision_identity_mismatch");
  }

  const strategyReference = input.decision.strategy_reference
    ? decisionStrategyReferenceFromUnknown(
        input.decision.strategy_reference,
        input.decision.versions.universe_version,
      )
    : null;

  if (
    !input.decision.coverage.full_membership_captured ||
    strategyReference === null
  ) {
    reasons.push("decision_lineage_incomplete");
  }

  if (input.decision.final_decision.disposition === "no_trade") {
    return {
      status: "no_trade",
      reason_codes: ["decision_not_publishable"],
      command: null,
    };
  }

  if (!input.decision.final_decision.published_tickers.includes(ticker)) {
    reasons.push("decision_not_publishable");
  }

  const candidate = input.decision.candidates.find(
    (item) => normalizedTicker(item.ticker) === ticker,
  );
  if (!candidate) {
    reasons.push("decision_candidate_missing");
  } else {
    if (
      candidate.disposition !== "published" ||
      candidate.eligibility !== "eligible" ||
      candidate.ranking?.selected !== true ||
      candidate.build?.built !== true
    ) {
      reasons.push("decision_candidate_not_tradeable");
    }

    const sourceTimestamp = candidate.data.source_timestamp;
    if (
      candidate.data.freshness !== "fresh" ||
      typeof candidate.data.provider_source !== "string" ||
      candidate.data.provider_source.trim().length === 0 ||
      sourceTimestamp === null ||
      !explicitInstant(sourceTimestamp) ||
      Date.parse(sourceTimestamp) > Date.parse(input.decision.decision_timestamp)
    ) {
      reasons.push("decision_candidate_data_not_fresh");
    }
  }

  if (
    input.snapshot.scan_run_id !== input.decision.scan_run_fingerprint ||
    !input.snapshot.id ||
    !input.snapshot.snapshot_fingerprint ||
    !ticker
  ) {
    reasons.push("snapshot_identity_mismatch");
  }

  if (
    input.snapshot.source_mode !== "supabase" ||
    input.snapshot.data_mode !== "live" ||
    input.snapshot.is_real !== true ||
    input.snapshot.is_demo ||
    input.snapshot.is_mock ||
    !input.snapshot.is_visible ||
    input.snapshot.status !== "visible" ||
    input.snapshot.side !== "long"
  ) {
    reasons.push("snapshot_not_real_live_evidence");
  }

  if (
    !positiveFinite(input.snapshot.entry) ||
    !positiveFinite(input.snapshot.stop) ||
    !positiveFinite(input.snapshot.target) ||
    input.snapshot.stop >= input.snapshot.entry ||
    input.snapshot.target <= input.snapshot.entry
  ) {
    reasons.push("snapshot_trade_plan_invalid");
  }

  if (
    eligibleSymbols.length === 0 ||
    eligibleSymbols.length > 10 ||
    !eligibleSymbols.includes(ticker)
  ) {
    reasons.push("pilot_symbol_scope_invalid");
  }

  if (!Number.isSafeInteger(input.quantity) || input.quantity <= 0) {
    reasons.push("quantity_invalid");
  }

  if (!explicitInstant(input.snapshot.recommended_at)) {
    reasons.push("submission_time_invalid");
  }

  if (reasons.length > 0 || strategyReference === null || !candidate) {
    return blocked(...reasons);
  }

  return {
    status: "ready",
    reason_codes: [],
    command: {
      command_version: INTERNAL_PAPER_ENTRY_COMMAND_VERSION,
      fill_model_version: INTERNAL_PAPER_FILL_MODEL_VERSION,
      owner_user_id: input.owner_user_id,
      account_id: input.account_id,
      scan_run_id: input.scan_run_id,
      scan_run_fingerprint: input.decision.scan_run_fingerprint,
      snapshot_id: input.snapshot.id,
      snapshot_fingerprint: input.snapshot.snapshot_fingerprint,
      candidate_identity: candidate.candidate_id,
      strategy_id: strategyReference.strategy_id,
      strategy_version: strategyReference.strategy_version,
      strategy_rollback_identity: strategyReference.rollback_identity,
      symbol_selection_policy_id:
        strategyReference.symbol_selection.policy_id,
      symbol_selection_policy_version:
        strategyReference.symbol_selection.policy_version,
      observed_universe_version:
        strategyReference.symbol_selection.observed_universe_version,
      ticker,
      quantity: input.quantity,
      arrival_price: input.snapshot.entry as number,
      stop_price: input.snapshot.stop as number,
      target_price: input.snapshot.target as number,
      submitted_at: new Date(input.snapshot.recommended_at as string).toISOString(),
    },
  };
}
