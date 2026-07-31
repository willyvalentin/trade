import { createHash } from "node:crypto";
import {
  closeSync,
  constants as fsConstants,
  fstatSync,
  lstatSync,
  openSync,
  readSync,
  realpathSync,
} from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import {
  CERTIFICATION_AUTHORITIES,
  CERTIFICATION_PATHS,
  createRuntimeCertificationConsumerV1,
} from "./action-661j5n1-runtime-certification-consumer.mjs";

export const CONSUMER_V2_VERSION =
  "action_661j5n2a_descriptor_bound_certification_consumer_v2";

export const CONSUMER_V2_BUDGETS = deepFreeze({
  max_array_entries: 4096,
  max_bytes: 16 * 1024 * 1024,
  max_depth: 32,
  max_file_bytes: 2 * 1024 * 1024,
  max_files: 96,
  max_json_nodes: 500_000,
  max_object_fields: 512,
  max_path_components: 32,
  max_string_bytes: 1024 * 1024,
});

export const PROVIDER_STAGES_V2 = Object.freeze([
  "root_validation",
  "lstat",
  "open",
  "descriptor_fstat",
  "descriptor_identity",
  "descriptor_read",
  "post_read_fstat",
  "close",
]);

const RESULT_STATUSES = Object.freeze([
  "certified",
  "incomplete",
  "tampered",
  "incompatible",
  "scope_rejected",
]);

const FIXED_PATHS = Object.freeze([
  CERTIFICATION_PATHS.freeze_manifest,
  CERTIFICATION_PATHS.independent_review,
  CERTIFICATION_PATHS.recovery_disclosure,
  CERTIFICATION_PATHS.aggregate,
]);

const DEFAULT_PROVIDER = Object.freeze({
  close: (descriptor) => closeSync(descriptor),
  fstat: (descriptor) => fstatSync(descriptor, { bigint: true }),
  lstat: (path) => lstatSync(path, { bigint: true }),
  nofollow_flag: fsConstants.O_NOFOLLOW,
  open: (path, flags) => openSync(path, flags),
  readonly_flag: fsConstants.O_RDONLY,
  read: (descriptor, buffer, offset, length, position) =>
    readSync(descriptor, buffer, offset, length, position),
  realpath: (path) => realpathSync(path),
});

const PROVIDER_FIELDS = Object.freeze([
  "close",
  "fstat",
  "lstat",
  "nofollow_flag",
  "open",
  "readonly_flag",
  "read",
  "realpath",
]);

const REQUEST_FIELDS = Object.freeze(["enabled", "repository_root"]);

class V2Failure extends Error {
  constructor({
    code = "CONTRACT_REJECTION",
    errorClass = "ContractViolation",
    metadata = {},
    path = null,
    reason,
    stage,
    status,
  }) {
    super(reason);
    this.code = code;
    this.errorClass = errorClass;
    this.metadata = metadata;
    this.path = path;
    this.reason = reason;
    this.stage = stage;
    this.status = status;
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

function assertClosed(value, fields, reason) {
  if (!isPlainObject(value)) contractFail("incompatible", reason);
  const actual = Object.keys(value).sort();
  const expected = [...fields].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    contractFail("incompatible", reason);
  }
}

function contractFail(status, reason, stage = "descriptor_identity", path = null, metadata = {}) {
  throw new V2Failure({ metadata, path, reason, stage, status });
}

function sanitizeToken(value, fallback) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_]{1,64}$/.test(value)) {
    return fallback;
  }
  return value;
}

function providerFailure(stage, path, error, metadata = {}) {
  if (error instanceof V2Failure) throw error;
  const code = sanitizeToken(error?.code, "UNKNOWN_PROVIDER_ERROR");
  const errorClass = sanitizeToken(error?.constructor?.name, "ProviderError");
  const status = stage === "open" && code === "ELOOP"
    ? "scope_rejected"
    : "incomplete";
  const reason = stage === "open" && code === "ELOOP"
    ? "descriptor_nofollow_rejected"
    : `provider_${stage}_failed`;
  throw new V2Failure({ code, errorClass, metadata, path, reason, stage, status });
}

