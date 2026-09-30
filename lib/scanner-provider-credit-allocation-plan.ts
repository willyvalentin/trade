import { createHash } from "node:crypto";

export const SCANNER_PROVIDER_CREDIT_ALLOCATION_PLAN_VERSION =
  "scanner_provider_credit_allocation_plan_v1" as const;
export const SCANNER_PROVIDER_CREDIT_ALLOCATION_EXECUTION_PLAN_VERSION =
  "scanner_provider_credit_allocation_execution_plan_v2" as const;
export const SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION =
  "serial_shared_provider_budget_v1" as const;
export const SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION =
  "candidate_breadth_first_provider_budget_v1" as const;

export type ScannerProviderCreditAllocationPolicyVersion =
  | typeof SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION
  | typeof SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION;

export type ScannerProviderCreditDataClass = "daily" | "intraday";

export type ScannerProviderCreditDemand = Readonly<{
  ticker: string;
  ticker_index: number;
  daily_refresh_required: boolean;
  intraday_refresh_required: boolean;
}>;

export type ScannerProviderCreditAllocation = Readonly<{
  ticker: string;
  ticker_index: number;
  data_class: ScannerProviderCreditDataClass;
}>;

export type ScannerProviderCreditAllocationPlan = Readonly<{
  plan_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_PLAN_VERSION;
  status: "planned" | "invalid";
  reason_codes: readonly string[];
  policy_version: ScannerProviderCreditAllocationPolicyVersion | null;
  provider_credit_cap: number | null;
  candidate_count: number;
  candidate_demands: readonly ScannerProviderCreditDemand[];
  total_deficits: number;
  planned_credits: number;
  candidates_receiving_credit: number;
  unfunded_deficits: number;
  allocations: readonly ScannerProviderCreditAllocation[];
  plan_fingerprint: string | null;
  authority: Readonly<{
    can_call_provider: false;
    can_reserve_provider_credit: false;
    can_change_ranking_or_publication: false;
    can_lower_threshold: false;
    can_execute_broker_action: false;
  }>;
}>;

export type ScannerProviderCreditAllocationExecutionPlan = Readonly<{
  plan_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_EXECUTION_PLAN_VERSION;
  status: "planned" | "invalid";
  reason_codes: readonly string[];
  policy_version: ScannerProviderCreditAllocationPolicyVersion | null;
  provider_credit_cap: number | null;
  intraday_provider_credit_cap: number | null;
  candidate_count: number;
  candidate_demands: readonly ScannerProviderCreditDemand[];
  total_deficits: number;
  planned_credits: number;
  planned_intraday_credits: number;
  candidates_receiving_credit: number;
  unfunded_deficits: number;
  allocations: readonly ScannerProviderCreditAllocation[];
  plan_fingerprint: string | null;
  authority: ScannerProviderCreditAllocationPlan["authority"];
}>;

