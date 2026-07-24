import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-356-pattern-insight-static-fixture-implementation-approval-gate.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-356-pattern-insight-static-fixture-implementation-approval-gate-verify.mjs",
);

function runVerifier(scriptPath: string) {
  return execFileSync("node", [scriptPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      NEWS_API_KEY: "news-secret-that-must-not-appear",
    },
  });
}

test("Pattern Insight fixture approval gate doc exists and records approved fixture-only status", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("approval_gate_status: pattern_insight_static_fixture_implementation_approval_gate_ready");
  expect(doc).toContain("approval_decision: approved");
  expect(doc).toContain("approved_scope: future_static_pattern_insight_fixture_implementation_only");
  expect(doc).toContain("pattern_insight_fixture_implementation_approved_for_future_action: true");
  expect(doc).toContain("pattern_discovery_implementation_approved: false");
  expect(doc).toContain("runtime_or_persistence_integration_approved: false");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
});

test("Pattern Insight fixture approval gate uses exact approval vocabulary and deterministic gate conditions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("approval_decision_vocabulary: approved | approved_with_conditions | blocked");
  expect(doc).toContain("approved: every required deterministic gate condition passes.");
  expect(doc).toContain("approved_with_conditions: the future static implementation is safe");
  expect(doc).toContain("blocked: implementation would require runtime work");
  expect(doc).toContain("gate_static_local_only: true");
  expect(doc).toContain("gate_existing_contract_defined: true");
  expect(doc).toContain("gate_no_parallel_pattern_insight_model_needed: true");
  expect(doc).toContain("gate_no_runtime_provider_news_supabase_replay_or_persistence_required: true");
  expect(doc).toContain("Failed gate conditions: none.");
});

test("Pattern Insight fixture approval gate distinguishes A approval from blocked B through G", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 356 may approve only A: approval to implement static Pattern Insight fixtures.");
  expect(doc).toContain("Action 356 does not approve B: approval to implement Pattern Discovery.");
  expect(doc).toContain("Action 356 does not approve C: approval to calculate insights from Learning Dataset rows.");
  expect(doc).toContain("Action 356 does not approve D: approval to perform statistical inference.");
  expect(doc).toContain("Action 356 does not approve E: approval to calibrate or mutate confidence.");
  expect(doc).toContain("Action 356 does not approve F: approval to mutate ranking or recommendation behavior.");
  expect(doc).toContain("Action 356 does not approve G: approval to persist or integrate insights into runtime.");
});

test("Pattern Insight fixture approval gate keeps existing Action 343 contract authoritative", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Future fixtures must use the existing Action 343 Pattern Insight contract as authoritative");
  expect(doc).toContain("insight_id");
  expect(doc).toContain("pattern_dimension");
  expect(doc).toContain("segment_key");
  expect(doc).toContain("outcome_summary");
  expect(doc).toContain("confidence_summary");
  expect(doc).toContain("mutation_allowed");
  expect(doc).toContain("Do not approve a duplicate Pattern Insight interface");
  expect(doc).toContain("fixture-only shadow schema");
  expect(doc).toContain("parallel Pattern Discovery result shape");
});

test("Pattern Insight fixture approval gate defines approved future implementation boundary without implementation", () => {
  const doc = readFileSync(docPath, "utf8");
  const action357AuthorizedImplementationPresent =
    existsSync(join(process.cwd(), "docs/action-357-pattern-insight-static-fixture-implementation.md")) &&
    existsSync(join(process.cwd(), "lib/pattern-insight-static-fixtures.ts")) &&
    existsSync(
      join(
        process.cwd(),
        "scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs",
      ),
    ) &&
    existsSync(
      join(
        process.cwd(),
        "tests/e2e/action-357-pattern-insight-static-fixture-implementation.spec.ts",
      ),
    );

  expect(doc).toContain("`lib/pattern-insight-static-fixtures.ts`");
  expect(doc).toContain("optional pure fixture validation helper");
  expect(doc).toContain("hard-coded deterministic objects");
  expect(doc).toContain("Pattern Insight fixture implementation remains blocked until the next separately requested Action");
  expect(
    action357AuthorizedImplementationPresent ||
      !existsSync(join(process.cwd(), "lib/pattern-insight-static-fixtures.ts")),
  ).toBe(true);
});

