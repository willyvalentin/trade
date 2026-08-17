import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const evidencePath =
  "docs/evidence/action-666cr-current-main-roadmap-ledger-reconciliation.json";
const evidenceSha256 =
  "b43a8845e896351f97c617f00336d54e0d2041dff73cd853228019dfb29f0cb8";

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function exactKeys(value: Record<string, unknown>, expected: string[]) {
  expect(Object.keys(value).sort()).toEqual([...expected].sort());
}

test("preserves the historical Action 666CR reconciliation after Action 660I", async () => {
  const [rawEvidence, action, roadmap, ledger, workflow] = await Promise.all([
    source(evidencePath),
    source("docs/action-666cr-current-main-roadmap-ledger-reconciliation.md"),
    source("docs/ture-master-roadmap.md"),
    source("docs/ture-current-state-ledger.md"),
    source(".github/workflows/milestone-a-ci.yml"),
  ]);
  const evidence = JSON.parse(rawEvidence);

  expect(createHash("sha256").update(rawEvidence).digest("hex")).toBe(
    evidenceSha256,
  );
  exactKeys(evidence, [
    "contract_version",
    "observed_at",
    "authority",
    "delivered_main_chain",
    "gate_reconciliation",
    "candidate_canonicalization_conditions",
    "track_2",
    "production_boundary",
    "source_document_sha256",
    "scope_limits",
  ]);
  exactKeys(evidence.authority, [
    "repository",
    "main_commit",
    "main_tree",
    "main_parents",
    "main_pull_request",
    "exact_main_ci_run",
    "exact_main_ci_conclusion",
  ]);
  expect(evidence.authority).toEqual({
    repository: "willyvalentin/trade",
    main_commit: "7b79691e473fa630d748763cddf97e1209974e40",
    main_tree: "5c6eb05b11f83a2c50302c06cd41fd70295702fc",
    main_parents: [
      "9a18c2ee394f34e470e3a2804bf9e9b1e444a38c",
      "7b2999c519d304a4a8b32596f37b5edf75693789",
    ],
    main_pull_request: 108,
    exact_main_ci_run: 31835953106,
    exact_main_ci_conclusion: "success",
  });

  expect(evidence.delivered_main_chain).toEqual([
    { pull_request: 100, action: "660H", head: "a38fa88e7f830428d41ae49093cfb00055aed040", merge: "a8a4990a81aa30484caf6112d0810161c1e86214", exact_main_ci_run: 31589417771 },
    { pull_request: 101, action: "666CJ", head: "4cd1b42ddaa9f423ec438f127775133f4cd9e424", merge: "3daa36638f10ec9356811cb9f8e900e44bead3be", exact_main_ci_run: 31600893127 },
    { pull_request: 102, action: "666CK", head: "6642e5fd02d02960231a554bf35f695c29b730fb", merge: "0318046d6e0350694b07ab4f35c491841d3e723b", exact_main_ci_run: 31608209930 },
    { pull_request: 103, action: "666CL", head: "d54d7a2cb3c647178d974cf9309a4c3fe3e59ec1", merge: "7bdb119f45293a7d237aeb879c1f3ec9160a230f", exact_main_ci_run: 31620080482 },
    { pull_request: 104, action: "666CM", head: "158af911adb9b3e1e80540e0e160140e038521ca", merge: "a5aa598de7b10a36e3e026ef98df81219559a09c", exact_main_ci_run: 31631408490 },
    { pull_request: 105, action: "666CN", head: "18771e88e7e5d25d23209e9bf033ee2189c9f1f1", merge: "0a40ed49184fd5e6fd0b0b2996002e0d3ca027b0", exact_main_ci_run: 31643036906 },
    { pull_request: 106, action: "666CO", head: "cb40b25419aacedbc44b439b5e9e6b3d1e16070c", merge: "315eae107d4860b0d1fa126112eeb46d625c83e8", exact_main_ci_run: 31687730706 },
    { pull_request: 107, action: "666CP", head: "2a870862ace5c82018b0267fee3a5a785b39203f", merge: "9a18c2ee394f34e470e3a2804bf9e9b1e444a38c", exact_main_ci_run: 31795859082 },
    { pull_request: 108, action: "666CQ", head: "7b2999c519d304a4a8b32596f37b5edf75693789", merge: "7b79691e473fa630d748763cddf97e1209974e40", exact_main_ci_run: 31835953106 },
  ]);

  expect(evidence.gate_reconciliation).toEqual({
    pre_delivery_verified: 13,
    candidate_closes: ["MA-02"],
    post_delivery_verified: 14,
    total: 15,
    post_delivery_percentage: 93.3,
    known_gap: "MA-13",
    ma02_credit_awarded_by_candidate: false,
    milestone_a_complete: false,
  });
  expect(evidence.candidate_canonicalization_conditions).toEqual({
    exact_head_ci_success: false,
    independent_read_only_review_no_blocking_findings: false,
    explicit_operator_approval_of_pr_and_exact_head: false,
    ordinary_pr_merge_verified: false,
    exact_reviewed_scope_merged: false,
    exact_main_ci_success: false,
    all_satisfied: false,
  });
  expect(evidence.track_2).toEqual({
    delivered_current_main_actions: [
      "666CJ",
      "666CK",
      "666CL",
      "666CM",
      "666CN",
      "666CO",
      "666CP",
      "666CQ",
    ],
    historical_open_non_draft_non_authority_prs: [54],
    historical_open_draft_non_authority_prs: [55, 57, 58, 60, 63, 67, 72],
    next_bounded_objective:
      "current_main_non_forgeable_observation_authority_successor",
    default_off: true,
    runtime_unwired: true,
  });
  expect(evidence.production_boundary).toEqual({
    latest_verified_deploy: "6a7b9e45ceb7e100087c55fa",
    latest_verified_commit: "f463644ddeb7f49fa8b80924d9103ea8970ccae4",
    production_is_first_parent_ancestor_of_main: true,
    production_equals_main: false,
    production_deploy_authorized: false,
    automated_deploy_preview_context: "netlify/trade-vl/deploy-preview",
    automated_deploy_preview_url:
      "https://deploy-preview-109--trade-vl.netlify.app",
    automated_deploy_preview_is_production: false,
    operator_initiated_provider_mutation_performed: false,
  });
  expect(evidence.scope_limits).toEqual({
    governance_only: true,
    application_source_mutation: false,
    database_mutation: false,
    operator_initiated_provider_mutation: false,
    runtime_mutation: false,
    production_deployment_triggered: false,
    automated_deploy_preview_observed: true,
    broker_or_execution_authority: false,
  });

  expect(evidence.source_document_sha256).toEqual({
    "docs/action-666cr-current-main-roadmap-ledger-reconciliation.md":
      "ca2f1d1e038bbf2c0484fa50b6352affb86af1845c78277c0cfccbb8582021ea",
    "docs/ture-current-state-ledger.md":
      "43b7183d9d24731593a0eacd967cc1443cd05e040e356474c772fd3c2ba57323",
    "docs/ture-master-roadmap.md":
      "b37525c8a80f87e94388015508150125384fa2567d663e07513a648707ab37ff",
  });
  expect(createHash("sha256").update(action).digest("hex")).toBe(
    evidence.source_document_sha256[
      "docs/action-666cr-current-main-roadmap-ledger-reconciliation.md"
    ],
  );

  expect(action).toContain("7b79691e473fa630d748763cddf97e1209974e40");
  expect(action).toContain("31835953106");
  expect(action).toContain("14/15");
  expect(roadmap).toContain("cdf03e545cf25c0988627ef192d50acb1d72ba72");
  expect(ledger).toContain("32045093016");
  expect(roadmap).toContain("15 of 15 required gates verified (100%)");
  expect(ledger).toContain("15/15 = 100%");
  expect(roadmap).toContain(
    "| MA-13 branch protection/required-check policy | verified_current |",
  );
  expect(ledger).toContain("MA-13 is `verified_current`");
  for (const text of [action, roadmap, ledger]) {
    expect(text).toMatch(
      /PR #54 remains\s+open, non-Draft and non-authority/,
    );
    expect(text).toMatch(
      /PRs #55, #57,\s+#58, #60, #63, #67 and #72\s+remain open Draft non-authority/,
    );
    expect(text).not.toContain("production and main are the same commit");
    expect(text).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    );
  }
  expect(roadmap).toContain("#110 through #113");
  expect(ledger).toContain(
    "current-main foundation delivered; integrity/provenance successor open",
  );
  expect(action).toContain("Production deployment is not authorized.");
  expect(action).toContain("netlify/trade-vl/deploy-preview");
  expect(action).toContain("explicitly\nnon-production");
  expect(ledger).toContain(
    "Automatic non-production previews grant no\nauthority",
  );
  expect(workflow).toContain(
    "tests/e2e/action-666cr-current-main-roadmap-ledger-reconciliation.spec.ts",
  );
});
