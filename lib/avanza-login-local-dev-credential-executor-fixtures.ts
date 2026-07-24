import {
  buildAvanzaLoginLocalDevCredentialExecutorState,
  type AvanzaLoginLocalDevCredentialExecutorConfig,
  type AvanzaLoginLocalDevCredentialExecutorReport,
  type AvanzaLoginLocalDevCredentialExecutorStatus,
} from "./avanza-login-local-dev-credential-executor";
import {
  avanzaLoginActionContractFixtures,
  type AvanzaLoginActionContractFixtureId,
} from "./avanza-login-action-contract-fixtures";

export type AvanzaLoginLocalDevCredentialExecutorFixtureId =
  | "disabled_executor"
  | "ready_private_executor_with_credential_bundle_present"
  | "ready_company_executor_with_credential_bundle_present"
  | "successful_private_injected_execution_report_values_hidden"
  | "successful_company_injected_execution_report_values_hidden"
  | "dry_run_true_blocks_execution"
  | "missing_credential_bundle"
  | "unsafe_credential_output_blocked"
  | "bankid_or_mfa_stop"
  | "click_username_password_method_failed"
  | "click_company_toggle_failed"
  | "fill_username_failed"
  | "fill_password_failed"
  | "click_login_submit_failed"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaLoginLocalDevCredentialExecutorFixture = {
  fixtureId: AvanzaLoginLocalDevCredentialExecutorFixtureId;
  label: string;
  expectedStatus: AvanzaLoginLocalDevCredentialExecutorStatus;
  actionContractFixtureId?: AvanzaLoginActionContractFixtureId;
  input: {
    config: AvanzaLoginLocalDevCredentialExecutorConfig;
    loginActionContract?: unknown;
    credentialRuntimeBundlePresent: boolean;
  };
  report: AvanzaLoginLocalDevCredentialExecutorReport;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const baseConfig: AvanzaLoginLocalDevCredentialExecutorConfig = {
  enabled: true,
  localDevOnly: true,
  mode: "local_dev_mock_injected",
  allowUseRuntimeCredentialBundle: true,
  allowClickUsernamePasswordMethod: true,
  allowClickCustomerToggle: true,
  allowFillUsername: true,
  allowFillPassword: true,
  allowClickLoginSubmit: true,
  allowReturnCredentialMaterialToUi: false,
  allowLogCredentialMaterial: false,
  allowStoreCredentialMaterialInSupabase: false,
  allowStoreCredentialMaterialInLocalStorage: false,
  allowBankIdAutomation: false,
  allowCookieRead: false,
  allowSessionExport: false,
  allowOrderSubmit: false,
  now: fixtureNow,
};

function contractFixture(fixtureId: AvanzaLoginActionContractFixtureId) {
  const fixture = avanzaLoginActionContractFixtures.find(
    (item) => item.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing Avanza login action contract fixture: ${fixtureId}`);
  }

  return fixture;
}

function runtimeBundleMarker() {
  return {
    bundleId: "fixture-runtime-bundle-marker",
    createdAt: fixtureNow,
    usernameValue: "",
    passwordValue: "",
    valueReturnedToUi: false as const,
    valueLogged: false as const,
    valueStoredInSupabase: false as const,
    valueStoredInLocalStorage: false as const,
  };
}

function buildFixture(
  fixtureId: AvanzaLoginLocalDevCredentialExecutorFixtureId,
  label: string,
  expectedStatus: AvanzaLoginLocalDevCredentialExecutorStatus,
  options: {
    actionContractFixtureId?: AvanzaLoginActionContractFixtureId;
    config?: AvanzaLoginLocalDevCredentialExecutorConfig;
    credentialRuntimeBundlePresent?: boolean;
  } = {},
): AvanzaLoginLocalDevCredentialExecutorFixture {
  const config = {
    ...baseConfig,
    executorId: `fixture-${fixtureId}`,
    statusOverride: expectedStatus,
    ...(expectedStatus === "executed"
      ? {
          passwordUsed: true,
          usernameUsed: true,
        }
      : {}),
    ...options.config,
  };
  const contract = options.actionContractFixtureId
    ? contractFixture(options.actionContractFixtureId).contract
    : undefined;
  const credentialRuntimeBundlePresent =
    options.credentialRuntimeBundlePresent === true;

  return {
    fixtureId,
    label,
    expectedStatus,
    actionContractFixtureId: options.actionContractFixtureId,
    input: {
      config,
      loginActionContract: contract,
      credentialRuntimeBundlePresent,
    },
    report: buildAvanzaLoginLocalDevCredentialExecutorState({
      config,
      loginActionContract: contract,
      credentialRuntimeBundle: credentialRuntimeBundlePresent
        ? runtimeBundleMarker()
        : undefined,
    }),
  };
}

export const avanzaLoginLocalDevCredentialExecutorFixtures:
  AvanzaLoginLocalDevCredentialExecutorFixture[] = [
    buildFixture("disabled_executor", "Disabled executor", "disabled", {
      config: {
        ...baseConfig,
        enabled: false,
        mode: "disabled",
        statusOverride: undefined,
      },
    }),
    buildFixture(
      "ready_private_executor_with_credential_bundle_present",
      "Ready private executor with credential bundle present",
      "ready",
      {
        actionContractFixtureId: "private_route_action_plan_ready",
        credentialRuntimeBundlePresent: true,
        config: { ...baseConfig, statusOverride: "ready" },
      },
    ),
    buildFixture(
      "ready_company_executor_with_credential_bundle_present",
      "Ready company executor with credential bundle present",
      "ready",
      {
        actionContractFixtureId: "company_route_action_plan_ready",
        credentialRuntimeBundlePresent: true,
        config: { ...baseConfig, statusOverride: "ready" },
      },
    ),
    buildFixture(
      "successful_private_injected_execution_report_values_hidden",
      "Successful private injected execution report values hidden",
      "executed",
      {
        actionContractFixtureId: "private_route_action_plan_ready",
        credentialRuntimeBundlePresent: true,
      },
    ),
    buildFixture(
      "successful_company_injected_execution_report_values_hidden",
      "Successful company injected execution report values hidden",
      "executed",
      {
        actionContractFixtureId: "company_route_action_plan_ready",
        credentialRuntimeBundlePresent: true,
      },
    ),
    buildFixture(
      "dry_run_true_blocks_execution",
      "Dry run true blocks execution",
      "ready",
      {
        actionContractFixtureId: "private_route_action_plan_ready",
        credentialRuntimeBundlePresent: true,
        config: { ...baseConfig, dryRun: true, statusOverride: "ready" },
      },
    ),
    buildFixture(
      "missing_credential_bundle",
      "Missing credential bundle",
      "missing_credential_bundle",
      {
        actionContractFixtureId: "private_route_action_plan_ready",
        config: { ...baseConfig, statusOverride: undefined },
      },
    ),
    buildFixture(
      "unsafe_credential_output_blocked",
      "Unsafe credential output blocked",
      "unsafe_credential_output_blocked",
      {
        actionContractFixtureId: "private_route_action_plan_ready",
        config: {
          ...baseConfig,
          allowReturnCredentialMaterialToUi: true,
          statusOverride: undefined,
        },
      },
    ),
    buildFixture("bankid_or_mfa_stop", "BankID/MFA stop", "bankid_or_mfa_stop", {
      actionContractFixtureId: "bankid_or_mfa_manual_action_required",
      config: { ...baseConfig, statusOverride: undefined },
    }),
    buildFixture(
      "click_username_password_method_failed",
      "Click username/password method failed",
      "page_action_failed",
      { actionContractFixtureId: "private_requires_username_password_method_click" },
    ),
    buildFixture(
      "click_company_toggle_failed",
      "Click company toggle failed",
      "page_action_failed",
      { actionContractFixtureId: "company_requires_company_toggle" },
    ),
    buildFixture("fill_username_failed", "Fill username failed", "page_action_failed", {
      actionContractFixtureId: "private_route_action_plan_ready",
    }),
    buildFixture("fill_password_failed", "Fill password failed", "page_action_failed", {
      actionContractFixtureId: "private_route_action_plan_ready",
    }),
    buildFixture(
      "click_login_submit_failed",
      "Click login submit failed",
      "page_action_failed",
      { actionContractFixtureId: "private_route_action_plan_ready" },
    ),
    buildFixture("blocked", "Blocked executor", "blocked", {
      actionContractFixtureId: "blocked",
      config: { ...baseConfig, statusOverride: undefined },
    }),
    buildFixture("error", "Executor error", "error", {
      actionContractFixtureId: "error",
      config: { ...baseConfig, forceError: true, statusOverride: undefined },
    }),
    buildFixture("unknown", "Executor unknown", "unknown", {
      actionContractFixtureId: "unknown",
      config: { ...baseConfig, statusOverride: undefined },
    }),
  ];

export const avanzaLoginLocalDevCredentialExecutorDefaultFixture =
  avanzaLoginLocalDevCredentialExecutorFixtures[0];
