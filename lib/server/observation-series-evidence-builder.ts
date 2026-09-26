import type {
  ObservationCycleReadback,
  ObservationCycleReceipt,
} from "@/lib/observation-cycle-receipt";
import {
  buildObservationSeriesRuntimeAdmission,
  OBSERVATION_SERIES_MAX_CONSECUTIVE_FAILURES,
  OBSERVATION_SERIES_PROVIDER_CREDITS_PER_ATTEMPT,
  type ObservationSeriesControl,
} from "@/lib/observation-series-control";
import {
  OBSERVATION_SERIES_EVIDENCE_READBACK_VERSION,
  unavailableObservationSeriesEvidenceReadback,
  type ObservationSeriesEvidenceReadback,
  type ObservationSeriesOperationalClassification,
} from "@/lib/observation-series-evidence";
import {
  scheduledScanInvocationReceiptFromAttempt,
  type ScheduledScanInvocationReceipt,
} from "@/lib/scheduled-scan-invocation-receipt";

export const OBSERVATION_SERIES_EVIDENCE_RECEIPT_GRACE_MS = 90_000;

type AttemptEvidence = Readonly<{
  attempt_fingerprint: string;
  invocation: ScheduledScanInvocationReceipt;
}>;

const attemptFingerprintPattern = /^[a-z0-9_:.-]{12,240}$/;

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

function unique(values: readonly string[]) {
  return [...new Set(values)];
}

function inertAuthority() {
  return Object.freeze({
    arms_scheduler: false as const,
    calls_provider: false as const,
    reserves_provider_credits: false as const,
    changes_ranking: false as const,
    publishes_candidate: false as const,
    executes_paper_trade: false as const,
    executes_broker_order: false as const,
  });
}

function attemptEvidenceFromUnknown(value: unknown): AttemptEvidence | null {
  const row = objectOrNull(value);
  const attemptFingerprint = textOrNull(row?.attempt_fingerprint)?.toLowerCase();
  const invocation = scheduledScanInvocationReceiptFromAttempt({
    source: row?.source,
    mode: row?.mode,
    payload: row?.payload_json,
  });
  if (
    !row ||
    !attemptFingerprint ||
    !attemptFingerprintPattern.test(attemptFingerprint) ||
    !invocation
  ) {
    return null;
  }
  return Object.freeze({ attempt_fingerprint: attemptFingerprint, invocation });
}

function withinSeries(
  receipt: ObservationCycleReceipt,
  control: ObservationSeriesControl,
) {
  const slot = receipt.trigger.scheduled_slot_started_at_utc;
  return Boolean(
    slot &&
      control.starts_at_utc &&
      control.expires_at_utc &&
      Date.parse(slot) >= Date.parse(control.starts_at_utc) &&
      Date.parse(slot) < Date.parse(control.expires_at_utc),
  );
}

function consecutiveFailures(receipts: readonly ObservationCycleReceipt[]) {
  let count = 0;
  for (const receipt of receipts) {
    if (receipt.cycle_status !== "failed") break;
    count += 1;
  }
  return count;
}

function sum(
  receipts: readonly ObservationCycleReceipt[],
  read: (receipt: ObservationCycleReceipt) => number,
) {
  return receipts.reduce((total, receipt) => total + read(receipt), 0);
}

