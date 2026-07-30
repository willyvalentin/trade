function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

const baseline = [
  ["20260519000000", "create_legacy_baseline_schema_draft", 1],
  ["20260520000000", "add_execution_metadata_to_positions", 1],
  ["20260528000000", "create_recommendation_snapshots", 1],
  ["20260528001000", "create_recommendation_outcomes", 1],
  ["20260528002000", "create_recommendation_scan_runs", 1],
  ["20260528003000", "create_recommendation_batches", 1],
  ["20260605000000", "add_recommendation_outcomes_snapshot_horizon_unique_index", 1],
  ["20260610000000", "execution_audit_foundation", 1],
  ["20260614000000", "create_execution_records", 1],
  ["20260615000000", "create_execution_record_audit_events", 1],
  ["20260615001000", "enable_rls_execution_record_audit_events", 1],
  ["20260625000000", "create_scheduled_scan_attempts", 1],
  ["20260702000000", "create_symbol_metadata", 1],
  ["20260709000000", "create_historical_candle_storage", 1],
  ["20260721000000", "create_bounded_shadow_collector_proof_audits", 1],
  ["20260721001000", "create_continuous_intelligence_credit_ledger", 1],
  ["20260721002000", "create_continuous_intelligence_shadow_canary_daily_claims", 1],
  ["20260722000000", "create_continuous_intelligence_shadow_canary_readiness_probe", 1],
  ["20260722001000", "create_continuous_intelligence_shadow_canary_manual_authorizations", 1],
  ["20260722002000", "admit_continuous_intelligence_shadow_canary_manual_execution", 1],
  ["20260722003000", "create_continuous_intelligence_shadow_canary_manual_execution_leases", 1],
  ["20260722004000", "create_continuous_intelligence_shadow_canary_manual_issuance_readiness_probe", 1],
  ["20260722005000", "stabilize_continuous_intelligence_shadow_canary_rpc_names", 1],
  ["20260723001000", "allow_bounded_manual_proof_claim_linkage", 1],
  ["20260723002000", "create_historical_usage_reconciliation_persistence", 1],
  ["20260723003000", "allow_explicit_legacy_action_609_historical_usage_reconciliation", 1],
  ["20260724000000", "add_historical_usage_reconciliation_read_rpc", 1],
  ["20260724001000", "fix_continuous_intelligence_manual_canary_function_lint", 1],
  ["20260724001500", "create_transactional_open_position_command", 4],
  ["20260724001600", "create_shared_login_abuse_control", 12],
  ["20260724002000", "contain_production_trading_data_access", 6],
].map(([version, name, statement_count]) => ({
  version,
  name,
  statement_count,
}));

const columnAcl = {
  attnum: 3,
  column: "ticker",
  grantable: false,
  grantee: "action_661j5_column_acl",
  grantor: "postgres",
  privilege: "SELECT",
  relation: "public.historical_candles",
};
const policy = {
  command: "SELECT",
  name: "action_661j5r7_policy_fixture",
  permissive: "PERMISSIVE",
  roles: ["action_661j5_policy_role"],
  schema: "public",
  table: "historical_candles",
  using: "true",
  with_check: null,
};

export const ACTION_661J5R7_COLUMN_ACL_POLICY_LITERAL_FIXTURES = deepFreeze({
  fixture_version:
    "action_661j5r7_column_acl_policy_literal_fixtures_rebuild_v1",
  baseline_manifest_sha256:
    "7d5853d38167f16aea625331e8a1bf966df99b1dd8252f0f7102a5b6c8ed93ad",
  baseline_history_inventory: baseline,
  scenarios: {
    column_acl_state: {
      scenario_id: "column_acl_state",
      expected_history_inventory: baseline,
      expected_history_inventory_digest:
        "8ddeef5e44790726fcb942c8245c6699b18b846f36655bdb57343a0bd8f397cb",
      expected_column_acl: columnAcl,
      expected_policy: null,
      terminal_sqlstate: "P0001",
      terminal_reason:
        "Action 661J refuses unknown or column ACL state for historical_candles",
      classification: "controlled_column_acl_rejection",
      precondition_reference_digest:
        "9b271554480be1521d1453d0d75f9fd523b432c7be26373a359b69c77be05967",
    },
    policy_state: {
      scenario_id: "policy_state",
      expected_history_inventory: baseline,
      expected_history_inventory_digest:
        "8ddeef5e44790726fcb942c8245c6699b18b846f36655bdb57343a0bd8f397cb",
      expected_column_acl: null,
      expected_policy: policy,
      terminal_sqlstate: "P0001",
      terminal_reason: "Action 661J refuses policy state for historical_candles",
      classification: "controlled_policy_state_rejection",
      precondition_reference_digest:
        "87ed9fd22d16ab2e9c23eab77257b70ecefa2eab51a8b2723107cdb29212e255",
    },
  },
});
