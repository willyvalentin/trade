import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { evaluateAction655bCanonicalExitDecision } from "@/lib/action-655b-canonical-exit-evaluator";
import { buildCanonicalRecommendationIdentity } from "@/lib/canonical-recommendation-evaluation";
import { buildAction655bCanonicalInput } from "../fixtures/action-655b-canonical-exit-evaluator-fixtures";

const repositoryRoot = path.resolve(__dirname, "../..");
const actionPath =
  "docs/action-666df-canonical-recommendation-identity-reconciliation.md";
const evidencePath =
  "docs/evidence/action-666df-canonical-recommendation-identity-reconciliation.json";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666df-canonical-recommendation-identity-reconciliation.spec.ts";
const evidenceSha256 =
  "bd393b8cbb62534793c4e3c2cc8da078a64da0b086af8b314798bc1817d049a8";

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function historicalSource(revision: string, relativePath: string) {
  return execFileSync("git", ["show", `${revision}:${relativePath}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
}

type Evidence = {
  contract_version: string;
  action_id: string;
  predecessor: {
    main_commit: string;
    main_tree: string;
    reviewed_head: string;
    exact_main_ci_run: number;
    lineage_contract_path: string;
    lineage_contract_sha256: string;
  };
  canonical_identity: Record<string, unknown>;
  reconciliation: Record<string, unknown>;
  source_sha256: Record<string, string>;
  authority_limits: Record<string, boolean>;
  decision: Record<string, unknown>;
};

test("pins the exact Action 666DF reconciliation evidence and source bytes", async () => {
  const raw = await source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw) as Evidence;

  expect(Object.keys(evidence)).toEqual([
    "contract_version",
    "action_id",
    "predecessor",
    "canonical_identity",
    "reconciliation",
    "source_sha256",
    "authority_limits",
    "decision",
  ]);
  expect(evidence.contract_version).toBe(
    "trade.action666df.canonical-recommendation-identity-reconciliation.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666DF");
  expect(evidence.predecessor).toEqual({
    main_commit: "151b7881819d8ffc8f6a0bfaf11cad165b7c0954",
    main_tree: "06738e1fe2d837e47ffb33d687e1e6e802556631",
    reviewed_head: "4257b42032aebb46d35c8e6d5db171925e6f0a14",
    exact_main_ci_run: 32479311239,
    lineage_contract_path:
      "docs/evidence/action-666de-deterministic-recommendation-lineage-backfill-contract.json",
    lineage_contract_sha256:
      "57929c87c4faa10dcd89d3b30360c10789487c8897409bc180655499fc8df5f5",
  });
  expect(
    sha256(
      historicalSource(
        evidence.predecessor.main_commit,
        evidence.predecessor.lineage_contract_path,
      ),
    ),
  ).toBe(evidence.predecessor.lineage_contract_sha256);
  expect(evidence.canonical_identity).toEqual({
    contract_version: "canonical_recommendation_identity_v1",
    source_builder_path: "lib/canonical-recommendation-evaluation.ts",
    identity_shape:
      "rec_decision:v1:<encoded source namespace>:<encoded decision id>:<decision epoch milliseconds>",
    segment_count: 5,
    fixed_segments: ["rec_decision", "v1"],
    source_namespace_grammar: "^[a-z0-9][a-z0-9._-]{0,63}$",
    decision_id_maximum_utf16_code_units: 240,
    canonical_nfc_required: true,
    control_characters_forbidden: true,
    encoded_components_must_round_trip: true,
    epoch_milliseconds_must_be_safe_exact_integer: true,
    utc_four_digit_year_required: true,
    legacy_hash_suffix_identity_rejected: true,
  });
  for (const [relativePath, expectedSha256] of Object.entries(
    evidence.source_sha256,
  )) {
    expect(sha256(await source(relativePath)), relativePath).toBe(expectedSha256);
  }
  expect(evidence.authority_limits).toEqual({
    database_query_authorized: false,
    database_write_authorized: false,
    migration_authorized: false,
    generated_types_refresh_authorized: false,
    runtime_wiring_authorized: false,
    provider_mutation_authorized: false,
    broker_or_automatic_execution_authorized: false,
    production_deploy_authorized: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "action_655g_canonical_recommendation_identity_reconciliation",
    next_bounded_objective: "append_only_position_version_history",
    production_authority_granted: false,
  });
});

test("accepts every rebuilt Action 664A identity and rejects every noncanonical rival", () => {
  const validInputs = [
    {
      source_namespace: "recommendation_snapshot",
      decision_id: "golden:decision:001",
      decided_at: "2026-07-08T13:32:00.000Z",
    },
    {
      source_namespace: "legacy_recommendations",
      decision_id: "11111111-1111-4111-8111-111111111111",
      decided_at: "2026-08-20T16:10:09.766Z",
    },
    {
      source_namespace: "source_1.v2",
      decision_id: "idé !()'*-._~",
      decided_at: "1969-12-31T23:59:59.999Z",
    },
  ] as const;

  for (const input of validInputs) {
    const identity = buildCanonicalRecommendationIdentity(input);
    expect(identity.ok, JSON.stringify(input)).toBe(true);
    if (!identity.ok) continue;
    expect(
      evaluateAction655bCanonicalExitDecision(
        buildAction655bCanonicalInput({
          position: { recommendation_identity: identity.value.value },
        }),
        true,
      ).result_kind,
    ).toBe("decision");
  }

  for (const recommendationIdentity of [
    `rec_decision:v1:${"a".repeat(64)}`,
    "rec_decision:v1:recommendation_snapshot:golden:decision:001:1783517520000",
    "rec_decision:v1:recommendation_snapshot:golden%3adecision%3a001:1783517520000",
    "rec_decision:v1:recommendation_snapshot:golden%3Adecision%3A001:01783517520000",
    "rec_decision:v1:recommendation_snapshot:golden%3Adecision%3A001:-0",
    "rec_decision:v1:Recommendation_Snapshot:golden%3Adecision%3A001:1783517520000",
    "rec_decision:v1:recommendation_snapshot:golden%0Adecision:1783517520000",
    "rec_decision:v1:recommendation_snapshot:golden%3Adecision%3A001:8640000000000001",
  ]) {
    expect(
      evaluateAction655bCanonicalExitDecision(
        buildAction655bCanonicalInput({
          position: { recommendation_identity: recommendationIdentity },
        }),
        true,
      ).invalid,
    ).toEqual({
      error_code: "schema_invalid",
      error_path: "/position_snapshot/recommendation_identity",
    });
  }
});

test("binds the canonical builder without expanding 655G authority", async () => {
  const [action, evaluator, registrationRaw, runner] = await Promise.all([
    source(actionPath),
    source("lib/action-655b-canonical-exit-evaluator.ts"),
    source(registrationPath),
    source(runnerPath),
  ]);
  expect(action).toContain("Action 664A");
  expect(action).toContain("runtime-unwired");
  expect(action).toContain("No migration or backfill has run.");
  expect(evaluator).toContain("function isCanonicalRecommendationIdentity");
  expect(evaluator).not.toContain("/^rec_decision:v1:[0-9a-f]{64}$/");
  expect(JSON.parse(registrationRaw)).toContain(thisTest);
  expect(runner).toContain(`"${thisTest}"`);
});
