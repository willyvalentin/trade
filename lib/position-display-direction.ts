export type PositionDirection = "Long" | "Short";
export type PositionDisplayDirection = PositionDirection | "Unknown";

export function normalizePositionDirection(
  value: string | null | undefined,
): PositionDirection | null {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "long") return "Long";
  if (normalized === "short") return "Short";

  return null;
}

export function isKnownPositionDirection(
  value: PositionDisplayDirection,
): value is PositionDirection {
  return value === "Long" || value === "Short";
}

export function resolvePositionDisplayDirection({
  positionDirection,
  recommendationDirection,
}: {
  positionDirection?: string | null;
  recommendationDirection?: string | null;
}): PositionDisplayDirection {
  return (
    normalizePositionDirection(positionDirection) ??
    normalizePositionDirection(recommendationDirection) ??
    "Unknown"
  );
}
