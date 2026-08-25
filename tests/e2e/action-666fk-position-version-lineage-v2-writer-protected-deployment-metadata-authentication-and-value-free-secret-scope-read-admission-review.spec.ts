import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fk-position-version-lineage-v2-writer-protected-deployment-metadata-authentication-and-value-free-secret-scope-read-admission-review.md";
const evidencePath =
  "docs/evidence/action-666fk-position-version-lineage-v2-writer-protected-deployment-metadata-authentication-and-value-free-secret-scope-read-admission-review.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-metadata-authentication-and-value-free-secret-scope-read-admission-review.ts";
const plannedTransportPath =
  "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fk-position-version-lineage-v2-writer-protected-deployment-metadata-authentication-and-value-free-secret-scope-read-admission-review.spec.ts";
const evidenceSha256 = "c6f49e3b5df1b03660a31f49f53a30052dbfd5c3679887010f4390beb123c7d0";

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
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_AUTHENTICATION_AND_VALUE_FREE_SECRET_SCOPE_READ_ADMISSION_REVIEW_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_AUTHENTICATION_AND_VALUE_FREE_SECRET_SCOPE_READ_ADMISSION_REVIEW_REQUIREMENTS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_AUTHENTICATION_AND_VALUE_FREE_SECRET_SCOPE_READ_ADMISSION_REVIEW: Record<string, unknown>;
  };
}

test("666FK rejects unbounded deployment authentication and environment access", () => {
  const review = loadReviewModule();

  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_AUTHENTICATION_AND_VALUE_FREE_SECRET_SCOPE_READ_ADMISSION_REVIEW_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_metadata_authentication_and_value_free_secret_scope_read_admission_review_v1",
  );
  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_AUTHENTICATION_AND_VALUE_FREE_SECRET_SCOPE_READ_ADMISSION_REVIEW_REQUIREMENTS,
  ).toEqual([
    "separate_authenticated_session_authority",
    "non_exporting_value_free_metadata_endpoint",
    "server_only_named_secret_scope_filter",
    "audit_safe_redacted_receipt_contract",
  ]);
  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_AUTHENTICATION_AND_VALUE_FREE_SECRET_SCOPE_READ_ADMISSION_REVIEW,
  ).toMatchObject({
    action666fjExactMainVerified: true,
    authenticatedDeploymentMetadataSessionAvailable: false,
    interactiveLoginAdmitted: false,
    authTokenReadAdmitted: false,
    environmentEnumerationAdmitted: false,
    valueFreeNamedSecretScopeReadAdmitted: false,
    protectedSecretManagerCapabilityAttested: false,
    credentialProvisioningAdmitted: false,
    runtimeActivationAuthorized: false,
    nextBoundedObjective:
      "protected_deployment_authentication_authority_and_audit_safe_metadata_channel_design",
  });
  expect(
    Object.isFrozen(
      review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_AUTHENTICATION_AND_VALUE_FREE_SECRET_SCOPE_READ_ADMISSION_REVIEW,
    ),
  ).toBe(true);
});

test("666FK binds exact-main and closes all deployment metadata access", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "489de2399c661c3ab6e0a17539acb589d9cfec15",
    exact_main_ci_run: 32897779579,
    exact_main_ci_conclusion: "success",
    action_666fj_evidence_path:
      "docs/evidence/action-666fj-position-version-lineage-v2-writer-protected-deployment-secret-manager-identity-and-access-scope-evidence-capture.json",
  });
  expect(evidence.authentication_and_metadata_boundary).toEqual({
    authenticated_deployment_metadata_session_available: false,
    interactive_provider_login_admitted: false,
    ci_authentication_token_read_admitted: false,
    generic_environment_enumeration_admitted: false,
    environment_export_admitted: false,
    value_free_named_secret_scope_read_admitted: false,
    protected_secret_manager_identity_attested: false,
    server_only_secret_access_scope_attested: false,
  });
  expect(evidence.v2_writer_boundary).toMatchObject({
    non_public_connection_secret_name:
      "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL",
    provider_login_initiated: false,
    authentication_token_read: false,
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
    provider_login_admitted: false,
    authentication_token_read_admitted: false,
    environment_enumeration_admitted: false,
    environment_export_admitted: false,
    secret_manager_metadata_read_admitted: false,
    credential_provisioning_admitted: false,
    credential_read_admitted: false,
    database_connection_admitted: false,
    writer_invocation_admitted: false,
    production_deployment_admitted: false,
  });
  expect(evidence.decision).toMatchObject({
    authenticated_metadata_session_admitted: false,
    value_free_named_secret_scope_read_admitted: false,
    named_secret_provisioning_admitted: false,
    runtime_activation_authorized: false,
    next_bounded_objective:
      "protected_deployment_authentication_authority_and_audit_safe_metadata_channel_design",
  });
});

test("666FK remains static and never authenticates, lists environment data, or reads a secret", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const reviewSource = source(modulePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

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
  expect(source(roadmapPath)).toMatch(/action 666fk/i);
  expect(source(ledgerPath)).toMatch(/action 666fk/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
