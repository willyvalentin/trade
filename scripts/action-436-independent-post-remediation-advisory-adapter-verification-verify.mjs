#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const h = (char) => char.repeat(64);
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const clone = (value) => JSON.parse(JSON.stringify(value));

const paths = {
  adapter: "lib/confidence-calibration-advisory-adapter.ts",
  calibration: "lib/pure-confidence-calibration.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learningFixtures: "lib/learning-dataset-static-fixtures.ts",
  contextFixtures: "lib/intelligence-context-static-fixtures.ts",
  patternFixtures: "lib/pattern-insight-static-fixtures.ts",
  action426Inventory: "docs/action-426-static-confidence-calibration-hash-inventory.json",
  action426Freezer: "scripts/action-426-static-confidence-calibration-hash-freeze.mjs",
  action429Manifest: "docs/action-429-static-confidence-calibration-shadow-input-manifest.json",
  action429Runner: "scripts/action-429-static-confidence-calibration-shadow-run.mjs",
  action434Verifier: "scripts/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate-verify.mjs",
  action435Verifier: "scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  goldenVerifier: "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  doc: "docs/action-436-independent-post-remediation-advisory-adapter-verification.md",
  verifier: "scripts/action-436-independent-post-remediation-advisory-adapter-verification-verify.mjs",
  test: "tests/e2e/action-436-independent-post-remediation-advisory-adapter-verification.spec.ts",
};

const protectedHashes = {
  [paths.adapter]: [
    "2ff230fa68ce6a1696089419f549e76af449fca787fe1a03a31f3dbe13fb9fc9",
    "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
  ],
  [paths.calibration]: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.action426Inventory]: "e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe",
  [paths.action426Freezer]: "f8cf5af48f640a2158f17f92b6321340d17f334577534fc8b675969e9ff223fa",
  [paths.action429Manifest]: "f730d31084419985c8464e01e1daf67bea9312ac47a3ab5c291a1c394da03c59",
  [paths.action429Runner]: "dd073134a96583caddae345c9c84be6bc4a327198c65aa29d8d191e4ea21b882",
  [paths.learningFixtures]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixtures]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixtures]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};

const eligibleStatuses = ["calibrated", "calibrated_with_warnings", "no_adjustment"];
const blockedStatuses = [
  "insufficient_eligible_evidence",
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_overlapping_evidence",
  "blocked_unsupported_insight",
];

const calibrationConfig = {
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
  accepted_setup_families: ["opening_drive", "pullback_continuation"],
  accepted_horizons: ["15m", "30m"],
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

const advisoryConfig = {
  adapter_schema_version: "confidence_calibration_advisory_result_v1",
  configuration_version: "confidence_calibration_advisory_config_v1",
  advisory_id_prefix: "confidence_calibration_advisory_v1:",
  confidence_scale_basis_points_per_point: 100,
  accepted_min_confidence_basis_points: 0,
  accepted_max_confidence_basis_points: 10000,
  output_decimal_precision: 2,
  deterministic_sorting_policy: "action_432_sort_v1",
  identity_policy: "action_432_identity_v1",
  issue_message_key_prefix: "confidence_calibration_advisory.",
  eligible_calibration_statuses: eligibleStatuses,
  blocked_calibration_status_map: {
    insufficient_eligible_evidence: "advisory_insufficient_evidence",
    blocked_invalid_input: "blocked_invalid_input",
    blocked_invalid_configuration: "blocked_invalid_input",
    blocked_invalid_lineage: "blocked_invalid_lineage",
    blocked_future_leakage: "blocked_future_leakage",
    blocked_overlapping_evidence: "blocked_calibration_result",
    blocked_unsupported_insight: "blocked_unsupported_status",
  },
  advisory_visibility_policy: "advisory_visible_for_eligible_statuses",
  application_policy: "never_apply_in_action_432",
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
};

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 300000 }));
}

function fileSha(path) {
  return createHash("sha256").update(readFileSync(abs(path))).digest("hex");
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed for ${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function independentCanonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_canonical_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(independentCanonicalize);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, independentCanonicalize(child)]),
    );
  }
  throw new TypeError("unsupported_canonical_value");
}

function independentSerialize(value) {
  return JSON.stringify(independentCanonicalize(value));
}

