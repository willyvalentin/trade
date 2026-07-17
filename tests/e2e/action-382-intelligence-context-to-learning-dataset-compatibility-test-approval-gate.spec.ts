import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-382-intelligence-context-to-learning-dataset-compatibility-test-approval-gate.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-382-intelligence-context-to-learning-dataset-compatibility-test-approval-gate-verify.mjs",
);
const learningFixturePath = join(
  process.cwd(),
  "lib/learning-dataset-static-fixtures.ts",
);
const contextFixturePath = join(
  process.cwd(),
  "lib/intelligence-context-static-fixtures.ts",
);

function runVerifier(path: string) {
  return execFileSync("node", [path], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "provider-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      NEWS_API_KEY: "news-secret-that-must-not-appear",
    },
  });
}

test("Action 382 approval-gate documentation and verifier exist", () => {
  expect(existsSync(docPath)).toBe(true);
  expect(existsSync(verifierPath)).toBe(true);
  expect(existsSync(learningFixturePath)).toBe(true);
  expect(existsSync(contextFixturePath)).toBe(true);

  const doc = readFileSync(docPath, "utf8");
  expect(doc).toContain(
    "approval_gate_status: intelligence_context_to_learning_dataset_compatibility_test_gate_ready",
  );
  expect(doc).toContain("runtime_preview_status: runtime_preview_waiting_for_operator_inputs");
});

test("approval vocabulary and deterministic decision contract are explicit", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain(
    "approval_vocabulary: approved | approved_with_conditions | blocked",
  );
  expect(doc).toContain("approval_decision: approved");
  expect(doc).toContain("passed_conditions_count: 13");
  expect(doc).toContain("failed_conditions_count: 0");
  expect(doc).toContain("all_required_gate_conditions_passed: true");
});

test("only static tests are approved while helper mapper and runtime concepts remain blocked", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("### A. Static Fixture Compatibility Tests");
  expect(doc).toContain("### B. Pure Composition Assertion Helper");
  expect(doc).toContain("### C. Snapshot-to-Learning Dataset Mapper");
  expect(doc).toContain("### D. Runtime Integration");
  expect(doc).toContain("Action 382 approves only A");
  expect(doc).toContain("pure_composition_assertion_helper_approved: false");
  expect(doc).toContain("snapshot_to_learning_dataset_mapper_approved: false");
  expect(doc).toContain("runtime_integration_approved: false");
});

test("future boundary is tests-only and approves no production compatibility module", () => {
  const doc = readFileSync(docPath, "utf8");
  const libNames = readdirSync(join(process.cwd(), "lib"));

  expect(doc).toContain(
    "tests/e2e/action-383-intelligence-context-to-learning-dataset-compatibility.spec.ts",
  );
  expect(doc).toContain("No production `lib/` module is approved");
  expect(doc).toContain("tests_only_no_helper_no_mapper_no_runtime");
  expect(doc).toContain("production_lib_module_approved: false");
  expect(
    libNames.some((name) =>
      /context-to-learning-dataset-compatibility|compatibility-composition|context-row-mapper/.test(
        name,
      ),
    ),
  ).toBe(false);
});

test("shared authoritative type relationship is documented and present", () => {
  const doc = readFileSync(docPath, "utf8");
  const contextSource = readFileSync(contextFixturePath, "utf8");

  for (const typeName of [
    "LearningDatasetContext",
    "LearningDatasetContextValue",
    "LearningDatasetProvenance",
  ]) {
    expect(doc).toContain(typeName);
    expect(contextSource).toContain(typeName);
  }
  expect(contextSource).toContain(
    'from "@/lib/learning-dataset-static-fixtures"',
  );
});

test("identity linkage temporal and context-value compatibility scenarios are approved", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const expected of [
    "fixture IDs stay independent from row IDs",
    "mismatched recommendation linkage is rejected",
    "duplicate context identity is detected",
    "capture at or before recommendation boundary",
    "effective time compatible with recommendation time",
    "outcome timestamps excluded from context",
    "future company and macro events excluded",
    "bullish, bearish, mixed, trend, and chop",
    "aligned and diverging SPY/QQQ/IWM",
    "earnings, guidance, FDA, SEC, CPI, FOMC, jobs, and options expiration",
  ]) {
    expect(doc).toContain(expected);
  }
});

