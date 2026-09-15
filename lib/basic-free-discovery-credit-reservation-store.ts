export const basicFreeDiscoveryCreditReservationContractVersion =
  "basic_free_discovery_credit_reservation_v1" as const;
export const basicFreeDiscoveryCreditReservationRpcName =
  "claim_basic_free_discovery_credit_reservation" as const;
export const basicFreeDiscoveryCreditReservationBeginRpcName =
  "begin_basic_free_discovery_credit_reservation_attempt" as const;
export const basicFreeDiscoveryCreditReservationFinalizeRpcName =
  "finalize_basic_free_discovery_credit_reservation_attempt" as const;
export const BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS = 800;
export const BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS = 8;

export type BasicFreeDiscoveryCreditReservationInput = {
  claim_id: string;
  execution_fingerprint: string;
  owner_user_id: string;
  trading_date: string;
  minute_bucket: string;
  requested_credits: number;
  declared_daily_credit_budget: number;
  declared_per_minute_credit_budget: number;
};

export type BasicFreeDiscoveryCreditReservationDatabase = {
  claim: (input: BasicFreeDiscoveryCreditReservationInput) => Promise<{
    data: {
      claim_status: string;
      claim_id: string | null;
      reservation_status: string | null;
      idempotent: boolean;
      daily_reserved_credits: number | null;
      daily_remaining_credits: number | null;
      minute_reserved_credits: number | null;
      minute_remaining_credits: number | null;
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

export type BasicFreeDiscoveryCreditReservationPreparation = {
  status:
    | "provider_execution_allowed"
    | "daily_credit_limit_reached"
    | "per_minute_credit_limit_reached"
    | "attempt_in_progress"
    | "already_completed"
    | "already_failed"
    | "reservation_unavailable";
  provider_execution_allowed: boolean;
  claim_id: string | null;
  idempotent: boolean | null;
  daily_reserved_credits: number | null;
  daily_remaining_credits: number | null;
  minute_reserved_credits: number | null;
  minute_remaining_credits: number | null;
  safe_blocker: string | null;
};

export type BasicFreeDiscoveryCreditReservationFinalization = {
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

function validMinuteBucket(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/.test(value) &&
    new Date(value).toISOString() === value
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

function validCredits(value: number, maximum: number) {
  return Number.isInteger(value) && value >= 1 && value <= maximum;
}

function unavailable(): BasicFreeDiscoveryCreditReservationPreparation {
  return {
    status: "reservation_unavailable",
    provider_execution_allowed: false,
    claim_id: null,
    idempotent: null,
    daily_reserved_credits: null,
    daily_remaining_credits: null,
    minute_reserved_credits: null,
    minute_remaining_credits: null,
    safe_blocker: "basic_free_credit_reservation_unavailable",
  };
}

function validCreditsOrZero(value: number | null, maximum: number) {
  return value === 0 || (typeof value === "number" && validCredits(value, maximum));
}

export function buildBasicFreeDiscoveryCreditReservationClaimId(input: {
  trading_date: string;
  execution_fingerprint: string;
}) {
  let hash = 2166136261;
  const value = `${input.trading_date}|${input.execution_fingerprint}`;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `basic_free_discovery_claim_${input.trading_date.replaceAll("-", "")}_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function createBasicFreeDiscoveryCreditReservationStore(
  database: BasicFreeDiscoveryCreditReservationDatabase | null,
) {
  return {
    async prepare(
      input: BasicFreeDiscoveryCreditReservationInput,
    ): Promise<BasicFreeDiscoveryCreditReservationPreparation> {
      if (
        !database ||
        !validDate(input.trading_date) ||
        !validMinuteBucket(input.minute_bucket) ||
        !validUuid(input.owner_user_id) ||
        !bounded(input.claim_id, 128) ||
        !bounded(input.execution_fingerprint, 240) ||
        !validCredits(input.requested_credits, BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS) ||
        !validCredits(
          input.declared_daily_credit_budget,
          BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS,
        ) ||
        !validCredits(
          input.declared_per_minute_credit_budget,
          BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS,
        ) ||
        input.declared_daily_credit_budget < input.requested_credits ||
        input.declared_per_minute_credit_budget < input.requested_credits
      ) {
        return unavailable();
      }

      try {
        const claim = await database.claim(input);
        if (claim.error || !claim.data) return unavailable();

        if (
          claim.data.claim_status === "daily_credit_limit_reached" ||
          claim.data.claim_status === "per_minute_credit_limit_reached"
        ) {
          return {
            status: claim.data.claim_status,
            provider_execution_allowed: false,
            claim_id: null,
            idempotent: false,
            daily_reserved_credits: claim.data.daily_reserved_credits,
            daily_remaining_credits: claim.data.daily_remaining_credits,
            minute_reserved_credits: claim.data.minute_reserved_credits,
            minute_remaining_credits: claim.data.minute_remaining_credits,
            safe_blocker: claim.data.claim_status,
          };
        }

        if (
          claim.data.claim_status !== "claimed" ||
          !claim.data.claim_id ||
          !claim.data.reservation_status ||
          typeof claim.data.idempotent !== "boolean" ||
          !validCreditsOrZero(
            claim.data.daily_reserved_credits,
            BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS,
          ) ||
          !validCreditsOrZero(
            claim.data.daily_remaining_credits,
            BASIC_FREE_DISCOVERY_MAX_DAILY_CREDITS,
          ) ||
          !validCreditsOrZero(
            claim.data.minute_reserved_credits,
            BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS,
          ) ||
          !validCreditsOrZero(
            claim.data.minute_remaining_credits,
            BASIC_FREE_DISCOVERY_MAX_PER_MINUTE_CREDITS,
          )
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
            daily_reserved_credits: claim.data.daily_reserved_credits,
            daily_remaining_credits: claim.data.daily_remaining_credits,
            minute_reserved_credits: claim.data.minute_reserved_credits,
            minute_remaining_credits: claim.data.minute_remaining_credits,
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
            daily_reserved_credits: claim.data.daily_reserved_credits,
            daily_remaining_credits: claim.data.daily_remaining_credits,
            minute_reserved_credits: claim.data.minute_reserved_credits,
            minute_remaining_credits: claim.data.minute_remaining_credits,
            safe_blocker: attempt.data.attempt_status,
          };
        }
      } catch {
        // Provider execution requires a durable, one-winner state transition.
      }
      return unavailable();
    },

    async finalize(input: {
      claim_id: string;
      execution_fingerprint: string;
      status: "completed" | "failed";
      finalized_at: string;
    }): Promise<BasicFreeDiscoveryCreditReservationFinalization> {
      if (
        !database ||
        !bounded(input.claim_id, 128) ||
        !bounded(input.execution_fingerprint, 240) ||
        !Number.isFinite(Date.parse(input.finalized_at))
      ) {
        return {
          status: "reservation_unavailable",
          finalization_proven: false,
          safe_blocker: "basic_free_credit_reservation_unavailable",
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
        // Reservation remains charged. Never retry the provider to repair it.
      }
      return {
        status: "reservation_unavailable",
        finalization_proven: false,
        safe_blocker: "basic_free_credit_reservation_unavailable",
      };
    },
  };
}
