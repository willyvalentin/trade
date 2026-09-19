import type { RecommendationOutcomeEvaluationRun } from "@/lib/recommendation-outcome-evaluation-runner";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { getNewYorkDateString } from "@/lib/intraday-scan-window";

export const SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION =
  "scheduled_outcome_evaluation_receipt_v1" as const;

export const SCHEDULED_OUTCOME_EVALUATION_SLOT_MINUTES = 15;

export type ScheduledOutcomeEvaluationAttemptStatus =
  | "claimed"
  | "completed"
  | "partial"
  | "blocked"
  | "failed";

export type ScheduledOutcomeEvaluationReceipt = {
  contract_version: typeof SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION;
  attempt_fingerprint: string;
  market_date: string;
  scheduled_slot_at: string;
  route_received_at: string;
  completed_at: string;
  status: Exclude<ScheduledOutcomeEvaluationAttemptStatus, "claimed">;
  disposition: "research_only";
  evaluator: {
    route_version: string;
    runner_version: RecommendationOutcomeEvaluationRun["run_version"];
    provider: string | null;
    horizons: string[];
  };
  decision_lineage: {
    status: "unavailable" | "complete" | "mixed" | "incomplete";
    eligible_snapshot_count: number;
    policy_versioned_snapshot_count: number;
    missing_policy_version_count: number;
    recommendation_publish_policy_versions: string[];
    source_modes: string[];
    market_data_sources: string[];
    missing_market_data_source_count: number;
  };
  scope: {
    selected_batch_fingerprint: string | null;
    eligible_snapshot_count: number;
    evaluated_snapshot_count: number;
  };
  coverage: {
    incomplete_snapshot_count: number;
    missing_candle_count: number;
    provider_error_count: number;
    empty_candle_response_count: number;
    provider_limit_count: number;
  };
  cost: {
    provider_budget_limit: number | null;
    candle_requests_planned: number;
    candle_requests_executed: number;
    candle_requests_saved_by_reuse: number;
  };
  persistence: {
    outcomes_created_count: number;
    outcomes_updated_count: number;
    outcomes_skipped_equal_or_better_count: number;
    status: "success" | "failed" | "not_attempted" | "dry_run";
    error: string | null;
  };
  failures: {
    first_blocker: string | null;
    next_retry_suggestion: string | null;
  };
};

export type ScheduledOutcomeEvaluationAttempt = {
  id: string;
  contract_version: typeof SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION;
  attempt_fingerprint: string;
  owner_user_id: string;
  market_date: string;
  scheduled_slot_at: string;
  route_received_at: string;
  status: ScheduledOutcomeEvaluationAttemptStatus;
  request_json: Record<string, unknown>;
  receipt_json: ScheduledOutcomeEvaluationReceipt | null;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
};

type ReceiptInput = {
  attemptFingerprint: string;
  marketDate: string;
  scheduledSlotAt: string;
  routeReceivedAt: string;
  completedAt: string;
  routeVersion: string;
  selectedBatchFingerprint: string | null;
  run: Pick<
    RecommendationOutcomeEvaluationRun,
    | "run_version"
    | "status"
    | "provider"
    | "horizons"
    | "eligible_snapshot_count"
    | "evaluated_snapshot_count"
    | "incomplete_snapshot_count"
    | "missing_candle_count"
    | "provider_error_count"
    | "empty_candle_response_count"
    | "provider_limit_count"
    | "provider_budget_limit"
    | "candle_requests_planned"
    | "candle_requests_executed"
    | "candle_requests_saved_by_reuse"
  >;
  outcomesCreatedCount: number;
  outcomesUpdatedCount: number;
  outcomesSkippedEqualOrBetterCount: number;
  persistenceStatus: ScheduledOutcomeEvaluationReceipt["persistence"]["status"];
  persistenceError: string | null;
  firstBlocker: string | null;
  nextRetrySuggestion: string | null;
  decisionSnapshots?: Array<
    Pick<RecommendationSnapshot, "source_mode" | "payload_json">
  >;
};

