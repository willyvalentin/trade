function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

const relations = [
  "public.continuous_intelligence_credit_ledger",
  "public.continuous_intelligence_shadow_canary_daily_claims",
  "public.historical_candle_fetch_runs",
  "public.historical_candle_symbols",
  "public.historical_candles",
  "public.historical_usage_reconciliations",
];

const baseDomains = {
  schema_relations: [
    { namespace: "public", relation: "historical_candles", relkind: "r" },
  ],
  target_data: null,
  migration_history: [
    { name: "baseline", version: "20260701000000" },
  ],
  rls_policies: [],
  table_acl: [{ grantee: "authenticated", privilege: "SELECT" }],
  column_acl: [],
  rpc_catalog: [{ name: "get_historical_candles", result: "setof record" }],
  function_catalog: [{ name: "get_historical_candles", volatility: "s" }],
  trigger_catalog: [],
};

function observed(index, owner = "postgres", relkind = "r") {
  return { oid: 41000 + index, owner, relkind };
}

function presentMetadata() {
  return relations.map((relation, index) => ({
    observed: observed(index),
    relation,
    relation_state: "present_table",
  }));
}

function presentReads() {
  return relations.map((relation, index) => ({
    oid: 41000 + index,
    relation,
    rows:
      index === 0
        ? [
            { amount: 7, id: "credit-002" },
            { amount: 3, id: "credit-001" },
          ]
        : index === 1
          ? []
          : [{ id: `fixture-${index}`, value: index }],
  }));
}

const missingMetadata = presentMetadata();
missingMetadata[4] = {
  observed: null,
  relation: relations[4],
  relation_state: "missing",
};

const missingReads = presentReads().filter(
  (read) => read.relation !== relations[4],
);

const mixedMetadata = [
  { observed: observed(0), relation: relations[0], relation_state: "present_table" },
  { observed: observed(1), relation: relations[1], relation_state: "present_table" },
  { observed: null, relation: relations[2], relation_state: "missing" },
  {
    observed: observed(3, "postgres", "v"),
    relation: relations[3],
    relation_state: "non_table",
  },
  {
    observed: observed(4, "fixture_owner", "r"),
    relation: relations[4],
    relation_state: "wrong_owner",
  },
  { observed: observed(5), relation: relations[5], relation_state: "present_table" },
];

const safety = {
  connection_string_present: false,
  credential_material_present: false,
  query_text_present: false,
  raw_error_object_present: false,
  stack_trace_present: false,
};

export const ACTION_661J5R2_LITERAL_FIXTURE = deepFreeze({
  fixture_version: "action_661j5r2_runtime_literal_fixture_rebuild_v1",
  historical_recovery: {
    base_commit: "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33",
    recovered_file_count: 42,
    lost_file_count: 129,
    recovered_files_are_authority: false,
    classification: "historical_recovered_reference",
  },
  runtime_identity: {
    architecture: "amd64",
    collector_sha256:
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    collector_version: "action_661j5r2_snapshot_collector_rebuild_v1",
    engine: "postgresql",
    identity_digest:
      "17d2e170f36e69250858bfc0770e425efb25a222dd68ee5ae61d2e17c0cef95d",
    image_digest:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    image_repository: "postgres",
    image_tag: "16-alpine",
    platform: "linux",
    server_major: 16,
    server_version: "16.9",
  },
  snapshot_cases: {
    present_rows_and_empty: {
      domains: baseDomains,
      guarded_data_reads: presentReads(),
      metadata_discovery: presentMetadata(),
    },
    missing_target: {
      domains: baseDomains,
      guarded_data_reads: missingReads,
      metadata_discovery: missingMetadata,
    },
    mixed_relation_states: {
      domains: baseDomains,
      guarded_data_reads: [
        presentReads()[0],
        presentReads()[1],
        presentReads()[5],
      ],
      metadata_discovery: mixedMetadata,
    },
  },
  scenarios: {
    forbidden_history: {
      diagnostic: {
        classification: "controlled_forbidden_history_rejection",
        diagnostic_sanitized: true,
        migration_applied: false,
        reason: "Action 661J refuses forbidden migration history",
        safety,
        scenario_id: "forbidden_history",
        sidecar_version: "action_661j5r2_diagnostic_sidecar_rebuild_v1",
        sqlstate: null,
        terminal_state: "controlled_error",
      },
      runs: [
        { run_id: "run-a", shard_id: "forbidden-history-a" },
        { run_id: "run-b", shard_id: "forbidden-history-b" },
      ],
      snapshot_case: "present_rows_and_empty",
    },
    missing_target: {
      diagnostic: {
        classification: "native_regclass_missing_relation_preempts_policy",
        diagnostic_sanitized: true,
        migration_applied: false,
        reason: 'relation "public.historical_candles" does not exist',
        safety,
        scenario_id: "missing_target",
        sidecar_version: "action_661j5r2_diagnostic_sidecar_rebuild_v1",
        sqlstate: "42P01",
        terminal_state: "controlled_error",
      },
      runs: [
        { run_id: "run-a", shard_id: "missing-target-a" },
        { run_id: "run-b", shard_id: "missing-target-b" },
      ],
      snapshot_case: "missing_target",
    },
  },
});
