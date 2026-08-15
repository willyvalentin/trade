import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666ct-current-main-lossless-invalid-scalar-observation/foundation-freeze-manifest.json";
const manifestSha256 =
  "4f35b92f7496c03892c6b0176335584b852ec402c43a408fb1696e8134461c6c";

const expectedManifest = {
  schema_version:
    "action_666ct_current_main_lossless_invalid_scalar_observation_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "7b671f740222b0220c88cdccaaf6378519a2c7be",
    candidate_base_tree: "3cdbf3a19ab6307b3e3100c74791de7ea6a8cbe1",
    historical_design_pull_request: 72,
    historical_design_head: "40155d6b5bf03cb8e3ed2207f4f771d62b6f6937",
    historical_design_code_commit:
      "0ef7bdbbd2fef3300e7e561a037e5432638dd650",
    historical_review_commit: "730baa4f345cd1453ce49d1fc554f4d5a4d9cb48",
    historical_review_authority_reused: false,
    historical_evidence_artifacts_imported: false,
    historical_successor_chain_imported: false,
    fresh_current_main_review_required: true,
  },
  foundation: {
    issuance_version:
      "canonical_lossless_invalid_scalar_observation_issuance_v4",
    observation_version: "canonical_lossless_primitive_observation_v2",
    value_digest_version: "canonical_lossless_primitive_value_digest_v2",
    failure_identity_version:
      "canonical_lossless_invalid_scalar_failure_identity_v2",
    maximum_canonical_value_bytes: 65536,
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "8ee956c47e090bfe90b6d0e8b3e5a589a7607667a73b4a7a43c2725f40fc9d7c",
    artifacts: [
      {
        path:
          "docs/action-666ct-current-main-lossless-invalid-scalar-observation.md",
        sha256:
          "461f4b989f29530a15b07e0c942371e5c336de0c5d3528cf713ddd17d1c1a2a2",
      },
      {
        path:
          "docs/action-666ct-golden-lossless-invalid-scalar-observation-report.json",
        sha256:
          "a5e241bc54d758919b6a806c090eb5e0f966b0e5d488cf615fe8be4b433ee68d",
      },
      {
        path:
          "lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures.ts",
        sha256:
          "ea573bc67e8f5be7080520f1a017cd234de17403b228fe8d3405d2bdfb79f6be",
      },
      {
        path:
          "lib/server/canonical-lossless-invalid-scalar-observation-issuance.ts",
        sha256:
          "8a3acc0a4ebd5951b47bfb697973d158fcc86c07adee986573d1987d79fd235c",
      },
      {
        path:
          "tests/e2e/action-666ct-current-main-lossless-invalid-scalar-observation.spec.ts",
        sha256:
          "a5ccfd6b4ef7f24fdcafe39c2b727a9525cc51fe57093f61c84025ca9a586fc9",
      },
    ],
  },
  trust_boundary: {
    literal_default_off_gate_required: true,
    literal_kill_switch_clear_required: true,
    primitive_observation_before_predecessor_execution: true,
    bigint_preflight_before_hex_materialization: true,
    utf16_length_preflight_before_hex_materialization: true,
    binary64_big_endian_representation_required: true,
    exact_utf16_code_unit_representation_required: true,
    type_tagged_value_digest_required: true,
    bounded_classification_distinct_from_full_identity: true,
    symbol_or_function_full_identity_forbidden: true,
    budget_exceeded_full_identity_forbidden: true,
    invalid_object_authority_forbidden: true,
    private_originating_harness_verifier_required: true,
    represented_primitive_predecessor_rejection_bound: true,
    valid_object_predecessor_private_verifier_required: true,
    caller_supplied_rebuild_dependencies_allowed: false,
    bounded_public_digest_inputs_required: true,
    dependency_callbacks_captured_at_construction: true,
    captured_scalar_primordials_required: true,
    proxy_or_accessor_scalar_introspection_allowed: false,
    structured_never_throw_result_required: true,
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
    delivered_predecessor: "666CS",
    candidate_action: "666CT",
    next_bounded_objective_if_delivered:
      "current_main_provenance_bound_observation_verification_successor",
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
    throw new Error("current_main_lossless_invalid_scalar_manifest_drift");
  }
}

function readAt(value: MutableJson, parts: Array<string | number>) {
  return parts.reduce<MutableJson>((current, part) => {
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
      const reversed = cloneManifest();
      (readAt(reversed, pathToValue) as MutableJson[]).reverse();
      mutations.push(reversed);
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
      delete (readAt(removed, pathToValue) as { [key: string]: MutableJson })[
        key
      ];
      mutations.push(removed);
      mutations.push(...mutationMatrix(root, [...pathToValue, key]));
    }
    return mutations;
  }
  const changed = cloneManifest();
  const parent = readAt(changed, pathToValue.slice(0, -1));
  const key = pathToValue.at(-1)!;
  if (Array.isArray(parent)) parent[key as number] = changedLeaf(value);
  else (parent as { [key: string]: MutableJson })[key as string] = changedLeaf(value);
  mutations.push(changed);
  return mutations;
}

async function source(relative: string) {
  return readFile(path.join(repositoryRoot, relative));
}

async function exists(relative: string) {
  try {
    await access(path.join(repositoryRoot, relative));
    return true;
  } catch {
    return false;
  }
}

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(path.join(repositoryRoot, directory), {
    withFileTypes: true,
  });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const relative = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(relative);
      return /\.[cm]?[jt]sx?$/.test(entry.name) ? [relative] : [];
    }),
  );
  return files.flat();
}

test("Action 666CT binds the exact five-file lossless-scalar foundation", async () => {
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

test("Action 666CT rejects every manifest mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_lossless_invalid_scalar_manifest_drift",
    );
  }
});

test("Action 666CT binds historical non-authority and delivery boundaries", async () => {
  const contract = (
    await source(
      "docs/action-666ct-current-main-lossless-invalid-scalar-observation.md",
    )
  ).toString("utf8");
  expect(contract).toContain(
    "The historical PR #72 remains an open Draft stacked non-authority.",
  );
  expect(contract).toContain("design evidence only");
  expect(contract).toContain(
    "The next bounded Track 2 objective after delivery is current-main",
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

test("Action 666CT remains server-only, provider-free and runtime-unwired", async () => {
  const governedModules = [
    "lib/server/canonical-lossless-invalid-scalar-observation-issuance.ts",
    "lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures.ts",
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
        "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance",
      )
    ) {
      consumers.push(candidate);
    }
  }
  expect(consumers).toEqual([]);
  const workflow = (
    await source(".github/workflows/milestone-a-ci.yml")
  ).toString("utf8");
  expect(workflow).toContain(
    "tests/e2e/action-666ct-current-main-lossless-invalid-scalar-observation.spec.ts",
  );
  expect(workflow).toContain(
    "tests/e2e/action-666ct-current-main-lossless-invalid-scalar-observation-freeze.spec.ts",
  );
});
