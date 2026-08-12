import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cm-current-main-completed-improvement-evidence-capture/foundation-freeze-manifest.json";
const manifestSha256 =
  "8069ea429b074a8a530d31b0daf30fe0fc2c0bc2d2b79233c708a97f2fdde29b";

const expectedManifest = {
  schema_version:
    "action_666cm_current_main_completed_improvement_evidence_capture_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "7bdb119f45293a7d237aeb879c1f3ec9160a230f",
    candidate_base_tree: "6d8e90469e16da210720948fd9c09cd6e002a1a4",
    historical_source_pull_request: 58,
    historical_source_head: "df644a2df08db4baa62b172ef578df868af5bf04",
    historical_review_authority_reused: false,
    historical_evidence_artifacts_imported: false,
  },
  foundation: {
    contract_version: "canonical_completed_improvement_evidence_capture_v2",
    request_version:
      "canonical_completed_improvement_evidence_capture_request_v1",
    terminal_result_version:
      "canonical_completed_improvement_terminal_result_v1",
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "6e35b56435ef0f416fc459e66dcedcac5fe1cc011869fe4833b37a1d4e3921ee",
    artifacts: [
      {
        path: "docs/action-666aj-completed-improvement-evidence-capture.md",
        sha256:
          "a9fee24ccd46416d7460d0522beb98e6f147e588f7309911f97181d590cc5df0",
      },
      {
        path:
          "docs/action-666aj-golden-completed-improvement-capture-report.json",
        sha256:
          "9f65ad9f14cb65c02344ec48a81632fe86073bef422ec08d758d52b5d634bc30",
      },
      {
        path:
          "lib/server/canonical-completed-improvement-evidence-capture-fixtures.ts",
        sha256:
          "8dd0321139ba7a2c7dd25a7c7efcd8f5f99b91aaa3418762af92ca627cf322ce",
      },
      {
        path: "lib/server/canonical-completed-improvement-evidence-capture.ts",
        sha256:
          "aacb1418496327951ab895185af9ccbad74c30c0163b67ca8c35f3834060a926",
      },
      {
        path:
          "tests/e2e/action-666aj-completed-improvement-evidence-capture.spec.ts",
        sha256:
          "119a153d2e9ff2c802be8d83877d9fbcb124e061eeff6b452364e086f519313f",
      },
    ],
  },
  scope: {
    server_only: true,
    synthetic_only: true,
    fixture_only: true,
    read_only: true,
    default_off: true,
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
    canonical_recursive_runtime_surface_required: true,
    exact_option_dependency_request_and_result_shapes_required: true,
    module_recognized_registry_authority_preserved_in_snapshot: true,
    construction_time_authority_and_lookup_snapshot_required: true,
    descriptor_safe_lookup_and_return_validation_required: true,
    private_execution_counters_required: true,
    private_frozen_capture_harness_authority_required: true,
    malformed_request_capture_authority_forbidden: true,
    request_and_result_cloneability_required: true,
    exact_authority_registry_post_and_payload_reconstruction_required: true,
    empty_authority_array_element_contract_preserved: true,
    predecessor_consumer_oracle_reconciled: true,
    structured_never_throw_failure_required: true,
    recursive_adversarial_cross_verification_required: true,
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
      "current_main_completed_improvement_evidence_capture_freeze_manifest_drift",
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

test("Action 666CM binds the exact five-file capture foundation to current main", async () => {
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

test("Action 666CM rejects every authority, scope, remediation and delivery mutation", () => {
  const mutations = mutationMatrix(cloneManifest());
  expect(mutations.length).toBeGreaterThan(100);
  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_completed_improvement_evidence_capture_freeze_manifest_drift",
    );
  }
});

test("Action 666CM excludes historical review authority and binds delivery", async () => {
  const rebuild = (
    await source(
      "docs/action-666cm-current-main-completed-improvement-evidence-capture-rebuild.md",
    )
  ).toString("utf8");
  expect(rebuild).toContain("PR #58 remains historical non-authority");
  expect(rebuild).toContain("No historical freeze or review artifact");
  expect(rebuild).toContain(
    "explicit operator approval naming the PR and exact head",
  );
  expect(rebuild).toContain("Spår 2 remains open");

  for (const historicalArtifact of [
    "docs/action-666ak-completed-evidence-capture-foundation-freeze-manifest.json",
    "docs/action-666ak-completed-evidence-capture-independent-review.md",
    "docs/action-666al-completed-evidence-capture-foundation-refreeze-manifest.json",
    "docs/action-666al-completed-evidence-capture-independent-rereview.md",
  ]) {
    expect(await exists(historicalArtifact), historicalArtifact).toBe(false);
  }
});

test("Action 666CM remains server-only and absent from live consumers", async () => {
  for (const modulePath of [
    "lib/server/canonical-completed-improvement-evidence-capture.ts",
    "lib/server/canonical-completed-improvement-evidence-capture-fixtures.ts",
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
    if (content.includes("canonical-completed-improvement-evidence-capture")) {
      consumers.push(candidate);
    }
  }
  expect(consumers.sort()).toEqual([
    "lib/server/canonical-completed-improvement-evidence-capture-fixtures.ts",
    "lib/server/canonical-governed-improvement-end-to-end-replay-fixtures.ts",
    "lib/server/canonical-governed-improvement-end-to-end-replay.ts",
  ]);
});
