import {
  buildAvanzaMacosKeychainCredentialProviderState,
  type AvanzaMacosKeychainCredentialProviderConfig,
  type AvanzaMacosKeychainCredentialProviderState,
  type AvanzaMacosKeychainCredentialProviderStatus,
} from "./avanza-macos-keychain-credential-provider";

export type AvanzaMacosKeychainCredentialProviderFixtureId =
  | "disabled"
  | "contract_only_references_modeled"
  | "keychain_unavailable"
  | "keychain_ready"
  | "username_reference_configured"
  | "password_reference_configured"
  | "both_references_configured"
  | "credential_check_passed"
  | "credential_check_failed"
  | "credential_read_blocked"
  | "local_dev_credential_read_allowed_value_hidden"
  | "write_reference_modeled"
  | "environment_fallback_forbidden"
  | "supabase_credential_storage_forbidden"
  | "localstorage_credential_storage_forbidden"
  | "error"
  | "unknown";

export type AvanzaMacosKeychainCredentialProviderFixture = {
  expectedStatus: AvanzaMacosKeychainCredentialProviderStatus;
  fixtureId: AvanzaMacosKeychainCredentialProviderFixtureId;
  input: AvanzaMacosKeychainCredentialProviderConfig;
  label: string;
  state: AvanzaMacosKeychainCredentialProviderState;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const usernameReference = {
  accountKey: "private-username-ref",
  customerType: "private" as const,
  kind: "username" as const,
  label: "Private username reference",
  maskedAccountHint: "user-ref-hidden",
  safeDisplayName: "Private login username reference",
  serviceName: "sharp-avanza-private-login",
};

const passwordReference = {
  accountKey: "private-secret-ref",
  customerType: "private" as const,
  kind: "password" as const,
  label: "Private password reference",
  maskedAccountHint: "pass-ref-hidden",
  safeDisplayName: "Private login password reference",
  serviceName: "sharp-avanza-private-login",
};

function buildFixture(
  fixtureId: AvanzaMacosKeychainCredentialProviderFixtureId,
  label: string,
  expectedStatus: AvanzaMacosKeychainCredentialProviderStatus,
  input: AvanzaMacosKeychainCredentialProviderConfig,
): AvanzaMacosKeychainCredentialProviderFixture {
  return {
    expectedStatus,
    fixtureId,
    input,
    label,
    state: buildAvanzaMacosKeychainCredentialProviderState({
      now: fixtureNow,
      providerId: `fixture-${fixtureId}`,
      ...input,
    }),
  };
}

const baseContractInput: AvanzaMacosKeychainCredentialProviderConfig = {
  enabled: true,
  localDevOnly: true,
  mode: "contract_only",
  provider: "macos_keychain",
  references: [usernameReference, passwordReference],
};

const baseLocalDevInput: AvanzaMacosKeychainCredentialProviderConfig = {
  ...baseContractInput,
  allowCheckAvailability: true,
  allowCheckCredentialExists: true,
  mode: "local_dev",
};

export const avanzaMacosKeychainCredentialProviderFixtures: AvanzaMacosKeychainCredentialProviderFixture[] =
  [
    buildFixture("disabled", "Disabled by default", "disabled", {
      enabled: false,
      mode: "disabled",
    }),
    buildFixture(
      "contract_only_references_modeled",
      "Contract-only references modeled",
      "credential_reference_configured",
      baseContractInput,
    ),
    buildFixture("keychain_unavailable", "Keychain unavailable", "unavailable", {
      ...baseLocalDevInput,
      forceUnavailable: true,
    }),
    buildFixture("keychain_ready", "Keychain ready", "ready", baseLocalDevInput),
    buildFixture(
      "username_reference_configured",
      "Username reference configured",
      "credential_reference_configured",
      {
        ...baseContractInput,
        references: [usernameReference],
      },
    ),
    buildFixture(
      "password_reference_configured",
      "Password reference configured",
      "credential_reference_configured",
      {
        ...baseContractInput,
        references: [passwordReference],
      },
    ),
    buildFixture(
      "both_references_configured",
      "Both references configured",
      "credential_reference_configured",
      baseContractInput,
    ),
    buildFixture(
      "credential_check_passed",
      "Credential check passed",
      "credential_check_passed",
      {
        ...baseLocalDevInput,
        statusOverride: "credential_check_passed",
      },
    ),
    buildFixture(
      "credential_check_failed",
      "Credential check failed",
      "credential_check_failed",
      {
        ...baseLocalDevInput,
        statusOverride: "credential_check_failed",
      },
    ),
    buildFixture(
      "credential_read_blocked",
      "Credential read blocked",
      "credential_read_blocked",
      {
        ...baseLocalDevInput,
        allowReadCredentialMaterial: false,
        statusOverride: "credential_read_blocked",
      },
    ),
    buildFixture(
      "local_dev_credential_read_allowed_value_hidden",
      "Local-dev credential read allowed with value hidden",
      "credential_read_allowed_local_dev",
      {
        ...baseLocalDevInput,
        allowReadCredentialMaterial: true,
        statusOverride: "credential_read_allowed_local_dev",
      },
    ),
    buildFixture(
      "write_reference_modeled",
      "Write reference modeled",
      "credential_reference_configured",
      {
        ...baseLocalDevInput,
        allowWriteCredentialReference: true,
        statusOverride: "credential_reference_configured",
      },
    ),
    buildFixture(
      "environment_fallback_forbidden",
      "Environment fallback forbidden",
      "credential_read_blocked",
      {
        ...baseLocalDevInput,
        allowEnvironmentFallback: true,
      },
    ),
    buildFixture(
      "supabase_credential_storage_forbidden",
      "Supabase credential storage forbidden",
      "credential_read_blocked",
      {
        ...baseLocalDevInput,
        allowStoreCredentialMaterialInSupabase: true,
      },
    ),
    buildFixture(
      "localstorage_credential_storage_forbidden",
      "localStorage credential storage forbidden",
      "credential_read_blocked",
      {
        ...baseLocalDevInput,
        allowStoreCredentialMaterialInLocalStorage: true,
      },
    ),
    buildFixture("error", "Provider error", "error", {
      ...baseLocalDevInput,
      forceError: true,
    }),
    buildFixture("unknown", "Provider unknown", "unknown", {
      ...baseLocalDevInput,
      statusOverride: "unknown",
    }),
  ];

export const avanzaMacosKeychainCredentialProviderDefaultFixture =
  avanzaMacosKeychainCredentialProviderFixtures[0];
