import {
  buildAvanzaSettlementNoteRouteContract,
  type AvanzaSettlementNoteRouteContract,
  type AvanzaSettlementNoteRouteStatus,
  type AvanzaSettlementTradeReference,
} from "./avanza-settlement-note-route-contract";
import {
  avanzaSettlementNoteSignalFixtures,
} from "./avanza-real-world-settlement-note-signals-fixtures";

export type AvanzaSettlementNoteRouteContractFixtureId =
  | "disabled"
  | "waiting_for_trade_reference"
  | "waiting_for_settlement_signals"
  | "buy_settlement_route_ready"
  | "sell_settlement_route_ready"
  | "transaction_match_ready"
  | "settlement_note_ready"
  | "stop_before_note_read"
  | "missing_transaction_reference_blocked"
  | "transaction_match_blocked"
  | "note_unavailable_blocked"
  | "navigation_forbidden"
  | "note_read_forbidden"
  | "extraction_forbidden"
  | "reconciliation_write_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaSettlementNoteRouteContractFixture = {
  fixtureId: AvanzaSettlementNoteRouteContractFixtureId;
  label: string;
  expectedStatus: AvanzaSettlementNoteRouteStatus;
  routeContract: AvanzaSettlementNoteRouteContract;
};

const buyTradeReference: AvanzaSettlementTradeReference = {
  tradeReferenceId: "fixture-buy-trade",
  createdAt: "2026-07-06T12:00:00.000Z",
  source: "fixture",
  side: "buy",
  ticker: "NOKIA",
  instrumentName: "Nokia ADR",
  quantity: 12,
  estimatedExecutionPrice: 10,
  estimatedGrossAmount: 120,
  estimatedTradeDate: "2026-07-06",
  expectedSettlementDate: "2026-07-07",
  currency: "USD",
  brokerOrderReference: "masked-broker-ref",
  recommendationId: "fixture-recommendation",
};

const sellTradeReference: AvanzaSettlementTradeReference = {
  ...buyTradeReference,
  tradeReferenceId: "fixture-sell-trade",
  side: "sell",
  quantity: 8,
};

function signal(fixtureId: string) {
  const fixture = avanzaSettlementNoteSignalFixtures.find(
    (item) => item.fixtureId === fixtureId,
  );

  if (!fixture) throw new Error(`Missing settlement note signal fixture ${fixtureId}`);

  return fixture.signalPack;
}

function fixture(
  fixtureId: AvanzaSettlementNoteRouteContractFixtureId,
  label: string,
  input: Parameters<typeof buildAvanzaSettlementNoteRouteContract>[0],
): AvanzaSettlementNoteRouteContractFixture {
  const routeContract = buildAvanzaSettlementNoteRouteContract({
    routeContractId: fixtureId,
    now: "2026-07-06T12:00:00.000Z",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus: routeContract.status,
    routeContract,
  };
}

export const avanzaSettlementNoteRouteContractFixtures:
  AvanzaSettlementNoteRouteContractFixture[] = [
    fixture("disabled", "Settlement route disabled", {
      mode: "disabled",
      routeEnabled: false,
    }),
    fixture("waiting_for_trade_reference", "Waiting for trade reference", {
      mode: "route_model",
      routeEnabled: true,
      realWorldSettlementSignals: signal("settlement_note_available"),
    }),
    fixture("waiting_for_settlement_signals", "Waiting for settlement signals", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
    }),
    fixture("buy_settlement_route_ready", "BUY settlement route ready", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("transaction_list_visible"),
    }),
    fixture("sell_settlement_route_ready", "SELL settlement route ready", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: sellTradeReference,
      realWorldSettlementSignals: signal("transaction_list_visible"),
    }),
    fixture("transaction_match_ready", "Transaction match ready", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("matching_buy_transaction_row_modeled"),
    }),
    fixture("settlement_note_ready", "Settlement note ready", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("settlement_note_available"),
    }),
    fixture("stop_before_note_read", "Stop before note read", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("settlement_note_document_visible"),
    }),
    fixture(
      "missing_transaction_reference_blocked",
      "Missing transaction reference blocked",
      {
        mode: "route_model",
        routeEnabled: true,
        tradeReference: { ...buyTradeReference, ticker: undefined, quantity: 0 },
        realWorldSettlementSignals: signal("settlement_note_available"),
      },
    ),
    fixture("transaction_match_blocked", "Transaction match blocked", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("matching_buy_transaction_row_modeled"),
      forceBlockedReason: "Transaction match blocked in fixture.",
    }),
    fixture("note_unavailable_blocked", "Settlement note unavailable blocked", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("transaction_list_visible"),
      forceBlockedReason: "Settlement note unavailable.",
    }),
    fixture("navigation_forbidden", "Navigation forbidden", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("note_navigation_modeled_not_executable"),
      forceBlockedReason: "Real settlement navigation forbidden.",
    }),
    fixture("note_read_forbidden", "Note read forbidden", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("note_reading_modeled_not_executable"),
      forceBlockedReason: "Settlement document read forbidden.",
    }),
    fixture("extraction_forbidden", "Extraction forbidden", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("value_extraction_modeled_not_executable"),
      forceBlockedReason: "Settlement value extraction forbidden.",
    }),
    fixture("reconciliation_write_forbidden", "Reconciliation write forbidden", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("reconciliation_write_forbidden"),
      forceBlockedReason: "Trade reconciliation write forbidden.",
    }),
    fixture("cookie_session_forbidden", "Cookie/session forbidden", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("cookie_session_forbidden"),
      forceBlockedReason: "Cookie/session handling forbidden.",
    }),
    fixture("bankid_forbidden", "BankID forbidden", {
      mode: "route_model",
      routeEnabled: true,
      tradeReference: buyTradeReference,
      realWorldSettlementSignals: signal("bankid_forbidden"),
      forceBlockedReason: "BankID automation and bypass forbidden.",
    }),
    fixture("error", "Settlement route error", {
      mode: "route_model",
      routeEnabled: true,
      forceError: true,
    }),
    fixture("unknown", "Settlement route unknown", {
      mode: "route_model",
      routeEnabled: true,
      forceUnknown: true,
    }),
  ];
