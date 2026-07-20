import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-342-intelligence-context-static-fixture-spec.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-342-intelligence-context-static-fixture-spec-verify.mjs",
);

const coreContextFixtureScenarios = [
  "supportive_bull_regime_sector_strength",
  "weak_market_strong_stock_relative_strength",
  "sector_supported_momentum",
  "isolated_stock_spike_no_sector_support",
  "catalyst_fresh_earnings_gap",
  "stale_catalyst_risk",
  "macro_event_chop_day",
  "options_expiration_noise",
  "missing_news_context",
  "missing_sector_mapping",
  "provenance_low_confidence",
  "anti_leakage_news_after_snapshot",
];

const objectCoverage = [
  "MarketRegimeContext",
  "SectorIndustryContext",
  "RelativeStrengthContext",
  "CompanyNewsCatalystContext",
  "CalendarEventContext",
  "DataProvenanceContext",
  "ContextSnapshotEnvelope",
];

const contextLabels = [
  "market_regime_label",
  "sector_support_label",
  "relative_strength_label",
  "catalyst_support_label",
  "calendar_risk_label",
  "data_provenance_label",
  "context_completeness_label",
  "anti_leakage_status",
  "learning_context_eligibility",
  "missing_context_reasons",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-342-intelligence-context-static-fixture-spec-verify.mjs"],
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

test("intelligence context fixture spec doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("intelligence_context_static_fixture_status: fixture_spec_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("intelligence context fixture planning only");
  expect(doc).toContain("not fixture implementation");
  expect(doc).toContain("schema implementation");
  expect(doc).toContain("migration");
  expect(doc).toContain("runtime implementation");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("news integration");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("context fixture spec explains purpose", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Context fixtures make Ture's broader intelligence layer concrete");
  expect(doc).toContain("market regime, sector/industry, relative strength, company news/catalysts, calendar events, and provenance");
  expect(doc).toContain("attach to recommendation snapshots");
  expect(doc).toContain("support future learning dataset fixtures and pattern discovery");
  expect(doc).toContain("anti-leakage safe and deterministic");
});

test("context fixture spec includes design principles", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("deterministic timestamps");
  expect(doc).toContain("no Date.now");
  expect(doc).toContain("no random IDs");
  expect(doc).toContain("no provider calls");
  expect(doc).toContain("no news API calls");
  expect(doc).toContain("no Supabase reads/writes");
  expect(doc).toContain("snapshot-time context separated from post-outcome context");
  expect(doc).toContain("available_at_snapshot_time must be explicit for catalysts");
  expect(doc).toContain("missing context must be explicit");
  expect(doc).toContain("each fixture should define expected context completeness");
  expect(doc).toContain("no scanner/ranking mutation");
  expect(doc).toContain("no confidence threshold mutation");
});

test("context fixture spec lists all twelve core scenarios", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const scenario of coreContextFixtureScenarios) {
    expect(doc).toContain(scenario);
  }
  expect(doc).toContain("SPY/QQQ aligned positive");
  expect(doc).toContain("stock moves without sector/peer support");
  expect(doc).toContain("catalyst_freshness stale");
  expect(doc).toContain("must not be considered snapshot-time catalyst");
});

test("context fixture spec includes required object coverage and labels", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const objectName of objectCoverage) {
    expect(doc).toContain(objectName);
  }
  for (const label of contextLabels) {
    expect(doc).toContain(label);
  }
});

test("context fixture spec includes anti-leakage validation cases", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("catalyst after snapshot time must not be marked available_at_snapshot_time");
  expect(doc).toContain("end-of-day trend/chop classification must not be used as snapshot-time regime unless explicitly marked post_outcome");
  expect(doc).toContain("future relative strength must not be used as pre-trade context");
  expect(doc).toContain("later sector move must not be used as snapshot-time sector support");
  expect(doc).toContain("context enrichment versions must be auditable");
});

