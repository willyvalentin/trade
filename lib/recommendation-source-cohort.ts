import {
  buildRecommendationSourceObservationIntegrityReceipt,
  recommendationSourceObservationIntegrityReceiptFromUnknown,
  type RecommendationSourceObservationIntegrityReceipt,
  type RecommendationSourceObservationQualityDisposition,
} from "@/lib/recommendation-source-observation-integrity";

export const RECOMMENDATION_SOURCE_COHORT_RECEIPT_VERSION =
  "recommendation_source_cohort_receipt_v1" as const;

export const recommendationSourceCohortReceiptBlockers = [
  "source_metadata_not_recorded",
  "provider_source_missing",
  "feed_class_missing",
  "observed_entitlement_profile_missing",
  "coverage_scope_missing",
  "upstream_timestamp_missing_or_invalid",
  "upstream_timestamp_after_receipt",
  "receipt_timestamp_missing_or_invalid",
  "market_data_adapter_version_missing",
  "source_build_marker_missing",
  "request_cost_credits_missing_or_invalid",
  "response_quality_disposition_missing_or_invalid",
  "response_quality_not_accepted",
  "source_observation_integrity_receipt_missing_or_invalid",
  "source_observation_integrity_not_accepted",
  "source_observation_integrity_timestamp_mismatch",
  "declared_response_quality_disposition_mismatch",
] as const;

export type RecommendationSourceCohortReceiptBlocker =
  (typeof recommendationSourceCohortReceiptBlockers)[number];

export type RecommendationSourceResponseQualityDisposition =
  | RecommendationSourceObservationQualityDisposition
  | "accepted"
  | "degraded"
  | "partial"
  | "rejected";

export type RecommendationSourceCohortReceipt = {
  receipt_kind: "recommendation_source_cohort";
  contract_version: typeof RECOMMENDATION_SOURCE_COHORT_RECEIPT_VERSION;
  status: "unavailable" | "incomplete" | "complete";
  cohort_key: string | null;
  provider_source: string | null;
  market_data_source: string | null;
  feed_class: string | null;
  configured_entitlement_profile: string | null;
  observed_entitlement_profile: string | null;
  coverage_scope: string | null;
  upstream_timestamp: string | null;
  receipt_timestamp: string | null;
  upstream_response_identity: string | null;
  market_data_adapter_version: string | null;
  source_build_marker: string | null;
  request_cost_credits: number | null;
  response_quality_disposition: RecommendationSourceResponseQualityDisposition | null;
  declared_response_quality_disposition: RecommendationSourceResponseQualityDisposition | null;
  observation_integrity_receipt: RecommendationSourceObservationIntegrityReceipt | null;
  blockers: RecommendationSourceCohortReceiptBlocker[];
  can_change_ranking_or_publication: false;
};

export type RecommendationSourceCohortProvenance = {
  status: "unavailable" | "not_recorded" | "incomplete" | "mixed" | "complete";
  assessed_snapshot_count: number;
  valid_receipt_count: number;
  missing_receipt_count: number;
  invalid_receipt_count: number;
  complete_receipt_count: number;
  incomplete_receipt_count: number;
  unavailable_receipt_count: number;
  cohort_keys: string[];
  provider_sources: string[];
  feed_classes: string[];
  observed_entitlement_profiles: string[];
  coverage_scopes: string[];
};

type SourceCohortFields = Omit<
  RecommendationSourceCohortReceipt,
  | "receipt_kind"
  | "contract_version"
  | "status"
  | "cohort_key"
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

function nonNegativeNumberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function responseQualityDispositionOrNull(
  value: unknown,
): RecommendationSourceResponseQualityDisposition | null {
  const valueText = textOrNull(value)?.toLowerCase() ?? null;

  return valueText === "accepted" ||
    valueText === "degraded" ||
    valueText === "partial" ||
    valueText === "rejected" ||
    valueText === "stale" ||
    valueText === "delayed" ||
    valueText === "ambiguous" ||
    valueText === "unavailable"
    ? valueText
    : null;
}

function uniqueSorted(values: Iterable<string>) {
  return Array.from(new Set(values)).sort();
}

