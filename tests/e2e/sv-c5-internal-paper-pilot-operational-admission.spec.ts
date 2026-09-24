import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MIGRATION = resolve(
  process.cwd(),
  "supabase/migrations/20260922090000_sv_c5_internal_paper_pilot_operational_admission.sql",
);

test.describe("SV-C5 internal-paper pilot operational admission", () => {
  test("freezes explicit numeric limits without activating an account or schedule", () => {
    const source = readFileSync(MIGRATION, "utf8").toLowerCase();
    const executableSource = source.replace(/^--.*$/gm, "");
    const preFunctionDdl = executableSource.slice(
      0,
      executableSource.indexOf(
        "create function public.app_freeze_internal_paper_pilot_policy_v1",
      ),
    );
    expect(source).toContain("set lock_timeout = '5s'");
    expect(source).toContain("set statement_timeout = '60s'");
    expect(source).toContain("sv_c5_requires_empty_c1_c2_c3_state");
    expect(source).toContain("sv_c5_unexpected_read_boundary_contract");
    expect(source).toContain("sv_c5_requires_unconsumed_ledger_sequence");
    expect(source).toContain("sv_c5_preexisting_operational_admission_contract");
    expect(source).toContain("internal_paper_worker_heartbeats_account_owner_idx");
    expect(source).not.toMatch(/create\s+or\s+replace\s+function/i);
    expect(preFunctionDdl).not.toMatch(
      /\b(insert\s+into|update\s+public\.|delete\s+from)\b/i,
    );
    expect(source).toContain("max_daily_provider_credits smallint not null default 800");
    expect(source).toContain("max_per_minute_provider_credits smallint not null default 8");
    expect(source).toContain("retry_reserve_credits smallint not null default 8");
    expect(source).toContain("max_source_age_seconds integer not null default 600");
    expect(source).toContain("max_decision_to_intent_seconds integer not null default 120");
    expect(source).toContain("worker_heartbeat_interval_seconds integer not null default 900");
    expect(source).toContain("worker_detection_timeout_seconds integer not null default 1200");
    expect(source).toContain("acknowledged_effect_recovery_point_seconds integer not null default 0");
    expect(source).toContain("retention_rights_evidence_reference");
    expect(source).toContain("internal_paper_policy_requires_paused_account");
    expect(executableSource).not.toContain("cron.schedule");
    expect(executableSource).not.toContain("net.http");
    expect(executableSource).not.toContain("twelve_data_api_key");
    expect(executableSource).not.toContain("broker");
  });

  test("keeps policy and heartbeat storage private and exposes only versioned service RPCs", () => {
    const source = readFileSync(MIGRATION, "utf8").toLowerCase();
    expect(source).toContain("alter table public.internal_paper_pilot_policies enable row level security");
    expect(source).toContain("alter table public.internal_paper_worker_heartbeats enable row level security");
    expect(source).toContain("from public, anon, authenticated, service_role");
    expect(source).toContain("app_freeze_internal_paper_pilot_policy_v1");
    expect(source).toContain("app_record_internal_paper_worker_heartbeat_v1");
    expect(source).toContain("app_claim_internal_paper_worker_job_v2");
    expect(source).toContain("app_read_internal_paper_handoff_context_v2");
    expect(source).toContain("app_read_internal_paper_observer_v2");
    expect(source).toContain("where job.account_id = p_account_id");
    expect(source).not.toContain("update public.internal_paper_pilot_policies");
    expect(source).not.toContain("delete from public.internal_paper_pilot_policies");
  });

  test("requires an account identity and records heartbeat before claiming work", () => {
    const host = readFileSync(resolve(
      process.cwd(),
      "netlify/functions/scheduled-internal-paper-worker.ts",
    ), "utf8");
    const persistence = readFileSync(resolve(
      process.cwd(),
      "lib/server/internal-paper-worker-persistence.ts",
    ), "utf8");
    expect(host).toContain('"TURE_INTERNAL_PAPER_ACCOUNT_ID"');
    expect(host.indexOf("internalPaperWorkerAccountId(Netlify.env)")).toBeLessThan(
      host.indexOf("runtimeRequire("),
    );
    expect(persistence.indexOf("recordInternalPaperWorkerHeartbeat({")).toBeLessThan(
      persistence.indexOf("runInternalPaperWorkerCycle({"),
    );
    expect(persistence).toContain('"app_claim_internal_paper_worker_job_v2"');
    expect(persistence).not.toContain("twelve_data");
    expect(persistence).not.toContain("broker");
  });
});
