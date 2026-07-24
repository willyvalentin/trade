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
const simulationPath = join(
  repoRoot,
  "tests/e2e/first-real-avanza-fill-only-poc-final-live-execute-attempt-wrapper-simulation.spec.ts",
);

const approvedSequence = [
  "verifyVisibleOrderFormState",
  "fillAmountField",
  "fillPriceField",
  "readTotalAmount",
  "captureEvidence",
  "stopBeforeReview",
] as const;

function simulationInput(
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

function noOpRunner(
  calls: string[],
  overrides: Partial<
    Record<keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner, boolean>
  > = {},
  observedTotalAmountSek = 438.05,
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner {
  const record = (
    method: keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner,
  ) => {
    calls.push(method);

    return {
      ok: overrides[method] ?? true,
      evidence_id: `simulation-${method}`,
      observed_total_amount_sek:
        method === "readTotalAmount" ? observedTotalAmountSek : null,
      note: "local-no-op-simulation",
    };
  };

  return {
    verifyVisibleOrderFormState: () => record("verifyVisibleOrderFormState"),
    fillAmountField: (amountSek) => {
      expect(amountSek).toBe(427.26);

      return record("fillAmountField");
    },
    fillPriceField: (priceUsd) => {
      expect(priceUsd).toBe(21.98);

      return record("fillPriceField");
    },
    readTotalAmount: () => record("readTotalAmount"),
    captureEvidence: (label) => {
      expect(label).toBe("final_live_execute_attempt_stop_before_review");

      return record("captureEvidence");
    },
    stopBeforeReview: () => record("stopBeforeReview"),
  };
}

function expectAbortedBeforeRunner(
  overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput>,
  expectedReason: string,
) {
  const calls: string[] = [];
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    simulationInput({ ...overrides, runner: noOpRunner(calls) }),
  );

  expect(result.status).toBe("final_live_execute_attempt_aborted");
  expect(result.blocked_reasons).toContain(expectedReason);
  expect(result.final_live_execute_attempt_plan_created).toBe(false);
  expect(calls).toEqual([]);
  expect(result.runner_calls).toEqual([]);
}

test("no-runner simulation returns ready_for_final_live_execute_attempt without executing", () => {
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    simulationInput(),
  );

  expect(result.status).toBe("ready_for_final_live_execute_attempt");
  expect(result.ready_for_final_live_execute_attempt).toBe(true);
  expect(result.runner_calls).toEqual([]);
  expect(result.ready_status_meaning).toBe(
    "ready_for_final_live_execute_attempt_does_not_mean_execution_occurred",
  );
  expect(result.plan).toMatchObject({
    mode: "fill_only_stop_before_review",
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

test("fake no-op runner simulation returns final_live_execute_attempt_plan_created with exact stop-before-review sequence", () => {
  const calls: string[] = [];
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    simulationInput({ runner: noOpRunner(calls) }),
  );

  expect(result.status).toBe("final_live_execute_attempt_plan_created");
  expect(result.final_live_execute_attempt_plan_created).toBe(true);
  expect(result.plan_created_meaning).toBe(
    "final_live_execute_attempt_plan_created_does_not_mean_order_placement",
  );
  expect(calls).toEqual([...approvedSequence]);
  expect(result.runner_calls.map((call) => call.method)).toEqual([
    ...approvedSequence,
  ]);
  expect(result.runner_calls.at(-1)?.method).toBe("stopBeforeReview");
  expect(result.plan.allowed_runner_methods).toEqual(
    firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptAllowedRunnerMethods,
  );
});

test("simulation exposes no review, final confirm, submit, or order-placement runner method", () => {
  expect(
    firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptAllowedRunnerMethods,
  ).toEqual(approvedSequence);
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

test.describe("simulation aborts before runner calls for missing gates and unsafe inputs", () => {
  const cases: {
    name: string;
    overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput>;
    reason: string;
  }[] = [
    {
      name: "missing explicit operator trigger",
      overrides: { operatorExplicitlyRequestedFinalLiveExecuteAttempt: false },
      reason: "operator_explicit_trigger:not_ready",
    },
    {
      name: "missing operator presence",
      overrides: { operator_present: false },
      reason: "operator_presence:not_confirmed",
    },
    {
      name: "missing final execute attempt gate",
      overrides: { final_execute_attempt_gate_snapshot: "missing" },
      reason: "final_execute_attempt_gate:not_ready",
    },
    {
      name: "missing execute checklist confirmation",
      overrides: { execute_checklist_confirmation_snapshot: "missing" },
      reason: "execute_checklist_confirmation:not_ready",
    },
    {
      name: "missing final live invocation execute checklist",
      overrides: {
        final_live_invocation_execute_checklist_snapshot: "missing",
      },
      reason: "final_live_invocation_execute_checklist:not_ready",
    },
    {
      name: "missing live invocation execution gate",
      overrides: { live_invocation_execution_gate_snapshot: "missing" },
      reason: "live_invocation_execution_gate:not_ready",
    },
    {
      name: "missing immediate pre-invocation confirmation",
      overrides: {
        immediate_pre_invocation_confirmation_snapshot: "missing",
      },
      reason: "immediate_pre_invocation_confirmation:not_ready",
    },
    {
      name: "missing final operator GO",
      overrides: { final_operator_go_snapshot: "missing" },
      reason: "final_operator_go:not_ready",
    },
    {
      name: "missing final pre-run evidence",
      overrides: { final_pre_run_evidence_snapshot: "missing" },
      reason: "final_pre_run_evidence:not_ready",
    },
    {
      name: "missing live invocation run attempt gate",
      overrides: { live_invocation_run_attempt_gate_snapshot: "missing" },
      reason: "live_invocation_run_attempt_gate:not_ready",
    },
    {
      name: "account mismatch",
      overrides: { expected_account: "Wrong account" },
      reason: "account:mismatch",
    },
    {
      name: "instrument mismatch",
      overrides: { expected_instrument: "Wrong instrument" },
      reason: "instrument:mismatch",
    },
    {
      name: "wrong side",
      overrides: { expected_side: "sell" },
      reason: "side:not_buy_only",
    },
    {
      name: "wrong order mode",
      overrides: { expected_order_mode: "Glidande Stop Loss" },
      reason: "order_mode:not_avancerad_limit",
    },
    {
      name: "amount mismatch",
      overrides: { expected_amount_sek: 427.27 },
      reason: "amount:mismatch",
    },
    {
      name: "price mismatch",
      overrides: { expected_price_usd: 21.99 },
      reason: "price:mismatch",
    },
    {
      name: "missing cap",
      overrides: { cap_sek: null },
      reason: "cap:invalid_or_above_1000",
    },
    {
      name: "cap above 1000 SEK",
      overrides: { cap_sek: 1000.01 },
      reason: "cap:invalid_or_above_1000",
    },
    {
      name: "total parse failure",
      overrides: { expected_total_sek: null },
      reason: "total:parse_failure",
    },
    {
      name: "total above cap",
      overrides: { expected_total_sek: 1000.01 },
      reason: "total:above_cap",
    },
    {
      name: "modal open",
      overrides: { modal_open: true },
      reason: "modal_state:open_or_unknown",
    },
    {
      name: "modal unknown",
      overrides: { modal_open: null },
      reason: "modal_state:open_or_unknown",
    },
    {
      name: "final confirm visible",
      overrides: { final_confirm_visible: true },
      reason: "final_confirm:visible_or_unknown",
    },
    {
      name: "final confirm unknown",
      overrides: { final_confirm_visible: null },
      reason: "final_confirm:visible_or_unknown",
    },
    {
      name: "Bekrafta kop visible",
      overrides: { bekrafta_kop_visible: true },
      reason: "bekrafta_kop:visible_or_unknown",
    },
    {
      name: "Bekrafta salj visible",
      overrides: { bekrafta_salj_visible: true },
      reason: "bekrafta_salj:visible_or_unknown",
    },
    {
      name: "review click requested",
      overrides: { review_click_requested: true },
      reason: "review_click:requested",
    },
    {
      name: "Granska kop click requested",
      overrides: { granska_kop_click_requested: true },
      reason: "granska_kop_click:requested",
    },
    {
      name: "submit or order placement requested",
      overrides: { submit_or_order_placement_requested: true },
      reason: "submit_or_order_placement:requested",
    },
    {
      name: "credential or session handling requested",
      overrides: { credential_or_session_handling_requested: true },
      reason: "credential_or_session_handling:requested",
    },
    {
      name: "cookie or storage handling requested",
      overrides: { cookie_or_storage_handling_requested: true },
      reason: "cookie_or_storage_handling:requested",
    },
    {
      name: "uncertainty present",
      overrides: { uncertainty_present: true },
      reason: "uncertainty:present",
    },
  ];

  for (const scenario of cases) {
    test(`aborts for ${scenario.name}`, () => {
      expectAbortedBeforeRunner(scenario.overrides, scenario.reason);
    });
  }
});

test("runner-reported visible-state mismatch aborts before fill calls", () => {
  const calls: string[] = [];
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    simulationInput({
      runner: noOpRunner(calls, { verifyVisibleOrderFormState: false }),
    }),
  );

  expect(result.status).toBe("final_live_execute_attempt_aborted");
  expect(result.blocked_reasons).toContain("runner:visible_state_mismatch");
  expect(result.final_live_execute_attempt_plan_created).toBe(false);
  expect(calls).toEqual(["verifyVisibleOrderFormState"]);
});

test("runner-reported total parse failure aborts before evidence and stop", () => {
  const calls: string[] = [];
  const runner: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner = {
    ...noOpRunner(calls),
    readTotalAmount: () => {
      calls.push("readTotalAmount");

      return { ok: true, observed_total_amount_sek: null };
    },
  };
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    simulationInput({ runner }),
  );

  expect(result.status).toBe("final_live_execute_attempt_aborted");
  expect(result.blocked_reasons).toContain("runner:total_parse_failure");
  expect(result.runner_calls.map((call) => call.method)).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
  ]);
  expect(calls).not.toContain("captureEvidence");
  expect(calls).not.toContain("stopBeforeReview");
});

test("runner-reported total cap breach aborts before evidence and stop", () => {
  const calls: string[] = [];
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    simulationInput({ runner: noOpRunner(calls, {}, 1000.01) }),
  );

  expect(result.status).toBe("final_live_execute_attempt_aborted");
  expect(result.blocked_reasons).toContain("runner:total_above_cap");
  expect(result.runner_calls.map((call) => call.method)).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
  ]);
});

