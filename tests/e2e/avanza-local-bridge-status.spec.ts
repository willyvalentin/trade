import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  mapAvanzaLocalBridgeHealthResponse,
  mapAvanzaLocalBridgeSelfCheckResponse,
  mapAvanzaLocalBridgeStatus,
  mapAvanzaOrderFormPreflightResponse,
} from "../../lib/avanza-local-bridge-status";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

const healthAvailable = {
  version: "avanza_localhost_bridge_v1",
  bridgeName: "Avanza localhost bridge",
  bridgeStatus: "available",
  transport: "http",
  health: {
    status: "available",
    transport: "http",
    checkedAt: "2026-07-03T10:00:00.000Z",
    message: "available",
  },
  capabilities: {
    transport: "http",
    supportsProgressEvents: false,
    supportsCancellation: false,
    supportsAutomaticSubmit: false,
    supportsManualConfirmationWait: true,
    supportsBrokerResultReturn: false,
    supportsRealBrokerAutomation: false,
    maxConcurrentRuns: 1,
  },
  serverTime: "2026-07-03T10:00:00.000Z",
  message: "Local bridge available",
};

const selfCheckRunnerUnavailable = {
  version: "avanza_localhost_bridge_v1",
  ok: false,
  bridgeVersion: "avanza_localhost_bridge_v1",
  checkedAt: "2026-07-03T10:00:01.000Z",
  selfCheck: {
    status: "unavailable",
    ok: false,
    message: "No browser control by default",
  },
  message: "Runner self-check unavailable",
  errors: ["runner_unavailable"],
  warnings: [],
};

const preflightReady = {
  ok: true,
  status: "ready",
  preflight: {
    status: "ready",
    account_visible: "Valentin Labs KF",
    instrument_visible: "GameStop",
    buy_side_order_form_visible: true,
    order_mode_avancerad_limit_visible: true,
    amount_field_visible: true,
    price_field_visible: true,
    granska_kop_visible_not_clicked: true,
    no_review_modal_open: true,
    no_bekrafta_kop_salj_visible: true,
  },
  message: "Manual browser observation preflight passed.",
};

const preflightBlocked = {
  ok: false,
  status: "blocked",
  preflight: {
    status: "blocked",
    account_visible: false,
    instrument_visible: "GameStop",
  },
  blockers: ["account_not_visible"],
  message: "Manual browser observation preflight did not pass.",
};

test.describe("Avanza local bridge status adapter", () => {
  test("maps health available response into available endpoint status", () => {
    expect(mapAvanzaLocalBridgeHealthResponse(healthAvailable)).toBe("ok");
  });

  test("maps self-check runner unavailable without treating it as a live trigger", () => {
    expect(mapAvanzaLocalBridgeSelfCheckResponse(selfCheckRunnerUnavailable)).toBe(
      "unavailable",
    );

    const summary = mapAvanzaLocalBridgeStatus({
      healthResponse: healthAvailable,
      selfCheckResponse: selfCheckRunnerUnavailable,
      checkedAt: "2026-07-03T10:00:02.000Z",
    });

    expect(summary.status).toBe("self_check_unavailable");
    expect(summary.bridgeAvailable).toBe(true);
    expect(summary.selfCheckAvailable).toBe(false);
    expect(summary.preflightReady).toBe(false);
    expect(summary.blockers).toContain("local_bridge_self_check_unavailable");
  });

  test("maps preflight ready into UI-safe manual observation readiness", () => {
    expect(mapAvanzaOrderFormPreflightResponse(preflightReady)).toBe("ok");

    const summary = mapAvanzaLocalBridgeStatus({
      healthResponse: healthAvailable,
      selfCheckResponse: selfCheckRunnerUnavailable,
      preflightResponse: preflightReady,
    });

    expect(summary.status).toBe("preflight_ready");
    expect(summary.bridgeAvailable).toBe(true);
    expect(summary.manualObservationReady).toBe(true);
    expect(summary.preflightReady).toBe(true);
    expect(summary.safeMessage).toBe("Avanza order-form preflight is ready.");
  });

  test("maps preflight blocked without enabling prepare readiness", () => {
    expect(mapAvanzaOrderFormPreflightResponse(preflightBlocked)).toBe("blocked");

    const summary = mapAvanzaLocalBridgeStatus({
      healthResponse: healthAvailable,
      selfCheckResponse: selfCheckRunnerUnavailable,
      preflightResponse: preflightBlocked,
    });

    expect(summary.status).toBe("preflight_blocked");
    expect(summary.bridgeAvailable).toBe(true);
    expect(summary.manualObservationReady).toBe(false);
    expect(summary.preflightReady).toBe(false);
    expect(summary.blockers).toContain("avanza_order_form_preflight_blocked");
  });

  test("maps bridge network errors to unavailable", () => {
    const summary = mapAvanzaLocalBridgeStatus({
      healthResponse: healthAvailable,
      networkError: new Error("connect ECONNREFUSED 127.0.0.1:47831"),
    });

    expect(summary.status).toBe("unavailable");
    expect(summary.bridgeAvailable).toBe(false);
    expect(summary.preflightReady).toBe(false);
    expect(summary.blockers).toContain("local_bridge_unreachable");
  });

  test("maps disabled configuration to not_configured", () => {
    const summary = mapAvanzaLocalBridgeStatus({
      configured: false,
      healthResponse: healthAvailable,
    });

    expect(summary.status).toBe("not_configured");
    expect(summary.bridgeAvailable).toBe(false);
    expect(summary.manualObservationReady).toBe(false);
    expect(summary.blockers).toContain("local_bridge_not_configured");
  });

  test("adapter is pure read-only mapping and contains no live automation calls", () => {
    const source = readRepoFile("lib/avanza-local-bridge-status.ts");

    expect(source).toContain("mapAvanzaLocalBridgeStatus");
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/XMLHttpRequest|http\.request|https\.request/);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/run-approved-quantity-based-fill-only-trigger/);
    expect(source).not.toMatch(/Granska köp|Bekräfta köp\/sälj/);
    expect(source).not.toMatch(/document\.cookie|localStorage|sessionStorage/);
    expect(source).not.toMatch(/supabase/i);
  });
});