test("Pattern Insight fixture approval gate blocks inference aggregation calculation calibration ranking runtime and persistence", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Pattern Discovery remains blocked");
  expect(doc).toContain("insight calculation from Learning Dataset rows remains blocked");
  expect(doc).toContain("statistical inference remains blocked");
  expect(doc).toContain("cohort comparison remains blocked");
  expect(doc).toContain("aggregation remains blocked");
  expect(doc).toContain("confidence calibration remains blocked");
  expect(doc).toContain("confidence mutation remains blocked");
  expect(doc).toContain("ranking and recommendation behavior mutation remains blocked");
  expect(doc).toContain("runtime validation remains blocked");
  expect(doc).toContain("persistence remains blocked");
});

test("Pattern Insight fixture approval gate blocks provider news Supabase replay schema migration and deployment", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("provider/news/Supabase access remains blocked");
  expect(doc).toContain("replay execution remains blocked");
  expect(doc).toContain("schema and migration work remains blocked");
  expect(doc).toContain("deployment remains blocked");
  expect(doc).toContain("no app/api routes");
  expect(doc).toContain("no proxy.ts changes");
  expect(doc).toContain("no middleware changes");
  expect(doc).toContain("no netlify.toml changes");
});

test("Pattern Insight fixture approval gate defines deterministic identity timestamp serialization and ordering", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("fixture ID format: `pi_fixture:<schema_version>:<fixture_family>:<case_slug>`");
  expect(doc).toContain("insight ID format: `pi_insight:<schema_version>:<pattern_dimension>:<segment_key>:<case_slug>`");
  expect(doc).toContain("same input -> same fixture output");
  expect(doc).toContain("generated_at_label is static");
  expect(doc).toContain("fixture arrays sort by fixture_id");
  expect(doc).toContain("nested arrays sort by stable keys");
  expect(doc).toContain("no Date.now");
  expect(doc).toContain("no new Date");
  expect(doc).toContain("no Math.random");
});

test("Pattern Insight fixture approval gate covers minimum malformed and boundary fixture cases", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("bullish market regime alignment");
  expect(doc).toContain("sector alignment");
  expect(doc).toContain("positive relative strength");
  expect(doc).toContain("chop-day weakness");
  expect(doc).toContain("index divergence");
  expect(doc).toContain("no meaningful difference");
  expect(doc).toContain("insufficient sample");
  expect(doc).toContain("superseded insight");
  expect(doc).toContain("missing identity");
  expect(doc).toContain("duplicate identity");
  expect(doc).toContain("non-finite metric");
  expect(doc).toContain("support count greater than sample size");
  expect(doc).toContain("wall-clock timestamp attempt");
  expect(doc).toContain("random ID attempt");
  expect(doc).toContain("sample size 100");
});

test("Pattern Insight fixture approval gate defines temporal anti-leakage and no-inference rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("recommendation time before outcome time");
  expect(doc).toContain("dataset window before insight generation label");
  expect(doc).toContain("preserve observation-window boundaries");
  expect(doc).toContain("never embed future outcomes into recommendation-time context");
  expect(doc).toContain("never claim causal inference from correlation");
  expect(doc).toContain("Learning Dataset rows as input");
  expect(doc).toContain("arrays that are grouped or aggregated");
  expect(doc).toContain("calculate win rate");
  expect(doc).toContain("calculate significance");
});

test("Pattern Insight fixture approval verifier exits zero and reports approved fixture-only boundary", () => {
  const output = runVerifier(
    "scripts/action-356-pattern-insight-static-fixture-implementation-approval-gate-verify.mjs",
  );
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.approval_gate_found).toBe(true);
  expect(parsed.approval_decision).toBe("approved");
  expect(parsed.deterministic_gate_conditions_found).toBe(true);
  expect(parsed.failed_gate_conditions).toEqual([]);
  expect(parsed.fixture_only_approval_boundary_found).toBe(true);
  expect(parsed.future_fixture_implementation_allowed_for_future_action).toBe(true);
  expect(parsed.pattern_discovery_implementation_approved).toBe(false);
  expect(parsed.inference_approved).toBe(false);
  expect(parsed.aggregation_approved).toBe(false);
  expect(parsed.calculation_approved).toBe(false);
  expect(parsed.confidence_mutation_approved).toBe(false);
  expect(parsed.ranking_or_recommendation_mutation_approved).toBe(false);
  expect(parsed.runtime_or_persistence_integration_approved).toBe(false);
  expect(parsed.provider_news_supabase_access_approved).toBe(false);
  expect(parsed.schema_or_migration_change_approved).toBe(false);
  expect(
    parsed.pattern_insight_fixture_implementation_absent ||
      parsed.action357_authorized_pattern_insight_fixture_implementation_present,
  ).toBe(true);
  expect(parsed.unauthorized_implementation_artifacts_found).toEqual([]);
});

