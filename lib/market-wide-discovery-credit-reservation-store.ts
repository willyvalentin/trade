export const marketWideDiscoveryCreditReservationContractVersion =
  "market_wide_discovery_credit_reservation_v1" as const;
export const marketWideDiscoveryCreditReservationRpcName =
  "claim_market_wide_discovery_credit_reservation" as const;
export const marketWideDiscoveryCreditReservationBeginRpcName =
  "begin_market_wide_discovery_credit_reservation_attempt" as const;
export const marketWideDiscoveryCreditReservationFinalizeRpcName =
  "finalize_market_wide_discovery_credit_reservation_attempt" as const;
export const MARKET_WIDE_DISCOVERY_MAX_DAILY_CREDITS = 1000;

export type MarketWideDiscoveryCreditReservationInput = {
  claim_id: string;
  execution_fingerprint: string;
  owner_user_id: string;
  trading_date: string;
  requested_credits: number;
  declared_daily_credit_budget: number;
};

export type MarketWideDiscoveryCreditReservationDatabase = {
  claim: (input: MarketWideDiscoveryCreditReservationInput) => Promise<{
    data: {
      claim_status: string;
      claim_id: string | null;
      reservation_status: string | null;
      idempotent: boolean;
      reserved_credits: number | null;
      remaining_credits: number | null;
      blocker: string | null;
    } | null;
    error: { code?: string } | null;
  }>;
  beginAttempt: (input: {
    claim_id: string;
    execution_fingerprint: string;
  }) => Promise<{
    data: {
      attempt_status: string;
      claim_id: string | null;
      reservation_status: string | null;
      blocker: string | null;
    } | null;
    error: { code?: string } | null;
  }>;
  finalize: (input: {
    claim_id: string;
    execution_fingerprint: string;
    status: "completed" | "failed";
    finalized_at: string;
  }) => Promise<{
    data: {
      finalization_status: string;
      claim_id: string | null;
      reservation_status: string | null;
      blocker: string | null;
    } | null;
    error: { code?: string } | null;
  }>;
};

export type MarketWideDiscoveryCreditReservationPreparation = {
  status:
    | "provider_execution_allowed"
    | "daily_credit_limit_reached"
    | "attempt_in_progress"
    | "already_completed"
    | "already_failed"
    | "reservation_unavailable";
  provider_execution_allowed: boolean;
  claim_id: string | null;
  idempotent: boolean | null;
  reserved_credits: number | null;
  remaining_credits: number | null;
  safe_blocker: string | null;
};

export type MarketWideDiscoveryCreditReservationFinalization = {
  status:
    | "finalized"
    | "already_completed"
    | "already_failed"
    | "invalid_transition"
    | "reservation_unavailable";
  finalization_proven: boolean;
  safe_blocker: string | null;
};

function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value
  );
}

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function bounded(value: string, maximum: number) {
  return value.length > 0 && value.length <= maximum;
}

function validCredits(value: number) {
  return (
    Number.isInteger(value) &&
    value >= 100 &&
    value <= MARKET_WIDE_DISCOVERY_MAX_DAILY_CREDITS &&
    value % 100 === 0
  );
}

function unavailable(): MarketWideDiscoveryCreditReservationPreparation {
  return {
    status: "reservation_unavailable",
    provider_execution_allowed: false,
    claim_id: null,
    idempotent: null,
    reserved_credits: null,
    remaining_credits: null,
    safe_blocker: "daily_credit_reservation_unavailable",
  };
}

