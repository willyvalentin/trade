import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import { validateReplayWithSignalPackageResultSafety } from "../../lib/replay-with-signal-package-result-model";
import {
  buildLongFixtureSimulationInput,
  buildShortFixtureSimulationInput,
  longAmbiguousSameCandleCandlesFixture,
  longNoEntryCandlesFixture,
  longOpenAtWindowEndCandlesFixture,
  longStopHitCandlesFixture,
  longTargetHitCandlesFixture,
  preCutoffIgnoredCandlesFixture,
  selectedAaplReplaySignalPackageFixture,
  shortAmbiguousSameCandleCandlesFixture,
  shortAaplReplaySignalPackageFixture,
  shortNoEntryCandlesFixture,
  shortOpenAtWindowEndCandlesFixture,
  shortStopHitCandlesFixture,
  shortTargetHitCandlesFixture,
  type ReplayStaticFixtureKind,
} from "../../lib/replay-with-signal-package-static-fixtures";
import { simulateReplayWithSignalPackage } from "../../lib/replay-with-signal-package-static-simulation";

const fixturesPath = join(
  process.cwd(),
  "lib/replay-with-signal-package-static-fixtures.ts",
);
const docPath = join(
  process.cwd(),
  "docs/replay-with-signal-package-static-fixtures.md",
);

const expectedByKind: Record<ReplayStaticFixtureKind, string> = {
  no_entry: "no_entry_triggered",
  target_hit: "target_hit",
  stop_hit: "stop_hit",
  open_at_window_end: "open_at_window_end",
  ambiguous_same_candle: "ambiguous_intrabar_conservative_stop",
};

function expectSafeFixture(kind: ReplayStaticFixtureKind, direction: "long" | "short") {
  const input =
    direction === "long"
      ? buildLongFixtureSimulationInput(kind)
      : buildShortFixtureSimulationInput(kind);
  const result = simulateReplayWithSignalPackage(input);

  expect(result.outcome_status).toBe(expectedByKind[kind]);
  expect(result.direction).toBe(direction);
  expect(result.lookahead_safety_passed).toBe(true);
  expect(validateReplayWithSignalPackageResultSafety(result)).toEqual({
    ok: true,
    errors: [],
    warnings: [],
  });

  return { input, result };
}

test("selected AAPL signal package fixture has exact expected fields", () => {
  expect(selectedAaplReplaySignalPackageFixture).toEqual({
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
  });
});

test("long fixtures produce expected simulation outcomes", () => {
  const noEntry = expectSafeFixture("no_entry", "long");
  const target = expectSafeFixture("target_hit", "long");
  const stop = expectSafeFixture("stop_hit", "long");
  const open = expectSafeFixture("open_at_window_end", "long");
  const ambiguous = expectSafeFixture("ambiguous_same_candle", "long");

  expect(noEntry.result.entry_touched).toBe(false);
  expect(target.result.target_touched).toBe(true);
  expect(target.result.gross_r_multiple).toBeGreaterThan(0);
  expect(stop.result.stop_touched).toBe(true);
  expect(stop.result.gross_r_multiple).toBe(-1);
  expect(open.result.entry_touched).toBe(true);
  expect(open.result.gross_r_multiple).not.toBeNull();
  expect(ambiguous.result.stop_touched).toBe(true);
  expect(ambiguous.result.target_touched).toBe(true);
  expect(ambiguous.result.gross_r_multiple).toBe(-1);
});

test("short fixtures produce expected simulation outcomes", () => {
  const noEntry = expectSafeFixture("no_entry", "short");
  const target = expectSafeFixture("target_hit", "short");
  const stop = expectSafeFixture("stop_hit", "short");
  const open = expectSafeFixture("open_at_window_end", "short");
  const ambiguous = expectSafeFixture("ambiguous_same_candle", "short");

  expect(noEntry.result.entry_touched).toBe(false);
  expect(target.result.target_touched).toBe(true);
  expect(target.result.gross_r_multiple).toBeGreaterThan(0);
  expect(stop.result.stop_touched).toBe(true);
  expect(stop.result.gross_r_multiple).toBe(-1);
  expect(open.result.entry_touched).toBe(true);
  expect(open.result.gross_r_multiple).not.toBeNull();
  expect(ambiguous.result.stop_touched).toBe(true);
  expect(ambiguous.result.target_touched).toBe(true);
  expect(ambiguous.result.gross_r_multiple).toBe(-1);
});

