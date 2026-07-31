import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { basename, isAbsolute, relative, resolve } from "node:path";

export const CONSUMER_VERSION =
  "action_661j5n1_default_off_runtime_certification_consumer_v1";

export const RESULT_STATUSES = Object.freeze([
  "certified",
  "incomplete",
  "tampered",
  "incompatible",
  "scope_rejected",
]);

export const CERTIFICATION_AUTHORITIES = deepFreeze({
  base_commit: "e04fb0fe20562ae5d7acfdf593e07a4040eda732",
  delivery_digest:
    "80024a817857603d508d094e2e53616dfab48ba60ac661211ff3fa2672ad5d0e",
  final_aggregate_digest:
    "98064a290926d7b2ade45965eec3a21b41819763cb667a3a0c54f618600fe99d",
  final_freeze_manifest_digest:
    "9e6f8237a5f760c0ef34b2783eca69d7d1496a935d984bc8f07a92493982a4a6",
  final_aggregate_file_sha256:
    "0a13a54dd85b60af61eeca991e0b4878323d8ea40fd2264acbd80b87dbeaea8f",
  independent_review_file_sha256:
    "cdd5f37e349b9186e2ab4081518009e44cea2bfd6048219dd487c08088403757",
  recovery_disclosure_file_sha256:
    "06efa3ca53af693e8478a068f4e2202c942300346d208511d921b0eec2993aeb",
});

export const CERTIFICATION_PATHS = deepFreeze({
  aggregate:
    "docs/recovery/action-661j5r9/runtime-evidence/action-661j5r9-twenty-eight-shard-aggregate.rebuild-v1.json",
  freeze_manifest:
    "docs/recovery/action-661j5r10/final-freeze-manifest.json",
  independent_review:
    "docs/recovery/action-661j5r10/independent-review.json",
  recovery_disclosure:
    "docs/recovery/action-661j5r1/loss-reconstruction-manifest.json",
});

export const CONSUMER_BUDGETS = deepFreeze({
  max_array_entries: 4096,
  max_bytes: 16 * 1024 * 1024,
  max_depth: 32,
  max_files: 96,
  max_json_nodes: 500_000,
  max_object_fields: 512,
  max_string_bytes: 1024 * 1024,
});

