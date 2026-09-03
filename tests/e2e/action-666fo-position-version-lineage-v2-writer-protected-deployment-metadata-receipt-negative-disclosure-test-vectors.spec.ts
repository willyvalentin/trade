import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fo-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-test-vectors.md";
const evidencePath =
  "docs/evidence/action-666fo-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-test-vectors.json";
const modulePath =
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
  "tests/e2e/action-666fo-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-test-vectors.spec.ts";
const evidenceSha256 = "8be47da2b08bc62437ed62b85f65dfd849be1f1edc0021bf6f8cf134ab6405d9";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function loadVectorModule() {
  const transpiled = ts.transpileModule(source(modulePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: modulePath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as {
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTORS_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTORS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_VECTOR_CATALOG: readonly Record<string, unknown>[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTOR_DESIGN: Record<string, unknown>;
  };
}

test("666FO defines a value-free rejection vector for every forbidden disclosure", () => {
  const vectors = loadVectorModule();
  const prohibitedDisclosures = [
    "secret_value",
    "raw_secret_metadata",
    "raw_secret_name",
    "provider_project_identifier",
    "authentication_token",
    "environment_variable_set",
    "connection_string",
    "database_result",
    "actor_identity",
    "exact_named_secret_reference",
  ];

  expect(
    vectors.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTORS_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_negative_disclosure_test_vectors_v1",
  );
  expect(
    vectors.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTORS,
  ).toEqual(prohibitedDisclosures);
  expect(
    vectors.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_VECTOR_CATALOG,
  ).toEqual(
    prohibitedDisclosures.map((prohibitedDisclosure) => ({
      vectorId: `reject_${prohibitedDisclosure}`,
      prohibitedDisclosure,
      expectedDisposition: "reject_without_receipt_issuance",
      providerFree: true,
      sensitiveFixtureValuePermitted: false,
      receiptIssued: false,
      providerAuthenticationInitiated: false,
      providerMetadataRead: false,
      secretManagerMetadataRead: false,
      environmentRead: false,
      databaseConnectionOpened: false,
      writerInvoked: false,
    })),
  );
  expect(
    vectors.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTOR_DESIGN,
  ).toMatchObject({
    vectorDesignDefined: true,
    executableReceiptValidationImplemented: false,
    receiptIssuanceImplemented: false,
    providerFreeOnly: true,
    sensitiveFixtureValuesPermitted: false,
    providerAuthenticationAdmitted: false,
    providerMetadataReadAdmitted: false,
    secretManagerMetadataReadAdmitted: false,
    databaseConnectionAdmitted: false,
    writerInvocationAdmitted: false,
    nextBoundedObjective:
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_reconciliation",
  });
  expect(
    Object.isFrozen(
      vectors.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTOR_DESIGN,
    ),
  ).toBe(true);
});

test("666FO binds green exact main and records only static vector design", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "b856b0ba2b5588a06faf4786363f568f3dfbb1ec",
    exact_main_ci_run: 32934898458,
    exact_main_ci_conclusion: "success",
    action_666fn_evidence_path:
      "docs/evidence/action-666fn-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-schema-and-negative-disclosure-contract.json",
  });
  expect(evidence.negative_disclosure_vector_design).toMatchObject({
    provider_free_only: true,
    sensitive_fixture_values_permitted: false,
    receipt_issuance_permitted: false,
    required_disposition: "reject_without_receipt_issuance",
  });
  expect(evidence.negative_disclosure_vector_design.vector_disclosures).toHaveLength(10);
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
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_reconciliation",
  });
});

test("666FO remains static, value-free and registered in provider-free CI", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const vectorSource = source(modulePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, metadataChannelPath))).toBe(false);
  expect(existsSync(resolve(root, metadataRoutePath))).toBe(false);
  expect(vectorSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|login|provision|rotate)\s*\(/,
  );
  expect(vectorSource).not.toMatch(
    /process\.env|Netlify\.env|from\s+['"](?:pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fo/i);
  expect(source(ledgerPath)).toMatch(/action 666fo/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
