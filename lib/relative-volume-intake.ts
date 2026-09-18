export const relativeVolumeIntakePolicyVersion =
  "us_equity_relative_volume_intake_v2" as const;

export type RelativeVolumeIntakeStatus =
  | "usable"
  | "stale"
  | "incomplete"
  | "invalid";

export type RelativeVolumeSignal =
  | "below_normal"
  | "normal"
  | "elevated"
  | "exceptional"
  | "unavailable";

export type RelativeVolumeIntakeReason =
  | "symbol_missing"
  | "observed_at_invalid"
  | "observed_at_in_future"
  | "observation_stale"
  | "regular_session_not_verified"
  | "market_calendar_source_missing"
  | "regular_session_opened_at_invalid"
  | "regular_session_closed_at_invalid"
  | "regular_session_window_invalid"
  | "regular_session_market_date_mismatch"
  | "observation_outside_regular_session"
  | "market_date_invalid"
  | "market_date_mismatch"
  | "elapsed_session_minutes_invalid"
  | "elapsed_session_minutes_mismatch"
  | "baseline_elapsed_minutes_invalid"
  | "baseline_elapsed_minutes_mismatch"
  | "current_volume_invalid"
  | "baseline_volume_invalid"
  | "baseline_sample_insufficient"
  | "baseline_as_of_invalid"
  | "baseline_as_of_after_observation"
  | "provider_missing";

export type RelativeVolumeIntakeInput = {
  symbol: string | null | undefined;
  provider: string | null | undefined;
  observed_at: Date | string | null | undefined;
  market_date: string | null | undefined;
  regular_session_verified: boolean | null | undefined;
  market_calendar_source: string | null | undefined;
  regular_session_opened_at: Date | string | null | undefined;
  regular_session_closed_at: Date | string | null | undefined;
  elapsed_regular_session_minutes: number | null | undefined;
  cumulative_regular_session_volume: number | null | undefined;
  baseline: {
    as_of: Date | string | null | undefined;
    elapsed_regular_session_minutes: number | null | undefined;
    cumulative_regular_session_volume: number | null | undefined;
    sample_session_count: number | null | undefined;
  } | null | undefined;
};

export type RelativeVolumeIntakeSummary = {
  summary_version: "2.0";
  summary_kind: "relative_volume_intake";
  policy_version: typeof relativeVolumeIntakePolicyVersion;
  symbol: string | null;
  provider: string | null;
  observed_at: string | null;
  market_date: string | null;
  market_calendar_source: string | null;
  regular_session_opened_at: string | null;
  regular_session_closed_at: string | null;
  status: RelativeVolumeIntakeStatus;
  admissible_for_discovery: boolean;
  can_change_ranking_or_publication: false;
  age_minutes: number | null;
  elapsed_regular_session_minutes: number | null;
  expected_elapsed_regular_session_minutes: number | null;
  baseline_elapsed_regular_session_minutes: number | null;
  baseline_sample_session_count: number | null;
  current_cumulative_volume: number | null;
  baseline_cumulative_volume: number | null;
  relative_volume: number | null;
  signal: RelativeVolumeSignal;
  reason_codes: RelativeVolumeIntakeReason[];
  gaps: string[];
};

export type RelativeVolumeIntakeResult = {
  summary: RelativeVolumeIntakeSummary;
};

const maxObservationAgeMinutes = 15;
const minBaselineSampleSessions = 20;