function cohortKeyFor(fields: SourceCohortFields) {
  const integrityReceipt = fields.observation_integrity_receipt;
  if (
    !fields.provider_source ||
    !fields.feed_class ||
    !fields.observed_entitlement_profile ||
    !fields.coverage_scope ||
    !fields.market_data_adapter_version ||
    !fields.source_build_marker ||
    !integrityReceipt ||
    !integrityReceipt.observation_time_band ||
    !integrityReceipt.integrity_policy_version ||
    integrityReceipt.maximum_upstream_age_seconds === null ||
    integrityReceipt.maximum_response_latency_seconds === null
  ) {
    return null;
  }

  // A JSON tuple keeps arbitrary vendor identifiers collision-safe without
  // turning this receipt into an opaque score or a provider-specific key.
  return JSON.stringify([
    RECOMMENDATION_SOURCE_COHORT_RECEIPT_VERSION,
    fields.provider_source,
    fields.feed_class,
    fields.observed_entitlement_profile,
    fields.coverage_scope,
    fields.market_data_adapter_version,
    fields.source_build_marker,
    integrityReceipt.observation_time_band,
    integrityReceipt.integrity_policy_version,
    integrityReceipt.maximum_upstream_age_seconds,
    integrityReceipt.maximum_response_latency_seconds,
  ]);
}

function fieldsFromPayload({
  payload,
  receiptTimestamp,
}: {
  payload: Record<string, unknown>;
  receiptTimestamp: string | Date | null | undefined;
}): SourceCohortFields {
  const observationIntegrityReceipt =
    buildRecommendationSourceObservationIntegrityReceipt({
      payload,
      receiptTimestamp,
    });

  return {
    provider_source: textOrNull(payload.provider_source),
    market_data_source: textOrNull(payload.market_data_source),
    feed_class: textOrNull(payload.source_feed_class),
    configured_entitlement_profile: textOrNull(
      payload.provider_plan_profile_mode,
    ),
    observed_entitlement_profile: textOrNull(
      payload.observed_provider_entitlement_profile,
    ),
    coverage_scope: textOrNull(payload.source_coverage_scope),
    upstream_timestamp: isoOrNull(
      payload.source_upstream_timestamp ?? payload.data_timestamp,
    ),
    receipt_timestamp: isoOrNull(receiptTimestamp),
    upstream_response_identity: textOrNull(
      payload.upstream_response_identity ?? payload.provider_response_id,
    ),
    market_data_adapter_version: textOrNull(
      payload.market_data_adapter_version,
    ),
    source_build_marker: textOrNull(payload.build_marker),
    request_cost_credits: nonNegativeNumberOrNull(
      payload.source_request_cost_credits,
    ),
    response_quality_disposition:
      observationIntegrityReceipt.quality_disposition === "unavailable"
        ? null
        : observationIntegrityReceipt.quality_disposition,
    declared_response_quality_disposition: responseQualityDispositionOrNull(
      payload.source_response_quality_disposition,
    ),
    observation_integrity_receipt: observationIntegrityReceipt,
  };
}

function fieldsAreAbsent(fields: SourceCohortFields) {
  return (
    fields.provider_source === null &&
    fields.market_data_source === null &&
    fields.feed_class === null &&
    fields.configured_entitlement_profile === null &&
    fields.observed_entitlement_profile === null &&
    fields.coverage_scope === null &&
    fields.upstream_timestamp === null &&
    fields.upstream_response_identity === null &&
    fields.market_data_adapter_version === null &&
    fields.source_build_marker === null &&
    fields.request_cost_credits === null &&
    fields.response_quality_disposition === null &&
    fields.observation_integrity_receipt?.status === "unavailable"
  );
}

function blockersFor(fields: SourceCohortFields) {
  if (fieldsAreAbsent(fields)) {
    return ["source_metadata_not_recorded"] as RecommendationSourceCohortReceiptBlocker[];
  }

  const blockers: RecommendationSourceCohortReceiptBlocker[] = [];
  if (!fields.provider_source) blockers.push("provider_source_missing");
  if (!fields.feed_class) blockers.push("feed_class_missing");
  if (!fields.observed_entitlement_profile) {
    blockers.push("observed_entitlement_profile_missing");
  }
  if (!fields.coverage_scope) blockers.push("coverage_scope_missing");
  if (!fields.upstream_timestamp) {
    blockers.push("upstream_timestamp_missing_or_invalid");
  } else if (
    fields.receipt_timestamp &&
    Date.parse(fields.upstream_timestamp) > Date.parse(fields.receipt_timestamp)
  ) {
    blockers.push("upstream_timestamp_after_receipt");
  }
  if (!fields.receipt_timestamp) {
    blockers.push("receipt_timestamp_missing_or_invalid");
  }
  if (!fields.market_data_adapter_version) {
    blockers.push("market_data_adapter_version_missing");
  }
  if (!fields.source_build_marker) blockers.push("source_build_marker_missing");
  if (fields.request_cost_credits === null) {
    blockers.push("request_cost_credits_missing_or_invalid");
  }
  if (!fields.response_quality_disposition) {
    blockers.push("response_quality_disposition_missing_or_invalid");
  } else if (fields.response_quality_disposition !== "accepted") {
    blockers.push("response_quality_not_accepted");
  }
  if (
    !fields.observation_integrity_receipt ||
    fields.observation_integrity_receipt.status === "unavailable"
  ) {
    blockers.push("source_observation_integrity_receipt_missing_or_invalid");
  } else {
    if (fields.observation_integrity_receipt.quality_disposition !== "accepted") {
      blockers.push("source_observation_integrity_not_accepted");
    }
    if (
      fields.upstream_timestamp !==
      fields.observation_integrity_receipt.upstream_timestamp
    ) {
      blockers.push("source_observation_integrity_timestamp_mismatch");
    }
  }
  if (
    fields.declared_response_quality_disposition &&
    fields.response_quality_disposition &&
    fields.declared_response_quality_disposition !==
      fields.response_quality_disposition
  ) {
    blockers.push("declared_response_quality_disposition_mismatch");
  }

  return blockers;
}

