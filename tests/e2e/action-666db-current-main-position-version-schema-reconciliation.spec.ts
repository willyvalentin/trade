import { expect, test } from "@playwright/test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const evidencePath =
  "docs/evidence/action-666db-current-main-position-version-schema-reconciliation.json";
const evidenceSha256 =
  "8fe5c65ef6bbf1fa99f0169404f15b9c40d8562ad893d7d92ac240d8aa3b4a26";
const actionPath =
  "docs/action-666db-current-main-position-version-schema-reconciliation.md";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const thisTest =
  "tests/e2e/action-666db-current-main-position-version-schema-reconciliation.spec.ts";

const sourceHashes = {
  provider_catalog:
    "0677648d6f0b144f89612f8bd3b814ab96f964b688fc1525e4b0d5f4e54f4d6f",
  provider_typegen:
    "d585cce5a5911611d691589d2574330c909495ce28041fafc9caac1dbb45194e",
  generated_types:
    "f23c3702ffd931cb5d81f13e19a8515125817717e9a3fad7ac85e40795729029",
  owner_migration:
    "fd8330d8156d454a79721126f1cc054d07e893452e70a7a9616cdf72ec5219f7",
  transaction_migration:
    "b9547df1cd7ce2334f3df9adf277ce7b4b3d1f3ce2aa687c11045008420a1b92",
  dependency_gate:
    "53be2972997aba35370cec8985b42f9e7f061b53022b70b8a5797c993636182a",
  trade_management_contract_manifest:
    "15b689bab4451ee6adf1cb5d215f4d331101ebf27ab20f1c0dd7d31591430cde",
  canonical_recommendation_identity_contract:
    "dff476d941ecdf3246421101694033968624b52f1b4d1a6444daf3ed4d63c215",
  canonical_recommendation_identity_source:
    "e236c2bfd1baa692f8aa54b3370873ee19fe21a1ee8281839f5e5dad7c3a23cc",
  evaluator:
    "8c0854aad8a1d53dc06340d0984ebe786ea2d960265ecf49f5366d2a74de5be6",
} as const;

const sourcePaths = {
  provider_catalog:
    "docs/evidence/action-660-ma09-generated-types-provenance-v2/provider-catalog-response-v2.json",
  provider_typegen:
    "docs/evidence/action-660-ma09-generated-types-provenance-v2/provider-typegen-response-v2.json",
  generated_types: "lib/supabase-database.types.ts",
  owner_migration:
    "supabase/migrations/20260811163228_add_fail_closed_application_owner_foundation.sql",
  transaction_migration:
    "supabase/migrations/20260724001500_create_transactional_open_position_command.sql",
  dependency_gate:
    "docs/action-655a-server-owned-trade-management-dependency-gate.json",
  trade_management_contract_manifest:
    "docs/action-655a-server-owned-trade-management-contract-manifest.json",
  canonical_recommendation_identity_contract:
    "docs/action-664a-canonical-recommendation-evaluation-contract.md",
  canonical_recommendation_identity_source:
    "lib/canonical-recommendation-evaluation.ts",
  evaluator: "lib/action-655b-canonical-exit-evaluator.ts",
} as const;

const documentHashes = {
  [actionPath]:
    "be11d2beca725a1bde42382543f29a09a66ec8e1e58758aaee66fefafa6fa24d",
  [ledgerPath]:
    "22a65a252e828829db94e0f5e5d8a2c9b775c28f224115b81af7d2c8965f1c19",
  [roadmapPath]:
    "32933942a4f271b57a878fe06cc08bacfec687cb36e2fe5dfaca10a7d1406b08",
} as const;

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

type CatalogColumn = {
  column_name: string;
  data_type: string;
  has_default: boolean;
  is_nullable: boolean;
  ordinal_position: number;
  table_name: string;
  table_schema: string;
};

type CatalogForeignKey = {
  constraint_name: string;
  source_columns: string[];
  source_schema: string;
  source_table: string;
  target_columns: string[];
  target_schema: string;
  target_table: string;
};

type ProviderCatalog = Array<{
  catalog_snapshot: {
    catalog: {
      columns: CatalogColumn[];
      foreign_keys: CatalogForeignKey[];
    };
  };
}>;

