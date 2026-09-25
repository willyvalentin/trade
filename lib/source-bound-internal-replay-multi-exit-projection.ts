import { createHash } from "node:crypto";

import {
  TRANSACTION_COST_LEG_VERSION,
  validateBrokerNeutralTransactionCostLeg,
  type TransactionCostLeg,
} from "@/lib/broker-neutral-transaction-cost-attribution";
import {
  runInternalPaperReplayExecution,
  type InternalPaperReplayExecutionInput,
  type InternalPaperReplayExecutionResult,
} from "@/lib/internal-paper-replay-execution";
import {
  INTERNAL_REPLAY_DECISION_BENCHMARK_EVIDENCE_VERSION,
  type InternalReplayDecisionBenchmarkEvidence,
} from "@/lib/source-bound-transaction-cost-projection";

export const SOURCE_BOUND_INTERNAL_REPLAY_MULTI_EXIT_PROJECTION_VERSION =
  "source_bound_internal_replay_multi_exit_projection_v2" as const;

export type SourceBoundInternalReplayMultiExitProjectionInput = Readonly<{
  projection_version: typeof SOURCE_BOUND_INTERNAL_REPLAY_MULTI_EXIT_PROJECTION_VERSION;
  projected_at: string;
  entry_leg_id: string;
  exit_leg_ids: readonly string[];
  source_input: InternalPaperReplayExecutionInput;
  source_result: InternalPaperReplayExecutionResult;
  decision_benchmark: InternalReplayDecisionBenchmarkEvidence;
}>;

export type SourceBoundInternalReplayMultiExitProjectionResult = Readonly<{
  projection_version: typeof SOURCE_BOUND_INTERNAL_REPLAY_MULTI_EXIT_PROJECTION_VERSION;
  status: "ready" | "blocked";
  source_kind: "internal_paper_replay_execution";
  reason_codes: readonly string[];
  owner_user_id: string | null;
  decision_fingerprint: string | null;
  symbol: string | null;
  source_input_digest: string | null;
  source_result_digest: string | null;
  source_lineage_digest: string | null;
  execution_lineage_digest: string | null;
  benchmark_evidence_id: string | null;
  benchmark_evidence_digest: string | null;
  legs: readonly TransactionCostLeg[];
  projection_digest: string;
  safety: Readonly<{
    source_core_recomputed: true;
    claimed_source_result_trusted_without_recomputation: false;
    v1_projection_semantics_mutated: false;
    source_event_order_preserved: true;
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
const MAX_EXIT_LEGS = 64;

const INPUT_KEYS = [
  "decision_benchmark",
  "entry_leg_id",
  "exit_leg_ids",
  "projected_at",
  "projection_version",
  "source_input",
  "source_result",
] as const;
const BENCHMARK_KEYS = [
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
const OPPORTUNITY_KEYS = [
  "benchmark_observed_at",
  "benchmark_price_usd",
] as const;

const SAFETY = Object.freeze({
  source_core_recomputed: true as const,
  claimed_source_result_trusted_without_recomputation: false as const,
  v1_projection_semantics_mutated: false as const,
  source_event_order_preserved: true as const,
  supplied_benchmark_evidence_only: true as const,
  provider_request_authorized: false as const,
  database_write_authorized: false as const,
  ranking_change_authorized: false as const,
  publication_authorized: false as const,
  broker_transport_present: false as const,
  broker_action_authorized: false as const,
});

function canonical(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === "number" && !Number.isFinite(value)) {
    return { __invalid_non_finite_number__: String(value) };
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) return { __cyclic_input__: true };
    seen.add(value);
    return value.map((item) => canonical(item, seen));
  }
  if (value && typeof value === "object") {
    if (seen.has(value)) return { __cyclic_input__: true };
    seen.add(value);
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item, seen)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}

function safeDigest(value: unknown) {
  try {
    return digest(value);
  } catch {
    return digest({ uninspectable_input: true });
  }
}

function exactEqual(left: unknown, right: unknown) {
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (value && typeof value === "object" && !seen.has(value)) {
    seen.add(value);
    for (const item of Object.values(value as Record<string, unknown>)) {
      deepFreeze(item, seen);
    }
    Object.freeze(value);
  }
  return value;
}

function exactRecord(value: unknown, expectedKeys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (Object.getOwnPropertySymbols(value).length > 0) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Object.keys(descriptors).sort();
  const expected = [...expectedKeys].sort();
  return (
    keys.length === expected.length &&
    keys.every((key, index) => key === expected[index]) &&
    Object.values(descriptors).every(
      (descriptor) =>
        "value" in descriptor &&
        descriptor.enumerable === true &&
        descriptor.get === undefined &&
        descriptor.set === undefined,
    )
  );
}

function identifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER_PATTERN.test(value);
}

function instant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function decimal(value: unknown, allowZero = false): value is string {
  if (typeof value !== "string" || !DECIMAL_PATTERN.test(value)) return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && (allowZero ? parsed >= 0 : parsed > 0);
}

