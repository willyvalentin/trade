import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

// Untrusted JSON is deliberately dynamic here; every ingress is constrained by
// deepPlainData plus the closed structural-schema evaluator before use.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dynamic = any;
const assetRoot = new URL("../../docs/evidence/action-652-current-catalog-migration-contract-v5/", import.meta.url);
const assetUrl = (name: string) => new URL(name, assetRoot);
const sha256 = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
const identities = JSON.parse(readFileSync(assetUrl("registry-identities.json"), "utf8"));
const EXPECTED_PRODUCTION_REGISTRY_SHA256 = "9ca9dcbc53e5ac1c4dc3ccf825168104278c82a202c90f6b93da801a5fd1ec10";
const EXPECTED_CATALOG_SCHEMA_SHA256 = "15acbd74bcbcc940d519d50df6f5ef819f988f76f114e897a0735e9a62f717c5";
const EXPECTED_MIGRATION_SCHEMA_SHA256 = "382a06f40dff33abd705426c74a1864a9a897bf6e35c80a2ce71d28a963bc8bc";
const catalogSchemaBytes = readFileSync(assetUrl("catalog-structural-schema-v5.json"));
const migrationSchemaBytes = readFileSync(assetUrl("migration-structural-schema-v5.json"));
if (sha256(catalogSchemaBytes) !== EXPECTED_CATALOG_SCHEMA_SHA256 || sha256(migrationSchemaBytes) !== EXPECTED_MIGRATION_SCHEMA_SHA256) throw new Error("invalid_structural_schema_identity");
const catalogSchema = JSON.parse(catalogSchemaBytes.toString("utf8"));
const migrationSchema = JSON.parse(migrationSchemaBytes.toString("utf8"));
const VERSION = /^[0-9]{14}$/;

