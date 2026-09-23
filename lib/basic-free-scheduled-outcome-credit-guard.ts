import "server-only";

import { getNewYorkDateString } from "@/lib/intraday-scan-window";
import {
  BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS,
  BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS,
  basicFreeDiscoveryCreditReservationContractVersion,
  buildBasicFreeDiscoveryCreditReservationClaimId,
  type BasicFreeDiscoveryCreditReservationFinalization,
  type BasicFreeDiscoveryCreditReservationPreparation,
} from "@/lib/basic-free-discovery-credit-reservation-store";
import {
  finalizeBasicFreeDiscoveryCreditReservation,
  prepareBasicFreeDiscoveryCreditReservation,
} from "@/lib/server/basic-free-discovery-credit-reservation-persistence";
import type { ProviderPlanProfileMode } from "@/lib/provider-plan-profile";

export const BASIC_FREE_SCHEDULED_OUTCOME_CREDIT_GUARD_VERSION =
  "basic_free_scheduled_outcome_credit_guard_v1" as const;
export const BASIC_FREE_SCHEDULED_OUTCOME_MAX_CANDLE_REQUESTS = 4;

export function capBasicFreeOutcomeCandleRequests(input: {
  planMode: Exclude<ProviderPlanProfileMode, "unknown">;
  requestedLimit: number;
}) {
  const requested = Number.isFinite(input.requestedLimit)
    ? Math.max(0, Math.floor(input.requestedLimit))
    : 0;
  return input.planMode === "free"
    ? Math.min(requested, BASIC_FREE_SCHEDULED_OUTCOME_MAX_CANDLE_REQUESTS)
    : requested;
}

export type BasicFreeScheduledOutcomeCreditSummary = Readonly<{
  guard_version: typeof BASIC_FREE_SCHEDULED_OUTCOME_CREDIT_GUARD_VERSION;
  contract_version: typeof basicFreeDiscoveryCreditReservationContractVersion;
  scope: "scheduled_outcome_evaluation";
  status:
    | "not_required"
    | "no_provider_work"
    | BasicFreeDiscoveryCreditReservationPreparation["status"];
  provider_execution_allowed: boolean;
  trading_date: string | null;
  minute_bucket: string | null;
  requested_credits: number | null;
  daily_reserved_credits: number | null;
  minute_reserved_credits: number | null;
  claim_id: string | null;
  finalization_status:
    | "not_started"
    | BasicFreeDiscoveryCreditReservationFinalization["status"];
  finalization_proven: boolean | null;
  safe_blocker: string | null;
}>;

type ReservationLifecycle = {
  prepare: typeof prepareBasicFreeDiscoveryCreditReservation;
  finalize: typeof finalizeBasicFreeDiscoveryCreditReservation;
};

export type BasicFreeScheduledOutcomeCreditGuard = Readonly<{
  summary: BasicFreeScheduledOutcomeCreditSummary;
  claim: { claim_id: string; execution_fingerprint: string } | null;
  lifecycle: ReservationLifecycle | null;
}>;

function summary(input: Partial<BasicFreeScheduledOutcomeCreditSummary> & {
  status: BasicFreeScheduledOutcomeCreditSummary["status"];
  provider_execution_allowed: boolean;
}): BasicFreeScheduledOutcomeCreditSummary {
  return {
    guard_version: BASIC_FREE_SCHEDULED_OUTCOME_CREDIT_GUARD_VERSION,
    contract_version: basicFreeDiscoveryCreditReservationContractVersion,
    scope: "scheduled_outcome_evaluation",
    trading_date: null,
    minute_bucket: null,
    requested_credits: null,
    daily_reserved_credits: null,
    minute_reserved_credits: null,
    claim_id: null,
    finalization_status: "not_started",
    finalization_proven: null,
    safe_blocker: null,
    ...input,
  };
}

function exactBudget(value: string | undefined, expected: number) {
  return value !== undefined && Number(value) === expected &&
    value.trim().length > 0;
}

