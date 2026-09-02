import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fn-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-schema-and-negative-disclosure-contract.md";
const evidencePath =
  "docs/evidence/action-666fn-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-schema-and-negative-disclosure-contract.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-metadata-receipt-schema-and-negative-disclosure-contract.ts";
const metadataChannelPath =
  "lib/server/position-version-lineage-v2-writer-deployment-metadata-channel.ts";
const metadataRoutePath =
  "app/api/position-version-lineage-v2-writer/deployment-metadata/route.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fn-position-version-lineage-v2-writer-protected-deployment-metadata-receipt-schema-and-negative-disclosure-contract.spec.ts";
const evidenceSha256 = "bbd3ddb892529abeabbf7ba82c89727eba1ea72793731720e5e89f74a9701e75";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function loadContractModule() {
  const transpiled = ts.transpileModule(source(modulePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: modulePath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as {
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_SCHEMA_AND_NEGATIVE_DISCLOSURE_CONTRACT_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_PERMITTED_FIELDS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_PROHIBITED_FIELDS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_SCHEMA_AND_NEGATIVE_DISCLOSURE_CONTRACT: Record<string, unknown>;
  };
}

test("666FN defines a minimal redacted receipt schema and disclosure denylist", () => {
  const contract = loadContractModule();
  const permitted = [
    "schema_version",
    "receipt_identifier",
    "event_time_utc",
    "authenticated_actor_class",
    "provider_project_binding_digest",
    "principal_authority_class",
    "named_secret_scope_class",
    "metadata_presence_class",
    "policy_revision",
    "revocation_reference",
  ];
  const prohibited = [
    "secret_value",
    "raw_secret_metadata",
    "raw_secret_name",
    "provider_project_identifier",
    "authentication_token",
    "environment_variable_set",
    "connection_string",
    "database_result",
  ];

  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_SCHEMA_AND_NEGATIVE_DISCLOSURE_CONTRACT_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_schema_and_negative_disclosure_contract_v1",
  );
  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_PERMITTED_FIELDS,
  ).toEqual(permitted);
  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_PROHIBITED_FIELDS,
  ).toEqual(prohibited);
  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_SCHEMA_AND_NEGATIVE_DISCLOSURE_CONTRACT,
  ).toMatchObject({
    receiptSchemaDefined: true,
    schemaIssuanceImplemented: false,
    permittedFields: permitted,
    prohibitedFields: prohibited,
    exactNamedSecretReferenceAllowedInReceipt: false,
    providerProjectIdentifierAllowedInReceipt: false,
    actorIdentityAllowedInReceipt: false,
    secretValueAllowedInReceipt: false,
    negativeDisclosureVectorsRequired: true,
    providerAuthenticationAdmitted: false,
    providerMetadataReadAdmitted: false,
    secretManagerMetadataReadAdmitted: false,
    databaseConnectionAdmitted: false,
    writerInvocationAdmitted: false,
    nextBoundedObjective:
      "protected_deployment_metadata_receipt_negative_disclosure_test_vector_design",
  });
  expect(
    Object.isFrozen(
      contract.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_SCHEMA_AND_NEGATIVE_DISCLOSURE_CONTRACT,
    ),
  ).toBe(true);
});

test("666FN binds exact main and preserves the fail-closed receipt boundary", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "4dfddb0242fce171fe8f08cca65981858511b4b0",
    exact_main_ci_run: 32915380396,
    exact_main_ci_conclusion: "success",
    action_666fm_evidence_path:
      "docs/evidence/action-666fm-position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-implementation-admission-review.json",
  });
  expect(evidence.receipt_schema).toMatchObject({
    exact_named_secret_reference_allowed: false,
    provider_project_identifier_allowed: false,
    actor_identity_allowed: false,
    negative_disclosure_vectors_required: true,
  });
  expect(evidence.receipt_schema.permitted_fields).toHaveLength(10);
  expect(evidence.receipt_schema.prohibited_fields).toHaveLength(8);
  expect(evidence.v2_writer_boundary).toMatchObject({
    provider_authentication_initiated: false,
    authentication_token_read: false,
    provider_project_metadata_read: false,
    environment_variable_enumeration_performed: false,
    environment_export_performed: false,
    secret_manager_metadata_read: false,
    secret_value_accessed: false,
    named_secret_provisioned: false,
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
    metadata_channel_implementation_admitted: false,
    receipt_issuance_admitted: false,
    route_or_ui_wiring_admitted: false,
    transport_implementation_admitted: false,
    database_connection_admitted: false,
    writer_invocation_admitted: false,
    production_deployment_admitted: false,
  });
  expect(evidence.decision).toMatchObject({
    runtime_activation_authorized: false,
    next_bounded_objective:
      "protected_deployment_metadata_receipt_negative_disclosure_test_vector_design",
  });
});

test("666FN remains static and registers its negative-disclosure contract", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const contractSource = source(modulePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, metadataChannelPath))).toBe(false);
  expect(existsSync(resolve(root, metadataRoutePath))).toBe(false);
  expect(contractSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|login|provision|rotate)\s*\(/,
  );
  expect(contractSource).not.toMatch(
    /process\.env|Netlify\.env|from\s+['"](?:pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fn/i);
  expect(source(ledgerPath)).toMatch(/action 666fn/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
