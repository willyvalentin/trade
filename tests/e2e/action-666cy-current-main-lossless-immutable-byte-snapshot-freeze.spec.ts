import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cy-current-main-lossless-immutable-byte-snapshot/foundation-freeze-manifest.json";
const manifestSha256 =
  "98046ffd517cb5a5e03587712cc8d5cb22d333765a09e22c68535577f2aa9f4e";

const expectedManifest = {
  schema_version:
    "action_666cy_current_main_lossless_immutable_byte_snapshot_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "377b87d344ddb48d73c725b348d1dcb4c0943fd1",
    candidate_base_tree: "7b8c529ecabfe367ccba3ec27629f02b8c5d4c44",
    candidate_base_exact_main_ci_run: 32261552249,
    delivered_predecessor: "666CX",
    delivered_predecessor_pull_request: 117,
    delivered_predecessor_head: "69ad10078a2f5a987c7a8df410d233e25bbe5e18",
    historical_design_pull_request: 72,
    historical_design_head: "40155d6b5bf03cb8e3ed2207f4f771d62b6f6937",
    historical_design_authority_reused: false,
    historical_evidence_artifacts_imported: false,
    historical_successor_chain_imported: false,
    fresh_current_main_review_required: true,
  },
  foundation: {
    snapshot_contract_version:
      "canonical_lossless_immutable_byte_snapshot_v2",
    raw_byte_observation_version: "canonical_raw_byte_observation_v2",
    readback_version: "canonical_lossless_immutable_byte_readback_v2",
    predecessor_public_envelope_version:
      "canonical_integrity_provenance_separated_observation_envelope_v2",
    max_input_bytes: 65536,
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "4e329bea9b7f1269f3444ec9d23df0e147947649beb012f5c69c84bf0bc6613a",
    artifacts: [
      {
        path: "docs/action-666cy-current-main-lossless-immutable-byte-snapshot.md",
        sha256:
          "60f369641a34049667d7d42d47199ddb9405dabc228eb8e32769807525168dae",
      },
      {
        path: "docs/action-666cy-golden-lossless-immutable-byte-snapshot-report.json",
        sha256:
          "c890eaf53194625f18f180e6d75ed8903e2113c9336f9c870bc8536a7bc3c843",
      },
      {
        path: "lib/server/canonical-lossless-immutable-byte-snapshot-fixtures.ts",
        sha256:
          "614dfa99325ab90d35ea9df5e6fb99de8dd371dd0d68654823174c65ead3395a",
      },
      {
        path: "lib/server/canonical-lossless-immutable-byte-snapshot.ts",
        sha256:
          "6139a2867ecfe635cd8fa68175b27ce5de8de3f8724f9dc19f75eed94fe52763",
      },
      {
        path: "tests/e2e/action-666cy-current-main-lossless-immutable-byte-snapshot.spec.ts",
        sha256:
          "136224694f9c77ab0ea79ec1ac8c6ff13fbaeeb90c90a75271674dc37184cd07",
      },
    ],
  },
  trust_boundary: {
    literal_default_off_gate_required: true,
    literal_kill_switch_clear_required: true,
    direct_entry_has_no_request_reader: true,
    direct_entry_has_no_dependency_shell: true,
    direct_entry_has_no_harness_or_factory: true,
    direct_entry_has_no_trust_hook_or_upgrade_path: true,
    string_or_exact_direct_uint8array_only: true,
    fixed_ordinary_array_buffer_required: true,
    shared_resizable_detached_proxy_subclass_cross_realm_rejected: true,
    max_input_bytes: 65536,
    single_private_byte_snapshot_required: true,
    byte_budget_preflight_before_copy_required: true,
    raw_byte_hash_before_decode_or_parse_required: true,
    distinct_invalid_byte_identity_required: true,
    captured_intrinsics_required: true,
    canonical_666cx_public_envelope_required: true,
    public_envelope_provenance_verified_forbidden: true,
    public_envelope_trusted_forbidden: true,
    public_envelope_admitted_forbidden: true,
    self_consistent_public_replacement_integrity_only_required: true,
    structured_never_throw_failure_required: true,
  },
  scope: {
    server_only: true,
    synthetic_only: true,
    fixture_only: true,
    read_only: true,
    default_off: true,
    runtime_unwired: true,
    live_consumer_added: false,
    provider_or_database_access_added: false,
    persistence_or_migration_added: false,
    ranking_or_model_effect_added: false,
    training_or_promotion_added: false,
    broker_or_execution_authority_added: false,
    workflow_integration_owned_by_action_660j: true,
    roadmap_or_ledger_reconciliation_deferred: true,
  },
  roadmap: {
    candidate_action: "666CY",
    delivered_predecessor: "666CX",
    next_bounded_objective_if_delivered:
      "fresh_current_main_snapshot_authority_successor",
    track_2_complete_if_delivered: false,
    milestone_credit_awarded: false,
  },
  delivery: {
    candidate_merge_authorized: false,
    production_deployment_authorized: false,
    provider_or_database_action_authorized: false,
    exact_head_ci_required: true,
    independent_current_head_review_required: true,
    operator_approval_of_pr_and_exact_head_required: true,
    ordinary_pull_request_merge_required: true,
    exact_main_ci_required: true,
    action_660j_replay_lineage_shard_registration_required: true,
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
    throw new Error("current_main_lossless_immutable_byte_snapshot_manifest_drift");
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

test("Action 666CY binds the exact five-file immutable snapshot foundation", async () => {
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

test("Action 666CY rejects every manifest mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_lossless_immutable_byte_snapshot_manifest_drift",
    );
  }
});

