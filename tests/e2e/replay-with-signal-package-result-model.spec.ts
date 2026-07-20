import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  buildAmbiguousIntrabarReplayWithSignalPackageResult,
  buildBlockedReplayWithSignalPackageResult,
  buildNoEntryReplayWithSignalPackageResult,
  buildOpenAtWindowEndReplayWithSignalPackageResult,
  buildStopHitReplayWithSignalPackageResult,
  buildTargetHitReplayWithSignalPackageResult,
  validateReplayWithSignalPackageResultSafety,
  type ReplayWithSignalPackageResult,
  type ReplayWithSignalPackageResultInput,
} from "../../lib/replay-with-signal-package-result-model";

const modelPath = join(
  process.cwd(),
  "lib/replay-with-signal-package-result-model.ts",
);
const docPath = join(process.cwd(), "docs/replay-with-signal-package-result-model.md");

const baseInput: ReplayWithSignalPackageResultInput = {
  source_verification: "static_model_fixture",
  candidate_id: "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  source_type: "recommendation_row",
  source_row_id: "7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  ticker: "AAPL",
  interval: "5min",
  trading_day: "2026-07-08",
  analysis_cutoff: "2026-07-08T13:49:19.521608+00:00",
  direction: "long",
  planned_entry: 304.86,
  planned_stop: 295.62,
  planned_target: 334.12,
  candles_read: 73,
  candles_verified: 73,
  lookahead_safety_passed: true,
  entry_timestamp: "2026-07-08T13:50:00.000Z",
  exit_timestamp: "2026-07-08T19:45:00.000Z",
};

function expectSafe(result: ReplayWithSignalPackageResult) {
  const validation = validateReplayWithSignalPackageResultSafety(result);

  expect(validation).toEqual({
    ok: true,
    errors: [],
    warnings: [],
  });
}

test("builders return expected execution and outcome statuses", () => {
  expect(
    buildBlockedReplayWithSignalPackageResult({
      ...baseInput,
      execution_status: "blocked_missing_candles",
      blockers: ["missing_candles"],
    }),
  ).toMatchObject({
    execution_status: "blocked_missing_candles",
    outcome_status: "blocked",
    counterfactual_result_available: false,
    replay_executed: false,
  });
  expect(buildNoEntryReplayWithSignalPackageResult(baseInput)).toMatchObject({
    execution_status: "replay_with_signal_package_completed",
    outcome_status: "no_entry_triggered",
    counterfactual_result_available: true,
  });
  expect(buildOpenAtWindowEndReplayWithSignalPackageResult(baseInput)).toMatchObject({
    execution_status: "replay_with_signal_package_completed",
    outcome_status: "open_at_window_end",
    counterfactual_result_available: true,
  });
  expect(buildTargetHitReplayWithSignalPackageResult(baseInput)).toMatchObject({
    execution_status: "replay_with_signal_package_completed",
    outcome_status: "target_hit",
    target_touched: true,
  });
  expect(buildStopHitReplayWithSignalPackageResult(baseInput)).toMatchObject({
    execution_status: "replay_with_signal_package_completed",
    outcome_status: "stop_hit",
    stop_touched: true,
  });
  expect(buildAmbiguousIntrabarReplayWithSignalPackageResult(baseInput)).toMatchObject({
    execution_status: "replay_with_signal_package_completed",
    outcome_status: "ambiguous_intrabar_conservative_stop",
    stop_touched: true,
    target_touched: true,
  });
});

test("safety validator passes for safe no-effect results", () => {
  expectSafe(buildNoEntryReplayWithSignalPackageResult(baseInput));
  expectSafe(buildOpenAtWindowEndReplayWithSignalPackageResult(baseInput));
  expectSafe(buildTargetHitReplayWithSignalPackageResult(baseInput));
  expectSafe(buildStopHitReplayWithSignalPackageResult(baseInput));
  expectSafe(buildAmbiguousIntrabarReplayWithSignalPackageResult(baseInput));
  expectSafe(
    buildBlockedReplayWithSignalPackageResult({
      ...baseInput,
      blockers: ["not_approved"],
    }),
  );
});

