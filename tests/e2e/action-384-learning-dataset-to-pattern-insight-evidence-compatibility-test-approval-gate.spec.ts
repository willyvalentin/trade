import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-384-learning-dataset-to-pattern-insight-evidence-compatibility-test-approval-gate.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-384-learning-dataset-to-pattern-insight-evidence-compatibility-test-approval-gate-verify.mjs",
);
const learningFixturePath = join(
  process.cwd(),
  "lib/learning-dataset-static-fixtures.ts",
);
const patternFixturePath = join(
  process.cwd(),
  "lib/pattern-insight-static-fixtures.ts",
);

function runVerifier(path: string) {
  return execFileSync("node", [path], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

test("Action 384 approval-gate package and authoritative fixtures exist", () => {
  expect(existsSync(docPath)).toBe(true);
  expect(existsSync(verifierPath)).toBe(true);
  expect(existsSync(learningFixturePath)).toBe(true);
  expect(existsSync(patternFixturePath)).toBe(true);

  const doc = readFileSync(docPath, "utf8");
  expect(doc).toContain(
    "approval_gate_status: learning_dataset_pattern_insight_evidence_compatibility_test_gate_ready",
  );
  expect(doc).toContain("runtime_preview_status: runtime_preview_waiting_for_operator_inputs");
});

test("approval vocabulary decision and deterministic conditions are explicit", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain(
    "approval_vocabulary: approved | approved_with_conditions | blocked",
  );
  expect(doc).toContain("approval_decision: approved");
  expect(doc).toContain("passed_conditions_count: 16");
  expect(doc).toContain("failed_conditions_count: 0");
  expect(doc).toContain("all_required_gate_conditions_passed: true");
});

test("evidence inputs and derived outputs remain architecturally distinct", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Learning Dataset Rows are evidence inputs");
  expect(doc).toContain("Pattern Insights are future derived analytical outputs");
  expect(doc).toContain(
    "does not mean any insight was discovered, calculated, inferred, generated",
  );
  expect(doc).toContain("no direct row-to-insight derivation relationship exists");
  expect(doc).toContain("preserve the missing Pattern Discovery stage");
});

test("only tests and an optional literal reference manifest are approved", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const concept of [
    "### A. Static Evidence Compatibility Tests",
    "### B. Literal Test-Only Reference Manifest",
    "### C. Aggregation Or Cohort Logic",
    "### D. Pattern Discovery Implementation",
    "### E. Pattern Insight Generation",
    "### F. Confidence Calibration",
    "### G. Runtime Integration",
  ]) {
    expect(doc).toContain(concept);
  }
  expect(doc).toContain("Only A and the strictly bounded optional B are approved");
  expect(doc).toContain(
    "tests/e2e/action-385-learning-dataset-to-pattern-insight-evidence-compatibility.spec.ts",
  );
  expect(doc).toContain(
    "tests_and_optional_literal_manifest_only_no_calculation_no_aggregation_no_discovery",
  );
});

test("literal manifest semantics prohibit derivation metrics and causality", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no_derivation_claimed: true");
  expect(doc).toContain("must not contain calculated metrics");
  expect(doc).toContain("must not claim causation");
  expect(doc).toContain("must not contain calculated metrics, transformed rows");
  expect(doc).toContain("performance-superiority claims");
});

test("no aggregation calculation inference discovery generation mapper or calibration is approved", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const heading of [
    "## No-Calculation Requirement",
    "## No-Aggregation Requirement",
    "## No-Inference Requirement",
    "## No-Generation Requirement",
    "## No-Causal-Claim Requirement",
    "## No-Mapper Requirement",
    "## No-Production-Module Requirement",
  ]) {
    expect(doc).toContain(heading);
  }
  for (const status of [
    "aggregation_approved: false",
    "pattern_discovery_approved: false",
    "insight_generation_approved: false",
    "confidence_calibration_approved: false",
    "mapper_approved: false",
    "production_module_approved: false",
  ]) {
    expect(doc).toContain(status);
  }
});

test("setup context and outcome evidence dimensions are covered without calculation", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const heading of [
    "## Setup Taxonomy Compatibility",
    "## Market-Regime Compatibility",
    "## Index-Context Compatibility",
    "## Sector Industry Peer Compatibility",
    "## Relative-Strength Compatibility",
    "## News Event Compatibility",
    "## Macro Calendar Compatibility",
    "## Time-Window Compatibility",
    "## Outcome-Field Compatibility",
    "## Sample Support Representation Compatibility",
  ]) {
    expect(doc).toContain(heading);
  }
  expect(doc).toContain("completed positive, completed negative, incomplete");
  expect(doc).toContain("must not recompute or validate those summary metrics from rows");
  expect(doc).toContain("may not count fixture arrays");
});

test("provenance temporal missing and anti-leakage boundaries are explicit", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const heading of [
    "## Provenance Compatibility",
    "## Completeness Compatibility",
    "## Missing-Data Compatibility",
    "## Temporal-Window Compatibility",
    "## Anti-Leakage Compatibility",
  ]) {
    expect(doc).toContain(heading);
  }
  expect(doc).toContain("future context exclusions remain excluded");
  expect(doc).toContain("Observation windows do not imply information was known");
  expect(doc).toContain("confidence and ranking remain unchanged");
});