export function buildObservationSeriesEvidenceReadback({
  ownerUserId,
  control,
  scheduledAttemptRows,
  observationCycleReadback,
  now,
}: {
  ownerUserId: string;
  control: ObservationSeriesControl;
  scheduledAttemptRows: readonly unknown[];
  observationCycleReadback: ObservationCycleReadback | null;
  now: Date;
}): ObservationSeriesEvidenceReadback {
  if (
    control.status !== "ready" ||
    !control.series_id ||
    !control.trading_date ||
    !control.starts_at_utc ||
    !control.expires_at_utc ||
    !control.max_attempts ||
    !control.max_provider_credits
  ) {
    return unavailableObservationSeriesEvidenceReadback(
      "observation_series_control_invalid",
    );
  }
  if (!observationCycleReadback || observationCycleReadback.status !== "available") {
    return unavailableObservationSeriesEvidenceReadback(
      "observation_series_cycle_history_unavailable",
    );
  }
  if (!Number.isFinite(now.getTime())) {
    return unavailableObservationSeriesEvidenceReadback(
      "observation_series_evaluation_time_invalid",
    );
  }

  const parsedAttempts = scheduledAttemptRows.map(attemptEvidenceFromUnknown);
  const validAttempts = parsedAttempts.filter(
    (attempt): attempt is AttemptEvidence => attempt !== null,
  );
  if (validAttempts.length === 0) {
    return unavailableObservationSeriesEvidenceReadback(
      "observation_series_attempt_history_empty",
    );
  }

  const orderedAttempts = [...validAttempts].sort((first, second) =>
    first.invocation.scheduled_slot_started_at_utc.localeCompare(
      second.invocation.scheduled_slot_started_at_utc,
    ),
  );
  const latestAttempt = orderedAttempts.at(-1)!;
  const latestPayload = latestAttempt.invocation.durable_invocation_payload;
  const receipts = observationCycleReadback.receipts
    .filter((receipt) => withinSeries(receipt, control))
    .sort((first, second) =>
      (second.trigger.scheduled_slot_started_at_utc ?? second.trigger.occurred_at)
        .localeCompare(
          first.trigger.scheduled_slot_started_at_utc ?? first.trigger.occurred_at,
        ),
    );
  const runtimeAdmission = buildObservationSeriesRuntimeAdmission({
    control,
    schedulerControl: latestPayload.observation_series_control,
    schedulerSlotAdmission: latestPayload.observation_series_slot_admission,
    scheduledSlotStartedAtUtc:
      latestAttempt.invocation.scheduled_slot_started_at_utc,
    now,
    ownerUserId,
    readback: observationCycleReadback,
    scheduledAttemptRows,
    currentAttemptFingerprint: latestAttempt.attempt_fingerprint,
    perAttemptProviderCredits: OBSERVATION_SERIES_PROVIDER_CREDITS_PER_ATTEMPT,
  });

  const attemptsByFingerprint = new Map(
    validAttempts.map((attempt) => [attempt.attempt_fingerprint, attempt]),
  );
  const receiptsByFingerprint = new Map<string, ObservationCycleReceipt[]>();
  for (const receipt of receipts) {
    const existing =
      receiptsByFingerprint.get(receipt.source_attempt_fingerprint) ?? [];
    existing.push(receipt);
    receiptsByFingerprint.set(receipt.source_attempt_fingerprint, existing);
  }
  const missingReceipts = validAttempts.filter(
    (attempt) => !receiptsByFingerprint.has(attempt.attempt_fingerprint),
  ).length;
  const orphanReceipts = receipts.filter(
    (receipt) => !attemptsByFingerprint.has(receipt.source_attempt_fingerprint),
  ).length;
  const duplicateReceipts = [...receiptsByFingerprint.values()].reduce(
    (count, matches) => count + Math.max(0, matches.length - 1),
    0,
  );
  const activeCycles = receipts.filter(
    (receipt) => receipt.cycle_status === "active",
  );
  const failureChain = consecutiveFailures(receipts);
  const admittedCurrentDataCycles = receipts.filter(
    (receipt) =>
      receipt.admission.policy_receipt?.decision === "request_current_data",
  ).length;
  const reservedProviderCredits = sum(
    receipts,
    (receipt) => receipt.provider_request.reserved_credits,
  );
  const publishedRecommendations = sum(
    receipts,
    (receipt) => receipt.publication.published_count,
  );
  const latestReceipt = receiptsByFingerprint.get(
    latestAttempt.attempt_fingerprint,
  )?.[0];
  const currentReceiptMissing = !latestReceipt;
  const priorMissingReceipts = validAttempts.filter(
    (attempt) =>
      attempt.attempt_fingerprint !== latestAttempt.attempt_fingerprint &&
      !receiptsByFingerprint.has(attempt.attempt_fingerprint),
  ).length;
  const latestEvidenceTimestamp = latestReceipt?.trigger.route_received_at ??
    latestAttempt.invocation.scheduled_slot_started_at_utc;
  const withinReceiptGrace =
    now.getTime() - Date.parse(latestEvidenceTimestamp) <=
    OBSERVATION_SERIES_EVIDENCE_RECEIPT_GRACE_MS;
  const activeWithinGrace = activeCycles.every(
    (receipt) =>
      now.getTime() - Date.parse(receipt.trigger.route_received_at) <=
      OBSERVATION_SERIES_EVIDENCE_RECEIPT_GRACE_MS,
  );
  const lineageInvalid =
    parsedAttempts.some((attempt) => attempt === null) ||
    runtimeAdmission.decision === "reject" ||
    runtimeAdmission.status === "series_history_unavailable" ||
    runtimeAdmission.status === "series_history_invalid" ||
    runtimeAdmission.status === "scheduler_series_identity_mismatch" ||
    priorMissingReceipts > 0 ||
    (currentReceiptMissing && !withinReceiptGrace) ||
    orphanReceipts > 0 ||
    duplicateReceipts > 0;
  const terminalReason = lineageInvalid
    ? ("evidence_invalid" as const)
    : publishedRecommendations > 0
      ? ("publication_observed" as const)
      : failureChain >= OBSERVATION_SERIES_MAX_CONSECUTIVE_FAILURES
        ? ("failure_stop_reached" as const)
        : admittedCurrentDataCycles >= control.max_attempts
          ? ("attempt_cap_reached" as const)
          : reservedProviderCredits >= control.max_provider_credits
            ? ("credit_cap_reached" as const)
            : now.getTime() >= Date.parse(control.expires_at_utc)
              ? ("expired" as const)
              : ("not_terminal" as const);
  const classification: ObservationSeriesOperationalClassification =
    lineageInvalid
      ? "fail"
      : missingReceipts > 0 || activeCycles.length > 0
        ? withinReceiptGrace && activeWithinGrace
          ? "in_progress"
          : "fail"
        : terminalReason === "not_terminal"
          ? "in_progress"
          : "pass";
  const operationalReasons = unique([
    runtimeAdmission.status,
    terminalReason,
    ...(parsedAttempts.some((attempt) => attempt === null)
      ? ["series_attempt_lineage_invalid"]
      : []),
    ...(missingReceipts > 0 ? ["series_attempt_receipt_missing"] : []),
    ...(orphanReceipts > 0 ? ["series_receipt_orphaned"] : []),
    ...(duplicateReceipts > 0 ? ["series_attempt_receipt_duplicate"] : []),
    ...(activeCycles.length > 0 ? ["series_active_cycle_unresolved"] : []),
  ]);
  const completedEvaluationCycles = receipts.filter(
    (receipt) =>
      receipt.cycle_status === "completed" &&
      (receipt.disposition === "evaluated" ||
        receipt.disposition === "no_trade" ||
        receipt.disposition === "published"),
  ).length;
  const qualityClassification =
    completedEvaluationCycles === 0
      ? ("not_evaluated" as const)
      : ("insufficient_forward_evidence" as const);
  const evidenceGaps = unique([
    completedEvaluationCycles === 0
      ? "no_completed_evaluation_cycle"
      : "single_observation_series_cannot_establish_strategy_quality",
    "baseline_comparison_not_part_of_series_delivery",
    "outcome_quality_not_part_of_series_delivery",
    ...(sum(receipts, (receipt) => receipt.discovery_evaluation.raw_candidate_count) ===
    0
      ? ["candidate_quality_not_observed"]
      : []),
  ]);

  return Object.freeze({
    readback_version: OBSERVATION_SERIES_EVIDENCE_READBACK_VERSION,
    status: "available",
    reason_codes: Object.freeze(["observation_series_evidence_available"]),
    series: Object.freeze({
      series_id: control.series_id,
      control_version: control.control_version,
      trading_date: control.trading_date,
      starts_at_utc: control.starts_at_utc,
      expires_at_utc: control.expires_at_utc,
      max_attempts: control.max_attempts,
      max_provider_credits: control.max_provider_credits,
      evaluated_at: now.toISOString(),
      build_deployment_identity:
        latestAttempt.invocation.build_deployment_identity,
      operational: Object.freeze({
        classification,
        terminal_reason: terminalReason,
        lineage_status: lineageInvalid ? "invalid" : "attributed",
        reason_codes: Object.freeze(operationalReasons),
      }),
      counts: Object.freeze({
        scheduled_attempts: scheduledAttemptRows.length,
        attributed_receipts: receipts.length - orphanReceipts,
        missing_receipts: missingReceipts,
        orphan_receipts: orphanReceipts,
        duplicate_receipts: duplicateReceipts,
        active_cycles: activeCycles.length,
        completed_cycles: receipts.filter(
          (receipt) => receipt.cycle_status === "completed",
        ).length,
        rejected_cycles: receipts.filter(
          (receipt) => receipt.cycle_status === "rejected",
        ).length,
        failed_cycles: receipts.filter(
          (receipt) => receipt.cycle_status === "failed",
        ).length,
        consecutive_failures: failureChain,
        admitted_current_data_cycles: admittedCurrentDataCycles,
        provider_attempted_cycles: receipts.filter(
          (receipt) => receipt.provider_request.status === "attempted",
        ).length,
        reserved_provider_credits: reservedProviderCredits,
        provider_successes: sum(
          receipts,
          (receipt) => receipt.provider_response.success_count,
        ),
        provider_errors: sum(
          receipts,
          (receipt) => receipt.provider_response.error_count,
        ),
        stale_inputs: sum(receipts, (receipt) => receipt.freshness.stale_count),
        raw_candidates: sum(
          receipts,
          (receipt) => receipt.discovery_evaluation.raw_candidate_count,
        ),
        ranked_candidates: sum(
          receipts,
          (receipt) => receipt.discovery_evaluation.ranked_count,
        ),
        selected_candidates: sum(
          receipts,
          (receipt) => receipt.discovery_evaluation.selected_count,
        ),
        built_recommendations: sum(
          receipts,
          (receipt) => receipt.discovery_evaluation.built_count,
        ),
        published_recommendations: publishedRecommendations,
        no_trade_cycles: receipts.filter(
          (receipt) => receipt.disposition === "no_trade",
        ).length,
      }),
      quality: Object.freeze({
        classification: qualityClassification,
        completed_evaluation_cycles: completedEvaluationCycles,
        published_recommendations: publishedRecommendations,
        evidence_gaps: Object.freeze(evidenceGaps),
      }),
      authority: inertAuthority(),
    }),
  });
}
