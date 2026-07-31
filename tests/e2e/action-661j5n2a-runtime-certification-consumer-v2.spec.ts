import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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

function sha256(value: Buffer | string): string {
  return createHash("sha256").update(value).digest("hex");
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
  return sha256(canonicalJson(projection));
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

test("N2A preserves every N1 and N2 predecessor byte", () => {
  for (const [path, expected] of predecessorHashes) {
    expect(sha256(readFileSync(join(root, path)))).toBe(expected);
  }
});

test("N2A default-off performs zero filesystem, descriptor and digest work", () => {
  const fixture = createSyntheticDescriptorProviderV2();
  const consumer = createRuntimeCertificationConsumerV2(fixture.provider);
  const result = consumer({});
  expect(result.status).toBe("incomplete");
  expect(result.reason).toBe("consumer_disabled");
  expect(result.counts).toEqual({
    bytes_read: 0,
    descriptors_closed: 0,
    descriptors_opened: 0,
    digests_computed: 0,
    file_reads: 0,
    metadata_reads: 0,
    provider_calls: Object.fromEntries(PROVIDER_STAGES_V2.map((stage) => [stage, 0])),
  });
  expect(fixture.tracking.open_calls).toBe(0);
  expect(fixture.tracking.read_calls).toBe(0);
});

test("N2A descriptor-bound reader verifies lstat, fstat and post-read identity", () => {
  const { fixture, result } = probe();
  expect(result.status).toBe("certified");
  expect(result.byte_length).toBe(fixture.bytes.length);
  expect(result.content_digest).toBe(sha256(fixture.bytes));
  expect(result.counts.descriptors_opened).toBe(1);
  expect(result.counts.descriptors_closed).toBe(1);
  expect(fixture.tracking.descriptors.size).toBe(0);
  expect(fixture.tracking.double_close_attempts).toBe(0);
  expect(fixture.tracking.fstat_calls).toBe(2);
});

test("N2A closes final and ancestor swap attacks before content read", () => {
  for (const options of [
    { swap_to_symlink_before_open: true },
    { ancestor_swap: true },
    { final_path_swap: true },
    { descriptor_inode_drift: true },
  ]) {
    const { fixture, result } = probe(options);
    expect(result.status).toBe("scope_rejected");
    expect(fixture.tracking.read_started).toBe(false);
    expect(fixture.tracking.descriptors.size).toBe(0);
    expect(fixture.tracking.close_attempts).toBe(
      options.swap_to_symlink_before_open ? 0 : 1,
    );
  }
});

test("N2A detects descriptor truncation and extension during read", () => {
  for (const mutation of ["truncate", "extend"] as const) {
    const { fixture, result } = probe({ post_read_mutation: mutation });
    expect(result.status).toBe("tampered");
    expect(result.reason).toBe("descriptor_post_read_mutation");
    expect(result.failure_provenance.provider_stage).toBe("post_read_fstat");
    expect(fixture.tracking.read_started).toBe(true);
    expect(fixture.tracking.close_attempts).toBe(1);
    expect(fixture.tracking.descriptors.size).toBe(0);
  }
});

test("N2A replacement after open cannot redirect the verified descriptor", () => {
  const { fixture, result } = probe({ replace_after_open: true });
  expect(result.status).toBe("certified");
  expect(result.byte_length).toBe(fixture.bytes.length);
  expect(result.content_digest).toBe(sha256(fixture.bytes));
  expect(fixture.tracking.replacement_after_open).toBe(true);
  expect(fixture.tracking.descriptors.size).toBe(0);
});

test("N2A enforces explicit per-file budget at minus one, exact and plus one", () => {
  const boundary = CONSUMER_V2_BUDGETS.max_file_bytes;
  for (const size of [boundary - 1, boundary]) {
    const { result } = probe({ bytes: Buffer.alloc(size, 97) });
    expect(result.status).toBe("certified");
    expect(result.counts.bytes_read).toBe(size);
  }
  const { fixture, result } = probe({ bytes: Buffer.alloc(boundary + 1, 97) });
  expect(result.status).toBe("scope_rejected");
  expect(result.reason).toBe("file_byte_budget_exceeded");
  expect(result.failure_provenance.provider_stage).toBe("descriptor_read");
  expect(fixture.tracking.open_calls).toBe(0);
  expect(fixture.tracking.read_calls).toBe(0);
});

test("N2A closes descriptors once on every post-open provider failure", () => {
  for (const stage of [
    "descriptor_fstat",
    "descriptor_read",
    "post_read_fstat",
  ]) {
    const { fixture, result } = probe({ provider_error_stage: stage });
    expect(result.status).toBe("incomplete");
    expect(result.failure_provenance.provider_stage).toBe(stage);
    expect(fixture.tracking.close_attempts).toBe(1);
    expect(fixture.tracking.descriptors.size).toBe(0);
    expect(fixture.tracking.double_close_attempts).toBe(0);
  }
  const { fixture, result } = probe({ provider_error_stage: "close" });
  expect(result.status).toBe("incomplete");
  expect(result.failure_provenance.provider_stage).toBe("close");
  expect(fixture.tracking.close_attempts).toBe(1);
  expect(fixture.tracking.double_close_attempts).toBe(0);
});

test("N2A provider stages and codes have independently rebuildable identities", () => {
  const identities = new Set<string>();
  for (const stage of [
    "root_validation",
    "lstat",
    "open",
    "descriptor_fstat",
    "descriptor_read",
    "post_read_fstat",
    "close",
  ]) {
    const { result } = probe({
      provider_error_code: stage === "open" ? "EACCES" : "EIO",
      provider_error_stage: stage,
    });
    const provenance = result.failure_provenance as FailureProvenance;
    expect(provenance.provider_stage).toBe(stage);
    expect(rebuildFailureIdentity(provenance)).toBe(provenance.failure_identity_digest);
    expect(JSON.stringify(provenance)).not.toContain("provider-controlled-secret-message");
    identities.add(provenance.failure_identity_digest);
  }
  const descriptorIdentity = probe({ descriptor_inode_drift: true }).result
    .failure_provenance as FailureProvenance;
  expect(descriptorIdentity.provider_stage).toBe("descriptor_identity");
  expect(rebuildFailureIdentity(descriptorIdentity)).toBe(
    descriptorIdentity.failure_identity_digest,
  );
  identities.add(descriptorIdentity.failure_identity_digest);

  const left = probe({ provider_error_code: "EIO", provider_error_stage: "open" }).result
    .failure_provenance as FailureProvenance;
  const right = probe({ provider_error_code: "EACCES", provider_error_stage: "open" }).result
    .failure_provenance as FailureProvenance;
  expect(left.failure_identity_digest).not.toBe(right.failure_identity_digest);
  expect(identities.size).toBe(8);
});

test("N2A rejects aliases, traversal and unavailable nofollow semantics", () => {
  const fixture = createSyntheticDescriptorProviderV2();
  for (const relativePath of ["/absolute.json", "../escape.json", "docs/../escape.json"]) {
    const result = probeDescriptorBoundReadV2({
      provider: fixture.provider,
      relative_path: relativePath,
      repository_root: fixture.repository_root,
    });
    expect(result.status).toBe("scope_rejected");
  }
  const alias = probe({ root_alias: true }).result;
  expect(alias.status).toBe("scope_rejected");
  expect(alias.reason).toBe("repository_root_not_canonical");
  const unsupported = probeDescriptorBoundReadV2({
    provider: Object.freeze({ ...fixture.provider, nofollow_flag: 0 }),
    relative_path: fixture.relative_path,
    repository_root: fixture.repository_root,
  });
  expect(unsupported.status).toBe("incompatible");
  expect(unsupported.reason).toBe("descriptor_platform_semantics_unavailable");
});

test("N2A full 28-fixture semantic rebuild passes through memory only", () => {
  const result = consumeRuntimeCertificationV2({
    enabled: true,
    repository_root: root,
  });
  expect(result.status).toBe("certified");
  expect(result.semantic_result.status).toBe("certified");
  expect(result.semantic_result.counts.fixtures_verified).toBe(28);
  expect(result.semantic_result.counts.shards_verified).toBe(28);
  expect(result.semantic_result.counts.scenarios_verified).toBe(14);
  expect(result.counts.file_reads).toBe(52);
  expect(result.counts.descriptors_opened).toBe(52);
  expect(result.counts.descriptors_closed).toBe(52);
  expect(result.failure_provenance).toBeNull();
});

test("N2A output is deterministic across process and timezone boundaries", () => {
  const script = [
    "import{consumeRuntimeCertificationV2 as consume}from'./lib/action-661j5n2a-runtime-certification-consumer-v2.mjs';",
    "const r=consume({enabled:true,repository_root:process.cwd()});",
    "console.log(JSON.stringify({status:r.status,reason:r.reason,counts:r.counts,semantic:r.semantic_result.observed}));",
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
});

test("N2A implementation has no path-based filesystem content read", () => {
  const source = readFileSync(
    join(root, "lib/action-661j5n2a-runtime-certification-consumer-v2.mjs"),
    "utf8",
  );
  expect(source).not.toMatch(/\breadFileSync\b|\.readFile\s*\(|\breadFile\s*\(/);
  expect(source).toContain("readSync(descriptor, buffer, offset, length, position)");
  expect(source).toContain("openSync(path, flags)");
  expect(source).toContain("fsConstants.O_NOFOLLOW");
  expect(source).not.toMatch(/node:(?:child_process|http|https|net|tls|worker_threads)/);
  expect(source).not.toMatch(/process\.env|fetch\s*\(|docker/i);
});
