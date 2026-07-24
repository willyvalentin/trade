#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");

const paths = {
  inventory: "docs/action-441-static-confidence-calibration-advisory-hash-inventory.json",
  doc: "docs/action-441-static-confidence-calibration-advisory-hash-freeze.md",
  freezer: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze.mjs",
  verifier: "scripts/action-441-static-confidence-calibration-advisory-hash-freeze-verify.mjs",
  test: "tests/e2e/action-441-static-confidence-calibration-advisory-hash-freeze.spec.ts",
};

const expectedStatusDistribution = {
  advisory_ready: 6,
  advisory_ready_with_warnings: 2,
  advisory_no_adjustment: 1,
  advisory_insufficient_evidence: 1,
  blocked_invalid_input: 6,
  blocked_confidence_mismatch: 3,
  blocked_invalid_lineage: 12,
  blocked_future_leakage: 6,
  blocked_calibration_result: 10,
  blocked_unsupported_status: 1,
};

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_number");
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
  throw new TypeError("unsupported_value");
}

function sha256(value) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
}

function countBy(values, keyFn) {
  return values.reduce((acc, value) => {
    const key = keyFn(value);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function numberMapEqual(left, right) {
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort(compareText);
  return keys.every((key) => left[key] === right[key]);
}

const inventory = exists(paths.inventory) ? JSON.parse(read(paths.inventory)) : null;
const doc = exists(paths.doc) ? read(paths.doc) : "";
const freezer = exists(paths.freezer) ? read(paths.freezer) : "";
const test = exists(paths.test) ? read(paths.test) : "";

const expectedIds = Array.from({ length: 48 }, (_, index) => `ca440_${String(index + 1).padStart(2, "0")}`);
const recomputedStatusDistribution = inventory ? countBy(inventory.scenarios, (scenario) => scenario.actual_status) : {};
const recomputedScenarioSummarySha256 = inventory ? sha256(inventory.scenarios.map((scenario) => ({
  id: scenario.id,
  order: scenario.order,
  actual_status: scenario.actual_status,
  advisory_hash: scenario.advisory_hash,
  canonical_advisory_result_sha256: scenario.canonical_advisory_result_sha256,
  warning_codes: scenario.warning_codes,
  issue_codes: scenario.issue_codes,
}))) : null;
const packageClone = inventory ? { ...inventory } : null;
if (packageClone) delete packageClone.package_inventory_sha256;
const recomputedPackageHash = packageClone ? sha256(packageClone) : null;

const forbiddenStrings = [
  "TWELVE_DATA_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AUTOMATION_SECRET",
  "TRADE_APP_PASSWORD",
  "process.env.TWELVE",
  "createClient(",
  "fetch(",
  "supabase.from(",
];

const checks = {
  doc_exists: exists(paths.doc),
  inventory_exists: exists(paths.inventory),
  freezer_exists: exists(paths.freezer),
  verifier_exists: exists(paths.verifier),
  test_exists: exists(paths.test),
  inventory_schema_version_frozen: inventory?.inventory_schema_version === "action_441_static_confidence_calibration_advisory_hash_inventory_v1",
  scenario_count_48: inventory?.scenario_count === 48 && inventory?.scenarios?.length === 48,
  scenario_ids_exact: JSON.stringify(inventory?.exact_scenario_ids) === JSON.stringify(expectedIds),
  scenario_order_exact: JSON.stringify(inventory?.exact_scenario_order) === JSON.stringify(expectedIds),
  status_distribution_exact: numberMapEqual(inventory?.advisory_status_distribution ?? {}, expectedStatusDistribution) &&
    numberMapEqual(recomputedStatusDistribution, expectedStatusDistribution),
  all_statuses_match_expected: inventory?.scenarios?.every((scenario) => scenario.status_matches_expected) === true,
  warning_distribution_present: Boolean(inventory?.warning_distribution),
  issue_distribution_present: Boolean(inventory?.issue_distribution),
  complete_legacy_distribution_present: Boolean(inventory?.complete_legacy_hash_distribution),
  complete_legacy_policy_frozen: inventory?.complete_legacy_hash_policy?.valid_complete_hash_accepted === true &&
    inventory?.complete_legacy_hash_policy?.valid_legacy_hash_accepted === true &&
    inventory?.complete_legacy_hash_policy?.malformed_hash_blocked === true &&
    inventory?.complete_legacy_hash_policy?.legacy_bypass_blocked === true,
  confidence_binding_frozen: inventory?.confidence_binding_policy?.exact_match_ready === true &&
    inventory?.confidence_binding_policy?.mismatch_blocks === true &&
    inventory?.confidence_binding_policy?.invalid_confidence_blocks === true,
  lineage_leakage_feedback_frozen: inventory?.lineage_leakage_feedback_policy?.recommendation_lineage_blocks === true &&
    inventory?.lineage_leakage_feedback_policy?.pattern_insight_lineage_blocks === true &&
    inventory?.lineage_leakage_feedback_policy?.anti_leakage_blocks === true &&
    inventory?.lineage_leakage_feedback_policy?.anti_feedback_blocks === true,
  scenario_summary_hash_matches: inventory?.scenario_summary_sha256 === recomputedScenarioSummarySha256,
  package_inventory_hash_matches: inventory?.package_inventory_sha256 === recomputedPackageHash,
  protected_source_hashes_match: inventory && Object.values(inventory.protected_source_hashes).every((item) => item.matches_expected),
  metadata_only_boundary: inventory?.output_boundary?.metadata_only === true &&
    inventory?.output_boundary?.recommendation_objects_retained === false &&
    inventory?.output_boundary?.full_calibration_results_retained === false &&
    inventory?.output_boundary?.provider_payloads_retained === false &&
    inventory?.output_boundary?.supabase_payloads_retained === false &&
    inventory?.output_boundary?.timestamps_retained === false &&
    inventory?.output_boundary?.machine_paths_retained === false,
  safety_flags_false: inventory?.provider_call_executed === false &&
    inventory?.provider_call_attempted === false &&
    inventory?.supabase_read_executed === false &&
    inventory?.supabase_write_executed === false &&
    inventory?.replay_executed === false &&
    inventory?.synthetic_outcomes_persisted === false &&
    inventory?.scanner_behavior_changed === false &&
    inventory?.live_ranking_changed === false &&
    inventory?.publication_changed === false &&
    inventory?.recommendation_mutated === false &&
    inventory?.confidence_applied === false,
  runtime_preview_paused: inventory?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs" &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  freezer_exact_repeat_policy: freezer.includes("const first = buildInventory();") &&
    freezer.includes("const second = buildInventory();") &&
    freezer.includes("repeat_freeze_differs"),
  no_forbidden_secret_or_external_terms: forbiddenStrings.every((term) => !doc.includes(term) && !test.includes(term) && !read(paths.inventory).includes(term)),
  next_action_442_declared: doc.includes("Action 442 independent verification") &&
    inventory?.recommended_next_action === "action_442_independent_confidence_calibration_advisory_hash_freeze_verification",
};

const failedChecks = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  failed_checks: failedChecks,
  checks,
  scenario_count: inventory?.scenario_count ?? 0,
  advisory_status_distribution: inventory?.advisory_status_distribution ?? {},
  scenario_summary_sha256: inventory?.scenario_summary_sha256 ?? null,
  package_inventory_sha256: inventory?.package_inventory_sha256 ?? null,
  safety: {
    provider_call_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    recommendation_mutated: false,
    confidence_applied: false,
  },
};

console.log(JSON.stringify(report, null, 2));
if (report.verification_status !== "passed") process.exit(1);
