import { createHash } from "node:crypto";

import {
  internalPaperReplayEntryExceedsLimit,
  runInternalPaperMarketReplay,
  validateInternalPaperReplayOrderAdmission,
  type InternalPaperMarketReplayInput,
  type InternalPaperReplayBlockReason,
  type InternalPaperReplayResult,
} from "@/lib/internal-paper-market-replay";

export const INTERNAL_PAPER_REPLAY_EXECUTION_VERSION =
  "internal_paper_replay_execution_v2" as const;
export const INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION =
  "internal_paper_replay_execution_result_v2" as const;
export const INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION =
  "previous_completed_regular_minute_volume_v1" as const;

export type InternalPaperReplayExecutionPolicy = Readonly<{
  policy_version: string;
  order_type: "market" | "limit";
  time_in_force: "ioc";
  limit_price: number | null;
  latency_ms: number;
  liquidity_proxy_version: typeof INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION;
  max_volume_participation_bps: number;
  minimum_fill_quantity: number;
  maximum_order_quantity: number;
}>;

export type InternalPaperReplayExecutionInput = Readonly<{
  execution_version: typeof INTERNAL_PAPER_REPLAY_EXECUTION_VERSION;
  order_id: string;
  base_replay: InternalPaperMarketReplayInput;
  policy: InternalPaperReplayExecutionPolicy;
}>;

export type InternalPaperReplayExecutionResult =
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION;
      execution_version: typeof INTERNAL_PAPER_REPLAY_EXECUTION_VERSION;
      status: "blocked";
      reason:
        | "base_replay_blocked"
        | "execution_input_invalid"
        | "liquidity_evidence_missing";
      input_digest: string;
      base_replay_reason_codes: InternalPaperReplayBlockReason[];
      result_digest: string;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION;
      execution_version: typeof INTERNAL_PAPER_REPLAY_EXECUTION_VERSION;
      status: "rejected";
      reason: "order_quantity_limit";
      input_digest: string;
      requested_quantity: number;
      result_digest: string;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION;
      execution_version: typeof INTERNAL_PAPER_REPLAY_EXECUTION_VERSION;
      status: "unfilled";
      reason:
        | "fill_window_expired"
        | "limit_not_reached"
        | "insufficient_liquidity";
      input_digest: string;
      requested_quantity: number;
      inspected_through: string;
      result_digest: string;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION;
      execution_version: typeof INTERNAL_PAPER_REPLAY_EXECUTION_VERSION;
      status: "completed";
      input_digest: string;
      requested_quantity: number;
      filled_quantity: number;
      unfilled_quantity: number;
      fill_reference_price: number;
      fill_candle_id: string;
      fill_occurred_at: string;
      liquidity_reference_candle_id: string;
      liquidity_reference_candle_started_at: string;
      liquidity_reference_volume: number;
      liquidity_proxy_version: typeof INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION;
      replay: InternalPaperReplayResult;
      result_digest: string;
    }>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_LATENCY_MS = 30 * 60_000;

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

function validPrice(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= Number.MAX_SAFE_INTEGER / 1_000_000 &&
    Math.abs(value - Number(value.toFixed(6))) <=
      Math.max(1, Math.abs(value)) * Number.EPSILON * 4
  );
}

function validInput(input: InternalPaperReplayExecutionInput) {
  const { policy } = input;
  return (
    input.execution_version === INTERNAL_PAPER_REPLAY_EXECUTION_VERSION &&
    UUID_PATTERN.test(input.order_id) &&
    policy.policy_version.trim().length > 0 &&
    ["market", "limit"].includes(policy.order_type) &&
    policy.time_in_force === "ioc" &&
    ((policy.order_type === "market" && policy.limit_price === null) ||
      (policy.order_type === "limit" && validPrice(policy.limit_price))) &&
    Number.isSafeInteger(policy.latency_ms) &&
    policy.latency_ms >= 0 &&
    policy.latency_ms <= MAX_LATENCY_MS &&
    policy.liquidity_proxy_version ===
      INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION &&
    Number.isSafeInteger(policy.max_volume_participation_bps) &&
    policy.max_volume_participation_bps >= 1 &&
    policy.max_volume_participation_bps <= 10_000 &&
    Number.isSafeInteger(policy.minimum_fill_quantity) &&
    policy.minimum_fill_quantity >= 1 &&
    Number.isSafeInteger(policy.maximum_order_quantity) &&
    policy.maximum_order_quantity >= policy.minimum_fill_quantity
  );
}

function terminal<T extends object>(value: T): T & { result_digest: string } {
  return { ...value, result_digest: digest(value) };
}

/**
 * Adds deterministic IOC admission, latency, first-bar opening-price limit
 * checks and proxy-volume-capped fills ahead of the one-day replay. The
 * immediately preceding completed regular minute is the only volume proxy:
 * the arrival minute's final volume is future information at its open. This
 * is a modeled feasibility estimate, not exchange fill evidence. A missing
 * prior minute or volume blocks; neither is interpreted as zero liquidity.
 */
