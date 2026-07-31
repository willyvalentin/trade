import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CERTIFICATION_AUTHORITIES,
  CERTIFICATION_PATHS,
  CONSUMER_BUDGETS,
  RESULT_STATUSES,
  consumeRuntimeCertificationV1,
  createRuntimeCertificationConsumerV1,
} from "../../lib/action-661j5n1-runtime-certification-consumer.mjs";
import {
  SYNTHETIC_ATTACK_CASES,
  canonicalFixtureBytes,
  createObservedReadBoundary,
  parseFixtureJson,
  recomputeSelfDigest,
} from "./action-661j5n1-runtime-certification-consumer-fixtures.mjs";

type ConsumerResult = {
  counts: {
    bytes_read: number;
    digests_computed: number;
    file_reads: number;
    fixtures_verified: number;
    metadata_reads: number;
    scenarios_verified: number;
    shards_verified: number;
  };
  failure_provenance: null | { path: null | string; stage: string };
  observed: {
    aggregate_digest: null | string;
    delivery_digest: string;
    freeze_manifest_digest: null | string;
  };
  reason: string;
  status: string;
};

type JsonObject = { [key: string]: unknown };

const root = process.cwd();
const fixturePath = join(
  root,
  "tests/e2e/action-661j5n1-runtime-certification-consumer-fixtures.mjs",
);
const consumerPath = join(
  root,
  "lib/action-661j5n1-runtime-certification-consumer.mjs",
);

function consume(boundary: ReturnType<typeof createObservedReadBoundary>["boundary"]): ConsumerResult {
  return createRuntimeCertificationConsumerV1(boundary)({
    enabled: true,
    repository_root: root,
  }) as ConsumerResult;
}

function readJson(path: string): JsonObject {
  return parseFixtureJson(readFileSync(join(root, path))) as JsonObject;
}

function manifestWith(mutator: (manifest: JsonObject) => void): Buffer {
  const manifest = structuredClone(readJson(CERTIFICATION_PATHS.freeze_manifest));
  mutator(manifest);
  recomputeSelfDigest(manifest, "manifest_digest");
  return canonicalFixtureBytes(manifest);
}

test("N1 default-off path performs no reads and no digest work", () => {
  const observed = createObservedReadBoundary(root);
  const consumer = createRuntimeCertificationConsumerV1(observed.boundary);
  const before = structuredClone(observed.calls);
  const result = consumer({}) as ConsumerResult;

  expect(result.status).toBe("incomplete");
  expect(result.reason).toBe("consumer_disabled");
  expect(result.counts).toEqual({
    bytes_read: 0,
    digests_computed: 0,
    file_reads: 0,
    fixtures_verified: 0,
    metadata_reads: 0,
    scenarios_verified: 0,
    shards_verified: 0,
  });
  expect(observed.calls).toEqual(before);
});

test("N1 enabled consumer independently rebuilds the complete certification", () => {
  const result = consumeRuntimeCertificationV1({
    enabled: true,
    repository_root: root,
  }) as ConsumerResult;

  expect(result.status).toBe("certified");
  expect(result.reason).toBe("certification_chain_verified");
  expect(result.counts.fixtures_verified).toBe(28);
  expect(result.counts.shards_verified).toBe(28);
  expect(result.counts.scenarios_verified).toBe(14);
  expect(result.counts.file_reads).toBeLessThanOrEqual(CONSUMER_BUDGETS.max_files);
  expect(result.counts.bytes_read).toBeLessThanOrEqual(CONSUMER_BUDGETS.max_bytes);
  expect(result.observed).toMatchObject({
    aggregate_digest: CERTIFICATION_AUTHORITIES.final_aggregate_digest,
    delivery_digest: CERTIFICATION_AUTHORITIES.delivery_digest,
    freeze_manifest_digest: CERTIFICATION_AUTHORITIES.final_freeze_manifest_digest,
  });
  expect(result.failure_provenance).toBeNull();
  expect(Object.isFrozen(result)).toBe(true);
  expect(RESULT_STATUSES).toEqual([
    "certified",
    "incomplete",
    "tampered",
    "incompatible",
    "scope_rejected",
  ]);
});

test("N1 missing, extra, renamed and reordered certification artifacts fail closed", () => {
  const manifest = readJson(CERTIFICATION_PATHS.freeze_manifest);
  const entries = manifest.evidence_files as JsonObject[];
  const firstPath = String(entries[0].path);
  expect(consume(createObservedReadBoundary(root, { missing: [firstPath] }).boundary).status).toBe("incomplete");

  const changed = [
    manifestWith((value) => {
      (value.evidence_files as JsonObject[]).push(structuredClone(entries[0]));
    }),
    manifestWith((value) => {
      (value.evidence_files as JsonObject[])[0].path = "docs/recovery/action-661j5r9/runtime-evidence/renamed.json";
    }),
    manifestWith((value) => {
      (value.evidence_files as JsonObject[]).reverse();
    }),
  ];
  for (const bytes of changed) {
    const result = consume(
      createObservedReadBoundary(root, {
        overrides: [[CERTIFICATION_PATHS.freeze_manifest, bytes]],
      }).boundary,
    );
    expect(result.status).toBe("tampered");
    expect(result.reason).toBe("final_freeze_authority_mismatch");
  }
});

