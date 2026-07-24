export type AvanzaLoginMockPageExecutorStatus =
  | "disabled"
  | "mock_ready"
  | "mock_executed"
  | "mock_blocked"
  | "mock_bankid_or_mfa_stop"
  | "mock_missing_credentials"
  | "mock_error"
  | "unknown";

export type AvanzaLoginMockActionExecutionStatus =
  | "skipped"
  | "simulated"
  | "blocked"
  | "blocked_missing_credentials"
  | "blocked_bankid_or_mfa"
  | "forbidden"
  | "error";

export type AvanzaLoginMockPageStateKind =
  | "initial_login_choice"
  | "private_username_password_form"
  | "company_username_password_form"
  | "bankid_or_mfa"
  | "logged_in_home"
  | "unknown";

export type AvanzaLoginMockPageExecutorMode = "disabled" | "mock_local_dev";

export type AvanzaLoginMockPageState = {
  stateId: string;
  kind: AvanzaLoginMockPageStateKind;
  customerType: "private" | "company" | "unknown";
  usernamePasswordMethodVisible: boolean;
  privateToggleVisible: boolean;
  companyToggleVisible: boolean;
  usernameFieldVisible: boolean;
  passwordFieldVisible: boolean;
  loginSubmitVisible: boolean;
  bankIdVisible: boolean;
  loggedInLikely: boolean;
  visibleTexts: string[];
  formLabels: string[];
  buttonTexts: string[];
  warnings: string[];
  blockedReasons: string[];
};

