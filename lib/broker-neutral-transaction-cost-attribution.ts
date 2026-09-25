import { createHash } from "node:crypto";

export const TRANSACTION_COST_ATTRIBUTION_VERSION =
  "broker_neutral_transaction_cost_attribution_v1" as const;
export const TRANSACTION_COST_LEG_VERSION =
  "broker_neutral_transaction_cost_leg_v1" as const;

export type TransactionCostCohort =
  | "internal_paper_modeled"
  | "ibkr_paper_observed";
export type TransactionCostSide = "BUY" | "SELL";
export type TransactionCostLegRole = "entry" | "exit";
export type TransactionCostDisposition =
  | "filled"
  | "partially_filled"
  | "partially_filled_cancelled"
  | "cancelled"
  | "unfilled"
  | "rejected";

export type TransactionCostFill = Readonly<{
  fill_id: string;
  quantity: number;
  price_usd: string;
  executed_at: string;
}>;

export type TransactionCostLeg = Readonly<{
  leg_version: typeof TRANSACTION_COST_LEG_VERSION;
  leg_id: string;
  role: TransactionCostLegRole;
  side: TransactionCostSide;
  source_execution_digest: string;
  decision_observed_at: string;
  arrival_observed_at: string;
  order_submitted_at: string;
  terminal_observed_at: string;
  decision_reference_price_usd: string;
  arrival_reference_price_usd: string;
  arrival_benchmark_version: string;
  requested_quantity: number;
  disposition: TransactionCostDisposition;
  fills: readonly TransactionCostFill[];
  commission_usd: string;
  other_fees_usd: string;
  unfilled_opportunity_benchmark_price_usd: string | null;
  unfilled_opportunity_benchmark_observed_at: string | null;
  spread_cost_estimate_usd: string | null;
  spread_estimate_version: string | null;
  spread_cost_is_embedded_in_fill_price: true;
  market_impact_estimate_usd: string | null;
  market_impact_estimate_version: string | null;
  market_impact_is_embedded_in_fill_price: true;
}>;

export type BrokerNeutralTransactionCostAttributionInput = Readonly<{
  attribution_version: typeof TRANSACTION_COST_ATTRIBUTION_VERSION;
  attribution_id: string;
  owner_user_id: string;
  decision_fingerprint: string;
  symbol: string;
  position_direction: "long" | "short";
  evidence_cohort: TransactionCostCohort;
  benchmark_policy_version: string;
  cost_policy_version: string;
  decision_expected_gross_edge_usd: string | null;
  legs: readonly TransactionCostLeg[];
  attributed_at: string;
}>;

export type TransactionCostLegAttribution = Readonly<{
  leg_id: string;
  role: TransactionCostLegRole;
  side: TransactionCostSide;
  disposition: TransactionCostDisposition;
  requested_quantity: number;
  filled_quantity: number;
  unfilled_quantity: number;
  completion_ratio_bps: number;
  decision_to_arrival_latency_ms: number;
  arrival_to_first_fill_latency_ms: number | null;
  order_lifecycle_latency_ms: number;
  volume_weighted_fill_price_usd: string | null;
  decision_to_arrival_cost_usd: string;
  arrival_to_fill_cost_usd: string;
  explicit_fees_usd: string;
  unfilled_opportunity_cost_usd: string | null;
  attributable_cost_complete: boolean;
  total_attributable_cost_usd: string | null;
  spread_cost_estimate_usd: string | null;
  spread_cost_treatment: "embedded_disclosure_only" | "unavailable";
  market_impact_estimate_usd: string | null;
  market_impact_treatment: "embedded_disclosure_only" | "unavailable";
  source_execution_digest: string;
}>;

