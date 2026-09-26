import { createHash } from "node:crypto";

import type {
  ObservationCycleReadback,
  ObservationCycleReceipt,
} from "@/lib/observation-cycle-receipt";
import {
  scheduledScanInvocationReceiptFromAttempt,
  type ScheduledScanInvocationReceipt,
} from "@/lib/scheduled-scan-invocation-receipt";

export const OBSERVATION_SERIES_CONTROL_VERSION =
  "observation_series_control_v1" as const;
export const OBSERVATION_SERIES_SLOT_ADMISSION_VERSION =
  "observation_series_slot_admission_v1" as const;
export const OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION =
  "observation_series_runtime_admission_v2" as const;
export const OBSERVATION_SERIES_PROVIDER_CREDITS_PER_ATTEMPT = 8;
export const OBSERVATION_SERIES_MAX_ATTEMPTS = 26;
export const OBSERVATION_SERIES_MAX_DURATION_MINUTES = 390;
export const OBSERVATION_SERIES_MAX_CONSECUTIVE_FAILURES = 3;

const quarterHourMilliseconds = 15 * 60 * 1000;
const seriesIdPattern = /^observation_series_[a-f0-9]{16}$/;

type EnvironmentReader = Readonly<{
  get(name: string): string | undefined;
}>;

export type ObservationSeriesControl = Readonly<{
  control_version: typeof OBSERVATION_SERIES_CONTROL_VERSION;
  requested: boolean;
  status: "disabled" | "ready" | "invalid";
  series_id: string | null;
  trading_date: string | null;
  starts_at_utc: string | null;
  expires_at_utc: string | null;
  max_attempts: number | null;
  max_provider_credits: number | null;
  stop_on_publication: true;
  max_consecutive_failures: typeof OBSERVATION_SERIES_MAX_CONSECUTIVE_FAILURES;
  reason_codes: readonly string[];
  authority: Readonly<{
    arms_scheduler: false;
    calls_provider: false;
    reserves_provider_credits: false;
    changes_ranking: false;
    publishes_candidate: false;
    executes_broker_order: false;
  }>;
}>;

export type ObservationSeriesSlotAdmission = Readonly<{
  admission_version: typeof OBSERVATION_SERIES_SLOT_ADMISSION_VERSION;
  decision: "bypass" | "eligible" | "no_request" | "reject";
  status:
    | "series_disabled"
    | "eligible"
    | "series_not_started"
    | "series_expired"
    | "series_date_mismatch"
    | "series_configuration_invalid";
  series_id: string | null;
  scheduled_slot_started_at_utc: string | null;
  next_eligible_at: string | null;
  reason_codes: readonly string[];
}>;

export type ObservationSeriesRuntimeAdmission = Readonly<{
  admission_version: typeof OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION;
  decision: "bypass" | "allow" | "no_request" | "reject";
  status:
    | "series_disabled"
    | "eligible"
    | "series_not_started"
    | "series_expired"
    | "series_date_mismatch"
    | "series_configuration_invalid"
    | "scheduler_series_identity_mismatch"
    | "series_history_unavailable"
    | "series_history_invalid"
    | "series_current_cycle_already_observed"
    | "series_active_cycle_unresolved"
    | "series_terminal_publication_observed"
    | "series_failure_stop_reached"
    | "series_attempt_cap_reached"
    | "series_credit_cap_reached";
  series_id: string | null;
  evaluated_at: string;
  scheduled_slot_started_at_utc: string | null;
  next_eligible_at: string | null;
  reason_codes: readonly string[];
  facts: Readonly<{
    attempted_cycles: number;
    reserved_provider_credits: number;
    remaining_attempts: number | null;
    remaining_provider_credits: number | null;
    active_cycles: number;
    completed_cycles: number;
    failed_cycles: number;
    consecutive_failures: number;
    published_recommendations: number;
    history_receipt_count: number;
    history_attempt_count: number;
    attributed_receipt_count: number;
  }>;
  authority: Readonly<{
    arms_scheduler: false;
    calls_provider: false;
    reserves_provider_credits: false;
    changes_ranking: false;
    publishes_candidate: false;
    executes_broker_order: false;
  }>;
}>;