test("safety validator fails for unsafe persistence provider scanner and ranking effects", () => {
  const safe = buildTargetHitReplayWithSignalPackageResult(baseInput);

  expect(
    validateReplayWithSignalPackageResultSafety({
      ...safe,
      synthetic_outcomes_persisted: true,
    }).errors,
  ).toContain("synthetic_outcomes_persisted_must_be_false");
  expect(
    validateReplayWithSignalPackageResultSafety({
      ...safe,
      supabase_write_executed: true,
    }).errors,
  ).toContain("supabase_write_executed_must_be_false");
  expect(
    validateReplayWithSignalPackageResultSafety({
      ...safe,
      provider_call_executed: true,
    }).errors,
  ).toContain("provider_call_executed_must_be_false");
  expect(
    validateReplayWithSignalPackageResultSafety({
      ...safe,
      scanner_behavior_changed: true,
      live_ranking_changed: true,
    }).errors,
  ).toEqual(
    expect.arrayContaining([
      "scanner_behavior_changed_must_be_false",
      "live_ranking_changed_must_be_false",
    ]),
  );
  expect(
    validateReplayWithSignalPackageResultSafety({
      ...safe,
      recommendation_rows_mutated: true,
    }).errors,
  ).toContain("recommendation_rows_mutated_must_be_false");
});

test("blocked and failed results require blockers", () => {
  const blocked = buildBlockedReplayWithSignalPackageResult({
    ...baseInput,
    execution_status: "blocked_missing_analysis_cutoff",
    blockers: ["missing_analysis_cutoff"],
  });
  const failed = buildBlockedReplayWithSignalPackageResult({
    ...baseInput,
    execution_status: "failed",
    blockers: ["unexpected_failure"],
  });

  expectSafe(blocked);
  expectSafe(failed);
  expect(
    validateReplayWithSignalPackageResultSafety({
      ...blocked,
      blockers: [],
    }).errors,
  ).toContain("blockers_required_for_blocked_or_failed_result");
  expect(
    validateReplayWithSignalPackageResultSafety({
      ...failed,
      blockers: [],
    }).errors,
  ).toContain("blockers_required_for_blocked_or_failed_result");
});

test("model source is static and has no env provider Supabase runtime imports", () => {
  const source = readFileSync(modelPath, "utf8");

  expect(source).not.toMatch(/^import\s/m);
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("process.");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("createClient");
  expect(source).not.toContain("@supabase");
  expect(source).not.toContain("supabase-js");
  expect(source).not.toContain("TWELVE_DATA");
  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("new Date");
  expect(source).not.toContain("window.");
  expect(source).not.toContain("globalThis");
});

test("docs include AAPL fixture and no-effect statement", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain(
    "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  );
  expect(doc).toContain('"ticker": "AAPL"');
  expect(doc).toContain('"interval": "5min"');
  expect(doc).toContain('"trading_day": "2026-07-08"');
  expect(doc).toContain('"analysis_cutoff": "2026-07-08T13:49:19.521608+00:00"');
  expect(doc).toContain('"direction": "long"');
  expect(doc).toContain('"planned_entry": 304.86');
  expect(doc).toContain('"planned_stop": 295.62');
  expect(doc).toContain('"planned_target": 334.12');
  expect(doc).toContain(
    "This model does not execute replay, write Supabase, persist synthetic outcomes, or affect scanner/ranking.",
  );
});

test("Action 310 adds no app api route and does not modify proxy", () => {
  const status = execFileSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const proxyDiff = execFileSync("git", ["diff", "--name-only", "HEAD", "--", "proxy.ts"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  expect(status).not.toMatch(/^(..|\?\?) app\/api\//m);
  expect(status).not.toMatch(/^(..|\?\?) app\/[^/]+\/page\.tsx/m);
  expect(proxyDiff.trim()).toBe("");
});

test("Action 309 guard still passes after adding static result model", () => {
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
