import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cs-current-main-non-forgeable-observation-authority/foundation-freeze-manifest.json";
const manifestSha256 =
  "4fa321d52e6df9dfd573617a76a6fb24a08d82aa60cef55f7d8ec0a131170ff5";

const expectedManifest = {
  schema_version:
    "action_666cs_current_main_non_forgeable_observation_authority_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "b84e0a4fb8c7455cddf8797f112cd2dc059bd697",
    candidate_base_tree: "54a8d747e4116251ac38428a6d322dc447dee61c",
    historical_design_pull_request: 72,
    historical_design_head: "40155d6b5bf03cb8e3ed2207f4f771d62b6f6937",
    historical_design_code_commit:
      "0ef7bdbbd2fef3300e7e561a037e5432638dd650",
    historical_review_commit:
      "730baa4f345cd1453ce49d1fc554f4d5a4d9cb48",
    historical_review_authority_reused: false,
    historical_evidence_artifacts_imported: false,
    historical_successor_chain_imported: false,
    fresh_current_main_review_required: true,
  },
  foundation: {
    issuance_version:
      "canonical_non_forgeable_binding_snapshot_issuance_v3",
    authority_version: "canonical_non_forgeable_issuer_authority_v3",
    envelope_version:
      "canonical_non_forgeable_issuer_authority_envelope_v3",
    nested_schema_version:
      "canonical_non_forgeable_nested_request_schema_v3",
    authority_session_identity:
      "action-666cs-current-main-external-owner-session-v1",
    signature_algorithm: "ed25519_sha256_canonical_json_v1",
    authority_payload_digest:
      "cd0f2da7eab1dd6e84127d910d5035e32926e66596034e79f26d210acf0f1e3d",
    pinned_authority_digest:
      "13b5f5a2c0bce18ba2b59ae64fc3f9b806f5012fcd3312f803d7e95e12acf8b6",
    pinned_authority_root_digest:
      "817e896f5d3217c92009f3f24926507f9159e2c44cba8e36c009573d11733d8c",
    pinned_issuer_anchor_digest:
      "9dc754dfcdd831c5a9c2e5277ec05125b6a2145115432305856ec4e364815a7e",
    pinned_nested_schema_digest:
      "e47ace2a98bbf1f81ba4b6cc46b3f9d60e4fa4d352b3dcca3699eadd69914226",
    pinned_semantic_scope_digest:
      "5eaf423b38c3ca3d7b228d108687665835da794d373d5e8b904100efe4aa992d",
    maximum_envelope_utf8_bytes: 32768,
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "499f278305021911fe44534c7a253d8879036b25a9f5165fabf397b3ebdb5010",
    artifacts: [
      {
        path:
          "docs/action-666cs-current-main-non-forgeable-observation-authority.md",
        sha256:
          "574f434d60267a8a2bfc46307e413cf65ce47c3980f714d3d5b6a5fbc0add9fa",
      },
      {
        path:
          "docs/action-666cs-golden-non-forgeable-observation-authority-report.json",
        sha256:
          "1ffa999d76fa4f79b45547afa316e47a1385ae753a469bc9e8e3d30dafca6a70",
      },
      {
        path:
          "lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures.ts",
        sha256:
          "c383497f485acd41c1a59839ab315d33bf3849bb1ec5d438b3109ce1375ac3d2",
      },
      {
        path:
          "lib/server/canonical-non-forgeable-binding-snapshot-issuance.ts",
        sha256:
          "b40ee661564b9703a46a1379d5545304bc6f01be9668fcc28270ca9ef32f39fa",
      },
      {
        path:
          "tests/e2e/action-666cs-current-main-non-forgeable-observation-authority.spec.ts",
        sha256:
          "fe212f1f48e3f8a8da2f7ca834f535d35768c48d9f4ae94a3eef31f249f7f6b1",
      },
    ],
  },
  trust_boundary: {
    literal_default_off_gate_required: true,
    literal_kill_switch_clear_required: true,
    request_bounded_before_authority_read: true,
    recursive_request_schema_bound: true,
    semantic_request_scope_bound: true,
    canonical_raw_json_bytes_required: true,
    duplicate_json_keys_rejected: true,
    envelope_utf8_bounded_before_parse: true,
    captured_json_parser_required: true,
    ed25519_signature_required: true,
    source_controlled_authority_pins_required: true,
    actual_cq_authority_cross_checked_against_every_signed_pin: true,
    private_signing_key_committed: false,
    general_trust_granting_authority_factory_exported: false,
    dependency_callbacks_captured_at_construction: true,
    external_authority_read_exactly_once_per_execution: true,
    predecessor_execution_after_signature_only: true,
    private_originating_harness_verifier_required: true,
    malformed_request_diagnostics_grant_verifier_authority: false,
    bounded_public_digest_inputs_required: true,
    captured_primordials_and_structured_containment_required: true,
    post_import_mutation_same_success_result_claimed: false,
  },
  scope: {
    server_only: true,
    synthetic_only: true,
    fixture_only: true,
    read_only: true,
    default_off: true,
    runtime_unwired: true,
    live_consumer_added: false,
    real_authority_reader_added: false,
    real_snapshot_or_publisher_added: false,
    database_or_provider_access_added: false,
    persistence_or_migration_added: false,
    ranking_or_model_effect_added: false,
    training_or_promotion_added: false,
    experiment_execution_added: false,
    broker_or_execution_authority_added: false,
  },
  roadmap: {
    delivered_predecessor: "666CQ",
    candidate_action: "666CS",
    next_bounded_objective_if_delivered:
      "current_main_lossless_invalid_scalar_observation_successor",
    track_2_complete_if_delivered: false,
    milestone_credit_awarded: false,
  },
  delivery: {
    historical_pull_request_merge_authorized: false,
    candidate_merge_authorized: false,
    production_deployment_authorized: false,
    provider_or_database_action_authorized: false,
    exact_head_ci_required: true,
    independent_current_head_review_required: true,
    operator_approval_of_pr_and_exact_head_required: true,
    ordinary_pull_request_merge_required: true,
    exact_main_ci_required: true,
    production_identity_and_smoke_required_if_published: true,
    unexpected_external_deploy_requires_explicit_reconciliation: true,
  },
} as const;

