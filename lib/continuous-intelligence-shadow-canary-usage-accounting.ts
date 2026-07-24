import {
  continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason,
} from "@/lib/continuous-intelligence-shadow-canary-historical-usage-reconciliation-contract";

export type ContinuousIntelligenceShadowCanaryUsageLedgerRow = {
  entry_kind: "bounded_manual_proof" | "scheduled_shadow_collector_canary";
  generated_at: string;
  provider_estimated_credits: 0 | 1 | null;
};

export type ContinuousIntelligenceShadowCanaryUsageClaimRow = {
  utc_day: string;
  estimated_credits: 1;
  status: "claimed" | "attempted" | "completed" | "failed";
};

export type ContinuousIntelligenceShadowCanaryUsageReconciliationRow = {
  reconciliation_identity: string;
  contract_version: typeof continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion;
  operation_type: "historical_manual_usage_ledger_reconciliation";
  record_type: "historical_manual_usage_reconciliation";
  target_claim_id: string;
  source_execution_id: string;
  source_audit_id: string;
  authorization_id: string;
  usage_units: 1;
  provider_request_count_for_reconciliation: 0;
  reason_code: typeof continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason;
  historical_utc_day: string;
};

export const continuousIntelligenceShadowCanaryUsageAccountingRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/canary/usage-accounting" as const;
export const continuousIntelligenceShadowCanaryUsageAccountingMaximumHistoricalDays = 31;

export type ContinuousIntelligenceShadowCanaryUsageAccountingDateResolution =
  | {
      ok: true;
      utc_day: string;
      start: string;
      end: string;
    }
  | {
      ok: false;
      category: "invalid_utc_date" | "future_utc_date" | "historical_range_exceeded";
    };

type UsageScope = {
  attempts: number;
  estimated_credits: number;
};

export type ContinuousIntelligenceShadowCanaryUsageAccounting =
  | {
      status: "available";
      scope: "utc_day";
      queried_utc_date: string;
      scheduled_shadow_collector_canary: UsageScope;
      bounded_manual_proof: UsageScope;
      historical_manual_usage_reconciliation: UsageScope;
      total_ledger: UsageScope;
      claim_capacity: UsageScope;
    }
  | {
      status: "unavailable";
      scope: "utc_day";
      queried_utc_date: string | null;
      scheduled_shadow_collector_canary: null;
      bounded_manual_proof: null;
      historical_manual_usage_reconciliation: null;
      total_ledger: null;
      claim_capacity: null;
    };

function isLedgerRow(value: unknown): value is ContinuousIntelligenceShadowCanaryUsageLedgerRow {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    (row.entry_kind === "bounded_manual_proof" || row.entry_kind === "scheduled_shadow_collector_canary") &&
    typeof row.generated_at === "string" &&
    Number.isFinite(Date.parse(row.generated_at)) &&
    (row.provider_estimated_credits === null || row.provider_estimated_credits === 0 || row.provider_estimated_credits === 1)
  );
}

function isClaimRow(value: unknown, utcDay: string): value is ContinuousIntelligenceShadowCanaryUsageClaimRow {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    row.utc_day === utcDay &&
    row.estimated_credits === 1 &&
    (row.status === "claimed" || row.status === "attempted" || row.status === "completed" || row.status === "failed")
  );
}

function isBoundedIdentifier(value: unknown, maximumLength: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximumLength;
}

function isCanonicalManualClaimId(value: string) {
  return /^canary_claim_manual_canary_execution_\d{8}_manual_canary_authorization_[0-9a-f-]{36}$/.test(value);
}

function isApprovedReconciliationTarget(row: Record<string, unknown>) {
  if (typeof row.target_claim_id === "string" && isCanonicalManualClaimId(row.target_claim_id)) return true;
  return row.target_claim_id === continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target.claim_id &&
    row.source_execution_id === continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target.execution_id &&
    row.source_audit_id === continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target.source_audit_id;
}

function isReconciliationRow(value: unknown, utcDay: string): value is ContinuousIntelligenceShadowCanaryUsageReconciliationRow {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    row.contract_version === continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion &&
    row.operation_type === "historical_manual_usage_ledger_reconciliation" &&
    row.record_type === "historical_manual_usage_reconciliation" &&
    row.usage_units === 1 &&
    row.provider_request_count_for_reconciliation === 0 &&
    row.reason_code === continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason &&
    row.historical_utc_day === utcDay &&
    isBoundedIdentifier(row.reconciliation_identity, 320) &&
    isBoundedIdentifier(row.target_claim_id, 128) &&
    isBoundedIdentifier(row.source_execution_id, 128) &&
    isBoundedIdentifier(row.source_audit_id, 128) &&
    isBoundedIdentifier(row.authorization_id, 160) &&
    row.reconciliation_identity ===
      `historical_manual_usage_reconciliation:${continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion}:${row.target_claim_id}` &&
    isApprovedReconciliationTarget(row)
  );
}

