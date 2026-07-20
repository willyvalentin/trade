#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();

const dynamicPages = [
  { route: "/ping307h", source: "app/ping307h/page.tsx", manifestKey: "/ping307h/page" },
  {
    route: "/route-publication-probe",
    source: "app/route-publication-probe/page.tsx",
    manifestKey: "/route-publication-probe/page",
  },
  {
    route: "/public-probe-307g",
    source: "app/public-probe-307g/page.tsx",
    manifestKey: "/public-probe-307g/page",
  },
];

const routeHandlers = [
  { route: "/api/ping307h", source: "app/api/ping307h/route.ts", manifestKey: "/api/ping307h/route" },
  {
    route: "/api/hb307c/ping",
    source: "app/api/hb307c/ping/route.ts",
    manifestKey: "/api/hb307c/ping/route",
  },
  {
    route: "/api/route-publication-diagnostic",
    source: "app/api/route-publication-diagnostic/route.ts",
    manifestKey: "/api/route-publication-diagnostic/route",
  },
  {
    route: "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
    source:
      "app/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping/route.ts",
    manifestKey:
      "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping/route",
  },
  {
    route: "/api/historical-backfill/first-tiny-replay-dry-run/ping",
    source: "app/api/historical-backfill/first-tiny-replay-dry-run/ping/route.ts",
    manifestKey: "/api/historical-backfill/first-tiny-replay-dry-run/ping/route",
  },
  {
    route: "/api/historical-backfill/first-tiny-candle-persistence-readback/ping",
    source:
      "app/api/historical-backfill/first-tiny-candle-persistence-readback/ping/route.ts",
    manifestKey:
      "/api/historical-backfill/first-tiny-candle-persistence-readback/ping/route",
  },
];

const knownGoodRouteFamilies = [
  "/api/historical-backfill/first-tiny-candle-persistence-readback",
  "/api/historical-backfill/first-tiny-replay-dry-run",
  "/api/historical-backfill/first-tiny-signal-package-discovery-readback",
];

function absolute(path) {
  return join(root, path);
}

