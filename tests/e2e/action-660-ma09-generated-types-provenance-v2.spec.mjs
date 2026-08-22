// Provider-free V2 evidence oracle. It verifies archived Supabase responses
// and never contacts Supabase.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const root = new URL("../../", import.meta.url);
const paths = {
  receipt: "docs/evidence/action-660-ma09-generated-types-provenance-v2/catalog-receipt-v2.json",
  provenance: "docs/evidence/action-660-ma09-generated-types-provenance-v2/provenance-contract-v2.json",
  envelope: "docs/evidence/action-660-ma09-generated-types-provenance-v2/provider-execution-envelope-v2.json",
  projectResponse: "docs/evidence/action-660-ma09-generated-types-provenance-v2/provider-project-response-v2.json",
  catalogResponse: "docs/evidence/action-660-ma09-generated-types-provenance-v2/provider-catalog-response-v2.json",
  typegenResponse: "docs/evidence/action-660-ma09-generated-types-provenance-v2/provider-typegen-response-v2.json",
  providerTypes: "docs/evidence/action-660-ma09-generated-types-provenance-v2/provider-typescript-response-v2.ts",
  query: "scripts/action-660-ma09-read-only-catalog.sql",
  historical: "docs/evidence/action-652-generated-types-provenance-v1/supabase-database.types.v1.ts",
};
const V2_REPOSITORY_OUTPUT_PATH = "lib/supabase-database.types.ts";
const REF = "ekdyopdrrkphlrsilyoo";
const OUTPUT_SHA256 = "f23c3702ffd931cb5d81f13e19a8515125817717e9a3fad7ac85e40795729029";
const OUTPUT_GIT_BLOB_SHA1 = "8184b809ef91348d111b146a8378c428e614efd4";
const HISTORICAL_OUTPUT_SHA256 = "5a74e8de579628387d90e414fb434a80d8481fcd53526310e9b3a8e3754d8a6c";
const PROVENANCE_SHA256 = "fa05ea0b2c7658beeb36cbdd52678cb76afe07d3e1d650accb76142e0fcc673b";
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
const EXPECTED_SOURCES = new Map([
  [paths.receipt, "f3f9424a42a72e5a2f1e3ba21a8fb2fe538a2225587ec7fa734a85b4858f0fea"],
  [paths.query, "f8c01dccadc2944866a52831aeb1f9a4f227e2684f1eb005f6eca9248a8596fb"],
  [paths.envelope, "40f9fc28dd196c5a2b7a7e2ed07a3bcd23b3bbc0286507c42941a2454cb80d37"],
  [paths.projectResponse, "a37c6814e05b584b35939f57c2d00cbc74f72e5ee7f008a88ea2dc7754867ff1"],
  [paths.catalogResponse, "0677648d6f0b144f89612f8bd3b814ab96f964b688fc1525e4b0d5f4e54f4d6f"],
  [paths.typegenResponse, "d585cce5a5911611d691589d2574330c909495ce28041fafc9caac1dbb45194e"],
  [paths.providerTypes, OUTPUT_SHA256],
  ["supabase/migrations/20260811163228_add_fail_closed_application_owner_foundation.sql", "fd8330d8156d454a79721126f1cc054d07e893452e70a7a9616cdf72ec5219f7"],
  [V2_REPOSITORY_OUTPUT_PATH, OUTPUT_SHA256],
  ["docs/evidence/action-660c-ma05-ma06-ma08-verified-closure.json", "b8b73562773c064dc1398d30cbbcc54afcb716aa9bedb756c92dc335397e9ddf"],
]);
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
const EXPECTED_CLOSURE_CONDITIONS = [
  "independent_review_no_findings",
  "stacked_base_pr_95_merged_first",
  "exact_scope_merge",
  "manifest_receipt_provider_responses_and_output_main_reachable",
  "exact_main_ci_success",
];

const read = (path) => readFileSync(new URL(path, root));
const parse = (path) => JSON.parse(read(path).toString("utf8"));
const providerContent = (path) => {
  const artifact = read(path);
  if (artifact.at(-1) !== 0x0a) throw new Error("repository_lf_missing");
  return artifact.subarray(0, -1);
};
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const gitBlobSha1 = (value) => createHash("sha1")
  .update(Buffer.from(`blob ${value.length}\0`, "utf8"))
  .update(value)
  .digest("hex");
