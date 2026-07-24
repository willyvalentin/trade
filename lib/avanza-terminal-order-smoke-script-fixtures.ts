import {
  buildAvanzaOrderChainSmokeTestRunnerState,
  toAvanzaOrderChainSmokeTestRunnerSafeReport,
  type AvanzaOrderChainSmokeTestRunnerConfig,
  type AvanzaOrderChainSmokeTestRunnerReport,
  type AvanzaOrderChainSmokeTestRunnerStatus,
} from "./avanza-order-chain-smoke-test-runner";

export type AvanzaTerminalOrderSmokeScriptFixtureId =
  | "script_disabled"
  | "ci_blocked"
  | "missing_ture_avanza_order_smoke_test"
  | "missing_ture_local_dev_confirm"
  | "model_only_ready"
  | "dry_run_ready"
  | "real_run_flag_missing"
  | "real_run_ready_all_gates"
  | "successful_safe_model_report_to_review_ready"
  | "final_human_action_required"
  | "order_submission_forbidden"
  | "final_buy_sell_forbidden"
  | "trade_ui_wiring_forbidden"
  | "api_route_wiring_forbidden"
  | "cookies_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaTerminalOrderSmokeScriptFixture = {
  fixtureId: AvanzaTerminalOrderSmokeScriptFixtureId;
  label: string;
  reason: string;
  expectedStatus: AvanzaOrderChainSmokeTestRunnerStatus;
  envOptInPresent: boolean;
  manualLocalConfirmationPresent: boolean;
  realRunFlagPresent: boolean;
  config: AvanzaOrderChainSmokeTestRunnerConfig;
  report: AvanzaOrderChainSmokeTestRunnerReport;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const baseConfig = {
  allowApiRouteWiring: false,
  allowBankIdAutomation: false,
  allowCiExecution: false,
  allowCookieRead: false,
  allowFinalBuyClick: false,
  allowFinalSellClick: false,
  allowInstrumentSearch: false,
  allowOrderChainExecutor: false,
  allowOrderFieldPreparation: false,
  allowOrderReviewState: false,
  allowOrderSubmit: false,
  allowRealPlaywrightPage: false,
  allowSessionExport: false,
  allowTradeUiWiring: false,
  enabled: true,
  explicitEnvOptInPresent: true,
  instrumentName: "Nokia ADR",
  isCi: false,
  isLocalDev: true,
  localDevOnly: true,
  manualTerminalRunConfirmed: true,
  mode: "local_dev_dry_run",
  now: fixtureNow,
  requireExplicitEnvOptIn: true,
  requireManualTerminalRun: true,
  side: "buy",
  ticker: "NOKIA",
  warnings: [
    "Terminal-only scaffold: fixture/model only, no raw fill values, no cookies/session, no order submission, no final buy/sell click.",
  ],
} satisfies AvanzaOrderChainSmokeTestRunnerConfig;

function buildFixture(
  fixtureId: AvanzaTerminalOrderSmokeScriptFixtureId,
  label: string,
  reason: string,
  expectedStatus: AvanzaOrderChainSmokeTestRunnerStatus,
  config: AvanzaOrderChainSmokeTestRunnerConfig,
  envGates: {
    envOptInPresent?: boolean;
    manualLocalConfirmationPresent?: boolean;
    realRunFlagPresent?: boolean;
  } = {},
  reportTransform?: (
    report: AvanzaOrderChainSmokeTestRunnerReport,
  ) => AvanzaOrderChainSmokeTestRunnerReport,
): AvanzaTerminalOrderSmokeScriptFixture {
  const fixtureConfig = {
    ...baseConfig,
    runnerId: `terminal-order-script-${fixtureId}`,
    ...config,
  };
  const report = buildAvanzaOrderChainSmokeTestRunnerState(fixtureConfig);

  return {
    fixtureId,
    label,
    reason,
    expectedStatus,
    envOptInPresent:
      envGates.envOptInPresent ?? fixtureConfig.explicitEnvOptInPresent === true,
    manualLocalConfirmationPresent:
      envGates.manualLocalConfirmationPresent ??
      fixtureConfig.manualTerminalRunConfirmed === true,
    realRunFlagPresent:
      envGates.realRunFlagPresent ??
      fixtureConfig.mode === "local_dev_explicit_real_run",
    config: fixtureConfig,
    report: toAvanzaOrderChainSmokeTestRunnerSafeReport(
      reportTransform ? reportTransform(report) : report,
    ),
  };
}

function reviewReadyReport(
  report: AvanzaOrderChainSmokeTestRunnerReport,
): AvanzaOrderChainSmokeTestRunnerReport {
  return {
    ...report,
    status: "real_run_completed_to_review",
    label: "Real run completed to review",
    reason:
      "Injected dependencies reached review-ready state and stopped before final KOP/SALJ.",
    smokeTestExecuted: true,
    realPlaywrightPageUsed: true,
    searchExecuted: true,
    instrumentSelected: true,
    instrumentVerificationPassed: true,
    orderFieldsPrepared: true,
    orderReviewReady: true,
    finalHumanActionRequired: true,
    orderSubmitted: false,
    finalBuySellClicked: false,
    warnings: [
      ...report.warnings,
      "Review-ready maximum endpoint; final human action required.",
    ],
    blockedReasons: [],
  };
}

