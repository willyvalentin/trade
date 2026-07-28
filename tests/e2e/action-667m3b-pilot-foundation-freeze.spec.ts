import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";

type ArtifactClassification =
  | "current_normative"
  | "superseded_but_retained"
  | "historical_review_evidence"
  | "fixture_test"
  | "documentation"
  | "acquisition_blocking_external_evidence";

type CurrentArtifact = {
  path: string;
  artifact_type: string;
  classification: ArtifactClassification;
  version: string;
  sha256: string;
  git_status_at_freeze: "untracked" | "modified";
  lineage: string[];
};

type CurrentManifest = {
  manifest_version: string;
  stacked_base: string;
  artifact_count: number;
  artifacts: CurrentArtifact[];
  self_exclusion: {
    path: string;
    reason: string;
  };
  artifact_digest_algorithm: string;
  artifact_digest: string;
  predecessor_digests: Record<string, string>;
  portability_policy: {
    historical_git_status_is_provenance_only: true;
    accepted_current_states: string[];
    rejected_current_states: string[];
    unexpected_file_policy: "reject";
  };
  decisions: Record<string, boolean>;
};

const repositoryRoot = resolve(process.cwd());
const manifestPath =
  "docs/evidence/action-667m3b-pilot-foundation-freeze-manifest.json";
const successorManifestPath =
  "docs/evidence/action-667m3c-license-evidence-freeze-manifest.json";
const manifest = JSON.parse(
  readFileSync(resolve(repositoryRoot, manifestPath), "utf8"),
) as CurrentManifest;

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function currentStatus(path: string) {
  return execFileSync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all", "--", path],
    { cwd: repositoryRoot, encoding: "utf8" },
  ).trimEnd();
}

function allowedPortableStatus(artifact: CurrentArtifact) {
  const path = artifact.path;
  const common = ["", `?? ${path}`, `A  ${path}`];
  if (
    path ===
      "tests/e2e/action-667c-market-context-freeze-review.spec.ts" ||
    path ===
      "tests/e2e/action-667e-v2-refreeze-review.spec.ts"
  ) {
    return [...common, ` M ${path}`, `M  ${path}`];
  }
  return common;
}

function recursiveFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    return statSync(path).isDirectory()
      ? recursiveFiles(path)
      : [relative(repositoryRoot, path)];
  });
}

function relevantCurrentPaths() {
  const documentation = recursiveFiles(
    resolve(repositoryRoot, "docs"),
  ).filter(
    (path) =>
      /^docs\/action-667(?:k-|m1-|m2-|m2a-|m2b-|m2c-|m3-|m3a-|m3b-)/.test(
        path,
      ) ||
      /^docs\/evidence\/action-667(?:l-|m1-|m2-|m2a-|m2b-|m2c-|m3-|m3a-|m3b-)/.test(
        path,
      ),
  );
  const implementation = recursiveFiles(
    resolve(
      repositoryRoot,
      "lib/market-context-intelligence-lab",
    ),
  ).filter((path) =>
    /\/(?:shadow-replay|historical-dataset|trade-to-candle|action-667m3a)/.test(
      path,
    ),
  );
  const tests = recursiveFiles(
    resolve(repositoryRoot, "tests/e2e"),
  ).filter(
    (path) =>
      /^tests\/e2e\/action-667(?:k-|m1-|m2a-|m2c-|m3a-|m3b-)/.test(
        path,
      ) ||
      path ===
        "tests/e2e/action-667c-market-context-freeze-review.spec.ts" ||
      path ===
        "tests/e2e/action-667e-v2-refreeze-review.spec.ts",
  );
  return [...new Set([
    ...documentation,
    ...implementation,
    ...tests,
  ])].sort((left, right) => left.localeCompare(right));
}

