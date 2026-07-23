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

type UsageScope = {
  attempts: number;
  estimated_credits: number;
};

export type ContinuousIntelligenceShadowCanaryUsageAccounting =
  | {
      status: "available";
      scope: "utc_day";
      scheduled_shadow_collector_canary: UsageScope;
      bounded_manual_proof: UsageScope;
      total_ledger: UsageScope;
      claim_capacity: UsageScope;
    }
  | {
      status: "unavailable";
      scope: "utc_day";
      scheduled_shadow_collector_canary: null;
      bounded_manual_proof: null;
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

function summarize(rows: ContinuousIntelligenceShadowCanaryUsageLedgerRow[]): UsageScope {
  return {
    attempts: rows.length,
    estimated_credits: rows.reduce((total, row) => total + (row.provider_estimated_credits ?? 0), 0),
  };
}

export function buildContinuousIntelligenceShadowCanaryUsageAccounting(input: {
  utc_day: string;
  ledger_rows: unknown;
  claim_rows: unknown;
}): ContinuousIntelligenceShadowCanaryUsageAccounting {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.utc_day) || !Array.isArray(input.ledger_rows) || !Array.isArray(input.claim_rows)) {
    return unavailable();
  }
  if (!input.ledger_rows.every(isLedgerRow) || !input.claim_rows.every((row) => isClaimRow(row, input.utc_day))) {
    return unavailable();
  }
  const scheduled = input.ledger_rows.filter((row) => row.entry_kind === "scheduled_shadow_collector_canary");
  const manual = input.ledger_rows.filter((row) => row.entry_kind === "bounded_manual_proof");
  const claimCapacity = {
    attempts: input.claim_rows.length,
    estimated_credits: input.claim_rows.reduce((total, row) => total + row.estimated_credits, 0),
  };
  return {
    status: "available",
    scope: "utc_day",
    scheduled_shadow_collector_canary: summarize(scheduled),
    bounded_manual_proof: summarize(manual),
    total_ledger: summarize(input.ledger_rows),
    claim_capacity: claimCapacity,
  };
}

export function unavailableContinuousIntelligenceShadowCanaryUsageAccounting(): ContinuousIntelligenceShadowCanaryUsageAccounting {
  return unavailable();
}

function unavailable(): ContinuousIntelligenceShadowCanaryUsageAccounting {
  return {
    status: "unavailable",
    scope: "utc_day",
    scheduled_shadow_collector_canary: null,
    bounded_manual_proof: null,
    total_ledger: null,
    claim_capacity: null,
  };
}
