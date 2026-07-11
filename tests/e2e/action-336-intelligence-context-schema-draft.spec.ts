import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-336-intelligence-context-schema-draft.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-336-intelligence-context-schema-draft-verify.mjs",
);

const contextObjects = [
  "MarketRegimeContext",
  "SectorIndustryContext",
  "RelativeStrengthContext",
  "CompanyNewsCatalystContext",
  "CalendarEventContext",
  "DataProvenanceContext",
  "ContextSnapshotEnvelope",
];

const nextActions = [
  "Action 337: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 339: Historical Backfill Cost and Provider Capacity Plan",
  "Action 340: Snapshot Field Inventory Against Existing Schema",
  "Action 341: Learning Dataset Static Fixture Spec",
  "Action 342: Intelligence Context Static Fixture Spec",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-336-intelligence-context-schema-draft-verify.mjs"],
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

test("intelligence context schema draft doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("intelligence_context_schema_status: schema_draft_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("context schema planning only");
  expect(doc).toContain("not runtime implementation");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("news integration");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("context schema draft explains purpose and principles", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("distinguish real opportunity from isolated price noise");
  expect(doc).toContain("attach to recommendation snapshots and learning outcome dataset rows");
  expect(doc).toContain("timestamped and anti-leakage safe");
  expect(doc).toContain("Existing snapshot/replay/history/statistics foundations must be preserved");
  expect(doc).toContain("snapshot-time context must only include data known at or before recommendation time");
  expect(doc).toContain("outcome/eod context must be separate from snapshot-time context");
  expect(doc).toContain("missing context must be explicit, not silently ignored");
});

test("context schema draft lists all future context objects", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const objectName of contextObjects) {
    expect(doc).toContain(objectName);
  }
});

test("context schema draft includes all major context field groups", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("SPY_direction");
  expect(doc).toContain("QQQ_direction");
  expect(doc).toContain("IWM_direction");
  expect(doc).toContain("index_alignment");
  expect(doc).toContain("sector_relative_strength");
  expect(doc).toContain("peer_relative_strength");
  expect(doc).toContain("stock_vs_sector_etf");
  expect(doc).toContain("relative_strength_label");
  expect(doc).toContain("catalyst_detected");
  expect(doc).toContain("available_at_snapshot_time");
  expect(doc).toContain("macro_event_type");
  expect(doc).toContain("fomc_cpi_jobs_context");
  expect(doc).toContain("provider_request_id");
  expect(doc).toContain("raw_response_reference");
});

test("context schema draft includes context envelope and anti-leakage rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("context_snapshot_id");
  expect(doc).toContain("market_regime_context");
  expect(doc).toContain("sector_industry_context");
  expect(doc).toContain("relative_strength_context");
  expect(doc).toContain("company_news_catalyst_context");
  expect(doc).toContain("calendar_event_context");
  expect(doc).toContain("data_provenance_context");
  expect(doc).toContain("anti_leakage_status");
  expect(doc).toContain("context_completeness_score");
  expect(doc).toContain("do not use news published after snapshot time as snapshot-time context");
  expect(doc).toContain("do not use outcome movement to label pre-trade context");
  expect(doc).toContain("scanner/ranking mutation remains blocked");
});

test("context schema draft includes readiness levels CXT0 through CXT9", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("CXT0: context undefined");
  expect(doc).toContain("CXT1: context domains defined");
  expect(doc).toContain("CXT2: schema draft exists");
  expect(doc).toContain("CXT3: static fixtures exist");
  expect(doc).toContain("CXT4: mapping to snapshots designed");
  expect(doc).toContain("CXT5: read-only runtime enrichment verified");
  expect(doc).toContain("CXT6: persistence/readback verified");
  expect(doc).toContain("CXT7: learning dataset integration verified");
  expect(doc).toContain("CXT8: confidence calibration research-ready");
  expect(doc).toContain("CXT9: trusted intelligence context signal");
  expect(doc).toContain("Current context schema is not yet CXT9");
});

test("context schema draft blocks duplicate architecture and unsafe implementation work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("do not create parallel recommendation records");
  expect(doc).toContain("do not create unlinked context tables before mapping existing snapshots");
  expect(doc).toContain("do not duplicate provider audit concepts");
  expect(doc).toContain("do not duplicate outcome/replay records");
  expect(doc).toContain("prefer envelope/mapping/adapters over parallel architecture");
  expect(doc).toContain("no context persistence yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no runtime routes yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
});

test("context schema draft lists next actions 337 through 342", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const action of nextActions) {
    expect(doc).toContain(action);
  }
});

test("verifier script exists exits 0 and reports context schema ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain("action-336-intelligence-context-schema-draft.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.context_schema_doc_found).toBe(true);
  expect(parsed.schema_status_found).toBe(true);
  expect(parsed.schema_principles_found).toBe(true);
  expect(parsed.context_objects_found).toBe(true);
  expect(parsed.market_regime_context_found).toBe(true);
  expect(parsed.sector_industry_context_found).toBe(true);
  expect(parsed.relative_strength_context_found).toBe(true);
  expect(parsed.company_news_catalyst_context_found).toBe(true);
  expect(parsed.calendar_event_context_found).toBe(true);
  expect(parsed.data_provenance_context_found).toBe(true);
  expect(parsed.context_snapshot_envelope_found).toBe(true);
  expect(parsed.anti_leakage_rules_found).toBe(true);
  expect(parsed.readiness_levels_found).toBe(true);
  expect(parsed.do_not_duplicate_rules_found).toBe(true);
});

test("verifier output blocks runtime provider news Supabase context persistence scanner ranking and confidence changes", () => {
  const parsed = JSON.parse(runVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.context_persistence_allowed).toBe(false);
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
  expect(parsed.no_effect_flags.context_persisted).toBe(false);
  expect(parsed.no_effect_flags.context_persistence_changed).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
  expect(parsed.no_effect_flags.confidence_thresholds_mutated).toBe(false);
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

test("Action 336 adds no app api or page route and does not modify proxy", () => {
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

test("Action 309 Action 335 and golden verifiers still pass", () => {
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
  const golden = JSON.parse(
    execFileSync(
      "node",
      ["scripts/replay-with-signal-package-static-preview-verify-golden.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );

  expect(guard.guard_status).toBe("passed");
  expect(datasetDesign.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
