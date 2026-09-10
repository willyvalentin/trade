export type AggregateRealizedPnlBasis =
  | "gross_price_difference_before_fees"
  | "fee_basis_needs_review"
  | "not_available";

export type AggregateRealizedPnlBasisInput = {
  pnl: number | null | undefined;
  realizedPnlBasis?: string | null;
};

function isFinitePnl(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * A result is only labelled gross when every included PnL amount has the
 * explicit price-only basis recorded by the execution metadata. Historic or
 * mixed entries stay reviewable instead of being silently presented as net.
 */
export function determineAggregateRealizedPnlBasis(
  entries: AggregateRealizedPnlBasisInput[],
): AggregateRealizedPnlBasis {
  const entriesWithPnl = entries.filter((entry) => isFinitePnl(entry.pnl));

  if (entriesWithPnl.length === 0) {
    return "not_available";
  }

  return entriesWithPnl.every(
    (entry) => entry.realizedPnlBasis === "gross_price_difference_before_fees",
  )
    ? "gross_price_difference_before_fees"
    : "fee_basis_needs_review";
}

export function aggregateRealizedPnlLabel(
  basis: AggregateRealizedPnlBasis,
): string {
  if (basis === "gross_price_difference_before_fees") {
    return "Gross Price PnL";
  }

  if (basis === "fee_basis_needs_review") {
    return "Recorded PnL";
  }

  return "Realized PnL";
}

export function aggregateRealizedPnlExplanation(
  basis: AggregateRealizedPnlBasis,
): string {
  if (basis === "gross_price_difference_before_fees") {
    return "Displayed PnL is the gross price result before broker fees; review the SEK settlement before treating it as net performance.";
  }

  if (basis === "fee_basis_needs_review") {
    return "Displayed PnL has a mixed or undocumented fee basis; review the broker settlements before treating it as net performance or a final loss result.";
  }

  return "No realized PnL with a documented fee basis is available in this view yet.";
}