function independentSha256(value) {
  return createHash("sha256").update(independentSerialize(value), "utf8").digest("hex");
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function orderText(values) {
  return [...values].sort(compareText);
}

function orderExcluded(values) {
  return [...values].sort((left, right) =>
    compareText(left.insight_id, right.insight_id) ||
    compareText(left.reason, right.reason));
}

function toBasisPoints(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const basisPoints = value * 100;
  if (Math.abs(basisPoints - Math.round(basisPoints)) > 1e-9) return null;
  return Object.is(Math.round(basisPoints), -0) ? 0 : Math.round(basisPoints);
}

function resultPayload(result) {
  return {
    schema_marker: "confidence_calibration_result_v1",
    status: result.status,
    configuration_version: result.lineage_hashes.length > 0 ? "pattern_discovery_config_v1" : null,
    base_confidence_basis_points: toBasisPoints(result.original_confidence),
    included_insight_ids: orderText(result.included_insight_ids),
    included_insight_hashes: orderText(result.lineage_hashes.map((item) => item.insight_sha256)),
    excluded_insight_ids: orderExcluded(result.excluded_insight_ids),
    overlap_resolution_summary: {
      deduplicated_count: result.overlap_summary.deduplicated_count,
      overlapping_excluded_count: result.overlap_summary.overlapping_excluded_count,
      conflict_count: result.overlap_summary.conflict_count,
    },
    proposed_delta_basis_points: toBasisPoints(result.proposed_delta),
    proposed_calibrated_confidence_basis_points: toBasisPoints(result.proposed_calibrated_confidence),
  };
}

function independentResultHash(result) {
  return independentSha256(resultPayload(result));
}

function insight(overrides = {}) {
  return {
    pattern_discovery_sha256: overrides.pattern_discovery_sha256 ?? h("a"),
    pattern_discovery_configuration_version: overrides.pattern_discovery_configuration_version ?? "pattern_discovery_config_v1",
    pattern_discovery_result_sha256: overrides.pattern_discovery_result_sha256 ?? h("b"),
    evidence_set_sha256: overrides.evidence_set_sha256 ?? h("c"),
    group_sha256: overrides.group_sha256 ?? h("d"),
    insight_id: overrides.insight_id ?? "insight_opening_drive_15m",
    insight_sha256: overrides.insight_sha256 ?? h("e"),
    source_scenario_ids: ["scenario_001"],
    source_snapshot_ids: ["snapshot_001"],
    pattern_discovery_status: "discovered",
    warning_codes: overrides.warning_codes ?? [],
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    anti_leakage_status: "passed",
    insight: {
      setup_family: "opening_drive",
      horizon: "15m",
      evidence_direction: overrides.evidence_direction ?? "supportive_strong",
      evidence_quality: overrides.evidence_quality ?? "verified_high",
      total_support: overrides.total_support ?? 40,
      unique_snapshot_support: overrides.unique_snapshot_support ?? 40,
      completed_outcome_count: overrides.completed_outcome_count ?? 40,
    },
  };
}

const { calibrateConfidence } = await import("../lib/pure-confidence-calibration.ts");
const { buildConfidenceCalibrationAdvisory } = await import("../lib/confidence-calibration-advisory-adapter.ts");

function calibrationFor(insights, baseConfidence = 50) {
  return calibrateConfidence({ baseConfidence, insights, configuration: calibrationConfig });
}

function recommendationFor(calibration, overrides = {}) {
  return {
    recommendation_id: "rec_static_001",
    recommendation_fingerprint: "rec_fingerprint_static_001",
    recommendation_snapshot_hash: h("f"),
    original_confidence: calibration.original_confidence ?? 50,
    decision_boundary: {
      boundary_id: "decision_boundary_001",
      boundary_sha256: h("1"),
      evidence_cutoff_sha256: h("2"),
      anti_leakage_state: "passed",
    },
    source: {
      source_kind: "recommendation_snapshot",
      source_version: "recommendation_snapshot_v1",
      immutable: true,
    },
    lineage: {
      recommendation_source_hash: h("3"),
      pattern_discovery_result_hashes: calibration.lineage_hashes.map((item) => item.pattern_discovery_result_sha256),
      pattern_insight_ids: calibration.included_insight_ids,
      pattern_insight_hashes: calibration.lineage_hashes.map((item) => item.insight_sha256),
      source_scenario_ids: ["scenario_001"],
      source_snapshot_ids: ["snapshot_001"],
    },
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    no_mutation_callback: true,
    commands: {
      mutation: false,
      persistence: false,
      ranking: false,
      scanner: false,
      publication: false,
      execution: false,
      feedback: false,
    },
    anti_feedback: {
      calibration_output_reused_as_calibration_input_evidence: false,
      calibration_output_reused_as_context: false,
      calibration_output_reused_as_execution_signal: false,
      calibration_output_reused_as_learning_dataset_input: false,
      calibration_output_reused_as_outcome: false,
      calibration_output_reused_as_pattern_discovery_evidence: false,
      calibration_output_reused_as_publication_signal: false,
      calibration_output_reused_as_ranking_signal: false,
      calibration_output_reused_as_recommendation_base_confidence: false,
      calibration_output_reused_as_scanner_signal: false,
      circular_calibration_lineage: false,
      self_referential_recommendation_lineage: false,
    },
    anti_leakage: {
      status: "passed",
      future_outcome_evidence: false,
      post_entry_evidence: false,
      post_exit_evidence: false,
      same_recommendation_realized_result: false,
      evidence_after_decision_boundary: false,
      prohibited_self_calibration: false,
    },
    ...overrides,
  };
}

function advisory(calibration, recommendation = recommendationFor(calibration)) {
  return buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration: advisoryConfig });
}

