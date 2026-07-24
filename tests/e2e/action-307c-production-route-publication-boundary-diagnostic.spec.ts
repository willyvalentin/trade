import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";

import { POST as hb307cPOST } from "../../app/api/hb307c/route";
import {
  GET as hb307cPingGET,
  hb307cCanaryRouteBuildMarker,
} from "../../app/api/hb307c/ping/route";
import { GET as routePublicationGET } from "../../app/api/route-publication-diagnostic/route";
import { firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker } from "../../lib/first-tiny-historical-replay-with-signal-package-dry-run-execute";
import { proxy } from "../../proxy";

const docPath = join(
  process.cwd(),
  "docs/action-307c-production-route-publication-boundary-diagnostic.md",
);

async function hb307cPost(input: { secret?: string | null; body?: unknown }) {
  const previousSecret = process.env.AUTOMATION_SECRET;
  process.env.AUTOMATION_SECRET = "route-secret";
  const headers = new Headers({ "content-type": "application/json" });
  if (input.secret !== undefined && input.secret !== null) {
    headers.set("x-automation-secret", input.secret);
  }

  try {
    return await hb307cPOST(
      new Request("http://localhost/api/hb307c", {
        method: "POST",
        headers,
        body: JSON.stringify(input.body ?? {}),
      }),
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

test("troubleshooting doc records production failure and interpretation matrix", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("HTTP `400` with an empty body");
  expect(doc).toContain(
    "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping",
  );
  expect(doc).toContain(
    "/api/historical-backfill/first-tiny-signal-replay-dry-run",
  );
  expect(doc).toContain("/api/hb307c/ping");
  expect(doc).toContain("/api/route-publication-diagnostic");
  expect(doc).toContain("TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false");
  expect(doc).toContain("Action 307D");
  expect(doc).toContain("/api/hb307/replay-signal");
});

test("hb307c ping returns static JSON with no effects", async () => {
  const response = await hb307cPingGET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.route_ping).toBe(true);
  expect(body.route_build_marker).toBe(hb307cCanaryRouteBuildMarker);
  expect(body.purpose).toBe("production_route_publication_boundary_diagnostic");
  expectNoEffects(body);
});

test("hb307c auth_check_only returns JSON with safe auth diagnostics", async () => {
  const response = await hb307cPost({
    secret: "route-secret",
    body: { auth_check_only: true },
  });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.ok).toBe(true);
  expect(body.auth_check_only).toBe(true);
  expect(body.route_build_marker).toBe(hb307cCanaryRouteBuildMarker);
  expect(body.auth_diagnostics.server_secret_present).toBe(true);
  expect(body.auth_diagnostics.header_present).toBe(true);
  expect(body.auth_diagnostics.header_matches).toBe(true);
  expect(body.auth_diagnostics.diagnostics_safe).toBe(true);
  expectNoEffects(body);
});

test("hb307c missing auth returns JSON not empty body", async () => {
  const response = await hb307cPost({
    secret: null,
    body: { auth_check_only: true },
  });
  const body = await response.json();

  expect(response.status).toBe(401);
  expect(body.error).toBe("Unauthorized.");
  expect(body.auth_boundary).toBe("route_handler");
  expect(body.route_build_marker).toBe(hb307cCanaryRouteBuildMarker);
  expect(body.auth_diagnostics.header_present).toBe(false);
  expectNoEffects(body);
});

test("route publication diagnostic lists Action 307 original alias and canary routes", async () => {
  const response = await routePublicationGET();
  const body = await response.json();
  const serialized = JSON.stringify(body);

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.route_publication_diagnostic).toBe(true);
  expect(body.route_build_marker).toBe(
    "action_307c_route_publication_diagnostic",
  );
  expect(serialized).toContain("action_303_discovery_readback_route");
  expect(serialized).toContain("action_307_original_route");
  expect(serialized).toContain("action_307_alias_route");
  expect(serialized).toContain("action_307c_hb307c_canary_route");
  expect(serialized).toContain(
    "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run",
  );
  expect(serialized).toContain(
    "/api/historical-backfill/first-tiny-signal-replay-dry-run",
  );
  expect(serialized).toContain("/api/hb307c/ping");
  expect(serialized).toContain(
    firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker,
  );
  expectNoEffects(body);
});

test("proxy boundary audit includes hb307c and route-publication diagnostic", async () => {
  const paths = [
    ["/api/hb307c", "POST"],
    ["/api/hb307c/", "POST"],
    ["/api/hb307c/ping", "GET"],
    ["/api/hb307c/ping/", "GET"],
    ["/api/route-publication-diagnostic", "GET"],
    ["/api/route-publication-diagnostic/", "GET"],
  ] as const;

  for (const [path, method] of paths) {
    const response = await proxyStatus(path, method);
    expect(response.status, path).not.toBe(401);
  }
});
