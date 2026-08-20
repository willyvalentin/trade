import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");
const actionPath =
  "docs/action-666dc-position-version-schema-migration-design-and-read-only-backfill-preflight.md";
const evidencePath =
  "docs/evidence/action-666dc-position-version-schema-migration-design-and-read-only-backfill-preflight.json";
const sqlPath =
  "scripts/action-666dc-position-version-read-only-backfill-preflight.sql";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath =
  "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666dc-position-version-schema-migration-design-and-read-only-backfill-preflight.spec.ts";
const evidenceSha256 =
  "6e713ed26934038d7e3f57ab5601cba07df5671acccbf1f076399e24bb162a16";
const canonicalRevision = "cb501d3ad3626be1bb13429a9791574a2040b64e";

const sourcePaths = {
  predecessor_action:
    "docs/action-666db-current-main-position-version-schema-reconciliation.md",
  predecessor_evidence:
    "docs/evidence/action-666db-current-main-position-version-schema-reconciliation.json",
  predecessor_oracle:
    "tests/e2e/action-666db-current-main-position-version-schema-reconciliation.spec.ts",
  provider_catalog:
    "docs/evidence/action-660-ma09-generated-types-provenance-v2/provider-catalog-response-v2.json",
  generated_types: "lib/supabase-database.types.ts",
  owner_migration:
    "supabase/migrations/20260811163228_add_fail_closed_application_owner_foundation.sql",
  canonical_identity_contract:
    "docs/action-664a-canonical-recommendation-evaluation-contract.md",
  canonical_identity_source: "lib/canonical-recommendation-evaluation.ts",
  exit_evaluator: "lib/action-655b-canonical-exit-evaluator.ts",
} as const;

const sourceHashes = {
  predecessor_action:
    "be11d2beca725a1bde42382543f29a09a66ec8e1e58758aaee66fefafa6fa24d",
  predecessor_evidence:
    "1a92b2a5db488179b96b9b798f56b05c026a414ca6ff829d384b14cc33a7a995",
  predecessor_oracle:
    "45008de7518f546cdfa1a6f419d4b41d1bf617a6442aa16af61bef0c015f7e5f",
  provider_catalog:
    "0677648d6f0b144f89612f8bd3b814ab96f964b688fc1525e4b0d5f4e54f4d6f",
  generated_types:
    "f23c3702ffd931cb5d81f13e19a8515125817717e9a3fad7ac85e40795729029",
  owner_migration:
    "fd8330d8156d454a79721126f1cc054d07e893452e70a7a9616cdf72ec5219f7",
  canonical_identity_contract:
    "dff476d941ecdf3246421101694033968624b52f1b4d1a6444daf3ed4d63c215",
  canonical_identity_source:
    "e236c2bfd1baa692f8aa54b3370873ee19fe21a1ee8281839f5e5dad7c3a23cc",
  exit_evaluator:
    "8c0854aad8a1d53dc06340d0984ebe786ea2d960265ecf49f5366d2a74de5be6",
} as const;

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

