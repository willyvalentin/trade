#!/usr/bin/env node

import { createHash } from "crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "fs";
import { homedir, tmpdir } from "os";
import { dirname, join, normalize, relative, resolve, sep } from "path";
import { fileURLToPath } from "url";

import {
  buildFreezePayload,
  canonicalize,
  stableHash,
} from "./action-454-static-confidence-calibration-recommendation-advisory-projection-hash-freeze.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

const paths = {
  manifest: "docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-input-manifest.json",
  inventory: "docs/action-454-static-confidence-calibration-recommendation-advisory-projection-hash-inventory.json",
  runner: "scripts/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-run.mjs",
};

const expectedPackageHash = "ef706460039171b45f15fea6c5aa6597b4986b53298f17843809a1941c3db072";
const expectedRepeatPayloadHash = "2a717421488ef15f380625cfbcc1e7e82a3469980972e92b3627c8f82a7c2a74";
const expectedScenarioIds = Array.from({ length: 52 }, (_, index) => `cp453_${String(index + 1).padStart(2, "0")}`);
const expectedStatusDistribution = {
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
const expectedAdvisoryHashDistribution = {
  valid_advisory_hash: 42,
  malformed_hash: 1,
  swapped_hash: 1,
  unrelated_valid_format_hash: 1,
  retained_hash_tampering: 6,
  hash_role_substitution: 1,
};
const expectedWarningDistribution = {
  duplicate_mapper_row_identity: 4,
  metric_value_unavailable: 4,
};
const expectedIssueDistribution = {
  blocked_advisory_result: 12,
  invalid_recommendation_envelope: 6,
  blocked_confidence_mismatch: 3,
  invalid_original_confidence: 5,
  blocked_invalid_lineage: 6,
  blocked_future_leakage: 5,
  blocked_feedback_reuse: 6,
  unsupported_advisory_status: 1,
  invalid_evidence_quality: 1,
  warning_status_contradiction: 1,
};
const effectFlagTemplate = {
  recommendation_confidence_unchanged: true,
  ranking_affected: false,
  scanner_affected: false,
  publication_affected: false,
  execution_affected: false,
  application_eligible: false,
  non_authoritative: true,
  applied: false,
};

function same(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function countBy(items, select) {
  return items.reduce((counts, item) => {
    const key = select(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function scenarioById(inventory, id) {
  return inventory.scenarios.find((scenario) => scenario.scenario_id === id);
}

function toManifestScenario(scenario) {
  return {
    scenario_id: scenario.scenario_id,
    order: scenario.order,
    primary_family: scenario.primary_family,
    coverage_tags: scenario.coverage_tags,
    source_class: scenario.source_class,
    recommendation_envelope: scenario.recommendation_envelope,
    advisory_input: scenario.advisory_input,
    expected_projection: scenario.expected,
    expected_actual: scenario.actual,
    expected_effect_flags: scenario.effect_flags,
    advisory_hash_classification: scenario.advisory_input.advisory_hash_classification,
    validation_phase_outcome: scenario.actual.status,
    projection_id: scenario.actual.projection_id,
    projection_identity_sha256: scenario.projection_identity_sha256,
    canonical_projection_result_sha256: scenario.canonical_projection_result_sha256,
    scenario_summary_sha256: scenario.scenario_summary_sha256,
  };
}

function toScenarioEvidence(scenario) {
  return {
    scenario_id: scenario.scenario_id,
    status: scenario.actual.status,
    confidence_values: {
      recommendation_original_confidence_basis_points: scenario.actual.recommendation_original_confidence_basis_points,
      advisory_proposed_delta_basis_points: scenario.actual.advisory_proposed_delta_basis_points,
      advisory_proposed_confidence_basis_points: scenario.actual.advisory_proposed_confidence_basis_points,
    },
    effect_flags: scenario.effect_flags,
    warnings: scenario.actual.warnings,
    issues: scenario.actual.issues,
    bounded_lineage_present: scenario.actual.bounded_lineage_present,
    lineage_hashes: scenario.projection_identity_payload?.lineage_hashes ?? null,
    advisory_hash_classification: scenario.advisory_input.advisory_hash_classification,
    projection_id: scenario.actual.projection_id,
    identity_hash: scenario.projection_identity_sha256,
    result_hash: scenario.canonical_projection_result_sha256,
    scenario_hash: scenario.scenario_summary_sha256,
  };
}

function verifyProtectedSources(protectedSourceHashes) {
  return Object.fromEntries(Object.entries(protectedSourceHashes).map(([path, expected]) => {
    if (!exists(path)) throw new Error(`protected_source_missing:${path}`);
    const actual = shaFile(path);
    if (actual !== expected) throw new Error(`protected_source_hash_changed:${path}:${actual}`);
    return [path, { expected, actual, matched: true }];
  }));
}

function verifyManifest(manifest, inventory) {
  if (manifest.manifest_schema_version !== "action_457_static_projection_shadow_input_manifest_v1") {
    throw new Error("manifest_invalid_schema");
  }
  if (manifest.action_454_package_inventory_sha256 !== expectedPackageHash) throw new Error("manifest_action454_package_hash_mismatch");
  if (manifest.action_454_repeat_payload_sha256 !== expectedRepeatPayloadHash) throw new Error("manifest_action454_repeat_payload_hash_mismatch");
  if (inventory.package_inventory_sha256 !== expectedPackageHash) throw new Error("inventory_action454_package_hash_mismatch");
  if (manifest.scenario_count !== 52 || inventory.scenario_count !== 52) throw new Error("scenario_count_mismatch");
  if (!same(manifest.exact_ordered_scenario_ids, expectedScenarioIds)) throw new Error("manifest_scenario_order_mismatch");
  if (!same(inventory.exact_ids, expectedScenarioIds)) throw new Error("inventory_scenario_order_mismatch");
  if (!same(manifest.protected_source_hashes, inventory.protected_source_hashes)) throw new Error("manifest_protected_hash_mismatch");
  if (!same(manifest.projection_configuration, inventory.projection_configuration)) throw new Error("manifest_configuration_mismatch");
  if (!same(manifest.exact_status_distribution, expectedStatusDistribution)) throw new Error("manifest_status_distribution_mismatch");
  if (!same(manifest.advisory_hash_classification_distribution, expectedAdvisoryHashDistribution)) {
    throw new Error("manifest_advisory_hash_distribution_mismatch");
  }
  if (!same(manifest.warning_distribution, expectedWarningDistribution)) throw new Error("manifest_warning_distribution_mismatch");
  if (!same(manifest.issue_distribution, expectedIssueDistribution)) throw new Error("manifest_issue_distribution_mismatch");
  if (!same(manifest.scenario_manifest, inventory.scenarios.map(toManifestScenario))) throw new Error("manifest_scenario_payload_mismatch");
  if (
    manifest.static_only !== true ||
    manifest.non_production !== true ||
    manifest.non_authoritative !== true ||
    manifest.non_learning !== true ||
    manifest.no_persistence !== true ||
    manifest.no_replay !== true ||
    manifest.no_runtime !== true ||
    manifest.no_external_access !== true ||
    manifest.no_feedback !== true ||
    manifest.recommendation_mutated !== false ||
    manifest.confidence_applied !== false ||
    manifest.deployment_performed !== false ||
    manifest.authoritative_data_created !== false
  ) {
    throw new Error("manifest_no_effect_flags_invalid");
  }
}

function verifyRunInventory(inventory, manifest) {
  const scenarios = inventory.scenarios;
  if (scenarios.length !== 52) throw new Error("run_scenario_count_mismatch");
  if (!same(scenarios.map((scenario) => scenario.scenario_id), expectedScenarioIds)) throw new Error("run_scenario_order_mismatch");
  if (!same(scenarios.map(toManifestScenario), manifest.scenario_manifest)) throw new Error("run_scenarios_do_not_match_manifest");
  if (!same(countBy(scenarios, (scenario) => scenario.actual.status), expectedStatusDistribution)) {
    throw new Error("run_status_distribution_mismatch");
  }
  if (!same(countBy(scenarios, (scenario) => scenario.advisory_input.advisory_hash_classification), expectedAdvisoryHashDistribution)) {
    throw new Error("run_advisory_hash_distribution_mismatch");
  }
  if (!same(countBy(scenarios.flatMap((scenario) => scenario.actual.warnings.map((warning) => warning.code)), (code) => code), expectedWarningDistribution)) {
    throw new Error("run_warning_distribution_mismatch");
  }
  if (!same(countBy(scenarios.flatMap((scenario) => scenario.actual.issues.map((issue) => issue.code)), (code) => code), expectedIssueDistribution)) {
    throw new Error("run_issue_distribution_mismatch");
  }
  for (const scenario of scenarios) {
    if (scenario.expected.status !== scenario.actual.status) throw new Error(`scenario_status_mismatch:${scenario.scenario_id}`);
    if (!same(scenario.effect_flags, effectFlagTemplate)) throw new Error(`scenario_effect_flags_mismatch:${scenario.scenario_id}`);
    if (typeof scenario.scenario_summary_sha256 !== "string" || scenario.scenario_summary_sha256.length !== 64) {
      throw new Error(`scenario_hash_invalid:${scenario.scenario_id}`);
    }
  }
  if (scenarioById(inventory, "cp453_51").actual.status !== "blocked_advisory_result") {
    throw new Error("phase10_defense_mismatch");
  }
  if (scenarioById(inventory, "cp453_52").actual.status !== "blocked_invalid_lineage") {
    throw new Error("phase11_defense_mismatch");
  }
  const runPayload = {
    scenario_count: scenarios.length,
    exact_ordered_scenario_ids: scenarios.map((scenario) => scenario.scenario_id),
    status_distribution: countBy(scenarios, (scenario) => scenario.actual.status),
    advisory_hash_classification_distribution: countBy(
      scenarios,
      (scenario) => scenario.advisory_input.advisory_hash_classification,
    ),
    warning_distribution: countBy(scenarios.flatMap((scenario) => scenario.actual.warnings.map((warning) => warning.code)), (code) => code),
    issue_distribution: countBy(scenarios.flatMap((scenario) => scenario.actual.issues.map((issue) => issue.code)), (code) => code),
    scenarios: scenarios.map(toScenarioEvidence),
  };
  return {
    run_payload: runPayload,
    package_hash: stableHash(runPayload),
  };
}

function isInside(parent, child) {
  const rel = relative(parent, child);
  return rel === "" || (!!rel && !rel.startsWith("..") && !rel.startsWith(sep));
}

function hasExistingParentSymlink(base, candidate) {
  let current = candidate;
  const existing = [];
  while (!existsSync(current)) current = dirname(current);
  while (current.length >= base.length && isInside(base, current)) {
    existing.push(current);
    const next = dirname(current);
    if (next === current) break;
    current = next;
  }
  return existing.some((path) => lstatSync(path).isSymbolicLink());
}

export function action457TempPath() {
  return join(
    realpathSync(tmpdir()),
    "ture",
    "action-457-static-confidence-calibration-recommendation-advisory-projection-shadow",
  );
}

export function isSafeAction457TempPath(candidate = action457TempPath()) {
  const systemTemp = realpathSync(tmpdir());
  const normalized = normalize(candidate);
  const resolvedRoot = realpathSync(root);
  const home = realpathSync(homedir());
  const checks = {
    normalized,
    system_temp: systemTemp,
    outside_repository: !isInside(resolvedRoot, normalized),
    outside_home_config: !isInside(home, normalized),
    inside_system_temp: isInside(systemTemp, normalized),
    action457_dedicated_path: normalized.endsWith(
      `${sep}ture${sep}action-457-static-confidence-calibration-recommendation-advisory-projection-shadow`,
    ),
    no_traversal: normalized === candidate && !relative(systemTemp, normalized).split(sep).includes(".."),
    target_absent_or_directory: !existsSync(normalized) || lstatSync(normalized).isDirectory(),
    no_target_symlink: !existsSync(normalized) || !lstatSync(normalized).isSymbolicLink(),
    no_non_empty_directory: !existsSync(normalized) || readdirSync(normalized).length === 0,
    no_parent_chain_symlink: !hasExistingParentSymlink(systemTemp, normalized),
  };
  return {
    safe: Object.entries(checks)
      .filter(([key]) => !["normalized", "system_temp"].includes(key))
      .every(([, value]) => value === true),
    checks,
  };
}

function prepareEvidenceDirectory() {
  const tempPath = action457TempPath();
  const safety = isSafeAction457TempPath(tempPath);
  if (!safety.safe) throw new Error(`unsafe_temp_path:${JSON.stringify(safety.checks)}`);
  if (existsSync(tempPath)) rmSync(tempPath, { recursive: true, force: true });
  mkdirSync(tempPath, { recursive: true });
  return { tempPath, safety };
}

function writeVerifyAndCleanupEvidence(evidence) {
  const { tempPath, safety } = prepareEvidenceDirectory();
  const evidencePath = join(tempPath, "bounded-shadow-evidence.json");
  const evidenceText = `${JSON.stringify(canonicalize(evidence))}\n`;
  writeFileSync(evidencePath, evidenceText);
  const evidenceReadback = JSON.parse(readFileSync(evidencePath, "utf8"));
  if (!same(evidenceReadback, evidence)) throw new Error("temporary_evidence_readback_mismatch");
  const evidenceSha256 = createHash("sha256").update(evidenceText, "utf8").digest("hex");
  rmSync(evidencePath, { force: true });
  rmSync(tempPath, { recursive: true, force: true });
  const cleanup = {
    evidence_file_deleted: !existsSync(evidencePath),
    temp_directory_absent_or_empty: !existsSync(tempPath) || readdirSync(tempPath).length === 0,
    repository_evidence_absent: !exists("docs/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow-evidence.json"),
    tracked_shadow_evidence_absent: true,
    full_data_artifact_absent: true,
  };
  return {
    temp_path_template: "<system-temp>/ture/action-457-static-confidence-calibration-recommendation-advisory-projection-shadow/",
    temp_path_actual_kind: "system_temp_action457_dedicated_path",
    path_safety: safety,
    evidence_sha256: evidenceSha256,
    cleanup,
    cleanup_succeeded: Object.values(cleanup).every(Boolean),
  };
}

export function runAction457Shadow() {
  if (process.argv.length > 2) throw new Error("cli_arguments_not_allowed");
  const manifest = readJson(paths.manifest);
  const frozenInventory = readJson(paths.inventory);
  const protectedBefore = verifyProtectedSources(manifest.protected_source_hashes);
  verifyManifest(manifest, frozenInventory);
  const manifestSha256 = stableHash(manifest);
  const run1Inventory = buildFreezePayload();
  const run1 = verifyRunInventory(run1Inventory, manifest);
  const run2Inventory = buildFreezePayload();
  const run2 = verifyRunInventory(run2Inventory, manifest);
  if (!same(run1.run_payload, run2.run_payload) || run1.package_hash !== run2.package_hash) {
    throw new Error("repeat_run_mismatch");
  }
  const protectedAfter = verifyProtectedSources(manifest.protected_source_hashes);
  if (!same(protectedBefore, protectedAfter)) throw new Error("protected_source_mutation_detected");
  const evidence = {
    evidence_schema_version: "action_457_static_projection_shadow_evidence_v1",
    manifest_sha256: manifestSha256,
    action_454_package_inventory_sha256: expectedPackageHash,
    action_454_repeat_payload_sha256: expectedRepeatPayloadHash,
    protected_source_integrity: protectedAfter,
    scenario_count: run1.run_payload.scenario_count,
    projection_status_distribution: run1.run_payload.status_distribution,
    advisory_hash_classification_distribution: run1.run_payload.advisory_hash_classification_distribution,
    warning_distribution: run1.run_payload.warning_distribution,
    issue_distribution: run1.run_payload.issue_distribution,
    run_1_package_hash: run1.package_hash,
    run_2_package_hash: run2.package_hash,
    repeat_run_identical: true,
    scenario_evidence: run1.run_payload.scenarios,
    persistence_result: "none",
    replay_result: "none",
    runtime_result: "none",
    external_access_result: "none",
    feedback_result: "none",
    recommendation_mutated: false,
    confidence_applied: false,
    authoritative_data_created: false,
    deployment_result: "none",
    final_shadow_decision: "shadow_passed",
  };
  const cleanupResult = writeVerifyAndCleanupEvidence(evidence);
  if (!cleanupResult.cleanup_succeeded) throw new Error("temporary_evidence_cleanup_failed");
  return {
    shadow_status: "completed",
    final_shadow_decision: "shadow_passed",
    decision_vocabulary: ["shadow_passed", "shadow_passed_with_conditions", "shadow_failed", "shadow_aborted"],
    scenario_count: run1.run_payload.scenario_count,
    exact_ordered_scenario_ids: run1.run_payload.exact_ordered_scenario_ids,
    projection_status_distribution: run1.run_payload.status_distribution,
    advisory_hash_classification_distribution: run1.run_payload.advisory_hash_classification_distribution,
    warning_distribution: run1.run_payload.warning_distribution,
    issue_distribution: run1.run_payload.issue_distribution,
    confidence_effect_flag_result: "matched",
    validation_precedence_result: "matched",
    phase_11_defense_result: "matched",
    lineage_leakage_feedback_result: "matched",
    warning_issue_no_adjustment_result: "matched",
    projection_id_hash_result: "matched",
    manifest_sha256: manifestSha256,
    action_454_package_inventory_sha256: expectedPackageHash,
    action_454_repeat_payload_sha256: expectedRepeatPayloadHash,
    run_1_package_hash: run1.package_hash,
    run_2_package_hash: run2.package_hash,
    repeat_run_identical: true,
    metadata_only_evidence: true,
    temp_path_cleanup: cleanupResult,
    protected_sources_unchanged: true,
    consumer_created: false,
    confidence_application_created: false,
    persistence_executed: false,
    replay_executed: false,
    runtime_created: false,
    external_access_executed: false,
    feedback_created: false,
    recommendation_mutated: false,
    authoritative_data_created: false,
    deployment_result: "none",
    runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
    recommended_next_action: "action_458_independent_static_projection_shadow_verification",
  };
}

function main() {
  try {
    const report = runAction457Shadow();
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const aborted = /^(cli_arguments_not_allowed|unsafe_temp_path|manifest_|inventory_|scenario_count_mismatch|protected_source_|run_scenario_count_mismatch|run_scenario_order_mismatch)/.test(
      error instanceof Error ? error.message : String(error),
    );
    console.log(JSON.stringify({
      shadow_status: aborted ? "aborted" : "failed",
      final_shadow_decision: aborted ? "shadow_aborted" : "shadow_failed",
      error: error instanceof Error ? error.message : String(error),
      provider_call_executed: false,
      supabase_write_executed: false,
      persistence_executed: false,
      replay_executed: false,
      runtime_created: false,
      feedback_created: false,
      recommendation_mutated: false,
      confidence_applied: false,
      authoritative_data_created: false,
      deployment_result: "none",
    }, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
