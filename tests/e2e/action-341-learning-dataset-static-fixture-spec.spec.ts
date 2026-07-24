import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-341-learning-dataset-static-fixture-spec.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-341-learning-dataset-static-fixture-spec-verify.mjs",
);

const coreFixtureScenarios = [
  "clean_target_hit_momentum_continuation",
  "stop_hit_false_breakout",
  "no_entry_overextended_setup",
  "open_at_window_end_slow_grind",
  "catalyst_backed_target_hit",
  "catalyst_false_spike_stop_hit",
  "strong_market_weak_stock_filter_candidate",
  "weak_market_strong_stock_relative_strength",
  "missing_context_learning_limited",
  "ambiguous_intrabar_conservative_stop",
];

const requiredFieldGroups = [
  "identity",
  "trade_plan",
  "setup_and_confidence",
  "quality_gate_summary",
  "market_context",
  "sector_industry_context",
  "relative_strength_context",
  "news_catalyst_context",
  "calendar_event_context",
  "data_provenance",
  "outcome_fields",
  "derived_learning_fields",
  "anti_leakage_status",
  "learning_eligibility_status",
];

const expectedLabels = [
  "setup_success_label",
  "confidence_bucket",
  "confidence_calibration_error",
  "overconfidence_flag",
  "underconfidence_flag",
  "regime_fit_label",
  "sector_support_label",
  "catalyst_support_label",
  "relative_strength_support_label",
  "entry_quality_label",
  "stop_quality_label",
  "target_realism_label",
  "recommendation_should_have_been_filtered",
  "excluded_from_learning_reason",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-341-learning-dataset-static-fixture-spec-verify.mjs"],
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

test("learning dataset fixture spec doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("learning_dataset_static_fixture_status: fixture_spec_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("learning dataset fixture planning only");
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

test("fixture spec explains purpose and additive foundation mapping intent", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Static fixtures make the future learning dataset concrete");
  expect(doc).toContain("one recommendation snapshot evaluated over an outcome window");
  expect(doc).toContain("anti-leakage, missing context, outcome classification, confidence calibration, and pattern discovery");
  expect(doc).toContain("additive to existing snapshot/replay/static replay foundations");
  expect(doc).toContain("must not duplicate existing result or outcome concepts");
});

test("fixture spec includes design principles", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("deterministic timestamps");
  expect(doc).toContain("no Date.now");
  expect(doc).toContain("no random IDs");
  expect(doc).toContain("no provider calls");
  expect(doc).toContain("no Supabase reads/writes");
  expect(doc).toContain("no news API calls");
  expect(doc).toContain("snapshot-time inputs separated from outcomes");
  expect(doc).toContain("context available_at_snapshot_time must be explicit");
  expect(doc).toContain("missing context must be explicit");
  expect(doc).toContain("each fixture has expected learning labels");
  expect(doc).toContain("no scanner/ranking mutation");
  expect(doc).toContain("no confidence threshold mutation");
});

test("fixture spec lists all ten core scenarios", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const scenario of coreFixtureScenarios) {
    expect(doc).toContain(scenario);
  }
  expect(doc).toContain("target hit");
  expect(doc).toContain("stop hit");
  expect(doc).toContain("no_entry_triggered");
  expect(doc).toContain("open_at_window_end");
  expect(doc).toContain("conservative stop outcome");
});

test("fixture spec includes required fixture field groups", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const group of requiredFieldGroups) {
    expect(doc).toContain(group);
  }
});

test("fixture spec includes expected labels", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const label of expectedLabels) {
    expect(doc).toContain(label);
  }
});

test("fixture spec includes anti-leakage validation cases", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("news after snapshot time must not be used as snapshot-time catalyst");
  expect(doc).toContain("end-of-day regime must not be used as entry-time regime unless marked post_outcome");
  expect(doc).toContain("outcome fields must not appear in snapshot-time fields");
  expect(doc).toContain("future relative strength must not appear in snapshot-time context");
  expect(doc).toContain("enrichment_version must be auditable");
});

test("fixture spec maps to existing foundations and readiness levels", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("existing recommendation snapshots");
  expect(doc).toContain("static replay result model");
  expect(doc).toContain("static replay simulation engine");
  expect(doc).toContain("static summary/report/golden snapshots");
  expect(doc).toContain("History/Statistics foundations");
  expect(doc).toContain("future learning outcome dataset");
  expect(doc).toContain("Prefer adapters/mappers over parallel architecture");
  expect(doc).toContain("Do not duplicate existing result/outcome concepts");
  expect(doc).toContain("LF0: fixture scenarios undefined");
  expect(doc).toContain("LF1: fixture scenario list defined");
  expect(doc).toContain("LF2: fixture field groups defined");
  expect(doc).toContain("LF3: expected labels defined");
  expect(doc).toContain("LF4: static fixture implementation ready");
  expect(doc).toContain("LF5: fixture tests pass locally");
  expect(doc).toContain("LF6: mapped to existing snapshot/replay objects");
  expect(doc).toContain("LF7: ready for local mapper implementation");
  expect(doc).toContain("LF8: ready for read-only runtime dataset generation later");
  expect(doc).toContain("Current learning dataset fixtures are not yet LF8");
});

test("fixture spec blocks unsafe implementation work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no fixture implementation yet");
  expect(doc).toContain("no dataset persistence yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no runtime routes yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no schema changes");
  expect(doc).toContain("no migrations yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
  expect(doc).toContain("does not authorize fixture implementation");
});

test("fixture spec lists next actions 342 through 347", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 342: Intelligence Context Static Fixture Spec");
  expect(doc).toContain("Action 343: Pattern Insight Static Type Spec");
  expect(doc).toContain("Action 344: Runtime Ping-Only Route Implementation Plan");
  expect(doc).toContain("Action 345: First Tiny Provider Capacity Experiment Plan");
  expect(doc).toContain("Action 346: Existing Schema Compatibility Matrix");
  expect(doc).toContain("Action 347: Learning Dataset Static Fixture Implementation Plan");
});

test("verifier script exists exits 0 and reports fixture spec ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain("action-341-learning-dataset-static-fixture-spec.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.fixture_spec_found).toBe(true);
  expect(parsed.fixture_status_found).toBe(true);
  expect(parsed.fixture_design_principles_found).toBe(true);
  expect(parsed.core_fixture_scenarios_found).toBe(true);
  expect(parsed.fixture_fields_required_found).toBe(true);
  expect(parsed.expected_labels_found).toBe(true);
  expect(parsed.anti_leakage_validation_cases_found).toBe(true);
  expect(parsed.existing_foundation_mapping_found).toBe(true);
  expect(parsed.readiness_levels_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
});

test("verifier output blocks deploy main push runtime provider news Supabase dataset fixture schema migration scanner ranking and confidence changes", () => {
  const parsed = JSON.parse(runVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.dataset_persistence_allowed).toBe(false);
  expect(parsed.fixture_implementation_allowed).toBe(false);
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
  expect(parsed.no_effect_flags.dataset_persisted).toBe(false);
  expect(parsed.no_effect_flags.fixture_implemented).toBe(false);
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

test("Action 341 adds no app api route proxy or migration", () => {
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

test("Action 309 Action 335 Action 340 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const datasetDesign = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-335-learning-outcome-dataset-design-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const snapshotInventory = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-340-snapshot-field-inventory-against-existing-schema-verify.mjs"],
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
  expect(datasetDesign.verification_status).toBe("passed");
  expect(snapshotInventory.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