function columnProjection(columns: CatalogColumn[], tableName: string) {
  return columns
    .filter(
      (column) =>
        column.table_schema === "public" && column.table_name === tableName,
    )
    .sort((left, right) => left.ordinal_position - right.ordinal_position);
}

function criticalColumn(columns: CatalogColumn[], name: string) {
  const column = columns.find((candidate) => candidate.column_name === name);
  assert(column, `missing catalog column ${name}`);
  return {
    data_type: column.data_type,
    is_nullable: column.is_nullable,
  };
}

function currentSchemaFromCatalog(providerCatalog: ProviderCatalog) {
  assert.equal(providerCatalog.length, 1);
  const catalog = providerCatalog[0].catalog_snapshot.catalog;
  const positions = columnProjection(catalog.columns, "positions");
  const recommendations = columnProjection(catalog.columns, "recommendations");
  const lineageForeignKeys = catalog.foreign_keys
    .filter(
      (foreignKey) =>
        (foreignKey.source_table === "positions" &&
          ["recommendations", "users"].includes(foreignKey.target_table)) ||
        (foreignKey.source_table === "recommendations" &&
          foreignKey.target_table === "users"),
    )
    .map((foreignKey) => ({
      constraint_name: foreignKey.constraint_name,
      source_table: foreignKey.source_table,
      source_columns: foreignKey.source_columns,
      target_schema: foreignKey.target_schema,
      target_table: foreignKey.target_table,
      target_columns: foreignKey.target_columns,
    }));

  return {
    positions: {
      column_count: 20,
      columns: positions.map((column) => column.column_name),
      owner_user_id: criticalColumn(positions, "owner_user_id"),
      recommendation_id: criticalColumn(positions, "recommendation_id"),
    },
    recommendations: {
      column_count: 21,
      columns: recommendations.map((column) => column.column_name),
      owner_user_id: criticalColumn(recommendations, "owner_user_id"),
    },
    lineage_foreign_keys: lineageForeignKeys,
    missing_required_columns: {
      positions: [
        "position_version",
        "durable_recommendation_version",
        "recommendation_identity",
        "recommendation_normative_digest",
      ],
      recommendations: [
        "recommendation_version",
        "recommendation_identity",
        "recommendation_normative_digest",
      ],
    },
    owner_bound_open_position_command:
      "application_open_owned_position_v1",
    owner_bound_open_position_command_verifies_durable_recommendation_lineage:
      false,
    exit_evaluator_recommendation_identity_pattern:
      "^rec_decision:v1:[0-9a-f]{64}$",
    exit_evaluator_identity_matches_canonical_recommendation_identity_v1:
      false,
    position_version_schema_status: "absent_unresolved",
  };
}

