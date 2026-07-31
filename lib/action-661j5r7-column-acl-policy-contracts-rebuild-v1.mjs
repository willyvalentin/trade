import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

import {
  REASON_CODES,
  SNAPSHOT_CONTRACT,
  SNAPSHOT_SCHEMA_VERSION,
  assertClosed,
  canonicalJson,
  deepFreeze,
  sha256,
} from "./action-661j5r2-runtime-contracts-rebuild-v1.mjs";

export const COLUMN_ACL_POLICY_POLICY_REGISTRY_VERSION =
  "action_661j5r7_column_acl_policy_policy_registry_rebuild_v1";
export const COLUMN_ACL_POLICY_RUNTIME_REGISTRY_VERSION =
  "action_661j5r7_column_acl_policy_runtime_registry_rebuild_v1";
export const COLUMN_ACL_POLICY_RESULT_PROTOCOL_VERSION =
  "action_661j5r7_column_acl_policy_result_protocol_rebuild_v1";
export const COLUMN_ACL_POLICY_PRECONDITION_REFERENCE_VERSION =
  "action_661j5r7_column_acl_policy_precondition_reference_rebuild_v1";

export const COLUMN_ACL_PRECONDITION = deepFreeze({
  attnum: 3,
  column: "ticker",
  grantable: false,
  grantee: "action_661j5_column_acl",
  grantor: "postgres",
  privilege: "SELECT",
  relation: "public.historical_candles",
});
export const POLICY_PRECONDITION = deepFreeze({
  command: "SELECT",
  name: "action_661j5r7_policy_fixture",
  permissive: "PERMISSIVE",
  roles: ["action_661j5_policy_role"],
  schema: "public",
  table: "historical_candles",
  using: "true",
  with_check: null,
});

const BASELINE_MANIFEST_PATH =
  "scripts/action-661j5r3-runtime-baseline-rebuild-v1.json";
const BASELINE_MANIFEST_SHA256 =
  "7d5853d38167f16aea625331e8a1bf966df99b1dd8252f0f7102a5b6c8ed93ad";
const bytes = readFileSync(resolve(process.cwd(), BASELINE_MANIFEST_PATH));
if (createHash("sha256").update(bytes).digest("hex") !== BASELINE_MANIFEST_SHA256) {
  throw new Error(`${REASON_CODES.policy}:baseline_manifest_hash`);
}
const manifest = JSON.parse(bytes.toString("utf8"));
export const BASELINE_HISTORY_INVENTORY = deepFreeze(
  manifest.migrations
    .map((migration) => ({
      name: basename(migration.path)
        .slice(migration.version.length + 1)
        .replace(/\.sql$/, ""),
      statement_count: migration.history_statement_count,
      version: migration.version,
    }))
    .sort((left, right) => left.version.localeCompare(right.version)),
);

export function expectedColumnAclPolicyHistoryInventory(scenarioId) {
  if (scenarioId === "column_acl_state" || scenarioId === "policy_state") {
    return BASELINE_HISTORY_INVENTORY;
  }
  throw new Error(`${REASON_CODES.policy}:unknown_scenario`);
}

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

export const COLUMN_ACL_POLICY_POLICY_REGISTRY = deepFreeze({
  registry_version: COLUMN_ACL_POLICY_POLICY_REGISTRY_VERSION,
  scenarios: {
    column_acl_state: {
      classification: "controlled_column_acl_rejection",
      expected_column_acl: COLUMN_ACL_PRECONDITION,
      expected_history_inventory_digest: sha256(
        expectedColumnAclPolicyHistoryInventory("column_acl_state"),
      ),
      expected_policy: null,
      no_transition_domains: NO_TRANSITION_DOMAINS,
      precondition_type: "column_acl_present",
      scenario_id: "column_acl_state",
      target_relation: "public.historical_candles",
      terminal_reason:
        "Action 661J refuses unknown or column ACL state for historical_candles",
      terminal_sqlstate: "P0001",
    },
    policy_state: {
      classification: "controlled_policy_state_rejection",
      expected_column_acl: null,
      expected_history_inventory_digest: sha256(
        expectedColumnAclPolicyHistoryInventory("policy_state"),
      ),
      expected_policy: POLICY_PRECONDITION,
      no_transition_domains: NO_TRANSITION_DOMAINS,
      precondition_type: "rls_policy_present",
      scenario_id: "policy_state",
      target_relation: "public.historical_candles",
      terminal_reason:
        "Action 661J refuses policy state for historical_candles",
      terminal_sqlstate: "P0001",
    },
  },
});
export const COLUMN_ACL_POLICY_POLICY_REGISTRY_DIGEST = sha256(
  COLUMN_ACL_POLICY_POLICY_REGISTRY,
);