test("evidence capture failure aborts before completion and never returns plan_created", () => {
  const calls: string[] = [];
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    simulationInput({
      runner: noOpRunner(calls, { captureEvidence: false }),
    }),
  );

  expect(result.status).toBe("final_live_execute_attempt_aborted");
  expect(result.blocked_reasons).toContain("runner:evidence_capture_failed");
  expect(result.final_live_execute_attempt_plan_created).toBe(false);
  expect(calls).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
    "captureEvidence",
  ]);
});

test("stopBeforeReview failure never returns final_live_execute_attempt_plan_created", () => {
  const calls: string[] = [];
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    simulationInput({
      runner: noOpRunner(calls, { stopBeforeReview: false }),
    }),
  );

  expect(result.status).toBe("final_live_execute_attempt_aborted");
  expect(result.blocked_reasons).toContain("runner:stop_before_review_failed");
  expect(result.final_live_execute_attempt_plan_created).toBe(false);
  expect(calls).toEqual([...approvedSequence]);
});

test("forbidden runner method presence aborts before any local no-op runner call", () => {
  const calls: string[] = [];
  const runner = {
    ...noOpRunner(calls),
    clickConfirm: () => {
      calls.push("clickConfirm");

      return { ok: false };
    },
  } as FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner;
  const result = createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
    simulationInput({ runner }),
  );

  expect(result.status).toBe("final_live_execute_attempt_aborted");
  expect(result.blocked_reasons).toContain("unsupported_runner_method:present");
  expect(calls).toEqual([]);
});

