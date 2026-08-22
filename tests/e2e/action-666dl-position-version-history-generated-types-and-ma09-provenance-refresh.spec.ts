import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const repositoryRoot = path.resolve(__dirname, "../..");
const actionPath =
  "docs/action-666dl-position-version-history-generated-types-and-ma09-provenance-refresh.md";
const evidencePath =
  "docs/evidence/action-666dl-position-version-history-generated-types-and-ma09-provenance-refresh.json";
const typePath = "lib/supabase-database.types.ts";
const migrationPath =
  "supabase/migrations/20260821194333_create_position_version_history.sql";
const v2OraclePath =
  "tests/e2e/action-660-ma09-generated-types-provenance-v2.spec.mjs";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666dl-position-version-history-generated-types-and-ma09-provenance-refresh.spec.ts";

const outputSha256 =
  "57eb9b06cfc32570f1a930e80169cf6f1e1f2059ec92f6ccae40f9a5ceabfe00";
const outputBlobSha1 = "44ee825c72f8bfae97848de064c4e727a1b64916";
const migrationSha256 =
  "aaf0d677da73316355e30bb3d613d0274244ed896fb4c3bf266bb8b045fd177f";
const sourceHashes = {
  [actionPath]:
    "fc2189b4060a8e2515acb018239512783b93ea9631b906d74b7cb49b6f7fc7f4",
  "docs/ture-current-state-ledger.md":
    "c69d541558a269d522c0b834bae99fd1f571243267b1798f4240f96faeb1d5af",
  "docs/ture-master-roadmap.md":
    "a09b1970aa88c58eb42c1f86c2c32497f5803d99fb4c0c620ade262951285808",
  "docs/evidence/action-666dk-position-version-history-authorized-production-apply-and-catalog-proof.json":
    "c0c9e62e1c68bf2ad1b4ca8e0091d7a38a72394e3e24111517e913b9ff5dcf5f",
  [registrationPath]:
    "2e3f2c2f292f10663be013aceea025413f1e02b192e47ac18ee58ec42c86f965",
  [runnerPath]:
    "a09c74cbfed5c61b208ad68ecec501f1a017681d7ae0fac7fe81aafc53403d50",
  [v2OraclePath]:
    "3f151100643cb64bbbb5814766c654646b2b30eed20a7c3998318b8d2a65ed4a",
  "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts":
    "54835311ed3480304226140e9ffd37c98c51072e994388916115d3020ee9d21f",
};

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function gitBlobSha1(value: string) {
  return createHash("sha1")
    .update(Buffer.from(`blob ${Buffer.byteLength(value, "utf8")}\0`, "utf8"))
    .update(value, "utf8")
    .digest("hex");
}

test("pins the privacy-preserving current type output", async () => {
  const raw = await source(evidencePath);
  expect(raw).not.toMatch(
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
  );
  expect(raw).not.toMatch(/(?:postgres(?:ql)?:\/\/|authorization\s*[:=]\s*bearer)/i);

  expect(JSON.parse(raw)).toEqual({
    contract_version: "trade.action666dl.generated-types-and-ma09-provenance-refresh.v1",
    action_id: "ACTION_666DL",
    observed_at: "2026-08-22T18:07:52Z",
    predecessor: {
      protected_main_commit: "d31c0920e7f90d4714f363767159caba598e8652",
      protected_main_tree: "59eba00d398e0c29b9f7b99803de7c1853636a37",
      source_migration_sha256: migrationSha256,
      prior_authorized_apply_evidence_sha256:
        "c0c9e62e1c68bf2ad1b4ca8e0091d7a38a72394e3e24111517e913b9ff5dcf5f",
    },
    type_generation: {
      transport: "operator_authorized_project_scoped_read_only",
      response_shape: "exact_object_types_string",
      response_content_retained: false,
      privacy_classification: "schema_identifier_only",
      repository_output_path: typePath,
      repository_output_sha256: outputSha256,
      repository_output_git_blob_sha1: outputBlobSha1,
      in_memory_byte_identical_before_write: true,
    },
    source_document_sha256: sourceHashes,
    authority_limits: {
      database_mutation: false,
      migration_application: false,
      legacy_backfill: false,
      runtime_wiring: false,
      provider_configuration_mutation: false,
      production_deployment: false,
      broker_or_execution: false,
    },
    decision: {
      bounded_objective: "generated_types_and_ma09_provenance_refresh",
      candidate_status: "source_delivery_candidate",
      historical_v2_evidence_preserved: true,
      next_bounded_objective: "separately_gated_milestone_b_runtime_design",
    },
  });
});

test("requires exact current output bytes and the reviewed source migration", async () => {
  const [types, migration] = await Promise.all([
    source(typePath),
    source(migrationPath),
  ]);
  expect(sha256(types)).toBe(outputSha256);
  expect(gitBlobSha1(types)).toBe(outputBlobSha1);
  expect(sha256(migration)).toBe(migrationSha256);
  for (const [relativePath, expectedHash] of Object.entries(sourceHashes)) {
    expect(sha256(await source(relativePath))).toBe(expectedHash);
  }
});

test("preserves V2 as historical evidence and registers 666DL once", async () => {
  const [action, v2Oracle, registrationRaw, runner] = await Promise.all([
    source(actionPath),
    source(v2OraclePath),
    source(registrationPath),
    source(runnerPath),
  ]);
  expect(action).toContain("raw response");
  expect(action).toContain("not archived");
  expect(action).toContain("Historical preservation");
  expect(v2Oracle).toContain("V2_REPOSITORY_OUTPUT_PATH");
  expect(v2Oracle).toContain("OUTPUT_GIT_BLOB_SHA1");
  expect(v2Oracle).not.toContain("read(paths.output)");

  const registration = JSON.parse(registrationRaw) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(runner.split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("fails closed for altered byte, privacy or authority claims", async () => {
  const raw = await source(evidencePath);
  const expected = JSON.parse(raw);
  for (const candidate of [
    raw.replace(outputSha256, "f".repeat(64)),
    raw.replace('"response_content_retained": false', '"response_content_retained": true'),
    raw.replace('"database_mutation": false', '"database_mutation": true'),
    raw.replace('"runtime_wiring": false', '"runtime_wiring": true'),
  ]) {
    expect(candidate).not.toBe(raw);
    expect(JSON.parse(candidate)).not.toEqual(expected);
  }
});
