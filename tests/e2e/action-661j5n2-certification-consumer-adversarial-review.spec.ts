import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import {
  CERTIFICATION_AUTHORITIES,
  CERTIFICATION_PATHS,
  CONSUMER_BUDGETS,
  createRuntimeCertificationConsumerV1,
} from "../../lib/action-661j5n1-runtime-certification-consumer.mjs";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

const root = process.cwd();
const preservationCommit = "a4d59fb11a3860715e3824cc36d2e01c078ced53";
const normativeDigest = "6cc8178c10da177ce9adbc197a88933e99e664ea87bedfd2a86b00e95b2fa6c9";
const normativePaths = [
  "docs/action-661j5n1-default-off-runtime-certification-consumer.md",
  "docs/action-661j5n1-runtime-certification-consumer-golden-report.json",
  "lib/action-661j5n1-runtime-certification-consumer.mjs",
  "tests/e2e/action-661j5n1-runtime-certification-consumer-fixtures.mjs",
  "tests/e2e/action-661j5n1-runtime-certification-consumer.spec.ts",
];

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

function object(value: JsonValue | undefined, path: string): JsonObject {
  return isPlainObject(value) ? value : fail(`${path}_not_object`);
}

function array(value: JsonValue | undefined, path: string): JsonValue[] {
  return Array.isArray(value) ? value : fail(`${path}_not_array`);
}

function string(value: JsonValue | undefined, path: string): string {
  return typeof value === "string" ? value : fail(`${path}_not_string`);
}

function parse(path: string): JsonObject {
  const value: unknown = JSON.parse(readFileSync(join(root, path), "utf8"));
  return isPlainObject(value) ? value : fail(`${path}_root_not_object`);
}

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

function without(value: JsonObject, field: string): JsonObject {
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== field));
}

function semanticProjection(evidence: JsonObject): JsonObject {
  return {
    atomicity_decision: evidence.atomicity_decision ?? null,
    diagnostic: evidence.diagnostic ?? null,
    guarded_reads: evidence.guarded_reads ?? null,
    migration_applied: evidence.migration_applied ?? null,
    policy_registry_digest: evidence.policy_registry_digest ?? null,
    poststate: evidence.poststate ?? null,
    precondition_reference: evidence.precondition_reference ?? null,
    prestate: evidence.prestate ?? null,
    protocol_version: evidence.protocol_version ?? null,
    runner_identity: evidence.runner_identity ?? null,
    runtime_capture_digest: evidence.runtime_capture_digest ?? null,
    runtime_identity: evidence.runtime_identity ?? null,
    runtime_registry_digest: evidence.runtime_registry_digest ?? null,
    scenario_id: evidence.scenario_id ?? null,
    snapshot_schema_version: evidence.snapshot_schema_version ?? null,
    terminal_state: evidence.terminal_state ?? null,
  };
}

function verifySnapshot(snapshot: JsonObject): void {
  const domains = array(snapshot.domains, "snapshot.domains").map((entry) =>
    object(entry, "snapshot.domain"),
  );
  expect(domains).toHaveLength(9);
  for (const domain of domains) {
    expect(domain.domain_digest).toBe(
      sha256({
        domain_id: domain.domain_id ?? null,
        domain_version: domain.domain_version ?? null,
        value: domain.value ?? null,
      }),
    );
  }
  expect(snapshot.combined_digest).toBe(
    sha256({
      domains,
      snapshot_contract: snapshot.snapshot_contract ?? null,
      snapshot_schema_version: snapshot.snapshot_schema_version ?? null,
      target_inventory: snapshot.target_inventory ?? null,
    }),
  );
}

function normativeProjection(): JsonObject {
  const artifacts = normativePaths.map((path) => {
    const bytes = readFileSync(join(root, path));
    return { byte_length: bytes.length, path, sha256: sha256(bytes) };
  });
  return { artifact_count: artifacts.length, artifacts, preservation_commit: preservationCommit };
}

