#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-418-pure-confidence-calibration-contract-and-pattern-insight-compatibility-approval-gate.md",
  verifier: "scripts/action-418-pure-confidence-calibration-contract-and-pattern-insight-compatibility-approval-gate-verify.mjs",
  test: "tests/e2e/action-418-pure-confidence-calibration-contract-and-pattern-insight-compatibility-approval-gate.spec.ts",
  action417Verifier: "scripts/action-417-independent-expanded-static-pattern-discovery-shadow-verification-verify.mjs",
  action416Runner: "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
  action416Manifest: "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  action416Doc: "docs/action-416-expanded-static-pattern-discovery-shadow-use.md",
  action416Verifier: "scripts/action-416-expanded-static-pattern-discovery-shadow-use-verify.mjs",
  action414Inventory: "docs/action-414-expanded-static-pattern-discovery-hash-inventory.json",
  action414FreezeScript: "scripts/action-414-expanded-static-pattern-discovery-hash-freeze.mjs",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
};

const expectedHashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action414Inventory]: "2b2bed561b2dcbc08ff996d416e463fcb16b2b5a4eec1dbb52126768c9288e3d",
  [paths.action414FreezeScript]: "eda36bcbf9f05e3945578946a7322546ea3b83dc5fe7e770d65728f9aa77aea3",
  [paths.action416Manifest]: "dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652",
  [paths.action416Runner]: "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
  [paths.action416Doc]: "2866a098c00b35d40a13e3bd5432c9dd76ec2f661fba5046f63e9663fda55f00",
  [paths.action416Verifier]: "d2c57ae3e3b5f08406a343504d52496fb0fb0627fc9c6b2b000cf3a0a147709c",
};

const expectedAction417PackageHash = "ccbff3b786c62b0e56cd6300bae9a6950cba2ad15a3376f37dc7130d698477a8";
const expectedAction414InventoryHash = "8b7e5c55f1ae8e27a278ca7d844d204aee4a84d4546cb8b612c3db122d83fe4b";
const expectedAction414FreezePayloadHash = "4e1f3e0cd8e67e7d0230c1af8618d8e803867c75c32d18857c48b1234e835c12";

const requiredDocSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 417 Readiness Result",
  "Explicit Non-Goals",
  "Confidence Calibration Definition",
  "Pure-Function Boundary",
  "Eligible Pattern Insight Policy",
  "Excluded Pattern Insight Policy",
  "Pattern Discovery Status Policy",
  "Warning Policy",
  "Support-Threshold Policy",
  "Completed-Outcome Policy",
  "Evidence-Quality Policy",
  "Mixed-Evidence Policy",
  "Adverse-Evidence Policy",
  "Neutral-Evidence Policy",
  "Insufficient-Evidence Policy",
  "Blocked-Result Policy",
  "Input-Lineage Contract",
  "Evidence-Overlap Policy",
  "Duplicate-Insight Policy",
  "Calibration Target Contract",
  "Base-Confidence Contract",
  "Adjustment-Delta Contract",
  "Positive-Adjustment Limit",
  "Negative-Adjustment Limit",
  "Absolute-Confidence Bounds",
  "Zero-Adjustment Policy",
  "Rounding Policy",
  "Scaled-Integer Policy",
  "Conservative Adjustment Model",
  "Multiple-Insight Aggregation",
  "Conflict Resolution",
  "Deterministic Ordering",
  "Deterministic Deduplication",
  "Calibration Identity",
  "Calibration Hash",
  "Issue/Warning Contract",
  "Result Vocabulary",
  "Output Contract",
  "Recommendation-Mutation Prohibition",
  "Calibration-Application Prohibition",
  "Anti-Leakage Policy",
  "Prohibited Inference",
  "Prohibited Repair",
  "Prohibited Causal Claims",
  "Static Compatibility Boundary",
  "Future Implementation Boundary",
  "Future Independent-Audit Requirement",
  "Approval Vocabulary",
  "Deterministic Gate Conditions",
  "Approval Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
  "Runtime-Preview Paused State",
];