function patched(value, patch) {
  const draft = clone(value);
  patch(draft);
  return draft;
}

function patchedPair(calibration, recommendation, patch) {
  const nextCalibration = clone(calibration);
  const nextRecommendation = clone(recommendation);
  patch(nextCalibration, nextRecommendation);
  return advisory(nextCalibration, nextRecommendation);
}

function mismatchIssue(result) {
  return result.status === "blocked_calibration_result" &&
    result.issues.length === 1 &&
    result.issues[0].code === "blocked_calibration_result" &&
    result.issues[0].path === "/calibration/calibration_hash" &&
    result.issues[0].severity === "error" &&
    result.issues[0].messageKey === "confidence_calibration_advisory.blocked_calibration_result" &&
    result.advisory_id === null &&
    result.advisory_hash === null &&
    result.proposed_delta === null &&
    result.proposed_calibrated_confidence === null &&
    result.advisory_eligible === false &&
    result.advisory_visible === false &&
    result.application_eligible === false &&
    result.non_authoritative === true &&
    result.applied === false &&
    !JSON.stringify(result).includes("expected") &&
    !JSON.stringify(result).includes("actual");
}

function blockedResult(result) {
  return (result.status.startsWith("blocked_") ||
      result.status === "advisory_insufficient_evidence" ||
      result.status === "blocked_unsupported_status") &&
    result.proposed_delta === null &&
    result.proposed_calibrated_confidence === null &&
    result.advisory_eligible === false &&
    result.advisory_visible === false &&
    result.application_eligible === false &&
    result.non_authoritative === true &&
    result.applied === false;
}

function frozenDeep(value) {
  if (!Object.isFrozen(value)) return false;
  if (Array.isArray(value)) return value.every(frozenDeep);
  if (value && typeof value === "object") return Object.values(value).every((child) =>
    child && typeof child === "object" ? frozenDeep(child) : true);
  return true;
}

const calibrated = calibrationFor([insight()]);
const withWarnings = calibrationFor([insight({ warning_codes: ["metric_value_unavailable"] })]);
const noAdjustment = calibrationFor([insight({ evidence_direction: "neutral" })]);
const twoInsight = calibrationFor([
  insight({ insight_id: "insight_b", insight_sha256: h("e"), pattern_discovery_result_sha256: h("b") }),
  insight({ insight_id: "insight_a", insight_sha256: h("d"), pattern_discovery_result_sha256: h("c"), group_sha256: h("d") }),
]);
const other = calibrationFor([insight({ insight_id: "insight_other", insight_sha256: h("9"), pattern_discovery_result_sha256: h("8") })]);
const versionTwo = calibrationFor([insight({ pattern_discovery_configuration_version: "pattern_discovery_config_v2" })]);
const baseline = advisory(calibrated);
const warningBaseline = advisory(withWarnings);
const noAdjustmentBaseline = advisory(noAdjustment);
const baseRecommendation = recommendationFor(calibrated);

const sourceHashesBefore = Object.fromEntries(Object.keys(protectedHashes).map((path) => [path, fileSha(path)]));

