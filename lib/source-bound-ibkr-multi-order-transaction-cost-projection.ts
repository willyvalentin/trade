import { createHash } from "node:crypto";

import type { TransactionCostLeg } from "@/lib/broker-neutral-transaction-cost-attribution";
import {
  projectIbkrPaperOrderTransactionCostLeg,
  type IbkrTransactionCostProjectionInput,
} from "@/lib/source-bound-transaction-cost-projection";

export const SOURCE_BOUND_IBKR_MULTI_ORDER_PROJECTION_VERSION =
  "source_bound_ibkr_multi_order_projection_v2" as const;

export type SourceBoundIbkrMultiOrderProjectionInput = Readonly<{
  projection_version: typeof SOURCE_BOUND_IBKR_MULTI_ORDER_PROJECTION_VERSION;
  projection_id: string;
  projected_at: string;
  orders: readonly IbkrTransactionCostProjectionInput[];
}>;

export type SourceBoundIbkrMultiOrderProjectionResult = Readonly<{
  projection_version: typeof SOURCE_BOUND_IBKR_MULTI_ORDER_PROJECTION_VERSION;
  status: "ready" | "blocked";
  reason_codes: readonly string[];
  source_reason_codes: readonly string[];
  blocked_order_index: number | null;
  projection_id: string | null;
  owner_user_id: string | null;
  decision_fingerprint: string | null;
  symbol: string | null;
  position_direction: "long" | "short" | null;
  broker_account_id: string | null;
  conid: number | null;
  source_intent_ids: readonly string[];
  source_result_digests: readonly string[];
  benchmark_evidence_ids: readonly string[];
  benchmark_evidence_digests: readonly string[];
  legs: readonly TransactionCostLeg[];
  input_digest: string;
  result_digest: string;
  safety: Readonly<{
    each_source_core_recomputed: true;
    claimed_source_results_trusted_without_recomputation: false;
    v1_projection_semantics_mutated: false;
    source_order_lifecycles_collapsed: false;
    supplied_benchmark_evidence_only: true;
    provider_request_authorized: false;
    database_write_authorized: false;
    ranking_change_authorized: false;
    publication_authorized: false;
    broker_transport_present: false;
    broker_action_authorized: false;
  }>;
}>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_EXIT_ORDERS = 64;
const INPUT_KEYS = ["orders", "projected_at", "projection_id", "projection_version"] as const;

