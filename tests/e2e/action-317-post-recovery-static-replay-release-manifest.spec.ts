import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const manifestPath = join(
  process.cwd(),
  "docs/action-317-post-recovery-static-replay-release-manifest.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-317-static-release-manifest-verify.mjs",
);

function runManifestVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-317-static-release-manifest-verify.mjs"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
        TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
        SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      },
    },
  );
}

test("manifest doc exists and records recovery baseline", () => {
  const manifest = readFileSync(manifestPath, "utf8");

  expect(existsSync(manifestPath)).toBe(true);
  expect(manifest).toContain("release_manifest_status: static_release_manifest_ready");
  expect(manifest).toContain("6a501645908e4100088b7396");
  expect(manifest).toContain("512a0c5");
  expect(manifest).toContain("dev/safe-post-recovery-work");
});

test("manifest lists Actions 309 through 316", () => {
  const manifest = readFileSync(manifestPath, "utf8");

  for (const action of [
    "Action 309 safety protocol",
    "Action 310 result model",
    "Action 311 static simulation engine",
    "Action 312 static fixtures",
    "Action 313 static summary evaluator",
    "Action 314 static inspection report",
    "Action 315 static preview script",
    "Action 316 golden snapshots",
  ]) {
    expect(manifest).toContain(action);
  }
});

test("manifest lists inventory untouched surfaces and no-effect guarantee", () => {
  const manifest = readFileSync(manifestPath, "utf8");

  expect(manifest).toContain("docs/action-309-post-recovery-safe-development-protocol.md");
  expect(manifest).toContain("lib/replay-with-signal-package-static-preview.ts");
  expect(manifest).toContain("scripts/replay-with-signal-package-static-preview-verify-golden.mjs");
  expect(manifest).toContain("tests/fixtures/replay-with-signal-package-static-preview.json.golden.json");
  expect(manifest).toContain("app/api");
  expect(manifest).toContain("app page routes");
  expect(manifest).toContain("proxy.ts");
  expect(manifest).toContain("netlify.toml");
  expect(manifest).toContain("Supabase persistence paths");
  expect(manifest).toContain("provider_call_executed false");
  expect(manifest).toContain("provider_call_attempted false");
  expect(manifest).toContain("supabase_write_executed false");
  expect(manifest).toContain("synthetic_outcomes_persisted false");
  expect(manifest).toContain("replay_executed false");
  expect(manifest).toContain("recommendation_rows_mutated false");
});

test("manifest gives static-only release recommendation and deployment caveat", () => {
  const manifest = readFileSync(manifestPath, "utf8");

  expect(manifest).toContain("safe to commit as static-only batch");
  expect(manifest).toContain(
    "not automatically safe to deploy until explicit production release checklist is run",
  );
  expect(manifest).toContain("do not push main directly");
  expect(manifest).toContain("do not merge from contaminated origin/main");
});

test("verifier script exists exits 0 and reports passed", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runManifestVerifier());

  expect(source).toContain("action-317-post-recovery-static-replay-release-manifest");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.release_manifest_found).toBe(true);
  expect(parsed.required_docs_found).toBe(true);
  expect(parsed.required_libs_found).toBe(true);
  expect(parsed.required_scripts_found).toBe(true);
  expect(parsed.required_tests_found).toBe(true);
  expect(parsed.forbidden_runtime_changes_detected).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
  expect(parsed.guard_script_found).toBe(true);
  expect(parsed.golden_verifier_found).toBe(true);
});

test("verifier output contains no secrets and no-effect flags stay false", () => {
  const output = runManifestVerifier();
  const parsed = JSON.parse(output);

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.provider_call_attempted).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
  expect(parsed.no_effect_flags.recommendation_rows_mutated).toBe(false);
});

test("verifier script avoids env provider Supabase and runtime imports", () => {
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
  expect(source).not.toContain("real-scanner");
  expect(source).not.toContain("@/lib/broker");
  expect(source).not.toContain("@/lib/execution");
  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("new Date");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("window.");
  expect(source).not.toContain("globalThis");
});

test("Action 317 adds no app api route and does not modify proxy", () => {
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
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 guard and golden snapshot verifier still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const golden = JSON.parse(
    execFileSync(
      "node",
      ["scripts/replay-with-signal-package-static-preview-verify-golden.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );

  expect(guard.guard_status).toBe("passed");
  expect(guard.forbidden_artifacts_found).toEqual([]);
  expect(guard.forbidden_markers_found).toEqual([]);
  expect(golden.verification_status).toBe("passed");
  expect(golden.markdown_matches).toBe(true);
  expect(golden.json_matches).toBe(true);
});
