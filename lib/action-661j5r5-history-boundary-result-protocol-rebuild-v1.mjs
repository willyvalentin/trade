import {
  existsSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";

import {
  REASON_CODES,
  SNAPSHOT_SCHEMA_VERSION,
  assertClosed,
  assertIdentifier,
  assertNoTransition,
  canonicalJson,
  deepFreeze,
  sha256,
  verifyRuntimeIdentity,
  verifySnapshotV2Rebuild,
} from "./action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import {
  HISTORY_POLICY_REGISTRY,
  HISTORY_POLICY_REGISTRY_DIGEST,
  HISTORY_RESULT_PROTOCOL_VERSION,
  HISTORY_RUNTIME_REGISTRY,
  HISTORY_RUNTIME_REGISTRY_DIGEST,
  buildHistoryPreconditionReference,
  expectedHistoryInventoryForScenario,
  historyPolicyForScenario,
  historySelectionForScenario,
  verifyHistoryPreconditionReference,
} from "./action-661j5r5-history-boundary-contracts-rebuild-v1.mjs";
import {
  buildHistoryRunnerIdentityReceiptRebuildV1,
  verifyHistoryRunnerIdentityReceiptRebuildV1,
} from "./action-661j5r5-history-boundary-runner-authority-rebuild-v1.mjs";

export const HISTORY_ATOMIC_EVIDENCE_VERSION =
  "action_661j5r5_history_boundary_atomic_evidence_rebuild_v1";
export const HISTORY_RECORD_VERSION =
  "action_661j5r5_history_boundary_record_rebuild_v1";
export const HISTORY_SHARD_VERSION =
  "action_661j5r5_history_boundary_shard_rebuild_v1";
export const HISTORY_FILE_VERSION =
  "action_661j5r5_history_boundary_persisted_file_rebuild_v1";

const EVIDENCE_FIELDS = [
  "atomic_evidence_version",
  "atomicity_decision",
  "diagnostic",
  "evidence_digest",
  "guarded_reads",
  "migration_applied",
  "policy_registry",
  "policy_registry_digest",
  "poststate",
  "precondition_reference",
  "prestate",
  "protocol_version",
  "runner_identity",
  "runtime_capture_digest",
  "runtime_identity",
  "runtime_registry",
  "runtime_registry_digest",
  "scenario_id",
  "snapshot_schema_version",
  "terminal_state",
];
const RECORD_FIELDS = [
  "evidence",
  "evidence_digest",
  "protocol_version",
  "record_digest",
  "record_version",
  "run_id",
  "scenario_id",
  "shard_id",
  "terminal_status",
];
const SHARD_FIELDS = [
  "declared_inventory",
  "protocol_version",
  "record_digest",
  "result_inventory",
  "run_id",
  "scenario_id",
  "shard_digest",
  "shard_id",
  "shard_version",
  "terminal_count",
];
const FILE_FIELDS = [
  "canonical_file_digest",
  "file_identity",
  "file_version",
  "protocol_version",
  "record",
  "record_digest",
  "shard",
  "shard_digest",
];

function fail(code, detail = "") {
  throw new Error(detail ? `${code}:${detail}` : code);
}

function without(value, field) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== field),
  );
}

function normalizedReads(reads) {
  if (!Array.isArray(reads)) fail(REASON_CODES.guarded_read, "capture");
  return [...reads]
    .map((read) => structuredClone(read))
    .sort((left, right) => left.relation.localeCompare(right.relation));
}

