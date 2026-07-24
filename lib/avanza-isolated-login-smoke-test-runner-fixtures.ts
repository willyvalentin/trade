import {
  buildAvanzaIsolatedLoginSmokeTestRunnerState,
  type AvanzaIsolatedLoginSmokeTestRunnerConfig,
  type AvanzaIsolatedLoginSmokeTestRunnerReport,
  type AvanzaIsolatedLoginSmokeTestRunnerStatus,
} from "./avanza-isolated-login-smoke-test-runner";

export type AvanzaIsolatedLoginSmokeTestRunnerFixtureId =
  | "disabled"
  | "model_only_completed"
  | "local_dev_dry_run_completed"
  | "explicit_real_run_ready"
  | "explicit_real_run_blocked_missing_env_opt_in"
  | "explicit_real_run_blocked_missing_terminal_confirmation"
  | "ci_blocked"
  | "unsafe_environment_blocked"
  | "missing_credential_bundle"
  | "bankid_or_mfa_stop"
  | "real_run_failed"
  | "order_submission_forbidden"
  | "final_buy_sell_forbidden"
  | "trade_ui_wiring_forbidden"
  | "api_route_wiring_forbidden"
  | "error"
  | "unknown";

export type AvanzaIsolatedLoginSmokeTestRunnerFixture = {
  fixtureId: AvanzaIsolatedLoginSmokeTestRunnerFixtureId;
  label: string;
  expectedStatus: AvanzaIsolatedLoginSmokeTestRunnerStatus;
  config: AvanzaIsolatedLoginSmokeTestRunnerConfig;
  report: AvanzaIsolatedLoginSmokeTestRunnerReport;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const baseConfig = {
  allowApiRouteWiring: false,
  allowBankIdAutomation: false,
  allowCiExecution: false,
  allowCookieRead: false,
  allowCredentialRuntimeBundle: true,
  allowFinalBuyClick: false,
  allowFinalSellClick: false,
  allowNavigationToAvanzaLogin: false,
  allowOrderSubmit: false,
  allowRealPlaywrightPage: false,
  allowSessionExport: false,
  allowTradeUiWiring: false,
  allowUsernamePasswordLogin: true,
  enabled: true,
  explicitEnvOptInPresent: true,
  isCi: false,
  isLocalDev: true,
  localDevOnly: true,
  manualTerminalRunConfirmed: true,
  mode: "model_only",
  now: fixtureNow,
  requireExplicitEnvOptIn: true,
  requireManualTerminalRun: true,
} satisfies AvanzaIsolatedLoginSmokeTestRunnerConfig;

function buildFixture(
  fixtureId: AvanzaIsolatedLoginSmokeTestRunnerFixtureId,
  label: string,
  expectedStatus: AvanzaIsolatedLoginSmokeTestRunnerStatus,
  config: AvanzaIsolatedLoginSmokeTestRunnerConfig = {},
): AvanzaIsolatedLoginSmokeTestRunnerFixture {
  const fixtureConfig = {
    ...baseConfig,
    runnerId: `fixture-${fixtureId}`,
    ...config,
  };

  return {
    fixtureId,
    label,
    expectedStatus,
    config: fixtureConfig,
    report: buildAvanzaIsolatedLoginSmokeTestRunnerState(fixtureConfig),
  };
}

export const avanzaIsolatedLoginSmokeTestRunnerFixtures:
  AvanzaIsolatedLoginSmokeTestRunnerFixture[] = [
    buildFixture("disabled", "Disabled runner", "disabled", {
      enabled: false,
      mode: "disabled",
    }),
    buildFixture(
      "model_only_completed",
      "Model-only completed",
      "modeled_run_completed",
    ),
    buildFixture(
      "local_dev_dry_run_completed",
      "Local-dev dry-run completed",
      "dry_run_completed",
      {
        mode: "local_dev_dry_run",
      },
    ),
    buildFixture(
      "explicit_real_run_ready",
      "Explicit real-run ready",
      "real_run_ready",
      {
        allowNavigationToAvanzaLogin: true,
        allowRealPlaywrightPage: true,
        mode: "local_dev_explicit_real_run",
      },
    ),
    buildFixture(
      "explicit_real_run_blocked_missing_env_opt_in",
      "Explicit real-run blocked missing env opt-in",
      "not_configured",
      {
        allowNavigationToAvanzaLogin: true,
        allowRealPlaywrightPage: true,
        explicitEnvOptInPresent: false,
        mode: "local_dev_explicit_real_run",
      },
    ),
    buildFixture(
      "explicit_real_run_blocked_missing_terminal_confirmation",
      "Explicit real-run blocked missing terminal confirmation",
      "not_configured",
      {
        allowNavigationToAvanzaLogin: true,
        allowRealPlaywrightPage: true,
        manualTerminalRunConfirmed: false,
        mode: "local_dev_explicit_real_run",
      },
    ),
    buildFixture("ci_blocked", "CI blocked", "ci_blocked", {
      isCi: true,
      isLocalDev: false,
      mode: "local_dev_explicit_real_run",
    }),
    buildFixture(
      "unsafe_environment_blocked",
      "Unsafe environment blocked",
      "unsafe_environment_blocked",
      {
        allowCiExecution: true,
      },
    ),
    buildFixture(
      "missing_credential_bundle",
      "Missing credential bundle",
      "real_run_blocked",
      {
        allowCredentialRuntimeBundle: false,
        allowNavigationToAvanzaLogin: true,
        allowRealPlaywrightPage: true,
        blockedReasons: ["Credential runtime bundle is unavailable."],
        mode: "local_dev_explicit_real_run",
      },
    ),
    buildFixture("bankid_or_mfa_stop", "BankID/MFA stop", "bankid_or_mfa_stop", {
      statusOverride: "bankid_or_mfa_stop",
    }),
    buildFixture("real_run_failed", "Real run failed", "real_run_failed", {
      statusOverride: "real_run_failed",
      warnings: ["Modeled real-run failure without credential exposure."],
    }),
    buildFixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "unsafe_environment_blocked",
      {
        allowOrderSubmit: true,
      },
    ),
    buildFixture(
      "final_buy_sell_forbidden",
      "Final buy/sell forbidden",
      "unsafe_environment_blocked",
      {
        allowFinalBuyClick: true,
        allowFinalSellClick: true,
      },
    ),
    buildFixture(
      "trade_ui_wiring_forbidden",
      "Trade UI wiring forbidden",
      "unsafe_environment_blocked",
      {
        allowTradeUiWiring: true,
      },
    ),
    buildFixture(
      "api_route_wiring_forbidden",
      "API route wiring forbidden",
      "unsafe_environment_blocked",
      {
        allowApiRouteWiring: true,
      },
    ),
    buildFixture("error", "Error", "error", {
      forceError: true,
    }),
    buildFixture("unknown", "Unknown", "unknown", {
      statusOverride: "unknown",
    }),
  ];
