import {
  type BoundedShadowCollectorExecutionProofPreflightResult,
  type BoundedShadowCollectorExecutionProofRequest,
  type BoundedShadowCollectorExecutionProofResult,
} from "@/lib/bounded-shadow-collector-execution-proof";

export const boundedShadowCollectorLiveProofReceiptContractVersion =
  "bounded_shadow_collector_live_proof_receipt_v1" as const;

export const boundedShadowCollectorLiveProofReceiptRouteMarker =
  "action_571_live_proof_receipt_v1" as const;

export const boundedShadowCollectorLatestProofReceiptRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/latest-receipt" as const;

export type BoundedShadowCollectorLiveProofReceiptCategory =
  | "blocked_before_provider_attempt"
  | "provider_success_with_candles"
  | "provider_success_empty"
  | "provider_timeout"
  | "provider_failure"
  | "provider_response_invalid"
  | "internal_execution_failure";

export type BoundedShadowCollectorProofEntryKind =
  | "bounded_manual_proof"
  | "scheduled_shadow_collector_canary";

export type BoundedShadowCollectorLiveProofReceipt = {
  contract_version: typeof boundedShadowCollectorLiveProofReceiptContractVersion;
  build_marker: string;
  entry_kind: BoundedShadowCollectorProofEntryKind;
  daily_claim_id: string | null;
  daily_claim_status: "claimed" | "attempted" | "completed" | "failed" | null;
  provider_metadata_status: "within_budget" | "approaching_limit" | "unresolved";
  receipt_id: string;
  generated_at: string;
  request_fingerprint: string;
  execution_status: "executed" | "blocked" | "failed";
  primary_result_category: BoundedShadowCollectorLiveProofReceiptCategory;
  provider_attempt_occurred: boolean;
  provider_request_count: 0 | 1;
  provider_credit_ceiling: 1;
  estimated_credits: number | null;
  actual_credits: number | null;
  ticker: string;
  interval: BoundedShadowCollectorExecutionProofRequest["interval"];
  requested_start: string;
  requested_end: string;
  candle_count: number | null;
  first_candle_at: string | null;
  last_candle_at: string | null;
  provider_status_category: "available" | "empty" | "unavailable" | null;
  fallback_used: boolean | null;
  retry_count: number | null;
  rate_limited: boolean | null;
  timeout_occurred: boolean;
  provider_response_structurally_valid: boolean | null;
  planner: BoundedShadowCollectorExecutionProofPreflightResult["planner"];
  hard_reserve_preserved: boolean;
  execution_ready_reserve_consumed: false;
  operator_authorization_verified: boolean;
  authorization_consumed: boolean;
  authorization_request_bound: boolean;
  authorization_single_use: true;
  safe_blocker_or_failure_category: string | null;
  safe_operator_message: string;
  durable: false;
  process_local_only: true;
  persisted: false;
  no_effect_boundary: {
    shared_cache_mutated: false;
    supabase_writes_executed: false;
    schedule_changes: false;
    recommendation_changes: false;
    scanner_changes: false;
    ranking_changes: false;
    confidence_changes: false;
    execution_or_broker_actions: false;
  };
};

type ReceiptInput = {
  request: BoundedShadowCollectorExecutionProofRequest;
  preflight: BoundedShadowCollectorExecutionProofPreflightResult;
  result: BoundedShadowCollectorExecutionProofResult;
  operator_authorization_verified: boolean;
  authorization_consumed: boolean;
  receipt_id?: string;
  now?: Date;
  entry_kind?: BoundedShadowCollectorProofEntryKind;
  daily_claim_id?: string | null;
  daily_claim_status?: "claimed" | "attempted" | "completed" | "failed" | null;
};

