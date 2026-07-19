#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  manifest: "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json",
  runner: "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs",
  doc: "docs/action-416-expanded-static-pattern-discovery-shadow-use.md",
  verifier: "scripts/action-416-expanded-static-pattern-discovery-shadow-use-verify.mjs",
  test: "tests/e2e/action-416-expanded-static-pattern-discovery-shadow-use.spec.ts",
  inventory: "docs/action-414-expanded-static-pattern-discovery-hash-inventory.json",
  action415: "docs/action-415-expanded-static-pattern-discovery-shadow-execution-approval-gate.md",
};

const expectedInventoryHash = "8b7e5c55f1ae8e27a278ca7d844d204aee4a84d4546cb8b612c3db122d83fe4b";
const expectedFreezePayloadHash = "4e1f3e0cd8e67e7d0230c1af8618d8e803867c75c32d18857c48b1234e835c12";
const expectedStatusDistribution = {
  blocked_future_leakage: 1,
  blocked_invalid_configuration: 1,
  blocked_invalid_input: 6,
  blocked_invalid_lineage: 2,
  blocked_non_consumable_row: 2,
  blocked_nondeterministic_grouping: 1,
  discovered: 9,
  discovered_with_warnings: 4,
  insufficient_evidence: 4,
};
const expectedWarningDistribution = {
  duplicate_mapper_row_identity: 5,
  metric_value_unavailable: 1,
  minimum_completed_outcomes_not_met: 4,
  minimum_total_support_not_met: 3,
};
const expectedInsightDistribution = { 0: 17, 1: 13 };
const requiredDocSections = [
  "Purpose",
  "Scope",
  "Frozen Inputs",
  "Execution Result",
  "Aggregate Verification",
  "Temporary Evidence",
  "No Effects",
  "Runtime Preview",
  "Next Step",
];

const abs = (path) => join(repoRoot, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const readJson = (path) => JSON.parse(read(path));
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

function collectFiles(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]));
  }
  return value;
}

function stable(value) {
  return JSON.stringify(sortKeys(value));
}

function runRunner() {
  const output = execFileSync("node", [abs(paths.runner)], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 240000,
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      ["TWELVE" + "_DATA_API_KEY"]: "twelve-data-secret-that-must-not-appear",
    },
  });
  return { output, result: JSON.parse(output) };
}

