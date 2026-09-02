import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fs-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-integrity-contract-design.md";
const evidencePath =
  "docs/evidence/action-666fs-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-integrity-contract-design.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-integrity-contract-design.ts";
const metadataChannelPath =
  "lib/server/position-version-lineage-v2-writer-deployment-metadata-channel.ts";
const metadataRoutePath =
  "app/api/position-version-lineage-v2-writer/deployment-metadata/route.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fs-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-integrity-contract-design.spec.ts";
const evidenceSha256 = "26f7c72748312cc2a8a3c437f5cfd36d8c9bebe62b18df89694dd37c39e7199f";

type IntegrityContractModule = Record<string, unknown>;

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function loadModule() {
  const transpiled = ts.transpileModule(source(modulePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: modulePath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as IntegrityContractModule;
}

test("666FS declares exact static integrity requirements for all witnesses", () => {
  const integrityContract = loadModule();
  const requirements = integrityContract.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_INTEGRITY_REQUIREMENTS as ReadonlyArray<Record<string, unknown>>;

  expect(
    integrityContract.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_INTEGRITY_CONTRACT_DESIGN_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_integrity_contract_design_v1",
  );
  expect(requirements.map((requirement) => requirement.witnessId)).toEqual([
    "schema_prohibited_disclosure_coverage_classification",
    "vector_disclosure_explanation_classification",
    "value_free_rejection_boundary_classification",
  ]);
  expect(requirements.map((requirement) => requirement.criterionId)).toEqual([
    "all_schema_prohibited_disclosures_covered",
    "all_vector_disclosures_explained",
    "value_free_rejection_only",
  ]);
  expect(
    requirements.every(
      (requirement) =>
        requirement.valueFreeRequired === true &&
        requirement.attestationIssuedRequired === false,
    ),
  ).toBe(true);
  expect(
    integrityContract.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_INTEGRITY_CONTRACT_DESIGN,
  ).toMatchObject({
    integrityContractDefined: true,
    automatedIntegrityVerificationImplemented: false,
    witnessIdUniquenessRequired: true,
    criterionCoverageExactRequired: true,
    witnessClassBindingExactRequired: true,
    providerFreeOnly: true,
    sensitiveFixtureValuesPermitted: false,
    attestationIssuanceImplemented: false,
    attestationVerificationImplemented: false,
    receiptIssuanceImplemented: false,
    providerAuthenticationAdmitted: false,
    providerMetadataReadAdmitted: false,
    secretManagerMetadataReadAdmitted: false,
    databaseConnectionAdmitted: false,
    writerInvocationAdmitted: false,
    nextBoundedObjective:
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_consistency_proof_design",
  });
});

test("666FS binds the exact green predecessor and preserves closed authority", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "e1bdb043e9466c32f4c4c8d61aa1e145cf97352c",
    exact_main_ci_run: 32960673526,
    exact_main_ci_conclusion: "success",
    action_666fr_evidence_path:
      "docs/evidence/action-666fr-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-catalog-design.json",
  });
  expect(
    evidence.negative_disclosure_coverage_attestation_witness_integrity_contract_design,
  ).toMatchObject({
    witness_count: 3,
    witness_id_uniqueness_required: true,
    criterion_coverage_exact_required: true,
    witness_class_binding_exact_required: true,
    value_free_required: true,
    attestation_issued_required: false,
    automated_integrity_verification_permitted: false,
    attestation_issuance_permitted: false,
    attestation_verification_permitted: false,
    receipt_issuance_permitted: false,
    sensitive_fixture_values_permitted: false,
  });
  expect(evidence.v2_writer_boundary).toMatchObject({
    provider_authentication_initiated: false,
    authentication_token_read: false,
    provider_project_metadata_read: false,
    environment_variable_enumeration_performed: false,
    secret_manager_metadata_read: false,
    secret_value_accessed: false,
    metadata_receipt_issued: false,
    database_connection_opened: false,
    routine_invoked: false,
    writer_invoked: false,
  });
  expect(evidence.authority_limits).toMatchObject({
    provider_authentication_admitted: false,
    provider_metadata_read_admitted: false,
    secret_manager_metadata_read_admitted: false,
    credential_read_admitted: false,
    automated_integrity_verification_admitted: false,
    attestation_issuance_admitted: false,
    attestation_verification_admitted: false,
    receipt_issuance_admitted: false,
    transport_implementation_admitted: false,
    database_connection_admitted: false,
    writer_invocation_admitted: false,
    production_deployment_admitted: false,
  });
});

test("666FS remains static and is registered in provider-free CI", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const moduleSource = source(modulePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, metadataChannelPath))).toBe(false);
  expect(existsSync(resolve(root, metadataRoutePath))).toBe(false);
  expect(moduleSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|login|provision|rotate)\s*\(/,
  );
  expect(moduleSource).not.toMatch(
    /process\.env|Netlify\.env|from\s+['"](?:pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
  expect(documentation).toMatch(/fail-closed/i);
  expect(source(roadmapPath)).toMatch(/action 666fs/i);
  expect(source(ledgerPath)).toMatch(/action 666fs/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
