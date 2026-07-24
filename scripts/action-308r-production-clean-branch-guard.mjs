#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";

const args = process.argv.slice(2);
const rootArgIndex = args.indexOf("--root");
const root =
  rootArgIndex >= 0 && args[rootArgIndex + 1]
    ? resolve(args[rootArgIndex + 1])
    : process.cwd();

const forbiddenMarkers = [
  "action_307k_proxy_runtime_crash_isolation",
  "action_307c_hb307c_canary",
  "action_307e_global_api_boundary_regression_fix",
  "action_307l_runtime_boundary_status_static",
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

const productionScanRoots = ["app", "public", "proxy.ts"];
const diagnosticDocPattern = /^docs\/action-307[c-m].*\.md$/;
const diagnosticScriptPattern = /^scripts\/action-307[c-m].*\.mjs$/;

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
    if (entry === "node_modules" || entry === ".next" || entry === ".git") {
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

const forbiddenArtifacts = [];

for (const artifactPath of forbiddenPaths) {
  if (pathExists(artifactPath)) {
    forbiddenArtifacts.push({
      type: "forbidden_path",
      path: artifactPath,
    });
  }
}

for (const filePath of walk("docs")) {
  if (diagnosticDocPattern.test(filePath)) {
    forbiddenArtifacts.push({
      type: "forbidden_action_307c_to_307m_doc",
      path: filePath,
    });
  }
}

for (const filePath of walk("scripts")) {
  if (diagnosticScriptPattern.test(filePath)) {
    forbiddenArtifacts.push({
      type: "forbidden_action_307c_to_307m_script",
      path: filePath,
    });
  }
}

const markerHits = [];
for (const scanRoot of productionScanRoots) {
  for (const filePath of walk(scanRoot)) {
    const text = readLocalFile(filePath);
    for (const marker of forbiddenMarkers) {
      if (text.includes(marker)) {
        markerHits.push({
          type: "forbidden_marker",
          marker,
          path: filePath,
        });
      }
    }
  }
}

const proxyText = readLocalFile("proxy.ts");
const action307kProxyMarkerPresent = proxyText.includes(
  "action_307k_proxy_runtime_crash_isolation",
);

if (action307kProxyMarkerPresent) {
  forbiddenArtifacts.push({
    type: "forbidden_proxy_marker",
    marker: "action_307k_proxy_runtime_crash_isolation",
    path: "proxy.ts",
  });
}

for (const hit of markerHits) {
  const alreadyRecorded = forbiddenArtifacts.some(
    (artifact) =>
      artifact.type === hit.type &&
      artifact.path === hit.path &&
      artifact.marker === hit.marker,
  );
  if (!alreadyRecorded) {
    forbiddenArtifacts.push(hit);
  }
}

const cleanForMinimalPing = forbiddenArtifacts.length === 0;

const result = {
  guard_status: cleanForMinimalPing ? "clean" : "blocked",
  checked_root: root,
  forbidden_artifacts_found: forbiddenArtifacts,
  forbidden_artifact_count: forbiddenArtifacts.length,
  forbidden_proxy_marker_found: action307kProxyMarkerPresent,
  action_307k_proxy_marker_present: action307kProxyMarkerPresent,
  clean_for_minimal_ping_reintroduction: cleanForMinimalPing,
  recommended_action: cleanForMinimalPing
    ? "create_minimal_action_308_ping_branch_from_known_good_deploy"
    : "rollback_or_branch_from_deploy_6a501645908e4100088b7396_then_reapply_only_action_308_ping",
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
