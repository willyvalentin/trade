import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";

import { GLOBAL_API_BOUNDARY_MARKER, proxy } from "../../proxy";

const htmlProbePath = join(process.cwd(), "public/ping307j.html");
const auditScriptPath = join(
  process.cwd(),
  "scripts/action-307j-next-runtime-boundary-audit.mjs",
);
const runbookPath = join(
  process.cwd(),
  "docs/action-307j-next-runtime-boundary-isolation.md",
);

async function proxyRequest(path: string) {
  return proxy(new NextRequest(`http://localhost${path}`));
}

async function withEnv<T>(
  env: Record<string, string | undefined>,
  callback: () => Promise<T>,
) {
  const keys = [
    "TRADE_APP_PASSWORD",
    "TURE_PROXY_MINIMAL_DIAGNOSTIC_MODE",
    "TURE_PUBLIC_DIAGNOSTIC_ROUTES_ENABLED",
  ];
  const previous = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );

  for (const key of keys) {
    if (env[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = env[key];
    }
  }

  try {
    return await callback();
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  }
}

function runAudit() {
  const output = execFileSync("node", [auditScriptPath], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      TRADE_APP_PASSWORD: "trade-password-that-must-not-appear",
    },
    encoding: "utf8",
  });

  return {
    output,
    audit: JSON.parse(output),
  };
}

test("static HTML probe exists and documents no-effect boundary", () => {
  const html = readFileSync(htmlProbePath, "utf8");

  expect(html).toContain("action_307j_static_html_probe");
  expect(html).toContain("static HTML reachable");
  expect(html).toContain("Next runtime still under investigation");
  expect(html).toContain("no provider call");
  expect(html).toContain("no replay");
  expect(html).toContain("no write");
  expect(html).toContain("no synthetic outcomes");
  expect(html).toContain("no scanner/ranking effects");
});

test("runtime boundary audit runs locally without network or secrets", () => {
  const { output, audit } = runAudit();

  expect(audit.audit_status).toBe("completed");
  expect(audit.audit_marker).toBe("action_307j_next_runtime_boundary_audit");
  expect(audit.suspected_boundary).toBe("static_assets_ok_next_runtime_failing");
  expect(audit.safety.local_filesystem_only).toBe(true);
  expect(audit.safety.production_called).toBe(false);
  expect(audit.safety.provider_call_executed).toBe(false);
  expect(audit.safety.candles_persisted).toBe(false);
  expect(audit.safety.raw_response_persisted).toBe(false);
  expect(audit.safety.fetch_run_persisted).toBe(false);
  expect(audit.safety.synthetic_outcomes_persisted).toBe(false);
  expect(audit.safety.replay_executed).toBe(false);
  expect(audit.safety.scanner_behavior_changed).toBe(false);
  expect(audit.safety.live_ranking_changed).toBe(false);
  expect(audit.safety.supabase_write_executed).toBe(false);
  expect(audit.public_static_probes_present["public/ping307j.html"]).toBe(true);
  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("trade-password-that-must-not-appear");
});

test("audit output lists diagnostic page and API source routes", () => {
  const { audit } = runAudit();
  const pageRoutes = audit.dynamic_page_routes_found_in_source.map(
    (route: { route: string }) => route.route,
  );
  const apiRoutes = audit.api_routes_found_in_source.map(
    (route: { route: string }) => route.route,
  );

  expect(pageRoutes).toEqual(
    expect.arrayContaining([
      "/ping307h",
      "/route-publication-probe",
      "/public-probe-307g",
    ]),
  );
  expect(apiRoutes).toEqual(
    expect.arrayContaining([
      "/api/ping307h",
      "/api/hb307c/ping",
      "/api/route-publication-diagnostic",
      "/api/historical-backfill/first-tiny-replay-dry-run/ping",
      "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
    ]),
  );
});

test("proxy minimal diagnostic mode keeps bypass routes and blocks other API safely", async () => {
  const bypassResponse = await withEnv(
    {
      TRADE_APP_PASSWORD: "trade-password",
      TURE_PROXY_MINIMAL_DIAGNOSTIC_MODE: "true",
    },
    () => proxyRequest("/api/ping307h"),
  );
  const blockedResponse = await withEnv(
    {
      TRADE_APP_PASSWORD: "trade-password",
      TURE_PROXY_MINIMAL_DIAGNOSTIC_MODE: "true",
    },
    () => proxyRequest("/api/symbol-metadata"),
  );
  const blockedBody = await blockedResponse.json();

  expect(bypassResponse.status).not.toBe(401);
  expect(blockedResponse.status).toBe(401);
  expect(blockedResponse.headers.get("Cache-Control")).toBe("no-store");
  expect(blockedBody.boundary).toBe("proxy");
  expect(blockedBody.boundary_marker).toBe(GLOBAL_API_BOUNDARY_MARKER);
  expect(blockedBody.reason).toBe(
    "minimal_diagnostic_mode_api_route_not_in_bypass",
  );
  expect(blockedBody.provider_call_executed).toBe(false);
  expect(blockedBody.replay_executed).toBe(false);
  expect(blockedBody.synthetic_outcomes_persisted).toBe(false);
  expect(blockedBody.scanner_behavior_changed).toBe(false);
  expect(blockedBody.live_ranking_changed).toBe(false);
  expect(blockedBody.recommendation_rows_mutated).toBe(false);
  expect(blockedBody.supabase_write_executed).toBe(false);
});

test("runbook documents production probes, interpretation, rollback, and safety", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/ping307j.html");
  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/ping307h");
  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/api/ping307h");
  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/api/hb307c/ping");
  expect(runbook).toContain("TURE_PROXY_MINIMAL_DIAGNOSTIC_MODE=true");
  expect(runbook).toContain("Netlify Next adapter or runtime output issue");
  expect(runbook).toContain("rollback to the last known good deploy");
  expect(runbook).toContain("no Twelve Data call");
  expect(runbook).toContain("no replay execution");
  expect(runbook).not.toContain("apikey");
});
