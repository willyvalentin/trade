// Provider-free V2 evidence oracle. It never contacts Supabase.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const root = new URL("../../", import.meta.url);
const receiptPath =
  "docs/evidence/action-660-ma09-generated-types-provenance-v2/catalog-receipt-v2.json";
const provenancePath =
  "docs/evidence/action-660-ma09-generated-types-provenance-v2/provenance-contract-v2.json";
const linkedAttestationPath =
  "docs/evidence/action-660-ma09-generated-types-provenance-v2/linked-project-attestation-v2.json";
const receipt = JSON.parse(readFileSync(new URL(receiptPath, root), "utf8"));
const provenance = JSON.parse(readFileSync(new URL(provenancePath, root), "utf8"));
const linkedAttestation = JSON.parse(readFileSync(new URL(linkedAttestationPath, root), "utf8"));

const EXPECTED_COUNTS = {
  schemas: 1,
  tables: 30,
  views: 0,
  columns: 653,
  primary_keys: 30,
  foreign_keys: 28,
  functions: 22,
  enums: 0,
  composites: 0,
};
const DIMENSION_ORDER = Object.keys(EXPECTED_COUNTS);
const IDENTITY_FIELDS = {
  schemas: [{ name: "schema_name", type: "utf8_string" }],
  tables: [{ name: "table_schema", type: "utf8_string" }, { name: "table_name", type: "utf8_string" }],
  views: [{ name: "view_schema", type: "utf8_string" }, { name: "view_name", type: "utf8_string" }],
  columns: [{ name: "table_schema", type: "utf8_string" }, { name: "table_name", type: "utf8_string" }, { name: "ordinal_position", type: "safe_integer" }, { name: "column_name", type: "utf8_string" }],
  primary_keys: [{ name: "table_schema", type: "utf8_string" }, { name: "table_name", type: "utf8_string" }, { name: "constraint_name", type: "utf8_string" }],
  foreign_keys: [{ name: "source_schema", type: "utf8_string" }, { name: "source_table", type: "utf8_string" }, { name: "constraint_name", type: "utf8_string" }],
  functions: [{ name: "function_schema", type: "utf8_string" }, { name: "function_name", type: "utf8_string" }, { name: "identity_arguments", type: "utf8_string" }],
  enums: [{ name: "enum_schema", type: "utf8_string" }, { name: "enum_name", type: "utf8_string" }],
  composites: [{ name: "type_schema", type: "utf8_string" }, { name: "type_name", type: "utf8_string" }],
};
const ROW_KEYS = {
  schemas: ["schema_name"],
  tables: ["table_schema", "table_name"],
  views: ["view_schema", "view_name", "security_invoker"],
  columns: ["table_schema", "table_name", "column_name", "ordinal_position", "data_type", "udt_schema", "udt_name", "is_nullable", "has_default", "is_identity", "is_generated"],
  primary_keys: ["table_schema", "table_name", "constraint_name", "columns"],
  foreign_keys: ["source_schema", "source_table", "constraint_name", "source_columns", "target_schema", "target_table", "target_columns"],
  functions: ["function_schema", "function_name", "identity_arguments", "return_type"],
  enums: ["enum_schema", "enum_name", "labels"],
  composites: ["type_schema", "type_name", "attributes"],
};
const EXPECTED_SOURCES = new Map([
  [receiptPath, "7fe0c253404fea6c175ae36fad3fd16699b3acdf06351c6929c694e54d75f530"],
  ["scripts/action-660-ma09-read-only-catalog.sql", "97a2b28d495799500a72e9d19b1c127a1f9ef46a084c1c465ef546570e9616fb"],
  [linkedAttestationPath, "97ba08912db8b3965c85f03ca33dbeae6642e4a2b4eaba5a43775e02d75c805c"],
  ["supabase/migrations/20260811163228_add_fail_closed_application_owner_foundation.sql", "fd8330d8156d454a79721126f1cc054d07e893452e70a7a9616cdf72ec5219f7"],
  ["lib/supabase-database.types.ts", "f23c3702ffd931cb5d81f13e19a8515125817717e9a3fad7ac85e40795729029"],
  ["docs/evidence/action-660c-ma05-ma06-ma08-verified-closure.json", "b8b73562773c064dc1398d30cbbcc54afcb716aa9bedb756c92dc335397e9ddf"],
]);
const OWNER_TABLES = [
  "position_updates",
  "positions",
  "recommendation_batches",
  "recommendation_outcomes",
  "recommendation_scan_runs",
  "recommendation_snapshots",
  "recommendations",
  "user_settings",
];
const COMMAND =
  "supabase gen types typescript --project-id ekdyopdrrkphlrsilyoo --schema public > lib/supabase-database.types.ts";
