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
  TRIGGER_SUCCESS_POLICY_REGISTRY,
  TRIGGER_SUCCESS_POLICY_REGISTRY_DIGEST,
  TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
  TRIGGER_SUCCESS_RUNTIME_REGISTRY,
  TRIGGER_SUCCESS_RUNTIME_REGISTRY_DIGEST,
  CONTAINMENT_TRIGGER,
  APPEND_ONLY_BASELINE,
  BASELINE_HISTORY_INVENTORY,
  FROZEN_EIGHT_RPC_INVENTORY,
  PREEXISTING_TRIGGER,
  SUCCESS_HISTORY_ENTRY,
  SUCCESS_POST_RPC_INVENTORY,
  SUCCESS_TARGET_ACL,
  buildTriggerSuccessPreconditionReference,
  triggerSuccessPolicyForScenario,
  triggerSuccessSelectionForScenario,
  verifyTriggerSuccessPreconditionReference,
} from "./action-661j5r9-trigger-success-contracts-rebuild-v1.mjs";
import {
  buildTriggerSuccessRunnerIdentityReceiptRebuildV1,
  verifyTriggerSuccessRunnerIdentityReceiptRebuildV1,
} from "./action-661j5r9-trigger-success-runner-authority-rebuild-v1.mjs";

export const TRIGGER_SUCCESS_ATOMIC_EVIDENCE_VERSION =
  "action_661j5r9_trigger_success_atomic_evidence_rebuild_v1";
export const TRIGGER_SUCCESS_RECORD_VERSION =
  "action_661j5r9_trigger_success_record_rebuild_v1";
export const TRIGGER_SUCCESS_SHARD_VERSION =
  "action_661j5r9_trigger_success_shard_rebuild_v1";
export const TRIGGER_SUCCESS_FILE_VERSION =
  "action_661j5r9_trigger_success_persisted_file_rebuild_v1";

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
  const policy = triggerSuccessPolicyForScenario(scenarioId);
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
      "action_661j5r9_trigger_success_diagnostic_sidecar_rebuild_v1" ||
    diagnostic.scenario_id !== scenarioId ||
    diagnostic.terminal_state !== policy.terminal_state ||
    diagnostic.sqlstate !== policy.terminal_sqlstate ||
    diagnostic.reason !== policy.terminal_reason ||
    diagnostic.classification !== policy.classification ||
    diagnostic.diagnostic_sanitized !== true ||
    diagnostic.migration_applied !== policy.migration_applied ||
    Object.values(diagnostic.safety).some((value) => value !== false) ||
    diagnostic.diagnostic_digest !== sha256(projection)
  ) {
    fail(REASON_CODES.diagnostic, scenarioId);
  }
}

function domainValue(snapshot, domainId) {
  const domain = snapshot.domains.find(
    (domain) => domain.domain_id === domainId,
  );
  if (!domain) fail(REASON_CODES.snapshot_domain, domainId);
  return domain.value;
}

const TARGET_RELATIONS = [
  "public.bounded_shadow_collector_proof_audits",
  "public.continuous_intelligence_credit_ledger",
  "public.continuous_intelligence_shadow_canary_daily_claims",
  "public.continuous_intelligence_shadow_canary_manual_authorizations",
  "public.historical_candle_fetch_runs",
  "public.historical_candles",
];

function matchingRpcEntries(snapshot, expected) {
  const identities = new Set(expected.map((entry) => entry.identity));
  return domainValue(snapshot, "rpc_catalog").filter((entry) =>
    identities.has(entry.identity)
  );
}

function appendOnlyEntries(snapshot) {
  return domainValue(snapshot, "rpc_catalog").filter(
    (entry) =>
      entry.identity === "action_650_reject_execution_audit_mutation()",
  );
}

function targetAcl(snapshot) {
  return domainValue(snapshot, "table_acl").filter((entry) =>
    TARGET_RELATIONS.includes(entry.relation)
  );
}

function nonTargetAcl(snapshot) {
  return domainValue(snapshot, "table_acl").filter(
    (entry) => !TARGET_RELATIONS.includes(entry.relation),
  );
}

function proofAuditTriggers(snapshot) {
  return domainValue(snapshot, "trigger_catalog").filter(
    (entry) =>
      entry.relation === "public.bounded_shadow_collector_proof_audits",
  );
}

function otherTriggers(snapshot) {
  return domainValue(snapshot, "trigger_catalog").filter(
    (entry) =>
      entry.relation !== "public.bounded_shadow_collector_proof_audits",
  );
}