function verifyDiagnostic(diagnostic, scenarioId) {
  const policy = historyPolicyForScenario(scenarioId);
  assertClosed(diagnostic, [
    "classification",
    "diagnostic_digest",
    "diagnostic_sanitized",
    "migration_applied",
    "reason",
    "safety",
    "scenario_id",
    "sidecar_version",
    "sqlstate",
    "terminal_state",
  ], REASON_CODES.diagnostic);
  assertClosed(diagnostic.safety, [
    "connection_string_present",
    "credential_material_present",
    "query_text_present",
    "raw_error_object_present",
    "stack_trace_present",
  ], REASON_CODES.diagnostic);
  const projection = without(diagnostic, "diagnostic_digest");
  if (
    diagnostic.sidecar_version !==
      "action_661j5r5_history_boundary_diagnostic_sidecar_rebuild_v1" ||
    diagnostic.scenario_id !== scenarioId ||
    diagnostic.terminal_state !== "controlled_error" ||
    diagnostic.sqlstate !== policy.terminal_sqlstate ||
    diagnostic.reason !== policy.terminal_reason ||
    diagnostic.classification !== policy.classification ||
    diagnostic.diagnostic_sanitized !== true ||
    diagnostic.migration_applied !== false ||
    Object.values(diagnostic.safety).some((value) => value !== false) ||
    diagnostic.diagnostic_digest !== sha256(projection)
  ) {
    fail(REASON_CODES.diagnostic, scenarioId);
  }
}

function migrationHistory(snapshot) {
  return snapshot.domains.find(
    (domain) => domain.domain_id === "migration_history",
  ).value;
}

function expectedCaptureDigest(capture) {
  return sha256({
    diagnostic_digest: capture.diagnostic.diagnostic_digest,
    guarded_reads: normalizedReads(capture.guarded_reads),
    poststate_combined_digest: capture.poststate.combined_digest,
    prestate_combined_digest: capture.prestate.combined_digest,
    runtime_identity_digest: capture.runtime_identity.identity_digest,
  });
}

function validateCapture(capture, scenarioId) {
  assertClosed(capture, [
    "diagnostic",
    "guarded_reads",
    "poststate",
    "prestate",
    "runtime_capture_digest",
    "runtime_identity",
  ]);
  verifyDiagnostic(capture.diagnostic, scenarioId);
  verifyRuntimeIdentity(capture.runtime_identity);
  verifySnapshotV2Rebuild(capture.prestate);
  verifySnapshotV2Rebuild(capture.poststate);
  assertNoTransition(capture.prestate, capture.poststate);
  for (const snapshot of [capture.prestate, capture.poststate]) {
    if (
      canonicalJson(migrationHistory(snapshot)) !==
      canonicalJson(expectedHistoryInventoryForScenario(scenarioId))
    ) {
      fail(REASON_CODES.precondition_reference, "history_inventory");
    }
  }
  if (capture.runtime_capture_digest !== expectedCaptureDigest(capture)) {
    fail(REASON_CODES.evidence_digest, "runtime_capture");
  }
}

export function buildHistoryAtomicEvidenceRebuildV1({
  capture,
  scenario_id,
}) {
  historySelectionForScenario(scenario_id);
  validateCapture(capture, scenario_id);
  const projection = {
    atomic_evidence_version: HISTORY_ATOMIC_EVIDENCE_VERSION,
    atomicity_decision: "no_transition_verified",
    diagnostic: capture.diagnostic,
    guarded_reads: normalizedReads(capture.guarded_reads),
    migration_applied: false,
    policy_registry: HISTORY_POLICY_REGISTRY,
    policy_registry_digest: HISTORY_POLICY_REGISTRY_DIGEST,
    poststate: capture.poststate,
    precondition_reference:
      buildHistoryPreconditionReference(scenario_id),
    prestate: capture.prestate,
    protocol_version: HISTORY_RESULT_PROTOCOL_VERSION,
    runner_identity: buildHistoryRunnerIdentityReceiptRebuildV1(),
    runtime_capture_digest: capture.runtime_capture_digest,
    runtime_identity: capture.runtime_identity,
    runtime_registry: HISTORY_RUNTIME_REGISTRY,
    runtime_registry_digest: HISTORY_RUNTIME_REGISTRY_DIGEST,
    scenario_id,
    snapshot_schema_version: SNAPSHOT_SCHEMA_VERSION,
    terminal_state: "controlled_error",
  };
  return deepFreeze({ ...projection, evidence_digest: sha256(projection) });
}

