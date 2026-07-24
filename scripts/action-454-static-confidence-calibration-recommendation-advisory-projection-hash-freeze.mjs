#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const clone = (value) => JSON.parse(JSON.stringify(value));

export const paths = {
  doc: "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.md",
  inventory: "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json",
  freezer: "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs",
  verifier: "scripts/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze-verify.mjs",
  test: "tests/e2e/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.spec.ts",
  action453Doc: "docs/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate.md",
  action453Verifier: "scripts/action-453-static-confidence-calibration-recommendation-advisory-projection-fixture-and-hash-freeze-approval-gate-verify.mjs",
  projection: "lib/confidence-calibration-recommendation-advisory-projection.ts",
  advisory: "lib/confidence-calibration-advisory-adapter.ts",
  calibration: "lib/pure-confidence-calibration.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  learningFixtures: "lib/learning-dataset-static-fixtures.ts",
  contextFixtures: "lib/intelligence-context-static-fixtures.ts",
  insightFixtures: "lib/pattern-insight-static-fixtures.ts",
  action441Inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  action441Freezer: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
  action441Verifier: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs",
  action444Manifest: "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json",
  action444Runner: "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs",
  action444Verifier: "scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs",
};

export const expectedProtectedSourceHashes = {
  [paths.projection]: "5b5a2eff5f98c45a40de21270f614c23cc0b78052d7c29bc52b8a580ebf12442",
  [paths.advisory]: "3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b",
  [paths.calibration]: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.learningFixtures]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixtures]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.insightFixtures]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action441Inventory]: "6323f6690157a52de71750aaa142b8bada965289e470e7f7cd9ef37de55f552c",
  [paths.action441Freezer]: "76d0be269dedc76c97ede48edf5d9763d3b72d3027bbc14c6f8eb695c8d2f9bf",
  [paths.action441Verifier]: "b58312093b8c00deecc3eeb756ba4a0c317a8d01afca7b0142b997576debe3fd",
  [paths.action444Manifest]: "a9a32955e741d0d168bae6c21a30df2e6dd6d07666a757809a7967ee2f02dda0",
  [paths.action444Runner]: "70102dbbaa0b5663b86a90a949ad961785a1245f5b5fb754773f1561b582625a",
  [paths.action444Verifier]: "8f39b8517019f0dcd3ea02bb8bd4ba7b50f8182d994a17164d0378f07144f5ca",
};

export const projectionConfiguration = {
  projection_schema_version: "confidence_calibration_recommendation_projection_v1",
  configuration_version: "confidence_calibration_recommendation_projection_config_v1",
  projection_id_prefix: "confidence_calibration_recommendation_projection_v1:",
  advisory_schema_version: "confidence_calibration_advisory_result_v1",
  advisory_configuration_version: "confidence_calibration_advisory_config_v1",
  confidence_scale_basis_points_per_point: 100,
  accepted_min_confidence_basis_points: 0,
  accepted_max_confidence_basis_points: 10000,
  status_mapping: {
    advisory_ready: "projection_ready",
    advisory_ready_with_warnings: "projection_ready_with_warnings",
    advisory_no_adjustment: "projection_no_adjustment",
    advisory_insufficient_evidence: "projection_insufficient_evidence",
    blocked_invalid_input: "blocked_invalid_input",
    blocked_confidence_mismatch: "blocked_confidence_mismatch",
    blocked_invalid_lineage: "blocked_invalid_lineage",
    blocked_future_leakage: "blocked_future_leakage",
    blocked_calibration_result: "blocked_advisory_result",
    blocked_unsupported_status: "blocked_unsupported_status",
  },
  visibility_policy: "projection_visible_for_eligible_advisories",
  identity_policy: "action_448_projection_identity_v1",
  canonical_hash_version: "action_448_canonical_json_sha256_v1",
  warning_message_key_prefix: "confidence_calibration_advisory.",
  issue_message_key_prefix: "confidence_calibration_advisory.",
  projection_issue_message_key_prefix: "confidence_calibration_recommendation_projection.",
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
};

export const expectedScenarioIds = Array.from({ length: 52 }, (_, index) => `cp453_${String(index + 1).padStart(2, "0")}`);

export const expectedStatusDistribution = {
  projection_ready: 4,
  projection_ready_with_warnings: 3,
  projection_no_adjustment: 1,
  projection_insufficient_evidence: 1,
  blocked_invalid_input: 11,
  blocked_confidence_mismatch: 3,
  blocked_invalid_lineage: 12,
  blocked_future_leakage: 5,
  blocked_advisory_result: 11,
  blocked_unsupported_status: 1,
};

