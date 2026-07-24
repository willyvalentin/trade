import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-353-learning-dataset-static-fixture-implementation-approval-gate.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-353-learning-dataset-static-fixture-implementation-approval-gate-verify.mjs",
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

test("learning dataset fixture approval gate doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("approval_gate_status: learning_dataset_static_fixture_implementation_approval_gate_ready");
  expect(doc).toContain("approval_decision: approved");
  expect(doc).toContain("approved_scope: future_static_learning_dataset_fixture_implementation_only");
  expect(doc).toContain("mapper_implementation_approved: false");
  expect(doc).toContain("fixture_implementation_done: false");
  expect(doc).toContain("deploy_readiness: false");
  expect(doc).toContain("main_push_allowed: false");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
});

test("learning dataset fixture approval gate defines approval vocabulary and fixture-only boundary", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("approval_decision_vocabulary: approved | approved_with_conditions | blocked");
  expect(doc).toContain("approved: every gate condition is passed");
  expect(doc).toContain("approved_with_conditions: at least one non-critical condition is unresolved but no forbidden surface is required");
  expect(doc).toContain("blocked: any forbidden surface is required or any critical condition fails");
  expect(doc).toContain("Action 353 approves only A: a future static fixture implementation for Learning Dataset rows.");
  expect(doc).toContain("Action 353 does not approve B: a mapper implementation.");
});

test("learning dataset fixture approval gate includes required upstream references and contracts", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 309");
  expect(doc).toContain("Action 334");
  expect(doc).toContain("Action 335");
  expect(doc).toContain("Action 340");
  expect(doc).toContain("Action 341");
  expect(doc).toContain("Action 346");
  expect(doc).toContain("Action 347");
  expect(doc).toContain("Action 352");
  expect(doc).toContain("recommendation_snapshot");
  expect(doc).toContain("context_snapshot");
  expect(doc).toContain("evaluated_outcome");
  expect(doc).toContain("expected_learning_row_summary");
  expect(doc).toContain("fixture_expected_status");
});

test("learning dataset fixture approval gate covers minimum future fixture categories", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("complete valid row");
  expect(doc).toContain("missing optional context");
  expect(doc).toContain("missing required identity");
  expect(doc).toContain("incomplete outcome");
  expect(doc).toContain("no-outcome-yet state");
  expect(doc).toContain("invalid temporal ordering");
  expect(doc).toContain("snapshot/outcome leakage attempt");
  expect(doc).toContain("unknown categorical values");
  expect(doc).toContain("low provenance completeness");
  expect(doc).toContain("conflicting identity linkage");
  expect(doc).toContain("partial market context");
  expect(doc).toContain("absent news context");
  expect(doc).toContain("absent event context");
  expect(doc).toContain("deterministic reproduction of the same row");
  expect(doc).toContain("explicit null versus unavailable versus unknown semantics");
});

test("learning dataset fixture approval gate protects time semantics and anti-leakage", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("snapshot-time versus outcome-time separation is testable");
  expect(doc).toContain("outcome fields must never rewrite snapshot-time fields");
  expect(doc).toContain("anti-leakage rules are testable");
  expect(doc).toContain("later news must be excluded from snapshot-time context");
  expect(doc).toContain("later market regime labels must be excluded from snapshot-time context");
  expect(doc).toContain("later relative strength must be excluded from snapshot-time context");
});

test("learning dataset fixture approval gate preserves adapter-first no-parallel-system constraints", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("use existing Recommendation Snapshot contract concepts");
  expect(doc).toContain("use existing Context Snapshot contract concepts");
  expect(doc).toContain("use existing Outcome contract concepts");
  expect(doc).toContain("use existing Learning Dataset Row contract concepts");
  expect(doc).toContain("no parallel recommendation model");
  expect(doc).toContain("no parallel outcome model");
  expect(doc).toContain("no parallel confidence model");
  expect(doc).toContain("no parallel provider provenance model");
  expect(doc).toContain("no detached learning identity system");
});

test("learning dataset fixture approval gate keeps runtime provider Supabase migration and mapper blocked", () => {
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
  expect(doc).toContain("no replay execution");
  expect(doc).toContain("no mapper implementation");
  expect(doc).toContain("no scanner/ranking/confidence mutation");
});

test("learning dataset fixture approval verifier exits zero and reports approved fixture-only decision", () => {
  const output = runVerifier(
    "scripts/action-353-learning-dataset-static-fixture-implementation-approval-gate-verify.mjs",
  );
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.approval_gate_found).toBe(true);
  expect(parsed.approval_decision).toBe("approved");
  expect(parsed.fixture_approval_only_found).toBe(true);
  expect(parsed.fixture_implementation_allowed_for_future_action).toBe(true);
  expect(parsed.mapper_implementation_approved).toBe(false);
  expect(parsed.fixture_implementation_done).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_read_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.schema_change_allowed).toBe(false);
  expect(parsed.migration_allowed).toBe(false);
  expect(parsed.replay_execution_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.confidence_behavior_mutation_allowed).toBe(false);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
});

test("learning dataset fixture approval verifier output contains no secrets", () => {
  const output = runVerifier(
    "scripts/action-353-learning-dataset-static-fixture-implementation-approval-gate-verify.mjs",
  );

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("learning dataset fixture approval verifier source avoids forbidden imports and nondeterminism", () => {
  const source = readFileSync(verifierPath, "utf8");

  expect(source).not.toContain("@supabase");
  expect(source).not.toContain("supabase-js");
  expect(source).not.toContain("TWELVE_DATA");
  expect(source).not.toContain("process.env");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("next/server");
  expect(source).not.toContain("from \"../app");
  expect(source).not.toContain("@/lib/provider");
  expect(source).not.toContain("@/lib/scanner");
  expect(source).not.toContain("@/lib/broker");
  expect(source).not.toContain("@/lib/execution");
  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("new Date");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("writeFile");
});

test("Action 353 adds no fixture implementation mapper app api route proxy migration or schema change", () => {
  const status = execFileSync("git", ["status", "--short"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );

  expect(status).not.toMatch(/^(..|\?\?) lib\/learning-dataset-static-fixtures\.ts/m);
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

test("upstream safety and dataset planning verifiers still pass with Action 353", () => {
  const verifiers = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-334-recommendation-snapshot-completeness-audit-verify.mjs",
    "scripts/action-335-learning-outcome-dataset-design-verify.mjs",
    "scripts/action-340-snapshot-field-inventory-against-existing-schema-verify.mjs",
    "scripts/action-341-learning-dataset-static-fixture-spec-verify.mjs",
    "scripts/action-346-existing-schema-compatibility-matrix-verify.mjs",
    "scripts/action-347-learning-dataset-static-fixture-implementation-plan-verify.mjs",
    "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];

  for (const script of verifiers) {
    const parsed = JSON.parse(runVerifier(script));
    expect(parsed.verification_status ?? parsed.guard_status).toMatch(/^(passed)$/);
  }
});
