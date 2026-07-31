import {
  RESULT_PROTOCOL_VERSION,
  RUNTIME_SCENARIO_REGISTRY_DIGEST,
  selectionForScenario,
} from "./action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import {
  buildRuntimeResultChainRebuildV1,
  persistRuntimeResultFileRebuildV1,
} from "./action-661j5r2-runtime-result-protocol-rebuild-v1.mjs";

export const RUNTIME_RUNNER_VERSION =
  "action_661j5r2_runtime_runner_rebuild_v1";

export const RUNTIME_RUNNER_CAPABILITIES = Object.freeze({
  forbidden_history: RESULT_PROTOCOL_VERSION,
  missing_target: RESULT_PROTOCOL_VERSION,
});

export async function runRuntimeScenarioRebuildV1(input) {
  const fields = Object.keys(input).sort();
  const expected = [
    "output_path",
    "persist_diagnostic",
    "run_id",
    "runtime_attempt",
    "scenario_id",
    "shard_id",
  ].sort();
  if (JSON.stringify(fields) !== JSON.stringify(expected)) {
    throw new Error("rebuild_v1.runner_input_invalid");
  }
  const selection = selectionForScenario(input.scenario_id);
  if (
    selection.runner_version !== RUNTIME_RUNNER_VERSION ||
    selection.protocol_version !== RUNTIME_RUNNER_CAPABILITIES[input.scenario_id]
  ) {
    throw new Error("rebuild_v1.runner_selection_mismatch");
  }
  if (
    typeof input.runtime_attempt !== "function" ||
    typeof input.persist_diagnostic !== "function"
  ) {
    throw new Error("rebuild_v1.runner_boundary_invalid");
  }
  const capture = await input.runtime_attempt({
    scenario_id: input.scenario_id,
    protocol_version: selection.protocol_version,
    registry_digest: RUNTIME_SCENARIO_REGISTRY_DIGEST,
  });
  await input.persist_diagnostic(capture.diagnostic);
  const chain = buildRuntimeResultChainRebuildV1({
    run_id: input.run_id,
    shard_id: input.shard_id,
    scenario_id: input.scenario_id,
    capture,
  });
  const persistence = persistRuntimeResultFileRebuildV1({
    output_path: input.output_path,
    file: chain.file,
  });
  return Object.freeze({ ...chain, persistence });
}
