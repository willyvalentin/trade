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
  const jsonEnd = findJsonObjectEnd(value, jsonStart);
  if (jsonEnd === null) return null;

  try {
    const parsed = JSON.parse(value.slice(jsonStart, jsonEnd)) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function findJsonObjectEnd(value: string, start: number) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let objectStarted = false;

  for (let index = start; index < value.length; index += 1) {
    const character = value[index];

    if (!objectStarted) {
      if (/\s/.test(character)) continue;
      if (character !== "{") return null;
      objectStarted = true;
      depth = 1;
      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = inString;
      continue;
    }

    if (character === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (character === "{") {
      depth += 1;
      continue;
    }

    if (character === "}") {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }

  return null;
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