function summarize(rows: ContinuousIntelligenceShadowCanaryUsageLedgerRow[]): UsageScope {
  return {
    attempts: rows.length,
    estimated_credits: rows.reduce((total, row) => total + (row.provider_estimated_credits ?? 0), 0),
  };
}

function isCanonicalUtcDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const instant = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(instant.getTime()) && instant.toISOString().slice(0, 10) === value;
}

export function resolveContinuousIntelligenceShadowCanaryUsageAccountingDate(input: {
  requested_utc_date?: string | null;
  now?: Date;
}): ContinuousIntelligenceShadowCanaryUsageAccountingDateResolution {
  const now = input.now ?? new Date();
  if (!Number.isFinite(now.getTime())) return { ok: false, category: "invalid_utc_date" };
  const currentUtcDay = now.toISOString().slice(0, 10);
  const requestedUtcDay = input.requested_utc_date ?? currentUtcDay;
  if (!isCanonicalUtcDay(requestedUtcDay)) return { ok: false, category: "invalid_utc_date" };
  const currentStart = Date.parse(`${currentUtcDay}T00:00:00.000Z`);
  const requestedStart = Date.parse(`${requestedUtcDay}T00:00:00.000Z`);
  const ageInDays = (currentStart - requestedStart) / (24 * 60 * 60 * 1000);
  if (ageInDays < 0) return { ok: false, category: "future_utc_date" };
  if (ageInDays > continuousIntelligenceShadowCanaryUsageAccountingMaximumHistoricalDays) {
    return { ok: false, category: "historical_range_exceeded" };
  }
  return {
    ok: true,
    utc_day: requestedUtcDay,
    start: new Date(requestedStart).toISOString(),
    end: new Date(requestedStart + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function buildContinuousIntelligenceShadowCanaryUsageAccounting(input: {
  utc_day: string;
  ledger_rows: unknown;
  claim_rows: unknown;
  reconciliation_rows?: unknown;
}): ContinuousIntelligenceShadowCanaryUsageAccounting {
  const reconciliationInput = input.reconciliation_rows ?? [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.utc_day) || !Array.isArray(input.ledger_rows) || !Array.isArray(input.claim_rows) || !Array.isArray(reconciliationInput)) {
    return unavailable();
  }
  if (
    !input.ledger_rows.every(isLedgerRow) ||
    !input.claim_rows.every((row) => isClaimRow(row, input.utc_day)) ||
    !reconciliationInput.every((row) => isReconciliationRow(row, input.utc_day))
  ) {
    return unavailable();
  }
  const reconciliationRows = reconciliationInput as ContinuousIntelligenceShadowCanaryUsageReconciliationRow[];
  const reconciliationKeys = new Set<string>();
  for (const row of reconciliationRows) {
    for (const key of [
      `reconciliation:${row.reconciliation_identity}`,
      `claim:${row.target_claim_id}`,
      `audit:${row.source_audit_id}`,
      `authorization:${row.authorization_id}`,
    ]) {
      if (reconciliationKeys.has(key)) return unavailable(input.utc_day);
      reconciliationKeys.add(key);
    }
  }
  const scheduled = input.ledger_rows.filter((row) => row.entry_kind === "scheduled_shadow_collector_canary");
  const manual = input.ledger_rows.filter((row) => row.entry_kind === "bounded_manual_proof");
  const reconciliation = {
    attempts: reconciliationRows.length,
    estimated_credits: reconciliationRows.reduce((total, row) => total + row.usage_units, 0),
  };
  const claimCapacity = {
    attempts: input.claim_rows.length,
    estimated_credits: input.claim_rows.reduce((total, row) => total + row.estimated_credits, 0),
  };
  return {
    status: "available",
    scope: "utc_day",
    queried_utc_date: input.utc_day,
    scheduled_shadow_collector_canary: summarize(scheduled),
    bounded_manual_proof: summarize(manual),
    historical_manual_usage_reconciliation: reconciliation,
    total_ledger: {
      attempts: input.ledger_rows.length + reconciliation.attempts,
      estimated_credits: summarize(input.ledger_rows).estimated_credits + reconciliation.estimated_credits,
    },
    claim_capacity: claimCapacity,
  };
}

export function unavailableContinuousIntelligenceShadowCanaryUsageAccounting(
  queriedUtcDate: string | null = null,
): ContinuousIntelligenceShadowCanaryUsageAccounting {
  return unavailable(queriedUtcDate);
}

function unavailable(queriedUtcDate: string | null = null): ContinuousIntelligenceShadowCanaryUsageAccounting {
  return {
    status: "unavailable",
    scope: "utc_day",
    queried_utc_date: queriedUtcDate,
    scheduled_shadow_collector_canary: null,
    bounded_manual_proof: null,
    historical_manual_usage_reconciliation: null,
    total_ledger: null,
    claim_capacity: null,
  };
}
