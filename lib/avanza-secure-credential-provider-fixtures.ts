import {
  buildAvanzaSecureCredentialProviderState,
  type AvanzaSecureCredentialProviderConfig,
  type AvanzaSecureCredentialProviderState,
  type AvanzaSecureCredentialProviderStatus,
} from "./avanza-secure-credential-provider";

export type AvanzaSecureCredentialProviderFixtureId =
  | "none_disabled"
  | "macos_keychain_configured_modeled"
  | "macos_keychain_ready_modeled"
  | "onepassword_cli_configured_modeled"
  | "environment_variable_dev_only_blocked"
  | "manual_prompt_modeled"
  | "unavailable"
  | "error";

export type AvanzaSecureCredentialProviderFixture = {
  expectedStatus: AvanzaSecureCredentialProviderStatus;
  fixtureId: AvanzaSecureCredentialProviderFixtureId;
  input: AvanzaSecureCredentialProviderConfig;
  label: string;
  modelResult: AvanzaSecureCredentialProviderState;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

function buildFixture(
  fixtureId: AvanzaSecureCredentialProviderFixtureId,
  label: string,
  expectedStatus: AvanzaSecureCredentialProviderStatus,
  input: AvanzaSecureCredentialProviderConfig,
): AvanzaSecureCredentialProviderFixture {
  return {
    expectedStatus,
    fixtureId,
    input,
    label,
    modelResult: buildAvanzaSecureCredentialProviderState(input),
  };
}

export const avanzaSecureCredentialProviderFixtures: AvanzaSecureCredentialProviderFixture[] =
  [
    buildFixture("none_disabled", "No provider disabled", "disabled", {
      createdAt: fixtureNow,
      kind: "none",
    }),
    buildFixture(
      "macos_keychain_configured_modeled",
      "macOS Keychain configured modeled",
      "configured",
      {
        createdAt: fixtureNow,
        kind: "macos_keychain",
        providerAvailable: true,
        providerEnabled: true,
        usernameConfigured: true,
      },
    ),
    buildFixture(
      "macos_keychain_ready_modeled",
      "macOS Keychain ready modeled without credentials",
      "ready",
      {
        createdAt: fixtureNow,
        kind: "macos_keychain",
        passwordAvailable: true,
        providerAvailable: true,
        providerEnabled: true,
        usernameConfigured: true,
      },
    ),
    buildFixture(
      "onepassword_cli_configured_modeled",
      "1Password CLI configured modeled",
      "configured",
      {
        createdAt: fixtureNow,
        kind: "onepassword_cli",
        providerAvailable: true,
        providerEnabled: true,
        usernameConfigured: true,
        warnings: ["CLI readiness only"],
      },
    ),
    buildFixture(
      "environment_variable_dev_only_blocked",
      "Environment variable dev-only blocked",
      "blocked",
      {
        createdAt: fixtureNow,
        kind: "environment_variable_dev_only",
        providerAvailable: true,
        providerEnabled: true,
        usernameConfigured: true,
      },
    ),
    buildFixture("manual_prompt_modeled", "Manual prompt modeled", "ready", {
      createdAt: fixtureNow,
      kind: "manual_prompt",
      passwordAvailable: true,
      providerAvailable: true,
      providerEnabled: true,
      usernameConfigured: true,
      warnings: ["manual prompt only"],
    }),
    buildFixture("unavailable", "Provider unavailable", "unavailable", {
      createdAt: fixtureNow,
      kind: "macos_keychain",
      providerAvailable: false,
      providerEnabled: true,
    }),
    buildFixture("error", "Provider error", "error", {
      createdAt: fixtureNow,
      forceError: true,
      kind: "macos_keychain",
      providerEnabled: true,
    }),
  ];

export const avanzaSecureCredentialProviderDefaultFixture =
  avanzaSecureCredentialProviderFixtures[0];
