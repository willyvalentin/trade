import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";

import { GET as environmentAuditGET } from "../../app/api/environment-boundary-audit/route";
import { GET as environmentAuditPingGET } from "../../app/api/environment-boundary-audit/ping/route";
import { GET as hb307cPingGET } from "../../app/api/hb307c/ping/route";
import { POST as firstTinyFetchPOST } from "../../app/api/historical-backfill/first-tiny-fetch/route";
import { GET as firstTinyFetchPingGET } from "../../app/api/historical-backfill/first-tiny-fetch/ping/route";
import { GET as firstTinyPayloadRefetchPingGET } from "../../app/api/historical-backfill/first-tiny-candle-payload-refetch/ping/route";
import { GET as firstTinyCandlePersistencePingGET } from "../../app/api/historical-backfill/first-tiny-candle-persistence/ping/route";
import { GET as firstTinyCandlePersistenceReadbackPingGET } from "../../app/api/historical-backfill/first-tiny-candle-persistence-readback/ping/route";
import { GET as firstTinyReplayDryRunPingGET } from "../../app/api/historical-backfill/first-tiny-replay-dry-run/ping/route";
import { GET as firstTinyReplayWithSignalPackageDryRunPingGET } from "../../app/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping/route";
import { GET as firstTinySignalReplayDryRunPingGET } from "../../app/api/historical-backfill/first-tiny-signal-replay-dry-run/ping/route";
import { GET as firstTinySignalPackageDiscoveryReadbackPingGET } from "../../app/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping/route";
import { GET as routePublicationDiagnosticGET } from "../../app/api/route-publication-diagnostic/route";
import { firstTinyFetchRouteExpectedMarker } from "../../lib/environment-boundary-audit";
import { proxy } from "../../proxy";

async function proxyRequest(input: {
  path: string;
  method?: string;
  header?: string | null;
}) {
  const headers = new Headers();
  if (input.header !== undefined && input.header !== null) {
    headers.set("x-automation-secret", input.header);
  }

  return proxy(
    new NextRequest(`http://localhost${input.path}`, {
      method: input.method ?? "GET",
      headers,
    }),
  );
}

async function firstTinyPost(input: {
  secret?: string | null;
  body?: unknown;
}) {
  const headers = new Headers({ "content-type": "application/json" });
  if (input.secret !== undefined && input.secret !== null) {
    headers.set("x-automation-secret", input.secret);
  }

  return firstTinyFetchPOST(
    new Request("http://localhost/api/historical-backfill/first-tiny-fetch", {
      method: "POST",
      headers,
      body: JSON.stringify(input.body ?? {}),
    }),
  );
}

async function withEnv<T>(
  env: Record<string, string | undefined>,
  callback: () => Promise<T>,
) {
  const keys = [
    "TRADE_APP_PASSWORD",
    "AUTOMATION_SECRET",
    "TWELVE_DATA_API_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const previous = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );

  for (const key of keys) {
    if (env[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = env[key];
    }
  }

  try {
    return await callback();
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  }
}

test("proxy unauthorized API response includes safe boundary marker", async () => {
  const response = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () => proxyRequest({ path: "/api/symbol-metadata", method: "GET" }),
  );
  const body = await response.json();

  expect(response.status).toBe(401);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.error).toBe("Unauthorized");
  expect(body.auth_boundary).toBe("middleware");
  expect(body.auth_boundary_marker).toBe(
    "action_276_api_auth_middleware_boundary_audit",
  );
  expect(body.path).toBe("/api/symbol-metadata");
  expect(body.method).toBe("GET");
  expect(body.header_present).toBe(false);
  expect(body.server_secret_present).toBe(true);
  expect(body.diagnostics_safe).toBe(true);
  expect(JSON.stringify(body)).not.toContain("trade-password");
});

test("proxy unauthorized reports automation header presence without values", async () => {
  const secret = "x".repeat(64);
  const response = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/symbol-metadata",
        method: "POST",
        header: secret,
      }),
  );
  const body = await response.json();
  const serialized = JSON.stringify(body);

  expect(response.status).toBe(401);
  expect(body.auth_boundary).toBe("middleware");
  expect(body.header_present).toBe(true);
  expect(serialized).not.toContain(secret);
  expect(serialized).not.toContain("trade-password");
});

