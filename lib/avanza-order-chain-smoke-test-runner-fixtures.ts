import {
  buildAvanzaOrderChainSmokeTestRunnerState,
  toAvanzaOrderChainSmokeTestRunnerSafeReport,
  type AvanzaOrderChainSmokeTestRunnerConfig,
  type AvanzaOrderChainSmokeTestRunnerReport,
  type AvanzaOrderChainSmokeTestRunnerStatus,
} from "./avanza-order-chain-smoke-test-runner";

export type AvanzaOrderChainSmokeTestRunnerFixtureId =
  | "disabled"
  | "model_only_completed"
  | "local_dev_dry_run_completed"
  | "explicit_real_run_ready"
  | "explicit_real_run_blocked_missing_env_opt_in"
  | "explicit_real_run_blocked_missing_terminal_confirmation"
  | "ci_blocked"
  | "unsafe_environment_blocked"
  | "successful_modeled_buy_smoke_test_safe_report"
  | "successful_modeled_sell_smoke_test_safe_report"
  | "real_run_completed_to_review"
  | "final_human_action_required"
  | "order_submission_forbidden"
  | "final_buy_sell_forbidden"
  | "trade_ui_wiring_forbidden"
  | "api_route_wiring_forbidden"
  | "cookie_session_forbidden"
  | "bankid_forbidden"
  | "error"
  | "unknown";

export type AvanzaOrderChainSmokeTestRunnerFixture = {
  fixtureId: AvanzaOrderChainSmokeTestRunnerFixtureId;
  label: string;
  expectedStatus: AvanzaOrderChainSmokeTestRunnerStatus;
  report: AvanzaOrderChainSmokeTestRunnerReport;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const baseConfig: AvanzaOrderChainSmokeTestRunnerConfig = {
  runnerId: "fixture-avanza-order-chain-smoke-test-runner",
  mode: "local_dev_explicit_real_run",
  enabled: true,
  localDevOnly: true,
  requireExplicitEnvOptIn: true,
  explicitEnvOptInPresent: true,
  requireManualTerminalRun: true,
  manualTerminalRunConfirmed: true,
  isCi: false,
  isLocalDev: true,
  allowRealPlaywrightPage: true,
  allowOrderChainExecutor: true,
  allowInstrumentSearch: true,
  allowOrderFieldPreparation: true,
  allowOrderReviewState: true,
  allowFinalBuyClick: false,
  allowFinalSellClick: false,
  allowOrderSubmit: false,
  allowCookieRead: false,
  allowSessionExport: false,
  allowBankIdAutomation: false,
  allowTradeUiWiring: false,
  allowApiRouteWiring: false,
  allowCiExecution: false,
  side: "buy",
  ticker: "NOKIA",
  instrumentName: "Nokia ADR",
  now: fixtureNow,
};

function safeFixtureReport(
  report: AvanzaOrderChainSmokeTestRunnerReport,
): AvanzaOrderChainSmokeTestRunnerReport {
  return toAvanzaOrderChainSmokeTestRunnerSafeReport(report);
}

function fixture(
  fixtureId: AvanzaOrderChainSmokeTestRunnerFixtureId,
  label: string,
  expectedStatus: AvanzaOrderChainSmokeTestRunnerStatus,
  options: {
    config?: AvanzaOrderChainSmokeTestRunnerConfig;
    reportTransform?: (
      report: AvanzaOrderChainSmokeTestRunnerReport,
    ) => AvanzaOrderChainSmokeTestRunnerReport;
  } = {},
): AvanzaOrderChainSmokeTestRunnerFixture {
  const report = buildAvanzaOrderChainSmokeTestRunnerState({
    ...baseConfig,
    ...options.config,
    runnerId: `fixture-${fixtureId}`,
    now: fixtureNow,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    report: options.reportTransform
      ? safeFixtureReport(options.reportTransform(report))
      : safeFixtureReport(report),
  };
}

function completedToReview(
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
      "Final human action required; final KOP/SALJ was not clicked.",
    ],
    blockedReasons: [],
  };
}

function modeledCompleted(
  side: "buy" | "sell",
  report: AvanzaOrderChainSmokeTestRunnerReport,
): AvanzaOrderChainSmokeTestRunnerReport {
  return {
    ...report,
    side,
    ticker: side === "sell" ? "ERIC B" : "NOKIA",
    instrumentName: side === "sell" ? "Ericsson B" : "Nokia ADR",
    smokeTestExecuted: false,
    realPlaywrightPageUsed: false,
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
      "Modeled smoke path only; no real page action was run.",
    ],
  };
}

function finalHumanRequired(
  report: AvanzaOrderChainSmokeTestRunnerReport,
): AvanzaOrderChainSmokeTestRunnerReport {
  return {
    ...completedToReview(report),
    status: "final_human_action_required",
    label: "Final human action required",
    reason:
      "The runner stopped at review-ready state and requires manual final action.",
  };
}