test("missing provenance freshness and future-exclusion contracts are explicit", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const heading of [
    "## Provenance Compatibility",
    "## Freshness Compatibility",
    "## Missing-Data Compatibility",
    "## Null Compatibility",
    "## Unknown Compatibility",
    "## Unavailable Compatibility",
    "## Stale Compatibility",
    "## Conflicting Compatibility",
    "## Partial Compatibility",
    "## Future-Exclusion Compatibility",
  ]) {
    expect(doc).toContain(heading);
  }
  expect(doc).toContain("included_in_snapshot_context: false");
  expect(doc).toContain("must not choose a winner");
  expect(doc).toContain("must not calculate a replacement completeness value");
});

test("anti-leakage immutability ordering and serialization requirements are explicit", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("future news remains excluded");
  expect(doc).toContain("future macro facts remain excluded");
  expect(doc).toContain("outcome fields are absent from context");
  expect(doc).toContain(
    "Action 380 and Action 381 fixture serialization before assertions",
  );
  expect(doc).toContain("must not mutate imported arrays");
  expect(doc).toContain("byte-equivalent serialization");
  expect(doc).toContain("fixture counts, lexical ordering, deterministic IDs");
});

test("no transformation normalization repair generation or mapper is approved", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const heading of [
    "## No-Transformation Requirement",
    "## No-Normalization Requirement",
    "## No-Repair Requirement",
    "## No-Generation Requirement",
    "## No-Mapper Requirement",
  ]) {
    expect(doc).toContain(heading);
  }
  expect(doc).toContain("may not generate IDs, timestamps, context objects");
  expect(doc).toContain("The Snapshot-to-Learning Dataset mapper remains blocked");
});

test("all required incompatibility scenarios are defined without repair", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const scenario of [
    "missing required context identity",
    "invalid recommendation linkage",
    "future capture timestamp",
    "future effective timestamp improperly included",
    "outcome leakage",
    "unsupported category",
    "malformed provenance",
    "invalid freshness state",
    "stale/fresh contradiction",
    "conflict state without conflict metadata",
    "partial context marked complete",
    "non-finite numeric metric",
    "invalid completeness bounds",
    "duplicate identities",
    "random ID attempt",
    "wall-clock attempt",
  ]) {
    expect(doc).toContain(scenario);
  }
  expect(doc).toContain("detect without normalizing or repairing");
});

test("Action 382 verifier succeeds with no effects or secret output", () => {
  const output = runVerifier(
    "scripts/action-382-intelligence-context-to-learning-dataset-compatibility-test-approval-gate-verify.mjs",
  );
  const parsed = JSON.parse(output);

  expect(parsed.verification_status).toBe("passed");
  expect(parsed.approval_decision).toBe("approved");
  expect(parsed.passed_conditions_count).toBe(13);
  expect(parsed.failed_conditions_count).toBe(0);
  expect(parsed.compatibility_lib_files).toEqual([]);
  expect(parsed.pure_composition_assertion_helper_approved).toBe(false);
  expect(parsed.snapshot_to_learning_dataset_mapper_approved).toBe(false);
  expect(parsed.runtime_integration_approved).toBe(false);
  expect(parsed.no_effect_flags).toEqual({
    compatibility_tests_implemented: false,
    composition_helper_implemented: false,
    mapper_implemented: false,
    learning_rows_generated: false,
    fixtures_mutated: false,
    provider_call_executed: false,
    news_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_behavior_changed: false,
  });
  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("provider-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("Actions 352 354 380 and 381 remain healthy", () => {
  for (const verifier of [
    "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
    "scripts/action-354-intelligence-context-static-fixture-implementation-approval-gate-verify.mjs",
    "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs",
    "scripts/action-381-intelligence-context-static-fixture-implementation-verify.mjs",
  ]) {
    expect(JSON.parse(runVerifier(verifier)).verification_status).toBe("passed");
  }
});

test("Action 382 does not touch runtime preview candidate or deployment surfaces", () => {
  const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const action382Lines = status.split("\n").filter((line) => line.includes("action-382"));

  expect(action382Lines.some((line) => line.includes("lib/"))).toBe(false);
  expect(action382Lines.some((line) => line.includes("app/"))).toBe(false);
  expect(action382Lines.some((line) => line.includes("supabase/"))).toBe(false);
  expect(action382Lines.some((line) => line.includes("netlify.toml"))).toBe(false);
  expect(action382Lines.some((line) => line.includes("proxy.ts"))).toBe(false);
  expect(action382Lines.some((line) => line.includes("action-370-preview-deployment-input-manifest"))).toBe(false);
});
