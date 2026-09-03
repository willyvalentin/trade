import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fg-position-version-lineage-v2-writer-private-non-data-api-transport-credential-provisioning-and-connection-admission-preflight.md";
const evidencePath =
  "docs/evidence/action-666fg-position-version-lineage-v2-writer-private-non-data-api-transport-credential-provisioning-and-connection-admission-preflight.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-transport-credential-provisioning-and-connection-admission-preflight.ts";
const packagePath = "package.json";
const action666fcModulePath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fg-position-version-lineage-v2-writer-private-non-data-api-transport-credential-provisioning-and-connection-admission-preflight.spec.ts";
const evidenceSha256 =
  "ad628fbb6e4c91a981a734f4a766d4683d003dea61bf42a6323fc11cbcc1a027";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function loadPreflightModule() {
  const transpiled = ts.transpileModule(source(modulePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: modulePath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as {
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CREDENTIAL_PROVISIONING_AND_CONNECTION_ADMISSION_PREFLIGHT_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CREDENTIAL_PROVISIONING_AND_CONNECTION_ADMISSION_PREFLIGHT_REQUIREMENTS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CREDENTIAL_PROVISIONING_AND_CONNECTION_ADMISSION_PREFLIGHT: Record<string, unknown>;
  };
}

test("666FG keeps credential provisioning and connection admission fail-closed", () => {
  const preflight = loadPreflightModule();

  expect(
    preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CREDENTIAL_PROVISIONING_AND_CONNECTION_ADMISSION_PREFLIGHT_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_private_non_data_api_transport_credential_provisioning_and_connection_admission_preflight_v1",
  );
  expect(
    preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CREDENTIAL_PROVISIONING_AND_CONNECTION_ADMISSION_PREFLIGHT_REQUIREMENTS,
  ).toEqual([
    "protected_server_secret_manager_provenance_only",
    "dedicated_non_public_connection_secret_name",
    "no_source_control_or_public_environment_secret_value",
    "no_existing_supabase_client_credential_reuse",
    "dedicated_least_privileged_private_routine_database_role",
    "server_only_transport_module_boundary_before_connection",
    "fixed_action_666fe_sql_and_action_666fc_command_contract",
    "separate_review_after_secret_provisioning_before_connection_or_writer_invocation",
  ]);
  expect(
    preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CREDENTIAL_PROVISIONING_AND_CONNECTION_ADMISSION_PREFLIGHT,
  ).toMatchObject({
    action666ffExactDependencyLockfilePresent: true,
    selectedRuntimeDriver: "pg@8.23.0",
    selectedTypeCompanion: "@types/pg@8.23.1",
    containedConnectionSecret: {
      environmentVariableName: "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL",
      expectedProvenance: "protected_server_secret_manager",
      publicEnvironmentPrefixPermitted: false,
      sourceControlValuePermitted: false,
      existingSupabaseClientCredentialReusable: false,
      credentialProvisioned: false,
      credentialReadImplemented: false,
    },
    futureConnectionAdmissionRequirements: {
      serverOnlyTransportModuleRequired: true,
      dedicatedLeastPrivilegedPrivateRoutineRoleRequired: true,
      fixedPrivateV2RoutineOnly: true,
      literalPositionalParameterOrderRequired: true,
      connectionOpened: false,
      databaseQueryOrMutationPresent: false,
    },
    transportModuleImplemented: false,
    transportImplementationAdmitted: false,
    connectionAdmissionGranted: false,
    writerInvocationPresent: false,
    v2AdapterImplemented: false,
    runtimeWiringPresent: false,
    routeOrUiBindingPresent: false,
    providerOrBrokerContact: false,
    productionAuthorityGranted: false,
  });
  expect(
    Object.isFrozen(
      preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CREDENTIAL_PROVISIONING_AND_CONNECTION_ADMISSION_PREFLIGHT,
    ),
  ).toBe(true);
});

test("666FG binds the green exact-main predecessor and frozen connection gate", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "29be648426b623fe45c869e6c9051edc3aa4b1c2",
    exact_main_ci_run: 32867561628,
    exact_main_ci_conclusion: "success",
    action_666ff_evidence_path:
      "docs/evidence/action-666ff-position-version-lineage-v2-writer-private-non-data-api-transport-dependency-lockfile-source-installation.json",
  });
  expect(evidence.static_preflight).toEqual({
    selected_runtime_driver: "pg@8.23.0",
    selected_type_companion: "@types/pg@8.23.1",
    planned_server_only_transport_module_present: false,
    application_driver_import_added: false,
    non_public_connection_secret_name:
      "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL",
    expected_secret_provenance: "protected_server_secret_manager",
    public_environment_prefix_permitted: false,
    source_control_value_permitted: false,
    existing_supabase_client_credential_reusable: false,
    credential_provisioned_or_read: false,
    database_connection_opened: false,
    database_query_or_mutation: false,
  });
  expect(evidence.future_connection_admission_requirements).toEqual({
    server_only_transport_module: true,
    dedicated_least_privileged_private_routine_role: true,
    fixed_private_v2_routine_only: true,
    literal_positional_parameter_order: [
      "authenticated_server_owner",
      "opaque_recommendation_reference",
      "canonical_command_digest",
    ],
    separate_post_provisioning_review_required: true,
  });
  expect(evidence.authority_limits).toEqual({
    credential_provisioned_or_read: false,
    transport_module_implemented: false,
    database_connection_opened: false,
    database_query_or_mutation: false,
    writer_invoked: false,
    v2_adapter_implemented: false,
    runtime_wiring: false,
    route_or_ui_wiring: false,
    provider_or_broker_contact: false,
    production_deployment: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_v2_writer_private_non_data_api_transport_credential_provisioning_and_connection_admission_preflight",
    credential_provisioning_admitted: false,
    connection_admission_granted: false,
    reason:
      "preflight_freezes_secret_provenance_and_connection_requirements_without_provisioning_or_reading_a_secret",
    next_bounded_objective:
      "separate_review_required_before_any_runtime_credential_or_transport_action",
    runtime_activation_authorized: false,
  });
});

test("666FG preserves source-only transport and secret boundaries", () => {
  const manifest = JSON.parse(source(packagePath)) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const preflightSource = source(modulePath);

  expect(manifest.dependencies?.pg).toBe("8.23.0");
  expect(manifest.devDependencies?.["@types/pg"]).toBe("8.23.1");
  expect(source(action666fcModulePath)).not.toMatch(
    /from\s+["']pg["']|require\(["']pg["']\)|process\.env|\b(?:connect|query)\s*\(/,
  );
  expect(preflightSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|rpc)\s*\(/,
  );
  expect(preflightSource).not.toMatch(
    /process\.env|from\s+['"](?:@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
});

test("666FG is secret-free, roadmap-bound and registered once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).toMatch(/does not provision or read/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fg/i);
  expect(source(ledgerPath)).toMatch(/action 666fg/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
