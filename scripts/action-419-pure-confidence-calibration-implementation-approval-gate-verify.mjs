#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-419-pure-confidence-calibration-implementation-approval-gate.md",
  verifier: "scripts/action-419-pure-confidence-calibration-implementation-approval-gate-verify.mjs",
  test: "tests/e2e/action-419-pure-confidence-calibration-implementation-approval-gate.spec.ts",
  approvedImplementation: "lib/pure-confidence-calibration.ts",
  action418Verifier: "scripts/action-418-pure-confidence-calibration-contract-and-pattern-insight-compatibility-approval-gate-verify.mjs",
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

const requiredDocSections = [
  "Purpose",
  "Scope",
  "Authoritative Dependencies",
  "Action 418 Decision",
  "Action 418 Future Conditions",
  "Explicit Non-Goals",
  "Exact Implementation Module",
  "Exact Exported API",
  "Function Signature",
  "Input-Envelope Contract",
  "Configuration Contract",
  "Validation-Order Contract",
  "Eligible-Insight Contract",
  "Excluded-Insight Contract",
  "Warning-Classification Contract",
  "Evidence-Quality Contract",
  "Direction Contract",
  "Delta Table",
  "Attenuation Contract",
  "Base-Confidence Validation",
  "Basis-Point Conversion",
  "Individual-Delta Contract",
  "Combined-Delta Contract",
  "Positive/Negative Cap Contract",
  "Overlap-Resolution Contract",
  "Duplicate-Insight Contract",
  "Multiple-Insight Aggregation Contract",
  "Contradictory-Insight Contract",
  "Zero-Adjustment Contract",
  "Rounding Contract",
  "Clamping-Versus-Rejection Contract",
  "Lineage Contract",
  "Anti-Leakage Contract",
  "Result Vocabulary",
  "Issue/Warning Contract",
  "Calibration Output Contract",
  "Identity Contract",
  "Canonical Serialization",
  "Calibration Hash",
  "Deterministic Ordering",
  "Deterministic Deduplication",
  "Immutability",
  "Prohibited Inference",
  "Prohibited Repair",
  "Prohibited Recommendation Mutation",
  "Prohibited Calibration Application",
  "Implementation Boundary",
  "Required Test Inventory",
  "Executable-Fixture Sequencing",
  "Mandatory Action 421 Independent Audit",
  "Approval Vocabulary",
  "Deterministic Gate Conditions",
  "Approval Decision",
  "Passed Conditions",
  "Failed Conditions",
  "Unresolved Conditions",
  "Next Permitted Action",
  "Runtime-Preview Paused State",
];

const exactTypeExports = [
  "ConfidenceCalibrationInsightEnvelope",
  "FrozenConfidenceCalibrationConfiguration",
  "ConfidenceCalibrationResult",
  "ConfidenceCalibrationIssue",
  "ConfidenceCalibrationWarning",
  "ConfidenceCalibrationEvidenceSummary",
  "ConfidenceCalibrationAdjustment",
];

const validationOrder = [
  "top-level input shape",
  "configuration shape",
  "base-confidence validity",
  "insight-array shape",
  "insight-envelope shape",
  "Pattern Discovery status eligibility",
  "insight presence and structural validity",
  "lineage integrity",
  "anti-leakage",
  "warning compatibility",
  "evidence quality",
  "overlap and duplicate detection",
  "individual delta calculation",
  "multiple-insight aggregation",
  "combined cap application",
  "calibrated-confidence bounds",
  "result construction",
];

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

const warningClassifications = {
  duplicate_mapper_row_identity: "calibration_reducing",
  metric_value_unavailable: "calibration_reducing",
  minimum_total_support_not_met: "calibration_blocking",
  minimum_completed_outcomes_not_met: "calibration_blocking",
};

