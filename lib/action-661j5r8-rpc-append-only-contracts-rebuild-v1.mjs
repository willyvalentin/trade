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

export const RPC_APPEND_ONLY_POLICY_REGISTRY_VERSION =
  "action_661j5r8_rpc_append_only_policy_registry_rebuild_v1";
export const RPC_APPEND_ONLY_RUNTIME_REGISTRY_VERSION =
  "action_661j5r8_rpc_append_only_runtime_registry_rebuild_v1";
export const RPC_APPEND_ONLY_RESULT_PROTOCOL_VERSION =
  "action_661j5r8_rpc_append_only_result_protocol_rebuild_v1";
export const RPC_APPEND_ONLY_PRECONDITION_REFERENCE_VERSION =
  "action_661j5r8_rpc_append_only_precondition_reference_rebuild_v1";

const RPC_CATALOG_COMMON = {
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

export const FROZEN_EIGHT_RPC_INVENTORY = deepFreeze([
  {
    ...RPC_CATALOG_COMMON,
    body_sha256:
      "47a4594c67c9a78cea123ac2bd74a63932343cbc506bf6b2c5ad5683bc3a981c",
    identity:
      "admit_ci_shadow_canary_manual_lease(text,text,text,text,text,text,date)",
    proconfig: ["search_path=public, extensions"],
  },
  {
    ...RPC_CATALOG_COMMON,
    body_sha256:
      "ea43402aaf1b5d8b116bd27dcbf4c7e69c94966a4d9868c3786e5ad90dc481b1",
    identity:
      "admit_continuous_intelligence_shadow_canary_manual_execution(text,text,text,text,text,date)",
    proconfig: ["search_path=public, extensions"],
  },
  {
    ...RPC_CATALOG_COMMON,
    body_sha256:
      "d63cea7527f9b1d7b3bd0a70d1807608d231b150a6179901bf011b32da88eafd",
    identity:
      "begin_continuous_intelligence_shadow_canary_attempt(text,text,text,text)",
    proconfig: ["search_path=public"],
  },
  {
    ...RPC_CATALOG_COMMON,
    body_sha256:
      "e90a0745f4c26c39dc14f2566af01e21502a8284badf715cb19a231003d3e2f3",
    identity: "ci_mca_consume(text,text,text,text,text)",
    proconfig: ["search_path=public, extensions"],
  },
  {
    ...RPC_CATALOG_COMMON,
    body_sha256:
      "cc2b04122d148203c9d2c2011083aaecd76d43c425d42d4e2fd0f33bf3c9dfee",
    identity:
      "ci_mca_issue(text,text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,smallint,smallint,smallint,smallint,text,text,text,text,text)",
    proconfig: ["search_path=public"],
  },
  {
    ...RPC_CATALOG_COMMON,
    body_sha256:
      "b559bf5e2446087019ed5e0ea4eae1a54b4853df9c41ea440ecabc2d5ff7a62c",
    identity:
      "claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)",
    proconfig: ["search_path=public"],
  },
  {
    ...RPC_CATALOG_COMMON,
    body_sha256:
      "14a4879683d01ca2d8a2ab0e0b03b2662e9e50ad325f049f7b8b32f8dd36ea2d",
    identity:
      "finalize_continuous_intelligence_shadow_canary_attempt(text,text,text,text,text,boolean,text,timestamp with time zone)",
    proconfig: ["search_path=public"],
  },
  {
    ...RPC_CATALOG_COMMON,
    body_sha256:
      "18a84ef2254cf2d9d46f976a52e5c6b9aac7998ea76a4c6c7180ec0ba76ef5dd",
    identity:
      "issue_ci_shadow_canary_manual_lease(text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,smallint,smallint,smallint,smallint,text,text,text,text,text)",
    proconfig: ["search_path=public"],
  },
]);

export const SELECTED_RPC_SIGNATURE =
  "public.claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)";
export const SELECTED_RPC_CATALOG_IDENTITY =
  "claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)";
export const RPC_BODY_DRIFT_SUFFIX =
  "\n-- action_661j5r8 controlled body drift";
export const RPC_BODY_DRIFT_SHA256 =
  "27d866c0507ae5f56b0b11c8d32463a0e47dd459395fbe24313588e793870f12";

export const RPC_CATALOG_BODY_DRIFT_PRECONDITION = deepFreeze(
  FROZEN_EIGHT_RPC_INVENTORY.map((entry) =>
    entry.identity === SELECTED_RPC_CATALOG_IDENTITY
      ? { ...entry, body_sha256: RPC_BODY_DRIFT_SHA256 }
      : entry,
  ),
);

export const APPEND_ONLY_BASELINE = deepFreeze({
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
  role_privileges: {
    anon_execute: false,
    authenticated_execute: false,
    public_execute: false,
    service_role_execute: true,
  },
  security_definer: false,
  strict: false,
  volatility: "v",
});
export const APPEND_ONLY_PRECONDITION = deepFreeze({
  ...APPEND_ONLY_BASELINE,
  drift_field: "proconfig",
  proconfig: ["search_path=public"],
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

export function expectedRpcAppendOnlyHistoryInventory(scenarioId) {
  if (scenarioId === "rpc_catalog_body_drift" || scenarioId === "incompatible_append_only_function") {
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

export const RPC_APPEND_ONLY_POLICY_REGISTRY = deepFreeze({
  registry_version: RPC_APPEND_ONLY_POLICY_REGISTRY_VERSION,
  scenarios: {
    rpc_catalog_body_drift: {
      classification: "controlled_rpc_catalog_body_drift_rejection",
      expected_append_only_function: APPEND_ONLY_BASELINE,
      expected_history_inventory_digest: sha256(
        expectedRpcAppendOnlyHistoryInventory("rpc_catalog_body_drift"),
      ),
      expected_rpc_inventory: RPC_CATALOG_BODY_DRIFT_PRECONDITION,
      expected_rpc_inventory_digest: sha256(
        RPC_CATALOG_BODY_DRIFT_PRECONDITION,
      ),
      no_transition_domains: NO_TRANSITION_DOMAINS,
      precondition_type: "rpc_catalog_body_drift",
      scenario_id: "rpc_catalog_body_drift",
      selected_rpc_signature: SELECTED_RPC_SIGNATURE,
      terminal_reason:
        `Action 661J refuses RPC catalog/body drift: ${SELECTED_RPC_SIGNATURE}`,
      terminal_sqlstate: "P0001",
    },
    incompatible_append_only_function: {
      classification: "controlled_incompatible_append_only_function_rejection",
      expected_append_only_function: APPEND_ONLY_PRECONDITION,
      expected_history_inventory_digest: sha256(
        expectedRpcAppendOnlyHistoryInventory("incompatible_append_only_function"),
      ),
      expected_rpc_inventory: FROZEN_EIGHT_RPC_INVENTORY,
      expected_rpc_inventory_digest: sha256(FROZEN_EIGHT_RPC_INVENTORY),
      no_transition_domains: NO_TRANSITION_DOMAINS,
      precondition_type: "incompatible_append_only_function",
      scenario_id: "incompatible_append_only_function",
      selected_rpc_signature: null,
      terminal_reason:
        "Action 661J refuses incompatible canonical append-only function",
      terminal_sqlstate: "P0001",
    },
  },
});
export const RPC_APPEND_ONLY_POLICY_REGISTRY_DIGEST = sha256(
  RPC_APPEND_ONLY_POLICY_REGISTRY,
);

export const RPC_APPEND_ONLY_RUNTIME_REGISTRY = deepFreeze({
  predecessor_runtime_registry:
    "action_661j5r7_column_acl_policy_runtime_registry_rebuild_v1",
  registry_version: RPC_APPEND_ONLY_RUNTIME_REGISTRY_VERSION,
  scenarios: {
    rpc_catalog_body_drift: {
      policy_registry_version: RPC_APPEND_ONLY_POLICY_REGISTRY_VERSION,
      protocol_version: RPC_APPEND_ONLY_RESULT_PROTOCOL_VERSION,
      runner_version:
        "action_661j5r8_rpc_append_only_runtime_runner_rebuild_v1",
      scenario_id: "rpc_catalog_body_drift",
      status: "implemented",
    },
    incompatible_append_only_function: {
      policy_registry_version: RPC_APPEND_ONLY_POLICY_REGISTRY_VERSION,
      protocol_version: RPC_APPEND_ONLY_RESULT_PROTOCOL_VERSION,
      runner_version:
        "action_661j5r8_rpc_append_only_runtime_runner_rebuild_v1",
      scenario_id: "incompatible_append_only_function",
      status: "implemented",
    },
  },
});
export const RPC_APPEND_ONLY_RUNTIME_REGISTRY_DIGEST = sha256(
  RPC_APPEND_ONLY_RUNTIME_REGISTRY,
);

export function rpcAppendOnlyPolicyForScenario(scenarioId) {
  const policy = RPC_APPEND_ONLY_POLICY_REGISTRY.scenarios[scenarioId];
  if (!policy) throw new Error(`${REASON_CODES.policy}:unknown_scenario`);
  return policy;
}

export function rpcAppendOnlySelectionForScenario(scenarioId) {
  const selection = RPC_APPEND_ONLY_RUNTIME_REGISTRY.scenarios[scenarioId];
  if (!selection || selection.status !== "implemented") {
    throw new Error(`${REASON_CODES.runtime_registry}:scenario_not_implemented`);
  }
  return selection;
}

export function buildRpcAppendOnlyPreconditionReference(scenarioId) {
  const policy = rpcAppendOnlyPolicyForScenario(scenarioId);
  const projection = {
    expected_append_only_function: policy.expected_append_only_function,
    expected_history_inventory_digest:
      policy.expected_history_inventory_digest,
    expected_rpc_inventory_digest: policy.expected_rpc_inventory_digest,
    policy_registry_digest: RPC_APPEND_ONLY_POLICY_REGISTRY_DIGEST,
    precondition_reference_version:
      RPC_APPEND_ONLY_PRECONDITION_REFERENCE_VERSION,
    precondition_type: policy.precondition_type,
    scenario_id: scenarioId,
    selected_rpc_signature: policy.selected_rpc_signature,
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

export function verifyRpcAppendOnlyPreconditionReference(reference, scenarioId) {
  const expected = buildRpcAppendOnlyPreconditionReference(scenarioId);
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
