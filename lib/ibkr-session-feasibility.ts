import { createHash } from "node:crypto";

export const IBKR_SESSION_FEASIBILITY_VERSION =
  "ibkr_session_feasibility_v1" as const;
export const IBKR_SESSION_PROBE_RECEIPT_VERSION =
  "ibkr_session_probe_receipt_v1" as const;

export type IbkrTransport = "web_api" | "tws_api_ib_gateway";

export type IbkrSessionProbeReceipt = Readonly<{
  receipt_version: typeof IBKR_SESSION_PROBE_RECEIPT_VERSION;
  receipt_id: string;
  owner_user_id: string;
  broker_account_id: string;
  account_mode: "paper";
  transport: IbkrTransport;
  observed_at: string;
  expires_at: string;
  authentication: Readonly<{
    method: "first_party_oauth_1a" | "ib_gateway_interactive";
    credential_values_in_receipt: false;
    authenticated_session_observed: boolean;
    brokerage_session_initialized: boolean;
    operator_reauthentication_required: boolean;
    session_recovery_tested: boolean;
  }>;
  account_readback: Readonly<{
    account_list_read: boolean;
    target_account_matched: boolean;
    paper_account_confirmed: boolean;
    buying_power_read: boolean;
    positions_read: boolean;
    open_orders_read: boolean;
    executions_read: boolean;
    stock_trading_permission_confirmed: boolean;
    market_data_permission_confirmed: boolean;
  }>;
  hosting: Readonly<{
    connection_owner:
      | "persistent_server_worker"
      | "serverless_request_handler"
      | "browser";
    server_owned_secrets: boolean;
    single_active_broker_session_enforced: boolean;
    health_check_observed: boolean;
    restart_recovery_tested: boolean;
  }>;
  constraints: Readonly<{
    global_requests_per_second: number;
    endpoint_pacing_modeled: boolean;
    daily_maintenance_modeled: boolean;
    order_submission_enabled: false;
    live_fallback_enabled: false;
    recommendation_market_data_enabled: false;
  }>;
}>;

export type IbkrSessionFeasibilityInput = Readonly<{
  feasibility_version: typeof IBKR_SESSION_FEASIBILITY_VERSION;
  evaluated_at: string;
  receipt: IbkrSessionProbeReceipt;
}>;

export type IbkrSessionFeasibilityDisposition =
  | "read_only_feasible"
  | "read_only_feasible_operator_restore_required"
  | "blocked";

export type IbkrSessionFeasibilityResult = Readonly<{
  feasibility_version: typeof IBKR_SESSION_FEASIBILITY_VERSION;
  status: "completed" | "blocked";
  disposition: IbkrSessionFeasibilityDisposition;
  reason_codes: readonly string[];
  evidence_gaps: readonly string[];
  owner_user_id: string | null;
  broker_account_id: string | null;
  account_mode: "paper" | null;
  transport: IbkrTransport | null;
  receipt_id: string | null;
  receipt_observed_at: string | null;
  receipt_expires_at: string | null;
  admitted_read_capabilities: readonly string[];
  input_digest: string;
  result_digest: string;
  safety: Readonly<{
    paper_only: true;
    supplied_receipt_only: true;
    environment_verified_by_this_function: false;
    broker_transport_present: false;
    credential_read_authorized: false;
    order_submission_authorized: false;
    order_modification_authorized: false;
    order_cancellation_authorized: false;
    live_account_authorized: false;
    provider_request_authorized: false;
    database_write_authorized: false;
  }>;
}>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACCOUNT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{2,31}$/;
const MAX_RECEIPT_LIFETIME_MS = 15 * 60 * 1_000;
const IBKR_GLOBAL_REQUEST_LIMIT = 10;

