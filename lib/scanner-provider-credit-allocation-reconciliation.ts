import { createHash } from "node:crypto";

import {
  scannerProviderCreditAllocationExecutionPlanFromUnknown,
  type ScannerProviderCreditAllocation,
  type ScannerProviderCreditAllocationExecutionPlan,
  type ScannerProviderCreditAllocationPolicyVersion,
} from "@/lib/scanner-provider-credit-allocation-plan";

export const SCANNER_PROVIDER_CREDIT_ALLOCATION_RECONCILIATION_VERSION =
  "scanner_provider_credit_allocation_reconciliation_v1" as const;

export type ScannerProviderCreditAllocationReconciliation = Readonly<{
  reconciliation_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_RECONCILIATION_VERSION;
  status: "matched" | "diverged" | "invalid";
  reason_codes: readonly string[];
  plan: ScannerProviderCreditAllocationExecutionPlan | null;
  policy_version: ScannerProviderCreditAllocationPolicyVersion | null;
  admission_fingerprint: string | null;
  plan_fingerprint: string | null;
  planned_credits: number;
  actual_reserved_credits: number;
  planned_allocations: readonly ScannerProviderCreditAllocation[];
  actual_allocations: readonly ScannerProviderCreditAllocation[];
  missing_allocations: readonly ScannerProviderCreditAllocation[];
  unexpected_allocations: readonly ScannerProviderCreditAllocation[];
  reconciliation_fingerprint: string | null;
  authority: Readonly<{
    can_call_provider: false;
    can_reserve_provider_credit: false;
    can_change_ranking_or_publication: false;
    can_lower_threshold: false;
    can_execute_broker_action: false;
  }>;
}>;

function inertAuthority(): ScannerProviderCreditAllocationReconciliation["authority"] {
  return Object.freeze({
    can_call_provider: false,
    can_reserve_provider_credit: false,
    can_change_ranking_or_publication: false,
    can_lower_threshold: false,
    can_execute_broker_action: false,
  });
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([first], [second]) =>
          first < second ? -1 : first > second ? 1 : 0,
        )
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function canonicalJson(value: unknown) {
  return JSON.stringify(canonicalize(value));
}

function allocationKey(allocation: ScannerProviderCreditAllocation) {
  return `${allocation.ticker_index}:${allocation.ticker}:${allocation.data_class}`;
}

function normalizedActualAllocations(
  value: unknown,
  plan: ScannerProviderCreditAllocationExecutionPlan,
) {
  if (!Array.isArray(value)) return null;
  const denominator = new Map(
    plan.candidate_demands.map((candidate) => [
      `${candidate.ticker_index}:${candidate.ticker}`,
      candidate,
    ]),
  );
  const seen = new Set<string>();
  const allocations: ScannerProviderCreditAllocation[] = [];
  for (const item of value) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      return null;
    }
    const candidate = item as Record<string, unknown>;
    if (
      typeof candidate.ticker !== "string" ||
      typeof candidate.ticker_index !== "number" ||
      !Number.isSafeInteger(candidate.ticker_index) ||
      (candidate.data_class !== "daily" &&
        candidate.data_class !== "intraday") ||
      Object.keys(candidate).sort().join(",") !==
        "data_class,ticker,ticker_index"
    ) {
      return null;
    }
    const normalized = Object.freeze({
      ticker: candidate.ticker,
      ticker_index: candidate.ticker_index,
      data_class: candidate.data_class,
    }) satisfies ScannerProviderCreditAllocation;
    const denominatorKey = `${normalized.ticker_index}:${normalized.ticker}`;
    const key = allocationKey(normalized);
    if (!denominator.has(denominatorKey) || seen.has(key)) return null;
    seen.add(key);
    allocations.push(normalized);
  }
  return Object.freeze(allocations);
}

