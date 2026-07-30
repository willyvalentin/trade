import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

import {
  REASON_CODES,
  RESULT_PROTOCOL_VERSION,
  RUNTIME_REGISTRY_VERSION,
  SNAPSHOT_CONTRACT,
  assertClosed,
  canonicalJson,
  deepFreeze,
  sha256,
} from "./action-661j5r2-runtime-contracts-rebuild-v1.mjs";

export const RUNNER_AUTHORITY_VERSION =
  "action_661j5r2_runtime_runner_authority_rebuild_v1";
export const RUNNER_MODULE_PATH =
  "lib/action-661j5r2-runtime-runner-rebuild-v1.mjs";
export const RUNNER_MODULE_SHA256 =
  "86a9d80db6ae5999e3ba04fee3b8aed9b245f9ede9b391c3144eb51443b1a472";
export const RUNNER_VERSION = "action_661j5r2_runtime_runner_rebuild_v1";

const AUTHORITY_MODULE_PATH =
  "lib/action-661j5r2-runtime-runner-authority-rebuild-v1.mjs";
const RECEIPT_FIELDS = [
  "authority_module_path",
  "authority_module_sha256",
  "authority_version",
  "capability_matrix",
  "capability_matrix_digest",
  "dependency_versions",
  "no_external_access",
  "no_production_access",
  "runner_identity_digest",
  "runner_module_path",
  "runner_module_sha256",
  "runner_version",
];

function fileSha256(url) {
  return createHash("sha256").update(readFileSync(url)).digest("hex");
}

export const RUNNER_CAPABILITY_MATRIX = deepFreeze({
  forbidden_history: RESULT_PROTOCOL_VERSION,
  missing_target: RESULT_PROTOCOL_VERSION,
});

export const RUNNER_DEPENDENCY_VERSIONS = deepFreeze({
  result_protocol: RESULT_PROTOCOL_VERSION,
  runtime_registry: RUNTIME_REGISTRY_VERSION,
  snapshot_contract: SNAPSHOT_CONTRACT,
});

export function buildRunnerIdentityReceiptRebuildV1() {
  const runnerPath = resolve(process.cwd(), RUNNER_MODULE_PATH);
  if (fileSha256(runnerPath) !== RUNNER_MODULE_SHA256) {
    throw new Error(`${REASON_CODES.runner_identity}:runner_module_sha256`);
  }
  const authorityModuleSha256 = fileSha256(
    resolve(process.cwd(), AUTHORITY_MODULE_PATH),
  );
  const projection = {
    authority_module_path: AUTHORITY_MODULE_PATH,
    authority_module_sha256: authorityModuleSha256,
    authority_version: RUNNER_AUTHORITY_VERSION,
    capability_matrix: RUNNER_CAPABILITY_MATRIX,
    capability_matrix_digest: sha256(RUNNER_CAPABILITY_MATRIX),
    dependency_versions: RUNNER_DEPENDENCY_VERSIONS,
    no_external_access: true,
    no_production_access: true,
    runner_module_path: RUNNER_MODULE_PATH,
    runner_module_sha256: RUNNER_MODULE_SHA256,
    runner_version: RUNNER_VERSION,
  };
  return deepFreeze({
    ...projection,
    runner_identity_digest: sha256(projection),
  });
}

export function verifyRunnerIdentityReceiptRebuildV1(receipt) {
  assertClosed(receipt, RECEIPT_FIELDS, REASON_CODES.runner_identity);
  const rebuilt = buildRunnerIdentityReceiptRebuildV1();
  if (canonicalJson(receipt) !== canonicalJson(rebuilt)) {
    throw new Error(REASON_CODES.runner_identity);
  }
  return receipt;
}

export function runnerAuthorityModuleSha256RebuildV1() {
  return fileSha256(resolve(process.cwd(), AUTHORITY_MODULE_PATH));
}
