import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import {
  CONSUMER_BUDGETS,
  createRuntimeCertificationConsumerV1,
} from "../../lib/action-661j5n1-runtime-certification-consumer.mjs";
import {
  CONSUMER_V2_BUDGETS,
  PROVIDER_STAGES_V2,
  consumeRuntimeCertificationV2,
  createRuntimeCertificationConsumerV2,
  probeDescriptorBoundReadV2,
} from "../../lib/action-661j5n2a-runtime-certification-consumer-v2.mjs";
import {
  createSyntheticDescriptorProviderV2,
} from "./action-661j5n2a-descriptor-provider-fixtures.mjs";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type FailureProvenance = {
  consumer_version: string;
  failure_identity_digest: string;
  metadata: JsonObject;
  provider_error_class: string;
  provider_error_code: string;
  provider_stage: string;
  reason: string;
  relative_path_digest: null | string;
  status: string;
};

const root = process.cwd();
const preservationCommit = "ff1fa24abd69efaa754d3f396cdce798962c3044";
const normativeDigest = "2793ec54bfdbc15eae21dc587c970e23ac1b5f7f1439a7efed6e6b32055c1636";
const normativePaths = [
  "docs/action-661j5n2a-descriptor-bound-consumer-v2.md",
  "docs/action-661j5n2a-runtime-certification-consumer-v2-golden-report.json",
  "lib/action-661j5n2a-runtime-certification-consumer-v2.mjs",
  "tests/e2e/action-661j5n2a-descriptor-provider-fixtures.mjs",
  "tests/e2e/action-661j5n2a-runtime-certification-consumer-v2.spec.ts",
];
const predecessorHashes = new Map([
  ["docs/action-661j5n1-default-off-runtime-certification-consumer.md", "c75122681cc20a6df79dbdd4cd539bdb2c0c7481ae31aa57f1c0924a3d634d11"],
  ["docs/action-661j5n1-runtime-certification-consumer-golden-report.json", "c4a86a7a69aaba3abfe5ee12d293d40b78248627c763a0b398e7681763149ab4"],
  ["lib/action-661j5n1-runtime-certification-consumer.mjs", "1c727c973d04f094bec3527e278eec00746be636f3c28f800725529bc0706a21"],
  ["tests/e2e/action-661j5n1-runtime-certification-consumer-fixtures.mjs", "340da479567f9782b77a7677cf8584e745d4740b4cc8d505c9a1fe4d91549a79"],
  ["tests/e2e/action-661j5n1-runtime-certification-consumer.spec.ts", "8ffea81c2bd63155eadcb764250a2d688118ec23a3352321d9231721ff1122c0"],
  ["docs/action-661j5n2-certification-consumer-freeze-manifest.json", "d2abfba1a118978187ff36b615dac04771343b209fd240947ee2ec5ddf2ba1d8"],
  ["docs/action-661j5n2-certification-consumer-independent-review.json", "4e4c25e70270a1b96e52ea06799b9ff265e76772d1c789e56b754047bb4a79e5"],
  ["tests/e2e/action-661j5n2-certification-consumer-adversarial-review.spec.ts", "217e155c4f8128504ef879303d7e436ae31e96b7608f3cd21cdbbdffe6594916"],
]);

function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function sha256(value: Buffer | JsonValue | string): string {
  const bytes = Buffer.isBuffer(value) || typeof value === "string"
    ? value
    : canonicalJson(value);
  return createHash("sha256").update(bytes).digest("hex");
}

function normativeProjection(): JsonObject {
  const artifacts = normativePaths.map((path) => {
    const bytes = readFileSync(join(root, path));
    return { byte_length: bytes.length, path, sha256: sha256(bytes) };
  });
  return { artifact_count: artifacts.length, artifacts, preservation_commit: preservationCommit };
}

function rebuildFailureIdentity(provenance: FailureProvenance): string {
  const projection: JsonObject = {
    consumer_version: provenance.consumer_version,
    metadata: provenance.metadata,
    provider_error_class: provenance.provider_error_class,
    provider_error_code: provenance.provider_error_code,
    provider_stage: provenance.provider_stage,
    reason: provenance.reason,
    relative_path_digest: provenance.relative_path_digest,
    status: provenance.status,
  };
  return sha256(projection);
}

