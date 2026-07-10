#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const requiredDocs = [
  "docs/action-309-post-recovery-safe-development-protocol.md",
  "docs/replay-with-signal-package-result-model.md",
  "docs/replay-with-signal-package-static-simulation.md",
  "docs/replay-with-signal-package-static-fixtures.md",
  "docs/replay-with-signal-package-static-summary.md",
  "docs/replay-with-signal-package-static-inspection-report.md",
  "docs/replay-with-signal-package-static-preview.md",
  "docs/replay-with-signal-package-static-preview-golden-snapshots.md",
  "docs/action-317-post-recovery-static-replay-release-manifest.md",
];

const requiredLibs = [
  "lib/replay-with-signal-package-result-model.ts",
  "lib/replay-with-signal-package-static-simulation.ts",
  "lib/replay-with-signal-package-static-fixtures.ts",
  "lib/replay-with-signal-package-static-summary.ts",
  "lib/replay-with-signal-package-static-inspection-report.ts",
  "lib/replay-with-signal-package-static-preview.ts",
];

const requiredScripts = [
  "scripts/action-309-post-recovery-safety-guard.mjs",
  "scripts/replay-with-signal-package-static-preview.mjs",
  "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  "scripts/action-317-static-release-manifest-verify.mjs",
];

const requiredTests = [
  "tests/e2e/action-309-post-recovery-safe-development-protocol.spec.ts",
  "tests/e2e/replay-with-signal-package-result-model.spec.ts",
  "tests/e2e/replay-with-signal-package-static-simulation.spec.ts",
  "tests/e2e/replay-with-signal-package-static-fixtures.spec.ts",
  "tests/e2e/replay-with-signal-package-static-summary.spec.ts",
  "tests/e2e/replay-with-signal-package-static-inspection-report.spec.ts",
  "tests/e2e/replay-with-signal-package-static-preview.spec.ts",
  "tests/e2e/replay-with-signal-package-static-preview-golden.spec.ts",
  "tests/e2e/action-317-post-recovery-static-replay-release-manifest.spec.ts",
  "tests/fixtures/replay-with-signal-package-static-preview.markdown.golden.md",
  "tests/fixtures/replay-with-signal-package-static-preview.json.golden.json",
];

const forbiddenPaths = [
  "app/api/hb307c",
  "app/api/ping307h",
  "app/api/route-publication-diagnostic",
  "app/route-publication-probe",
  "app/public-probe-307g",
  "app/ping307h",
  "public/ping307i.txt",
  "public/ping307i.json",
  "public/ping307j.html",
  "public/action-307l-runtime-boundary-status.json",
];

const markerRootPaths = ["app", "public"];
const markerFilePaths = ["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"];

function exists(relativePath) {
  return existsSync(join(repoRoot, relativePath));
}

function collectFiles(relativePath) {
  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) return [];
  const stat = statSync(absolutePath);
  if (stat.isFile()) return [relativePath];
  if (!stat.isDirectory()) return [];

  return readdirSync(absolutePath)
    .flatMap((entry) => collectFiles(join(relativePath, entry)))
    .sort();
}

function missing(paths) {
  return paths.filter((relativePath) => !exists(relativePath));
}

function markerFound(marker) {
  const files = [
    ...markerFilePaths,
    ...markerRootPaths.flatMap((relativePath) => collectFiles(relativePath)),
  ];

  return files.some((relativePath) => {
    const absolutePath = join(repoRoot, relativePath);
    if (!existsSync(absolutePath)) return false;
    return readFileSync(absolutePath, "utf8").includes(marker);
  });
}

const missingDocs = missing(requiredDocs);
const missingLibs = missing(requiredLibs);
const missingScripts = missing(requiredScripts);
const missingTests = missing(requiredTests);
const forbiddenRuntimeArtifacts = forbiddenPaths.filter(exists);
const forbiddenMarkers = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);

const passed =
  missingDocs.length === 0 &&
  missingLibs.length === 0 &&
  missingScripts.length === 0 &&
  missingTests.length === 0 &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkers.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  release_manifest_found: exists(
    "docs/action-317-post-recovery-static-replay-release-manifest.md",
  ),
  required_docs_found: missingDocs.length === 0,
  required_libs_found: missingLibs.length === 0,
  required_scripts_found: missingScripts.length === 0,
  required_tests_found: missingTests.length === 0,
  missing_required_docs: missingDocs,
  missing_required_libs: missingLibs,
  missing_required_scripts: missingScripts,
  missing_required_tests: missingTests,
  forbidden_runtime_changes_detected: forbiddenRuntimeArtifacts.length > 0,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkers,
  guard_script_found: exists("scripts/action-309-post-recovery-safety-guard.mjs"),
  golden_verifier_found: exists(
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  ),
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
    recommendation_rows_mutated: false,
  },
  recommended_next_step: passed
    ? "commit_static_only_batch_after_review"
    : "fix_manifest_or_forbidden_artifacts_before_commit",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
