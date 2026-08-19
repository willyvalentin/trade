import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const manifestPath =
  "docs/evidence/action-666cz-current-main-lossless-immutable-byte-snapshot-authority/foundation-freeze-manifest.json";
const manifestSha256 =
  "1d97b940221762548eb3e4e56bf0ea7874d4324868a170e256ad0a20df0e4205";

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

function clone<T extends MutableJson>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function validateManifest(value: unknown) {
  const canonicalBytes = `${JSON.stringify(value, null, 2)}\n`;
  if (sha256(canonicalBytes) !== manifestSha256) {
    throw new Error("current_main_snapshot_authority_manifest_drift");
  }
}

function mutations(value: MutableJson): MutableJson[] {
  const generated: MutableJson[] = [];
  function visit(root: MutableJson, pathToValue: Array<string | number>) {
    const read = (candidate: MutableJson) =>
      pathToValue.reduce<MutableJson>((current, key) => {
        if (Array.isArray(current)) return current[key as number];
        return (current as Record<string, MutableJson>)[key as string];
      }, candidate);
    const current = read(root);
    if (Array.isArray(current)) {
      const added = clone(root);
      (read(added) as MutableJson[]).push("unexpected");
      generated.push(added);
      if (current.length > 0) {
        const removed = clone(root);
        (read(removed) as MutableJson[]).splice(0, 1);
        generated.push(removed);
        const reversed = clone(root);
        (read(reversed) as MutableJson[]).reverse();
        generated.push(reversed);
      }
      current.forEach((_, index) => visit(root, [...pathToValue, index]));
      return;
    }
    if (current !== null && typeof current === "object") {
      const extra = clone(root);
      (read(extra) as Record<string, MutableJson>).unexpected = true;
      generated.push(extra);
      for (const key of Object.keys(current)) {
        const removed = clone(root);
        delete (read(removed) as Record<string, MutableJson>)[key];
        generated.push(removed);
        visit(root, [...pathToValue, key]);
      }
      return;
    }
    const changed = clone(root);
    const parentPath = pathToValue.slice(0, -1);
    const parent = parentPath.reduce<MutableJson>((candidate, key) => {
      if (Array.isArray(candidate)) return candidate[key as number];
      return (candidate as Record<string, MutableJson>)[key as string];
    }, changed);
    const leaf = pathToValue.at(-1)!;
    const replacement: MutableJson =
      typeof current === "boolean"
        ? !current
        : typeof current === "number"
          ? current + 1
          : typeof current === "string"
            ? `${current}_drift`
            : "unexpected";
    if (Array.isArray(parent)) parent[leaf as number] = replacement;
    else (parent as Record<string, MutableJson>)[leaf as string] = replacement;
    generated.push(changed);
  }
  visit(value, []);
  return generated;
}

test("Action 666CZ binds the exact five-file snapshot-authority foundation", async () => {
  const raw = await source(manifestPath);
  expect(sha256(raw)).toBe(manifestSha256);
  const manifest = JSON.parse(raw.toString("utf8")) as {
    foundation: {
      normative_artifact_count: number;
      aggregate_sha256: string;
      artifacts: Array<{ path: string; sha256: string }>;
    };
  };
  validateManifest(manifest);
  expect(manifest.foundation.normative_artifact_count).toBe(5);
  expect(manifest.foundation.artifacts).toHaveLength(5);
  const lines = await Promise.all(
    manifest.foundation.artifacts.map(async (artifact) => {
      const bytes = await source(artifact.path);
      expect(sha256(bytes), artifact.path).toBe(artifact.sha256);
      return `${artifact.path}  ${artifact.sha256}\n`;
    }),
  );
  expect(sha256(lines.sort().join(""))).toBe(
    manifest.foundation.aggregate_sha256,
  );
});

test("Action 666CZ rejects recursive manifest deletion, change, order and extra-key drift", async () => {
  const manifest = JSON.parse(
    (await source(manifestPath)).toString("utf8"),
  ) as MutableJson;
  const matrix = mutations(manifest);
  expect(matrix.length).toBeGreaterThan(100);
  for (const mutation of matrix) {
    expect(() => validateManifest(mutation)).toThrow(
      "current_main_snapshot_authority_manifest_drift",
    );
  }
});

