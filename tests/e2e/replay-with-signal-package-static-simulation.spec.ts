import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  simulateReplayWithSignalPackage,
  type ReplaySignalPackageInput,
  type ReplaySimulationCandle,
  type ReplaySimulationInput,
} from "../../lib/replay-with-signal-package-static-simulation";
import { validateReplayWithSignalPackageResultSafety } from "../../lib/replay-with-signal-package-result-model";

const simulationPath = join(
  process.cwd(),
  "lib/replay-with-signal-package-static-simulation.ts",
);
const docPath = join(
  process.cwd(),
  "docs/replay-with-signal-package-static-simulation.md",
);

const longSignal: ReplaySignalPackageInput = {
  candidate_id: "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  source_type: "recommendation_row",
  source_row_id: "7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  ticker: "AAPL",
  interval: "5min",
  trading_day: "2026-07-08",
  analysis_cutoff: "2026-07-08T13:49:19.521608+00:00",
  direction: "long",
  planned_entry: 100,
  planned_stop: 95,
  planned_target: 112.5,
};

const shortSignal: ReplaySignalPackageInput = {
  ...longSignal,
  direction: "short",
  planned_entry: 100,
  planned_stop: 105,
  planned_target: 90,
};

function candle(
  timestamp: string,
  open: number,
  high: number,
  low: number,
  close: number,
): ReplaySimulationCandle {
  return { timestamp, open, high, low, close };
}

function input(
  signalPackage: ReplaySignalPackageInput,
  candles: ReplaySimulationCandle[],
  overrides: Partial<ReplaySimulationInput> = {},
): ReplaySimulationInput {
  return {
    source_verification: "static_simulation_test",
    signal_package: signalPackage,
    candles,
    conservative_same_candle_rule: true,
    ...overrides,
  };
}

function expectSafe(result: ReturnType<typeof simulateReplayWithSignalPackage>) {
  expect(validateReplayWithSignalPackageResultSafety(result)).toEqual({
    ok: true,
    errors: [],
    warnings: [],
  });
}

test("blocks when candles are missing or cutoff is missing", () => {
  expect(simulateReplayWithSignalPackage(input(longSignal, []))).toMatchObject({
    execution_status: "blocked_missing_candles",
    outcome_status: "blocked",
    blockers: ["missing_candles"],
    replay_executed: false,
  });

  expect(
    simulateReplayWithSignalPackage(
      input(
        { ...longSignal, analysis_cutoff: null },
        [candle("2026-07-08T13:50:00.000Z", 99, 101, 98, 100)],
      ),
    ),
  ).toMatchObject({
    execution_status: "blocked_missing_analysis_cutoff",
    outcome_status: "blocked",
    blockers: ["missing_analysis_cutoff"],
    replay_executed: false,
  });
});

test("blocks invalid long and short risk geometry", () => {
  const longResult = simulateReplayWithSignalPackage(
    input(
      { ...longSignal, planned_stop: 101 },
      [candle("2026-07-08T13:50:00.000Z", 99, 101, 98, 100)],
    ),
  );
  const shortResult = simulateReplayWithSignalPackage(
    input(
      { ...shortSignal, planned_stop: 99 },
      [candle("2026-07-08T13:50:00.000Z", 101, 102, 99, 100)],
    ),
  );

  expect(longResult).toMatchObject({
    execution_status: "blocked_signal_package_validation_failed",
    blockers: ["invalid_risk_geometry"],
    replay_executed: false,
  });
  expect(shortResult).toMatchObject({
    execution_status: "blocked_signal_package_validation_failed",
    blockers: ["invalid_risk_geometry"],
    replay_executed: false,
  });
});

test("validates expected candle row count when provided", () => {
  const result = simulateReplayWithSignalPackage(
    input(
      longSignal,
      [candle("2026-07-08T13:50:00.000Z", 99, 101, 98, 100)],
      { expected_candle_rows: 2 },
    ),
  );

  expect(result).toMatchObject({
    execution_status: "blocked_candle_verification_failed",
    outcome_status: "blocked",
    blockers: ["expected_candle_rows_mismatch"],
    replay_executed: false,
  });
});

test("simulates long no entry target stop open and same-candle ambiguity", () => {
  const noEntry = simulateReplayWithSignalPackage(
    input(longSignal, [
      candle("2026-07-08T13:50:00.000Z", 98, 99.5, 97, 98.5),
      candle("2026-07-08T13:55:00.000Z", 98.5, 99.8, 98, 99),
    ]),
  );
  const target = simulateReplayWithSignalPackage(
    input(longSignal, [
      candle("2026-07-08T13:50:00.000Z", 99, 101, 98, 100.5),
      candle("2026-07-08T13:55:00.000Z", 100.5, 113, 100, 112.5),
    ]),
  );
  const stop = simulateReplayWithSignalPackage(
    input(longSignal, [
      candle("2026-07-08T13:50:00.000Z", 99, 101, 98, 100.5),
      candle("2026-07-08T13:55:00.000Z", 100.5, 101, 94.5, 95),
    ]),
  );
  const open = simulateReplayWithSignalPackage(
    input(longSignal, [
      candle("2026-07-08T13:50:00.000Z", 99, 101, 98, 100.5),
      candle("2026-07-08T13:55:00.000Z", 100.5, 104, 99, 103),
    ]),
  );
  const ambiguous = simulateReplayWithSignalPackage(
    input(longSignal, [
      candle("2026-07-08T13:50:00.000Z", 99, 113, 94.5, 100),
    ]),
  );

  expect(noEntry).toMatchObject({
    outcome_status: "no_entry_triggered",
    entry_touched: false,
    gross_r_multiple: null,
  });
  expect(target).toMatchObject({
    outcome_status: "target_hit",
    entry_timestamp: "2026-07-08T13:50:00.000Z",
    exit_timestamp: "2026-07-08T13:55:00.000Z",
    gross_price_move: 12.5,
    gross_r_multiple: 2.5,
  });
  expect(stop).toMatchObject({
    outcome_status: "stop_hit",
    gross_price_move: -5,
    gross_r_multiple: -1,
  });
  expect(open).toMatchObject({
    outcome_status: "open_at_window_end",
    exit_timestamp: "2026-07-08T13:55:00.000Z",
    gross_price_move: 3,
    gross_r_multiple: 0.6,
  });
  expect(ambiguous).toMatchObject({
    outcome_status: "ambiguous_intrabar_conservative_stop",
    stop_touched: true,
    target_touched: true,
    gross_r_multiple: -1,
  });

  [noEntry, target, stop, open, ambiguous].forEach(expectSafe);
});

