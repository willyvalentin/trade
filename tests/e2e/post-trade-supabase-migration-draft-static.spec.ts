import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql",
);
const specPath = resolve(
  process.cwd(),
  "tests/e2e/post-trade-supabase-migration-draft-static.spec.ts",
);

const migrationSql = readFileSync(migrationPath, "utf8").replace(/\r\n/g, "\n");
const executableSql = stripSqlComments(migrationSql).toLowerCase();
const executableStatementSql = stripSqlStrings(executableSql);

const expectedTables = [
  "execution_confirmation_evidence",
  "execution_settlement_reviews",
  "execution_cost_breakdowns",
  "execution_deviation_reviews",
  "execution_learning_candidates",
  "execution_redacted_artifacts",
] as const;

const neverStoreTerms = [
  "credentials",
  "password",
  "bankid",
  "mfa",
  "cookie",
  "session",
  "raw_browser_storage",
  "network_dump",
  "supabase_service_key",
  "service_role_key",
  "api_token",
  "personal_identity",
  "personnummer",
  "avanza_customer",
  "customer_id",
  "account_number",
  "account_balance",
  "unrelated_holdings",
  "raw_pdf",
  "raw_screenshot",
  "raw_html",
  "raw_broker_page",
  "unredacted_settlement_note",
  "unredacted_broker_confirmation",
];

function stripSqlComments(sql: string) {
  return sql.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/--.*$/gmu, "");
}

function stripSqlStrings(sql: string) {
  return sql.replace(/'(?:''|[^'])*'/gu, "''");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function tableBlock(tableName: (typeof expectedTables)[number]) {
  const blockPattern = new RegExp(
    `create table if not exists public\\.${escapeRegExp(tableName)} \\([\\s\\S]*?\\n\\);`,
    "iu",
  );
  const match = migrationSql.match(blockPattern);

  expect(match, `table block exists for ${tableName}`).not.toBeNull();

  return match?.[0].toLowerCase() ?? "";
}

function expectBlockContains(tableName: (typeof expectedTables)[number], fragments: string[]) {
  const block = tableBlock(tableName);

  for (const fragment of fragments) {
    expect(block, `${tableName} contains ${fragment}`).toContain(fragment.toLowerCase());
  }
}

function expectIndexOn(tableName: string, columnName: string) {
  const indexPattern = new RegExp(
    `create index if not exists [\\w_]+\\s+on public\\.${escapeRegExp(tableName)} \\(${escapeRegExp(
      columnName,
    )}(?:\\s+desc)?\\)`,
    "iu",
  );

  expect(migrationSql, `${tableName}.${columnName} has an index`).toMatch(indexPattern);
}