function authority() {
  return Object.freeze({
    arms_scheduler: false as const,
    calls_provider: false as const,
    reserves_provider_credits: false as const,
    changes_ranking: false as const,
    publishes_candidate: false as const,
    executes_broker_order: false as const,
  });
}

function stableHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function canonicalDate(value: unknown) {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return null;
  const [year, month, day] = candidate.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.toISOString().slice(0, 10) === candidate ? candidate : null;
}

function canonicalQuarterHour(value: unknown) {
  const candidate = typeof value === "string" ? value.trim() : "";
  const timestamp = Date.parse(candidate);
  return candidate &&
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString() === candidate &&
    timestamp % quarterHourMilliseconds === 0
    ? candidate
    : null;
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function positiveInteger(value: unknown) {
  const candidate = typeof value === "string" ? value.trim() : value;
  const parsed = Number(candidate);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function newYorkDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: "year" | "month" | "day") =>
    parts.find((candidate) => candidate.type === type)?.value ?? null;
  const year = part("year");
  const month = part("month");
  const day = part("day");
  return year && month && day ? `${year}-${month}-${day}` : null;
}

function frozenControl(
  value: Omit<ObservationSeriesControl, "authority">,
): ObservationSeriesControl {
  return Object.freeze({
    ...value,
    reason_codes: Object.freeze([...value.reason_codes]),
    authority: authority(),
  });
}

function disabledControl(): ObservationSeriesControl {
  return frozenControl({
    control_version: OBSERVATION_SERIES_CONTROL_VERSION,
    requested: false,
    status: "disabled",
    series_id: null,
    trading_date: null,
    starts_at_utc: null,
    expires_at_utc: null,
    max_attempts: null,
    max_provider_credits: null,
    stop_on_publication: true,
    max_consecutive_failures: OBSERVATION_SERIES_MAX_CONSECUTIVE_FAILURES,
    reason_codes: ["observation_series_disabled"],
  });
}

export function observationSeriesControlFromEnvironment(
  environment: EnvironmentReader,
): ObservationSeriesControl {
  if (environment.get("TURE_OBSERVATION_SERIES_ENABLED") !== "true") {
    return disabledControl();
  }

  const tradingDate = canonicalDate(
    environment.get("TURE_OBSERVATION_SERIES_DATE"),
  );
  const startsAtUtc = canonicalQuarterHour(
    environment.get("TURE_OBSERVATION_SERIES_START_SLOT_UTC"),
  );
  const expiresAtUtc = canonicalQuarterHour(
    environment.get("TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC"),
  );
  const maxAttempts = positiveInteger(
    environment.get("TURE_OBSERVATION_SERIES_MAX_ATTEMPTS"),
  );
  const maxProviderCredits = positiveInteger(
    environment.get("TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS"),
  );
  const durationMinutes =
    startsAtUtc && expiresAtUtc
      ? (Date.parse(expiresAtUtc) - Date.parse(startsAtUtc)) / 60_000
      : null;
  const availableSlots =
    durationMinutes !== null && durationMinutes > 0
      ? Math.ceil(durationMinutes / 15)
      : null;
  const reasonCodes = [
    ...(tradingDate ? [] : ["series_trading_date_invalid"]),
    ...(startsAtUtc ? [] : ["series_start_slot_invalid"]),
    ...(expiresAtUtc ? [] : ["series_expiry_invalid"]),
    ...(durationMinutes !== null &&
    durationMinutes > 0 &&
    durationMinutes <= OBSERVATION_SERIES_MAX_DURATION_MINUTES
      ? []
      : ["series_duration_invalid"]),
    ...(tradingDate &&
    startsAtUtc &&
    expiresAtUtc &&
    newYorkDate(startsAtUtc) === tradingDate &&
    newYorkDate(new Date(Date.parse(expiresAtUtc) - 1).toISOString()) ===
      tradingDate
      ? []
      : ["series_date_boundary_invalid"]),
    ...(maxAttempts !== null &&
    maxAttempts <= OBSERVATION_SERIES_MAX_ATTEMPTS &&
    availableSlots !== null &&
    maxAttempts <= availableSlots
      ? []
      : ["series_attempt_cap_invalid"]),
    ...(maxProviderCredits !== null &&
    maxAttempts !== null &&
    maxProviderCredits % OBSERVATION_SERIES_PROVIDER_CREDITS_PER_ATTEMPT === 0 &&
    maxProviderCredits <=
      maxAttempts * OBSERVATION_SERIES_PROVIDER_CREDITS_PER_ATTEMPT
      ? []
      : ["series_credit_cap_invalid"]),
  ];

  if (reasonCodes.length > 0) {
    return frozenControl({
      control_version: OBSERVATION_SERIES_CONTROL_VERSION,
      requested: true,
      status: "invalid",
      series_id: null,
      trading_date: tradingDate,
      starts_at_utc: startsAtUtc,
      expires_at_utc: expiresAtUtc,
      max_attempts: maxAttempts,
      max_provider_credits: maxProviderCredits,
      stop_on_publication: true,
      max_consecutive_failures: OBSERVATION_SERIES_MAX_CONSECUTIVE_FAILURES,
      reason_codes: reasonCodes,
    });
  }

  const identity = [
    tradingDate,
    startsAtUtc,
    expiresAtUtc,
    maxAttempts,
    maxProviderCredits,
    OBSERVATION_SERIES_MAX_CONSECUTIVE_FAILURES,
  ].join("|");

  return frozenControl({
    control_version: OBSERVATION_SERIES_CONTROL_VERSION,
    requested: true,
    status: "ready",
    series_id: `observation_series_${stableHash(identity)}`,
    trading_date: tradingDate,
    starts_at_utc: startsAtUtc,
    expires_at_utc: expiresAtUtc,
    max_attempts: maxAttempts,
    max_provider_credits: maxProviderCredits,
    stop_on_publication: true,
    max_consecutive_failures: OBSERVATION_SERIES_MAX_CONSECUTIVE_FAILURES,
    reason_codes: ["observation_series_ready"],
  });
}