function expectedEvidence(currentSchema: ReturnType<typeof currentSchemaFromCatalog>) {
  return {
    contract_version:
      "trade.action666db.current-main-position-version-schema-reconciliation.v1",
    observed_at: "2026-08-19T21:46:14Z",
    authority: {
      repository: "willyvalentin/trade",
      main_commit: "c67ec9280bf5b4ff9f57930f79b7e62bd4ec750a",
      main_tree: "96012987bf59322f2a4b27202a6946ee668f4556",
      main_parents: [
        "e9c3355125a54f4f9ba55ada2ac55fc91b184647",
        "93ca8bd41a15a5b6e482779b252406b5639d81b7",
      ],
      main_pull_request: 120,
      exact_main_ci_run: 32301932410,
      exact_main_ci_conclusion: "success",
      required_check: "provider-free-verification",
      required_check_app_id: 15368,
    },
    schema_authority: {
      selected_schemas: ["public"],
      provider_catalog_path: sourcePaths.provider_catalog,
      provider_catalog_sha256: sourceHashes.provider_catalog,
      provider_typegen_path: sourcePaths.provider_typegen,
      provider_typegen_sha256: sourceHashes.provider_typegen,
      generated_types_path: sourcePaths.generated_types,
      generated_types_sha256: sourceHashes.generated_types,
      owner_migration_path: sourcePaths.owner_migration,
      owner_migration_sha256: sourceHashes.owner_migration,
      transaction_migration_path: sourcePaths.transaction_migration,
      transaction_migration_sha256: sourceHashes.transaction_migration,
      dependency_gate_path: sourcePaths.dependency_gate,
      dependency_gate_sha256: sourceHashes.dependency_gate,
      trade_management_contract_manifest_path:
        sourcePaths.trade_management_contract_manifest,
      trade_management_contract_manifest_sha256:
        sourceHashes.trade_management_contract_manifest,
      canonical_recommendation_identity_contract_path:
        sourcePaths.canonical_recommendation_identity_contract,
      canonical_recommendation_identity_contract_sha256:
        sourceHashes.canonical_recommendation_identity_contract,
      canonical_recommendation_identity_source_path:
        sourcePaths.canonical_recommendation_identity_source,
      canonical_recommendation_identity_source_sha256:
        sourceHashes.canonical_recommendation_identity_source,
      evaluator_path: sourcePaths.evaluator,
      evaluator_sha256: sourceHashes.evaluator,
    },
    current_schema: currentSchema,
    frozen_target_contract: {
      contract_id: "position_version_schema_v1",
      version_sql_type: "bigint",
      minimum_version: 1,
      maximum_version: 9007199254740991,
      recommendation_identity_contract:
        "canonical_recommendation_identity_v1",
      recommendation_identity_shape:
        "rec_decision:v1:<encoded source namespace>:<encoded producer decision id>:<decision epoch milliseconds>",
      digest_pattern: "^[0-9a-f]{64}$",
      recommendations_required_columns: [
        "recommendation_version",
        "recommendation_identity",
        "recommendation_normative_digest",
      ],
      positions_required_columns: [
        "position_version",
        "durable_recommendation_version",
        "recommendation_identity",
        "recommendation_normative_digest",
      ],
      positions_recommendation_id_not_null_after_backfill: true,
      current_position_compare_and_swap_tuple: [
        "id",
        "owner_user_id",
        "position_version",
      ],
      current_position_row_is_version_reference_target: false,
      append_only_position_version_history_required_for_version_bound_references:
        true,
      initial_position_version: 1,
      mutation_increment: 1,
      owner_scoped_compare_and_swap_required: true,
      client_can_choose_owner_or_versions: false,
      locked_recommendation_tuple: [
        "recommendation_id",
        "owner_user_id",
        "recommendation_version",
        "recommendation_identity",
        "recommendation_normative_digest",
      ],
      transaction_dispositions: [
        "created",
        "replayed",
        "conflict",
        "recommendation_binding_conflict",
        "stale_recommendation_version",
        "refused",
        "rolled_back",
      ],
      all_effects_atomic_or_rolled_back: true,
    },
    migration_gates: {
      read_only_legacy_row_inventory_required: true,
      deterministic_backfill_contract_required: true,
      exit_evaluator_identity_contract_reconciliation_required: true,
      immutable_position_version_history_design_required: true,
      source_migration_review_required: true,
      isolated_staging_apply_required: true,
      cross_owner_and_stale_version_tests_required: true,
      production_apply_requires_separate_operator_authority: true,
      generated_types_and_ma09_provenance_refresh_required: true,
      migration_authorized_by_this_action: false,
      position_version_schema_closed_by_this_action: false,
      next_bounded_objective:
        "position_version_schema_migration_design_and_read_only_backfill_preflight",
    },
    preserved_separate_blockers: [
      "exit_evaluator_recommendation_identity_contract",
      "append_only_position_version_history",
      "market_observation_provenance",
      "durable_exit_queue_schema",
      "transactional_recommendation_position_runtime_handoff",
      "client_projection_and_mutation_commands",
    ],
    candidate_canonicalization_conditions: {
      exact_head_ci_success: false,
      independent_read_only_review_no_blocking_findings: false,
      explicit_operator_approval_of_pr_and_exact_head: false,
      ordinary_protected_pr_merge_verified: false,
      exact_reviewed_scope_merged: false,
      exact_main_ci_success: false,
      all_satisfied: false,
    },
    source_document_sha256: documentHashes,
    scope_limits: {
      governance_and_schema_planning_only: true,
      application_source_mutation: false,
      runtime_mutation: false,
      database_or_supabase_mutation: false,
      migration_file_added: false,
      generated_types_changed: false,
      provider_configuration_or_data_mutation: false,
      production_deployment: false,
      broker_or_execution_authority: false,
    },
  };
}

