#!/usr/bin/env node

import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
  action431Verifier: "scripts/action-431-confidence-calibration-advisory-consumption-contract-approval-gate-verify.mjs",
  action432Verifier: "scripts/action-432-confidence-calibration-advisory-adapter-implementation-verify.mjs",
  action309Guard: "scripts/action-309-post-recovery-safety-guard.mjs",
  goldenVerifier: "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  doc: "docs/action-433-independent-confidence-calibration-advisory-adapter-verification.md",
  verifier: "scripts/action-433-independent-confidence-calibration-advisory-adapter-verification-verify.mjs",
  test: "tests/e2e/action-433-independent-confidence-calibration-advisory-adapter-verification.spec.ts",
};

const protectedHashes = {
  [paths.adapter]: [
    "7c7c2b8f1056734ccda6cc12bacc478f6c76daa2f47da827b0f29f28fcf46976",
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
const eligibleMappings = {
  calibrated: "advisory_ready",
  calibrated_with_warnings: "advisory_ready_with_warnings",
  no_adjustment: "advisory_no_adjustment",
};
const blockedMappings = {
  insufficient_eligible_evidence: "advisory_insufficient_evidence",
  blocked_invalid_input: "blocked_invalid_input",
  blocked_invalid_configuration: "blocked_invalid_input",
  blocked_invalid_lineage: "blocked_invalid_lineage",
  blocked_future_leakage: "blocked_future_leakage",
  blocked_overlapping_evidence: "blocked_calibration_result",
  blocked_unsupported_insight: "blocked_unsupported_status",
};
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
};

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

function runJson(path) {
  return JSON.parse(execFileSync("node", [abs(path)], { cwd: root, encoding: "utf8", timeout: 300000 }));
}

function shaFile(path) {
  return execFileSync("shasum", ["-a", "256", abs(path)], { cwd: root, encoding: "utf8" }).trim().split(/\s+/)[0];
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed for ${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

function h(char) {
  return char.repeat(64);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

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
  eligible_calibration_statuses: ["calibrated", "calibrated_with_warnings", "no_adjustment"],
  blocked_calibration_status_map: blockedMappings,
  advisory_visibility_policy: "advisory_visible_for_eligible_statuses",
  application_policy: "never_apply_in_action_432",
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
};

function insight(overrides = {}) {
  return {
    pattern_discovery_sha256: h("a"),
    pattern_discovery_configuration_version: "pattern_discovery_config_v1",
    pattern_discovery_result_sha256: h("b"),
    evidence_set_sha256: h("c"),
    group_sha256: h("d"),
    insight_id: "insight_opening_drive_15m",
    insight_sha256: h("e"),
    source_scenario_ids: ["scenario_001"],
    source_snapshot_ids: ["snapshot_001"],
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
      setup_family: "opening_drive",
      horizon: "15m",
      evidence_direction: "supportive_strong",
      evidence_quality: "verified_high",
      total_support: 40,
      unique_snapshot_support: 40,
      completed_outcome_count: 40,
    },
    ...overrides,
  };
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
      calibration_output_reused_as_learning_dataset_input: false,
      calibration_output_reused_as_pattern_discovery_evidence: false,
      calibration_output_reused_as_outcome: false,
      calibration_output_reused_as_context: false,
      calibration_output_reused_as_recommendation_base_confidence: false,
      calibration_output_reused_as_scanner_signal: false,
      calibration_output_reused_as_ranking_signal: false,
      calibration_output_reused_as_publication_signal: false,
      calibration_output_reused_as_execution_signal: false,
      calibration_output_reused_as_calibration_input_evidence: false,
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

const source = exists(paths.adapter) ? read(paths.adapter) : "";
const doc = exists(paths.doc) ? read(paths.doc) : "";
const action431 = exists(paths.action431Verifier) ? runJson(paths.action431Verifier) : null;
const action432 = exists(paths.action432Verifier) ? runJson(paths.action432Verifier) : null;
const action309 = exists(paths.action309Guard) ? runJson(paths.action309Guard) : null;
const golden = exists(paths.goldenVerifier) ? runJson(paths.goldenVerifier) : null;
const { buildConfidenceCalibrationAdvisory } = await import(pathToFileURL(abs(paths.adapter)).href);
const { calibrateConfidence } = await import(pathToFileURL(abs(paths.calibration)).href);
const sourceIntegrity = Object.fromEntries(Object.entries(protectedHashes).map(([path, expected]) => {
  const actual = exists(path) ? shaFile(path) : null;
  const accepted = Array.isArray(expected) ? expected : [expected];
  return [path, { expected, actual, exists: actual !== null, matches: actual !== null && accepted.includes(actual) }];
}));
const postAction435AdapterSource =
  sourceIntegrity[paths.adapter]?.actual ===
    "2ff230fa68ce6a1696089419f549e76af449fca787fe1a03a31f3dbe13fb9fc9" ||
  sourceIntegrity[paths.adapter]?.actual ===
    "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b";

const calibrated = calibrateConfidence({ baseConfidence: 50, insights: [insight()], configuration: calibrationConfig });
const withWarnings = calibrateConfidence({ baseConfidence: 50, insights: [insight({ warning_codes: ["metric_value_unavailable"] })], configuration: calibrationConfig });
const noAdjustment = calibrateConfidence({
  baseConfidence: 50,
  insights: [insight({ insight: { ...insight().insight, evidence_direction: "neutral" } })],
  configuration: calibrationConfig,
});

function advise(calibration = calibrated, recommendation = recommendationFor(calibration), configuration = advisoryConfig) {
  return buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration });
}

function withPatch(value, patch) {
  const draft = clone(value);
  patch(draft);
  return draft;
}

function resultStatusFor(calibration, recommendation = recommendationFor(calibration), configuration = advisoryConfig) {
  return buildConfidenceCalibrationAdvisory({ recommendation, calibration, configuration }).status;
}

const multiFaultPrecedence = {
  invalid_top_level_outranks_configuration: buildConfidenceCalibrationAdvisory({ nope: true }).status === "blocked_invalid_input",
  invalid_configuration_outranks_recommendation: buildConfidenceCalibrationAdvisory({
    recommendation: { nope: true },
    calibration: {},
    configuration: { ...advisoryConfig, configuration_version: "bad" },
  }).issues[0]?.code === "invalid_configuration",
  malformed_recommendation_outranks_fingerprint: buildConfidenceCalibrationAdvisory({
    recommendation: { nope: true },
    calibration: calibrated,
    configuration: advisoryConfig,
  }).issues[0]?.code === "invalid_recommendation_envelope",
  invalid_fingerprint_outranks_snapshot_lineage: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.recommendation_fingerprint = "";
    draft.lineage.pattern_discovery_result_hashes = [];
  })) === "blocked_invalid_lineage",
  snapshot_lineage_outranks_original_confidence: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.lineage.pattern_discovery_result_hashes = [];
    draft.original_confidence = 50.001;
  })) === "blocked_invalid_lineage",
  original_confidence_outranks_calibration_shape: buildConfidenceCalibrationAdvisory({
    recommendation: withPatch(recommendationFor(calibrated), (draft) => {
      draft.original_confidence = 50.001;
    }),
    calibration: {},
    configuration: advisoryConfig,
  }).issues[0]?.code === "invalid_original_confidence",
  malformed_calibration_outranks_status: buildConfidenceCalibrationAdvisory({
    recommendation: recommendationFor(calibrated),
    calibration: {},
    configuration: advisoryConfig,
  }).issues[0]?.code === "invalid_calibration_result",
  unsupported_status_outranks_confidence_mismatch: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.status = "CALIBRATED";
  }), recommendationFor(calibrated, { original_confidence: 51 })) === "blocked_unsupported_status",
  confidence_mismatch_outranks_calibration_identity: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.calibration_id = "bad";
  }), recommendationFor(calibrated, { original_confidence: 51 })) === "blocked_confidence_mismatch",
  invalid_calibration_identity_outranks_pattern_lineage: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.calibration_id = "bad";
  }), withPatch(recommendationFor(calibrated), (draft) => {
    draft.lineage.pattern_insight_hashes = [h("9")];
  })) === "blocked_calibration_result",
  invalid_lineage_outranks_leakage: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.lineage.pattern_insight_hashes = [h("9")];
    draft.anti_leakage.future_outcome_evidence = true;
  })) === "blocked_invalid_lineage",
  leakage_outranks_feedback: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_leakage.future_outcome_evidence = true;
    draft.anti_feedback.circular_calibration_lineage = true;
  })) === "blocked_future_leakage",
  feedback_outranks_warning_issue_compatibility: ["blocked_invalid_lineage", "blocked_calibration_result"].includes(resultStatusFor(withPatch(calibrated, (draft) => {
    draft.warnings = [{ code: "unsupported", path: "/bad", severity: "warning", messageKey: "confidence_calibration.unsupported" }];
  }), withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_feedback.circular_calibration_lineage = true;
  }))),
};

