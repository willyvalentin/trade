#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  module: "lib/pure-confidence-calibration.ts",
  doc: "docs/action-420-pure-confidence-calibration-implementation.md",
  verifier: "scripts/action-420-pure-confidence-calibration-implementation-verify.mjs",
  test: "tests/e2e/action-420-pure-confidence-calibration-implementation.spec.ts",
  action418Verifier: "scripts/action-418-pure-confidence-calibration-contract-and-pattern-insight-compatibility-approval-gate-verify.mjs",
  action419Verifier: "scripts/action-419-pure-confidence-calibration-implementation-approval-gate-verify.mjs",
  action416Manifest: "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  action416Runner: "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
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

const expectedTypeExports = [
  "ConfidenceCalibrationInsightEnvelope",
  "FrozenConfidenceCalibrationConfiguration",
  "ConfidenceCalibrationIssue",
  "ConfidenceCalibrationWarning",
  "ConfidenceCalibrationEvidenceSummary",
  "ConfidenceCalibrationAdjustment",
  "ConfidenceCalibrationResult",
];
const expectedStatuses = [
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
const noEffectFlags = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_integration_executed: false,
  calibration_shadow_executed: false,
  recommendation_mutation_executed: false,
  feedback_executed: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  runtime_preview_advanced: false,
};

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

const source = exists(paths.module) ? read(paths.module) : "";
const doc = exists(paths.doc) ? read(paths.doc) : "";
const action418 = exists(paths.action418Verifier) ? runJson(paths.action418Verifier) : null;
const action419 = exists(paths.action419Verifier) ? runJson(paths.action419Verifier) : null;
const moduleExports = exists(paths.module)
  ? await import(pathToFileURL(abs(paths.module)).href)
  : {};
const typeExports = [...source.matchAll(/^export type (\w+)/gm)].map((match) => match[1]);
const functionExports = [...source.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);
const forbiddenArtifactsFound = [
  "docs/action-420-pure-confidence-calibration-implementation-manifest.json",
  "docs/action-420-pure-confidence-calibration-input-manifest.json",
  "scripts/action-420-pure-confidence-calibration-run.mjs",
  "scripts/action-420-confidence-calibration-runner.mjs",
  "scripts/action-420-pure-confidence-calibration-shadow-run.mjs",
].filter(exists);
const trackedAction420Evidence = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-420/.test(path))
  .filter((path) => /manifest|runner|shadow|evidence|result|report|execution/.test(path))
  .filter((path) => ![paths.doc, paths.verifier, paths.test].includes(path));
const runtimeConsumerFiles = runtimeConsumers();
const protectedHashReadback = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [
  path,
  { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected },
]));

const config = {
  configuration_version: "confidence_calibration_config_v1",
  confidence_scale_basis_points_per_point: 100,
  accepted_min_confidence_basis_points: 0,
  accepted_max_confidence_basis_points: 10000,
  output_decimal_precision: 2,
  positive_per_insight_cap_basis_points: 200,
  negative_per_insight_cap_basis_points: -300,
  combined_positive_cap_basis_points: 400,
  combined_negative_cap_basis_points: -600,
  minimum_total_support: 20,
  minimum_unique_snapshot_support: 20,
  minimum_completed_outcomes: 20,
  accepted_setup_families: ["momentum_continuation"],
  accepted_horizons: ["60m"],
  warning_classification_table: {
    duplicate_mapper_row_identity: "calibration_reducing",
    metric_value_unavailable: "calibration_reducing",
    minimum_total_support_not_met: "calibration_blocking",
    minimum_completed_outcomes_not_met: "calibration_blocking",
  },
  warning_attenuation_table: {
    duplicate_mapper_row_identity: { numerator: 1, denominator: 2 },
    metric_value_unavailable: { numerator: 1, denominator: 2 },
  },
  evidence_quality_table: {
    verified_high: { numerator: 1, denominator: 1 },
    verified_usable: { numerator: 1, denominator: 2 },
    verified_limited: { numerator: 1, denominator: 4 },
    blocked: "blocked",
  },
  direction_delta_table: {
    supportive_strong: 200,
    supportive_moderate: 100,
    supportive_weak: 50,
    neutral: 0,
    mixed: 0,
    adverse_weak: -100,
    adverse_moderate: -200,
    adverse_strong: -300,
  },
  overlap_resolution_policy: "action_419_overlap_v1",
  deterministic_sorting_policy: "action_419_sort_v1",
  rounding_mode: "round_half_away_from_zero",
  confidence_bound_policy: "clamp_valid_delta_to_bounds",
};