test.describe("post-trade Supabase migration draft static tests", () => {
  test("reads the migration draft as text only and keeps the source isolated", () => {
    expect(migrationSql).toContain("NO APPLY YET");
    expect(migrationSql).toContain("requires separate review");
    expect(migrationSql).toContain("no runtime/API/Trade UI write path");

    const specSource = readFileSync(specPath, "utf8");
    const importLines = specSource
      .split("\n")
      .filter((line) => line.trim().startsWith("import "));
    const allowedImportLines = [
      'import { expect, test } from "@playwright/test";',
      'import { readFileSync } from "node:fs";',
      'import { resolve } from "node:path";',
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

    for (const forbiddenRuntimeFragment of [
      ["process", ".env"].join(""),
      ["fetch", "("].join(""),
      ["local", "Storage"].join(""),
      ["session", "Storage"].join(""),
      ["document", ".cookie"].join(""),
      ["child", "_process"].join(""),
      ["spawn", "("].join(""),
      ["exec", "("].join(""),
    ]) {
      expect(specSource).not.toContain(forbiddenRuntimeFragment);
    }
  });

  test("creates all post-trade tables in the approved dependency order", () => {
    const tablePositions = expectedTables.map((tableName) => {
      const position = migrationSql.indexOf(`create table if not exists public.${tableName}`);

      expect(position, `${tableName} exists`).toBeGreaterThanOrEqual(0);

      return position;
    });

    expect(tablePositions).toEqual([...tablePositions].sort((a, b) => a - b));
  });

  test("contains no executable writes, seeds, functions, triggers, grants, or broad policies", () => {
    for (const forbiddenPattern of [
      /\binsert\s+into\b/u,
      /\bupsert\b/u,
      /\bupdate\s+[\s\S]{0,120}\s+set\b/u,
      /\bdelete\s+from\b/u,
      /\bcopy\s+/u,
      /\bcreate\s+(?:or\s+replace\s+)?function\b/u,
      /\bcreate\s+trigger\b/u,
      /\bcreate\s+policy\b/u,
      /\balter\s+policy\b/u,
      /\bdrop\s+policy\b/u,
      /\bgrant\s+/u,
      /\busing\s*\(\s*true\s*\)/u,
      /\bwith\s+check\s*\(\s*true\s*\)/u,
      /\bseed\b/u,
    ]) {
      expect(executableStatementSql).not.toMatch(forbiddenPattern);
    }
  });

  test("does not define never-store terms as executable schema or data", () => {
    for (const term of neverStoreTerms) {
      expect(executableStatementSql, `executable SQL excludes ${term}`).not.toContain(term);
    }
  });

  test("enables RLS on every table and leaves policy design future-gated", () => {
    for (const tableName of expectedTables) {
      expect(migrationSql).toMatch(
        new RegExp(`alter table public\\.${escapeRegExp(tableName)}\\s+enable row level security;`, "iu"),
      );
    }

    const lowerSql = migrationSql.toLowerCase();

    expect(lowerSql).toContain("future policies must preserve scoped reads");
    expect(lowerSql).toContain("app-auth/server-write model is not finalized");
    expect(lowerSql).toContain("must not be applied until those policies are reviewed");
    expect(executableStatementSql).not.toMatch(/\b(create\s+policy|grant\s+all|using\s*\(\s*true\s*\)|with\s+check\s*\(\s*true\s*\))/u);
  });

  test("keeps draft constraints locked to safe post-trade fields", () => {
    expectBlockContains("execution_confirmation_evidence", [
      "check (side in ('buy', 'sell'))",
      "check (redaction_status in ('redacted', 'safe_summary_only'))",
      "check (sensitive_data_present = false)",
      "check (manual_review_status in ('not_required', 'required', 'approved_for_review_only', 'blocked'))",
    ]);

    expectBlockContains("execution_settlement_reviews", [
      "check (side in ('buy', 'sell'))",
      "check (quantity > 0)",
      "check (planned_price >= 0)",
      "check (execution_price >= 0)",
      "check (gross_amount >= 0)",
      "check (settlement_amount >= 0)",
      "check (commission >= 0)",
      "check (deviation_classification in (",
      "check (manual_review_status in ('not_required', 'required', 'approved_for_review_only', 'blocked'))",
      "check (redaction_status in ('redacted', 'safe_summary_only'))",
      "check (sensitive_data_present = false)",
    ]);

    expectBlockContains("execution_cost_breakdowns", [
      "check (commission >= 0)",
      "check (gross_amount >= 0)",
      "check (settlement_amount >= 0)",
      "check (redaction_status in ('redacted', 'safe_summary_only'))",
      "check (sensitive_data_present = false)",
    ]);

    expectBlockContains("execution_deviation_reviews", [
      "check (deviation_classification in (",
      "check (manual_review_status in ('not_required', 'required', 'approved_for_review_only', 'blocked'))",
      "check (redaction_status in ('redacted', 'safe_summary_only'))",
      "check (sensitive_data_present = false)",
    ]);

    expectBlockContains("execution_learning_candidates", [
      "check (learning_candidate_status in ('staged_manual_review_only', 'blocked'))",
      "check (outcome_eligible = false)",
      "check (requires_separate_learning_gate = true)",
      "check (learning_auto_update_allowed = false)",
      "check (manual_review_status in ('not_required', 'required', 'approved_for_review_only', 'blocked'))",
      "check (redaction_status in ('redacted', 'safe_summary_only'))",
      "check (sensitive_data_present = false)",
    ]);

    expectBlockContains("execution_redacted_artifacts", [
      "check (redaction_status in ('redacted', 'safe_summary_only'))",
      "check (sensitive_data_present = false)",
      "check (raw_artifact_stored = false)",
    ]);
  });

  test("contains expected safe indexes for review and reconciliation lookup fields", () => {
    for (const [tableName, columnName] of [
      ["execution_confirmation_evidence", "internal_trade_id"],
      ["execution_confirmation_evidence", "plan_id"],
      ["execution_confirmation_evidence", "contract_id"],
      ["execution_confirmation_evidence", "ticker"],
      ["execution_confirmation_evidence", "side"],
      ["execution_confirmation_evidence", "created_at"],
      ["execution_confirmation_evidence", "manual_review_status"],
      ["execution_settlement_reviews", "internal_trade_id"],
      ["execution_settlement_reviews", "plan_id"],
      ["execution_settlement_reviews", "contract_id"],
      ["execution_settlement_reviews", "ticker"],
      ["execution_settlement_reviews", "side"],
      ["execution_settlement_reviews", "created_at"],
      ["execution_settlement_reviews", "manual_review_status"],
      ["execution_settlement_reviews", "deviation_classification"],
      ["execution_cost_breakdowns", "settlement_review_id"],
      ["execution_cost_breakdowns", "created_at"],
      ["execution_deviation_reviews", "settlement_review_id"],
      ["execution_deviation_reviews", "deviation_classification"],
      ["execution_deviation_reviews", "manual_review_status"],
      ["execution_deviation_reviews", "created_at"],
      ["execution_learning_candidates", "settlement_review_id"],
      ["execution_learning_candidates", "learning_candidate_status"],
      ["execution_learning_candidates", "created_at"],
      ["execution_redacted_artifacts", "created_at"],
    ] as const) {
      expectIndexOn(tableName, columnName);
    }
  });

  test("keeps optional artifact table metadata-only with no raw artifact columns", () => {
    const artifactBlock = tableBlock("execution_redacted_artifacts");

    expect(artifactBlock).toContain("artifact_kind text not null");
    expect(artifactBlock).toContain("redaction_status text not null");
    expect(artifactBlock).toContain("storage_reference_safe text not null");
    expect(artifactBlock).toContain("sensitive_data_present boolean not null default false");
    expect(artifactBlock).toContain("raw_artifact_stored boolean not null default false");
    expect(artifactBlock).toContain("check (sensitive_data_present = false)");
    expect(artifactBlock).toContain("check (raw_artifact_stored = false)");

    for (const forbiddenRawColumn of [
      "raw_pdf",
      "raw_screenshot",
      "raw_html",
      "raw_broker_page",
      "unredacted_settlement_note",
      "unredacted_broker_confirmation",
    ]) {
      expect(artifactBlock).not.toContain(forbiddenRawColumn);
    }
  });
});
