import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-352-snapshot-to-learning-dataset-mapper-plan.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
);

const mappingDomains = [
  "recommendation identity",
  "snapshot identity",
  "ticker/direction",
  "timestamps/window",
  "entry/stop/target",
  "setup family",
  "confidence value/bucket",
  "quality gates",
  "market regime",
  "sector/industry",
  "relative strength",
  "catalyst/news",
  "calendar event",
  "provenance",
  "outcome classification",
  "R metrics",
  "derived labels",
  "learning eligibility",
];

function runVerifier(scriptPath: string) {
  return execFileSync("node", [scriptPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      NEWS_API_KEY: "news-secret-that-must-not-appear",
    },
  });
}

test("snapshot-to-learning mapper plan doc exists and records safe status", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("snapshot_to_learning_dataset_mapper_plan_status: mapper_plan_ready");
  expect(doc).toContain("mapper_implementation_allowed: false");
  expect(doc).toContain("learning_dataset_persistence_allowed: false");
  expect(doc).toContain("deploy_readiness: false");
  expect(doc).toContain("main_push_allowed: false");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("This is mapper planning only");
});

test("snapshot-to-learning mapper plan defines input and output contracts", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("recommendation_snapshot");
  expect(doc).toContain("recommendation_identity");
  expect(doc).toContain("trade_plan");
  expect(doc).toContain("setup_and_confidence");
  expect(doc).toContain("quality_gate_summary");
  expect(doc).toContain("optional_context_snapshot_envelope");
  expect(doc).toContain("evaluated_outcome");
  expect(doc).toContain("data_provenance");
  expect(doc).toContain("mapper_version");
  expect(doc).toContain("snapshot_time_inputs");
  expect(doc).toContain("market_context");
  expect(doc).toContain("news_catalyst_context");
  expect(doc).toContain("derived_learning_fields");
  expect(doc).toContain("learning_eligibility_status");
  expect(doc).toContain("missing_context_reasons");
});

test("snapshot-to-learning mapper plan defines identity linkage and temporal separation", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("one learning row per recommendation_snapshot_id plus outcome window/version");
  expect(doc).toContain("recommendation identity preserved");
  expect(doc).toContain("snapshot identity preserved");
  expect(doc).toContain("outcome identity preserved where existing");
  expect(doc).toContain("source scan/run linkage preserved");
  expect(doc).toContain("deterministic learning_row_key");
  expect(doc).toContain("Snapshot-time fields:");
  expect(doc).toContain("Outcome-time fields:");
  expect(doc).toContain("Outcome fields must never influence snapshot-time fields");
});

test("snapshot-to-learning mapper plan includes all mapping domains", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("target learning field/group");
  expect(doc).toContain("source object/field");
  expect(doc).toContain("mapping type");
  expect(doc).toContain("compatibility classification from Action 346");
  for (const domain of mappingDomains) {
    expect(doc).toContain(domain);
  }
});

test("snapshot-to-learning mapper plan defines missing-data anti-leakage and adapter-first rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("never silently invent context");
  expect(doc).toContain("populate missing_context_reasons");
  expect(doc).toContain("missing news is not equivalent to no catalyst");
  expect(doc).toContain("missing outcome prevents completed learning row");
  expect(doc).toContain("snapshot timestamps precede or equal all snapshot-time source timestamps");
  expect(doc).toContain("later news excluded");
  expect(doc).toContain("later regime labels excluded");
  expect(doc).toContain("later relative strength excluded");
  expect(doc).toContain("reuse existing snapshot/result/outcome types");
  expect(doc).toContain("prefer adapters over parallel models");
  expect(doc).toContain("no duplicate recommendation tables");
  expect(doc).toContain("no learning row without snapshot linkage");
});

test("snapshot-to-learning mapper plan constrains future files and readiness levels", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("`lib/snapshot-to-learning-dataset-mapper.ts`");
  expect(doc).toContain("optionally one focused pure validation helper");
  expect(doc).toContain("No app/api, provider, Supabase, migration, scanner, ranking, proxy, middleware, or Netlify files may change.");
  expect(doc).toContain("LM0 mapper need undefined");
  expect(doc).toContain("LM1 input/output contracts documented");
  expect(doc).toContain("LM2 field mapping matrix defined");
  expect(doc).toContain("LM3 identity/linkage rules defined");
  expect(doc).toContain("LM4 missing-data rules defined");
  expect(doc).toContain("LM5 anti-leakage validation defined");
  expect(doc).toContain("LM6 implementation plan ready");
  expect(doc).toContain("LM10 offline learning-row generation ready");
  expect(doc).toContain("Current status is LM6");
  expect(doc).toContain("Mapper implementation is not authorized");
});