test("Action 666CZ pins current main, delivered 666CY and closed scope", async () => {
  const manifest = JSON.parse(
    (await source(manifestPath)).toString("utf8"),
  );
  expect(manifest.authority).toEqual({
    repository: "willyvalentin/trade",
    candidate_base_commit: "7280f5a6a7317f495dd8ffccdd8df609203026f5",
    candidate_base_tree: "944a9fe64992f115a514070e3a0ff6e5df26c5a1",
    candidate_base_exact_main_ci_run: 32277517623,
    delivered_predecessor: "666CY",
    delivered_predecessor_pull_request: 118,
    delivered_predecessor_head: "2d378bd96123470c5f0bf4ca2d991a032be06ff3",
    historical_design_pull_request: 72,
    historical_design_head: "40155d6b5bf03cb8e3ed2207f4f771d62b6f6937",
    historical_design_authority_reused: false,
    historical_evidence_artifacts_imported: false,
    historical_successor_chain_imported: false,
    fresh_current_main_review_required: true,
  });
  expect(manifest.scope).toMatchObject({
    server_only: true,
    synthetic_only: true,
    fixture_only: true,
    read_only: true,
    default_off: true,
    runtime_unwired: true,
    live_consumer_added: false,
    provider_or_database_access_added: false,
    persistence_or_migration_added: false,
  });
  expect(manifest.delivery).toMatchObject({
    candidate_merge_authorized: false,
    production_deployment_authorized: false,
    provider_or_database_action_authorized: false,
  });
  expect(manifest.roadmap).toEqual({
    candidate_action: "666CZ",
    delivered_predecessor: "666CY",
    next_bounded_objective_if_delivered:
      "fresh_current_main_snapshot_authority_integrity_provenance_separation_successor",
    track_2_complete_if_delivered: false,
    milestone_credit_awarded: false,
  });
});

test("Action 666CZ imports no historical authority or successor chain", async () => {
  for (const historical of [
    "docs/action-666ci-lossless-immutable-byte-snapshot.md",
    "docs/action-666ci-golden-lossless-immutable-byte-snapshot-report.json",
    "tests/e2e/action-666ci-lossless-immutable-byte-snapshot.spec.ts",
  ]) {
    expect(await exists(historical), historical).toBe(false);
  }
  const contract = (
    await source(
      "docs/action-666cz-current-main-lossless-immutable-byte-snapshot-authority.md",
    )
  ).toString("utf8");
  expect(contract).toContain("Historical PR #72 remains non-authority");
  expect(contract).toContain("No production deployment is authorized.");
});

test("Action 666CZ remains server-only, consumer-free and registered exactly once", async () => {
  const governedModules = [
    "lib/server/canonical-lossless-immutable-byte-snapshot-authority.ts",
    "lib/server/canonical-lossless-immutable-byte-snapshot-authority-fixtures.ts",
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
  const candidates = (
    await Promise.all(["app", "components", "lib"].map(sourceFiles))
  ).flat();
  const consumers: string[] = [];
  for (const candidate of candidates) {
    if (governedModules.includes(candidate)) continue;
    const content = (await source(candidate)).toString("utf8");
    if (
      content.includes(
        "@/lib/server/canonical-lossless-immutable-byte-snapshot-authority",
      )
    ) {
      consumers.push(candidate);
    }
  }
  expect(consumers).toEqual([]);
  const registration = JSON.parse(
    (
      await source("scripts/action-660j-provider-free-ci-registration.json")
    ).toString("utf8"),
  ) as string[];
  for (const testPath of [
    "tests/e2e/action-666cz-current-main-lossless-immutable-byte-snapshot-authority.spec.ts",
    "tests/e2e/action-666cz-current-main-lossless-immutable-byte-snapshot-authority-freeze.spec.ts",
  ]) {
    expect(registration.filter((entry) => entry === testPath)).toHaveLength(1);
  }
});