function canonicalSource(relativePath: string) {
  return execFileSync("git", ["show", `${canonicalRevision}:${relativePath}`], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function countOccurrences(value: string, fragment: string) {
  return value.split(fragment).length - 1;
}

function hasFailClosedInventoryBindings(sql: string) {
  const normalized = sql.toLowerCase();
  const foreignKeyEnd = normalized.indexOf(
    ") as owner_bound_foreign_key_valid,",
  );
  const recommendationIndexEnd = normalized.indexOf(
    ") as recommendation_owner_unique_index_valid,",
  );
  const positionIndexEnd = normalized.indexOf(
    ") as position_owner_reference_index_valid,",
  );
  if (
    foreignKeyEnd < 0 ||
    recommendationIndexEnd <= foreignKeyEnd ||
    positionIndexEnd <= recommendationIndexEnd
  ) {
    return false;
  }

  const recommendationIndexGuard = normalized.slice(
    foreignKeyEnd,
    recommendationIndexEnd,
  );
  const positionIndexGuard = normalized.slice(
    recommendationIndexEnd,
    positionIndexEnd,
  );
  const recommendationBinding =
    "and x.indrelid = 'public.recommendations'::regclass";
  const positionBinding = "and x.indrelid = 'public.positions'::regclass";

  return (
    countOccurrences(normalized, "set local row_security = off;") === 1 &&
    normalized.includes(
      "'row_security_fail_closed', current_setting('row_security') = 'off'",
    ) &&
    countOccurrences(recommendationIndexGuard, recommendationBinding) === 1 &&
    countOccurrences(positionIndexGuard, positionBinding) === 1
  );
}

function gitGrep(pattern: string, paths: string[]) {
  try {
    return execFileSync("git", ["grep", "-l", pattern, "--", ...paths], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 1
    ) {
      return "";
    }
    throw error;
  }
}

type Evidence = {
  contract_version: string;
  observed_at: string;
  authority: Record<string, unknown>;
  predecessor: Record<string, unknown>;
  schema_authority: Record<string, unknown>;
  preflight_contract: {
    contract_id: string;
    sql_path: string;
    sql_sha256: string;
    transaction_isolation: string;
    transaction_read_only: boolean;
    statement_timeout: string;
    lock_timeout: string;
    idle_in_transaction_session_timeout: string;
    search_path: string;
    row_security: string;
    policy_filtered_inventory_allowed: boolean;
    fully_qualified_application_relations: boolean;
    index_guard_relations: Record<string, string>;
    single_jsonb_result: boolean;
    result_groups: Record<string, string[]>;
    stop_conditions: string[];
    privacy: Record<string, boolean>;
    execution: Record<string, unknown>;
  };
  migration_design: Record<string, unknown>;
  remaining_gates: Record<string, unknown>;
  preserved_separate_blockers: string[];
  candidate_canonicalization_conditions: Record<string, boolean>;
  source_document_sha256: Record<string, string>;
  scope_limits: Record<string, boolean>;
};

type CatalogColumn = {
  column_name: string;
  table_name: string;
  table_schema: string;
};

type ProviderCatalog = Array<{
  catalog_snapshot: {
    catalog: {
      columns: CatalogColumn[];
    };
  };
}>;

test("pins exact main, predecessor and closed evidence shape", async () => {
  const rawEvidence = await source(evidencePath);
  expect(sha256(rawEvidence)).toBe(evidenceSha256);
  const evidence = JSON.parse(rawEvidence) as Evidence;

  expect(Object.keys(evidence)).toEqual([
    "contract_version",
    "observed_at",
    "authority",
    "predecessor",
    "schema_authority",
    "preflight_contract",
    "migration_design",
    "remaining_gates",
    "preserved_separate_blockers",
    "candidate_canonicalization_conditions",
    "source_document_sha256",
    "scope_limits",
  ]);
  expect(evidence.contract_version).toBe(
    "trade.action666dc.position-version-schema-migration-design-and-read-only-backfill-preflight.v1",
  );
  expect(evidence.authority).toEqual({
    repository: "willyvalentin/trade",
    main_commit: "a80f3a8856121edb4260909ac1cedcf638d421b8",
    main_tree: "331625c5486aa4f50828762e6b0e758d251b346a",
    main_parents: [
      "dbeed25f2074bff4dba8cee7f6d511cb17992efc",
      "92e5ae9b444e3b773d9c7ff40aad3d60037909f6",
    ],
    main_pull_request: 126,
    exact_main_ci_run: 32401750100,
    exact_main_ci_conclusion: "success",
    required_check: "provider-free-verification",
    required_check_app_id: 15368,
    production_commit: "dbeed25f2074bff4dba8cee7f6d511cb17992efc",
    production_is_direct_first_parent_of_main: true,
    production_equals_main: false,
  });
  expect(evidence.predecessor).toEqual({
    contract_id: "position_version_schema_v1",
    action_path: sourcePaths.predecessor_action,
    action_sha256: sourceHashes.predecessor_action,
    evidence_path: sourcePaths.predecessor_evidence,
    evidence_sha256: sourceHashes.predecessor_evidence,
    oracle_path: sourcePaths.predecessor_oracle,
    oracle_sha256: sourceHashes.predecessor_oracle,
    former_next_bounded_objective:
      "position_version_schema_migration_design_and_read_only_backfill_preflight",
  });
});

test("binds source authority and still proves the seven-column schema gap", async () => {
  for (const key of Object.keys(sourcePaths) as Array<keyof typeof sourcePaths>) {
    expect(sha256(await source(sourcePaths[key]))).toBe(sourceHashes[key]);
  }
  const catalog = JSON.parse(
    await source(sourcePaths.provider_catalog),
  ) as ProviderCatalog;
  expect(catalog).toHaveLength(1);
  const columns = catalog[0].catalog_snapshot.catalog.columns;
  const positions = columns
    .filter(
      (column) =>
        column.table_schema === "public" && column.table_name === "positions",
    )
    .map((column) => column.column_name);
  const recommendations = columns
    .filter(
      (column) =>
        column.table_schema === "public" &&
        column.table_name === "recommendations",
    )
    .map((column) => column.column_name);
  expect(positions).toHaveLength(20);
  expect(recommendations).toHaveLength(21);
  for (const missing of [
    "position_version",
    "durable_recommendation_version",
    "recommendation_identity",
    "recommendation_normative_digest",
  ]) {
    expect(positions).not.toContain(missing);
  }
  for (const missing of [
    "recommendation_version",
    "recommendation_identity",
    "recommendation_normative_digest",
  ]) {
    expect(recommendations).not.toContain(missing);
  }

  const ownerMigration = await source(sourcePaths.owner_migration);
  expect(ownerMigration).toContain("recommendations_id_owner_user_id_uidx");
  expect(ownerMigration).toContain("positions_recommendation_owner_idx");
  expect(ownerMigration).toContain("positions_recommendation_owner_fkey");
  expect(ownerMigration).toContain("application_open_owned_position_v1");
  expect(ownerMigration).not.toContain("durable_recommendation_version");
});

test("freezes a bounded aggregate-only SQL transaction that cannot mutate", async () => {
  const [rawEvidence, sql] = await Promise.all([
    source(evidencePath),
    source(sqlPath),
  ]);
  const evidence = JSON.parse(rawEvidence) as Evidence;
  const contract = evidence.preflight_contract;
  expect(sha256(sql)).toBe(contract.sql_sha256);
  expect(contract.sql_path).toBe(sqlPath);
  expect(Object.keys(contract)).toEqual([
    "contract_id",
    "sql_path",
    "sql_sha256",
    "transaction_isolation",
    "transaction_read_only",
    "statement_timeout",
    "lock_timeout",
    "idle_in_transaction_session_timeout",
    "search_path",
    "row_security",
    "policy_filtered_inventory_allowed",
    "fully_qualified_application_relations",
    "index_guard_relations",
    "single_jsonb_result",
    "result_groups",
    "stop_conditions",
    "privacy",
    "execution",
  ]);
  expect(contract).toMatchObject({
    contract_id: "position_version_read_only_backfill_preflight_v1",
    transaction_isolation: "repeatable read",
    transaction_read_only: true,
    statement_timeout: "15s",
    lock_timeout: "1s",
    idle_in_transaction_session_timeout: "15s",
    search_path: "pg_catalog",
    row_security: "off",
    policy_filtered_inventory_allowed: false,
    fully_qualified_application_relations: true,
    index_guard_relations: {
      recommendation_owner_unique_index: "public.recommendations",
      position_owner_reference_index: "public.positions",
    },
    single_jsonb_result: true,
  });
  expect(contract.execution).toEqual({
    status: "not_run_requires_separate_explicit_operator_approval",
    authorized_by_this_action: false,
    database_contacted_by_this_action: false,
    result_evidence_exists: false,
    synthetic_result_substitution_allowed: false,
  });
  expect(contract.privacy).toEqual({
    aggregate_counts_and_booleans_only: true,
    row_contents_returned: false,
    row_identifiers_returned: false,
    owner_identifiers_returned: false,
    credentials_embedded: false,
  });

  const normalized = sql.trim().toLowerCase();
  expect(normalized).toMatch(
    /^begin transaction isolation level repeatable read read only;/,
  );
  expect(normalized.endsWith("rollback;")).toBe(true);
  expect(normalized).toContain("set local statement_timeout = '15s';");
  expect(normalized).toContain("set local lock_timeout = '1s';");
  expect(normalized).toContain(
    "set local idle_in_transaction_session_timeout = '15s';",
  );
  expect(normalized).toContain("set local search_path = pg_catalog;");
  expect(hasFailClosedInventoryBindings(sql)).toBe(true);
  expect(normalized).toContain("from public.recommendations");
  expect(normalized).toContain("from public.positions");
  expect(normalized).not.toMatch(
    /\b(?:insert|update|delete|merge|alter|create|drop|truncate|grant|revoke|copy|call|execute|prepare|set\s+role)\b/,
  );
  expect(normalized).not.toMatch(/select\s+\*/);
  expect(normalized).not.toMatch(
    /(?:postgres(?:ql)?:\/\/|service_role_key|supabase_service|begin (?:rsa |ec |openssh )?private key)/,
  );

  for (const keys of Object.values(contract.result_groups)) {
    for (const key of keys) {
      expect(sql).toContain(`'${key}'`);
    }
  }
  expect(contract.stop_conditions).toEqual([
    "recommendations_created_at_null_nonzero",
    "positions_recommendation_id_null_nonzero",
    "positions_orphaned_recommendation_nonzero",
    "positions_owner_mismatch_nonzero",
    "duplicate_owner_bound_link_groups_nonzero",
    "positions_lineage_copy_blocked_nonzero",
    "catalog_guard_false",
  ]);
});

test("rejects RLS-filtered inventory and index guards bound to the wrong table", async () => {
  const sql = await source(sqlPath);
  const recommendationBinding =
    "and x.indrelid = 'public.recommendations'::regclass";
  const positionBinding = "and x.indrelid = 'public.positions'::regclass";
  expect(hasFailClosedInventoryBindings(sql)).toBe(true);

  for (const mutation of [
    sql.replace("set local row_security = off;", ""),
    sql.replace("set local row_security = off;", "set local row_security = on;"),
    sql.replace(
      "'row_security_fail_closed', current_setting('row_security') = 'off',",
      "",
    ),
    sql.replace(recommendationBinding, ""),
    sql.replace(
      recommendationBinding,
      "and x.indrelid = 'public.positions'::regclass",
    ),
    sql.replace(positionBinding, ""),
    sql.replace(
      positionBinding,
      "and x.indrelid = 'public.recommendations'::regclass",
    ),
  ]) {
    expect(hasFailClosedInventoryBindings(mutation)).toBe(false);
  }
});

test("freezes phased constraints, privileges and remaining gates without authority", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  expect(evidence.migration_design).toEqual({
    target_contract: "position_version_schema_v1",
    phases: [
      "fresh_authorized_read_only_inventory",
      "deterministic_recommendation_lineage_backfill_contract",
      "add_nullable_columns_without_volatile_defaults",
      "bounded_owner_scoped_backfill",
      "separate_relationship_index_build",
      "add_named_not_valid_constraints",
      "separate_constraint_validation",
      "physical_not_null_activation_after_zero_null_readback",
      "server_only_owner_bound_v2_command",
      "isolated_staging_apply_and_adversarial_tests",
      "separately_authorized_production_apply",
      "post_migration_generated_types_and_ma09_refresh",
    ],
    required_columns: {
      recommendations: [
        "recommendation_version",
        "recommendation_identity",
        "recommendation_normative_digest",
      ],
      positions: [
        "position_version",
        "durable_recommendation_version",
        "recommendation_identity",
        "recommendation_normative_digest",
      ],
    },
    positions_recommendation_id_not_null_only_after_backfill: true,
    minimum_version: 1,
    maximum_version: 9007199254740991,
    canonical_recommendation_identity_contract:
      "canonical_recommendation_identity_v1",
    normative_digest_pattern: "^[0-9a-f]{64}$",
    constraints_added_not_valid_then_validated_separately: true,
    foreign_key_referencing_indexes_required: true,
    concurrent_indexes_separate_from_transactional_migration: true,
    current_position_tuple_is_cas_only: true,
    append_only_history_required_for_version_bound_references: true,
    security: {
      owner_scope_preserved: true,
      server_owned_lineage: true,
      security_definer_search_path_fixed: true,
      public_anon_authenticated_execute_revoked: true,
      new_client_data_api_grants: false,
      new_table_or_function_added_by_this_action: false,
    },
  });
  expect(evidence.remaining_gates).toEqual({
    next_bounded_objective:
      "authorized_position_version_read_only_backfill_inventory_execution",
    deterministic_backfill_contract_required: true,
    exit_evaluator_identity_reconciliation_required: true,
    append_only_position_version_history_decision_required: true,
    source_migration_review_required: true,
    isolated_staging_apply_required: true,
    production_apply_requires_separate_operator_authority: true,
    generated_types_and_ma09_refresh_required: true,
    position_version_schema_closed_by_this_action: false,
  });
  expect(evidence.candidate_canonicalization_conditions).toEqual({
    draft_quick_ci_observed_green: false,
    ready_exact_head_full_ci_observed_green: false,
    independent_read_only_review_no_blocking_findings: false,
    explicit_operator_approval_of_pr_and_exact_head: false,
    ordinary_protected_pr_merge_verified: false,
    exact_reviewed_scope_merged: false,
    exact_main_ci_observed_green: false,
    all_satisfied: false,
  });
  expect(evidence.scope_limits).toEqual({
    governance_design_sql_tests_ci_registration_only: true,
    sql_executed: false,
    database_or_supabase_mutation: false,
    migration_file_added: false,
    generated_types_changed: false,
    application_or_runtime_source_changed: false,
    provider_configuration_or_data_mutation: false,
    production_deployment: false,
    broker_training_or_promotion_authority: false,
  });
});

test("binds action, roadmap and ledger while preserving production/main distinction", async () => {
  const evidence = JSON.parse(await source(evidencePath)) as Evidence;
  for (const [relativePath, expectedHash] of Object.entries(
    evidence.source_document_sha256,
  )) {
    expect(sha256(canonicalSource(relativePath))).toBe(expectedHash);
  }
  const [action, roadmap, ledger] = [
    canonicalSource(actionPath),
    canonicalSource(roadmapPath),
    canonicalSource(ledgerPath),
  ];
  for (const text of [action, roadmap, ledger]) {
    expect(text).toContain("position_version_schema_v1");
    expect(text).toContain(
      "position_version_schema_migration_design_and_read_only_backfill_preflight",
    );
    expect(text).toContain(
      "authorized_position_version_read_only_backfill_inventory_execution",
    );
    expect(text).toContain("dbeed25f2074bff4dba8cee7f6d511cb17992efc");
    expect(text).not.toMatch(
      /(?:github_pat_|ghp_|postgres(?:ql)?:\/\/|begin (?:rsa |ec |openssh )?private key)/i,
    );
  }
  expect(action).toContain("The SQL has not been run");
  expect(action).toContain("Production deployment is not authorized.");
  expect(roadmap).toContain("a80f3a8856121edb4260909ac1cedcf638d421b8");
  expect(ledger).toContain("production_is_first_parent_ancestor_of_main");
  expect(ledger).not.toContain("production_equals_main | verified_current");
});

test("registers once in provider-free CI and remains runtime-unwired", async () => {
  const [registrationRaw, runner] = await Promise.all([
    source(registrationPath),
    source(runnerPath),
  ]);
  const registration = JSON.parse(registrationRaw) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(runner.split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(gitGrep("action-666dc-position-version-read-only-backfill-preflight", [
    "app",
    "components",
    "lib",
  ])).toBe("");
  expect(
    gitGrep("position_version_read_only_backfill_preflight_v1", [
      "app",
      "components",
      "lib",
    ]),
  ).toBe("");
});
