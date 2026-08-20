import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";

import { GLOBAL_API_BOUNDARY_MARKER, proxy } from "../../proxy";

const proxyPath = join(process.cwd(), "proxy.ts");
const runbookPath = join(
  process.cwd(),
  "docs/action-307k-proxy-runtime-crash-isolation.md",
);
const originalProxyNotesPath = join(
  process.cwd(),
  "docs/action-307k-proxy-runtime-crash-isolation-original-proxy-notes.md",
);

async function proxyRequest(path: string, method = "GET") {
  return proxy(
    new NextRequest(`http://localhost${path}`, {
      method,
    }),
  );
}

async function expectProxyPassThrough(path: string, method = "GET") {
  const response = await proxyRequest(path, method);

  expect(response.status).not.toBe(401);
  expect(response.headers.get("x-ture-proxy-marker")).toBe(
    GLOBAL_API_BOUNDARY_MARKER,
  );

  return response;
}

async function expectProxyAuthRequired(path: string, method = "GET") {
  const response = await proxyRequest(path, method);

  expect(response.status).toBe(401);
  expect(response.headers.get("x-ture-proxy-marker")).toBe(
    GLOBAL_API_BOUNDARY_MARKER,
  );

  return response;
}

test("proxy.ts imports only next server and closed auth/origin primitives", () => {
  const source = readFileSync(proxyPath, "utf8");
  const imports = source
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("import "));
  const importText = imports.join("\n");

  expect(imports).toEqual([
    'import { NextResponse } from "next/server";',
    'import type { NextRequest } from "next/server";',
    'import { TRADE_AUTH_COOKIE, verifyApplicationSession } from "@/lib/trade-auth";',
    'import { evaluateApplicationMutationOrigin } from "@/lib/application-mutation-guard-core";',
  ]);
  expect(importText).not.toContain("from \"./");
  expect(importText).not.toContain("from \"../");
  expect(importText).not.toContain("supabase");
  expect(importText).not.toContain("Twelve");
  expect(importText).not.toContain("scanner");
  expect(importText).not.toContain("broker");
  expect(importText).not.toContain("execution");
  expect(source).not.toContain("crypto.subtle");
  expect(source).not.toContain("TRADE_APP_PASSWORD");
  expect(source).not.toContain("AUTOMATION_SECRET");
});

test("proxy passes through API diagnostic and historical-backfill families", async () => {
  await expectProxyPassThrough("/api/ping307h");
  await expectProxyPassThrough("/api/hb307c");
  await expectProxyPassThrough("/api/route-publication-diagnostic");
  await expectProxyPassThrough("/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping");
  await expectProxyPassThrough("/api/historical-backfill/future-diagnostic-route/ping");
  await expectProxyAuthRequired("/api/ping307h/");
  await expectProxyAuthRequired("/api/hb307c/ping");
  await expectProxyAuthRequired("/api/symbol-metadata");
});

test("proxy passes through diagnostic page routes", async () => {
  await expectProxyPassThrough("/ping307h");
  await expectProxyPassThrough("/ping307h/");
  await expectProxyPassThrough("/route-publication-probe");
  await expectProxyPassThrough("/route-publication-probe/");
  await expectProxyPassThrough("/public-probe-307g");
  await expectProxyPassThrough("/public-probe-307g/");
});

test("proxy auth boundary has no trading or persistence side-effect flags", async () => {
  const response = await expectProxyAuthRequired("/api/symbol-metadata", "POST");
  const body = await response.text();

  expect(body).not.toContain("provider_call_executed\":true");
  expect(body).not.toContain("supabase_write_executed\":true");
  expect(body).not.toContain("replay_executed\":true");
  expect(body).not.toContain("synthetic_outcomes_persisted\":true");
  expect(body).not.toContain("scanner_behavior_changed\":true");
  expect(body).not.toContain("live_ranking_changed\":true");
});

test("runbook and original proxy notes document the isolation boundary", () => {
  const runbook = readFileSync(runbookPath, "utf8");
  const originalNotes = readFileSync(originalProxyNotesPath, "utf8");

  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/ping307h");
  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/api/ping307h");
  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/api/hb307c/ping");
  expect(runbook).toContain("Netlify Next adapter/runtime output");
  expect(runbook).toContain("no Twelve Data call");
  expect(runbook).toContain("no replay execution");
  expect(originalNotes).toContain("Action 307K replaces `proxy.ts`");
  expect(originalNotes).toContain("action_307g_public_diagnostic_route_auth_boundary_fix");
  expect(originalNotes).not.toContain("apikey");
});
