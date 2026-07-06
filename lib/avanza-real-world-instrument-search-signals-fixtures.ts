import {
  buildAvanzaRealWorldInstrumentSearchSignalPack,
  type AvanzaRealWorldInstrumentSearchSignalInput,
  type AvanzaRealWorldInstrumentSearchSignalPack,
  type AvanzaRealWorldInstrumentSearchStep,
} from "./avanza-real-world-instrument-search-signals";

export type AvanzaRealWorldInstrumentSearchSignalFixtureId =
  | "search_button_visible"
  | "search_panel_open"
  | "search_input_ready"
  | "search_results_visible"
  | "matching_instrument_visible"
  | "instrument_detail_page_recognized"
  | "instrument_verification_section_recognized"
  | "buy_sell_entry_buttons_visible"
  | "buy_search_flow_modeled"
  | "sell_search_flow_modeled"
  | "search_navigation_modeled_not_executable"
  | "search_result_selection_forbidden"
  | "instrument_navigation_forbidden"
  | "buy_sell_click_forbidden"
  | "order_submission_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "unknown";

export type AvanzaRealWorldInstrumentSearchSignalFixture = {
  fixtureId: AvanzaRealWorldInstrumentSearchSignalFixtureId;
  label: string;
  expectedStep: AvanzaRealWorldInstrumentSearchStep;
  input: AvanzaRealWorldInstrumentSearchSignalInput;
  signalPack: AvanzaRealWorldInstrumentSearchSignalPack;
};