const RECEIPT_SHA256 = "7fe0c253404fea6c175ae36fad3fd16699b3acdf06351c6929c694e54d75f530";
const OUTPUT_SHA256 = "f23c3702ffd931cb5d81f13e19a8515125817717e9a3fad7ac85e40795729029";
const HISTORICAL_OUTPUT_SHA256 = "5a74e8de579628387d90e414fb434a80d8481fcd53526310e9b3a8e3754d8a6c";
const EXPECTED_CLOSURE_CONDITIONS = [
  "independent_review_no_findings",
  "stacked_base_pr_95_merged_first",
  "exact_scope_merge",
  "manifest_receipt_and_output_main_reachable",
  "exact_main_ci_success",
];
const REQUIRED_SYMBOLS = [
  "export type Database",
  "owner_user_id",
  "app_open_owned_position_transaction",
  "p_owner_user_id",
  "execution_record_audit_events",
  "execution_records",
];
const SCOPE_KEYS = [
  "database_mutation",
  "migration_application",
  "rls_behavior_proof",
  "tenant_owner_binding_proof",
  "release_identity_proof",
  "production_smoke_proof",
  "runtime_authority",
  "broker_or_execution_authority",
];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const gitBlobSha1 = (value) => createHash("sha1")
  .update(Buffer.from(`blob ${value.length}\0`, "utf8"))
  .update(value)
  .digest("hex");
const clone = (value) => structuredClone(value);
const readRepoFile = (path) => readFileSync(new URL(path, root));
const exactKeys = (value, expected) => value !== null && typeof value === "object" &&
  !Array.isArray(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());
const utf8Compare = (left, right) => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
function canonicalJson(value) {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number" && Number.isSafeInteger(value)) return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return `{${Object.keys(value).sort(utf8Compare).map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  throw new TypeError("noncanonical_value");
}
function compareTyped(left, right, type) {
  if (type === "safe_integer") return left < right ? -1 : left > right ? 1 : 0;
  if (type === "utf8_string") return utf8Compare(left, right);
  throw new TypeError("unknown_identity_type");
}
function sortedUnique(rows, fields) {
  return rows.every((row, index) => {
    if (index === 0) return true;
    for (const field of fields) {
      const comparison = compareTyped(rows[index - 1][field.name], row[field.name], field.type);
      if (comparison !== 0) return comparison < 0;
    }
    return false;
  });
}
function catalogBinding(candidate) {
  const descriptor = {
    dimension_order: DIMENSION_ORDER,
    identity_fields: IDENTITY_FIELDS,
    canonical_serialization: "utf8-canonical-json-v1",
    dimension_frame: "dimension_name || 0x0a || canonical_json(rows) || 0x0a",
    aggregate_frame: "ordered concat(dimension_name || ':' || dimension_sha256 || 0x0a)",
  };
  const ordered = DIMENSION_ORDER.map((name) => ({
    result_id: name,
    sha256: sha256(Buffer.from(`${name}\n${canonicalJson(candidate.catalog[name])}\n`, "utf8")),
    row_count: candidate.catalog[name].length,
  }));
  return {
    manifest_sha256: sha256(Buffer.from(`${canonicalJson(descriptor)}\n`, "utf8")),
    ordered_results: ordered,
    aggregate_sha256: sha256(Buffer.from(ordered.map((entry) => `${entry.result_id}:${entry.sha256}\n`).join(""), "utf8")),
  };
}

