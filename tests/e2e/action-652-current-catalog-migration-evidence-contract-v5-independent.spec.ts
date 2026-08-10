import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
// The runtime contract validates all untrusted JSON before these oracle-only dynamic values are used.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dynamic = any;
const candidate: Dynamic = await import(new URL("../../lib/server/action-652-current-catalog-migration-evidence-contract-v5.mts", import.meta.url).href);

const assets = new URL("../../docs/evidence/action-652-current-catalog-migration-contract-v5/", import.meta.url);
const sourceUrl = new URL("../../lib/server/action-652-current-catalog-migration-evidence-contract-v5.mts", import.meta.url);
const assetUrl = (name: string) => new URL(name, assets);
const identities = JSON.parse(readFileSync(assetUrl("registry-identities.json"), "utf8"));
const source = readFileSync(sourceUrl, "utf8");
const migrationSchema = JSON.parse(readFileSync(assetUrl("migration-structural-schema-v5.json"), "utf8"));
const sha256 = (bytes: Buffer | string) => createHash("sha256").update(bytes).digest("hex");
const clone = (value: Dynamic): Dynamic => structuredClone(value);
const results: Array<{ name: string; passed: boolean }> = [];
let uncontrolled = 0;
function assert(name: string, operation: () => boolean) {
  let passed = false;
  try { passed = operation() === true; } catch { uncontrolled += 1; }
  results.push({ name, passed });
}

const syntheticBytes = readFileSync(assetUrl("synthetic-test-registry-v5.json"));
const synthetic = candidate.createSyntheticNonAuthorityValidator(syntheticBytes, identities.synthetic_test.sha256);
const registry = synthetic.getRegistrySnapshot().registry;
const receipts = clone(registry.migration.authorized_provider_receipts);
const batch = clone(registry.migration.authorized_provider_batches[0]);
const BLOB = "b".repeat(40);
function boundEvidence(): Dynamic {
  const entries = receipts.map((receipt: Dynamic) => ({
    version: receipt.version,
    name: receipt.name,
    path: `supabase/migrations/${receipt.version}_${receipt.name}.sql`,
    bytes: receipt.raw_result_bytes,
    sha256: receipt.source_sql_sha256,
    git_blob: BLOB,
    statement_count: receipt.statement_count
  }));
  return {
    contract_version: "trade.action652.migration-history-evidence.v5",
    authority: { project_ref: "ekdyopdrrkphlrsilyoo", effective_role: "supabase_read_only_user", transaction_read_only: "on" },
    completeness: { complete: true, truncated: false, ordered: true, provider_entry_count: receipts.length },
    source_inventory: { commit: "9250c11497f590dd24062181491299422a1eda96", tree: "4ae1fe69d28970498226b850589010148c30d7dc", entry_count: 36, entries },
    provider_history: receipts.map((receipt: Dynamic) => ({ result_ordinal: receipt.result_ordinal, receipt_id: receipt.receipt_id })),
    receipt_bindings: clone(receipts).sort((left: Dynamic, right: Dynamic) => Buffer.compare(Buffer.from(left.receipt_id), Buffer.from(right.receipt_id))),
    provider_batch_binding: clone(batch)
  };
}
function unboundEvidence(providerCount = 36): Dynamic {
  const value = boundEvidence();
  value.provider_history = Array.from({ length: providerCount }, (_, result_ordinal) => ({ result_ordinal, receipt_id: null }));
  value.receipt_bindings = [];
  value.provider_batch_binding = null;
  value.completeness.provider_entry_count = providerCount;
  return value;
}