function generatedRowFields(types: string, table: string) {
  const tableStart = types.indexOf(`      ${table}: {`);
  assert.notEqual(tableStart, -1);
  const rowStart = types.indexOf("        Row: {", tableStart);
  const insertStart = types.indexOf("        Insert: {", rowStart);
  assert.notEqual(rowStart, -1);
  assert.notEqual(insertStart, -1);
  return types
    .slice(rowStart, insertStart)
    .split("\n")
    .flatMap((line) => {
      const match = /^          ([a-z0-9_]+):/.exec(line);
      return match ? [match[1]] : [];
    });
}

type PathSegment = string | number;

function targetAt(root: unknown, pathSegments: PathSegment[]) {
  let target = root;
  for (const segment of pathSegments) {
    target = (target as Record<PathSegment, unknown>)[segment];
  }
  return target;
}

function collectPaths(value: unknown, parent: PathSegment[] = []) {
  const paths: PathSegment[][] = [];
  if (!value || typeof value !== "object") return paths;
  for (const key of Object.keys(value)) {
    const segment = Array.isArray(value) ? Number(key) : key;
    const childPath = [...parent, segment];
    paths.push(childPath);
    paths.push(...collectPaths(targetAt(value, [segment]), childPath));
  }
  return paths;
}

test("binds exact main and proves the current position-version schema gap", async () => {
  const [rawEvidence, rawCatalog] = await Promise.all([
    source(evidencePath),
    source(sourcePaths.provider_catalog),
  ]);
  expect(sha256(rawEvidence)).toBe(evidenceSha256);
  const catalog = JSON.parse(rawCatalog) as ProviderCatalog;
  const expected = expectedEvidence(currentSchemaFromCatalog(catalog));
  expect(() => assert.deepStrictEqual(JSON.parse(rawEvidence), expected)).not.toThrow();

  expect(expected.current_schema.positions.column_count).toBe(20);
  expect(expected.current_schema.recommendations.column_count).toBe(21);
  expect(expected.current_schema.position_version_schema_status).toBe(
    "absent_unresolved",
  );
  expect(expected.migration_gates.migration_authorized_by_this_action).toBe(
    false,
  );
});

test("binds catalog, generated types, migrations and the evaluator contract", async () => {
  for (const key of Object.keys(sourcePaths) as Array<keyof typeof sourcePaths>) {
    expect(sha256(await source(sourcePaths[key]))).toBe(sourceHashes[key]);
  }

  const [
    rawCatalog,
    generatedTypes,
    ownerMigration,
    transactionMigration,
    dependencyRaw,
    tradeManagementManifestRaw,
    canonicalIdentityContract,
    canonicalIdentitySource,
    evaluator,
  ] =
    await Promise.all([
      source(sourcePaths.provider_catalog),
      source(sourcePaths.generated_types),
      source(sourcePaths.owner_migration),
      source(sourcePaths.transaction_migration),
      source(sourcePaths.dependency_gate),
      source(sourcePaths.trade_management_contract_manifest),
      source(sourcePaths.canonical_recommendation_identity_contract),
      source(sourcePaths.canonical_recommendation_identity_source),
      source(sourcePaths.evaluator),
    ]);
  const current = currentSchemaFromCatalog(
    JSON.parse(rawCatalog) as ProviderCatalog,
  );
  expect(generatedRowFields(generatedTypes, "positions").sort()).toEqual(
    [...current.positions.columns].sort(),
  );
  expect(generatedRowFields(generatedTypes, "recommendations").sort()).toEqual(
    [...current.recommendations.columns].sort(),
  );
  for (const missing of current.missing_required_columns.positions) {
    expect(generatedRowFields(generatedTypes, "positions")).not.toContain(missing);
  }
  for (const missing of current.missing_required_columns.recommendations) {
    expect(generatedRowFields(generatedTypes, "recommendations")).not.toContain(
      missing,
    );
  }

  expect(ownerMigration).toContain("positions_recommendation_owner_fkey");
  expect(ownerMigration).toContain("app_open_owned_position_transaction");
  expect(ownerMigration).toContain("application_open_owned_position_v1");
  expect(ownerMigration).not.toContain("durable_recommendation_version");
  expect(transactionMigration).toContain("application_open_position_v1");

  expect(canonicalIdentityContract).toContain(
    "rec_decision:v1:<encoded source namespace>:<encoded producer decision id>:<decision epoch milliseconds>",
  );
  expect(canonicalIdentitySource).toContain("encodeURIComponent(sourceNamespace)");
  expect(canonicalIdentitySource).toContain("encodeURIComponent(decisionId)");
  const tradeManagementManifest = JSON.parse(tradeManagementManifestRaw) as {
    existing_identity_reuse: Record<string, string>;
  };
  expect(tradeManagementManifest.existing_identity_reuse).toMatchObject({
    recommendation_identity:
      "rec_decision:v1_with_required_durable_row_binding",
  });
  expect(evaluator).toContain("!/^rec_decision:v1:[0-9a-f]{64}$/.test");

  const dependencyGate = JSON.parse(dependencyRaw) as {
    dependencies: Array<Record<string, unknown>>;
  };
  expect(
    dependencyGate.dependencies.find(
      (dependency) => dependency.dependency_id === "position_version_schema",
    ),
  ).toMatchObject({
    status: "unresolved",
    evidence: {
      current_explicit_position_version: false,
      required_contract: "action_655a6_position_snapshot_v3",
    },
  });
  for (const required of [
    '"position_version"',
    '"durable_recommendation_version"',
    '"recommendation_identity"',
    '"recommendation_normative_digest"',
  ]) {
    expect(evaluator).toContain(required);
  }
});

