export type OwnedPositionOpenValues = {
  recommendation_id: string;
  ticker: string;
  company_name: string;
  entry_price: number;
  position_size: number;
  current_stop: number;
  target_1: number;
  target_2: number;
  execution_metadata?: Record<string, unknown>;
};

const recommendationIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const positiveDecimalPattern = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

function parsePositiveDecimal(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!positiveDecimalPattern.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseOwnedPositionOpenValues(
  value: unknown,
): OwnedPositionOpenValues | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const input = value as Record<string, unknown>;
  const entryPrice = parsePositiveDecimal(input.entry_price);
  const positionSize = parsePositiveDecimal(input.position_size);
  const currentStop = parsePositiveDecimal(input.current_stop);
  const target1 = parsePositiveDecimal(input.target_1);
  const target2 = parsePositiveDecimal(input.target_2);
  const executionMetadata = input.execution_metadata;

  if (
    typeof input.recommendation_id !== "string" ||
    !recommendationIdPattern.test(input.recommendation_id) ||
    typeof input.ticker !== "string" ||
    !/^[A-Z.]{1,16}$/.test(input.ticker) ||
    typeof input.company_name !== "string" ||
    input.company_name.length > 240 ||
    entryPrice === null ||
    positionSize === null ||
    currentStop === null ||
    target1 === null ||
    target2 === null ||
    (executionMetadata !== undefined &&
      (typeof executionMetadata !== "object" ||
        executionMetadata === null ||
        Array.isArray(executionMetadata)))
  ) {
    return null;
  }

  return {
    recommendation_id: input.recommendation_id,
    ticker: input.ticker,
    company_name: input.company_name,
    entry_price: entryPrice,
    position_size: positionSize,
    current_stop: currentStop,
    target_1: target1,
    target_2: target2,
    ...(executionMetadata === undefined
      ? {}
      : { execution_metadata: executionMetadata as Record<string, unknown> }),
  };
}
