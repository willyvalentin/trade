#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const expectedBranch = "dev/safe-post-recovery-work";
const expectedStaticBatchCommit = "9b55e5a";

const requiredFiles = [
  "docs/action-309-post-recovery-safe-development-protocol.md",
  "docs/replay-with-signal-package-result-model.md",
  "docs/replay-with-signal-package-static-simulation.md",
  "docs/replay-with-signal-package-static-fixtures.md",
  "docs/replay-with-signal-package-static-summary.md",
  "docs/replay-with-signal-package-static-inspection-report.md",
  "docs/replay-with-signal-package-static-preview.md",
  "docs/replay-with-signal-package-static-preview-golden-snapshots.md",
  "docs/action-317-post-recovery-static-replay-release-manifest.md",
  "docs/action-318-static-replay-batch-commit-readiness-checklist.md",
  "lib/replay-with-signal-package-result-model.ts",
  "lib/replay-with-signal-package-static-simulation.ts",
  "lib/replay-with-signal-package-static-fixtures.ts",
  "lib/replay-with-signal-package-static-summary.ts",
  "lib/replay-with-signal-package-static-inspection-report.ts",
  "lib/replay-with-signal-package-static-preview.ts",
  "scripts/action-309-post-recovery-safety-guard.mjs",
  "scripts/replay-with-signal-package-static-preview.mjs",
  "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  "scripts/action-317-static-release-manifest-verify.mjs",
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "tests/e2e/action-309-post-recovery-safe-development-protocol.spec.ts",
  "tests/e2e/replay-with-signal-package-result-model.spec.ts",
  "tests/e2e/replay-with-signal-package-static-simulation.spec.ts",
  "tests/e2e/replay-with-signal-package-static-fixtures.spec.ts",
  "tests/e2e/replay-with-signal-package-static-summary.spec.ts",
  "tests/e2e/replay-with-signal-package-static-inspection-report.spec.ts",
  "tests/e2e/replay-with-signal-package-static-preview.spec.ts",
  "tests/e2e/replay-with-signal-package-static-preview-golden.spec.ts",
  "tests/e2e/action-317-post-recovery-static-replay-release-manifest.spec.ts",
  "tests/e2e/action-318-static-replay-batch-commit-readiness-checklist.spec.ts",
  "tests/fixtures/replay-with-signal-package-static-preview.markdown.golden.md",
  "tests/fixtures/replay-with-signal-package-static-preview.json.golden.json",
];

const allowedAction319ImplementationFiles = [
  "docs/action-319-static-replay-batch-post-commit-verification.md",
  "docs/action-320-static-replay-branch-package-manifest.md",
  "docs/action-321-ture-roadmap-reconciliation-after-recovery.md",
  "docs/action-322-ture-product-roadmap-index.md",
  "docs/action-323-recommendation-engine-readiness-map.md",
  "docs/action-324-recommendation-engine-code-surface-inventory.md",
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
  "scripts/action-320-static-replay-branch-package-verify.mjs",
  "scripts/action-321-ture-roadmap-reconciliation-verify.mjs",
  "scripts/action-322-ture-product-roadmap-index-verify.mjs",
  "scripts/action-323-recommendation-engine-readiness-map-verify.mjs",
  "scripts/action-324-recommendation-engine-code-surface-inventory-verify.mjs",
  "tests/e2e/action-319-static-replay-batch-post-commit-verification.spec.ts",
  "tests/e2e/action-320-static-replay-branch-package-manifest.spec.ts",
  "tests/e2e/action-321-ture-roadmap-reconciliation-after-recovery.spec.ts",
  "tests/e2e/action-322-ture-product-roadmap-index.spec.ts",
  "tests/e2e/action-323-recommendation-engine-readiness-map.spec.ts",
  "tests/e2e/action-324-recommendation-engine-code-surface-inventory.spec.ts",
];

const forbiddenRuntimePaths = [
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

function runGit(args, options = {}) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: options.silent ? ["ignore", "pipe", "ignore"] : ["ignore", "pipe", "pipe"],
  }).trim();
}

function gitCommandSucceeds(args) {
  try {
    runGit(args, { silent: true });
    return true;
  } catch {
    return false;
  }
}

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

function statusFiles() {
  const output = execFileSync("git", ["status", "--short"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (!output) return [];

  return output
    .trimEnd()
    .split("\n")
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? path.split(" -> ").at(-1) ?? path : path))
    .sort();
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

function isForbiddenChangedFile(relativePath) {
  if (relativePath.startsWith("app/")) return true;
  if (relativePath.startsWith("supabase/")) return true;
  if (["proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].includes(relativePath)) {
    return true;
  }
  if (relativePath.includes("provider") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("scanner") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("ranking") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("broker") && !relativePath.startsWith("docs/")) return true;
  if (relativePath.includes("execution") && !relativePath.startsWith("docs/")) return true;
  return forbiddenRuntimePaths.includes(relativePath);
}

const currentBranch = runGit(["branch", "--show-current"]);
const changedFiles = statusFiles();
const workingTreeClean = changedFiles.length === 0;
const uncommittedAction319Only =
  changedFiles.length > 0 &&
  changedFiles.every((relativePath) =>
    allowedAction319ImplementationFiles.includes(relativePath),
  );
const unexpectedUncommittedFiles = changedFiles.filter(
  (relativePath) => !allowedAction319ImplementationFiles.includes(relativePath),
);
const requiredFilesMissing = requiredFiles.filter((relativePath) => !exists(relativePath));
const forbiddenRuntimeChanges = changedFiles.filter(isForbiddenChangedFile);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);
const staticBatchCommitFound = gitCommandSucceeds([
  "merge-base",
  "--is-ancestor",
  expectedStaticBatchCommit,
  "HEAD",
]);

const passed =
  currentBranch === expectedBranch &&
  staticBatchCommitFound &&
  (workingTreeClean || uncommittedAction319Only) &&
  unexpectedUncommittedFiles.length === 0 &&
  requiredFilesMissing.length === 0 &&
  forbiddenRuntimeChanges.length === 0 &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  current_branch: currentBranch,
  expected_branch: expectedBranch,
  static_batch_commit_found: staticBatchCommitFound,
  expected_static_batch_commit: expectedStaticBatchCommit,
  working_tree_clean: workingTreeClean,
  uncommitted_action_319_files_allowed: uncommittedAction319Only,
  uncommitted_files: changedFiles,
  unexpected_uncommitted_files: unexpectedUncommittedFiles,
  post_commit_verification_only: true,
  deploy_readiness: false,
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  proxy_changes_allowed: false,
  required_files_found: requiredFilesMissing.length === 0,
  required_files_missing: requiredFilesMissing,
  forbidden_runtime_changes_detected:
    forbiddenRuntimeChanges.length > 0 || forbiddenRuntimeArtifacts.length > 0,
  forbidden_runtime_changed_files: forbiddenRuntimeChanges,
  forbidden_runtime_artifacts_found: forbiddenRuntimeArtifacts,
  forbidden_markers_found: forbiddenMarkersFound,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
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
    ? "continue_static_local_development_do_not_deploy_or_push_main"
    : "restore_clean_static_batch_state_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
