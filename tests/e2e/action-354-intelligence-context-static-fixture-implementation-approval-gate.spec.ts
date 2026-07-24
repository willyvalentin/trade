import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-354-intelligence-context-static-fixture-implementation-approval-gate.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-354-intelligence-context-static-fixture-implementation-approval-gate-verify.mjs",
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

test("intelligence context fixture approval gate doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("approval_gate_status: intelligence_context_static_fixture_implementation_approval_gate_ready");
  expect(doc).toContain("approval_decision: approved");
  expect(doc).toContain("approved_scope: future_static_intelligence_context_fixture_implementation_only");
  expect(doc).toContain("live_context_collection_approved: false");
  expect(doc).toContain("provider_or_news_api_access_approved: false");
  expect(doc).toContain("context_persistence_approved: false");
  expect(doc).toContain("runtime_recommendation_integration_approved: false");
  expect(doc).toContain("intelligence_context_fixture_implementation_done: false");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
});

test("intelligence context fixture approval gate defines fixture-only approval boundary", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("approval_decision_vocabulary: approved | approved_with_conditions | blocked");
  expect(doc).toContain("Action 354 may approve only A: approval to implement static Intelligence Context fixtures.");
  expect(doc).toContain("Action 354 does not approve B: approval to perform live context collection.");
  expect(doc).toContain("Action 354 does not approve C: approval to call provider or news APIs.");
  expect(doc).toContain("Action 354 does not approve D: approval to persist context.");
  expect(doc).toContain("Action 354 does not approve E: approval to integrate context into runtime recommendation behavior.");
});

test("intelligence context fixture approval gate includes upstream dependencies and contract fields", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 309");
  expect(doc).toContain("Action 331");
  expect(doc).toContain("Action 332");
  expect(doc).toContain("Action 336");
  expect(doc).toContain("Action 342");
  expect(doc).toContain("Action 348");
  expect(doc).toContain("Action 352");
  expect(doc).toContain("Action 353");
  expect(doc).toContain("capture_timestamp");
  expect(doc).toContain("effective_timestamp");
  expect(doc).toContain("market_context");
  expect(doc).toContain("index_context");
  expect(doc).toContain("company_news_context");
  expect(doc).toContain("macro_calendar_context");
  expect(doc).toContain("source_quality_metadata");
});

test("intelligence context fixture approval gate covers minimum representative families", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("bullish market regime");
  expect(doc).toContain("bearish market regime");
  expect(doc).toContain("neutral or mixed regime");
  expect(doc).toContain("SPY aligned");
  expect(doc).toContain("QQQ diverging");
  expect(doc).toContain("IWM diverging");
  expect(doc).toContain("strong sector");
  expect(doc).toContain("weak peer group");
  expect(doc).toContain("positive company news");
  expect(doc).toContain("news unavailable");
  expect(doc).toContain("earnings event");
  expect(doc).toContain("FDA event");
  expect(doc).toContain("CPI");
  expect(doc).toContain("FOMC");
  expect(doc).toContain("options expiration");
  expect(doc).toContain("invalid future leakage attempt");
  expect(doc).toContain("complete provenance");
  expect(doc).toContain("stale source");
  expect(doc).toContain("explicit null");
});

test("intelligence context fixture approval gate defines context semantics and anti-leakage", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("capture-time semantics are explicit");
  expect(doc).toContain("effective-time semantics are explicit where applicable");
  expect(doc).toContain("freshness semantics are explicit and testable");
  expect(doc).toContain("provenance requirements are explicit and testable");
  expect(doc).toContain("missing-data semantics are explicit");
  expect(doc).toContain("unavailable versus unknown semantics are explicit");
  expect(doc).toContain("stale-data semantics are explicit");
  expect(doc).toContain("conflicting-source semantics are explicit");
  expect(doc).toContain("partial-context semantics are explicit");
  expect(doc).toContain("context capture-time semantics prevent future/outcome leakage");
});

