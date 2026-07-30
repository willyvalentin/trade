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
  COLUMN_ACL_POLICY_RESULT_PROTOCOL_VERSION,
  COLUMN_ACL_POLICY_RUNTIME_REGISTRY_VERSION,
} from "./action-661j5r7-column-acl-policy-contracts-rebuild-v1.mjs";

export const COLUMN_ACL_POLICY_RUNNER_AUTHORITY_VERSION =
  "action_661j5r7_column_acl_policy_runner_authority_rebuild_v1";
export const COLUMN_ACL_POLICY_RUNNER_MODULE_PATH =
  "lib/action-661j5r7-column-acl-policy-runtime-runner-rebuild-v1.mjs";
export const COLUMN_ACL_POLICY_RUNNER_MODULE_SHA256 =
  "4c97d8622c17c377f418dd1586ca268e4c50539c0812c8e951517f81c17033b3";
export const COLUMN_ACL_POLICY_RUNNER_VERSION =
  "action_661j5r7_column_acl_policy_runtime_runner_rebuild_v1";

const AUTHORITY_PATH =
  "lib/action-661j5r7-column-acl-policy-runner-authority-rebuild-v1.mjs";

function fileSha(path) {
  return createHash("sha256")
    .update(readFileSync(resolve(process.cwd(), path)))
    .digest("hex");
}

export const COLUMN_ACL_POLICY_RUNNER_CAPABILITY_MATRIX = deepFreeze({
  column_acl_state: COLUMN_ACL_POLICY_RESULT_PROTOCOL_VERSION,
  policy_state: COLUMN_ACL_POLICY_RESULT_PROTOCOL_VERSION,
});

export function buildColumnAclPolicyRunnerIdentityReceiptRebuildV1() {
  if (fileSha(COLUMN_ACL_POLICY_RUNNER_MODULE_PATH) !== COLUMN_ACL_POLICY_RUNNER_MODULE_SHA256) {
    throw new Error(`${REASON_CODES.runner_identity}:runner_module_sha256`);
  }
  const projection = {
    authority_module_path: AUTHORITY_PATH,
    authority_module_sha256: fileSha(AUTHORITY_PATH),
    authority_version: COLUMN_ACL_POLICY_RUNNER_AUTHORITY_VERSION,
    capability_matrix: COLUMN_ACL_POLICY_RUNNER_CAPABILITY_MATRIX,
    capability_matrix_digest: sha256(COLUMN_ACL_POLICY_RUNNER_CAPABILITY_MATRIX),
    dependency_versions: {
      result_protocol: COLUMN_ACL_POLICY_RESULT_PROTOCOL_VERSION,
      runtime_registry: COLUMN_ACL_POLICY_RUNTIME_REGISTRY_VERSION,
      snapshot_contract: SNAPSHOT_CONTRACT,
    },
    no_external_access: true,
    no_production_access: true,
    runner_module_path: COLUMN_ACL_POLICY_RUNNER_MODULE_PATH,
    runner_module_sha256: COLUMN_ACL_POLICY_RUNNER_MODULE_SHA256,
    runner_version: COLUMN_ACL_POLICY_RUNNER_VERSION,
  };
  return deepFreeze({
    ...projection,
    runner_identity_digest: sha256(projection),
  });
}

export function verifyColumnAclPolicyRunnerIdentityReceiptRebuildV1(receipt) {
  const expected = buildColumnAclPolicyRunnerIdentityReceiptRebuildV1();
  assertClosed(receipt, Object.keys(expected), REASON_CODES.runner_identity);
  if (canonicalJson(receipt) !== canonicalJson(expected)) {
    throw new Error(REASON_CODES.runner_identity);
  }
  return receipt;
}