function fixture(
  fixtureId: AvanzaRealWorldInstrumentSearchSignalFixtureId,
  label: string,
  expectedStep: AvanzaRealWorldInstrumentSearchStep,
  input: AvanzaRealWorldInstrumentSearchSignalInput,
): AvanzaRealWorldInstrumentSearchSignalFixture {
  const signalPack = buildAvanzaRealWorldInstrumentSearchSignalPack({
    signalPackId: fixtureId,
    createdAt: "2026-07-06T12:00:00.000Z",
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStep,
    input,
    signalPack,
  };
}

const commonSearchTexts = ["Sök", "Aktier", "Nokia ADR", "Nokia"];
const verificationTexts = [
  "Om depåbeviset",
  "Marknadsplats",
  "Kortnamn",
  "ISIN",
  "NYSE",
  "Depåbevis",
];

export const avanzaRealWorldInstrumentSearchSignalFixtures:
  AvanzaRealWorldInstrumentSearchSignalFixture[] = [
    fixture("search_button_visible", "Search button visible", "search_button_visible", {
      buttonTexts: ["Sök"],
      observedUrlKind: "avanza_any_page",
      step: "search_button_visible",
      visibleTexts: ["Sök"],
    }),
    fixture("search_panel_open", "Search panel open", "search_panel_open", {
      buttonTexts: ["Sök"],
      observedUrlKind: "avanza_search_panel",
      step: "search_panel_open",
      visibleTexts: ["Sök", "Aktier"],
    }),
    fixture("search_input_ready", "Search input ready", "search_input_ready", {
      buttonTexts: ["Sök"],
      inputLabels: ["Sök"],
      inputPlaceholders: ["Sök"],
      observedUrlKind: "avanza_search_panel",
      step: "search_input_ready",
      visibleTexts: ["Sök", "Aktier"],
    }),
    fixture(
      "search_results_visible",
      "Search results visible",
      "search_results_visible",
      {
        buttonTexts: ["Sök"],
        inputLabels: ["Sök"],
        observedUrlKind: "avanza_search_results",
        resultTexts: ["Nokia ADR", "Nokia", "Aktier"],
        step: "search_results_visible",
        visibleTexts: commonSearchTexts,
      },
    ),
    fixture(
      "matching_instrument_visible",
      "Matching instrument visible",
      "matching_instrument_visible",
      {
        buttonTexts: ["Sök"],
        inputLabels: ["Sök"],
        observedUrlKind: "avanza_search_results",
        resultTexts: ["Nokia ADR", "Nokia", "Aktier"],
        step: "matching_instrument_visible",
        visibleTexts: commonSearchTexts,
      },
    ),
    fixture(
      "instrument_detail_page_recognized",
      "Instrument detail page recognized",
      "instrument_detail_page",
      {
        buttonTexts: ["Sök"],
        instrumentIdentityTexts: ["Nokia ADR", "Nokia"],
        observedUrlKind: "avanza_instrument",
        step: "instrument_detail_page",
        visibleTexts: ["Nokia ADR", "Nokia", "Köp", "Sälj"],
      },
    ),
    fixture(
      "instrument_verification_section_recognized",
      "Instrument verification section recognized",
      "instrument_verification_section",
      {
        buttonTexts: ["Sök"],
        instrumentIdentityTexts: ["Nokia ADR", "Nokia"],
        observedUrlKind: "avanza_instrument",
        step: "instrument_verification_section",
        verificationTexts,
        visibleTexts: ["Nokia ADR", "Om depåbeviset", "Marknadsplats", "Kortnamn", "ISIN"],
      },
    ),
    fixture(
      "buy_sell_entry_buttons_visible",
      "BUY/SELL entry buttons visible",
      "buy_sell_entry_buttons",
      {
        buttonTexts: ["Sök"],
        entryButtonTexts: ["Köp", "Sälj"],
        instrumentIdentityTexts: ["Nokia ADR", "Nokia"],
        observedUrlKind: "avanza_instrument",
        step: "buy_sell_entry_buttons",
        verificationTexts,
        visibleTexts: ["Nokia ADR", "Köp", "Sälj", "Om depåbeviset"],
      },
    ),
    fixture("buy_search_flow_modeled", "BUY search flow modeled", "buy_sell_entry_buttons", {
      buttonTexts: ["Sök"],
      entryButtonTexts: ["Köp", "Sälj"],
      instrumentIdentityTexts: ["Nokia ADR", "Nokia"],
      observedUrlKind: "avanza_instrument",
      resultTexts: ["Nokia ADR", "Aktier"],
      side: "buy",
      step: "buy_sell_entry_buttons",
      verificationTexts,
      visibleTexts: ["Sök", "Nokia ADR", "Köp", "Om depåbeviset"],
    }),
    fixture("sell_search_flow_modeled", "SELL search flow modeled", "buy_sell_entry_buttons", {
      buttonTexts: ["Sök"],
      entryButtonTexts: ["Köp", "Sälj"],
      instrumentIdentityTexts: ["Nokia ADR", "Nokia"],
      observedUrlKind: "avanza_instrument",
      resultTexts: ["Nokia ADR", "Aktier"],
      side: "sell",
      step: "buy_sell_entry_buttons",
      verificationTexts,
      visibleTexts: ["Sök", "Nokia ADR", "Sälj", "Om depåbeviset"],
    }),
    fixture(
      "search_navigation_modeled_not_executable",
      "Search navigation modeled but not executable",
      "matching_instrument_visible",
      {
        buttonTexts: ["Sök"],
        observedUrlKind: "avanza_search_results",
        resultTexts: ["Nokia ADR", "Aktier"],
        step: "matching_instrument_visible",
        visibleTexts: commonSearchTexts,
        warningTexts: ["Search navigation is modeled only."],
      },
    ),
    fixture(
      "search_result_selection_forbidden",
      "Search result selection forbidden",
      "matching_instrument_visible",
      {
        buttonTexts: ["Sök"],
        observedUrlKind: "avanza_search_results",
        resultTexts: ["Nokia ADR", "Aktier"],
        step: "matching_instrument_visible",
        warningTexts: ["Search result selection forbidden in this task."],
      },
    ),
    fixture(
      "instrument_navigation_forbidden",
      "Instrument navigation forbidden",
      "instrument_detail_page",
      {
        instrumentIdentityTexts: ["Nokia ADR", "Nokia"],
        observedUrlKind: "avanza_instrument",
        step: "instrument_detail_page",
        warningTexts: ["Instrument navigation forbidden in this task."],
      },
    ),
    fixture("buy_sell_click_forbidden", "BUY/SELL click forbidden", "buy_sell_entry_buttons", {
      entryButtonTexts: ["Köp", "Sälj"],
      instrumentIdentityTexts: ["Nokia ADR", "Nokia"],
      observedUrlKind: "avanza_instrument",
      step: "buy_sell_entry_buttons",
      warningTexts: ["BUY/SELL entry click forbidden in this task."],
    }),
    fixture("order_submission_forbidden", "Order submission forbidden", "buy_sell_entry_buttons", {
      entryButtonTexts: ["Köp", "Sälj"],
      instrumentIdentityTexts: ["Nokia ADR", "Nokia"],
      step: "buy_sell_entry_buttons",
      warningTexts: ["Order submission forbidden."],
    }),
    fixture("cookie_session_forbidden", "Cookie/session forbidden", "search_button_visible", {
      buttonTexts: ["Sök"],
      step: "search_button_visible",
      warningTexts: ["Cookie/session handling forbidden."],
    }),
    fixture("bankid_forbidden", "BankID forbidden", "search_button_visible", {
      buttonTexts: ["Sök"],
      step: "search_button_visible",
      warningTexts: ["BankID automation and bypass forbidden."],
    }),
    fixture("unknown", "Unknown fixture", "unknown", {
      observedUrlKind: "unknown",
      step: "unknown",
    }),
  ];