test("intelligence context fixture approval gate preserves adapter-first no-parallel-system constraints", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("fixtures should extend existing Intelligence Context contracts");
  expect(doc).toContain("use the Action 336 Intelligence Context Schema concepts");
  expect(doc).toContain("use the Action 342 Intelligence Context Static Fixture Spec concepts");
  expect(doc).toContain("preserve mapper contract compatibility from Action 352");
  expect(doc).toContain("preserve Learning Dataset contract compatibility from Action 353");
  expect(doc).toContain("no parallel context model");
  expect(doc).toContain("no parallel provider provenance model");
  expect(doc).toContain("no runtime collection system");
});

test("intelligence context fixture approval gate keeps runtime provider news Supabase persistence mapper and ranking blocked", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no live context collection");
  expect(doc).toContain("no provider calls");
  expect(doc).toContain("no news API calls");
  expect(doc).toContain("no Supabase reads");
  expect(doc).toContain("no Supabase writes");
  expect(doc).toContain("no context persistence");
  expect(doc).toContain("no schema changes");
  expect(doc).toContain("no migrations");
  expect(doc).toContain("no runtime routes");
  expect(doc).toContain("no scanner integration");
  expect(doc).toContain("no ranking integration");
  expect(doc).toContain("no confidence mutation");
  expect(doc).toContain("no mapper implementation");
  expect(doc).toContain("no Pattern Discovery implementation");
});

test("intelligence context fixture approval verifier exits zero and reports approved fixture-only decision", () => {
  const output = runVerifier(
    "scripts/action-354-intelligence-context-static-fixture-implementation-approval-gate-verify.mjs",
  );
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.approval_gate_found).toBe(true);
  expect(parsed.approval_decision).toBe("approved");
  expect(parsed.fixtures_only_approval_boundary_found).toBe(true);
  expect(parsed.intelligence_context_fixture_implementation_allowed_for_future_action).toBe(true);
  expect(parsed.live_context_collection_approved).toBe(false);
  expect(parsed.provider_or_news_api_access_approved).toBe(false);
  expect(parsed.context_persistence_approved).toBe(false);
  expect(parsed.runtime_recommendation_integration_approved).toBe(false);
  expect(parsed.mapper_implementation_approved).toBe(false);
  expect(parsed.pattern_discovery_implementation_approved).toBe(false);
  expect(parsed.ranking_or_confidence_change_approved).toBe(false);
  expect(parsed.supabase_read_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.schema_change_allowed).toBe(false);
  expect(parsed.migration_allowed).toBe(false);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
});

test("intelligence context fixture approval verifier output contains no secrets", () => {
  const output = runVerifier(
    "scripts/action-354-intelligence-context-static-fixture-implementation-approval-gate-verify.mjs",
  );

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("intelligence context fixture approval verifier source avoids forbidden imports and nondeterminism", () => {
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

test("Action 354 adds no fixture implementation mapper app api route proxy migration or schema change", () => {
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

  expect(status).not.toMatch(/^(..|\?\?) lib\/intelligence-context-static-fixtures\.ts/m);
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

test("upstream safety and intelligence planning verifiers still pass with Action 354", () => {
  const verifiers = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-331-intelligence-first-roadmap-reprioritization-verify.mjs",
    "scripts/action-332-intelligence-data-collection-readiness-map-verify.mjs",
    "scripts/action-336-intelligence-context-schema-draft-verify.mjs",
    "scripts/action-342-intelligence-context-static-fixture-spec-verify.mjs",
    "scripts/action-348-intelligence-context-static-fixture-implementation-plan-verify.mjs",
    "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
    "scripts/action-353-learning-dataset-static-fixture-implementation-approval-gate-verify.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];

  for (const script of verifiers) {
    const parsed = JSON.parse(runVerifier(script));
    expect(parsed.verification_status ?? parsed.guard_status).toMatch(/^(passed)$/);
  }
});
