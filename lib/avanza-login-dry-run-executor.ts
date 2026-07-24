export type AvanzaLoginDryRunStatus =
  | "disabled"
  | "dry_run_ready"
  | "dry_run_passed"
  | "dry_run_blocked"
  | "dry_run_bankid_or_mfa_stop"
  | "dry_run_missing_credentials"
  | "dry_run_error"
  | "unknown";

export type AvanzaLoginDryRunActionStatus =
  | "planned"
  | "allowed_in_future"
  | "blocked_in_this_task"
  | "blocked_missing_credentials"
  | "blocked_bankid_or_mfa"
  | "skipped"
  | "error";

export type AvanzaLoginDryRunMode = "disabled" | "local_dev_dry_run";

export type AvanzaLoginDryRunSafetyFlags = {
  dryRunEnabled: boolean;
  canDryRun: boolean;
  canExecuteActions: false;
  canReadCredentialMaterial: false;
  canReturnCredentialMaterial: false;
  canLogCredentialMaterial: false;
  canFillUsername: false;
  canFillPassword: false;
  canClick: false;
  canClickLoginSubmit: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  canReadCookies: false;
  canExportSession: false;
  canNavigate: false;
  canSubmitOrder: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaLoginDryRunActionReport = {
  actionId: string;
  actionType: string;
  label: string;
  dryRunStatus: AvanzaLoginDryRunActionStatus;
  wouldTargetSignalText: string;
  wouldUseCredentialReference: boolean;
  containsCredentialMaterial: false;
  executableNow: false;
  expectedResult: string;
  blockedReason: string;
};

export type AvanzaLoginDryRunInput = {
  mode?: AvanzaLoginDryRunMode;
  dryRunEnabled?: boolean;
  loginActionContract?: unknown;
  executionSettingsProfile?: unknown;
  credentialProviderState?: unknown;
  pageState?: unknown;
  now?: string;
  dryRunId?: string;
};

export type AvanzaLoginDryRunReport = AvanzaLoginDryRunSafetyFlags & {
  dryRunId: string;
  createdAt: string;
  mode: AvanzaLoginDryRunMode;
  status: AvanzaLoginDryRunStatus;
  label: string;
  reason: string;
  customerType: "private" | "company" | "unknown";
  loginMethod: "username_password" | "bankid_forbidden" | "unknown";
  actionReports: AvanzaLoginDryRunActionReport[];
  nextExpectedPageState: string;
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaLoginDryRunSafetyFlags;
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

function customerTypeField(source: unknown) {
  const value = textField(source, "customerType");

  return value === "private" || value === "company" ? value : "unknown";
}

function loginMethodField(source: unknown) {
  const value = textField(source, "loginMethod");

  if (value === "username_password" || value === "bankid_forbidden") {
    return value;
  }

  return "unknown";
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

function collectWarnings(input: AvanzaLoginDryRunInput) {
  return [
    ...safeStringArray(
      isRecord(input.loginActionContract)
        ? input.loginActionContract.warnings
        : undefined,
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
    ...safeStringArray(
      isRecord(input.pageState) ? input.pageState.warnings : undefined,
    ),
  ];
}

function collectBlockedReasons(input: AvanzaLoginDryRunInput) {
  return [
    ...safeStringArray(
      isRecord(input.loginActionContract)
        ? input.loginActionContract.blockedReasons
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
    ...safeStringArray(
      isRecord(input.pageState) ? input.pageState.blockedReasons : undefined,
    ),
  ];
}

function safetyFlags(
  mode: AvanzaLoginDryRunMode,
  dryRunEnabled: boolean,
  status: AvanzaLoginDryRunStatus,
): AvanzaLoginDryRunSafetyFlags {
  return {
    dryRunEnabled,
    canDryRun:
      mode === "local_dev_dry_run" &&
      dryRunEnabled &&
      (status === "dry_run_ready" || status === "dry_run_passed"),
    canExecuteActions: false,
    canReadCredentialMaterial: false,
    canReturnCredentialMaterial: false,
    canLogCredentialMaterial: false,
    canFillUsername: false,
    canFillPassword: false,
    canClick: false,
    canClickLoginSubmit: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    canReadCookies: false,
    canExportSession: false,
    canNavigate: false,
    canSubmitOrder: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function labelFor(status: AvanzaLoginDryRunStatus) {
  switch (status) {
    case "disabled":
      return "Login dry-run executor disabled";
    case "dry_run_ready":
      return "Login dry run ready";
    case "dry_run_passed":
      return "Login dry run passed";
    case "dry_run_blocked":
      return "Login dry run blocked";
    case "dry_run_bankid_or_mfa_stop":
      return "Login dry run stopped for BankID or MFA";
    case "dry_run_missing_credentials":
      return "Login dry run missing credentials";
    case "dry_run_error":
      return "Login dry run error";
    case "unknown":
      return "Login dry run unknown";
  }
}

function reasonFor(status: AvanzaLoginDryRunStatus) {
  switch (status) {
    case "disabled":
      return "Local-dev login dry run is disabled.";
    case "dry_run_ready":
      return "Local-dev login dry run inputs are ready for model-only evaluation.";
    case "dry_run_passed":
      return "Login action plan is internally coherent for a local-dev dry run; no browser action is executed.";
    case "dry_run_blocked":
      return "Login dry run is blocked by the action contract or supporting model input.";
    case "dry_run_bankid_or_mfa_stop":
      return "BankID or MFA requires manual user action and stops the dry run.";
    case "dry_run_missing_credentials":
      return "Secure credential provider readiness is missing; no credential material is read.";
    case "dry_run_error":
      return "Login dry run received an error contract state.";
    case "unknown":
      return "Inputs are insufficient for a safe login dry run report.";
  }
}

function actionReport(
  sourceAction: unknown,
  status: AvanzaLoginDryRunActionStatus,
  blockedReason: string,
): AvanzaLoginDryRunActionReport {
  const actionId = textField(sourceAction, "actionId") ?? "unknown-action";
  const actionType = textField(sourceAction, "type") ?? "unknown";
  const valueSource = textField(sourceAction, "valueSource") ?? "none";

  return {
    actionId,
    actionType,
    label: textField(sourceAction, "label") ?? "Unknown login action",
    dryRunStatus: status,
    wouldTargetSignalText:
      textField(sourceAction, "targetSignalText") ?? "none",
    wouldUseCredentialReference:
      valueSource === "username_from_secure_provider" ||
      valueSource === "password_from_secure_provider" ||
      booleanField(sourceAction, "requiresSecureCredentialProvider"),
    containsCredentialMaterial: false,
    executableNow: false,
    expectedResult:
      textField(sourceAction, "expectedResult") ??
      "No executable result is produced.",
    blockedReason,
  };
}

function actionsFromContract(contract: unknown) {
  return isRecord(contract) && Array.isArray(contract.actions)
    ? contract.actions
    : [];
}

function noOpActionReport(reason: string): AvanzaLoginDryRunActionReport {
  return {
    actionId: "no-op",
    actionType: "no_op",
    label: "No login action",
    dryRunStatus: "skipped",
    wouldTargetSignalText: "none",
    wouldUseCredentialReference: false,
    containsCredentialMaterial: false,
    executableNow: false,
    expectedResult: "No login action is needed.",
    blockedReason: reason,
  };
}

function decision(input: AvanzaLoginDryRunInput) {
  const contract = input.loginActionContract;
  const contractStatus = statusField(contract);
  const blockedReasons = collectBlockedReasons(input);
  const actions = actionsFromContract(contract);

  if (input.mode === "disabled" || input.dryRunEnabled !== true) {
    return {
      status: "disabled" as const,
      actionReports: [noOpActionReport("Dry run is disabled.")],
      blockedReasons,
    };
  }

  if (!isRecord(contract)) {
    return {
      status: "unknown" as const,
      actionReports: [noOpActionReport("Login action contract is missing.")],
      blockedReasons,
    };
  }

  if (contractStatus === "no_action_needed") {
    return {
      status: "dry_run_passed" as const,
      actionReports:
        actions.length > 0
          ? actions.map((action) =>
              actionReport(
                action,
                "skipped",
                "Route is already logged in; login actions are skipped.",
              ),
            )
          : [noOpActionReport("Route is already logged in.")],
      blockedReasons,
    };
  }

  if (contractStatus === "action_plan_ready") {
    if (!credentialProviderReady(input.credentialProviderState)) {
      return {
        status: "dry_run_missing_credentials" as const,
        actionReports: actions.map((action) =>
          actionReport(
            action,
            "blocked_missing_credentials",
            "Secure credential provider readiness is missing.",
          ),
        ),
        blockedReasons:
          blockedReasons.length > 0
            ? blockedReasons
            : ["Secure credential provider readiness is missing."],
      };
    }

    return {
      status: "dry_run_passed" as const,
      actionReports: actions.map((action) =>
        actionReport(
          action,
          "allowed_in_future",
          "Allowed only for a future explicitly approved local-dev executor; executableNow remains false.",
        ),
      ),
      blockedReasons,
    };
  }

  if (contractStatus === "waiting_for_credentials") {
    return {
      status: "dry_run_missing_credentials" as const,
      actionReports: actions.map((action) =>
        actionReport(
          action,
          "blocked_missing_credentials",
          "Secure credential provider readiness is missing.",
        ),
      ),
      blockedReasons:
        blockedReasons.length > 0
          ? blockedReasons
          : ["Secure credential provider readiness is missing."],
    };
  }

  if (contractStatus === "bankid_or_mfa_manual_action_required") {
    return {
      status: "dry_run_bankid_or_mfa_stop" as const,
      actionReports: actions.map((action) =>
        actionReport(
          action,
          "blocked_bankid_or_mfa",
          "BankID/MFA requires manual user action.",
        ),
      ),
      blockedReasons:
        blockedReasons.length > 0
          ? blockedReasons
          : ["BankID/MFA requires manual user action."],
    };
  }

  if (contractStatus === "blocked") {
    return {
      status: "dry_run_blocked" as const,
      actionReports: actions.map((action) =>
        actionReport(action, "blocked_in_this_task", "Action contract blocked."),
      ),
      blockedReasons:
        blockedReasons.length > 0
          ? blockedReasons
          : ["Action contract blocked."],
    };
  }

  if (contractStatus === "error") {
    return {
      status: "dry_run_error" as const,
      actionReports: actions.map((action) =>
        actionReport(action, "error", "Action contract error."),
      ),
      blockedReasons:
        blockedReasons.length > 0
          ? blockedReasons
          : ["Action contract error."],
    };
  }

  return {
    status: "unknown" as const,
    actionReports:
      actions.length > 0
        ? actions.map((action) =>
            actionReport(
              action,
              "blocked_in_this_task",
              "Unknown action contract state.",
            ),
          )
        : [noOpActionReport("Unknown action contract state.")],
    blockedReasons,
  };
}

export function buildAvanzaLoginDryRunReport(
  input: AvanzaLoginDryRunInput = {},
): AvanzaLoginDryRunReport {
  const mode = input.mode ?? "disabled";
  const result = decision({ ...input, mode });
  const safety = safetyFlags(mode, input.dryRunEnabled === true, result.status);
  const contract = input.loginActionContract;

  return {
    ...safety,
    dryRunId: safeText(input.dryRunId) ?? "avanza-login-dry-run",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode,
    status: result.status,
    label: labelFor(result.status),
    reason: reasonFor(result.status),
    customerType: customerTypeField(contract),
    loginMethod: loginMethodField(contract),
    actionReports: result.actionReports,
    nextExpectedPageState: textField(contract, "nextExpectedPageState") ?? "none",
    warnings: collectWarnings(input),
    blockedReasons: result.blockedReasons,
    safetyFlags: safety,
  };
}
