import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666fr-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-catalog-design.md";
const evidencePath = "docs/evidence/action-666fr-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-catalog-design.json";
const modulePath = "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-catalog-design.ts";
const metadataChannelPath = "lib/server/position-version-lineage-v2-writer-deployment-metadata-channel.ts";
const metadataRoutePath = "app/api/position-version-lineage-v2-writer/deployment-metadata/route.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666fr-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-catalog-design.spec.ts";
const evidenceSha256 = "6729036e751055f0e889bd4d187b24970f7044e753aeb6cc053771d1a67ad1e8";

type WitnessCatalogModule = Record<string, unknown>;

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }
function loadModule() {
  const transpiled = ts.transpileModule(source(modulePath), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: modulePath }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as WitnessCatalogModule;
}

test("666FR defines one value-free static witness for each attestation criterion", () => {
  const witnessDesign = loadModule();
  const witnesses = witnessDesign.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CATALOG as ReadonlyArray<Record<string, unknown>>;
  expect(witnessDesign.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CATALOG_DESIGN_VERSION).toBe("position_version_lineage_v2_writer_protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_catalog_design_v1");
  expect(witnesses.map((witness: Record<string, unknown>) => witness.criterionId)).toEqual(["all_schema_prohibited_disclosures_covered", "all_vector_disclosures_explained", "value_free_rejection_only"]);
  expect(witnesses.every((witness: Record<string, unknown>) => witness.valueFree === true && witness.attestationIssued === false)).toBe(true);
  expect(witnessDesign.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CATALOG_DESIGN).toMatchObject({ witnessCatalogDefined: true, attestationIssuanceImplemented: false, attestationVerificationImplemented: false, receiptIssuanceImplemented: false, providerFreeOnly: true, sensitiveFixtureValuesPermitted: false, providerAuthenticationAdmitted: false, providerMetadataReadAdmitted: false, secretManagerMetadataReadAdmitted: false, databaseConnectionAdmitted: false, writerInvocationAdmitted: false, nextBoundedObjective: "protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_integrity_contract_design" });
});

test("666FR binds green exact main and retains the fail-closed boundary", () => {
  const raw = source(evidencePath); const evidence = JSON.parse(raw);
  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({ protected_main_commit: "7bd6df1bd44421390bf96730f95ffb70ff270e54", exact_main_ci_run: 32953369821, exact_main_ci_conclusion: "success", action_666fq_evidence_path: "docs/evidence/action-666fq-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-design.json" });
  expect(evidence.negative_disclosure_coverage_attestation_witness_catalog_design).toMatchObject({ witness_count: 3, attestation_issuance_permitted: false, attestation_verification_permitted: false, receipt_issuance_permitted: false, sensitive_fixture_values_permitted: false });
  expect(evidence.v2_writer_boundary).toMatchObject({ provider_authentication_initiated: false, authentication_token_read: false, provider_project_metadata_read: false, environment_variable_enumeration_performed: false, secret_manager_metadata_read: false, secret_value_accessed: false, metadata_receipt_issued: false, database_connection_opened: false, routine_invoked: false, writer_invoked: false });
  expect(evidence.authority_limits).toMatchObject({ provider_authentication_admitted: false, provider_metadata_read_admitted: false, secret_manager_metadata_read_admitted: false, credential_read_admitted: false, attestation_issuance_admitted: false, attestation_verification_admitted: false, receipt_issuance_admitted: false, transport_implementation_admitted: false, database_connection_admitted: false, writer_invocation_admitted: false, production_deployment_admitted: false });
});

test("666FR remains static and is registered in provider-free CI", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n"); const moduleSource = source(modulePath); const registration = JSON.parse(source(registrationPath)) as string[];
  expect(existsSync(resolve(root, metadataChannelPath))).toBe(false); expect(existsSync(resolve(root, metadataRoutePath))).toBe(false);
  expect(moduleSource).not.toMatch(/\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|login|provision|rotate)\s*\(/);
  expect(moduleSource).not.toMatch(/process\.env|Netlify\.env|from\s+['"](?:pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/);
  expect(documentation).toMatch(/fail-closed/i); expect(source(roadmapPath)).toMatch(/action 666fr/i); expect(source(ledgerPath)).toMatch(/action 666fr/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]); expect(new Set(registration).size).toBe(registration.length); expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
