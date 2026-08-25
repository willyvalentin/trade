import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fd-position-version-lineage-v2-writer-private-non-data-api-transport-implementation-preflight.md";
const evidencePath =
  "docs/evidence/action-666fd-position-version-lineage-v2-writer-private-non-data-api-transport-implementation-preflight.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-transport-implementation-preflight.ts";
const packagePath = "package.json";
const supabaseServerPath = "lib/supabase-server.ts";
const action666fcModulePath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fd-position-version-lineage-v2-writer-private-non-data-api-transport-implementation-preflight.spec.ts";
const evidenceSha256 = "5829deca0ec670c5c6a7eefb4e7892a0fd3a781b86e0c356ecb2ef662d5b0aa8";

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
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_IMPLEMENTATION_PREFLIGHT_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_IMPLEMENTATION_REQUIREMENTS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_IMPLEMENTATION_PREFLIGHT: Record<string, unknown>;
  };
}

test("666FD fails closed without a selected direct private transport implementation", () => {
  const preflight = loadPreflightModule();

  expect(
    preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_IMPLEMENTATION_PREFLIGHT_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_private_non_data_api_transport_implementation_preflight_v1",
  );
  expect(
    preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_IMPLEMENTATION_REQUIREMENTS,
  ).toEqual([
    "server_only_transport_module_boundary",
    "locked_direct_postgresql_protocol_dependency",
    "private_schema_non_data_api_call_capability",
    "dedicated_unexported_server_credential_containment",
    "fixed_parameter_binding_without_sql_identifier_interpolation",
    "action_666fc_exact_v2_parameter_digest_and_result_contract",
    "separate_review_before_transport_or_adapter_implementation",
  ]);
  expect(
    preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_IMPLEMENTATION_PREFLIGHT,
  ).toMatchObject({
    action666fcSourceContractPresent: true,
    privateSchemaIsNonDataApi: true,
    existingServerSupabaseClientIsPresent: true,
    existingServerSupabaseClientIsNotThePrivateTransport: true,
    directPostgresqlProtocolDependencyPresent: false,
    directPostgresqlTransportModulePresent: false,
    transportCredentialSourceSelected: false,
    parameterBindingImplementationPresent: false,
    committedResultDecoderImplementationPresent: false,
    v2AdapterImplementationPresent: false,
    transportImplementationAdmitted: false,
    databaseOperationPresent: false,
    credentialReadOrConfigured: false,
    writerInvocationPresent: false,
    runtimeWiringPresent: false,
    routeOrUiBindingPresent: false,
    productionAuthorityGranted: false,
  });
  expect(
    Object.isFrozen(
      preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_IMPLEMENTATION_PREFLIGHT,
    ),
  ).toBe(true);
});

test("666FD binds the exact-main predecessor and static manifest-only observation", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "1a26957c8c19827d72b63e21cc7e95cdf0dce0b4",
    exact_main_ci_run: 32846406114,
    exact_main_ci_conclusion: "success",
    action_666fc_evidence_path:
      "docs/evidence/action-666fc-position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.json",
  });
  expect(evidence.static_repository_observation).toEqual({
    scope: "locked_package_manifest_and_source_import_boundary_only",
    private_schema_is_non_data_api: true,
    existing_server_supabase_client_present: true,
    existing_server_supabase_client_selected_for_private_transport: false,
    direct_postgresql_protocol_dependencies: [],
    private_non_data_api_transport_module_present: false,
    configuration_or_credential_read: false,
    database_connection_opened: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_v2_writer_private_non_data_api_transport_implementation_preflight",
    transport_implementation_admitted: false,
    reason:
      "no_locked_direct_postgresql_dependency_or_reviewed_server_credential_containment_design_exists",
    next_bounded_objective:
      "position_version_lineage_v2_writer_private_non_data_api_transport_dependency_and_credential_design",
    runtime_activation_authorized: false,
  });
});

test("666FD proves the current dependency graph has no selected private transport", () => {
  const manifest = JSON.parse(source(packagePath)) as {
    dependencies?: Record<string, string>;
  };
  const dependencies = manifest.dependencies ?? {};
  const preflightSource = source(modulePath);

  expect(dependencies["@supabase/supabase-js"]).toBeTruthy();
  for (const directPostgresqlDependency of [
    "pg",
    "postgres",
    "@neondatabase/serverless",
    "@vercel/postgres",
  ]) {
    expect(dependencies[directPostgresqlDependency]).toBeUndefined();
  }
  expect(source(supabaseServerPath)).toContain('from "@supabase/supabase-js"');
  expect(source(action666fcModulePath)).toContain(
    "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
  );
  expect(preflightSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|rpc)\s*\(/,
  );
  expect(preflightSource).not.toMatch(
    /process\.env|from\s+['"](?:@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
});

test("666FD remains source-only, secret-free, roadmap-bound and registered once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).toMatch(/no connection/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fd/i);
  expect(source(ledgerPath)).toMatch(/action 666fd/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
