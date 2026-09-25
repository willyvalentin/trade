import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MIGRATION = resolve(
  process.cwd(),
  "supabase/migrations/20260925031531_sv_c7_internal_paper_pilot_provisioning.sql",
);
const PERSISTENCE = resolve(
  process.cwd(),
  "lib/server/internal-paper-pilot-provisioning.ts",
);

test.describe("SV-C7 internal-paper pilot provisioning", () => {
  test("is inert after migration and creates only a paused account through service role", () => {
    const source = readFileSync(MIGRATION, "utf8").toLowerCase();
    const executableSource = source.replace(/^--.*$/gm, "");

    expect(source).toContain("set lock_timeout = '5s'");
    expect(source).toContain("set statement_timeout = '60s'");
    expect(source).toContain("sv_c7_requires_empty_internal_paper_state");
    expect(source).toContain("sv_c7_unexpected_provider_rights_boundary");
    expect(source).toContain("internal_paper_pilot_provisioning_v1");
    expect(source).toContain("'paused', 'usd'");
    expect(source).toContain("on conflict (owner_user_id, account_key) do nothing");
    expect(source).toContain("internal_paper_pilot_provisioning_conflict");
    expect(source).toContain("to service_role");
    expect(source).toContain("from public, anon, authenticated");
    expect(executableSource).not.toContain("cron.schedule");
    expect(executableSource).not.toContain("net.http");
    expect(executableSource).not.toContain("twelve_data_api_key");
    expect(executableSource).not.toContain("broker");
    expect(executableSource).not.toContain("update public.internal_paper_accounts set status = 'ready'");
  });

  test("requires exact admitted C6 rights before account insertion", () => {
    const source = readFileSync(MIGRATION, "utf8").toLowerCase();
    const rightsLookup = source.indexOf(
      "from public.internal_paper_provider_rights_evidence rights",
    );
    const accountInsert = source.indexOf(
      "insert into public.internal_paper_accounts",
    );

    expect(rightsLookup).toBeGreaterThan(0);
    expect(rightsLookup).toBeLessThan(accountInsert);
    expect(source).toContain("rights.evidence_id = p_provider_rights_evidence_id");
    expect(source).toContain("v_rights.admission_status <> 'admitted'");
    expect(source).toContain("internal_paper_provider_rights_not_admitted");
    expect(source).toContain("internal_paper_provider_rights_retention_exceeded");
    expect(
      source.indexOf("app_freeze_internal_paper_pilot_policy_v1(", accountInsert),
    ).toBeGreaterThan(accountInsert);
  });

  test("canonicalizes symbols and permits only exact no-effect retries", () => {
    const source = readFileSync(MIGRATION, "utf8").toLowerCase();

    expect(source).toContain("array_agg(canonical.symbol order by canonical.symbol)");
    expect(source).toContain("count(distinct canonical.symbol)");
    expect(source).toContain("^[a-z][a-z0-9.]{0,15}$");
    expect(source).toContain("v_account.state_version <> 0");
    expect(source).toContain("from public.internal_paper_entry_intents");
    expect(source).toContain("from public.internal_paper_exit_intents");
    expect(source).toContain("from public.internal_paper_worker_jobs");
    expect(source).toContain("from public.internal_paper_worker_heartbeats");
  });

  test("uses a strict server-only RPC adapter without activation side effects", () => {
    const source = readFileSync(PERSISTENCE, "utf8");

    expect(source).toContain('import "server-only"');
    expect(source).toContain('"app_provision_internal_paper_pilot_v1"');
    expect(source).toContain("parseInternalPaperPilotProvisioningReceipt");
    expect(source).toContain('account_status: "paused"');
    expect(source).toContain("p_provider_rights_evidence_id");
    expect(source).toContain("receipt.account_id === input.account_id");
    expect(source).toContain("sameInstant(input.frozen_at, receipt.frozen_at)");
    expect(source).not.toContain("scheduled-scan");
    expect(source).not.toContain("twelve_data");
    expect(source).not.toContain("broker");
  });
});
