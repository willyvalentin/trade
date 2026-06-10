import {
  buildLocalhostBridgeRunRequest,
  DEFAULT_LOCALHOST_BRIDGE_BASE_URL,
  LOCALHOST_BRIDGE_ENDPOINT_PATHS,
  LOCALHOST_BRIDGE_CONTRACT_VERSION,
  validateLocalhostBridgeHealthResponse,
  validateLocalhostBridgeCancelResponse,
  validateLocalhostBridgeRunResponse,
  type LocalhostBridgeCancelResponse,
  type LocalhostBridgeHealthResponse,
  type LocalhostBridgeRunResponse,
} from "@/lib/avanza-localhost-bridge-contract";
import type { AvanzaAgentRequest, AvanzaAgentResult } from "@/lib/avanza-agent-adapter";
import type { AvanzaAgentBridgeEnvelope } from "@/lib/avanza-agent-bridge";

export type LocalhostBridgeClientHealthCheckResult = {
  ok: boolean;
  reachable: boolean;
  statusCode?: number;
  response?: LocalhostBridgeHealthResponse;
  errors: string[];
  warnings: string[];
  checkedAt: string;
  baseUrl: string;
};

export type CheckLocalhostBridgeHealthOptions = {
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type LocalhostBridgeClientRunResult = {
  ok: boolean;
  reachable: boolean;
  statusCode?: number;
  response?: LocalhostBridgeRunResponse;
  result?: AvanzaAgentResult;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
};

export type LocalhostBridgeClientCancelResult = {
  ok: boolean;
  reachable: boolean;
  statusCode?: number;
  response?: LocalhostBridgeCancelResponse;
  cancelled?: boolean;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
};

export type RunLocalhostBridgeDryRunOptions = {
  envelope: AvanzaAgentBridgeEnvelope;
  request: AvanzaAgentRequest;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  metadata?: Record<string, unknown> | null;
  fetchFn?: typeof fetch | null;
};

export type CancelLocalhostBridgeRunOptions = {
  requestId: string | null | undefined;
  reason?: string | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

const DEFAULT_LOCALHOST_BRIDGE_HEALTH_TIMEOUT_MS = 2000;
const DEFAULT_LOCALHOST_BRIDGE_RUN_TIMEOUT_MS = 5000;
const DEFAULT_LOCALHOST_BRIDGE_CANCEL_TIMEOUT_MS = 3000;

function normalizeBaseUrl(value: string | null | undefined): string {
  const baseUrl =
    typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : DEFAULT_LOCALHOST_BRIDGE_BASE_URL;

  return baseUrl.replace(/\/+$/, "");
}

function normalizeTimeoutMs(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_LOCALHOST_BRIDGE_HEALTH_TIMEOUT_MS;
}

function buildResult(
  input: Omit<LocalhostBridgeClientHealthCheckResult, "checkedAt" | "baseUrl"> & {
    baseUrl: string;
  },
): LocalhostBridgeClientHealthCheckResult {
  return {
    ...input,
    checkedAt: new Date().toISOString(),
  };
}

function buildRunResult(
  input: Omit<LocalhostBridgeClientRunResult, "completedAt" | "baseUrl"> & {
    baseUrl: string;
  },
): LocalhostBridgeClientRunResult {
  return {
    ...input,
    completedAt: new Date().toISOString(),
  };
}

function buildCancelResult(
  input: Omit<LocalhostBridgeClientCancelResult, "completedAt" | "baseUrl"> & {
    baseUrl: string;
  },
): LocalhostBridgeClientCancelResult {
  return {
    ...input,
    completedAt: new Date().toISOString(),
  };
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text);
}

export async function checkLocalhostBridgeHealth(
  options: CheckLocalhostBridgeHealthOptions = {},
): Promise<LocalhostBridgeClientHealthCheckResult> {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.health}`,
      {
        method: "GET",
        cache: "no-store",
        signal: controller?.signal,
      },
    );
    const parsed = await parseJsonResponse(response);
    const validation = validateLocalhostBridgeHealthResponse(
      parsed as Partial<LocalhostBridgeHealthResponse> | null | undefined,
    );
    const errors = [...validation.errors];

    if (!response.ok) {
      errors.unshift(`Localhost bridge health returned HTTP ${response.status}.`);
    }

    return buildResult({
      ok: response.ok && validation.ok,
      reachable: true,
      statusCode: response.status,
      response: validation.ok
        ? (parsed as LocalhostBridgeHealthResponse)
        : undefined,
      errors,
      warnings: validation.warnings,
      baseUrl,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: [
        timedOut
          ? `Localhost bridge health check timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge health check failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function runLocalhostBridgeDryRun(
  options: RunLocalhostBridgeDryRunOptions,
): Promise<LocalhostBridgeClientRunResult> {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(
    options.timeoutMs ?? DEFAULT_LOCALHOST_BRIDGE_RUN_TIMEOUT_MS,
  );
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildRunResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<typeof buildLocalhostBridgeRunRequest>;

  try {
    body = buildLocalhostBridgeRunRequest(options.envelope, options.request, {
      metadata: {
        ...(options.metadata ?? {}),
        dry_run: true,
        local_diagnostics_only: true,
        no_avanza_session: true,
        no_browser_automation: true,
        no_broker_result_created: true,
      },
    });
  } catch (error) {
    return buildRunResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge dry-run request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.run}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    const parsed = await parseJsonResponse(response);
    const validation = validateLocalhostBridgeRunResponse(
      parsed as Partial<LocalhostBridgeRunResponse> | null | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeRunResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok) {
      errors.unshift(`Localhost bridge run returned HTTP ${response.status}.`);
    }

    if (responseBody?.accepted === false) {
      errors.push(...(responseBody.errors ?? []));
      warnings.push(...(responseBody.warnings ?? []));
    }

    if (responseBody?.result?.brokerResult) {
      errors.push(
        "Localhost bridge dry-run returned brokerResult unexpectedly.",
      );
    }

    return buildRunResult({
      ok:
        response.ok &&
        validation.ok &&
        responseBody?.accepted === true &&
        !responseBody.result?.brokerResult,
      reachable: true,
      statusCode: response.status,
      response: responseBody,
      result: responseBody?.result,
      errors,
      warnings,
      baseUrl,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildRunResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: [
        timedOut
          ? `Localhost bridge dry run timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge dry run failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function cancelLocalhostBridgeRun(
  options: CancelLocalhostBridgeRunOptions,
): Promise<LocalhostBridgeClientCancelResult> {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(
    options.timeoutMs ?? DEFAULT_LOCALHOST_BRIDGE_CANCEL_TIMEOUT_MS,
  );
  const fetchImpl = options.fetchFn ?? globalThis.fetch;
  const requestId =
    typeof options.requestId === "string" && options.requestId.trim().length > 0
      ? options.requestId.trim()
      : null;

  if (!requestId) {
    return buildCancelResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: ["Localhost bridge cancel requires a requestId."],
      warnings: [],
    });
  }

  if (typeof fetchImpl !== "function") {
    return buildCancelResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.cancel}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
          requestId,
          ...(typeof options.reason === "string" && options.reason.trim()
            ? { reason: options.reason.trim() }
            : {}),
        }),
        signal: controller?.signal,
      },
    );
    const parsed = await parseJsonResponse(response);
    const validation = validateLocalhostBridgeCancelResponse(
      parsed as Partial<LocalhostBridgeCancelResponse> | null | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeCancelResponse)
      : undefined;
    const errors = [...validation.errors];

    if (!response.ok) {
      errors.unshift(`Localhost bridge cancel returned HTTP ${response.status}.`);
    }

    if (responseBody?.cancelled === false) {
      errors.push(...(responseBody.errors ?? []));
    }

    return buildCancelResult({
      ok: response.ok && validation.ok && responseBody?.cancelled === true,
      reachable: true,
      statusCode: response.status,
      response: responseBody,
      cancelled: responseBody?.cancelled,
      errors,
      warnings: validation.warnings,
      baseUrl,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildCancelResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: [
        timedOut
          ? `Localhost bridge cancel timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge cancel failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