export const COLUMN_ACL_POLICY_RUNTIME_REGISTRY = deepFreeze({
  predecessor_runtime_registry:
    "action_661j5r6_terminal_boundary_runtime_registry_rebuild_v1",
  registry_version: COLUMN_ACL_POLICY_RUNTIME_REGISTRY_VERSION,
  scenarios: {
    column_acl_state: {
      policy_registry_version: COLUMN_ACL_POLICY_POLICY_REGISTRY_VERSION,
      protocol_version: COLUMN_ACL_POLICY_RESULT_PROTOCOL_VERSION,
      runner_version:
        "action_661j5r7_column_acl_policy_runtime_runner_rebuild_v1",
      scenario_id: "column_acl_state",
      status: "implemented",
    },
    policy_state: {
      policy_registry_version: COLUMN_ACL_POLICY_POLICY_REGISTRY_VERSION,
      protocol_version: COLUMN_ACL_POLICY_RESULT_PROTOCOL_VERSION,
      runner_version:
        "action_661j5r7_column_acl_policy_runtime_runner_rebuild_v1",
      scenario_id: "policy_state",
      status: "implemented",
    },
  },
});
export const COLUMN_ACL_POLICY_RUNTIME_REGISTRY_DIGEST = sha256(
  COLUMN_ACL_POLICY_RUNTIME_REGISTRY,
);

export function columnAclPolicyPolicyForScenario(scenarioId) {
  const policy = COLUMN_ACL_POLICY_POLICY_REGISTRY.scenarios[scenarioId];
  if (!policy) throw new Error(`${REASON_CODES.policy}:unknown_scenario`);
  return policy;
}

export function columnAclPolicySelectionForScenario(scenarioId) {
  const selection = COLUMN_ACL_POLICY_RUNTIME_REGISTRY.scenarios[scenarioId];
  if (!selection || selection.status !== "implemented") {
    throw new Error(`${REASON_CODES.runtime_registry}:scenario_not_implemented`);
  }
  return selection;
}

export function buildColumnAclPolicyPreconditionReference(scenarioId) {
  const policy = columnAclPolicyPolicyForScenario(scenarioId);
  const projection = {
    expected_column_acl: policy.expected_column_acl,
    expected_history_inventory_digest:
      policy.expected_history_inventory_digest,
    expected_policy: policy.expected_policy,
    policy_registry_digest: COLUMN_ACL_POLICY_POLICY_REGISTRY_DIGEST,
    precondition_reference_version:
      COLUMN_ACL_POLICY_PRECONDITION_REFERENCE_VERSION,
    precondition_type: policy.precondition_type,
    scenario_id: scenarioId,
    snapshot_contract: SNAPSHOT_CONTRACT,
    snapshot_schema_version: SNAPSHOT_SCHEMA_VERSION,
    target_relation: policy.target_relation,
    terminal_reason: policy.terminal_reason,
    terminal_sqlstate: policy.terminal_sqlstate,
  };
  return deepFreeze({
    ...projection,
    precondition_reference_digest: sha256(projection),
  });
}

export function verifyColumnAclPolicyPreconditionReference(reference, scenarioId) {
  const expected = buildColumnAclPolicyPreconditionReference(scenarioId);
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