export function observationSeriesControlFromUnknown(
  value: unknown,
): ObservationSeriesControl | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.control_version !== OBSERVATION_SERIES_CONTROL_VERSION ||
    candidate.requested !== true ||
    candidate.status !== "ready" ||
    candidate.stop_on_publication !== true ||
    candidate.max_consecutive_failures !==
      OBSERVATION_SERIES_MAX_CONSECUTIVE_FAILURES ||
    typeof candidate.series_id !== "string" ||
    !seriesIdPattern.test(candidate.series_id)
  ) {
    return null;
  }

  const environment = new Map<string, string>([
    ["TURE_OBSERVATION_SERIES_ENABLED", "true"],
    ["TURE_OBSERVATION_SERIES_DATE", String(candidate.trading_date ?? "")],
    [
      "TURE_OBSERVATION_SERIES_START_SLOT_UTC",
      String(candidate.starts_at_utc ?? ""),
    ],
    [
      "TURE_OBSERVATION_SERIES_EXPIRES_AT_UTC",
      String(candidate.expires_at_utc ?? ""),
    ],
    [
      "TURE_OBSERVATION_SERIES_MAX_ATTEMPTS",
      String(candidate.max_attempts ?? ""),
    ],
    [
      "TURE_OBSERVATION_SERIES_MAX_PROVIDER_CREDITS",
      String(candidate.max_provider_credits ?? ""),
    ],
  ]);
  const parsed = observationSeriesControlFromEnvironment({
    get: (name) => environment.get(name),
  });
  return parsed.status === "ready" && parsed.series_id === candidate.series_id
    ? parsed
    : null;
}

function sameSeriesControl(
  first: ObservationSeriesControl,
  second: ObservationSeriesControl,
) {
  return (
    first.status === "ready" &&
    second.status === "ready" &&
    first.series_id === second.series_id &&
    first.trading_date === second.trading_date &&
    first.starts_at_utc === second.starts_at_utc &&
    first.expires_at_utc === second.expires_at_utc &&
    first.max_attempts === second.max_attempts &&
    first.max_provider_credits === second.max_provider_credits &&
    first.stop_on_publication === second.stop_on_publication &&
    first.max_consecutive_failures === second.max_consecutive_failures
  );
}