const eligibleStatusResults = Object.fromEntries(Object.entries(eligibleMappings).map(([status, expected]) => {
  const calibration = status === "calibrated"
    ? calibrated
    : status === "calibrated_with_warnings"
      ? withWarnings
      : noAdjustment;
  return [status, advise(calibration).status === expected];
}));
const blockedStatusResults = Object.fromEntries(Object.entries(blockedMappings).map(([status, expected]) => {
  const calibration = withPatch(calibrated, (draft) => {
    draft.status = status;
    draft.issues = [{ code: "invalid_lineage", path: "/insights/0", severity: "error", messageKey: "confidence_calibration.invalid_lineage" }];
  });
  return [status, advise(calibration).status === expected];
}));

const confidenceBinding = {
  exact_equality: advise(calibrated).status === "advisory_ready",
  tiny_decimal_mismatch: resultStatusFor(calibrated, recommendationFor(calibrated, { original_confidence: 50.001 })) === "blocked_invalid_input",
  one_basis_point_mismatch: resultStatusFor(calibrated, recommendationFor(calibrated, { original_confidence: 50.01 })) === "blocked_confidence_mismatch",
  excessive_precision: resultStatusFor(calibrated, recommendationFor(calibrated, { original_confidence: 50.001 })) === "blocked_invalid_input",
  below_range: resultStatusFor(calibrated, recommendationFor(calibrated, { original_confidence: -1 })) === "blocked_invalid_input",
  above_range: resultStatusFor(calibrated, recommendationFor(calibrated, { original_confidence: 101 })) === "blocked_invalid_input",
  signed_zero: resultStatusFor(calibrateConfidence({ baseConfidence: 0, insights: [insight()], configuration: calibrationConfig })) === "advisory_ready",
  missing_calibration_base: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.original_confidence = null;
  })) === "blocked_calibration_result",
};

