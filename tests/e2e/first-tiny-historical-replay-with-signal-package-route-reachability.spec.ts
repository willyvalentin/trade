import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";

import { GET as originalPingGET } from "../../app/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping/route";
import { POST as originalPOST } from "../../app/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/route";
import { GET as aliasPingGET } from "../../app/api/historical-backfill/first-tiny-signal-replay-dry-run/ping/route";
import { POST as aliasPOST } from "../../app/api/historical-backfill/first-tiny-signal-replay-dry-run/route";
import {
  firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker,
  firstTinyReplayWithSignalPackageRouteReachabilityFixMarker,
} from "../../lib/first-tiny-historical-replay-with-signal-package-dry-run-execute";
import { proxy } from "../../proxy";

const docPath = join(
  process.cwd(),
  "docs/first-tiny-historical-replay-with-signal-package-route-reachability-fix.md",
);

async function routePost(input: {
  handler?: typeof originalPOST;
  secret?: string | null;
  body?: unknown;
}) {
  const previousSecret = process.env.AUTOMATION_SECRET;
  process.env.AUTOMATION_SECRET = "route-secret";
  const headers = new Headers({ "content-type": "application/json" });
  if (input.secret !== undefined && input.secret !== null) {
    headers.set("x-automation-secret", input.secret);
  }

  try {
    return await (input.handler ?? originalPOST)(
      new Request(
        "http://localhost/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run",
        {
          method: "POST",
          headers,
          body: JSON.stringify(input.body ?? {}),
        },
      ),
    );
  } finally {
    if (previousSecret === undefined) {
      delete process.env.AUTOMATION_SECRET;
    } else {
      process.env.AUTOMATION_SECRET = previousSecret;
    }
  }
}

async function proxyStatus(path: string, method = "GET") {
  const previous = process.env.TRADE_APP_PASSWORD;
  process.env.TRADE_APP_PASSWORD = "trade-password";
  try {
    return await proxy(new NextRequest(`http://localhost${path}`, { method }));
  } finally {
    if (previous === undefined) {
      delete process.env.TRADE_APP_PASSWORD;
    } else {
      process.env.TRADE_APP_PASSWORD = previous;
    }
  }
}

function expectNoEffects(body: Record<string, unknown>) {
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
}

function expectRouteMarkers(body: Record<string, unknown>) {
  expect(body.route_build_marker).toBe(
    firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker,
  );
  expect(body.route_reachability_fix_marker).toBe(
    firstTinyReplayWithSignalPackageRouteReachabilityFixMarker,
  );
}

test("runbook documents production 400 empty-body reachability fix", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("HTTP `400` with an empty body");
  expect(doc).toContain("before the Next route handler");
  expect(doc).toContain(
    "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping",
  );
  expect(doc).toContain(
    "/api/historical-backfill/first-tiny-signal-replay-dry-run/ping",
  );
  expect(doc).toContain("TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false");
  expect(doc).toContain("auth_check_only");
  expect(doc).toContain("execute_replay_with_signal_package_dry_run");
  expect(doc).toContain(firstTinyReplayWithSignalPackageRouteReachabilityFixMarker);
});

test("original ping route returns JSON with reachability marker and no effects", async () => {
  const response = await originalPingGET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.route_ping).toBe(true);
  expectRouteMarkers(body);
  expectNoEffects(body);
});

test("alias ping route returns the same JSON markers and no effects", async () => {
  const response = await aliasPingGET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.ok).toBe(true);
  expect(body.route_ping).toBe(true);
  expectRouteMarkers(body);
  expectNoEffects(body);
});

test("original auth_check_only returns JSON and never executes replay", async () => {
  const response = await routePost({
    secret: "route-secret",
    body: { auth_check_only: true },
  });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.ok).toBe(true);
  expect(body.auth_check_only).toBe(true);
  expectRouteMarkers(body);
  expect(body.auth_diagnostics.server_secret_present).toBe(true);
  expect(body.auth_diagnostics.header_present).toBe(true);
  expect(body.auth_diagnostics.header_matches).toBe(true);
  expect(body.auth_diagnostics.diagnostics_safe).toBe(true);
  expectNoEffects(body);
});

test("alias auth_check_only returns JSON and never executes replay", async () => {
  const response = await routePost({
    handler: aliasPOST,
    secret: "route-secret",
    body: { auth_check_only: true },
  });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.ok).toBe(true);
  expect(body.auth_check_only).toBe(true);
  expectRouteMarkers(body);
  expectNoEffects(body);
});

test("missing auth is rejected by route handler with JSON body", async () => {
  const response = await routePost({
    secret: null,
    body: { auth_check_only: true },
  });
  const body = await response.json();

  expect(response.status).toBe(401);
  expect(body.error).toBe("Unauthorized.");
  expect(body.auth_boundary).toBe("route_handler");
  expectRouteMarkers(body);
  expect(body.auth_diagnostics.header_present).toBe(false);
  expectNoEffects(body);
});

test("missing execute flag is rejected with JSON body", async () => {
  const response = await routePost({
    secret: "route-secret",
    body: {},
  });
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(body.error).toBe(
    "execute_replay_with_signal_package_dry_run_true_required",
  );
  expectRouteMarkers(body);
  expectNoEffects(body);
});

test("proxy pass-through covers original and alias slash variants", async () => {
  const paths = [
    ["/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run", "POST"],
    ["/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/", "POST"],
    ["/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping", "GET"],
    ["/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping/", "GET"],
    ["/api/historical-backfill/first-tiny-signal-replay-dry-run", "POST"],
    ["/api/historical-backfill/first-tiny-signal-replay-dry-run/", "POST"],
    ["/api/historical-backfill/first-tiny-signal-replay-dry-run/ping", "GET"],
    ["/api/historical-backfill/first-tiny-signal-replay-dry-run/ping/", "GET"],
  ] as const;

  for (const [path, method] of paths) {
    const response = await proxyStatus(path, method);
    expect(response.status, path).not.toBe(401);
  }
});
