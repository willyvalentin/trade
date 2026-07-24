import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-348-intelligence-context-static-fixture-implementation-plan.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-348-intelligence-context-static-fixture-implementation-plan-verify.mjs",
);

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-348-intelligence-context-static-fixture-implementation-plan-verify.mjs"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
        TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
        SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
        NEWS_API_KEY: "news-secret-that-must-not-appear",
      },
    },
  );
}

test("intelligence context fixture implementation plan doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain(
    "intelligence_context_fixture_implementation_plan_status: fixture_implementation_plan_ready",
  );
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("intelligence context fixture implementation planning only");
  expect(doc).toContain("not fixture implementation");
});

test("intelligence context fixture implementation plan references existing actions and foundations", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 336 Intelligence Context Schema Draft");
  expect(doc).toContain("Action 342 Intelligence Context Static Fixture Spec");
  expect(doc).toContain("Action 346 Existing Schema Compatibility Matrix");
  expect(doc).toContain("Action 341 Learning Dataset Static Fixture Spec");
  expect(doc).toContain("Action 347 Learning Dataset Static Fixture Implementation Plan");
  expect(doc).toContain("Existing recommendation snapshot, replay, History, and Statistics foundations");
});

test("intelligence context fixture implementation plan defines future implementation files and shape", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("`lib/intelligence-context-static-fixtures.ts`");
  expect(doc).toContain("`lib/intelligence-context-static-fixture-validation.ts`");
  expect(doc).toContain("focused documentation");
  expect(doc).toContain("focused Playwright test");
  expect(doc).toContain("fixture_id");
  expect(doc).toContain("fixture_version");
  expect(doc).toContain("snapshot_timestamp");
  expect(doc).toContain("market_regime_context");
  expect(doc).toContain("sector_industry_context");
  expect(doc).toContain("relative_strength_context");
  expect(doc).toContain("company_news_catalyst_context");
  expect(doc).toContain("calendar_event_context");
  expect(doc).toContain("data_provenance_context");
  expect(doc).toContain("context_snapshot_envelope");
  expect(doc).toContain("anti_leakage_expectation");
});

test("intelligence context fixture implementation plan includes all Action 342 scenarios", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("supportive_bull_regime_sector_strength");
  expect(doc).toContain("weak_market_strong_stock_relative_strength");
  expect(doc).toContain("sector_supported_momentum");
  expect(doc).toContain("isolated_stock_spike_no_sector_support");
  expect(doc).toContain("catalyst_fresh_earnings_gap");
  expect(doc).toContain("stale_catalyst_risk");
  expect(doc).toContain("macro_event_chop_day");
  expect(doc).toContain("options_expiration_noise");
  expect(doc).toContain("missing_news_context");
  expect(doc).toContain("missing_sector_mapping");
  expect(doc).toContain("provenance_low_confidence");
  expect(doc).toContain("anti_leakage_news_after_snapshot");
});

test("intelligence context fixture implementation plan defines deterministic and anti-leakage rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("fixed timestamps");
  expect(doc).toContain("fixed IDs");
  expect(doc).toContain("fixed symbols");
  expect(doc).toContain("no Date.now");
  expect(doc).toContain("no random IDs");
  expect(doc).toContain("no runtime timezone dependency");
  expect(doc).toContain("no environment reads");
  expect(doc).toContain("no network");
  expect(doc).toContain("no provider imports");
  expect(doc).toContain("no news API imports");
  expect(doc).toContain("no Supabase imports");
  expect(doc).toContain("catalyst timestamps after snapshot must remain unavailable at snapshot time");
  expect(doc).toContain("future regime labels must not appear in snapshot-time context");
  expect(doc).toContain("future sector performance must not be included");
  expect(doc).toContain("missing context must never be silently imputed");
});

test("intelligence context fixture implementation plan includes adapter first validation and readiness rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("context fixtures should model the Action 336 envelope");
  expect(doc).toContain("future mappers should attach context to recommendation snapshots");
  expect(doc).toContain("avoid parallel recommendation records");
  expect(doc).toContain("avoid duplicate learning rows");
  expect(doc).toContain("avoid duplicate outcome records");
  expect(doc).toContain("all 12 fixtures exist");
  expect(doc).toContain("IDs are unique and deterministic");
  expect(doc).toContain("missing context reasons are explicit");
  expect(doc).toContain("stable deterministic serialization");
  expect(doc).toContain("CIF0: implementation plan missing");
  expect(doc).toContain("CIF9: local fixture validation complete");
  expect(doc).toContain("Current status is not CIF7");
  expect(doc).toContain("Implementation is not authorized");
});

test("intelligence context fixture implementation plan blocks unsafe work and lists next actions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no context fixture implementation yet");
  expect(doc).toContain("no context mapper implementation yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no Supabase reads/writes yet");
  expect(doc).toContain("no schema changes yet");
  expect(doc).toContain("no migrations yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
  expect(doc).toContain("Action 349: Pattern Insight Static Fixture Spec");
  expect(doc).toContain("Action 354: Intelligence Context Static Fixture Implementation Approval Gate");
});

test("intelligence context fixture implementation verifier exits zero and reports safe false permissions", () => {
  const output = runVerifier();
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.implementation_plan_found).toBe(true);
  expect(parsed.plan_status_found).toBe(true);
  expect(parsed.relationship_to_existing_work_found).toBe(true);
  expect(parsed.allowed_future_files_found).toBe(true);
  expect(parsed.future_fixture_shape_found).toBe(true);
  expect(parsed.required_scenarios_found).toBe(true);
  expect(parsed.deterministic_requirements_found).toBe(true);
  expect(parsed.anti_leakage_rules_found).toBe(true);
  expect(parsed.adapter_first_rules_found).toBe(true);
  expect(parsed.validation_requirements_found).toBe(true);
  expect(parsed.readiness_levels_found).toBe(true);
  expect(parsed.context_fixture_implementation_allowed).toBe(false);
  expect(parsed.context_mapper_implementation_allowed).toBe(false);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_read_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.context_persistence_allowed).toBe(false);
  expect(parsed.schema_change_allowed).toBe(false);
  expect(parsed.migration_allowed).toBe(false);
  expect(parsed.replay_execution_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.confidence_threshold_mutation_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
});

test("intelligence context fixture implementation verifier output contains no secrets", () => {
  const output = runVerifier();

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("intelligence context fixture implementation verifier source avoids forbidden imports and nondeterminism", () => {
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

test("Action 348 adds no app api route proxy or migration", () => {
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

  expect(status).not.toMatch(/^(..|\?\?) app\/api\//m);
  expect(status).not.toMatch(/^(..|\?\?) app\/[^/]+\/page\.tsx/m);
  expect(status).not.toMatch(/^(..|\?\?) proxy\.ts/m);
  expect(status).not.toMatch(/^(..|\?\?) supabase\/migrations\//m);
  expect(guard.guard_status).toBe("passed");
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 Action 336 Action 342 Action 346 Action 347 and golden verifiers still pass", () => {
  const scripts = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/action-336-intelligence-context-schema-draft-verify.mjs",
    "scripts/action-342-intelligence-context-static-fixture-spec-verify.mjs",
    "scripts/action-346-existing-schema-compatibility-matrix-verify.mjs",
    "scripts/action-347-learning-dataset-static-fixture-implementation-plan-verify.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
  ];

  const results = scripts.map((script) =>
    JSON.parse(execFileSync("node", [script], { cwd: process.cwd(), encoding: "utf8" })),
  );

  expect(results[0].guard_status).toBe("passed");
  expect(results.slice(1).every((result) => result.verification_status === "passed")).toBe(
    true,
  );
});
