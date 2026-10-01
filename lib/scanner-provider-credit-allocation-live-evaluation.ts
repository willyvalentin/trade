import { createHash } from "node:crypto";

import {
  basicFreeScheduledScanCreditReadbackFromScheduledAttempt,
} from "@/lib/basic-free-scheduled-scan-credit-readback";
import {
  observationCycleReceiptFromUnknown,
  type ObservationCycleReceipt,
} from "@/lib/observation-cycle-receipt";
import {
  SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT,
  type ScannerProviderCreditAllocationExperimentArm,
} from "@/lib/scanner-provider-credit-allocation-live-experiment";
import {
  SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
  SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION,
  type ScannerProviderCreditAllocationPolicyVersion,
} from "@/lib/scanner-provider-credit-allocation-plan";
import { scheduledScanInvocationReceiptFromAttempt } from "@/lib/scheduled-scan-invocation-receipt";

export const SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EVALUATION_VERSION =
  "scanner_provider_credit_allocation_live_evaluation_v1" as const;

type SlotStatus = "missing" | "active" | "completed" | "failed" | "invalid";

type SlotMetrics = Readonly<{
  expected_candidates: number;
  rankable_candidates: number;
  fully_observed_candidates: number;
  candidates_receiving_provider_credit: number;
  late_candidates_without_provider_credit: number;
  scanner_credits_reserved: number;
  total_provider_credits_reserved: number;
  provider_errors: number;
  stale_inputs: number;
  published_recommendations: number;
}>;

type ScheduledAttemptCreditEvidence = Readonly<{
  attempt_fingerprint: string;
  slot_utc: string;
  deploy_id: string;
  site_id: string;
  deployed_revision: string;
  reserved_credits: number;
  terminal_accounting: boolean;
  finalization_proven: boolean | null;
}>;

export type ScannerProviderCreditAllocationLiveEvaluationSlot = Readonly<{
  slot_utc: string;
  arm: ScannerProviderCreditAllocationExperimentArm;
  pair: number;
  status: SlotStatus;
  reason_codes: readonly string[];
  source_attempt_fingerprint: string | null;
  cycle_fingerprint: string | null;
  policy_version: ScannerProviderCreditAllocationPolicyVersion | null;
  admission_fingerprint: string | null;
  population_fingerprint: string | null;
  execution_plan_fingerprint: string | null;
  reconciliation_fingerprint: string | null;
  credit_finalization_proven: boolean | null;
  metrics: SlotMetrics | null;
}>;

type ArmMetrics = Readonly<{
  completed_attempts: number;
  expected_candidates: number;
  rankable_candidates: number;
  rankable_candidate_fraction: number | null;
  fully_observed_candidates: number;
  candidates_receiving_provider_credit: number;
  late_candidates_without_provider_credit: number;
  scanner_credits_reserved: number;
  total_provider_credits_reserved: number;
  provider_errors: number;
  stale_inputs: number;
  published_recommendations: number;
}>;

export type ScannerProviderCreditAllocationLiveEvaluation = Readonly<{
  evaluation_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EVALUATION_VERSION;
  status: "in_progress" | "available" | "inconclusive" | "fail";
  reason_codes: readonly string[];
  experiment_id: string;
  expected_revision: string | null;
  evaluated_at: string;
  slots: readonly ScannerProviderCreditAllocationLiveEvaluationSlot[];
  counts: Readonly<{
    declared_slots: number;
    supplied_receipts: number;
    supplied_attempt_rows: number;
    invalid_receipts: number;
    invalid_attempt_rows: number;
    unattributed_receipts: number;
    undeclared_receipts: number;
    undeclared_attempt_rows: number;
    duplicate_attempt_slots: number;
    duplicate_slots: number;
    missing_slots: number;
    active_slots: number;
    completed_slots: number;
    failed_slots: number;
    invalid_slots: number;
    total_provider_credits_reserved: number;
    scanner_credits_reserved: number;
    provider_errors: number;
    stale_inputs: number;
    published_recommendations: number;
    stale_or_incomplete_publications: number;
    maximum_consecutive_operational_failures: number;
  }>;
  arms: Readonly<{
    baseline: ArmMetrics;
    challenger: ArmMetrics;
  }>;
  paired_comparison: Readonly<{
    completed_pairs: number;
    rankable_candidate_fraction_delta: number | null;
    candidates_receiving_provider_credit_delta: number;
    late_candidates_without_provider_credit_delta: number;
    signal:
      | "insufficient_evidence"
      | "challenger_better_on_all_primary_proxies"
      | "mixed_primary_proxies"
      | "challenger_not_better"
      | "guardrail_regression";
    guardrails: Readonly<{
      provider_error_delta: number;
      stale_input_delta: number;
      total_provider_credit_delta: number;
      stale_or_incomplete_publications: number;
      passed: boolean;
    }>;
    recommendation_quality: "unproven";
    next_step:
      | "complete_frozen_switchback"
      | "review_incomplete_evidence_before_new_experiment"
      | "repair_or_reject_experiment_evidence"
      | "retain_baseline"
      | "evaluate_canonical_outcomes_before_any_promotion";
  }>;
  authority: Readonly<{
    can_call_provider: false;
    can_reserve_provider_credit: false;
    can_change_live_allocation: false;
    can_change_ranking_or_publication: false;
    can_lower_threshold: false;
    can_publish_candidate: false;
    can_execute_broker_action: false;
  }>;
}>;

