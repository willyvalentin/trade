import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt,
  firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptAllowedRunnerMethods,
  firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptForbiddenRunnerMethodNames,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner,
} from "../../lib/first-real-avanza-fill-only-poc-final-live-execute-attempt-wrapper";

const repoRoot = process.cwd();
const wrapperPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-final-live-execute-attempt-wrapper.ts",
);

function safeInput(
  overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput> = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput {
  return {
    final_live_execute_attempt_wrapper_enabled: true,
    operatorExplicitlyRequestedFinalLiveExecuteAttempt: true,
    final_execute_attempt_gate_snapshot: "final_execute_attempt_gate_ready",
    execute_checklist_confirmation_snapshot:
      "execute_checklist_confirmation_ready",
    final_live_invocation_execute_checklist_snapshot:
      "final_live_invocation_execute_checklist_ready",
    live_invocation_execution_gate_snapshot:
      "live_invocation_execution_gate_ready",
    immediate_pre_invocation_confirmation_snapshot:
      "immediate_pre_invocation_confirmation_ready",
    final_operator_go_snapshot: "final_operator_go",
    final_pre_run_evidence_snapshot: "final_pre_run_evidence_ready",
    live_invocation_run_attempt_gate_snapshot:
      "live_invocation_run_attempt_gate_ready",
    operator_present: true,
    manual_avanza_login_confirmed: true,
    bankid_2fa_manually_handled: true,
    expected_account: "Valentin Labs KF",
    expected_instrument: "GameStop",
    expected_side: "buy",
    expected_order_mode: "Avancerad/Limit",
    expected_amount_sek: 427.26,
    expected_price_usd: 21.98,
    expected_total_sek: 438.05,
    cap_sek: 1000,
    modal_open: false,
    final_confirm_visible: false,
    bekrafta_kop_visible: false,
    bekrafta_salj_visible: false,
    review_click_requested: false,
    granska_kop_click_requested: false,
    submit_or_order_placement_requested: false,
    credential_or_session_handling_requested: false,
    cookie_or_storage_handling_requested: false,
    unsupported_runner_method_requested: false,
    uncertainty_present: false,
    ...overrides,
  };
}

function fakeRunner(
  calls: string[],
  overrides: Partial<
    Record<keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner, boolean>
  > = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner {
  const ok = (
    method: keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner,
  ) => {
    calls.push(method);

    return {
      ok: overrides[method] ?? true,
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
    captureEvidence: (label) => {
      expect(label).toBe("final_live_execute_attempt_stop_before_review");

      return ok("captureEvidence");
    },
    stopBeforeReview: () => ok("stopBeforeReview"),
  };
}

test("wrapper is disabled by default and has no runner calls", () => {
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt();

  expect(result.status).toBe("disabled");
  expect(result.runner_calls).toEqual([]);
  expect(result.blocked_reasons).toEqual([
    "final_live_execute_attempt_wrapper_disabled",
  ]);
});

test("no-runner path returns ready_for_final_live_execute_attempt", () => {
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    safeInput(),
  );

  expect(result.status).toBe("ready_for_final_live_execute_attempt");
  expect(result.ready_for_final_live_execute_attempt).toBe(true);
  expect(result.final_live_execute_attempt_plan_created).toBe(false);
  expect(result.runner_calls).toEqual([]);
  expect(result.ready_status_meaning).toBe(
    "ready_for_final_live_execute_attempt_does_not_mean_execution_occurred",
  );
  expect(result.plan).toMatchObject({
    account: "Valentin Labs KF",
    instrument: "GameStop",
    side: "buy",
    order_mode: "Avancerad/Limit",
    amount_sek: 427.26,
    price_usd: 21.98,
    expected_total_sek: 438.05,
    cap_sek: 1000,
    stop_point: "before_granska_kop",
  });
});

test("fake no-op runner returns final_live_execute_attempt_plan_created with exact allowed sequence", () => {
  const calls: string[] = [];
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    safeInput({ runner: fakeRunner(calls) }),
  );

  expect(result.status).toBe("final_live_execute_attempt_plan_created");
  expect(result.final_live_execute_attempt_plan_created).toBe(true);
  expect(result.plan_created_meaning).toBe(
    "final_live_execute_attempt_plan_created_does_not_mean_order_placement",
  );
  expect(calls).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
    "captureEvidence",
    "stopBeforeReview",
  ]);
  expect(result.runner_calls.map((call) => call.method)).toEqual(calls);
  expect(result.plan.allowed_runner_methods).toEqual(
    firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptAllowedRunnerMethods,
  );
});

