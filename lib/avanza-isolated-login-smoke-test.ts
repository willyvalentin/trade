export type AvanzaIsolatedLoginSmokeTestStatus =
  | "disabled"
  | "not_configured"
  | "ready"
  | "dry_run_ready"
  | "smoke_test_modeled"
  | "smoke_test_passed"
  | "smoke_test_blocked"
  | "smoke_test_failed"
  | "bankid_or_mfa_stop"
  | "unsafe_environment_blocked"
  | "error"
  | "unknown";

export type AvanzaIsolatedLoginSmokeTestMode =
  | "disabled"
  | "model_only"
  | "local_dev_dry_run"
  | "local_dev_explicit_real_run";

export type AvanzaIsolatedLoginSmokeTestExpectedFlowStep =
  | "settings_profile"
  | "credential_resolution"
  | "login_route_planning"
  | "login_action_contract"
  | "playwright_page_action_binding"
  | "local_dev_login_executor"
  | "post_login_state_detection";

export type AvanzaIsolatedLoginSmokeTestConfig = {
  smokeTestId?: string;
  mode?: AvanzaIsolatedLoginSmokeTestMode;
  enabled?: boolean;
  localDevOnly?: true;
  requireExplicitEnvOptIn?: boolean;
  explicitEnvOptInPresent?: boolean;
  requireManualTerminalRun?: boolean;
  manualTerminalRunConfirmed?: boolean;
  allowRealPlaywrightPage?: boolean;
  allowCredentialRuntimeBundle?: boolean;
  allowUsernamePasswordLogin?: boolean;
  allowBankIdAutomation?: false | boolean;
  allowCookieRead?: false | boolean;
  allowSessionExport?: false | boolean;
  allowOrderSubmit?: false | boolean;
  allowFinalBuyClick?: false | boolean;
  allowFinalSellClick?: false | boolean;
  allowTradeUiWiring?: false | boolean;
  allowApiRouteWiring?: false | boolean;
  allowCiExecution?: false | boolean;
  customerType?: "private" | "company" | "unknown";
  loginMethod?: "username_password" | "bankid_or_mfa" | "unknown";
  statusOverride?: AvanzaIsolatedLoginSmokeTestStatus;
  smokeTestExecuted?: boolean;
  forceError?: boolean;
  now?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaIsolatedLoginSmokeTestEnvironmentGate = {
  isLocalDev: boolean;
  isCi: boolean;
  explicitEnvOptInPresent: boolean;
  manualTerminalRunConfirmed: boolean;
  safeToRunRealSmokeTest: boolean;
  blockedReasons: string[];
  warnings: string[];
};

export type AvanzaIsolatedLoginSmokeTestSafetyFlags = {
  smokeTestEnabled: boolean;
  localDevOnly: true;
  canRunInCi: false;
  requiresExplicitEnvOptIn: boolean;
  explicitEnvOptInPresent: boolean;
  requiresManualTerminalRun: boolean;
  manualTerminalRunConfirmed: boolean;
  canUseRealPlaywrightPage: boolean;
  canUseCredentialRuntimeBundle: boolean;
  canUseUsernamePasswordLogin: boolean;
  canAutomateBankId: false;
  canBypassBankId: false;
  canReadCookies: false;
  canExportSession: false;
  canSubmitOrder: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canWireTradeUi: false;
  canWireApiRoute: false;
  credentialValuesVisibleInReports: false;
  canLogCredentialMaterial: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaIsolatedLoginSmokeTestPlan =
  AvanzaIsolatedLoginSmokeTestSafetyFlags & {
    smokeTestId: string;
    createdAt: string;
    mode: AvanzaIsolatedLoginSmokeTestMode;
    status: AvanzaIsolatedLoginSmokeTestStatus;
    label: string;
    reason: string;
    expectedFlow: AvanzaIsolatedLoginSmokeTestExpectedFlowStep[];
    customerType: "private" | "company" | "unknown";
    loginMethod: "username_password" | "bankid_or_mfa" | "unknown";
    environmentGate: AvanzaIsolatedLoginSmokeTestEnvironmentGate;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaIsolatedLoginSmokeTestSafetyFlags;
  };

export type AvanzaIsolatedLoginSmokeTestReport =
  AvanzaIsolatedLoginSmokeTestSafetyFlags & {
    reportId: string;
    createdAt: string;
    status: AvanzaIsolatedLoginSmokeTestStatus;
    label: string;
    reason: string;
    smokeTestExecuted: boolean;
    realPlaywrightPageUsed: boolean;
    credentialRuntimeBundleUsed: boolean;
    usernameUsed: boolean;
    passwordUsed: boolean;
    credentialMaterialReturnedToUi: false;
    credentialMaterialLogged: false;
    credentialMaterialStoredInSupabase: false;
    credentialMaterialStoredInLocalStorage: false;
    cookiesRead: false;
    sessionExported: false;
    orderSubmitted: false;
    finalBuySellClicked: false;
    bankIdAutomated: false;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaIsolatedLoginSmokeTestSafetyFlags;
  };

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";

const expectedFlow: AvanzaIsolatedLoginSmokeTestExpectedFlowStep[] = [
  "settings_profile",
  "credential_resolution",
  "login_route_planning",
  "login_action_contract",
  "playwright_page_action_binding",
  "local_dev_login_executor",
  "post_login_state_detection",
];

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

function normalizeMode(
  mode: AvanzaIsolatedLoginSmokeTestConfig["mode"],
): AvanzaIsolatedLoginSmokeTestMode {
  if (
    mode === "model_only" ||
    mode === "local_dev_dry_run" ||
    mode === "local_dev_explicit_real_run"
  ) {
    return mode;
  }

  return "disabled";
}

function createSafetyFlags(config: RequiredConfig) {
  const canUseRealPlaywrightPage =
    config.enabled &&
    config.mode === "local_dev_explicit_real_run" &&
    config.allowRealPlaywrightPage === true;
  const canUseCredentialRuntimeBundle =
    config.enabled && config.allowCredentialRuntimeBundle === true;
  const canUseUsernamePasswordLogin =
    config.enabled && config.allowUsernamePasswordLogin === true;

  return {
    smokeTestEnabled: config.enabled,
    localDevOnly: true,
    canRunInCi: false,
    requiresExplicitEnvOptIn: config.requireExplicitEnvOptIn,
    explicitEnvOptInPresent: config.explicitEnvOptInPresent,
    requiresManualTerminalRun: config.requireManualTerminalRun,
    manualTerminalRunConfirmed: config.manualTerminalRunConfirmed,
    canUseRealPlaywrightPage,
    canUseCredentialRuntimeBundle,
    canUseUsernamePasswordLogin,
    canAutomateBankId: false,
    canBypassBankId: false,
    canReadCookies: false,
    canExportSession: false,
    canSubmitOrder: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canWireTradeUi: false,
    canWireApiRoute: false,
    credentialValuesVisibleInReports: false,
    canLogCredentialMaterial: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  } satisfies AvanzaIsolatedLoginSmokeTestSafetyFlags;
}

type RequiredConfig = {
  smokeTestId: string;
  mode: AvanzaIsolatedLoginSmokeTestMode;
  enabled: boolean;
  localDevOnly: true;
  requireExplicitEnvOptIn: boolean;
  explicitEnvOptInPresent: boolean;
  requireManualTerminalRun: boolean;
  manualTerminalRunConfirmed: boolean;
  allowRealPlaywrightPage: boolean;
  allowCredentialRuntimeBundle: boolean;
  allowUsernamePasswordLogin: boolean;
  allowBankIdAutomation: boolean;
  allowCookieRead: boolean;
  allowSessionExport: boolean;
  allowOrderSubmit: boolean;
  allowFinalBuyClick: boolean;
  allowFinalSellClick: boolean;
  allowTradeUiWiring: boolean;
  allowApiRouteWiring: boolean;
  allowCiExecution: boolean;
  customerType: "private" | "company" | "unknown";
  loginMethod: "username_password" | "bankid_or_mfa" | "unknown";
  statusOverride?: AvanzaIsolatedLoginSmokeTestStatus;
  smokeTestExecuted: boolean;
  forceError: boolean;
  now: string;
  warnings: readonly string[];
  blockedReasons: readonly string[];
};

function normalizeConfig(
  config: AvanzaIsolatedLoginSmokeTestConfig = {},
): RequiredConfig {
  return {
    smokeTestId:
      safeText(config.smokeTestId) ?? "avanza-isolated-login-smoke-test",
    mode: normalizeMode(config.mode),
    enabled: config.enabled === true,
    localDevOnly: true,
    requireExplicitEnvOptIn: config.requireExplicitEnvOptIn !== false,
    explicitEnvOptInPresent: config.explicitEnvOptInPresent === true,
    requireManualTerminalRun: config.requireManualTerminalRun !== false,
    manualTerminalRunConfirmed: config.manualTerminalRunConfirmed === true,
    allowRealPlaywrightPage: config.allowRealPlaywrightPage === true,
    allowCredentialRuntimeBundle:
      config.allowCredentialRuntimeBundle === true,
    allowUsernamePasswordLogin: config.allowUsernamePasswordLogin === true,
    allowBankIdAutomation: config.allowBankIdAutomation === true,
    allowCookieRead: config.allowCookieRead === true,
    allowSessionExport: config.allowSessionExport === true,
    allowOrderSubmit: config.allowOrderSubmit === true,
    allowFinalBuyClick: config.allowFinalBuyClick === true,
    allowFinalSellClick: config.allowFinalSellClick === true,
    allowTradeUiWiring: config.allowTradeUiWiring === true,
    allowApiRouteWiring: config.allowApiRouteWiring === true,
    allowCiExecution: config.allowCiExecution === true,
    customerType:
      config.customerType === "private" || config.customerType === "company"
        ? config.customerType
        : "unknown",
    loginMethod:
      config.loginMethod === "username_password" ||
      config.loginMethod === "bankid_or_mfa"
        ? config.loginMethod
        : "unknown",
    statusOverride: config.statusOverride,
    smokeTestExecuted: config.smokeTestExecuted === true,
    forceError: config.forceError === true,
    now: safeText(config.now) ?? defaultCreatedAt,
    warnings: config.warnings ?? [],
    blockedReasons: config.blockedReasons ?? [],
  };
}

function buildEnvironmentGate(
  config: RequiredConfig,
  input: Partial<AvanzaIsolatedLoginSmokeTestEnvironmentGate> = {},
): AvanzaIsolatedLoginSmokeTestEnvironmentGate {
  const isCi = input.isCi === true;
  const isLocalDev = input.isLocalDev === true;
  const explicitEnvOptInPresent =
    input.explicitEnvOptInPresent ?? config.explicitEnvOptInPresent;
  const manualTerminalRunConfirmed =
    input.manualTerminalRunConfirmed ?? config.manualTerminalRunConfirmed;
  const warnings = safeStringArray(input.warnings);
  const blockedReasons = [
    ...safeStringArray(input.blockedReasons),
    ...(isCi ? ["CI environment is blocked."] : []),
    ...(!isLocalDev && config.mode === "local_dev_explicit_real_run"
      ? ["Local-dev environment is required."]
      : []),
    ...(config.requireExplicitEnvOptIn && !explicitEnvOptInPresent
      ? ["Explicit environment opt-in is missing."]
      : []),
    ...(config.requireManualTerminalRun && !manualTerminalRunConfirmed
      ? ["Manual terminal run confirmation is missing."]
      : []),
  ];
  const safeToRunRealSmokeTest =
    isLocalDev &&
    !isCi &&
    explicitEnvOptInPresent &&
    manualTerminalRunConfirmed;

  return {
    isLocalDev,
    isCi,
    explicitEnvOptInPresent,
    manualTerminalRunConfirmed,
    safeToRunRealSmokeTest,
    blockedReasons,
    warnings,
  };
}

function deriveStatus(
  config: RequiredConfig,
  environmentGate: AvanzaIsolatedLoginSmokeTestEnvironmentGate,
): AvanzaIsolatedLoginSmokeTestStatus {
  if (config.statusOverride) return config.statusOverride;
  if (config.forceError) return "error";
  if (!config.enabled || config.mode === "disabled") return "disabled";
  if (environmentGate.isCi || config.allowCiExecution) {
    return "unsafe_environment_blocked";
  }
  if (config.loginMethod === "bankid_or_mfa" || config.allowBankIdAutomation) {
    return "bankid_or_mfa_stop";
  }
  if (
    config.allowCookieRead ||
    config.allowSessionExport ||
    config.allowOrderSubmit ||
    config.allowFinalBuyClick ||
    config.allowFinalSellClick ||
    config.allowTradeUiWiring ||
    config.allowApiRouteWiring
  ) {
    return "smoke_test_blocked";
  }
  if (
    (config.requireExplicitEnvOptIn &&
      !environmentGate.explicitEnvOptInPresent) ||
    (config.requireManualTerminalRun &&
      !environmentGate.manualTerminalRunConfirmed)
  ) {
    return "not_configured";
  }
  if (config.mode === "model_only") return "smoke_test_modeled";
  if (config.mode === "local_dev_dry_run") return "dry_run_ready";
  if (config.mode === "local_dev_explicit_real_run") {
    if (
      environmentGate.safeToRunRealSmokeTest &&
      config.localDevOnly &&
      config.allowRealPlaywrightPage &&
      config.allowCredentialRuntimeBundle &&
      config.allowUsernamePasswordLogin
    ) {
      return "ready";
    }

    return "smoke_test_blocked";
  }

  return "unknown";
}

function describeStatus(status: AvanzaIsolatedLoginSmokeTestStatus) {
  switch (status) {
    case "disabled":
      return {
        label: "Disabled",
        reason: "The isolated login smoke test is disabled by default.",
      };
    case "not_configured":
      return {
        label: "Not configured",
        reason:
          "Required explicit local-dev opt-in or manual terminal confirmation is missing.",
      };
    case "ready":
      return {
        label: "Ready for explicit local-dev smoke test",
        reason:
          "All local-dev, manual, credential-bundle, and username/password gates are satisfied.",
      };
    case "dry_run_ready":
      return {
        label: "Dry-run ready",
        reason:
          "The smoke test can be modeled as a local-dev dry run without real login.",
      };
    case "smoke_test_modeled":
      return {
        label: "Smoke test modeled",
        reason: "The flow is represented as a model-only plan.",
      };
    case "smoke_test_passed":
      return {
        label: "Smoke test passed",
        reason: "A safe modeled report records a passed smoke-test outcome.",
      };
    case "smoke_test_blocked":
      return {
        label: "Smoke test blocked",
        reason: "One or more safety gates block the smoke test.",
      };
    case "smoke_test_failed":
      return {
        label: "Smoke test failed",
        reason: "A safe modeled report records a failed smoke-test outcome.",
      };
    case "bankid_or_mfa_stop":
      return {
        label: "BankID/MFA stop",
        reason: "BankID or MFA requires manual user action and is not automated.",
      };
    case "unsafe_environment_blocked":
      return {
        label: "Unsafe environment blocked",
        reason: "The smoke test cannot run in CI or unsafe environments.",
      };
    case "error":
      return {
        label: "Error",
        reason: "The modeled smoke test reports an error state.",
      };
    case "unknown":
    default:
      return {
        label: "Unknown",
        reason: "The modeled smoke test state is unknown.",
      };
  }
}

export function buildAvanzaIsolatedLoginSmokeTestPlan(
  configInput: AvanzaIsolatedLoginSmokeTestConfig = {},
  environmentInput: Partial<AvanzaIsolatedLoginSmokeTestEnvironmentGate> = {},
): AvanzaIsolatedLoginSmokeTestPlan {
  const config = normalizeConfig(configInput);
  const environmentGate = buildEnvironmentGate(config, environmentInput);
  const status = deriveStatus(config, environmentGate);
  const description = describeStatus(status);
  const safetyFlags = createSafetyFlags(config);
  const blockedReasons = [
    ...environmentGate.blockedReasons,
    ...safeStringArray(config.blockedReasons),
    ...(config.allowCiExecution ? ["CI execution is forbidden."] : []),
    ...(config.allowBankIdAutomation
      ? ["BankID automation is forbidden."]
      : []),
    ...(config.allowCookieRead ? ["Cookie reads are forbidden."] : []),
    ...(config.allowSessionExport ? ["Session export is forbidden."] : []),
    ...(config.allowOrderSubmit ? ["Order submission is forbidden."] : []),
    ...(config.allowFinalBuyClick || config.allowFinalSellClick
      ? ["Final buy/sell clicks are forbidden."]
      : []),
    ...(config.allowTradeUiWiring ? ["Trade UI wiring is forbidden."] : []),
    ...(config.allowApiRouteWiring ? ["API route wiring is forbidden."] : []),
  ];
  const warnings = [
    ...environmentGate.warnings,
    ...safeStringArray(config.warnings),
  ];

  return {
    ...safetyFlags,
    smokeTestId: config.smokeTestId,
    createdAt: config.now,
    mode: config.mode,
    status,
    label: description.label,
    reason: description.reason,
    expectedFlow,
    customerType: config.customerType,
    loginMethod: config.loginMethod,
    environmentGate: {
      ...environmentGate,
      blockedReasons,
      warnings,
    },
    warnings,
    blockedReasons,
    safetyFlags,
  };
}

export function buildAvanzaIsolatedLoginSmokeTestSafeReport(
  configInput: AvanzaIsolatedLoginSmokeTestConfig = {},
  environmentInput: Partial<AvanzaIsolatedLoginSmokeTestEnvironmentGate> = {},
): AvanzaIsolatedLoginSmokeTestReport {
  const plan = buildAvanzaIsolatedLoginSmokeTestPlan(
    configInput,
    environmentInput,
  );
  const realRunMode = plan.mode === "local_dev_explicit_real_run";
  const status = plan.status;
  const executed =
    configInput.smokeTestExecuted === true ||
    status === "smoke_test_passed" ||
    status === "smoke_test_failed";
  const credentialRuntimeBundleUsed =
    executed && plan.canUseCredentialRuntimeBundle;
  const usernamePasswordUsed =
    executed && plan.canUseUsernamePasswordLogin && credentialRuntimeBundleUsed;

  return {
    ...plan.safetyFlags,
    reportId: `${plan.smokeTestId}-safe-report`,
    createdAt: plan.createdAt,
    status,
    label: plan.label,
    reason: plan.reason,
    smokeTestExecuted: executed,
    realPlaywrightPageUsed: executed && realRunMode && plan.canUseRealPlaywrightPage,
    credentialRuntimeBundleUsed,
    usernameUsed: usernamePasswordUsed,
    passwordUsed: usernamePasswordUsed,
    credentialMaterialReturnedToUi: false,
    credentialMaterialLogged: false,
    credentialMaterialStoredInSupabase: false,
    credentialMaterialStoredInLocalStorage: false,
    cookiesRead: false,
    sessionExported: false,
    orderSubmitted: false,
    finalBuySellClicked: false,
    bankIdAutomated: false,
    warnings: plan.warnings,
    blockedReasons: plan.blockedReasons,
    safetyFlags: plan.safetyFlags,
  };
}
