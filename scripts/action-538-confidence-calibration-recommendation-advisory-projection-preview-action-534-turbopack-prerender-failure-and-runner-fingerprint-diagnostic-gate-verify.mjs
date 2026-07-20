#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-538-confidence-calibration-recommendation-advisory-projection-preview-action-534-turbopack-prerender-failure-and-runner-fingerprint-diagnostic-record.json",
  doc:
    "docs/action-538-confidence-calibration-recommendation-advisory-projection-preview-action-534-turbopack-prerender-failure-and-runner-fingerprint-diagnostic-gate.md",
  action534Result:
    "docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json",
  action534Script:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs",
  action534ResultVerifier:
    "scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result-verify.mjs",
  action537Verifier:
    "scripts/action-537-confidence-calibration-recommendation-advisory-projection-preview-action-534-runner-remediation-application-audit-verify.mjs",
  action518Record:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  routePath: "app/api/recommendations/evaluate-outcomes/route.ts",
  runnerContractVersion: "action_537_action_534_runner_contract_v1",
  runnerHash: "85233263aa79afd1a3b1cf29f8d30e9ba0f54a13a4dddfb07e074cdb68bc6554",
  evidenceUsability: "build_failure_evidence_fully_bound",
  priorOmissionCause: "action_534_active_runtime_contract_predates_action_537_fingerprint",
  attemptAccounting: "attempt_accounting_correct",
  turbopackClassification: "turbopack_prerender_no_cache_contract_error",
  publicBuildEnvironment: "public_build_environment_sufficient",
  webpackRelationship: "webpack_pass_indicates_turbopack_specific_framework_behavior",
  candidateDefect: "candidate_defect_not_proven",
  candidateHashImpact: "candidate_hash_change_not_required",
  nextAction: "action_539_turbopack_specific_prerender_diagnostic_completion_gate",
  nextDocs: ["docs/messages/no-cache", "docs/messages/prerender-error"],
};