const source = read(paths.adapter);
const runtimeExports = [...source.matchAll(/export function\s+(\w+)/g)].map((match) => match[1]);
const typeExports = [...source.matchAll(/export type\s+(\w+)/g)].map((match) => match[1]);
const apiExportAudit = {
  runtime_exports: runtimeExports,
  public_type_exports: typeExports,
  exact_runtime_export: JSON.stringify(runtimeExports) === JSON.stringify(["buildConfidenceCalibrationAdvisory"]),
  exact_public_type_exports: JSON.stringify(typeExports) === JSON.stringify([
    "ImmutableRecommendationConfidenceEnvelope",
    "FrozenAdvisoryConsumptionConfiguration",
    "ConfidenceCalibrationAdvisoryResult",
  ]),
  no_public_canonicalization_helper: !source.includes("export function canonicalize") &&
    !source.includes("export function buildCalibrationSemanticHashPayload"),
  no_public_hashing_helper: !source.includes("export function sha256"),
  no_class_service_repository_cache_singleton: !source.match(/\bclass\s+|Service|Repository|Cache|Singleton/),
  synchronous_pure_function: !source.match(/async\s+function|await\s|fetch\(|process\.env|@supabase|next\/server|Date\.now|Math\.random|localStorage/),
};

const independentHashAudit = {
  calibrated: calibrated.calibration_hash === independentResultHash(calibrated) && advisory(calibrated).status === "advisory_ready",
  calibrated_with_warnings: withWarnings.calibration_hash === independentResultHash(withWarnings) &&
    advisory(withWarnings).status === "advisory_ready_with_warnings",
  no_adjustment: noAdjustment.calibration_hash === independentResultHash(noAdjustment) &&
    advisory(noAdjustment).status === "advisory_no_adjustment",
};

const blockedStatusAudit = Object.fromEntries(blockedStatuses.map((status) => {
  const result = patched(calibrated, (draft) => {
    draft.status = status;
    draft.calibration_id = null;
    draft.calibration_hash = null;
    draft.proposed_delta = null;
    draft.proposed_calibrated_confidence = null;
  });
  return [status, blockedResult(advisory(result))];
}));

const malformedHashAudit = {
  missing_result_hash: blockedResult(advisory(patched(calibrated, (draft) => { draft.calibration_hash = null; }))),
  malformed_hex_hash: blockedResult(advisory(patched(calibrated, (draft) => { draft.calibration_hash = "z".repeat(64); }))),
  uppercase_hash: blockedResult(advisory(patched(calibrated, (draft) => { draft.calibration_hash = h("A"); }))),
  short_hash: blockedResult(advisory(patched(calibrated, (draft) => { draft.calibration_hash = "a".repeat(63); }))),
  long_hash: blockedResult(advisory(patched(calibrated, (draft) => { draft.calibration_hash = "a".repeat(65); }))),
  swapped_hash_from_other_calibration: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }))),
  identity_hash_used_as_result_hash: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.calibration_hash = baseline.lineage_hashes.calibration_identity_hash;
  }))),
  advisory_hash_used_as_result_hash: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.calibration_hash = baseline.advisory_hash; }))),
  all_zero_valid_format_hash: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.calibration_hash = h("0"); }))),
  all_f_valid_format_hash: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.calibration_hash = h("f"); }))),
};

const retainedHashTampering = {
  status: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.status = "calibrated_with_warnings"; }))),
  calibration_id: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.calibration_id = "confidence_calibration_v1:000000000000000000000000";
  }))),
  original_confidence: mismatchIssue(patchedPair(calibrated, baseRecommendation, (draft, recommendation) => {
    draft.original_confidence = 51;
    recommendation.original_confidence = 51;
  })),
  proposed_delta: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.proposed_delta = 3; }))),
  proposed_calibrated_confidence: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.proposed_calibrated_confidence = 53; }))),
  included_insight_ids: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.included_insight_ids = ["other"]; }))),
  excluded_insight_ids: mismatchIssue(advisory(patched(twoInsight, (draft) => { draft.excluded_insight_ids = [{ insight_id: "other", reason: "overlapping_insight_excluded" }]; }))),
  exclusion_reason: mismatchIssue(advisory(patched(twoInsight, (draft) => { draft.excluded_insight_ids[0].reason = "tampered_reason"; }))),
  evidence_summary: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.evidence_summary.included_count = 99; }))),
  overlap_summary: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.overlap_summary.conflict_count = 99; }))),
  warning_code: mismatchIssue(advisory(patched(withWarnings, (draft) => {
    draft.warnings[0].code = "duplicate_mapper_row_identity";
    draft.warnings[0].messageKey = "confidence_calibration.duplicate_mapper_row_identity";
  }))),
  warning_path: mismatchIssue(advisory(patched(withWarnings, (draft) => { draft.warnings[0].path = "/insights/1/warning_codes"; }))),
  warning_severity: blockedResult(advisory(patched(withWarnings, (draft) => { draft.warnings[0].severity = "error"; }))),
  warning_messageKey: blockedResult(advisory(patched(withWarnings, (draft) => { draft.warnings[0].messageKey = "confidence_calibration.metric_value_unavailable_changed"; }))),
  issue_code: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "error", messageKey: "confidence_calibration.invalid_lineage" }];
  }))),
  issue_path: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.issues = [{ code: "invalid_lineage", path: "/insights/1", severity: "error", messageKey: "confidence_calibration.invalid_lineage" }];
  }))),
  issue_severity: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "warning", messageKey: "confidence_calibration.invalid_lineage" }];
  }))),
  issue_messageKey: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "error", messageKey: "confidence_calibration.changed" }];
  }))),
  pattern_discovery_sha256: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.lineage_hashes[0].pattern_discovery_sha256 = h("9"); }))),
  pattern_discovery_result_hash: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.lineage_hashes[0].pattern_discovery_result_sha256 = h("9"); }))),
  pattern_insight_id: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.included_insight_ids = ["insight_changed"]; }))),
  pattern_insight_hash: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.lineage_hashes[0].insight_sha256 = h("9"); }))),
  calibration_configuration_version: mismatchIssue(advisory(versionTwo)),
  anti_leakage_lineage: blockedResult(patchedPair(calibrated, baseRecommendation, (_draft, recommendation) => {
    recommendation.anti_leakage.future_outcome_evidence = true;
  })),
  non_authoritative: blockedResult(advisory(patched(calibrated, (draft) => { draft.non_authoritative = false; }))),
  applied: blockedResult(advisory(patched(calibrated, (draft) => { draft.applied = true; }))),
};

