type RecordValue = Record<string, unknown>;

function plainRecord(value: unknown): value is RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function positiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function timestamp(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value));
}

function completedStatus(
  value: unknown,
): value is "filled" | "partially_filled" {
  return value === "filled" || value === "partially_filled";
}

function matchingFill({
  fills,
  side,
  status,
  price,
  shares,
}: {
  fills: unknown;
  side: "BUY" | "SELL";
  status: "filled" | "partially_filled";
  price: number;
  shares: number;
}) {
  return (
    Array.isArray(fills) &&
    fills.some(
      (fill) =>
        plainRecord(fill) &&
        fill.side === side &&
        fill.broker === "AVANZA" &&
        fill.status === status &&
        fill.price === price &&
        fill.shares === shares &&
        timestamp(fill.filled_at),
    )
  );
}

/**
 * Checks the raw client payload rather than a normalised representation. The
 * normalisers deliberately supply safe display defaults, which would make a
 * missing manual confirmation indistinguishable from a confirmed one here.
 * This is an attestation boundary, not broker-side execution verification.
 */
export function hasManualBrokerEntryEvidence({
  recommendationId,
  entryPrice,
  positionSize,
  executionMetadata,
}: {
  recommendationId: string;
  entryPrice: number;
  positionSize: number;
  executionMetadata: unknown;
}) {
  if (!plainRecord(executionMetadata)) return false;

  return (
    executionMetadata.schema_version === "1.0" &&
    executionMetadata.broker_hint === "AVANZA" &&
    completedStatus(executionMetadata.broker_order_status) &&
    executionMetadata.created_from === "add_trade_modal" &&
    executionMetadata.manual_confirmation_required === true &&
    executionMetadata.broker_execution_mode === "manual_final_confirmation" &&
    executionMetadata.recommendation_id === recommendationId &&
    executionMetadata.actual_fill_price === entryPrice &&
    executionMetadata.actual_shares === positionSize &&
    positiveNumber(executionMetadata.actual_fill_price) &&
    positiveNumber(executionMetadata.actual_shares) &&
    timestamp(executionMetadata.broker_confirmed_at) &&
    matchingFill({
      fills: executionMetadata.entry_fills,
      side: "BUY",
      status: executionMetadata.broker_order_status,
      price: entryPrice,
      shares: positionSize,
    })
  );
}

export function hasManualBrokerExitEvidence({
  exitPrice,
  expectedSoldShares,
  executionMetadata,
}: {
  exitPrice?: number;
  expectedSoldShares?: number;
  executionMetadata: unknown;
}) {
  if (!plainRecord(executionMetadata)) return false;
  const confirmation = executionMetadata.broker_exit_confirmation;
  if (!plainRecord(confirmation)) return false;

  const soldShares = confirmation.actual_sold_shares;
  if (
    confirmation.broker !== "AVANZA" ||
    !completedStatus(confirmation.exit_status) ||
    !positiveNumber(confirmation.actual_exit_price) ||
    !positiveNumber(soldShares) ||
    confirmation.user_manually_confirmed_sell !== true ||
    confirmation.broker_order_matches_trade_plan !== true ||
    !timestamp(confirmation.broker_confirmed_at)
  ) {
    return false;
  }

  if (exitPrice !== undefined && confirmation.actual_exit_price !== exitPrice) {
    return false;
  }

  if (expectedSoldShares !== undefined && soldShares !== expectedSoldShares) {
    return false;
  }

  return matchingFill({
    fills: executionMetadata.exit_fills,
    side: "SELL",
    status: confirmation.exit_status,
    price: confirmation.actual_exit_price,
    shares: soldShares,
  });
}
