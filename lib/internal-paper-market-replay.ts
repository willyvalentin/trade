import { createHash } from "node:crypto";

import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import type { SharedCandleCacheCandle } from "@/lib/shared-candle-cache";

export const INTERNAL_PAPER_MARKET_REPLAY_VERSION =
  "internal_paper_market_replay_v1" as const;
export const INTERNAL_PAPER_MARKET_REPLAY_CHECKPOINT_VERSION =
  "internal_paper_market_replay_checkpoint_v1" as const;
export const INTERNAL_PAPER_MARKET_REPLAY_RESULT_VERSION =
  "internal_paper_market_replay_result_v1" as const;

export type InternalPaperReplayBlockReason =
  | "account_config_invalid"
  | "corporate_action_evidence_missing"
  | "dataset_identity_invalid"
  | "dataset_not_point_in_time"
  | "entry_command_invalid"
  | "entry_outside_session"
  | "entry_risk_rejected"
  | "economic_result_out_of_range"
  | "market_day_incomplete"
  | "market_event_invalid"
  | "market_event_out_of_order"
  | "replay_identity_invalid"
  | "replay_checkpoint_invalid";

export type InternalPaperReplayDataset = Readonly<{
  dataset_id: string;
  dataset_version: string;
  source_reference: string;
  entitlement_reference: string;
  retention_rights_reference: string;
  point_in_time_as_of: string;
  ticker: string;
  trading_date: string;
  session_open: string;
  session_close: string;
  session_calendar_reference: string;
  corporate_action_status: "verified_none" | "adjusted";
  corporate_action_reference: string;
  complete_regular_session: boolean;
}>;

export type InternalPaperReplayAccountConfig = Readonly<{
  account_config_version: string;
  initial_cash: number;
  per_trade_risk_cap: number;
  daily_loss_cap: number;
  spread_bps: number;
  slippage_bps: number;
  commission_per_order: number;
  target_exit_fraction_bps: number;
}>;

export type InternalPaperReplayCandle = Readonly<{
  candle_id: string;
  candle: SharedCandleCacheCandle;
}>;

export type InternalPaperReplayEvent = Readonly<{
  sequence: number;
  event_type: "entry_fill" | "exit_fill";
  occurred_at: string;
  ticker: string;
  quantity: number;
  reason: "entry" | "stop_loss" | "target_partial" | "target_final" | "eod";
  reference_price: number;
  fill_price: number;
  spread_cost: number;
  slippage_cost: number;
  commission: number;
  cash_delta: number;
  realized_net_pnl: number;
  evidence_id: string;
}>;

type ReplayState = Readonly<{
  cash_balance: number;
  account_status: "ready" | "paused";
  original_quantity: number;
  remaining_quantity: number;
  average_entry_price: number;
  cost_basis: number;
  remaining_cost_basis: number;
  entry_commission: number;
  remaining_entry_commission: number;
  target_exit_completed: boolean;
  realized_gross_pnl: number;
  realized_net_pnl: number;
  total_commission_paid: number;
  opened_at: string;
  closed_at: string | null;
}>;

export type InternalPaperReplayCheckpoint = Readonly<{
  checkpoint_version: typeof INTERNAL_PAPER_MARKET_REPLAY_CHECKPOINT_VERSION;
  replay_version: typeof INTERNAL_PAPER_MARKET_REPLAY_VERSION;
  input_digest: string;
  next_candle_index: number;
  state: ReplayState;
  events: InternalPaperReplayEvent[];
  checkpoint_digest: string;
}>;