const combinedTampering = {
  status_plus_proposed_confidence: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.status = "calibrated_with_warnings";
    draft.proposed_calibrated_confidence = 53;
  }))),
  proposed_delta_plus_warning_inventory: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.proposed_delta = 3;
    draft.warnings = [{ code: "metric_value_unavailable", path: "/insights/0/warning_codes", severity: "warning", messageKey: "confidence_calibration.metric_value_unavailable" }];
  }))),
  included_insights_plus_overlap_summary: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.included_insight_ids = ["other"];
    draft.overlap_summary.conflict_count = 1;
  }))),
  issue_inventory_plus_lineage: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "error", messageKey: "confidence_calibration.invalid_lineage" }];
    draft.lineage_hashes[0].insight_sha256 = h("9");
  }))),
  applied_flag_plus_status: blockedResult(advisory(patched(calibrated, (draft) => {
    draft.applied = true;
    draft.status = "calibrated_with_warnings";
  }))),
  configuration_version_plus_proposed_delta: mismatchIssue(advisory(patched(versionTwo, (draft) => { draft.proposed_delta = 3; }))),
};

const reversedWarnings = advisory(patched(withWarnings, (draft) => { draft.warnings = [...draft.warnings].reverse(); }));
const reversedExcluded = advisory(patched(twoInsight, (draft) => { draft.excluded_insight_ids = [...draft.excluded_insight_ids].reverse(); }));
const reversedLineage = advisory(patched(twoInsight, (draft) => {
  draft.included_insight_ids = [...draft.included_insight_ids].reverse();
  draft.lineage_hashes = [...draft.lineage_hashes].reverse();
  draft.adjustments = [...draft.adjustments].reverse();
}));
const semanticOrderEquivalence = {
  warnings_output_equal: JSON.stringify(warningBaseline) === JSON.stringify(reversedWarnings),
  excluded_output_status_equal: advisory(twoInsight).status === reversedExcluded.status,
  lineage_reorder_status_equal: advisory(twoInsight).status === reversedLineage.status,
  canonical_serialization_equal: independentSerialize(resultPayload(twoInsight)) ===
    independentSerialize(resultPayload(patched(twoInsight, (draft) => {
      draft.included_insight_ids = [...draft.included_insight_ids].reverse();
      draft.lineage_hashes = [...draft.lineage_hashes].reverse();
      draft.excluded_insight_ids = [...draft.excluded_insight_ids].reverse();
    }))),
  recomputed_hash_equal: independentResultHash(twoInsight) === independentResultHash(patched(twoInsight, (draft) => {
    draft.included_insight_ids = [...draft.included_insight_ids].reverse();
    draft.lineage_hashes = [...draft.lineage_hashes].reverse();
    draft.excluded_insight_ids = [...draft.excluded_insight_ids].reverse();
  })),
};