function finalHumanRequiredReport(
  report: AvanzaOrderChainSmokeTestRunnerReport,
): AvanzaOrderChainSmokeTestRunnerReport {
  return {
    ...reviewReadyReport(report),
    status: "final_human_action_required",
    label: "Final human action required",
    reason:
      "The terminal scaffold stops before final KOP/SALJ and requires human action.",
  };
}

export const avanzaTerminalOrderSmokeScriptFixtures:
  AvanzaTerminalOrderSmokeScriptFixture[] = [
    buildFixture(
      "script_disabled",
      "Script disabled",
      "Script scaffold is disabled by model state.",
      "disabled",
      { enabled: false, mode: "disabled" },
      {
        envOptInPresent: false,
        manualLocalConfirmationPresent: false,
        realRunFlagPresent: false,
      },
    ),
    buildFixture("ci_blocked", "CI blocked", "CI execution is blocked.", "ci_blocked", {
      isCi: true,
      isLocalDev: false,
      mode: "local_dev_explicit_real_run",
    }),
    buildFixture(
      "missing_ture_avanza_order_smoke_test",
      "Missing TURE_AVANZA_ORDER_SMOKE_TEST",
      "Explicit env opt-in is missing.",
      "not_configured",
      { explicitEnvOptInPresent: false },
      {
        envOptInPresent: false,
        realRunFlagPresent: false,
      },
    ),
    buildFixture(
      "missing_ture_local_dev_confirm",
      "Missing TURE_LOCAL_DEV_CONFIRM",
      "Manual local confirmation is missing.",
      "not_configured",
      { manualTerminalRunConfirmed: false },
      {
        manualLocalConfirmationPresent: false,
        realRunFlagPresent: false,
      },
    ),
    buildFixture(
      "model_only_ready",
      "Model-only ready",
      "Model-only safe report can be inspected.",
      "modeled_run_completed",
      { mode: "model_only" },
      { realRunFlagPresent: false },
    ),
    buildFixture(
      "dry_run_ready",
      "Dry-run ready",
      "Local-dev dry-run safe report can be inspected.",
      "dry_run_completed",
      {},
      { realRunFlagPresent: false },
    ),
    buildFixture(
      "real_run_flag_missing",
      "Real-run flag missing",
      "Dry-run remains selected until TURE_AVANZA_ORDER_REAL_RUN is present.",
      "dry_run_completed",
      {},
      { realRunFlagPresent: false },
    ),
    buildFixture(
      "real_run_ready_all_gates",
      "Real-run ready with all gates",
      "All explicit local terminal gates are modeled as present.",
      "real_run_ready",
      {
        allowInstrumentSearch: true,
        allowOrderChainExecutor: true,
        allowOrderFieldPreparation: true,
        allowOrderReviewState: true,
        allowRealPlaywrightPage: true,
        mode: "local_dev_explicit_real_run",
      },
      { realRunFlagPresent: true },
    ),
    buildFixture(
      "successful_safe_model_report_to_review_ready",
      "Successful safe model report to review-ready",
      "Injected dependencies can model a safe review-ready stop.",
      "real_run_completed_to_review",
      {
        allowInstrumentSearch: true,
        allowOrderChainExecutor: true,
        allowOrderFieldPreparation: true,
        allowOrderReviewState: true,
        allowRealPlaywrightPage: true,
        mode: "local_dev_explicit_real_run",
      },
      { realRunFlagPresent: true },
      reviewReadyReport,
    ),
    buildFixture(
      "final_human_action_required",
      "Final human action required",
      "Review-ready stop requires manual final action.",
      "final_human_action_required",
      {
        allowInstrumentSearch: true,
        allowOrderChainExecutor: true,
        allowOrderFieldPreparation: true,
        allowOrderReviewState: true,
        allowRealPlaywrightPage: true,
        mode: "local_dev_explicit_real_run",
      },
      { realRunFlagPresent: true },
      finalHumanRequiredReport,
    ),
    buildFixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "Order submission remains forbidden.",
      "unsafe_environment_blocked",
      { allowOrderSubmit: true },
    ),
    buildFixture(
      "final_buy_sell_forbidden",
      "Final buy/sell forbidden",
      "Final buy/sell click remains forbidden.",
      "unsafe_environment_blocked",
      {
        allowFinalBuyClick: true,
        allowFinalSellClick: true,
      },
    ),
    buildFixture(
      "trade_ui_wiring_forbidden",
      "Trade UI wiring forbidden",
      "Trade UI wiring remains forbidden.",
      "unsafe_environment_blocked",
      { allowTradeUiWiring: true },
    ),
    buildFixture(
      "api_route_wiring_forbidden",
      "API route wiring forbidden",
      "API route wiring remains forbidden.",
      "unsafe_environment_blocked",
      { allowApiRouteWiring: true },
    ),
    buildFixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "Cookies/session access remains forbidden.",
      "unsafe_environment_blocked",
      {
        allowCookieRead: true,
        allowSessionExport: true,
      },
    ),
    buildFixture(
      "bankid_forbidden",
      "BankID forbidden",
      "BankID automation remains forbidden.",
      "unsafe_environment_blocked",
      { allowBankIdAutomation: true },
    ),
    buildFixture("error", "Error", "Modeled script error.", "error", {
      forceError: true,
    }),
    buildFixture("unknown", "Unknown", "Unknown script state.", "unknown", {
      statusOverride: "unknown",
    }),
  ];
