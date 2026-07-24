import {
  buildAvanzaOrderTicketFieldPlan,
  type AvanzaOrderTicketFieldPlan,
  type AvanzaOrderTicketInputPackage,
  type AvanzaOrderTicketStatus,
} from "./avanza-order-ticket-field-contract";

export type AvanzaOrderTicketFieldContractFixtureId =
  | "disabled"
  | "incomplete_missing_ticker"
  | "incomplete_missing_quantity"
  | "incomplete_missing_limit_price"
  | "ready_buy_limit_order_field_plan"
  | "ready_sell_limit_order_field_plan"
  | "market_order_blocked"
  | "invalid_quantity_blocked"
  | "invalid_limit_price_blocked"
  | "buy_final_click_forbidden"
  | "sell_final_click_forbidden"
  | "order_submission_forbidden"
  | "bankid_forbidden"
  | "cookie_session_forbidden"
  | "error"
  | "unknown";

export type AvanzaOrderTicketFieldContractFixture = {
  fixtureId: AvanzaOrderTicketFieldContractFixtureId;
  label: string;
  expectedStatus: AvanzaOrderTicketStatus;
  input: AvanzaOrderTicketInputPackage;
  fieldPlan: AvanzaOrderTicketFieldPlan;
};

function fixture(
  fixtureId: AvanzaOrderTicketFieldContractFixtureId,
  label: string,
  expectedStatus: AvanzaOrderTicketStatus,
  input: AvanzaOrderTicketInputPackage,
): AvanzaOrderTicketFieldContractFixture {
  const fieldPlan = buildAvanzaOrderTicketFieldPlan({
    packageId: fixtureId,
    createdAt: "2026-07-06T12:00:00.000Z",
    source: "fixture",
    timeInForce: "day",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    input,
    fieldPlan,
  };
}

const readyBuyInput: AvanzaOrderTicketInputPackage = {
  accountType: "ISK",
  customerType: "Privat",
  enabled: true,
  instrumentName: "Fixture Instrument",
  limitPrice: 125.5,
  orderType: "limit",
  quantity: 10,
  recommendationId: "fixture-recommendation-buy",
  side: "buy",
  ticker: "FIXB",
};

const readySellInput: AvanzaOrderTicketInputPackage = {
  accountType: "ISK",
  customerType: "Privat",
  enabled: true,
  instrumentName: "Fixture Instrument",
  limitPrice: 130.25,
  orderType: "limit",
  positionId: "fixture-position-sell",
  quantity: 8,
  side: "sell",
  ticker: "FIXS",
};

export const avanzaOrderTicketFieldContractFixtures:
  AvanzaOrderTicketFieldContractFixture[] = [
    fixture("disabled", "Disabled order ticket field plan", "disabled", {
      enabled: false,
    }),
    fixture("incomplete_missing_ticker", "Incomplete missing ticker", "incomplete", {
      ...readyBuyInput,
      ticker: undefined,
    }),
    fixture(
      "incomplete_missing_quantity",
      "Incomplete missing quantity",
      "incomplete",
      {
        ...readyBuyInput,
        quantity: undefined,
      },
    ),
    fixture(
      "incomplete_missing_limit_price",
      "Incomplete missing limit price",
      "incomplete",
      {
        ...readyBuyInput,
        limitPrice: undefined,
      },
    ),
    fixture(
      "ready_buy_limit_order_field_plan",
      "Ready BUY limit order field plan",
      "field_mapping_ready",
      readyBuyInput,
    ),
    fixture(
      "ready_sell_limit_order_field_plan",
      "Ready SELL limit order field plan",
      "field_mapping_ready",
      readySellInput,
    ),
    fixture("market_order_blocked", "Market order blocked", "blocked", {
      ...readyBuyInput,
      orderType: "market_forbidden",
    }),
    fixture("invalid_quantity_blocked", "Invalid quantity blocked", "blocked", {
      ...readyBuyInput,
      quantity: 0,
    }),
    fixture(
      "invalid_limit_price_blocked",
      "Invalid limit price blocked",
      "blocked",
      {
        ...readyBuyInput,
        limitPrice: 0,
      },
    ),
    fixture(
      "buy_final_click_forbidden",
      "BUY final click forbidden",
      "field_mapping_ready",
      readyBuyInput,
    ),
    fixture(
      "sell_final_click_forbidden",
      "SELL final click forbidden",
      "field_mapping_ready",
      readySellInput,
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "field_mapping_ready",
      readyBuyInput,
    ),
    fixture("bankid_forbidden", "BankID forbidden", "field_mapping_ready", {
      ...readyBuyInput,
      riskWarnings: ["BankID automation and bypass forbidden."],
    }),
    fixture(
      "cookie_session_forbidden",
      "Cookie/session forbidden",
      "field_mapping_ready",
      {
        ...readyBuyInput,
        riskWarnings: ["Cookie/session handling forbidden."],
      },
    ),
    fixture("error", "Error fixture", "error", {
      ...readyBuyInput,
      forceError: true,
    }),
    fixture("unknown", "Unknown fixture", "unknown", {
      ...readyBuyInput,
      forceUnknown: true,
    }),
  ];
