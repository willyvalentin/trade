import {
  mapAvanzaLocalBridgeStatus,
  type AvanzaLocalBridgeStatusSource,
  type AvanzaLocalBridgeStatusSummary,
} from "@/lib/avanza-local-bridge-status";

export const AVANZA_BRIDGE_READONLY_STATUS_ENV_FLAG =
  "NEXT_PUBLIC_AVANZA_BRIDGE_READONLY_STATUS_ENABLED";

export const AVANZA_BRIDGE_READONLY_STATUS_ENABLED_VALUE = "true";

export const DEFAULT_AVANZA_LOCAL_BRIDGE_READONLY_BASE_URL =
  "http://127.0.0.1:47831";

export const DEFAULT_AVANZA_LOCAL_BRIDGE_READONLY_TIMEOUT_MS = 2_000;

export const AVANZA_LOCAL_BRIDGE_READONLY_ENDPOINTS = {
  health: "/health",
  selfCheck: "/self-check",
  preflightOrderForm: "/preflight/avanza-order-form",
} as const;

export type AvanzaLocalBridgeReadonlyEndpoint =
  keyof typeof AVANZA_LOCAL_BRIDGE_READONLY_ENDPOINTS;

export type AvanzaLocalBridgeReadonlyEndpointPath =
  (typeof AVANZA_LOCAL_BRIDGE_READONLY_ENDPOINTS)[AvanzaLocalBridgeReadonlyEndpoint];

export type AvanzaLocalBridgeReadonlyFetchResult = {
  elapsedMs: number;
  ok: boolean;
  endpoint: AvanzaLocalBridgeReadonlyEndpoint;
  path: AvanzaLocalBridgeReadonlyEndpointPath;
  statusCode: number | null;
  response: unknown | null;
  error: string | null;
  timedOut: boolean;
};

export type AvanzaLocalBridgeReadonlyStatusFetchResult = {
  completedAt: string | null;
  ok: boolean;
  configured: boolean;
  elapsedMs: number | null;
  source: AvanzaLocalBridgeStatusSource;
  summary: AvanzaLocalBridgeStatusSummary;
  endpoints: {
    health: AvanzaLocalBridgeReadonlyFetchResult | null;
    selfCheck: AvanzaLocalBridgeReadonlyFetchResult | null;
    preflightOrderForm: AvanzaLocalBridgeReadonlyFetchResult | null;
  };
};

type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Pick<Response, "ok" | "status" | "json" | "text">>;

export type FetchAvanzaLocalBridgeReadonlyEndpointOptions = {
  baseUrl?: string | null;
  enabled?: boolean | null;
  endpoint: AvanzaLocalBridgeReadonlyEndpoint;
  fetchImpl?: FetchLike;
  timeoutMs?: number | null;
};

export type FetchAvanzaLocalBridgeReadonlyStatusOptions = Omit<
  FetchAvanzaLocalBridgeReadonlyEndpointOptions,
  "endpoint"
>;

export function isAvanzaLocalBridgeReadonlyStatusEnabled(
  env: Pick<NodeJS.ProcessEnv, string> = process.env,
) {
  return (
    env[AVANZA_BRIDGE_READONLY_STATUS_ENV_FLAG] ===
    AVANZA_BRIDGE_READONLY_STATUS_ENABLED_VALUE
  );
}

export function resolveAvanzaLocalBridgeReadonlyEndpointPath(
  endpoint: AvanzaLocalBridgeReadonlyEndpoint,
): AvanzaLocalBridgeReadonlyEndpointPath {
  const path = AVANZA_LOCAL_BRIDGE_READONLY_ENDPOINTS[endpoint];

  if (!path) {
    throw new Error("readonly_bridge_endpoint_not_allowed");
  }

  return path;
}

export function isAvanzaLocalBridgeReadonlyEndpointPath(
  path: string,
): path is AvanzaLocalBridgeReadonlyEndpointPath {
  return Object.values(AVANZA_LOCAL_BRIDGE_READONLY_ENDPOINTS).includes(
    path as AvanzaLocalBridgeReadonlyEndpointPath,
  );
}

function normalizeBaseUrl(baseUrl: string | null | undefined) {
  return (baseUrl || DEFAULT_AVANZA_LOCAL_BRIDGE_READONLY_BASE_URL).replace(
    /\/+$/,
    "",
  );
}

function normalizeTimeout(timeoutMs: number | null | undefined) {
  return Number.isFinite(timeoutMs) && Number(timeoutMs) > 0
    ? Number(timeoutMs)
    : DEFAULT_AVANZA_LOCAL_BRIDGE_READONLY_TIMEOUT_MS;
}

function safeErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "request_timeout";
  }

  if (error instanceof Error) {
    return error.message || error.name;
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  return "readonly_bridge_fetch_failed";
}

function createDisabledResult(
  endpoint: AvanzaLocalBridgeReadonlyEndpoint,
): AvanzaLocalBridgeReadonlyFetchResult {
  return {
    ok: false,
    elapsedMs: 0,
    endpoint,
    path: resolveAvanzaLocalBridgeReadonlyEndpointPath(endpoint),
    statusCode: null,
    response: null,
    error: "readonly_status_not_configured",
    timedOut: false,
  };
}

export async function fetchAvanzaLocalBridgeReadonlyEndpoint({
  baseUrl,
  enabled,
  endpoint,
  fetchImpl = fetch,
  timeoutMs,
}: FetchAvanzaLocalBridgeReadonlyEndpointOptions): Promise<AvanzaLocalBridgeReadonlyFetchResult> {
  const configured =
    enabled === undefined || enabled === null
      ? isAvanzaLocalBridgeReadonlyStatusEnabled()
      : enabled;
  const path = resolveAvanzaLocalBridgeReadonlyEndpointPath(endpoint);

  if (!configured) {
    return createDisabledResult(endpoint);
  }

  const timeout = normalizeTimeout(timeoutMs);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const startedAt =
    typeof performance !== "undefined" ? performance.now() : Date.now();

  try {
    const response = await fetchImpl(`${normalizeBaseUrl(baseUrl)}${path}`, {
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: controller.signal,
    });
    const body = await response.json().catch(async () => {
      const text = await response.text().catch(() => "");
      return text ? { message: text.slice(0, 240) } : null;
    });

    return {
      ok: response.ok,
      elapsedMs: Math.max(
        0,
        Math.round(
          (typeof performance !== "undefined" ? performance.now() : Date.now()) -
            startedAt,
        ),
      ),
      endpoint,
      path,
      statusCode: response.status,
      response: body,
      error: response.ok ? null : `http_${response.status}`,
      timedOut: false,
    };
  } catch (error) {
    const message = safeErrorMessage(error);

    return {
      ok: false,
      elapsedMs: Math.max(
        0,
        Math.round(
          (typeof performance !== "undefined" ? performance.now() : Date.now()) -
            startedAt,
        ),
      ),
      endpoint,
      path,
      statusCode: null,
      response: null,
      error: message,
      timedOut: message === "request_timeout",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchAvanzaLocalBridgeReadonlyStatus(
  options: FetchAvanzaLocalBridgeReadonlyStatusOptions = {},
): Promise<AvanzaLocalBridgeReadonlyStatusFetchResult> {
  const startedAt =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const configured =
    options.enabled === undefined || options.enabled === null
      ? isAvanzaLocalBridgeReadonlyStatusEnabled()
      : options.enabled;

  if (!configured) {
    const source: AvanzaLocalBridgeStatusSource = { configured: false };

    return {
      completedAt: null,
      ok: false,
      configured: false,
      elapsedMs: null,
      source,
      summary: mapAvanzaLocalBridgeStatus(source),
      endpoints: {
        health: null,
        selfCheck: null,
        preflightOrderForm: null,
      },
    };
  }

  const [health, selfCheck, preflightOrderForm] = await Promise.all([
    fetchAvanzaLocalBridgeReadonlyEndpoint({
      ...options,
      endpoint: "health",
      enabled: configured,
    }),
    fetchAvanzaLocalBridgeReadonlyEndpoint({
      ...options,
      endpoint: "selfCheck",
      enabled: configured,
    }),
    fetchAvanzaLocalBridgeReadonlyEndpoint({
      ...options,
      endpoint: "preflightOrderForm",
      enabled: configured,
    }),
  ]);
  const completedAt = new Date().toISOString();
  const elapsedMs = Math.max(
    0,
    Math.round(
      (typeof performance !== "undefined" ? performance.now() : Date.now()) -
        startedAt,
    ),
  );
  const networkError =
    health.error || selfCheck.error || preflightOrderForm.error || null;
  const source: AvanzaLocalBridgeStatusSource = {
    configured,
    healthResponse: health.response,
    selfCheckResponse: selfCheck.response,
    preflightResponse: preflightOrderForm.response,
    networkError,
    checkedAt: completedAt,
  };
  const summary = mapAvanzaLocalBridgeStatus(source);

  return {
    completedAt,
    ok: summary.status === "preflight_ready",
    configured,
    elapsedMs,
    source,
    summary,
    endpoints: {
      health,
      selfCheck,
      preflightOrderForm,
    },
  };
}
