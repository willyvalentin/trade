#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function readText(path) {
  const absolute = join(root, path);
  return existsSync(absolute) ? readFileSync(absolute, "utf8") : null;
}

function readJson(path) {
  const text = readText(path);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

const netlifyToml = readText("netlify.toml");
const nextConfig =
  readText("next.config.ts") ??
  readText("next.config.js") ??
  readText("next.config.mjs");
const packageJson = readJson("package.json");
const publicRedirects = readText("public/_redirects");
const proxyText = readText("proxy.ts");
const middlewareText =
  readText("middleware.ts") ??
  readText("middleware.js") ??
  readText("src/middleware.ts") ??
  readText("src/proxy.ts");
const nextAppPaths = readJson(".next/server/app-paths-manifest.json");

const redirectSources = [
  { source: "netlify.toml", text: netlifyToml },
  { source: "public/_redirects", text: publicRedirects },
].filter((item) => item.text !== null);

const suspiciousRedirects = redirectSources.flatMap((item) => {
  const lines = item.text.split(/\r?\n/);
  return lines
    .map((line, index) => ({ source: item.source, line: index + 1, text: line.trim() }))
    .filter((line) =>
      includesAny(line.text, [
        /^from\s*=\s*["']\/\*["']/i,
        /^from\s*=\s*["']\/api\/\*["']/i,
        /^\/\*\s+/,
        /^\/api\/\*\s+/,
        /\/login/i,
        /\bforce\s*=\s*true\b/i,
      ]),
    );
});

const publicAssetProbeFilesPresent = {
  "public/ping307i.txt": existsSync(join(root, "public/ping307i.txt")),
  "public/ping307i.json": existsSync(join(root, "public/ping307i.json")),
};

const nextManifestStaticRoutes = nextAppPaths
  ? {
      "/ping307h/page": Boolean(nextAppPaths["/ping307h/page"]),
      "/api/ping307h/route": Boolean(nextAppPaths["/api/ping307h/route"]),
      "/route-publication-probe/page": Boolean(
        nextAppPaths["/route-publication-probe/page"],
      ),
      "/public-probe-307g/page": Boolean(nextAppPaths["/public-probe-307g/page"]),
    }
  : null;

const netlifyOutputPresent = [
  ".netlify",
  ".netlify/functions",
  ".netlify/edge-functions",
  ".netlify/server",
  ".netlify/publish",
].some((path) => existsSync(join(root, path)));

const blockers = [];
const warnings = [];

if (!publicAssetProbeFilesPresent["public/ping307i.txt"]) {
  blockers.push("missing_public_ping307i_txt");
}
if (!publicAssetProbeFilesPresent["public/ping307i.json"]) {
  blockers.push("missing_public_ping307i_json");
}
if (suspiciousRedirects.length > 0) {
  warnings.push("suspicious_redirects_detected");
}
if (!netlifyOutputPresent) {
  warnings.push("netlify_build_output_not_present_locally");
}
if (!nextAppPaths) {
  warnings.push("next_server_app_paths_manifest_not_present_run_build_first");
}

let suspectedBoundary = "static_probe_files_ready_for_deploy";
if (blockers.length > 0) {
  suspectedBoundary = "local_static_probe_file_setup_incomplete";
} else if (suspiciousRedirects.length > 0) {
  suspectedBoundary = "possible_netlify_redirect_or_auth_boundary";
} else if (!netlifyOutputPresent) {
  suspectedBoundary = "netlify_output_not_available_for_local_verification";
}

const audit = {
  audit_status: "completed",
  audit_marker: "action_307i_netlify_static_boundary_audit",
  safety: {
    local_filesystem_only: true,
    production_called: false,
    provider_call_executed: false,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    supabase_write_executed: false,
    secrets_printed: false,
  },
  netlify_config_present: netlifyToml !== null,
  public_asset_probe_files_present: publicAssetProbeFilesPresent,
  next_config_present: nextConfig !== null,
  package_build_script: packageJson?.scripts?.build ?? null,
  redirects_detected: redirectSources.map((item) => item.source),
  suspicious_redirects: suspiciousRedirects,
  middleware_or_proxy_present: {
    proxy_ts: proxyText !== null,
    middleware: middlewareText !== null,
  },
  netlify_config_summary: netlifyToml
    ? {
        functions_directory:
          netlifyToml.match(/directory\s*=\s*["']([^"']+)["']/)?.[1] ?? null,
        redirect_blocks: (netlifyToml.match(/\[\[redirects\]\]/g) ?? []).length,
        header_blocks: (netlifyToml.match(/\[\[headers\]\]/g) ?? []).length,
        build_command:
          netlifyToml.match(/command\s*=\s*["']([^"']+)["']/)?.[1] ?? null,
        publish_directory:
          netlifyToml.match(/publish\s*=\s*["']([^"']+)["']/)?.[1] ?? null,
      }
    : null,
  next_manifest_static_routes: nextManifestStaticRoutes,
  netlify_output_present: netlifyOutputPresent,
  suspected_boundary: suspectedBoundary,
  blockers,
  warnings,
  recommended_next_steps: [
    "deploy_static_asset_probes",
    "curl_ping307i_txt_and_json_before_app_routes",
    "rollback_to_last_known_good_netlify_deploy_if_static_assets_return_empty_400",
    "only_resume_action_307_ping_auth_checks_after_static_and_api_boundaries_are_healthy",
    "keep_all_replay_approval_flags_false",
  ],
};

process.stdout.write(`${JSON.stringify(audit, null, 2)}\n`);