export function verifyHistoryAtomicEvidenceRebuildV1(evidence) {
  assertClosed(evidence, EVIDENCE_FIELDS);
  if (
    evidence.atomic_evidence_version !== HISTORY_ATOMIC_EVIDENCE_VERSION ||
    evidence.protocol_version !== HISTORY_RESULT_PROTOCOL_VERSION ||
    evidence.snapshot_schema_version !== SNAPSHOT_SCHEMA_VERSION ||
    evidence.atomicity_decision !== "no_transition_verified" ||
    evidence.terminal_state !== "controlled_error" ||
    evidence.migration_applied !== false
  ) fail(REASON_CODES.protocol);
  if (
    canonicalJson(evidence.policy_registry) !==
      canonicalJson(HISTORY_POLICY_REGISTRY) ||
    evidence.policy_registry_digest !== HISTORY_POLICY_REGISTRY_DIGEST
  ) fail(REASON_CODES.policy);
  if (
    canonicalJson(evidence.runtime_registry) !==
      canonicalJson(HISTORY_RUNTIME_REGISTRY) ||
    evidence.runtime_registry_digest !== HISTORY_RUNTIME_REGISTRY_DIGEST
  ) fail(REASON_CODES.runtime_registry);
  verifyHistoryPreconditionReference(
    evidence.precondition_reference,
    evidence.scenario_id,
  );
  verifyHistoryRunnerIdentityReceiptRebuildV1(evidence.runner_identity);
  validateCapture({
    diagnostic: evidence.diagnostic,
    guarded_reads: evidence.guarded_reads,
    poststate: evidence.poststate,
    prestate: evidence.prestate,
    runtime_capture_digest: evidence.runtime_capture_digest,
    runtime_identity: evidence.runtime_identity,
  }, evidence.scenario_id);
  if (evidence.evidence_digest !== sha256(without(evidence, "evidence_digest"))) {
    fail(REASON_CODES.evidence_digest);
  }
  return evidence;
}

export function buildHistoryRecordRebuildV1({
  evidence,
  run_id,
  shard_id,
}) {
  verifyHistoryAtomicEvidenceRebuildV1(evidence);
  assertIdentifier(run_id, "run_id");
  assertIdentifier(shard_id, "shard_id");
  const projection = {
    evidence,
    evidence_digest: evidence.evidence_digest,
    protocol_version: HISTORY_RESULT_PROTOCOL_VERSION,
    record_version: HISTORY_RECORD_VERSION,
    run_id,
    scenario_id: evidence.scenario_id,
    shard_id,
    terminal_status: "passed",
  };
  return deepFreeze({ ...projection, record_digest: sha256(projection) });
}

export function verifyHistoryRecordRebuildV1(record) {
  assertClosed(record, RECORD_FIELDS);
  verifyHistoryAtomicEvidenceRebuildV1(record.evidence);
  if (
    record.protocol_version !== HISTORY_RESULT_PROTOCOL_VERSION ||
    record.record_version !== HISTORY_RECORD_VERSION ||
    record.scenario_id !== record.evidence.scenario_id ||
    record.evidence_digest !== record.evidence.evidence_digest ||
    record.terminal_status !== "passed" ||
    record.record_digest !== sha256(without(record, "record_digest"))
  ) fail(REASON_CODES.record_digest);
  return record;
}

export function buildHistoryShardRebuildV1(record) {
  verifyHistoryRecordRebuildV1(record);
  const projection = {
    declared_inventory: [record.scenario_id],
    protocol_version: HISTORY_RESULT_PROTOCOL_VERSION,
    record_digest: record.record_digest,
    result_inventory: [{
      record_digest: record.record_digest,
      scenario_id: record.scenario_id,
      terminal_status: record.terminal_status,
    }],
    run_id: record.run_id,
    scenario_id: record.scenario_id,
    shard_id: record.shard_id,
    shard_version: HISTORY_SHARD_VERSION,
    terminal_count: 1,
  };
  return deepFreeze({ ...projection, shard_digest: sha256(projection) });
}

