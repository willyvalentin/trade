import {
  buildAvanzaInstrumentToOrderMockExecutorReport,
  createAvanzaInstrumentToOrderMockPageState,
  type AvanzaInstrumentToOrderMockExecutorReport,
  type AvanzaInstrumentToOrderMockExecutorStatus,
  type AvanzaInstrumentToOrderMockPageState,
} from "./avanza-instrument-to-order-mock-executor";
import {
  avanzaInstrumentToOrderDryRunExecutorFixtures,
} from "./avanza-instrument-to-order-dry-run-executor-fixtures";
import type {
  AvanzaInstrumentToOrderDryRunReport,
} from "./avanza-instrument-to-order-dry-run-executor";
import {
  avanzaInstrumentToOrderHandoffChainFixtures,
} from "./avanza-instrument-to-order-handoff-chain-fixtures";
import type {
  AvanzaInstrumentToOrderHandoffChain,
} from "./avanza-instrument-to-order-handoff-chain";

export type AvanzaInstrumentToOrderMockExecutorFixtureId =
  | "disabled"
  | "valid_buy_mock_executed_to_final_human_action"
  | "valid_sell_mock_executed_to_final_human_action"
  | "search_panel_simulated"
  | "search_results_simulated"
  | "matching_instrument_selected_simulated"
  | "instrument_verification_simulated"
  | "buy_entry_located_simulated"
  | "sell_entry_located_simulated"
  | "order_ticket_prepared_simulated"
  | "order_review_ready_simulated"
  | "missing_matching_instrument"
  | "instrument_verification_failed"
  | "order_ticket_blocked"
  | "stop_before_final_kop"
  | "stop_before_final_salj"
  | "search_real_execution_forbidden"
  | "navigation_real_execution_forbidden"
  | "form_fill_real_execution_forbidden"
  | "click_real_execution_forbidden"
  | "order_submission_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaInstrumentToOrderMockExecutorFixture = {
  fixtureId: AvanzaInstrumentToOrderMockExecutorFixtureId;
  label: string;
  expectedStatus: AvanzaInstrumentToOrderMockExecutorStatus;
  report: AvanzaInstrumentToOrderMockExecutorReport;
};

function handoffChain(fixtureId: string): AvanzaInstrumentToOrderHandoffChain {
  const fixture = avanzaInstrumentToOrderHandoffChainFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing handoff chain fixture: ${fixtureId}`);
  }

  return fixture.chain;
}

function dryRunReport(fixtureId: string): AvanzaInstrumentToOrderDryRunReport {
  const fixture = avanzaInstrumentToOrderDryRunExecutorFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing dry-run fixture: ${fixtureId}`);
  }

  return fixture.report;
}

