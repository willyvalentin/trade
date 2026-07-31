function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
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

const domains = {
  schema_relations: [],
  target_data: null,
  migration_history: [],
  rls_policies: [],
  table_acl: [],
  column_acl: [],
  rpc_catalog: [],
  function_catalog: [],
  trigger_catalog: [],
};

function metadata(state) {
  return relations.map((relation, index) => ({
    observed:
      index === 4
        ? {
            oid: 51004,
            owner:
              state === "wrong_owner"
                ? "action_661j5_fixture_owner"
                : "postgres",
            relkind: state === "non_table" ? "v" : "r",
          }
        : { oid: 51000 + index, owner: "postgres", relkind: "r" },
    relation,
    relation_state: index === 4 ? state : "present_table",
  }));
}

function reads() {
  return relations
    .map((relation, index) => ({
      oid: 51000 + index,
      relation,
      rows: [{ fixture_id: `relation-state-${index}` }],
    }))
    .filter((entry) => entry.relation !== "public.historical_candles");
}

function scenario(scenarioId, relationState, classification) {
  const snapshotInput = {
    domains,
    guarded_data_reads: reads(),
    metadata_discovery: metadata(relationState),
  };
  return {
    scenario_id: scenarioId,
    relation_state: relationState,
    target_relation: "public.historical_candles",
    terminal_sqlstate: "P0001",
    terminal_reason:
      "Action 661J unexpected target relation state for historical_candles",
    classification,
    guarded_target_read_count: 0,
    prestate_input: snapshotInput,
    poststate_input: structuredClone(snapshotInput),
  };
}

export const ACTION_661J5R4_RELATION_STATE_LITERAL_FIXTURES = deepFreeze({
  fixture_version: "action_661j5r4_relation_state_literal_fixtures_rebuild_v1",
  policy_registry_version:
    "action_661j5r4_relation_state_policy_registry_rebuild_v1",
  runtime_registry_version:
    "action_661j5r4_relation_state_runtime_registry_rebuild_v1",
  protocol_version:
    "action_661j5r4_relation_state_result_protocol_rebuild_v1",
  snapshot_contract: "action_661j5r2_metadata_first_snapshot_rebuild_v1",
  snapshot_schema_version: "action_661j5r2_nine_domain_v2",
  scenarios: {
    non_table: scenario(
      "non_table",
      "non_table",
      "controlled_non_table_rejection",
    ),
    wrong_owner: scenario(
      "wrong_owner",
      "wrong_owner",
      "controlled_wrong_owner_rejection",
    ),
  },
});
