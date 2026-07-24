import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260724001000_fix_continuous_intelligence_manual_canary_function_lint.sql",
);

const migration = readFileSync(migrationPath, "utf8");

test.describe("Action 644 production database function lint hardening", () => {
  test("resolves pgcrypto digest through the bounded extensions search path", () => {
    expect(migration).toContain(
      "create or replace function public.admit_continuous_intelligence_shadow_canary_manual_execution(",
    );
    expect(migration).toContain("set search_path = public, extensions");
    expect(migration).toContain(
      "encode(digest(p_authorization_token, 'sha256'), 'hex')",
    );
  });

  test("qualifies manual authorization columns that collide with output variables", () => {
    expect(migration).toContain(
      "continuous_intelligence_shadow_canary_manual_authorizations.authorization_id = authorization_row.authorization_id",
    );
    expect(migration).toContain(
      "continuous_intelligence_shadow_canary_manual_authorizations.status = 'issued'",
    );
    expect(migration).toContain(
      "continuous_intelligence_shadow_canary_manual_authorizations.expires_at",
    );
    expect(migration).toContain(
      "continuous_intelligence_shadow_canary_manual_authorizations.issued_at",
    );

    expect(migration).not.toMatch(/\bwhere authorization_id\s*=/);
    expect(migration).not.toMatch(/\band status\s*=/);
  });

  test("preserves the stable RPC names and service-role-only execution grants", () => {
    expect(migration).toContain(
      "create or replace function public.ci_mca_issue(",
    );
    expect(migration).toContain(
      "create or replace function public.ci_mca_consume(",
    );

    expect(migration).toContain(
      "grant execute on function public.admit_continuous_intelligence_shadow_canary_manual_execution",
    );
    expect(migration).toContain(
      "grant execute on function public.ci_mca_issue",
    );
    expect(migration).toContain(
      "grant execute on function public.ci_mca_consume",
    );

    expect(migration).not.toContain(
      "security definer",
    );
  });
});
