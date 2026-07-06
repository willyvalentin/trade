import {
  buildAvanzaLoginActionContract,
  type AvanzaLoginActionContract,
} from "./avanza-login-action-contract";
import {
  buildAvanzaLoginDryRunReport,
  type AvanzaLoginDryRunReport,
} from "./avanza-login-dry-run-executor";
import {
  buildAvanzaLoginMockExecutorReport,
  createAvanzaLoginMockPageState,
  type AvanzaLoginMockExecutorReport,
  type AvanzaLoginMockPageExecutorInput,
  type AvanzaLoginMockPageExecutorStatus,
} from "./avanza-login-mock-page-executor";
import {
  avanzaLoginRoutePlannerFixtures,
  type AvanzaLoginRoutePlannerFixtureId,
} from "./avanza-login-route-planner-fixtures";
import { buildAvanzaLocalPlaywrightBrowserAdapterState } from "./avanza-local-playwright-browser-adapter";
import { buildAvanzaSecureCredentialProviderState } from "./avanza-secure-credential-provider";

export type AvanzaLoginMockPageExecutorFixtureId =
  | "disabled"
  | "already_logged_in_no_op"
  | "private_initial_login_to_mock_logged_in"
  | "private_username_password_form_to_mock_logged_in"
  | "company_initial_login_to_mock_logged_in"
  | "company_username_password_form_to_mock_logged_in"
  | "missing_credentials"
  | "bankid_or_mfa_stop"
  | "blocked_contract"
  | "error"
  | "unknown";

export type AvanzaLoginMockPageExecutorFixture = {
  fixtureId: AvanzaLoginMockPageExecutorFixtureId;
  label: string;
  expectedStatus: AvanzaLoginMockPageExecutorStatus;
  routeFixtureId?: AvanzaLoginRoutePlannerFixtureId;
  input: AvanzaLoginMockPageExecutorInput;
  report: AvanzaLoginMockExecutorReport;
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
    contractId: `mock-${routeFixtureId}`,
    credentialProviderState,
    executionSettingsProfile: route.input.executionSettingsProfile,
    loginRoutePlan: route.plan,
    mode: "contract_only",
    now: fixtureNow,
  });
}

function dryRunFor(
  loginActionContract: AvanzaLoginActionContract,
  routeFixtureId: AvanzaLoginRoutePlannerFixtureId,
  credentialProviderState: unknown = readyCredentialProvider,
): AvanzaLoginDryRunReport {
  const route = routeFixture(routeFixtureId);

  return buildAvanzaLoginDryRunReport({
    credentialProviderState,
    dryRunEnabled: true,
    dryRunId: `mock-dry-run-${routeFixtureId}`,
    executionSettingsProfile: route.input.executionSettingsProfile,
    loginActionContract,
    mode: "local_dev_dry_run",
    now: fixtureNow,
    pageState: route.input.pageState,
  });
}

function enabledInput(
  routeFixtureId: AvanzaLoginRoutePlannerFixtureId,
  initialMockPageState: unknown,
  credentialProviderState: unknown = readyCredentialProvider,
): AvanzaLoginMockPageExecutorInput {
  const route = routeFixture(routeFixtureId);
  const loginActionContract = actionContractFor(
    routeFixtureId,
    credentialProviderState,
  );

  return {
    credentialProviderState,
    dryRunReport: dryRunFor(
      loginActionContract,
      routeFixtureId,
      credentialProviderState,
    ),
    executionSettingsProfile: route.input.executionSettingsProfile,
    initialMockPageState,
    loginActionContract,
    mockExecutorEnabled: true,
    mode: "mock_local_dev",
  };
}

function buildFixture(
  fixtureId: AvanzaLoginMockPageExecutorFixtureId,
  label: string,
  expectedStatus: AvanzaLoginMockPageExecutorStatus,
  input: AvanzaLoginMockPageExecutorInput,
  routeFixtureId?: AvanzaLoginRoutePlannerFixtureId,
): AvanzaLoginMockPageExecutorFixture {
  const report = buildAvanzaLoginMockExecutorReport({
    now: fixtureNow,
    reportId: fixtureId,
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

export const avanzaLoginMockPageExecutorFixtures:
  AvanzaLoginMockPageExecutorFixture[] = [
    buildFixture("disabled", "Disabled mock executor", "disabled", {
      initialMockPageState: createAvanzaLoginMockPageState("unknown"),
      mockExecutorEnabled: false,
      mode: "disabled",
    }),
    buildFixture(
      "already_logged_in_no_op",
      "Already logged in no-op",
      "mock_executed",
      enabledInput(
        "already_logged_in",
        createAvanzaLoginMockPageState("logged_in_home"),
      ),
      "already_logged_in",
    ),
    buildFixture(
      "private_initial_login_to_mock_logged_in",
      "Private initial login to mock logged in",
      "mock_executed",
      enabledInput(
        "private_initial_login_requires_username_password_choice",
        createAvanzaLoginMockPageState("initial_login_choice", "private"),
      ),
      "private_initial_login_requires_username_password_choice",
    ),
    buildFixture(
      "private_username_password_form_to_mock_logged_in",
      "Private username/password form to mock logged in",
      "mock_executed",
      enabledInput(
        "private_username_password_form_ready",
        createAvanzaLoginMockPageState(
          "private_username_password_form",
          "private",
        ),
      ),
      "private_username_password_form_ready",
    ),
    buildFixture(
      "company_initial_login_to_mock_logged_in",
      "Company initial login to mock logged in",
      "mock_executed",
      enabledInput(
        "company_initial_login_requires_company_toggle",
        createAvanzaLoginMockPageState("initial_login_choice", "company"),
      ),
      "company_initial_login_requires_company_toggle",
    ),
    buildFixture(
      "company_username_password_form_to_mock_logged_in",
      "Company username/password form to mock logged in",
      "mock_executed",
      enabledInput(
        "company_username_password_form_ready",
        createAvanzaLoginMockPageState(
          "company_username_password_form",
          "company",
        ),
      ),
      "company_username_password_form_ready",
    ),
    buildFixture(
      "missing_credentials",
      "Missing credentials",
      "mock_missing_credentials",
      enabledInput(
        "private_username_password_form_ready",
        createAvanzaLoginMockPageState(
          "private_username_password_form",
          "private",
        ),
        missingCredentialProvider,
      ),
      "private_username_password_form_ready",
    ),
    buildFixture(
      "bankid_or_mfa_stop",
      "BankID/MFA stop",
      "mock_bankid_or_mfa_stop",
      enabledInput(
        "bankid_qr_manual_action_required",
        createAvanzaLoginMockPageState("bankid_or_mfa"),
      ),
      "bankid_qr_manual_action_required",
    ),
    buildFixture(
      "blocked_contract",
      "Blocked contract",
      "mock_blocked",
      enabledInput(
        "blocked_planner",
        createAvanzaLoginMockPageState("initial_login_choice"),
      ),
      "blocked_planner",
    ),
    buildFixture(
      "error",
      "Error contract",
      "mock_error",
      enabledInput(
        "error_planner",
        createAvanzaLoginMockPageState("initial_login_choice"),
      ),
      "error_planner",
    ),
    buildFixture(
      "unknown",
      "Unknown mock input",
      "unknown",
      enabledInput(
        "unknown_planner",
        createAvanzaLoginMockPageState("unknown"),
      ),
      "unknown_planner",
    ),
  ];

export const avanzaLoginMockPageExecutorDefaultFixture =
  avanzaLoginMockPageExecutorFixtures[0];