export type InternalPaperReplayResult =
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_MARKET_REPLAY_RESULT_VERSION;
      replay_version: typeof INTERNAL_PAPER_MARKET_REPLAY_VERSION;
      status: "blocked";
      reason_codes: InternalPaperReplayBlockReason[];
      input_digest: string | null;
      checkpoint: null;
      events: [];
      result_digest: null;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_MARKET_REPLAY_RESULT_VERSION;
      replay_version: typeof INTERNAL_PAPER_MARKET_REPLAY_VERSION;
      status: "paused";
      reason_codes: [];
      input_digest: string;
      checkpoint: InternalPaperReplayCheckpoint;
      events: InternalPaperReplayEvent[];
      result_digest: null;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_MARKET_REPLAY_RESULT_VERSION;
      replay_version: typeof INTERNAL_PAPER_MARKET_REPLAY_VERSION;
      status: "completed";
      reason_codes: [];
      input_digest: string;
      checkpoint: null;
      events: InternalPaperReplayEvent[];
      final_state: ReplayState;
      source_lineage: Readonly<{
        dataset_id: string;
        dataset_version: string;
        point_in_time_as_of: string;
        source_reference: string;
        entitlement_reference: string;
        retention_rights_reference: string;
        corporate_action_reference: string;
        session_calendar_reference: string;
      }>;
      execution_lineage: Readonly<{
        deterministic_seed: string;
        account_config_version: string;
        entry_command_version: "internal_paper_entry_command_v1";
        entry_fill_model_version: "internal_paper_immediate_costed_fill_v1";
        exit_fill_model_version: "internal_paper_immediate_costed_exit_v1";
        snapshot_fingerprint: string;
      }>;
      result_digest: string;
    }>;

export type InternalPaperMarketReplayInput = Readonly<{
  replay_version: typeof INTERNAL_PAPER_MARKET_REPLAY_VERSION;
  replay_id: string;
  deterministic_seed: string;
  dataset: InternalPaperReplayDataset;
  account: InternalPaperReplayAccountConfig;
  entry: InternalPaperEntryCommand;
  candles: InternalPaperReplayCandle[];
}>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const SESSION_CANDLE_COUNT = 390;
const BIGINT_ZERO = BigInt(0);
const BIGINT_TWO = BigInt(2);
const BIGINT_TEN_THOUSAND = BigInt(10_000);
const BIGINT_TWENTY_THOUSAND = BigInt(20_000);
const DECIMAL_SCALE = BigInt(1_000_000);
const MAX_SAFE_SCALED_NUMBER = BigInt(Number.MAX_SAFE_INTEGER);

function finiteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function finitePositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function toScaled(value: number): bigint {
  const negative = value < 0;
  const [whole, fraction = ""] = Math.abs(value).toFixed(6).split(".");
  const scaled = BigInt(whole) * DECIMAL_SCALE + BigInt(fraction.padEnd(6, "0"));
  return negative ? -scaled : scaled;
}

function fromScaled(value: bigint): number {
  if (value > MAX_SAFE_SCALED_NUMBER || value < -MAX_SAFE_SCALED_NUMBER) {
    throw new RangeError("scaled decimal exceeds the safe replay result range");
  }
  return Number(value) / Number(DECIMAL_SCALE);
}

function roundQuotient(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= BIGINT_ZERO) {
    throw new RangeError("decimal denominator must be positive");
  }
  const negative = numerator < BIGINT_ZERO;
  const absolute = negative ? -numerator : numerator;
  const rounded = (absolute + denominator / BIGINT_TWO) / denominator;
  return negative ? -rounded : rounded;
}

function safelyScalable(value: number) {
  if (
    !Number.isFinite(value) ||
    Math.abs(value) > Number.MAX_SAFE_INTEGER / Number(DECIMAL_SCALE)
  ) {
    return false;
  }
  const normalized = Number(value.toFixed(6));
  const tolerance = Math.max(1, Math.abs(value)) * Number.EPSILON * 4;
  return Math.abs(value - normalized) <= tolerance;
}

function scaledResultsAreSafe(...values: bigint[]) {
  return values.every(
    (value) =>
      value <= MAX_SAFE_SCALED_NUMBER && value >= -MAX_SAFE_SCALED_NUMBER,
  );
}

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

function digest(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
}

function nyParts(instant: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instant));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

function blocked(
  reasons: InternalPaperReplayBlockReason[],
  inputDigest: string | null = null,
): InternalPaperReplayResult {
  return {
    result_version: INTERNAL_PAPER_MARKET_REPLAY_RESULT_VERSION,
    replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
    status: "blocked",
    reason_codes: Array.from(new Set(reasons)).sort(),
    input_digest: inputDigest,
    checkpoint: null,
    events: [],
    result_digest: null,
  };
}

