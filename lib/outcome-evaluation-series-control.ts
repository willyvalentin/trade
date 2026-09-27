import {
  BASIC_FREE_SCHEDULED_OUTCOME_MAX_CANDLE_REQUESTS,
} from "@/lib/basic-free-scheduled-outcome-capacity";

export const OUTCOME_EVALUATION_SERIES_CONTROL_VERSION =
  "outcome_evaluation_series_control_v1" as const;
export const OUTCOME_EVALUATION_SERIES_SLOT_ADMISSION_VERSION =
  "outcome_evaluation_series_slot_admission_v1" as const;
export const OUTCOME_EVALUATION_SERIES_SLOT_MINUTES = 15;
export const OUTCOME_EVALUATION_SERIES_MAX_ATTEMPTS = 16;

type EnvironmentReader = {
  get(name: string): string | undefined;
};

export type OutcomeEvaluationSeriesControl = Readonly<{
  control_version: typeof OUTCOME_EVALUATION_SERIES_CONTROL_VERSION;
  requested: boolean;
  status: "disabled" | "ready" | "invalid";
  series_id: string | null;
  trading_date: string | null;
  starts_at_utc: string | null;
  expires_at_utc: string | null;
  max_attempts: number | null;
  max_provider_credits: number | null;
  provider_credits_per_attempt: number;
  reason_codes: readonly string[];
}>;

