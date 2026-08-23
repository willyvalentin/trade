import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666ed-transactional-recommendation-position-writer-owner-bound-command-port-preflight.md";
const evidencePath = "docs/evidence/action-666ed-transactional-recommendation-position-writer-owner-bound-command-port-preflight.json";
const modulePath = "lib/transactional-recommendation-position-writer-owner-bound-command-port-preflight.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666ed-transactional-recommendation-position-writer-owner-bound-command-port-preflight.spec.ts";
const evidenceSha256 = "a9c9862a6dbccca25afcb79f6fb5fa7fe6edfc2985963312bf851ded7147f3bc";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

function loadPreflightModule() {
  const transpiled = ts.transpileModule(source(modulePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: modulePath,
  }).outputText;
  const sandbox = { exports: {} as Record<string, unknown> };
  vm.runInNewContext(transpiled, sandbox, { filename: modulePath });
  return sandbox.exports as {
    TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT_VERSION: string;
    TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT_REQUIREMENTS: readonly string[];
    TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT: Record<string, unknown>;
  };
}

test("666ED makes the current v1 routine non-admissible for the injected adapter", () => {
  const preflight = loadPreflightModule();
  expect(preflight.TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT_VERSION).toBe(
    "transactional_recommendation_position_writer_owner_bound_command_port_preflight_v1",
  );
  expect(preflight.TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT_REQUIREMENTS).toEqual([
    "server_only_security_definer_boundary_with_fixed_search_path",
    "service_role_only_command_execution",
    "locked_owner_scoped_recommendation_with_durable_version",
    "canonical_recommendation_identity_and_normative_digest",
    "position_lineage_copy_with_initial_position_version",
    "append_only_owner_scoped_position_history_insert",
    "one_transaction_for_current_position_history_and_recommendation_state",
    "retry_replays_the_same_owner_bound_durable_effect",
  ]);
  expect(Object.isFrozen(preflight.TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT)).toBe(true);
  expect(preflight.TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_COMMAND_PORT_PREFLIGHT).toMatchObject({
    existingV1SecurityBoundaryRetained: true,
    existingV1HasFixedSearchPath: true,
    existingV1IsServiceRoleOnly: true,
    positionVersionHistoryRelationPresent: true,
    recommendationDurableLineagePresent: false,
    positionDurableLineagePresent: false,
    existingV1WritesAppendOnlyHistory: false,
    existingV1ProvesPairedEffectAtomicity: false,
    existingV1CommandAdmissible: false,
    concreteCommandPortBindingAdmitted: false,
    databaseOperationPresent: false,
    runtimeWiringPresent: false,
    productionAuthorityGranted: false,
  });
});

test("666ED pins protected-main and aggregate-only production parity evidence", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "487ec4d71d5f8e5584be3007279cf3231aa5eea4",
    exact_main_ci_run: 32668699813,
    exact_main_ci_conclusion: "success",
  });
  expect(evidence.production_read_only_observation).toMatchObject({
    scope: "catalog_and_aggregate_inventory_only",
    security_definer: true,
    fixed_search_path: ["pg_catalog", "public"],
    execute_grantees: ["postgres", "service_role"],
    position_version_history_present: true,
    recommendation_durable_lineage_columns_present: false,
    position_durable_lineage_columns_present: false,
    v1_history_insert_present: false,
    row_contents_or_identifiers_returned: false,
  });
  expect(evidence.production_read_only_observation.aggregate_counts).toEqual({
    recommendations: 1068,
    positions: 8,
    positions_without_recommendation: 0,
    position_version_history: 0,
    taken_recommendations: 8,
    open_positions: 0,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed: "transactional_recommendation_to_position_writer_owner_bound_command_port_preflight",
    next_bounded_objective: "position_version_lineage_additive_migration_package",
    existing_v1_command_admissible: false,
    concrete_port_bound: false,
    production_authority_granted: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
});

test("666ED remains an inert source preflight and is registered once", () => {
  const moduleSource = source(modulePath);
  expect(moduleSource).not.toMatch(/\b(?:fetch|createClient|execute_sql|insert|update|delete|select|rpc)\s*\(/);
  expect(moduleSource).not.toMatch(/from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/);
  const documentation = `${source(actionPath)}\n${source(evidencePath)}`;
  expect(documentation).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(documentation).toMatch(/fail-closed/i);
  expect(documentation).toMatch(/no\s+database\s+client/i);
  expect(source(roadmapPath)).toMatch(/action 666ed/i);
  expect(source(ledgerPath)).toMatch(/action 666ed/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
