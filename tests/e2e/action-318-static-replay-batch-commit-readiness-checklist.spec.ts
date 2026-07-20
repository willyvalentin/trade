import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const checklistPath = join(
  process.cwd(),
  "docs/action-318-static-replay-batch-commit-readiness-checklist.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
);

function runCommitReadinessVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-318-static-replay-batch-commit-readiness-verify.mjs"],
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

test("checklist doc exists and records commit readiness baseline", () => {
  const checklist = readFileSync(checklistPath, "utf8");

  expect(existsSync(checklistPath)).toBe(true);
  expect(checklist).toContain("checklist_status: static_replay_batch_commit_ready");
  expect(checklist).toContain("branch: dev/safe-post-recovery-work");
  expect(checklist).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(checklist).toContain("clean base commit: 512a0c5");
  expect(checklist).toContain("static batch range: Actions 309-317");
});

test("checklist says commit readiness not deploy readiness", () => {
  const checklist = readFileSync(checklistPath, "utf8");

  expect(checklist).toContain("This is commit readiness, not deploy readiness");
  expect(checklist).toContain("does not authorize deployment");
  expect(checklist).toContain("Do not deploy from this action");
});

test("checklist lists Actions 309 through 317 files and changed surface policy", () => {
  const checklist = readFileSync(checklistPath, "utf8");

  expect(checklist).toContain("docs/action-309-post-recovery-safe-development-protocol.md");
  expect(checklist).toContain("docs/action-317-post-recovery-static-replay-release-manifest.md");
  expect(checklist).toContain("lib/replay-with-signal-package-static-preview.ts");
  expect(checklist).toContain("scripts/action-317-static-release-manifest-verify.mjs");
  expect(checklist).toContain("tests/e2e/action-317-post-recovery-static-replay-release-manifest.spec.ts");
  expect(checklist).toContain("tests/fixtures/replay-with-signal-package-static-preview.json.golden.json");
  expect(checklist).toContain("Allowed Changed Surfaces");
  expect(checklist).toContain("Blocked Changed Surfaces");
  expect(checklist).toContain("app/api/");
  expect(checklist).toContain("proxy.ts");
  expect(checklist).toContain("supabase/");
});

test("checklist warns not to use git add dot and not to push main", () => {
  const checklist = readFileSync(checklistPath, "utf8");

  expect(checklist).toContain("Do not use `git add .`");
  expect(checklist).toContain("Do not push main");
  expect(checklist).toContain("git add \\");
});

test("verifier script exists exits 0 and reports commit readiness only", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runCommitReadinessVerifier());

  expect(source).toContain("dev/safe-post-recovery-work");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.current_branch).toBe("dev/safe-post-recovery-work");
  expect(parsed.expected_branch).toBe("dev/safe-post-recovery-work");
  expect(parsed.commit_readiness_only).toBe(true);
  expect(parsed.deploy_readiness).toBe(false);
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.required_files_found).toBe(true);
  expect(parsed.required_files_missing).toEqual([]);
  expect(parsed.unexpected_changed_files).toEqual([]);
  expect(parsed.forbidden_runtime_changes_detected).toBe(false);
  expect(parsed.forbidden_markers_found).toEqual([]);
});

test("verifier output contains no secrets and no-effect flags stay false", () => {
  const output = runCommitReadinessVerifier();
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
  expect(source).not.toContain("@/lib/broker");
  expect(source).not.toContain("@/lib/execution");
  expect(source).not.toContain("Date.now");
  expect(source).not.toContain("new Date");
  expect(source).not.toContain("Math.random");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("window.");
  expect(source).not.toContain("globalThis");
});

test("Action 318 adds no app api route and does not modify proxy", () => {
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

test("Action 309 guard Action 317 verifier and golden verifier still pass", () => {
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
  const golden = JSON.parse(
    execFileSync(
      "node",
      ["scripts/replay-with-signal-package-static-preview-verify-golden.mjs"],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );

  expect(guard.guard_status).toBe("passed");
  expect(manifest.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
