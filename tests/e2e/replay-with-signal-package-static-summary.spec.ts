import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  buildBlockedReplayWithSignalPackageResult,
  type ReplayWithSignalPackageResult,
} from "../../lib/replay-with-signal-package-result-model";
import {
  buildLongFixtureSimulationInput,
  buildShortFixtureSimulationInput,
  selectedAaplReplaySignalPackageFixture,
} from "../../lib/replay-with-signal-package-static-fixtures";
import { simulateReplayWithSignalPackage } from "../../lib/replay-with-signal-package-static-simulation";
import {
  assertReplayWithSignalPackageSummarySafety,
  buildReplayWithSignalPackageStaticSummary,
  classifyReplayWithSignalPackageSummary,
} from "../../lib/replay-with-signal-package-static-summary";

const summaryPath = join(
  process.cwd(),
  "lib/replay-with-signal-package-static-summary.ts",
);
const docPath = join(
  process.cwd(),
  "docs/replay-with-signal-package-static-summary.md",
);

function result(kind: Parameters<typeof buildLongFixtureSimulationInput>[0]) {
  return simulateReplayWithSignalPackage(buildLongFixtureSimulationInput(kind));
}

function shortResult(kind: Parameters<typeof buildShortFixtureSimulationInput>[0]) {
  return simulateReplayWithSignalPackage(buildShortFixtureSimulationInput(kind));
}

