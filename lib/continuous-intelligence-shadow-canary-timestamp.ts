const canonicalTimestampPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}:\d{2})$/;

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * PostgreSQL may return zero-padded microseconds. Non-zero sub-millisecond
 * precision fails closed rather than silently changing the bound instant.
 */
export function normalizeContinuousIntelligenceShadowCanaryTimestamp(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 20 || value.length > 40) return null;
  const match = canonicalTimestampPattern.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fractionText = "", zone] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (
    month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month) ||
    hour > 23 || minute > 59 || second > 59
  ) return null;

  if (fractionText.length > 3 && /[1-9]/.test(fractionText.slice(3))) return null;
  const milliseconds = Number(fractionText.padEnd(3, "0").slice(0, 3));
  const offsetSign = zone === "Z" || zone.startsWith("+") ? 1 : -1;
  const offsetHours = zone === "Z" ? 0 : Number(zone.slice(1, 3));
  const offsetMinutes = zone === "Z" ? 0 : Number(zone.slice(4, 6));
  if (offsetHours > 23 || offsetMinutes > 59) return null;

  const local = new Date(0);
  local.setUTCFullYear(year, month - 1, day);
  local.setUTCHours(hour, minute, second, milliseconds);
  const instant = local.getTime() - offsetSign * (offsetHours * 60 + offsetMinutes) * 60_000;
  if (!Number.isFinite(instant)) return null;
  const canonical = new Date(instant).toISOString();
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(canonical) ? canonical : null;
}

export function areContinuousIntelligenceShadowCanaryTimestampsEqual(
  left: unknown,
  right: unknown,
) {
  const normalizedLeft = normalizeContinuousIntelligenceShadowCanaryTimestamp(left);
  const normalizedRight = normalizeContinuousIntelligenceShadowCanaryTimestamp(right);
  return normalizedLeft !== null && normalizedLeft === normalizedRight;
}