function defaultReceiptId() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return `proof_receipt_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function noEffectBoundary() {
  return {
    shared_cache_mutated: false,
    supabase_writes_executed: false,
    schedule_changes: false,
    recommendation_changes: false,
    scanner_changes: false,
    ranking_changes: false,
    confidence_changes: false,
    execution_or_broker_actions: false,
  } as const;
}

function failureCategory(result: Exclude<BoundedShadowCollectorExecutionProofResult, { ok: true }>) {
  if (result.blocker === "internal_execution_failure") {
    return "internal_execution_failure" as const;
  }
  if (result.provider_request_count === 0) return "blocked_before_provider_attempt" as const;
  if (result.blocker === "provider_timeout") return "provider_timeout" as const;
  if (result.blocker === "invalid_provider_response") return "provider_response_invalid" as const;
  return "provider_failure" as const;
}

export function buildBoundedShadowCollectorLiveProofReceipt(
  input: ReceiptInput,
): BoundedShadowCollectorLiveProofReceipt {
  const base = {
    contract_version: boundedShadowCollectorLiveProofReceiptContractVersion,
    build_marker: boundedShadowCollectorLiveProofReceiptRouteMarker,
    entry_kind: input.entry_kind ?? "bounded_manual_proof",
    daily_claim_id: input.daily_claim_id ?? null,
    daily_claim_status: input.daily_claim_status ?? null,
    provider_metadata_status: input.preflight.provider.metadata_status,
    receipt_id: input.receipt_id ?? defaultReceiptId(),
    generated_at: (input.now ?? new Date()).toISOString(),
    request_fingerprint: input.preflight.request_fingerprint,
    ticker: input.request.ticker,
    interval: input.request.interval,
    requested_start: input.request.start,
    requested_end: input.request.end,
    provider_credit_ceiling: 1 as const,
    planner: input.preflight.planner,
    hard_reserve_preserved: input.preflight.gates.hard_reserve_intact,
    execution_ready_reserve_consumed: false as const,
    operator_authorization_verified: input.operator_authorization_verified,
    authorization_consumed: input.authorization_consumed,
    authorization_request_bound: input.operator_authorization_verified,
    authorization_single_use: true as const,
    durable: false as const,
    process_local_only: true as const,
    persisted: false as const,
    no_effect_boundary: noEffectBoundary(),
  };
  if (input.result.ok) {
    const execution = input.result.execution;
    const hasCandles = execution.candle_count > 0;
    return {
      ...base,
      execution_status: "executed",
      primary_result_category: hasCandles
        ? "provider_success_with_candles"
        : "provider_success_empty",
      provider_attempt_occurred: true,
      provider_request_count: 1,
      estimated_credits: execution.estimated_credits,
      actual_credits: execution.actual_credits,
      candle_count: execution.candle_count,
      first_candle_at: execution.first_candle_at,
      last_candle_at: execution.last_candle_at,
      provider_status_category: execution.provider_status_category,
      fallback_used: execution.fallback_used,
      retry_count: execution.retry_count,
      rate_limited: false,
      timeout_occurred: false,
      provider_response_structurally_valid: true,
      safe_blocker_or_failure_category: null,
      safe_operator_message: hasCandles
        ? "Bounded proof completed with sanitized candle aggregates."
        : "Bounded proof completed with a confirmed valid empty provider result.",
    };
  }
  const category = failureCategory(input.result);
  return {
    ...base,
    execution_status: input.result.status,
    primary_result_category: category,
    provider_attempt_occurred: input.result.provider_request_count === 1,
    provider_request_count: input.result.provider_request_count,
    estimated_credits: null,
    actual_credits: null,
    candle_count: null,
    first_candle_at: null,
    last_candle_at: null,
    provider_status_category: null,
    fallback_used: null,
    retry_count: null,
    rate_limited: null,
    timeout_occurred: input.result.blocker === "provider_timeout",
    provider_response_structurally_valid:
      input.result.blocker === "invalid_provider_response" ? false : null,
    safe_blocker_or_failure_category: input.result.blocker,
    safe_operator_message: input.result.safe_message,
  };
}

export function createBoundedShadowCollectorLatestProofReceiptStore() {
  let latestReceipt: BoundedShadowCollectorLiveProofReceipt | null = null;
  return {
    record(receipt: BoundedShadowCollectorLiveProofReceipt) {
      latestReceipt = structuredClone(receipt);
    },
    latest() {
      return latestReceipt === null ? null : structuredClone(latestReceipt);
    },
    snapshot() {
      return {
        status: latestReceipt ? "observed" : "not_observed",
        receipt_count: latestReceipt ? 1 : 0,
        process_local_only: true,
        persisted: false,
      } as const;
    },
  };
}

export type BoundedShadowCollectorLiveProofReceiptDiagnostics = {
  contract_version: typeof boundedShadowCollectorLiveProofReceiptContractVersion;
  route_marker: typeof boundedShadowCollectorLiveProofReceiptRouteMarker;
  route_path: typeof boundedShadowCollectorLatestProofReceiptRoutePath;
  route_present: true;
  status: "not_observed";
  latest_safe_observed_receipt: null;
  receipt_persisted: false;
  process_local_only: true;
  browser_route_invocation: false;
  provider_call_inferred_by_client: false;
  token_present_in_diagnostics: false;
};

export function buildBoundedShadowCollectorLiveProofReceiptDiagnostics(): BoundedShadowCollectorLiveProofReceiptDiagnostics {
  return {
    contract_version: boundedShadowCollectorLiveProofReceiptContractVersion,
    route_marker: boundedShadowCollectorLiveProofReceiptRouteMarker,
    route_path: boundedShadowCollectorLatestProofReceiptRoutePath,
    route_present: true,
    status: "not_observed",
    latest_safe_observed_receipt: null,
    receipt_persisted: false,
    process_local_only: true,
    browser_route_invocation: false,
    provider_call_inferred_by_client: false,
    token_present_in_diagnostics: false,
  };
}

export const boundedShadowCollectorLatestProofReceiptStore =
  createBoundedShadowCollectorLatestProofReceiptStore();
