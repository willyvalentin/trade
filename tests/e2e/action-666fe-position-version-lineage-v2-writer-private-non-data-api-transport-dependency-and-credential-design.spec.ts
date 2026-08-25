import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fe-position-version-lineage-v2-writer-private-non-data-api-transport-dependency-and-credential-design.md";
const evidencePath =
  "docs/evidence/action-666fe-position-version-lineage-v2-writer-private-non-data-api-transport-dependency-and-credential-design.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-transport-dependency-and-credential-design.ts";
const packagePath = "package.json";
const action666fcModulePath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fe-position-version-lineage-v2-writer-private-non-data-api-transport-dependency-and-credential-design.spec.ts";
const evidenceSha256 =
  "784edf68b4fc52544026636c98bbbf258d30fff3d1eaa5a54f7e0a4da525dd2f";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function loadDesignModule() {
  const transpiled = ts.transpileModule(source(modulePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: modulePath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as {
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_DEPENDENCY_AND_CREDENTIAL_DESIGN_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_DEPENDENCY_AND_CREDENTIAL_DESIGN_REQUIREMENTS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_DEPENDENCY_AND_CREDENTIAL_DESIGN: Record<string, unknown>;
  };
}

test("666FE freezes one future direct driver and a contained non-public secret shape", () => {
  const design = loadDesignModule();

  expect(
    design.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_DEPENDENCY_AND_CREDENTIAL_DESIGN_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_private_non_data_api_transport_dependency_and_credential_design_v1",
  );
  expect(
    design.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_DEPENDENCY_AND_CREDENTIAL_DESIGN_REQUIREMENTS,
  ).toEqual([
    "one_locked_server_only_direct_postgresql_protocol_driver",
    "dedicated_non_public_postgresql_connection_secret_boundary",
    "fixed_private_v2_routine_sql_and_positional_parameter_order",
    "action_666fc_digest_and_committed_result_contract_remains_unchanged",
    "separate_review_before_dependency_installation_or_secret_provisioning",
    "separate_review_before_connection_or_v2_adapter_implementation",
  ]);
  expect(
    design.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_DEPENDENCY_AND_CREDENTIAL_DESIGN,
  ).toMatchObject({
    selectedRuntimeDriver: {
      packageName: "pg",
      exactVersionToLock: "8.23.0",
      protocol: "postgresql",
      serverOnly: true,
      dependencyInstalled: false,
    },
    selectedTypeCompanion: {
      packageName: "@types/pg",
      exactVersionToLock: "8.23.1",
      dependencyInstalled: false,
    },
    plannedServerOnlyModulePath:
      "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts",
    containedConnectionSecret: {
      environmentVariableName: "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL",
      publicEnvironmentPrefixPermitted: false,
      sourceControlValuePermitted: false,
      existingSupabaseClientCredentialReusable: false,
      provisioned: false,
      runtimeReadImplemented: false,
    },
    plannedInvocation: {
      sqlText:
        "SELECT * FROM private.write_owner_bound_recommendation_position_v2($1::uuid, $2::uuid, $3::text)",
      positionalParameters: [
        "authenticated_server_owner",
        "opaque_recommendation_reference",
        "canonical_command_digest",
      ],
      identifierInterpolationPermitted: false,
      queryImplemented: false,
    },
    action666fcContractPreserved: true,
    directPostgresqlDependencyPresentInManifest: false,
    transportModuleImplemented: false,
    databaseConnectionOpened: false,
    writerInvocationPresent: false,
    v2AdapterImplemented: false,
    routeOrUiBindingPresent: false,
    productionAuthorityGranted: false,
  });
  expect(
    Object.isFrozen(
      design.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_DEPENDENCY_AND_CREDENTIAL_DESIGN,
    ),
  ).toBe(true);
});

test("666FE binds the exact-main predecessor and limits itself to static design", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "2ea68272eae417561424a0db572bbbb1fad5c45f",
    exact_main_ci_run: 32852041196,
    exact_main_ci_conclusion: "success",
    action_666fd_evidence_path:
      "docs/evidence/action-666fd-position-version-lineage-v2-writer-private-non-data-api-transport-implementation-preflight.json",
  });
  expect(evidence.read_only_package_metadata).toEqual({
    runtime_driver: {
      package_name: "pg",
      selected_exact_version: "8.23.0",
      declared_node_engine: ">= 16.0.0",
    },
    type_companion: {
      package_name: "@types/pg",
      selected_exact_version: "8.23.1",
    },
    package_or_lockfile_mutated: false,
  });
  expect(evidence.authority_limits).toEqual({
    dependency_added: false,
    credential_provisioned_or_read: false,
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
      "position_version_lineage_v2_writer_private_non_data_api_transport_dependency_and_credential_design",
    transport_implementation_admitted: false,
    reason: "driver_and_secret_shape_are_selected_but_not_installed_or_provisioned",
    next_bounded_objective:
      "position_version_lineage_v2_writer_private_non_data_api_transport_dependency_lockfile_source_installation",
    runtime_activation_authorized: false,
  });
});

test("666FE leaves the manifest and runtime boundary fail-closed", () => {
  const manifest = JSON.parse(source(packagePath)) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const designSource = source(modulePath);

  expect(manifest.dependencies?.pg).toBeUndefined();
  expect(manifest.devDependencies?.["@types/pg"]).toBeUndefined();
  expect(source(action666fcModulePath)).toContain(
    "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
  );
  expect(designSource).not.toMatch(
    /\b(?:fetch|createClient|connect|query|execute_sql|insert|update|delete|select|rpc)\s*\(/,
  );
  expect(designSource).not.toMatch(
    /process\.env|from\s+['"](?:pg|@types\/pg|@\/lib\/supabase|@supabase|node:net|node:https|node:http)/,
  );
});

test("666FE is secret-free, roadmap-bound and registered once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).toMatch(/no secret provisioning/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fe/i);
  expect(source(ledgerPath)).toMatch(/action 666fe/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
