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
  action?: string | null;
  status?: string | null;
  runnerResult?: {
    ok?: boolean;
    evidence_id?: string | null;
    observed_total_amount_sek?: number | null;
    note?: string | null;
  };
  report?: unknown;
  blockers?: unknown;
  errors?: unknown;
  warnings?: unknown;
  metadata?: unknown;
};

type RunnerEnv = Partial<Record<string, string | undefined>>;
type BridgeTransport = (
  path: string,
  payload?: Record<string, unknown>,
) => BridgeRunnerEnvelope;

type BridgeRequestFailure = {
  ok: false;
  failure_type: string;
  message: string;
  request_accepted: boolean;
  status_code?: number | null;
};

type BridgeRequestResult = {
  envelope: BridgeRunnerEnvelope;
  attempt_count: number;
  request_accepted: boolean;
};

const approvedBridgeEndpoints = {
  verifyVisibleOrderFormState:
    "/live-fill-only-runner/verify-visible-order-form-state",
  fillAmountField: "/live-fill-only-runner/fill-amount",
  fillQuantityField: "/live-fill-only-runner/fill-quantity",
  fillPriceField: "/live-fill-only-runner/fill-price",
  readTotalAmount: "/live-fill-only-runner/read-total",
  captureEvidence: "/live-fill-only-runner/capture-evidence",
  stopBeforeReview: "/live-fill-only-runner/stop-before-review",
} as const;

type BridgeAction = keyof typeof approvedBridgeEndpoints;

const fillBridgeActions = new Set<BridgeAction>([
  "fillAmountField",
  "fillQuantityField",
  "fillPriceField",
]);

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

function blockedResult(
  reason: string,
  diagnostics?: unknown,
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult {
  return {
    ok: false,
    evidence_id: null,
    observed_total_amount_sek: null,
    note: reason,
    diagnostics,
  };
}

function bridgeResult(
  envelope: BridgeRunnerEnvelope,
  connectivity?: Record<string, unknown>,
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult {
  return {
    ok: envelope.runnerResult?.ok === true,
    evidence_id: envelope.runnerResult?.evidence_id ?? null,
    observed_total_amount_sek:
      typeof envelope.runnerResult?.observed_total_amount_sek === "number"
        ? envelope.runnerResult.observed_total_amount_sek
        : null,
    note: envelope.runnerResult?.note ?? null,
    diagnostics: {
      bridge_action: envelope.action ?? null,
      bridge_status: envelope.status ?? null,
      runner_result: envelope.runnerResult ?? null,
      report: envelope.report ?? null,
      blockers: envelope.blockers ?? [],
      errors: envelope.errors ?? [],
      warnings: envelope.warnings ?? [],
      metadata: {
        ...(typeof envelope.metadata === "object" &&
        envelope.metadata !== null &&
        !Array.isArray(envelope.metadata)
          ? envelope.metadata
          : {}),
        ...(connectivity ?? {}),
      },
    },
  };
}

function nodeHttpRequestSync(
  url: string,
  options: {
    method: "GET" | "POST";
    payload?: Record<string, unknown>;
    timeoutMs?: number;
  },
): BridgeRequestFailure | { ok: true; body: string; statusCode: number } {
  const script = `
const http = require("node:http");
const https = require("node:https");
const method = process.argv[1];
const targetUrl = process.argv[2];
const payload = process.argv[3];
const timeoutMs = Number(process.argv[4] || 3000);
const url = new URL(targetUrl);
const body = method === "POST" ? payload : "";
let requestAccepted = false;
let settled = false;
const client = url.protocol === "https:" ? https : http;
const request = client.request(url, {
  method,
  timeout: timeoutMs,
  headers: method === "POST" ? {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(body),
  } : {},
}, (response) => {
  requestAccepted = true;
  let responseBody = "";
  response.setEncoding("utf8");
  response.on("data", (chunk) => {
    responseBody += chunk;
  });
  response.on("end", () => {
    if (settled) return;
    settled = true;
    process.stdout.write(JSON.stringify({
      ok: true,
      statusCode: response.statusCode || 0,
      body: responseBody,
    }));
  });
});
request.on("error", (error) => {
  if (settled) return;
  settled = true;
  process.stdout.write(JSON.stringify({
    ok: false,
    failure_type: "connection_error",
    message: error && error.message ? error.message : "Unknown connection error.",
    request_accepted: requestAccepted,
  }));
});
request.on("timeout", () => {
  if (settled) return;
  settled = true;
  request.destroy();
  process.stdout.write(JSON.stringify({
    ok: false,
    failure_type: "timeout",
    message: "Localhost bridge request timed out.",
    request_accepted: requestAccepted,
  }));
});
if (body) request.write(body);
request.end();
`;

  try {
    const output = execFileSync(
      process.execPath,
      [
        "-e",
        script,
        options.method,
        url,
        JSON.stringify(options.payload ?? {}),
        String(options.timeoutMs ?? 3000),
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: (options.timeoutMs ?? 3000) + 1000,
      },
    );
    const parsed = JSON.parse(output) as
      | BridgeRequestFailure
      | { ok: true; body: string; statusCode: number };

    return parsed.ok === true
      ? parsed
      : {
          ok: false,
          failure_type: parsed.failure_type ?? "connection_error",
          message: parsed.message ?? "Localhost bridge request failed.",
          request_accepted: parsed.request_accepted === true,
          status_code: parsed.status_code ?? null,
        };
  } catch (error) {
    return {
      ok: false,
      failure_type: "node_http_transport_failed",
      message:
        error instanceof Error
          ? error.message
          : "Node HTTP transport failed before a response was returned.",
      request_accepted: false,
    };
  }
}

function requestBridgeJson(
  baseUrl: string,
  path: string,
  options: {
    method: "GET" | "POST";
    payload?: Record<string, unknown>;
    retryConnectionFailures: boolean;
  },
): BridgeRequestResult | BridgeRequestFailure & { attempt_count: number } {
  const maxAttempts = options.retryConnectionFailures ? 3 : 1;
  let lastFailure: BridgeRequestFailure | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = nodeHttpRequestSync(`${baseUrl}${path}`, {
      method: options.method,
      payload: options.payload,
      timeoutMs: 3000,
    });

    if ("ok" in response && response.ok === true) {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return {
          ok: false,
          failure_type: "http_error",
          message: `Localhost bridge returned HTTP ${response.statusCode}.`,
          request_accepted: true,
          status_code: response.statusCode,
          attempt_count: attempt,
        };
      }

      try {
        return {
          envelope: JSON.parse(response.body) as BridgeRunnerEnvelope,
          attempt_count: attempt,
          request_accepted: true,
        };
      } catch {
        return {
          ok: false,
          failure_type: "invalid_json_response",
          message: "Localhost bridge returned a non-JSON response.",
          request_accepted: true,
          status_code: response.statusCode,
          attempt_count: attempt,
        };
      }
    }

    lastFailure = response;

    if (response.request_accepted || !options.retryConnectionFailures) {
      break;
    }
  }

  return {
    ...(lastFailure ?? {
      failure_type: "connection_error",
      ok: false,
      message: "Localhost bridge request failed.",
      request_accepted: false,
    }),
    attempt_count: maxAttempts,
  };
}

