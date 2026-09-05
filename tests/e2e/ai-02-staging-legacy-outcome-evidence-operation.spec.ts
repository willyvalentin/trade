import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const repoRoot = process.cwd();
const stagingOperationPath = resolve(
  repoRoot,
  "supabase/operations/ai-02-legacy-evidence/staging-only.sql",
);
const productionReadPath = resolve(
  repoRoot,
  "supabase/operations/ai-02-legacy-evidence/production-read.sql",
);
const operationDocumentPath = resolve(
  repoRoot,
  "docs/ai-02-staging-legacy-outcome-evidence-operation.md",
);

async function source(pathname: string) {
  return readFile(pathname, "utf8");
}

function withoutSqlComments(value: string) {
  return value.replace(/^--.*$/gm, "");
}

test.describe("AI-02 staging legacy outcome evidence operation", () => {
  test("keeps the target private, append-only and permanently not admitted", async () => {
    const sql = await source(stagingOperationPath);

    expect(sql).toContain("create table private.ai_02_legacy_outcome_evidence");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("before update or delete");
    expect(sql).toContain("AI-02 legacy outcome evidence is append-only");
    expect(sql).toContain("evaluation_disposition = 'not_admitted'");
    expect(sql).toContain("evidence_completeness = 'legacy_incomplete'");
    expect(sql).toContain("revoke all privileges on table");
    expect(sql).not.toContain("grant select");
    expect(sql).not.toContain("grant insert");
    expect(sql).not.toContain("public.ai_02_legacy_outcome_evidence");
  });

  test("returns only a bounded redacted outcome projection from production", async () => {
    const sql = withoutSqlComments(await source(productionReadPath));

    expect(sql).toContain("from public.recommendation_outcomes");
    expect(sql).toContain("digest(snapshot_fingerprint");
    expect(sql).toContain("limit 500");
    expect(sql).toContain("'legacy_incomplete'::text");
    expect(sql).toContain("'not_admitted'::text");
    for (const forbidden of [
      "owner_user_id",
      "ticker",
      "recommendation_id",
      "snapshot_id",
      "payload_json",
      "warnings_json",
      " id,",
    ]) {
      expect(sql).not.toContain(forbidden);
    }
  });

  test("documents the non-canonical, non-runtime disposition", async () => {
    const document = await source(operationDocumentPath);

    expect(document).toContain("private schema only");
    expect(document).toContain("Maximum import: 500 rows");
    expect(document).toContain("not a canonical decision");
    expect(document).toContain("not_admitted");
    expect(document).toContain("applied to production");
  });
});
