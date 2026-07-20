import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-332-intelligence-data-collection-readiness-map.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-332-intelligence-data-collection-readiness-map-verify.mjs",
);

const coreDataDomains = [
  "Intraday Price/Volume Data",
  "Recommendation Snapshot Data",
  "Outcome Data",
  "Sector / Industry Context",
  "Market Regime Context",
  "Relative Strength Context",
  "Company News / Catalyst Context",
  "Calendar / Event Context",
  "Historical Setup Behavior",
  "Data Quality / Provenance",
];

const nextActions = [
  "Action 333: Historical Data Backfill Coverage Plan",
  "Action 334: Recommendation Snapshot Completeness Audit",
  "Action 335: Learning Outcome Dataset Design",
  "Action 336: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 337: Intelligence Data Schema Draft",
  "Action 338: Runtime Ping-Only Rollout Checklist",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-332-intelligence-data-collection-readiness-map-verify.mjs"],
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

test("intelligence data collection readiness map doc exists and is planning only", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("intelligence_data_collection_readiness_status: map_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("intelligence data collection planning only");
  expect(doc).toContain("not runtime implementation");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("news integration");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("readiness map explains the broader intelligence purpose", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Ture needs broad intelligence data");
  expect(doc).toContain("Candles and indicators are necessary but not sufficient");
  expect(doc).toContain("learn why a stock moved");
  expect(doc).toContain("supported by broader context");
  expect(doc).toContain("similar setups worked historically");
  expect(doc).toContain("pattern recognition");
  expect(doc).toContain("confidence calibration");
  expect(doc).toContain("recommendation quality");
});

test("readiness map lists all ten core data domains", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const domain of coreDataDomains) {
    expect(doc).toContain(domain);
  }
});

test("readiness map includes sector industry market regime news catalyst and relative strength context", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Sector / Industry Context");
  expect(doc).toContain("sector");
  expect(doc).toContain("industry");
  expect(doc).toContain("peer group");
  expect(doc).toContain("Market Regime Context");
  expect(doc).toContain("SPY/QQQ/IWM direction");
  expect(doc).toContain("market breadth");
  expect(doc).toContain("Company News / Catalyst Context");
  expect(doc).toContain("earnings");
  expect(doc).toContain("analyst upgrades/downgrades");
  expect(doc).toContain("catalyst freshness");
  expect(doc).toContain("Relative Strength Context");
  expect(doc).toContain("stock vs SPY");
  expect(doc).toContain("stock vs QQQ");
  expect(doc).toContain("stock vs sector ETF");
});

test("readiness map includes daily collection and historical backfill goals", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("intraday candles for candidate universe");
  expect(doc).toContain("scan run metadata");
  expect(doc).toContain("recommendations and rejected candidates");
  expect(doc).toContain("market regime snapshot");
  expect(doc).toContain("sector/industry context snapshot");
  expect(doc).toContain("relative strength snapshot");
  expect(doc).toContain("news/catalyst snapshot");
  expect(doc).toContain("shadow outcomes for all recommendations");
  expect(doc).toContain("historical candles");
  expect(doc).toContain("historical market regime context");
  expect(doc).toContain("historical sector/industry movement");
  expect(doc).toContain("historical relative strength");
  expect(doc).toContain("historical news/catalysts where available");
  expect(doc).toContain("historical recommendation replay outcomes");
  expect(doc).toContain("historical setup/calibration datasets");
});

test("readiness map includes intelligence features and D0-D7 readiness levels", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("better setup filtering");
  expect(doc).toContain("avoiding weak setups in bad regimes");
  expect(doc).toContain("identifying sector-supported movers");
  expect(doc).toContain("identifying news-backed vs purely technical moves");
  expect(doc).toContain("separating real momentum from noisy spikes");
  expect(doc).toContain("confidence calibration by setup/sector/regime/window");
  expect(doc).toContain("better pattern discovery");
  expect(doc).toContain("better recommendation ranking later");
  expect(doc).toContain("fewer but better recommendations");
  expect(doc).toContain("D0: not defined");
  expect(doc).toContain("D1: data domain defined");
  expect(doc).toContain("D2: static schema/plan exists");
  expect(doc).toContain("D3: local/offline fixture coverage exists");
  expect(doc).toContain("D4: read-only runtime collection tested");
  expect(doc).toContain("D5: production collection with audit/readback");
  expect(doc).toContain("D6: learning integration validated");
  expect(doc).toContain("D7: trusted intelligence signal in recommendation engine");
  expect(doc).toContain("Current intelligence collection is not yet D7");
});

test("readiness map blocks provider news Supabase deploy main scanner ranking and confidence threshold changes", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("no confidence threshold changes yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
  expect(doc).toContain("does not authorize deploys");
  expect(doc).toContain("main pushes");
  expect(doc).toContain("runtime route changes");
});

test("readiness map lists next actions 333 through 338", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const action of nextActions) {
    expect(doc).toContain(action);
  }
});

test("verifier script exists exits 0 and reports map ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain("action-332-intelligence-data-collection-readiness-map.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.intelligence_data_collection_map_found).toBe(true);
  expect(parsed.map_status_found).toBe(true);
  expect(parsed.core_data_domains_found).toBe(true);
  expect(parsed.core_data_domains_missing).toEqual([]);
  expect(parsed.daily_collection_goals_found).toBe(true);
  expect(parsed.historical_backfill_goals_found).toBe(true);
  expect(parsed.intelligence_features_found).toBe(true);
  expect(parsed.readiness_levels_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
  expect(parsed.industry_context_found).toBe(true);
  expect(parsed.market_regime_context_found).toBe(true);
  expect(parsed.company_news_context_found).toBe(true);
  expect(parsed.relative_strength_context_found).toBe(true);
  expect(parsed.current_collection_not_d7_found).toBe(true);
});

test("verifier output blocks runtime provider news Supabase scanner ranking and confidence threshold changes", () => {
  const parsed = JSON.parse(runVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
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
  expect(parsed.no_effect_flags.candles_persisted).toBe(false);
  expect(parsed.no_effect_flags.news_persisted).toBe(false);
  expect(parsed.no_effect_flags.raw_response_persisted).toBe(false);
  expect(parsed.no_effect_flags.fetch_run_persisted).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
  expect(parsed.no_effect_flags.confidence_thresholds_mutated).toBe(false);
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

test("Action 332 adds no app api or page route and does not modify proxy", () => {
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

test("Action 309 Action 331 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const roadmap = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-331-intelligence-first-roadmap-reprioritization-verify.mjs"],
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
  expect(roadmap.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
