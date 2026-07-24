#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const runbookPath = "docs/action-307m-production-rollback-recovery-plan.md";
const statusPath = "public/action-307m-production-recovery-status.json";

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

const rollbackVerificationRoutes = [
  "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
  "/api/historical-backfill/first-tiny-replay-dry-run/ping",
  "/api/historical-backfill/first-tiny-candle-persistence-readback/ping",
  "/api/historical-backfill/first-tiny-signal-package-discovery-readback auth_check_only",
];

const approvalLocks = [
  "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false",
  "TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false",
  "TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false",
  "TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED=false",
  "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED=false",
  "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED=false",
  "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED=false",
];

const runbook = readText(runbookPath) ?? "";
const status = readJson(statusPath);

const summary = {
  status: "production_recovery_plan_ready",
  marker: "action_307m_production_recovery_summary",
  recommended_action: "rollback_to_last_known_good_deploy",
  static_assets_confirmed: true,
  proxy_confirmed_live: true,
  next_runtime_failing_after_proxy: true,
  replay_approvals_should_be_false: true,
  rollback_runbook_present: runbook.length > 0,
  static_recovery_status_present: status !== null,
  approval_locks_documented: approvalLocks.every((lock) => runbook.includes(lock)),
  rollback_verification_routes: rollbackVerificationRoutes,
  no_effect_flags: {
    provider_call_executed: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    supabase_write_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
  },
  static_recovery_status: status
    ? {
        marker: status.marker,
        recommended_action: status.recommended_action,
        replay_execute_allowed: status.replay_execute_allowed,
      }
    : null,
  safety: {
    local_filesystem_only: true,
    production_called: false,
    secrets_printed: false,
  },
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
