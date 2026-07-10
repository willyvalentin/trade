import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";

import { GET as hb307cPingGET } from "../../app/api/hb307c/ping/route";
import { GET as candlePersistenceReadbackPingGET } from "../../app/api/historical-backfill/first-tiny-candle-persistence-readback/ping/route";
import { GET as replayDryRunPingGET } from "../../app/api/historical-backfill/first-tiny-replay-dry-run/ping/route";
import { GET as replayWithSignalPackageDryRunPingGET } from "../../app/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping/route";
import { GET as signalReplayDryRunPingGET } from "../../app/api/historical-backfill/first-tiny-signal-replay-dry-run/ping/route";
import { GET as signalPackageDiscoveryReadbackPingGET } from "../../app/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping/route";
import { POST as signalPackageDiscoveryReadbackPOST } from "../../app/api/historical-backfill/first-tiny-signal-package-discovery-readback/route";
import { GET as routePublicationDiagnosticGET } from "../../app/api/route-publication-diagnostic/route";
import { action307dKnownWorkingRouteBoundaryDiagnosticMarker } from "../../lib/action-307d-known-working-route-boundary-diagnostic";
import { proxy, GLOBAL_API_BOUNDARY_MARKER } from "../../proxy";

const docPath = join(
  process.cwd(),
  "docs/action-307e-global-api-boundary-regression-diagnostic-fix.md",
);

const noEffectExpectations = {
  provider_call_executed: false,
  replay_executed: false,
  synthetic_outcomes_persisted: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  supabase_write_executed: false,
};

async function proxyRequest(path: string, method = "GET") {
  return proxy(
    new NextRequest(`http://localhost${path}`, {
      method,
    }),
  );
}

async function withEnv<T>(
  env: Record<string, string | undefined>,
  callback: () => Promise<T>,
) {
  const previous = Object.fromEntries(
    Object.keys(env).map((key) => [key, process.env[key]]),
  );

  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return await callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

async function signalPackageAuthCheckOnly() {
  return withEnv({ AUTOMATION_SECRET: "route-secret" }, () =>
    signalPackageDiscoveryReadbackPOST(
      new Request(
        "http://localhost/api/historical-backfill/first-tiny-signal-package-discovery-readback",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-automation-secret": "route-secret",
          },
          body: JSON.stringify({ auth_check_only: true }),
        },
      ),
    ),
  );
}

function expectNoEffects(body: Record<string, unknown>) {
  expect(body).toMatchObject(noEffectExpectations);
  expect(body.provider_call_executed).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.synthetic_outcomes_persisted).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(body.live_ranking_changed).toBe(false);
  expect(body.supabase_write_executed).toBe(false);
}

test("runbook documents retest commands and interpretation matrix", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("action_307e_global_api_boundary_regression_fix");
  expect(doc).toContain("first-tiny-signal-package-discovery-readback/ping");
  expect(doc).toContain("first-tiny-replay-dry-run/ping");
  expect(doc).toContain("first-tiny-candle-persistence-readback/ping");
  expect(doc).toContain("first-tiny-replay-with-signal-package-dry-run/ping");
  expect(doc).toContain("first-tiny-signal-replay-dry-run/ping");
  expect(doc).toContain("hb307c/ping");
  expect(doc).toContain("route-publication-diagnostic");
  expect(doc).toContain("Empty HTTP 400 remains");
  expect(doc).not.toContain("apikey");
});

test("proxy pass-through includes known working and Action 307 diagnostic route families", async () => {
  const passThroughPaths = [
    "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
    "/api/historical-backfill/first-tiny-signal-package-discovery-readback",
    "/api/historical-backfill/first-tiny-replay-dry-run/ping",
    "/api/historical-backfill/first-tiny-replay-dry-run",
    "/api/historical-backfill/first-tiny-candle-persistence-readback/ping",
    "/api/historical-backfill/first-tiny-candle-persistence-readback",
    "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping",
    "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run",
    "/api/historical-backfill/first-tiny-signal-replay-dry-run/ping",
    "/api/historical-backfill/first-tiny-signal-replay-dry-run",
    "/api/hb307c/ping",
    "/api/hb307c",
    "/api/route-publication-diagnostic",
  ];

  for (const path of passThroughPaths) {
    const response = await withEnv({ TRADE_APP_PASSWORD: "password" }, () =>
      proxyRequest(path, path.endsWith("/ping") ? "GET" : "POST"),
    );

    expect(response.status, path).not.toBe(401);
    expect(response.headers.get("Cache-Control"), path).not.toBe("no-store");
  }
});

test("proxy pass-through covers future historical-backfill diagnostic subpaths", async () => {
  const response = await withEnv({ TRADE_APP_PASSWORD: "password" }, () =>
    proxyRequest("/api/historical-backfill/future-diagnostic-route/ping"),
  );

  expect(response.status).not.toBe(401);
});

test("unexpected API boundary blocks are JSON diagnostics, not empty responses", async () => {
  const response = await withEnv({ TRADE_APP_PASSWORD: "password" }, () =>
    proxyRequest("/api/symbol-metadata"),
  );
  const text = await response.text();
  const body = JSON.parse(text);

  expect(response.status).toBe(401);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(text.length).toBeGreaterThan(0);
  expect(body.boundary).toBe("proxy");
  expect(body.boundary_marker).toBe(GLOBAL_API_BOUNDARY_MARKER);
  expect(body.reason).toBe("diagnostic_api_route_caught_by_proxy");
  expectNoEffects(body);
});

test("known ping routes return JSON locally with 307d marker and no effects", async () => {
  const responses = await Promise.all([
    signalPackageDiscoveryReadbackPingGET(),
    replayDryRunPingGET(),
    candlePersistenceReadbackPingGET(),
  ]);

  for (const response of responses) {
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.route_ping).toBe(true);
    expect(body.route_boundary_diagnostic_marker).toBe(
      action307dKnownWorkingRouteBoundaryDiagnosticMarker,
    );
    expectNoEffects(body);
  }
});

test("auth_check_only known route returns JSON locally without effects", async () => {
  const response = await signalPackageAuthCheckOnly();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.auth_check_only).toBe(true);
  expect(body.route_boundary_diagnostic_marker).toBe(
    action307dKnownWorkingRouteBoundaryDiagnosticMarker,
  );
  expectNoEffects(body);
});

test("Action 307 and 307C pings return JSON locally without effects", async () => {
  const responses = await Promise.all([
    replayWithSignalPackageDryRunPingGET(),
    signalReplayDryRunPingGET(),
    hb307cPingGET(),
    routePublicationDiagnosticGET(),
  ]);

  for (const response of responses) {
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expectNoEffects(body);
  }
});