function currentFrozenSha(artifact: CurrentArtifact) {
  const actual = sha256(
    readFileSync(resolve(repositoryRoot, artifact.path)),
  );
  if (actual === artifact.sha256) {
    return actual;
  }
  const successor = JSON.parse(
    readFileSync(resolve(repositoryRoot, successorManifestPath), "utf8"),
  ) as {
    artifacts: Array<{
      path: string;
      sha256: string;
      lineage: string[];
    }>;
  };
  const current = successor.artifacts.find(
    (candidate) => candidate.path === artifact.path,
  );
  expect(current?.lineage).toContain(manifest.artifact_digest);
  expect(actual).toBe(current?.sha256);
  return actual;
}

function verifyHistoricalFreeze(path: string, digestKey: string) {
  const historical = JSON.parse(
    readFileSync(resolve(repositoryRoot, path), "utf8"),
  ) as {
    artifacts: Array<{
      path: string;
      artifact_type: string;
      version: string;
      sha256: string;
    }>;
    [key: string]: unknown;
  };
  for (const artifact of historical.artifacts) {
    expect(
      sha256(readFileSync(resolve(repositoryRoot, artifact.path))),
    ).toBe(artifact.sha256);
  }
  const payload = [...historical.artifacts]
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((artifact) =>
      [
        artifact.path,
        artifact.artifact_type,
        artifact.version,
        artifact.sha256,
      ].join("\u0000") + "\n"
    )
    .join("");
  expect(sha256(payload)).toBe(historical[digestKey]);
}

test("current-state manifest freezes exact bytes, paths, versions, lineage, and portable Git states", () => {
  expect(manifest.manifest_version).toBe(
    "market_context_pilot_foundation_freeze_manifest_v1",
  );
  expect(manifest.stacked_base).toBe(
    "becee774a270e078fbd8bb55a01d7a59b2205599",
  );
  expect(manifest.artifact_count).toBe(manifest.artifacts.length);
  expect(manifest.self_exclusion.path).toBe(manifestPath);

  const paths = manifest.artifacts.map((artifact) => artifact.path);
  expect(new Set(paths).size).toBe(paths.length);
  expect(paths).toEqual(
    [...paths].sort((left, right) => left.localeCompare(right)),
  );

  for (const artifact of manifest.artifacts) {
    expect(artifact.path.length).toBeGreaterThan(0);
    expect(artifact.artifact_type.length).toBeGreaterThan(0);
    expect(artifact.version.length).toBeGreaterThan(0);
    expect(artifact.lineage.length).toBeGreaterThan(0);
    if (artifact.path ===
      "tests/e2e/action-667m3b-pilot-foundation-freeze.spec.ts") {
      expect(currentFrozenSha(artifact)).not.toBe(artifact.sha256);
    } else {
      expect(
        sha256(readFileSync(resolve(repositoryRoot, artifact.path))),
      ).toBe(artifact.sha256);
    }
    expect(allowedPortableStatus(artifact)).toContain(
      currentStatus(artifact.path),
    );
  }

  const payload = manifest.artifacts
    .map((artifact) =>
      [
        artifact.path,
        artifact.artifact_type,
        artifact.classification,
        artifact.version,
        artifact.sha256,
        artifact.git_status_at_freeze,
        artifact.lineage.join(","),
      ].join("\u0000") + "\n"
    )
    .join("");
  expect(sha256(payload)).toBe(manifest.artifact_digest);
});

test("scope inventory rejects deletion and every unexpected K-M.3A or portability artifact", () => {
  const expected = [
    ...manifest.artifacts.map((artifact) => artifact.path),
    manifest.self_exclusion.path,
  ].sort((left, right) => left.localeCompare(right));
  expect(relevantCurrentPaths()).toEqual(expected);
  expect(manifest.portability_policy.unexpected_file_policy).toBe(
    "reject",
  );
});

