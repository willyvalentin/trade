export type AvanzaMacosKeychainCredentialProviderStatus =
  | "disabled"
  | "unavailable"
  | "ready"
  | "credential_reference_configured"
  | "credential_reference_missing"
  | "credential_check_passed"
  | "credential_check_failed"
  | "credential_read_blocked"
  | "credential_read_allowed_local_dev"
  | "error"
  | "unknown";

export type AvanzaMacosKeychainCredentialProviderMode =
  | "disabled"
  | "contract_only"
  | "local_dev";

export type AvanzaMacosKeychainCredentialKind = "username" | "password";

export type AvanzaMacosKeychainCustomerType =
  | "private"
  | "company"
  | "unknown";

export type AvanzaMacosKeychainCredentialReference = {
  serviceName: string;
  accountKey: string;
  kind: AvanzaMacosKeychainCredentialKind;
  customerType: AvanzaMacosKeychainCustomerType;
  createdAt?: string;
  label?: string;
  safeDisplayName?: string;
  maskedAccountHint?: string;
};

export type AvanzaMacosKeychainCredentialProviderConfig = {
  providerId?: string;
  mode?: AvanzaMacosKeychainCredentialProviderMode;
  enabled?: boolean;
  localDevOnly?: true;
  provider?: "macos_keychain";
  references?: readonly Partial<AvanzaMacosKeychainCredentialReference>[];
  allowCheckAvailability?: boolean;
  allowCheckCredentialExists?: boolean;
  allowWriteCredentialReference?: boolean;
  allowReadCredentialMaterial?: boolean;
  allowReturnCredentialMaterialToUi?: boolean;
  allowLogCredentialMaterial?: boolean;
  allowStoreCredentialMaterialInSupabase?: boolean;
  allowStoreCredentialMaterialInLocalStorage?: boolean;
  allowEnvironmentFallback?: boolean;
  forceUnavailable?: boolean;
  forceError?: boolean;
  statusOverride?: AvanzaMacosKeychainCredentialProviderStatus;
  now?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaMacosKeychainCredentialProviderDependencies = {
  isAvailable: () => Promise<{ ok: boolean; reason?: string }>;
  hasCredential: (
    reference: AvanzaMacosKeychainCredentialReference,
  ) => Promise<{ ok: boolean; exists: boolean; reason?: string }>;
  readCredential: (
    reference: AvanzaMacosKeychainCredentialReference,
  ) => Promise<{ ok: boolean; value?: string; reason?: string }>;
  writeCredential: (
    reference: AvanzaMacosKeychainCredentialReference,
    value: string,
  ) => Promise<{ ok: boolean; reason?: string }>;
};

export type AvanzaMacosKeychainCredentialProviderSafetyFlags = {
  providerEnabled: boolean;
  localDevOnly: true;
  canCheckAvailability: boolean;
  canCheckCredentialExists: boolean;
  canWriteCredentialReference: boolean;
  canReadCredentialMaterial: boolean;
  canReturnCredentialMaterialToUi: false;
  canLogCredentialMaterial: false;
  canStoreCredentialMaterialInSupabase: false;
  canStoreCredentialMaterialInLocalStorage: false;
  canUseEnvironmentFallback: false;
  credentialValuesVisibleInReports: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  canSubmitLogin: false;
  canSubmitOrder: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaMacosKeychainCredentialProviderState =
  AvanzaMacosKeychainCredentialProviderSafetyFlags & {
    providerId: string;
    createdAt: string;
    provider: "macos_keychain";
    mode: AvanzaMacosKeychainCredentialProviderMode;
    status: AvanzaMacosKeychainCredentialProviderStatus;
    label: string;
    reason: string;
    references: AvanzaMacosKeychainCredentialReference[];
    valueReturnedToUi: false;
    valueLogged: false;
    valueStoredInSupabase: false;
    valueStoredInLocalStorage: false;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaMacosKeychainCredentialProviderSafetyFlags;
  };

export type AvanzaMacosKeychainCredentialReadResult =
  AvanzaMacosKeychainCredentialProviderSafetyFlags & {
    providerId: string;
    createdAt: string;
    status: AvanzaMacosKeychainCredentialProviderStatus;
    label: string;
    reason: string;
    reference: AvanzaMacosKeychainCredentialReference;
    valueReference: "username_from_secure_provider" | "password_from_secure_provider";
    valueReturnedToUi: false;
    valueLogged: false;
    valueStoredInSupabase: false;
    valueStoredInLocalStorage: false;
    privateInternalValue?: string;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaMacosKeychainCredentialProviderSafetyFlags;
  };

export type AvanzaMacosKeychainCredentialWriteResult =
  AvanzaMacosKeychainCredentialProviderSafetyFlags & {
    providerId: string;
    createdAt: string;
    status: AvanzaMacosKeychainCredentialProviderStatus;
    label: string;
    reason: string;
    reference: AvanzaMacosKeychainCredentialReference;
    valueReturnedToUi: false;
    valueLogged: false;
    valueStoredInSupabase: false;
    valueStoredInLocalStorage: false;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaMacosKeychainCredentialProviderSafetyFlags;
  };

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid\s*qr\s*data|broker\s*secret|cookie\s*[:=]|credential\s*[:=]|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret\s*[:=]|session\s*[:=]|storage\s*[:=]|token\s*[:=]/i;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text)) return undefined;

  return text;
}

