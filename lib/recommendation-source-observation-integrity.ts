export const RECOMMENDATION_SOURCE_OBSERVATION_INTEGRITY_RECEIPT_VERSION =
  "recommendation_source_observation_integrity_receipt_v1" as const;
export const RECOMMENDATION_SOURCE_OBSERVATION_INTEGRITY_POLICY_VERSION =
  "recommendation_source_observation_integrity_policy_v1" as const;

export const recommendationSourceObservationIntegrityBlockers = [
  "source_observation_not_recorded",
  "observation_time_band_missing_or_invalid",
  "integrity_policy_version_missing_or_invalid",
  "maximum_upstream_age_seconds_missing_or_invalid",
  "maximum_response_latency_seconds_missing_or_invalid",
  "expected_record_count_missing_or_invalid",
  "observed_record_count_missing_or_invalid",
  "upstream_timestamp_missing_or_invalid",
  "request_started_at_missing_or_invalid",
  "response_received_at_missing_or_invalid",
  "receipt_timestamp_missing_or_invalid",
  "request_started_after_response",
  "response_received_after_receipt",
  "upstream_timestamp_after_response",
  "upstream_timestamp_after_receipt",
  "observed_coverage_below_expected",
  "observed_coverage_exceeds_expected",
  "upstream_age_exceeds_policy",
  "response_latency_exceeds_policy",
] as const;

export type RecommendationSourceObservationIntegrityBlocker =
  (typeof recommendationSourceObservationIntegrityBlockers)[number];

export type RecommendationSourceObservationTimeBand =
  | "regular"
  | "premarket"
  | "after_hours"
  | "closed";

export type RecommendationSourceObservationQualityDisposition =
  | "accepted"
  | "partial"
  | "stale"
  | "delayed"
  | "ambiguous"
  | "unavailable";

export type RecommendationSourceObservationIntegrityReceipt = {
  receipt_kind: "recommendation_source_observation_integrity";
  contract_version: typeof RECOMMENDATION_SOURCE_OBSERVATION_INTEGRITY_RECEIPT_VERSION;
  status: "unavailable" | "incomplete" | "complete";
  quality_disposition: RecommendationSourceObservationQualityDisposition;
  observation_time_band: RecommendationSourceObservationTimeBand | null;
  integrity_policy_version:
    | typeof RECOMMENDATION_SOURCE_OBSERVATION_INTEGRITY_POLICY_VERSION
    | null;
  maximum_upstream_age_seconds: number | null;
  maximum_response_latency_seconds: number | null;
  expected_record_count: number | null;
  observed_record_count: number | null;
  upstream_timestamp: string | null;
  request_started_at: string | null;
  response_received_at: string | null;
  receipt_timestamp: string | null;
  upstream_age_seconds: number | null;
  response_latency_seconds: number | null;
  blockers: RecommendationSourceObservationIntegrityBlocker[];
  can_change_ranking_or_publication: false;
};

type IntegrityFields = Omit<
  RecommendationSourceObservationIntegrityReceipt,
  | "receipt_kind"
  | "contract_version"
  | "status"
  | "quality_disposition"
  | "upstream_age_seconds"
  | "response_latency_seconds"
  | "blockers"
  | "can_change_ranking_or_publication"
