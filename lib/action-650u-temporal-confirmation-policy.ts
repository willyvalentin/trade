import {
  deepFreezeAction650s,
  hashAction650sCanonicalValue,
} from "@/lib/action-650s-execution-identity";

export const action650uTemporalConfirmationPolicyVersion =
  "action_650u_temporal_confirmation_policy_v1" as const;

export type Action650uTemporalConfirmationReason =
  | "manual_confirmation_timestamp_invalid"
  | "manual_confirmation_waiting_timestamp_invalid"
  | "manual_confirmation_lifecycle_state_mismatch"
  | "manual_confirmation_before_waiting_boundary"
  | "manual_confirmation_session_not_started"
  | "manual_confirmation_session_expired";

export type Action650uCanonicalInstant = Readonly<{
  canonical_instant: string;
  epoch_nanoseconds: string;
}>;

const instantPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/;

function offsetMinutes(zone: string) {
  if (zone === "Z") return 0;

  const sign = zone[0] === "-" ? -1 : 1;
  const hours = Number(zone.slice(1, 3));
  const minutes = Number(zone.slice(4, 6));

  if (hours > 23 || minutes > 59) return null;
  return sign * (hours * 60 + minutes);
}

/**
 * Parses an RFC 3339-style instant without losing fractional precision.
 * The returned epoch value is a decimal string so it remains JSON-safe.
 */
export function canonicalizeAction650uNanosecondInstant(
  value: unknown,
): Action650uCanonicalInstant | null {
  if (typeof value !== "string") return null;

  const match = instantPattern.exec(value.trim());
  if (!match) return null;

  const [, year, month, day, hour, minute, second, fraction = "", zone] =
    match;
  if (year === "0000") return null;

  const offset = offsetMinutes(zone);
  if (offset === null) return null;

  const localSecond = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  const epochMilliseconds = Date.parse(`${localSecond}${zone}`);
  if (!Number.isFinite(epochMilliseconds)) return null;

  const roundTripLocal = new Date(
    epochMilliseconds + offset * 60_000,
  ).toISOString().slice(0, 19);
  if (roundTripLocal !== localSecond) return null;

  const nanoseconds = fraction.padEnd(9, "0");
  const epochNanoseconds =
    BigInt(epochMilliseconds) * BigInt(1_000_000) + BigInt(nanoseconds);
  const canonicalSecond = new Date(epochMilliseconds)
    .toISOString()
    .slice(0, 19);

  return deepFreezeAction650s({
    canonical_instant: `${canonicalSecond}.${nanoseconds}Z`,
    epoch_nanoseconds: epochNanoseconds.toString(),
  });
}

export function compareAction650uInstants(
  left: Action650uCanonicalInstant,
  right: Action650uCanonicalInstant,
) {
  const leftValue = BigInt(left.epoch_nanoseconds);
  const rightValue = BigInt(right.epoch_nanoseconds);
  return leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
}

export type Action650uTemporalPolicyDecision =
  | Readonly<{
      accepted: true;
      policy_version: typeof action650uTemporalConfirmationPolicyVersion;
      confirmed_at: string;
      waiting_for_manual_confirmation_at: string;
      session_started_at: string;
      session_expires_at: string;
      decision_digest: string;
    }>
  | Readonly<{
      accepted: false;
      policy_version: typeof action650uTemporalConfirmationPolicyVersion;
      reason: Action650uTemporalConfirmationReason;
    }>;

/**
 * Pure verifier only. It derives validity and cannot issue authority.
 */
export function evaluateAction650uTemporalConfirmationPolicy(input: {
  current_lifecycle_state: unknown;
  waiting_for_manual_confirmation_at: unknown;
  confirmed_at: unknown;
  session_started_at: unknown;
  session_expires_at: unknown;
}): Action650uTemporalPolicyDecision {
  if (input.current_lifecycle_state !== "waiting_for_manual_confirmation") {
    return deepFreezeAction650s({
      accepted: false as const,
      policy_version: action650uTemporalConfirmationPolicyVersion,
      reason: "manual_confirmation_lifecycle_state_mismatch" as const,
    });
  }

  const waitingAt = canonicalizeAction650uNanosecondInstant(
    input.waiting_for_manual_confirmation_at,
  );
  if (!waitingAt) {
    return deepFreezeAction650s({
      accepted: false as const,
      policy_version: action650uTemporalConfirmationPolicyVersion,
      reason: "manual_confirmation_waiting_timestamp_invalid" as const,
    });
  }

  const confirmedAt = canonicalizeAction650uNanosecondInstant(
    input.confirmed_at,
  );
  const sessionStartedAt = canonicalizeAction650uNanosecondInstant(
    input.session_started_at,
  );
  const expiresAt = canonicalizeAction650uNanosecondInstant(
    input.session_expires_at,
  );
  if (!confirmedAt || !sessionStartedAt || !expiresAt) {
    return deepFreezeAction650s({
      accepted: false as const,
      policy_version: action650uTemporalConfirmationPolicyVersion,
      reason: "manual_confirmation_timestamp_invalid" as const,
    });
  }

  if (compareAction650uInstants(confirmedAt, waitingAt) < 0) {
    return deepFreezeAction650s({
      accepted: false as const,
      policy_version: action650uTemporalConfirmationPolicyVersion,
      reason: "manual_confirmation_before_waiting_boundary" as const,
    });
  }

  if (compareAction650uInstants(confirmedAt, sessionStartedAt) < 0) {
    return deepFreezeAction650s({
      accepted: false as const,
      policy_version: action650uTemporalConfirmationPolicyVersion,
      reason: "manual_confirmation_session_not_started" as const,
    });
  }

  if (compareAction650uInstants(confirmedAt, expiresAt) >= 0) {
    return deepFreezeAction650s({
      accepted: false as const,
      policy_version: action650uTemporalConfirmationPolicyVersion,
      reason: "manual_confirmation_session_expired" as const,
    });
  }

  const projection = {
    policy_version: action650uTemporalConfirmationPolicyVersion,
    confirmed_at: confirmedAt.canonical_instant,
    waiting_for_manual_confirmation_at: waitingAt.canonical_instant,
    session_started_at: sessionStartedAt.canonical_instant,
    session_expires_at: expiresAt.canonical_instant,
  };

  return deepFreezeAction650s({
    accepted: true as const,
    ...projection,
    decision_digest: `action_650u_temporal_decision_${hashAction650sCanonicalValue(
      projection,
    )}`,
  });
}