test("context fixture spec maps to existing foundations and readiness levels", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Intelligence Context Schema Draft");
  expect(doc).toContain("Recommendation Snapshot Completeness Audit");
  expect(doc).toContain("Learning Outcome Dataset Design");
  expect(doc).toContain("Learning Dataset Static Fixture Spec");
  expect(doc).toContain("Pattern Discovery Roadmap");
  expect(doc).toContain("existing History/Statistics foundations");
  expect(doc).toContain("Prefer context envelopes/adapters over parallel architecture");
  expect(doc).toContain("Do not duplicate recommendation or outcome records");
  expect(doc).toContain("CF0: context fixture scenarios undefined");
  expect(doc).toContain("CF1: context fixture scenario list defined");
  expect(doc).toContain("CF2: required context object coverage defined");
  expect(doc).toContain("CF3: expected context labels defined");
  expect(doc).toContain("CF4: anti-leakage validation cases defined");
  expect(doc).toContain("CF5: static fixture implementation ready");
  expect(doc).toContain("CF6: fixture tests pass locally");
  expect(doc).toContain("CF7: mapped to learning dataset fixture plan");
  expect(doc).toContain("CF8: ready for local context mapper implementation");
  expect(doc).toContain("Current intelligence context fixtures are not yet CF8");
});

test("context fixture spec blocks unsafe implementation work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no context fixture implementation yet");
  expect(doc).toContain("no context persistence yet");
  expect(doc).toContain("no dataset persistence yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no runtime routes yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no schema changes");
  expect(doc).toContain("no migrations yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
  expect(doc).toContain("does not authorize context fixture implementation");
});

test("context fixture spec lists next actions 343 through 348", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 343: Pattern Insight Static Type Spec");
  expect(doc).toContain("Action 344: Runtime Ping-Only Route Implementation Plan");
  expect(doc).toContain("Action 345: First Tiny Provider Capacity Experiment Plan");
  expect(doc).toContain("Action 346: Existing Schema Compatibility Matrix");
  expect(doc).toContain("Action 347: Learning Dataset Static Fixture Implementation Plan");
  expect(doc).toContain("Action 348: Intelligence Context Static Fixture Implementation Plan");
});

test("verifier script exists exits 0 and reports context fixture spec ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain("action-342-intelligence-context-static-fixture-spec.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.context_fixture_spec_found).toBe(true);
  expect(parsed.fixture_status_found).toBe(true);
  expect(parsed.fixture_design_principles_found).toBe(true);
  expect(parsed.core_context_fixture_scenarios_found).toBe(true);
  expect(parsed.required_fixture_object_coverage_found).toBe(true);
  expect(parsed.expected_context_labels_found).toBe(true);
  expect(parsed.anti_leakage_validation_cases_found).toBe(true);
  expect(parsed.existing_foundation_mapping_found).toBe(true);
  expect(parsed.readiness_levels_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
});

test("verifier output blocks deploy main push runtime provider news Supabase context fixture persistence schema migration scanner ranking and confidence changes", () => {
  const parsed = JSON.parse(runVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.context_fixture_implementation_allowed).toBe(false);
  expect(parsed.context_persistence_allowed).toBe(false);
  expect(parsed.dataset_persistence_allowed).toBe(false);
  expect(parsed.schema_change_allowed).toBe(false);
  expect(parsed.migration_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.confidence_threshold_mutation_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.forbidden_runtime_artifacts_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags remain false", () => {
  const output = runVerifier();
  const parsed = JSON.parse(output);

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.provider_call_attempted).toBe(false);
  expect(parsed.no_effect_flags.news_api_call_executed).toBe(false);
  expect(parsed.no_effect_flags.news_api_call_attempted).toBe(false);
  expect(parsed.no_effect_flags.supabase_remote_read_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.context_fixture_implemented).toBe(false);
  expect(parsed.no_effect_flags.context_persisted).toBe(false);
  expect(parsed.no_effect_flags.dataset_persisted).toBe(false);
  expect(parsed.no_effect_flags.schema_changed).toBe(false);
  expect(parsed.no_effect_flags.migration_created).toBe(false);
  expect(parsed.no_effect_flags.migration_altered).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
});

test("verifier source avoids env provider Supabase runtime and nondeterminism", () => {
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

test("Action 342 adds no app api route proxy or migration", () => {
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

test("Action 309 Action 336 Action 341 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const contextSchema = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-336-intelligence-context-schema-draft-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const fixtureSpec = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-341-learning-dataset-static-fixture-spec-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const golden = JSON.parse(
    execFileSync(
      "node",
      ["scripts/replay-with-signal-package-static-preview-verify-golden.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );

  expect(guard.guard_status).toBe("passed");
  expect(contextSchema.verification_status).toBe("passed");
  expect(fixtureSpec.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
