#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();

const pageRoutes = [
  { route: "/ping307h", source: "app/ping307h/page.tsx" },
  { route: "/route-publication-probe", source: "app/route-publication-probe/page.tsx" },
  { route: "/public-probe-307g", source: "app/public-probe-307g/page.tsx" },
];

const apiRoutes = [
  { route: "/api/ping307h", source: "app/api/ping307h/route.ts", expected_exports: ["GET"] },
  { route: "/api/hb307c/ping", source: "app/api/hb307c/ping/route.ts", expected_exports: ["GET"] },
  {
    route: "/api/route-publication-diagnostic",
    source: "app/api/route-publication-diagnostic/route.ts",
    expected_exports: ["GET"],
  },
  {
    route: "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
    source:
      "app/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping/route.ts",
    expected_exports: ["GET"],
  },
  {
    route: "/api/historical-backfill/first-tiny-replay-dry-run/ping",
    source: "app/api/historical-backfill/first-tiny-replay-dry-run/ping/route.ts",
    expected_exports: ["GET"],
  },
  {
    route: "/api/historical-backfill/first-tiny-candle-persistence-readback/ping",
    source:
      "app/api/historical-backfill/first-tiny-candle-persistence-readback/ping/route.ts",
    expected_exports: ["GET"],
  },
];

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

function listFiles(path, limit = 300) {
  const absolute = join(root, path);
  if (!existsSync(absolute)) return [];
  const output = [];
  const stack = [absolute];

  while (stack.length > 0 && output.length < limit) {
    const current = stack.pop();
    if (!current) continue;
    const stats = statSync(current);
    if (stats.isDirectory()) {
      for (const entry of readdirSync(current).sort().reverse()) {
        stack.push(join(current, entry));
      }
    } else {
      output.push(relative(root, current));
    }
  }

  return output.sort();
}

function routeExportMethods(text) {
  if (!text) return [];
  return ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].filter(
    (method) =>
      new RegExp(
        `export\\s+(async\\s+)?function\\s+${method}\\b|export\\s+const\\s+${method}\\b`,
      ).test(text) ||
      new RegExp(`export\\s*\\{[^}]*\\b${method}\\b[^}]*\\}`).test(text),
  );
}

function importsTradingLogic(text) {
  if (!text) return false;
  return text
    .split(/\r?\n/)
    .filter((line) => /^\s*import\s+/.test(line))
    .some((line) =>
      /trade-app|supabase|Twelve|twelve|recommendation|scanner|broker|execution/i.test(
        line,
      ),
    );
}

function packageAudit() {
  const packageJson = readJson("package.json");
  const packageLock = readJson("package-lock.json");
  return {
    node_version: process.version,
    package_manager_lock_detected: {
      package_lock: existsSync(join(root, "package-lock.json")),
      yarn_lock: existsSync(join(root, "yarn.lock")),
      pnpm_lock: existsSync(join(root, "pnpm-lock.yaml")),
    },
    next_version:
      packageJson?.dependencies?.next ??
      packageJson?.devDependencies?.next ??
      packageLock?.packages?.["node_modules/next"]?.version ??
      null,
    netlify_next_plugin_detected: Boolean(
      packageJson?.dependencies?.["@netlify/plugin-nextjs"] ||
        packageJson?.devDependencies?.["@netlify/plugin-nextjs"],
    ),
  };
}

