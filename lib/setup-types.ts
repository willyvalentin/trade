import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import type { IntradayIndicators } from "@/lib/intraday-indicators";

export type SetupType =
  | "VWAP_RECLAIM"
  | "VWAP_HOLD_CONTINUATION"
  | "BREAKOUT_CONTINUATION"
  | "PULLBACK_CONTINUATION"
  | "OPENING_RANGE_BREAKOUT"
  | "HIGH_OF_DAY_BREAKOUT"
  | "REVERSAL_FROM_SUPPORT"
  | "FAILED_BREAKDOWN_RECLAIM"
  | "UNKNOWN";

export const SETUP_TYPE_OPTIONS: {
  value: SetupType;
  label: string;
  description: string;
}[] = [
  {
    value: "VWAP_RECLAIM",
    label: "VWAP Reclaim",
    description:
      "Price reclaimed VWAP after trading below it, with momentum/volume confirmation.",
  },
  {
    value: "VWAP_HOLD_CONTINUATION",
    label: "VWAP Hold Continuation",
    description:
      "Price is holding above VWAP and continuing with controlled momentum.",
  },
  {
    value: "BREAKOUT_CONTINUATION",
    label: "Breakout Continuation",
    description:
      "Price is breaking above a recent range/high with volume or momentum confirmation.",
  },
  {
    value: "PULLBACK_CONTINUATION",
    label: "Pullback Continuation",
    description:
      "Price pulled back without invalidating trend and is attempting continuation.",
  },
  {
    value: "OPENING_RANGE_BREAKOUT",
    label: "Opening Range Breakout",
    description:
      "Price is breaking the opening range during the early session.",
  },
  {
    value: "HIGH_OF_DAY_BREAKOUT",
    label: "High of Day Breakout",
    description: "Price is pushing through or reclaiming the current day high.",
  },
  {
    value: "REVERSAL_FROM_SUPPORT",
    label: "Reversal From Support",
    description:
      "Price is reversing from a support area after selling pressure fades.",
  },
  {
    value: "FAILED_BREAKDOWN_RECLAIM",
    label: "Failed Breakdown Reclaim",
    description:
      "Price broke down, failed to follow through, and reclaimed the breakdown area.",
  },
  {
    value: "UNKNOWN",
    label: "Unknown Setup",
    description: "Setup type could not be classified defensively.",
  },
];

export const SETUP_TYPES = SETUP_TYPE_OPTIONS.map((option) => option.value);

const setupTypeMetadata = new Map(
  SETUP_TYPE_OPTIONS.map((option) => [option.value, option]),
);

export type SetupTypeClassificationInput = {
  scanWindow?: IntradayScanWindow | string | null;
  intradayIndicators?: Partial<IntradayIndicators> | null;
  latestPrice?: number | null;
  recentHigh?: number | null;
  recentLow?: number | null;
  recentRangePosition?: number | null;
  distanceTo20dHigh?: number | null;
  volumeRatio?: number | null;
  recentVolumeRatio?: number | null;
  momentumDirection?: IntradayIndicators["momentumDirection"] | string | null;
  reasonText?: string | string[] | null;
};

export function normalizeSetupType(value: unknown): SetupType {
  if (typeof value !== "string") {
    return "UNKNOWN";
  }

  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");

  return SETUP_TYPES.includes(normalized as SetupType)
    ? (normalized as SetupType)
    : "UNKNOWN";
}

export function getSetupTypeLabel(setupType: unknown) {
  return setupTypeMetadata.get(normalizeSetupType(setupType))?.label ?? "Unknown Setup";
}

export function getSetupTypeDescription(setupType: unknown) {
  return (
    setupTypeMetadata.get(normalizeSetupType(setupType))?.description ??
    "Setup type could not be classified defensively."
  );
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function classifySetupTypeFromSignals(
  input: SetupTypeClassificationInput,
): SetupType {
  const indicators = input.intradayIndicators ?? null;
  const latestPrice =
    numberOrNull(input.latestPrice) ?? numberOrNull(indicators?.latestPrice);
  const recentHigh =
    numberOrNull(input.recentHigh) ?? numberOrNull(indicators?.recentHigh);
  const recentLow =
    numberOrNull(input.recentLow) ?? numberOrNull(indicators?.recentLow);
  const volumeRatio = Math.max(
    numberOrNull(input.volumeRatio) ?? 0,
    numberOrNull(input.recentVolumeRatio) ?? 0,
  );
  const momentumDirection =
    input.momentumDirection ?? indicators?.momentumDirection ?? "unknown";
  const isAboveVwap =
    typeof indicators?.isAboveVwap === "boolean" ? indicators.isAboveVwap : null;
  const priceVsVwapPercent = numberOrNull(indicators?.priceVsVwapPercent);
  const text = [
    ...(Array.isArray(input.reasonText) ? input.reasonText : [input.reasonText]),
  ]
    .filter((item): item is string => typeof item === "string")
    .join(" ")
    .toLowerCase();
  const hasExpandingVolume =
    volumeRatio >= 1.1 || indicators?.volumeTrend === "expanding";
  const hasUpMomentum = momentumDirection === "up";

  if (input.scanWindow === "opening" && /opening range|orb\b|open range/.test(text)) {
    return "OPENING_RANGE_BREAKOUT";
  }

  if (/failed breakdown|breakdown reclaim|reclaim.*breakdown/.test(text)) {
    return "FAILED_BREAKDOWN_RECLAIM";
  }

  if (/support|demand zone|reversal|bounce/.test(text)) {
    return "REVERSAL_FROM_SUPPORT";
  }

  if (/pullback|retest|flag|dip/.test(text) && momentumDirection !== "down") {
    return "PULLBACK_CONTINUATION";
  }

  if (
    isAboveVwap === true &&
    priceVsVwapPercent !== null &&
    priceVsVwapPercent >= 0 &&
    priceVsVwapPercent <= 0.6 &&
    hasUpMomentum
  ) {
    return "VWAP_RECLAIM";
  }

  if (isAboveVwap === true && (hasUpMomentum || momentumDirection === "flat")) {
    return "VWAP_HOLD_CONTINUATION";
  }

  if (
    latestPrice !== null &&
    recentHigh !== null &&
    recentHigh > 0 &&
    ((recentHigh - latestPrice) / recentHigh) * 100 <= 0.35 &&
    hasExpandingVolume
  ) {
    return "HIGH_OF_DAY_BREAKOUT";
  }

  if (
    /breakout|range high|recent high|resistance/.test(text) ||
    (input.recentRangePosition !== null &&
      input.recentRangePosition !== undefined &&
      input.recentRangePosition >= 75) ||
    (input.distanceTo20dHigh !== null &&
      input.distanceTo20dHigh !== undefined &&
      input.distanceTo20dHigh <= 3)
  ) {
    return hasExpandingVolume ? "BREAKOUT_CONTINUATION" : "UNKNOWN";
  }

  if (recentLow !== null && latestPrice !== null && latestPrice > recentLow && hasUpMomentum) {
    return "PULLBACK_CONTINUATION";
  }

  return "UNKNOWN";
}