function isWellFormedString(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) return false;
  }
  return true;
}
function ownData(value: Dynamic, key: PropertyKey): Dynamic {
  try { const descriptor = Object.getOwnPropertyDescriptor(value, key); return descriptor && descriptor.enumerable && Object.hasOwn(descriptor, "value") ? { ok: true, value: descriptor.value } : { ok: false }; }
  catch { return { ok: false }; }
}
function deepPlainData(value: Dynamic, seen = new WeakSet<object>()): boolean {
  if (value === null || typeof value === "boolean") return true;
  if (typeof value === "string") return isWellFormedString(value);
  if (typeof value === "number") return Number.isSafeInteger(value);
  if (typeof value !== "object" || seen.has(value)) return false;
  seen.add(value);
  let prototype; let keys;
  try { prototype = Object.getPrototypeOf(value); keys = Reflect.ownKeys(value); } catch { return false; }
  if (prototype !== (Array.isArray(value) ? Array.prototype : Object.prototype) || keys.some((key) => typeof key !== "string")) return false;
  const stringKeys = keys as string[];
  if (Array.isArray(value)) {
    const entries = stringKeys.filter((key) => key !== "length");
    if (entries.length !== value.length || !entries.every((key, index) => key === String(index))) return false;
  }
  for (const key of stringKeys) {
    if (Array.isArray(value) && key === "length") continue;
    if (!isWellFormedString(key)) return false;
    const data = ownData(value, key);
    if (!data.ok || !deepPlainData(data.value, seen)) return false;
  }
  return true;
}
function deepFreeze(value: Dynamic, seen = new WeakSet<object>()): Dynamic {
  if (value === null || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const key of Reflect.ownKeys(value)) deepFreeze(value[key], seen);
  return Object.freeze(value);
}
function deeplyFrozen(value: Dynamic, seen = new WeakSet<object>()): boolean {
  if (value === null || typeof value !== "object" || seen.has(value)) return true;
  seen.add(value);
  return Object.isFrozen(value) && Reflect.ownKeys(value).every((key) => deeplyFrozen(value[key], seen));
}
function utf8Compare(left: string, right: string): number {
  if (typeof left !== "string" || typeof right !== "string" || !isWellFormedString(left) || !isWellFormedString(right)) throw new TypeError("invalid_string");
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}
function canonicalJson(value: Dynamic, seen = new WeakSet<object>()): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string" && isWellFormedString(value)) return JSON.stringify(value);
  if (typeof value === "number" && Number.isSafeInteger(value)) return String(value);
  if (typeof value !== "object" || seen.has(value)) throw new TypeError("noncanonical");
  seen.add(value);
  if (Array.isArray(value)) {
    if (Object.getPrototypeOf(value) !== Array.prototype) throw new TypeError("noncanonical_array");
    const encoded: string[] = value.map((entry: Dynamic) => canonicalJson(entry, seen));
    seen.delete(value);
    return `[${encoded.join(",")}]`;
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError("noncanonical_record");
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== "string" || !isWellFormedString(key))) throw new TypeError("noncanonical_key");
  const stringKeys = (keys as string[]).sort(utf8Compare);
  const encoded: string[] = stringKeys.map((key) => { const data = ownData(value, key); if (!data.ok) throw new TypeError("non_data"); return `${JSON.stringify(key)}:${canonicalJson(data.value, seen)}`; });
  seen.delete(value);
  return `{${encoded.join(",")}}`;
}
function compareTyped(left: Dynamic, right: Dynamic, type: string): number {
  if (type === "safe_integer") {
    if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right)) throw new TypeError("invalid_integer");
    return left < right ? -1 : left > right ? 1 : 0;
  }
  if (type === "utf8_string") return utf8Compare(left, right);
  throw new TypeError("unknown_type");
}
function sortedUnique(items: Dynamic[], fields: Array<{ name: string; type: string }>): boolean {
  try {
    return Array.isArray(items) && items.every((item, index) => {
      if (index === 0) return true;
      for (const field of fields) {
        const left = ownData(items[index - 1], field.name); const right = ownData(item, field.name);
        if (!left.ok || !right.ok) return false;
        const comparison = compareTyped(left.value, right.value, field.type);
        if (comparison !== 0) return comparison < 0;
      }
      return false;
    });
  } catch { return false; }
}
function receiptWithoutId(receipt: Dynamic, shape: string[], idName: string): Dynamic {
  return Object.fromEntries(shape.filter((name: string) => name !== idName).map((name: string) => [name, receipt[name]]));
}
function deriveReceiptId(receipt: Dynamic, shape: string[], idName = "receipt_id"): string { return sha256(Buffer.from(canonicalJson(receiptWithoutId(receipt, shape, idName)), "utf8")); }

function sameJsonValue(left: Dynamic, right: Dynamic): boolean {
  try { return canonicalJson(left) === canonicalJson(right); } catch { return false; }
}
function validateStructuralSchema(value: Dynamic, schema: Dynamic): boolean {
  try {
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) return false;
    if (Array.isArray(schema.anyOf) && !schema.anyOf.some((candidate: Dynamic) => validateStructuralSchema(value, candidate))) return false;
    if (Object.hasOwn(schema, "const") && !sameJsonValue(value, schema.const)) return false;
    if (Array.isArray(schema.enum) && !schema.enum.some((candidate: Dynamic) => sameJsonValue(value, candidate))) return false;
    if (schema.type === "null" && value !== null) return false;
    if (schema.type === "boolean" && typeof value !== "boolean") return false;
    if (schema.type === "string") {
      if (typeof value !== "string" || !isWellFormedString(value)) return false;
      if (Number.isSafeInteger(schema.minLength) && value.length < schema.minLength) return false;
      if (typeof schema.pattern === "string" && !(new RegExp(schema.pattern, "u")).test(value)) return false;
    }
    if (schema.type === "integer") {
      if (!Number.isSafeInteger(value)) return false;
      if (Number.isSafeInteger(schema.minimum) && value < schema.minimum) return false;
    }
    if (schema.type === "array") {
      if (!Array.isArray(value)) return false;
      if (Number.isSafeInteger(schema.minItems) && value.length < schema.minItems) return false;
      if (Number.isSafeInteger(schema.maxItems) && value.length > schema.maxItems) return false;
      if (schema.uniqueItems === true && new Set(value.map((entry) => canonicalJson(entry))).size !== value.length) return false;
      if (schema.items && !value.every((entry: Dynamic) => validateStructuralSchema(entry, schema.items))) return false;
    }
    if (schema.type === "object") {
      if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) return false;
      const keys = Reflect.ownKeys(value);
      if (keys.some((key) => typeof key !== "string")) return false;
      if (Array.isArray(schema.required) && !schema.required.every((key: string) => Object.hasOwn(value, key))) return false;
      const properties = schema.properties && typeof schema.properties === "object" ? schema.properties : {};
      if (schema.additionalProperties === false && keys.some((key) => !Object.hasOwn(properties, key))) return false;
      for (const key of keys) if (Object.hasOwn(properties, key) && !validateStructuralSchema(value[key], properties[key])) return false;
    }
    return true;
  } catch { return false; }
}