const scenarioPlan = [
  ["cp453_01", "eligible_status", ["advisory_ready", "exact_match", "valid_advisory_hash"], 5000, "advisory_ready", "projection_ready", 150],
  ["cp453_02", "eligible_status", ["advisory_ready_with_warnings", "warning_preservation"], 5100, "advisory_ready_with_warnings", "projection_ready_with_warnings", 125],
  ["cp453_03", "no_adjustment", ["advisory_no_adjustment", "valid_zero_delta"], 5200, "advisory_no_adjustment", "projection_no_adjustment", 0],
  ["cp453_04", "blocked_status", ["advisory_insufficient_evidence"], 5300, "advisory_insufficient_evidence", "projection_insufficient_evidence", 0],
  ["cp453_05", "recommendation_identity", ["missing_fingerprint", "earlier_recommendation_fault"], 5400, "advisory_ready", "blocked_invalid_input", 120],
  ["cp453_06", "recommendation_identity", ["malformed_fingerprint", "earlier_recommendation_fault"], 5500, "advisory_ready", "blocked_invalid_input", 120],
  ["cp453_07", "recommendation_identity", ["missing_snapshot", "earlier_recommendation_fault"], 5600, "advisory_ready", "blocked_invalid_input", 120],
  ["cp453_08", "recommendation_identity", ["malformed_snapshot", "earlier_recommendation_fault"], 5700, "advisory_ready", "blocked_invalid_input", 120],
  ["cp453_09", "recommendation_identity", ["schema_version_mismatch"], 5800, "advisory_ready", "blocked_invalid_input", 120],
  ["cp453_10", "recommendation_identity", ["decision_boundary_mismatch"], 5900, "advisory_ready", "blocked_invalid_input", 120],
  ["cp453_11", "confidence_agreement", ["one_basis_point_mismatch"], 6000, "advisory_ready", "blocked_confidence_mismatch", 120],
  ["cp453_12", "confidence_agreement", ["decimal_mismatch"], 6100, "advisory_ready", "blocked_confidence_mismatch", 120],
  ["cp453_13", "confidence_agreement", ["invalid_precision"], 6200, "advisory_ready", "blocked_invalid_input", 120],
  ["cp453_14", "confidence_agreement", ["below_range"], -1, "advisory_ready", "blocked_invalid_input", 120],
  ["cp453_15", "confidence_agreement", ["above_range"], 10001, "advisory_ready", "blocked_invalid_input", 120],
  ["cp453_16", "confidence_agreement", ["NaN"], 0, "advisory_ready", "blocked_invalid_input", 120],
  ["cp453_17", "confidence_agreement", ["Infinity"], 10000, "advisory_ready", "blocked_invalid_input", 120],
  ["cp453_18", "confidence_agreement", ["signed_zero", "confidence_mismatch"], 0, "advisory_ready", "blocked_confidence_mismatch", 1],
  ["cp453_19", "advisory_hash", ["malformed_hash"], 5000, "advisory_ready", "blocked_advisory_result", 100],
  ["cp453_20", "advisory_hash", ["swapped_hash"], 5000, "advisory_ready", "blocked_advisory_result", 100],
  ["cp453_21", "advisory_hash", ["unrelated_valid_format_hash", "blocked_calibration_result"], 5000, "advisory_ready", "blocked_advisory_result", 100],
  ["cp453_22", "retained_hash", ["retained_hash_status_tampering"], 5000, "advisory_ready", "blocked_advisory_result", 100],
  ["cp453_23", "retained_hash", ["retained_hash_advisory_id_tampering"], 5000, "advisory_ready", "blocked_advisory_result", 100],
  ["cp453_24", "retained_hash", ["retained_hash_confidence_tampering", "no_adjustment_changed_delta"], 5200, "advisory_no_adjustment", "blocked_advisory_result", 75],
  ["cp453_25", "retained_hash", ["retained_hash_warning_tampering"], 5000, "advisory_ready_with_warnings", "blocked_advisory_result", 100],
  ["cp453_26", "retained_hash", ["retained_hash_issue_tampering"], 5000, "advisory_ready_with_warnings", "blocked_advisory_result", 100],
  ["cp453_27", "retained_hash", ["retained_hash_lineage_tampering", "phase_10_defense"], 5000, "advisory_ready", "blocked_advisory_result", 100],
  ["cp453_28", "advisory_hash", ["hash_role_substitution"], 5000, "advisory_ready", "blocked_advisory_result", 100],
  ["cp453_29", "lineage", ["recommendation_fingerprint_mismatch", "changed_fingerprint"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
  ["cp453_30", "lineage", ["recommendation_snapshot_mismatch", "changed_snapshot"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
  ["cp453_31", "lineage", ["pattern_discovery_mismatch"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
  ["cp453_32", "lineage", ["pattern_insight_mismatch"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
  ["cp453_33", "lineage", ["evidence_lineage_mismatch"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
  ["cp453_34", "anti_leakage", ["future_outcome"], 5000, "advisory_ready", "blocked_future_leakage", 100],
  ["cp453_35", "anti_leakage", ["post_entry_evidence"], 5000, "advisory_ready", "blocked_future_leakage", 100],
  ["cp453_36", "anti_leakage", ["post_exit_evidence"], 5000, "advisory_ready", "blocked_future_leakage", 100],
  ["cp453_37", "anti_leakage", ["same_recommendation_realized_result"], 5000, "advisory_ready", "blocked_future_leakage", 100],
  ["cp453_38", "anti_leakage", ["missing_leakage_state", "unknown_leakage_state"], 5000, "advisory_ready", "blocked_future_leakage", 100],
  ["cp453_39", "anti_feedback", ["projection_reused_as_recommendation_confidence"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
  ["cp453_40", "anti_feedback", ["scanner_signal_reuse"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
  ["cp453_41", "anti_feedback", ["ranking_signal_reuse"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
  ["cp453_42", "anti_feedback", ["publication_signal_reuse"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
  ["cp453_43", "anti_feedback", ["execution_signal_reuse"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
  ["cp453_44", "anti_feedback", ["learning_dataset_reuse", "pattern_discovery_evidence_reuse", "context_outcome_reuse", "calibration_evidence_reuse", "advisory_base_input_reuse"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
  ["cp453_45", "blocked_status", ["blocked_unsupported_status", "indirect_cycle"], 5000, "blocked_unsupported_status", "blocked_unsupported_status", 100],
  ["cp453_46", "warnings", ["warning_ordering", "warning_deduplication"], 5000, "advisory_ready_with_warnings", "projection_ready_with_warnings", 100],
  ["cp453_47", "issues", ["issue_preservation", "issue_ordering", "issue_deduplication", "malformed_warning", "malformed_issue"], 5000, "advisory_ready_with_warnings", "projection_ready_with_warnings", 100],
  ["cp453_48", "semantic_ordering", ["reordered_warnings", "reordered_issues", "reordered_lineage", "reordered_object_keys", "reordered_nested_keys"], 5000, "advisory_ready", "projection_ready", 100],
  ["cp453_49", "output_boundary", ["no_recommendation_object", "no_update_command", "no_persistence_command", "no_ranking_scanner_publication_execution_command", "no_feedback_event", "no_runtime_callback"], 5000, "advisory_ready", "projection_ready", 100],
  ["cp453_50", "non_mutation", ["recommendation_input_unchanged", "effect_flags_all_false"], 5000, "advisory_ready", "projection_ready", 100],
  ["cp453_51", "phase_11_defense", ["tampered_lineage_retained_old_hash", "phase_10_blocked_advisory_result"], 5000, "advisory_ready", "blocked_advisory_result", 100],
  ["cp453_52", "phase_11_defense", ["tampered_lineage_recomputed_matching_hash", "phase_11_blocked_invalid_lineage", "direct_cycle"], 5000, "advisory_ready", "blocked_invalid_lineage", 100],
].map(([id, primary_family, coverage_tags, rec_bp, advisory_status, expected_status, delta_bp], index) => ({
  id,
  order: index + 1,
  primary_family,
  coverage_tags,
  rec_bp,
  advisory_status,
  expected_status,
  delta_bp,
}));

const { buildConfidenceCalibrationRecommendationProjection } = await import(pathToFileURL(abs(paths.projection)).href);

export function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_canonical_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => compareText(left, right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  throw new TypeError("unsupported_canonical_value");
}

export function stableHash(value) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
}

function mutationCheckHash(value) {
  return createHash("sha256").update(JSON.stringify(canonicalizeForMutationCheck(value)), "utf8").digest("hex");
}

function canonicalizeForMutationCheck(value) {
  if (typeof value === "number" && !Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) return value.map(canonicalizeForMutationCheck);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => compareText(left, right))
        .map(([key, child]) => [key, canonicalizeForMutationCheck(child)]),
    );
  }
  return canonicalize(value);
}

function shaFile(path) {
  return createHash("sha256").update(readFileSync(abs(path))).digest("hex");
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function orderText(values) {
  return [...new Set(values)].sort(compareText);
}

function warning(code, path = "/warnings/0") {
  return {
    code,
    path,
    severity: "warning",
    messageKey: `confidence_calibration_advisory.${code}`,
  };
}

function issue(code, path = "/issues/0") {
  return {
    code,
    path,
    severity: "error",
    messageKey: `confidence_calibration_advisory.${code}`,
  };
}

function hashLabel(...parts) {
  return stableHash(["action454", ...parts]);
}

function toConfidence(bp) {
  return bp / 100;
}

function baseLineage(id) {
  const discovery = [hashLabel(id, "pattern_discovery", "b"), hashLabel(id, "pattern_discovery", "a")];
  const insight = [hashLabel(id, "pattern_insight", "b"), hashLabel(id, "pattern_insight", "a")];
  return {
    recommendation_source_hash: hashLabel(id, "recommendation_source"),
    decision_boundary_sha256: hashLabel(id, "decision_boundary"),
    evidence_lineage_hash: hashLabel(id, "evidence_lineage"),
    pattern_discovery_result_hashes: discovery,
    pattern_insight_hashes: insight,
    calibration_identity_hash: hashLabel(id, "calibration_identity"),
    calibration_result_hash: hashLabel(id, "calibration_result"),
  };
}

function baseRecommendation(spec) {
  const lineage = baseLineage(spec.id);
  return {
    recommendation_id: `rec_projection_${spec.id}`,
    recommendation_fingerprint: `rec_projection_fingerprint_${spec.id}`,
    recommendation_snapshot_hash: hashLabel(spec.id, "snapshot"),
    original_confidence_basis_points: spec.rec_bp,
    schema_version: "recommendation_projection_envelope_v1",
    decision_boundary: {
      boundary_id: `decision_boundary_${spec.id}`,
      boundary_sha256: lineage.decision_boundary_sha256,
      evidence_cutoff_sha256: hashLabel(spec.id, "evidence_cutoff"),
      anti_leakage_state: "passed",
    },
    identity: { ticker: `T${String(spec.order).padStart(2, "0")}`, side: spec.order % 2 === 0 ? "short" : "long" },
    source: {
      source_kind: "recommendation_snapshot",
      source_version: "static_projection_action_454",
      source_classification: "static_projection",
      immutable: true,
    },
    lineage: {
      recommendation_source_hash: lineage.recommendation_source_hash,
      decision_boundary_sha256: lineage.decision_boundary_sha256,
      evidence_lineage_hash: lineage.evidence_lineage_hash,
      pattern_discovery_result_hashes: lineage.pattern_discovery_result_hashes,
      pattern_insight_hashes: lineage.pattern_insight_hashes,
      source_scenario_ids: [spec.id],
      source_snapshot_ids: [`snapshot_${spec.id}`],
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
      projection_reused_as_recommendation_confidence_input: false,
      projection_reused_as_scanner_signal: false,
      projection_reused_as_ranking_signal: false,
      projection_reused_as_publication_signal: false,
      projection_reused_as_execution_signal: false,
      projection_reused_as_learning_dataset_input: false,
      projection_reused_as_pattern_discovery_evidence: false,
      projection_reused_as_intelligence_context: false,
      projection_reused_as_outcome: false,
      projection_reused_as_calibration_evidence: false,
      projection_reused_as_future_advisory_base_input: false,
      projection_reused_as_feedback_event: false,
      circular_projection_lineage: false,
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
  };
}

function baseAdvisory(spec, recommendation) {
  const delta = spec.delta_bp;
  const proposed = spec.advisory_status === "advisory_no_adjustment" ? spec.rec_bp : spec.rec_bp + delta;
  const statusWarnings = spec.advisory_status === "advisory_ready_with_warnings"
    ? [warning("duplicate_mapper_row_identity", "/warnings/0")]
    : [];
  const statusIssues = spec.advisory_status === "advisory_insufficient_evidence"
    ? [issue("insufficient_eligible_evidence", "/issues/0")]
    : [];
  const advisory = {
    status: spec.advisory_status,
    advisory_id: null,
    advisory_hash: null,
    recommendation_fingerprint: recommendation.recommendation_fingerprint,
    recommendation_snapshot_hash: recommendation.recommendation_snapshot_hash,
    original_confidence: toConfidence(spec.rec_bp),
    proposed_delta: toConfidence(delta),
    proposed_calibrated_confidence: toConfidence(proposed),
    calibration_status: spec.advisory_status === "advisory_no_adjustment" ? "no_adjustment" : "calibrated",
    calibration_id: `confidence_calibration_v1:${hashLabel(spec.id, "calibration_id").slice(0, 24)}`,
    lineage_hashes: {
      recommendation_source_hash: recommendation.lineage.recommendation_source_hash,
      decision_boundary_sha256: recommendation.lineage.decision_boundary_sha256,
      pattern_discovery_result_hashes: recommendation.lineage.pattern_discovery_result_hashes,
      pattern_insight_hashes: recommendation.lineage.pattern_insight_hashes,
      calibration_identity_hash: hashLabel(spec.id, "calibration_identity"),
      calibration_result_hash: hashLabel(spec.id, "calibration_result"),
      evidence_lineage_hash: recommendation.lineage.evidence_lineage_hash,
    },
    warnings: statusWarnings,
    issues: statusIssues,
    advisory_eligible: ["advisory_ready", "advisory_ready_with_warnings", "advisory_no_adjustment"].includes(spec.advisory_status),
    advisory_visible: ["advisory_ready", "advisory_ready_with_warnings", "advisory_no_adjustment"].includes(spec.advisory_status),
    application_eligible: false,
    reasons: [`action454_${spec.primary_family}`],
    non_authoritative: true,
    applied: false,
  };
  return withAdvisorySemanticHash(advisory);
}

function advisorySemanticHashPayload(advisory) {
  return {
    adapter_schema_version: projectionConfiguration.advisory_schema_version,
    configuration_version: projectionConfiguration.advisory_configuration_version,
    status: advisory.status,
    recommendation_fingerprint: advisory.recommendation_fingerprint,
    recommendation_snapshot_hash: advisory.recommendation_snapshot_hash,
    original_confidence_basis_points: toBasisPoints(advisory.original_confidence),
    calibration_status: advisory.calibration_status,
    calibration_id: advisory.calibration_id,
    calibration_identity_hash: advisory.lineage_hashes.calibration_identity_hash,
    calibration_result_hash: advisory.lineage_hashes.calibration_result_hash,
    proposed_delta_basis_points: toBasisPoints(advisory.proposed_delta),
    proposed_confidence_basis_points: toBasisPoints(advisory.proposed_calibrated_confidence),
    warnings: orderRecords(advisory.warnings),
    issues: orderRecords(advisory.issues),
    lineage_hashes: canonicalAdvisoryLineage(advisory.lineage_hashes),
    advisory_eligible: advisory.advisory_eligible,
    advisory_visible: advisory.advisory_visible,
    application_eligible: advisory.application_eligible,
    reasons: orderText(advisory.reasons),
    non_authoritative: advisory.non_authoritative,
    applied: advisory.applied,
  };
}

function withAdvisorySemanticHash(advisory) {
  if (!advisory.lineage_hashes) return advisory;
  const advisoryHash = stableHash(advisorySemanticHashPayload(advisory));
  return {
    ...advisory,
    advisory_hash: advisoryHash,
    advisory_id: `confidence_calibration_advisory_v1:${advisoryHash.slice(0, 24)}`,
  };
}

function canonicalAdvisoryLineage(lineage) {
  return {
    recommendation_source_hash: lineage.recommendation_source_hash,
    decision_boundary_sha256: lineage.decision_boundary_sha256,
    pattern_discovery_result_hashes: orderText(lineage.pattern_discovery_result_hashes),
    pattern_insight_hashes: orderText(lineage.pattern_insight_hashes),
    calibration_identity_hash: lineage.calibration_identity_hash,
    calibration_result_hash: lineage.calibration_result_hash,
    evidence_lineage_hash: lineage.evidence_lineage_hash,
  };
}

function orderRecords(values) {
  const unique = new Map();
  for (const value of values) {
    unique.set(`${value.severity}\u0000${value.code}\u0000${value.path}\u0000${value.messageKey}`, {
      code: value.code,
      path: value.path,
      severity: value.severity,
      messageKey: value.messageKey,
    });
  }
  return [...unique.values()].sort(
    (left, right) =>
      compareText(left.severity, right.severity) ||
      compareText(left.code, right.code) ||
      compareText(left.path, right.path) ||
      compareText(left.messageKey, right.messageKey),
  );
}

function toBasisPoints(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const basisPoints = value * projectionConfiguration.confidence_scale_basis_points_per_point;
  if (Math.abs(basisPoints - Math.round(basisPoints)) > 1e-9) return null;
  return Object.is(Math.round(basisPoints), -0) ? 0 : Math.round(basisPoints);
}

function applyScenarioMutation(spec, recommendation, advisory) {
  const retainHash = advisory.advisory_hash;
  const retainId = advisory.advisory_id;
  if (spec.id === "cp453_05") delete recommendation.recommendation_fingerprint;
  if (spec.id === "cp453_06") recommendation.recommendation_fingerprint = 42;
  if (spec.id === "cp453_07") delete recommendation.recommendation_snapshot_hash;
  if (spec.id === "cp453_08") recommendation.recommendation_snapshot_hash = 42;
  if (spec.id === "cp453_09") recommendation.schema_version = "recommendation_projection_envelope_v2";
  if (spec.id === "cp453_10") recommendation.decision_boundary.anti_leakage_state = "unknown";
  if (spec.id === "cp453_11") advisory.original_confidence = toConfidence(spec.rec_bp + 1);
  if (spec.id === "cp453_12") advisory.original_confidence = toConfidence(spec.rec_bp) + 0.001;
  if (spec.id === "cp453_13") recommendation.original_confidence_basis_points = spec.rec_bp + 0.5;
  if (spec.id === "cp453_16") recommendation.original_confidence_basis_points = Number.NaN;
  if (spec.id === "cp453_17") recommendation.original_confidence_basis_points = Number.POSITIVE_INFINITY;
  if (spec.id === "cp453_18") advisory.original_confidence = 0.01;
  if (spec.id === "cp453_19") advisory.advisory_hash = "not-a-sha256";
  if (spec.id === "cp453_20") advisory.advisory_hash = hashLabel("cp453_01", "swapped_advisory_hash");
  if (spec.id === "cp453_21") advisory.advisory_hash = hashLabel(spec.id, "unrelated_valid_format_hash");
  if (spec.id === "cp453_22") {
    advisory.status = "advisory_ready_with_warnings";
    advisory.warnings = [warning("metric_value_unavailable", "/warnings/0")];
    advisory.advisory_hash = retainHash;
    advisory.advisory_id = retainId;
  }
  if (spec.id === "cp453_23") advisory.advisory_id = `confidence_calibration_advisory_v1:${hashLabel(spec.id, "tampered_id").slice(0, 24)}`;
  if (spec.id === "cp453_24") {
    const clean = withAdvisorySemanticHash({ ...advisory, proposed_delta: 0, proposed_calibrated_confidence: toConfidence(spec.rec_bp) });
    advisory.advisory_hash = clean.advisory_hash;
    advisory.advisory_id = clean.advisory_id;
  }
  if (spec.id === "cp453_25") {
    const clean = withAdvisorySemanticHash({ ...advisory, warnings: [] });
    advisory.warnings = [warning("metric_value_unavailable", "/warnings/0")];
    advisory.advisory_hash = clean.advisory_hash;
    advisory.advisory_id = clean.advisory_id;
  }
  if (spec.id === "cp453_26") {
    const clean = withAdvisorySemanticHash({ ...advisory, issues: [] });
    advisory.issues = [issue("invalid_evidence_quality", "/issues/0")];
    advisory.advisory_hash = clean.advisory_hash;
    advisory.advisory_id = clean.advisory_id;
  }
  if (["cp453_27", "cp453_51"].includes(spec.id)) {
    const clean = withAdvisorySemanticHash(clone(advisory));
    advisory.lineage_hashes.evidence_lineage_hash = hashLabel(spec.id, "tampered_evidence_lineage");
    advisory.advisory_hash = clean.advisory_hash;
    advisory.advisory_id = clean.advisory_id;
  }
  if (spec.id === "cp453_28") {
    advisory.advisory_id = `confidence_calibration_advisory_v1:${advisory.advisory_hash.slice(0, 24)}`;
    advisory.advisory_hash = stableHash({ advisory_id: advisory.advisory_id, advisory_hash: advisory.advisory_hash });
  }
  if (spec.id === "cp453_29") {
    advisory.recommendation_fingerprint = `different_${recommendation.recommendation_fingerprint}`;
    Object.assign(advisory, withAdvisorySemanticHash(advisory));
  }
  if (spec.id === "cp453_30") {
    advisory.recommendation_snapshot_hash = hashLabel(spec.id, "changed_snapshot");
    Object.assign(advisory, withAdvisorySemanticHash(advisory));
  }
  if (spec.id === "cp453_31") {
    advisory.lineage_hashes.pattern_discovery_result_hashes = [hashLabel(spec.id, "changed_pattern_discovery")];
    Object.assign(advisory, withAdvisorySemanticHash(advisory));
  }
  if (spec.id === "cp453_32") {
    advisory.lineage_hashes.pattern_insight_hashes = [hashLabel(spec.id, "changed_pattern_insight")];
    Object.assign(advisory, withAdvisorySemanticHash(advisory));
  }
  if (spec.id === "cp453_33") {
    advisory.lineage_hashes.evidence_lineage_hash = hashLabel(spec.id, "changed_evidence_lineage");
    Object.assign(advisory, withAdvisorySemanticHash(advisory));
  }
  if (spec.id === "cp453_34") recommendation.anti_leakage.future_outcome_evidence = true;
  if (spec.id === "cp453_35") recommendation.anti_leakage.post_entry_evidence = true;
  if (spec.id === "cp453_36") recommendation.anti_leakage.post_exit_evidence = true;
  if (spec.id === "cp453_37") recommendation.anti_leakage.same_recommendation_realized_result = true;
  if (spec.id === "cp453_38") recommendation.anti_leakage.status = "unknown";
  if (spec.id === "cp453_39") recommendation.anti_feedback.projection_reused_as_recommendation_confidence_input = true;
  if (spec.id === "cp453_40") recommendation.anti_feedback.projection_reused_as_scanner_signal = true;
  if (spec.id === "cp453_41") recommendation.anti_feedback.projection_reused_as_ranking_signal = true;
  if (spec.id === "cp453_42") recommendation.anti_feedback.projection_reused_as_publication_signal = true;
  if (spec.id === "cp453_43") recommendation.anti_feedback.projection_reused_as_execution_signal = true;
  if (spec.id === "cp453_44") {
    recommendation.anti_feedback.projection_reused_as_learning_dataset_input = true;
    recommendation.anti_feedback.projection_reused_as_pattern_discovery_evidence = true;
    recommendation.anti_feedback.projection_reused_as_intelligence_context = true;
    recommendation.anti_feedback.projection_reused_as_outcome = true;
    recommendation.anti_feedback.projection_reused_as_calibration_evidence = true;
    recommendation.anti_feedback.projection_reused_as_future_advisory_base_input = true;
  }
  if (spec.id === "cp453_46") {
    advisory.warnings = [
      warning("metric_value_unavailable", "/warnings/1"),
      warning("duplicate_mapper_row_identity", "/warnings/0"),
      warning("duplicate_mapper_row_identity", "/warnings/0"),
    ];
    Object.assign(advisory, withAdvisorySemanticHash(advisory));
  }
  if (spec.id === "cp453_47") {
    advisory.warnings = [
      warning("metric_value_unavailable", "/warnings/1"),
      warning("duplicate_mapper_row_identity", "/warnings/0"),
      warning("duplicate_mapper_row_identity", "/warnings/0"),
    ];
    advisory.issues = [
      issue("invalid_evidence_quality", "/issues/1"),
      issue("warning_status_contradiction", "/issues/0"),
      issue("warning_status_contradiction", "/issues/0"),
    ];
    Object.assign(advisory, withAdvisorySemanticHash(advisory));
  }
  if (spec.id === "cp453_48") {
    recommendation.lineage.pattern_discovery_result_hashes = [...recommendation.lineage.pattern_discovery_result_hashes].reverse();
    recommendation.lineage.pattern_insight_hashes = [...recommendation.lineage.pattern_insight_hashes].reverse();
    advisory.lineage_hashes.pattern_discovery_result_hashes = [...recommendation.lineage.pattern_discovery_result_hashes];
    advisory.lineage_hashes.pattern_insight_hashes = [...recommendation.lineage.pattern_insight_hashes];
    Object.assign(advisory, withAdvisorySemanticHash(advisory));
  }
  if (spec.id === "cp453_52") {
    advisory.lineage_hashes.evidence_lineage_hash = hashLabel(spec.id, "phase_11_recomputed_lineage");
    recommendation.anti_feedback.circular_projection_lineage = true;
    Object.assign(advisory, withAdvisorySemanticHash(advisory));
  }
  return { recommendation, advisory };
}

function buildScenarioInput(spec) {
  const recommendation = baseRecommendation(spec);
  const advisory = baseAdvisory(spec, recommendation);
  return applyScenarioMutation(spec, recommendation, advisory);
}

function projectionIdentityPayload(result) {
  if (!result.projection_id) return null;
  return {
    projection_schema_version: projectionConfiguration.projection_schema_version,
    configuration_version: projectionConfiguration.configuration_version,
    recommendation_fingerprint: result.recommendation_fingerprint,
    recommendation_snapshot_hash: result.recommendation_snapshot_hash,
    recommendation_original_confidence_basis_points: result.recommendation_original_confidence_basis_points,
    advisory_status: result.advisory_status,
    advisory_id: result.advisory_id,
    advisory_identity_hash: result.advisory_identity_hash,
    advisory_result_hash: result.advisory_result_hash,
    advisory_proposed_delta_basis_points: result.advisory_proposed_delta_basis_points,
    advisory_proposed_confidence_basis_points: result.advisory_proposed_confidence_basis_points,
    warnings: result.warnings,
    issues: result.issues,
    lineage_hashes: result.lineage_hashes,
  };
}

function scenarioSummary(spec, recommendation, advisory, result) {
  const identityPayload = projectionIdentityPayload(result);
  const advisoryHashClassification = classifyAdvisoryHash(spec, advisory);
  const boundedResult = boundedProjectionResult(result);
  const summary = {
    scenario_id: spec.id,
    order: spec.order,
    primary_family: spec.primary_family,
    coverage_tags: spec.coverage_tags,
    source_class: "deterministic_test_local_projection_envelope_and_bounded_advisory_result",
    recommendation_envelope: {
      fingerprint_state: typeof recommendation.recommendation_fingerprint === "string" ? "present" : "missing_or_malformed",
      snapshot_hash_state: typeof recommendation.recommendation_snapshot_hash === "string" ? "present" : "missing_or_malformed",
      original_confidence_basis_points: Number.isFinite(recommendation.original_confidence_basis_points)
        ? recommendation.original_confidence_basis_points
        : spec.coverage_tags[0],
      schema_version: typeof recommendation.schema_version === "string" ? recommendation.schema_version : "invalid",
      decision_boundary: typeof recommendation.decision_boundary?.anti_leakage_state === "string"
        ? recommendation.decision_boundary.anti_leakage_state
        : "invalid",
      source_classification: recommendation.source?.source_classification ?? "invalid",
      immutable: recommendation.source?.immutable === true,
    },
    advisory_input: {
      status: advisory.status,
      advisory_id_present: typeof advisory.advisory_id === "string",
      advisory_hash_classification: advisoryHashClassification,
      original_confidence_basis_points: toBasisPoints(advisory.original_confidence),
      proposed_delta_basis_points: toBasisPoints(advisory.proposed_delta),
      proposed_confidence_basis_points: toBasisPoints(advisory.proposed_calibrated_confidence),
      calibration_status: advisory.calibration_status,
      calibration_id_present: typeof advisory.calibration_id === "string",
      warning_codes: advisory.warnings.map((item) => item.code),
      issue_codes: advisory.issues.map((item) => item.code),
      lineage_present: advisory.lineage_hashes !== null,
      advisory_visible: advisory.advisory_visible,
      advisory_eligible: advisory.advisory_eligible,
      non_authoritative: advisory.non_authoritative,
      applied: advisory.applied,
    },
    expected: {
      status: spec.expected_status,
      recommendation_original_confidence_basis_points: Number.isFinite(spec.rec_bp) ? spec.rec_bp : null,
      projected_advisory_delta_basis_points: ["projection_ready", "projection_ready_with_warnings", "projection_no_adjustment"].includes(spec.expected_status)
        ? spec.delta_bp
        : null,
      projected_advisory_confidence_basis_points: ["projection_ready", "projection_ready_with_warnings", "projection_no_adjustment"].includes(spec.expected_status)
        ? (spec.advisory_status === "advisory_no_adjustment" ? spec.rec_bp : spec.rec_bp + spec.delta_bp)
        : null,
      recommendation_confidence_unchanged: true,
      application_eligible: false,
      non_authoritative: true,
      applied: false,
    },
    actual: {
      status: boundedResult.status,
      projection_id: boundedResult.projection_id,
      projection_hash: boundedResult.projection_hash,
      recommendation_original_confidence_basis_points: boundedResult.recommendation_original_confidence_basis_points,
      advisory_proposed_delta_basis_points: boundedResult.advisory_proposed_delta_basis_points,
      advisory_proposed_confidence_basis_points: boundedResult.advisory_proposed_confidence_basis_points,
      projection_visible: boundedResult.projection_visible,
      advisory_visible: boundedResult.advisory_visible,
      warnings: boundedResult.warnings,
      issues: boundedResult.issues,
      bounded_lineage_present: boundedResult.lineage_hashes !== null,
    },
    effect_flags: {
      recommendation_confidence_unchanged: result.recommendation_confidence_unchanged,
      ranking_affected: result.ranking_affected,
      scanner_affected: result.scanner_affected,
      publication_affected: result.publication_affected,
      execution_affected: result.execution_affected,
      application_eligible: result.application_eligible,
      non_authoritative: result.non_authoritative,
      applied: result.applied,
    },
    projection_identity_payload: identityPayload,
    projection_identity_sha256: identityPayload ? stableHash(identityPayload) : null,
    canonical_projection_result_sha256: stableHash(boundedResult),
  };
  return {
    ...summary,
    scenario_summary_sha256: stableHash(summary),
  };
}

function boundedProjectionResult(result) {
  return {
    ...result,
    recommendation_original_confidence_basis_points: boundedNumber(result.recommendation_original_confidence_basis_points),
    advisory_proposed_delta_basis_points: boundedNumber(result.advisory_proposed_delta_basis_points),
    advisory_proposed_confidence_basis_points: boundedNumber(result.advisory_proposed_confidence_basis_points),
  };
}

function boundedNumber(value) {
  return typeof value === "number" && !Number.isFinite(value) ? String(value) : value;
}

function classifyAdvisoryHash(spec, advisory) {
  if (spec.coverage_tags.includes("malformed_hash")) return "malformed_hash";
  if (spec.coverage_tags.includes("swapped_hash")) return "swapped_hash";
  if (spec.coverage_tags.includes("unrelated_valid_format_hash")) return "unrelated_valid_format_hash";
  if (spec.coverage_tags.some((tag) => tag.startsWith("retained_hash"))) return "retained_hash_tampering";
  if (spec.coverage_tags.includes("hash_role_substitution")) return "hash_role_substitution";
  if (typeof advisory.advisory_hash === "string" && /^[a-f0-9]{64}$/.test(advisory.advisory_hash)) return "valid_advisory_hash";
  return "not_required_for_blocked_status";
}

function countBy(values, keyFn) {
  return values.reduce((accumulator, value) => {
    const key = keyFn(value);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

function verifyProtectedSources() {
  return Object.fromEntries(Object.entries(expectedProtectedSourceHashes).map(([path, expected]) => {
    if (!exists(path)) throw new Error(`protected_source_missing:${path}`);
    const actual = shaFile(path);
    if (actual !== expected) throw new Error(`protected_source_hash_changed:${path}:${actual}`);
    return [path, actual];
  }));
}

export function buildFreezePayload() {
  const protectedSourceHashesBefore = verifyProtectedSources();
  const scenarios = scenarioPlan.map((spec) => {
    const { recommendation, advisory } = buildScenarioInput(spec);
    const beforeHash = mutationCheckHash(recommendation);
    const result = buildConfidenceCalibrationRecommendationProjection({
      recommendation,
      advisory,
      configuration: projectionConfiguration,
    });
    const afterHash = mutationCheckHash(recommendation);
    if (result.status !== spec.expected_status) {
      throw new Error(`unexpected_status:${spec.id}:${result.status}:${spec.expected_status}`);
    }
    if (beforeHash !== afterHash) throw new Error(`recommendation_mutated:${spec.id}`);
    if (result.recommendation_confidence_unchanged !== true || result.applied !== false || result.application_eligible !== false) {
      throw new Error(`effect_flag_violation:${spec.id}`);
    }
    return scenarioSummary(spec, recommendation, advisory, result);
  });
  const scenarioIds = scenarios.map((scenario) => scenario.scenario_id);
  if (JSON.stringify(scenarioIds) !== JSON.stringify(expectedScenarioIds)) {
    throw new Error("scenario_ids_or_order_changed");
  }
  const statusDistribution = countBy(scenarios, (scenario) => scenario.actual.status);
  if (JSON.stringify(canonicalize(statusDistribution)) !== JSON.stringify(canonicalize(expectedStatusDistribution))) {
    throw new Error(`status_distribution_changed:${JSON.stringify(statusDistribution)}`);
  }
  const advisoryHashClassificationDistribution = countBy(
    scenarios,
    (scenario) => scenario.advisory_input.advisory_hash_classification,
  );
  const warningDistribution = countBy(
    scenarios.flatMap((scenario) => scenario.actual.warnings.map((item) => item.code)),
    (code) => code,
  );
  const issueDistribution = countBy(
    scenarios.flatMap((scenario) => scenario.actual.issues.map((item) => item.code)),
    (code) => code,
  );
  const inventoryWithoutPackageHash = {
    inventory_schema_version: "action_454_static_projection_hash_inventory_v1",
    action: "action_454_static_confidence_calibration_recommendation_advisory_projection_hash_freeze",
    action_453_approval: "approved_with_conditions",
    protected_source_hashes: protectedSourceHashesBefore,
    scenario_count: scenarios.length,
    exact_ids: scenarioIds,
    exact_status_distribution: statusDistribution,
    advisory_hash_classification_distribution: advisoryHashClassificationDistribution,
    warning_distribution: warningDistribution,
    issue_distribution: issueDistribution,
    projection_configuration: projectionConfiguration,
    static_only: true,
    non_production: true,
    non_authoritative: true,
    non_learning: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_external_access: true,
    no_feedback: true,
    recommendation_mutated: false,
    confidence_applied: false,
    projection_shadow_executed: false,
    consumer_added: false,
    deployment_artifact_changed: false,
    runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    bounded_metadata_only: true,
    full_recommendation_objects_retained: false,
    full_advisory_objects_retained: false,
    repeat_freeze_runs: 2,
    scenarios,
    recommended_next_action: "action_455_independent_projection_hash_freeze_verification",
  };
  const packageInventorySha256 = stableHash(inventoryWithoutPackageHash);
  const inventory = {
    ...inventoryWithoutPackageHash,
    package_inventory_sha256: packageInventorySha256,
  };
  const protectedSourceHashesAfter = verifyProtectedSources();
  if (JSON.stringify(protectedSourceHashesBefore) !== JSON.stringify(protectedSourceHashesAfter)) {
    throw new Error("protected_sources_changed_during_freeze");
  }
  return inventory;
}

export function buildRepeatFreezeReport() {
  const first = buildFreezePayload();
  const second = buildFreezePayload();
  const firstHash = stableHash(first);
  const secondHash = stableHash(second);
  if (firstHash !== secondHash) throw new Error("repeat_freeze_mismatch");
  return {
    freeze_status: "passed",
    inventory: first,
    repeat_freeze: {
      run_count: 2,
      first_payload_sha256: firstHash,
      second_payload_sha256: secondHash,
      identical: true,
      package_inventory_sha256: first.package_inventory_sha256,
    },
  };
}

function writeInventory() {
  const report = buildRepeatFreezeReport();
  writeFileSync(abs(paths.inventory), `${JSON.stringify(report.inventory, null, 2)}\n`);
  return {
    freeze_status: report.freeze_status,
    scenario_count: report.inventory.scenario_count,
    exact_status_distribution: report.inventory.exact_status_distribution,
    package_inventory_sha256: report.inventory.package_inventory_sha256,
    repeat_freeze: report.repeat_freeze,
    inventory_path: paths.inventory,
    provider_call_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    projection_shadow_executed: false,
    confidence_applied: false,
    deployment_authorized: false,
    runtime_preview_status: report.inventory.runtime_preview_status,
    recommended_next_action: report.inventory.recommended_next_action,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(writeInventory(), null, 2));
}
