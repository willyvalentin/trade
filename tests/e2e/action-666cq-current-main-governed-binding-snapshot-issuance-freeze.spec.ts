import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cq-current-main-governed-binding-snapshot-issuance/foundation-freeze-manifest.json";
const manifestSha256 =
  "ed8a44801a091899798392f2100898a5e1e9dba6d2c0a300a84e34fbb1091cb2";

const expectedManifest = {
  schema_version:
    "action_666cq_current_main_governed_binding_snapshot_issuance_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "9a18c2ee394f34e470e3a2804bf9e9b1e444a38c",
    candidate_base_tree: "794a94999150113599f4aa32c91650b1a2879ba0",
    historical_source_pull_request: 72,
    historical_source_head: "40155d6b5bf03cb8e3ed2207f4f771d62b6f6937",
    historical_source_code_commit:
      "4152531b50cd7b4968733afe02fb235a62fd9493",
    historical_review_commit:
      "e9cfbcc14d4fb8b8973712ed62e5fcdf5565be38",
    historical_review_authority_reused: false,
    historical_evidence_artifacts_imported: false,
    larger_historical_observation_chain_imported: false,
  },
  foundation: {
    issuance_version:
      "canonical_governed_binding_snapshot_issuance_successor_v3",
    request_version:
      "canonical_governed_binding_snapshot_issuance_request_v3",
    authority_version:
      "canonical_governed_binding_snapshot_issuer_authority_v3",
    observation_version:
      "canonical_governed_binding_snapshot_issuance_observation_v3",
    validator_version:
      "canonical_governed_binding_snapshot_issuance_validator_v3",
    budget_version: "canonical_governed_binding_snapshot_issuance_budget_v3",
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "a026d6d177c67788293ba3d409d7936accad7fff2cbcb86c1a8769fa2dd2efcb",
    artifacts: [
      {
        path:
          "docs/action-666bq-golden-binding-snapshot-issuance-successor-report.json",
        sha256:
          "83c45f8bfaa9dc34e551624fcad7e1f77a496d8df5054da10f845975289bcd52",
      },
      {
        path:
          "docs/action-666bq-governed-binding-snapshot-issuance-successor.md",
        sha256:
          "b02e29c6a204b9b5453e8e6c161332b9e4112237c499397b354d5a1fe4d492a3",
      },
      {
        path:
          "lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures.ts",
        sha256:
          "d54ce461dbeb4f28fe9ce2a61353b72382fc36ae6ee369f952b52fc1563263be",
      },
      {
        path:
          "lib/server/canonical-governed-binding-snapshot-issuance-successor.ts",
        sha256:
          "27b234de13ef93106ba3c135b73a3aa55a6a84f386c834bf05a1fd0ff0bb26a4",
      },
      {
        path:
          "tests/e2e/action-666bq-governed-binding-snapshot-issuance-successor.spec.ts",
        sha256:
          "2110c5ff39de8c8c906eeb0998d45336f59e1cdcec9d62da3065f24edda724f1",
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
    historical_scope_split_required: true,
  },
  runtime_remediation: {
    literal_activation_gate_required: true,
    exact_active_option_counter_and_dependency_shells_required: true,
    construction_time_issuer_and_ax_dependency_snapshot_required: true,
    independent_issuer_authority_identity_and_digest_pins_required: true,
    recursive_request_literal_and_shell_validation_before_authority_read_required:
      true,
    canonical_semantic_scope_validation_required: true,
    strict_string_digest_root_and_pin_validation_required: true,
    unknown_binding_entry_type_forbidden: true,
    builder_and_runtime_semantic_validation_parity_required: true,
    issued_effective_equals_issued_at_required: true,
    private_issuance_verifier_authority_required: true,
    private_execution_counters_required: true,
    caller_counter_mutation_forbidden: true,
    callback_failure_single_read_containment_required: true,
    self_consistent_authority_replacement_rejected: true,
    structured_never_throw_failure_required: true,
    bounded_public_digest_inputs_required: true,
    recursive_adversarial_runtime_matrix_required: true,
    captured_clone_freeze_digest_and_introspection_primordials_required: true,
    captured_array_set_weak_map_brand_and_proxy_primordials_required: true,
    captured_regex_time_numeric_and_string_primordials_required: true,
    implicit_array_iterator_for_canonical_validation_forbidden: true,
    strict_locale_independent_canonical_string_order_required: true,
    post_import_primordial_replacement_contained: true,
    current_main_predecessor_authorities_reconciled: true,
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
      "current_main_governed_binding_snapshot_issuance_manifest_drift",
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

test("Action 666CQ binds the exact five-file issuance foundation", async () => {
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

test("Action 666CQ rejects every authority, scope, remediation and delivery mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_governed_binding_snapshot_issuance_manifest_drift",
    );
  }
});

test("Action 666CQ excludes historical review authority and binds delivery", async () => {
  const rebuild = (
    await source(
      "docs/action-666cq-current-main-governed-binding-snapshot-issuance-rebuild.md",
    )
  ).toString("utf8");
  expect(rebuild).toContain(
    "Historical PR #72 remains an open Draft stacked non-authority",
  );
  expect(rebuild).toContain(
    "cannot authorize this current-main rebuild",
  );
  expect(rebuild).toContain(
    "4. explicit operator approval names the PR and exact head;",
  );
  expect(rebuild).toContain("Track 2 remains open");
  expect(rebuild).toContain("Production deployment is not authorized");
  for (const historical of [
    "docs/action-666bq-governed-binding-snapshot-issuance-successor-freeze-manifest.json",
    "docs/action-666bq-governed-binding-snapshot-issuance-successor-independent-review.md",
    "docs/action-666bq-governed-binding-snapshot-issuance-successor-threat-matrix.json",
  ]) {
    expect(await exists(historical), historical).toBe(false);
  }
});

test("Action 666CQ remains server-only and absent from live consumers", async () => {
  const governedModules = [
    "lib/server/canonical-governed-binding-snapshot-issuance-successor.ts",
    "lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures.ts",
  ];
  for (const modulePath of governedModules) {
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
    if (governedModules.includes(candidate)) continue;
    const content = (await source(candidate)).toString("utf8");
    if (
      content.includes(
        "@/lib/server/canonical-governed-binding-snapshot-issuance-successor",
      )
    ) {
      consumers.push(candidate);
    }
  }
  expect(consumers).toEqual([]);
});