export function buildMarketWideDiscoveryCreditReservationClaimId(input: {
  trading_date: string;
  execution_fingerprint: string;
}) {
  let hash = 2166136261;
  const value = `${input.trading_date}|${input.execution_fingerprint}`;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `market_wide_discovery_claim_${input.trading_date.replaceAll("-", "")}_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function createMarketWideDiscoveryCreditReservationStore(
  database: MarketWideDiscoveryCreditReservationDatabase | null,
) {
  return {
    async prepare(
      input: MarketWideDiscoveryCreditReservationInput,
    ): Promise<MarketWideDiscoveryCreditReservationPreparation> {
      if (
        !database ||
        !validDate(input.trading_date) ||
        !validUuid(input.owner_user_id) ||
        !bounded(input.claim_id, 128) ||
        !bounded(input.execution_fingerprint, 240) ||
        !validCredits(input.requested_credits) ||
        !validCredits(input.declared_daily_credit_budget) ||
        input.declared_daily_credit_budget < input.requested_credits
      ) {
        return unavailable();
      }

      try {
        const claim = await database.claim(input);
        if (claim.error || !claim.data) return unavailable();

        if (claim.data.claim_status === "daily_credit_limit_reached") {
          return {
            status: "daily_credit_limit_reached",
            provider_execution_allowed: false,
            claim_id: null,
            idempotent: false,
            reserved_credits: claim.data.reserved_credits,
            remaining_credits: claim.data.remaining_credits,
            safe_blocker: "daily_credit_limit_reached",
          };
        }

        if (
          claim.data.claim_status !== "claimed" ||
          !claim.data.claim_id ||
          !claim.data.reservation_status ||
          typeof claim.data.idempotent !== "boolean" ||
          !validCreditsOrZero(claim.data.reserved_credits) ||
          !validCreditsOrZero(claim.data.remaining_credits)
        ) {
          return unavailable();
        }

        const attempt = await database.beginAttempt({
          claim_id: claim.data.claim_id,
          execution_fingerprint: input.execution_fingerprint,
        });
        if (attempt.error || !attempt.data || attempt.data.claim_id !== claim.data.claim_id) {
          return unavailable();
        }

        if (
          attempt.data.attempt_status === "attempt_started" &&
          attempt.data.reservation_status === "attempted"
        ) {
          return {
            status: "provider_execution_allowed",
            provider_execution_allowed: true,
            claim_id: claim.data.claim_id,
            idempotent: claim.data.idempotent,
            reserved_credits: claim.data.reserved_credits,
            remaining_credits: claim.data.remaining_credits,
            safe_blocker: null,
          };
        }

        if (
          attempt.data.attempt_status === "attempt_in_progress" ||
          attempt.data.attempt_status === "already_completed" ||
          attempt.data.attempt_status === "already_failed"
        ) {
          return {
            status: attempt.data.attempt_status,
            provider_execution_allowed: false,
            claim_id: claim.data.claim_id,
            idempotent: claim.data.idempotent,
            reserved_credits: claim.data.reserved_credits,
            remaining_credits: claim.data.remaining_credits,
            safe_blocker: attempt.data.attempt_status,
          };
        }
      } catch {
        // A dynamic provider call needs a durable one-winner transition.
      }
      return unavailable();
    },

    async finalize(input: {
      claim_id: string;
      execution_fingerprint: string;
      status: "completed" | "failed";
      finalized_at: string;
    }): Promise<MarketWideDiscoveryCreditReservationFinalization> {
      if (
        !database ||
        !bounded(input.claim_id, 128) ||
        !bounded(input.execution_fingerprint, 240) ||
        !Number.isFinite(Date.parse(input.finalized_at))
      ) {
        return {
          status: "reservation_unavailable",
          finalization_proven: false,
          safe_blocker: "daily_credit_reservation_unavailable",
        };
      }
      try {
        const result = await database.finalize(input);
        if (result.error || !result.data || result.data.claim_id !== input.claim_id) {
          throw new Error("credit reservation finalization unavailable");
        }
        if (
          result.data.finalization_status === "finalized" ||
          result.data.finalization_status === "already_completed" ||
          result.data.finalization_status === "already_failed"
        ) {
          return {
            status: result.data.finalization_status,
            finalization_proven: true,
            safe_blocker: null,
          };
        }
        if (result.data.finalization_status === "invalid_transition") {
          return {
            status: "invalid_transition",
            finalization_proven: false,
            safe_blocker: "invalid_transition",
          };
        }
      } catch {
        // The reservation remains charged; never retry the provider to repair it.
      }
      return {
        status: "reservation_unavailable",
        finalization_proven: false,
        safe_blocker: "daily_credit_reservation_unavailable",
      };
    },
  };
}

function validCreditsOrZero(value: number | null) {
  return value === 0 || (typeof value === "number" && validCredits(value));
}
