import {
  RPC_APPEND_ONLY_RESULT_PROTOCOL_VERSION,
  RPC_APPEND_ONLY_RUNTIME_REGISTRY_DIGEST,
  rpcAppendOnlySelectionForScenario,
} from "./action-661j5r8-rpc-append-only-contracts-rebuild-v1.mjs";
import {
  buildRpcAppendOnlyResultChainRebuildV1,
  persistRpcAppendOnlyResultFileRebuildV1,
} from "./action-661j5r8-rpc-append-only-result-protocol-rebuild-v1.mjs";

export const RPC_APPEND_ONLY_RUNTIME_RUNNER_VERSION =
  "action_661j5r8_rpc_append_only_runtime_runner_rebuild_v1";

export const RPC_APPEND_ONLY_RUNTIME_RUNNER_CAPABILITIES = Object.freeze({
  rpc_catalog_body_drift: RPC_APPEND_ONLY_RESULT_PROTOCOL_VERSION,
  incompatible_append_only_function: RPC_APPEND_ONLY_RESULT_PROTOCOL_VERSION,
});

export async function runRpcAppendOnlyScenarioRebuildV1(input) {
  const expected = [
    "output_path",
    "persist_diagnostic",
    "run_id",
    "runtime_attempt",
    "scenario_id",
    "shard_id",
  ].sort();
  if (JSON.stringify(Object.keys(input).sort()) !== JSON.stringify(expected)) {
    throw new Error("rebuild_v1.rpc_append_only_runner_input_invalid");
  }
  const selection = rpcAppendOnlySelectionForScenario(input.scenario_id);
  if (
    selection.runner_version !== RPC_APPEND_ONLY_RUNTIME_RUNNER_VERSION ||
    selection.protocol_version !==
      RPC_APPEND_ONLY_RUNTIME_RUNNER_CAPABILITIES[input.scenario_id]
  ) {
    throw new Error("rebuild_v1.rpc_append_only_runner_selection_mismatch");
  }
  const capture = await input.runtime_attempt({
    protocol_version: selection.protocol_version,
    registry_digest: RPC_APPEND_ONLY_RUNTIME_REGISTRY_DIGEST,
    scenario_id: input.scenario_id,
  });
  await input.persist_diagnostic(capture.diagnostic);
  const chain = buildRpcAppendOnlyResultChainRebuildV1({
    capture,
    run_id: input.run_id,
    scenario_id: input.scenario_id,
    shard_id: input.shard_id,
  });
  const persistence = persistRpcAppendOnlyResultFileRebuildV1({
    file: chain.file,
    output_path: input.output_path,
  });
  return Object.freeze({ ...chain, persistence });
}
