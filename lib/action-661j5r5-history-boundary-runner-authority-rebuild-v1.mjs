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
  HISTORY_RESULT_PROTOCOL_VERSION,
  HISTORY_RUNTIME_REGISTRY_VERSION,
} from "./action-661j5r5-history-boundary-contracts-rebuild-v1.mjs";

export const HISTORY_RUNNER_AUTHORITY_VERSION =
  "action_661j5r5_history_boundary_runner_authority_rebuild_v1";
export const HISTORY_RUNNER_MODULE_PATH =
  "lib/action-661j5r5-history-boundary-runtime-runner-rebuild-v1.mjs";
export const HISTORY_RUNNER_MODULE_SHA256 =
  "7ac5a10162d086f5e9cd270d3bf7cc127b1e8c29c32a97ed838034144d1a7578";
export const HISTORY_RUNNER_VERSION =
  "action_661j5r5_history_boundary_runtime_runner_rebuild_v1";

const AUTHORITY_PATH =
  "lib/action-661j5r5-history-boundary-runner-authority-rebuild-v1.mjs";

function fileSha(path) {
  return createHash("sha256")
    .update(readFileSync(resolve(process.cwd(), path)))
    .digest("hex");
}

export const HISTORY_RUNNER_CAPABILITY_MATRIX = deepFreeze({
  missing_action_650_history: HISTORY_RESULT_PROTOCOL_VERSION,
  incident_history_present: HISTORY_RESULT_PROTOCOL_VERSION,
});

export function buildHistoryRunnerIdentityReceiptRebuildV1() {
  if (fileSha(HISTORY_RUNNER_MODULE_PATH) !== HISTORY_RUNNER_MODULE_SHA256) {
    throw new Error(`${REASON_CODES.runner_identity}:runner_module_sha256`);
  }
  const projection = {
    authority_module_path: AUTHORITY_PATH,
    authority_module_sha256: fileSha(AUTHORITY_PATH),
    authority_version: HISTORY_RUNNER_AUTHORITY_VERSION,
    capability_matrix: HISTORY_RUNNER_CAPABILITY_MATRIX,
    capability_matrix_digest: sha256(HISTORY_RUNNER_CAPABILITY_MATRIX),
    dependency_versions: {
      result_protocol: HISTORY_RESULT_PROTOCOL_VERSION,
      runtime_registry: HISTORY_RUNTIME_REGISTRY_VERSION,
      snapshot_contract: SNAPSHOT_CONTRACT,
    },
    no_external_access: true,
    no_production_access: true,
    runner_module_path: HISTORY_RUNNER_MODULE_PATH,
    runner_module_sha256: HISTORY_RUNNER_MODULE_SHA256,
    runner_version: HISTORY_RUNNER_VERSION,
  };
  return deepFreeze({
    ...projection,
    runner_identity_digest: sha256(projection),
  });
}

export function verifyHistoryRunnerIdentityReceiptRebuildV1(receipt) {
  const expected = buildHistoryRunnerIdentityReceiptRebuildV1();
  assertClosed(receipt, Object.keys(expected), REASON_CODES.runner_identity);
  if (canonicalJson(receipt) !== canonicalJson(expected)) {
    throw new Error(REASON_CODES.runner_identity);
  }
  return receipt;
}
