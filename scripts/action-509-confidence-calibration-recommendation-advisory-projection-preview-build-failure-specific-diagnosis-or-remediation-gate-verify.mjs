#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const recordPath =
  "docs/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-remediation-approval-record.json";
const docPath =
  "docs/action-509-confidence-calibration-recommendation-advisory-projection-preview-build-failure-specific-diagnosis-or-remediation-gate.md";
const action508Path =
  "docs/action-508-confidence-calibration-recommendation-advisory-projection-preview-turbopack-runner-comparison-and-runtime-complete-candidate-rehearsal-record.json";

const expected = {
  changeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  fullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  count: 31,
  nextAction: "action_510_webpack_build_failure_bounded_diagnostic_capture_gate",
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
for (const relativePath of [recordPath, docPath, action508Path]) {
  failUnless(existsSync(join(repoRoot, relativePath)), `missing file: ${relativePath}`, failures);
}

let record = null;
if (failures.length === 0) {
  record = readJson(recordPath);
  const doc = read(docPath);
  const action508 = readJson(action508Path);

  failUnless(action508.candidate_rehearsal_result === "full_candidate_rehearsal_failed", "Action 508 result mismatch", failures);
  failUnless(action508.external_evidence_result === "rehearsal_evidence_verified", "Action 508 evidence mismatch", failures);
  failUnless(action508.overall_readiness === "blocked", "Action 508 readiness mismatch", failures);

  failUnless(record.schema_version === "action_509_build_failure_specific_diagnosis_remediation_approval_record_v1", "schema mismatch", failures);
  failUnless(record.source_action === 508, "source action mismatch", failures);
  failUnless(record.top_level_classification === "dual_build_failure_requires_specific_classification", "top-level classification mismatch", failures);
  failUnless(record.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  failUnless(record.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  failUnless(record.candidate_file_count === expected.count, "candidate count mismatch", failures);

  failUnless(record.authoritative_build_phase === "build_bundling", "authoritative phase mismatch", failures);
  failUnless(record.authoritative_error_class === "process_resource_error", "authoritative class mismatch", failures);
  failUnless(record.authoritative_os_classification === "operation_not_permitted", "authoritative OS mismatch", failures);
  failUnless(record.comparison_build_phase === "build_bundling", "comparison phase mismatch", failures);
  failUnless(record.comparison_error_class === "type_or_compile_error", "comparison class mismatch", failures);
  failUnless(record.same_error_class === false, "same error class should be false", failures);
  failUnless(record.both_build_engines_failed === true, "both engines failed mismatch", failures);

  failUnless(record.webpack_failure_classification === "webpack_failure_evidence_insufficient", "webpack classification mismatch", failures);
  failUnless(record.first_causal_webpack_error.available === false, "first causal error should be unavailable", failures);
  failUnless(record.first_causal_webpack_error.evidence_status === "not_retained_by_action_508", "first causal evidence status mismatch", failures);
  failUnless(record.webpack_implicated_paths.length === 0, "webpack paths should be empty", failures);
  failUnless(record.implicated_paths_resolved === false, "implicated paths should be unresolved", failures);
  failUnless(record.webpack_implicated_paths_resolved === false, "webpack paths should be unresolved", failures);
  failUnless(record.implicated_paths[0]?.path === "app/globals.css", "authoritative implicated path mismatch", failures);
  failUnless(record.implicated_paths[0]?.classification === "clean_base_file", "path classification mismatch", failures);

  failUnless(record.dual_failure_relationship === "dual_failure_relationship_ambiguous", "dual relationship mismatch", failures);
  failUnless(record.relationship_support.shared_causality_proven === false, "shared causality should not be proven", failures);
  failUnless(record.candidate_defect_status === "candidate_defect_status_unresolved", "candidate defect status mismatch", failures);
  failUnless(record.candidate_hash_impact === "candidate_hash_impact_unresolved", "hash impact mismatch", failures);
  failUnless(record.remediation_class === "bounded_webpack_failure_diagnostic_completion_required", "remediation class mismatch", failures);
  failUnless(record.approval_decision === "blocked", "approval should be blocked", failures);
  failUnless(record.next_action === expected.nextAction, "next action mismatch", failures);

  for (const key of [
    "candidate_modified",
    "build_performed",
    "comparison_performed",
    "rehearsal_performed",
    "deployment_performed",
    "preview_activated",
    "environment_modified",
    "network_used",
    "install_performed",
    "provider_called",
    "supabase_accessed",
    "persistence_created",
    "replay_created",
    "feedback_created",
    "confidence_applied",
    "downstream_behavior_changed",
    "raw_build_logs_recorded",
    "absolute_paths_recorded",
    "source_contents_recorded",
    "environment_values_recorded",
    "credential_values_recorded",
    "recommendation_or_projection_data_recorded",
  ]) {
    failUnless(record[key] === false, `${key} should be false`, failures);
  }
  failUnless(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);

  for (const phrase of [
    "Webpack failure classification: `webpack_failure_evidence_insufficient`",
    "Dual-failure relationship: `dual_failure_relationship_ambiguous`",
    "Candidate defect status: `candidate_defect_status_unresolved`",
    "Candidate hash impact: `candidate_hash_impact_unresolved`",
    "Remediation class: `bounded_webpack_failure_diagnostic_completion_required`",
    expected.nextAction,
  ]) {
    failUnless(doc.includes(phrase), `doc missing phrase: ${phrase}`, failures);
  }
}

const report = {
  verifier:
    "action_509_confidence_calibration_recommendation_advisory_projection_preview_build_failure_specific_diagnosis_or_remediation_gate",
  verification_status: failures.length === 0 ? "passed" : "failed",
  webpack_failure_classification: record?.webpack_failure_classification ?? null,
  implicated_paths_resolved: record?.implicated_paths_resolved ?? null,
  dual_failure_relationship: record?.dual_failure_relationship ?? null,
  candidate_defect_status: record?.candidate_defect_status ?? null,
  candidate_hash_impact: record?.candidate_hash_impact ?? null,
  remediation_class: record?.remediation_class ?? null,
  approval_decision: record?.approval_decision ?? null,
  next_action: record?.next_action ?? null,
  build_free: true,
  comparison_free: true,
  rehearsal_free: true,
  deployment_free: true,
  activation_free: true,
  credential_value_free: true,
  failed_conditions: failures,
};

console.log(JSON.stringify(report, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
