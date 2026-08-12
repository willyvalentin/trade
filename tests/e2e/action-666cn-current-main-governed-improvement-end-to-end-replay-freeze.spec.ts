import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cn-current-main-governed-improvement-end-to-end-replay/foundation-freeze-manifest.json";
const manifestSha256 =
  "6d5fba9e20bb2ab8fcad92d2cece124efc1128e1fb6e777957750530b6f95d68";

const expectedManifest = {
  schema_version:
    "action_666cn_current_main_governed_improvement_end_to_end_replay_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "a5aa598de7b10a36e3e026ef98df81219559a09c",
    candidate_base_tree: "929e6e3fcee63b9dcec3232e378d75f254ecba12",
    historical_source_pull_request: 60,
    historical_source_head: "1d82cb1bc45ce02e6a9f793e53c815f17e15dab7",
    historical_review_authority_reused: false,
    historical_evidence_artifacts_imported: false,
  },
  foundation: {
    contract_version:
      "canonical_governed_improvement_end_to_end_replay_v2",
    request_version:
      "canonical_governed_improvement_end_to_end_request_v1",
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "8cd918d84fcfc9017a6f21fc33c82c803f5b3dcb169a3dda1be3a44dc89d25ba",
    artifacts: [
      {
        path:
          "docs/action-666aq-golden-governed-improvement-end-to-end-report.json",
        sha256:
          "7c225f959bf07f9808acdce22b8442c791429ff0131ebc513263cef435bc56ea",
      },
      {
        path: "docs/action-666aq-governed-improvement-end-to-end-replay.md",
        sha256:
          "7cfb98298dbefe53d158325f758e93a8810a7963aa7a941d7be4aab11f686120",
      },
      {
        path:
          "lib/server/canonical-governed-improvement-end-to-end-replay-fixtures.ts",
        sha256:
          "ac55b6c9ce0ac2276fef6fc0618e45199165de67ab7ec43b6249272465ad20f0",
      },
      {
        path:
          "lib/server/canonical-governed-improvement-end-to-end-replay.ts",
        sha256:
          "f967c8096f65837851b33442458106d61b2b5ddc21d0144875d9b09c7deeed3a",
      },
      {
        path:
          "tests/e2e/action-666aq-governed-improvement-end-to-end-replay.spec.ts",
        sha256:
          "a23285c75733392b3893d7d472eaf6c0463d8922c0f666bb7e563a6711af8b77",
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
    database_or_provider_access_added: false,
    persistence_or_migration_added: false,
    ranking_or_model_effect_added: false,
    training_or_promotion_added: false,
    experiment_execution_added: false,
    broker_or_execution_authority_added: false,
  },
  runtime_remediation: {
    literal_activation_gate_required: true,
    exact_active_option_and_dependency_shells_required: true,
    construction_time_lookup_and_projection_snapshot_required: true,
    canonical_recursive_request_and_result_surface_required: true,
    mandatory_outer_request_keys_required: true,
    exact_outer_literals_and_capture_shell_required: true,
    request_and_result_cloneability_required: true,
    private_execution_counters_required: true,
    current_private_stage_verifier_authorities_required: true,
    private_frozen_end_to_end_harness_authority_required: true,
    descriptor_safe_lookup_return_validation_required: true,
    unverifiable_capture_request_rejected: true,
    predecessor_consumer_oracles_reconciled: true,
    structured_never_throw_failure_required: true,
    recursive_adversarial_cross_verification_required: true,
    exact_recursive_result_equality_required: true,
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
      "current_main_governed_improvement_end_to_end_replay_freeze_manifest_drift",
    );
  }
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
  const readAt = (value: MutableJson, pathParts: Array<string | number>) =>
    pathParts.reduce<MutableJson>((current, part) => {
      if (Array.isArray(current)) return current[part as number];
      return (current as { [key: string]: MutableJson })[part as string];
    }, value);
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
  if (typeof key === "number") (parent as MutableJson[])[key] = changedLeaf(value);
  else if (key !== undefined)
    (parent as { [key: string]: MutableJson })[key] = changedLeaf(value);
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

test("Action 666CN binds the exact five-file replay foundation to current main", async () => {
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

test("Action 666CN rejects every authority, scope, remediation and delivery mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_governed_improvement_end_to_end_replay_freeze_manifest_drift",
    );
  }
});

test("Action 666CN excludes historical review authority and binds delivery", async () => {
  const rebuild = (
    await source(
      "docs/action-666cn-current-main-governed-improvement-end-to-end-replay-rebuild.md",
    )
  ).toString("utf8");
  expect(rebuild).toContain("Historical PR #60 remains open stacked non-authority");
  expect(rebuild).toContain("cannot authorize this current-main rebuild");
  expect(rebuild).toContain(
    "explicit operator approval naming the PR and exact head",
  );
  expect(rebuild).toContain("Spår 2 remains open");
  for (const historical of [
    "docs/action-666ar-governed-improvement-end-to-end-replay-freeze-manifest.json",
    "docs/action-666ar-governed-improvement-end-to-end-replay-independent-review.md",
    "docs/action-666as-governed-improvement-end-to-end-replay-refreeze-manifest.json",
    "docs/action-666as-governed-improvement-end-to-end-replay-independent-rereview.md",
  ]) {
    expect(await exists(historical), historical).toBe(false);
  }
});

test("Action 666CN remains server-only and absent from live consumers", async () => {
  for (const modulePath of [
    "lib/server/canonical-governed-improvement-end-to-end-replay.ts",
    "lib/server/canonical-governed-improvement-end-to-end-replay-fixtures.ts",
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
    if (content.includes("canonical-governed-improvement-end-to-end-replay")) {
      consumers.push(candidate);
    }
  }
  expect(consumers.sort()).toEqual([
    "lib/server/canonical-governed-improvement-end-to-end-replay-fixtures.ts",
  ]);
});
