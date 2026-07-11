#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const expectedBranch = "dev/safe-post-recovery-work";
const expectedCleanBaseCommit = "512a0c5";
const expectedStaticBatchCommit = "9b55e5a";
const expectedPostCommitVerificationCommit = "f8775dd";

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
  "docs/action-319-static-replay-batch-post-commit-verification.md",
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
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
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
  "tests/e2e/action-319-static-replay-batch-post-commit-verification.spec.ts",
  "tests/fixtures/replay-with-signal-package-static-preview.markdown.golden.md",
  "tests/fixtures/replay-with-signal-package-static-preview.json.golden.json",
];

const allowedAction320ImplementationFiles = [
  "app/api/runtime-health/ping/route.ts",
  "docs/action-320-static-replay-branch-package-manifest.md",
  "docs/action-321-ture-roadmap-reconciliation-after-recovery.md",
  "docs/action-322-ture-product-roadmap-index.md",
  "docs/action-323-recommendation-engine-readiness-map.md",
  "docs/action-324-recommendation-engine-code-surface-inventory.md",
  "docs/action-325-recommendation-quality-gates-audit.md",
  "docs/action-326-setup-taxonomy-and-confidence-calibration-map.md",
  "docs/action-327-learning-backfill-runtime-rollout-plan.md",
  "docs/action-328-product-ux-surface-map.md",
  "docs/action-329-recommendation-engine-gate-test-plan.md",
  "docs/action-330-confidence-calibration-static-metric-spec.md",
  "docs/action-331-intelligence-first-roadmap-reprioritization.md",
  "docs/action-332-intelligence-data-collection-readiness-map.md",
  "docs/action-333-historical-data-backfill-existing-coverage-audit.md",
  "docs/action-334-recommendation-snapshot-completeness-audit.md",
  "docs/action-335-learning-outcome-dataset-design.md",
  "docs/action-336-intelligence-context-schema-draft.md",
  "docs/action-337-pattern-discovery-and-confidence-calibration-roadmap.md",
  "docs/action-338-runtime-ping-only-rollout-checklist.md",
  "docs/action-339-historical-backfill-cost-and-provider-capacity-plan.md",
  "docs/action-340-snapshot-field-inventory-against-existing-schema.md",
  "docs/action-341-learning-dataset-static-fixture-spec.md",
  "docs/action-342-intelligence-context-static-fixture-spec.md",
  "docs/action-343-pattern-insight-static-type-spec.md",
  "docs/action-344-runtime-ping-only-route-implementation-plan.md",
  "docs/action-345-first-tiny-provider-capacity-experiment-plan.md",
  "docs/action-346-existing-schema-compatibility-matrix.md",
  "docs/action-347-learning-dataset-static-fixture-implementation-plan.md",
  "docs/action-348-intelligence-context-static-fixture-implementation-plan.md",
  "docs/action-349-pattern-insight-static-fixture-spec.md",
  "docs/action-350-runtime-ping-only-route-approval-gate.md",
  "docs/action-351-first-tiny-provider-capacity-experiment-approval-gate.md",
  "docs/action-352-snapshot-to-learning-dataset-mapper-plan.md",
  "docs/action-353-learning-dataset-static-fixture-implementation-approval-gate.md",
  "docs/action-354-intelligence-context-static-fixture-implementation-approval-gate.md",
  "docs/action-355-pattern-insight-static-fixture-implementation-plan.md",
  "docs/action-356-pattern-insight-static-fixture-implementation-approval-gate.md",
  "docs/action-357-pattern-insight-static-fixture-implementation.md",
  "docs/action-358-runtime-ping-only-route-implementation-readiness-review.md",
  "docs/action-359-runtime-ping-only-route-implementation-approval-gate.md",
  "docs/action-360-runtime-ping-only-route-implementation.md",
  "docs/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review.md",
  "docs/action-362-runtime-ping-only-preview-deploy-approval-gate.md",
  "docs/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness.md",
  "docs/action-364-immutable-preview-revision-preparation-approval-gate.md",
  "docs/action-365-option-b-immutable-preview-revision-preparation.md",
  "docs/action-365-preview-deployment-input-manifest.json",
  "lib/pattern-insight-static-fixtures.ts",
  "docs/post-trade-one-staging-mock-write-with-source-controlled-insert-blocked.md",
  "docs/post-trade-source-controlled-staging-execution-function-approval-gate-no-write.md",
  "docs/post-trade-source-controlled-staging-insert-function-static-security-review-no-execution.md",
  "docs/ture-agent-dev-chat-3-continuation-summary.md",
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
  "scripts/action-320-static-replay-branch-package-verify.mjs",
  "scripts/action-321-ture-roadmap-reconciliation-verify.mjs",
  "scripts/action-322-ture-product-roadmap-index-verify.mjs",
  "scripts/action-323-recommendation-engine-readiness-map-verify.mjs",
  "scripts/action-324-recommendation-engine-code-surface-inventory-verify.mjs",
  "scripts/action-325-recommendation-quality-gates-audit-verify.mjs",
  "scripts/action-326-setup-taxonomy-and-confidence-calibration-map-verify.mjs",
  "scripts/action-327-learning-backfill-runtime-rollout-plan-verify.mjs",
  "scripts/action-328-product-ux-surface-map-verify.mjs",
  "scripts/action-329-recommendation-engine-gate-test-plan-verify.mjs",
  "scripts/action-330-confidence-calibration-static-metric-spec-verify.mjs",
  "scripts/action-331-intelligence-first-roadmap-reprioritization-verify.mjs",
  "scripts/action-332-intelligence-data-collection-readiness-map-verify.mjs",
  "scripts/action-333-historical-data-backfill-existing-coverage-audit-verify.mjs",
  "scripts/action-334-recommendation-snapshot-completeness-audit-verify.mjs",
  "scripts/action-335-learning-outcome-dataset-design-verify.mjs",
  "scripts/action-336-intelligence-context-schema-draft-verify.mjs",
  "scripts/action-337-pattern-discovery-and-confidence-calibration-roadmap-verify.mjs",
  "scripts/action-338-runtime-ping-only-rollout-checklist-verify.mjs",
  "scripts/action-339-historical-backfill-cost-and-provider-capacity-plan-verify.mjs",
  "scripts/action-340-snapshot-field-inventory-against-existing-schema-verify.mjs",
  "scripts/action-341-learning-dataset-static-fixture-spec-verify.mjs",
  "scripts/action-342-intelligence-context-static-fixture-spec-verify.mjs",
  "scripts/action-343-pattern-insight-static-type-spec-verify.mjs",
  "scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs",
  "scripts/action-345-first-tiny-provider-capacity-experiment-plan-verify.mjs",
  "scripts/action-346-existing-schema-compatibility-matrix-verify.mjs",
  "scripts/action-347-learning-dataset-static-fixture-implementation-plan-verify.mjs",
  "scripts/action-348-intelligence-context-static-fixture-implementation-plan-verify.mjs",
  "scripts/action-349-pattern-insight-static-fixture-spec-verify.mjs",
  "scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs",
  "scripts/action-351-first-tiny-provider-capacity-experiment-approval-gate-verify.mjs",
  "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
  "scripts/action-353-learning-dataset-static-fixture-implementation-approval-gate-verify.mjs",
  "scripts/action-354-intelligence-context-static-fixture-implementation-approval-gate-verify.mjs",
  "scripts/action-355-pattern-insight-static-fixture-implementation-plan-verify.mjs",
  "scripts/action-356-pattern-insight-static-fixture-implementation-approval-gate-verify.mjs",
  "scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs",
  "scripts/action-358-runtime-ping-only-route-implementation-readiness-review-verify.mjs",
  "scripts/action-359-runtime-ping-only-route-implementation-approval-gate-verify.mjs",
  "scripts/action-360-runtime-ping-only-route-implementation-verify.mjs",
  "scripts/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review-verify.mjs",
  "scripts/action-362-runtime-ping-only-preview-deploy-approval-gate-verify.mjs",
  "scripts/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness-verify.mjs",
  "scripts/action-364-immutable-preview-revision-preparation-approval-gate-verify.mjs",
  "scripts/action-365-option-b-immutable-preview-revision-preparation-verify.mjs",
  "tests/e2e/action-320-static-replay-branch-package-manifest.spec.ts",
  "tests/e2e/action-321-ture-roadmap-reconciliation-after-recovery.spec.ts",
  "tests/e2e/action-322-ture-product-roadmap-index.spec.ts",
  "tests/e2e/action-323-recommendation-engine-readiness-map.spec.ts",
  "tests/e2e/action-324-recommendation-engine-code-surface-inventory.spec.ts",
  "tests/e2e/action-325-recommendation-quality-gates-audit.spec.ts",
  "tests/e2e/action-326-setup-taxonomy-and-confidence-calibration-map.spec.ts",
  "tests/e2e/action-327-learning-backfill-runtime-rollout-plan.spec.ts",
  "tests/e2e/action-328-product-ux-surface-map.spec.ts",
  "tests/e2e/action-329-recommendation-engine-gate-test-plan.spec.ts",
  "tests/e2e/action-330-confidence-calibration-static-metric-spec.spec.ts",
  "tests/e2e/action-331-intelligence-first-roadmap-reprioritization.spec.ts",
  "tests/e2e/action-332-intelligence-data-collection-readiness-map.spec.ts",
  "tests/e2e/action-333-historical-data-backfill-existing-coverage-audit.spec.ts",
  "tests/e2e/action-334-recommendation-snapshot-completeness-audit.spec.ts",
  "tests/e2e/action-335-learning-outcome-dataset-design.spec.ts",
  "tests/e2e/action-336-intelligence-context-schema-draft.spec.ts",
  "tests/e2e/action-337-pattern-discovery-and-confidence-calibration-roadmap.spec.ts",
  "tests/e2e/action-338-runtime-ping-only-rollout-checklist.spec.ts",
  "tests/e2e/action-339-historical-backfill-cost-and-provider-capacity-plan.spec.ts",
  "tests/e2e/action-340-snapshot-field-inventory-against-existing-schema.spec.ts",
  "tests/e2e/action-341-learning-dataset-static-fixture-spec.spec.ts",
  "tests/e2e/action-342-intelligence-context-static-fixture-spec.spec.ts",
  "tests/e2e/action-343-pattern-insight-static-type-spec.spec.ts",
  "tests/e2e/action-344-runtime-ping-only-route-implementation-plan.spec.ts",
  "tests/e2e/action-345-first-tiny-provider-capacity-experiment-plan.spec.ts",
  "tests/e2e/action-346-existing-schema-compatibility-matrix.spec.ts",
  "tests/e2e/action-347-learning-dataset-static-fixture-implementation-plan.spec.ts",
  "tests/e2e/action-348-intelligence-context-static-fixture-implementation-plan.spec.ts",
  "tests/e2e/action-349-pattern-insight-static-fixture-spec.spec.ts",
  "tests/e2e/action-350-runtime-ping-only-route-approval-gate.spec.ts",
  "tests/e2e/action-351-first-tiny-provider-capacity-experiment-approval-gate.spec.ts",
  "tests/e2e/action-352-snapshot-to-learning-dataset-mapper-plan.spec.ts",
  "tests/e2e/action-353-learning-dataset-static-fixture-implementation-approval-gate.spec.ts",
  "tests/e2e/action-354-intelligence-context-static-fixture-implementation-approval-gate.spec.ts",
  "tests/e2e/action-355-pattern-insight-static-fixture-implementation-plan.spec.ts",
  "tests/e2e/action-356-pattern-insight-static-fixture-implementation-approval-gate.spec.ts",
  "tests/e2e/action-357-pattern-insight-static-fixture-implementation.spec.ts",
  "tests/e2e/action-358-runtime-ping-only-route-implementation-readiness-review.spec.ts",
  "tests/e2e/action-359-runtime-ping-only-route-implementation-approval-gate.spec.ts",
  "tests/e2e/action-360-runtime-ping-only-route-implementation.spec.ts",
  "tests/e2e/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review.spec.ts",
  "tests/e2e/action-362-runtime-ping-only-preview-deploy-approval-gate.spec.ts",
  "tests/e2e/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness.spec.ts",
  "tests/e2e/action-364-immutable-preview-revision-preparation-approval-gate.spec.ts",
  "tests/e2e/action-365-option-b-immutable-preview-revision-preparation.spec.ts",
  "tests/e2e/post-trade-staging-insert-function-static.spec.ts",
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
const isolatedUnrelatedExecutionFiles = [
  "docs/post-trade-final-source-controlled-staging-execution-gate-no-execution.md",
  "docs/post-trade-final-source-controlled-staging-execution-gate-static-security-review-no-execution.md",
  "docs/post-trade-single-use-source-controlled-staging-execution-authorization-artifact-no-execution.md",
  "docs/post-trade-single-use-source-controlled-staging-execution-authorization-artifact-static-security-review-no-execution.md",
  "docs/post-trade-source-controlled-staging-execution-function-implementation-no-execution.md",
  "docs/post-trade-source-controlled-staging-execution-function-static-security-review-no-execution.md",
  "lib/post-trade-staging-execution-function.ts",
  "lib/post-trade-final-staging-execution-gate-core.ts",
  "lib/post-trade-final-staging-execution-gate.ts",
  "lib/post-trade-staging-execution-authorization-artifact-core.ts",
  "lib/post-trade-staging-execution-authorization-artifact.ts",
  "tests/e2e/post-trade-staging-execution-function-static.spec.ts",
  "tests/e2e/post-trade-final-staging-execution-gate.spec.ts",
  "tests/e2e/post-trade-staging-execution-authorization-artifact.spec.ts",
];

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
  const output = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
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
  if (allowedAction320ImplementationFiles.includes(relativePath)) return false;
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
const isolatedChangedFiles = changedFiles.filter((relativePath) =>
  isolatedUnrelatedExecutionFiles.includes(relativePath),
);
const actionChangedFiles = changedFiles.filter(
  (relativePath) => !isolatedUnrelatedExecutionFiles.includes(relativePath),
);
const workingTreeClean = changedFiles.length === 0;
const uncommittedAction320Only =
  actionChangedFiles.length > 0 &&
  actionChangedFiles.every((relativePath) =>
    allowedAction320ImplementationFiles.includes(relativePath),
  );
const unexpectedUncommittedFiles = actionChangedFiles.filter(
  (relativePath) => !allowedAction320ImplementationFiles.includes(relativePath),
);
const requiredFilesMissing = requiredFiles.filter((relativePath) => !exists(relativePath));
const forbiddenRuntimeChanges = actionChangedFiles.filter(isForbiddenChangedFile);
const forbiddenRuntimeArtifacts = forbiddenRuntimePaths.filter(exists);
const forbiddenMarkersFound = [
  "action_307k_proxy_runtime_crash_isolation",
].filter(markerFound);
const cleanBaseCommitFound = gitCommandSucceeds([
  "merge-base",
  "--is-ancestor",
  expectedCleanBaseCommit,
  "HEAD",
]);
const staticBatchCommitFound = gitCommandSucceeds([
  "merge-base",
  "--is-ancestor",
  expectedStaticBatchCommit,
  "HEAD",
]);
const postCommitVerificationCommitFound = gitCommandSucceeds([
  "merge-base",
  "--is-ancestor",
  expectedPostCommitVerificationCommit,
  "HEAD",
]);

const passed =
  currentBranch === expectedBranch &&
  cleanBaseCommitFound &&
  staticBatchCommitFound &&
  postCommitVerificationCommitFound &&
  (workingTreeClean || uncommittedAction320Only) &&
  unexpectedUncommittedFiles.length === 0 &&
  requiredFilesMissing.length === 0 &&
  forbiddenRuntimeChanges.length === 0 &&
  forbiddenRuntimeArtifacts.length === 0 &&
  forbiddenMarkersFound.length === 0;

const result = {
  verification_status: passed ? "passed" : "failed",
  current_branch: currentBranch,
  expected_branch: expectedBranch,
  clean_base_commit_found: cleanBaseCommitFound,
  expected_clean_base_commit: expectedCleanBaseCommit,
  static_batch_commit_found: staticBatchCommitFound,
  expected_static_batch_commit: expectedStaticBatchCommit,
  post_commit_verification_commit_found: postCommitVerificationCommitFound,
  expected_post_commit_verification_commit: expectedPostCommitVerificationCommit,
  working_tree_clean: workingTreeClean,
  uncommitted_action_320_files_allowed: uncommittedAction320Only,
  uncommitted_files: changedFiles,
  unexpected_uncommitted_files: unexpectedUncommittedFiles,
  isolated_unrelated_execution_files: isolatedChangedFiles,
  isolated_unrelated_execution_files_are_action_artifacts: false,
  branch_package_manifest_only: true,
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
    ? "continue_static_local_development_or_prepare_separate_deploy_readiness_checklist"
    : "restore_static_branch_package_state_before_continuing",
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!passed) process.exitCode = 1;
