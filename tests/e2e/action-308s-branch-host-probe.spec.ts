import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const txtPath = join(process.cwd(), "public/action-308s-branch-host-probe.txt");
const jsonPath = join(process.cwd(), "public/action-308s-branch-host-probe.json");
const docPath = join(
  process.cwd(),
  "docs/action-308s-branch-deploy-static-host-probe.md",
);

test("txt static branch host probe exists and contains marker", () => {
  const txt = readFileSync(txtPath, "utf8");

  expect(txt).toContain("action_308s_branch_host_probe");
  expect(txt).toContain("static public asset reachable");
  expect(txt).toContain("branch deploy artifact reachable");
  expect(txt).toContain("no provider call");
  expect(txt).toContain("no replay");
  expect(txt).toContain("no write");
  expect(txt).toContain("no synthetic outcomes");
  expect(txt).toContain("no scanner/ranking effects");
});

test("json static branch host probe parses and reports no effects", () => {
  const parsed = JSON.parse(readFileSync(jsonPath, "utf8"));

  expect(parsed.ok).toBe(true);
  expect(parsed.marker).toBe("action_308s_branch_host_probe");
  expect(parsed.purpose).toBe("branch_deploy_static_host_probe");
  expect(parsed.provider_call_executed).toBe(false);
  expect(parsed.provider_call_attempted).toBe(false);
  expect(parsed.supabase_write_executed).toBe(false);
  expect(parsed.candles_persisted).toBe(false);
  expect(parsed.raw_response_persisted).toBe(false);
  expect(parsed.fetch_run_persisted).toBe(false);
  expect(parsed.synthetic_outcomes_persisted).toBe(false);
  expect(parsed.replay_executed).toBe(false);
  expect(parsed.scanner_behavior_changed).toBe(false);
  expect(parsed.live_ranking_changed).toBe(false);
});

test("branch host probe doc includes commands and interpretation matrix", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain(
    'DEPLOY_URL="https://recovery-action-308-clean--trade-vl.netlify.app"',
  );
  expect(doc).toContain(
    'curl -i -s "$DEPLOY_URL/action-308s-branch-host-probe.txt"',
  );
  expect(doc).toContain(
    'curl -i -s "$DEPLOY_URL/action-308s-branch-host-probe.json"',
  );
  expect(doc).toContain('curl -i -s "$DEPLOY_URL/login"');
  expect(doc).toContain(
    'curl -i -s "$DEPLOY_URL/api/environment-boundary-audit/ping"',
  );
  expect(doc).toContain(
    'curl -i -s "$DEPLOY_URL/api/historical-backfill/first-tiny-replay-with-signal-package-ping"',
  );
  expect(doc).toContain("Static files return 200 but `/login` and `/api` return 400");
  expect(doc).toContain("Static files also return 400");
  expect(doc).toContain("Static files and runtime routes return 200");
  expect(doc).toContain("Do not touch production until branch deploy is understood");
});

test("branch host probe doc preserves no-effect boundaries", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("call Twelve Data");
  expect(doc).toContain("persist candles");
  expect(doc).toContain("persist synthetic outcomes");
  expect(doc).toContain("execute replay");
  expect(doc).toContain("change scanner universe");
  expect(doc).toContain("change ranking");
  expect(doc).toContain("affect broker, execution, or risk");
  expect(doc).toContain("alter `proxy.ts`");
  expect(doc).toContain("add diagnostics routes under `app/api`");
  expect(doc).toContain("add public runtime pages");
});
