import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cj-current-main-predictive-explanation/foundation-freeze-manifest.json";
const manifestSha256 = "c73ffa446362d00fe7c6958d0a85129a5a72f76a95b6e0f7c720f772aab534f2";

const expectedManifest = {
  schema_version:
    "action_666cj_current_main_predictive_explanation_foundation_freeze_v1",
  authority: {
    repository: "willyvalentin/trade",
    candidate_base_commit: "a8a4990a81aa30484caf6112d0810161c1e86214",
    candidate_base_tree: "259d7920a6957fdc3503c0a3783007c3a958b005",
    historical_source_pull_request: 54,
    historical_source_head: "3f2d436d4edfe178519d908bb5bc473eea3a3fb4",
    historical_review_authority_reused: false,
  },
  foundation: {
    contract_version: "canonical_predictive_outcome_explanation_v1",
    normative_artifact_count: 5,
    aggregate_algorithm: "sha256 over sorted lines '<path>  <sha256>\\n'",
    aggregate_sha256:
      "ae4bf036814f076f5cc6a0ca08e7fc992e75cffaf847a2ca8a4db649c7a189ea",
    artifacts: [
      {
        path: "docs/action-666m-golden-predictive-explanation-report.json",
        sha256:
          "11ade6e4ab516f5e344826328eeb97985a4e6f7e143a2887119cca2fa125bf56",
      },
      {
        path: "docs/action-666m-predictive-outcome-explanation.md",
        sha256:
          "8e00a3b7b437ae6c9cc4a26c6c34f9d744072aed4b9d977900c17078759eeaa8",
      },
      {
        path:
          "lib/server/canonical-predictive-outcome-explanation-fixtures.ts",
        sha256:
          "90853c06565fca6b9f9e42307542e3de231d55d6f1a6607366c2d818b47db4c8",
      },
      {
        path: "lib/server/canonical-predictive-outcome-explanation.ts",
        sha256:
          "667e1623658700754da095aef04b864c54b36a117f13b23977c4e4bf63d25bd0",
      },
      {
        path:
          "tests/e2e/action-666m-predictive-outcome-explanation.spec.ts",
        sha256:
          "8f38f4cf490795882660912de7e1e9ccbdc7fb7c8f44464fa4078417b4ddd15d",
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
    broker_or_execution_authority_added: false,
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

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function validateManifest(value: unknown) {
  if (!isDeepStrictEqual(value, expectedManifest)) {
    throw new Error("current_main_freeze_manifest_drift");
  }
}

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath));
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

test("Action 666CJ binds the exact five-file foundation to current main", async () => {
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
  expect(
    sha256([...artifactLines].sort().join("")),
  ).toBe(expectedManifest.foundation.aggregate_sha256);
});

test("Action 666CJ manifest rejects authority, scope and delivery drift", () => {
  const mutations: unknown[] = [];
  const clone = (): {
    schema_version: string;
    authority: Record<string, unknown>;
    foundation: {
      contract_version: string;
      normative_artifact_count: number;
      aggregate_algorithm: string;
      aggregate_sha256: string;
      artifacts: Array<{ path: string; sha256: string }>;
    };
    scope: Record<string, boolean>;
    delivery: Record<string, boolean>;
  } =>
    JSON.parse(JSON.stringify(expectedManifest)) as {
      schema_version: string;
      authority: Record<string, unknown>;
      foundation: {
        contract_version: string;
        normative_artifact_count: number;
        aggregate_algorithm: string;
        aggregate_sha256: string;
        artifacts: Array<{ path: string; sha256: string }>;
      };
      scope: Record<string, boolean>;
      delivery: Record<string, boolean>;
    };

  const extraTopLevel = clone() as Record<string, unknown>;
  extraTopLevel.unexpected = true;
  mutations.push(extraTopLevel);

  const changedBase = clone();
  changedBase.authority.candidate_base_commit = "0".repeat(40);
  mutations.push(changedBase);

  const reusedReview = clone();
  reusedReview.authority.historical_review_authority_reused = true;
  mutations.push(reusedReview);

  const missingArtifact = clone();
  missingArtifact.foundation.artifacts.pop();
  mutations.push(missingArtifact);

  const reorderedArtifacts = clone();
  reorderedArtifacts.foundation.artifacts.reverse();
  mutations.push(reorderedArtifacts);

  const changedArtifact = clone();
  changedArtifact.foundation.artifacts[0].sha256 = "0".repeat(64);
  mutations.push(changedArtifact);

  for (const key of [
    "live_consumer_added",
    "database_or_provider_access_added",
    "persistence_or_migration_added",
    "ranking_or_model_promotion_added",
    "broker_or_execution_authority_added",
  ] as const) {
    const changedScope = clone();
    changedScope.scope[key] = true;
    mutations.push(changedScope);
  }

  for (const key of Object.keys(expectedManifest.delivery)) {
    const changedDelivery = clone();
    changedDelivery.delivery[key] = !expectedManifest.delivery[
      key as keyof typeof expectedManifest.delivery
    ];
    mutations.push(changedDelivery);
  }

  for (const mutation of mutations) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_freeze_manifest_drift",
    );
  }
});

test("Action 666CJ remains server-only and absent from live consumers", async () => {
  const implementation = (
    await source("lib/server/canonical-predictive-outcome-explanation.ts")
  ).toString("utf8");
  const fixtures = (
    await source(
      "lib/server/canonical-predictive-outcome-explanation-fixtures.ts",
    )
  ).toString("utf8");

  expect(implementation.startsWith('import "server-only";')).toBe(true);
  expect(fixtures.startsWith('import "server-only";')).toBe(true);
  expect(implementation).not.toMatch(
    /@supabase|createClient|fetch\(|process\.env|child_process|app\/api/,
  );

  const candidates = (
    await Promise.all(["app", "components", "lib"].map(sourceFiles))
  ).flat();
  const consumers: string[] = [];
  for (const candidate of candidates) {
    const content = (await source(candidate)).toString("utf8");
    if (content.includes("canonical-predictive-outcome-explanation")) {
      consumers.push(candidate);
    }
  }
  expect(consumers.sort()).toEqual([
    "lib/server/canonical-predictive-outcome-explanation-fixtures.ts",
    "lib/server/canonical-predictive-outcome-explanation.ts",
  ]);
});