function inertAuthority(): ScannerProviderCreditAllocationLiveEvaluation["authority"] {
  return Object.freeze({
    can_call_provider: false as const,
    can_reserve_provider_credit: false as const,
    can_change_live_allocation: false as const,
    can_change_ranking_or_publication: false as const,
    can_lower_threshold: false as const,
    can_publish_candidate: false as const,
    can_execute_broker_action: false as const,
  });
}

function unique(values: readonly string[]) {
  return Object.freeze([...new Set(values)]);
}

function recordOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function scheduledAttemptCreditEvidenceFromUnknown(
  value: unknown,
): ScheduledAttemptCreditEvidence | null {
  const row = recordOrNull(value);
  const attemptFingerprint =
    typeof row?.attempt_fingerprint === "string"
      ? row.attempt_fingerprint.trim().toLowerCase()
      : "";
  const invocation = scheduledScanInvocationReceiptFromAttempt({
    source: row?.source,
    mode: row?.mode,
    payload: row?.payload_json,
  });
  const creditReadback = basicFreeScheduledScanCreditReadbackFromScheduledAttempt({
    utc_timestamp: row?.utc_timestamp,
    trading_date: row?.trading_date,
    intraday_scan_window: row?.intraday_scan_window,
    payload_json: row?.payload_json,
  });
  const reservation = creditReadback.reservation;
  const providerExecutionAllowed =
    reservation.provider_execution_allowed === true;
  const reservedCredits = providerExecutionAllowed
    ? reservation.requested_credits
    : 0;
  const terminalAccounting = providerExecutionAllowed
    ? reservation.finalization_proven === true
    : reservation.safe_blocker !== null;

  if (
    !row ||
    !/^[a-z0-9_:.-]{12,240}$/.test(attemptFingerprint) ||
    !invocation ||
    creditReadback.status !== "available" ||
    reservation.trading_date !==
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.trading_date ||
    reservation.minute_bucket !== invocation.scheduled_slot_started_at_utc ||
    reservedCredits === null ||
    !Number.isSafeInteger(reservedCredits) ||
    reservedCredits < 0
  ) {
    return null;
  }

  return Object.freeze({
    attempt_fingerprint: attemptFingerprint,
    slot_utc: invocation.scheduled_slot_started_at_utc,
    deploy_id: invocation.build_deployment_identity.deploy_id,
    site_id: invocation.build_deployment_identity.site_id,
    deployed_revision:
      invocation.build_deployment_identity.commit_ref.toLowerCase(),
    reserved_credits: reservedCredits,
    terminal_accounting: terminalAccounting,
    finalization_proven: reservation.finalization_proven,
  });
}

function normalizedRevision(value: unknown) {
  const revision = typeof value === "string" ? value.trim().toLowerCase() : "";
  return /^[a-f0-9]{40}$/.test(revision) ? revision : null;
}