export type BrokerNeutralTransactionCostAttributionResult = Readonly<{
  attribution_version: typeof TRANSACTION_COST_ATTRIBUTION_VERSION;
  status: "completed" | "blocked";
  disposition: "attributed" | "attributed_with_incomplete_cost" | "blocked";
  reason_codes: readonly string[];
  attribution_id: string | null;
  owner_user_id: string | null;
  decision_fingerprint: string | null;
  symbol: string | null;
  evidence_cohort: TransactionCostCohort | null;
  requested_quantity: number;
  filled_quantity: number;
  unfilled_quantity: number;
  aggregate_completion_ratio_bps: number;
  legs: readonly TransactionCostLegAttribution[];
  expected_gross_edge_usd: string | null;
  total_attributable_cost_usd: string | null;
  expected_net_edge_after_attributable_cost_usd: string | null;
  round_trip_matched_quantity: number | null;
  round_trip_realized_gross_pnl_usd: string | null;
  round_trip_realized_net_pnl_usd: string | null;
  input_digest: string;
  result_digest: string;
  safety: Readonly<{
    supplied_evidence_only: true;
    source_authenticity_verified_by_this_function: false;
    modeled_and_observed_cohorts_mixed: false;
    spread_or_impact_subtracted_twice: false;
    missing_cost_invented: false;
    ranking_change_authorized: false;
    provider_request_authorized: false;
    database_write_authorized: false;
    broker_transport_present: false;
    broker_action_authorized: false;
  }>;
}>;

const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:._/-]{0,159}$/;
const SYMBOL_PATTERN = /^[A-Z][A-Z0-9.]{0,15}$/;
const DECIMAL_PATTERN = /^(?:0|[1-9]\d{0,11})(?:\.(\d{1,6}))?$/;
const MICROS = BigInt(1_000_000);
const MAX_QUANTITY = 1_000_000;
const MAX_LIFECYCLE_MS = 24 * 60 * 60 * 1_000;

const INPUT_KEYS = [
  "attributed_at",
  "attribution_id",
  "attribution_version",
  "benchmark_policy_version",
  "cost_policy_version",
  "decision_expected_gross_edge_usd",
  "decision_fingerprint",
  "evidence_cohort",
  "legs",
  "owner_user_id",
  "position_direction",
  "symbol",
];
const LEG_KEYS = [
  "arrival_benchmark_version",
  "arrival_observed_at",
  "arrival_reference_price_usd",
  "commission_usd",
  "decision_observed_at",
  "decision_reference_price_usd",
  "disposition",
  "fills",
  "leg_id",
  "leg_version",
  "market_impact_estimate_usd",
  "market_impact_estimate_version",
  "market_impact_is_embedded_in_fill_price",
  "order_submitted_at",
  "other_fees_usd",
  "requested_quantity",
  "role",
  "side",
  "source_execution_digest",
  "spread_cost_estimate_usd",
  "spread_cost_is_embedded_in_fill_price",
  "spread_estimate_version",
  "terminal_observed_at",
  "unfilled_opportunity_benchmark_observed_at",
  "unfilled_opportunity_benchmark_price_usd",
];
const FILL_KEYS = ["executed_at", "fill_id", "price_usd", "quantity"];

const SAFETY = Object.freeze({
  supplied_evidence_only: true as const,
  source_authenticity_verified_by_this_function: false as const,
  modeled_and_observed_cohorts_mixed: false as const,
  spread_or_impact_subtracted_twice: false as const,
  missing_cost_invented: false as const,
  ranking_change_authorized: false as const,
  provider_request_authorized: false as const,
  database_write_authorized: false as const,
  broker_transport_present: false as const,
  broker_action_authorized: false as const,
});

