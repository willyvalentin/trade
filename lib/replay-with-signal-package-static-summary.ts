import type {
  ReplayWithSignalPackageOutcomeStatus,
  ReplayWithSignalPackageResult,
} from "@/lib/replay-with-signal-package-result-model";

export type ReplayWithSignalPackageSummaryStatus =
  | "empty"
  | "safe_summary_available"
  | "blocked"
  | "unsafe_input_detected";

export type ReplayWithSignalPackageOutcomeBreakdown = {
  total_results: number;
  counterfactual_results_available: number;
  no_entry_triggered: number;
  target_hit: number;
  stop_hit: number;
  open_at_window_end: number;
  ambiguous_intrabar_conservative_stop: number;
  blocked: number;
  failed: number;
};

export type ReplayWithSignalPackageStaticSummary = {
  summary_status: ReplayWithSignalPackageSummaryStatus;
  total_results: number;
  interpreted_results: number;
  blocked_results: number;
  failed_results: number;
  unsafe_results: number;
  outcome_breakdown: ReplayWithSignalPackageOutcomeBreakdown;
  average_gross_r_multiple: number | null;
  best_gross_r_multiple: number | null;
  worst_gross_r_multiple: number | null;
  target_hit_rate: number | null;
  stop_hit_rate: number | null;
  no_entry_rate: number | null;
  open_at_window_end_rate: number | null;
  ambiguity_rate: number | null;
  all_no_effect_flags_safe: boolean;
  provider_call_executed: boolean;
  supabase_write_executed: boolean;
  synthetic_outcomes_persisted: boolean;
  scanner_behavior_changed: boolean;
  live_ranking_changed: boolean;
  recommendation_rows_mutated: boolean;
  replay_executed_count: number;
  warnings: string[];
  blockers: string[];
  interpretation_label: string;
};

const interpretedOutcomes: ReplayWithSignalPackageOutcomeStatus[] = [
  "no_entry_triggered",
  "target_hit",
  "stop_hit",
  "open_at_window_end",
  "ambiguous_intrabar_conservative_stop",
];

function emptyBreakdown(): ReplayWithSignalPackageOutcomeBreakdown {
  return {
    total_results: 0,
    counterfactual_results_available: 0,
    no_entry_triggered: 0,
    target_hit: 0,
    stop_hit: 0,
    open_at_window_end: 0,
    ambiguous_intrabar_conservative_stop: 0,
    blocked: 0,
    failed: 0,
  };
}

function unsafeReasons(result: ReplayWithSignalPackageResult) {
  const reasons: string[] = [];

  if (result.provider_call_executed) reasons.push("provider_call_executed");
  if (result.supabase_write_executed) reasons.push("supabase_write_executed");
  if (result.synthetic_outcomes_persisted) {
    reasons.push("synthetic_outcomes_persisted");
  }
  if (result.scanner_behavior_changed) reasons.push("scanner_behavior_changed");
  if (result.live_ranking_changed) reasons.push("live_ranking_changed");
  if (result.recommendation_rows_mutated) {
    reasons.push("recommendation_rows_mutated");
  }

  return reasons;
}

