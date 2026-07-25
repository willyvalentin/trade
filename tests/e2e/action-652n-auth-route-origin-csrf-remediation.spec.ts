import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { POST as logout } from "../../app/api/auth/logout/route";
import {
  authenticationOriginFailureResponse,
  evaluateApplicationAuthenticationOrigin,
} from "../../lib/application-mutation-guard-core";

const repositoryRoot = path.resolve(__dirname, "../..");
const productionOrigin = "https://trade.valentinlabs.com";

const productionEnvironment = {
  NODE_ENV: "production",
  CONTEXT: "production",
  TURE_APPLICATION_ORIGIN: productionOrigin,
};

function request(origin: string | undefined, url = `${productionOrigin}/api/auth/login`) {
  return new Request(url, {
    method: "POST",
    headers: origin === undefined ? undefined : { origin },
  });
}

async function source(relativePath: string) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("authentication origin guard has one strict production contract", async () => {
  expect(
    evaluateApplicationAuthenticationOrigin(request(productionOrigin), productionEnvironment),
  ).toEqual({ status: "allowed", category: "allowed" });

  for (const origin of [undefined, "null", "https://trade.valentinlabs.com/", "https://trade.valentinlabs.com/path", "https://trade.valentinlabs.com, https://example.invalid"]) {
    const result = evaluateApplicationAuthenticationOrigin(request(origin), productionEnvironment);
    expect(result.status).toBe("forbidden");
    expect(result).not.toMatchObject({ category: "allowed" });
  }

  for (const origin of [
    "http://trade.valentinlabs.com",
    "https://example.invalid",
    "https://trade.valentinlabs.com:444",
  ]) {
    expect(
      evaluateApplicationAuthenticationOrigin(request(origin), productionEnvironment),
    ).toEqual({ status: "forbidden", category: "origin_mismatch" });
  }

  expect(
    evaluateApplicationAuthenticationOrigin(request(productionOrigin), {
      NODE_ENV: "production",
      CONTEXT: "production",
    }),
  ).toEqual({ status: "unavailable", category: "origin_configuration_unavailable" });

  for (const context of ["deploy-preview", "branch-deploy", undefined]) {
    expect(
      evaluateApplicationAuthenticationOrigin(request(productionOrigin), {
        ...productionEnvironment,
        CONTEXT: context,
      }),
    ).toEqual({ status: "forbidden", category: "non_production_context_denied" });
  }

  const failure = authenticationOriginFailureResponse(
    request("https://example.invalid"),
    productionEnvironment,
  );
  expect(failure?.status).toBe(403);
  expect(await failure?.json()).toEqual({
    error: "Application authentication origin is not permitted.",
    code: "application_authentication_origin_invalid",
    origin_category: "origin_mismatch",
  });
  expect(await source("lib/application-mutation-guard-core.ts")).not.toMatch(
    /console\.(?:log|info|warn|error)/,
  );
});

test("local authentication origin validation permits only the request origin", () => {
  const localEnvironment = { NODE_ENV: "development" };
  expect(
    evaluateApplicationAuthenticationOrigin(
      request("http://localhost:3000", "http://localhost:3000/api/auth/login"),
      localEnvironment,
    ),
  ).toEqual({ status: "allowed", category: "allowed" });
  expect(
    evaluateApplicationAuthenticationOrigin(
      request("http://localhost:3001", "http://localhost:3000/api/auth/login"),
      localEnvironment,
    ),
  ).toEqual({ status: "forbidden", category: "origin_mismatch" });
});

test("logout rejects cross-origin requests before cookie mutation and remains idempotent on same origin", async () => {
  const rejected = await logout(
    request("https://example.invalid", "http://localhost:3000/api/auth/logout"),
  );
  expect(rejected.status).toBe(403);
  expect(rejected.headers.get("content-type")).toContain("application/json");
  expect(rejected.headers.get("set-cookie")).toBeNull();
  await expect(rejected.json()).resolves.toMatchObject({
    code: "application_authentication_origin_invalid",
  });

  const missing = await logout(request(undefined, "http://localhost:3000/api/auth/logout"));
  expect(missing.status).toBe(403);
  expect(missing.headers.get("set-cookie")).toBeNull();

  const allowed = await logout(request("http://localhost:3000", "http://localhost:3000/api/auth/logout"));
  expect(allowed.status).toBe(200);
  expect(allowed.headers.get("content-type")).toContain("application/json");
  expect(allowed.headers.get("set-cookie")).toContain("Max-Age=0");
  await expect(allowed.json()).resolves.toEqual({ ok: true });
});

test("auth routes retain proxy session exemption but guard mutations before login work", async () => {
  const loginRoute = await source("app/api/auth/login/route.ts");
  const logoutRoute = await source("app/api/auth/logout/route.ts");
  const proxy = await source("proxy.ts");

  const originGuard = loginRoute.indexOf("authenticationOriginFailureResponse(request)");
  expect(originGuard).toBeGreaterThan(-1);
  expect(originGuard).toBeLessThan(loginRoute.indexOf("reserveSharedLoginAttempt(request)"));
  expect(originGuard).toBeLessThan(loginRoute.indexOf("passwordsMatch(appPassword"));
  expect(logoutRoute).toContain("authenticationOriginFailureResponse(request)");
  expect(logoutRoute).not.toMatch(/export\s+(?:async\s+)?function\s+GET/);
  expect(proxy).toContain('pathname === "/api/auth/login"');
  expect(proxy).toContain('pathname === "/api/auth/logout"');
});