export async function prepareBasicFreeScheduledOutcomeCreditGuard(input: {
  planMode: Exclude<ProviderPlanProfileMode, "unknown">;
  maximumCandleRequests: number;
  ownerUserId: string;
  executionFingerprint: string;
  now?: Date;
  env?: Record<string, string | undefined>;
  lifecycle?: ReservationLifecycle;
}): Promise<BasicFreeScheduledOutcomeCreditGuard> {
  if (input.planMode !== "free") {
    return {
      summary: summary({ status: "not_required", provider_execution_allowed: true }),
      claim: null,
      lifecycle: null,
    };
  }

  const now = input.now ?? new Date();
  const tradingDate = getNewYorkDateString(now);
  const minuteBucket = new Date(
    Math.floor(now.getTime() / 60_000) * 60_000,
  ).toISOString();
  const requestedCredits = input.maximumCandleRequests;
  if (requestedCredits === 0) {
    return {
      summary: summary({
        status: "no_provider_work",
        provider_execution_allowed: true,
        trading_date: tradingDate,
        minute_bucket: minuteBucket,
        requested_credits: 0,
      }),
      claim: null,
      lifecycle: null,
    };
  }

  const env = input.env ?? process.env;
  const validBudget =
    Number.isInteger(requestedCredits) &&
    requestedCredits >= 1 &&
    requestedCredits <= BASIC_FREE_SCHEDULED_OUTCOME_MAX_CANDLE_REQUESTS &&
    exactBudget(
      env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET,
      BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS,
    ) &&
    exactBudget(
      env.TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET,
      BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS,
    );
  if (!validBudget) {
    return {
      summary: summary({
        status: "reservation_unavailable",
        provider_execution_allowed: false,
        trading_date: tradingDate,
        minute_bucket: minuteBucket,
        requested_credits: requestedCredits,
        safe_blocker: "scheduled_outcome_credit_budget_unavailable",
      }),
      claim: null,
      lifecycle: null,
    };
  }

  const lifecycle = input.lifecycle ?? {
    prepare: prepareBasicFreeDiscoveryCreditReservation,
    finalize: finalizeBasicFreeDiscoveryCreditReservation,
  };
  const claimId = buildBasicFreeDiscoveryCreditReservationClaimId({
    trading_date: tradingDate,
    execution_fingerprint: input.executionFingerprint,
  });
  const preparation = await lifecycle.prepare({
    claim_id: claimId,
    execution_fingerprint: input.executionFingerprint,
    owner_user_id: input.ownerUserId,
    trading_date: tradingDate,
    minute_bucket: minuteBucket,
    catalog_observation: false,
    requested_credits: requestedCredits,
    declared_daily_credit_budget: BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS,
    declared_per_minute_credit_budget:
      BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS,
  });
  const allowed = preparation.provider_execution_allowed &&
    preparation.status === "provider_execution_allowed" &&
    preparation.claim_id === claimId;

  return {
    summary: summary({
      status: allowed ? preparation.status : preparation.status === "provider_execution_allowed"
        ? "reservation_unavailable"
        : preparation.status,
      provider_execution_allowed: allowed,
      trading_date: tradingDate,
      minute_bucket: minuteBucket,
      requested_credits: requestedCredits,
      daily_reserved_credits: preparation.daily_reserved_credits,
      minute_reserved_credits: preparation.minute_reserved_credits,
      claim_id: allowed ? claimId : null,
      safe_blocker: allowed ? null : preparation.safe_blocker ??
        "scheduled_outcome_credit_reservation_unavailable",
    }),
    claim: allowed
      ? { claim_id: claimId, execution_fingerprint: input.executionFingerprint }
      : null,
    lifecycle,
  };
}

export async function finalizeBasicFreeScheduledOutcomeCreditGuard(
  guard: BasicFreeScheduledOutcomeCreditGuard,
  status: "completed" | "failed",
): Promise<BasicFreeScheduledOutcomeCreditSummary> {
  if (!guard.claim || !guard.lifecycle) return guard.summary;

  try {
    const finalization = await guard.lifecycle.finalize({
      claim_id: guard.claim.claim_id,
      execution_fingerprint: guard.claim.execution_fingerprint,
      status,
      finalized_at: new Date().toISOString(),
    });
    return {
      ...guard.summary,
      finalization_status: finalization.status,
      finalization_proven: finalization.finalization_proven,
      safe_blocker: finalization.safe_blocker ?? guard.summary.safe_blocker,
    };
  } catch {
    return {
      ...guard.summary,
      finalization_status: "reservation_unavailable",
      finalization_proven: false,
      safe_blocker: "scheduled_outcome_credit_finalization_unavailable",
    };
  }
}
