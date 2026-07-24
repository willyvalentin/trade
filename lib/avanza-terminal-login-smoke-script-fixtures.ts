import {
  buildAvanzaIsolatedLoginSmokeTestRunnerState,
  type AvanzaIsolatedLoginSmokeTestRunnerConfig,
  type AvanzaIsolatedLoginSmokeTestRunnerReport,
  type AvanzaIsolatedLoginSmokeTestRunnerStatus,
} from "./avanza-isolated-login-smoke-test-runner";

export type AvanzaTerminalLoginSmokeScriptFixtureId =
  | "script_disabled"
  | "ci_blocked"
  | "missing_ture_avanza_login_smoke_test"
  | "missing_ture_local_dev_confirm"
  | "model_only_ready"
  | "dry_run_ready"
  | "real_run_flag_missing"
  | "real_run_ready_all_gates"
  | "bankid_or_mfa_stop"
  | "order_submission_forbidden"
  | "final_buy_sell_forbidden"
  | "trade_ui_wiring_forbidden"
  | "api_route_wiring_forbidden"
  | "error"
  | "unknown";

export type AvanzaTerminalLoginSmokeScriptFixture = {
  fixtureId: AvanzaTerminalLoginSmokeScriptFixtureId;
  label: string;
  reason: string;
  expectedStatus: AvanzaIsolatedLoginSmokeTestRunnerStatus;
  envOptInPresent: boolean;
  manualLocalConfirmationPresent: boolean;
  realRunFlagPresent: boolean;
  config: AvanzaIsolatedLoginSmokeTestRunnerConfig;
  report: AvanzaIsolatedLoginSmokeTestRunnerReport;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const baseConfig = {
  allowApiRouteWiring: false,
  allowBankIdAutomation: false,
  allowCiExecution: false,
  allowCookieRead: false,
  allowCredentialRuntimeBundle: false,
  allowFinalBuyClick: false,
  allowFinalSellClick: false,
  allowNavigationToAvanzaLogin: false,
  allowOrderSubmit: false,
  allowRealPlaywrightPage: false,
  allowSessionExport: false,
  allowTradeUiWiring: false,
  allowUsernamePasswordLogin: false,
  enabled: true,
  explicitEnvOptInPresent: true,
  isCi: false,
  isLocalDev: true,
  localDevOnly: true,
  manualTerminalRunConfirmed: true,
  mode: "local_dev_dry_run",
  now: fixtureNow,
  requireExplicitEnvOptIn: true,
  requireManualTerminalRun: true,
  warnings: [
    "Terminal-only scaffold: fixture/model only, no credentials, no cookies/session, no order submission, no final buy/sell click.",
  ],
} satisfies AvanzaIsolatedLoginSmokeTestRunnerConfig;

function buildFixture(
  fixtureId: AvanzaTerminalLoginSmokeScriptFixtureId,
  label: string,
  reason: string,
  expectedStatus: AvanzaIsolatedLoginSmokeTestRunnerStatus,
  config: AvanzaIsolatedLoginSmokeTestRunnerConfig,
  envGates: {
    envOptInPresent?: boolean;
    manualLocalConfirmationPresent?: boolean;
    realRunFlagPresent?: boolean;
  } = {},
): AvanzaTerminalLoginSmokeScriptFixture {
  const fixtureConfig = {
    ...baseConfig,
    runnerId: `terminal-script-${fixtureId}`,
    ...config,
  };

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
    report: buildAvanzaIsolatedLoginSmokeTestRunnerState(fixtureConfig),
  };
}

export const avanzaTerminalLoginSmokeScriptFixtures:
  AvanzaTerminalLoginSmokeScriptFixture[] = [
    buildFixture(
      "script_disabled",
      "Script disabled",
      "Script scaffold is disabled by model state.",
      "disabled",
      {
        enabled: false,
        mode: "disabled",
      },
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
      "missing_ture_avanza_login_smoke_test",
      "Missing TURE_AVANZA_LOGIN_SMOKE_TEST",
      "Explicit env opt-in is missing.",
      "not_configured",
      {
        explicitEnvOptInPresent: false,
      },
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
      {
        manualTerminalRunConfirmed: false,
      },
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
      {
        mode: "model_only",
      },
      {
        realRunFlagPresent: false,
      },
    ),
    buildFixture(
      "dry_run_ready",
      "Dry-run ready",
      "Local-dev dry-run safe report can be inspected.",
      "dry_run_completed",
      {},
      {
        realRunFlagPresent: false,
      },
    ),
    buildFixture(
      "real_run_flag_missing",
      "Real-run flag missing",
      "Dry-run remains selected until TURE_AVANZA_LOGIN_REAL_RUN is present.",
      "dry_run_completed",
      {},
      {
        realRunFlagPresent: false,
      },
    ),
    buildFixture(
      "real_run_ready_all_gates",
      "Real-run ready with all gates",
      "All explicit local terminal gates are modeled as present.",
      "real_run_ready",
      {
        allowCredentialRuntimeBundle: true,
        allowNavigationToAvanzaLogin: true,
        allowRealPlaywrightPage: true,
        allowUsernamePasswordLogin: true,
        mode: "local_dev_explicit_real_run",
      },
      {
        realRunFlagPresent: true,
      },
    ),
    buildFixture(
      "bankid_or_mfa_stop",
      "BankID/MFA stop",
      "BankID/MFA remains manual-action only.",
      "bankid_or_mfa_stop",
      {
        statusOverride: "bankid_or_mfa_stop",
      },
    ),
    buildFixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "Order submission remains forbidden.",
      "unsafe_environment_blocked",
      {
        allowOrderSubmit: true,
      },
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
      {
        allowTradeUiWiring: true,
      },
    ),
    buildFixture(
      "api_route_wiring_forbidden",
      "API route wiring forbidden",
      "API route wiring remains forbidden.",
      "unsafe_environment_blocked",
      {
        allowApiRouteWiring: true,
      },
    ),
    buildFixture("error", "Error", "Modeled script error.", "error", {
      forceError: true,
    }),
    buildFixture("unknown", "Unknown", "Unknown script state.", "unknown", {
      statusOverride: "unknown",
    }),
  ];