function nonSelectedRpc(snapshot) {
  const identities = new Set(
    SUCCESS_POST_RPC_INVENTORY.map((entry) => entry.identity),
  );
  return domainValue(snapshot, "rpc_catalog").filter(
    (entry) => !identities.has(entry.identity),
  );
}

function assertCanonicalEqual(left, right, code, detail) {
  if (canonicalJson(left) !== canonicalJson(right)) fail(code, detail);
}

function validateEarlierBoundaries(snapshot) {
  const schema = domainValue(snapshot, "schema_relations");
  for (const relation of TARGET_RELATIONS) {
    const [namespace, name] = relation.split(".");
    const matches = schema.filter(
      (entry) =>
        entry.namespace === namespace &&
        entry.relation === name &&
        entry.relkind === "r" &&
        entry.owner === "postgres",
    );
    if (matches.length !== 1) {
      fail(REASON_CODES.precondition_reference, `target:${relation}`);
    }
  }
  if (
    domainValue(snapshot, "rls_policies").some((entry) =>
      TARGET_RELATIONS.includes(entry.relation)
    ) ||
    domainValue(snapshot, "column_acl").some((entry) =>
      TARGET_RELATIONS.includes(entry.relation)
    ) ||
    targetAcl(snapshot).some(
      (entry) =>
        !["postgres", "anon", "authenticated", "service_role"].includes(
          entry.grantee,
        ),
    )
  ) {
    fail(REASON_CODES.precondition_reference, "earlier_boundary");
  }
  assertCanonicalEqual(
    matchingRpcEntries(snapshot, SUCCESS_POST_RPC_INVENTORY),
    FROZEN_EIGHT_RPC_INVENTORY,
    REASON_CODES.precondition_reference,
    "pre_rpc_inventory",
  );
  assertCanonicalEqual(
    appendOnlyEntries(snapshot),
    [APPEND_ONLY_BASELINE],
    REASON_CODES.precondition_reference,
    "append_only",
  );
}

function validateFailureTransition(capture) {
  assertNoTransition(capture.prestate, capture.poststate);
  assertCanonicalEqual(
    domainValue(capture.prestate, "migration_history"),
    BASELINE_HISTORY_INVENTORY,
    REASON_CODES.precondition_reference,
    "history_inventory",
  );
  validateEarlierBoundaries(capture.prestate);
  assertCanonicalEqual(
    proofAuditTriggers(capture.prestate),
    [PREEXISTING_TRIGGER],
    REASON_CODES.precondition_reference,
    "preexisting_trigger",
  );
}

function validateSuccessTransition(capture) {
  const unchanged = [
    "schema_relations",
    "target_data",
    "rls_policies",
    "column_acl",
    "function_catalog",
  ];
  for (const domainId of unchanged) {
    assertCanonicalEqual(
      domainValue(capture.prestate, domainId),
      domainValue(capture.poststate, domainId),
      REASON_CODES.atomicity,
      domainId,
    );
  }
  validateEarlierBoundaries(capture.prestate);
  assertCanonicalEqual(
    domainValue(capture.prestate, "migration_history"),
    BASELINE_HISTORY_INVENTORY,
    REASON_CODES.precondition_reference,
    "pre_history",
  );
  assertCanonicalEqual(
    domainValue(capture.poststate, "migration_history"),
    [...BASELINE_HISTORY_INVENTORY, SUCCESS_HISTORY_ENTRY],
    REASON_CODES.atomicity,
    "post_history",
  );
  assertCanonicalEqual(
    matchingRpcEntries(capture.poststate, SUCCESS_POST_RPC_INVENTORY),
    SUCCESS_POST_RPC_INVENTORY,
    REASON_CODES.atomicity,
    "post_rpc_inventory",
  );
  assertCanonicalEqual(
    nonSelectedRpc(capture.prestate),
    nonSelectedRpc(capture.poststate),
    REASON_CODES.atomicity,
    "unexpected_rpc",
  );
  assertCanonicalEqual(
    targetAcl(capture.prestate),
    [],
    REASON_CODES.precondition_reference,
    "pre_target_acl",
  );
  assertCanonicalEqual(
    targetAcl(capture.poststate),
    SUCCESS_TARGET_ACL,
    REASON_CODES.atomicity,
    "post_target_acl",
  );
  assertCanonicalEqual(
    nonTargetAcl(capture.prestate),
    nonTargetAcl(capture.poststate),
    REASON_CODES.atomicity,
    "unexpected_acl",
  );
  assertCanonicalEqual(
    proofAuditTriggers(capture.prestate),
    [],
    REASON_CODES.precondition_reference,
    "pre_trigger",
  );
  assertCanonicalEqual(
    proofAuditTriggers(capture.poststate),
    [CONTAINMENT_TRIGGER],
    REASON_CODES.atomicity,
    "post_trigger",
  );
  assertCanonicalEqual(
    otherTriggers(capture.prestate),
    otherTriggers(capture.poststate),
    REASON_CODES.atomicity,
    "unexpected_trigger",
  );
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
  if (scenarioId === "preexisting_proof_audit_trigger") {
    validateFailureTransition(capture);
  } else if (scenarioId === "successful_containment") {
    validateSuccessTransition(capture);
  } else {
    fail(REASON_CODES.policy, "scenario");
  }
  if (capture.runtime_capture_digest !== expectedCaptureDigest(capture)) {
    fail(REASON_CODES.evidence_digest, "runtime_capture");
  }
}

