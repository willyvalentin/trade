import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(process.cwd(), "docs/action-346-existing-schema-compatibility-matrix.md");
const verifierPath = join(
  process.cwd(),
  "scripts/action-346-existing-schema-compatibility-matrix-verify.mjs",
);

const classifications = [
  "existing_compatible",
  "adapter_needed",
  "extension_candidate",
  "migration_candidate",
  "duplicate_risk",
  "needs_audit",
  "blocked",
];

const domains = [
  "recommendation identity",
  "trade plan",
  "setup taxonomy",
  "confidence",
  "quality gates",
  "market regime context",
  "sector/industry context",
  "relative strength context",
  "news/catalyst context",
  "calendar/event context",
  "data provenance",
  "historical candles",
  "fetch-run audit",
  "replay/outcome result",
  "learning outcome dataset",
  "pattern insight",
  "History/Statistics reporting",
  "provider capacity experiment",
];

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-346-existing-schema-compatibility-matrix-verify.mjs"],
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

test("schema compatibility matrix doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("existing_schema_compatibility_status: matrix_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("schema compatibility planning only");
  expect(doc).toContain("not schema implementation");
  expect(doc).toContain("migration");
  expect(doc).toContain("runtime implementation");
  expect(doc).toContain("provider integration");
  expect(doc).toContain("news integration");
  expect(doc).toContain("Supabase persistence");
  expect(doc).toContain("deploy readiness");
  expect(doc).toContain("main-push authorization");
});

test("schema compatibility matrix explains purpose and adapter-first direction", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Existing schema/type surfaces must be respected");
  expect(doc).toContain("Planned intelligence fields should map to existing architecture where possible");
  expect(doc).toContain("Adapters/mappers are preferred before migrations");
  expect(doc).toContain("concrete gap proof");
  expect(doc).toContain("avoid parallel architecture and duplicated learning records");
});

test("schema compatibility matrix includes classification model", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const classification of classifications) {
    expect(doc).toContain(classification);
  }
  expect(doc).toContain("allowed next step");
  expect(doc).toContain("blocked behavior");
  expect(doc).toContain("Do not create a duplicate field/table");
  expect(doc).toContain("Do not create migration here");
});

test("schema compatibility matrix lists source surfaces", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Supabase migrations");
  expect(doc).toContain("recommendation tables/docs");
  expect(doc).toContain("recommendation snapshot types");
  expect(doc).toContain("outcome/replay types");
  expect(doc).toContain("historical candle tables");
  expect(doc).toContain("fetch-run/audit tables");
  expect(doc).toContain("History/Statistics helpers");
  expect(doc).toContain("static replay model");
  expect(doc).toContain("scan run metadata");
  expect(doc).toContain("provider data helpers");
  expect(doc).toContain("tests that encode existing field expectations");
});

test("schema compatibility matrix covers all planned domains", () => {
  const doc = readFileSync(docPath, "utf8");

  for (const domain of domains) {
    expect(doc).toContain(domain);
  }
  expect(doc).toContain("likely existing surface");
  expect(doc).toContain("compatibility classification");
  expect(doc).toContain("duplicate risk");
  expect(doc).toContain("required proof");
  expect(doc).toContain("recommended additive next step");
});

test("schema compatibility matrix includes migration rules and adapter-first rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no migration should be created from this action");
  expect(doc).toContain("migration candidates require exact existing schema proof");
  expect(doc).toContain("migration candidates require backward compatibility analysis");
  expect(doc).toContain("migration candidates require History/Statistics impact review");
  expect(doc).toContain("migration candidates require production migration safety plan");
  expect(doc).toContain("migration candidates require rollback/readback strategy");
  expect(doc).toContain("prefer mapping existing fields into learning dataset rows");
  expect(doc).toContain("prefer context envelope adapters over parallel tables");
  expect(doc).toContain("prefer outcome adapters over duplicate outcome records");
  expect(doc).toContain("prefer provider audit adapters over new audit concepts");
  expect(doc).toContain("preserve existing static replay result model compatibility");
  expect(doc).toContain("preserve History/Statistics compatibility");
});

test("schema compatibility matrix includes duplicate risk warnings and gap proof", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("duplicate recommendation rows");
  expect(doc).toContain("duplicate snapshot ids");
  expect(doc).toContain("duplicate outcome records");
  expect(doc).toContain("duplicate confidence fields");
  expect(doc).toContain("duplicate setup taxonomy fields");
  expect(doc).toContain("duplicate provider audit rows");
  expect(doc).toContain("duplicate candle persistence tables");
  expect(doc).toContain("duplicate learning dataset rows not linked to snapshots");
  expect(doc).toContain("duplicate pattern insight persistence without dataset linkage");
  expect(doc).toContain("exact file/schema reference");
  expect(doc).toContain("missing field proof");
  expect(doc).toContain("inability to adapt existing field");
  expect(doc).toContain("downstream consumer impact");
  expect(doc).toContain("test coverage plan");
  expect(doc).toContain("rollback/readback plan");
});

test("schema compatibility matrix blocks implementation work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no schema changes yet");
  expect(doc).toContain("no migrations yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no runtime routes yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no replay execution yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("no confidence threshold changes yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
});

test("schema compatibility matrix lists next actions 347 through 352", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 347: Learning Dataset Static Fixture Implementation Plan");
  expect(doc).toContain("Action 348: Intelligence Context Static Fixture Implementation Plan");
  expect(doc).toContain("Action 349: Pattern Insight Static Fixture Spec");
  expect(doc).toContain("Action 350: Runtime Ping-Only Route Approval Gate");
  expect(doc).toContain("Action 351: First Tiny Provider Capacity Experiment Approval Gate");
  expect(doc).toContain("Action 352: Snapshot-to-Learning Dataset Mapper Plan");
});

test("schema compatibility verifier exists exits zero and reports safe false permissions", () => {
  const output = runVerifier();
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.compatibility_matrix_found).toBe(true);
  expect(parsed.matrix_status_found).toBe(true);
  expect(parsed.classification_model_found).toBe(true);
  expect(parsed.source_surfaces_found).toBe(true);
  expect(parsed.compatibility_domains_found).toBe(true);
  expect(parsed.migration_candidate_rules_found).toBe(true);
  expect(parsed.adapter_first_rules_found).toBe(true);
  expect(parsed.duplicate_risk_warnings_found).toBe(true);
  expect(parsed.gap_proof_requirements_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
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
  expect(parsed.no_effect_flags.schema_changed).toBe(false);
  expect(parsed.no_effect_flags.migration_created).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
});

test("schema compatibility verifier output contains no secrets", () => {
  const output = runVerifier();

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("schema compatibility verifier source avoids env provider Supabase runtime and nondeterminism", () => {
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

test("Action 346 adds no app api route proxy or migration", () => {
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

test("Action 309 Action 340 Action 345 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const inventory = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-340-snapshot-field-inventory-against-existing-schema-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const providerPlan = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-345-first-tiny-provider-capacity-experiment-plan-verify.mjs"],
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
  expect(inventory.verification_status).toBe("passed");
  expect(providerPlan.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
