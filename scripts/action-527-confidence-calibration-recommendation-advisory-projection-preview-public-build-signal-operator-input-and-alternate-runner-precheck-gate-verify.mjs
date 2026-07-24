#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-record.json",
  doc:
    "docs/action-527-confidence-calibration-recommendation-advisory-projection-preview-public-build-signal-operator-input-and-alternate-runner-precheck-gate.md",
  action526:
    "docs/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-approval-record.json",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
  packageJson: "package.json",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  requiredKeys: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  nextAction: "action_528_public_build_signal_operator_input_and_alternate_runner_capability_remediation_gate",
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
  const action526 = readJson(paths.action526);
  const doc = read(paths.doc);
  const routeSource = read(paths.route);
  const packageJson = readJson(paths.packageJson);
  const serialized = JSON.stringify(record);

  pass(
    record.schema_version ===
      "action_527_public_build_signal_operator_input_and_alternate_runner_precheck_record_v1",
    "schema mismatch",
    failures,
  );
  pass(record.source_action === 526, "source action mismatch", failures);
  pass(action526.remediation_readiness === "execution_boundary_remediation_ready_with_operator_input", "Action 526 readiness mismatch", failures);
  pass(action526.approval_decision === "approved_with_conditions", "Action 526 approval mismatch", failures);
  pass(action526.operator_input_required === true, "Action 526 operator input mismatch", failures);
  pass(action526.approved_future_execution_boundary === "approved_unrestricted_local_terminal_boundary", "Action 526 boundary mismatch", failures);
  pass(action526.candidate_hash_change_required === false, "Action 526 candidate hash change mismatch", failures);
  pass(record.action_526_remediation_readiness === action526.remediation_readiness, "Action 526 readiness binding mismatch", failures);

  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full inventory hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate count mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "route hash mismatch", failures);
  pass(sha256(routeSource) === expected.routeHash, "current route hash mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "route export surface mismatch", failures);
  pass(packageJson.scripts?.build === "next build", "package build script changed", failures);

  pass(record.approved_execution_boundary === "approved_unrestricted_local_terminal_boundary", "approved boundary mismatch", failures);
  pass(record.actual_precheck_boundary === "current_sandboxed_codex_runner", "actual boundary mismatch", failures);
  pass(record.actual_precheck_boundary_matches_approved_boundary === false, "boundary match flag mismatch", failures);

  const signals = record.required_public_build_signals ?? [];
  pass(JSON.stringify(signals.map((signal) => signal.key).sort()) === JSON.stringify([...expected.requiredKeys].sort()), "required signal mismatch", failures);
  for (const signal of signals) {
    pass(signal.classification === "required_public_build_signal", `${signal.key} classification mismatch`, failures);
    pass(["present_in_parent_environment", "absent_in_parent_environment", "unavailable", "ambiguous"].includes(signal.presence), `${signal.key} presence vocabulary mismatch`, failures);
    pass(["valid_shape", "invalid_shape", "shape_not_checked"].includes(signal.safe_shape), `${signal.key} shape vocabulary mismatch`, failures);
    pass(typeof signal.propagation_eligible === "boolean", `${signal.key} propagation flag mismatch`, failures);
  }
  pass(signals.every((signal) => signal.presence === "absent_in_parent_environment"), "expected absent public signals", failures);
  pass(signals.every((signal) => signal.propagation_eligible === false), "absent signals should not propagate", failures);
  pass(record.manual_operator_input_detected_without_values === false, "manual operator input flag mismatch", failures);

  pass(record.server_only_secrets_required === false, "server secrets required", failures);
  allFalse(
    record,
    [
      "service_role_key_propagated",
      "database_password_propagated",
      "provider_key_propagated",
      "netlify_token_propagated",
      "broker_credential_propagated",
      "prohibited_secret_values_inspected",
    ],
    failures,
  );

  pass(record.environment_construction_result === "ephemeral_build_environment_blocked", "environment construction mismatch", failures);
  pass(JSON.stringify(record.environment_allowlist) === JSON.stringify(expected.requiredKeys), "environment allowlist mismatch", failures);
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
      "shell_profile_modified",
      "parent_environment_modified",
    ],
    failures,
  );
  pass(record.child_environment_disposable === true, "child environment disposable mismatch", failures);

  pass(record.temp_boundary_identity === "system_temp_ture_action_527_confidence_calibration_projection_preview_alternate_runner_precheck_subtree", "temp identity mismatch", failures);
  pass(record.canonical_trusted_temp_root === true, "canonical temp root mismatch", failures);
  pass(record.macos_var_private_var_equivalence_allowed === true, "macOS temp equivalence mismatch", failures);
  pass(record.path_relative_containment_used === true, "path containment mismatch", failures);
  pass(record.string_prefix_containment_used === false, "string prefix containment used", failures);
  pass(record.traversal_rejected === true, "traversal rejection mismatch", failures);
  pass(record.symlink_rejected === true, "symlink rejection mismatch", failures);
  pass(record.forbidden_root_separation_verified === true, "forbidden root separation mismatch", failures);
  pass(record.candidate_source_written === false, "candidate source written", failures);

  pass(record.child_process_spawn === "passed", "child process mismatch", failures);
  pass(record.child_process_exit === "success", "child process exit mismatch", failures);
  pass(record.child_process_fixed_output_only === true, "fixed output mismatch", failures);
  pass(record.child_process_executable_path_recorded === false, "executable path recorded", failures);
  pass(record.external_network_used === false, "external network used", failures);
  pass(record.nextjs_invoked === false, "Next.js invoked", failures);
  pass(record.loopback_binding === "failed", "loopback binding mismatch", failures);
  pass(record.ephemeral_port_binding === "failed", "ephemeral port binding mismatch", failures);
  pass(record.port_value_recorded === false, "port value recorded", failures);
  pass(record.local_ipc_capability === "failed", "local IPC mismatch", failures);
  pass(record.local_ipc_path_retained === false, "local IPC path retained", failures);
  pass(record.temp_output_capability === "passed", "temp output mismatch", failures);
  pass(record.repository_next_directory_used === false, "repo .next used", failures);

  pass(record.child_process_capacity === "sufficient", "child process capacity mismatch", failures);
  pass(record.loopback_capacity === "unavailable", "loopback capacity mismatch", failures);
  pass(record.local_ipc_capacity === "unavailable", "IPC capacity mismatch", failures);
  pass(record.file_descriptor_capacity === "sufficient", "fd capacity mismatch", failures);
  pass(record.process_resource_capacity === "sufficient", "process capacity mismatch", failures);
  pass(record.temp_output_capacity === "sufficient", "temp output capacity mismatch", failures);

  pass(record.cleanup_result === "passed", "cleanup result mismatch", failures);
  pass(record.test_files_removed === true, "test files not removed", failures);
  pass(record.socket_or_ipc_removed === true, "socket/IPC not removed", failures);
  pass(record.loopback_server_closed === true, "loopback server not closed", failures);
  pass(record.target_absent_after_cleanup === true, "target remains", failures);
  pass(record.project_files_changed_by_precheck === false, "project files changed by precheck", failures);

  pass(record.public_environment_readiness === "public_build_environment_blocked", "public readiness mismatch", failures);
  pass(record.alternate_runner_readiness === "alternate_runner_capability_blocked", "runner readiness mismatch", failures);
  pass(record.overall_environment_readiness === "candidate_rehearsal_environment_blocked", "overall readiness mismatch", failures);
  pass(record.approval_decision === "blocked", "approval mismatch", failures);
  pass(record.unresolved_conditions.includes("NEXT_PUBLIC_SUPABASE_URL:required_public_build_signal_not_ready"), "URL condition missing", failures);
  pass(record.unresolved_conditions.includes("approved_unrestricted_local_terminal_boundary_not_verified_by_current_runner"), "boundary condition missing", failures);
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);

  allFalse(
    record,
    [
      "candidate_change_required",
      "candidate_hash_change_required",
      "package_or_config_change_required",
      "build_performed",
      "webpack_executed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
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
    "Action 526",
    expected.changeHash,
    expected.fullHash,
    expected.routeHash,
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "absent_in_parent_environment",
    "current_sandboxed_codex_runner",
    "approved_unrestricted_local_terminal_boundary",
    "candidate_rehearsal_environment_blocked",
    expected.nextAction,
    "runtime_preview_waiting_for_operator_inputs",
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }

  pass(!/=[A-Za-z0-9+/_.:-]{16,}/.test(doc), "doc may contain assignment-like secret value", failures);
  pass(!/=[A-Za-z0-9+/_.:-]{16,}/.test(serialized), "record may contain assignment-like secret value", failures);
}

const result = {
  verifier:
    "action_527_confidence_calibration_recommendation_advisory_projection_preview_public_build_signal_operator_input_and_alternate_runner_precheck_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  public_environment_readiness:
    failures.length === 0 ? "public_build_environment_blocked" : "verification_failed",
  alternate_runner_readiness:
    failures.length === 0 ? "alternate_runner_capability_blocked" : "verification_failed",
  overall_environment_readiness:
    failures.length === 0 ? "candidate_rehearsal_environment_blocked" : "verification_failed",
  approval_decision: failures.length === 0 ? "blocked" : "verification_failed",
  next_action: failures.length === 0 ? expected.nextAction : "verification_failed",
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
