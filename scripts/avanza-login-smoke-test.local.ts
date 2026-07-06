import { pathToFileURL } from "node:url";
import {
  buildAvanzaIsolatedLoginSmokeTestRunnerState,
  runAvanzaIsolatedLoginSmokeTest,
  type AvanzaIsolatedLoginSmokeTestRunnerConfig,
  type AvanzaIsolatedLoginSmokeTestRunnerMode,
  type AvanzaIsolatedLoginSmokeTestRunnerReport,
} from "../lib/avanza-isolated-login-smoke-test-runner";

const smokeTestEnvName = "TURE_AVANZA_LOGIN_SMOKE_TEST";
const localConfirmEnvName = "TURE_LOCAL_DEV_CONFIRM";
const realRunEnvName = "TURE_AVANZA_LOGIN_REAL_RUN";
const requiredLocalConfirmation = "I_UNDERSTAND_THIS_IS_LOCAL_ONLY";

export type AvanzaTerminalLoginSmokeScriptEnv = {
  ci: boolean;
  envOptInPresent: boolean;
  manualLocalConfirmationPresent: boolean;
  realRunFlagPresent: boolean;
};

export type AvanzaTerminalLoginSmokeScriptResult = {
  exitCode: number;
  report: AvanzaIsolatedLoginSmokeTestRunnerReport;
};

export function readAvanzaTerminalLoginSmokeScriptEnv(
  env: NodeJS.ProcessEnv = process.env,
): AvanzaTerminalLoginSmokeScriptEnv {
  return {
    ci: Boolean(env.CI),
    envOptInPresent: env[smokeTestEnvName] === "1",
    manualLocalConfirmationPresent:
      env[localConfirmEnvName] === requiredLocalConfirmation,
    realRunFlagPresent: env[realRunEnvName] === "1",
  };
}

export function buildAvanzaTerminalLoginSmokeScriptConfig(
  envState: AvanzaTerminalLoginSmokeScriptEnv,
): AvanzaIsolatedLoginSmokeTestRunnerConfig {
  const mode: AvanzaIsolatedLoginSmokeTestRunnerMode =
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
    allowCredentialRuntimeBundle: realRunGatesPresent,
    allowFinalBuyClick: false,
    allowFinalSellClick: false,
    allowNavigationToAvanzaLogin: realRunGatesPresent,
    allowOrderSubmit: false,
    allowRealPlaywrightPage: realRunGatesPresent,
    allowSessionExport: false,
    allowTradeUiWiring: false,
    allowUsernamePasswordLogin: realRunGatesPresent,
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
    isCi: envState.ci,
    isLocalDev: !envState.ci,
    localDevOnly: true,
    manualTerminalRunConfirmed: envState.manualLocalConfirmationPresent,
    mode,
    requireExplicitEnvOptIn: true,
    requireManualTerminalRun: true,
    runnerId: "avanza-terminal-login-smoke-script",
    warnings: [
      "Terminal-only scaffold: no credential values, cookies, sessions, BankID automation, order submission, or final buy/sell click.",
      ...(!envState.realRunFlagPresent
        ? [`${realRunEnvName}=1 is required before explicit real-run mode.`]
        : []),
    ],
  };
}

export function toAvanzaTerminalLoginSmokeScriptSafeOutput(
  report: AvanzaIsolatedLoginSmokeTestRunnerReport,
) {
  return {
    status: report.status,
    mode: report.mode,
    smokeTestExecuted: report.smokeTestExecuted,
    realPlaywrightPageUsed: report.realPlaywrightPageUsed,
    credentialRuntimeBundleUsed: report.credentialRuntimeBundleUsed,
    usernameUsed: report.usernameUsed,
    passwordUsed: report.passwordUsed,
    loggedInLikely: report.loggedInLikely,
    bankIdOrMfaDetected: report.bankIdOrMfaDetected,
    orderSubmitted: false,
    finalBuySellClicked: false,
    blockedReasons: report.blockedReasons,
    warnings: report.warnings,
  };
}

export async function runAvanzaTerminalLoginSmokeScript(
  env: NodeJS.ProcessEnv = process.env,
): Promise<AvanzaTerminalLoginSmokeScriptResult> {
  const envState = readAvanzaTerminalLoginSmokeScriptEnv(env);
  const config = buildAvanzaTerminalLoginSmokeScriptConfig(envState);

  const report =
    envState.realRunFlagPresent &&
    envState.envOptInPresent &&
    envState.manualLocalConfirmationPresent &&
    !envState.ci
      ? buildAvanzaIsolatedLoginSmokeTestRunnerState({
          ...config,
          warnings: [
            ...(config.warnings ?? []),
            "Explicit real-run gates are present, but this script scaffold does not wire a real Playwright executor yet.",
          ],
        })
      : await runAvanzaIsolatedLoginSmokeTest(config);

  const blocked =
    report.status === "ci_blocked" ||
    report.status === "not_configured" ||
    report.status === "unsafe_environment_blocked" ||
    report.status === "real_run_blocked" ||
    report.status === "error";

  return {
    exitCode: blocked ? 1 : 0,
    report,
  };
}

export async function main() {
  const result = await runAvanzaTerminalLoginSmokeScript();

  console.log(
    JSON.stringify(
      toAvanzaTerminalLoginSmokeScriptSafeOutput(result.report),
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
