export const recommendationConfidenceMetadataPrefix = "\n\n[confidence_meta:";

export type PlanReferenceMetadataStatus =
  | "present"
  | "missing_but_plan_prices_present"
  | "missing_no_plan_prices";

export type PlanReferenceMetadataDiagnostics = {
  plan_reference_metadata_status: PlanReferenceMetadataStatus;
  plan_reference_metadata_missing_reason: string | null;
};

export function parseRecommendationConfidenceMetadata(
  value: string | null | undefined,
): Record<string, unknown> | null {
  if (!value) return null;

  const start = value.indexOf(recommendationConfidenceMetadataPrefix);
  if (start === -1) return null;

  const jsonStart = start + recommendationConfidenceMetadataPrefix.length;
  const end = value.indexOf("]", jsonStart);
  if (end === -1) return null;

  try {
    const parsed = JSON.parse(value.slice(jsonStart, end)) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function planReferenceMetadataDiagnostics(input: {
  referencePrice?: unknown;
  entry?: unknown;
  stop?: unknown;
  target?: unknown;
}): PlanReferenceMetadataDiagnostics {
  if (finiteNumber(input.referencePrice) !== null) {
    return {
      plan_reference_metadata_status: "present",
      plan_reference_metadata_missing_reason: null,
    };
  }

  const hasPlanPrices =
    finiteNumber(input.entry) !== null ||
    finiteNumber(input.stop) !== null ||
    finiteNumber(input.target) !== null;

  return {
    plan_reference_metadata_status: hasPlanPrices
      ? "missing_but_plan_prices_present"
      : "missing_no_plan_prices",
    plan_reference_metadata_missing_reason: hasPlanPrices
      ? "entry_stop_or_target_present_without_reference_price"
      : "entry_stop_target_and_reference_price_unavailable",
  };
}
