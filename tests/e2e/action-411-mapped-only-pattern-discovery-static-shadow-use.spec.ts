import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(process.cwd(), "docs/action-411-mapped-only-pattern-discovery-static-shadow-use.md");
const manifestPath = join(process.cwd(), "docs/action-411-mapped-only-pattern-discovery-static-shadow-input-manifest.json");
const runnerPath = "scripts/action-411-mapped-only-pattern-discovery-static-shadow-run.mjs";
const verifierPath = "scripts/action-411-mapped-only-pattern-discovery-static-shadow-use-verify.mjs";

type Action411Report = Readonly<{
  verification_status: string;
  final_shadow_decision: string;
  failed_checks: readonly string[];
  checks: Readonly<Record<string, boolean>>;
  manifest_case_ids: readonly string[];
  duplicate_inventory: Readonly<{
    case_support_count: number;
    unique_mapper_row_count: number;
    shared_mapper_row_id_count: number;
  }>;
  pattern_discovery: Readonly<{
    status: string;
    group_status: string;
    support_counts: Readonly<{ case_support_count: number; unique_mapper_row_count: number }>;
    outcome_counts: Readonly<{
      completed_outcome_count: number;
      positive_count: number;
      negative_count: number;
      neutral_count: number;
    }>;
    warning_codes: readonly string[];
    insight_count: number;
  }>;
  semantic_hashes: Readonly<{
    evidence_set_sha256: string;
    group_sha256: string;
    result_sha256: string;
  }>;
  observed_semantic_hashes: Readonly<{
    evidence_set_sha256: string;
    group_sha256: string;
    result_sha256: string;
  }>;
  repeat_run: Readonly<{
    identical: boolean;
    run_1_batch_sha256: string;
    run_2_batch_sha256: string;
  }>;
  evidence: Readonly<{
    temporary_evidence_deleted: boolean;
    tracked_evidence_files: readonly string[];
    metadata_only_result: string;
    path_safety_result: string;
    cleanup_result: string;
  }>;
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
  recommended_next_action: string;
}>;

const expectedCases = [
  "expanded_valid_bearish_risk_context",
  "expanded_valid_fda_event_context",
  "expanded_valid_future_event_excluded",
  "expanded_valid_identity_nfc_equivalent",
  "expanded_valid_identity_percent_encoding",
  "expanded_valid_sec_event_context",
  "valid_complete_mapping",
  "valid_equivalent_aliases",
  "valid_normalized_confidence",
  "valid_rich_context",
];

let report: Action411Report;

function runVerifier(): Action411Report {
  const output = execFileSync("node", [verifierPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 240_000,
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
    },
  });
  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  return JSON.parse(output) as Action411Report;
}

