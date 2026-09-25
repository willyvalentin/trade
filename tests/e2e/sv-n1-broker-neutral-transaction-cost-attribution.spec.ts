import { expect, test } from "@playwright/test";

import {
  TRANSACTION_COST_ATTRIBUTION_VERSION,
  TRANSACTION_COST_LEG_VERSION,
  attributeBrokerNeutralTransactionCosts,
  type BrokerNeutralTransactionCostAttributionInput,
  type TransactionCostLeg,
} from "@/lib/broker-neutral-transaction-cost-attribution";

function entryLeg(
  overrides: Partial<TransactionCostLeg> = {},
): TransactionCostLeg {
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
      {
        fill_id: "fill-entry-001",
        quantity: 6,
        price_usd: "100.150000",
        executed_at: "2026-09-25T14:30:00.400Z",
      },
      {
        fill_id: "fill-entry-002",
        quantity: 4,
        price_usd: "100.200000",
        executed_at: "2026-09-25T14:30:00.600Z",
      },
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
  overrides: Partial<TransactionCostLeg> = {},
): TransactionCostLeg {
  return {
    ...entryLeg(),
    leg_id: "exit-leg-001",
    role: "exit",
    side: "SELL",
    source_execution_digest: "b".repeat(64),
    decision_observed_at: "2026-09-25T19:45:00.000Z",
    arrival_observed_at: "2026-09-25T19:45:00.100Z",
    order_submitted_at: "2026-09-25T19:45:00.200Z",
    terminal_observed_at: "2026-09-25T19:45:01.000Z",
    decision_reference_price_usd: "102.000000",
    arrival_reference_price_usd: "101.900000",
    fills: [
      {
        fill_id: "fill-exit-001",
        quantity: 10,
        price_usd: "101.800000",
        executed_at: "2026-09-25T19:45:00.500Z",
      },
    ],
    ...overrides,
  };
}

function input(
  overrides: Partial<BrokerNeutralTransactionCostAttributionInput> = {},
): BrokerNeutralTransactionCostAttributionInput {
  return {
    attribution_version: TRANSACTION_COST_ATTRIBUTION_VERSION,
    attribution_id: "11111111-1111-4111-8111-111111111111",
    owner_user_id: "owner-001",
    decision_fingerprint: "c".repeat(64),
    symbol: "AAPL",
    position_direction: "long",
    evidence_cohort: "ibkr_paper_observed",
    benchmark_policy_version: "arrival_benchmark_policy_v1",
    cost_policy_version: "transaction_cost_policy_v1",
    decision_expected_gross_edge_usd: "10.000000",
    legs: [entryLeg()],
    attributed_at: "2026-09-25T20:00:00.000Z",
    ...overrides,
  };
}

test("attributes decision delay, fill shortfall and explicit fees without double-counting spread or impact", () => {
  const result = attributeBrokerNeutralTransactionCosts(input());

  expect(result).toMatchObject({
    status: "completed",
    disposition: "attributed",
    reason_codes: ["supplied_execution_costs_attributed"],
    requested_quantity: 10,
    filled_quantity: 10,
    unfilled_quantity: 0,
    aggregate_completion_ratio_bps: 10_000,
    expected_gross_edge_usd: "10.000000",
    total_attributable_cost_usd: "2.900000",
    expected_net_edge_after_attributable_cost_usd: "7.100000",
    safety: {
      supplied_evidence_only: true,
      spread_or_impact_subtracted_twice: false,
      missing_cost_invented: false,
      broker_transport_present: false,
      broker_action_authorized: false,
    },
  });
  expect(result.legs[0]).toEqual(
    expect.objectContaining({
      completion_ratio_bps: 10_000,
      decision_to_arrival_latency_ms: 100,
      arrival_to_first_fill_latency_ms: 300,
      order_lifecycle_latency_ms: 800,
      volume_weighted_fill_price_usd: "100.170000",
      decision_to_arrival_cost_usd: "1.000000",
      arrival_to_fill_cost_usd: "0.700000",
      explicit_fees_usd: "1.200000",
      unfilled_opportunity_cost_usd: "0.000000",
      total_attributable_cost_usd: "2.900000",
      spread_cost_estimate_usd: "0.500000",
      spread_cost_treatment: "embedded_disclosure_only",
      market_impact_estimate_usd: "0.200000",
      market_impact_treatment: "embedded_disclosure_only",
    }),
  );
});

