import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-340-snapshot-field-inventory-against-existing-schema.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-340-snapshot-field-inventory-against-existing-schema-verify.mjs",
);

const fieldGroups = [
  "identity",
  "trade_plan",
  "setup_classification",
  "confidence",
  "quality_gates",
  "market_context",
  "sector_industry_context",
  "relative_strength_context",
  "news_catalyst_context",
  "scan_context",
  "data_provenance",
  "learning_linkage",
  "outcome_fields",
  "derived_learning_fields",
];

const nextActions = [
  "Action 341: Learning Dataset Static Fixture Spec",
  "Action 342: Intelligence Context Static Fixture Spec",
  "Action 343: Pattern Insight Static Type Spec",
  "Action 344: Runtime Ping-Only Route Implementation Plan",
  "Action 345: First Tiny Provider Capacity Experiment Plan",
  "Action 346: Existing Schema Compatibility Matrix",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-340-snapshot-field-inventory-against-existing-schema-verify.mjs"],
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

test("snapshot field inventory doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("snapshot_field_inventory_status: inventory_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("field inventory only");
  expect(doc).toContain("not schema implementation");
  expect(doc).toContain("migration");
  expect(doc).toContain("runtime implementation");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("news integration");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("inventory explains purpose and duplicate avoidance", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("must not duplicate existing snapshot/recommendation/outcome systems");
  expect(doc).toContain("Existing schema/types/docs must be inventoried before adding fields");
  expect(doc).toContain("what is already captured, what is partial, and what is missing");
  expect(doc).toContain("Action 334 snapshot completeness");
  expect(doc).toContain("Action 335 learning outcome dataset design");
});

test("inventory lists source surfaces and method", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Supabase migrations and schema docs");
  expect(doc).toContain("recommendation-related TypeScript types");
  expect(doc).toContain("recommendation generation helpers");
  expect(doc).toContain("snapshot helpers");
  expect(doc).toContain("history/statistics helpers");
  expect(doc).toContain("outcome/replay helpers");
  expect(doc).toContain("static replay model files");
  expect(doc).toContain("scan run / provider audit files");
  expect(doc).toContain("tests referencing recommendation/snapshot/outcome fields");
  expect(doc).toContain("local source inspection only");
  expect(doc).toContain("no Supabase remote reads");
  expect(doc).toContain("no migrations");
  expect(doc).toContain("unknown fields must be marked needs_audit rather than guessed");
});

test("inventory includes existing field inventory table and all field groups", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("| field group | ideal field from Action 334/335 | likely existing field/source | likely file/module | coverage | confidence | notes | additive next step |");
  expect(doc).toContain("| existing |");
  expect(doc).toContain("| partial |");
  expect(doc).toContain("| missing |");
  expect(doc).toContain("| needs_audit |");
  for (const fieldGroup of fieldGroups) {
    expect(doc).toContain(fieldGroup);
  }
});

test("inventory includes existing source file candidates", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Schema/Migrations");
  expect(doc).toContain("supabase/migrations/20260528000000_create_recommendation_snapshots.sql");
  expect(doc).toContain("supabase/migrations/20260528001000_create_recommendation_outcomes.sql");
  expect(doc).toContain("Lib Helpers");
  expect(doc).toContain("lib/recommendation-snapshot.ts");
  expect(doc).toContain("lib/recommendation-outcome-tracker.ts");
  expect(doc).toContain("App Surfaces");
  expect(doc).toContain("app/api/recommendations/evaluate-outcomes/route.ts");
  expect(doc).toContain("Tests");
  expect(doc).toContain("tests/e2e/recommendation-build-diagnostics.spec.ts");
  expect(doc).toContain("Docs");
  expect(doc).toContain("docs/action-334-recommendation-snapshot-completeness-audit.md");
});

test("inventory includes gap summary and do-not-duplicate rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Fields Likely Already Covered");
  expect(doc).toContain("Fields Likely Partial");
  expect(doc).toContain("Fields Likely Missing");
  expect(doc).toContain("Fields Requiring Schema Audit");
  expect(doc).toContain("Fields Requiring Type Audit");
  expect(doc).toContain("Fields Requiring History/Statistics Compatibility Audit");
  expect(doc).toContain("do not create duplicate snapshot IDs");
  expect(doc).toContain("do not create parallel recommendation records");
  expect(doc).toContain("do not create unlinked learning dataset rows");
  expect(doc).toContain("do not create duplicate outcome fields if existing result/outcome model can be mapped");
  expect(doc).toContain("do not create duplicate confidence fields");
  expect(doc).toContain("do not create duplicate provider audit fields");
  expect(doc).toContain("prefer adapters/mappers over parallel architecture");
  expect(doc).toContain("preserve existing History/Statistics compatibility");
});

test("inventory includes additive candidates and runtime blocking status", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("snapshot field inventory script against concrete files");
  expect(doc).toContain("snapshot completeness static checker");
  expect(doc).toContain("snapshot-to-learning-row mapper design");
  expect(doc).toContain("existing schema compatibility matrix");
  expect(doc).toContain("migration proposal only after concrete gap proof");
  expect(doc).toContain("context field adapter design");
  expect(doc).toContain("outcome field adapter design");
  expect(doc).toContain("no schema changes yet");
  expect(doc).toContain("no migrations yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
});

test("inventory lists next actions 341 through 346", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const action of nextActions) {
    expect(doc).toContain(action);
  }
});

test("verifier script exists exits 0 and reports inventory ready", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runVerifier());

  expect(source).toContain("action-340-snapshot-field-inventory-against-existing-schema.md");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.inventory_doc_found).toBe(true);
  expect(parsed.inventory_status_found).toBe(true);
  expect(parsed.source_surfaces_found).toBe(true);
  expect(parsed.inventory_method_found).toBe(true);
  expect(parsed.field_inventory_table_found).toBe(true);
  expect(parsed.field_groups_found).toBe(true);
  expect(parsed.existing_source_file_candidates_found).toBe(true);
  expect(parsed.gap_summary_found).toBe(true);
  expect(parsed.do_not_duplicate_rules_found).toBe(true);
  expect(parsed.additive_next_build_candidates_found).toBe(true);
  expect(parsed.runtime_blocking_status_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
  expect(parsed.candidate_files_checked).toBeGreaterThan(0);
  expect(parsed.recommendation_related_files_found.length).toBeGreaterThan(0);
  expect(parsed.snapshot_related_files_found.length).toBeGreaterThan(0);
  expect(parsed.outcome_related_files_found.length).toBeGreaterThan(0);
  expect(parsed.migration_related_files_found.length).toBeGreaterThan(0);
});

test("verifier output blocks deploy main push runtime provider news Supabase schema migration scanner ranking and confidence changes", () => {
  const parsed = JSON.parse(runVerifier());

  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
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

test("Action 340 adds no app api route proxy or migration", () => {
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

test("Action 309 Action 334 Action 335 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const snapshotCompleteness = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-334-recommendation-snapshot-completeness-audit-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
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
  expect(snapshotCompleteness.verification_status).toBe("passed");
  expect(datasetDesign.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
