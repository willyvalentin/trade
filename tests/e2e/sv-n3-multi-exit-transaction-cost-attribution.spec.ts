import { expect, test } from "@playwright/test";

import { TRANSACTION_COST_LEG_VERSION, type TransactionCostLeg } from "@/lib/broker-neutral-transaction-cost-attribution";
import {
  MULTI_EXIT_TRANSACTION_COST_ATTRIBUTION_VERSION,
  attributeBrokerNeutralMultiExitTransactionCosts,
  type BrokerNeutralMultiExitTransactionCostAttributionInput,
} from "@/lib/broker-neutral-multi-exit-transaction-cost-attribution";

function entryLeg(overrides: Partial<TransactionCostLeg> = {}): TransactionCostLeg {
  return {
    leg_version: TRANSACTION_COST_LEG_VERSION,
    leg_id: "entry-leg-001",
    role: "entry",
    side: "BUY",
    source_execution_digest: "a".repeat(64),
    decision_observed_at: "2026-09-25T14:30:00.000Z",
    arrival_observed_at: "2026-09-25T14:30:00.100Z",
    order_submitted_at: "2026-09-25T14:30:00.200Z",
    terminal_observed_at: "2026-09-25T14:30:01.000Z",
    decision_reference_price_usd: "100.000000",
    arrival_reference_price_usd: "100.100000",
    arrival_benchmark_version: "quote_midpoint_v1",
    requested_quantity: 10,
    disposition: "filled",
    fills: [
      { fill_id: "entry-fill-001", quantity: 6, price_usd: "100.150000", executed_at: "2026-09-25T14:30:00.400Z" },
      { fill_id: "entry-fill-002", quantity: 4, price_usd: "100.200000", executed_at: "2026-09-25T14:30:00.600Z" },
    ],
    commission_usd: "1.000000",
    other_fees_usd: "0.200000",
    unfilled_opportunity_benchmark_price_usd: null,
    unfilled_opportunity_benchmark_observed_at: null,
    spread_cost_estimate_usd: "0.500000",
    spread_estimate_version: "quote_spread_estimate_v1",
    spread_cost_is_embedded_in_fill_price: true,
    market_impact_estimate_usd: "0.200000",
    market_impact_estimate_version: "impact_estimate_v1",
    market_impact_is_embedded_in_fill_price: true,
    ...overrides,
  };
}

function exitLeg(
  index: number,
  quantity: number,
  price: string,
  decisionPrice: string,
  arrivalPrice: string,
  commission: string,
  otherFees: string,
): TransactionCostLeg {
  const hour = 15 + index;
  const prefix = `2026-09-25T${String(hour).padStart(2, "0")}:00`;
  return {
    ...entryLeg(),
    leg_id: `exit-leg-00${index}`,
    role: "exit",
    side: "SELL",
    source_execution_digest: String(index).repeat(64),
    decision_observed_at: `${prefix}:00.000Z`,
    arrival_observed_at: `${prefix}:00.100Z`,
    order_submitted_at: `${prefix}:00.200Z`,
    terminal_observed_at: `${prefix}:01.000Z`,
    decision_reference_price_usd: decisionPrice,
    arrival_reference_price_usd: arrivalPrice,
    requested_quantity: quantity,
    fills: [{
      fill_id: `exit-fill-00${index}`,
      quantity,
      price_usd: price,
      executed_at: `${prefix}:00.500Z`,
    }],
    commission_usd: commission,
    other_fees_usd: otherFees,
  };
}

const exits = () => [
  exitLeg(1, 4, "101.800000", "102.000000", "101.900000", "0.400000", "0.100000"),
  exitLeg(2, 3, "102.500000", "102.700000", "102.600000", "0.300000", "0.100000"),
  exitLeg(3, 3, "99.000000", "99.200000", "99.100000", "0.200000", "0.100000"),
];

function input(
  overrides: Partial<BrokerNeutralMultiExitTransactionCostAttributionInput> = {},
): BrokerNeutralMultiExitTransactionCostAttributionInput {
  return {
    attribution_version: MULTI_EXIT_TRANSACTION_COST_ATTRIBUTION_VERSION,
    attribution_id: "33333333-3333-4333-8333-333333333333",
    owner_user_id: "owner-001",
    decision_fingerprint: "c".repeat(64),
    symbol: "AAPL",
    position_direction: "long",
    evidence_cohort: "internal_paper_modeled",
    benchmark_policy_version: "arrival_benchmark_policy_v2",
    cost_policy_version: "transaction_cost_policy_v2",
    decision_expected_gross_edge_usd: "20.000000",
    legs: [entryLeg(), ...exits()],
    attributed_at: "2026-09-25T20:00:00.000Z",
    ...overrides,
  };
}

test("attributes three ordered exits without duplicating entry cost or fees", () => {
  const result = attributeBrokerNeutralMultiExitTransactionCosts(input());

  expect(result).toMatchObject({
    status: "completed",
    disposition: "attributed",
    reason_codes: ["ordered_multi_exit_execution_costs_attributed"],
    entered_quantity: 10,
    exited_quantity: 10,
    remaining_open_quantity: 0,
    total_attributable_cost_usd: "6.100000",
    expected_net_edge_after_attributable_cost_usd: "13.900000",
    realized_gross_pnl_usd: "10.000000",
    realized_net_pnl_after_explicit_fees_usd: "7.600000",
    allocated_entry_fees_usd: "1.200000",
    remaining_entry_fees_usd: "0.000000",
    safety: {
      v1_semantics_mutated: false,
      fees_double_counted: false,
      over_exit_allowed: false,
      broker_action_authorized: false,
    },
  });
  expect(result.legs).toHaveLength(4);
});

