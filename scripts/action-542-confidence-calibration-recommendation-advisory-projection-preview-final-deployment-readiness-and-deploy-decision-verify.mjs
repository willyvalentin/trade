#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-542-confidence-calibration-recommendation-advisory-projection-preview-final-deployment-readiness-record.json",
  doc:
    "docs/action-542-confidence-calibration-recommendation-advisory-projection-preview-final-deployment-readiness-and-deploy-decision.md",
  action541:
    "docs/action-541-confidence-calibration-recommendation-advisory-projection-preview-build-passing-candidate-record.json",
  action465:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json",
  page: "app/page.tsx",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
  previewFlag: "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
  projectionPreview: "lib/confidence-calibration-recommendation-advisory-projection-preview.ts",
  projection: "lib/confidence-calibration-recommendation-advisory-projection.ts",
  adapter: "lib/confidence-calibration-advisory-adapter.ts",
  previewComponent: "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  fileCount: 33,
  changeHash: "1ed32886de0eb3522f648ad3b8522ada7b6de905098c4fa141bc33e77bfa5570",
  fullHash: "f416ea941168ac0a730fee70b059a78fd760bfb7238f94c06369f241b3ab68ce",
  pageHash: "9fcbb64437773efbb7662779109f68f59fb624371c123bdec74a3b89392abf66",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  siteId: "2b582e03-ac97-4371-8051-558d9980fb94",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function fileSha256(relativePath) {
  return createHash("sha256").update(readFileSync(join(repoRoot, relativePath))).digest("hex");
}

function routeExports(source) {
  return [...source.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/gm)].map(
    (match) => match[1],
  );
}

function pass(condition, message, failures) {
  if (!condition) failures.push(message);
}

const failures = [];
for (const requiredPath of Object.values(paths)) {
  pass(existsSync(join(repoRoot, requiredPath)), `missing required file: ${requiredPath}`, failures);
}

