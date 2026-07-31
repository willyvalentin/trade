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
  RPC_APPEND_ONLY_RESULT_PROTOCOL_VERSION,
  RPC_APPEND_ONLY_RUNTIME_REGISTRY_VERSION,
} from "./action-661j5r8-rpc-append-only-contracts-rebuild-v1.mjs";

export const RPC_APPEND_ONLY_RUNNER_AUTHORITY_VERSION =
  "action_661j5r8_rpc_append_only_runner_authority_rebuild_v1";
export const RPC_APPEND_ONLY_RUNNER_MODULE_PATH =
  "lib/action-661j5r8-rpc-append-only-runtime-runner-rebuild-v1.mjs";
export const RPC_APPEND_ONLY_RUNNER_MODULE_SHA256 =
  "856915916ec48e4ec8d4b8289908ec32a8faae935cfffa9744a429e3a1b00931";
export const RPC_APPEND_ONLY_RUNNER_VERSION =
  "action_661j5r8_rpc_append_only_runtime_runner_rebuild_v1";

const AUTHORITY_PATH =
  "lib/action-661j5r8-rpc-append-only-runner-authority-rebuild-v1.mjs";

function fileSha(path) {
  return createHash("sha256")
    .update(readFileSync(resolve(process.cwd(), path)))
    .digest("hex");
}

export const RPC_APPEND_ONLY_RUNNER_CAPABILITY_MATRIX = deepFreeze({
  rpc_catalog_body_drift: RPC_APPEND_ONLY_RESULT_PROTOCOL_VERSION,
  incompatible_append_only_function: RPC_APPEND_ONLY_RESULT_PROTOCOL_VERSION,
});

export function buildRpcAppendOnlyRunnerIdentityReceiptRebuildV1() {
  if (fileSha(RPC_APPEND_ONLY_RUNNER_MODULE_PATH) !== RPC_APPEND_ONLY_RUNNER_MODULE_SHA256) {
    throw new Error(`${REASON_CODES.runner_identity}:runner_module_sha256`);
  }
  const projection = {
    authority_module_path: AUTHORITY_PATH,
    authority_module_sha256: fileSha(AUTHORITY_PATH),
    authority_version: RPC_APPEND_ONLY_RUNNER_AUTHORITY_VERSION,
    capability_matrix: RPC_APPEND_ONLY_RUNNER_CAPABILITY_MATRIX,
    capability_matrix_digest: sha256(RPC_APPEND_ONLY_RUNNER_CAPABILITY_MATRIX),
    dependency_versions: {
      result_protocol: RPC_APPEND_ONLY_RESULT_PROTOCOL_VERSION,
      runtime_registry: RPC_APPEND_ONLY_RUNTIME_REGISTRY_VERSION,
      snapshot_contract: SNAPSHOT_CONTRACT,
    },
    no_external_access: true,
    no_production_access: true,
    runner_module_path: RPC_APPEND_ONLY_RUNNER_MODULE_PATH,
    runner_module_sha256: RPC_APPEND_ONLY_RUNNER_MODULE_SHA256,
    runner_version: RPC_APPEND_ONLY_RUNNER_VERSION,
  };
  return deepFreeze({
    ...projection,
    runner_identity_digest: sha256(projection),
  });
}

export function verifyRpcAppendOnlyRunnerIdentityReceiptRebuildV1(receipt) {
  const expected = buildRpcAppendOnlyRunnerIdentityReceiptRebuildV1();
  assertClosed(receipt, Object.keys(expected), REASON_CODES.runner_identity);
  if (canonicalJson(receipt) !== canonicalJson(expected)) {
    throw new Error(REASON_CODES.runner_identity);
  }
  return receipt;
}