function safeStringArray(values: unknown) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function credentialKind(value: unknown): AvanzaMacosKeychainCredentialKind {
  return value === "username" || value === "password" ? value : "username";
}

function customerType(value: unknown): AvanzaMacosKeychainCustomerType {
  return value === "private" || value === "company" ? value : "unknown";
}

function normalizeReference(
  source: Partial<AvanzaMacosKeychainCredentialReference> | undefined,
  index: number,
): AvanzaMacosKeychainCredentialReference {
  const kind = credentialKind(source?.kind);
  const type = customerType(source?.customerType);

  return {
    serviceName:
      safeText(source?.serviceName) ?? `sharp-avanza-${type}-login`,
    accountKey:
      safeText(source?.accountKey) ?? `avanza-${type}-${kind}-reference`,
    kind,
    customerType: type,
    createdAt: safeText(source?.createdAt) ?? defaultCreatedAt,
    label: safeText(source?.label) ?? `${type} ${kind} reference ${index + 1}`,
    safeDisplayName:
      safeText(source?.safeDisplayName) ?? `${type} ${kind} Keychain reference`,
    maskedAccountHint: safeText(source?.maskedAccountHint) ?? "configured",
  };
}

function normalizedReferences(
  references: AvanzaMacosKeychainCredentialProviderConfig["references"],
) {
  return Array.isArray(references)
    ? references.map((reference, index) => normalizeReference(reference, index))
    : [];
}

function hasReference(
  references: readonly AvanzaMacosKeychainCredentialReference[],
  kind: AvanzaMacosKeychainCredentialKind,
) {
  return references.some((reference) => reference.kind === kind);
}

