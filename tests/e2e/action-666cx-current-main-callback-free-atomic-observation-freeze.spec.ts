import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cx-current-main-callback-free-atomic-observation/foundation-freeze-manifest.json";
const manifestSha256 =
  "da85813eb7842bf792de3c65f06be537f16c002ec66ab83edb371d99a3a2ecbd";

const expectedManifest = {
  schema_version:
    "action_666cx_current_main_callback_free_atomic_observation_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "960b88f85f3ad7be10c4b848c40127d63a21390b",
    candidate_base_tree: "40b6384cfe95ee8a9e46980d5a5f861f6dc062a1",
    candidate_base_exact_main_ci_run: 32196042641,
    delivered_predecessor: "666CW",
    delivered_predecessor_pull_request: 115,
    delivered_predecessor_head: "e86f2d7bd6a4ff8674fdad8e4d9d01e04e4a71b4",
    historical_design_pull_request: 72,
    historical_design_head: "40155d6b5bf03cb8e3ed2207f4f771d62b6f6937",
    historical_design_authority_reused: false,
    historical_evidence_artifacts_imported: false,
    historical_successor_chain_imported: false,
    fresh_current_main_review_required: true,
  },
  foundation: {
    authority_version: "canonical_callback_free_atomic_observation_v2",
    readback_version: "canonical_callback_free_atomic_observation_readback_v2",
    predecessor_public_envelope_version:
      "canonical_integrity_provenance_separated_observation_envelope_v2",
    max_input_bytes: 65536,
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "53e09d81e737f197e40ee470f1f7690f1dc6a7e3c2409b895d3e62ad0ec4ae36",
    artifacts: [
      {
        path: "docs/action-666cx-current-main-callback-free-atomic-observation.md",
        sha256:
          "7227c00ac4bd0f5405bc4d67289aefd0dd7700672b23aeb9ccab513b8820789a",
      },
      {
        path: "docs/action-666cx-golden-callback-free-atomic-observation-report.json",
        sha256:
          "6f6a7b0675d5b969e7b29f4d11269d1af107735ccf493bb3524e91959205e352",
      },
      {
        path: "lib/server/canonical-callback-free-atomic-observation-fixtures.ts",
        sha256:
          "c552a0ade3525224e9c1708067b6bdf10eb810c25dcd37b00f1fe62084586740",
      },
      {
        path: "lib/server/canonical-callback-free-atomic-observation.ts",
        sha256:
          "5c16e16e72291b629e0149b560a46c3fe89871b841e17222908afa308d8fe9e2",
      },
      {
        path: "tests/e2e/action-666cx-current-main-callback-free-atomic-observation.spec.ts",
        sha256:
          "3a98141651dc152c37ee3905a6d83778003b285e7b73179c0302296f235feb5c",
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
    predecessor_runtime_authority_construction_forbidden: true,
    private_capsule_access_forbidden: true,
    string_or_exact_uint8array_only: true,
    max_utf8_bytes: 65536,
    single_internal_byte_snapshot_required: true,
    captured_intrinsics_required: true,
    canonical_666cw_public_envelope_required: true,
    public_envelope_provenance_verified_forbidden: true,
    public_envelope_trusted_forbidden: true,
    public_envelope_admitted_forbidden: true,
    self_consistent_public_forgery_integrity_only_required: true,
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
    candidate_action: "666CX",
    delivered_predecessor: "666CW",
    next_bounded_objective_if_delivered:
      "fresh_current_main_lossless_immutable_byte_snapshot_successor",
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
    action_660j_observation_shard_registration_required: true,
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
    throw new Error("current_main_callback_free_atomic_observation_manifest_drift");
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

test("Action 666CX binds the exact five-file callback-free foundation", async () => {
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

test("Action 666CX rejects every manifest mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_callback_free_atomic_observation_manifest_drift",
    );
  }
});

test("Action 666CX binds its fresh current-main and non-authority boundaries", async () => {
  const contract = (
    await source("docs/action-666cx-current-main-callback-free-atomic-observation.md")
  ).toString("utf8");
  expect(contract).toContain("`960b88f85f3ad7be10c4b848c40127d63a21390b`");
  expect(contract).toContain("`32196042641`");
  expect(contract).toContain("Historical PR #72 remains open Draft stacked non-authority.");
  expect(contract).toContain("design context only");
  expect(contract).toContain("No production deployment, provider action, database action or Supabase action");
  for (const historical of [
    "docs/action-666cf-callback-free-atomic-observation.md",
    "docs/action-666cf-golden-callback-free-atomic-observation-report.json",
    "tests/e2e/action-666cf-callback-free-atomic-observation.spec.ts",
  ]) {
    expect(await exists(historical), historical).toBe(false);
  }
});

test("Action 666CX remains server-only, consumer-free and isolated from Action 660J", async () => {
  const governedModules = [
    "lib/server/canonical-callback-free-atomic-observation.ts",
    "lib/server/canonical-callback-free-atomic-observation-fixtures.ts",
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
  const directSource = (
    await source("lib/server/canonical-callback-free-atomic-observation.ts")
  ).toString("utf8");
  expect(directSource).not.toMatch(
    /canonical-integrity-provenance-separated-observation|createCanonical|read_request|trust_callback|dependencies|harness/,
  );
  const candidates = (
    await Promise.all(["app", "components", "lib"].map(sourceFiles))
  ).flat();
  const consumers: string[] = [];
  for (const candidate of candidates) {
    if (governedModules.includes(candidate)) continue;
    const content = (await source(candidate)).toString("utf8");
    if (content.includes("@/lib/server/canonical-callback-free-atomic-observation")) {
      consumers.push(candidate);
    }
  }
  expect(consumers).toEqual([]);
});
