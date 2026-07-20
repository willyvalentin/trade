import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-347-learning-dataset-static-fixture-implementation-plan.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-347-learning-dataset-static-fixture-implementation-plan-verify.mjs",
);

function runVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-347-learning-dataset-static-fixture-implementation-plan-verify.mjs"],
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

test("learning dataset fixture implementation plan doc exists and records safe baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("implementation_plan_status: fixture_implementation_plan_ready");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("planning only, not fixture implementation");
  expect(doc).toContain("not fixture implementation");
});

test("learning dataset fixture implementation plan references Action 341 and Action 346", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Relationship To Action 341");
  expect(doc).toContain("Action 341 defines the Learning Dataset Static Fixture Spec");
  expect(doc).toContain("Relationship To Action 346");
  expect(doc).toContain("Action 346 defines the Existing Schema Compatibility Matrix");
  expect(doc).toContain("adapter-first classifications");
  expect(doc).toContain("must not create parallel architecture");
});

test("learning dataset fixture implementation plan defines allowed future implementation files", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("`lib/learning-dataset-static-fixtures.ts`");
  expect(doc).toContain("focused docs");
  expect(doc).toContain("focused Playwright spec");
  expect(doc).toContain("No other surfaces may change");
});

test("learning dataset fixture implementation plan includes pure helper rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("local-only");
  expect(doc).toContain("deterministic");
  expect(doc).toContain("no Date.now");
  expect(doc).toContain("no random IDs");
  expect(doc).toContain("no provider imports");
  expect(doc).toContain("no Supabase imports");
  expect(doc).toContain("no app/api imports");
  expect(doc).toContain("no runtime imports");
  expect(doc).toContain("no scanner/ranking imports");
});

test("learning dataset fixture implementation plan includes required scenarios", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("visible_winner_target_hit");
  expect(doc).toContain("visible_stop_hit");
  expect(doc).toContain("research_only_outperformer");
  expect(doc).toContain("research_only_weak_followthrough");
  expect(doc).toContain("stale_plan_adverse_move");
  expect(doc).toContain("no_entry_triggered");
  expect(doc).toContain("missing_context_safe_unknown");
  expect(doc).toContain("duplicate_snapshot_deduped");
  expect(doc).toContain("confidence_overfit_warning");
  expect(doc).toContain("anti_leakage_future_context_blocked");
});

test("learning dataset fixture implementation plan includes anti-leakage adapter and duplicate rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("snapshot-time features must remain separated from outcome fields");
  expect(doc).toContain("future context must be labeled unavailable at snapshot time");
  expect(doc).toContain("post-outcome context must be labeled post_outcome");
  expect(doc).toContain("catalyst/news availability must be snapshot-time safe");
  expect(doc).toContain("prefer mapping existing snapshot fields into fixture rows");
  expect(doc).toContain("prefer mapping existing outcome fields into fixture rows");
  expect(doc).toContain("prefer context envelope adapters over parallel tables");
  expect(doc).toContain("do not duplicate recommendation rows");
  expect(doc).toContain("do not duplicate snapshot ids");
  expect(doc).toContain("do not duplicate outcome records");
  expect(doc).toContain("do not create learning dataset rows disconnected from snapshots");
});

test("learning dataset fixture implementation plan blocks implementation work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no fixture implementation yet");
  expect(doc).toContain("no fixture data yet");
  expect(doc).toContain("no runtime routes yet");
  expect(doc).toContain("no provider calls yet");
  expect(doc).toContain("no news API calls yet");
  expect(doc).toContain("no Supabase reads yet");
  expect(doc).toContain("no Supabase writes yet");
  expect(doc).toContain("no schema changes yet");
  expect(doc).toContain("no migrations yet");
  expect(doc).toContain("no replay execution yet");
  expect(doc).toContain("no scanner/ranking mutation yet");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
});

test("learning dataset fixture implementation verifier exits zero and reports safe false permissions", () => {
  const output = runVerifier();
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.implementation_plan_found).toBe(true);
  expect(parsed.action_341_reference_found).toBe(true);
  expect(parsed.action_346_reference_found).toBe(true);
  expect(parsed.allowed_future_files_found).toBe(true);
  expect(parsed.anti_leakage_rules_found).toBe(true);
  expect(parsed.adapter_first_rules_found).toBe(true);
  expect(parsed.do_not_duplicate_rules_found).toBe(true);
  expect(parsed.fixture_implementation_allowed).toBe(false);
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
});

test("learning dataset fixture implementation verifier output contains no secrets", () => {
  const output = runVerifier();

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("learning dataset fixture implementation verifier source avoids forbidden imports and nondeterminism", () => {
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

test("Action 347 adds no app api route proxy or migration", () => {
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

test("Action 309 Action 341 Action 346 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const fixtureSpec = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-341-learning-dataset-static-fixture-spec-verify.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
  const compatibility = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-346-existing-schema-compatibility-matrix-verify.mjs"],
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
  expect(fixtureSpec.verification_status).toBe("passed");
  expect(compatibility.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