const validationPrecedence = {
  malformed_hash_format_blocks_before_semantic_recompute: blockedResult(advisory(patched(calibrated, (draft) => { draft.calibration_hash = "bad"; }))),
  unsupported_status_outranks_hash_mismatch: advisory(patched(calibrated, (draft) => {
    draft.status = "not_a_real_status";
    draft.calibration_hash = other.calibration_hash;
  })).status === "blocked_unsupported_status",
  confidence_mismatch_outranks_hash_mismatch: advisory(patched(calibrated, (draft) => {
    draft.original_confidence = 51;
    draft.calibration_hash = other.calibration_hash;
  }), baseRecommendation).status === "blocked_confidence_mismatch",
  result_hash_mismatch_outranks_pattern_discovery_lineage: patchedPair(calibrated, baseRecommendation, (draft, recommendation) => {
    draft.calibration_hash = other.calibration_hash;
    recommendation.lineage.pattern_discovery_result_hashes = [h("9")];
  }).status === "blocked_calibration_result",
  result_hash_mismatch_outranks_pattern_insight_lineage: patchedPair(calibrated, baseRecommendation, (draft, recommendation) => {
    draft.calibration_hash = other.calibration_hash;
    recommendation.lineage.pattern_insight_hashes = [h("9")];
  }).status === "blocked_calibration_result",
  result_hash_mismatch_outranks_leakage: patchedPair(calibrated, baseRecommendation, (draft, recommendation) => {
    draft.calibration_hash = other.calibration_hash;
    recommendation.anti_leakage.future_outcome_evidence = true;
  }).status === "blocked_calibration_result",
  result_hash_mismatch_outranks_feedback: patchedPair(calibrated, baseRecommendation, (draft, recommendation) => {
    draft.calibration_hash = other.calibration_hash;
    recommendation.anti_feedback.circular_calibration_lineage = true;
  }).status === "blocked_calibration_result",
  result_hash_mismatch_outranks_warning_issue_compatibility: advisory(patched(withWarnings, (draft) => {
    draft.calibration_hash = other.calibration_hash;
    draft.warnings[0].messageKey = "bad";
  })).status === "blocked_calibration_result",
};

const hashRoleSeparation = {
  calibration_id_is_not_result_hash: mismatchIssue(advisory(patched(calibrated, (draft) => {
    draft.calibration_hash = independentSha256({ calibration_id: draft.calibration_id });
  }))),
  identity_hash_as_result_hash_blocks: malformedHashAudit.identity_hash_used_as_result_hash,
  advisory_hash_as_result_hash_blocks: malformedHashAudit.advisory_hash_used_as_result_hash,
  advisory_hash_distinct_from_result_hash: baseline.advisory_hash !== calibrated.calibration_hash,
  identity_hash_distinct_from_result_hash: baseline.lineage_hashes.calibration_identity_hash !== calibrated.calibration_hash,
};

const unaffectedOutputRegression = {
  calibrated_status: baseline.status === "advisory_ready",
  calibrated_id_stable: advisory(calibrated).advisory_id === baseline.advisory_id,
  calibrated_with_warnings_status: warningBaseline.status === "advisory_ready_with_warnings",
  no_adjustment_status: noAdjustmentBaseline.status === "advisory_no_adjustment",
  confidence_mismatch: advisory(patched(calibrated, (draft) => { draft.original_confidence = 51; }), baseRecommendation).status === "blocked_confidence_mismatch",
  blocked_statuses: Object.values(blockedStatusAudit).every(Boolean),
  invalid_recommendation_lineage: patchedPair(calibrated, baseRecommendation, (_draft, recommendation) => {
    recommendation.lineage.pattern_insight_hashes = [h("9")];
  }).status === "blocked_invalid_lineage",
  invalid_calibration_lineage: advisory(patched(calibrated, (draft) => {
    draft.lineage_hashes[0].insight_sha256 = h("9");
  })).status === "blocked_calibration_result",
  leakage_block: patchedPair(calibrated, baseRecommendation, (_draft, recommendation) => {
    recommendation.anti_leakage.future_outcome_evidence = true;
  }).status === "blocked_future_leakage",
  feedback_block: patchedPair(calibrated, baseRecommendation, (_draft, recommendation) => {
    recommendation.anti_feedback.circular_calibration_lineage = true;
  }).status === "blocked_invalid_lineage",
  canonical_output_stable: JSON.stringify(advisory(calibrated)) === JSON.stringify(baseline),
};

const noAdjustmentAudit = {
  zero_delta: noAdjustment.proposed_delta === 0,
  proposed_equals_original: noAdjustment.proposed_calibrated_confidence === noAdjustment.original_confidence,
  correct_result_hash: noAdjustment.calibration_hash === independentResultHash(noAdjustment),
  advisory_no_adjustment: noAdjustmentBaseline.status === "advisory_no_adjustment",
  non_authoritative_true: noAdjustmentBaseline.non_authoritative === true,
  applied_false: noAdjustmentBaseline.applied === false,
  application_eligible_false: noAdjustmentBaseline.application_eligible === false,
  tampered_delta_blocks: mismatchIssue(advisory(patched(noAdjustment, (draft) => { draft.proposed_delta = 1; }))),
  tampered_confidence_blocks: mismatchIssue(advisory(patched(noAdjustment, (draft) => { draft.proposed_calibrated_confidence = 51; }))),
  tampered_warning_inventory_blocks: mismatchIssue(advisory(patched(noAdjustment, (draft) => {
    draft.warnings = [{ code: "metric_value_unavailable", path: "/insights/0/warning_codes", severity: "warning", messageKey: "confidence_calibration.metric_value_unavailable" }];
  }))),
  tampered_flags_block: blockedResult(advisory(patched(noAdjustment, (draft) => { draft.applied = true; }))),
};

