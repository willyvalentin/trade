import { execFileSync } from "node:child_process";

import type {
  FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner,
  FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult,
} from "@/lib/first-real-avanza-fill-only-poc-final-live-execute-attempt-wrapper";

export const firstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerEnv = {
  manualObservationMode: "AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE",
  liveFillOnlyRunnerEnabled:
    "AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER",
  expectedManualObservationMode: "cdp_readonly",
  expectedLiveFillOnlyRunnerEnabled: "true",
  defaultBridgeBaseUrl: "http://127.0.0.1:47831",
} as const;

export type FirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerStatus =
  | "disabled"
  | "enabled";

export type FirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerReadiness = {
  status: FirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerStatus;
  enabled: boolean;
  blocked_reasons: readonly string[];
  safety_confirmations: {
    disabled_by_default: true;
    explicit_env_enablement_required: true;
    manual_browser_session_required: true;
    no_browser_launch: true;
    no_credentials_or_session_handling: true;
    no_cookie_or_storage_handling: true;
    allowed_runner_methods_only: true;
    no_review_click: true;
    no_final_confirm: true;
    no_submit_or_order_placement: true;
    no_trade_or_supabase_mutation: true;
  };
};

type BridgeRunnerEnvelope = {
  runnerResult?: {
    ok?: boolean;
    evidence_id?: string | null;
    observed_total_amount_sek?: number | null;
    note?: string | null;
  };
};

type RunnerEnv = Partial<Record<string, string | undefined>>;

const safetyConfirmations = {
  disabled_by_default: true,
  explicit_env_enablement_required: true,
  manual_browser_session_required: true,
  no_browser_launch: true,
  no_credentials_or_session_handling: true,
  no_cookie_or_storage_handling: true,
  allowed_runner_methods_only: true,
  no_review_click: true,
  no_final_confirm: true,
  no_submit_or_order_placement: true,
  no_trade_or_supabase_mutation: true,
} as const;

function envValue(name: string, env: RunnerEnv) {
  return typeof env[name] === "string" ? env[name]?.trim() : "";
}

export function getFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerReadiness(
  env: RunnerEnv = process.env,
): FirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerReadiness {
  const blockedReasons: string[] = [];

  if (
    envValue(
      firstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerEnv.manualObservationMode,
      env,
    ) !==
    firstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerEnv.expectedManualObservationMode
  ) {
    blockedReasons.push("manual_observation_mode:not_cdp_readonly");
  }

  if (
    envValue(
      firstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerEnv.liveFillOnlyRunnerEnabled,
      env,
    ) !==
    firstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerEnv.expectedLiveFillOnlyRunnerEnabled
  ) {
    blockedReasons.push("live_fill_only_runner:not_enabled");
  }

  return {
    status: blockedReasons.length === 0 ? "enabled" : "disabled",
    enabled: blockedReasons.length === 0,
    blocked_reasons: blockedReasons,
    safety_confirmations: safetyConfirmations,
  };
}

function normalizeBridgeBaseUrl(value?: string | null) {
  const url = new URL(
    value ??
      firstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerEnv.defaultBridgeBaseUrl,
  );

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    !["127.0.0.1", "localhost", "::1"].includes(url.hostname)
  ) {
    throw new Error("Live fill-only runner bridge URL must be localhost only.");
  }

  url.pathname = "";
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/+$/, "");
}

function blockedResult(reason: string): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult {
  return {
    ok: false,
    evidence_id: null,
    observed_total_amount_sek: null,
    note: reason,
  };
}

function bridgeResult(
  envelope: BridgeRunnerEnvelope,
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult {
  return {
    ok: envelope.runnerResult?.ok === true,
    evidence_id: envelope.runnerResult?.evidence_id ?? null,
    observed_total_amount_sek:
      typeof envelope.runnerResult?.observed_total_amount_sek === "number"
        ? envelope.runnerResult.observed_total_amount_sek
        : null,
    note: envelope.runnerResult?.note ?? null,
  };
}

function callBridge(
  baseUrl: string,
  path: string,
  payload?: Record<string, unknown>,
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult {
  const args = [
    "-sS",
    "-X",
    "POST",
    "-H",
    "Content-Type: application/json",
    "--data",
    JSON.stringify(payload ?? {}),
    `${baseUrl}${path}`,
  ];

  try {
    const output = execFileSync("curl", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 10_000,
    });
    const parsed = JSON.parse(output) as BridgeRunnerEnvelope;

    return bridgeResult(parsed);
  } catch (error) {
    return blockedResult(
      error instanceof Error
        ? `live_fill_only_runner_bridge_call_failed:${error.message}`
        : "live_fill_only_runner_bridge_call_failed",
    );
  }
}

export function createFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyCdpRunner(
  options: {
    bridgeBaseUrl?: string | null;
    env?: RunnerEnv;
  } = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner {
  const env = options.env ?? process.env;
  const readiness =
    getFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerReadiness(env);
  const bridgeBaseUrl = normalizeBridgeBaseUrl(options.bridgeBaseUrl);

  function gatedCall(
    path: string,
    payload?: Record<string, unknown>,
  ): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult {
    if (!readiness.enabled) {
      return blockedResult(readiness.blocked_reasons.join(","));
    }

    return callBridge(bridgeBaseUrl, path, payload);
  }

  return {
    verifyVisibleOrderFormState: () =>
      gatedCall("/live-fill-only-runner/verify-visible-order-form-state"),
    fillAmountField: (amountSek) =>
      gatedCall("/live-fill-only-runner/fill-amount", { amountSek }),
    fillPriceField: (priceUsd) =>
      gatedCall("/live-fill-only-runner/fill-price", { priceUsd }),
    readTotalAmount: () => gatedCall("/live-fill-only-runner/read-total"),
    captureEvidence: (label) =>
      gatedCall("/live-fill-only-runner/capture-evidence", { label }),
    stopBeforeReview: () =>
      gatedCall("/live-fill-only-runner/stop-before-review"),
  };
}
