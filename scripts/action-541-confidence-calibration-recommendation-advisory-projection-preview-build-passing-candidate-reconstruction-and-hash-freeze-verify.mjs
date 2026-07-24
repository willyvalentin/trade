#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const paths = {
  record:
    "docs/action-541-confidence-calibration-recommendation-advisory-projection-preview-build-passing-candidate-record.json",
  doc:
    "docs/action-541-confidence-calibration-recommendation-advisory-projection-preview-build-passing-candidate-reconstruction-and-hash-freeze.md",
  action518:
    "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json",
  action465:
    "docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json",
  action473:
    "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json",
  page: "app/page.tsx",
  route: "app/api/recommendations/evaluate-outcomes/route.ts",
  previewFlag: "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
};

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  historicalChangeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  historicalFullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  pageHash: "9fcbb64437773efbb7662779109f68f59fb624371c123bdec74a3b89392abf66",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  newChangeHash: "1ed32886de0eb3522f648ad3b8522ada7b6de905098c4fa141bc33e77bfa5570",
  newFullHash: "f416ea941168ac0a730fee70b059a78fd760bfb7238f94c06369f241b3ab68ce",
};

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fileSha256(relativePath) {
  return sha256(readFileSync(join(repoRoot, relativePath)));
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortValue(value[key])]),
    );
  }
  return value;
}

