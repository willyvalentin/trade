import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fl-position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-design.md";
const evidencePath =
  "docs/evidence/action-666fl-position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-design.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-design.ts";
const plannedTransportPath =
  "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fl-position-version-lineage-v2-writer-protected-deployment-authentication-authority-and-audit-safe-metadata-channel-design.spec.ts";
const evidenceSha256 = "9fff62df517bccefe9296864525954a94d31846e57e164743a30c8a86789e988";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function loadDesignModule() {
  const transpiled = ts.transpileModule(source(modulePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: modulePath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as {
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_DESIGN_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_DESIGN_REQUIREMENTS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_DESIGN: Record<string, unknown>;
  };
}

test("666FL freezes the future authentication and metadata-channel design", () => {
  const design = loadDesignModule();

  expect(
    design.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_DESIGN_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_authentication_authority_and_audit_safe_metadata_channel_design_v1",
  );
  expect(
    design.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_DESIGN_REQUIREMENTS,
  ).toEqual([
    "separately_authorized_human_initiated_authentication",
    "bound_provider_project_and_least_privileged_principal",
    "non_exporting_named_secret_scope_projection",
    "redacted_audit_receipt_with_session_revocation_path",
  ]);
  expect(
    design.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_DESIGN,
  ).toMatchObject({
    action666fkExactMainVerified: true,
    designOnly: true,
    humanInitiatedProviderAuthenticationAdmitted: false,
    authenticationTokenReadAdmitted: false,
    providerProjectBindingAttested: false,
    leastPrivilegedPrincipalAttested: false,
    nonExportingNamedSecretScopeProjectionImplemented: false,
    redactedAuditReceiptImplemented: false,
    secretManagerMetadataReadAdmitted: false,
    secretValueReadAdmitted: false,
    runtimeActivationAuthorized: false,
    nextBoundedObjective:
      "protected_deployment_authentication_authority_and_audit_safe_metadata_channel_implementation_admission_review",
  });
  expect(
    Object.isFrozen(
      design.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_AUTHENTICATION_AUTHORITY_AND_AUDIT_SAFE_METADATA_CHANNEL_DESIGN,
    ),
  ).toBe(true);
});

test("666FL binds exact main and defines only redaction-safe future controls", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "1d8b2183f43ab4aadebbb4d3c31948ff63a9f963",
    exact_main_ci_run: 32904499030,
    exact_main_ci_conclusion: "success",
    action_666fk_evidence_path:
      "docs/evidence/action-666fk-position-version-lineage-v2-writer-protected-deployment-metadata-authentication-and-value-free-secret-scope-read-admission-review.json",
  });
  expect(evidence.future_authentication_authority_contract).toEqual({
    human_initiated_provider_session_required: true,
    separate_authority_before_authentication_required: true,
    bound_provider_project_required: true,
    least_privileged_principal_required: true,
    session_lifetime_and_revocation_path_required: true,
    ci_token_is_interchangeable_with_human_session: false,
    ci_token_custody_and_scope_requires_separate_review: true,
  });
  expect(evidence.future_metadata_channel_contract).toMatchObject({
    one_named_secret_scope_projection_required: true,
    non_exporting_channel_required: true,
    environment_enumeration_permitted: false,
    environment_export_permitted: false,
    secret_value_projection_permitted: false,
    unrelated_secret_name_projection_permitted: false,
    redacted_audit_receipt_required: true,
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
    authentication_or_metadata_operation_admitted: false,
    runtime_activation_authorized: false,
    next_bounded_objective:
      "protected_deployment_authentication_authority_and_audit_safe_metadata_channel_implementation_admission_review",
  });
});

test("666FL remains static and does not authenticate or touch a secret", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const designSource = source(modulePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, plannedTransportPath))).toBe(false);
  expect(designSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|login|provision|rotate)\s*\(/,
  );
  expect(designSource).not.toMatch(
    /process\.env|Netlify\.env|from\s+['"](?:pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fl/i);
  expect(source(ledgerPath)).toMatch(/action 666fl/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
