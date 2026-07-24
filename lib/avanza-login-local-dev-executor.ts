export type AvanzaLoginLocalDevExecutorStatus =
  | "disabled"
  | "ready"
  | "executed"
  | "blocked"
  | "missing_credentials"
  | "bankid_or_mfa_stop"
  | "page_action_failed"
  | "error"
  | "unknown";

export type AvanzaLoginLocalDevActionStatus =
  | "pending"
  | "executed"
  | "skipped"
  | "blocked"
  | "blocked_missing_credentials"
  | "blocked_bankid_or_mfa"
  | "failed";

export type AvanzaLoginLocalDevExecutorMode = "disabled" | "local_dev";

export type AvanzaLoginLocalDevExecutorConfig = {
  executorId: string;
  mode: AvanzaLoginLocalDevExecutorMode;
  enabled: boolean;
  localDevOnly: true;
  allowClickUsernamePasswordMethod: boolean;
  allowClickCustomerToggle: boolean;
  allowFillCredentialReferences: boolean;
  allowClickLoginSubmit: boolean;
  allowBankIdAutomation: false;
  allowCookieRead: false;
  allowSessionExport: false;
  allowOrderSubmit: false;
  dryRun?: boolean;
  now?: string;
};

export type AvanzaLoginLocalDevPageActionResult = {
  ok: boolean;
  reason?: string;
};

export type AvanzaLoginLocalDevExecutorDependencies = {
  clickByText: (
    text: string,
  ) => Promise<AvanzaLoginLocalDevPageActionResult>;
  fillByLabel: (
    label: string,
    valueReference: string,
  ) => Promise<AvanzaLoginLocalDevPageActionResult>;
  waitForState?: (
    stateHint: string,
  ) => Promise<AvanzaLoginLocalDevPageActionResult>;
  readPageSnapshot?: () => Promise<unknown>;
};