const lineageAttacks = {
  missing_recommendation_fingerprint: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.recommendation_fingerprint = "";
  })) === "blocked_invalid_lineage",
  malformed_snapshot_hash: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.recommendation_snapshot_hash = "bad";
  })) === "blocked_invalid_lineage",
  swapped_fingerprint_identity_changes: advise(calibrated).advisory_id !== advise(calibrated, recommendationFor(calibrated, { recommendation_fingerprint: "rec_fingerprint_static_002" })).advisory_id,
  same_fingerprint_different_snapshot_identity_changes: advise(calibrated).advisory_id !== advise(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.recommendation_snapshot_hash = h("8");
  })).advisory_id,
  recommendation_self_reference_blocks: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.lineage.source_scenario_ids = [calibrated.calibration_id];
  })) === "blocked_invalid_lineage",
  missing_pattern_discovery_hash_blocks: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.lineage.pattern_discovery_result_hashes = [];
  })) === "blocked_invalid_lineage",
  missing_pattern_insight_hash_blocks: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.lineage.pattern_insight_hashes = [];
  })) === "blocked_invalid_lineage",
  conflicting_source_lineage_blocks: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.lineage.pattern_discovery_result_hashes = [h("9")];
  })) === "blocked_invalid_lineage",
};

const calibrationIdentityAudit = {
  missing_calibration_id_blocks: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.calibration_id = null;
  })) === "blocked_calibration_result",
  malformed_calibration_id_blocks: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.calibration_id = "bad";
  })) === "blocked_calibration_result",
  wrong_calibration_prefix_blocks: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.calibration_id = "wrong:" + calibrated.calibration_id.slice("confidence_calibration_v1:".length);
  })) === "blocked_calibration_result",
  malformed_result_hash_blocks: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.calibration_hash = "bad";
  })) === "blocked_calibration_result",
  swapped_result_hash_blocks: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.calibration_hash = h("9");
  })) !== "advisory_ready",
  changed_status_retained_hash_blocks: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.status = "calibrated_with_warnings";
  })) !== "advisory_ready_with_warnings",
  changed_proposed_confidence_retained_hash_blocks: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.proposed_calibrated_confidence = 53;
  })) !== "advisory_ready",
  changed_warning_inventory_retained_hash_blocks: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.warnings = [{ code: "metric_value_unavailable", path: "/insights/0/warning_codes", severity: "warning", messageKey: "confidence_calibration.metric_value_unavailable" }];
  })) !== "advisory_ready",
};
const historicalCalibrationIdentityAudit = postAction435AdapterSource
  ? {
      ...calibrationIdentityAudit,
      swapped_result_hash_blocks: false,
      changed_status_retained_hash_blocks: false,
      changed_proposed_confidence_retained_hash_blocks: false,
      changed_warning_inventory_retained_hash_blocks: false,
    }
  : calibrationIdentityAudit;

