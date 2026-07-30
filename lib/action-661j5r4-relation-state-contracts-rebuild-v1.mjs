import {
  REASON_CODES,
  SNAPSHOT_CONTRACT,
  SNAPSHOT_SCHEMA_VERSION,
  TARGET_RELATIONS,
  assertClosed,
  canonicalJson,
  deepFreeze,
  sha256,
} from "./action-661j5r2-runtime-contracts-rebuild-v1.mjs";

export const RELATION_STATE_POLICY_REGISTRY_VERSION =
  "action_661j5r4_relation_state_policy_registry_rebuild_v1";
export const RELATION_STATE_RUNTIME_REGISTRY_VERSION =
  "action_661j5r4_relation_state_runtime_registry_rebuild_v1";
export const RELATION_STATE_RESULT_PROTOCOL_VERSION =
  "action_661j5r4_relation_state_result_protocol_rebuild_v1";
export const RELATION_STATE_PRECONDITION_REFERENCE_VERSION =
  "action_661j5r4_relation_state_precondition_reference_rebuild_v1";
export const RELATION_STATE_TARGET = "public.historical_candles";
export const RELATION_STATE_TERMINAL_REASON =
  "Action 661J unexpected target relation state for historical_candles";

export const RELATION_STATE_POLICY_REGISTRY = deepFreeze({
  registry_version: RELATION_STATE_POLICY_REGISTRY_VERSION,
  scenarios: {
    non_table: {
      scenario_id: "non_table",
      precondition_type: "invalid_target_relation",
      target_relation: RELATION_STATE_TARGET,
      relation_state: "non_table",
      expected_relkind: "v",
      expected_owner: "postgres",
      terminal_sqlstate: "P0001",
      terminal_reason: RELATION_STATE_TERMINAL_REASON,
      classification: "controlled_non_table_rejection",
      no_transition_domains: [
        "schema_relations",
        "target_data",
        "migration_history",
        "rls_policies",
        "table_acl",
        "column_acl",
        "rpc_catalog",
        "function_catalog",
        "trigger_catalog",
      ],
    },
    wrong_owner: {
      scenario_id: "wrong_owner",
      precondition_type: "invalid_target_relation",
      target_relation: RELATION_STATE_TARGET,
      relation_state: "wrong_owner",
      expected_relkind: "r",
      expected_owner: "action_661j5_fixture_owner",
      terminal_sqlstate: "P0001",
      terminal_reason: RELATION_STATE_TERMINAL_REASON,
      classification: "controlled_wrong_owner_rejection",
      no_transition_domains: [
        "schema_relations",
        "target_data",
        "migration_history",
        "rls_policies",
        "table_acl",
        "column_acl",
        "rpc_catalog",
        "function_catalog",
        "trigger_catalog",
      ],
    },
  },
});

export const RELATION_STATE_POLICY_REGISTRY_DIGEST = sha256(
  RELATION_STATE_POLICY_REGISTRY,
);

export const RELATION_STATE_RUNTIME_REGISTRY = deepFreeze({
  registry_version: RELATION_STATE_RUNTIME_REGISTRY_VERSION,
  predecessor_runtime_registry:
    "action_661j5r2_runtime_scenario_registry_rebuild_v1",
  scenarios: {
    non_table: {
      status: "implemented",
      scenario_id: "non_table",
      protocol_version: RELATION_STATE_RESULT_PROTOCOL_VERSION,
      runner_version: "action_661j5r4_relation_state_runtime_runner_rebuild_v1",
      policy_registry_version: RELATION_STATE_POLICY_REGISTRY_VERSION,
    },
    wrong_owner: {
      status: "implemented",
      scenario_id: "wrong_owner",
      protocol_version: RELATION_STATE_RESULT_PROTOCOL_VERSION,
      runner_version: "action_661j5r4_relation_state_runtime_runner_rebuild_v1",
      policy_registry_version: RELATION_STATE_POLICY_REGISTRY_VERSION,
    },
  },
});

export const RELATION_STATE_RUNTIME_REGISTRY_DIGEST = sha256(
  RELATION_STATE_RUNTIME_REGISTRY,
);

export function relationStatePolicyForScenario(scenarioId) {
  const policy = RELATION_STATE_POLICY_REGISTRY.scenarios[scenarioId];
  if (!policy) throw new Error(`${REASON_CODES.policy}:unknown_scenario`);
  return policy;
}

export function relationStateSelectionForScenario(scenarioId) {
  const selection = RELATION_STATE_RUNTIME_REGISTRY.scenarios[scenarioId];
  if (!selection || selection.status !== "implemented") {
    throw new Error(
      `${REASON_CODES.runtime_registry}:scenario_not_implemented`,
    );
  }
  return selection;
}

export function buildRelationStatePreconditionReference(scenarioId) {
  const policy = relationStatePolicyForScenario(scenarioId);
  const projection = {
    precondition_reference_version:
      RELATION_STATE_PRECONDITION_REFERENCE_VERSION,
    scenario_id: scenarioId,
    policy_registry_digest: RELATION_STATE_POLICY_REGISTRY_DIGEST,
    snapshot_contract: SNAPSHOT_CONTRACT,
    snapshot_schema_version: SNAPSHOT_SCHEMA_VERSION,
    target_inventory: TARGET_RELATIONS,
    target_relation: policy.target_relation,
    relation_state: policy.relation_state,
    expected_relkind: policy.expected_relkind,
    expected_owner: policy.expected_owner,
    terminal_sqlstate: policy.terminal_sqlstate,
    terminal_reason: policy.terminal_reason,
  };
  return deepFreeze({
    ...projection,
    precondition_reference_digest: sha256(projection),
  });
}

export function verifyRelationStatePreconditionReference(
  reference,
  scenarioId,
) {
  const expected = buildRelationStatePreconditionReference(scenarioId);
  assertClosed(
    reference,
    Object.keys(expected),
    REASON_CODES.precondition_reference,
  );
  if (canonicalJson(reference) !== canonicalJson(expected)) {
    throw new Error(REASON_CODES.precondition_reference);
  }
  return reference;
}