>;

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isoOrNull(value: unknown) {
  const text = textOrNull(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function boundedPositiveInteger(value: unknown, maximum: number) {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= maximum
    ? value
    : null;
}

function timeBandOrNull(value: unknown): RecommendationSourceObservationTimeBand | null {
  const normalized = textOrNull(value)?.toLowerCase() ?? null;
  return normalized === "regular" ||
    normalized === "premarket" ||
    normalized === "after_hours" ||
    normalized === "closed"
    ? normalized
    : null;
}

function policyVersionOrNull(value: unknown) {
  return value === RECOMMENDATION_SOURCE_OBSERVATION_INTEGRITY_POLICY_VERSION
    ? RECOMMENDATION_SOURCE_OBSERVATION_INTEGRITY_POLICY_VERSION
    : null;
}

function fieldsFromPayload({
  payload,
  receiptTimestamp,
}: {
  payload: Record<string, unknown>;
  receiptTimestamp: unknown;
}): IntegrityFields {
  return {
    observation_time_band: timeBandOrNull(payload.source_observation_time_band),
    integrity_policy_version: policyVersionOrNull(
      payload.source_observation_integrity_policy_version,
    ),
    maximum_upstream_age_seconds: boundedPositiveInteger(
      payload.source_maximum_upstream_age_seconds,
      86_400,
    ),
    maximum_response_latency_seconds: boundedPositiveInteger(
      payload.source_maximum_response_latency_seconds,
      3_600,
    ),
    expected_record_count: boundedPositiveInteger(
      payload.source_expected_record_count,
      10_000_000,
    ),
    observed_record_count: boundedPositiveInteger(
      payload.source_observed_record_count,
      10_000_000,
    ),
    upstream_timestamp: isoOrNull(
      payload.source_upstream_timestamp ?? payload.data_timestamp,
    ),
    request_started_at: isoOrNull(payload.source_request_started_at),
    response_received_at: isoOrNull(payload.source_response_received_at),
    receipt_timestamp: isoOrNull(receiptTimestamp),
  };
}

function fieldsFromReceipt(value: Record<string, unknown>): IntegrityFields {
  return {
    observation_time_band: timeBandOrNull(value.observation_time_band),
    integrity_policy_version: policyVersionOrNull(value.integrity_policy_version),
    maximum_upstream_age_seconds: boundedPositiveInteger(
      value.maximum_upstream_age_seconds,
      86_400,
    ),
    maximum_response_latency_seconds: boundedPositiveInteger(
      value.maximum_response_latency_seconds,
      3_600,
    ),
    expected_record_count: boundedPositiveInteger(value.expected_record_count, 10_000_000),
    observed_record_count: boundedPositiveInteger(value.observed_record_count, 10_000_000),
    upstream_timestamp: isoOrNull(value.upstream_timestamp),
    request_started_at: isoOrNull(value.request_started_at),
    response_received_at: isoOrNull(value.response_received_at),
    receipt_timestamp: isoOrNull(value.receipt_timestamp),
  };
}

function fieldsAreAbsent(fields: IntegrityFields) {
  return (
    fields.observation_time_band === null &&
    fields.integrity_policy_version === null &&
    fields.maximum_upstream_age_seconds === null &&
    fields.maximum_response_latency_seconds === null &&
    fields.expected_record_count === null &&
    fields.observed_record_count === null &&
    fields.upstream_timestamp === null &&
    fields.request_started_at === null &&
    fields.response_received_at === null
  );
}

function integrityAssessment(fields: IntegrityFields) {
  if (fieldsAreAbsent(fields)) {
    return {
      blockers: ["source_observation_not_recorded"] as RecommendationSourceObservationIntegrityBlocker[],
      quality: "unavailable" as const,
      status: "unavailable" as const,
      upstreamAgeSeconds: null,
      responseLatencySeconds: null,
    };
  }

  const blockers: RecommendationSourceObservationIntegrityBlocker[] = [];
  if (!fields.observation_time_band) blockers.push("observation_time_band_missing_or_invalid");
  if (!fields.integrity_policy_version) blockers.push("integrity_policy_version_missing_or_invalid");
  if (fields.maximum_upstream_age_seconds === null) {
    blockers.push("maximum_upstream_age_seconds_missing_or_invalid");
  }
  if (fields.maximum_response_latency_seconds === null) {
    blockers.push("maximum_response_latency_seconds_missing_or_invalid");
  }
  if (fields.expected_record_count === null) {
    blockers.push("expected_record_count_missing_or_invalid");
  }
  if (fields.observed_record_count === null) {
    blockers.push("observed_record_count_missing_or_invalid");
  }
  if (!fields.upstream_timestamp) blockers.push("upstream_timestamp_missing_or_invalid");
  if (!fields.request_started_at) blockers.push("request_started_at_missing_or_invalid");
  if (!fields.response_received_at) blockers.push("response_received_at_missing_or_invalid");
  if (!fields.receipt_timestamp) blockers.push("receipt_timestamp_missing_or_invalid");

  if (blockers.length > 0) {
    return {
      blockers,
      quality: "unavailable" as const,
      status: "incomplete" as const,
      upstreamAgeSeconds: null,
      responseLatencySeconds: null,
    };
  }

  const upstreamAt = Date.parse(fields.upstream_timestamp!);
  const requestStartedAt = Date.parse(fields.request_started_at!);
  const responseReceivedAt = Date.parse(fields.response_received_at!);
  const receiptAt = Date.parse(fields.receipt_timestamp!);
  const upstreamAgeSeconds = Math.max(0, Math.round((receiptAt - upstreamAt) / 1000));
  const responseLatencySeconds = Math.max(
    0,
    Math.round((responseReceivedAt - requestStartedAt) / 1000),
  );

  if (requestStartedAt > responseReceivedAt) blockers.push("request_started_after_response");
  if (responseReceivedAt > receiptAt) blockers.push("response_received_after_receipt");
  if (upstreamAt > responseReceivedAt) blockers.push("upstream_timestamp_after_response");
  if (upstreamAt > receiptAt) blockers.push("upstream_timestamp_after_receipt");

  if (blockers.length > 0) {
    return {
      blockers,
      quality: "ambiguous" as const,
      status: "incomplete" as const,
      upstreamAgeSeconds: null,
      responseLatencySeconds: null,
    };
  }

  if (fields.observed_record_count! < fields.expected_record_count!) {
    blockers.push("observed_coverage_below_expected");
  } else if (fields.observed_record_count! > fields.expected_record_count!) {
    blockers.push("observed_coverage_exceeds_expected");
  }
  if (upstreamAgeSeconds > fields.maximum_upstream_age_seconds!) {
    blockers.push("upstream_age_exceeds_policy");
  }
  if (responseLatencySeconds > fields.maximum_response_latency_seconds!) {
    blockers.push("response_latency_exceeds_policy");
  }

  const quality: RecommendationSourceObservationQualityDisposition = blockers.includes(
    "observed_coverage_exceeds_expected",
  )
    ? "ambiguous"
    : blockers.includes("observed_coverage_below_expected")
      ? "partial"
      : blockers.includes("upstream_age_exceeds_policy")
        ? "stale"
        : blockers.includes("response_latency_exceeds_policy")
          ? "delayed"
          : "accepted";

  return {
    blockers,
    quality,
    status: "complete" as const,
    upstreamAgeSeconds,
    responseLatencySeconds,
  };
}

function buildReceipt(fields: IntegrityFields): RecommendationSourceObservationIntegrityReceipt {
  const assessment = integrityAssessment(fields);
  return {
    receipt_kind: "recommendation_source_observation_integrity",
    contract_version: RECOMMENDATION_SOURCE_OBSERVATION_INTEGRITY_RECEIPT_VERSION,
    status: assessment.status,
    quality_disposition: assessment.quality,
    ...fields,
    upstream_age_seconds: assessment.upstreamAgeSeconds,
    response_latency_seconds: assessment.responseLatencySeconds,
    blockers: assessment.blockers,
    can_change_ranking_or_publication: false,
  };
}

/**
 * Computes a versioned, deterministic integrity receipt from explicit source
 * observation facts. It never makes a provider call, fills in missing source
 * data, or treats a caller-supplied success string as proof of usable data.
 */
export function buildRecommendationSourceObservationIntegrityReceipt({
  payload,
  receiptTimestamp,
}: {
  payload: Record<string, unknown>;
  receiptTimestamp: string | Date | null | undefined;
}): RecommendationSourceObservationIntegrityReceipt {
  return buildReceipt(fieldsFromPayload({ payload, receiptTimestamp }));
}

/** Reads only an exact stored receipt and recomputes every derived result. */
export function recommendationSourceObservationIntegrityReceiptFromUnknown(
  value: unknown,
): RecommendationSourceObservationIntegrityReceipt | null {
  const raw = objectOrNull(value);
  if (
    !raw ||
    raw.receipt_kind !== "recommendation_source_observation_integrity" ||
    raw.contract_version !== RECOMMENDATION_SOURCE_OBSERVATION_INTEGRITY_RECEIPT_VERSION ||
    raw.can_change_ranking_or_publication !== false ||
    (raw.status !== "unavailable" && raw.status !== "incomplete" && raw.status !== "complete") ||
    (raw.quality_disposition !== "accepted" &&
      raw.quality_disposition !== "partial" &&
      raw.quality_disposition !== "stale" &&
      raw.quality_disposition !== "delayed" &&
      raw.quality_disposition !== "ambiguous" &&
      raw.quality_disposition !== "unavailable") ||
    !Array.isArray(raw.blockers) ||
    raw.blockers.some(
      (blocker) =>
        typeof blocker !== "string" ||
        !recommendationSourceObservationIntegrityBlockers.includes(
          blocker as RecommendationSourceObservationIntegrityBlocker,
        ),
    )
  ) {
    return null;
  }

  const expected = buildReceipt(fieldsFromReceipt(raw));
  if (
    raw.observation_time_band !== expected.observation_time_band ||
    raw.integrity_policy_version !== expected.integrity_policy_version ||
    raw.maximum_upstream_age_seconds !== expected.maximum_upstream_age_seconds ||
    raw.maximum_response_latency_seconds !== expected.maximum_response_latency_seconds ||
    raw.expected_record_count !== expected.expected_record_count ||
    raw.observed_record_count !== expected.observed_record_count ||
    raw.upstream_timestamp !== expected.upstream_timestamp ||
    raw.request_started_at !== expected.request_started_at ||
    raw.response_received_at !== expected.response_received_at ||
    raw.receipt_timestamp !== expected.receipt_timestamp ||
    raw.status !== expected.status ||
    raw.quality_disposition !== expected.quality_disposition ||
    raw.upstream_age_seconds !== expected.upstream_age_seconds ||
    raw.response_latency_seconds !== expected.response_latency_seconds ||
    raw.blockers.length !== expected.blockers.length ||
    raw.blockers.some((blocker, index) => blocker !== expected.blockers[index])
  ) {
    return null;
  }

  return expected;
}