test("insufficient contradictory stale superseded and readiness states remain literal", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const heading of [
    "## Insufficient-Evidence Compatibility",
    "## Contradictory-Evidence Compatibility",
    "## Stale And Superseded Compatibility",
    "## Readiness-State Compatibility",
  ]) {
    expect(doc).toContain(heading);
  }
  for (const state of [
    "not_ready",
    "collecting",
    "shadow_eligible",
    "review_required",
    "calibration_candidate",
  ]) {
    expect(doc).toContain(state);
  }
  expect(doc).toContain("must not derive readiness from Learning Dataset rows");
});

test("fixture immutability ordering and serialization requirements are explicit", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 380 valid/malformed fixtures");
  expect(doc).toContain("Action 357 valid/malformed fixtures");
  expect(doc).toContain("IDs, ordering, timestamps, provenance");
  expect(doc).toContain("existing Pattern Insight metrics");
  expect(doc).toContain("byte-identical or canonically identical");
  expect(doc).toContain("Compatibility checks may not reorder authoritative fixtures");
});

test("all incompatibility and causal boundary scenarios are present", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const scenario of [
    "missing source-row identity",
    "invalid recommendation/context/outcome linkage",
    "malformed provenance",
    "non-finite evidence field",
    "invalid completeness bounds",
    "future leakage",
    "missing Pattern Insight identity",
    "malformed source reference",
    "unsupported segment category",
    "invalid observation window",
    "support count greater than sample size",
    "contradictory effect fields",
    "unsupported readiness state",
    "unsupported evidence-quality state",
    "random-ID attempt",
    "wall-clock attempt",
    "reference manifest claiming derivation",
    "reference manifest containing calculated metrics",
    "reference manifest claiming causality",
  ]) {
    expect(doc).toContain(scenario);
  }
});

test("no production compatibility aggregation or discovery module exists", () => {
  const libNames = readdirSync(join(process.cwd(), "lib"));

  expect(
    libNames.some((name) =>
      /learning-dataset-to-pattern-insight|evidence-compatibility|pattern-discovery|cohort-builder|insight-builder|effect-calculator/.test(
        name,
      ),
    ),
  ).toBe(false);

  const learningSource = readFileSync(learningFixturePath, "utf8");
  const patternSource = readFileSync(patternFixturePath, "utf8");
  expect(learningSource).toContain("Action335LearningDatasetRow");
  expect(learningSource).toContain("outcome_fields");
  expect(patternSource).toContain("Action343PatternInsightStaticFixture");
  expect(patternSource).toContain("evidence_strength");
});

test("Action 384 verifier succeeds with no effects or secret output", () => {
  const output = runVerifier(
    "scripts/action-384-learning-dataset-to-pattern-insight-evidence-compatibility-test-approval-gate-verify.mjs",
  );
  const parsed = JSON.parse(output);

  expect(parsed.verification_status).toBe("passed");
  expect(parsed.approval_decision).toBe("approved");
  expect(parsed.passed_conditions_count).toBe(16);
  expect(parsed.failed_conditions_count).toBe(0);
  expect(parsed.production_evidence_compatibility_files).toEqual([]);
  expect(parsed.aggregation_approved).toBe(false);
  expect(parsed.pattern_discovery_approved).toBe(false);
  expect(parsed.insight_generation_approved).toBe(false);
  expect(parsed.confidence_calibration_approved).toBe(false);
  expect(parsed.no_effect_flags).toEqual({
    compatibility_tests_implemented: false,
    reference_manifest_created: false,
    aggregation_implemented: false,
    pattern_discovery_implemented: false,
    insights_generated: false,
    fixtures_mutated: false,
    provider_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_behavior_changed: false,
  });
  expect(output).not.toContain("AUTOMATION_SECRET");
  expect(output).not.toContain("TWELVE_DATA_API_KEY");
  expect(output).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
});

test("Actions 337 343 349 357 380 and 383 remain healthy", () => {
  for (const verifier of [
    "scripts/action-337-pattern-discovery-and-confidence-calibration-roadmap-verify.mjs",
    "scripts/action-343-pattern-insight-static-type-spec-verify.mjs",
    "scripts/action-349-pattern-insight-static-fixture-spec-verify.mjs",
    "scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs",
    "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs",
    "scripts/action-383-intelligence-context-to-learning-dataset-static-compatibility-tests-verify.mjs",
  ]) {
    expect(JSON.parse(runVerifier(verifier)).verification_status).toBe("passed");
  }
});

test("Action 384 does not touch fixture runtime preview or deployment surfaces", () => {
  const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const action384Lines = status.split("\n").filter((line) => line.includes("action-384"));

  expect(action384Lines.some((line) => line.includes("lib/"))).toBe(false);
  expect(action384Lines.some((line) => line.includes("app/"))).toBe(false);
  expect(action384Lines.some((line) => line.includes("supabase/"))).toBe(false);
  expect(action384Lines.some((line) => line.includes("netlify.toml"))).toBe(false);
  expect(action384Lines.some((line) => line.includes("proxy.ts"))).toBe(false);
  expect(action384Lines.some((line) => line.includes("action-370-preview-deployment-input-manifest"))).toBe(false);
});
