export type OwnedPositionCloseValues = Readonly<{
  exit_price: number;
  closed_at: string;
  pnl: number | null;
  pnl_percent: number | null;
  r_multiple: number | null;
  exit_notes: string | null;
  execution_metadata?: Record<string, unknown>;
}>;

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

type ClosedPositionRecord = Readonly<{
  exit_price: unknown;
  closed_at: unknown;
  pnl: unknown;
  pnl_percent: unknown;
  r_multiple: unknown;
  exit_notes: unknown;
  execution_metadata: unknown;
}>;

type OpenLongPositionRecord = Readonly<{
  entry_price: unknown;
  position_size: unknown;
  current_stop: unknown;
  execution_metadata: unknown;
}>;

export type OwnedLongPositionCloseMetrics = Readonly<{
  pnl: number;
  pnl_percent: number;
  r_multiple: number;
}>;

function finiteNumberOrNull(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function positiveDatabaseNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value !== "string" || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function plainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function jsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return true;
  }
  if (Array.isArray(value)) return value.every(jsonValue);
  return plainRecord(value) && Object.values(value).every(jsonValue);
}

function canonicalJson(value: JsonValue): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (plainRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key] as JsonValue)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sameTimestamp(left: unknown, right: string) {
  return (
    typeof left === "string" &&
    Number.isFinite(Date.parse(left)) &&
    Date.parse(left) === Date.parse(right)
  );
}

export function parseOwnedPositionCloseValues(
  values: Record<string, unknown>,
): OwnedPositionCloseValues | null {
  if (
    typeof values.exit_price !== "number" ||
    !Number.isFinite(values.exit_price) ||
    values.exit_price <= 0 ||
    typeof values.closed_at !== "string" ||
    values.closed_at.length === 0 ||
    values.closed_at.length > 80 ||
    !Number.isFinite(Date.parse(values.closed_at)) ||
    !finiteNumberOrNull(values.pnl) ||
    !finiteNumberOrNull(values.pnl_percent) ||
    !finiteNumberOrNull(values.r_multiple) ||
    (values.exit_notes !== null &&
      (typeof values.exit_notes !== "string" || values.exit_notes.length > 4_000))
  ) {
    return null;
  }

  if (
    values.execution_metadata !== undefined &&
    (!plainRecord(values.execution_metadata) || !jsonValue(values.execution_metadata))
  ) {
    return null;
  }

  return {
    exit_price: values.exit_price,
    closed_at: values.closed_at,
    pnl: values.pnl,
    pnl_percent: values.pnl_percent,
    r_multiple: values.r_multiple,
    exit_notes: values.exit_notes,
    ...(values.execution_metadata === undefined
      ? {}
      : { execution_metadata: values.execution_metadata }),
  };
}

/**
 * Validates the client-visible gross result of a fully open long position
 * against the immutable pricing fields already stored for the owner. A prior
 * partial exit is deliberately outside this small calculation: its aggregate
 * must retain its existing exit-fill accounting instead of being overwritten
 * with a one-fill formula.
 */
export function calculateOwnedLongPositionCloseMetrics(
  position: OpenLongPositionRecord,
  exitPrice: unknown,
): OwnedLongPositionCloseMetrics | null {
  const entryPrice = positiveDatabaseNumber(position.entry_price);
  const positionSize = positiveDatabaseNumber(position.position_size);
  const currentStop = positiveDatabaseNumber(position.current_stop);
  const actualExitPrice = positiveDatabaseNumber(exitPrice);

  if (
    entryPrice === null ||
    positionSize === null ||
    currentStop === null ||
    actualExitPrice === null ||
    currentStop >= entryPrice ||
    (plainRecord(position.execution_metadata) &&
      Array.isArray(position.execution_metadata.exit_fills) &&
      position.execution_metadata.exit_fills.length > 0)
  ) {
    return null;
  }

  const pnl = (actualExitPrice - entryPrice) * positionSize;
  const pnlPercent = (pnl / (entryPrice * positionSize)) * 100;
  const rMultiple = pnl / ((entryPrice - currentStop) * positionSize);

  return Number.isFinite(pnl) &&
    Number.isFinite(pnlPercent) &&
    Number.isFinite(rMultiple)
    ? { pnl, pnl_percent: pnlPercent, r_multiple: rMultiple }
    : null;
}

export function ownedLongPositionCloseMetricsMatch(
  values: OwnedPositionCloseValues,
  metrics: OwnedLongPositionCloseMetrics,
) {
  return (
    values.pnl === metrics.pnl &&
    values.pnl_percent === metrics.pnl_percent &&
    values.r_multiple === metrics.r_multiple
  );
}

export function ownedPositionCloseValuesMatch(
  stored: ClosedPositionRecord,
  expected: OwnedPositionCloseValues,
) {
  if (
    stored.exit_price !== expected.exit_price ||
    !sameTimestamp(stored.closed_at, expected.closed_at) ||
    stored.pnl !== expected.pnl ||
    stored.pnl_percent !== expected.pnl_percent ||
    stored.r_multiple !== expected.r_multiple ||
    stored.exit_notes !== expected.exit_notes
  ) {
    return false;
  }

  if (expected.execution_metadata === undefined) return true;
  if (!jsonValue(stored.execution_metadata) || !jsonValue(expected.execution_metadata)) {
    return false;
  }

  return (
    canonicalJson(stored.execution_metadata) ===
    canonicalJson(expected.execution_metadata)
  );
}
