import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  createFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyCdpRunner,
  getFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerReadiness,
} from "../../lib/first-real-avanza-fill-only-poc-approved-live-fill-only-cdp-runner";

const repoRoot = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function liveRunnerBridgeSlice() {
  const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");
  const start = source.indexOf("function liveFillOnlyRunnerEnabled");
  const end = source.indexOf("function createReviewClickResult");

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

test.describe("approved live fill-only CDP runner", () => {
  test("is disabled by default", () => {
    const readiness =
      getFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerReadiness({});

    expect(readiness.enabled).toBe(false);
    expect(readiness.status).toBe("disabled");
    expect(readiness.blocked_reasons).toEqual([
      "manual_observation_mode:not_cdp_readonly",
      "live_fill_only_runner:not_enabled",
    ]);
    expect(readiness.safety_confirmations).toMatchObject({
      disabled_by_default: true,
      explicit_env_enablement_required: true,
      no_review_click: true,
      no_final_confirm: true,
      no_submit_or_order_placement: true,
    });
  });

  test("requires both manual observation mode and explicit live-fill flag", () => {
    expect(
      getFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerReadiness({
        AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE: "cdp_readonly",
      }).enabled,
    ).toBe(false);

    expect(
      getFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerReadiness({
        AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER: "true",
      }).enabled,
    ).toBe(false);

    expect(
      getFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyRunnerReadiness({
        AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE: "cdp_readonly",
        AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER: "true",
      }).enabled,
    ).toBe(true);
  });

  test("disabled runner returns blocked results without calling the bridge", () => {
    const runner = createFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyCdpRunner({
      env: {},
    });

    expect(runner.verifyVisibleOrderFormState().ok).toBe(false);
    expect(runner.fillAmountField(427.26).ok).toBe(false);
    expect(runner.fillPriceField(21.98).ok).toBe(false);
    expect(runner.readTotalAmount().ok).toBe(false);
    expect(runner.captureEvidence("test").ok).toBe(false);
    expect(runner.stopBeforeReview().ok).toBe(false);
  });

  test("runner source exposes only approved runner methods and no review/final/submit/order method", () => {
    const source = readRepoFile(
      "lib/first-real-avanza-fill-only-poc-approved-live-fill-only-cdp-runner.ts",
    );

    expect(source).toContain("verifyVisibleOrderFormState");
    expect(source).toContain("fillAmountField");
    expect(source).toContain("fillPriceField");
    expect(source).toContain("readTotalAmount");
    expect(source).toContain("captureEvidence");
    expect(source).toContain("stopBeforeReview");
    expect(source).not.toMatch(
      /clickGranskaKop|openReviewModal|clickBekrafta|clickConfirm|submitOrder|placeOrder|confirmOrder/,
    );
    expect(source).not.toMatch(
      /document\.cookie|localStorage\s*\.|sessionStorage\s*\./i,
    );
  });

  test("bridge live runner slice is env-gated and has no review/final/submit/order endpoint", () => {
    const slice = liveRunnerBridgeSlice();

    expect(slice).toContain(
      "AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER",
    );
    expect(slice).toContain("AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE");
    expect(slice).toContain("no_review_click: true");
    expect(slice).toContain("no_final_confirm_click: true");
    expect(slice).toContain("no_submit_or_order_placement: true");
    expect(slice).not.toMatch(
      /clickGranskaKop|openReviewModal|clickBekrafta|clickConfirm|submitOrder|placeOrder|confirmOrder/,
    );
    expect(slice).not.toMatch(
      /document\.cookie|localStorage\s*\.|sessionStorage\s*\./i,
    );
  });
});
