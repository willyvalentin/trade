import type {
  AvanzaInstrumentToOrderLocalDevExecutorReport,
} from "./avanza-instrument-to-order-local-dev-executor";
import type {
  AvanzaOrderTicketSide,
} from "./avanza-order-ticket-field-contract";

export type AvanzaOrderChainSmokeTestRunnerStatus =
  | "disabled"
  | "not_configured"
  | "ready"
  | "dry_run_completed"
  | "modeled_run_completed"
  | "real_run_blocked"
  | "real_run_ready"
  | "real_run_completed_to_review"
  | "real_run_failed"
  | "ci_blocked"
  | "unsafe_environment_blocked"
  | "final_human_action_required"
  | "error"
  | "unknown";

export type AvanzaOrderChainSmokeTestRunnerMode =
  | "disabled"
  | "model_only"
  | "local_dev_dry_run"
  | "local_dev_explicit_real_run";

export type AvanzaOrderChainSmokeTestRunnerConfig = {
  runnerId?: string;
  mode?: AvanzaOrderChainSmokeTestRunnerMode;
  enabled?: boolean;
  localDevOnly?: true;
  requireExplicitEnvOptIn?: boolean;
  explicitEnvOptInPresent?: boolean;
  requireManualTerminalRun?: boolean;
  manualTerminalRunConfirmed?: boolean;
  isCi?: boolean;
  isLocalDev?: boolean;
  allowRealPlaywrightPage?: boolean;
  allowOrderChainExecutor?: boolean;
  allowInstrumentSearch?: boolean;
  allowOrderFieldPreparation?: boolean;
  allowOrderReviewState?: boolean;
  allowFinalBuyClick?: false | boolean;
  allowFinalSellClick?: false | boolean;
  allowOrderSubmit?: false | boolean;
  allowCookieRead?: false | boolean;
  allowSessionExport?: false | boolean;
  allowBankIdAutomation?: false | boolean;
  allowTradeUiWiring?: false | boolean;
  allowApiRouteWiring?: false | boolean;
  allowCiExecution?: false | boolean;
  statusOverride?: AvanzaOrderChainSmokeTestRunnerStatus;
  forceError?: boolean;
  side?: AvanzaOrderTicketSide;
  ticker?: string;
  instrumentName?: string;
  now?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaOrderChainSmokeTestRunnerDependencies = {
  buildHandoffChain?: () => Promise<unknown>;
  buildDryRunReport?: () => Promise<unknown>;
  buildMockReport?: () => Promise<unknown>;
  createOrderPageActionBinding?: () => Promise<unknown>;
  executeOrderChain?: () => Promise<{
    ok: boolean;
    status?: string;
    reason?: string;
    searchExecuted?: boolean;
    instrumentSelected?: boolean;
    instrumentVerificationPassed?: boolean;
    orderFieldsPrepared?: boolean;
    orderReviewReady?: boolean;
    finalHumanActionRequired?: boolean;
    orderSubmitted?: boolean;
    finalBuySellClicked?: boolean;
  }>;
  closeResources?: () => Promise<{ ok: boolean; reason?: string }>;
};

export type AvanzaOrderChainSmokeTestRunnerSafetyFlags = {
  runnerEnabled: boolean;
  localDevOnly: true;
  canRunInCi: false;
  requiresExplicitEnvOptIn: boolean;
  explicitEnvOptInPresent: boolean;
  requiresManualTerminalRun: boolean;
  manualTerminalRunConfirmed: boolean;
  canUseRealPlaywrightPage: boolean;
  canUseOrderChainExecutor: boolean;
  canSearchInstrument: boolean;
  canPrepareOrderFields: boolean;
  canReachOrderReview: boolean;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canSubmitOrder: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  canWireTradeUi: false;
  canWireApiRoute: false;
  valueVisibleInReports: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaOrderChainSmokeTestRunnerReport =
  AvanzaOrderChainSmokeTestRunnerSafetyFlags & {
    reportId: string;
    createdAt: string;
    status: AvanzaOrderChainSmokeTestRunnerStatus;
    label: string;
    reason: string;
    mode: AvanzaOrderChainSmokeTestRunnerMode;
    side: AvanzaOrderTicketSide | "unknown";
    ticker: string;
    instrumentName?: string;
    smokeTestExecuted: boolean;
    realPlaywrightPageUsed: boolean;
    searchExecuted: boolean;
    instrumentSelected: boolean;
    instrumentVerificationPassed: boolean;
    orderFieldsPrepared: boolean;
    orderReviewReady: boolean;
    finalHumanActionRequired: boolean;
    orderSubmitted: false;
    finalBuySellClicked: false;
    cookiesRead: false;
    sessionExported: false;
    bankIdAutomated: false;
    tradeUiWired: false;
    apiRouteWired: false;
    ciExecution: false;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaOrderChainSmokeTestRunnerSafetyFlags;
  };

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid\s*qr\s*data|broker\s*secret|cookie\s*[:=]|credential\s*[:=]|order\s*id|orderid|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret\s*[:=]|session\s*[:=]|storage\s*[:=]|token\s*[:=]/i;

type RequiredConfig = {
  runnerId: string;
  mode: AvanzaOrderChainSmokeTestRunnerMode;
  enabled: boolean;
  localDevOnly: true;
  requireExplicitEnvOptIn: boolean;
  explicitEnvOptInPresent: boolean;
  requireManualTerminalRun: boolean;
  manualTerminalRunConfirmed: boolean;
  isCi: boolean;
  isLocalDev: boolean;
  allowRealPlaywrightPage: boolean;
  allowOrderChainExecutor: boolean;
  allowInstrumentSearch: boolean;
  allowOrderFieldPreparation: boolean;
  allowOrderReviewState: boolean;
  allowFinalBuyClick: boolean;
  allowFinalSellClick: boolean;
  allowOrderSubmit: boolean;
  allowCookieRead: boolean;
  allowSessionExport: boolean;
  allowBankIdAutomation: boolean;
  allowTradeUiWiring: boolean;
  allowApiRouteWiring: boolean;
  allowCiExecution: boolean;
  statusOverride?: AvanzaOrderChainSmokeTestRunnerStatus;
  forceError: boolean;
  side: AvanzaOrderTicketSide | "unknown";
  ticker: string;
  instrumentName?: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeMode(
  mode: AvanzaOrderChainSmokeTestRunnerConfig["mode"],
): AvanzaOrderChainSmokeTestRunnerMode {
  if (
    mode === "model_only" ||
    mode === "local_dev_dry_run" ||
    mode === "local_dev_explicit_real_run"
  ) {
    return mode;
  }

  return "disabled";
}

function normalizeSide(side: AvanzaOrderChainSmokeTestRunnerConfig["side"]) {
  return side === "buy" || side === "sell" ? side : "unknown";
}

function normalizeConfig(
  config: AvanzaOrderChainSmokeTestRunnerConfig = {},
): RequiredConfig {
  return {
    runnerId:
      safeText(config.runnerId) ?? "avanza-order-chain-smoke-test-runner",
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
    allowOrderChainExecutor: config.allowOrderChainExecutor === true,
    allowInstrumentSearch: config.allowInstrumentSearch === true,
    allowOrderFieldPreparation:
      config.allowOrderFieldPreparation === true,
    allowOrderReviewState: config.allowOrderReviewState === true,
    allowFinalBuyClick: config.allowFinalBuyClick === true,
    allowFinalSellClick: config.allowFinalSellClick === true,
    allowOrderSubmit: config.allowOrderSubmit === true,
    allowCookieRead: config.allowCookieRead === true,
    allowSessionExport: config.allowSessionExport === true,
    allowBankIdAutomation: config.allowBankIdAutomation === true,
    allowTradeUiWiring: config.allowTradeUiWiring === true,
    allowApiRouteWiring: config.allowApiRouteWiring === true,
    allowCiExecution: config.allowCiExecution === true,
    statusOverride: config.statusOverride,
    forceError: config.forceError === true,
    side: normalizeSide(config.side),
    ticker: safeText(config.ticker) ?? "missing",
    instrumentName: safeText(config.instrumentName),
    now: safeText(config.now) ?? defaultCreatedAt,
    warnings: config.warnings ?? [],
    blockedReasons: config.blockedReasons ?? [],
  };
}

function buildSafetyFlags(
  config: RequiredConfig,
): AvanzaOrderChainSmokeTestRunnerSafetyFlags {
  const explicitRealRun = config.mode === "local_dev_explicit_real_run";
  const enabledRealRun = config.enabled && explicitRealRun;

  return {
    runnerEnabled: config.enabled,
    localDevOnly: true,
    canRunInCi: false,
    requiresExplicitEnvOptIn: config.requireExplicitEnvOptIn,
    explicitEnvOptInPresent: config.explicitEnvOptInPresent,
    requiresManualTerminalRun: config.requireManualTerminalRun,
    manualTerminalRunConfirmed: config.manualTerminalRunConfirmed,
    canUseRealPlaywrightPage:
      enabledRealRun && config.allowRealPlaywrightPage,
    canUseOrderChainExecutor:
      enabledRealRun && config.allowOrderChainExecutor,
    canSearchInstrument: enabledRealRun && config.allowInstrumentSearch,
    canPrepareOrderFields:
      enabledRealRun && config.allowOrderFieldPreparation,
    canReachOrderReview: enabledRealRun && config.allowOrderReviewState,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canSubmitOrder: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    canWireTradeUi: false,
    canWireApiRoute: false,
    valueVisibleInReports: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function hasUnsafeAllowFlag(config: RequiredConfig) {
  return (
    config.allowCiExecution ||
    config.allowFinalBuyClick ||
    config.allowFinalSellClick ||
    config.allowOrderSubmit ||
    config.allowCookieRead ||
    config.allowSessionExport ||
    config.allowBankIdAutomation ||
    config.allowTradeUiWiring ||
    config.allowApiRouteWiring
  );
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
    ...(config.allowFinalBuyClick || config.allowFinalSellClick
      ? ["Final KOP/SALJ clicks are forbidden."]
      : []),
    ...(config.allowOrderSubmit ? ["Order submission is forbidden."] : []),
    ...(config.allowCookieRead || config.allowSessionExport
      ? ["Cookie/session access is forbidden."]
      : []),
    ...(config.allowBankIdAutomation
      ? ["BankID automation is forbidden."]
      : []),
    ...(config.allowTradeUiWiring ? ["Trade UI wiring is forbidden."] : []),
    ...(config.allowApiRouteWiring ? ["API route wiring is forbidden."] : []),
  ];
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
    config.allowOrderChainExecutor &&
    config.allowInstrumentSearch &&
    config.allowOrderFieldPreparation &&
    config.allowOrderReviewState &&
    !hasUnsafeAllowFlag(config)
  );
}

function deriveStatus(
  config: RequiredConfig,
): AvanzaOrderChainSmokeTestRunnerStatus {
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

function describeStatus(status: AvanzaOrderChainSmokeTestRunnerStatus) {
  switch (status) {
    case "disabled":
      return {
        label: "Disabled",
        reason: "The order chain smoke test runner is disabled by default.",
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
          "All explicit local-dev gates are satisfied for injected order chain execution.",
      };
    case "dry_run_completed":
      return {
        label: "Dry-run completed",
        reason:
          "The runner completed a local-dev dry-run report without real page actions.",
      };
    case "modeled_run_completed":
      return {
        label: "Modeled run completed",
        reason:
          "The runner completed a model-only report without real page actions.",
      };
    case "real_run_blocked":
      return {
        label: "Real run blocked",
        reason: "A real local-dev order chain smoke gate is blocked.",
      };
    case "real_run_completed_to_review":
      return {
        label: "Real run completed to review",
        reason:
          "Injected dependencies reached review-ready state and stopped before final KOP/SALJ.",
      };
    case "real_run_failed":
      return {
        label: "Real run failed",
        reason: "Injected dependencies reported a failed order chain smoke run.",
      };
    case "ci_blocked":
      return {
        label: "CI blocked",
        reason: "The order chain smoke runner cannot execute in CI.",
      };
    case "unsafe_environment_blocked":
      return {
        label: "Unsafe environment blocked",
        reason: "A forbidden capability or unsafe environment was requested.",
      };
    case "final_human_action_required":
      return {
        label: "Final human action required",
        reason:
          "The runner stopped at review-ready state and requires manual final action.",
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
  status: AvanzaOrderChainSmokeTestRunnerStatus,
  overrides: Partial<AvanzaOrderChainSmokeTestRunnerReport> = {},
): AvanzaOrderChainSmokeTestRunnerReport {
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
    side: overrides.side ?? config.side,
    ticker: safeText(overrides.ticker) ?? config.ticker,
    instrumentName: safeText(overrides.instrumentName) ?? config.instrumentName,
    smokeTestExecuted: overrides.smokeTestExecuted === true,
    realPlaywrightPageUsed: overrides.realPlaywrightPageUsed === true,
    searchExecuted: overrides.searchExecuted === true,
    instrumentSelected: overrides.instrumentSelected === true,
    instrumentVerificationPassed:
      overrides.instrumentVerificationPassed === true,
    orderFieldsPrepared: overrides.orderFieldsPrepared === true,
    orderReviewReady: overrides.orderReviewReady === true,
    finalHumanActionRequired:
      overrides.finalHumanActionRequired !== false,
    orderSubmitted: false,
    finalBuySellClicked: false,
    cookiesRead: false,
    sessionExported: false,
    bankIdAutomated: false,
    tradeUiWired: false,
    apiRouteWired: false,
    ciExecution: false,
    warnings,
    blockedReasons,
    safetyFlags,
  };
}

export function buildAvanzaOrderChainSmokeTestRunnerState(
  configInput: AvanzaOrderChainSmokeTestRunnerConfig = {},
): AvanzaOrderChainSmokeTestRunnerReport {
  const config = normalizeConfig(configInput);
  const status = deriveStatus(config);

  return buildReport(config, status);
}

export function toAvanzaOrderChainSmokeTestRunnerSafeReport(
  report: AvanzaOrderChainSmokeTestRunnerReport,
): AvanzaOrderChainSmokeTestRunnerReport {
  return {
    ...report,
    orderSubmitted: false,
    finalBuySellClicked: false,
    cookiesRead: false,
    sessionExported: false,
    bankIdAutomated: false,
    tradeUiWired: false,
    apiRouteWired: false,
    ciExecution: false,
    canRunInCi: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canSubmitOrder: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    canWireTradeUi: false,
    canWireApiRoute: false,
    valueVisibleInReports: false,
    controlsEnabled: false,
    gateLocked: true,
    safetyFlags: {
      ...report.safetyFlags,
      canRunInCi: false,
      canClickFinalBuy: false,
      canClickFinalSell: false,
      canSubmitOrder: false,
      canReadCookies: false,
      canExportSession: false,
      canAutomateBankId: false,
      canBypassBankId: false,
      canWireTradeUi: false,
      canWireApiRoute: false,
      valueVisibleInReports: false,
      controlsEnabled: false,
      gateLocked: true,
    },
  };
}

function safeExecutorSummary(
  report: unknown,
): Partial<AvanzaOrderChainSmokeTestRunnerReport> {
  if (!isRecord(report)) {
    return {};
  }

  const candidate = report as Partial<AvanzaInstrumentToOrderLocalDevExecutorReport>;

  return {
    side: candidate.side === "buy" || candidate.side === "sell" ? candidate.side : undefined,
    ticker: safeText(candidate.ticker),
    instrumentName: safeText(candidate.instrumentName),
  };
}

export async function runAvanzaOrderChainSmokeTest(
  configInput: AvanzaOrderChainSmokeTestRunnerConfig = {},
  dependencies: AvanzaOrderChainSmokeTestRunnerDependencies = {},
): Promise<AvanzaOrderChainSmokeTestRunnerReport> {
  const config = normalizeConfig(configInput);
  const initialStatus = deriveStatus(config);

  if (initialStatus !== "real_run_ready") {
    return buildReport(config, initialStatus);
  }

  let closeWarning: string | undefined;

  try {
    const handoffChain = await dependencies.buildHandoffChain?.();
    await dependencies.buildDryRunReport?.();
    await dependencies.buildMockReport?.();
    await dependencies.createOrderPageActionBinding?.();

    if (!dependencies.executeOrderChain) {
      return buildReport(config, "real_run_failed", {
        blockedReasons: ["Injected executeOrderChain dependency is missing."],
        realPlaywrightPageUsed: true,
      });
    }

    const execution = await dependencies.executeOrderChain();

    if (dependencies.closeResources) {
      const closeResult = await dependencies.closeResources();

      if (!closeResult.ok) {
        closeWarning = safeText(closeResult.reason) ?? "Resource close failed.";
      }
    }

    if (execution.orderSubmitted || execution.finalBuySellClicked) {
      return buildReport(config, "unsafe_environment_blocked", {
        ...safeExecutorSummary(handoffChain),
        blockedReasons: [
          "Injected order chain attempted forbidden final click or order submission.",
        ],
        finalHumanActionRequired: true,
        realPlaywrightPageUsed: true,
        smokeTestExecuted: true,
        warnings: closeWarning ? [closeWarning] : [],
      });
    }

    if (!execution.ok) {
      return buildReport(config, "real_run_failed", {
        ...safeExecutorSummary(handoffChain),
        blockedReasons: [
          safeText(execution.reason) ?? "Injected order chain failed.",
        ],
        finalHumanActionRequired: true,
        realPlaywrightPageUsed: true,
        smokeTestExecuted: true,
        warnings: closeWarning ? [closeWarning] : [],
      });
    }

    const reviewReady =
      execution.searchExecuted === true &&
      execution.instrumentSelected === true &&
      execution.instrumentVerificationPassed === true &&
      execution.orderFieldsPrepared === true &&
      execution.orderReviewReady === true &&
      execution.finalHumanActionRequired === true;

    return buildReport(
      config,
      reviewReady
        ? "real_run_completed_to_review"
        : "final_human_action_required",
      {
        ...safeExecutorSummary(handoffChain),
        finalHumanActionRequired: true,
        instrumentSelected: execution.instrumentSelected === true,
        instrumentVerificationPassed:
          execution.instrumentVerificationPassed === true,
        orderFieldsPrepared: execution.orderFieldsPrepared === true,
        orderReviewReady: execution.orderReviewReady === true,
        realPlaywrightPageUsed: true,
        searchExecuted: execution.searchExecuted === true,
        smokeTestExecuted: true,
        warnings: [
          "Final human action required; final KOP/SALJ was not clicked.",
          ...(closeWarning ? [closeWarning] : []),
        ],
      },
    );
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

    return buildReport(config, "error", {
      blockedReasons: [
        error instanceof Error
          ? safeText(error.message) ?? "Injected order chain threw an error."
          : "Injected order chain threw an error.",
      ],
      warnings: closeWarning ? [closeWarning] : [],
    });
  }
}
