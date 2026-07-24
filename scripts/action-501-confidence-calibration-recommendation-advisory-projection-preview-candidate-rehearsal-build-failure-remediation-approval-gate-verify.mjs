#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-record.json";
const docPath =
  "docs/action-501-confidence-calibration-recommendation-advisory-projection-preview-candidate-rehearsal-build-failure-remediation-approval-gate.md";
const action500Path =
  "docs/action-500-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-build-rehearsal-retry-record.json";
const action499Path =
  "docs/action-499-confidence-calibration-recommendation-advisory-projection-preview-source-safety-wrong-hash-rejection-remediation-approval-record.json";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  nextAction: "action_502_candidate_build_failure_diagnostic_evidence_completion_gate",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function failUnless(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];
for (const relativePath of [recordPath, docPath, action500Path, action499Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action500 = readJson(action500Path);
  const action499 = readJson(action499Path);
  const typegen = action500.candidate_command_results.find((command) => command.name === "npx next typegen");
  const tsc = action500.candidate_command_results.find((command) => command.name === "npx tsc --noEmit");
  const build = action500.candidate_command_results.find((command) => command.name === "npm run build");

  failUnless(action499.approval_decision === "approved", "Action 499 approval mismatch", failures);
  failUnless(action500.candidate_rehearsal_result === "full_candidate_rehearsal_failed", "Action 500 result mismatch", failures);
  failUnless(action500.external_evidence_result === "rehearsal_evidence_verified", "Action 500 evidence mismatch", failures);
  failUnless(action500.overall_readiness === "blocked", "Action 500 readiness mismatch", failures);
  failUnless(action500.rehearsal_attempt_count === 1, "Action 500 attempt count mismatch", failures);
  failUnless(build?.status === "failed", "Action 500 build result mismatch", failures);
  failUnless(typegen?.status === "passed", "Action 500 typegen result mismatch", failures);
  failUnless(tsc?.status === "passed", "Action 500 TypeScript result mismatch", failures);

  failUnless(record.schema_version === "action_501_candidate_rehearsal_build_failure_remediation_approval_gate_v1", "schema mismatch", failures);
  failUnless(record.source_action === 500, "source action mismatch", failures);
  failUnless(record.action_500_candidate_result === "full_candidate_rehearsal_failed", "record Action 500 result mismatch", failures);
  failUnless(record.action_500_external_evidence_result === "rehearsal_evidence_verified", "record Action 500 evidence mismatch", failures);
  failUnless(record.action_500_overall_readiness === "blocked", "record Action 500 readiness mismatch", failures);
  failUnless(record.rehearsal_attempt_count === 1, "record attempt count mismatch", failures);
  failUnless(record.top_level_failure_classification === "candidate_build_command_failed", "top-level classification mismatch", failures);
  failUnless(record.failing_command === "npm run build", "failing command mismatch", failures);
  failUnless(record.failing_command_started === true, "build command did not start", failures);
  failUnless(record.failing_command_passed === false, "build command passed unexpectedly", failures);
  failUnless(record.failing_command_exit_code === 1, "build exit code mismatch", failures);
  failUnless(record.prior_next_typegen_result === "passed", "typegen pass mismatch", failures);
  failUnless(record.prior_typescript_result === "passed", "TypeScript pass mismatch", failures);
  failUnless(record.typescript_pass_does_not_prove_next_build === true, "TypeScript/build distinction missing", failures);
  failUnless(record.cleanup_result === "cleanup_passed", "cleanup mismatch", failures);
  failUnless(record.candidate_hashes_unchanged === true, "candidate hashes changed", failures);
  failUnless(record.external_evidence_verified === true, "external evidence not verified", failures);
  failUnless(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);

  for (const requiredEvidence of [
    "action_500_candidate_command_result_object",
    "action_500_exit_code",
    "action_500_signal_classification",
    "action_500_stdout_stderr_byte_counts",
    "action_500_preceding_command_statuses",
  ]) {
    failUnless(record.permitted_evidence_inspected.includes(requiredEvidence), `missing evidence: ${requiredEvidence}`, failures);
  }
  failUnless(record.evidence_not_available_in_action_500_record.includes("next_build_phase_name"), "missing unavailable build phase evidence marker", failures);
  failUnless(record.evidence_not_available_in_action_500_record.includes("build_error_class"), "missing unavailable error class marker", failures);

  failUnless(record.raw_logs_inspected === false, "raw logs inspected", failures);
  failUnless(record.raw_logs_recorded === false, "raw logs recorded", failures);
  failUnless(record.raw_source_contents_recorded === false, "raw source recorded", failures);
  failUnless(record.raw_environment_values_recorded === false, "raw env values recorded", failures);
  failUnless(record.raw_secret_values_recorded === false, "raw secrets recorded", failures);
  failUnless(record.machine_absolute_paths_recorded === false, "absolute paths recorded", failures);
  failUnless(record.build_rerun_performed === false, "build rerun performed", failures);
  failUnless(record.rehearsal_rerun_performed === false, "rehearsal rerun performed", failures);

  failUnless(record.build_failure_phase === "unknown_from_bounded_action_500_evidence", "build phase mismatch", failures);
  failUnless(record.build_failure_primary_classification === "build_failure_evidence_insufficient", "primary classification mismatch", failures);
  failUnless(record.build_failure_error_class === "unknown_from_bounded_action_500_evidence", "error class mismatch", failures);
  failUnless(record.build_failure_exit_classification === "exit_code_1_no_signal", "exit classification mismatch", failures);
  failUnless(record.implicated_paths.length === 0, "implicated paths should be empty", failures);
  failUnless(record.implicated_path_classifications.length === 0, "implicated path classifications should be empty", failures);
  failUnless(record.candidate_relevance === "unknown_from_bounded_action_500_evidence", "candidate relevance mismatch", failures);
  failUnless(record.dependency_path_relevance === "unknown_from_bounded_action_500_evidence", "dependency relevance mismatch", failures);
  failUnless(record.runner_defect_relevance === "unknown_from_bounded_action_500_evidence", "runner relevance mismatch", failures);
  failUnless(record.unrelated_dirty_path_handling === "no_unrelated_dirty_path_referenced_by_bounded_evidence", "unrelated path handling mismatch", failures);
  failUnless(record.evidence_sufficiency === "insufficient_to_distinguish_candidate_versus_runner_defect", "evidence sufficiency mismatch", failures);
  failUnless(record.candidate_hash_impact === "candidate_hash_impact_unresolved", "hash impact mismatch", failures);
  failUnless(record.remediation_class === "diagnostic_evidence_completion_required", "remediation class mismatch", failures);
  failUnless(record.next_action_mapping.evidence_insufficient === expected.nextAction, "evidence-completion next action mapping mismatch", failures);

  for (const key of [
    "candidate_modified",
    "source_modified",
    "package_manifest_modified",
    "lockfile_modified",
    "environment_modified",
    "rehearsal_performed",
    "build_performed",
    "deployment_performed",
    "preview_activated",
    "netlify_operation_performed",
    "provider_called",
    "supabase_accessed",
    "persistence_created",
    "replay_created",
    "feedback_created",
    "confidence_applied",
    "downstream_behavior_changed",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }

  failUnless(record.approval_decision === "blocked", "approval decision mismatch", failures);
  failUnless(record.unresolved_conditions.length === 2, "unresolved condition count mismatch", failures);
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const phrase of [
    "Primary build-failure classification: `build_failure_evidence_insufficient`",
    "Build phase: `unknown_from_bounded_action_500_evidence`",
    "Candidate hash impact: `candidate_hash_impact_unresolved`",
    "Remediation class: `diagnostic_evidence_completion_required`",
    "Approval decision: `blocked`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_501_confidence_calibration_recommendation_advisory_projection_preview_candidate_rehearsal_build_failure_remediation_approval_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  approval_decision: record?.approval_decision ?? null,
  build_failure_primary_classification: record?.build_failure_primary_classification ?? null,
  evidence_sufficiency: record?.evidence_sufficiency ?? null,
  candidate_hash_impact: record?.candidate_hash_impact ?? null,
  remediation_class: record?.remediation_class ?? null,
  next_action: record?.next_action ?? null,
  build_free: true,
  rehearsal_free: true,
  deployment_free: true,
  activation_free: true,
  network_free: true,
  install_free: true,
  environment_immutable: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
