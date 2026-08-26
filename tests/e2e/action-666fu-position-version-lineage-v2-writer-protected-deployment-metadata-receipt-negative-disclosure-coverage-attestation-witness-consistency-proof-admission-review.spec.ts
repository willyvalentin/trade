import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fu-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-admission-review.md";
const evidencePath =
  "docs/evidence/action-666fu-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-admission-review.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-admission-review.ts";
const metadataChannelPath =
  "lib/server/position-version-lineage-v2-writer-deployment-metadata-channel.ts";
const metadataRoutePath =
  "app/api/position-version-lineage-v2-writer/deployment-metadata/route.ts";
const plannedTransportPath =
  "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fu-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-admission-review.spec.ts";
const evidenceSha256 = "dcd6200bae0da72ce3f7894e60bae1b4ae2e84959958f339325a3e309351584f";

type AdmissionReviewModule = Record<string, unknown>;

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
  return sandbox.exports as AdmissionReviewModule;
}

test("666FU keeps witness-consistency-proof execution unadmitted", () => {
  const review = loadModule();
  const requirements = review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CONSISTENCY_PROOF_ADMISSION_REQUIREMENTS;

  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CONSISTENCY_PROOF_ADMISSION_REVIEW_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_consistency_proof_admission_review_v1",
  );
  expect(requirements).toEqual([
    "independent_proof_source_contract",
    "value_free_witness_input_contract",
    "deterministic_proof_result_contract",
    "independent_proof_oracle",
    "non_issuance_boundary_reconfirmation",
  ]);
  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CONSISTENCY_PROOF_ADMISSION_REVIEW,
  ).toMatchObject({
    admissionReviewDefined: true,
    allAdmissionRequirementsSatisfied: false,
    proofExecutionAdmitted: false,
    automatedIntegrityVerificationAdmitted: false,
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
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_consistency_proof_source_contract_design",
  });
});

test("666FU binds the exact green predecessor and preserves closed authority", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "36e5df322638f8a690059f23b9d5869b13165300",
    protected_main_tree: "cf95a9d45a9b7e241300551c6e48221515c873ee",
    exact_main_ci_run: 33013935616,
    exact_main_ci_conclusion: "success",
    action_666ft_evidence_path:
      "docs/evidence/action-666ft-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-design.json",
  });
  expect(
    evidence.negative_disclosure_coverage_attestation_witness_consistency_proof_admission_review,
  ).toMatchObject({
    all_admission_requirements_satisfied: false,
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

test("666FU remains static and is registered in provider-free CI", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const moduleSource = source(modulePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, metadataChannelPath))).toBe(false);
  expect(existsSync(resolve(root, metadataRoutePath))).toBe(false);
  expect(existsSync(resolve(root, plannedTransportPath))).toBe(false);
  expect(moduleSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|login|provision|rotate)\s*\(/,
  );
  expect(moduleSource).not.toMatch(
    /process\.env|Netlify\.env|from\s+['"](?:pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
  expect(documentation).toMatch(/fail-closed/i);
  expect(source(roadmapPath)).toMatch(/action 666fu/i);
  expect(source(ledgerPath)).toMatch(/action 666fu/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
