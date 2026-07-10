import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const markdownGoldenPath = join(
  process.cwd(),
  "tests/fixtures/replay-with-signal-package-static-preview.markdown.golden.md",
);
const jsonGoldenPath = join(
  process.cwd(),
  "tests/fixtures/replay-with-signal-package-static-preview.json.golden.json",
);
const verifyScriptPath = join(
  process.cwd(),
  "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
);
const docPath = join(
  process.cwd(),
  "docs/replay-with-signal-package-static-preview-golden-snapshots.md",
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

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/replay-with-signal-package-static-preview-verify-golden.mjs"],
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

test("golden snapshot files exist", () => {
  expect(existsSync(markdownGoldenPath)).toBe(true);
  expect(existsSync(jsonGoldenPath)).toBe(true);
});

test("markdown preview output matches golden snapshot exactly", () => {
  expect(runPreview("markdown")).toBe(readFileSync(markdownGoldenPath, "utf8"));
});

test("json preview output matches golden snapshot exactly and parses", () => {
  const jsonOutput = runPreview("json");
  const jsonGolden = readFileSync(jsonGoldenPath, "utf8");
  const parsed = JSON.parse(jsonGolden);

  expect(jsonOutput).toBe(jsonGolden);
  expect(parsed.preview_status).toBe("safe_static_preview_available");
  expect(parsed.report.report_status).toBe("safe_report_available");
  expect(parsed.scenario_count).toBe(10);
  expect(parsed.results).toHaveLength(10);
});

test("markdown golden contains expected report sections", () => {
  const markdown = readFileSync(markdownGoldenPath, "utf8");

  expect(markdown).toContain("# Replay With Signal Package Static Preview");
  expect(markdown).toContain("Scenarios:");
  expect(markdown).toContain("# Replay With Signal Package Static Inspection Report");
  expect(markdown).toContain("## Safety");
  expect(markdown).toContain("## Outcome Breakdown");
  expect(markdown).toContain("## R Multiple Summary");
  expect(markdown).toContain("## Interpretation");
  expect(markdown).toContain("## Recommended Next Step");
});

test("golden snapshots contain no obvious secrets or generated runtime timestamps", () => {
  const combined = `${readFileSync(markdownGoldenPath, "utf8")}\n${readFileSync(
    jsonGoldenPath,
    "utf8",
  )}`;

  expect(combined).not.toContain("automation-secret-that-must-not-appear");
  expect(combined).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(combined).not.toContain("supabase-secret-that-must-not-appear");
  expect(combined).not.toContain("Generated at");
  expect(combined).not.toContain("generated_at");
  expect(combined).not.toContain("Date.now");
  expect(combined).not.toContain("Math.random");
});

test("verification script exists exits 0 and returns deterministic JSON", () => {
  const source = readFileSync(verifyScriptPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain("replay-with-signal-package-static-preview");
  expect(parsed).toEqual({
    verification_status: "passed",
    markdown_matches: true,
    json_matches: true,
    golden_files_checked: [
      "tests/fixtures/replay-with-signal-package-static-preview.markdown.golden.md",
      "tests/fixtures/replay-with-signal-package-static-preview.json.golden.json",
    ],
    no_effect_flags: {
      provider_call_executed: false,
      provider_call_attempted: false,
      supabase_write_executed: false,
      candles_persisted: false,
      raw_response_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
  });
});

test("verification script does not write files", () => {
  const before = execFileSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  runVerifier();
  const after = execFileSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  expect(after).toBe(before);
});

test("verification script avoids env provider Supabase and runtime imports", () => {
  const source = readFileSync(verifyScriptPath, "utf8");

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
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("window.");
  expect(source).not.toContain("globalThis");
});

test("docs explain verification and no-effect guarantee", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Replay With Signal Package Static Preview Golden Snapshots");
  expect(doc).toContain("node scripts/replay-with-signal-package-static-preview-verify-golden.mjs");
  expect(doc).toContain("when an intentional static preview");
  expect(doc).toContain(
    "do not call providers, read/write Supabase, execute replay in production",
  );
  expect(doc).toContain("affect scanner/ranking");
});

test("Action 316 adds no app api route and does not modify proxy", () => {
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

test("Action 309 guard still passes", () => {
  const parsed = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );

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
