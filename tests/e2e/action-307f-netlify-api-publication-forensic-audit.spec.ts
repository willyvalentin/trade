import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const scriptPath = join(
  process.cwd(),
  "scripts/action-307f-netlify-api-publication-forensic-audit.mjs",
);
const pagePath = join(process.cwd(), "app/route-publication-probe/page.tsx");
const homePagePath = join(process.cwd(), "app/page.tsx");
const runbookPath = join(
  process.cwd(),
  "docs/action-307f-netlify-api-publication-forensic-audit.md",
);

const expectedRoutes = [
  "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
  "/api/historical-backfill/first-tiny-signal-package-discovery-readback",
  "/api/historical-backfill/first-tiny-replay-dry-run/ping",
  "/api/historical-backfill/first-tiny-replay-dry-run",
  "/api/historical-backfill/first-tiny-candle-persistence-readback/ping",
  "/api/historical-backfill/first-tiny-candle-persistence-readback",
  "/api/hb307c/ping",
  "/api/hb307c",
  "/api/route-publication-diagnostic",
  "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping",
  "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run",
  "/api/historical-backfill/first-tiny-signal-replay-dry-run/ping",
  "/api/historical-backfill/first-tiny-signal-replay-dry-run",
];

function runAudit() {
  const secret = "secret-value-that-must-not-appear";
  const output = execFileSync("node", [scriptPath], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      AUTOMATION_SECRET: secret,
      TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
    },
    encoding: "utf8",
  });

  return {
    output,
    audit: JSON.parse(output),
  };
}

test("forensic audit script exists and runs without network side effects", () => {
  const { audit } = runAudit();

  expect(audit.audit_status).toBe("completed");
  expect(audit.audit_marker).toBe(
    "action_307f_netlify_api_publication_forensic_audit",
  );
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
});

test("audit output includes expected source routes and method exports", () => {
  const { audit } = runAudit();
  const sourceRoutes = new Map(
    audit.api_routes_found_in_source.map((item: { route: string }) => [
      item.route,
      item,
    ]),
  );

  for (const route of expectedRoutes) {
    const item = sourceRoutes.get(route) as
      | {
          source_exists: boolean;
          expected_exports_present: boolean;
          server_only_imports_safely_scoped_to_route_handler: boolean;
        }
      | undefined;

    expect(item, route).toBeTruthy();
    expect(item?.source_exists, route).toBe(true);
    expect(item?.expected_exports_present, route).toBe(true);
    expect(
      item?.server_only_imports_safely_scoped_to_route_handler,
      route,
    ).toBe(true);
  }
});

test("audit output includes expected Next manifest route entries", () => {
  const { audit } = runAudit();
  const manifestRoutes = new Map(
    audit.api_routes_found_in_next_manifest.map((item: { route: string }) => [
      item.route,
      item,
    ]),
  );

  for (const route of expectedRoutes) {
    const item = manifestRoutes.get(route) as
      | {
          found_in_next_manifest: boolean;
          server_app_artifact_exists: boolean;
        }
      | undefined;

    expect(item, route).toBeTruthy();
    expect(item?.found_in_next_manifest, route).toBe(true);
    expect(item?.server_app_artifact_exists, route).toBe(true);
  }
});

test("audit output does not print env secret values", () => {
  const { output, audit } = runAudit();

  expect(output).not.toContain("secret-value-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(audit.safety.secrets_printed).toBe(false);
});

test("page probe and home deploy marker are present and inert", () => {
  const page = readFileSync(pagePath, "utf8");
  const homePage = readFileSync(homePagePath, "utf8");

  expect(page).toContain("action_307f_route_publication_probe");
  expect(page).toContain("purpose: verify non-api route publication");
  expect(page).toContain("no provider call");
  expect(page).toContain("no replay");
  expect(page).toContain("no write");
  expect(page).toContain("no synthetic outcomes");
  expect(page).toContain("no scanner/ranking effects");
  expect(homePage).toContain("action_307f_deploy_marker");
});

test("runbook documents local audit and production interpretation matrix", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain(
    "node scripts/action-307f-netlify-api-publication-forensic-audit.mjs",
  );
  expect(runbook).toContain(
    "curl -i -s https://trade.valentinlabs.com/route-publication-probe",
  );
  expect(runbook).toContain("action_307f_route_publication_probe");
  expect(runbook).toContain("Page probe shows");
  expect(runbook).toContain("Local audit shows API routes missing");
  expect(runbook).toContain("Netlify adapter/output issue");
  expect(runbook).toContain("Keep all replay approvals false");
  expect(runbook).not.toContain("apikey");
});
