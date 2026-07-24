import {
  buildAvanzaLoginActionContract,
  type AvanzaLoginActionContract,
} from "./avanza-login-action-contract";
import {
  buildAvanzaLoginLocalDevExecutorState,
  type AvanzaLoginLocalDevActionReport,
  type AvanzaLoginLocalDevExecutorConfig,
  type AvanzaLoginLocalDevExecutorInput,
  type AvanzaLoginLocalDevExecutorReport,
  type AvanzaLoginLocalDevExecutorStatus,
} from "./avanza-login-local-dev-executor";
import {
  avanzaLoginRoutePlannerFixtures,
  type AvanzaLoginRoutePlannerFixtureId,
} from "./avanza-login-route-planner-fixtures";
import { buildAvanzaLocalPlaywrightBrowserAdapterState } from "./avanza-local-playwright-browser-adapter";
import { buildAvanzaSecureCredentialProviderState } from "./avanza-secure-credential-provider";

export type AvanzaLoginLocalDevExecutorFixtureId =
  | "disabled_executor"
  | "ready_private_local_dev_executor"
  | "ready_company_local_dev_executor"
  | "successful_private_injected_execution_report"
  | "successful_company_injected_execution_report"
  | "dry_run_true_blocks_execution"
  | "missing_credentials"
  | "bankid_or_mfa_stop"
  | "click_username_password_method_failed"
  | "fill_username_failed"
  | "fill_password_failed"
  | "click_login_submit_failed"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaLoginLocalDevExecutorFixture = {
  fixtureId: AvanzaLoginLocalDevExecutorFixtureId;
  label: string;
  expectedStatus: AvanzaLoginLocalDevExecutorStatus;
  routeFixtureId?: AvanzaLoginRoutePlannerFixtureId;
  input: AvanzaLoginLocalDevExecutorInput;
  report: AvanzaLoginLocalDevExecutorReport;
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
  allowClick: true,
  allowFormFill: true,
  allowReadPageSnapshot: true,
  browserConnected: true,
  enabled: true,
  localOnly: true,
  mode: "local_dev",
  now: fixtureNow,
});

const baseEnabledConfig: AvanzaLoginLocalDevExecutorConfig = {
  executorId: "avanza-login-local-dev-executor-fixture",
  mode: "local_dev",
  enabled: true,
  localDevOnly: true,
  allowClickUsernamePasswordMethod: true,
  allowClickCustomerToggle: true,
  allowFillCredentialReferences: true,
  allowClickLoginSubmit: true,
  allowBankIdAutomation: false,
  allowCookieRead: false,
  allowSessionExport: false,
  allowOrderSubmit: false,
  dryRun: false,
  now: fixtureNow,
};

const disabledConfig: AvanzaLoginLocalDevExecutorConfig = {
  ...baseEnabledConfig,
  enabled: false,
  mode: "disabled",
  dryRun: true,
};

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
    contractId: `local-dev-${routeFixtureId}`,
    credentialProviderState,
    executionSettingsProfile: route.input.executionSettingsProfile,
    loginRoutePlan: route.plan,
    mode: "local_dev_execute_later",
    now: fixtureNow,
  });
}

function inputFor(
  routeFixtureId: AvanzaLoginRoutePlannerFixtureId,
  config: Partial<AvanzaLoginLocalDevExecutorConfig> = {},
  credentialProviderState: unknown = readyCredentialProvider,
): AvanzaLoginLocalDevExecutorInput {
  const route = routeFixture(routeFixtureId);
  const loginActionContract = actionContractFor(
    routeFixtureId,
    credentialProviderState,
  );

  return {
    config: {
      ...baseEnabledConfig,
      ...config,
      now: fixtureNow,
    },
    credentialProviderState,
    executionSettingsProfile: route.input.executionSettingsProfile,
    loginActionContract,
    now: fixtureNow,
  };
}

function executedReport(
  input: AvanzaLoginLocalDevExecutorInput,
  status: AvanzaLoginLocalDevExecutorStatus,
  actionReports: AvanzaLoginLocalDevActionReport[],
  reason: string,
): AvanzaLoginLocalDevExecutorReport {
  const base = buildAvanzaLoginLocalDevExecutorState(input);

  return {
    ...base,
    status,
    label:
      status === "executed"
        ? "Login local-dev executor executed injected actions"
        : "Login local-dev executor page action failed",
    reason,
    actionReports,
    blockedReasons:
      status === "page_action_failed"
        ? [...base.blockedReasons, reason]
        : base.blockedReasons,
    safetyFlags: {
      ...base.safetyFlags,
      canExecuteLocalDevActions: status === "executed",
    },
    canExecuteLocalDevActions: status === "executed",
  };
}

function mapExecuted(action: AvanzaLoginLocalDevActionReport) {
  return {
    ...action,
    actionStatus: action.actionType === "no_op" ? "skipped" : "executed",
    actualResult:
      action.actionType === "no_op"
        ? "No injected page action was needed."
        : "Injected dependency reported ok with credential references only.",
    realBrowserActionAttempted: action.actionType !== "no_op",
  } satisfies AvanzaLoginLocalDevActionReport;
}

