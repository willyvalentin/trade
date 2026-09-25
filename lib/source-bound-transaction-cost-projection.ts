import { createHash } from "node:crypto";

import {
  TRANSACTION_COST_LEG_VERSION,
  validateBrokerNeutralTransactionCostLeg,
  type TransactionCostLeg,
  type TransactionCostLegRole,
} from "@/lib/broker-neutral-transaction-cost-attribution";
import {
  reconcileIbkrPaperOrderEvidence,
  type IbkrExecutionEvent,
  type IbkrOrderEvidenceEvent,
  type IbkrOrderReconciliationInput,
  type IbkrOrderReconciliationResult,
  type IbkrOrderStatusEvent,
} from "@/lib/ibkr-order-reconciliation";
import {
  runInternalPaperReplayExecution,
  type InternalPaperReplayExecutionInput,
  type InternalPaperReplayExecutionResult,
} from "@/lib/internal-paper-replay-execution";

export const SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION =
  "source_bound_transaction_cost_projection_v1" as const;
export const IBKR_TRANSACTION_COST_BENCHMARK_EVIDENCE_VERSION =
  "ibkr_transaction_cost_benchmark_evidence_v1" as const;
export const INTERNAL_REPLAY_DECISION_BENCHMARK_EVIDENCE_VERSION =
  "internal_replay_decision_benchmark_evidence_v1" as const;

type EmbeddedEstimate = Readonly<{
  amount_usd: string | null;
  estimate_version: string | null;
}>;

type UnfilledOpportunityEvidence = Readonly<{
  benchmark_price_usd: string | null;
  benchmark_observed_at: string | null;
}>;

export type IbkrTransactionCostBenchmarkEvidence = Readonly<{
  evidence_version: typeof IBKR_TRANSACTION_COST_BENCHMARK_EVIDENCE_VERSION;
  evidence_id: string;
  source_result_digest: string;
  owner_user_id: string;
  decision_fingerprint: string;
  symbol: string;
  position_direction: "long" | "short";
  role: TransactionCostLegRole;
  decision_observed_at: string;
  decision_reference_price_usd: string;
  arrival_observed_at: string;
  arrival_reference_price_usd: string;
  arrival_benchmark_version: string;
  order_submitted_at: string;
  other_fees_usd: string;
  unfilled_opportunity: UnfilledOpportunityEvidence;
  spread_cost_estimate: EmbeddedEstimate;
  market_impact_estimate: EmbeddedEstimate;
}>;

export type InternalReplayDecisionBenchmarkEvidence = Readonly<{
  evidence_version: typeof INTERNAL_REPLAY_DECISION_BENCHMARK_EVIDENCE_VERSION;
  evidence_id: string;
  source_result_digest: string;
  owner_user_id: string;
  decision_fingerprint: string;
  symbol: string;
  decision_observed_at: string;
  decision_reference_price_usd: string;
  unfilled_opportunity: UnfilledOpportunityEvidence;
}>;

export type IbkrTransactionCostProjectionInput = Readonly<{
  projection_version: typeof SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION;
  projected_at: string;
  leg_id: string;
  source_input: IbkrOrderReconciliationInput;
  source_result: IbkrOrderReconciliationResult;
  benchmark: IbkrTransactionCostBenchmarkEvidence;
}>;

export type InternalReplayTransactionCostProjectionInput = Readonly<{
  projection_version: typeof SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION;
  projected_at: string;
  entry_leg_id: string;
  exit_leg_id: string | null;
  source_input: InternalPaperReplayExecutionInput;
  source_result: InternalPaperReplayExecutionResult;
  decision_benchmark: InternalReplayDecisionBenchmarkEvidence;
}>;

export type SourceBoundTransactionCostProjectionResult = Readonly<{
  projection_version: typeof SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION;
  status: "ready" | "blocked";
  source_kind: "ibkr_paper_reconciliation" | "internal_paper_replay_execution";
  reason_codes: readonly string[];
  source_input_digest: string | null;
  source_result_digest: string | null;
  benchmark_evidence_ids: readonly string[];
  benchmark_evidence_digests: readonly string[];
  legs: readonly TransactionCostLeg[];
  projection_digest: string;
  safety: Readonly<{
    source_core_recomputed: true;
    claimed_source_result_trusted_without_recomputation: false;
    supplied_benchmark_evidence_only: true;
    provider_request_authorized: false;
    database_write_authorized: false;
    ranking_change_authorized: false;
    publication_authorized: false;
    broker_transport_present: false;
    broker_action_authorized: false;
  }>;
}>;

