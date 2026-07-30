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

export const HISTORY_POLICY_REGISTRY_VERSION =
  "action_661j5r5_history_boundary_policy_registry_rebuild_v1";
export const HISTORY_RUNTIME_REGISTRY_VERSION =
  "action_661j5r5_history_boundary_runtime_registry_rebuild_v1";
export const HISTORY_RESULT_PROTOCOL_VERSION =
  "action_661j5r5_history_boundary_result_protocol_rebuild_v1";
export const HISTORY_PRECONDITION_REFERENCE_VERSION =
  "action_661j5r5_history_boundary_precondition_reference_rebuild_v1";

export const ACTION_650_HISTORY_IDENTITY = deepFreeze({
  version: "20260724002000",
  name: "contain_production_trading_data_access",
  statement_count: 6,
});
export const INCIDENT_HISTORY_VERSIONS = deepFreeze([
  "20260724003000",
  "20260726000000",
]);
export const SELECTED_INCIDENT_HISTORY = deepFreeze({
  version: "20260724003000",
  name: "action_661j5r5_incident_fixture",
  statement_count: 1,
});

export const BASELINE_HISTORY_MANIFEST_PATH =
  "scripts/action-661j5r3-runtime-baseline-rebuild-v1.json";
export const BASELINE_HISTORY_MANIFEST_SHA256 =
  "7d5853d38167f16aea625331e8a1bf966df99b1dd8252f0f7102a5b6c8ed93ad";

const baselineManifestBytes = readFileSync(
  resolve(process.cwd(), BASELINE_HISTORY_MANIFEST_PATH),
);
if (
  createHash("sha256").update(baselineManifestBytes).digest("hex") !==
  BASELINE_HISTORY_MANIFEST_SHA256
) {
  throw new Error(`${REASON_CODES.policy}:baseline_manifest_hash`);
}
const baselineManifest = JSON.parse(baselineManifestBytes.toString("utf8"));
export const BASELINE_HISTORY_INVENTORY = deepFreeze(
  baselineManifest.migrations
    .map((migration) => ({
      version: migration.version,
      name: basename(migration.path)
        .slice(migration.version.length + 1)
        .replace(/\.sql$/, ""),
      statement_count: migration.history_statement_count,
    }))
    .sort((left, right) => left.version.localeCompare(right.version)),
);

export function expectedHistoryInventoryForScenario(scenarioId) {
  if (scenarioId === "missing_action_650_history") {
    return deepFreeze(
      BASELINE_HISTORY_INVENTORY.filter(
        (entry) => entry.version !== ACTION_650_HISTORY_IDENTITY.version,
      ),
    );
  }
  if (scenarioId === "incident_history_present") {
    return deepFreeze(
      [...BASELINE_HISTORY_INVENTORY, SELECTED_INCIDENT_HISTORY].sort(
        (left, right) => left.version.localeCompare(right.version),
      ),
    );
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

export const HISTORY_POLICY_REGISTRY = deepFreeze({
  registry_version: HISTORY_POLICY_REGISTRY_VERSION,
  scenarios: {
    missing_action_650_history: {
      scenario_id: "missing_action_650_history",
      precondition_type: "missing_required_history",
      required_history: ACTION_650_HISTORY_IDENTITY,
      required_history_state: "absent",
      incident_versions: INCIDENT_HISTORY_VERSIONS,
      selected_incident_history: null,
      expected_history_inventory_digest: sha256(
        expectedHistoryInventoryForScenario("missing_action_650_history"),
      ),
      terminal_sqlstate: "P0001",
      terminal_reason: "Action 661J requires exact Action 650 history",
      classification: "controlled_missing_action_650_history_rejection",
      no_transition_domains: NO_TRANSITION_DOMAINS,
    },
    incident_history_present: {
      scenario_id: "incident_history_present",
      precondition_type: "incident_or_duplicate_history_present",
      required_history: ACTION_650_HISTORY_IDENTITY,
      required_history_state: "present_exact",
      incident_versions: INCIDENT_HISTORY_VERSIONS,
      selected_incident_history: SELECTED_INCIDENT_HISTORY,
      expected_history_inventory_digest: sha256(
        expectedHistoryInventoryForScenario("incident_history_present"),
      ),
      terminal_sqlstate: "P0001",
      terminal_reason:
        "Action 661J refuses incident or duplicate containment history",
      classification: "controlled_incident_history_rejection",
      no_transition_domains: NO_TRANSITION_DOMAINS,
    },
  },
});

export const HISTORY_POLICY_REGISTRY_DIGEST = sha256(HISTORY_POLICY_REGISTRY);

export const HISTORY_RUNTIME_REGISTRY = deepFreeze({
  registry_version: HISTORY_RUNTIME_REGISTRY_VERSION,
  predecessor_runtime_registry:
    "action_661j5r4_relation_state_runtime_registry_rebuild_v1",
  scenarios: {
    missing_action_650_history: {
      status: "implemented",
      scenario_id: "missing_action_650_history",
      protocol_version: HISTORY_RESULT_PROTOCOL_VERSION,
      runner_version: "action_661j5r5_history_boundary_runtime_runner_rebuild_v1",
      policy_registry_version: HISTORY_POLICY_REGISTRY_VERSION,
    },
    incident_history_present: {
      status: "implemented",
      scenario_id: "incident_history_present",
      protocol_version: HISTORY_RESULT_PROTOCOL_VERSION,
      runner_version: "action_661j5r5_history_boundary_runtime_runner_rebuild_v1",
      policy_registry_version: HISTORY_POLICY_REGISTRY_VERSION,
    },
  },
});

export const HISTORY_RUNTIME_REGISTRY_DIGEST = sha256(
  HISTORY_RUNTIME_REGISTRY,
);

export function historyPolicyForScenario(scenarioId) {
  const policy = HISTORY_POLICY_REGISTRY.scenarios[scenarioId];
  if (!policy) throw new Error(`${REASON_CODES.policy}:unknown_scenario`);
  return policy;
}

export function historySelectionForScenario(scenarioId) {
  const selection = HISTORY_RUNTIME_REGISTRY.scenarios[scenarioId];
  if (!selection || selection.status !== "implemented") {
    throw new Error(
      `${REASON_CODES.runtime_registry}:scenario_not_implemented`,
    );
  }
  return selection;
}

export function buildHistoryPreconditionReference(scenarioId) {
  const policy = historyPolicyForScenario(scenarioId);
  const projection = {
    precondition_reference_version: HISTORY_PRECONDITION_REFERENCE_VERSION,
    scenario_id: scenarioId,
    policy_registry_digest: HISTORY_POLICY_REGISTRY_DIGEST,
    snapshot_contract: SNAPSHOT_CONTRACT,
    snapshot_schema_version: SNAPSHOT_SCHEMA_VERSION,
    required_history: policy.required_history,
    required_history_state: policy.required_history_state,
    incident_versions: policy.incident_versions,
    selected_incident_history: policy.selected_incident_history,
    expected_history_inventory_digest:
      policy.expected_history_inventory_digest,
    terminal_sqlstate: policy.terminal_sqlstate,
    terminal_reason: policy.terminal_reason,
  };
  return deepFreeze({
    ...projection,
    precondition_reference_digest: sha256(projection),
  });
}

export function verifyHistoryPreconditionReference(reference, scenarioId) {
  const expected = buildHistoryPreconditionReference(scenarioId);
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