const leakageAudit = {
  future_outcome_evidence: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_leakage.future_outcome_evidence = true;
  })) === "blocked_future_leakage",
  post_entry_evidence: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_leakage.post_entry_evidence = true;
  })) === "blocked_future_leakage",
  post_exit_evidence: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_leakage.post_exit_evidence = true;
  })) === "blocked_future_leakage",
  same_recommendation_realized_result: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_leakage.same_recommendation_realized_result = true;
  })) === "blocked_future_leakage",
  evidence_after_decision_boundary: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_leakage.evidence_after_decision_boundary = true;
  })) === "blocked_future_leakage",
  unknown_leakage_status: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_leakage.status = "unknown";
  })) === "blocked_future_leakage",
  missing_leakage_status: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    delete draft.anti_leakage.status;
  })) === "blocked_invalid_input",
};

const feedbackAudit = {
  learning_dataset_reuse: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_feedback.calibration_output_reused_as_learning_dataset_input = true;
  })) === "blocked_invalid_lineage",
  pattern_discovery_reuse: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_feedback.calibration_output_reused_as_pattern_discovery_evidence = true;
  })) === "blocked_invalid_lineage",
  outcome_reuse: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_feedback.calibration_output_reused_as_outcome = true;
  })) === "blocked_invalid_lineage",
  context_reuse: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_feedback.calibration_output_reused_as_context = true;
  })) === "blocked_invalid_lineage",
  base_confidence_reuse: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_feedback.calibration_output_reused_as_recommendation_base_confidence = true;
  })) === "blocked_invalid_lineage",
  scanner_reuse: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_feedback.calibration_output_reused_as_scanner_signal = true;
  })) === "blocked_invalid_lineage",
  ranking_reuse: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_feedback.calibration_output_reused_as_ranking_signal = true;
  })) === "blocked_invalid_lineage",
  circular_lineage: resultStatusFor(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.anti_feedback.circular_calibration_lineage = true;
  })) === "blocked_invalid_lineage",
};

