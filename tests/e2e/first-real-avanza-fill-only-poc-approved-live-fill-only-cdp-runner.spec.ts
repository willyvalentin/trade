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
    expect(runner.fillQuantityField?.(1).ok).toBe(false);
    expect(runner.fillPriceField(21.98).ok).toBe(false);
    expect(runner.readTotalAmount().ok).toBe(false);
    expect(runner.captureEvidence("test").ok).toBe(false);
    expect(runner.stopBeforeReview().ok).toBe(false);
  });

  test("preserves full bridge-side diagnostics on runner results", () => {
    const runner =
      createFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyCdpRunner({
        env: {
          AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE: "cdp_readonly",
          AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER: "true",
        },
        bridgeTransport: () => ({
        action: "fillQuantityField",
        status: "aborted",
        runnerResult: {
          ok: false,
          evidence_id: null,
          observed_total_amount_sek: null,
          note: "quantity field did not confirm the approved value.",
        },
        report: {
          attempted_quantity_fill: true,
          quantity_fill_verified: false,
          no_order_placement: true,
        },
        blockers: ["quantity_field_fill_failed"],
        errors: ["quantity_field_fill_failed"],
        warnings: ["safe warning"],
        metadata: {
          quantity_candidate_count: 1,
          quantity_selected_candidate: {
            tied_to_antal_label_or_volume: true,
          },
          quantity_candidate_hidden: false,
          quantity_candidate_disabled: false,
          quantity_candidate_readonly: false,
          quantity_before_value_normalized: "",
          quantity_after_value_normalized: "",
          quantity_readback_source_used: "input.value",
          quantity_expected_normalized: "1",
          quantity_observed_normalized: "",
          exact_blocker_reason: "readback_mismatch",
          no_submit_or_order_placement: true,
        },
      }),
      });
    const result = runner.fillQuantityField?.(1);

    expect(result?.ok).toBe(false);
    expect(result?.diagnostics).toMatchObject({
      bridge_action: "fillQuantityField",
      bridge_status: "aborted",
      report: {
        attempted_quantity_fill: true,
        quantity_fill_verified: false,
      },
      blockers: ["quantity_field_fill_failed"],
      metadata: {
        quantity_candidate_count: 1,
        quantity_readback_source_used: "input.value",
        quantity_expected_normalized: "1",
        exact_blocker_reason: "readback_mismatch",
      },
    });
  });

  test("reports bridge connectivity failure as bridge_unreachable before fill", () => {
    const runner =
      createFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyCdpRunner({
        bridgeBaseUrl: "http://127.0.0.1:9",
        env: {
          AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE: "cdp_readonly",
          AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER: "true",
        },
      });

    const result = runner.verifyVisibleOrderFormState();

    expect(result.ok).toBe(false);
    expect(result.note).toBe("bridge_unreachable");
    expect(result.diagnostics).toMatchObject({
      bridge_action: "verifyVisibleOrderFormState",
      bridge_status: "bridge_unreachable",
      blockers: ["bridge_unreachable"],
      metadata: {
        bridge_base_url: "http://127.0.0.1:9",
        method_attempted: "verifyVisibleOrderFormState",
        endpoint_attempted:
          "/live-fill-only-runner/verify-visible-order-form-state",
        attempt_count: 3,
        failure_happened_before_request_accepted: true,
        request_accepted: false,
        fill_method_attempted: false,
        required_endpoint_allowed: true,
      },
    });
  });

  test("runner source exposes only approved runner methods and no review/final/submit/order method", () => {
    const source = readRepoFile(
      "lib/first-real-avanza-fill-only-poc-approved-live-fill-only-cdp-runner.ts",
    );

    expect(source).toContain("verifyVisibleOrderFormState");
    expect(source).toContain("fillAmountField");
    expect(source).toContain("fillQuantityField");
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

  test("uses hardened Node HTTP bridge client instead of child curl", () => {
    const source = readRepoFile(
      "lib/first-real-avanza-fill-only-poc-approved-live-fill-only-cdp-runner.ts",
    );

    expect(source).toContain("function nodeHttpRequestSync");
    expect(source).toContain("process.execPath");
    expect(source).toContain('const http = require("node:http")');
    expect(source).toContain('const https = require("node:https")');
    expect(source).toContain('requestBridgeJson(baseUrl, "/health"');
    expect(source).not.toContain('execFileSync("curl"');
  });

  test("retries connection failures safely and never retries fill calls after unknown send state", () => {
    const source = readRepoFile(
      "lib/first-real-avanza-fill-only-poc-approved-live-fill-only-cdp-runner.ts",
    );

    expect(source).toContain(
      "retryConnectionFailures: !fillBridgeActions.has(action)",
    );
    expect(source).toContain("const maxAttempts = options.retryConnectionFailures ? 3 : 1");
    expect(source).toContain("if (response.request_accepted || !options.retryConnectionFailures)");
    expect(source).toContain("fill_call_retried_after_unknown_or_partial_send: false");
    expect(source).toContain("fill_method_attempted: fillBridgeActions.has(action)");
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

  test("blocks zero or missing total reads for the approved positive amount", () => {
    const slice = liveRunnerBridgeSlice();
    const wrapper = readRepoFile(
      "lib/first-real-avanza-fill-only-poc-final-live-execute-attempt-wrapper.ts",
    );

    expect(slice).toContain("function liveFillOnlyTotalReadInvalid");
    expect(slice).toContain("total_positive_required");
    expect(slice).toContain("total <= 0");
    expect(slice).toContain("total_read_invalid");
    expect(slice).toContain("Cap check did not pass");
    expect(slice).toContain("total_element_found");
    expect(slice).toContain("total_text_present");
    expect(wrapper).toContain("runner:total_read_invalid_or_uncertain");
    expect(wrapper).not.toContain("runner:total_parse_failure");
  });

  test("requires post-fill readback before reporting amount or price fill success", () => {
    const slice = liveRunnerBridgeSlice();

    expect(slice).toContain("function liveFillOnlyFieldReadbackMetadata");
    expect(slice).toContain("amount_observed_normalized");
    expect(slice).toContain("price_observed_normalized");
    expect(slice).toContain("amount_verified");
    expect(slice).toContain("price_verified");
    expect(slice).toContain("selected_input_fill_not_verified");
    expect(slice).toContain("price_fill_not_verified");
    expect(slice).toContain("attempted_amount_fill");
    expect(slice).toContain("amount_fill_verified");
    expect(slice).toContain("attempted_price_fill");
    expect(slice).toContain("price_fill_verified");
    expect(slice).toContain("selected_input_strategy");
    expect(slice).toContain("selected_primary_field");
    expect(slice).toContain("primary_field_expected");
    expect(slice).toContain("primary_field_observed_normalized");
    expect(slice).toContain("primary_field_verified");
    expect(slice).not.toContain("amountFieldFilled: field === \"amount\"");
    expect(slice).not.toContain("priceFieldFilled: field === \"price\"");
  });

  test("blocks total and cap validation until amount and price readbacks are verified", () => {
    const slice = liveRunnerBridgeSlice();

    expect(slice).toContain("function liveFillOnlyApprovedFieldsVerified");
    expect(slice).toContain("field_readback_not_verified_before_total");
    expect(slice).toContain(
      "Total read and cap validation are blocked until the selected primary input and price readbacks both match approved values.",
    );
    expect(slice).toContain("total_validation_blocked_before_cap_check");
    expect(slice).toContain("primary_field_verified === true");
    expect(slice).toContain("priceFillVerified: true");
  });

  test("does not use buying power as a fill-only blocker", () => {
    const slice = liveRunnerBridgeSlice();

    expect(slice).not.toMatch(/buying[_\s-]?power|köpkraft|kopkraft/i);
  });

  test("supports explicit amount-based and quantity-based input strategies", () => {
    const slice = liveRunnerBridgeSlice();
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");

    expect(source).toContain('approvedInputStrategy: "amount_based"');
    expect(slice).toContain('strategy === "quantity_based" ? "quantity" : "amount"');
    expect(slice).toContain("fillQuantityField");
    expect(source).toContain("/live-fill-only-runner/fill-quantity");
    expect(slice).toContain("quantity_mismatch");
    expect(slice).toContain("quantity_verified");
  });

  test("field fill selectors prefer discovered stable Avanza input ids", () => {
    const source = readRepoFile("scripts/avanza-localhost-bridge-server.mjs");
    const slice = liveRunnerBridgeSlice();

    expect(source).toContain(
      `amount: ["input#inputAmount", 'input[data-e2e="inputAmount"]']`,
    );
    expect(source).toContain(
      `price: ["input#inputPrice", 'input[data-e2e="inputPrice"]']`,
    );
    expect(source).toContain('"input#inputVolume"');
    expect(source.indexOf('"input#inputVolume"')).toBeLessThan(
      source.indexOf(`'input[data-e2e="inputVolume"]'`),
    );
    expect(slice).toContain("stableIdByField");
    expect(slice).toContain('amount: "inputAmount"');
    expect(slice).toContain('quantity: "inputVolume"');
    expect(slice).toContain('price: "inputPrice"');
    expect(slice).toContain("fieldGroupById");
    expect(slice).toContain('inputVolume: "quantity"');
    expect(slice).toContain('inputPrice: "price"');
    expect(slice).toContain("stableCandidate ??");
    expect(slice).toContain("field_discovery_matched");
  });

  test("id-based matching overrides nearby-label ambiguity and quantity cannot select inputPrice", () => {
    const slice = liveRunnerBridgeSlice();

    expect(slice).toContain(
      'meta.tied_to_antal_label_or_volume &&\n                  (meta.selected_id === null || meta.selected_field_group === "quantity")',
    );
    expect(slice).toContain(
      'candidates.filter((candidate) => candidate.tied_to_antal_label_or_volume && candidate.selected_field_group === "quantity")',
    );
    expect(slice).toContain("selected_id");
    expect(slice).toContain("selected_field_group");
    expect(slice).toContain("field_discovery_matched");
  });

  test("amount is not required when quantity is the selected strategy, and quantity is not required when amount is selected", () => {
    const slice = liveRunnerBridgeSlice();

    expect(slice).toContain("selectedPrimaryField === \"quantity\"");
    expect(slice).toContain("checks.quantityFieldVisible === true");
    expect(slice).toContain("checks.amountFieldVisible === true");
    expect(slice).toContain("metadata.primary_field_verified === true");
    expect(slice).not.toContain("metadata.amount_verified === true && metadata.quantity_verified === true");
  });

  test("quantity fill failure reports sanitized candidate and readback diagnostics", () => {
    const slice = liveRunnerBridgeSlice();

    expect(slice).toContain("antal_control_found");
    expect(slice).toContain("quantity_candidate_count");
    expect(slice).toContain("selected_candidate");
    expect(slice).toContain("candidate_disabled");
    expect(slice).toContain("candidate_readonly");
    expect(slice).toContain("candidate_hidden");
    expect(slice).toContain("before_value_normalized");
    expect(slice).toContain("after_value_normalized");
    expect(slice).toContain("readback_source_used");
    expect(slice).toContain("expected_normalized");
    expect(slice).toContain("observed_normalized");
    expect(slice).toContain("exact_blocker_reason");
    expect(slice).toContain("selected_selector");
    expect(slice).toContain("selected_id");
    expect(slice).toContain("selected_field_group");
    expect(slice).toContain("field_discovery_matched");
  });

  test("quantity fill refuses ambiguous Antal candidates and missing controls", () => {
    const slice = liveRunnerBridgeSlice();

    expect(slice).toContain("quantity_antal_control_not_found");
    expect(slice).toContain("quantity_candidate_ambiguity");
    expect(slice).toContain("quantityClearCandidates.length !== 1");
    expect(slice).toContain("tied_to_antal_label_or_volume");
  });

  test("quantity fill succeeds only after exact readback match", () => {
    const slice = liveRunnerBridgeSlice();

    expect(slice).toContain("element.focus({ preventScroll: true })");
    expect(slice).toContain("descriptor.set.call(element, \"\")");
    expect(slice).toContain("descriptor.set.call(element, value)");
    expect(slice).toContain("element.dispatchEvent(new Event(\"input\", { bubbles: true }))");
    expect(slice).toContain("element.dispatchEvent(new Event(\"change\", { bubbles: true }))");
    expect(slice).toContain("element.blur()");
    expect(slice).toContain("window.setTimeout(resolve, 150)");
    expect(slice).toContain("observedNormalized === expectedNormalized");
    expect(slice).toContain("readback_mismatch");
    expect(slice).toContain("readback_matched");
  });

  test("quantity strategy can gate total validation on quantity plus price", () => {
    const slice = liveRunnerBridgeSlice();

    expect(slice).toContain("const inferredInputStrategy");
    expect(slice).toContain("quantityObserved.length > 0 && amountObserved.length === 0");
    expect(slice).toContain("\"quantity_based\"");
    expect(slice).toContain("metadata.primary_field_verified === true");
    expect(slice).toContain("metadata.price_verified === true");
  });
});
