#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-approval-record.json",
  doc:
    "docs/action-524-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-environment-remediation-gate.md",
  action523:
    "docs/action-523-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-failure-relationship-and-remediation-approval-record.json",
  action522:
    "docs/action-522-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-retry-record.json",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
  packageJson: "package.json",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  requiredPublicSignals: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  optionalPublicSignals: ["NEXT_PUBLIC_PROVIDER_BACKGROUND_SCANS_PER_DAY"],
  serverSecrets: ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE", "SUPABASE_SERVICE_ROLE_SECRET"],
};

const sourceFiles = [
  "lib/supabase.ts",
  "lib/supabase-server.ts",
  "app/trade-app.tsx",
  "app/api/historical-backfill/first-tiny-signal-package-discovery-readback/route.ts",
];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function findKeyReferences(keyName) {
  const refs = [];
  for (const relativePath of sourceFiles) {
    const lines = read(relativePath).split("\n");
    lines.forEach((line, index) => {
      if (line.includes(keyName)) refs.push(`${relativePath}:${index + 1}`);
    });
  }
  return refs;
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
for (const requiredPath of sourceFiles) {
  pass(existsSync(join(repoRoot, requiredPath)), `missing source path: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(paths.record);
  const doc = read(paths.doc);
  const action523 = readJson(paths.action523);
  const action522 = readJson(paths.action522);
  const routeSource = read(paths.route);
  const packageJson = readJson(paths.packageJson);
  const serializedRecord = JSON.stringify(record);

  pass(record.schema_version === "action_524_turbopack_runner_environment_remediation_approval_record_v1", "schema mismatch", failures);
  pass(record.source_action === 523, "source action mismatch", failures);
  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  pass(record.full_candidate_inventory_hash === expected.fullHash, "full inventory hash mismatch", failures);
  pass(record.candidate_file_count === 32, "candidate file count mismatch", failures);
  pass(record.remediated_route_hash === expected.routeHash, "record route hash mismatch", failures);
  pass(sha256(routeSource) === expected.routeHash, "current route hash mismatch", failures);
  pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "route export surface mismatch", failures);

  pass(action523.approval_decision === "approved", "Action 523 approval mismatch", failures);
  pass(action523.remediation_readiness === "build_failure_remediation_ready", "Action 523 readiness mismatch", failures);
  pass(action523.turbopack_classification === "turbopack_process_resource_error", "Action 523 Turbopack classification mismatch", failures);
  pass(action523.webpack_classification === "webpack_runner_environment_error", "Action 523 Webpack classification mismatch", failures);
  pass(action523.runtime_build_closure_reassessment === "candidate_runtime_build_closure_still_complete", "Action 523 closure mismatch", failures);
  pass(action523.candidate_defect_status === "candidate_defect_not_proven", "Action 523 defect mismatch", failures);
  pass(action523.candidate_hash_impact === "candidate_hash_change_not_required", "Action 523 hash impact mismatch", failures);

  pass(record.action_522_candidate_rehearsal_result === action522.candidate_rehearsal_result, "Action 522 result binding mismatch", failures);
  pass(record.action_522_candidate_rehearsal_result === "full_candidate_rehearsal_failed", "Action 522 candidate result mismatch", failures);
  pass(record.action_522_overall_readiness === "blocked", "Action 522 readiness mismatch", failures);
  pass(record.action_523_decision === "approved", "Action 523 decision binding mismatch", failures);
  pass(record.candidate_source_defect_proven === false, "candidate defect should not be proven", failures);
  pass(record.candidate_source_defect_status === "candidate_defect_not_proven", "candidate defect status mismatch", failures);
  pass(record.runtime_build_closure_reassessment === "candidate_runtime_build_closure_still_complete", "record closure mismatch", failures);
  pass(record.active_worktree_build_establishes_candidate_readiness === false, "active worktree readiness override mismatch", failures);
  pass(record.deployment_readiness === false, "deployment readiness mismatch", failures);

  pass(record.turbopack_blocker === "turbopack_process_resource_error", "Turbopack blocker mismatch", failures);
  pass(record.webpack_blocker === "webpack_runner_environment_error", "Webpack blocker mismatch", failures);
  pass(record.combined_runner_blocker === "candidate_build_runner_environment_contract_incomplete", "combined blocker mismatch", failures);
  pass(record.turbopack_resource_cause === "turbopack_process_resource_combination", "Turbopack cause mismatch", failures);
  pass(record.turbopack_resource_evidence_basis.includes("action_523_authoritative_first_causal_error_mentions_creating_new_process"), "Turbopack process evidence missing", failures);
  pass(record.turbopack_resource_evidence_basis.includes("action_523_authoritative_first_causal_error_mentions_binding_to_a_port"), "Turbopack port evidence missing", failures);

  const requiredSignals = record.required_public_build_signals ?? [];
  const requiredKeys = requiredSignals.map((entry) => entry.key_name).sort();
  pass(JSON.stringify(requiredKeys) === JSON.stringify([...expected.requiredPublicSignals].sort()), "required public signal keys mismatch", failures);
  for (const keyName of expected.requiredPublicSignals) {
    const entry = requiredSignals.find((item) => item.key_name === keyName);
    const refs = findKeyReferences(keyName);
    pass(entry?.classification === "required_public_build_signal", `${keyName} classification mismatch`, failures);
    pass(entry?.presence_classification === "requires_action_525_parent_environment_presence_check", `${keyName} presence policy mismatch`, failures);
    pass(entry?.needed_during_candidate_build === true, `${keyName} build requirement mismatch`, failures);
    pass(refs.length > 0, `${keyName} source references missing`, failures);
    pass(entry?.source_reference_locations.every((ref) => refs.includes(ref)), `${keyName} retained source refs not found`, failures);
  }

  const optionalKeys = (record.optional_public_build_signals ?? []).map((entry) => entry.key_name);
  pass(expected.optionalPublicSignals.every((key) => optionalKeys.includes(key)), "optional signal classification missing", failures);
  for (const entry of record.optional_public_build_signals ?? []) {
    pass(entry.classification === "optional_public_build_signal", `optional classification mismatch: ${entry.key_name}`, failures);
    pass(entry.needed_during_candidate_build === false, `optional build requirement mismatch: ${entry.key_name}`, failures);
  }

  const allowlist = record.public_build_environment_allowlist ?? [];
  pass(JSON.stringify([...allowlist].sort()) === JSON.stringify([...expected.requiredPublicSignals].sort()), "public allowlist mismatch", failures);
  for (const secret of expected.serverSecrets) {
    const secretEntry = record.server_only_secret_classifications.find((entry) => entry.key_name === secret);
    pass(secretEntry?.classification === "server_only_secret_not_required_for_build", `${secret} classification mismatch`, failures);
    pass(secretEntry?.propagation_allowed === false, `${secret} propagation allowed`, failures);
    pass(!allowlist.includes(secret), `${secret} leaked into public allowlist`, failures);
  }
  pass(record.server_only_secrets_required_for_build === false, "server secrets required for build", failures);
  pass(record.public_build_environment_policy === "public_build_environment_allowlist", "public environment policy mismatch", failures);
  pass(record.environment_propagation_policy === "ephemeral_allowlisted_build_environment_propagation", "environment propagation policy mismatch", failures);
  pass(record.raw_environment_values_recorded === false, "raw env values recorded", failures);
  pass(record.full_environment_enumerated === false, "full env enumerated", failures);
  pass(record.environment_persisted === false, "environment persisted", failures);
  pass(record.environment_restored === true, "environment restore policy mismatch", failures);
  pass(record.presence_check_policy.abort_if_required_signal_absent === true, "missing signal abort policy mismatch", failures);
  pass(record.presence_check_policy.placeholder_values_allowed === false, "placeholder values allowed", failures);
  pass(record.presence_check_policy.webpack_or_turbopack_allowed_before_required_presence_check === false, "build before presence check allowed", failures);

  pass(record.sanitization_policy.unsanitized_intermediate_log_allowed === false, "unsanitized intermediate logs allowed", failures);
  pass(record.sanitization_policy.redact_complete_environment_dumps === true, "environment dump redaction missing", failures);

  const prechecks = record.required_runner_capability_prechecks ?? [];
  for (const requiredPrecheck of [
    "child_process_spawn_precheck",
    "local_loopback_availability_precheck",
    "ephemeral_local_port_binding_precheck",
    "local_socket_creation_precheck",
    "temp_directory_read_write_precheck",
    "build_output_directory_writability_precheck",
    "file_descriptor_resource_availability_precheck",
  ]) {
    pass(prechecks.includes(requiredPrecheck), `missing precheck: ${requiredPrecheck}`, failures);
  }
  pass(record.runner_capability_expected_status === "runner_capability_ready_with_conditions", "runner capability status mismatch", failures);
  pass(record.runner_policy === "authoritative_npm_run_build_with_process_scoped_runner_condition_prechecks_only", "runner policy mismatch", failures);
  pass(record.authoritative_build_command === "npm run build", "authoritative build command mismatch", failures);
  pass(record.authoritative_build_script_must_remain === "next build", "build script binding mismatch", failures);
  pass(packageJson.scripts?.build === "next build", "package build script changed", failures);
  pass(record.webpack_comparison_policy === "diagnostic_only_after_authoritative_failure_same_approved_public_build_environment", "Webpack policy mismatch", failures);
  pass(record.webpack_can_establish_readiness === false, "Webpack readiness authority mismatch", failures);

  pass(record.candidate_change_required === false, "candidate change required", failures);
  pass(record.candidate_hash_change_required === false, "candidate hash change required", failures);
  pass(record.package_or_config_change_required === false, "package/config change required", failures);
  pass(record.package_script_change_required === false, "package script change required", failures);
  pass(record.next_config_change_required === false, "Next config change required", failures);
  pass(record.remediation_readiness === "runner_environment_remediation_ready_with_conditions", "remediation readiness mismatch", failures);
  pass(record.approval_decision === "approved_with_conditions", "approval decision mismatch", failures);
  pass(record.unresolved_conditions.length === 3, "unresolved condition count mismatch", failures);
  pass(record.next_action === "action_525_candidate_build_runner_environment_precheck_completion_gate", "next action mismatch", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);

  allFalse(
    record,
    [
      "build_authorized",
      "rehearsal_authorized",
      "deployment_authorized",
      "activation_authorized",
      "webpack_execution_authorized",
      "candidate_reconstruction_authorized",
      "network_authorized",
      "install_authorized",
      "provider_call_authorized",
      "supabase_access_authorized",
      "persistence_authorized",
      "replay_authorized",
      "confidence_application_authorized",
      "feedback_authorized",
      "downstream_behavior_change_authorized",
    ],
    failures,
  );

  for (const phrase of [
    "Action 524",
    expected.changeHash,
    expected.fullHash,
    expected.routeHash,
    "turbopack_process_resource_error",
    "webpack_runner_environment_error",
    "candidate_build_runner_environment_contract_incomplete",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "public_build_environment_allowlist",
    "ephemeral_allowlisted_build_environment_propagation",
    "turbopack_process_resource_combination",
    "runner_environment_remediation_ready_with_conditions",
    "approved_with_conditions",
    "action_525_candidate_build_runner_environment_precheck_completion_gate",
    "runtime_preview_waiting_for_operator_inputs",
  ]) {
    pass(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }

  pass(!/=[A-Za-z0-9+/_.:-]{16,}/.test(doc), "doc may contain assignment-like secret value", failures);
  pass(!/=[A-Za-z0-9+/_.:-]{16,}/.test(serializedRecord), "record may contain assignment-like secret value", failures);
}

const result = {
  verifier:
    "action_524_confidence_calibration_recommendation_advisory_projection_preview_turbopack_runner_environment_remediation_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  remediation_readiness:
    failures.length === 0
      ? "runner_environment_remediation_ready_with_conditions"
      : "verification_failed",
  approval_decision: failures.length === 0 ? "approved_with_conditions" : "verification_failed",
  next_action:
    failures.length === 0
      ? "action_525_candidate_build_runner_environment_precheck_completion_gate"
      : "verification_failed",
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
