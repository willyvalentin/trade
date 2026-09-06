export const WHY_MOVE_EVIDENCE_ENVELOPE_VERSION =
  "whymove_evidence_envelope_v1" as const;

export type WhyMoveEvidenceSourceRole = "discovery_lead" | "primary_evidence";
export type WhyMoveEvidenceDirection =
  | "positive"
  | "negative"
  | "neutral"
  | "unknown";

export type WhyMoveEvidenceDisposition =
  | "invalid_input"
  | "not_admitted_missing_primary_evidence"
  | "not_admitted_unpaired_discovery_lead"
  | "not_admitted_not_point_in_time_safe"
  | "not_admitted_conflicting_primary_evidence"
  | "evidence_validated_not_admitted";

export type WhyMoveEvidenceReason =
  | "accessor_or_non_plain_input"
  | "duplicate_evidence_id"
  | "invalid_envelope_shape"
  | "invalid_timestamp"
  | "missing_or_invalid_scalar"
  | "source_role_mismatch";

export type NormalizedWhyMoveEvidence = Readonly<{
  evidence_id: string;
  source_role: WhyMoveEvidenceSourceRole;
  source_id: string;
  captured_at: string;
  effective_at: string;
  available_at_decision: boolean;
  direction: WhyMoveEvidenceDirection;
  primary_evidence_ids: readonly string[];
}>;

export type WhyMoveEvidenceValidationResult = Readonly<{
  version: typeof WHY_MOVE_EVIDENCE_ENVELOPE_VERSION;
  disposition: WhyMoveEvidenceDisposition;
  reasons: readonly WhyMoveEvidenceReason[];
  normalized_evidence: readonly NormalizedWhyMoveEvidence[];
}>;

const DISCOVERY_SOURCE_IDS = new Set(["massive_news", "finnhub_company_news"]);
const PRIMARY_SOURCE_IDS = new Set([
  "sec_edgar",
  "issuer_investor_relations",
  "issuer_press_release",
  "fda",
  "federal_reserve",
  "bls",
  "bea",
]);
const DIRECTIONS = new Set<WhyMoveEvidenceDirection>([
  "positive",
  "negative",
  "neutral",
  "unknown",
]);
const ENVELOPE_KEYS = ["envelope_id", "decision_snapshot_id", "decision_at", "evidence"] as const;
const EVIDENCE_KEYS = [
  "evidence_id",
  "source_role",
  "source_id",
  "captured_at",
  "effective_at",
  "available_at_decision",
  "direction",
  "primary_evidence_ids",
] as const;

type PlainDataRecord = Readonly<Record<string, unknown>>;

function freeze<T>(value: T): T {
  return Object.freeze(value);
}

function hasExactlyDataKeys(
  value: unknown,
  keys: readonly string[],
): value is PlainDataRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  if (Object.getPrototypeOf(value) !== Object.prototype) return false;
  if (Object.getOwnPropertySymbols(value).length > 0) return false;

  const ownKeys = Object.getOwnPropertyNames(value).sort();
  if (ownKeys.length !== keys.length || ownKeys.some((key, index) => key !== [...keys].sort()[index])) {
    return false;
  }

  return ownKeys.every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== undefined && "value" in descriptor;
  });
}

function readDataArray(value: unknown): readonly unknown[] | null {
  if (!Array.isArray(value) || Object.getOwnPropertySymbols(value).length > 0) return null;

  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
  if (!lengthDescriptor || !("value" in lengthDescriptor) || !Number.isSafeInteger(lengthDescriptor.value)) {
    return null;
  }

  const length = lengthDescriptor.value;
  const expectedKeys = ["length", ...Array.from({ length }, (_, index) => String(index))].sort();
  const ownKeys = Object.getOwnPropertyNames(value).sort();
  if (ownKeys.length !== expectedKeys.length || ownKeys.some((key, index) => key !== expectedKeys[index])) {
    return null;
  }

  const items: unknown[] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !("value" in descriptor)) return null;
    items.push(descriptor.value);
  }
  return items;
}

