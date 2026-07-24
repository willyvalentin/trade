import {
  buildAvanzaExecutionSettingsProfile,
  type AvanzaExecutionSettingsProfile,
  type AvanzaExecutionSettingsProfileInput,
  type AvanzaExecutionSettingsProfileStatus,
} from "./avanza-execution-settings-profile";
import { buildAvanzaSecureCredentialProviderState } from "./avanza-secure-credential-provider";

export type AvanzaExecutionSettingsProfileFixtureId =
  | "disabled_profile"
  | "incomplete_missing_customer_type"
  | "incomplete_missing_username"
  | "incomplete_missing_password"
  | "private_username_password_ready_macos_keychain"
  | "company_username_password_ready_macos_keychain"
  | "onepassword_cli_modeled_ready"
  | "manual_prompt_modeled_configured"
  | "environment_variable_dev_only_blocked"
  | "bankid_forbidden_blocked"
  | "unknown_profile"
  | "error_profile";

export type AvanzaExecutionSettingsProfileFixture = {
  fixtureId: AvanzaExecutionSettingsProfileFixtureId;
  label: string;
  expectedStatus: AvanzaExecutionSettingsProfileStatus;
  input: AvanzaExecutionSettingsProfileInput;
  profile: AvanzaExecutionSettingsProfile;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

const readyMacosProvider = buildAvanzaSecureCredentialProviderState({
  createdAt: fixtureNow,
  kind: "macos_keychain",
  passwordAvailable: true,
  providerAvailable: true,
  providerEnabled: true,
  usernameConfigured: true,
});

const readyOnePasswordProvider = buildAvanzaSecureCredentialProviderState({
  createdAt: fixtureNow,
  kind: "onepassword_cli",
  passwordAvailable: true,
  providerAvailable: true,
  providerEnabled: true,
  usernameConfigured: true,
});

const readyManualPromptProvider = buildAvanzaSecureCredentialProviderState({
  createdAt: fixtureNow,
  kind: "manual_prompt",
  passwordAvailable: true,
  providerAvailable: true,
  providerEnabled: true,
  usernameConfigured: true,
});

function buildFixture(
  fixtureId: AvanzaExecutionSettingsProfileFixtureId,
  label: string,
  expectedStatus: AvanzaExecutionSettingsProfileStatus,
  input: AvanzaExecutionSettingsProfileInput,
): AvanzaExecutionSettingsProfileFixture {
  return {
    fixtureId,
    label,
    expectedStatus,
    input,
    profile: buildAvanzaExecutionSettingsProfile({
      now: fixtureNow,
      profileId: fixtureId,
      ...input,
    }),
  };
}

export const avanzaExecutionSettingsProfileFixtures:
  AvanzaExecutionSettingsProfileFixture[] = [
    buildFixture("disabled_profile", "Disabled profile", "disabled", {
      profileEnabled: false,
    }),
    buildFixture(
      "incomplete_missing_customer_type",
      "Incomplete missing customer type",
      "incomplete",
      {
        credentialProviderState: readyMacosProvider,
        credentialStorageKind: "macos_keychain",
        loginMethod: "username_password",
        localDevOnly: true,
        passwordConfigured: true,
        profileEnabled: true,
        usernameConfigured: true,
      },
    ),
    buildFixture(
      "incomplete_missing_username",
      "Incomplete missing username",
      "incomplete",
      {
        credentialProviderState: readyMacosProvider,
        credentialStorageKind: "macos_keychain",
        customerType: "private",
        loginMethod: "username_password",
        localDevOnly: true,
        passwordConfigured: true,
        profileEnabled: true,
        usernameConfigured: false,
      },
    ),
    buildFixture(
      "incomplete_missing_password",
      "Incomplete missing password",
      "incomplete",
      {
        credentialProviderState: readyMacosProvider,
        credentialStorageKind: "macos_keychain",
        customerType: "private",
        loginMethod: "username_password",
        localDevOnly: true,
        passwordConfigured: false,
        profileEnabled: true,
        usernameConfigured: true,
      },
    ),
    buildFixture(
      "private_username_password_ready_macos_keychain",
      "Private username/password ready with macOS Keychain modeled",
      "ready_for_local_dev",
      {
        credentialProviderState: readyMacosProvider,
        credentialStorageKind: "macos_keychain",
        customerType: "private",
        loginMethod: "username_password",
        localDevOnly: true,
        passwordConfigured: true,
        profileEnabled: true,
        usernameConfigured: true,
      },
    ),
    buildFixture(
      "company_username_password_ready_macos_keychain",
      "Company username/password ready with macOS Keychain modeled",
      "ready_for_local_dev",
      {
        credentialProviderState: readyMacosProvider,
        credentialStorageKind: "macos_keychain",
        customerType: "company",
        loginMethod: "username_password",
        localDevOnly: true,
        passwordConfigured: true,
        profileEnabled: true,
        usernameConfigured: true,
      },
    ),
    buildFixture(
      "onepassword_cli_modeled_ready",
      "1Password CLI modeled ready",
      "ready_for_local_dev",
      {
        credentialProviderState: readyOnePasswordProvider,
        credentialStorageKind: "onepassword_cli",
        customerType: "private",
        loginMethod: "username_password",
        localDevOnly: true,
        passwordConfigured: true,
        profileEnabled: true,
        usernameConfigured: true,
        warnings: ["1Password CLI is modeled only; no CLI call is made"],
      },
    ),
    buildFixture(
      "manual_prompt_modeled_configured",
      "Manual prompt modeled configured",
      "ready_for_local_dev",
      {
        credentialProviderState: readyManualPromptProvider,
        credentialStorageKind: "manual_prompt",
        customerType: "private",
        loginMethod: "username_password",
        localDevOnly: true,
        passwordConfigured: true,
        profileEnabled: true,
        usernameConfigured: true,
      },
    ),
    buildFixture(
      "environment_variable_dev_only_blocked",
      "Environment variable dev-only blocked",
      "blocked",
      {
        credentialStorageKind: "environment_variable_dev_only",
        customerType: "private",
        loginMethod: "username_password",
        localDevOnly: true,
        passwordConfigured: true,
        profileEnabled: true,
        usernameConfigured: true,
      },
    ),
    buildFixture("bankid_forbidden_blocked", "BankID forbidden blocked", "blocked", {
      credentialStorageKind: "macos_keychain",
      customerType: "private",
      loginMethod: "bankid_forbidden",
      localDevOnly: true,
      passwordConfigured: true,
      profileEnabled: true,
      usernameConfigured: true,
    }),
    buildFixture("unknown_profile", "Unknown profile", "blocked", {
      credentialStorageKind: "unknown",
      customerType: "unknown",
      loginMethod: "unknown",
      profileEnabled: true,
    }),
    buildFixture("error_profile", "Error profile", "error", {
      forceError: true,
      profileEnabled: true,
    }),
  ];

export const avanzaExecutionSettingsProfileDefaultFixture =
  avanzaExecutionSettingsProfileFixtures[0];