const SAFETY = Object.freeze({
  each_source_core_recomputed: true as const,
  claimed_source_results_trusted_without_recomputation: false as const,
  v1_projection_semantics_mutated: false as const,
  source_order_lifecycles_collapsed: false as const,
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
  if (typeof value === "bigint") return value.toString();
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

function instant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function terminal(
  input: unknown,
  values: Omit<
    SourceBoundIbkrMultiOrderProjectionResult,
    "projection_version" | "input_digest" | "result_digest" | "safety"
  >,
) {
  const inputDigest = safeDigest(input);
  const body = {
    projection_version: SOURCE_BOUND_IBKR_MULTI_ORDER_PROJECTION_VERSION,
    ...values,
    input_digest: inputDigest,
    safety: SAFETY,
  };
  return deepFreeze({ ...body, result_digest: digest(body) });
}

function blocked(
  input: unknown,
  reason: string,
  blockedOrderIndex: number | null = null,
  sourceReasonCodes: readonly string[] = [],
) {
  return terminal(input, {
    status: "blocked",
    reason_codes: [reason],
    source_reason_codes: [...sourceReasonCodes],
    blocked_order_index: blockedOrderIndex,
    projection_id: null,
    owner_user_id: null,
    decision_fingerprint: null,
    symbol: null,
    position_direction: null,
    broker_account_id: null,
    conid: null,
    source_intent_ids: [],
    source_result_digests: [],
    benchmark_evidence_ids: [],
    benchmark_evidence_digests: [],
    legs: [],
  });
}

function projectUnchecked(
  value: unknown,
): SourceBoundIbkrMultiOrderProjectionResult {
  if (!exactRecord(value, INPUT_KEYS)) return blocked(value, "invalid_projection_input");
  const input = value as SourceBoundIbkrMultiOrderProjectionInput;
  if (
    input.projection_version !== SOURCE_BOUND_IBKR_MULTI_ORDER_PROJECTION_VERSION ||
    !UUID_PATTERN.test(input.projection_id) ||
    !instant(input.projected_at) ||
    !Array.isArray(input.orders) ||
    input.orders.length < 2 ||
    input.orders.length > MAX_EXIT_ORDERS + 1
  ) {
    return blocked(value, "invalid_projection_input");
  }

  const legs: TransactionCostLeg[] = [];
  const sourceIntentIds: string[] = [];
  const sourceResultDigests: string[] = [];
  const benchmarkEvidenceIds: string[] = [];
  const benchmarkEvidenceDigests: string[] = [];

  for (const [index, order] of input.orders.entries()) {
    const projected = projectIbkrPaperOrderTransactionCostLeg(order);
    if (projected.status !== "ready" || projected.legs.length !== 1) {
      return blocked(
        value,
        "source_order_projection_blocked",
        index,
        projected.reason_codes,
      );
    }
    if (order.projected_at !== input.projected_at) {
      return blocked(value, "projection_cutoff_mismatch", index);
    }
    legs.push(projected.legs[0]);
    sourceIntentIds.push(order.source_input.intent.intent_id);
    sourceResultDigests.push(projected.source_result_digest!);
    benchmarkEvidenceIds.push(projected.benchmark_evidence_ids[0]);
    benchmarkEvidenceDigests.push(projected.benchmark_evidence_digests[0]);
  }

  const entryOrder = input.orders[0];
  const entryBenchmark = entryOrder.benchmark;
  const entryIntent = entryOrder.source_input.intent;
  if (entryBenchmark.role !== "entry" || legs[0].role !== "entry") {
    return blocked(value, "entry_order_role_required", 0);
  }
  if (
    input.orders.slice(1).some((order, index) => {
      const intent = order.source_input.intent;
      const benchmark = order.benchmark;
      return (
        benchmark.role !== "exit" ||
        benchmark.owner_user_id !== entryBenchmark.owner_user_id ||
        benchmark.decision_fingerprint !== entryBenchmark.decision_fingerprint ||
        benchmark.symbol !== entryBenchmark.symbol ||
        benchmark.position_direction !== entryBenchmark.position_direction ||
        intent.owner_user_id !== entryIntent.owner_user_id ||
        intent.broker_account_id !== entryIntent.broker_account_id ||
        intent.decision_fingerprint !== entryIntent.decision_fingerprint ||
        intent.conid !== entryIntent.conid ||
        intent.symbol !== entryIntent.symbol ||
        intent.security_type !== entryIntent.security_type ||
        intent.currency !== entryIntent.currency ||
        intent.exchange !== entryIntent.exchange ||
        legs[index + 1].role !== "exit"
      );
    })
  ) {
    return blocked(value, "cross_order_source_binding_mismatch");
  }
  if (
    new Set(sourceIntentIds).size !== sourceIntentIds.length ||
    new Set(sourceResultDigests).size !== sourceResultDigests.length ||
    new Set(benchmarkEvidenceIds).size !== benchmarkEvidenceIds.length ||
    new Set(legs.map((leg) => leg.leg_id)).size !== legs.length
  ) {
    return blocked(value, "duplicate_order_lifecycle_identity");
  }

  const enteredQuantity = legs[0].fills.reduce(
    (total, fill) => total + fill.quantity,
    0,
  );
  if (enteredQuantity < 1) return blocked(value, "entry_fill_required", 0);
  let remainingQuantity = enteredQuantity;
  let previousTerminalAt = Date.parse(legs[0].terminal_observed_at);
  for (const [index, leg] of legs.slice(1).entries()) {
    const orderIndex = index + 1;
    if (
      Date.parse(leg.decision_observed_at) < previousTerminalAt ||
      leg.requested_quantity > remainingQuantity
    ) {
      return blocked(value, "ordered_exit_lifecycle_invalid", orderIndex);
    }
    remainingQuantity -= leg.fills.reduce(
      (total, fill) => total + fill.quantity,
      0,
    );
    previousTerminalAt = Date.parse(leg.terminal_observed_at);
  }

  return terminal(value, {
    status: "ready",
    reason_codes: [],
    source_reason_codes: [],
    blocked_order_index: null,
    projection_id: input.projection_id,
    owner_user_id: entryBenchmark.owner_user_id,
    decision_fingerprint: entryBenchmark.decision_fingerprint,
    symbol: entryBenchmark.symbol,
    position_direction: entryBenchmark.position_direction,
    broker_account_id: entryIntent.broker_account_id,
    conid: entryIntent.conid,
    source_intent_ids: sourceIntentIds,
    source_result_digests: sourceResultDigests,
    benchmark_evidence_ids: benchmarkEvidenceIds,
    benchmark_evidence_digests: benchmarkEvidenceDigests,
    legs,
  });
}

/**
 * Recomputes every N.2 IBKR paper-order projection before binding its ordered
 * lifecycles into one N.3-compatible position view. It has no broker transport
 * or authority to submit, cancel, replace or retry an order.
 */
export function projectSourceBoundIbkrMultiOrderTransactionCosts(
  value: unknown,
): SourceBoundIbkrMultiOrderProjectionResult {
  try {
    return projectUnchecked(value);
  } catch {
    return blocked(value, "projection_input_unreadable");
  }
}