function makeValidator(registryBytes: Buffer, expectedDigest: string, authority: boolean): Dynamic {
  const digestValid = Buffer.isBuffer(registryBytes) && sha256(registryBytes) === expectedDigest;
  const parsed = digestValid ? JSON.parse(registryBytes.toString("utf8")) : null;
  if (!digestValid || !deepPlainData(parsed)) throw new Error("invalid_registry_identity");
  const runtimeRegistry = deepFreeze(structuredClone(parsed));
  const structuralCatalog = (value: Dynamic) => validateStructuralSchema(value, catalogSchema);
  const structuralMigration = (value: Dynamic) => validateStructuralSchema(value, migrationSchema);
  const receiptShape: string[] = runtimeRegistry.migration.receipt_shape;
  const batchShape: string[] = runtimeRegistry.migration.batch_receipt_shape;
  const rowReceiptProtocol = runtimeRegistry.migration.row_receipt_protocol;
  const batchReceiptProtocol = runtimeRegistry.migration.batch_receipt_protocol;
  const authorizedReceipts = new Map<string, Dynamic>(runtimeRegistry.migration.authorized_provider_receipts.map((receipt: Dynamic) => [receipt.receipt_id, receipt]));
  const authorizedBatches = new Map<string, Dynamic>(runtimeRegistry.migration.authorized_provider_batches.map((batch: Dynamic) => [batch.batch_receipt_id, batch]));
  const schemaRowProtocol = migrationSchema.properties.receipt_bindings.items.properties.protocol.const;
  const schemaBatchProtocol = migrationSchema.properties.provider_batch_binding.anyOf[1].properties.protocol.const;
  if (
    typeof rowReceiptProtocol !== "string" || typeof batchReceiptProtocol !== "string" ||
    Object.hasOwn(runtimeRegistry.migration, "provider_receipt_protocol") ||
    schemaRowProtocol !== rowReceiptProtocol || schemaBatchProtocol !== batchReceiptProtocol ||
    runtimeRegistry.migration.authorized_provider_receipts.some((receipt: Dynamic) => receipt.protocol !== rowReceiptProtocol) ||
    runtimeRegistry.migration.authorized_provider_batches.some((receipt: Dynamic) => receipt.protocol !== batchReceiptProtocol)
  ) throw new Error("invalid_registry_protocol_authority");

  function manifestSha256() {
    const descriptor = {
      dimension_order: runtimeRegistry.catalog.dimension_order,
      identity_fields: runtimeRegistry.catalog.identity_fields,
      canonical_serialization: runtimeRegistry.catalog.canonical_serialization,
      dimension_frame: runtimeRegistry.catalog.dimension_frame,
      aggregate_frame: runtimeRegistry.catalog.aggregate_frame
    };
    return sha256(Buffer.from(`${canonicalJson(descriptor)}\n`, "utf8"));
  }
  function computeBinding(catalog: Dynamic): Dynamic {
    try {
      if (!deepPlainData(catalog)) return { ok: false };
      const dimensions: Record<string, { sha256: string; row_count: number }> = {}; const aggregate: string[] = [];
      for (const name of runtimeRegistry.catalog.dimension_order) {
        const rows = catalog[name];
        const dimensionSha256 = sha256(Buffer.from(`${name}\n${canonicalJson(rows)}\n`, "utf8"));
        dimensions[name] = { sha256: dimensionSha256, row_count: rows.length };
        aggregate.push(`${name}:${dimensionSha256}\n`);
      }
      return { ok: true, manifest_sha256: manifestSha256(), dimensions, aggregate_sha256: sha256(Buffer.from(aggregate.join(""), "utf8")) };
    } catch { return { ok: false }; }
  }
  function validateCatalog(value: Dynamic): boolean {
    try {
      if (!deepPlainData(value) || !structuralCatalog(value)) return false;
      if (canonicalJson(value.generator_binding.schema_set) !== canonicalJson(runtimeRegistry.catalog.schema_set)) return false;
      if (canonicalJson(value.catalog.schemas.map((entry: Dynamic) => entry.schema_name)) !== canonicalJson(runtimeRegistry.catalog.schema_set)) return false;
      if (!value.catalog.tables.length || !value.catalog.columns.length) return false;
      for (const name of runtimeRegistry.catalog.dimension_order) if (value.counts[name] !== value.catalog[name].length || !sortedUnique(value.catalog[name], runtimeRegistry.catalog.identity_fields[name])) return false;
      const schemas = new Set(value.catalog.schemas.map((entry: Dynamic) => entry.schema_name));
      const tables = new Set(value.catalog.tables.map((entry: Dynamic) => `${entry.table_schema}.${entry.table_name}`));
      const columns = new Set(value.catalog.columns.map((entry: Dynamic) => `${entry.table_schema}.${entry.table_name}.${entry.column_name}`));
      if (!value.catalog.tables.every((entry: Dynamic) => schemas.has(entry.table_schema)) || !value.catalog.views.every((entry: Dynamic) => schemas.has(entry.view_schema)) || !value.catalog.columns.every((entry: Dynamic) => tables.has(`${entry.table_schema}.${entry.table_name}`))) return false;
      if (!value.catalog.primary_keys.every((entry: Dynamic) => tables.has(`${entry.table_schema}.${entry.table_name}`) && entry.columns.every((column: string) => columns.has(`${entry.table_schema}.${entry.table_name}.${column}`)))) return false;
      if (!value.catalog.foreign_keys.every((entry: Dynamic) => entry.source_columns.length === entry.target_columns.length && tables.has(`${entry.source_schema}.${entry.source_table}`) && tables.has(`${entry.target_schema}.${entry.target_table}`) && entry.source_columns.every((column: string) => columns.has(`${entry.source_schema}.${entry.source_table}.${column}`)) && entry.target_columns.every((column: string) => columns.has(`${entry.target_schema}.${entry.target_table}.${column}`)))) return false;
      if (!value.catalog.functions.every((entry: Dynamic) => schemas.has(entry.function_schema)) || !value.catalog.enums.every((entry: Dynamic) => schemas.has(entry.enum_schema))) return false;
      if (!value.catalog.composites.every((entry: Dynamic) => schemas.has(entry.type_schema) && sortedUnique(entry.attributes, [{ name: "ordinal_position", type: "safe_integer" }, { name: "attribute_name", type: "utf8_string" }]))) return false;
      const binding = computeBinding(value.catalog);
      if (!binding.ok || value.result_binding.manifest_sha256 !== binding.manifest_sha256 || value.result_binding.aggregate_sha256 !== binding.aggregate_sha256) return false;
      return runtimeRegistry.catalog.dimension_order.every((name: string, index: number) => { const row = value.result_binding.ordered_results[index]; return row.result_id === name && row.sha256 === binding.dimensions[name].sha256 && row.row_count === binding.dimensions[name].row_count; });
    } catch { return false; }
  }
  function validateMigration(value: Dynamic): boolean {
    try {
      if (!deepPlainData(value) || !structuralMigration(value)) return false;
      const source = value.source_inventory.entries; const provider = value.provider_history; const bindings = value.receipt_bindings;
      if (source.length !== 36 || value.source_inventory.entry_count !== 36 || value.completeness.provider_entry_count !== provider.length) return false;
      if (!sortedUnique(source, [{ name: "version", type: "utf8_string" }]) || !sortedUnique(provider, [{ name: "result_ordinal", type: "safe_integer" }]) || !sortedUnique(bindings, [{ name: "receipt_id", type: "utf8_string" }])) return false;
      if (!source.every((entry: Dynamic) => VERSION.test(entry.version) && entry.path === `supabase/migrations/${entry.version}_${entry.name}.sql`)) return false;
      const ids = new Set(); const versions = new Set(); const ordinals = new Set();
      for (const receipt of bindings as Dynamic[]) {
        if (receipt.protocol !== rowReceiptProtocol || receiptShape.some((name) => !Object.hasOwn(receipt, name)) || Reflect.ownKeys(receipt).length !== receiptShape.length || deriveReceiptId(receipt, receiptShape) !== receipt.receipt_id) return false;
        const authorized = authorizedReceipts.get(receipt.receipt_id);
        if (!authorized || canonicalJson(authorized) !== canonicalJson(receipt) || ids.has(receipt.receipt_id) || versions.has(receipt.version) || ordinals.has(receipt.result_ordinal)) return false;
        ids.add(receipt.receipt_id); versions.add(receipt.version); ordinals.add(receipt.result_ordinal);
      }
      const bindingMap = new Map<string, Dynamic>(bindings.map((receipt: Dynamic) => [receipt.receipt_id, receipt]));
      const referenced = new Set();
      for (const entry of provider as Dynamic[]) {
        if (entry.receipt_id === null) continue;
        const receipt = bindingMap.get(entry.receipt_id);
        if (!receipt || receipt.result_ordinal !== entry.result_ordinal || referenced.has(entry.receipt_id)) return false;
        referenced.add(entry.receipt_id);
      }
      if (referenced.size !== bindings.length) return false;
      const batch = value.provider_batch_binding;
      if (batch === null) return bindings.length === 0 && provider.every((entry: Dynamic) => entry.receipt_id === null);
      if (batch.protocol !== batchReceiptProtocol || batchShape.some((name) => !Object.hasOwn(batch, name)) || Reflect.ownKeys(batch).length !== batchShape.length || deriveReceiptId(batch, batchShape, "batch_receipt_id") !== batch.batch_receipt_id) return false;
      const authorizedBatch = authorizedBatches.get(batch.batch_receipt_id);
      if (!authorizedBatch || canonicalJson(authorizedBatch) !== canonicalJson(batch) || !batch.complete || batch.truncated) return false;
      if (provider.some((entry: Dynamic) => entry.receipt_id === null) || batch.row_count !== provider.length) return false;
      const orderedIds: string[] = provider.map((entry: Dynamic) => entry.receipt_id);
      if (canonicalJson(batch.ordered_receipt_ids) !== canonicalJson(orderedIds)) return false;
      const aggregate = sha256(Buffer.from(orderedIds.map((id: string) => `${id}\n`).join(""), "utf8"));
      if (batch.ordered_receipts_aggregate_sha256 !== aggregate) return false;
      return new Set(orderedIds).size === bindings.length && orderedIds.every((id: string) => bindingMap.has(id));
    } catch { return false; }
  }
  function reconcile(value: Dynamic): Dynamic {
    if (!validateMigration(value)) return { ok: false, reason: "invalid_evidence" };
    if (value.provider_batch_binding === null) {
      return { ok: true, reconciliation_state: "unknown_provider_history", unknown_provider_ordinals: value.provider_history.filter((entry: Dynamic) => entry.receipt_id === null).map((entry: Dynamic) => entry.result_ordinal), classifications: Object.fromEntries(runtimeRegistry.migration.classification_precedence.map((name: string) => [name, []])), byte_parity: "unknown_without_trustworthy_provider_hashes" };
    }
    const source = new Map<string, Dynamic>(value.source_inventory.entries.map((entry: Dynamic) => [entry.version, entry]));
    const bindingMap = new Map<string, Dynamic>(value.receipt_bindings.map((receipt: Dynamic) => [receipt.receipt_id, receipt]));
    const providerFacts = value.provider_history.map((entry: Dynamic) => bindingMap.get(entry.receipt_id));
    const provider = new Map<string, Dynamic>(providerFacts.map((receipt: Dynamic) => [receipt.version, receipt]));
    const classes = Object.fromEntries(runtimeRegistry.migration.classification_precedence.map((name: string) => [name, []]));
    const versions: string[] = [...new Set<string>([...source.keys(), ...provider.keys()])].sort(utf8Compare);
    for (const version of versions) {
      const local = source.get(version); const remote = provider.get(version);
      if (!remote) classes.source_only.push(version);
      else if (!local) classes.production_only.push(version);
      else if (local.name !== remote.name) classes.name_divergent.push(version);
      else if (local.statement_count !== remote.statement_count) classes.statement_count_divergent.push(version);
      else if (local.sha256 !== remote.source_sql_sha256) classes.source_hash_divergent.push(version);
      else classes.matched.push(version);
    }
    const byte_parity = classes.source_only.length || classes.production_only.length ? "unknown_version_sets_divergent" : classes.source_hash_divergent.length ? "divergent_from_trustworthy_provider_hashes" : "verified_from_trustworthy_provider_hashes";
    return { ok: true, reconciliation_state: "reconciled", unknown_provider_ordinals: [], classifications: classes, byte_parity };
  }
  function validateState(machine: Dynamic): boolean { try { return deepPlainData(machine) && JSON.stringify(machine) === JSON.stringify(runtimeRegistry.state_machine); } catch { return false; } }
  function snapshot(): Dynamic { return deepFreeze({ authority: false, role: "non_authority_snapshot", registry: structuredClone(runtimeRegistry) }); }
  return Object.freeze({ authority, registry_digest: expectedDigest, runtime_deep_frozen: deeplyFrozen(runtimeRegistry), computeCatalogBinding: computeBinding, deriveMigrationReconciliation: reconcile, getRegistrySnapshot: snapshot, validateCatalogEvidence: validateCatalog, validateExactStateMachine: validateState, validateMigrationEvidence: validateMigration });
}