function emptyMetrics(): SlotMetrics {
  return Object.freeze({
    expected_candidates: 0,
    rankable_candidates: 0,
    fully_observed_candidates: 0,
    candidates_receiving_provider_credit: 0,
    late_candidates_without_provider_credit: 0,
    scanner_credits_reserved: 0,
    total_provider_credits_reserved: 0,
    provider_errors: 0,
    stale_inputs: 0,
    published_recommendations: 0,
  });
}

function populationFingerprint(
  demands:
    | ObservationCycleReceipt["provider_credit_allocation_execution_plan"]
    | undefined,
) {
  if (!demands || demands.status !== "planned") return null;
  const population = demands.candidate_demands.map((candidate) => [
    candidate.ticker_index,
    candidate.ticker,
    candidate.daily_refresh_required,
    candidate.intraday_refresh_required,
  ]);
  return createHash("sha256")
    .update(JSON.stringify(population), "utf8")
    .digest("hex");
}

function missingSlot(
  slot: (typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.slots)[number],
): ScannerProviderCreditAllocationLiveEvaluationSlot {
  return Object.freeze({
    ...slot,
    status: "missing" as const,
    reason_codes: Object.freeze(["live_allocation_experiment_receipt_missing"]),
    source_attempt_fingerprint: null,
    cycle_fingerprint: null,
    policy_version: null,
    admission_fingerprint: null,
    population_fingerprint: null,
    execution_plan_fingerprint: null,
    reconciliation_fingerprint: null,
    credit_finalization_proven: null,
    metrics: null,
  });
}

function expectedPolicy(arm: ScannerProviderCreditAllocationExperimentArm) {
  return arm === "baseline"
    ? SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION
    : SCANNER_PROVIDER_CREDIT_CHALLENGER_POLICY_VERSION;
}

function deploymentIdentity(receipt: ObservationCycleReceipt) {
  const value = receipt.trigger.build_deployment_identity;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const identity = value as Record<string, unknown>;
  const commitRef = normalizedRevision(identity.commit_ref);
  return identity.schema_version === "scheduled_scan_deployment_identity_v1" &&
    identity.deploy_context === "production" &&
    /^[a-f0-9]{24}$/.test(String(identity.deploy_id ?? "")) &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(
      String(identity.site_id ?? ""),
    ) &&
    commitRef
    ? Object.freeze({
        commit_ref: commitRef,
        deploy_id: String(identity.deploy_id),
        site_id: String(identity.site_id ?? ""),
      })
    : null;
}

