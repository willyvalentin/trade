#!/usr/bin/env node

import { spawnSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const sha256Text = (text) => createHash("sha256").update(text, "utf8").digest("hex");

const paths = {
  doc: "docs/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.md",
  verifier: "scripts/action-450-projection-advisory-status-hash-binding-remediation-approval-gate-verify.mjs",
  test: "tests/e2e/action-450-projection-advisory-status-hash-binding-remediation-approval-gate.spec.ts",
  projection: "lib/confidence-calibration-recommendation-advisory-projection.ts",
  advisory: "lib/confidence-calibration-advisory-adapter.ts",
  calibration: "lib/pure-confidence-calibration.ts",
  action441Inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  action441Freezer: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
  action444Manifest: "docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json",
  action444Runner: "scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs",
  action448Verifier: "scripts/action-448-confidence-calibration-recommendation-advisory-projection-implementation-verify.mjs",
  action449Verifier: "scripts/action-449-independent-confidence-calibration-recommendation-advisory-projection-verification-verify.mjs",
};

const protectedSourcePaths = [
  paths.projection,
  paths.advisory,
  paths.calibration,
  paths.action441Inventory,
  paths.action441Freezer,
  paths.action444Manifest,
  paths.action444Runner,
].filter(exists);

const protectedBefore = Object.fromEntries(protectedSourcePaths.map((path) => [path, sha256Text(read(path))]));

const expected = {
  approvalDecision: "approved",
  approvalVocabulary: ["approved", "approved_with_conditions", "blocked"],
  rootCause: "projection_advisory_semantic_result_hash_does_not_bind_status",
  runtimePreviewStatus: "runtime_preview_waiting_for_operator_inputs",
  nextAction: "action_451_projection_advisory_status_hash_binding_remediation",
  mandatoryAudit: "action_452_independent_post_remediation_projection_verification",
  failedAction449Condition: "advisory_result_hash_audit",
  projectionExport: "buildConfidenceCalibrationRecommendationProjection",
  publicTypes: [
    "ImmutableRecommendationProjectionEnvelope",
    "FrozenRecommendationProjectionConfiguration",
    "ConfidenceCalibrationRecommendationProjectionResult",
  ],
  semanticFields: [
    "status",
    "advisory_id",
    "recommendation_fingerprint",
    "recommendation_snapshot_hash",
    "original_confidence",
    "proposed_delta",
    "proposed_calibrated_confidence",
    "calibration_status",
    "calibration_id",
    "calibration_identity_hash",
    "calibration_result_hash",
    "warnings",
    "issues",
    "bounded_lineage",
    "advisory_eligible",
    "advisory_visible",
    "application_eligible",
    "non_authoritative",
    "applied",
    "bounded_reasons",
    "schema_version",
    "configuration_version",
  ],
  statuses: [
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
  ],
  validationOrder: [
    "Top-level input shape",
    "Projection configuration",
    "Recommendation envelope shape",
    "Recommendation fingerprint",
    "Recommendation snapshot lineage",
    "Recommendation original confidence",
    "Advisory result shape",
    "Advisory status eligibility",
    "Recommendation/advisory confidence agreement",
    "Advisory identity and result hashes",
    "Recommendation/advisory lineage agreement",
    "Anti-leakage",
    "Anti-feedback",
    "Warning/issue compatibility",
    "Projection output construction",
  ],
  retainedHashAttacks: [
    "advisory status",
    "advisory ID",
    "recommendation fingerprint",
    "recommendation snapshot hash",
    "original confidence",
    "proposed delta",
    "proposed calibrated confidence",
    "calibration status",
    "calibration ID",
    "calibration identity hash",
    "calibration result hash",
    "warning code",
    "warning path",
    "warning severity",
    "warning messageKey",
    "issue code",
    "issue path",
    "issue severity",
    "issue messageKey",
    "lineage fields",
    "advisory visibility",
    "advisory eligibility",
    "application eligibility",
    "non_authoritative",
    "applied",
    "bounded reasons",
    "configuration version",
    "combined mutations",
  ],
  swappedHashAttacks: [
    "advisory result hash from another valid advisory",
    "advisory identity hash used as advisory result hash",
    "calibration result hash used as advisory result hash",
    "projection identity hash used as advisory result hash",
    "unrelated valid-format hash",
    "all-zero hash",
    "all-f hash",
  ],
};

function runJson(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", maxBuffer: 120 * 1024 * 1024 });
  const text = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status !== 0) throw new Error(text || `${command} failed`);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error(`json_output_missing:${command}`);
  return JSON.parse(text.slice(start, end + 1));
}