test("safe diagnostic routes are not blocked by proxy", async () => {
  const environmentResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () => proxyRequest({ path: "/api/environment-boundary-audit" }),
  );
  const firstTinyResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-fetch",
        method: "POST",
      }),
  );
  const hb307cResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/hb307c",
        method: "POST",
      }),
  );
  const hb307cSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/hb307c/",
        method: "POST",
      }),
  );
  const hb307cPingResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/hb307c/ping",
      }),
  );
  const hb307cPingSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/hb307c/ping/",
      }),
  );
  const routePublicationDiagnosticResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/route-publication-diagnostic",
      }),
  );
  const routePublicationDiagnosticSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/route-publication-diagnostic/",
      }),
  );
  const firstTinyPingResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-fetch/ping",
      }),
  );
  const firstTinyAuditWriteResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-fetch-run-audit-write",
        method: "POST",
      }),
  );
  const firstTinyPayloadRefetchResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-candle-payload-refetch",
        method: "POST",
      }),
  );
  const firstTinyPayloadRefetchSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-candle-payload-refetch/",
        method: "POST",
      }),
  );
  const firstTinyPayloadRefetchPingResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-candle-payload-refetch/ping",
      }),
  );
  const firstTinyCandlePersistenceResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-candle-persistence",
        method: "POST",
      }),
  );
  const firstTinyCandlePersistenceSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-candle-persistence/",
        method: "POST",
      }),
  );
  const firstTinyCandlePersistencePingResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-candle-persistence/ping",
      }),
  );
  const firstTinyCandlePersistenceReadbackResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-candle-persistence-readback",
        method: "POST",
      }),
  );
  const firstTinyCandlePersistenceReadbackSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-candle-persistence-readback/",
        method: "POST",
      }),
  );
  const firstTinyCandlePersistenceReadbackPingResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-candle-persistence-readback/ping",
      }),
  );
  const firstTinyReplayDryRunResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-replay-dry-run",
        method: "POST",
      }),
  );
  const firstTinyReplayDryRunSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-replay-dry-run/",
        method: "POST",
      }),
  );
  const firstTinyReplayDryRunPingResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-replay-dry-run/ping",
      }),
  );
  const firstTinySignalPackageDiscoveryReadbackResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-signal-package-discovery-readback",
        method: "POST",
      }),
  );
  const firstTinySignalPackageDiscoveryReadbackSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-signal-package-discovery-readback/",
        method: "POST",
      }),
  );
  const firstTinySignalPackageDiscoveryReadbackPingResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
      }),
  );
  const firstTinyReplayWithSignalPackageDryRunResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run",
        method: "POST",
      }),
  );
  const firstTinyReplayWithSignalPackageDryRunSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/",
        method: "POST",
      }),
  );
  const firstTinyReplayWithSignalPackageDryRunPingResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping",
      }),
  );
  const firstTinyReplayWithSignalPackageDryRunPingSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping/",
      }),
  );
  const firstTinySignalReplayDryRunResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-signal-replay-dry-run",
        method: "POST",
      }),
  );
  const firstTinySignalReplayDryRunSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-signal-replay-dry-run/",
        method: "POST",
      }),
  );
  const firstTinySignalReplayDryRunPingResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-signal-replay-dry-run/ping",
      }),
  );
  const firstTinySignalReplayDryRunPingSlashResponse = await withEnv(
    { TRADE_APP_PASSWORD: "trade-password" },
    () =>
      proxyRequest({
        path: "/api/historical-backfill/first-tiny-signal-replay-dry-run/ping/",
      }),
  );

  expect(environmentResponse.status).not.toBe(401);
  expect(hb307cResponse.status).not.toBe(401);
  expect(hb307cSlashResponse.status).not.toBe(401);
  expect(hb307cPingResponse.status).not.toBe(401);
  expect(hb307cPingSlashResponse.status).not.toBe(401);
  expect(routePublicationDiagnosticResponse.status).not.toBe(401);
  expect(routePublicationDiagnosticSlashResponse.status).not.toBe(401);
  expect(firstTinyResponse.status).not.toBe(401);
  expect(firstTinyPingResponse.status).not.toBe(401);
  expect(firstTinyAuditWriteResponse.status).not.toBe(401);
  expect(firstTinyPayloadRefetchResponse.status).not.toBe(401);
  expect(firstTinyPayloadRefetchSlashResponse.status).not.toBe(401);
  expect(firstTinyPayloadRefetchPingResponse.status).not.toBe(401);
  expect(firstTinyCandlePersistenceResponse.status).not.toBe(401);
  expect(firstTinyCandlePersistenceSlashResponse.status).not.toBe(401);
  expect(firstTinyCandlePersistencePingResponse.status).not.toBe(401);
  expect(firstTinyCandlePersistenceReadbackResponse.status).not.toBe(401);
  expect(firstTinyCandlePersistenceReadbackSlashResponse.status).not.toBe(401);
  expect(firstTinyCandlePersistenceReadbackPingResponse.status).not.toBe(401);
  expect(firstTinyReplayDryRunResponse.status).not.toBe(401);
  expect(firstTinyReplayDryRunSlashResponse.status).not.toBe(401);
  expect(firstTinyReplayDryRunPingResponse.status).not.toBe(401);
  expect(firstTinySignalPackageDiscoveryReadbackResponse.status).not.toBe(401);
  expect(firstTinySignalPackageDiscoveryReadbackSlashResponse.status).not.toBe(
    401,
  );
  expect(firstTinySignalPackageDiscoveryReadbackPingResponse.status).not.toBe(
    401,
  );
  expect(firstTinyReplayWithSignalPackageDryRunResponse.status).not.toBe(401);
  expect(firstTinyReplayWithSignalPackageDryRunSlashResponse.status).not.toBe(
    401,
  );
  expect(firstTinyReplayWithSignalPackageDryRunPingResponse.status).not.toBe(
    401,
  );
  expect(
    firstTinyReplayWithSignalPackageDryRunPingSlashResponse.status,
  ).not.toBe(401);
  expect(firstTinySignalReplayDryRunResponse.status).not.toBe(401);
  expect(firstTinySignalReplayDryRunSlashResponse.status).not.toBe(401);
  expect(firstTinySignalReplayDryRunPingResponse.status).not.toBe(401);
  expect(firstTinySignalReplayDryRunPingSlashResponse.status).not.toBe(401);
});