test("pre-cutoff candles do not affect result", () => {
  const result = simulateReplayWithSignalPackage({
    source_verification: "static_fixture_pack_pre_cutoff_ignored",
    signal_package: selectedAaplReplaySignalPackageFixture,
    candles: preCutoffIgnoredCandlesFixture,
    expected_candle_rows: preCutoffIgnoredCandlesFixture.length,
    conservative_same_candle_rule: true,
  });

  expect(result.outcome_status).toBe("no_entry_triggered");
  expect(result.entry_touched).toBe(false);
  expect(result.stop_touched).toBe(false);
  expect(result.target_touched).toBe(false);
  expect(result.lookahead_safety_passed).toBe(true);
  expect(validateReplayWithSignalPackageResultSafety(result).ok).toBe(true);
});

test("fixture builders return valid ReplaySimulationInput", () => {
  const kinds = Object.keys(expectedByKind) as ReplayStaticFixtureKind[];

  for (const kind of kinds) {
    const longInput = buildLongFixtureSimulationInput(kind);
    const shortInput = buildShortFixtureSimulationInput(kind);

    expect(longInput.signal_package).toBe(selectedAaplReplaySignalPackageFixture);
    expect(shortInput.signal_package).toBe(shortAaplReplaySignalPackageFixture);
    expect(longInput.expected_candle_rows).toBe(longInput.candles.length);
    expect(shortInput.expected_candle_rows).toBe(shortInput.candles.length);
    expect(longInput.conservative_same_candle_rule).toBe(true);
    expect(shortInput.conservative_same_candle_rule).toBe(true);
    expect(longInput.source_verification).toBe(`static_fixture_pack_long_${kind}`);
    expect(shortInput.source_verification).toBe(`static_fixture_pack_short_${kind}`);
  }
});

test("exported fixture arrays are small readable deterministic candle sets", () => {
  const fixtures = [
    longNoEntryCandlesFixture,
    longTargetHitCandlesFixture,
    longStopHitCandlesFixture,
    longOpenAtWindowEndCandlesFixture,
    longAmbiguousSameCandleCandlesFixture,
    shortNoEntryCandlesFixture,
    shortTargetHitCandlesFixture,
    shortStopHitCandlesFixture,
    shortOpenAtWindowEndCandlesFixture,
    shortAmbiguousSameCandleCandlesFixture,
    preCutoffIgnoredCandlesFixture,
  ];

  for (const fixture of fixtures) {
    expect(fixture.length).toBeGreaterThanOrEqual(2);
    expect(fixture.length).toBeLessThanOrEqual(3);
    expect(fixture.some((candle) => candle.timestamp < "2026-07-08T13:49:19")).toBe(
      true,
    );
    expect(fixture.some((candle) => candle.timestamp > "2026-07-08T13:49:19")).toBe(
      true,
    );
  }
});

test("fixtures source imports only static simulation types and has no runtime access", () => {
  const source = readFileSync(fixturesPath, "utf8");

  expect(source).toContain("@/lib/replay-with-signal-package-static-simulation");
  expect(source).toContain("import type");
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

test("fixture docs include expected outcomes and no-effect guarantee", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Selected AAPL Candidate");
  expect(doc).toContain("recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557");
  expect(doc).toContain("longNoEntryCandlesFixture");
  expect(doc).toContain("longTargetHitCandlesFixture");
  expect(doc).toContain("shortStopHitCandlesFixture");
  expect(doc).toContain("shortAmbiguousSameCandleCandlesFixture");
  expect(doc).toContain("preCutoffIgnoredCandlesFixture");
  expect(doc).toContain("no_entry_triggered");
  expect(doc).toContain("target_hit");
  expect(doc).toContain("stop_hit");
  expect(doc).toContain("open_at_window_end");
  expect(doc).toContain("ambiguous_intrabar_conservative_stop");
  expect(doc).toContain(
    "These fixtures are static in-memory test data only. They do not fetch provider data, read/write Supabase, execute replay in production, persist synthetic outcomes, or affect scanner/ranking.",
  );
});

test("Action 312 adds no app api route and does not modify proxy", () => {
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

test("Action 309 guard still passes after adding static fixture pack", () => {
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