function validateAccount(account: InternalPaperReplayAccountConfig) {
  return (
    account.account_config_version.trim().length > 0 &&
    finitePositive(account.initial_cash) &&
    safelyScalable(account.initial_cash) &&
    finitePositive(account.per_trade_risk_cap) &&
    safelyScalable(account.per_trade_risk_cap) &&
    finitePositive(account.daily_loss_cap) &&
    safelyScalable(account.daily_loss_cap) &&
    finiteNonNegative(account.spread_bps) &&
    safelyScalable(account.spread_bps) &&
    account.spread_bps <= 10_000 &&
    finiteNonNegative(account.slippage_bps) &&
    safelyScalable(account.slippage_bps) &&
    account.slippage_bps <= 10_000 &&
    account.spread_bps / 2 + account.slippage_bps < 10_000 &&
    finiteNonNegative(account.commission_per_order) &&
    safelyScalable(account.commission_per_order) &&
    Number.isSafeInteger(account.target_exit_fraction_bps) &&
    account.target_exit_fraction_bps >= 1 &&
    account.target_exit_fraction_bps <= 10_000
  );
}

function validateEntry(entry: InternalPaperEntryCommand) {
  const lineage = [
    entry.scan_run_id,
    entry.scan_run_fingerprint,
    entry.snapshot_id,
    entry.snapshot_fingerprint,
    entry.candidate_identity,
    entry.strategy_id,
    entry.strategy_version,
    entry.strategy_rollback_identity,
    entry.symbol_selection_policy_id,
    entry.symbol_selection_policy_version,
    entry.observed_universe_version,
  ];
  return (
    entry.command_version === "internal_paper_entry_command_v1" &&
    entry.fill_model_version === "internal_paper_immediate_costed_fill_v1" &&
    UUID_PATTERN.test(entry.owner_user_id) &&
    UUID_PATTERN.test(entry.account_id) &&
    lineage.every((value) => value.trim().length > 0) &&
    entry.ticker.trim().length > 0 &&
    Number.isSafeInteger(entry.quantity) &&
    entry.quantity > 0 &&
    finitePositive(entry.arrival_price) &&
    safelyScalable(entry.arrival_price) &&
    finitePositive(entry.stop_price) &&
    safelyScalable(entry.stop_price) &&
    entry.stop_price < entry.arrival_price &&
    finitePositive(entry.target_price) &&
    safelyScalable(entry.target_price) &&
    entry.target_price > entry.arrival_price &&
    explicitInstant(entry.submitted_at)
  );
}

function datasetReasons(
  input: InternalPaperMarketReplayInput,
): InternalPaperReplayBlockReason[] {
  const reasons: InternalPaperReplayBlockReason[] = [];
  const dataset = input.dataset;
  const identityFields = [
    input.replay_id,
    input.deterministic_seed,
    dataset.dataset_id,
    dataset.dataset_version,
    dataset.source_reference,
    dataset.entitlement_reference,
    dataset.retention_rights_reference,
    dataset.session_calendar_reference,
    dataset.ticker,
    dataset.corporate_action_reference,
  ];
  if (input.replay_version !== INTERNAL_PAPER_MARKET_REPLAY_VERSION) {
    reasons.push("replay_identity_invalid");
  }
  if (
    identityFields.some((value) => !value.trim()) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dataset.trading_date) ||
    dataset.ticker.trim().toUpperCase() !== input.entry.ticker.trim().toUpperCase()
  ) {
    reasons.push("dataset_identity_invalid");
  }
  if (
    !explicitInstant(dataset.point_in_time_as_of) ||
    !explicitInstant(dataset.session_open) ||
    !explicitInstant(dataset.session_close) ||
    Date.parse(dataset.point_in_time_as_of) < Date.parse(dataset.session_close)
  ) {
    reasons.push("dataset_not_point_in_time");
  }
  if (
    !["verified_none", "adjusted"].includes(dataset.corporate_action_status) ||
    !dataset.corporate_action_reference.trim()
  ) {
    reasons.push("corporate_action_evidence_missing");
  }
  return reasons;
}

