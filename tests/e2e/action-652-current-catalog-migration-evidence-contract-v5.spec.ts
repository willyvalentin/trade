import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
// The runtime contract validates all untrusted JSON before these oracle-only dynamic values are used.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dynamic = any;
const contractModule: Dynamic = await import(new URL("../../lib/server/action-652-current-catalog-migration-evidence-contract-v5.mts", import.meta.url).href);
const {
  computeCatalogBinding, createSyntheticNonAuthorityValidator, deriveMigrationReconciliation, getRegistrySnapshot,
  productionRegistryDigest, productionRuntimeDeepFrozen, validateCatalogEvidence, validateExactStateMachine,
  validateMigrationEvidence, validateProductionRegistryBytes
}: Dynamic = contractModule;

const assets = new URL("../../docs/evidence/action-652-current-catalog-migration-contract-v5/", import.meta.url);
const assetUrl = (name: string) => new URL(name, assets);
const identities = JSON.parse(readFileSync(assetUrl("registry-identities.json"), "utf8"));
const migrationSchema = JSON.parse(readFileSync(assetUrl("migration-structural-schema-v5.json"), "utf8"));
const snapshot = getRegistrySnapshot();
const registry = snapshot.registry;
const H = "a".repeat(64); const B = "b".repeat(40);
const results: Array<{ name: string; passed: boolean }> = []; let uncontrolled = 0;
const clone = (value: Dynamic): Dynamic => structuredClone(value);
const sha256 = (bytes: Buffer | string) => createHash("sha256").update(bytes).digest("hex");
function check(name: string, operation: () => boolean) { let passed = false; try { passed = Boolean(operation()); } catch { uncontrolled += 1; } results.push({ name, passed }); }

function catalogFixture(): Dynamic {
  const catalog: Dynamic = { schemas: [{ schema_name: "public" }], tables: [{ table_schema: "public", table_name: "t" }], views: [], columns: [{ table_schema: "public", table_name: "t", column_name: "c9", ordinal_position: 9, data_type: "text", udt_schema: "pg_catalog", udt_name: "text", is_nullable: false, has_default: false, is_identity: false, is_generated: false }, { table_schema: "public", table_name: "t", column_name: "c10", ordinal_position: 10, data_type: "text", udt_schema: "pg_catalog", udt_name: "text", is_nullable: false, has_default: false, is_identity: false, is_generated: false }], primary_keys: [], foreign_keys: [], functions: [], enums: [], composites: [] };
  const binding = computeCatalogBinding(catalog);
  const counts = Object.fromEntries(registry.catalog.dimension_order.map((name: string) => [name, catalog[name].length]));
  return { contract_version: "trade.action652.catalog-typegen-evidence.v5", authority: { organization: "Valentin Labs", project: "Trade", project_ref: "ekdyopdrrkphlrsilyoo", effective_role: "supabase_read_only_user", transaction_read_only: "on", default_transaction_read_only: "on" }, completeness: { complete: true, truncated: false, all_exposed_schemas_enumerated: true, unresolved_dimensions: [] }, counts, catalog, generator_binding: { cli_version: "2.107.0", command_sha256: H, linked_config_sha256: H, project_ref: "ekdyopdrrkphlrsilyoo", schema_set: ["public"], output_path: "lib/supabase-database.types.ts", output_sha256: H }, result_binding: { manifest_sha256: binding.manifest_sha256, ordered_results: registry.catalog.dimension_order.map((result_id: string) => ({ result_id, sha256: binding.dimensions[result_id].sha256, row_count: binding.dimensions[result_id].row_count })), aggregate_sha256: binding.aggregate_sha256 } };
}
function sourceEntries(prefix = "20267"): Dynamic[] { return Array.from({ length: 36 }, (_, index) => { const version = `${prefix}${String(index).padStart(9, "0")}`; const name = `m${index}`; return { version, name, path: `supabase/migrations/${version}_${name}.sql`, bytes: index, sha256: index.toString(16).padStart(64, "0"), git_blob: B, statement_count: index % 3 }; }); }
function unboundMigration(): Dynamic {
  const entries = sourceEntries();
  return { contract_version: "trade.action652.migration-history-evidence.v5", authority: { project_ref: "ekdyopdrrkphlrsilyoo", effective_role: "supabase_read_only_user", transaction_read_only: "on" }, completeness: { complete: true, truncated: false, ordered: true, provider_entry_count: 36 }, source_inventory: { commit: "9250c11497f590dd24062181491299422a1eda96", tree: "4ae1fe69d28970498226b850589010148c30d7dc", entry_count: 36, entries }, provider_history: entries.map((_entry, result_ordinal) => ({ result_ordinal, receipt_id: null })), receipt_bindings: [], provider_batch_binding: null };
}
function boundSyntheticMigration(testRegistry: Dynamic): Dynamic {
  const receipts = testRegistry.migration.authorized_provider_receipts;
  const entries = receipts.map((receipt: Dynamic) => ({ version: receipt.version, name: receipt.name, path: `supabase/migrations/${receipt.version}_${receipt.name}.sql`, bytes: receipt.raw_result_bytes, sha256: receipt.source_sql_sha256, git_blob: B, statement_count: receipt.statement_count }));
  return { contract_version: "trade.action652.migration-history-evidence.v5", authority: { project_ref: "ekdyopdrrkphlrsilyoo", effective_role: "supabase_read_only_user", transaction_read_only: "on" }, completeness: { complete: true, truncated: false, ordered: true, provider_entry_count: 36 }, source_inventory: { commit: "9250c11497f590dd24062181491299422a1eda96", tree: "4ae1fe69d28970498226b850589010148c30d7dc", entry_count: 36, entries }, provider_history: receipts.map((receipt: Dynamic) => ({ result_ordinal: receipt.result_ordinal, receipt_id: receipt.receipt_id })).sort((a: Dynamic, b: Dynamic) => a.result_ordinal - b.result_ordinal), receipt_bindings: clone(receipts).sort((a: Dynamic, b: Dynamic) => Buffer.compare(Buffer.from(a.receipt_id), Buffer.from(b.receipt_id))), provider_batch_binding: clone(testRegistry.migration.authorized_provider_batches[0]) };
}

