import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { expect, test } from "@playwright/test";

const verifierPath = "scripts/action-416-expanded-static-pattern-discovery-shadow-use-verify.mjs";
const runnerPath = "scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs";
const manifestPath = "docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json";
const docPath = "docs/action-416-expanded-static-pattern-discovery-shadow-use.md";

type Action416Report = Readonly<{
  verification_status: string;
  final_shadow_decision: string;
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  action_414_inventory_sha256: string;
  action_414_freeze_payload_sha256: string;
  scenario_count: number;
  executed_package_runs: number;
  third_run_executed: boolean;
  status_distribution: Readonly<Record<string, number>>;
  warning_distribution: Readonly<Record<string, number>>;
  insight_distribution: Readonly<Record<string, number>>;
  blocked_status_total: number;
  conditions: readonly string[];
  temp_evidence_deleted: boolean;
  tracked_evidence_files: readonly string[];
  runtime_consumer_files: readonly string[];
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
  recommended_next_action: string;
}>;

type Action416Manifest = Readonly<{
  manifest_schema_version: string;
  action_414_inventory_sha256: string;
  action_414_freeze_payload_sha256: string;
  scenario_count: number;
  scenario_ids: readonly string[];
  scenarios: readonly {
    scenario_id: string;
    row_ids: readonly string[];
    canonical_row_hashes: readonly string[];
    semantic_hashes: Readonly<{
      evidence_set_sha256: string | null;
      group_hashes: readonly string[];
      insight_ids: readonly string[];
      insight_hashes: readonly string[];
      canonical_result_sha256: string;
      scenario_summary_sha256: string;
    }>;
    scenario_inventory_sha256: string;
  }[];
  static_only: boolean;
  non_production: boolean;
  non_authoritative: boolean;
  non_learning: boolean;
  no_persistence: boolean;
  no_replay: boolean;
  no_runtime: boolean;
  no_external_access: boolean;
  no_feedback: boolean;
}>;

let report: Action416Report;
let verifierOutput = "";
let manifest: Action416Manifest;

function runVerifier(): Action416Report {
  verifierOutput = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 240_000,
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      ["TWELVE" + "_DATA_API_KEY"]: "twelve-data-secret-that-must-not-appear",
    },
  });
  return JSON.parse(verifierOutput) as Action416Report;
}