function hash(label) {
  return createHash("sha256").update(label).digest("hex");
}

function envelope(id, overrides = {}) {
  return {
    pattern_discovery_sha256: hash("pattern-discovery"),
    pattern_discovery_configuration_version: "pattern_discovery_setup_family_v1",
    pattern_discovery_result_sha256: hash(`result:${id}`),
    evidence_set_sha256: hash(`evidence:${id}`),
    group_sha256: hash(`group:${id}`),
    insight_id: `pattern_insight:v1:${id}`,
    insight_sha256: hash(`insight:${id}`),
    source_scenario_ids: [`scenario:${id}`],
    source_snapshot_ids: [`snapshot:${id}`],
    pattern_discovery_status: "discovered",
    warning_codes: [],
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    anti_leakage_status: "passed",
    insight: {
      setup_family: "momentum_continuation",
      horizon: "60m",
      evidence_direction: "supportive_strong",
      evidence_quality: "verified_high",
      total_support: 20,
      unique_snapshot_support: 20,
      completed_outcome_count: 20,
    },
    ...overrides,
  };
}

function calibrate(input) {
  return moduleExports.calibrateConfidence(input);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

const validSupportive = calibrate({ baseConfidence: 50, insights: [envelope("supportive")], configuration: config });
const validAdverse = calibrate({ baseConfidence: 50, insights: [envelope("adverse", { insight: { ...envelope("x").insight, evidence_direction: "adverse_strong" } })], configuration: config });
const warningAttenuated = calibrate({ baseConfidence: 50, insights: [envelope("warn", { warning_codes: ["metric_value_unavailable"] })], configuration: config });
const multiWarning = calibrate({ baseConfidence: 50, insights: [envelope("multi-warn", { warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"] })], configuration: config });
const neutral = calibrate({ baseConfidence: 50, insights: [envelope("neutral", { insight: { ...envelope("x").insight, evidence_direction: "neutral" } })], configuration: config });
const mixed = calibrate({ baseConfidence: 50, insights: [envelope("mixed", { insight: { ...envelope("x").insight, evidence_direction: "mixed" } })], configuration: config });
const insufficient = calibrate({ baseConfidence: 50, insights: [envelope("insufficient", { pattern_discovery_status: "insufficient_evidence" })], configuration: config });
const blockedStatus = calibrate({ baseConfidence: 50, insights: [envelope("blocked", { pattern_discovery_status: "blocked_future_leakage" })], configuration: config });
const duplicate = calibrate({ baseConfidence: 50, insights: [envelope("dup"), envelope("dup")], configuration: config });
const sameEvidence = (() => {
  const first = envelope("same-a");
  const second = envelope("same-b", { evidence_set_sha256: first.evidence_set_sha256, pattern_discovery_result_sha256: first.pattern_discovery_result_sha256 });
  return calibrate({ baseConfidence: 50, insights: [second, first], configuration: config });
})();
const conflict = (() => {
  const first = envelope("conflict-a");
  const second = envelope("conflict-b", {
    evidence_set_sha256: first.evidence_set_sha256,
    pattern_discovery_result_sha256: first.pattern_discovery_result_sha256,
    insight: { ...envelope("x").insight, evidence_direction: "adverse_strong" },
  });
  return calibrate({ baseConfidence: 50, insights: [first, second], configuration: config });
})();
const combinedPositive = calibrate({
  baseConfidence: 50,
  insights: [envelope("p1"), envelope("p2"), envelope("p3")],
  configuration: config,
});
const combinedNegative = calibrate({
  baseConfidence: 50,
  insights: ["n1", "n2", "n3"].map((id) => envelope(id, { insight: { ...envelope("x").insight, evidence_direction: "adverse_strong" } })),
  configuration: config,
});
const upperClamp = calibrate({ baseConfidence: 99, insights: [envelope("upper")], configuration: config });
const lowerClamp = calibrate({ baseConfidence: 1, insights: [envelope("lower", { insight: { ...envelope("x").insight, evidence_direction: "adverse_strong" } })], configuration: config });
const badPrecision = calibrate({ baseConfidence: 10.123, insights: [envelope("bad-precision")], configuration: config });
const badConfig = calibrate({ baseConfidence: 50, insights: [envelope("bad-config")], configuration: { ...config, output_decimal_precision: 3 } });
const badLineage = calibrate({ baseConfidence: 50, insights: [envelope("bad-lineage", { insight_sha256: "bad" })], configuration: config });
const badLeakage = calibrate({ baseConfidence: 50, insights: [envelope("bad-leakage", { anti_leakage_status: "failed" })], configuration: config });
const contradictory = calibrate({ baseConfidence: 50, insights: [envelope("contradict", { warning_codes: ["minimum_total_support_not_met"] })], configuration: config });
const unsupported = calibrate({ baseConfidence: 50, insights: [envelope("unsupported", { insight: { ...envelope("x").insight, evidence_direction: "unsupported" } })], configuration: config });
const balanced = calibrate({
  baseConfidence: 50,
  insights: [
    envelope("bal-pos", { insight: { ...envelope("x").insight, evidence_direction: "supportive_moderate" } }),
    envelope("bal-neg", { insight: { ...envelope("x").insight, evidence_direction: "adverse_weak" } }),
  ],
  configuration: config,
});
const limitedZero = calibrate({ baseConfidence: 50, insights: [envelope("limited-zero", { insight: { ...envelope("x").insight, evidence_direction: "supportive_weak", evidence_quality: "verified_limited" }, warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"] })], configuration: config });
const immutableInput = deepFreeze({ baseConfidence: 50, insights: [envelope("immutable")], configuration: clone(config) });
const immutableBefore = JSON.stringify(immutableInput);
const immutableFirst = calibrate(immutableInput);
const immutableSecond = calibrate(immutableInput);
const reorderedA = calibrate({ baseConfidence: 50, insights: [envelope("r1"), envelope("r2"), envelope("r3")], configuration: config });
const reorderedB = calibrate({ baseConfidence: 50, insights: [envelope("r3"), envelope("r1"), envelope("r2")], configuration: config });

function runtimeConsumers() {
  const targets = ["app", "public", "proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].filter(exists);
  const scan = spawnSync("rg", ["-l", "pure-confidence-calibration|action-420|calibrateConfidence", ...targets], {
    cwd: root,
    encoding: "utf8",
  });
  if (![0, 1].includes(scan.status ?? -1)) return ["runtime_consumer_scan_failed"];
  return scan.stdout.trim().split("\n").filter(Boolean);
}

function sourceAvoidsForbiddenAccess() {
  return !/process\.env|Date\.|Math\.random|fetch\(|console\.|from ["'](?:node:)?fs|@supabase|createClient|TWELVE_DATA|next\/server/i.test(source);
}

function sameStableIds(left, right) {
  return left.calibration_id === right.calibration_id && left.calibration_hash === right.calibration_hash;
}

const checks = {
  implementation_module_exists: exists(paths.module),
  documentation_exists: exists(paths.doc),
  exact_runtime_export: Object.keys(moduleExports).sort().join(",") === "calibrateConfidence" &&
    typeof moduleExports.calibrateConfidence === "function",
  exact_type_exports: JSON.stringify(typeExports) === JSON.stringify(expectedTypeExports),
  exact_function_signature: functionExports.length === 1 &&
    functionExports[0] === "calibrateConfidence" &&
    source.includes("export function calibrateConfidence(input: Readonly<{") &&
    source.includes("configuration: FrozenConfidenceCalibrationConfiguration;") &&
    source.includes("}>): ConfidenceCalibrationResult"),
  no_forbidden_imports_or_access: sourceAvoidsForbiddenAccess(),
  validation_and_result_vocabulary: expectedStatuses.every((status) => source.includes(`\"${status}\"`) || source.includes(`"${status}"`)),
  supportive_adverse_neutral_mixed: validSupportive.status === "calibrated" &&
    validSupportive.proposed_delta === 2 &&
    validAdverse.status === "calibrated" &&
    validAdverse.proposed_delta === -3 &&
    neutral.status === "no_adjustment" &&
    mixed.status === "no_adjustment",
  warning_attenuation: warningAttenuated.status === "calibrated_with_warnings" &&
    warningAttenuated.proposed_delta === 1 &&
    multiWarning.proposed_delta === 0.5 &&
    multiWarning.warnings.length === 2,
  status_and_blocking_validation: insufficient.status === "blocked_unsupported_insight" &&
    blockedStatus.status === "blocked_unsupported_insight" &&
    badPrecision.status === "blocked_invalid_input" &&
    badConfig.status === "blocked_invalid_configuration" &&
    badLineage.status === "blocked_invalid_lineage" &&
    badLeakage.status === "blocked_future_leakage" &&
    contradictory.status === "blocked_invalid_input" &&
    unsupported.status === "blocked_unsupported_insight",
  duplicate_overlap_aggregation: duplicate.included_insight_ids.length === 1 &&
    duplicate.overlap_summary.deduplicated_count === 1 &&
    sameEvidence.included_insight_ids.length === 1 &&
    sameEvidence.overlap_summary.overlapping_excluded_count === 1 &&
    conflict.status === "blocked_overlapping_evidence" &&
    combinedPositive.proposed_delta === 4 &&
    combinedNegative.proposed_delta === -6,
  confidence_bounds_and_zero: upperClamp.proposed_calibrated_confidence === 100 &&
    lowerClamp.proposed_calibrated_confidence === 0 &&
    upperClamp.warnings.some((item) => item.code === "confidence_clamped_to_bounds") &&
    lowerClamp.warnings.some((item) => item.code === "confidence_clamped_to_bounds") &&
    balanced.status === "no_adjustment" &&
    limitedZero.status === "calibrated_with_warnings" &&
    limitedZero.proposed_delta === 0.04,
  advisory_output_identity_hash: validSupportive.calibration_id?.startsWith("confidence_calibration_v1:") === true &&
    /^[a-f0-9]{64}$/.test(validSupportive.calibration_hash ?? "") &&
    validSupportive.calibration_id?.slice("confidence_calibration_v1:".length).length === 24 &&
    validSupportive.non_authoritative === true &&
    validSupportive.applied === false &&
    !("recommendation" in validSupportive),
  immutability_and_determinism: JSON.stringify(immutableInput) === immutableBefore &&
    JSON.stringify(immutableFirst) === JSON.stringify(immutableSecond) &&
    sameStableIds(reorderedA, reorderedB) &&
    JSON.stringify(reorderedA) === JSON.stringify(reorderedB),
  no_runner_manifest_shadow_or_runtime: forbiddenArtifactsFound.length === 0 &&
    trackedAction420Evidence.length === 0 &&
    runtimeConsumerFiles.length === 0,
  upstream_gates_healthy: action418?.verification_status === "passed" &&
    action419?.verification_status === "passed" &&
    action419?.approval_decision === "approved",
  protected_sources_unchanged: Object.values(protectedHashReadback).every((entry) => entry.unchanged),
  runtime_preview_untouched: action418?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    action419?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    doc.includes("Runtime preview remains `runtime_preview_waiting_for_operator_inputs`"),
};

const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  implementation_status: "implemented_static_pure_not_shadowed",
  checks,
  failed_checks: failedChecks,
  runtime_exports: Object.keys(moduleExports).sort(),
  type_exports: typeExports,
  validation_order_phases: 17,
  result_vocabulary: expectedStatuses,
  behavior_samples: {
    valid_supportive: validSupportive,
    warning_attenuated: warningAttenuated,
    conflict_status: conflict.status,
    combined_positive_delta: combinedPositive.proposed_delta,
    combined_negative_delta: combinedNegative.proposed_delta,
    upper_clamp_warning: upperClamp.warnings.map((item) => item.code),
    lower_clamp_warning: lowerClamp.warnings.map((item) => item.code),
  },
  forbidden_artifacts_found: forbiddenArtifactsFound,
  tracked_action420_evidence_files: trackedAction420Evidence,
  runtime_consumer_files: runtimeConsumerFiles,
  source_integrity: protectedHashReadback,
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unresolved_conditions: [
    "executable_fixture_package_unapproved",
    "implementation_independent_audit_future_work",
  ],
  unrelated_work_classification: "action_420_pure_module_docs_verifier_tests_and_minimal_guard_updates_only",
  recommended_next_action: failedChecks.length === 0
    ? "action_421_independent_pure_confidence_calibration_verification"
    : "resolve_action_420_implementation_failures",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failedChecks.length === 0 ? 0 : 1;