function sameBuildIdentity(
  first: ScheduledScanInvocationReceipt["build_deployment_identity"],
  second: ScheduledScanInvocationReceipt["build_deployment_identity"],
) {
  return (
    first.schema_version === second.schema_version &&
    first.deploy_id === second.deploy_id &&
    first.deploy_context === second.deploy_context &&
    first.commit_ref === second.commit_ref &&
    first.site_id === second.site_id
  );
}

type ObservationSeriesAttemptLineage = Readonly<{
  attempt_fingerprint: string;
  scheduled_slot_started_at_utc: string;
  invocation_receipt: ScheduledScanInvocationReceipt;
}>;

function observationSeriesAttemptLineageFromUnknown({
  value,
  control,
}: {
  value: unknown;
  control: ObservationSeriesControl;
}): ObservationSeriesAttemptLineage | null {
  const row = objectOrNull(value);
  const attemptFingerprint = textOrNull(row?.attempt_fingerprint)?.toLowerCase();
  const invocationReceipt = scheduledScanInvocationReceiptFromAttempt({
    source: row?.source,
    mode: row?.mode,
    payload: row?.payload_json,
  });
  if (!attemptFingerprint || !invocationReceipt) return null;

  const payload = invocationReceipt.durable_invocation_payload;
  const lineageControl = observationSeriesControlFromUnknown(
    payload.observation_series_control,
  );
  const lineageSlotAdmission = slotAdmissionFromUnknown(
    payload.observation_series_slot_admission,
  );
  if (
    !lineageControl ||
    !sameSeriesControl(lineageControl, control) ||
    !lineageSlotAdmission ||
    lineageSlotAdmission.series_id !== control.series_id ||
    lineageSlotAdmission.scheduled_slot_started_at_utc !==
      invocationReceipt.scheduled_slot_started_at_utc
  ) {
    return null;
  }

  return Object.freeze({
    attempt_fingerprint: attemptFingerprint,
    scheduled_slot_started_at_utc:
      invocationReceipt.scheduled_slot_started_at_utc,
    invocation_receipt: invocationReceipt,
  });
}

function receiptBuildIdentity(receipt: ObservationCycleReceipt) {
  const identity = objectOrNull(receipt.trigger.build_deployment_identity);
  if (!identity) return null;
  return scheduledScanInvocationReceiptFromAttempt({
    source: "netlify_scheduled_function",
    mode: "scheduled",
    payload: {
      scheduled_slot_started_at_utc:
        receipt.trigger.scheduled_slot_started_at_utc,
      scheduled_slot_identity_source: "netlify_event_next_run",
      build_deployment_identity: identity,
    },
  })?.build_deployment_identity ?? null;
}

export function buildObservationSeriesSlotAdmission({
  control,
  scheduledSlotStartedAtUtc,
}: {
  control: ObservationSeriesControl;
  scheduledSlotStartedAtUtc: unknown;
}): ObservationSeriesSlotAdmission {
  const slot = canonicalQuarterHour(scheduledSlotStartedAtUtc);
  let decision: ObservationSeriesSlotAdmission["decision"] = "reject";
  let status: ObservationSeriesSlotAdmission["status"] =
    "series_configuration_invalid";
  let nextEligibleAt: string | null = null;

  if (!control.requested) {
    decision = "bypass";
    status = "series_disabled";
  } else if (control.status !== "ready" || !slot) {
    decision = "reject";
  } else if (newYorkDate(slot) !== control.trading_date) {
    decision = "no_request";
    status = "series_date_mismatch";
  } else if (Date.parse(slot) < Date.parse(control.starts_at_utc!)) {
    decision = "no_request";
    status = "series_not_started";
    nextEligibleAt = control.starts_at_utc;
  } else if (Date.parse(slot) >= Date.parse(control.expires_at_utc!)) {
    decision = "no_request";
    status = "series_expired";
  } else {
    decision = "eligible";
    status = "eligible";
  }

  return Object.freeze({
    admission_version: OBSERVATION_SERIES_SLOT_ADMISSION_VERSION,
    decision,
    status,
    series_id: control.series_id,
    scheduled_slot_started_at_utc: slot,
    next_eligible_at: nextEligibleAt,
    reason_codes: Object.freeze([status]),
  });
}

