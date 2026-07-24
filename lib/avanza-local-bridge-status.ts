export type AvanzaLocalBridgeUiStatus =
  | "not_configured"
  | "unavailable"
  | "available"
  | "self_check_unavailable"
  | "preflight_ready"
  | "preflight_blocked"
  | "unknown_error";

export type AvanzaLocalBridgeEndpointStatus =
  | "not_checked"
  | "ok"
  | "blocked"
  | "unavailable"
  | "error";

export type AvanzaLocalBridgeStatusSource = {
  configured?: boolean | null;
  healthResponse?: unknown;
  selfCheckResponse?: unknown;
  preflightResponse?: unknown;
  networkError?: unknown;
  checkedAt?: string | null;
};

export type AvanzaLocalBridgeStatusSummary = {
  status: AvanzaLocalBridgeUiStatus;
  bridgeAvailable: boolean;
  selfCheckAvailable: boolean;
  preflightReady: boolean;
  manualObservationReady: boolean;
  checkedAt: string | null;
  endpoints: {
    health: AvanzaLocalBridgeEndpointStatus;
    selfCheck: AvanzaLocalBridgeEndpointStatus;
    preflight: AvanzaLocalBridgeEndpointStatus;
  };
  safeMessage: string;
  blockers: string[];
  warnings: string[];
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function nestedRecord(value: unknown, key: string): JsonRecord | null {
  return isRecord(value) && isRecord(value[key]) ? value[key] : null;
}

function extractErrorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return error.message || error.name;
  }

  if (typeof error === "string") {
    return error.trim() || null;
  }

  return "bridge_status_check_failed";
}

export function mapAvanzaLocalBridgeHealthResponse(
  response: unknown,
): AvanzaLocalBridgeEndpointStatus {
  if (!isRecord(response)) {
    return "not_checked";
  }

  const bridgeStatus = stringValue(response.bridgeStatus);
  const healthStatus = stringValue(nestedRecord(response, "health")?.status);

  if (bridgeStatus === "available" || healthStatus === "available") {
    return "ok";
  }

  if (
    bridgeStatus === "unavailable" ||
    bridgeStatus === "disconnected" ||
    bridgeStatus === "error" ||
    healthStatus === "unavailable" ||
    healthStatus === "disconnected" ||
    healthStatus === "error"
  ) {
    return "unavailable";
  }

  return "error";
}

export function mapAvanzaLocalBridgeSelfCheckResponse(
  response: unknown,
): AvanzaLocalBridgeEndpointStatus {
  if (!isRecord(response)) {
    return "not_checked";
  }

  if (booleanValue(response.ok) === true) {
    return "ok";
  }

  const selfCheck = nestedRecord(response, "selfCheck");
  const selfCheckStatus = stringValue(selfCheck?.status);

  if (
    booleanValue(response.ok) === false ||
    selfCheckStatus === "unavailable" ||
    selfCheckStatus === "blocked" ||
    selfCheckStatus === "failed"
  ) {
    return "unavailable";
  }

  return "error";
}

export function mapAvanzaOrderFormPreflightResponse(
  response: unknown,
): AvanzaLocalBridgeEndpointStatus {
  if (!isRecord(response)) {
    return "not_checked";
  }

  const ok = booleanValue(response.ok);
  const status = stringValue(response.status);
  const preflightStatus = stringValue(nestedRecord(response, "preflight")?.status);

  if (ok === true && (status === "ready" || preflightStatus === "ready")) {
    return "ok";
  }

  if (
    ok === false ||
    status === "blocked" ||
    status === "mismatch" ||
    status === "failed" ||
    preflightStatus === "blocked" ||
    preflightStatus === "mismatch" ||
    preflightStatus === "failed"
  ) {
    return "blocked";
  }

  return "error";
}