test("N2 independently freezes exactly five preservation-identical artifacts", () => {
  expect(normativePaths).toHaveLength(5);
  expect(sha256(normativeProjection())).toBe(normativeDigest);
  for (const path of normativePaths) {
    const result = spawnSync("git", ["show", `${preservationCommit}:${path}`], {
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
    expect(result.status).toBe(0);
    expect(result.stderr).toEqual(Buffer.alloc(0));
    expect(result.stdout).toEqual(readFileSync(join(root, path)));
  }
});

test("N2 independently rebuilds all 28 evidence-record-shard-file chains", () => {
  const manifest = parse(CERTIFICATION_PATHS.freeze_manifest);
  const entries = array(manifest.evidence_files, "manifest.evidence_files").map((value) =>
    object(value, "manifest.evidence_entry"),
  );
  expect(entries).toHaveLength(28);
  const scenarioRuns = new Map<string, Set<string>>();
  for (const entry of entries) {
    const path = string(entry.path, "entry.path");
    const bytes = readFileSync(join(root, path));
    const file = parse(path);
    const record = object(file.record, "file.record");
    const shard = object(file.shard, "file.shard");
    const evidence = object(record.evidence, "record.evidence");
    verifySnapshot(object(evidence.prestate, "evidence.prestate"));
    verifySnapshot(object(evidence.poststate, "evidence.poststate"));
    expect(sha256(without(evidence, "evidence_digest"))).toBe(evidence.evidence_digest);
    expect(sha256(without(record, "record_digest"))).toBe(record.record_digest);
    expect(sha256(without(shard, "shard_digest"))).toBe(shard.shard_digest);
    expect(sha256(without(file, "canonical_file_digest"))).toBe(file.canonical_file_digest);
    expect(`${canonicalJson(file)}\n`).toBe(bytes.toString("utf8"));
    expect(sha256(bytes)).toBe(entry.file_sha256);
    expect(sha256(semanticProjection(evidence))).toBe(entry.semantic_digest);
    const scenario = string(record.scenario_id, "record.scenario_id");
    const runs = scenarioRuns.get(scenario) ?? new Set<string>();
    runs.add(string(record.run_id, "record.run_id"));
    scenarioRuns.set(scenario, runs);
    if (scenario === "successful_containment") {
      expect(evidence.atomicity_decision).toBe("closed_transition_verified");
      expect(evidence.migration_applied).toBe(true);
      const preTarget = array(object(evidence.prestate, "prestate").domains, "prestate.domains")[1];
      const postTarget = array(object(evidence.poststate, "poststate").domains, "poststate.domains")[1];
      expect(preTarget).toEqual(postTarget);
    } else {
      expect(evidence.atomicity_decision).toBe("no_transition_verified");
      expect(evidence.migration_applied).toBe(false);
      expect(evidence.prestate).toEqual(evidence.poststate);
    }
  }
  expect(scenarioRuns.size).toBe(14);
  for (const runs of scenarioRuns.values()) expect([...runs].sort()).toEqual(["run-a", "run-b"]);
});

test("N2 independently rebuilds final aggregate, freeze and recovery roots", () => {
  const aggregate = parse(CERTIFICATION_PATHS.aggregate);
  expect(sha256(without(aggregate, "aggregate_digest"))).toBe(
    CERTIFICATION_AUTHORITIES.final_aggregate_digest,
  );
  expect(array(aggregate.input_files, "aggregate.input_files")).toHaveLength(28);
  expect(array(aggregate.scenario_comparisons, "aggregate.scenario_comparisons")).toHaveLength(14);
  const manifest = parse(CERTIFICATION_PATHS.freeze_manifest);
  expect(sha256(without(manifest, "manifest_digest"))).toBe(
    CERTIFICATION_AUTHORITIES.final_freeze_manifest_digest,
  );
  const disclosure = parse(CERTIFICATION_PATHS.recovery_disclosure);
  expect(disclosure.decision).toBe("complete_certified_scope_not_recovered");
  expect(object(disclosure.audit, "disclosure.audit").complete_scope_recovered).toBe(false);
  expect(object(disclosure.audit, "disclosure.audit").partial_recovery_promoted).toBe(false);
});

test("N2 default-off and closed enablement remain zero-work and fail-closed", () => {
  const calls = { lstat: 0, readFile: 0, realpath: 0 };
  const boundary = Object.freeze({
    lstat(path: string) { calls.lstat += 1; return lstatSync(path); },
    readFile(path: string) { calls.readFile += 1; return readFileSync(path); },
    realpath(path: string) { calls.realpath += 1; return realpathSync(path); },
  });
  const consumer = createRuntimeCertificationConsumerV1(boundary);
  const off = consumer({});
  expect(off.status).toBe("incomplete");
  expect(off.counts.digests_computed).toBe(0);
  expect(calls).toEqual({ lstat: 0, readFile: 0, realpath: 0 });
  expect(consumer({ enabled: true, repository_root: root, path: "/tmp" }).status).toBe("incompatible");
  expect(consumer({ enabled: true, repository_root: "." }).status).toBe("scope_rejected");
  expect(consumer({ enabled: true, repository_root: `${root}/../${root.split("/").at(-1)}` }).status).toBe("scope_rejected");
});

test("N2 finding: lstat then path read permits a symlink-replacement read race", () => {
  let inventoryComplete = false;
  let readAfterInventory = false;
  const boundary = Object.freeze({
    lstat(path: string) {
      inventoryComplete = true;
      return lstatSync(path);
    },
    readFile() {
      readAfterInventory = inventoryComplete;
      return Buffer.from("synthetic-outside-root-bytes");
    },
    realpath(path: string) { return realpathSync(path); },
  });
  const result = createRuntimeCertificationConsumerV1(boundary)({
    enabled: true,
    repository_root: root,
  });
  expect(readAfterInventory).toBe(true);
  expect(result.status).toBe("tampered");
  expect(readFileSync(join(root, normativePaths[2]), "utf8")).toContain(
    "const absolute = checkedAbsolutePath(root, path, boundary, state);",
  );
  expect(readFileSync(join(root, normativePaths[2]), "utf8")).toContain(
    "bytes = boundary.readFile(absolute);",
  );
});

test("N2 finding: failure provenance has no collision-resistant identity", () => {
  const resultFor = (message: string) => createRuntimeCertificationConsumerV1(Object.freeze({
    lstat(path: string) { return lstatSync(path); },
    readFile() { throw new Error(message); },
    realpath(path: string) { return realpathSync(path); },
  }))({ enabled: true, repository_root: root });
  const left = resultFor("distinct-provider-failure-a");
  const right = resultFor("distinct-provider-failure-b");
  expect(left.failure_provenance).toEqual(right.failure_provenance);
  expect(left.failure_provenance).toEqual({
    expected_digest: null,
    observed_digest: null,
    path: CERTIFICATION_PATHS.freeze_manifest,
    stage: "certification_file_unreadable",
  });
  expect(Object.hasOwn(left.failure_provenance, "failure_digest")).toBe(false);
});

test("N2 finding: no explicit per-file byte budget is declared", () => {
  expect(CONSUMER_BUDGETS.max_files).toBe(96);
  expect(CONSUMER_BUDGETS.max_bytes).toBe(16 * 1024 * 1024);
  expect(Object.hasOwn(CONSUMER_BUDGETS, "max_file_bytes")).toBe(false);
});

test("N2 total-byte and iterative JSON traversal budgets reject oversized input", () => {
  const resultFor = (bytes: Buffer) => createRuntimeCertificationConsumerV1(Object.freeze({
    lstat(path: string) { return lstatSync(path); },
    readFile() { return Buffer.from(bytes); },
    realpath(path: string) { return realpathSync(path); },
  }))({ enabled: true, repository_root: root });
  expect(resultFor(Buffer.alloc(CONSUMER_BUDGETS.max_bytes + 1)).reason).toBe(
    "byte_budget_exceeded",
  );

  const nested = parse(CERTIFICATION_PATHS.freeze_manifest);
  let cursor: JsonObject = {};
  nested.review_budget_probe = cursor;
  for (let depth = 0; depth <= CONSUMER_BUDGETS.max_depth; depth += 1) {
    const next: JsonObject = {};
    cursor.next = next;
    cursor = next;
  }
  expect(resultFor(Buffer.from(JSON.stringify(nested))).reason).toBe(
    "json_depth_budget_exceeded",
  );

  const wide = parse(CERTIFICATION_PATHS.freeze_manifest);
  wide.review_budget_probe = Array.from(
    { length: CONSUMER_BUDGETS.max_array_entries + 1 },
    () => null,
  );
  expect(resultFor(Buffer.from(JSON.stringify(wide))).reason).toBe(
    "json_width_budget_exceeded",
  );

  const long = parse(CERTIFICATION_PATHS.freeze_manifest);
  long.review_budget_probe = "x".repeat(CONSUMER_BUDGETS.max_string_bytes + 1);
  expect(resultFor(Buffer.from(JSON.stringify(long))).reason).toBe(
    "json_string_budget_exceeded",
  );
});

test("N2 consumer has no runtime or live capabilities", () => {
  const source = readFileSync(join(root, normativePaths[2]), "utf8");
  expect(source).not.toMatch(/node:(?:child_process|http|https|net|tls|worker_threads)/);
  expect(source).not.toMatch(/process\.env|fetch\s*\(|docker/i);
  expect(source).not.toMatch(/\b(?:writeFile|appendFile|mkdir|rmSync|unlink|exec|spawn)\w*\s*\(/);
});

test("N2 normative projection is deterministic across timezone processes", () => {
  const script = [
    "import{createHash}from'node:crypto';import{readFileSync}from'node:fs';",
    `const p=${JSON.stringify(normativePaths)};`,
    "const s=x=>createHash('sha256').update(x).digest('hex');",
    "const c=v=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(c).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+c(v[k])).join(',')+'}';",
    `const a=p.map(path=>{const b=readFileSync(path);return{byte_length:b.length,path,sha256:s(b)}});console.log(s(c({artifact_count:a.length,artifacts:a,preservation_commit:'${preservationCommit}'})));`,
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
  expect(new Set(outputs)).toEqual(new Set([normativeDigest]));
});
