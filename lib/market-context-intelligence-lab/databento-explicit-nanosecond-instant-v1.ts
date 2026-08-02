export const DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1 =
  "databento_explicit_nanosecond_instant_parser_v1" as const;

export const DATABENTO_EXPLICIT_NANOSECOND_INSTANT_POLICY_V1 = {
  minimum_year: 1970,
  maximum_year: 9999,
  fractional_digits_minimum: 0,
  fractional_digits_maximum: 9,
  explicit_utc_z_allowed: true,
  explicit_offset_allowed: true,
  maximum_absolute_offset_minutes: 14 * 60,
  lowercase_z_allowed: false,
  leap_second_supported: false,
  canonical_representation: "signed_unix_nanosecond_decimal_string",
  floating_point_conversion_allowed: false,
  host_timezone_used: false,
} as const;

const explicitInstantPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|([+-])(\d{2}):(\d{2}))$/;

export type DatabentoInstantRejectionReason =
  | "value_not_string"
  | "syntax_not_strict_explicit_instant"
  | "year_out_of_policy"
  | "calendar_date_invalid"
  | "clock_time_invalid"
  | "leap_second_unsupported"
  | "offset_out_of_policy";

export type DatabentoExplicitNanosecondInstantResult =
  | {
      ok: true;
      parser_version: typeof DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1;
      unix_nanoseconds: string;
    }
  | {
      ok: false;
      parser_version: typeof DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1;
      error_code: "databento_explicit_nanosecond_instant_rejected";
      reason_code: DatabentoInstantRejectionReason;
      field: string;
    };

export type DatabentoInstantComparisonResult =
  | {
      ok: true;
      parser_version: typeof DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1;
      relation: -1 | 0 | 1;
      signed_delta_nanoseconds: string;
    }
  | {
      ok: false;
      parser_version: typeof DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1;
      error_code: "databento_instant_comparison_rejected";
      rejected_field: string;
      reason_code: DatabentoInstantRejectionReason;
    };

export type DatabentoFreshnessResult =
  | {
      ok: true;
      parser_version: typeof DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1;
      freshness_state: "fresh" | "stale" | "future";
      age_nanoseconds: string;
      maximum_age_nanoseconds: string;
      within_maximum_age: boolean;
    }
  | {
      ok: false;
      parser_version: typeof DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1;
      error_code: "databento_freshness_evaluation_rejected";
      rejected_field: string;
      reason_code:
        | DatabentoInstantRejectionReason
        | "maximum_age_nanoseconds_invalid";
    };

export type DatabentoIntervalMembershipResult =
  | {
      ok: true;
      parser_version: typeof DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1;
      interval_semantics: "inclusive_start_exclusive_end";
      is_member: boolean;
    }
  | {
      ok: false;
      parser_version: typeof DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1;
      error_code: "databento_interval_membership_rejected";
      rejected_field: string;
      reason_code:
        | DatabentoInstantRejectionReason
        | "interval_not_increasing";
    };

function rejected(
  field: string,
  reason_code: DatabentoInstantRejectionReason,
): DatabentoExplicitNanosecondInstantResult {
  return {
    ok: false,
    parser_version:
      DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
    error_code: "databento_explicit_nanosecond_instant_rejected",
    reason_code,
    field,
  };
}

function leapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number) {
  if (month === 2) return leapYear(year) ? 29 : 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

// Howard Hinnant's civil-date algorithm, evaluated only with exact bigint
// arithmetic. The returned day is relative to 1970-01-01.
function daysFromCivil(year: bigint, month: bigint, day: bigint) {
  const adjustedYear =
    year - (month <= BigInt(2) ? BigInt(1) : BigInt(0));
  const era = adjustedYear / BigInt(400);
  const yearOfEra = adjustedYear - era * BigInt(400);
  const adjustedMonth =
    month + (month > BigInt(2) ? BigInt(-3) : BigInt(9));
  const dayOfYear =
    (BigInt(153) * adjustedMonth + BigInt(2)) / BigInt(5) +
    day -
    BigInt(1);
  const dayOfEra =
    yearOfEra * BigInt(365) +
    yearOfEra / BigInt(4) -
    yearOfEra / BigInt(100) +
    dayOfYear;
  return era * BigInt(146097) + dayOfEra - BigInt(719468);
}

export function parseDatabentoExplicitNanosecondInstantV1(
  value: unknown,
  field: string,
): DatabentoExplicitNanosecondInstantResult {
  try {
    if (typeof value !== "string") {
      return rejected(field, "value_not_string");
    }
    const match = explicitInstantPattern.exec(value);
    if (!match) {
      return rejected(
        field,
        "syntax_not_strict_explicit_instant",
      );
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6]);
    if (
      year <
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_POLICY_V1.minimum_year ||
      year >
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_POLICY_V1.maximum_year
    ) {
      return rejected(field, "year_out_of_policy");
    }
    if (
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > daysInMonth(year, month)
    ) {
      return rejected(field, "calendar_date_invalid");
    }
    if (second === 60) {
      return rejected(field, "leap_second_unsupported");
    }
    if (
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59 ||
      second < 0 ||
      second > 59
    ) {
      return rejected(field, "clock_time_invalid");
    }

    let offsetMinutes = 0;
    if (match[8] !== "Z") {
      const offsetHour = Number(match[10]);
      const offsetMinute = Number(match[11]);
      if (
        offsetMinute > 59 ||
        offsetHour > 14 ||
        (offsetHour === 14 && offsetMinute !== 0)
      ) {
        return rejected(field, "offset_out_of_policy");
      }
      const absoluteOffset = offsetHour * 60 + offsetMinute;
      offsetMinutes =
        match[9] === "+" ? absoluteOffset : -absoluteOffset;
    }

    const days = daysFromCivil(
      BigInt(year),
      BigInt(month),
      BigInt(day),
    );
    const localSeconds =
      days * BigInt(86400) +
      BigInt(hour) * BigInt(3600) +
      BigInt(minute) * BigInt(60) +
      BigInt(second);
    const utcSeconds =
      localSeconds - BigInt(offsetMinutes) * BigInt(60);
    const fraction = BigInt((match[7] ?? "").padEnd(9, "0") || "0");
    return {
      ok: true,
      parser_version:
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      unix_nanoseconds: (
        utcSeconds * BigInt(1_000_000_000) +
        fraction
      ).toString(),
    };
  } catch {
    return rejected(
      field,
      "syntax_not_strict_explicit_instant",
    );
  }
}