function fixture(
  fixtureId: AvanzaInstrumentToOrderMockExecutorFixtureId,
  label: string,
  expectedStatus: AvanzaInstrumentToOrderMockExecutorStatus,
  options: {
    handoffChain?: AvanzaInstrumentToOrderHandoffChain;
    dryRunReport?: AvanzaInstrumentToOrderDryRunReport;
    initialMockPageState?: AvanzaInstrumentToOrderMockPageState;
    mockExecutorEnabled?: boolean;
    forceError?: boolean;
    forceUnknown?: boolean;
  } = {},
): AvanzaInstrumentToOrderMockExecutorFixture {
  const report = buildAvanzaInstrumentToOrderMockExecutorReport({
    dryRunReport: options.dryRunReport,
    forceError: options.forceError,
    forceUnknown: options.forceUnknown,
    handoffChain: options.handoffChain,
    initialMockPageState: options.initialMockPageState,
    mockExecutorEnabled: options.mockExecutorEnabled ?? true,
    mode: "mock_local_dev",
    now: "2026-07-06T12:00:00.000Z",
    reportId: fixtureId,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    report,
  };
}

const readyBuyChain = handoffChain("complete_buy_handoff_chain_ready");
const readySellChain = handoffChain("complete_sell_handoff_chain_ready");
const readyBuyDryRun = dryRunReport("buy_dry_run_passed_to_final_human_action");
const readySellDryRun = dryRunReport("sell_dry_run_passed_to_final_human_action");
const initialBuyPage = createAvanzaInstrumentToOrderMockPageState(
  "initial_logged_in_page",
  "buy",
);
const initialSellPage = createAvanzaInstrumentToOrderMockPageState(
  "initial_logged_in_page",
  "sell",
);
const missingInstrumentPage = {
  ...createAvanzaInstrumentToOrderMockPageState("search_results_visible", "buy"),
  blockedReasons: ["Matching instrument absent in mock results."],
  matchingInstrumentVisible: false,
};
const failedVerificationPage = {
  ...createAvanzaInstrumentToOrderMockPageState("instrument_detail_page", "buy"),
  blockedReasons: ["Mock verification mismatch."],
  instrumentIdentityVerified: false,
  isinVerifiedOrUnavailable: false,
  marketplaceVerified: false,
  shortNameVerified: false,
};
const blockedOrderTicketPage = {
  ...createAvanzaInstrumentToOrderMockPageState("order_ticket_open", "buy"),
  blockedReasons: ["Mock order ticket fields unavailable."],
  limitOrderTypeVisible: false,
  limitPriceFieldVisible: false,
  quantityFieldVisible: false,
};

export const avanzaInstrumentToOrderMockExecutorFixtures:
  AvanzaInstrumentToOrderMockExecutorFixture[] = [
    fixture("disabled", "Disabled mock executor", "disabled", {
      mockExecutorEnabled: false,
    }),
    fixture(
      "valid_buy_mock_executed_to_final_human_action",
      "Valid BUY mock executed to final human action",
      "mock_final_human_action_required",
      {
        dryRunReport: readyBuyDryRun,
        handoffChain: readyBuyChain,
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture(
      "valid_sell_mock_executed_to_final_human_action",
      "Valid SELL mock executed to final human action",
      "mock_final_human_action_required",
      {
        dryRunReport: readySellDryRun,
        handoffChain: readySellChain,
        initialMockPageState: initialSellPage,
      },
    ),
    fixture("search_panel_simulated", "Search panel simulated", "mock_final_human_action_required", {
      dryRunReport: readyBuyDryRun,
      handoffChain: readyBuyChain,
      initialMockPageState: initialBuyPage,
    }),
    fixture("search_results_simulated", "Search results simulated", "mock_final_human_action_required", {
      dryRunReport: readyBuyDryRun,
      handoffChain: readyBuyChain,
      initialMockPageState: initialBuyPage,
    }),
    fixture(
      "matching_instrument_selected_simulated",
      "Matching instrument selected simulated",
      "mock_final_human_action_required",
      {
        dryRunReport: readyBuyDryRun,
        handoffChain: readyBuyChain,
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture(
      "instrument_verification_simulated",
      "Instrument verification simulated",
      "mock_final_human_action_required",
      {
        dryRunReport: readyBuyDryRun,
        handoffChain: readyBuyChain,
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture(
      "buy_entry_located_simulated",
      "BUY entry located simulated",
      "mock_final_human_action_required",
      {
        dryRunReport: readyBuyDryRun,
        handoffChain: readyBuyChain,
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture(
      "sell_entry_located_simulated",
      "SELL entry located simulated",
      "mock_final_human_action_required",
      {
        dryRunReport: readySellDryRun,
        handoffChain: readySellChain,
        initialMockPageState: initialSellPage,
      },
    ),
    fixture(
      "order_ticket_prepared_simulated",
      "Order ticket prepared simulated",
      "mock_final_human_action_required",
      {
        dryRunReport: readyBuyDryRun,
        handoffChain: readyBuyChain,
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture(
      "order_review_ready_simulated",
      "Order review ready simulated",
      "mock_final_human_action_required",
      {
        dryRunReport: readyBuyDryRun,
        handoffChain: readyBuyChain,
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture(
      "missing_matching_instrument",
      "Missing matching instrument",
      "mock_instrument_not_found",
      {
        dryRunReport: readyBuyDryRun,
        handoffChain: readyBuyChain,
        initialMockPageState: missingInstrumentPage,
      },
    ),
    fixture(
      "instrument_verification_failed",
      "Instrument verification failed",
      "mock_instrument_verification_failed",
      {
        dryRunReport: readyBuyDryRun,
        handoffChain: readyBuyChain,
        initialMockPageState: failedVerificationPage,
      },
    ),
    fixture("order_ticket_blocked", "Order ticket blocked", "mock_order_ticket_blocked", {
      dryRunReport: readyBuyDryRun,
      handoffChain: readyBuyChain,
      initialMockPageState: blockedOrderTicketPage,
    }),
    fixture("stop_before_final_kop", "Stop before final KÖP", "mock_final_human_action_required", {
      dryRunReport: dryRunReport("stop_before_final_kop"),
      handoffChain: handoffChain("stop_before_final_kop"),
      initialMockPageState: initialBuyPage,
    }),
    fixture("stop_before_final_salj", "Stop before final SÄLJ", "mock_final_human_action_required", {
      dryRunReport: dryRunReport("stop_before_final_salj"),
      handoffChain: handoffChain("stop_before_final_salj"),
      initialMockPageState: initialSellPage,
    }),
    fixture(
      "search_real_execution_forbidden",
      "Search real execution forbidden",
      "mock_final_human_action_required",
      {
        dryRunReport: dryRunReport("search_simulated_not_executed"),
        handoffChain: handoffChain("search_execution_forbidden"),
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture(
      "navigation_real_execution_forbidden",
      "Navigation real execution forbidden",
      "mock_final_human_action_required",
      {
        dryRunReport: dryRunReport("navigation_simulated_not_executed"),
        handoffChain: handoffChain("navigation_forbidden"),
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture(
      "form_fill_real_execution_forbidden",
      "Form fill real execution forbidden",
      "mock_final_human_action_required",
      {
        dryRunReport: dryRunReport("order_fields_simulated_not_filled"),
        handoffChain: handoffChain("form_fill_forbidden"),
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture(
      "click_real_execution_forbidden",
      "Click real execution forbidden",
      "mock_final_human_action_required",
      {
        dryRunReport: readyBuyDryRun,
        handoffChain: readyBuyChain,
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "mock_final_human_action_required",
      {
        dryRunReport: dryRunReport("order_submission_forbidden"),
        handoffChain: handoffChain("order_submission_forbidden"),
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture(
      "cookie_session_forbidden",
      "Cookie/session forbidden",
      "mock_final_human_action_required",
      {
        dryRunReport: dryRunReport("cookie_session_forbidden"),
        handoffChain: handoffChain("cookie_session_forbidden"),
        initialMockPageState: initialBuyPage,
      },
    ),
    fixture("bankid_forbidden", "BankID forbidden", "mock_final_human_action_required", {
      dryRunReport: dryRunReport("bankid_forbidden"),
      handoffChain: handoffChain("bankid_forbidden"),
      initialMockPageState: initialBuyPage,
    }),
    fixture("error", "Error fixture", "mock_error", {
      forceError: true,
    }),
    fixture("unknown", "Unknown fixture", "unknown", {
      forceUnknown: true,
    }),
  ];
