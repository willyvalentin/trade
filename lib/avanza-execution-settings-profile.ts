export type AvanzaExecutionCustomerType = "private" | "company" | "unknown";

export type AvanzaExecutionLoginMethod =
  | "username_password"
  | "bankid_forbidden"
  | "unknown";

export type AvanzaExecutionCredentialStorageKind =
  | "none"
  | "macos_keychain"
  | "onepassword_cli"
  | "environment_variable_dev_only"
  | "manual_prompt"
  | "unknown";

export type AvanzaExecutionSettingsProfileStatus =
  | "disabled"
  | "incomplete"
  | "configured"
  | "ready_for_local_dev"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaExecutionSettingsProfileSafetyFlags = {
  profileEnabled: boolean;
  localOnly: boolean;
  canConfigureCustomerType: boolean;
  canConfigureUsername: boolean;
  canConfigurePasswordReference: boolean;
  canReadCredentialMaterial: false;
  canReturnCredentialMaterial: false;
  canLogCredentialMaterial: false;
  canStoreCredentialMaterialInSupabase: false;
  canStoreCredentialMaterialInLocalStorage: false;
  canUseMacosKeychain: boolean;
  canUseOnePasswordCli: boolean;
  canUseEnvironmentVariableDevOnly: boolean;
  canUseManualPrompt: boolean;
  canAutomateBankId: false;
  canBypassBankId: false;
  canSubmitLogin: false;
  canFillLoginForm: false;
  canSubmitOrder: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaExecutionSettingsProfileInput = {
  profileEnabled?: boolean;
  customerType?: AvanzaExecutionCustomerType;
  loginMethod?: AvanzaExecutionLoginMethod;
  credentialStorageKind?: AvanzaExecutionCredentialStorageKind;
  usernameConfigured?: boolean;
  passwordConfigured?: boolean;
  credentialProviderState?: unknown;
  localDevOnly?: boolean;
  now?: string;
  profileId?: string;
  forceError?: boolean;
  blockedReasons?: readonly string[];
  warnings?: readonly string[];
};

export type AvanzaExecutionSettingsProfile =
  AvanzaExecutionSettingsProfileSafetyFlags & {
    profileId: string;
    createdAt: string;
    status: AvanzaExecutionSettingsProfileStatus;
    label: string;
    reason: string;
    customerType: AvanzaExecutionCustomerType;
    loginMethod: AvanzaExecutionLoginMethod;
    credentialStorageKind: AvanzaExecutionCredentialStorageKind;
    usernameConfigured: boolean;
    passwordConfigured: boolean;
    credentialMaterialPresent: false;
    credentialMaterialReturned: false;
    canUseForPrivateLogin: boolean;
    canUseForCompanyLogin: boolean;
    canUseUsernamePasswordLogin: boolean;
    bankIdForbidden: true;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaExecutionSettingsProfileSafetyFlags;
  };

const defaultCreatedAt = "2026-07-05T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid\s*qr|broker\s*secret|cookie|credential|password\s*[:=]|personnummer|secret|session|storage|token/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text) || /\d{5,}/.test(text)) return undefined;

  return text;
}

function safeStringArray(values: readonly string[] | undefined) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function isLocalCredentialStorage(
  credentialStorageKind: AvanzaExecutionCredentialStorageKind,
) {
  return (
    credentialStorageKind === "macos_keychain" ||
    credentialStorageKind === "onepassword_cli" ||
    credentialStorageKind === "manual_prompt"
  );
}

function providerStatus(credentialProviderState: unknown) {
  return isRecord(credentialProviderState) &&
    typeof credentialProviderState.status === "string"
    ? credentialProviderState.status
    : undefined;
}

function providerSafetyBlocks(credentialProviderState: unknown) {
  if (!isRecord(credentialProviderState)) return false;

  return (
    credentialProviderState.canReadCredentialMaterial === true ||
    credentialProviderState.canReturnCredentialMaterial === true ||
    credentialProviderState.canLogCredentialMaterial === true ||
    credentialProviderState.canStoreCredentialMaterial === true ||
    credentialProviderState.canStoreCredentialInSupabase === true ||
    credentialProviderState.canReadCookies === true ||
    credentialProviderState.canExportSession === true ||
    credentialProviderState.canBypassBankId === true ||
    credentialProviderState.controlsEnabled === true ||
    credentialProviderState.gateLocked === false
  );
}

function credentialProviderConfigured(credentialProviderState: unknown) {
  const status = providerStatus(credentialProviderState);

  return status === "ready" || status === "configured";
}

function deriveBlockedReasons(
  input: AvanzaExecutionSettingsProfileInput,
  loginMethod: AvanzaExecutionLoginMethod,
  credentialStorageKind: AvanzaExecutionCredentialStorageKind,
) {
  const blockedReasons = safeStringArray(input.blockedReasons);

  if (loginMethod === "bankid_forbidden") {
    blockedReasons.push("BankID is forbidden for automation.");
  } else if (loginMethod !== "username_password" && input.profileEnabled === true) {
    blockedReasons.push("Username/password is the only supported login method.");
  }

  if (credentialStorageKind === "environment_variable_dev_only") {
    blockedReasons.push(
      "Environment-variable credentials are modeled as dev-only and blocked; this module does not read env.",
    );
  }

  if (providerSafetyBlocks(input.credentialProviderState)) {
    blockedReasons.push(
      "Credential provider state requested forbidden credential/session capability.",
    );
  }

  return blockedReasons;
}