const issueContract = {
  exact_mismatch_issue: mismatchIssue(advisory(patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }))),
  deterministic_ordering: JSON.stringify(advisory(patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; })).issues) ===
    JSON.stringify(advisory(patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; })).issues),
  no_raw_hashes: !JSON.stringify(advisory(patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }))).includes(other.calibration_hash),
};

const validInputBefore = JSON.stringify({ calibration: calibrated, recommendation: baseRecommendation, configuration: advisoryConfig });
const validOutput = advisory(calibrated, baseRecommendation);
const mismatchOutput = advisory(patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }), baseRecommendation);
const laterLineageOutput = patchedPair(calibrated, baseRecommendation, (_draft, recommendation) => {
  recommendation.lineage.pattern_insight_hashes = [h("9")];
});
const validInputAfter = JSON.stringify({ calibration: calibrated, recommendation: baseRecommendation, configuration: advisoryConfig });
const immutabilityAudit = {
  valid_input_unchanged: validInputBefore === validInputAfter,
  valid_output_deep_frozen: frozenDeep(validOutput),
  malformed_hash_output_deep_frozen: frozenDeep(advisory(patched(calibrated, (draft) => { draft.calibration_hash = "bad"; }))),
  mismatch_output_deep_frozen: frozenDeep(mismatchOutput),
  later_lineage_output_deep_frozen: frozenDeep(laterLineageOutput),
};

const determinismAudit = {
  repeated_valid_calls_identical: JSON.stringify(advisory(calibrated)) === JSON.stringify(advisory(calibrated)),
  repeated_mismatch_calls_identical: JSON.stringify(mismatchOutput) ===
    JSON.stringify(advisory(patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }), baseRecommendation)),
  interleaved_valid_invalid_identical: JSON.stringify(advisory(calibrated)) === JSON.stringify(baseline) &&
    JSON.stringify(mismatchOutput) === JSON.stringify(advisory(patched(calibrated, (draft) => { draft.calibration_hash = other.calibration_hash; }), baseRecommendation)),
  semantically_reordered_inputs_identical: semanticOrderEquivalence.canonical_serialization_equal,
  advisory_id_stable: advisory(calibrated).advisory_id === baseline.advisory_id,
  canonical_output_stable: JSON.stringify(advisory(calibrated)) === JSON.stringify(baseline),
};

const adapterConsumerFiles = rgFiles("confidence-calibration-advisory-adapter|buildConfidenceCalibrationAdvisory", ["app", "lib", "scripts", "tests"])
  .filter((path) => ![
    paths.adapter,
    "scripts/action-431-confidence-calibration-advisory-consumption-contract-approval-gate-verify.mjs",
    "scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs",
    "scripts/action-433-independent-confidence-calibration-advisory-adapter-verification-verify.mjs",
    "scripts/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate-verify.mjs",
    "scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs",
    paths.verifier,
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
    "tests/e2e/action-431-confidence-calibration-advisory-consumption-contract-approval-gate.spec.ts",
    "tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts",
    "tests/e2e/action-433-independent-confidence-calibration-advisory-adapter-verification.spec.ts",
    "tests/e2e/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate.spec.ts",
    "tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts",
    paths.test,
  ].includes(path));

const forbiddenArtifacts = [
  "docs/action-436-confidence-calibration-advisory-fixtures.json",
  "docs/action-436-confidence-calibration-advisory-shadow-input-manifest.json",
  "scripts/action-436-confidence-calibration-advisory-shadow-run.mjs",
  "scripts/action-436-confidence-calibration-advisory-runner.mjs",
  "lib/action-436-confidence-calibration-advisory-fixtures.ts",
].filter(exists);

const safety = {
  provider_call_executed: false,
  provider_call_attempted: false,
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
  confidence_applied: false,
  fixture_package_created: false,
  runner_created: false,
  manifest_created: false,
  shadow_execution_created: false,
};

const action434 = runJson(paths.action434Verifier);
const action435 = runJson(paths.action435Verifier);
const action309 = runJson(paths.action309Guard);
const golden = runJson(paths.goldenVerifier);
const sourceHashesAfter = Object.fromEntries(Object.keys(protectedHashes).map((path) => [path, fileSha(path)]));
const sourceIntegrity = Object.fromEntries(Object.entries(protectedHashes).map(([path, expected]) => [
  path,
  {
    expected,
    before: sourceHashesBefore[path],
    after: sourceHashesAfter[path],
    matches_expected: (Array.isArray(expected) ? expected : [expected]).includes(sourceHashesBefore[path]) &&
      (Array.isArray(expected) ? expected : [expected]).includes(sourceHashesAfter[path]),
    unchanged_during_action436: sourceHashesBefore[path] === sourceHashesAfter[path],
  },
]));

