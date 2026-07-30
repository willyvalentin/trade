import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import {
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { join, relative } from "node:path";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

const root = process.cwd();
const aggregatePath = join(
  root,
  "docs/recovery/action-661j5r9/runtime-evidence/action-661j5r9-twenty-eight-shard-aggregate.rebuild-v1.json",
);
const evidenceRoots = [
  "action-661j5r3a",
  "action-661j5r4",
  "action-661j5r5",
  "action-661j5r6",
  "action-661j5r6a",
  "action-661j5r7",
  "action-661j5r8",
  "action-661j5r9",
].map((action) => join(root, "docs/recovery", action, "runtime-evidence"));

const expectedAggregateDigest =
  "98064a290926d7b2ade45965eec3a21b41819763cb667a3a0c54f618600fe99d";
const expectedPriorAggregateFileHashes = new Map([
  [
    "docs/recovery/action-661j5r3a/runtime-evidence/action-661j5r2-mixed-ab-aggregate.rebuild-v1.json",
    "3b1713b42936193860f54f097226c73cd254f003c9b1e307f92b8a22f286a556",
  ],
  [
    "docs/recovery/action-661j5r4/runtime-evidence/action-661j5r4-eight-shard-aggregate.rebuild-v1.json",
    "0a354893760f4cedb42d99080dcbf2e831937494291f04068e406be12e1a4838",
  ],
  [
    "docs/recovery/action-661j5r5/runtime-evidence/action-661j5r5-twelve-shard-aggregate.rebuild-v1.json",
    "87da33bdb0fe2c3c683895efa4cfc492ddff53f6ecbfd34569f98bf82e450655",
  ],
  [
    "docs/recovery/action-661j5r6a/runtime-evidence/action-661j5r6-sixteen-shard-aggregate.rebuild-v1.json",
    "852c690b8162414b68bf5e51deb98b7e542bb548e59af935de8b009e95d6895a",
  ],
  [
    "docs/recovery/action-661j5r7/runtime-evidence/action-661j5r7-twenty-shard-aggregate.rebuild-v1.json",
    "d78fffa6eed1899c0d50e3b7e1a0fecfbbb197d4d2d3eea97a41f35cb10ec176",
  ],
  [
    "docs/recovery/action-661j5r8/runtime-evidence/action-661j5r8-twenty-four-shard-aggregate.rebuild-v1.json",
    "59aadefa50a344cdbcca88bf4a26579c38fdfa0409a70b213cdfa5b8d6ab2ad3",
  ],
]);

function fail(message: string): never {
  throw new Error(message);
}

function isPlainObject(value: unknown): value is JsonObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function parseObject(bytes: Buffer): JsonObject {
  const parsed: unknown = JSON.parse(bytes.toString("utf8"));
  return isPlainObject(parsed) ? parsed : fail("json_root_not_object");
}

function canonicalJson(value: JsonValue, seen = new Set<object>()): string {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("unsupported_number");
    return JSON.stringify(value);
  }
  if (typeof value !== "object") fail("unsupported_canonical_value");
  if (seen.has(value)) fail("canonical_cycle");
  seen.add(value);
  const result = Array.isArray(value)
    ? `[${value.map((entry) => canonicalJson(entry, seen)).join(",")}]`
    : `{${Object.keys(value)
        .sort()
        .map(
          (key) =>
            `${JSON.stringify(key)}:${canonicalJson(value[key], seen)}`,
        )
        .join(",")}}`;
  seen.delete(value);
  return result;
}

function sha256(value: JsonValue | Buffer | string): string {
  const bytes =
    Buffer.isBuffer(value) || typeof value === "string"
      ? value
      : canonicalJson(value);
  return createHash("sha256").update(bytes).digest("hex");
}

function object(value: JsonValue | undefined, path: string): JsonObject {
  return isPlainObject(value) ? value : fail(`${path}_not_object`);
}

function array(value: JsonValue | undefined, path: string): JsonValue[] {
  return Array.isArray(value) ? value : fail(`${path}_not_array`);
}

function string(value: JsonValue | undefined, path: string): string {
  return typeof value === "string" ? value : fail(`${path}_not_string`);
}

function omit(source: JsonObject, excluded: string): JsonObject {
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => key !== excluded),
  );
}

function jsonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(path);
    return entry.isFile() && entry.name.endsWith(".json") ? [path] : [];
  });
}

function evidenceFileIndex(): Map<string, string> {
  const index = new Map<string, string>();
  for (const path of evidenceRoots.flatMap(jsonFiles)) {
    const parsed = parseObject(readFileSync(path));
    if (
      typeof parsed.canonical_file_digest === "string" &&
      isPlainObject(parsed.record) &&
      isPlainObject(parsed.shard)
    ) {
      if (index.has(parsed.canonical_file_digest)) {
        fail(`duplicate_persisted_digest:${parsed.canonical_file_digest}`);
      }
      index.set(parsed.canonical_file_digest, path);
    }
  }
  return index;
}

