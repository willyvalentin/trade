export type PartialPositionStatus =
  | "fully_open"
  | "partially_closed"
  | "fully_closed"
  | "invalid";

export type TradeFill = {
  fill_id: string;
  side: "BUY";
  broker: "AVANZA";
  status: "filled" | "partially_filled";
  price: number;
  shares: number;
  filled_at: string;
  reference_note: string | null;
  commission: number | null;
  fx_fee: number | null;
};

export type TradeExitFill = {
  fill_id: string;
  side: "SELL";
  broker: "AVANZA";
  status: "filled" | "partially_filled";
  price: number;
  shares: number;
  filled_at: string;
  reference_note: string | null;
  commission: number | null;
  fx_fee: number | null;
};

export type PartialPositionWarning = {
  warning_id: string;
  message: string;
};

export type PartialPositionBlocker = {
  blocker_id: string;
  message: string;
};

export type PartialPositionState = {
  status: PartialPositionStatus;
  average_entry_price: number | null;
  entry_shares: number | null;
  exited_shares: number;
  remaining_shares: number | null;
  average_exit_price: number | null;
  realized_pnl_from_exits: number | null;
  entry_fills: TradeFill[];
  exit_fills: TradeExitFill[];
};

export type PartialPositionAccountingResult = {
  state: PartialPositionState;
  warnings: PartialPositionWarning[];
  blockers: PartialPositionBlocker[];
};

type NormalizeEntryFillInput = {
  fillId?: string | null;
  status?: string | null;
  price?: number | null;
  shares?: number | null;
  filledAt?: string | null;
  referenceNote?: string | null;
  commission?: number | null;
  fxFee?: number | null;
};

type NormalizeExitFillInput = {
  fillId?: string | null;
  status?: string | null;
  price?: number | null;
  shares?: number | null;
  filledAt?: string | null;
  referenceNote?: string | null;
  commission?: number | null;
  fxFee?: number | null;
};

