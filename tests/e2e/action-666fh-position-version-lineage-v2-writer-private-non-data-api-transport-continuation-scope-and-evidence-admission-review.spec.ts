import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fh-position-version-lineage-v2-writer-private-non-data-api-transport-continuation-scope-and-evidence-admission-review.md";
const evidencePath =
  "docs/evidence/action-666fh-position-version-lineage-v2-writer-private-non-data-api-transport-continuation-scope-and-evidence-admission-review.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-transport-continuation-scope-and-evidence-admission-review.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fh-position-version-lineage-v2-writer-private-non-data-api-transport-continuation-scope-and-evidence-admission-review.spec.ts";
const evidenceSha256 = "a99a0fd759b296e36ce54974e8ccfebf8d480f6e506eaf2e51fa51daed099f38";

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
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CONTINUATION_SCOPE_AND_EVIDENCE_ADMISSION_REVIEW_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CONTINUATION_SCOPE_AND_EVIDENCE_ADMISSION_REVIEW_GATES: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CONTINUATION_SCOPE_AND_EVIDENCE_ADMISSION_REVIEW: Record<string, unknown>;
  };
}

test("666FH establishes the ordered continuation gates without runtime authority", () => {
  const review = loadReviewModule();

  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CONTINUATION_SCOPE_AND_EVIDENCE_ADMISSION_REVIEW_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_private_non_data_api_transport_continuation_scope_and_evidence_admission_review_v1",
  );
  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CONTINUATION_SCOPE_AND_EVIDENCE_ADMISSION_REVIEW_GATES,
  ).toEqual([
    "protected_server_secret_manager_capability_and_deployment_scope_review",
    "named_secret_provisioning_and_least_privileged_role_admission_review",
    "post_provisioning_value_free_provenance_attestation",
    "private_transport_source_contract_and_fake_only_test_seam_review",
    "staging_only_connection_admission_preflight",
    "writer_adapter_and_route_ui_admission_review",
  ]);
  expect(
    review.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CONTINUATION_SCOPE_AND_EVIDENCE_ADMISSION_REVIEW,
  ).toMatchObject({
    action666fgExactMainVerified: true,
    protectedSecretManagerIntegrated: false,
    credentialProvisionedOrRead: false,
    serverOnlyTransportModulePresent: false,
    databaseConnectionOpened: false,
    databaseQueryOrMutationPresent: false,
    writerInvocationPresent: false,
    continuationSequenceEstablished: true,
    runtimeActivationAuthorized: false,
    nextBoundedObjective:
      "protected_server_secret_manager_capability_and_named_secret_provisioning_admission_review",
  });
  expect(
    Object.isFrozen(
      review.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CONTINUATION_SCOPE_AND_EVIDENCE_ADMISSION_REVIEW,
    ),
  ).toBe(true);
});

test("666FH binds the green exact-main predecessor and retains closed authority", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "b98ff6138c0e05a0420e91238160d09530c21f68",
    exact_main_ci_run: 32874783136,
    exact_main_ci_conclusion: "success",
    action_666fg_evidence_path:
      "docs/evidence/action-666fg-position-version-lineage-v2-writer-private-non-data-api-transport-credential-provisioning-and-connection-admission-preflight.json",
  });
  expect(evidence.current_source_boundary).toEqual({
    selected_runtime_driver: "pg@8.23.0",
    selected_type_companion: "@types/pg@8.23.1",
    non_public_connection_secret_name:
      "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL",
    protected_secret_manager_integrated: false,
    credential_provisioned_or_read: false,
    server_only_transport_module_present: false,
    database_connection_opened: false,
    database_query_or_mutation: false,
    writer_invoked: false,
  });
  expect(evidence.authority_limits).toEqual({
    secret_manager_access_granted: false,
    credential_provisioning_admitted: false,
    credential_read_admitted: false,
    transport_implementation_admitted: false,
    database_connection_admitted: false,
    database_query_or_mutation_admitted: false,
    writer_invocation_admitted: false,
    runtime_wiring_admitted: false,
    route_or_ui_wiring_admitted: false,
    provider_or_broker_contact_admitted: false,
    production_deployment_admitted: false,
  });
  expect(evidence.decision).toMatchObject({
    continuation_sequence_established: true,
    runtime_activation_authorized: false,
    next_bounded_objective:
      "protected_server_secret_manager_capability_and_named_secret_provisioning_admission_review",
  });
});

test("666FH remains source-only and secret-free", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const reviewSource = source(modulePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(reviewSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|rpc)\s*\(/,
  );
  expect(reviewSource).not.toMatch(
    /process\.env|from\s+['"](?:pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fh/i);
  expect(source(ledgerPath)).toMatch(/action 666fh/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