test.describe.serial("Action 411 mapped-only Pattern Discovery static shadow use", () => {
  test.setTimeout(300_000);

  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documentation manifest runner verifier and focused tests exist", () => {
    expect(existsSync(docPath)).toBe(true);
    expect(existsSync(manifestPath)).toBe(true);
    expect(existsSync(runnerPath)).toBe(true);
    expect(existsSync(verifierPath)).toBe(true);
    expect(report.verification_status).toBe("passed");
    expect(report.failed_checks).toEqual([]);
    expect(report.checks.required_files_found).toBe(true);
    expect(report.checks.documentation_contract_complete).toBe(true);
  });

  test("manifest freezes exact ten lexical evidence cases and hashes", () => {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

    expect(report.manifest_case_ids).toEqual(expectedCases);
    expect(manifest.case_count).toBe(10);
    expect(manifest.ordered_cases.map((item: { case_id: string }) => item.case_id)).toEqual(expectedCases);
    expect(report.checks.protected_hashes_match).toBe(true);
    expect(report.checks.row_ids_and_hashes_frozen).toBe(true);
    expect(report.semantic_hashes).toEqual({
      evidence_set_sha256: "f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8",
      group_sha256: "aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e",
      result_sha256: "e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c",
    });
  });

  test("runner executes exactly two deterministic local-only runs", () => {
    const source = readFileSync(runnerPath, "utf8");
    const direct = JSON.parse(execFileSync("node", [runnerPath], {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 240_000,
    }));

    expect(report.checks.exactly_two_runs_present).toBe(true);
    expect((source.match(/const run[12] = await runOnce\(manifest, caseDefinitions,/g) ?? [])).toHaveLength(2);
    expect(source).not.toContain("process.argv");
    expect(source).not.toContain("stdin");
    expect(direct.final_shadow_decision).toBe("shadow_passed");
    expect(direct.repeat_run_identical).toBe(true);
    expect(direct.run_1_batch_sha256).toBe("bad2ba397af95ace6883e2ea45bbd046bd4d6ad23264103aef34184468853be3");
    expect(direct.run_2_batch_sha256).toBe("bad2ba397af95ace6883e2ea45bbd046bd4d6ad23264103aef34184468853be3");
  });

  test("mapper row reconstruction and duplicate inventory are exact", () => {
    expect(report.final_shadow_decision).toBe("shadow_passed");
    expect(report.duplicate_inventory).toEqual({
      case_support_count: 10,
      unique_mapper_row_count: 3,
      shared_mapper_row_id_count: 8,
    });
    expect(report.checks.duplicate_inventory_exact).toBe(true);
    expect(report.checks.runner_shadow_passed).toBe(true);
  });

  test("Pattern Discovery result remains insufficient evidence with frozen hashes", () => {
    expect(report.pattern_discovery.status).toBe("insufficient_evidence");
    expect(report.pattern_discovery.group_status).toBe("insufficient_evidence");
    expect(report.pattern_discovery.support_counts).toEqual({
      case_support_count: 10,
      unique_mapper_row_count: 3,
    });
    expect(report.pattern_discovery.outcome_counts).toEqual({
      completed_outcome_count: 10,
      positive_count: 10,
      negative_count: 0,
      neutral_count: 0,
    });
    expect(report.pattern_discovery.warning_codes).toEqual([
      "minimum_total_support_not_met",
      "minimum_completed_outcomes_not_met",
      "duplicate_mapper_row_identity",
    ]);
    expect(report.pattern_discovery.insight_count).toBe(0);
    expect(report.observed_semantic_hashes).toEqual(report.semantic_hashes);
  });

  test("temporary metadata-only evidence is deleted and no tracked evidence exists", () => {
    expect(report.checks.metadata_only_evidence_present).toBe(true);
    expect(report.evidence.metadata_only_result).toBe("passed");
    expect(report.evidence.path_safety_result).toBe("passed");
    expect(report.evidence.cleanup_result).toBe("passed");
    expect(report.evidence.temporary_evidence_deleted).toBe(true);
    expect(report.evidence.tracked_evidence_files).toEqual([]);
    expect(report.checks.no_tracked_evidence).toBe(true);
  });

  test("no runtime provider Supabase replay persistence feedback or authoritative data effects occur", () => {
    expect(report.checks.no_runtime_provider_supabase_replay_or_feedback).toBe(true);
    expect(report.checks.no_production_consumers).toBe(true);
    expect(report.checks.source_status_unchanged).toBe(true);
    for (const value of Object.values(report.no_effect_flags)) {
      expect(value).toBe(false);
    }
  });

  test("runtime preview remains paused and independent audit is next", () => {
    const doc = readFileSync(docPath, "utf8");

    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.checks.runtime_preview_untouched).toBe(true);
    expect(doc).toContain("Final Shadow Decision");
    expect(doc).toContain("`shadow_passed`");
    expect(report.recommended_next_action).toBe(
      "action_412_independent_mapped_only_pattern_discovery_static_shadow_verification_and_hash_audit",
    );
  });
});
