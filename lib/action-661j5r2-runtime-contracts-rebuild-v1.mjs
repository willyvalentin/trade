import { createHash } from "node:crypto";

export const REBUILD_FAMILY = "action_661j5r2_runtime_certification_rebuild_v1";
export const SNAPSHOT_CONTRACT =
  "action_661j5r2_metadata_first_snapshot_rebuild_v1";
export const SNAPSHOT_SCHEMA_VERSION = "action_661j5r2_nine_domain_v2";
export const POLICY_REGISTRY_VERSION =
  "action_661j5r2_atomic_policy_registry_rebuild_v1";
export const RUNTIME_REGISTRY_VERSION =
  "action_661j5r2_runtime_scenario_registry_rebuild_v1";
export const RESULT_PROTOCOL_VERSION =
  "action_661j5r2_runtime_result_protocol_rebuild_v1";
export const AGGREGATE_PROTOCOL_VERSION =
  "action_661j5r2_mixed_ab_aggregate_rebuild_v1";

export const DOMAIN_IDS = Object.freeze([
  "schema_relations",
  "target_data",
  "migration_history",
  "rls_policies",
  "table_acl",
  "column_acl",
  "rpc_catalog",
  "function_catalog",
  "trigger_catalog",
]);

export const TARGET_RELATIONS = Object.freeze([
  "public.continuous_intelligence_credit_ledger",
  "public.continuous_intelligence_shadow_canary_daily_claims",
  "public.historical_candle_fetch_runs",
  "public.historical_candle_symbols",
  "public.historical_candles",
  "public.historical_usage_reconciliations",
]);

export const RELATION_STATES = Object.freeze([
  "present_table",
  "missing",
  "non_table",
  "wrong_owner",
]);

const TARGET_OWNER = "postgres";
const SHA256 = /^[0-9a-f]{64}$/;
const SQLSTATE = /^[0-9A-Z]{5}$/;

export const REASON_CODES = Object.freeze({
  canonical_value: "rebuild_v1.canonical_value_invalid",
  closed_shape: "rebuild_v1.closed_shape_invalid",
  snapshot_inventory: "rebuild_v1.snapshot_inventory_mismatch",
  snapshot_metadata: "rebuild_v1.snapshot_metadata_invalid",
  guarded_read: "rebuild_v1.guarded_read_contract_violation",
  relation_state: "rebuild_v1.relation_state_mismatch",
  domain_digest: "rebuild_v1.snapshot_domain_digest_mismatch",
  combined_digest: "rebuild_v1.snapshot_combined_digest_mismatch",
  policy: "rebuild_v1.policy_mismatch",
  protocol: "rebuild_v1.protocol_version_mismatch",
  precondition_reference: "rebuild_v1.precondition_reference_mismatch",
  runtime_registry: "rebuild_v1.runtime_registry_mismatch",
  runtime_identity: "rebuild_v1.runtime_identity_mismatch",
  diagnostic: "rebuild_v1.diagnostic_mismatch",
  runner_identity: "rebuild_v1.runner_identity_mismatch",
  atomicity: "rebuild_v1.atomic_transition_detected",
  evidence_digest: "rebuild_v1.evidence_digest_mismatch",
  record_digest: "rebuild_v1.record_digest_mismatch",
  shard_inventory: "rebuild_v1.shard_inventory_mismatch",
  shard_digest: "rebuild_v1.shard_digest_mismatch",
  file_digest: "rebuild_v1.file_digest_mismatch",
  file_identity: "rebuild_v1.file_identity_mismatch",
  aggregate_inventory: "rebuild_v1.aggregate_inventory_mismatch",
  semantic_determinism: "rebuild_v1.semantic_determinism_mismatch",
  aggregate_digest: "rebuild_v1.aggregate_digest_mismatch",
  persistence_collision: "rebuild_v1.persistence_collision",
  persistence_readback: "rebuild_v1.persistence_readback_mismatch",
});

function fail(code, detail = "") {
  throw new Error(detail ? `${code}:${detail}` : code);
}

