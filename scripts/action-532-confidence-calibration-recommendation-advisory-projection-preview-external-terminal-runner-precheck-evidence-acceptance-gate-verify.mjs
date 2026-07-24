#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, lstatSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

export const paths = {
  result:
    "docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json",
  record:
    "docs/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-record.json",
  doc:
    "docs/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate.md",
  action529Verifier:
    "scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result-verify.mjs",
  action518Verifier:
    "scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs",
  action518Record:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
};

export const expected = {
  schema: "action_529_external_terminal_runner_precheck_result_v1",
  recordSchema: "action_532_external_terminal_runner_precheck_evidence_acceptance_record_v1",
  executionBoundary: "operator_unrestricted_local_terminal",
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  publicKeys: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  precheckPassed: "external_terminal_runner_precheck_passed",
  priorBlocked: "external_terminal_runner_precheck_blocked",
  terminalRestoration: "raw_mode_restored_on_completion_error_and_interruption",
  ipcRequirement: "local_ipc_not_proven_required_for_authoritative_turbopack_build",
  contentSafetyPassed: "result_content_safety_passed",
  action529VerifierPassed: "action_529_result_verifier_passed",
  evidenceAccepted: "external_terminal_runner_evidence_accepted",
  evidenceRejected: "external_terminal_runner_evidence_rejected",
  evidenceBlocked: "external_terminal_runner_evidence_acceptance_blocked",
  environmentReady: "external_terminal_candidate_rehearsal_environment_ready",
  environmentReadyWithConditions: "external_terminal_candidate_rehearsal_environment_ready_with_conditions",
  environmentBlocked: "external_terminal_candidate_rehearsal_environment_blocked",
  approvalApproved: "approved",
  approvalApprovedWithConditions: "approved_with_conditions",
  approvalBlocked: "blocked",
  runtimePreview: "runtime_preview_waiting_for_operator_inputs",
  nextAction: "action_533_external_terminal_candidate_rehearsal_handoff_gate",
};

const boundedResultBytes = 12000;