const catalog = catalogFixture(); const unbound = unboundMigration();
check("production registry digest exact", () => productionRegistryDigest === identities.production.sha256);
check("production registry bytes exact", () => validateProductionRegistryBytes(readFileSync(assetUrl("contract-registry-v5.json"))));
check("production runtime deeply frozen", () => productionRuntimeDeepFrozen);
check("snapshot explicitly non-authority", () => snapshot.authority === false && snapshot.role === "non_authority_snapshot");
check("snapshot deeply frozen", () => Object.isFrozen(snapshot) && Object.isFrozen(snapshot.registry) && Object.isFrozen(snapshot.registry.state_machine.states));
check("raw registry not exported", () => !("registry" in contractModule) && !("runtimeRegistry" in contractModule));
check("snapshot mutation cannot alter production", () => { const before = snapshot.registry.state_machine.states.length; try { snapshot.registry.state_machine.states.push("forged"); } catch {} return getRegistrySnapshot().registry.state_machine.states.length === before; });

check("catalog baseline valid", () => validateCatalogEvidence(catalog));
check("manifest hash mutation rejected", () => { const v = clone(catalog); v.result_binding.manifest_sha256 = "f".repeat(64); return !validateCatalogEvidence(v); });
check("content mutation rejected", () => { const v = clone(catalog); v.catalog.columns[0].column_name = "changed"; return !validateCatalogEvidence(v); });
check("aggregate mutation rejected", () => { const v = clone(catalog); v.result_binding.aggregate_sha256 = "f".repeat(64); return !validateCatalogEvidence(v); });
check("numeric 9 10 valid", () => validateCatalogEvidence(catalog));
check("numeric 10 9 invalid", () => { const v = clone(catalog); v.catalog.columns.reverse(); return !validateCatalogEvidence(v); });

check("unbound migration structurally valid", () => validateMigrationEvidence(unbound));
check("unbound provider state explicit unknown", () => deriveMigrationReconciliation(unbound).reconciliation_state === "unknown_provider_history");
check("unbound provider matched zero", () => deriveMigrationReconciliation(unbound).classifications.matched.length === 0);
check("unbound provider divergence zero", () => Object.values(deriveMigrationReconciliation(unbound).classifications).flat().length === 0);
check("unbound ordinals total", () => deriveMigrationReconciliation(unbound).unknown_provider_ordinals.length === 36);