export function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function canonicalJson(value) {
  const active = new Set();
  function project(current) {
    if (
      current === undefined ||
      typeof current === "bigint" ||
      typeof current === "function" ||
      typeof current === "symbol" ||
      (typeof current === "number" && !Number.isFinite(current))
    ) {
      fail(REASON_CODES.canonical_value);
    }
    if (current === null || typeof current !== "object") return current;
    if (active.has(current)) fail(REASON_CODES.canonical_value, "cycle");
    active.add(current);
    let projected;
    if (Array.isArray(current)) {
      projected = current.map(project);
    } else {
      if (!isPlainObject(current)) {
        fail(REASON_CODES.canonical_value, "non_plain_object");
      }
      projected = Object.fromEntries(
        Object.keys(current)
          .sort()
          .map((key) => [key, project(current[key])]),
      );
    }
    active.delete(current);
    return projected;
  }
  return JSON.stringify(project(value));
}

export function sha256(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function assertClosed(value, fields, code = REASON_CODES.closed_shape) {
  if (!isPlainObject(value)) fail(code, "object");
  const actual = Object.keys(value).sort();
  const expected = [...fields].sort();
  if (canonicalJson(actual) !== canonicalJson(expected)) fail(code, "fields");
  return value;
}

function assertString(value, code, detail) {
  if (typeof value !== "string" || value.length === 0) fail(code, detail);
}

function assertSha(value, code, detail) {
  if (typeof value !== "string" || !SHA256.test(value)) fail(code, detail);
}

function relationReason(state) {
  return {
    missing: "relation_missing",
    non_table: "relation_not_table",
    wrong_owner: "relation_wrong_owner",
  }[state];
}

export const ATOMIC_POLICY_REGISTRY = deepFreeze({
  registry_version: POLICY_REGISTRY_VERSION,
  scenarios: {
    forbidden_history: {
      scenario_id: "forbidden_history",
      precondition_type: "forbidden_migration_history",
      forbidden_versions: [
        "20260708000000",
        "20260708001000",
        "20260710000000",
      ],
      selected_forbidden_version: "20260708000000",
      target_relation: null,
      relation_state: null,
      terminal_sqlstate: null,
      terminal_reason: "Action 661J refuses forbidden migration history",
      classification: "controlled_forbidden_history_rejection",
    },
    missing_target: {
      scenario_id: "missing_target",
      precondition_type: "missing_target_relation",
      forbidden_versions: [],
      selected_forbidden_version: null,
      target_relation: "public.historical_candles",
      relation_state: "missing",
      terminal_sqlstate: "42P01",
      terminal_reason:
        'relation "public.historical_candles" does not exist',
      classification: "native_regclass_missing_relation_preempts_policy",
    },
  },
});

export const ATOMIC_POLICY_REGISTRY_DIGEST = sha256(ATOMIC_POLICY_REGISTRY);

export const RUNTIME_SCENARIO_REGISTRY = deepFreeze({
  registry_version: RUNTIME_REGISTRY_VERSION,
  predecessor: {
    base_commit: "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33",
    recovery_manifest_version: "action_661j5r1_loss_reconstruction_manifest_v1",
    lost_bytes_claimed_recovered: false,
  },
  scenarios: {
    forbidden_history: {
      status: "implemented",
      scenario_id: "forbidden_history",
      protocol_version: RESULT_PROTOCOL_VERSION,
      runner_version: "action_661j5r2_runtime_runner_rebuild_v1",
      policy_registry_version: POLICY_REGISTRY_VERSION,
    },
    missing_target: {
      status: "implemented",
      scenario_id: "missing_target",
      protocol_version: RESULT_PROTOCOL_VERSION,
      runner_version: "action_661j5r2_runtime_runner_rebuild_v1",
      policy_registry_version: POLICY_REGISTRY_VERSION,
    },
  },
});

export const RUNTIME_SCENARIO_REGISTRY_DIGEST = sha256(
  RUNTIME_SCENARIO_REGISTRY,
);

export function policyForScenario(scenarioId) {
  const policy = ATOMIC_POLICY_REGISTRY.scenarios[scenarioId];
  if (!policy) fail(REASON_CODES.policy, "unknown_scenario");
  return policy;
}

export function selectionForScenario(scenarioId) {
  const selection = RUNTIME_SCENARIO_REGISTRY.scenarios[scenarioId];
  if (!selection || selection.status !== "implemented") {
    fail(REASON_CODES.runtime_registry, "scenario_not_implemented");
  }
  return selection;
}

const METADATA_FIELDS = ["observed", "relation", "relation_state"];
const OBSERVED_FIELDS = ["oid", "owner", "relkind"];
const READ_FIELDS = ["oid", "relation", "rows"];

function verifyMetadataEntry(entry) {
  assertClosed(entry, METADATA_FIELDS, REASON_CODES.snapshot_metadata);
  if (!TARGET_RELATIONS.includes(entry.relation)) {
    fail(REASON_CODES.snapshot_inventory, "unknown_target");
  }
  if (!RELATION_STATES.includes(entry.relation_state)) {
    fail(REASON_CODES.relation_state, entry.relation);
  }
  if (entry.relation_state === "missing") {
    if (entry.observed !== null) {
      fail(REASON_CODES.snapshot_metadata, "missing_observed");
    }
    return;
  }
  assertClosed(entry.observed, OBSERVED_FIELDS, REASON_CODES.snapshot_metadata);
  if (!Number.isInteger(entry.observed.oid) || entry.observed.oid <= 0) {
    fail(REASON_CODES.snapshot_metadata, "oid");
  }
  assertString(
    entry.observed.owner,
    REASON_CODES.snapshot_metadata,
    "owner",
  );
  assertString(
    entry.observed.relkind,
    REASON_CODES.snapshot_metadata,
    "relkind",
  );
  if (
    entry.relation_state === "present_table" &&
    (entry.observed.relkind !== "r" || entry.observed.owner !== TARGET_OWNER)
  ) {
    fail(REASON_CODES.relation_state, "present_table");
  }
  if (
    entry.relation_state === "non_table" &&
    entry.observed.relkind === "r"
  ) {
    fail(REASON_CODES.relation_state, "non_table");
  }
  if (
    entry.relation_state === "wrong_owner" &&
    (entry.observed.relkind !== "r" || entry.observed.owner === TARGET_OWNER)
  ) {
    fail(REASON_CODES.relation_state, "wrong_owner");
  }
}

function verifyTargetInventory(metadata) {
  if (!Array.isArray(metadata) || metadata.length !== TARGET_RELATIONS.length) {
    fail(REASON_CODES.snapshot_inventory, "count");
  }
  for (const entry of metadata) verifyMetadataEntry(entry);
  const relations = metadata.map((entry) => entry.relation);
  if (
    new Set(relations).size !== TARGET_RELATIONS.length ||
    canonicalJson([...relations].sort()) !== canonicalJson(TARGET_RELATIONS)
  ) {
    fail(REASON_CODES.snapshot_inventory, "relations");
  }
}

function rowSort(left, right) {
  return canonicalJson(left).localeCompare(canonicalJson(right));
}

export function buildSnapshotV2Rebuild(input) {
  assertClosed(input, [
    "domains",
    "guarded_data_reads",
    "metadata_discovery",
  ]);
  verifyTargetInventory(input.metadata_discovery);
  if (!Array.isArray(input.guarded_data_reads)) {
    fail(REASON_CODES.guarded_read, "array");
  }
  const reads = new Map();
  for (const read of input.guarded_data_reads) {
    assertClosed(read, READ_FIELDS, REASON_CODES.guarded_read);
    if (
      !TARGET_RELATIONS.includes(read.relation) ||
      reads.has(read.relation) ||
      !Array.isArray(read.rows)
    ) {
      fail(REASON_CODES.guarded_read, "inventory");
    }
    reads.set(read.relation, read);
  }
  const targets = input.metadata_discovery
    .map((metadata) => {
      const read = reads.get(metadata.relation);
      if (metadata.relation_state === "present_table") {
        if (!read || read.oid !== metadata.observed.oid) {
          fail(REASON_CODES.guarded_read, "present_read");
        }
        const rows = [...read.rows].map((row) => {
          if (!isPlainObject(row)) fail(REASON_CODES.guarded_read, "row");
          canonicalJson(row);
          return structuredClone(row);
        });
        rows.sort(rowSort);
        return {
          relation: metadata.relation,
          relation_state: "present_table",
          observed_relation: structuredClone(metadata.observed),
          data_status: "captured",
          rows,
          data_digest: sha256(rows),
          reason: null,
        };
      }
      if (read) fail(REASON_CODES.guarded_read, "invalid_state_read");
      return {
        relation: metadata.relation,
        relation_state: metadata.relation_state,
        observed_relation:
          metadata.observed === null
            ? null
            : structuredClone(metadata.observed),
        data_status: "not_read_due_to_relation_state",
        rows: null,
        data_digest: null,
        reason: relationReason(metadata.relation_state),
      };
    })
    .sort((left, right) => left.relation.localeCompare(right.relation));
  if (!isPlainObject(input.domains)) {
    fail(REASON_CODES.snapshot_inventory, "domains");
  }
  const domainKeys = Object.keys(input.domains).sort();
  if (canonicalJson(domainKeys) !== canonicalJson([...DOMAIN_IDS].sort())) {
    fail(REASON_CODES.snapshot_inventory, "domain_ids");
  }
  const domains = DOMAIN_IDS.map((domainId) => {
    const value =
      domainId === "target_data"
        ? targets
        : structuredClone(input.domains[domainId]);
    canonicalJson(value);
    return {
      domain_id: domainId,
      domain_version: "v2",
      value,
      domain_digest: sha256({
        domain_id: domainId,
        domain_version: "v2",
        value,
      }),
    };
  });
  const projection = {
    snapshot_contract: SNAPSHOT_CONTRACT,
    snapshot_schema_version: SNAPSHOT_SCHEMA_VERSION,
    target_inventory: [...TARGET_RELATIONS],
    domains,
  };
  return deepFreeze({
    ...projection,
    combined_digest: sha256(projection),
  });
}

const TARGET_OUTPUT_FIELDS = [
  "data_digest",
  "data_status",
  "observed_relation",
  "reason",
  "relation",
  "relation_state",
  "rows",
];
const DOMAIN_FIELDS = [
  "domain_digest",
  "domain_id",
  "domain_version",
  "value",
];
const SNAPSHOT_FIELDS = [
  "combined_digest",
  "domains",
  "snapshot_contract",
  "snapshot_schema_version",
  "target_inventory",
];

export function verifySnapshotV2Rebuild(snapshot) {
  assertClosed(snapshot, SNAPSHOT_FIELDS, REASON_CODES.closed_shape);
  if (
    snapshot.snapshot_contract !== SNAPSHOT_CONTRACT ||
    snapshot.snapshot_schema_version !== SNAPSHOT_SCHEMA_VERSION ||
    canonicalJson(snapshot.target_inventory) !== canonicalJson(TARGET_RELATIONS) ||
    !Array.isArray(snapshot.domains) ||
    snapshot.domains.length !== DOMAIN_IDS.length
  ) {
    fail(REASON_CODES.snapshot_inventory);
  }
  const ids = snapshot.domains.map((domain) => domain.domain_id);
  if (canonicalJson(ids) !== canonicalJson(DOMAIN_IDS)) {
    fail(REASON_CODES.snapshot_inventory, "domain_order");
  }
  for (const domain of snapshot.domains) {
    assertClosed(domain, DOMAIN_FIELDS, REASON_CODES.closed_shape);
    if (
      domain.domain_version !== "v2" ||
      domain.domain_digest !==
        sha256({
          domain_id: domain.domain_id,
          domain_version: domain.domain_version,
          value: domain.value,
        })
    ) {
      fail(REASON_CODES.domain_digest, domain.domain_id);
    }
  }
  const targetDomain = snapshot.domains.find(
    (domain) => domain.domain_id === "target_data",
  );
  if (
    !Array.isArray(targetDomain.value) ||
    targetDomain.value.length !== TARGET_RELATIONS.length
  ) {
    fail(REASON_CODES.snapshot_inventory, "target_data");
  }
  for (const target of targetDomain.value) {
    assertClosed(target, TARGET_OUTPUT_FIELDS, REASON_CODES.closed_shape);
    if (target.relation_state === "present_table") {
      if (
        target.data_status !== "captured" ||
        !Array.isArray(target.rows) ||
        target.data_digest !== sha256(target.rows) ||
        target.reason !== null
      ) {
        fail(REASON_CODES.guarded_read, target.relation);
      }
    } else if (
      !RELATION_STATES.includes(target.relation_state) ||
      target.data_status !== "not_read_due_to_relation_state" ||
      target.rows !== null ||
      target.data_digest !== null ||
      target.reason !== relationReason(target.relation_state)
    ) {
      fail(REASON_CODES.relation_state, target.relation);
    }
  }
  const projection = {
    snapshot_contract: snapshot.snapshot_contract,
    snapshot_schema_version: snapshot.snapshot_schema_version,
    target_inventory: snapshot.target_inventory,
    domains: snapshot.domains,
  };
  if (snapshot.combined_digest !== sha256(projection)) {
    fail(REASON_CODES.combined_digest);
  }
  return snapshot;
}

const RUNTIME_IDENTITY_FIELDS = [
  "architecture",
  "collector_sha256",
  "collector_version",
  "engine",
  "identity_digest",
  "image_digest",
  "image_repository",
  "image_tag",
  "platform",
  "server_major",
  "server_version",
];

export function verifyRuntimeIdentity(identity) {
  assertClosed(identity, RUNTIME_IDENTITY_FIELDS, REASON_CODES.runtime_identity);
  for (const field of RUNTIME_IDENTITY_FIELDS) {
    if (field !== "server_major" && field !== "identity_digest") {
      assertString(identity[field], REASON_CODES.runtime_identity, field);
    }
  }
  if (!Number.isInteger(identity.server_major) || identity.server_major !== 16) {
    fail(REASON_CODES.runtime_identity, "server_major");
  }
  if (
    identity.engine !== "postgresql" ||
    identity.image_repository !== "postgres" ||
    identity.image_tag !== "16-alpine"
  ) {
    fail(REASON_CODES.runtime_identity, "image");
  }
  const projection = Object.fromEntries(
    RUNTIME_IDENTITY_FIELDS.filter((field) => field !== "identity_digest").map(
      (field) => [field, identity[field]],
    ),
  );
  if (identity.identity_digest !== sha256(projection)) {
    fail(REASON_CODES.runtime_identity, "digest");
  }
  return identity;
}

export function buildRuntimeIdentity(input) {
  assertClosed(
    input,
    RUNTIME_IDENTITY_FIELDS.filter((field) => field !== "identity_digest"),
    REASON_CODES.runtime_identity,
  );
  return deepFreeze({ ...structuredClone(input), identity_digest: sha256(input) });
}

const DIAGNOSTIC_FIELDS = [
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
];
const SAFETY_FIELDS = [
  "connection_string_present",
  "credential_material_present",
  "query_text_present",
  "raw_error_object_present",
  "stack_trace_present",
];

export function buildDiagnosticSidecar(input) {
  assertClosed(input, DIAGNOSTIC_FIELDS.filter((f) => f !== "diagnostic_digest"));
  assertClosed(input.safety, SAFETY_FIELDS, REASON_CODES.diagnostic);
  const projection = structuredClone(input);
  return deepFreeze({ ...projection, diagnostic_digest: sha256(projection) });
}

export function verifyDiagnosticSidecar(sidecar, scenarioId) {
  assertClosed(sidecar, DIAGNOSTIC_FIELDS, REASON_CODES.diagnostic);
  assertClosed(sidecar.safety, SAFETY_FIELDS, REASON_CODES.diagnostic);
  const policy = policyForScenario(scenarioId);
  if (
    sidecar.sidecar_version !==
      "action_661j5r2_diagnostic_sidecar_rebuild_v1" ||
    sidecar.scenario_id !== scenarioId ||
    sidecar.terminal_state !== "controlled_error" ||
    sidecar.sqlstate !== policy.terminal_sqlstate ||
    sidecar.reason !== policy.terminal_reason ||
    sidecar.classification !== policy.classification ||
    sidecar.diagnostic_sanitized !== true ||
    sidecar.migration_applied !== false ||
    Object.values(sidecar.safety).some((value) => value !== false)
  ) {
    fail(REASON_CODES.diagnostic, scenarioId);
  }
  if (sidecar.sqlstate !== null && !SQLSTATE.test(sidecar.sqlstate)) {
    fail(REASON_CODES.diagnostic, "sqlstate");
  }
  const projection = Object.fromEntries(
    DIAGNOSTIC_FIELDS.filter((field) => field !== "diagnostic_digest").map(
      (field) => [field, sidecar[field]],
    ),
  );
  if (sidecar.diagnostic_digest !== sha256(projection)) {
    fail(REASON_CODES.diagnostic, "digest");
  }
  return sidecar;
}

export function assertNoTransition(prestate, poststate) {
  verifySnapshotV2Rebuild(prestate);
  verifySnapshotV2Rebuild(poststate);
  if (
    prestate.combined_digest !== poststate.combined_digest ||
    canonicalJson(prestate) !== canonicalJson(poststate)
  ) {
    fail(REASON_CODES.atomicity);
  }
}

export function assertIdentifier(value, field) {
  if (
    typeof value !== "string" ||
    !/^[a-z0-9][a-z0-9._-]{2,127}$/.test(value)
  ) {
    fail(REASON_CODES.closed_shape, field);
  }
}

export function assertDigest(value, code, detail) {
  assertSha(value, code, detail);
}
