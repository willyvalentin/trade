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

const action650 = {
  version: "20260724002000",
  name: "contain_production_trading_data_access",
  statement_count: 6,
};
const incident = {
  version: "20260724003000",
  name: "action_661j5r5_incident_fixture",
  statement_count: 1,
};

export const ACTION_661J5R5_HISTORY_LITERAL_FIXTURES = deepFreeze({
  fixture_version: "action_661j5r5_history_boundary_literal_fixtures_rebuild_v1",
  baseline_manifest_sha256:
    "7d5853d38167f16aea625331e8a1bf966df99b1dd8252f0f7102a5b6c8ed93ad",
  baseline_history_inventory: baseline,
  required_action_650_history: action650,
  incident_versions: ["20260724003000", "20260726000000"],
  scenarios: {
    missing_action_650_history: {
      scenario_id: "missing_action_650_history",
      expected_history_inventory: baseline.filter(
        (entry) => entry.version !== action650.version,
      ),
      expected_history_inventory_digest:
        "098c30f5a235ebe270f7cf8a80c33c34ce8689be573a20cc9e19864d55c4d6ec",
      selected_incident_history: null,
      terminal_sqlstate: "P0001",
      terminal_reason: "Action 661J requires exact Action 650 history",
      classification: "controlled_missing_action_650_history_rejection",
      precondition_reference_digest:
        "31c00dffee80ca0561814f003332d272b53fbfc8c829c2667643a07de55cb7e1",
    },
    incident_history_present: {
      scenario_id: "incident_history_present",
      expected_history_inventory: [...baseline, incident].sort((left, right) =>
        left.version.localeCompare(right.version),
      ),
      expected_history_inventory_digest:
        "381da4a5f2a23cd8357865eabdf1496cae432a92f7e9e71e720e1bda8913b85c",
      selected_incident_history: incident,
      terminal_sqlstate: "P0001",
      terminal_reason:
        "Action 661J refuses incident or duplicate containment history",
      classification: "controlled_incident_history_rejection",
      precondition_reference_digest:
        "19241334e72b72a08fbadc6df1649946b6e15d6dc2ac123bb4f6c803c6264190",
    },
  },
});
