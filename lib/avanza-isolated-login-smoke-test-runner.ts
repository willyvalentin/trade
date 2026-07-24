export type AvanzaIsolatedLoginSmokeTestRunnerStatus =
  | "disabled"
  | "not_configured"
  | "ready"
  | "dry_run_completed"
  | "modeled_run_completed"
  | "real_run_blocked"
  | "real_run_ready"
  | "real_run_completed"
  | "real_run_failed"
  | "ci_blocked"
  | "unsafe_environment_blocked"
  | "bankid_or_mfa_stop"
  | "error"
  | "unknown";

export type AvanzaIsolatedLoginSmokeTestRunnerMode =
  | "disabled"
  | "model_only"
  | "local_dev_dry_run"
  | "local_dev_explicit_real_run";

export type AvanzaIsolatedLoginSmokeTestRunnerConfig = {
  runnerId?: string;
  mode?: AvanzaIsolatedLoginSmokeTestRunnerMode;
  enabled?: boolean;
  localDevOnly?: true;
  requireExplicitEnvOptIn?: boolean;
  explicitEnvOptInPresent?: boolean;
  requireManualTerminalRun?: boolean;
  manualTerminalRunConfirmed?: boolean;
  isCi?: boolean;
  isLocalDev?: boolean;
  allowRealPlaywrightPage?: boolean;
  allowCredentialRuntimeBundle?: boolean;
  allowUsernamePasswordLogin?: boolean;
  allowNavigationToAvanzaLogin?: boolean;
  allowBankIdAutomation?: false | boolean;
  allowCookieRead?: false | boolean;
  allowSessionExport?: false | boolean;
  allowOrderSubmit?: false | boolean;
  allowFinalBuyClick?: false | boolean;
  allowFinalSellClick?: false | boolean;
  allowTradeUiWiring?: false | boolean;
  allowApiRouteWiring?: false | boolean;
  allowCiExecution?: false | boolean;
  statusOverride?: AvanzaIsolatedLoginSmokeTestRunnerStatus;
  forceError?: boolean;
  now?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaIsolatedLoginSmokeTestRunnerDependencies = {
  buildSmokeTestPlan?: () => Promise<unknown>;
  buildCredentialRuntimeBundle?: () => Promise<unknown>;
  createPageActionBinding?: () => Promise<unknown>;
  executeLogin?: () => Promise<{
    ok: boolean;
    status?: string;
    reason?: string;
    bankIdOrMfaDetected?: boolean;
    loggedInLikely?: boolean;
  }>;
  closeResources?: () => Promise<{ ok: boolean; reason?: string }>;
};

export type AvanzaIsolatedLoginSmokeTestRunnerSafetyFlags = {
  runnerEnabled: boolean;
  localDevOnly: true;
  canRunInCi: false;
  requiresExplicitEnvOptIn: boolean;
  explicitEnvOptInPresent: boolean;
  requiresManualTerminalRun: boolean;
  manualTerminalRunConfirmed: boolean;
  canUseRealPlaywrightPage: boolean;
  canUseCredentialRuntimeBundle: boolean;
  canUseUsernamePasswordLogin: boolean;
  canNavigateToAvanzaLogin: boolean;
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

export type AvanzaIsolatedLoginSmokeTestRunnerReport =
  AvanzaIsolatedLoginSmokeTestRunnerSafetyFlags & {
    reportId: string;
    createdAt: string;
    status: AvanzaIsolatedLoginSmokeTestRunnerStatus;
    label: string;
    reason: string;
    mode: AvanzaIsolatedLoginSmokeTestRunnerMode;
    smokeTestExecuted: boolean;
    realPlaywrightPageUsed: boolean;
    credentialRuntimeBundleUsed: boolean;
    usernameUsed: boolean;
    passwordUsed: boolean;
    navigationToAvanzaLoginAttempted: boolean;
    loginSubmitAttempted: boolean;
    loggedInLikely: boolean;
    bankIdOrMfaDetected: boolean;
    credentialMaterialReturnedToUi: false;
    credentialMaterialLogged: false;
    credentialMaterialStoredInSupabase: false;
    credentialMaterialStoredInLocalStorage: false;
    cookiesRead: false;
    sessionExported: false;
    orderSubmitted: false;
    finalBuySellClicked: false;
    bankIdAutomated: false;
    tradeUiWired: false;
    apiRouteWired: false;
    ciExecution: false;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaIsolatedLoginSmokeTestRunnerSafetyFlags;
  };

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";

const unsafeTextPattern =
  /account\s*id|accountid|bankid\s*qr\s*data|broker\s*secret|cookie\s*[:=]|credential\s*[:=]|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret\s*[:=]|session\s*[:=]|storage\s*[:=]|token\s*[:=]/i;

type RequiredConfig = {
  runnerId: string;
  mode: AvanzaIsolatedLoginSmokeTestRunnerMode;
  enabled: boolean;
  localDevOnly: true;
  requireExplicitEnvOptIn: boolean;
  explicitEnvOptInPresent: boolean;
  requireManualTerminalRun: boolean;
  manualTerminalRunConfirmed: boolean;
  isCi: boolean;
  isLocalDev: boolean;
  allowRealPlaywrightPage: boolean;
  allowCredentialRuntimeBundle: boolean;
  allowUsernamePasswordLogin: boolean;
  allowNavigationToAvanzaLogin: boolean;
  allowBankIdAutomation: boolean;
  allowCookieRead: boolean;
  allowSessionExport: boolean;
  allowOrderSubmit: boolean;
  allowFinalBuyClick: boolean;
  allowFinalSellClick: boolean;
  allowTradeUiWiring: boolean;
  allowApiRouteWiring: boolean;
  allowCiExecution: boolean;
  statusOverride?: AvanzaIsolatedLoginSmokeTestRunnerStatus;
  forceError: boolean;
  now: string;
  warnings: readonly string[];
  blockedReasons: readonly string[];
};

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
  mode: AvanzaIsolatedLoginSmokeTestRunnerConfig["mode"],
): AvanzaIsolatedLoginSmokeTestRunnerMode {
  if (
    mode === "model_only" ||
    mode === "local_dev_dry_run" ||
    mode === "local_dev_explicit_real_run"
  ) {
    return mode;
  }

  return "disabled";
}

function normalizeConfig(
  config: AvanzaIsolatedLoginSmokeTestRunnerConfig = {},
): RequiredConfig {
  return {
    runnerId:
      safeText(config.runnerId) ?? "avanza-isolated-login-smoke-test-runner",
    mode: normalizeMode(config.mode),
    enabled: config.enabled === true,
    localDevOnly: true,
    requireExplicitEnvOptIn: config.requireExplicitEnvOptIn !== false,
    explicitEnvOptInPresent: config.explicitEnvOptInPresent === true,
    requireManualTerminalRun: config.requireManualTerminalRun !== false,
    manualTerminalRunConfirmed: config.manualTerminalRunConfirmed === true,
    isCi: config.isCi === true,
    isLocalDev: config.isLocalDev === true,
    allowRealPlaywrightPage: config.allowRealPlaywrightPage === true,
    allowCredentialRuntimeBundle:
      config.allowCredentialRuntimeBundle === true,
    allowUsernamePasswordLogin: config.allowUsernamePasswordLogin === true,
    allowNavigationToAvanzaLogin:
      config.allowNavigationToAvanzaLogin === true,
    allowBankIdAutomation: config.allowBankIdAutomation === true,
    allowCookieRead: config.allowCookieRead === true,
    allowSessionExport: config.allowSessionExport === true,
    allowOrderSubmit: config.allowOrderSubmit === true,
    allowFinalBuyClick: config.allowFinalBuyClick === true,
    allowFinalSellClick: config.allowFinalSellClick === true,
    allowTradeUiWiring: config.allowTradeUiWiring === true,
    allowApiRouteWiring: config.allowApiRouteWiring === true,
    allowCiExecution: config.allowCiExecution === true,
    statusOverride: config.statusOverride,
    forceError: config.forceError === true,
    now: safeText(config.now) ?? defaultCreatedAt,
    warnings: config.warnings ?? [],
    blockedReasons: config.blockedReasons ?? [],
  };
}

function buildSafetyFlags(config: RequiredConfig) {
  const realRunMode = config.mode === "local_dev_explicit_real_run";

  return {
    runnerEnabled: config.enabled,
    localDevOnly: true,
    canRunInCi: false,
    requiresExplicitEnvOptIn: config.requireExplicitEnvOptIn,
    explicitEnvOptInPresent: config.explicitEnvOptInPresent,
    requiresManualTerminalRun: config.requireManualTerminalRun,
    manualTerminalRunConfirmed: config.manualTerminalRunConfirmed,
    canUseRealPlaywrightPage:
      config.enabled && realRunMode && config.allowRealPlaywrightPage,
    canUseCredentialRuntimeBundle:
      config.enabled && config.allowCredentialRuntimeBundle,
    canUseUsernamePasswordLogin:
      config.enabled && config.allowUsernamePasswordLogin,
    canNavigateToAvanzaLogin:
      config.enabled && realRunMode && config.allowNavigationToAvanzaLogin,
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
  } satisfies AvanzaIsolatedLoginSmokeTestRunnerSafetyFlags;
}

function deriveBlockedReasons(config: RequiredConfig) {
  return [
    ...safeStringArray(config.blockedReasons),
    ...(config.isCi ? ["CI execution is blocked."] : []),
    ...(!config.isLocalDev && config.mode === "local_dev_explicit_real_run"
      ? ["Local-dev environment is required."]
      : []),
    ...(config.requireExplicitEnvOptIn && !config.explicitEnvOptInPresent
      ? ["Explicit env opt-in is missing."]
      : []),
    ...(config.requireManualTerminalRun && !config.manualTerminalRunConfirmed
      ? ["Manual terminal confirmation is missing."]
      : []),
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
}

function hasUnsafeAllowFlag(config: RequiredConfig) {
  return (
    config.allowCiExecution ||
    config.allowBankIdAutomation ||
    config.allowCookieRead ||
    config.allowSessionExport ||
    config.allowOrderSubmit ||
    config.allowFinalBuyClick ||
    config.allowFinalSellClick ||
    config.allowTradeUiWiring ||
    config.allowApiRouteWiring
  );
}

function realRunReady(config: RequiredConfig) {
  return (
    config.enabled &&
    config.localDevOnly &&
    config.mode === "local_dev_explicit_real_run" &&
    config.isLocalDev &&
    !config.isCi &&
    config.explicitEnvOptInPresent &&
    config.manualTerminalRunConfirmed &&
    config.allowRealPlaywrightPage &&
    config.allowCredentialRuntimeBundle &&
    config.allowUsernamePasswordLogin &&
    config.allowNavigationToAvanzaLogin &&
    !hasUnsafeAllowFlag(config)
  );
}

function deriveStatus(
  config: RequiredConfig,
): AvanzaIsolatedLoginSmokeTestRunnerStatus {
  if (config.statusOverride) return config.statusOverride;
  if (config.forceError) return "error";
  if (!config.enabled || config.mode === "disabled") return "disabled";
  if (config.isCi) return "ci_blocked";
  if (hasUnsafeAllowFlag(config)) return "unsafe_environment_blocked";
  if (
    (config.requireExplicitEnvOptIn && !config.explicitEnvOptInPresent) ||
    (config.requireManualTerminalRun && !config.manualTerminalRunConfirmed)
  ) {
    return "not_configured";
  }
  if (config.mode === "model_only") return "modeled_run_completed";
  if (config.mode === "local_dev_dry_run") return "dry_run_completed";
  if (config.mode === "local_dev_explicit_real_run") {
    return realRunReady(config) ? "real_run_ready" : "real_run_blocked";
  }

  return "unknown";
}

function describeStatus(status: AvanzaIsolatedLoginSmokeTestRunnerStatus) {
  switch (status) {
    case "disabled":
      return {
        label: "Disabled",
        reason: "The local-dev smoke test runner is disabled by default.",
      };
    case "not_configured":
      return {
        label: "Not configured",
        reason:
          "Explicit env opt-in or manual terminal confirmation is missing.",
      };
    case "ready":
    case "real_run_ready":
      return {
        label: "Real run ready",
        reason:
          "All explicit local-dev gates are satisfied for the injected runner.",
      };
    case "dry_run_completed":
      return {
        label: "Dry-run completed",
        reason: "The runner completed a local-dev dry-run model without login.",
      };
    case "modeled_run_completed":
      return {
        label: "Modeled run completed",
        reason: "The runner completed a model-only no-op report.",
      };
    case "real_run_blocked":
      return {
        label: "Real run blocked",
        reason: "A real local-dev smoke test gate is blocked.",
      };
    case "real_run_completed":
      return {
        label: "Real run completed",
        reason:
          "Injected dependencies reported a completed local-dev smoke test.",
      };
    case "real_run_failed":
      return {
        label: "Real run failed",
        reason: "Injected dependencies reported a failed smoke test.",
      };
    case "ci_blocked":
      return {
        label: "CI blocked",
        reason: "The runner cannot execute in CI.",
      };
    case "unsafe_environment_blocked":
      return {
        label: "Unsafe environment blocked",
        reason: "A forbidden capability or unsafe environment was requested.",
      };
    case "bankid_or_mfa_stop":
      return {
        label: "BankID/MFA stop",
        reason:
          "BankID or MFA was detected and must remain manual-action only.",
      };
    case "error":
      return {
        label: "Error",
        reason: "The runner reported an error state.",
      };
    case "unknown":
    default:
      return {
        label: "Unknown",
        reason: "The runner state is unknown.",
      };
  }
}

function buildReport(
  config: RequiredConfig,
  status: AvanzaIsolatedLoginSmokeTestRunnerStatus,
  overrides: Partial<AvanzaIsolatedLoginSmokeTestRunnerReport> = {},
): AvanzaIsolatedLoginSmokeTestRunnerReport {
  const safetyFlags = buildSafetyFlags(config);
  const description = describeStatus(status);
  const blockedReasons = [
    ...deriveBlockedReasons(config),
    ...safeStringArray(overrides.blockedReasons),
  ];
  const warnings = [
    ...safeStringArray(config.warnings),
    ...safeStringArray(overrides.warnings),
  ];

  return {
    ...safetyFlags,
    reportId: `${config.runnerId}-safe-report`,
    createdAt: config.now,
    status,
    label: description.label,
    reason: safeText(overrides.reason) ?? description.reason,
    mode: config.mode,
    smokeTestExecuted: overrides.smokeTestExecuted === true,
    realPlaywrightPageUsed: overrides.realPlaywrightPageUsed === true,
    credentialRuntimeBundleUsed:
      overrides.credentialRuntimeBundleUsed === true,
    usernameUsed: overrides.usernameUsed === true,
    passwordUsed: overrides.passwordUsed === true,
    navigationToAvanzaLoginAttempted:
      overrides.navigationToAvanzaLoginAttempted === true,
    loginSubmitAttempted: overrides.loginSubmitAttempted === true,
    loggedInLikely: overrides.loggedInLikely === true,
    bankIdOrMfaDetected: overrides.bankIdOrMfaDetected === true,
    credentialMaterialReturnedToUi: false,
    credentialMaterialLogged: false,
    credentialMaterialStoredInSupabase: false,
    credentialMaterialStoredInLocalStorage: false,
    cookiesRead: false,
    sessionExported: false,
    orderSubmitted: false,
    finalBuySellClicked: false,
    bankIdAutomated: false,
    tradeUiWired: false,
    apiRouteWired: false,
    ciExecution: false,
    warnings,
    blockedReasons,
    safetyFlags,
  };
}

export function buildAvanzaIsolatedLoginSmokeTestRunnerState(
  configInput: AvanzaIsolatedLoginSmokeTestRunnerConfig = {},
): AvanzaIsolatedLoginSmokeTestRunnerReport {
  const config = normalizeConfig(configInput);
  const status = deriveStatus(config);

  return buildReport(config, status);
}

export function toAvanzaIsolatedLoginSmokeTestRunnerSafeReport(
  report: AvanzaIsolatedLoginSmokeTestRunnerReport,
): AvanzaIsolatedLoginSmokeTestRunnerReport {
  return {
    ...report,
    credentialMaterialReturnedToUi: false,
    credentialMaterialLogged: false,
    credentialMaterialStoredInSupabase: false,
    credentialMaterialStoredInLocalStorage: false,
    cookiesRead: false,
    sessionExported: false,
    orderSubmitted: false,
    finalBuySellClicked: false,
    bankIdAutomated: false,
    tradeUiWired: false,
    apiRouteWired: false,
    ciExecution: false,
    canRunInCi: false,
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
    controlsEnabled: false,
    gateLocked: true,
    safetyFlags: {
      ...report.safetyFlags,
      canRunInCi: false,
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
      controlsEnabled: false,
      gateLocked: true,
    },
  };
}

export async function runAvanzaIsolatedLoginSmokeTest(
  configInput: AvanzaIsolatedLoginSmokeTestRunnerConfig = {},
  dependencies: AvanzaIsolatedLoginSmokeTestRunnerDependencies = {},
): Promise<AvanzaIsolatedLoginSmokeTestRunnerReport> {
  const config = normalizeConfig(configInput);
  const initialStatus = deriveStatus(config);

  if (initialStatus !== "real_run_ready") {
    return buildReport(config, initialStatus);
  }

  let closeWarning: string | undefined;

  try {
    await dependencies.buildSmokeTestPlan?.();
    await dependencies.buildCredentialRuntimeBundle?.();
    await dependencies.createPageActionBinding?.();

    if (!dependencies.executeLogin) {
      return buildReport(config, "real_run_failed", {
        blockedReasons: ["Injected executeLogin dependency is missing."],
        credentialRuntimeBundleUsed: true,
        realPlaywrightPageUsed: true,
      });
    }

    const execution = await dependencies.executeLogin();

    if (dependencies.closeResources) {
      const closeResult = await dependencies.closeResources();

      if (!closeResult.ok) {
        closeWarning = safeText(closeResult.reason) ?? "Resource close failed.";
      }
    }

    if (execution.bankIdOrMfaDetected) {
      return buildReport(config, "bankid_or_mfa_stop", {
        bankIdOrMfaDetected: true,
        credentialRuntimeBundleUsed: true,
        loginSubmitAttempted: true,
        navigationToAvanzaLoginAttempted: true,
        realPlaywrightPageUsed: true,
        smokeTestExecuted: true,
        warnings: closeWarning ? [closeWarning] : [],
      });
    }

    if (!execution.ok) {
      return buildReport(config, "real_run_failed", {
        blockedReasons: [safeText(execution.reason) ?? "Injected login failed."],
        credentialRuntimeBundleUsed: true,
        loginSubmitAttempted: true,
        navigationToAvanzaLoginAttempted: true,
        realPlaywrightPageUsed: true,
        smokeTestExecuted: true,
        warnings: closeWarning ? [closeWarning] : [],
      });
    }

    return buildReport(config, "real_run_completed", {
      credentialRuntimeBundleUsed: true,
      loginSubmitAttempted: true,
      loggedInLikely: execution.loggedInLikely === true,
      navigationToAvanzaLoginAttempted: true,
      passwordUsed: true,
      realPlaywrightPageUsed: true,
      smokeTestExecuted: true,
      usernameUsed: true,
      warnings: closeWarning ? [closeWarning] : [],
    });
  } catch (error) {
    if (dependencies.closeResources) {
      try {
        const closeResult = await dependencies.closeResources();

        if (!closeResult.ok) {
          closeWarning =
            safeText(closeResult.reason) ?? "Resource close failed.";
        }
      } catch {
        closeWarning = "Resource close failed.";
      }
    }

    return buildReport(config, "real_run_failed", {
      blockedReasons: [
        error instanceof Error
          ? safeText(error.message) ?? "Injected dependency failed."
          : "Injected dependency failed.",
      ],
      credentialRuntimeBundleUsed: true,
      realPlaywrightPageUsed: true,
      smokeTestExecuted: true,
      warnings: closeWarning ? [closeWarning] : [],
    });
  }
}