function failureReport(
  input: AvanzaLoginLocalDevExecutorInput,
  actionType: string,
  reason: string,
): AvanzaLoginLocalDevExecutorReport {
  const base = buildAvanzaLoginLocalDevExecutorState(input);
  const actionReports = base.actionReports.map((action) => {
    if (action.actionType !== actionType) return mapExecuted(action);

    return {
      ...action,
      actionStatus: "failed",
      actualResult: reason,
      blockedReason: reason,
      realBrowserActionAttempted: true,
    } satisfies AvanzaLoginLocalDevActionReport;
  });

  return executedReport(input, "page_action_failed", actionReports, reason);
}

function successfulReport(input: AvanzaLoginLocalDevExecutorInput) {
  const base = buildAvanzaLoginLocalDevExecutorState(input);

  return executedReport(
    input,
    "executed",
    base.actionReports.map(mapExecuted),
    "Injected dependencies completed the local-dev login action sequence using credential references only.",
  );
}

function buildFixture(
  fixtureId: AvanzaLoginLocalDevExecutorFixtureId,
  label: string,
  expectedStatus: AvanzaLoginLocalDevExecutorStatus,
  input: AvanzaLoginLocalDevExecutorInput,
  routeFixtureId?: AvanzaLoginRoutePlannerFixtureId,
  reportOverride?: AvanzaLoginLocalDevExecutorReport,
): AvanzaLoginLocalDevExecutorFixture {
  return {
    fixtureId,
    label,
    expectedStatus,
    routeFixtureId,
    input,
    report: reportOverride ?? buildAvanzaLoginLocalDevExecutorState(input),
  };
}

const privateInitialInput = inputFor(
  "private_initial_login_requires_username_password_choice",
);
const companyInitialInput = inputFor(
  "company_initial_login_requires_company_toggle",
);
const privateFormInput = inputFor("private_username_password_form_ready");
const companyFormInput = inputFor("company_username_password_form_ready");

export const avanzaLoginLocalDevExecutorFixtures:
  AvanzaLoginLocalDevExecutorFixture[] = [
    buildFixture("disabled_executor", "Disabled executor", "disabled", {
      config: disabledConfig,
      now: fixtureNow,
    }),
    buildFixture(
      "ready_private_local_dev_executor",
      "Ready private local-dev executor",
      "ready",
      privateInitialInput,
      "private_initial_login_requires_username_password_choice",
    ),
    buildFixture(
      "ready_company_local_dev_executor",
      "Ready company local-dev executor",
      "ready",
      companyInitialInput,
      "company_initial_login_requires_company_toggle",
    ),
    buildFixture(
      "successful_private_injected_execution_report",
      "Successful private injected execution report",
      "executed",
      privateInitialInput,
      "private_initial_login_requires_username_password_choice",
      successfulReport(privateInitialInput),
    ),
    buildFixture(
      "successful_company_injected_execution_report",
      "Successful company injected execution report",
      "executed",
      companyInitialInput,
      "company_initial_login_requires_company_toggle",
      successfulReport(companyInitialInput),
    ),
    buildFixture(
      "dry_run_true_blocks_execution",
      "Dry-run true blocks execution",
      "blocked",
      inputFor("private_username_password_form_ready", { dryRun: true }),
      "private_username_password_form_ready",
    ),
    buildFixture(
      "missing_credentials",
      "Missing credentials",
      "missing_credentials",
      inputFor(
        "private_username_password_form_ready",
        {},
        missingCredentialProvider,
      ),
      "private_username_password_form_ready",
    ),
    buildFixture(
      "bankid_or_mfa_stop",
      "BankID/MFA stop",
      "bankid_or_mfa_stop",
      inputFor("bankid_qr_manual_action_required"),
      "bankid_qr_manual_action_required",
    ),
    buildFixture(
      "click_username_password_method_failed",
      "Click username/password method failed",
      "page_action_failed",
      privateInitialInput,
      "private_initial_login_requires_username_password_choice",
      failureReport(
        privateInitialInput,
        "click_username_password_method",
        "Injected clickByText failed for username/password method.",
      ),
    ),
    buildFixture(
      "fill_username_failed",
      "Fill username failed",
      "page_action_failed",
      privateFormInput,
      "private_username_password_form_ready",
      failureReport(
        privateFormInput,
        "fill_username",
        "Injected fillByLabel failed for username reference.",
      ),
    ),
    buildFixture(
      "fill_password_failed",
      "Fill password failed",
      "page_action_failed",
      privateFormInput,
      "private_username_password_form_ready",
      failureReport(
        privateFormInput,
        "fill_password",
        "Injected fillByLabel failed for password reference.",
      ),
    ),
    buildFixture(
      "click_login_submit_failed",
      "Click login submit failed",
      "page_action_failed",
      companyFormInput,
      "company_username_password_form_ready",
      failureReport(
        companyFormInput,
        "click_login_submit",
        "Injected clickByText failed for login submit.",
      ),
    ),
    buildFixture(
      "blocked",
      "Blocked input",
      "blocked",
      inputFor("blocked_planner"),
      "blocked_planner",
    ),
    buildFixture(
      "error",
      "Error input",
      "error",
      inputFor("error_planner"),
      "error_planner",
    ),
    buildFixture(
      "unknown",
      "Unknown input",
      "unknown",
      inputFor("unknown_planner"),
      "unknown_planner",
    ),
  ];

export const avanzaLoginLocalDevExecutorDefaultFixture =
  avanzaLoginLocalDevExecutorFixtures[0];
