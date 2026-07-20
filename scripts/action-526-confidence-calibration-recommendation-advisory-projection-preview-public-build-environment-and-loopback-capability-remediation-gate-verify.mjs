#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-approval-record.json",
  doc:
    "docs/action-526-confidence-calibration-recommendation-advisory-projection-preview-public-build-environment-and-loopback-capability-remediation-gate.md",
  action525:
    "docs/action-525-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-runner-environment-precheck-record.json",
  action524:
    "docs/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-approval-record.json",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
  packageJson: "package.json",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  requiredKeys: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  blocker: "public_build_environment_absent_and_current_runner_loopback_capability_restricted",
  source: "approved_operator_supplied_ephemeral_environment",
  runner: "current_runner_unsuitable_for_authoritative_turbopack_build",
  boundary: "approved_unrestricted_local_terminal_boundary",
  propagation: "ephemeral_allowlisted_build_environment_propagation",
  readiness: "execution_boundary_remediation_ready_with_operator_input",
  approval: "approved_with_conditions",
  nextAction: "action_527_public_build_signal_operator_input_and_alternate_runner_precheck_gate",
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
  const action525 = readJson(paths.action525);
  const action524 = readJson(paths.action524);
  const doc = read(paths.doc);
  const routeSource = read(paths.route);
  const packageJson = readJson(paths.packageJson);
  const serialized = JSON.stringify(record);

  pass(
    record.schema_version ===
      "action_526_public_build_environment_and_loopback_capability_remediation_approval_record_v1",
    "schema mismatch",
    failures,
  );
  pass(record.source_action === 525, "source action mismatch", failures);

  pass(action524.approval_decision === "approved_with_conditions", "Action 524 approval mismatch", failures);
  pass(action525.overall_precheck_readiness === "candidate_build_runner_precheck_blocked", "Action 525 readiness mismatch", failures);
  pass(action525.approval_decision === "blocked", "Action 525 approval mismatch", failures);
  pass(action525.public_environment_readiness === "public_build_environment_blocked", "Action 525 public readiness mismatch", failures);
  pass(action525.runner_capability_readiness === "runner_capability_blocked", "Action 525 runner readiness mismatch", failures);
  pass(record.action_525_overall_precheck_readiness === action525.overall_precheck_readiness, "Action 525 readiness binding mismatch", failures);
  pass(record.action_525_approval_decision === action525.approval_decision, "Action 525 approval binding mismatch", failures);

  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full inventory hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate count mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "route hash mismatch", failures);
  pass(sha256(routeSource) === expected.routeHash, "current route hash mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "route export surface mismatch", failures);
  pass(packageJson.scripts?.build === "next build", "package build script changed", failures);

  pass(record.blocker_classification === expected.blocker, "blocker mismatch", failures);
  pass(record.public_build_signals_absent === true, "public signal absent flag mismatch", failures);
  pass(record.current_runner_loopback_restricted === true, "loopback restricted flag mismatch", failures);
  pass(record.current_runner_ephemeral_port_restricted === true, "ephemeral port restricted flag mismatch", failures);
  pass(record.current_runner_local_socket_restricted === true, "local socket restricted flag mismatch", failures);
  pass(record.candidate_defect_proven === false, "candidate defect proven mismatch", failures);

  pass(
    JSON.stringify([...record.required_public_build_signals].sort()) ===
      JSON.stringify([...expected.requiredKeys].sort()),
    "required public key mismatch",
    failures,
  );
  pass(
    (action525.required_public_build_signals ?? []).every(
      (signal) => signal.presence === "absent_in_parent_environment",
    ),
    "Action 525 public signals should be absent",
    failures,
  );
  pass(record.public_build_signal_source === expected.source, "public source mismatch", failures);
  pass(record.operator_input_required === true, "operator input mismatch", failures);
  pass(record.server_only_secrets_required === false, "server secrets required", failures);
  pass(
    record.disallowed_operator_inputs.includes("Supabase service-role key") &&
      record.disallowed_operator_inputs.includes("Netlify token"),
    "disallowed operator inputs incomplete",
    failures,
  );

  pass(record.current_runner_suitability === expected.runner, "runner suitability mismatch", failures);
  pass(record.approved_future_execution_boundary === expected.boundary, "future boundary mismatch", failures);
  for (const requirement of [
    "child_processes",
    "loopback",
    "os_assigned_local_ephemeral_ports",
    "local_socket_or_equivalent_ipc",
    "exact_candidate_reconstruction",
    "process_scoped_public_environment_propagation",
    "cleanup",
  ]) {
    pass(record.future_execution_boundary_requirements.includes(requirement), `missing boundary requirement: ${requirement}`, failures);
  }
  for (const requirement of [
    "reconstruct_clean_base",
    "apply_exact_32_file_candidate",
    "verify_change_candidate_hash",
    "verify_full_candidate_inventory_hash",
    "exclude_unrelated_dirty_files",
    "verify_preview_flag_disabled",
  ]) {
    pass(record.preserved_isolation_requirements.includes(requirement), `missing isolation requirement: ${requirement}`, failures);
  }

  pass(record.environment_propagation_policy === expected.propagation, "propagation mismatch", failures);
  pass(
    JSON.stringify([...record.environment_allowlist].sort()) === JSON.stringify([...expected.requiredKeys].sort()),
    "environment allowlist mismatch",
    failures,
  );
  pass(record.child_environment_disposed === true, "child environment disposal mismatch", failures);
  allFalse(record, ["raw_values_recorded", "values_written_to_files", "full_environment_enumerated", "parent_environment_modified"], failures);

  for (const precheck of [
    "child_process_spawn",
    "loopback_bind",
    "ephemeral_port_bind",
    "local_socket_or_equivalent_ipc",
    "temp_read_write",
    "output_read_write_rename_delete",
    "cleanup",
    "required_public_signal_presence",
  ]) {
    pass(record.required_future_capability_prechecks.includes(precheck), `missing future precheck: ${precheck}`, failures);
  }
  pass(record.no_build_if_future_precheck_fails === true, "future precheck fail lock mismatch", failures);

  allFalse(
    record,
    [
      "candidate_change_required",
      "candidate_hash_change_required",
      "package_or_config_change_required",
      "source_change_required",
      "build_authorized",
      "rehearsal_authorized",
      "deployment_authorized",
      "activation_authorized",
      "webpack_replacement_authorized",
      "turbopack_disabled",
      "next_config_change_authorized",
      "package_script_change_authorized",
      "network_used",
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

  pass(record.remediation_readiness === expected.readiness, "readiness mismatch", failures);
  pass(record.approval_decision === expected.approval, "approval mismatch", failures);
  pass(record.unresolved_conditions.includes("operator_must_expose_next_public_supabase_url_ephemerally"), "URL operator condition missing", failures);
  pass(record.unresolved_conditions.includes("operator_must_expose_next_public_supabase_anon_key_ephemerally"), "anon operator condition missing", failures);
  pass(record.unresolved_conditions.includes("future_execution_boundary_precheck_required"), "future precheck condition missing", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  pass(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Action 525",
    expected.cleanBase,
    expected.changeHash,
    expected.fullHash,
    expected.routeHash,
    expected.blocker,
    expected.source,
    expected.runner,
    expected.boundary,
    expected.propagation,
    expected.readiness,
    expected.approval,
    expected.nextAction,
    "runtime_preview_waiting_for_operator_inputs",
    "Build authorized: `false`",
    "Rehearsal authorized: `false`",
    "Deployment authorized: `false`",
    "Activation authorized: `false`",
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }

  pass(!/=[A-Za-z0-9+/_.:-]{16,}/.test(doc), "doc may contain assignment-like secret value", failures);
  pass(!/=[A-Za-z0-9+/_.:-]{16,}/.test(serialized), "record may contain assignment-like secret value", failures);
}

const result = {
  verifier:
    "action_526_confidence_calibration_recommendation_advisory_projection_preview_public_build_environment_and_loopback_capability_remediation_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  blocker_classification: failures.length === 0 ? expected.blocker : "verification_failed",
  public_build_signal_source: failures.length === 0 ? expected.source : "verification_failed",
  operator_input_required: failures.length === 0,
  current_runner_suitability: failures.length === 0 ? expected.runner : "verification_failed",
  approved_future_execution_boundary: failures.length === 0 ? expected.boundary : "verification_failed",
  remediation_readiness: failures.length === 0 ? expected.readiness : "verification_failed",
  approval_decision: failures.length === 0 ? expected.approval : "verification_failed",
  next_action: failures.length === 0 ? expected.nextAction : "verification_failed",
  build_authorized: false,
  rehearsal_authorized: false,
  deployment_authorized: false,
  activation_authorized: false,
  runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
  failures,
};

console.log(JSON.stringify(result, null, 2));

if (failures.length > 0) {
  process.exit(1);
}
