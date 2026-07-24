#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  module: "lib/pure-confidence-calibration.ts",
  doc: "docs/action-423-pure-confidence-calibration-contract-remediation.md",
  verifier: "scripts/action-423-pure-confidence-calibration-contract-remediation-verify.mjs",
  test: "tests/e2e/action-423-pure-confidence-calibration-contract-remediation.spec.ts",
  action420Verifier: "scripts/action-420-pure-confidence-calibration-implementation-verify.mjs",
  action421Verifier: "scripts/action-421-independent-pure-confidence-calibration-verification-and-hash-audit-verify.mjs",
  action422Verifier: "scripts/action-422-pure-confidence-calibration-contract-remediation-approval-gate-verify.mjs",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
  action416Manifest: "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  action416Runner: "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
};

const expectedHashes = {
  [paths.module]: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action416Manifest]: "dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652",
  [paths.action416Runner]: "b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea",
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
const unsupportedStatuses = [
  "insufficient_evidence",
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_non_consumable_row",
  "blocked_nondeterministic_grouping",
  "arbitrary_unsupported_status",
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
const hash = (label) => createHash("sha256").update(label).digest("hex");

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function runJson(path) {
  const tempRoot = mkdtempSync(join(tmpdir(), "action-423-confidence-remediation-"));
  try {
    return JSON.parse(execFileSync("node", [abs(path)], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, TMPDIR: tempRoot, TMP: tempRoot, TEMP: tempRoot },
      timeout: 240000,
    }));
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonical(value));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

const source = exists(paths.module) ? read(paths.module) : "";
const doc = exists(paths.doc) ? read(paths.doc) : "";
const moduleExports = exists(paths.module) ? await import(pathToFileURL(abs(paths.module)).href) : {};
const calibrateConfidence = moduleExports.calibrateConfidence;

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

function withInsight(id, insightOverrides = {}, envelopeOverrides = {}) {
  const base = envelope(id);
  return {
    ...base,
    ...envelopeOverrides,
    insight: { ...base.insight, ...insightOverrides },
  };
}

function calibrate(input) {
  return calibrateConfidence(input);
}

function unsupportedInput(status, overrides = {}) {
  return {
    baseConfidence: 50,
    insights: [envelope(`unsupported-${status}`, { pattern_discovery_status: status, ...overrides })],
    configuration: config,
  };
}

const unsupportedResults = Object.fromEntries(unsupportedStatuses.map((status) => [
  status,
  calibrate(unsupportedInput(status)),
]));

const uniqueWarning = calibrate({ baseConfidence: 50, insights: [envelope("duplicate-warning", { warning_codes: ["duplicate_mapper_row_identity"] })], configuration: config });
const doubleWarning = calibrate({ baseConfidence: 50, insights: [envelope("duplicate-warning", { warning_codes: ["duplicate_mapper_row_identity", "duplicate_mapper_row_identity"] })], configuration: config });
const tripleWarning = calibrate({ baseConfidence: 50, insights: [envelope("duplicate-warning", { warning_codes: ["duplicate_mapper_row_identity", "duplicate_mapper_row_identity", "duplicate_mapper_row_identity"] })], configuration: config });
const twoDistinctWarnings = calibrate({ baseConfidence: 50, insights: [envelope("two-distinct-warnings", { warning_codes: ["duplicate_mapper_row_identity", "metric_value_unavailable"] })], configuration: config });
const warningOrderA = calibrate({ baseConfidence: 50, insights: [envelope("warning-order", { warning_codes: ["metric_value_unavailable", "duplicate_mapper_row_identity"] })], configuration: config });
const warningOrderB = calibrate({ baseConfidence: 50, insights: [envelope("warning-order", { warning_codes: ["duplicate_mapper_row_identity", "metric_value_unavailable"] })], configuration: config });
const contradictoryDuplicate = calibrate({ baseConfidence: 50, insights: [envelope("contradictory-duplicate", { warning_codes: ["minimum_total_support_not_met", "minimum_total_support_not_met"] })], configuration: config });

