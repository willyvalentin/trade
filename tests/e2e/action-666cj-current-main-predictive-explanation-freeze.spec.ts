import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cj-current-main-predictive-explanation/foundation-freeze-manifest.json";
const manifestSha256 = "ca344f617289db7dd2d65ed41722a92fe809bf6914527a403c0f8fd82458f1dc";

const expectedManifest = {
  schema_version:
    "action_666cj_current_main_predictive_explanation_foundation_freeze_v2",
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
      "9a48bf5e885a4c6f81adcc2b314f143fbfe99b26a1d47e6c1f61debf6b342dce",
    artifacts: [
      {
        path: "docs/action-666m-golden-predictive-explanation-report.json",
        sha256:
          "11ade6e4ab516f5e344826328eeb97985a4e6f7e143a2887119cca2fa125bf56",
      },
      {
        path: "docs/action-666m-predictive-outcome-explanation.md",
        sha256:
          "526268fa99c537b75f22768560b63d2c43b0853f479a9fc410e15c2d6505a5da",
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
          "739e747713132c2523c3a40a54cf8b029f2ffb786eaf7bef79a027b44fd4b57e",
      },
      {
        path:
          "tests/e2e/action-666m-predictive-outcome-explanation.spec.ts",
        sha256:
          "1248a2eb543b78557f0f45e96837949053f78a2457862d32c8217d91683b0c5b",
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
  review_remediation: {
    blocking_reviewed_head: "247223cae3649d73c966a09691cca98a24731534",
    literal_false_kill_switch_required: true,
    immutable_trust_boundary_snapshot_required: true,
    exact_recursive_runtime_shape_required: true,
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

test("Action 666CJ manifest rejects authority, remediation, scope and delivery drift", () => {
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
    review_remediation: Record<string, string | boolean>;
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
      review_remediation: Record<string, string | boolean>;
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

  const changedReviewedHead = clone();
  changedReviewedHead.review_remediation.blocking_reviewed_head = "0".repeat(40);
  mutations.push(changedReviewedHead);

  for (const key of [
    "literal_false_kill_switch_required",
    "immutable_trust_boundary_snapshot_required",
    "exact_recursive_runtime_shape_required",
    "structured_never_throw_failure_required",
  ] as const) {
    const changedRemediation = clone();
    changedRemediation.review_remediation[key] = false;
    mutations.push(changedRemediation);
  }

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
    "lib/server/canonical-model-improvement-proposal-fixtures.ts",
    "lib/server/canonical-model-improvement-proposal.ts",
    "lib/server/canonical-model-improvement-upstream-verification.ts",
    "lib/server/canonical-predictive-outcome-explanation-fixtures.ts",
    "lib/server/canonical-predictive-outcome-explanation.ts",
  ]);
});
