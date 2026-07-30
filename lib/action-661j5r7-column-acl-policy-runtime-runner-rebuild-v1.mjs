import {
  COLUMN_ACL_POLICY_RESULT_PROTOCOL_VERSION,
  COLUMN_ACL_POLICY_RUNTIME_REGISTRY_DIGEST,
  columnAclPolicySelectionForScenario,
} from "./action-661j5r7-column-acl-policy-contracts-rebuild-v1.mjs";
import {
  buildColumnAclPolicyResultChainRebuildV1,
  persistColumnAclPolicyResultFileRebuildV1,
} from "./action-661j5r7-column-acl-policy-result-protocol-rebuild-v1.mjs";

export const COLUMN_ACL_POLICY_RUNTIME_RUNNER_VERSION =
  "action_661j5r7_column_acl_policy_runtime_runner_rebuild_v1";

export const COLUMN_ACL_POLICY_RUNTIME_RUNNER_CAPABILITIES = Object.freeze({
  column_acl_state: COLUMN_ACL_POLICY_RESULT_PROTOCOL_VERSION,
  policy_state: COLUMN_ACL_POLICY_RESULT_PROTOCOL_VERSION,
});

export async function runColumnAclPolicyScenarioRebuildV1(input) {
  const expected = [
    "output_path",
    "persist_diagnostic",
    "run_id",
    "runtime_attempt",
    "scenario_id",
    "shard_id",
  ].sort();
  if (JSON.stringify(Object.keys(input).sort()) !== JSON.stringify(expected)) {
    throw new Error("rebuild_v1.column_acl_policy_runner_input_invalid");
  }
  const selection = columnAclPolicySelectionForScenario(input.scenario_id);
  if (
    selection.runner_version !== COLUMN_ACL_POLICY_RUNTIME_RUNNER_VERSION ||
    selection.protocol_version !==
      COLUMN_ACL_POLICY_RUNTIME_RUNNER_CAPABILITIES[input.scenario_id]
  ) {
    throw new Error("rebuild_v1.column_acl_policy_runner_selection_mismatch");
  }
  const capture = await input.runtime_attempt({
    protocol_version: selection.protocol_version,
    registry_digest: COLUMN_ACL_POLICY_RUNTIME_REGISTRY_DIGEST,
    scenario_id: input.scenario_id,
  });
  await input.persist_diagnostic(capture.diagnostic);
  const chain = buildColumnAclPolicyResultChainRebuildV1({
    capture,
    run_id: input.run_id,
    scenario_id: input.scenario_id,
    shard_id: input.shard_id,
  });
  const persistence = persistColumnAclPolicyResultFileRebuildV1({
    file: chain.file,
    output_path: input.output_path,
  });
  return Object.freeze({ ...chain, persistence });
}
