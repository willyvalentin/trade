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
import { verifyColumnAclPolicyFileRebuildV1 } from "./action-661j5r7-column-acl-policy-result-protocol-rebuild-v1.mjs";
import { verifyRpcAppendOnlyFileRebuildV1 } from "./action-661j5r8-rpc-append-only-result-protocol-rebuild-v1.mjs";
import { verifyTriggerSuccessFileRebuildV1 } from "./action-661j5r9-trigger-success-result-protocol-rebuild-v1.mjs";

export const TWENTY_EIGHT_SHARD_AGGREGATE_VERSION =
  "action_661j5r9_twenty_eight_shard_aggregate_rebuild_v1";

const EXPECTED = [
  ["column_acl_state", "run-a"],
  ["column_acl_state", "run-b"],
  ["duplicate_containment_history", "run-a"],
  ["duplicate_containment_history", "run-b"],
  ["forbidden_history", "run-a"],
  ["forbidden_history", "run-b"],
  ["incident_history_present", "run-a"],
  ["incident_history_present", "run-b"],
  ["incompatible_append_only_function", "run-a"],
  ["incompatible_append_only_function", "run-b"],
  ["missing_action_650_history", "run-a"],
  ["missing_action_650_history", "run-b"],
  ["missing_target", "run-a"],
  ["missing_target", "run-b"],
  ["non_table", "run-a"],
  ["non_table", "run-b"],
  ["policy_state", "run-a"],
  ["policy_state", "run-b"],
  ["preexisting_proof_audit_trigger", "run-a"],
  ["preexisting_proof_audit_trigger", "run-b"],
  ["rpc_catalog_body_drift", "run-a"],
  ["rpc_catalog_body_drift", "run-b"],
  ["successful_containment", "run-a"],
  ["successful_containment", "run-b"],
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
  columnAclPolicyFiles,
  rpcAppendOnlyFiles,
  triggerSuccessFiles,
) {
  if (
    !Array.isArray(historicalFiles) ||
    historicalFiles.length !== 4 ||
    !Array.isArray(relationStateFiles) ||
    relationStateFiles.length !== 4 ||
    !Array.isArray(historyFiles) ||
    historyFiles.length !== 4 ||
    !Array.isArray(terminalFiles) ||
    terminalFiles.length !== 4 ||
    !Array.isArray(columnAclPolicyFiles) ||
    columnAclPolicyFiles.length !== 4 ||
    !Array.isArray(rpcAppendOnlyFiles) ||
    rpcAppendOnlyFiles.length !== 4 ||
    !Array.isArray(triggerSuccessFiles) ||
    triggerSuccessFiles.length !== 4
  ) fail(REASON_CODES.aggregate_inventory, "count");
  const verified = [
    ...historicalFiles.map(verifyPersistedFileRebuildV1),
    ...relationStateFiles.map(verifyRelationStateFileRebuildV1),
    ...historyFiles.map(verifyHistoryFileRebuildV1),
    ...terminalFiles.map(verifyTerminalFileRebuildV1),
    ...columnAclPolicyFiles.map(verifyColumnAclPolicyFileRebuildV1),
    ...rpcAppendOnlyFiles.map(verifyRpcAppendOnlyFileRebuildV1),
    ...triggerSuccessFiles.map(verifyTriggerSuccessFileRebuildV1),
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

export function buildTwentyEightShardAggregateRebuildV1({
  column_acl_policy_files,
  rpc_append_only_files,
  trigger_success_files,
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
    column_acl_policy_files,
    rpc_append_only_files,
    trigger_success_files,
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
    "column_acl_state",
    "policy_state",
    "preexisting_proof_audit_trigger",
    "rpc_catalog_body_drift",
    "incompatible_append_only_function",
    "successful_containment",
  ].map((scenarioId) => {
    const pair = files.filter(
      (file) => file.record.scenario_id === scenarioId,
    );
    const digests = pair.map((file) => sha256(semanticProjection(file)));
    if (digests[0] !== digests[1]) {
      fail(REASON_CODES.semantic_determinism, scenarioId);
    }
    return {
      atomicity_decision:
        pair[0].record.evidence.atomicity_decision,
      deterministic: true,
      scenario_id: scenarioId,
      semantic_digest: digests[0],
    };
  });
  const projection = {
    aggregate_version: TWENTY_EIGHT_SHARD_AGGREGATE_VERSION,
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
    shard_count: 28,
  };
  return deepFreeze({ ...projection, aggregate_digest: sha256(projection) });
}

export function verifyTwentyEightShardAggregateRebuildV1(
  aggregate,
  inputs,
) {
  assertClosed(aggregate, FIELDS);
  const expected = buildTwentyEightShardAggregateRebuildV1(inputs);
  if (canonicalJson(aggregate) !== canonicalJson(expected)) {
    fail(
      aggregate.aggregate_digest === expected.aggregate_digest
        ? REASON_CODES.aggregate_inventory
        : REASON_CODES.aggregate_digest,
    );
  }
  return aggregate;
}

export function persistTwentyEightShardAggregateRebuildV1({
  aggregate,
  column_acl_policy_files,
  rpc_append_only_files,
  trigger_success_files,
  historical_files,
  history_files,
  output_path,
  relation_state_files,
  terminal_files,
}) {
  if (
    typeof output_path !== "string" ||
    !output_path.endsWith(
      "action-661j5r9-twenty-eight-shard-aggregate.rebuild-v1.json",
    )
  ) fail(REASON_CODES.file_identity, "aggregate_path");
  verifyTwentyEightShardAggregateRebuildV1(aggregate, {
    column_acl_policy_files,
    rpc_append_only_files,
    trigger_success_files,
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
    verifyTwentyEightShardAggregateRebuildV1(readback, {
      column_acl_policy_files,
      rpc_append_only_files,
      trigger_success_files,
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
