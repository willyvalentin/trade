export type AvanzaSecureCredentialProviderKind =
  | "none"
  | "macos_keychain"
  | "onepassword_cli"
  | "environment_variable_dev_only"
  | "manual_prompt";

export type AvanzaSecureCredentialProviderStatus =
  | "disabled"
  | "unavailable"
  | "configured"
  | "ready"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaSecureCredentialProviderSafetyFlags = {
  providerEnabled: boolean;
  localOnly: boolean;
  canReadCredentialMaterial: false;
  canReturnCredentialMaterial: false;
  canLogCredentialMaterial: false;
  canStoreCredentialMaterial: false;
  canStoreCredentialInSupabase: false;
  canReadCookies: false;
  canExportSession: false;
  canBypassBankId: false;
  requiresUserApproval: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaSecureCredentialProviderConfig = {
  providerId?: string;
  createdAt?: string;
  kind?: AvanzaSecureCredentialProviderKind;
  providerEnabled?: boolean;
  providerAvailable?: boolean;
  usernameConfigured?: boolean;
  passwordAvailable?: boolean;
  blocked?: boolean;
  forceError?: boolean;
  statusOverride?: AvanzaSecureCredentialProviderStatus;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaSecureCredentialProviderState =
  AvanzaSecureCredentialProviderSafetyFlags & {
    providerId: string;
    createdAt: string;
    kind: AvanzaSecureCredentialProviderKind;
    status: AvanzaSecureCredentialProviderStatus;
    label: string;
    reason: string;
    usernameConfigured: boolean;
    passwordAvailable: boolean;
    credentialMaterialReturned: false;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaSecureCredentialProviderSafetyFlags;
  };

const defaultCreatedAt = "2026-07-05T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid|broker\s*secret|cookie|credential|password|secret|session|storage|token/i;

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

function isLocalProvider(kind: AvanzaSecureCredentialProviderKind) {
  return (
    kind === "macos_keychain" ||
    kind === "onepassword_cli" ||
    kind === "environment_variable_dev_only" ||
    kind === "manual_prompt"
  );
}

function deriveStatus(
  config: AvanzaSecureCredentialProviderConfig,
  kind: AvanzaSecureCredentialProviderKind,
  blockedReasons: readonly string[],
): AvanzaSecureCredentialProviderStatus {
  if (config.statusOverride) return config.statusOverride;
  if (config.forceError === true) return "error";
  if (config.blocked === true || blockedReasons.length > 0) return "blocked";
  if (kind === "environment_variable_dev_only") return "blocked";
  if (kind === "none" || config.providerEnabled !== true) return "disabled";
  if (config.providerAvailable === false) return "unavailable";
  if (config.usernameConfigured === true && config.passwordAvailable === true) {
    return "ready";
  }
  if (config.usernameConfigured === true || config.passwordAvailable === true) {
    return "configured";
  }

  return "unknown";
}

function labelFor(
  status: AvanzaSecureCredentialProviderStatus,
  kind: AvanzaSecureCredentialProviderKind,
) {
  if (kind === "none") return "Credential provider disabled";

  switch (status) {
    case "disabled":
      return "Credential provider disabled";
    case "unavailable":
      return "Credential provider unavailable";
    case "configured":
      return "Credential provider configured";
    case "ready":
      return "Credential provider ready";
    case "blocked":
      return "Credential provider blocked";
    case "error":
      return "Credential provider error";
    case "unknown":
      return "Credential provider unknown";
  }
}

function reasonFor(
  status: AvanzaSecureCredentialProviderStatus,
  kind: AvanzaSecureCredentialProviderKind,
) {
  if (kind === "environment_variable_dev_only") {
    return "Environment variable credential provider is modeled but blocked; this module does not read env.";
  }

  switch (status) {
    case "disabled":
      return "No secure credential provider is enabled.";
    case "unavailable":
      return "Secure credential provider is modeled but unavailable.";
    case "configured":
      return "Secure credential provider configuration is modeled without returning credential material.";
    case "ready":
      return "Secure credential provider readiness is modeled without reading or returning credential material.";
    case "blocked":
      return "Secure credential provider is blocked by explicit safety input.";
    case "error":
      return "Secure credential provider returned an error state.";
    case "unknown":
      return "Secure credential provider state is unknown.";
  }
}

function buildSafetyFlags(
  config: AvanzaSecureCredentialProviderConfig,
  kind: AvanzaSecureCredentialProviderKind,
  status: AvanzaSecureCredentialProviderStatus,
): AvanzaSecureCredentialProviderSafetyFlags {
  return {
    providerEnabled:
      config.providerEnabled === true &&
      status !== "disabled" &&
      status !== "blocked" &&
      status !== "error",
    localOnly: isLocalProvider(kind),
    canReadCredentialMaterial: false,
    canReturnCredentialMaterial: false,
    canLogCredentialMaterial: false,
    canStoreCredentialMaterial: false,
    canStoreCredentialInSupabase: false,
    canReadCookies: false,
    canExportSession: false,
    canBypassBankId: false,
    requiresUserApproval: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

export function buildAvanzaSecureCredentialProviderState(
  input: AvanzaSecureCredentialProviderConfig = {},
): AvanzaSecureCredentialProviderState {
  const kind = input.kind ?? "none";
  const blockedReasons = safeStringArray(input.blockedReasons);
  const baseWarnings = safeStringArray(input.warnings);
  const warnings =
    kind === "environment_variable_dev_only"
      ? [...baseWarnings, "dev-only provider is modeled but env is not read"]
      : baseWarnings;
  const status = deriveStatus(input, kind, blockedReasons);
  const safetyFlags = buildSafetyFlags(input, kind, status);

  return {
    ...safetyFlags,
    providerId: safeText(input.providerId) ?? `avanza-provider-${kind}`,
    createdAt: safeText(input.createdAt) ?? defaultCreatedAt,
    kind,
    status,
    label: labelFor(status, kind),
    reason: reasonFor(status, kind),
    usernameConfigured: input.usernameConfigured === true,
    passwordAvailable: input.passwordAvailable === true,
    credentialMaterialReturned: false,
    warnings,
    blockedReasons,
    safetyFlags,
  };
}
