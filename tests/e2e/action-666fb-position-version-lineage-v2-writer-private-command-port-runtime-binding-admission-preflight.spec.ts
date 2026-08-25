import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fb-position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.md";
const evidencePath =
  "docs/evidence/action-666fb-position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.ts";
const migrationPath =
  "supabase/migrations/20260824195409_position_version_lineage_v2_writer_storage_routine_package.sql";
const generatedTypesPath = "lib/supabase-database.types.ts";
const adapterPath =
  "lib/server/transactional-recommendation-position-writer-private-adapter.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fb-position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.spec.ts";
const evidenceSha256 = "96c0425e154610ba7ab43d64e3cca2c394363e06ab0041d6173e27a8b9be8412";

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
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_COMMAND_PORT_RUNTIME_BINDING_ADMISSION_PREFLIGHT_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_COMMAND_PORT_RUNTIME_BINDING_ADMISSION_REQUIREMENTS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_COMMAND_PORT_RUNTIME_BINDING_ADMISSION_PREFLIGHT: Record<string, unknown>;
  };
}

test("666FB refuses V2 private command-port binding until its missing server-only contract exists", () => {
  const preflight = loadPreflightModule();

  expect(
    preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_COMMAND_PORT_RUNTIME_BINDING_ADMISSION_PREFLIGHT_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_private_command_port_runtime_binding_admission_preflight_v1",
  );
  expect(
    preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_COMMAND_PORT_RUNTIME_BINDING_ADMISSION_REQUIREMENTS,
  ).toEqual([
    "private_non_data_api_parameterized_transport",
    "server_only_service_role_credential_containment",
    "exact_private_three_argument_routine_call_shape",
    "authenticated_server_owner_propagates_as_first_argument",
    "opaque_recommendation_reference_is_the_only_recommendation_authority",
    "deterministic_v2_canonical_command_digest",
    "strict_committed_result_decoding_without_invented_fields",
    "separate_v2_adapter_contract_without_legacy_v1_command_reuse",
    "no_route_ui_queue_or_deployment_binding_before_port_review",
  ]);
  expect(
    Object.isFrozen(
      preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_COMMAND_PORT_RUNTIME_BINDING_ADMISSION_PREFLIGHT,
    ),
  ).toBe(true);
  expect(
    preflight.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_COMMAND_PORT_RUNTIME_BINDING_ADMISSION_PREFLIGHT,
  ).toMatchObject({
    productionPrivateRoutineCatalogProvenByAction666EZ: true,
    privateRoutineHasFixedEmptySearchPathAndServiceRoleBoundary: true,
    publicGeneratedTypesExcludePrivateWriterSurface: true,
    existingInjectedAdapterIsServerOnlyAndInert: true,
    existingAdapterIsLegacyV1Shape: true,
    privateNonDataApiTransportImplemented: false,
    serviceRoleCredentialContainmentContractImplemented: false,
    deterministicV2CanonicalCommandDigestImplemented: false,
    exactPrivateRoutineResultDecoderImplemented: false,
    separateV2AdapterContractImplemented: false,
    concretePrivateCommandPortBindingAdmitted: false,
    databaseOperationPresent: false,
    writerInvocationPresent: false,
    runtimeWiringPresent: false,
    routeOrUiBindingPresent: false,
    productionAuthorityGranted: false,
  });
});

test("666FB binds the verified private routine boundary and the missing V2 port conditions", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "151c3f76ef852465e308bb5ae1a6e01d6376a604",
    exact_main_ci_run: 32830855893,
    exact_main_ci_conclusion: "success",
    action_666fa_evidence_path:
      "docs/evidence/action-666fa-position-version-lineage-v2-writer-generated-types-provenance-and-runtime-binding-decision.json",
  });
  expect(evidence.proven_private_database_boundary).toEqual({
    action_666ez_catalog_proof_path:
      "docs/evidence/action-666ez-position-version-lineage-v2-writer-production-apply-and-catalog-proof.json",
    action_666er_source_migration_evidence_path:
      "docs/evidence/action-666er-position-version-lineage-projection-contract-v2-writer-storage-routine-source-migration-package.json",
    private_schema_exists: true,
    private_schema_is_non_data_api: true,
    writer_routine_signature:
      "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
    writer_routine_fixed_empty_search_path: true,
    writer_routine_service_role_execution_restricted: true,
    receipt_direct_access_denied: true,
  });
  expect(evidence.admission_requirements).toEqual({
    private_non_data_api_parameterized_transport: false,
    server_only_service_role_credential_containment: false,
    exact_private_three_argument_routine_call_shape: false,
    authenticated_server_owner_propagates_as_first_argument: false,
    opaque_recommendation_reference_is_the_only_recommendation_authority: false,
    deterministic_v2_canonical_command_digest: false,
    strict_committed_result_decoding_without_invented_fields: false,
    separate_v2_adapter_contract_without_legacy_v1_command_reuse: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_v2_writer_private_command_port_runtime_binding_admission_preflight",
    concrete_private_command_port_binding_admitted: false,
    reason:
      "no_reviewed_private_non_data_api_transport_or_v2_adapter_digest_and_result_contract_exists",
    next_bounded_objective:
      "position_version_lineage_v2_writer_private_non_data_api_command_port_source_contract",
    runtime_activation_authorized: false,
  });
});

test("666FB derives no private client or runtime path from the catalog evidence", () => {
  const migration = source(migrationPath);
  const generatedTypes = source(generatedTypesPath);
  const adapter = source(adapterPath);
  const preflightSource = source(modulePath);

  expect(migration).toContain(
    "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
  );
  expect(migration).toContain("set search_path = ''");
  expect(migration).toContain("to service_role");
  expect(generatedTypes).not.toContain("private:");
  expect(generatedTypes).not.toContain("position_version_lineage_v2_writer");
  expect(adapter).toContain('import "server-only"');
  expect(adapter).not.toMatch(/createClient|\.rpc\(|from\(/);
  expect(preflightSource).not.toMatch(
    /\b(?:fetch|createClient|execute_sql|insert|update|delete|select|rpc)\s*\(/,
  );
  expect(preflightSource).not.toMatch(
    /from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/,
  );
});

test("666FB remains secret-free, roadmap-bound and registered exactly once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).toMatch(/not admitted/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fb/i);
  expect(source(ledgerPath)).toMatch(/action 666fb/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
