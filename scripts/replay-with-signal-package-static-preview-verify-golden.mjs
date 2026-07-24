#!/usr/bin/env node

import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const markdownGoldenPath = join(
  repoRoot,
  "tests/fixtures/replay-with-signal-package-static-preview.markdown.golden.md",
);
const jsonGoldenPath = join(
  repoRoot,
  "tests/fixtures/replay-with-signal-package-static-preview.json.golden.json",
);
const previewScriptPath = join(
  repoRoot,
  "scripts/replay-with-signal-package-static-preview.mjs",
);

function runPreview(format) {
  return execFileSync(process.execPath, [previewScriptPath, `--format=${format}`], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

const markdownOutput = runPreview("markdown");
const jsonOutput = runPreview("json");
const markdownGolden = readFileSync(markdownGoldenPath, "utf8");
const jsonGolden = readFileSync(jsonGoldenPath, "utf8");
const markdown_matches = markdownOutput === markdownGolden;
const json_matches = jsonOutput === jsonGolden;
const passed = markdown_matches && json_matches;

const result = {
  verification_status: passed ? "passed" : "failed",
  markdown_matches,
  json_matches,
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
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