test("wrapper stops before Granska kop and exposes no review/final/submit capability", () => {
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    safeInput(),
  );

  expect(result.plan.stop_point).toBe("before_granska_kop");
  expect(result.safety_confirmations).toMatchObject({
    no_review_click: true,
    no_final_confirm: true,
    no_submit_or_order_placement: true,
    no_credentials_or_session_handling: true,
    stop_before_granska_kop: true,
  });
  expect(
    firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptForbiddenRunnerMethodNames,
  ).toEqual([
    "clickReview",
    "clickGranskaKop",
    "openReviewModal",
    "clickConfirm",
    "clickBekraftaKop",
    "clickBekraftaSalj",
    "submitOrder",
    "placeOrder",
    "confirmOrder",
  ]);
});

test.describe("aborts before runner calls for pre-run blockers", () => {
  const cases: {
    name: string;
    overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput>;
    expectedReason: string;
  }[] = [
    {
      name: "missing explicit operator trigger",
      overrides: { operatorExplicitlyRequestedFinalLiveExecuteAttempt: false },
      expectedReason: "operator_explicit_trigger:not_ready",
    },
    {
      name: "missing final execute attempt gate",
      overrides: { final_execute_attempt_gate_snapshot: "missing" },
      expectedReason: "final_execute_attempt_gate:not_ready",
    },
    {
      name: "missing execute checklist confirmation",
      overrides: { execute_checklist_confirmation_snapshot: "missing" },
      expectedReason: "execute_checklist_confirmation:not_ready",
    },
    {
      name: "missing final operator GO",
      overrides: { final_operator_go_snapshot: "missing" },
      expectedReason: "final_operator_go:not_ready",
    },
    {
      name: "account mismatch",
      overrides: { expected_account: "Wrong account" },
      expectedReason: "account:mismatch",
    },
    {
      name: "instrument mismatch",
      overrides: { expected_instrument: "Wrong instrument" },
      expectedReason: "instrument:mismatch",
    },
    {
      name: "wrong side",
      overrides: { expected_side: "sell" },
      expectedReason: "side:not_buy_only",
    },
    {
      name: "wrong order mode",
      overrides: { expected_order_mode: "Stop Loss" },
      expectedReason: "order_mode:not_avancerad_limit",
    },
    {
      name: "amount mismatch",
      overrides: { expected_amount_sek: 427.27 },
      expectedReason: "amount:mismatch",
    },
    {
      name: "price mismatch",
      overrides: { expected_price_usd: 21.99 },
      expectedReason: "price:mismatch",
    },
    {
      name: "total above cap",
      overrides: { expected_total_sek: 1000.01 },
      expectedReason: "total:above_cap",
    },
    {
      name: "modal open",
      overrides: { modal_open: true },
      expectedReason: "modal_state:open_or_unknown",
    },
    {
      name: "modal unknown",
      overrides: { modal_open: null },
      expectedReason: "modal_state:open_or_unknown",
    },
    {
      name: "final confirm visible",
      overrides: { final_confirm_visible: true },
      expectedReason: "final_confirm:visible_or_unknown",
    },
    {
      name: "final confirm unknown",
      overrides: { final_confirm_visible: null },
      expectedReason: "final_confirm:visible_or_unknown",
    },
    {
      name: "review click requested",
      overrides: { review_click_requested: true },
      expectedReason: "review_click:requested",
    },
    {
      name: "submit requested",
      overrides: { submit_or_order_placement_requested: true },
      expectedReason: "submit_or_order_placement:requested",
    },
    {
      name: "credential handling requested",
      overrides: { credential_or_session_handling_requested: true },
      expectedReason: "credential_or_session_handling:requested",
    },
    {
      name: "cookie or storage handling requested",
      overrides: { cookie_or_storage_handling_requested: true },
      expectedReason: "cookie_or_storage_handling:requested",
    },
    {
      name: "unsupported runner method requested",
      overrides: { unsupported_runner_method_requested: true },
      expectedReason: "unsupported_runner_method:requested",
    },
    {
      name: "uncertainty present",
      overrides: { uncertainty_present: true },
      expectedReason: "uncertainty:present",
    },
  ];

  for (const scenario of cases) {
    test(`aborts on ${scenario.name}`, () => {
      const calls: string[] = [];
      const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
        safeInput({ ...scenario.overrides, runner: fakeRunner(calls) }),
      );

      expect(result.status).toBe("final_live_execute_attempt_aborted");
      expect(result.blocked_reasons).toContain(scenario.expectedReason);
      expect(calls).toEqual([]);
      expect(result.runner_calls).toEqual([]);
    });
  }
});

