import {
  existsSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";

import {
  REASON_CODES,
  assertClosed,
  canonicalJson,
  deepFreeze,
  sha256,
} from "./action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import { verifyPersistedFileRebuildV1 } from "./action-661j5r2-runtime-result-protocol-rebuild-v1.mjs";
import { verifyRelationStateFileRebuildV1 } from "./action-661j5r4-relation-state-result-protocol-rebuild-v1.mjs";
import { verifyHistoryFileRebuildV1 } from "./action-661j5r5-history-boundary-result-protocol-rebuild-v1.mjs";
import { verifyTerminalFileRebuildV1 } from "./action-661j5r6-terminal-boundary-result-protocol-rebuild-v1.mjs";

export const SIXTEEN_SHARD_AGGREGATE_VERSION =
  "action_661j5r6_sixteen_shard_aggregate_rebuild_v1";

const EXPECTED = [
  ["duplicate_containment_history", "run-a"],
  ["duplicate_containment_history", "run-b"],
  ["forbidden_history", "run-a"],
  ["forbidden_history", "run-b"],
  ["incident_history_present", "run-a"],
  ["incident_history_present", "run-b"],
  ["missing_action_650_history", "run-a"],
  ["missing_action_650_history", "run-b"],
  ["missing_target", "run-a"],
  ["missing_target", "run-b"],
  ["non_table", "run-a"],
  ["non_table", "run-b"],
  ["unknown_acl_state", "run-a"],
  ["unknown_acl_state", "run-b"],
  ["wrong_owner", "run-a"],
  ["wrong_owner", "run-b"],
];
const FIELDS = [
  "aggregate_digest",
  "aggregate_version",
  "decision",
  "input_files",
  "scenario_comparisons",
  "shard_count",
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

function normalizedFiles(
  historicalFiles,
  relationStateFiles,
  historyFiles,
  terminalFiles,
) {
  if (
    !Array.isArray(historicalFiles) ||
    historicalFiles.length !== 4 ||
    !Array.isArray(relationStateFiles) ||
    relationStateFiles.length !== 4 ||
    !Array.isArray(historyFiles) ||
    historyFiles.length !== 4 ||
    !Array.isArray(terminalFiles) ||
    terminalFiles.length !== 4
  ) fail(REASON_CODES.aggregate_inventory, "count");
  const verified = [
    ...historicalFiles.map(verifyPersistedFileRebuildV1),
    ...relationStateFiles.map(verifyRelationStateFileRebuildV1),
    ...historyFiles.map(verifyHistoryFileRebuildV1),
    ...terminalFiles.map(verifyTerminalFileRebuildV1),
  ].sort((left, right) =>
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

export function buildSixteenShardAggregateRebuildV1({
  historical_files,
  history_files,
  relation_state_files,
  terminal_files,
}) {
  const files = normalizedFiles(
    historical_files,
    relation_state_files,
    history_files,
    terminal_files,
  );
  const scenarioComparisons = [
    "forbidden_history",
    "missing_target",
    "non_table",
    "wrong_owner",
    "missing_action_650_history",
    "incident_history_present",
    "duplicate_containment_history",
    "unknown_acl_state",
  ].map((scenarioId) => {
    const pair = files.filter(
      (file) => file.record.scenario_id === scenarioId,
    );
    const digests = pair.map((file) => sha256(semanticProjection(file)));
    if (digests[0] !== digests[1]) {
      fail(REASON_CODES.semantic_determinism, scenarioId);
    }
    return {
      atomicity_decision: "no_transition_verified",
      deterministic: true,
      scenario_id: scenarioId,
      semantic_digest: digests[0],
    };
  });
  const projection = {
    aggregate_version: SIXTEEN_SHARD_AGGREGATE_VERSION,
    decision: "certified",
    input_files: files.map((file) => ({
      canonical_file_digest: file.canonical_file_digest,
      protocol_version: file.protocol_version,
      record_digest: file.record_digest,
      run_id: file.record.run_id,
      scenario_id: file.record.scenario_id,
      shard_digest: file.shard_digest,
      shard_id: file.record.shard_id,
    })),
    scenario_comparisons: scenarioComparisons,
    shard_count: 16,
  };
  return deepFreeze({ ...projection, aggregate_digest: sha256(projection) });
}

export function verifySixteenShardAggregateRebuildV1(
  aggregate,
  inputs,
) {
  assertClosed(aggregate, FIELDS);
  const expected = buildSixteenShardAggregateRebuildV1(inputs);
  if (canonicalJson(aggregate) !== canonicalJson(expected)) {
    fail(
      aggregate.aggregate_digest === expected.aggregate_digest
        ? REASON_CODES.aggregate_inventory
        : REASON_CODES.aggregate_digest,
    );
  }
  return aggregate;
}

export function persistSixteenShardAggregateRebuildV1({
  aggregate,
  historical_files,
  history_files,
  output_path,
  relation_state_files,
  terminal_files,
}) {
  if (
    typeof output_path !== "string" ||
    !output_path.endsWith(
      "action-661j5r6-sixteen-shard-aggregate.rebuild-v1.json",
    )
  ) fail(REASON_CODES.file_identity, "aggregate_path");
  verifySixteenShardAggregateRebuildV1(aggregate, {
    historical_files,
    history_files,
    relation_state_files,
    terminal_files,
  });
  const bytes = `${canonicalJson(aggregate)}\n`;
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
    verifySixteenShardAggregateRebuildV1(readback, {
      historical_files,
      history_files,
      relation_state_files,
      terminal_files,
    });
  } catch (error) {
    if (existsSync(temporary)) unlinkSync(temporary);
    throw error;
  }
  return deepFreeze({ bytes, disposition: "written" });
}