test("first tiny ping endpoint is reachable without auth and safe", async () => {
  const response = await firstTinyFetchPingGET();
  const payloadRefetchResponse = await firstTinyPayloadRefetchPingGET();
  const candlePersistenceResponse = await firstTinyCandlePersistencePingGET();
  const candlePersistenceReadbackResponse =
    await firstTinyCandlePersistenceReadbackPingGET();
  const replayDryRunResponse = await firstTinyReplayDryRunPingGET();
  const hb307cPingResponse = await hb307cPingGET();
  const routePublicationDiagnosticResponse =
    await routePublicationDiagnosticGET();
  const replayWithSignalPackageDryRunResponse =
    await firstTinyReplayWithSignalPackageDryRunPingGET();
  const signalReplayDryRunResponse =
    await firstTinySignalReplayDryRunPingGET();
  const signalPackageDiscoveryReadbackResponse =
    await firstTinySignalPackageDiscoveryReadbackPingGET();
  const body = await response.json();
  const payloadRefetchBody = await payloadRefetchResponse.json();
  const candlePersistenceBody = await candlePersistenceResponse.json();
  const candlePersistenceReadbackBody =
    await candlePersistenceReadbackResponse.json();
  const replayDryRunBody = await replayDryRunResponse.json();
  const hb307cPingBody = await hb307cPingResponse.json();
  const routePublicationDiagnosticBody =
    await routePublicationDiagnosticResponse.json();
  const replayWithSignalPackageDryRunBody =
    await replayWithSignalPackageDryRunResponse.json();
  const signalReplayDryRunBody = await signalReplayDryRunResponse.json();
  const signalPackageDiscoveryReadbackBody =
    await signalPackageDiscoveryReadbackResponse.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.route_ping).toBe(true);
  expect(body.route_version).toBe("first_tiny_fetch_ping_v1");
  expect(body.route_build_marker).toBe(firstTinyFetchRouteExpectedMarker);
  expect(body.provider_call_executed).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.raw_response_persisted).toBe(false);
  expect(body.synthetic_outcomes_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(body.live_ranking_changed).toBe(false);
  expect(payloadRefetchResponse.status).toBe(200);
  expect(payloadRefetchResponse.headers.get("Cache-Control")).toBe("no-store");
  expect(payloadRefetchBody.ok).toBe(true);
  expect(payloadRefetchBody.route_ping).toBe(true);
  expect(payloadRefetchBody.provider_call_executed).toBe(false);
  expect(payloadRefetchBody.candles_persisted).toBe(false);
  expect(payloadRefetchBody.raw_response_persisted).toBe(false);
  expect(payloadRefetchBody.fetch_run_persisted).toBe(false);
  expect(payloadRefetchBody.replay_executed).toBe(false);
  expect(payloadRefetchBody.scanner_behavior_changed).toBe(false);
  expect(candlePersistenceResponse.status).toBe(200);
  expect(candlePersistenceResponse.headers.get("Cache-Control")).toBe(
    "no-store",
  );
  expect(candlePersistenceBody.ok).toBe(true);
  expect(candlePersistenceBody.route_ping).toBe(true);
  expect(candlePersistenceBody.provider_call_executed).toBe(false);
  expect(candlePersistenceBody.candles_persisted).toBe(false);
  expect(candlePersistenceBody.raw_response_persisted).toBe(false);
  expect(candlePersistenceBody.fetch_run_persisted).toBe(false);
  expect(candlePersistenceBody.replay_executed).toBe(false);
  expect(candlePersistenceBody.scanner_behavior_changed).toBe(false);
  expect(candlePersistenceReadbackResponse.status).toBe(200);
  expect(candlePersistenceReadbackResponse.headers.get("Cache-Control")).toBe(
    "no-store",
  );
  expect(candlePersistenceReadbackBody.ok).toBe(true);
  expect(candlePersistenceReadbackBody.route_ping).toBe(true);
  expect(candlePersistenceReadbackBody.provider_call_executed).toBe(false);
  expect(candlePersistenceReadbackBody.candles_persisted).toBe(false);
  expect(candlePersistenceReadbackBody.raw_response_persisted).toBe(false);
  expect(candlePersistenceReadbackBody.fetch_run_persisted).toBe(false);
  expect(candlePersistenceReadbackBody.replay_executed).toBe(false);
  expect(candlePersistenceReadbackBody.scanner_behavior_changed).toBe(false);
  expect(replayDryRunResponse.status).toBe(200);
  expect(replayDryRunResponse.headers.get("Cache-Control")).toBe("no-store");
  expect(replayDryRunBody.ok).toBe(true);
  expect(replayDryRunBody.route_ping).toBe(true);
  expect(replayDryRunBody.provider_call_executed).toBe(false);
  expect(replayDryRunBody.candles_persisted).toBe(false);
  expect(replayDryRunBody.raw_response_persisted).toBe(false);
  expect(replayDryRunBody.fetch_run_persisted).toBe(false);
  expect(replayDryRunBody.synthetic_outcomes_persisted).toBe(false);
  expect(replayDryRunBody.replay_executed).toBe(false);
  expect(replayDryRunBody.scanner_behavior_changed).toBe(false);
  expect(replayDryRunBody.live_ranking_changed).toBe(false);
  expect(hb307cPingResponse.status).toBe(200);
  expect(hb307cPingResponse.headers.get("Cache-Control")).toBe("no-store");
  expect(hb307cPingBody.ok).toBe(true);
  expect(hb307cPingBody.route_ping).toBe(true);
  expect(hb307cPingBody.provider_call_executed).toBe(false);
  expect(hb307cPingBody.provider_call_attempted).toBe(false);
  expect(hb307cPingBody.synthetic_outcomes_persisted).toBe(false);
  expect(hb307cPingBody.replay_executed).toBe(false);
  expect(hb307cPingBody.scanner_behavior_changed).toBe(false);
  expect(hb307cPingBody.live_ranking_changed).toBe(false);
  expect(hb307cPingBody.recommendation_rows_mutated).toBe(false);
  expect(hb307cPingBody.supabase_write_executed).toBe(false);
  expect(routePublicationDiagnosticResponse.status).toBe(200);
  expect(
    routePublicationDiagnosticResponse.headers.get("Cache-Control"),
  ).toBe("no-store");
  expect(routePublicationDiagnosticBody.ok).toBe(true);
  expect(routePublicationDiagnosticBody.route_publication_diagnostic).toBe(true);
  expect(routePublicationDiagnosticBody.provider_call_executed).toBe(false);
  expect(routePublicationDiagnosticBody.synthetic_outcomes_persisted).toBe(
    false,
  );
  expect(routePublicationDiagnosticBody.replay_executed).toBe(false);
  expect(routePublicationDiagnosticBody.scanner_behavior_changed).toBe(false);
  expect(routePublicationDiagnosticBody.live_ranking_changed).toBe(false);
  expect(routePublicationDiagnosticBody.recommendation_rows_mutated).toBe(false);
  expect(routePublicationDiagnosticBody.supabase_write_executed).toBe(false);
  expect(replayWithSignalPackageDryRunResponse.status).toBe(200);
  expect(
    replayWithSignalPackageDryRunResponse.headers.get("Cache-Control"),
  ).toBe("no-store");
  expect(replayWithSignalPackageDryRunBody.ok).toBe(true);
  expect(replayWithSignalPackageDryRunBody.route_ping).toBe(true);
  expect(replayWithSignalPackageDryRunBody.provider_call_executed).toBe(false);
  expect(replayWithSignalPackageDryRunBody.synthetic_outcomes_persisted).toBe(
    false,
  );
  expect(replayWithSignalPackageDryRunBody.replay_executed).toBe(false);
  expect(replayWithSignalPackageDryRunBody.scanner_behavior_changed).toBe(
    false,
  );
  expect(replayWithSignalPackageDryRunBody.live_ranking_changed).toBe(false);
  expect(replayWithSignalPackageDryRunBody.recommendation_rows_mutated).toBe(
    false,
  );
  expect(replayWithSignalPackageDryRunBody.supabase_write_executed).toBe(false);
  expect(signalReplayDryRunResponse.status).toBe(200);
  expect(signalReplayDryRunResponse.headers.get("Cache-Control")).toBe(
    "no-store",
  );
  expect(signalReplayDryRunBody.ok).toBe(true);
  expect(signalReplayDryRunBody.route_ping).toBe(true);
  expect(signalReplayDryRunBody.provider_call_executed).toBe(false);
  expect(signalReplayDryRunBody.provider_call_attempted).toBe(false);
  expect(signalReplayDryRunBody.synthetic_outcomes_persisted).toBe(false);
  expect(signalReplayDryRunBody.replay_executed).toBe(false);
  expect(signalReplayDryRunBody.scanner_behavior_changed).toBe(false);
  expect(signalReplayDryRunBody.live_ranking_changed).toBe(false);
  expect(signalReplayDryRunBody.recommendation_rows_mutated).toBe(false);
  expect(signalReplayDryRunBody.supabase_write_executed).toBe(false);
  expect(signalPackageDiscoveryReadbackResponse.status).toBe(200);
  expect(signalPackageDiscoveryReadbackResponse.headers.get("Cache-Control")).toBe(
    "no-store",
  );
  expect(signalPackageDiscoveryReadbackBody.ok).toBe(true);
  expect(signalPackageDiscoveryReadbackBody.route_ping).toBe(true);
  expect(signalPackageDiscoveryReadbackBody.provider_call_executed).toBe(false);
  expect(signalPackageDiscoveryReadbackBody.candles_persisted).toBe(false);
  expect(signalPackageDiscoveryReadbackBody.raw_response_persisted).toBe(false);
  expect(signalPackageDiscoveryReadbackBody.fetch_run_persisted).toBe(false);
  expect(signalPackageDiscoveryReadbackBody.synthetic_outcomes_persisted).toBe(
    false,
  );
  expect(signalPackageDiscoveryReadbackBody.replay_executed).toBe(false);
  expect(signalPackageDiscoveryReadbackBody.scanner_behavior_changed).toBe(
    false,
  );
  expect(signalPackageDiscoveryReadbackBody.live_ranking_changed).toBe(false);
  expect(signalPackageDiscoveryReadbackBody.supabase_write_executed).toBe(false);
});