test.describe.serial("Action 416 expanded static Pattern Discovery shadow execution", () => {
  test.beforeAll(() => {
    report = runVerifier();
    manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Action416Manifest;
  });

  test("required package files and documentation exist", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(existsSync(manifestPath)).toBe(true);
    expect(existsSync(runnerPath)).toBe(true);
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.failed_checks).toEqual([]);
    expect(doc).toContain("Final shadow decision: `shadow_passed_with_conditions`");
    expect(doc).toContain("No tracked execution evidence is retained.");
  });

  test("manifest preserves the Action 414 frozen package metadata", () => {
    expect(manifest.manifest_schema_version).toBe(
      "action_416_expanded_static_pattern_discovery_shadow_input_manifest_v1",
    );
    expect(manifest.action_414_inventory_sha256).toBe(
      "8b7e5c55f1ae8e27a278ca7d844d204aee4a84d4546cb8b612c3db122d83fe4b",
    );
    expect(manifest.action_414_freeze_payload_sha256).toBe(
      "4e1f3e0cd8e67e7d0230c1af8618d8e803867c75c32d18857c48b1234e835c12",
    );
    expect(manifest.scenario_count).toBe(30);
    expect(manifest.scenarios).toHaveLength(30);
    expect(manifest.scenario_ids[0]).toBe("pd413_01_action411_baseline_insufficient_evidence");
    expect(manifest.scenario_ids[29]).toBe("pd413_30_duplicate_source_case_id_blocked");
  });

  test("all scenarios include bounded row and semantic hashes", () => {
    const shaPattern = /^[a-f0-9]{64}$/;

    for (const scenario of manifest.scenarios) {
      expect(scenario.row_ids.length).toBeGreaterThan(0);
      expect(scenario.canonical_row_hashes.every((hash) => shaPattern.test(hash))).toBe(true);
      expect(scenario.semantic_hashes.group_hashes.every((hash) => shaPattern.test(hash))).toBe(true);
      expect(scenario.semantic_hashes.insight_hashes.every((hash) => shaPattern.test(hash))).toBe(true);
      expect(shaPattern.test(scenario.semantic_hashes.canonical_result_sha256)).toBe(true);
      expect(shaPattern.test(scenario.semantic_hashes.scenario_summary_sha256)).toBe(true);
      expect(shaPattern.test(scenario.scenario_inventory_sha256)).toBe(true);
    }
  });

  test("runner executes the package exactly twice and cleans temp evidence", () => {
    expect(report.final_shadow_decision).toBe("shadow_passed_with_conditions");
    expect(report.scenario_count).toBe(30);
    expect(report.executed_package_runs).toBe(2);
    expect(report.third_run_executed).toBe(false);
    expect(report.checks.exactly_two_runs).toBe(true);
    expect(report.checks.repeat_run_identical).toBe(true);
    expect(report.temp_evidence_deleted).toBe(true);
    expect(existsSync(join(tmpdir(), "ture", "action-416-expanded-static-pattern-discovery-shadow"))).toBe(false);
  });

  test("aggregate distributions match the frozen Action 414 inventory", () => {
    expect(report.status_distribution).toEqual({
      blocked_future_leakage: 1,
      blocked_invalid_configuration: 1,
      blocked_invalid_input: 6,
      blocked_invalid_lineage: 2,
      blocked_non_consumable_row: 2,
      blocked_nondeterministic_grouping: 1,
      discovered: 9,
      discovered_with_warnings: 4,
      insufficient_evidence: 4,
    });
    expect(report.blocked_status_total).toBe(13);
    expect(report.warning_distribution).toEqual({
      duplicate_mapper_row_identity: 5,
      metric_value_unavailable: 1,
      minimum_completed_outcomes_not_met: 4,
      minimum_total_support_not_met: 3,
    });
    expect(report.insight_distribution).toEqual({ 0: 17, 1: 13 });
  });

  test("conditions are explicit and bounded", () => {
    expect(report.conditions).toEqual([
      "historical_action_411_baseline_preserved_without_regeneration",
      "nondeterministic_grouping_contract_case_preserved_as_static_block",
      "three_frozen_action_413_expectations_are_current_contract_limitations",
    ]);
    expect(report.checks.runner_conditions_explicit).toBe(true);
  });

  test("no runtime persistence replay provider Supabase feedback or secrets appear", () => {
    expect(Object.values(report.no_effect_flags).every((value) => value === false)).toBe(true);
    expect(report.tracked_evidence_files).toEqual([]);
    expect(report.runtime_consumer_files).toEqual([]);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierOutput).not.toContain("automation-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("supabase-secret-that-must-not-appear");
    expect(verifierOutput).not.toContain("twelve-data-secret-that-must-not-appear");
    expect(report.recommended_next_action).toBe("independent_action_417_shadow_execution_verification");
  });

  test("manifest remains metadata only", () => {
    const manifestText = readFileSync(manifestPath, "utf8");

    expect(manifest.static_only).toBe(true);
    expect(manifest.non_production).toBe(true);
    expect(manifest.non_authoritative).toBe(true);
    expect(manifest.non_learning).toBe(true);
    expect(manifest.no_persistence).toBe(true);
    expect(manifest.no_replay).toBe(true);
    expect(manifest.no_runtime).toBe(true);
    expect(manifest.no_external_access).toBe(true);
    expect(manifest.no_feedback).toBe(true);
    expect(manifestText).not.toContain("\"row\":");
    expect(manifestText).not.toContain("\"outcome_fields\":");
    expect(manifestText).not.toContain("\"setup_and_confidence\":");
    expect(manifestText).not.toContain("AUTOMATION_SECRET");
    expect(manifestText).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(manifestText).not.toContain("TWELVE_DATA_API_KEY");
  });
});