export function verifyHistoryShardRebuildV1(shard, record) {
  assertClosed(shard, SHARD_FIELDS);
  const expected = buildHistoryShardRebuildV1(record);
  if (canonicalJson(shard) !== canonicalJson(expected)) {
    fail(
      shard.shard_digest === expected.shard_digest
        ? REASON_CODES.shard_inventory
        : REASON_CODES.shard_digest,
    );
  }
  return shard;
}

export function buildHistoryFileRebuildV1({ record, shard }) {
  verifyHistoryShardRebuildV1(shard, record);
  const projection = {
    file_identity: `${record.run_id}.${record.shard_id}.${record.scenario_id}.history-boundary-rebuild-v1.json`,
    file_version: HISTORY_FILE_VERSION,
    protocol_version: HISTORY_RESULT_PROTOCOL_VERSION,
    record,
    record_digest: record.record_digest,
    shard,
    shard_digest: shard.shard_digest,
  };
  return deepFreeze({
    ...projection,
    canonical_file_digest: sha256(projection),
  });
}

export function verifyHistoryFileRebuildV1(file) {
  assertClosed(file, FILE_FIELDS);
  const expected = buildHistoryFileRebuildV1({
    record: file.record,
    shard: file.shard,
  });
  if (file.file_identity !== expected.file_identity) {
    fail(REASON_CODES.file_identity);
  }
  if (canonicalJson(file) !== canonicalJson(expected)) {
    fail(REASON_CODES.file_digest);
  }
  return file;
}

export function serializeHistoryFileRebuildV1(file) {
  verifyHistoryFileRebuildV1(file);
  return `${canonicalJson(file)}\n`;
}

export function parseHistoryFileRebuildV1(bytes) {
  let parsed;
  try {
    parsed = JSON.parse(bytes);
  } catch {
    fail(REASON_CODES.persistence_readback, "json");
  }
  verifyHistoryFileRebuildV1(parsed);
  if (serializeHistoryFileRebuildV1(parsed) !== bytes) {
    fail(REASON_CODES.persistence_readback, "canonical_bytes");
  }
  return deepFreeze(parsed);
}

export function persistHistoryResultFileRebuildV1({
  file,
  output_path,
}) {
  verifyHistoryFileRebuildV1(file);
  if (
    typeof output_path !== "string" ||
    !output_path.endsWith(file.file_identity)
  ) fail(REASON_CODES.file_identity, "path");
  const bytes = serializeHistoryFileRebuildV1(file);
  if (existsSync(output_path)) {
    if (readFileSync(output_path, "utf8") !== bytes) {
      fail(REASON_CODES.persistence_collision);
    }
    return deepFreeze({ bytes, disposition: "existing_identical" });
  }
  const temporary = `${output_path}.tmp`;
  try {
    writeFileSync(temporary, bytes, { encoding: "utf8", flag: "wx" });
    renameSync(temporary, output_path);
    parseHistoryFileRebuildV1(readFileSync(output_path, "utf8"));
  } catch (error) {
    if (existsSync(temporary)) unlinkSync(temporary);
    throw error;
  }
  return deepFreeze({ bytes, disposition: "written" });
}

export function buildHistoryResultChainRebuildV1({
  capture,
  run_id,
  scenario_id,
  shard_id,
}) {
  const evidence = buildHistoryAtomicEvidenceRebuildV1({
    capture,
    scenario_id,
  });
  const record = buildHistoryRecordRebuildV1({
    evidence,
    run_id,
    shard_id,
  });
  const shard = buildHistoryShardRebuildV1(record);
  const file = buildHistoryFileRebuildV1({ record, shard });
  return deepFreeze({ evidence, file, record, shard });
}
