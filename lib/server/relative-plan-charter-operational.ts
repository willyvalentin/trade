import "server-only";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { decisionLineageReceiptFromScanRun } from "@/lib/decision-lineage-receipt";
import { observationSeriesActivationBuildIdentityFromUnknown } from "@/lib/observation-series-activation-preflight";
import type { RecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import { relativePlanCharterProportion } from "@/lib/server/relative-plan-charter-context";
import { verifiedRelativePlanProspectiveFreeze, relativePlanSemanticJson } from "@/lib/server/relative-plan-prospective-comparison";
import type { RelativePlanCharterRuntimeSource } from "@/lib/server/relative-plan-charter-runtime-source";

export const RELATIVE_PLAN_CHARTER_OPERATIONAL_VERSION = "relative_plan_charter_operational_v1" as const;

/** Operational population is every admitted scheduled attempt in the original
 * forward window, including failed/active attempts and quality overflow. The
 * quality population remains the original first thirty decisions: completing
 * extra scans cannot replace their outcomes or improve their paired ranking.
 * Unattributed receipts are unknowns, not successful zero-credit attempts. */
export function summarizeRelativePlanCharterOperational(input: {
  owner: string; freeze: unknown; partition: "held_out" | "walk_forward";
  runtime: RelativePlanCharterRuntimeSource; source: RecommendationLearningBaselineSource;
  enrolledFingerprints: string[]; now: Date;
}) {
  const unavailable = (blocker: string) => ({ status: "unavailable" as const,
    reliability: null, cost: null, blockers: [blocker] });
  const freeze = verifiedRelativePlanProspectiveFreeze(input.freeze, input.owner);
  if (!freeze || !Number.isFinite(input.now.getTime()) || input.runtime.status !== "available") {
    return unavailable("relative_plan_operational_original_source_unavailable");
  }
  const matches = input.runtime.partitions.filter(row => row.partition === input.partition);
  const runtime = matches.length === 1 ? matches[0] : null;
  if (!runtime || runtime.status !== "available" || runtime.read_as_of !== input.now.toISOString() ||
    relativePlanSemanticJson(runtime.original_window) !== relativePlanSemanticJson(freeze.plan.windows[input.partition])) {
    return unavailable("relative_plan_operational_original_window_unavailable");
  }
  const window = runtime.original_window;
  const runs = new Map<string, RecommendationLearningBaselineSource["scanRuns"]>();
  for (const run of input.source.scanRuns) runs.set(run.run_fingerprint, [...(runs.get(run.run_fingerprint) ?? []), run]);
  const evidence = runtime.evidence;
  const blockers = new Set<string>();
  const attempts = new Set(evidence.map(row => row.receipt.source_attempt_fingerprint));
  if (attempts.size !== evidence.length || new Set(input.enrolledFingerprints).size !== input.enrolledFingerprints.length) {
    return unavailable("relative_plan_operational_original_identity_duplicated");
  }
  if (runtime.unattributed_attempt_count !== 0) blockers.add("relative_plan_operational_unattributed_attempts");
  const admitted = evidence.filter(row => row.receipt.admission.status === "admitted");
  const unknownAdmission = evidence.filter(row => row.receipt.admission.status === "unknown").length;
  if (unknownAdmission > 0) blockers.add("relative_plan_operational_admission_unknown");
  const attributed = admitted.filter(({ receipt }) => {
    const build = observationSeriesActivationBuildIdentityFromUnknown(receipt.trigger.build_deployment_identity);
    const at = Date.parse(receipt.trigger.route_received_at);
    return receipt.owner_user_id === input.owner && receipt.trigger.kind === "netlify_schedule" &&
      build?.commit_ref === freeze.plan.source_revision.commit_ref && at >= Date.parse(window.start_at) &&
      at < Date.parse(window.end_at) && at <= input.now.getTime();
  });
  if (attributed.length !== admitted.length) blockers.add("relative_plan_operational_frozen_revision_or_owner_unknown");
  const completed = attributed.filter(({ receipt }) => {
    const matchingRuns = runs.get(receipt.scan_run_fingerprint ?? "") ?? [];
    const run = matchingRuns.length === 1 ? matchingRuns[0] : null;
    const record = run ? candidateDecisionRecordFromScanRun(run) : null;
    const versions = record?.learning_attribution.canonical_evaluation_versions;
    return receipt.cycle_status === "completed" && run && record && decisionLineageReceiptFromScanRun(run, record) &&
      ["completed", "empty"].includes(run.status) && versions?.git_commit === freeze.plan.source_revision.commit_ref &&
      versions.build_identity === freeze.plan.source_revision.build_identity &&
      Date.parse(record.decision_timestamp) >= Date.parse(window.start_at) && Date.parse(record.decision_timestamp) < Date.parse(window.end_at) &&
      Date.parse(run.completed_at ?? "") >= Date.parse(record.decision_timestamp) && Date.parse(run.completed_at ?? "") <= input.now.getTime();
  });
  const active = admitted.filter(row => row.receipt.cycle_status === "active").length;
  const terminalFailures = admitted.filter(row => row.receipt.cycle_status === "failed" || row.receipt.cycle_status === "rejected").length;
  const unboundCompleted = admitted.filter(row => row.receipt.cycle_status === "completed" && !completed.includes(row)).length;
  if (active > 0) blockers.add("relative_plan_operational_attempts_not_terminal");
  if (unboundCompleted > 0) blockers.add("relative_plan_operational_completed_decision_lineage_unavailable");
  const completedFingerprints = new Set(completed.map(row => row.receipt.scan_run_fingerprint));
  const linkedEnrolled = input.enrolledFingerprints.filter(value => completedFingerprints.has(value)).length;
  if (linkedEnrolled !== input.enrolledFingerprints.length) blockers.add("relative_plan_operational_enrolled_decision_lineage_incomplete");
  if (admitted.length === 0) blockers.add("relative_plan_operational_admitted_denominator_missing");
  // Cost and reliability are separate observed dimensions. Unknown cost must
  // not erase an attributable terminal failure; an unknown operational
  // population must not qualify a selectively cheap cost denominator.
  const reliabilityComparable = blockers.size === 0;
  const exact = admitted.filter(row => {
    const credit = row.credit_readback;
    return credit.status === "available" && (credit.reservation.status === "not_required"
      ? row.receipt.provider_request.reserved_credits === 0 && row.receipt.provider_request.status === "not_attempted"
      : credit.reservation.finalization_proven === true && credit.reservation.requested_credits === row.receipt.provider_request.reserved_credits);
  });
  if (exact.length !== admitted.length) blockers.add("relative_plan_operational_exact_finalized_credit_evidence_incomplete");
  const costComparable = reliabilityComparable && exact.length === admitted.length;
  const credits = admitted.reduce((sum, row) => sum + row.receipt.provider_request.reserved_credits, 0);
  const failures = admitted.filter(row => row.receipt.cycle_status === "failed" || row.receipt.cycle_status === "rejected");
  const failureClasses = failures.map(row => {
    const signal = [row.receipt.provider_response.latest_error_type, ...row.receipt.decision.reason_codes,
      ...row.receipt.admission.reason_codes].filter(Boolean).join(" ").toLowerCase();
    return /timeout|timed_out/.test(signal) ? "timeout" : /rate_limit|rate-limit/.test(signal) ? "rate_limit"
      : row.receipt.provider_response.error_count > 0 || row.receipt.provider_response.status === "failed" ? "provider_error" : "other_error";
  });
  return {
    contract_version: RELATIVE_PLAN_CHARTER_OPERATIONAL_VERSION, status: "summarized" as const,
    operational_population: "all_admitted_scheduled_attempts_in_original_forward_window",
    reliability: { invocation_count: evidence.length, admitted_attempt_count: admitted.length,
      completed_attempt_count: completed.length, terminal_failure_count: terminalFailures, active_attempt_count: active,
      unbound_completed_count: unboundCompleted, admission_unknown_count: unknownAdmission,
      unattributed_attempt_count: runtime.unattributed_attempt_count, enrolled_decision_count: input.enrolledFingerprints.length,
      linked_enrolled_decision_count: linkedEnrolled,
      failure_classes: Object.fromEntries(["timeout", "rate_limit", "provider_error", "other_error"].map(name =>
        [name, failureClasses.filter(value => value === name).length])),
      value: reliabilityComparable ? relativePlanCharterProportion(completed.length, admitted.length) : null },
    cost: { admitted_attempt_denominator: admitted.length, exact_finalized_credit_receipt_count: exact.length,
      reserved_provider_credits: costComparable ? credits : null,
      credits_per_decision: costComparable ? credits / admitted.length : null },
    blockers: [...blockers].sort(), terminal_quality_decision: null, quality_improvement_claimed: false,
  };
}