/**
 * Captures only supplied source facts for a decision snapshot. It never
 * infers observed entitlement from a configured plan, cost from a quota, feed
 * class from a provider name, or response quality from a successful request.
 */
export function buildRecommendationSourceCohortReceipt({
  payload,
  receiptTimestamp,
}: {
  payload: Record<string, unknown>;
  receiptTimestamp: string | Date | null | undefined;
}): RecommendationSourceCohortReceipt {
  const fields = fieldsFromPayload({ payload, receiptTimestamp });
  const blockers = blockersFor(fields);
  const unavailable = fieldsAreAbsent(fields);

  return {
    receipt_kind: "recommendation_source_cohort",
    contract_version: RECOMMENDATION_SOURCE_COHORT_RECEIPT_VERSION,
    status: unavailable
      ? "unavailable"
      : blockers.length === 0
        ? "complete"
        : "incomplete",
    cohort_key: cohortKeyFor(fields),
    ...fields,
    blockers,
    can_change_ranking_or_publication: false,
  };
}

function sourceCohortFieldsFromUnknown(value: Record<string, unknown>) {
  return {
    provider_source: textOrNull(value.provider_source),
    market_data_source: textOrNull(value.market_data_source),
    feed_class: textOrNull(value.feed_class),
    configured_entitlement_profile: textOrNull(
      value.configured_entitlement_profile,
    ),
    observed_entitlement_profile: textOrNull(
      value.observed_entitlement_profile,
    ),
    coverage_scope: textOrNull(value.coverage_scope),
    upstream_timestamp: isoOrNull(value.upstream_timestamp),
    receipt_timestamp: isoOrNull(value.receipt_timestamp),
    upstream_response_identity: textOrNull(value.upstream_response_identity),
    market_data_adapter_version: textOrNull(value.market_data_adapter_version),
    source_build_marker: textOrNull(value.source_build_marker),
    request_cost_credits: nonNegativeNumberOrNull(value.request_cost_credits),
    response_quality_disposition: responseQualityDispositionOrNull(
      value.response_quality_disposition,
    ),
    declared_response_quality_disposition: responseQualityDispositionOrNull(
      value.declared_response_quality_disposition,
    ),
    observation_integrity_receipt:
      recommendationSourceObservationIntegrityReceiptFromUnknown(
        value.observation_integrity_receipt,
      ),
  } satisfies SourceCohortFields;
}

/**
 * Reads only the exact v1 receipt shape. A malformed or contradictory stored
 * receipt is deliberately not repaired from adjacent snapshot fields.
 */