test("M.2A/v1 and M.2C/v2 frozen implementation bytes remain exact", () => {
  verifyHistoricalFreeze(
    "docs/evidence/action-667m2b-trade-to-candle-freeze-manifest.json",
    "freeze_digest",
  );
  verifyHistoricalFreeze(
    "docs/evidence/action-667m2c-v2-freeze-manifest.json",
    "v2_freeze_digest",
  );
  expect(manifest.predecessor_digests.m2a_v1_freeze).toBe(
    "28b5ef0a42023605d299671c05d926e4fbf7e129f421f4feed02a6c6b02f9370",
  );
  expect(manifest.predecessor_digests.m2c_v2_freeze).toBe(
    "f5b3ad14fb10fb8fd7fed6547f521f430d8b30895bccb5b684db457160e2de4f",
  );
});

test("historical Git status remains provenance while current status is portable", () => {
  expect(
    manifest.portability_policy
      .historical_git_status_is_provenance_only,
  ).toBe(true);
  expect(manifest.portability_policy.accepted_current_states).toEqual([
    "untracked_exact_hash",
    "staged_intended_exact_hash",
    "tracked_clean_exact_hash",
    "documented_portability_revision_exact_hash",
  ]);
  expect(manifest.portability_policy.rejected_current_states).toEqual([
    "modified_unfrozen_bytes",
    "deleted",
    "renamed",
    "conflicted",
    "unexpected_file",
  ]);
});

test("portable status policy covers pre-stage, staged, and post-commit states without admitting mutations", () => {
  const ordinary = manifest.artifacts.find(
    (artifact) =>
      artifact.path ===
      "lib/market-context-intelligence-lab/historical-dataset-nanosecond-receiver-v1.ts",
  )!;
  expect(allowedPortableStatus(ordinary)).toEqual([
    "",
    `?? ${ordinary.path}`,
    `A  ${ordinary.path}`,
  ]);
  expect(allowedPortableStatus(ordinary)).not.toContain(
    ` M ${ordinary.path}`,
  );
  expect(allowedPortableStatus(ordinary)).not.toContain(
    `D  ${ordinary.path}`,
  );

  const portableRevision = manifest.artifacts.find(
    (artifact) =>
      artifact.path ===
      "tests/e2e/action-667c-market-context-freeze-review.spec.ts",
  )!;
  expect(allowedPortableStatus(portableRevision)).toEqual([
    "",
    `?? ${portableRevision.path}`,
    `A  ${portableRevision.path}`,
    ` M ${portableRevision.path}`,
    `M  ${portableRevision.path}`,
  ]);
  expect(allowedPortableStatus(portableRevision)).not.toContain(
    `D  ${portableRevision.path}`,
  );
});

test("independent review approves checkpoint but not acquisition or integration", () => {
  expect(manifest.decisions).toEqual({
    action_667m3b_pilot_foundation_frozen: true,
    action_667m3b_test_portability_verified: true,
    action_667m3b_independent_review_approved: true,
    action_667m3b_local_checkpoint_ready: true,
    action_667m4_dataset_acquisition_ready: false,
  });
  const review = readFileSync(
    resolve(
      repositoryRoot,
      "docs/action-667m3b-pilot-foundation-refreeze-review.md",
    ),
    "utf8",
  );
  expect(review).toContain("Blocker: 0. Major: 0. Minor: 3. Nit: 0.");
  expect(review).toContain("empirically_unvalidated");
  expect(review).toContain("Written license evidence is mandatory");
  expect(review).toContain(
    "`action_667m4_dataset_acquisition_ready` remains `false`",
  );
});

test("foundation has no credential, provider-client, database, replay-runtime, or live imports", () => {
  const imports = manifest.artifacts
    .filter((artifact) => artifact.path.endsWith(".ts"))
    .flatMap((artifact) =>
      Array.from(
        readFileSync(
          resolve(repositoryRoot, artifact.path),
          "utf8",
        ).matchAll(/from\s+["']([^"']+)["']/g),
      ).map((match) => ({
        path: artifact.path,
        source: match[1] ?? "",
      }))
    );
  expect(
    imports.filter(({ source }) =>
      /databento|supabase|provider-client|collector|scanner|recommendation|app\/api/.test(
        source,
      ),
    ),
  ).toEqual([]);
});
