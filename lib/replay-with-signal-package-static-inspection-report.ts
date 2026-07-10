import type { ReplayWithSignalPackageResult } from "@/lib/replay-with-signal-package-result-model";
import {
  assertReplayWithSignalPackageSummarySafety,
  buildReplayWithSignalPackageStaticSummary,
  type ReplayWithSignalPackageStaticSummary,
} from "@/lib/replay-with-signal-package-static-summary";

export type ReplayWithSignalPackageInspectionReportStatus =
  | "empty"
  | "safe_report_available"
  | "blocked"
  | "unsafe_input_detected";

export type ReplayWithSignalPackageInspectionReportSection = {
  section_id: string;
  title: string;
  severity: "info" | "success" | "warning" | "danger";
  bullets: string[];
};

export type ReplayWithSignalPackageStaticInspectionReport = {
  report_status: ReplayWithSignalPackageInspectionReportStatus;
  generated_from_static_inputs: true;
  production_runtime_touched: false;
  provider_call_executed: false;
  supabase_write_executed: false;
  synthetic_outcomes_persisted: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  recommendation_rows_mutated: false;
  summary: ReplayWithSignalPackageStaticSummary;
  sections: ReplayWithSignalPackageInspectionReportSection[];
  blockers: string[];
  warnings: string[];
  recommended_next_step: string;
};

function reportStatusFromSummary(
  summary: ReplayWithSignalPackageStaticSummary,
): ReplayWithSignalPackageInspectionReportStatus {
  if (summary.summary_status === "empty") return "empty";
  if (summary.summary_status === "unsafe_input_detected") {
    return "unsafe_input_detected";
  }
  if (summary.summary_status === "blocked") return "blocked";

  return "safe_report_available";
}

function recommendedNextStep(
  status: ReplayWithSignalPackageInspectionReportStatus,
  summary: ReplayWithSignalPackageStaticSummary,
) {
  if (status === "empty") return "add_static_replay_results_before_review";
  if (status === "unsafe_input_detected") {
    return "stop_and_remove_unsafe_inputs_before_review";
  }
  if (status === "blocked") return "inspect_blockers_before_expanding_samples";
  if (summary.interpretation_label === "insufficient_sample_size") {
    return "collect_more_static_samples_before_interpretation";
  }

  return "review_static_summary_before_any_runtime_rollout";
}

function fixed(value: number | null) {
  return value === null ? "n/a" : value.toFixed(4);
}

function pct(value: number | null) {
  return value === null ? "n/a" : `${(value * 100).toFixed(1)}%`;
}

function buildSections(
  status: ReplayWithSignalPackageInspectionReportStatus,
  summary: ReplayWithSignalPackageStaticSummary,
  nextStep: string,
): ReplayWithSignalPackageInspectionReportSection[] {
  const safetySeverity =
    status === "unsafe_input_detected"
      ? "danger"
      : status === "blocked"
        ? "warning"
        : "success";

  return [
    {
      section_id: "safety",
      title: "Safety",
      severity: safetySeverity,
      bullets: [
        `Generated from static inputs: yes`,
        `Production runtime touched: no`,
        `Provider call executed: ${summary.provider_call_executed ? "yes" : "no"}`,
        `Supabase write executed: ${summary.supabase_write_executed ? "yes" : "no"}`,
        `Synthetic outcomes persisted: ${
          summary.synthetic_outcomes_persisted ? "yes" : "no"
        }`,
        `Scanner behavior changed: ${summary.scanner_behavior_changed ? "yes" : "no"}`,
        `Live ranking changed: ${summary.live_ranking_changed ? "yes" : "no"}`,
        `Recommendation rows mutated: ${
          summary.recommendation_rows_mutated ? "yes" : "no"
        }`,
      ],
    },
    {
      section_id: "outcome_breakdown",
      title: "Outcome Breakdown",
      severity: summary.interpreted_results > 0 ? "info" : "warning",
      bullets: [
        `Total results: ${summary.total_results}`,
        `Interpreted results: ${summary.interpreted_results}`,
        `Blocked results: ${summary.blocked_results}`,
        `Failed results: ${summary.failed_results}`,
        `Target hits: ${summary.outcome_breakdown.target_hit} (${pct(
          summary.target_hit_rate,
        )})`,
        `Stop hits: ${summary.outcome_breakdown.stop_hit} (${pct(
          summary.stop_hit_rate,
        )})`,
        `No entry: ${summary.outcome_breakdown.no_entry_triggered} (${pct(
          summary.no_entry_rate,
        )})`,
        `Open at window end: ${summary.outcome_breakdown.open_at_window_end} (${pct(
          summary.open_at_window_end_rate,
        )})`,
        `Ambiguous intrabar: ${
          summary.outcome_breakdown.ambiguous_intrabar_conservative_stop
        } (${pct(summary.ambiguity_rate)})`,
      ],
    },
    {
      section_id: "r_multiple_summary",
      title: "R Multiple Summary",
      severity: summary.average_gross_r_multiple === null ? "warning" : "info",
      bullets: [
        `Average gross R: ${fixed(summary.average_gross_r_multiple)}`,
        `Best gross R: ${fixed(summary.best_gross_r_multiple)}`,
        `Worst gross R: ${fixed(summary.worst_gross_r_multiple)}`,
        `Replay executed count: ${summary.replay_executed_count}`,
      ],
    },
    {
      section_id: "interpretation",
      title: "Interpretation",
      severity:
        status === "unsafe_input_detected"
          ? "danger"
          : status === "safe_report_available"
            ? "success"
            : "warning",
      bullets: [
        `Report status: ${status}`,
        `Summary status: ${summary.summary_status}`,
        `Interpretation label: ${summary.interpretation_label}`,
        `Warnings: ${summary.warnings.length > 0 ? summary.warnings.join(", ") : "none"}`,
        `Blockers: ${summary.blockers.length > 0 ? summary.blockers.join(", ") : "none"}`,
      ],
    },
    {
      section_id: "recommended_next_step",
      title: "Recommended Next Step",
      severity: status === "safe_report_available" ? "info" : "warning",
      bullets: [nextStep],
    },
  ];
}