test("freezes the target and the later migration gates without runtime authority", async () => {
  for (const [file, expectedHash] of Object.entries(documentHashes)) {
    expect(sha256(await source(file))).toBe(expectedHash);
  }
  const [action, roadmap, ledger, registration] = await Promise.all([
    source(actionPath),
    source(roadmapPath),
    source(ledgerPath),
    source(registrationPath),
  ]);
  for (const text of [action, roadmap, ledger]) {
    expect(text).toContain("position_version_schema_v1");
    expect(text).toContain(
      "position_version_schema_migration_design_and_read_only_backfill_preflight",
    );
    expect(text).not.toMatch(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
    );
  }
  expect(action).toContain("Production deployment is not authorized.");
  expect(action).toContain("It performs no");
  expect(action).toContain("migration");
  const registeredTests = JSON.parse(registration) as string[];
  expect(registeredTests.filter((file) => file === thisTest)).toEqual([
    thisTest,
  ]);
});

test("rejects deletion, value, shape and extra-key drift recursively", async () => {
  const [rawEvidence, rawCatalog] = await Promise.all([
    source(evidencePath),
    source(sourcePaths.provider_catalog),
  ]);
  const expected = expectedEvidence(
    currentSchemaFromCatalog(JSON.parse(rawCatalog) as ProviderCatalog),
  );
  const validate = (value: unknown) => assert.deepStrictEqual(value, expected);
  expect(() => validate(JSON.parse(rawEvidence))).not.toThrow();

  const paths = collectPaths(expected);
  expect(paths.length).toBeGreaterThan(150);
  for (const pathSegments of paths) {
    const deleted = structuredClone(expected) as unknown;
    const parent = targetAt(deleted, pathSegments.slice(0, -1)) as Record<
      PathSegment,
      unknown
    >;
    delete parent[pathSegments.at(-1) as PathSegment];
    expect(() => validate(deleted)).toThrow();
  }

  for (const pathSegments of paths.filter((segments) => {
    const value = targetAt(expected, segments);
    return value === null || typeof value !== "object";
  })) {
    const changed = structuredClone(expected) as unknown;
    const parent = targetAt(changed, pathSegments.slice(0, -1)) as Record<
      PathSegment,
      unknown
    >;
    const key = pathSegments.at(-1) as PathSegment;
    const current = parent[key];
    parent[key] = typeof current === "boolean" ? !current : "unexpected-drift";
    expect(() => validate(changed)).toThrow();
  }

  const extra = structuredClone(expected) as Record<string, unknown>;
  extra.unexpected = true;
  expect(() => validate(extra)).toThrow();
});
