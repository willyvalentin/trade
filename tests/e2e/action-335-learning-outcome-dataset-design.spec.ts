import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-335-learning-outcome-dataset-design.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-335-learning-outcome-dataset-design-verify.mjs",
);

const nextActions = [
  "Action 336: Intelligence Context Schema Draft",
  "Action 337: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 339: Historical Backfill Cost and Provider Capacity Plan",
  "Action 340: Snapshot Field Inventory Against Existing Schema",
  "Action 341: Learning Dataset Static Fixture Spec",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-335-learning-outcome-dataset-design-verify.mjs"],
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

test("learning outcome dataset design doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("learning_outcome_dataset_design_status: design_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("dataset design only");
  expect(doc).toContain("not runtime implementation");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("news integration");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("dataset design defines purpose and unit of analysis", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("The dataset is the bridge between recommendations and learning");
  expect(doc).toContain("Every recommendation should eventually become a learning example");
  expect(doc).toContain("pattern discovery");
  expect(doc).toContain("confidence calibration");
  expect(doc).toContain("setup performance");
  expect(doc).toContain("regime analysis");
  expect(doc).toContain("preserve existing snapshot/replay/history/statistics foundations");
  expect(doc).toContain(
    "One dataset row should represent one recommendation snapshot evaluated over a defined outcome window",
  );
  expect(doc).toContain("immutable once generated");
  expect(doc).toContain("avoid hindsight leakage");
});

test("dataset design includes snapshot-time input fields", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Snapshot-Time Input Fields");
  expect(doc).toContain("dataset_row_id");
  expect(doc).toContain("snapshot_id");
  expect(doc).toContain("recommendation_id");
  expect(doc).toContain("candidate_id");
  expect(doc).toContain("ticker");
  expect(doc).toContain("trading_day");
  expect(doc).toContain("direction");
  expect(doc).toContain("entry");
  expect(doc).toContain("stop");
  expect(doc).toContain("target");
  expect(doc).toContain("setup_family");
  expect(doc).toContain("numeric_confidence");
  expect(doc).toContain("quality_gate_summary");
  expect(doc).toContain("reason_text");
});

test("dataset design includes market sector relative strength and news catalyst context", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Market Context");
  expect(doc).toContain("SPY_context");
  expect(doc).toContain("QQQ_context");
  expect(doc).toContain("IWM_context");
  expect(doc).toContain("market_regime");
  expect(doc).toContain("Sector / Industry Context");
  expect(doc).toContain("sector_relative_strength");
  expect(doc).toContain("peer_relative_strength");
  expect(doc).toContain("Relative Strength");
  expect(doc).toContain("stock_vs_SPY");
  expect(doc).toContain("stock_vs_QQQ");
  expect(doc).toContain("stock_vs_sector");
  expect(doc).toContain("News / Catalyst Context");
  expect(doc).toContain("catalyst_detected");
  expect(doc).toContain("catalyst_freshness");
  expect(doc).toContain("headline_summary");
});

test("dataset design includes outcome fields and derived learning fields", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Outcome Fields");
  expect(doc).toContain("outcome_window");
  expect(doc).toContain("entry_touched");
  expect(doc).toContain("target_hit");
  expect(doc).toContain("stop_hit");
  expect(doc).toContain("target_or_stop_first");
  expect(doc).toContain("gross_r_multiple");
  expect(doc).toContain("max_favorable_excursion_r");
  expect(doc).toContain("max_adverse_excursion_r");
  expect(doc).toContain("outcome_quality");
  expect(doc).toContain("Derived Learning Fields");
  expect(doc).toContain("setup_success_label");
  expect(doc).toContain("confidence_calibration_error");
  expect(doc).toContain("overconfidence_flag");
  expect(doc).toContain("underconfidence_flag");
  expect(doc).toContain("regime_fit_label");
  expect(doc).toContain("recommendation_should_have_been_filtered");
  expect(doc).toContain("learning_eligibility_status");
});