function rgFiles(pattern, targets) {
  const result = spawnSync("rg", ["-l", pattern, ...targets], { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) throw new Error(result.stderr || `rg failed:${pattern}`);
  return result.stdout.trim() ? result.stdout.trim().split("\n").sort() : [];
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const projectionSource = exists(paths.projection) ? read(paths.projection) : "";
const action448 = exists(paths.action448Verifier) ? runJson("node", [paths.action448Verifier]) : {};
const action449 = exists(paths.action449Verifier) ? runJson("node", [paths.action449Verifier]) : {};

const appOrLibProjectionConsumers = rgFiles(
  "buildConfidenceCalibrationRecommendationProjection|confidence-calibration-recommendation-advisory-projection",
  ["app", "lib"],
).filter((path) => path !== paths.projection);

const runtimeOrDeploymentFiles = [
  "app/api/confidence-calibration-recommendation-advisory-projection",
  "app/api/projection-advisory-status-hash-binding",
  "app/confidence-calibration-recommendation-advisory-projection",
  "app/action-450-projection-advisory-status-hash-binding-remediation-approval-gate",
  "netlify.toml",
].filter((path) => path !== "netlify.toml" ? exists(path) : false);

const forbiddenAction450Artifacts = [
  "docs/action-450-projection-advisory-status-hash-binding-remediation-fixture-manifest.json",
  "docs/action-450-projection-advisory-status-hash-binding-shadow-input-manifest.json",
  "scripts/action-450-projection-advisory-status-hash-binding-shadow-run.mjs",
  "scripts/action-450-projection-advisory-status-hash-binding-fixture-freeze.mjs",
  "lib/confidence-calibration-recommendation-advisory-projection-consumer.ts",
  "lib/recommendation-engine-confidence-calibration-advisory-projection-consumer.ts",
].filter(exists);

const checks = {
  documentation_exists: exists(paths.doc),
  verifier_exists: exists(paths.verifier),
  focused_test_exists: exists(paths.test),
  action448_healthy: action448.verification_status === "passed" && Array.isArray(action448.failed_checks) && action448.failed_checks.length === 0,
  action449_blocked_finding_bound: action449.verification_status === "passed" &&
    action449.readiness_decision === "blocked" &&
    action449.failed_conditions_count === 1 &&
    Array.isArray(action449.failed_conditions) &&
    action449.failed_conditions.includes(expected.failedAction449Condition),
  root_cause_classification_exact: doc.includes(expected.rootCause),
  approval_vocabulary_exact: expected.approvalVocabulary.every((item) => doc.includes(`\`${item}\``)),
  approval_decision_exact: doc.includes("Approval decision: `approved`"),
  advisory_semantic_payload_complete: expected.semanticFields.every((field) => doc.includes(`\`${field}\``)),
  advisory_status_binding_exact: doc.includes("Advisory status binding is mandatory") && doc.includes("`status` is semantic"),
  status_specific_shapes_complete: expected.statuses.every((status) => doc.includes(`\`${status}\``)) &&
    ["included_in_advisory_result_hash", "explicitly_non_semantic_and_excluded", "absent_for_status_specific_shape"].every((term) => doc.includes(`\`${term}\``)),
  canonicalization_policy_exact: [
    "recursive object-key sorting",
    "UTF-8",
    "no insignificant whitespace",
    "stable null/omission behavior",
    "signed-zero normalization",
    "canonical warning ordering",
    "canonical issue ordering",
    "canonical lineage ordering",
    "canonical reasons ordering",
    "no timestamps",
    "no runtime state",
    "no machine paths",
    "no UI state",
    "no randomness",
    "no output array position",
  ].every((term) => doc.includes(term)),
  hash_recomputation_policy_exact: doc.includes("SHA-256(canonical advisory semantic result payload)") &&
    doc.includes("lowercase hexadecimal digest") &&
    doc.includes("must not trust hash format alone") &&
    doc.includes("must not silently repair"),
  mismatch_behavior_exact: [
    "status: `blocked_advisory_result`",
    "issue code: `blocked_advisory_result`",
    "issue path: `/advisory/advisory_hash`",
    "issue severity: `error`",
    "confidence_calibration_recommendation_projection.blocked_advisory_result",
    "no raw expected hash",
    "no raw actual hash",
    "`recommendation_confidence_unchanged`: `true`",
    "`application_eligible`: `false`",
    "`ranking_affected`: `false`",
    "`scanner_affected`: `false`",
    "`publication_affected`: `false`",
    "`execution_affected`: `false`",
    "`non_authoritative`: `true`",
    "`applied`: `false`",
  ].every((term) => doc.includes(term)),
  validation_phase_placement_exact: expected.validationOrder.every((phase, index) => doc.includes(`${index + 1}. ${phase}`)) &&
    doc.includes("belongs in phase 10") &&
    doc.includes("phase 11 lineage") &&
    doc.includes("Phases 1-9 must still outrank phase 10"),
  phase_11_defense_in_depth: doc.includes("Case A: mutate advisory lineage") &&
    doc.includes("expect phase-10 `blocked_advisory_result`") &&
    doc.includes("Case B: mutate advisory lineage") &&
    doc.includes("expect phase-11 lineage block"),
  retained_hash_attack_matrix_complete: expected.retainedHashAttacks.every((item) => doc.includes(item)),
  swapped_hash_attack_matrix_complete: expected.swappedHashAttacks.every((item) => doc.includes(item)),
  semantic_order_equivalence_exact: ["warnings", "issues", "lineage records", "reasons", "object keys", "nested object keys"].every((term) => doc.includes(term)) &&
    doc.includes("Changed multiplicity or material content must block"),
  hash_role_separation_exact: [
    "calibration identity hash",
    "calibration result hash",
    "advisory identity hash",
    "advisory result hash",
    "projection identity/hash",
    "Substitution between roles must block",
  ].every((term) => doc.includes(term)),
  api_preservation_exact: projectionSource.includes(`export function ${expected.projectionExport}`) &&
    expected.publicTypes.every((typeName) => projectionSource.includes(`export type ${typeName}`)) &&
    doc.includes("No public hashing helper") &&
    doc.includes("No public hashing/canonicalization helpers") === false,
  unaffected_output_preservation_exact: [
    "projection status",
    "projection ID",
    "Recommendation fingerprint and snapshot hash",
    "confidence values",
    "bounded lineage",
    "`recommendation_confidence_unchanged`: `true`",
    "`non_authoritative`: `true`",
    "`applied`: `false`",
    "`application_eligible`: `false`",
    "projection_ready",
    "projection_ready_with_warnings",
    "projection_no_adjustment",
    "confidence mismatch",
    "lineage blocks",
    "leakage blocks",
    "feedback blocks",
  ].every((term) => doc.includes(term)),
  no_adjustment_preservation_exact: [
    "advisory status: `advisory_no_adjustment`",
    "proposed delta: `0`",
    "proposed confidence: exact Recommendation original confidence",
    "projection status: `projection_no_adjustment`",
  ].every((term) => doc.includes(term)),
  confidence_leakage_feedback_preservation_exact: [
    "exact basis-point equality",
    "must not round, repair, or rebase confidence",
    "Future outcomes",
    "post-entry evidence",
    "post-exit evidence",
    "Learning Dataset input",
    "Pattern Discovery evidence",
    "feedback event",
  ].every((term) => doc.includes(term)),
  recommendation_non_mutation_exact: doc.includes("Recommendation envelope") &&
    doc.includes("must not mutate on successful or blocked paths"),
  immutability_determinism_exact: doc.includes("Outputs remain deeply frozen") &&
    doc.includes("deterministic across repeated calls") &&
    doc.includes("No global-state contamination"),
  action451_boundary_exact: [
    "docs/action-451-projection-advisory-status-hash-binding-remediation.md",
    "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
    "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
    "Action 451 is limited to the targeted phase-10 hash-binding remediation",
  ].every((term) => doc.includes(term)),
  action451_regression_inventory_exact: [
    "advisory status",
    "advisory ID",
    "proposed calibrated confidence",
    "warning code",
    "issue code",
    "phase-10",
    "semantic warning reorder",
    "valid projection outputs unchanged",
  ].every((term) => doc.includes(term)),
  mandatory_action452_exact: doc.includes(expected.mandatoryAudit) &&
    doc.includes("Do not proceed directly to fixtures after Action 451"),
  deployment_prohibition_exact: [
    "Deployment required: no",
    "preview deployment authorized: `false`",
    "production deployment authorized: `false`",
    "runtime preview advancement authorized: `false`",
    "environment changes authorized: `false`",
    "Netlify changes authorized: `false`",
  ].every((term) => doc.includes(term)),
  runtime_preview_paused: doc.includes(expected.runtimePreviewStatus),
  no_implementation_change_during_verifier: true,
  no_forbidden_action450_artifacts: forbiddenAction450Artifacts.length === 0,
  no_app_or_lib_consumers: appOrLibProjectionConsumers.length === 0,
  no_runtime_or_deployment_files: runtimeOrDeploymentFiles.length === 0,
};

const protectedAfter = Object.fromEntries(protectedSourcePaths.map((path) => [path, sha256Text(read(path))]));
checks.no_implementation_change_during_verifier = JSON.stringify(protectedBefore) === JSON.stringify(protectedAfter);

const failedConditions = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

const approvalDecision = failedConditions.length === 0 ? expected.approvalDecision : "blocked";

const report = {
  verification_status: failedConditions.length === 0 ? "passed" : "failed",
  approval_decision: approvalDecision,
  approval_vocabulary: expected.approvalVocabulary,
  root_cause_classification: expected.rootCause,
  action449: {
    verification_status: action449.verification_status ?? "missing",
    readiness_decision: action449.readiness_decision ?? "missing",
    failed_conditions: action449.failed_conditions ?? [],
  },
  advisory_semantic_payload_policy: {
    source: "upstream_confidence_calibration_advisory_result_contract",
    projection_specific_approximation_allowed: false,
    advisory_status_hash_bound: true,
    included_fields: expected.semanticFields,
    excluded_non_semantic_fields: [
      "timestamps",
      "runtime_state",
      "machine_paths",
      "ui_state",
      "output_array_position",
      "local_process_details",
      "raw_rejected_values",
      "secrets_or_credentials",
    ],
  },
  status_specific_shapes: Object.fromEntries(expected.statuses.map((status) => [status, "classified_with_included_excluded_or_absent_fields"])),
  canonicalization_policy: {
    recursive_object_key_sorting: true,
    utf8: true,
    insignificant_whitespace: false,
    stable_null_omission_behavior: true,
    signed_zero_normalization: true,
    canonical_warning_issue_lineage_reason_ordering: true,
    runtime_state_allowed: false,
    timestamps_allowed: false,
    randomness_allowed: false,
  },
  hash_recomputation_policy: {
    algorithm: "sha256",
    input: "canonical_advisory_semantic_result_payload",
    compare_to_supplied_advisory_result_hash: true,
    trust_hash_format_only: false,
    repair_or_replace_supplied_hash: false,
  },
  mismatch_policy: {
    status: "blocked_advisory_result",
    issue_code: "blocked_advisory_result",
    issue_path: "/advisory/advisory_hash",
    issue_severity: "error",
    message_key: "confidence_calibration_recommendation_projection.blocked_advisory_result",
    raw_hashes_exposed: false,
    recommendation_confidence_unchanged: true,
    application_eligible: false,
    ranking_affected: false,
    scanner_affected: false,
    publication_affected: false,
    execution_affected: false,
    non_authoritative: true,
    applied: false,
  },
  validation_phase_policy: {
    phase: 10,
    phase_name: "Advisory identity and result hashes",
    outranks: ["phase_11_lineage", "phase_12_anti_leakage", "phase_13_anti_feedback", "phase_14_warning_issue_compatibility"],
    outranked_by: ["phases_1_to_9"],
  },
  phase_11_defense_in_depth: {
    retained_hash_lineage_mutation_blocks_at_phase_10: true,
    recomputed_hash_lineage_mutation_blocks_at_phase_11: true,
  },
  retained_hash_attack_matrix: expected.retainedHashAttacks,
  swapped_hash_attack_matrix: expected.swappedHashAttacks,
  semantic_order_equivalence_policy: {
    equivalent_warning_reorder_accepted: true,
    equivalent_issue_reorder_accepted: true,
    equivalent_lineage_reorder_accepted: true,
    equivalent_reason_reorder_accepted: true,
    object_key_reorder_accepted: true,
    material_content_change_blocks: true,
  },
  hash_role_separation: {
    calibration_identity_hash_substitution_blocks: true,
    calibration_result_hash_substitution_blocks: true,
    advisory_identity_hash_substitution_blocks: true,
    advisory_result_hash_substitution_blocks: true,
    projection_hash_substitution_blocks: true,
  },
  api_preservation: {
    module: paths.projection,
    runtime_export: expected.projectionExport,
    public_type_exports: expected.publicTypes,
    public_hashing_helpers_allowed: false,
  },
  unaffected_output_preservation: {
    projection_ready: true,
    projection_ready_with_warnings: true,
    projection_no_adjustment: true,
    blocked_statuses: true,
    confidence_mismatch: true,
    lineage_blocks: true,
    leakage_blocks: true,
    feedback_blocks: true,
    projection_ids_unchanged_for_unaffected_inputs: true,
  },
  future_remediation_boundary: {
    approved_files: [
      paths.projection,
      "docs/action-451-projection-advisory-status-hash-binding-remediation.md",
      "scripts/action-451-projection-advisory-status-hash-binding-remediation-verify.mjs",
      "tests/e2e/action-451-projection-advisory-status-hash-binding-remediation.spec.ts",
      "narrow Actions 447-450 compatibility updates",
      "minimal Actions 318-320 guard updates",
    ],
    fixtures_allowed: false,
    runners_allowed: false,
    manifests_allowed: false,
    shadow_allowed: false,
    consumers_allowed: false,
    runtime_allowed: false,
    deployment_allowed: false,
  },
  mandatory_action452: expected.mandatoryAudit,
  source_integrity: {
    before: protectedBefore,
    after: protectedAfter,
    unchanged: checks.no_implementation_change_during_verifier,
  },
  isolation: {
    app_or_lib_consumers: appOrLibProjectionConsumers,
    runtime_or_deployment_files: runtimeOrDeploymentFiles,
    forbidden_action450_artifacts: forbiddenAction450Artifacts,
  },
  safety: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    runtime_route_created: false,
    ui_consumer_created: false,
    recommendation_engine_consumer_created: false,
    confidence_applied: false,
    recommendation_mutated: false,
    ranking_changed: false,
    scanner_behavior_changed: false,
    publication_changed: false,
    execution_changed: false,
    feedback_executed: false,
    deployment_artifact_changed: false,
  },
  deployment_status: {
    deployment_required: false,
    preview_deployment_authorized: false,
    production_deployment_authorized: false,
    runtime_preview_advancement_authorized: false,
  },
  runtime_preview_status: expected.runtimePreviewStatus,
  passed_conditions_count: Object.keys(checks).length - failedConditions.length,
  failed_conditions_count: failedConditions.length,
  unresolved_conditions_count: 0,
  failed_conditions: failedConditions,
  unresolved_conditions: [],
  checks,
  unrelated_work_classification: "action_450_static_remediation_approval_gate_only",
  recommended_next_action: expected.nextAction,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exit(report.verification_status === "passed" ? 0 : 1);
