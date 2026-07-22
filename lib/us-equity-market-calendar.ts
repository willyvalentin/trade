import calendarDatasetJson from "@/data/us-equity-market-calendar.json";
import {
  usEquityMarketCalendarContractVersion,
  usEquityMarketCalendarDatasetContractVersion,
  usEquityMarketCalendarSourceCategory,
  usEquityMarketCalendarTimezone,
  type UsEquityMarketCalendarCoverageStatus,
  type UsEquityMarketCalendarEvaluation,
  type UsEquityMarketCalendarFreshnessStatus,
  type UsEquityMarketCalendarRange,
  type UsEquityMarketCalendarVerificationStatus,
  type UsEquityMarketSessionType,
} from "@/lib/us-equity-market-calendar-contract";

type CalendarException = {
  market_date: string;
  session_type: "early_close_session" | "closed_holiday" | "closed_special";
  open_local_time?: string;
  close_local_time?: string;
  reason: string;
  weekend_open_justification?: string;
};

export type UsEquityMarketCalendarDataset = {
  contract_version: typeof usEquityMarketCalendarDatasetContractVersion;
  calendar_contract_version: typeof usEquityMarketCalendarContractVersion;
  timezone: typeof usEquityMarketCalendarTimezone;
  coverage_start: string;
  coverage_end: string;
  weekend_policy: "closed_weekend";
  standard_session: {
    open_local_time: string;
    close_local_time: string;
    session_type: "regular_session";
  };
  provenance: {
    source_category: typeof usEquityMarketCalendarSourceCategory;
    source_organizations: string[];
    source_documents: string[];
    source_retrieved_at: string;
    dataset_generated_at: string;
    recommended_refresh_date: string;
    generation_method: string;
    review_status: "reviewed";
  };
  exceptions: CalendarException[];
  dataset_fingerprint: string;
};

export type UsEquityMarketSession = Omit<
  UsEquityMarketCalendarEvaluation,
  "latest_completed_range"
>;

export type UsEquityMarketCalendarValidation = {
  status: "verified" | "invalid";
  errors: string[];
  dataset: UsEquityMarketCalendarDataset | null;
  computed_fingerprint: string | null;
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const openSessionTypes = new Set<UsEquityMarketSessionType>([
  "regular_session",
  "early_close_session",
]);
const exceptionSessionTypes = new Set<UsEquityMarketSessionType>([
  "early_close_session",
  "closed_holiday",
  "closed_special",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(new Date(value).getTime());
}

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .filter((key) => key !== "dataset_fingerprint")
      .sort()
      .map((key) => [key, stableValue(value[key])]),
  );
}

