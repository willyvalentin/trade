import {
  HISTORY_RESULT_PROTOCOL_VERSION,
  HISTORY_RUNTIME_REGISTRY_DIGEST,
  historySelectionForScenario,
} from "./action-661j5r5-history-boundary-contracts-rebuild-v1.mjs";
import {
  buildHistoryResultChainRebuildV1,
  persistHistoryResultFileRebuildV1,
} from "./action-661j5r5-history-boundary-result-protocol-rebuild-v1.mjs";

export const HISTORY_RUNTIME_RUNNER_VERSION =
  "action_661j5r5_history_boundary_runtime_runner_rebuild_v1";

export const HISTORY_RUNTIME_RUNNER_CAPABILITIES = Object.freeze({
  missing_action_650_history: HISTORY_RESULT_PROTOCOL_VERSION,
  incident_history_present: HISTORY_RESULT_PROTOCOL_VERSION,
});

export async function runHistoryScenarioRebuildV1(input) {
  const expected = [
    "output_path",
    "persist_diagnostic",
    "run_id",
    "runtime_attempt",
    "scenario_id",
    "shard_id",
  ].sort();
  if (JSON.stringify(Object.keys(input).sort()) !== JSON.stringify(expected)) {
    throw new Error("rebuild_v1.history_boundary_runner_input_invalid");
  }
  const selection = historySelectionForScenario(input.scenario_id);
  if (
    selection.runner_version !== HISTORY_RUNTIME_RUNNER_VERSION ||
    selection.protocol_version !==
      HISTORY_RUNTIME_RUNNER_CAPABILITIES[input.scenario_id]
  ) {
    throw new Error("rebuild_v1.history_boundary_runner_selection_mismatch");
  }
  const capture = await input.runtime_attempt({
    protocol_version: selection.protocol_version,
    registry_digest: HISTORY_RUNTIME_REGISTRY_DIGEST,
    scenario_id: input.scenario_id,
  });
  await input.persist_diagnostic(capture.diagnostic);
  const chain = buildHistoryResultChainRebuildV1({
    capture,
    run_id: input.run_id,
    scenario_id: input.scenario_id,
    shard_id: input.shard_id,
  });
  const persistence = persistHistoryResultFileRebuildV1({
    file: chain.file,
    output_path: input.output_path,
  });
  return Object.freeze({ ...chain, persistence });
}