test("snapshot-to-learning mapper plan blocks implementation and side effects", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("no mapper implementation");
  expect(doc).toContain("no learning-row generation");
  expect(doc).toContain("no dataset persistence");
  expect(doc).toContain("no Supabase access");
  expect(doc).toContain("no schema or migration changes");
  expect(doc).toContain("no runtime routes");
  expect(doc).toContain("no provider/news calls");
  expect(doc).toContain("no replay execution");
  expect(doc).toContain("no scanner/ranking/confidence mutation");
  expect(doc).toContain("no deploy");
  expect(doc).toContain("no main push");
});

test("snapshot-to-learning mapper verifier exits zero and reports safe false permissions", () => {
  const output = runVerifier("scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs");
  const parsed = JSON.parse(output);

  expect(existsSync(verifierPath)).toBe(true);
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.mapper_plan_found).toBe(true);
  expect(parsed.plan_status_found).toBe(true);
  expect(parsed.input_contract_found).toBe(true);
  expect(parsed.output_contract_found).toBe(true);
  expect(parsed.identity_linkage_rules_found).toBe(true);
  expect(parsed.temporal_separation_found).toBe(true);
  expect(parsed.mapping_matrix_found).toBe(true);
  expect(parsed.missing_data_behavior_found).toBe(true);
  expect(parsed.anti_leakage_rules_found).toBe(true);
  expect(parsed.adapter_first_rules_found).toBe(true);
  expect(parsed.allowed_future_files_found).toBe(true);
  expect(parsed.validation_requirements_found).toBe(true);
  expect(parsed.readiness_levels_found).toBe(true);
  expect(parsed.blocked_work_found).toBe(true);
  expect(parsed.next_actions_found).toBe(true);
  expect(parsed.mapper_implementation_allowed).toBe(false);
  expect(parsed.learning_row_generation_allowed).toBe(false);
  expect(parsed.learning_dataset_persistence_allowed).toBe(false);
  expect(parsed.supabase_read_allowed).toBe(false);
  expect(parsed.supabase_write_allowed).toBe(false);
  expect(parsed.schema_change_allowed).toBe(false);
  expect(parsed.migration_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.provider_call_allowed).toBe(false);
  expect(parsed.news_api_call_allowed).toBe(false);
  expect(parsed.replay_execution_allowed).toBe(false);
  expect(parsed.scanner_ranking_mutation_allowed).toBe(false);
  expect(parsed.confidence_threshold_mutation_allowed).toBe(false);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
});

test("snapshot-to-learning mapper verifier output contains no secrets", () => {
  const output = runVerifier("scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs");

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("snapshot-to-learning mapper verifier source avoids forbidden imports and nondeterminism", () => {
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

test("Action 352 adds no mapper implementation app api route proxy migration or schema change", () => {
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

  expect(status).not.toMatch(/^(..|\?\?) lib\/snapshot-to-learning-dataset-mapper\.ts/m);
  expect(status).not.toMatch(/^(..|\?\?) app\/api\//m);
  expect(status).not.toMatch(/^(..|\?\?) app\/[^/]+\/page\.tsx/m);
  expect(status).not.toMatch(/^(..|\?\?) proxy\.ts/m);
  expect(status).not.toMatch(/^(..|\?\?) middleware\.(ts|js)/m);
  expect(status).not.toMatch(/^(..|\?\?) netlify\.toml/m);
  expect(status).not.toMatch(/^(..|\?\?) supabase\/migrations\//m);
  expect(guard.guard_status).toBe("passed");
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("upstream safety and dataset planning verifiers still pass", () => {
  const verifiers = [
    "scripts/action-309-post-recovery-safety-guard.mjs",
    "scripts/replay-with-signal-package-static-preview-verify-golden.mjs",
    "scripts/action-334-recommendation-snapshot-completeness-audit-verify.mjs",
    "scripts/action-335-learning-outcome-dataset-design-verify.mjs",
    "scripts/action-340-snapshot-field-inventory-against-existing-schema-verify.mjs",
    "scripts/action-341-learning-dataset-static-fixture-spec-verify.mjs",
    "scripts/action-346-existing-schema-compatibility-matrix-verify.mjs",
    "scripts/action-347-learning-dataset-static-fixture-implementation-plan-verify.mjs",
    "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
    "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
    "scripts/action-320-static-replay-branch-package-verify.mjs",
  ];

  for (const script of verifiers) {
    const parsed = JSON.parse(runVerifier(script));
    expect(parsed.verification_status ?? parsed.guard_status).toMatch(/^(passed)$/);
  }
});
