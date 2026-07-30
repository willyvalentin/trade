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
  TERMINAL_RESULT_PROTOCOL_VERSION,
  TERMINAL_RUNTIME_REGISTRY_VERSION,
} from "./action-661j5r6-terminal-boundary-contracts-rebuild-v1.mjs";

export const TERMINAL_RUNNER_AUTHORITY_VERSION =
  "action_661j5r6_terminal_boundary_runner_authority_rebuild_v1";
export const TERMINAL_RUNNER_MODULE_PATH =
  "lib/action-661j5r6-terminal-boundary-runtime-runner-rebuild-v1.mjs";
export const TERMINAL_RUNNER_MODULE_SHA256 =
  "c7bc6cdc3f4b67d13306600f61b7a341b9e229d8342741a9ec08be65b56c4cfc";
export const TERMINAL_RUNNER_VERSION =
  "action_661j5r6_terminal_boundary_runtime_runner_rebuild_v1";

const AUTHORITY_PATH =
  "lib/action-661j5r6-terminal-boundary-runner-authority-rebuild-v1.mjs";

function fileSha(path) {
  return createHash("sha256")
    .update(readFileSync(resolve(process.cwd(), path)))
    .digest("hex");
}

export const TERMINAL_RUNNER_CAPABILITY_MATRIX = deepFreeze({
  duplicate_containment_history: TERMINAL_RESULT_PROTOCOL_VERSION,
  unknown_acl_state: TERMINAL_RESULT_PROTOCOL_VERSION,
});

export function buildTerminalRunnerIdentityReceiptRebuildV1() {
  if (fileSha(TERMINAL_RUNNER_MODULE_PATH) !== TERMINAL_RUNNER_MODULE_SHA256) {
    throw new Error(`${REASON_CODES.runner_identity}:runner_module_sha256`);
  }
  const projection = {
    authority_module_path: AUTHORITY_PATH,
    authority_module_sha256: fileSha(AUTHORITY_PATH),
    authority_version: TERMINAL_RUNNER_AUTHORITY_VERSION,
    capability_matrix: TERMINAL_RUNNER_CAPABILITY_MATRIX,
    capability_matrix_digest: sha256(TERMINAL_RUNNER_CAPABILITY_MATRIX),
    dependency_versions: {
      result_protocol: TERMINAL_RESULT_PROTOCOL_VERSION,
      runtime_registry: TERMINAL_RUNTIME_REGISTRY_VERSION,
      snapshot_contract: SNAPSHOT_CONTRACT,
    },
    no_external_access: true,
    no_production_access: true,
    runner_module_path: TERMINAL_RUNNER_MODULE_PATH,
    runner_module_sha256: TERMINAL_RUNNER_MODULE_SHA256,
    runner_version: TERMINAL_RUNNER_VERSION,
  };
  return deepFreeze({
    ...projection,
    runner_identity_digest: sha256(projection),
  });
}

export function verifyTerminalRunnerIdentityReceiptRebuildV1(receipt) {
  const expected = buildTerminalRunnerIdentityReceiptRebuildV1();
  assertClosed(receipt, Object.keys(expected), REASON_CODES.runner_identity);
  if (canonicalJson(receipt) !== canonicalJson(expected)) {
    throw new Error(REASON_CODES.runner_identity);
  }
  return receipt;
}
