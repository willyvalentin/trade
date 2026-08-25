import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666fc-position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.md";
const evidencePath =
  "docs/evidence/action-666fc-position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.json";
const modulePath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const migrationPath =
  "supabase/migrations/20260824195409_position_version_lineage_v2_writer_storage_routine_package.sql";
const generatedTypesPath = "lib/supabase-database.types.ts";
const legacyAdapterPath =
  "lib/server/transactional-recommendation-position-writer-private-adapter.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666fc-position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.spec.ts";
const evidenceSha256 = "27d965a088daac2b183f6d7910651a277fe3e557587f0caed871bc2617878afe";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function loadContractModule() {
  const transpiled = ts.transpileModule(source(modulePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: modulePath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as {
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE: string;
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_REQUIREMENTS: readonly string[];
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_DIGEST_PROJECTION: Record<string, unknown>;
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_RESULT_MAPPING: Record<string, unknown>;
    POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT: Record<string, unknown>;
  };
}

test("666FC freezes the exact V2 private parameter, digest, and committed-result contract", () => {
  const contract = loadContractModule();

  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
  ).toBe(
    "position_version_lineage_v2_writer_private_non_data_api_command_port_source_contract_v1",
  );
  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
  ).toBe("private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)");
  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_REQUIREMENTS,
  ).toEqual([
    "server_only_private_non_data_api_parameterized_routine_transport",
    "service_role_credential_containment_outside_client_and_route_surfaces",
    "exact_authenticated_owner_opaque_recommendation_digest_parameter_order",
    "deterministic_v2_canonical_digest_over_only_the_frozen_command_projection",
    "exactly_one_committed_private_routine_result_row",
    "strict_created_or_replayed_result_mapping_without_legacy_snapshot_fields",
    "separate_v2_adapter_and_runtime_binding_review_after_transport_delivery",
  ]);
  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_DIGEST_PROJECTION,
  ).toEqual({
    algorithm: "sha256",
    encoding: "lowercase_hex",
    serialization: "utf8_json_object_with_lexically_sorted_keys",
    fields: [
      "contract_version",
      "routine_signature",
      "authenticated_server_owner",
      "opaque_recommendation_reference",
    ],
  });
  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_RESULT_MAPPING,
  ).toEqual({
    rowCardinality: "exactly_one",
    wireColumns: [
      "disposition",
      "position_id",
      "position_version",
      "initial_history_identity",
    ],
    permittedDispositions: ["created", "replayed"],
    initialPositionVersion: 1,
    initialHistoryIdentityFormat:
      "position_id:authenticated_server_owner:initial_position_version",
    legacySnapshotLinkCountPermitted: false,
  });
  expect(
    contract.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT,
  ).toMatchObject({
    parameterOrder: [
      "authenticated_server_owner",
      "opaque_recommendation_reference",
      "canonical_command_digest",
    ],
    transportImplementationPresent: false,
    credentialContainmentImplementationPresent: false,
    canonicalDigestBuilderPresent: false,
    committedResultDecoderPresent: false,
    v2AdapterImplementationPresent: false,
    concreteCommandPortBindingPresent: false,
    databaseOperationPresent: false,
    writerInvocationPresent: false,
    routeOrUiBindingPresent: false,
    productionAuthorityGranted: false,
  });
  expect(
    Object.isFrozen(
      contract.POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT,
    ),
  ).toBe(true);
});

test("666FC binds the exact-main predecessor and the V2-only result shape", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(sha256(raw)).toBe(evidenceSha256);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "4c97bfea15a32053fdc87469be5cf5534ebf2ebe",
    exact_main_ci_run: 32840102542,
    exact_main_ci_conclusion: "success",
    action_666fb_evidence_path:
      "docs/evidence/action-666fb-position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.json",
  });
  expect(evidence.proven_private_database_boundary).toEqual({
    action_666ez_catalog_proof_path:
      "docs/evidence/action-666ez-position-version-lineage-v2-writer-production-apply-and-catalog-proof.json",
    private_schema_is_non_data_api: true,
    writer_routine_signature:
      "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
    writer_routine_fixed_empty_search_path: true,
    writer_routine_service_role_execution_restricted: true,
    receipt_direct_access_denied: true,
  });
  expect(evidence.frozen_source_contract).toEqual({
    parameter_order: [
      "authenticated_server_owner",
      "opaque_recommendation_reference",
      "canonical_command_digest",
    ],
    canonical_digest_projection_fields: [
      "contract_version",
      "routine_signature",
      "authenticated_server_owner",
      "opaque_recommendation_reference",
    ],
    canonical_digest_algorithm: "sha256_lowercase_hex",
    committed_result_wire_columns: [
      "disposition",
      "position_id",
      "position_version",
      "initial_history_identity",
    ],
    committed_result_dispositions: ["created", "replayed"],
    initial_position_version: 1,
    legacy_snapshot_link_count_permitted: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_v2_writer_private_non_data_api_command_port_source_contract",
    private_transport_implemented: false,
    concrete_private_command_port_binding_admitted: false,
    next_bounded_objective:
      "position_version_lineage_v2_writer_private_non_data_api_transport_implementation_preflight",
    runtime_activation_authorized: false,
  });
});

test("666FC derives no public client surface or legacy result field from the private routine", () => {
  const migration = source(migrationPath);
  const generatedTypes = source(generatedTypesPath);
  const legacyAdapter = source(legacyAdapterPath);
  const contractSource = source(modulePath);

  expect(migration).toContain(
    "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)",
  );
  expect(migration).toContain("returns table (");
  expect(migration).toContain("initial_history_identity text");
  expect(generatedTypes).not.toContain("private:");
  expect(legacyAdapter).toContain("application_open_owned_position_v1");
  expect(legacyAdapter).toContain("snapshotLinkCount");
  expect(contractSource).toContain("legacySnapshotLinkCountPermitted: false");
  expect(contractSource).not.toMatch(
    /\b(?:fetch|createClient|execute_sql|insert|update|delete|select|rpc)\s*\(/,
  );
  expect(contractSource).not.toMatch(/process\.env|from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/);
});

test("666FC remains source-only, secret-free, roadmap-bound and registered once", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).toMatch(/no database client/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666fc/i);
  expect(source(ledgerPath)).toMatch(/action 666fc/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