function probe(options: Parameters<typeof createSyntheticDescriptorProviderV2>[0] = {}) {
  const fixture = createSyntheticDescriptorProviderV2(options);
  const result = probeDescriptorBoundReadV2({
    provider: fixture.provider,
    relative_path: fixture.relative_path,
    repository_root: fixture.repository_root,
  });
  return { fixture, result };
}

test("N2B freezes exactly five preservation-identical N2A artifacts", () => {
  expect(normativePaths).toHaveLength(5);
  expect(sha256(normativeProjection())).toBe(normativeDigest);
  for (const path of normativePaths) {
    const frozen = spawnSync("git", ["show", `${preservationCommit}:${path}`], {
      cwd: root,
      encoding: "buffer",
      env: {
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_NOSYSTEM: "1",
        HOME: "/tmp",
        NODE_ENV: "test",
        PATH: process.env.PATH ?? "",
        TMPDIR: process.env.TMPDIR ?? "/tmp",
      },
    });
    expect(frozen.status).toBe(0);
    expect(frozen.stderr).toEqual(Buffer.alloc(0));
    expect(frozen.stdout).toEqual(readFileSync(join(root, path)));
  }
  for (const [path, expected] of predecessorHashes) {
    expect(sha256(readFileSync(join(root, path)))).toBe(expected);
  }
});

test("N2B reproduces all three historical N1 findings", () => {
  let pathReadAfterInventory = false;
  let inventoried = false;
  const race = createRuntimeCertificationConsumerV1(Object.freeze({
    lstat(path: string) { inventoried = true; return lstatSync(path); },
    readFile() {
      pathReadAfterInventory = inventoried;
      return Buffer.from("outside-root-provider-bytes");
    },
    realpath(path: string) { return realpathSync(path); },
  }))({ enabled: true, repository_root: root });
  expect(pathReadAfterInventory).toBe(true);
  expect(race.status).toBe("tampered");

  const failureFor = (message: string) => createRuntimeCertificationConsumerV1(Object.freeze({
    lstat(path: string) { return lstatSync(path); },
    readFile() { throw new Error(message); },
    realpath(path: string) { return realpathSync(path); },
  }))({ enabled: true, repository_root: root });
  expect(failureFor("provider-a").failure_provenance).toEqual(
    failureFor("provider-b").failure_provenance,
  );
  expect(Object.hasOwn(CONSUMER_BUDGETS, "max_file_bytes")).toBe(false);
});

