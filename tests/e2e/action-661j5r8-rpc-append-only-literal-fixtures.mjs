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

const commonRpc = {
  kind: "f",
  language: "plpgsql",
  overload_count: 1,
  owner: "postgres",
  parallel: "u",
  return_type: "record",
  role_privileges: {
    anon_execute: false,
    authenticated_execute: false,
    public_execute: false,
    service_role_execute: true,
  },
  security_definer: false,
  strict: false,
  volatility: "v",
};
const rpcInventory = [
  ["admit_ci_shadow_canary_manual_lease(text,text,text,text,text,text,date)", "47a4594c67c9a78cea123ac2bd74a63932343cbc506bf6b2c5ad5683bc3a981c", "search_path=public, extensions"],
  ["admit_continuous_intelligence_shadow_canary_manual_execution(text,text,text,text,text,date)", "ea43402aaf1b5d8b116bd27dcbf4c7e69c94966a4d9868c3786e5ad90dc481b1", "search_path=public, extensions"],
  ["begin_continuous_intelligence_shadow_canary_attempt(text,text,text,text)", "d63cea7527f9b1d7b3bd0a70d1807608d231b150a6179901bf011b32da88eafd", "search_path=public"],
  ["ci_mca_consume(text,text,text,text,text)", "e90a0745f4c26c39dc14f2566af01e21502a8284badf715cb19a231003d3e2f3", "search_path=public, extensions"],
  ["ci_mca_issue(text,text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,smallint,smallint,smallint,smallint,text,text,text,text,text)", "cc2b04122d148203c9d2c2011083aaecd76d43c425d42d4e2fd0f33bf3c9dfee", "search_path=public"],
  ["claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)", "b559bf5e2446087019ed5e0ea4eae1a54b4853df9c41ea440ecabc2d5ff7a62c", "search_path=public"],
  ["finalize_continuous_intelligence_shadow_canary_attempt(text,text,text,text,text,boolean,text,timestamp with time zone)", "14a4879683d01ca2d8a2ab0e0b03b2662e9e50ad325f049f7b8b32f8dd36ea2d", "search_path=public"],
  ["issue_ci_shadow_canary_manual_lease(text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,smallint,smallint,smallint,smallint,text,text,text,text,text)", "18a84ef2254cf2d9d46f976a52e5c6b9aac7998ea76a4c6c7180ec0ba76ef5dd", "search_path=public"],
].map(([identity, body_sha256, proconfig]) => ({
  ...commonRpc,
  body_sha256,
  identity,
  proconfig: [proconfig],
}));
const rpcDriftInventory = rpcInventory.map((entry) =>
  entry.identity ===
  "claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)"
    ? {
        ...entry,
        body_sha256:
          "27d866c0507ae5f56b0b11c8d32463a0e47dd459395fbe24313588e793870f12",
      }
    : entry,
);
const appendOnlyBaseline = {
  body_sha256:
    "a99ec02487f369a2911a107f966c572dd8bf00f584ee682aef724d5bab25598f",
  identity: "action_650_reject_execution_audit_mutation()",
  kind: "f",
  language: "plpgsql",
  overload_count: 1,
  owner: "postgres",
  parallel: "u",
  proconfig: ["search_path=pg_catalog"],
  return_type: "trigger",
  role_privileges: commonRpc.role_privileges,
  security_definer: false,
  strict: false,
  volatility: "v",
};

export const ACTION_661J5R8_RPC_APPEND_ONLY_LITERAL_FIXTURES = deepFreeze({
  fixture_version:
    "action_661j5r8_rpc_append_only_literal_fixtures_rebuild_v1",
  baseline_manifest_sha256:
    "7d5853d38167f16aea625331e8a1bf966df99b1dd8252f0f7102a5b6c8ed93ad",
  baseline_history_inventory: baseline,
  scenarios: {
    rpc_catalog_body_drift: {
      classification: "controlled_rpc_catalog_body_drift_rejection",
      expected_append_only_function: appendOnlyBaseline,
      scenario_id: "rpc_catalog_body_drift",
      expected_history_inventory: baseline,
      expected_history_inventory_digest:
        "8ddeef5e44790726fcb942c8245c6699b18b846f36655bdb57343a0bd8f397cb",
      expected_rpc_inventory: rpcDriftInventory,
      selected_rpc_signature:
        "public.claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)",
      terminal_sqlstate: "P0001",
      terminal_reason:
        "Action 661J refuses RPC catalog/body drift: public.claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)",
    },
    incompatible_append_only_function: {
      classification: "controlled_incompatible_append_only_function_rejection",
      expected_append_only_function: {
        ...appendOnlyBaseline,
        drift_field: "proconfig",
        proconfig: ["search_path=public"],
      },
      scenario_id: "incompatible_append_only_function",
      expected_history_inventory: baseline,
      expected_history_inventory_digest:
        "8ddeef5e44790726fcb942c8245c6699b18b846f36655bdb57343a0bd8f397cb",
      expected_rpc_inventory: rpcInventory,
      selected_rpc_signature: null,
      terminal_sqlstate: "P0001",
      terminal_reason:
        "Action 661J refuses incompatible canonical append-only function",
    },
  },
});
