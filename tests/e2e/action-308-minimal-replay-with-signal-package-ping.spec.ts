import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import { GET } from "../../app/api/historical-backfill/first-tiny-replay-with-signal-package-ping/route";
import { buildAction308MinimalReplayWithSignalPackagePing } from "../../lib/action-308-minimal-replay-with-signal-package-ping";

const routePath = join(
  process.cwd(),
  "app/api/historical-backfill/first-tiny-replay-with-signal-package-ping/route.ts",
);
const docPath = join(
  process.cwd(),
  "docs/action-308-minimal-replay-with-signal-package-ping-reintroduction.md",
);
const diagnosticsPath = join(process.cwd(), "lib/market-diagnostics-console.ts");

async function pingBody() {
  const response = await GET();

  return {
    response,
    body: await response.json(),
  };
}

test("minimal replay with signal package ping returns action 308 marker", async () => {
  const { response, body } = await pingBody();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.route_ping).toBe(true);
  expect(body.route_build_marker).toBe(
    "action_308_minimal_replay_with_signal_package_ping",
  );
  expect(body.purpose).toBe("minimal_route_publication_check_only");
});

test("minimal replay with signal package ping keeps all execute and write paths disabled", async () => {
  const { body } = await pingBody();

  expect(body.replay_with_signal_package_execute_route_present).toBe(false);
  expect(body.provider_call_executed).toBe(false);
  expect(body.provider_call_attempted).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(body.raw_response_persisted).toBe(false);
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.synthetic_outcomes_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(body.live_ranking_changed).toBe(false);
  expect(body.recommendation_rows_mutated).toBe(false);
  expect(body.supabase_write_executed).toBe(false);
});

test("minimal replay with signal package helper matches route contract", () => {
  const helper = buildAction308MinimalReplayWithSignalPackagePing();

  expect(helper.route_build_marker).toBe(
    "action_308_minimal_replay_with_signal_package_ping",
  );
  expect(helper.replay_with_signal_package_execute_route_present).toBe(false);
  expect(helper.recommended_next_steps).toEqual([
    "verify_ping_in_production",
    "keep_approvals_false",
    "only_then_plan_minimal_auth_check_route",
  ]);
});

test("minimal ping route does not add POST or execute handler", () => {
  const routeSource = readFileSync(routePath, "utf8");

  expect(routeSource).toContain("export async function GET");
  expect(routeSource).not.toContain("export async function POST");
  expect(routeSource).not.toContain("executeReplay");
  expect(routeSource).not.toContain("execute_provider_call");
  expect(routeSource).not.toContain("auth_check_only");
});

test("minimal replay with signal package doc includes rollback instructions and approval locks", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("Action 308 intentionally reintroduces only a minimal ping route");
  expect(doc).toContain(
    "curl -i -s \"https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-with-signal-package-ping\"",
  );
  expect(doc).toContain("HTTP 400 empty body");
  expect(doc).toContain("rollback immediately");
  expect(doc).toContain("TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false");
  expect(doc).toContain("TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false");
  expect(doc).toContain("TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false");
});

test("market diagnostics source includes minimal ping read-only section", () => {
  const source = readFileSync(diagnosticsPath, "utf8");

  expect(source).toContain(
    'section_id: "minimal_replay_with_signal_package_ping"',
  );
  expect(source).toContain('title: "Minimal Replay With Signal Package Ping"');
  expect(source).toContain("buildAction308MinimalReplayWithSignalPackagePing");
  expect(source).toContain("route_build_marker");
  expect(source).toContain("Execute route present");
  expect(source).toContain("Replay executed");
});
