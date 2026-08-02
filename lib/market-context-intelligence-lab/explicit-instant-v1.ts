export const MARKET_CONTEXT_EXPLICIT_INSTANT_PARSER_VERSION =
  "market_context_explicit_instant_parser_v1" as const;

const explicitInstantPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/;

export type ExplicitInstantResult =
  | {
      ok: true;
      canonical_timestamp: string;
      epoch_milliseconds: number;
    }
  | {
      ok: false;
      error_code: "market_context_invalid_explicit_instant";
      field: string;
    };

function validCalendarComponents(match: RegExpMatchArray) {
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const millisecond = Number((match[7] ?? "").padEnd(3, "0"));
  const calendar = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, millisecond),
  );

  return (
    calendar.getUTCFullYear() === year &&
    calendar.getUTCMonth() === month - 1 &&
    calendar.getUTCDate() === day &&
    calendar.getUTCHours() === hour &&
    calendar.getUTCMinutes() === minute &&
    calendar.getUTCSeconds() === second &&
    calendar.getUTCMilliseconds() === millisecond
  );
}

function validOffset(match: RegExpMatchArray) {
  if (match[8] === "Z") return true;
  const offsetHour = Number(match[10]);
  const offsetMinute = Number(match[11]);
  return (
    offsetHour <= 14 &&
    offsetMinute <= 59 &&
    (offsetHour < 14 || offsetMinute === 0)
  );
}

export function parseMarketContextExplicitInstant(
  value: unknown,
  field: string,
): ExplicitInstantResult {
  if (typeof value !== "string") {
    return {
      ok: false,
      error_code: "market_context_invalid_explicit_instant",
      field,
    };
  }

  const match = value.match(explicitInstantPattern);
  if (!match || !validCalendarComponents(match) || !validOffset(match)) {
    return {
      ok: false,
      error_code: "market_context_invalid_explicit_instant",
      field,
    };
  }

  const epochMilliseconds = Date.parse(value);
  if (!Number.isFinite(epochMilliseconds)) {
    return {
      ok: false,
      error_code: "market_context_invalid_explicit_instant",
      field,
    };
  }

  return {
    ok: true,
    canonical_timestamp: new Date(epochMilliseconds).toISOString(),
    epoch_milliseconds: epochMilliseconds,
  };
}

export function requireMarketContextExplicitInstant(
  value: unknown,
  field: string,
) {
  const result = parseMarketContextExplicitInstant(value, field);
  if (!result.ok) {
    throw new Error(`${result.error_code}:${result.field}`);
  }
  return result;
}
