import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-355-pattern-insight-static-fixture-implementation-plan.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-355-pattern-insight-static-fixture-implementation-plan-verify.mjs",
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

test("Pattern Insight fixture implementation plan doc exists and records static-only status", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("implementation_plan_status: pattern_insight_static_fixture_implementation_plan_ready");
  expect(doc).toContain("future_fixture_implementation_approved: false");
  expect(doc).toContain("pattern_insight_fixture_implementation_done: false");
  expect(doc).toContain("pattern_discovery_implementation_done: false");
  expect(doc).toContain("confidence_calibration_implementation_done: false");
  expect(doc).toContain("runtime_work_done: false");
  expect(doc).toContain("persistence_work_done: false");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
});

test("Pattern Insight fixture implementation plan includes upstream dependencies and contract fields", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const action of [
    "Action 309",
    "Action 331",
    "Action 335",
    "Action 337",
    "Action 343",
    "Action 349",
    "Action 352",
    "Action 353",
    "Action 354",
  ]) {
    expect(doc).toContain(action);
  }

  expect(doc).toContain("insight_id");
  expect(doc).toContain("pattern_dimension");
  expect(doc).toContain("segment_key");
  expect(doc).toContain("outcome_summary");
  expect(doc).toContain("confidence_summary");
  expect(doc).toContain("effect_direction");
  expect(doc).toContain("evidence_strength");
  expect(doc).toContain("mutation_allowed");
});

test("Pattern Insight fixture implementation plan defines future fixture boundary without implementation", () => {
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
  expect(doc).toContain("hard-coded deterministic Pattern Insight literals");
  expect(doc).toContain("must not calculate those cases from source rows");
  expect(doc).toContain("no Pattern Insight fixtures in Action 355");
  expect(doc).toContain("No validator implementation is allowed in Action 355.");
  expect(
    action357AuthorizedImplementationPresent ||
      !existsSync(join(process.cwd(), "lib/pattern-insight-static-fixtures.ts")),
  ).toBe(true);
});

test("Pattern Insight fixture implementation plan blocks discovery statistical inference confidence and ranking mutation", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("pattern mining");
  expect(doc).toContain("grouping algorithms");
  expect(doc).toContain("clustering");
  expect(doc).toContain("statistical testing");
  expect(doc).toContain("significance calculation");
  expect(doc).toContain("confidence recalibration");
  expect(doc).toContain("confidence mutation remains blocked");
  expect(doc).toContain("ranking mutation remains blocked");
  expect(doc).toContain("recommendation reranking is blocked");
  expect(doc).toContain("confidence_calibration_approved: false");
});

test("Pattern Insight fixture implementation plan blocks runtime provider news Supabase persistence schema and migration work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no app/api routes");
  expect(doc).toContain("no proxy.ts changes");
  expect(doc).toContain("no middleware changes");
  expect(doc).toContain("no netlify.toml changes");
  expect(doc).toContain("no migrations");
  expect(doc).toContain("no database schema changes");
  expect(doc).toContain("no Supabase reads or writes");
  expect(doc).toContain("no provider calls");
  expect(doc).toContain("no news API calls");
  expect(doc).toContain("no persistence");
  expect(doc).toContain("provider/news/Supabase access is blocked");
});

test("Pattern Insight fixture implementation plan defines deterministic identity timestamp and source reference contracts", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("fixture ID format: `pi_fixture:<schema_version>:<fixture_family>:<case_slug>`");
  expect(doc).toContain("insight ID format: `pi_insight:<schema_version>:<pattern_dimension>:<segment_key>:<case_slug>`");
  expect(doc).toContain("pattern key format: `<pattern_dimension>/<setup_family>/<segment_key>`");
  expect(doc).toContain("source dataset reference format: `learning_dataset_fixture:<dataset_version>:<window_slug>`");
  expect(doc).toContain("same input -> same fixture output");
  expect(doc).toContain("generated_at_label should be a static label");
  expect(doc).toContain("no Date.now");
  expect(doc).toContain("no new Date");
  expect(doc).toContain("no Math.random");
});

test("Pattern Insight fixture implementation plan covers minimum fixture families and boundary cases", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("setup performs better in bullish market regime");
  expect(doc).toContain("setup performs better with sector alignment");
  expect(doc).toContain("setup performs better with positive relative strength");
  expect(doc).toContain("setup performs better when news catalyst is present");
  expect(doc).toContain("setup performs worse during chop days");
  expect(doc).toContain("setup performs worse against index direction");
  expect(doc).toContain("setup performs worse near high-impact macro events");
  expect(doc).toContain("no meaningful difference detected");
  expect(doc).toContain("small sample with promising direction");
  expect(doc).toContain("contradictory evidence");
  expect(doc).toContain("superseded insight");
  expect(doc).toContain("calibration candidate");
  expect(doc).toContain("sample size 19");
  expect(doc).toContain("sample size 100");
});

test("Pattern Insight fixture implementation plan defines temporal anti-leakage and no-inference contracts", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("preserve observation-window boundaries");
  expect(doc).toContain("distinguish source recommendation time from outcome time");
  expect(doc).toContain("distinguish dataset window from insight generation time");
  expect(doc).toContain("never embed future outcomes into recommendation-time context");
  expect(doc).toContain("never claim causal inference from correlation");
  expect(doc).toContain("must not calculate Pattern Insights from Learning Dataset rows");
  expect(doc).toContain("calculate win rate");
  expect(doc).toContain("calculate expectancy");
  expect(doc).toContain("calculate significance");
  expect(doc).toContain("generate confidence recommendations");
});

test("Pattern Insight fixture implementation verifier exits zero and reports safe static plan", () => {
  const output = runVerifier(
    "scripts/action-355-pattern-insight-static-fixture-implementation-plan-verify.mjs",
  );
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.plan_found).toBe(true);
  expect(parsed.required_sections_found).toBe(true);
  expect(parsed.future_fixture_boundary_found).toBe(true);
  expect(
    parsed.pattern_insight_fixture_implementation_absent ||
      parsed.action357_authorized_pattern_insight_fixture_implementation_present,
  ).toBe(true);
  expect(parsed.unauthorized_implementation_artifacts_found).toEqual([]);
  expect(parsed.pattern_discovery_implementation_absent).toBe(true);
  expect(parsed.confidence_calibration_implementation_absent).toBe(true);
  expect(parsed.runtime_blocked).toBe(true);
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.news_call_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
});

test("Pattern Insight fixture implementation verifier output contains no secrets", () => {
  const output = runVerifier(
    "scripts/action-355-pattern-insight-static-fixture-implementation-plan-verify.mjs",
  );

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("Pattern Insight fixture implementation verifier source avoids runtime imports and nondeterminism", () => {
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

test("Action 355 adds no app api route proxy middleware netlify migration schema fixture implementation or mapper", () => {
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

test("upstream safety and Pattern Insight planning verifiers still pass with Action 355", () => {
  const verifiers = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-337-pattern-discovery-and-confidence-calibration-roadmap-verify.mjs",
    "scripts/action-343-pattern-insight-static-type-spec-verify.mjs",
    "scripts/action-349-pattern-insight-static-fixture-spec-verify.mjs",
    "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
    "scripts/action-353-learning-dataset-static-fixture-implementation-approval-gate-verify.mjs",
    "scripts/action-354-intelligence-context-static-fixture-implementation-approval-gate-verify.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];

  for (const script of verifiers) {
    const parsed = JSON.parse(runVerifier(script));
    expect(parsed.verification_status ?? parsed.guard_status).toMatch(/^(passed)$/);
  }
});
