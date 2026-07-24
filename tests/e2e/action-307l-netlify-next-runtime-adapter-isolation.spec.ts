import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const auditScriptPath = join(
  process.cwd(),
  "scripts/action-307l-netlify-next-runtime-adapter-audit.mjs",
);
const staticStatusPath = join(
  process.cwd(),
  "public/action-307l-runtime-boundary-status.json",
);
const runbookPath = join(
  process.cwd(),
  "docs/action-307l-netlify-next-runtime-adapter-isolation.md",
);

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

test("adapter audit script runs locally without network or secrets", () => {
  const { output, audit } = runAudit();

  expect(audit.audit_status).toBe("completed");
  expect(audit.audit_marker).toBe("action_307l_netlify_next_runtime_adapter_audit");
  expect(audit.static_assets_confirmed_by_prior_probe).toBe(true);
  expect(audit.proxy_confirmed_live_by_header).toBe(true);
  expect(audit.suspected_boundary).toBe("next_runtime_after_proxy_pass_through");
  expect(audit.safety.local_filesystem_only).toBe(true);
  expect(audit.safety.production_called).toBe(false);
  expect(audit.safety.provider_call_executed).toBe(false);
  expect(audit.safety.replay_executed).toBe(false);
  expect(audit.safety.synthetic_outcomes_persisted).toBe(false);
  expect(audit.safety.supabase_write_executed).toBe(false);
  expect(audit.safety.scanner_behavior_changed).toBe(false);
  expect(audit.safety.live_ranking_changed).toBe(false);
  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("trade-password-that-must-not-appear");
});

test("adapter audit reports source routes, manifests, and known-good families", () => {
  const { audit } = runAudit();
  const sourceRoutes = audit.route_handlers_found_in_source.map(
    (route: { route: string }) => route.route,
  );
  const sourcePages = audit.dynamic_pages_found_in_source.map(
    (route: { route: string }) => route.route,
  );
  const knownGoodFamilies = audit.known_good_route_families.map(
    (route: { route_family: string }) => route.route_family,
  );

  expect(sourceRoutes).toEqual(
    expect.arrayContaining([
      "/api/ping307h",
      "/api/hb307c/ping",
      "/api/route-publication-diagnostic",
      "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
    ]),
  );
  expect(sourcePages).toEqual(
    expect.arrayContaining([
      "/ping307h",
      "/route-publication-probe",
      "/public-probe-307g",
    ]),
  );
  expect(knownGoodFamilies).toEqual(
    expect.arrayContaining([
      "/api/historical-backfill/first-tiny-candle-persistence-readback",
      "/api/historical-backfill/first-tiny-replay-dry-run",
      "/api/historical-backfill/first-tiny-signal-package-discovery-readback",
    ]),
  );
  expect(Array.isArray(audit.routes_found_in_next_manifests)).toBe(true);
  expect(Array.isArray(audit.routes_found_in_netlify_output)).toBe(true);
});

test("static runtime boundary status JSON exists and has all no-effect flags false", () => {
  const status = JSON.parse(readFileSync(staticStatusPath, "utf8"));

  expect(status.ok).toBe(true);
  expect(status.marker).toBe("action_307l_runtime_boundary_status_static");
  expect(status.static_assets_work).toBe(true);
  expect(status.proxy_runs).toBe(true);
  expect(status.next_runtime_routes_failing_after_proxy).toBe(true);
  expect(status.provider_call_executed).toBe(false);
  expect(status.replay_executed).toBe(false);
  expect(status.synthetic_outcomes_persisted).toBe(false);
  expect(status.supabase_write_executed).toBe(false);
  expect(status.scanner_behavior_changed).toBe(false);
  expect(status.live_ranking_changed).toBe(false);
});

test("runbook documents production checks, interpretation, rollback, and safety", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/action-307l-runtime-boundary-status.json");
  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/ping307h");
  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/api/ping307h");
  expect(runbook).toContain("Netlify Next runtime adapter/output issue");
  expect(runbook).toContain("rollback production to the last deploy");
  expect(runbook).toContain("no Twelve Data call");
  expect(runbook).toContain("no replay execution");
  expect(runbook).not.toContain("apikey");
});