function validateMarketDay(
  input: InternalPaperMarketReplayInput,
): InternalPaperReplayBlockReason[] {
  const reasons = datasetReasons(input);
  const { dataset, candles } = input;
  const openMs = Date.parse(dataset.session_open);
  const closeMs = Date.parse(dataset.session_close);
  if (
    dataset.complete_regular_session !== true ||
    candles.length !== SESSION_CANDLE_COUNT ||
    !Number.isFinite(openMs) ||
    !Number.isFinite(closeMs) ||
    closeMs - openMs !== (SESSION_CANDLE_COUNT - 1) * 60_000 ||
    nyParts(dataset.session_open).date !== dataset.trading_date ||
    nyParts(dataset.session_open).time !== "09:30" ||
    nyParts(dataset.session_close).date !== dataset.trading_date ||
    nyParts(dataset.session_close).time !== "15:59"
  ) {
    reasons.push("market_day_incomplete");
  }

  let priorMs = Number.NEGATIVE_INFINITY;
  const ids = new Set<string>();
  candles.forEach((item, index) => {
    const candle = item.candle;
    const timestampMs = Date.parse(candle.timestamp);
    const expectedMs = openMs + index * 60_000;
    if (
      !UUID_PATTERN.test(item.candle_id) ||
      ids.has(item.candle_id) ||
      candle.contract_version !== "shared_candle_cache_v1" ||
      candle.provider.trim().length === 0 ||
      candle.source_request_id.trim().length === 0 ||
      candle.ticker.trim().toUpperCase() !== dataset.ticker.trim().toUpperCase() ||
      candle.interval !== "1min" ||
      candle.timezone !== "America/New_York" ||
      candle.market_session !== "regular" ||
      candle.validation_status !== "valid" ||
      (dataset.corporate_action_status === "adjusted" && !candle.adjusted) ||
      !explicitInstant(candle.timestamp) ||
      !explicitInstant(candle.fetched_at) ||
      Date.parse(candle.fetched_at) < timestampMs ||
      Date.parse(candle.fetched_at) > Date.parse(dataset.point_in_time_as_of) ||
      !finitePositive(candle.open) ||
      !safelyScalable(candle.open) ||
      !finitePositive(candle.high) ||
      !safelyScalable(candle.high) ||
      !finitePositive(candle.low) ||
      !safelyScalable(candle.low) ||
      !finitePositive(candle.close) ||
      !safelyScalable(candle.close) ||
      candle.high < Math.max(candle.open, candle.close) ||
      candle.low > Math.min(candle.open, candle.close) ||
      candle.high < candle.low ||
      nyParts(candle.timestamp).date !== dataset.trading_date
    ) {
      reasons.push("market_event_invalid");
    }
    if (timestampMs !== expectedMs || timestampMs <= priorMs) {
      reasons.push("market_event_out_of_order");
    }
    ids.add(item.candle_id);
    priorMs = timestampMs;
  });
  return reasons;
}

