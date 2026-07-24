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
