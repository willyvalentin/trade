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

export const BASIC_FREE_SCHEDULED_SCAN_CREDIT_GUARD_VERSION =
  "basic_free_scheduled_scan_credit_guard_v1" as const;

export type BasicFreeScheduledScanCreditReservationSummary = {
  guard_version: typeof BASIC_FREE_SCHEDULED_SCAN_CREDIT_GUARD_VERSION;
  contract_version: typeof basicFreeDiscoveryCreditReservationContractVersion;
  scope: "normal_scheduled_scan";
  status:
    | "not_required"
    | BasicFreeDiscoveryCreditReservationPreparation["status"];
  provider_execution_allowed: boolean;
  trading_date: string | null;
  minute_bucket: string | null;
  requested_credits: number | null;
  declared_daily_credit_budget: number | null;
  declared_per_minute_credit_budget: number | null;
  daily_reserved_credits: number | null;
  daily_remaining_credits: number | null;
  minute_reserved_credits: number | null;
  minute_remaining_credits: number | null;
  idempotent: boolean | null;
  finalization_status:
    | "not_started"
    | BasicFreeDiscoveryCreditReservationFinalization["status"];
  finalization_proven: boolean | null;
  safe_blocker: string | null;
};

type ReservationLifecycle = {
  prepare: typeof prepareBasicFreeDiscoveryCreditReservation;
  finalize: typeof finalizeBasicFreeDiscoveryCreditReservation;
};

export type BasicFreeScheduledScanCreditGuard = {
  summary: BasicFreeScheduledScanCreditReservationSummary;
  claim: {
    claim_id: string;
    execution_fingerprint: string;
  } | null;
  lifecycle: ReservationLifecycle | null;
};

export async function prepareBasicFreeScheduledScanCreditGuard(input: {
  planMode: Exclude<ProviderPlanProfileMode, "unknown">;
  maximumKnownProviderCredits: number | null;
  ownerUserId: string;
  executionFingerprint: string;
  now?: Date;
  env?: Record<string, string | undefined>;
  lifecycle?: ReservationLifecycle;
}): Promise<BasicFreeScheduledScanCreditGuard> {
  if (input.planMode !== "free") return notRequired();

  const now = input.now ?? new Date();
  const env = input.env ?? process.env;
  const tradingDate = getNewYorkDateString(now);
  const minuteBucket = minuteBucketFor(now);
  const requestedCredits = input.maximumKnownProviderCredits;
  const dailyBudget = exactPositiveInteger(
    env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET,
    BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS,
  );
  const perMinuteBudget = exactPositiveInteger(
    env.TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET,
    BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS,
  );

  if (
    requestedCredits !== BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS ||
    dailyBudget === null ||
    perMinuteBudget === null
  ) {
    return unavailable({
      tradingDate,
      minuteBucket,
      requestedCredits,
      dailyBudget,
      perMinuteBudget,
      blocker:
        requestedCredits !== BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS
          ? "scheduled_provider_credit_budget_invalid"
          : "basic_free_credit_budget_unavailable",
    });
  }

  const lifecycle =
    input.lifecycle ??
    ({
      prepare: prepareBasicFreeDiscoveryCreditReservation,
      finalize: finalizeBasicFreeDiscoveryCreditReservation,
    } satisfies ReservationLifecycle);
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
    requested_credits: requestedCredits,
    declared_daily_credit_budget: dailyBudget,
    declared_per_minute_credit_budget: perMinuteBudget,
  });

  return {
    summary: summaryFromPreparation({
      preparation,
      tradingDate,
      minuteBucket,
      requestedCredits,
      dailyBudget,
      perMinuteBudget,
    }),
    claim: preparation.provider_execution_allowed && preparation.claim_id
      ? {
          claim_id: preparation.claim_id,
          execution_fingerprint: input.executionFingerprint,
        }
      : null,
    lifecycle,
  };
}

