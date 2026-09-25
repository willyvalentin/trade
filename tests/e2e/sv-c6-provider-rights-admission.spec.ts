import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const MIGRATION = resolve(
  process.cwd(),
  "supabase/migrations/20260925030000_sv_c6_provider_rights_admission.sql",
);
const EVIDENCE = resolve(
  process.cwd(),
  "docs/evidence/sv-c6-twelve-data-basic-free-provider-rights.json",
);
const C1 = resolve(
  process.cwd(),
  "supabase/migrations/20260922001000_sv_c1_internal_paper_entry_lifecycle.sql",
);
const C2 = resolve(
  process.cwd(),
  "supabase/migrations/20260922023000_sv_c2_internal_paper_exit_reconciliation.sql",
);

test.describe("SV-C6 provider-rights admission", () => {
  test("records current Basic Free evidence as blocked with exact artifact identity", () => {
    const source = readFileSync(MIGRATION, "utf8").toLowerCase();
    const evidenceBytes = readFileSync(EVIDENCE);
    const evidence = JSON.parse(evidenceBytes.toString("utf8"));
    const digest = createHash("sha256").update(evidenceBytes).digest("hex");

    expect(evidence.record_version).toBe(
      "twelve_data_basic_free_internal_paper_rights_evidence_v1",
    );
    expect(evidence.provider_plan).toBe("twelve_data_basic_free");
    expect(evidence.admission_status).toBe("blocked");
    expect(evidence.verified_rights.internal_non_display).toBe(true);
    expect(evidence.verified_rights.raw_provider_payload_retention_bytes).toBe(0);
    expect(evidence.verified_rights.non_reversible_derived_data_allowed).toBe(true);
    expect(evidence.decision.max_exact_price_evidence_retention_days).toBeNull();
    expect(evidence.decision.policy_freeze_allowed).toBe(false);
    expect(evidence.unverified_requirements).toContain(
      "permitted_retention_duration_for_exact_provider_prices_and_candles",
    );
    expect(source).toContain(digest);
    expect(source).toContain("'blocked'");
    expect(source).toContain("max_exact_price_evidence_retention_days");
    expect(source).toContain(
      "exact_price_evidence_retention_duration_unverified",
    );
    expect(source).toContain("source_terms_effective_date");
  });

  test("prevents free-form references from freezing a pilot policy", () => {
    const source = readFileSync(MIGRATION, "utf8").toLowerCase();
    const rightsLookup = source.indexOf(
      "from public.internal_paper_provider_rights_evidence rights",
    );
    const policyInsert = source.indexOf(
      "insert into public.internal_paper_pilot_policies",
    );

    expect(rightsLookup).toBeGreaterThan(0);
    expect(rightsLookup).toBeLessThan(policyInsert);
    expect(source).toContain("internal_paper_provider_rights_not_admitted");
    expect(source).toContain("internal_paper_provider_rights_retention_exceeded");
    expect(source).toContain("rights.admission_status <> 'admitted'");
    expect(source).toContain(
      "v_rights.max_exact_price_evidence_retention_days",
    );
    expect(source).toContain("provider_rights_evidence_id text not null");
    expect(source).toContain(
      "internal_paper_pilot_policies_provider_rights_fk",
    );
    expect(source).toContain(
      "internal_paper_pilot_policies_provider_rights_idx",
    );
  });

  test("keeps evidence private, readable only through a versioned service RPC", () => {
    const source = readFileSync(MIGRATION, "utf8").toLowerCase();

    expect(source).toContain(
      "alter table public.internal_paper_provider_rights_evidence\n  enable row level security",
    );
    expect(source).toContain(
      "from public, anon, authenticated, service_role",
    );
    expect(source).toContain(
      "app_read_internal_paper_provider_rights_evidence_v1",
    );
    expect(source).toContain("security definer");
    expect(source).toContain("set search_path = pg_catalog, public");
    expect(source).toContain("to service_role");
    expect(source).not.toContain("to anon");
    expect(source).not.toContain("to authenticated");
  });

  test("blocks because the durable lifecycle retains reconstructable exact prices", () => {
    const c1 = readFileSync(C1, "utf8").toLowerCase();
    const c2 = readFileSync(C2, "utf8").toLowerCase();

    expect(c1).toContain("arrival_price numeric(20, 6)");
    expect(c1).toContain("fill_price numeric(20, 6)");
    expect(c1).toContain("stop_price numeric(20, 6)");
    expect(c1).toContain("target_price numeric(20, 6)");
    expect(c2).toContain("candle_evidence jsonb not null");
    expect(c2).toContain("reference_price numeric(20, 6)");
    expect(c2).toContain("fill_price numeric(20, 6)");
  });

  test("is inert outside its reviewed database evidence boundary", () => {
    const source = readFileSync(MIGRATION, "utf8").toLowerCase();
    const executableSource = source.replace(/^--.*$/gm, "");

    expect(source).toContain("set lock_timeout = '5s'");
    expect(source).toContain("set statement_timeout = '60s'");
    expect(source).toContain("sv_c6_requires_empty_pilot_policy_state");
    expect(source).toContain("sv_c6_unexpected_c5_freeze_boundary");
    expect(executableSource).not.toContain("cron.schedule");
    expect(executableSource).not.toContain("net.http");
    expect(executableSource).not.toContain("twelve_data_api_key");
    expect(executableSource).not.toContain("broker");
    expect(executableSource).not.toContain("internal_paper_worker_jobs(");
    expect(executableSource).not.toContain("internal_paper_accounts(");
  });
});