function entryState(input: InternalPaperMarketReplayInput):
  | { status: "ready"; state: ReplayState; event: InternalPaperReplayEvent }
  | {
      status: "blocked";
      reason: "entry_risk_rejected" | "economic_result_out_of_range";
    } {
  const { account, entry } = input;
  const arrival = toScaled(entry.arrival_price);
  const stop = toScaled(entry.stop_price);
  const spreadBps = toScaled(account.spread_bps);
  const slippageBps = toScaled(account.slippage_bps);
  const commission = toScaled(account.commission_per_order);
  const fillFactorNumerator =
    BIGINT_TWENTY_THOUSAND * DECIMAL_SCALE +
    spreadBps +
    BIGINT_TWO * slippageBps;
  const fillFactorDenominator = BIGINT_TWENTY_THOUSAND * DECIMAL_SCALE;
  const fillPriceScaled = roundQuotient(
    arrival * fillFactorNumerator,
    fillFactorDenominator,
  );
  const spreadCostScaled = roundQuotient(
    arrival * BigInt(entry.quantity) * spreadBps,
    BIGINT_TWENTY_THOUSAND * DECIMAL_SCALE,
  );
  const slippageCostScaled = roundQuotient(
    arrival * BigInt(entry.quantity) * slippageBps,
    BIGINT_TEN_THOUSAND * DECIMAL_SCALE,
  );
  const notionalScaled = fillPriceScaled * BigInt(entry.quantity);
  const totalCashCostScaled = notionalScaled + commission;
  const riskAtStopScaled =
    (fillPriceScaled - stop) * BigInt(entry.quantity) + commission;
  if (
    fillPriceScaled <= stop ||
    totalCashCostScaled > toScaled(account.initial_cash) ||
    riskAtStopScaled > toScaled(account.per_trade_risk_cap)
  ) {
    return { status: "blocked", reason: "entry_risk_rejected" };
  }
  if (
    !scaledResultsAreSafe(
      fillPriceScaled,
      spreadCostScaled,
      slippageCostScaled,
      notionalScaled,
      totalCashCostScaled,
      riskAtStopScaled,
    )
  ) {
    return { status: "blocked", reason: "economic_result_out_of_range" };
  }
  const fillPrice = fromScaled(fillPriceScaled);
  const notional = fromScaled(notionalScaled);
  const totalCashCost = fromScaled(totalCashCostScaled);
  return {
    status: "ready",
    state: {
      cash_balance: fromScaled(toScaled(account.initial_cash) - totalCashCostScaled),
      account_status: "ready",
      original_quantity: entry.quantity,
      remaining_quantity: entry.quantity,
      average_entry_price: fillPrice,
      cost_basis: notional,
      remaining_cost_basis: notional,
      entry_commission: account.commission_per_order,
      remaining_entry_commission: account.commission_per_order,
      target_exit_completed: false,
      realized_gross_pnl: 0,
      realized_net_pnl: 0,
      total_commission_paid: account.commission_per_order,
      opened_at: entry.submitted_at,
      closed_at: null,
    },
    event: {
      sequence: 1,
      event_type: "entry_fill",
      occurred_at: entry.submitted_at,
      ticker: entry.ticker,
      quantity: entry.quantity,
      reason: "entry",
      reference_price: entry.arrival_price,
      fill_price: fillPrice,
      spread_cost: fromScaled(spreadCostScaled),
      slippage_cost: fromScaled(slippageCostScaled),
      commission: account.commission_per_order,
      cash_delta: -totalCashCost,
      realized_net_pnl: 0,
      evidence_id: entry.snapshot_fingerprint,
    },
  };
}

