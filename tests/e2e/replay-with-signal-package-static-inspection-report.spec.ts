import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  buildBlockedReplayWithSignalPackageResult,
  type ReplayWithSignalPackageResult,
} from "../../lib/replay-with-signal-package-result-model";
import {
  buildLongFixtureSimulationInput,
  selectedAaplReplaySignalPackageFixture,
} from "../../lib/replay-with-signal-package-static-fixtures";
import { simulateReplayWithSignalPackage } from "../../lib/replay-with-signal-package-static-simulation";
import {
  assertReplayWithSignalPackageInspectionReportSafety,
  buildReplayWithSignalPackageStaticInspectionReport,
  renderReplayWithSignalPackageInspectionReportMarkdown,
} from "../../lib/replay-with-signal-package-static-inspection-report";

const reportPath = join(
  process.cwd(),
  "lib/replay-with-signal-package-static-inspection-report.ts",
);
const docPath = join(
  process.cwd(),
  "docs/replay-with-signal-package-static-inspection-report.md",
);

function fixtureResult(kind: Parameters<typeof buildLongFixtureSimulationInput>[0]) {
  return simulateReplayWithSignalPackage(buildLongFixtureSimulationInput(kind));
}

function blockedResult(): ReplayWithSignalPackageResult {
  return buildBlockedReplayWithSignalPackageResult({
    source_verification: "inspection_report_test",
    candidate_id: selectedAaplReplaySignalPackageFixture.candidate_id,
    source_type: selectedAaplReplaySignalPackageFixture.source_type,
    source_row_id: selectedAaplReplaySignalPackageFixture.source_row_id,
    ticker: selectedAaplReplaySignalPackageFixture.ticker,
    interval: selectedAaplReplaySignalPackageFixture.interval,
    trading_day: selectedAaplReplaySignalPackageFixture.trading_day,
    analysis_cutoff: selectedAaplReplaySignalPackageFixture.analysis_cutoff,
    direction: selectedAaplReplaySignalPackageFixture.direction,
    planned_entry: selectedAaplReplaySignalPackageFixture.planned_entry,
    planned_stop: selectedAaplReplaySignalPackageFixture.planned_stop,
    planned_target: selectedAaplReplaySignalPackageFixture.planned_target,
    execution_status: "blocked_missing_candles",
    blockers: ["missing_candles"],
  });
}

test("empty results produce empty report", () => {
  const report = buildReplayWithSignalPackageStaticInspectionReport([]);

  expect(report.report_status).toBe("empty");
  expect(report.generated_from_static_inputs).toBe(true);
  expect(report.production_runtime_touched).toBe(false);
  expect(report.summary.summary_status).toBe("empty");
  expect(report.recommended_next_step).toBe("add_static_replay_results_before_review");
});

test("safe fixture simulation results produce safe_report_available", () => {
  const report = buildReplayWithSignalPackageStaticInspectionReport([
    fixtureResult("target_hit"),
    fixtureResult("stop_hit"),
    fixtureResult("open_at_window_end"),
    fixtureResult("no_entry"),
  ]);

  expect(report.report_status).toBe("safe_report_available");
  expect(report.summary.interpreted_results).toBe(4);
  expect(report.provider_call_executed).toBe(false);
  expect(report.supabase_write_executed).toBe(false);
  expect(report.synthetic_outcomes_persisted).toBe(false);
  expect(report.scanner_behavior_changed).toBe(false);
  expect(report.live_ranking_changed).toBe(false);
  expect(report.recommendation_rows_mutated).toBe(false);
});

test("unsafe input produces unsafe_input_detected", () => {
  const unsafe = {
    ...fixtureResult("target_hit"),
    provider_call_executed: true,
    supabase_write_executed: true,
    synthetic_outcomes_persisted: true,
    scanner_behavior_changed: true,
    live_ranking_changed: true,
    recommendation_rows_mutated: true,
  };
  const report = buildReplayWithSignalPackageStaticInspectionReport([unsafe]);

  expect(report.report_status).toBe("unsafe_input_detected");
  expect(report.summary.summary_status).toBe("unsafe_input_detected");
  expect(report.sections.find((section) => section.section_id === "safety")).toMatchObject({
    severity: "danger",
  });
  expect(assertReplayWithSignalPackageInspectionReportSafety(report)).toMatchObject({
    ok: false,
  });
});

test("blocked-only results produce blocked report", () => {
  const report = buildReplayWithSignalPackageStaticInspectionReport([
    blockedResult(),
    blockedResult(),
  ]);

  expect(report.report_status).toBe("blocked");
  expect(report.summary.interpreted_results).toBe(0);
  expect(report.summary.blocked_results).toBe(2);
  expect(report.recommended_next_step).toBe("inspect_blockers_before_expanding_samples");
});

