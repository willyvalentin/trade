import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { basename, resolve } from "node:path";

const baselineMigrationFile = "20260519000000_create_legacy_baseline_schema_draft.sql";
const firstExistingMigrationFile = "20260520000000_add_execution_metadata_to_positions.sql";
const migrationPath = resolve(process.cwd(), "supabase/migrations", baselineMigrationFile);
const migrationsDir = resolve(process.cwd(), "supabase/migrations");
const specPath = resolve(
  process.cwd(),
  "tests/e2e/post-trade-supabase-baseline-migration-draft-static.spec.ts",
);

const migrationSql = readFileSync(migrationPath, "utf8").replace(/\r\n/g, "\n");
const executableSql = stripSqlComments(migrationSql).toLowerCase();
const executableStatementSql = stripSqlStrings(executableSql);
const migrationFiles = readdirSync(migrationsDir)
  .filter((fileName) => fileName.endsWith(".sql"))
  .sort();

const baselineTables = [
  "recommendations",
  "positions",
  "position_updates",
  "user_settings",
  "scanner_cache",
  "scheduled_scan_runs",
  "market_calendar_cache",
  "market_regime_snapshots",
] as const;

const laterMigrationOwnedTables = [
  "recommendation_snapshots",
  "recommendation_outcomes",
  "recommendation_scan_runs",
  "recommendation_batches",
  "execution_lifecycle_events",
  "execution_agent_runs",
  "execution_agent_progress_events",
  "execution_records",
  "execution_record_audit_events",
  "scheduled_scan_attempts",
  "symbol_metadata",
  "execution_confirmation_evidence",
  "execution_settlement_reviews",
  "execution_cost_breakdowns",
  "execution_deviation_reviews",
  "execution_learning_candidates",
  "execution_redacted_artifacts",
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

function expectTableExists(tableName: (typeof baselineTables)[number]) {
  expect(executableSql, `${tableName} table exists`).toMatch(
    new RegExp(`create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.${escapeRegExp(tableName)}\\s*\\(`, "u"),
  );
}

test.describe("legacy Supabase baseline migration draft static tests", () => {
  test("baseline migration exists before the first existing positions migration", () => {
    expect(migrationFiles).toContain(baselineMigrationFile);
    expect(migrationFiles).toContain(firstExistingMigrationFile);
    expect(migrationFiles.indexOf(baselineMigrationFile)).toBeLessThan(
      migrationFiles.indexOf(firstExistingMigrationFile),
    );
    expect(basename(migrationPath)).toBe(baselineMigrationFile);
  });

  test("reads the baseline draft as text only and keeps the source isolated", () => {
    expect(migrationSql).toContain("NO APPLY YET");
    expect(migrationSql).toContain("schema-only/no-data artifact");
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

  test("includes only the required legacy baseline tables", () => {
    for (const tableName of baselineTables) {
      expectTableExists(tableName);
    }

    for (const tableName of laterMigrationOwnedTables) {
      expect(executableSql, `${tableName} is excluded`).not.toMatch(
        new RegExp(`create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.${escapeRegExp(tableName)}\\s*\\(`, "u"),
      );
    }
  });

  test("contains required baseline constraints, indexes, and relationships", () => {
    for (const tableName of baselineTables) {
      expect(executableSql, `${tableName} has primary key`).toContain(
        `add constraint ${tableName}_pkey primary key (id)`,
      );
    }

    expect(executableSql).toContain("add constraint scanner_cache_ticker_key unique (ticker)");
    expect(executableSql).toContain("scheduled_scan_runs_unique_day_session");
    expect(executableSql).toContain("market_calendar_cache_unique_date_provider");
    expect(executableSql).toContain("positions_recommendation_id_fkey");
    expect(executableSql).toContain("references public.recommendations(id)");
    expect(executableSql).toContain("position_updates_position_id_fkey");
    expect(executableSql).toContain("references public.positions(id)");
  });

  test("preserves evidenced RLS, policies, and grants for baseline tables only", () => {
    for (const tableName of baselineTables.filter((tableName) => tableName !== "scheduled_scan_runs")) {
      expect(executableSql).toContain(`alter table public.${tableName} enable row level security;`);
    }

    expect(executableSql).not.toContain("alter table public.scheduled_scan_runs enable row level security;");

    for (const tableName of baselineTables) {
      expect(executableSql).toContain(`grant all on table public.${tableName} to anon;`);
      expect(executableSql).toContain(`grant all on table public.${tableName} to authenticated;`);
      expect(executableSql).toContain(`grant all on table public.${tableName} to service_role;`);
    }
  });

  test("contains no row data, raw dumps, functions, triggers, or obvious secrets", () => {
    for (const forbiddenPattern of [
      /\binsert\s+into\b/u,
      /\bcopy\s+public\./u,
      /\bcopy\s+[\s\S]{0,120}\s+from\s+stdin\b/u,
      /\bdata\s+dump\b/u,
      /\brow\s+export\b/u,
      /\bpostgres(?:ql)?:\/\//u,
      /\bdatabase_url\b/u,
      /\bsupabase_service_role\b/u,
      /\bservice_role_key\b/u,
      /\banon\s+key\b/u,
      /\bjwt\s+secret\b/u,
      /\bcreate\s+(?:or\s+replace\s+)?function\b/u,
      /\bcreate\s+trigger\b/u,
    ]) {
      expect(executableStatementSql).not.toMatch(forbiddenPattern);
    }
  });
});