function evaluateTerminalSlot({
  receipt,
  slot,
  expectedRevision,
  creditEvidence,
}: {
  receipt: ObservationCycleReceipt;
  slot: (typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.slots)[number];
  expectedRevision: string;
  creditEvidence: ScheduledAttemptCreditEvidence | null;
}): ScannerProviderCreditAllocationLiveEvaluationSlot {
  const policy = expectedPolicy(slot.arm);
  const identity = deploymentIdentity(receipt);
  const admission = receipt.provider_credit_allocation_runtime_admission;
  const plan = receipt.provider_credit_allocation_execution_plan;
  const reconciliation = receipt.provider_credit_allocation_reconciliation;
  const coverage = receipt.provider_candidate_coverage;
  const base = {
    ...slot,
    source_attempt_fingerprint: receipt.source_attempt_fingerprint,
    cycle_fingerprint: receipt.cycle_fingerprint,
    policy_version: plan?.policy_version ?? null,
    admission_fingerprint: admission?.admission_fingerprint ?? null,
    population_fingerprint: populationFingerprint(plan),
    execution_plan_fingerprint: plan?.plan_fingerprint ?? null,
    reconciliation_fingerprint:
      reconciliation?.reconciliation_fingerprint ?? null,
    credit_finalization_proven:
      creditEvidence?.finalization_proven ?? null,
  };

  const provenanceReasons = [
    ...(identity?.commit_ref === expectedRevision
      ? []
      : ["live_allocation_experiment_revision_mismatch"]),
    ...(receipt.trigger.kind === "netlify_schedule" &&
    receipt.trigger.scheduled_slot_started_at_utc === slot.slot_utc
      ? []
      : ["live_allocation_experiment_trigger_invalid"]),
    ...(creditEvidence?.attempt_fingerprint ===
      receipt.source_attempt_fingerprint &&
    creditEvidence.slot_utc === slot.slot_utc &&
    creditEvidence.deploy_id === identity?.deploy_id &&
    creditEvidence.site_id === identity?.site_id &&
    creditEvidence.deployed_revision === expectedRevision
      ? []
      : ["live_allocation_experiment_credit_evidence_invalid"]),
  ];

  if (receipt.cycle_status === "active") {
    return Object.freeze({
      ...base,
      status:
        provenanceReasons.length === 0
          ? ("active" as const)
          : ("invalid" as const),
      reason_codes: unique(
        provenanceReasons.length === 0
          ? ["live_allocation_experiment_attempt_active"]
          : provenanceReasons,
      ),
      metrics: null,
    });
  }

  if (receipt.cycle_status === "failed" || receipt.cycle_status === "rejected") {
    const terminalReasons = [
      ...provenanceReasons,
      ...(creditEvidence?.terminal_accounting
        ? []
        : ["live_allocation_experiment_credit_finalization_missing"]),
    ];
    return Object.freeze({
      ...base,
      status:
        terminalReasons.length === 0
          ? ("failed" as const)
          : ("invalid" as const),
      reason_codes: unique([
        ...(terminalReasons.length === 0
          ? ["live_allocation_experiment_operational_failure"]
          : terminalReasons),
        ...receipt.decision.reason_codes,
      ]),
      metrics:
        terminalReasons.length === 0
          ? Object.freeze({
              ...emptyMetrics(),
              scanner_credits_reserved:
                reconciliation?.actual_reserved_credits ?? 0,
              total_provider_credits_reserved:
                creditEvidence?.reserved_credits ?? 0,
              provider_errors: receipt.provider_response.error_count,
              stale_inputs: receipt.freshness.stale_count,
              published_recommendations: receipt.publication.published_count,
            })
          : null,
    });
  }

  const reasons: string[] = [...provenanceReasons];
  if (!creditEvidence?.terminal_accounting) {
    reasons.push("live_allocation_experiment_credit_finalization_missing");
  }
  if (
    admission?.status !== "admitted" ||
    admission.experiment_id !==
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.experiment_id ||
    admission.scheduled_slot_utc !== slot.slot_utc ||
    admission.arm !== slot.arm ||
    admission.pair !== slot.pair ||
    admission.selected_policy_version !== policy ||
    admission.expected_revision !== expectedRevision ||
    admission.deployed_revision !== expectedRevision
  ) {
    reasons.push("live_allocation_experiment_runtime_admission_invalid");
  }
  if (
    plan?.status !== "planned" ||
    plan.policy_version !== policy ||
    plan.provider_credit_cap !==
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT
        .scanner_provider_credit_cap ||
    plan.candidate_count !==
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.population
        .expected_candidates_per_attempt ||
    !plan.plan_fingerprint
  ) {
    reasons.push("live_allocation_experiment_population_or_plan_invalid");
  }
  if (
    reconciliation?.status !== "matched" ||
    reconciliation.policy_version !== policy ||
    reconciliation.plan_fingerprint !== plan?.plan_fingerprint ||
    reconciliation.admission_fingerprint !== admission?.admission_fingerprint ||
    reconciliation.actual_reserved_credits >
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT
        .scanner_provider_credit_cap ||
    receipt.provider_request.reserved_credits !==
      reconciliation?.actual_reserved_credits
  ) {
    reasons.push("live_allocation_experiment_reconciliation_invalid");
  }
  const summary = coverage?.summary ?? null;
  const populationMatches = Boolean(
    plan?.status === "planned" &&
      coverage?.status === "observed" &&
      summary &&
      coverage.observations.length === plan.candidate_demands.length &&
      coverage.observations.every((observation, index) => {
        const demand = plan.candidate_demands[index];
        return (
          demand?.ticker === observation.ticker &&
          demand.ticker_index === observation.ticker_index
        );
      }) &&
      summary.expected_candidate_count === plan.candidate_count &&
      summary.total_reserved_credits ===
        reconciliation?.actual_reserved_credits
  );
  if (!populationMatches) {
    reasons.push("live_allocation_experiment_population_fingerprint_invalid");
  }
  if (
    (creditEvidence?.reserved_credits ?? Number.POSITIVE_INFINITY) >
    SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT
      .total_provider_credit_cap_per_attempt
  ) {
    reasons.push("live_allocation_experiment_total_credit_cap_breached");
  }

  const staleOrIncompletePublication =
    receipt.publication.published_count > 0 &&
    (receipt.freshness.status !== "fresh" ||
      receipt.freshness.stale_count > 0 ||
      (summary?.pending_candidate_count ?? 0) > 0);
  if (staleOrIncompletePublication) {
    reasons.push("live_allocation_experiment_stale_or_incomplete_publication");
  }

  if (
    reasons.length > 0 ||
    !plan ||
    !reconciliation ||
    !summary ||
    !creditEvidence
  ) {
    return Object.freeze({
      ...base,
      status: "invalid" as const,
      reason_codes: unique(
        reasons.length > 0
          ? reasons
          : ["live_allocation_experiment_terminal_evidence_invalid"],
      ),
      metrics: null,
    });
  }

  const allocatedCandidates = new Set(
    reconciliation.actual_allocations.map(
      (allocation) => `${allocation.ticker_index}:${allocation.ticker}`,
    ),
  );
  const lateIndexStart = Math.floor(plan.candidate_count / 2);
  const lateWithoutProviderCredit = plan.candidate_demands.filter(
    (candidate) =>
      candidate.ticker_index >= lateIndexStart &&
      (candidate.daily_refresh_required || candidate.intraday_refresh_required) &&
      !allocatedCandidates.has(`${candidate.ticker_index}:${candidate.ticker}`),
  ).length;
  const metrics = Object.freeze({
    expected_candidates: summary.expected_candidate_count,
    rankable_candidates: summary.rankable_candidate_count,
    fully_observed_candidates: summary.fully_observed_candidate_count,
    candidates_receiving_provider_credit: allocatedCandidates.size,
    late_candidates_without_provider_credit: lateWithoutProviderCredit,
    scanner_credits_reserved: reconciliation.actual_reserved_credits,
    total_provider_credits_reserved: creditEvidence.reserved_credits,
    provider_errors: receipt.provider_response.error_count,
    stale_inputs: receipt.freshness.stale_count,
    published_recommendations: receipt.publication.published_count,
  });

  return Object.freeze({
    ...base,
    status: "completed" as const,
    reason_codes: Object.freeze([
      "live_allocation_experiment_terminal_evidence_valid",
    ]),
    metrics,
  });
}

