import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-408-pure-pattern-discovery-test-lint-remediation.md";
const verifierPath = "scripts/action-408-pure-pattern-discovery-test-lint-remediation-verify.mjs";
const action404TestPath = "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts";
const implementationPath = "lib/pure-pattern-discovery.ts";

const expectedAction404TestNames = [
  "exports exactly seven types and one synchronous runtime function",
  "valid minimal input is grouped exactly and stays insufficient",
  "invalid input configuration grouping dimension and hidden defaults fail closed",
  "mapper status missing row and non-consumable rows block in phase five",
  "lineage validation rejects malformed hashes changed rows and duplicate sources",
  "failed or unknown leakage and invalid setup or outcome are blocked",
  "non-finite unscalable and out-of-range numeric values block at numeric validation",
  "duplicates preserve case support while unique mapper row count stays distinct",
  "positive negative neutral mixed and support status are exact",
  "sufficient evidence with a duplicate warning is discovered_with_warnings",
  "scaled integer averages medians rounding signed zero and null metrics are deterministic",
  "deterministic evidence group insight result hashes and reordered input match",
  "input and nested values remain immutable across repeated and interleaved calls",
  "no runner manifest runtime consumer or forbidden source access exists",
  "verifier and Action 402/403 historical gates pass with runtime preview paused",
];

type Action408Report = Readonly<{
  verification_status: string;
  remediation_status: string;
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  remediated_locations: readonly string[];
  explicit_any_counts: Readonly<{
    target: number;
    pure_implementation: number;
  }>;
  test_count: number;
  test_names: readonly string[];
  implementation_hash: Readonly<{
    expected: string;
    actual: string | null;
    unchanged: boolean;
  }>;
  public_exports: Readonly<{
    runtime: readonly string[];
    types: readonly string[];
  }>;
  action406_hashes: Readonly<{
    evidence_set_sha256: string;
    group_sha256: string;
    expected_result_sha256: string;
  }>;
  runtime_preview_status: string;
  no_effect_flags: Readonly<Record<string, boolean>>;
  recommended_next_action: string;
}>;

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function shaFile(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function runVerifier(): Action408Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Action408Report;
}

function testNames(source: string): string[] {
  return [...source.matchAll(/test\("([^"]+)"/g)].map((match) => match[1]);
}

test.describe.serial("Action 408 pure Pattern Discovery test lint remediation", () => {
  test.setTimeout(120_000);

  test("documentation records exact six remediations and replacement strategies", () => {
    const doc = read(docPath);
    expect(doc).toContain("Action 407 Approval");
    expect(doc).toContain("Exact Six Remediated Locations");
    expect(doc).toContain("37:33");
    expect(doc).toContain("57:66");
    expect(doc).toContain("57:140");
    expect(doc).toContain("81:38");
    expect(doc).toContain("96:51");
    expect(doc).toContain("109:147");
    expect(doc).toContain("Mutable<Action335LearningDatasetRow>");
    expect(doc).toContain("MutablePatternDiscoveryRowEnvelope");
    expect(doc).toContain("Record<string, unknown>");
    expect(doc).toContain("Object.assign");
  });

  test("zero explicit any after remediation", () => {
    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.remediation_status).toBe("remediated");
    expect(report.explicit_any_counts.target).toBe(0);
    expect(report.explicit_any_counts.pure_implementation).toBe(0);
    expect(report.remediated_locations).toEqual(["37:33", "57:66", "57:140", "81:38", "96:51", "109:147"]);
  });

  test("Action 404 test names unchanged", () => {
    const report = runVerifier();
    expect(report.test_count).toBe(15);
    expect(report.test_names).toEqual(expectedAction404TestNames);
    expect(testNames(read(action404TestPath))).toEqual(expectedAction404TestNames);
  });

  test("malformed arrays preserved through invalid-input source coverage", () => {
    const source = read(action404TestPath);
    expect(source).toContain("blocked_invalid_input");
    expect(source).toContain("undefined");
    expect(source).toContain("null");
    expect(source).toContain("[]");
    expect(source).toContain("{}");
    expect(source).toContain("Record<string, unknown>");
    expect(source).toContain("delete missing.numeric_scale");
    expect(source).toContain("Object.assign(row, { anti_leakage_status: value })");
    expect(source).toContain("Object.assign(row.setup_and_confidence, { setup_family: \"Momentum_Continuation\" })");
    expect(source).toContain("Object.assign(row.outcome_fields, { availability: \"incomplete\" })");
    expect(source).toContain("Number.NaN");
    expect(source).toContain("Number.POSITIVE_INFINITY");
  });

  test("assertion meaning and deterministic hash surfaces are preserved", () => {
    const report = runVerifier();
    const source = read(action404TestPath);
    for (const marker of [
      "blocked_invalid_configuration",
      "blocked_invalid_lineage",
      "blocked_future_leakage",
      "invalid_grouping_literal",
      "invalid_outcome",
      "non_finite_numeric",
      "duplicate_mapper_row_identity",
      "discovered_with_warnings",
      "average_gross_r_multiple",
      "evidence_set_sha256",
      "deepFreeze",
      "reverse()",
    ]) {
      expect(source).toContain(marker);
    }
    expect(report.checks.key_assertion_inventory_preserved).toBe(true);
    expect(report.checks.malformed_input_cases_preserved).toBe(true);
  });

  test("production implementation API and hashes remain unchanged", () => {
    const report = runVerifier();
    expect(shaFile(implementationPath)).toBe("48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c");
    expect(report.implementation_hash.unchanged).toBe(true);
    expect(report.public_exports.runtime).toEqual(["discoverPatterns"]);
    expect(report.public_exports.types).toEqual([
      "PatternDiscoveryRowEnvelope",
      "FrozenPatternDiscoveryConfiguration",
      "PatternDiscoveryIssue",
      "PatternDiscoveryWarning",
      "PatternDiscoveryEvidenceSummary",
      "PatternDiscoveryGroupResult",
      "PatternDiscoveryResult",
    ]);
    expect(report.action406_hashes).toEqual({
      evidence_set_sha256: "f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8",
      group_sha256: "aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e",
      expected_result_sha256: "e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c",
    });
  });

  test("npm run lint passes", () => {
    execFileSync("npm", ["run", "lint"], { encoding: "utf8", timeout: 120_000 });
  });

  test("verifier succeeds and keeps safety flags false", () => {
    const report = runVerifier();
    expect(report.failed_checks).toEqual([]);
    expect(report.checks.action405_action406_action407_healthy).toBe(true);
    expect(report.checks.no_suppressions_or_config_weakening).toBe(true);
    expect(report.checks.no_runner_manifest_shadow).toBe(true);
    expect(report.checks.no_runtime_or_deployment_artifacts).toBe(true);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.recommended_next_action).toBe("action_409_independent_post_lint_pattern_discovery_behavioral_and_hash_verification");
    expect(report.no_effect_flags.provider_call_executed).toBe(false);
    expect(report.no_effect_flags.supabase_write_executed).toBe(false);
    expect(report.no_effect_flags.persistence_executed).toBe(false);
    expect(report.no_effect_flags.replay_executed).toBe(false);
    expect(report.no_effect_flags.runtime_integration_executed).toBe(false);
    expect(report.no_effect_flags.scanner_behavior_changed).toBe(false);
    expect(report.no_effect_flags.live_ranking_changed).toBe(false);
    expect(report.no_effect_flags.recommendations_mutated).toBe(false);
  });
});
