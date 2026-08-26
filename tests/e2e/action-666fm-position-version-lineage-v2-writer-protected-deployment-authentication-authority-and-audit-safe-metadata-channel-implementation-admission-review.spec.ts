import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fm-position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-implementation-admission-review.md";
const evidencePath =
  "docs/evidence/action-666fm-position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-implementation-admission-review.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-implementation-admission-review.ts";
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
  "tests/e2e/action-666fm-position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-implementation-admission-review.spec.ts";
const evidenceSha256 = "126f5aec578314388399071c31aad6ab0038761ee4e1b15f0bd219694ebc6fa1";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function loadReviewModule() {
  const transpiled = ts.transpileModule(source(modulePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: modulePath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as {
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_IMPLEMENTATION_ADMISSION_REVIEW_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_IMPLEMENTATION_ADMISSION_REVIEW_REQUIREMENTS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_IMPLEMENTATION_ADMISSION_REVIEW: Record<string, unknown>;
  };
}

test("666FM rejects implementation without authority and leakage controls", () => {
  const review = loadReviewModule();

  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_IMPLEMENTATION_ADMISSION_REVIEW_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_authentication_authority_and_audit_safe_metadata_channel_implementation_admission_review_v1",
  );
  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_IMPLEMENTATION_ADMISSION_REVIEW_REQUIREMENTS,
  ).toEqual([
    "approved_authenticated_actor_and_provider_project_binding",
    "least_privileged_session_and_revocation_evidence",
    "reviewed_non_exporting_metadata_channel_source",
    "reviewed_redacted_audit_receipt_source_and_negative_tests",
  ]);
  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_IMPLEMENTATION_ADMISSION_REVIEW,
  ).toMatchObject({
    action666flExactMainVerified: true,
    implementationAdmissionGranted: false,
    authenticatedActorAndProviderProjectBound: false,
    leastPrivilegedSessionAndRevocationAttested: false,
    metadataChannelSourcePresent: false,
    namedSecretScopeFilterImplemented: false,
    redactedAuditReceiptSourcePresent: false,
    negativeLeakageTestsPresent: false,
    providerAuthenticationAdmitted: false,
    secretManagerMetadataReadAdmitted: false,
    runtimeActivationAuthorized: false,
    nextBoundedObjective:
      "protected_deployment_metadata_channel_redaction_receipt_schema_and_contract_design",
  });
  expect(
    Object.isFrozen(
      review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_IMPLEMENTATION_ADMISSION_REVIEW,
    ),
  ).toBe(true);
});

test("666FM binds exact main and records the absent channel implementation", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "b70971eec08c8c98ea99d753f68fec6222154532",
    exact_main_ci_run: 32910127321,
    exact_main_ci_conclusion: "success",
    action_666fl_evidence_path:
      "docs/evidence/action-666fl-position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-design.json",
  });
  expect(evidence.source_catalog_evidence).toEqual({
    netlify_functions_directory_declared: true,
    dedicated_deployment_metadata_channel_source_present: false,
    dedicated_deployment_metadata_route_present: false,
    named_v2_secret_runtime_reference_present: false,
    named_v2_secret_static_contract_reference_present: true,
    redacted_metadata_receipt_source_present: false,
    negative_leakage_test_source_present: false,
  });
  expect(evidence.implementation_requirements).toMatchObject({
    approved_authenticated_actor_and_provider_project_binding_required: true,
    least_privileged_session_and_revocation_evidence_required: true,
    non_exporting_metadata_channel_source_required: true,
    one_named_secret_scope_filter_required: true,
    redacted_audit_receipt_source_required: true,
    negative_disclosure_tests_required: true,
  });
  expect(evidence.v2_writer_boundary).toMatchObject({
    non_public_connection_secret_name:
      "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL",
    provider_authentication_initiated: false,
    authentication_token_read: false,
    provider_project_metadata_read: false,
    environment_variable_enumeration_performed: false,
    environment_export_performed: false,
    secret_manager_metadata_read: false,
    secret_value_accessed: false,
    named_secret_provisioned: false,
    database_connection_opened: false,
    routine_invoked: false,
    writer_invoked: false,
  });
  expect(evidence.authority_limits).toMatchObject({
    provider_authentication_admitted: false,
    authentication_token_read_admitted: false,
    provider_metadata_read_admitted: false,
    metadata_channel_implementation_admitted: false,
    credential_read_admitted: false,
    database_connection_admitted: false,
    writer_invocation_admitted: false,
    production_deployment_admitted: false,
  });
  expect(evidence.decision).toMatchObject({
    implementation_admitted: false,
    runtime_activation_authorized: false,
    next_bounded_objective:
      "protected_deployment_metadata_channel_redaction_receipt_schema_and_contract_design",
  });
});

test("666FM remains static and leaves all runtime channel paths absent", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const reviewSource = source(modulePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, metadataChannelPath))).toBe(false);
  expect(existsSync(resolve(root, metadataRoutePath))).toBe(false);
  expect(existsSync(resolve(root, plannedTransportPath))).toBe(false);
  expect(reviewSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|login|provision|rotate)\s*\(/,
  );
  expect(reviewSource).not.toMatch(
    /process\.env|Netlify\.env|from\s+['"](?:pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fm/i);
  expect(source(ledgerPath)).toMatch(/action 666fm/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