const syntheticBytes = readFileSync(assetUrl("synthetic-test-registry-v5.json"));
const syntheticValidator = createSyntheticNonAuthorityValidator(syntheticBytes, identities.synthetic_test.sha256);
const syntheticRegistry = syntheticValidator.getRegistrySnapshot().registry;
const bound = boundSyntheticMigration(syntheticRegistry);
check("stale receipt protocol field absent", () => !Object.hasOwn(registry.migration, "provider_receipt_protocol"));
check("row receipt protocol v2 registry authority", () => registry.migration.row_receipt_protocol === "trade.action652.provider-receipt.v2");
check("batch receipt protocol registry authority", () => registry.migration.batch_receipt_protocol === "trade.action652.provider-batch-receipt.v1");
check("row schema protocol generated from registry", () => migrationSchema.properties.receipt_bindings.items.properties.protocol.const === registry.migration.row_receipt_protocol);
check("batch schema protocol generated from registry", () => migrationSchema.properties.provider_batch_binding.anyOf[1].properties.protocol.const === registry.migration.batch_receipt_protocol);
check("synthetic row protocols registry exact", () => syntheticRegistry.migration.authorized_provider_receipts.every((receipt: Dynamic) => receipt.protocol === syntheticRegistry.migration.row_receipt_protocol));
check("synthetic batch protocols registry exact", () => syntheticRegistry.migration.authorized_provider_batches.every((receipt: Dynamic) => receipt.protocol === syntheticRegistry.migration.batch_receipt_protocol));
check("synthetic validator explicitly non-authority", () => syntheticValidator.authority === false && syntheticValidator.getRegistrySnapshot().authority === false);
check("synthetic receipt positive path validates", () => syntheticValidator.validateMigrationEvidence(bound));
check("synthetic positive path reconciles", () => syntheticValidator.deriveMigrationReconciliation(bound).reconciliation_state === "reconciled");
check("synthetic positive path all matched", () => syntheticValidator.deriveMigrationReconciliation(bound).classifications.matched.length === 36);
check("synthetic positive path verifies parity", () => syntheticValidator.deriveMigrationReconciliation(bound).byte_parity === "verified_from_trustworthy_provider_hashes");
check("production rejects synthetic receipts", () => !validateMigrationEvidence(bound));
check("legacy v1 row receipt rejected", () => { const v = clone(bound); v.receipt_bindings[0].protocol = "trade.action652.provider-receipt.v1"; return !syntheticValidator.validateMigrationEvidence(v); });
check("unknown row receipt protocol rejected", () => { const v = clone(bound); v.receipt_bindings[0].protocol = "trade.action652.provider-receipt.v999"; return !syntheticValidator.validateMigrationEvidence(v); });
check("mixed row receipt protocols rejected", () => { const v = clone(bound); v.receipt_bindings[1].protocol = "trade.action652.provider-receipt.v1"; return !syntheticValidator.validateMigrationEvidence(v); });
check("batch protocol substitution rejected", () => { const v = clone(bound); v.provider_batch_binding.protocol = "trade.action652.provider-batch-receipt.v2"; return !syntheticValidator.validateMigrationEvidence(v); });
check("row registry schema divergence rejected at construction", () => { const v = JSON.parse(syntheticBytes.toString("utf8")); v.migration.row_receipt_protocol = "trade.action652.provider-receipt.v999"; const bytes = Buffer.from(`${JSON.stringify(v, null, 2)}\n`); try { createSyntheticNonAuthorityValidator(bytes, sha256(bytes)); return false; } catch { return true; } });
check("batch registry schema divergence rejected at construction", () => { const v = JSON.parse(syntheticBytes.toString("utf8")); v.migration.batch_receipt_protocol = "trade.action652.provider-batch-receipt.v999"; const bytes = Buffer.from(`${JSON.stringify(v, null, 2)}\n`); try { createSyntheticNonAuthorityValidator(bytes, sha256(bytes)); return false; } catch { return true; } });

