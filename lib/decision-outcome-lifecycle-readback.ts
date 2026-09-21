import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { ScheduledOutcomeEvaluationAttempt } from "@/lib/scheduled-outcome-evaluation-receipt";

export const DECISION_OUTCOME_LIFECYCLE_READBACK_VERSION =
  "decision_outcome_lifecycle_readback_v1" as const;

export type DecisionOutcomeLifecycleReadbackStatus =
  | "no_retained_decision"
  | "decision_without_retained_snapshots"
  | "decision_retained_outcome_not_attempted"
  | "decision_retained_outcome_pending"
  | "decision_retained_outcome_unproven"
  | "decision_retained_outcome_evidence";

export type DecisionOutcomeLifecycleReadback = {
  contract_version: typeof DECISION_OUTCOME_LIFECYCLE_READBACK_VERSION;
  status: DecisionOutcomeLifecycleReadbackStatus;
  decision: {
    scan_run_fingerprint: string | null;
    observed_at: string | null;
    data_mode: string | null;
    candidate_decision_record_status: "available" | "missing";
    retained_snapshot_count: number;
    research_only_snapshot_count: number;
    learning_only_snapshot_count: number;
    visible_snapshot_count: number;
    identity_conflict_excluded_snapshot_count: number;
  };
  outcome_evidence: {
    linked_outcome_count: number;
    complete_linked_outcome_count: number;
    retained_scheduled_evaluation_attempt_count: number;
    latest_scheduled_evaluation_status:
      | ScheduledOutcomeEvaluationAttempt["status"]
      | null;
    latest_scheduled_evaluation_slot_at: string | null;
    scheduled_receipt_attribution:
      | "no_retained_attempt"
      | "not_decision_attributable";
  };
  blockers: string[];
};

type LifecycleScanRun = Pick<
  RecommendationScanRun,
  | "id"
  | "run_fingerprint"
  | "trading_date"
  | "window"
  | "observed_at"
  | "data_mode"
  | "payload_json"
>;

type LifecycleSnapshot = Pick<
  RecommendationSnapshot,
  | "scan_run_id"
  | "snapshot_fingerprint"
  | "source_mode"
  | "data_mode"
  | "is_visible"
  | "status"
  | "payload_json"
>;

type LifecycleOutcome = Pick<
  RecommendationOutcome,
  "id" | "snapshot_fingerprint" | "data_completeness"