const TOP_LEVEL_KEYS = ["evaluated_at", "feasibility_version", "receipt"];
const RECEIPT_KEYS = [
  "account_mode",
  "account_readback",
  "authentication",
  "broker_account_id",
  "constraints",
  "expires_at",
  "hosting",
  "observed_at",
  "owner_user_id",
  "receipt_id",
  "receipt_version",
  "transport",
];
const AUTHENTICATION_KEYS = [
  "authenticated_session_observed",
  "brokerage_session_initialized",
  "credential_values_in_receipt",
  "method",
  "operator_reauthentication_required",
  "session_recovery_tested",
];
const ACCOUNT_READBACK_KEYS = [
  "account_list_read",
  "buying_power_read",
  "executions_read",
  "market_data_permission_confirmed",
  "open_orders_read",
  "paper_account_confirmed",
  "positions_read",
  "stock_trading_permission_confirmed",
  "target_account_matched",
];
const HOSTING_KEYS = [
  "connection_owner",
  "health_check_observed",
  "restart_recovery_tested",
  "server_owned_secrets",
  "single_active_broker_session_enforced",
];
const CONSTRAINT_KEYS = [
  "daily_maintenance_modeled",
  "endpoint_pacing_modeled",
  "global_requests_per_second",
  "live_fallback_enabled",
  "order_submission_enabled",
  "recommendation_market_data_enabled",
];
const AUTHENTICATION_BOOLEAN_KEYS = [
  "authenticated_session_observed",
  "brokerage_session_initialized",
  "credential_values_in_receipt",
  "operator_reauthentication_required",
  "session_recovery_tested",
] as const;
const ACCOUNT_READBACK_BOOLEAN_KEYS = ACCOUNT_READBACK_KEYS;
const HOSTING_BOOLEAN_KEYS = [
  "health_check_observed",
  "restart_recovery_tested",
  "server_owned_secrets",
  "single_active_broker_session_enforced",
] as const;
const CONSTRAINT_BOOLEAN_KEYS = [
  "daily_maintenance_modeled",
  "endpoint_pacing_modeled",
  "live_fallback_enabled",
  "order_submission_enabled",
  "recommendation_market_data_enabled",
] as const;

const SAFETY = Object.freeze({
  paper_only: true as const,
  supplied_receipt_only: true as const,
  environment_verified_by_this_function: false as const,
  broker_transport_present: false as const,
  credential_read_authorized: false as const,
  order_submission_authorized: false as const,
  order_modification_authorized: false as const,
  order_cancellation_authorized: false as const,
  live_account_authorized: false as const,
  provider_request_authorized: false as const,
  database_write_authorized: false as const,
});

function canonical(value: unknown): unknown {
  if (typeof value === "number" && !Number.isFinite(value)) {
    return { __invalid_non_finite_number__: String(value) };
  }
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
}

function safeDigest(value: unknown) {
  try {
    return digest(value);
  } catch {
    return digest({ uninspectable_input: true });
  }
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const item of Object.values(value as Record<string, unknown>)) {
      deepFreeze(item);
    }
    Object.freeze(value);
  }
  return value;
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function exactDataRecord(value: unknown, expectedKeys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (Object.getOwnPropertySymbols(value).length > 0) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Object.keys(descriptors).sort();
  if (keys.length !== expectedKeys.length) return false;
  if (!keys.every((key, index) => key === [...expectedKeys].sort()[index])) {
    return false;
  }
  return Object.values(descriptors).every(
    (descriptor) =>
      "value" in descriptor &&
      descriptor.enumerable === true &&
      descriptor.get === undefined &&
      descriptor.set === undefined,
  );
}

function booleanFields(
  value: Record<string, unknown>,
  keys: readonly string[],
) {
  return keys.every((key) => typeof value[key] === "boolean");
}

function blocked(input: unknown, reasonCodes: readonly string[]) {
  const inputDigest = safeDigest(input);
  const resultWithoutDigest = {
    feasibility_version: IBKR_SESSION_FEASIBILITY_VERSION,
    status: "blocked" as const,
    disposition: "blocked" as const,
    reason_codes: [...reasonCodes].sort(),
    evidence_gaps: [] as string[],
    owner_user_id: null,
    broker_account_id: null,
    account_mode: null,
    transport: null,
    receipt_id: null,
    receipt_observed_at: null,
    receipt_expires_at: null,
    admitted_read_capabilities: [] as string[],
    input_digest: inputDigest,
    safety: SAFETY,
  };
  return deepFreeze({
    ...resultWithoutDigest,
    result_digest: digest(resultWithoutDigest),
  }) satisfies IbkrSessionFeasibilityResult;
}