function finiteRValues(results: ReplayWithSignalPackageResult[]) {
  return results
    .map((result) => result.gross_r_multiple)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function rate(count: number, denominator: number) {
  return denominator > 0 ? count / denominator : null;
}

export function classifyReplayWithSignalPackageSummary(
  summary: ReplayWithSignalPackageStaticSummary,
): string {
  if (summary.total_results === 0) return "no_results";
  if (summary.summary_status === "unsafe_input_detected") return "unsafe_summary";
  if (summary.interpreted_results === 0) return "all_blocked_or_failed";
  if (summary.outcome_breakdown.ambiguous_intrabar_conservative_stop > 0) {
    return "ambiguity_detected";
  }
  if ((summary.no_entry_rate ?? 0) > 0.5) return "mostly_no_entry";
  if ((summary.open_at_window_end_rate ?? 0) > 0.5) {
    return "mostly_open_at_window_end";
  }
  if (
    summary.outcome_breakdown.target_hit > 0 &&
    summary.outcome_breakdown.target_hit >= summary.outcome_breakdown.stop_hit
  ) {
    return "target_positive_sample";
  }
  if (
    summary.outcome_breakdown.stop_hit > 0 &&
    summary.outcome_breakdown.stop_hit > summary.outcome_breakdown.target_hit
  ) {
    return "stop_negative_sample";
  }

  return "mixed_sample";
}

export function buildReplayWithSignalPackageStaticSummary(
  results: ReplayWithSignalPackageResult[],
): ReplayWithSignalPackageStaticSummary {
  const outcome_breakdown = emptyBreakdown();
  outcome_breakdown.total_results = results.length;

  const unsafeByResult = results.map(unsafeReasons);
  const unsafe_results = unsafeByResult.filter((reasons) => reasons.length > 0).length;
  const provider_call_executed = results.some((result) => result.provider_call_executed);
  const supabase_write_executed = results.some((result) => result.supabase_write_executed);
  const synthetic_outcomes_persisted = results.some(
    (result) => result.synthetic_outcomes_persisted,
  );
  const scanner_behavior_changed = results.some(
    (result) => result.scanner_behavior_changed,
  );
  const live_ranking_changed = results.some((result) => result.live_ranking_changed);
  const recommendation_rows_mutated = results.some(
    (result) => result.recommendation_rows_mutated,
  );
  const all_no_effect_flags_safe = unsafe_results === 0;

  for (const result of results) {
    outcome_breakdown[result.outcome_status] += 1;
    if (result.counterfactual_result_available) {
      outcome_breakdown.counterfactual_results_available += 1;
    }
  }

  const interpreted_results = results.filter((result) =>
    interpretedOutcomes.includes(result.outcome_status),
  ).length;
  const blocked_results = outcome_breakdown.blocked;
  const failed_results = outcome_breakdown.failed;
  const rValues = finiteRValues(results);
  const average_gross_r_multiple =
    rValues.length > 0
      ? rValues.reduce((sum, value) => sum + value, 0) / rValues.length
      : null;
  const best_gross_r_multiple =
    rValues.length > 0 ? Math.max(...rValues) : null;
  const worst_gross_r_multiple =
    rValues.length > 0 ? Math.min(...rValues) : null;
  const replay_executed_count = results.filter((result, index) => {
    return (
      result.replay_executed &&
      unsafeByResult[index].length === 0 &&
      result.execution_status === "replay_with_signal_package_completed" &&
      interpretedOutcomes.includes(result.outcome_status)
    );
  }).length;

  const blockers = Array.from(
    new Set([
      ...results.flatMap((result) => result.blockers),
      ...unsafeByResult.flat(),
    ]),
  );
  const warnings = Array.from(
    new Set([
      ...results.flatMap((result) => result.warnings),
      ...(results.length === 0 ? ["no_replay_with_signal_package_results"] : []),
      ...(rValues.length === 0 && results.length > 0
        ? ["no_finite_gross_r_multiple_values"]
        : []),
    ]),
  );

  const summary_status: ReplayWithSignalPackageSummaryStatus =
    results.length === 0
      ? "empty"
      : unsafe_results > 0
        ? "unsafe_input_detected"
        : interpreted_results === 0
          ? "blocked"
          : "safe_summary_available";

  const summaryWithoutLabel: ReplayWithSignalPackageStaticSummary = {
    summary_status,
    total_results: results.length,
    interpreted_results,
    blocked_results,
    failed_results,
    unsafe_results,
    outcome_breakdown,
    average_gross_r_multiple,
    best_gross_r_multiple,
    worst_gross_r_multiple,
    target_hit_rate: rate(outcome_breakdown.target_hit, interpreted_results),
    stop_hit_rate: rate(outcome_breakdown.stop_hit, interpreted_results),
    no_entry_rate: rate(outcome_breakdown.no_entry_triggered, interpreted_results),
    open_at_window_end_rate: rate(
      outcome_breakdown.open_at_window_end,
      interpreted_results,
    ),
    ambiguity_rate: rate(
      outcome_breakdown.ambiguous_intrabar_conservative_stop,
      interpreted_results,
    ),
    all_no_effect_flags_safe,
    provider_call_executed,
    supabase_write_executed,
    synthetic_outcomes_persisted,
    scanner_behavior_changed,
    live_ranking_changed,
    recommendation_rows_mutated,
    replay_executed_count,
    warnings,
    blockers,
    interpretation_label: "no_results",
  };

  return {
    ...summaryWithoutLabel,
    interpretation_label:
      classifyReplayWithSignalPackageSummary(summaryWithoutLabel),
  };
}

export function assertReplayWithSignalPackageSummarySafety(
  summary: ReplayWithSignalPackageStaticSummary,
): { ok: boolean; blockers: string[] } {
  const blockers = [...summary.blockers];

  if (!summary.all_no_effect_flags_safe) {
    blockers.push("unsafe_no_effect_flags_detected");
  }
  if (summary.summary_status === "unsafe_input_detected") {
    blockers.push("unsafe_input_detected");
  }

  return {
    ok: blockers.length === 0,
    blockers: Array.from(new Set(blockers)),
  };
}