export type AvanzaLoginMockExecutorSafetyFlags = {
  mockExecutorEnabled: boolean;
  mockOnly: true;
  canExecuteMockActions: boolean;
  canExecuteRealBrowserActions: false;
  canReadCredentialMaterial: false;
  canReturnCredentialMaterial: false;
  canLogCredentialMaterial: false;
  canFillUsernameReal: false;
  canFillPasswordReal: false;
  canClickReal: false;
  canClickLoginSubmitReal: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  canReadCookies: false;
  canExportSession: false;
  canNavigateRealBrowser: false;
  canSubmitOrder: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaLoginMockActionReport = {
  actionId: string;
  actionType: string;
  label: string;
  executionStatus: AvanzaLoginMockActionExecutionStatus;
  simulatedTargetText: string;
  simulatedValueSource:
    | "none"
    | "username_reference"
    | "password_reference"
    | "static_safe_signal";
  containsCredentialMaterial: false;
  realBrowserAction: false;
  expectedResult: string;
  actualMockResult: string;
  blockedReason: string;
};

export type AvanzaLoginMockPageExecutorInput = {
  mode?: AvanzaLoginMockPageExecutorMode;
  mockExecutorEnabled?: boolean;
  loginActionContract?: unknown;
  dryRunReport?: unknown;
  initialMockPageState?: unknown;
  executionSettingsProfile?: unknown;
  credentialProviderState?: unknown;
  now?: string;
  reportId?: string;
};

export type AvanzaLoginMockExecutorReport =
  AvanzaLoginMockExecutorSafetyFlags & {
    reportId: string;
    createdAt: string;
    mode: AvanzaLoginMockPageExecutorMode;
    status: AvanzaLoginMockPageExecutorStatus;
    label: string;
    reason: string;
    initialPageStateKind: AvanzaLoginMockPageStateKind;
    finalPageStateKind: AvanzaLoginMockPageStateKind;
    actionReports: AvanzaLoginMockActionReport[];
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaLoginMockExecutorSafetyFlags;
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

function statusField(source: unknown) {
  return textField(source, "status");
}

function customerTypeField(source: unknown) {
  const value = textField(source, "customerType");

  return value === "private" || value === "company" ? value : "unknown";
}

function pageKind(source: unknown): AvanzaLoginMockPageStateKind {
  const value = textField(source, "kind");

  switch (value) {
    case "initial_login_choice":
    case "private_username_password_form":
    case "company_username_password_form":
    case "bankid_or_mfa":
    case "logged_in_home":
      return value;
    default:
      return "unknown";
  }
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

function actionsFromContract(contract: unknown) {
  return isRecord(contract) && Array.isArray(contract.actions)
    ? contract.actions
    : [];
}

function createMockPageState(
  kind: AvanzaLoginMockPageStateKind,
  customerType: AvanzaLoginMockPageState["customerType"] = "unknown",
  stateId: string = kind,
): AvanzaLoginMockPageState {
  const isInitial = kind === "initial_login_choice";
  const isPrivate = kind === "private_username_password_form";
  const isCompany = kind === "company_username_password_form";
  const isBankId = kind === "bankid_or_mfa";
  const isLoggedIn = kind === "logged_in_home";

  return {
    stateId,
    kind,
    customerType:
      customerType !== "unknown"
        ? customerType
        : isPrivate
          ? "private"
          : isCompany
            ? "company"
            : "unknown",
    usernamePasswordMethodVisible: isInitial,
    privateToggleVisible: isInitial,
    companyToggleVisible: isInitial,
    usernameFieldVisible: isPrivate || isCompany,
    passwordFieldVisible: isPrivate || isCompany,
    loginSubmitVisible: isPrivate || isCompany,
    bankIdVisible: isBankId,
    loggedInLikely: isLoggedIn,
    visibleTexts: isLoggedIn
      ? ["Avanza mock logged in home"]
      : isBankId
        ? ["BankID manual boundary"]
        : isInitial
          ? ["Användarnamn och lösenord", "Privat", "Företag"]
          : ["Username field reference", "Password field reference", "Logga in"],
    formLabels:
      isPrivate || isCompany
        ? ["Username reference field", "Password reference field"]
        : [],
    buttonTexts: isLoggedIn
      ? []
      : isBankId
        ? ["Manual BankID boundary"]
        : isInitial
          ? ["Användarnamn och lösenord", "Privat", "Företag"]
          : ["Logga in"],
    warnings: [],
    blockedReasons: [],
  };
}

function normalizeMockPageState(source: unknown): AvanzaLoginMockPageState {
  const kind = pageKind(source);
  const fallback = createMockPageState(
    kind,
    customerTypeField(source),
    textField(source, "stateId") ?? kind,
  );

  if (!isRecord(source)) return fallback;

  return {
    ...fallback,
    usernamePasswordMethodVisible:
      typeof source.usernamePasswordMethodVisible === "boolean"
        ? source.usernamePasswordMethodVisible
        : fallback.usernamePasswordMethodVisible,
    privateToggleVisible:
      typeof source.privateToggleVisible === "boolean"
        ? source.privateToggleVisible
        : fallback.privateToggleVisible,
    companyToggleVisible:
      typeof source.companyToggleVisible === "boolean"
        ? source.companyToggleVisible
        : fallback.companyToggleVisible,
    usernameFieldVisible:
      typeof source.usernameFieldVisible === "boolean"
        ? source.usernameFieldVisible
        : fallback.usernameFieldVisible,
    passwordFieldVisible:
      typeof source.passwordFieldVisible === "boolean"
        ? source.passwordFieldVisible
        : fallback.passwordFieldVisible,
    loginSubmitVisible:
      typeof source.loginSubmitVisible === "boolean"
        ? source.loginSubmitVisible
        : fallback.loginSubmitVisible,
    bankIdVisible:
      typeof source.bankIdVisible === "boolean"
        ? source.bankIdVisible
        : fallback.bankIdVisible,
    loggedInLikely:
      typeof source.loggedInLikely === "boolean"
        ? source.loggedInLikely
        : fallback.loggedInLikely,
    visibleTexts: safeStringArray(source.visibleTexts),
    formLabels: safeStringArray(source.formLabels),
    buttonTexts: safeStringArray(source.buttonTexts),
    warnings: safeStringArray(source.warnings),
    blockedReasons: safeStringArray(source.blockedReasons),
  };
}

function collectWarnings(
  input: AvanzaLoginMockPageExecutorInput,
  initialPage: AvanzaLoginMockPageState,
) {
  return [
    ...initialPage.warnings,
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

function collectBlockedReasons(
  input: AvanzaLoginMockPageExecutorInput,
  initialPage: AvanzaLoginMockPageState,
) {
  return [
    ...initialPage.blockedReasons,
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

function simulatedValueSource(sourceAction: unknown) {
  const valueSource = textField(sourceAction, "valueSource");

  if (valueSource === "username_from_secure_provider") {
    return "username_reference" as const;
  }

  if (valueSource === "password_from_secure_provider") {
    return "password_reference" as const;
  }

  if (valueSource === "static_safe_signal") {
    return "static_safe_signal" as const;
  }

  return "none" as const;
}

function baseActionReport(
  sourceAction: unknown,
  executionStatus: AvanzaLoginMockActionExecutionStatus,
  actualMockResult: string,
  blockedReason = "none",
): AvanzaLoginMockActionReport {
  return {
    actionId: textField(sourceAction, "actionId") ?? "unknown-action",
    actionType: textField(sourceAction, "type") ?? "unknown",
    label: textField(sourceAction, "label") ?? "Unknown mock action",
    executionStatus,
    simulatedTargetText: textField(sourceAction, "targetSignalText") ?? "none",
    simulatedValueSource: simulatedValueSource(sourceAction),
    containsCredentialMaterial: false,
    realBrowserAction: false,
    expectedResult:
      textField(sourceAction, "expectedResult") ??
      "No real browser result is produced.",
    actualMockResult,
    blockedReason,
  };
}

function noOpReport(
  executionStatus: AvanzaLoginMockActionExecutionStatus,
  actualMockResult: string,
  blockedReason = "none",
): AvanzaLoginMockActionReport {
  return {
    actionId: "no-op",
    actionType: "no_op",
    label: "No login action",
    executionStatus,
    simulatedTargetText: "none",
    simulatedValueSource: "none",
    containsCredentialMaterial: false,
    realBrowserAction: false,
    expectedResult: "No mock login action is needed.",
    actualMockResult,
    blockedReason,
  };
}

function formStateForCustomer(
  customerType: AvanzaLoginMockPageState["customerType"],
) {
  return createMockPageState(
    customerType === "company"
      ? "company_username_password_form"
      : "private_username_password_form",
    customerType === "company" ? "company" : "private",
  );
}

function executeMockAction(
  page: AvanzaLoginMockPageState,
  action: unknown,
  contractCustomerType: AvanzaLoginMockPageState["customerType"],
) {
  const type = textField(action, "type");

  if (page.kind === "bankid_or_mfa" || page.bankIdVisible) {
    return {
      page,
      report: baseActionReport(
        action,
        "blocked_bankid_or_mfa",
        "Mock execution stopped at BankID/MFA boundary.",
        "BankID/MFA requires manual user action.",
      ),
    };
  }

  if (type === "no_op") {
    const finalPage = createMockPageState("logged_in_home", contractCustomerType);

    return {
      page: finalPage,
      report: baseActionReport(
        action,
        "skipped",
        "Mock page is already logged in.",
      ),
    };
  }

  if (
    type === "click_username_password_method" ||
    type === "click_private_toggle"
  ) {
    const finalPage = formStateForCustomer(
      contractCustomerType === "company" ? "company" : "private",
    );

    return {
      page: finalPage,
      report: baseActionReport(
        action,
        "simulated",
        "Mock page now exposes username/password reference fields.",
      ),
    };
  }

  if (type === "click_company_toggle") {
    const finalPage = formStateForCustomer("company");

    return {
      page: finalPage,
      report: baseActionReport(
        action,
        "simulated",
        "Mock page now exposes company username/password reference fields.",
      ),
    };
  }

  if (type === "fill_username") {
    const visible = page.usernameFieldVisible;

    return {
      page,
      report: baseActionReport(
        action,
        visible ? "simulated" : "blocked",
        visible
          ? "Mock username reference accepted without credential material."
          : "Mock username field is not visible.",
        visible ? "none" : "Mock username field is not visible.",
      ),
    };
  }

  if (type === "fill_password") {
    const visible = page.passwordFieldVisible;

    return {
      page,
      report: baseActionReport(
        action,
        visible ? "simulated" : "blocked",
        visible
          ? "Mock password reference accepted without credential material."
          : "Mock password field is not visible.",
        visible ? "none" : "Mock password field is not visible.",
      ),
    };
  }

  if (type === "click_login_submit") {
    const visible = page.loginSubmitVisible;
    const finalPage = visible
      ? createMockPageState("logged_in_home", page.customerType)
      : page;

    return {
      page: finalPage,
      report: baseActionReport(
        action,
        visible ? "simulated" : "blocked",
        visible
          ? "Mock login submit completed and mock logged-in home is visible."
          : "Mock login submit is not visible.",
        visible ? "none" : "Mock login submit is not visible.",
      ),
    };
  }

  if (type === "stop_for_bankid_or_mfa") {
    return {
      page: createMockPageState("bankid_or_mfa", page.customerType),
      report: baseActionReport(
        action,
        "blocked_bankid_or_mfa",
        "Mock execution stopped at BankID/MFA boundary.",
        "BankID/MFA requires manual user action.",
      ),
    };
  }

  return {
    page,
    report: baseActionReport(
      action,
      "blocked",
      "Mock executor does not recognize this action type.",
      "Unknown action type.",
    ),
  };
}

function safetyFlags(
  input: AvanzaLoginMockPageExecutorInput,
  status: AvanzaLoginMockPageExecutorStatus,
): AvanzaLoginMockExecutorSafetyFlags {
  const enabled =
    input.mode === "mock_local_dev" && input.mockExecutorEnabled === true;

  return {
    mockExecutorEnabled: enabled,
    mockOnly: true,
    canExecuteMockActions: enabled && status === "mock_executed",
    canExecuteRealBrowserActions: false,
    canReadCredentialMaterial: false,
    canReturnCredentialMaterial: false,
    canLogCredentialMaterial: false,
    canFillUsernameReal: false,
    canFillPasswordReal: false,
    canClickReal: false,
    canClickLoginSubmitReal: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    canReadCookies: false,
    canExportSession: false,
    canNavigateRealBrowser: false,
    canSubmitOrder: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function labelFor(status: AvanzaLoginMockPageExecutorStatus) {
  switch (status) {
    case "disabled":
      return "Login mock page executor disabled";
    case "mock_ready":
      return "Login mock page executor ready";
    case "mock_executed":
      return "Login mock page executor simulated actions";
    case "mock_blocked":
      return "Login mock page executor blocked";
    case "mock_bankid_or_mfa_stop":
      return "Login mock page executor stopped for BankID or MFA";
    case "mock_missing_credentials":
      return "Login mock page executor missing credentials";
    case "mock_error":
      return "Login mock page executor error";
    case "unknown":
      return "Login mock page executor unknown";
  }
}

function reasonFor(status: AvanzaLoginMockPageExecutorStatus) {
  switch (status) {
    case "disabled":
      return "Mock login executor is disabled.";
    case "mock_ready":
      return "Mock login executor inputs are ready for simulated page execution.";
    case "mock_executed":
      return "Login action contract was simulated against mock page state only.";
    case "mock_blocked":
      return "Mock login executor is blocked by contract, page, or dry-run input.";
    case "mock_bankid_or_mfa_stop":
      return "BankID or MFA appears in the mock page and requires manual user action.";
    case "mock_missing_credentials":
      return "Mock login executor requires credential references but provider readiness is missing.";
    case "mock_error":
      return "Mock login executor received an error input.";
    case "unknown":
      return "Inputs are insufficient for safe mock login execution.";
  }
}

function decision(
  input: AvanzaLoginMockPageExecutorInput,
  initialPage: AvanzaLoginMockPageState,
) {
  const contractStatus = statusField(input.loginActionContract);
  const dryRunStatus = statusField(input.dryRunReport);
  const actions = actionsFromContract(input.loginActionContract);
  const blockedReasons = collectBlockedReasons(input, initialPage);
  const contractCustomerType = customerTypeField(input.loginActionContract);

  if (input.mode === "disabled" || input.mockExecutorEnabled !== true) {
    return {
      status: "disabled" as const,
      finalPage: initialPage,
      actionReports: [
        noOpReport("skipped", "Mock executor disabled.", "Mock executor disabled."),
      ],
      blockedReasons,
    };
  }

  if (initialPage.kind === "bankid_or_mfa" || initialPage.bankIdVisible) {
    return {
      status: "mock_bankid_or_mfa_stop" as const,
      finalPage: initialPage,
      actionReports: [
        noOpReport(
          "blocked_bankid_or_mfa",
          "Mock execution stopped at BankID/MFA boundary.",
          "BankID/MFA requires manual user action.",
        ),
      ],
      blockedReasons:
        blockedReasons.length > 0
          ? blockedReasons
          : ["BankID/MFA requires manual user action."],
    };
  }

  if (contractStatus === "error" || dryRunStatus === "dry_run_error") {
    return {
      status: "mock_error" as const,
      finalPage: initialPage,
      actionReports:
        actions.length > 0
          ? actions.map((action) =>
              baseActionReport(action, "error", "Mock execution received error input.", "Error input."),
            )
          : [noOpReport("error", "Mock execution received error input.", "Error input.")],
      blockedReasons:
        blockedReasons.length > 0 ? blockedReasons : ["Error input."],
    };
  }

  if (
    contractStatus === "blocked" ||
    dryRunStatus === "dry_run_blocked" ||
    blockedReasons.length > 0
  ) {
    return {
      status: "mock_blocked" as const,
      finalPage: initialPage,
      actionReports:
        actions.length > 0
          ? actions.map((action) =>
              baseActionReport(action, "blocked", "Mock execution is blocked.", "Blocked input."),
            )
          : [noOpReport("blocked", "Mock execution is blocked.", "Blocked input.")],
      blockedReasons:
        blockedReasons.length > 0 ? blockedReasons : ["Blocked input."],
    };
  }

  if (
    contractStatus === "bankid_or_mfa_manual_action_required" ||
    dryRunStatus === "dry_run_bankid_or_mfa_stop"
  ) {
    return {
      status: "mock_bankid_or_mfa_stop" as const,
      finalPage: createMockPageState("bankid_or_mfa", contractCustomerType),
      actionReports:
        actions.length > 0
          ? actions.map((action) =>
              baseActionReport(
                action,
                "blocked_bankid_or_mfa",
                "Mock execution stopped at BankID/MFA boundary.",
                "BankID/MFA requires manual user action.",
              ),
            )
          : [
              noOpReport(
                "blocked_bankid_or_mfa",
                "Mock execution stopped at BankID/MFA boundary.",
                "BankID/MFA requires manual user action.",
              ),
            ],
      blockedReasons:
        blockedReasons.length > 0
          ? blockedReasons
          : ["BankID/MFA requires manual user action."],
    };
  }

  if (
    contractStatus === "waiting_for_credentials" ||
    dryRunStatus === "dry_run_missing_credentials" ||
    !credentialProviderReady(input.credentialProviderState)
  ) {
    return {
      status: "mock_missing_credentials" as const,
      finalPage: initialPage,
      actionReports:
        actions.length > 0
          ? actions.map((action) =>
              baseActionReport(
                action,
                "blocked_missing_credentials",
                "Mock credential references are unavailable.",
                "Secure credential provider readiness is missing.",
              ),
            )
          : [
              noOpReport(
                "blocked_missing_credentials",
                "Mock credential references are unavailable.",
                "Secure credential provider readiness is missing.",
              ),
            ],
      blockedReasons:
        blockedReasons.length > 0
          ? blockedReasons
          : ["Secure credential provider readiness is missing."],
    };
  }

  if (contractStatus === "no_action_needed" || initialPage.loggedInLikely) {
    const finalPage = createMockPageState("logged_in_home", contractCustomerType);

    return {
      status: "mock_executed" as const,
      finalPage,
      actionReports:
        actions.length > 0
          ? actions.map((action) =>
              baseActionReport(action, "skipped", "Mock page is already logged in."),
            )
          : [noOpReport("skipped", "Mock page is already logged in.")],
      blockedReasons,
    };
  }

  if (contractStatus === "action_plan_ready") {
    let page = initialPage;
    const reports: AvanzaLoginMockActionReport[] = [];

    for (const action of actions) {
      const result = executeMockAction(page, action, contractCustomerType);
      page = result.page;
      reports.push(result.report);

      if (
        result.report.executionStatus !== "simulated" &&
        result.report.executionStatus !== "skipped"
      ) {
        return {
          status: "mock_blocked" as const,
          finalPage: page,
          actionReports: reports,
          blockedReasons:
            blockedReasons.length > 0
              ? blockedReasons
              : [result.report.blockedReason],
        };
      }
    }

    return {
      status: "mock_executed" as const,
      finalPage: page,
      actionReports: reports,
      blockedReasons,
    };
  }

  return {
    status: "unknown" as const,
    finalPage: initialPage,
    actionReports:
      actions.length > 0
        ? actions.map((action) =>
            baseActionReport(action, "blocked", "Unknown mock executor input.", "Unknown input."),
          )
        : [noOpReport("blocked", "Unknown mock executor input.", "Unknown input.")],
    blockedReasons,
  };
}

export function buildAvanzaLoginMockExecutorReport(
  input: AvanzaLoginMockPageExecutorInput = {},
): AvanzaLoginMockExecutorReport {
  const mode = input.mode ?? "disabled";
  const initialPage = normalizeMockPageState(input.initialMockPageState);
  const result = decision({ ...input, mode }, initialPage);
  const safety = safetyFlags({ ...input, mode }, result.status);

  return {
    ...safety,
    reportId: safeText(input.reportId) ?? "avanza-login-mock-page-executor",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode,
    status: result.status,
    label: labelFor(result.status),
    reason: reasonFor(result.status),
    initialPageStateKind: initialPage.kind,
    finalPageStateKind: result.finalPage.kind,
    actionReports: result.actionReports,
    warnings: collectWarnings(input, initialPage),
    blockedReasons: result.blockedReasons,
    safetyFlags: safety,
  };
}

export function createAvanzaLoginMockPageState(
  kind: AvanzaLoginMockPageStateKind,
  customerType: AvanzaLoginMockPageState["customerType"] = "unknown",
): AvanzaLoginMockPageState {
  return createMockPageState(kind, customerType);
}
