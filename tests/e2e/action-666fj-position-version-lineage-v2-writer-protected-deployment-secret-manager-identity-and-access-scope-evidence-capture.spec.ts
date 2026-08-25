import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fj-position-version-lineage-v2-writer-protected-deployment-secret-manager-identity-and-access-scope-evidence-capture.md";
const evidencePath =
  "docs/evidence/action-666fj-position-version-lineage-v2-writer-protected-deployment-secret-manager-identity-and-access-scope-evidence-capture.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-deployment-secret-manager-identity-and-access-scope-evidence-capture.ts";
const deploymentConfigPath = "netlify.toml";
const plannedTransportPath =
  "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fj-position-version-lineage-v2-writer-protected-deployment-secret-manager-identity-and-access-scope-evidence-capture.spec.ts";
const evidenceSha256 = "9e19a4bf0467c118e18d41d4dbd4fa4f7516fae61450058ade05b52408e80707";

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
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_SECRET_MANAGER_IDENTITY_AND_ACCESS_SCOPE_EVIDENCE_CAPTURE_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_SECRET_MANAGER_IDENTITY_AND_ACCESS_SCOPE_EVIDENCE_CAPTURE_REQUIREMENTS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_SECRET_MANAGER_IDENTITY_AND_ACCESS_SCOPE_EVIDENCE_CAPTURE: Record<string, unknown>;
  };
}

test("666FJ records only value-free, unauthenticated deployment evidence", () => {
  const review = loadReviewModule();

  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_SECRET_MANAGER_IDENTITY_AND_ACCESS_SCOPE_EVIDENCE_CAPTURE_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_deployment_secret_manager_identity_and_access_scope_evidence_capture_v1",
  );
  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_SECRET_MANAGER_IDENTITY_AND_ACCESS_SCOPE_EVIDENCE_CAPTURE_REQUIREMENTS,
  ).toEqual([
    "authenticated_protected_deployment_metadata_session",
    "value_free_secret_manager_identity_attestation",
    "server_only_secret_access_scope_attestation",
    "value_free_named_secret_scope_attestation",
  ]);
  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_SECRET_MANAGER_IDENTITY_AND_ACCESS_SCOPE_EVIDENCE_CAPTURE,
  ).toMatchObject({
    action666fiExactMainVerified: true,
    repositoryDeploymentPlatformHint: "netlify",
    providerStatusProbeUnauthenticated: true,
    providerProjectMetadataObserved: false,
    protectedSecretManagerIdentityAttested: false,
    serverOnlySecretAccessScopeAttested: false,
    namedSecretMetadataObserved: false,
    secretValueAccessed: false,
    credentialProvisioningAdmitted: false,
    runtimeActivationAuthorized: false,
    nextBoundedObjective:
      "protected_deployment_metadata_authentication_and_value_free_secret_scope_read_admission_review",
  });
  expect(
    Object.isFrozen(
      review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_SECRET_MANAGER_IDENTITY_AND_ACCESS_SCOPE_EVIDENCE_CAPTURE,
    ),
  ).toBe(true);
});

test("666FJ binds exact-main and records the unavailable protected metadata session", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "6c5eed121d6e9c8bea93c51a76d4a4b7101ec5d0",
    exact_main_ci_run: 32890831286,
    exact_main_ci_conclusion: "success",
    action_666fi_evidence_path:
      "docs/evidence/action-666fi-position-version-lineage-v2-writer-protected-server-secret-manager-capability-and-named-secret-provisioning-admission-review.json",
  });
  expect(evidence.value_free_deployment_evidence).toEqual({
    repository_deployment_platform_hint: "netlify",
    repository_functions_directory_declared: true,
    local_site_link_metadata_observed: false,
    provider_status_probe_attempted: true,
    provider_status_probe_result: "unauthenticated",
    provider_project_metadata_observed: false,
    provider_secret_manager_identity_observed: false,
    server_only_secret_access_scope_observed: false,
    named_v2_secret_metadata_observed: false,
  });
  expect(evidence.v2_writer_boundary).toMatchObject({
    non_public_connection_secret_name:
      "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL",
    provider_login_initiated: false,
    environment_variable_enumeration_performed: false,
    secret_manager_metadata_read: false,
    secret_value_accessed: false,
    named_secret_provisioned: false,
    deployment_policy_changed: false,
    database_role_granted: false,
    transport_implemented: false,
    database_connection_opened: false,
    routine_invoked: false,
    writer_invoked: false,
  });
  expect(evidence.authority_limits).toMatchObject({
    provider_status_probe_admitted: true,
    provider_login_admitted: false,
    secret_manager_metadata_read_admitted: false,
    credential_provisioning_admitted: false,
    credential_read_admitted: false,
    deployment_configuration_change_admitted: false,
    database_connection_admitted: false,
    writer_invocation_admitted: false,
    production_deployment_admitted: false,
  });
  expect(evidence.decision).toMatchObject({
    protected_secret_manager_identity_attested: false,
    server_only_secret_access_scope_attested: false,
    named_secret_provisioning_admitted: false,
    runtime_activation_authorized: false,
    next_bounded_objective:
      "protected_deployment_metadata_authentication_and_value_free_secret_scope_read_admission_review",
  });
});

test("666FJ remains value-free and forbids deployment authentication and environment access", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const reviewSource = source(modulePath);
  const deploymentConfig = source(deploymentConfigPath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(existsSync(resolve(root, plannedTransportPath))).toBe(false);
  expect(deploymentConfig).toMatch(/^\[functions\]\n\s*directory\s*=\s*"netlify\/functions"/m);
  expect(deploymentConfig).not.toMatch(
    /TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL|\[(?:build|context\.[^\]]+)\.environment\]/,
  );
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
  expect(source(roadmapPath)).toMatch(/action 666fj/i);
  expect(source(ledgerPath)).toMatch(/action 666fj/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
