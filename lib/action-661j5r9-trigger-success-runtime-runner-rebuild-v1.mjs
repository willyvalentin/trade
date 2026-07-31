import {
  TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
  TRIGGER_SUCCESS_RUNTIME_REGISTRY_DIGEST,
  triggerSuccessSelectionForScenario,
} from "./action-661j5r9-trigger-success-contracts-rebuild-v1.mjs";
import {
  buildTriggerSuccessResultChainRebuildV1,
  persistTriggerSuccessResultFileRebuildV1,
} from "./action-661j5r9-trigger-success-result-protocol-rebuild-v1.mjs";

export const TRIGGER_SUCCESS_RUNTIME_RUNNER_VERSION =
  "action_661j5r9_trigger_success_runtime_runner_rebuild_v1";

export const TRIGGER_SUCCESS_RUNTIME_RUNNER_CAPABILITIES = Object.freeze({
  preexisting_proof_audit_trigger: TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
  successful_containment: TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
});

export async function runTriggerSuccessScenarioRebuildV1(input) {
  const expected = [
    "output_path",
    "persist_diagnostic",
    "run_id",
    "runtime_attempt",
    "scenario_id",
    "shard_id",
  ].sort();
  if (JSON.stringify(Object.keys(input).sort()) !== JSON.stringify(expected)) {
    throw new Error("rebuild_v1.trigger_success_runner_input_invalid");
  }
  const selection = triggerSuccessSelectionForScenario(input.scenario_id);
  if (
    selection.runner_version !== TRIGGER_SUCCESS_RUNTIME_RUNNER_VERSION ||
    selection.protocol_version !==
      TRIGGER_SUCCESS_RUNTIME_RUNNER_CAPABILITIES[input.scenario_id]
  ) {
    throw new Error("rebuild_v1.trigger_success_runner_selection_mismatch");
  }
  const capture = await input.runtime_attempt({
    protocol_version: selection.protocol_version,
    registry_digest: TRIGGER_SUCCESS_RUNTIME_REGISTRY_DIGEST,
    scenario_id: input.scenario_id,
  });
  await input.persist_diagnostic(capture.diagnostic);
  const chain = buildTriggerSuccessResultChainRebuildV1({
    capture,
    run_id: input.run_id,
    scenario_id: input.scenario_id,
    shard_id: input.shard_id,
  });
  const persistence = persistTriggerSuccessResultFileRebuildV1({
    file: chain.file,
    output_path: input.output_path,
  });
  return Object.freeze({ ...chain, persistence });
}
