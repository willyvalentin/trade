import { execFileSync } from "child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { tmpdir } from "os";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-309-post-recovery-safe-development-protocol.md",
);
const guardPath = join(
  process.cwd(),
  "scripts/action-309-post-recovery-safety-guard.mjs",
);

function writeFixtureFile(root: string, relativePath: string, text: string) {
  const target = join(root, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text);
}

function runGuard(root = process.cwd()) {
  const output = execFileSync("node", [guardPath, "--root", root], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      TRADE_APP_PASSWORD: "trade-password-that-must-not-appear",
    },
  });

  return {
    output,
    parsed: JSON.parse(output),
  };
}

test("post-recovery protocol doc records rollback baseline and branch rules", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("6a501645908e4100088b7396");
  expect(doc).toContain("512a0c5");
  expect(doc).toContain("Do not push `main` directly");
  expect(doc).toContain("Do not publish Netlify deploys from unverified branches");
  expect(doc).toContain("Deploy Preview and Branch Deploy runtimes are not currently trusted");
  expect(doc).toContain("Production custom domain is the only verified healthy runtime");
  expect(doc).toContain("Keep all replay/write approvals false");
});

test("post-recovery protocol doc separates safe and unsafe work", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Docs");
  expect(doc).toContain("Static helpers");
  expect(doc).toContain("Local tests");
  expect(doc).toContain("Pure type/helper code not imported by production runtime");
  expect(doc).toContain("`proxy.ts` changes");
  expect(doc).toContain("Middleware changes");
  expect(doc).toContain("New `app/api` routes");
  expect(doc).toContain("New `app` page routes");
  expect(doc).toContain("Netlify config changes");
  expect(doc).toContain("Replay execute routes");
  expect(doc).toContain("Synthetic outcome persistence");
  expect(doc).toContain("Scanner/ranking integration");
});

test("guard script exists and runs locally without network or secrets", () => {
  const { output, parsed } = runGuard();
  const script = readFileSync(guardPath, "utf8");

  expect(["passed", "blocked"]).toContain(parsed.guard_status);
  expect(parsed.production_deploy_should_remain_rollback).toBe(true);
  expect(parsed.rollback_deploy_id).toBe("6a501645908e4100088b7396");
  expect(parsed.clean_base_commit).toBe("512a0c5");
  expect(parsed.main_push_allowed).toBe(false);
  expect(parsed.runtime_route_changes_allowed).toBe(false);
  expect(parsed.proxy_changes_allowed).toBe(false);
  expect(parsed.replay_execute_allowed).toBe(false);
  expect(script).not.toContain("fetch(");
  expect(script).not.toContain("createClient");
  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("trade-password-that-must-not-appear");
});

test("guard reports no-effect flags for provider Supabase replay synthetic outcomes and scanner ranking", () => {
  const { parsed } = runGuard();

  expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
  expect(parsed.no_effect_flags.provider_call_attempted).toBe(false);
  expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
  expect(parsed.no_effect_flags.candles_persisted).toBe(false);
  expect(parsed.no_effect_flags.raw_response_persisted).toBe(false);
  expect(parsed.no_effect_flags.fetch_run_persisted).toBe(false);
  expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.no_effect_flags.replay_executed).toBe(false);
  expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
  expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
});

test("guard blocks forbidden Action 307K runtime artifacts", () => {
  const root = mkdtempSync(join(tmpdir(), "action-309-guard-"));
  try {
    writeFixtureFile(
      root,
      "proxy.ts",
      'export const marker = "action_307k_proxy_runtime_crash_isolation";',
    );
    writeFixtureFile(root, "app/api/hb307c/ping/route.ts", "");
    writeFixtureFile(root, "app/api/ping307h/route.ts", "");
    writeFixtureFile(root, "app/api/route-publication-diagnostic/route.ts", "");
    writeFixtureFile(root, "app/route-publication-probe/page.tsx", "");
    writeFixtureFile(root, "app/public-probe-307g/page.tsx", "");
    writeFixtureFile(root, "app/ping307h/page.tsx", "");
    writeFixtureFile(root, "public/ping307i.txt", "");
    writeFixtureFile(root, "public/ping307i.json", "{}");
    writeFixtureFile(root, "public/ping307j.html", "<html></html>");
    writeFixtureFile(
      root,
      "public/action-307l-runtime-boundary-status.json",
      "{}",
    );

    const { parsed } = runGuard(root);

    expect(parsed.guard_status).toBe("blocked");
    expect(parsed.forbidden_artifacts_found).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "app/api/hb307c" }),
        expect.objectContaining({ path: "app/api/ping307h" }),
        expect.objectContaining({
          path: "app/api/route-publication-diagnostic",
        }),
        expect.objectContaining({ path: "app/route-publication-probe" }),
        expect.objectContaining({ path: "app/public-probe-307g" }),
        expect.objectContaining({ path: "app/ping307h" }),
        expect.objectContaining({ path: "public/ping307i.txt" }),
        expect.objectContaining({ path: "public/ping307i.json" }),
        expect.objectContaining({ path: "public/ping307j.html" }),
        expect.objectContaining({
          path: "public/action-307l-runtime-boundary-status.json",
        }),
      ]),
    );
    expect(parsed.forbidden_markers_found).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          marker: "action_307k_proxy_runtime_crash_isolation",
          path: "proxy.ts",
        }),
      ]),
    );
    expect(parsed.recommended_next_step).toBe(
      "remove_forbidden_307_runtime_artifacts_or_branch_again_from_clean_base_512a0c5",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("protocol doc states no provider call Supabase write replay synthetic outcome or scanner ranking effects", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("call Twelve Data");
  expect(doc).toContain("persist candles");
  expect(doc).toContain("persist raw responses");
  expect(doc).toContain("persist fetch-run rows");
  expect(doc).toContain("persist synthetic outcomes");
  expect(doc).toContain("execute replay");
  expect(doc).toContain("change scanner universe");
  expect(doc).toContain("change ranking");
  expect(doc).toContain("affect broker, execution, or risk");
});
