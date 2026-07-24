import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  buildReplayWithSignalPackageStaticPreviewJson,
  buildReplayWithSignalPackageStaticPreviewReport,
  buildReplayWithSignalPackageStaticPreviewResults,
  renderReplayWithSignalPackageStaticPreviewMarkdown,
  replayWithSignalPackageStaticPreviewScenarios,
} from "../../lib/replay-with-signal-package-static-preview";

const helperPath = join(
  process.cwd(),
  "lib/replay-with-signal-package-static-preview.ts",
);
const scriptPath = join(
  process.cwd(),
  "scripts/replay-with-signal-package-static-preview.mjs",
);
const docPath = join(
  process.cwd(),
  "docs/replay-with-signal-package-static-preview.md",
);

function runPreview(format: "markdown" | "json") {
  return execFileSync(
    "node",
    ["scripts/replay-with-signal-package-static-preview.mjs", `--format=${format}`],
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
}

test("preview helper builds results for all long and short fixture scenarios", () => {
  const results = buildReplayWithSignalPackageStaticPreviewResults();

  expect(replayWithSignalPackageStaticPreviewScenarios).toHaveLength(10);
  expect(results).toHaveLength(10);
  expect(replayWithSignalPackageStaticPreviewScenarios.map((scenario) => scenario.scenario_id)).toEqual([
    "long_no_entry",
    "long_target_hit",
    "long_stop_hit",
    "long_open_at_window_end",
    "long_ambiguous_same_candle",
    "short_no_entry",
    "short_target_hit",
    "short_stop_hit",
    "short_open_at_window_end",
    "short_ambiguous_same_candle",
  ]);
  expect(results.map((result) => result.outcome_status)).toEqual([
    "no_entry_triggered",
    "target_hit",
    "stop_hit",
    "open_at_window_end",
    "ambiguous_intrabar_conservative_stop",
    "no_entry_triggered",
    "target_hit",
    "stop_hit",
    "open_at_window_end",
    "ambiguous_intrabar_conservative_stop",
  ]);
});

test("preview report is safe_report_available", () => {
  const report = buildReplayWithSignalPackageStaticPreviewReport();
  const json = buildReplayWithSignalPackageStaticPreviewJson();

  expect(report.report_status).toBe("safe_report_available");
  expect(report.summary.interpreted_results).toBe(10);
  expect(json.preview_status).toBe("safe_static_preview_available");
  expect(json.safety).toEqual({ ok: true, blockers: [] });
  expect(json.provider_call_executed).toBe(false);
  expect(json.supabase_write_executed).toBe(false);
  expect(json.synthetic_outcomes_persisted).toBe(false);
  expect(json.scanner_behavior_changed).toBe(false);
  expect(json.live_ranking_changed).toBe(false);
  expect(json.recommendation_rows_mutated).toBe(false);
});

test("markdown output is deterministic", () => {
  const first = renderReplayWithSignalPackageStaticPreviewMarkdown();
  const second = renderReplayWithSignalPackageStaticPreviewMarkdown();

  expect(first).toBe(second);
  expect(first).toContain("# Replay With Signal Package Static Preview");
  expect(first).toContain("long_target_hit");
  expect(first).toContain("short_ambiguous_same_candle");
  expect(first).toContain("# Replay With Signal Package Static Inspection Report");
});

test("JSON output is deterministic", () => {
  const first = JSON.stringify(buildReplayWithSignalPackageStaticPreviewJson(), null, 2);
  const second = JSON.stringify(buildReplayWithSignalPackageStaticPreviewJson(), null, 2);

  expect(first).toBe(second);
  expect(JSON.parse(first)).toMatchObject({
    preview_status: "safe_static_preview_available",
    scenario_count: 10,
    production_runtime_touched: false,
    provider_call_executed: false,
  });
});

test("script exists and markdown/json modes exit 0", () => {
  const markdown = runPreview("markdown");
  const json = runPreview("json");
  const parsed = JSON.parse(json);

  expect(readFileSync(scriptPath, "utf8")).toContain(
    "replay-with-signal-package-static-preview",
  );
  expect(markdown).toContain("# Replay With Signal Package Static Preview");
  expect(parsed.preview_status).toBe("safe_static_preview_available");
  expect(parsed.scenario_count).toBe(10);
});

test("script output contains no secrets and no generated runtime timestamps", () => {
  const markdown = runPreview("markdown");
  const json = runPreview("json");
  const combined = `${markdown}\n${json}`;

  expect(combined).not.toContain("automation-secret-that-must-not-appear");
  expect(combined).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(combined).not.toContain("supabase-secret-that-must-not-appear");
  expect(combined).not.toContain("Generated at");
  expect(combined).not.toContain("generated_at");
  expect(combined).not.toContain("Date.now");
});

test("script does not write files", () => {
  const before = execFileSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  runPreview("markdown");
  runPreview("json");
  const after = execFileSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  expect(after).toBe(before);
});

test("preview helper and script avoid env provider Supabase and runtime imports", () => {
  const helper = readFileSync(helperPath, "utf8");
  const script = readFileSync(scriptPath, "utf8");
  const combined = `${helper}\n${script}`;

  expect(helper).toContain("@/lib/replay-with-signal-package-static-fixtures");
  expect(helper).toContain("@/lib/replay-with-signal-package-static-simulation");
  expect(helper).toContain("@/lib/replay-with-signal-package-static-inspection-report");
  expect(combined).not.toContain("@supabase");
  expect(combined).not.toContain("supabase-js");
  expect(combined).not.toContain("TWELVE_DATA");
  expect(combined).not.toContain("process.env");
  expect(combined).not.toContain("fetch(");
  expect(combined).not.toContain("next/server");
  expect(combined).not.toContain("app/api");
  expect(combined).not.toContain("@/lib/scanner");
  expect(combined).not.toContain("real-scanner");
  expect(combined).not.toContain("@/lib/broker");
  expect(combined).not.toContain("@/lib/execution");
  expect(combined).not.toContain("Date.now");
  expect(combined).not.toContain("new Date");
  expect(combined).not.toContain("writeFile");
  expect(combined).not.toContain("window.");
  expect(combined).not.toContain("globalThis");
});

test("docs include commands and no-effect guarantee", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("node scripts/replay-with-signal-package-static-preview.mjs");
  expect(doc).toContain("--format=markdown");
  expect(doc).toContain("--format=json");
  expect(doc).toContain("Action 310");
  expect(doc).toContain("Action 314");
  expect(doc).toContain(
    "does not call providers, read/write Supabase, execute replay in production",
  );
  expect(doc).toContain("affect scanner/ranking");
});

test("Action 315 adds no app api route and does not modify proxy", () => {
  const status = execFileSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );

  expect(status).not.toMatch(/^(..|\?\?) app\/api\//m);
  expect(status).not.toMatch(/^(..|\?\?) app\/[^/]+\/page\.tsx/m);
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 guard still passes after adding static preview script", () => {
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
