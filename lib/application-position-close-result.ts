export type ApplicationPositionCloseResult = {
  disposition: "closed" | "reused";
};

function nonEmptyText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

/**
 * A close retry is successful only when the server has verified that it matches
 * the existing owner-bound close. Preserve that result at the client boundary
 * so an acknowledged retry is not presented as a second close.
 */
export function parseApplicationPositionCloseResult(
  value: unknown,
): ApplicationPositionCloseResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const disposition = candidate.disposition;
  return candidate.ok === true && (disposition === "closed" || disposition === "reused")
    ? { disposition }
    : null;
}

export function applicationPositionCloseResultMessage(
  result: ApplicationPositionCloseResult,
  ticker: string,
  warning: string | null,
) {
  const instrument = nonEmptyText(ticker) ?? "This position";

  if (result.disposition === "reused") {
    return `${instrument} was already closed. The existing exit was kept; no duplicate close was recorded.`;
  }

  return warning
    ? `${instrument} closed from broker exit fill. ${warning}`
    : `${instrument} closed from broker exit fill.`;
}
