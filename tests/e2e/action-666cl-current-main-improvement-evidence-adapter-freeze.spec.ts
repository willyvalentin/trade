import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cl-current-main-improvement-evidence-adapter/foundation-freeze-manifest.json";
const manifestSha256 =
  "b17da4dcdc9390cb7c7224dac784c5b953b11cddf592c006c396675ed5738bc5";

const expectedManifest = {
  schema_version:
    "action_666cl_current_main_improvement_evidence_adapter_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "0318046d6e0350694b07ab4f35c491841d3e723b",
    candidate_base_tree: "801bc80ae5f606f81c89cc65cab729a50f850d52",
    historical_source_pull_request: 57,
    historical_source_head: "e264715d2390574c639289ab0068acbf0387899c",
    historical_normative_child: "e87bb62198b54143ea9d3456a1d7872dc81d8871",
    historical_review_authority_reused: false,
    historical_evidence_artifacts_imported: false,
  },
  foundation: {
    contract_version: "canonical_completed_improvement_evidence_adapter_v2",
    replay_version: "canonical_improvement_proposal_replay_v2",
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "a73d3b0020e5ca877dafcef1e50b2f92cdf98c75b45d98bacc3a566a8bce5dfb",
    artifacts: [
      {
        path: "docs/action-666ac-completed-improvement-evidence-adapter.md",
        sha256:
          "89b71a9bd45a54f07cd299841ec84b37b4f15157a7356c2db83818fb7d80208c",
      },
      {
        path: "docs/action-666ac-golden-improvement-adapter-report.json",
        sha256:
          "0788a3a40b516d4ef9d90778806e1bae6c774014a1b8c26bcd76dbbe403a2861",
      },
      {
        path:
          "lib/server/canonical-model-improvement-input-adapter-fixtures.ts",
        sha256:
          "1bc228df668777fbf8d34dc966f472d518dd0cf4db73570ca7bc46bbf898071e",
      },
      {
        path: "lib/server/canonical-model-improvement-input-adapter.ts",
        sha256:
          "ae2d5151fa50ad4b5fa63a95fa1802595ae203b9c6b6d2baec7e1cb3eeefe864",
      },
      {
        path:
          "tests/e2e/action-666ac-completed-improvement-evidence-adapter.spec.ts",
        sha256:
          "e30ba0b48b796de5d2b1a1d9ad4f6a264af486dc7053e21f7be1ccdc6f514c8e",
      },
    ],
  },
  scope: {
    server_only: true,
    synthetic_only: true,
    fixture_only: true,
    offline_only: true,
    read_only: true,
    default_off: true,
    live_consumer_added: false,
    database_or_provider_access_added: false,
    persistence_or_migration_added: false,
    ranking_or_model_effect_added: false,
    experiment_execution_added: false,
    broker_or_execution_authority_added: false,
  },
  runtime_remediation: {
    literal_activation_gate_required: true,
    canonical_runtime_surface_required: true,
    exact_option_dependency_and_request_shapes_required: true,
    module_recognized_registry_authority_preserved_in_snapshot: true,
    construction_time_lookup_snapshot_required: true,
    descriptor_safe_lookup_and_return_validation_required: true,
    private_execution_counters_required: true,
    private_frozen_replay_harness_authority_required: true,
    structured_never_throw_failure_required: true,
  },
  delivery: {
    historical_pull_request_merge_authorized: false,
    candidate_merge_authorized: false,
    deployment_authorized: false,
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
      "current_main_improvement_evidence_adapter_freeze_manifest_drift",
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
    for (let index = 0; index < value.length; index += 1) {
      mutations.push(...mutationMatrix(root, [...pathToValue, index]));
    }
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
  const parentPath = pathToValue.slice(0, -1);
  const key = pathToValue.at(-1);
  const parent = readAt(changed, parentPath);
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

test("Action 666CL binds the exact five-file adapter foundation to current main", async () => {
  const rawManifest = await source(manifestPath);
  expect(sha256(rawManifest)).toBe(manifestSha256);

  const manifest: unknown = JSON.parse(rawManifest.toString("utf8"));
  validateManifest(manifest);

  const artifactLines = await Promise.all(
    expectedManifest.foundation.artifacts.map(async (artifact) => {
      const bytes = await source(artifact.path);
      expect(sha256(bytes), artifact.path).toBe(artifact.sha256);
      return `${artifact.path}  ${artifact.sha256}\n`;
    }),
  );
  expect(sha256([...artifactLines].sort().join(""))).toBe(
    expectedManifest.foundation.aggregate_sha256,
  );
});

test("Action 666CL rejects every authority, scope, remediation and delivery mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_improvement_evidence_adapter_freeze_manifest_drift",
    );
  }
});

test("Action 666CL excludes historical review authority and binds delivery", async () => {
  const rebuild = (
    await source(
      "docs/action-666cl-current-main-improvement-evidence-adapter-rebuild.md",
    )
  ).toString("utf8");
  expect(rebuild).toContain("PR #57 remains historical non-authority");
  expect(rebuild).toContain("No historical freeze or review artifact");
  expect(rebuild).toContain(
    "explicit operator approval naming the PR and exact head",
  );
  expect(rebuild).toContain("Spår 2 remains open");

  for (const historicalArtifact of [
    "docs/action-666ad-improvement-adapter-foundation-freeze-manifest.json",
    "docs/action-666ad-independent-review.md",
    "docs/action-666ae-improvement-adapter-foundation-refreeze-manifest.json",
    "docs/action-666ae-improvement-adapter-independent-rereview.md",
  ]) {
    expect(await exists(historicalArtifact), historicalArtifact).toBe(false);
  }
});

test("Action 666CL remains server-only and absent from live consumers", async () => {
  for (const modulePath of [
    "lib/server/canonical-model-improvement-input-adapter.ts",
    "lib/server/canonical-model-improvement-input-adapter-fixtures.ts",
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
    if (content.includes("canonical-model-improvement-input-adapter")) {
      consumers.push(candidate);
    }
  }
  expect(consumers.sort()).toEqual([
    "lib/server/canonical-model-improvement-input-adapter-fixtures.ts",
  ]);
});