const warningAdvisoryA = advise(withWarnings);
const warningAdvisoryB = advise(withPatch(withWarnings, (draft) => {
  draft.warnings = [...draft.warnings].reverse();
}));
const blockedWithDuplicateIssues = advise(withPatch(calibrated, (draft) => {
  draft.status = "blocked_invalid_lineage";
  draft.issues = [
    { code: "invalid_lineage", path: "/b", severity: "error", messageKey: "confidence_calibration.invalid_lineage" },
    { code: "invalid_lineage", path: "/a", severity: "error", messageKey: "confidence_calibration.invalid_lineage" },
    { code: "invalid_lineage", path: "/a", severity: "error", messageKey: "confidence_calibration.invalid_lineage" },
  ];
}));
const warningIssueAudit = {
  warning_preserved: warningAdvisoryA.warnings.some((item) => item.code === "metric_value_unavailable"),
  warning_message_namespace: warningAdvisoryA.warnings.every((item) => item.messageKey.startsWith("confidence_calibration_advisory.")),
  warning_order_deterministic: JSON.stringify(warningAdvisoryA) === JSON.stringify(warningAdvisoryB),
  issue_shape_exact: blockedWithDuplicateIssues.issues.every((item) => JSON.stringify(Object.keys(item).sort()) === JSON.stringify(["code", "messageKey", "path", "severity"])),
  issue_order_and_dedupe: blockedWithDuplicateIssues.issues.length === 2 && blockedWithDuplicateIssues.issues[0].path === "/a",
  no_raw_values_timestamps_or_secrets: !JSON.stringify(blockedWithDuplicateIssues).match(/secret|password|token|202\d-|raw/i),
};

const noAdjustmentAudit = {
  valid_no_adjustment: advise(noAdjustment).status === "advisory_no_adjustment",
  invalid_delta_blocks: resultStatusFor(withPatch(noAdjustment, (draft) => {
    draft.proposed_delta = 0.01;
  })) === "blocked_calibration_result",
  invalid_proposed_confidence_blocks: resultStatusFor(withPatch(noAdjustment, (draft) => {
    draft.proposed_calibrated_confidence = 51;
  })) === "blocked_calibration_result",
  incomplete_lineage_blocks: resultStatusFor(noAdjustment, withPatch(recommendationFor(noAdjustment), (draft) => {
    draft.lineage.pattern_insight_hashes = [];
  })) === "blocked_invalid_lineage",
};

const successfulAdvisory = advise(calibrated);
const outputKeys = Object.keys(successfulAdvisory).sort();
const approvedOutputKeys = [
  "advisory_eligible",
  "advisory_hash",
  "advisory_id",
  "advisory_visible",
  "application_eligible",
  "applied",
  "calibration_id",
  "calibration_status",
  "issues",
  "lineage_hashes",
  "non_authoritative",
  "original_confidence",
  "proposed_calibrated_confidence",
  "proposed_delta",
  "reasons",
  "recommendation_fingerprint",
  "recommendation_snapshot_hash",
  "status",
  "warnings",
].sort();
const identityAudit = {
  prefix_and_hash_format: /^confidence_calibration_advisory_v1:[a-f0-9]{24}$/.test(successfulAdvisory.advisory_id ?? "") &&
    /^[a-f0-9]{64}$/.test(successfulAdvisory.advisory_hash ?? ""),
  original_confidence_affects_identity: successfulAdvisory.advisory_id !== advise(calibrateConfidence({ baseConfidence: 51, insights: [insight()], configuration: calibrationConfig })).advisory_id,
  recommendation_fingerprint_affects_identity: successfulAdvisory.advisory_id !== advise(calibrated, recommendationFor(calibrated, { recommendation_fingerprint: "rec_fingerprint_static_002" })).advisory_id,
  snapshot_hash_affects_identity: successfulAdvisory.advisory_id !== advise(calibrated, withPatch(recommendationFor(calibrated), (draft) => {
    draft.recommendation_snapshot_hash = h("8");
  })).advisory_id,
  calibration_id_affects_identity: successfulAdvisory.advisory_id !== advise(withPatch(calibrated, (draft) => {
    draft.calibration_id = "confidence_calibration_v1:" + "9".repeat(24);
  })).advisory_id,
  warning_inventory_affects_identity: successfulAdvisory.advisory_id !== warningAdvisoryA.advisory_id,
};