export function computeUsEquityMarketCalendarFingerprint(value: unknown) {
  const serialized = JSON.stringify(stableValue(value));
  let hash = 0x811c9dc5;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function validateUsEquityMarketCalendarDataset(
  value: unknown,
): UsEquityMarketCalendarValidation {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { status: "invalid", errors: ["dataset_not_object"], dataset: null, computed_fingerprint: null };
  }

  if (value.contract_version !== usEquityMarketCalendarDatasetContractVersion) errors.push("contract_version_invalid");
  if (value.calendar_contract_version !== usEquityMarketCalendarContractVersion) errors.push("calendar_contract_version_invalid");
  if (value.timezone !== usEquityMarketCalendarTimezone) errors.push("timezone_invalid");
  if (value.weekend_policy !== "closed_weekend") errors.push("weekend_policy_invalid");
  if (!validDate(value.coverage_start) || !validDate(value.coverage_end) || String(value.coverage_start) > String(value.coverage_end)) {
    errors.push("coverage_invalid");
  }

  const standard = value.standard_session;
  if (
    !isRecord(standard) ||
    standard.session_type !== "regular_session" ||
    standard.open_local_time !== "09:30" ||
    standard.close_local_time !== "16:00"
  ) {
    errors.push("standard_session_invalid");
  }

  const provenance = value.provenance;
  if (!isRecord(provenance)) {
    errors.push("provenance_missing");
  } else {
    if (provenance.source_category !== usEquityMarketCalendarSourceCategory) errors.push("source_category_invalid");
    if (!Array.isArray(provenance.source_organizations) || provenance.source_organizations.length < 1 || provenance.source_organizations.some((item) => typeof item !== "string" || !item.trim())) errors.push("source_organizations_missing");
    if (!Array.isArray(provenance.source_documents) || provenance.source_documents.length < 1 || provenance.source_documents.some((item) => typeof item !== "string" || !item.trim())) errors.push("source_documents_missing");
    if (!validTimestamp(provenance.source_retrieved_at) || !validTimestamp(provenance.dataset_generated_at)) errors.push("source_timestamps_invalid");
    if (!validDate(provenance.recommended_refresh_date)) errors.push("refresh_date_invalid");
    if (typeof provenance.generation_method !== "string" || !provenance.generation_method.trim()) errors.push("generation_method_missing");
    if (provenance.review_status !== "reviewed") errors.push("review_status_invalid");
  }

  if (!Array.isArray(value.exceptions)) {
    errors.push("exceptions_invalid");
  } else {
    let priorDate = "";
    const seenDates = new Set<string>();
    for (const rawEntry of value.exceptions) {
      if (!isRecord(rawEntry) || !validDate(rawEntry.market_date)) {
        errors.push("exception_date_invalid");
        continue;
      }
      const marketDate = rawEntry.market_date;
      if (seenDates.has(marketDate)) errors.push("exception_date_duplicate");
      if (priorDate && marketDate <= priorDate) errors.push("exception_dates_unsorted");
      seenDates.add(marketDate);
      priorDate = marketDate;
      if (validDate(value.coverage_start) && validDate(value.coverage_end) && (marketDate < value.coverage_start || marketDate > value.coverage_end)) errors.push("exception_outside_coverage");
      if (typeof rawEntry.session_type !== "string" || !exceptionSessionTypes.has(rawEntry.session_type as UsEquityMarketSessionType)) errors.push("exception_session_type_invalid");
      if (typeof rawEntry.reason !== "string" || !rawEntry.reason.trim()) errors.push("exception_reason_missing");
      const day = new Date(`${marketDate}T00:00:00.000Z`).getUTCDay();
      if (rawEntry.session_type === "early_close_session") {
        if (!timePattern.test(String(rawEntry.open_local_time)) || !timePattern.test(String(rawEntry.close_local_time))) {
          errors.push("early_close_time_invalid");
        } else if (minutes(String(rawEntry.open_local_time)) >= minutes(String(rawEntry.close_local_time)) || minutes(String(rawEntry.close_local_time)) >= 16 * 60) {
          errors.push("early_close_range_invalid");
        }
        if ((day === 0 || day === 6) && (typeof rawEntry.weekend_open_justification !== "string" || !rawEntry.weekend_open_justification.trim())) errors.push("weekend_open_unjustified");
      } else if (rawEntry.open_local_time !== undefined || rawEntry.close_local_time !== undefined) {
        errors.push("closed_session_has_times");
      }
    }
  }

  const computedFingerprint = computeUsEquityMarketCalendarFingerprint(value);
  if (value.dataset_fingerprint !== computedFingerprint) errors.push("dataset_fingerprint_mismatch");
  if (errors.length > 0) return { status: "invalid", errors: [...new Set(errors)], dataset: null, computed_fingerprint: computedFingerprint };
  return {
    status: "verified",
    errors: [],
    dataset: structuredClone(value) as UsEquityMarketCalendarDataset,
    computed_fingerprint: computedFingerprint,
  };
}

export const usEquityMarketCalendarValidation =
  validateUsEquityMarketCalendarDataset(calendarDatasetJson);
export const usEquityMarketCalendarDataset =
  usEquityMarketCalendarValidation.dataset;

function marketDateFromInstant(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: usEquityMarketCalendarTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function marketDate(value: Date | string) {
  if (typeof value === "string" && datePattern.test(value)) return validDate(value) ? value : null;
  const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(parsed.getTime()) ? marketDateFromInstant(parsed) : null;
}

function shiftMarketDate(value: string, days: number) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function newYorkParts(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: usEquityMarketCalendarTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value ?? "0");
  return { year: part("year"), month: part("month"), day: part("day"), hour: part("hour"), minute: part("minute"), second: part("second") };
}

