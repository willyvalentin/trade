import {
  boundedShadowCollectorLiveProofReceiptContractVersion,
  type BoundedShadowCollectorProofEntryKind,
  type BoundedShadowCollectorLiveProofReceipt,
} from "@/lib/bounded-shadow-collector-live-proof-receipt";
import { buildContinuousIntelligenceShadowCanaryExecutionId } from "@/lib/continuous-intelligence-shadow-canary-claim-store";
import { continuousIntelligenceCreditLedgerPolicy } from "@/lib/continuous-intelligence-credit-ledger";

type ProofAuditSafeMessage =
  | "Bounded proof blocked before provider attempt."
  | "Bounded proof completed with sanitized candle aggregates."
  | "Bounded proof completed with a confirmed valid empty provider result."
  | "Bounded proof provider request timed out."
  | "Bounded proof provider response was rejected safely."
  | "Bounded proof provider request failed safely."
  | "Bounded proof internal execution failed safely."
  | "Scheduled shadow canary blocked before provider attempt."
  | "Scheduled shadow canary completed with sanitized candle aggregates."
  | "Scheduled shadow canary completed with a confirmed valid empty provider result."
  | "Scheduled shadow canary provider request timed out."
  | "Scheduled shadow canary provider response was rejected safely."
  | "Scheduled shadow canary provider request failed safely."
  | "Scheduled shadow canary internal execution failed safely.";

export type BoundedShadowCollectorProofAuditRow = {
  receipt_id: string;
  contract_version: string;
  build_marker: string;
  entry_kind: BoundedShadowCollectorProofEntryKind;
  daily_claim_id: string | null;
  daily_claim_status: "claimed" | "attempted" | "completed" | "failed" | null;
  daily_claim_execution_id: string | null;
  provider_metadata_status: "within_budget" | "approaching_limit" | "unresolved";
  generated_at: string;
  request_fingerprint: string;
  ticker: string;
  interval: "5min" | "15min";
  requested_start: string;
  requested_end: string;
  execution_status: "executed" | "blocked" | "failed";
  primary_result_category: BoundedShadowCollectorLiveProofReceipt["primary_result_category"];
  provider_attempt_occurred: boolean;
  provider_request_count: 0 | 1;
  provider_credit_ceiling: 1;
  estimated_credits: 0 | 1 | null;
  actual_credits: 0 | 1 | null;
  actual_credits_known: boolean;
  candle_count: number | null;
  first_candle_at: string | null;
  last_candle_at: string | null;
  provider_status_category: "available" | "empty" | "unavailable" | null;
  fallback_used: boolean | null;
  retry_count: 0 | 1 | null;
  rate_limited: boolean | null;
  timeout_occurred: boolean;
  provider_response_structurally_valid: boolean | null;
  planner_contract: string | null;
  planner_version: string | null;
  planner_session: string | null;
  planner_workload_id: string | null;
  planner_workload_class: string | null;
  planner_rest_layer: string | null;
  planner_demand_source: string | null;
  planner_requested_credits: number | null;
  planner_allocated_credits: number | null;
  proof_executable_credits: 1 | null;
  policy_total_credits: 377;
  policy_hard_reserve_credits: 57;
  policy_normal_planned_max_credits: 320;
  hard_reserve_preserved: boolean;
  execution_ready_reserve_consumed: false;
  operator_authorization_verified: boolean;
  authorization_consumed: boolean;
  authorization_request_bound: boolean;
  authorization_single_use: true;
  safe_blocker_or_failure_category: string | null;
  safe_operator_message: ProofAuditSafeMessage;
  durable: true;
  process_local_only: false;
  persisted: true;
  shared_cache_mutated: false;
  supabase_writes_executed: false;
  schedule_changes: false;
  recommendation_changes: false;
  scanner_changes: false;
  ranking_changes: false;
  confidence_changes: false;
  execution_or_broker_actions: false;
};