function aggregateArm(
  slots: readonly ScannerProviderCreditAllocationLiveEvaluationSlot[],
  arm: ScannerProviderCreditAllocationExperimentArm,
): ArmMetrics {
  const completed = slots.filter(
    (slot) => slot.arm === arm && slot.status === "completed" && slot.metrics,
  );
  const sum = (key: keyof SlotMetrics) =>
    completed.reduce((total, slot) => total + (slot.metrics?.[key] ?? 0), 0);
  const expected = sum("expected_candidates");
  const rankable = sum("rankable_candidates");
  return Object.freeze({
    completed_attempts: completed.length,
    expected_candidates: expected,
    rankable_candidates: rankable,
    rankable_candidate_fraction: expected > 0 ? rankable / expected : null,
    fully_observed_candidates: sum("fully_observed_candidates"),
    candidates_receiving_provider_credit: sum(
      "candidates_receiving_provider_credit",
    ),
    late_candidates_without_provider_credit: sum(
      "late_candidates_without_provider_credit",
    ),
    scanner_credits_reserved: sum("scanner_credits_reserved"),
    total_provider_credits_reserved: sum("total_provider_credits_reserved"),
    provider_errors: sum("provider_errors"),
    stale_inputs: sum("stale_inputs"),
    published_recommendations: sum("published_recommendations"),
  });
}

function maximumConsecutiveFailures(
  slots: readonly ScannerProviderCreditAllocationLiveEvaluationSlot[],
) {
  let maximum = 0;
  let current = 0;
  for (const slot of slots) {
    if (slot.status === "failed") {
      current += 1;
      maximum = Math.max(maximum, current);
    } else if (slot.status !== "missing" && slot.status !== "active") {
      current = 0;
    }
  }
  return maximum;
}

