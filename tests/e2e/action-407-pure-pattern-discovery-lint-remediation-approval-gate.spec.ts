import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { readFileSync } from "fs";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-407-pure-pattern-discovery-lint-remediation-approval-gate.md";
const verifierPath = "scripts/action-407-pure-pattern-discovery-lint-remediation-approval-gate-verify.mjs";
const implementationPath = "lib/pure-pattern-discovery.ts";
const action404TestPath = "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts";

type Action407Report = Readonly<{
  verification_status: string;
  approval_decision: string;
  checks: Readonly<Record<string, boolean>>;
  failed_checks: readonly string[];
  lint_inventory: readonly Readonly<{
    file: string;
    line: number;
    column: number;
    construct: string;
    classification: string;
    approved_replacement: string;
    public_api_affected: boolean;
    expected_behavioral_impact: string;
  }>[];
  actual_explicit_any_locations: readonly Readonly<{ line: number; column: number; text: string }>[];
  pure_module_explicit_any_count: number;
  action408_remediation_detected: boolean;
  lint_inventory_state: string;
  implementation_hash: Readonly<{ actual: string; unchanged: boolean }>;
  action406_hashes: Readonly<{
    evidence_set_sha256: string;
    group_sha256: string;
    expected_result_sha256: string;
  }>;
  public_exports: Readonly<{ runtime: readonly string[]; types: readonly string[] }>;
  no_effect_flags: Readonly<Record<string, boolean>>;
  runtime_preview_status: string;
  recommended_next_action: string;
}>;

function read(path = docPath): string {
  return readFileSync(path, "utf8");
}

function shaFile(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function runVerifier(): Action407Report {
  return JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Action407Report;
}

test.describe.serial("Action 407 pure Pattern Discovery lint remediation approval gate", () => {
  test("documentation contract includes the required approval-gate sections", () => {
    const doc = read();
    for (const section of [
      "Purpose", "Scope", "Authoritative Dependencies", "Action 404 Implementation State",
      "Action 405 Audit State", "Action 406 Hash-Freeze State", "Exact Current Implementation Hash",
      "Exact Lint Failure Summary", "Explicit No-Explicit-Any Error Inventory",
      "Approved Replacement Strategy Per Error", "Unknown Versus Generic Versus Narrow Structural Type Policy",
      "Canonicalization Helper Typing Policy", "Implementation Boundary", "Regression Requirements",
      "Lint Acceptance Requirements", "Independent Post-Remediation Audit Requirement",
      "Approval Decision", "Next Permitted Action",
    ]) {
      expect(doc).toContain(`## ${section}`);
    }
  });

  test("approval decision and exact lint-error inventory are frozen", () => {
    const report = runVerifier();
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.lint_inventory.map((item) => `${item.line}:${item.column}`)).toEqual([
      "37:33", "57:66", "57:140", "81:38", "96:51", "109:147",
    ]);
    expect([0, 6]).toContain(report.actual_explicit_any_locations.length);
    if (report.actual_explicit_any_locations.length === 0) {
      expect(report.action408_remediation_detected).toBe(true);
      expect(report.lint_inventory_state).toBe("remediated_zero_explicit_any");
    }
    expect(report.lint_inventory.every((item) => item.file === action404TestPath)).toBe(true);
  });

  test("narrow replacement policy and unknown typing policy are explicit", () => {
    const doc = read();
    expect(doc).toContain("private mutable test-row structural type based on Action335LearningDatasetRow");
    expect(doc).toContain("private mutable envelope test type");
    expect(doc).toContain("unknown");
    expect(doc).toContain("Record<string, unknown>");
    expect(doc).toContain("explicit object check");
    expect(doc).toContain("explicit array check");
    expect(doc).toContain("own-property inspection");
    expect(doc).toContain("no coercion");
    expect(doc).toContain("no mutation");
  });

  test("canonical-value typing policy and hash preservation are frozen", () => {
    const report = runVerifier();
    const doc = read();
    expect(doc).toContain("recursive JSON/canonical value type");
    expect(doc).toContain("BigInt serialization");
    expect(doc).toContain("Undefined and unsupported values must remain rejected");
    expect(report.action406_hashes).toEqual({
      evidence_set_sha256: "f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8",
      group_sha256: "aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e",
      expected_result_sha256: "e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c",
    });
  });

  test("no lint suppression or config changes are approved", () => {
    const doc = read();
    expect(doc).toContain("eslint-disable");
    expect(doc).toContain("ts-ignore");
    expect(doc).toContain("ts-expect-error");
    expect(doc).toContain("ESLint config is unchanged");
    expect(doc).toContain("TypeScript config is unchanged");
    expect(read(action404TestPath)).not.toContain("eslint-disable");
    expect(read(implementationPath)).not.toContain("eslint-disable");
    expect(read()).not.toContain("/* eslint-disable");
  });

  test("public export preservation and function-signature preservation are verified", () => {
    const report = runVerifier();
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
    expect(report.implementation_hash.actual).toBe("48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c");
    expect(report.implementation_hash.unchanged).toBe(true);
  });

  test("result status validation order aggregation and hash invariants remain required", () => {
    const doc = read();
    expect(doc).toContain("all nine statuses");
    expect(doc).toContain("14-phase validation order");
    expect(doc).toContain("BigInt summation");
    expect(doc).toContain("four-decimal rounding");
    expect(doc).toContain("minimum thresholds 20/20");
    expect(doc).toContain("canonical row hashes");
  });

  test("exact Action 408 boundary and Action 409 mandatory audit are frozen", () => {
    const doc = read();
    const report = runVerifier();
    expect(doc).toContain("docs/action-408-pure-pattern-discovery-lint-remediation.md");
    expect(doc).toContain("scripts/action-408-pure-pattern-discovery-lint-remediation-verify.mjs");
    expect(doc).toContain("tests/e2e/action-408-pure-pattern-discovery-lint-remediation.spec.ts");
    expect(doc).toContain("Action 409 is mandatory");
    expect(report.recommended_next_action).toBe("action_408_pure_pattern_discovery_lint_remediation");
  });

  test("no implementation changes no runner no manifest no shadow and no side effects", () => {
    const report = runVerifier();
    expect(shaFile(implementationPath)).toBe("48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c");
    expect(report.pure_module_explicit_any_count).toBe(0);
    expect(report.checks.no_runner_manifest_shadow).toBe(true);
    expect(report.no_effect_flags.implementation_modified).toBe(false);
    expect(report.no_effect_flags.lint_remediation_performed).toBe(false);
    expect(report.no_effect_flags.downstream_shadow_executed).toBe(false);
    expect(report.no_effect_flags.persistence_executed).toBe(false);
    expect(report.no_effect_flags.replay_executed).toBe(false);
    expect(report.no_effect_flags.runtime_integration_executed).toBe(false);
    expect(report.no_effect_flags.supabase_write_executed).toBe(false);
    expect(report.no_effect_flags.feedback_executed).toBe(false);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("verifier succeeds and Actions 405 and 406 remain healthy", () => {
    const report = runVerifier();
    expect(report.checks.action405_ready_with_conditions).toBe(true);
    expect(report.checks.action406_approved_with_conditions).toBe(true);
    expect(report.failed_checks).toEqual([]);
  });
});
