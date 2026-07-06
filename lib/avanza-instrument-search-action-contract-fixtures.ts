import {
  buildAvanzaInstrumentSearchActionContract,
  type AvanzaInstrumentSearchActionContract,
  type AvanzaInstrumentSearchActionContractInput,
  type AvanzaInstrumentSearchActionContractStatus,
} from "./avanza-instrument-search-action-contract";
import {
  avanzaInstrumentSearchRouteContractFixtures,
} from "./avanza-instrument-search-route-contract-fixtures";

export type AvanzaInstrumentSearchActionContractFixtureId =
  | "disabled"
  | "waiting_for_route"
  | "buy_search_action_plan_ready"
  | "sell_search_action_plan_ready"
  | "verify_instrument_identity_modeled"
  | "locate_buy_button_modeled"
  | "locate_sell_button_modeled"
  | "stop_before_kop_entry_click"
  | "stop_before_salj_entry_click"
  | "search_execution_forbidden"
  | "search_result_selection_forbidden"
  | "buy_sell_entry_click_forbidden"
  | "order_submission_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaInstrumentSearchActionContractFixture = {
  fixtureId: AvanzaInstrumentSearchActionContractFixtureId;
  label: string;
  expectedStatus: AvanzaInstrumentSearchActionContractStatus;
  input: AvanzaInstrumentSearchActionContractInput;
  actionContract: AvanzaInstrumentSearchActionContract;
};

function route(fixtureId: string) {
  const fixture = avanzaInstrumentSearchRouteContractFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing instrument search route fixture: ${fixtureId}`);
  }

  return fixture.routeContract;
}

function fixture(
  fixtureId: AvanzaInstrumentSearchActionContractFixtureId,
  label: string,
  expectedStatus: AvanzaInstrumentSearchActionContractStatus,
  input: AvanzaInstrumentSearchActionContractInput,
): AvanzaInstrumentSearchActionContractFixture {
  const actionContract = buildAvanzaInstrumentSearchActionContract({
    contractId: fixtureId,
    now: "2026-07-06T12:00:00.000Z",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    input,
    actionContract,
  };
}

export const avanzaInstrumentSearchActionContractFixtures:
  AvanzaInstrumentSearchActionContractFixture[] = [
    fixture("disabled", "Disabled action contract", "disabled", {
      contractEnabled: false,
      mode: "disabled",
    }),
    fixture("waiting_for_route", "Waiting for route", "waiting_for_route", {
      contractEnabled: true,
      mode: "contract_only",
    }),
    fixture(
      "buy_search_action_plan_ready",
      "BUY search action plan ready",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("buy_search_route_ready"),
        mode: "contract_only",
      },
    ),
    fixture(
      "sell_search_action_plan_ready",
      "SELL search action plan ready",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("sell_search_route_ready"),
        mode: "contract_only",
      },
    ),
    fixture(
      "verify_instrument_identity_modeled",
      "Verify instrument identity modeled",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("verify_instrument_identity"),
        mode: "contract_only",
      },
    ),
    fixture(
      "locate_buy_button_modeled",
      "Locate BUY button modeled",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("buy_search_route_ready"),
        mode: "contract_only",
      },
    ),
    fixture(
      "locate_sell_button_modeled",
      "Locate SELL button modeled",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("sell_search_route_ready"),
        mode: "contract_only",
      },
    ),
    fixture(
      "stop_before_kop_entry_click",
      "Stop before KÖP entry click",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("stop_before_kop_entry_click"),
        mode: "local_dev_dry_run",
      },
    ),
    fixture(
      "stop_before_salj_entry_click",
      "Stop before SÄLJ entry click",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("stop_before_salj_entry_click"),
        mode: "local_dev_dry_run",
      },
    ),
    fixture(
      "search_execution_forbidden",
      "Search execution forbidden",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("search_execution_forbidden"),
        mode: "contract_only",
      },
    ),
    fixture(
      "search_result_selection_forbidden",
      "Search result selection forbidden",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("buy_search_route_ready"),
        mode: "contract_only",
      },
    ),
    fixture(
      "buy_sell_entry_click_forbidden",
      "BUY/SELL entry click forbidden",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("buy_sell_entry_click_forbidden"),
        mode: "contract_only",
      },
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("order_submission_forbidden"),
        mode: "contract_only",
      },
    ),
    fixture(
      "cookie_session_forbidden",
      "Cookie/session forbidden",
      "action_plan_ready",
      {
        contractEnabled: true,
        instrumentSearchRouteContract: route("cookie_session_forbidden"),
        mode: "contract_only",
      },
    ),
    fixture("bankid_forbidden", "BankID forbidden", "action_plan_ready", {
      contractEnabled: true,
      instrumentSearchRouteContract: route("bankid_forbidden"),
      mode: "contract_only",
    }),
    fixture("error", "Error fixture", "error", {
      contractEnabled: true,
      instrumentSearchRouteContract: route("error"),
      mode: "contract_only",
    }),
    fixture("unknown", "Unknown fixture", "unknown", {
      contractEnabled: true,
      instrumentSearchRouteContract: route("unknown"),
      mode: "contract_only",
    }),
  ];