for (const field of ["version", "name", "statement_count", "source_sql_sha256", "project_ref", "statement_id", "statement_sha256", "result_ordinal", "raw_result_sha256", "raw_result_bytes"]) {
  check(`receipt substitution rejected: ${field}`, () => { const v = clone(bound); const receipt = v.receipt_bindings[0]; receipt[field] = typeof receipt[field] === "number" ? receipt[field] + 1 : field === "version" ? "20990101000000" : field === "project_ref" ? "other" : "f".repeat(64); return !syntheticValidator.validateMigrationEvidence(v); });
}
check("receipt extra field rejected", () => { const v = clone(bound); v.receipt_bindings[0].extra = true; return !syntheticValidator.validateMigrationEvidence(v); });
check("provider duplicate receipt rejected", () => { const v = clone(bound); v.provider_history[1].receipt_id = v.provider_history[0].receipt_id; return !syntheticValidator.validateMigrationEvidence(v); });
check("provider ordinal mismatch rejected", () => { const v = clone(bound); v.provider_history[0].result_ordinal = 99; v.provider_history.sort((a: Dynamic, b: Dynamic) => a.result_ordinal - b.result_ordinal); return !syntheticValidator.validateMigrationEvidence(v); });
check("provider omitted row rejected by bound batch", () => { const v = clone(bound); const removed = v.provider_history.pop(); v.receipt_bindings = v.receipt_bindings.filter((receipt: Dynamic) => receipt.receipt_id !== removed.receipt_id); v.completeness.provider_entry_count -= 1; return !syntheticValidator.validateMigrationEvidence(v); });
check("provider omitted row with forged batch rejected", () => { const v = clone(bound); const removed = v.provider_history.pop(); v.receipt_bindings = v.receipt_bindings.filter((receipt: Dynamic) => receipt.receipt_id !== removed.receipt_id); v.completeness.provider_entry_count -= 1; const ids = v.provider_history.map((entry: Dynamic) => entry.receipt_id); v.provider_batch_binding.row_count = ids.length; v.provider_batch_binding.ordered_receipt_ids = ids; v.provider_batch_binding.ordered_receipts_aggregate_sha256 = "f".repeat(64); v.provider_batch_binding.batch_receipt_id = "e".repeat(64); return !syntheticValidator.validateMigrationEvidence(v); });
check("empty provider history stays unknown", () => { const v = clone(unbound); v.provider_history = []; v.completeness.provider_entry_count = 0; const result = deriveMigrationReconciliation(v); return result.ok && result.reconciliation_state === "unknown_provider_history" && Object.values(result.classifications).flat().length === 0; });
check("batch row count substitution rejected", () => { const v = clone(bound); v.provider_batch_binding.row_count -= 1; return !syntheticValidator.validateMigrationEvidence(v); });
check("batch receipt order substitution rejected", () => { const v = clone(bound); v.provider_batch_binding.ordered_receipt_ids.reverse(); return !syntheticValidator.validateMigrationEvidence(v); });
check("batch aggregate substitution rejected", () => { const v = clone(bound); v.provider_batch_binding.ordered_receipts_aggregate_sha256 = "f".repeat(64); return !syntheticValidator.validateMigrationEvidence(v); });
check("batch completeness substitution rejected", () => { const v = clone(bound); v.provider_batch_binding.complete = false; return !syntheticValidator.validateMigrationEvidence(v); });
check("batch truncation substitution rejected", () => { const v = clone(bound); v.provider_batch_binding.truncated = true; return !syntheticValidator.validateMigrationEvidence(v); });

check("exact state machine valid", () => validateExactStateMachine(snapshot.registry.state_machine));
check("extended snapshot not authority", () => { const v = clone(snapshot.registry.state_machine); v.states.push("forged"); return !validateExactStateMachine(v); });
check("removed transition not authority", () => { const v = clone(snapshot.registry.state_machine); v.transitions.pop(); return !validateExactStateMachine(v); });
check("catalog accessor controlled", () => { const v = clone(catalog); let invoked = false; Object.defineProperty(v, "catalog", { enumerable: true, get() { invoked = true; return {}; } }); return !validateCatalogEvidence(v) && !invoked; });
check("migration revoked proxy controlled", () => { const { proxy, revoke } = Proxy.revocable(unbound, {}); revoke(); return !validateMigrationEvidence(proxy); });

const failures = results.filter((entry) => !entry.passed);
console.log(JSON.stringify({ total: results.length, passed: results.length - failures.length, failed: failures.length, uncontrolled_exceptions: uncontrolled, failures: failures.map((entry) => entry.name) }, null, 2));
if (failures.length || uncontrolled) process.exit(1);