test("environment audit and ping routes are reachable and no-store", async () => {
  const audit = await withEnv(
    {
      NEXT_PUBLIC_SUPABASE_URL: "https://ekdyopdrrkphlrsilyoo.supabase.co",
      AUTOMATION_SECRET: "a".repeat(64),
      TWELVE_DATA_API_KEY: "twelve-data-secret",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
    },
    () => environmentAuditGET(),
  );
  const ping = await environmentAuditPingGET();
  const auditBody = await audit.json();
  const pingBody = await ping.json();
  const serialized = JSON.stringify(auditBody);

  expect(audit.status).toBe(200);
  expect(audit.headers.get("Cache-Control")).toBe("no-store");
  expect(auditBody.ok).toBe(true);
  expect(auditBody.audit.safety.provider_call_executed).toBe(false);
  expect(auditBody.audit.safety.candles_persisted).toBe(false);
  expect(auditBody.audit.safety.fetch_run_persisted).toBe(false);
  expect(auditBody.audit.safety.replay_executed).toBe(false);
  expect(auditBody.audit.safety.scanner_behavior_changed).toBe(false);
  expect(serialized).not.toContain("twelve-data-secret");
  expect(serialized).not.toContain("service-role-secret");
  expect(ping.status).toBe(200);
  expect(ping.headers.get("Cache-Control")).toBe("no-store");
  expect(pingBody.route_version).toBe("environment_boundary_audit_ping_v1");
  expect(pingBody.raw_response_persisted).toBe(false);
  expect(pingBody.synthetic_outcomes_persisted).toBe(false);
  expect(pingBody.live_ranking_changed).toBe(false);
});