test("Pattern Insight fixture approval verifier output contains no secrets", () => {
  const output = runVerifier(
    "scripts/action-356-pattern-insight-static-fixture-implementation-approval-gate-verify.mjs",
  );

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("Pattern Insight fixture approval verifier source avoids runtime imports and nondeterminism", () => {
  const source = readFileSync(verifierPath, "utf8");

  expect(source).not.toContain("@supabase");
  expect(source).not.toContain("supabase-js");
  expect(source).not.toContain("TWELVE_DATA");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("from \"../app");
  expect(source).not.toContain("@/lib/provider");
  expect(source).not.toContain("@/lib/news");
  expect(source).not.toContain("@/lib/scanner");
  expect(source).not.toContain("@/lib/broker");
  expect(source).not.toContain("@/lib/execution");
  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("new Date");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("writeFile");
});

test("Action 356 adds no app api route proxy middleware netlify migration schema fixture implementation or mapper", () => {
  const status = execFileSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const action357AuthorizedImplementationPresent =
    existsSync(join(process.cwd(), "docs/action-357-pattern-insight-static-fixture-implementation.md")) &&
    existsSync(join(process.cwd(), "lib/pattern-insight-static-fixtures.ts")) &&
    existsSync(
      join(
        process.cwd(),
        "scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs",
      ),
    ) &&
    existsSync(
      join(
        process.cwd(),
        "tests/e2e/action-357-pattern-insight-static-fixture-implementation.spec.ts",
      ),
    );
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );

  if (!action357AuthorizedImplementationPresent) {
    expect(status).not.toMatch(/^(..|\?\?) lib\/pattern-insight-static-fixtures\.ts/m);
  }
  expect(status).not.toMatch(/^(..|\?\?) lib\/pattern-discovery.*\.ts/m);
  expect(status).not.toMatch(/^(..|\?\?) lib\/confidence-calibration.*\.ts/m);
  expect(status).not.toMatch(/^(..|\?\?) lib\/snapshot-to-learning-dataset-mapper\.ts/m);
  expect(status).not.toMatch(/^(..|\?\?) app\/api\//m);
  expect(status).not.toMatch(/^(..|\?\?) app\/[^/]+\/page\.tsx/m);
  expect(status).not.toMatch(/^(..|\?\?) proxy\.ts/m);
  expect(status).not.toMatch(/^(..|\?\?) middleware\.(ts|js)/m);
  expect(status).not.toMatch(/^(..|\?\?) netlify\.toml/m);
  expect(status).not.toMatch(/^(..|\?\?) supabase\/migrations\//m);
  expect(guard.guard_status).toBe("passed");
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("upstream safety and Pattern Insight planning verifiers still pass with Action 356", () => {
  const verifiers = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-337-pattern-discovery-and-confidence-calibration-roadmap-verify.mjs",
    "scripts/action-343-pattern-insight-static-type-spec-verify.mjs",
    "scripts/action-349-pattern-insight-static-fixture-spec-verify.mjs",
    "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
    "scripts/action-353-learning-dataset-static-fixture-implementation-approval-gate-verify.mjs",
    "scripts/action-354-intelligence-context-static-fixture-implementation-approval-gate-verify.mjs",
    "scripts/action-355-pattern-insight-static-fixture-implementation-plan-verify.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];

  for (const script of verifiers) {
    const parsed = JSON.parse(runVerifier(script));
    expect(parsed.verification_status ?? parsed.guard_status).toMatch(/^(passed)$/);
  }
});