function semanticProjection(file: JsonObject): JsonObject {
  const record = object(file.record, "record");
  const evidence = object(record.evidence, "evidence");
  return {
    atomicity_decision: evidence.atomicity_decision ?? fail("atomicity_missing"),
    diagnostic: evidence.diagnostic ?? fail("diagnostic_missing"),
    guarded_reads: evidence.guarded_reads ?? fail("guarded_reads_missing"),
    migration_applied:
      evidence.migration_applied ?? fail("migration_applied_missing"),
    policy_registry_digest:
      evidence.policy_registry_digest ?? fail("policy_registry_digest_missing"),
    poststate: evidence.poststate ?? fail("poststate_missing"),
    precondition_reference:
      evidence.precondition_reference ?? fail("precondition_reference_missing"),
    prestate: evidence.prestate ?? fail("prestate_missing"),
    protocol_version:
      evidence.protocol_version ?? fail("protocol_version_missing"),
    runner_identity: evidence.runner_identity ?? fail("runner_identity_missing"),
    runtime_capture_digest:
      evidence.runtime_capture_digest ?? fail("runtime_capture_digest_missing"),
    runtime_identity:
      evidence.runtime_identity ?? fail("runtime_identity_missing"),
    runtime_registry_digest:
      evidence.runtime_registry_digest ?? fail("runtime_registry_digest_missing"),
    scenario_id: evidence.scenario_id ?? fail("scenario_id_missing"),
    snapshot_schema_version:
      evidence.snapshot_schema_version ?? fail("snapshot_schema_version_missing"),
    terminal_state: evidence.terminal_state ?? fail("terminal_state_missing"),
  };
}

function containsReadinessField(value: JsonValue): boolean {
  if (Array.isArray(value)) return value.some(containsReadinessField);
  if (!isPlainObject(value)) return false;
  return Object.entries(value).some(
    ([key, entry]) =>
      key.toLowerCase().includes("readiness") ||
      containsReadinessField(entry),
  );
}

function domainValue(snapshot: JsonObject, domainId: string): JsonValue {
  for (const value of array(snapshot.domains, "snapshot.domains")) {
    const domain = object(value, "domain");
    if (domain.domain_id === domainId) {
      return domain.value ?? fail(`domain_value_missing:${domainId}`);
    }
  }
  return fail(`domain_missing:${domainId}`);
}

test("R10 independently reads back and rebuilds all 28 persisted chains", () => {
  const aggregateBytes = readFileSync(aggregatePath);
  const aggregate = parseObject(aggregateBytes);
  const inputs = array(aggregate.input_files, "aggregate.input_files");
  const index = evidenceFileIndex();
  const identities = new Set<string>();
  const scenarioRuns = new Map<string, Map<string, JsonObject>>();

  expect(inputs).toHaveLength(28);
  for (const inputValue of inputs) {
    const input = object(inputValue, "aggregate.input");
    const canonicalFileDigest = string(
      input.canonical_file_digest,
      "input.canonical_file_digest",
    );
    const path =
      index.get(canonicalFileDigest) ??
      fail(`persisted_file_not_found:${canonicalFileDigest}`);
    const bytes = readFileSync(path);
    const file = parseObject(bytes);
    const record = object(file.record, "file.record");
    const evidence = object(record.evidence, "record.evidence");
    const shard = object(file.shard, "file.shard");
    const scenarioId = string(record.scenario_id, "record.scenario_id");
    const runId = string(record.run_id, "record.run_id");
    const identity = `${scenarioId}/${runId}`;

    expect(identities.has(identity), `duplicate ${identity}`).toBe(false);
    identities.add(identity);
    expect(bytes.toString("utf8")).toBe(`${canonicalJson(file)}\n`);
    expect(sha256(omit(evidence, "evidence_digest"))).toBe(
      evidence.evidence_digest,
    );
    expect(record.evidence_digest).toBe(evidence.evidence_digest);
    expect(sha256(omit(record, "record_digest"))).toBe(record.record_digest);
    expect(sha256(omit(shard, "shard_digest"))).toBe(shard.shard_digest);
    expect(shard.record_digest).toBe(record.record_digest);
    expect(file.record_digest).toBe(record.record_digest);
    expect(file.shard_digest).toBe(shard.shard_digest);
    expect(sha256(omit(file, "canonical_file_digest"))).toBe(
      file.canonical_file_digest,
    );
    expect(file.canonical_file_digest).toBe(canonicalFileDigest);
    expect(input.record_digest).toBe(record.record_digest);
    expect(input.shard_digest).toBe(shard.shard_digest);
    expect(input.protocol_version).toBe(file.protocol_version);
    expect(input.scenario_id).toBe(scenarioId);
    expect(input.run_id).toBe(runId);
    expect(input.shard_id).toBe(record.shard_id);
    expect(statSync(path).isFile()).toBe(true);

    const runs = scenarioRuns.get(scenarioId) ?? new Map<string, JsonObject>();
    runs.set(runId, file);
    scenarioRuns.set(scenarioId, runs);
  }

  expect(identities.size).toBe(28);
  expect(scenarioRuns.size).toBe(14);
  for (const runs of scenarioRuns.values()) {
    expect([...runs.keys()].sort()).toEqual(["run-a", "run-b"]);
  }
});