test("N2B proves descriptor identity order and zero path-based content reads", () => {
  const source = readFileSync(join(root, normativePaths[2]), "utf8");
  expect(source).not.toMatch(/\breadFileSync\b|\.readFile\s*\(|\breadFile\s*\(/);
  const capture = source.indexOf("capturePath(root, rootMetadata");
  const open = source.indexOf('providerCall(state, "open"', capture);
  const firstFstat = source.indexOf('providerCall(state, "descriptor_fstat"', open);
  const identity = source.indexOf("assertIdentity(expected, opened", firstFstat);
  const revalidate = source.indexOf("revalidateCapturedPath(captured", identity);
  const read = source.indexOf('providerCall(state, "descriptor_read"', revalidate);
  const postFstat = source.indexOf('providerCall(state, "post_read_fstat"', read);
  expect([capture, open, firstFstat, identity, revalidate, read, postFstat]).not.toContain(-1);
  expect(capture).toBeLessThan(open);
  expect(open).toBeLessThan(firstFstat);
  expect(firstFstat).toBeLessThan(identity);
  expect(identity).toBeLessThan(revalidate);
  expect(revalidate).toBeLessThan(read);
  expect(read).toBeLessThan(postFstat);
  for (const field of ["dev", "ino", "file_type", "mode", "size", "ctime_ns", "mtime_ns"]) {
    expect(source).toContain(field);
  }
});

test("N2B closes final, ancestor, symlink and inode substitutions before outside bytes", () => {
  for (const options of [
    { swap_to_symlink_before_open: true },
    { ancestor_swap: true },
    { final_path_swap: true },
    { descriptor_inode_drift: true },
  ]) {
    const { fixture, result } = probe(options);
    expect(result.status).toBe("scope_rejected");
    expect(fixture.tracking.read_calls).toBe(0);
    expect(fixture.tracking.read_started).toBe(false);
    expect(fixture.tracking.double_close_attempts).toBe(0);
  }
  const replacement = probe({ replace_after_open: true });
  expect(replacement.result.status).toBe("certified");
  expect(replacement.result.content_digest).toBe(sha256(replacement.fixture.bytes));
  expect(replacement.fixture.tracking.replacement_after_open).toBe(true);
});

test("N2B post-read fstat detects truncation and extension", () => {
  for (const mutation of ["truncate", "extend"] as const) {
    const { fixture, result } = probe({ post_read_mutation: mutation });
    expect(result.status).toBe("tampered");
    expect(result.reason).toBe("descriptor_post_read_mutation");
    expect(result.failure_provenance.provider_stage).toBe("post_read_fstat");
    expect(fixture.tracking.fstat_calls).toBe(2);
    expect(fixture.tracking.close_attempts).toBe(1);
    expect(fixture.tracking.descriptors.size).toBe(0);
  }
});

test("N2B descriptor lifecycle is exact and unsupported semantics fail closed", () => {
  for (const stage of [
    "root_validation",
    "lstat",
    "open",
    "descriptor_fstat",
    "descriptor_read",
    "post_read_fstat",
    "close",
  ]) {
    const { fixture, result } = probe({ provider_error_stage: stage });
    expect(result.status).not.toBe("certified");
    const expectedCloses = ["root_validation", "lstat", "open"].includes(stage) ? 0 : 1;
    expect(fixture.tracking.close_attempts).toBe(expectedCloses);
    expect(fixture.tracking.double_close_attempts).toBe(0);
  }
  const identity = probe({ descriptor_inode_drift: true });
  expect(identity.fixture.tracking.close_attempts).toBe(1);
  expect(identity.fixture.tracking.descriptors.size).toBe(0);
  const fixture = createSyntheticDescriptorProviderV2();
  const unavailable = probeDescriptorBoundReadV2({
    provider: Object.freeze({ ...fixture.provider, nofollow_flag: 0 }),
    relative_path: fixture.relative_path,
    repository_root: fixture.repository_root,
  });
  expect(unavailable.status).toBe("incompatible");
  expect(unavailable.reason).toBe("descriptor_platform_semantics_unavailable");
  expect(fixture.tracking.open_calls).toBe(0);
});

test("N2B independently verifies per-file boundaries and independent total budget", () => {
  const boundary = CONSUMER_V2_BUDGETS.max_file_bytes;
  for (const size of [boundary - 1, boundary]) {
    const { result } = probe({ bytes: Buffer.alloc(size, 97) });
    expect(result.status).toBe("certified");
    expect(result.counts.bytes_read).toBe(size);
  }
  const over = probe({ bytes: Buffer.alloc(boundary + 1, 97) });
  expect(over.result.status).toBe("scope_rejected");
  expect(over.result.reason).toBe("file_byte_budget_exceeded");
  expect(over.fixture.tracking.open_calls).toBe(0);
  expect(CONSUMER_V2_BUDGETS.max_bytes).toBe(16 * 1024 * 1024);
  expect(CONSUMER_V2_BUDGETS.max_file_bytes).toBe(2 * 1024 * 1024);
  expect(CONSUMER_V2_BUDGETS.max_bytes).toBeGreaterThan(
    CONSUMER_V2_BUDGETS.max_file_bytes,
  );
  const source = readFileSync(join(root, normativePaths[2]), "utf8");
  expect(source).toContain('"file_byte_budget_exceeded"');
  expect(source).toContain('"total_byte_budget_exceeded"');
});

test("N2B independently rebuilds collision-separated sanitized failure identities", () => {
  const identities = new Set<string>();
  for (const stage of PROVIDER_STAGES_V2) {
    const result = stage === "descriptor_identity"
      ? probe({ descriptor_inode_drift: true }).result
      : probe({
        provider_error_code: stage === "open" ? "EACCES" : "EIO",
        provider_error_stage: stage,
      }).result;
    const provenance = result.failure_provenance as FailureProvenance;
    expect(provenance.provider_stage).toBe(stage);
    expect(rebuildFailureIdentity(provenance)).toBe(provenance.failure_identity_digest);
    expect(JSON.stringify(provenance)).not.toContain("provider-controlled-secret-message");
    expect(JSON.stringify(provenance)).not.toContain("synthetic-action-661j5n2a-root");
    identities.add(provenance.failure_identity_digest);
  }
  expect(identities.size).toBe(PROVIDER_STAGES_V2.length);
  const eio = probe({ provider_error_code: "EIO", provider_error_stage: "open" }).result
    .failure_provenance as FailureProvenance;
  const denied = probe({ provider_error_code: "EACCES", provider_error_stage: "open" }).result
    .failure_provenance as FailureProvenance;
  expect(eio.failure_identity_digest).not.toBe(denied.failure_identity_digest);
});

test("N2B default-off remains zero-work and full 28/28 rebuild remains certified", () => {
  const fixture = createSyntheticDescriptorProviderV2();
  const off = createRuntimeCertificationConsumerV2(fixture.provider)({});
  expect(off.status).toBe("incomplete");
  expect(off.counts.bytes_read).toBe(0);
  expect(off.counts.digests_computed).toBe(0);
  expect(Object.values(off.counts.provider_calls)).toEqual(Array(8).fill(0));
  expect(fixture.tracking.open_calls).toBe(0);
  expect(fixture.tracking.read_calls).toBe(0);

  const enabled = consumeRuntimeCertificationV2({ enabled: true, repository_root: root });
  expect(enabled.status).toBe("certified");
  expect(enabled.counts.descriptors_opened).toBe(52);
  expect(enabled.counts.descriptors_closed).toBe(52);
  expect(enabled.semantic_result.counts.fixtures_verified).toBe(28);
  expect(enabled.semantic_result.counts.shards_verified).toBe(28);
  expect(enabled.semantic_result.counts.scenarios_verified).toBe(14);
});

test("N2B normative and consumer projections are timezone deterministic", () => {
  const script = [
    "import{createHash}from'node:crypto';import{readFileSync}from'node:fs';",
    "import{consumeRuntimeCertificationV2 as consume}from'./lib/action-661j5n2a-runtime-certification-consumer-v2.mjs';",
    `const p=${JSON.stringify(normativePaths)};`,
    "const h=x=>createHash('sha256').update(x).digest('hex');",
    "const c=v=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(c).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+c(v[k])).join(',')+'}';",
    `const a=p.map(path=>{const b=readFileSync(path);return{byte_length:b.length,path,sha256:h(b)}});const n=h(c({artifact_count:5,artifacts:a,preservation_commit:'${preservationCommit}'}));`,
    "const r=consume({enabled:true,repository_root:process.cwd()});console.log(JSON.stringify({n,status:r.status,counts:r.counts,observed:r.semantic_result.observed}));",
  ].join("");
  const outputs = ["UTC", "UTC", "Europe/Stockholm", "America/New_York"].map((timezone) => {
    const child = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
      cwd: root,
      encoding: "utf8",
      env: { NODE_ENV: "test", PATH: process.env.PATH ?? "", TZ: timezone },
    });
    expect(child.status).toBe(0);
    expect(child.stderr).toBe("");
    return child.stdout.trim();
  });
  expect(new Set(outputs).size).toBe(1);
  expect(JSON.parse(outputs[0]).n).toBe(normativeDigest);
});

test("N2B confirms runtime and live capabilities remain absent", () => {
  const source = readFileSync(join(root, normativePaths[2]), "utf8");
  expect(source).not.toMatch(/node:(?:child_process|http|https|net|tls|worker_threads)/);
  expect(source).not.toMatch(/process\.env|fetch\s*\(|docker/i);
  expect(source).not.toMatch(/\b(?:writeFile|appendFile|mkdir|rmSync|unlink|exec|spawn)\w*\s*\(/);
  expect(source).not.toMatch(/\b(?:readFile|readFileSync)\w*\s*\(/);
});
