import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import { buildAction307nProductionApiBoundaryRecoveryVerification } from "../../lib/action-307n-production-api-boundary-recovery-verification";

const docPath = join(
  process.cwd(),
  "docs/action-307n-production-api-boundary-recovery-verification.md",
);
const marketDiagnosticsPath = join(
  process.cwd(),
  "lib/market-diagnostics-console.ts",
);

test("production API boundary recovery helper reports recovered status", () => {
  const recovery = buildAction307nProductionApiBoundaryRecoveryVerification();

  expect(recovery.recovery_status).toBe(
    "production_api_boundary_recovered_after_rollback",
  );
  expect(recovery.rollback_verified).toBe(true);
  expect(recovery.known_good_routes_healthy).toBe(true);
  expect(recovery.next_runtime_routes_healthy_again).toBe(true);
  expect(recovery.action_303_ping_healthy).toBe(true);
  expect(recovery.action_300_ping_healthy).toBe(true);
  expect(recovery.action_296_ping_healthy).toBe(true);
});

test("production API boundary recovery helper keeps replay and write paths disabled", () => {
  const recovery = buildAction307nProductionApiBoundaryRecoveryVerification();

  expect(recovery.replay_with_signal_package_route_deployed).toBe(false);
  expect(recovery.replay_execute_allowed_now).toBe(false);
  expect(recovery.provider_call_executed).toBe(false);
  expect(recovery.replay_executed).toBe(false);
  expect(recovery.synthetic_outcomes_persisted).toBe(false);
  expect(recovery.supabase_write_executed).toBe(false);
  expect(recovery.scanner_behavior_changed).toBe(false);
  expect(recovery.live_ranking_changed).toBe(false);
  expect(recovery.recommended_next_step).toBe(
    "reintroduce_action_307_in_smaller_isolated_branch",
  );
});

test("production API boundary recovery doc records healthy markers and warning", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Rollback succeeded");
  expect(doc).toContain("production API boundary is healthy again");
  expect(doc).toContain(
    "action_303_first_tiny_replay_signal_package_discovery_readback",
  );
  expect(doc).toContain("action_300_first_tiny_replay_dry_run_execute_attempt");
  expect(doc).toContain(
    "action_296_first_tiny_candle_persistence_readback_verification",
  );
  expect(doc).toContain(
    "Do not redeploy current Action 307+ diagnostic/proxy/runtime changes as-is",
  );
});

test("production API boundary recovery doc includes safety locks and no-effect state", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false");
  expect(doc).toContain("TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false");
  expect(doc).toContain("TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false");
  expect(doc).toContain("provider call executed: no");
  expect(doc).toContain("replay executed: no");
  expect(doc).toContain("synthetic outcomes persisted: no");
  expect(doc).toContain("Supabase write executed: no");
  expect(doc).toContain("scanner behavior changed: no");
  expect(doc).toContain("live ranking changed: no");
});

test("market diagnostics source includes production API boundary recovery section", () => {
  const source = readFileSync(marketDiagnosticsPath, "utf8");

  expect(source).toContain('section_id: "production_api_boundary_recovery"');
  expect(source).toContain('title: "Production API Boundary Recovery"');
  expect(source).toContain("Replay with signal package route deployed");
  expect(source).toContain("Replay allowed now");
  expect(source).toContain("recommended_next_step");
});
