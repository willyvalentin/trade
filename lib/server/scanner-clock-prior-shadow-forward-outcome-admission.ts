import "server-only";

import { projectRecommendationOutcomeBundle } from "@/lib/canonical-evaluation-projection-adapters";
import { hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor } from "@/lib/recommendation-outcome-canonical-coverage";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { assessScannerClockPriorShadowOutcomeAdmission } from "@/lib/scanner-clock-prior-shadow-outcome-admission";
import {
  verifiedScannerClockPriorShadowForwardPlan,
} from "@/lib/server/scanner-clock-prior-shadow-forward-collection-admission";
import type { ScannerClockPriorShadowForwardDecisionPlan } from "@/lib/server/scanner-clock-prior-shadow-forward-decision";

export const SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_OUTCOME_ADMISSION_VERSION =
  "scanner_clock_prior_shadow_forward_outcome_admission_v1" as const;
export const SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_OUTCOME_POLICY_VERSION =
  "scanner_clock_prior_shadow_forward_outcome_policy_v1" as const;

const PRIMARY_HORIZON = "60m" as const;
const PRIMARY_HORIZON_MILLISECONDS = 60 * 60 * 1_000;
const MAXIMUM_SNAPSHOTS_PER_ATTEMPT = 4;
const MAXIMUM_SERIES_ATTEMPTS = 16;

export type ScannerClockPriorShadowForwardOutcomeAdmission = {
  contract_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_OUTCOME_ADMISSION_VERSION;
  outcome_policy_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_OUTCOME_POLICY_VERSION;
  status: "admitted" | "not_yet_due" | "no_outcome_collection_needed" | "blocked";
  reason_codes: string[];
  evaluated_at: string;
  plan_fingerprint: string | null;
  primary_horizon: typeof PRIMARY_HORIZON;
  cohort: {
    admitted_snapshot_count: number;
    complete_primary_outcome_count: number;
    due_incomplete_snapshot_count: number;
    not_yet_due_snapshot_count: number;
    due_snapshot_fingerprints: string[];
    next_maturity_at: string | null;
  };
  series: {
    maximum_snapshots_per_attempt: number;
    required_attempts: number;
    maximum_provider_credits: number;
  };
  authority: {
    schedule_effect: false;
    provider_effect: false;
    ranking_effect: false;
    publication_effect: false;
    paper_effect: false;
    broker_effect: false;
  };
};

export type ScannerClockPriorShadowForwardOutcomeAdmissionInput = {
  evaluatedAt: string;
  plan: ScannerClockPriorShadowForwardDecisionPlan | null;
  snapshots: RecommendationSnapshot[];
  outcomes: RecommendationOutcome[];
};

function uniqueSorted(values: Iterable<string>) {
  return Array.from(new Set(values)).sort();
}

function response(
  input: ScannerClockPriorShadowForwardOutcomeAdmissionInput,
  partial: Omit<
    ScannerClockPriorShadowForwardOutcomeAdmission,
    "contract_version" | "outcome_policy_version" | "evaluated_at" |
      "primary_horizon" | "authority"
  >,
): ScannerClockPriorShadowForwardOutcomeAdmission {
  return {
    contract_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_OUTCOME_ADMISSION_VERSION,
    outcome_policy_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_OUTCOME_POLICY_VERSION,
    evaluated_at: input.evaluatedAt,
    primary_horizon: PRIMARY_HORIZON,
    ...partial,
    authority: {
      schedule_effect: false,
      provider_effect: false,
      ranking_effect: false,
      publication_effect: false,
      paper_effect: false,
      broker_effect: false,
    },
  };
}

function emptyCohort() {
  return {
    admitted_snapshot_count: 0,
    complete_primary_outcome_count: 0,
    due_incomplete_snapshot_count: 0,
    not_yet_due_snapshot_count: 0,
    due_snapshot_fingerprints: [],
    next_maturity_at: null,
  };
}

/**
 * Computes the exact, owner-independent outcome backlog for one already-frozen
 * clock-prior cohort. This is a read-only admission manifest: it neither
 * schedules a series nor authorizes provider work.
 */
