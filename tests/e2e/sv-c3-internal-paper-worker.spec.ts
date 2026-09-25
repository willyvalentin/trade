import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import {
  buildInternalPaperWorkerJob,
  INTERNAL_PAPER_WORKER_JOB_VERSION,
} from "@/lib/internal-paper-worker";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ACCOUNT_ID = "22222222-2222-4222-8222-222222222222";

function entryCommand(): InternalPaperEntryCommand {
  return {
    command_version: "internal_paper_entry_command_v1",
    fill_model_version: "internal_paper_immediate_costed_fill_v1",
    owner_user_id: OWNER_ID,
    account_id: ACCOUNT_ID,
    scan_run_id: "scan-1",
    scan_run_fingerprint: "scan-fingerprint-1",
    snapshot_id: "snapshot-1",
    snapshot_fingerprint: "snapshot-fingerprint-1",
    candidate_identity: "scanner_candidate:v1:scan-1:AAPL",
    strategy_id: "strategy-1",
    strategy_version: "1.0.0",
    strategy_rollback_identity: "strategy-1@1.0.0",
    symbol_selection_policy_id: "pilot-symbols",
    symbol_selection_policy_version: "1.0.0",
    observed_universe_version: "pilot-universe-v1",
    ticker: "AAPL",
    quantity: 10,
    arrival_price: 100,
    stop_price: 95,
    target_price: 112,
    submitted_at: "2026-09-22T14:31:00.000Z",
  };
}

test.describe("SV-C3 internal-paper worker admission", () => {
  test("keeps the production migration empty-state, exact-contract and inert", () => {
    const migration = readFileSync(
      resolve(
        process.cwd(),
        "supabase/migrations/20260922045917_sv_c3_durable_internal_paper_worker.sql",
      ),
      "utf8",
    );
    const preFunctionDdl = migration.slice(
      0,
      migration.indexOf(
        "create function public.app_enqueue_internal_paper_worker_job_v1",
      ),
    );

    expect(migration).toContain("set lock_timeout = '5s'");
    expect(migration).toContain("set statement_timeout = '60s'");
    expect(migration).toContain("sv_c3_requires_empty_c1_c2_state");
    expect(migration).toContain("sv_c3_unexpected_c1_c2_function_contract");
    expect(migration).toContain("sv_c3_requires_unconsumed_ledger_sequence");
    expect(migration).toContain("sv_c3_preexisting_worker_contract");
    expect(migration).toContain("internal_paper_worker_jobs_owner_idx");
    expect(migration).toContain("internal_paper_worker_jobs_account_owner_idx");
    expect(
      migration.match(/^create function public\.app_.*worker.*_v1\(/gm),
    ).toHaveLength(5);
    expect(migration).not.toMatch(/create\s+or\s+replace\s+function/i);
    expect(preFunctionDdl).not.toMatch(
      /\b(insert\s+into|update\s+public\.|delete\s+from)\b/i,
    );
    expect(migration).not.toMatch(/\bcron\.schedule\b/i);
    expect(migration).not.toMatch(/\b(net\.http_post|extensions\.http_post)\b/i);
  });

  test("wraps an admitted entry without expanding its authority", () => {
    expect(
      buildInternalPaperWorkerJob({
        work_kind: "entry",
        owner_user_id: OWNER_ID,
        account_id: ACCOUNT_ID,
        payload: entryCommand(),
      }),
    ).toEqual({
      status: "ready",
      job: {
        contract_version: INTERNAL_PAPER_WORKER_JOB_VERSION,
        work_kind: "entry",
        owner_user_id: OWNER_ID,
        account_id: ACCOUNT_ID,
        payload: entryCommand(),
      },
    });
  });

  test("preserves a no-trade decision as a durable zero-effect job", () => {
    expect(
      buildInternalPaperWorkerJob({
        work_kind: "no_trade",
        owner_user_id: OWNER_ID,
        account_id: ACCOUNT_ID,
        payload: {
          record_version: "candidate_decision_record_v3",
          disposition: "no_trade",
          scan_run_id: "scan-no-trade",
          scan_run_fingerprint: "scan-no-trade-fingerprint",
          no_trade_reason: "below_publish_threshold",
        },
      }),
    ).toMatchObject({
      status: "ready",
      job: {
        work_kind: "no_trade",
        payload: {
          owner_user_id: OWNER_ID,
          account_id: ACCOUNT_ID,
          disposition: "no_trade",
        },
      },
    });
  });

  test("fails closed for cross-account commands and malformed no-trade evidence", () => {
    expect(
      buildInternalPaperWorkerJob({
        work_kind: "entry",
        owner_user_id: OWNER_ID,
        account_id: ACCOUNT_ID,
        payload: { ...entryCommand(), account_id: "33333333-3333-4333-8333-333333333333" },
      }),
    ).toEqual({
      status: "blocked",
      reason_codes: ["worker_payload_identity_mismatch"],
      job: null,
    });

    expect(
      buildInternalPaperWorkerJob({
        work_kind: "no_trade",
        owner_user_id: OWNER_ID,
        account_id: ACCOUNT_ID,
        payload: {
          record_version: "candidate_decision_record_v3",
          disposition: "no_trade",
          scan_run_id: "",
          scan_run_fingerprint: "",
          no_trade_reason: "",
        },
      }),
    ).toEqual({
      status: "blocked",
      reason_codes: ["no_trade_evidence_invalid"],
      job: null,
    });
  });
});
