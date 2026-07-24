import {
  buildAvanzaLoginActionContract,
  type AvanzaLoginActionContract,
  type AvanzaLoginActionContractInput,
  type AvanzaLoginActionContractStatus,
} from "./avanza-login-action-contract";
import {
  avanzaLoginRoutePlannerFixtures,
  type AvanzaLoginRoutePlannerFixtureId,
} from "./avanza-login-route-planner-fixtures";
import { buildAvanzaSecureCredentialProviderState } from "./avanza-secure-credential-provider";
import { buildAvanzaLocalPlaywrightBrowserAdapterState } from "./avanza-local-playwright-browser-adapter";

export type AvanzaLoginActionContractFixtureId =
  | "disabled"
  | "already_logged_in_no_action_needed"
  | "private_route_action_plan_ready"
  | "private_requires_username_password_method_click"
  | "company_route_action_plan_ready"
  | "company_requires_company_toggle"
  | "waiting_for_credentials"
  | "bankid_or_mfa_manual_action_required"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaLoginActionContractFixture = {
  fixtureId: AvanzaLoginActionContractFixtureId;
  label: string;
  expectedStatus: AvanzaLoginActionContractStatus;
  routeFixtureId?: AvanzaLoginRoutePlannerFixtureId;
  input: AvanzaLoginActionContractInput;
  contract: AvanzaLoginActionContract;
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

function buildFixture(
  fixtureId: AvanzaLoginActionContractFixtureId,
  label: string,
  expectedStatus: AvanzaLoginActionContractStatus,
  input: AvanzaLoginActionContractInput,
  routeFixtureId?: AvanzaLoginRoutePlannerFixtureId,
): AvanzaLoginActionContractFixture {
  const contract = buildAvanzaLoginActionContract({
    now: fixtureNow,
    contractId: fixtureId,
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    routeFixtureId,
    input,
    contract,
  };
}

function enabledInput(
  routeFixtureId: AvanzaLoginRoutePlannerFixtureId,
  overrides: Partial<AvanzaLoginActionContractInput> = {},
): AvanzaLoginActionContractInput {
  const route = routeFixture(routeFixtureId);

  return {
    browserAdapterState,
    contractEnabled: true,
    credentialProviderState: readyCredentialProvider,
    executionSettingsProfile: route.input.executionSettingsProfile,
    loginRoutePlan: route.plan,
    mode: "contract_only",
    ...overrides,
  };
}

export const avanzaLoginActionContractFixtures:
  AvanzaLoginActionContractFixture[] = [
    buildFixture("disabled", "Disabled contract", "disabled", {
      contractEnabled: false,
      mode: "disabled",
    }),
    buildFixture(
      "already_logged_in_no_action_needed",
      "Already logged in no action needed",
      "no_action_needed",
      enabledInput("already_logged_in"),
      "already_logged_in",
    ),
    buildFixture(
      "private_route_action_plan_ready",
      "Private route action plan ready",
      "action_plan_ready",
      enabledInput("private_username_password_form_ready"),
      "private_username_password_form_ready",
    ),
    buildFixture(
      "private_requires_username_password_method_click",
      "Private requires username/password method click",
      "action_plan_ready",
      enabledInput("private_initial_login_requires_username_password_choice"),
      "private_initial_login_requires_username_password_choice",
    ),
    buildFixture(
      "company_route_action_plan_ready",
      "Company route action plan ready",
      "action_plan_ready",
      enabledInput("company_username_password_form_ready"),
      "company_username_password_form_ready",
    ),
    buildFixture(
      "company_requires_company_toggle",
      "Company requires company toggle",
      "action_plan_ready",
      enabledInput("company_initial_login_requires_company_toggle"),
      "company_initial_login_requires_company_toggle",
    ),
    buildFixture(
      "waiting_for_credentials",
      "Waiting for credentials",
      "waiting_for_credentials",
      enabledInput("private_username_password_form_ready", {
        credentialProviderState: missingCredentialProvider,
      }),
      "private_username_password_form_ready",
    ),
    buildFixture(
      "bankid_or_mfa_manual_action_required",
      "BankID/MFA manual action required",
      "bankid_or_mfa_manual_action_required",
      enabledInput("bankid_qr_manual_action_required"),
      "bankid_qr_manual_action_required",
    ),
    buildFixture(
      "blocked",
      "Blocked contract",
      "blocked",
      enabledInput("blocked_planner"),
      "blocked_planner",
    ),
    buildFixture(
      "error",
      "Error contract",
      "error",
      enabledInput("error_planner"),
      "error_planner",
    ),
    buildFixture(
      "unknown",
      "Unknown contract",
      "unknown",
      enabledInput("unknown_planner"),
      "unknown_planner",
    ),
  ];

export const avanzaLoginActionContractDefaultFixture =
  avanzaLoginActionContractFixtures[0];