function configAudit() {
  const nextConfig =
    readText("next.config.ts") ??
    readText("next.config.js") ??
    readText("next.config.mjs");
  const netlifyToml = readText("netlify.toml");
  const publicRedirects = readText("public/_redirects");

  const redirectSources = [
    { source: "netlify.toml", text: netlifyToml },
    { source: "public/_redirects", text: publicRedirects },
  ].filter((item) => item.text !== null);
  const broadRedirects = redirectSources.flatMap((item) =>
    item.text
      .split(/\r?\n/)
      .map((line, index) => ({ source: item.source, line: index + 1, text: line.trim() }))
      .filter((line) =>
        /^\/\*\s+/.test(line.text) ||
        /^\/api\/\*\s+/.test(line.text) ||
        /^from\s*=\s*["']\/\*["']/i.test(line.text) ||
        /^from\s*=\s*["']\/api\/\*["']/i.test(line.text),
      ),
  );

  return {
    next_config_present: nextConfig !== null,
    netlify_toml_present: netlifyToml !== null,
    redirects_detected: redirectSources.map((item) => item.source),
    broad_redirect_rules: broadRedirects,
  };
}

function proxyAudit() {
  const proxyText = readText("proxy.ts");
  const middlewareText =
    readText("middleware.ts") ??
    readText("middleware.js") ??
    readText("src/middleware.ts");
  const suspicious = [];

  if (proxyText) {
    if (/from\s+["']fs["']|from\s+["']node:fs["']|require\(["']fs["']\)/.test(proxyText)) {
      suspicious.push("proxy_imports_fs");
    }
    if (/from\s+["']child_process["']|require\(["']child_process["']\)/.test(proxyText)) {
      suspicious.push("proxy_imports_child_process");
    }
    if (/new\s+RegExp\s*\(/.test(proxyText)) {
      suspicious.push("proxy_constructs_regex_at_runtime");
    }
    if (!/matcher\s*:/.test(proxyText)) {
      suspicious.push("proxy_missing_matcher");
    }
    if (
      !/TURE_PROXY_MINIMAL_DIAGNOSTIC_MODE/.test(proxyText) &&
      !/action_307k_proxy_runtime_crash_isolation/.test(proxyText)
    ) {
      suspicious.push("proxy_minimal_mode_missing");
    }
  }

  return {
    proxy_ts_present: proxyText !== null,
    middleware_ts_present: middlewareText !== null,
    proxy_exports_named_proxy: proxyText
      ? /export\s+(async\s+)?function\s+proxy|export\s+const\s+proxy/.test(proxyText)
      : false,
    proxy_import_count: proxyText
      ? (proxyText.match(/^import\s+/gm) ?? []).length
      : 0,
    proxy_uses_node_only_apis_detected: suspicious.some((item) =>
      item.includes("imports"),
    ),
    proxy_module_scope_risk_notes: suspicious,
  };
}

function routeSourceAudit(routes, kind) {
  return routes.map((route) => {
    const text = readText(route.source);
    return {
      route: route.route,
      kind,
      source: route.source,
      source_exists: text !== null,
      expected_exports: route.expected_exports ?? ["page"],
      exported_methods: route.expected_exports ? routeExportMethods(text) : [],
      expected_exports_present: route.expected_exports
        ? route.expected_exports.every((method) =>
            routeExportMethods(text).includes(method),
          )
        : text !== null,
      imports_trading_logic: importsTradingLogic(text),
    };
  });
}

function buildManifestAudit() {
  const appPaths =
    readJson(".next/server/app-paths-manifest.json") ??
    readJson(".next/dev/server/app-paths-manifest.json");
  const keys = new Set(Object.keys(appPaths ?? {}));
  const pageManifest = pageRoutes.map((route) => {
    const manifestKey = `${route.route}/page`;
    return {
      route: route.route,
      manifest_key: manifestKey,
      found_in_next_build_manifest: keys.has(manifestKey),
      artifact_exists: existsSync(join(root, `.next/server/app${route.route}/page.js`)),
    };
  });
  const apiManifest = apiRoutes.map((route) => {
    const manifestKey = `${route.route}/route`;
    return {
      route: route.route,
      manifest_key: manifestKey,
      found_in_next_build_manifest: keys.has(manifestKey),
      artifact_exists: existsSync(join(root, `.next/server/app${route.route}/route.js`)),
      nft_artifact_exists: existsSync(
        join(root, `.next/server/app${route.route}/route.js.nft.json`),
      ),
    };
  });

  return {
    next_manifest_present: appPaths !== null,
    dynamic_routes_found_in_next_build_manifests: pageManifest,
    api_routes_found_in_next_build_manifests: apiManifest,
  };
}

function netlifyOutputAudit() {
  const directories = [
    ".netlify",
    ".netlify/functions",
    ".netlify/edge-functions",
    ".netlify/server",
  ];
  return {
    netlify_output_detected: Object.fromEntries(
      directories.map((directory) => [directory, existsSync(join(root, directory))]),
    ),
    sample_files: directories.flatMap((directory) => listFiles(directory, 50)).slice(0, 80),
  };
}

const packageInfo = packageAudit();
const config = configAudit();
const proxy = proxyAudit();
const sourcePages = routeSourceAudit(pageRoutes, "page");
const sourceApis = routeSourceAudit(apiRoutes, "api");
const manifests = buildManifestAudit();
const netlify = netlifyOutputAudit();

const suspiciousFindings = [];
if (proxy.proxy_module_scope_risk_notes.length > 0) {
  suspiciousFindings.push(...proxy.proxy_module_scope_risk_notes);
}
if (config.broad_redirect_rules.length > 0) {
  suspiciousFindings.push("broad_redirect_rules_detected");
}
for (const route of [...sourcePages, ...sourceApis]) {
  if (!route.source_exists) suspiciousFindings.push(`missing_source:${route.route}`);
  if (!route.expected_exports_present)
    suspiciousFindings.push(`missing_expected_export:${route.route}`);
  if (route.imports_trading_logic)
    suspiciousFindings.push(`diagnostic_route_imports_trading_logic:${route.route}`);
}
for (const route of [
  ...manifests.dynamic_routes_found_in_next_build_manifests,
  ...manifests.api_routes_found_in_next_build_manifests,
]) {
  if (!route.found_in_next_build_manifest)
    suspiciousFindings.push(`route_missing_from_next_manifest:${route.route}`);
  if (!route.artifact_exists)
    suspiciousFindings.push(`route_missing_next_artifact:${route.route}`);
}

const netlifyOutputPresent = Object.values(netlify.netlify_output_detected).some(Boolean);
if (!netlifyOutputPresent) {
  suspiciousFindings.push("route_exists_in_manifest_but_no_local_netlify_runtime_output");
}

const audit = {
  audit_status: "completed",
  audit_marker: "action_307j_next_runtime_boundary_audit",
  node_version: packageInfo.node_version,
  package_manager_lock_detected: packageInfo.package_manager_lock_detected,
  next_version: packageInfo.next_version,
  netlify_next_plugin_detected: packageInfo.netlify_next_plugin_detected,
  next_config_present: config.next_config_present,
  netlify_toml_present: config.netlify_toml_present,
  proxy_ts_present: proxy.proxy_ts_present,
  middleware_ts_present: proxy.middleware_ts_present,
  app_router_present: existsSync(join(root, "app")),
  public_static_probes_present: {
    "public/ping307i.txt": existsSync(join(root, "public/ping307i.txt")),
    "public/ping307i.json": existsSync(join(root, "public/ping307i.json")),
    "public/ping307j.html": existsSync(join(root, "public/ping307j.html")),
  },
  dynamic_page_routes_found_in_source: sourcePages,
  api_routes_found_in_source: sourceApis,
  dynamic_routes_found_in_next_build_manifests:
    manifests.dynamic_routes_found_in_next_build_manifests,
  api_routes_found_in_next_build_manifests:
    manifests.api_routes_found_in_next_build_manifests,
  netlify_output_detected: netlify.netlify_output_detected,
  netlify_output_sample_files: netlify.sample_files,
  proxy_runtime_risk_audit: proxy,
  suspicious_findings: suspiciousFindings,
  suspected_boundary: "static_assets_ok_next_runtime_failing",
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
  recommended_next_steps: [
    "deploy_ping307j_static_html_probe",
    "test_ping307j_before_next_runtime_routes",
    "try_TURE_PROXY_MINIMAL_DIAGNOSTIC_MODE_true_if_runtime_routes_still_fail",
    "inspect_netlify_next_adapter_runtime_output_and_deploy_logs",
    "rollback_to_last_known_good_deploy_if_next_runtime_remains_empty_400",
    "keep_all_replay_approval_flags_false",
  ],
};

process.stdout.write(`${JSON.stringify(audit, null, 2)}\n`);