export function compareDatabentoExplicitInstantsV1(
  left: unknown,
  right: unknown,
  leftField = "left",
  rightField = "right",
): DatabentoInstantComparisonResult {
  const parsedLeft =
    parseDatabentoExplicitNanosecondInstantV1(left, leftField);
  if (!parsedLeft.ok) {
    return {
      ok: false,
      parser_version:
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      error_code: "databento_instant_comparison_rejected",
      rejected_field: parsedLeft.field,
      reason_code: parsedLeft.reason_code,
    };
  }
  const parsedRight =
    parseDatabentoExplicitNanosecondInstantV1(right, rightField);
  if (!parsedRight.ok) {
    return {
      ok: false,
      parser_version:
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      error_code: "databento_instant_comparison_rejected",
      rejected_field: parsedRight.field,
      reason_code: parsedRight.reason_code,
    };
  }
  const delta =
    BigInt(parsedLeft.unix_nanoseconds) -
    BigInt(parsedRight.unix_nanoseconds);
  return {
    ok: true,
    parser_version:
      DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
    relation:
      delta < BigInt(0) ? -1 : delta > BigInt(0) ? 1 : 0,
    signed_delta_nanoseconds: delta.toString(),
  };
}

function parseMaximumAge(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^(0|[1-9][0-9]*)$/.test(value)
  ) {
    return null;
  }
  return BigInt(value);
}

export function evaluateDatabentoFreshnessV1(input: {
  current_instant: unknown;
  observed_instant: unknown;
  maximum_age_nanoseconds: unknown;
}): DatabentoFreshnessResult {
  const current = parseDatabentoExplicitNanosecondInstantV1(
    input?.current_instant,
    "current_instant",
  );
  if (!current.ok) {
    return {
      ok: false,
      parser_version:
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      error_code: "databento_freshness_evaluation_rejected",
      rejected_field: current.field,
      reason_code: current.reason_code,
    };
  }
  const observed = parseDatabentoExplicitNanosecondInstantV1(
    input?.observed_instant,
    "observed_instant",
  );
  if (!observed.ok) {
    return {
      ok: false,
      parser_version:
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      error_code: "databento_freshness_evaluation_rejected",
      rejected_field: observed.field,
      reason_code: observed.reason_code,
    };
  }
  const maximumAge = parseMaximumAge(
    input?.maximum_age_nanoseconds,
  );
  if (maximumAge === null) {
    return {
      ok: false,
      parser_version:
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      error_code: "databento_freshness_evaluation_rejected",
      rejected_field: "maximum_age_nanoseconds",
      reason_code: "maximum_age_nanoseconds_invalid",
    };
  }
  const age =
    BigInt(current.unix_nanoseconds) -
    BigInt(observed.unix_nanoseconds);
  const future = age < BigInt(0);
  const fresh = !future && age <= maximumAge;
  return {
    ok: true,
    parser_version:
      DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
    freshness_state: future ? "future" : fresh ? "fresh" : "stale",
    age_nanoseconds: age.toString(),
    maximum_age_nanoseconds: maximumAge.toString(),
    within_maximum_age: fresh,
  };
}

export function evaluateDatabentoIntervalMembershipV1(input: {
  value_instant: unknown;
  start_inclusive: unknown;
  end_exclusive: unknown;
}): DatabentoIntervalMembershipResult {
  const fields = [
    ["value_instant", input?.value_instant],
    ["start_inclusive", input?.start_inclusive],
    ["end_exclusive", input?.end_exclusive],
  ] as const;
  const parsed = fields.map(([field, value]) =>
    parseDatabentoExplicitNanosecondInstantV1(value, field),
  );
  const failure = parsed.find((result) => !result.ok);
  if (failure && !failure.ok) {
    return {
      ok: false,
      parser_version:
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      error_code: "databento_interval_membership_rejected",
      rejected_field: failure.field,
      reason_code: failure.reason_code,
    };
  }
  const [value, start, end] = parsed.map((result) =>
    BigInt(
      (result as Extract<
        DatabentoExplicitNanosecondInstantResult,
        { ok: true }
      >).unix_nanoseconds,
    ),
  );
  if (start >= end) {
    return {
      ok: false,
      parser_version:
        DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
      error_code: "databento_interval_membership_rejected",
      rejected_field: "interval",
      reason_code: "interval_not_increasing",
    };
  }
  return {
    ok: true,
    parser_version:
      DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
    interval_semantics: "inclusive_start_exclusive_end",
    is_member: value >= start && value < end,
  };
}
