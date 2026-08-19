import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cv-current-main-private-atomic-observation-authority/foundation-freeze-manifest.json";
const manifestSha256 =
  "cdb95c685404050aaa37b03d771698cc3171619cd50dba302856b1046d3a8527";

const expectedManifest = {
  schema_version:
    "action_666cv_current_main_private_atomic_observation_authority_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "8eb9c57c83d449042515e5184bae136bb6d827d0",
    candidate_base_tree: "7b04bdc7152f113258e9011f0c0629dc9fdb1b33",
    candidate_base_exact_main_ci_run: 31976441550,
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
    authority_version: "canonical_private_atomic_observation_authority_v2",
    evidence_version: "canonical_private_atomic_observation_evidence_v2",
    result_version: "canonical_private_atomic_observation_result_v2",
    readback_version: "canonical_private_atomic_observation_readback_v2",
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "86a71c7408066a762336851a74507a92e8bf83c306954687a2baa69b26fbdd55",
    artifacts: [
      {
        path:
          "docs/action-666cv-current-main-private-atomic-observation-authority.md",
        sha256:
          "b60b83784704cb9845911e54945ce9e9b80b44149a505f3202b9b88212709d78",
      },
      {
        path:
          "docs/action-666cv-golden-private-atomic-observation-report.json",
        sha256:
          "dcdde2a489553ccb010e926cebfca88c36ce96fcd80c7b906c2bba313a0da83e",
      },
      {
        path:
          "lib/server/canonical-private-atomic-observation-authority-fixtures.ts",
        sha256:
          "e37ab8493163ae1c738119d66c18559b736fed5150704a307d206b053b5a46ae",
      },
      {
        path: "lib/server/canonical-private-atomic-observation-authority.ts",
        sha256:
          "c15b35d813f80a7b3d89d6b6cca289320879cc807056a5d05bae1a5021ccf576",
      },
      {
        path:
          "tests/e2e/action-666cv-current-main-private-atomic-observation-authority.spec.ts",
        sha256:
          "0872ebe2ffbed83bf71a4329615e19f916359a6fa682f21a4288e4bb54fda1ac",
      },
    ],
  },
  trust_boundary: {
    literal_default_off_gate_required: true,
    literal_kill_switch_clear_required: true,
    exact_action_666cu_originating_result_authority_required: true,
    private_atomic_capsule_mint_required: true,
    private_weak_map_lookup_before_capsule_introspection: true,
    exact_originating_session_required: true,
    private_capsule_object_exposure_forbidden: true,
    source_capsule_object_exposure_forbidden: true,
    private_result_shell_identity_required: true,
    private_result_rebuild_required: true,
    exact_result_deep_equality_required: true,
    result_clone_or_copy_authority_forbidden: true,
    cross_harness_result_authority_forbidden: true,
    proxy_or_accessor_candidate_introspection_allowed: false,
    readback_string_or_genuine_uint8array_only: true,
    readback_max_utf8_bytes: 65_536,
    readback_exact_canonical_bytes_required: true,
    readback_duplicate_keys_forbidden: true,
    readback_provenance_authority_forbidden: true,
    readback_integrity_only_required: true,
    captured_reflection_collection_freeze_json_text_and_typed_array_primordials_required:
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
    delivered_predecessor: "666CU",
    candidate_action: "666CV",
    next_bounded_objective_if_delivered:
      "current_main_integrity_provenance_separated_observation_authority_successor",
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
    throw new Error("current_main_private_atomic_observation_manifest_drift");
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

test("Action 666CV binds the exact five-file private atomic foundation", async () => {
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

test("Action 666CV rejects every manifest mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_private_atomic_observation_manifest_drift",
    );
  }
});

test("Action 666CV binds historical non-authority and delivery boundaries", async () => {
  const contract = (
    await source(
      "docs/action-666cv-current-main-private-atomic-observation-authority.md",
    )
  ).toString("utf8");
  expect(contract).toContain(
    "Historical PR #72 remains an open Draft stacked non-authority.",
  );
  expect(contract).toContain("design evidence only");
  expect(contract).toContain(
    "Persisted bytes cannot preserve module-private `WeakMap` or harness-session",
  );
  expect(contract).toContain(
    "4. explicit operator approval names the PR and exact head;",
  );
  expect(contract).toContain(
    "Production deployment, provider action and database action are not authorized.",
  );
  for (const historical of [
    "docs/action-666cb-private-atomic-observation-authority.md",
    "docs/action-666cb-golden-private-atomic-observation-report.json",
    "tests/e2e/action-666cb-private-atomic-observation-authority.spec.ts",
  ]) {
    expect(await exists(historical), historical).toBe(false);
  }
});

test("Action 666CV remains server-only, provider-free and runtime-unwired", async () => {
  const governedModules = [
    "lib/server/canonical-private-atomic-observation-authority.ts",
    "lib/server/canonical-private-atomic-observation-authority-fixtures.ts",
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
        "@/lib/server/canonical-private-atomic-observation-authority",
      )
    ) {
      consumers.push(candidate);
    }
  }
  expect(consumers.sort()).toEqual([
    "lib/server/canonical-integrity-provenance-separated-observation-authority-fixtures.ts",
    "lib/server/canonical-integrity-provenance-separated-observation-authority.ts",
  ]);
  const registration = (
    await source("scripts/action-660j-provider-free-ci-registration.json")
  ).toString("utf8");
  expect(registration).toContain(
    "tests/e2e/action-666cv-current-main-private-atomic-observation-authority.spec.ts",
  );
  expect(registration).toContain(
    "tests/e2e/action-666cv-current-main-private-atomic-observation-authority-freeze.spec.ts",
  );
});