const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:._/-]{0,159}$/;
const SYMBOL_PATTERN = /^[A-Z][A-Z0-9.]{0,15}$/;
const DECIMAL_PATTERN = /^(?:0|[1-9]\d{0,11})(?:\.(\d{1,6}))?$/;
const MAX_LIFECYCLE_MS = 24 * 60 * 60 * 1_000;

const SAFETY = Object.freeze({
  source_core_recomputed: true as const,
  claimed_source_result_trusted_without_recomputation: false as const,
  supplied_benchmark_evidence_only: true as const,
  provider_request_authorized: false as const,
  database_write_authorized: false as const,
  ranking_change_authorized: false as const,
  publication_authorized: false as const,
  broker_transport_present: false as const,
  broker_action_authorized: false as const,
});

const IBKR_INPUT_KEYS = [
  "benchmark",
  "leg_id",
  "projected_at",
  "projection_version",
  "source_input",
  "source_result",
] as const;
const REPLAY_INPUT_KEYS = [
  "decision_benchmark",
  "entry_leg_id",
  "exit_leg_id",
  "projected_at",
  "projection_version",
  "source_input",
  "source_result",
] as const;
const IBKR_BENCHMARK_KEYS = [
  "arrival_benchmark_version",
  "arrival_observed_at",
  "arrival_reference_price_usd",
  "decision_fingerprint",
  "decision_observed_at",
  "decision_reference_price_usd",
  "evidence_id",
  "evidence_version",
  "market_impact_estimate",
  "order_submitted_at",
  "other_fees_usd",
  "owner_user_id",
  "position_direction",
  "role",
  "source_result_digest",
  "spread_cost_estimate",
  "symbol",
  "unfilled_opportunity",
] as const;
const REPLAY_BENCHMARK_KEYS = [
  "decision_fingerprint",
  "decision_observed_at",
  "decision_reference_price_usd",
  "evidence_id",
  "evidence_version",
  "owner_user_id",
  "source_result_digest",
  "symbol",
  "unfilled_opportunity",
] as const;
const ESTIMATE_KEYS = ["amount_usd", "estimate_version"] as const;
const OPPORTUNITY_KEYS = [
  "benchmark_observed_at",
  "benchmark_price_usd",
] as const;

function canonical(value: unknown): unknown {
  if (typeof value === "number" && !Number.isFinite(value)) {
    return { __invalid_non_finite_number__: String(value) };
  }
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

function canonicalJson(value: unknown) {
  return JSON.stringify(canonical(value));
}

function digest(value: unknown) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function exactEqual(left: unknown, right: unknown) {
  return canonicalJson(left) === canonicalJson(right);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
  }
  return value;
}

function exactRecord(value: unknown, expectedKeys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const expected = [...expectedKeys].sort();
  return keys.length === expected.length && keys.every((key, index) => key === expected[index]);
}

function instant(value: unknown): value is string {
  return typeof value === "string" && value.endsWith("Z") && Number.isFinite(Date.parse(value));
}

function identifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER_PATTERN.test(value);
}

function decimal(value: unknown, allowZero = false): value is string {
  if (typeof value !== "string" || !DECIMAL_PATTERN.test(value)) return false;
  const scaled = Number(value);
  return Number.isFinite(scaled) && (allowZero ? scaled >= 0 : scaled > 0);
}

function opportunityValid(value: unknown) {
  if (!exactRecord(value, OPPORTUNITY_KEYS)) return false;
  const item = value as Record<string, unknown>;
  return (
    (item.benchmark_price_usd === null && item.benchmark_observed_at === null) ||
    (decimal(item.benchmark_price_usd) && instant(item.benchmark_observed_at))
  );
}

function estimateValid(value: unknown) {
  if (!exactRecord(value, ESTIMATE_KEYS)) return false;
  const item = value as Record<string, unknown>;
  return (
    (item.amount_usd === null && item.estimate_version === null) ||
    (decimal(item.amount_usd, true) && identifier(item.estimate_version))
  );
}

function money(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER / 1_000_000) {
    return null;
  }
  return value.toFixed(6);
}