export function buildRelativeVolumeIntake(
  input: RelativeVolumeIntakeInput,
  now = new Date(),
): RelativeVolumeIntakeResult {
  const nowDate = validDate(now) ?? new Date(0);
  const symbol = normalizedSymbol(input.symbol);
  const provider = text(input.provider);
  const observedAt = validDate(input.observed_at);
  const marketDate = validMarketDate(input.market_date);
  const marketCalendarSource = text(input.market_calendar_source);
  const regularSessionOpenedAt = validDate(input.regular_session_opened_at);
  const regularSessionClosedAt = validDate(input.regular_session_closed_at);
  const baseline = input.baseline ?? null;
  const baselineAsOf = validDate(baseline?.as_of);
  const elapsedMinutes = positiveWholeNumber(input.elapsed_regular_session_minutes);
  const baselineElapsedMinutes = positiveWholeNumber(
    baseline?.elapsed_regular_session_minutes,
  );
  const currentVolume = positiveFiniteNumber(
    input.cumulative_regular_session_volume,
  );
  const baselineVolume = positiveFiniteNumber(
    baseline?.cumulative_regular_session_volume,
  );
  const sampleSessionCount = positiveWholeNumber(baseline?.sample_session_count);
  const reasons: RelativeVolumeIntakeReason[] = [];
  const gaps: string[] = [];

  if (!symbol) reasons.push("symbol_missing");
  if (!provider) reasons.push("provider_missing");
  if (!observedAt) {
    reasons.push("observed_at_invalid");
  } else if (observedAt.getTime() > nowDate.getTime()) {
    reasons.push("observed_at_in_future");
  }
  if (!input.regular_session_verified) reasons.push("regular_session_not_verified");
  if (!marketCalendarSource) reasons.push("market_calendar_source_missing");
  if (!regularSessionOpenedAt) {
    reasons.push("regular_session_opened_at_invalid");
  }
  if (!regularSessionClosedAt) {
    reasons.push("regular_session_closed_at_invalid");
  }
  if (
    regularSessionOpenedAt &&
    regularSessionClosedAt &&
    regularSessionClosedAt.getTime() <= regularSessionOpenedAt.getTime()
  ) {
    reasons.push("regular_session_window_invalid");
  }
  if (!marketDate) reasons.push("market_date_invalid");
  if (
    observedAt &&
    marketDate &&
    newYorkDate(observedAt) !== marketDate
  ) {
    reasons.push("market_date_mismatch");
  }
  if (
    marketDate &&
    ((regularSessionOpenedAt && newYorkDate(regularSessionOpenedAt) !== marketDate) ||
      (regularSessionClosedAt && newYorkDate(regularSessionClosedAt) !== marketDate))
  ) {
    reasons.push("regular_session_market_date_mismatch");
  }
  if (
    observedAt &&
    regularSessionOpenedAt &&
    regularSessionClosedAt &&
    regularSessionClosedAt.getTime() > regularSessionOpenedAt.getTime() &&
    (observedAt.getTime() < regularSessionOpenedAt.getTime() ||
      observedAt.getTime() > regularSessionClosedAt.getTime())
  ) {
    reasons.push("observation_outside_regular_session");
  }
  if (!elapsedMinutes) reasons.push("elapsed_session_minutes_invalid");
  const expectedElapsedMinutes = elapsedRegularSessionMinutes({
    observedAt,
    regularSessionOpenedAt,
    regularSessionClosedAt,
  });
  if (
    elapsedMinutes &&
    expectedElapsedMinutes !== null &&
    elapsedMinutes !== expectedElapsedMinutes
  ) {
    reasons.push("elapsed_session_minutes_mismatch");
  }
  if (!baselineElapsedMinutes) {
    reasons.push("baseline_elapsed_minutes_invalid");
  }
  if (
    elapsedMinutes &&
    baselineElapsedMinutes &&
    elapsedMinutes !== baselineElapsedMinutes
  ) {
    reasons.push("baseline_elapsed_minutes_mismatch");
  }
  if (!currentVolume) reasons.push("current_volume_invalid");
  if (!baselineVolume) reasons.push("baseline_volume_invalid");
  if (!sampleSessionCount || sampleSessionCount < minBaselineSampleSessions) {
    reasons.push("baseline_sample_insufficient");
  }
  if (!baselineAsOf) {
    reasons.push("baseline_as_of_invalid");
  } else if (observedAt && baselineAsOf.getTime() > observedAt.getTime()) {
    reasons.push("baseline_as_of_after_observation");
  }

  const ageMinutes = observedAt
    ? Math.max(0, (nowDate.getTime() - observedAt.getTime()) / 60_000)
    : null;
  if (
    ageMinutes !== null &&
    !reasons.includes("observed_at_in_future") &&
    ageMinutes > maxObservationAgeMinutes
  ) {
    reasons.push("observation_stale");
  }

  if (!marketDate) {
    gaps.push("market_date_missing_or_invalid");
  }
  if (!baselineElapsedMinutes) {
    gaps.push("baseline_elapsed_regular_session_minutes_missing_or_invalid");
  }

  const relativeVolume =
    currentVolume && baselineVolume ? round(currentVolume / baselineVolume) : null;
  const status = statusFromReasons(reasons);
  const admissible = status === "usable";

  return {
    summary: {
      summary_version: "2.0",
      summary_kind: "relative_volume_intake",
      policy_version: relativeVolumeIntakePolicyVersion,
      symbol,
      provider,
      observed_at: observedAt?.toISOString() ?? null,
      market_date: marketDate,
      market_calendar_source: marketCalendarSource,
      regular_session_opened_at: regularSessionOpenedAt?.toISOString() ?? null,
      regular_session_closed_at: regularSessionClosedAt?.toISOString() ?? null,
      status,
      admissible_for_discovery: admissible,
      can_change_ranking_or_publication: false,
      age_minutes: ageMinutes === null ? null : round(ageMinutes),
      elapsed_regular_session_minutes: elapsedMinutes,
      expected_elapsed_regular_session_minutes: expectedElapsedMinutes,
      baseline_elapsed_regular_session_minutes: baselineElapsedMinutes,
      baseline_sample_session_count: sampleSessionCount,
      current_cumulative_volume: currentVolume,
      baseline_cumulative_volume: baselineVolume,
      relative_volume: relativeVolume,
      signal: admissible ? relativeVolumeSignal(relativeVolume!) : "unavailable",
      reason_codes: reasons,
      gaps,
    },
  };
}