function slotAdmissionFromUnknown(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const slot = canonicalQuarterHour(candidate.scheduled_slot_started_at_utc);
  if (
    candidate.admission_version !== OBSERVATION_SERIES_SLOT_ADMISSION_VERSION ||
    candidate.decision !== "eligible" ||
    candidate.status !== "eligible" ||
    typeof candidate.series_id !== "string" ||
    !seriesIdPattern.test(candidate.series_id) ||
    !slot
  ) {
    return null;
  }
  return {
    series_id: candidate.series_id,
    scheduled_slot_started_at_utc: slot,
  };
}

function receiptSlot(receipt: ObservationCycleReceipt) {
  return receipt.trigger.scheduled_slot_started_at_utc;
}

function admittedCurrentData(receipt: ObservationCycleReceipt) {
  return receipt.admission.policy_receipt?.decision === "request_current_data";
}

function withinSeries(
  receipt: ObservationCycleReceipt,
  control: ObservationSeriesControl,
) {
  const slot = receiptSlot(receipt);
  return Boolean(
    receipt.trigger.kind === "netlify_schedule" &&
      slot &&
      Date.parse(slot) >= Date.parse(control.starts_at_utc!) &&
      Date.parse(slot) < Date.parse(control.expires_at_utc!),
  );
}

function consecutiveFailures(receipts: readonly ObservationCycleReceipt[]) {
  let count = 0;
  for (const receipt of receipts) {
    if (receipt.cycle_status !== "failed") break;
    count += 1;
  }
  return count;
}

function runtimeReceipt(
  input: Omit<ObservationSeriesRuntimeAdmission, "authority">,
): ObservationSeriesRuntimeAdmission {
  return Object.freeze({
    ...input,
    reason_codes: Object.freeze([...input.reason_codes]),
    facts: Object.freeze({ ...input.facts }),
    authority: authority(),
  });
}

