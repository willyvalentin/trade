import {
  buildAvanzaExecutionSettingsProfile,
  type AvanzaExecutionSettingsProfile,
} from "./avanza-execution-settings-profile";
import {
  buildAvanzaLoginStateModel,
  type AvanzaLoginStateModel,
} from "./avanza-login-state-detector";
import {
  buildAvanzaLoginRoutePlan,
  type AvanzaLoginRoutePlan,
  type AvanzaLoginRoutePlanInput,
  type AvanzaLoginRoutePlanStatus,
} from "./avanza-login-route-planner";
import {
  buildAvanzaPageStateModel,
  type AvanzaPageStateModel,
} from "./avanza-page-state-detector";
import {
  buildAvanzaRealWorldLoginSignalPack,
  type AvanzaRealWorldLoginSignalPack,
} from "./avanza-real-world-login-signals";
import { buildAvanzaSecureCredentialProviderState } from "./avanza-secure-credential-provider";

export type AvanzaLoginRoutePlannerFixtureId =
  | "disabled_planner"
  | "already_logged_in"
  | "private_initial_login_requires_username_password_choice"
  | "private_username_password_form_ready"
  | "company_initial_login_requires_company_toggle"
  | "company_username_password_form_ready"
  | "missing_credentials"
  | "incomplete_settings"
  | "bankid_qr_manual_action_required"
  | "bankid_same_device_manual_action_required"
  | "blocked_planner"
  | "error_planner"
  | "unknown_planner";