if (identities.production.sha256 !== EXPECTED_PRODUCTION_REGISTRY_SHA256 || identities.production.authority !== true) throw new Error("production_identity_manifest_mismatch");
const productionBytes = readFileSync(assetUrl(identities.production.path));
const production = makeValidator(productionBytes, EXPECTED_PRODUCTION_REGISTRY_SHA256, true);

export const computeCatalogBinding = production.computeCatalogBinding;
export const deriveMigrationReconciliation = production.deriveMigrationReconciliation;
export const getRegistrySnapshot = production.getRegistrySnapshot;
export const validateCatalogEvidence = production.validateCatalogEvidence;
export const validateExactStateMachine = production.validateExactStateMachine;
export const validateMigrationEvidence = production.validateMigrationEvidence;
export const productionRegistryDigest = production.registry_digest;
export const productionRuntimeDeepFrozen = production.runtime_deep_frozen;
export function validateProductionRegistryBytes(bytes: Buffer): boolean { try { return Buffer.isBuffer(bytes) && bytes.equals(productionBytes) && sha256(bytes) === EXPECTED_PRODUCTION_REGISTRY_SHA256; } catch { return false; } }
export function createSyntheticNonAuthorityValidator(registryBytes: Buffer, expectedDigest: string): Dynamic {
  const validator = makeValidator(registryBytes, expectedDigest, false);
  if (validator.getRegistrySnapshot().registry.authority_scope !== "synthetic_test_non_authority") throw new Error("not_synthetic_registry");
  return validator;
}
