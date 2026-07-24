import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildFirstFillOnlyPocLiveInvocationExecuteDecision,
  firstRealAvanzaFillOnlyPocLiveInvocationExecutePhases,
  type FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRequest,
  type FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunner,
} from "../../lib/first-real-avanza-fill-only-poc-live-invocation-execute-wrapper";
import type { FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision } from "../../lib/first-real-avanza-fill-only-poc-final-live-fill-only-invocation-wrapper";
import type { FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision } from "../../lib/first-real-avanza-fill-only-poc-final-real-browser-fill-only-run-harness";
import type { FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision } from "../../lib/first-real-avanza-fill-only-poc-live-fill-only-invocation-attempt-wrapper";

const repoRoot = process.cwd();
const wrapperPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-live-invocation-execute-wrapper.ts",
);

function readyHarnessDecision(): FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision {
  return {
    status: "ready_for_final_fill_only_run",
    ready_for_final_fill_only_run: true,
    blocked_reasons: [],
    blockers: [],
    field_fill_plan: {
      amount: {
        selector: "[data-avanza-fill-only='amount']",
        value: 427.26,
        mode: "metadata_only_no_fill",
      },
      price: {
        selector: "[data-avanza-fill-only='price']",
        value: 21.98,
        mode: "metadata_only_no_fill",
      },
      total: {
        selector: "[data-avanza-fill-only='total']",
        value: null,
        mode: "metadata_only_no_read",
      },
      mode: "metadata_only_no_browser_execution",
    },
  } as unknown as FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision;
}

function readyFinalDecision(): FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision {
  return {
    status: "ready_for_live_fill_only_invocation",
    ready_for_live_fill_only_invocation: true,
    blocked_reasons: [],
    blockers: [],
    final_harness_decision: readyHarnessDecision(),
    gated_real_browser_fill_only_run_decision: {
      status: "ready_for_fill_only_browser_run",
    },
    invocation_phases: [],
    field_fill_plan: readyHarnessDecision().field_fill_plan,
  } as unknown as FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision;
}

function readyAttemptDecision(): FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision {
  return {
    status: "attempt_plan_created",
    ready_for_live_fill_only_attempt: true,
    attempt_plan_created: true,
    blocked_reasons: [],
    blockers: [],
    final_live_fill_only_invocation_decision: readyFinalDecision(),
  } as unknown as FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision;
}

function safeRequest(
  overrides: Partial<FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRequest> = {},
): FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRequest {
  return {
    live_invocation_execute_wrapper_enabled: true,
    execution_plan_explicitly_requested: false,
    live_invocation_execution_gate_decision_snapshot:
      "live_invocation_execution_gate_ready",
    live_invocation_run_attempt_gate_decision_snapshot:
      "live_invocation_run_attempt_gate_ready",
    final_operator_go_snapshot: "final_operator_go",
    immediate_pre_invocation_confirmation_snapshot:
      "immediate_pre_invocation_confirmation_ready",
    live_fill_only_invocation_attempt_decision_snapshot:
      readyAttemptDecision(),
    final_pre_run_evidence_snapshot: "final_pre_run_evidence_ready",
    operator_present: true,
    manual_avanza_login_confirmed: true,
    account_verification_confirmed: true,
    instrument_verification_confirmed: true,
    intended_amount_sek: 427.26,
    intended_price: 21.98,
    cap_sek: 1000,
    ...overrides,
  };
}

function fakeRunner(
  calls: string[],
): FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunner {
  const ok = (method: string) => {
    calls.push(method);
    return {
      ok: true,
      evidence_id: `fake-${method}`,
      observed_total_amount_sek:
        method === "readTotalAmount" ? 438.05 : null,
    };
  };

  return {
    verifyVisibleOrderFormState: () => ok("verifyVisibleOrderFormState"),
    fillAmountField: (amountSek) => {
      expect(amountSek).toBe(427.26);
      return ok("fillAmountField");
    },
    fillPriceField: (priceUsd) => {
      expect(priceUsd).toBe(21.98);
      return ok("fillPriceField");
    },
    readTotalAmount: () => ok("readTotalAmount"),
    captureEvidence: (label) => ok(`captureEvidence:${label}`),
    stopBeforeReview: () => ok("stopBeforeReview"),
  };
}

test("defaults to disabled and creates no runner calls", () => {
  const decision = buildFirstFillOnlyPocLiveInvocationExecuteDecision();

  expect(decision.status).toBe("disabled");
  expect(decision.live_invocation_execute_wrapper_enabled).toBe(false);
  expect(decision.runner_calls).toEqual([]);
  expect(decision.capability_flags).toMatchObject({
    can_launch_browser: false,
    can_click_review: false,
    can_click_final_confirm: false,
    can_submit_order: false,
    can_place_order: false,
    can_mutate_trades_or_pnl: false,
    can_execute_allowed_runner_methods: false,
  });
});