const supportive = calibrate({ baseConfidence: 50, insights: [envelope("supportive")], configuration: config });
const adverse = calibrate({ baseConfidence: 50, insights: [withInsight("adverse", { evidence_direction: "adverse_strong" })], configuration: config });
const neutral = calibrate({ baseConfidence: 50, insights: [withInsight("neutral", { evidence_direction: "neutral" })], configuration: config });
const mixed = calibrate({ baseConfidence: 50, insights: [withInsight("mixed", { evidence_direction: "mixed" })], configuration: config });
const positiveCap = calibrate({ baseConfidence: 50, insights: [envelope("cap-a"), envelope("cap-b"), envelope("cap-c")], configuration: config });
const negativeCap = calibrate({ baseConfidence: 50, insights: [withInsight("neg-a", { evidence_direction: "adverse_strong" }), withInsight("neg-b", { evidence_direction: "adverse_strong" }), withInsight("neg-c", { evidence_direction: "adverse_strong" })], configuration: config });
const overlapConflict = (() => {
  const first = envelope("overlap-a");
  return calibrate({ baseConfidence: 50, insights: [first, withInsight("overlap-b", { evidence_direction: "adverse_strong" }, { pattern_discovery_result_sha256: first.pattern_discovery_result_sha256, evidence_set_sha256: first.evidence_set_sha256 })], configuration: config });
})();
const upperClamp = calibrate({ baseConfidence: 99, insights: [envelope("upper")], configuration: config });
const lowerClamp = calibrate({ baseConfidence: 1, insights: [withInsight("lower", { evidence_direction: "adverse_strong" })], configuration: config });

const frozenInput = deepFreeze({ baseConfidence: 50, insights: [envelope("immutable")], configuration: JSON.parse(JSON.stringify(config)) });
const frozenBefore = canonicalJson(frozenInput);
const frozenFirst = calibrate(frozenInput);
const frozenSecond = calibrate(frozenInput);
calibrate({ baseConfidence: 50, insights: [withInsight("interleaved", { evidence_direction: "adverse_strong" })], configuration: config });
const frozenThird = calibrate(frozenInput);
const reorderedA = calibrate({ baseConfidence: 50, insights: [envelope("reorder-a"), envelope("reorder-b")], configuration: config });
const reorderedB = calibrate({ baseConfidence: 50, insights: [envelope("reorder-b"), envelope("reorder-a")], configuration: config });

function runtimeConsumers() {
  const targets = ["app", "public", "proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"].filter(exists);
  const scan = spawnSync("rg", ["-l", "pure-confidence-calibration|action-423|calibrateConfidence", ...targets], {
    cwd: root,
    encoding: "utf8",
  });
  if (![0, 1].includes(scan.status ?? -1)) return ["runtime_consumer_scan_failed"];
  return scan.stdout.trim().split("\n").filter(Boolean);
}

const sourceIntegrity = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [
  path,
  { expected, actual: exists(path) ? shaFile(path) : null, unchanged: exists(path) && shaFile(path) === expected },
]));
const typeExports = [...source.matchAll(/^export type (\w+)/gm)].map((match) => match[1]);
const functionExports = [...source.matchAll(/^export function (\w+)/gm)].map((match) => match[1]);
const runtimeConsumerFiles = runtimeConsumers();
const forbiddenAction423Artifacts = [
  "docs/action-423-pure-confidence-calibration-fixture-manifest.json",
  "docs/action-423-pure-confidence-calibration-input-manifest.json",
  "scripts/action-423-pure-confidence-calibration-run.mjs",
  "scripts/action-423-pure-confidence-calibration-shadow-run.mjs",
  "app/api/action-423",
  "app/action-423",
  "public/action-423-runtime-preview.json",
].filter(exists);
const trackedAction423Evidence = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests")]
  .filter((path) => /action-423/.test(path))
  .filter((path) => /fixture|runner|shadow|manifest|runtime|provider|supabase|persistence|replay|feedback|recommendation|scanner|ranking/i.test(path))
  .filter((path) => ![paths.doc, paths.verifier, paths.test].includes(path));

