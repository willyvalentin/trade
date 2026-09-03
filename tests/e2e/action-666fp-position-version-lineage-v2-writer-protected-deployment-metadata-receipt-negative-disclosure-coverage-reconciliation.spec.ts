import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fp-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-reconciliation.md";
const evidencePath =
  "docs/evidence/action-666fp-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-reconciliation.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-reconciliation.ts";
const schemaModulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-schema-and-negative-disclosure-contract.ts";
const vectorModulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-test-vectors.ts";
const metadataChannelPath =
  "lib/server/position-version-lineage-v2-writer-deployment-metadata-channel.ts";
const metadataRoutePath =
  "app/api/position-version-lineage-v2-writer/deployment-metadata/route.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fp-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-reconciliation.spec.ts";
const evidenceSha256 = "a5b95afa44a1f0f55a4435a7f0022b34ae1dcaa7bee22f85f850e2476ca2366c";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function loadStaticModule(relativePath: string) {
  const transpiled = ts.transpileModule(source(relativePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: relativePath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: relativePath });
  return sandbox.exports as Record<string, unknown>;
}

function loadReconciliationModule() {
  const schema = loadStaticModule(schemaModulePath);
  const vectors = loadStaticModule(vectorModulePath);
  const transpiled = ts.transpileModule(source(modulePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: modulePath,
  }).outputText;
  const sandbox = {
    exports: {} as Record<string, unknown>,
    require(request: string) {
      if (request.endsWith("metadata-receipt-schema-and-negative-disclosure-contract")) {
        return schema;
      }
      if (request.endsWith("metadata-receipt-negative-disclosure-test-vectors")) {
        return vectors;
      }
      throw new Error(`Unexpected static reconciliation dependency: ${request}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as {
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_RECONCILIATION_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_REQUIRED_SCHEMA_VECTOR_COVERAGE: readonly Record<string, unknown>[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_ADDITIONAL_REQUIRED_NEGATIVE_DISCLOSURES: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_RECONCILIATION: Record<string, unknown>;
  };
}

test("666FP reconciles every schema denial with a value-free rejection vector", () => {
  const reconciliation = loadReconciliationModule();
  const schemaProhibitedDisclosures = [
    "secret_value",
    "raw_secret_metadata",
    "raw_secret_name",
    "provider_project_identifier",
    "authentication_token",
    "environment_variable_set",
    "connection_string",
    "database_result",
  ];
  const additionalRequiredNegativeDisclosures = [
    "actor_identity",
    "exact_named_secret_reference",
  ];
  const vectorDisclosures = [
    ...schemaProhibitedDisclosures,
    ...additionalRequiredNegativeDisclosures,
  ];

  expect(
    reconciliation.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_RECONCILIATION_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_negative_disclosure_coverage_reconciliation_v1",
  );
  expect(
    reconciliation.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_REQUIRED_SCHEMA_VECTOR_COVERAGE,
  ).toEqual(
    schemaProhibitedDisclosures.map((schemaProhibitedDisclosure) => ({
      schemaProhibitedDisclosure,
      vectorId: `reject_${schemaProhibitedDisclosure}`,
      covered: true,
    })),
  );
  expect(
    reconciliation.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_ADDITIONAL_REQUIRED_NEGATIVE_DISCLOSURES,
  ).toEqual(additionalRequiredNegativeDisclosures);
  expect(
    reconciliation.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_RECONCILIATION,
  ).toMatchObject({
    coverageReconciliationDefined: true,
    executableReceiptValidationImplemented: false,
    receiptIssuanceImplemented: false,
    schemaProhibitedDisclosures,
    vectorDisclosures,
    additionalRequiredNegativeDisclosures,
    uncoveredSchemaProhibitedDisclosures: [],
    unexplainedVectorDisclosures: [],
    providerFreeOnly: true,
    sensitiveFixtureValuesPermitted: false,
    providerAuthenticationAdmitted: false,
    providerMetadataReadAdmitted: false,
    secretManagerMetadataReadAdmitted: false,
    databaseConnectionAdmitted: false,
    writerInvocationAdmitted: false,
    nextBoundedObjective:
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_design",
  });
  expect(
    Object.isFrozen(
      reconciliation.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_RECONCILIATION,
    ),
  ).toBe(true);
});

test("666FP binds green exact main and records only static coverage reconciliation", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "e2c8d6f7ca95d45250d65c7702c0cf2e655b9b6c",
    exact_main_ci_run: 32940604918,
    exact_main_ci_conclusion: "success",
    action_666fo_evidence_path:
      "docs/evidence/action-666fo-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-test-vectors.json",
  });
  expect(evidence.negative_disclosure_coverage_reconciliation).toMatchObject({
    uncovered_schema_prohibited_disclosures: [],
    unexplained_vector_disclosures: [],
    required_disposition: "reject_without_receipt_issuance",
    receipt_issuance_permitted: false,
    sensitive_fixture_values_permitted: false,
  });
  expect(
    evidence.negative_disclosure_coverage_reconciliation.schema_prohibited_disclosures,
  ).toHaveLength(8);
  expect(
    evidence.negative_disclosure_coverage_reconciliation.vector_disclosures,
  ).toHaveLength(10);
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
    receipt_issuance_admitted: false,
    transport_implementation_admitted: false,
    database_connection_admitted: false,
    writer_invocation_admitted: false,
    production_deployment_admitted: false,
  });
  expect(evidence.decision).toMatchObject({
    runtime_activation_authorized: false,
    next_bounded_objective:
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_design",
  });
});

test("666FP stays static, value-free and registered in provider-free CI", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const reconciliationSource = source(modulePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, metadataChannelPath))).toBe(false);
  expect(existsSync(resolve(root, metadataRoutePath))).toBe(false);
  expect(reconciliationSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|login|provision|rotate)\s*\(/,
  );
  expect(reconciliationSource).not.toMatch(
    /process\.env|Netlify\.env|from\s+['"](?:pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fp/i);
  expect(source(ledgerPath)).toMatch(/action 666fp/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