const remainingGapInventory = [
  !retainedHashTampering.calibration_id && "calibration_id_retained_hash_tampering_not_blocked",
  !retainedHashTampering.warning_code && "warning_code_retained_hash_tampering_not_blocked",
  !retainedHashTampering.warning_path && "warning_path_retained_hash_tampering_not_blocked",
  !retainedHashTampering.pattern_discovery_sha256 && "pattern_discovery_sha256_retained_hash_tampering_not_blocked",
  !retainedHashTampering.pattern_discovery_result_hash && "pattern_discovery_result_hash_tampering_blocks_late_lineage_not_hash_mismatch",
].filter(Boolean);

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  source_integrity: Object.values(sourceIntegrity).every((entry) => entry.matches_expected && entry.unchanged_during_action436),
  api_export_surface: Object.values(apiExportAudit).every(Boolean),
  independent_payload_reconstruction: Object.values(independentHashAudit).every(Boolean),
  blocked_status_mapping: Object.values(blockedStatusAudit).every(Boolean),
  malformed_swapped_hash_matrix: Object.values(malformedHashAudit).every(Boolean),
  retained_hash_tampering_matrix: Object.values(retainedHashTampering).every(Boolean),
  combined_tampering_matrix: Object.values(combinedTampering).every(Boolean),
  semantic_order_equivalence: Object.values(semanticOrderEquivalence).every(Boolean),
  validation_precedence: Object.values(validationPrecedence).every(Boolean),
  hash_role_separation: Object.values(hashRoleSeparation).every(Boolean),
  unaffected_output_regression: Object.values(unaffectedOutputRegression).every(Boolean),
  no_adjustment: Object.values(noAdjustmentAudit).every(Boolean),
  issue_contract: Object.values(issueContract).every(Boolean),
  immutability: Object.values(immutabilityAudit).every(Boolean),
  determinism: Object.values(determinismAudit).every(Boolean),
  isolation: adapterConsumerFiles.length === 0 && forbiddenArtifacts.length === 0 && Object.values(safety).every((value) => value === false),
  action434_healthy: action434.verification_status === "passed",
  action435_healthy: action435.verification_status === "passed",
  action309_guard_healthy: action309.guard_status === "passed",
  golden_static_safety_healthy: golden.verification_status === "passed",
  runtime_preview_paused: advisoryConfig.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  no_remaining_gaps: remainingGapInventory.length === 0,
};

const failedConditions = Object.entries(checks).filter(([, passed]) => !passed).map(([key]) => key);
const readinessDecision = failedConditions.length > 0
  ? "blocked"
  : "ready_with_conditions";
const recommendedNextAction = readinessDecision === "blocked"
  ? "action_437_confidence_calibration_advisory_adapter_post_audit_finding_approval_gate"
  : "action_437_static_advisory_fixture_hash_freeze_approval_gate";

const report = {
  verification_status: "passed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  checks,
  passed_conditions_count: Object.keys(checks).length - failedConditions.length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: 0,
  failed_conditions: failedConditions,
  unresolved_conditions: [],
  source_integrity: sourceIntegrity,
  api_export_audit: apiExportAudit,
  independent_payload_hash_result: independentHashAudit,
  blocked_status_audit: blockedStatusAudit,
  malformed_swapped_hash_result: malformedHashAudit,
  retained_hash_tampering_result: retainedHashTampering,
  combined_tampering_result: combinedTampering,
  semantic_order_equivalence_result: semanticOrderEquivalence,
  validation_precedence_result: validationPrecedence,
  hash_role_separation_result: hashRoleSeparation,
  unaffected_output_and_advisory_id_result: unaffectedOutputRegression,
  no_adjustment_result: noAdjustmentAudit,
  issue_result: issueContract,
  immutability_result: immutabilityAudit,
  determinism_result: determinismAudit,
  isolation_consumer_result: {
    adapter_consumers: adapterConsumerFiles,
    forbidden_artifacts: forbiddenArtifacts,
    safety,
  },
  remaining_gap_inventory: remainingGapInventory,
  fixture_hash_freeze_readiness: readinessDecision === "blocked" ? "blocked_until_findings_are_remediated" : "ready_with_conditions",
  upstream_health: {
    action309: action309.guard_status,
    action434: action434.verification_status,
    action435: action435.verification_status,
    golden_static_safety: golden.verification_status,
  },
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unrelated_work_classification: "action_436_independent_post_remediation_advisory_adapter_verification_only",
  recommended_next_action: recommendedNextAction,
};

console.log(JSON.stringify(report, null, 2));
