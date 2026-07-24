import {
  buildAvanzaIsolatedLoginSmokeTestPlan,
  buildAvanzaIsolatedLoginSmokeTestSafeReport,
  type AvanzaIsolatedLoginSmokeTestConfig,
  type AvanzaIsolatedLoginSmokeTestEnvironmentGate,
  type AvanzaIsolatedLoginSmokeTestPlan,
  type AvanzaIsolatedLoginSmokeTestReport,
  type AvanzaIsolatedLoginSmokeTestStatus,
} from "./avanza-isolated-login-smoke-test";

export type AvanzaIsolatedLoginSmokeTestFixtureId =
  | "disabled"
  | "model_only"
  | "local_dev_dry_run_ready"
  | "local_dev_explicit_real_run_ready"
  | "ci_blocked"
  | "missing_env_opt_in"
  | "missing_manual_terminal_confirmation"
  | "missing_credential_bundle"
  | "bankid_or_mfa_stop"
  | "unsafe_environment_blocked"
  | "successful_modeled_smoke_test_safe_report"
  | "failed_modeled_smoke_test_safe_report"
  | "order_submission_forbidden"
  | "final_buy_sell_forbidden"
  | "trade_ui_wiring_forbidden"
  | "api_route_wiring_forbidden"
  | "error"
  | "unknown";