type BuildPartialPositionStateInput = {
  entryFills?: TradeFill[] | null;
  exitFills?: TradeExitFill[] | null;
  fallbackEntryPrice?: number | null;
  fallbackEntryShares?: number | null;
  plannedShares?: number | null;
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function positiveNumber(value: unknown) {
  const parsed = finiteNumber(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function normalizeFillStatus(
  value: string | null | undefined,
): "filled" | "partially_filled" {
  return value === "partially_filled" ? "partially_filled" : "filled";
}

export function normalizeEntryFill(
  input: NormalizeEntryFillInput,
): TradeFill | null {
  const price = positiveNumber(input.price);
  const shares = positiveNumber(input.shares);

  if (price === null || shares === null) {
    return null;
  }

  const filledAt = input.filledAt ?? new Date().toISOString();

  return {
    fill_id:
      nullableString(input.fillId) ??
      `entry_fill_${safeIdPart(filledAt)}_${safeIdPart(String(shares))}`,
    side: "BUY",
    broker: "AVANZA",
    status: normalizeFillStatus(input.status),
    price,
    shares,
    filled_at: filledAt,
    reference_note: nullableString(input.referenceNote),
    commission: finiteNumber(input.commission),
    fx_fee: finiteNumber(input.fxFee),
  };
}

export function normalizeExitFill(
  input: NormalizeExitFillInput,
): TradeExitFill | null {
  const price = positiveNumber(input.price);
  const shares = positiveNumber(input.shares);

  if (price === null || shares === null) {
    return null;
  }

  const filledAt = input.filledAt ?? new Date().toISOString();

  return {
    fill_id:
      nullableString(input.fillId) ??
      `exit_fill_${safeIdPart(filledAt)}_${safeIdPart(String(shares))}`,
    side: "SELL",
    broker: "AVANZA",
    status: normalizeFillStatus(input.status),
    price,
    shares,
    filled_at: filledAt,
    reference_note: nullableString(input.referenceNote),
    commission: finiteNumber(input.commission),
    fx_fee: finiteNumber(input.fxFee),
  };
}

export function calculateRemainingShares({
  entryShares,
  exitFills,
}: {
  entryShares: number | null;
  exitFills: TradeExitFill[];
}) {
  if (entryShares === null || !Number.isFinite(entryShares)) {
    return null;
  }

  const exitedShares = exitFills.reduce((sum, fill) => sum + fill.shares, 0);
  return entryShares - exitedShares;
}

export function calculateRealizedPnlForExit({
  averageEntryPrice,
  exitFill,
  direction = "Long",
}: {
  averageEntryPrice: number | null;
  exitFill: TradeExitFill;
  direction?: "Long" | "Short";
}) {
  if (averageEntryPrice === null || !Number.isFinite(averageEntryPrice)) {
    return null;
  }

  // Accounting v1 assumes long positions. Short support is defensive only.
  const gross =
    direction === "Short"
      ? (averageEntryPrice - exitFill.price) * exitFill.shares
      : (exitFill.price - averageEntryPrice) * exitFill.shares;
  return gross - (exitFill.commission ?? 0) - (exitFill.fx_fee ?? 0);
}

export function calculateTotalRealizedPnl({
  averageEntryPrice,
  exitFills,
  direction = "Long",
}: {
  averageEntryPrice: number | null;
  exitFills: TradeExitFill[];
  direction?: "Long" | "Short";
}) {
  if (exitFills.length === 0) {
    return null;
  }

  let total = 0;

  for (const fill of exitFills) {
    const pnl = calculateRealizedPnlForExit({
      averageEntryPrice,
      exitFill: fill,
      direction,
    });

    if (pnl === null) {
      return null;
    }

    total += pnl;
  }

  return total;
}

export function calculateAverageExitPrice(exitFills: TradeExitFill[]) {
  const totalShares = exitFills.reduce((sum, fill) => sum + fill.shares, 0);

  if (totalShares <= 0) {
    return null;
  }

  const totalValue = exitFills.reduce(
    (sum, fill) => sum + fill.price * fill.shares,
    0,
  );
  return totalValue / totalShares;
}

export function getPartialPositionStatus({
  entryShares,
  remainingShares,
  blockers,
}: {
  entryShares: number | null;
  remainingShares: number | null;
  blockers?: PartialPositionBlocker[];
}): PartialPositionStatus {
  if ((blockers ?? []).length > 0) {
    return "invalid";
  }

  if (entryShares === null || remainingShares === null) {
    return "invalid";
  }

  if (remainingShares < 0) {
    return "invalid";
  }

  if (remainingShares === 0) {
    return "fully_closed";
  }

  if (remainingShares < entryShares) {
    return "partially_closed";
  }

  return "fully_open";
}

export function buildPartialPositionState({
  entryFills,
  exitFills,
  fallbackEntryPrice,
  fallbackEntryShares,
  plannedShares,
}: BuildPartialPositionStateInput): PartialPositionAccountingResult {
  const warnings: PartialPositionWarning[] = [];
  const blockers: PartialPositionBlocker[] = [];
  const normalizedEntryFills = (entryFills ?? []).filter(Boolean);
  const normalizedExitFills = (exitFills ?? []).filter(Boolean);
  const fallbackEntryFill = normalizeEntryFill({
    status: "filled",
    price: fallbackEntryPrice,
    shares: fallbackEntryShares,
    filledAt: "fallback_entry",
    referenceNote: "Fallback entry from current position.",
  });
  const effectiveEntryFills =
    normalizedEntryFills.length > 0
      ? normalizedEntryFills
      : fallbackEntryFill
        ? [fallbackEntryFill]
        : [];
  const entryShares =
    effectiveEntryFills.length > 0
      ? effectiveEntryFills.reduce((sum, fill) => sum + fill.shares, 0)
      : null;
  const entryValue =
    effectiveEntryFills.length > 0
      ? effectiveEntryFills.reduce((sum, fill) => sum + fill.price * fill.shares, 0)
      : null;
  const averageEntryPrice =
    entryShares !== null && entryShares > 0 && entryValue !== null
      ? entryValue / entryShares
      : null;
  const exitedShares = normalizedExitFills.reduce(
    (sum, fill) => sum + fill.shares,
    0,
  );
  const remainingShares = calculateRemainingShares({
    entryShares,
    exitFills: normalizedExitFills,
  });

  if (entryShares === null) {
    blockers.push({
      blocker_id: "missing_entry_shares",
      message: "Entry shares are required for partial position accounting.",
    });
  }

  if (remainingShares !== null && remainingShares < 0) {
    blockers.push({
      blocker_id: "exit_shares_exceed_entry_shares",
      message: "Exit shares exceed filled entry shares.",
    });
  }

  if (
    plannedShares !== null &&
    plannedShares !== undefined &&
    Number.isFinite(plannedShares) &&
    entryShares !== null &&
    entryShares < plannedShares
  ) {
    warnings.push({
      warning_id: "partial_entry_fill",
      message:
        "Actual entry shares are lower than planned quantity. Ture tracks the filled shares only.",
    });
  }

  if (
    remainingShares !== null &&
    entryShares !== null &&
    remainingShares > 0 &&
    remainingShares < entryShares
  ) {
    warnings.push({
      warning_id: "position_partially_closed",
      message:
        "Position has one or more exit fills and still has remaining shares open.",
    });
  }

  const status = getPartialPositionStatus({
    entryShares,
    remainingShares,
    blockers,
  });

  return {
    state: {
      status,
      average_entry_price: averageEntryPrice,
      entry_shares: entryShares,
      exited_shares: exitedShares,
      remaining_shares: remainingShares,
      average_exit_price: calculateAverageExitPrice(normalizedExitFills),
      realized_pnl_from_exits: calculateTotalRealizedPnl({
        averageEntryPrice,
        exitFills: normalizedExitFills,
      }),
      entry_fills: effectiveEntryFills,
      exit_fills: normalizedExitFills,
    },
    warnings,
    blockers,
  };
}