export function buildTriggerSuccessAtomicEvidenceRebuildV1({
  capture,
  scenario_id,
}) {
  triggerSuccessSelectionForScenario(scenario_id);
  validateCapture(capture, scenario_id);
  const policy = triggerSuccessPolicyForScenario(scenario_id);
  const projection = {
    atomic_evidence_version: TRIGGER_SUCCESS_ATOMIC_EVIDENCE_VERSION,
    atomicity_decision: policy.atomicity_decision,
    diagnostic: capture.diagnostic,
    guarded_reads: normalizedReads(capture.guarded_reads),
    migration_applied: policy.migration_applied,
    policy_registry: TRIGGER_SUCCESS_POLICY_REGISTRY,
    policy_registry_digest: TRIGGER_SUCCESS_POLICY_REGISTRY_DIGEST,
    poststate: capture.poststate,
    precondition_reference:
      buildTriggerSuccessPreconditionReference(scenario_id),
    prestate: capture.prestate,
    protocol_version: TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
    runner_identity: buildTriggerSuccessRunnerIdentityReceiptRebuildV1(),
    runtime_capture_digest: capture.runtime_capture_digest,
    runtime_identity: capture.runtime_identity,
    runtime_registry: TRIGGER_SUCCESS_RUNTIME_REGISTRY,
    runtime_registry_digest: TRIGGER_SUCCESS_RUNTIME_REGISTRY_DIGEST,
    scenario_id,
    snapshot_schema_version: SNAPSHOT_SCHEMA_VERSION,
    terminal_state: policy.terminal_state,
  };
  return deepFreeze({ ...projection, evidence_digest: sha256(projection) });
}