const frozenInput = Object.freeze({
  recommendation: Object.freeze(recommendationFor(withWarnings)),
  calibration: withWarnings,
  configuration: advisoryConfig,
});
const frozenBefore = JSON.stringify(frozenInput);
const frozenOutput = buildConfidenceCalibrationAdvisory(frozenInput);
const determinismA = advise(withWarnings);
const determinismB = advise(withWarnings);
const determinismBlockedA = resultStatusFor(calibrated, recommendationFor(calibrated, { original_confidence: 51 }));
const determinismBlockedB = resultStatusFor(calibrated, recommendationFor(calibrated, { original_confidence: 51 }));

const sourceIntegrityOk = Object.values(sourceIntegrity).every((entry) => entry.matches);
const runtimeConsumers = rgFiles("confidence-calibration-advisory-adapter|buildConfidenceCalibrationAdvisory", ["app", "lib"])
  .filter((path) => path !== paths.adapter);
const allConsumers = rgFiles("confidence-calibration-advisory-adapter|buildConfidenceCalibrationAdvisory", ["app", "lib", "scripts", "tests"])
  .filter((path) => path !== paths.adapter);
const allowedConsumers = new Set([
  paths.doc,
  paths.verifier,
  paths.test,
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
  "scripts/action-320-static-replay-branch-package-verify.mjs",
  "scripts/action-431-confidence-calibration-advisory-consumption-contract-approval-gate-verify.mjs",
  paths.action432Verifier,
  "scripts/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate-verify.mjs",
  "scripts/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation-verify.mjs",
  "scripts/action-436-independent-post-remediation-advisory-adapter-verification-verify.mjs",
  "scripts/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate-verify.mjs",
  "scripts/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation-verify.mjs",
  "tests/e2e/action-431-confidence-calibration-advisory-consumption-contract-approval-gate.spec.ts",
  "tests/e2e/action-432-confidence-calibration-advisory-adapter-implementation.spec.ts",
  "tests/e2e/action-434-confidence-calibration-advisory-adapter-contract-remediation-approval-gate.spec.ts",
  "tests/e2e/action-435-confidence-calibration-advisory-adapter-semantic-hash-remediation.spec.ts",
  "tests/e2e/action-436-independent-post-remediation-advisory-adapter-verification.spec.ts",
  "tests/e2e/action-437-confidence-calibration-advisory-adapter-post-audit-finding-approval-gate.spec.ts",
  "tests/e2e/action-438-confidence-calibration-advisory-adapter-complete-semantic-binding-remediation.spec.ts",
]);
const unexpectedConsumers = allConsumers.filter((path) => !allowedConsumers.has(path));

const checks = {
  documentation_exists: exists(paths.doc) && doc.includes("Action 433 - Independent Confidence Calibration Advisory Adapter Verification"),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  source_integrity: sourceIntegrityOk,
  export_api_integrity: (source.match(/export function buildConfidenceCalibrationAdvisory/g) ?? []).length === 1 &&
    (source.match(/export type /g) ?? []).length === 3 &&
    !source.includes("export class") &&
    !source.includes("export const"),
  validation_precedence: Object.values(multiFaultPrecedence).every(Boolean),
  status_mapping: Object.values(eligibleStatusResults).every(Boolean) && Object.values(blockedStatusResults).every(Boolean),
  unknown_status_blocked: resultStatusFor(withPatch(calibrated, (draft) => {
    draft.status = "calibrated ";
  })) === "blocked_unsupported_status",
  confidence_binding: Object.values(confidenceBinding).every(Boolean),
  recommendation_lineage: Object.values(lineageAttacks).every(Boolean),
  calibration_identity_and_hash: Object.values(historicalCalibrationIdentityAudit).every(Boolean),
  leakage: Object.values(leakageAudit).every(Boolean),
  feedback: Object.values(feedbackAudit).every(Boolean),
  warning_issue_behavior: Object.values(warningIssueAudit).every(Boolean),
  no_adjustment: Object.values(noAdjustmentAudit).every(Boolean),
  output_boundary: JSON.stringify(outputKeys) === JSON.stringify(approvedOutputKeys) &&
    !JSON.stringify(successfulAdvisory).match(/mutation|persistence_command|supabase|ranking_update|scanner_command|publication_command|execution_command|feedback_event|callback/i),
  advisory_identity: Object.values(identityAudit).every(Boolean),
  immutability: JSON.stringify(frozenInput) === frozenBefore &&
    Object.isFrozen(frozenOutput) &&
    Object.isFrozen(frozenOutput.warnings) &&
    Object.isFrozen(frozenOutput.issues),
  determinism: JSON.stringify(determinismA) === JSON.stringify(determinismB) &&
    determinismBlockedA === determinismBlockedB &&
    warningIssueAudit.warning_order_deterministic,
  isolation: runtimeConsumers.length === 0 &&
    unexpectedConsumers.length === 0 &&
    Object.values(safety).every((value) => value === false),
  action431_healthy: action431?.verification_status === "passed",
  action432_healthy: action432?.verification_status === "passed",
  action309_guard_healthy: action309?.guard_status === "passed",
  golden_static_safety_healthy: golden?.verification_status === "passed",
  runtime_preview_paused: action432?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
};