export type BoundedShadowCollectorProofAuditDatabase = {
  insert: (row: BoundedShadowCollectorProofAuditRow) => Promise<{
    data: { receipt_id: string } | null;
    error: { code?: string } | null;
  }>;
  findByReceiptId: (receiptId: string) => Promise<{
    data: BoundedShadowCollectorProofAuditRow | null;
    error: { code?: string } | null;
  }>;
  latest: () => Promise<{
    data: BoundedShadowCollectorProofAuditRow | null;
    error: { code?: string } | null;
  }>;
};

export type BoundedShadowCollectorProofAuditPersistenceResult =
  | {
      status: "persisted" | "already_persisted";
      receipt_id: string;
      durable: true;
      persisted: true;
      idempotent: boolean;
      safe_blocker_category: null;
    }
  | {
      status: "schema_unavailable" | "validation_failed" | "persistence_failed";
      receipt_id: string | null;
      durable: false;
      persisted: false;
      idempotent: false;
      safe_blocker_category: "schema_unavailable" | "validation_failed" | "persistence_failed";
    };

export type BoundedShadowCollectorProofAuditReadResult =
  | { status: "found"; audit: BoundedShadowCollectorProofAuditRow }
  | { status: "not_found"; audit: null }
  | { status: "schema_unavailable" | "persistence_failed"; audit: null };