export type AvanzaIsolatedLoginSmokeTestFixture = {
  fixtureId: AvanzaIsolatedLoginSmokeTestFixtureId;
  label: string;
  expectedStatus: AvanzaIsolatedLoginSmokeTestStatus;
  config: AvanzaIsolatedLoginSmokeTestConfig;
  environmentGateInput: Partial<AvanzaIsolatedLoginSmokeTestEnvironmentGate>;
  plan: AvanzaIsolatedLoginSmokeTestPlan;
  report: AvanzaIsolatedLoginSmokeTestReport;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const localEnvironment = {
  isLocalDev: true,
  isCi: false,
} satisfies Partial<AvanzaIsolatedLoginSmokeTestEnvironmentGate>;

const baseConfig = {
  enabled: true,
  localDevOnly: true,
  mode: "model_only",
  requireExplicitEnvOptIn: true,
  explicitEnvOptInPresent: true,
  requireManualTerminalRun: true,
  manualTerminalRunConfirmed: true,
  allowRealPlaywrightPage: false,
  allowCredentialRuntimeBundle: true,
  allowUsernamePasswordLogin: true,
  allowBankIdAutomation: false,
  allowCookieRead: false,
  allowSessionExport: false,
  allowOrderSubmit: false,
  allowFinalBuyClick: false,
  allowFinalSellClick: false,
  allowTradeUiWiring: false,
  allowApiRouteWiring: false,
  allowCiExecution: false,
  customerType: "private",
  loginMethod: "username_password",
  now: fixtureNow,
} satisfies AvanzaIsolatedLoginSmokeTestConfig;

function buildFixture(
  fixtureId: AvanzaIsolatedLoginSmokeTestFixtureId,
  label: string,
  expectedStatus: AvanzaIsolatedLoginSmokeTestStatus,
  options: {
    config?: AvanzaIsolatedLoginSmokeTestConfig;
    environmentGateInput?: Partial<AvanzaIsolatedLoginSmokeTestEnvironmentGate>;
  } = {},
): AvanzaIsolatedLoginSmokeTestFixture {
  const config = {
    ...baseConfig,
    smokeTestId: `fixture-${fixtureId}`,
    ...options.config,
  };
  const environmentGateInput = {
    ...localEnvironment,
    ...options.environmentGateInput,
  };
  const plan = buildAvanzaIsolatedLoginSmokeTestPlan(
    config,
    environmentGateInput,
  );
  const report = buildAvanzaIsolatedLoginSmokeTestSafeReport(
    config,
    environmentGateInput,
  );

  return {
    fixtureId,
    label,
    expectedStatus,
    config,
    environmentGateInput,
    plan,
    report,
  };
}

export const avanzaIsolatedLoginSmokeTestFixtures:
  AvanzaIsolatedLoginSmokeTestFixture[] = [
    buildFixture("disabled", "Disabled smoke test", "disabled", {
      config: {
        ...baseConfig,
        enabled: false,
        mode: "disabled",
      },
    }),
    buildFixture("model_only", "Model-only smoke test", "smoke_test_modeled"),
    buildFixture(
      "local_dev_dry_run_ready",
      "Local-dev dry-run ready",
      "dry_run_ready",
      {
        config: {
          ...baseConfig,
          mode: "local_dev_dry_run",
        },
      },
    ),
    buildFixture(
      "local_dev_explicit_real_run_ready",
      "Local-dev explicit real-run ready",
      "ready",
      {
        config: {
          ...baseConfig,
          mode: "local_dev_explicit_real_run",
          allowRealPlaywrightPage: true,
        },
      },
    ),
    buildFixture("ci_blocked", "CI blocked", "unsafe_environment_blocked", {
      environmentGateInput: {
        isCi: true,
        isLocalDev: false,
      },
    }),
    buildFixture("missing_env_opt_in", "Missing env opt-in", "not_configured", {
      config: {
        ...baseConfig,
        explicitEnvOptInPresent: false,
      },
      environmentGateInput: {
        explicitEnvOptInPresent: false,
      },
    }),
    buildFixture(
      "missing_manual_terminal_confirmation",
      "Missing manual terminal confirmation",
      "not_configured",
      {
        config: {
          ...baseConfig,
          manualTerminalRunConfirmed: false,
        },
        environmentGateInput: {
          manualTerminalRunConfirmed: false,
        },
      },
    ),
    buildFixture(
      "missing_credential_bundle",
      "Missing credential bundle",
      "smoke_test_blocked",
      {
        config: {
          ...baseConfig,
          mode: "local_dev_explicit_real_run",
          allowRealPlaywrightPage: true,
          allowCredentialRuntimeBundle: false,
          statusOverride: "smoke_test_blocked",
          blockedReasons: ["Credential runtime bundle is not available."],
        },
      },
    ),
    buildFixture(
      "bankid_or_mfa_stop",
      "BankID/MFA stop",
      "bankid_or_mfa_stop",
      {
        config: {
          ...baseConfig,
          loginMethod: "bankid_or_mfa",
        },
      },
    ),
    buildFixture(
      "unsafe_environment_blocked",
      "Unsafe environment blocked",
      "unsafe_environment_blocked",
      {
        environmentGateInput: {
          isCi: true,
          isLocalDev: false,
          blockedReasons: ["Unsafe non-local environment."],
        },
      },
    ),
    buildFixture(
      "successful_modeled_smoke_test_safe_report",
      "Successful modeled smoke test safe report",
      "smoke_test_passed",
      {
        config: {
          ...baseConfig,
          mode: "local_dev_explicit_real_run",
          allowRealPlaywrightPage: true,
          statusOverride: "smoke_test_passed",
          smokeTestExecuted: true,
        },
      },
    ),
    buildFixture(
      "failed_modeled_smoke_test_safe_report",
      "Failed modeled smoke test safe report",
      "smoke_test_failed",
      {
        config: {
          ...baseConfig,
          mode: "local_dev_explicit_real_run",
          allowRealPlaywrightPage: true,
          statusOverride: "smoke_test_failed",
          smokeTestExecuted: true,
          warnings: ["Modeled smoke test failed without exposing secrets."],
        },
      },
    ),
    buildFixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "smoke_test_blocked",
      {
        config: {
          ...baseConfig,
          allowOrderSubmit: true,
        },
      },
    ),
    buildFixture(
      "final_buy_sell_forbidden",
      "Final buy/sell forbidden",
      "smoke_test_blocked",
      {
        config: {
          ...baseConfig,
          allowFinalBuyClick: true,
          allowFinalSellClick: true,
        },
      },
    ),
    buildFixture(
      "trade_ui_wiring_forbidden",
      "Trade UI wiring forbidden",
      "smoke_test_blocked",
      {
        config: {
          ...baseConfig,
          allowTradeUiWiring: true,
        },
      },
    ),
    buildFixture(
      "api_route_wiring_forbidden",
      "API route wiring forbidden",
      "smoke_test_blocked",
      {
        config: {
          ...baseConfig,
          allowApiRouteWiring: true,
        },
      },
    ),
    buildFixture("error", "Error", "error", {
      config: {
        ...baseConfig,
        forceError: true,
      },
    }),
    buildFixture("unknown", "Unknown", "unknown", {
      config: {
        ...baseConfig,
        statusOverride: "unknown",
      },
    }),
  ];
