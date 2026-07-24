import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";

import { GLOBAL_API_BOUNDARY_MARKER, proxy } from "../../proxy";

const routePublicationProbePath = join(
  process.cwd(),
  "app/route-publication-probe/page.tsx",
);
const publicProbePath = join(process.cwd(), "app/public-probe-307g/page.tsx");
const runbookPath = join(
  process.cwd(),
  "docs/action-307g-public-diagnostic-route-auth-boundary-fix.md",
);

async function proxyRequest(path: string, method = "GET") {
  return proxy(
    new NextRequest(`http://localhost${path}`, {
      method,
    }),
  );
}

async function withTradePassword<T>(callback: () => Promise<T>) {
  const previous = process.env.TRADE_APP_PASSWORD;
  process.env.TRADE_APP_PASSWORD = "trade-password";

  try {
    return await callback();
  } finally {
    if (previous === undefined) {
      delete process.env.TRADE_APP_PASSWORD;
    } else {
      process.env.TRADE_APP_PASSWORD = previous;
    }
  }
}

function expectNoEffectText(source: string) {
  expect(source).toContain("no provider call");
  expect(source).toContain("no replay");
  expect(source).toContain("no write");
  expect(source).toContain("no synthetic outcomes");
  expect(source).toContain("no scanner/ranking effects");
}

test("public diagnostic page probes are explicit proxy pass-through paths", async () => {
  const publicationProbe = await withTradePassword(() =>
    proxyRequest("/route-publication-probe"),
  );
  const publicationProbeSlash = await withTradePassword(() =>
    proxyRequest("/route-publication-probe/"),
  );
  const publicProbe = await withTradePassword(() =>
    proxyRequest("/public-probe-307g"),
  );
  const publicProbeSlash = await withTradePassword(() =>
    proxyRequest("/public-probe-307g/"),
  );

  expect(publicationProbe.status).not.toBe(307);
  expect(publicationProbe.headers.get("location")).toBeNull();
  expect(publicationProbeSlash.status).not.toBe(307);
  expect(publicationProbeSlash.headers.get("location")).toBeNull();
  expect(publicProbe.status).not.toBe(307);
  expect(publicProbe.headers.get("location")).toBeNull();
  expect(publicProbeSlash.status).not.toBe(307);
  expect(publicProbeSlash.headers.get("location")).toBeNull();
});

test("diagnostic API routes are explicit proxy pass-through paths", async () => {
  const paths = [
    "/api/hb307c",
    "/api/hb307c/",
    "/api/hb307c/ping",
    "/api/hb307c/ping/",
    "/api/route-publication-diagnostic",
    "/api/route-publication-diagnostic/",
    "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
  ];

  for (const path of paths) {
    const response = await withTradePassword(() =>
      proxyRequest(path, path.includes("/ping") ? "GET" : "POST"),
    );

    expect(response.status, path).not.toBe(401);
    expect(response.headers.get("Cache-Control"), path).not.toBe("no-store");
  }
});

test("public probes contain 307g markers and no-effect text", () => {
  const routePublicationProbe = readFileSync(routePublicationProbePath, "utf8");
  const publicProbe = readFileSync(publicProbePath, "utf8");

  expect(routePublicationProbe).toContain("action_307f_route_publication_probe");
  expect(routePublicationProbe).toContain(
    "action_307g_public_diagnostic_route_auth_boundary_fix",
  );
  expect(publicProbe).toContain("action_307g_public_probe");
  expect(publicProbe).toContain("public diagnostic route");
  expectNoEffectText(routePublicationProbe);
  expectNoEffectText(publicProbe);
});

test("API proxy fallback returns JSON diagnostics, not an empty body", async () => {
  const response = await withTradePassword(() =>
    proxyRequest("/api/symbol-metadata"),
  );
  const text = await response.text();
  const body = JSON.parse(text);

  expect(response.status).toBe(401);
  expect(text.length).toBeGreaterThan(0);
  expect(body.boundary).toBe("proxy");
  expect(body.boundary_marker).toBe(GLOBAL_API_BOUNDARY_MARKER);
  expect(body.reason).toBe("diagnostic_api_route_caught_by_proxy");
  expect(body.provider_call_executed).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.synthetic_outcomes_persisted).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(body.live_ranking_changed).toBe(false);
  expect(body.supabase_write_executed).toBe(false);
});

test("runbook documents public probes and interpretation matrix", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain("/route-publication-probe");
  expect(runbook).toContain("/public-probe-307g");
  expect(runbook).toContain("/api/hb307c/ping");
  expect(runbook).toContain("/api/route-publication-diagnostic");
  expect(runbook).toContain(
    "action_307g_public_diagnostic_route_auth_boundary_fix",
  );
  expect(runbook).toContain("Public page probes still redirect");
  expect(runbook).toContain("API diagnostics return handler JSON");
  expect(runbook).toContain("Keep all replay approvals false");
  expect(runbook).not.toContain("apikey");
});