test("report includes required deterministic sections", () => {
  const report = buildReplayWithSignalPackageStaticInspectionReport([
    fixtureResult("target_hit"),
  ]);
  const sectionIds = report.sections.map((section) => section.section_id);
  const titles = report.sections.map((section) => section.title);

  expect(sectionIds).toEqual([
    "safety",
    "outcome_breakdown",
    "r_multiple_summary",
    "interpretation",
    "recommended_next_step",
  ]);
  expect(titles).toEqual([
    "Safety",
    "Outcome Breakdown",
    "R Multiple Summary",
    "Interpretation",
    "Recommended Next Step",
  ]);
});

test("markdown renderer is deterministic and timestamp free", () => {
  const report = buildReplayWithSignalPackageStaticInspectionReport([
    fixtureResult("target_hit"),
    fixtureResult("open_at_window_end"),
  ]);
  const first = renderReplayWithSignalPackageInspectionReportMarkdown(report);
  const second = renderReplayWithSignalPackageInspectionReportMarkdown(report);

  expect(first).toBe(second);
  expect(first).toContain("# Replay With Signal Package Static Inspection Report");
  expect(first).toContain("## Safety");
  expect(first).toContain("## Outcome Breakdown");
  expect(first).toContain("## R Multiple Summary");
  expect(first).toContain("## Interpretation");
  expect(first).toContain("## Recommended Next Step");
  expect(first).not.toContain("T00:");
  expect(first).not.toContain("Generated at");
  expect(first).not.toContain("Date");
});

test("safety assertion passes for safe fixture report and blocks unsafe report", () => {
  const safeReport = buildReplayWithSignalPackageStaticInspectionReport([
    fixtureResult("target_hit"),
    fixtureResult("no_entry"),
  ]);
  const unsafeReport = buildReplayWithSignalPackageStaticInspectionReport([
    { ...fixtureResult("target_hit"), provider_call_executed: true },
  ]);

  expect(assertReplayWithSignalPackageInspectionReportSafety(safeReport)).toEqual({
    ok: true,
    blockers: [],
  });
  expect(
    assertReplayWithSignalPackageInspectionReportSafety(unsafeReport).blockers,
  ).toEqual(
    expect.arrayContaining([
      "provider_call_executed",
      "unsafe_no_effect_flags_detected",
      "unsafe_input_detected",
    ]),
  );
});

test("report source is static with no env provider Supabase or runtime imports", () => {
  const source = readFileSync(reportPath, "utf8");

  expect(source).toContain("@/lib/replay-with-signal-package-result-model");
  expect(source).toContain("@/lib/replay-with-signal-package-static-summary");
  expect(source).not.toContain("@/lib/replay-with-signal-package-static-fixtures");
  expect(source).not.toContain("@supabase");
  expect(source).not.toContain("supabase-js");
  expect(source).not.toContain("TWELVE_DATA");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("app/api");
  expect(source).not.toContain("@/lib/scanner");
  expect(source).not.toContain("real-scanner");
  expect(source).not.toContain("@/lib/broker");
  expect(source).not.toContain("@/lib/execution");
  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("new Date");
  expect(source).not.toContain("window.");
  expect(source).not.toContain("globalThis");
});

test("docs include relationship sections and no-effect guarantee", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 310");
  expect(doc).toContain("Action 311");
  expect(doc).toContain("Action 312");
  expect(doc).toContain("Action 313");
  expect(doc).toContain("safe_report_available");
  expect(doc).toContain("Markdown");
  expect(doc).toContain(
    "does not execute replay in production, call providers, read/write Supabase",
  );
  expect(doc).toContain("affect scanner/ranking");
});

test("Action 314 adds no app api route and does not modify proxy", () => {
  let actionRoutes = "";
  try {
    actionRoutes = execFileSync(
      "rg",
      [
        "--files",
        "app",
        "-g",
        "*314*",
        "-g",
        "*inspection-report*",
        "-g",
        "*replay-with-signal-package*",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ).trim();
  } catch {
    actionRoutes = "";
  }

  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );

  expect(actionRoutes).toBe("");
  expect(existsSync(join(process.cwd(), "proxy.ts"))).toBe(true);
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 guard still passes after adding static inspection report", () => {
  const output = execFileSync(
    "node",
    ["scripts/action-309-post-recovery-safety-guard.mjs"],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  const parsed = JSON.parse(output);

  expect(parsed.guard_status).toBe("passed");
  expect(parsed.forbidden_artifacts_found).toEqual([]);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
});
