import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";

import {
  applicationSessionMaxAgeSeconds,
  createApplicationSession,
  TRADE_AUTH_COOKIE,
  verifyApplicationSession,
} from "../../lib/application-session-core";
import { proxy } from "../../proxy";
import {
  applicationOriginReadiness,
  evaluateApplicationMutationOrigin,
} from "../../lib/application-mutation-guard-core";

const repositoryRoot = path.resolve(__dirname, "../..");

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

async function withPassword<T>(callback: () => Promise<T>) {
  const previous = process.env.TRADE_APP_PASSWORD;
  process.env.TRADE_APP_PASSWORD = "action-652-test-password";

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

test("signed application sessions are bounded, opaque, and fail closed", async () => {
  await withPassword(async () => {
    const issuedAt = new Date("2026-07-24T12:00:00.000Z");
    const session = await createApplicationSession(issuedAt);

    expect(session).not.toBeNull();
    expect(session).not.toContain(process.env.TRADE_APP_PASSWORD!);
    await expect(
      verifyApplicationSession(session!, new Date("2026-07-24T19:59:59.000Z")),
    ).resolves.toMatchObject({ status: "authenticated" });
    await expect(
      verifyApplicationSession(
        session!,
        new Date(issuedAt.getTime() + applicationSessionMaxAgeSeconds * 1000),
      ),
    ).resolves.toMatchObject({ status: "expired" });
    await expect(verifyApplicationSession("not-a-session")).resolves.toMatchObject({
      status: "malformed",
    });
  });
});

test("login and logout routes use the bounded HttpOnly session contract", async () => {
  const loginRoute = await source("app/api/auth/login/route.ts");
  const logoutRoute = await source("app/api/auth/logout/route.ts");
  const sessionCore = await source("lib/application-session-core.ts");

  expect(loginRoute).toContain("createApplicationSession()");
  expect(loginRoute).toContain("applicationSessionCookieOptions()");
  expect(loginRoute).toContain("name: TRADE_AUTH_COOKIE");
  expect(loginRoute).not.toContain("password: body.password");
  expect(logoutRoute).toContain("applicationSessionCookieOptions()");
  expect(logoutRoute).toContain("maxAge: 0");
  expect(sessionCore).toContain("httpOnly: true");
  expect(sessionCore).toContain('sameSite: "lax"');
  expect(sessionCore).toContain("maxAge: applicationSessionMaxAgeSeconds");
});

test("login route delegates abuse control and never logs password material", async () => {
  const loginRoute = await source("app/api/auth/login/route.ts");

  expect(loginRoute).toContain("reserveSharedLoginAttempt(request)");
  expect(loginRoute).toContain("finalizeSharedLoginSuccess(admission.identity_digest)");
  expect(loginRoute).toContain('code: "login_rate_limited"');
  expect(loginRoute).toContain('"Retry-After"');
  expect(loginRoute).not.toMatch(
    /console\.(?:log|info|warn|error)\([^)]*password[\s\S]*?\)/,
  );
});

test("application mutation origin policy permits same origin and rejects absent or cross origin", () => {
  const sameOrigin = new Request("http://localhost/api/app/settings", {
    method: "POST",
    headers: { origin: "http://localhost" },
  });
  const crossOrigin = new Request("http://localhost/api/app/settings", {
    method: "POST",
    headers: { origin: "https://example.invalid" },
  });
  const missingOrigin = new Request("http://localhost/api/app/settings", { method: "POST" });
  const readOnly = new Request("http://localhost/api/app/settings", { method: "GET" });

  expect(evaluateApplicationMutationOrigin(sameOrigin)).toEqual({ status: "allowed" });
  expect(evaluateApplicationMutationOrigin(crossOrigin)).toMatchObject({ status: "forbidden" });
  expect(evaluateApplicationMutationOrigin(missingOrigin)).toMatchObject({ status: "forbidden" });
  expect(evaluateApplicationMutationOrigin(readOnly)).toEqual({ status: "allowed" });
});

test("Proxy applies the centralized mutation policy after session authentication", async () => {
  await withPassword(async () => {
    const session = await createApplicationSession();
    const authenticatedHeaders = {
      cookie: `${TRADE_AUTH_COOKIE}=${session}`,
      origin: "http://localhost",
    };
    const allowed = await proxy(
      new NextRequest("http://localhost/api/app/settings", {
        method: "POST",
        headers: authenticatedHeaders,
      }),
    );
    const denied = await proxy(
      new NextRequest("http://localhost/api/app/settings", {
        method: "POST",
        headers: { ...authenticatedHeaders, origin: "https://example.invalid" },
      }),
    );

    expect(allowed.status).not.toBe(403);
    expect(denied.status).toBe(403);
    await expect(denied.json()).resolves.toMatchObject({
      code: "application_mutation_origin_invalid",
    });
  });
});

test("production origin contract requires one canonical HTTPS origin", () => {
  const productionEnvironment = { NODE_ENV: "production", CONTEXT: "production" };
  expect(applicationOriginReadiness(undefined, productionEnvironment)).toEqual({
    configured: false,
    valid: false,
    expected_host_match: false,
  });
  expect(
    evaluateApplicationMutationOrigin(
      new Request("https://trade.example/api/app/settings", {
      method: "POST",
      headers: { origin: "https://trade.example" },
      }),
      productionEnvironment,
    ),
  ).toMatchObject({ status: "unavailable" });

  const configuredEnvironment = {
    ...productionEnvironment,
    TURE_APPLICATION_ORIGIN: "https://trade.example",
  };
  expect(
    applicationOriginReadiness(
      new Request("https://trade.example/api/app/settings"),
      configuredEnvironment,
    ),
  ).toEqual({ configured: true, valid: true, expected_host_match: true });
  expect(
    applicationOriginReadiness(
      new Request("https://spoof.example/api/app/settings"),
      configuredEnvironment,
    ),
  ).toEqual({ configured: true, valid: true, expected_host_match: false });

  expect(
    applicationOriginReadiness(undefined, {
      ...productionEnvironment,
      TURE_APPLICATION_ORIGIN: "https://trade.example/path",
    }),
  ).toEqual({ configured: true, valid: false, expected_host_match: false });
});

test("Proxy redirects protected pages and returns JSON 401 for protected APIs", async () => {
  await withPassword(async () => {
    const pageResponse = await proxy(new NextRequest("http://localhost/settings"));
    const apiResponse = await proxy(
      new NextRequest("http://localhost/api/symbol-metadata", { method: "POST" }),
    );
    const loginResponse = await proxy(new NextRequest("http://localhost/login"));
    const staticAssetResponse = await proxy(
      new NextRequest("http://localhost/_next/static/chunk.js"),
    );

    expect(pageResponse.status).toBe(307);
    expect(pageResponse.headers.get("location")).toContain("/login");
    expect(apiResponse.status).toBe(401);
    expect(apiResponse.headers.get("content-type")).toContain("application/json");
    expect(loginResponse.status).not.toBe(401);
    expect(staticAssetResponse.status).not.toBe(401);
  });
});

test("automation routes remain outside application-session authorization", async () => {
  await withPassword(async () => {
    const response = await proxy(
      new NextRequest("http://localhost/api/automation/run-scan", { method: "POST" }),
    );

    expect(response.status).not.toBe(401);
  });
});

test("authenticated server data routes are blocked by Proxy before reaching data access", async () => {
  const response = await proxy(
    new NextRequest("http://localhost/api/app/dashboard"),
  );
  const body = (await response.json()) as { code?: string };

  expect(response.status).toBe(401);
  expect(body.code).toBe("application_session_required");
});
