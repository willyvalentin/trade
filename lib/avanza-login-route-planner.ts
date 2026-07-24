export type AvanzaLoginRoutePlanStatus =
  | "disabled"
  | "not_needed_already_logged_in"
  | "ready_private_username_password"
  | "ready_company_username_password"
  | "requires_username_password_choice"
  | "requires_company_toggle"
  | "requires_credentials"
  | "bankid_or_mfa_manual_action_required"
  | "blocked"
  | "error"
  | "unknown";

export type AvanzaLoginRoutePlanStepType =
  | "no_op"
  | "select_private_toggle"
  | "select_company_toggle"
  | "select_username_password_method"
  | "fill_username"
  | "fill_password"
  | "submit_login"
  | "stop_for_bankid_or_mfa"
  | "stop_for_manual_user_action"
  | "stop_before_order_flow";

export type AvanzaLoginRoutePlanMode =
  | "disabled"
  | "route_model"
  | "local_dev_route_model";

export type AvanzaLoginRoutePlanSafetyFlags = {
  routePlanningEnabled: boolean;
  canPlanLoginRoute: boolean;
  canSelectPrivateToggle: false;
  canSelectCompanyToggle: false;
  canSelectUsernamePasswordMethod: false;
  canFillUsername: false;
  canFillPassword: false;
  canSubmitLogin: false;
  canHandleCredentialMaterial: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  canReadCookies: false;
  canExportSession: false;
  canNavigate: false;
  canClick: false;
  canFillForm: false;
  canSubmitOrder: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaLoginRoutePlanStep = {
  stepId: string;
  type: AvanzaLoginRoutePlanStepType;
  label: string;
  reason: string;
  targetSignalText?: string;
  expectedResult: string;
  allowedInThisTask: false;
  requiresHumanAction: boolean;
  forbidden: boolean;
};

export type AvanzaLoginRoutePlanInput = {
  mode?: AvanzaLoginRoutePlanMode;
  routePlanningEnabled?: boolean;
  executionSettingsProfile?: unknown;
  loginState?: unknown;
  pageState?: unknown;
  realWorldLoginSignals?: unknown;
  credentialProviderState?: unknown;
  now?: string;
  routePlanId?: string;
  forceError?: boolean;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaLoginRoutePlan = AvanzaLoginRoutePlanSafetyFlags & {
  routePlanId: string;
  createdAt: string;
  mode: AvanzaLoginRoutePlanMode;
  status: AvanzaLoginRoutePlanStatus;
  label: string;
  reason: string;
  customerType: "private" | "company" | "unknown";
  loginMethod: "username_password" | "bankid_forbidden" | "unknown";
  steps: AvanzaLoginRoutePlanStep[];
  nextExpectedPageState: string;
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaLoginRoutePlanSafetyFlags;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid\s*qr\s*data|broker\s*secret|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token/i;

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

function customerTypeFromProfile(source: unknown): AvanzaLoginRoutePlan["customerType"] {
  const value = textField(source, "customerType");

  return value === "private" || value === "company" ? value : "unknown";
}

function loginMethodFromProfile(source: unknown): AvanzaLoginRoutePlan["loginMethod"] {
  const value = textField(source, "loginMethod");

  if (value === "username_password" || value === "bankid_forbidden") {
    return value;
  }

  return "unknown";
}

function allSignalText(...sources: unknown[]) {
  const values: string[] = [];

  for (const source of sources) {
    if (!isRecord(source)) continue;

    for (const key of [
      "visibleTexts",
      "toggleLabels",
      "buttonTexts",
      "formLabels",
      "inputLabels",
      "secondaryActions",
      "observedTextSignals",
      "observedFormSignals",
      "observedButtonSignals",
      "observedInputSignals",
    ]) {
      values.push(...safeStringArray(source[key]));
    }

    for (const key of ["label", "reason", "flowKind", "status"]) {
      const text = safeText(source[key]);

      if (text) values.push(text);
    }
  }

  return values.join(" ").toLowerCase();
}

function hasBankIdOrMfa(input: AvanzaLoginRoutePlanInput, signals: string) {
  return (
    booleanField(input.realWorldLoginSignals, "bankIdOptionsDetected") ||
    booleanField(input.loginState, "mfaOrBankIdLikely") ||
    booleanField(input.pageState, "isBankIdOrMfaLikely") ||
    /bankid|bank id|mfa|visa qr-kod|visa qr kod|[öo]ppna bankid p[åa] samma enhet/.test(
      signals,
    ) ||
    statusField(input.loginState) === "mfa_or_bankid_required" ||
    statusField(input.loginState) === "manual_user_action_required" ||
    statusField(input.pageState) === "avanza_bankid_or_mfa"
  );
}

function hasUsernamePasswordOption(input: AvanzaLoginRoutePlanInput, signals: string) {
  return (
    booleanField(input.realWorldLoginSignals, "usernamePasswordOptionDetected") ||
    booleanField(input.loginState, "usernamePasswordLoginPossible") ||
    /anv[aä]ndarnamn och l[oö]senord/.test(signals)
  );
}

function explicitFieldSignalText(input: AvanzaLoginRoutePlanInput) {
  const values: string[] = [];

  for (const source of [
    input.realWorldLoginSignals,
    input.loginState,
    input.pageState,
  ]) {
    if (!isRecord(source)) continue;

    for (const key of [
      "formLabels",
      "inputLabels",
      "observedFormSignals",
      "observedInputSignals",
    ]) {
      values.push(...safeStringArray(source[key]));
    }
  }

  return values.join(" ").toLowerCase();
}

function hasExplicitUsernamePasswordFields(input: AvanzaLoginRoutePlanInput) {
  const fieldSignals = explicitFieldSignalText(input);

  return /anv[aä]ndarnamn/.test(fieldSignals) && /l[oö]senord/.test(fieldSignals);
}

function hasPrivateForm(input: AvanzaLoginRoutePlanInput, signals: string) {
  return (
    /privatkund|privat/.test(signals) &&
    hasExplicitUsernamePasswordFields(input)
  );
}

function hasCompanyForm(input: AvanzaLoginRoutePlanInput, signals: string) {
  return (
    /f[oö]retag|f[oö]retagswebben/.test(signals) &&
    hasExplicitUsernamePasswordFields(input)
  );
}

function profileHasCredentials(profile: unknown) {
  return (
    booleanField(profile, "usernameConfigured") &&
    booleanField(profile, "passwordConfigured") &&
    loginMethodFromProfile(profile) === "username_password"
  );
}

function sourceBlocks(source: unknown) {
  const status = statusField(source);

  return status === "blocked" || status === "error";
}

function collectWarnings(input: AvanzaLoginRoutePlanInput) {
  return [
    ...safeStringArray(input.warnings),
    ...safeStringArray(isRecord(input.executionSettingsProfile) ? input.executionSettingsProfile.warnings : undefined),
    ...safeStringArray(isRecord(input.loginState) ? input.loginState.warnings : undefined),
    ...safeStringArray(isRecord(input.pageState) ? input.pageState.warnings : undefined),
    ...safeStringArray(isRecord(input.realWorldLoginSignals) ? input.realWorldLoginSignals.warnings : undefined),
  ];
}

function collectBlockedReasons(input: AvanzaLoginRoutePlanInput) {
  return [
    ...safeStringArray(input.blockedReasons),
    ...safeStringArray(isRecord(input.executionSettingsProfile) ? input.executionSettingsProfile.blockedReasons : undefined),
    ...safeStringArray(isRecord(input.loginState) ? input.loginState.blockedReasons : undefined),
    ...safeStringArray(isRecord(input.pageState) ? input.pageState.blockedReasons : undefined),
    ...safeStringArray(isRecord(input.realWorldLoginSignals) ? input.realWorldLoginSignals.blockedReasons : undefined),
  ];
}

function step(
  type: AvanzaLoginRoutePlanStepType,
  label: string,
  reason: string,
  expectedResult: string,
  options: {
    targetSignalText?: string;
    requiresHumanAction?: boolean;
    forbidden?: boolean;
  } = {},
): AvanzaLoginRoutePlanStep {
  return {
    stepId: type,
    type,
    label,
    reason,
    targetSignalText: safeText(options.targetSignalText),
    expectedResult,
    allowedInThisTask: false,
    requiresHumanAction: options.requiresHumanAction ?? false,
    forbidden: options.forbidden ?? true,
  };
}

function fillUsernamePasswordSteps() {
  return [
    step(
      "fill_username",
      "Plan username field",
      "Username field can be planned from settings metadata only; no username value is read.",
      "Username field would be ready for a future guarded local-only fill.",
      { targetSignalText: "Användarnamn" },
    ),
    step(
      "fill_password",
      "Plan password field",
      "Password field can be planned from settings metadata only; no password material is read.",
      "Password field would be ready for a future guarded local-only fill.",
      { targetSignalText: "Lösenord" },
    ),
    step(
      "submit_login",
      "Plan login submit",
      "Submit is planned but remains non-executable in this task.",
      "A future guarded flow would stop before any order flow.",
      { targetSignalText: "Logga in" },
    ),
    step(
      "stop_before_order_flow",
      "Stop before order flow",
      "The route planner never proceeds into order flow.",
      "Final human confirmation remains required.",
      { requiresHumanAction: true },
    ),
  ];
}

function labelFor(status: AvanzaLoginRoutePlanStatus) {
  switch (status) {
    case "disabled":
      return "Login route planner disabled";
    case "not_needed_already_logged_in":
      return "Login route not needed";
    case "ready_private_username_password":
      return "Private username/password route planned";
    case "ready_company_username_password":
      return "Company username/password route planned";
    case "requires_username_password_choice":
      return "Username/password choice required";
    case "requires_company_toggle":
      return "Company toggle required";
    case "requires_credentials":
      return "Credentials metadata required";
    case "bankid_or_mfa_manual_action_required":
      return "BankID or MFA manual action required";
    case "blocked":
      return "Login route planner blocked";
    case "error":
      return "Login route planner error";
    case "unknown":
      return "Login route planner unknown";
  }
}

function reasonFor(status: AvanzaLoginRoutePlanStatus) {
  switch (status) {
    case "disabled":
      return "Login route planning is disabled.";
    case "not_needed_already_logged_in":
      return "Explicit signals indicate the user is already logged in.";
    case "ready_private_username_password":
      return "Private username/password form is visible and credentials metadata is configured.";
    case "ready_company_username_password":
      return "Company username/password form is visible and credentials metadata is configured.";
    case "requires_username_password_choice":
      return "The username/password method must be selected before field planning.";
    case "requires_company_toggle":
      return "The company login route requires selecting Företag before field planning.";
    case "requires_credentials":
      return "Ture Settings profile is missing username/password readiness metadata.";
    case "bankid_or_mfa_manual_action_required":
      return "BankID or MFA was detected; automation stops for manual user action.";
    case "blocked":
      return "The route planner is blocked by explicit safety input.";
    case "error":
      return "The route planner received an error input.";
    case "unknown":
      return "Inputs are insufficient to choose a safe login route.";
  }
}

function safetyFlags(
  input: AvanzaLoginRoutePlanInput,
  status: AvanzaLoginRoutePlanStatus,
): AvanzaLoginRoutePlanSafetyFlags {
  const routePlanningEnabled =
    input.routePlanningEnabled === true && input.mode !== "disabled";

  return {
    routePlanningEnabled,
    canPlanLoginRoute:
      routePlanningEnabled &&
      status !== "disabled" &&
      status !== "blocked" &&
      status !== "error",
    canSelectPrivateToggle: false,
    canSelectCompanyToggle: false,
    canSelectUsernamePasswordMethod: false,
    canFillUsername: false,
    canFillPassword: false,
    canSubmitLogin: false,
    canHandleCredentialMaterial: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    canReadCookies: false,
    canExportSession: false,
    canNavigate: false,
    canClick: false,
    canFillForm: false,
    canSubmitOrder: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function planDecision(input: AvanzaLoginRoutePlanInput) {
  const mode = input.mode ?? "disabled";
  const profile = input.executionSettingsProfile;
  const loginState = input.loginState;
  const pageState = input.pageState;
  const signals = allSignalText(loginState, pageState, input.realWorldLoginSignals);
  const customerType = customerTypeFromProfile(profile);
  const loginMethod = loginMethodFromProfile(profile);
  const blockedReasons = collectBlockedReasons(input);
  const alreadyLoggedIn =
    statusField(loginState) === "logged_in" ||
    booleanField(loginState, "loggedInLikely") ||
    booleanField(pageState, "isLoggedInLikely") ||
    statusField(pageState) === "avanza_logged_in_home" ||
    statusField(pageState) === "avanza_account_overview";

  if (input.forceError === true) {
    return {
      status: "error" as const,
      customerType,
      loginMethod,
      blockedReasons,
      steps: [
        step(
          "stop_for_manual_user_action",
          "Stop for planner error",
          "Route planner received an explicit error input.",
          "No login route is planned.",
          { requiresHumanAction: true },
        ),
      ],
      nextExpectedPageState: "manual_review_required",
    };
  }

  if (mode === "disabled" || input.routePlanningEnabled !== true) {
    return {
      status: "disabled" as const,
      customerType,
      loginMethod,
      blockedReasons,
      steps: [
        step(
          "no_op",
          "No login route planning",
          "Route planning is disabled.",
          "No action is taken.",
          { forbidden: false },
        ),
      ],
      nextExpectedPageState: "none",
    };
  }

  if (sourceBlocks(profile) || sourceBlocks(loginState) || sourceBlocks(pageState)) {
    return {
      status: "blocked" as const,
      customerType,
      loginMethod,
      blockedReasons:
        blockedReasons.length > 0
          ? blockedReasons
          : ["A required input model is blocked or errored."],
      steps: [
        step(
          "stop_for_manual_user_action",
          "Stop for blocked input",
          "A source model reported a blocked state.",
          "Manual review is required.",
          { requiresHumanAction: true },
        ),
      ],
      nextExpectedPageState: "manual_review_required",
    };
  }

  if (alreadyLoggedIn) {
    return {
      status: "not_needed_already_logged_in" as const,
      customerType,
      loginMethod,
      blockedReasons,
      steps: [
        step(
          "no_op",
          "Already logged in",
          "Explicit signals indicate login is not needed.",
          "Continue only with future guarded non-order planning.",
          { forbidden: false },
        ),
        step(
          "stop_before_order_flow",
          "Stop before order flow",
          "The route planner never proceeds into order flow.",
          "Final human confirmation remains required.",
          { requiresHumanAction: true },
        ),
      ],
      nextExpectedPageState: "logged_in_non_order_state",
    };
  }

  if (hasBankIdOrMfa(input, signals)) {
    return {
      status: "bankid_or_mfa_manual_action_required" as const,
      customerType,
      loginMethod,
      blockedReasons,
      steps: [
        step(
          "stop_for_bankid_or_mfa",
          "Stop for BankID or MFA",
          "BankID/MFA options are manual-action only and forbidden for automation.",
          "User must complete or choose a safe username/password route manually.",
          { requiresHumanAction: true },
        ),
      ],
      nextExpectedPageState: "manual_bankid_or_mfa_boundary",
    };
  }

  if (!profileHasCredentials(profile)) {
    return {
      status: "requires_credentials" as const,
      customerType,
      loginMethod,
      blockedReasons,
      steps: [
        step(
          "stop_for_manual_user_action",
          "Stop for missing credentials metadata",
          "Ture Settings must configure customer type and username/password references first.",
          "No field planning occurs.",
          { requiresHumanAction: true },
        ),
      ],
      nextExpectedPageState: "settings_required",
    };
  }

  if (customerType === "private") {
    if (hasPrivateForm(input, signals)) {
      return {
        status: "ready_private_username_password" as const,
        customerType,
        loginMethod,
        blockedReasons,
        steps: fillUsernamePasswordSteps(),
        nextExpectedPageState: "private_username_password_login_ready",
      };
    }

    if (hasUsernamePasswordOption(input, signals)) {
      return {
        status: "requires_username_password_choice" as const,
        customerType,
        loginMethod,
        blockedReasons,
        steps: [
          step(
            "select_username_password_method",
            "Plan username/password method",
            "The private route must choose the username/password option before fields are visible.",
            "Username/password form would be expected next.",
            { targetSignalText: "Användarnamn och lösenord" },
          ),
        ],
        nextExpectedPageState: "private_username_password_form",
      };
    }
  }

  if (customerType === "company") {
    if (hasCompanyForm(input, signals)) {
      return {
        status: "ready_company_username_password" as const,
        customerType,
        loginMethod,
        blockedReasons,
        steps: fillUsernamePasswordSteps(),
        nextExpectedPageState: "company_username_password_login_ready",
      };
    }

    return {
      status: "requires_company_toggle" as const,
      customerType,
      loginMethod,
      blockedReasons,
      steps: [
        step(
          "select_company_toggle",
          "Plan company toggle",
          "The company route must choose Företag before username/password fields are planned.",
          "Company username/password route would be expected next.",
          { targetSignalText: "Företag" },
        ),
        step(
          "select_username_password_method",
          "Plan username/password method",
          "Username/password remains the only supported login method.",
          "Company username/password form would be expected next.",
          { targetSignalText: "Användarnamn och lösenord" },
        ),
      ],
      nextExpectedPageState: "company_username_password_form",
    };
  }

  return {
    status: "unknown" as const,
    customerType,
    loginMethod,
    blockedReasons,
    steps: [
      step(
        "stop_for_manual_user_action",
        "Stop for unknown route",
        "Inputs are insufficient to choose private or company username/password route.",
        "Manual review is required.",
        { requiresHumanAction: true },
      ),
    ],
    nextExpectedPageState: "manual_review_required",
  };
}

export function buildAvanzaLoginRoutePlan(
  input: AvanzaLoginRoutePlanInput = {},
): AvanzaLoginRoutePlan {
  const mode = input.mode ?? "disabled";
  const decision = planDecision({ ...input, mode });
  const safety = safetyFlags({ ...input, mode }, decision.status);

  return {
    ...safety,
    routePlanId: safeText(input.routePlanId) ?? "avanza-login-route-plan",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode,
    status: decision.status,
    label: labelFor(decision.status),
    reason: reasonFor(decision.status),
    customerType: decision.customerType,
    loginMethod: decision.loginMethod,
    steps: decision.steps,
    nextExpectedPageState: decision.nextExpectedPageState,
    warnings: collectWarnings(input),
    blockedReasons: decision.blockedReasons,
    safetyFlags: safety,
  };
}