function deriveStatus(
  input: AvanzaExecutionSettingsProfileInput,
  customerType: AvanzaExecutionCustomerType,
  loginMethod: AvanzaExecutionLoginMethod,
  credentialStorageKind: AvanzaExecutionCredentialStorageKind,
  blockedReasons: readonly string[],
): AvanzaExecutionSettingsProfileStatus {
  if (input.forceError === true) return "error";
  if (blockedReasons.length > 0) return "blocked";
  if (input.profileEnabled !== true) return "disabled";
  if (customerType === "unknown") return "incomplete";
  if (loginMethod !== "username_password") return "blocked";
  if (input.usernameConfigured !== true) return "incomplete";
  if (input.passwordConfigured !== true) return "incomplete";
  if (credentialStorageKind === "none" || credentialStorageKind === "unknown") {
    return "incomplete";
  }
  if (!credentialProviderConfigured(input.credentialProviderState)) {
    return "configured";
  }
  if (isLocalCredentialStorage(credentialStorageKind) && input.localDevOnly === true) {
    return "ready_for_local_dev";
  }

  return "configured";
}

function labelFor(status: AvanzaExecutionSettingsProfileStatus) {
  switch (status) {
    case "disabled":
      return "Execution settings profile disabled";
    case "incomplete":
      return "Execution settings profile incomplete";
    case "configured":
      return "Execution settings profile configured";
    case "ready_for_local_dev":
      return "Execution settings profile ready for local dev";
    case "blocked":
      return "Execution settings profile blocked";
    case "error":
      return "Execution settings profile error";
    case "unknown":
      return "Execution settings profile unknown";
  }
}

function reasonFor(status: AvanzaExecutionSettingsProfileStatus) {
  switch (status) {
    case "disabled":
      return "Execution settings profile is disabled.";
    case "incomplete":
      return "Execution settings profile is missing customer type, username/password configuration, or provider selection.";
    case "configured":
      return "Execution settings profile has username/password configuration metadata but is not ready for local-dev use.";
    case "ready_for_local_dev":
      return "Execution settings profile is modeled ready for local-dev username/password login without reading credential material.";
    case "blocked":
      return "Execution settings profile is blocked by explicit safety rules.";
    case "error":
      return "Execution settings profile returned an error state.";
    case "unknown":
      return "Execution settings profile state is unknown.";
  }
}

function buildSafetyFlags(
  input: AvanzaExecutionSettingsProfileInput,
  credentialStorageKind: AvanzaExecutionCredentialStorageKind,
): AvanzaExecutionSettingsProfileSafetyFlags {
  const profileEnabled = input.profileEnabled === true;

  return {
    profileEnabled,
    localOnly: input.localDevOnly === true || isLocalCredentialStorage(credentialStorageKind),
    canConfigureCustomerType: profileEnabled,
    canConfigureUsername: profileEnabled,
    canConfigurePasswordReference: profileEnabled,
    canReadCredentialMaterial: false,
    canReturnCredentialMaterial: false,
    canLogCredentialMaterial: false,
    canStoreCredentialMaterialInSupabase: false,
    canStoreCredentialMaterialInLocalStorage: false,
    canUseMacosKeychain: credentialStorageKind === "macos_keychain",
    canUseOnePasswordCli: credentialStorageKind === "onepassword_cli",
    canUseEnvironmentVariableDevOnly:
      credentialStorageKind === "environment_variable_dev_only",
    canUseManualPrompt: credentialStorageKind === "manual_prompt",
    canAutomateBankId: false,
    canBypassBankId: false,
    canSubmitLogin: false,
    canFillLoginForm: false,
    canSubmitOrder: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

export function buildAvanzaExecutionSettingsProfile(
  input: AvanzaExecutionSettingsProfileInput = {},
): AvanzaExecutionSettingsProfile {
  const customerType = input.customerType ?? "unknown";
  const loginMethod = input.loginMethod ?? "unknown";
  const credentialStorageKind = input.credentialStorageKind ?? "unknown";
  const blockedReasons = deriveBlockedReasons(
    input,
    loginMethod,
    credentialStorageKind,
  );
  const warnings = safeStringArray(input.warnings);
  const status = deriveStatus(
    input,
    customerType,
    loginMethod,
    credentialStorageKind,
    blockedReasons,
  );
  const safetyFlags = buildSafetyFlags(input, credentialStorageKind);
  const usernameConfigured = input.usernameConfigured === true;
  const passwordConfigured = input.passwordConfigured === true;
  const canUseUsernamePasswordLogin =
    status === "ready_for_local_dev" || status === "configured";

  if (credentialStorageKind === "manual_prompt") {
    warnings.push(
      "Manual prompt is modeled only and does not return credential material.",
    );
  }

  return {
    ...safetyFlags,
    profileId: safeText(input.profileId) ?? "avanza-execution-settings-profile",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    status,
    label: labelFor(status),
    reason: reasonFor(status),
    customerType,
    loginMethod,
    credentialStorageKind,
    usernameConfigured,
    passwordConfigured,
    credentialMaterialPresent: false,
    credentialMaterialReturned: false,
    canUseForPrivateLogin:
      customerType === "private" && canUseUsernamePasswordLogin,
    canUseForCompanyLogin:
      customerType === "company" && canUseUsernamePasswordLogin,
    canUseUsernamePasswordLogin,
    bankIdForbidden: true,
    warnings,
    blockedReasons,
    safetyFlags,
  };
}