export type OutcomeEvaluationSeriesSlotAdmission = Readonly<{
  admission_version: typeof OUTCOME_EVALUATION_SERIES_SLOT_ADMISSION_VERSION;
  decision: "eligible" | "no_request" | "reject";
  status:
    | "eligible"
    | "series_disabled"
    | "series_configuration_invalid"
    | "series_not_started"
    | "series_expired"
    | "series_date_mismatch"
    | "slot_unavailable";
  series_id: string | null;
  scheduled_slot_started_at_utc: string | null;
  slot_index: number | null;
  reason_codes: readonly string[];
}>;

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function canonicalDate(value: string | undefined) {
  const text = value?.trim() ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const parsed = new Date(`${text}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === text
    ? text
    : null;
}

function canonicalQuarterHour(value: string | undefined) {
  const text = value?.trim() ?? "";
  if (!text) return null;
  const parsed = new Date(text);
  return Number.isFinite(parsed.getTime()) &&
      parsed.toISOString() === text &&
      parsed.getTime() % (OUTCOME_EVALUATION_SERIES_SLOT_MINUTES * 60_000) === 0
    ? text
    : null;
}

function positiveInteger(value: string | undefined) {
  const text = value?.trim() ?? "";
  if (!/^\d+$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function newYorkDate(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");
  return year && month && day ? `${year}-${month}-${day}` : null;
}

function frozenControl(
  value: Omit<OutcomeEvaluationSeriesControl, "reason_codes"> & {
    reason_codes: string[];
  },
): OutcomeEvaluationSeriesControl {
  return Object.freeze({
    ...value,
    reason_codes: Object.freeze([...value.reason_codes]),
  });
}

function disabledControl(): OutcomeEvaluationSeriesControl {
  return frozenControl({
    control_version: OUTCOME_EVALUATION_SERIES_CONTROL_VERSION,
    requested: false,
    status: "disabled",
    series_id: null,
    trading_date: null,
    starts_at_utc: null,
    expires_at_utc: null,
    max_attempts: null,
    max_provider_credits: null,
    provider_credits_per_attempt:
      BASIC_FREE_SCHEDULED_OUTCOME_MAX_CANDLE_REQUESTS,
    reason_codes: ["outcome_evaluation_series_disabled"],
  });
}

export function outcomeEvaluationSeriesControlFromEnvironment(
  environment: EnvironmentReader,
): OutcomeEvaluationSeriesControl {
  if (environment.get("TURE_OUTCOME_EVALUATION_SERIES_ENABLED") !== "true") {
    return disabledControl();
  }

  const tradingDate = canonicalDate(
    environment.get("TURE_OUTCOME_EVALUATION_SERIES_DATE"),
  );
  const startsAtUtc = canonicalQuarterHour(
    environment.get("TURE_OUTCOME_EVALUATION_SERIES_START_SLOT_UTC"),
  );
  const expiresAtUtc = canonicalQuarterHour(
    environment.get("TURE_OUTCOME_EVALUATION_SERIES_EXPIRES_AT_UTC"),
  );
  const maxAttempts = positiveInteger(
    environment.get("TURE_OUTCOME_EVALUATION_SERIES_MAX_ATTEMPTS"),
  );
  const maxProviderCredits = positiveInteger(
    environment.get("TURE_OUTCOME_EVALUATION_SERIES_MAX_PROVIDER_CREDITS"),
  );
  const durationMinutes = startsAtUtc && expiresAtUtc
    ? (Date.parse(expiresAtUtc) - Date.parse(startsAtUtc)) / 60_000
    : null;
  const availableSlots = durationMinutes !== null && durationMinutes > 0
    ? durationMinutes / OUTCOME_EVALUATION_SERIES_SLOT_MINUTES
    : null;
  const expectedProviderCredits = maxAttempts === null
    ? null
    : maxAttempts * BASIC_FREE_SCHEDULED_OUTCOME_MAX_CANDLE_REQUESTS;
  const reasonCodes = [
    ...(tradingDate ? [] : ["series_trading_date_invalid"]),
    ...(startsAtUtc ? [] : ["series_start_slot_invalid"]),
    ...(expiresAtUtc ? [] : ["series_expiry_invalid"]),
    ...(availableSlots !== null &&
    Number.isInteger(availableSlots) &&
    availableSlots > 0 &&
    availableSlots <= OUTCOME_EVALUATION_SERIES_MAX_ATTEMPTS
      ? []
      : ["series_duration_invalid"]),
    ...(tradingDate && startsAtUtc && expiresAtUtc &&
    newYorkDate(startsAtUtc) === tradingDate &&
    newYorkDate(new Date(Date.parse(expiresAtUtc) - 1).toISOString()) ===
      tradingDate
      ? []
      : ["series_date_boundary_invalid"]),
    ...(maxAttempts !== null &&
    maxAttempts <= OUTCOME_EVALUATION_SERIES_MAX_ATTEMPTS &&
    maxAttempts === availableSlots
      ? []
      : ["series_attempt_cap_invalid"]),
    ...(maxProviderCredits !== null &&
    maxProviderCredits === expectedProviderCredits
      ? []
      : ["series_credit_cap_invalid"]),
  ];

  if (reasonCodes.length > 0) {
    return frozenControl({
      control_version: OUTCOME_EVALUATION_SERIES_CONTROL_VERSION,
      requested: true,
      status: "invalid",
      series_id: null,
      trading_date: tradingDate,
      starts_at_utc: startsAtUtc,
      expires_at_utc: expiresAtUtc,
      max_attempts: maxAttempts,
      max_provider_credits: maxProviderCredits,
      provider_credits_per_attempt:
        BASIC_FREE_SCHEDULED_OUTCOME_MAX_CANDLE_REQUESTS,
      reason_codes: reasonCodes,
    });
  }

  const identity = [
    tradingDate,
    startsAtUtc,
    expiresAtUtc,
    maxAttempts,
    maxProviderCredits,
  ].join("|");
  return frozenControl({
    control_version: OUTCOME_EVALUATION_SERIES_CONTROL_VERSION,
    requested: true,
    status: "ready",
    series_id: `outcome_evaluation_series_${stableHash(identity)}`,
    trading_date: tradingDate,
    starts_at_utc: startsAtUtc,
    expires_at_utc: expiresAtUtc,
    max_attempts: maxAttempts,
    max_provider_credits: maxProviderCredits,
    provider_credits_per_attempt:
      BASIC_FREE_SCHEDULED_OUTCOME_MAX_CANDLE_REQUESTS,
    reason_codes: ["outcome_evaluation_series_ready"],
  });
}

export function outcomeEvaluationSeriesControlFromUnknown(
  value: unknown,
): OutcomeEvaluationSeriesControl | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.control_version !== OUTCOME_EVALUATION_SERIES_CONTROL_VERSION ||
    candidate.requested !== true ||
    candidate.status !== "ready" ||
    typeof candidate.series_id !== "string"
  ) {
    return null;
  }
  const values = new Map<string, string>([
    ["TURE_OUTCOME_EVALUATION_SERIES_ENABLED", "true"],
    ["TURE_OUTCOME_EVALUATION_SERIES_DATE", String(candidate.trading_date ?? "")],
    ["TURE_OUTCOME_EVALUATION_SERIES_START_SLOT_UTC", String(candidate.starts_at_utc ?? "")],
    ["TURE_OUTCOME_EVALUATION_SERIES_EXPIRES_AT_UTC", String(candidate.expires_at_utc ?? "")],
    ["TURE_OUTCOME_EVALUATION_SERIES_MAX_ATTEMPTS", String(candidate.max_attempts ?? "")],
    ["TURE_OUTCOME_EVALUATION_SERIES_MAX_PROVIDER_CREDITS", String(candidate.max_provider_credits ?? "")],
  ]);
  const parsed = outcomeEvaluationSeriesControlFromEnvironment({
    get: (name) => values.get(name),
  });
  return parsed.status === "ready" && parsed.series_id === candidate.series_id
    ? parsed
    : null;
}

export function buildOutcomeEvaluationSeriesSlotAdmission({
  control,
  scheduledSlotStartedAtUtc,
}: {
  control: OutcomeEvaluationSeriesControl;
  scheduledSlotStartedAtUtc: string | null;
}): OutcomeEvaluationSeriesSlotAdmission {
  const slot = canonicalQuarterHour(scheduledSlotStartedAtUtc ?? undefined);
  const result = (
    decision: OutcomeEvaluationSeriesSlotAdmission["decision"],
    status: OutcomeEvaluationSeriesSlotAdmission["status"],
    slotIndex: number | null,
  ): OutcomeEvaluationSeriesSlotAdmission => Object.freeze({
    admission_version: OUTCOME_EVALUATION_SERIES_SLOT_ADMISSION_VERSION,
    decision,
    status,
    series_id: control.series_id,
    scheduled_slot_started_at_utc: slot,
    slot_index: slotIndex,
    reason_codes: Object.freeze([status]),
  });

  if (!control.requested) return result("no_request", "series_disabled", null);
  if (control.status !== "ready") {
    return result("reject", "series_configuration_invalid", null);
  }
  if (!slot) return result("reject", "slot_unavailable", null);
  if (newYorkDate(slot) !== control.trading_date) {
    return result("no_request", "series_date_mismatch", null);
  }
  if (Date.parse(slot) < Date.parse(control.starts_at_utc!)) {
    return result("no_request", "series_not_started", null);
  }
  if (Date.parse(slot) >= Date.parse(control.expires_at_utc!)) {
    return result("no_request", "series_expired", null);
  }
  const slotIndex = Math.floor(
    (Date.parse(slot) - Date.parse(control.starts_at_utc!)) /
      (OUTCOME_EVALUATION_SERIES_SLOT_MINUTES * 60_000),
  );
  if (slotIndex < 0 || slotIndex >= control.max_attempts!) {
    return result("reject", "series_configuration_invalid", slotIndex);
  }
  return result("eligible", "eligible", slotIndex);
}

export function outcomeEvaluationSeriesSlotAdmissionFromUnknown(
  value: unknown,
): OutcomeEvaluationSeriesSlotAdmission | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.admission_version !==
      OUTCOME_EVALUATION_SERIES_SLOT_ADMISSION_VERSION ||
    candidate.decision !== "eligible" ||
    candidate.status !== "eligible" ||
    typeof candidate.series_id !== "string" ||
    !Number.isInteger(candidate.slot_index) ||
    (candidate.slot_index as number) < 0
  ) {
    return null;
  }
  const slot = canonicalQuarterHour(
    typeof candidate.scheduled_slot_started_at_utc === "string"
      ? candidate.scheduled_slot_started_at_utc
      : undefined,
  );
  return slot
    ? Object.freeze({
        admission_version: OUTCOME_EVALUATION_SERIES_SLOT_ADMISSION_VERSION,
        decision: "eligible",
        status: "eligible",
        series_id: candidate.series_id,
        scheduled_slot_started_at_utc: slot,
        slot_index: candidate.slot_index as number,
        reason_codes: Object.freeze(["eligible"]),
      })
    : null;
}

export function outcomeEvaluationSeriesInvocationLineageFromUnknown({
  control: controlInput,
  slotAdmission: slotAdmissionInput,
  scheduledSlotStartedAtUtc,
}: {
  control: unknown;
  slotAdmission: unknown;
  scheduledSlotStartedAtUtc: string | null;
}):
  | { status: "not_requested"; control: null; slot_admission: null }
  | { status: "invalid"; control: null; slot_admission: null }
  | {
      status: "ready";
      control: OutcomeEvaluationSeriesControl;
      slot_admission: OutcomeEvaluationSeriesSlotAdmission;
    } {
  const attempted =
    controlInput !== undefined && controlInput !== null ||
    slotAdmissionInput !== undefined && slotAdmissionInput !== null;
  if (!attempted) {
    return { status: "not_requested", control: null, slot_admission: null };
  }
  const control = outcomeEvaluationSeriesControlFromUnknown(controlInput);
  const slotAdmission =
    outcomeEvaluationSeriesSlotAdmissionFromUnknown(slotAdmissionInput);
  const recomputed = control
    ? buildOutcomeEvaluationSeriesSlotAdmission({
        control,
        scheduledSlotStartedAtUtc,
      })
    : null;
  if (
    !control ||
    !slotAdmission ||
    recomputed?.decision !== "eligible" ||
    recomputed.series_id !== slotAdmission.series_id ||
    recomputed.scheduled_slot_started_at_utc !==
      slotAdmission.scheduled_slot_started_at_utc ||
    recomputed.slot_index !== slotAdmission.slot_index
  ) {
    return { status: "invalid", control: null, slot_admission: null };
  }
  return { status: "ready", control, slot_admission: slotAdmission };
}
