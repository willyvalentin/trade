export type SemiAutoAgentPayloadVersion = "semi_auto_avanza_agent_payload_v1";

export type SemiAutoAgentPayloadMode = "semi_auto";

export type SemiAutoAgentPayloadSide = "buy" | "sell";

export type SemiAutoAgentPayloadOrderType =
  | "market"
  | "limit"
  | "market_reference"
  | "limit_reference";

export type SemiAutoAgentPayloadSourceContext =
  | "recommendation"
  | "live_position"
  | "manual_handoff";

export type SemiAutoAgentPayloadIntent =
  | "entry"
  | "manual_entry"
  | "exit_stop_loss"
  | "exit_target"
  | "manual_exit";

export type SemiAutoAgentPayloadSafetyCheckStatus =
  | "passed"
  | "warning"
  | "failed";

export type SemiAutoAgentPayloadSafetyCheck = {
  id: string;
  status: SemiAutoAgentPayloadSafetyCheckStatus;
  message: string;
};

export type SemiAutoAgentPayloadSafetySummary = {
  all_passed: boolean;
  checks: SemiAutoAgentPayloadSafetyCheck[];
};

export type SemiAutoAgentPayloadAuthority = {
  human_final_confirmation_required: true;
  automatic_submit_allowed: false;
  final_confirmation_actor: "human";
  agent_can_prepare_broker_fields: true;
  agent_can_submit_order: false;
};

export type SemiAutoAvanzaAgentPayload = {
  version: SemiAutoAgentPayloadVersion;
  mode: SemiAutoAgentPayloadMode;
  payload_id: string;
  created_at: string;
  recommendation_id: string | null;
  recommendation_fingerprint: string | null;
  position_id: string | null;
  payload_fingerprint: string;
  ticker: string;
  side: SemiAutoAgentPayloadSide;
  action: SemiAutoAgentPayloadSide;
  quantity: number;
  order_type: SemiAutoAgentPayloadOrderType;
  entry_price: number | null;
  limit_price: number | null;
  stop_price: number;
  target_price: number;
  risk_per_share: number;
  total_planned_risk: number;
  expires_at: string;
  stale_after: string;
  broker_target_label: string;
  source_context: SemiAutoAgentPayloadSourceContext;
  intent: SemiAutoAgentPayloadIntent;
  authority: SemiAutoAgentPayloadAuthority;
  safety_check_summary: SemiAutoAgentPayloadSafetySummary;
  warnings: string[];
  errors: string[];
};

export type SemiAutoAgentPayloadValidationStatus = "ready" | "blocked";

export type SemiAutoAgentPayloadValidationResult = {
  valid: boolean;
  status: SemiAutoAgentPayloadValidationStatus;
  errors: string[];
  warnings: string[];
};

export type SemiAutoAgentPayloadIdentityInput = Pick<
  SemiAutoAvanzaAgentPayload,
  | "version"
  | "mode"
  | "recommendation_id"
  | "recommendation_fingerprint"
  | "position_id"
  | "ticker"
  | "side"
  | "quantity"
  | "order_type"
  | "entry_price"
  | "limit_price"
  | "stop_price"
  | "target_price"
  | "source_context"
  | "intent"
  | "expires_at"
>;

const entryIntents: SemiAutoAgentPayloadIntent[] = ["entry", "manual_entry"];

const exitIntents: SemiAutoAgentPayloadIntent[] = [
  "exit_stop_loss",
  "exit_target",
  "manual_exit",
];

export const SEMI_AUTO_AGENT_PAYLOAD_AUTHORITY: SemiAutoAgentPayloadAuthority = {
  human_final_confirmation_required: true,
  automatic_submit_allowed: false,
  final_confirmation_actor: "human",
  agent_can_prepare_broker_fields: true,
  agent_can_submit_order: false,
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return isFinitePositiveNumber(value) && Number.isInteger(value);
}

function isValidTimestamp(value: unknown): value is string {
  return hasText(value) && Number.isFinite(Date.parse(value));
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value) ?? "null";
}