export type AvanzaLoginLocalDevExecutorSafetyFlags = {
  executorEnabled: boolean;
  localDevOnly: true;
  canExecuteLocalDevActions: boolean;
  canClickUsernamePasswordMethod: boolean;
  canClickCustomerToggle: boolean;
  canFillUsernameReference: boolean;
  canFillPasswordReference: boolean;
  canClickLoginSubmit: boolean;
  canResolveCredentialMaterial: false;
  canReadCredentialMaterial: false;
  canReturnCredentialMaterial: false;
  canLogCredentialMaterial: false;
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

export type AvanzaLoginLocalDevActionReport = {
  actionId: string;
  actionType: string;
  label: string;
  actionStatus: AvanzaLoginLocalDevActionStatus;
  targetText: string;
  targetLabel: string;
  valueReference: "none" | "username_from_secure_provider" | "password_from_secure_provider";
  containsCredentialMaterial: false;
  realBrowserActionAttempted: boolean;
  expectedResult: string;
  actualResult: string;
  blockedReason: string;
};

export type AvanzaLoginLocalDevExecutorInput = {
  config?: Partial<AvanzaLoginLocalDevExecutorConfig>;
  loginActionContract?: unknown;
  dryRunReport?: unknown;
  executionSettingsProfile?: unknown;
  credentialProviderState?: unknown;
  now?: string;
};

export type AvanzaLoginLocalDevExecutorReport =
  AvanzaLoginLocalDevExecutorSafetyFlags & {
    executorId: string;
    createdAt: string;
    mode: AvanzaLoginLocalDevExecutorMode;
    status: AvanzaLoginLocalDevExecutorStatus;
    label: string;
    reason: string;
    actionReports: AvanzaLoginLocalDevActionReport[];
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaLoginLocalDevExecutorSafetyFlags;
  };

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const usernameReference = "username_from_secure_provider";
const passwordReference = "password_from_secure_provider";
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

function textField(source: unknown, key: string) {
  return isRecord(source) ? safeText(source[key]) : undefined;
}

function booleanField(source: unknown, key: string) {
  return isRecord(source) && typeof source[key] === "boolean"
    ? source[key]
    : false;
}

function statusField(source: unknown) {
  return textField(source, "status");
}

function actionsFromContract(contract: unknown) {
  return isRecord(contract) && Array.isArray(contract.actions)
    ? contract.actions
    : [];
}

function hasBankIdAction(actions: unknown[]) {
  return actions.some(
    (action) =>
      textField(action, "type") === "stop_for_bankid_or_mfa" ||
      booleanField(action, "requiresHumanAction"),
  );
}

function hasCredentialAction(actions: unknown[]) {
  return actions.some((action) => {
    const type = textField(action, "type");

    return type === "fill_username" || type === "fill_password";
  });
}

function credentialProviderReady(source: unknown) {
  return (
    isRecord(source) &&
    source.status === "ready" &&
    source.providerEnabled === true &&
    source.usernameConfigured === true &&
    source.passwordAvailable === true
  );
}

function sourceBlocks(source: unknown) {
  const status = statusField(source);

  return status === "blocked" || status === "error" || status === "adapter_error";
}

function normalizedConfig(
  input: AvanzaLoginLocalDevExecutorInput,
): AvanzaLoginLocalDevExecutorConfig {
  const config = input.config ?? {};

  return {
    executorId: safeText(config.executorId) ?? "avanza-login-local-dev-executor",
    mode: config.mode === "local_dev" ? "local_dev" : "disabled",
    enabled: config.enabled === true,
    localDevOnly: true,
    allowClickUsernamePasswordMethod:
      config.allowClickUsernamePasswordMethod === true,
    allowClickCustomerToggle: config.allowClickCustomerToggle === true,
    allowFillCredentialReferences:
      config.allowFillCredentialReferences === true,
    allowClickLoginSubmit: config.allowClickLoginSubmit === true,
    allowBankIdAutomation: false,
    allowCookieRead: false,
    allowSessionExport: false,
    allowOrderSubmit: false,
    dryRun: config.dryRun === true,
    now: safeText(config.now) ?? safeText(input.now) ?? defaultCreatedAt,
  };
}

function collectWarnings(input: AvanzaLoginLocalDevExecutorInput) {
  return [
    ...safeStringArray(
      isRecord(input.loginActionContract)
        ? input.loginActionContract.warnings
        : undefined,
    ),
    ...safeStringArray(
      isRecord(input.dryRunReport) ? input.dryRunReport.warnings : undefined,
    ),
    ...safeStringArray(
      isRecord(input.executionSettingsProfile)
        ? input.executionSettingsProfile.warnings
        : undefined,
    ),
    ...safeStringArray(
      isRecord(input.credentialProviderState)
        ? input.credentialProviderState.warnings
        : undefined,
    ),
  ];
}

function collectBlockedReasons(input: AvanzaLoginLocalDevExecutorInput) {
  return [
    ...safeStringArray(
      isRecord(input.loginActionContract)
        ? input.loginActionContract.blockedReasons
        : undefined,
    ),
    ...safeStringArray(
      isRecord(input.dryRunReport)
        ? input.dryRunReport.blockedReasons
        : undefined,
    ),
    ...safeStringArray(
      isRecord(input.executionSettingsProfile)
        ? input.executionSettingsProfile.blockedReasons
        : undefined,
    ),
    ...safeStringArray(
      isRecord(input.credentialProviderState)
        ? input.credentialProviderState.blockedReasons
        : undefined,
    ),
  ];
}

function valueReferenceFor(action: unknown) {
  const valueSource = textField(action, "valueSource");

  if (valueSource === usernameReference) return usernameReference;
  if (valueSource === passwordReference) return passwordReference;

  return "none" as const;
}

function actionTargetText(action: unknown) {
  const type = textField(action, "type");
  const target = textField(action, "targetSignalText");

  if (target) return target;
  if (type === "click_username_password_method") return "Användarnamn och lösenord";
  if (type === "click_private_toggle") return "Privat";
  if (type === "click_company_toggle") return "Företag";
  if (type === "click_login_submit") return "Logga in";

  return "none";
}

function actionTargetLabel(action: unknown) {
  const type = textField(action, "type");

  if (type === "fill_username") return "Användarnamn";
  if (type === "fill_password") return "Lösenord";

  return "none";
}

function baseActionReport(
  action: unknown,
  actionStatus: AvanzaLoginLocalDevActionStatus,
  actualResult: string,
  blockedReason = "none",
  realBrowserActionAttempted = false,
): AvanzaLoginLocalDevActionReport {
  return {
    actionId: textField(action, "actionId") ?? "unknown-action",
    actionType: textField(action, "type") ?? "unknown",
    label: textField(action, "label") ?? "Unknown local-dev action",
    actionStatus,
    targetText: actionTargetText(action),
    targetLabel: actionTargetLabel(action),
    valueReference: valueReferenceFor(action),
    containsCredentialMaterial: false,
    realBrowserActionAttempted,
    expectedResult:
      textField(action, "expectedResult") ??
      "No order action or credential material is expected.",
    actualResult,
    blockedReason,
  };
}

function noOpActionReport(
  actionStatus: AvanzaLoginLocalDevActionStatus,
  actualResult: string,
  blockedReason = "none",
): AvanzaLoginLocalDevActionReport {
  return {
    actionId: "no-op",
    actionType: "no_op",
    label: "No local-dev login action",
    actionStatus,
    targetText: "none",
    targetLabel: "none",
    valueReference: "none",
    containsCredentialMaterial: false,
    realBrowserActionAttempted: false,
    expectedResult: "No local-dev login action is needed.",
    actualResult,
    blockedReason,
  };
}

function safetyFlags(
  config: AvanzaLoginLocalDevExecutorConfig,
  status: AvanzaLoginLocalDevExecutorStatus,
): AvanzaLoginLocalDevExecutorSafetyFlags {
  const executorEnabled =
    config.mode === "local_dev" && config.enabled === true && config.localDevOnly;
  const executable =
    executorEnabled &&
    !config.dryRun &&
    (status === "ready" || status === "executed");

  return {
    executorEnabled,
    localDevOnly: true,
    canExecuteLocalDevActions: executable,
    canClickUsernamePasswordMethod:
      executable && config.allowClickUsernamePasswordMethod,
    canClickCustomerToggle: executable && config.allowClickCustomerToggle,
    canFillUsernameReference:
      executable && config.allowFillCredentialReferences,
    canFillPasswordReference:
      executable && config.allowFillCredentialReferences,
    canClickLoginSubmit: executable && config.allowClickLoginSubmit,
    canResolveCredentialMaterial: false,
    canReadCredentialMaterial: false,
    canReturnCredentialMaterial: false,
    canLogCredentialMaterial: false,
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

function labelFor(status: AvanzaLoginLocalDevExecutorStatus) {
  switch (status) {
    case "disabled":
      return "Login local-dev executor disabled";
    case "ready":
      return "Login local-dev executor ready";
    case "executed":
      return "Login local-dev executor executed injected actions";
    case "blocked":
      return "Login local-dev executor blocked";
    case "missing_credentials":
      return "Login local-dev executor missing credentials";
    case "bankid_or_mfa_stop":
      return "Login local-dev executor stopped for BankID or MFA";
    case "page_action_failed":
      return "Login local-dev executor page action failed";
    case "error":
      return "Login local-dev executor error";
    case "unknown":
      return "Login local-dev executor unknown";
  }
}

function reasonFor(status: AvanzaLoginLocalDevExecutorStatus) {
  switch (status) {
    case "disabled":
      return "Local-dev login executor is disabled.";
    case "ready":
      return "Local-dev login executor has an action contract and explicit injected dependency path available.";
    case "executed":
      return "Injected local-dev page action dependencies reported successful execution using credential references only.";
    case "blocked":
      return "Local-dev login executor is blocked by explicit safety input or disabled action permissions.";
    case "missing_credentials":
      return "Credential provider readiness metadata is missing; no credential material is resolved.";
    case "bankid_or_mfa_stop":
      return "BankID/MFA is forbidden for automation and requires manual user action.";
    case "page_action_failed":
      return "An injected page action dependency returned a failed result.";
    case "error":
      return "Local-dev login executor received an error input.";
    case "unknown":
      return "Inputs are insufficient for a safe local-dev login executor report.";
  }
}

function baseStatus(
  input: AvanzaLoginLocalDevExecutorInput,
  config: AvanzaLoginLocalDevExecutorConfig,
): AvanzaLoginLocalDevExecutorStatus {
  const contractStatus = statusField(input.loginActionContract);
  const dryRunStatus = statusField(input.dryRunReport);
  const actions = actionsFromContract(input.loginActionContract);

  if (config.mode === "disabled" || config.enabled !== true) {
    return "disabled";
  }

  if (
    sourceBlocks(input.loginActionContract) ||
    sourceBlocks(input.dryRunReport) ||
    sourceBlocks(input.executionSettingsProfile) ||
    sourceBlocks(input.credentialProviderState)
  ) {
    return contractStatus === "error" || dryRunStatus === "dry_run_error"
      ? "error"
      : "blocked";
  }

  if (
    contractStatus === "bankid_or_mfa_manual_action_required" ||
    dryRunStatus === "dry_run_bankid_or_mfa_stop" ||
    hasBankIdAction(actions)
  ) {
    return "bankid_or_mfa_stop";
  }

  if (contractStatus === "waiting_for_credentials") {
    return "missing_credentials";
  }

  if (
    hasCredentialAction(actions) &&
    !credentialProviderReady(input.credentialProviderState)
  ) {
    return "missing_credentials";
  }

  if (config.dryRun === true) {
    return "blocked";
  }

  if (
    actions.some((action) => !isActionAllowed(config, textField(action, "type")))
  ) {
    return "blocked";
  }

  if (
    contractStatus === "action_plan_ready" ||
    contractStatus === "no_action_needed"
  ) {
    return "ready";
  }

  return "unknown";
}

function isActionAllowed(
  config: AvanzaLoginLocalDevExecutorConfig,
  actionType: string | undefined,
) {
  switch (actionType) {
    case "no_op":
      return true;
    case "click_username_password_method":
      return config.allowClickUsernamePasswordMethod;
    case "click_private_toggle":
    case "click_company_toggle":
      return config.allowClickCustomerToggle;
    case "fill_username":
    case "fill_password":
      return config.allowFillCredentialReferences;
    case "click_login_submit":
      return config.allowClickLoginSubmit;
    case "stop_for_bankid_or_mfa":
    case "stop_for_manual_user_action":
      return false;
    default:
      return false;
  }
}

function pendingActionReports(
  actions: unknown[],
  status: AvanzaLoginLocalDevExecutorStatus,
  config: AvanzaLoginLocalDevExecutorConfig,
) {
  if (actions.length === 0) {
    return [
      noOpActionReport(
        status === "disabled" ? "skipped" : "blocked",
        "No action contract is available.",
        status === "disabled" ? "none" : "Missing action contract.",
      ),
    ];
  }

  return actions.map((action) => {
    const actionType = textField(action, "type");

    if (status === "disabled") {
      return baseActionReport(
        action,
        "skipped",
        "Local-dev executor is disabled.",
      );
    }

    if (status === "bankid_or_mfa_stop") {
      return baseActionReport(
        action,
        actionType === "stop_for_bankid_or_mfa"
          ? "blocked_bankid_or_mfa"
          : "skipped",
        "Local-dev execution stops before BankID/MFA automation.",
        actionType === "stop_for_bankid_or_mfa"
          ? "BankID/MFA requires manual action."
          : "Stopped before browser action.",
      );
    }

    if (status === "missing_credentials") {
      return baseActionReport(
        action,
        actionType === "fill_username" || actionType === "fill_password"
          ? "blocked_missing_credentials"
          : "skipped",
        "Credential readiness metadata is missing; no value is resolved.",
        "Missing credential readiness metadata.",
      );
    }

    if (config.dryRun === true) {
      return baseActionReport(
        action,
        "skipped",
        "Dry-run flag blocks local-dev page action execution.",
        "dryRun true blocks execution.",
      );
    }

    if (!isActionAllowed(config, actionType)) {
      return baseActionReport(
        action,
        "blocked",
        "Action permission is not enabled in local-dev executor config.",
        "Action permission flag is false.",
      );
    }

    return baseActionReport(
      action,
      status === "ready" ? "pending" : "blocked",
      status === "ready"
        ? "Action is pending explicit injected dependency execution."
        : "Action is not executable for this report.",
      status === "ready" ? "none" : "Executor is not ready.",
    );
  });
}

function reportFrom(
  input: AvanzaLoginLocalDevExecutorInput,
  status: AvanzaLoginLocalDevExecutorStatus,
  actionReports: AvanzaLoginLocalDevActionReport[],
  extraBlockedReasons: string[] = [],
): AvanzaLoginLocalDevExecutorReport {
  const config = normalizedConfig(input);
  const warnings = collectWarnings(input);
  const blockedReasons = [
    ...collectBlockedReasons(input),
    ...extraBlockedReasons.flatMap((reason) => {
      const text = safeText(reason);

      return text ? [text] : [];
    }),
  ];
  const flags = safetyFlags(config, status);

  return {
    executorId: config.executorId,
    createdAt: config.now ?? defaultCreatedAt,
    mode: config.mode,
    status,
    label: labelFor(status),
    reason: reasonFor(status),
    actionReports,
    warnings,
    blockedReasons,
    safetyFlags: flags,
    ...flags,
  };
}

export function buildAvanzaLoginLocalDevExecutorState(
  input: AvanzaLoginLocalDevExecutorInput = {},
): AvanzaLoginLocalDevExecutorReport {
  const config = normalizedConfig(input);
  const actions = actionsFromContract(input.loginActionContract);
  const status = baseStatus(input, config);

  return reportFrom(input, status, pendingActionReports(actions, status, config));
}

async function executeLocalDevAction(
  dependencies: AvanzaLoginLocalDevExecutorDependencies,
  action: unknown,
) {
  const actionType = textField(action, "type");

  switch (actionType) {
    case "no_op":
      return { ok: true, reason: "No login action needed." };
    case "click_username_password_method":
      return dependencies.clickByText("Användarnamn och lösenord");
    case "click_private_toggle":
      return dependencies.clickByText("Privat");
    case "click_company_toggle":
      return dependencies.clickByText("Företag");
    case "fill_username":
      return dependencies.fillByLabel("Användarnamn", usernameReference);
    case "fill_password":
      return dependencies.fillByLabel("Lösenord", passwordReference);
    case "click_login_submit":
      return dependencies.clickByText("Logga in");
    default:
      return { ok: false, reason: "Unsupported local-dev login action." };
  }
}

export async function executeAvanzaLoginLocalDevPlan(
  input: AvanzaLoginLocalDevExecutorInput,
  dependencies: AvanzaLoginLocalDevExecutorDependencies,
): Promise<AvanzaLoginLocalDevExecutorReport> {
  const initial = buildAvanzaLoginLocalDevExecutorState(input);
  const actions = actionsFromContract(input.loginActionContract);

  if (initial.status !== "ready") {
    return initial;
  }

  const actionReports: AvanzaLoginLocalDevActionReport[] = [];

  for (const action of actions) {
    const result = await executeLocalDevAction(dependencies, action);
    const actionType = textField(action, "type");

    if (!result.ok) {
      actionReports.push(
        baseActionReport(
          action,
          "failed",
          result.reason ?? "Injected dependency returned a failed result.",
          result.reason ?? "Injected dependency failed.",
          actionType !== "no_op",
        ),
      );

      return reportFrom(input, "page_action_failed", actionReports, [
        result.reason ?? "Injected dependency failed.",
      ]);
    }

    actionReports.push(
      baseActionReport(
        action,
        actionType === "no_op" ? "skipped" : "executed",
        result.reason ?? "Injected dependency reported ok.",
        "none",
        actionType !== "no_op",
      ),
    );

    if (dependencies.waitForState) {
      const waitResult = await dependencies.waitForState(
        textField(action, "expectedResult") ?? "login action expected result",
      );

      if (!waitResult.ok) {
        return reportFrom(input, "page_action_failed", actionReports, [
          waitResult.reason ?? "Injected waitForState dependency failed.",
        ]);
      }
    }
  }

  return reportFrom(input, "executed", actionReports);
}

export const avanzaLoginLocalDevExecutorDefaultConfig: AvanzaLoginLocalDevExecutorConfig =
  {
    executorId: "avanza-login-local-dev-executor",
    mode: "disabled",
    enabled: false,
    localDevOnly: true,
    allowClickUsernamePasswordMethod: false,
    allowClickCustomerToggle: false,
    allowFillCredentialReferences: false,
    allowClickLoginSubmit: false,
    allowBankIdAutomation: false,
    allowCookieRead: false,
    allowSessionExport: false,
    allowOrderSubmit: false,
    dryRun: true,
    now: defaultCreatedAt,
  };
