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

const guardPath = join(
  process.cwd(),
  "scripts/action-308r-production-clean-branch-guard.mjs",
);
const docPath = join(
  process.cwd(),
  "docs/action-308r-clean-recovery-branch-for-minimal-ping-reintroduction.md",
);

function makeFixture() {
  return mkdtempSync(join(tmpdir(), "action-308r-guard-"));
}

function writeFixtureFile(root: string, relativePath: string, text: string) {
  const target = join(root, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text);
}

function runGuard(root: string) {
  const output = execFileSync("node", [guardPath, "--root", root], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      TWELVE_DATA_API_KEY: "twelve-data-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
    },
  });

  return {
    output,
    parsed: JSON.parse(output),
  };
}

test("guard script exists and runs locally without network or secrets", () => {
  const root = makeFixture();
  try {
    writeFixtureFile(root, "app/keep/route.ts", "export async function GET() {}");
    const { output, parsed } = runGuard(root);

    expect(parsed.guard_status).toBe("clean");
    expect(parsed.clean_for_minimal_ping_reintroduction).toBe(true);
    expect(parsed.forbidden_artifacts_found).toEqual([]);
    expect(parsed.no_effect_flags.provider_call_executed).toBe(false);
    expect(parsed.no_effect_flags.supabase_write_executed).toBe(false);
    expect(parsed.no_effect_flags.replay_executed).toBe(false);
    expect(parsed.no_effect_flags.synthetic_outcomes_persisted).toBe(false);
    expect(parsed.no_effect_flags.scanner_behavior_changed).toBe(false);
    expect(parsed.no_effect_flags.live_ranking_changed).toBe(false);
    expect(output).not.toContain("twelve-data-secret-that-must-not-appear");
    expect(output).not.toContain("supabase-secret-that-must-not-appear");
    expect(output).not.toContain("automation-secret-that-must-not-appear");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("guard detects Action 307K proxy marker when present", () => {
  const root = makeFixture();
  try {
    writeFixtureFile(
      root,
      "proxy.ts",
      'export const marker = "action_307k_proxy_runtime_crash_isolation";',
    );
    const { parsed } = runGuard(root);

    expect(parsed.guard_status).toBe("blocked");
    expect(parsed.forbidden_proxy_marker_found).toBe(true);
    expect(parsed.action_307k_proxy_marker_present).toBe(true);
    expect(parsed.clean_for_minimal_ping_reintroduction).toBe(false);
    expect(parsed.forbidden_artifacts_found).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "forbidden_proxy_marker",
          marker: "action_307k_proxy_runtime_crash_isolation",
          path: "proxy.ts",
        }),
      ]),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("guard reports not clean when forbidden Action 307 diagnostic artifacts exist", () => {
  const root = makeFixture();
  try {
    writeFixtureFile(root, "app/api/hb307c/ping/route.ts", "export async function GET() {}");
    writeFixtureFile(root, "app/api/route-publication-diagnostic/route.ts", "");
    writeFixtureFile(root, "app/ping307h/page.tsx", "");
    writeFixtureFile(root, "public/ping307j.html", "<html></html>");
    writeFixtureFile(
      root,
      "public/action-307l-runtime-boundary-status.json",
      '{"marker":"action_307l_runtime_boundary_status_static"}',
    );
    writeFixtureFile(root, "scripts/action-307m-production-recovery-summary.mjs", "");
    writeFixtureFile(root, "docs/action-307c-production-route-publication.md", "");

    const { parsed } = runGuard(root);

    expect(parsed.guard_status).toBe("blocked");
    expect(parsed.clean_for_minimal_ping_reintroduction).toBe(false);
    expect(parsed.recommended_action).toBe(
      "rollback_or_branch_from_deploy_6a501645908e4100088b7396_then_reapply_only_action_308_ping",
    );
    expect(parsed.forbidden_artifacts_found).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "app/api/hb307c" }),
        expect.objectContaining({
          path: "app/api/route-publication-diagnostic",
        }),
        expect.objectContaining({ path: "app/ping307h" }),
        expect.objectContaining({ path: "public/ping307j.html" }),
        expect.objectContaining({
          path: "public/action-307l-runtime-boundary-status.json",
        }),
        expect.objectContaining({
          type: "forbidden_action_307c_to_307m_script",
          path: "scripts/action-307m-production-recovery-summary.mjs",
        }),
        expect.objectContaining({
          type: "forbidden_action_307c_to_307m_doc",
          path: "docs/action-307c-production-route-publication.md",
        }),
      ]),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("runbook documents rollback target, forbidden artifacts, and known-good routes", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("deployId 6a501645908e4100088b7396");
  expect(doc).toContain("action_307k_proxy_runtime_crash_isolation");
  expect(doc).toContain("proxy.ts");
  expect(doc).toContain("/api/hb307c");
  expect(doc).toContain("/api/ping307h");
  expect(doc).toContain("/api/route-publication-diagnostic");
  expect(doc).toContain("/route-publication-probe");
  expect(doc).toContain("/public-probe-307g");
  expect(doc).toContain("/ping307h");
  expect(doc).toContain("/ping307j.html");
  expect(doc).toContain("public/ping307i.*");
  expect(doc).toContain("public/action-307l-runtime-boundary-status.json");
  expect(doc).toContain(
    "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
  );
  expect(doc).toContain(
    "/api/historical-backfill/first-tiny-replay-dry-run/ping",
  );
  expect(doc).toContain(
    "/api/historical-backfill/first-tiny-candle-persistence-readback/ping",
  );
});

test("runbook and guard preserve no-effect guarantees", () => {
  const doc = readFileSync(docPath, "utf8");
  const script = readFileSync(guardPath, "utf8");

  expect(doc).toContain("call Twelve Data");
  expect(doc).toContain("persist candles");
  expect(doc).toContain("persist synthetic outcomes");
  expect(doc).toContain("execute replay");
  expect(doc).toContain("change scanner universe");
  expect(doc).toContain("change ranking");
  expect(doc).toContain("affect broker, execution, or risk");

  expect(script).not.toContain("fetch(");
  expect(script).not.toContain("createClient");
  expect(script).not.toContain("TWELVE_DATA_API_KEY");
  expect(script).toContain("provider_call_executed: false");
  expect(script).toContain("supabase_write_executed: false");
  expect(script).toContain("replay_executed: false");
  expect(script).toContain("synthetic_outcomes_persisted: false");
  expect(script).toContain("scanner_behavior_changed: false");
  expect(script).toContain("live_ranking_changed: false");
});