export type AvanzaLoginRoutePlannerFixture = {
  fixtureId: AvanzaLoginRoutePlannerFixtureId;
  label: string;
  expectedStatus: AvanzaLoginRoutePlanStatus;
  input: AvanzaLoginRoutePlanInput;
  plan: AvanzaLoginRoutePlan;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const readyProvider = buildAvanzaSecureCredentialProviderState({
  createdAt: fixtureNow,
  kind: "macos_keychain",
  passwordAvailable: true,
  providerAvailable: true,
  providerEnabled: true,
  usernameConfigured: true,
});

function executionProfile(
  customerType: "private" | "company" | "unknown",
  overrides: Partial<Parameters<typeof buildAvanzaExecutionSettingsProfile>[0]> = {},
): AvanzaExecutionSettingsProfile {
  return buildAvanzaExecutionSettingsProfile({
    credentialProviderState: readyProvider,
    credentialStorageKind: "macos_keychain",
    customerType,
    loginMethod: "username_password",
    localDevOnly: true,
    now: fixtureNow,
    passwordConfigured: true,
    profileEnabled: true,
    usernameConfigured: true,
    ...overrides,
  });
}

function loginState(
  statusOverride: AvanzaLoginStateModel["status"],
  observedTextSignals: readonly string[] = [],
): AvanzaLoginStateModel {
  return buildAvanzaLoginStateModel({
    detectionId: `login-state-${statusOverride}`,
    detectorEnabled: true,
    mode: "local_dev_read_only",
    now: fixtureNow,
    observedTextSignals,
    statusOverride,
  });
}

function pageState(
  statusOverride: AvanzaPageStateModel["status"],
  observedTextSignals: readonly string[] = [],
  observedFormSignals: readonly string[] = [],
): AvanzaPageStateModel {
  return buildAvanzaPageStateModel({
    detectionId: `page-state-${statusOverride}`,
    detectorEnabled: true,
    mode: "local_dev_snapshot",
    now: fixtureNow,
    observedFormSignals,
    observedTextSignals,
    observedUrl: "https://www.avanza.se/logga-in",
    statusOverride,
  });
}

function signalPack(
  signalPackId: string,
  input: Partial<Parameters<typeof buildAvanzaRealWorldLoginSignalPack>[0]>,
): AvanzaRealWorldLoginSignalPack {
  return buildAvanzaRealWorldLoginSignalPack({
    createdAt: fixtureNow,
    signalPackId,
    ...input,
  });
}

function buildFixture(
  fixtureId: AvanzaLoginRoutePlannerFixtureId,
  label: string,
  expectedStatus: AvanzaLoginRoutePlanStatus,
  input: AvanzaLoginRoutePlanInput,
): AvanzaLoginRoutePlannerFixture {
  const plan = buildAvanzaLoginRoutePlan({
    now: fixtureNow,
    routePlanId: fixtureId,
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    input,
    plan,
  };
}

export const avanzaLoginRoutePlannerFixtures:
  AvanzaLoginRoutePlannerFixture[] = [
    buildFixture("disabled_planner", "Disabled planner", "disabled", {
      mode: "disabled",
      routePlanningEnabled: false,
    }),
    buildFixture(
      "already_logged_in",
      "Already logged in",
      "not_needed_already_logged_in",
      {
        executionSettingsProfile: executionProfile("private"),
        loginState: loginState("logged_in", ["inloggad", "kontoöversikt"]),
        mode: "local_dev_route_model",
        pageState: pageState("avanza_account_overview", ["kontoöversikt"]),
        routePlanningEnabled: true,
      },
    ),
    buildFixture(
      "private_initial_login_requires_username_password_choice",
      "Private initial login requires username/password choice",
      "requires_username_password_choice",
      {
        executionSettingsProfile: executionProfile("private"),
        loginState: loginState("username_password_possible", [
          "Användarnamn och lösenord",
          "Privat",
        ]),
        mode: "local_dev_route_model",
        pageState: pageState("avanza_login_page", [
          "Privat",
          "Användarnamn och lösenord",
        ]),
        realWorldLoginSignals: signalPack("private-initial-choice", {
          buttonTexts: ["Användarnamn och lösenord"],
          customerType: "private",
          flowKind: "initial_login_choice",
          loginMethod: "username_password",
          toggleLabels: ["Privat", "Företag"],
          visibleTexts: ["Privat", "Användarnamn och lösenord"],
        }),
        routePlanningEnabled: true,
      },
    ),
    buildFixture(
      "private_username_password_form_ready",
      "Private username/password form ready",
      "ready_private_username_password",
      {
        executionSettingsProfile: executionProfile("private"),
        loginState: loginState("username_password_possible", [
          "Privatkund",
          "Användarnamn",
          "Lösenord",
        ]),
        mode: "local_dev_route_model",
        pageState: pageState(
          "avanza_login_page",
          ["Privatkund"],
          ["Användarnamn", "Lösenord"],
        ),
        realWorldLoginSignals: signalPack("private-form-ready", {
          buttonTexts: ["Logga in"],
          customerType: "private",
          flowKind: "private_username_password_login",
          formLabels: ["Privatkund"],
          inputLabels: ["Användarnamn", "Lösenord"],
          loginMethod: "username_password",
          visibleTexts: ["Privatkund", "Användarnamn", "Lösenord"],
        }),
        routePlanningEnabled: true,
      },
    ),
    buildFixture(
      "company_initial_login_requires_company_toggle",
      "Company initial login requires company toggle",
      "requires_company_toggle",
      {
        executionSettingsProfile: executionProfile("company"),
        loginState: loginState("login_page_detected", ["Privat", "Företag"]),
        mode: "local_dev_route_model",
        pageState: pageState("avanza_login_page", ["Privat", "Företag"]),
        realWorldLoginSignals: signalPack("company-initial-toggle", {
          customerType: "company",
          flowKind: "initial_login_choice",
          loginMethod: "unknown",
          secondaryActions: ["Logga in på företagswebben"],
          toggleLabels: ["Privat", "Företag"],
          visibleTexts: ["Privat", "Företag"],
        }),
        routePlanningEnabled: true,
      },
    ),
    buildFixture(
      "company_username_password_form_ready",
      "Company username/password form ready",
      "ready_company_username_password",
      {
        executionSettingsProfile: executionProfile("company"),
        loginState: loginState("username_password_possible", [
          "Företag",
          "Användarnamn",
          "Lösenord",
        ]),
        mode: "local_dev_route_model",
        pageState: pageState(
          "avanza_login_page",
          ["Företag"],
          ["Användarnamn", "Lösenord"],
        ),
        realWorldLoginSignals: signalPack("company-form-ready", {
          buttonTexts: ["Logga in"],
          customerType: "company",
          flowKind: "company_username_password_login",
          formLabels: ["Företag"],
          inputLabels: ["Användarnamn", "Lösenord"],
          loginMethod: "username_password",
          secondaryActions: ["Logga in på företagswebben"],
          visibleTexts: ["Företag", "Användarnamn", "Lösenord"],
        }),
        routePlanningEnabled: true,
      },
    ),
    buildFixture("missing_credentials", "Missing credentials", "requires_credentials", {
      executionSettingsProfile: executionProfile("private", {
        passwordConfigured: false,
      }),
      loginState: loginState("username_password_possible", ["Privatkund"]),
      mode: "local_dev_route_model",
      pageState: pageState("avanza_login_page", ["Privatkund"]),
      routePlanningEnabled: true,
    }),
    buildFixture(
      "incomplete_settings",
      "Incomplete settings",
      "requires_credentials",
      {
        executionSettingsProfile: executionProfile("unknown", {
          customerType: "unknown",
          passwordConfigured: false,
          usernameConfigured: false,
        }),
        loginState: loginState("login_page_detected", ["Logga in"]),
        mode: "local_dev_route_model",
        pageState: pageState("avanza_login_page", ["Logga in"]),
        routePlanningEnabled: true,
      },
    ),
    buildFixture(
      "bankid_qr_manual_action_required",
      "BankID QR manual action required",
      "bankid_or_mfa_manual_action_required",
      {
        executionSettingsProfile: executionProfile("private"),
        loginState: loginState("mfa_or_bankid_required", ["Visa QR-kod"]),
        mode: "local_dev_route_model",
        pageState: pageState("avanza_bankid_or_mfa", ["BankID", "Visa QR-kod"]),
        realWorldLoginSignals: signalPack("bankid-qr-manual", {
          buttonTexts: ["Visa QR-kod"],
          customerType: "unknown",
          flowKind: "bankid_qr_option",
          loginMethod: "bankid_qr",
          visibleTexts: ["BankID", "Visa QR-kod"],
        }),
        routePlanningEnabled: true,
      },
    ),
    buildFixture(
      "bankid_same_device_manual_action_required",
      "BankID same-device manual action required",
      "bankid_or_mfa_manual_action_required",
      {
        executionSettingsProfile: executionProfile("private"),
        loginState: loginState("mfa_or_bankid_required", [
          "Öppna BankID på samma enhet",
        ]),
        mode: "local_dev_route_model",
        pageState: pageState("avanza_bankid_or_mfa", [
          "BankID",
          "Öppna BankID på samma enhet",
        ]),
        realWorldLoginSignals: signalPack("bankid-same-device-manual", {
          buttonTexts: ["Öppna BankID på samma enhet"],
          customerType: "unknown",
          flowKind: "bankid_same_device_option",
          loginMethod: "bankid_same_device",
          visibleTexts: ["BankID", "Öppna BankID på samma enhet"],
        }),
        routePlanningEnabled: true,
      },
    ),
    buildFixture("blocked_planner", "Blocked planner", "blocked", {
      blockedReasons: ["Explicit planner block for fixture coverage"],
      executionSettingsProfile: executionProfile("private"),
      loginState: loginState("blocked"),
      mode: "local_dev_route_model",
      pageState: pageState("blocked"),
      routePlanningEnabled: true,
    }),
    buildFixture("error_planner", "Error planner", "error", {
      executionSettingsProfile: executionProfile("private"),
      forceError: true,
      mode: "local_dev_route_model",
      routePlanningEnabled: true,
    }),
    buildFixture("unknown_planner", "Unknown planner", "unknown", {
      executionSettingsProfile: executionProfile("unknown", {
        customerType: "unknown",
        passwordConfigured: true,
        usernameConfigured: true,
      }),
      loginState: loginState("unknown", ["Avanza"]),
      mode: "local_dev_route_model",
      pageState: pageState("avanza_public_page", ["Avanza"]),
      routePlanningEnabled: true,
    }),
  ];

export const avanzaLoginRoutePlannerDefaultFixture =
  avanzaLoginRoutePlannerFixtures[0];
