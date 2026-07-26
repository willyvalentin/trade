import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

type FrozenArtifact = {
  path: string;
  artifact_type: string;
  sha256: string;
  git_status: "tracked" | "untracked";
};

type FreezeManifest = {
  artifact_count: number;
  start_sha: string;
  contract_version: string;
  threshold_version: string;
  sensitivity_evidence_digest: {
    algorithm: "sha256";
    canonicalization: "JSON.stringify_in_declared_property_order";
    value: string;
  };
  manifest_digest_canonicalization: {
    algorithm: "sha256";
    before_regression: string;
    expected_after_regression: string;
  };
  artifacts: FrozenArtifact[];
  freeze_rules: {
    frozen_artifacts_must_match_sha256: boolean;
    threshold_changes_allowed: boolean;
    feature_changes_allowed: boolean;
    live_integration_allowed: boolean;
    canonical_binding_allowed: boolean;
    capture_allowed: boolean;
    persistence_allowed: boolean;
  };
};

const repositoryRoot = resolve(process.cwd());
const manifestPath = resolve(
  repositoryRoot,
  "docs/evidence/action-667c-market-context-freeze-manifest.json",
);
const manifest = JSON.parse(
  readFileSync(manifestPath, "utf8"),
) as FreezeManifest;

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return sourceFiles(path);
    return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
  });
}

test("freeze manifest hashes and untracked statuses match all nine Action 667A-B artifacts", () => {
  expect(manifest.artifact_count).toBe(9);
  expect(manifest.artifacts).toHaveLength(9);

  for (const artifact of manifest.artifacts) {
    const absolutePath = resolve(repositoryRoot, artifact.path);
    expect(sha256(readFileSync(absolutePath))).toBe(artifact.sha256);

    const porcelain = execFileSync(
      "git",
      ["status", "--porcelain", "--untracked-files=all", "--", artifact.path],
      { cwd: repositoryRoot, encoding: "utf8" },
    ).trim();
    expect(porcelain).toBe(
      artifact.git_status === "untracked" ? `?? ${artifact.path}` : "",
    );
  }
});

test("canonical manifest digest is identical before and after regression", () => {
  const digest = sha256(JSON.stringify(manifest.artifacts));

  expect(manifest.manifest_digest_canonicalization.algorithm).toBe("sha256");
  expect(digest).toBe(
    "eb0ef9eff3318b540ffc060d52d7ba118dfe98bf7303068ab01474fb92168250",
  );
  expect(manifest.manifest_digest_canonicalization.before_regression).toBe(
    digest,
  );
  expect(
    manifest.manifest_digest_canonicalization.expected_after_regression,
  ).toBe(digest);
});

test("frozen contract, threshold, and sensitivity evidence versions are exact", () => {
  const sensitivityReport = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667b-market-context-sensitivity-report.json",
      ),
      "utf8",
    ),
  ) as {
    context_version: string;
    threshold_version: string;
    evidence_digest: { algorithm: string; value: string };
  };

  expect(manifest.start_sha).toBe(
    "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33",
  );
  expect(sensitivityReport.context_version).toBe(manifest.contract_version);
  expect(sensitivityReport.threshold_version).toBe(manifest.threshold_version);
  expect(sensitivityReport.evidence_digest).toEqual(
    manifest.sensitivity_evidence_digest,
  );
  expect(manifest.sensitivity_evidence_digest.value).toBe(
    "64c636219a3f204e7b9f2dc73b221ba345f127370134afdf51512e42191487ef",
  );
});

test("freeze rules prohibit threshold, feature, integration, capture, and persistence changes", () => {
  expect(manifest.freeze_rules).toEqual({
    frozen_artifacts_must_match_sha256: true,
    threshold_changes_allowed: false,
    feature_changes_allowed: false,
    live_integration_allowed: false,
    canonical_binding_allowed: false,
    capture_allowed: false,
    persistence_allowed: false,
  });
});

test("no live source imports the frozen lab or Action 667C review artifacts", () => {
  const importTokens = [
    "market-context-intelligence-lab",
    "market_context_intelligence_v1",
    "action-667c-market-context-freeze-manifest",
  ];
  const offenders = ["app", "lib"]
    .flatMap((root) => sourceFiles(resolve(repositoryRoot, root)))
    .filter(
      (path) =>
        !path.includes("/lib/market-context-intelligence-lab/") &&
        importTokens.some((token) =>
          readFileSync(path, "utf8").includes(token),
        ),
    );

  expect(offenders).toEqual([]);
});

test("independent review keeps canonical binding not ready and records both blockers", () => {
  const review = readFileSync(
    resolve(
      repositoryRoot,
      "docs/action-667c-independent-contract-threshold-freeze-review.md",
    ),
    "utf8",
  );

  expect(review).toContain("action_667c_contract_frozen: true");
  expect(review).toContain("action_667c_independent_review_approved: false");
  expect(review).toContain("action_667c_canonical_format_compatible: false");
  expect(review).toContain("Canonical capture/binding: `not_ready`");
  expect(review).toContain("Blocking finding `C-001`");
  expect(review).toContain("provider timestamps");
  expect(review).toContain("freshness");
  expect(review).toContain("minor technical debt");
});
