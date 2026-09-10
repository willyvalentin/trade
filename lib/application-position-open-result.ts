export type ApplicationPositionOpenResult = {
  position_id: string;
  disposition: "created" | "reused";
  snapshot_link_count: number;
};

function nonEmptyText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

/**
 * The server-owned transaction is the authority for whether a manual-position
 * retry created a row or safely reused the original. Keep that distinction
 * intact at the client boundary instead of treating every successful response
 * as a fresh position.
 */
export function parseApplicationPositionOpenResult(
  value: unknown,
): ApplicationPositionOpenResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const positionId = nonEmptyText(candidate.position_id);
  const disposition = candidate.disposition;
  const snapshotLinkCount = candidate.snapshot_link_count;

  if (
    !positionId ||
    (disposition !== "created" && disposition !== "reused") ||
    typeof snapshotLinkCount !== "number" ||
    !Number.isInteger(snapshotLinkCount) ||
    snapshotLinkCount < 0
  ) {
    return null;
  }

  return {
    position_id: positionId,
    disposition,
    snapshot_link_count: snapshotLinkCount,
  };
}

export function applicationPositionOpenResultMessage(
  result: ApplicationPositionOpenResult,
  ticker: string,
) {
  const instrument = nonEmptyText(ticker) ?? "This position";

  return result.disposition === "reused"
    ? `${instrument} was already recorded. The existing Live Day Trade was kept; no duplicate position was created.`
    : `${instrument} Live Day Trade recorded.`;
}