const eligibleStatuses = ["discovered", "discovered_with_warnings"];
const excludedStatuses = [
  "insufficient_evidence",
  "blocked_future_leakage",
  "blocked_invalid_configuration",
  "blocked_invalid_input",
  "blocked_invalid_lineage",
  "blocked_non_consumable_row",
  "blocked_nondeterministic_grouping",
];
const warningClassifications = {
  duplicate_mapper_row_identity: "calibration_reducing",
  metric_value_unavailable: "calibration_reducing",
  minimum_total_support_not_met: "calibration_blocking",
  minimum_completed_outcomes_not_met: "calibration_blocking",
};
const resultVocabulary = [
  "calibrated",
  "calibrated_with_warnings",
  "no_adjustment",
  "insufficient_eligible_evidence",
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_overlapping_evidence",
  "blocked_unsupported_insight",
];
const adjustmentModel = {
  supportive_strong: 2,
  supportive_moderate: 1,
  supportive_weak: 0.5,
  neutral: 0,
  mixed: 0,
  adverse_weak: -1,
  adverse_moderate: -2,
  adverse_strong: -3,
};
const noEffectFlags = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_integration_executed: false,
  calibration_executed: false,
  recommendation_mutation_executed: false,
  feedback_executed: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  runtime_preview_advanced: false,
};

const forbiddenPureImplementationArtifacts = [
  "lib/confidence-calibration-pure.ts",
  "lib/pattern-insight-confidence-calibration.ts",
  "docs/action-419-pure-confidence-calibration-implementation-manifest.json",
  "docs/action-419-pure-confidence-calibration-input-manifest.json",
  "scripts/action-419-pure-confidence-calibration-run.mjs",
  "scripts/action-419-confidence-calibration-runner.mjs",
  "scripts/action-418-pure-confidence-calibration-run.mjs",
  "docs/action-418-pure-confidence-calibration-manifest.json",
];

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 240000 }));
}

function sourceAvoids(source, tokens) {
  return tokens.every((token) => !source.includes(token));
}

function runtimeConsumers() {
  const targets = ["app", "public", "proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].filter(exists);
  if (targets.length === 0) return [];
  const scan = spawnSync("rg", ["-l", "action-418|action_418|calibrateConfidence|ConfidenceCalibrationInsightEnvelope", ...targets], {
    cwd: root,
    encoding: "utf8",
  });
  if (![0, 1].includes(scan.status ?? -1)) return ["runtime_consumer_scan_failed"];
  return scan.stdout.trim().split("\n").filter(Boolean);
}

function implementationMarkers() {
  const targets = ["lib", "scripts", "docs", "tests"].filter(exists);
  const scan = spawnSync("rg", ["-n", "export function calibrateConfidence|function calibrateConfidence|const calibrateConfidence|ConfidenceCalibrationInsightEnvelope|FrozenConfidenceCalibrationConfiguration|ConfidenceCalibrationResult", ...targets], {
    cwd: root,
    encoding: "utf8",
  });
  if (![0, 1].includes(scan.status ?? -1)) return ["implementation_marker_scan_failed"];
  return scan.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .filter((line) =>
      !line.startsWith(paths.doc) &&
      !line.startsWith(paths.verifier) &&
      !line.startsWith(paths.test) &&
      !line.startsWith("docs/action-419-") &&
      !line.startsWith("scripts/action-419-") &&
      !line.startsWith("tests/e2e/action-419-") &&
      !line.startsWith("lib/pure-confidence-calibration.ts") &&
      !line.startsWith("docs/action-420-") &&
      !line.startsWith("scripts/action-420-") &&
      !line.startsWith("tests/e2e/action-420-") &&
      !line.startsWith("docs/action-421-") &&
      !line.startsWith("scripts/action-421-") &&
      !line.startsWith("tests/e2e/action-421-") &&
      !line.startsWith("docs/action-422-") &&
      !line.startsWith("scripts/action-422-") &&
      !line.startsWith("tests/e2e/action-422-") &&
      !line.startsWith("docs/action-423-") &&
      !line.startsWith("scripts/action-423-") &&
      !line.startsWith("tests/e2e/action-423-") &&
      !line.startsWith("docs/action-424-") &&
      !line.startsWith("scripts/action-424-") &&
      !line.startsWith("tests/e2e/action-424-") &&
      !line.startsWith("docs/action-425-") &&
      !line.startsWith("scripts/action-425-") &&
      !line.startsWith("tests/e2e/action-425-") &&
      !line.startsWith("docs/action-426-") &&
      !line.startsWith("scripts/action-426-") &&
      !line.startsWith("tests/e2e/action-426-"));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const verifierSource = exists(paths.verifier) ? read(paths.verifier) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const action417 = exists(paths.action417Verifier) ? runJson(paths.action417Verifier) : null;
const protectedHashReadback = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [
  path,
  { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected },
]));
const forbiddenArtifactsFound = forbiddenPureImplementationArtifacts.filter(exists);
const runtimeConsumerFiles = runtimeConsumers();
const implementationMarkerHits = implementationMarkers();
const trackedAction418Evidence = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-418/.test(path))
  .filter((path) => /manifest|runner|run\.mjs|evidence|result|report|execution/.test(path))
  .filter((path) => ![paths.doc, paths.verifier, paths.test].includes(path));

