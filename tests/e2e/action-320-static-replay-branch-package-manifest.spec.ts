import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const manifestPath = join(
  process.cwd(),
  "docs/action-320-static-replay-branch-package-manifest.md",
);
const verifierPath = join(
  process.cwd(),
  "scripts/action-320-static-replay-branch-package-verify.mjs",
);

function runBranchPackageVerifier() {
  return execFileSync(
    "node",
    ["scripts/action-320-static-replay-branch-package-verify.mjs"],
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

test("branch package manifest doc records static branch package baseline", () => {
  const manifest = readFileSync(manifestPath, "utf8");

  expect(existsSync(manifestPath)).toBe(true);
  expect(manifest).toContain(
    "package_manifest_status: static_replay_branch_package_verified",
  );
  expect(manifest).toContain("branch: dev/safe-post-recovery-work");
  expect(manifest).toContain("rollback deploy protected: 6a501645908e4100088b7396");
  expect(manifest).toContain("clean base commit: 512a0c5");
  expect(manifest).toContain("static batch commit: 9b55e5a");
  expect(manifest).toContain("post-commit verification commit: f8775dd");
  expect(manifest).toContain("package range: Actions 309-320");
});

test("branch package manifest says local package not deploy readiness", () => {
  const manifest = readFileSync(manifestPath, "utf8");

  expect(manifest).toContain(
    "This is a local branch package manifest, not deploy readiness",
  );
  expect(manifest).toContain("does not authorize production deploy");
  expect(manifest).toContain("Do not deploy");
  expect(manifest).toContain("Do not push main");
  expect(manifest).toContain("Do not merge from contaminated origin/main");
});

test("branch package manifest lists package contents", () => {
  const manifest = readFileSync(manifestPath, "utf8");

  expect(manifest).toContain("post-recovery safety protocol");
  expect(manifest).toContain("replay result model");
  expect(manifest).toContain("static simulation engine");
  expect(manifest).toContain("deterministic fixtures");
  expect(manifest).toContain("static summary evaluator");
  expect(manifest).toContain("static inspection report");
  expect(manifest).toContain("static preview script");
  expect(manifest).toContain("golden snapshots");
  expect(manifest).toContain("static release manifest");
  expect(manifest).toContain("commit readiness verifier");
  expect(manifest).toContain("post-commit verifier");
  expect(manifest).toContain("branch package manifest");
});

test("branch package manifest lists verified properties and blocked operations", () => {
  const manifest = readFileSync(manifestPath, "utf8");

  expect(manifest).toContain("static-only");
  expect(manifest).toContain("local-only");
  expect(manifest).toContain("deterministic");
  expect(manifest).toContain("no provider calls");
  expect(manifest).toContain("no Supabase reads/writes");
  expect(manifest).toContain("no replay execution");
  expect(manifest).toContain("no synthetic outcome persistence");
  expect(manifest).toContain("no scanner/ranking/recommendation mutation");
  expect(manifest).toContain("no app/api routes");
  expect(manifest).toContain("no page routes");
  expect(manifest).toContain("no proxy/middleware/Netlify changes");
  expect(manifest).toContain("deploy production");
  expect(manifest).toContain("push main");
  expect(manifest).toContain("add runtime routes");
  expect(manifest).toContain("enable approvals");
  expect(manifest).toContain("execute replay");
});

test("verifier script exists exits 0 and proves branch package commits", () => {
  const source = readFileSync(verifierPath, "utf8");
  const parsed = JSON.parse(runBranchPackageVerifier());

  expect(source).toContain("dev/safe-post-recovery-work");
  expect(source).toContain("512a0c5");
  expect(source).toContain("9b55e5a");
  expect(source).toContain("f8775dd");
  expect(parsed.verification_status).toBe("passed");
  expect(parsed.current_branch).toBe("dev/safe-post-recovery-work");
  expect(parsed.expected_branch).toBe("dev/safe-post-recovery-work");
  expect(parsed.clean_base_commit_found).toBe(true);
  expect(parsed.expected_clean_base_commit).toBe("512a0c5");
  expect(parsed.static_batch_commit_found).toBe(true);
  expect(parsed.expected_static_batch_commit).toBe("9b55e5a");
  expect(parsed.post_commit_verification_commit_found).toBe(true);
  expect(parsed.expected_post_commit_verification_commit).toBe("f8775dd");
  expect(parsed.branch_package_manifest_only).toBe(true);
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
  const output = runBranchPackageVerifier();
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

test("Action 320 adds no app api route and does not modify proxy", () => {
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

test("Action 309 through Action 319 verifiers still pass", () => {
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
  const postCommit = JSON.parse(
    execFileSync(
      "node",
      ["scripts/action-319-static-replay-batch-post-commit-verify.mjs"],
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
  expect(postCommit.verification_status).toBe("passed");
  expect(golden.verification_status).toBe("passed");
});
