import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AVANZA_LOCAL_BRIDGE_READONLY_ENDPOINTS,
  fetchAvanzaLocalBridgeReadonlyEndpoint,
  fetchAvanzaLocalBridgeReadonlyStatus,
  isAvanzaLocalBridgeReadonlyEndpointPath,
  isAvanzaLocalBridgeReadonlyStatusEnabled,
  resolveAvanzaLocalBridgeReadonlyEndpointPath,
  type AvanzaLocalBridgeReadonlyEndpoint,
} from "../../lib/avanza-local-bridge-readonly-fetcher";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

test.describe("Avanza local bridge read-only fetcher", () => {
  test("feature flag is disabled unless explicitly true", () => {
    expect(isAvanzaLocalBridgeReadonlyStatusEnabled({})).toBe(false);
    expect(
      isAvanzaLocalBridgeReadonlyStatusEnabled({
        NEXT_PUBLIC_AVANZA_BRIDGE_READONLY_STATUS_ENABLED: "false",
      }),
    ).toBe(false);
    expect(
      isAvanzaLocalBridgeReadonlyStatusEnabled({
        NEXT_PUBLIC_AVANZA_BRIDGE_READONLY_STATUS_ENABLED: "true",
      }),
    ).toBe(true);
  });

  test("allowlists only the three read-only GET endpoint paths", () => {
    expect(resolveAvanzaLocalBridgeReadonlyEndpointPath("health")).toBe(
      "/health",
    );
    expect(resolveAvanzaLocalBridgeReadonlyEndpointPath("selfCheck")).toBe(
      "/self-check",
    );
    expect(
      resolveAvanzaLocalBridgeReadonlyEndpointPath("preflightOrderForm"),
    ).toBe("/preflight/avanza-order-form");
    expect(isAvanzaLocalBridgeReadonlyEndpointPath("/health")).toBe(true);
    expect(
      isAvanzaLocalBridgeReadonlyEndpointPath("/preflight/avanza-order-form"),
    ).toBe(true);
    expect(
      isAvanzaLocalBridgeReadonlyEndpointPath(
        "/live-fill-only-runner/run-approved-quantity-based-fill-only-trigger",
      ),
    ).toBe(false);
    expect(isAvanzaLocalBridgeReadonlyEndpointPath("fillQuantityField")).toBe(
      false,
    );
    expect(() =>
      resolveAvanzaLocalBridgeReadonlyEndpointPath(
        "liveTrigger" as AvanzaLocalBridgeReadonlyEndpoint,
      ),
    ).toThrow("readonly_bridge_endpoint_not_allowed");
  });

  test("disabled feature flag returns not_configured without fetching", async () => {
    let calls = 0;
    const result = await fetchAvanzaLocalBridgeReadonlyStatus({
      enabled: false,
      fetchImpl: async () => {
        calls += 1;
        return jsonResponse({});
      },
    });

    expect(calls).toBe(0);
    expect(result.configured).toBe(false);
    expect(result.summary.status).toBe("not_configured");
    expect(result.endpoints.health).toBeNull();
  });

  test("fetches allowed endpoints with GET, no credentials, no body", async () => {
    const calls: Array<{ input: string | URL; init?: RequestInit }> = [];
    const result = await fetchAvanzaLocalBridgeReadonlyEndpoint({
      enabled: true,
      endpoint: "health",
      fetchImpl: async (input, init) => {
        calls.push({ input, init });
        return jsonResponse({
          bridgeStatus: "available",
          health: { status: "available" },
        });
      },
    });

    expect(result.ok).toBe(true);
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(result.path).toBe(AVANZA_LOCAL_BRIDGE_READONLY_ENDPOINTS.health);
    expect(calls).toHaveLength(1);
    expect(String(calls[0].input)).toBe("http://127.0.0.1:47831/health");
    expect(calls[0].init).toMatchObject({
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
    });
    expect(calls[0].init).not.toHaveProperty("body");
  });

  test("network errors map safely without leaking credentials or storage", async () => {
    const result = await fetchAvanzaLocalBridgeReadonlyEndpoint({
      enabled: true,
      endpoint: "selfCheck",
      fetchImpl: async () => {
        throw new Error("connect ECONNREFUSED 127.0.0.1:47831");
      },
    });

    expect(result.ok).toBe(false);
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(result.error).toContain("ECONNREFUSED");
    expect(result.response).toBeNull();
  });

  test("timeouts map safely", async () => {
    const result = await fetchAvanzaLocalBridgeReadonlyEndpoint({
      enabled: true,
      endpoint: "preflightOrderForm",
      timeoutMs: 1,
      fetchImpl: async (_input, init) =>
        new Promise((resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
          setTimeout(() => resolve(jsonResponse({ ok: true, status: "ready" })), 50);
        }),
    });

    expect(result.ok).toBe(false);
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(result.timedOut).toBe(true);
    expect(result.error).toBe("request_timeout");
  });

  test("combined status maps allowed responses through the pure adapter", async () => {
    const result = await fetchAvanzaLocalBridgeReadonlyStatus({
      enabled: true,
      fetchImpl: async (input) => {
        const url = String(input);

        if (url.endsWith("/health")) {
          return jsonResponse({
            bridgeStatus: "available",
            health: { status: "available" },
          });
        }

        if (url.endsWith("/self-check")) {
          return jsonResponse({ ok: false, selfCheck: { status: "unavailable" } });
        }

        return jsonResponse({ ok: true, status: "ready", preflight: { status: "ready" } });
      },
    });

    expect(result.ok).toBe(true);
    expect(result.completedAt).toBeTruthy();
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(result.summary.status).toBe("preflight_ready");
    expect(result.source.healthResponse).toBeTruthy();
    expect(result.source.preflightResponse).toBeTruthy();
  });

  test("source contains no live trigger, fill, POST, credentials, or storage handling", () => {
    const source = readRepoFile("lib/avanza-local-bridge-readonly-fetcher.ts");

    expect(source).toContain("fetchAvanzaLocalBridgeReadonlyStatus");
    expect(source).toContain('"GET"');
    expect(source).toContain('credentials: "omit"');
    expect(source).not.toContain('"POST"');
    expect(source).not.toMatch(/run-approved-quantity-based-fill-only-trigger/);
    expect(source).not.toMatch(/fillAmountField|fillQuantityField|fillPriceField/);
    expect(source).not.toMatch(/Granska köp|Bekräfta köp\/sälj/);
    expect(source).not.toMatch(/document\.cookie|localStorage|sessionStorage/);
    expect(source).not.toMatch(/supabase/i);
  });
});