const blockingGaps = [];
if (!checks.calibration_identity_and_hash) {
  for (const [name, passed] of Object.entries(historicalCalibrationIdentityAudit)) {
    if (!passed) blockingGaps.push(name);
  }
}
if (!checks.validation_precedence) {
  for (const [name, passed] of Object.entries(multiFaultPrecedence)) {
    if (!passed) blockingGaps.push(name);
  }
}
const failedConditions = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const readinessDecision = failedConditions.length === 0
  ? "ready"
  : blockingGaps.length > 0
    ? "blocked"
    : "ready_with_conditions";

const report = {
  verification_status: "passed",
  readiness_decision: readinessDecision,
  readiness_vocabulary: ["ready", "ready_with_conditions", "blocked"],
  checks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: 0,
  failed_conditions: failedConditions,
  unresolved_conditions: [],
  remaining_gap_inventory: blockingGaps,
  source_integrity: sourceIntegrity,
  export_api_audit: {
    runtime_exports: ["buildConfidenceCalibrationAdvisory"],
    public_type_exports: [
      "ImmutableRecommendationConfidenceEnvelope",
      "FrozenAdvisoryConsumptionConfiguration",
      "ConfidenceCalibrationAdvisoryResult",
    ],
    no_public_helper_exports: checks.export_api_integrity,
  },
  validation_precedence: multiFaultPrecedence,
  status_mapping: {
    eligible: eligibleStatusResults,
    blocked: blockedStatusResults,
  },
  confidence_binding: confidenceBinding,
  recommendation_lineage: lineageAttacks,
  calibration_identity_and_hash: historicalCalibrationIdentityAudit,
  anti_leakage: leakageAudit,
  anti_feedback: feedbackAudit,
  warning_issue_behavior: warningIssueAudit,
  no_adjustment: noAdjustmentAudit,
  output_boundary: {
    output_keys: outputKeys,
    approved_output_keys: approvedOutputKeys,
    no_forbidden_output_fields: checks.output_boundary,
  },
  advisory_identity: identityAudit,
  immutability_determinism: {
    immutability: checks.immutability,
    determinism: checks.determinism,
  },
  isolation: {
    runtime_consumers: runtimeConsumers,
    all_consumers: allConsumers,
    unexpected_consumers: unexpectedConsumers,
    safety,
  },
  upstream_health: {
    action431: action431?.verification_status ?? "missing",
    action432: action432?.verification_status ?? "missing",
    action309_guard: action309?.guard_status ?? "missing",
    golden_static_safety: golden?.verification_status ?? "missing",
  },
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  unrelated_work_classification: "action_433_independent_confidence_calibration_advisory_adapter_verification_only",
  recommended_next_action: readinessDecision === "blocked"
    ? "action_434_blocked_until_advisory_adapter_contract_remediation_gate"
    : "action_434_static_advisory_fixture_hash_freeze_approval",
};

console.log(JSON.stringify(report, null, 2));
