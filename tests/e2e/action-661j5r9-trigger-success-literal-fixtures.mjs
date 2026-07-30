function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

export const ACTION_661J5R9_TRIGGER_SUCCESS_LITERAL_FIXTURES = deepFreeze({
  fixture_version: "action_661j5r9_trigger_success_literal_fixtures_rebuild_v1",
  migration_identity: {
    name: "contain_continuous_intelligence_data_access",
    sha256: "7f95f157af31ac5757faff4d84d9f26923ea1394426747584e15f5f3a2da2517",
    statement_count: 1,
    version: "20260726000000",
  },
  scenarios: {
    preexisting_proof_audit_trigger: {
      atomicity_decision: "no_transition_verified",
      classification: "controlled_preexisting_proof_audit_trigger_rejection",
      migration_applied: false,
      scenario_id: "preexisting_proof_audit_trigger",
      terminal_reason:
        "Action 661J refuses pre-existing proof-audit trigger state",
      terminal_sqlstate: "P0001",
      terminal_state: "controlled_error",
      trigger: {
        enabled: "O",
        function: "action_650_reject_execution_audit_mutation()",
        name: "action_661j5r9_preexisting_proof_audit_fixture",
        relation: "public.bounded_shadow_collector_proof_audits",
        type: 27,
      },
    },
    successful_containment: {
      atomicity_decision: "closed_transition_verified",
      classification: "successful_containment_committed",
      migration_applied: true,
      scenario_id: "successful_containment",
      terminal_reason: null,
      terminal_sqlstate: null,
      terminal_state: "completed",
      trigger: {
        enabled: "O",
        function: "action_650_reject_execution_audit_mutation()",
        name: "action_661j_proof_audit_append_only",
        relation: "public.bounded_shadow_collector_proof_audits",
        type: 27,
      },
      transition_domains: [
        "migration_history",
        "rpc_catalog",
        "table_acl",
        "trigger_catalog",
      ],
      unchanged_domains: [
        "schema_relations",
        "target_data",
        "rls_policies",
        "column_acl",
        "function_catalog",
      ],
    },
  },
});
