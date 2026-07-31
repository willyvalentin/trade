import {
  existsSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";

import {
  AGGREGATE_PROTOCOL_VERSION,
  REASON_CODES,
  assertClosed,
  canonicalJson,
  deepFreeze,
  sha256,
} from "./action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import {
  parsePersistedFileRebuildV1,
  verifyPersistedFileRebuildV1,
} from "./action-661j5r2-runtime-result-protocol-rebuild-v1.mjs";

const AGGREGATE_FIELDS = [
  "aggregate_digest",
  "aggregate_version",
  "decision",
  "input_files",
  "scenario_comparisons",
  "shard_count",
];
const EXPECTED = [
  ["forbidden_history", "run-a"],
  ["forbidden_history", "run-b"],
  ["missing_target", "run-a"],
  ["missing_target", "run-b"],
];

function fail(code, detail = "") {
  throw new Error(detail ? `${code}:${detail}` : code);
}

function semanticProjection(file) {
  const evidence = file.record.evidence;
  return {
    atomicity_decision: evidence.atomicity_decision,
    diagnostic: evidence.diagnostic,
    guarded_reads: evidence.guarded_reads,
    migration_applied: evidence.migration_applied,
    policy_registry_digest: evidence.policy_registry_digest,
    poststate: evidence.poststate,
    precondition_reference: evidence.precondition_reference,
    prestate: evidence.prestate,
    protocol_version: evidence.protocol_version,
    runner_identity: evidence.runner_identity,
    runtime_capture_digest: evidence.runtime_capture_digest,
    runtime_identity: evidence.runtime_identity,
    runtime_registry_digest: evidence.runtime_registry_digest,
    scenario_id: evidence.scenario_id,
    snapshot_schema_version: evidence.snapshot_schema_version,
    terminal_state: evidence.terminal_state,
  };
}

function normalizedInput(files) {
  if (!Array.isArray(files) || files.length !== 4) {
    fail(REASON_CODES.aggregate_inventory, "count");
  }
  const verified = files.map((file) => verifyPersistedFileRebuildV1(file));
  verified.sort((left, right) =>
    `${left.record.scenario_id}:${left.record.run_id}`.localeCompare(
      `${right.record.scenario_id}:${right.record.run_id}`,
    ),
  );
  const identities = verified.map((file) => [
    file.record.scenario_id,
    file.record.run_id,
  ]);
  if (canonicalJson(identities) !== canonicalJson(EXPECTED)) {
    fail(REASON_CODES.aggregate_inventory, "identities");
  }
  return verified;
}

export function buildMixedAbAggregateRebuildV1(files) {
  const verified = normalizedInput(files);
  const scenarioComparisons = [
    "forbidden_history",
    "missing_target",
  ].map((scenarioId) => {
    const pair = verified.filter(
      (file) => file.record.scenario_id === scenarioId,
    );
    const semanticDigests = pair.map((file) => sha256(semanticProjection(file)));
    if (semanticDigests[0] !== semanticDigests[1]) {
      fail(REASON_CODES.semantic_determinism, scenarioId);
    }
    return {
      atomicity_decision: "no_transition_verified",
      deterministic: true,
      scenario_id: scenarioId,
      semantic_digest: semanticDigests[0],
    };
  });
  const projection = {
    aggregate_version: AGGREGATE_PROTOCOL_VERSION,
    decision: "certified",
    input_files: verified.map((file) => ({
      canonical_file_digest: file.canonical_file_digest,
      protocol_version: file.protocol_version,
      record_digest: file.record_digest,
      run_id: file.record.run_id,
      scenario_id: file.record.scenario_id,
      shard_digest: file.shard_digest,
      shard_id: file.record.shard_id,
    })),
    scenario_comparisons: scenarioComparisons,
    shard_count: 4,
  };
  return deepFreeze({ ...projection, aggregate_digest: sha256(projection) });
}

export function verifyMixedAbAggregateRebuildV1(aggregate, files) {
  assertClosed(aggregate, AGGREGATE_FIELDS);
  const expected = buildMixedAbAggregateRebuildV1(files);
  const projection = Object.fromEntries(
    Object.entries(aggregate).filter(([key]) => key !== "aggregate_digest"),
  );
  const expectedProjection = Object.fromEntries(
    Object.entries(expected).filter(([key]) => key !== "aggregate_digest"),
  );
  if (canonicalJson(projection) !== canonicalJson(expectedProjection)) {
    fail(REASON_CODES.aggregate_inventory);
  }
  if (aggregate.aggregate_digest !== expected.aggregate_digest) {
    fail(REASON_CODES.aggregate_digest);
  }
  return aggregate;
}

export function serializeMixedAbAggregateRebuildV1(aggregate, files) {
  verifyMixedAbAggregateRebuildV1(aggregate, files);
  return `${canonicalJson(aggregate)}\n`;
}

export function persistMixedAbAggregateRebuildV1({
  aggregate,
  files,
  output_path,
}) {
  if (
    typeof output_path !== "string" ||
    !output_path.endsWith("action-661j5r2-mixed-ab-aggregate.rebuild-v1.json")
  ) {
    fail(REASON_CODES.file_identity, "aggregate_path");
  }
  const bytes = serializeMixedAbAggregateRebuildV1(aggregate, files);
  if (existsSync(output_path)) {
    if (readFileSync(output_path, "utf8") !== bytes) {
      fail(REASON_CODES.persistence_collision, "aggregate");
    }
    return deepFreeze({ bytes, disposition: "existing_identical" });
  }
  const temporary = `${output_path}.tmp`;
  try {
    writeFileSync(temporary, bytes, { encoding: "utf8", flag: "wx" });
    renameSync(temporary, output_path);
    const readback = JSON.parse(readFileSync(output_path, "utf8"));
    verifyMixedAbAggregateRebuildV1(readback, files);
  } catch (error) {
    if (existsSync(temporary)) unlinkSync(temporary);
    throw error;
  }
  return deepFreeze({ bytes, disposition: "written" });
}

export function parseAggregateInputsRebuildV1(fileBytes) {
  return fileBytes.map((bytes) => parsePersistedFileRebuildV1(bytes));
}