const deltaTableBasisPoints = {
  supportive_strong: 200,
  supportive_moderate: 100,
  supportive_weak: 50,
  neutral: 0,
  mixed: 0,
  adverse_weak: -100,
  adverse_moderate: -200,
  adverse_strong: -300,
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

const forbiddenImplementationArtifacts = [
  "lib/confidence-calibration-pure.ts",
  "lib/pattern-insight-confidence-calibration.ts",
  "docs/action-419-pure-confidence-calibration-implementation-manifest.json",
  "docs/action-419-pure-confidence-calibration-input-manifest.json",
  "scripts/action-419-pure-confidence-calibration-run.mjs",
  "scripts/action-419-confidence-calibration-runner.mjs",
  "docs/action-420-pure-confidence-calibration-implementation-manifest.json",
  "docs/action-420-pure-confidence-calibration-input-manifest.json",
  "scripts/action-420-pure-confidence-calibration-run.mjs",
  "scripts/action-420-confidence-calibration-runner.mjs",
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
  const scan = spawnSync("rg", ["-l", "action-419|action_419|pure-confidence-calibration|calibrateConfidence|ConfidenceCalibrationInsightEnvelope", ...targets], {
    cwd: root,
    encoding: "utf8",
  });
  if (![0, 1].includes(scan.status ?? -1)) return ["runtime_consumer_scan_failed"];
  return scan.stdout.trim().split("\n").filter(Boolean);
}

function implementationMarkers() {
  const targets = ["lib", "scripts", "docs", "tests"].filter(exists);
  const scan = spawnSync("rg", ["-n", "export function calibrateConfidence|function calibrateConfidence|const calibrateConfidence|class ConfidenceCalibration|new ConfidenceCalibration|ConfidenceCalibrationResult", ...targets], {
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
      !line.startsWith("docs/action-418-") &&
      !line.startsWith("scripts/action-418-") &&
      !line.startsWith("tests/e2e/action-418-") &&
      !line.startsWith(paths.approvedImplementation) &&
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
const action418 = exists(paths.action418Verifier) ? runJson(paths.action418Verifier) : null;
const action417 = exists(paths.action417Verifier) ? runJson(paths.action417Verifier) : null;
const protectedHashReadback = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [
  path,
  { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected },
]));
const forbiddenArtifactsFound = forbiddenImplementationArtifacts.filter(exists);
const runtimeConsumerFiles = runtimeConsumers();
const implementationMarkerHits = implementationMarkers();
const trackedAction419Evidence = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-419/.test(path))
  .filter((path) => /manifest|runner|run\.mjs|evidence|result|report|execution|shadow/.test(path))
  .filter((path) => ![paths.doc, paths.verifier, paths.test].includes(path));

const exactSignature = "export function calibrateConfidence(input: Readonly<{";

const checks = {
  documentation_exists: exists(paths.doc),
  documentation_contract_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  action418_decision_and_conditions: action418?.verification_status === "passed" &&
    action418?.approval_decision === "approved_with_conditions" &&
    action418?.failed_conditions_count === 0 &&
    action418?.unresolved_conditions?.includes("implementation_file_path_unapproved") &&
    action418?.unresolved_conditions?.includes("executable_fixture_package_unapproved") &&
    action418?.unresolved_conditions?.includes("implementation_independent_audit_future_work"),
  action417_action418_healthy: action417?.verification_status === "passed" &&
    action417?.readiness_decision === "ready" &&
    action418?.action417_readiness?.action416_package_hash === "ccbff3b786c62b0e56cd6300bae9a6950cba2ad15a3376f37dc7130d698477a8",
  exact_module_and_exports: doc.includes("`lib/pure-confidence-calibration.ts`") &&
    doc.includes("The only approved public runtime export is") &&
    doc.includes("`calibrateConfidence`") &&
    exactTypeExports.every((name) => doc.includes(`\`${name}\``)) &&
    doc.includes("seven names") &&
    doc.includes("No classes, services, repositories, caches, adapters"),
  exact_function_signature: doc.includes(exactSignature) &&
    doc.includes("configuration: FrozenConfidenceCalibrationConfiguration;") &&
    doc.includes("}>): ConfidenceCalibrationResult") &&
    doc.includes("synchronous, pure, immutable, deterministic"),
  input_envelope_contract_exact: [
    "pattern_discovery_sha256",
    "pattern_discovery_configuration_version",
    "pattern_discovery_result_sha256",
    "evidence_set_sha256",
    "group_sha256",
    "insight_id",
    "insight_sha256",
    "source_scenario_ids",
    "source_snapshot_ids",
    "anti_leakage_status",
  ].every((field) => doc.includes(`\`${field}\``)),
  configuration_contract_exact: doc.includes("confidence_scale_basis_points_per_point`: `100`") &&
    doc.includes("accepted_max_confidence_basis_points`: `10000`") &&
    doc.includes("positive_per_insight_cap_basis_points`: `200`") &&
    doc.includes("negative_per_insight_cap_basis_points`: `-300`") &&
    doc.includes("rounding_mode`: `round_half_away_from_zero`") &&
    doc.includes("Unknown configuration fields are `blocked_invalid_configuration`"),
  validation_order_exact: validationOrder.every((step, index) => doc.includes(`${index + 1}. ${step}`)),
  eligible_excluded_policy_exact: doc.includes("`discovered`") &&
    doc.includes("`discovered_with_warnings`") &&
    doc.includes("`insufficient_evidence`") &&
    doc.includes("`blocked_nondeterministic_grouping`") &&
    doc.includes("anti_leakage_status: \"passed\""),
  result_vocabulary_exact: resultVocabulary.every((status) => doc.includes(`\`${status}\``)) &&
    doc.includes("No new statuses may be added in Action 420"),
  issue_warning_contract_exact: doc.includes("code,\n  path,\n  severity,\n  messageKey") &&
    doc.includes("RFC 6901 JSON Pointers") &&
    doc.includes("Ordering is deterministic by `(severity, code, path, messageKey)`") &&
    doc.includes("Raw rejected values, timestamps, environment values, secrets"),
  warning_classification_exact: Object.entries(warningClassifications).every(([code, classification]) =>
    doc.includes(`\`${code}\``) && doc.includes(`\`${classification}\``)) &&
    doc.includes("Unknown warnings are `calibration_blocking`") &&
    doc.includes("return `blocked_invalid_input`"),
  delta_table_exact: Object.entries(deltaTableBasisPoints).every(([direction, delta]) =>
    doc.includes(`\`${direction}\``) && doc.includes(delta > 0 ? `\`+${delta}\`` : `\`${delta}\``)),
  attenuation_exact: doc.includes("Apply evidence-quality multiplier first, then warning attenuation in sorted warning-code order") &&
    doc.includes("`calibration_reducing` warnings use multiplier `1/2`") &&
    doc.includes("Signed midpoint rounding uses `round_half_away_from_zero`"),
  overlap_and_dedupe_exact: doc.includes("pattern_discovery_result_sha256") &&
    doc.includes("sorted `source_scenario_ids`") &&
    doc.includes("Materially conflicting overlapping evidence returns `blocked_overlapping_evidence`") &&
    doc.includes("Duplicate insight ID with different hash returns `blocked_invalid_lineage`"),
  aggregation_and_caps_exact: doc.includes("sum integer basis-point deltas") &&
    doc.includes("Combined positive delta caps at `+400` basis points") &&
    doc.includes("Combined negative delta caps at `-600` basis points") &&
    doc.includes("No iteration-order dependence is allowed"),
  confidence_rounding_bounds_exact: doc.includes("at most two decimal places") &&
    doc.includes("round_half_away_from_zero") &&
    doc.includes("valid base plus valid capped delta that crosses `0` or `10000` basis points is clamped") &&
    doc.includes("`confidence_clamped_to_bounds`"),
  zero_adjustment_exact: doc.includes("Return `no_adjustment` when eligible evidence is neutral, mixed, exactly balanced, attenuated to zero") &&
    doc.includes("Return `insufficient_eligible_evidence` when no eligible insight remains"),
  lineage_anti_leakage_exact: doc.includes("Missing or conflicting lineage returns `blocked_invalid_lineage`") &&
    doc.includes("No calibration value may feed back into its own evidence") &&
    doc.includes("Failed, unknown, or missing anti-leakage status blocks"),
  identity_hash_exact: doc.includes("`calibration_id` is `confidence_calibration_v1:` plus the first `24` hex characters") &&
    doc.includes("`calibration_hash` is SHA-256 of canonical JSON") &&
    doc.includes("schema marker `confidence_calibration_result_v1`") &&
    doc.includes("proposed delta basis points"),
  output_contract_exact: doc.includes("`non_authoritative: true`") &&
    doc.includes("`applied: false`") &&
    doc.includes("Output must not include a Recommendation object") &&
    doc.includes("recommendation-update command"),
  implementation_boundary_exact: doc.includes("Action 420 may add only") &&
    doc.includes("`lib/pure-confidence-calibration.ts`") &&
    doc.includes("`docs/action-420-pure-confidence-calibration-implementation.md`") &&
    doc.includes("`scripts/action-420-pure-confidence-calibration-implementation-verify.mjs`") &&
    doc.includes("`tests/e2e/action-420-pure-confidence-calibration-implementation.spec.ts`") &&
    doc.includes("Action 420 may not add a runner"),
  test_inventory_exact: doc.includes("valid single supportive insight") &&
    doc.includes("conflicting overlapping evidence") &&
    doc.includes("reordered insight determinism") &&
    doc.includes("no runtime/network/filesystem/environment"),
  fixture_sequencing_exact: doc.includes("Action 419 does not approve a fixture execution package") &&
    doc.includes("Action 422 may separately approve static fixture/hash-freeze and shadow execution"),
  mandatory_action421_exact: doc.includes("Action 421 must not modify implementation") &&
    doc.includes("No shadow execution may occur before Action 421"),
  approval_decision_recorded: doc.includes("Decision: `approved`") &&
    doc.includes("`action_420_pure_confidence_calibration_implementation`"),
  approved_implementation_module_present: exists(paths.approvedImplementation),
  no_unapproved_implementation_exists: forbiddenArtifactsFound.length === 0 &&
    implementationMarkerHits.length === 0,
  no_runner_or_manifest_exists: trackedAction419Evidence.length === 0,
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
    action418?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    doc.includes("Runtime preview remains `runtime_preview_waiting_for_operator_inputs`"),
};

const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  approval_decision: "approved",
  approval_vocabulary: ["approved", "approved_with_conditions", "blocked"],
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions: [
    "executable_fixture_package_unapproved",
    "implementation_independent_audit_future_work",
  ],
  action418_readiness: {
    verification_status: action418?.verification_status ?? null,
    approval_decision: action418?.approval_decision ?? null,
    failed_conditions_count: action418?.failed_conditions_count ?? null,
    unresolved_conditions: action418?.unresolved_conditions ?? [],
  },
  action417_readiness: {
    verification_status: action417?.verification_status ?? null,
    readiness_decision: action417?.readiness_decision ?? null,
    action416_scenario_count: action417?.action416_reproduction?.scenario_count ?? null,
    action416_executed_package_runs: action417?.action416_reproduction?.executed_package_runs ?? null,
    action416_package_hash: action417?.package_hashes?.run_1_package_sha256 ?? null,
  },
  approved_module: "lib/pure-confidence-calibration.ts",
  runtime_exports: ["calibrateConfidence"],
  type_exports: exactTypeExports,
  function_signature: "export function calibrateConfidence(input: Readonly<{ baseConfidence: number; insights: readonly ConfidenceCalibrationInsightEnvelope[]; configuration: FrozenConfidenceCalibrationConfiguration; }>): ConfidenceCalibrationResult",
  validation_order: validationOrder,
  result_vocabulary: resultVocabulary,
  warning_classifications: warningClassifications,
  delta_table_basis_points: deltaTableBasisPoints,
  attenuation_policy: {
    method: "integer_ratio_multiplication",
    quality_order: "quality_then_sorted_warning_codes",
    calibration_reducing_multiplier: "1/2",
    rounding_mode: "round_half_away_from_zero",
  },
  confidence_bounds: {
    input_min_basis_points: 0,
    input_max_basis_points: 10000,
    output_min_basis_points: 0,
    output_max_basis_points: 10000,
    precision_decimal_places: 2,
    invalid_base_behavior: "blocked_invalid_input",
    valid_delta_out_of_bounds_behavior: "clamp_with_confidence_clamped_to_bounds_warning",
  },
  aggregation_policy: {
    sort_key: [
      "pattern_discovery_configuration_version",
      "pattern_discovery_result_sha256",
      "evidence_set_sha256",
      "group_sha256",
      "insight_id",
      "insight_sha256",
    ],
    dedupe_key: "configuration_version|pattern_discovery_result_sha256|evidence_set_sha256|group_sha256|insight_id|insight_sha256",
    aggregate_method: "sort_filter_dedupe_resolve_overlap_calculate_sum_cap",
  },
  overlap_policy: {
    key_components: [
      "pattern_discovery_result_sha256",
      "evidence_set_sha256",
      "group_sha256",
      "insight_sha256",
      "source_scenario_ids",
      "source_snapshot_ids",
    ],
    conflict_behavior: "blocked_overlapping_evidence",
  },
  identity_hash_contract: {
    calibration_id_prefix: "confidence_calibration_v1:",
    calibration_id_hash_prefix_hex_length: 24,
    calibration_hash_algorithm: "sha256_canonical_json",
    schema_marker: "confidence_calibration_result_v1",
  },
  output_contract: {
    non_authoritative: true,
    applied: false,
    recommendation_object_allowed: false,
    persistence_instruction_allowed: false,
    ranking_output_allowed: false,
    scanner_output_allowed: false,
  },
  implementation_boundary: {
    action420_allowed_files: [
      "lib/pure-confidence-calibration.ts",
      "docs/action-420-pure-confidence-calibration-implementation.md",
      "scripts/action-420-pure-confidence-calibration-implementation-verify.mjs",
      "tests/e2e/action-420-pure-confidence-calibration-implementation.spec.ts",
    ],
    runner_approved: false,
    fixture_package_approved: false,
    runtime_adapter_approved: false,
    recommendation_consumer_approved: false,
  },
  approved_implementation_module_present: exists(paths.approvedImplementation),
  forbidden_artifacts_found: forbiddenArtifactsFound,
  implementation_marker_hits: implementationMarkerHits,
  tracked_action419_evidence_files: trackedAction419Evidence,
  runtime_consumer_files: runtimeConsumerFiles,
  source_integrity: protectedHashReadback,
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unrelated_work_classification: "action_419_docs_verifier_tests_and_minimal_guard_updates_only",
  recommended_next_action: failedChecks.length === 0
    ? "action_420_pure_confidence_calibration_implementation"
    : "resolve_action_419_implementation_approval_gate_failures",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failedChecks.length === 0 ? 0 : 1;