const prerenderPatterns = {
  cookies_calls: /\bcookies\s*\(/,
  headers_calls: /\bheaders\s*\(/,
  search_params_usage: /\bsearchParams\b/,
  unstable_no_store_usage: /\bunstable_noStore\b/,
  no_store_usage: /\bnoStore\s*\(/,
  cache_no_store_usage: /cache\s*:\s*["']no-store["']/,
  dynamic_rendering_markers: /export\s+const\s+dynamic\s*=|\bdynamic\s*=/,
  page_data_generation_markers: /generateStaticParams|generateMetadata|revalidate|prerender/,
  supabase_client_creation_patterns: /createClient|getServerSupabaseClient|@supabase|@\/lib\/supabase/,
};

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256File(relativePath) {
  return createHash("sha256").update(read(relativePath)).digest("hex");
}

function runStaticVerifier(relativePath, failures) {
  try {
    execFileSync("node", [relativePath], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    failures.push(`static verifier failed: ${relativePath}`);
  }
}

function commandStatus(results, commandPath) {
  return (Array.isArray(results) ? results : []).find(
    (entry) => typeof entry?.command === "string" && entry.command.includes(commandPath),
  )?.status;
}

function candidateStaticAudit(action518Record) {
  const candidateFiles = (action518Record.new_changed_file_inventory ?? [])
    .map((entry) => entry.path)
    .filter((path) => /^(app|components|lib)\//.test(path));
  const counts = Object.fromEntries(Object.keys(prerenderPatterns).map((key) => [key, 0]));
  const supabasePaths = [];
  const implicatedPaths = new Set();

  for (const candidatePath of candidateFiles) {
    const absolute = join(repoRoot, candidatePath);
    if (!existsSync(absolute)) continue;
    const source = read(candidatePath);
    for (const [key, pattern] of Object.entries(prerenderPatterns)) {
      if (pattern.test(source)) {
        counts[key] += 1;
        implicatedPaths.add(candidatePath);
        if (key === "supabase_client_creation_patterns") supabasePaths.push(candidatePath);
      }
    }
  }

  return {
    audited_candidate_app_component_lib_files: candidateFiles.length,
    ...counts,
    supabase_client_creation_paths: supabasePaths,
    repository_paths_implicated_by_static_audit: [...implicatedPaths],
  };
}

function verifyAction538() {
  const failures = [];
  for (const requiredPath of Object.values(paths)) {
    pass(existsSync(join(repoRoot, requiredPath)), `missing required path: ${requiredPath}`, failures);
  }

  runStaticVerifier(paths.action534ResultVerifier, failures);
  runStaticVerifier(paths.action537Verifier, failures);

  if (failures.length === 0) {
    const record = readJson(paths.record);
    const doc = read(paths.doc);
    const result = readJson(paths.action534Result);
    const action518 = readJson(paths.action518Record);
    const resultVerifier = read(paths.action534ResultVerifier);
    const script = read(paths.action534Script);
    const staticAudit = candidateStaticAudit(action518);

    pass(record.schema_version === "action_538_action_534_turbopack_prerender_failure_and_runner_fingerprint_diagnostic_record_v1", "record schema mismatch", failures);
    pass(record.source_action === 537, "source action mismatch", failures);
    pass(record.candidate_binding.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
    pass(record.candidate_binding.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
    pass(record.candidate_binding.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
    pass(record.candidate_binding.candidate_file_count === 32, "candidate file count mismatch", failures);
    pass(record.candidate_binding.remediated_route === expected.routePath, "route path mismatch", failures);
    pass(record.candidate_binding.route_sha256 === expected.routeHash, "route hash mismatch", failures);
    pass(JSON.stringify(record.candidate_binding.route_export_surface) === JSON.stringify(["POST"]), "route export surface mismatch", failures);

    pass(action518.clean_base_identifier === expected.cleanBase, "Action 518 clean base mismatch", failures);
    pass(action518.new_change_candidate_hash === expected.changeHash, "Action 518 change hash mismatch", failures);
    pass(action518.new_full_candidate_inventory_hash === expected.fullHash, "Action 518 full hash mismatch", failures);
    pass(action518.new_candidate_file_count === 32, "Action 518 candidate count mismatch", failures);
    pass(action518.added_route_hash === expected.routeHash, "Action 518 route hash mismatch", failures);

    pass(result.schema_version === "action_534_external_terminal_candidate_rehearsal_result_v1", "Action 534 schema mismatch", failures);
    pass(result.execution_boundary === "operator_unrestricted_local_terminal", "execution boundary mismatch", failures);
    pass(result.runner_contract_version === expected.runnerContractVersion, "runner contract result mismatch", failures);
    pass(result.runner_script_sha256 === expected.runnerHash, "runner hash result mismatch", failures);
    pass(sha256File(paths.action534Script) === expected.runnerHash, "runner script hash mismatch", failures);
    pass(result.candidate_reconstruction_result === "exact_candidate_reconstructed", "reconstruction mismatch", failures);
    pass(result.runtime_dependency_closure_result === "complete", "runtime closure mismatch", failures);
    pass(result.source_integrity_result === "baseline_plus_overlay_manifest_integrity", "source integrity mismatch", failures);
    pass(result.source_safety_result === "source_safety_passed", "source safety mismatch", failures);
    pass(result.preview_flag_verification_result === "preview_flag_disabled_verified", "preview flag mismatch", failures);
    pass(result.dependency_materialization_result === "temporary_verified_node_modules_copy", "dependency materialization mismatch", failures);
    pass(commandStatus(result.candidate_internal_command_results, "npx next typegen") === "passed", "typegen mismatch", failures);
    pass(commandStatus(result.candidate_internal_command_results, "npx tsc --noEmit") === "passed", "TypeScript mismatch", failures);
    pass(result.authoritative_build_attempt_count === 1, "authoritative attempt count mismatch", failures);
    pass(result.authoritative_build_result === "failed", "authoritative result mismatch", failures);
    pass(result.authoritative_build_phase === "authoritative_build", "authoritative phase mismatch", failures);
    pass(result.authoritative_error_class === "command_failed", "authoritative error mismatch", failures);
    pass(JSON.stringify(result.authoritative_implicated_paths) === JSON.stringify(expected.nextDocs), "authoritative implicated identifiers mismatch", failures);
    for (const identifier of expected.nextDocs) {
      pass(!existsSync(join(repoRoot, identifier)), `${identifier} must not be treated as a repository file`, failures);
    }
    pass(result.webpack_diagnostic_attempt_count === 1, "webpack attempt count mismatch", failures);
    pass(result.webpack_diagnostic_result === "passed", "webpack result mismatch", failures);
    pass(result.external_evidence_result === "passed", "external evidence mismatch", failures);
    pass(result.cleanup_result === "passed", "cleanup mismatch", failures);
    pass(result.candidate_modified === false, "candidate modified mismatch", failures);
    pass(result.deployment_performed === false, "deployment mismatch", failures);
    pass(result.preview_activated === false, "activation mismatch", failures);
    pass(result.candidate_rehearsal_result === "external_terminal_candidate_rehearsal_failed", "rehearsal result mismatch", failures);
    pass(result.overall_readiness === "blocked", "readiness mismatch", failures);

    pass(record.latest_action_534_result_binding.runner_contract_version === expected.runnerContractVersion, "record runner contract mismatch", failures);
    pass(record.latest_action_534_result_binding.runner_script_sha256 === expected.runnerHash, "record runner hash mismatch", failures);
    pass(record.evidence_usability === expected.evidenceUsability, "evidence usability mismatch", failures);
    pass(record.runner_fingerprint_status === "present_and_bound_in_latest_result", "runner fingerprint status mismatch", failures);
    pass(record.runner_fingerprint_omission_cause_for_prior_observed_result === expected.priorOmissionCause, "prior omission cause mismatch", failures);
    pass(record.runner_fingerprint_audit.current_runner_contract_version_present === true, "runner contract audit mismatch", failures);
    pass(record.runner_fingerprint_audit.current_runner_script_sha256_present === true, "runner hash audit mismatch", failures);
    pass(resultVerifier.includes("runner_script_sha256 === runnerHash"), "result verifier runner hash binding missing", failures);
    pass(script.includes("runner_contract_version: runnerContractVersion"), "runner serializer contract missing", failures);
    pass(script.includes("runner_script_sha256: runnerHash"), "runner serializer hash missing", failures);

    pass(record.attempt_accounting === expected.attemptAccounting, "attempt accounting mismatch", failures);
    pass(record.historical_operator_invocation_count === 4, "historical invocation count mismatch", failures);
    pass(record.valid_action_534_attempt_count === 3, "valid attempt count mismatch", failures);
    pass(record.current_operator_attempt_number === 4, "current attempt mismatch", failures);
    pass(record.historical_operator_attempt_count_in_result === 3, "result historical attempt mismatch", failures);
    pass(record.next_correct_attempt_number === 5, "next attempt mismatch", failures);
    pass(result.operator_rehearsal_attempt_number === 4, "result attempt mismatch", failures);
    pass(result.historical_operator_attempt_count === 3, "result historical attempt count mismatch", failures);

    pass(record.turbopack_failure_classification === expected.turbopackClassification, "turbopack classification mismatch", failures);
    pass(record.next_documentation_identifiers_treated_as_repository_files === false, "docs identifier classification mismatch", failures);
    pass(JSON.stringify(record.next_documentation_identifiers) === JSON.stringify(expected.nextDocs), "docs identifiers mismatch", failures);

    pass(record.static_route_prerender_audit.audited_candidate_app_component_lib_files === staticAudit.audited_candidate_app_component_lib_files, "audited file count mismatch", failures);
    for (const key of [
      "cookies_calls",
      "headers_calls",
      "search_params_usage",
      "unstable_no_store_usage",
      "no_store_usage",
      "cache_no_store_usage",
      "dynamic_rendering_markers",
      "page_data_generation_markers",
      "supabase_client_creation_patterns",
    ]) {
      pass(record.static_route_prerender_audit[key] === staticAudit[key], `static audit ${key} mismatch`, failures);
    }
    pass(
      JSON.stringify(record.static_route_prerender_audit.supabase_client_creation_paths) ===
        JSON.stringify(staticAudit.supabase_client_creation_paths),
      "supabase path audit mismatch",
      failures,
    );
    pass(
      JSON.stringify(record.static_route_prerender_audit.repository_paths_implicated_by_static_audit) ===
        JSON.stringify(staticAudit.repository_paths_implicated_by_static_audit),
      "repository path audit mismatch",
      failures,
    );

    pass(record.public_build_environment_audit.public_build_environment === expected.publicBuildEnvironment, "public build environment mismatch", failures);
    pass(record.public_build_environment_audit.server_only_secret_required === false, "server-only secret mismatch", failures);
    pass(record.webpack_relationship === expected.webpackRelationship, "webpack relationship mismatch", failures);
    pass(record.candidate_defect === expected.candidateDefect, "candidate defect mismatch", failures);
    pass(record.candidate_hash_impact === expected.candidateHashImpact, "candidate hash impact mismatch", failures);
    pass(record.candidate_change_required === false, "candidate change mismatch", failures);
    pass(record.candidate_hash_change_required === false, "candidate hash change mismatch", failures);
    pass(record.operator_retry_authorized === false, "operator retry must not be authorized", failures);
    pass(record.selected_next_action === expected.nextAction, "selected next action mismatch", failures);
    pass(record.next_action === expected.nextAction, "next action mismatch", failures);
    pass(record.diagnostic_result === "action_534_turbopack_prerender_failure_and_runner_fingerprint_diagnostic_completed", "diagnostic result mismatch", failures);
    pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview mismatch", failures);

    for (const key of [
      "build_performed",
      "webpack_executed",
      "candidate_reconstructed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "network_used",
      "install_performed",
      "provider_called",
      "supabase_accessed",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ]) {
      pass(record[key] === false, `${key} must be false`, failures);
    }

    for (const snippet of [
      expected.evidenceUsability,
      expected.priorOmissionCause,
      expected.attemptAccounting,
      expected.turbopackClassification,
      expected.webpackRelationship,
      expected.candidateDefect,
      expected.candidateHashImpact,
      expected.nextAction,
      "does not execute Action 534",
      "does not authorize another Action 534 execution",
    ]) {
      pass(doc.includes(snippet), `doc missing ${snippet}`, failures);
    }
  }

  return {
    action: 538,
    verification_status: failures.length === 0 ? "passed" : "failed",
    authoritative_build_result: "failed",
    webpack_diagnostic_result: "passed",
    evidence_usability: expected.evidenceUsability,
    runner_fingerprint_omission_cause_for_prior_observed_result: expected.priorOmissionCause,
    runner_fingerprint_status: "present_and_bound_in_latest_result",
    attempt_accounting: expected.attemptAccounting,
    turbopack_failure_classification: expected.turbopackClassification,
    candidate_defect: expected.candidateDefect,
    candidate_hash_impact: expected.candidateHashImpact,
    selected_next_action: expected.nextAction,
    action_534_executed_by_action_538: false,
    build_performed: false,
    webpack_executed: false,
    rehearsal_performed: false,
    deployment_performed: false,
    preview_activated: false,
    failures,
  };
}

const output = verifyAction538();
console.log(JSON.stringify(output, null, 2));
if (output.verification_status !== "passed") process.exit(1);
