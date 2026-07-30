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
  RELATION_STATE_RESULT_PROTOCOL_VERSION,
  RELATION_STATE_RUNTIME_REGISTRY_VERSION,
} from "./action-661j5r4-relation-state-contracts-rebuild-v1.mjs";

export const RELATION_STATE_RUNNER_AUTHORITY_VERSION =
  "action_661j5r4_relation_state_runner_authority_rebuild_v1";
export const RELATION_STATE_RUNNER_MODULE_PATH =
  "lib/action-661j5r4-relation-state-runtime-runner-rebuild-v1.mjs";
export const RELATION_STATE_RUNNER_MODULE_SHA256 =
  "f25de9a477b8f3a8756de7a3223810bc5de409a0d7e975a5b3208b8810c2ccc1";
export const RELATION_STATE_RUNNER_VERSION =
  "action_661j5r4_relation_state_runtime_runner_rebuild_v1";

const AUTHORITY_PATH =
  "lib/action-661j5r4-relation-state-runner-authority-rebuild-v1.mjs";

function fileSha(path) {
  return createHash("sha256")
    .update(readFileSync(resolve(process.cwd(), path)))
    .digest("hex");
}

export const RELATION_STATE_RUNNER_CAPABILITY_MATRIX = deepFreeze({
  non_table: RELATION_STATE_RESULT_PROTOCOL_VERSION,
  wrong_owner: RELATION_STATE_RESULT_PROTOCOL_VERSION,
});

export function buildRelationStateRunnerIdentityReceiptRebuildV1() {
  if (fileSha(RELATION_STATE_RUNNER_MODULE_PATH) !== RELATION_STATE_RUNNER_MODULE_SHA256) {
    throw new Error(`${REASON_CODES.runner_identity}:runner_module_sha256`);
  }
  const projection = {
    authority_module_path: AUTHORITY_PATH,
    authority_module_sha256: fileSha(AUTHORITY_PATH),
    authority_version: RELATION_STATE_RUNNER_AUTHORITY_VERSION,
    capability_matrix: RELATION_STATE_RUNNER_CAPABILITY_MATRIX,
    capability_matrix_digest: sha256(RELATION_STATE_RUNNER_CAPABILITY_MATRIX),
    dependency_versions: {
      result_protocol: RELATION_STATE_RESULT_PROTOCOL_VERSION,
      runtime_registry: RELATION_STATE_RUNTIME_REGISTRY_VERSION,
      snapshot_contract: SNAPSHOT_CONTRACT,
    },
    no_external_access: true,
    no_production_access: true,
    runner_module_path: RELATION_STATE_RUNNER_MODULE_PATH,
    runner_module_sha256: RELATION_STATE_RUNNER_MODULE_SHA256,
    runner_version: RELATION_STATE_RUNNER_VERSION,
  };
  return deepFreeze({
    ...projection,
    runner_identity_digest: sha256(projection),
  });
}

export function verifyRelationStateRunnerIdentityReceiptRebuildV1(receipt) {
  const expected = buildRelationStateRunnerIdentityReceiptRebuildV1();
  assertClosed(receipt, Object.keys(expected), REASON_CODES.runner_identity);
  if (canonicalJson(receipt) !== canonicalJson(expected)) {
    throw new Error(REASON_CODES.runner_identity);
  }
  return receipt;
}