function newYorkWallTimeToUtc(date: string, localTime: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = localTime.split(":").map(Number);
  let candidate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const observed = newYorkParts(candidate);
    const observedWall = Date.UTC(observed.year, observed.month - 1, observed.day, observed.hour, observed.minute);
    const desiredWall = Date.UTC(year, month - 1, day, hour, minute);
    const correction = desiredWall - observedWall;
    if (correction === 0) break;
    candidate = new Date(candidate.getTime() + correction);
  }
  return candidate;
}

function coverageForDate(date: string | null, dataset: UsEquityMarketCalendarDataset | null): UsEquityMarketCalendarCoverageStatus {
  if (!date) return "invalid_date";
  if (!dataset) return "invalid_date";
  if (date < dataset.coverage_start) return "before_coverage";
  if (date > dataset.coverage_end) return "after_coverage";
  return "covered";
}

function sourceStateForDate(date: string | null, dataset: UsEquityMarketCalendarDataset | null): {
  verification_status: UsEquityMarketCalendarVerificationStatus;
  freshness_status: UsEquityMarketCalendarFreshnessStatus;
  coverage_status: UsEquityMarketCalendarCoverageStatus;
} {
  const coverageStatus = coverageForDate(date, dataset);
  if (!dataset) return { verification_status: "invalid", freshness_status: "unverified", coverage_status: coverageStatus };
  if (coverageStatus !== "covered") return { verification_status: "unavailable", freshness_status: "expired", coverage_status: coverageStatus };
  if (date !== null && date >= dataset.provenance.recommended_refresh_date) {
    return { verification_status: "stale", freshness_status: "expiring_soon", coverage_status: coverageStatus };
  }
  const warningDate = shiftMarketDate(dataset.provenance.recommended_refresh_date, -180);
  return {
    verification_status: "verified",
    freshness_status: date !== null && date >= warningDate ? "expiring_soon" : "current",
    coverage_status: coverageStatus,
  };
}

export function getCalendarCoverageStatus(
  value: Date | string,
  dataset: UsEquityMarketCalendarDataset | null = usEquityMarketCalendarDataset,
) {
  return sourceStateForDate(marketDate(value), dataset);
}

export function getUsEquityMarketSession(
  value: Date | string,
  dataset: UsEquityMarketCalendarDataset | null = usEquityMarketCalendarDataset,
): UsEquityMarketSession {
  const date = marketDate(value);
  const source = sourceStateForDate(date, dataset);
  const base = {
    contract_version: usEquityMarketCalendarContractVersion,
    source_category: usEquityMarketCalendarSourceCategory,
    verification_status: source.verification_status,
    timezone: usEquityMarketCalendarTimezone,
    market_date: date,
    coverage_status: source.coverage_status,
    freshness_status: source.freshness_status,
    provenance_available: dataset !== null,
    holiday_awareness_available: source.verification_status === "verified",
    early_close_awareness_available: source.verification_status === "verified",
    regular_session_determination_available: source.verification_status === "verified",
  } as const;
  if (!dataset || !date || source.verification_status !== "verified") {
    return { ...base, session_type: "unknown", session_open: null, session_close: null, early_close: false, closed_reason: null };
  }
  const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  const exception = dataset.exceptions.find((item) => item.market_date === date);
  if (exception?.session_type === "closed_holiday" || exception?.session_type === "closed_special") {
    return { ...base, session_type: exception.session_type, session_open: null, session_close: null, early_close: false, closed_reason: exception.reason };
  }
  if ((day === 0 || day === 6) && exception?.session_type !== "early_close_session") {
    return { ...base, session_type: "closed_weekend", session_open: null, session_close: null, early_close: false, closed_reason: "Weekend" };
  }
  const sessionType = exception?.session_type === "early_close_session" ? "early_close_session" : "regular_session";
  const open = exception?.open_local_time ?? dataset.standard_session.open_local_time;
  const close = exception?.close_local_time ?? dataset.standard_session.close_local_time;
  return {
    ...base,
    session_type: sessionType,
    session_open: newYorkWallTimeToUtc(date, open).toISOString(),
    session_close: newYorkWallTimeToUtc(date, close).toISOString(),
    early_close: sessionType === "early_close_session",
    closed_reason: sessionType === "early_close_session" ? exception?.reason ?? null : null,
  };
}

export function isUsEquityRegularTradingDay(
  value: Date | string,
  dataset: UsEquityMarketCalendarDataset | null = usEquityMarketCalendarDataset,
) {
  return openSessionTypes.has(getUsEquityMarketSession(value, dataset).session_type);
}