export function verifyTriggerSuccessAtomicEvidenceRebuildV1(evidence) {
  assertClosed(evidence, EVIDENCE_FIELDS);
  if (
    evidence.atomic_evidence_version !== TRIGGER_SUCCESS_ATOMIC_EVIDENCE_VERSION ||
    evidence.protocol_version !== TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION ||
    evidence.snapshot_schema_version !== SNAPSHOT_SCHEMA_VERSION ||
    evidence.atomicity_decision !==
      triggerSuccessPolicyForScenario(evidence.scenario_id).atomicity_decision ||
    evidence.terminal_state !==
      triggerSuccessPolicyForScenario(evidence.scenario_id).terminal_state ||
    evidence.migration_applied !==
      triggerSuccessPolicyForScenario(evidence.scenario_id).migration_applied
  ) fail(REASON_CODES.protocol);
  if (
    canonicalJson(evidence.policy_registry) !==
      canonicalJson(TRIGGER_SUCCESS_POLICY_REGISTRY) ||
    evidence.policy_registry_digest !== TRIGGER_SUCCESS_POLICY_REGISTRY_DIGEST
  ) fail(REASON_CODES.policy);
  if (
    canonicalJson(evidence.runtime_registry) !==
      canonicalJson(TRIGGER_SUCCESS_RUNTIME_REGISTRY) ||
    evidence.runtime_registry_digest !== TRIGGER_SUCCESS_RUNTIME_REGISTRY_DIGEST
  ) fail(REASON_CODES.runtime_registry);
  verifyTriggerSuccessPreconditionReference(
    evidence.precondition_reference,
    evidence.scenario_id,
  );
  verifyTriggerSuccessRunnerIdentityReceiptRebuildV1(evidence.runner_identity);
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

export function buildTriggerSuccessRecordRebuildV1({
  evidence,
  run_id,
  shard_id,
}) {
  verifyTriggerSuccessAtomicEvidenceRebuildV1(evidence);
  assertIdentifier(run_id, "run_id");
  assertIdentifier(shard_id, "shard_id");
  const projection = {
    evidence,
    evidence_digest: evidence.evidence_digest,
    protocol_version: TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
    record_version: TRIGGER_SUCCESS_RECORD_VERSION,
    run_id,
    scenario_id: evidence.scenario_id,
    shard_id,
    terminal_status: "passed",
  };
  return deepFreeze({ ...projection, record_digest: sha256(projection) });
}

export function verifyTriggerSuccessRecordRebuildV1(record) {
  assertClosed(record, RECORD_FIELDS);
  verifyTriggerSuccessAtomicEvidenceRebuildV1(record.evidence);
  if (
    record.protocol_version !== TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION ||
    record.record_version !== TRIGGER_SUCCESS_RECORD_VERSION ||
    record.scenario_id !== record.evidence.scenario_id ||
    record.evidence_digest !== record.evidence.evidence_digest ||
    record.terminal_status !== "passed" ||
    record.record_digest !== sha256(without(record, "record_digest"))
  ) fail(REASON_CODES.record_digest);
  return record;
}

export function buildTriggerSuccessShardRebuildV1(record) {
  verifyTriggerSuccessRecordRebuildV1(record);
  const projection = {
    declared_inventory: [record.scenario_id],
    protocol_version: TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
    record_digest: record.record_digest,
    result_inventory: [{
      record_digest: record.record_digest,
      scenario_id: record.scenario_id,
      terminal_status: record.terminal_status,
    }],
    run_id: record.run_id,
    scenario_id: record.scenario_id,
    shard_id: record.shard_id,
    shard_version: TRIGGER_SUCCESS_SHARD_VERSION,
    terminal_count: 1,
  };
  return deepFreeze({ ...projection, shard_digest: sha256(projection) });
}

export function verifyTriggerSuccessShardRebuildV1(shard, record) {
  assertClosed(shard, SHARD_FIELDS);
  const expected = buildTriggerSuccessShardRebuildV1(record);
  if (canonicalJson(shard) !== canonicalJson(expected)) {
    fail(
      shard.shard_digest === expected.shard_digest
        ? REASON_CODES.shard_inventory
        : REASON_CODES.shard_digest,
    );
  }
  return shard;
}

export function buildTriggerSuccessFileRebuildV1({ record, shard }) {
  verifyTriggerSuccessShardRebuildV1(shard, record);
  const projection = {
    file_identity: `${record.run_id}.${record.shard_id}.${record.scenario_id}.trigger-success-rebuild-v1.json`,
    file_version: TRIGGER_SUCCESS_FILE_VERSION,
    protocol_version: TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
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

export function verifyTriggerSuccessFileRebuildV1(file) {
  assertClosed(file, FILE_FIELDS);
  const expected = buildTriggerSuccessFileRebuildV1({
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

export function serializeTriggerSuccessFileRebuildV1(file) {
  verifyTriggerSuccessFileRebuildV1(file);
  return `${canonicalJson(file)}\n`;
}

export function parseTriggerSuccessFileRebuildV1(bytes) {
  let parsed;
  try {
    parsed = JSON.parse(bytes);
  } catch {
    fail(REASON_CODES.persistence_readback, "json");
  }
  verifyTriggerSuccessFileRebuildV1(parsed);
  if (serializeTriggerSuccessFileRebuildV1(parsed) !== bytes) {
    fail(REASON_CODES.persistence_readback, "canonical_bytes");
  }
  return deepFreeze(parsed);
}

export function persistTriggerSuccessResultFileRebuildV1({
  file,
  output_path,
}) {
  verifyTriggerSuccessFileRebuildV1(file);
  if (
    typeof output_path !== "string" ||
    !output_path.endsWith(file.file_identity)
  ) fail(REASON_CODES.file_identity, "path");
  const bytes = serializeTriggerSuccessFileRebuildV1(file);
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
    parseTriggerSuccessFileRebuildV1(readFileSync(output_path, "utf8"));
  } catch (error) {
    if (existsSync(temporary)) unlinkSync(temporary);
    throw error;
  }
  return deepFreeze({ bytes, disposition: "written" });
}

export function buildTriggerSuccessResultChainRebuildV1({
  capture,
  run_id,
  scenario_id,
  shard_id,
}) {
  const evidence = buildTriggerSuccessAtomicEvidenceRebuildV1({
    capture,
    scenario_id,
  });
  const record = buildTriggerSuccessRecordRebuildV1({
    evidence,
    run_id,
    shard_id,
  });
  const shard = buildTriggerSuccessShardRebuildV1(record);
  const file = buildTriggerSuccessFileRebuildV1({ record, shard });
  return deepFreeze({ evidence, file, record, shard });
}
