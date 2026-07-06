import {
  buildAvanzaSettlementNoteActionContract,
  type AvanzaSettlementNoteActionContract,
  type AvanzaSettlementNoteActionContractStatus,
} from "./avanza-settlement-note-action-contract";
import {
  avanzaSettlementNoteRouteContractFixtures,
} from "./avanza-settlement-note-route-contract-fixtures";

export type AvanzaSettlementNoteActionContractFixtureId =
  | "disabled"
  | "waiting_for_route"
  | "buy_settlement_action_plan_ready"
  | "sell_settlement_action_plan_ready"
  | "locate_matching_transaction_modeled"
  | "locate_settlement_note_modeled"
  | "stop_before_document_read"
  | "navigation_forbidden"
  | "transaction_detail_open_forbidden"
  | "settlement_note_open_forbidden"
  | "document_read_forbidden"
  | "extraction_forbidden"
  | "reconciliation_write_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaSettlementNoteActionContractFixture = {
  fixtureId: AvanzaSettlementNoteActionContractFixtureId;
  label: string;
  expectedStatus: AvanzaSettlementNoteActionContractStatus;
  actionContract: AvanzaSettlementNoteActionContract;
};

function route(fixtureId: string) {
  const fixture = avanzaSettlementNoteRouteContractFixtures.find(
    (item) => item.fixtureId === fixtureId,
  );

  if (!fixture) throw new Error(`Missing settlement note route fixture ${fixtureId}`);

  return fixture.routeContract;
}

function fixture(
  fixtureId: AvanzaSettlementNoteActionContractFixtureId,
  label: string,
  input: Parameters<typeof buildAvanzaSettlementNoteActionContract>[0],
): AvanzaSettlementNoteActionContractFixture {
  const actionContract = buildAvanzaSettlementNoteActionContract({
    contractId: fixtureId,
    now: "2026-07-06T12:00:00.000Z",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus: actionContract.status,
    actionContract,
  };
}

export const avanzaSettlementNoteActionContractFixtures:
  AvanzaSettlementNoteActionContractFixture[] = [
    fixture("disabled", "Settlement action contract disabled", {
      mode: "disabled",
      contractEnabled: false,
    }),
    fixture("waiting_for_route", "Waiting for settlement route", {
      mode: "contract_only",
      contractEnabled: true,
    }),
    fixture("buy_settlement_action_plan_ready", "BUY settlement action plan ready", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("buy_settlement_route_ready"),
    }),
    fixture("sell_settlement_action_plan_ready", "SELL settlement action plan ready", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("sell_settlement_route_ready"),
    }),
    fixture(
      "locate_matching_transaction_modeled",
      "Locate matching transaction modeled",
      {
        mode: "contract_only",
        contractEnabled: true,
        settlementNoteRouteContract: route("transaction_match_ready"),
      },
    ),
    fixture("locate_settlement_note_modeled", "Locate settlement note modeled", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("settlement_note_ready"),
    }),
    fixture("stop_before_document_read", "Stop before document read", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("stop_before_note_read"),
    }),
    fixture("navigation_forbidden", "Navigation forbidden", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("navigation_forbidden"),
    }),
    fixture(
      "transaction_detail_open_forbidden",
      "Transaction detail open forbidden",
      {
        mode: "contract_only",
        contractEnabled: true,
        settlementNoteRouteContract: route("transaction_match_blocked"),
      },
    ),
    fixture("settlement_note_open_forbidden", "Settlement note open forbidden", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("note_unavailable_blocked"),
    }),
    fixture("document_read_forbidden", "Document read forbidden", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("note_read_forbidden"),
    }),
    fixture("extraction_forbidden", "Extraction forbidden", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("extraction_forbidden"),
    }),
    fixture("reconciliation_write_forbidden", "Reconciliation write forbidden", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("reconciliation_write_forbidden"),
    }),
    fixture("cookie_session_forbidden", "Cookie/session forbidden", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("cookie_session_forbidden"),
    }),
    fixture("bankid_forbidden", "BankID forbidden", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("bankid_forbidden"),
    }),
    fixture("error", "Settlement action contract error", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("error"),
    }),
    fixture("unknown", "Settlement action contract unknown", {
      mode: "contract_only",
      contractEnabled: true,
      settlementNoteRouteContract: route("unknown"),
    }),
  ];