const utf8Compare = (left, right) => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
const clone = (value) => structuredClone(value);
const exactKeys = (value, expected) => value !== null && typeof value === "object" &&
  !Array.isArray(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());
const UUID_PATTERN = /(?:^|[^0-9a-f])[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:$|[^0-9a-f])/iu;
const CREDENTIAL_PATTERN = /(?:service[_-]?role[_-]?key|authorization\s*[:=]\s*bearer\s+[a-z0-9._-]{20,}|postgres(?:ql)?:\/\/[^\s"]+:[^\s"]+@)/iu;
const evidenceSafe = (value) => !UUID_PATTERN.test(value) && !CREDENTIAL_PATTERN.test(value);

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

function requestFrame(method, endpointPath, querySha) {
  return Buffer.from(`${method}\n${endpointPath}\n${querySha ? `${querySha}\n` : ""}`, "utf8");
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

const receipt = parse(paths.receipt);
const provenance = parse(paths.provenance);
const envelope = parse(paths.envelope);
const projectResponse = parse(paths.projectResponse);
const catalogResponse = parse(paths.catalogResponse);
const typegenResponse = parse(paths.typegenResponse);
const catalogSnapshot = catalogResponse[0]?.catalog_snapshot;

function validateEnvelope(candidate) {
  try {
    if (sha256(read(paths.envelope)) !== EXPECTED_SOURCES.get(paths.envelope) ||
        canonicalJson(candidate) !== canonicalJson(envelope) ||
        !exactKeys(candidate, ["contract_version", "provider", "transport", "project_identity", "catalog_execution", "type_generation", "scope"]) ||
        candidate.contract_version !== "trade.action660.ma09.provider-execution-envelope.v2" ||
        candidate.provider !== "Supabase" || candidate.transport !== "connected_supabase_management_api") return false;
    const project = candidate.project_identity;
    if (!exactKeys(project, ["lookup_tool", "method", "endpoint_template", "endpoint_path", "endpoint_reference", "request", "request_frame", "request_frame_sha256", "response_path", "response_sha256", "response_serialization", "provider_content_sha256", "response_binding"]) ||
        !exactKeys(project.request, ["id"]) ||
        !exactKeys(project.response_binding, ["id", "ref", "organization_id", "organization_slug", "name", "region", "status"]) ||
        project.lookup_tool !== "supabase_get_project" || project.method !== "GET" ||
        project.endpoint_template !== "/v1/projects/{ref}" || project.endpoint_path !== `/v1/projects/${REF}` ||
        project.endpoint_reference !== "https://supabase.com/docs/reference/api/v1-get-project" ||
        project.request.id !== REF || project.request_frame_sha256 !== sha256(requestFrame(project.method, project.endpoint_path)) ||
        project.response_path !== paths.projectResponse ||
        project.response_sha256 !== sha256(read(paths.projectResponse)) ||
        project.response_serialization !== "exact_provider_json_utf8_plus_repository_lf" ||
        project.provider_content_sha256 !== "8ca84105cc612d06fcd919b017cb90071dd05fac07bcb5dc80ef146acf85be23" ||
        project.provider_content_sha256 !== sha256(providerContent(paths.projectResponse))) return false;
    if (projectResponse.id !== REF || projectResponse.ref !== REF ||
        projectResponse.name !== "Trade" || projectResponse.organization_id !== "ldcctdjgqpcrliqsltya" ||
        canonicalJson(project.response_binding) !== canonicalJson({
          id: projectResponse.id,
          ref: projectResponse.ref,
          organization_id: projectResponse.organization_id,
          organization_slug: projectResponse.organization_slug,
          name: projectResponse.name,
          region: projectResponse.region,
          status: projectResponse.status,
        })) return false;

    const catalog = candidate.catalog_execution;
    if (!exactKeys(catalog, ["tool", "method", "endpoint_template", "endpoint_path", "endpoint_reference", "request", "request_frame", "request_frame_sha256", "response_path", "response_sha256", "response_serialization", "provider_content_sha256", "snapshot_json_pointer", "database_observed_at", "transaction_read_only"]) ||
        !exactKeys(catalog.request, ["project_id", "query_path", "query_sha256"]) ||
        catalog.tool !== "supabase_execute_sql" || catalog.method !== "POST" ||
        catalog.endpoint_template !== "/v1/projects/{ref}/database/query" || catalog.endpoint_path !== `/v1/projects/${REF}/database/query` ||
        catalog.endpoint_reference !== "https://supabase.com/docs/reference/api/v1-run-a-query" ||
        catalog.request.project_id !== REF ||
        catalog.request.query_path !== paths.query ||
        catalog.request.query_sha256 !== sha256(read(paths.query)) ||
        catalog.request_frame_sha256 !== sha256(requestFrame(catalog.method, catalog.endpoint_path, catalog.request.query_sha256)) ||
        catalog.response_path !== paths.catalogResponse ||
        catalog.response_sha256 !== sha256(read(paths.catalogResponse)) ||
        catalog.response_serialization !== "exact_provider_json_utf8_plus_repository_lf" ||
        catalog.provider_content_sha256 !== "68c83fb6cdeaa87032cf4a35b343139db984a503153131b406259eed5541a739" ||
        catalog.provider_content_sha256 !== sha256(providerContent(paths.catalogResponse)) ||
        catalog.snapshot_json_pointer !== "$[0].catalog_snapshot" ||
        catalog.database_observed_at !== catalogSnapshot.observed_at ||
        catalog.transaction_read_only !== catalogSnapshot.authority.transaction_read_only) return false;

    const typegen = candidate.type_generation;
    const extracted = Buffer.from(typegenResponse.types, "utf8");
    if (!exactKeys(typegen, ["tool", "method", "endpoint_template", "endpoint_path", "endpoint_reference", "request", "request_frame", "request_frame_sha256", "raw_response_path", "raw_response_sha256", "raw_response_serialization", "raw_provider_content_sha256", "extracted_types_json_pointer", "extracted_types_path", "extracted_types_sha256", "repository_output_path", "repository_output_sha256", "byte_identical"]) ||
        !exactKeys(typegen.request, ["project_id"]) ||
        typegen.tool !== "supabase_generate_typescript_types" || typegen.method !== "GET" ||
        typegen.endpoint_template !== "/v1/projects/{ref}/types/typescript" || typegen.endpoint_path !== `/v1/projects/${REF}/types/typescript` ||
        typegen.endpoint_reference !== "https://supabase.com/docs/reference/api/v1-generate-typescript-types" ||
        typegen.request.project_id !== REF ||
        typegen.request_frame_sha256 !== sha256(requestFrame(typegen.method, typegen.endpoint_path)) ||
        typegen.raw_response_path !== paths.typegenResponse ||
        typegen.raw_response_sha256 !== sha256(read(paths.typegenResponse)) ||
        typegen.raw_response_serialization !== "exact_provider_json_utf8_plus_repository_lf" ||
        typegen.raw_provider_content_sha256 !== "89de6a4544fb776b61ebd71eb0a26ee996548b01b9e39723caa3e5c9f1c89147" ||
        typegen.raw_provider_content_sha256 !== sha256(providerContent(paths.typegenResponse)) ||
        typegen.extracted_types_json_pointer !== "$.types" ||
        typegen.extracted_types_path !== paths.providerTypes ||
        typegen.extracted_types_sha256 !== sha256(extracted) ||
        !extracted.equals(read(paths.providerTypes)) ||
        typegen.repository_output_path !== V2_REPOSITORY_OUTPUT_PATH ||
        typegen.repository_output_sha256 !== OUTPUT_SHA256 ||
        gitBlobSha1(read(paths.providerTypes)) !== OUTPUT_GIT_BLOB_SHA1 ||
        !typegen.byte_identical) return false;

    return exactKeys(candidate.scope, ["catalog_selected_schemas", "generated_output_schemas", "secrets_included", "owner_uuid_included", "application_row_data_included", "database_mutation"]) &&
      canonicalJson(candidate.scope.catalog_selected_schemas) === canonicalJson(["public"]) &&
      canonicalJson(candidate.scope.generated_output_schemas) === canonicalJson(["public"]) &&
      Object.entries(candidate.scope).filter(([key]) => !key.endsWith("_schemas")).every(([, value]) => value === false);
  } catch {
    return false;
  }
}

function validateReceipt(candidate) {
  try {
    if (sha256(read(paths.receipt)) !== EXPECTED_SOURCES.get(paths.receipt) ||
        canonicalJson(candidate) !== canonicalJson(receipt) ||
        !exactKeys(candidate, ["contract_version", "observed_at", "authority", "completeness", "counts", "catalog", "generator_binding", "capture_binding"]) ||
        candidate.contract_version !== "trade.action660.ma09.catalog-typegen-evidence.v2" ||
        candidate.observed_at !== catalogSnapshot.observed_at ||
        !exactKeys(candidate.authority, ["organization", "project", "project_ref", "project_identity_source", "effective_role", "access_path", "transaction_read_only", "default_transaction_read_only"]) ||
        candidate.authority.organization !== "Valentin Labs" || candidate.authority.project !== "Trade" ||
        candidate.authority.project_ref !== REF ||
        candidate.authority.project_identity_source !== "provider-execution-envelope-v2" ||
        candidate.authority.effective_role !== catalogSnapshot.authority.effective_role ||
        candidate.authority.access_path !== "supabase_management_api_execute_sql" ||
        candidate.authority.transaction_read_only !== "on" || candidate.authority.default_transaction_read_only !== "off") return false;
    if (!exactKeys(candidate.completeness, ["selected_schemas", "all_selected_schemas_enumerated", "complete", "truncated", "unresolved_dimensions"]) ||
        canonicalJson(candidate.completeness.selected_schemas) !== canonicalJson(["public"]) ||
        !candidate.completeness.all_selected_schemas_enumerated ||
        !candidate.completeness.complete || candidate.completeness.truncated ||
        candidate.completeness.unresolved_dimensions.length !== 0) return false;
    if (!exactKeys(candidate.counts, DIMENSION_ORDER) || !exactKeys(candidate.catalog, DIMENSION_ORDER) ||
        canonicalJson(candidate.counts) !== canonicalJson(EXPECTED_COUNTS) ||
        canonicalJson(candidate.catalog) !== canonicalJson(catalogSnapshot.catalog)) return false;
    for (const name of DIMENSION_ORDER) {
      if (!Array.isArray(candidate.catalog[name]) || candidate.catalog[name].length !== EXPECTED_COUNTS[name] ||
          candidate.catalog[name].some((row) => !exactKeys(row, ROW_KEYS[name])) ||
          !sortedUnique(candidate.catalog[name], IDENTITY_FIELDS[name])) return false;
    }
    const binding = catalogBinding(candidate);
    if (!exactKeys(candidate.capture_binding, ["execution_envelope_path", "execution_envelope_sha256", "query_path", "query_sha256", "provider_response_path", "provider_response_sha256", "provider_snapshot_json_pointer", "dimension_order", "identity_fields", "canonical_serialization", "dimension_frame", "aggregate_frame", "manifest_sha256", "ordered_results", "aggregate_sha256"]) ||
        candidate.capture_binding.execution_envelope_path !== paths.envelope ||
        candidate.capture_binding.execution_envelope_sha256 !== sha256(read(paths.envelope)) ||
        candidate.capture_binding.query_path !== paths.query ||
        candidate.capture_binding.query_sha256 !== sha256(read(paths.query)) ||
        candidate.capture_binding.provider_response_path !== paths.catalogResponse ||
        candidate.capture_binding.provider_response_sha256 !== sha256(read(paths.catalogResponse)) ||
        candidate.capture_binding.provider_snapshot_json_pointer !== "$[0].catalog_snapshot" ||
        canonicalJson(candidate.capture_binding.dimension_order) !== canonicalJson(DIMENSION_ORDER) ||
        canonicalJson(candidate.capture_binding.identity_fields) !== canonicalJson(IDENTITY_FIELDS) ||
        candidate.capture_binding.canonical_serialization !== "utf8-canonical-json-v1" ||
        candidate.capture_binding.dimension_frame !== "dimension_name || 0x0a || canonical_json(rows) || 0x0a" ||
        candidate.capture_binding.aggregate_frame !== "ordered concat(dimension_name || ':' || dimension_sha256 || 0x0a)" ||
        candidate.capture_binding.ordered_results.some((entry) => !exactKeys(entry, ["result_id", "sha256", "row_count"])) ||
        candidate.capture_binding.manifest_sha256 !== binding.manifest_sha256 ||
        canonicalJson(candidate.capture_binding.ordered_results) !== canonicalJson(binding.ordered_results) ||
        candidate.capture_binding.aggregate_sha256 !== binding.aggregate_sha256) return false;
    const generator = candidate.generator_binding;
    if (!exactKeys(generator, ["tool", "method", "endpoint_path", "request_project_id", "request_frame", "request_frame_sha256", "raw_response_path", "raw_response_sha256", "extracted_types_path", "extracted_types_sha256", "output_schema_set", "output_path", "output_sha256", "byte_identical"]) ||
        generator.tool !== "supabase_generate_typescript_types") return false;
    if (generator.request_project_id !== REF || generator.method !== "GET" ||
        generator.endpoint_path !== `/v1/projects/${REF}/types/typescript` ||
        generator.request_frame !== "method || 0x0a || endpoint_path || 0x0a") return false;
    if (generator.request_frame_sha256 !== sha256(requestFrame(generator.method, generator.endpoint_path)) ||
        generator.raw_response_path !== paths.typegenResponse || generator.raw_response_sha256 !== sha256(read(paths.typegenResponse)) ||
        generator.extracted_types_path !== paths.providerTypes || generator.extracted_types_sha256 !== OUTPUT_SHA256 ||
        generator.output_path !== V2_REPOSITORY_OUTPUT_PATH || generator.output_sha256 !== OUTPUT_SHA256 ||
        canonicalJson(generator.output_schema_set) !== canonicalJson(["public"]) ||
        !generator.byte_identical || !read(generator.extracted_types_path).equals(read(paths.providerTypes))) return false;
    for (const table of OWNER_TABLES) {
      const column = candidate.catalog.columns.find((entry) => entry.table_schema === "public" && entry.table_name === table && entry.column_name === "owner_user_id");
      if (!column || column.data_type !== "uuid" || column.is_nullable) return false;
    }
    const ownerFunction = candidate.catalog.functions.find((entry) => entry.function_schema === "public" && entry.function_name === "app_open_owned_position_transaction");
    return Boolean(ownerFunction && ownerFunction.identity_arguments.startsWith("p_owner_user_id uuid,"));
  } catch {
    return false;
  }
}

function validateProvenance(candidate) {
  try {
    if (sha256(read(paths.provenance)) !== PROVENANCE_SHA256 ||
        canonicalJson(candidate) !== canonicalJson(provenance) ||
        !exactKeys(candidate, ["contract_version", "evidence_status", "observed_at", "authority", "provider_execution", "source_receipt", "generator", "output", "drift_reconciliation", "repository_sources", "delivery", "scope_limits"]) ||
        candidate.contract_version !== "trade.action660.ma09.generated-types-provenance.v2" ||
        candidate.evidence_status !== "repository_pinned_delivery_candidate" ||
        candidate.observed_at !== receipt.observed_at) return false;
    if (!exactKeys(candidate.authority, ["organization", "project", "project_ref", "project_identity_source", "effective_role", "access_path", "transaction_read_only", "default_transaction_read_only"]) ||
        candidate.authority.organization !== "Valentin Labs" || candidate.authority.project !== "Trade" ||
        candidate.authority.project_ref !== REF || candidate.authority.project_identity_source !== "provider-execution-envelope-v2" ||
        candidate.authority.effective_role !== "postgres" || candidate.authority.access_path !== "supabase_management_api" ||
        candidate.authority.transaction_read_only !== "on" || candidate.authority.default_transaction_read_only !== "off") return false;

    const provider = candidate.provider_execution;
    if (!exactKeys(provider, ["envelope_path", "envelope_sha256", "project_response_path", "project_response_sha256", "catalog_response_path", "catalog_response_sha256", "typegen_response_path", "typegen_response_sha256"]) ||
        provider.envelope_path !== paths.envelope || provider.envelope_sha256 !== sha256(read(paths.envelope)) ||
        provider.project_response_path !== paths.projectResponse || provider.project_response_sha256 !== sha256(read(paths.projectResponse)) ||
        provider.catalog_response_path !== paths.catalogResponse || provider.catalog_response_sha256 !== sha256(read(paths.catalogResponse)) ||
        provider.typegen_response_path !== paths.typegenResponse || provider.typegen_response_sha256 !== sha256(read(paths.typegenResponse))) return false;

    const sourceReceipt = candidate.source_receipt;
    if (!exactKeys(sourceReceipt, ["path", "contract_version", "sha256", "complete", "truncated", "selected_schemas", "all_selected_schemas_enumerated", "counts", "catalog_manifest_sha256", "catalog_aggregate_sha256"]) ||
        sourceReceipt.path !== paths.receipt ||
        sourceReceipt.contract_version !== receipt.contract_version ||
        sourceReceipt.sha256 !== sha256(read(paths.receipt)) ||
        sourceReceipt.complete !== true || sourceReceipt.truncated !== false ||
        sourceReceipt.all_selected_schemas_enumerated !== true ||
        canonicalJson(sourceReceipt.selected_schemas) !== canonicalJson(["public"]) ||
        !exactKeys(sourceReceipt.counts, DIMENSION_ORDER) ||
        canonicalJson(sourceReceipt.counts) !== canonicalJson(EXPECTED_COUNTS) ||
        sourceReceipt.catalog_manifest_sha256 !== receipt.capture_binding.manifest_sha256 ||
        sourceReceipt.catalog_aggregate_sha256 !== receipt.capture_binding.aggregate_sha256) return false;

    const generator = candidate.generator;
    if (!exactKeys(generator, ["tool", "method", "endpoint_path", "generation_mode", "request_project_id", "request_frame", "request_frame_sha256", "raw_response_path", "raw_response_sha256", "extracted_types_path", "extracted_types_sha256", "output_schema_set", "byte_identical_to_repository_output"]) ||
        generator.tool !== "supabase_generate_typescript_types" ||
        generator.method !== "GET" || generator.endpoint_path !== `/v1/projects/${REF}/types/typescript` ||
        generator.generation_mode !== "project_id" || generator.request_project_id !== REF ||
        generator.request_frame !== "method || 0x0a || endpoint_path || 0x0a" ||
        generator.request_frame_sha256 !== sha256(requestFrame(generator.method, generator.endpoint_path)) ||
        generator.raw_response_path !== paths.typegenResponse ||
        generator.raw_response_sha256 !== sha256(read(paths.typegenResponse)) ||
        generator.extracted_types_path !== paths.providerTypes ||
        generator.extracted_types_sha256 !== OUTPUT_SHA256 ||
        canonicalJson(generator.output_schema_set) !== canonicalJson(["public"]) ||
        !generator.byte_identical_to_repository_output) return false;

    if (!exactKeys(candidate.output, ["path", "sha256", "git_blob_sha1", "required_symbols"]) ||
        candidate.output.path !== V2_REPOSITORY_OUTPUT_PATH ||
        candidate.output.sha256 !== OUTPUT_SHA256 ||
        candidate.output.git_blob_sha1 !== OUTPUT_GIT_BLOB_SHA1 ||
        canonicalJson(candidate.output.required_symbols) !== canonicalJson(REQUIRED_SYMBOLS)) return false;
    const output = read(paths.providerTypes);
    if (sha256(output) !== OUTPUT_SHA256 ||
        candidate.output.git_blob_sha1 !== gitBlobSha1(output) ||
        !REQUIRED_SYMBOLS.every((symbol) => output.includes(Buffer.from(symbol, "utf8")))) return false;

    const drift = candidate.drift_reconciliation;
    if (!exactKeys(drift, ["historical_output_sha256", "migration_path", "migration_sha256", "required_owner_tables", "owner_function"]) ||
        drift.historical_output_sha256 !== HISTORICAL_OUTPUT_SHA256 ||
        drift.migration_path !== "supabase/migrations/20260811163228_add_fail_closed_application_owner_foundation.sql" ||
        drift.migration_sha256 !== EXPECTED_SOURCES.get(drift.migration_path) ||
        canonicalJson(drift.required_owner_tables) !== canonicalJson(OWNER_TABLES) ||
        drift.owner_function !== "app_open_owned_position_transaction") return false;

    if (!Array.isArray(candidate.repository_sources) ||
        candidate.repository_sources.length !== EXPECTED_SOURCES.size ||
        candidate.repository_sources.some((entry) => !exactKeys(entry, ["path", "sha256"])) ||
        new Set(candidate.repository_sources.map((entry) => entry.path)).size !== EXPECTED_SOURCES.size) return false;
    for (const [path, expected] of EXPECTED_SOURCES) {
      const source = candidate.repository_sources.find((entry) => entry.path === path);
      if (!source || source.sha256 !== expected) return false;
      if (path !== V2_REPOSITORY_OUTPUT_PATH && sha256(read(path)) !== expected) return false;
    }

    const delivery = candidate.delivery;
    if (!exactKeys(delivery, ["current_main_commit", "current_main_tree", "stacked_base_commit", "stacked_base_tree", "stacked_base_pr", "gate", "stacked_base_candidate_count", "post_delivery_candidate_count", "total_gate_count", "closure_conditions"]) ||
        delivery.current_main_commit !== "490e3607d1dfb85046be5ce70c787f897b5d939e" ||
        delivery.current_main_tree !== "57909c14bd7fc2867bd67b94ae0c9a4ad94ffb2c" ||
        delivery.stacked_base_commit !== "e0b71ddbb4774e0b87ba3c7eabb2f4680179f43c" ||
        delivery.stacked_base_tree !== "fa1d70d46d1f3f90e90ba96bb5e5b5feda7da21b" ||
        delivery.stacked_base_pr !== 95 || delivery.gate !== "MA-09" ||
        delivery.stacked_base_candidate_count !== 13 || delivery.post_delivery_candidate_count !== 14 ||
        delivery.total_gate_count !== 15 ||
        canonicalJson(delivery.closure_conditions) !== canonicalJson(EXPECTED_CLOSURE_CONDITIONS)) return false;

    return exactKeys(candidate.scope_limits, SCOPE_KEYS) &&
      Object.values(candidate.scope_limits).every((value) => value === false);
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

check("baseline provider execution envelope valid", () => validateEnvelope(envelope));
check("baseline V2 receipt valid", () => validateReceipt(receipt));
check("baseline V2 provenance valid", () => validateProvenance(provenance));
check("provider project response binds canonical project", () => projectResponse.id === REF && projectResponse.ref === REF && projectResponse.name === "Trade");
check("provider catalog response binds exact receipt payload", () => canonicalJson(catalogSnapshot.catalog) === canonicalJson(receipt.catalog));
check("catalog request is explicit read only", () => read(paths.query).toString("utf8").startsWith("begin transaction read only;\n"));
check("catalog SQL contains no asserted project ref", () => !read(paths.query).includes(Buffer.from(REF, "utf8")));
check("selected schema claim is exact", () => canonicalJson(catalogSnapshot.completeness.selected_schemas) === canonicalJson(["public"]) && catalogSnapshot.completeness.all_selected_schemas_enumerated);
check("provider type response extracts byte exactly", () => Buffer.from(typegenResponse.types, "utf8").equals(read(paths.providerTypes)));
check("provider type response retains the delivered V2 output bytes", () =>
  sha256(read(paths.providerTypes)) === OUTPUT_SHA256 &&
  gitBlobSha1(read(paths.providerTypes)) === OUTPUT_GIT_BLOB_SHA1);
check("historical V1 bytes preserved", () => sha256(read(paths.historical)) === HISTORICAL_OUTPUT_SHA256);
check("superseded self-attestation removed", () => !existsSync(new URL("docs/evidence/action-660-ma09-generated-types-provenance-v2/linked-project-attestation-v2.json", root)));
check("evidence excludes owner UUID and secret material", () => {
  const evidence = [paths.envelope, paths.projectResponse, paths.catalogResponse, paths.typegenResponse, paths.receipt, paths.provenance]
    .map((path) => read(path).toString("utf8")).join("\n");
  return evidenceSafe(evidence);
});
check("generic UUID evidence mutation rejected", () => {
  const syntheticUuid = ["0".repeat(8), "0".repeat(4), `4${"0".repeat(3)}`, `8${"0".repeat(3)}`, "0".repeat(12)].join("-");
  return !evidenceSafe(syntheticUuid);
});
check("credential evidence mutation rejected", () => !evidenceSafe(`Authorization: Bearer ${"x".repeat(32)}`));
check("envelope project mutation rejected", () => { const value = clone(envelope); value.project_identity.request.id = "forged"; return !validateEnvelope(value); });
check("envelope query hash mutation rejected", () => { const value = clone(envelope); value.catalog_execution.request.query_sha256 = "f".repeat(64); return !validateEnvelope(value); });
check("envelope catalog response mutation rejected", () => { const value = clone(envelope); value.catalog_execution.response_sha256 = "f".repeat(64); return !validateEnvelope(value); });
check("envelope typegen response mutation rejected", () => { const value = clone(envelope); value.type_generation.raw_response_sha256 = "f".repeat(64); return !validateEnvelope(value); });
check("envelope byte parity mutation rejected", () => { const value = clone(envelope); value.type_generation.byte_identical = false; return !validateEnvelope(value); });
check("receipt observation mutation rejected", () => { const value = clone(receipt); value.observed_at = "2099-01-01T00:00:00.000000Z"; return !validateReceipt(value); });
check("receipt project source mutation rejected", () => { const value = clone(receipt); value.authority.project_identity_source = "asserted"; return !validateReceipt(value); });
check("receipt selected-schema mutation rejected", () => { const value = clone(receipt); value.completeness.selected_schemas.push("private"); return !validateReceipt(value); });
check("receipt catalog mutation rejected", () => { const value = clone(receipt); value.catalog.columns[0].column_name = "forged"; return !validateReceipt(value); });
check("receipt envelope mutation rejected", () => { const value = clone(receipt); value.capture_binding.execution_envelope_sha256 = "f".repeat(64); return !validateReceipt(value); });
check("receipt generator response mutation rejected", () => { const value = clone(receipt); value.generator_binding.raw_response_sha256 = "f".repeat(64); return !validateReceipt(value); });
check("provenance receipt mutation rejected", () => { const value = clone(provenance); value.source_receipt.sha256 = "f".repeat(64); return !validateProvenance(value); });
check("provenance provider mutation rejected", () => { const value = clone(provenance); value.provider_execution.envelope_sha256 = "f".repeat(64); return !validateProvenance(value); });
check("provenance output mutation rejected", () => { const value = clone(provenance); value.output.sha256 = "f".repeat(64); return !validateProvenance(value); });
check("provenance authority mutation rejected", () => { const value = clone(provenance); value.authority.transaction_read_only = "off"; return !validateProvenance(value); });
check("provenance migration mutation rejected", () => { const value = clone(provenance); value.drift_reconciliation.migration_sha256 = "f".repeat(64); return !validateProvenance(value); });
check("provenance required-symbol deletion rejected", () => { const value = clone(provenance); value.output.required_symbols = []; return !validateProvenance(value); });
check("provenance scope-key deletion rejected", () => { const value = clone(provenance); delete value.scope_limits.database_mutation; return !validateProvenance(value); });
check("provenance provider path mutation rejected", () => { const value = clone(provenance); value.provider_execution.envelope_path = "forged"; return !validateProvenance(value); });
check("provenance receipt path mutation rejected", () => { const value = clone(provenance); value.source_receipt.path = "forged"; return !validateProvenance(value); });
check("provenance unexpected top-level key rejected", () => { const value = clone(provenance); value.unreviewed = false; return !validateProvenance(value); });
check("repository source unexpected key rejected", () => { const value = clone(provenance); value.repository_sources[0].unreviewed = false; return !validateProvenance(value); });
check("current-main tree mutation rejected", () => { const value = clone(provenance); value.delivery.current_main_tree = "f".repeat(40); return !validateProvenance(value); });
check("stacked base mutation rejected", () => { const value = clone(provenance); value.delivery.stacked_base_commit = "f".repeat(40); return !validateProvenance(value); });
check("gate arithmetic mutation rejected", () => { const value = clone(provenance); value.delivery.post_delivery_candidate_count = 15; return !validateProvenance(value); });
check("closure condition extension rejected", () => { const value = clone(provenance); value.delivery.closure_conditions.push("unreviewed"); return !validateProvenance(value); });
check("scope expansion rejected", () => { const value = clone(provenance); value.scope_limits.database_mutation = true; return !validateProvenance(value); });

const failed = checks.filter((entry) => !entry.passed);
console.log(JSON.stringify({
  protocol: "trade.action660.ma09.generated-types-provenance-oracle.v2",
  total: checks.length,
  passed: checks.length - failed.length,
  failed,
}, null, 2));
if (failed.length) process.exit(1);