function readText(path) {
  return existsSync(absolute(path)) ? readFileSync(absolute(path), "utf8") : null;
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

function listFiles(path, limit = 600) {
  if (!existsSync(absolute(path))) return [];
  const output = [];
  const stack = [absolute(path)];

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

function parsePackage() {
  const packageJson = readJson("package.json");
  const packageLock = readJson("package-lock.json");
  const packages = packageLock?.packages ?? {};
  return {
    next_version:
      packageJson?.dependencies?.next ??
      packageJson?.devDependencies?.next ??
      packages["node_modules/next"]?.version ??
      null,
    react_version:
      packageJson?.dependencies?.react ??
      packageJson?.devDependencies?.react ??
      packages["node_modules/react"]?.version ??
      null,
    netlify_next_plugin_detected: Boolean(
      packageJson?.dependencies?.["@netlify/plugin-nextjs"] ||
        packageJson?.devDependencies?.["@netlify/plugin-nextjs"] ||
        packages["node_modules/@netlify/plugin-nextjs"],
    ),
    package_manager_lock_detected: {
      package_lock: existsSync(absolute("package-lock.json")),
      pnpm_lock: existsSync(absolute("pnpm-lock.yaml")),
      yarn_lock: existsSync(absolute("yarn.lock")),
    },
  };
}

function parseQuotedTomlValue(text, key) {
  return text?.match(new RegExp(`^\\s*${key}\\s*=\\s*["']([^"']+)["']`, "m"))?.[1] ?? null;
}

function parseNetlifyToml() {
  const text = readText("netlify.toml");
  const pluginMatches = text?.matchAll(/\[\[plugins\]\][\s\S]*?package\s*=\s*["']([^"']+)["']/g) ?? [];
  return {
    netlify_toml_present: text !== null,
    netlify_toml_build_command: parseQuotedTomlValue(text, "command"),
    netlify_toml_publish: parseQuotedTomlValue(text, "publish"),
    netlify_toml_plugins: Array.from(pluginMatches, (match) => match[1]),
    redirects_detected: {
      netlify_toml_redirect_blocks: (text?.match(/\[\[redirects\]\]/g) ?? []).length,
      public_redirects_present: existsSync(absolute("public/_redirects")),
      public_redirect_rules: readText("public/_redirects")
        ?.split(/\r?\n/)
        .filter((line) => line.trim() && !line.trim().startsWith("#")).length ?? 0,
    },
    headers_detected: {
      netlify_toml_header_blocks: (text?.match(/\[\[headers\]\]/g) ?? []).length,
      public_headers_present: existsSync(absolute("public/_headers")),
      public_header_rules: readText("public/_headers")
        ?.split(/\r?\n/)
        .filter((line) => line.trim() && !line.trim().startsWith("#")).length ?? 0,
    },
  };
}

function parseNextConfig() {
  const path =
    ["next.config.ts", "next.config.mjs", "next.config.js"].find((item) =>
      existsSync(absolute(item)),
    ) ?? null;
  const text = path ? readText(path) : null;
  return {
    next_config_present: path !== null,
    next_config_path: path,
    next_config_flags_summary: {
      output_standalone: text ? /output\s*:\s*["']standalone["']/.test(text) : false,
      output_export: text ? /output\s*:\s*["']export["']/.test(text) : false,
      experimental_present: text ? /\bexperimental\s*:/.test(text) : false,
      rewrites_present: text ? /\basync\s+rewrites\b|\brewrites\s*:/.test(text) : false,
      redirects_present: text ? /\basync\s+redirects\b|\bredirects\s*:/.test(text) : false,
      headers_present: text ? /\basync\s+headers\b|\bheaders\s*:/.test(text) : false,
      trailing_slash_present: text ? /\btrailingSlash\s*:/.test(text) : false,
      base_path_present: text ? /\bbasePath\s*:/.test(text) : false,
      asset_prefix_present: text ? /\bassetPrefix\s*:/.test(text) : false,
    },
  };
}

function manifestKeys() {
  const appPaths =
    readJson(".next/server/app-paths-manifest.json") ??
    readJson(".next/app-paths-manifest.json");
  const routes = readJson(".next/routes-manifest.json");
  const middleware = readJson(".next/server/middleware-manifest.json");
  return {
    app_paths_manifest_present: appPaths !== null,
    routes_manifest_present: routes !== null,
    middleware_manifest_present: middleware !== null,
    app_path_keys: Object.keys(appPaths ?? {}),
    route_manifest_dynamic_routes: routes?.dynamicRoutes ?? [],
    middleware_manifest: middleware
      ? {
          middleware: Object.keys(middleware.middleware ?? {}),
          functions: Object.keys(middleware.functions ?? {}),
          sorted_middleware: middleware.sortedMiddleware ?? [],
        }
      : null,
  };
}

function routeSource(route) {
  const text = readText(route.source);
  return {
    route: route.route,
    source: route.source,
    source_present: text !== null,
    exports_get: text ? /export\s+(async\s+)?function\s+GET\b|export\s+const\s+GET\b/.test(text) : false,
  };
}

function nextManifestRoute(route, keys) {
  return {
    route: route.route,
    manifest_key: route.manifestKey,
    next_manifest_present: keys.includes(route.manifestKey),
    next_server_artifact_present: existsSync(absolute(`.next/server/app${route.route}/route.js`)) ||
      existsSync(absolute(`.next/server/app${route.route}/page.js`)),
  };
}

function netlifyOutput() {
  const directories = [
    ".netlify",
    ".netlify/functions",
    ".netlify/edge-functions",
    ".netlify/server",
    ".netlify/publish",
  ];
  const files = directories.flatMap((directory) => listFiles(directory, 250));
  const directoryPresence = Object.fromEntries(
    directories.map((directory) => [directory, existsSync(absolute(directory))]),
  );
  return {
    netlify_runtime_output_detected: Object.values(directoryPresence).some(Boolean),
    directories: directoryPresence,
    edge_functions_detected: listFiles(".netlify/edge-functions", 250),
    server_functions_detected: listFiles(".netlify/functions", 250),
    sample_files: files.slice(0, 120),
  };
}

function routeInNetlifyOutput(route, files) {
  const compactRoute = route.route.replace(/^\/api\//, "").replace(/^\//, "").replace(/\//g, "-");
  const normalizedRoute = route.route.replace(/^\//, "");
  return files.some(
    (file) =>
      file.includes(compactRoute) ||
      file.includes(normalizedRoute) ||
      file.includes(route.route.replace(/^\//, "").replace(/\//g, "%2F")),
  );
}

function knownGoodFamily(family, keys, netlifyFiles) {
  const sourceBase = `app${family}`;
  return {
    route_family: family,
    source_present: existsSync(absolute(`${sourceBase}/route.ts`)) ||
      existsSync(absolute(`${sourceBase}/ping/route.ts`)),
    next_manifest_present: keys.some((key) => key.startsWith(`${family}/`)),
    netlify_output_present: routeInNetlifyOutput({ route: family }, netlifyFiles),
  };
}

const packageInfo = parsePackage();
const netlifyToml = parseNetlifyToml();
const nextConfig = parseNextConfig();
const manifests = manifestKeys();
const netlify = netlifyOutput();
const netlifyFiles = netlify.sample_files;
const sourceRoutes = routeHandlers.map(routeSource);
const sourcePages = dynamicPages.map((route) => ({
  route: route.route,
  source: route.source,
  source_present: existsSync(absolute(route.source)),
}));
const allRoutes = [...routeHandlers, ...dynamicPages];
const routesFoundInNextManifests = allRoutes.map((route) =>
  nextManifestRoute(route, manifests.app_path_keys),
);
const routesFoundInNetlifyOutput = allRoutes.map((route) => ({
  route: route.route,
  netlify_output_present: routeInNetlifyOutput(route, netlifyFiles),
}));
const knownGoodRouteFamilyReadback = knownGoodRouteFamilies.map((family) =>
  knownGoodFamily(family, manifests.app_path_keys, netlifyFiles),
);

const suspiciousRuntimeFindings = [];
const blockers = [];
const warnings = [];

if (!manifests.app_paths_manifest_present) {
  blockers.push("missing_next_app_paths_manifest");
}

if (routesFoundInNextManifests.some((route) => !route.next_manifest_present)) {
  blockers.push("diagnostic_routes_missing_from_next_manifest");
}

if (!netlify.netlify_runtime_output_detected) {
  warnings.push("netlify_runtime_output_not_present_locally");
}

if (
  netlify.netlify_runtime_output_detected &&
  routesFoundInNetlifyOutput.some((route) => !route.netlify_output_present)
) {
  suspiciousRuntimeFindings.push("routes_present_in_next_manifest_but_not_identified_in_netlify_output");
}

if (!packageInfo.netlify_next_plugin_detected) {
  warnings.push("netlify_next_plugin_not_explicitly_declared");
}

if (nextConfig.next_config_flags_summary.output_export) {
  blockers.push("next_output_export_would_not_support_route_handlers");
}

if (nextConfig.next_config_flags_summary.output_standalone) {
  warnings.push("next_output_standalone_present_confirm_netlify_adapter_support");
}

const audit = {
  audit_status: "completed",
  audit_marker: "action_307l_netlify_next_runtime_adapter_audit",
  static_assets_confirmed_by_prior_probe: true,
  proxy_confirmed_live_by_header: true,
  suspected_boundary: "next_runtime_after_proxy_pass_through",
  next_version: packageInfo.next_version,
  react_version: packageInfo.react_version,
  package_manager_lock_detected: packageInfo.package_manager_lock_detected,
  netlify_next_plugin_detected: packageInfo.netlify_next_plugin_detected,
  netlify_runtime_output_detected: netlify.netlify_runtime_output_detected,
  netlify_toml_present: netlifyToml.netlify_toml_present,
  netlify_toml_build_command: netlifyToml.netlify_toml_build_command,
  netlify_toml_publish: netlifyToml.netlify_toml_publish,
  netlify_toml_plugins: netlifyToml.netlify_toml_plugins,
  next_config_present: nextConfig.next_config_present,
  next_config_path: nextConfig.next_config_path,
  next_config_flags_summary: nextConfig.next_config_flags_summary,
  proxy_present: existsSync(absolute("proxy.ts")),
  middleware_present:
    existsSync(absolute("middleware.ts")) ||
    existsSync(absolute("middleware.js")) ||
    existsSync(absolute("src/middleware.ts")),
  route_handlers_found_in_source: sourceRoutes,
  dynamic_pages_found_in_source: sourcePages,
  routes_found_in_next_manifests: routesFoundInNextManifests,
  routes_found_in_netlify_output: routesFoundInNetlifyOutput,
  known_good_route_families: knownGoodRouteFamilyReadback,
  next_manifests: manifests,
  edge_functions_detected: netlify.edge_functions_detected,
  server_functions_detected: netlify.server_functions_detected,
  netlify_output_directories: netlify.directories,
  netlify_output_sample_files: netlify.sample_files,
  redirects_detected: netlifyToml.redirects_detected,
  headers_detected: netlifyToml.headers_detected,
  suspicious_runtime_findings: suspiciousRuntimeFindings,
  blockers,
  warnings,
  safety: {
    local_filesystem_only: true,
    production_called: false,
    provider_call_executed: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    supabase_write_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    secrets_printed: false,
  },
  recommended_next_steps: [
    "deploy_static_action_307l_runtime_boundary_status_json",
    "confirm_static_status_200_before_runtime_retests",
    "retest_runtime_routes_for_empty_400_with_proxy_marker",
    "inspect_netlify_deploy_logs_and_adapter_output",
    "rollback_to_last_known_good_deploy_if_no_narrow_config_fix_is_identified",
    "resume_action_307_ping_auth_flow_only_after_runtime_json_returns",
  ],
};

process.stdout.write(`${JSON.stringify(audit, null, 2)}\n`);
