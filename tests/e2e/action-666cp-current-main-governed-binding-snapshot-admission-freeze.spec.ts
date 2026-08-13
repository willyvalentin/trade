import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cp-current-main-governed-binding-snapshot-admission/foundation-freeze-manifest.json";
const manifestSha256 =
  "e47f0ac36fc89841d2000c894562ccc5b2f5941426a0076e37f38591c3e2a237";

const expectedManifest = {
  schema_version:
    "action_666cp_current_main_governed_binding_snapshot_admission_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "315eae107d4860b0d1fa126112eeb46d625c83e8",
    candidate_base_tree: "6de7cb8ded4b2f0c7ba59d72f0bf5ce5c600690d",
    historical_source_pull_request: 67,
    historical_source_head: "4f731a3c92c9b4fbdb1a33848a5371410d703a45",
    historical_review_authority_reused: false,
    historical_evidence_artifacts_imported: false,
  },
  foundation: {
    admission_version:
      "canonical_improvement_binding_snapshot_admission_v1",
    replay_version: "canonical_binding_backed_improvement_replay_v1",
    external_snapshot_version:
      "canonical_external_improvement_binding_snapshot_v1",
    external_entry_version: "canonical_external_improvement_binding_entry_v1",
    authority_version: "canonical_binding_snapshot_admission_authority_v1",
    owner_boundary_version:
      "canonical_binding_snapshot_admission_owner_boundary_v1",
    validator_version: "canonical_bounded_snapshot_validator_v1",
    budget_policy_version: "canonical_bounded_snapshot_budget_policy_v1",
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "15aadf50188b43819369978fb6e1c2cdda7b5519cca50ab5cd074014c14bd26f",
    artifacts: [
      {
        path: "docs/action-666bd-golden-binding-backed-replay-report.json",
        sha256:
          "d35ddc775fc6b2ce594fe6519a85fee6963a7eaa6e61efe3eae15554d3a45e96",
      },
      {
        path: "docs/action-666bd-governed-binding-snapshot-admission.md",
        sha256:
          "3444d8db017e579cd17cab69d034426a645b2366619fbc7332bd2fd313cfa93e",
      },
      {
        path:
          "lib/server/canonical-governed-binding-snapshot-admission-fixtures.ts",
        sha256:
          "a5b26f132d784f1f7450f0a3aaf95d0d3af7cd31c9bfca39ebe97429c7ddb9b3",
      },
      {
        path: "lib/server/canonical-governed-binding-snapshot-admission.ts",
        sha256:
          "593bb6c7cf4f0b415537f792999ead83749f6993c66d6ba899a23ba3e4ffd358",
      },
      {
        path:
          "tests/e2e/action-666bd-governed-binding-snapshot-admission.spec.ts",
        sha256:
          "282e0d76a7876a5dabd2ecad39fb56e5555101a10825b624646d40a649514c70",
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
    construction_time_dependency_snapshot_required: true,
    independent_admission_and_capture_authority_pins_required: true,
    authority_validation_before_snapshot_read_required: true,
    canonical_recursive_snapshot_request_and_result_surfaces_required: true,
    strict_string_digest_root_and_pin_validation_required: true,
    builder_and_runtime_semantic_validation_parity_required: true,
    private_replay_verifier_authority_required: true,
    private_execution_counters_required: true,
    caller_counter_mutation_forbidden: true,
    predecessor_consumer_oracles_reconciled: true,
    structured_never_throw_failure_required: true,
    recursive_adversarial_runtime_matrix_required: true,
    raw_json_byte_bound_before_parse_required: true,
    private_frozen_snapshot_source_brand_required: true,
    captured_json_primordials_required: true,
    captured_clone_freeze_digest_and_introspection_primordials_required: true,
    captured_array_prototype_traversal_methods_required: true,
    captured_map_set_brand_and_proxy_primordials_required: true,
    captured_regex_time_numeric_and_string_primordials_required: true,
    implicit_array_iterator_for_canonical_validation_forbidden: true,
    strict_locale_independent_canonical_string_order_required: true,
    canonical_json_sorted_key_bytes_required: true,
    canonical_json_round_trip_and_duplicate_rejection_required: true,
    external_snapshot_effective_equals_captured_required: true,
    frozen_admission_taxonomy_required: true,
    downstream_intrinsic_descriptor_integrity_gate_required: true,
    downstream_drift_structured_zero_read_failure_required: true,
    downstream_failure_unproved_rebuild_claim_forbidden: true,
    cross_limit_budget_precedence_and_permutation_invariance_required: true,
    arbitrary_js_object_pre_allocation_claimed: false,
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
      "current_main_governed_binding_snapshot_admission_manifest_drift",
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

test("Action 666CP binds the exact five-file admission foundation", async () => {
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

test("Action 666CP rejects every authority, scope, remediation and delivery mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_governed_binding_snapshot_admission_manifest_drift",
    );
  }
});

test("Action 666CP excludes historical review authority and binds delivery", async () => {
  const rebuild = (
    await source(
      "docs/action-666cp-current-main-governed-binding-snapshot-admission-rebuild.md",
    )
  ).toString("utf8");
  expect(rebuild).toContain("Historical PR #67 remains an open stacked non-authority");
  expect(rebuild).toContain("cannot authorize this current-main rebuild");
  expect(rebuild).toContain(
    "explicit operator approval naming the PR and exact head",
  );
  expect(rebuild).toContain("Spår 2 remains open");
  for (const historical of [
    "docs/action-666be-binding-backed-replay-foundation-freeze-manifest.json",
    "docs/action-666be-binding-backed-replay-independent-review.md",
    "docs/action-666be-binding-backed-replay-threat-finding-matrix.json",
    "docs/action-666bf-binding-backed-replay-foundation-refreeze-manifest.json",
    "docs/action-666bf-binding-backed-replay-independent-rereview.md",
  ]) {
    expect(await exists(historical), historical).toBe(false);
  }
});

test("Action 666CP remains server-only and absent from live consumers", async () => {
  for (const modulePath of [
    "lib/server/canonical-governed-binding-snapshot-admission.ts",
    "lib/server/canonical-governed-binding-snapshot-admission-fixtures.ts",
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
    if (content.includes("canonical-governed-binding-snapshot-admission")) {
      consumers.push(candidate);
    }
  }
  expect(consumers.sort()).toEqual([
    "lib/server/canonical-governed-binding-snapshot-admission-fixtures.ts",
  ]);
});
