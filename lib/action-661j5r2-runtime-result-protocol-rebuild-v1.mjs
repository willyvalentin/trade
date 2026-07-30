import {
  existsSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";

import {
  ATOMIC_POLICY_REGISTRY,
  ATOMIC_POLICY_REGISTRY_DIGEST,
  REASON_CODES,
  RESULT_PROTOCOL_VERSION,
  RUNTIME_SCENARIO_REGISTRY,
  RUNTIME_SCENARIO_REGISTRY_DIGEST,
  SNAPSHOT_SCHEMA_VERSION,
  assertClosed,
  assertIdentifier,
  assertNoTransition,
  canonicalJson,
  deepFreeze,
  policyForScenario,
  selectionForScenario,
  sha256,
  verifyDiagnosticSidecar,
  verifyRuntimeIdentity,
  verifySnapshotV2Rebuild,
} from "./action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import {
  buildRunnerIdentityReceiptRebuildV1,
  verifyRunnerIdentityReceiptRebuildV1,
} from "./action-661j5r2-runtime-runner-authority-rebuild-v1.mjs";

export const ATOMIC_EVIDENCE_VERSION =
  "action_661j5r2_atomic_evidence_rebuild_v1";
export const RECORD_VERSION = "action_661j5r2_result_record_rebuild_v1";
export const SHARD_VERSION = "action_661j5r2_shard_result_set_rebuild_v1";
export const FILE_VERSION = "action_661j5r2_persisted_result_file_rebuild_v1";
export const PRECONDITION_REFERENCE_VERSION =
  "action_661j5r2_atomic_precondition_reference_rebuild_v1";

const CAPTURE_FIELDS = [
  "diagnostic",
  "guarded_reads",
  "poststate",
  "prestate",
  "runtime_capture_digest",
  "runtime_identity",
];
const REFERENCE_FIELDS = [
  "policy_registry_digest",
  "precondition_reference_digest",
  "precondition_reference_version",
  "relation_state",
  "scenario_id",
  "selected_forbidden_version",
  "target_relation",
];
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

function without(object, field) {
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => key !== field),
  );
}

function buildPreconditionReference(scenarioId) {
  const policy = policyForScenario(scenarioId);
  const projection = {
    precondition_reference_version: PRECONDITION_REFERENCE_VERSION,
    scenario_id: scenarioId,
    policy_registry_digest: ATOMIC_POLICY_REGISTRY_DIGEST,
    relation_state: policy.relation_state,
    selected_forbidden_version: policy.selected_forbidden_version,
    target_relation: policy.target_relation,
  };
  return deepFreeze({
    ...projection,
    precondition_reference_digest: sha256(projection),
  });
}

function verifyPreconditionReference(reference, scenarioId) {
  assertClosed(
    reference,
    REFERENCE_FIELDS,
    REASON_CODES.precondition_reference,
  );
  const expected = buildPreconditionReference(scenarioId);
  if (canonicalJson(reference) !== canonicalJson(expected)) {
    fail(REASON_CODES.precondition_reference);
  }
  return reference;
}

function expectedCaptureDigest(capture) {
  return sha256({
    diagnostic_digest: capture.diagnostic.diagnostic_digest,
    guarded_reads: normalizedGuardedReads(capture.guarded_reads),
    poststate_combined_digest: capture.poststate.combined_digest,
    prestate_combined_digest: capture.prestate.combined_digest,
    runtime_identity_digest: capture.runtime_identity.identity_digest,
  });
}

function normalizedGuardedReads(reads) {
  if (!Array.isArray(reads)) fail(REASON_CODES.guarded_read, "capture");
  return [...reads]
    .map((read) => structuredClone(read))
    .sort((left, right) => left.relation.localeCompare(right.relation));
}

function validateCapture(capture, scenarioId) {
  assertClosed(capture, CAPTURE_FIELDS);
  verifyRuntimeIdentity(capture.runtime_identity);
  verifyDiagnosticSidecar(capture.diagnostic, scenarioId);
  verifySnapshotV2Rebuild(capture.prestate);
  verifySnapshotV2Rebuild(capture.poststate);
  assertNoTransition(capture.prestate, capture.poststate);
  const guardedReads = normalizedGuardedReads(capture.guarded_reads);
  const missingPolicy = scenarioId === "missing_target";
  if (
    missingPolicy &&
    guardedReads.some(
      (read) => read.relation === "public.historical_candles",
    )
  ) {
    fail(REASON_CODES.guarded_read, "missing_target");
  }
  if (capture.runtime_capture_digest !== expectedCaptureDigest(capture)) {
    fail(REASON_CODES.evidence_digest, "runtime_capture");
  }
}