assert("production digest is embedded literal", () => source.includes(`const EXPECTED_PRODUCTION_REGISTRY_SHA256 = "${identities.production.sha256}"`));
assert("production digest matches registry bytes", () => sha256(readFileSync(assetUrl("contract-registry-v5.json"))) === candidate.productionRegistryDigest);
assert("no production registry export", () => !("registry" in candidate) && !("runtimeRegistry" in candidate));
assert("production runtime recursively frozen", () => candidate.productionRuntimeDeepFrozen === true);
assert("snapshot wrapper is non-authority", () => { const snapshot = candidate.getRegistrySnapshot(); return snapshot.authority === false && snapshot.role === "non_authority_snapshot"; });
assert("snapshot cannot mutate runtime authority", () => { const snapshot = candidate.getRegistrySnapshot(); const before = candidate.getRegistrySnapshot().registry.migration.classification_precedence.join("|"); try { snapshot.registry.migration.classification_precedence.reverse(); } catch {} return candidate.getRegistrySnapshot().registry.migration.classification_precedence.join("|") === before; });
assert("synthetic validator cannot claim authority", () => synthetic.authority === false && synthetic.getRegistrySnapshot().authority === false);
assert("production rejects synthetic registry bytes", () => !candidate.validateProductionRegistryBytes(syntheticBytes));
assert("legacy protocol authority field absent", () => !Object.hasOwn(registry.migration, "provider_receipt_protocol"));
assert("row receipt protocol registry exact", () => registry.migration.row_receipt_protocol === "trade.action652.provider-receipt.v2");
assert("batch receipt protocol registry exact", () => registry.migration.batch_receipt_protocol === "trade.action652.provider-batch-receipt.v1");
assert("row structural protocol derived from registry", () => migrationSchema.properties.receipt_bindings.items.properties.protocol.const === registry.migration.row_receipt_protocol);
assert("batch structural protocol derived from registry", () => migrationSchema.properties.provider_batch_binding.anyOf[1].properties.protocol.const === registry.migration.batch_receipt_protocol);
assert("all synthetic row receipts use registry protocol", () => registry.migration.authorized_provider_receipts.every((receipt: Dynamic) => receipt.protocol === registry.migration.row_receipt_protocol));
assert("all synthetic batches use registry protocol", () => registry.migration.authorized_provider_batches.every((receipt: Dynamic) => receipt.protocol === registry.migration.batch_receipt_protocol));
assert("synthetic exact batch validates", () => synthetic.validateMigrationEvidence(boundEvidence()));
assert("synthetic exact batch reconciles", () => synthetic.deriveMigrationReconciliation(boundEvidence()).classifications.matched.length === 36);
assert("production rejects synthetic receipt set", () => !candidate.validateMigrationEvidence(boundEvidence()));

assert("unbound full history is unknown", () => synthetic.deriveMigrationReconciliation(unboundEvidence()).reconciliation_state === "unknown_provider_history");
assert("unbound empty history is unknown", () => { const result = synthetic.deriveMigrationReconciliation(unboundEvidence(0)); return result.ok && result.reconciliation_state === "unknown_provider_history" && Object.values(result.classifications).flat().length === 0; });
assert("unbound history cannot include receipt", () => { const value = unboundEvidence(); value.provider_history[0].receipt_id = receipts[0].receipt_id; value.receipt_bindings.push(clone(receipts[0])); return !synthetic.validateMigrationEvidence(value); });
assert("bound batch cannot include null receipt", () => { const value = boundEvidence(); value.provider_history[0].receipt_id = null; return !synthetic.validateMigrationEvidence(value); });
assert("omitted provider row rejected", () => { const value = boundEvidence(); const omitted = value.provider_history.pop(); value.receipt_bindings = value.receipt_bindings.filter((receipt: Dynamic) => receipt.receipt_id !== omitted.receipt_id); value.completeness.provider_entry_count -= 1; return !synthetic.validateMigrationEvidence(value); });
assert("omitted source receipt rejected", () => { const value = boundEvidence(); value.receipt_bindings.pop(); return !synthetic.validateMigrationEvidence(value); });
assert("reordered provider results rejected", () => { const value = boundEvidence(); [value.provider_history[0], value.provider_history[1]] = [value.provider_history[1], value.provider_history[0]]; return !synthetic.validateMigrationEvidence(value); });
assert("batch receipt id substitution rejected", () => { const value = boundEvidence(); value.provider_batch_binding.batch_receipt_id = "f".repeat(64); return !synthetic.validateMigrationEvidence(value); });
assert("batch row count substitution rejected", () => { const value = boundEvidence(); value.provider_batch_binding.row_count = 35; return !synthetic.validateMigrationEvidence(value); });
assert("batch ordered set substitution rejected", () => { const value = boundEvidence(); value.provider_batch_binding.ordered_receipt_ids.pop(); return !synthetic.validateMigrationEvidence(value); });
assert("batch aggregate substitution rejected", () => { const value = boundEvidence(); value.provider_batch_binding.ordered_receipts_aggregate_sha256 = "f".repeat(64); return !synthetic.validateMigrationEvidence(value); });
assert("batch complete false rejected", () => { const value = boundEvidence(); value.provider_batch_binding.complete = false; return !synthetic.validateMigrationEvidence(value); });
assert("batch truncated true rejected", () => { const value = boundEvidence(); value.provider_batch_binding.truncated = true; return !synthetic.validateMigrationEvidence(value); });
assert("batch extra field rejected", () => { const value = boundEvidence(); value.provider_batch_binding.extra = true; return !synthetic.validateMigrationEvidence(value); });
assert("legacy v1 row receipt rejected", () => { const value = boundEvidence(); value.receipt_bindings[0].protocol = "trade.action652.provider-receipt.v1"; return !synthetic.validateMigrationEvidence(value); });
assert("unknown row receipt protocol rejected", () => { const value = boundEvidence(); value.receipt_bindings[0].protocol = "trade.action652.provider-receipt.v999"; return !synthetic.validateMigrationEvidence(value); });
assert("mixed row receipt protocols rejected", () => { const value = boundEvidence(); value.receipt_bindings[1].protocol = "trade.action652.provider-receipt.v1"; return !synthetic.validateMigrationEvidence(value); });
assert("unknown batch receipt protocol rejected", () => { const value = boundEvidence(); value.provider_batch_binding.protocol = "trade.action652.provider-batch-receipt.v999"; return !synthetic.validateMigrationEvidence(value); });
assert("row registry divergence rejected before validation", () => { const value = JSON.parse(syntheticBytes.toString("utf8")); value.migration.row_receipt_protocol = "trade.action652.provider-receipt.v999"; const bytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`); try { candidate.createSyntheticNonAuthorityValidator(bytes, sha256(bytes)); return false; } catch { return true; } });
assert("batch registry divergence rejected before validation", () => { const value = JSON.parse(syntheticBytes.toString("utf8")); value.migration.batch_receipt_protocol = "trade.action652.provider-batch-receipt.v999"; const bytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`); try { candidate.createSyntheticNonAuthorityValidator(bytes, sha256(bytes)); return false; } catch { return true; } });
assert("row allowlist protocol divergence rejected before validation", () => { const value = JSON.parse(syntheticBytes.toString("utf8")); value.migration.authorized_provider_receipts[0].protocol = "trade.action652.provider-receipt.v1"; const bytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`); try { candidate.createSyntheticNonAuthorityValidator(bytes, sha256(bytes)); return false; } catch { return true; } });
assert("batch allowlist protocol divergence rejected before validation", () => { const value = JSON.parse(syntheticBytes.toString("utf8")); value.migration.authorized_provider_batches[0].protocol = "trade.action652.provider-batch-receipt.v999"; const bytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`); try { candidate.createSyntheticNonAuthorityValidator(bytes, sha256(bytes)); return false; } catch { return true; } });