test("N1 rejects symlink and traversal boundaries before reading evidence", () => {
  const symlinked = createObservedReadBoundary(root, {
    symlinks: [CERTIFICATION_PATHS.aggregate],
  });
  const result = consume(symlinked.boundary);
  expect(result.status).toBe("scope_rejected");
  expect(result.reason).toBe("certification_symlink_rejected");

  const traversal = consumeRuntimeCertificationV1({
    enabled: true,
    repository_root: `${root}/../${root.split("/").at(-1)}`,
  }) as ConsumerResult;
  expect(traversal.status).toBe("scope_rejected");
  expect(traversal.reason).toBe("repository_root_not_canonical");
});

test("N1 rejects self-consistent evidence, aggregate and disclosure tampering", () => {
  const manifest = readJson(CERTIFICATION_PATHS.freeze_manifest);
  const firstEntry = (manifest.evidence_files as JsonObject[])[0];
  const firstPath = String(firstEntry.path);
  const persisted = structuredClone(readJson(firstPath));
  const record = persisted.record as JsonObject;
  const evidence = record.evidence as JsonObject;
  evidence.terminal_state = "completed";
  recomputeSelfDigest(evidence, "evidence_digest");
  record.evidence_digest = evidence.evidence_digest;
  recomputeSelfDigest(record, "record_digest");
  (persisted.shard as JsonObject).record_digest = record.record_digest;
  recomputeSelfDigest(persisted.shard as JsonObject, "shard_digest");
  persisted.record_digest = record.record_digest;
  persisted.shard_digest = (persisted.shard as JsonObject).shard_digest;
  recomputeSelfDigest(persisted, "canonical_file_digest");
  const evidenceResult = consume(
    createObservedReadBoundary(root, {
      overrides: [[firstPath, canonicalFixtureBytes(persisted)]],
    }).boundary,
  );
  expect(evidenceResult.status).toBe("tampered");
  expect(evidenceResult.reason).toBe("fixture_file_digest_mismatch");

  const aggregate = structuredClone(readJson(CERTIFICATION_PATHS.aggregate));
  aggregate.aggregate_status = "incomplete";
  recomputeSelfDigest(aggregate, "aggregate_digest");
  const aggregateResult = consume(
    createObservedReadBoundary(root, {
      overrides: [[CERTIFICATION_PATHS.aggregate, canonicalFixtureBytes(aggregate)]],
    }).boundary,
  );
  expect(aggregateResult.status).toBe("tampered");
  expect(aggregateResult.reason).toBe("aggregate_file_digest_mismatch");

  const disclosure = structuredClone(readJson(CERTIFICATION_PATHS.recovery_disclosure));
  delete disclosure.classification_rules;
  const disclosureResult = consume(
    createObservedReadBoundary(root, {
      overrides: [[CERTIFICATION_PATHS.recovery_disclosure, Buffer.from(JSON.stringify(disclosure))]],
    }).boundary,
  );
  expect(disclosureResult.status).toBe("tampered");
  expect(disclosureResult.reason).toBe("recovery_disclosure_file_digest_mismatch");
});

test("N1 has closed inputs, bounded fixtures and no execution-capable dependencies", () => {
  const result = consumeRuntimeCertificationV1({
    enabled: true,
    repository_root: root,
    unexpected: true,
  }) as ConsumerResult;
  expect(result.status).toBe("incompatible");
  expect(result.reason).toBe("consumer_request_invalid");
  expect(SYNTHETIC_ATTACK_CASES).toHaveLength(9);

  const source = readFileSync(consumerPath, "utf8");
  expect(source).not.toMatch(/node:(?:child_process|http|https|net|tls|worker_threads)/);
  expect(source).not.toMatch(/\b(?:writeFile|appendFile|mkdir|rmSync|unlink|exec|spawn)\w*\s*\(/);
  expect(source).not.toMatch(/process\.env|fetch\s*\(|docker/i);
  expect(readFileSync(fixturePath, "utf8")).not.toMatch(/\.\.\/\.\.\/lib\//);
});

test("N1 is deterministic across process and timezone boundaries", () => {
  const script = [
    "import {consumeRuntimeCertificationV1 as consume} from './lib/action-661j5n1-runtime-certification-consumer.mjs';",
    "const value=consume({enabled:true,repository_root:process.cwd()});",
    "console.log(JSON.stringify({status:value.status,reason:value.reason,counts:value.counts,observed:value.observed}));",
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
