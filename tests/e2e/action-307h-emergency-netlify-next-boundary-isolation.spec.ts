import { readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";

import { GET as apiPing307hGET } from "../../app/api/ping307h/route";
import { proxy } from "../../proxy";

const pingPagePath = join(process.cwd(), "app/ping307h/page.tsx");
const routePublicationProbePath = join(
  process.cwd(),
  "app/route-publication-probe/page.tsx",
);
const publicProbePath = join(process.cwd(), "app/public-probe-307g/page.tsx");
const runbookPath = join(
  process.cwd(),
  "docs/action-307h-emergency-netlify-next-boundary-isolation.md",
);
const netlifyTomlPath = join(process.cwd(), "netlify.toml");

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

function expectProxyPassThrough(response: Response, path: string) {
  expect(response.status, path).not.toBe(307);
  expect(response.status, path).not.toBe(401);
  expect(response.headers.get("location"), path).toBeNull();
}

function expectNoEffectText(source: string) {
  expect(source).toContain("no provider call");
  expect(source).toContain("no replay");
  expect(source).toContain("no write");
}

test("proxy top-level bypass includes emergency static and API diagnostics", async () => {
  const paths = [
    "/ping307h",
    "/ping307h/",
    "/route-publication-probe",
    "/route-publication-probe/",
    "/public-probe-307g",
    "/public-probe-307g/",
    "/api/ping307h",
    "/api/ping307h/",
    "/api/hb307c/ping",
    "/api/hb307c/ping/",
    "/api/route-publication-diagnostic",
    "/api/route-publication-diagnostic/",
    "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
  ];

  for (const path of paths) {
    const response = await withEnv(
      {
        TRADE_APP_PASSWORD: "trade-password",
        TURE_PUBLIC_DIAGNOSTIC_ROUTES_ENABLED: undefined,
      },
      () => proxyRequest(path, path.startsWith("/api/") ? "POST" : "GET"),
    );

    expectProxyPassThrough(response, path);
  }
});

test("public diagnostic kill switch disables public page bypass but keeps historical API pass-through", async () => {
  const publicPage = await withEnv(
    {
      TRADE_APP_PASSWORD: "trade-password",
      TURE_PUBLIC_DIAGNOSTIC_ROUTES_ENABLED: "false",
    },
    () => proxyRequest("/ping307h"),
  );
  const historicalApi = await withEnv(
    {
      TRADE_APP_PASSWORD: "trade-password",
      TURE_PUBLIC_DIAGNOSTIC_ROUTES_ENABLED: "false",
    },
    () =>
      proxyRequest(
        "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
      ),
  );

  expect(publicPage.status).toBe(307);
  expect(publicPage.headers.get("location")).toBe("http://localhost/login");
  expectProxyPassThrough(
    historicalApi,
    "/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping",
  );
});

test("static page probes contain 307h markers and no-effect text", () => {
  const pingPage = readFileSync(pingPagePath, "utf8");
  const routePublicationProbe = readFileSync(routePublicationProbePath, "utf8");
  const publicProbe = readFileSync(publicProbePath, "utf8");

  expect(pingPage).toContain("action_307h_ping307h_static_page");
  expect(pingPage).toContain("action_307h_emergency_boundary_isolation");
  expect(pingPage).toContain("production static route reachable");
  expect(routePublicationProbe).toContain(
    "action_307h_emergency_boundary_isolation",
  );
  expect(routePublicationProbe).toContain("route/publication probe reachable");
  expect(publicProbe).toContain("action_307h_emergency_boundary_isolation");
  expectNoEffectText(pingPage);
  expectNoEffectText(routePublicationProbe);
  expectNoEffectText(publicProbe);
  expect(routePublicationProbe).toContain("no synthetic outcomes");
  expect(routePublicationProbe).toContain("no scanner/ranking effects");
  expect(publicProbe).toContain("no synthetic outcomes");
  expect(publicProbe).toContain("no scanner/ranking effects");
});

test("api ping307h returns static JSON marker with no effects", async () => {
  const response = await apiPing307hGET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.route_build_marker).toBe("action_307h_api_ping307h");
  expect(body.provider_call_executed).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.synthetic_outcomes_persisted).toBe(false);
  expect(body.supabase_write_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(body.live_ranking_changed).toBe(false);
});

test("netlify config has no broad redirect or API rewrite in repo", () => {
  const netlifyToml = readFileSync(netlifyTomlPath, "utf8");

  expect(netlifyToml).toContain("[functions]");
  expect(netlifyToml).toContain('directory = "netlify/functions"');
  expect(netlifyToml).not.toContain("[[redirects]]");
  expect(netlifyToml).not.toContain("from = \"/*\"");
  expect(netlifyToml).not.toContain("from = \"/api/*\"");
});

test("runbook documents emergency curls and interpretation matrix", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain("curl -i -s https://trade.valentinlabs.com/ping307h");
  expect(runbook).toContain(
    "curl -i -s https://trade.valentinlabs.com/api/ping307h",
  );
  expect(runbook).toContain("action_307h_ping307h_static_page");
  expect(runbook).toContain("action_307h_api_ping307h");
  expect(runbook).toContain("If `/ping307h` works but `/api/ping307h` fails");
  expect(runbook).toContain("Keep all replay approvals false");
  expect(runbook).not.toContain("apikey");
});