function validateReceipt(candidate) {
  try {
    if (!exactKeys(candidate, ["contract_version", "observed_at", "authority", "completeness", "counts", "catalog", "generator_binding", "capture_binding"])) return false;
    if (candidate.contract_version !== "trade.action660.ma09.catalog-typegen-evidence.v2" || candidate.observed_at !== "2026-08-11T19:27:19.850135Z") return false;
    if (!exactKeys(candidate.authority, ["organization", "project", "project_ref", "effective_role", "access_path", "transaction_read_only", "default_transaction_read_only"])) return false;
    if (candidate.authority.organization !== "Valentin Labs" || candidate.authority.project !== "Trade" || candidate.authority.project_ref !== "ekdyopdrrkphlrsilyoo" || candidate.authority.effective_role !== "postgres" || candidate.authority.access_path !== "supabase_management_api" || candidate.authority.transaction_read_only !== "on" || candidate.authority.default_transaction_read_only !== "off") return false;
    if (!exactKeys(candidate.completeness, ["complete", "truncated", "all_exposed_schemas_enumerated", "unresolved_dimensions"]) || !candidate.completeness.complete || candidate.completeness.truncated || !candidate.completeness.all_exposed_schemas_enumerated || !Array.isArray(candidate.completeness.unresolved_dimensions) || candidate.completeness.unresolved_dimensions.length !== 0) return false;
    if (!exactKeys(candidate.counts, DIMENSION_ORDER) || !exactKeys(candidate.catalog, DIMENSION_ORDER)) return false;
    for (const name of DIMENSION_ORDER) {
      if (!Array.isArray(candidate.catalog[name]) || candidate.counts[name] !== EXPECTED_COUNTS[name] || candidate.catalog[name].length !== EXPECTED_COUNTS[name] || candidate.catalog[name].some((row) => !exactKeys(row, ROW_KEYS[name])) || !sortedUnique(candidate.catalog[name], IDENTITY_FIELDS[name])) return false;
    }
    if (candidate.catalog.columns.some((row) => !Number.isSafeInteger(row.ordinal_position) || row.ordinal_position < 1 || [row.table_schema, row.table_name, row.column_name, row.data_type, row.udt_schema, row.udt_name].some((value) => typeof value !== "string" || !value) || [row.is_nullable, row.has_default, row.is_identity, row.is_generated].some((value) => typeof value !== "boolean"))) return false;
    if (candidate.catalog.primary_keys.some((row) => !Array.isArray(row.columns) || !row.columns.length || row.columns.some((value) => typeof value !== "string" || !value) || new Set(row.columns).size !== row.columns.length)) return false;
    if (candidate.catalog.foreign_keys.some((row) => !Array.isArray(row.source_columns) || !Array.isArray(row.target_columns) || !row.source_columns.length || row.source_columns.length !== row.target_columns.length || [...row.source_columns, ...row.target_columns].some((value) => typeof value !== "string" || !value) || new Set(row.source_columns).size !== row.source_columns.length || new Set(row.target_columns).size !== row.target_columns.length)) return false;
    if (candidate.catalog.enums.some((row) => !Array.isArray(row.labels) || !row.labels.length || row.labels.some((value) => typeof value !== "string" || !value) || new Set(row.labels).size !== row.labels.length)) return false;
    if (candidate.catalog.composites.some((row) => !Array.isArray(row.attributes) || !row.attributes.length || row.attributes.some((attribute) => !exactKeys(attribute, ["attribute_name", "ordinal_position", "data_type"]) || typeof attribute.attribute_name !== "string" || !attribute.attribute_name || !Number.isSafeInteger(attribute.ordinal_position) || attribute.ordinal_position < 1 || typeof attribute.data_type !== "string" || !attribute.data_type))) return false;
    if (candidate.catalog.schemas[0]?.schema_name !== "public") return false;
    if (!exactKeys(candidate.generator_binding, ["cli_version", "command", "command_sha256", "project_ref", "schema_set", "output_path", "output_sha256"]) || candidate.generator_binding.cli_version !== "2.107.0" || candidate.generator_binding.command !== COMMAND || candidate.generator_binding.command_sha256 !== sha256(Buffer.from(`${COMMAND}\n`, "utf8")) || candidate.generator_binding.project_ref !== "ekdyopdrrkphlrsilyoo" || JSON.stringify(candidate.generator_binding.schema_set) !== JSON.stringify(["public"]) || candidate.generator_binding.output_path !== "lib/supabase-database.types.ts" || candidate.generator_binding.output_sha256 !== OUTPUT_SHA256) return false;
    if (/(?:service[_-]?role|password|token|db-url)/iu.test(candidate.generator_binding.command)) return false;
    const binding = catalogBinding(candidate);
    if (!exactKeys(candidate.capture_binding, ["query_path", "query_sha256", "dimension_order", "identity_fields", "canonical_serialization", "dimension_frame", "aggregate_frame", "manifest_sha256", "ordered_results", "aggregate_sha256"]) || candidate.capture_binding.query_path !== "scripts/action-660-ma09-read-only-catalog.sql" || candidate.capture_binding.query_sha256 !== EXPECTED_SOURCES.get(candidate.capture_binding.query_path) || canonicalJson(candidate.capture_binding.dimension_order) !== canonicalJson(DIMENSION_ORDER) || canonicalJson(candidate.capture_binding.identity_fields) !== canonicalJson(IDENTITY_FIELDS) || candidate.capture_binding.canonical_serialization !== "utf8-canonical-json-v1" || candidate.capture_binding.dimension_frame !== "dimension_name || 0x0a || canonical_json(rows) || 0x0a" || candidate.capture_binding.aggregate_frame !== "ordered concat(dimension_name || ':' || dimension_sha256 || 0x0a)" || !Array.isArray(candidate.capture_binding.ordered_results) || candidate.capture_binding.ordered_results.some((entry) => !exactKeys(entry, ["result_id", "sha256", "row_count"])) || candidate.capture_binding.manifest_sha256 !== binding.manifest_sha256 || candidate.capture_binding.aggregate_sha256 !== binding.aggregate_sha256 || canonicalJson(candidate.capture_binding.ordered_results) !== canonicalJson(binding.ordered_results)) return false;
    for (const table of OWNER_TABLES) {
      const column = candidate.catalog.columns.find((entry) => entry.table_schema === "public" && entry.table_name === table && entry.column_name === "owner_user_id");
      if (!column || column.data_type !== "uuid" || column.is_nullable) return false;
    }
    const executionOwner = candidate.catalog.columns.find((entry) => entry.table_schema === "public" && entry.table_name === "execution_records" && entry.column_name === "user_id");
    if (!executionOwner || executionOwner.data_type !== "uuid" || executionOwner.is_nullable) return false;
    const ownerFunction = candidate.catalog.functions.find((entry) => entry.function_schema === "public" && entry.function_name === "app_open_owned_position_transaction");
    return Boolean(ownerFunction && ownerFunction.identity_arguments.startsWith("p_owner_user_id uuid,") && ownerFunction.return_type === "TABLE(position_id uuid, disposition text, snapshot_link_count integer)");
  } catch {
    return false;
  }
}

