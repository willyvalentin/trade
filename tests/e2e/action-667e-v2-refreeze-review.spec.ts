import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type FreezeArtifact = {
  path: string;
  artifact_type: string;
  version: string;
  sha256: string;
  git_status: "untracked";
};

type FreezeManifest = {
  start_sha: string;
  v1_baseline: {
    artifact_count: number;
    digest: string;
  };
  v1_lineage_artifacts: FreezeArtifact[];
  v2: {
    artifact_count: number;
    action_667d_evidence_digest: string;
    freeze_digest_before_regression: string;
    expected_freeze_digest_after_regression: string;
    artifacts: FreezeArtifact[];
  };
  freeze_rules: Record<string, boolean>;
};

const repositoryRoot = resolve(process.cwd());
const manifest = JSON.parse(
  readFileSync(
    resolve(
      repositoryRoot,
      "docs/evidence/action-667e-v2-freeze-manifest.json",
    ),
    "utf8",
  ),
) as FreezeManifest;

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function currentArtifactHashes(artifacts: FreezeArtifact[]) {
  return artifacts.map((artifact) => ({
    path: artifact.path,
    sha256: sha256(
      readFileSync(resolve(repositoryRoot, artifact.path)),
    ),
  }));
}

function gitStatus(path: string) {
  const result = spawnSync(
    "git",
    ["status", "--porcelain", "--untracked-files=all", "--", path],
    { cwd: repositoryRoot, encoding: "utf8" },
  );
  expect(result.status).toBe(0);
  return result.stdout.trim();
}

test("manifest inventories exact v1 lineage and v2 artifacts with matching hashes and status", () => {
  expect(manifest.v1_lineage_artifacts).toHaveLength(12);
  expect(manifest.v2.artifact_count).toBe(7);
  expect(manifest.v2.artifacts).toHaveLength(7);

  for (const artifact of [
    ...manifest.v1_lineage_artifacts,
    ...manifest.v2.artifacts,
  ]) {
    expect(
      sha256(readFileSync(resolve(repositoryRoot, artifact.path))),
    ).toBe(artifact.sha256);
    expect(gitStatus(artifact.path)).toBe(`?? ${artifact.path}`);
    expect(artifact.artifact_type.length).toBeGreaterThan(0);
    expect(artifact.version.length).toBeGreaterThan(0);
  }
});

test("v1 baseline and Action 667D evidence digests remain byte-identical", () => {
  const v1Manifest = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667c-market-context-freeze-manifest.json",
      ),
      "utf8",
    ),
  ) as { artifacts: unknown[] };
  const action667dEvidence = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667d-explicit-instant-adapter-evidence.json",
      ),
      "utf8",
    ),
  ) as {
    evidence_payload: unknown;
    evidence_digest: { value: string };
  };

  expect(manifest.v1_baseline.artifact_count).toBe(9);
  expect(sha256(JSON.stringify(v1Manifest.artifacts))).toBe(
    "eb0ef9eff3318b540ffc060d52d7ba118dfe98bf7303068ab01474fb92168250",
  );
  expect(manifest.v1_baseline.digest).toBe(
    "eb0ef9eff3318b540ffc060d52d7ba118dfe98bf7303068ab01474fb92168250",
  );
  expect(sha256(JSON.stringify(action667dEvidence.evidence_payload))).toBe(
    "c31bea77723d82f2d94e02e1dbd295def50c92334594d154bf85e8f72811dcb6",
  );
  expect(action667dEvidence.evidence_digest.value).toBe(
    manifest.v2.action_667d_evidence_digest,
  );
});

test("aggregate v2 digest is unchanged before and after regression", () => {
  const digest = sha256(JSON.stringify(manifest.v2.artifacts));
  expect(digest).toBe(
    "79057d446d4acb7e4e6d0bdf4a97b73dda3dbb4e050b4d67920ffa4c3a78138d",
  );
  expect(manifest.v2.freeze_digest_before_regression).toBe(digest);
  expect(manifest.v2.expected_freeze_digest_after_regression).toBe(digest);
});

test("cross-TZ child processes produce one byte-identical v2 digest without artifact mutation", () => {
  const before = currentArtifactHashes(manifest.v2.artifacts);
  const expectedDigest =
    "74ada29c4cbdc5070fd5a073fa84a27cce2502fbcbe908adf9080ce6c8a8f610";
  const timezones = [
    "UTC",
    "Europe/Stockholm",
    "America/New_York",
  ];

  const results = timezones.map((timezone) => {
    const child = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "playwright",
        "test",
        "tests/e2e/action-667d-explicit-instant-lossless-adapter.spec.ts",
        "--grep",
        "full v2 output has a fixed cross-process timezone digest",
        "--reporter=line",
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
      },
    );
    expect(child.status, child.stderr).toBe(0);
    const match = child.stdout.match(
      /ACTION_667D_TZ_DIGEST=([a-f0-9]{64})/,
    );
    expect(match?.[1]).toBe(expectedDigest);
    return { timezone, digest: match?.[1] };
  });

  expect(results).toEqual(
    timezones.map((timezone) => ({
      timezone,
      digest: expectedDigest,
    })),
  );
  expect(currentArtifactHashes(manifest.v2.artifacts)).toEqual(before);
});

test("review decisions approve local checkpoint but keep canonical binding false", () => {
  const review = readFileSync(
    resolve(
      repositoryRoot,
      "docs/action-667e-independent-v2-refreeze-review.md",
    ),
    "utf8",
  );

  expect(review).toContain("action_667e_v2_frozen: true");
  expect(review).toContain(
    "action_667e_independent_review_approved: true",
  );
  expect(review).toContain("action_667e_receiver_delta_complete: true");
  expect(review).toContain("action_667e_local_checkpoint_ready: true");
  expect(review).toContain("canonical_binding_ready: false");
  expect(review).toContain("Minor finding `E-001`");
  expect(review).toContain("Minor finding `E-002`");
  expect(review).toContain("semantically incompatible");
  expect(manifest.freeze_rules).toEqual({
    v1_mutation_allowed: false,
    v2_mutation_allowed: false,
    new_implementation_allowed: false,
    canonical_binding_allowed: false,
    capture_allowed: false,
    persistence_allowed: false,
    live_integration_allowed: false,
  });
});