test("simulates short no entry target stop and same-candle ambiguity", () => {
  const noEntry = simulateReplayWithSignalPackage(
    input(shortSignal, [
      candle("2026-07-08T13:50:00.000Z", 103, 104, 100.5, 103),
    ]),
  );
  const target = simulateReplayWithSignalPackage(
    input(shortSignal, [
      candle("2026-07-08T13:50:00.000Z", 101, 102, 99, 100),
      candle("2026-07-08T13:55:00.000Z", 100, 101, 89.5, 90),
    ]),
  );
  const stop = simulateReplayWithSignalPackage(
    input(shortSignal, [
      candle("2026-07-08T13:50:00.000Z", 101, 102, 99, 100),
      candle("2026-07-08T13:55:00.000Z", 100, 105.5, 99, 105),
    ]),
  );
  const ambiguous = simulateReplayWithSignalPackage(
    input(shortSignal, [
      candle("2026-07-08T13:50:00.000Z", 101, 105.5, 89.5, 100),
    ]),
  );

  expect(noEntry).toMatchObject({
    outcome_status: "no_entry_triggered",
    entry_touched: false,
  });
  expect(target).toMatchObject({
    outcome_status: "target_hit",
    gross_price_move: 10,
    gross_r_multiple: 2,
  });
  expect(stop).toMatchObject({
    outcome_status: "stop_hit",
    gross_price_move: -5,
    gross_r_multiple: -1,
  });
  expect(ambiguous).toMatchObject({
    outcome_status: "ambiguous_intrabar_conservative_stop",
    stop_touched: true,
    target_touched: true,
    gross_r_multiple: -1,
  });

  [noEntry, target, stop, ambiguous].forEach(expectSafe);
});

test("uses only candles strictly after analysis cutoff", () => {
  const result = simulateReplayWithSignalPackage(
    input(longSignal, [
      candle("2026-07-08T13:45:00.000Z", 100, 120, 90, 110),
      candle("2026-07-08T13:49:19.521608+00:00", 100, 120, 90, 110),
      candle("2026-07-08T13:50:00.000Z", 98, 99, 97, 98),
      candle("2026-07-08T13:55:00.000Z", 98, 99.5, 97.5, 99),
    ]),
  );

  expect(result).toMatchObject({
    outcome_status: "no_entry_triggered",
    entry_touched: false,
    target_touched: false,
    stop_touched: false,
    lookahead_safety_passed: true,
  });
  expectSafe(result);
});

test("blocks when no post-cutoff candles are available", () => {
  const result = simulateReplayWithSignalPackage(
    input(longSignal, [
      candle("2026-07-08T13:45:00.000Z", 99, 120, 90, 110),
      candle("2026-07-08T13:49:19.521608+00:00", 99, 120, 90, 110),
    ]),
  );

  expect(result).toMatchObject({
    execution_status: "blocked_missing_candles",
    outcome_status: "blocked",
    blockers: ["no_post_cutoff_candles"],
    replay_executed: false,
  });
  expectSafe(result);
});

test("simulation source imports only the static result model and has no runtime access", () => {
  const source = readFileSync(simulationPath, "utf8");

  expect(source).toContain("@/lib/replay-with-signal-package-result-model");
  expect(source).not.toContain("@supabase");
  expect(source).not.toContain("supabase-js");
  expect(source).not.toContain("TWELVE_DATA");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("app/api");
  expect(source).not.toContain("scanner");
  expect(source).not.toContain("@/lib/broker");
  expect(source).not.toContain("@/lib/execution");
  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("new Date");
  expect(source).not.toContain("window.");
  expect(source).not.toContain("globalThis");
});

test("docs include rules, AAPL example, and no-effect guarantee", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Only candles strictly after `analysis_cutoff`");
  expect(doc).toContain("Same-Candle Ambiguity");
  expect(doc).toContain("recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557");
  expect(doc).toContain('"ticker": "AAPL"');
  expect(doc).toContain('"interval": "5min"');
  expect(doc).toContain('"trading_day": "2026-07-08"');
  expect(doc).toContain('"analysis_cutoff": "2026-07-08T13:49:19.521608+00:00"');
  expect(doc).toContain('"direction": "long"');
  expect(doc).toContain('"planned_entry": 304.86');
  expect(doc).toContain('"planned_stop": 295.62');
  expect(doc).toContain('"planned_target": 334.12');
  expect(doc).toContain(
    "does not execute replay in production, call providers, read/write Supabase, persist synthetic outcomes, or affect scanner/ranking",
  );
});

test("Action 311 adds no app api route and does not modify proxy", () => {
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

test("Action 309 guard still passes after adding static simulation engine", () => {
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