test("keeps partial-fill total and net edge unavailable when missed-opportunity evidence is missing", () => {
  const partial = entryLeg({
    disposition: "partially_filled_cancelled",
    fills: [
      {
        fill_id: "fill-entry-001",
        quantity: 6,
        price_usd: "100.150000",
        executed_at: "2026-09-25T14:30:00.400Z",
      },
    ],
  });
  const result = attributeBrokerNeutralTransactionCosts(input({ legs: [partial] }));

  expect(result).toMatchObject({
    status: "completed",
    disposition: "attributed_with_incomplete_cost",
    reason_codes: ["unfilled_opportunity_benchmark_missing"],
    filled_quantity: 6,
    unfilled_quantity: 4,
    aggregate_completion_ratio_bps: 6_000,
    total_attributable_cost_usd: null,
    expected_net_edge_after_attributable_cost_usd: null,
  });
  expect(result.legs[0]).toMatchObject({
    attributable_cost_complete: false,
    unfilled_opportunity_cost_usd: null,
    total_attributable_cost_usd: null,
  });
});

test("attributes supplied missed opportunity for a partial fill", () => {
  const partial = entryLeg({
    disposition: "partially_filled_cancelled",
    fills: [
      {
        fill_id: "fill-entry-001",
        quantity: 6,
        price_usd: "100.150000",
        executed_at: "2026-09-25T14:30:00.400Z",
      },
    ],
    unfilled_opportunity_benchmark_price_usd: "101.000000",
    unfilled_opportunity_benchmark_observed_at: "2026-09-25T14:31:00.000Z",
  });
  const result = attributeBrokerNeutralTransactionCosts(input({ legs: [partial] }));

  expect(result.legs[0]).toMatchObject({
    decision_to_arrival_cost_usd: "0.600000",
    arrival_to_fill_cost_usd: "0.300000",
    explicit_fees_usd: "1.200000",
    unfilled_opportunity_cost_usd: "4.000000",
    total_attributable_cost_usd: "6.100000",
  });
  expect(result.expected_net_edge_after_attributable_cost_usd).toBe("3.900000");
});

test("reconciles a fully matched long round trip to gross and net realized PnL", () => {
  const result = attributeBrokerNeutralTransactionCosts(
    input({ legs: [entryLeg(), exitLeg()] }),
  );

  expect(result).toMatchObject({
    requested_quantity: 20,
    filled_quantity: 20,
    total_attributable_cost_usd: "6.100000",
    expected_net_edge_after_attributable_cost_usd: "3.900000",
    round_trip_matched_quantity: 10,
    round_trip_realized_gross_pnl_usd: "16.300000",
    round_trip_realized_net_pnl_usd: "13.900000",
  });
  expect(result.legs[1]).toMatchObject({
    decision_to_arrival_cost_usd: "1.000000",
    arrival_to_fill_cost_usd: "1.000000",
    total_attributable_cost_usd: "3.200000",
  });
});

test("uses side-aware cost signs for a short entry", () => {
  const shortEntry = entryLeg({
    side: "SELL",
    decision_reference_price_usd: "100.000000",
    arrival_reference_price_usd: "99.900000",
    fills: [
      {
        fill_id: "short-entry-fill",
        quantity: 10,
        price_usd: "99.800000",
        executed_at: "2026-09-25T14:30:00.400Z",
      },
    ],
  });
  const result = attributeBrokerNeutralTransactionCosts(
    input({ position_direction: "short", legs: [shortEntry] }),
  );

  expect(result.legs[0]).toMatchObject({
    decision_to_arrival_cost_usd: "1.000000",
    arrival_to_fill_cost_usd: "1.000000",
    total_attributable_cost_usd: "3.200000",
  });
});

test("preserves price improvement as negative cost when aggregating", () => {
  const improved = entryLeg({
    arrival_reference_price_usd: "99.900000",
    fills: [
      {
        fill_id: "improved-entry-fill",
        quantity: 10,
        price_usd: "99.800000",
        executed_at: "2026-09-25T14:30:00.400Z",
      },
    ],
    commission_usd: "0.000000",
    other_fees_usd: "0.000000",
    spread_cost_estimate_usd: null,
    spread_estimate_version: null,
    market_impact_estimate_usd: null,
    market_impact_estimate_version: null,
  });
  const result = attributeBrokerNeutralTransactionCosts(
    input({
      decision_expected_gross_edge_usd: "1.000000",
      legs: [improved],
    }),
  );

  expect(result).toMatchObject({
    total_attributable_cost_usd: "-2.000000",
    expected_net_edge_after_attributable_cost_usd: "3.000000",
  });
  expect(result.legs[0]).toMatchObject({
    decision_to_arrival_cost_usd: "-1.000000",
    arrival_to_fill_cost_usd: "-1.000000",
    spread_cost_treatment: "unavailable",
    market_impact_treatment: "unavailable",
  });
});