function bridgeConnectivityFailureResult(
  baseUrl: string,
  action: BridgeAction,
  path: string,
  failure: BridgeRequestFailure & { attempt_count: number },
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult {
  const fillMethodAttempted = fillBridgeActions.has(action);

  return blockedResult("bridge_unreachable", {
    bridge_action: action,
    bridge_status: "bridge_unreachable",
    blockers: ["bridge_unreachable"],
    errors: ["bridge_unreachable"],
    warnings: fillMethodAttempted
      ? [
          "Fill endpoint connection failed. The runner did not retry the fill call after the failed send state.",
        ]
      : [],
    metadata: {
      bridge_base_url: baseUrl,
      method_attempted: action,
      endpoint_attempted: path,
      attempt_count: failure.attempt_count,
      failure_type: failure.failure_type,
      failure_message: failure.message,
      failure_happened_before_request_accepted:
        failure.request_accepted !== true,
      request_accepted: failure.request_accepted === true,
      fill_method_attempted: fillMethodAttempted,
      fill_call_retried_after_unknown_or_partial_send: false,
      required_endpoint_allowed: approvedBridgeEndpoints[action] === path,
    },
  });
}

function callBridge(
  baseUrl: string,
  action: BridgeAction,
  payload?: Record<string, unknown>,
  bridgeTransport?: BridgeTransport,
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult {
  const path = approvedBridgeEndpoints[action];

  if (bridgeTransport) {
    return bridgeResult(bridgeTransport(path, payload), {
      bridge_base_url: baseUrl,
      method_attempted: action,
      endpoint_attempted: path,
      attempt_count: 1,
      request_accepted: true,
      required_endpoint_allowed: true,
      fill_method_attempted: fillBridgeActions.has(action),
    });
  }

  const health = requestBridgeJson(baseUrl, "/health", {
    method: "GET",
    retryConnectionFailures: true,
  });

  if ("failure_type" in health) {
    return bridgeConnectivityFailureResult(baseUrl, action, path, health);
  }

  const actionResult = requestBridgeJson(baseUrl, path, {
    method: "POST",
    payload,
    retryConnectionFailures: !fillBridgeActions.has(action),
  });

  if ("failure_type" in actionResult) {
    return bridgeConnectivityFailureResult(baseUrl, action, path, actionResult);
  }

  return bridgeResult(actionResult.envelope, {
    bridge_base_url: baseUrl,
    method_attempted: action,
    endpoint_attempted: path,
    health_attempt_count: health.attempt_count,
    attempt_count: actionResult.attempt_count,
    request_accepted: actionResult.request_accepted,
    required_endpoint_allowed: true,
    fill_method_attempted: fillBridgeActions.has(action),
    fill_call_retried_after_unknown_or_partial_send: false,
  });
}

export function createFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyCdpRunner(
  options: {
    bridgeBaseUrl?: string | null;
    env?: RunnerEnv;
    bridgeTransport?: BridgeTransport;
  } = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner {
  const env = options.env ?? process.env;
  const readiness =
    getFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerReadiness(env);
  const bridgeBaseUrl = normalizeBridgeBaseUrl(options.bridgeBaseUrl);

  function gatedCall(
    action: BridgeAction,
    payload?: Record<string, unknown>,
  ): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult {
    if (!readiness.enabled) {
      return blockedResult(readiness.blocked_reasons.join(","));
    }

    return callBridge(bridgeBaseUrl, action, payload, options.bridgeTransport);
  }

  return {
    verifyVisibleOrderFormState: () =>
      gatedCall("verifyVisibleOrderFormState"),
    fillAmountField: (amountSek) =>
      gatedCall("fillAmountField", { amountSek }),
    fillQuantityField: (quantity) =>
      gatedCall("fillQuantityField", { quantity }),
    fillPriceField: (priceUsd) =>
      gatedCall("fillPriceField", { priceUsd }),
    readTotalAmount: () => gatedCall("readTotalAmount"),
    captureEvidence: (label) =>
      gatedCall("captureEvidence", { label }),
    stopBeforeReview: () => gatedCall("stopBeforeReview"),
  };
}
