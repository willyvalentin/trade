import {
  boundedShadowCollectorLiveProofReceiptContractVersion,
  type BoundedShadowCollectorLiveProofReceipt,
} from "@/lib/bounded-shadow-collector-live-proof-receipt";

export const continuousIntelligenceCreditLedgerContractVersion =
  "continuous_intelligence_credit_ledger_v1" as const;
export const continuousIntelligenceCreditLedgerTableName =
  "continuous_intelligence_credit_ledger" as const;
export const continuousIntelligenceCreditLedgerFlagName =
  "TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED" as const;

export const continuousIntelligenceCreditLedgerPolicy = {
  total_credits: 377,
  hard_reserve_credits: 57,
  normal_planned_max_credits: 320,
} as const;

export type ContinuousIntelligenceCreditReconciliationStatus =
  | "estimated_only"
  | "provider_reported"
  | "verified_from_provider_usage_snapshot"
  | "conflict_requires_review"
  | "not_chargeable"
  | "reconciliation_unavailable";

export type ContinuousIntelligenceProviderUsageEvidence = {
  evidence_source: "provider_usage_snapshot";
  observed_at: string;
  request_count_delta: 0 | 1;
  credit_delta: 0 | 1;
  verification_confidence: "verified";
};

export type ContinuousIntelligenceCreditLedgerEntry = {
  contract_version: typeof continuousIntelligenceCreditLedgerContractVersion;
  ledger_entry_id: string;
  generated_at: string;
  source_receipt_id: string;
  entry_kind: "bounded_manual_proof" | "scheduled_shadow_collector_canary";
  request_fingerprint: string;
  provider: "twelve_data";
  ticker: string;
  interval: "5min" | "15min";
  requested_start: string;
  requested_end: string;
  provider_request_count: 0 | 1;
  planner_requested_credits: 0 | 1 | null;
  planner_allocated_credits: 0 | 1 | null;
  proof_executable_credits: 1 | null;
  provider_estimated_credits: 0 | 1 | null;
  provider_reported_actual_credits: 0 | 1 | null;
  actual_credits_known: boolean;
  reconciled_credits: 0 | 1 | null;
  reconciliation_status: ContinuousIntelligenceCreditReconciliationStatus;
  reconciliation_source: "none" | "provider_reported" | "provider_usage_snapshot";
  normal_capacity_credits_charged: 0 | 1 | null;
  reserve_credits_charged: 0;
  hard_reserve_preserved: boolean;
  execution_ready_reserve_consumed: false;
  policy_total_credits: 377;
  policy_hard_reserve_credits: 57;
  policy_normal_planned_max_credits: 320;
  provider_status_category: "available" | "empty" | "unavailable" | null;
  execution_result_category: BoundedShadowCollectorLiveProofReceipt["primary_result_category"];
  durable_audit_persisted: boolean;
  safe_note_category: "no_provider_attempt" | "actual_usage_unknown" | "provider_usage_reported" | "provider_usage_verified" | "reconciliation_conflict" | "provider_attempt_cost_unavailable";
  shared_cache_mutated: false;
  supabase_writes_executed: false;
  schedule_changes: false;
  recommendation_changes: false;
  scanner_changes: false;
  ranking_changes: false;
  confidence_changes: false;
  execution_or_broker_actions: false;
};

export type ContinuousIntelligenceCreditLedgerAuditResult = {
  status: "disabled" | "persisted" | "already_persisted" | "schema_unavailable" | "validation_failed" | "persistence_failed";
  persisted: boolean;
};

export type ContinuousIntelligenceCreditLedgerBuilderInput = {
  receipt: BoundedShadowCollectorLiveProofReceipt;
  durable_audit: ContinuousIntelligenceCreditLedgerAuditResult;
  provider_usage_evidence?: ContinuousIntelligenceProviderUsageEvidence | null;
  ledger_entry_id?: string;
  entry_kind?: ContinuousIntelligenceCreditLedgerEntry["entry_kind"];
  now?: Date;
};

