import {
  buildAvanzaExecutionSettingsProfile,
  type AvanzaExecutionCustomerType,
  type AvanzaExecutionSettingsProfile,
  type AvanzaExecutionSettingsProfileInput,
  type AvanzaExecutionSettingsProfileStatus,
} from "./avanza-execution-settings-profile";

export type AvanzaExecutionSettingsProfileUiFixtureId =
  | "no_account_type_selected"
  | "private_selected_credentials_missing"
  | "company_selected_credentials_missing"
  | "private_ready_references_modeled"
  | "company_ready_references_modeled"
  | "bankid_forbidden"
  | "supabase_storage_forbidden"
  | "localstorage_credential_storage_forbidden"
  | "smoke_test_terminal_only"
  | "order_submission_unavailable"
  | "final_click_human_only";

export type AvanzaExecutionSettingsProfileUiFixture = {
  fixtureId: AvanzaExecutionSettingsProfileUiFixtureId;
  label: string;
  expectedStatus: AvanzaExecutionSettingsProfileStatus;
  customerType: AvanzaExecutionCustomerType;
  usernameReferenceConfigured: boolean;
  passwordReferenceConfigured: boolean;
  expectedRenderState: string;
  input: AvanzaExecutionSettingsProfileInput;
  profile: AvanzaExecutionSettingsProfile;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

function buildModeledProvider(
  usernameConfigured: boolean,
  passwordConfigured: boolean,
) {
  return {
    canBypassBankId: false,
    canExportSession: false,
    canLogCredentialMaterial: false,
    canReadCookies: false,
    canReadCredentialMaterial: false,
    canReturnCredentialMaterial: false,
    canStoreCredentialMaterial: false,
    canStoreCredentialInSupabase: false,
    controlsEnabled: false,
    gateLocked: true,
    status:
      usernameConfigured && passwordConfigured ? "ready" : "configured",
  };
}

function buildFixture(
  fixtureId: AvanzaExecutionSettingsProfileUiFixtureId,
  label: string,
  expectedStatus: AvanzaExecutionSettingsProfileStatus,
  input: AvanzaExecutionSettingsProfileInput,
  expectedRenderState: string,
): AvanzaExecutionSettingsProfileUiFixture {
  const profile = buildAvanzaExecutionSettingsProfile({
    credentialProviderState: buildModeledProvider(
      input.usernameConfigured === true,
      input.passwordConfigured === true,
    ),
    credentialStorageKind: "macos_keychain",
    loginMethod: "username_password",
    localDevOnly: true,
    now: fixtureNow,
    profileEnabled: true,
    profileId: fixtureId,
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedStatus,
    customerType: profile.customerType,
    usernameReferenceConfigured: profile.usernameConfigured,
    passwordReferenceConfigured: profile.passwordConfigured,
    expectedRenderState,
    input,
    profile,
  };
}

export const avanzaExecutionSettingsProfileUiFixtures:
  AvanzaExecutionSettingsProfileUiFixture[] = [
    buildFixture(
      "no_account_type_selected",
      "No account type selected",
      "incomplete",
      {
        customerType: "unknown",
        passwordConfigured: false,
        usernameConfigured: false,
      },
      "Not selected",
    ),
    buildFixture(
      "private_selected_credentials_missing",
      "Privat selected, credentials missing",
      "incomplete",
      {
        customerType: "private",
        passwordConfigured: false,
        usernameConfigured: false,
      },
      "Privat incomplete",
    ),
    buildFixture(
      "company_selected_credentials_missing",
      "Företag selected, credentials missing",
      "incomplete",
      {
        customerType: "company",
        passwordConfigured: false,
        usernameConfigured: false,
      },
      "Företag incomplete",
    ),
    buildFixture(
      "private_ready_references_modeled",
      "Privat ready with credential references modeled",
      "ready_for_local_dev",
      {
        customerType: "private",
        passwordConfigured: true,
        usernameConfigured: true,
      },
      "Privat ready",
    ),
    buildFixture(
      "company_ready_references_modeled",
      "Företag ready with credential references modeled",
      "ready_for_local_dev",
      {
        customerType: "company",
        passwordConfigured: true,
        usernameConfigured: true,
      },
      "Företag ready",
    ),
    buildFixture(
      "bankid_forbidden",
      "BankID forbidden",
      "blocked",
      {
        customerType: "private",
        loginMethod: "bankid_forbidden",
        passwordConfigured: true,
        usernameConfigured: true,
      },
      "BankID forbidden",
    ),
    buildFixture(
      "supabase_storage_forbidden",
      "Supabase credential storage forbidden",
      "ready_for_local_dev",
      {
        customerType: "private",
        passwordConfigured: true,
        usernameConfigured: true,
      },
      "Supabase credential storage forbidden",
    ),
    buildFixture(
      "localstorage_credential_storage_forbidden",
      "localStorage credential storage forbidden",
      "ready_for_local_dev",
      {
        customerType: "private",
        passwordConfigured: true,
        usernameConfigured: true,
      },
      "localStorage credential storage forbidden",
    ),
    buildFixture(
      "smoke_test_terminal_only",
      "Smoke test terminal-only",
      "ready_for_local_dev",
      {
        customerType: "private",
        passwordConfigured: true,
        usernameConfigured: true,
      },
      "Smoke test terminal-only",
    ),
    buildFixture(
      "order_submission_unavailable",
      "Order submission unavailable",
      "ready_for_local_dev",
      {
        customerType: "private",
        passwordConfigured: true,
        usernameConfigured: true,
      },
      "Order submission unavailable",
    ),
    buildFixture(
      "final_click_human_only",
      "Final click human-only",
      "ready_for_local_dev",
      {
        customerType: "company",
        passwordConfigured: true,
        usernameConfigured: true,
      },
      "Final KÖP/SÄLJ human-only",
    ),
  ];