function unavailableRange(
  durationMinutes: number,
  blocker: Exclude<UsEquityMarketCalendarRange["safe_blocker"], null>,
): UsEquityMarketCalendarRange {
  return { status: "unavailable", duration_minutes: durationMinutes, market_date: null, session_type: "unknown", start: null, end: null, safe_blocker: blocker };
}

export function getLatestCompletedRegularSessionRange(
  now: Date,
  durationMinutes: number,
  dataset: UsEquityMarketCalendarDataset | null = usEquityMarketCalendarDataset,
): UsEquityMarketCalendarRange {
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0 || durationMinutes > 30 || !Number.isFinite(now.getTime())) return unavailableRange(durationMinutes, "range_unavailable");
  const today = marketDate(now);
  const source = sourceStateForDate(today, dataset);
  if (source.verification_status === "invalid") return unavailableRange(durationMinutes, "calendar_invalid");
  if (source.verification_status === "stale") return unavailableRange(durationMinutes, "calendar_stale");
  if (source.verification_status !== "verified" || !dataset || !today) return unavailableRange(durationMinutes, "calendar_unavailable");
  const durationMs = durationMinutes * 60 * 1000;

  let candidateDate = today;
  for (let attempts = 0; attempts <= 10; attempts += 1) {
    const session = getUsEquityMarketSession(candidateDate, dataset);
    if (openSessionTypes.has(session.session_type) && session.session_open && session.session_close) {
      const open = new Date(session.session_open);
      const close = new Date(session.session_close);
      const latestPossibleEnd = candidateDate === today
        ? new Date(Math.min(now.getTime(), close.getTime()))
        : close;
      const completedBlocks = Math.floor((latestPossibleEnd.getTime() - open.getTime()) / durationMs);
      if (completedBlocks >= 1) {
        const end = new Date(open.getTime() + completedBlocks * durationMs);
        const boundedEnd = end.getTime() > close.getTime() ? close : end;
        const start = new Date(boundedEnd.getTime() - durationMs);
        if (start.getTime() >= open.getTime() && boundedEnd.getTime() <= now.getTime()) {
          return { status: "available", duration_minutes: durationMinutes, market_date: candidateDate, session_type: session.session_type, start: start.toISOString(), end: boundedEnd.toISOString(), safe_blocker: null };
        }
      }
    }
    candidateDate = shiftMarketDate(candidateDate, -1);
    if (candidateDate < dataset.coverage_start) break;
  }
  return unavailableRange(durationMinutes, "range_unavailable");
}

export function buildUsEquityMarketCalendarEvaluation(
  now: Date,
  durationMinutes = 30,
  dataset: UsEquityMarketCalendarDataset | null = usEquityMarketCalendarDataset,
): UsEquityMarketCalendarEvaluation {
  const session = getUsEquityMarketSession(now, dataset);
  return {
    ...session,
    latest_completed_range: getLatestCompletedRegularSessionRange(now, durationMinutes, dataset),
  };
}

export function buildUsEquityMarketCalendarDiagnostics(now: Date) {
  const evaluation = buildUsEquityMarketCalendarEvaluation(now);
  return {
    contract_version: evaluation.contract_version,
    dataset_contract_version: usEquityMarketCalendarDatasetContractVersion,
    dataset_fingerprint: usEquityMarketCalendarValidation.computed_fingerprint,
    source_category: evaluation.source_category,
    verification_status: evaluation.verification_status,
    timezone: evaluation.timezone,
    coverage_start: usEquityMarketCalendarDataset?.coverage_start ?? null,
    coverage_end: usEquityMarketCalendarDataset?.coverage_end ?? null,
    current_coverage_status: evaluation.coverage_status,
    freshness_status: evaluation.freshness_status,
    recommended_refresh_date: usEquityMarketCalendarDataset?.provenance.recommended_refresh_date ?? null,
    provenance_available: evaluation.provenance_available,
    holiday_awareness_available: evaluation.holiday_awareness_available,
    early_close_awareness_available: evaluation.early_close_awareness_available,
    regular_session_determination_available: evaluation.regular_session_determination_available,
    latest_completed_range_status: evaluation.latest_completed_range.status,
    provider_calls_inferred: false as const,
    durable_writes_inferred: false as const,
    schedule_changed: false as const,
  };
}
