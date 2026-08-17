import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("MA15 reclosure binds the exact recovery release and read-only smoke", async () => {
  const [contract, roadmap, ledger, rawEvidence] = await Promise.all([
    source("docs/action-660g-ma15-verified-production-reclosure.md"),
    source("docs/ture-master-roadmap.md"),
    source("docs/ture-current-state-ledger.md"),
    source(
      "docs/evidence/action-660g-ma15-verified-production-reclosure.json",
    ),
  ]);
  const evidence = JSON.parse(rawEvidence);

  expect(contract).toContain("MA15 moves from `known_gap` to `verified_current`");
  expect(contract).toContain("13 + MA15 = 14/15 = 93.3%");
  expect(contract).toContain(
    "roadmap_completion_authority:false_until_main_verified",
  );
  expect(roadmap).toContain(
    "| MA-15 production behavioral smoke | verified_current |",
  );
  expect(ledger).toContain("MA-13 is `verified_current`");
  expect(ledger).toContain("| known_gap | none |");
  expect(ledger).not.toContain("| known_gap | MA-15 |");

  expect(Object.keys(evidence).sort()).toEqual(
    [
      "authority",
      "candidate_canonicalization_conditions",
      "contract_version",
      "evidence_status",
      "gate_reconciliation",
      "ma15_reclosure_conditions",
      "observed_at",
      "production_observation",
      "recovery_delivery",
      "scope_limits",
      "supabase_api_readback",
    ].sort(),
  );
  expect(evidence.authority.main_commit).toBe(
    "f463644ddeb7f49fa8b80924d9103ea8970ccae4",
  );
  expect(evidence.authority.main_tree).toBe(
    "b0c8eae01c22d3f720e4cc5fc4ed5424a24bdcad",
  );
  expect(evidence.authority.merge_pull_request).toBe(98);
  expect(evidence.authority.reviewed_head).toBe(
    "790151d098ad8b9d930c2dba3b168cf5e6f2e61a",
  );
  expect(evidence.authority.exact_main_ci_run).toBe(31541394848);
  expect(evidence.authority.production_netlify_deploy).toBe(
    "6a7b9e45ceb7e100087c55fa",
  );
  expect(evidence.authority.canonical_owner_uuid_recorded).toBe(false);

  expect(evidence.production_observation.anonymous_root_status).toBe(307);
  expect(evidence.production_observation.anonymous_dashboard_api_status).toBe(
    401,
  );
  expect(evidence.production_observation.authenticated_application_rendered).toBe(
    true,
  );
  expect(evidence.production_observation.dashboard_read_rendered).toBe(true);
  expect(evidence.production_observation.settings_read_rendered).toBe(true);
  expect(evidence.production_observation.market_calendar_read_rendered).toBe(
    true,
  );
  expect(
    evidence.production_observation.execution_records_server_read_succeeded,
  ).toBe(true);
  expect(evidence.production_observation.forms_submitted_by_agent).toBe(false);
  expect(
    evidence.production_observation.application_mutation_routes_called_by_agent,
  ).toBe(false);

  expect(evidence.supabase_api_readback.owner_bound_positions).toMatchObject({
    relation_hint: "recommendations!positions_recommendation_owner_fkey",
    request_count: 4,
    status_200_count: 4,
    status_300_count: 0,
  });
  expect(
    evidence.supabase_api_readback.historical_ambiguous_positions_control,
  ).toMatchObject({ request_count: 4, status_300_count: 4 });
  expect(evidence.supabase_api_readback.execution_records).toMatchObject({
    request_count: 2,
    status_200_count: 2,
    status_5xx_count: 0,
  });
  expect(evidence.supabase_api_readback.request_urls_recorded).toBe(false);
  expect(evidence.supabase_api_readback.row_or_owner_identifiers_recorded).toBe(
    false,
  );
  expect(evidence.supabase_api_readback.payload_values_recorded).toBe(false);

  expect(evidence.ma15_reclosure_conditions.all_satisfied).toBe(true);
  expect(evidence.gate_reconciliation.pre_action_verified).toBe(13);
  expect(evidence.gate_reconciliation.closed).toEqual(["MA-15"]);
  expect(evidence.gate_reconciliation.remaining_unknown).toEqual(["MA-13"]);
  expect(evidence.gate_reconciliation.post_action_verified).toBe(14);
  expect(evidence.gate_reconciliation.percentage).toBe(93.3);
  expect(evidence.gate_reconciliation.milestone_a_complete).toBe(false);
  expect(evidence.candidate_canonicalization_conditions.all_satisfied).toBe(
    false,
  );

  for (const text of [contract, roadmap, ledger, rawEvidence]) {
    expect(text).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    );
  }
});