function readString(record: PlainDataRecord, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readBoolean(record: PlainDataRecord, key: string): boolean | null {
  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

function isExactUtcInstant(value: string): boolean {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function result(
  disposition: WhyMoveEvidenceDisposition,
  reasons: readonly WhyMoveEvidenceReason[] = [],
  evidence: readonly NormalizedWhyMoveEvidence[] = [],
): WhyMoveEvidenceValidationResult {
  return freeze({
    version: WHY_MOVE_EVIDENCE_ENVELOPE_VERSION,
    disposition,
    reasons: freeze([...new Set(reasons)].sort() as WhyMoveEvidenceReason[]),
    normalized_evidence: freeze(
      evidence.map((item) =>
        freeze({
          ...item,
          primary_evidence_ids: freeze([...item.primary_evidence_ids]),
        }),
      ),
    ),
  });
}

function normalizeEvidence(value: unknown):
  | Readonly<{ evidence: NormalizedWhyMoveEvidence }>
  | Readonly<{ reason: WhyMoveEvidenceReason }> {
  if (!hasExactlyDataKeys(value, EVIDENCE_KEYS)) {
    return { reason: "accessor_or_non_plain_input" };
  }

  const evidenceId = readString(value, "evidence_id");
  const sourceRole = readString(value, "source_role");
  const sourceId = readString(value, "source_id");
  const capturedAt = readString(value, "captured_at");
  const effectiveAt = readString(value, "effective_at");
  const availableAtDecision = readBoolean(value, "available_at_decision");
  const direction = readString(value, "direction");
  const primaryEvidenceIds = readDataArray(value.primary_evidence_ids);

  if (
    !evidenceId ||
    !sourceRole ||
    !sourceId ||
    !capturedAt ||
    !effectiveAt ||
    availableAtDecision === null ||
    !direction ||
    !primaryEvidenceIds ||
    !primaryEvidenceIds.every((item) => typeof item === "string" && item.length > 0)
  ) {
    return { reason: "missing_or_invalid_scalar" };
  }
  if (!isExactUtcInstant(capturedAt) || !isExactUtcInstant(effectiveAt)) {
    return { reason: "invalid_timestamp" };
  }
  if (
    (sourceRole !== "discovery_lead" && sourceRole !== "primary_evidence") ||
    !DIRECTIONS.has(direction as WhyMoveEvidenceDirection) ||
    (sourceRole === "discovery_lead" && !DISCOVERY_SOURCE_IDS.has(sourceId)) ||
    (sourceRole === "primary_evidence" && !PRIMARY_SOURCE_IDS.has(sourceId)) ||
    (sourceRole === "primary_evidence" && primaryEvidenceIds.length > 0)
  ) {
    return { reason: "source_role_mismatch" };
  }

  return {
    evidence: freeze({
      evidence_id: evidenceId,
      source_role: sourceRole,
      source_id: sourceId,
      captured_at: capturedAt,
      effective_at: effectiveAt,
      available_at_decision: availableAtDecision,
      direction: direction as WhyMoveEvidenceDirection,
      primary_evidence_ids: freeze([...primaryEvidenceIds] as string[]),
    }),
  };
}

/**
 * Validates local, caller-supplied catalyst evidence only. This function never
 * fetches sources, selects credentials, persists material, or changes product state.
 */
export function validateWhyMoveEvidenceEnvelope(input: unknown): WhyMoveEvidenceValidationResult {
  if (!hasExactlyDataKeys(input, ENVELOPE_KEYS)) {
    return result("invalid_input", ["invalid_envelope_shape"]);
  }

  const envelopeId = readString(input, "envelope_id");
  const decisionSnapshotId = readString(input, "decision_snapshot_id");
  const decisionAt = readString(input, "decision_at");
  const evidenceValues = readDataArray(input.evidence);
  if (!envelopeId || !decisionSnapshotId || !decisionAt || !evidenceValues) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }
  if (!isExactUtcInstant(decisionAt)) {
    return result("invalid_input", ["invalid_timestamp"]);
  }
  if (evidenceValues.length === 0) {
    return result("invalid_input", ["missing_or_invalid_scalar"]);
  }

  const normalized: NormalizedWhyMoveEvidence[] = [];
  const reasons: WhyMoveEvidenceReason[] = [];
  for (const value of evidenceValues) {
    const parsed = normalizeEvidence(value);
    if ("reason" in parsed) {
      reasons.push(parsed.reason);
      continue;
    }
    normalized.push(parsed.evidence);
  }
  if (reasons.length > 0 || normalized.length !== evidenceValues.length) {
    return result("invalid_input", reasons.length > 0 ? reasons : ["invalid_envelope_shape"]);
  }

  const evidenceIds = normalized.map((item) => item.evidence_id);
  if (new Set(evidenceIds).size !== evidenceIds.length) {
    return result("invalid_input", ["duplicate_evidence_id"]);
  }

  const decisionTimestamp = Date.parse(decisionAt);
  const pointInTimeSafe = normalized.every((item) =>
    item.available_at_decision &&
    Date.parse(item.captured_at) <= decisionTimestamp &&
    Date.parse(item.effective_at) <= decisionTimestamp,
  );
  if (!pointInTimeSafe) {
    return result("not_admitted_not_point_in_time_safe", [], normalized);
  }

  const primaryIds = new Set(
    normalized
      .filter((item) => item.source_role === "primary_evidence")
      .map((item) => item.evidence_id),
  );
  if (primaryIds.size === 0) {
    return result("not_admitted_missing_primary_evidence", [], normalized);
  }

  const hasUnpairedDiscoveryLead = normalized.some(
    (item) =>
      item.source_role === "discovery_lead" &&
      (item.primary_evidence_ids.length === 0 ||
        item.primary_evidence_ids.some((id) => !primaryIds.has(id))),
  );
  if (hasUnpairedDiscoveryLead) {
    return result("not_admitted_unpaired_discovery_lead", [], normalized);
  }

  const primaryDirections = new Set(
    normalized
      .filter(
        (item) =>
          item.source_role === "primary_evidence" &&
          (item.direction === "positive" || item.direction === "negative"),
      )
      .map((item) => item.direction),
  );
  if (primaryDirections.size > 1) {
    return result("not_admitted_conflicting_primary_evidence", [], normalized);
  }

  return result("evidence_validated_not_admitted", [], normalized);
}
