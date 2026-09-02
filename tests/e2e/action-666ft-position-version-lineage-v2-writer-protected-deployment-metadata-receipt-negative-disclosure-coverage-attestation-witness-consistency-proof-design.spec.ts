import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ft-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-design.md";
const evidencePath =
  "docs/evidence/action-666ft-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-design.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-design.ts";
const metadataChannelPath =
  "lib/server/position-version-lineage-v2-writer-deployment-metadata-channel.ts";
const metadataRoutePath =
  "app/api/position-version-lineage-v2-writer/deployment-metadata/route.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ft-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-consistency-proof-design.spec.ts";
const evidenceSha256 = "46da22ccd01150e2b6a880cd7ce1656edb67ad385cc46e546359bef6879bcb80";

type ConsistencyProofModule = Record<string, unknown>;

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
  return sandbox.exports as ConsistencyProofModule;
}

test("666FT declares one static value-free witness-consistency proof shape", () => {
  const proofDesign = loadModule();
  const requirements = proofDesign.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CONSISTENCY_PROOF_REQUIREMENTS as Record<string, unknown>;

  expect(
    proofDesign.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CONSISTENCY_PROOF_DESIGN_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_consistency_proof_design_v1",
  );
  expect(requirements).toEqual({
    proofId: "witness_identifier_criterion_class_bijection",
    expectedWitnessCount: 3,
    uniqueWitnessIdsRequired: true,
    exactCriterionCoverageRequired: true,
    exactWitnessClassBindingRequired: true,
    valueFreeWitnessesRequired: true,
    attestationIssuedRequired: false,
    proofExecutionImplemented: false,
  });
  expect(
    proofDesign.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_WITNESS_CONSISTENCY_PROOF_DESIGN,
  ).toMatchObject({
    consistencyProofDesignDefined: true,
    proofExecutionImplemented: false,
    automatedIntegrityVerificationImplemented: false,
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
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_consistency_proof_admission_review",
  });
});

test("666FT binds the exact green predecessor and preserves closed authority", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "389b5a8972408d5b80409a8a46d9d91fed2daecf",
    protected_main_tree: "d4a76b7479aac7cd8ebebda92611078af4525193",
    exact_main_ci_run: 32967995487,
    exact_main_ci_conclusion: "success",
    action_666fs_evidence_path:
      "docs/evidence/action-666fs-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-witness-integrity-contract-design.json",
  });
  expect(
    evidence.negative_disclosure_coverage_attestation_witness_consistency_proof_design,
  ).toMatchObject({
    proof_id: "witness_identifier_criterion_class_bijection",
    expected_witness_count: 3,
    witness_id_uniqueness_required: true,
    criterion_coverage_exact_required: true,
    witness_class_binding_exact_required: true,
    value_free_witnesses_required: true,
    attestation_issued_required: false,
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

test("666FT remains static and is registered in provider-free CI", () => {
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
  expect(source(roadmapPath)).toMatch(/action 666ft/i);
  expect(source(ledgerPath)).toMatch(/action 666ft/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