function projection(
  sourceKind: SourceBoundTransactionCostProjectionResult["source_kind"],
  values: Omit<
    SourceBoundTransactionCostProjectionResult,
    "projection_version" | "source_kind" | "projection_digest" | "safety"
  >,
) {
  const body = {
    projection_version: SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION,
    source_kind: sourceKind,
    ...values,
    safety: SAFETY,
  };
  return deepFreeze({ ...body, projection_digest: digest(body) });
}

function blocked(
  sourceKind: SourceBoundTransactionCostProjectionResult["source_kind"],
  reason: string,
  sourceInputDigest: string | null = null,
  sourceResultDigest: string | null = null,
) {
  return projection(sourceKind, {
    status: "blocked",
    reason_codes: [reason],
    source_input_digest: sourceInputDigest,
    source_result_digest: sourceResultDigest,
    benchmark_evidence_ids: [],
    benchmark_evidence_digests: [],
    legs: [],
  });
}

function ready(
  sourceKind: SourceBoundTransactionCostProjectionResult["source_kind"],
  sourceInputDigest: string,
  sourceResultDigest: string,
  benchmarkEvidence: readonly { evidence_id: string }[],
  legs: readonly TransactionCostLeg[],
) {
  return projection(sourceKind, {
    status: "ready",
    reason_codes: [],
    source_input_digest: sourceInputDigest,
    source_result_digest: sourceResultDigest,
    benchmark_evidence_ids: benchmarkEvidence.map((item) => item.evidence_id),
    benchmark_evidence_digests: benchmarkEvidence.map(digest),
    legs,
  });
}

function expectedSide(direction: "long" | "short", role: TransactionCostLegRole) {
  if (direction === "long") return role === "entry" ? "BUY" : "SELL";
  return role === "entry" ? "SELL" : "BUY";
}

function validateIbkrBenchmark(value: unknown) {
  if (!exactRecord(value, IBKR_BENCHMARK_KEYS)) return false;
  const item = value as Record<string, unknown>;
  return (
    item.evidence_version === IBKR_TRANSACTION_COST_BENCHMARK_EVIDENCE_VERSION &&
    identifier(item.evidence_id) &&
    typeof item.source_result_digest === "string" &&
    SHA256_PATTERN.test(item.source_result_digest) &&
    identifier(item.owner_user_id) &&
    typeof item.decision_fingerprint === "string" &&
    SHA256_PATTERN.test(item.decision_fingerprint) &&
    typeof item.symbol === "string" &&
    SYMBOL_PATTERN.test(item.symbol) &&
    ["long", "short"].includes(String(item.position_direction)) &&
    ["entry", "exit"].includes(String(item.role)) &&
    instant(item.decision_observed_at) &&
    decimal(item.decision_reference_price_usd) &&
    instant(item.arrival_observed_at) &&
    decimal(item.arrival_reference_price_usd) &&
    identifier(item.arrival_benchmark_version) &&
    instant(item.order_submitted_at) &&
    decimal(item.other_fees_usd, true) &&
    opportunityValid(item.unfilled_opportunity) &&
    estimateValid(item.spread_cost_estimate) &&
    estimateValid(item.market_impact_estimate)
  );
}

function validateReplayBenchmark(value: unknown) {
  if (!exactRecord(value, REPLAY_BENCHMARK_KEYS)) return false;
  const item = value as Record<string, unknown>;
  return (
    item.evidence_version === INTERNAL_REPLAY_DECISION_BENCHMARK_EVIDENCE_VERSION &&
    identifier(item.evidence_id) &&
    typeof item.source_result_digest === "string" &&
    SHA256_PATTERN.test(item.source_result_digest) &&
    identifier(item.owner_user_id) &&
    typeof item.decision_fingerprint === "string" &&
    SHA256_PATTERN.test(item.decision_fingerprint) &&
    typeof item.symbol === "string" &&
    SYMBOL_PATTERN.test(item.symbol) &&
    instant(item.decision_observed_at) &&
    decimal(item.decision_reference_price_usd) &&
    opportunityValid(item.unfilled_opportunity)
  );
}

function uniqueEvents(events: readonly IbkrOrderEvidenceEvent[]) {
  const byId = new Map<string, IbkrOrderEvidenceEvent>();
  for (const event of events) if (!byId.has(event.event_id)) byId.set(event.event_id, event);
  return Array.from(byId.values());
}

