import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-333-historical-data-backfill-existing-coverage-audit.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-333-historical-data-backfill-existing-coverage-audit-verify.mjs",
);

const intelligenceDomains = [
  "Intraday price/volume data",
  "Recommendation snapshot data",
  "Outcome data",
  "Sector / industry context",
  "Market regime context",
  "Relative strength context",
  "Company news / catalyst context",
  "Calendar / event context",
  "Historical setup behavior",
  "Data quality / provenance",
];

const nextActions = [
  "Action 334: Recommendation Snapshot Completeness Audit",
  "Action 335: Learning Outcome Dataset Design",
  "Action 336: Intelligence Context Schema Draft",
  "Action 337: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 339: Historical Backfill Cost and Provider Capacity Plan",
];

function runVerifier() {
  return execFileSync(
    "node",
    [
      "scripts/action-333-historical-data-backfill-existing-coverage-audit-verify.mjs",
    ],
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

test("historical backfill coverage audit doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain(
    "historical_backfill_existing_coverage_status: coverage_audit_ready",
  );
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("existing coverage audit only");
  expect(doc).toContain("not a new backfill implementation");
  expect(doc).toContain("not runtime implementation");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("news integration");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("coverage audit preserves prior work and requires additive gap-driven work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Historical/backfill/replay work is not starting from zero");
  expect(doc).toContain("Prior work must be preserved");
  expect(doc).toContain("New work must be additive and gap-driven");
  expect(doc).toContain(
    "Do not rebuild existing snapshot, candle persistence, replay, history, or statistics foundations unless an audit proves a concrete gap",
  );
  expect(doc).toContain("protect earlier work");
  expect(doc).toContain("instead of creating parallel systems");
});

test("coverage audit lists existing known coverage from historical and replay work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("scan/window/tier recommendation generation");
  expect(doc).toContain("recommendation snapshots");
  expect(doc).toContain("historical candle storage");
  expect(doc).toContain("fetch-run audit/readback flow");
  expect(doc).toContain("first tiny candle persistence verification");
  expect(doc).toContain("first tiny replay dry-run");
  expect(doc).toContain("signal package discovery");
  expect(doc).toContain("static replay result model");
  expect(doc).toContain("static replay simulation engine");
  expect(doc).toContain("static fixtures");
  expect(doc).toContain("static summary evaluator");
  expect(doc).toContain("static inspection report");
  expect(doc).toContain("local static preview");
  expect(doc).toContain("golden snapshots");
  expect(doc).toContain("History/Statistics foundations");
  expect(doc).toContain("confidence calibration planning");
  expect(doc).toContain("quality gate planning");
});

test("coverage audit maps all ten intelligence domains against existing partial and missing coverage", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Intelligence Data Domains Coverage Matrix");
  expect(doc).toContain("Existing coverage");
  expect(doc).toContain("Partial coverage");
  expect(doc).toContain("Missing coverage");
  expect(doc).toContain("Risk if missing");
  expect(doc).toContain("Next additive step");
  for (const domain of intelligenceDomains) {
    expect(doc).toContain(domain);
  }
});

test("coverage audit defines historical backfill windows", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("last 5 trading days");
  expect(doc).toContain("last 20 trading days");
  expect(doc).toContain("last 60 trading days");
  expect(doc).toContain("last 120 trading days");
  expect(doc).toContain("last 252 trading days");
  expect(doc).toContain("multi-year later");
  expect(doc).toContain("Currently supported");
  expect(doc).toContain("Data source exists");
  expect(doc).toContain("Persistence exists");
  expect(doc).toContain("Replay/outcome reconstruction exists");
});

test("coverage audit includes do-not-duplicate rules and gap-driven candidates", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("do not recreate historical candle tables if existing table is valid");
  expect(doc).toContain(
    "do not recreate recommendation snapshot models if existing snapshot flow is valid",
  );
  expect(doc).toContain("do not create duplicate replay result models");
  expect(doc).toContain("do not create duplicate outcome concepts");
  expect(doc).toContain("do not create duplicate History/Statistics concepts");
  expect(doc).toContain("do not create parallel scanner/ranking paths");
  expect(doc).toContain("prefer extending existing helpers/docs over new parallel architecture");
  expect(doc).toContain("historical coverage readback audit");
  expect(doc).toContain("recommendation snapshot completeness audit");
  expect(doc).toContain("outcome dataset schema alignment");
  expect(doc).toContain("sector/industry context schema draft");
  expect(doc).toContain("news/catalyst context schema draft");
  expect(doc).toContain("safe runtime ping-only rollout checklist");
});

test("coverage audit includes runtime blocking status and blocks unsafe actions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("runtime route work remains blocked");
  expect(doc).toContain("provider calls remain blocked");
  expect(doc).toContain("news API calls remain blocked");
  expect(doc).toContain("Supabase writes remain blocked");
  expect(doc).toContain("scanner/ranking mutation remains blocked");
  expect(doc).toContain("confidence threshold mutation remains blocked");
  expect(doc).toContain("deploy remains blocked");
  expect(doc).toContain("main push remains blocked");
  expect(doc).toContain("does not authorize deploys");
  expect(doc).toContain("main pushes");
  expect(doc).toContain("runtime route changes");
  expect(doc).toContain("provider calls");
  expect(doc).toContain("news API calls");
  expect(doc).toContain("Supabase reads");
  expect(doc).toContain("Supabase writes");
});

test("coverage audit lists next actions 334 through 339", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const action of nextActions) {
    expect(doc).toContain(action);
  }
});

test("verifier script exists exits 0 and reports coverage audit ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain(
    "action-333-historical-data-backfill-existing-coverage-audit.md",
  );
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.coverage_audit_found).toBe(true);
  expect(parsed.audit_status_found).toBe(true);
  expect(parsed.important_correction_found).toBe(true);
  expect(parsed.existing_known_coverage_found).toBe(true);
  expect(parsed.existing_known_coverage_missing).toEqual([]);
  expect(parsed.intelligence_domain_matrix_found).toBe(true);
  expect(parsed.intelligence_domains_missing).toEqual([]);
  expect(parsed.coverage_windows_found).toBe(true);
  expect(parsed.do_not_duplicate_rules_found).toBe(true);
  expect(parsed.gap_driven_next_build_candidates_found).toBe(true);
  expect(parsed.runtime_blocking_status_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
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

test("Action 333 adds no app api or page route and does not modify proxy", () => {
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

test("Action 309 Action 332 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const readinessMap = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-332-intelligence-data-collection-readiness-map-verify.mjs"],
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
  expect(readinessMap.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
