export type AvanzaLoginActionContractStatus =
  | "disabled"
  | "no_action_needed"
  | "action_plan_ready"
  | "waiting_for_credentials"
  | "bankid_or_mfa_manual_action_required"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaLoginActionType =
  | "no_op"
  | "click_username_password_method"
  | "click_private_toggle"
  | "click_company_toggle"
  | "fill_username"
  | "fill_password"
  | "click_login_submit"
  | "stop_for_bankid_or_mfa"
  | "stop_for_manual_user_action";

export type AvanzaLoginActionExecutionMode =
  | "disabled"
  | "contract_only"
  | "local_dev_dry_run"
  | "local_dev_execute_later";

export type AvanzaLoginActionValueSource =
  | "none"
  | "username_from_secure_provider"
  | "password_from_secure_provider"
  | "static_safe_signal";

export type AvanzaLoginActionContractSafetyFlags = {
  contractEnabled: boolean;
  canCreateActionPlan: boolean;
  canExecuteActions: false;
  canClickUsernamePasswordMethod: false;
  canClickPrivateToggle: false;
  canClickCompanyToggle: false;
  canFillUsername: false;
  canFillPassword: false;
  canClickLoginSubmit: false;
  canHandleCredentialMaterial: false;
  canReadCredentialMaterial: false;
  canReturnCredentialMaterial: false;
  canLogCredentialMaterial: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  canReadCookies: false;
  canExportSession: false;
  canNavigate: false;
  canClick: false;
  canFillForm: false;
  canSubmitLogin: false;
  canSubmitOrder: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaLoginAction = {
  actionId: string;
  type: AvanzaLoginActionType;
  label: string;
  reason: string;
  targetSignalText?: string;
  valueSource: AvanzaLoginActionValueSource;
  containsCredentialMaterial: false;
  executableInThisTask: false;
  dryRunOnly: true;
  requiresSecureCredentialProvider: boolean;
  requiresHumanAction: boolean;
  forbidden: boolean;
  expectedResult: string;
};

export type AvanzaLoginActionContractInput = {
  mode?: AvanzaLoginActionExecutionMode;
  contractEnabled?: boolean;
  loginRoutePlan?: unknown;
  executionSettingsProfile?: unknown;
  credentialProviderState?: unknown;
  browserAdapterState?: unknown;
  now?: string;
  contractId?: string;
  forceError?: boolean;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaLoginActionContract = AvanzaLoginActionContractSafetyFlags & {
  contractId: string;
  createdAt: string;
  mode: AvanzaLoginActionExecutionMode;
  status: AvanzaLoginActionContractStatus;
  label: string;
  reason: string;
  customerType: "private" | "company" | "unknown";
  loginMethod: "username_password" | "bankid_forbidden" | "unknown";
  actions: AvanzaLoginAction[];
  nextExpectedPageState: string;
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaLoginActionContractSafetyFlags;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid\s*qr\s*data|broker\s*secret|cookie|credential\s*[:=]|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token/i;

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

function customerTypeFromRoute(
  source: unknown,
): AvanzaLoginActionContract["customerType"] {
  const value = textField(source, "customerType");

  return value === "private" || value === "company" ? value : "unknown";
}

function loginMethodFromRoute(
  source: unknown,
): AvanzaLoginActionContract["loginMethod"] {
  const value = textField(source, "loginMethod");

  if (value === "username_password" || value === "bankid_forbidden") {
    return value;
  }

  return "unknown";
}

function statusField(source: unknown) {
  return textField(source, "status");
}

function nextExpectedPageState(source: unknown) {
  return textField(source, "nextExpectedPageState") ?? "none";
}

function collectWarnings(input: AvanzaLoginActionContractInput) {
  return [
    ...safeStringArray(input.warnings),
    ...safeStringArray(
      isRecord(input.loginRoutePlan) ? input.loginRoutePlan.warnings : undefined,
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
      isRecord(input.browserAdapterState)
        ? input.browserAdapterState.warnings
        : undefined,
    ),
  ];
}

function collectBlockedReasons(input: AvanzaLoginActionContractInput) {
  return [
    ...safeStringArray(input.blockedReasons),
    ...safeStringArray(
      isRecord(input.loginRoutePlan)
        ? input.loginRoutePlan.blockedReasons
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
      isRecord(input.browserAdapterState)
        ? input.browserAdapterState.blockedReasons
        : undefined,
    ),
  ];
}

function sourceBlocks(source: unknown) {
  const status = statusField(source);

  return status === "blocked" || status === "error" || status === "adapter_error";
}

function credentialProviderReady(source: unknown) {
  return (
    booleanField(source, "providerEnabled") &&
    statusField(source) === "ready" &&
    booleanField(source, "usernameConfigured") &&
    booleanField(source, "passwordAvailable")
  );
}

function routeHasStep(source: unknown, stepType: string) {
  if (!isRecord(source) || !Array.isArray(source.steps)) return false;

  return source.steps.some(
    (step) => isRecord(step) && textField(step, "type") === stepType,
  );
}

function action(
  type: AvanzaLoginActionType,
  label: string,
  reason: string,
  expectedResult: string,
  options: {
    targetSignalText?: string;
    valueSource?: AvanzaLoginActionValueSource;
    requiresSecureCredentialProvider?: boolean;
    requiresHumanAction?: boolean;
    forbidden?: boolean;
  } = {},
): AvanzaLoginAction {
  return {
    actionId: type,
    type,
    label,
    reason,
    targetSignalText: safeText(options.targetSignalText),
    valueSource: options.valueSource ?? "none",
    containsCredentialMaterial: false,
    executableInThisTask: false,
    dryRunOnly: true,
    requiresSecureCredentialProvider:
      options.requiresSecureCredentialProvider ?? false,
    requiresHumanAction: options.requiresHumanAction ?? false,
    forbidden: options.forbidden ?? true,
    expectedResult,
  };
}

function usernamePasswordActions() {
  return [
    action(
      "fill_username",
      "Plan username field fill",
      "Username would come from a secure provider later; no raw username is read or returned.",
      "Future local-dev dry run would place username into the username field.",
      {
        targetSignalText: "Användarnamn",
        valueSource: "username_from_secure_provider",
        requiresSecureCredentialProvider: true,
      },
    ),
    action(
      "fill_password",
      "Plan password field fill",
      "Password would come from a secure provider later; no password value is read or returned.",
      "Future local-dev dry run would place password into the password field.",
      {
        targetSignalText: "Lösenord",
        valueSource: "password_from_secure_provider",
        requiresSecureCredentialProvider: true,
      },
    ),
    action(
      "click_login_submit",
      "Plan login submit",
      "Login submit is represented as a future dry-run action and remains non-executable.",
      "Future local-dev dry run would stop after login-state detection.",
      { targetSignalText: "Logga in", valueSource: "static_safe_signal" },
    ),
  ];
}

function labelFor(status: AvanzaLoginActionContractStatus) {
  switch (status) {
    case "disabled":
      return "Login action contract disabled";
    case "no_action_needed":
      return "No login action needed";
    case "action_plan_ready":
      return "Login action plan ready";
    case "waiting_for_credentials":
      return "Waiting for credentials metadata";
    case "bankid_or_mfa_manual_action_required":
      return "BankID or MFA manual action required";
    case "blocked":
      return "Login action contract blocked";
    case "error":
      return "Login action contract error";
    case "unknown":
      return "Login action contract unknown";
  }
}

function reasonFor(status: AvanzaLoginActionContractStatus) {
  switch (status) {
    case "disabled":
      return "Login action contract is disabled.";
    case "no_action_needed":
      return "Login route indicates the user is already logged in.";
    case "action_plan_ready":
      return "A route-model action sequence can be described for future local-dev dry run.";
    case "waiting_for_credentials":
      return "Username/password route exists, but secure credential provider readiness is missing.";
    case "bankid_or_mfa_manual_action_required":
      return "BankID or MFA route stops for manual user action.";
    case "blocked":
      return "The action contract is blocked by explicit safety input.";
    case "error":
      return "The action contract received an error input.";
    case "unknown":
      return "Inputs are insufficient to create a safe action contract.";
  }
}

function safetyFlags(
  input: AvanzaLoginActionContractInput,
  status: AvanzaLoginActionContractStatus,
): AvanzaLoginActionContractSafetyFlags {
  const contractEnabled =
    input.contractEnabled === true && input.mode !== "disabled";

  return {
    contractEnabled,
    canCreateActionPlan:
      contractEnabled &&
      status === "action_plan_ready" &&
      isRecord(input.loginRoutePlan),
    canExecuteActions: false,
    canClickUsernamePasswordMethod: false,
    canClickPrivateToggle: false,
    canClickCompanyToggle: false,
    canFillUsername: false,
    canFillPassword: false,
    canClickLoginSubmit: false,
    canHandleCredentialMaterial: false,
    canReadCredentialMaterial: false,
    canReturnCredentialMaterial: false,
    canLogCredentialMaterial: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    canReadCookies: false,
    canExportSession: false,
    canNavigate: false,
    canClick: false,
    canFillForm: false,
    canSubmitLogin: false,
    canSubmitOrder: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function contractDecision(input: AvanzaLoginActionContractInput) {
  const route = input.loginRoutePlan;
  const routeStatus = statusField(route);
  const customerType = customerTypeFromRoute(route);
  const loginMethod = loginMethodFromRoute(route);
  const blockedReasons = collectBlockedReasons(input);

  if (input.forceError === true) {
    return {
      status: "error" as const,
      customerType,
      loginMethod,
      actions: [
        action(
          "stop_for_manual_user_action",
          "Stop for action contract error",
          "Action contract received an explicit error input.",
          "No action sequence is produced.",
          { requiresHumanAction: true },
        ),
      ],
      nextExpectedPageState: "manual_review_required",
      blockedReasons,
    };
  }

  if (input.mode === "disabled" || input.contractEnabled !== true) {
    return {
      status: "disabled" as const,
      customerType,
      loginMethod,
      actions: [
        action(
          "no_op",
          "No login action contract",
          "Action contract is disabled.",
          "No action is taken.",
          { forbidden: false },
        ),
      ],
      nextExpectedPageState: "none",
      blockedReasons,
    };
  }

  if (routeStatus === "error") {
    return {
      status: "error" as const,
      customerType,
      loginMethod,
      actions: [
        action(
          "stop_for_manual_user_action",
          "Stop for route planner error",
          "Route planner reported an error.",
          "No action sequence is produced.",
          { requiresHumanAction: true },
        ),
      ],
      nextExpectedPageState: "manual_review_required",
      blockedReasons,
    };
  }

  if (
    sourceBlocks(route) ||
    sourceBlocks(input.executionSettingsProfile) ||
    sourceBlocks(input.credentialProviderState) ||
    sourceBlocks(input.browserAdapterState)
  ) {
    return {
      status: "blocked" as const,
      customerType,
      loginMethod,
      actions: [
        action(
          "stop_for_manual_user_action",
          "Stop for blocked input",
          "A required source model reported a blocked state.",
          "Manual review is required.",
          { requiresHumanAction: true },
        ),
      ],
      nextExpectedPageState: "manual_review_required",
      blockedReasons:
        blockedReasons.length > 0
          ? blockedReasons
          : ["A required source model is blocked or errored."],
    };
  }

  if (routeStatus === "not_needed_already_logged_in") {
    return {
      status: "no_action_needed" as const,
      customerType,
      loginMethod,
      actions: [
        action(
          "no_op",
          "Already logged in",
          "No login action is needed for an already logged-in route.",
          "Future planning may continue only outside order submission.",
          { forbidden: false },
        ),
      ],
      nextExpectedPageState: nextExpectedPageState(route),
      blockedReasons,
    };
  }

  if (routeStatus === "requires_credentials") {
    return {
      status: "waiting_for_credentials" as const,
      customerType,
      loginMethod,
      actions: [
        action(
          "stop_for_manual_user_action",
          "Stop for credentials metadata",
          "Secure credential provider readiness must be configured before action planning.",
          "No username or password value is read.",
          { requiresHumanAction: true },
        ),
      ],
      nextExpectedPageState: "settings_required",
      blockedReasons,
    };
  }

  if (routeStatus === "bankid_or_mfa_manual_action_required") {
    return {
      status: "bankid_or_mfa_manual_action_required" as const,
      customerType,
      loginMethod,
      actions: [
        action(
          "stop_for_bankid_or_mfa",
          "Stop for BankID or MFA",
          "BankID/MFA is forbidden for automation and requires manual user action.",
          "No login action sequence is produced.",
          { requiresHumanAction: true },
        ),
      ],
      nextExpectedPageState: "manual_bankid_or_mfa_boundary",
      blockedReasons,
    };
  }

  if (
    routeStatus === "ready_private_username_password" ||
    routeStatus === "ready_company_username_password" ||
    routeStatus === "requires_username_password_choice" ||
    routeStatus === "requires_company_toggle"
  ) {
    if (!credentialProviderReady(input.credentialProviderState)) {
      return {
        status: "waiting_for_credentials" as const,
        customerType,
        loginMethod,
        actions: [
          action(
            "stop_for_manual_user_action",
            "Stop for secure provider readiness",
            "Username/password actions require a ready secure credential provider.",
            "No username or password value is read.",
            { requiresHumanAction: true },
          ),
        ],
        nextExpectedPageState: "settings_required",
        blockedReasons,
      };
    }

    const actions: AvanzaLoginAction[] = [];

    if (
      routeStatus === "requires_company_toggle" ||
      routeHasStep(route, "select_company_toggle")
    ) {
      actions.push(
        action(
          "click_company_toggle",
          "Plan company toggle click",
          "The company route may need Företag selected before username/password fields.",
          "Future local-dev dry run would expect company username/password route.",
          { targetSignalText: "Företag", valueSource: "static_safe_signal" },
        ),
      );
    }

    if (
      routeStatus === "requires_username_password_choice" ||
      routeHasStep(route, "select_username_password_method")
    ) {
      actions.push(
        action(
          "click_username_password_method",
          "Plan username/password method click",
          "The route may need Användarnamn och lösenord selected before fields are visible.",
          "Future local-dev dry run would expect username/password fields.",
          {
            targetSignalText: "Användarnamn och lösenord",
            valueSource: "static_safe_signal",
          },
        ),
      );
    }

    if (
      customerType === "private" &&
      routeHasStep(route, "select_private_toggle")
    ) {
      actions.unshift(
        action(
          "click_private_toggle",
          "Plan private toggle click",
          "The private route may need Privat selected before username/password fields.",
          "Future local-dev dry run would expect private username/password route.",
          { targetSignalText: "Privat", valueSource: "static_safe_signal" },
        ),
      );
    }

    actions.push(...usernamePasswordActions());

    return {
      status: "action_plan_ready" as const,
      customerType,
      loginMethod,
      actions,
      nextExpectedPageState: nextExpectedPageState(route),
      blockedReasons,
    };
  }

  return {
    status: "unknown" as const,
    customerType,
    loginMethod,
    actions: [
      action(
        "stop_for_manual_user_action",
        "Stop for unknown route",
        "Route status is insufficient for a safe action contract.",
        "Manual review is required.",
        { requiresHumanAction: true },
      ),
    ],
    nextExpectedPageState: "manual_review_required",
    blockedReasons,
  };
}

export function buildAvanzaLoginActionContract(
  input: AvanzaLoginActionContractInput = {},
): AvanzaLoginActionContract {
  const mode = input.mode ?? "disabled";
  const decision = contractDecision({ ...input, mode });
  const safety = safetyFlags({ ...input, mode }, decision.status);

  return {
    ...safety,
    contractId: safeText(input.contractId) ?? "avanza-login-action-contract",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode,
    status: decision.status,
    label: labelFor(decision.status),
    reason: reasonFor(decision.status),
    customerType: decision.customerType,
    loginMethod: decision.loginMethod,
    actions: decision.actions,
    nextExpectedPageState: decision.nextExpectedPageState,
    warnings: collectWarnings(input),
    blockedReasons: decision.blockedReasons,
    safetyFlags: safety,
  };
}
