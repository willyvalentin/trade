import { MARKET_CONTEXT_LAB_THRESHOLDS } from "./contract-v1";

export const MARKET_CONTEXT_THRESHOLD_VERSION_V2 =
  "market_context_intelligence_thresholds_2026_07_26_v2" as const;

export const MARKET_CONTEXT_LAB_THRESHOLDS_V2 =
  MARKET_CONTEXT_LAB_THRESHOLDS;

export type MarketContextThresholdStatus = "active" | "reserved_inactive";

export type MarketContextThresholdDefinitionV2 = {
  threshold_id: string;
  value: number;
  status: MarketContextThresholdStatus;
  classification_effect: boolean;
  decision: string;
};

const reservedInactiveThresholds = new Set([
  "freshness_minutes.intraday",
  "freshness_minutes.sector_short",
]);

function numericThresholdEntries(
  value: unknown,
  path: string[] = [],
): Array<{ threshold_id: string; value: number }> {
  if (typeof value === "number") {
    return [{ threshold_id: path.join("."), value }];
  }
  if (typeof value !== "object" || value === null) return [];

  return Object.entries(value).flatMap(([key, child]) =>
    numericThresholdEntries(child, [...path, key]),
  );
}

export const MARKET_CONTEXT_THRESHOLD_REGISTRY_V2 =
  numericThresholdEntries(MARKET_CONTEXT_LAB_THRESHOLDS_V2)
    .map((threshold): MarketContextThresholdDefinitionV2 => {
      const reserved = reservedInactiveThresholds.has(
        threshold.threshold_id,
      );
      return {
        ...threshold,
        status: reserved ? "reserved_inactive" : "active",
        classification_effect: !reserved,
        decision: reserved
          ? "retained_for_versioned_schema_continuity_not_evaluated_by_v2"
          : "active_v2_classification_or_quality_boundary",
      };
    })
    .sort((first, second) =>
      first.threshold_id.localeCompare(second.threshold_id),
    );