test("reports unmatched round-trip quantity instead of fabricating realized PnL", () => {
  const partialExit = exitLeg({
    disposition: "partially_filled",
    fills: [
      {
        fill_id: "fill-exit-001",
        quantity: 6,
        price_usd: "101.800000",
        executed_at: "2026-09-25T19:45:00.500Z",
      },
    ],
    unfilled_opportunity_benchmark_price_usd: "101.500000",
    unfilled_opportunity_benchmark_observed_at: "2026-09-25T19:46:00.000Z",
  });
  const result = attributeBrokerNeutralTransactionCosts(
    input({ legs: [entryLeg(), partialExit] }),
  );

  expect(result.reason_codes).toContain("round_trip_quantities_not_fully_matched");
  expect(result.round_trip_matched_quantity).toBeNull();
  expect(result.round_trip_realized_gross_pnl_usd).toBeNull();
  expect(result.round_trip_realized_net_pnl_usd).toBeNull();
});

test("fails closed on inconsistent lifecycle, disposition, direction or duplicate evidence", () => {
  const invalidLegs: TransactionCostLeg[] = [
    entryLeg({ arrival_observed_at: "2026-09-25T14:29:59.999Z" }),
    entryLeg({ disposition: "filled", fills: [] }),
    entryLeg({ side: "SELL" }),
    entryLeg({
      fills: [
        {
          fill_id: "duplicate-fill",
          quantity: 6,
          price_usd: "100.150000",
          executed_at: "2026-09-25T14:30:00.400Z",
        },
        {
          fill_id: "duplicate-fill",
          quantity: 4,
          price_usd: "100.200000",
          executed_at: "2026-09-25T14:30:00.600Z",
        },
      ],
    }),
  ];
  for (const leg of invalidLegs) {
    expect(attributeBrokerNeutralTransactionCosts(input({ legs: [leg] }))).toMatchObject({
      status: "blocked",
      disposition: "blocked",
      reason_codes: ["invalid_attribution_input"],
    });
  }
});

test("rejects stale estimate semantics and incomplete opportunity pairs", () => {
  for (const leg of [
    entryLeg({
      spread_cost_estimate_usd: "0.500000",
      spread_estimate_version: null,
    }),
    entryLeg({
      market_impact_is_embedded_in_fill_price: false as true,
    }),
    entryLeg({
      unfilled_opportunity_benchmark_price_usd: "101.000000",
      unfilled_opportunity_benchmark_observed_at: null,
    }),
  ]) {
    expect(attributeBrokerNeutralTransactionCosts(input({ legs: [leg] }))).toMatchObject({
      status: "blocked",
      reason_codes: ["invalid_attribution_input"],
    });
  }
});

test("rejects extra fields, accessors and non-finite quantities", () => {
  expect(
    attributeBrokerNeutralTransactionCosts({ ...input(), api_key: "forbidden" }),
  ).toMatchObject({ reason_codes: ["invalid_attribution_input"] });

  const accessor = Object.create(null, {
    ...Object.fromEntries(
      Object.entries(input()).map(([key, value]) => [
        key,
        { enumerable: true, value },
      ]),
    ),
    attributed_at: {
      enumerable: true,
      get() {
        throw new Error("must not execute");
      },
    },
  });
  expect(attributeBrokerNeutralTransactionCosts(accessor)).toMatchObject({
    reason_codes: ["invalid_attribution_input"],
  });

  expect(
    attributeBrokerNeutralTransactionCosts(
      input({
        legs: [entryLeg({ requested_quantity: Number.NaN })],
      }),
    ),
  ).toMatchObject({ reason_codes: ["invalid_attribution_input"] });
});

test("is deterministic, immutable and keeps cohorts explicit", () => {
  const request = input({ evidence_cohort: "internal_paper_modeled" });
  const before = JSON.stringify(request);
  const first = attributeBrokerNeutralTransactionCosts(request);
  const second = attributeBrokerNeutralTransactionCosts(request);

  expect(second).toEqual(first);
  expect(JSON.stringify(request)).toBe(before);
  expect(first.evidence_cohort).toBe("internal_paper_modeled");
  expect(first.input_digest).toMatch(/^[0-9a-f]{64}$/);
  expect(first.result_digest).toMatch(/^[0-9a-f]{64}$/);
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.legs)).toBe(true);
  expect(Object.isFrozen(first.safety)).toBe(true);
});