export function recommendationSourceCohortReceiptFromUnknown(
  value: unknown,
): RecommendationSourceCohortReceipt | null {
  const raw = objectOrNull(value);
  if (
    !raw ||
    raw.receipt_kind !== "recommendation_source_cohort" ||
    raw.contract_version !== RECOMMENDATION_SOURCE_COHORT_RECEIPT_VERSION ||
    raw.can_change_ranking_or_publication !== false ||
    (raw.status !== "unavailable" &&
      raw.status !== "incomplete" &&
      raw.status !== "complete") ||
    !Array.isArray(raw.blockers) ||
    raw.blockers.some(
      (blocker) =>
        typeof blocker !== "string" ||
        !recommendationSourceCohortReceiptBlockers.includes(
          blocker as RecommendationSourceCohortReceiptBlocker,
        ),
    )
  ) {
    return null;
  }

  const fields = sourceCohortFieldsFromUnknown(raw);
  if (
    raw.provider_source !== fields.provider_source ||
    raw.market_data_source !== fields.market_data_source ||
    raw.feed_class !== fields.feed_class ||
    raw.configured_entitlement_profile !== fields.configured_entitlement_profile ||
    raw.observed_entitlement_profile !== fields.observed_entitlement_profile ||
    raw.coverage_scope !== fields.coverage_scope ||
    raw.upstream_timestamp !== fields.upstream_timestamp ||
    raw.receipt_timestamp !== fields.receipt_timestamp ||
    raw.upstream_response_identity !== fields.upstream_response_identity ||
    raw.market_data_adapter_version !== fields.market_data_adapter_version ||
    raw.source_build_marker !== fields.source_build_marker ||
    raw.request_cost_credits !== fields.request_cost_credits ||
    raw.response_quality_disposition !== fields.response_quality_disposition ||
    raw.declared_response_quality_disposition !==
      fields.declared_response_quality_disposition ||
    raw.observation_integrity_receipt === undefined ||
    (raw.observation_integrity_receipt !== null &&
      fields.observation_integrity_receipt === null)
  ) {
    return null;
  }
  const rawCohortKey = raw.cohort_key;
  const cohortKey = typeof rawCohortKey === "string" ? rawCohortKey : null;
  if (rawCohortKey !== null && cohortKey === null) return null;

  const blockers = raw.blockers as RecommendationSourceCohortReceiptBlocker[];
  const expectedBlockers = blockersFor(fields);
  const expectedCohortKey = cohortKeyFor(fields);
  const expectedStatus = fieldsAreAbsent(fields)
    ? "unavailable"
    : expectedBlockers.length === 0
      ? "complete"
      : "incomplete";

  if (
    raw.status !== expectedStatus ||
    cohortKey !== expectedCohortKey ||
    new Set(blockers).size !== blockers.length ||
    blockers.length !== expectedBlockers.length ||
    blockers.some((blocker, index) => blocker !== expectedBlockers[index])
  ) {
    return null;
  }

  return {
    receipt_kind: "recommendation_source_cohort",
    contract_version: RECOMMENDATION_SOURCE_COHORT_RECEIPT_VERSION,
    status: raw.status,
    cohort_key: cohortKey,
    ...fields,
    blockers,
    can_change_ranking_or_publication: false,
  };
}

export function buildRecommendationSourceCohortProvenance(
  snapshots: Array<{ payload_json: Record<string, unknown> }>,
): RecommendationSourceCohortProvenance {
  const receipts = snapshots.map((snapshot) =>
    recommendationSourceCohortReceiptFromUnknown(
      snapshot.payload_json.source_cohort_receipt,
    ),
  );
  const validReceipts = receipts.filter(
    (receipt): receipt is RecommendationSourceCohortReceipt => receipt !== null,
  );
  const missingReceiptCount = snapshots.filter(
    (snapshot) => snapshot.payload_json.source_cohort_receipt === undefined,
  ).length;
  const invalidReceiptCount =
    snapshots.length - validReceipts.length - missingReceiptCount;
  const completeReceipts = validReceipts.filter(
    (receipt) => receipt.status === "complete",
  );
  const incompleteReceiptCount = validReceipts.filter(
    (receipt) => receipt.status === "incomplete",
  ).length;
  const unavailableReceiptCount = validReceipts.filter(
    (receipt) => receipt.status === "unavailable",
  ).length;
  const cohortKeys = uniqueSorted(
    completeReceipts.flatMap((receipt) =>
      receipt.cohort_key ? [receipt.cohort_key] : [],
    ),
  );

  return {
    status:
      snapshots.length === 0
        ? "unavailable"
        : validReceipts.length === 0 && invalidReceiptCount === 0
          ? "not_recorded"
          : missingReceiptCount > 0 ||
              invalidReceiptCount > 0 ||
              incompleteReceiptCount > 0
            ? "incomplete"
            : unavailableReceiptCount === validReceipts.length
              ? "not_recorded"
              : cohortKeys.length === 1
                ? "complete"
                : "mixed",
    assessed_snapshot_count: snapshots.length,
    valid_receipt_count: validReceipts.length,
    missing_receipt_count: missingReceiptCount,
    invalid_receipt_count: invalidReceiptCount,
    complete_receipt_count: completeReceipts.length,
    incomplete_receipt_count: incompleteReceiptCount,
    unavailable_receipt_count: unavailableReceiptCount,
    cohort_keys: cohortKeys,
    provider_sources: uniqueSorted(
      completeReceipts.flatMap((receipt) =>
        receipt.provider_source ? [receipt.provider_source] : [],
      ),
    ),
    feed_classes: uniqueSorted(
      completeReceipts.flatMap((receipt) =>
        receipt.feed_class ? [receipt.feed_class] : [],
      ),
    ),
    observed_entitlement_profiles: uniqueSorted(
      completeReceipts.flatMap((receipt) =>
        receipt.observed_entitlement_profile
          ? [receipt.observed_entitlement_profile]
          : [],
      ),
    ),
    coverage_scopes: uniqueSorted(
      completeReceipts.flatMap((receipt) =>
        receipt.coverage_scope ? [receipt.coverage_scope] : [],
      ),
    ),
  };
}
