import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fq-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-design.md";
const evidencePath =
  "docs/evidence/action-666fq-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-design.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-design.ts";
const reconciliationModulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-reconciliation.ts";
const metadataChannelPath =
  "lib/server/position-version-lineage-v2-writer-deployment-metadata-channel.ts";
const metadataRoutePath =
  "app/api/position-version-lineage-v2-writer/deployment-metadata/route.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fq-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-attestation-design.spec.ts";
const evidenceSha256 = "15f5482b1e7cdca47e04f9f239bc40033052972be5dcd93aca3aa64ec203851b";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function loadReconciliationModule() {
  const transpiled = ts.transpileModule(source(reconciliationModulePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: reconciliationModulePath,
  }).outputText;
  const schema = transpileStaticModule(
    "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-schema-and-negative-disclosure-contract.ts",
  );
  const vectors = transpileStaticModule(
    "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-test-vectors.ts",
  );
  const sandbox = {
    exports: {} as Record<string, unknown>,
    require(request: string) {
      if (request.endsWith("metadata-receipt-schema-and-negative-disclosure-contract")) {
        return schema;
      }
      if (request.endsWith("metadata-receipt-negative-disclosure-test-vectors")) {
        return vectors;
      }
      throw new Error(`Unexpected reconciliation dependency: ${request}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: reconciliationModulePath });
  return sandbox.exports as Record<string, unknown>;
}

function transpileStaticModule(relativePath: string) {
  const transpiled = ts.transpileModule(source(relativePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: relativePath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: relativePath });
  return sandbox.exports as Record<string, unknown>;
}

function loadAttestationModule() {
  const reconciliation = loadReconciliationModule();
  const transpiled = ts.transpileModule(source(modulePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: modulePath,
  }).outputText;
  const sandbox = {
    exports: {} as Record<string, unknown>,
    require(request: string) {
      if (request.endsWith("metadata-receipt-negative-disclosure-coverage-reconciliation")) {
        return reconciliation;
      }
      throw new Error(`Unexpected attestation-design dependency: ${request}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as {
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_DESIGN_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_CRITERIA: readonly Record<string, unknown>[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_DESIGN: Record<string, unknown>;
  };
}

test("666FQ defines only static coverage-attestation criteria", () => {
  const attestation = loadAttestationModule();
  const criteria = [
    {
      criterionId: "all_schema_prohibited_disclosures_covered",
      expected: true,
      observed: true,
    },
    {
      criterionId: "all_vector_disclosures_explained",
      expected: true,
      observed: true,
    },
    {
      criterionId: "value_free_rejection_only",
      expected: true,
      observed: true,
    },
  ];

  expect(
    attestation.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_DESIGN_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_design_v1",
  );
  expect(
    attestation.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_CRITERIA,
  ).toEqual(criteria);
  expect(
    attestation.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_DESIGN,
  ).toMatchObject({
    coverageAttestationCriteriaDefined: true,
    attestationIssuanceImplemented: false,
    receiptIssuanceImplemented: false,
    criteriaSatisfied: true,
    providerFreeOnly: true,
    sensitiveFixtureValuesPermitted: false,
    providerAuthenticationAdmitted: false,
    providerMetadataReadAdmitted: false,
    secretManagerMetadataReadAdmitted: false,
    databaseConnectionAdmitted: false,
    writerInvocationAdmitted: false,
    nextBoundedObjective:
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_catalog_design",
  });
  expect(
    Object.isFrozen(
      attestation.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_DESIGN,
    ),
  ).toBe(true);
});

test("666FQ binds green exact main and records only static attestation criteria", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "7668d35448d3299a3ba01f225e7409746242486c",
    exact_main_ci_run: 32947118747,
    exact_main_ci_conclusion: "success",
    action_666fp_evidence_path:
      "docs/evidence/action-666fp-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-reconciliation.json",
  });
  expect(evidence.negative_disclosure_coverage_attestation_design).toMatchObject({
    attestation_issuance_permitted: false,
    receipt_issuance_permitted: false,
    sensitive_fixture_values_permitted: false,
    criteria_satisfied: true,
  });
  expect(evidence.negative_disclosure_coverage_attestation_design.criteria_ids).toEqual([
    "all_schema_prohibited_disclosures_covered",
    "all_vector_disclosures_explained",
    "value_free_rejection_only",
  ]);
  expect(evidence.v2_writer_boundary).toMatchObject({
    provider_authentication_initiated: false,
    authentication_token_read: false,
    provider_project_metadata_read: false,
    environment_variable_enumeration_performed: false,
    environment_export_performed: false,
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
    sensitive_fixture_admitted: false,
    attestation_issuance_admitted: false,
    receipt_issuance_admitted: false,
    transport_implementation_admitted: false,
    database_connection_admitted: false,
    writer_invocation_admitted: false,
    production_deployment_admitted: false,
  });
  expect(evidence.decision).toMatchObject({
    runtime_activation_authorized: false,
    next_bounded_objective:
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_catalog_design",
  });
});

test("666FQ stays static, value-free and registered in provider-free CI", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const attestationSource = source(modulePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, metadataChannelPath))).toBe(false);
  expect(existsSync(resolve(root, metadataRoutePath))).toBe(false);
  expect(attestationSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|login|provision|rotate)\s*\(/,
  );
  expect(attestationSource).not.toMatch(
    /process\.env|Netlify\.env|from\s+['"](?:pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fq/i);
  expect(source(ledgerPath)).toMatch(/action 666fq/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
