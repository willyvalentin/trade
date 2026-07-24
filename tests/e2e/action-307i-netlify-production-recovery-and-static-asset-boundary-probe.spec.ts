import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const txtPath = join(process.cwd(), "public/ping307i.txt");
const jsonPath = join(process.cwd(), "public/ping307i.json");
const runbookPath = join(
  process.cwd(),
  "docs/action-307i-netlify-production-recovery-and-static-asset-boundary-probe.md",
);
const auditScriptPath = join(
  process.cwd(),
  "scripts/action-307i-netlify-static-boundary-audit.mjs",
);

function runAudit() {
  const output = execFileSync("node", [auditScriptPath], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
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

test("static text probe exists and contains action 307i marker", () => {
  const text = readFileSync(txtPath, "utf8");

  expect(text).toContain("action_307i_static_public_asset_probe");
  expect(text).toContain("production static asset reachable");
  expect(text).toContain("no provider call");
  expect(text).toContain("no replay");
  expect(text).toContain("no write");
  expect(text).toContain("no synthetic outcomes");
  expect(text).toContain("no scanner/ranking effects");
});

test("static json probe parses and has all no-effect flags false", () => {
  const json = JSON.parse(readFileSync(jsonPath, "utf8"));

  expect(json.ok).toBe(true);
  expect(json.marker).toBe("action_307i_static_public_asset_probe");
  expect(json.purpose).toBe("netlify_static_asset_boundary_probe");
  expect(json.provider_call_executed).toBe(false);
  expect(json.replay_executed).toBe(false);
  expect(json.synthetic_outcomes_persisted).toBe(false);
  expect(json.supabase_write_executed).toBe(false);
  expect(json.scanner_behavior_changed).toBe(false);
  expect(json.live_ranking_changed).toBe(false);
});

test("static boundary audit runs locally without network or secrets", () => {
  const { output, audit } = runAudit();

  expect(audit.audit_status).toBe("completed");
  expect(audit.audit_marker).toBe("action_307i_netlify_static_boundary_audit");
  expect(audit.safety.local_filesystem_only).toBe(true);
  expect(audit.safety.production_called).toBe(false);
  expect(audit.safety.provider_call_executed).toBe(false);
  expect(audit.safety.raw_response_persisted).toBe(false);
  expect(audit.safety.fetch_run_persisted).toBe(false);
  expect(audit.safety.synthetic_outcomes_persisted).toBe(false);
  expect(audit.safety.replay_executed).toBe(false);
  expect(audit.safety.scanner_behavior_changed).toBe(false);
  expect(audit.safety.live_ranking_changed).toBe(false);
  expect(audit.safety.supabase_write_executed).toBe(false);
  expect(audit.public_asset_probe_files_present["public/ping307i.txt"]).toBe(
    true,
  );
  expect(audit.public_asset_probe_files_present["public/ping307i.json"]).toBe(
    true,
  );
  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
});

test("runbook documents rollback-first recovery and curl probes", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain("TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false");
  expect(runbook).toContain("TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false");
  expect(runbook).toContain("TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false");
  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/ping307i.txt");
  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/ping307i.json");
  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/ping307h");
  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/api/ping307h");
  expect(runbook).toContain("Use Netlify rollback");
  expect(runbook).toContain("last known good deploy");
  expect(runbook).toContain("Do not run replay execute");
  expect(runbook).not.toContain("apikey");
});