function applyCandle(
  input: InternalPaperMarketReplayInput,
  prior: ReplayState,
  item: InternalPaperReplayCandle,
  sequence: number,
): {
  state: ReplayState;
  event: InternalPaperReplayEvent | null;
  blocked_reason?: "economic_result_out_of_range";
} {
  const { candle } = item;
  const { account, entry } = input;
  if (
    prior.remaining_quantity === 0 ||
    Date.parse(candle.timestamp) <= Date.parse(prior.opened_at)
  ) {
    return { state: prior, event: null };
  }

  let reason: InternalPaperReplayEvent["reason"] | null = null;
  let quantity = 0;
  let referencePrice = 0;
  if (candle.low <= entry.stop_price) {
    reason = "stop_loss";
    quantity = prior.remaining_quantity;
    referencePrice = Math.min(entry.stop_price, candle.open);
  } else if (nyParts(candle.timestamp).time >= "15:59") {
    reason = "eod";
    quantity = prior.remaining_quantity;
    referencePrice = candle.close;
  } else if (candle.high >= entry.target_price && !prior.target_exit_completed) {
    quantity = Math.min(
      prior.remaining_quantity,
      Math.max(
        1,
        Math.floor(
          (prior.original_quantity * account.target_exit_fraction_bps) / 10_000,
        ),
      ),
    );
    reason = quantity === prior.remaining_quantity ? "target_final" : "target_partial";
    referencePrice = entry.target_price;
  }
  if (reason === null) return { state: prior, event: null };

  const reference = toScaled(referencePrice);
  const spreadBps = toScaled(account.spread_bps);
  const slippageBps = toScaled(account.slippage_bps);
  const commission = toScaled(account.commission_per_order);
  const fillFactorNumerator =
    BIGINT_TWENTY_THOUSAND * DECIMAL_SCALE -
    spreadBps -
    BIGINT_TWO * slippageBps;
  const fillFactorDenominator = BIGINT_TWENTY_THOUSAND * DECIMAL_SCALE;
  const fillPriceScaled = roundQuotient(
    reference * fillFactorNumerator,
    fillFactorDenominator,
  );
  const spreadCostScaled = roundQuotient(
    reference * BigInt(quantity) * spreadBps,
    BIGINT_TWENTY_THOUSAND * DECIMAL_SCALE,
  );
  const slippageCostScaled = roundQuotient(
    reference * BigInt(quantity) * slippageBps,
    BIGINT_TEN_THOUSAND * DECIMAL_SCALE,
  );
  const notionalScaled = fillPriceScaled * BigInt(quantity);
  const netCashProceedsScaled = notionalScaled - commission;
  if (
    fillPriceScaled <= BIGINT_ZERO ||
    netCashProceedsScaled < BIGINT_ZERO
  ) {
    return { state: prior, event: null };
  }

  const fullExit = quantity === prior.remaining_quantity;
  const allocatedCostBasisScaled = fullExit
    ? toScaled(prior.remaining_cost_basis)
    : roundQuotient(
        toScaled(prior.cost_basis) * BigInt(quantity),
        BigInt(prior.original_quantity),
      );
  const allocatedEntryCommissionScaled = fullExit
    ? toScaled(prior.remaining_entry_commission)
    : roundQuotient(
        toScaled(prior.entry_commission) * BigInt(quantity),
        BigInt(prior.original_quantity),
      );
  const grossPnlScaled = notionalScaled - allocatedCostBasisScaled;
  const netPnlScaled =
    grossPnlScaled - commission - allocatedEntryCommissionScaled;
  if (
    !scaledResultsAreSafe(
      reference,
      fillPriceScaled,
      spreadCostScaled,
      slippageCostScaled,
      notionalScaled,
      netCashProceedsScaled,
      allocatedCostBasisScaled,
      allocatedEntryCommissionScaled,
      grossPnlScaled,
      netPnlScaled,
      toScaled(prior.cash_balance) + netCashProceedsScaled,
      toScaled(prior.realized_gross_pnl) + grossPnlScaled,
      toScaled(prior.realized_net_pnl) + netPnlScaled,
    )
  ) {
    return {
      state: prior,
      event: null,
      blocked_reason: "economic_result_out_of_range",
    };
  }
  const remainingQuantity = prior.remaining_quantity - quantity;
  const realizedNetPnlScaled = toScaled(prior.realized_net_pnl) + netPnlScaled;
  const realizedNetPnl = fromScaled(realizedNetPnlScaled);
  const state: ReplayState = {
    ...prior,
    cash_balance: fromScaled(
      toScaled(prior.cash_balance) + netCashProceedsScaled,
    ),
    account_status:
      realizedNetPnlScaled <= -toScaled(account.daily_loss_cap)
        ? "paused"
        : prior.account_status,
    remaining_quantity: remainingQuantity,
    remaining_cost_basis: fromScaled(
      toScaled(prior.remaining_cost_basis) - allocatedCostBasisScaled,
    ),
    remaining_entry_commission: fromScaled(
      toScaled(prior.remaining_entry_commission) -
        allocatedEntryCommissionScaled,
    ),
    target_exit_completed:
      prior.target_exit_completed ||
      reason === "target_partial" ||
      reason === "target_final",
    realized_gross_pnl: fromScaled(
      toScaled(prior.realized_gross_pnl) + grossPnlScaled,
    ),
    realized_net_pnl: realizedNetPnl,
    total_commission_paid: fromScaled(
      toScaled(prior.total_commission_paid) + commission,
    ),
    closed_at: remainingQuantity === 0 ? candle.timestamp : null,
  };
  return {
    state,
    event: {
      sequence,
      event_type: "exit_fill",
      occurred_at: candle.timestamp,
      ticker: entry.ticker,
      quantity,
      reason,
      reference_price: referencePrice,
      fill_price: fromScaled(fillPriceScaled),
      spread_cost: fromScaled(spreadCostScaled),
      slippage_cost: fromScaled(slippageCostScaled),
      commission: account.commission_per_order,
      cash_delta: fromScaled(netCashProceedsScaled),
      realized_net_pnl: fromScaled(netPnlScaled),
      evidence_id: item.candle_id,
    },
  };
}

