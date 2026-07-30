import { basename } from "node:path";

import {
  SNAPSHOT_CONTRACT,
  SNAPSHOT_SCHEMA_VERSION,
  assertClosed,
  canonicalJson,
  deepFreeze,
  sha256,
} from "./action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import {
  APPEND_ONLY_BASELINE,
  BASELINE_HISTORY_INVENTORY,
  FROZEN_EIGHT_RPC_INVENTORY,
} from "./action-661j5r8-rpc-append-only-contracts-rebuild-v1.mjs";

export {
  APPEND_ONLY_BASELINE,
  BASELINE_HISTORY_INVENTORY,
  FROZEN_EIGHT_RPC_INVENTORY,
};

export const TRIGGER_SUCCESS_POLICY_REGISTRY_VERSION =
  "action_661j5r9_trigger_success_policy_registry_rebuild_v1";
export const TRIGGER_SUCCESS_RUNTIME_REGISTRY_VERSION =
  "action_661j5r9_trigger_success_runtime_registry_rebuild_v1";
export const TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION =
  "action_661j5r9_trigger_success_result_protocol_rebuild_v1";
export const TRIGGER_SUCCESS_PRECONDITION_REFERENCE_VERSION =
  "action_661j5r9_trigger_success_precondition_reference_rebuild_v1";

export const PREEXISTING_TRIGGER = deepFreeze({
  enabled: "O",
  function: "action_650_reject_execution_audit_mutation()",
  name: "action_661j5r9_preexisting_proof_audit_fixture",
  relation: "public.bounded_shadow_collector_proof_audits",
  type: 27,
});

export const CONTAINMENT_TRIGGER = deepFreeze({
  enabled: "O",
  function: "action_650_reject_execution_audit_mutation()",
  name: "action_661j_proof_audit_append_only",
  relation: "public.bounded_shadow_collector_proof_audits",
  type: 27,
});

export const SUCCESS_HISTORY_ENTRY = deepFreeze({
  name: basename("20260726000000_contain_continuous_intelligence_data_access.sql")
    .slice("20260726000000".length + 1)
    .replace(/\.sql$/, ""),
  statement_count: 1,
  version: "20260726000000",
});

export const SUCCESS_POST_RPC_INVENTORY = deepFreeze(
  FROZEN_EIGHT_RPC_INVENTORY.map((entry) => ({
    ...entry,
    proconfig: ["search_path=pg_catalog, public, extensions"],
    security_definer: true,
  })),
);

export const SUCCESS_TARGET_ACL = deepFreeze([
  ["bounded_shadow_collector_proof_audits", ["INSERT", "SELECT"]],
  ["continuous_intelligence_credit_ledger", ["INSERT", "SELECT", "UPDATE"]],
  ["continuous_intelligence_shadow_canary_daily_claims", ["SELECT"]],
  ["continuous_intelligence_shadow_canary_manual_authorizations", ["SELECT"]],
  ["historical_candle_fetch_runs", ["INSERT", "SELECT"]],
  ["historical_candles", ["INSERT", "SELECT", "UPDATE"]],
].flatMap(([relation, privileges]) => [
  ...["DELETE", "INSERT", "REFERENCES", "SELECT", "TRIGGER", "TRUNCATE", "UPDATE"].map(
    (privilege) => ({
      grantable: false,
      grantee: "postgres",
      grantor: "postgres",
      privilege,
      relation: `public.${relation}`,
    }),
  ),
  ...privileges.map((privilege) => ({
    grantable: false,
    grantee: "service_role",
    grantor: "postgres",
    privilege,
    relation: `public.${relation}`,
  })),
]));

const NO_TRANSITION_DOMAINS = deepFreeze([
  "schema_relations",
  "target_data",
  "migration_history",
  "rls_policies",
  "table_acl",
  "column_acl",
  "rpc_catalog",
  "function_catalog",
  "trigger_catalog",
]);

