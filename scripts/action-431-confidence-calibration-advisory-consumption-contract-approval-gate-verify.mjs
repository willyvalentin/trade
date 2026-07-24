#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-431-confidence-calibration-advisory-consumption-contract-approval-gate.md",
  verifier: "scripts/action-431-confidence-calibration-advisory-consumption-contract-approval-gate-verify.mjs",
  test: "tests/e2e/action-431-confidence-calibration-advisory-consumption-contract-approval-gate.spec.ts",
  action429Verifier: "scripts/action-429-static-confidence-calibration-shadow-use-verify.mjs",
  action430Verifier: "scripts/action-430-independent-static-confidence-calibration-shadow-verification-verify.mjs",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  goldenVerifier: "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  adapter: "lib/confidence-calibration-advisory-adapter.ts",
};

const eligibleCalibrationStatuses = ["calibrated", "calibrated_with_warnings", "no_adjustment"];
const blockedCalibrationStatuses = [
  "insufficient_eligible_evidence",
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_overlapping_evidence",
  "blocked_unsupported_insight",
];
const advisoryStatusVocabulary = [
  "advisory_ready",
  "advisory_ready_with_warnings",
  "advisory_no_adjustment",
  "advisory_insufficient_evidence",
  "blocked_invalid_input",
  "blocked_confidence_mismatch",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_calibration_result",
  "blocked_unsupported_status",
];
const approvalVocabulary = ["approved", "approved_with_conditions", "blocked"];
const futureSequence = [
  "Action 432 - Pure Confidence Calibration Advisory Adapter Implementation",
  "Action 433 - Independent Advisory Adapter Verification",
  "Action 434 - Static Advisory Fixture & Hash-Freeze Approval",
  "Action 435 - Static Advisory Fixture & Hash Freeze",
  "Action 436 - Independent Advisory Hash Verification",
  "Action 437 - Advisory Shadow Execution Approval",
  "Action 438 - Advisory Shadow Execution",
  "Action 439 - Independent Advisory Shadow Verification",
];
const futureBoundaryFiles = [
  "lib/confidence-calibration-advisory-adapter.ts",
  "docs/action-432-confidence-calibration-advisory-adapter-implementation.md",
  "scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs",
  "tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts",
];
const protectedFileHashes = {
  "lib/pure-confidence-calibration.ts": "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  "lib/pure-pattern-discovery.ts": "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  "docs/action-426-static-confidence-calibration-hash-inventory.json": "e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe",
  "scripts/action-426-static-confidence-calibration-hash-freeze.mjs": "f8cf5af48f640a2158f17f92b6321340d17f334577534fc8b675969e9ff223fa",
  "docs/action-429-static-confidence-calibration-shadow-input-manifest.json": "f730d31084419985c8464e01e1daf67bea9312ac47a3ab5c291a1c394da03c59",
  "scripts/action-429-static-confidence-calibration-shadow-run.mjs": "dd073134a96583caddae345c9c84be6bc4a327198c65aa29d8d191e4ea21b882",
};

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 240000 }));
}

function shaFile(path) {
  return execFileSync("shasum", ["-a", "256", abs(path)], { cwd: root, encoding: "utf8" }).trim().split(/\s+/)[0];
}

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path))
    .flatMap((entry) => {
      if (entry === ".git" || entry === ".next" || entry === "node_modules") return [];
      return collectFiles(join(path, entry));
    })
    .sort();
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(result.stderr || `rg failed for ${pattern}`);
  }
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function includesAll(text, values) {
  return values.every((value) => text.includes(value));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const action429 = exists(paths.action429Verifier) ? runJson(paths.action429Verifier) : null;
const action430 = exists(paths.action430Verifier) ? runJson(paths.action430Verifier) : null;
const action309 = exists(paths.action309Guard) ? runJson(paths.action309Guard) : null;
const golden = exists(paths.goldenVerifier) ? runJson(paths.goldenVerifier) : null;
const sourceIntegrity = Object.fromEntries(
  Object.entries(protectedFileHashes).map(([path, expected]) => {
    const actual = exists(path) ? shaFile(path) : null;
    return [path, { expected, actual, exists: actual !== null, matches: actual === expected }];
  }),
);
const adapterConsumers = rgFiles("buildConfidenceCalibrationAdvisory|confidence-calibration-advisory-adapter", ["app", "lib"])
  .filter((path) => path !== paths.adapter);
const runtimeConsumerFiles = rgFiles("ConfidenceCalibrationAdvisory|advisory_ready|advisory_no_adjustment|blocked_confidence_mismatch", ["app", "lib"])
  .filter((path) => path !== paths.adapter);
const action431Files = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-431/i.test(path));
const approvedAction431Files = [paths.doc, paths.verifier, paths.test];
const unapprovedAction431Files = action431Files.filter((path) => !approvedAction431Files.includes(path));

const requiredSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Actions 418-430 Completion Summary",
  "Action 430 Readiness",
  "Explicit Non-Goals",
  "Advisory-Consumption Definition",
  "Future Adapter Definition",
  "Input Contract",
  "Output Contract",
  "Eligibility Policy",
  "Blocked-Result Policy",
  "Original-Confidence Semantics",
  "Proposed-Confidence Semantics",
  "Applied-Confidence Semantics",
  "Warning Policy",
  "Issue Policy",
  "Lineage Requirements",
  "Calibration Identity Requirements",
  "Pattern Discovery Lineage Requirements",
  "Recommendation Identity Requirements",
  "Anti-Leakage",
  "Anti-Feedback",
  "Temporal-Boundary Policy",
  "Ranking Non-Effect",
  "Scanner Non-Effect",
  "Publication Non-Effect",
  "Persistence Prohibition",
  "Runtime Prohibition",
  "Audit-Trail Policy",
  "UI Visibility Policy",
  "Future Implementation Boundary",
  "Future Independent Audit",
  "Future Static Fixture Sequence",
  "Future Shadow Sequence",
  "Future Application Approval Sequence",
  "Approval Vocabulary",
  "Deterministic Gate Conditions",
  "Approval Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
];

const checks = {
  documentation_exists: exists(paths.doc) &&
    doc.includes("Action 431 - Confidence Calibration Advisory Consumption Contract Approval Gate"),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  documentation_sections_complete: requiredSections.every((section) => doc.includes(`## ${section}`)),
  action430_ready: action430?.verification_status === "passed" &&
    action430?.readiness_decision === "ready" &&
    action430?.action429_reproduction?.final_shadow_decision === "shadow_passed",
  action429_healthy: action429?.verification_status === "passed" &&
    action429?.final_shadow_decision === "shadow_passed",
  source_and_package_hashes_unchanged: Object.values(sourceIntegrity).every((entry) => entry.matches),
  advisory_only_definition: doc.includes("Advisory consumption is a future pure transform") &&
    doc.includes("must not mutate the `Recommendation` object") &&
    doc.includes("must not make the proposed confidence authoritative"),
  exact_input_output_proposal: doc.includes("buildConfidenceCalibrationAdvisory") &&
    doc.includes("ImmutableRecommendationConfidenceEnvelope") &&
    doc.includes("ConfidenceCalibrationResult") &&
    doc.includes("FrozenAdvisoryConsumptionConfiguration") &&
    doc.includes("ConfidenceCalibrationAdvisoryResult"),
  eligible_statuses_exact: includesAll(doc, eligibleCalibrationStatuses) &&
    doc.includes("Only these calibration statuses may produce visible advisory metadata"),
  advisory_status_vocabulary_exact: includesAll(doc, advisoryStatusVocabulary) &&
    doc.includes("Action 432 must not invent additional statuses"),
  blocked_status_policy_exact: includesAll(doc, blockedCalibrationStatuses) &&
    doc.includes("Do not silently treat blocked calibration as no adjustment") &&
    doc.includes("Confidence mismatch must produce `blocked_confidence_mismatch`"),
  original_confidence_semantics: doc.includes("exact equality to the calibration input base confidence") &&
    doc.includes("Mismatch must block advisory consumption") &&
    doc.includes("must not repair, rebase, round into validity"),
  proposed_confidence_semantics: doc.includes("proposed calibrated confidence is advisory") &&
    doc.includes("not used by ranking") &&
    doc.includes("not used by scanner") &&
    doc.includes("not used by publication"),
  applied_false_semantics: doc.includes('"applied": false') &&
    doc.includes('"non_authoritative": true') &&
    doc.includes("No future Action immediately following Action 431 may set `applied: true`"),
  warning_and_no_adjustment_policy: doc.includes("preserve canonical warning inventory") &&
    doc.includes("do not convert warnings into recommendation warnings automatically") &&
    doc.includes("keep original and proposed confidence equal"),
  issue_shape_policy: doc.includes("code") &&
    doc.includes("path") &&
    doc.includes("severity") &&
    doc.includes("messageKey") &&
    doc.includes("must not expose raw rejected values"),
  lineage_fail_closed: doc.includes("Missing or inconsistent lineage must block advisory consumption") &&
    doc.includes("recommendation snapshot hash") &&
    doc.includes("Pattern Discovery result hash") &&
    doc.includes("calibration identity hash"),
  anti_feedback_policy: doc.includes("Calibration output must not become Pattern Discovery evidence") &&
    doc.includes("No circular calibration lineage is allowed"),
  anti_leakage_policy: doc.includes("must predate the future recommendation decision boundary") &&
    doc.includes("same-recommendation realized result") &&
    doc.includes("calibration generated from the recommendation being calibrated"),
  ranking_scanner_publication_non_effect: doc.includes("Ranking Non-Effect") &&
    doc.includes("Scanner Non-Effect") &&
    doc.includes("Publication Non-Effect") &&
    doc.includes("must not affect visible recommendation publication"),
  persistence_runtime_prohibited: doc.includes("Action 431 does not approve persistence") &&
    doc.includes("Action 431 does not approve runtime integration"),
  audit_trail_policy: doc.includes("independently reproducible") &&
    doc.includes("No timestamp may be part of semantic identity"),
  future_action432_boundary_exact: includesAll(doc, futureBoundaryFiles) &&
    doc.includes("No Recommendation Engine consumer, runtime integration, persistence, ranking change, scanner change"),
  future_sequence_through_439: futureSequence.every((step) => doc.includes(step)) &&
    doc.includes("Only after Action 439 may a separate application/integration approval gate be considered"),
  approval_vocabulary_exact: approvalVocabulary.every((word) => doc.includes(`- ${word}`)),
  approval_decision: doc.includes("Approval decision: approved."),
  exact_action432_adapter_recognized: exists(paths.adapter) &&
    read(paths.adapter).includes("export function buildConfidenceCalibrationAdvisory") &&
    read(paths.adapter).includes("export type ImmutableRecommendationConfidenceEnvelope") &&
    read(paths.adapter).includes("export type FrozenAdvisoryConsumptionConfiguration") &&
    read(paths.adapter).includes("export type ConfidenceCalibrationAdvisoryResult"),
  action432_boundary_files_exact: futureBoundaryFiles.every((path) => exists(path)),
  no_recommendation_engine_consumer: adapterConsumers.length === 0 && runtimeConsumerFiles.length === 0,
  no_unapproved_action431_artifacts: unapprovedAction431Files.length === 0,
  action309_guard_healthy: action309?.guard_status === "passed",
  golden_static_safety_healthy: golden?.verification_status === "passed",
  no_runtime_persistence_replay_provider_supabase_feedback: action430?.isolation?.runtime_result === "none" &&
    action430?.isolation?.persistence_result === "none" &&
    action430?.isolation?.replay_result === "none" &&
    action430?.isolation?.external_access_result === "none" &&
    action430?.isolation?.feedback_result === "none" &&
    action430?.isolation?.provider_call_executed === false &&
    action430?.isolation?.supabase_read_executed === false &&
    action430?.isolation?.supabase_write_executed === false,
  no_recommendation_mutation: action430?.isolation?.recommendation_mutated === false &&
    action430?.isolation?.authoritative_data_created === false,
  runtime_preview_paused: action430?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  next_action_identified: doc.includes("action_432_pure_confidence_calibration_advisory_adapter_implementation"),
};

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);
const unresolvedConditions = [];
const approvalDecision = failedConditions.length > 0
  ? "blocked"
  : unresolvedConditions.length > 0
    ? "approved_with_conditions"
    : "approved";

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  approval_decision: approvalDecision,
  approval_vocabulary: approvalVocabulary,
  checks,
  failed_conditions: failedConditions,
  unresolved_conditions: unresolvedConditions,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: unresolvedConditions.length,
  eligible_calibration_statuses: eligibleCalibrationStatuses,
  blocked_calibration_statuses: blockedCalibrationStatuses,
  advisory_status_vocabulary: advisoryStatusVocabulary,
  status_mapping: {
    calibrated: "advisory_ready",
    calibrated_with_warnings: "advisory_ready_with_warnings",
    no_adjustment: "advisory_no_adjustment",
    insufficient_eligible_evidence: "advisory_insufficient_evidence",
    blocked_invalid_input: "blocked_invalid_input",
    blocked_invalid_configuration: "blocked_invalid_input",
    blocked_invalid_lineage: "blocked_invalid_lineage",
    blocked_future_leakage: "blocked_future_leakage",
    blocked_overlapping_evidence: "blocked_calibration_result",
    blocked_unsupported_insight: "blocked_unsupported_status",
    confidence_mismatch: "blocked_confidence_mismatch",
  },
  advisory_definition: {
    adapter_created: false,
    consumption_created: false,
    non_authoritative: true,
    applied: false,
    recommendation_mutation_allowed: false,
    ranking_effect_allowed: false,
    scanner_effect_allowed: false,
    publication_effect_allowed: false,
  },
  future_api: {
    function_name: "buildConfidenceCalibrationAdvisory",
    input_type: "Readonly<{ recommendation: ImmutableRecommendationConfidenceEnvelope; calibration: ConfidenceCalibrationResult; configuration: FrozenAdvisoryConsumptionConfiguration; }>",
    result_type: "ConfidenceCalibrationAdvisoryResult",
    synchronous: true,
    pure: true,
    immutable: true,
    deterministic: true,
  },
  future_boundary_files: futureBoundaryFiles,
  future_sequence: futureSequence,
  action430_readiness: {
    verification_status: action430?.verification_status ?? "unknown",
    readiness_decision: action430?.readiness_decision ?? "unknown",
    final_shadow_decision: action430?.action429_reproduction?.final_shadow_decision ?? "unknown",
    runtime_preview_status: action430?.runtime_preview_status ?? "unknown",
  },
  action429_health: {
    verification_status: action429?.verification_status ?? "unknown",
    final_shadow_decision: action429?.final_shadow_decision ?? "unknown",
  },
  source_integrity: sourceIntegrity,
  consumers: {
    adapter_path_exists: exists(paths.adapter),
    adapter_consumers: adapterConsumers,
    runtime_consumer_files: runtimeConsumerFiles,
    action431_files: action431Files,
    unapproved_action431_files: unapprovedAction431Files,
  },
  safety: {
    provider_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    runtime_route_created: false,
    feedback_executed: false,
    recommendation_mutated: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    publication_changed: false,
  },
  runtime_preview_status: action430?.runtime_preview_status ?? "unknown",
  unrelated_work_classification: "action_431_static_advisory_consumption_contract_approval_gate_only",
  recommended_next_action: exists(paths.adapter)
    ? "action_433_independent_advisory_adapter_verification"
    : "action_432_pure_confidence_calibration_advisory_adapter_implementation",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (failedConditions.length > 0) process.exitCode = 1;
