#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();

const relevantRoutes = [
  {
    route: "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
    source: "app/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping/route.ts",
    expected_exports: ["GET"],
  },
  {
    route: "/api/historical-backfill/first-tiny-signal-package-discovery-readback",
    source: "app/api/historical-backfill/first-tiny-signal-package-discovery-readback/route.ts",
    expected_exports: ["POST"],
  },
  {
    route: "/api/historical-backfill/first-tiny-replay-dry-run/ping",
    source: "app/api/historical-backfill/first-tiny-replay-dry-run/ping/route.ts",
    expected_exports: ["GET"],
  },
  {
    route: "/api/historical-backfill/first-tiny-replay-dry-run",
    source: "app/api/historical-backfill/first-tiny-replay-dry-run/route.ts",
    expected_exports: ["POST"],
  },
  {
    route: "/api/historical-backfill/first-tiny-candle-persistence-readback/ping",
    source: "app/api/historical-backfill/first-tiny-candle-persistence-readback/ping/route.ts",
    expected_exports: ["GET"],
  },
  {
    route: "/api/historical-backfill/first-tiny-candle-persistence-readback",
    source: "app/api/historical-backfill/first-tiny-candle-persistence-readback/route.ts",
    expected_exports: ["POST"],
  },
  {
    route: "/api/hb307c/ping",
    source: "app/api/hb307c/ping/route.ts",
    expected_exports: ["GET"],
  },
  {
    route: "/api/hb307c",
    source: "app/api/hb307c/route.ts",
    expected_exports: ["POST"],
  },
  {
    route: "/api/route-publication-diagnostic",
    source: "app/api/route-publication-diagnostic/route.ts",
    expected_exports: ["GET"],
  },
  {
    route: "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping",
    source: "app/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping/route.ts",
    expected_exports: ["GET"],
  },
  {
    route: "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run",
    source: "app/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/route.ts",
    expected_exports: ["POST"],
  },
  {
    route: "/api/historical-backfill/first-tiny-signal-replay-dry-run/ping",
    source: "app/api/historical-backfill/first-tiny-signal-replay-dry-run/ping/route.ts",
    expected_exports: ["GET"],
  },
  {
    route: "/api/historical-backfill/first-tiny-signal-replay-dry-run",
    source: "app/api/historical-backfill/first-tiny-signal-replay-dry-run/route.ts",
    expected_exports: ["POST"],
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

function listFiles(path, limit = 500) {
  const absolute = join(root, path);
  if (!existsSync(absolute)) return [];
  const output = [];
  const stack = [absolute];

  while (stack.length > 0 && output.length < limit) {
    const current = stack.pop();
    if (!current) continue;
    const stat = statSync(current);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current).sort().reverse()) {
        stack.push(join(current, entry));
      }
      continue;
    }
    output.push(relative(root, current));
  }

  return output.sort();
}

function packageAudit() {
  const packageJson = readJson("package.json");
  return {
    package_manager: existsSync(join(root, "package-lock.json"))
      ? "npm/package-lock"
      : "unknown",
    scripts: {
      build: packageJson?.scripts?.build ?? null,
      start: packageJson?.scripts?.start ?? null,
      lint: packageJson?.scripts?.lint ?? null,
      audit_api_publication: packageJson?.scripts?.["audit:api-publication"] ?? null,
    },
    dependencies: {
      next: packageJson?.dependencies?.next ?? null,
      netlify_functions: packageJson?.dependencies?.["@netlify/functions"] ?? null,
    },
  };
}

function nextConfigAudit() {
  const candidates = ["next.config.ts", "next.config.js", "next.config.mjs"];
  const found = candidates.find((path) => existsSync(join(root, path))) ?? null;
  const text = found ? readText(found) ?? "" : "";
  return {
    present: found !== null,
    file: found,
    mentions_output: /\boutput\s*:/.test(text),
    mentions_rewrites: /\basync\s+rewrites\b|\brewrites\s*:/.test(text),
    mentions_redirects: /\basync\s+redirects\b|\bredirects\s*:/.test(text),
    mentions_headers: /\basync\s+headers\b|\bheaders\s*:/.test(text),
    mentions_trailing_slash: /\btrailingSlash\b/.test(text),
  };
}