function validateProvenance(candidate, catalogReceipt = receipt, reader = readRepoFile) {
  try {
    if (!validateReceipt(catalogReceipt) || !exactKeys(candidate, ["contract_version", "evidence_status", "observed_at", "authority", "source_receipt", "generator", "output", "drift_reconciliation", "repository_sources", "delivery", "scope_limits"]) || candidate.contract_version !== "trade.action660.ma09.generated-types-provenance.v2" || candidate.evidence_status !== "repository_pinned_delivery_candidate" || candidate.observed_at !== catalogReceipt.observed_at) return false;
    if (!exactKeys(candidate.authority, ["organization", "project", "project_ref", "effective_role", "access_path", "transaction_read_only", "default_transaction_read_only"]) || canonicalJson(candidate.authority) !== canonicalJson(catalogReceipt.authority)) return false;
    if (!exactKeys(linkedAttestation, ["protocol", "source_kind", "source_sha256", "project_ref", "project_name", "organization_id", "organization_slug"]) || linkedAttestation.protocol !== "trade.action660.ma09.supabase-linked-project-attestation.v2" || linkedAttestation.source_kind !== "supabase_cli_linked_project_metadata" || linkedAttestation.source_sha256 !== "a0d9a6e16fec2e53962eb3e4a3a01cca998be15541df1c1aa48ce8cb70b8a9b4" || linkedAttestation.project_ref !== catalogReceipt.authority.project_ref || linkedAttestation.project_name !== catalogReceipt.authority.project || linkedAttestation.organization_id !== "ldcctdjgqpcrliqsltya" || linkedAttestation.organization_slug !== "ldcctdjgqpcrliqsltya") return false;
    const reconstructedLinkMetadata = Buffer.from(JSON.stringify({ ref: linkedAttestation.project_ref, name: linkedAttestation.project_name, organization_id: linkedAttestation.organization_id, organization_slug: linkedAttestation.organization_slug }), "utf8");
    if (sha256(reconstructedLinkMetadata) !== linkedAttestation.source_sha256) return false;
    if (!exactKeys(candidate.source_receipt, ["path", "contract_version", "sha256", "complete", "truncated", "counts", "catalog_manifest_sha256", "catalog_aggregate_sha256", "linked_project_attestation_path", "linked_project_attestation_sha256"]) || candidate.source_receipt.path !== receiptPath || candidate.source_receipt.contract_version !== catalogReceipt.contract_version || candidate.source_receipt.sha256 !== RECEIPT_SHA256 || sha256(reader(receiptPath)) !== RECEIPT_SHA256 || !candidate.source_receipt.complete || candidate.source_receipt.truncated || !exactKeys(candidate.source_receipt.counts, DIMENSION_ORDER) || canonicalJson(candidate.source_receipt.counts) !== canonicalJson(EXPECTED_COUNTS) || candidate.source_receipt.catalog_manifest_sha256 !== catalogReceipt.capture_binding.manifest_sha256 || candidate.source_receipt.catalog_aggregate_sha256 !== catalogReceipt.capture_binding.aggregate_sha256 || candidate.source_receipt.linked_project_attestation_path !== linkedAttestationPath || candidate.source_receipt.linked_project_attestation_sha256 !== EXPECTED_SOURCES.get(linkedAttestationPath) || sha256(reader(linkedAttestationPath)) !== candidate.source_receipt.linked_project_attestation_sha256) return false;
    if (!exactKeys(candidate.generator, ["cli_version", "generation_mode", "schema_set", "command", "command_sha256"]) || candidate.generator.cli_version !== "2.107.0" || candidate.generator.generation_mode !== "project_id" || candidate.generator.command !== COMMAND || candidate.generator.command_sha256 !== sha256(Buffer.from(`${COMMAND}\n`, "utf8")) || JSON.stringify(candidate.generator.schema_set) !== JSON.stringify(["public"])) return false;
    if (!exactKeys(candidate.output, ["path", "sha256", "git_blob_sha1", "required_symbols"]) || candidate.output.path !== "lib/supabase-database.types.ts" || candidate.output.sha256 !== OUTPUT_SHA256 || candidate.output.git_blob_sha1 !== "8184b809ef91348d111b146a8378c428e614efd4" || canonicalJson(candidate.output.required_symbols) !== canonicalJson(REQUIRED_SYMBOLS)) return false;
    const outputBytes = reader(candidate.output.path);
    if (sha256(outputBytes) !== OUTPUT_SHA256 || gitBlobSha1(outputBytes) !== candidate.output.git_blob_sha1 || !candidate.output.required_symbols.every((symbol) => outputBytes.includes(Buffer.from(symbol, "utf8")))) return false;
    if (!exactKeys(candidate.drift_reconciliation, ["historical_output_sha256", "migration_path", "migration_sha256", "required_owner_tables", "owner_function"]) || candidate.drift_reconciliation.historical_output_sha256 !== HISTORICAL_OUTPUT_SHA256 || candidate.drift_reconciliation.migration_path !== "supabase/migrations/20260811163228_add_fail_closed_application_owner_foundation.sql" || candidate.drift_reconciliation.migration_sha256 !== EXPECTED_SOURCES.get(candidate.drift_reconciliation.migration_path) || canonicalJson(candidate.drift_reconciliation.required_owner_tables) !== canonicalJson(OWNER_TABLES) || candidate.drift_reconciliation.owner_function !== "app_open_owned_position_transaction") return false;
    const sources = candidate.repository_sources;
    if (!Array.isArray(sources) || sources.length !== EXPECTED_SOURCES.size || sources.some((entry) => !exactKeys(entry, ["path", "sha256"])) || new Set(sources.map((entry) => entry.path)).size !== sources.length) return false;
    for (const [path, expected] of EXPECTED_SOURCES) {
      const source = sources.find((entry) => entry.path === path);
      if (!source || source.sha256 !== expected || sha256(reader(path)) !== expected) return false;
    }
    if (!exactKeys(candidate.delivery, ["current_main_commit", "current_main_tree", "stacked_base_commit", "stacked_base_tree", "stacked_base_pr", "gate", "stacked_base_candidate_count", "post_delivery_candidate_count", "total_gate_count", "closure_conditions"]) || candidate.delivery.current_main_commit !== "490e3607d1dfb85046be5ce70c787f897b5d939e" || candidate.delivery.current_main_tree !== "57909c14bd7fc2867bd67b94ae0c9a4ad94ffb2c" || candidate.delivery.stacked_base_commit !== "e0b71ddbb4774e0b87ba3c7eabb2f4680179f43c" || candidate.delivery.stacked_base_tree !== "fa1d70d46d1f3f90e90ba96bb5e5b5feda7da21b" || candidate.delivery.stacked_base_pr !== 95 || candidate.delivery.gate !== "MA-09" || candidate.delivery.stacked_base_candidate_count !== 13 || candidate.delivery.post_delivery_candidate_count !== 14 || candidate.delivery.total_gate_count !== 15 || canonicalJson(candidate.delivery.closure_conditions) !== canonicalJson(EXPECTED_CLOSURE_CONDITIONS)) return false;
    return exactKeys(candidate.scope_limits, SCOPE_KEYS) && Object.values(candidate.scope_limits).every((value) => value === false);
  } catch {
    return false;
  }
}

