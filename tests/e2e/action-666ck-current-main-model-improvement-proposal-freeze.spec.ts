import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666ck-current-main-model-improvement-proposal/foundation-freeze-manifest.json";
const manifestSha256 =
  "c259f69e6c1881f10cb066d85258ebe20ad6a477d47ccb04325d1f82109bbf04";

const expectedManifest = {
  schema_version:
    "action_666ck_current_main_model_improvement_proposal_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "3daa36638f10ec9356811cb9f8e900e44bead3be",
    candidate_base_tree: "1a5dadac1b76586130850fd3437f412f9d021c4f",
    historical_source_pull_request: 55,
    historical_source_head: "785190485ebdbf3e5a17c8555fd32efd7ad9922b",
    historical_review_authority_reused: false,
    historical_evidence_artifacts_imported: false,
  },
  foundation: {
    contract_version: "canonical_model_improvement_proposal_v1",
    normative_artifact_count: 6,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "c8315d58e53d6ea98c3a64795b7bb6ad8855ce994f94f3acb861770b771a5f2b",
    artifacts: [
      {
        path: "docs/action-666v-golden-model-improvement-proposal-report.json",
        sha256:
          "c2b5abdedb18536e8f84aaa57a3c987a7ed512df77bd214f7de43debf1930262",
      },
      {
        path: "docs/action-666v-governed-model-improvement-proposal-contract.md",
        sha256:
          "c1d19f42012d46be938ac4546e83b5a01e3e772b3100f4d865f8a213474c1d75",
      },
      {
        path: "lib/server/canonical-model-improvement-proposal-fixtures.ts",
        sha256:
          "574bb11ff13c5d4d9066c7e2895c5bd2fa7f819d4704e498b90b4544453f4787",
      },
      {
        path: "lib/server/canonical-model-improvement-proposal.ts",
        sha256:
          "e7c397b1b7ed5eb924665ef7ef3930037f2860ababe94c834ecbb24e0bf148f9",
      },
      {
        path:
          "lib/server/canonical-model-improvement-upstream-verification.ts",
        sha256:
          "04a544b5433c0794f975b92bae7281a3a151da262868a46a90aca7fae70a5849",
      },
      {
        path:
          "tests/e2e/action-666v-governed-model-improvement-proposal.spec.ts",
        sha256:
          "d018f85eda1f042dd7c4ecce584cfa15fe6493faa236f166d10f51a0db68fcb0",
      },
    ],
  },
  scope: {
    server_only: true,
    synthetic_only: true,
    offline_only: true,
    default_off: true,
    live_consumer_added: false,
    database_or_provider_access_added: false,
    persistence_or_migration_added: false,
    ranking_or_model_promotion_added: false,
    experiment_execution_added: false,
    broker_or_execution_authority_added: false,
  },
  runtime_remediation: {
    literal_activation_gate_required: true,
    immutable_registry_snapshot_required: true,
    canonical_runtime_surface_required: true,
    exact_request_runtime_shape_required: true,
    structured_never_throw_failure_required: true,
    private_engine_authority_required: true,
    descriptor_safe_lookup_required: true,
    private_execution_counters_required: true,
    process_history_independent_upstream_verification_required: true,
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
    throw new Error("current_main_model_improvement_freeze_manifest_drift");
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

test("Action 666CK binds the exact six-file foundation to current main", async () => {
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

test("Action 666CK manifest rejects every authority, scope, remediation and delivery mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_model_improvement_freeze_manifest_drift",
    );
  }
});

test("Action 666CK excludes historical review authority and binds the delivery boundary", async () => {
  const rebuild = (
    await source(
      "docs/action-666ck-current-main-model-improvement-proposal-rebuild.md",
    )
  ).toString("utf8");
  expect(rebuild).toContain("PR #55 remains historical non-authority");
  expect(rebuild).toContain("No historical review, threat");
  expect(rebuild).toContain("explicit operator approval naming the PR and exact head");
  expect(rebuild).toContain("Spår 2 remains open");

  for (const historicalArtifact of [
    "docs/action-666w-improvement-foundation-freeze-manifest.json",
    "docs/action-666w-improvement-foundation-independent-review.md",
    "docs/action-666w-improvement-foundation-threat-matrix.json",
    "docs/action-666x-improvement-foundation-independent-rereview.md",
    "docs/action-666x-improvement-foundation-refreeze-manifest.json",
    "docs/action-666x-improvement-foundation-threat-matrix.json",
  ]) {
    expect(await exists(historicalArtifact), historicalArtifact).toBe(false);
  }
});

test("Action 666CK remains server-only and absent from live consumers", async () => {
  for (const modulePath of [
    "lib/server/canonical-model-improvement-proposal.ts",
    "lib/server/canonical-model-improvement-proposal-fixtures.ts",
    "lib/server/canonical-model-improvement-upstream-verification.ts",
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
    if (content.includes("canonical-model-improvement-proposal")) {
      consumers.push(candidate);
    }
  }
  expect(consumers.sort()).toEqual([
    "lib/server/canonical-completed-improvement-evidence-capture-fixtures.ts",
    "lib/server/canonical-completed-improvement-evidence-capture.ts",
    "lib/server/canonical-governed-binding-snapshot-admission-fixtures.ts",
    "lib/server/canonical-governed-binding-snapshot-admission.ts",
    "lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures.ts",
    "lib/server/canonical-governed-improvement-end-to-end-replay-fixtures.ts",
    "lib/server/canonical-governed-improvement-end-to-end-replay.ts",
    "lib/server/canonical-improvement-binding-store-fixtures.ts",
    "lib/server/canonical-improvement-binding-store.ts",
    "lib/server/canonical-model-improvement-input-adapter-fixtures.ts",
    "lib/server/canonical-model-improvement-input-adapter.ts",
    "lib/server/canonical-model-improvement-proposal-fixtures.ts",
    "lib/server/canonical-model-improvement-proposal.ts",
  ]);
});
