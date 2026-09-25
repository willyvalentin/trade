import { createHash } from "node:crypto";

import {
  TRANSACTION_COST_ATTRIBUTION_VERSION,
  attributeBrokerNeutralTransactionCosts,
  validateBrokerNeutralTransactionCostLeg,
  type BrokerNeutralTransactionCostAttributionInput,
  type TransactionCostCohort,
  type TransactionCostLeg,
  type TransactionCostLegAttribution,
} from "@/lib/broker-neutral-transaction-cost-attribution";

export const MULTI_EXIT_TRANSACTION_COST_ATTRIBUTION_VERSION =
  "broker_neutral_multi_exit_transaction_cost_attribution_v2" as const;

export type BrokerNeutralMultiExitTransactionCostAttributionInput = Readonly<{
  attribution_version: typeof MULTI_EXIT_TRANSACTION_COST_ATTRIBUTION_VERSION;
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

export type BrokerNeutralMultiExitTransactionCostAttributionResult = Readonly<{
  attribution_version: typeof MULTI_EXIT_TRANSACTION_COST_ATTRIBUTION_VERSION;
  status: "completed" | "blocked";
  disposition: "attributed" | "attributed_with_incomplete_cost" | "blocked";
  reason_codes: readonly string[];
  attribution_id: string | null;
  owner_user_id: string | null;
  decision_fingerprint: string | null;
  symbol: string | null;
  evidence_cohort: TransactionCostCohort | null;
  entered_quantity: number;
  exited_quantity: number;
  remaining_open_quantity: number;
  legs: readonly TransactionCostLegAttribution[];
  expected_gross_edge_usd: string | null;
  total_attributable_cost_usd: string | null;
  expected_net_edge_after_attributable_cost_usd: string | null;
  realized_gross_pnl_usd: string | null;
  realized_net_pnl_after_explicit_fees_usd: string | null;
  allocated_entry_fees_usd: string | null;
  remaining_entry_fees_usd: string | null;
  input_digest: string;
  result_digest: string;
  safety: Readonly<{
    supplied_evidence_only: true;
    v1_semantics_mutated: false;
    source_authenticity_verified_by_this_function: false;
    modeled_and_observed_cohorts_mixed: false;
    fees_double_counted: false;
    over_exit_allowed: false;
    ranking_change_authorized: false;
    provider_request_authorized: false;
    database_write_authorized: false;
    broker_transport_present: false;
    broker_action_authorized: false;
  }>;
}>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:._/-]{0,159}$/;
const SYMBOL_PATTERN = /^[A-Z][A-Z0-9.]{0,15}$/;
const DECIMAL_PATTERN = /^-?(?:0|[1-9]\d{0,11})(?:\.(\d{1,6}))?$/;
const MICROS = BigInt(1_000_000);
const MAX_EXIT_LEGS = 64;
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
] as const;