export const TRIGGER_SUCCESS_POLICY_REGISTRY = deepFreeze({
  registry_version: TRIGGER_SUCCESS_POLICY_REGISTRY_VERSION,
  scenarios: {
    preexisting_proof_audit_trigger: {
      atomicity_decision: "no_transition_verified",
      classification: "controlled_preexisting_proof_audit_trigger_rejection",
      expected_history_inventory_digest: sha256(BASELINE_HISTORY_INVENTORY),
      expected_trigger: PREEXISTING_TRIGGER,
      migration_applied: false,
      no_transition_domains: NO_TRANSITION_DOMAINS,
      precondition_type: "preexisting_proof_audit_trigger",
      scenario_id: "preexisting_proof_audit_trigger",
      terminal_reason:
        "Action 661J refuses pre-existing proof-audit trigger state",
      terminal_sqlstate: "P0001",
      terminal_state: "controlled_error",
    },
    successful_containment: {
      atomicity_decision: "closed_transition_verified",
      classification: "successful_containment_committed",
      expected_history_inventory_digest: sha256(BASELINE_HISTORY_INVENTORY),
      expected_post_history_entry: SUCCESS_HISTORY_ENTRY,
      expected_post_rpc_inventory_digest: sha256(SUCCESS_POST_RPC_INVENTORY),
      expected_post_target_acl_digest: sha256(SUCCESS_TARGET_ACL),
      expected_post_trigger: CONTAINMENT_TRIGGER,
      expected_pre_append_only_function: APPEND_ONLY_BASELINE,
      expected_pre_rpc_inventory_digest: sha256(FROZEN_EIGHT_RPC_INVENTORY),
      migration_applied: true,
      precondition_type: "all_fail_closed_boundaries_satisfied",
      scenario_id: "successful_containment",
      terminal_reason: null,
      terminal_sqlstate: null,
      terminal_state: "completed",
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
export const TRIGGER_SUCCESS_POLICY_REGISTRY_DIGEST = sha256(
  TRIGGER_SUCCESS_POLICY_REGISTRY,
);

export const TRIGGER_SUCCESS_RUNTIME_REGISTRY = deepFreeze({
  predecessor_runtime_registry:
    "action_661j5r8_rpc_append_only_runtime_registry_rebuild_v1",
  registry_version: TRIGGER_SUCCESS_RUNTIME_REGISTRY_VERSION,
  scenarios: Object.fromEntries(
    Object.keys(TRIGGER_SUCCESS_POLICY_REGISTRY.scenarios).map((scenarioId) => [
      scenarioId,
      {
        policy_registry_version: TRIGGER_SUCCESS_POLICY_REGISTRY_VERSION,
        protocol_version: TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
        runner_version:
          "action_661j5r9_trigger_success_runtime_runner_rebuild_v1",
        scenario_id: scenarioId,
        status: "implemented",
      },
    ]),
  ),
});
export const TRIGGER_SUCCESS_RUNTIME_REGISTRY_DIGEST = sha256(
  TRIGGER_SUCCESS_RUNTIME_REGISTRY,
);

export function triggerSuccessPolicyForScenario(scenarioId) {
  const policy = TRIGGER_SUCCESS_POLICY_REGISTRY.scenarios[scenarioId];
  if (!policy) throw new Error("rebuild_v1.policy_invalid:unknown_scenario");
  return policy;
}

export function triggerSuccessSelectionForScenario(scenarioId) {
  const selection = TRIGGER_SUCCESS_RUNTIME_REGISTRY.scenarios[scenarioId];
  if (!selection || selection.status !== "implemented") {
    throw new Error("rebuild_v1.runtime_registry_invalid:scenario");
  }
  return selection;
}

export function buildTriggerSuccessPreconditionReference(scenarioId) {
  const policy = triggerSuccessPolicyForScenario(scenarioId);
  const projection = {
    expected_history_inventory_digest:
      policy.expected_history_inventory_digest,
    expected_post_history_entry: policy.expected_post_history_entry ?? null,
    expected_post_rpc_inventory_digest:
      policy.expected_post_rpc_inventory_digest ?? null,
    expected_post_target_acl_digest:
      policy.expected_post_target_acl_digest ?? null,
    expected_post_trigger: policy.expected_post_trigger ?? null,
    expected_trigger: policy.expected_trigger ?? null,
    policy_registry_digest: TRIGGER_SUCCESS_POLICY_REGISTRY_DIGEST,
    precondition_reference_version:
      TRIGGER_SUCCESS_PRECONDITION_REFERENCE_VERSION,
    precondition_type: policy.precondition_type,
    scenario_id: scenarioId,
    snapshot_contract: SNAPSHOT_CONTRACT,
    snapshot_schema_version: SNAPSHOT_SCHEMA_VERSION,
    terminal_reason: policy.terminal_reason,
    terminal_sqlstate: policy.terminal_sqlstate,
  };
  return deepFreeze({
    ...projection,
    precondition_reference_digest: sha256(projection),
  });
}

export function verifyTriggerSuccessPreconditionReference(reference, scenarioId) {
  const expected = buildTriggerSuccessPreconditionReference(scenarioId);
  assertClosed(reference, Object.keys(expected), "rebuild_v1.precondition_reference_invalid");
  if (canonicalJson(reference) !== canonicalJson(expected)) {
    throw new Error("rebuild_v1.precondition_reference_invalid");
  }
  return reference;
}