function checkpointPayload(
  inputDigest: string,
  nextCandleIndex: number,
  state: ReplayState,
  events: InternalPaperReplayEvent[],
) {
  return {
    checkpoint_version: INTERNAL_PAPER_MARKET_REPLAY_CHECKPOINT_VERSION,
    replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
    input_digest: inputDigest,
    next_candle_index: nextCandleIndex,
    state,
    events,
  } as const;
}

function validateCheckpoint(
  value: InternalPaperReplayCheckpoint,
  inputDigest: string,
  candleCount: number,
) {
  if (
    value.checkpoint_version !== INTERNAL_PAPER_MARKET_REPLAY_CHECKPOINT_VERSION ||
    value.replay_version !== INTERNAL_PAPER_MARKET_REPLAY_VERSION ||
    value.input_digest !== inputDigest ||
    !Number.isSafeInteger(value.next_candle_index) ||
    value.next_candle_index < 0 ||
    value.next_candle_index > candleCount ||
    !SHA256_PATTERN.test(value.checkpoint_digest)
  ) {
    return false;
  }
  const payload = checkpointPayload(
    value.input_digest,
    value.next_candle_index,
    value.state,
    value.events,
  );
  return digest(payload) === value.checkpoint_digest;
}

function replayPrefix(input: InternalPaperMarketReplayInput, endIndex: number) {
  const entry = entryState(input);
  if (entry.status === "blocked") return null;
  let state = entry.state;
  const events: InternalPaperReplayEvent[] = [entry.event];
  for (let index = 0; index < endIndex; index += 1) {
    const applied = applyCandle(input, state, input.candles[index], events.length + 1);
    if (applied.blocked_reason) return null;
    state = applied.state;
    if (applied.event) events.push(applied.event);
  }
  return { state, events };
}

/**
 * Replays exactly one complete US regular-session day without network, storage,
 * publication or broker effects. The event loop exposes candles only in stored
 * timestamp order and uses the same entry/exit model versions and precedence as
 * the C1/C2 internal-paper database lifecycle.
 */
