import {
  TERMINAL_RESULT_PROTOCOL_VERSION,
  TERMINAL_RUNTIME_REGISTRY_DIGEST,
  terminalSelectionForScenario,
} from "./action-661j5r6-terminal-boundary-contracts-rebuild-v1.mjs";
import {
  buildTerminalResultChainRebuildV1,
  persistTerminalResultFileRebuildV1,
} from "./action-661j5r6-terminal-boundary-result-protocol-rebuild-v1.mjs";

export const TERMINAL_RUNTIME_RUNNER_VERSION =
  "action_661j5r6_terminal_boundary_runtime_runner_rebuild_v1";

export const TERMINAL_RUNTIME_RUNNER_CAPABILITIES = Object.freeze({
  duplicate_containment_history: TERMINAL_RESULT_PROTOCOL_VERSION,
  unknown_acl_state: TERMINAL_RESULT_PROTOCOL_VERSION,
});

export async function runTerminalScenarioRebuildV1(input) {
  const expected = [
    "output_path",
    "persist_diagnostic",
    "run_id",
    "runtime_attempt",
    "scenario_id",
    "shard_id",
  ].sort();
  if (JSON.stringify(Object.keys(input).sort()) !== JSON.stringify(expected)) {
    throw new Error("rebuild_v1.terminal_boundary_runner_input_invalid");
  }
  const selection = terminalSelectionForScenario(input.scenario_id);
  if (
    selection.runner_version !== TERMINAL_RUNTIME_RUNNER_VERSION ||
    selection.protocol_version !==
      TERMINAL_RUNTIME_RUNNER_CAPABILITIES[input.scenario_id]
  ) {
    throw new Error("rebuild_v1.terminal_boundary_runner_selection_mismatch");
  }
  const capture = await input.runtime_attempt({
    protocol_version: selection.protocol_version,
    registry_digest: TERMINAL_RUNTIME_REGISTRY_DIGEST,
    scenario_id: input.scenario_id,
  });
  await input.persist_diagnostic(capture.diagnostic);
  const chain = buildTerminalResultChainRebuildV1({
    capture,
    run_id: input.run_id,
    scenario_id: input.scenario_id,
    shard_id: input.shard_id,
  });
  const persistence = persistTerminalResultFileRebuildV1({
    file: chain.file,
    output_path: input.output_path,
  });
  return Object.freeze({ ...chain, persistence });
}
