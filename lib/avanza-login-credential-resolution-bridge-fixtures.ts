import {
  buildAvanzaLoginCredentialResolutionState,
  type AvanzaLoginCredentialResolutionConfig,
  type AvanzaLoginCredentialResolutionResult,
  type AvanzaLoginCredentialResolutionStatus,
} from "./avanza-login-credential-resolution-bridge";

export type AvanzaLoginCredentialResolutionBridgeFixtureId =
  | "disabled"
  | "contract_only_references_modeled"
  | "local_dev_ready"
  | "username_resolved_safe_report"
  | "password_resolved_safe_report"
  | "both_references_resolved_safe_report"
  | "missing_username_reference"
  | "missing_password_reference"
  | "credential_read_blocked"
  | "credential_read_failed"
  | "unsafe_output_blocked"
  | "environment_fallback_forbidden"
  | "supabase_credential_storage_forbidden"
  | "localstorage_credential_storage_forbidden"
  | "error"
  | "unknown";

export type AvanzaLoginCredentialResolutionBridgeFixture = {
  expectedStatus: AvanzaLoginCredentialResolutionStatus;
  fixtureId: AvanzaLoginCredentialResolutionBridgeFixtureId;
  input: AvanzaLoginCredentialResolutionConfig;
  label: string;
  result: AvanzaLoginCredentialResolutionResult;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const baseContractInput: AvanzaLoginCredentialResolutionConfig = {
  enabled: true,
  hasPasswordReference: true,
  hasUsernameReference: true,
  localDevOnly: true,
  mode: "contract_only",
};

const baseLocalDevInput: AvanzaLoginCredentialResolutionConfig = {
  ...baseContractInput,
  allowResolvePassword: true,
  allowResolveUsername: true,
  mode: "local_dev",
};

function buildFixture(
  fixtureId: AvanzaLoginCredentialResolutionBridgeFixtureId,
  label: string,
  expectedStatus: AvanzaLoginCredentialResolutionStatus,
  input: AvanzaLoginCredentialResolutionConfig,
): AvanzaLoginCredentialResolutionBridgeFixture {
  return {
    expectedStatus,
    fixtureId,
    input,
    label,
    result: buildAvanzaLoginCredentialResolutionState({
      bridgeId: `fixture-${fixtureId}`,
      now: fixtureNow,
      ...input,
    }),
  };
}

export const avanzaLoginCredentialResolutionBridgeFixtures: AvanzaLoginCredentialResolutionBridgeFixture[] =
  [
    buildFixture("disabled", "Disabled by default", "disabled", {
      enabled: false,
      mode: "disabled",
    }),
    buildFixture(
      "contract_only_references_modeled",
      "Contract-only references modeled",
      "ready",
      baseContractInput,
    ),
    buildFixture("local_dev_ready", "Local-dev ready", "ready", baseLocalDevInput),
    buildFixture(
      "username_resolved_safe_report",
      "Username resolved safe report",
      "ready",
      {
        ...baseLocalDevInput,
        usernameResolved: true,
      },
    ),
    buildFixture(
      "password_resolved_safe_report",
      "Password resolved safe report",
      "ready",
      {
        ...baseLocalDevInput,
        passwordResolved: true,
      },
    ),
    buildFixture(
      "both_references_resolved_safe_report",
      "Both references resolved safe report",
      "resolved_references",
      {
        ...baseLocalDevInput,
        passwordResolved: true,
        usernameResolved: true,
      },
    ),
    buildFixture(
      "missing_username_reference",
      "Missing username reference",
      "missing_username_reference",
      {
        ...baseLocalDevInput,
        hasUsernameReference: false,
      },
    ),
    buildFixture(
      "missing_password_reference",
      "Missing password reference",
      "missing_password_reference",
      {
        ...baseLocalDevInput,
        hasPasswordReference: false,
      },
    ),
    buildFixture(
      "credential_read_blocked",
      "Credential read blocked",
      "credential_read_blocked",
      {
        ...baseLocalDevInput,
        allowResolvePassword: false,
        allowResolveUsername: false,
        statusOverride: "credential_read_blocked",
      },
    ),
    buildFixture(
      "credential_read_failed",
      "Credential read failed",
      "credential_read_failed",
      {
        ...baseLocalDevInput,
        statusOverride: "credential_read_failed",
      },
    ),
    buildFixture(
      "unsafe_output_blocked",
      "Unsafe output blocked",
      "unsafe_output_blocked",
      {
        ...baseLocalDevInput,
        allowReturnCredentialMaterialToUi: true,
      },
    ),
    buildFixture(
      "environment_fallback_forbidden",
      "Environment fallback forbidden",
      "unsafe_output_blocked",
      {
        ...baseLocalDevInput,
        allowEnvironmentFallback: true,
      },
    ),
    buildFixture(
      "supabase_credential_storage_forbidden",
      "Supabase credential storage forbidden",
      "unsafe_output_blocked",
      {
        ...baseLocalDevInput,
        allowStoreCredentialMaterialInSupabase: true,
      },
    ),
    buildFixture(
      "localstorage_credential_storage_forbidden",
      "localStorage credential storage forbidden",
      "unsafe_output_blocked",
      {
        ...baseLocalDevInput,
        allowStoreCredentialMaterialInLocalStorage: true,
      },
    ),
    buildFixture("error", "Bridge error", "error", {
      ...baseLocalDevInput,
      forceError: true,
    }),
    buildFixture("unknown", "Bridge unknown", "unknown", {
      ...baseLocalDevInput,
      statusOverride: "unknown",
    }),
  ];

export const avanzaLoginCredentialResolutionBridgeDefaultFixture =
  avanzaLoginCredentialResolutionBridgeFixtures[0];