const DOMAIN_IDS = Object.freeze([
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

const EXPECTED_SCENARIOS = deepFreeze({
  column_acl_state:
    "fc68adf6786413ec69104ab7ceccc435f73ffa8d15d34e6e0aa9bef15e1235d0",
  duplicate_containment_history:
    "5a923bd6db12a89171ed0864482da346a41d0e45155579de1c229db9d940aa8c",
  forbidden_history:
    "73ca9e88d3bb2c9c712cfe0f17f38cad6175585c8147574b1aff81f70634451a",
  incompatible_append_only_function:
    "5c577fd18cdba22f3f75c43df651c14ddc36bc3f3df2302205b5ded6bf8492a2",
  incident_history_present:
    "7809c32dcb97f4a892dcc0d1e011d1f2e07f2e8e2df153a66c0757bebec45586",
  missing_action_650_history:
    "8ea84c77c80ee2b292e3b8e371b103d41d3c89ea309b80737fb1fcda8f5c67dc",
  missing_target:
    "a367b1f580aa2f790b8bb336e422a0dd14f357c3d95965a047c25ef85f7f608e",
  non_table:
    "dc3e0a6f09b735e024e9f3354597c19732ac50c68ac24ddecd3f68b825c77a10",
  policy_state:
    "28b362c0372842bc10b4a2fa552af7476732de2cbc6f329cfbbe6f08d1809991",
  preexisting_proof_audit_trigger:
    "93c106ec663e6197f99f5990989ca5c272fdb3f299e45d5d3ed318363397ec11",
  rpc_catalog_body_drift:
    "12b3e1b7b3227d92b4ea17436e28df50b33f137e50a85bb08cfd6447d8804215",
  successful_containment:
    "5875cf90327839e7c3903004ae669e68b3db3b9dc76ac0f80e2556a7e90dbfcc",
  unknown_acl_state:
    "e7f9fda3b3e65f87ce17bab3853eecb3b42997035c3b7d3bcded88490814fa60",
  wrong_owner:
    "427060a65bfc1dddfe082a86c38522535133f414fc8a82c1392cea7e6d5ce50a",
});

const EXPECTED_PRESERVATION_CHAIN = deepFreeze([
  ["refs/preservation/action-661j5r2-runtime-certification-rebuild", "a3914ab82faad49d19366d7a6f93334c6448944f"],
  ["refs/preservation/action-661j5r3-readiness-failure", "aacb337ca7fb270399e35b5bd7e32028e23a7ce3"],
  ["refs/preservation/action-661j5r3-runtime-integration-preflight", "14cb1fda6cfe707812779b7519031e3f586f9a35"],
  ["refs/preservation/action-661j5r3a-readiness-preflight", "ea27a367eaf51945e4eb2d1991e99995406e058d"],
  ["refs/preservation/action-661j5r3a-runtime-certification", "ff28f2cb1f510a7d32cd61b5fabc0ae06f4b2156"],
  ["refs/preservation/action-661j5r4-relation-state-preflight", "713023cace5fb3beb8af3040653943224c139abd"],
  ["refs/preservation/action-661j5r4-relation-state-runtime-certification", "65d25b17181e827475b75d4f3efad03b21b1f310"],
  ["refs/preservation/action-661j5r5-history-boundary-runtime-certification", "cad317295563d35c04e6d11c2847946e928e4426"],
  ["refs/preservation/action-661j5r6a-acl-runtime-certification", "ef3402220827d20b847f20bc85c15fe0847cc378"],
  ["refs/preservation/action-661j5r7-column-acl-policy-runtime-certification", "6cfb90f807d826616c28389ce2a633e5a0879859"],
  ["refs/preservation/action-661j5r8-rpc-append-only-runtime-certification", "4b2c3a5631e2d27b9cff62a7621e71662a8cc639"],
  ["refs/preservation/action-661j5r9-complete-runtime-certification", "104e00c6c2980e024d4f342d82dd0b817ef44090"],
]);

const FILE_FIELDS = Object.freeze([
  "canonical_file_digest",
  "file_identity",
  "file_version",
  "protocol_version",
  "record",
  "record_digest",
  "shard",
  "shard_digest",
]);
const RECORD_FIELDS = Object.freeze([
  "evidence",
  "evidence_digest",
  "protocol_version",
  "record_digest",
  "record_version",
  "run_id",
  "scenario_id",
  "shard_id",
  "terminal_status",
]);
const SHARD_FIELDS = Object.freeze([
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
]);
const EVIDENCE_FIELDS = Object.freeze([
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
]);
const SNAPSHOT_FIELDS = Object.freeze([
  "combined_digest",
  "domains",
  "snapshot_contract",
  "snapshot_schema_version",
  "target_inventory",
]);
const DOMAIN_FIELDS = Object.freeze([
  "domain_digest",
  "domain_id",
  "domain_version",
  "value",
]);
const TARGET_FIELDS = Object.freeze([
  "data_digest",
  "data_status",
  "observed_relation",
  "reason",
  "relation",
  "relation_state",
  "rows",
]);

const DEFAULT_BOUNDARY = Object.freeze({
  lstat: (path) => lstatSync(path),
  readFile: (path) => readFileSync(path),
  realpath: (path) => realpathSync(path),
});

class CertificationError extends Error {
  constructor(status, reason, path = null, observed = null, expected = null) {
    super(reason);
    this.status = status;
    this.reason = reason;
    this.path = path;
    this.observed = observed;
    this.expected = expected;
  }
}

function deepFreeze(value) {
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

function fail(status, reason, path = null, observed = null, expected = null) {
  throw new CertificationError(status, reason, path, observed, expected);
}

function assertPlain(value, reason, path = null) {
  if (!isPlainObject(value)) fail("incompatible", reason, path);
  return value;
}

function assertClosed(value, fields, reason, path = null) {
  assertPlain(value, reason, path);
  const actual = Object.keys(value).sort();
  const expected = [...fields].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail("incompatible", reason, path);
  }
}

function assertArray(value, reason, path = null) {
  if (!Array.isArray(value)) fail("incompatible", reason, path);
  return value;
}

function assertString(value, reason, path = null) {
  if (typeof value !== "string" || value.length === 0) {
    fail("incompatible", reason, path);
  }
  return value;
}

function without(value, field) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== field),
  );
}

function validateJsonBudget(root) {
  const active = new Set();
  const stack = [{ depth: 0, entering: true, value: root }];
  let nodes = 0;
  while (stack.length > 0) {
    const frame = stack.pop();
    const value = frame.value;
    if (!frame.entering) {
      active.delete(value);
      continue;
    }
    nodes += 1;
    if (nodes > CONSUMER_BUDGETS.max_json_nodes) {
      fail("scope_rejected", "json_node_budget_exceeded");
    }
    if (frame.depth > CONSUMER_BUDGETS.max_depth) {
      fail("scope_rejected", "json_depth_budget_exceeded");
    }
    if (
      value === undefined ||
      typeof value === "bigint" ||
      typeof value === "function" ||
      typeof value === "symbol" ||
      (typeof value === "number" && !Number.isFinite(value))
    ) {
      fail("incompatible", "unsupported_canonical_value");
    }
    if (typeof value === "string") {
      if (Buffer.byteLength(value, "utf8") > CONSUMER_BUDGETS.max_string_bytes) {
        fail("scope_rejected", "json_string_budget_exceeded");
      }
      continue;
    }
    if (value === null || typeof value !== "object") continue;
    if (active.has(value)) fail("incompatible", "canonical_cycle");
    if (!Array.isArray(value) && !isPlainObject(value)) {
      fail("incompatible", "unsupported_non_plain_object");
    }
    const children = Array.isArray(value) ? value : Object.values(value);
    const limit = Array.isArray(value)
      ? CONSUMER_BUDGETS.max_array_entries
      : CONSUMER_BUDGETS.max_object_fields;
    if (children.length > limit) fail("scope_rejected", "json_width_budget_exceeded");
    active.add(value);
    stack.push({ depth: frame.depth, entering: false, value });
    for (let index = children.length - 1; index >= 0; index -= 1) {
      stack.push({ depth: frame.depth + 1, entering: true, value: children[index] });
    }
  }
}

