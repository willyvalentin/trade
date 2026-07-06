import {
  buildAvanzaInstrumentToOrderLocalDevExecutorState,
  toAvanzaInstrumentToOrderLocalDevSafeReport,
  type AvanzaInstrumentToOrderLocalDevActionReport,
  type AvanzaInstrumentToOrderLocalDevExecutorConfig,
  type AvanzaInstrumentToOrderLocalDevExecutorReport,
  type AvanzaInstrumentToOrderLocalDevExecutorStatus,
} from "./avanza-instrument-to-order-local-dev-executor";
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
import {
  avanzaInstrumentToOrderMockExecutorFixtures,
} from "./avanza-instrument-to-order-mock-executor-fixtures";
import type {
  AvanzaInstrumentToOrderMockExecutorReport,
} from "./avanza-instrument-to-order-mock-executor";

export type AvanzaInstrumentToOrderLocalDevExecutorFixtureId =
  | "disabled"
  | "ready_buy_local_dev_executor"
  | "ready_sell_local_dev_executor"
  | "successful_buy_local_dev_injected_execution_to_review_values_hidden"
  | "successful_sell_local_dev_injected_execution_to_review_values_hidden"
  | "dry_run_true_blocks_execution"
  | "waiting_for_handoff_chain"
  | "search_action_failed"
  | "search_result_selection_failed"
  | "instrument_verification_failed"
  | "buy_sell_entry_not_located"
  | "order_quantity_fill_failed"
  | "order_limit_price_fill_failed"
  | "order_review_not_ready"
  | "final_human_action_required"
  | "order_submission_forbidden"
  | "final_buy_sell_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaInstrumentToOrderLocalDevExecutorFixture = {
  fixtureId: AvanzaInstrumentToOrderLocalDevExecutorFixtureId;
  label: string;
  expectedStatus: AvanzaInstrumentToOrderLocalDevExecutorStatus;
  report: AvanzaInstrumentToOrderLocalDevExecutorReport;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const baseConfig: AvanzaInstrumentToOrderLocalDevExecutorConfig = {
  executorId: "fixture-avanza-instrument-to-order-local-dev-executor",
  mode: "local_dev_mock_injected",
  enabled: true,
  localDevOnly: true,
  allowSearchActions: true,
  allowFillSearchInput: true,
  allowSelectSearchResult: true,
  allowReadInstrumentVerificationSnapshot: true,
  allowLocateBuySellEntry: true,
  allowFillOrderFields: true,
  allowReadOrderReviewSnapshot: true,
  allowFinalBuyClick: false,
  allowFinalSellClick: false,
  allowOrderSubmit: false,
  allowCookieRead: false,
  allowSessionExport: false,
  allowBankIdAutomation: false,
  now: fixtureNow,
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

function mockReport(fixtureId: string): AvanzaInstrumentToOrderMockExecutorReport {
  const fixture = avanzaInstrumentToOrderMockExecutorFixtures.find(
    (candidate) => candidate.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing mock executor fixture: ${fixtureId}`);
  }

  return fixture.report;
}

const readyBuyChain = handoffChain("complete_buy_handoff_chain_ready");
const readySellChain = handoffChain("complete_sell_handoff_chain_ready");
const readyBuyDryRun = dryRunReport("buy_dry_run_passed_to_final_human_action");
const readySellDryRun = dryRunReport("sell_dry_run_passed_to_final_human_action");
const readyBuyMock = mockReport("valid_buy_mock_executed_to_final_human_action");
const readySellMock = mockReport("valid_sell_mock_executed_to_final_human_action");

function fixture(
  fixtureId: AvanzaInstrumentToOrderLocalDevExecutorFixtureId,
  label: string,
  expectedStatus: AvanzaInstrumentToOrderLocalDevExecutorStatus,
  options: {
    config?: AvanzaInstrumentToOrderLocalDevExecutorConfig;
    handoffChain?: AvanzaInstrumentToOrderHandoffChain;
    dryRunReport?: AvanzaInstrumentToOrderDryRunReport;
    mockExecutorReport?: AvanzaInstrumentToOrderMockExecutorReport;
    reportTransform?: (
      report: AvanzaInstrumentToOrderLocalDevExecutorReport,
    ) => AvanzaInstrumentToOrderLocalDevExecutorReport;
  } = {},
): AvanzaInstrumentToOrderLocalDevExecutorFixture {
  const report = buildAvanzaInstrumentToOrderLocalDevExecutorState({
    config: {
      ...baseConfig,
      ...options.config,
      executorId: `fixture-${fixtureId}`,
    },
    dryRunReport: options.dryRunReport,
    handoffChain: options.handoffChain,
    mockExecutorReport: options.mockExecutorReport,
    now: fixtureNow,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    report: options.reportTransform
      ? options.reportTransform(report)
      : toAvanzaInstrumentToOrderLocalDevSafeReport(report),
  };
}

function setActionsExecuted(
  actions: AvanzaInstrumentToOrderLocalDevActionReport[],
) {
  return actions.map((action) => ({
    ...action,
    executionStatus:
      action.actionId === "stop_before_final_buy_sell"
        ? ("final_human_action_required" as const)
        : ("executed" as const),
    realBrowserAction: action.actionId !== "stop_before_final_buy_sell",
    valueVisible: false as const,
    safeDisplayValue:
      action.valueUsed === true ? "value hidden" : action.safeDisplayValue,
    orderSubmitted: false as const,
    finalBuySellClicked: false as const,
  }));
}

function executedToReview(
  report: AvanzaInstrumentToOrderLocalDevExecutorReport,
): AvanzaInstrumentToOrderLocalDevExecutorReport {
  return toAvanzaInstrumentToOrderLocalDevSafeReport({
    ...report,
    status: "executed_to_review",
    label: "Instrument to order local-dev executor reached review",
    reason:
      "Injected local-dev order/search actions reached review and stopped before final KOP/SALJ.",
    searchExecuted: true,
    instrumentSelected: true,
    instrumentVerificationRead: true,
    instrumentVerificationPassed: true,
    buySellEntryLocated: true,
    orderFieldsPrepared: true,
    orderReviewReady: true,
    finalHumanActionRequired: true,
    orderSubmitted: false,
    finalBuySellClicked: false,
    actionReports: setActionsExecuted(report.actionReports),
    warnings: [
      ...report.warnings,
      "Final human action required; final KOP/SALJ was not clicked.",
    ],
    blockedReasons: [],
  });
}

function failedReport(
  status: AvanzaInstrumentToOrderLocalDevExecutorStatus,
  actionId: string,
  reason: string,
) {
  return (report: AvanzaInstrumentToOrderLocalDevExecutorReport) =>
    toAvanzaInstrumentToOrderLocalDevSafeReport({
      ...report,
      status,
      label: status.replaceAll("_", " "),
      reason,
      actionReports: report.actionReports.map((action) =>
        action.actionId === actionId
          ? {
              ...action,
              executionStatus: "failed",
              actualResult: reason,
              blockedReason: reason,
              realBrowserAction: false,
            }
          : action,
      ),
      blockedReasons: [reason],
    });
}

export const avanzaInstrumentToOrderLocalDevExecutorFixtures:
  AvanzaInstrumentToOrderLocalDevExecutorFixture[] = [
    fixture("disabled", "Disabled local-dev executor", "disabled", {
      config: { ...baseConfig, enabled: false, mode: "disabled" },
      handoffChain: readyBuyChain,
    }),
    fixture("ready_buy_local_dev_executor", "Ready BUY local-dev executor", "ready", {
      dryRunReport: readyBuyDryRun,
      handoffChain: readyBuyChain,
      mockExecutorReport: readyBuyMock,
    }),
    fixture("ready_sell_local_dev_executor", "Ready SELL local-dev executor", "ready", {
      dryRunReport: readySellDryRun,
      handoffChain: readySellChain,
      mockExecutorReport: readySellMock,
    }),
    fixture(
      "successful_buy_local_dev_injected_execution_to_review_values_hidden",
      "Successful BUY local-dev injected execution to review, values hidden",
      "executed_to_review",
      {
        dryRunReport: readyBuyDryRun,
        handoffChain: readyBuyChain,
        mockExecutorReport: readyBuyMock,
        reportTransform: executedToReview,
      },
    ),
    fixture(
      "successful_sell_local_dev_injected_execution_to_review_values_hidden",
      "Successful SELL local-dev injected execution to review, values hidden",
      "executed_to_review",
      {
        dryRunReport: readySellDryRun,
        handoffChain: readySellChain,
        mockExecutorReport: readySellMock,
        reportTransform: executedToReview,
      },
    ),
    fixture("dry_run_true_blocks_execution", "dryRun true blocks execution", "ready", {
      config: { ...baseConfig, dryRun: true },
      dryRunReport: readyBuyDryRun,
      handoffChain: readyBuyChain,
      mockExecutorReport: readyBuyMock,
    }),
    fixture(
      "waiting_for_handoff_chain",
      "Waiting for handoff chain",
      "waiting_for_handoff_chain",
      { handoffChain: undefined },
    ),
    fixture("search_action_failed", "Search action failed", "instrument_search_failed", {
      handoffChain: readyBuyChain,
      reportTransform: failedReport(
        "instrument_search_failed",
        "click_search",
        "Search action failed in fixture.",
      ),
    }),
    fixture(
      "search_result_selection_failed",
      "Search result selection failed",
      "instrument_search_failed",
      {
        handoffChain: readyBuyChain,
        reportTransform: failedReport(
          "instrument_search_failed",
          "select_search_result",
          "Search result selection failed in fixture.",
        ),
      },
    ),
    fixture(
      "instrument_verification_failed",
      "Instrument verification failed",
      "instrument_verification_failed",
      {
        handoffChain: readyBuyChain,
        reportTransform: failedReport(
          "instrument_verification_failed",
          "read_instrument_snapshot",
          "Instrument verification failed in fixture.",
        ),
      },
    ),
    fixture(
      "buy_sell_entry_not_located",
      "BUY/SELL entry not located",
      "order_ticket_preparation_failed",
      {
        handoffChain: readyBuyChain,
        reportTransform: failedReport(
          "order_ticket_preparation_failed",
          "locate_buy_sell_entry",
          "BUY/SELL entry was not located in fixture.",
        ),
      },
    ),
    fixture(
      "order_quantity_fill_failed",
      "Order quantity fill failed",
      "order_ticket_preparation_failed",
      {
        handoffChain: readyBuyChain,
        reportTransform: failedReport(
          "order_ticket_preparation_failed",
          "fill_quantity",
          "Order quantity fill failed in fixture.",
        ),
      },
    ),
    fixture(
      "order_limit_price_fill_failed",
      "Order limit price fill failed",
      "order_ticket_preparation_failed",
      {
        handoffChain: readyBuyChain,
        reportTransform: failedReport(
          "order_ticket_preparation_failed",
          "fill_limit_price",
          "Order limit price fill failed in fixture.",
        ),
      },
    ),
    fixture("order_review_not_ready", "Order review not ready", "order_review_not_ready", {
      handoffChain: readyBuyChain,
      reportTransform: failedReport(
        "order_review_not_ready",
        "wait_for_order_review",
        "Order review was not ready in fixture.",
      ),
    }),
    fixture(
      "final_human_action_required",
      "Final human action required",
      "final_human_action_required",
      {
        handoffChain: readyBuyChain,
        reportTransform: (report) =>
          toAvanzaInstrumentToOrderLocalDevSafeReport({
            ...executedToReview(report),
            status: "final_human_action_required",
            label: "Final human action required",
            reason: "Executor stopped before final KOP/SALJ.",
          }),
      },
    ),
    fixture("order_submission_forbidden", "Order submission forbidden", "blocked", {
      config: { ...baseConfig, allowOrderSubmit: true },
      handoffChain: readyBuyChain,
    }),
    fixture("final_buy_sell_forbidden", "Final buy/sell forbidden", "blocked", {
      config: {
        ...baseConfig,
        allowFinalBuyClick: true,
        allowFinalSellClick: true,
      },
      handoffChain: readyBuyChain,
    }),
    fixture("cookie_session_forbidden", "Cookie/session forbidden", "blocked", {
      config: {
        ...baseConfig,
        allowCookieRead: true,
        allowSessionExport: true,
      },
      handoffChain: readyBuyChain,
    }),
    fixture("bankid_forbidden", "BankID forbidden", "blocked", {
      config: { ...baseConfig, allowBankIdAutomation: true },
      handoffChain: readyBuyChain,
    }),
    fixture("error", "Error", "error", {
      config: { ...baseConfig, forceError: true },
      handoffChain: readyBuyChain,
    }),
    fixture("unknown", "Unknown", "unknown", {
      config: { ...baseConfig, statusOverride: "unknown" },
      handoffChain: readyBuyChain,
    }),
  ];
