export const BASIC_FREE_SCHEDULED_OUTCOME_CAPACITY_VERSION =
  "basic_free_scheduled_outcome_capacity_v1" as const;

export const BASIC_FREE_SCHEDULED_OUTCOME_MAX_CANDLE_REQUESTS = 4;

// One outcome candle request is shared across every due horizon for one
// snapshot. Keeping the scheduled snapshot cap equal to the provider-request
// ceiling prevents the runner from selecting work that the same slot cannot
// possibly request under Basic Free.
export const BASIC_FREE_SCHEDULED_OUTCOME_MAX_SNAPSHOTS_PER_RUN =
  BASIC_FREE_SCHEDULED_OUTCOME_MAX_CANDLE_REQUESTS;

type CapacityInput = Readonly<{
  backlog_snapshot_count_before_run: number;
  backlog_snapshot_count_after_run: number;
  runner_selected_snapshot_count: number;
  snapshot_cap_deferred_count: number;
  provider_budget_deferred_snapshot_count: number;
  provider_requests_used: number;
  max_snapshots_per_run: number;
  provider_request_budget: number;
}>;

function nonNegativeInteger(value: number) {
  return Number.isInteger(value) && value >= 0;
}

export function buildBasicFreeScheduledOutcomeCapacityReceipt(
  input: CapacityInput,
) {
  const values = Object.values(input);
  const inputValid =
    values.every(nonNegativeInteger) &&
    input.backlog_snapshot_count_after_run <=
      input.backlog_snapshot_count_before_run &&
    input.runner_selected_snapshot_count <= input.max_snapshots_per_run &&
    input.provider_requests_used <= input.provider_request_budget &&
    input.snapshot_cap_deferred_count ===
      Math.max(
        0,
        input.backlog_snapshot_count_before_run -
          input.runner_selected_snapshot_count,
      ) &&
    input.provider_budget_deferred_snapshot_count <=
      input.runner_selected_snapshot_count;
  const capacityAligned =
    input.max_snapshots_per_run <= input.provider_request_budget;
  const effectivePerSlotCapacity = Math.min(
    input.max_snapshots_per_run,
    input.provider_request_budget,
  );

  return Object.freeze({
    capacity_version: BASIC_FREE_SCHEDULED_OUTCOME_CAPACITY_VERSION,
    status: !inputValid
      ? ("invalid" as const)
      : input.backlog_snapshot_count_after_run === 0
        ? ("complete" as const)
        : effectivePerSlotCapacity === 0
          ? ("blocked_zero_capacity" as const)
          : capacityAligned
            ? ("backlog_remaining_capacity_aligned" as const)
            : ("backlog_remaining_capacity_misaligned" as const),
    input_valid: inputValid,
    capacity_aligned: capacityAligned,
    effective_snapshot_capacity_per_slot: effectivePerSlotCapacity,
    completed_backlog_snapshot_count: inputValid
      ? input.backlog_snapshot_count_before_run -
        input.backlog_snapshot_count_after_run
      : null,
    ...input,
  });
}