function validateOpportunity(value: unknown) {
  if (!exactRecord(value, OPPORTUNITY_KEYS)) return false;
  const item = value as Record<string, unknown>;
  return (
    (item.benchmark_price_usd === null && item.benchmark_observed_at === null) ||
    (decimal(item.benchmark_price_usd) && instant(item.benchmark_observed_at))
  );
}

function validateBenchmark(value: unknown) {
  if (!exactRecord(value, BENCHMARK_KEYS)) return false;
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
    validateOpportunity(item.unfilled_opportunity)
  );
}

function money(value: number) {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > Number.MAX_SAFE_INTEGER / 1_000_000
  ) {
    return null;
  }
  return value.toFixed(6);
}

function result(
  values: Omit<
    SourceBoundInternalReplayMultiExitProjectionResult,
    "projection_version" | "source_kind" | "projection_digest" | "safety"
  >,
) {
  const body = {
    projection_version: SOURCE_BOUND_INTERNAL_REPLAY_MULTI_EXIT_PROJECTION_VERSION,
    source_kind: "internal_paper_replay_execution" as const,
    ...values,
    safety: SAFETY,
  };
  return deepFreeze({ ...body, projection_digest: digest(body) });
}

function blocked(
  reason: string,
  sourceInputDigest: string | null = null,
  sourceResultDigest: string | null = null,
) {
  return result({
    status: "blocked",
    reason_codes: [reason],
    owner_user_id: null,
    decision_fingerprint: null,
    symbol: null,
    source_input_digest: sourceInputDigest,
    source_result_digest: sourceResultDigest,
    source_lineage_digest: null,
    execution_lineage_digest: null,
    benchmark_evidence_id: null,
    benchmark_evidence_digest: null,
    legs: [],
  });
}