type MutableJson =
  | null
  | boolean
  | number
  | string
  | MutableJson[]
  | { [key: string]: MutableJson };

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function cloneManifest(): MutableJson {
  return JSON.parse(JSON.stringify(expectedManifest)) as MutableJson;
}

function validateManifest(value: unknown) {
  if (!isDeepStrictEqual(value, expectedManifest)) {
    throw new Error(
      "current_main_non_forgeable_observation_authority_manifest_drift",
    );
  }
}

function readAt(value: MutableJson, pathParts: Array<string | number>) {
  return pathParts.reduce<MutableJson>((current, part) => {
    if (Array.isArray(current)) return current[part as number];
    return (current as { [key: string]: MutableJson })[part as string];
  }, value);
}

function changedLeaf(value: MutableJson): MutableJson {
  if (typeof value === "boolean") return !value;
  if (typeof value === "number") return value + 1;
  if (typeof value === "string") return `${value}_drift`;
  return "unexpected";
}

function mutationMatrix(
  root: MutableJson,
  pathToValue: Array<string | number> = [],
): MutableJson[] {
  const mutations: MutableJson[] = [];
  const value = readAt(root, pathToValue);
  if (Array.isArray(value)) {
    const added = cloneManifest();
    (readAt(added, pathToValue) as MutableJson[]).push("unexpected");
    mutations.push(added);
    if (value.length > 0) {
      const removed = cloneManifest();
      (readAt(removed, pathToValue) as MutableJson[]).splice(0, 1);
      mutations.push(removed);
      const reordered = cloneManifest();
      (readAt(reordered, pathToValue) as MutableJson[]).reverse();
      mutations.push(reordered);
    }
    value.forEach((_, index) =>
      mutations.push(...mutationMatrix(root, [...pathToValue, index])),
    );
    return mutations;
  }
  if (value !== null && typeof value === "object") {
    const extra = cloneManifest();
    (readAt(extra, pathToValue) as { [key: string]: MutableJson }).unexpected =
      true;
    mutations.push(extra);
    for (const key of Object.keys(value)) {
      const removed = cloneManifest();
      delete (readAt(removed, pathToValue) as {
        [key: string]: MutableJson;
      })[key];
      mutations.push(removed);
      mutations.push(...mutationMatrix(root, [...pathToValue, key]));
    }
    return mutations;
  }
  const changed = cloneManifest();
  const parent = readAt(changed, pathToValue.slice(0, -1));
  const key = pathToValue.at(-1);
  if (typeof key === "number") {
    (parent as MutableJson[])[key] = changedLeaf(value);
  } else if (key !== undefined) {
    (parent as { [key: string]: MutableJson })[key] = changedLeaf(value);
  }
  mutations.push(changed);
  return mutations;
}

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath));
}