test("total parse failure aborts before stop-before-review completion", () => {
  const calls: string[] = [];
  const runner: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner = {
    ...fakeRunner(calls),
    readTotalAmount: () => {
      calls.push("readTotalAmount");

      return { ok: true, observed_total_amount_sek: null };
    },
  };
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    safeInput({ runner }),
  );

  expect(result.status).toBe("final_live_execute_attempt_aborted");
  expect(result.blocked_reasons).toContain("runner:total_parse_failure");
  expect(calls).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
  ]);
  expect(result.runner_calls.map((call) => call.method)).not.toContain(
    "stopBeforeReview",
  );
});

test("runner visible-state mismatch aborts immediately", () => {
  const calls: string[] = [];
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    safeInput({
      runner: fakeRunner(calls, { verifyVisibleOrderFormState: false }),
    }),
  );

  expect(result.status).toBe("final_live_execute_attempt_aborted");
  expect(result.blocked_reasons).toContain("runner:visible_state_mismatch");
  expect(calls).toEqual(["verifyVisibleOrderFormState"]);
});

test("runner observed total above cap aborts before evidence and stop calls", () => {
  const calls: string[] = [];
  const runner: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner = {
    ...fakeRunner(calls),
    readTotalAmount: () => {
      calls.push("readTotalAmount");

      return { ok: true, observed_total_amount_sek: 1000.01 };
    },
  };
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    safeInput({ runner }),
  );

  expect(result.status).toBe("final_live_execute_attempt_aborted");
  expect(result.blocked_reasons).toContain("runner:total_above_cap");
  expect(calls).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
  ]);
});

test("runner with forbidden method key aborts before any call", () => {
  const calls: string[] = [];
  const runner = {
    ...fakeRunner(calls),
    clickReview: () => {
      calls.push("clickReview");

      return { ok: false };
    },
  } as FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner;
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    safeInput({ runner }),
  );

  expect(result.status).toBe("final_live_execute_attempt_aborted");
  expect(result.blocked_reasons).toContain("unsupported_runner_method:present");
  expect(calls).toEqual([]);
});

test("source has no browser, DOM, Avanza, Supabase, provider, route, scanner, audit writer, or forbidden runner implementation", () => {
  const source = readFileSync(wrapperPath, "utf8");

  expect(source).not.toMatch(/from ['"]@playwright\/test/);
  expect(source).not.toMatch(/puppeteer|chromium\.launch|browserType\.launch/);
  expect(source).not.toMatch(/newPage|page\.goto|page\.click|page\.fill/);
  expect(source).not.toMatch(/querySelector|querySelectorAll|document\.|window\./);
  expect(source).not.toMatch(/fetch\(|\/api\//);
  expect(source).not.toMatch(/createClient|from\(["']|\.select\(|\.insert\(/);
  expect(source).not.toMatch(/import .*provider|scanner\(|market-loop/);
  expect(source).not.toMatch(/SERVICE_ROLE|service_role|SUPABASE_SERVICE/);
  expect(source).not.toMatch(/clickReview\s*[:=]\s*\(/);
  expect(source).not.toMatch(/clickConfirm\s*[:=]\s*\(/);
  expect(source).not.toMatch(/submitOrder\s*[:=]\s*\(/);
  expect(source).not.toMatch(/placeOrder\s*[:=]\s*\(/);
  expect(source).not.toMatch(/confirmOrder\s*[:=]\s*\(/);
  expect(source).not.toMatch(/openReviewModal\s*[:=]\s*\(/);
});