function canonical(value: unknown): unknown {
  if (typeof value === "number" && !Number.isFinite(value)) {
    return { __invalid_non_finite_number__: String(value) };
  }
  if (typeof value === "bigint") return value.toString();
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

function safeDigest(value: unknown) {
  try {
    return digest(value);
  } catch {
    return digest({ uninspectable_input: true });
  }
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const item of Object.values(value as Record<string, unknown>)) {
      deepFreeze(item);
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
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function identifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER_PATTERN.test(value);
}

function quantity(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0 && Number(value) <= MAX_QUANTITY;
}

function decimalMicros(value: unknown, allowZero = false) {
  if (typeof value !== "string" || !DECIMAL_PATTERN.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  const result = BigInt(whole) * MICROS + BigInt(fraction.padEnd(6, "0"));
  return allowZero || result > 0 ? result : null;
}

function signedDecimalMicros(value: unknown) {
  if (typeof value !== "string") return null;
  const negative = value.startsWith("-");
  const absolute = negative ? value.slice(1) : value;
  const parsed = decimalMicros(absolute, true);
  return parsed === null ? null : negative ? -parsed : parsed;
}

function formatMicros(value: bigint) {
  const sign = value < 0 ? "-" : "";
  const absolute = value < 0 ? -value : value;
  return `${sign}${absolute / MICROS}.${(absolute % MICROS)
    .toString()
    .padStart(6, "0")}`;
}

function roundQuotient(numerator: bigint, denominator: bigint) {
  if (denominator <= 0) throw new Error("denominator must be positive");
  const sign = numerator < 0 ? BigInt(-1) : BigInt(1);
  const absolute = numerator < 0 ? -numerator : numerator;
  return sign * ((absolute + denominator / BigInt(2)) / denominator);
}

function estimatePairValid(
  amount: unknown,
  version: unknown,
  embedded: unknown,
) {
  return (
    embedded === true &&
    ((amount === null && version === null) ||
      (decimalMicros(amount, true) !== null && identifier(version)))
  );
}

function fillValid(fill: unknown, submittedAt: number, terminalAt: number) {
  if (!exactRecord(fill, FILL_KEYS)) return false;
  const item = fill as Record<string, unknown>;
  if (!instant(item.executed_at)) return false;
  const executedAt = Date.parse(item.executed_at);
  return (
    identifier(item.fill_id) &&
    quantity(item.quantity) &&
    decimalMicros(item.price_usd) !== null &&
    executedAt >= submittedAt &&
    executedAt <= terminalAt
  );
}

function legValid(leg: unknown, attributedAt: number) {
  if (!exactRecord(leg, LEG_KEYS)) return false;
  const item = leg as Record<string, unknown>;
  if (
    !instant(item.decision_observed_at) ||
    !instant(item.arrival_observed_at) ||
    !instant(item.order_submitted_at) ||
    !instant(item.terminal_observed_at)
  ) {
    return false;
  }
  const decisionAt = Date.parse(item.decision_observed_at);
  const arrivalAt = Date.parse(item.arrival_observed_at);
  const submittedAt = Date.parse(item.order_submitted_at);
  const terminalAt = Date.parse(item.terminal_observed_at);
  if (
    decisionAt > arrivalAt ||
    arrivalAt > submittedAt ||
    submittedAt > terminalAt ||
    terminalAt > attributedAt ||
    terminalAt - decisionAt > MAX_LIFECYCLE_MS
  ) {
    return false;
  }
  if (!Array.isArray(item.fills) || item.fills.length > 1_000) return false;
  if (!item.fills.every((fill) => fillValid(fill, submittedAt, terminalAt))) return false;
  const fillIds = item.fills.map((fill) => (fill as TransactionCostFill).fill_id);
  if (new Set(fillIds).size !== fillIds.length) return false;
  const filled = item.fills.reduce(
    (sum, fill) => sum + (fill as TransactionCostFill).quantity,
    0,
  );
  if (!Number.isSafeInteger(filled) || filled > Number(item.requested_quantity)) return false;
  const disposition = item.disposition;
  const requested = Number(item.requested_quantity);
  const dispositionMatches =
    (disposition === "filled" && filled === requested) ||
    (disposition === "partially_filled" && filled > 0 && filled < requested) ||
    (disposition === "partially_filled_cancelled" && filled > 0 && filled < requested) ||
    (["cancelled", "unfilled", "rejected"].includes(String(disposition)) && filled === 0);
  const unfilled = requested - filled;
  const opportunityPairValid =
    (item.unfilled_opportunity_benchmark_price_usd === null &&
      item.unfilled_opportunity_benchmark_observed_at === null) ||
    (unfilled > 0 &&
      decimalMicros(item.unfilled_opportunity_benchmark_price_usd) !== null &&
      instant(item.unfilled_opportunity_benchmark_observed_at) &&
      Date.parse(item.unfilled_opportunity_benchmark_observed_at) >= terminalAt &&
      Date.parse(item.unfilled_opportunity_benchmark_observed_at) <= attributedAt);
  return (
    item.leg_version === TRANSACTION_COST_LEG_VERSION &&
    identifier(item.leg_id) &&
    ["entry", "exit"].includes(String(item.role)) &&
    ["BUY", "SELL"].includes(String(item.side)) &&
    typeof item.source_execution_digest === "string" &&
    SHA256_PATTERN.test(item.source_execution_digest) &&
    decimalMicros(item.decision_reference_price_usd) !== null &&
    decimalMicros(item.arrival_reference_price_usd) !== null &&
    identifier(item.arrival_benchmark_version) &&
    quantity(item.requested_quantity) &&
    dispositionMatches &&
    decimalMicros(item.commission_usd, true) !== null &&
    decimalMicros(item.other_fees_usd, true) !== null &&
    opportunityPairValid &&
    estimatePairValid(
      item.spread_cost_estimate_usd,
      item.spread_estimate_version,
      item.spread_cost_is_embedded_in_fill_price,
    ) &&
    estimatePairValid(
      item.market_impact_estimate_usd,
      item.market_impact_estimate_version,
      item.market_impact_is_embedded_in_fill_price,
    )
  );
}

function inputValid(value: unknown): value is BrokerNeutralTransactionCostAttributionInput {
  if (!exactRecord(value, INPUT_KEYS)) return false;
  const input = value as Record<string, unknown>;
  if (!instant(input.attributed_at) || !Array.isArray(input.legs)) return false;
  const attributedAt = Date.parse(input.attributed_at);
  if (input.legs.length < 1 || input.legs.length > 2) return false;
  if (!input.legs.every((leg) => legValid(leg, attributedAt))) return false;
  const legs = input.legs as TransactionCostLeg[];
  const expectedSides =
    input.position_direction === "long"
      ? (["BUY", "SELL"] as const)
      : (["SELL", "BUY"] as const);
  const shapeValid =
    legs[0].role === "entry" &&
    legs[0].side === expectedSides[0] &&
    (legs.length === 1 ||
      (legs[1].role === "exit" &&
        legs[1].side === expectedSides[1] &&
        Date.parse(legs[1].decision_observed_at) >=
          Date.parse(legs[0].terminal_observed_at)));
  return (
    input.attribution_version === TRANSACTION_COST_ATTRIBUTION_VERSION &&
    typeof input.attribution_id === "string" &&
    UUID_PATTERN.test(input.attribution_id) &&
    identifier(input.owner_user_id) &&
    typeof input.decision_fingerprint === "string" &&
    SHA256_PATTERN.test(input.decision_fingerprint) &&
    typeof input.symbol === "string" &&
    SYMBOL_PATTERN.test(input.symbol) &&
    ["long", "short"].includes(String(input.position_direction)) &&
    ["internal_paper_modeled", "ibkr_paper_observed"].includes(
      String(input.evidence_cohort),
    ) &&
    identifier(input.benchmark_policy_version) &&
    identifier(input.cost_policy_version) &&
    (input.decision_expected_gross_edge_usd === null ||
      decimalMicros(input.decision_expected_gross_edge_usd, true) !== null) &&
    new Set(legs.map((leg) => leg.leg_id)).size === legs.length &&
    shapeValid
  );
}

function attributeLeg(leg: TransactionCostLeg): TransactionCostLegAttribution {
  const requested = leg.requested_quantity;
  const filled = leg.fills.reduce((sum, fill) => sum + fill.quantity, 0);
  const unfilled = requested - filled;
  const sign = leg.side === "BUY" ? BigInt(1) : BigInt(-1);
  const decision = decimalMicros(leg.decision_reference_price_usd) as bigint;
  const arrival = decimalMicros(leg.arrival_reference_price_usd) as bigint;
  const fillNotional = leg.fills.reduce(
    (sum, fill) =>
      sum + (decimalMicros(fill.price_usd) as bigint) * BigInt(fill.quantity),
    BigInt(0),
  );
  const delayCost = sign * (arrival - decision) * BigInt(filled);
  const executionCost = sign * (fillNotional - arrival * BigInt(filled));
  const explicitFees =
    (decimalMicros(leg.commission_usd, true) as bigint) +
    (decimalMicros(leg.other_fees_usd, true) as bigint);
  const opportunity =
    unfilled === 0
      ? BigInt(0)
      : leg.unfilled_opportunity_benchmark_price_usd === null
        ? null
        : sign *
          ((decimalMicros(
            leg.unfilled_opportunity_benchmark_price_usd,
          ) as bigint) -
            decision) *
          BigInt(unfilled);
  const total =
    opportunity === null
      ? null
      : delayCost + executionCost + explicitFees + opportunity;
  const firstFillAt = leg.fills.reduce<number | null>((earliest, fill) => {
    const time = Date.parse(fill.executed_at);
    return earliest === null || time < earliest ? time : earliest;
  }, null);
  return {
    leg_id: leg.leg_id,
    role: leg.role,
    side: leg.side,
    disposition: leg.disposition,
    requested_quantity: requested,
    filled_quantity: filled,
    unfilled_quantity: unfilled,
    completion_ratio_bps: Math.floor((filled * 10_000) / requested),
    decision_to_arrival_latency_ms:
      Date.parse(leg.arrival_observed_at) - Date.parse(leg.decision_observed_at),
    arrival_to_first_fill_latency_ms:
      firstFillAt === null ? null : firstFillAt - Date.parse(leg.arrival_observed_at),
    order_lifecycle_latency_ms:
      Date.parse(leg.terminal_observed_at) - Date.parse(leg.order_submitted_at),
    volume_weighted_fill_price_usd:
      filled === 0 ? null : formatMicros(roundQuotient(fillNotional, BigInt(filled))),
    decision_to_arrival_cost_usd: formatMicros(delayCost),
    arrival_to_fill_cost_usd: formatMicros(executionCost),
    explicit_fees_usd: formatMicros(explicitFees),
    unfilled_opportunity_cost_usd:
      opportunity === null ? null : formatMicros(opportunity),
    attributable_cost_complete: total !== null,
    total_attributable_cost_usd: total === null ? null : formatMicros(total),
    spread_cost_estimate_usd: leg.spread_cost_estimate_usd,
    spread_cost_treatment:
      leg.spread_cost_estimate_usd === null
        ? "unavailable"
        : "embedded_disclosure_only",
    market_impact_estimate_usd: leg.market_impact_estimate_usd,
    market_impact_treatment:
      leg.market_impact_estimate_usd === null
        ? "unavailable"
        : "embedded_disclosure_only",
    source_execution_digest: leg.source_execution_digest,
  };
}

function result(
  input: unknown,
  values: Omit<
    BrokerNeutralTransactionCostAttributionResult,
    "attribution_version" | "input_digest" | "result_digest" | "safety"
  >,
) {
  const inputDigest = safeDigest(input);
  const withoutDigest = {
    attribution_version: TRANSACTION_COST_ATTRIBUTION_VERSION,
    ...values,
    input_digest: inputDigest,
    safety: SAFETY,
  };
  return deepFreeze({ ...withoutDigest, result_digest: digest(withoutDigest) });
}

function blocked(input: unknown, reason: string) {
  return result(input, {
    status: "blocked",
    disposition: "blocked",
    reason_codes: [reason],
    attribution_id: null,
    owner_user_id: null,
    decision_fingerprint: null,
    symbol: null,
    evidence_cohort: null,
    requested_quantity: 0,
    filled_quantity: 0,
    unfilled_quantity: 0,
    aggregate_completion_ratio_bps: 0,
    legs: [],
    expected_gross_edge_usd: null,
    total_attributable_cost_usd: null,
    expected_net_edge_after_attributable_cost_usd: null,
    round_trip_matched_quantity: null,
    round_trip_realized_gross_pnl_usd: null,
    round_trip_realized_net_pnl_usd: null,
  });
}

/**
 * Attributes only supplied, normalized evidence. Spread and market-impact
 * estimates are disclosure-only because their economic effect is already in
 * the observed or modeled fill price. Missing opportunity evidence stays null.
 */
export function attributeBrokerNeutralTransactionCosts(
  input: unknown,
): BrokerNeutralTransactionCostAttributionResult {
  if (!inputValid(input)) return blocked(input, "invalid_attribution_input");

  const legs = input.legs.map(attributeLeg);
  const requested = legs.reduce((sum, leg) => sum + leg.requested_quantity, 0);
  const filled = legs.reduce((sum, leg) => sum + leg.filled_quantity, 0);
  const unfilled = legs.reduce((sum, leg) => sum + leg.unfilled_quantity, 0);
  const allCostsComplete = legs.every((leg) => leg.attributable_cost_complete);
  const totalCost = allCostsComplete
    ? legs.reduce(
        (sum, leg) =>
          sum + (signedDecimalMicros(leg.total_attributable_cost_usd) as bigint),
        BigInt(0),
      )
    : null;
  const expectedGross =
    input.decision_expected_gross_edge_usd === null
      ? null
      : (decimalMicros(input.decision_expected_gross_edge_usd, true) as bigint);
  const expectedNet =
    expectedGross === null || totalCost === null ? null : expectedGross - totalCost;

  let matchedQuantity: number | null = null;
  let realizedGross: bigint | null = null;
  let realizedNet: bigint | null = null;
  if (input.legs.length === 2) {
    const [entry, exit] = input.legs;
    const entryResult = legs[0];
    const exitResult = legs[1];
    if (
      entryResult.filled_quantity > 0 &&
      entryResult.filled_quantity === exitResult.filled_quantity
    ) {
      matchedQuantity = entryResult.filled_quantity;
      const entryNotional = entry.fills.reduce(
        (sum, fill) =>
          sum + (decimalMicros(fill.price_usd) as bigint) * BigInt(fill.quantity),
        BigInt(0),
      );
      const exitNotional = exit.fills.reduce(
        (sum, fill) =>
          sum + (decimalMicros(fill.price_usd) as bigint) * BigInt(fill.quantity),
        BigInt(0),
      );
      realizedGross =
        input.position_direction === "long"
          ? exitNotional - entryNotional
          : entryNotional - exitNotional;
      const fees = legs.reduce(
        (sum, leg) =>
          sum + (decimalMicros(leg.explicit_fees_usd, true) as bigint),
        BigInt(0),
      );
      realizedNet = realizedGross - fees;
    }
  }

  const reasons = allCostsComplete
    ? ["supplied_execution_costs_attributed"]
    : ["unfilled_opportunity_benchmark_missing"];
  if (input.legs.length === 2 && matchedQuantity === null) {
    reasons.push("round_trip_quantities_not_fully_matched");
  }
  return result(input, {
    status: "completed",
    disposition: allCostsComplete
      ? "attributed"
      : "attributed_with_incomplete_cost",
    reason_codes: reasons,
    attribution_id: input.attribution_id,
    owner_user_id: input.owner_user_id,
    decision_fingerprint: input.decision_fingerprint,
    symbol: input.symbol,
    evidence_cohort: input.evidence_cohort,
    requested_quantity: requested,
    filled_quantity: filled,
    unfilled_quantity: unfilled,
    aggregate_completion_ratio_bps: Math.floor((filled * 10_000) / requested),
    legs,
    expected_gross_edge_usd:
      expectedGross === null ? null : formatMicros(expectedGross),
    total_attributable_cost_usd:
      totalCost === null ? null : formatMicros(totalCost),
    expected_net_edge_after_attributable_cost_usd:
      expectedNet === null ? null : formatMicros(expectedNet),
    round_trip_matched_quantity: matchedQuantity,
    round_trip_realized_gross_pnl_usd:
      realizedGross === null ? null : formatMicros(realizedGross),
    round_trip_realized_net_pnl_usd:
      realizedNet === null ? null : formatMicros(realizedNet),
  });
}