const action420 = exists(paths.action420Verifier) ? runJson(paths.action420Verifier) : null;
const action421 = exists(paths.action421Verifier) ? runJson(paths.action421Verifier) : null;
const action422 = exists(paths.action422Verifier) ? runJson(paths.action422Verifier) : null;

const unsupportedChecks = Object.fromEntries(Object.entries(unsupportedResults).map(([status, result]) => [
  status,
  result.status === "blocked_unsupported_insight" &&
    result.proposed_delta === null &&
    result.proposed_calibrated_confidence === null &&
    result.included_insight_ids.length === 0 &&
    result.issues.length === 1 &&
    result.issues[0].code === "ineligible_pattern_discovery_status" &&
    result.issues[0].path === "/insights/0/pattern_discovery_status" &&
    result.issues[0].severity === "error" &&
    result.issues[0].messageKey === "confidence_calibration.ineligible_pattern_discovery_status" &&
    !canonicalJson(result).includes(status),
]));

const validationPrecedence = {
  unsupported_over_invalid_insight: calibrate(unsupportedInput("unsupported_precedence", { insight: { setup_family: "momentum_continuation" } })).status === "blocked_unsupported_insight",
  unsupported_over_invalid_lineage: calibrate(unsupportedInput("unsupported_precedence", { pattern_discovery_sha256: "bad" })).status === "blocked_unsupported_insight",
  unsupported_over_failed_leakage: calibrate(unsupportedInput("unsupported_precedence", { anti_leakage_status: "failed" })).status === "blocked_unsupported_insight",
  unsupported_over_warning_contradiction: calibrate(unsupportedInput("unsupported_precedence", { warning_codes: ["minimum_total_support_not_met"] })).status === "blocked_unsupported_insight",
  unsupported_over_evidence_quality: calibrate(unsupportedInput("unsupported_precedence", { insight: { ...envelope("x").insight, evidence_quality: "blocked" } })).status === "blocked_unsupported_insight",
  unsupported_over_overlap_conflict: (() => {
    const first = envelope("unsupported-overlap-a", { pattern_discovery_status: "unsupported_precedence" });
    const second = withInsight("unsupported-overlap-b", { evidence_direction: "adverse_strong" }, {
      pattern_discovery_status: "unsupported_precedence",
      pattern_discovery_result_sha256: first.pattern_discovery_result_sha256,
      evidence_set_sha256: first.evidence_set_sha256,
    });
    return calibrate({ baseConfidence: 50, insights: [first, second], configuration: config }).status === "blocked_unsupported_insight";
  })(),
};

const warningEquivalence = {
  duplicate_double_equals_unique: canonicalJson(doubleWarning) === canonicalJson(uniqueWarning),
  duplicate_triple_equals_unique: canonicalJson(tripleWarning) === canonicalJson(uniqueWarning),
  one_reducing_warning_delta: uniqueWarning.proposed_delta === 1,
  two_distinct_reducing_warnings_delta: twoDistinctWarnings.proposed_delta === 0.5,
  warning_order_stable: canonicalJson(warningOrderA) === canonicalJson(warningOrderB),
  duplicate_contradictory_blocks_once: contradictoryDuplicate.status === "blocked_invalid_input" &&
    contradictoryDuplicate.issues.length === 1 &&
    contradictoryDuplicate.issues[0].code === "warning_status_contradiction",
};

