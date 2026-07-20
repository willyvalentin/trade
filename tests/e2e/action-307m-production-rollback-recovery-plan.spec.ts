import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const runbookPath = join(
  process.cwd(),
  "docs/action-307m-production-rollback-recovery-plan.md",
);
const statusPath = join(
  process.cwd(),
  "public/action-307m-production-recovery-status.json",
);
const summaryScriptPath = join(
  process.cwd(),
  "scripts/action-307m-production-recovery-summary.mjs",
);

function runSummary() {
  const output = execFileSync("node", [summaryScriptPath], {
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
    summary: JSON.parse(output),
  };
}

test("rollback runbook exists and documents safety locks", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain("Action 307M: Production Rollback Recovery Plan");
  expect(runbook).toContain("Static public assets work");
  expect(runbook).toContain("Proxy runs in production");
  expect(runbook).toContain("Next runtime routes fail after proxy pass-through");
  expect(runbook).toContain("TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false");
  expect(runbook).toContain("TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false");
  expect(runbook).toContain("TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false");
  expect(runbook).toContain("TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED=false");
  expect(runbook).toContain("TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED=false");
  expect(runbook).toContain("TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED=false");
  expect(runbook).toContain("TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED=false");
});

test("rollback runbook includes known-good verification routes and auth check", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain(
    "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
  );
  expect(runbook).toContain(
    "/api/historical-backfill/first-tiny-replay-dry-run/ping",
  );
  expect(runbook).toContain(
    "/api/historical-backfill/first-tiny-candle-persistence-readback/ping",
  );
  expect(runbook).toContain("--data '{\"auth_check_only\":true}'");
  expect(runbook).toContain("auth_check.header_matches");
  expect(runbook).toContain("Do not run replay execute");
});

test("static recovery status JSON exists, parses, and recommends rollback", () => {
  const status = JSON.parse(readFileSync(statusPath, "utf8"));

  expect(status.ok).toBe(true);
  expect(status.marker).toBe("action_307m_production_recovery_status");
  expect(status.recommended_action).toBe(
    "rollback_to_last_known_good_next_runtime_deploy",
  );
  expect(status.static_assets_work).toBe(true);
  expect(status.proxy_runs).toBe(true);
  expect(status.next_runtime_routes_failing_after_proxy).toBe(true);
  expect(status.replay_execute_allowed).toBe(false);
  expect(status.provider_call_executed).toBe(false);
  expect(status.replay_executed).toBe(false);
  expect(status.synthetic_outcomes_persisted).toBe(false);
  expect(status.supabase_write_executed).toBe(false);
  expect(status.scanner_behavior_changed).toBe(false);
  expect(status.live_ranking_changed).toBe(false);
});

test("recovery summary script runs locally without network or secrets", () => {
  const { output, summary } = runSummary();

  expect(summary.status).toBe("production_recovery_plan_ready");
  expect(summary.marker).toBe("action_307m_production_recovery_summary");
  expect(summary.recommended_action).toBe("rollback_to_last_known_good_deploy");
  expect(summary.static_assets_confirmed).toBe(true);
  expect(summary.proxy_confirmed_live).toBe(true);
  expect(summary.next_runtime_failing_after_proxy).toBe(true);
  expect(summary.replay_approvals_should_be_false).toBe(true);
  expect(summary.approval_locks_documented).toBe(true);
  expect(summary.safety.local_filesystem_only).toBe(true);
  expect(summary.safety.production_called).toBe(false);
  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("trade-password-that-must-not-appear");
});

test("recovery summary keeps all no-effect flags false", () => {
  const { summary } = runSummary();

  expect(summary.no_effect_flags.provider_call_executed).toBe(false);
  expect(summary.no_effect_flags.replay_executed).toBe(false);
  expect(summary.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(summary.no_effect_flags.supabase_write_executed).toBe(false);
  expect(summary.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(summary.no_effect_flags.live_ranking_changed).toBe(false);
  expect(summary.rollback_verification_routes).toEqual(
    expect.arrayContaining([
      "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
      "/api/historical-backfill/first-tiny-replay-dry-run/ping",
      "/api/historical-backfill/first-tiny-candle-persistence-readback/ping",
    ]),
  );
});
