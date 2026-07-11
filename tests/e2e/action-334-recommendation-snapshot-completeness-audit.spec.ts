import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-334-recommendation-snapshot-completeness-audit.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-334-recommendation-snapshot-completeness-audit-verify.mjs",
);

const snapshotDimensions = [
  "Identity",
  "Trade Plan",
  "Setup Classification",
  "Confidence",
  "Quality Gates",
  "Market Context",
  "Sector / Industry Context",
  "Relative Strength",
  "News / Catalyst Context",
  "Scan Context",
  "Data Provenance",
  "Learning Linkage",
];

const nextActions = [
  "Action 335: Learning Outcome Dataset Design",
  "Action 336: Intelligence Context Schema Draft",
  "Action 337: Pattern Discovery and Confidence Calibration Roadmap",
  "Action 338: Runtime Ping-Only Rollout Checklist",
  "Action 339: Historical Backfill Cost and Provider Capacity Plan",
  "Action 340: Snapshot Field Inventory Against Existing Schema",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-334-recommendation-snapshot-completeness-audit-verify.mjs"],
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

test("snapshot completeness audit doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("recommendation_snapshot_completeness_status: audit_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("snapshot completeness audit only");
  expect(doc).toContain("not a new snapshot implementation");
  expect(doc).toContain("not runtime implementation");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("news integration");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("scanner mutation");
  expect(doc).toContain("ranking mutation");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("snapshot completeness audit explains purpose and preserves existing architecture", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain(
    "A recommendation snapshot is the evidence record of what Ture believed at the time",
  );
  expect(doc).toContain("without hindsight bias");
  expect(doc).toContain("confidence calibration");
  expect(doc).toContain("setup performance");
  expect(doc).toContain("market regime analysis");
  expect(doc).toContain("sector context");
  expect(doc).toContain("relative strength context");
  expect(doc).toContain("pattern discovery");
  expect(doc).toContain("taken and not-taken recommendations");
  expect(doc).toContain("preserve existing snapshot architecture");
  expect(doc).toContain("identify additive gaps only");
});

test("snapshot completeness audit lists all twelve dimensions", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const dimension of snapshotDimensions) {
    expect(doc).toContain(dimension);
  }
});

test("snapshot completeness audit includes market sector relative strength and news catalyst context", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Market Context");
  expect(doc).toContain("market_session_state");
  expect(doc).toContain("SPY_context");
  expect(doc).toContain("QQQ_context");
  expect(doc).toContain("IWM_context");
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

test("snapshot completeness audit includes existing vs missing coverage matrix", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Existing vs Missing Coverage Matrix");
  expect(doc).toContain("Expected fields");
  expect(doc).toContain("Existing coverage");
  expect(doc).toContain("Risk if missing");
  expect(doc).toContain("Additive next step");
  expect(doc).toContain("needs audit");
  expect(doc).toContain("partial");
  expect(doc).toContain("missing");
});

test("snapshot completeness audit includes completeness levels S0 through S8", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("S0: snapshot concept absent");
  expect(doc).toContain("S1: basic recommendation fields captured");
  expect(doc).toContain("S2: trade plan captured");
  expect(doc).toContain("S3: setup/confidence/gates captured");
  expect(doc).toContain("S4: market/sector/relative-strength context captured");
  expect(doc).toContain("S5: news/catalyst/context captured");
  expect(doc).toContain("S6: provenance and learning linkage captured");
  expect(doc).toContain("S7: complete enough for reliable replay/calibration");
  expect(doc).toContain("S8: production-grade intelligence snapshot");
  expect(doc).toContain("Current snapshot completeness is not yet confidently S8");
});

test("snapshot completeness audit includes do-not-duplicate rules and gap-driven candidates", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("do not create a parallel snapshot model without auditing existing one");
  expect(doc).toContain(
    "do not duplicate recommendation rows as a separate unlinked snapshot system",
  );
  expect(doc).toContain("do not create duplicate outcome keys");
  expect(doc).toContain("do not create duplicate confidence fields");
  expect(doc).toContain("do not create duplicate setup taxonomy fields");
  expect(doc).toContain("prefer additive fields/mappings/migrations only after audit");
  expect(doc).toContain("keep backward compatibility with existing History/Statistics where possible");
  expect(doc).toContain("snapshot field inventory against actual schema/types");
  expect(doc).toContain("snapshot completeness checker static helper");
  expect(doc).toContain("snapshot-to-outcome dataset mapping");
  expect(doc).toContain("context enrichment schema draft");
  expect(doc).toContain("learning eligibility rules");
});

test("snapshot completeness audit includes runtime blocking status and blocks unsafe actions", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no snapshot persistence changes yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no runtime routes yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("no confidence threshold changes yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
  expect(doc).toContain("does not authorize deploys");
  expect(doc).toContain("main pushes");
  expect(doc).toContain("snapshot persistence changes");
});

test("snapshot completeness audit lists next actions 335 through 340", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const action of nextActions) {
    expect(doc).toContain(action);
  }
});

test("verifier script exists exits 0 and reports snapshot audit ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain("action-334-recommendation-snapshot-completeness-audit.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.snapshot_audit_found).toBe(true);
  expect(parsed.audit_status_found).toBe(true);
  expect(parsed.purpose_found).toBe(true);
  expect(parsed.snapshot_dimensions_found).toBe(true);
  expect(parsed.snapshot_dimensions_missing).toEqual([]);
  expect(parsed.existing_missing_matrix_found).toBe(true);
  expect(parsed.snapshot_completeness_levels_found).toBe(true);
  expect(parsed.do_not_duplicate_rules_found).toBe(true);
  expect(parsed.gap_driven_next_build_candidates_found).toBe(true);
  expect(parsed.runtime_blocking_status_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
  expect(parsed.market_context_found).toBe(true);
  expect(parsed.sector_industry_context_found).toBe(true);
  expect(parsed.relative_strength_context_found).toBe(true);
  expect(parsed.news_catalyst_context_found).toBe(true);
});

test("verifier output blocks runtime provider news Supabase snapshot persistence scanner ranking and confidence changes", () => {
  const parsed = JSON.parse(runVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.snapshot_persistence_change_allowed).toBe(false);
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
  expect(parsed.no_effect_flags.snapshots_persisted).toBe(false);
  expect(parsed.no_effect_flags.snapshot_persistence_changed).toBe(false);
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

test("Action 334 adds no app api or page route and does not modify proxy", () => {
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

test("Action 309 Action 333 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const coverageAudit = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-333-historical-data-backfill-existing-coverage-audit-verify.mjs"],
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
  expect(coverageAudit.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