const checks = {
  documentation_exists: exists(paths.doc),
  documentation_contract_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  action417_readiness_ready: action417?.verification_status === "passed" &&
    action417?.readiness_decision === "ready" &&
    action417?.action416_reproduction?.scenario_count === 30 &&
    action417?.action416_reproduction?.executed_package_runs === 2 &&
    action417?.package_hashes?.run_1_package_sha256 === expectedAction417PackageHash &&
    action417?.action414_inventory_integrity?.full_inventory_sha256 === expectedAction414InventoryHash &&
    action417?.action414_inventory_integrity?.freeze_payload_sha256 === expectedAction414FreezePayloadHash,
  pure_function_boundary_frozen: doc.includes("calibrateConfidence(input: Readonly") &&
    doc.includes("synchronous, pure, immutable, deterministic") &&
    doc.includes("filesystem-free, network-free, persistence-free"),
  eligible_insight_policy_exact: eligibleStatuses.every((status) => doc.includes(`\`${status}\``)) &&
    doc.includes("evidence-set hash exists") &&
    doc.includes("group hash exists") &&
    doc.includes("insight hash exists") &&
    doc.includes("support threshold is reached") &&
    doc.includes("completed-outcome threshold is reached"),
  excluded_insight_policy_exact: excludedStatuses.every((status) => doc.includes(`\`${status}\``)) &&
    doc.includes("runtime insights") &&
    doc.includes("production-derived insights") &&
    doc.includes("unsupported setup family") &&
    doc.includes("unsupported horizon"),
  warning_policy_exact: Object.entries(warningClassifications).every(([code, classification]) =>
    doc.includes(`\`${code}\``) && doc.includes(`\`${classification}\``)) &&
    doc.includes("Unknown warnings are `calibration_blocking`"),
  support_and_completed_thresholds_exact: doc.includes("Minimum total support is `20`") &&
    doc.includes("Minimum unique snapshot support is `20`") &&
    doc.includes("Minimum completed outcomes is `20`"),
  confidence_bounds_exact: doc.includes("`baseConfidence` is a percent from `0.00` through `100.00`") &&
    doc.includes("Output confidence must be within `0.00` and `100.00`") &&
    doc.includes("basis points: `0` to `10000`"),
  delta_bounds_exact: doc.includes("Per-insight positive delta is capped at `+2.00`") &&
    doc.includes("Combined positive delta is capped at `+4.00`") &&
    doc.includes("Per-insight negative delta is capped at `-3.00`") &&
    doc.includes("Combined negative delta is capped at `-6.00`"),
  adjustment_model_exact: Object.entries(adjustmentModel).every(([direction, delta]) =>
    doc.includes(`\`${direction}\``) && doc.includes(delta > 0 ? `\`+${delta.toFixed(2)}\`` : `\`${delta.toFixed(2)}\``)),
  multiple_insight_aggregation_exact: doc.includes("Sort eligible envelopes by `(setupFamily, horizon, evidenceSetHash, groupHash, insightId, insightHash)`") &&
    doc.includes("Deduplicate first. Resolve overlap groups second. Sum selected deltas third.") &&
    doc.includes("If absolute positive support equals absolute negative support"),
  overlap_policy_exact: doc.includes("Evidence overlaps when two envelopes share an evidence-set hash") &&
    doc.includes("source case ID") &&
    doc.includes("source snapshot ID") &&
    doc.includes("not counted independently"),
  lineage_and_leakage_exact: doc.includes("Pattern Discovery implementation hash") &&
    doc.includes("Pattern Discovery configuration version") &&
    doc.includes("no-feedback declaration") &&
    doc.includes("failed/unknown/missing leakage evidence"),
  result_vocabulary_exact: resultVocabulary.every((status) => doc.includes(`\`${status}\``)),
  issue_contract_exact: doc.includes("severity: \"info\" | \"warning\" | \"error\"") &&
    doc.includes("RFC 6901 JSON Pointers") &&
    doc.includes("No raw rejected values, timestamps, sensitive values"),
  identity_hash_policy_exact: doc.includes("`calibrationId` is `confidence_calibration_v1:`") &&
    doc.includes("`calibrationHash` is SHA-256") &&
    doc.includes("schema marker `confidence_calibration_result_v1`") &&
    doc.includes("Exclude current time, machine paths, runtime state"),
  mutation_and_application_prohibited: doc.includes("Recommendation-Mutation Prohibition") &&
    doc.includes("No automatic application is allowed") &&
    doc.includes("requires a later separate governance action"),
  approval_decision_recorded: doc.includes("Decision: `approved_with_conditions`") &&
    doc.includes("`action_419_pure_confidence_calibration_implementation_approval_gate`"),
  no_pure_calibration_implementation_exists: forbiddenArtifactsFound.length === 0 &&
    implementationMarkerHits.length === 0,
  no_runner_or_manifest_exists: trackedAction418Evidence.length === 0,
  protected_sources_unchanged: Object.values(protectedHashReadback).every((entry) => entry.unchanged),
  no_runtime_persistence_replay_provider_supabase_feedback: runtimeConsumerFiles.length === 0 &&
    sourceAvoids(verifierSource, [
      "fetch" + "(",
      "@supa" + "base/",
      "create" + "Client(",
      "TWELVE" + "_DATA",
      "next" + "/server",
    ]) &&
    sourceAvoids(testSource, ["fetch" + "(", "@supa" + "base/", "TWELVE" + "_DATA"]),
  runtime_preview_untouched: action417?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    doc.includes("Runtime preview remains `runtime_preview_waiting_for_operator_inputs`"),
};

