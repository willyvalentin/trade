import {
  validateSemiAutoAgentPayload,
  type SemiAutoAvanzaAgentPayload,
  type SemiAutoAgentPayloadValidationResult,
} from "@/lib/semi-auto-agent-payload-contract";

export const SANDBOX_BROWSER_AGENT_TARGET_PATH = "/sandbox-broker";

export type SandboxBrowserAgentPreparedFields = {
  action: "buy" | "sell";
  entry_price: number | null;
  limit_price: number | null;
  order_type: string;
  payload_id: string;
  planned_risk: number;
  quantity: number;
  stop: number;
  target: number;
  ticker: string;
};

export type SandboxBrowserAgentAdapterResult = {
  automatic_submit_allowed: false;
  blocking_reason: string | null;
  errors: string[];
  final_submit_attempted: false;
  human_final_confirmation_required: true;
  no_avanza_order: true;
  no_broker_action: true;
  prepared_fields: SandboxBrowserAgentPreparedFields | null;
  sandbox_only: true;
  status: "ready" | "blocked";
  target: typeof SANDBOX_BROWSER_AGENT_TARGET_PATH;
  validation: SemiAutoAgentPayloadValidationResult;
  warnings: string[];
};

function emptyValidation(error: string): SemiAutoAgentPayloadValidationResult {
  return {
    errors: [error],
    status: "blocked",
    valid: false,
    warnings: [],
  };
}

function isLocalHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  );
}

export function normalizeSandboxBrowserAgentTarget(
  target: string | URL | null | undefined,
): { error: string | null; target: typeof SANDBOX_BROWSER_AGENT_TARGET_PATH | null } {
  if (!target) {
    return { error: "target_missing", target: null };
  }

  const rawTarget = String(target).trim();

  if (rawTarget === SANDBOX_BROWSER_AGENT_TARGET_PATH) {
    return { error: null, target: SANDBOX_BROWSER_AGENT_TARGET_PATH };
  }

  try {
    const parsed = new URL(rawTarget);
    const blockedHostText = parsed.hostname.toLowerCase();

    if (
      blockedHostText.includes("avanza") ||
      blockedHostText.includes("broker")
    ) {
      return { error: "target_real_or_broker_host_blocked", target: null };
    }

    if (!isLocalHost(parsed.hostname)) {
      return { error: "target_must_be_local_sandbox", target: null };
    }

    if (parsed.pathname !== SANDBOX_BROWSER_AGENT_TARGET_PATH) {
      return { error: "target_path_must_be_sandbox_broker", target: null };
    }

    return { error: null, target: SANDBOX_BROWSER_AGENT_TARGET_PATH };
  } catch {
    return { error: "target_must_be_sandbox_broker", target: null };
  }
}

function buildPreparedFields(
  payload: SemiAutoAvanzaAgentPayload,
): SandboxBrowserAgentPreparedFields {
  return {
    action: payload.action,
    entry_price: payload.entry_price,
    limit_price: payload.limit_price,
    order_type: payload.order_type,
    payload_id: payload.payload_id,
    planned_risk: payload.total_planned_risk,
    quantity: payload.quantity,
    stop: payload.stop_price,
    target: payload.target_price,
    ticker: payload.ticker,
  };
}

function blockedResult(
  error: string,
  validation: SemiAutoAgentPayloadValidationResult = emptyValidation(error),
): SandboxBrowserAgentAdapterResult {
  return {
    automatic_submit_allowed: false,
    blocking_reason: error,
    errors: validation.errors.length > 0 ? validation.errors : [error],
    final_submit_attempted: false,
    human_final_confirmation_required: true,
    no_avanza_order: true,
    no_broker_action: true,
    prepared_fields: null,
    sandbox_only: true,
    status: "blocked",
    target: SANDBOX_BROWSER_AGENT_TARGET_PATH,
    validation,
    warnings: validation.warnings,
  };
}

export function prepareSandboxBrowserAgentFill(
  payload: SemiAutoAvanzaAgentPayload | null | undefined,
  options: {
    now?: string | Date;
    target?: string | URL | null;
  } = {},
): SandboxBrowserAgentAdapterResult {
  const target = normalizeSandboxBrowserAgentTarget(
    options.target ?? SANDBOX_BROWSER_AGENT_TARGET_PATH,
  );

  if (target.error || !target.target) {
    return blockedResult(target.error ?? "target_invalid");
  }

  const validation = validateSemiAutoAgentPayload(payload, {
    now: options.now,
  });

  if (!validation.valid || !payload) {
    return blockedResult("payload_not_ready_for_sandbox_fill", validation);
  }

  return {
    automatic_submit_allowed: false,
    blocking_reason: null,
    errors: [],
    final_submit_attempted: false,
    human_final_confirmation_required: true,
    no_avanza_order: true,
    no_broker_action: true,
    prepared_fields: buildPreparedFields(payload),
    sandbox_only: true,
    status: "ready",
    target: target.target,
    validation,
    warnings: validation.warnings,
  };
}