const SAFETY = Object.freeze({
  supplied_evidence_only: true as const,
  v1_semantics_mutated: false as const,
  source_authenticity_verified_by_this_function: false as const,
  modeled_and_observed_cohorts_mixed: false as const,
  fees_double_counted: false as const,
  over_exit_allowed: false as const,
  ranking_change_authorized: false as const,
  provider_request_authorized: false as const,
  database_write_authorized: false as const,
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
  try {
    return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
  } catch {
    return createHash("sha256").update("uninspectable-input").digest("hex");
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

function identifier(value: unknown) {
  return typeof value === "string" && IDENTIFIER_PATTERN.test(value);
}

function instant(value: unknown) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function micros(value: string | null, allowNegative = false): bigint | null {
  if (value === null || !DECIMAL_PATTERN.test(value)) return null;
  if (!allowNegative && value.startsWith("-")) return null;
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [whole, fraction = ""] = unsigned.split(".");
  const scaled = BigInt(whole) * MICROS + BigInt(fraction.padEnd(6, "0"));
  return negative ? -scaled : scaled;
}

function formatMicros(value: bigint) {
  const negative = value < 0;
  const absolute = negative ? -value : value;
  const whole = absolute / MICROS;
  const fraction = (absolute % MICROS).toString().padStart(6, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

function roundQuotient(numerator: bigint, denominator: bigint) {
  const negative = numerator < 0;
  const absolute = negative ? -numerator : numerator;
  const rounded = (absolute + denominator / BigInt(2)) / denominator;
  return negative ? -rounded : rounded;
}

function v1Input(
  input: BrokerNeutralMultiExitTransactionCostAttributionInput,
  legs: readonly TransactionCostLeg[],
): BrokerNeutralTransactionCostAttributionInput {
  return {
    ...input,
    attribution_version: TRANSACTION_COST_ATTRIBUTION_VERSION,
    legs,
  };
}

function result(
  input: unknown,
  values: Omit<
    BrokerNeutralMultiExitTransactionCostAttributionResult,
    "attribution_version" | "input_digest" | "result_digest" | "safety"
  >,
) {
  const inputDigest = digest(input);
  const withoutDigest = {
    attribution_version: MULTI_EXIT_TRANSACTION_COST_ATTRIBUTION_VERSION,
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
    entered_quantity: 0,
    exited_quantity: 0,
    remaining_open_quantity: 0,
    legs: [],
    expected_gross_edge_usd: null,
    total_attributable_cost_usd: null,
    expected_net_edge_after_attributable_cost_usd: null,
    realized_gross_pnl_usd: null,
    realized_net_pnl_after_explicit_fees_usd: null,
    allocated_entry_fees_usd: null,
    remaining_entry_fees_usd: null,
  });
}

function inputValid(
  value: unknown,
): value is BrokerNeutralMultiExitTransactionCostAttributionInput {
  if (!exactRecord(value, INPUT_KEYS)) return false;
  const input = value as BrokerNeutralMultiExitTransactionCostAttributionInput;
  if (
    input.attribution_version !== MULTI_EXIT_TRANSACTION_COST_ATTRIBUTION_VERSION ||
    !UUID_PATTERN.test(input.attribution_id) ||
    !identifier(input.owner_user_id) ||
    !SHA256_PATTERN.test(input.decision_fingerprint) ||
    !SYMBOL_PATTERN.test(input.symbol) ||
    !["long", "short"].includes(input.position_direction) ||
    !["internal_paper_modeled", "ibkr_paper_observed"].includes(input.evidence_cohort) ||
    !identifier(input.benchmark_policy_version) ||
    !identifier(input.cost_policy_version) ||
    !instant(input.attributed_at) ||
    (input.decision_expected_gross_edge_usd !== null &&
      micros(input.decision_expected_gross_edge_usd) === null) ||
    !Array.isArray(input.legs) ||
    input.legs.length < 2 ||
    input.legs.length > MAX_EXIT_LEGS + 1 ||
    input.legs.some((leg) => !validateBrokerNeutralTransactionCostLeg(leg, input.attributed_at))
  ) {
    return false;
  }
  const expectedEntrySide = input.position_direction === "long" ? "BUY" : "SELL";
  const expectedExitSide = input.position_direction === "long" ? "SELL" : "BUY";
  const legs = input.legs as readonly TransactionCostLeg[];
  const [entry, ...exits] = legs;
  if (entry.role !== "entry" || entry.side !== expectedEntrySide) return false;
  if (new Set(legs.map((leg) => leg.leg_id)).size !== legs.length) return false;
  let previousTerminal = Date.parse(entry.terminal_observed_at);
  let remaining = entry.fills.reduce((sum, fill) => sum + fill.quantity, 0);
  if (remaining <= 0) return false;
  for (const exit of exits) {
    if (
      exit.role !== "exit" ||
      exit.side !== expectedExitSide ||
      Date.parse(exit.decision_observed_at) < previousTerminal ||
      exit.requested_quantity > remaining
    ) {
      return false;
    }
    const exited = exit.fills.reduce((sum, fill) => sum + fill.quantity, 0);
    remaining -= exited;
    previousTerminal = Date.parse(exit.terminal_observed_at);
  }
  return true;
}

/**
 * Attributes one filled entry followed by ordered exit lifecycles. V1 remains
 * unchanged; each leg reuses the exact v1 attribution math. Entry fees are
 * allocated to realized quantity once, so partial exits cannot double count.
 */
export function attributeBrokerNeutralMultiExitTransactionCosts(
  value: unknown,
): BrokerNeutralMultiExitTransactionCostAttributionResult {
  try {
    if (!inputValid(value)) return blocked(value, "invalid_multi_exit_attribution_input");
    const input = value;
    const [entry, ...exits] = input.legs;
    const entryAttribution = attributeBrokerNeutralTransactionCosts(v1Input(input, [entry]));
    if (entryAttribution.status !== "completed" || entryAttribution.legs.length !== 1) {
      return blocked(value, "entry_attribution_failed");
    }
    const attributedLegs: TransactionCostLegAttribution[] = [entryAttribution.legs[0]];
    for (const exit of exits) {
      const pair = attributeBrokerNeutralTransactionCosts(v1Input(input, [entry, exit]));
      if (pair.status !== "completed" || pair.legs.length !== 2) {
        return blocked(value, "exit_attribution_failed");
      }
      attributedLegs.push(pair.legs[1]);
    }

    const enteredQuantity = attributedLegs[0].filled_quantity;
    const exitedQuantity = attributedLegs
      .slice(1)
      .reduce((sum, leg) => sum + leg.filled_quantity, 0);
    const remainingQuantity = enteredQuantity - exitedQuantity;
    const allCostsComplete = attributedLegs.every((leg) => leg.attributable_cost_complete);
    const totalCost = allCostsComplete
      ? attributedLegs.reduce(
          (sum, leg) => sum + (micros(leg.total_attributable_cost_usd, true) as bigint),
          BigInt(0),
        )
      : null;
    const expectedGross =
      input.decision_expected_gross_edge_usd === null
        ? null
        : (micros(input.decision_expected_gross_edge_usd) as bigint);
    const expectedNet =
      expectedGross === null || totalCost === null ? null : expectedGross - totalCost;

    const entryFillNotional = entry.fills.reduce(
      (sum, fill) => sum + (micros(fill.price_usd) as bigint) * BigInt(fill.quantity),
      BigInt(0),
    );
    const allocatedEntryNotional = roundQuotient(
      entryFillNotional * BigInt(exitedQuantity),
      BigInt(enteredQuantity),
    );
    const exitNotional = exits.reduce(
      (sum, exit) =>
        sum +
        exit.fills.reduce(
          (legSum, fill) =>
            legSum + (micros(fill.price_usd) as bigint) * BigInt(fill.quantity),
          BigInt(0),
        ),
      BigInt(0),
    );
    const realizedGross =
      exitedQuantity === 0
        ? null
        : input.position_direction === "long"
          ? exitNotional - allocatedEntryNotional
          : allocatedEntryNotional - exitNotional;
    const entryFees = micros(attributedLegs[0].explicit_fees_usd) as bigint;
    const allocatedEntryFees = roundQuotient(
      entryFees * BigInt(exitedQuantity),
      BigInt(enteredQuantity),
    );
    const exitFees = attributedLegs.slice(1).reduce(
      (sum, leg) => sum + (micros(leg.explicit_fees_usd) as bigint),
      BigInt(0),
    );
    const realizedNet =
      realizedGross === null ? null : realizedGross - allocatedEntryFees - exitFees;

    const reasons = allCostsComplete
      ? ["ordered_multi_exit_execution_costs_attributed"]
      : ["unfilled_opportunity_benchmark_missing"];
    if (remainingQuantity > 0) reasons.push("position_remains_open");
    return result(value, {
      status: "completed",
      disposition: allCostsComplete ? "attributed" : "attributed_with_incomplete_cost",
      reason_codes: reasons,
      attribution_id: input.attribution_id,
      owner_user_id: input.owner_user_id,
      decision_fingerprint: input.decision_fingerprint,
      symbol: input.symbol,
      evidence_cohort: input.evidence_cohort,
      entered_quantity: enteredQuantity,
      exited_quantity: exitedQuantity,
      remaining_open_quantity: remainingQuantity,
      legs: attributedLegs,
      expected_gross_edge_usd:
        expectedGross === null ? null : formatMicros(expectedGross),
      total_attributable_cost_usd:
        totalCost === null ? null : formatMicros(totalCost),
      expected_net_edge_after_attributable_cost_usd:
        expectedNet === null ? null : formatMicros(expectedNet),
      realized_gross_pnl_usd:
        realizedGross === null ? null : formatMicros(realizedGross),
      realized_net_pnl_after_explicit_fees_usd:
        realizedNet === null ? null : formatMicros(realizedNet),
      allocated_entry_fees_usd: formatMicros(allocatedEntryFees),
      remaining_entry_fees_usd: formatMicros(entryFees - allocatedEntryFees),
    });
  } catch {
    return blocked(value, "multi_exit_attribution_input_unreadable");
  }
}
