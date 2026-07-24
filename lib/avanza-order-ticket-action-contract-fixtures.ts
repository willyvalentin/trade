import {
  buildAvanzaOrderTicketActionContract,
  type AvanzaOrderTicketActionContract,
  type AvanzaOrderTicketActionContractInput,
  type AvanzaOrderTicketActionContractStatus,
} from "./avanza-order-ticket-action-contract";
import {
  avanzaOrderTicketFieldContractFixtures,
} from "./avanza-order-ticket-field-contract-fixtures";

export type AvanzaOrderTicketActionContractFixtureId =
  | "disabled"
  | "waiting_for_field_plan"
  | "ready_buy_limit_action_plan"
  | "ready_sell_limit_action_plan"
  | "buy_action_plan_stops_before_final_kop"
  | "sell_action_plan_stops_before_final_salj"
  | "market_order_blocked"
  | "invalid_field_plan_blocked"
  | "order_submission_forbidden"
  | "final_buy_click_forbidden"
  | "final_sell_click_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaOrderTicketActionContractFixture = {
  fixtureId: AvanzaOrderTicketActionContractFixtureId;
  label: string;
  expectedStatus: AvanzaOrderTicketActionContractStatus;
  input: AvanzaOrderTicketActionContractInput;
  contract: AvanzaOrderTicketActionContract;
};

function fieldPlan(fixtureId: string) {
  const fixture = avanzaOrderTicketFieldContractFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing order ticket field contract fixture: ${fixtureId}`);
  }

  return fixture.fieldPlan;
}

function fixture(
  fixtureId: AvanzaOrderTicketActionContractFixtureId,
  label: string,
  expectedStatus: AvanzaOrderTicketActionContractStatus,
  input: AvanzaOrderTicketActionContractInput,
): AvanzaOrderTicketActionContractFixture {
  const contract = buildAvanzaOrderTicketActionContract({
    contractId: fixtureId,
    now: "2026-07-06T12:00:00.000Z",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    input,
    contract,
  };
}

const readyBuyFieldPlan = fieldPlan("ready_buy_limit_order_field_plan");
const readySellFieldPlan = fieldPlan("ready_sell_limit_order_field_plan");

export const avanzaOrderTicketActionContractFixtures:
  AvanzaOrderTicketActionContractFixture[] = [
    fixture("disabled", "Disabled action contract", "disabled", {
      contractEnabled: false,
      mode: "disabled",
    }),
    fixture(
      "waiting_for_field_plan",
      "Waiting for order ticket field plan",
      "waiting_for_field_plan",
      {
        contractEnabled: true,
        mode: "contract_only",
      },
    ),
    fixture(
      "ready_buy_limit_action_plan",
      "Ready BUY limit action plan",
      "action_plan_ready",
      {
        contractEnabled: true,
        mode: "contract_only",
        orderTicketFieldPlan: readyBuyFieldPlan,
      },
    ),
    fixture(
      "ready_sell_limit_action_plan",
      "Ready SELL limit action plan",
      "action_plan_ready",
      {
        contractEnabled: true,
        mode: "contract_only",
        orderTicketFieldPlan: readySellFieldPlan,
      },
    ),
    fixture(
      "buy_action_plan_stops_before_final_kop",
      "BUY action plan stops before final KÖP",
      "action_plan_ready",
      {
        contractEnabled: true,
        mode: "local_dev_dry_run",
        orderTicketFieldPlan: readyBuyFieldPlan,
      },
    ),
    fixture(
      "sell_action_plan_stops_before_final_salj",
      "SELL action plan stops before final SÄLJ",
      "action_plan_ready",
      {
        contractEnabled: true,
        mode: "local_dev_dry_run",
        orderTicketFieldPlan: readySellFieldPlan,
      },
    ),
    fixture("market_order_blocked", "Market order blocked", "blocked", {
      contractEnabled: true,
      mode: "contract_only",
      orderTicketFieldPlan: fieldPlan("market_order_blocked"),
    }),
    fixture(
      "invalid_field_plan_blocked",
      "Invalid field plan blocked",
      "blocked",
      {
        contractEnabled: true,
        mode: "contract_only",
        orderTicketFieldPlan: {
          status: "field_mapping_ready",
          ticker: "BROKEN",
        },
      },
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "action_plan_ready",
      {
        contractEnabled: true,
        mode: "contract_only",
        orderTicketFieldPlan: readyBuyFieldPlan,
      },
    ),
    fixture(
      "final_buy_click_forbidden",
      "Final BUY click forbidden",
      "action_plan_ready",
      {
        contractEnabled: true,
        mode: "contract_only",
        orderTicketFieldPlan: readyBuyFieldPlan,
      },
    ),
    fixture(
      "final_sell_click_forbidden",
      "Final SELL click forbidden",
      "action_plan_ready",
      {
        contractEnabled: true,
        mode: "contract_only",
        orderTicketFieldPlan: readySellFieldPlan,
      },
    ),
    fixture(
      "cookie_session_forbidden",
      "Cookie/session forbidden",
      "action_plan_ready",
      {
        contractEnabled: true,
        mode: "contract_only",
        orderTicketFieldPlan: fieldPlan("cookie_session_forbidden"),
      },
    ),
    fixture("bankid_forbidden", "BankID forbidden", "action_plan_ready", {
      contractEnabled: true,
      mode: "contract_only",
      orderTicketFieldPlan: fieldPlan("bankid_forbidden"),
    }),
    fixture("error", "Error fixture", "error", {
      contractEnabled: true,
      mode: "contract_only",
      orderTicketFieldPlan: fieldPlan("error"),
    }),
    fixture("unknown", "Unknown fixture", "unknown", {
      contractEnabled: true,
      mode: "contract_only",
      orderTicketFieldPlan: fieldPlan("unknown"),
    }),
  ];