export function mapAvanzaLocalBridgeStatus(
  source: AvanzaLocalBridgeStatusSource,
): AvanzaLocalBridgeStatusSummary {
  const configured = source.configured !== false;
  const networkError = extractErrorMessage(source.networkError);

  const health = networkError
    ? "unavailable"
    : mapAvanzaLocalBridgeHealthResponse(source.healthResponse);
  const selfCheck = networkError
    ? "unavailable"
    : mapAvanzaLocalBridgeSelfCheckResponse(source.selfCheckResponse);
  const preflight = networkError
    ? "unavailable"
    : mapAvanzaOrderFormPreflightResponse(source.preflightResponse);

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!configured) {
    blockers.push("local_bridge_not_configured");

    return {
      status: "not_configured",
      bridgeAvailable: false,
      selfCheckAvailable: false,
      preflightReady: false,
      manualObservationReady: false,
      checkedAt: source.checkedAt ?? null,
      endpoints: { health, selfCheck, preflight },
      safeMessage: "Local Avanza bridge is not configured.",
      blockers,
      warnings,
    };
  }

  if (networkError) {
    blockers.push("local_bridge_unreachable");
    warnings.push(networkError);

    return {
      status: "unavailable",
      bridgeAvailable: false,
      selfCheckAvailable: false,
      preflightReady: false,
      manualObservationReady: false,
      checkedAt: source.checkedAt ?? null,
      endpoints: { health, selfCheck, preflight },
      safeMessage: "Local Avanza bridge is unavailable.",
      blockers,
      warnings,
    };
  }

  if (health !== "ok") {
    blockers.push("local_bridge_health_unavailable");

    return {
      status: health === "not_checked" ? "unknown_error" : "unavailable",
      bridgeAvailable: false,
      selfCheckAvailable: false,
      preflightReady: false,
      manualObservationReady: false,
      checkedAt: source.checkedAt ?? null,
      endpoints: { health, selfCheck, preflight },
      safeMessage: "Local Avanza bridge health is not available.",
      blockers,
      warnings,
    };
  }

  if (preflight === "ok") {
    return {
      status: "preflight_ready",
      bridgeAvailable: true,
      selfCheckAvailable: selfCheck === "ok",
      preflightReady: true,
      manualObservationReady: true,
      checkedAt: source.checkedAt ?? null,
      endpoints: { health, selfCheck, preflight },
      safeMessage: "Avanza order-form preflight is ready.",
      blockers,
      warnings,
    };
  }

  if (preflight === "blocked") {
    blockers.push("avanza_order_form_preflight_blocked");

    return {
      status: "preflight_blocked",
      bridgeAvailable: true,
      selfCheckAvailable: selfCheck === "ok",
      preflightReady: false,
      manualObservationReady: false,
      checkedAt: source.checkedAt ?? null,
      endpoints: { health, selfCheck, preflight },
      safeMessage: "Avanza order-form preflight is blocked.",
      blockers,
      warnings,
    };
  }

  if (selfCheck === "unavailable" || selfCheck === "blocked") {
    blockers.push("local_bridge_self_check_unavailable");

    return {
      status: "self_check_unavailable",
      bridgeAvailable: true,
      selfCheckAvailable: false,
      preflightReady: false,
      manualObservationReady: false,
      checkedAt: source.checkedAt ?? null,
      endpoints: { health, selfCheck, preflight },
      safeMessage: "Local Avanza bridge is available, but self-check is unavailable.",
      blockers,
      warnings,
    };
  }

  if (selfCheck === "error" || preflight === "error") {
    blockers.push("local_bridge_status_unknown");

    return {
      status: "unknown_error",
      bridgeAvailable: true,
      selfCheckAvailable: selfCheck === "ok",
      preflightReady: false,
      manualObservationReady: false,
      checkedAt: source.checkedAt ?? null,
      endpoints: { health, selfCheck, preflight },
      safeMessage: "Local Avanza bridge status is unknown.",
      blockers,
      warnings,
    };
  }

  return {
    status: "available",
    bridgeAvailable: true,
    selfCheckAvailable: selfCheck === "ok",
    preflightReady: false,
    manualObservationReady: false,
    checkedAt: source.checkedAt ?? null,
    endpoints: { health, selfCheck, preflight },
    safeMessage: "Local Avanza bridge is available.",
    blockers,
    warnings,
  };
}