function evidenceProjection(evidence) {
  return without(evidence, "evidence_digest");
}

export function buildAtomicEvidenceRebuildV1({ capture, scenario_id }) {
  selectionForScenario(scenario_id);
  validateCapture(capture, scenario_id);
  const projection = {
    atomic_evidence_version: ATOMIC_EVIDENCE_VERSION,
    atomicity_decision: "no_transition_verified",
    diagnostic: capture.diagnostic,
    guarded_reads: normalizedGuardedReads(capture.guarded_reads),
    migration_applied: false,
    policy_registry: ATOMIC_POLICY_REGISTRY,
    policy_registry_digest: ATOMIC_POLICY_REGISTRY_DIGEST,
    poststate: capture.poststate,
    precondition_reference: buildPreconditionReference(scenario_id),
    prestate: capture.prestate,
    protocol_version: RESULT_PROTOCOL_VERSION,
    runner_identity: buildRunnerIdentityReceiptRebuildV1(),
    runtime_capture_digest: capture.runtime_capture_digest,
    runtime_identity: capture.runtime_identity,
    runtime_registry: RUNTIME_SCENARIO_REGISTRY,
    runtime_registry_digest: RUNTIME_SCENARIO_REGISTRY_DIGEST,
    scenario_id,
    snapshot_schema_version: SNAPSHOT_SCHEMA_VERSION,
    terminal_state: "controlled_error",
  };
  return deepFreeze({ ...projection, evidence_digest: sha256(projection) });
}

export function verifyAtomicEvidenceRebuildV1(evidence) {
  assertClosed(evidence, EVIDENCE_FIELDS);
  if (
    evidence.atomic_evidence_version !== ATOMIC_EVIDENCE_VERSION ||
    evidence.protocol_version !== RESULT_PROTOCOL_VERSION ||
    evidence.snapshot_schema_version !== SNAPSHOT_SCHEMA_VERSION
  ) {
    fail(REASON_CODES.protocol);
  }
  if (
    evidence.atomicity_decision !== "no_transition_verified" ||
    evidence.terminal_state !== "controlled_error" ||
    evidence.migration_applied !== false
  ) {
    fail(REASON_CODES.atomicity, "decision");
  }
  if (
    evidence.runtime_registry_digest !== RUNTIME_SCENARIO_REGISTRY_DIGEST ||
    canonicalJson(evidence.runtime_registry) !==
      canonicalJson(RUNTIME_SCENARIO_REGISTRY)
  ) {
    fail(REASON_CODES.runtime_registry);
  }
  if (
    evidence.policy_registry_digest !== ATOMIC_POLICY_REGISTRY_DIGEST ||
    canonicalJson(evidence.policy_registry) !==
      canonicalJson(ATOMIC_POLICY_REGISTRY)
  ) {
    fail(REASON_CODES.policy);
  }
  selectionForScenario(evidence.scenario_id);
  verifyPreconditionReference(
    evidence.precondition_reference,
    evidence.scenario_id,
  );
  verifyRunnerIdentityReceiptRebuildV1(evidence.runner_identity);
  validateCapture(
    {
      diagnostic: evidence.diagnostic,
      guarded_reads: evidence.guarded_reads,
      poststate: evidence.poststate,
      prestate: evidence.prestate,
      runtime_capture_digest: evidence.runtime_capture_digest,
      runtime_identity: evidence.runtime_identity,
    },
    evidence.scenario_id,
  );
  if (evidence.evidence_digest !== sha256(evidenceProjection(evidence))) {
    fail(REASON_CODES.evidence_digest);
  }
  return evidence;
}

export function buildResultRecordRebuildV1({
  evidence,
  run_id,
  shard_id,
}) {
  verifyAtomicEvidenceRebuildV1(evidence);
  assertIdentifier(run_id, "run_id");
  assertIdentifier(shard_id, "shard_id");
  const projection = {
    evidence,
    evidence_digest: evidence.evidence_digest,
    protocol_version: RESULT_PROTOCOL_VERSION,
    record_version: RECORD_VERSION,
    run_id,
    scenario_id: evidence.scenario_id,
    shard_id,
    terminal_status: "passed",
  };
  return deepFreeze({ ...projection, record_digest: sha256(projection) });
}