const preservation = {
  result_vocabulary: expectedStatuses.every((status) => source.includes(`"${status}"`)),
  exports: JSON.stringify(typeExports) === JSON.stringify(expectedTypeExports) &&
    JSON.stringify(functionExports) === JSON.stringify(["calibrateConfidence"]) &&
    typeof calibrateConfidence === "function",
  supportive: supportive.status === "calibrated" && supportive.proposed_delta === 2 && supportive.proposed_calibrated_confidence === 52,
  adverse: adverse.status === "calibrated" && adverse.proposed_delta === -3,
  neutral: neutral.status === "no_adjustment" && neutral.proposed_delta === 0,
  mixed: mixed.status === "no_adjustment" && mixed.proposed_delta === 0,
  caps: positiveCap.proposed_delta === 4 && negativeCap.proposed_delta === -6,
  overlap: overlapConflict.status === "blocked_overlapping_evidence",
  bounds: upperClamp.proposed_calibrated_confidence === 100 &&
    lowerClamp.proposed_calibrated_confidence === 0 &&
    upperClamp.warnings.some((item) => item.code === "confidence_clamped_to_bounds") &&
    lowerClamp.warnings.some((item) => item.code === "confidence_clamped_to_bounds"),
  identity_prefix: supportive.calibration_id?.startsWith("confidence_calibration_v1:") === true,
  immutability: canonicalJson(frozenInput) === frozenBefore,
  determinism: canonicalJson(frozenFirst) === canonicalJson(frozenSecond) &&
    canonicalJson(frozenFirst) === canonicalJson(frozenThird) &&
    canonicalJson(reorderedA) === canonicalJson(reorderedB),
};

const checks = {
  documentation_exists: exists(paths.doc) &&
    doc.includes("Action 422 approved") &&
    doc.includes("Action 424 - Independent Post-Remediation Confidence Calibration Verification"),
  source_integrity: Object.values(sourceIntegrity).every((item) => item.unchanged),
  unsupported_statuses: Object.values(unsupportedChecks).every(Boolean),
  validation_precedence: Object.values(validationPrecedence).every(Boolean),
  warning_deduplication_and_attenuation: Object.values(warningEquivalence).every(Boolean),
  preservation: Object.values(preservation).every(Boolean),
  action420_healthy: action420?.verification_status === "passed",
  action421_healthy: action421?.verification_status === "passed" &&
    action421?.readiness_decision === "ready_with_conditions" &&
    action421?.failed_conditions_count === 0,
  action422_healthy: action422?.verification_status === "passed" &&
    action422?.approval_decision === "approved",
  no_forbidden_artifacts: forbiddenAction423Artifacts.length === 0 && trackedAction423Evidence.length === 0,
  no_runtime_consumers: runtimeConsumerFiles.length === 0,
  no_effect_flags_false: Object.values(noEffectFlags).every((value) => value === false),
};

const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([name]) => name);

const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  remediation_status: failedChecks.length === 0 ? "implemented" : "blocked",
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unsupported_status_checks: unsupportedChecks,
  validation_precedence: validationPrecedence,
  warning_equivalence: warningEquivalence,
  preservation,
  source_integrity: sourceIntegrity,
  upstream: {
    action420_verification_status: action420?.verification_status ?? null,
    action421_verification_status: action421?.verification_status ?? null,
    action421_readiness_decision: action421?.readiness_decision ?? null,
    action422_verification_status: action422?.verification_status ?? null,
    action422_approval_decision: action422?.approval_decision ?? null,
  },
  forbidden_action423_artifacts: forbiddenAction423Artifacts,
  tracked_action423_evidence_files: trackedAction423Evidence,
  runtime_consumer_files: runtimeConsumerFiles,
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  runtime_preview_route_changed: false,
  runtime_preview_candidate_advanced: false,
  fixture_or_hash_freeze_allowed_next: false,
  mandatory_followup_action: "Action 424 - Independent Post-Remediation Confidence Calibration Verification",
  recommended_next_action: "action_424_independent_post_remediation_confidence_calibration_verification",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