export function runInternalPaperMarketReplay(
  input: InternalPaperMarketReplayInput,
  options: Readonly<{
    checkpoint?: InternalPaperReplayCheckpoint | null;
    pause_before_candle_index?: number | null;
  }> = {},
): InternalPaperReplayResult {
  const staticReasons: InternalPaperReplayBlockReason[] = [];
  if (!validateAccount(input.account)) staticReasons.push("account_config_invalid");
  if (!validateEntry(input.entry)) staticReasons.push("entry_command_invalid");
  staticReasons.push(...validateMarketDay(input));

  const inputDigest = digest(input);
  const entryParts = explicitInstant(input.entry.submitted_at)
    ? nyParts(input.entry.submitted_at)
    : null;
  if (
    entryParts === null ||
    entryParts.date !== input.dataset.trading_date ||
    Date.parse(input.entry.submitted_at) < Date.parse(input.dataset.session_open) ||
    Date.parse(input.entry.submitted_at) >
      Date.parse(input.dataset.session_close) + 59_999
  ) {
    staticReasons.push("entry_outside_session");
  }
  if (staticReasons.length > 0) return blocked(staticReasons, inputDigest);

  let nextCandleIndex = 0;
  let state: ReplayState;
  let events: InternalPaperReplayEvent[];
  if (options.checkpoint) {
    if (!validateCheckpoint(options.checkpoint, inputDigest, input.candles.length)) {
      return blocked(["replay_checkpoint_invalid"], inputDigest);
    }
    const expected = replayPrefix(input, options.checkpoint.next_candle_index);
    if (
      expected === null ||
      digest(expected.state) !== digest(options.checkpoint.state) ||
      digest(expected.events) !== digest(options.checkpoint.events)
    ) {
      return blocked(["replay_checkpoint_invalid"], inputDigest);
    }
    nextCandleIndex = options.checkpoint.next_candle_index;
    state = expected.state;
    events = expected.events;
  } else {
    const entry = entryState(input);
    if (entry.status === "blocked") {
      return blocked([entry.reason], inputDigest);
    }
    state = entry.state;
    events = [entry.event];
  }

  const pauseAt = options.pause_before_candle_index;
  if (
    pauseAt !== undefined &&
    pauseAt !== null &&
    (!Number.isSafeInteger(pauseAt) ||
      pauseAt < nextCandleIndex ||
      pauseAt > input.candles.length)
  ) {
    return blocked(["replay_checkpoint_invalid"], inputDigest);
  }

  for (let index = nextCandleIndex; index < input.candles.length; index += 1) {
    if (pauseAt === index) {
      const payload = checkpointPayload(inputDigest, index, state, events);
      const checkpoint: InternalPaperReplayCheckpoint = {
        ...payload,
        checkpoint_digest: digest(payload),
      };
      return {
        result_version: INTERNAL_PAPER_MARKET_REPLAY_RESULT_VERSION,
        replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
        status: "paused",
        reason_codes: [],
        input_digest: inputDigest,
        checkpoint,
        events,
        result_digest: null,
      };
    }
    const applied = applyCandle(input, state, input.candles[index], events.length + 1);
    if (applied.blocked_reason) {
      return blocked([applied.blocked_reason], inputDigest);
    }
    state = applied.state;
    if (applied.event) events.push(applied.event);
  }

  if (state.remaining_quantity !== 0 || state.closed_at === null) {
    return blocked(["market_day_incomplete"], inputDigest);
  }
  const sourceLineage = {
    dataset_id: input.dataset.dataset_id,
    dataset_version: input.dataset.dataset_version,
    point_in_time_as_of: input.dataset.point_in_time_as_of,
    source_reference: input.dataset.source_reference,
    entitlement_reference: input.dataset.entitlement_reference,
    retention_rights_reference: input.dataset.retention_rights_reference,
    corporate_action_reference: input.dataset.corporate_action_reference,
    session_calendar_reference: input.dataset.session_calendar_reference,
  } as const;
  const executionLineage = {
    deterministic_seed: input.deterministic_seed,
    account_config_version: input.account.account_config_version,
    entry_command_version: input.entry.command_version,
    entry_fill_model_version: input.entry.fill_model_version,
    exit_fill_model_version: "internal_paper_immediate_costed_exit_v1" as const,
    snapshot_fingerprint: input.entry.snapshot_fingerprint,
  } as const;
  const resultPayload = {
    result_version: INTERNAL_PAPER_MARKET_REPLAY_RESULT_VERSION,
    replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
    input_digest: inputDigest,
    events,
    final_state: state,
    source_lineage: sourceLineage,
    execution_lineage: executionLineage,
  };
  return {
    result_version: INTERNAL_PAPER_MARKET_REPLAY_RESULT_VERSION,
    replay_version: INTERNAL_PAPER_MARKET_REPLAY_VERSION,
    status: "completed",
    reason_codes: [],
    input_digest: inputDigest,
    checkpoint: null,
    events,
    final_state: state,
    source_lineage: sourceLineage,
    execution_lineage: executionLineage,
    result_digest: digest(resultPayload),
  };
}
