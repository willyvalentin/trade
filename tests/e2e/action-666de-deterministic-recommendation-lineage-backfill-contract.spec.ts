import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { buildCanonicalRecommendationIdentity } from "@/lib/canonical-recommendation-evaluation";

const repositoryRoot = path.resolve(__dirname, "../..");
const canonicalRevision = "ddce80b57c9ab21b5210d2aa484271c2da0f60e6";
const actionPath =
  "docs/action-666de-deterministic-recommendation-lineage-backfill-contract.md";
const evidencePath =
  "docs/evidence/action-666de-deterministic-recommendation-lineage-backfill-contract.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666de-deterministic-recommendation-lineage-backfill-contract.spec.ts";
const evidenceSha256 =
  "d62ab09627b69950072311d90c78cfc8f06fcfc774d0efa05de4b2087bcc4f45";

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function canonicalSource(relativePath: string) {
  return execFileSync("git", ["show", `${canonicalRevision}:${relativePath}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function gitGrep(pattern: string, paths: string[]) {
  try {
    return execFileSync("git", ["grep", "-l", pattern, "--", ...paths], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 1
    ) {
      return "";
    }
    throw error;
  }
}

type Evidence = {
  contract_version: string;
  action_id: string;
  evidence_captured_at: string;
  predecessor: Record<string, unknown>;
  legacy_mapping: Record<string, unknown>;
  normative_digest: Record<string, unknown>;
  future_batch_contract: Record<string, unknown>;
  reconciliation: Record<string, unknown>;
  source_document_sha256: Record<string, string>;
  decision: Record<string, unknown>;
};

test("pins the exact bounded lineage-contract evidence and predecessor", async () => {
  const raw = await source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw) as Evidence;

  expect(Object.keys(evidence)).toEqual([
    "contract_version",
    "action_id",
    "evidence_captured_at",
    "predecessor",
    "legacy_mapping",
    "normative_digest",
    "future_batch_contract",
    "reconciliation",
    "source_document_sha256",
    "decision",
  ]);
  expect(evidence.contract_version).toBe(
    "trade.action666de.deterministic-recommendation-lineage-backfill-contract.v1",
  );
  expect(evidence.action_id).toBe("ACTION_666DE");
  expect(evidence.predecessor).toEqual({
    main_commit: canonicalRevision,
    main_tree: "b9b02c7b55daa2719fe28241c170f056537e0b18",
    reviewed_head: "981fcb3acc59030ce6531042ff5e0e0b27542501",
    exact_main_ci_run: 32428905068,
    inventory_evidence_path:
      "docs/evidence/action-666dd-authorized-position-version-read-only-backfill-inventory-execution.json",
    inventory_evidence_sha256:
      "972c51db190b13784010d7893edd72639d46b153adc20e8be0215d9ea6aeec1d",
  });
  expect(evidence.reconciliation).toEqual({
    inventory_recommendations: 1049,
    inventory_positions: 8,
    all_recommendations_identity_seed_eligible: true,
    all_positions_lineage_copy_eligible: true,
    required_initial_recommendation_version: 1,
    required_initial_position_version: 1,
    fresh_inventory_required_before_write: true,
    nonzero_blocker_count_stops_before_write: true,
    source_drift_requires_new_review: true,
  });
});

test("reuses the existing Action 664A identity builder without an inferred legacy identity", async () => {
  const identity = buildCanonicalRecommendationIdentity({
    source_namespace: "legacy_recommendations",
    decision_id: "11111111-1111-4111-8111-111111111111",
    decided_at: "2026-08-20T16:10:09.766Z",
  });
  expect(identity).toEqual({
    ok: true,
    value: {
      contract_version: "canonical_recommendation_identity_v1",
      value:
        "rec_decision:v1:legacy_recommendations:11111111-1111-4111-8111-111111111111:1787242209766",
      source_namespace: "legacy_recommendations",
      decision_id: "11111111-1111-4111-8111-111111111111",
      decided_at: "2026-08-20T16:10:09.766Z",
    },
  });

  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  expect(evidence.legacy_mapping).toEqual({
    source_relation: "public.recommendations",
    source_namespace: "legacy_recommendations",
    decision_id_column: "id",
    decision_id_format: "lowercase_canonical_uuid",
    decided_at_column: "created_at",
    identity_builder: "buildCanonicalRecommendationIdentity",
    identity_contract_version: "canonical_recommendation_identity_v1",
    initial_recommendation_version: 1,
    unclassifiable_row_disposition:
      "blocked_unclassifiable_legacy_recommendation",
  });
});

test("freezes a closed lossless normative digest frame and bounded owner batches", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  expect(evidence.normative_digest).toEqual({
    contract_version: "legacy_recommendation_normative_projection_v1",
    domain: "trade.legacy_recommendation_normative_digest.v1",
    algorithm: "sha256",
    digest_format: "64_lowercase_hexadecimal_characters",
    frame_keys: ["contract_version", "domain", "projection"],
    projection_keys: [
      "archived",
      "company_name",
      "confidence",
      "created_at",
      "direction",
      "entry_high",
      "entry_low",
      "invalidation",
      "owner_user_id",
      "reason_to_avoid",
      "recommendation_id",
      "risk_reward",
      "session_type",
      "setup_type",
      "status",
      "stop_loss",
      "target_1",
      "target_2",
      "thesis",
      "ticker",
      "timeframe",
    ],
    utf8_without_bom_required: true,
    raw_frame_must_equal_canonical_serialization: true,
    nullable_values_explicit_null: true,
    lossless_decimal_text_required: true,
    heuristic_or_client_value_allowed: false,
  });
  expect(evidence.future_batch_contract).toEqual({
    execution_authorized: false,
    exclusive_server_migration_lock_required: true,
    owner_scoped: true,
    owner_order: "canonical_uuid_ascending",
    row_order: "recommendation_id_ascending",
    maximum_rows_per_owner_batch: 100,
    row_lock_required: true,
    skip_locked_allowed: false,
    client_cursor_allowed: false,
    checkpoint_advances_only_after_commit: true,
    atomic_owner_batch_required: true,
    copy_position_lineage_only_from_owner_matching_recommendation: true,
  });
});

test("binds immutable predecessor sources and rejects contract evidence drift", async () => {
  const raw = await source(evidencePath);
  const evidence = JSON.parse(raw) as Evidence;
  expect(evidence.source_document_sha256).toEqual({
    "docs/action-666dd-authorized-position-version-read-only-backfill-inventory-execution.md":
      "7a365f6e7c2985895ce081dffabfca44afac0bd84191914afef42779a8a3ba2c",
    "docs/evidence/action-666dd-authorized-position-version-read-only-backfill-inventory-execution.json":
      "972c51db190b13784010d7893edd72639d46b153adc20e8be0215d9ea6aeec1d",
    "docs/action-664a-canonical-recommendation-evaluation-contract.md":
      "dff476d941ecdf3246421101694033968624b52f1b4d1a6444daf3ed4d63c215",
    "lib/canonical-recommendation-evaluation.ts":
      "e236c2bfd1baa692f8aa54b3370873ee19fe21a1ee8281839f5e5dad7c3a23cc",
    "lib/supabase-database.types.ts":
      "f23c3702ffd931cb5d81f13e19a8515125817717e9a3fad7ac85e40795729029",
  });
  for (const [relativePath, expectedHash] of Object.entries(
    evidence.source_document_sha256,
  )) {
    expect(sha256(canonicalSource(relativePath))).toBe(expectedHash);
  }

  for (const mutation of [
    raw.replace('"maximum_rows_per_owner_batch": 100', '"maximum_rows_per_owner_batch": 101'),
    raw.replace('"source_namespace": "legacy_recommendations"', '"source_namespace": "legacy_recommendation"'),
    raw.replace('"lossless_decimal_text_required": true', '"lossless_decimal_text_required": false'),
    raw.replace('"database_write_authorized": false', '"database_write_authorized": true'),
    raw.replace('\n  "decision": {', '\n  "unexpected": true,\n  "decision": {'),
  ]) {
    expect(mutation).not.toBe(raw);
    expect(sha256(mutation)).not.toBe(evidenceSha256);
  }
});

test("keeps execution, runtime and later authority closed while registering once", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  expect(evidence.decision).toEqual({
    bounded_objective_closed: "deterministic_recommendation_lineage_backfill_contract",
    next_bounded_objective:
      "action_655g_canonical_recommendation_identity_reconciliation",
    database_query_authorized: false,
    database_write_authorized: false,
    migration_authorized: false,
    staging_apply_authorized: false,
    production_apply_authorized: false,
    generated_types_refresh_authorized: false,
    runtime_wiring_authorized: false,
    production_deploy_authorized: false,
    broker_or_automatic_execution_authorized: false,
  });
  const [action, roadmap, ledger, registrationRaw, runner] = await Promise.all([
    source(actionPath),
    source(roadmapPath),
    source(ledgerPath),
    source(registrationPath),
    source(runnerPath),
  ]);
  for (const document of [action, roadmap, ledger]) {
    expect(document).toContain("Action 666DE");
    expect(document).toContain(
      "action_655g_canonical_recommendation_identity_reconciliation",
    );
    expect(document).toContain("dbeed25f2074bff4dba8cee7f6d511cb17992efc");
    expect(document).not.toMatch(
      /(?:github_pat_|ghp_|postgres(?:ql)?:\/\/|begin (?:rsa |ec |openssh )?private key)/i,
    );
  }
  const registration = JSON.parse(registrationRaw) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(runner.split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(
    gitGrep("deterministic_recommendation_lineage_backfill_contract", [
      "app",
      "components",
      "lib",
    ]),
  ).toBe("");
});
