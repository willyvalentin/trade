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

export const TERMINAL_POLICY_REGISTRY_VERSION =
  "action_661j5r6_terminal_boundary_policy_registry_rebuild_v1";
export const TERMINAL_RUNTIME_REGISTRY_VERSION =
  "action_661j5r6_terminal_boundary_runtime_registry_rebuild_v1";
export const TERMINAL_RESULT_PROTOCOL_VERSION =
  "action_661j5r6_terminal_boundary_result_protocol_rebuild_v1";
export const TERMINAL_PRECONDITION_REFERENCE_VERSION =
  "action_661j5r6_terminal_boundary_precondition_reference_rebuild_v1";

export const DUPLICATE_CONTAINMENT_HISTORY = deepFreeze({
  name: "action_661j5r6_duplicate_fixture",
  statement_count: 1,
  version: "20260726000000",
});
export const INCIDENT_OR_DUPLICATE_VERSIONS = deepFreeze([
  "20260724003000",
  "20260726000000",
]);
export const UNKNOWN_TABLE_ACL = deepFreeze({
  grantable: false,
  grantee: "action_661j5_unknown_acl",
  grantor: "postgres",
  privilege: "SELECT",
  relation: "public.historical_candles",
});
export const ACL_STATE_VARIANTS = deepFreeze([
  "unknown_table_acl",
  "column_acl",
]);

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

export function expectedTerminalHistoryInventory(scenarioId) {
  if (scenarioId === "duplicate_containment_history") {
    return deepFreeze(
      [...BASELINE_HISTORY_INVENTORY, DUPLICATE_CONTAINMENT_HISTORY].sort(
        (left, right) => left.version.localeCompare(right.version),
      ),
    );
  }
  if (scenarioId === "unknown_acl_state") {
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

export const TERMINAL_POLICY_REGISTRY = deepFreeze({
  registry_version: TERMINAL_POLICY_REGISTRY_VERSION,
  scenarios: {
    duplicate_containment_history: {
      acl_state_variants: ACL_STATE_VARIANTS,
      classification: "controlled_duplicate_containment_history_rejection",
      expected_history_inventory_digest: sha256(
        expectedTerminalHistoryInventory("duplicate_containment_history"),
      ),
      expected_target_acl: null,
      incident_or_duplicate_versions: INCIDENT_OR_DUPLICATE_VERSIONS,
      no_transition_domains: NO_TRANSITION_DOMAINS,
      precondition_type: "duplicate_containment_history_present",
      scenario_id: "duplicate_containment_history",
      selected_history: DUPLICATE_CONTAINMENT_HISTORY,
      selected_acl_state: null,
      target_relation: "public.historical_candles",
      terminal_reason:
        "Action 661J refuses incident or duplicate containment history",
      terminal_sqlstate: "P0001",
    },
    unknown_acl_state: {
      acl_state_variants: ACL_STATE_VARIANTS,
      classification: "controlled_unknown_table_acl_rejection",
      expected_history_inventory_digest: sha256(
        expectedTerminalHistoryInventory("unknown_acl_state"),
      ),
      expected_target_acl: UNKNOWN_TABLE_ACL,
      incident_or_duplicate_versions: INCIDENT_OR_DUPLICATE_VERSIONS,
      no_transition_domains: NO_TRANSITION_DOMAINS,
      precondition_type: "unknown_or_column_acl_present",
      scenario_id: "unknown_acl_state",
      selected_history: null,
      selected_acl_state: "unknown_table_acl",
      target_relation: "public.historical_candles",
      terminal_reason:
        "Action 661J refuses unknown or column ACL state for historical_candles",
      terminal_sqlstate: "P0001",
    },
  },
});
export const TERMINAL_POLICY_REGISTRY_DIGEST = sha256(
  TERMINAL_POLICY_REGISTRY,
);

export const TERMINAL_RUNTIME_REGISTRY = deepFreeze({
  predecessor_runtime_registry:
    "action_661j5r5_history_boundary_runtime_registry_rebuild_v1",
  registry_version: TERMINAL_RUNTIME_REGISTRY_VERSION,
  scenarios: {
    duplicate_containment_history: {
      policy_registry_version: TERMINAL_POLICY_REGISTRY_VERSION,
      protocol_version: TERMINAL_RESULT_PROTOCOL_VERSION,
      runner_version:
        "action_661j5r6_terminal_boundary_runtime_runner_rebuild_v1",
      scenario_id: "duplicate_containment_history",
      status: "implemented",
    },
    unknown_acl_state: {
      policy_registry_version: TERMINAL_POLICY_REGISTRY_VERSION,
      protocol_version: TERMINAL_RESULT_PROTOCOL_VERSION,
      runner_version:
        "action_661j5r6_terminal_boundary_runtime_runner_rebuild_v1",
      scenario_id: "unknown_acl_state",
      status: "implemented",
    },
  },
});
export const TERMINAL_RUNTIME_REGISTRY_DIGEST = sha256(
  TERMINAL_RUNTIME_REGISTRY,
);

export function terminalPolicyForScenario(scenarioId) {
  const policy = TERMINAL_POLICY_REGISTRY.scenarios[scenarioId];
  if (!policy) throw new Error(`${REASON_CODES.policy}:unknown_scenario`);
  return policy;
}

export function terminalSelectionForScenario(scenarioId) {
  const selection = TERMINAL_RUNTIME_REGISTRY.scenarios[scenarioId];
  if (!selection || selection.status !== "implemented") {
    throw new Error(`${REASON_CODES.runtime_registry}:scenario_not_implemented`);
  }
  return selection;
}

export function buildTerminalPreconditionReference(scenarioId) {
  const policy = terminalPolicyForScenario(scenarioId);
  const projection = {
    acl_state_variants: policy.acl_state_variants,
    expected_history_inventory_digest:
      policy.expected_history_inventory_digest,
    expected_target_acl: policy.expected_target_acl,
    incident_or_duplicate_versions: policy.incident_or_duplicate_versions,
    policy_registry_digest: TERMINAL_POLICY_REGISTRY_DIGEST,
    precondition_reference_version:
      TERMINAL_PRECONDITION_REFERENCE_VERSION,
    precondition_type: policy.precondition_type,
    scenario_id: scenarioId,
    selected_acl_state: policy.selected_acl_state,
    selected_history: policy.selected_history,
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

export function verifyTerminalPreconditionReference(reference, scenarioId) {
  const expected = buildTerminalPreconditionReference(scenarioId);
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