export function verifyResultRecordRebuildV1(record) {
  assertClosed(record, RECORD_FIELDS);
  verifyAtomicEvidenceRebuildV1(record.evidence);
  if (
    record.protocol_version !== RESULT_PROTOCOL_VERSION ||
    record.record_version !== RECORD_VERSION ||
    record.scenario_id !== record.evidence.scenario_id ||
    record.evidence_digest !== record.evidence.evidence_digest ||
    record.terminal_status !== "passed"
  ) {
    fail(REASON_CODES.record_digest, "fields");
  }
  assertIdentifier(record.run_id, "run_id");
  assertIdentifier(record.shard_id, "shard_id");
  if (record.record_digest !== sha256(without(record, "record_digest"))) {
    fail(REASON_CODES.record_digest);
  }
  return record;
}

export function buildShardEnvelopeRebuildV1(record) {
  verifyResultRecordRebuildV1(record);
  const projection = {
    declared_inventory: [record.scenario_id],
    protocol_version: RESULT_PROTOCOL_VERSION,
    record_digest: record.record_digest,
    result_inventory: [
      {
        record_digest: record.record_digest,
        scenario_id: record.scenario_id,
        terminal_status: record.terminal_status,
      },
    ],
    run_id: record.run_id,
    scenario_id: record.scenario_id,
    shard_id: record.shard_id,
    shard_version: SHARD_VERSION,
    terminal_count: 1,
  };
  return deepFreeze({ ...projection, shard_digest: sha256(projection) });
}

export function verifyShardEnvelopeRebuildV1(shard, record) {
  assertClosed(shard, SHARD_FIELDS);
  verifyResultRecordRebuildV1(record);
  const expected = buildShardEnvelopeRebuildV1(record);
  const inventoryProjection = without(shard, "shard_digest");
  const expectedInventoryProjection = without(expected, "shard_digest");
  if (
    canonicalJson(inventoryProjection) !==
    canonicalJson(expectedInventoryProjection)
  ) {
    fail(REASON_CODES.shard_inventory);
  }
  if (shard.shard_digest !== expected.shard_digest) {
    fail(REASON_CODES.shard_digest);
  }
  return shard;
}

function fileProjection(file) {
  return without(file, "canonical_file_digest");
}

export function buildPersistedFileRebuildV1({ record, shard }) {
  verifyShardEnvelopeRebuildV1(shard, record);
  const projection = {
    file_identity: `${record.run_id}.${record.shard_id}.${record.scenario_id}.rebuild-v1.json`,
    file_version: FILE_VERSION,
    protocol_version: RESULT_PROTOCOL_VERSION,
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

export function verifyPersistedFileRebuildV1(file) {
  assertClosed(file, FILE_FIELDS);
  verifyShardEnvelopeRebuildV1(file.shard, file.record);
  const expected = buildPersistedFileRebuildV1({
    record: file.record,
    shard: file.shard,
  });
  if (file.file_identity !== expected.file_identity) {
    fail(REASON_CODES.file_identity);
  }
  if (
    canonicalJson(fileProjection(file)) !==
    canonicalJson(fileProjection(expected))
  ) {
    fail(REASON_CODES.file_digest, "projection");
  }
  if (file.canonical_file_digest !== expected.canonical_file_digest) {
    fail(REASON_CODES.file_digest);
  }
  return file;
}

export function serializePersistedFileRebuildV1(file) {
  verifyPersistedFileRebuildV1(file);
  return `${canonicalJson(file)}\n`;
}

export function parsePersistedFileRebuildV1(bytes) {
  let parsed;
  try {
    parsed = JSON.parse(bytes);
  } catch {
    fail(REASON_CODES.persistence_readback, "json");
  }
  verifyPersistedFileRebuildV1(parsed);
  if (serializePersistedFileRebuildV1(parsed) !== bytes) {
    fail(REASON_CODES.persistence_readback, "canonical_bytes");
  }
  return deepFreeze(parsed);
}

export function persistRuntimeResultFileRebuildV1({ file, output_path }) {
  verifyPersistedFileRebuildV1(file);
  if (typeof output_path !== "string" || !output_path.endsWith(file.file_identity)) {
    fail(REASON_CODES.file_identity, "path");
  }
  const bytes = serializePersistedFileRebuildV1(file);
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
    parsePersistedFileRebuildV1(readFileSync(output_path, "utf8"));
  } catch (error) {
    if (existsSync(temporary)) unlinkSync(temporary);
    throw error;
  }
  return deepFreeze({ bytes, disposition: "written" });
}

export function buildRuntimeResultChainRebuildV1({
  capture,
  run_id,
  scenario_id,
  shard_id,
}) {
  const evidence = buildAtomicEvidenceRebuildV1({
    capture,
    scenario_id,
  });
  const record = buildResultRecordRebuildV1({ evidence, run_id, shard_id });
  const shard = buildShardEnvelopeRebuildV1(record);
  const file = buildPersistedFileRebuildV1({ record, shard });
  return deepFreeze({ evidence, record, shard, file });
}
