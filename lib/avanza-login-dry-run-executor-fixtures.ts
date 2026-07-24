import {
  buildAvanzaLoginActionContract,
  type AvanzaLoginActionContract,
} from "./avanza-login-action-contract";
import {
  avanzaLoginRoutePlannerFixtures,
  type AvanzaLoginRoutePlannerFixtureId,
} from "./avanza-login-route-planner-fixtures";
import {
  buildAvanzaLoginDryRunReport,
  type AvanzaLoginDryRunInput,
  type AvanzaLoginDryRunReport,
  type AvanzaLoginDryRunStatus,
} from "./avanza-login-dry-run-executor";
import { buildAvanzaSecureCredentialProviderState } from "./avanza-secure-credential-provider";
import { buildAvanzaLocalPlaywrightBrowserAdapterState } from "./avanza-local-playwright-browser-adapter";

export type AvanzaLoginDryRunExecutorFixtureId =
  | "disabled"
  | "already_logged_in_no_action_needed"
  | "private_username_password_dry_run_passed"
  | "private_requires_username_password_method_dry_run_passed"
  | "company_username_password_dry_run_passed"
  | "company_requires_company_toggle_dry_run_passed"
  | "missing_credentials"
  | "bankid_or_mfa_stop"
  | "blocked_contract"
  | "error"
  | "unknown";

export type AvanzaLoginDryRunExecutorFixture = {
  fixtureId: AvanzaLoginDryRunExecutorFixtureId;
  label: string;
  expectedStatus: AvanzaLoginDryRunStatus;
  routeFixtureId?: AvanzaLoginRoutePlannerFixtureId;
  input: AvanzaLoginDryRunInput;
  report: AvanzaLoginDryRunReport;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const readyCredentialProvider = buildAvanzaSecureCredentialProviderState({
  createdAt: fixtureNow,
  kind: "macos_keychain",
  passwordAvailable: true,
  providerAvailable: true,
  providerEnabled: true,
  usernameConfigured: true,
});

const missingCredentialProvider = buildAvanzaSecureCredentialProviderState({
  createdAt: fixtureNow,
  kind: "macos_keychain",
  passwordAvailable: false,
  providerAvailable: true,
  providerEnabled: true,
  usernameConfigured: true,
});

const browserAdapterState = buildAvanzaLocalPlaywrightBrowserAdapterState({
  adapterAvailable: true,
  allowReadPageSnapshot: true,
  browserConnected: true,
  enabled: true,
  localOnly: true,
  mode: "local_dev",
  now: fixtureNow,
});

function routeFixture(fixtureId: AvanzaLoginRoutePlannerFixtureId) {
  const fixture = avanzaLoginRoutePlannerFixtures.find(
    (item) => item.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing Avanza login route planner fixture: ${fixtureId}`);
  }

  return fixture;
}

function actionContractFor(
  routeFixtureId: AvanzaLoginRoutePlannerFixtureId,
  credentialProviderState: unknown = readyCredentialProvider,
): AvanzaLoginActionContract {
  const route = routeFixture(routeFixtureId);

  return buildAvanzaLoginActionContract({
    browserAdapterState,
    contractEnabled: true,
    contractId: `dry-run-${routeFixtureId}`,
    credentialProviderState,
    executionSettingsProfile: route.input.executionSettingsProfile,
    loginRoutePlan: route.plan,
    mode: "contract_only",
    now: fixtureNow,
  });
}

function buildFixture(
  fixtureId: AvanzaLoginDryRunExecutorFixtureId,
  label: string,
  expectedStatus: AvanzaLoginDryRunStatus,
  input: AvanzaLoginDryRunInput,
  routeFixtureId?: AvanzaLoginRoutePlannerFixtureId,
): AvanzaLoginDryRunExecutorFixture {
  const report = buildAvanzaLoginDryRunReport({
    dryRunId: fixtureId,
    now: fixtureNow,
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    routeFixtureId,
    input,
    report,
  };
}

function enabledInput(
  routeFixtureId: AvanzaLoginRoutePlannerFixtureId,
  credentialProviderState: unknown = readyCredentialProvider,
): AvanzaLoginDryRunInput {
  const route = routeFixture(routeFixtureId);

  return {
    credentialProviderState,
    dryRunEnabled: true,
    executionSettingsProfile: route.input.executionSettingsProfile,
    loginActionContract: actionContractFor(
      routeFixtureId,
      credentialProviderState,
    ),
    mode: "local_dev_dry_run",
    pageState: route.input.pageState,
  };
}

export const avanzaLoginDryRunExecutorFixtures:
  AvanzaLoginDryRunExecutorFixture[] = [
    buildFixture("disabled", "Disabled login dry run", "disabled", {
      dryRunEnabled: false,
      mode: "disabled",
    }),
    buildFixture(
      "already_logged_in_no_action_needed",
      "Already logged in no action needed",
      "dry_run_passed",
      enabledInput("already_logged_in"),
      "already_logged_in",
    ),
    buildFixture(
      "private_username_password_dry_run_passed",
      "Private username/password dry run passed",
      "dry_run_passed",
      enabledInput("private_username_password_form_ready"),
      "private_username_password_form_ready",
    ),
    buildFixture(
      "private_requires_username_password_method_dry_run_passed",
      "Private requires username/password method dry run passed",
      "dry_run_passed",
      enabledInput("private_initial_login_requires_username_password_choice"),
      "private_initial_login_requires_username_password_choice",
    ),
    buildFixture(
      "company_username_password_dry_run_passed",
      "Company username/password dry run passed",
      "dry_run_passed",
      enabledInput("company_username_password_form_ready"),
      "company_username_password_form_ready",
    ),
    buildFixture(
      "company_requires_company_toggle_dry_run_passed",
      "Company requires company toggle dry run passed",
      "dry_run_passed",
      enabledInput("company_initial_login_requires_company_toggle"),
      "company_initial_login_requires_company_toggle",
    ),
    buildFixture(
      "missing_credentials",
      "Missing credentials",
      "dry_run_missing_credentials",
      enabledInput("private_username_password_form_ready", missingCredentialProvider),
      "private_username_password_form_ready",
    ),
    buildFixture(
      "bankid_or_mfa_stop",
      "BankID/MFA dry-run stop",
      "dry_run_bankid_or_mfa_stop",
      enabledInput("bankid_qr_manual_action_required"),
      "bankid_qr_manual_action_required",
    ),
    buildFixture(
      "blocked_contract",
      "Blocked contract",
      "dry_run_blocked",
      enabledInput("blocked_planner"),
      "blocked_planner",
    ),
    buildFixture(
      "error",
      "Error contract",
      "dry_run_error",
      enabledInput("error_planner"),
      "error_planner",
    ),
    buildFixture(
      "unknown",
      "Unknown dry-run input",
      "unknown",
      {
        dryRunEnabled: true,
        loginActionContract: actionContractFor("unknown_planner"),
        mode: "local_dev_dry_run",
      },
      "unknown_planner",
    ),
  ];

export const avanzaLoginDryRunExecutorDefaultFixture =
  avanzaLoginDryRunExecutorFixtures[0];
