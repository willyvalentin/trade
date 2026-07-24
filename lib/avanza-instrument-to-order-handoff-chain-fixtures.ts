import {
  buildAvanzaInstrumentToOrderHandoffChain,
  type AvanzaExecutionPackageForOrderHandoff,
  type AvanzaInstrumentToOrderHandoffChain,
  type AvanzaInstrumentToOrderHandoffChainInput,
  type AvanzaInstrumentToOrderHandoffChainStatus,
} from "./avanza-instrument-to-order-handoff-chain";
import {
  avanzaInstrumentSearchActionContractFixtures,
} from "./avanza-instrument-search-action-contract-fixtures";
import {
  avanzaInstrumentSearchRouteContractFixtures,
} from "./avanza-instrument-search-route-contract-fixtures";
import {
  avanzaOrderTicketActionContractFixtures,
} from "./avanza-order-ticket-action-contract-fixtures";
import {
  avanzaOrderTicketFieldContractFixtures,
} from "./avanza-order-ticket-field-contract-fixtures";
import {
  avanzaRealWorldInstrumentSearchSignalFixtures,
} from "./avanza-real-world-instrument-search-signals-fixtures";

export type AvanzaInstrumentToOrderHandoffChainFixtureId =
  | "disabled"
  | "waiting_for_execution_package"
  | "invalid_execution_package"
  | "waiting_for_instrument_search"
  | "waiting_for_instrument_verification"
  | "instrument_verification_blocked"
  | "verified_buy_instrument_handoff_state"
  | "verified_sell_instrument_handoff_state"
  | "waiting_for_order_field_plan"
  | "waiting_for_order_action_contract"
  | "complete_buy_handoff_chain_ready"
  | "complete_sell_handoff_chain_ready"
  | "stop_before_final_kop"
  | "stop_before_final_salj"
  | "order_submission_forbidden"
  | "search_execution_forbidden"
  | "navigation_forbidden"
  | "form_fill_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaInstrumentToOrderHandoffChainFixture = {
  fixtureId: AvanzaInstrumentToOrderHandoffChainFixtureId;
  label: string;
  expectedStatus: AvanzaInstrumentToOrderHandoffChainStatus;
  input: AvanzaInstrumentToOrderHandoffChainInput;
  chain: AvanzaInstrumentToOrderHandoffChain;
};

function signal(fixtureId: string) {
  const fixture = avanzaRealWorldInstrumentSearchSignalFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing instrument search signal fixture: ${fixtureId}`);
  }

  return fixture.signalPack;
}

function route(fixtureId: string) {
  const fixture = avanzaInstrumentSearchRouteContractFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing instrument search route fixture: ${fixtureId}`);
  }

  return fixture.routeContract;
}

function searchAction(fixtureId: string) {
  const fixture = avanzaInstrumentSearchActionContractFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing instrument search action fixture: ${fixtureId}`);
  }

  return fixture.actionContract;
}

function fieldPlan(fixtureId: string) {
  const fixture = avanzaOrderTicketFieldContractFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing order ticket field fixture: ${fixtureId}`);
  }

  return fixture.fieldPlan;
}