export function assessScannerClockPriorShadowForwardOutcomeAdmission(
  input: ScannerClockPriorShadowForwardOutcomeAdmissionInput,
): ScannerClockPriorShadowForwardOutcomeAdmission {
  const evaluatedAt = Date.parse(input.evaluatedAt);
  const plan = verifiedScannerClockPriorShadowForwardPlan(input.plan);
  const blocked = (reasonCodes: Iterable<string>) => response(input, {
    status: "blocked",
    reason_codes: uniqueSorted(reasonCodes),
    plan_fingerprint: plan?.plan_fingerprint ?? null,
    cohort: emptyCohort(),
    series: {
      maximum_snapshots_per_attempt: MAXIMUM_SNAPSHOTS_PER_ATTEMPT,
      required_attempts: 0,
      maximum_provider_credits: 0,
    },
  });

  if (!Number.isFinite(evaluatedAt)) return blocked(["evaluated_at_invalid"]);
  if (!plan) return blocked(["frozen_plan_invalid_or_drifted"]);

  const reasons = new Set<string>();
  const admitted: Array<{
    snapshot: RecommendationSnapshot;
    maturityAt: string;
  }> = [];
  const allSnapshotFingerprints = new Set(
    input.snapshots.map((snapshot) => snapshot.snapshot_fingerprint),
  );
  const snapshotFingerprints = new Set<string>();
  const candidateDecisionIds = new Set<string>();

  for (const snapshot of input.snapshots) {
    const admission = assessScannerClockPriorShadowOutcomeAdmission(snapshot);
    if (admission.status === "not_applicable") continue;
    if (admission.status !== "admitted" || !admission.candidate_decision_id) {
      reasons.add("clock_prior_snapshot_admission_rejected");
      continue;
    }
    if (snapshotFingerprints.has(snapshot.snapshot_fingerprint)) {
      reasons.add("duplicate_snapshot_fingerprint");
      continue;
    }
    snapshotFingerprints.add(snapshot.snapshot_fingerprint);
    if (candidateDecisionIds.has(admission.candidate_decision_id)) {
      reasons.add("duplicate_candidate_decision_id");
      continue;
    }
    candidateDecisionIds.add(admission.candidate_decision_id);

    const anchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot);
    if (!anchor) {
      reasons.add("outcome_evaluation_anchor_missing_or_invalid");
      continue;
    }
    const maturity = Date.parse(anchor.evaluation_anchor_start_at) +
      PRIMARY_HORIZON_MILLISECONDS;
    admitted.push({ snapshot, maturityAt: new Date(maturity).toISOString() });
  }

  const linkedOutcomes = new Map<string, RecommendationOutcome[]>();
  for (const outcome of input.outcomes) {
    const fingerprint = outcome.snapshot_fingerprint;
    if (!fingerprint || !allSnapshotFingerprints.has(fingerprint)) {
      reasons.add("outcome_not_bound_to_cohort_snapshot");
      continue;
    }
    if (!snapshotFingerprints.has(fingerprint)) continue;
    const rows = linkedOutcomes.get(fingerprint) ?? [];
    rows.push(outcome);
    linkedOutcomes.set(fingerprint, rows);
  }

  const due: string[] = [];
  const notYetDue: string[] = [];
  const maturityTimes: string[] = [];
  let complete = 0;

  for (const { snapshot, maturityAt } of admitted) {
    const outcomes = linkedOutcomes.get(snapshot.snapshot_fingerprint) ?? [];
    const seenHorizons = new Set<string>();
    for (const outcome of outcomes) {
      const evaluatedAt = Date.parse(outcome.evaluated_at);
      const recommendedAt = Date.parse(snapshot.recommended_at ?? "");
      if (
        (outcome.snapshot_id !== null && outcome.snapshot_id !== snapshot.id) ||
        (outcome.recommendation_id !== null &&
          snapshot.recommendation_id !== null &&
          outcome.recommendation_id !== snapshot.recommendation_id) ||
        !Number.isFinite(evaluatedAt) ||
        !Number.isFinite(recommendedAt) ||
        evaluatedAt < recommendedAt
      ) {
        reasons.add("outcome_lineage_conflicting");
      }
      if (seenHorizons.has(outcome.horizon)) {
        reasons.add(`duplicate_${outcome.horizon}_outcome`);
      }
      seenHorizons.add(outcome.horizon);
    }

    const projection = projectRecommendationOutcomeBundle({ snapshot, outcomes });
    const selected = projection.projection.primary_outcome;
    const selectedOutcome = selected?.status === "selected" &&
        selected.primary_horizon === PRIMARY_HORIZON
      ? outcomes.find((outcome) => outcome.id === selected.primary_outcome?.outcome.id) ?? null
      : null;
    const anchor = recommendationOutcomeEvaluationAnchorFromSnapshot(snapshot);
    const primaryComplete = selectedOutcome !== null &&
      hasCanonicalOutcomeProviderCoverageWithEvaluationAnchor(
        selectedOutcome.payload_json.canonical_provider_coverage,
        anchor,
      );
    if (primaryComplete) {
      complete += 1;
      continue;
    }
    if (Date.parse(maturityAt) <= evaluatedAt) {
      due.push(snapshot.snapshot_fingerprint);
    } else {
      notYetDue.push(snapshot.snapshot_fingerprint);
      maturityTimes.push(maturityAt);
    }
  }

  if (reasons.size > 0) return blocked(reasons);
  const requiredAttempts = Math.ceil(due.length / MAXIMUM_SNAPSHOTS_PER_ATTEMPT);
  if (requiredAttempts > MAXIMUM_SERIES_ATTEMPTS) {
    return blocked(["outcome_backlog_exceeds_bounded_series_capacity"]);
  }
  const cohort = {
    admitted_snapshot_count: admitted.length,
    complete_primary_outcome_count: complete,
    due_incomplete_snapshot_count: due.length,
    not_yet_due_snapshot_count: notYetDue.length,
    due_snapshot_fingerprints: due.sort(),
    next_maturity_at: maturityTimes.sort()[0] ?? null,
  };
  const series = {
    maximum_snapshots_per_attempt: MAXIMUM_SNAPSHOTS_PER_ATTEMPT,
    required_attempts: requiredAttempts,
    maximum_provider_credits:
      requiredAttempts * MAXIMUM_SNAPSHOTS_PER_ATTEMPT,
  };

  if (due.length > 0) {
    return response(input, {
      status: "admitted",
      reason_codes: ["mature_incomplete_primary_outcomes_present"],
      plan_fingerprint: plan.plan_fingerprint,
      cohort,
      series,
    });
  }
  return response(input, {
    status: notYetDue.length > 0
      ? "not_yet_due"
      : "no_outcome_collection_needed",
    reason_codes: [notYetDue.length > 0
      ? "primary_outcome_horizon_not_yet_elapsed"
      : "canonical_primary_outcomes_complete_or_cohort_empty"],
    plan_fingerprint: plan.plan_fingerprint,
    cohort,
    series,
  });
}
