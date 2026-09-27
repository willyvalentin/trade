import {
  basicFreeScheduledScanCreditReadbackFromScheduledAttempt,
  type BasicFreeScheduledScanCreditReadback,
} from "@/lib/basic-free-scheduled-scan-credit-readback";
import {
  observationCycleReceiptFromUnknown,
  type ObservationCycleReceipt,
} from "@/lib/observation-cycle-receipt";

export type ScannerClockPriorShadowForwardRuntimeEvidence = Readonly<{
  receipt: ObservationCycleReceipt;
  credit_readback: BasicFreeScheduledScanCreditReadback;
}>;

export function buildScannerClockPriorShadowForwardRuntimeEvidence(input: {
  ownerUserId: string;
  observationCycleRows: Record<string, unknown>[];
  scheduledAttemptRows: Record<string, unknown>[];
}):
  | {
      status: "available";
      evidence: ScannerClockPriorShadowForwardRuntimeEvidence[];
      scheduled_observation_cycle_count: number;
      linked_scheduled_attempt_count: number;
      safe_blocker: null;
    }
  | {
      status: "failed";
      evidence: null;
      scheduled_observation_cycle_count: 0;
      linked_scheduled_attempt_count: 0;
      safe_blocker: string;
    } {
  const parsedObservationCycles = input.observationCycleRows.map((row) => ({
    row,
    receipt: observationCycleReceiptFromUnknown(row.receipt_json),
  }));
  if (parsedObservationCycles.some(({ row, receipt }) =>
    receipt === null ||
    receipt.owner_user_id !== input.ownerUserId ||
    row.owner_user_id !== receipt.owner_user_id ||
    row.source_attempt_fingerprint !== receipt.source_attempt_fingerprint ||
    (row.scan_run_fingerprint ?? null) !== receipt.scan_run_fingerprint
  )) {
    return {
      status: "failed",
      evidence: null,
      scheduled_observation_cycle_count: 0,
      linked_scheduled_attempt_count: 0,
      safe_blocker: "clock_prior_forward_runtime_receipt_malformed_or_unbound",
    };
  }
  const scheduledObservationCycles = parsedObservationCycles.flatMap(
    ({ receipt }) =>
      receipt?.trigger.kind === "netlify_schedule" ? [receipt] : [],
  );
  const attemptFingerprints = new Set(
    scheduledObservationCycles.map(
      (receipt) => receipt.source_attempt_fingerprint,
    ),
  );
  const linkedScheduledAttemptRows = input.scheduledAttemptRows.filter((row) =>
    typeof row.attempt_fingerprint === "string" &&
    attemptFingerprints.has(row.attempt_fingerprint)
  );
  const attemptRowsByFingerprint = new Map<string, Record<string, unknown>[]>();
  for (const row of linkedScheduledAttemptRows) {
    const fingerprint = row.attempt_fingerprint as string;
    attemptRowsByFingerprint.set(fingerprint, [
      ...(attemptRowsByFingerprint.get(fingerprint) ?? []),
      row,
    ]);
  }
  if ([...attemptRowsByFingerprint.values()].some((values) => values.length > 1)) {
    return {
      status: "failed",
      evidence: null,
      scheduled_observation_cycle_count: 0,
      linked_scheduled_attempt_count: 0,
      safe_blocker: "clock_prior_forward_scheduled_attempt_ambiguous",
    };
  }
  return {
    status: "available",
    evidence: scheduledObservationCycles.map((receipt) => ({
      receipt,
      credit_readback: basicFreeScheduledScanCreditReadbackFromScheduledAttempt(
        attemptRowsByFingerprint.get(receipt.source_attempt_fingerprint)?.[0] ??
          {},
      ),
    })),
    scheduled_observation_cycle_count: scheduledObservationCycles.length,
    linked_scheduled_attempt_count: linkedScheduledAttemptRows.length,
    safe_blocker: null,
  };
}