>;

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isoOrNull(value: unknown) {
  const text = textOrNull(value);
  if (!text || !Number.isFinite(Date.parse(text))) return null;
  return new Date(text).toISOString();
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    Number.isInteger(value)
    ? value
    : null;
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function scanRunFingerprintFromSnapshot(snapshot: LifecycleSnapshot) {
  const direct = textOrNull(snapshot.scan_run_id);
  const payload = objectOrNull(snapshot.payload_json);
  const payloadFingerprint = textOrNull(payload?.scan_run_fingerprint);

  if (direct && payloadFingerprint && direct !== payloadFingerprint) {
    return { fingerprint: null, identityConflict: true };
  }

  return {
    fingerprint: direct ?? payloadFingerprint,
    identityConflict: false,
  };
}

function isResearchOnlySnapshot(snapshot: LifecycleSnapshot) {
  const payload = snapshot.payload_json;

  return (
    snapshot.source_mode === "research_only" ||
    snapshot.data_mode === "research_only" ||
    payload.visibility_status === "research_only" ||
    payload.learning_acceleration_sample === true ||
    payload.research_only === true ||
    payload.source_mode === "research_only" ||
    payload.learning_scope === "research_only"
  );
}

function isLearningOnlySnapshot(snapshot: LifecycleSnapshot) {
  const payload = snapshot.payload_json;

  return (
    snapshot.source_mode === "learning_only" ||
    snapshot.data_mode === "learning_only" ||
    snapshot.is_visible === false ||
    snapshot.status === "hidden" ||
    payload.learning_only === true ||
    payload.source_mode === "learning_only" ||
    payload.visible_in_primary_recommendations === false ||
    payload.grow_max_learning_mode === true
  );
}

function recencyTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

function latestAttempt(
  attempts: ScheduledOutcomeEvaluationAttempt[],
): ScheduledOutcomeEvaluationAttempt | null {
  return [...attempts].sort(
    (first, second) =>
      recencyTimestamp(second.scheduled_slot_at) -
      recencyTimestamp(first.scheduled_slot_at),
  )[0] ?? null;
}

function retainedDecisionDefaults() {
  return {
    scan_run_fingerprint: null,
    observed_at: null,
    data_mode: null,
    candidate_decision_record_status: "missing" as const,
    retained_snapshot_count: 0,
    research_only_snapshot_count: 0,
    learning_only_snapshot_count: 0,
    visible_snapshot_count: 0,
    identity_conflict_excluded_snapshot_count: 0,
  };
}

/**
 * Produces a bounded, owner-scoped lifecycle readback. Scan and snapshot
 * identities must agree exactly; outcome rows are only attributed through a
 * persisted snapshot fingerprint. A scheduled receipt has no decision
 * fingerprint today, so it remains explicitly non-attributable here.
 */
export function buildDecisionOutcomeLifecycleReadback({
  scanRuns,
  snapshots,
  outcomes,
  scheduledEvaluationAttempts,
}: {
  scanRuns: LifecycleScanRun[];
  snapshots: LifecycleSnapshot[];
  outcomes: LifecycleOutcome[];
  scheduledEvaluationAttempts: ScheduledOutcomeEvaluationAttempt[];
}): DecisionOutcomeLifecycleReadback {
  const validScanRuns = scanRuns
    .filter(
      (scanRun) =>
        textOrNull(scanRun.id) !== null &&
        textOrNull(scanRun.run_fingerprint) !== null &&
        isoOrNull(scanRun.observed_at) !== null,
    )
    .sort(
      (first, second) =>
        recencyTimestamp(second.observed_at) - recencyTimestamp(first.observed_at),
    );
  const latestScheduledEvaluationAttempt = latestAttempt(
    scheduledEvaluationAttempts,
  );
  const scheduledEvidence = {
    retained_scheduled_evaluation_attempt_count:
      scheduledEvaluationAttempts.length,
    latest_scheduled_evaluation_status:
      latestScheduledEvaluationAttempt?.status ?? null,
    latest_scheduled_evaluation_slot_at:
      latestScheduledEvaluationAttempt?.scheduled_slot_at ?? null,
    scheduled_receipt_attribution: latestScheduledEvaluationAttempt
      ? ("not_decision_attributable" as const)
      : ("no_retained_attempt" as const),
  };

  if (validScanRuns.length === 0) {
    return {
      contract_version: DECISION_OUTCOME_LIFECYCLE_READBACK_VERSION,
      status: "no_retained_decision",
      decision: retainedDecisionDefaults(),
      outcome_evidence: {
        linked_outcome_count: 0,
        complete_linked_outcome_count: 0,
        ...scheduledEvidence,
      },
      blockers: ["retained_scan_run_missing"],
    };
  }

  const snapshotsByFingerprint = new Map<
    string,
    { snapshots: LifecycleSnapshot[]; identityConflictCount: number }
  >();
  for (const snapshot of snapshots) {
    const scanIdentity = scanRunFingerprintFromSnapshot(snapshot);
    if (scanIdentity.identityConflict) {
      const direct = textOrNull(snapshot.scan_run_id);
      const payloadFingerprint = textOrNull(
        objectOrNull(snapshot.payload_json)?.scan_run_fingerprint,
      );
      for (const fingerprint of [direct, payloadFingerprint]) {
        if (!fingerprint) continue;
        const existing = snapshotsByFingerprint.get(fingerprint) ?? {
          snapshots: [],
          identityConflictCount: 0,
        };
        existing.identityConflictCount += 1;
        snapshotsByFingerprint.set(fingerprint, existing);
      }
      continue;
    }
    if (!scanIdentity.fingerprint) continue;

    const existing = snapshotsByFingerprint.get(scanIdentity.fingerprint) ?? {
      snapshots: [],
      identityConflictCount: 0,
    };
    existing.snapshots.push(snapshot);
    snapshotsByFingerprint.set(scanIdentity.fingerprint, existing);
  }

  const selectedScanRun =
    validScanRuns.find(
      (scanRun) =>
        (snapshotsByFingerprint.get(scanRun.run_fingerprint)?.snapshots.length ?? 0) >
        0,
    ) ?? validScanRuns[0]!;
  const selectedSnapshotGroup = snapshotsByFingerprint.get(
    selectedScanRun.run_fingerprint,
  ) ?? { snapshots: [], identityConflictCount: 0 };
  const selectedSnapshots = Array.from(
    new Map(
      selectedSnapshotGroup.snapshots
        .filter((snapshot) => textOrNull(snapshot.snapshot_fingerprint) !== null)
        .map((snapshot) => [snapshot.snapshot_fingerprint.trim(), snapshot]),
    ).values(),
  );
  const snapshotFingerprints = new Set(
    selectedSnapshots.map((snapshot) => snapshot.snapshot_fingerprint.trim()),
  );
  const linkedOutcomes = Array.from(
    new Map(
      outcomes
        .filter((outcome) => {
          const fingerprint = textOrNull(outcome.snapshot_fingerprint);
          return fingerprint !== null && snapshotFingerprints.has(fingerprint);
        })
        .map((outcome) => [outcome.id, outcome]),
    ).values(),
  );
  const decision = {
    scan_run_fingerprint: selectedScanRun.run_fingerprint,
    observed_at: isoOrNull(selectedScanRun.observed_at),
    data_mode: textOrNull(selectedScanRun.data_mode),
    candidate_decision_record_status: candidateDecisionRecordFromScanRun(
      selectedScanRun,
    )
      ? ("available" as const)
      : ("missing" as const),
    retained_snapshot_count: selectedSnapshots.length,
    research_only_snapshot_count: selectedSnapshots.filter(
      isResearchOnlySnapshot,
    ).length,
    learning_only_snapshot_count: selectedSnapshots.filter(
      isLearningOnlySnapshot,
    ).length,
    visible_snapshot_count: selectedSnapshots.filter(
      (snapshot) => snapshot.is_visible === true && snapshot.status === "visible",
    ).length,
    identity_conflict_excluded_snapshot_count:
      selectedSnapshotGroup.identityConflictCount,
  };
  const outcomeEvidence = {
    linked_outcome_count: linkedOutcomes.length,
    complete_linked_outcome_count: linkedOutcomes.filter(
      (outcome) => outcome.data_completeness === "complete",
    ).length,
    ...scheduledEvidence,
  };

  if (selectedSnapshots.length === 0) {
    return {
      contract_version: DECISION_OUTCOME_LIFECYCLE_READBACK_VERSION,
      status: "decision_without_retained_snapshots",
      decision,
      outcome_evidence: outcomeEvidence,
      blockers: ["decision_snapshot_link_missing"],
    };
  }

  if (linkedOutcomes.length > 0) {
    return {
      contract_version: DECISION_OUTCOME_LIFECYCLE_READBACK_VERSION,
      status: "decision_retained_outcome_evidence",
      decision,
      outcome_evidence: outcomeEvidence,
      blockers:
        outcomeEvidence.complete_linked_outcome_count === linkedOutcomes.length
          ? []
          : ["linked_outcome_coverage_incomplete"],
    };
  }

  if (!latestScheduledEvaluationAttempt) {
    return {
      contract_version: DECISION_OUTCOME_LIFECYCLE_READBACK_VERSION,
      status: "decision_retained_outcome_not_attempted",
      decision,
      outcome_evidence: outcomeEvidence,
      blockers: [
        "linked_outcome_rows_missing",
        "scheduled_outcome_evaluation_attempt_missing",
      ],
    };
  }

  if (latestScheduledEvaluationAttempt.status === "claimed") {
    return {
      contract_version: DECISION_OUTCOME_LIFECYCLE_READBACK_VERSION,
      status: "decision_retained_outcome_pending",
      decision,
      outcome_evidence: outcomeEvidence,
      blockers: ["linked_outcome_rows_missing"],
    };
  }

  return {
    contract_version: DECISION_OUTCOME_LIFECYCLE_READBACK_VERSION,
    status: "decision_retained_outcome_unproven",
    decision,
    outcome_evidence: outcomeEvidence,
    blockers: [
      "linked_outcome_rows_missing",
      "scheduled_receipt_not_decision_attributable",
    ],
  };
}

const lifecycleStatuses: DecisionOutcomeLifecycleReadbackStatus[] = [
  "no_retained_decision",
  "decision_without_retained_snapshots",
  "decision_retained_outcome_not_attempted",
  "decision_retained_outcome_pending",
  "decision_retained_outcome_unproven",
  "decision_retained_outcome_evidence",
];

const scheduledAttemptStatuses: ScheduledOutcomeEvaluationAttempt["status"][] = [
  "claimed",
  "completed",
  "partial",
  "blocked",
  "failed",
];

/**
 * Dashboard JSON is untrusted once it reaches the browser. Keep the client
 * fail-closed: only the exact, bounded server DTO is rendered as lifecycle
 * evidence.
 */
export function decisionOutcomeLifecycleReadbackFromUnknown(
  value: unknown,
): DecisionOutcomeLifecycleReadback | null {
  const readback = objectOrNull(value);
  const decision = objectOrNull(readback?.decision);
  const outcomeEvidence = objectOrNull(readback?.outcome_evidence);
  const blockers = Array.isArray(readback?.blockers)
    ? readback.blockers
    : null;
  const status = readback?.status;
  const attemptStatus = outcomeEvidence?.latest_scheduled_evaluation_status;

  if (
    readback?.contract_version !== DECISION_OUTCOME_LIFECYCLE_READBACK_VERSION ||
    !lifecycleStatuses.includes(status as DecisionOutcomeLifecycleReadbackStatus) ||
    !decision ||
    !outcomeEvidence ||
    blockers === null ||
    blockers.some((blocker) => textOrNull(blocker) === null) ||
    (decision.scan_run_fingerprint !== null &&
      textOrNull(decision.scan_run_fingerprint) === null) ||
    (decision.observed_at !== null && isoOrNull(decision.observed_at) === null) ||
    (decision.data_mode !== null && textOrNull(decision.data_mode) === null) ||
    (decision.candidate_decision_record_status !== "available" &&
      decision.candidate_decision_record_status !== "missing") ||
    [
      decision.retained_snapshot_count,
      decision.research_only_snapshot_count,
      decision.learning_only_snapshot_count,
      decision.visible_snapshot_count,
      decision.identity_conflict_excluded_snapshot_count,
      outcomeEvidence.linked_outcome_count,
      outcomeEvidence.complete_linked_outcome_count,
      outcomeEvidence.retained_scheduled_evaluation_attempt_count,
    ].some((count) => nonNegativeInteger(count) === null) ||
    (attemptStatus !== null &&
      !scheduledAttemptStatuses.includes(
        attemptStatus as ScheduledOutcomeEvaluationAttempt["status"],
      )) ||
    (outcomeEvidence.latest_scheduled_evaluation_slot_at !== null &&
      isoOrNull(outcomeEvidence.latest_scheduled_evaluation_slot_at) === null) ||
    (outcomeEvidence.scheduled_receipt_attribution !== "no_retained_attempt" &&
      outcomeEvidence.scheduled_receipt_attribution !==
        "not_decision_attributable")
  ) {
    return null;
  }

  return {
    contract_version: DECISION_OUTCOME_LIFECYCLE_READBACK_VERSION,
    status: status as DecisionOutcomeLifecycleReadbackStatus,
    decision: {
      scan_run_fingerprint:
        decision.scan_run_fingerprint === null
          ? null
          : textOrNull(decision.scan_run_fingerprint),
      observed_at:
        decision.observed_at === null ? null : isoOrNull(decision.observed_at),
      data_mode:
        decision.data_mode === null ? null : textOrNull(decision.data_mode),
      candidate_decision_record_status: decision.candidate_decision_record_status,
      retained_snapshot_count: decision.retained_snapshot_count as number,
      research_only_snapshot_count: decision.research_only_snapshot_count as number,
      learning_only_snapshot_count: decision.learning_only_snapshot_count as number,
      visible_snapshot_count: decision.visible_snapshot_count as number,
      identity_conflict_excluded_snapshot_count:
        decision.identity_conflict_excluded_snapshot_count as number,
    },
    outcome_evidence: {
      linked_outcome_count: outcomeEvidence.linked_outcome_count as number,
      complete_linked_outcome_count:
        outcomeEvidence.complete_linked_outcome_count as number,
      retained_scheduled_evaluation_attempt_count:
        outcomeEvidence.retained_scheduled_evaluation_attempt_count as number,
      latest_scheduled_evaluation_status:
        attemptStatus as ScheduledOutcomeEvaluationAttempt["status"] | null,
      latest_scheduled_evaluation_slot_at:
        outcomeEvidence.latest_scheduled_evaluation_slot_at === null
          ? null
          : isoOrNull(outcomeEvidence.latest_scheduled_evaluation_slot_at),
      scheduled_receipt_attribution:
        outcomeEvidence.scheduled_receipt_attribution as DecisionOutcomeLifecycleReadback["outcome_evidence"]["scheduled_receipt_attribution"],
    },
    blockers: blockers.map((blocker) => textOrNull(blocker)!),
  };
}
