export const RECOMMENDATION_SOURCE_OPERATION_BUDGET_RECEIPT_VERSION =
  "recommendation_source_operation_budget_receipt_v1" as const;
export const RECOMMENDATION_SOURCE_OPERATION_BUDGET_POLICY_VERSION =
  "recommendation_source_operation_budget_policy_v1" as const;

export const recommendationSourceOperationBudgetBlockers = [
  "source_operation_budget_not_recorded",
  "operation_time_band_missing_or_invalid",
  "operation_budget_policy_version_missing_or_invalid",
  "time_band_credit_budget_missing_or_invalid",
  "committed_credits_before_operation_missing_or_invalid",
  "operation_cost_credits_missing_or_invalid",
  "reserved_retry_credits_missing_or_invalid",
  "maximum_attempt_count_missing_or_invalid",
  "attempt_number_missing_or_invalid",
  "backoff_state_not_recorded",
  "backoff_until_missing_or_invalid",
  "receipt_timestamp_missing_or_invalid",
  "attempt_number_exceeds_maximum",
  "committed_credits_exceed_time_band_budget",
  "operation_cost_exceeds_available_budget",
  "retry_reserve_missing_for_remaining_attempts",
  "retry_reserve_not_preserved",
  "backoff_active_at_receipt",
] as const;

export type RecommendationSourceOperationBudgetBlocker =
  (typeof recommendationSourceOperationBudgetBlockers)[number];

export type RecommendationSourceOperationTimeBand =
  | "regular"
  | "premarket"
  | "after_hours"
  | "closed";

export type RecommendationSourceOperationBudgetDisposition =
  | "planned_within_budget"
  | "backoff_active"
  | "budget_exhausted"
  | "retry_headroom_exhausted"
  | "ambiguous"
  | "unavailable";

export type RecommendationSourceOperationBudgetReceipt = {
  receipt_kind: "recommendation_source_operation_budget";
  contract_version: typeof RECOMMENDATION_SOURCE_OPERATION_BUDGET_RECEIPT_VERSION;
  status: "unavailable" | "incomplete" | "complete";
  operation_disposition: RecommendationSourceOperationBudgetDisposition;
  operation_time_band: RecommendationSourceOperationTimeBand | null;
  operation_budget_policy_version:
    | typeof RECOMMENDATION_SOURCE_OPERATION_BUDGET_POLICY_VERSION
    | null;
  time_band_credit_budget: number | null;
  committed_credits_before_operation: number | null;
  operation_cost_credits: number | null;
  reserved_retry_credits: number | null;
  maximum_attempt_count: number | null;
  attempt_number: number | null;
  backoff_state_recorded: boolean;
  backoff_until_was_explicit_null: boolean;
  backoff_until: string | null;
  receipt_timestamp: string | null;
  available_credits_before_operation: number | null;
  available_credits_after_operation: number | null;
  retry_headroom_after_operation: number | null;
  blockers: RecommendationSourceOperationBudgetBlocker[];
  can_issue_source_request: false;
  can_change_ranking_or_publication: false;
};

type BudgetFields = Omit<
  RecommendationSourceOperationBudgetReceipt,
  | "receipt_kind"
  | "contract_version"
  | "status"
  | "operation_disposition"
  | "available_credits_before_operation"
  | "available_credits_after_operation"
  | "retry_headroom_after_operation"
  | "blockers"
  | "can_issue_source_request"
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

function positiveIntegerOrNull(value: unknown, maximum: number) {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0 &&
    value <= maximum
    ? value
    : null;
}

function nonNegativeIntegerOrNull(value: unknown, maximum: number) {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= maximum
    ? value
    : null;
}

function timeBandOrNull(value: unknown): RecommendationSourceOperationTimeBand | null {
  const normalized = textOrNull(value)?.toLowerCase() ?? null;
  return normalized === "regular" ||
    normalized === "premarket" ||
    normalized === "after_hours" ||
    normalized === "closed"
    ? normalized
    : null;
}

