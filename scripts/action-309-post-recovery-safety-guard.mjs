#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";

const args = process.argv.slice(2);
const rootArgIndex = args.indexOf("--root");
const root =
  rootArgIndex >= 0 && args[rootArgIndex + 1]
    ? resolve(args[rootArgIndex + 1])
    : process.cwd();

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

const forbiddenMarkers = ["action_307k_proxy_runtime_crash_isolation"];
const markerScanRoots = ["app", "public", "proxy.ts"];

function normalizePath(path) {
  return path.split(sep).join("/");
}

function pathExists(localPath) {
  return existsSync(join(root, localPath));
}

function walk(localPath, results = []) {
  const absolutePath = join(root, localPath);
  if (!existsSync(absolutePath)) return results;

  const stat = statSync(absolutePath);
  if (stat.isFile()) {
    results.push(normalizePath(localPath));
    return results;
  }
  if (!stat.isDirectory()) return results;

  for (const entry of readdirSync(absolutePath)) {
    if (entry === ".git" || entry === ".next" || entry === "node_modules") {
      continue;
    }
    walk(join(localPath, entry), results);
  }

  return results;
}

function readLocalFile(localPath) {
  try {
    return readFileSync(join(root, localPath), "utf8");
  } catch {
    return "";
  }
}

function gitOutput(gitArgs) {
  try {
    return execFileSync("git", gitArgs, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const currentBranch =
  gitOutput(["branch", "--show-current"]) ||
  gitOutput(["rev-parse", "--abbrev-ref", "HEAD"]) ||
  "unknown";

const forbiddenArtifactsFound = forbiddenPaths
  .filter(pathExists)
  .map((path) => ({
    type: "forbidden_path",
    path,
  }));

const forbiddenMarkersFound = [];
for (const scanRoot of markerScanRoots) {
  for (const filePath of walk(scanRoot)) {
    const text = readLocalFile(filePath);
    for (const marker of forbiddenMarkers) {
      if (text.includes(marker)) {
        forbiddenMarkersFound.push({
          type: "forbidden_marker",
          marker,
          path: filePath,
        });
      }
    }
  }
}

const proxyModifiedFromHead = Boolean(gitOutput(["diff", "--name-only", "HEAD", "--", "proxy.ts"]));
const warnings = proxyModifiedFromHead
  ? [
      {
        type: "proxy_modified_from_head",
        path: "proxy.ts",
        message: "proxy.ts is modified from HEAD and must be reviewed before deployment",
      },
    ]
  : [];

const blocked =
  forbiddenArtifactsFound.length > 0 || forbiddenMarkersFound.length > 0;

const result = {
  guard_status: blocked ? "blocked" : "passed",
  current_branch: currentBranch,
  production_deploy_should_remain_rollback: true,
  rollback_deploy_id: "6a501645908e4100088b7396",
  clean_base_commit: "512a0c5",
  main_push_allowed: false,
  runtime_route_changes_allowed: false,
  proxy_changes_allowed: false,
  replay_execute_allowed: false,
  forbidden_artifacts_found: forbiddenArtifactsFound,
  forbidden_markers_found: forbiddenMarkersFound,
  proxy_modified_from_head: proxyModifiedFromHead,
  warnings,
  recommended_next_step: blocked
    ? "remove_forbidden_307_runtime_artifacts_or_branch_again_from_clean_base_512a0c5"
    : proxyModifiedFromHead
      ? "review_proxy_diff_before_any_deploy_and_keep_production_on_rollback"
      : "continue_docs_tests_or_non_runtime_planning_only",
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