export function buildReplayWithSignalPackageStaticInspectionReport(
  results: ReplayWithSignalPackageResult[],
): ReplayWithSignalPackageStaticInspectionReport {
  const summary = buildReplayWithSignalPackageStaticSummary(results);
  const report_status = reportStatusFromSummary(summary);
  const recommended_next_step = recommendedNextStep(report_status, summary);

  return {
    report_status,
    generated_from_static_inputs: true,
    production_runtime_touched: false,
    provider_call_executed: false,
    supabase_write_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendation_rows_mutated: false,
    summary,
    sections: buildSections(report_status, summary, recommended_next_step),
    blockers: summary.blockers,
    warnings: summary.warnings,
    recommended_next_step,
  };
}

export function renderReplayWithSignalPackageInspectionReportMarkdown(
  report: ReplayWithSignalPackageStaticInspectionReport,
): string {
  const lines = [
    "# Replay With Signal Package Static Inspection Report",
    "",
    `Report status: ${report.report_status}`,
    `Recommended next step: ${report.recommended_next_step}`,
    "",
  ];

  for (const section of report.sections) {
    lines.push(`## ${section.title}`, `Severity: ${section.severity}`, "");
    for (const bullet of section.bullets) {
      lines.push(`- ${bullet}`);
    }
    lines.push("");
  }

  lines.push(
    "No-effect flags:",
    `- Production runtime touched: ${report.production_runtime_touched ? "yes" : "no"}`,
    `- Provider call executed: ${report.provider_call_executed ? "yes" : "no"}`,
    `- Supabase write executed: ${report.supabase_write_executed ? "yes" : "no"}`,
    `- Synthetic outcomes persisted: ${
      report.synthetic_outcomes_persisted ? "yes" : "no"
    }`,
    `- Scanner behavior changed: ${report.scanner_behavior_changed ? "yes" : "no"}`,
    `- Live ranking changed: ${report.live_ranking_changed ? "yes" : "no"}`,
    `- Recommendation rows mutated: ${
      report.recommendation_rows_mutated ? "yes" : "no"
    }`,
    "",
  );

  return lines.join("\n");
}

export function assertReplayWithSignalPackageInspectionReportSafety(
  report: ReplayWithSignalPackageStaticInspectionReport,
): { ok: boolean; blockers: string[] } {
  const summarySafety = assertReplayWithSignalPackageSummarySafety(report.summary);
  const blockers = [...summarySafety.blockers];

  if (report.production_runtime_touched) blockers.push("production_runtime_touched");
  if (report.provider_call_executed) blockers.push("provider_call_executed");
  if (report.supabase_write_executed) blockers.push("supabase_write_executed");
  if (report.synthetic_outcomes_persisted) {
    blockers.push("synthetic_outcomes_persisted");
  }
  if (report.scanner_behavior_changed) blockers.push("scanner_behavior_changed");
  if (report.live_ranking_changed) blockers.push("live_ranking_changed");
  if (report.recommendation_rows_mutated) {
    blockers.push("recommendation_rows_mutated");
  }

  return {
    ok: blockers.length === 0,
    blockers: Array.from(new Set(blockers)),
  };
}
