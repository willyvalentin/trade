import { expect, test } from "@playwright/test";

import {
  evaluateApplicationAuthenticationOrigin,
  evaluateApplicationMutationOrigin,
  evaluateApplicationProductionOrigin,
} from "../../lib/application-mutation-guard-core";
import { applicationCanonicalProductionOrigin } from "../../lib/application-platform-contract";

const canonical = applicationCanonicalProductionOrigin;

function productionEnvironment(overrides: Record<string, string | undefined> = {}) {
  return {
    NODE_ENV: "production",
    TURE_APPLICATION_ORIGIN: canonical,
    URL: canonical,
    ...overrides,
  };
}

function request(origin = canonical, url = `${canonical}/api/auth/login`) {
  return new Request(url, { method: "POST", headers: { origin } });
}

test("production identity requires canonical configured, runtime, and request origins", () => {
  expect(evaluateApplicationProductionOrigin({
    requestOrigin: canonical,
    configuredApplicationOrigin: canonical,
    runtimeApplicationUrl: canonical,
  })).toMatchObject({ status: "allowed", reason: "allowed" });

  const cases = [
    ["runtime_missing", undefined, "runtime_url_missing"],
    ["runtime_malformed", "not-a-url", "runtime_url_malformed"],
    ["runtime_default_domain", "https://trade-vl.netlify.app", "runtime_url_mismatch"],
    ["runtime_preview_domain", "https://deploy-preview-46--trade-vl.netlify.app", "runtime_url_mismatch"],
  ] as const;
  for (const [, runtimeApplicationUrl, reason] of cases) {
    expect(evaluateApplicationProductionOrigin({
      requestOrigin: canonical,
      configuredApplicationOrigin: canonical,
      runtimeApplicationUrl,
    })).toMatchObject({ status: "forbidden", reason });
  }
});

test("origin normalization is strict about authority but ignores safe URL decoration", () => {
  for (const decorated of [
    `${canonical}/`,
    `${canonical}/path?source=test#fragment`,
    "https://TRADE.VALENTINLABS.COM/path",
  ]) {
    expect(evaluateApplicationProductionOrigin({
      requestOrigin: decorated,
      configuredApplicationOrigin: `${canonical}/configured?ignored=yes`,
      runtimeApplicationUrl: `${canonical}/runtime#ignored`,
    })).toMatchObject({ status: "allowed", reason: "allowed" });
  }

  for (const requestOrigin of [undefined, "null", "https://trade.valentinlabs.com:444", "http://trade.valentinlabs.com"]) {
    const result = evaluateApplicationProductionOrigin({
      requestOrigin: requestOrigin ?? null,
      configuredApplicationOrigin: canonical,
      runtimeApplicationUrl: canonical,
    });
    expect(result.status).toBe("forbidden");
  }
});

test("missing or malformed configured origin fails unavailable and CONTEXT cannot authorize runtime", () => {
  for (const configuredApplicationOrigin of [undefined, "", "http://trade.valentinlabs.com", "not-a-url"]) {
    expect(evaluateApplicationProductionOrigin({
      requestOrigin: canonical,
      configuredApplicationOrigin,
      runtimeApplicationUrl: canonical,
    }).status).toBe("unavailable");
  }

  expect(evaluateApplicationAuthenticationOrigin(
    request(),
    productionEnvironment({ CONTEXT: "production", URL: "https://trade-vl.netlify.app" }),
  )).toEqual({ status: "forbidden", category: "runtime_url_mismatch" });
  expect(evaluateApplicationAuthenticationOrigin(
    request(),
    productionEnvironment({ CONTEXT: undefined }),
  )).toEqual({ status: "allowed", category: "allowed" });
});

test("logout and protected mutations share the canonical runtime guard", () => {
  const mutation = new Request(`${canonical}/api/app/settings`, {
    method: "POST",
    headers: { origin: canonical },
  });
  expect(evaluateApplicationMutationOrigin(mutation, productionEnvironment())).toEqual({ status: "allowed" });
  expect(evaluateApplicationMutationOrigin(
    mutation,
    productionEnvironment({ URL: "https://trade-vl.netlify.app" }),
  )).toEqual({
    status: "forbidden",
    code: "application_mutation_deploy_context_forbidden",
  });
});