function safetyFlags(
  config: AvanzaMacosKeychainCredentialProviderConfig,
  status: AvanzaMacosKeychainCredentialProviderStatus,
): AvanzaMacosKeychainCredentialProviderSafetyFlags {
  const providerEnabled =
    config.enabled === true &&
    config.mode !== "disabled" &&
    status !== "disabled" &&
    status !== "error";
  const localDevReady = providerEnabled && config.mode === "local_dev";

  return {
    providerEnabled,
    localDevOnly: true,
    canCheckAvailability:
      localDevReady && config.allowCheckAvailability === true,
    canCheckCredentialExists:
      localDevReady && config.allowCheckCredentialExists === true,
    canWriteCredentialReference:
      localDevReady && config.allowWriteCredentialReference === true,
    canReadCredentialMaterial:
      localDevReady && config.allowReadCredentialMaterial === true,
    canReturnCredentialMaterialToUi: false,
    canLogCredentialMaterial: false,
    canStoreCredentialMaterialInSupabase: false,
    canStoreCredentialMaterialInLocalStorage: false,
    canUseEnvironmentFallback: false,
    credentialValuesVisibleInReports: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    canSubmitLogin: false,
    canSubmitOrder: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function labelFor(status: AvanzaMacosKeychainCredentialProviderStatus) {
  switch (status) {
    case "disabled":
      return "macOS Keychain credential provider disabled";
    case "unavailable":
      return "macOS Keychain unavailable";
    case "ready":
      return "macOS Keychain credential provider ready";
    case "credential_reference_configured":
      return "Credential reference configured";
    case "credential_reference_missing":
      return "Credential reference missing";
    case "credential_check_passed":
      return "Credential reference check passed";
    case "credential_check_failed":
      return "Credential reference check failed";
    case "credential_read_blocked":
      return "Credential read blocked";
    case "credential_read_allowed_local_dev":
      return "Credential read allowed for local-dev dependency";
    case "error":
      return "macOS Keychain credential provider error";
    case "unknown":
      return "macOS Keychain credential provider unknown";
  }
}

function reasonFor(status: AvanzaMacosKeychainCredentialProviderStatus) {
  switch (status) {
    case "disabled":
      return "macOS Keychain credential provider is disabled.";
    case "unavailable":
      return "Injected Keychain availability dependency reported unavailable.";
    case "ready":
      return "macOS Keychain provider is modeled as ready through explicit input.";
    case "credential_reference_configured":
      return "Credential references are configured as safe metadata only.";
    case "credential_reference_missing":
      return "One or more required credential references are missing.";
    case "credential_check_passed":
      return "Injected Keychain dependency confirmed credential references exist.";
    case "credential_check_failed":
      return "Injected Keychain dependency could not confirm credential references.";
    case "credential_read_blocked":
      return "Credential material read is blocked by config or mode.";
    case "credential_read_allowed_local_dev":
      return "Credential material read was allowed only inside local-dev injected dependency flow; visible output remains hidden.";
    case "error":
      return "macOS Keychain credential provider received an error input.";
    case "unknown":
      return "Inputs are insufficient to model macOS Keychain provider state.";
  }
}

function baseStatus(
  config: AvanzaMacosKeychainCredentialProviderConfig,
  references: readonly AvanzaMacosKeychainCredentialReference[],
): AvanzaMacosKeychainCredentialProviderStatus {
  if (config.statusOverride) return config.statusOverride;
  if (config.forceError === true) return "error";
  if (config.mode === "disabled" || config.enabled !== true) return "disabled";
  if (config.forceUnavailable === true) return "unavailable";
  if (config.allowEnvironmentFallback === true) return "credential_read_blocked";
  if (
    config.allowReturnCredentialMaterialToUi === true ||
    config.allowLogCredentialMaterial === true ||
    config.allowStoreCredentialMaterialInSupabase === true ||
    config.allowStoreCredentialMaterialInLocalStorage === true
  ) {
    return "credential_read_blocked";
  }
  if (references.length === 0) return "credential_reference_missing";
  if (hasReference(references, "username") && hasReference(references, "password")) {
    return config.mode === "contract_only"
      ? "credential_reference_configured"
      : "ready";
  }

  return "credential_reference_configured";
}

function providerId(config: AvanzaMacosKeychainCredentialProviderConfig) {
  return safeText(config.providerId) ?? "avanza-macos-keychain-provider";
}

function createdAt(config: AvanzaMacosKeychainCredentialProviderConfig) {
  return safeText(config.now) ?? defaultCreatedAt;
}

function providerStateFrom(
  config: AvanzaMacosKeychainCredentialProviderConfig,
  status: AvanzaMacosKeychainCredentialProviderStatus,
  references: AvanzaMacosKeychainCredentialReference[],
  extraBlockedReasons: readonly string[] = [],
): AvanzaMacosKeychainCredentialProviderState {
  const flags = safetyFlags(config, status);

  return {
    providerId: providerId(config),
    createdAt: createdAt(config),
    provider: "macos_keychain",
    mode: config.mode ?? "disabled",
    status,
    label: labelFor(status),
    reason: reasonFor(status),
    references,
    valueReturnedToUi: false,
    valueLogged: false,
    valueStoredInSupabase: false,
    valueStoredInLocalStorage: false,
    warnings: safeStringArray(config.warnings),
    blockedReasons: [
      ...safeStringArray(config.blockedReasons),
      ...extraBlockedReasons.flatMap((reason) => {
        const text = safeText(reason);

        return text ? [text] : [];
      }),
    ],
    safetyFlags: flags,
    ...flags,
  };
}

export function buildAvanzaMacosKeychainCredentialProviderState(
  config: AvanzaMacosKeychainCredentialProviderConfig = {},
): AvanzaMacosKeychainCredentialProviderState {
  const references = normalizedReferences(config.references);
  const status = baseStatus(config, references);

  return providerStateFrom(config, status, references);
}

function readWriteSafetyResult(
  config: AvanzaMacosKeychainCredentialProviderConfig,
  reference: AvanzaMacosKeychainCredentialReference,
  status: AvanzaMacosKeychainCredentialProviderStatus,
  reason: string,
): AvanzaMacosKeychainCredentialReadResult {
  const state = providerStateFrom(config, status, [reference], [reason]);
  const flags = state.safetyFlags;

  return {
    providerId: state.providerId,
    createdAt: state.createdAt,
    status,
    label: labelFor(status),
    reason,
    reference,
    valueReference: toAvanzaLoginExecutorCredentialReference(reference),
    valueReturnedToUi: false,
    valueLogged: false,
    valueStoredInSupabase: false,
    valueStoredInLocalStorage: false,
    warnings: state.warnings,
    blockedReasons: state.blockedReasons,
    safetyFlags: flags,
    ...flags,
  };
}

export function toAvanzaLoginExecutorCredentialReference(
  reference: AvanzaMacosKeychainCredentialReference,
) {
  return reference.kind === "password"
    ? "password_from_secure_provider"
    : "username_from_secure_provider";
}

export async function readAvanzaMacosKeychainCredentialReference(
  config: AvanzaMacosKeychainCredentialProviderConfig,
  referenceInput: Partial<AvanzaMacosKeychainCredentialReference>,
  dependencies: AvanzaMacosKeychainCredentialProviderDependencies,
): Promise<AvanzaMacosKeychainCredentialReadResult> {
  const reference = normalizeReference(referenceInput, 0);
  const state = buildAvanzaMacosKeychainCredentialProviderState({
    ...config,
    references: [reference],
  });

  if (!state.canReadCredentialMaterial) {
    return readWriteSafetyResult(
      config,
      reference,
      "credential_read_blocked",
      "Credential read is blocked by mode or config.",
    );
  }

  const result = await dependencies.readCredential(reference);

  if (!result.ok) {
    return readWriteSafetyResult(
      config,
      reference,
      "credential_check_failed",
      result.reason ?? "Injected Keychain read dependency failed.",
    );
  }

  return {
    ...readWriteSafetyResult(
      config,
      reference,
      "credential_read_allowed_local_dev",
      "Credential material was read only inside the injected local-dev dependency boundary.",
    ),
    privateInternalValue: result.value,
  };
}

export async function writeAvanzaMacosKeychainCredentialReference(
  config: AvanzaMacosKeychainCredentialProviderConfig,
  referenceInput: Partial<AvanzaMacosKeychainCredentialReference>,
  value: string,
  dependencies: AvanzaMacosKeychainCredentialProviderDependencies,
): Promise<AvanzaMacosKeychainCredentialWriteResult> {
  const reference = normalizeReference(referenceInput, 0);
  const state = buildAvanzaMacosKeychainCredentialProviderState({
    ...config,
    references: [reference],
  });
  const flags = state.safetyFlags;

  if (!state.canWriteCredentialReference) {
    return {
      providerId: state.providerId,
      createdAt: state.createdAt,
      status: "credential_read_blocked",
      label: labelFor("credential_read_blocked"),
      reason: "Credential write is blocked by mode or config.",
      reference,
      valueReturnedToUi: false,
      valueLogged: false,
      valueStoredInSupabase: false,
      valueStoredInLocalStorage: false,
      warnings: state.warnings,
      blockedReasons: [...state.blockedReasons, "Credential write is blocked."],
      safetyFlags: flags,
      ...flags,
    };
  }

  const result = await dependencies.writeCredential(reference, value);
  const status = result.ok ? "credential_reference_configured" : "error";

  return {
    providerId: state.providerId,
    createdAt: state.createdAt,
    status,
    label: labelFor(status),
    reason:
      result.reason ??
      (result.ok
        ? "Injected Keychain write dependency reported ok."
        : "Injected Keychain write dependency failed."),
    reference,
    valueReturnedToUi: false,
    valueLogged: false,
    valueStoredInSupabase: false,
    valueStoredInLocalStorage: false,
    warnings: state.warnings,
    blockedReasons: result.ok ? state.blockedReasons : [...state.blockedReasons, "Credential write failed."],
    safetyFlags: flags,
    ...flags,
  };
}

export async function checkAvanzaMacosKeychainCredentialReferences(
  config: AvanzaMacosKeychainCredentialProviderConfig,
  dependencies: AvanzaMacosKeychainCredentialProviderDependencies,
): Promise<AvanzaMacosKeychainCredentialProviderState> {
  const references = normalizedReferences(config.references);
  const state = buildAvanzaMacosKeychainCredentialProviderState(config);

  if (!state.canCheckAvailability || !state.canCheckCredentialExists) {
    return providerStateFrom(config, "credential_check_failed", references, [
      "Credential check is blocked by mode or config.",
    ]);
  }

  const availability = await dependencies.isAvailable();

  if (!availability.ok) {
    return providerStateFrom(config, "unavailable", references, [
      availability.reason ?? "Injected Keychain availability dependency failed.",
    ]);
  }

  for (const reference of references) {
    const result = await dependencies.hasCredential(reference);

    if (!result.ok || !result.exists) {
      return providerStateFrom(config, "credential_check_failed", references, [
        result.reason ?? "Injected Keychain credential check failed.",
      ]);
    }
  }

  return providerStateFrom(config, "credential_check_passed", references);
}

export const avanzaMacosKeychainCredentialProviderDefaultConfig:
  AvanzaMacosKeychainCredentialProviderConfig = {
    providerId: "avanza-macos-keychain-provider",
    mode: "disabled",
    enabled: false,
    localDevOnly: true,
    provider: "macos_keychain",
    allowCheckAvailability: false,
    allowCheckCredentialExists: false,
    allowWriteCredentialReference: false,
    allowReadCredentialMaterial: false,
    allowReturnCredentialMaterialToUi: false,
    allowLogCredentialMaterial: false,
    allowStoreCredentialMaterialInSupabase: false,
    allowStoreCredentialMaterialInLocalStorage: false,
    allowEnvironmentFallback: false,
    now: defaultCreatedAt,
  };