export function runInternalPaperReplayExecution(
  input: InternalPaperReplayExecutionInput,
): InternalPaperReplayExecutionResult {
  const inputDigest = digest(input);
  if (!validInput(input)) {
    return terminal({
      result_version: INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION,
      execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
      status: "blocked",
      reason: "execution_input_invalid",
      input_digest: inputDigest,
      base_replay_reason_codes: [],
    });
  }

  const preflightReasons = validateInternalPaperReplayOrderAdmission(input.base_replay);
  if (preflightReasons.length > 0) {
    return terminal({
      result_version: INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION,
      execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
      status: "blocked",
      reason: "base_replay_blocked",
      input_digest: inputDigest,
      base_replay_reason_codes: preflightReasons,
    });
  }

  const requestedQuantity = input.base_replay.entry.quantity;
  if (requestedQuantity > input.policy.maximum_order_quantity) {
    return terminal({
      result_version: INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION,
      execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
      status: "rejected",
      reason: "order_quantity_limit",
      input_digest: inputDigest,
      requested_quantity: requestedQuantity,
    });
  }

  const eligibleAt =
    Date.parse(input.base_replay.entry.submitted_at) + input.policy.latency_ms;
  const firstEligibleIndex = input.base_replay.candles.findIndex(
    ({ candle }) => Date.parse(candle.timestamp) >= eligibleAt,
  );
  const firstEligibleCandle =
    firstEligibleIndex >= 0
      ? input.base_replay.candles[firstEligibleIndex]
      : undefined;
  const inspectedThrough =
    firstEligibleCandle?.candle.timestamp ??
    input.base_replay.dataset.session_close;
  // An IOC cannot wait for an intrabar low or a later candle. The bar open is
  // the only available arrival proxy; a costed buy above the limit is unfilled.
  const selected =
    firstEligibleCandle &&
    (input.policy.order_type === "market" ||
      (firstEligibleCandle.candle.open <=
        (input.policy.limit_price as number) &&
        !internalPaperReplayEntryExceedsLimit(
          firstEligibleCandle.candle.open,
          input.policy.limit_price as number,
          input.base_replay.account,
        )))
      ? firstEligibleCandle
      : null;
  if (!selected) {
    return terminal({
      result_version: INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION,
      execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
      status: "unfilled",
      reason:
        input.policy.order_type === "market"
          ? "fill_window_expired"
          : "limit_not_reached",
      input_digest: inputDigest,
      requested_quantity: requestedQuantity,
      inspected_through: inspectedThrough,
    });
  }

  const liquidityReference = input.base_replay.candles[firstEligibleIndex - 1];
  const volume = liquidityReference?.candle.volume;
  if (
    !liquidityReference ||
    volume === undefined ||
    volume === null ||
    !Number.isSafeInteger(volume) ||
    volume < 0
  ) {
    return terminal({
      result_version: INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION,
      execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
      status: "blocked",
      reason: "liquidity_evidence_missing",
      input_digest: inputDigest,
      base_replay_reason_codes: [],
    });
  }
  const availableQuantityScaled =
    (BigInt(volume) * BigInt(input.policy.max_volume_participation_bps)) /
    BigInt(10_000);
  const availableQuantity =
    availableQuantityScaled >= BigInt(requestedQuantity)
      ? requestedQuantity
      : Number(availableQuantityScaled);
  const filledQuantity = Math.min(requestedQuantity, availableQuantity);
  if (filledQuantity < input.policy.minimum_fill_quantity) {
    return terminal({
      result_version: INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION,
      execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
      status: "unfilled",
      reason: "insufficient_liquidity",
      input_digest: inputDigest,
      requested_quantity: requestedQuantity,
      inspected_through: selected.candle.timestamp,
    });
  }

  const fillReferencePrice = selected.candle.open;
  const replay = runInternalPaperMarketReplay({
    ...input.base_replay,
    replay_id: `${input.base_replay.replay_id}:execution:${input.order_id}`,
    entry: {
      ...input.base_replay.entry,
      quantity: filledQuantity,
      arrival_price: fillReferencePrice,
      submitted_at: selected.candle.timestamp,
    },
  });
  if (replay.status === "blocked") {
    return terminal({
      result_version: INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION,
      execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
      status: "blocked",
      reason: "base_replay_blocked",
      input_digest: inputDigest,
      base_replay_reason_codes: replay.reason_codes,
    });
  }
  return terminal({
    result_version: INTERNAL_PAPER_REPLAY_EXECUTION_RESULT_VERSION,
    execution_version: INTERNAL_PAPER_REPLAY_EXECUTION_VERSION,
    status: "completed",
    input_digest: inputDigest,
    requested_quantity: requestedQuantity,
    filled_quantity: filledQuantity,
    unfilled_quantity: requestedQuantity - filledQuantity,
    fill_reference_price: fillReferencePrice,
    fill_candle_id: selected.candle_id,
    fill_occurred_at: selected.candle.timestamp,
    liquidity_reference_candle_id: liquidityReference.candle_id,
    liquidity_reference_candle_started_at: liquidityReference.candle.timestamp,
    liquidity_reference_volume: volume,
    liquidity_proxy_version: INTERNAL_PAPER_IOC_LIQUIDITY_PROXY_VERSION,
    replay,
  });
}