function orderAction(fixtureId: string) {
  const fixture = avanzaOrderTicketActionContractFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing order ticket action fixture: ${fixtureId}`);
  }

  return fixture.contract;
}

function fixture(
  fixtureId: AvanzaInstrumentToOrderHandoffChainFixtureId,
  label: string,
  expectedStatus: AvanzaInstrumentToOrderHandoffChainStatus,
  input: AvanzaInstrumentToOrderHandoffChainInput,
): AvanzaInstrumentToOrderHandoffChainFixture {
  const chain = buildAvanzaInstrumentToOrderHandoffChain({
    chainId: fixtureId,
    now: "2026-07-06T12:00:00.000Z",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    input,
    chain,
  };
}

const buyExecutionPackage: AvanzaExecutionPackageForOrderHandoff = {
  accountType: "ISK",
  confidence: 0.82,
  createdAt: "2026-07-06T12:00:00.000Z",
  customerType: "Privat",
  expectedCurrency: "USD",
  expectedInstrumentType: "Depåbevis",
  expectedIsin: "US6549022043",
  expectedMarket: "NYSE",
  instrumentName: "Nokia ADR",
  limitPrice: 125.5,
  orderType: "limit",
  packageId: "fixture-buy-handoff-package",
  quantity: 10,
  reason: "Fixture BUY handoff package.",
  recommendationId: "fixture-recommendation-buy",
  side: "buy",
  source: "fixture",
  ticker: "NOK",
  timeInForce: "day",
};

const sellExecutionPackage: AvanzaExecutionPackageForOrderHandoff = {
  ...buyExecutionPackage,
  limitPrice: 130.25,
  packageId: "fixture-sell-handoff-package",
  positionId: "fixture-position-sell",
  quantity: 8,
  recommendationId: undefined,
  reason: "Fixture SELL handoff package.",
  side: "sell",
};

const completeBuyInput: AvanzaInstrumentToOrderHandoffChainInput = {
  chainEnabled: true,
  executionPackage: buyExecutionPackage,
  instrumentSearchActionContract: searchAction("buy_search_action_plan_ready"),
  instrumentSearchRouteContract: route("buy_search_route_ready"),
  mode: "chain_model",
  orderTicketActionContract: orderAction("ready_buy_limit_action_plan"),
  orderTicketFieldPlan: fieldPlan("ready_buy_limit_order_field_plan"),
  realWorldInstrumentSearchSignals: signal("buy_search_flow_modeled"),
};

const completeSellInput: AvanzaInstrumentToOrderHandoffChainInput = {
  chainEnabled: true,
  executionPackage: sellExecutionPackage,
  instrumentSearchActionContract: searchAction("sell_search_action_plan_ready"),
  instrumentSearchRouteContract: route("sell_search_route_ready"),
  mode: "chain_model",
  orderTicketActionContract: orderAction("ready_sell_limit_action_plan"),
  orderTicketFieldPlan: fieldPlan("ready_sell_limit_order_field_plan"),
  realWorldInstrumentSearchSignals: signal("sell_search_flow_modeled"),
};

export const avanzaInstrumentToOrderHandoffChainFixtures:
  AvanzaInstrumentToOrderHandoffChainFixture[] = [
    fixture("disabled", "Disabled handoff chain", "disabled", {
      chainEnabled: false,
      mode: "disabled",
    }),
    fixture(
      "waiting_for_execution_package",
      "Waiting for execution package",
      "waiting_for_execution_package",
      {
        chainEnabled: true,
        mode: "chain_model",
      },
    ),
    fixture("invalid_execution_package", "Invalid execution package", "blocked", {
      chainEnabled: true,
      executionPackage: {
        ...buyExecutionPackage,
        limitPrice: 0,
        quantity: 0,
        side: "unknown",
        ticker: undefined,
      },
      mode: "chain_model",
    }),
    fixture(
      "waiting_for_instrument_search",
      "Waiting for instrument search",
      "waiting_for_instrument_search",
      {
        chainEnabled: true,
        executionPackage: buyExecutionPackage,
        mode: "chain_model",
      },
    ),
    fixture(
      "waiting_for_instrument_verification",
      "Waiting for instrument verification",
      "waiting_for_instrument_verification",
      {
        chainEnabled: true,
        executionPackage: buyExecutionPackage,
        instrumentSearchActionContract: searchAction("search_execution_forbidden"),
        instrumentSearchRouteContract: route("search_execution_forbidden"),
        mode: "chain_model",
        realWorldInstrumentSearchSignals: signal("matching_instrument_visible"),
      },
    ),
    fixture(
      "instrument_verification_blocked",
      "Instrument verification blocked",
      "blocked",
      {
        ...completeBuyInput,
        executionPackage: {
          ...buyExecutionPackage,
          expectedIsin: "US0000000000",
          expectedMarket: "NASDAQ",
        },
      },
    ),
    fixture(
      "verified_buy_instrument_handoff_state",
      "Verified BUY instrument handoff state",
      "waiting_for_order_field_plan",
      {
        ...completeBuyInput,
        orderTicketActionContract: undefined,
        orderTicketFieldPlan: undefined,
      },
    ),
    fixture(
      "verified_sell_instrument_handoff_state",
      "Verified SELL instrument handoff state",
      "waiting_for_order_field_plan",
      {
        ...completeSellInput,
        orderTicketActionContract: undefined,
        orderTicketFieldPlan: undefined,
      },
    ),
    fixture(
      "waiting_for_order_field_plan",
      "Waiting for order field plan",
      "waiting_for_order_field_plan",
      {
        ...completeBuyInput,
        orderTicketActionContract: undefined,
        orderTicketFieldPlan: undefined,
      },
    ),
    fixture(
      "waiting_for_order_action_contract",
      "Waiting for order action contract",
      "waiting_for_order_action_contract",
      {
        ...completeBuyInput,
        orderTicketActionContract: undefined,
      },
    ),
    fixture(
      "complete_buy_handoff_chain_ready",
      "Complete BUY handoff chain ready",
      "handoff_chain_ready",
      completeBuyInput,
    ),
    fixture(
      "complete_sell_handoff_chain_ready",
      "Complete SELL handoff chain ready",
      "handoff_chain_ready",
      completeSellInput,
    ),
    fixture(
      "stop_before_final_kop",
      "Stop before final KÖP",
      "handoff_chain_ready",
      completeBuyInput,
    ),
    fixture(
      "stop_before_final_salj",
      "Stop before final SÄLJ",
      "handoff_chain_ready",
      completeSellInput,
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "handoff_chain_ready",
      completeBuyInput,
    ),
    fixture(
      "search_execution_forbidden",
      "Search execution forbidden",
      "handoff_chain_ready",
      completeBuyInput,
    ),
    fixture(
      "navigation_forbidden",
      "Navigation forbidden",
      "handoff_chain_ready",
      completeBuyInput,
    ),
    fixture(
      "form_fill_forbidden",
      "Form fill forbidden",
      "handoff_chain_ready",
      completeBuyInput,
    ),
    fixture("cookie_session_forbidden", "Cookie/session forbidden", "handoff_chain_ready", {
      ...completeBuyInput,
      executionPackage: {
        ...buyExecutionPackage,
        riskWarnings: ["Cookie/session handling forbidden."],
      },
    }),
    fixture("bankid_forbidden", "BankID forbidden", "handoff_chain_ready", {
      ...completeBuyInput,
      executionPackage: {
        ...buyExecutionPackage,
        riskWarnings: ["BankID automation and bypass forbidden."],
      },
    }),
    fixture("error", "Error fixture", "error", {
      chainEnabled: true,
      mode: "chain_model",
      forceError: true,
    }),
    fixture("unknown", "Unknown fixture", "unknown", {
      chainEnabled: true,
      mode: "chain_model",
      forceUnknown: true,
    }),
  ];