function projectUnchecked(
  value: unknown,
): SourceBoundInternalReplayMultiExitProjectionResult {
  if (!exactRecord(value, INPUT_KEYS)) return blocked("invalid_projection_input");
  const input = value as SourceBoundInternalReplayMultiExitProjectionInput;
  if (
    input.projection_version !==
      SOURCE_BOUND_INTERNAL_REPLAY_MULTI_EXIT_PROJECTION_VERSION ||
    !instant(input.projected_at) ||
    !identifier(input.entry_leg_id) ||
    !Array.isArray(input.exit_leg_ids) ||
    input.exit_leg_ids.length < 1 ||
    input.exit_leg_ids.length > MAX_EXIT_LEGS ||
    input.exit_leg_ids.some((legId) => !identifier(legId)) ||
    new Set([input.entry_leg_id, ...input.exit_leg_ids]).size !==
      input.exit_leg_ids.length + 1 ||
    !input.source_input ||
    typeof input.source_input !== "object" ||
    !validateBenchmark(input.decision_benchmark)
  ) {
    return blocked("invalid_projection_input");
  }

  let recomputed: InternalPaperReplayExecutionResult;
  try {
    recomputed = runInternalPaperReplayExecution(input.source_input);
  } catch {
    return blocked("source_recomputation_failed");
  }
  const sourceInputDigest = recomputed.input_digest;
  const sourceResultDigest = recomputed.result_digest;
  if (!exactEqual(recomputed, input.source_result)) {
    return blocked(
      "claimed_source_result_mismatch",
      sourceInputDigest,
      sourceResultDigest,
    );
  }
  if (recomputed.status !== "completed" || recomputed.replay.status !== "completed") {
    return blocked(
      "source_outcome_not_completed",
      sourceInputDigest,
      sourceResultDigest,
    );
  }

  const projectedAt = Date.parse(input.projected_at);
  const entry = input.source_input.base_replay.entry;
  const benchmark = input.decision_benchmark;
  if (
    Date.parse(input.source_input.base_replay.dataset.point_in_time_as_of) > projectedAt
  ) {
    return blocked("source_cutoff_after_projection", sourceInputDigest, sourceResultDigest);
  }
  if (
    benchmark.source_result_digest !== sourceResultDigest ||
    benchmark.owner_user_id !== entry.owner_user_id ||
    benchmark.decision_fingerprint !== entry.snapshot_fingerprint ||
    benchmark.symbol !== entry.ticker
  ) {
    return blocked(
      "benchmark_source_binding_mismatch",
      sourceInputDigest,
      sourceResultDigest,
    );
  }
  if (
    Date.parse(benchmark.decision_observed_at) > Date.parse(entry.submitted_at) ||
    Date.parse(entry.submitted_at) > Date.parse(recomputed.fill_occurred_at) ||
    Date.parse(recomputed.fill_occurred_at) > projectedAt
  ) {
    return blocked("benchmark_chronology_invalid", sourceInputDigest, sourceResultDigest);
  }

  const entryEvents = recomputed.replay.events.filter(
    (event) => event.event_type === "entry_fill",
  );
  const exitEvents = recomputed.replay.events.filter(
    (event) => event.event_type === "exit_fill",
  );
  if (
    entryEvents.length !== 1 ||
    entryEvents[0].occurred_at !== recomputed.fill_occurred_at ||
    entryEvents[0].quantity !== recomputed.filled_quantity ||
    entryEvents[0].ticker !== entry.ticker
  ) {
    return blocked("replay_entry_event_inconsistent", sourceInputDigest, sourceResultDigest);
  }
  if (exitEvents.length !== input.exit_leg_ids.length) {
    return blocked("exit_leg_identity_count_mismatch", sourceInputDigest, sourceResultDigest);
  }

  const opportunity = benchmark.unfilled_opportunity;
  if (
    (recomputed.unfilled_quantity === 0 &&
      (opportunity.benchmark_price_usd !== null ||
        opportunity.benchmark_observed_at !== null)) ||
    (opportunity.benchmark_observed_at !== null &&
      (Date.parse(opportunity.benchmark_observed_at) <
        Date.parse(recomputed.fill_occurred_at) ||
        Date.parse(opportunity.benchmark_observed_at) > projectedAt))
  ) {
    return blocked("opportunity_benchmark_invalid", sourceInputDigest, sourceResultDigest);
  }

  const entryEvent = entryEvents[0];
  const entrySpread = money(entryEvent.spread_cost);
  const entrySlippage = money(entryEvent.slippage_cost);
  const entryCommission = money(entryEvent.commission);
  const entryArrivalPrice = money(entry.arrival_price);
  const entryFillPrice = money(entryEvent.fill_price);
  if (
    [
      entrySpread,
      entrySlippage,
      entryCommission,
      entryArrivalPrice,
      entryFillPrice,
    ].some((item) => item === null)
  ) {
    return blocked("replay_economics_out_of_range", sourceInputDigest, sourceResultDigest);
  }

  const legs: TransactionCostLeg[] = [{
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
    arrival_reference_price_usd: entryArrivalPrice!,
    arrival_benchmark_version: "internal_paper_entry_command_arrival_v1",
    requested_quantity: recomputed.requested_quantity,
    disposition:
      recomputed.unfilled_quantity === 0 ? "filled" : "partially_filled_cancelled",
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
    market_impact_estimate_version:
      "internal_paper_immediate_costed_fill_v1:slippage_v1",
    market_impact_is_embedded_in_fill_price: true,
  }];

  let exitedQuantity = 0;
  let previousSequence = entryEvent.sequence;
  let previousOccurredAt = Date.parse(recomputed.fill_occurred_at);
  const exitEvidenceIds = new Set<string>();
  for (const [index, event] of exitEvents.entries()) {
    const occurredAt = Date.parse(event.occurred_at);
    const reference = money(event.reference_price);
    const fill = money(event.fill_price);
    const commission = money(event.commission);
    const spread = money(event.spread_cost);
    const slippage = money(event.slippage_cost);
    exitedQuantity += event.quantity;
    if (
      event.ticker !== entry.ticker ||
      !Number.isSafeInteger(event.quantity) ||
      event.quantity < 1 ||
      event.sequence <= previousSequence ||
      occurredAt < previousOccurredAt ||
      occurredAt > projectedAt ||
      exitEvidenceIds.has(event.evidence_id) ||
      exitedQuantity > recomputed.filled_quantity ||
      [reference, fill, commission, spread, slippage].some((item) => item === null)
    ) {
      return blocked("replay_exit_event_inconsistent", sourceInputDigest, sourceResultDigest);
    }
    exitEvidenceIds.add(event.evidence_id);
    previousSequence = event.sequence;
    previousOccurredAt = occurredAt;
    legs.push({
      leg_version: TRANSACTION_COST_LEG_VERSION,
      leg_id: input.exit_leg_ids[index],
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
      market_impact_estimate_version:
        "internal_paper_immediate_costed_exit_v1:slippage_v1",
      market_impact_is_embedded_in_fill_price: true,
    });
  }
  if (
    exitedQuantity !== recomputed.filled_quantity ||
    legs.some((leg) => !validateBrokerNeutralTransactionCostLeg(leg, input.projected_at))
  ) {
    return blocked("normalized_legs_rejected", sourceInputDigest, sourceResultDigest);
  }

  return result({
    status: "ready",
    reason_codes: [],
    owner_user_id: entry.owner_user_id,
    decision_fingerprint: entry.snapshot_fingerprint,
    symbol: entry.ticker,
    source_input_digest: sourceInputDigest,
    source_result_digest: sourceResultDigest,
    source_lineage_digest: safeDigest(recomputed.replay.source_lineage),
    execution_lineage_digest: safeDigest(recomputed.replay.execution_lineage),
    benchmark_evidence_id: benchmark.evidence_id,
    benchmark_evidence_digest: safeDigest(benchmark),
    legs,
  });
}

/**
 * Recomputes the E.2 source receipt and projects every ordered exit into N.3
 * legs. This is a pure source adapter: it cannot persist, publish, rank, call a
 * provider or reach a broker.
 */
export function projectSourceBoundInternalReplayMultiExit(
  value: unknown,
): SourceBoundInternalReplayMultiExitProjectionResult {
  try {
    return projectUnchecked(value);
  } catch {
    return blocked("projection_input_unreadable");
  }
}