function statusFromReasons(
  reasons: RelativeVolumeIntakeReason[],
): RelativeVolumeIntakeStatus {
  if (reasons.length === 0) return "usable";
  if (
    reasons.some((reason) =>
      [
        "symbol_missing",
        "observed_at_invalid",
        "observed_at_in_future",
        "regular_session_opened_at_invalid",
        "regular_session_closed_at_invalid",
        "regular_session_window_invalid",
        "regular_session_market_date_mismatch",
        "observation_outside_regular_session",
        "market_date_invalid",
        "market_date_mismatch",
        "elapsed_session_minutes_invalid",
        "elapsed_session_minutes_mismatch",
        "baseline_elapsed_minutes_invalid",
        "current_volume_invalid",
        "baseline_volume_invalid",
        "baseline_as_of_invalid",
        "baseline_as_of_after_observation",
        "provider_missing",
      ].includes(reason),
    )
  ) {
    return "invalid";
  }
  if (reasons.includes("observation_stale")) return "stale";
  if (
    reasons.some((reason) =>
      [
        "regular_session_not_verified",
        "market_calendar_source_missing",
        "baseline_elapsed_minutes_mismatch",
        "baseline_sample_insufficient",
      ].includes(reason),
    )
  ) {
    return "incomplete";
  }
  return "invalid";
}

function relativeVolumeSignal(relativeVolume: number): RelativeVolumeSignal {
  if (relativeVolume < 0.75) return "below_normal";
  if (relativeVolume < 1.5) return "normal";
  if (relativeVolume < 2.5) return "elevated";
  return "exceptional";
}

function validDate(value: Date | string | null | undefined) {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" && value.trim().length > 0
        ? new Date(value)
        : null;
  return date && Number.isFinite(date.getTime()) ? date : null;
}

function elapsedRegularSessionMinutes({
  observedAt,
  regularSessionOpenedAt,
  regularSessionClosedAt,
}: {
  observedAt: Date | null;
  regularSessionOpenedAt: Date | null;
  regularSessionClosedAt: Date | null;
}) {
  if (
    !observedAt ||
    !regularSessionOpenedAt ||
    !regularSessionClosedAt ||
    regularSessionClosedAt.getTime() <= regularSessionOpenedAt.getTime() ||
    observedAt.getTime() < regularSessionOpenedAt.getTime() ||
    observedAt.getTime() > regularSessionClosedAt.getTime()
  ) {
    return null;
  }

  return Math.floor(
    (observedAt.getTime() - regularSessionOpenedAt.getTime()) / 60_000,
  );
}

function newYorkDate(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  return `${byType.get("year")}-${byType.get("month")}-${byType.get("day")}`;
}

function normalizedSymbol(value: string | null | undefined) {
  const normalized = text(value)?.toUpperCase() ?? null;
  return normalized && /^[A-Z0-9][A-Z0-9._-]{0,19}$/.test(normalized)
    ? normalized
    : null;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function validMarketDate(value: string | null | undefined) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
    ? value
    : null;
}

function positiveWholeNumber(value: number | null | undefined) {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
    ? value
    : null;
}

function positiveFiniteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function round(value: number) {
  return Math.round(value * 10_000) / 10_000;
}
