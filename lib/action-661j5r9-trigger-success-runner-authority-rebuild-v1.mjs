import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  REASON_CODES,
  SNAPSHOT_CONTRACT,
  assertClosed,
  canonicalJson,
  deepFreeze,
  sha256,
} from "./action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import {
  TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
  TRIGGER_SUCCESS_RUNTIME_REGISTRY_VERSION,
} from "./action-661j5r9-trigger-success-contracts-rebuild-v1.mjs";

export const TRIGGER_SUCCESS_RUNNER_AUTHORITY_VERSION =
  "action_661j5r9_trigger_success_runner_authority_rebuild_v1";
export const TRIGGER_SUCCESS_RUNNER_MODULE_PATH =
  "lib/action-661j5r9-trigger-success-runtime-runner-rebuild-v1.mjs";
export const TRIGGER_SUCCESS_RUNNER_MODULE_SHA256 =
  "2d3eae124e8c0a53d1786a683ea2c7972b9edad7b0e03789f8f0f60446337345";
export const TRIGGER_SUCCESS_RUNNER_VERSION =
  "action_661j5r9_trigger_success_runtime_runner_rebuild_v1";

const AUTHORITY_PATH =
  "lib/action-661j5r9-trigger-success-runner-authority-rebuild-v1.mjs";

function fileSha(path) {
  return createHash("sha256")
    .update(readFileSync(resolve(process.cwd(), path)))
    .digest("hex");
}

export const TRIGGER_SUCCESS_RUNNER_CAPABILITY_MATRIX = deepFreeze({
  preexisting_proof_audit_trigger: TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
  successful_containment: TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
});

export function buildTriggerSuccessRunnerIdentityReceiptRebuildV1() {
  if (fileSha(TRIGGER_SUCCESS_RUNNER_MODULE_PATH) !== TRIGGER_SUCCESS_RUNNER_MODULE_SHA256) {
    throw new Error(`${REASON_CODES.runner_identity}:runner_module_sha256`);
  }
  const projection = {
    authority_module_path: AUTHORITY_PATH,
    authority_module_sha256: fileSha(AUTHORITY_PATH),
    authority_version: TRIGGER_SUCCESS_RUNNER_AUTHORITY_VERSION,
    capability_matrix: TRIGGER_SUCCESS_RUNNER_CAPABILITY_MATRIX,
    capability_matrix_digest: sha256(TRIGGER_SUCCESS_RUNNER_CAPABILITY_MATRIX),
    dependency_versions: {
      result_protocol: TRIGGER_SUCCESS_RESULT_PROTOCOL_VERSION,
      runtime_registry: TRIGGER_SUCCESS_RUNTIME_REGISTRY_VERSION,
      snapshot_contract: SNAPSHOT_CONTRACT,
    },
    no_external_access: true,
    no_production_access: true,
    runner_module_path: TRIGGER_SUCCESS_RUNNER_MODULE_PATH,
    runner_module_sha256: TRIGGER_SUCCESS_RUNNER_MODULE_SHA256,
    runner_version: TRIGGER_SUCCESS_RUNNER_VERSION,
  };
  return deepFreeze({
    ...projection,
    runner_identity_digest: sha256(projection),
  });
}

export function verifyTriggerSuccessRunnerIdentityReceiptRebuildV1(receipt) {
  const expected = buildTriggerSuccessRunnerIdentityReceiptRebuildV1();
  assertClosed(receipt, Object.keys(expected), REASON_CODES.runner_identity);
  if (canonicalJson(receipt) !== canonicalJson(expected)) {
    throw new Error(REASON_CODES.runner_identity);
  }
  return receipt;
}