function blockedResult(): ReplayWithSignalPackageResult {
  return buildBlockedReplayWithSignalPackageResult({
    source_verification: "summary_test",
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

function failedResult(): ReplayWithSignalPackageResult {
  return buildBlockedReplayWithSignalPackageResult({
    ...blockedResult(),
    execution_status: "failed",
    outcome_status: "failed",
    blockers: ["unexpected_failure"],
  });
}

test("empty input returns summary_status empty and no_results classification", () => {
  const summary = buildReplayWithSignalPackageStaticSummary([]);

  expect(summary.summary_status).toBe("empty");
  expect(summary.total_results).toBe(0);
  expect(summary.interpreted_results).toBe(0);
  expect(summary.average_gross_r_multiple).toBeNull();
  expect(summary.target_hit_rate).toBeNull();
  expect(summary.interpretation_label).toBe("no_results");
  expect(classifyReplayWithSignalPackageSummary(summary)).toBe("no_results");
  expect(assertReplayWithSignalPackageSummarySafety(summary)).toEqual({
    ok: true,
    blockers: [],
  });
});

test("fixture simulation results produce expected counts and outcome breakdown", () => {
  const results = [
    result("no_entry"),
    result("target_hit"),
    result("stop_hit"),
    result("open_at_window_end"),
    result("ambiguous_same_candle"),
    blockedResult(),
    failedResult(),
  ];
  const summary = buildReplayWithSignalPackageStaticSummary(results);

  expect(summary.summary_status).toBe("safe_summary_available");
  expect(summary.total_results).toBe(7);
  expect(summary.interpreted_results).toBe(5);
  expect(summary.blocked_results).toBe(1);
  expect(summary.failed_results).toBe(1);
  expect(summary.unsafe_results).toBe(0);
  expect(summary.outcome_breakdown).toMatchObject({
    total_results: 7,
    counterfactual_results_available: 5,
    no_entry_triggered: 1,
    target_hit: 1,
    stop_hit: 1,
    open_at_window_end: 1,
    ambiguous_intrabar_conservative_stop: 1,
    blocked: 1,
    failed: 1,
  });
  expect(summary.replay_executed_count).toBe(5);
});

test("average best and worst R multiple calculations ignore null values", () => {
  const summary = buildReplayWithSignalPackageStaticSummary([
    result("no_entry"),
    result("target_hit"),
    result("stop_hit"),
    result("open_at_window_end"),
  ]);

  expect(summary.best_gross_r_multiple).toBeGreaterThan(3);
  expect(summary.worst_gross_r_multiple).toBe(-1);
  expect(summary.average_gross_r_multiple).not.toBeNull();
  expect(summary.average_gross_r_multiple).toBeCloseTo(
    ((summary.best_gross_r_multiple ?? 0) - 1 + (result("open_at_window_end").gross_r_multiple ?? 0)) /
      3,
    10,
  );
});

test("rates use interpreted_results denominator and exclude blocked failed results", () => {
  const summary = buildReplayWithSignalPackageStaticSummary([
    result("target_hit"),
    result("stop_hit"),
    result("no_entry"),
    result("open_at_window_end"),
    blockedResult(),
    failedResult(),
  ]);

  expect(summary.interpreted_results).toBe(4);
  expect(summary.target_hit_rate).toBe(0.25);
  expect(summary.stop_hit_rate).toBe(0.25);
  expect(summary.no_entry_rate).toBe(0.25);
  expect(summary.open_at_window_end_rate).toBe(0.25);
  expect(summary.ambiguity_rate).toBe(0);
});

test("unsafe flags make summary unsafe and safety assertion blocks", () => {
  const safe = result("target_hit");
  const unsafeResults: ReplayWithSignalPackageResult[] = [
    { ...safe, provider_call_executed: true },
    { ...safe, supabase_write_executed: true },
    { ...safe, synthetic_outcomes_persisted: true },
    { ...safe, scanner_behavior_changed: true },
    { ...safe, live_ranking_changed: true },
    { ...safe, recommendation_rows_mutated: true },
  ];
  const summary = buildReplayWithSignalPackageStaticSummary(unsafeResults);
  const safety = assertReplayWithSignalPackageSummarySafety(summary);

  expect(summary.summary_status).toBe("unsafe_input_detected");
  expect(summary.unsafe_results).toBe(6);
  expect(summary.all_no_effect_flags_safe).toBe(false);
  expect(summary.provider_call_executed).toBe(true);
  expect(summary.supabase_write_executed).toBe(true);
  expect(summary.synthetic_outcomes_persisted).toBe(true);
  expect(summary.scanner_behavior_changed).toBe(true);
  expect(summary.live_ranking_changed).toBe(true);
  expect(summary.recommendation_rows_mutated).toBe(true);
  expect(summary.interpretation_label).toBe("unsafe_summary");
  expect(safety.ok).toBe(false);
  expect(safety.blockers).toEqual(
    expect.arrayContaining([
      "unsafe_no_effect_flags_detected",
      "unsafe_input_detected",
      "provider_call_executed",
      "supabase_write_executed",
      "synthetic_outcomes_persisted",
      "scanner_behavior_changed",
      "live_ranking_changed",
      "recommendation_rows_mutated",
    ]),
  );
});

test("classification labels are stable for core summary shapes", () => {
  expect(
    buildReplayWithSignalPackageStaticSummary([blockedResult(), failedResult()])
      .interpretation_label,
  ).toBe("all_blocked_or_failed");
  expect(
    buildReplayWithSignalPackageStaticSummary([
      result("ambiguous_same_candle"),
      result("target_hit"),
    ]).interpretation_label,
  ).toBe("ambiguity_detected");
  expect(
    buildReplayWithSignalPackageStaticSummary([
      result("no_entry"),
      result("no_entry"),
      result("target_hit"),
    ]).interpretation_label,
  ).toBe("mostly_no_entry");
  expect(
    buildReplayWithSignalPackageStaticSummary([
      result("open_at_window_end"),
      result("open_at_window_end"),
      result("stop_hit"),
    ]).interpretation_label,
  ).toBe("mostly_open_at_window_end");
  expect(
    buildReplayWithSignalPackageStaticSummary([
      result("target_hit"),
      result("open_at_window_end"),
    ]).interpretation_label,
  ).toBe("target_positive_sample");
  expect(
    buildReplayWithSignalPackageStaticSummary([
      result("stop_hit"),
      result("stop_hit"),
      result("target_hit"),
    ]).interpretation_label,
  ).toBe("stop_negative_sample");
  expect(
    buildReplayWithSignalPackageStaticSummary([
      result("stop_hit"),
      result("target_hit"),
    ]).interpretation_label,
  ).toBe("target_positive_sample");
});

test("safety assertion passes for safe long and short fixture simulations", () => {
  const summary = buildReplayWithSignalPackageStaticSummary([
    result("target_hit"),
    result("stop_hit"),
    shortResult("target_hit"),
    shortResult("open_at_window_end"),
  ]);

  expect(summary.summary_status).toBe("safe_summary_available");
  expect(summary.all_no_effect_flags_safe).toBe(true);
  expect(assertReplayWithSignalPackageSummarySafety(summary)).toEqual({
    ok: true,
    blockers: [],
  });
});

test("summary source is static and has no env provider Supabase runtime imports", () => {
  const source = readFileSync(summaryPath, "utf8");

  expect(source).toContain("@/lib/replay-with-signal-package-result-model");
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

test("summary docs include aggregation labels and no-effect guarantee", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("ReplayWithSignalPackageStaticSummary");
  expect(doc).toContain("average_gross_r_multiple");
  expect(doc).toContain("best_gross_r_multiple");
  expect(doc).toContain("worst_gross_r_multiple");
  expect(doc).toContain("all_no_effect_flags_safe");
  expect(doc).toContain("unsafe_input_detected");
  expect(doc).toContain("ambiguity_detected");
  expect(doc).toContain("mostly_no_entry");
  expect(doc).toContain("mostly_open_at_window_end");
  expect(doc).toContain(
    "This summary evaluator is pure/in-memory and does not execute replay in production, call providers, read/write Supabase, persist synthetic outcomes, mutate recommendations, or affect scanner/ranking.",
  );
});

test("Action 313 adds no app api route and does not modify proxy", () => {
  const status = execFileSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const proxyDiff = execFileSync(
    "git",
    ["diff", "--name-only", "HEAD", "--", "proxy.ts"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
    },
  );

  expect(status).not.toMatch(/^(..|\?\?) app\/api\//m);
  expect(status).not.toMatch(/^(..|\?\?) app\/[^/]+\/page\.tsx/m);
  expect(proxyDiff.trim()).toBe("");
});

test("Action 309 guard still passes after adding static summary evaluator", () => {
  const output = execFileSync(
    "node",
    ["scripts/action-309-post-recovery-safety-guard.mjs"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
        TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
        SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      },
    },
  );
  const parsed = JSON.parse(output);

  expect(parsed.guard_status).toBe("passed");
  expect(parsed.forbidden_artifacts_found).toEqual([]);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.proxy_modified_from_head).toBe(false);
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
});