test("first tiny route-handler unauthorized includes boundary marker", async () => {
  const response = await withEnv(
    { AUTOMATION_SECRET: "a".repeat(64) },
    () => firstTinyPost({ body: { execute_provider_call: true } }),
  );
  const body = await response.json();

  expect(response.status).toBe(401);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.error).toBe("Unauthorized.");
  expect(body.auth_boundary).toBe("route_handler");
  expect(body.auth_boundary_marker).toBe(firstTinyFetchRouteExpectedMarker);
  expect(body.auth_diagnostics.header_present).toBe(false);
  expect(body.provider_call_executed).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
});

test("auth_check_only stays no-provider no-persist", async () => {
  const secret = "b".repeat(64);
  const response = await withEnv(
    { AUTOMATION_SECRET: secret },
    () => firstTinyPost({ secret, body: { auth_check_only: true } }),
  );
  const body = await response.json();
  const serialized = JSON.stringify(body);

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.auth_check_only).toBe(true);
  expect(body.route_build_marker).toBe(firstTinyFetchRouteExpectedMarker);
  expect(body.provider_call_executed).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(body.live_ranking_changed).toBe(false);
  expect(serialized).not.toContain(secret);
});

test("normal route validation remains protected after auth", async () => {
  const secret = "c".repeat(64);
  const response = await withEnv(
    { AUTOMATION_SECRET: secret },
    () => firstTinyPost({ secret, body: {} }),
  );
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.error).toBe("execute_provider_call_true_required");
  expect(body.provider_call_executed).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(body.live_ranking_changed).toBe(false);
});
