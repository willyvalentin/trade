import {
  RELATION_STATE_RESULT_PROTOCOL_VERSION,
  RELATION_STATE_RUNTIME_REGISTRY_DIGEST,
  relationStateSelectionForScenario,
} from "./action-661j5r4-relation-state-contracts-rebuild-v1.mjs";
import {
  buildRelationStateResultChainRebuildV1,
  persistRelationStateResultFileRebuildV1,
} from "./action-661j5r4-relation-state-result-protocol-rebuild-v1.mjs";

export const RELATION_STATE_RUNTIME_RUNNER_VERSION =
  "action_661j5r4_relation_state_runtime_runner_rebuild_v1";

export const RELATION_STATE_RUNTIME_RUNNER_CAPABILITIES = Object.freeze({
  non_table: RELATION_STATE_RESULT_PROTOCOL_VERSION,
  wrong_owner: RELATION_STATE_RESULT_PROTOCOL_VERSION,
});

export async function runRelationStateScenarioRebuildV1(input) {
  const expected = [
    "output_path",
    "persist_diagnostic",
    "run_id",
    "runtime_attempt",
    "scenario_id",
    "shard_id",
  ].sort();
  if (JSON.stringify(Object.keys(input).sort()) !== JSON.stringify(expected)) {
    throw new Error("rebuild_v1.relation_state_runner_input_invalid");
  }
  const selection = relationStateSelectionForScenario(input.scenario_id);
  if (
    selection.runner_version !== RELATION_STATE_RUNTIME_RUNNER_VERSION ||
    selection.protocol_version !==
      RELATION_STATE_RUNTIME_RUNNER_CAPABILITIES[input.scenario_id]
  ) {
    throw new Error("rebuild_v1.relation_state_runner_selection_mismatch");
  }
  const capture = await input.runtime_attempt({
    protocol_version: selection.protocol_version,
    registry_digest: RELATION_STATE_RUNTIME_REGISTRY_DIGEST,
    scenario_id: input.scenario_id,
  });
  await input.persist_diagnostic(capture.diagnostic);
  const chain = buildRelationStateResultChainRebuildV1({
    capture,
    run_id: input.run_id,
    scenario_id: input.scenario_id,
    shard_id: input.shard_id,
  });
  const persistence = persistRelationStateResultFileRebuildV1({
    file: chain.file,
    output_path: input.output_path,
  });
  return Object.freeze({ ...chain, persistence });
}
