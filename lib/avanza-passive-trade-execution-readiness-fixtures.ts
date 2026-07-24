import {
  buildAvanzaPassiveTradeExecutionReadiness,
  type AvanzaPassiveTradeExecutionReadinessInput,
  type AvanzaPassiveTradeExecutionReadinessModel,
  type AvanzaPassiveTradeExecutionReadinessStatus,
} from "./avanza-passive-trade-execution-readiness";

export type AvanzaPassiveTradeExecutionReadinessFixtureId =
  | "recommendation_buy_ready_passive"
  | "live_position_sell_exit_ready_passive"
  | "missing_ticker"
  | "missing_quantity"
  | "missing_limit_price"
  | "incomplete_profile"
  | "market_order_blocked"
  | "local_dev_only_warning"
  | "settlement_modeled_after_execution"
  | "final_click_forbidden"
  | "order_submission_forbidden"
  | "trade_ui_wiring_forbidden"
  | "api_route_wiring_forbidden"
  | "production_not_ready";

export type AvanzaPassiveTradeExecutionReadinessFixture = {
  fixtureId: AvanzaPassiveTradeExecutionReadinessFixtureId;
  label: string;
  expectedStatus: AvanzaPassiveTradeExecutionReadinessStatus;
  expectedCanTheoreticallyPrepareOrder: boolean;
  model: AvanzaPassiveTradeExecutionReadinessModel;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const readyInput: AvanzaPassiveTradeExecutionReadinessInput = {
  instrumentName: "Nokia Oyj",
  instrumentSearchModeled: true,
  intent: "entry_buy",
  limitPrice: 58.4,
  loginModeled: true,
  orderPrepModeled: true,
  orderType: "limit",
  profileReady: true,
  quantity: 120,
  settlementModeled: true,
  side: "buy",
  source: "recommendation",
  ticker: "NOKIA",
};

function fixture(
  fixtureId: AvanzaPassiveTradeExecutionReadinessFixtureId,
  label: string,
  expectedStatus: AvanzaPassiveTradeExecutionReadinessStatus,
  input: AvanzaPassiveTradeExecutionReadinessInput,
): AvanzaPassiveTradeExecutionReadinessFixture {
  const model = buildAvanzaPassiveTradeExecutionReadiness({
    ...readyInput,
    ...input,
    now: fixtureNow,
    readinessId: `fixture-${fixtureId}`,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    expectedCanTheoreticallyPrepareOrder:
      expectedStatus === "ready_passive" && model.canTheoreticallyPrepareOrder,
    model,
  };
}

export const avanzaPassiveTradeExecutionReadinessFixtures:
  AvanzaPassiveTradeExecutionReadinessFixture[] = [
    fixture(
      "recommendation_buy_ready_passive",
      "Recommendation BUY ready passive",
      "ready_passive",
      {
        recommendationId: "rec-passive-buy-001",
        warnings: ["Entry BUY readiness modeled for future read-only card visibility."],
      },
    ),
    fixture(
      "live_position_sell_exit_ready_passive",
      "Live position SELL/exit ready passive",
      "ready_passive",
      {
        instrumentName: "Volvo B",
        intent: "exit_sell",
        limitPrice: 286.2,
        positionId: "position-passive-sell-001",
        quantity: 40,
        recommendationId: undefined,
        side: "sell",
        source: "live_position",
        ticker: "VOLV B",
        warnings: ["Exit SELL readiness modeled from a live-position-like fixture."],
      },
    ),
    fixture("missing_ticker", "Missing ticker", "missing_ticker", {
      ticker: undefined,
    }),
    fixture("missing_quantity", "Missing quantity", "missing_quantity", {
      quantity: undefined,
    }),
    fixture(
      "missing_limit_price",
      "Missing limit price",
      "missing_limit_price",
      {
        limitPrice: undefined,
      },
    ),
    fixture("incomplete_profile", "Incomplete profile", "incomplete_profile", {
      profileReady: false,
      warnings: ["Settings profile must be complete before readiness can be trusted."],
    }),
    fixture("market_order_blocked", "Market order blocked", "blocked", {
      orderType: "market_forbidden",
    }),
    fixture("local_dev_only_warning", "Local-dev only warning", "local_dev_only", {
      orderPrepModeled: false,
      warnings: ["Local-dev only metadata; no production readiness claim."],
    }),
    fixture(
      "settlement_modeled_after_execution",
      "Settlement modeled after execution",
      "ready_passive",
      {
        warnings: ["Settlement readiness is modeled after execution for review only."],
      },
    ),
    fixture("final_click_forbidden", "Final click forbidden", "blocked", {
      blockers: ["Final KÖP/SÄLJ click is human-only."],
    }),
    fixture("order_submission_forbidden", "Order submission forbidden", "blocked", {
      blockers: ["Order submission by the agent is forbidden."],
    }),
    fixture("trade_ui_wiring_forbidden", "Trade UI wiring forbidden", "blocked", {
      blockers: ["Trade UI execution wiring is forbidden in this layer."],
    }),
    fixture("api_route_wiring_forbidden", "API route wiring forbidden", "blocked", {
      blockers: ["API route wiring is forbidden in this layer."],
    }),
    fixture("production_not_ready", "Production not ready", "blocked", {
      blockers: ["Production readiness is not claimed."],
    }),
  ];