function netlifyTomlAudit() {
  const text = readText("netlify.toml");
  if (!text) {
    return {
      present: false,
      build_command: null,
      publish_directory: null,
      functions_directory: null,
      plugins: [],
      redirect_blocks: 0,
      header_blocks: 0,
    };
  }

  const plugins = [...text.matchAll(/package\s*=\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  const pick = (key) => {
    const match = text.match(new RegExp(`${key}\\s*=\\s*["']([^"']+)["']`));
    return match?.[1] ?? null;
  };

  return {
    present: true,
    build_command: pick("command"),
    publish_directory: pick("publish"),
    functions_directory: pick("directory"),
    plugins,
    redirect_blocks: (text.match(/\[\[redirects\]\]/g) ?? []).length,
    header_blocks: (text.match(/\[\[headers\]\]/g) ?? []).length,
  };
}

function proxyAudit() {
  const proxyText = readText("proxy.ts");
  const middlewareText =
    readText("middleware.ts") ??
    readText("middleware.js") ??
    readText("src/middleware.ts") ??
    readText("src/proxy.ts");
  return {
    proxy_present: proxyText !== null,
    proxy_exports_named_proxy: proxyText ? /export\s+(async\s+)?function\s+proxy|export\s+const\s+proxy/.test(proxyText) : false,
    proxy_exports_default: proxyText ? /export\s+default\s+/.test(proxyText) : false,
    proxy_has_matcher: proxyText ? /export\s+const\s+config\s*=/.test(proxyText) && /matcher\s*:/.test(proxyText) : false,
    proxy_mentions_api_pass_through: proxyText ? /isApiRouteHandlerPassThrough|historical-backfill|hb307c/.test(proxyText) : false,
    middleware_present: middlewareText !== null,
  };
}

function routeExportAudit(route) {
  const text = readText(route.source);
  const exported = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].filter(
    (method) =>
      text
        ? new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\b|export\\s+const\\s+${method}\\b`).test(
            text,
          ) ||
          new RegExp(`export\\s*\\{[^}]*\\b${method}\\b[^}]*\\}`).test(text)
        : false,
  );
  const serverOnlyImports = text
    ? [
        ...text.matchAll(/import\s+(?:type\s+)?(?:[^"']+from\s+)?["']([^"']+)["']/g),
      ]
        .map((match) => match[1])
        .filter((source) =>
          [
            "@/lib/supabase-server",
            "@supabase",
            "node:",
            "fs",
            "child_process",
          ].some((needle) => source.includes(needle)),
        )
    : [];

  return {
    route: route.route,
    source: route.source,
    source_exists: text !== null,
    expected_exports: route.expected_exports,
    exported_methods: exported,
    expected_exports_present: route.expected_exports.every((method) =>
      exported.includes(method),
    ),
    imports_server_only_modules: serverOnlyImports.length > 0,
    server_only_imports: serverOnlyImports,
    server_only_imports_safely_scoped_to_route_handler:
      text !== null && !/["']use client["']/.test(text),
  };
}

function manifestAudit() {
  const manifestPaths = [
    ".next/server/app-paths-manifest.json",
    ".next/app-path-routes-manifest.json",
    ".next/routes-manifest.json",
    ".next/dev/server/app-paths-manifest.json",
  ];
  const manifests = Object.fromEntries(
    manifestPaths.map((path) => [path, readJson(path)]),
  );
  const appPaths =
    manifests[".next/server/app-paths-manifest.json"] ??
    manifests[".next/dev/server/app-paths-manifest.json"] ??
    {};
  const appPathKeys = new Set(Object.keys(appPaths));

  return {
    manifests_present: Object.fromEntries(
      manifestPaths.map((path) => [path, manifests[path] !== null]),
    ),
    routes: relevantRoutes.map((route) => {
      const manifestKey = `${route.route}/route`;
      const artifact = `.next/server/app${route.route}/route.js`;
      return {
        route: route.route,
        manifest_key: manifestKey,
        found_in_next_manifest: appPathKeys.has(manifestKey),
        next_manifest_value: appPaths[manifestKey] ?? null,
        server_app_artifact: artifact,
        server_app_artifact_exists: existsSync(join(root, artifact)),
        nft_artifact_exists: existsSync(join(root, `${artifact}.nft.json`)),
      };
    }),
  };
}

function netlifyOutputAudit() {
  const directories = [
    ".netlify",
    ".netlify/functions",
    ".netlify/edge-functions",
    ".netlify/server",
    ".netlify/publish",
  ];
  const files = directories.flatMap((directory) => listFiles(directory, 200));
  return {
    directories: Object.fromEntries(
      directories.map((directory) => [directory, existsSync(join(root, directory))]),
    ),
    file_count: files.length,
    sample_files: files.slice(0, 80),
    relevant_route_file_matches: relevantRoutes.map((route) => ({
      route: route.route,
      found_in_netlify_output: files.some((file) =>
        file.includes(route.route.replace(/^\//, "").replaceAll("/", "_")) ||
        file.includes(route.route.replace(/^\//, "")),
      ),
    })),
  };
}

function deriveSummary({ sourceRoutes, manifest, netlify }) {
  const missingSource = sourceRoutes.filter((item) => !item.source_exists);
  const missingManifest = manifest.routes.filter(
    (item) => !item.found_in_next_manifest || !item.server_app_artifact_exists,
  );
  const netlifyPresent = Object.values(netlify.directories).some(Boolean);
  const missingNetlify = netlify.relevant_route_file_matches.filter(
    (item) => !item.found_in_netlify_output,
  );
  const blockers = [];
  const warnings = [];

  if (missingSource.length > 0) blockers.push("source_route_files_missing");
  if (missingManifest.length > 0) blockers.push("next_manifest_or_artifacts_missing_routes");
  if (!netlifyPresent) warnings.push("netlify_build_output_directory_not_present_locally");
  if (netlifyPresent && missingNetlify.length > 0) {
    warnings.push("relevant_routes_not_identified_in_netlify_output");
  }

  let suspectedBoundary = "local_source_and_next_build_artifacts_present";
  if (missingSource.length > 0) suspectedBoundary = "source_route_publication_issue";
  else if (missingManifest.length > 0) suspectedBoundary = "next_build_route_manifest_issue";
  else if (netlifyPresent && missingNetlify.length > 0)
    suspectedBoundary = "netlify_adapter_output_issue";
  else if (!netlifyPresent)
    suspectedBoundary = "netlify_output_not_available_for_local_verification";

  return {
    suspected_boundary: suspectedBoundary,
    blockers,
    warnings,
    recommended_next_steps: [
      "run_npm_build_and_re_run_this_audit",
      "deploy_and_check_route_publication_probe_page",
      "compare_api_ping_status_against_page_probe_status",
      "inspect_netlify_deploy_logs_and_published_functions_if_empty_400_remains",
      "keep_replay_provider_persistence_and_scanner_effects_disabled",
    ],
  };
}

const sourceRoutes = relevantRoutes.map(routeExportAudit);
const manifest = manifestAudit();
const netlify = netlifyOutputAudit();
const summary = deriveSummary({ sourceRoutes, manifest, netlify });

const audit = {
  audit_status: "completed",
  audit_marker: "action_307f_netlify_api_publication_forensic_audit",
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
  package: packageAudit(),
  next_config: nextConfigAudit(),
  netlify_config: netlifyTomlAudit(),
  proxy: proxyAudit(),
  proxy_present: proxyAudit().proxy_present,
  middleware_present: proxyAudit().middleware_present,
  netlify_config_present: netlifyTomlAudit().present,
  api_routes_found_in_source: sourceRoutes,
  api_routes_found_in_next_manifest: manifest.routes,
  api_routes_found_in_netlify_output: netlify.relevant_route_file_matches,
  next_manifests: manifest.manifests_present,
  netlify_output: netlify,
  suspected_boundary: summary.suspected_boundary,
  blockers: summary.blockers,
  warnings: summary.warnings,
  recommended_next_steps: summary.recommended_next_steps,
};

process.stdout.write(`${JSON.stringify(audit, null, 2)}\n`);
