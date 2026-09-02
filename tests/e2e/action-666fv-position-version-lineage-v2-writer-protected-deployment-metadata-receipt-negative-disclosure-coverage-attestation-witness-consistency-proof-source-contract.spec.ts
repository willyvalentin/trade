import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fv-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-source-contract.md";
const evidencePath =
  "docs/evidence/action-666fv-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-source-contract.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-source-contract.ts";
const metadataChannelPath =
  "lib/server/position-version-lineage-v2-writer-deployment-metadata-channel.ts";
const metadataRoutePath =
  "app/api/position-version-lineage-v2-writer/deployment-metadata/route.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fv-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-source-contract.spec.ts";
const evidenceSha256 = "3e2fc8c2b6f248f7b330111eeb6da9077227efbdfa88715fbd2c0861396c0ec0";

type SourceContractModule = Record<string, unknown>;

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
  return sandbox.exports as SourceContractModule;
}

test("666FV defines an independent proof-source contract without selecting a source", () => {
  const contract = loadModule();
  const requirements = contract.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CONSISTENCY_PROOF_SOURCE_REQUIREMENTS;

  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CONSISTENCY_PROOF_SOURCE_CONTRACT_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_consistency_proof_source_contract_v1",
  );
  expect(requirements).toEqual([
    "immutable_source_revision",
    "source_artifact_integrity_digest",
    "source_provenance_binding",
    "independent_source_authority",
    "source_value_redaction",
    "source_contract_only_non_execution",
  ]);
  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CONSISTENCY_PROOF_SOURCE_CONTRACT,
  ).toMatchObject({
    sourceContractDefined: true,
    independentProofSourceRequired: true,
    concreteProofSourceSelected: false,
    concreteSourceArtifactRead: false,
    immutableSourceRevisionRequired: true,
    sourceArtifactDigestRequired: true,
    sourceProvenanceBindingRequired: true,
    independentSourceAuthorityRequired: true,
    sourceValueRedactionRequired: true,
    sourceContractValidated: false,
    proofExecutionAdmitted: false,
    automatedIntegrityVerificationAdmitted: false,
    attestationIssuanceImplemented: false,
    attestationVerificationImplemented: false,
    receiptIssuanceImplemented: false,
    providerAuthenticationAdmitted: false,
    providerMetadataReadAdmitted: false,
    secretManagerMetadataReadAdmitted: false,
    databaseConnectionAdmitted: false,
    writerInvocationAdmitted: false,
    nextBoundedObjective:
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_consistency_proof_value_free_witness_input_contract_design",
  });
});

test("666FV binds the exact green predecessor and retains every runtime boundary", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "cc47571ab6959959e1ebfaab7133754f41d6ae7c",
    protected_main_tree: "3a807e042371881c871d5defe541228162e2fdc5",
    exact_main_ci_run: 33020225505,
    exact_main_ci_conclusion: "success",
    action_666fu_evidence_path:
      "docs/evidence/action-666fu-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-admission-review.json",
  });
  expect(
    evidence.negative_disclosure_coverage_attestation_witness_consistency_proof_source_contract,
  ).toMatchObject({
    independent_proof_source_required: true,
    concrete_proof_source_selected: false,
    concrete_source_artifact_read: false,
    source_contract_validated: false,
    proof_execution_permitted: false,
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
    source_artifact_read: false,
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
    source_artifact_read_admitted: false,
    source_validation_admitted: false,
    proof_execution_admitted: false,
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

test("666FV remains static and is registered in provider-free CI", () => {
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
  expect(source(roadmapPath)).toMatch(/action 666fv/i);
  expect(source(ledgerPath)).toMatch(/action 666fv/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
