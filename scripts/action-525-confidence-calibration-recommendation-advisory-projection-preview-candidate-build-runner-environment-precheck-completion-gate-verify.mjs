#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-record.json",
  doc:
    "docs/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-completion-gate.md",
  action524:
    "docs/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-approval-record.json",
  action523:
    "docs/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-record.json",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
  packageJson: "package.json",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  requiredKeys: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function allFalse(record, keys, failures) {
  for (const key of keys) pass(record[key] === false, `${key} must be false`, failures);
}

const failures = [];
for (const requiredPath of Object.values(paths)) {
  pass(existsSync(join(repoRoot, requiredPath)), `missing required path: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(paths.record);
  const doc = read(paths.doc);
  const action524 = readJson(paths.action524);
  const action523 = readJson(paths.action523);
  const routeSource = read(paths.route);
  const packageJson = readJson(paths.packageJson);
  const serialized = JSON.stringify(record);

  pass(record.schema_version === "action_525_candidate_build_runner_environment_precheck_record_v1", "schema mismatch", failures);
  pass(record.source_action === 524, "source action mismatch", failures);
  pass(action524.approval_decision === "approved_with_conditions", "Action 524 approval mismatch", failures);
  pass(action524.remediation_readiness === "runner_environment_remediation_ready_with_conditions", "Action 524 readiness mismatch", failures);
  pass(action523.approval_decision === "approved", "Action 523 approval mismatch", failures);
  pass(record.action_524_approval_decision === action524.approval_decision, "Action 524 decision binding mismatch", failures);
  pass(record.action_524_remediation_readiness === action524.remediation_readiness, "Action 524 readiness binding mismatch", failures);

  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full inventory hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate count mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "route hash mismatch", failures);
  pass(sha256(routeSource) === expected.routeHash, "current route hash mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "route export surface mismatch", failures);
  pass(packageJson.scripts?.build === "next build", "package build script changed", failures);

  pass(record.precheck_classification === "candidate_build_runner_environment_precheck_completion", "precheck classification mismatch", failures);
  pass(record.combined_runner_blocker === "candidate_build_runner_environment_contract_incomplete", "combined blocker mismatch", failures);
  pass(record.candidate_defect_status === "candidate_defect_not_proven", "candidate defect status mismatch", failures);
  pass(record.candidate_hash_change_required === false, "candidate hash change required", failures);

  const signals = record.required_public_build_signals ?? [];
  pass(JSON.stringify(signals.map((entry) => entry.key).sort()) === JSON.stringify([...expected.requiredKeys].sort()), "required key set mismatch", failures);
  for (const signal of signals) {
    pass(signal.classification === "required_public_build_signal", `${signal.key} classification mismatch`, failures);
    pass(["present_in_parent_environment", "absent_in_parent_environment", "unavailable", "ambiguous"].includes(signal.presence), `${signal.key} presence vocabulary mismatch`, failures);
    pass(["valid_shape", "invalid_shape", "shape_not_checked"].includes(signal.safe_shape), `${signal.key} shape vocabulary mismatch`, failures);
    pass(typeof signal.propagation_eligible === "boolean", `${signal.key} propagation flag mismatch`, failures);
  }
  pass(signals.every((entry) => entry.presence === "absent_in_parent_environment"), "expected absent parent environment classification mismatch", failures);
  pass(signals.every((entry) => entry.propagation_eligible === false), "absent signals should not be propagation eligible", failures);

  pass(record.server_only_secrets_required_for_build === false, "server secrets required", failures);
  pass(record.prohibited_secret_values_inspected === false, "prohibited secret values inspected", failures);
  pass(record.environment_construction_result === "ephemeral_build_environment_blocked", "environment construction result mismatch", failures);
  pass(record.allowlisted_key_count === 0, "allowlisted key count mismatch", failures);
  pass(record.child_environment_disposable === true, "child env disposable mismatch", failures);
  allFalse(
    record,
    [
      "raw_environment_values_recorded",
      "environment_value_lengths_recorded",
      "environment_value_prefixes_recorded",
      "environment_value_suffixes_recorded",
      "environment_value_hashes_recorded",
      "full_environment_enumerated",
      "environment_persisted",
      "env_file_written",
      "parent_environment_modified",
    ],
    failures,
  );

  pass(record.child_process_spawn === "passed", "child process spawn mismatch", failures);
  pass(record.child_process_exit_classification === "zero", "child process exit mismatch", failures);
  pass(record.child_process_cleanup_result === "passed", "child process cleanup mismatch", failures);
  pass(record.loopback_binding === "failed", "loopback binding mismatch", failures);
  pass(record.loopback_bind_address === "loopback_only", "loopback address mismatch", failures);
  pass(record.loopback_external_interface_used === false, "external interface used", failures);
  pass(record.loopback_failure_classification === "permission_restricted", "loopback failure classification mismatch", failures);
  pass(record.ephemeral_port_binding === "failed", "ephemeral port binding mismatch", failures);
  pass(record.fixed_port_used === false, "fixed port used", failures);
  pass(record.port_value_recorded === false, "port value recorded", failures);
  pass(record.local_socket_creation === "failed", "socket creation mismatch", failures);
  pass(record.local_socket_path_recorded === false, "socket path recorded", failures);
  pass(record.local_socket_cleanup_result === "passed", "socket cleanup mismatch", failures);

  pass(record.temp_directory_identity === "system_temp_ture_action_525_precheck_subtree", "temp identity mismatch", failures);
  pass(record.temp_path_recorded === false, "temp path recorded", failures);
  pass(record.temp_directory_readability === "passed", "temp readability mismatch", failures);
  pass(record.temp_directory_writability === "passed", "temp writability mismatch", failures);
  pass(record.temp_cleanup === "passed", "temp cleanup mismatch", failures);
  pass(record.build_output_writability === "passed", "output writability mismatch", failures);
  pass(record.build_output_repo_next_used === false, "repo .next used", failures);
  pass(record.file_descriptor_capacity === "sufficient", "fd capacity mismatch", failures);
  pass(record.process_resource_capacity === "sufficient", "process resource capacity mismatch", failures);
  pass(record.resource_cleanup_result === "passed", "resource cleanup mismatch", failures);

  const tempSubtree = join(
    tmpdir(),
    "ture",
    "action-525-confidence-calibration-projection-preview-runner-environment-precheck",
  );
  pass(!existsSync(tempSubtree), "Action 525 temp subtree still exists", failures);

  pass(record.public_environment_readiness === "public_build_environment_blocked", "public readiness mismatch", failures);
  pass(record.runner_capability_readiness === "runner_capability_blocked", "runner readiness mismatch", failures);
  pass(record.overall_precheck_readiness === "candidate_build_runner_precheck_blocked", "overall readiness mismatch", failures);
  pass(record.approval_decision === "blocked", "approval decision mismatch", failures);
  pass(record.unresolved_conditions.includes("NEXT_PUBLIC_SUPABASE_URL:required_public_build_signal_not_ready"), "URL blocker missing", failures);
  pass(record.unresolved_conditions.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY:required_public_build_signal_not_ready"), "anon key blocker missing", failures);
  pass(record.unresolved_conditions.includes("loopback_binding_failed_permission_restricted"), "loopback blocker missing", failures);
  pass(record.next_action === "action_526_public_build_environment_and_loopback_capability_remediation_gate", "next action mismatch", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);

  allFalse(
    record,
    [
      "candidate_change_required",
      "package_or_config_change_required",
      "build_performed",
      "webpack_executed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "external_network_used",
      "install_performed",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ],
    failures,
  );

  for (const phrase of [
    "Action 525",
    expected.changeHash,
    expected.fullHash,
    expected.routeHash,
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "absent_in_parent_environment",
    "ephemeral_build_environment_blocked",
    "loopback_binding_failed_permission_restricted",
    "candidate_build_runner_precheck_blocked",
    "action_526_public_build_environment_and_loopback_capability_remediation_gate",
    "runtime_preview_waiting_for_operator_inputs",
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }

  pass(!/=[A-Za-z0-9+/_.:-]{16,}/.test(doc), "doc may contain assignment-like secret value", failures);
  pass(!/=[A-Za-z0-9+/_.:-]{16,}/.test(serialized), "record may contain assignment-like secret value", failures);
}

const result = {
  verifier:
    "action_525_confidence_calibration_recommendation_advisory_projection_preview_candidate_build_runner_environment_precheck_completion_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  public_environment_readiness:
    failures.length === 0 ? "public_build_environment_blocked" : "verification_failed",
  runner_capability_readiness:
    failures.length === 0 ? "runner_capability_blocked" : "verification_failed",
  overall_precheck_readiness:
    failures.length === 0 ? "candidate_build_runner_precheck_blocked" : "verification_failed",
  approval_decision: failures.length === 0 ? "blocked" : "verification_failed",
  next_action:
    failures.length === 0
      ? "action_526_public_build_environment_and_loopback_capability_remediation_gate"
      : "verification_failed",
  build_performed: false,
  rehearsal_performed: false,
  deployment_performed: false,
  preview_activated: false,
  runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
  failures,
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  process.exit(1);
}