test("R10 independently verifies 14 semantic digests and atomic decisions", () => {
  const aggregate = parseObject(readFileSync(aggregatePath));
  const inputs = array(aggregate.input_files, "aggregate.input_files");
  const comparisons = array(
    aggregate.scenario_comparisons,
    "aggregate.scenario_comparisons",
  );
  const comparisonByScenario = new Map(
    comparisons.map((value) => {
      const comparison = object(value, "comparison");
      return [
        string(comparison.scenario_id, "comparison.scenario_id"),
        comparison,
      ];
    }),
  );
  const index = evidenceFileIndex();
  const semanticDigests = new Map<string, string[]>();

  expect(comparisonByScenario.size).toBe(14);
  for (const inputValue of inputs) {
    const input = object(inputValue, "aggregate.input");
    const path =
      index.get(
        string(input.canonical_file_digest, "input.canonical_file_digest"),
      ) ?? fail("persisted_file_not_found");
    const file = parseObject(readFileSync(path));
    const record = object(file.record, "record");
    const evidence = object(record.evidence, "evidence");
    const scenarioId = string(record.scenario_id, "record.scenario_id");
    const projection = semanticProjection(file);
    const digest = sha256(projection);
    const accumulated = semanticDigests.get(scenarioId) ?? [];
    accumulated.push(digest);
    semanticDigests.set(scenarioId, accumulated);

    expect(containsReadinessField(projection)).toBe(false);
    const prestate = object(evidence.prestate, "evidence.prestate");
    const poststate = object(evidence.poststate, "evidence.poststate");
    if (scenarioId === "successful_containment") {
      expect(evidence.atomicity_decision).toBe("closed_transition_verified");
      expect(evidence.migration_applied).toBe(true);
      expect(evidence.terminal_state).toBe("completed");
      expect(prestate.combined_digest).not.toBe(poststate.combined_digest);
      expect(canonicalJson(domainValue(prestate, "target_data"))).toBe(
        canonicalJson(domainValue(poststate, "target_data")),
      );
    } else {
      expect(evidence.atomicity_decision).toBe("no_transition_verified");
      expect(evidence.migration_applied).toBe(false);
      expect(prestate.combined_digest).toBe(poststate.combined_digest);
      expect(canonicalJson(prestate)).toBe(canonicalJson(poststate));
    }
  }

  expect(semanticDigests.size).toBe(14);
  for (const [scenarioId, digests] of semanticDigests) {
    expect(digests).toHaveLength(2);
    expect(new Set(digests).size).toBe(1);
    const comparison =
      comparisonByScenario.get(scenarioId) ??
      fail(`comparison_missing:${scenarioId}`);
    expect(comparison.deterministic).toBe(true);
    expect(comparison.semantic_digest).toBe(digests[0]);
  }
});

test("R10 independently rebuilds final and predecessor aggregates", () => {
  const aggregateBytes = readFileSync(aggregatePath);
  const aggregate = parseObject(aggregateBytes);

  expect(aggregate.aggregate_digest).toBe(expectedAggregateDigest);
  expect(sha256(omit(aggregate, "aggregate_digest"))).toBe(
    expectedAggregateDigest,
  );
  expect(aggregateBytes.toString("utf8")).toBe(`${canonicalJson(aggregate)}\n`);
  expect(aggregate.decision).toBe("certified");
  expect(aggregate.shard_count).toBe(28);

  for (const [path, expectedHash] of expectedPriorAggregateFileHashes) {
    expect(sha256(readFileSync(join(root, path))), path).toBe(expectedHash);
  }
});

test("R10 audit source has no production verifier dependency", () => {
  const source = readFileSync(
    join(root, "tests/e2e/action-661j5r10-final-freeze-audit.spec.ts"),
    "utf8",
  );
  const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  expect(imports.sort()).toEqual([
    "@playwright/test",
    "node:crypto",
    "node:fs",
    "node:path",
  ]);
  expect(relative(root, aggregatePath)).toBe(
    "docs/recovery/action-661j5r9/runtime-evidence/action-661j5r9-twenty-eight-shard-aggregate.rebuild-v1.json",
  );
});
