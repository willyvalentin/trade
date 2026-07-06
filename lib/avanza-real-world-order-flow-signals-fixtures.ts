import {
  buildAvanzaRealWorldOrderSignalPack,
  type AvanzaRealWorldOrderFlowStep,
  type AvanzaRealWorldOrderSignalPack,
  type AvanzaRealWorldOrderSide,
} from "./avanza-real-world-order-flow-signals";

export type AvanzaRealWorldOrderFlowSignalFixtureId =
  | "buy_instrument_order_panel"
  | "buy_order_review"
  | "buy_success_confirmation"
  | "buy_failed_confirmation"
  | "buy_order_list"
  | "buy_order_detail_panel"
  | "sell_instrument_order_panel"
  | "sell_order_review"
  | "sell_success_confirmation"
  | "sell_failed_confirmation"
  | "final_buy_click_forbidden"
  | "final_sell_click_forbidden"
  | "order_submission_forbidden"
  | "bankid_forbidden"
  | "cookie_session_forbidden"
  | "unknown";

export type AvanzaRealWorldOrderFlowSignalFixture = {
  fixtureId: AvanzaRealWorldOrderFlowSignalFixtureId;
  label: string;
  expectedSide: AvanzaRealWorldOrderSide;
  expectedStep: AvanzaRealWorldOrderFlowStep;
  signalPack: AvanzaRealWorldOrderSignalPack;
};

const sharedOrderPanelLabels = ["Konto", "Antal", "Pris", "Ordertyp"];
const sharedOrderPanelTexts = ["Limit", "Summa", "Belopp", "Kostnad"];

function fixture(
  fixtureId: AvanzaRealWorldOrderFlowSignalFixtureId,
  label: string,
  input: Parameters<typeof buildAvanzaRealWorldOrderSignalPack>[0],
): AvanzaRealWorldOrderFlowSignalFixture {
  const signalPack = buildAvanzaRealWorldOrderSignalPack({
    signalPackId: fixtureId,
    createdAt: "2026-07-06T12:00:00.000Z",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedSide: signalPack.side,
    expectedStep: signalPack.step,
    signalPack,
  };
}

export const avanzaRealWorldOrderFlowSignalFixtures:
  AvanzaRealWorldOrderFlowSignalFixture[] = [
    fixture("buy_instrument_order_panel", "BUY instrument order panel", {
      side: "buy",
      step: "instrument_order_panel",
      observedUrlKind: "avanza_instrument",
      tabs: ["Köp", "Sälj"],
      buttonTexts: ["Köp"],
      fieldLabels: sharedOrderPanelLabels,
      visibleTexts: sharedOrderPanelTexts,
    }),
    fixture("buy_order_review", "BUY order review", {
      side: "buy",
      step: "order_review",
      observedUrlKind: "avanza_order_review",
      buttonTexts: ["Köp"],
      confirmationTexts: ["Kontrollera order", "Order review"],
      fieldLabels: sharedOrderPanelLabels,
      visibleTexts: ["Limit", "Summa", "Kostnad"],
    }),
    fixture("buy_success_confirmation", "BUY success confirmation", {
      side: "buy",
      step: "order_success_confirmation",
      observedUrlKind: "avanza_order_confirmation",
      successTexts: ["Order väntar", "Order gick igenom"],
      statusTexts: ["Order success"],
      visibleTexts: ["Köp", "Limit"],
    }),
    fixture("buy_failed_confirmation", "BUY failed confirmation", {
      side: "buy",
      step: "order_failed_confirmation",
      observedUrlKind: "avanza_order_confirmation",
      failureTexts: ["Order gick inte igenom", "Order failed"],
      statusTexts: ["Order failed"],
      visibleTexts: ["Köp", "Limit"],
    }),
    fixture("buy_order_list", "BUY order list", {
      side: "buy",
      step: "order_list",
      observedUrlKind: "avanza_order_list",
      tabs: ["Orderlista"],
      statusTexts: ["Order väntar"],
      visibleTexts: ["Köp", "Order list"],
    }),
    fixture("buy_order_detail_panel", "BUY order detail panel", {
      side: "buy",
      step: "order_detail_panel",
      observedUrlKind: "avanza_order",
      fieldLabels: ["Konto", "Antal", "Pris", "Ordertyp"],
      statusTexts: ["Orderdetalj"],
      visibleTexts: ["Köp", "Limit", "Summa"],
    }),
    fixture("sell_instrument_order_panel", "SELL instrument order panel", {
      side: "sell",
      step: "instrument_order_panel",
      observedUrlKind: "avanza_instrument",
      tabs: ["Köp", "Sälj"],
      buttonTexts: ["Sälj"],
      fieldLabels: sharedOrderPanelLabels,
      visibleTexts: [...sharedOrderPanelTexts, "Sälj"],
      warnings: ["SELL flow modeled from same structure with sell labels."],
    }),
    fixture("sell_order_review", "SELL order review", {
      side: "sell",
      step: "order_review",
      observedUrlKind: "avanza_order_review",
      buttonTexts: ["Sälj"],
      confirmationTexts: ["Kontrollera order", "Order review"],
      fieldLabels: sharedOrderPanelLabels,
      visibleTexts: ["Sälj", "Limit", "Summa", "Kostnad"],
      warnings: ["SELL review modeled from same structure with sell labels."],
    }),
    fixture("sell_success_confirmation", "SELL success confirmation", {
      side: "sell",
      step: "order_success_confirmation",
      observedUrlKind: "avanza_order_confirmation",
      successTexts: ["Order väntar", "Order gick igenom"],
      statusTexts: ["Order success"],
      visibleTexts: ["Sälj", "Limit"],
      warnings: ["SELL success modeled from same structure with sell labels."],
    }),
    fixture("sell_failed_confirmation", "SELL failed confirmation", {
      side: "sell",
      step: "order_failed_confirmation",
      observedUrlKind: "avanza_order_confirmation",
      failureTexts: ["Order gick inte igenom", "Order failed"],
      statusTexts: ["Order failed"],
      visibleTexts: ["Sälj", "Limit"],
      warnings: ["SELL failure modeled from same structure with sell labels."],
    }),
    fixture("final_buy_click_forbidden", "Final BUY click forbidden", {
      side: "buy",
      step: "order_review",
      observedUrlKind: "avanza_order_review",
      buttonTexts: ["Köp"],
      blockedReasons: ["Final BUY click forbidden for semi-auto."],
    }),
    fixture("final_sell_click_forbidden", "Final SELL click forbidden", {
      side: "sell",
      step: "order_review",
      observedUrlKind: "avanza_order_review",
      buttonTexts: ["Sälj"],
      blockedReasons: ["Final SELL click forbidden for semi-auto."],
    }),
    fixture("order_submission_forbidden", "Order submission forbidden", {
      side: "unknown",
      step: "order_review",
      observedUrlKind: "avanza_order_review",
      blockedReasons: ["Order submission forbidden."],
    }),
    fixture("bankid_forbidden", "BankID forbidden", {
      side: "unknown",
      step: "unknown",
      observedUrlKind: "unknown",
      blockedReasons: ["BankID automation and bypass forbidden."],
    }),
    fixture("cookie_session_forbidden", "Cookie/session forbidden", {
      side: "unknown",
      step: "unknown",
      observedUrlKind: "unknown",
      blockedReasons: ["Cookie/session handling forbidden."],
    }),
    fixture("unknown", "Unknown order flow state", {
      side: "unknown",
      step: "unknown",
      observedUrlKind: "unknown",
      warnings: ["Unknown sanitized order flow state."],
    }),
  ];