const maxTextLength = 240;
const exactReceiptKeys = new Set([
  "contract_version",
  "build_marker",
  "entry_kind",
  "daily_claim_id",
  "daily_claim_status",
  "daily_claim_execution_id",
  "provider_metadata_status",
  "receipt_id",
  "generated_at",
  "request_fingerprint",
  "execution_status",
  "primary_result_category",
  "provider_attempt_occurred",
  "provider_request_count",
  "provider_credit_ceiling",
  "estimated_credits",
  "actual_credits",
  "ticker",
  "interval",
  "requested_start",
  "requested_end",
  "candle_count",
  "first_candle_at",
  "last_candle_at",
  "provider_status_category",
  "fallback_used",
  "retry_count",
  "rate_limited",
  "timeout_occurred",
  "provider_response_structurally_valid",
  "planner",
  "hard_reserve_preserved",
  "execution_ready_reserve_consumed",
  "operator_authorization_verified",
  "authorization_consumed",
  "authorization_request_bound",
  "authorization_single_use",
  "safe_blocker_or_failure_category",
  "safe_operator_message",
  "durable",
  "process_local_only",
  "persisted",
  "no_effect_boundary",
]);
const prohibitedKeyPattern = /(?:token|secret|api[_-]?key|candles|ohlcv|raw|payload|url|stack)/i;
const receiptCategories = new Set<BoundedShadowCollectorLiveProofReceipt["primary_result_category"]>([
  "blocked_before_provider_attempt",
  "provider_success_with_candles",
  "provider_success_empty",
  "provider_timeout",
  "provider_failure",
  "provider_response_invalid",
  "internal_execution_failure",
]);
const noEffectKeys = new Set([
  "shared_cache_mutated",
  "supabase_writes_executed",
  "schedule_changes",
  "recommendation_changes",
  "scanner_changes",
  "ranking_changes",
  "confidence_changes",
  "execution_or_broker_actions",
]);
const plannerKeys = new Set(["contract", "version", "session", "authorization"]);
const authorizationKeys = new Set([
  "workload_id",
  "workload_class",
  "rest_layer",
  "demand_source",
  "ticker_allocated_by_planner",
  "planner_requested_credits",
  "planner_allocated_credits",
  "proof_executable_credits",
  "credit_source",
  "execution_ready_reserve_consumed",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeDate(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function hasProhibitedKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasProhibitedKey);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(
    ([key, nested]) => prohibitedKeyPattern.test(key) || hasProhibitedKey(nested),
  );
}

function hasExactKeys(value: Record<string, unknown>, allowed: Set<string>) {
  const keys = Object.keys(value);
  return keys.length === allowed.size && keys.every((key) => allowed.has(key));
}

function safeMessageForReceipt(
  category: BoundedShadowCollectorLiveProofReceipt["primary_result_category"],
  entryKind: BoundedShadowCollectorProofEntryKind,
): ProofAuditSafeMessage {
  if (entryKind === "scheduled_shadow_collector_canary") {
    switch (category) {
      case "provider_success_with_candles": return "Scheduled shadow canary completed with sanitized candle aggregates.";
      case "provider_success_empty": return "Scheduled shadow canary completed with a confirmed valid empty provider result.";
      case "provider_timeout": return "Scheduled shadow canary provider request timed out.";
      case "provider_response_invalid": return "Scheduled shadow canary provider response was rejected safely.";
      case "internal_execution_failure": return "Scheduled shadow canary internal execution failed safely.";
      case "provider_failure": return "Scheduled shadow canary provider request failed safely.";
      case "blocked_before_provider_attempt": return "Scheduled shadow canary blocked before provider attempt.";
    }
  }
  switch (category) {
    case "provider_success_with_candles":
      return "Bounded proof completed with sanitized candle aggregates.";
    case "provider_success_empty":
      return "Bounded proof completed with a confirmed valid empty provider result.";
    case "provider_timeout":
      return "Bounded proof provider request timed out.";
    case "provider_response_invalid":
      return "Bounded proof provider response was rejected safely.";
    case "internal_execution_failure":
      return "Bounded proof internal execution failed safely.";
    case "provider_failure":
      return "Bounded proof provider request failed safely.";
    case "blocked_before_provider_attempt":
      return "Bounded proof blocked before provider attempt.";
  }
}

function safeBlockerForReceipt(
  category: BoundedShadowCollectorLiveProofReceipt["primary_result_category"],
) {
  switch (category) {
    case "provider_success_with_candles":
    case "provider_success_empty":
      return null;
    case "blocked_before_provider_attempt":
      return "blocked_before_provider_attempt";
    case "provider_timeout":
      return "provider_timeout";
    case "provider_response_invalid":
      return "invalid_provider_response";
    case "internal_execution_failure":
      return "internal_execution_failure";
    case "provider_failure":
      return "provider_failure";
  }
}

function isBoundedText(value: unknown, maximum = maxTextLength) {
  return typeof value === "string" && value.length > 0 && value.length <= maximum;
}

function hasExpectedNoEffectBoundary(
  value: BoundedShadowCollectorLiveProofReceipt["no_effect_boundary"],
) {
  return isRecord(value) && hasExactKeys(value, noEffectKeys) && Object.values(value).every((item) => item === false);
}

function hasValidBoundedManualClaimLinkage(
  receipt: BoundedShadowCollectorLiveProofReceipt,
) {
  const values = [
    receipt.daily_claim_id,
    receipt.daily_claim_status,
    receipt.daily_claim_execution_id,
  ];
  if (values.every((value) => value === null)) return true;
  if (values.some((value) => value === null)) return false;
  if (
    typeof receipt.daily_claim_id !== "string" ||
    typeof receipt.daily_claim_status !== "string" ||
    typeof receipt.daily_claim_execution_id !== "string"
  ) {
    return false;
  }
  if (
    receipt.daily_claim_status !== "completed" &&
    receipt.daily_claim_status !== "failed"
  ) return false;
  const executionId = receipt.daily_claim_execution_id;
  const legacyMatch = /^canary_execution_(\d{4})(\d{2})(\d{2})_[0-9a-f]{8}$/.exec(executionId);
  if (legacyMatch) {
    const utcDay = `${legacyMatch[1]}-${legacyMatch[2]}-${legacyMatch[3]}`;
    return (
      receipt.daily_claim_id === `canary_claim_${executionId}` &&
      executionId === buildContinuousIntelligenceShadowCanaryExecutionId({
        utc_day: utcDay,
        request_fingerprint: receipt.request_fingerprint,
      })
    );
  }
  const manualMatch = /^manual_canary_execution_(\d{4})(\d{2})(\d{2})_manual_canary_authorization_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.exec(executionId);
  return manualMatch !== null && receipt.daily_claim_id === `canary_claim_${executionId}`;
}

export function isBoundedShadowCollectorProofAuditEnabled(value: unknown) {
  return value === "true" || value === "1";
}

export function mapBoundedShadowCollectorProofAuditReceipt(
  receipt: BoundedShadowCollectorLiveProofReceipt,
): BoundedShadowCollectorProofAuditRow | null {
  if (
    !isRecord(receipt) ||
    !isRecord(receipt.planner) ||
    !hasExactKeys(receipt.planner, plannerKeys) ||
    !isRecord(receipt.no_effect_boundary) ||
    typeof receipt.receipt_id !== "string" ||
    typeof receipt.request_fingerprint !== "string" ||
    typeof receipt.ticker !== "string" ||
    typeof receipt.build_marker !== "string" ||
    !["bounded_manual_proof", "scheduled_shadow_collector_canary"].includes(receipt.entry_kind) ||
    !["within_budget", "approaching_limit", "unresolved"].includes(receipt.provider_metadata_status) ||
    (receipt.daily_claim_id !== null && !isBoundedText(receipt.daily_claim_id, 128)) ||
    (receipt.daily_claim_status !== null && !["claimed", "attempted", "completed", "failed"].includes(receipt.daily_claim_status)) ||
    (receipt.daily_claim_execution_id !== null && !isBoundedText(receipt.daily_claim_execution_id, 128)) ||
    !isBoundedText(receipt.contract_version) ||
    !isBoundedText(receipt.build_marker) ||
    !["5min", "15min"].includes(receipt.interval) ||
    !["executed", "blocked", "failed"].includes(receipt.execution_status) ||
    !receiptCategories.has(receipt.primary_result_category) ||
    typeof receipt.provider_attempt_occurred !== "boolean" ||
    typeof receipt.timeout_occurred !== "boolean" ||
    typeof receipt.hard_reserve_preserved !== "boolean" ||
    typeof receipt.operator_authorization_verified !== "boolean" ||
    typeof receipt.authorization_consumed !== "boolean" ||
    typeof receipt.authorization_request_bound !== "boolean"
  ) {
    return null;
  }
  const authorizationValue = receipt.planner.authorization;
  if (authorizationValue !== null && (!isRecord(authorizationValue) || !hasExactKeys(authorizationValue, authorizationKeys))) {
    return null;
  }
  const authorization = authorizationValue;
  const validNumbers =
    (receipt.estimated_credits === null ||
      receipt.estimated_credits === 0 ||
      receipt.estimated_credits === 1) &&
    (receipt.actual_credits === null ||
      receipt.actual_credits === 0 ||
      receipt.actual_credits === 1) &&
    (receipt.retry_count === null || receipt.retry_count === 0 || receipt.retry_count === 1);
  const validText =
    receipt.receipt_id.length > 0 &&
    receipt.receipt_id.length <= 128 &&
    receipt.request_fingerprint.length > 0 &&
    receipt.request_fingerprint.length <= maxTextLength &&
    receipt.ticker.length > 0 &&
    receipt.ticker.length <= 16 &&
    (receipt.first_candle_at === null || isSafeDate(receipt.first_candle_at)) &&
    (receipt.last_candle_at === null || isSafeDate(receipt.last_candle_at));
  if (
    receipt.contract_version !== boundedShadowCollectorLiveProofReceiptContractVersion ||
    !isSafeDate(receipt.generated_at) ||
    !isSafeDate(receipt.requested_start) ||
    !isSafeDate(receipt.requested_end) ||
    !validText ||
    !validNumbers ||
    receipt.provider_request_count < 0 ||
    receipt.provider_request_count > 1 ||
    receipt.provider_attempt_occurred !== (receipt.provider_request_count === 1) ||
    receipt.provider_credit_ceiling !== 1 ||
    (receipt.candle_count !== null && (!Number.isInteger(receipt.candle_count) || receipt.candle_count < 0)) ||
    receipt.execution_ready_reserve_consumed !== false ||
    receipt.authorization_single_use !== true ||
    (receipt.entry_kind === "bounded_manual_proof" && !hasValidBoundedManualClaimLinkage(receipt)) ||
    (receipt.entry_kind === "scheduled_shadow_collector_canary" && (
      receipt.daily_claim_id === null ||
      receipt.daily_claim_status === null ||
      receipt.daily_claim_execution_id !== null
    )) ||
    receipt.no_effect_boundary.supabase_writes_executed !== false ||
    !hasExpectedNoEffectBoundary(receipt.no_effect_boundary) ||
    (authorization !== null && authorization.proof_executable_credits !== 1)
  ) {
    return null;
  }
  return {
    receipt_id: receipt.receipt_id,
    contract_version: receipt.contract_version,
    build_marker: receipt.build_marker,
    entry_kind: receipt.entry_kind,
    daily_claim_id: receipt.daily_claim_id,
    daily_claim_status: receipt.daily_claim_status,
    daily_claim_execution_id: receipt.daily_claim_execution_id,
    provider_metadata_status: receipt.provider_metadata_status,
    generated_at: receipt.generated_at,
    request_fingerprint: receipt.request_fingerprint,
    ticker: receipt.ticker,
    interval: receipt.interval,
    requested_start: receipt.requested_start,
    requested_end: receipt.requested_end,
    execution_status: receipt.execution_status,
    primary_result_category: receipt.primary_result_category,
    provider_attempt_occurred: receipt.provider_attempt_occurred,
    provider_request_count: receipt.provider_request_count,
    provider_credit_ceiling: 1,
    estimated_credits: receipt.estimated_credits as 0 | 1 | null,
    actual_credits: receipt.actual_credits as 0 | 1 | null,
    actual_credits_known: receipt.actual_credits !== null,
    candle_count: receipt.candle_count,
    first_candle_at: receipt.first_candle_at,
    last_candle_at: receipt.last_candle_at,
    provider_status_category: receipt.provider_status_category,
    fallback_used: receipt.fallback_used,
    retry_count: receipt.retry_count as 0 | 1 | null,
    rate_limited: receipt.rate_limited,
    timeout_occurred: receipt.timeout_occurred,
    provider_response_structurally_valid: receipt.provider_response_structurally_valid,
    planner_contract: receipt.planner.contract,
    planner_version: receipt.planner.version,
    planner_session: receipt.planner.session,
    planner_workload_id: authorization?.workload_id ?? null,
    planner_workload_class: authorization?.workload_class ?? null,
    planner_rest_layer: authorization?.rest_layer ?? null,
    planner_demand_source: authorization?.demand_source ?? null,
    planner_requested_credits: authorization?.planner_requested_credits ?? null,
    planner_allocated_credits: authorization?.planner_allocated_credits ?? null,
    proof_executable_credits: authorization?.proof_executable_credits ?? null,
    policy_total_credits: continuousIntelligenceCreditLedgerPolicy.total_credits,
    policy_hard_reserve_credits: continuousIntelligenceCreditLedgerPolicy.hard_reserve_credits,
    policy_normal_planned_max_credits: continuousIntelligenceCreditLedgerPolicy.normal_planned_max_credits,
    hard_reserve_preserved: receipt.hard_reserve_preserved,
    execution_ready_reserve_consumed: false,
    operator_authorization_verified: receipt.operator_authorization_verified,
    authorization_consumed: receipt.authorization_consumed,
    authorization_request_bound: receipt.authorization_request_bound,
    authorization_single_use: true,
    safe_blocker_or_failure_category: safeBlockerForReceipt(receipt.primary_result_category),
    safe_operator_message: safeMessageForReceipt(receipt.primary_result_category, receipt.entry_kind),
    durable: true,
    process_local_only: false,
    persisted: true,
    shared_cache_mutated: false,
    supabase_writes_executed: false,
    schedule_changes: false,
    recommendation_changes: false,
    scanner_changes: false,
    ranking_changes: false,
    confidence_changes: false,
    execution_or_broker_actions: false,
  };
}

export function parseBoundedShadowCollectorProofAuditReceipt(
  value: unknown,
): BoundedShadowCollectorLiveProofReceipt | null {
  if (!isRecord(value) || hasProhibitedKey(value)) return null;
  if (Object.keys(value).some((key) => !exactReceiptKeys.has(key))) return null;
  if (!isRecord(value.planner) || !isRecord(value.no_effect_boundary)) return null;
  return mapBoundedShadowCollectorProofAuditReceipt(
    value as BoundedShadowCollectorLiveProofReceipt,
  )
    ? (value as BoundedShadowCollectorLiveProofReceipt)
    : null;
}

function sameAuditRow(
  left: BoundedShadowCollectorProofAuditRow,
  right: BoundedShadowCollectorProofAuditRow,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function safeFailure(
  status: "schema_unavailable" | "validation_failed" | "persistence_failed",
  receiptId: string | null,
): BoundedShadowCollectorProofAuditPersistenceResult {
  return {
    status,
    receipt_id: receiptId,
    durable: false,
    persisted: false,
    idempotent: false,
    safe_blocker_category: status,
  };
}

export function createBoundedShadowCollectorProofAuditStore(
  database: BoundedShadowCollectorProofAuditDatabase | null,
) {
  return {
    async persist(
      receipt: BoundedShadowCollectorLiveProofReceipt,
    ): Promise<BoundedShadowCollectorProofAuditPersistenceResult> {
      const row = mapBoundedShadowCollectorProofAuditReceipt(receipt);
      if (!row) return safeFailure("validation_failed", null);
      if (!database) return safeFailure("schema_unavailable", row.receipt_id);
      try {
        const inserted = await database.insert(row);
        if (!inserted.error) {
          return {
            status: "persisted",
            receipt_id: row.receipt_id,
            durable: true,
            persisted: true,
            idempotent: false,
            safe_blocker_category: null,
          };
        }
        if (inserted.error.code !== "23505") {
          return safeFailure(
            inserted.error.code === "42P01" ? "schema_unavailable" : "persistence_failed",
            row.receipt_id,
          );
        }
        const existing = await database.findByReceiptId(row.receipt_id);
        if (existing.error || !existing.data) return safeFailure("persistence_failed", row.receipt_id);
        if (!sameAuditRow(existing.data, row)) return safeFailure("validation_failed", row.receipt_id);
        return {
          status: "already_persisted",
          receipt_id: row.receipt_id,
          durable: true,
          persisted: true,
          idempotent: true,
          safe_blocker_category: null,
        };
      } catch {
        return safeFailure("persistence_failed", row.receipt_id);
      }
    },
    async findByReceiptId(receiptId: string): Promise<BoundedShadowCollectorProofAuditReadResult> {
      if (!database) return { status: "schema_unavailable", audit: null };
      try {
        const result = await database.findByReceiptId(receiptId);
        if (result.error) {
          return { status: result.error.code === "42P01" ? "schema_unavailable" : "persistence_failed", audit: null };
        }
        return result.data ? { status: "found", audit: result.data } : { status: "not_found", audit: null };
      } catch {
        return { status: "persistence_failed", audit: null };
      }
    },
    async latest(): Promise<BoundedShadowCollectorProofAuditReadResult> {
      if (!database) return { status: "schema_unavailable", audit: null };
      try {
        const result = await database.latest();
        if (result.error) {
          return { status: result.error.code === "42P01" ? "schema_unavailable" : "persistence_failed", audit: null };
        }
        return result.data ? { status: "found", audit: result.data } : { status: "not_found", audit: null };
      } catch {
        return { status: "persistence_failed", audit: null };
      }
    },
  };
}
