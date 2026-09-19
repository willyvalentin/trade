export type BasicFreeDiscoveryReceiptCurrentness = {
  state:
    | "unavailable"
    | "current_trading_day"
    | "historical_reference"
    | "undated_reference";
  receipt_trading_date: string | null;
};

type BasicFreeDiscoveryReceiptCurrentnessInput = {
  receiptAvailable: boolean;
  receiptTradingDate: string | null;
  currentTradingDate: string | null;
};

function isCalendarDate(value: string | null) {
  if (value === null || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

/**
 * A durable catalog receipt is reference evidence, never a live candidate.
 * Still, its date must be explicit: a receipt from another NY trading day (or
 * one without an attributable date) cannot be rendered as current-day market
 * information.
 */
export function basicFreeDiscoveryReceiptCurrentness(
  input: BasicFreeDiscoveryReceiptCurrentnessInput,
): BasicFreeDiscoveryReceiptCurrentness {
  if (!input.receiptAvailable) {
    return { state: "unavailable", receipt_trading_date: null };
  }

  if (
    !isCalendarDate(input.receiptTradingDate) ||
    !isCalendarDate(input.currentTradingDate)
  ) {
    return {
      state: "undated_reference",
      receipt_trading_date: isCalendarDate(input.receiptTradingDate)
        ? input.receiptTradingDate
        : null,
    };
  }

  return {
    state:
      input.receiptTradingDate === input.currentTradingDate
        ? "current_trading_day"
        : "historical_reference",
    receipt_trading_date: input.receiptTradingDate,
  };
}