function invalidReconciliation(
  reasonCode: string,
): ScannerProviderCreditAllocationReconciliation {
  return Object.freeze({
    reconciliation_version:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_RECONCILIATION_VERSION,
    status: "invalid",
    reason_codes: Object.freeze([reasonCode]),
    plan: null,
    policy_version: null,
    admission_fingerprint: null,
    plan_fingerprint: null,
    planned_credits: 0,
    actual_reserved_credits: 0,
    planned_allocations: Object.freeze([]),
    actual_allocations: Object.freeze([]),
    missing_allocations: Object.freeze([]),
    unexpected_allocations: Object.freeze([]),
    reconciliation_fingerprint: null,
    authority: inertAuthority(),
  });
}

export function buildScannerProviderCreditAllocationReconciliation({
  plan,
  actualAllocations,
  admissionFingerprint,
}: {
  plan: ScannerProviderCreditAllocationExecutionPlan;
  actualAllocations: readonly ScannerProviderCreditAllocation[];
  admissionFingerprint: string | null;
}): ScannerProviderCreditAllocationReconciliation {
  if (
    plan.status !== "planned" ||
    !plan.policy_version ||
    !plan.plan_fingerprint
  ) {
    return invalidReconciliation("provider_allocation_plan_invalid");
  }
  if (
    admissionFingerprint !== null &&
    !/^[a-f0-9]{64}$/.test(admissionFingerprint)
  ) {
    return invalidReconciliation(
      "provider_allocation_admission_fingerprint_invalid",
    );
  }
  const actual = normalizedActualAllocations(actualAllocations, plan);
  if (!actual) {
    return invalidReconciliation("provider_allocation_actual_invalid");
  }
  const plannedKeys = new Set(plan.allocations.map(allocationKey));
  const actualKeys = new Set(actual.map(allocationKey));
  const missing = Object.freeze(
    plan.allocations.filter((allocation) => !actualKeys.has(allocationKey(allocation))),
  );
  const unexpected = Object.freeze(
    actual.filter((allocation) => !plannedKeys.has(allocationKey(allocation))),
  );
  const matched = missing.length === 0 && unexpected.length === 0;
  const reasonCodes = Object.freeze([
    matched
      ? "provider_allocation_plan_actual_match"
      : "provider_allocation_plan_actual_divergence",
  ]);
  const basis = Object.freeze({
    reconciliation_version:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_RECONCILIATION_VERSION,
    status: matched ? ("matched" as const) : ("diverged" as const),
    reason_codes: reasonCodes,
    plan,
    policy_version: plan.policy_version,
    admission_fingerprint: admissionFingerprint,
    plan_fingerprint: plan.plan_fingerprint,
    planned_credits: plan.planned_credits,
    actual_reserved_credits: actual.length,
    planned_allocations: plan.allocations,
    actual_allocations: actual,
    missing_allocations: missing,
    unexpected_allocations: unexpected,
  });
  const reconciliationFingerprint = createHash("sha256")
    .update(canonicalJson(basis), "utf8")
    .digest("hex");

  return Object.freeze({
    ...basis,
    reconciliation_fingerprint: reconciliationFingerprint,
    authority: inertAuthority(),
  });
}

export function scannerProviderCreditAllocationReconciliationFromUnknown(
  value: unknown,
): ScannerProviderCreditAllocationReconciliation | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const candidate = value as Record<string, unknown>;
  const plan = scannerProviderCreditAllocationExecutionPlanFromUnknown(
    candidate.plan,
  );
  if (plan.status !== "planned") return null;
  const admissionFingerprint =
    candidate.admission_fingerprint === null
      ? null
      : typeof candidate.admission_fingerprint === "string"
        ? candidate.admission_fingerprint
        : null;
  if (!Array.isArray(candidate.actual_allocations)) return null;
  const rebuilt = buildScannerProviderCreditAllocationReconciliation({
    plan,
    actualAllocations:
      candidate.actual_allocations as ScannerProviderCreditAllocation[],
    admissionFingerprint,
  });
  return canonicalJson(candidate) === canonicalJson(rebuilt) ? rebuilt : null;
}