test("Action 666CY binds fresh current-main and historical non-authority", async () => {
  const contract = (
    await source("docs/action-666cy-current-main-lossless-immutable-byte-snapshot.md")
  ).toString("utf8");
  expect(contract).toContain("`377b87d344ddb48d73c725b348d1dcb4c0943fd1`");
  expect(contract).toContain("`32261552249`");
  expect(contract).toContain("Historical PR #72 is non-authority design context only.");
  expect(contract).toContain("No production deployment is authorized.");
  for (const historical of [
    "docs/action-666ci-lossless-immutable-byte-snapshot.md",
    "docs/action-666ci-golden-lossless-immutable-byte-snapshot-report.json",
    "tests/e2e/action-666ci-lossless-immutable-byte-snapshot.spec.ts",
  ]) {
    expect(await exists(historical), historical).toBe(false);
  }
});

test("Action 666CY remains server-only, consumer-free and registered with Action 660J", async () => {
  const governedModules = [
    "lib/server/canonical-lossless-immutable-byte-snapshot.ts",
    "lib/server/canonical-lossless-immutable-byte-snapshot-fixtures.ts",
  ];
  for (const modulePath of governedModules) {
    const moduleSource = (await source(modulePath)).toString("utf8");
    expect(moduleSource.startsWith('import "server-only";'), modulePath).toBe(
      true,
    );
    expect(moduleSource, modulePath).not.toMatch(
      /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|@supabase|createClient|fetch\(|process\.env|child_process|app\/api/,
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
        "@/lib/server/canonical-lossless-immutable-byte-snapshot",
      )
    ) {
      consumers.push(candidate);
    }
  }
  expect(consumers.sort()).toEqual([
    "lib/server/canonical-lossless-immutable-byte-snapshot-authority-fixtures.ts",
    "lib/server/canonical-lossless-immutable-byte-snapshot-authority.ts",
  ]);
  const registration = JSON.parse(
    (
      await source("scripts/action-660j-provider-free-ci-registration.json")
    ).toString("utf8"),
  ) as string[];
  for (const testPath of [
    "tests/e2e/action-666cy-current-main-lossless-immutable-byte-snapshot.spec.ts",
    "tests/e2e/action-666cy-current-main-lossless-immutable-byte-snapshot-freeze.spec.ts",
  ]) {
    expect(registration.filter((entry) => entry === testPath)).toHaveLength(1);
  }
});
