import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";

import { POST as login } from "../../app/api/auth/login/route";
import { POST as logout } from "../../app/api/auth/logout/route";
import {
  applicationSessionMaxAgeSeconds,
  createApplicationSession,
  TRADE_AUTH_COOKIE,
  verifyApplicationSession,
} from "../../lib/application-session-core";
import { proxy } from "../../proxy";
import {
  resetDevelopmentLoginAbuseControlForTests,
} from "../../lib/server/application-login-abuse-control";
import {
  applicationOriginReadiness,
  evaluateApplicationMutationOrigin,
} from "../../lib/application-mutation-guard-core";

async function withPassword<T>(callback: () => Promise<T>) {
  const previous = process.env.TRADE_APP_PASSWORD;
  process.env.TRADE_APP_PASSWORD = "action-652-test-password";

  try {
    resetDevelopmentLoginAbuseControlForTests();
    return await callback();
  } finally {
    resetDevelopmentLoginAbuseControlForTests();
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

test("login and logout set bounded HttpOnly session cookies", async () => {
  await withPassword(async () => {
    const loginResponse = await login(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: "action-652-test-password" }),
      }),
    );
    const cookie = loginResponse.headers.get("set-cookie") ?? "";

    expect(loginResponse.status).toBe(200);
    expect(cookie).toContain(`${TRADE_AUTH_COOKIE}=`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=lax");
    expect(cookie).toContain(`Max-Age=${applicationSessionMaxAgeSeconds}`);
    expect(cookie).not.toContain("action-652-test-password");

    const logoutResponse = await logout();
    expect(logoutResponse.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});

test("login rate limits failed attempts and does not log password material", async () => {
  await withPassword(async () => {
    const request = () =>
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json", "x-real-ip": "203.0.113.20" },
        body: JSON.stringify({ password: "wrong-password" }),
      });

    for (let index = 0; index < 5; index += 1) {
      expect((await login(request())).status).toBe(401);
    }
    const limited = await login(request());
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
    expect(await limited.text()).not.toContain("wrong-password");
  });
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
  const previousNodeEnv = process.env.NODE_ENV;
  const previousOrigin = process.env.TURE_APPLICATION_ORIGIN;
  process.env.NODE_ENV = "production";

  try {
    delete process.env.TURE_APPLICATION_ORIGIN;
    expect(applicationOriginReadiness()).toEqual({ configured: false, valid: false, expected_host_match: false });
    expect(evaluateApplicationMutationOrigin(new Request("https://trade.example/api/app/settings", {
      method: "POST",
      headers: { origin: "https://trade.example" },
    }))).toMatchObject({ status: "unavailable" });

    process.env.TURE_APPLICATION_ORIGIN = "https://trade.example";
    expect(applicationOriginReadiness(new Request("https://trade.example/api/app/settings"))).toEqual({ configured: true, valid: true, expected_host_match: true });
    expect(applicationOriginReadiness(new Request("https://spoof.example/api/app/settings"))).toEqual({ configured: true, valid: true, expected_host_match: false });

    process.env.TURE_APPLICATION_ORIGIN = "https://trade.example/path";
    expect(applicationOriginReadiness()).toEqual({ configured: true, valid: false, expected_host_match: false });
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousOrigin === undefined) delete process.env.TURE_APPLICATION_ORIGIN;
    else process.env.TURE_APPLICATION_ORIGIN = previousOrigin;
  }
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