function inertAuthority(): ScannerProviderCreditAllocationPlan["authority"] {
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

function invalidPlan(reasonCode: string): ScannerProviderCreditAllocationPlan {
  return Object.freeze({
    plan_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_PLAN_VERSION,
    status: "invalid",
    reason_codes: Object.freeze([reasonCode]),
    policy_version: null,
    provider_credit_cap: null,
    candidate_count: 0,
    candidate_demands: Object.freeze([]),
    total_deficits: 0,
    planned_credits: 0,
    candidates_receiving_credit: 0,
    unfunded_deficits: 0,
    allocations: Object.freeze([]),
    plan_fingerprint: null,
    authority: inertAuthority(),
  });
}

function invalidExecutionPlan(
  reasonCode: string,
): ScannerProviderCreditAllocationExecutionPlan {
  return Object.freeze({
    plan_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_EXECUTION_PLAN_VERSION,
    status: "invalid",
    reason_codes: Object.freeze([reasonCode]),
    policy_version: null,
    provider_credit_cap: null,
    intraday_provider_credit_cap: null,
    candidate_count: 0,
    candidate_demands: Object.freeze([]),
    total_deficits: 0,
    planned_credits: 0,
    planned_intraday_credits: 0,
    candidates_receiving_credit: 0,
    unfunded_deficits: 0,
    allocations: Object.freeze([]),
    plan_fingerprint: null,
    authority: inertAuthority(),
  });
}

function isPolicyVersion(
  value: unknown,
): value is ScannerProviderCreditAllocationPolicyVersion {
  return (
    value === SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION ||
    value === SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION
  );
}

function validCreditCap(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function normalizedDemands(
  value: unknown,
): readonly ScannerProviderCreditDemand[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length === 0) return null;
  const parsed = value.map((item) => {
    const candidate = recordOrNull(item);
    if (
      typeof candidate?.ticker !== "string" ||
      candidate.ticker !== candidate.ticker.trim().toUpperCase() ||
      !/^[A-Z][A-Z0-9.-]{0,15}$/.test(candidate.ticker) ||
      typeof candidate.ticker_index !== "number" ||
      !Number.isSafeInteger(candidate.ticker_index) ||
      candidate.ticker_index < 0 ||
      typeof candidate.daily_refresh_required !== "boolean" ||
      typeof candidate.intraday_refresh_required !== "boolean"
    ) {
      return null;
    }
    return {
      ticker: candidate.ticker,
      ticker_index: candidate.ticker_index,
      daily_refresh_required: candidate.daily_refresh_required,
      intraday_refresh_required: candidate.intraday_refresh_required,
    } satisfies ScannerProviderCreditDemand;
  });
  if (parsed.some((candidate) => candidate === null)) return null;
  const sorted = (parsed as ScannerProviderCreditDemand[]).sort(
    (first, second) => first.ticker_index - second.ticker_index,
  );
  const tickers = new Set<string>();
  const valid = sorted.every((candidate, index) => {
    if (
      candidate.ticker_index !== index ||
      tickers.has(candidate.ticker)
    ) {
      return false;
    }
    tickers.add(candidate.ticker);
    return true;
  });
  if (!valid) return null;
  return Object.freeze(
    sorted.map((candidate) =>
      Object.freeze({
        ticker: candidate.ticker,
        ticker_index: candidate.ticker_index,
        daily_refresh_required: candidate.daily_refresh_required,
        intraday_refresh_required: candidate.intraday_refresh_required,
      }),
    ),
  );
}

function allocationKey(
  candidate: ScannerProviderCreditDemand,
  dataClass: ScannerProviderCreditDataClass,
) {
  return `${candidate.ticker_index}:${candidate.ticker}:${dataClass}`;
}

function allocate(
  allocations: ScannerProviderCreditAllocation[],
  allocated: Set<string>,
  candidate: ScannerProviderCreditDemand,
  dataClass: ScannerProviderCreditDataClass,
  cap: number,
) {
  if (allocations.length >= cap) return;
  const key = allocationKey(candidate, dataClass);
  if (allocated.has(key)) return;
  allocated.add(key);
  allocations.push(
    Object.freeze({
      ticker: candidate.ticker,
      ticker_index: candidate.ticker_index,
      data_class: dataClass,
    }),
  );
}

function serialAllocations(
  candidates: readonly ScannerProviderCreditDemand[],
  cap: number,
) {
  const allocations: ScannerProviderCreditAllocation[] = [];
  const allocated = new Set<string>();
  for (const candidate of candidates) {
    if (candidate.daily_refresh_required) {
      allocate(allocations, allocated, candidate, "daily", cap);
    }
    if (candidate.intraday_refresh_required) {
      allocate(allocations, allocated, candidate, "intraday", cap);
    }
  }
  return Object.freeze(allocations);
}

function breadthFirstAllocations(
  candidates: readonly ScannerProviderCreditDemand[],
  cap: number,
) {
  const allocations: ScannerProviderCreditAllocation[] = [];
  const allocated = new Set<string>();

  for (const candidate of candidates) {
    if (candidate.daily_refresh_required) {
      allocate(allocations, allocated, candidate, "daily", cap);
    } else if (candidate.intraday_refresh_required) {
      allocate(allocations, allocated, candidate, "intraday", cap);
    }
  }

  for (const candidate of candidates) {
    if (candidate.daily_refresh_required) {
      allocate(allocations, allocated, candidate, "daily", cap);
    }
    if (candidate.intraday_refresh_required) {
      allocate(allocations, allocated, candidate, "intraday", cap);
    }
  }
  return Object.freeze(allocations);
}

function constrainedAllocations({
  candidates,
  providerCreditCap,
  intradayProviderCreditCap,
  policyVersion,
}: {
  candidates: readonly ScannerProviderCreditDemand[];
  providerCreditCap: number;
  intradayProviderCreditCap: number;
  policyVersion: ScannerProviderCreditAllocationPolicyVersion;
}) {
  const allocations: ScannerProviderCreditAllocation[] = [];
  const allocated = new Set<string>();
  let intradayCredits = 0;
  const tryAllocate = (
    candidate: ScannerProviderCreditDemand,
    dataClass: ScannerProviderCreditDataClass,
  ) => {
    if (allocations.length >= providerCreditCap) return;
    if (
      dataClass === "intraday" &&
      intradayCredits >= intradayProviderCreditCap
    ) {
      return;
    }
    const before = allocations.length;
    allocate(
      allocations,
      allocated,
      candidate,
      dataClass,
      providerCreditCap,
    );
    if (dataClass === "intraday" && allocations.length > before) {
      intradayCredits += 1;
    }
  };

  if (policyVersion === SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION) {
    for (const candidate of candidates) {
      if (candidate.daily_refresh_required) tryAllocate(candidate, "daily");
      if (candidate.intraday_refresh_required) {
        tryAllocate(candidate, "intraday");
      }
    }
  } else {
    for (const candidate of candidates) {
      if (candidate.daily_refresh_required) {
        tryAllocate(candidate, "daily");
      } else if (candidate.intraday_refresh_required) {
        tryAllocate(candidate, "intraday");
      }
    }
    for (const candidate of candidates) {
      if (candidate.daily_refresh_required) tryAllocate(candidate, "daily");
      if (candidate.intraday_refresh_required) {
        tryAllocate(candidate, "intraday");
      }
    }
  }

  return Object.freeze(allocations);
}

export function buildScannerProviderCreditAllocationPlan({
  policyVersion,
  providerCreditCap,
  candidateDemands,
}: {
  policyVersion: ScannerProviderCreditAllocationPolicyVersion;
  providerCreditCap: number;
  candidateDemands: readonly ScannerProviderCreditDemand[];
}): ScannerProviderCreditAllocationPlan {
  if (!isPolicyVersion(policyVersion)) {
    return invalidPlan("provider_allocation_plan_policy_invalid");
  }
  if (!validCreditCap(providerCreditCap)) {
    return invalidPlan("provider_allocation_plan_credit_cap_invalid");
  }
  const demands = normalizedDemands(candidateDemands);
  if (!demands) {
    return invalidPlan("provider_allocation_plan_candidate_demands_invalid");
  }

  const allocations =
    policyVersion === SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION
      ? serialAllocations(demands, providerCreditCap)
      : breadthFirstAllocations(demands, providerCreditCap);
  const totalDeficits = demands.reduce(
    (total, candidate) =>
      total +
      Number(candidate.daily_refresh_required) +
      Number(candidate.intraday_refresh_required),
    0,
  );
  const candidateKeys = new Set(
    allocations.map((item) => `${item.ticker_index}:${item.ticker}`),
  );
  const unfundedDeficits = Math.max(0, totalDeficits - allocations.length);
  const reasonCodes = Object.freeze([
    totalDeficits === 0
      ? "provider_allocation_plan_no_refresh_deficits"
      : unfundedDeficits === 0
        ? "provider_allocation_plan_all_refresh_deficits_funded"
        : "provider_allocation_plan_credit_cap_exhausted",
  ]);
  const fingerprintBasis = Object.freeze({
    plan_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_PLAN_VERSION,
    policy_version: policyVersion,
    provider_credit_cap: providerCreditCap,
    candidate_demands: demands,
    total_deficits: totalDeficits,
    planned_credits: allocations.length,
    candidates_receiving_credit: candidateKeys.size,
    unfunded_deficits: unfundedDeficits,
    allocations,
    reason_codes: reasonCodes,
  });
  const planFingerprint = createHash("sha256")
    .update(canonicalJson(fingerprintBasis), "utf8")
    .digest("hex");

  return Object.freeze({
    plan_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_PLAN_VERSION,
    status: "planned",
    reason_codes: reasonCodes,
    policy_version: policyVersion,
    provider_credit_cap: providerCreditCap,
    candidate_count: demands.length,
    candidate_demands: demands,
    total_deficits: totalDeficits,
    planned_credits: allocations.length,
    candidates_receiving_credit: candidateKeys.size,
    unfunded_deficits: unfundedDeficits,
    allocations,
    plan_fingerprint: planFingerprint,
    authority: inertAuthority(),
  });
}

export function buildScannerProviderCreditAllocationExecutionPlan({
  policyVersion,
  providerCreditCap,
  intradayProviderCreditCap,
  candidateDemands,
}: {
  policyVersion: ScannerProviderCreditAllocationPolicyVersion;
  providerCreditCap: number;
  intradayProviderCreditCap: number;
  candidateDemands: readonly ScannerProviderCreditDemand[];
}): ScannerProviderCreditAllocationExecutionPlan {
  if (!isPolicyVersion(policyVersion)) {
    return invalidExecutionPlan("provider_allocation_execution_policy_invalid");
  }
  if (!validCreditCap(providerCreditCap)) {
    return invalidExecutionPlan(
      "provider_allocation_execution_credit_cap_invalid",
    );
  }
  if (!validCreditCap(intradayProviderCreditCap)) {
    return invalidExecutionPlan(
      "provider_allocation_execution_intraday_cap_invalid",
    );
  }
  const demands = normalizedDemands(candidateDemands);
  if (!demands) {
    return invalidExecutionPlan(
      "provider_allocation_execution_candidate_demands_invalid",
    );
  }
  const allocations = constrainedAllocations({
    candidates: demands,
    providerCreditCap,
    intradayProviderCreditCap,
    policyVersion,
  });
  const totalDeficits = demands.reduce(
    (total, candidate) =>
      total +
      Number(candidate.daily_refresh_required) +
      Number(candidate.intraday_refresh_required),
    0,
  );
  const plannedIntradayCredits = allocations.filter(
    (allocation) => allocation.data_class === "intraday",
  ).length;
  const candidatesReceivingCredit = new Set(
    allocations.map((item) => `${item.ticker_index}:${item.ticker}`),
  ).size;
  const unfundedDeficits = Math.max(0, totalDeficits - allocations.length);
  const reasonCodes = Object.freeze([
    totalDeficits === 0
      ? "provider_allocation_execution_no_refresh_deficits"
      : unfundedDeficits === 0
        ? "provider_allocation_execution_all_refresh_deficits_funded"
        : allocations.length >= providerCreditCap
          ? "provider_allocation_execution_credit_cap_exhausted"
          : "provider_allocation_execution_intraday_cap_exhausted",
  ]);
  const fingerprintBasis = Object.freeze({
    plan_version: SCANNER_PROVIDER_CREDIT_ALLOCATION_EXECUTION_PLAN_VERSION,
    policy_version: policyVersion,
    provider_credit_cap: providerCreditCap,
    intraday_provider_credit_cap: intradayProviderCreditCap,
    candidate_count: demands.length,
    candidate_demands: demands,
    total_deficits: totalDeficits,
    planned_credits: allocations.length,
    planned_intraday_credits: plannedIntradayCredits,
    candidates_receiving_credit: candidatesReceivingCredit,
    unfunded_deficits: unfundedDeficits,
    allocations,
    reason_codes: reasonCodes,
  });
  const planFingerprint = createHash("sha256")
    .update(canonicalJson(fingerprintBasis), "utf8")
    .digest("hex");

  return Object.freeze({
    ...fingerprintBasis,
    status: "planned",
    plan_fingerprint: planFingerprint,
    authority: inertAuthority(),
  });
}

function recordOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function scannerProviderCreditAllocationPlanFromUnknown(
  value: unknown,
): ScannerProviderCreditAllocationPlan {
  const candidate = recordOrNull(value);
  if (
    candidate?.plan_version !== SCANNER_PROVIDER_CREDIT_ALLOCATION_PLAN_VERSION ||
    candidate.status !== "planned" ||
    !isPolicyVersion(candidate.policy_version) ||
    !validCreditCap(candidate.provider_credit_cap) ||
    !Array.isArray(candidate.candidate_demands)
  ) {
    return invalidPlan("provider_allocation_plan_readback_invalid");
  }
  const rebuilt = buildScannerProviderCreditAllocationPlan({
    policyVersion: candidate.policy_version,
    providerCreditCap: candidate.provider_credit_cap,
    candidateDemands:
      candidate.candidate_demands as ScannerProviderCreditDemand[],
  });
  if (
    rebuilt.status !== "planned" ||
    canonicalJson(candidate) !== canonicalJson(rebuilt)
  ) {
    return invalidPlan("provider_allocation_plan_readback_inconsistent");
  }
  return rebuilt;
}

export function scannerProviderCreditAllocationExecutionPlanFromUnknown(
  value: unknown,
): ScannerProviderCreditAllocationExecutionPlan {
  const candidate = recordOrNull(value);
  if (
    candidate?.plan_version !==
      SCANNER_PROVIDER_CREDIT_ALLOCATION_EXECUTION_PLAN_VERSION ||
    candidate.status !== "planned" ||
    !isPolicyVersion(candidate.policy_version) ||
    !validCreditCap(candidate.provider_credit_cap) ||
    !validCreditCap(candidate.intraday_provider_credit_cap) ||
    !Array.isArray(candidate.candidate_demands)
  ) {
    return invalidExecutionPlan(
      "provider_allocation_execution_readback_invalid",
    );
  }
  const rebuilt = buildScannerProviderCreditAllocationExecutionPlan({
    policyVersion: candidate.policy_version,
    providerCreditCap: candidate.provider_credit_cap,
    intradayProviderCreditCap: candidate.intraday_provider_credit_cap,
    candidateDemands:
      candidate.candidate_demands as ScannerProviderCreditDemand[],
  });
  if (
    rebuilt.status !== "planned" ||
    canonicalJson(candidate) !== canonicalJson(rebuilt)
  ) {
    return invalidExecutionPlan(
      "provider_allocation_execution_readback_inconsistent",
    );
  }
  return rebuilt;
}
