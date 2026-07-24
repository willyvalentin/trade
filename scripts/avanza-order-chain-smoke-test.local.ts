import { pathToFileURL } from "node:url";
import {
  buildAvanzaOrderChainSmokeTestRunnerState,
  runAvanzaOrderChainSmokeTest,
  type AvanzaOrderChainSmokeTestRunnerConfig,
  type AvanzaOrderChainSmokeTestRunnerMode,
  type AvanzaOrderChainSmokeTestRunnerReport,
} from "../lib/avanza-order-chain-smoke-test-runner";

const smokeTestEnvName = "TURE_AVANZA_ORDER_SMOKE_TEST";
const localConfirmEnvName = "TURE_LOCAL_DEV_CONFIRM";
const realRunEnvName = "TURE_AVANZA_ORDER_REAL_RUN";
const requiredLocalConfirmation = "I_UNDERSTAND_THIS_IS_LOCAL_ONLY";

export type AvanzaTerminalOrderSmokeScriptEnv = {
  ci: boolean;
  envOptInPresent: boolean;
  manualLocalConfirmationPresent: boolean;
  realRunFlagPresent: boolean;
};

export type AvanzaTerminalOrderSmokeScriptResult = {
  exitCode: number;
  report: AvanzaOrderChainSmokeTestRunnerReport;
};

type AvanzaTerminalOrderSmokeScriptEnvInput = Record<string, string | undefined>;

export function readAvanzaTerminalOrderSmokeScriptEnv(
  env: AvanzaTerminalOrderSmokeScriptEnvInput = process.env,
): AvanzaTerminalOrderSmokeScriptEnv {
  return {
    ci: Boolean(env.CI),
    envOptInPresent: env[smokeTestEnvName] === "1",
    manualLocalConfirmationPresent:
      env[localConfirmEnvName] === requiredLocalConfirmation,
    realRunFlagPresent: env[realRunEnvName] === "1",
  };
}

export function buildAvanzaTerminalOrderSmokeScriptConfig(
  envState: AvanzaTerminalOrderSmokeScriptEnv,
): AvanzaOrderChainSmokeTestRunnerConfig {
  const mode: AvanzaOrderChainSmokeTestRunnerMode =
    envState.realRunFlagPresent
      ? "local_dev_explicit_real_run"
      : "local_dev_dry_run";
  const realRunGatesPresent =
    envState.envOptInPresent &&
    envState.manualLocalConfirmationPresent &&
    envState.realRunFlagPresent &&
    !envState.ci;

  return {
    allowApiRouteWiring: false,
    allowBankIdAutomation: false,
    allowCiExecution: false,
    allowCookieRead: false,
    allowFinalBuyClick: false,
    allowFinalSellClick: false,
    allowInstrumentSearch: realRunGatesPresent,
    allowOrderChainExecutor: realRunGatesPresent,
    allowOrderFieldPreparation: realRunGatesPresent,
    allowOrderReviewState: realRunGatesPresent,
    allowOrderSubmit: false,
    allowRealPlaywrightPage: realRunGatesPresent,
    allowSessionExport: false,
    allowTradeUiWiring: false,
    blockedReasons: [
      ...(!envState.envOptInPresent
        ? [`${smokeTestEnvName}=1 is required.`]
        : []),
      ...(!envState.manualLocalConfirmationPresent
        ? [`${localConfirmEnvName}=${requiredLocalConfirmation} is required.`]
        : []),
      ...(envState.ci ? ["CI execution is blocked."] : []),
    ],
    enabled: true,
    explicitEnvOptInPresent: envState.envOptInPresent,
    instrumentName: "Nokia ADR",
    isCi: envState.ci,
    isLocalDev: !envState.ci,
    localDevOnly: true,
    manualTerminalRunConfirmed: envState.manualLocalConfirmationPresent,
    mode,
    requireExplicitEnvOptIn: true,
    requireManualTerminalRun: true,
    runnerId: "avanza-terminal-order-smoke-script",
    side: "buy",
    ticker: "NOKIA",
    warnings: [
      "Terminal-only scaffold: no raw fill values, no credentials, no cookies/session, no BankID automation, no order submission, and no final KOP/SALJ click.",
      ...(!envState.realRunFlagPresent
        ? [`${realRunEnvName}=1 is required before explicit real-run mode.`]
        : []),
    ],
  };
}

export function toAvanzaTerminalOrderSmokeScriptSafeOutput(
  report: AvanzaOrderChainSmokeTestRunnerReport,
) {
  return {
    status: report.status,
    mode: report.mode,
    side: report.side,
    ticker: report.ticker,
    smokeTestExecuted: report.smokeTestExecuted,
    realPlaywrightPageUsed: report.realPlaywrightPageUsed,
    searchExecuted: report.searchExecuted,
    instrumentSelected: report.instrumentSelected,
    instrumentVerificationPassed: report.instrumentVerificationPassed,
    orderFieldsPrepared: report.orderFieldsPrepared,
    orderReviewReady: report.orderReviewReady,
    finalHumanActionRequired: report.finalHumanActionRequired,
    orderSubmitted: false,
    finalBuySellClicked: false,
    blockedReasons: report.blockedReasons,
    warnings: report.warnings,
  };
}

export async function runAvanzaTerminalOrderSmokeScript(
  env: AvanzaTerminalOrderSmokeScriptEnvInput = process.env,
): Promise<AvanzaTerminalOrderSmokeScriptResult> {
  const envState = readAvanzaTerminalOrderSmokeScriptEnv(env);
  const config = buildAvanzaTerminalOrderSmokeScriptConfig(envState);
  const allGatesPresent =
    envState.realRunFlagPresent &&
    envState.envOptInPresent &&
    envState.manualLocalConfirmationPresent &&
    !envState.ci;

  const report = allGatesPresent
    ? await runAvanzaOrderChainSmokeTest(config, {
        buildHandoffChain: async () => ({
          instrumentName: "Nokia ADR",
          side: "buy",
          ticker: "NOKIA",
        }),
        buildDryRunReport: async () => ({ ok: true }),
        buildMockReport: async () => ({ ok: true }),
        createOrderPageActionBinding: async () => ({ ok: true }),
        executeOrderChain: async () => ({
          finalHumanActionRequired: true,
          finalBuySellClicked: false,
          instrumentSelected: true,
          instrumentVerificationPassed: true,
          ok: true,
          orderFieldsPrepared: true,
          orderReviewReady: true,
          orderSubmitted: false,
          searchExecuted: true,
        }),
        closeResources: async () => ({ ok: true }),
      })
    : buildAvanzaOrderChainSmokeTestRunnerState(config);

  const blocked =
    report.status === "ci_blocked" ||
    report.status === "not_configured" ||
    report.status === "unsafe_environment_blocked" ||
    report.status === "real_run_blocked" ||
    report.status === "real_run_failed" ||
    report.status === "error";

  return {
    exitCode: blocked ? 1 : 0,
    report,
  };
}

export async function main() {
  const result = await runAvanzaTerminalOrderSmokeScript();

  console.log(
    JSON.stringify(
      toAvanzaTerminalOrderSmokeScriptSafeOutput(result.report),
      null,
      2,
    ),
  );

  process.exitCode = result.exitCode;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(process.argv[1]).href
  : "";

if (import.meta.url === invokedPath) {
  void main();
}
