import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666co-current-main-frozen-improvement-binding-store/foundation-freeze-manifest.json";
const manifestSha256 =
  "21eefa98e8e52978d1c6bce56f13d2c2efbbeeb6a37604236f554eae000fb58b";

const expectedManifest = {
  schema_version:
    "action_666co_current_main_frozen_improvement_binding_store_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "0a40ed49184fd5e6fd0b0b2996002e0d3ca027b0",
    candidate_base_tree: "294673813b4bcc6bab6e951a2d44355e100c6f7b",
    historical_source_pull_request: 63,
    historical_source_head: "bc554c4f1211c6b0acbf846ec34d57325253014a",
    historical_review_authority_reused: false,
    historical_evidence_artifacts_imported: false,
  },
  foundation: {
    snapshot_version: "canonical_improvement_binding_snapshot_v1",
    entry_version: "canonical_improvement_binding_entry_v1",
    store_version: "canonical_improvement_binding_store_v1",
    authority_version:
      "canonical_improvement_binding_snapshot_authority_v1",
    owner_boundary_version:
      "canonical_improvement_binding_owner_boundary_v1",
    lookup_result_version:
      "canonical_improvement_binding_lookup_result_v1",
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "79b9924a05abb74165cd6ec7302c067283c553f0c56c86f5cb72253ed791f307",
    artifacts: [
      {
        path:
          "docs/action-666ax-golden-improvement-binding-store-report.json",
        sha256:
          "b0fc88dcc5ab3cf8e29978169a0f74127cad87c23e71a7b1f8584732725adf07",
      },
      {
        path: "docs/action-666ax-improvement-binding-store-contract.md",
        sha256:
          "1f90e7532903cba6e9033ad7f62fca8e99a6f8c73607d8632424b6a044387b25",
      },
      {
        path:
          "lib/server/canonical-improvement-binding-store-fixtures.ts",
        sha256:
          "f92875211d0d706e531c520282cc00ce2ae0601140229f1d4915384b5775a04e",
      },
      {
        path: "lib/server/canonical-improvement-binding-store.ts",
        sha256:
          "527d5fc1628fb55f78c830980aa9e0d9047ef379c28cb9cea324c9657177086b",
      },
      {
        path:
          "tests/e2e/action-666ax-improvement-binding-store.spec.ts",
        sha256:
          "40467e962df84db7fa1058eb2b6f0739ca71ef2a063ee29c5a200293fef44f61",
      },
    ],
  },
  scope: {
    server_only: true,
    synthetic_only: true,
    fixture_only: true,
    read_only: true,
    default_off: true,
    runtime_unwired: true,
    live_consumer_added: false,
    real_snapshot_or_publisher_added: false,
    database_or_provider_access_added: false,
    persistence_or_migration_added: false,
    ranking_or_model_effect_added: false,
    training_or_promotion_added: false,
    experiment_execution_added: false,
    broker_or_execution_authority_added: false,
  },
  runtime_remediation: {
    literal_activation_gate_required: true,
    exact_active_option_counter_and_dependency_shells_required: true,
    construction_time_owner_method_snapshot_required: true,
    canonical_recursive_authority_snapshot_and_request_surfaces_required: true,
    authority_and_snapshot_cloneability_required: true,
    semantic_authority_validation_before_snapshot_read_required: true,
    canonical_owner_and_snapshot_identity_binding_required: true,
    independent_owner_authority_identity_and_digest_pins_required: true,
    strict_string_digest_root_and_pin_validation_required: true,
    builder_and_runtime_semantic_validation_parity_required: true,
    private_execution_counters_required: true,
    caller_counter_mutation_forbidden: true,
    exact_predecessor_and_entry_schemas_required: true,
    construction_time_lookup_adapter_snapshot_required: true,
    predecessor_consumer_oracles_reconciled: true,
    structured_never_throw_lookup_failure_required: true,
    recursive_adversarial_runtime_matrix_required: true,
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
      "current_main_frozen_improvement_binding_store_manifest_drift",
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

test("Action 666CO binds the exact five-file binding-store foundation", async () => {
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

test("Action 666CO rejects every authority, scope, remediation and delivery mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_frozen_improvement_binding_store_manifest_drift",
    );
  }
});

test("Action 666CO excludes historical review authority and binds delivery", async () => {
  const rebuild = (
    await source(
      "docs/action-666co-current-main-frozen-improvement-binding-store-rebuild.md",
    )
  ).toString("utf8");
  expect(rebuild).toContain("Historical PR #63 remains an open stacked non-authority");
  expect(rebuild).toContain("cannot authorize this current-main rebuild");
  expect(rebuild).toContain(
    "explicit operator approval naming the PR and exact head",
  );
  expect(rebuild).toContain("Spår 2 remains open");
  for (const historical of [
    "docs/action-666ay-improvement-binding-store-foundation-freeze-manifest.json",
    "docs/action-666ay-improvement-binding-store-independent-review.md",
    "docs/action-666ay-improvement-binding-store-threat-finding-matrix.json",
    "docs/action-666az1-improvement-binding-store-independent-portability-rereview.md",
    "docs/action-666az1-improvement-binding-store-portability-refreeze-manifest.json",
  ]) {
    expect(await exists(historical), historical).toBe(false);
  }
});

test("Action 666CO remains server-only and absent from live consumers", async () => {
  for (const modulePath of [
    "lib/server/canonical-improvement-binding-store.ts",
    "lib/server/canonical-improvement-binding-store-fixtures.ts",
  ]) {
    const moduleSource = (await source(modulePath)).toString("utf8");
    expect(moduleSource.startsWith('import "server-only";'), modulePath).toBe(
      true,
    );
    expect(moduleSource, modulePath).not.toMatch(
      /@supabase|createClient|fetch\(|process\.env|child_process|app\/api/,
    );
  }
  const candidates = (
    await Promise.all(["app", "components", "lib"].map(sourceFiles))
  ).flat();
  const consumers: string[] = [];
  for (const candidate of candidates) {
    const content = (await source(candidate)).toString("utf8");
    if (content.includes("canonical-improvement-binding-store")) {
      consumers.push(candidate);
    }
  }
  expect(consumers.sort()).toEqual([
    "lib/server/canonical-governed-binding-snapshot-admission-fixtures.ts",
    "lib/server/canonical-governed-binding-snapshot-admission.ts",
    "lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures.ts",
    "lib/server/canonical-governed-binding-snapshot-issuance-successor.ts",
    "lib/server/canonical-improvement-binding-store-fixtures.ts",
  ]);
});