for (const field of ["version", "name", "statement_count", "source_sql_sha256", "project_ref", "statement_id", "statement_sha256", "result_ordinal", "raw_result_sha256", "raw_result_bytes"]) {
  assert(`independent receipt field substitution rejected: ${field}`, () => {
    const value = boundEvidence();
    const receipt = value.receipt_bindings[0];
    receipt[field] = typeof receipt[field] === "number" ? receipt[field] + 1 : field === "version" ? "20990101000000" : field === "project_ref" ? "other-project" : `mutated-${field}`;
    return !synthetic.validateMigrationEvidence(value);
  });
}

assert("cyclic migration rejected without throw", () => { const value = unboundEvidence(); value.loop = value; return !candidate.validateMigrationEvidence(value); });
assert("accessor migration rejected without invocation", () => { const value = unboundEvidence(); let invoked = false; Object.defineProperty(value, "provider_history", { enumerable: true, get() { invoked = true; return []; } }); return !candidate.validateMigrationEvidence(value) && !invoked; });
assert("revoked proxy migration rejected", () => { const pair = Proxy.revocable(unboundEvidence(), {}); pair.revoke(); return !candidate.validateMigrationEvidence(pair.proxy); });
assert("prototype-derived receipt rejected", () => { const value = boundEvidence(); value.receipt_bindings[0] = Object.create(value.receipt_bindings[0]); return !synthetic.validateMigrationEvidence(value); });
assert("unsafe integer receipt bytes rejected", () => { const value = boundEvidence(); value.receipt_bindings[0].raw_result_bytes = Number.MAX_SAFE_INTEGER + 1; return !synthetic.validateMigrationEvidence(value); });
assert("state machine extension rejected", () => { const machine = clone(candidate.getRegistrySnapshot().registry.state_machine); machine.states.push("forged"); return !candidate.validateExactStateMachine(machine); });

const failures = results.filter((entry) => !entry.passed);
console.log(JSON.stringify({ total: results.length, passed: results.length - failures.length, failed: failures.length, uncontrolled_exceptions: uncontrolled, failures: failures.map((entry) => entry.name) }, null, 2));
if (failures.length || uncontrolled) process.exit(1);