function absolute(relativePath) {
  return join(repoRoot, relativePath);
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

function read(relativePath) {
  return readFileSync(absolute(relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function keysEqual(actual, expectedKeys) {
  return JSON.stringify([...actual].sort()) === JSON.stringify([...expectedKeys].sort());
}

export function hasDuplicateJsonKeys(text) {
  const stack = [];
  let inString = false;
  let escaping = false;
  let stringStart = -1;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === "\"") {
        inString = false;
        const raw = text.slice(stringStart, index + 1);
        let cursor = index + 1;
        while (/\s/.test(text[cursor] ?? "")) cursor += 1;
        if (text[cursor] === ":" && stack.at(-1)?.type === "object") {
          try {
            const key = JSON.parse(raw);
            const seen = stack.at(-1).keys;
            if (seen.has(key)) return true;
            seen.add(key);
          } catch {
            return true;
          }
        }
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      stringStart = index;
      continue;
    }
    if (char === "{") {
      stack.push({ type: "object", keys: new Set() });
      continue;
    }
    if (char === "[") {
      stack.push({ type: "array" });
      continue;
    }
    if (char === "}" || char === "]") {
      stack.pop();
    }
  }

  return false;
}

export function resultContentSafety(text) {
  const failures = [];
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      status: "result_content_safety_failed",
      failures: ["malformed_json"],
    };
  }
  const serialized = JSON.stringify(parsed);

  const allowedKeyFragments = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "ephemeral_port_binding",
    "operator_attempt_number",
    "source_action",
  ];

  const redactedText = allowedKeyFragments.reduce(
    (value, fragment) => value.replaceAll(fragment, `ALLOWED_${fragment.length}`),
    serialized,
  );

  pass(!/eyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/.test(redactedText), "jwt_like_token_body", failures);
  pass(!/https?:\/\/[^\s"'{}[\],]+/i.test(redactedText), "raw_url_value", failures);
  pass(!/[a-z0-9-]+\.supabase\.co/i.test(redactedText), "supabase_hostname", failures);
  pass(!/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/i.test(redactedText), "bearer_material", failures);
  pass(!/(SECRET|TOKEN|PASSWORD|KEY|SUPABASE)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{12,}/i.test(redactedText), "credential_assignment", failures);
  pass(!/[?&][A-Za-z0-9_%-]+=[A-Za-z0-9._~%+/=-]{6,}/.test(redactedText), "query_bearing_url_or_query_value", failures);
  pass(!/\bHOME\s*[:=]/.test(redactedText), "home_assignment", failures);
  pass(!/\/Users\/[A-Za-z0-9._-]+/.test(redactedText), "user_home_path", failures);
  pass(!/\/(?:private\/)?(?:var|tmp)\/[A-Za-z0-9._/ -]*(?:sock|socket|action-529)/i.test(redactedText), "machine_temp_or_socket_path", failures);
  pass(!/\b(?:port|socket_path|raw_socket_path)\b["']?\s*:\s*["']?[0-9/][^,}"]*/i.test(redactedText), "port_or_socket_value", failures);

  return {
    status: failures.length === 0 ? "result_content_safety_passed" : "result_content_safety_failed",
    failures,
  };
}

export function evaluateAction532({ resultText, resultFileStatsOk = true, action529VerifierPassed = true, action518VerifierPassed = true, record, docText }) {
  const failures = [];
  let result;

  pass(resultFileStatsOk, "result file must exist as bounded regular non-symlink file", failures);
  pass(!hasDuplicateJsonKeys(resultText), "result JSON contains duplicate keys", failures);

  try {
    result = JSON.parse(resultText);
  } catch {
    failures.push("result JSON is malformed");
    result = {};
  }

  const safety = resultContentSafety(resultText);
  pass(safety.status === expected.contentSafetyPassed, `result content safety failed: ${safety.failures.join(",")}`, failures);

  pass(result.schema_version === expected.schema, "Action 529 schema mismatch", failures);
  pass(result.source_action === 528, "Action 529 source action mismatch", failures);
  pass(result.execution_boundary === expected.executionBoundary, "execution boundary mismatch", failures);
  pass(result.operator_attempt_number === 2, "operator attempt mismatch", failures);
  pass(result.prior_attempt_result === expected.priorBlocked, "prior attempt mismatch", failures);
  pass(result.precheck_result === expected.precheckPassed, "precheck result mismatch", failures);
  pass(result.input_echo_suppressed === true, "input echo must be suppressed", failures);
  pass(result.terminal_restoration === expected.terminalRestoration, "terminal restoration mismatch", failures);

  const signals = Array.isArray(result.required_public_build_signals) ? result.required_public_build_signals : [];
  const signalKeys = signals.map((signal) => signal.key);
  pass(signals.length === 2, "exactly two public build signals required", failures);
  pass(keysEqual(signalKeys, expected.publicKeys), "public build signal keys mismatch", failures);
  for (const signal of signals) {
    pass(signal.presence === "present", `${signal.key} presence mismatch`, failures);
    pass(signal.safe_shape === "valid_shape", `${signal.key} shape mismatch`, failures);
    pass(signal.value_recorded === false, `${signal.key} value recorded`, failures);
    for (const forbidden of ["value", "raw_value", "length", "prefix", "suffix", "host", "token_segment", "hash", "sha256"]) {
      pass(!(forbidden in signal), `${signal.key} contains forbidden ${forbidden}`, failures);
    }
  }
  pass(result.server_only_secrets_required === false || result.server_only_secrets_required === undefined, "server-only secret requirement mismatch", failures);

  for (const [key, value] of Object.entries({
    child_process_spawn: "passed",
    loopback_binding: "passed",
    ephemeral_port_binding: "passed",
    local_ipc_capability: "passed",
    local_ipc_test_result: "passed",
    temp_output_capability: "passed",
    file_descriptor_capacity: "sufficient",
    process_resource_capacity: "sufficient",
    cleanup_result: "passed",
  })) {
    pass(result[key] === value, `${key} mismatch`, failures);
  }

  const ipc = result.local_ipc_diagnostic ?? {};
  for (const [key, value] of Object.entries({
    ipc_mechanism: "unix_domain_socket",
    ipc_failure_phase: "none",
    ipc_error_classification: "none",
    ipc_cleanup_result: "passed",
    ipc_required_by_authoritative_build: false,
    ipc_requirement_classification: expected.ipcRequirement,
    raw_socket_path_recorded: false,
  })) {
    pass(ipc[key] === value, `IPC ${key} mismatch`, failures);
  }

  for (const key of [
    "external_network_used",
    "supabase_accessed",
    "provider_called",
    "raw_environment_values_recorded",
    "environment_values_hashed",
    "environment_persisted",
    "env_file_written",
    "shell_profile_modified",
    "build_performed",
    "candidate_reconstructed",
    "rehearsal_performed",
    "deployment_performed",
    "preview_activated",
  ]) {
    pass(result[key] === false, `${key} must be false`, failures);
  }

  pass(action529VerifierPassed, "Action 529 result verifier failed", failures);
  pass(action518VerifierPassed, "Action 518 candidate verifier failed", failures);

  if (record) {
    pass(record.schema_version === expected.recordSchema, "record schema mismatch", failures);
    pass(record.source_action === 529, "record source action mismatch", failures);
    pass(record.clean_base_identifier === expected.cleanBase, "record clean base mismatch", failures);
    pass(record.change_candidate_hash === expected.changeHash, "record change hash mismatch", failures);
    pass(record.full_candidate_inventory_hash === expected.fullHash, "record full hash mismatch", failures);
    pass(record.candidate_file_count === 32, "record candidate count mismatch", failures);
    pass(record.remediated_route_hash === expected.routeHash, "record route hash mismatch", failures);
    pass(JSON.stringify(record.route_export_surface) === JSON.stringify(["POST"]), "record route export mismatch", failures);
    pass(record.action_529_result_path === paths.result, "record result path mismatch", failures);
    pass(record.action_529_schema === expected.schema, "record Action 529 schema mismatch", failures);
    pass(record.operator_attempt_number === 2, "record operator attempt mismatch", failures);
    pass(record.current_precheck_result === expected.precheckPassed, "record current precheck mismatch", failures);
    pass(record.result_content_safety === expected.contentSafetyPassed, "record content safety mismatch", failures);
    pass(record.action_529_result_verifier === expected.action529VerifierPassed, "record Action 529 verifier mismatch", failures);
    pass(record.candidate_change_required === false, "record candidate change mismatch", failures);
    pass(record.candidate_hash_change_required === false, "record candidate hash change mismatch", failures);
    pass(record.package_config_change_required === false, "record package/config change mismatch", failures);
    pass(record.evidence_acceptance_result === expected.evidenceAccepted, "record evidence result mismatch", failures);
    pass(record.rehearsal_environment_readiness === expected.environmentReady, "record readiness mismatch", failures);
    pass(record.approval_decision === expected.approvalApproved, "record approval mismatch", failures);
    pass(Array.isArray(record.unresolved_conditions) && record.unresolved_conditions.length === 0, "record unresolved conditions mismatch", failures);
    pass(record.future_rehearsal_authorization_count === 1, "record future rehearsal count mismatch", failures);
    pass(record.ad_hoc_terminal_build_authorized === false, "record ad hoc build authorization mismatch", failures);
    pass(record.runtime_preview_state === expected.runtimePreview, "record runtime preview mismatch", failures);
    pass(record.next_action === expected.nextAction, "record next action mismatch", failures);
    for (const key of [
      "external_network_used",
      "supabase_accessed",
      "provider_called",
      "raw_environment_values_recorded",
      "environment_values_hashed",
      "environment_persisted",
      "env_file_written",
      "shell_profile_modified",
      "build_performed",
      "candidate_reconstructed",
      "rehearsal_performed",
      "deployment_performed",
      "preview_activated",
      "persistence_created",
      "replay_created",
      "confidence_applied",
      "feedback_created",
      "downstream_behavior_changed",
    ]) {
      pass(record[key] === false, `record ${key} must be false`, failures);
    }
  }

  if (docText) {
    for (const snippet of [
      expected.priorBlocked,
      expected.precheckPassed,
      "result_content_safety_passed",
      expected.evidenceAccepted,
      expected.environmentReady,
      expected.approvalApproved,
      expected.runtimePreview,
      expected.nextAction,
      "does not execute Action 529",
      "does not run that rehearsal",
    ]) {
      pass(docText.includes(snippet), `doc missing ${snippet}`, failures);
    }
  }

  const evidenceAccepted = failures.length === 0;
  return {
    evidence_acceptance_result: evidenceAccepted ? expected.evidenceAccepted : expected.evidenceRejected,
    rehearsal_environment_readiness: evidenceAccepted ? expected.environmentReady : expected.environmentBlocked,
    approval_decision: evidenceAccepted ? expected.approvalApproved : expected.approvalBlocked,
    result_content_safety: safety.status,
    unresolved_conditions: failures,
  };
}

function verifyFileBinding(failures) {
  if (!existsSync(absolute(paths.result))) {
    failures.push("missing exact Action 529 result path");
    return false;
  }

  const lstat = lstatSync(absolute(paths.result));
  const stat = statSync(absolute(paths.result));
  pass(!lstat.isSymbolicLink(), "Action 529 result path must not be symlink", failures);
  pass(stat.isFile(), "Action 529 result path must be regular file", failures);
  pass(stat.size > 0 && stat.size <= boundedResultBytes, "Action 529 result size out of bounds", failures);
  return failures.length === 0;
}

function runStaticVerifier(relativePath) {
  execFileSync("node", [relativePath], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

export function verifyAction532() {
  const failures = [];
  const resultFileStatsOk = verifyFileBinding(failures);

  let action529VerifierPassed = false;
  try {
    runStaticVerifier(paths.action529Verifier);
    action529VerifierPassed = true;
  } catch {
    failures.push("Action 529 result verifier failed");
  }

  let action518VerifierPassed = false;
  try {
    runStaticVerifier(paths.action518Verifier);
    action518VerifierPassed = true;
  } catch {
    failures.push("Action 518 candidate verifier failed");
  }

  for (const requiredPath of [paths.record, paths.doc]) {
    pass(existsSync(absolute(requiredPath)), `missing required path: ${requiredPath}`, failures);
  }

  let evaluation;
  if (existsSync(absolute(paths.result)) && existsSync(absolute(paths.record)) && existsSync(absolute(paths.doc))) {
    evaluation = evaluateAction532({
      resultText: read(paths.result),
      resultFileStatsOk,
      action529VerifierPassed,
      action518VerifierPassed,
      record: readJson(paths.record),
      docText: read(paths.doc),
    });
    failures.push(...evaluation.unresolved_conditions);
  } else {
    evaluation = {
      evidence_acceptance_result: expected.evidenceBlocked,
      rehearsal_environment_readiness: expected.environmentBlocked,
      approval_decision: expected.approvalBlocked,
      result_content_safety: "result_content_safety_failed",
      unresolved_conditions: failures,
    };
  }

  return {
    action: 532,
    verification_status: failures.length === 0 ? "passed" : "failed",
    action_529_result_path: paths.result,
    action_529_result_verifier: action529VerifierPassed ? expected.action529VerifierPassed : "action_529_result_verifier_failed",
    result_content_safety: evaluation.result_content_safety,
    evidence_acceptance_result:
      failures.length === 0 ? expected.evidenceAccepted : expected.evidenceBlocked,
    rehearsal_environment_readiness:
      failures.length === 0 ? expected.environmentReady : expected.environmentBlocked,
    approval_decision: failures.length === 0 ? expected.approvalApproved : expected.approvalBlocked,
    operator_attempt_number: 2,
    prior_attempt_result: expected.priorBlocked,
    current_precheck_result: expected.precheckPassed,
    build_performed: false,
    candidate_reconstructed: false,
    rehearsal_performed: false,
    deployment_performed: false,
    preview_activated: false,
    external_network_used: false,
    supabase_accessed: false,
    provider_called: false,
    persistence_created: false,
    replay_created: false,
    confidence_applied: false,
    feedback_created: false,
    runtime_preview_state: expected.runtimePreview,
    next_action: expected.nextAction,
    unresolved_conditions: failures,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const output = verifyAction532();
  console.log(JSON.stringify(output, null, 2));
  if (output.verification_status !== "passed") process.exit(1);
}