function providerCall(state, stage, path, operation, metadata = {}) {
  state.provider_calls[stage] += 1;
  try {
    return operation();
  } catch (error) {
    providerFailure(stage, path, error, metadata);
  }
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
    if (nodes > CONSUMER_V2_BUDGETS.max_json_nodes) {
      contractFail("scope_rejected", "json_node_budget_exceeded");
    }
    if (frame.depth > CONSUMER_V2_BUDGETS.max_depth) {
      contractFail("scope_rejected", "json_depth_budget_exceeded");
    }
    if (
      value === undefined ||
      typeof value === "bigint" ||
      typeof value === "function" ||
      typeof value === "symbol" ||
      (typeof value === "number" && !Number.isFinite(value))
    ) contractFail("incompatible", "unsupported_canonical_value");
    if (typeof value === "string") {
      if (Buffer.byteLength(value) > CONSUMER_V2_BUDGETS.max_string_bytes) {
        contractFail("scope_rejected", "json_string_budget_exceeded");
      }
      continue;
    }
    if (value === null || typeof value !== "object") continue;
    if (active.has(value)) contractFail("incompatible", "canonical_cycle");
    if (!Array.isArray(value) && !isPlainObject(value)) {
      contractFail("incompatible", "unsupported_non_plain_object");
    }
    const children = Array.isArray(value) ? value : Object.values(value);
    const limit = Array.isArray(value)
      ? CONSUMER_V2_BUDGETS.max_array_entries
      : CONSUMER_V2_BUDGETS.max_object_fields;
    if (children.length > limit) {
      contractFail("scope_rejected", "json_width_budget_exceeded");
    }
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
    if (Array.isArray(current)) return `[${current.map(project).join(",")}]`;
    return `{${Object.keys(current)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${project(current[key])}`)
      .join(",")}}`;
  }
  return project(value);
}

function sha256(value, state = null) {
  if (state) state.digests_computed += 1;
  return createHash("sha256").update(value).digest("hex");
}

function digestJson(value, state = null) {
  return sha256(canonicalJson(value), state);
}

function createState() {
  return {
    bytes_read: 0,
    descriptors_closed: 0,
    descriptors_opened: 0,
    digests_computed: 0,
    file_digests: {},
    file_reads: 0,
    metadata_reads: 0,
    provider_calls: Object.fromEntries(PROVIDER_STAGES_V2.map((stage) => [stage, 0])),
  };
}

function validateRelativePath(path) {
  if (
    typeof path !== "string" ||
    path.length === 0 ||
    isAbsolute(path) ||
    path.includes("\\") ||
    path.split("/").some((part) => part === "" || part === "." || part === "..") ||
    path.split("/").length > CONSUMER_V2_BUDGETS.max_path_components
  ) contractFail("scope_rejected", "certification_path_rejected", "lstat");
  const approved =
    Object.values(CERTIFICATION_PATHS).includes(path) ||
    /^docs\/recovery\/action-661j5r(?:3a|4|5|6|6a|7|8|9)\/runtime-evidence\/[a-z0-9._/-]+\.json$/.test(path) ||
    /^lib\/action-661j5r[2-9][a-z0-9-]*\.mjs$/.test(path);
  if (!approved) contractFail("scope_rejected", "certification_path_not_allowlisted", "lstat");
  return path;
}

function metadata(stat, stage, path) {
  const required = ["dev", "ino", "mode", "size"];
  if (
    !stat ||
    typeof stat !== "object" ||
    required.some((field) => typeof stat[field] !== "bigint") ||
    typeof stat.isFile !== "function" ||
    typeof stat.isDirectory !== "function" ||
    typeof stat.isSymbolicLink !== "function"
  ) {
    contractFail("incompatible", "provider_metadata_semantics_unavailable", stage, path);
  }
  const time = (nanoseconds, milliseconds) => {
    if (typeof nanoseconds === "bigint") return nanoseconds.toString();
    if (typeof milliseconds === "bigint") return (milliseconds * 1_000_000n).toString();
    contractFail("incompatible", "provider_time_semantics_unavailable", stage, path);
  };
  return {
    ctime_ns: time(stat.ctimeNs, stat.ctimeMs),
    dev: stat.dev.toString(),
    file_type: stat.isFile() ? "regular" : stat.isDirectory() ? "directory" : stat.isSymbolicLink() ? "symlink" : "other",
    ino: stat.ino.toString(),
    mode: stat.mode.toString(),
    mtime_ns: time(stat.mtimeNs, stat.mtimeMs),
    size: stat.size.toString(),
  };
}

function identityProjection(value) {
  return {
    dev: value.dev,
    file_type: value.file_type,
    ino: value.ino,
  };
}

function assertIdentity(expected, observed, path, phase) {
  if (canonicalJson(identityProjection(expected)) !== canonicalJson(identityProjection(observed))) {
    contractFail("scope_rejected", "descriptor_identity_mismatch", "descriptor_identity", path, {
      identity_phase: phase,
    });
  }
}

function assertStableMetadata(expected, observed, path) {
  const fields = ["ctime_ns", "dev", "file_type", "ino", "mode", "mtime_ns", "size"];
  if (fields.some((field) => expected[field] !== observed[field])) {
    contractFail("tampered", "descriptor_post_read_mutation", "post_read_fstat", path, {
      identity_phase: "post_read",
    });
  }
}

function validateRoot(root, provider, state) {
  if (typeof root !== "string" || !isAbsolute(root)) {
    contractFail("scope_rejected", "repository_root_invalid", "root_validation");
  }
  state.metadata_reads += 1;
  const rootStat = providerCall(state, "root_validation", null, () => provider.lstat(root));
  const rootMetadata = metadata(rootStat, "root_validation", null);
  if (rootMetadata.file_type !== "directory") {
    contractFail("scope_rejected", "repository_root_rejected", "root_validation");
  }
  const canonicalRoot = providerCall(state, "root_validation", null, () => provider.realpath(root));
  if (canonicalRoot !== root) {
    contractFail("scope_rejected", "repository_root_not_canonical", "root_validation");
  }
  return rootMetadata;
}

function capturePath(root, rootMetadata, relativePath, provider, state) {
  const components = relativePath.split("/");
  const captured = [{ absolute: root, metadata: rootMetadata }];
  let current = root;
  for (let index = 0; index < components.length; index += 1) {
    current = resolve(current, components[index]);
    if (relative(root, current).startsWith("..") || current === root) {
      contractFail("scope_rejected", "certification_path_escaped", "lstat", relativePath);
    }
    state.metadata_reads += 1;
    const stat = providerCall(state, "lstat", relativePath, () => provider.lstat(current));
    const observed = metadata(stat, "lstat", relativePath);
    if (observed.file_type === "symlink") {
      contractFail("scope_rejected", "certification_symlink_rejected", "lstat", relativePath);
    }
    const final = index === components.length - 1;
    if ((!final && observed.file_type !== "directory") || (final && observed.file_type !== "regular")) {
      contractFail("scope_rejected", "certification_file_type_rejected", "lstat", relativePath);
    }
    captured.push({ absolute: current, metadata: observed });
  }
  return captured;
}

function revalidateCapturedPath(captured, relativePath, provider, state) {
  for (const entry of captured) {
    state.metadata_reads += 1;
    const stat = providerCall(state, "lstat", relativePath, () => provider.lstat(entry.absolute));
    const observed = metadata(stat, "lstat", relativePath);
    assertIdentity(entry.metadata, observed, relativePath, "post_open_path");
    if (observed.file_type === "symlink") {
      contractFail("scope_rejected", "certification_symlink_rejected", "descriptor_identity", relativePath);
    }
  }
}

function readDescriptorBound(root, rootMetadata, relativePath, provider, state) {
  validateRelativePath(relativePath);
  if (state.file_reads >= CONSUMER_V2_BUDGETS.max_files) {
    contractFail("scope_rejected", "file_count_budget_exceeded", "descriptor_read", relativePath);
  }
  if (
    typeof provider.nofollow_flag !== "number" ||
    provider.nofollow_flag === 0 ||
    typeof provider.readonly_flag !== "number"
  ) contractFail("incompatible", "descriptor_platform_semantics_unavailable", "open", relativePath);

  const captured = capturePath(root, rootMetadata, relativePath, provider, state);
  const expected = captured.at(-1).metadata;
  const expectedSize = BigInt(expected.size);
  if (expectedSize > BigInt(CONSUMER_V2_BUDGETS.max_file_bytes)) {
    contractFail("scope_rejected", "file_byte_budget_exceeded", "descriptor_read", relativePath, {
      max_file_bytes: CONSUMER_V2_BUDGETS.max_file_bytes,
    });
  }
  const absolute = captured.at(-1).absolute;
  let descriptor;
  let pendingFailure = null;
  try {
    descriptor = providerCall(state, "open", relativePath, () =>
      provider.open(absolute, provider.readonly_flag | provider.nofollow_flag));
    if (!Number.isInteger(descriptor) || descriptor < 0) {
      contractFail("incompatible", "descriptor_invalid", "open", relativePath);
    }
    state.descriptors_opened += 1;
    const descriptorStat = providerCall(state, "descriptor_fstat", relativePath, () => provider.fstat(descriptor));
    const opened = metadata(descriptorStat, "descriptor_fstat", relativePath);
    if (opened.file_type !== "regular") {
      contractFail("scope_rejected", "descriptor_file_type_rejected", "descriptor_identity", relativePath);
    }
    assertIdentity(expected, opened, relativePath, "lstat_to_fstat");
    if (opened.size !== expected.size) {
      contractFail("tampered", "descriptor_size_mismatch", "descriptor_identity", relativePath);
    }
    revalidateCapturedPath(captured, relativePath, provider, state);

    const size = Number(expectedSize);
    const bytes = Buffer.alloc(size);
    let offset = 0;
    while (offset < size) {
      const length = Math.min(64 * 1024, size - offset);
      const count = providerCall(state, "descriptor_read", relativePath, () =>
        provider.read(descriptor, bytes, offset, length, offset), {
        bytes_observed: offset,
        max_file_bytes: CONSUMER_V2_BUDGETS.max_file_bytes,
      });
      if (!Number.isInteger(count) || count <= 0 || count > length) {
        contractFail("tampered", "descriptor_short_read", "descriptor_read", relativePath, {
          bytes_observed: offset,
          max_file_bytes: CONSUMER_V2_BUDGETS.max_file_bytes,
        });
      }
      offset += count;
    }
    const postStat = providerCall(state, "post_read_fstat", relativePath, () => provider.fstat(descriptor));
    const post = metadata(postStat, "post_read_fstat", relativePath);
    assertStableMetadata(opened, post, relativePath);
    state.file_reads += 1;
    state.bytes_read += bytes.length;
    if (state.bytes_read > CONSUMER_V2_BUDGETS.max_bytes) {
      contractFail("scope_rejected", "total_byte_budget_exceeded", "descriptor_read", relativePath, {
        bytes_observed: state.bytes_read,
      });
    }
    const digest = sha256(bytes, state);
    state.file_digests[sha256(relativePath, state)] = digest;
    return bytes;
  } catch (error) {
    pendingFailure = error;
    throw error;
  } finally {
    if (descriptor !== undefined) {
      try {
        providerCall(state, "close", relativePath, () => provider.close(descriptor));
        state.descriptors_closed += 1;
      } catch (closeError) {
        if (!pendingFailure) throw closeError;
        throw closeError;
      }
    }
  }
}

function parseObject(bytes, path) {
  let value;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch {
    contractFail("tampered", "certification_json_malformed", "descriptor_read", path);
  }
  if (!isPlainObject(value)) {
    contractFail("incompatible", "certification_json_root_invalid", "descriptor_read", path);
  }
  validateJsonBudget(value);
  return value;
}

function without(value, field) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== field));
}

function preloadCertification(root, provider, state) {
  const rootMetadata = validateRoot(root, provider, state);
  const cache = new Map();
  const secureRead = (path) => {
    if (!cache.has(path)) cache.set(path, readDescriptorBound(root, rootMetadata, path, provider, state));
    return cache.get(path);
  };
  for (const path of FIXED_PATHS) secureRead(path);
  const manifest = parseObject(cache.get(CERTIFICATION_PATHS.freeze_manifest), CERTIFICATION_PATHS.freeze_manifest);
  if (
    manifest.manifest_digest !== CERTIFICATION_AUTHORITIES.final_freeze_manifest_digest ||
    digestJson(without(manifest, "manifest_digest"), state) !== CERTIFICATION_AUTHORITIES.final_freeze_manifest_digest
  ) contractFail("tampered", "final_freeze_authority_mismatch", "descriptor_identity", CERTIFICATION_PATHS.freeze_manifest);
  if (!Array.isArray(manifest.evidence_files) || manifest.evidence_files.length !== 28) {
    contractFail("incomplete", "freeze_evidence_inventory_incomplete", "descriptor_identity", CERTIFICATION_PATHS.freeze_manifest);
  }
  if (!Array.isArray(manifest.predecessor_aggregates) || manifest.predecessor_aggregates.length !== 6) {
    contractFail("incomplete", "predecessor_aggregate_inventory_incomplete", "descriptor_identity", CERTIFICATION_PATHS.freeze_manifest);
  }
  const evidencePaths = manifest.evidence_files.map((entry) => validateRelativePath(entry.path));
  if (new Set(evidencePaths).size !== 28) {
    contractFail("tampered", "freeze_evidence_inventory_duplicate", "descriptor_identity", CERTIFICATION_PATHS.freeze_manifest);
  }
  for (const path of evidencePaths) secureRead(path);
  for (const entry of manifest.predecessor_aggregates) secureRead(validateRelativePath(entry.path));
  for (const path of evidencePaths) {
    const file = parseObject(cache.get(path), path);
    const identity = file.record?.evidence?.runner_identity;
    if (!isPlainObject(identity)) contractFail("incompatible", "runner_identity_invalid", "descriptor_identity", path);
    secureRead(validateRelativePath(identity.runner_module_path));
    secureRead(validateRelativePath(identity.authority_module_path));
  }
  return cache;
}

function virtualBoundary(root, cache) {
  const directories = new Set([root]);
  for (const path of cache.keys()) {
    const parts = path.split("/");
    for (let index = 1; index < parts.length; index += 1) {
      directories.add(resolve(root, ...parts.slice(0, index)));
    }
  }
  const memoryRead = (path) => {
    const relativePath = relative(root, path).split("\\").join("/");
    if (!cache.has(relativePath)) {
      const error = new Error("virtual_file_missing");
      error.code = "ENOENT";
      throw error;
    }
    return Buffer.from(cache.get(relativePath));
  };
  return Object.freeze({
    lstat(path) {
      const relativePath = relative(root, path).split("\\").join("/");
      const file = cache.has(relativePath);
      return Object.freeze({
        isDirectory: () => directories.has(path),
        isFile: () => file,
        isSymbolicLink: () => false,
      });
    },
    ["read" + "File"]: memoryRead,
    realpath: (path) => path,
  });
}

function failureIdentity(failure, state) {
  const pathDigest = failure.path === null ? null : sha256(failure.path, state);
  const boundedMetadata = {
    bytes_observed: Number.isInteger(failure.metadata?.bytes_observed)
      ? Math.min(failure.metadata.bytes_observed, CONSUMER_V2_BUDGETS.max_bytes + 1)
      : null,
    identity_phase: sanitizeToken(failure.metadata?.identity_phase, "none"),
    max_file_bytes: Number.isInteger(failure.metadata?.max_file_bytes)
      ? failure.metadata.max_file_bytes
      : CONSUMER_V2_BUDGETS.max_file_bytes,
  };
  const projection = {
    consumer_version: CONSUMER_V2_VERSION,
    metadata: boundedMetadata,
    provider_error_class: sanitizeToken(failure.errorClass, "ProviderError"),
    provider_error_code: sanitizeToken(failure.code, "UNKNOWN_PROVIDER_ERROR"),
    provider_stage: PROVIDER_STAGES_V2.includes(failure.stage)
      ? failure.stage
      : "descriptor_identity",
    reason: sanitizeToken(failure.reason, "contract_rejection"),
    relative_path_digest: pathDigest,
    status: RESULT_STATUSES.includes(failure.status) ? failure.status : "incomplete",
  };
  return deepFreeze({
    ...projection,
    failure_identity_digest: digestJson(projection, state),
  });
}

function counts(state) {
  return {
    bytes_read: state.bytes_read,
    descriptors_closed: state.descriptors_closed,
    descriptors_opened: state.descriptors_opened,
    digests_computed: state.digests_computed,
    file_reads: state.file_reads,
    metadata_reads: state.metadata_reads,
    provider_calls: { ...state.provider_calls },
  };
}

function successResult(state, semanticResult) {
  return deepFreeze({
    consumer_version: CONSUMER_V2_VERSION,
    counts: counts(state),
    failure_provenance: null,
    observed_file_digests: { ...state.file_digests },
    reason: "certification_chain_verified",
    semantic_result: semanticResult,
    status: "certified",
  });
}

function failureResult(state, error) {
  const failure = error instanceof V2Failure
    ? error
    : new V2Failure({ reason: "provider_descriptor_identity_failed", stage: "descriptor_identity", status: "incomplete" });
  const provenance = failureIdentity(failure, state);
  return deepFreeze({
    consumer_version: CONSUMER_V2_VERSION,
    counts: counts(state),
    failure_provenance: provenance,
    observed_file_digests: { ...state.file_digests },
    reason: failure.reason,
    semantic_result: null,
    status: failure.status,
  });
}

const OFF_RESULT = deepFreeze({
  consumer_version: CONSUMER_V2_VERSION,
  counts: counts(createState()),
  failure_provenance: null,
  observed_file_digests: {},
  reason: "consumer_disabled",
  semantic_result: null,
  status: "incomplete",
});

function validateProvider(provider) {
  assertClosed(provider, PROVIDER_FIELDS, "descriptor_provider_invalid");
  for (const field of ["close", "fstat", "lstat", "open", "read", "realpath"]) {
    if (typeof provider[field] !== "function") contractFail("incompatible", "descriptor_provider_invalid");
  }
  return provider;
}

export function createRuntimeCertificationConsumerV2(provider = DEFAULT_PROVIDER) {
  validateProvider(provider);
  return function consumeRuntimeCertificationV2(request = {}) {
    if (request.enabled !== true) return OFF_RESULT;
    const state = createState();
    try {
      assertClosed(request, REQUEST_FIELDS, "consumer_request_invalid");
      const cache = preloadCertification(request.repository_root, provider, state);
      const semanticConsumer = createRuntimeCertificationConsumerV1(
        virtualBoundary(request.repository_root, cache),
      );
      const semanticResult = semanticConsumer({
        enabled: true,
        repository_root: request.repository_root,
      });
      if (semanticResult.status !== "certified") {
        contractFail("tampered", "semantic_predecessor_rejected", "descriptor_identity", null, {
          identity_phase: "semantic_predecessor",
        });
      }
      return successResult(state, semanticResult);
    } catch (error) {
      return failureResult(state, error);
    }
  };
}

export function probeDescriptorBoundReadV2({ provider, relative_path, repository_root }) {
  const state = createState();
  try {
    validateProvider(provider);
    const rootMetadata = validateRoot(repository_root, provider, state);
    const bytes = readDescriptorBound(
      repository_root,
      rootMetadata,
      relative_path,
      provider,
      state,
    );
    return deepFreeze({
      byte_length: bytes.length,
      content_digest: sha256(bytes),
      counts: counts(state),
      failure_provenance: null,
      reason: "descriptor_read_verified",
      status: "certified",
    });
  } catch (error) {
    return failureResult(state, error);
  }
}

export const consumeRuntimeCertificationV2 =
  createRuntimeCertificationConsumerV2();
