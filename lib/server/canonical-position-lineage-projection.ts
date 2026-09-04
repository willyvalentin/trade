import "server-only";

export const CANONICAL_POSITION_LINEAGE_PROJECTION_VERSION =
  "b01_canonical_position_lineage_projection_v1" as const;

const INPUT_FIELDS = Object.freeze([
  "authenticated_server_owner",
  "history",
  "position",
] as const);

const POSITION_FIELDS = Object.freeze([
  "durable_recommendation_version",
  "owner_user_id",
  "position_id",
  "position_version",
  "recommendation_id",
  "recommendation_identity",
  "recommendation_normative_digest",
] as const);

const HISTORY_FIELDS = Object.freeze([
  "durable_recommendation_version",
  "owner_user_id",
  "position_id",
  "position_state_digest",
  "position_version",
  "recommendation_id",
  "recommendation_identity",
  "recommendation_normative_digest",
] as const);

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const CANONICAL_SHA256 = /^[0-9a-f]{64}$/;

type LineageRecord = Readonly<{
  durable_recommendation_version: number;
  owner_user_id: string;
  position_id: string;
  position_version: number;
  recommendation_id: string;
  recommendation_identity: string;
  recommendation_normative_digest: string;
}>;

export type CanonicalPositionLineageProjection = Readonly<{
  contract_version: typeof CANONICAL_POSITION_LINEAGE_PROJECTION_VERSION;
  history_identity: string;
  owner_user_id: string;
  position_id: string;
  position_state_digest: string;
  position_version: number;
  recommendation_id: string;
  recommendation_identity: string;
  recommendation_normative_digest: string;
  recommendation_version: number;
}>;

export class CanonicalPositionLineageProjectionError extends Error {
  constructor() {
    super("invalid_canonical_position_lineage_projection_input");
    this.name = "CanonicalPositionLineageProjectionError";
  }
}

function reject(): never {
  throw new CanonicalPositionLineageProjectionError();
}

function isExactPlainRecord(value: unknown): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype;
}

function readExactValues(
  value: unknown,
  fields: readonly string[],
): ReadonlyMap<string, unknown> {
  if (!isExactPlainRecord(value)) return reject();

  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== fields.length ||
    keys.some((key) => typeof key !== "string") ||
    [...keys].sort().some((key, index) => key !== fields[index])
  ) {
    return reject();
  }

  const values = new Map<string, unknown>();
  for (const field of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
      return reject();
    }
    values.set(field, descriptor.value);
  }

  return values;
}

function requireCanonicalUuid(value: unknown): string {
  if (typeof value !== "string" || !CANONICAL_UUID.test(value)) return reject();
  return value;
}

function requirePositiveSafeInteger(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    return reject();
  }
  return value;
}

function requireCanonicalIdentity(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.trim().length === 0 ||
    value !== value.normalize("NFC")
  ) {
    return reject();
  }
  return value;
}

function requireDigest(value: unknown): string {
  if (typeof value !== "string" || !CANONICAL_SHA256.test(value)) return reject();
  return value;
}

function readLineageRecord(value: unknown): LineageRecord {
  const values = readExactValues(value, POSITION_FIELDS);
  return Object.freeze({
    durable_recommendation_version: requirePositiveSafeInteger(
      values.get("durable_recommendation_version"),
    ),
    owner_user_id: requireCanonicalUuid(values.get("owner_user_id")),
    position_id: requireCanonicalUuid(values.get("position_id")),
    position_version: requirePositiveSafeInteger(values.get("position_version")),
    recommendation_id: requireCanonicalUuid(values.get("recommendation_id")),
    recommendation_identity: requireCanonicalIdentity(
      values.get("recommendation_identity"),
    ),
    recommendation_normative_digest: requireDigest(
      values.get("recommendation_normative_digest"),
    ),
  });
}

/**
 * Rebuilds one immutable, server-only B-01 lineage projection from already
 * selected position and append-only-history DTOs. It never reads a database,
 * resolves a session, invokes a writer, or exposes a route/UI surface.
 */
export function projectCanonicalPositionLineage(
  input: unknown,
): CanonicalPositionLineageProjection {
  try {
    const values = readExactValues(input, INPUT_FIELDS);
    const authenticatedServerOwner = requireCanonicalUuid(
      values.get("authenticated_server_owner"),
    );
    const position = readLineageRecord(values.get("position"));
    const historyValues = readExactValues(values.get("history"), HISTORY_FIELDS);
    const history = readLineageRecord(
      Object.fromEntries(
        POSITION_FIELDS.map((field) => [field, historyValues.get(field)]),
      ),
    );
    const positionStateDigest = requireDigest(
      historyValues.get("position_state_digest"),
    );

    if (
      authenticatedServerOwner !== position.owner_user_id ||
      history.owner_user_id !== position.owner_user_id ||
      history.position_id !== position.position_id ||
      history.position_version !== position.position_version ||
      history.recommendation_id !== position.recommendation_id ||
      history.durable_recommendation_version !== position.durable_recommendation_version ||
      history.recommendation_identity !== position.recommendation_identity ||
      history.recommendation_normative_digest !== position.recommendation_normative_digest
    ) {
      return reject();
    }

    return Object.freeze({
      contract_version: CANONICAL_POSITION_LINEAGE_PROJECTION_VERSION,
      history_identity: `${position.position_id}:${position.owner_user_id}:${position.position_version}`,
      owner_user_id: position.owner_user_id,
      position_id: position.position_id,
      position_state_digest: positionStateDigest,
      position_version: position.position_version,
      recommendation_id: position.recommendation_id,
      recommendation_identity: position.recommendation_identity,
      recommendation_normative_digest: position.recommendation_normative_digest,
      recommendation_version: position.durable_recommendation_version,
    });
  } catch {
    return reject();
  }
}
