import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-319-static-replay-batch-post-commit-verification.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
);

function runPostCommitVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-319-static-replay-batch-post-commit-verify.mjs"],
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

test("post-commit verification doc records committed static batch baseline", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(existsSync(docPath)).toBe(true);
  expect(doc).toContain("verification_status: post_commit_static_batch_verified");
  expect(doc).toContain("branch: dev/safe-post-recovery-work");
  expect(doc).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(doc).toContain("clean base commit: 512a0c5");
  expect(doc).toContain("static batch commit: 9b55e5a");
  expect(doc).toContain("static batch range: Actions 309-318");
});

test("post-commit verification doc is not deploy readiness and blocks main push", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("This is post-commit verification, not deploy readiness");
  expect(doc).toContain("does not authorize");
  expect(doc).toContain("Do not deploy");
  expect(doc).toContain("Do not push main");
  expect(doc).toContain("Do not merge from contaminated origin/main");
});

test("post-commit verification doc lists static and blocked surfaces", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("lib/replay-with-signal-package-*.ts");
  expect(doc).toContain("scripts/action-318-static-replay-batch-commit-readiness-verify.mjs");
  expect(doc).toContain("tests/e2e/action-318-static-replay-batch-commit-readiness-checklist.spec.ts");
  expect(doc).toContain("tests/fixtures/replay-with-signal-package-static-preview.*");
  expect(doc).toContain("app/api/");
  expect(doc).toContain("proxy.ts");
  expect(doc).toContain("middleware.ts");
  expect(doc).toContain("netlify.toml");
  expect(doc).toContain("supabase/");
  expect(doc).toContain("provider integrations");
});

test("verifier script exists exits 0 and proves post-commit static batch", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runPostCommitVerifier());

  expect(source).toContain("dev/safe-post-recovery-work");
  expect(source).toContain("9b55e5a");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.current_branch).toBe("dev/safe-post-recovery-work");
  expect(parsed.expected_branch).toBe("dev/safe-post-recovery-work");
  expect(parsed.static_batch_commit_found).toBe(true);
  expect(parsed.expected_static_batch_commit).toBe("9b55e5a");
  expect(parsed.post_commit_verification_only).toBe(true);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.required_files_found).toBe(true);
  expect(parsed.required_files_missing).toEqual([]);
  expect(parsed.forbidden_runtime_changes_detected).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
});

test("verifier output contains no secrets and all no-effect flags remain false", () => {
  const output = runPostCommitVerifier();
  const parsed = JSON.parse(output);

  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.provider_call_attempted).toBe(false);
  expect(parsed.no_effect_flags.supabase_read_executed).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.candles_persisted).toBe(false);
  expect(parsed.no_effect_flags.raw_response_persisted).toBe(false);
  expect(parsed.no_effect_flags.fetch_run_persisted).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
  expect(parsed.no_effect_flags.recommendation_rows_mutated).toBe(false);
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

test("Action 319 adds no app api route and does not modify proxy", () => {
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
  expect(guard.proxy_modified_from_head).toBe(false);
});

test("Action 309 guard Action 317 Action 318 and golden verifiers still pass", () => {
  const guard = JSON.parse(
    execFileSync("node", ["scripts/action-309-post-recovery-safety-guard.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const manifest = JSON.parse(
    execFileSync("node", ["scripts/action-317-static-release-manifest-verify.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }),
  );
  const readiness = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-318-static-replay-batch-commit-readiness-verify.mjs"],
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
  expect(manifest.verification_status).toBe("passed");
  expect(readiness.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