function projectIbkrPaperOrderTransactionCostLegUnchecked(
  value: unknown,
): SourceBoundTransactionCostProjectionResult {
  const kind = "ibkr_paper_reconciliation" as const;
  if (!exactRecord(value, IBKR_INPUT_KEYS)) return blocked(kind, "invalid_projection_input");
  const input = value as IbkrTransactionCostProjectionInput;
  if (
    input.projection_version !== SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION ||
    !instant(input.projected_at) ||
    !identifier(input.leg_id) ||
    !input.source_input ||
    typeof input.source_input !== "object" ||
    !validateIbkrBenchmark(input.benchmark)
  ) {
    return blocked(kind, "invalid_projection_input");
  }

  let recomputed: IbkrOrderReconciliationResult;
  try {
    recomputed = reconcileIbkrPaperOrderEvidence(input.source_input);
  } catch {
    return blocked(kind, "source_recomputation_failed");
  }
  const sourceInputDigest = recomputed.input_digest;
  const sourceResultDigest = recomputed.result_digest;
  if (!exactEqual(recomputed, input.source_result)) {
    return blocked(kind, "claimed_source_result_mismatch", sourceInputDigest, sourceResultDigest);
  }
  if (recomputed.status !== "completed") {
    return blocked(kind, "source_reconciliation_blocked", sourceInputDigest, sourceResultDigest);
  }
  if (!["filled", "cancelled"].includes(recomputed.disposition)) {
    return blocked(kind, "source_outcome_not_terminal_attributable", sourceInputDigest, sourceResultDigest);
  }

  const { intent } = input.source_input;
  const benchmark = input.benchmark;
  if (
    benchmark.source_result_digest !== sourceResultDigest ||
    benchmark.owner_user_id !== intent.owner_user_id ||
    benchmark.decision_fingerprint !== intent.decision_fingerprint ||
    benchmark.symbol !== intent.symbol ||
    intent.side !== expectedSide(benchmark.position_direction, benchmark.role)
  ) {
    return blocked(kind, "benchmark_source_binding_mismatch", sourceInputDigest, sourceResultDigest);
  }

  const events = uniqueEvents(input.source_input.events);
  const executions = events
    .filter((event): event is IbkrExecutionEvent => event.event_type === "execution")
    .sort((left, right) => left.executed_at.localeCompare(right.executed_at) || left.execution_id.localeCompare(right.execution_id));
  const terminalEvents = events
    .filter((event): event is IbkrOrderStatusEvent =>
      event.event_type === "order_status" &&
      event.status === recomputed.terminal_order_status,
    )
    .sort((left, right) => left.observed_at.localeCompare(right.observed_at));
  const terminalObservedAt = terminalEvents.at(-1)?.observed_at ?? null;
  if (terminalObservedAt === null) {
    return blocked(kind, "terminal_status_evidence_missing", sourceInputDigest, sourceResultDigest);
  }
  const decisionAt = Date.parse(benchmark.decision_observed_at);
  const arrivalAt = Date.parse(benchmark.arrival_observed_at);
  const submittedAt = Date.parse(benchmark.order_submitted_at);
  const terminalAt = Date.parse(terminalObservedAt);
  const projectedAt = Date.parse(input.projected_at);
  if (Date.parse(input.source_input.reconciled_at) > projectedAt) {
    return blocked(kind, "source_cutoff_after_projection", sourceInputDigest, sourceResultDigest);
  }
  if (
    decisionAt > arrivalAt ||
    arrivalAt > submittedAt ||
    submittedAt < Date.parse(intent.persisted_at) ||
    submittedAt > terminalAt ||
    terminalAt > projectedAt ||
    terminalAt - decisionAt > MAX_LIFECYCLE_MS ||
    executions.some((event) => Date.parse(event.executed_at) < submittedAt || Date.parse(event.executed_at) > terminalAt)
  ) {
    return blocked(kind, "benchmark_chronology_invalid", sourceInputDigest, sourceResultDigest);
  }
  const unfilledQuantity = intent.quantity - recomputed.filled_quantity;
  const commissionEvents = events.filter((event) => event.event_type === "commission");
  const commissionedExecutionIds = new Set(
    commissionEvents.map((event) => event.execution_id),
  );
  if (
    executions.some((event) => !commissionedExecutionIds.has(event.execution_id)) ||
    (executions.length > 0 && recomputed.commission_total === null)
  ) {
    return blocked(kind, "source_commission_evidence_incomplete", sourceInputDigest, sourceResultDigest);
  }
  const opportunity = benchmark.unfilled_opportunity;
  if (
    (unfilledQuantity === 0 && (opportunity.benchmark_price_usd !== null || opportunity.benchmark_observed_at !== null)) ||
    (opportunity.benchmark_observed_at !== null &&
      (Date.parse(opportunity.benchmark_observed_at) < terminalAt || Date.parse(opportunity.benchmark_observed_at) > projectedAt))
  ) {
    return blocked(kind, "opportunity_benchmark_invalid", sourceInputDigest, sourceResultDigest);
  }
  const disposition =
    recomputed.disposition === "filled"
      ? "filled"
      : recomputed.filled_quantity > 0
        ? "partially_filled_cancelled"
        : "cancelled";
  const leg: TransactionCostLeg = {
    leg_version: TRANSACTION_COST_LEG_VERSION,
    leg_id: input.leg_id,
    role: benchmark.role,
    side: intent.side,
    source_execution_digest: sourceResultDigest,
    decision_observed_at: benchmark.decision_observed_at,
    arrival_observed_at: benchmark.arrival_observed_at,
    order_submitted_at: benchmark.order_submitted_at,
    terminal_observed_at: terminalObservedAt,
    decision_reference_price_usd: benchmark.decision_reference_price_usd,
    arrival_reference_price_usd: benchmark.arrival_reference_price_usd,
    arrival_benchmark_version: benchmark.arrival_benchmark_version,
    requested_quantity: intent.quantity,
    disposition,
    fills: executions.map((event) => ({
      fill_id: event.execution_id,
      quantity: event.quantity,
      price_usd: event.price,
      executed_at: event.executed_at,
    })),
    commission_usd: recomputed.commission_total ?? "0.000000",
    other_fees_usd: benchmark.other_fees_usd,
    unfilled_opportunity_benchmark_price_usd: opportunity.benchmark_price_usd,
    unfilled_opportunity_benchmark_observed_at: opportunity.benchmark_observed_at,
    spread_cost_estimate_usd: benchmark.spread_cost_estimate.amount_usd,
    spread_estimate_version: benchmark.spread_cost_estimate.estimate_version,
    spread_cost_is_embedded_in_fill_price: true,
    market_impact_estimate_usd: benchmark.market_impact_estimate.amount_usd,
    market_impact_estimate_version: benchmark.market_impact_estimate.estimate_version,
    market_impact_is_embedded_in_fill_price: true,
  };
  if (!validateBrokerNeutralTransactionCostLeg(leg, input.projected_at)) {
    return blocked(kind, "normalized_leg_rejected", sourceInputDigest, sourceResultDigest);
  }
  return ready(kind, sourceInputDigest, sourceResultDigest, [benchmark], [leg]);
}