const checks = [];
const check = (name, operation) => {
  let passed = false;
  try { passed = Boolean(operation()); } catch { passed = false; }
  checks.push({ name, passed });
};

check("baseline V2 receipt valid", () => validateReceipt(receipt));
check("baseline V2 provenance valid", () => validateProvenance(provenance));
check("linked-project attestation is exact", () => linkedAttestation.project_ref === receipt.authority.project_ref && sha256(readRepoFile(linkedAttestationPath)) === EXPECTED_SOURCES.get(linkedAttestationPath));
check("historical V1 bytes preserved", () => sha256(readRepoFile("docs/evidence/action-652-generated-types-provenance-v1/supabase-database.types.v1.ts")) === HISTORICAL_OUTPUT_SHA256);
check("read-only query begins before catalog read", () => readRepoFile("scripts/action-660-ma09-read-only-catalog.sql").toString("utf8").startsWith("begin transaction read only;\n"));
check("database transaction timestamp is captured", () => readRepoFile("scripts/action-660-ma09-read-only-catalog.sql").toString("utf8").includes("transaction_timestamp() at time zone 'UTC'"));
check("receipt observation timestamp mutation rejected", () => { const value = clone(receipt); value.observed_at = "2099-01-01T00:00:00.000000Z"; return !validateReceipt(value); });
check("receipt authority mutation rejected", () => { const value = clone(receipt); value.authority.transaction_read_only = "off"; return !validateReceipt(value); });
check("receipt effective-role mutation rejected", () => { const value = clone(receipt); value.authority.effective_role = "supabase_read_only_user"; return !validateReceipt(value); });
check("receipt project mutation rejected", () => { const value = clone(receipt); value.authority.project_ref = "forged"; return !validateReceipt(value); });
check("receipt unexpected top-level key rejected", () => { const value = clone(receipt); value.unreviewed = false; return !validateReceipt(value); });
check("catalog unexpected row key rejected", () => { const value = clone(receipt); value.catalog.columns[0].unreviewed = false; return !validateReceipt(value); });
check("receipt truncation mutation rejected", () => { const value = clone(receipt); value.completeness.truncated = true; return !validateReceipt(value); });
check("catalog row mutation rejected", () => { const value = clone(receipt); value.catalog.columns[0].column_name = "forged"; return !validateReceipt(value); });
check("catalog order mutation rejected", () => { const value = clone(receipt); value.catalog.tables.reverse(); return !validateReceipt(value); });
check("catalog count mutation rejected", () => { const value = clone(receipt); value.counts.columns += 1; return !validateReceipt(value); });
check("owner nullability mutation rejected", () => { const value = clone(receipt); value.catalog.columns.find((entry) => entry.table_name === "positions" && entry.column_name === "owner_user_id").is_nullable = true; return !validateReceipt(value); });
check("owner RPC mutation rejected", () => { const value = clone(receipt); value.catalog.functions.find((entry) => entry.function_name === "app_open_owned_position_transaction").identity_arguments = ""; return !validateReceipt(value); });
check("generator command mutation rejected", () => { const value = clone(receipt); value.generator_binding.command += " "; return !validateReceipt(value); });
check("provenance receipt mutation rejected", () => { const value = clone(provenance); value.source_receipt.sha256 = "f".repeat(64); return !validateProvenance(value); });
check("linked-project attestation mutation rejected", () => { const value = clone(provenance); value.source_receipt.linked_project_attestation_sha256 = "f".repeat(64); return !validateProvenance(value); });
check("provenance unexpected top-level key rejected", () => { const value = clone(provenance); value.unreviewed = false; return !validateProvenance(value); });
check("repository source unexpected key rejected", () => { const value = clone(provenance); value.repository_sources[0].unreviewed = false; return !validateProvenance(value); });
check("provenance output mutation rejected", () => { const value = clone(provenance); value.output.sha256 = "f".repeat(64); return !validateProvenance(value); });
check("migration identity mutation rejected", () => { const value = clone(provenance); value.drift_reconciliation.migration_sha256 = "f".repeat(64); return !validateProvenance(value); });
check("stacked base mutation rejected", () => { const value = clone(provenance); value.delivery.stacked_base_commit = "f".repeat(40); return !validateProvenance(value); });
check("gate arithmetic mutation rejected", () => { const value = clone(provenance); value.delivery.post_delivery_candidate_count = 15; return !validateProvenance(value); });
check("closure condition extension rejected", () => { const value = clone(provenance); value.delivery.closure_conditions.push("unreviewed"); return !validateProvenance(value); });
check("scope expansion rejected", () => { const value = clone(provenance); value.scope_limits.database_mutation = true; return !validateProvenance(value); });
check("scope key extension rejected", () => { const value = clone(provenance); value.scope_limits.unreviewed = false; return !validateProvenance(value); });

const failed = checks.filter((entry) => !entry.passed);
console.log(JSON.stringify({ protocol: "trade.action660.ma09.generated-types-provenance-oracle.v2", total: checks.length, passed: checks.length - failed.length, failed }, null, 2));
if (failed.length) process.exit(1);
