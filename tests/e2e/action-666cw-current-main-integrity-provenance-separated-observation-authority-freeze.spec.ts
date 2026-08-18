import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cw-current-main-integrity-provenance-separated-observation-authority/foundation-freeze-manifest.json";
const manifestSha256 =
  "eb65b3822562c191e5f2f4fd85a19af3e10574d4c0b1d8a9df73ffb14b2852ea";

const expectedManifest = {
  schema_version:
    "action_666cw_current_main_integrity_provenance_separated_observation_authority_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "981bb474ebe5466f92d671ef489a1f3a82d3bcba",
    candidate_base_tree: "d43918f9e47782002d8b28b11804935112e99c59",
    candidate_base_exact_main_ci_run: 32080009340,
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
    authority_version:
      "canonical_integrity_provenance_separated_observation_authority_v2",
    runtime_evidence_version:
      "canonical_integrity_provenance_separated_observation_runtime_evidence_v2",
    envelope_version:
      "canonical_integrity_provenance_separated_observation_envelope_v2",
    result_version:
      "canonical_integrity_provenance_separated_observation_result_v2",
    readback_version:
      "canonical_integrity_provenance_separated_observation_readback_v2",
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "5202236a632573eea041f211132b6af70839dd61f08f8f799b96ac2e89219cf0",
    artifacts: [
      {
        path:
          "docs/action-666cw-current-main-integrity-provenance-separated-observation-authority.md",
        sha256:
          "59cac89a31318a7b4ab52965d20382f2a014d547a4a35b0e0b10c6fd80dfc378",
      },
      {
        path:
          "docs/action-666cw-golden-integrity-provenance-separated-observation-report.json",
        sha256:
          "4c1cbf26befe34493a8159dc6b7a6c341b98bf5504597658e02410f3023312da",
      },
      {
        path:
          "lib/server/canonical-integrity-provenance-separated-observation-authority-fixtures.ts",
        sha256:
          "bc351c09bafe24340a2886cb800308780fd1d57f47dbe31e7df17799a7b88604",
      },
      {
        path:
          "lib/server/canonical-integrity-provenance-separated-observation-authority.ts",
        sha256:
          "fe7c0a8cdcc26d4b7a21a9bf100ffeacb326aee7061bd0e5ab3f47bdeb7e0265",
      },
      {
        path:
          "tests/e2e/action-666cw-current-main-integrity-provenance-separated-observation-authority.spec.ts",
        sha256:
          "b054f392d672252a3c0bcfda09fd0a14425a3bc4e261104cbd761d349ba7eb7c",
      },
    ],
  },
  trust_boundary: {
    literal_default_off_gate_required: true,
    literal_kill_switch_clear_required: true,
    exact_action_666cv_originating_result_authority_required: true,
    private_runtime_provenance_required: true,
    runtime_provenance_scope: "current_process_only",
    runtime_evidence_trusted_required: true,
    public_envelope_provenance_verified_forbidden: true,
    public_envelope_trusted_forbidden: true,
    public_envelope_admitted_forbidden: true,
    public_forgery_integrity_only_required: true,
    private_result_shell_identity_required: true,
    private_result_rebuild_required: true,
    exact_result_deep_equality_required: true,
    result_clone_or_copy_authority_forbidden: true,
    cross_harness_result_authority_forbidden: true,
    proxy_or_accessor_candidate_introspection_allowed: false,
    readback_string_or_exact_uint8array_only: true,
    readback_max_utf8_bytes: 65_536,
    readback_exact_canonical_bytes_required: true,
    readback_duplicate_keys_forbidden: true,
    readback_provenance_authority_forbidden: true,
    readback_integrity_only_required: true,
    captured_reflection_collection_freeze_json_hash_text_typed_array_and_private_map_primordials_required:
      true,
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
    delivered_predecessor: "666CV",
    candidate_action: "666CW",
    next_bounded_objective_if_delivered:
      "current_main_callback_free_atomic_observation_successor",
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
      "current_main_integrity_provenance_separated_observation_manifest_drift",
    );
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
  else
    (parent as { [key: string]: MutableJson })[key as string] =
      changedLeaf(value);
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

test("Action 666CW binds the exact five-file provenance-separation foundation", async () => {
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

test("Action 666CW rejects every manifest mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_integrity_provenance_separated_observation_manifest_drift",
    );
  }
});

test("Action 666CW binds historical non-authority and delivery boundaries", async () => {
  const contract = (
    await source(
      "docs/action-666cw-current-main-integrity-provenance-separated-observation-authority.md",
    )
  ).toString("utf8");
  expect(contract).toContain(
    "Historical PR #72 remains open Draft stacked non-authority.",
  );
  expect(contract).toContain("design evidence only");
  expect(contract).toContain(
    "Persisted bytes cannot preserve the module-private `WeakMap`, result identity",
  );
  expect(contract).toContain(
    "a copied result, clone, replay, cross-harness result or public digest cannot",
  );
  expect(contract).toContain(
    "4. explicit operator approval names the PR and exact head;",
  );
  expect(contract).toContain(
    "Production deployment, provider action and database action are not authorized.",
  );
  for (const historical of [
    "docs/action-666cd-integrity-provenance-separated-observation-authority.md",
    "docs/action-666cd-golden-integrity-provenance-separated-observation-report.json",
    "tests/e2e/action-666cd-integrity-provenance-separated-observation-authority.spec.ts",
  ]) {
    expect(await exists(historical), historical).toBe(false);
  }
});

test("Action 666CW remains server-only, provider-free and runtime-unwired", async () => {
  const governedModules = [
    "lib/server/canonical-integrity-provenance-separated-observation-authority.ts",
    "lib/server/canonical-integrity-provenance-separated-observation-authority-fixtures.ts",
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
        "@/lib/server/canonical-integrity-provenance-separated-observation-authority",
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
    "tests/e2e/action-666cw-current-main-integrity-provenance-separated-observation-authority.spec.ts",
  );
  expect(workflow).toContain(
    "tests/e2e/action-666cw-current-main-integrity-provenance-separated-observation-authority-freeze.spec.ts",
  );
});
