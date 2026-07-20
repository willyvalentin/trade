import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import { GET as candlePersistenceReadbackPingGET } from "../../app/api/historical-backfill/first-tiny-candle-persistence-readback/ping/route";
import { POST as candlePersistenceReadbackPOST } from "../../app/api/historical-backfill/first-tiny-candle-persistence-readback/route";
import { GET as replayDryRunPingGET } from "../../app/api/historical-backfill/first-tiny-replay-dry-run/ping/route";
import { POST as replayDryRunPOST } from "../../app/api/historical-backfill/first-tiny-replay-dry-run/route";
import { GET as signalPackageDiscoveryReadbackPingGET } from "../../app/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping/route";
import { POST as signalPackageDiscoveryReadbackPOST } from "../../app/api/historical-backfill/first-tiny-signal-package-discovery-readback/route";
import {
  action307dEmbeddedRoutePublicationDiagnostic,
  action307dKnownWorkingRouteBoundaryDiagnosticMarker,
} from "../../lib/action-307d-known-working-route-boundary-diagnostic";
import { firstTinyCandlePersistenceReadbackVerificationRouteBuildMarker } from "../../lib/first-tiny-historical-candle-persistence-readback-verification";
import { firstTinyHistoricalReplayDryRunExecuteRouteBuildMarker } from "../../lib/first-tiny-historical-replay-dry-run-execute";
import { firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker } from "../../lib/first-tiny-historical-replay-signal-package-discovery-readback";

const docPath = join(
  process.cwd(),
  "docs/action-307d-known-working-route-boundary-injection-diagnostic.md",
);

const noEffectExpectations = {
  provider_call_executed: false,
  provider_call_attempted: false,
  candles_persisted: false,
  raw_response_persisted: false,
  fetch_run_persisted: false,
  synthetic_outcomes_persisted: false,
  replay_executed: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  recommendation_rows_mutated: false,
  supabase_write_executed: false,
};

function expectAction307dMarker(body: Record<string, unknown>) {
  expect(body.route_boundary_diagnostic_marker).toBe(
    action307dKnownWorkingRouteBoundaryDiagnosticMarker,
  );
  expect(body.deployed_after_307c).toBe(true);
  expect(body.diagnostic_purpose).toBe(
    "known_working_route_deploy_and_boundary_check",
  );
}

function expectNoEffects(body: Record<string, unknown>) {
  expect(body).toMatchObject(noEffectExpectations);
}

async function withAutomationSecret<T>(callback: () => Promise<T>) {
  const previous = process.env.AUTOMATION_SECRET;
  process.env.AUTOMATION_SECRET = "route-secret";

  try {
    return await callback();
  } finally {
    if (previous === undefined) {
      delete process.env.AUTOMATION_SECRET;
    } else {
      process.env.AUTOMATION_SECRET = previous;
    }
  }
}

async function postAuthCheckOnly(
  post: (request: Request) => Promise<Response>,
  path: string,
) {
  return withAutomationSecret(() =>
    post(
      new Request(`http://localhost${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-automation-secret": "route-secret",
        },
        body: JSON.stringify({ auth_check_only: true }),
      }),
    ),
  );
}

test("runbook documents production curls and interpretation matrix", () => {
  const doc = readFileSync(docPath, "utf8");

  expect(doc).toContain("action_307d_known_working_route_boundary_injection");
  expect(doc).toContain("first-tiny-signal-package-discovery-readback/ping");
  expect(doc).toContain("first-tiny-replay-dry-run/ping");
  expect(doc).toContain("first-tiny-candle-persistence-readback/ping");
  expect(doc).toContain("--data '{\"auth_check_only\":true}'");
  expect(doc).toContain("latest deploy reached production");
  expect(doc).toContain("deploy is stale");
  expect(doc).toContain("broader API boundary regression");
  expect(doc).toContain("Action 307E");
  expect(doc).not.toContain("apikey");
});

test("signal-package-discovery-readback ping includes action 307d marker and embedded publication diagnostic", async () => {
  const response = await signalPackageDiscoveryReadbackPingGET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.route_ping).toBe(true);
  expect(body.route_build_marker).toBe(
    firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
  );
  expectAction307dMarker(body);
  expect(body.route_publication_diagnostic_embedded).toEqual(
    action307dEmbeddedRoutePublicationDiagnostic,
  );
  expect(
    body.route_publication_diagnostic_embedded
      .action_307_original_expected_paths,
  ).toContain(
    "/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run",
  );
  expect(
    body.route_publication_diagnostic_embedded
      .action_307_alias_expected_paths,
  ).toContain("/api/historical-backfill/first-tiny-signal-replay-dry-run");
  expect(
    body.route_publication_diagnostic_embedded
      .action_307c_canary_expected_paths,
  ).toContain("/api/hb307c/ping");
  expectNoEffects(body);
});

test("replay-dry-run ping includes action 307d marker without effects", async () => {
  const response = await replayDryRunPingGET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.route_build_marker).toBe(
    firstTinyHistoricalReplayDryRunExecuteRouteBuildMarker,
  );
  expectAction307dMarker(body);
  expectNoEffects(body);
});

test("candle-persistence-readback ping includes action 307d marker without effects", async () => {
  const response = await candlePersistenceReadbackPingGET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.route_build_marker).toBe(
    firstTinyCandlePersistenceReadbackVerificationRouteBuildMarker,
  );
  expectAction307dMarker(body);
  expectNoEffects(body);
});

test("known-working auth_check_only responses include action 307d marker and stay inert", async () => {
  const cases = [
    {
      path: "/api/historical-backfill/first-tiny-signal-package-discovery-readback",
      post: signalPackageDiscoveryReadbackPOST,
      marker: firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
    },
    {
      path: "/api/historical-backfill/first-tiny-replay-dry-run",
      post: replayDryRunPOST,
      marker: firstTinyHistoricalReplayDryRunExecuteRouteBuildMarker,
    },
    {
      path: "/api/historical-backfill/first-tiny-candle-persistence-readback",
      post: candlePersistenceReadbackPOST,
      marker: firstTinyCandlePersistenceReadbackVerificationRouteBuildMarker,
    },
  ];

  for (const item of cases) {
    const response = await postAuthCheckOnly(item.post, item.path);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(body.ok).toBe(true);
    expect(body.auth_check_only).toBe(true);
    expect(body.route_build_marker).toBe(item.marker);
    expectAction307dMarker(body);
    expectNoEffects(body);
  }
});