test("simulation and wrapper sources contain no executable live browser, DOM, route, network, or credential path", () => {
  const wrapperSource = readFileSync(wrapperPath, "utf8");
  const simulationSource = readFileSync(simulationPath, "utf8");

  const forbiddenPatterns = [
    RegExp("from ['\"]play" + "wright(?!/test)"),
    RegExp("from ['\"]pup" + "peteer|require\\(['\"]pup" + "peteer"),
    RegExp("chromium\\.la" + "unch|browserType\\.la" + "unch"),
    RegExp("launchPersistent" + "Context|new" + "Page"),
    RegExp("page\\.go" + "to|page\\.cl" + "ick|page\\.fi" + "ll"),
    RegExp("query" + "Selector|query" + "SelectorAll"),
    RegExp("document\\.|window\\."),
    RegExp("fetch\\(|/" + "api/"),
    RegExp("create" + "Client|from\\([\"']|\\.select\\(|\\.insert\\("),
    RegExp("SERVICE_" + "ROLE|service_" + "role|SUPABASE_" + "SERVICE"),
    RegExp("read" + "Cookie|readLocal" + "Storage|readSession" + "Storage"),
    RegExp("handle" + "Credential|handleBank" + "Id|handleBank" + "ID"),
  ];

  for (const source of [wrapperSource, simulationSource]) {
    for (const pattern of forbiddenPatterns) {
      expect(source).not.toMatch(pattern);
    }
  }

  expect(wrapperSource).not.toMatch(/clickReview\s*[:=]\s*\(/);
  expect(wrapperSource).not.toMatch(/clickConfirm\s*[:=]\s*\(/);
  expect(wrapperSource).not.toMatch(/submitOrder\s*[:=]\s*\(/);
  expect(wrapperSource).not.toMatch(/placeOrder\s*[:=]\s*\(/);
  expect(wrapperSource).not.toMatch(/confirmOrder\s*[:=]\s*\(/);
  expect(wrapperSource).not.toMatch(/openReviewModal\s*[:=]\s*\(/);
});