if (failures.length === 0) {
  const record = readJson(paths.record);
  const doc = read(paths.doc);
  const action541 = readJson(paths.action541);
  const action465 = readJson(paths.action465);
  const pageSource = read(paths.page);
  const routeSource = read(paths.route);
  const previewFlagSource = read(paths.previewFlag);
  const projectionPreviewSource = read(paths.projectionPreview);
  const projectionSource = read(paths.projection);
  const adapterSource = read(paths.adapter);
  const previewComponentSource = read(paths.previewComponent);

  pass(record.schema_version === "action_542_final_deployment_readiness_record_v1", "record schema mismatch", failures);
  pass(record.candidate_binding.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.candidate_binding.candidate_file_count === expected.fileCount, "file count mismatch", failures);
  pass(record.candidate_binding.change_candidate_hash === expected.changeHash, "change hash mismatch", failures);
  pass(record.candidate_binding.full_candidate_inventory_hash === expected.fullHash, "full hash mismatch", failures);
  pass(record.candidate_binding.app_page_hash === expected.pageHash, "record page hash mismatch", failures);
  pass(record.candidate_binding.evaluate_outcomes_route_hash === expected.routeHash, "record route hash mismatch", failures);
  pass(JSON.stringify(record.candidate_binding.route_export_surface) === JSON.stringify(["POST"]), "record route export mismatch", failures);
  pass(record.candidate_binding.action_465_null_hash_exception_exact_and_singular === true, "record null-hash binding mismatch", failures);

  pass(action541.candidate_hashes.new_candidate_file_count === expected.fileCount, "Action 541 file count mismatch", failures);
  pass(action541.candidate_hashes.new_change_candidate_hash === expected.changeHash, "Action 541 change hash mismatch", failures);
  pass(action541.candidate_hashes.new_full_candidate_inventory_hash === expected.fullHash, "Action 541 full hash mismatch", failures);
  pass(action541.action_540_page_fix.sha256 === expected.pageHash, "Action 541 page hash mismatch", failures);
  pass(action541.route_state.sha256 === expected.routeHash, "Action 541 route hash mismatch", failures);
  pass(action541.candidate_authoritative === true, "Action 541 candidate not authoritative", failures);
  pass(action541.deployment_performed === false, "Action 541 deployed", failures);
  pass(action541.preview_activated === false, "Action 541 activated preview", failures);

  pass(fileSha256(paths.page) === expected.pageHash, "current page hash mismatch", failures);
  pass(pageSource.includes('import { connection } from "next/server";'), "page missing connection import", failures);
  pass(pageSource.includes('export const dynamic = "force-dynamic";'), "page missing dynamic contract", failures);
  pass(pageSource.indexOf("await connection();") < pageSource.indexOf("await readHistoricalCandleStorageSchema()"), "page request boundary order mismatch", failures);
  pass(fileSha256(paths.route) === expected.routeHash, "current route hash mismatch", failures);
  pass(JSON.stringify(routeExports(routeSource)) === JSON.stringify(["POST"]), "current route export surface mismatch", failures);
  pass(routeSource.includes("function buildOutcomeEligibility"), "module-private helper missing", failures);
  pass(!routeSource.includes("export function buildOutcomeEligibility"), "helper still exported", failures);

  pass(action465.self_referential_hash_exclusions?.length === 1, "Action 465 self-hash exclusion count mismatch", failures);
  pass(action465.self_referential_hash_exclusions?.[0] === paths.action465, "Action 465 self-hash exclusion path mismatch", failures);

  pass(record.action_541_validation_summary.candidate_integrity === "passed", "candidate integrity not passed", failures);
  pass(record.action_541_validation_summary.source_safety === "passed", "source safety not passed", failures);
  pass(record.action_541_validation_summary.preview_disabled === "passed", "preview disabled not passed", failures);
  pass(record.action_541_validation_summary.next_typegen === "passed", "typegen not passed", failures);
  pass(record.action_541_validation_summary.typescript === "passed", "typescript not passed", failures);
  pass(record.action_541_validation_summary.lint === "passed_with_one_existing_warning", "lint result mismatch", failures);
  pass(record.action_541_validation_summary.turbopack_build === "passed", "Turbopack build not passed", failures);
  pass(record.action_541_validation_summary.webpack === "not_required", "Webpack status mismatch", failures);

  pass(record.preview_disabled_status.flag_name === "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED", "flag name mismatch", failures);
  pass(record.preview_disabled_status.required_initial_state === "absent_or_disabled", "initial preview state mismatch", failures);
  pass(record.preview_disabled_status.helper_result_when_absent === false, "absent flag result mismatch", failures);
  pass(record.preview_disabled_status.helper_result_in_production === false, "production flag result mismatch", failures);
  pass(record.preview_disabled_status.explicit_true_required === true, "explicit true not required", failures);
  pass(record.preview_disabled_status.alternate_activation_path_detected === false, "alternate activation detected", failures);
  pass(record.preview_disabled_status.deployment_environment_change_made_in_action_542 === false, "deployment env changed", failures);
  pass(previewFlagSource.includes('if (runtime === "production") return false;'), "flag not disabled in production", failures);
  pass(previewFlagSource.includes('if (rawValue === undefined || rawValue === "") return false;'), "flag not disabled when absent", failures);
  pass(previewFlagSource.includes('return rawValue === "true";'), "flag not explicit true opt-in", failures);

  for (const [key, expectedValue] of Object.entries({
    observation_only: true,
    disabled_by_default: true,
    non_authoritative: true,
    non_persistent: true,
    non_replayed: true,
    non_feedback_producing: true,
    provider_free: true,
    supabase_write_free: true,
    original_confidence_unchanged: true,
    recommendation_ranking_affected: false,
    scanner_selection_affected: false,
    publication_affected: false,
    execution_affected: false,
    add_trade_affected: false,
    risk_calculation_affected: false,
    position_sizing_affected: false,
  })) {
    pass(record.downstream_effect_checks[key] === expectedValue, `downstream effect mismatch: ${key}`, failures);
  }

  const safetySources = [projectionPreviewSource, projectionSource, adapterSource].join("\n");
  pass(safetySources.includes("no_persistence"), "no_persistence boundary missing", failures);
  pass(safetySources.includes("no_replay"), "no_replay boundary missing", failures);
  pass(safetySources.includes("no_feedback"), "no_feedback boundary missing", failures);
  pass(safetySources.includes("ranking_affected: false"), "ranking boundary missing", failures);
  pass(safetySources.includes("scanner_affected: false"), "scanner boundary missing", failures);
  pass(safetySources.includes("publication_affected: false"), "publication boundary missing", failures);
  pass(safetySources.includes("execution_affected: false"), "execution boundary missing", failures);
  pass(safetySources.includes("recommendation_confidence_unchanged: true"), "confidence unchanged boundary missing", failures);
  pass(!safetySources.includes("from(\"") && !safetySources.includes(".from("), "Supabase-style from call detected in preview helpers", failures);
  pass(!safetySources.includes(".insert(") && !safetySources.includes(".upsert("), "persistence write call detected in preview helpers", failures);
  pass(previewComponentSource.includes("if (!preview || preview.status === \"preview_disabled\") return null;"), "disabled preview component does not render null", failures);
  pass(previewComponentSource.includes("Preview only"), "preview-only UI copy missing", failures);
  pass(previewComponentSource.includes("Original Recommendation confidence remains active"), "original confidence UI copy missing", failures);

  pass(record.deployment_target.platform === "netlify", "deployment platform mismatch", failures);
  pass(record.deployment_target.site === "trade-vl", "deployment site mismatch", failures);
  pass(record.deployment_target.site_id === expected.siteId, "deployment site ID mismatch", failures);
  pass(record.deployment_target.team === "Valentin Labs AB", "deployment team mismatch", failures);
  pass(record.deployment_target.netlify_operation_performed === false, "Netlify operation performed", failures);
  pass(record.readiness_decision === "approved_for_preview_deployment", "readiness decision mismatch", failures);
  pass(record.unresolved_conditions.length === 0, "unresolved conditions present", failures);
  pass(record.post_deployment_smoke_checks.length === 9, "post-deployment smoke-check count mismatch", failures);
  pass(record.rollback_conditions.length === 7, "rollback condition count mismatch", failures);
  pass(record.deployment_performed === false, "deployment performed", failures);
  pass(record.preview_activated === false, "preview activated", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  pass(record.next_action === "operator_approved_preview_deployment_of_exact_action_541_candidate", "next action mismatch", failures);

  pass(doc.includes("approved_for_preview_deployment"), "doc missing readiness decision", failures);
  pass(doc.includes(expected.changeHash), "doc missing change hash", failures);
  pass(doc.includes(expected.fullHash), "doc missing full hash", failures);
  pass(doc.includes("No Netlify operation was performed"), "doc missing no-deploy statement", failures);
  pass(doc.includes("Rollback immediately"), "doc missing rollback section", failures);
}

if (failures.length > 0) {
  console.error(
    JSON.stringify(
      {
        action: 542,
        verification: "failed",
        failures,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      action: 542,
      verification: "passed",
      readiness_decision: "approved_for_preview_deployment",
      candidate_file_count: expected.fileCount,
      change_candidate_hash: expected.changeHash,
      full_candidate_inventory_hash: expected.fullHash,
      deployment_performed: false,
      preview_activated: false,
      next_action: "operator_approved_preview_deployment_of_exact_action_541_candidate",
    },
    null,
    2,
  ),
);