/**
 * Validates an already supplied, redacted read-only probe receipt. This pure
 * function never opens an IBKR session, authenticates, reads a credential,
 * calls a broker endpoint, writes persistence or grants order authority.
 */
export function assessIbkrPaperSessionFeasibility(
  input: unknown,
): IbkrSessionFeasibilityResult {
  try {
    if (!exactDataRecord(input, TOP_LEVEL_KEYS)) {
      return blocked(input, ["invalid_feasibility_envelope"]);
    }
    const request = input as IbkrSessionFeasibilityInput;
    if (
      request.feasibility_version !== IBKR_SESSION_FEASIBILITY_VERSION ||
      !explicitInstant(request.evaluated_at)
    ) {
      return blocked(input, ["invalid_feasibility_envelope"]);
    }

    const receipt = request.receipt;
    if (
      !exactDataRecord(receipt, RECEIPT_KEYS) ||
      receipt.receipt_version !== IBKR_SESSION_PROBE_RECEIPT_VERSION ||
      !UUID_PATTERN.test(receipt.receipt_id) ||
      !UUID_PATTERN.test(receipt.owner_user_id) ||
      !ACCOUNT_PATTERN.test(receipt.broker_account_id) ||
      receipt.account_mode !== "paper" ||
      !["web_api", "tws_api_ib_gateway"].includes(receipt.transport) ||
      !explicitInstant(receipt.observed_at) ||
      !explicitInstant(receipt.expires_at) ||
      !exactDataRecord(receipt.authentication, AUTHENTICATION_KEYS) ||
      !exactDataRecord(receipt.account_readback, ACCOUNT_READBACK_KEYS) ||
      !exactDataRecord(receipt.hosting, HOSTING_KEYS) ||
      !exactDataRecord(receipt.constraints, CONSTRAINT_KEYS) ||
      !booleanFields(
        receipt.authentication as unknown as Record<string, unknown>,
        AUTHENTICATION_BOOLEAN_KEYS,
      ) ||
      !booleanFields(
        receipt.account_readback as unknown as Record<string, unknown>,
        ACCOUNT_READBACK_BOOLEAN_KEYS,
      ) ||
      !booleanFields(
        receipt.hosting as unknown as Record<string, unknown>,
        HOSTING_BOOLEAN_KEYS,
      ) ||
      !booleanFields(
        receipt.constraints as unknown as Record<string, unknown>,
        CONSTRAINT_BOOLEAN_KEYS,
      )
    ) {
      return blocked(input, ["invalid_probe_receipt"]);
    }

    const observedAt = Date.parse(receipt.observed_at);
    const expiresAt = Date.parse(receipt.expires_at);
    const evaluatedAt = Date.parse(request.evaluated_at);
    if (
      observedAt > evaluatedAt ||
      evaluatedAt > expiresAt ||
      expiresAt <= observedAt ||
      expiresAt - observedAt > MAX_RECEIPT_LIFETIME_MS
    ) {
      return blocked(input, ["stale_or_invalid_probe_window"]);
    }

    const reasons: string[] = [];
    const authentication = receipt.authentication;
    const expectedMethod =
      receipt.transport === "web_api"
        ? "first_party_oauth_1a"
        : "ib_gateway_interactive";
    if (authentication.method !== expectedMethod) {
      reasons.push("transport_authentication_mismatch");
    }
    if (authentication.credential_values_in_receipt !== false) {
      reasons.push("credential_value_disclosure_forbidden");
    }
    if (!authentication.authenticated_session_observed) {
      reasons.push("authenticated_session_not_observed");
    }
    if (!authentication.brokerage_session_initialized) {
      reasons.push("brokerage_session_not_initialized");
    }

    const account = receipt.account_readback;
    const requiredAccountReads: Array<[boolean, string]> = [
      [account.account_list_read, "account_list_not_read"],
      [account.target_account_matched, "target_account_not_matched"],
      [account.paper_account_confirmed, "paper_account_not_confirmed"],
      [account.buying_power_read, "buying_power_not_read"],
      [account.positions_read, "positions_not_read"],
      [account.open_orders_read, "open_orders_not_read"],
      [account.executions_read, "executions_not_read"],
      [
        account.stock_trading_permission_confirmed,
        "stock_trading_permission_not_confirmed",
      ],
    ];
    for (const [confirmed, reason] of requiredAccountReads) {
      if (!confirmed) reasons.push(reason);
    }

    const hosting = receipt.hosting;
    if (hosting.connection_owner !== "persistent_server_worker") {
      reasons.push("persistent_connection_owner_required");
    }
    if (!hosting.server_owned_secrets) {
      reasons.push("server_owned_secrets_not_confirmed");
    }
    if (!hosting.single_active_broker_session_enforced) {
      reasons.push("single_active_broker_session_not_enforced");
    }
    if (!hosting.health_check_observed) {
      reasons.push("broker_session_health_not_observed");
    }

    const constraints = receipt.constraints;
    if (
      !Number.isSafeInteger(constraints.global_requests_per_second) ||
      constraints.global_requests_per_second <= 0 ||
      constraints.global_requests_per_second > IBKR_GLOBAL_REQUEST_LIMIT
    ) {
      reasons.push("global_pacing_budget_invalid");
    }
    if (!constraints.endpoint_pacing_modeled) {
      reasons.push("endpoint_pacing_not_modeled");
    }
    if (!constraints.daily_maintenance_modeled) {
      reasons.push("daily_maintenance_not_modeled");
    }
    if (constraints.order_submission_enabled !== false) {
      reasons.push("order_submission_must_remain_disabled");
    }
    if (constraints.live_fallback_enabled !== false) {
      reasons.push("live_fallback_must_remain_disabled");
    }
    if (constraints.recommendation_market_data_enabled !== false) {
      reasons.push("recommendation_market_data_out_of_scope");
    }

    if (reasons.length > 0) return blocked(input, reasons);

    const evidenceGaps: string[] = [];
    if (!account.market_data_permission_confirmed) {
      evidenceGaps.push("market_data_permission_unverified");
    }
    const recoveryComplete =
      authentication.session_recovery_tested && hosting.restart_recovery_tested;
    if (!authentication.session_recovery_tested) {
      evidenceGaps.push("session_recovery_unverified");
    }
    if (!hosting.restart_recovery_tested) {
      evidenceGaps.push("worker_restart_recovery_unverified");
    }
    if (authentication.operator_reauthentication_required) {
      evidenceGaps.push("operator_reauthentication_required");
    }

    const disposition: IbkrSessionFeasibilityDisposition = recoveryComplete
      ? "read_only_feasible"
      : "read_only_feasible_operator_restore_required";
    const inputDigest = digest(input);
    const resultWithoutDigest = {
      feasibility_version: IBKR_SESSION_FEASIBILITY_VERSION,
      status: "completed" as const,
      disposition,
      reason_codes: [
        recoveryComplete
          ? "paper_read_only_capabilities_observed"
          : "paper_read_only_capabilities_observed_recovery_incomplete",
      ],
      evidence_gaps: [...new Set(evidenceGaps)].sort(),
      owner_user_id: receipt.owner_user_id,
      broker_account_id: receipt.broker_account_id,
      account_mode: "paper" as const,
      transport: receipt.transport,
      receipt_id: receipt.receipt_id,
      receipt_observed_at: receipt.observed_at,
      receipt_expires_at: receipt.expires_at,
      admitted_read_capabilities: [
        "accounts",
        "buying_power",
        "executions",
        "open_orders",
        "positions",
      ],
      input_digest: inputDigest,
      safety: SAFETY,
    };
    return deepFreeze({
      ...resultWithoutDigest,
      result_digest: digest(resultWithoutDigest),
    }) satisfies IbkrSessionFeasibilityResult;
  } catch {
    return blocked({ uninspectable_input: true }, ["uninspectable_input"]);
  }
}