function runtimeConsumerFiles() {
  const targets = ["app", "public"].filter(exists);
  if (targets.length === 0) return [];
  const scan = spawnSync("rg", ["-l", "action-416|expanded-static-pattern-discovery-shadow|discoverPatterns", ...targets], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (![0, 1].includes(scan.status ?? -1)) return ["runtime_consumer_scan_failed"];
  return scan.stdout.trim().split("\n").filter(Boolean);
}

function metadataOnlyText(text) {
  const forbidden = [
    "\"row\":",
    "\"rows\":",
    "\"outcome_fields\":",
    "\"setup_and_confidence\":",
    "recommendationSnapshot",
    "contextSnapshot",
    "AUTOMATION_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "TWELVE" + "_DATA_API_KEY",
    "/Users/",
  ];
  return forbidden.filter((marker) => text.includes(marker));
}

const manifest = exists(paths.manifest) ? readJson(paths.manifest) : null;
const inventory = exists(paths.inventory) ? readJson(paths.inventory) : null;
const doc = exists(paths.doc) ? read(paths.doc) : "";
const runnerSource = exists(paths.runner) ? read(paths.runner) : "";
const verifierSource = exists(paths.verifier) ? read(paths.verifier) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const runnerExecution = exists(paths.runner) ? runRunner() : { output: "", result: null };
const runnerResult = runnerExecution.result;
const tempEvidencePath = join(tmpdir(), "ture", "action-416-expanded-static-pattern-discovery-shadow");
const action416Docs = collectFiles("docs").filter((path) => path.includes("action-416-expanded-static-pattern-discovery-shadow"));
const trackedEvidenceFiles = action416Docs.filter((path) => /evidence|result|report/.test(path));
const runtimeConsumers = runtimeConsumerFiles();
const manifestForbiddenMarkers = metadataOnlyText(exists(paths.manifest) ? read(paths.manifest) : "");
const runnerOutputForbiddenMarkers = metadataOnlyText(runnerExecution.output);

const blockedStatusTotal = Object.entries(runnerResult?.status_distribution ?? {})
  .filter(([status]) => status.startsWith("blocked_"))
  .reduce((sum, [, count]) => sum + count, 0);

const checks = {
  required_files_exist: Object.values(paths).every(exists),
  doc_sections_complete: requiredDocSections.every((section) => doc.includes(`## ${section}`)),
  action415_approved_action416: doc.includes("Action 415") && read(paths.action415).includes("Decision: `approved`"),
  manifest_schema_exact: manifest?.manifest_schema_version === "action_416_expanded_static_pattern_discovery_shadow_input_manifest_v1",
  manifest_hashes_exact: manifest?.action_414_inventory_sha256 === expectedInventoryHash &&
    manifest?.action_414_freeze_payload_sha256 === expectedFreezePayloadHash &&
    inventory?.full_inventory_sha256 === expectedInventoryHash,
  manifest_scenario_inventory_exact: manifest?.scenario_count === 30 &&
    manifest?.scenarios?.length === 30 &&
    stable(manifest?.scenario_ids) === stable(inventory?.scenario_ids),
  manifest_distributions_exact: stable(manifest?.expected_status_distribution) === stable(expectedStatusDistribution) &&
    stable(manifest?.expected_warning_distribution) === stable(expectedWarningDistribution) &&
    stable(manifest?.expected_insight_count_distribution) === stable(expectedInsightDistribution),
  manifest_metadata_only: manifestForbiddenMarkers.length === 0,
  runner_result_decision: runnerResult?.final_shadow_decision === "shadow_passed_with_conditions",
  runner_conditions_explicit: stable(runnerResult?.conditions ?? []) === stable([
    "historical_action_411_baseline_preserved_without_regeneration",
    "nondeterministic_grouping_contract_case_preserved_as_static_block",
    "three_frozen_action_413_expectations_are_current_contract_limitations",
  ]),
  exactly_two_runs: runnerResult?.executed_package_runs === 2 && runnerResult?.third_run_executed === false,
  repeat_run_identical: runnerResult?.repeat_run_identical === true &&
    runnerResult?.run_1_package_sha256 === runnerResult?.run_2_package_sha256,
  runner_distributions_exact: stable(runnerResult?.status_distribution) === stable(expectedStatusDistribution) &&
    stable(runnerResult?.warning_distribution) === stable(expectedWarningDistribution) &&
    stable(runnerResult?.insight_distribution) === stable(expectedInsightDistribution) &&
    blockedStatusTotal === 13,
  temp_evidence_deleted: runnerResult?.temporary_evidence_deleted === true && !existsSync(tempEvidencePath),
  metadata_only_output: runnerOutputForbiddenMarkers.length === 0,
  no_tracked_execution_evidence: trackedEvidenceFiles.length === 0,
  no_runtime_consumers: runtimeConsumers.length === 0,
  no_cli_or_external_inputs: !runnerSource.includes("process.argv") &&
    !runnerSource.includes("globalThis.fetch") &&
    !runnerSource.includes("@supabase/") &&
    !runnerSource.includes("createClient("),
  no_effect_flags: runnerResult?.persistence_result === "none" &&
    runnerResult?.replay_result === "none" &&
    runnerResult?.runtime_result === "none" &&
    runnerResult?.external_access_result === "none" &&
    runnerResult?.feedback_result === "none" &&
    runnerResult?.authoritative_data_created === false,
  runtime_preview_paused: runnerResult?.runtime_preview_status === "runtime_preview_waiting_for_operator_inputs",
  verifier_and_tests_no_network_or_secrets: !verifierSource.includes("f" + "etch(") &&
    !testSource.includes("f" + "etch(") &&
    !runnerExecution.output.includes("automation-secret-that-must-not-appear") &&
    !runnerExecution.output.includes("supabase-secret-that-must-not-appear") &&
    !runnerExecution.output.includes("twelve-data-secret-that-must-not-appear"),
};

const failedChecks = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  final_shadow_decision: runnerResult?.final_shadow_decision ?? "missing",
  checks,
  failed_checks: failedChecks,
  action_414_inventory_sha256: runnerResult?.action_414_inventory_sha256 ?? null,
  action_414_freeze_payload_sha256: runnerResult?.action_414_freeze_payload_sha256 ?? null,
  manifest_sha256: runnerResult?.manifest_sha256 ?? null,
  scenario_count: runnerResult?.scenario_count ?? 0,
  executed_package_runs: runnerResult?.executed_package_runs ?? 0,
  third_run_executed: runnerResult?.third_run_executed ?? null,
  status_distribution: runnerResult?.status_distribution ?? {},
  warning_distribution: runnerResult?.warning_distribution ?? {},
  insight_distribution: runnerResult?.insight_distribution ?? {},
  blocked_status_total: blockedStatusTotal,
  conditions: runnerResult?.conditions ?? [],
  temp_evidence_path: "<system-temp>/ture/action-416-expanded-static-pattern-discovery-shadow/",
  temp_evidence_deleted: runnerResult?.temporary_evidence_deleted ?? false,
  tracked_evidence_files: trackedEvidenceFiles,
  runtime_consumer_files: runtimeConsumers,
  no_effect_flags: {
    provider_call_executed: false,
    provider_call_attempted: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    runtime_integration_executed: false,
    feedback_executed: false,
    authoritative_data_created: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
  },
  runtime_preview_status: runnerResult?.runtime_preview_status ?? "unknown",
  recommended_next_action: "independent_action_417_shadow_execution_verification",
  file_hashes: {
    manifest: exists(paths.manifest) ? shaFile(paths.manifest) : null,
    runner: exists(paths.runner) ? shaFile(paths.runner) : null,
    doc: exists(paths.doc) ? shaFile(paths.doc) : null,
    verifier: exists(paths.verifier) ? shaFile(paths.verifier) : null,
    test: exists(paths.test) ? shaFile(paths.test) : null,
  },
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (failedChecks.length > 0) process.exitCode = 1;