function fingerprint(value: unknown): string {
  const text = stableStringify(value);
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `semi_auto_fp_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function sanitizeIdentityPart(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_") || "unknown";
}

export function buildSemiAutoAgentPayloadIdentity(
  input: SemiAutoAgentPayloadIdentityInput,
): { payload_id: string; payload_fingerprint: string } {
  const payload_fingerprint = fingerprint(input);
  const ticker = sanitizeIdentityPart(input.ticker);

  return {
    payload_id: `semi_auto_${ticker}_${input.side}_${payload_fingerprint}`,
    payload_fingerprint,
  };
}

function collectAuthorityErrors(
  payload: Partial<SemiAutoAvanzaAgentPayload>,
): string[] {
  const errors: string[] = [];
  const authority = payload.authority;

  if (payload.mode !== "semi_auto") {
    errors.push("mode_must_be_semi_auto");
  }

  if (authority?.human_final_confirmation_required !== true) {
    errors.push("human_final_confirmation_required");
  }

  if (authority?.automatic_submit_allowed !== false) {
    errors.push("automatic_submit_must_be_false");
  }

  if (authority?.final_confirmation_actor !== "human") {
    errors.push("final_confirmation_actor_must_be_human");
  }

  if (authority?.agent_can_submit_order !== false) {
    errors.push("agent_submit_must_be_false");
  }

  return errors;
}

function collectCompatibilityErrors(
  payload: Partial<SemiAutoAvanzaAgentPayload>,
): string[] {
  const errors: string[] = [];

  if (payload.side !== payload.action) {
    errors.push("side_action_mismatch");
  }

  if (payload.side === "buy" && !entryIntents.includes(payload.intent as never)) {
    errors.push("buy_payload_requires_entry_intent");
  }

  if (payload.side === "sell" && !exitIntents.includes(payload.intent as never)) {
    errors.push("sell_payload_requires_exit_intent");
  }

  if (payload.source_context === "recommendation" && payload.side !== "buy") {
    errors.push("recommendation_source_requires_buy_side");
  }

  if (payload.source_context === "live_position" && payload.side !== "sell") {
    errors.push("live_position_source_requires_sell_side");
  }

  return errors;
}

export function validateSemiAutoAgentPayload(
  payload: Partial<SemiAutoAvanzaAgentPayload> | null | undefined,
  options: { now?: string | Date } = {},
): SemiAutoAgentPayloadValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!payload) {
    return {
      valid: false,
      status: "blocked",
      errors: ["payload_missing"],
      warnings,
    };
  }

  if (payload.version !== "semi_auto_avanza_agent_payload_v1") {
    errors.push("version_invalid");
  }

  if (!hasText(payload.payload_id)) {
    errors.push("payload_id_missing");
  }

  if (!hasText(payload.payload_fingerprint)) {
    errors.push("payload_fingerprint_missing");
  }

  if (!isValidTimestamp(payload.created_at)) {
    errors.push("created_at_invalid");
  }

  if (!hasText(payload.ticker)) {
    errors.push("ticker_missing");
  }

  if (payload.side !== "buy" && payload.side !== "sell") {
    errors.push("side_invalid");
  }

  if (payload.action !== "buy" && payload.action !== "sell") {
    errors.push("action_invalid");
  }

  if (!isPositiveInteger(payload.quantity)) {
    errors.push("quantity_must_be_positive_integer");
  }

  if (!hasText(payload.order_type)) {
    errors.push("order_type_missing");
  }

  if (!isFinitePositiveNumber(payload.stop_price)) {
    errors.push("stop_price_required");
  }

  if (!isFinitePositiveNumber(payload.target_price)) {
    errors.push("target_price_required");
  }

  if (!isFinitePositiveNumber(payload.risk_per_share)) {
    errors.push("risk_per_share_required");
  }

  if (!isFinitePositiveNumber(payload.total_planned_risk)) {
    errors.push("total_planned_risk_required");
  }

  if (!isValidTimestamp(payload.expires_at)) {
    errors.push("expires_at_invalid");
  }

  if (!isValidTimestamp(payload.stale_after)) {
    errors.push("stale_after_invalid");
  }

  if (!hasText(payload.broker_target_label)) {
    errors.push("broker_target_label_missing");
  }

  if (
    payload.source_context !== "recommendation" &&
    payload.source_context !== "live_position" &&
    payload.source_context !== "manual_handoff"
  ) {
    errors.push("source_context_invalid");
  }

  errors.push(...collectAuthorityErrors(payload));
  errors.push(...collectCompatibilityErrors(payload));

  if (payload.safety_check_summary?.all_passed !== true) {
    errors.push("safety_checks_not_passed");
  }

  const failedSafetyChecks =
    payload.safety_check_summary?.checks.filter(
      (check) => check.status === "failed",
    ) ?? [];

  if (failedSafetyChecks.length > 0) {
    errors.push("safety_check_failed");
  }

  const nowTime =
    options.now instanceof Date
      ? options.now.getTime()
      : isValidTimestamp(options.now)
        ? Date.parse(options.now)
        : null;
  const staleAfterTime = isValidTimestamp(payload.stale_after)
    ? Date.parse(payload.stale_after)
    : null;
  const expiresAtTime = isValidTimestamp(payload.expires_at)
    ? Date.parse(payload.expires_at)
    : null;

  if (nowTime !== null && staleAfterTime !== null && nowTime > staleAfterTime) {
    errors.push("payload_stale");
  }

  if (nowTime !== null && expiresAtTime !== null && nowTime > expiresAtTime) {
    errors.push("payload_expired");
  }

  return {
    valid: errors.length === 0,
    status: errors.length === 0 ? "ready" : "blocked",
    errors,
    warnings,
  };
}