test("allocates entry basis and fees proportionally while a position remains open", () => {
  const result = attributeBrokerNeutralMultiExitTransactionCosts(
    input({ legs: [entryLeg(), ...exits().slice(0, 2)] }),
  );

  expect(result).toMatchObject({
    status: "completed",
    reason_codes: [
      "ordered_multi_exit_execution_costs_attributed",
      "position_remains_open",
    ],
    entered_quantity: 10,
    exited_quantity: 7,
    remaining_open_quantity: 3,
    realized_gross_pnl_usd: "13.510000",
    realized_net_pnl_after_explicit_fees_usd: "11.770000",
    allocated_entry_fees_usd: "0.840000",
    remaining_entry_fees_usd: "0.360000",
  });
});

test("blocks an exit request that exceeds the remaining owned quantity", () => {
  const [first, second] = exits();
  const overExit = {
    ...second,
    requested_quantity: 7,
    fills: [{ ...second.fills[0], quantity: 7 }],
  };
  const result = attributeBrokerNeutralMultiExitTransactionCosts(
    input({ legs: [entryLeg(), { ...first, requested_quantity: 4 }, overExit] }),
  );

  expect(result).toMatchObject({
    status: "blocked",
    reason_codes: ["invalid_multi_exit_attribution_input"],
    exited_quantity: 0,
  });
});

test("blocks overlapping exit lifecycles", () => {
  const [first, second] = exits();
  const overlapping = {
    ...second,
    decision_observed_at: "2026-09-25T16:00:00.500Z",
    arrival_observed_at: "2026-09-25T16:00:00.600Z",
    order_submitted_at: "2026-09-25T16:00:00.700Z",
    terminal_observed_at: "2026-09-25T16:00:00.900Z",
    fills: [{ ...second.fills[0], executed_at: "2026-09-25T16:00:00.800Z" }],
  };
  const result = attributeBrokerNeutralMultiExitTransactionCosts(
    input({ legs: [entryLeg(), first, overlapping] }),
  );

  expect(result.status).toBe("blocked");
  expect(result.reason_codes).toEqual(["invalid_multi_exit_attribution_input"]);
});

test("keeps aggregate cost incomplete when a partial exit lacks opportunity evidence", () => {
  const partial = {
    ...exits()[0],
    requested_quantity: 4,
    disposition: "partially_filled_cancelled" as const,
    fills: [{ ...exits()[0].fills[0], quantity: 2 }],
  };
  const result = attributeBrokerNeutralMultiExitTransactionCosts(
    input({ legs: [entryLeg(), partial] }),
  );

  expect(result).toMatchObject({
    status: "completed",
    disposition: "attributed_with_incomplete_cost",
    reason_codes: ["unfilled_opportunity_benchmark_missing", "position_remains_open"],
    exited_quantity: 2,
    remaining_open_quantity: 8,
    total_attributable_cost_usd: null,
    expected_net_edge_after_attributable_cost_usd: null,
  });
});

test("uses the correct realized-PnL sign for a short position with multiple exits", () => {
  const shortEntry = entryLeg({
    side: "SELL",
    fills: [{
      fill_id: "short-entry-fill",
      quantity: 10,
      price_usd: "100.000000",
      executed_at: "2026-09-25T14:30:00.400Z",
    }],
    commission_usd: "0.000000",
    other_fees_usd: "0.000000",
  });
  const shortExits = exits().slice(0, 2).map((leg, index) => ({
    ...leg,
    side: "BUY" as const,
    requested_quantity: 5,
    decision_reference_price_usd: index === 0 ? "98.000000" : "102.000000",
    arrival_reference_price_usd: index === 0 ? "98.000000" : "102.000000",
    fills: [{
      ...leg.fills[0],
      quantity: 5,
      price_usd: index === 0 ? "98.000000" : "102.000000",
    }],
    commission_usd: "0.000000",
    other_fees_usd: "0.000000",
  }));
  const result = attributeBrokerNeutralMultiExitTransactionCosts(
    input({
      position_direction: "short",
      legs: [shortEntry, ...shortExits],
    }),
  );

  expect(result).toMatchObject({
    status: "completed",
    exited_quantity: 10,
    remaining_open_quantity: 0,
    realized_gross_pnl_usd: "0.000000",
    realized_net_pnl_after_explicit_fees_usd: "0.000000",
  });
});

test("is deterministic and immutable and fails closed on hostile input", () => {
  const request = input();
  const first = attributeBrokerNeutralMultiExitTransactionCosts(request);
  const second = attributeBrokerNeutralMultiExitTransactionCosts(structuredClone(request));

  expect(first).toEqual(second);
  expect(first.result_digest).toBe(second.result_digest);
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.legs)).toBe(true);
  expect(() => {
    Reflect.apply(Array.prototype.push, first.legs, [entryLeg()]);
  }).toThrow();

  const hostile = Object.defineProperty({}, "legs", {
    enumerable: true,
    get() {
      throw new Error("hostile accessor");
    },
  });
  expect(attributeBrokerNeutralMultiExitTransactionCosts(hostile)).toMatchObject({
    status: "blocked",
    reason_codes: ["invalid_multi_exit_attribution_input"],
  });
});