function canonical(value) {
  return JSON.stringify(sortValue(value));
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
  const action518 = readJson(paths.action518);
  const action465 = readJson(paths.action465);
  const action473 = readJson(paths.action473);
  const pageSource = read(paths.page);
  const routeSource = read(paths.route);
  const previewSource = read(paths.previewFlag);
  const pageEntry = {
    path: paths.page,
    sha256: expected.pageHash,
    classification: "required_turbopack_build_source_path_addition",
    provenance: "action_540_root_page_dynamic_rendering_contract_for_turbopack",
    source_contract: "connection_boundary_before_historical_candle_storage_schema_read",
  };
  const newInventory = [...action518.new_changed_file_inventory, pageEntry].sort((a, b) =>
    a.path.localeCompare(b.path),
  );
  const changedPaths = newInventory.map((entry) => entry.path).sort();
  const changedHashes = Object.fromEntries(newInventory.map((entry) => [entry.path, entry.sha256]));
  const recomputedChangeHash = sha256(canonical(newInventory));
  const recomputedFullHash = sha256(
    canonical({
      schema_version: "action_541_build_passing_candidate_hash_material_v1",
      clean_base_identifier: expected.cleanBase,
      historical_action_518_change_candidate_hash: expected.historicalChangeHash,
      historical_action_518_full_candidate_inventory_hash: expected.historicalFullHash,
      historical_action_518_file_count: 32,
      new_candidate_file_count: 33,
      new_change_candidate_hash: recomputedChangeHash,
      candidate_classification:
        "build_passing_33_file_candidate_from_action_518_plus_action_540_root_page_dynamic_contract",
      changed_file_paths: changedPaths,
      changed_file_content_hashes: changedHashes,
      path_transition: {
        retained_path_count: 32,
        added_paths: [paths.page],
        removed_paths: [],
        modified_existing_paths: [],
      },
      route_state: {
        path: paths.route,
        sha256: expected.routeHash,
        export_surface: ["POST"],
        buildOutcomeEligibility_exported: false,
      },
      page_state: {
        path: paths.page,
        sha256: expected.pageHash,
        dynamic: "force-dynamic",
        connection_boundary_before_schema_read: true,
      },
      closure_result: {
        missing_paths: 0,
        unexpected_paths: 0,
        unrelated_dirty_files: 0,
        control_only_artifacts: 0,
        environment_file_count: 0,
        secret_file_count: 0,
        netlify_artifact_count: 0,
        post_trade_unrelated_paths: 0,
        runtime_dependency_closure: "complete",
        build_dependency_closure: "complete",
        missing_required_paths: 0,
        unresolved_versions: 0,
        runtime_projection_call_site_count: 1,
        preview_disabled_by_default: true,
      },
      validation_results: {
        candidate_integrity_verification: "passed",
        source_safety_verification: "passed",
        preview_disabled_verification: "passed",
        next_typegen: "passed",
        tsc_no_emit: "passed",
        lint: "passed_with_existing_warning",
        turbopack_build: "passed",
      },
      required_lockfile_hash: action473.required_lockfile_hash,
      required_manifest_hashes: action473.required_manifest_hashes,
      deployment_performed: false,
      preview_activated: false,
      candidate_authoritative: true,
      runtime_preview_state: "runtime_preview_waiting_for_operator_inputs",
    }),
  );

  pass(record.schema_version === "action_541_build_passing_candidate_record_v1", "record schema mismatch", failures);
  pass(record.clean_base_identifier === expected.cleanBase, "clean base mismatch", failures);
  pass(record.historical_candidate.file_count === 32, "historical file count mismatch", failures);
  pass(
    record.historical_candidate.change_candidate_hash === expected.historicalChangeHash,
    "historical change hash mismatch",
    failures,
  );
  pass(
    record.historical_candidate.full_candidate_inventory_hash === expected.historicalFullHash,
    "historical full hash mismatch",
    failures,
  );
  pass(!action518.new_changed_file_inventory.some((entry) => entry.path === paths.page), "Action 518 already contains page", failures);
  pass(action518.new_changed_file_inventory.length === 32, "Action 518 inventory count mismatch", failures);
  pass(record.path_transition.retained_path_count === 32, "retained path count mismatch", failures);
  pass(JSON.stringify(record.path_transition.added_paths) === JSON.stringify([paths.page]), "added path mismatch", failures);
  pass(record.path_transition.removed_path_count === 0, "removed path count mismatch", failures);
  pass(record.path_transition.modified_existing_paths.length === 0, "modified existing path mismatch", failures);
  pass(record.path_transition.resulting_file_count === 33, "resulting file count mismatch", failures);
  pass(newInventory.length === 33, "computed new inventory count mismatch", failures);
  pass(new Set(changedPaths).size === 33, "duplicate computed candidate paths", failures);
  pass(!changedPaths.some((path) => path.startsWith(".env")), "environment path included", failures);
  pass(!changedPaths.some((path) => path.startsWith(".netlify/")), "Netlify artifact included", failures);
  pass(!changedPaths.some((path) => path.startsWith("node_modules/")), "node_modules path included", failures);

  pass(fileSha256(paths.page) === expected.pageHash, "current page hash mismatch", failures);
  pass(record.action_540_page_fix.sha256 === expected.pageHash, "record page hash mismatch", failures);
  pass(pageSource.includes('import { connection } from "next/server";'), "missing connection import", failures);
  pass(pageSource.includes('export const dynamic = "force-dynamic";'), "missing force dynamic contract", failures);
  pass(pageSource.includes("await readHistoricalCandleStorageSchema()"), "schema read missing", failures);
  pass(pageSource.indexOf("await connection();") >= 0, "connection call missing", failures);
  pass(
    pageSource.indexOf("await connection();") <
      pageSource.indexOf("await readHistoricalCandleStorageSchema()"),
    "connection call does not precede schema read",
    failures,
  );
  pass(!pageSource.includes("mock") && !pageSource.includes("fallback"), "page introduced mock/fallback marker", failures);

  pass(fileSha256(paths.route) === expected.routeHash, "current route hash mismatch", failures);
  pass(record.route_state.sha256 === expected.routeHash, "record route hash mismatch", failures);
  pass(JSON.stringify(routeExports(routeSource)) === JSON.stringify(["POST"]), "route export surface mismatch", failures);
  pass(routeSource.includes("function buildOutcomeEligibility"), "module-private helper missing", failures);
  pass(!routeSource.includes("export function buildOutcomeEligibility"), "helper still exported", failures);
  pass(record.route_state.buildOutcomeEligibility_module_private === true, "record helper privacy mismatch", failures);

  pass(action465.self_referential_hash_exclusions?.length === 1, "Action 465 self-hash exclusion count mismatch", failures);
  pass(
    action465.self_referential_hash_exclusions?.[0] === paths.action465,
    "Action 465 self-hash exclusion path mismatch",
    failures,
  );
  pass(record.action_465_null_hash_exception_policy.preserved === true, "record null-hash policy not preserved", failures);
  pass(
    record.action_465_null_hash_exception_policy.self_referential_hash_exclusion_path === paths.action465,
    "record null-hash exclusion path mismatch",
    failures,
  );

  pass(recomputedChangeHash === expected.newChangeHash, "new change hash does not recompute", failures);
  pass(record.candidate_hashes.new_change_candidate_hash === expected.newChangeHash, "record new change hash mismatch", failures);
  pass(recomputedFullHash === expected.newFullHash, "new full hash does not recompute", failures);
  pass(
    record.candidate_hashes.new_full_candidate_inventory_hash === expected.newFullHash,
    "record new full hash mismatch",
    failures,
  );
  pass(record.candidate_hashes.new_candidate_file_count === 33, "record new file count mismatch", failures);

  for (const [key, expectedValue] of Object.entries({
    missing_paths: 0,
    unexpected_paths: 0,
    unrelated_dirty_files: 0,
    control_only_artifacts: 0,
    environment_file_count: 0,
    secret_file_count: 0,
    netlify_artifact_count: 0,
    credentials_count: 0,
    post_trade_unrelated_paths: 0,
    missing_required_paths: 0,
    unresolved_versions: 0,
    runtime_projection_call_site_count: 1,
  })) {
    pass(record.closure_result[key] === expectedValue, `closure result mismatch: ${key}`, failures);
  }
  pass(record.closure_result.runtime_dependency_closure === "complete", "runtime closure incomplete", failures);
  pass(record.closure_result.build_dependency_closure === "complete", "build closure incomplete", failures);
  pass(record.closure_result.preview_disabled_by_default === true, "preview not marked disabled", failures);
  pass(previewSource.includes('if (runtime === "production") return false;'), "preview not disabled in production", failures);
  pass(previewSource.includes('if (rawValue === undefined || rawValue === "") return false;'), "preview not disabled by default", failures);
  pass(previewSource.includes('return rawValue === "true";'), "preview not explicit opt-in", failures);

  for (const [key, expectedValue] of Object.entries({
    candidate_integrity_verification: "passed",
    source_safety_verification: "passed",
    preview_disabled_verification: "passed",
    next_typegen: "passed",
    tsc_no_emit: "passed",
    lint: "passed_with_existing_warning",
    turbopack_build: "passed",
    webpack_build: "not_run_turbopack_passed",
  })) {
    pass(record.validation_results[key] === expectedValue, `validation result mismatch: ${key}`, failures);
  }

  pass(record.candidate_authoritative === true, "candidate not authoritative", failures);
  pass(record.deployment_performed === false, "deployment performed", failures);
  pass(record.preview_activated === false, "preview activated", failures);
  pass(record.provider_call_executed === false, "provider call executed", failures);
  pass(record.supabase_call_executed_during_reconstruction === false, "Supabase call executed during reconstruction", failures);
  pass(record.source_behavior_changed_beyond_action_540 === false, "source behavior changed beyond Action 540", failures);
  pass(record.runtime_preview_state === "runtime_preview_waiting_for_operator_inputs", "runtime preview state mismatch", failures);
  pass(
    record.next_action === "action_542_final_preview_deployment_readiness_and_deploy_decision",
    "next action mismatch",
    failures,
  );

  pass(doc.includes(expected.newChangeHash), "doc missing new change hash", failures);
  pass(doc.includes(expected.newFullHash), "doc missing new full hash", failures);
  pass(doc.includes("Action 542"), "doc missing next action", failures);
}

if (failures.length > 0) {
  console.error(
    JSON.stringify(
      {
        action: 541,
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
      action: 541,
      verification: "passed",
      new_candidate_file_count: 33,
      app_page_hash: expected.pageHash,
      route_hash: expected.routeHash,
      new_change_candidate_hash: expected.newChangeHash,
      new_full_candidate_inventory_hash: expected.newFullHash,
      candidate_authoritative: true,
      deployment_performed: false,
      preview_activated: false,
    },
    null,
    2,
  ),
);