export const avanzaOrderChainSmokeTestRunnerFixtures:
  AvanzaOrderChainSmokeTestRunnerFixture[] = [
    fixture("disabled", "Disabled order chain smoke test runner", "disabled", {
      config: { enabled: false, mode: "disabled" },
    }),
    fixture("model_only_completed", "Model-only smoke report completed", "modeled_run_completed", {
      config: {
        mode: "model_only",
        allowRealPlaywrightPage: false,
        allowOrderChainExecutor: false,
        allowInstrumentSearch: false,
        allowOrderFieldPreparation: false,
        allowOrderReviewState: false,
      },
    }),
    fixture(
      "local_dev_dry_run_completed",
      "Local-dev dry-run smoke report completed",
      "dry_run_completed",
      {
        config: {
          mode: "local_dev_dry_run",
          allowRealPlaywrightPage: false,
          allowOrderChainExecutor: false,
          allowInstrumentSearch: false,
          allowOrderFieldPreparation: false,
          allowOrderReviewState: false,
        },
      },
    ),
    fixture(
      "explicit_real_run_ready",
      "Explicit real-run smoke gates ready",
      "real_run_ready",
    ),
    fixture(
      "explicit_real_run_blocked_missing_env_opt_in",
      "Explicit real-run blocked: missing env opt-in",
      "not_configured",
      { config: { explicitEnvOptInPresent: false } },
    ),
    fixture(
      "explicit_real_run_blocked_missing_terminal_confirmation",
      "Explicit real-run blocked: missing terminal confirmation",
      "not_configured",
      { config: { manualTerminalRunConfirmed: false } },
    ),
    fixture("ci_blocked", "CI blocked", "ci_blocked", {
      config: { isCi: true, isLocalDev: false },
    }),
    fixture(
      "unsafe_environment_blocked",
      "Unsafe environment blocked",
      "unsafe_environment_blocked",
      { config: { allowOrderSubmit: true } },
    ),
    fixture(
      "successful_modeled_buy_smoke_test_safe_report",
      "Successful modeled BUY smoke test safe report",
      "modeled_run_completed",
      {
        config: {
          mode: "model_only",
          allowRealPlaywrightPage: false,
          allowOrderChainExecutor: false,
          allowInstrumentSearch: false,
          allowOrderFieldPreparation: false,
          allowOrderReviewState: false,
          side: "buy",
          ticker: "NOKIA",
          instrumentName: "Nokia ADR",
        },
        reportTransform: (report) => modeledCompleted("buy", report),
      },
    ),
    fixture(
      "successful_modeled_sell_smoke_test_safe_report",
      "Successful modeled SELL smoke test safe report",
      "modeled_run_completed",
      {
        config: {
          mode: "model_only",
          allowRealPlaywrightPage: false,
          allowOrderChainExecutor: false,
          allowInstrumentSearch: false,
          allowOrderFieldPreparation: false,
          allowOrderReviewState: false,
          side: "sell",
          ticker: "ERIC B",
          instrumentName: "Ericsson B",
        },
        reportTransform: (report) => modeledCompleted("sell", report),
      },
    ),
    fixture(
      "real_run_completed_to_review",
      "Real run completed to review",
      "real_run_completed_to_review",
      { reportTransform: completedToReview },
    ),
    fixture(
      "final_human_action_required",
      "Final human action required",
      "final_human_action_required",
      {
        config: { statusOverride: "final_human_action_required" },
        reportTransform: finalHumanRequired,
      },
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "unsafe_environment_blocked",
      { config: { allowOrderSubmit: true } },
    ),
    fixture(
      "final_buy_sell_forbidden",
      "Final buy/sell forbidden",
      "unsafe_environment_blocked",
      { config: { allowFinalBuyClick: true } },
    ),
    fixture(
      "trade_ui_wiring_forbidden",
      "Trade UI wiring forbidden",
      "unsafe_environment_blocked",
      { config: { allowTradeUiWiring: true } },
    ),
    fixture(
      "api_route_wiring_forbidden",
      "API route wiring forbidden",
      "unsafe_environment_blocked",
      { config: { allowApiRouteWiring: true } },
    ),
    fixture(
      "cookie_session_forbidden",
      "Cookie/session forbidden",
      "unsafe_environment_blocked",
      { config: { allowCookieRead: true, allowSessionExport: true } },
    ),
    fixture("bankid_forbidden", "BankID forbidden", "unsafe_environment_blocked", {
      config: { allowBankIdAutomation: true },
    }),
    fixture("error", "Error state", "error", { config: { forceError: true } }),
    fixture("unknown", "Unknown state", "unknown", {
      config: { statusOverride: "unknown" },
    }),
  ];