export function buildObservationSeriesRuntimeAdmission({
  control,
  schedulerControl,
  schedulerSlotAdmission,
  scheduledSlotStartedAtUtc,
  now,
  ownerUserId,
  readback,
  scheduledAttemptRows,
  currentAttemptFingerprint,
  perAttemptProviderCredits,
}: {
  control: ObservationSeriesControl;
  schedulerControl: unknown;
  schedulerSlotAdmission: unknown;
  scheduledSlotStartedAtUtc: unknown;
  now: Date;
  ownerUserId: string;
  readback: ObservationCycleReadback | null;
  scheduledAttemptRows?: readonly unknown[] | null;
  currentAttemptFingerprint?: string | null;
  perAttemptProviderCredits: number | null;
}): ObservationSeriesRuntimeAdmission {
  const emptyFacts = {
    attempted_cycles: 0,
    reserved_provider_credits: 0,
    remaining_attempts: control.max_attempts,
    remaining_provider_credits: control.max_provider_credits,
    active_cycles: 0,
    completed_cycles: 0,
    failed_cycles: 0,
    consecutive_failures: 0,
    published_recommendations: 0,
    history_receipt_count: 0,
    history_attempt_count: 0,
    attributed_receipt_count: 0,
  };
  const evaluatedAt = now.toISOString();
  const slotAdmission = buildObservationSeriesSlotAdmission({
    control,
    scheduledSlotStartedAtUtc,
  });

  if (!control.requested) {
    return runtimeReceipt({
      admission_version: OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION,
      decision: "bypass",
      status: "series_disabled",
      series_id: null,
      evaluated_at: evaluatedAt,
      scheduled_slot_started_at_utc:
        slotAdmission.scheduled_slot_started_at_utc,
      next_eligible_at: null,
      reason_codes: ["series_disabled"],
      facts: emptyFacts,
    });
  }

  if (control.status !== "ready") {
    return runtimeReceipt({
      admission_version: OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION,
      decision: "reject",
      status: "series_configuration_invalid",
      series_id: null,
      evaluated_at: evaluatedAt,
      scheduled_slot_started_at_utc:
        slotAdmission.scheduled_slot_started_at_utc,
      next_eligible_at: null,
      reason_codes: control.reason_codes,
      facts: emptyFacts,
    });
  }

  if (slotAdmission.decision !== "eligible") {
    return runtimeReceipt({
      admission_version: OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION,
      decision:
        slotAdmission.decision === "reject" ? "reject" : "no_request",
      status: slotAdmission.status,
      series_id: control.series_id,
      evaluated_at: evaluatedAt,
      scheduled_slot_started_at_utc:
        slotAdmission.scheduled_slot_started_at_utc,
      next_eligible_at: slotAdmission.next_eligible_at,
      reason_codes: slotAdmission.reason_codes,
      facts: emptyFacts,
    });
  }

  const parsedSchedulerControl =
    observationSeriesControlFromUnknown(schedulerControl);
  const parsedSchedulerSlot = slotAdmissionFromUnknown(
    schedulerSlotAdmission,
  );
  if (
    !parsedSchedulerControl ||
    !sameSeriesControl(parsedSchedulerControl, control) ||
    !parsedSchedulerSlot ||
    parsedSchedulerSlot.series_id !== control.series_id ||
    parsedSchedulerSlot.scheduled_slot_started_at_utc !==
      slotAdmission.scheduled_slot_started_at_utc
  ) {
    return runtimeReceipt({
      admission_version: OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION,
      decision: "reject",
      status: "scheduler_series_identity_mismatch",
      series_id: control.series_id,
      evaluated_at: evaluatedAt,
      scheduled_slot_started_at_utc:
        slotAdmission.scheduled_slot_started_at_utc,
      next_eligible_at: null,
      reason_codes: ["scheduler_series_identity_mismatch"],
      facts: emptyFacts,
    });
  }

  if (!readback || readback.status === "unavailable") {
    return runtimeReceipt({
      admission_version: OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION,
      decision: "reject",
      status: "series_history_unavailable",
      series_id: control.series_id,
      evaluated_at: evaluatedAt,
      scheduled_slot_started_at_utc:
        slotAdmission.scheduled_slot_started_at_utc,
      next_eligible_at: null,
      reason_codes: ["series_history_unavailable"],
      facts: emptyFacts,
    });
  }
  if (!scheduledAttemptRows) {
    return runtimeReceipt({
      admission_version: OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION,
      decision: "reject",
      status: "series_history_unavailable",
      series_id: control.series_id,
      evaluated_at: evaluatedAt,
      scheduled_slot_started_at_utc:
        slotAdmission.scheduled_slot_started_at_utc,
      next_eligible_at: null,
      reason_codes: ["series_attempt_history_unavailable"],
      facts: emptyFacts,
    });
  }
  if (readback.status !== "available" || readback.invalid_row_count !== 0) {
    return runtimeReceipt({
      admission_version: OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION,
      decision: "reject",
      status: "series_history_invalid",
      series_id: control.series_id,
      evaluated_at: evaluatedAt,
      scheduled_slot_started_at_utc:
        slotAdmission.scheduled_slot_started_at_utc,
      next_eligible_at: null,
      reason_codes: ["series_history_invalid"],
      facts: emptyFacts,
    });
  }

  const seriesReceipts = readback.receipts
    .filter((receipt) => receipt.owner_user_id === ownerUserId)
    .filter((receipt) => withinSeries(receipt, control));
  if (
    seriesReceipts.length !==
    readback.receipts.filter((receipt) => withinSeries(receipt, control)).length
  ) {
    return runtimeReceipt({
      admission_version: OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION,
      decision: "reject",
      status: "series_history_invalid",
      series_id: control.series_id,
      evaluated_at: evaluatedAt,
      scheduled_slot_started_at_utc:
        slotAdmission.scheduled_slot_started_at_utc,
      next_eligible_at: null,
      reason_codes: ["series_history_owner_mismatch"],
      facts: emptyFacts,
    });
  }
  const orderedSeriesReceipts = [...seriesReceipts].sort((first, second) =>
    (receiptSlot(second) ?? second.trigger.occurred_at).localeCompare(
      receiptSlot(first) ?? first.trigger.occurred_at,
    ),
  );
  const currentFingerprint = textOrNull(currentAttemptFingerprint)?.toLowerCase();
  const attemptLineages = scheduledAttemptRows.map((row) =>
    observationSeriesAttemptLineageFromUnknown({ value: row, control }),
  );
  const validAttemptLineages = attemptLineages.filter(
    (lineage): lineage is ObservationSeriesAttemptLineage => lineage !== null,
  );
  const currentAttempt = validAttemptLineages.find(
    (lineage) => lineage.attempt_fingerprint === currentFingerprint,
  );
  const uniqueAttemptFingerprints = new Set(
    validAttemptLineages.map((lineage) => lineage.attempt_fingerprint),
  );
  const uniqueAttemptSlots = new Set(
    validAttemptLineages.map(
      (lineage) => lineage.scheduled_slot_started_at_utc,
    ),
  );
  const currentBuildIdentity = currentAttempt?.invocation_receipt
    .build_deployment_identity ?? null;
  const buildIdentityMismatch = Boolean(
    currentBuildIdentity &&
      validAttemptLineages.some(
        (lineage) =>
          !sameBuildIdentity(
            lineage.invocation_receipt.build_deployment_identity,
            currentBuildIdentity,
          ),
      ),
  );
  const receiptsByAttempt = new Map<string, ObservationCycleReceipt[]>();
  for (const receipt of orderedSeriesReceipts) {
    const existing = receiptsByAttempt.get(receipt.source_attempt_fingerprint) ?? [];
    existing.push(receipt);
    receiptsByAttempt.set(receipt.source_attempt_fingerprint, existing);
  }
  const receiptAttributionInvalid = orderedSeriesReceipts.some((receipt) => {
    const attempt = validAttemptLineages.find(
      (lineage) =>
        lineage.attempt_fingerprint === receipt.source_attempt_fingerprint,
    );
    const buildIdentity = receiptBuildIdentity(receipt);
    return (
      !attempt ||
      receipt.trigger.scheduled_slot_started_at_utc !==
        attempt.scheduled_slot_started_at_utc ||
      !buildIdentity ||
      !sameBuildIdentity(
        buildIdentity,
        attempt.invocation_receipt.build_deployment_identity,
      )
    );
  });
  const priorAttemptMissingReceipt = validAttemptLineages.some(
    (lineage) =>
      lineage.attempt_fingerprint !== currentFingerprint &&
      !receiptsByAttempt.has(lineage.attempt_fingerprint),
  );
  const duplicateAttemptReceipt = [...receiptsByAttempt.values()].some(
    (receipts) => receipts.length !== 1,
  );
  const lineageReason =
    attemptLineages.some((lineage) => lineage === null)
      ? "series_attempt_lineage_invalid"
      : !currentFingerprint || !currentAttempt
        ? "series_current_attempt_missing"
        : uniqueAttemptFingerprints.size !== validAttemptLineages.length
          ? "series_attempt_fingerprint_duplicate"
          : uniqueAttemptSlots.size !== validAttemptLineages.length
            ? "series_attempt_slot_duplicate"
            : buildIdentityMismatch
              ? "series_attempt_build_identity_mismatch"
              : receiptAttributionInvalid
                ? "series_receipt_attempt_attribution_invalid"
                : priorAttemptMissingReceipt
                  ? "series_prior_attempt_receipt_missing"
                  : duplicateAttemptReceipt
                    ? "series_attempt_receipt_duplicate"
                    : null;
  if (lineageReason) {
    return runtimeReceipt({
      admission_version: OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION,
      decision: "reject",
      status: "series_history_invalid",
      series_id: control.series_id,
      evaluated_at: evaluatedAt,
      scheduled_slot_started_at_utc:
        slotAdmission.scheduled_slot_started_at_utc,
      next_eligible_at: null,
      reason_codes: [lineageReason],
      facts: {
        ...emptyFacts,
        history_receipt_count: seriesReceipts.length,
        history_attempt_count: scheduledAttemptRows.length,
        attributed_receipt_count: orderedSeriesReceipts.filter((receipt) =>
          uniqueAttemptFingerprints.has(receipt.source_attempt_fingerprint),
        ).length,
      },
    });
  }
  const admittedReceipts = orderedSeriesReceipts.filter(admittedCurrentData);
  const reservedCredits = seriesReceipts.reduce(
    (sum, receipt) => sum + receipt.provider_request.reserved_credits,
    0,
  );
  const activeCycles = orderedSeriesReceipts.filter(
    (receipt) => receipt.cycle_status === "active",
  ).length;
  const completedCycles = orderedSeriesReceipts.filter(
    (receipt) => receipt.cycle_status === "completed",
  ).length;
  const failedCycles = orderedSeriesReceipts.filter(
    (receipt) => receipt.cycle_status === "failed",
  ).length;
  // Pre-provider failures are still operational failures. Counting only
  // request_current_data receipts would let a broken preflight loop forever;
  // ordering all cycle receipts also ensures any successful/no-request cycle
  // truthfully breaks the consecutive-failure chain.
  const failureChain = consecutiveFailures(orderedSeriesReceipts);
  const publishedRecommendations = seriesReceipts.reduce(
    (sum, receipt) => sum + receipt.publication.published_count,
    0,
  );
  const facts = {
    attempted_cycles: admittedReceipts.length,
    reserved_provider_credits: reservedCredits,
    remaining_attempts: Math.max(
      0,
      control.max_attempts! - admittedReceipts.length,
    ),
    remaining_provider_credits: Math.max(
      0,
      control.max_provider_credits! - reservedCredits,
    ),
    active_cycles: activeCycles,
    completed_cycles: completedCycles,
    failed_cycles: failedCycles,
    consecutive_failures: failureChain,
    published_recommendations: publishedRecommendations,
    history_receipt_count: seriesReceipts.length,
    history_attempt_count: validAttemptLineages.length,
    attributed_receipt_count: seriesReceipts.length,
  };

  let decision: ObservationSeriesRuntimeAdmission["decision"] = "allow";
  let status: ObservationSeriesRuntimeAdmission["status"] = "eligible";
  if (receiptsByAttempt.has(currentFingerprint!)) {
    decision = "no_request";
    status = "series_current_cycle_already_observed";
  } else if (
    perAttemptProviderCredits !==
      OBSERVATION_SERIES_PROVIDER_CREDITS_PER_ATTEMPT ||
    seriesReceipts.some(
      (receipt) =>
        receipt.provider_request.reserved_credits >
        OBSERVATION_SERIES_PROVIDER_CREDITS_PER_ATTEMPT,
    )
  ) {
    decision = "reject";
    status = "series_history_invalid";
  } else if (publishedRecommendations > 0) {
    decision = "no_request";
    status = "series_terminal_publication_observed";
  } else if (activeCycles > 0) {
    decision = "no_request";
    status = "series_active_cycle_unresolved";
  } else if (
    failureChain >= OBSERVATION_SERIES_MAX_CONSECUTIVE_FAILURES
  ) {
    decision = "no_request";
    status = "series_failure_stop_reached";
  } else if (admittedReceipts.length >= control.max_attempts!) {
    decision = "no_request";
    status = "series_attempt_cap_reached";
  } else if (
    reservedCredits + OBSERVATION_SERIES_PROVIDER_CREDITS_PER_ATTEMPT >
    control.max_provider_credits!
  ) {
    decision = "no_request";
    status = "series_credit_cap_reached";
  }

  return runtimeReceipt({
    admission_version: OBSERVATION_SERIES_RUNTIME_ADMISSION_VERSION,
    decision,
    status,
    series_id: control.series_id,
    evaluated_at: evaluatedAt,
    scheduled_slot_started_at_utc:
      slotAdmission.scheduled_slot_started_at_utc,
    next_eligible_at: null,
    reason_codes: [status],
    facts,
  });
}