test("returns ready with a complete execute plan when all gates pass and no runner is provided", () => {
  const decision = buildFirstFillOnlyPocLiveInvocationExecuteDecision(
    safeRequest(),
  );

  expect(decision.status).toBe("ready_for_live_invocation_execute");
  expect(decision.ready_for_live_invocation_execute).toBe(true);
  expect(decision.execute_plan_created).toBe(false);
  expect(decision.runner_calls).toEqual([]);
  expect(decision.execute_plan).toMatchObject({
    mode: "fill_only_stop_before_review",
    amount: { value: 427.26 },
    price: { value: 21.98 },
    total: { cap_sek: 1000 },
    stop_point: "before_review_button",
  });
});

test("uses only allowed fake runner methods after all gates pass and explicit plan execution is requested", () => {
  const calls: string[] = [];
  const decision = buildFirstFillOnlyPocLiveInvocationExecuteDecision(
    safeRequest({
      execution_plan_explicitly_requested: true,
      runner: fakeRunner(calls),
    }),
  );

  expect(decision.status).toBe("execute_plan_created");
  expect(decision.ready_for_live_invocation_execute).toBe(false);
  expect(decision.execute_plan_created).toBe(true);
  expect(calls).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
    "captureEvidence:filled_fields",
    "captureEvidence:stop_before_review",
    "stopBeforeReview",
  ]);
  expect(decision.runner_calls.map((call) => call.method)).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
    "captureEvidence",
    "captureEvidence",
    "stopBeforeReview",
  ]);
  expect(decision.capability_flags.can_execute_allowed_runner_methods).toBe(
    true,
  );
});

test("blocks when execution gate or immediate confirmation is not ready", () => {
  const decision = buildFirstFillOnlyPocLiveInvocationExecuteDecision(
    safeRequest({
      live_invocation_execution_gate_decision_snapshot:
        "live_invocation_execution_gate_deferred",
      immediate_pre_invocation_confirmation_snapshot:
        "immediate_pre_invocation_confirmation_deferred",
    }),
  );

  expect(decision.status).toBe("blocked");
  expect(decision.blocked_reasons).toEqual(
    expect.arrayContaining([
      "live_invocation_execution_gate:not_ready",
      "immediate_pre_invocation_confirmation:not_ready",
    ]),
  );
});

test("fails safety when cap is above the locked 1000 SEK limit", () => {
  const decision = buildFirstFillOnlyPocLiveInvocationExecuteDecision(
    safeRequest({ cap_sek: 1001 }),
  );

  expect(decision.status).toBe("failed_safety");
  expect(decision.blocked_reasons).toContain("cap_exceeded");
});

test("exposes the required ordered execution phases and hard capability flags", () => {
  expect(
    firstRealAvanzaFillOnlyPocLiveInvocationExecutePhases.map(
      (phase) => phase.key,
    ),
  ).toEqual([
    "verify_execution_gate",
    "verify_run_attempt_gate",
    "verify_final_operator_go",
    "verify_immediate_pre_invocation_confirmation",
    "verify_final_invocation_wrapper_ready",
    "verify_final_harness_ready",
    "verify_final_pre_run_evidence",
    "verify_operator_presence",
    "verify_manual_login_confirmed",
    "verify_account_confirmed",
    "verify_instrument_confirmed",
    "verify_visible_order_form_state",
    "verify_buy_side",
    "verify_advanced_limit_order_type",
    "prepare_amount_field_fill",
    "prepare_price_field_fill",
    "read_total_amount",
    "verify_cap_after_total_parse",
    "capture_filled_fields_or_plan_evidence",
    "capture_stop_before_review_evidence",
    "stop_before_review",
  ]);

  const decision = buildFirstFillOnlyPocLiveInvocationExecuteDecision(
    safeRequest(),
  );

  expect(decision.safety_confirmations).toMatchObject({
    disabled_by_default: true,
    explicit_trigger_only: true,
    dependency_injected_runner_only: true,
    no_browser_automation_package_import: true,
    no_review_click: true,
    no_final_confirm: true,
    no_submit_or_order_placement: true,
  });
});

test("source keeps production wrapper free of browser automation imports and forbidden runner methods", () => {
  const source = readFileSync(wrapperPath, "utf8");

  expect(source).not.toMatch(/from ['"]@playwright\/test/);
  expect(source).not.toMatch(/puppeteer/);
  expect(source).not.toContain("chromium.launch");
  expect(source).not.toContain(".goto(");
  expect(source).not.toContain(".locator(");
  expect(source).not.toMatch(/clickReview\\s*[:(]/);
  expect(source).not.toMatch(/clickConfirm\\s*[:(]/);
  expect(source).not.toMatch(/submit\\s*[:(]/);
  expect(source).not.toMatch(/placeOrder\\s*[:(]/);
  expect(source).not.toMatch(/readCookies\\s*[:(]/);
  expect(source).not.toMatch(/readSessionStorage\\s*[:(]/);
  expect(source).not.toMatch(/handleCredentials\\s*[:(]/);
});
