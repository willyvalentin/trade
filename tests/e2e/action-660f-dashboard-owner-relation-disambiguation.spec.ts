import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("dashboard position reads select the owner-bound recommendation relationship", async () => {
  const dataAccess = await source("lib/server/application-data-access.ts");

  expect(dataAccess).toContain(
    'recommendations!positions_recommendation_owner_fkey(setup_type,invalidation)',
  );
  expect(dataAccess).toContain(
    'recommendations!positions_recommendation_owner_fkey(setup_type)',
  );
  expect(dataAccess).not.toContain(
    '.select("*, recommendations(setup_type,invalidation)")',
  );
  expect(dataAccess).not.toContain('.select("*, recommendations(setup_type)")');
  expect(dataAccess).not.toContain("positions_recommendation_id_fkey");
});

test("generated types retain both relationships that require explicit disambiguation", async () => {
  const generatedTypes = await source("lib/supabase-database.types.ts");
  const relationships = generatedTypes.slice(
    generatedTypes.indexOf('foreignKeyName: "positions_recommendation_id_fkey"'),
    generatedTypes.indexOf("recommendation_batches: {"),
  );

  expect(relationships).toContain(
    'foreignKeyName: "positions_recommendation_id_fkey"',
  );
  expect(relationships).toContain(
    'foreignKeyName: "positions_recommendation_owner_fkey"',
  );
  expect(relationships).toContain(
    'columns: ["recommendation_id", "owner_user_id"]',
  );
  expect(relationships).toContain(
    'referencedColumns: ["id", "owner_user_id"]',
  );
});

test("dashboard failure remains a sanitized fail-closed 503", async () => {
  const route = await source("app/api/app/dashboard/route.ts");

  expect(route).toContain('result.status !== "available"');
  expect(route).toContain('code: "application_data_unavailable"');
  expect(route).toContain("status: 503");
  expect(route).not.toContain("result.error");
});

test("governance keeps MA15 open until an exact production recovery", async () => {
  const [contract, roadmap, ledger, rawEvidence] = await Promise.all([
    source(
      "docs/action-660f-dashboard-owner-relation-disambiguation-recovery-candidate.md",
    ),
    source("docs/ture-master-roadmap.md"),
    source("docs/ture-current-state-ledger.md"),
    source(
      "docs/evidence/action-660f-dashboard-owner-relation-disambiguation-recovery-candidate.json",
    ),
  ]);
  const evidence = JSON.parse(rawEvidence);

  expect(contract).toContain("MA15 is `known_gap`");
  expect(contract).toContain("13/15 = 86.7%");
  expect(roadmap).toContain("| MA-15 production behavioral smoke | known_gap |");
  expect(ledger).toContain("| known_gap | MA-15 |");
  expect(evidence.production_observation.open_positions_api_status).toBe(300);
  expect(evidence.production_observation.closed_positions_api_status).toBe(300);
  expect(evidence.gate_reconciliation.post_observation_verified).toBe(13);
  expect(evidence.ma15_reclosure_conditions.all_satisfied).toBe(false);
  expect(rawEvidence).not.toMatch(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
  );
});
