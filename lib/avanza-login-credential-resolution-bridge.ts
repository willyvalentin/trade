export type AvanzaLoginCredentialResolutionStatus =
  | "disabled"
  | "ready"
  | "resolved_references"
  | "missing_username_reference"
  | "missing_password_reference"
  | "credential_read_blocked"
  | "credential_read_failed"
  | "unsafe_output_blocked"
  | "error"
  | "unknown";

export type AvanzaLoginCredentialReferenceKind =
  | "username_from_secure_provider"
  | "password_from_secure_provider";

export type AvanzaLoginCredentialResolutionMode =
  | "disabled"
  | "contract_only"
  | "local_dev";

export type AvanzaLoginCredentialResolutionConfig = {
  bridgeId?: string;
  mode?: AvanzaLoginCredentialResolutionMode;
  enabled?: boolean;
  localDevOnly?: true;
  hasUsernameReference?: boolean;
  hasPasswordReference?: boolean;
  usernameResolved?: boolean;
  passwordResolved?: boolean;
  allowResolveUsername?: boolean;
  allowResolvePassword?: boolean;
  allowReturnRuntimeBundle?: boolean;
  allowReturnCredentialMaterialToUi?: boolean;
  allowLogCredentialMaterial?: boolean;
  allowStoreCredentialMaterialInSupabase?: boolean;
  allowStoreCredentialMaterialInLocalStorage?: boolean;
  allowEnvironmentFallback?: boolean;
  forceError?: boolean;
  statusOverride?: AvanzaLoginCredentialResolutionStatus;
  now?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaLoginCredentialResolutionDependencies = {
  readUsernameReference: () => Promise<{
    ok: boolean;
    value?: string;
    reason?: string;
  }>;
  readPasswordReference: () => Promise<{
    ok: boolean;
    value?: string;
    reason?: string;
  }>;
};

export type AvanzaLoginCredentialResolutionSafetyFlags = {
  bridgeEnabled: boolean;
  localDevOnly: true;
  canResolveUsername: boolean;
  canResolvePassword: boolean;
  canReturnRuntimeBundle: boolean;
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

export type AvanzaLoginResolvedCredentialRuntimeBundle = {
  bundleId: string;
  createdAt: string;
  usernameValue: string;
  passwordValue: string;
  valueReturnedToUi: false;
  valueLogged: false;
  valueStoredInSupabase: false;
  valueStoredInLocalStorage: false;
};

export type AvanzaLoginCredentialResolutionSafeReport =
  AvanzaLoginCredentialResolutionSafetyFlags & {
    reportId: string;
    createdAt: string;
    status: AvanzaLoginCredentialResolutionStatus;
    label: string;
    reason: string;
    usernameResolved: boolean;
    passwordResolved: boolean;
    credentialMaterialPresent: boolean;
    credentialMaterialReturnedToUi: false;
    credentialMaterialLogged: false;
    credentialMaterialStoredInSupabase: false;
    credentialMaterialStoredInLocalStorage: false;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaLoginCredentialResolutionSafetyFlags;
  };

export type AvanzaLoginCredentialResolutionResult =
  AvanzaLoginCredentialResolutionSafetyFlags & {
    bridgeId: string;
    createdAt: string;
    mode: AvanzaLoginCredentialResolutionMode;
    status: AvanzaLoginCredentialResolutionStatus;
    label: string;
    reason: string;
    usernameResolved: boolean;
    passwordResolved: boolean;
    credentialMaterialPresent: boolean;
    runtimeBundle?: AvanzaLoginResolvedCredentialRuntimeBundle;
    safeReport: AvanzaLoginCredentialResolutionSafeReport;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaLoginCredentialResolutionSafetyFlags;
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

function bridgeId(config: AvanzaLoginCredentialResolutionConfig) {
  return safeText(config.bridgeId) ?? "avanza-login-credential-resolution-bridge";
}

function createdAt(config: AvanzaLoginCredentialResolutionConfig) {
  return safeText(config.now) ?? defaultCreatedAt;
}

function modeFor(
  config: AvanzaLoginCredentialResolutionConfig,
): AvanzaLoginCredentialResolutionMode {
  return config.mode === "contract_only" || config.mode === "local_dev"
    ? config.mode
    : "disabled";
}

function hasUnsafeOutputConfig(config: AvanzaLoginCredentialResolutionConfig) {
  return (
    config.allowReturnCredentialMaterialToUi === true ||
    config.allowLogCredentialMaterial === true ||
    config.allowStoreCredentialMaterialInSupabase === true ||
    config.allowStoreCredentialMaterialInLocalStorage === true ||
    config.allowEnvironmentFallback === true
  );
}

function labelFor(status: AvanzaLoginCredentialResolutionStatus) {
  switch (status) {
    case "disabled":
      return "Credential resolution bridge disabled";
    case "ready":
      return "Credential resolution bridge ready";
    case "resolved_references":
      return "Credential references resolved";
    case "missing_username_reference":
      return "Missing username reference";
    case "missing_password_reference":
      return "Missing password reference";
    case "credential_read_blocked":
      return "Credential read blocked";
    case "credential_read_failed":
      return "Credential read failed";
    case "unsafe_output_blocked":
      return "Unsafe credential output blocked";
    case "error":
      return "Credential resolution bridge error";
    case "unknown":
      return "Credential resolution bridge unknown";
  }
}

function reasonFor(status: AvanzaLoginCredentialResolutionStatus) {
  switch (status) {
    case "disabled":
      return "Credential resolution bridge is disabled.";
    case "ready":
      return "Credential references are modeled and ready for explicit local-dev dependency resolution.";
    case "resolved_references":
      return "Credential references were resolved inside the local-dev runtime boundary; safe output contains flags only.";
    case "missing_username_reference":
      return "Username reference is missing.";
    case "missing_password_reference":
      return "Password reference is missing.";
    case "credential_read_blocked":
      return "Credential read is blocked by mode or config.";
    case "credential_read_failed":
      return "Injected credential dependency could not resolve one or more references.";
    case "unsafe_output_blocked":
      return "Unsafe credential output or persistence config was blocked.";
    case "error":
      return "Credential resolution bridge received an error input.";
    case "unknown":
      return "Credential resolution bridge input is unknown.";
  }
}

function safetyFlags(
  config: AvanzaLoginCredentialResolutionConfig,
  status: AvanzaLoginCredentialResolutionStatus,
): AvanzaLoginCredentialResolutionSafetyFlags {
  const mode = modeFor(config);
  const bridgeEnabled =
    config.enabled === true &&
    mode !== "disabled" &&
    status !== "disabled" &&
    status !== "error" &&
    status !== "unsafe_output_blocked";
  const localDevReady = bridgeEnabled && mode === "local_dev";
  const canResolveUsername =
    localDevReady &&
    config.allowResolveUsername === true &&
    config.hasUsernameReference === true;
  const canResolvePassword =
    localDevReady &&
    config.allowResolvePassword === true &&
    config.hasPasswordReference === true;

  return {
    bridgeEnabled,
    localDevOnly: true,
    canResolveUsername,
    canResolvePassword,
    canReturnRuntimeBundle:
      canResolveUsername &&
      canResolvePassword &&
      config.allowReturnRuntimeBundle === true,
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

function statusFor(
  config: AvanzaLoginCredentialResolutionConfig,
): AvanzaLoginCredentialResolutionStatus {
  if (config.statusOverride) return config.statusOverride;
  if (config.forceError === true) return "error";
  if (config.enabled !== true || modeFor(config) === "disabled") return "disabled";
  if (hasUnsafeOutputConfig(config)) return "unsafe_output_blocked";
  if (config.hasUsernameReference !== true) return "missing_username_reference";
  if (config.hasPasswordReference !== true) return "missing_password_reference";
  if (modeFor(config) === "contract_only") return "ready";
  if (
    config.usernameResolved === true &&
    config.passwordResolved === true
  ) {
    return "resolved_references";
  }

  return "ready";
}

function baseBlockedReasons(
  config: AvanzaLoginCredentialResolutionConfig,
  status: AvanzaLoginCredentialResolutionStatus,
) {
  const blockedReasons = [...safeStringArray(config.blockedReasons)];

  if (status === "missing_username_reference") {
    blockedReasons.push("Username reference is missing.");
  }

  if (status === "missing_password_reference") {
    blockedReasons.push("Password reference is missing.");
  }

  if (status === "credential_read_blocked") {
    blockedReasons.push("Credential read is blocked.");
  }

  if (status === "credential_read_failed") {
    blockedReasons.push("Credential read failed.");
  }

  if (status === "unsafe_output_blocked") {
    blockedReasons.push("Unsafe credential output or persistence is blocked.");
  }

  return blockedReasons;
}

function reportFrom(
  config: AvanzaLoginCredentialResolutionConfig,
  status: AvanzaLoginCredentialResolutionStatus,
  usernameResolved: boolean,
  passwordResolved: boolean,
  reason?: string,
): AvanzaLoginCredentialResolutionSafeReport {
  const flags = safetyFlags(config, status);

  return {
    reportId: `${bridgeId(config)}-safe-report`,
    createdAt: createdAt(config),
    status,
    label: labelFor(status),
    reason: reason ?? reasonFor(status),
    usernameResolved,
    passwordResolved,
    credentialMaterialPresent: usernameResolved || passwordResolved,
    credentialMaterialReturnedToUi: false,
    credentialMaterialLogged: false,
    credentialMaterialStoredInSupabase: false,
    credentialMaterialStoredInLocalStorage: false,
    warnings: safeStringArray(config.warnings),
    blockedReasons: baseBlockedReasons(config, status),
    safetyFlags: flags,
    ...flags,
  };
}

function resultFrom(
  config: AvanzaLoginCredentialResolutionConfig,
  status: AvanzaLoginCredentialResolutionStatus,
  usernameResolved: boolean,
  passwordResolved: boolean,
  runtimeBundle?: AvanzaLoginResolvedCredentialRuntimeBundle,
  reason?: string,
): AvanzaLoginCredentialResolutionResult {
  const safeReport = reportFrom(
    config,
    status,
    usernameResolved,
    passwordResolved,
    reason,
  );

  return {
    bridgeId: bridgeId(config),
    createdAt: createdAt(config),
    mode: modeFor(config),
    status,
    label: safeReport.label,
    reason: safeReport.reason,
    usernameResolved,
    passwordResolved,
    credentialMaterialPresent: usernameResolved || passwordResolved,
    runtimeBundle,
    safeReport,
    warnings: safeReport.warnings,
    blockedReasons: safeReport.blockedReasons,
    safetyFlags: safeReport.safetyFlags,
    ...safeReport.safetyFlags,
  };
}

export function buildAvanzaLoginCredentialResolutionState(
  config: AvanzaLoginCredentialResolutionConfig = {},
): AvanzaLoginCredentialResolutionResult {
  const status = statusFor(config);

  return resultFrom(
    config,
    status,
    config.usernameResolved === true,
    config.passwordResolved === true,
  );
}

export function toAvanzaLoginCredentialSafeReport(
  result: AvanzaLoginCredentialResolutionResult,
): AvanzaLoginCredentialResolutionSafeReport {
  return result.safeReport;
}

export async function resolveAvanzaLoginCredentialReferences(
  config: AvanzaLoginCredentialResolutionConfig,
  dependencies: AvanzaLoginCredentialResolutionDependencies,
): Promise<AvanzaLoginCredentialResolutionResult> {
  const initial = buildAvanzaLoginCredentialResolutionState(config);

  if (initial.status === "disabled" || initial.status === "error") {
    return initial;
  }

  if (initial.status === "unsafe_output_blocked") {
    return initial;
  }

  if (
    initial.status === "missing_username_reference" ||
    initial.status === "missing_password_reference"
  ) {
    return initial;
  }

  if (modeFor(config) !== "local_dev") {
    return resultFrom(config, "credential_read_blocked", false, false);
  }

  if (
    config.allowResolveUsername !== true ||
    config.allowResolvePassword !== true
  ) {
    return resultFrom(config, "credential_read_blocked", false, false);
  }

  const username = await dependencies.readUsernameReference();

  if (!username.ok || typeof username.value !== "string" || !username.value) {
    return resultFrom(
      config,
      "credential_read_failed",
      false,
      false,
      undefined,
      username.reason ?? "Injected username credential dependency failed.",
    );
  }

  const password = await dependencies.readPasswordReference();

  if (!password.ok || typeof password.value !== "string" || !password.value) {
    return resultFrom(
      config,
      "credential_read_failed",
      true,
      false,
      undefined,
      password.reason ?? "Injected password credential dependency failed.",
    );
  }

  const runtimeBundle =
    config.allowReturnRuntimeBundle === true
      ? {
          bundleId: `${bridgeId(config)}-runtime-bundle`,
          createdAt: createdAt(config),
          usernameValue: username.value,
          passwordValue: password.value,
          valueReturnedToUi: false as const,
          valueLogged: false as const,
          valueStoredInSupabase: false as const,
          valueStoredInLocalStorage: false as const,
        }
      : undefined;

  return resultFrom(
    config,
    "resolved_references",
    true,
    true,
    runtimeBundle,
  );
}

export const avanzaLoginCredentialResolutionBridgeDefaultConfig:
  AvanzaLoginCredentialResolutionConfig = {
    bridgeId: "avanza-login-credential-resolution-bridge",
    enabled: false,
    localDevOnly: true,
    mode: "disabled",
    hasUsernameReference: false,
    hasPasswordReference: false,
    allowResolveUsername: false,
    allowResolvePassword: false,
    allowReturnRuntimeBundle: false,
    allowReturnCredentialMaterialToUi: false,
    allowLogCredentialMaterial: false,
    allowStoreCredentialMaterialInSupabase: false,
    allowStoreCredentialMaterialInLocalStorage: false,
    allowEnvironmentFallback: false,
    now: defaultCreatedAt,
  };
