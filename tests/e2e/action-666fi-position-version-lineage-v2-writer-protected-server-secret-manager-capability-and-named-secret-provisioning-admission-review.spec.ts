import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fi-position-version-lineage-v2-writer-protected-server-secret-manager-capability-and-named-secret-provisioning-admission-review.md";
const evidencePath =
  "docs/evidence/action-666fi-position-version-lineage-v2-writer-protected-server-secret-manager-capability-and-named-secret-provisioning-admission-review.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-protected-server-secret-manager-capability-and-named-secret-provisioning-admission-review.ts";
const deploymentConfigPath = "netlify.toml";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fi-position-version-lineage-v2-writer-protected-server-secret-manager-capability-and-named-secret-provisioning-admission-review.spec.ts";
const evidenceSha256 = "dde6f6066affa5cf7c6fd22878b80c239f24e95538eef238229923b79c3c6d25";

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
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_SERVER_SECRET_MANAGER_CAPABILITY_AND_NAMED_SECRET_PROVISIONING_ADMISSION_REVIEW_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_SERVER_SECRET_MANAGER_CAPABILITY_AND_NAMED_SECRET_PROVISIONING_ADMISSION_REVIEW_REQUIREMENTS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_SERVER_SECRET_MANAGER_CAPABILITY_AND_NAMED_SECRET_PROVISIONING_ADMISSION_REVIEW: Record<string, unknown>;
  };
}

test("666FI closes the static secret-manager capability review without admitting provisioning", () => {
  const review = loadReviewModule();

  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_SERVER_SECRET_MANAGER_CAPABILITY_AND_NAMED_SECRET_PROVISIONING_ADMISSION_REVIEW_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_protected_server_secret_manager_capability_and_named_secret_provisioning_admission_review_v1",
  );
  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_SERVER_SECRET_MANAGER_CAPABILITY_AND_NAMED_SECRET_PROVISIONING_ADMISSION_REVIEW_REQUIREMENTS,
  ).toEqual([
    "protected_deployment_secret_manager_identity",
    "server_only_access_scope_and_policy",
    "value_free_named_secret_existence_attestation",
    "separate_least_privileged_database_role_admission",
  ]);
  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_SERVER_SECRET_MANAGER_CAPABILITY_AND_NAMED_SECRET_PROVISIONING_ADMISSION_REVIEW,
  ).toMatchObject({
    action666fhExactMainVerified: true,
    repositoryDeploymentConfigDeclaresSecretManagerIdentity: false,
    protectedSecretManagerCapabilityAttested: false,
    namedSecretProvisioned: false,
    secretValueAccessed: false,
    secretManagerMetadataRead: false,
    databaseRoleAdmitted: false,
    databaseConnectionOpened: false,
    credentialProvisioningAdmitted: false,
    runtimeActivationAuthorized: false,
    nextBoundedObjective:
      "protected_deployment_secret_manager_identity_and_access_scope_evidence_capture",
  });
  expect(
    Object.isFrozen(
      review.POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_SERVER_SECRET_MANAGER_CAPABILITY_AND_NAMED_SECRET_PROVISIONING_ADMISSION_REVIEW,
    ),
  ).toBe(true);
});

test("666FI binds the green exact-main predecessor and records unresolved capability", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "788c51669d9fcbf63b8fecc3ebd2dc1e5c36c3bd",
    exact_main_ci_run: 32883298240,
    exact_main_ci_conclusion: "success",
    action_666fh_evidence_path:
      "docs/evidence/action-666fh-position-version-lineage-v2-writer-private-non-data-api-transport-continuation-scope-and-evidence-admission-review.json",
  });
  expect(evidence.repository_visible_deployment_boundary).toEqual({
    functions_directory_declared: true,
    protected_secret_manager_identity_declared: false,
    server_only_secret_access_scope_declared: false,
    managed_v2_secret_name_declared: false,
    v2_secret_manager_provider_identity: "unresolved",
  });
  expect(evidence.v2_writer_boundary).toMatchObject({
    non_public_connection_secret_name:
      "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL",
    secret_value_accessed: false,
    secret_manager_metadata_read: false,
    named_secret_provisioned: false,
    database_role_admitted: false,
    transport_implemented: false,
    database_connection_opened: false,
    routine_invoked: false,
    writer_invoked: false,
  });
  expect(evidence.authority_limits).toMatchObject({
    secret_manager_access_granted: false,
    credential_provisioning_admitted: false,
    credential_read_admitted: false,
    deployment_configuration_change_admitted: false,
    database_role_grant_admitted: false,
    database_connection_admitted: false,
    writer_invocation_admitted: false,
    production_deployment_admitted: false,
  });
  expect(evidence.decision).toMatchObject({
    protected_secret_manager_capability_attested: false,
    named_secret_provisioning_admitted: false,
    runtime_activation_authorized: false,
    next_bounded_objective:
      "protected_deployment_secret_manager_identity_and_access_scope_evidence_capture",
  });
});

test("666FI remains static, value-free and source-only", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const reviewSource = source(modulePath);
  const deploymentConfig = source(deploymentConfigPath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(deploymentConfig).toMatch(/^\[functions\]\n\s*directory\s*=\s*"netlify\/functions"/m);
  expect(deploymentConfig).not.toMatch(
    /TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL|\[(?:build|context\.[^\]]+)\.environment\]/,
  );
  expect(reviewSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|provision|rotate)\s*\(/,
  );
  expect(reviewSource).not.toMatch(
    /process\.env|from\s+['"](?:pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fi/i);
  expect(source(ledgerPath)).toMatch(/action 666fi/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