test("dataset design includes anti-leakage rules and readiness levels L0 through L9", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("snapshot-time inputs must not include post-snapshot outcomes");
  expect(doc).toContain("news/catalyst context must use only information available at snapshot time");
  expect(doc).toContain("market regime labels must distinguish snapshot-time vs end-of-day labels");
  expect(doc).toContain("outcome fields must not feed back into original snapshot");
  expect(doc).toContain("calibration updates must happen only after audited dataset generation");
  expect(doc).toContain("scanner/ranking mutation remains blocked");
  expect(doc).toContain("L0: dataset undefined");
  expect(doc).toContain("L1: dataset fields defined");
  expect(doc).toContain("L2: static design exists");
  expect(doc).toContain("L3: static fixture examples exist");
  expect(doc).toContain("L4: snapshot-to-outcome mapping verified locally");
  expect(doc).toContain("L5: read-only runtime dataset generation verified");
  expect(doc).toContain("L6: persistence/readback verified");
  expect(doc).toContain("L7: historical sample validated");
  expect(doc).toContain("L8: calibration research-ready");
  expect(doc).toContain("L9: trusted intelligence dataset");
  expect(doc).toContain("Current learning outcome dataset is not yet L9");
});

test("dataset design maps existing foundations and avoids duplicate architecture", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Existing Foundation Mapping");
  expect(doc).toContain("recommendation snapshots");
  expect(doc).toContain("historical candle persistence");
  expect(doc).toContain("replay dry-run/static replay foundation");
  expect(doc).toContain("History/Statistics foundations");
  expect(doc).toContain("confidence calibration planning");
  expect(doc).toContain("quality gate planning");
  expect(doc).toContain("do not create a parallel snapshot system");
  expect(doc).toContain(
    "do not create duplicate outcome models if static replay result model can be extended/mapped",
  );
  expect(doc).toContain("do not create duplicate History/Statistics concepts");
  expect(doc).toContain("do not create a separate unlinked learning dataset");
  expect(doc).toContain("prefer mappings/adapters over parallel architecture");
});

test("dataset design blocks unsafe implementation work and lists next actions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no dataset persistence yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no runtime routes yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no replay execution yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("no confidence threshold changes yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
  for (const action of nextActions) {
    expect(doc).toContain(action);
  }
});

test("verifier script exists exits 0 and reports dataset design ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain("action-335-learning-outcome-dataset-design.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.dataset_design_found).toBe(true);
  expect(parsed.design_status_found).toBe(true);
  expect(parsed.unit_of_analysis_found).toBe(true);
  expect(parsed.snapshot_time_inputs_found).toBe(true);
  expect(parsed.outcome_fields_found).toBe(true);
  expect(parsed.outcome_fields_missing).toEqual([]);
  expect(parsed.derived_learning_fields_found).toBe(true);
  expect(parsed.derived_learning_fields_missing).toEqual([]);
  expect(parsed.anti_leakage_rules_found).toBe(true);
  expect(parsed.readiness_levels_found).toBe(true);
  expect(parsed.existing_foundation_mapping_found).toBe(true);
  expect(parsed.do_not_duplicate_rules_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
  expect(parsed.market_context_found).toBe(true);
  expect(parsed.sector_industry_context_found).toBe(true);
  expect(parsed.relative_strength_context_found).toBe(true);
  expect(parsed.news_catalyst_context_found).toBe(true);
});

test("verifier output blocks runtime provider news Supabase dataset persistence scanner ranking and confidence changes", () => {
  const parsed = JSON.parse(runVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.dataset_persistence_allowed).toBe(false);
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
  expect(parsed.no_effect_flags.supabase_read_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.dataset_persisted).toBe(false);
  expect(parsed.no_effect_flags.dataset_persistence_changed).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
  expect(parsed.no_effect_flags.confidence_thresholds_mutated).toBe(false);
  expect(parsed.no_effect_flags.visible_recommendations_changed).toBe(false);
  expect(parsed.no_effect_flags.outcome_persistence_changed).toBe(false);
  expect(parsed.no_effect_flags.learning_acceleration_changed).toBe(false);
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

test("Action 335 adds no app api or page route and does not modify proxy", () => {
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
  expect(guard.guard_status).toBe("passed");
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 Action 334 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const snapshotAudit = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-334-recommendation-snapshot-completeness-audit-verify.mjs"],
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
  expect(snapshotAudit.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