function canonicalJson(value) {
  validateJsonBudget(value);
  function project(current) {
    if (current === null || typeof current !== "object") {
      return JSON.stringify(current);
    }
    if (Array.isArray(current)) {
      return `[${current.map(project).join(",")}]`;
    }
    return `{${Object.keys(current)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${project(current[key])}`)
      .join(",")}}`;
  }
  return project(value);
}

function createState() {
  return {
    bytes_read: 0,
    digests_computed: 0,
    file_digests: {},
    file_reads: 0,
    metadata_reads: 0,
    read_cache: new Map(),
  };
}

function digestBytes(bytes, state) {
  state.digests_computed += 1;
  return createHash("sha256").update(bytes).digest("hex");
}

function digestJson(value, state) {
  return digestBytes(canonicalJson(value), state);
}

function validateRelativePath(path) {
  if (
    typeof path !== "string" ||
    path.length === 0 ||
    isAbsolute(path) ||
    path.includes("\\") ||
    path.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    fail("scope_rejected", "certification_path_rejected", String(path));
  }
  const approved =
    Object.values(CERTIFICATION_PATHS).includes(path) ||
    /^docs\/recovery\/action-661j5r(?:3a|4|5|6|6a|7|8|9)\/runtime-evidence\/[a-z0-9._/-]+\.json$/.test(path) ||
    /^lib\/action-661j5r[2-9][a-z0-9-]*\.mjs$/.test(path);
  if (!approved) fail("scope_rejected", "certification_path_not_allowlisted", path);
  return path;
}

function checkedRoot(repositoryRoot, boundary, state) {
  if (typeof repositoryRoot !== "string" || !isAbsolute(repositoryRoot)) {
    fail("scope_rejected", "repository_root_invalid");
  }
  state.metadata_reads += 1;
  const rootStat = boundary.lstat(repositoryRoot);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    fail("scope_rejected", "repository_root_rejected");
  }
  state.metadata_reads += 1;
  const canonicalRoot = boundary.realpath(repositoryRoot);
  if (canonicalRoot !== repositoryRoot) {
    fail("scope_rejected", "repository_root_not_canonical");
  }
  return repositoryRoot;
}

function checkedAbsolutePath(root, relativePath, boundary, state) {
  validateRelativePath(relativePath);
  const absolute = resolve(root, relativePath);
  if (relative(root, absolute).startsWith("..") || absolute === root) {
    fail("scope_rejected", "certification_path_escaped", relativePath);
  }
  let current = root;
  for (const part of relativePath.split("/")) {
    current = resolve(current, part);
    state.metadata_reads += 1;
    let metadata;
    try {
      metadata = boundary.lstat(current);
    } catch (error) {
      if (error && typeof error === "object" && error.code === "ENOENT") {
        fail("incomplete", "certification_file_missing", relativePath);
      }
      fail("incomplete", "certification_metadata_unavailable", relativePath);
    }
    if (metadata.isSymbolicLink()) {
      fail("scope_rejected", "certification_symlink_rejected", relativePath);
    }
  }
  return absolute;
}

function readApproved(root, path, boundary, state) {
  if (state.read_cache.has(path)) return state.read_cache.get(path);
  if (state.file_reads >= CONSUMER_BUDGETS.max_files) {
    fail("scope_rejected", "file_count_budget_exceeded", path);
  }
  const absolute = checkedAbsolutePath(root, path, boundary, state);
  let bytes;
  try {
    bytes = boundary.readFile(absolute);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      fail("incomplete", "certification_file_missing", path);
    }
    fail("incomplete", "certification_file_unreadable", path);
  }
  if (!Buffer.isBuffer(bytes)) bytes = Buffer.from(bytes);
  state.file_reads += 1;
  state.bytes_read += bytes.length;
  if (state.bytes_read > CONSUMER_BUDGETS.max_bytes) {
    fail("scope_rejected", "byte_budget_exceeded", path);
  }
  const observed = digestBytes(bytes, state);
  state.file_digests[path] = observed;
  state.read_cache.set(path, bytes);
  return bytes;
}

function parseCertificationFile(root, path, boundary, state, requireCanonical = false) {
  const bytes = readApproved(root, path, boundary, state);
  let parsed;
  try {
    parsed = JSON.parse(bytes.toString("utf8"));
  } catch {
    fail("tampered", "certification_json_malformed", path);
  }
  assertPlain(parsed, "certification_json_root_invalid", path);
  if (requireCanonical && bytes.toString("utf8") !== `${canonicalJson(parsed)}\n`) {
    fail("tampered", "certification_json_not_canonical", path);
  }
  return parsed;
}

function expectEqual(actual, expected, reason, path = null) {
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    fail("tampered", reason, path, safeDigest(actual), safeDigest(expected));
  }
}

function safeDigest(value) {
  try {
    return createHash("sha256").update(canonicalJson(value)).digest("hex");
  } catch {
    return null;
  }
}

function expectDigest(actual, expected, reason, path, state) {
  const observed = digestJson(actual, state);
  if (observed !== expected) fail("tampered", reason, path, observed, expected);
}

function verifySelfDigest(value, field, reason, path, state) {
  assertPlain(value, reason, path);
  const expected = assertString(value[field], reason, path);
  expectDigest(without(value, field), expected, reason, path, state);
}

function verifySnapshot(snapshot, path, state) {
  assertClosed(snapshot, SNAPSHOT_FIELDS, "snapshot_shape_invalid", path);
  if (
    snapshot.snapshot_contract !== "action_661j5r2_metadata_first_snapshot_rebuild_v1" ||
    snapshot.snapshot_schema_version !== "action_661j5r2_nine_domain_v2"
  ) fail("incompatible", "snapshot_version_incompatible", path);
  const domains = assertArray(snapshot.domains, "snapshot_domains_invalid", path);
  if (domains.length !== 9) fail("incomplete", "snapshot_domain_inventory_incomplete", path);
  const ids = [];
  for (const domain of domains) {
    assertClosed(domain, DOMAIN_FIELDS, "snapshot_domain_shape_invalid", path);
    ids.push(domain.domain_id);
    if (domain.domain_version !== "v2") {
      fail("incompatible", "snapshot_domain_version_incompatible", path);
    }
    expectDigest({
      domain_id: domain.domain_id,
      domain_version: domain.domain_version,
      value: domain.value,
    }, domain.domain_digest, "snapshot_domain_digest_mismatch", path, state);
  }
  expectEqual(ids, DOMAIN_IDS, "snapshot_domain_inventory_mismatch", path);
  const targetDomain = domains.find((domain) => domain.domain_id === "target_data");
  const targets = assertArray(targetDomain.value, "target_inventory_invalid", path);
  const targetRelations = [];
  for (const target of targets) {
    assertClosed(target, TARGET_FIELDS, "target_shape_invalid", path);
    targetRelations.push(target.relation);
    if (target.relation_state === "present_table") {
      if (
        target.data_status !== "captured" ||
        !Array.isArray(target.rows) ||
        target.reason !== null
      ) fail("tampered", "target_present_data_invalid", path);
      expectDigest(target.rows, target.data_digest, "target_data_digest_mismatch", path, state);
    } else if (
      !["missing", "non_table", "wrong_owner"].includes(target.relation_state) ||
      target.data_status !== "not_read_due_to_relation_state" ||
      target.rows !== null ||
      target.data_digest !== null
    ) {
      fail("tampered", "target_invalid_state_data_invalid", path);
    }
  }
  if (new Set(targetRelations).size !== targetRelations.length) {
    fail("tampered", "target_inventory_duplicate", path);
  }
  expectEqual(targetRelations, snapshot.target_inventory, "target_inventory_mismatch", path);
  expectDigest({
    snapshot_contract: snapshot.snapshot_contract,
    snapshot_schema_version: snapshot.snapshot_schema_version,
    target_inventory: snapshot.target_inventory,
    domains: snapshot.domains,
  }, snapshot.combined_digest, "snapshot_combined_digest_mismatch", path, state);
}

function domainValue(snapshot, domainId) {
  return snapshot.domains.find((domain) => domain.domain_id === domainId).value;
}

function verifyDiagnostic(diagnostic, scenarioId, path, state) {
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
  ], "diagnostic_shape_invalid", path);
  assertClosed(diagnostic.safety, [
    "connection_string_present",
    "credential_material_present",
    "query_text_present",
    "raw_error_object_present",
    "stack_trace_present",
  ], "diagnostic_safety_shape_invalid", path);
  if (
    diagnostic.scenario_id !== scenarioId ||
    diagnostic.diagnostic_sanitized !== true ||
    Object.values(diagnostic.safety).some((value) => value !== false)
  ) fail("tampered", "diagnostic_safety_mismatch", path);
  verifySelfDigest(diagnostic, "diagnostic_digest", "diagnostic_digest_mismatch", path, state);
}

function verifyRuntimeIdentity(identity, path, state) {
  assertClosed(identity, [
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
  ], "runtime_identity_shape_invalid", path);
  if (
    identity.engine !== "postgresql" ||
    identity.image_repository !== "postgres" ||
    identity.image_tag !== "16-alpine" ||
    identity.server_major !== 16
  ) fail("incompatible", "runtime_identity_incompatible", path);
  verifySelfDigest(identity, "identity_digest", "runtime_identity_digest_mismatch", path, state);
}

function verifyRunnerIdentity(identity, root, boundary, path, state) {
  assertPlain(identity, "runner_identity_invalid", path);
  verifySelfDigest(identity, "runner_identity_digest", "runner_identity_digest_mismatch", path, state);
  expectDigest(identity.capability_matrix, identity.capability_matrix_digest, "runner_capability_digest_mismatch", path, state);
  for (const [modulePathField, moduleDigestField] of [
    ["runner_module_path", "runner_module_sha256"],
    ["authority_module_path", "authority_module_sha256"],
  ]) {
    const modulePath = assertString(identity[modulePathField], "runner_module_path_invalid", path);
    const bytes = readApproved(root, modulePath, boundary, state);
    const observed = state.file_digests[modulePath];
    if (observed !== identity[moduleDigestField]) {
      fail("tampered", "runner_module_digest_mismatch", modulePath, observed, identity[moduleDigestField]);
    }
    if (bytes.length === 0) fail("incomplete", "runner_module_empty", modulePath);
  }
  if (identity.no_external_access !== true || identity.no_production_access !== true) {
    fail("incompatible", "runner_boundary_incompatible", path);
  }
}

function verifyCaptureAndAtomicity(evidence, path, state) {
  verifySnapshot(evidence.prestate, path, state);
  verifySnapshot(evidence.poststate, path, state);
  const reads = assertArray(evidence.guarded_reads, "guarded_reads_invalid", path);
  const relations = [];
  for (const read of reads) {
    assertClosed(read, ["oid", "relation", "rows"], "guarded_read_shape_invalid", path);
    relations.push(read.relation);
    if (!Number.isInteger(read.oid) || read.oid <= 0 || !Array.isArray(read.rows)) {
      fail("tampered", "guarded_read_invalid", path);
    }
  }
  const sorted = [...relations].sort((left, right) => left.localeCompare(right));
  expectEqual(relations, sorted, "guarded_read_order_mismatch", path);
  if (new Set(relations).size !== relations.length) {
    fail("tampered", "guarded_read_duplicate", path);
  }
  for (const target of domainValue(evidence.prestate, "target_data")) {
    const matching = reads.filter((read) => read.relation === target.relation);
    if (target.relation_state === "present_table") {
      if (matching.length !== 1 || matching[0].oid !== target.observed_relation.oid) {
        fail("tampered", "guarded_read_missing_for_present", path);
      }
      expectEqual(matching[0].rows, target.rows, "guarded_read_rows_mismatch", path);
    } else if (matching.length !== 0) {
      fail("tampered", "guarded_read_for_invalid_state", path);
    }
  }
  expectDigest({
    diagnostic_digest: evidence.diagnostic.diagnostic_digest,
    guarded_reads: evidence.guarded_reads,
    poststate_combined_digest: evidence.poststate.combined_digest,
    prestate_combined_digest: evidence.prestate.combined_digest,
    runtime_identity_digest: evidence.runtime_identity.identity_digest,
  }, evidence.runtime_capture_digest, "runtime_capture_digest_mismatch", path, state);

  if (evidence.scenario_id === "successful_containment") {
    if (
      evidence.atomicity_decision !== "closed_transition_verified" ||
      evidence.migration_applied !== true ||
      evidence.terminal_state !== "completed" ||
      evidence.diagnostic.terminal_state !== "completed" ||
      evidence.diagnostic.migration_applied !== true
    ) fail("tampered", "successful_transition_identity_mismatch", path);
    for (const id of [
      "schema_relations",
      "target_data",
      "rls_policies",
      "column_acl",
      "function_catalog",
    ]) {
      expectEqual(domainValue(evidence.prestate, id), domainValue(evidence.poststate, id), `successful_unchanged_domain_mismatch:${id}`, path);
    }
    const expectedEntry = evidence.precondition_reference.expected_post_history_entry;
    expectEqual(
      domainValue(evidence.poststate, "migration_history"),
      [...domainValue(evidence.prestate, "migration_history"), expectedEntry],
      "successful_history_transition_mismatch",
      path,
    );
  } else {
    if (
      evidence.atomicity_decision !== "no_transition_verified" ||
      evidence.migration_applied !== false ||
      evidence.terminal_state !== "controlled_error" ||
      evidence.diagnostic.migration_applied !== false ||
      evidence.diagnostic.terminal_state !== "controlled_error"
    ) fail("tampered", "failure_atomicity_identity_mismatch", path);
    expectEqual(evidence.prestate, evidence.poststate, "failure_transition_detected", path);
  }
}

function semanticProjection(evidence) {
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

function verifyPersistedFile(file, relativePath, expectedManifestEntry, root, boundary, state) {
  assertClosed(file, FILE_FIELDS, "persisted_file_shape_invalid", relativePath);
  const record = file.record;
  const shard = file.shard;
  const evidence = record?.evidence;
  assertClosed(record, RECORD_FIELDS, "record_shape_invalid", relativePath);
  assertClosed(shard, SHARD_FIELDS, "shard_shape_invalid", relativePath);
  assertClosed(evidence, EVIDENCE_FIELDS, "evidence_shape_invalid", relativePath);
  const scenarioId = assertString(evidence.scenario_id, "scenario_id_invalid", relativePath);
  if (!(scenarioId in EXPECTED_SCENARIOS)) {
    fail("incompatible", "scenario_incompatible", relativePath);
  }
  if (
    record.scenario_id !== scenarioId ||
    shard.scenario_id !== scenarioId ||
    record.run_id !== shard.run_id ||
    record.shard_id !== shard.shard_id ||
    file.protocol_version !== evidence.protocol_version ||
    record.protocol_version !== evidence.protocol_version ||
    shard.protocol_version !== evidence.protocol_version ||
    record.terminal_status !== "passed" ||
    shard.terminal_count !== 1
  ) fail("tampered", "cross_layer_identity_mismatch", relativePath);
  verifyDiagnostic(evidence.diagnostic, scenarioId, relativePath, state);
  verifyRuntimeIdentity(evidence.runtime_identity, relativePath, state);
  expectDigest(evidence.policy_registry, evidence.policy_registry_digest, "policy_registry_digest_mismatch", relativePath, state);
  expectDigest(evidence.runtime_registry, evidence.runtime_registry_digest, "runtime_registry_digest_mismatch", relativePath, state);
  verifySelfDigest(evidence.precondition_reference, "precondition_reference_digest", "precondition_reference_digest_mismatch", relativePath, state);
  if (evidence.precondition_reference.scenario_id !== scenarioId) {
    fail("tampered", "precondition_scenario_mismatch", relativePath);
  }
  verifyRunnerIdentity(evidence.runner_identity, root, boundary, relativePath, state);
  verifyCaptureAndAtomicity(evidence, relativePath, state);
  verifySelfDigest(evidence, "evidence_digest", "evidence_digest_mismatch", relativePath, state);
  if (record.evidence_digest !== evidence.evidence_digest) {
    fail("tampered", "record_evidence_digest_mismatch", relativePath);
  }
  verifySelfDigest(record, "record_digest", "record_digest_mismatch", relativePath, state);
  if (
    shard.record_digest !== record.record_digest ||
    file.record_digest !== record.record_digest
  ) fail("tampered", "record_digest_propagation_mismatch", relativePath);
  verifySelfDigest(shard, "shard_digest", "shard_digest_mismatch", relativePath, state);
  if (file.shard_digest !== shard.shard_digest) {
    fail("tampered", "shard_digest_propagation_mismatch", relativePath);
  }
  verifySelfDigest(file, "canonical_file_digest", "canonical_file_digest_mismatch", relativePath, state);
  if (basename(relativePath) !== file.file_identity) {
    fail("tampered", "persisted_file_identity_mismatch", relativePath);
  }
  for (const field of [
    "canonical_file_digest",
    "protocol_version",
    "record_digest",
    "run_id",
    "scenario_id",
    "shard_digest",
  ]) {
    const source = field === "canonical_file_digest" || field === "protocol_version"
      ? file[field]
      : field === "record_digest"
        ? record.record_digest
        : field === "shard_digest"
          ? shard.shard_digest
          : record[field];
    if (expectedManifestEntry[field] !== source) {
      fail("tampered", "freeze_evidence_binding_mismatch", relativePath);
    }
  }
  const semanticDigest = digestJson(semanticProjection(evidence), state);
  if (
    semanticDigest !== EXPECTED_SCENARIOS[scenarioId] ||
    expectedManifestEntry.semantic_digest !== semanticDigest
  ) {
    fail("tampered", "scenario_semantic_digest_mismatch", relativePath, semanticDigest, EXPECTED_SCENARIOS[scenarioId]);
  }
  return { file, record, shard, evidence, semanticDigest };
}

function verifyRecoveryDisclosure(disclosure, path) {
  if (
    disclosure.manifest_version !== "action_661j5r1_loss_reconstruction_manifest_v1" ||
    disclosure.decision !== "complete_certified_scope_not_recovered" ||
    disclosure.audit?.complete_scope_recovered !== false ||
    disclosure.audit?.partial_recovery_promoted !== false ||
    disclosure.classification_rules?.exact_recovery_requires_full_sha256_match !== true ||
    disclosure.classification_rules?.partial_recovery_promoted !== false ||
    disclosure.classification_rules?.historical_hashes_are_commitments_not_bytes !== true ||
    disclosure.partial_recovery?.promoted_to_certified_foundation !== false ||
    disclosure.reconstruction_plan?.historical_commitments_use !==
      "regression witnesses only; never expected reconstructed bytes"
  ) fail("tampered", "recovery_disclosure_claim_mismatch", path);
}

function verifyPreservationChain(manifest, path) {
  const actual = assertArray(manifest.preservation_refs, "preservation_chain_invalid", path)
    .map((entry) => {
      assertClosed(entry, ["commit", "reachable_from_final", "ref"], "preservation_entry_invalid", path);
      if (entry.reachable_from_final !== true) {
        fail("tampered", "preservation_reachability_claim_mismatch", path);
      }
      return [entry.ref, entry.commit];
    });
  expectEqual(actual, EXPECTED_PRESERVATION_CHAIN, "preservation_chain_identity_mismatch", path);
}

function verifyFreezeManifest(manifest, path, state) {
  if (
    manifest.audit_contract !== "action_661j5r10_final_freeze_manifest_v1" ||
    manifest.manifest_digest !== CERTIFICATION_AUTHORITIES.final_freeze_manifest_digest ||
    manifest.authority?.final_aggregate_digest !== CERTIFICATION_AUTHORITIES.final_aggregate_digest ||
    manifest.authority?.fixture_progress !== "28/28" ||
    manifest.final_aggregate?.scenario_count !== 14 ||
    manifest.final_aggregate?.shard_count !== 28 ||
    manifest.final_aggregate?.path !== CERTIFICATION_PATHS.aggregate ||
    manifest.final_aggregate?.file_sha256 !== CERTIFICATION_AUTHORITIES.final_aggregate_file_sha256
  ) fail("tampered", "final_freeze_authority_mismatch", path);
  verifySelfDigest(manifest, "manifest_digest", "final_freeze_manifest_digest_mismatch", path, state);
  verifyPreservationChain(manifest, path);
  const evidenceFiles = assertArray(manifest.evidence_files, "freeze_evidence_inventory_invalid", path);
  if (evidenceFiles.length !== 28) {
    fail("incomplete", "freeze_evidence_inventory_incomplete", path);
  }
  const paths = evidenceFiles.map((entry) => entry.path);
  if (new Set(paths).size !== 28) fail("tampered", "freeze_evidence_inventory_duplicate", path);
  for (const evidencePath of paths) validateRelativePath(evidencePath);
}

function verifyReview(review, path) {
  if (
    review.review_contract !== "action_661j5r10_independent_certification_review_v1" ||
    review.manifest_digest !== CERTIFICATION_AUTHORITIES.final_freeze_manifest_digest ||
    review.manifest_path !== CERTIFICATION_PATHS.freeze_manifest ||
    review.authority?.final_aggregate_digest !== CERTIFICATION_AUTHORITIES.final_aggregate_digest ||
    review.authority?.fixture_progress !== "28/28" ||
    Object.values(review.findings ?? {}).some((entries) => !Array.isArray(entries) || entries.length !== 0)
  ) fail("tampered", "independent_review_binding_mismatch", path);
}

function verifyAggregate(aggregate, verifiedFiles, path, state) {
  assertClosed(aggregate, [
    "aggregate_digest",
    "aggregate_version",
    "decision",
    "input_files",
    "scenario_comparisons",
    "shard_count",
  ], "aggregate_shape_invalid", path);
  if (
    aggregate.aggregate_version !== "action_661j5r9_twenty_eight_shard_aggregate_rebuild_v1" ||
    aggregate.aggregate_digest !== CERTIFICATION_AUTHORITIES.final_aggregate_digest ||
    aggregate.decision !== "certified" ||
    aggregate.shard_count !== 28
  ) fail("incompatible", "aggregate_authority_incompatible", path);
  verifySelfDigest(aggregate, "aggregate_digest", "aggregate_digest_mismatch", path, state);
  const inputs = assertArray(aggregate.input_files, "aggregate_input_inventory_invalid", path);
  const comparisons = assertArray(aggregate.scenario_comparisons, "aggregate_comparison_inventory_invalid", path);
  if (inputs.length !== 28 || comparisons.length !== 14) {
    fail("incomplete", "aggregate_inventory_incomplete", path);
  }
  const byDigest = new Map(verifiedFiles.map((entry) => [entry.file.canonical_file_digest, entry]));
  const identities = new Set();
  for (const input of inputs) {
    assertClosed(input, [
      "canonical_file_digest",
      "protocol_version",
      "record_digest",
      "run_id",
      "scenario_id",
      "shard_digest",
      "shard_id",
    ], "aggregate_input_shape_invalid", path);
    const verified = byDigest.get(input.canonical_file_digest);
    if (!verified) fail("tampered", "aggregate_input_substitution", path);
    for (const field of Object.keys(input)) {
      const expected = field === "canonical_file_digest" || field === "protocol_version"
        ? verified.file[field]
        : field === "record_digest"
          ? verified.record.record_digest
          : field === "shard_digest"
            ? verified.shard.shard_digest
            : verified.record[field];
      if (input[field] !== expected) fail("tampered", "aggregate_input_binding_mismatch", path);
    }
    const identity = `${input.scenario_id}/${input.run_id}`;
    if (identities.has(identity)) fail("tampered", "aggregate_input_duplicate", path);
    identities.add(identity);
  }
  const expectedIdentities = Object.keys(EXPECTED_SCENARIOS)
    .flatMap((scenario) => ["run-a", "run-b"].map((run) => `${scenario}/${run}`))
    .sort();
  expectEqual([...identities].sort(), expectedIdentities, "aggregate_identity_inventory_mismatch", path);
  const comparisonScenarios = new Set();
  for (const comparison of comparisons) {
    assertClosed(comparison, [
      "atomicity_decision",
      "deterministic",
      "scenario_id",
      "semantic_digest",
    ], "aggregate_comparison_shape_invalid", path);
    const expectedSemantic = EXPECTED_SCENARIOS[comparison.scenario_id];
    if (
      comparisonScenarios.has(comparison.scenario_id) ||
      comparison.deterministic !== true ||
      comparison.semantic_digest !== expectedSemantic ||
      comparison.atomicity_decision !==
        (comparison.scenario_id === "successful_containment"
          ? "closed_transition_verified"
          : "no_transition_verified")
    ) fail("tampered", "aggregate_comparison_mismatch", path);
    comparisonScenarios.add(comparison.scenario_id);
  }
  expectEqual([...comparisonScenarios].sort(), Object.keys(EXPECTED_SCENARIOS).sort(), "aggregate_scenario_inventory_mismatch", path);
}

function result(status, reason, state, observed, provenance = null) {
  return deepFreeze({
    consumer_version: CONSUMER_VERSION,
    status,
    reason,
    counts: {
      bytes_read: state.bytes_read,
      digests_computed: state.digests_computed,
      file_reads: state.file_reads,
      fixtures_verified: observed.fixtures_verified ?? 0,
      metadata_reads: state.metadata_reads,
      scenarios_verified: observed.scenarios_verified ?? 0,
      shards_verified: observed.shards_verified ?? 0,
    },
    observed: {
      aggregate_digest: observed.aggregate_digest ?? null,
      delivery_digest: CERTIFICATION_AUTHORITIES.delivery_digest,
      file_digests: Object.fromEntries(Object.entries(state.file_digests).sort(([left], [right]) => left.localeCompare(right))),
      freeze_manifest_digest: observed.freeze_manifest_digest ?? null,
    },
    failure_provenance: provenance,
  });
}

const OFF_RESULT = result(
  "incomplete",
  "consumer_disabled",
  createState(),
  {},
);

export function createRuntimeCertificationConsumerV1(boundary = DEFAULT_BOUNDARY) {
  assertClosed(boundary, ["lstat", "readFile", "realpath"], "read_boundary_invalid");
  for (const method of Object.values(boundary)) {
    if (typeof method !== "function") fail("incompatible", "read_boundary_invalid");
  }
  return function consumeRuntimeCertificationV1(request = {}) {
    if (request.enabled !== true) return OFF_RESULT;
    const state = createState();
    const observed = {};
    try {
      assertClosed(request, ["enabled", "repository_root"], "consumer_request_invalid");
      const root = checkedRoot(request.repository_root, boundary, state);
      const manifest = parseCertificationFile(root, CERTIFICATION_PATHS.freeze_manifest, boundary, state);
      verifyFreezeManifest(manifest, CERTIFICATION_PATHS.freeze_manifest, state);
      observed.freeze_manifest_digest = manifest.manifest_digest;
      if (state.file_digests[CERTIFICATION_PATHS.freeze_manifest] !== digestBytes(readApproved(root, CERTIFICATION_PATHS.freeze_manifest, boundary, state), state)) {
        fail("tampered", "freeze_manifest_read_instability", CERTIFICATION_PATHS.freeze_manifest);
      }

      const review = parseCertificationFile(root, CERTIFICATION_PATHS.independent_review, boundary, state);
      if (state.file_digests[CERTIFICATION_PATHS.independent_review] !== CERTIFICATION_AUTHORITIES.independent_review_file_sha256) {
        fail("tampered", "independent_review_file_digest_mismatch", CERTIFICATION_PATHS.independent_review, state.file_digests[CERTIFICATION_PATHS.independent_review], CERTIFICATION_AUTHORITIES.independent_review_file_sha256);
      }
      verifyReview(review, CERTIFICATION_PATHS.independent_review);

      const disclosure = parseCertificationFile(root, CERTIFICATION_PATHS.recovery_disclosure, boundary, state);
      if (state.file_digests[CERTIFICATION_PATHS.recovery_disclosure] !== CERTIFICATION_AUTHORITIES.recovery_disclosure_file_sha256) {
        fail("tampered", "recovery_disclosure_file_digest_mismatch", CERTIFICATION_PATHS.recovery_disclosure, state.file_digests[CERTIFICATION_PATHS.recovery_disclosure], CERTIFICATION_AUTHORITIES.recovery_disclosure_file_sha256);
      }
      verifyRecoveryDisclosure(disclosure, CERTIFICATION_PATHS.recovery_disclosure);

      const aggregate = parseCertificationFile(root, CERTIFICATION_PATHS.aggregate, boundary, state, true);
      if (state.file_digests[CERTIFICATION_PATHS.aggregate] !== CERTIFICATION_AUTHORITIES.final_aggregate_file_sha256) {
        fail("tampered", "aggregate_file_digest_mismatch", CERTIFICATION_PATHS.aggregate, state.file_digests[CERTIFICATION_PATHS.aggregate], CERTIFICATION_AUTHORITIES.final_aggregate_file_sha256);
      }

      const verifiedFiles = [];
      for (const entry of manifest.evidence_files) {
        assertPlain(entry, "freeze_evidence_entry_invalid", CERTIFICATION_PATHS.freeze_manifest);
        const evidencePath = validateRelativePath(entry.path);
        const file = parseCertificationFile(root, evidencePath, boundary, state, true);
        if (state.file_digests[evidencePath] !== entry.file_sha256) {
          fail("tampered", "fixture_file_digest_mismatch", evidencePath, state.file_digests[evidencePath], entry.file_sha256);
        }
        verifiedFiles.push(
          verifyPersistedFile(file, evidencePath, entry, root, boundary, state),
        );
      }
      observed.fixtures_verified = verifiedFiles.length;
      observed.shards_verified = verifiedFiles.length;
      observed.scenarios_verified = new Set(verifiedFiles.map((entry) => entry.record.scenario_id)).size;

      for (const predecessor of manifest.predecessor_aggregates) {
        validateRelativePath(predecessor.path);
        readApproved(root, predecessor.path, boundary, state);
        if (state.file_digests[predecessor.path] !== predecessor.file_sha256) {
          fail("tampered", "predecessor_aggregate_digest_mismatch", predecessor.path, state.file_digests[predecessor.path], predecessor.file_sha256);
        }
      }

      verifyAggregate(aggregate, verifiedFiles, CERTIFICATION_PATHS.aggregate, state);
      observed.aggregate_digest = aggregate.aggregate_digest;
      return result("certified", "certification_chain_verified", state, observed);
    } catch (error) {
      const failure = error instanceof CertificationError
        ? error
        : new CertificationError("incomplete", "read_boundary_failure");
      return result(failure.status, failure.reason, state, observed, {
        expected_digest: failure.expected,
        observed_digest: failure.observed,
        path: failure.path,
        stage: failure.reason,
      });
    }
  };
}

export const consumeRuntimeCertificationV1 =
  createRuntimeCertificationConsumerV1();
