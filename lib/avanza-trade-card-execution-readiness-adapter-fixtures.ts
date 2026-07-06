import {
  buildAvanzaTradeCardExecutionReadinessAdapter,
  type AvanzaTradeCardExecutionReadinessAdapterResult,
  type AvanzaTradeCardExecutionReadinessSeverity,
} from "./avanza-trade-card-execution-readiness-adapter";
import {
  avanzaPassiveTradeExecutionReadinessFixtures,
} from "./avanza-passive-trade-execution-readiness-fixtures";

export type AvanzaTradeCardExecutionReadinessAdapterFixtureId =
  | "recommendation_buy_ready_badge"
  | "live_position_sell_exit_ready_badge"
  | "incomplete_profile_badge"
  | "missing_ticker_badge"
  | "missing_quantity_badge"
  | "missing_limit_price_badge"
  | "market_order_blocked_badge"
  | "local_dev_only_badge"
  | "final_click_human_only_badge"
  | "order_submission_forbidden_badge"
  | "no_api_route_wiring_badge"
  | "production_not_ready_badge";

export type AvanzaTradeCardExecutionReadinessAdapterFixture = {
  fixtureId: AvanzaTradeCardExecutionReadinessAdapterFixtureId;
  label: string;
  expectedSeverity: AvanzaTradeCardExecutionReadinessSeverity;
  result: AvanzaTradeCardExecutionReadinessAdapterResult;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

function passiveFixtureModel(fixtureId: string) {
  const fixture = avanzaPassiveTradeExecutionReadinessFixtures.find(
    (item) => item.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing passive trade readiness fixture: ${fixtureId}`);
  }

  return fixture.model;
}

function fixture(
  fixtureId: AvanzaTradeCardExecutionReadinessAdapterFixtureId,
  label: string,
  expectedSeverity: AvanzaTradeCardExecutionReadinessSeverity,
  passiveFixtureId: string,
): AvanzaTradeCardExecutionReadinessAdapterFixture {
  return {
    fixtureId,
    label,
    expectedSeverity,
    result: buildAvanzaTradeCardExecutionReadinessAdapter({
      now: fixtureNow,
      readinessModel: passiveFixtureModel(passiveFixtureId),
    }),
  };
}

export const avanzaTradeCardExecutionReadinessAdapterFixtures:
  AvanzaTradeCardExecutionReadinessAdapterFixture[] = [
    fixture(
      "recommendation_buy_ready_badge",
      "Recommendation BUY ready badge",
      "success",
      "recommendation_buy_ready_passive",
    ),
    fixture(
      "live_position_sell_exit_ready_badge",
      "Live-position SELL exit ready badge",
      "success",
      "live_position_sell_exit_ready_passive",
    ),
    fixture(
      "incomplete_profile_badge",
      "Incomplete profile badge",
      "warning",
      "incomplete_profile",
    ),
    fixture("missing_ticker_badge", "Missing ticker badge", "blocked", "missing_ticker"),
    fixture(
      "missing_quantity_badge",
      "Missing quantity badge",
      "blocked",
      "missing_quantity",
    ),
    fixture(
      "missing_limit_price_badge",
      "Missing limit price badge",
      "blocked",
      "missing_limit_price",
    ),
    fixture(
      "market_order_blocked_badge",
      "Market order blocked badge",
      "danger",
      "market_order_blocked",
    ),
    fixture(
      "local_dev_only_badge",
      "Local-dev only badge",
      "info",
      "local_dev_only_warning",
    ),
    fixture(
      "final_click_human_only_badge",
      "Final click human-only badge",
      "danger",
      "final_click_forbidden",
    ),
    fixture(
      "order_submission_forbidden_badge",
      "Order submission forbidden badge",
      "danger",
      "order_submission_forbidden",
    ),
    fixture(
      "no_api_route_wiring_badge",
      "No API route wiring badge",
      "danger",
      "api_route_wiring_forbidden",
    ),
    fixture(
      "production_not_ready_badge",
      "Production not ready badge",
      "danger",
      "production_not_ready",
    ),
  ];