async function exists(relativePath: string) {
  try {
    await access(path.join(repositoryRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function sourceFiles(directory: string): Promise<string[]> {
  const absolute = path.join(repositoryRoot, directory);
  const entries = await readdir(absolute, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const relative = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(relative);
      return /\.[cm]?[jt]sx?$/.test(entry.name) ? [relative] : [];
    }),
  );
  return files.flat();
}

test("Action 666CS binds the exact five-file non-forgeable foundation", async () => {
  const rawManifest = await source(manifestPath);
  expect(sha256(rawManifest)).toBe(manifestSha256);
  const manifest: unknown = JSON.parse(rawManifest.toString("utf8"));
  validateManifest(manifest);
  const lines = await Promise.all(
    expectedManifest.foundation.artifacts.map(async (artifact) => {
      const bytes = await source(artifact.path);
      expect(sha256(bytes), artifact.path).toBe(artifact.sha256);
      return `${artifact.path}  ${artifact.sha256}\n`;
    }),
  );
  expect(sha256(lines.sort().join(""))).toBe(
    expectedManifest.foundation.aggregate_sha256,
  );
});

test("Action 666CS rejects every manifest mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_non_forgeable_observation_authority_manifest_drift",
    );
  }
});

test("Action 666CS binds historical non-authority and delivery boundaries", async () => {
  const contract = (
    await source(
      "docs/action-666cs-current-main-non-forgeable-observation-authority.md",
    )
  ).toString("utf8");
  expect(contract).toContain(
    "Historical PR #72 remains an open Draft stacked non-authority",
  );
  expect(contract).toContain("design evidence only");
  expect(contract).toContain(
    "The next bounded Track 2 objective after delivery is the current-main lossless",
  );
  expect(contract).toContain(
    "4. explicit operator approval names the PR and exact head;",
  );
  expect(contract).toContain(
    "Production deployment, provider action and database action are not authorized.",
  );
  for (const historical of [
    "docs/action-666bw-non-forgeable-issuance-freeze-manifest.json",
    "docs/action-666bw-non-forgeable-issuance-independent-rereview.md",
    "docs/action-666bw-non-forgeable-issuance-threat-matrix.json",
  ]) {
    expect(await exists(historical), historical).toBe(false);
  }
});

test("Action 666CS commits no private key and remains runtime-unwired", async () => {
  const governedModules = [
    "lib/server/canonical-non-forgeable-binding-snapshot-issuance.ts",
    "lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures.ts",
  ];
  for (const modulePath of governedModules) {
    const moduleSource = (await source(modulePath)).toString("utf8");
    expect(moduleSource.startsWith('import "server-only";'), modulePath).toBe(
      true,
    );
    expect(moduleSource, modulePath).not.toMatch(
      /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|generateKeyPair|privateKey|@supabase|createClient|fetch\(|process\.env|child_process|app\/api/,
    );
  }
  const candidates = (
    await Promise.all(["app", "components", "lib"].map(sourceFiles))
  ).flat();
  const consumers: string[] = [];
  for (const candidate of candidates) {
    if (governedModules.includes(candidate)) continue;
    const content = (await source(candidate)).toString("utf8");
    if (
      content.includes(
        "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance",
      )
    ) {
      consumers.push(candidate);
    }
  }
  expect(consumers).toEqual([
    "lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures.ts",
    "lib/server/canonical-lossless-invalid-scalar-observation-issuance.ts",
    "lib/server/canonical-provenance-bound-observation-verification-fixtures.ts",
    "lib/server/canonical-provenance-bound-observation-verification.ts",
  ]);
  const workflow = (
    await source(".github/workflows/milestone-a-ci.yml")
  ).toString("utf8");
  expect(workflow).toContain(
    "tests/e2e/action-666cs-current-main-non-forgeable-observation-authority.spec.ts",
  );
  expect(workflow).toContain(
    "tests/e2e/action-666cs-current-main-non-forgeable-observation-authority-freeze.spec.ts",
  );
});