export async function finalizeBasicFreeScheduledScanCreditGuard(
  guard: BasicFreeScheduledScanCreditGuard,
  status: "completed" | "failed",
  finalizedAt = new Date().toISOString(),
): Promise<BasicFreeScheduledScanCreditReservationSummary> {
  if (!guard.claim || !guard.lifecycle) return guard.summary;

  const finalization = await guard.lifecycle.finalize({
    claim_id: guard.claim.claim_id,
    execution_fingerprint: guard.claim.execution_fingerprint,
    status,
    finalized_at: finalizedAt,
  });

  return {
    ...guard.summary,
    finalization_status: finalization.status,
    finalization_proven: finalization.finalization_proven,
    safe_blocker: finalization.safe_blocker ?? guard.summary.safe_blocker,
  };
}

function notRequired(): BasicFreeScheduledScanCreditGuard {
  return {
    summary: {
      guard_version: BASIC_FREE_SCHEDULED_SCAN_CREDIT_GUARD_VERSION,
      contract_version: basicFreeDiscoveryCreditReservationContractVersion,
      scope: "normal_scheduled_scan",
      status: "not_required",
      provider_execution_allowed: true,
      trading_date: null,
      minute_bucket: null,
      requested_credits: null,
      declared_daily_credit_budget: null,
      declared_per_minute_credit_budget: null,
      daily_reserved_credits: null,
      daily_remaining_credits: null,
      minute_reserved_credits: null,
      minute_remaining_credits: null,
      idempotent: null,
      finalization_status: "not_started",
      finalization_proven: null,
      safe_blocker: null,
    },
    claim: null,
    lifecycle: null,
  };
}

function unavailable(input: {
  tradingDate: string;
  minuteBucket: string;
  requestedCredits: number | null;
  dailyBudget: number | null;
  perMinuteBudget: number | null;
  blocker: string;
}): BasicFreeScheduledScanCreditGuard {
  return {
    summary: {
      guard_version: BASIC_FREE_SCHEDULED_SCAN_CREDIT_GUARD_VERSION,
      contract_version: basicFreeDiscoveryCreditReservationContractVersion,
      scope: "normal_scheduled_scan",
      status: "reservation_unavailable",
      provider_execution_allowed: false,
      trading_date: input.tradingDate,
      minute_bucket: input.minuteBucket,
      requested_credits: input.requestedCredits,
      declared_daily_credit_budget: input.dailyBudget,
      declared_per_minute_credit_budget: input.perMinuteBudget,
      daily_reserved_credits: null,
      daily_remaining_credits: null,
      minute_reserved_credits: null,
      minute_remaining_credits: null,
      idempotent: null,
      finalization_status: "not_started",
      finalization_proven: null,
      safe_blocker: input.blocker,
    },
    claim: null,
    lifecycle: null,
  };
}

function summaryFromPreparation(input: {
  preparation: BasicFreeDiscoveryCreditReservationPreparation;
  tradingDate: string;
  minuteBucket: string;
  requestedCredits: number;
  dailyBudget: number;
  perMinuteBudget: number;
}): BasicFreeScheduledScanCreditReservationSummary {
  return {
    guard_version: BASIC_FREE_SCHEDULED_SCAN_CREDIT_GUARD_VERSION,
    contract_version: basicFreeDiscoveryCreditReservationContractVersion,
    scope: "normal_scheduled_scan",
    status: input.preparation.status,
    provider_execution_allowed: input.preparation.provider_execution_allowed,
    trading_date: input.tradingDate,
    minute_bucket: input.minuteBucket,
    requested_credits: input.requestedCredits,
    declared_daily_credit_budget: input.dailyBudget,
    declared_per_minute_credit_budget: input.perMinuteBudget,
    daily_reserved_credits: input.preparation.daily_reserved_credits,
    daily_remaining_credits: input.preparation.daily_remaining_credits,
    minute_reserved_credits: input.preparation.minute_reserved_credits,
    minute_remaining_credits: input.preparation.minute_remaining_credits,
    idempotent: input.preparation.idempotent,
    finalization_status: "not_started",
    finalization_proven: null,
    safe_blocker: input.preparation.safe_blocker,
  };
}

function exactPositiveInteger(value: string | undefined, expected: number) {
  if (value === undefined || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed === expected ? parsed : null;
}

function minuteBucketFor(now: Date) {
  return new Date(Math.floor(now.getTime() / 60_000) * 60_000).toISOString();
}