const receiptCategories = new Set<BoundedShadowCollectorLiveProofReceipt["primary_result_category"]>([
  "blocked_before_provider_attempt",
  "provider_success_with_candles",
  "provider_success_empty",
  "provider_timeout",
  "provider_failure",
  "provider_response_invalid",
  "internal_execution_failure",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validDate(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function validCredit(value: unknown): value is 0 | 1 {
  return value === 0 || value === 1;
}

function boundedText(value: unknown, maximum: number) {
  return typeof value === "string" && value.length > 0 && value.length <= maximum;
}

function defaultLedgerEntryId(receiptId: string) {
  return `credit_ledger_${receiptId}`;
}

function isValidEvidence(
  evidence: ContinuousIntelligenceProviderUsageEvidence | null | undefined,
) {
  return (
    evidence === null ||
    evidence === undefined ||
    (isRecord(evidence) &&
      evidence.evidence_source === "provider_usage_snapshot" &&
      evidence.verification_confidence === "verified" &&
      validDate(evidence.observed_at) &&
      validCredit(evidence.request_count_delta) &&
      validCredit(evidence.credit_delta))
  );
}

function reconciliation(input: {
  provider_request_count: 0 | 1;
  estimated: 0 | 1 | null;
  reported: 0 | 1 | null;
  evidence: ContinuousIntelligenceProviderUsageEvidence | null | undefined;
  result_category: BoundedShadowCollectorLiveProofReceipt["primary_result_category"];
}) {
  if (input.provider_request_count === 0) {
    return {
      reconciled_credits: 0 as const,
      reconciliation_status: "not_chargeable" as const,
      reconciliation_source: "none" as const,
      normal_capacity_credits_charged: 0 as const,
      safe_note_category: "no_provider_attempt" as const,
    };
  }
  const evidenceActual = input.evidence?.credit_delta ?? null;
  const actual = evidenceActual ?? input.reported;
  if (input.evidence && input.evidence.request_count_delta !== input.provider_request_count) {
    return conflict();
  }
  if (actual !== null && input.estimated !== null && actual !== input.estimated) {
    return conflict();
  }
  if (actual !== null) {
    return {
      reconciled_credits: actual,
      reconciliation_status: input.evidence
        ? "verified_from_provider_usage_snapshot" as const
        : "provider_reported" as const,
      reconciliation_source: input.evidence
        ? "provider_usage_snapshot" as const
        : "provider_reported" as const,
      normal_capacity_credits_charged: actual,
      safe_note_category: input.evidence
        ? "provider_usage_verified" as const
        : "provider_usage_reported" as const,
    };
  }
  if (input.result_category === "provider_timeout" || input.result_category === "provider_failure" || input.result_category === "provider_response_invalid" || input.result_category === "internal_execution_failure") {
    return {
      reconciled_credits: null,
      reconciliation_status: "reconciliation_unavailable" as const,
      reconciliation_source: "none" as const,
      normal_capacity_credits_charged: null,
      safe_note_category: "provider_attempt_cost_unavailable" as const,
    };
  }
  return {
    reconciled_credits: null,
    reconciliation_status: "estimated_only" as const,
    reconciliation_source: "none" as const,
    normal_capacity_credits_charged: null,
    safe_note_category: "actual_usage_unknown" as const,
  };
}

function conflict() {
  return {
    reconciled_credits: null,
    reconciliation_status: "conflict_requires_review" as const,
    reconciliation_source: "none" as const,
    normal_capacity_credits_charged: null,
    safe_note_category: "reconciliation_conflict" as const,
  };
}

export function isContinuousIntelligenceCreditLedgerEnabled(value: unknown) {
  return value === "true" || value === "1";
}

export function buildContinuousIntelligenceCreditLedgerEntry(
  input: ContinuousIntelligenceCreditLedgerBuilderInput,
): ContinuousIntelligenceCreditLedgerEntry | null {
  const receipt = input.receipt;
  const authorization = receipt.planner.authorization;
  const ledgerEntryId = input.ledger_entry_id ?? defaultLedgerEntryId(receipt.receipt_id);
  if (
    !isRecord(receipt) ||
    receipt.contract_version !== boundedShadowCollectorLiveProofReceiptContractVersion ||
    !receiptCategories.has(receipt.primary_result_category) ||
    !validDate(receipt.generated_at) ||
    !validDate(receipt.requested_start) ||
    !validDate(receipt.requested_end) ||
    !boundedText(receipt.receipt_id, 128) ||
    !boundedText(ledgerEntryId, 160) ||
    !boundedText(receipt.request_fingerprint, 240) ||
    !boundedText(receipt.ticker, 16) ||
    !["5min", "15min"].includes(receipt.interval) ||
    !validCredit(receipt.provider_request_count) ||
    receipt.provider_attempt_occurred !== (receipt.provider_request_count === 1) ||
    receipt.provider_credit_ceiling !== 1 ||
    (receipt.estimated_credits !== null && !validCredit(receipt.estimated_credits)) ||
    (receipt.actual_credits !== null && !validCredit(receipt.actual_credits)) ||
    receipt.execution_ready_reserve_consumed !== false ||
    receipt.hard_reserve_preserved !== true ||
    (input.entry_kind !== undefined && input.entry_kind !== receipt.entry_kind) ||
    !isValidEvidence(input.provider_usage_evidence) ||
    (authorization !== null &&
      (!validCredit(authorization.planner_requested_credits) ||
        !validCredit(authorization.planner_allocated_credits) ||
        authorization.proof_executable_credits !== 1 ||
        authorization.execution_ready_reserve_consumed !== false))
  ) {
    return null;
  }
  const result = reconciliation({
    provider_request_count: receipt.provider_request_count,
    estimated: receipt.estimated_credits as 0 | 1 | null,
    reported: receipt.actual_credits as 0 | 1 | null,
    evidence: input.provider_usage_evidence,
    result_category: receipt.primary_result_category,
  });
  return {
    contract_version: continuousIntelligenceCreditLedgerContractVersion,
    ledger_entry_id: ledgerEntryId,
    generated_at: (input.now ?? new Date()).toISOString(),
    source_receipt_id: receipt.receipt_id,
    entry_kind: receipt.entry_kind,
    request_fingerprint: receipt.request_fingerprint,
    provider: "twelve_data",
    ticker: receipt.ticker,
    interval: receipt.interval,
    requested_start: receipt.requested_start,
    requested_end: receipt.requested_end,
    provider_request_count: receipt.provider_request_count,
    planner_requested_credits: authorization?.planner_requested_credits as 0 | 1 | null ?? null,
    planner_allocated_credits: authorization?.planner_allocated_credits as 0 | 1 | null ?? null,
    proof_executable_credits: authorization?.proof_executable_credits ?? null,
    provider_estimated_credits: receipt.estimated_credits as 0 | 1 | null,
    provider_reported_actual_credits: receipt.actual_credits as 0 | 1 | null,
    actual_credits_known: receipt.actual_credits !== null || input.provider_usage_evidence !== null && input.provider_usage_evidence !== undefined,
    ...result,
    reserve_credits_charged: 0,
    hard_reserve_preserved: true,
    execution_ready_reserve_consumed: false,
    policy_total_credits: 377,
    policy_hard_reserve_credits: 57,
    policy_normal_planned_max_credits: 320,
    provider_status_category: receipt.provider_status_category,
    execution_result_category: receipt.primary_result_category,
    durable_audit_persisted: input.durable_audit.persisted,
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

export function applyContinuousIntelligenceProviderUsageEvidence(
  entry: ContinuousIntelligenceCreditLedgerEntry,
  evidence: ContinuousIntelligenceProviderUsageEvidence,
  now = new Date(),
): ContinuousIntelligenceCreditLedgerEntry | null {
  if (!isValidEvidence(evidence) || entry.contract_version !== continuousIntelligenceCreditLedgerContractVersion) {
    return null;
  }
  if (entry.reconciliation_status === "verified_from_provider_usage_snapshot") {
    return entry.reconciled_credits === evidence.credit_delta ? structuredClone(entry) : null;
  }
  if (entry.provider_request_count !== evidence.request_count_delta) return null;
  if (
    entry.provider_reported_actual_credits !== null &&
    entry.provider_reported_actual_credits !== evidence.credit_delta
  ) {
    return {
      ...structuredClone(entry),
      generated_at: now.toISOString(),
      reconciled_credits: null,
      reconciliation_status: "conflict_requires_review",
      reconciliation_source: "none",
      normal_capacity_credits_charged: null,
      safe_note_category: "reconciliation_conflict",
    };
  }
  if (
    entry.provider_estimated_credits !== null &&
    entry.provider_estimated_credits !== evidence.credit_delta
  ) {
    return {
      ...structuredClone(entry),
      generated_at: now.toISOString(),
      reconciled_credits: null,
      reconciliation_status: "conflict_requires_review",
      reconciliation_source: "none",
      normal_capacity_credits_charged: null,
      safe_note_category: "reconciliation_conflict",
    };
  }
  return {
    ...structuredClone(entry),
    generated_at: now.toISOString(),
    provider_reported_actual_credits: evidence.credit_delta,
    actual_credits_known: true,
    reconciled_credits: evidence.credit_delta,
    reconciliation_status: "verified_from_provider_usage_snapshot",
    reconciliation_source: "provider_usage_snapshot",
    normal_capacity_credits_charged: evidence.credit_delta,
    safe_note_category: "provider_usage_verified",
  };
}

export type ContinuousIntelligenceCreditLedgerDiagnostics = {
  contract_version: typeof continuousIntelligenceCreditLedgerContractVersion;
  table_name: typeof continuousIntelligenceCreditLedgerTableName;
  migration_expected: true;
  feature_flag: typeof continuousIntelligenceCreditLedgerFlagName;
  feature_flag_state_client_side: "unknown";
  status: "not_observed";
  latest_ledger_entry: null;
  actual_credit_verification_status: "unknown";
  durable_readback_route_present: true;
  reconciliation_route_present: true;
  browser_route_invocation: false;
  provider_call_inferred_by_client: false;
  reserve_charging_allowed: false;
  token_or_candle_payload_present: false;
};

export function buildContinuousIntelligenceCreditLedgerDiagnostics(): ContinuousIntelligenceCreditLedgerDiagnostics {
  return {
    contract_version: continuousIntelligenceCreditLedgerContractVersion,
    table_name: continuousIntelligenceCreditLedgerTableName,
    migration_expected: true,
    feature_flag: continuousIntelligenceCreditLedgerFlagName,
    feature_flag_state_client_side: "unknown",
    status: "not_observed",
    latest_ledger_entry: null,
    actual_credit_verification_status: "unknown",
    durable_readback_route_present: true,
    reconciliation_route_present: true,
    browser_route_invocation: false,
    provider_call_inferred_by_client: false,
    reserve_charging_allowed: false,
    token_or_candle_payload_present: false,
  };
}
