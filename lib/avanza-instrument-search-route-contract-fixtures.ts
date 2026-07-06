import {
  buildAvanzaInstrumentSearchRouteContract,
  type AvanzaInstrumentSearchInputPackage,
  type AvanzaInstrumentSearchRouteContract,
  type AvanzaInstrumentSearchRouteContractInput,
  type AvanzaInstrumentSearchRouteStatus,
} from "./avanza-instrument-search-route-contract";
import {
  avanzaRealWorldInstrumentSearchSignalFixtures,
} from "./avanza-real-world-instrument-search-signals-fixtures";

export type AvanzaInstrumentSearchRouteContractFixtureId =
  | "disabled"
  | "waiting_for_search_package"
  | "waiting_for_search_signals"
  | "buy_search_route_ready"
  | "sell_search_route_ready"
  | "verify_instrument_identity"
  | "verify_marketplace"
  | "verify_short_name"
  | "verify_isin_if_available"
  | "locate_buy_sell_buttons"
  | "stop_before_kop_entry_click"
  | "stop_before_salj_entry_click"
  | "search_execution_forbidden"
  | "instrument_navigation_forbidden"
  | "buy_sell_entry_click_forbidden"
  | "order_submission_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaInstrumentSearchRouteContractFixture = {
  fixtureId: AvanzaInstrumentSearchRouteContractFixtureId;
  label: string;
  expectedStatus: AvanzaInstrumentSearchRouteStatus;
  input: AvanzaInstrumentSearchRouteContractInput;
  routeContract: AvanzaInstrumentSearchRouteContract;
};

function signals(fixtureId: string) {
  const fixture = avanzaRealWorldInstrumentSearchSignalFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing instrument search signal fixture: ${fixtureId}`);
  }

  return fixture.signalPack;
}

function fixture(
  fixtureId: AvanzaInstrumentSearchRouteContractFixtureId,
  label: string,
  expectedStatus: AvanzaInstrumentSearchRouteStatus,
  input: AvanzaInstrumentSearchRouteContractInput,
): AvanzaInstrumentSearchRouteContractFixture {
  const routeContract = buildAvanzaInstrumentSearchRouteContract({
    routeContractId: fixtureId,
    now: "2026-07-06T12:00:00.000Z",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    input,
    routeContract,
  };
}

const buyPackage: AvanzaInstrumentSearchInputPackage = {
  expectedCurrency: "USD",
  expectedInstrumentType: "Depåbevis",
  expectedIsin: "US6549022043",
  expectedMarket: "NYSE",
  instrumentName: "Nokia ADR",
  packageId: "fixture-buy-search-package",
  side: "buy",
  source: "fixture",
  ticker: "NOK",
};

const sellPackage: AvanzaInstrumentSearchInputPackage = {
  ...buyPackage,
  packageId: "fixture-sell-search-package",
  side: "sell",
};

export const avanzaInstrumentSearchRouteContractFixtures:
  AvanzaInstrumentSearchRouteContractFixture[] = [
    fixture("disabled", "Disabled route contract", "disabled", {
      mode: "disabled",
      routeEnabled: false,
    }),
    fixture(
      "waiting_for_search_package",
      "Waiting for search package",
      "waiting_for_search_package",
      {
        mode: "route_model",
        routeEnabled: true,
      },
    ),
    fixture(
      "waiting_for_search_signals",
      "Waiting for search signals",
      "waiting_for_search_signals",
      {
        mode: "route_model",
        routeEnabled: true,
        searchPackage: buyPackage,
      },
    ),
    fixture("buy_search_route_ready", "BUY search route ready", "instrument_verification_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals("buy_search_flow_modeled"),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("sell_search_route_ready", "SELL search route ready", "instrument_verification_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals("sell_search_flow_modeled"),
      routeEnabled: true,
      searchPackage: sellPackage,
    }),
    fixture("verify_instrument_identity", "Verify instrument identity", "instrument_verification_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals(
        "instrument_verification_section_recognized",
      ),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("verify_marketplace", "Verify marketplace", "instrument_verification_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals(
        "instrument_verification_section_recognized",
      ),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("verify_short_name", "Verify short name", "instrument_verification_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals(
        "instrument_verification_section_recognized",
      ),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("verify_isin_if_available", "Verify ISIN if available", "instrument_verification_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals(
        "instrument_verification_section_recognized",
      ),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("locate_buy_sell_buttons", "Locate BUY/SELL buttons", "instrument_verification_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals("buy_sell_entry_buttons_visible"),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("stop_before_kop_entry_click", "Stop before KÖP entry click", "instrument_verification_ready", {
      mode: "local_dev_route_model",
      realWorldInstrumentSearchSignals: signals("buy_search_flow_modeled"),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("stop_before_salj_entry_click", "Stop before SÄLJ entry click", "instrument_verification_ready", {
      mode: "local_dev_route_model",
      realWorldInstrumentSearchSignals: signals("sell_search_flow_modeled"),
      routeEnabled: true,
      searchPackage: sellPackage,
    }),
    fixture("search_execution_forbidden", "Search execution forbidden", "route_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals(
        "search_navigation_modeled_not_executable",
      ),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("instrument_navigation_forbidden", "Instrument navigation forbidden", "route_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals("instrument_navigation_forbidden"),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture(
      "buy_sell_entry_click_forbidden",
      "BUY/SELL entry click forbidden",
      "instrument_verification_ready",
      {
        mode: "route_model",
        realWorldInstrumentSearchSignals: signals("buy_sell_click_forbidden"),
        routeEnabled: true,
        searchPackage: buyPackage,
      },
    ),
    fixture("order_submission_forbidden", "Order submission forbidden", "instrument_verification_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals("order_submission_forbidden"),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("cookie_session_forbidden", "Cookie/session forbidden", "route_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals("cookie_session_forbidden"),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("bankid_forbidden", "BankID forbidden", "route_ready", {
      mode: "route_model",
      realWorldInstrumentSearchSignals: signals("bankid_forbidden"),
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("error", "Error fixture", "error", {
      forceError: true,
      mode: "route_model",
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
    fixture("unknown", "Unknown fixture", "unknown", {
      forceUnknown: true,
      mode: "route_model",
      routeEnabled: true,
      searchPackage: buyPackage,
    }),
  ];