const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  approval_decision: "approved_with_conditions",
  approval_vocabulary: ["approved", "approved_with_conditions", "blocked"],
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions: [
    "implementation_file_path_unapproved",
    "executable_fixture_package_unapproved",
    "implementation_independent_audit_future_work",
  ],
  action417_readiness: {
    verification_status: action417?.verification_status ?? null,
    readiness_decision: action417?.readiness_decision ?? null,
    action416_scenario_count: action417?.action416_reproduction?.scenario_count ?? null,
    action416_executed_package_runs: action417?.action416_reproduction?.executed_package_runs ?? null,
    action416_package_hash: action417?.package_hashes?.run_1_package_sha256 ?? null,
  },
  pure_entry_point: "calibrateConfidence(input: Readonly<{ baseConfidence: number; insights: readonly ConfidenceCalibrationInsightEnvelope[]; configuration: FrozenConfidenceCalibrationConfiguration; }>): ConfidenceCalibrationResult",
  eligible_statuses: eligibleStatuses,
  excluded_statuses: excludedStatuses,
  warning_classifications: warningClassifications,
  confidence_bounds: {
    input_min: 0,
    input_max: 100,
    output_min: 0,
    output_max: 100,
    precision_decimal_places: 2,
    scaled_integer_basis_points: true,
  },
  delta_bounds: {
    per_insight_positive_max: 2,
    per_insight_negative_max: -3,
    combined_positive_max: 4,
    combined_negative_max: -6,
  },
  adjustment_model: adjustmentModel,
  aggregation_policy: {
    sort_key: ["setupFamily", "horizon", "evidenceSetHash", "groupHash", "insightId", "insightHash"],
    dedupe_key: "configurationVersion|patternDiscoveryResultHash|evidenceSetHash|groupHash|insightId|insightHash",
    overlap_components: ["evidenceSetHash", "groupHash", "insightHash", "sourceCaseId", "sourceSnapshotId", "patternDiscoveryResultHash"],
    aggregate_method: "dedupe_then_overlap_resolve_then_sum_then_cap",
  },
  result_vocabulary: resultVocabulary,
  issue_warning_shape: {
    fields: ["code", "path", "severity", "messageKey"],
    path_standard: "RFC_6901",
    deterministic_sort: ["severity", "code", "path", "messageKey"],
  },
  identity_hash_contract: {
    calibration_id_prefix: "confidence_calibration_v1:",
    calibration_hash_algorithm: "sha256_canonical_json",
    excluded_components: ["current_time", "machine_paths", "runtime_state", "output_position", "randomness", "secrets"],
  },
  forbidden_artifacts_found: forbiddenArtifactsFound,
  implementation_marker_hits: implementationMarkerHits,
  tracked_action418_evidence_files: trackedAction418Evidence,
  runtime_consumer_files: runtimeConsumerFiles,
  source_integrity: protectedHashReadback,
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unrelated_work_classification: "action_418_docs_verifier_tests_and_minimal_guard_updates_only",
  recommended_next_action: failedChecks.length === 0
    ? "action_419_pure_confidence_calibration_implementation_approval_gate"
    : "resolve_action_418_contract_gate_failures",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failedChecks.length === 0 ? 0 : 1;