function textOrNull(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function isoOrNull(value: unknown) {
  const text = textOrNull(value);
  if (!text) return null;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function nonNegativeInteger(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.floor(value);
}

function nullableNonNegativeInteger(value: unknown) {
  return value === null ? null : nonNegativeInteger(value);
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function validAttemptFingerprint(value: unknown) {
  const text = textOrNull(value);
  return text && /^[a-z0-9_]{12,200}$/.test(text) ? text : null;
}

function validMarketDate(value: unknown) {
  const text = textOrNull(value);
  return text && /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function validSlot(value: unknown) {
  const timestamp = isoOrNull(value);
  if (!timestamp) return null;

  const date = new Date(timestamp);
  return date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0 &&
    date.getUTCMinutes() % SCHEDULED_OUTCOME_EVALUATION_SLOT_MINUTES === 0
    ? timestamp
    : null;
}

function validTerminalStatus(value: unknown) {
  return value === "completed" || value === "partial" || value === "blocked" ||
      value === "failed"
    ? value
    : null;
}

function validPersistenceStatus(value: unknown) {
  return value === "success" || value === "failed" || value === "not_attempted" ||
      value === "dry_run"
    ? value
    : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function uniqueSortedStringArray(value: unknown) {
  if (!Array.isArray(value)) return null;

  const values = stringArray(value);
  if (
    values.length !== value.length ||
    values.length !== new Set(values).size ||
    values.some((entry, index) => index > 0 && values[index - 1]! >= entry)
  ) {
    return null;
  }

  return values;
}

function snapshotPayloadText(
  snapshot: Pick<RecommendationSnapshot, "payload_json">,
  key: string,
) {
  const payload = snapshot.payload_json;
  return payload && typeof payload === "object" && !Array.isArray(payload)
    ? textOrNull((payload as Record<string, unknown>)[key])
    : null;
}

function decisionLineage(
  snapshots: Array<Pick<RecommendationSnapshot, "source_mode" | "payload_json">>,
): ScheduledOutcomeEvaluationReceipt["decision_lineage"] {
  const policyVersions = snapshots
    .map((snapshot) => snapshotPayloadText(snapshot, "recommendation_publish_policy_version"))
    .filter((value): value is string => value !== null);
  const sourceModes = snapshots
    .map((snapshot) => textOrNull(snapshot.source_mode))
    .filter((value): value is string => value !== null);
  const marketDataSources = snapshots
    .map((snapshot) => snapshotPayloadText(snapshot, "market_data_source"))
    .filter((value): value is string => value !== null);
  const eligibleSnapshotCount = snapshots.length;
  const policyVersionedSnapshotCount = policyVersions.length;
  const missingPolicyVersionCount =
    eligibleSnapshotCount - policyVersionedSnapshotCount;
  const missingMarketDataSourceCount =
    eligibleSnapshotCount - marketDataSources.length;
  const uniquePolicyVersions = uniqueSorted(policyVersions);

  return {
    status:
      eligibleSnapshotCount === 0
        ? "unavailable"
        : missingPolicyVersionCount > 0 || missingMarketDataSourceCount > 0
          ? "incomplete"
          : uniquePolicyVersions.length === 1
            ? "complete"
            : "mixed",
    eligible_snapshot_count: eligibleSnapshotCount,
    policy_versioned_snapshot_count: policyVersionedSnapshotCount,
    missing_policy_version_count: missingPolicyVersionCount,
    recommendation_publish_policy_versions: uniquePolicyVersions,
    source_modes: uniqueSorted(sourceModes),
    market_data_sources: uniqueSorted(marketDataSources),
    missing_market_data_source_count: missingMarketDataSourceCount,
  };
}

/**
 * Maps a scheduler delivery to its intended quarter-hour slot. Re-deliveries
 * in the same slot therefore use the same durable claim and cannot restart
 * provider work after a first winner has claimed it.
 */
export function scheduledOutcomeEvaluationSlotStartedAt(now: Date) {
  const timestamp = now.getTime();
  if (!Number.isFinite(timestamp)) {
    throw new Error("Scheduled outcome evaluation slot requires a valid timestamp.");
  }

  const slotMilliseconds = SCHEDULED_OUTCOME_EVALUATION_SLOT_MINUTES * 60 * 1000;
  return new Date(Math.floor(timestamp / slotMilliseconds) * slotMilliseconds);
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

export function buildScheduledOutcomeEvaluationAttemptFingerprintForSlot(
  scheduledSlot: Date,
) {
  const slot = validSlot(scheduledSlot.toISOString());
  if (!slot) {
    throw new Error("Scheduled outcome evaluation fingerprint requires a quarter-hour slot.");
  }

  return `scheduled_outcome_evaluation_${stableHash(
    `netlify_scheduled_outcome_evaluation|${slot}`,
  )}`;
}

export function buildScheduledOutcomeEvaluationReceipt(
  input: ReceiptInput,
): ScheduledOutcomeEvaluationReceipt {
  const status = validTerminalStatus(input.run.status);
  if (!status) {
    throw new Error("A scheduled outcome-evaluation receipt requires a terminal status.");
  }

  const attemptFingerprint = validAttemptFingerprint(input.attemptFingerprint);
  const marketDate = validMarketDate(input.marketDate);
  const scheduledSlotAt = validSlot(input.scheduledSlotAt);
  const routeReceivedAt = isoOrNull(input.routeReceivedAt);
  const completedAt = isoOrNull(input.completedAt);
  const routeVersion = textOrNull(input.routeVersion);
  const persistenceStatus = validPersistenceStatus(input.persistenceStatus);

  if (
    !attemptFingerprint || !marketDate || !scheduledSlotAt || !routeReceivedAt ||
    !completedAt || !routeVersion || !persistenceStatus ||
    marketDate !== getNewYorkDateString(new Date(scheduledSlotAt))
  ) {
    throw new Error("Scheduled outcome-evaluation receipt input is invalid.");
  }

  const count = (value: unknown) => nonNegativeInteger(value) ?? 0;

  return {
    contract_version: SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION,
    attempt_fingerprint: attemptFingerprint,
    market_date: marketDate,
    scheduled_slot_at: scheduledSlotAt,
    route_received_at: routeReceivedAt,
    completed_at: completedAt,
    status,
    disposition: "research_only",
    evaluator: {
      route_version: routeVersion,
      runner_version: input.run.run_version,
      provider: textOrNull(input.run.provider),
      horizons: stringArray(input.run.horizons),
    },
    decision_lineage: decisionLineage(input.decisionSnapshots ?? []),
    scope: {
      selected_batch_fingerprint: textOrNull(input.selectedBatchFingerprint),
      eligible_snapshot_count: count(input.run.eligible_snapshot_count),
      evaluated_snapshot_count: count(input.run.evaluated_snapshot_count),
    },
    coverage: {
      incomplete_snapshot_count: count(input.run.incomplete_snapshot_count),
      missing_candle_count: count(input.run.missing_candle_count),
      provider_error_count: count(input.run.provider_error_count),
      empty_candle_response_count: count(input.run.empty_candle_response_count),
      provider_limit_count: count(input.run.provider_limit_count),
    },
    cost: {
      provider_budget_limit: nullableNonNegativeInteger(input.run.provider_budget_limit),
      candle_requests_planned: count(input.run.candle_requests_planned),
      candle_requests_executed: count(input.run.candle_requests_executed),
      candle_requests_saved_by_reuse: count(input.run.candle_requests_saved_by_reuse),
    },
    persistence: {
      outcomes_created_count: count(input.outcomesCreatedCount),
      outcomes_updated_count: count(input.outcomesUpdatedCount),
      outcomes_skipped_equal_or_better_count: count(
        input.outcomesSkippedEqualOrBetterCount,
      ),
      status: persistenceStatus,
      error: textOrNull(input.persistenceError),
    },
    failures: {
      first_blocker: textOrNull(input.firstBlocker),
      next_retry_suggestion: textOrNull(input.nextRetrySuggestion),
    },
  };
}

export function scheduledOutcomeEvaluationReceiptFromUnknown(value: unknown) {
  const raw = objectOrNull(value);
  if (
    !raw ||
    raw.contract_version !== SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION ||
    raw.disposition !== "research_only"
  ) {
    return null;
  }

  const attemptFingerprint = validAttemptFingerprint(raw.attempt_fingerprint);
  const marketDate = validMarketDate(raw.market_date);
  const scheduledSlotAt = validSlot(raw.scheduled_slot_at);
  const routeReceivedAt = isoOrNull(raw.route_received_at);
  const completedAt = isoOrNull(raw.completed_at);
  const status = validTerminalStatus(raw.status);
  const evaluator = objectOrNull(raw.evaluator);
  const decisionLineageRaw = objectOrNull(raw.decision_lineage);
  const scope = objectOrNull(raw.scope);
  const coverage = objectOrNull(raw.coverage);
  const cost = objectOrNull(raw.cost);
  const persistence = objectOrNull(raw.persistence);
  const failures = objectOrNull(raw.failures);
  const persistenceStatus = validPersistenceStatus(persistence?.status);
  const routeVersion = textOrNull(evaluator?.route_version);
  const runnerVersion = evaluator?.runner_version === "1.0" ? "1.0" : null;
  const decisionLineageStatus =
    decisionLineageRaw?.status === "unavailable" ||
    decisionLineageRaw?.status === "complete" ||
    decisionLineageRaw?.status === "mixed" ||
    decisionLineageRaw?.status === "incomplete"
      ? decisionLineageRaw.status
      : null;

  if (
    !attemptFingerprint || !marketDate || !scheduledSlotAt ||
    marketDate !== getNewYorkDateString(new Date(scheduledSlotAt)) ||
    !routeReceivedAt ||
    !completedAt || !status || !evaluator || !decisionLineageRaw || !scope || !coverage || !cost ||
    !persistence || !failures || !routeVersion || !runnerVersion || !persistenceStatus
  ) {
    return null;
  }

  const counts = [
    scope.eligible_snapshot_count,
    scope.evaluated_snapshot_count,
    coverage.incomplete_snapshot_count,
    coverage.missing_candle_count,
    coverage.provider_error_count,
    coverage.empty_candle_response_count,
    coverage.provider_limit_count,
    cost.candle_requests_planned,
    cost.candle_requests_executed,
    cost.candle_requests_saved_by_reuse,
    persistence.outcomes_created_count,
    persistence.outcomes_updated_count,
    persistence.outcomes_skipped_equal_or_better_count,
  ].map(nonNegativeInteger);
  if (counts.some((value) => value === null)) return null;

  const providerBudgetLimit = nullableNonNegativeInteger(cost.provider_budget_limit);
  if (cost.provider_budget_limit !== null && providerBudgetLimit === null) return null;

  const decisionLineageCounts = [
    decisionLineageRaw.eligible_snapshot_count,
    decisionLineageRaw.policy_versioned_snapshot_count,
    decisionLineageRaw.missing_policy_version_count,
    decisionLineageRaw.missing_market_data_source_count,
  ].map(nonNegativeInteger);
  const lineagePolicyVersions = uniqueSortedStringArray(
    decisionLineageRaw.recommendation_publish_policy_versions,
  );
  const lineageSourceModes = uniqueSortedStringArray(decisionLineageRaw.source_modes);
  const lineageMarketDataSources = uniqueSortedStringArray(
    decisionLineageRaw.market_data_sources,
  );
  if (
    !decisionLineageStatus ||
    !lineagePolicyVersions ||
    !lineageSourceModes ||
    !lineageMarketDataSources ||
    decisionLineageCounts.some((value) => value === null) ||
    decisionLineageCounts[0]! !==
      decisionLineageCounts[1]! + decisionLineageCounts[2]! ||
    decisionLineageCounts[0]! < decisionLineageCounts[3]! ||
    (decisionLineageStatus === "unavailable" &&
      (decisionLineageCounts[0] !== 0 ||
        lineagePolicyVersions.length > 0 ||
        lineageSourceModes.length > 0 ||
        lineageMarketDataSources.length > 0)) ||
    (decisionLineageCounts[0] !== 0 && lineageSourceModes.length === 0) ||
    (decisionLineageStatus === "complete" &&
      (decisionLineageCounts[2] !== 0 ||
        decisionLineageCounts[3] !== 0 ||
        lineagePolicyVersions.length !== 1 ||
        lineageMarketDataSources.length === 0)) ||
    (decisionLineageStatus === "mixed" &&
      (decisionLineageCounts[2] !== 0 ||
        decisionLineageCounts[3] !== 0 ||
        lineagePolicyVersions.length < 2 ||
        lineageMarketDataSources.length === 0))
  ) {
    return null;
  }

  return {
    contract_version: SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION,
    attempt_fingerprint: attemptFingerprint,
    market_date: marketDate,
    scheduled_slot_at: scheduledSlotAt,
    route_received_at: routeReceivedAt,
    completed_at: completedAt,
    status,
    disposition: "research_only",
    evaluator: {
      route_version: routeVersion,
      runner_version: runnerVersion,
      provider: textOrNull(evaluator.provider),
      horizons: stringArray(evaluator.horizons),
    },
    decision_lineage: {
      status: decisionLineageStatus,
      eligible_snapshot_count: decisionLineageCounts[0]!,
      policy_versioned_snapshot_count: decisionLineageCounts[1]!,
      missing_policy_version_count: decisionLineageCounts[2]!,
      recommendation_publish_policy_versions: lineagePolicyVersions,
      source_modes: lineageSourceModes,
      market_data_sources: lineageMarketDataSources,
      missing_market_data_source_count: decisionLineageCounts[3]!,
    },
    scope: {
      selected_batch_fingerprint: textOrNull(scope.selected_batch_fingerprint),
      eligible_snapshot_count: counts[0]!,
      evaluated_snapshot_count: counts[1]!,
    },
    coverage: {
      incomplete_snapshot_count: counts[2]!,
      missing_candle_count: counts[3]!,
      provider_error_count: counts[4]!,
      empty_candle_response_count: counts[5]!,
      provider_limit_count: counts[6]!,
    },
    cost: {
      provider_budget_limit: providerBudgetLimit,
      candle_requests_planned: counts[7]!,
      candle_requests_executed: counts[8]!,
      candle_requests_saved_by_reuse: counts[9]!,
    },
    persistence: {
      outcomes_created_count: counts[10]!,
      outcomes_updated_count: counts[11]!,
      outcomes_skipped_equal_or_better_count: counts[12]!,
      status: persistenceStatus,
      error: textOrNull(persistence.error),
    },
    failures: {
      first_blocker: textOrNull(failures.first_blocker),
      next_retry_suggestion: textOrNull(failures.next_retry_suggestion),
    },
  } satisfies ScheduledOutcomeEvaluationReceipt;
}

export function scheduledOutcomeEvaluationAttemptFromRow(value: unknown) {
  const raw = objectOrNull(value);
  if (!raw || raw.contract_version !== SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION) {
    return null;
  }

  const id = textOrNull(raw.id);
  const attemptFingerprint = validAttemptFingerprint(raw.attempt_fingerprint);
  const ownerUserId = textOrNull(raw.owner_user_id);
  const marketDate = validMarketDate(raw.market_date);
  const scheduledSlotAt = validSlot(raw.scheduled_slot_at);
  const routeReceivedAt = isoOrNull(raw.route_received_at);
  const status: ScheduledOutcomeEvaluationAttemptStatus | null =
    raw.status === "claimed" || validTerminalStatus(raw.status)
      ? (raw.status as ScheduledOutcomeEvaluationAttemptStatus)
      : null;
  const request = objectOrNull(raw.request_json);
  const receipt = scheduledOutcomeEvaluationReceiptFromUnknown(raw.receipt_json);
  const finalizedAt = raw.finalized_at === null ? null : isoOrNull(raw.finalized_at);
  const createdAt = isoOrNull(raw.created_at);
  const updatedAt = isoOrNull(raw.updated_at);
  const receiptMatchesAttempt = receipt !== null &&
    receipt.attempt_fingerprint === attemptFingerprint &&
    receipt.market_date === marketDate &&
    receipt.scheduled_slot_at === scheduledSlotAt &&
    receipt.route_received_at === routeReceivedAt &&
    receipt.completed_at === finalizedAt;
  const marketDateMatchesSlot = marketDate !== null &&
    scheduledSlotAt !== null &&
    marketDate === getNewYorkDateString(new Date(scheduledSlotAt));

  if (
    !id || !attemptFingerprint || !ownerUserId || !marketDate || !scheduledSlotAt ||
    !routeReceivedAt || !status || !request || !createdAt || !updatedAt ||
    !marketDateMatchesSlot ||
    (raw.finalized_at !== null && !finalizedAt) ||
    (status === "claimed"
      ? receipt !== null || finalizedAt !== null
      : !receiptMatchesAttempt)
  ) {
    return null;
  }

  return {
    id,
    contract_version: SCHEDULED_OUTCOME_EVALUATION_RECEIPT_VERSION,
    attempt_fingerprint: attemptFingerprint,
    owner_user_id: ownerUserId,
    market_date: marketDate,
    scheduled_slot_at: scheduledSlotAt,
    route_received_at: routeReceivedAt,
    status,
    request_json: request,
    receipt_json: receipt,
    finalized_at: finalizedAt,
    created_at: createdAt,
    updated_at: updatedAt,
  } satisfies ScheduledOutcomeEvaluationAttempt;
}