export function buildScannerProviderCreditAllocationLiveEvaluation({
  receipts,
  scheduledAttemptRows,
  expectedRevision,
  evaluatedAt,
}: {
  receipts: readonly unknown[];
  scheduledAttemptRows: readonly unknown[];
  expectedRevision: string | null | undefined;
  evaluatedAt: Date;
}): ScannerProviderCreditAllocationLiveEvaluation {
  const contract = SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT;
  const revision = normalizedRevision(expectedRevision);
  const evaluatedAtIso = Number.isFinite(evaluatedAt.getTime())
    ? evaluatedAt.toISOString()
    : new Date(0).toISOString();
  const parsed = receipts.map(observationCycleReceiptFromUnknown);
  const invalidReceiptCount = parsed.filter((receipt) => receipt === null).length;
  const parsedAttempts = scheduledAttemptRows.map(
    scheduledAttemptCreditEvidenceFromUnknown,
  );
  const invalidAttemptRows = parsedAttempts.filter(
    (attempt) => attempt === null,
  ).length;
  const unattributedReceipts = parsed.filter(
    (receipt) =>
      receipt !== null && receipt.trigger.scheduled_slot_started_at_utc === null,
  ).length;
  const bySlot = new Map<string, ObservationCycleReceipt[]>();
  for (const receipt of parsed) {
    if (!receipt) continue;
    const slot = receipt.trigger.scheduled_slot_started_at_utc;
    if (!slot) continue;
    const current = bySlot.get(slot) ?? [];
    current.push(receipt);
    bySlot.set(slot, current);
  }
  const duplicateSlots = [...bySlot.values()].filter(
    (slotReceipts) => slotReceipts.length > 1,
  ).length;
  const declaredSlots = new Set<string>(
    contract.slots.map((slot) => slot.slot_utc),
  );
  const attemptsBySlot = new Map<string, ScheduledAttemptCreditEvidence[]>();
  for (const attempt of parsedAttempts) {
    if (!attempt) continue;
    const current = attemptsBySlot.get(attempt.slot_utc) ?? [];
    current.push(attempt);
    attemptsBySlot.set(attempt.slot_utc, current);
  }
  const duplicateAttemptSlots = [...attemptsBySlot.values()].filter(
    (slotAttempts) => slotAttempts.length > 1,
  ).length;
  const undeclaredAttemptRows = [...attemptsBySlot.entries()].reduce(
    (count, [slot, slotAttempts]) =>
      count + (declaredSlots.has(slot) ? 0 : slotAttempts.length),
    0,
  );
  const undeclaredReceipts = [...bySlot.entries()].reduce(
    (count, [slot, slotReceipts]) =>
      count + (declaredSlots.has(slot) ? 0 : slotReceipts.length),
    0,
  );
  const slots = contract.slots.map((slot) => {
    const slotReceipts = bySlot.get(slot.slot_utc) ?? [];
    if (slotReceipts.length === 0) return missingSlot(slot);
    if (slotReceipts.length > 1 || !revision) {
      return Object.freeze({
        ...missingSlot(slot),
        status: "invalid" as const,
        reason_codes: Object.freeze([
          slotReceipts.length > 1
            ? "live_allocation_experiment_duplicate_slot_receipt"
            : "live_allocation_experiment_expected_revision_invalid",
        ]),
      });
    }
    return evaluateTerminalSlot({
      receipt: slotReceipts[0],
      slot,
      expectedRevision: revision,
      creditEvidence:
        attemptsBySlot.get(slot.slot_utc)?.length === 1
          ? attemptsBySlot.get(slot.slot_utc)![0]
          : null,
    });
  });
  const validReceipts = parsed.filter(
    (receipt): receipt is ObservationCycleReceipt => receipt !== null,
  );
  const validAttemptRows = parsedAttempts.filter(
    (attempt): attempt is ScheduledAttemptCreditEvidence => attempt !== null,
  );
  const totalProviderCredits = validAttemptRows.reduce(
    (total, attempt) => total + attempt.reserved_credits,
    0,
  );
  const attemptRevisionMismatch = validAttemptRows.some(
    (attempt) => attempt.deployed_revision !== revision,
  );
  const scannerCredits = validReceipts.reduce(
    (total, receipt) =>
      total +
      (receipt.provider_credit_allocation_reconciliation
        ?.actual_reserved_credits ?? 0),
    0,
  );
  const providerErrors = validReceipts.reduce(
    (total, receipt) => total + receipt.provider_response.error_count,
    0,
  );
  const staleInputs = validReceipts.reduce(
    (total, receipt) => total + receipt.freshness.stale_count,
    0,
  );
  const publishedRecommendations = validReceipts.reduce(
    (total, receipt) => total + receipt.publication.published_count,
    0,
  );
  const stalePublications = validReceipts.filter((receipt) => {
    if (receipt.publication.published_count === 0) return false;
    return (
      receipt.freshness.status !== "fresh" ||
      receipt.freshness.stale_count > 0 ||
      (receipt.provider_candidate_coverage?.summary?.pending_candidate_count ??
        0) > 0
    );
  }).length;
  const consecutiveFailures = maximumConsecutiveFailures(slots);
  const invalidSlots = slots.filter((slot) => slot.status === "invalid").length;
  const failedSlots = slots.filter((slot) => slot.status === "failed").length;
  const completedSlots = slots.filter(
    (slot) => slot.status === "completed",
  ).length;
  const missingSlots = slots.filter((slot) => slot.status === "missing").length;
  const activeSlots = slots.filter((slot) => slot.status === "active").length;
  const expired =
    Number.isFinite(evaluatedAt.getTime()) &&
    evaluatedAt.getTime() >= Date.parse(contract.expires_at_utc);
  const hardFailure =
    !revision ||
    invalidReceiptCount > 0 ||
    invalidAttemptRows > 0 ||
    attemptRevisionMismatch ||
    unattributedReceipts > 0 ||
    duplicateSlots > 0 ||
    duplicateAttemptSlots > 0 ||
    undeclaredReceipts > 0 ||
    undeclaredAttemptRows > 0 ||
    invalidSlots > 0 ||
    totalProviderCredits > contract.max_total_provider_credits ||
    stalePublications > 0 ||
    consecutiveFailures >= contract.stop_conditions.consecutive_operational_failures;
  const status = hardFailure
    ? ("fail" as const)
    : completedSlots === contract.slots.length
      ? ("available" as const)
      : expired
        ? ("inconclusive" as const)
        : ("in_progress" as const);
  const baseline = aggregateArm(slots, "baseline");
  const challenger = aggregateArm(slots, "challenger");
  const completedPairs = [1, 2, 3].filter((pair) => {
    const pairSlots = slots.filter((slot) => slot.pair === pair);
    return (
      pairSlots.length === 2 &&
      pairSlots.every((slot) => slot.status === "completed")
    );
  }).length;
  const rankableDelta =
    baseline.rankable_candidate_fraction !== null &&
    challenger.rankable_candidate_fraction !== null
      ? challenger.rankable_candidate_fraction -
        baseline.rankable_candidate_fraction
      : null;
  const breadthDelta =
    challenger.candidates_receiving_provider_credit -
    baseline.candidates_receiving_provider_credit;
  const lateDelta =
    challenger.late_candidates_without_provider_credit -
    baseline.late_candidates_without_provider_credit;
  const providerErrorDelta =
    challenger.provider_errors - baseline.provider_errors;
  const staleInputDelta = challenger.stale_inputs - baseline.stale_inputs;
  const totalProviderCreditDelta =
    challenger.total_provider_credits_reserved -
    baseline.total_provider_credits_reserved;
  const guardrailsPassed =
    providerErrorDelta <= 0 &&
    staleInputDelta <= 0 &&
    totalProviderCreditDelta <= 0 &&
    stalePublications === 0;
  const enoughComparison =
    status === "available" && completedPairs === 3 && rankableDelta !== null;
  const signal = !enoughComparison
    ? ("insufficient_evidence" as const)
    : !guardrailsPassed
      ? ("guardrail_regression" as const)
      : rankableDelta > 0 && breadthDelta > 0 && lateDelta < 0
      ? ("challenger_better_on_all_primary_proxies" as const)
      : rankableDelta <= 0 && breadthDelta <= 0 && lateDelta >= 0
        ? ("challenger_not_better" as const)
        : ("mixed_primary_proxies" as const);
  const nextStep = hardFailure
    ? ("repair_or_reject_experiment_evidence" as const)
    : status === "inconclusive"
      ? ("review_incomplete_evidence_before_new_experiment" as const)
    : status !== "available"
      ? ("complete_frozen_switchback" as const)
      : signal === "challenger_better_on_all_primary_proxies"
      ? ("evaluate_canonical_outcomes_before_any_promotion" as const)
      : ("retain_baseline" as const);
  const reasons = [
    ...(!revision ? ["live_allocation_experiment_expected_revision_invalid"] : []),
    ...(invalidReceiptCount > 0
      ? ["live_allocation_experiment_receipt_invalid"]
      : []),
    ...(invalidAttemptRows > 0
      ? ["live_allocation_experiment_attempt_credit_evidence_invalid"]
      : []),
    ...(attemptRevisionMismatch
      ? ["live_allocation_experiment_attempt_revision_mismatch"]
      : []),
    ...(unattributedReceipts > 0
      ? ["live_allocation_experiment_receipt_unattributed"]
      : []),
    ...(duplicateSlots > 0
      ? ["live_allocation_experiment_duplicate_slot_receipt"]
      : []),
    ...(duplicateAttemptSlots > 0
      ? ["live_allocation_experiment_duplicate_attempt_slot"]
      : []),
    ...(undeclaredReceipts > 0
      ? ["live_allocation_experiment_undeclared_slot_receipt"]
      : []),
    ...(undeclaredAttemptRows > 0
      ? ["live_allocation_experiment_undeclared_attempt_slot"]
      : []),
    ...(invalidSlots > 0
      ? ["live_allocation_experiment_slot_evidence_invalid"]
      : []),
    ...(totalProviderCredits > contract.max_total_provider_credits
      ? ["live_allocation_experiment_series_credit_cap_breached"]
      : []),
    ...(stalePublications > 0
      ? ["live_allocation_experiment_stale_or_incomplete_publication"]
      : []),
    ...(consecutiveFailures >= contract.stop_conditions.consecutive_operational_failures
      ? ["live_allocation_experiment_consecutive_failure_stop"]
      : []),
    ...(hardFailure
      ? []
      : status === "available"
        ? ["live_allocation_experiment_complete"]
        : status === "inconclusive"
          ? ["live_allocation_experiment_expired_incomplete"]
          : ["live_allocation_experiment_in_progress"]),
    "recommendation_quality_unproven",
  ];

  return Object.freeze({
    evaluation_version:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EVALUATION_VERSION,
    status,
    reason_codes: unique(reasons),
    experiment_id: contract.experiment_id,
    expected_revision: revision,
    evaluated_at: evaluatedAtIso,
    slots: Object.freeze(slots),
    counts: Object.freeze({
      declared_slots: contract.slots.length,
      supplied_receipts: receipts.length,
      supplied_attempt_rows: scheduledAttemptRows.length,
      invalid_receipts: invalidReceiptCount,
      invalid_attempt_rows: invalidAttemptRows,
      unattributed_receipts: unattributedReceipts,
      undeclared_receipts: undeclaredReceipts,
      undeclared_attempt_rows: undeclaredAttemptRows,
      duplicate_attempt_slots: duplicateAttemptSlots,
      duplicate_slots: duplicateSlots,
      missing_slots: missingSlots,
      active_slots: activeSlots,
      completed_slots: completedSlots,
      failed_slots: failedSlots,
      invalid_slots: invalidSlots,
      total_provider_credits_reserved: totalProviderCredits,
      scanner_credits_reserved: scannerCredits,
      provider_errors: providerErrors,
      stale_inputs: staleInputs,
      published_recommendations: publishedRecommendations,
      stale_or_incomplete_publications: stalePublications,
      maximum_consecutive_operational_failures: consecutiveFailures,
    }),
    arms: Object.freeze({ baseline, challenger }),
    paired_comparison: Object.freeze({
      completed_pairs: completedPairs,
      rankable_candidate_fraction_delta: rankableDelta,
      candidates_receiving_provider_credit_delta: breadthDelta,
      late_candidates_without_provider_credit_delta: lateDelta,
      signal,
      guardrails: Object.freeze({
        provider_error_delta: providerErrorDelta,
        stale_input_delta: staleInputDelta,
        total_provider_credit_delta: totalProviderCreditDelta,
        stale_or_incomplete_publications: stalePublications,
        passed: guardrailsPassed,
      }),
      recommendation_quality: "unproven" as const,
      next_step: nextStep,
    }),
    authority: inertAuthority(),
  });
}
