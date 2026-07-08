import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { basename, resolve } from "node:path";

const postTradeMigrationFile = "20260708000000_post_trade_persistence_schema_draft.sql";
const grantHardeningMigrationFile = "20260708001000_harden_post_trade_execution_grants_draft.sql";
const migrationsDir = resolve(process.cwd(), "supabase/migrations");
const migrationPath = resolve(process.cwd(), "supabase/migrations", grantHardeningMigrationFile);
const specPath = resolve(
  process.cwd(),
  "tests/e2e/post-trade-supabase-grant-hardening-migration-draft-static.spec.ts",
);

const migrationSql = readFileSync(migrationPath, "utf8").replace(/\r\n/g, "\n");
const executableSql = stripSqlComments(migrationSql).toLowerCase();
const executableStatementSql = stripSqlStrings(executableSql);
const migrationFiles = readdirSync(migrationsDir)
  .filter((fileName) => fileName.endsWith(".sql"))
  .sort();

const hardenedTables = [
  "execution_confirmation_evidence",
  "execution_settlement_reviews",
  "execution_cost_breakdowns",
  "execution_deviation_reviews",
  "execution_learning_candidates",
  "execution_redacted_artifacts",
  "execution_record_audit_events",
] as const;

const unrelatedTables = [
  "recommendations",
  "positions",
  "position_updates",
  "user_settings",
  "scanner_cache",
  "scheduled_scan_runs",
  "market_calendar_cache",
  "market_regime_snapshots",
  "execution_lifecycle_events",
  "execution_agent_runs",
  "execution_agent_progress_events",
  "execution_records",
  "recommendation_snapshots",
  "recommendation_outcomes",
  "recommendation_scan_runs",
  "recommendation_batches",
  "scheduled_scan_attempts",
  "symbol_metadata",
] as const;

function stripSqlComments(sql: string) {
  return sql.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/--.*$/gmu, "");
}

function stripSqlStrings(sql: string) {
  return sql.replace(/'(?:''|[^'])*'/gu, "''");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function tablePattern(tableName: string) {
  return `public\\.${escapeRegExp(tableName)}`;
}

test.describe("post-trade Supabase grant-hardening migration draft static tests", () => {
  test("grant-hardening migration exists after the post-trade persistence schema migration", () => {
    expect(migrationFiles).toContain(postTradeMigrationFile);
    expect(migrationFiles).toContain(grantHardeningMigrationFile);
    expect(migrationFiles.indexOf(grantHardeningMigrationFile)).toBeGreaterThan(
      migrationFiles.indexOf(postTradeMigrationFile),
    );
    expect(basename(migrationPath)).toBe(grantHardeningMigrationFile);
  });

  test("reads the grant-hardening draft as text only and keeps the source isolated", () => {
    expect(migrationSql).toContain("NO APPLY YET");
    expect(migrationSql).toContain("grant hardening only");
    expect(migrationSql).toContain("no runtime/API/Trade UI write path");

    const specSource = readFileSync(specPath, "utf8");
    const importLines = specSource
      .split("\n")
      .filter((line) => line.trim().startsWith("import "));
    const allowedImportLines = [
      'import { expect, test } from "@playwright/test";',
      'import { readFileSync, readdirSync } from "node:fs";',
      'import { basename, resolve } from "node:path";',
    ];

    expect(importLines).toEqual(allowedImportLines);

    for (const forbiddenImportFragment of [
      "@supabase",
      "app/",
      "trade-app",
      "api/",
      "scripts/",
      "bridge",
      "runner",
      "browser",
      "credential",
      "session",
      "env",
    ]) {
      expect(importLines.join("\n")).not.toContain(forbiddenImportFragment);
    }
  });

  test("revokes anon and authenticated privileges on only the intended persistence tables", () => {
    for (const tableName of hardenedTables) {
      expect(executableSql, `${tableName} revokes anon/authenticated`).toMatch(
        new RegExp(
          `revoke\\s+all\\s+privileges\\s+on\\s+table\\s+${tablePattern(tableName)}\\s+from\\s+anon\\s*,\\s*authenticated\\s*;`,
          "u",
        ),
      );
    }

    for (const tableName of unrelatedTables) {
      expect(executableSql, `${tableName} is not changed`).not.toMatch(
        new RegExp(`(?:revoke|grant)\\s+[\\s\\S]{0,120}${tablePattern(tableName)}\\b`, "u"),
      );
    }
  });

  test("preserves service role capability only for the intended persistence tables", () => {
    for (const tableName of hardenedTables) {
      expect(executableSql, `${tableName} grants service_role`).toMatch(
        new RegExp(
          `grant\\s+all\\s+privileges\\s+on\\s+table\\s+${tablePattern(tableName)}\\s+to\\s+service_role\\s*;`,
          "u",
        ),
      );
    }

    expect(executableSql).not.toMatch(/\bgrant\s+.+\bto\s+anon\b/u);
    expect(executableSql).not.toMatch(/\bgrant\s+.+\bto\s+authenticated\b/u);
  });

  test("does not weaken RLS or add permissive policies", () => {
    for (const forbiddenPattern of [
      /\bdisable\s+row\s+level\s+security\b/u,
      /\bno\s+force\s+row\s+level\s+security\b/u,
      /\bcreate\s+policy\b/u,
      /\balter\s+policy\b/u,
      /\bdrop\s+policy\b/u,
      /\busing\s*\(\s*true\s*\)/u,
      /\bwith\s+check\s*\(\s*true\s*\)/u,
    ]) {
      expect(executableStatementSql).not.toMatch(forbiddenPattern);
    }
  });

  test("contains no data rows, schema recreation, runtime writes, or obvious secrets", () => {
    for (const forbiddenPattern of [
      /\binsert\s+into\b/u,
      /\bcopy\s+public\./u,
      /\bcopy\s+[\s\S]{0,120}\s+from\s+stdin\b/u,
      /\bupdate\s+[\s\S]{0,120}\s+set\b/u,
      /\bdelete\s+from\b/u,
      /\bcreate\s+table\b/u,
      /\balter\s+table\b/u,
      /\bdrop\s+table\b/u,
      /\bcreate\s+(?:or\s+replace\s+)?function\b/u,
      /\bcreate\s+trigger\b/u,
      /\bpostgres(?:ql)?:\/\//u,
      /\bdatabase_url\b/u,
      /\bsupabase_service_role\b/u,
      /\bservice_role_key\b/u,
      /\banon\s+key\b/u,
      /\bjwt\s+secret\b/u,
      /\bpassword\b/u,
      /\bbankid\b/u,
      /\bcookie\b/u,
      /\bsession\b/u,
    ]) {
      expect(executableStatementSql).not.toMatch(forbiddenPattern);
    }
  });
});