function policyVersionOrNull(value: unknown) {
  return value === RECOMMENDATION_SOURCE_OPERATION_BUDGET_POLICY_VERSION
    ? RECOMMENDATION_SOURCE_OPERATION_BUDGET_POLICY_VERSION
    : null;
}

function hasOwn(value: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function fieldsFromPayload({
  payload,
  receiptTimestamp,
}: {
  payload: Record<string, unknown>;
  receiptTimestamp: unknown;
}): BudgetFields {
  const backoffStateRecorded = hasOwn(payload, "source_operation_backoff_until");
  const rawBackoffUntil = payload.source_operation_backoff_until;

  return {
    operation_time_band: timeBandOrNull(payload.source_operation_time_band),
    operation_budget_policy_version: policyVersionOrNull(
      payload.source_operation_budget_policy_version,
    ),
    time_band_credit_budget: positiveIntegerOrNull(
      payload.source_operation_time_band_credit_budget,
      10_000_000,
    ),
    committed_credits_before_operation: nonNegativeIntegerOrNull(
      payload.source_operation_committed_credits_before_operation,
      10_000_000,
    ),
    operation_cost_credits: positiveIntegerOrNull(
      payload.source_operation_cost_credits,
      10_000_000,
    ),
    reserved_retry_credits: nonNegativeIntegerOrNull(
      payload.source_operation_reserved_retry_credits,
      10_000_000,
    ),
    maximum_attempt_count: positiveIntegerOrNull(
      payload.source_operation_maximum_attempt_count,
      100,
    ),
    attempt_number: positiveIntegerOrNull(
      payload.source_operation_attempt_number,
      100,
    ),
    backoff_state_recorded: backoffStateRecorded,
    backoff_until_was_explicit_null:
      backoffStateRecorded && rawBackoffUntil === null,
    backoff_until:
      backoffStateRecorded && rawBackoffUntil !== null
        ? isoOrNull(rawBackoffUntil)
        : null,
    receipt_timestamp: isoOrNull(receiptTimestamp),
  };
}

function fieldsFromReceipt(value: Record<string, unknown>): BudgetFields {
  return {
    operation_time_band: timeBandOrNull(value.operation_time_band),
    operation_budget_policy_version: policyVersionOrNull(
      value.operation_budget_policy_version,
    ),
    time_band_credit_budget: positiveIntegerOrNull(
      value.time_band_credit_budget,
      10_000_000,
    ),
    committed_credits_before_operation: nonNegativeIntegerOrNull(
      value.committed_credits_before_operation,
      10_000_000,
    ),
    operation_cost_credits: positiveIntegerOrNull(
      value.operation_cost_credits,
      10_000_000,
    ),
    reserved_retry_credits: nonNegativeIntegerOrNull(
      value.reserved_retry_credits,
      10_000_000,
    ),
    maximum_attempt_count: positiveIntegerOrNull(value.maximum_attempt_count, 100),
    attempt_number: positiveIntegerOrNull(value.attempt_number, 100),
    backoff_state_recorded: value.backoff_state_recorded === true,
    backoff_until_was_explicit_null:
      value.backoff_state_recorded === true &&
      value.backoff_until_was_explicit_null === true,
    backoff_until:
      value.backoff_state_recorded === true && value.backoff_until !== null
        ? isoOrNull(value.backoff_until)
        : null,
    receipt_timestamp: isoOrNull(value.receipt_timestamp),
  };
}

function fieldsAreAbsent(fields: BudgetFields) {
  return (
    fields.operation_time_band === null &&
    fields.operation_budget_policy_version === null &&
    fields.time_band_credit_budget === null &&
    fields.committed_credits_before_operation === null &&
    fields.operation_cost_credits === null &&
    fields.reserved_retry_credits === null &&
    fields.maximum_attempt_count === null &&
    fields.attempt_number === null &&
    !fields.backoff_state_recorded &&
    !fields.backoff_until_was_explicit_null
  );
}

function assessBudget(fields: BudgetFields) {
  if (fieldsAreAbsent(fields)) {
    return {
      blockers: ["source_operation_budget_not_recorded"] as RecommendationSourceOperationBudgetBlocker[],
      disposition: "unavailable" as const,
      status: "unavailable" as const,
      availableBefore: null,
      availableAfter: null,
      retryHeadroom: null,
    };
  }

  const blockers: RecommendationSourceOperationBudgetBlocker[] = [];
  if (!fields.operation_time_band) blockers.push("operation_time_band_missing_or_invalid");
  if (!fields.operation_budget_policy_version) {
    blockers.push("operation_budget_policy_version_missing_or_invalid");
  }
  if (fields.time_band_credit_budget === null) {
    blockers.push("time_band_credit_budget_missing_or_invalid");
  }
  if (fields.committed_credits_before_operation === null) {
    blockers.push("committed_credits_before_operation_missing_or_invalid");
  }
  if (fields.operation_cost_credits === null) {
    blockers.push("operation_cost_credits_missing_or_invalid");
  }
  if (fields.reserved_retry_credits === null) {
    blockers.push("reserved_retry_credits_missing_or_invalid");
  }
  if (fields.maximum_attempt_count === null) {
    blockers.push("maximum_attempt_count_missing_or_invalid");
  }
  if (fields.attempt_number === null) {
    blockers.push("attempt_number_missing_or_invalid");
  }
  if (!fields.backoff_state_recorded) {
    blockers.push("backoff_state_not_recorded");
  } else if (
    fields.backoff_until === null &&
    !fields.backoff_until_was_explicit_null
  ) {
    blockers.push("backoff_until_missing_or_invalid");
  }
  if (!fields.receipt_timestamp) blockers.push("receipt_timestamp_missing_or_invalid");

  if (blockers.length > 0) {
    return {
      blockers,
      disposition: "unavailable" as const,
      status: "incomplete" as const,
      availableBefore: null,
      availableAfter: null,
      retryHeadroom: null,
    };
  }

  const budget = fields.time_band_credit_budget!;
  const committed = fields.committed_credits_before_operation!;
  const operationCost = fields.operation_cost_credits!;
  const retryReserve = fields.reserved_retry_credits!;
  const maximumAttempts = fields.maximum_attempt_count!;
  const attempt = fields.attempt_number!;
  const receiptAt = Date.parse(fields.receipt_timestamp!);
  const backoffAt = fields.backoff_until ? Date.parse(fields.backoff_until) : null;
  const availableBefore = budget - committed;
  const availableAfter = availableBefore - operationCost;
  const retryHeadroom = availableAfter - retryReserve;

  if (attempt > maximumAttempts) blockers.push("attempt_number_exceeds_maximum");
  if (committed > budget) blockers.push("committed_credits_exceed_time_band_budget");
  if (availableBefore < operationCost) {
    blockers.push("operation_cost_exceeds_available_budget");
  }
  if (attempt < maximumAttempts && retryReserve === 0) {
    blockers.push("retry_reserve_missing_for_remaining_attempts");
  }
  if (availableBefore >= operationCost && retryHeadroom < 0) {
    blockers.push("retry_reserve_not_preserved");
  }
  if (backoffAt !== null && backoffAt > receiptAt) {
    blockers.push("backoff_active_at_receipt");
  }

  const disposition: RecommendationSourceOperationBudgetDisposition = blockers.includes(
    "attempt_number_exceeds_maximum",
  ) || blockers.includes("committed_credits_exceed_time_band_budget")
    ? "ambiguous"
    : blockers.includes("backoff_active_at_receipt")
      ? "backoff_active"
      : blockers.includes("operation_cost_exceeds_available_budget")
        ? "budget_exhausted"
        : blockers.includes("retry_reserve_missing_for_remaining_attempts") ||
            blockers.includes("retry_reserve_not_preserved")
          ? "retry_headroom_exhausted"
          : "planned_within_budget";

  return {
    blockers,
    disposition,
    status: "complete" as const,
    availableBefore,
    availableAfter,
    retryHeadroom,
  };
}

function buildReceipt(fields: BudgetFields): RecommendationSourceOperationBudgetReceipt {
  const assessment = assessBudget(fields);
  return {
    receipt_kind: "recommendation_source_operation_budget",
    contract_version: RECOMMENDATION_SOURCE_OPERATION_BUDGET_RECEIPT_VERSION,
    status: assessment.status,
    operation_disposition: assessment.disposition,
    ...fields,
    available_credits_before_operation: assessment.availableBefore,
    available_credits_after_operation: assessment.availableAfter,
    retry_headroom_after_operation: assessment.retryHeadroom,
    blockers: assessment.blockers,
    can_issue_source_request: false,
    can_change_ranking_or_publication: false,
  };
}

/**
 * Records caller-supplied operation-capacity facts for one source observation.
 * This is only a deterministic, provider-free disclosure: it never sends a
 * request, consumes a credit, changes a schedule, or authorizes an adapter.
 */
export function buildRecommendationSourceOperationBudgetReceipt({
  payload,
  receiptTimestamp,
}: {
  payload: Record<string, unknown>;
  receiptTimestamp: string | Date | null | undefined;
}): RecommendationSourceOperationBudgetReceipt {
  return buildReceipt(fieldsFromPayload({ payload, receiptTimestamp }));
}

/** Reads only an exact stored receipt and rejects forged computed capacity. */
export function recommendationSourceOperationBudgetReceiptFromUnknown(
  value: unknown,
): RecommendationSourceOperationBudgetReceipt | null {
  const raw = objectOrNull(value);
  if (
    !raw ||
    raw.receipt_kind !== "recommendation_source_operation_budget" ||
    raw.contract_version !== RECOMMENDATION_SOURCE_OPERATION_BUDGET_RECEIPT_VERSION ||
    raw.can_issue_source_request !== false ||
    raw.can_change_ranking_or_publication !== false ||
    (raw.status !== "unavailable" && raw.status !== "incomplete" && raw.status !== "complete") ||
    (raw.operation_disposition !== "planned_within_budget" &&
      raw.operation_disposition !== "backoff_active" &&
      raw.operation_disposition !== "budget_exhausted" &&
      raw.operation_disposition !== "retry_headroom_exhausted" &&
      raw.operation_disposition !== "ambiguous" &&
      raw.operation_disposition !== "unavailable") ||
    !Array.isArray(raw.blockers) ||
    raw.blockers.some(
      (blocker) =>
        typeof blocker !== "string" ||
        !recommendationSourceOperationBudgetBlockers.includes(
          blocker as RecommendationSourceOperationBudgetBlocker,
        ),
    )
  ) {
    return null;
  }

  const fields = fieldsFromReceipt(raw);
  const expected = buildReceipt(fields);
  if (
    raw.operation_time_band !== expected.operation_time_band ||
    raw.operation_budget_policy_version !== expected.operation_budget_policy_version ||
    raw.time_band_credit_budget !== expected.time_band_credit_budget ||
    raw.committed_credits_before_operation !== expected.committed_credits_before_operation ||
    raw.operation_cost_credits !== expected.operation_cost_credits ||
    raw.reserved_retry_credits !== expected.reserved_retry_credits ||
    raw.maximum_attempt_count !== expected.maximum_attempt_count ||
    raw.attempt_number !== expected.attempt_number ||
    raw.backoff_state_recorded !== expected.backoff_state_recorded ||
    raw.backoff_until_was_explicit_null !== expected.backoff_until_was_explicit_null ||
    raw.backoff_until !== expected.backoff_until ||
    raw.receipt_timestamp !== expected.receipt_timestamp ||
    raw.status !== expected.status ||
    raw.operation_disposition !== expected.operation_disposition ||
    raw.available_credits_before_operation !== expected.available_credits_before_operation ||
    raw.available_credits_after_operation !== expected.available_credits_after_operation ||
    raw.retry_headroom_after_operation !== expected.retry_headroom_after_operation ||
    new Set(raw.blockers).size !== raw.blockers.length ||
    raw.blockers.length !== expected.blockers.length ||
    raw.blockers.some((blocker, index) => blocker !== expected.blockers[index])
  ) {
    return null;
  }

  return expected;
}
