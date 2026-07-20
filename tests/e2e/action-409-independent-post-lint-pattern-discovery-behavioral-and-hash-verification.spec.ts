import { execFileSync } from "child_process";
import { readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-409-independent-post-lint-pattern-discovery-behavioral-and-hash-verification.md";
const verifierPath = "scripts/action-409-independent-post-lint-pattern-discovery-behavioral-and-hash-verification-verify.mjs";

const expectedAction404Names = [
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

type Action409Report = Readonly<{
  verification_status: string;
  readiness_decision: string;
  readiness_vocabulary: readonly string[];
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  passed_conditions_count: number;
  failed_conditions_count: number;
  unresolved_conditions: readonly string[];
  source_integrity: Readonly<Record<string, Readonly<{ expected: string; actual: string | null; unchanged: boolean }>>>;
  remediated_locations: readonly string[];
  explicit_any_locations_after_remediation: readonly Readonly<{ line: number; column: number; text: string }>[];
  test_inventory: Readonly<{
    count: number;
    names: readonly string[];
    expected_names: readonly string[];
  }>;
  lint_result: Readonly<{
    passed: boolean;
    error_count: number | null;
    warning_count: number | null;
  }>;
  public_api: Readonly<{
    runtime_exports: readonly string[];
    type_exports: readonly string[];
    result_status_count: number;
    issue_code_count: number;
    warning_code_count: number;
  }>;
  action406_hashes: Readonly<{
    evidence_set_sha256: string;
    group_sha256: string;
    expected_result_sha256: string;
  }>;
  runtime_preview_status: string;
  isolation: Readonly<{
    runner_manifest_files: readonly string[];
    runtime_markers: readonly string[];
    production_consumer_files: readonly string[];
    config_changes: readonly string[];
  }>;
  no_effect_flags: Readonly<Record<string, boolean>>;
  recommended_next_action: string;
}>;

let report: Action409Report;

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function runVerifier(): Action409Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8", timeout: 180_000 })) as Action409Report;
}

test.describe.serial("Action 409 independent post-lint Pattern Discovery behavioral and hash verification", () => {
  test.setTimeout(240_000);

  test.beforeAll(() => {
    report = runVerifier();
  });

  test("documentation contract covers every required audit section", () => {
    const doc = read(docPath);
    for (const section of [
      "Purpose",
      "Scope",
      "Authoritative Dependencies",
      "Action 407 Approval Summary",
      "Action 408 Remediation Summary",
      "Source-Integrity Audit",
      "Six-Remediation Audit",
      "Assertion-Strength Audit",
      "Malformed-Input Audit",
      "Invalid-Array Audit",
      "Invalid-Object Audit",
      "Null/Primitive Audit",
      "Unsafe-Cast Audit",
      "Semantic-Hash Audit",
      "Runtime/Isolation Audit",
      "Readiness Decision",
      "Next Permitted Action",
    ]) {
      expect(doc).toContain(`## ${section}`);
    }
  });

  test("source hash integrity is unchanged for protected files", () => {
    expect(report.checks.source_hashes_unchanged).toBe(true);
    expect(report.source_integrity["lib/pure-pattern-discovery.ts"].actual).toBe("48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c");
    expect(report.source_integrity["tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts"].actual).toBe("b6f5ff174edcb691f78c112b50670d3f4719251ff31aad1aadc463cd04f45eda");
    expect(Object.values(report.source_integrity).every((entry) => entry.unchanged)).toBe(true);
  });

  test("exact six-remediation inventory and zero explicit any are verified", () => {
    expect(report.checks.six_remediation_inventory_exact).toBe(true);
    expect(report.remediated_locations).toEqual(["37:33", "57:66", "57:140", "81:38", "96:51", "109:147"]);
    expect(report.checks.zero_explicit_any_after_remediation).toBe(true);
    expect(report.explicit_any_locations_after_remediation).toEqual([]);
    expect(report.checks.narrow_replacement_strategy_present).toBe(true);
  });

  test("no suppression and config integrity remain intact", () => {
    expect(report.checks.suppression_absent).toBe(true);
    expect(report.checks.config_integrity).toBe(true);
    expect(report.isolation.config_changes).toEqual([]);
    expect(report.checks.unsafe_cast_absent).toBe(true);
  });

  test("exact 15 tests names and order are preserved", () => {
    expect(report.checks.test_count_names_order_exact).toBe(true);
    expect(report.test_inventory.count).toBe(15);
    expect(report.test_inventory.names).toEqual(expectedAction404Names);
    expect(report.test_inventory.expected_names).toEqual(expectedAction404Names);
  });

  test("malformed input preservation and assertion-strength inventory remain intact", () => {
    expect(report.checks.malformed_input_preserved).toBe(true);
    expect(report.checks.assertion_strength_preserved).toBe(true);
    expect(report.checks.validation_precedence_preserved).toBe(true);
    expect(report.checks.duplicate_support_preserved).toBe(true);
    expect(report.checks.aggregation_hash_preserved).toBe(true);
  });

  test("immutability repeated and interleaved determinism coverage remains intact", () => {
    expect(report.checks.immutability_and_determinism_preserved).toBe(true);
    expect(read("tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts")).toContain("interleaved");
    expect(read("tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts")).toContain("deepFreeze");
  });

  test("Action 406 hash constants and public API remain exact", () => {
    expect(report.action406_hashes).toEqual({
      evidence_set_sha256: "f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8",
      group_sha256: "aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e",
      expected_result_sha256: "e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c",
    });
    expect(report.checks.public_api_integrity).toBe(true);
    expect(report.public_api.runtime_exports).toEqual(["discoverPatterns"]);
    expect(report.public_api.type_exports).toEqual([
      "PatternDiscoveryRowEnvelope",
      "FrozenPatternDiscoveryConfiguration",
      "PatternDiscoveryIssue",
      "PatternDiscoveryWarning",
      "PatternDiscoveryEvidenceSummary",
      "PatternDiscoveryGroupResult",
      "PatternDiscoveryResult",
    ]);
    expect(report.public_api.result_status_count).toBe(9);
    expect(report.public_api.issue_code_count).toBe(15);
    expect(report.public_api.warning_code_count).toBe(4);
  });

  test("lint pass and all regression suites are verified", () => {
    expect(report.checks.lint_passes_zero_errors).toBe(true);
    expect(report.lint_result.passed).toBe(true);
    expect(report.lint_result.error_count).toBe(0);
    expect(report.lint_result.warning_count).toBeGreaterThanOrEqual(0);
    expect(report.checks.action405_to_408_verifiers_healthy).toBe(true);
    execFileSync("npx", [
      "playwright",
      "test",
      "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts",
      "tests/e2e/action-405-independent-pure-pattern-discovery-verification-and-hash-audit.spec.ts",
      "tests/e2e/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate.spec.ts",
      "tests/e2e/action-407-pure-pattern-discovery-lint-remediation-approval-gate.spec.ts",
      "tests/e2e/action-408-pure-pattern-discovery-test-lint-remediation.spec.ts",
    ], {
      encoding: "utf8",
      env: { ...process.env, PLAYWRIGHT_SKIP_WEB_SERVER: "true" },
      timeout: 240_000,
    });
  });

  test("no runner manifest shadow runtime persistence replay provider Supabase or feedback exists", () => {
    expect(report.checks.no_runner_manifest_shadow).toBe(true);
    expect(report.checks.no_runtime_or_deployment_artifacts).toBe(true);
    expect(report.isolation.runner_manifest_files).toEqual([]);
    expect(report.isolation.runtime_markers).toEqual([]);
    expect(report.isolation.production_consumer_files).toEqual([]);
    expect(report.no_effect_flags.downstream_shadow_executed).toBe(false);
    expect(report.no_effect_flags.provider_call_executed).toBe(false);
    expect(report.no_effect_flags.news_call_executed).toBe(false);
    expect(report.no_effect_flags.supabase_read_executed).toBe(false);
    expect(report.no_effect_flags.supabase_write_executed).toBe(false);
    expect(report.no_effect_flags.persistence_executed).toBe(false);
    expect(report.no_effect_flags.replay_executed).toBe(false);
    expect(report.no_effect_flags.runtime_integration_executed).toBe(false);
    expect(report.no_effect_flags.feedback_executed).toBe(false);
  });

  test("verifier succeeds with ready decision and runtime preview remains paused", () => {
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_vocabulary).toEqual(["ready", "ready_with_conditions", "blocked"]);
    expect(report.readiness_decision).toBe("ready");
    expect(report.failed_checks).toEqual([]);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions).toEqual([]);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(report.recommended_next_action).toBe("action_410_mapped_only_pattern_discovery_static_shadow_execution_approval_gate");
  });
});
