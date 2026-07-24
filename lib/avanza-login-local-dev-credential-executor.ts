import type {
  AvanzaLoginAction,
  AvanzaLoginActionContract,
  AvanzaLoginActionType,
} from "./avanza-login-action-contract";
import type {
  AvanzaLoginResolvedCredentialRuntimeBundle,
} from "./avanza-login-credential-resolution-bridge";

export type AvanzaLoginLocalDevCredentialExecutorStatus =
  | "disabled"
  | "ready"
  | "executed"
  | "blocked"
  | "missing_credential_bundle"
  | "unsafe_credential_output_blocked"
  | "bankid_or_mfa_stop"
  | "page_action_failed"
  | "error"
  | "unknown";

export type AvanzaLoginLocalDevCredentialActionStatus =
  | "pending"
  | "executed"
  | "skipped"
  | "blocked"
  | "blocked_missing_credential_bundle"
  | "blocked_bankid_or_mfa"
  | "failed";

export type AvanzaLoginLocalDevCredentialExecutorMode =
  | "disabled"
  | "local_dev_mock_injected"
  | "local_dev_real_injected";

export type AvanzaLoginLocalDevCredentialExecutorConfig = {
  executorId?: string;
  mode?: AvanzaLoginLocalDevCredentialExecutorMode;
  enabled?: boolean;
  localDevOnly?: true;
  allowUseRuntimeCredentialBundle?: boolean;
  allowClickUsernamePasswordMethod?: boolean;
  allowClickCustomerToggle?: boolean;
  allowFillUsername?: boolean;
  allowFillPassword?: boolean;
  allowClickLoginSubmit?: boolean;
  allowReturnCredentialMaterialToUi?: false | boolean;
  allowLogCredentialMaterial?: false | boolean;
  allowStoreCredentialMaterialInSupabase?: false | boolean;
  allowStoreCredentialMaterialInLocalStorage?: false | boolean;
  allowBankIdAutomation?: false | boolean;
  allowCookieRead?: false | boolean;
  allowSessionExport?: false | boolean;
  allowOrderSubmit?: false | boolean;
  dryRun?: boolean;
  forceError?: boolean;
  statusOverride?: AvanzaLoginLocalDevCredentialExecutorStatus;
  usernameUsed?: boolean;
  passwordUsed?: boolean;
  now?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaLoginLocalDevCredentialExecutorDependencies = {
  clickByText: (text: string) => Promise<{ ok: boolean; reason?: string }>;
  fillByLabel: (
    label: string,
    value: string,
  ) => Promise<{ ok: boolean; reason?: string }>;
  waitForState?: (stateHint: string) => Promise<{ ok: boolean; reason?: string }>;
  readPageSnapshot?: () => Promise<unknown>;
};

export type AvanzaLoginLocalDevCredentialExecutorSafetyFlags = {
  executorEnabled: boolean;
  localDevOnly: true;
  canUseRuntimeCredentialBundle: boolean;
  canExecuteLocalDevActions: boolean;
  canClickUsernamePasswordMethod: boolean;
  canClickCustomerToggle: boolean;
  canFillUsername: boolean;
  canFillPassword: boolean;
  canClickLoginSubmit: boolean;
  canReturnCredentialMaterialToUi: false;
  canLogCredentialMaterial: false;
  canStoreCredentialMaterialInSupabase: false;
  canStoreCredentialMaterialInLocalStorage: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  canReadCookies: false;
  canExportSession: false;
  canSubmitOrder: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaLoginLocalDevCredentialActionReport = {
  actionId: string;
  actionType: string;
  label: string;
  actionStatus: AvanzaLoginLocalDevCredentialActionStatus;
  targetText: string;
  targetLabel: string;
  valueSource:
    | "none"
    | "username_from_secure_provider"
    | "password_from_secure_provider"
    | "static_safe_signal";
  usernameUsed: boolean;
  passwordUsed: boolean;
  credentialMaterialReturnedToUi: false;
  credentialMaterialLogged: false;
  credentialMaterialStoredInSupabase: false;
  credentialMaterialStoredInLocalStorage: false;
  containsCredentialMaterial: false;
  dependencyInvoked: boolean;
  expectedResult: string;
  actualResult: string;
  blockedReason: string;
};

export type AvanzaLoginLocalDevCredentialExecutorReport =
  AvanzaLoginLocalDevCredentialExecutorSafetyFlags & {
    reportId: string;
    createdAt: string;
    mode: AvanzaLoginLocalDevCredentialExecutorMode;
    status: AvanzaLoginLocalDevCredentialExecutorStatus;
    label: string;
    reason: string;
    usernameUsed: boolean;
    passwordUsed: boolean;
    credentialMaterialReturnedToUi: false;
    credentialMaterialLogged: false;
    credentialMaterialStoredInSupabase: false;
    credentialMaterialStoredInLocalStorage: false;
    actionReports: AvanzaLoginLocalDevCredentialActionReport[];
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaLoginLocalDevCredentialExecutorSafetyFlags;
  };

export type AvanzaLoginLocalDevCredentialExecutorInput = {
  config?: AvanzaLoginLocalDevCredentialExecutorConfig;
  loginActionContract?: AvanzaLoginActionContract;
  credentialRuntimeBundle?: AvanzaLoginResolvedCredentialRuntimeBundle;
  now?: string;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid\s*qr\s*data|broker\s*secret|cookie\s*[:=]|credential\s*[:=]|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret\s*[:=]|session\s*[:=]|storage\s*[:=]|token\s*[:=]/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

function normalizedMode(
  mode: AvanzaLoginLocalDevCredentialExecutorConfig["mode"],
): AvanzaLoginLocalDevCredentialExecutorMode {
  if (mode === "local_dev_mock_injected" || mode === "local_dev_real_injected") {
    return mode;
  }

  return "disabled";
}

function normalizedConfig(
  input: AvanzaLoginLocalDevCredentialExecutorInput,
): Required<
  Pick<
    AvanzaLoginLocalDevCredentialExecutorConfig,
    | "enabled"
    | "localDevOnly"
    | "allowUseRuntimeCredentialBundle"
    | "allowClickUsernamePasswordMethod"
    | "allowClickCustomerToggle"
    | "allowFillUsername"
    | "allowFillPassword"
    | "allowClickLoginSubmit"
    | "allowReturnCredentialMaterialToUi"
    | "allowLogCredentialMaterial"
    | "allowStoreCredentialMaterialInSupabase"
    | "allowStoreCredentialMaterialInLocalStorage"
    | "allowBankIdAutomation"
    | "allowCookieRead"
    | "allowSessionExport"
    | "allowOrderSubmit"
  >
> & {
  executorId: string;
  mode: AvanzaLoginLocalDevCredentialExecutorMode;
  dryRun: boolean;
  forceError: boolean;
  statusOverride?: AvanzaLoginLocalDevCredentialExecutorStatus;
  usernameUsed: boolean;
  passwordUsed: boolean;
  now: string;
  warnings: readonly string[];
  blockedReasons: readonly string[];
} {
  const config = input.config ?? {};

  return {
    executorId:
      safeText(config.executorId) ??
      "avanza-login-local-dev-credential-executor",
    mode: normalizedMode(config.mode),
    enabled: config.enabled === true,
    localDevOnly: true,
    allowUseRuntimeCredentialBundle:
      config.allowUseRuntimeCredentialBundle === true,
    allowClickUsernamePasswordMethod:
      config.allowClickUsernamePasswordMethod === true,
    allowClickCustomerToggle: config.allowClickCustomerToggle === true,
    allowFillUsername: config.allowFillUsername === true,
    allowFillPassword: config.allowFillPassword === true,
    allowClickLoginSubmit: config.allowClickLoginSubmit === true,
    allowReturnCredentialMaterialToUi:
      config.allowReturnCredentialMaterialToUi === true,
    allowLogCredentialMaterial: config.allowLogCredentialMaterial === true,
    allowStoreCredentialMaterialInSupabase:
      config.allowStoreCredentialMaterialInSupabase === true,
    allowStoreCredentialMaterialInLocalStorage:
      config.allowStoreCredentialMaterialInLocalStorage === true,
    allowBankIdAutomation: config.allowBankIdAutomation === true,
    allowCookieRead: config.allowCookieRead === true,
    allowSessionExport: config.allowSessionExport === true,
    allowOrderSubmit: config.allowOrderSubmit === true,
    dryRun: config.dryRun === true,
    forceError: config.forceError === true,
    statusOverride: config.statusOverride,
    usernameUsed: config.usernameUsed === true,
    passwordUsed: config.passwordUsed === true,
    now: safeText(config.now) ?? safeText(input.now) ?? defaultCreatedAt,
    warnings: config.warnings ?? [],
    blockedReasons: config.blockedReasons ?? [],
  };
}

function hasUnsafeOutputConfig(
  config: ReturnType<typeof normalizedConfig>,
) {
  return (
    config.allowReturnCredentialMaterialToUi ||
    config.allowLogCredentialMaterial ||
    config.allowStoreCredentialMaterialInSupabase ||
    config.allowStoreCredentialMaterialInLocalStorage ||
    config.allowBankIdAutomation ||
    config.allowCookieRead ||
    config.allowSessionExport ||
    config.allowOrderSubmit
  );
}

function actionsFromContract(contract: unknown): AvanzaLoginAction[] {
  return isRecord(contract) && Array.isArray(contract.actions)
    ? (contract.actions as AvanzaLoginAction[])
    : [];
}

function contractStatus(contract: unknown) {
  return isRecord(contract) && typeof contract.status === "string"
    ? contract.status
    : "unknown";
}

function hasCredentialBundle(input: AvanzaLoginLocalDevCredentialExecutorInput) {
  const bundle = input.credentialRuntimeBundle;

  return (
    isRecord(bundle) &&
    typeof bundle.usernameValue === "string" &&
    bundle.usernameValue.length > 0 &&
    typeof bundle.passwordValue === "string" &&
    bundle.passwordValue.length > 0
  );
}

function hasBankIdStop(actions: readonly AvanzaLoginAction[]) {
  return actions.some(
    (action) =>
      action.type === "stop_for_bankid_or_mfa" || action.requiresHumanAction,
  );
}

function actionNeedsCredentials(action: AvanzaLoginAction) {
  return action.type === "fill_username" || action.type === "fill_password";
}

function labelFor(status: AvanzaLoginLocalDevCredentialExecutorStatus) {
  switch (status) {
    case "disabled":
      return "Local-dev credential executor disabled";
    case "ready":
      return "Local-dev credential executor ready";
    case "executed":
      return "Local-dev credential executor executed";
    case "blocked":
      return "Local-dev credential executor blocked";
    case "missing_credential_bundle":
      return "Missing credential runtime bundle";
    case "unsafe_credential_output_blocked":
      return "Unsafe credential output blocked";
    case "bankid_or_mfa_stop":
      return "BankID or MFA stop";
    case "page_action_failed":
      return "Injected page action failed";
    case "error":
      return "Local-dev credential executor error";
    case "unknown":
      return "Local-dev credential executor unknown";
  }
}

function reasonFor(status: AvanzaLoginLocalDevCredentialExecutorStatus) {
  switch (status) {
    case "disabled":
      return "Local-dev credential executor is disabled.";
    case "ready":
      return "Explicit local-dev injected dependencies may execute the login action plan while keeping credential values inside function scope.";
    case "executed":
      return "Injected page dependencies completed the local-dev login action plan; safe report contains no credential values.";
    case "blocked":
      return "Local-dev credential executor is blocked by contract status or config.";
    case "missing_credential_bundle":
      return "Runtime credential bundle is required but missing.";
    case "unsafe_credential_output_blocked":
      return "Unsafe credential output, persistence, cookie/session, BankID, or order config was blocked.";
    case "bankid_or_mfa_stop":
      return "BankID or MFA requires manual user action; no page action was executed.";
    case "page_action_failed":
      return "An injected page dependency returned a failed result.";
    case "error":
      return "Local-dev credential executor received an error input.";
    case "unknown":
      return "Inputs are insufficient for local-dev credential execution.";
  }
}

function safetyFlags(
  config: ReturnType<typeof normalizedConfig>,
  status: AvanzaLoginLocalDevCredentialExecutorStatus,
): AvanzaLoginLocalDevCredentialExecutorSafetyFlags {
  const executorEnabled =
    config.enabled &&
    config.mode !== "disabled" &&
    status !== "disabled" &&
    status !== "error" &&
    status !== "unsafe_credential_output_blocked";
  const canExecute =
    executorEnabled &&
    !config.dryRun &&
    (status === "ready" || status === "executed");

  return {
    executorEnabled,
    localDevOnly: true,
    canUseRuntimeCredentialBundle:
      executorEnabled && config.allowUseRuntimeCredentialBundle,
    canExecuteLocalDevActions: canExecute,
    canClickUsernamePasswordMethod:
      canExecute && config.allowClickUsernamePasswordMethod,
    canClickCustomerToggle: canExecute && config.allowClickCustomerToggle,
    canFillUsername: canExecute && config.allowFillUsername,
    canFillPassword: canExecute && config.allowFillPassword,
    canClickLoginSubmit: canExecute && config.allowClickLoginSubmit,
    canReturnCredentialMaterialToUi: false,
    canLogCredentialMaterial: false,
    canStoreCredentialMaterialInSupabase: false,
    canStoreCredentialMaterialInLocalStorage: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    canReadCookies: false,
    canExportSession: false,
    canSubmitOrder: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function statusFor(
  input: AvanzaLoginLocalDevCredentialExecutorInput,
  config: ReturnType<typeof normalizedConfig>,
) {
  if (config.statusOverride) return config.statusOverride;
  if (config.forceError) return "error";
  if (!config.enabled || config.mode === "disabled") return "disabled";
  if (hasUnsafeOutputConfig(config)) return "unsafe_credential_output_blocked";

  const status = contractStatus(input.loginActionContract);
  const actions = actionsFromContract(input.loginActionContract);

  if (status === "error") return "error";
  if (status === "blocked") return "blocked";
  if (status === "unknown") return "unknown";
  if (hasBankIdStop(actions)) return "bankid_or_mfa_stop";
  if (status !== "action_plan_ready") return "blocked";
  if (
    config.allowUseRuntimeCredentialBundle &&
    actions.some(actionNeedsCredentials) &&
    !hasCredentialBundle(input)
  ) {
    return "missing_credential_bundle";
  }

  return "ready";
}

function blockedReasonsFor(
  config: ReturnType<typeof normalizedConfig>,
  status: AvanzaLoginLocalDevCredentialExecutorStatus,
) {
  const reasons = [...safeStringArray(config.blockedReasons)];

  if (status === "missing_credential_bundle") {
    reasons.push("Runtime credential bundle is missing.");
  }

  if (status === "unsafe_credential_output_blocked") {
    reasons.push("Unsafe credential output or persistence is blocked.");
  }

  if (status === "bankid_or_mfa_stop") {
    reasons.push("BankID or MFA is manual-action only.");
  }

  if (status === "page_action_failed") {
    reasons.push("Injected page action dependency failed.");
  }

  if (status === "blocked") {
    reasons.push("Action contract or config is blocked.");
  }

  return reasons;
}

function targetTextFor(action: AvanzaLoginAction) {
  return safeText(action.targetSignalText) ?? "none";
}

function targetLabelFor(type: AvanzaLoginActionType) {
  if (type === "fill_username") return "Användarnamn";
  if (type === "fill_password") return "Lösenord";

  return "none";
}

function actionReport(
  action: AvanzaLoginAction,
  actionStatus: AvanzaLoginLocalDevCredentialActionStatus,
  options: {
    dependencyInvoked?: boolean;
    actualResult?: string;
    blockedReason?: string;
    usernameUsed?: boolean;
    passwordUsed?: boolean;
  } = {},
): AvanzaLoginLocalDevCredentialActionReport {
  return {
    actionId: safeText(action.actionId) ?? action.type,
    actionType: action.type,
    label: safeText(action.label) ?? action.type,
    actionStatus,
    targetText: targetTextFor(action),
    targetLabel: targetLabelFor(action.type),
    valueSource: action.valueSource,
    usernameUsed: options.usernameUsed === true,
    passwordUsed: options.passwordUsed === true,
    credentialMaterialReturnedToUi: false,
    credentialMaterialLogged: false,
    credentialMaterialStoredInSupabase: false,
    credentialMaterialStoredInLocalStorage: false,
    containsCredentialMaterial: false,
    dependencyInvoked: options.dependencyInvoked === true,
    expectedResult: safeText(action.expectedResult) ?? "none",
    actualResult: safeText(options.actualResult) ?? "not run",
    blockedReason: safeText(options.blockedReason) ?? "none",
  };
}

function actionReportsForState(
  input: AvanzaLoginLocalDevCredentialExecutorInput,
  status: AvanzaLoginLocalDevCredentialExecutorStatus,
): AvanzaLoginLocalDevCredentialActionReport[] {
  const actions = actionsFromContract(input.loginActionContract);

  if (actions.length === 0) return [];

  if (status === "bankid_or_mfa_stop") {
    return actions.map((action) =>
      actionReport(action, "blocked_bankid_or_mfa", {
        blockedReason: "BankID or MFA is manual-action only.",
      }),
    );
  }

  if (status === "missing_credential_bundle") {
    return actions.map((action) =>
      actionReport(
        action,
        actionNeedsCredentials(action) ? "blocked_missing_credential_bundle" : "blocked",
        { blockedReason: "Runtime credential bundle is missing." },
      ),
    );
  }

  if (status !== "ready" && status !== "executed") {
    return actions.map((action) =>
      actionReport(action, "blocked", {
        blockedReason: reasonFor(status),
      }),
    );
  }

  return actions.map((action) =>
    actionReport(action, status === "executed" ? "executed" : "pending", {
      usernameUsed: action.type === "fill_username" && status === "executed",
      passwordUsed: action.type === "fill_password" && status === "executed",
      actualResult:
        status === "executed"
          ? "Injected dependency completed without returning credential values."
          : "pending",
    }),
  );
}

function reportFrom(
  input: AvanzaLoginLocalDevCredentialExecutorInput,
  status: AvanzaLoginLocalDevCredentialExecutorStatus,
  actionReports: AvanzaLoginLocalDevCredentialActionReport[] =
    actionReportsForState(input, status),
  reason?: string,
): AvanzaLoginLocalDevCredentialExecutorReport {
  const config = normalizedConfig(input);
  const flags = safetyFlags(config, status);
  const usernameUsed =
    config.usernameUsed ||
    actionReports.some((report) => report.usernameUsed === true);
  const passwordUsed =
    config.passwordUsed ||
    actionReports.some((report) => report.passwordUsed === true);

  return {
    reportId: `${config.executorId}-safe-report`,
    createdAt: config.now,
    mode: config.mode,
    status,
    label: labelFor(status),
    reason: reason ?? reasonFor(status),
    usernameUsed,
    passwordUsed,
    credentialMaterialReturnedToUi: false,
    credentialMaterialLogged: false,
    credentialMaterialStoredInSupabase: false,
    credentialMaterialStoredInLocalStorage: false,
    actionReports,
    warnings: safeStringArray(config.warnings),
    blockedReasons: blockedReasonsFor(config, status),
    safetyFlags: flags,
    ...flags,
  };
}

function actionAllowed(
  action: AvanzaLoginAction,
  config: ReturnType<typeof normalizedConfig>,
) {
  if (action.type === "click_username_password_method") {
    return config.allowClickUsernamePasswordMethod;
  }

  if (action.type === "click_company_toggle") {
    return config.allowClickCustomerToggle;
  }

  if (action.type === "fill_username") return config.allowFillUsername;
  if (action.type === "fill_password") return config.allowFillPassword;
  if (action.type === "click_login_submit") return config.allowClickLoginSubmit;

  return action.type === "no_op";
}

async function runAction(
  action: AvanzaLoginAction,
  input: AvanzaLoginLocalDevCredentialExecutorInput,
  dependencies: AvanzaLoginLocalDevCredentialExecutorDependencies,
): Promise<AvanzaLoginLocalDevCredentialActionReport> {
  const bundle = input.credentialRuntimeBundle;

  if (action.type === "click_username_password_method") {
    const result = await dependencies.clickByText("Användarnamn och lösenord");

    return actionReport(action, result.ok ? "executed" : "failed", {
      dependencyInvoked: true,
      actualResult: result.ok
        ? "Injected click completed."
        : result.reason ?? "Injected click failed.",
    });
  }

  if (action.type === "click_company_toggle") {
    const result = await dependencies.clickByText("Företag");

    return actionReport(action, result.ok ? "executed" : "failed", {
      dependencyInvoked: true,
      actualResult: result.ok
        ? "Injected click completed."
        : result.reason ?? "Injected click failed.",
    });
  }

  if (action.type === "fill_username") {
    const result = await dependencies.fillByLabel(
      "Användarnamn",
      bundle?.usernameValue ?? "",
    );

    return actionReport(action, result.ok ? "executed" : "failed", {
      dependencyInvoked: true,
      usernameUsed: result.ok,
      actualResult: result.ok
        ? "Injected username fill completed; value hidden."
        : result.reason ?? "Injected username fill failed.",
    });
  }

  if (action.type === "fill_password") {
    const result = await dependencies.fillByLabel(
      "Lösenord",
      bundle?.passwordValue ?? "",
    );

    return actionReport(action, result.ok ? "executed" : "failed", {
      dependencyInvoked: true,
      passwordUsed: result.ok,
      actualResult: result.ok
        ? "Injected password fill completed; value hidden."
        : result.reason ?? "Injected password fill failed.",
    });
  }

  if (action.type === "click_login_submit") {
    const result = await dependencies.clickByText("Logga in");

    return actionReport(action, result.ok ? "executed" : "failed", {
      dependencyInvoked: true,
      actualResult: result.ok
        ? "Injected login submit completed."
        : result.reason ?? "Injected login submit failed.",
    });
  }

  return actionReport(action, "skipped", {
    actualResult: "Action is not part of the credential executor path.",
  });
}

export function buildAvanzaLoginLocalDevCredentialExecutorState(
  input: AvanzaLoginLocalDevCredentialExecutorInput = {},
): AvanzaLoginLocalDevCredentialExecutorReport {
  const config = normalizedConfig(input);
  const status = statusFor(input, config);

  return reportFrom(input, status);
}

export function toAvanzaLoginLocalDevCredentialSafeReport(
  report: AvanzaLoginLocalDevCredentialExecutorReport,
): AvanzaLoginLocalDevCredentialExecutorReport {
  return report;
}

export async function executeAvanzaLoginLocalDevCredentialPlan(
  input: AvanzaLoginLocalDevCredentialExecutorInput,
  dependencies: AvanzaLoginLocalDevCredentialExecutorDependencies,
): Promise<AvanzaLoginLocalDevCredentialExecutorReport> {
  const config = normalizedConfig(input);
  const initial = buildAvanzaLoginLocalDevCredentialExecutorState(input);

  if (initial.status !== "ready") return initial;
  if (config.dryRun) return initial;

  const actions = actionsFromContract(input.loginActionContract);
  const actionReports: AvanzaLoginLocalDevCredentialActionReport[] = [];

  for (const action of actions) {
    if (!actionAllowed(action, config)) {
      actionReports.push(
        actionReport(action, "blocked", {
          blockedReason: "Action is blocked by explicit allow flag.",
        }),
      );

      return reportFrom(input, "blocked", actionReports);
    }

    const report = await runAction(action, input, dependencies);
    actionReports.push(report);

    if (report.actionStatus === "failed") {
      return reportFrom(input, "page_action_failed", actionReports);
    }
  }

  return reportFrom(input, "executed", actionReports);
}

export const avanzaLoginLocalDevCredentialExecutorDefaultConfig:
  AvanzaLoginLocalDevCredentialExecutorConfig = {
    executorId: "avanza-login-local-dev-credential-executor",
    mode: "disabled",
    enabled: false,
    localDevOnly: true,
    allowUseRuntimeCredentialBundle: false,
    allowClickUsernamePasswordMethod: false,
    allowClickCustomerToggle: false,
    allowFillUsername: false,
    allowFillPassword: false,
    allowClickLoginSubmit: false,
    allowReturnCredentialMaterialToUi: false,
    allowLogCredentialMaterial: false,
    allowStoreCredentialMaterialInSupabase: false,
    allowStoreCredentialMaterialInLocalStorage: false,
    allowBankIdAutomation: false,
    allowCookieRead: false,
    allowSessionExport: false,
    allowOrderSubmit: false,
    dryRun: false,
    now: defaultCreatedAt,
  };