function projectInternalReplayTransactionCostLegsUnchecked(
  value: unknown,
): SourceBoundTransactionCostProjectionResult {
  const kind = "internal_paper_replay_execution" as const;
  if (!exactRecord(value, REPLAY_INPUT_KEYS)) return blocked(kind, "invalid_projection_input");
  const input = value as InternalReplayTransactionCostProjectionInput;
  if (
    input.projection_version !== SOURCE_BOUND_TRANSACTION_COST_PROJECTION_VERSION ||
    !instant(input.projected_at) ||
    !identifier(input.entry_leg_id) ||
    (input.exit_leg_id !== null && !identifier(input.exit_leg_id)) ||
    !input.source_input ||
    typeof input.source_input !== "object" ||
    !validateReplayBenchmark(input.decision_benchmark)
  ) {
    return blocked(kind, "invalid_projection_input");
  }

  let recomputed: InternalPaperReplayExecutionResult;
  try {
    recomputed = runInternalPaperReplayExecution(input.source_input);
  } catch {
    return blocked(kind, "source_recomputation_failed");
  }
  const sourceInputDigest = recomputed.input_digest;
  const sourceResultDigest = recomputed.result_digest;
  if (!exactEqual(recomputed, input.source_result)) {
    return blocked(kind, "claimed_source_result_mismatch", sourceInputDigest, sourceResultDigest);
  }
  if (recomputed.status !== "completed" || recomputed.replay.status !== "completed") {
    return blocked(kind, "source_outcome_not_completed", sourceInputDigest, sourceResultDigest);
  }

  const entry = input.source_input.base_replay.entry;
  const benchmark = input.decision_benchmark;
  if (
    Date.parse(input.source_input.base_replay.dataset.point_in_time_as_of) >
    Date.parse(input.projected_at)
  ) {
    return blocked(kind, "source_cutoff_after_projection", sourceInputDigest, sourceResultDigest);
  }
  if (
    benchmark.source_result_digest !== sourceResultDigest ||
    benchmark.owner_user_id !== entry.owner_user_id ||
    benchmark.decision_fingerprint !== entry.snapshot_fingerprint ||
    benchmark.symbol !== entry.ticker
  ) {
    return blocked(kind, "benchmark_source_binding_mismatch", sourceInputDigest, sourceResultDigest);
  }
  if (
    Date.parse(benchmark.decision_observed_at) > Date.parse(entry.submitted_at) ||
    Date.parse(entry.submitted_at) > Date.parse(recomputed.fill_occurred_at) ||
    Date.parse(recomputed.fill_occurred_at) > Date.parse(input.projected_at)
  ) {
    return blocked(kind, "benchmark_chronology_invalid", sourceInputDigest, sourceResultDigest);
  }

  const entryEvents = recomputed.replay.events.filter((event) => event.event_type === "entry_fill");
  const exitEvents = recomputed.replay.events.filter((event) => event.event_type === "exit_fill");
  if (
    entryEvents.length !== 1 ||
    entryEvents[0].occurred_at !== recomputed.fill_occurred_at ||
    entryEvents[0].quantity !== recomputed.filled_quantity ||
    entryEvents[0].ticker !== entry.ticker
  ) {
    return blocked(kind, "replay_entry_event_inconsistent", sourceInputDigest, sourceResultDigest);
  }
  if (exitEvents.length > 1) {
    return blocked(kind, "multiple_exit_orders_not_supported", sourceInputDigest, sourceResultDigest);
  }
  if ((exitEvents.length === 1) !== (input.exit_leg_id !== null)) {
    return blocked(kind, "exit_leg_identity_mismatch", sourceInputDigest, sourceResultDigest);
  }
  const opportunity = benchmark.unfilled_opportunity;
  if (
    (recomputed.unfilled_quantity === 0 && (opportunity.benchmark_price_usd !== null || opportunity.benchmark_observed_at !== null)) ||
    (opportunity.benchmark_observed_at !== null &&
      (Date.parse(opportunity.benchmark_observed_at) < Date.parse(recomputed.fill_occurred_at) ||
        Date.parse(opportunity.benchmark_observed_at) > Date.parse(input.projected_at)))
  ) {
    return blocked(kind, "opportunity_benchmark_invalid", sourceInputDigest, sourceResultDigest);
  }

  const entryEvent = entryEvents[0];
  const entrySpread = money(entryEvent.spread_cost);
  const entrySlippage = money(entryEvent.slippage_cost);
  const entryCommission = money(entryEvent.commission);
  const arrivalPrice = money(entry.arrival_price);
  const entryFillPrice = money(entryEvent.fill_price);
  if ([entrySpread, entrySlippage, entryCommission, arrivalPrice, entryFillPrice].some((item) => item === null)) {
    return blocked(kind, "replay_economics_out_of_range", sourceInputDigest, sourceResultDigest);
  }
  const entryLeg: TransactionCostLeg = {
    leg_version: TRANSACTION_COST_LEG_VERSION,
    leg_id: input.entry_leg_id,
    role: "entry",
    side: "BUY",
    source_execution_digest: sourceResultDigest,
    decision_observed_at: benchmark.decision_observed_at,
    arrival_observed_at: entry.submitted_at,
    order_submitted_at: entry.submitted_at,
    terminal_observed_at: recomputed.fill_occurred_at,
    decision_reference_price_usd: benchmark.decision_reference_price_usd,
    arrival_reference_price_usd: arrivalPrice!,
    arrival_benchmark_version: "internal_paper_entry_command_arrival_v1",
    requested_quantity: recomputed.requested_quantity,
    disposition: recomputed.unfilled_quantity === 0 ? "filled" : "partially_filled_cancelled",
    fills: [{
      fill_id: `replay-entry:${recomputed.fill_candle_id}`,
      quantity: recomputed.filled_quantity,
      price_usd: entryFillPrice!,
      executed_at: recomputed.fill_occurred_at,
    }],
    commission_usd: entryCommission!,
    other_fees_usd: "0.000000",
    unfilled_opportunity_benchmark_price_usd: opportunity.benchmark_price_usd,
    unfilled_opportunity_benchmark_observed_at: opportunity.benchmark_observed_at,
    spread_cost_estimate_usd: entrySpread!,
    spread_estimate_version: "internal_paper_immediate_costed_fill_v1:spread_v1",
    spread_cost_is_embedded_in_fill_price: true,
    market_impact_estimate_usd: entrySlippage!,
    market_impact_estimate_version: "internal_paper_immediate_costed_fill_v1:slippage_v1",
    market_impact_is_embedded_in_fill_price: true,
  };

  const legs: TransactionCostLeg[] = [entryLeg];
  if (exitEvents.length === 1) {
    const event = exitEvents[0];
    const reference = money(event.reference_price);
    const fill = money(event.fill_price);
    const commission = money(event.commission);
    const spread = money(event.spread_cost);
    const slippage = money(event.slippage_cost);
    if (
      event.ticker !== entry.ticker ||
      Date.parse(event.occurred_at) < Date.parse(recomputed.fill_occurred_at) ||
      Date.parse(event.occurred_at) > Date.parse(input.projected_at) ||
      [reference, fill, commission, spread, slippage].some((item) => item === null)
    ) {
      return blocked(kind, "replay_exit_event_inconsistent", sourceInputDigest, sourceResultDigest);
    }
    legs.push({
      leg_version: TRANSACTION_COST_LEG_VERSION,
      leg_id: input.exit_leg_id!,
      role: "exit",
      side: "SELL",
      source_execution_digest: sourceResultDigest,
      decision_observed_at: event.occurred_at,
      arrival_observed_at: event.occurred_at,
      order_submitted_at: event.occurred_at,
      terminal_observed_at: event.occurred_at,
      decision_reference_price_usd: reference!,
      arrival_reference_price_usd: reference!,
      arrival_benchmark_version: `internal_paper_exit_${event.reason}_reference_v1`,
      requested_quantity: event.quantity,
      disposition: "filled",
      fills: [{
        fill_id: `replay-exit:${event.evidence_id}:${event.sequence}`,
        quantity: event.quantity,
        price_usd: fill!,
        executed_at: event.occurred_at,
      }],
      commission_usd: commission!,
      other_fees_usd: "0.000000",
      unfilled_opportunity_benchmark_price_usd: null,
      unfilled_opportunity_benchmark_observed_at: null,
      spread_cost_estimate_usd: spread!,
      spread_estimate_version: "internal_paper_immediate_costed_exit_v1:spread_v1",
      spread_cost_is_embedded_in_fill_price: true,
      market_impact_estimate_usd: slippage!,
      market_impact_estimate_version: "internal_paper_immediate_costed_exit_v1:slippage_v1",
      market_impact_is_embedded_in_fill_price: true,
    });
  }
  if (legs.some((leg) => !validateBrokerNeutralTransactionCostLeg(leg, input.projected_at))) {
    return blocked(kind, "normalized_leg_rejected", sourceInputDigest, sourceResultDigest);
  }
  return ready(kind, sourceInputDigest, sourceResultDigest, [benchmark], legs);
}

/** Fail-closed public boundary for untrusted reconciliation projections. */
export function projectIbkrPaperOrderTransactionCostLeg(
  value: unknown,
): SourceBoundTransactionCostProjectionResult {
  try {
    return projectIbkrPaperOrderTransactionCostLegUnchecked(value);
  } catch {
    return blocked("ibkr_paper_reconciliation", "projection_input_unreadable");
  }
}

/** Fail-closed public boundary for untrusted replay projections. */
export function projectInternalReplayTransactionCostLegs(
  value: unknown,
): SourceBoundTransactionCostProjectionResult {
  try {
    return projectInternalReplayTransactionCostLegsUnchecked(value);
  } catch {
    return blocked("internal_paper_replay_execution", "projection_input_unreadable");
  }
}
