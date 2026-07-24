import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput,
} from "../../lib/first-real-avanza-fill-only-poc-final-live-execute-attempt-explicit-invocation-action";
import type { FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner } from "../../lib/first-real-avanza-fill-only-poc-final-live-execute-attempt-wrapper";

const repoRoot = process.cwd();
const actionPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-final-live-execute-attempt-explicit-invocation-action.ts",
);
const simulationPath = join(
  repoRoot,
  "tests/e2e/first-real-avanza-fill-only-poc-final-live-execute-attempt-explicit-invocation-simulation.spec.ts",
);
const packageJsonPath = join(repoRoot, "package.json");

const approvedSequence = [
  "verifyVisibleOrderFormState",
  "fillAmountField",
  "fillPriceField",
  "readTotalAmount",
  "captureEvidence",
  "stopBeforeReview",
] as const;

const forbiddenRunnerMethods = [
  "clickReview",
  "clickGranskaKop",
  "openReviewModal",
  "clickConfirm",
  "clickBekraftaKop",
  "clickBekraftaSalj",
  "submitOrder",
  "placeOrder",
  "confirmOrder",
] as const;

function safeInput(
  overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput> = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput {
  return {
    final_live_execute_attempt_explicit_invocation_action_enabled: true,
    operatorExplicitlyRequestedFinalLiveExecuteAttempt: true,
    operator_present: true,
    final_live_execute_attempt_execution_gate_snapshot:
      "final_live_execute_attempt_execution_gate_ready",
    final_live_execute_attempt_checklist_confirmation_snapshot:
      "final_live_execute_attempt_checklist_confirmation_ready",
    final_live_execute_attempt_checklist_snapshot:
      "final_live_execute_attempt_checklist_ready",
    final_checklist_confirmation_fresh: true,
    final_checklist_confirmation_scope_matches: true,
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
    automatic_or_unattended_mode_requested: false,
    sell_stop_loss_or_glidande_requested: false,
    ...overrides,
  };
}

function fakeNoOpRunner(
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
      evidence_id: `local-simulation-${method}`,
      observed_total_amount_sek:
        method === "readTotalAmount" ? observedTotalAmountSek : null,
      note: "local-only-explicit-invocation-simulation",
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

function expectBlockedBeforeRunner(
  overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput>,
  expectedReason: string,
) {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
      safeInput({
        ...overrides,
        runner: fakeNoOpRunner(calls),
      }),
    );

  expect(result.status).toMatch(
    /final_live_execute_attempt_explicit_invocation_(blocked|aborted)/,
  );
  expect(result.blocked_reasons).toContain(expectedReason);
  expect(result.final_live_execute_attempt_explicit_invocation_plan_created).toBe(
    false,
  );
  expect(calls).toEqual([]);
  expect(result.runner_calls).toEqual([]);
}

test("disabled action returns final_live_execute_attempt_explicit_invocation_disabled", () => {
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction();

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_disabled",
  );
  expect(result.runner_calls).toEqual([]);
});

test("all gates satisfied without a runner returns ready status without execution", () => {
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
      safeInput(),
    );

  expect(result.status).toBe(
    "ready_for_final_live_execute_attempt_explicit_invocation",
  );
  expect(result.ready_status_meaning).toBe(
    "ready_for_final_live_execute_attempt_explicit_invocation_does_not_mean_execution_occurred",
  );
  expect(result.wrapper_status).toBe("ready_for_final_live_execute_attempt");
  expect(result.runner_calls).toEqual([]);
});

test("fake no-op runner creates only a stop-before-review invocation plan", () => {
  const calls: string[] = [];
  const runner = fakeNoOpRunner(calls);
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
      safeInput({ runner }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_plan_created",
  );
  expect(result.plan_created_meaning).toBe(
    "final_live_execute_attempt_explicit_invocation_plan_created_does_not_mean_order_placement",
  );
  expect(result.wrapper_status).toBe("final_live_execute_attempt_plan_created");
  expect(calls).toEqual([...approvedSequence]);
  expect(result.runner_calls.map((call) => call.method)).toEqual([
    ...approvedSequence,
  ]);
  expect(result.runner_calls.at(-1)?.method).toBe("stopBeforeReview");
  expect(Object.keys(runner)).toEqual([...approvedSequence]);

  for (const method of forbiddenRunnerMethods) {
    expect(method in runner).toBe(false);
  }
});

test("approved runner sequence stops immediately after stopBeforeReview", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
      safeInput({ runner: fakeNoOpRunner(calls) }),
    );

  const stopIndex = calls.indexOf("stopBeforeReview");
  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_plan_created",
  );
  expect(stopIndex).toBe(approvedSequence.length - 1);
  expect(calls.slice(stopIndex + 1)).toEqual([]);
  expect(result.plan.stop_point).toBe("before_granska_kop");
});

test("safe result carries explicit stop-before-review safety confirmations", () => {
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
      safeInput(),
    );

  expect(result.safety_confirmations).toMatchObject({
    disabled_by_default: true,
    explicit_trigger_only: true,
    dependency_injected_runner_only: true,
    no_default_live_runner: true,
    no_browser_or_dom_dependency: true,
    no_avanza_integration_dependency: true,
    no_credentials_or_session_handling: true,
    no_review_click: true,
    no_final_confirm: true,
    no_submit_or_order_placement: true,
    no_sell_stop_loss_or_glidande: true,
    no_external_write_or_scan_dependency: true,
    no_trade_stats_or_pnl_mutation: true,
    stop_before_granska_kop: true,
    not_wired_to_external_trigger_or_scripts: true,
  });
});

test.describe("required gates block before runner calls", () => {
  const cases: {
    name: string;
    overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput>;
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
      name: "missing final live execute attempt execution gate",
      overrides: { final_live_execute_attempt_execution_gate_snapshot: "missing" },
      reason: "final_live_execute_attempt_execution_gate:not_ready",
    },
    {
      name: "missing final live execute attempt checklist confirmation",
      overrides: {
        final_live_execute_attempt_checklist_confirmation_snapshot: "missing",
      },
      reason: "final_live_execute_attempt_checklist_confirmation:not_ready",
    },
    {
      name: "missing final live execute attempt checklist",
      overrides: { final_live_execute_attempt_checklist_snapshot: "missing" },
      reason: "final_live_execute_attempt_checklist:not_ready",
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
      name: "stale final checklist confirmation",
      overrides: { final_checklist_confirmation_fresh: false },
      reason: "final_checklist_confirmation:freshness_missing_or_stale",
    },
    {
      name: "missing final checklist confirmation freshness",
      overrides: { final_checklist_confirmation_fresh: null },
      reason: "final_checklist_confirmation:freshness_missing_or_stale",
    },
  ];

  for (const scenario of cases) {
    test(scenario.name, () => {
      expectBlockedBeforeRunner(scenario.overrides, scenario.reason);
    });
  }
});

test.describe("locked order-form expectations block before fill calls", () => {
  const cases: {
    name: string;
    overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput>;
    reason: string;
  }[] = [
    {
      name: "account mismatch",
      overrides: { expected_account: "Other account" },
      reason: "account:mismatch",
    },
    {
      name: "instrument mismatch",
      overrides: { expected_instrument: "Other instrument" },
      reason: "instrument:mismatch",
    },
    {
      name: "wrong side",
      overrides: { expected_side: "sell" },
      reason: "side:not_buy_only",
    },
    {
      name: "wrong order mode",
      overrides: { expected_order_mode: "other mode" },
      reason: "order_mode:not_avancerad_limit",
    },
    {
      name: "amount mismatch",
      overrides: { expected_amount_sek: 427.25 },
      reason: "amount:mismatch",
    },
    {
      name: "price mismatch",
      overrides: { expected_price_usd: 21.97 },
      reason: "price:mismatch",
    },
  ];

  for (const scenario of cases) {
    test(scenario.name, () => {
      expectBlockedBeforeRunner(scenario.overrides, scenario.reason);
    });
  }
});

test.describe("cap and visible state safeguards abort before completion", () => {
  const cases: {
    name: string;
    overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput>;
    reason: string;
  }[] = [
    {
      name: "cap missing",
      overrides: { cap_sek: null },
      reason: "cap:invalid_or_above_1000",
    },
    {
      name: "cap above allowed maximum",
      overrides: { cap_sek: 1000.01 },
      reason: "cap:invalid_or_above_1000",
    },
    {
      name: "expected total parse failure",
      overrides: { expected_total_sek: null },
      reason: "total:parse_failure",
    },
    {
      name: "expected total above cap",
      overrides: { expected_total_sek: 1000.01 },
      reason: "total:above_cap",
    },
    {
      name: "modal open",
      overrides: { modal_open: true },
      reason: "modal_state:open_or_unknown",
    },
    {
      name: "modal state unknown",
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
  ];

  for (const scenario of cases) {
    test(scenario.name, () => {
      expectBlockedBeforeRunner(scenario.overrides, scenario.reason);
    });
  }
});

test.describe("forbidden operator requests abort before runner calls", () => {
  const cases: {
    name: string;
    overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput>;
    reason: string;
  }[] = [
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
      name: "sell requested",
      overrides: { sell_stop_loss_or_glidande_requested: true },
      reason: "sell_stop_loss_or_glidande:requested",
    },
    {
      name: "Stop Loss requested",
      overrides: { sell_stop_loss_or_glidande_requested: true },
      reason: "sell_stop_loss_or_glidande:requested",
    },
    {
      name: "Glidande Stop Loss requested",
      overrides: { sell_stop_loss_or_glidande_requested: true },
      reason: "sell_stop_loss_or_glidande:requested",
    },
    {
      name: "automatic mode requested",
      overrides: { automatic_or_unattended_mode_requested: true },
      reason: "automatic_or_unattended_mode:requested",
    },
    {
      name: "unattended mode requested",
      overrides: { automatic_or_unattended_mode_requested: true },
      reason: "automatic_or_unattended_mode:requested",
    },
    {
      name: "uncertainty present",
      overrides: { uncertainty_present: true },
      reason: "uncertainty:present",
    },
  ];

  for (const scenario of cases) {
    test(scenario.name, () => {
      expectBlockedBeforeRunner(scenario.overrides, scenario.reason);
    });
  }
});

test("runner-reported visible-state mismatch aborts before fill calls", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
      safeInput({
        runner: fakeNoOpRunner(calls, { verifyVisibleOrderFormState: false }),
      }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_aborted",
  );
  expect(result.blocked_reasons).toContain("runner:visible_state_mismatch");
  expect(calls).toEqual(["verifyVisibleOrderFormState"]);
});

test("runner-reported total mismatch aborts before evidence capture", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
      safeInput({ runner: fakeNoOpRunner(calls, {}, 1000.01) }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_aborted",
  );
  expect(result.blocked_reasons).toContain("runner:total_above_cap");
  expect(calls).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
  ]);
});

test("runner total parse failure aborts before evidence capture", () => {
  const calls: string[] = [];
  const runner: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner = {
    ...fakeNoOpRunner(calls),
    readTotalAmount: () => {
      calls.push("readTotalAmount");

      return { ok: true, observed_total_amount_sek: null };
    },
  };
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
      safeInput({ runner }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_aborted",
  );
  expect(result.blocked_reasons).toContain("runner:total_parse_failure");
  expect(calls).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
  ]);
});

test("evidence capture failure prevents plan-created result", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
      safeInput({
        runner: fakeNoOpRunner(calls, { captureEvidence: false }),
      }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_aborted",
  );
  expect(result.blocked_reasons).toContain("runner:evidence_capture_failed");
  expect(result.final_live_execute_attempt_explicit_invocation_plan_created).toBe(
    false,
  );
  expect(calls).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
    "captureEvidence",
  ]);
});

test("plan-created result is never returned if stopBeforeReview is not reached", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
      safeInput({
        runner: fakeNoOpRunner(calls, { stopBeforeReview: false }),
      }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_aborted",
  );
  expect(result.blocked_reasons).toContain("runner:stop_before_review_failed");
  expect(result.final_live_execute_attempt_explicit_invocation_plan_created).toBe(
    false,
  );
  expect(calls.at(-1)).toBe("stopBeforeReview");
});

test("simulation and action source remain local-only and unwired", () => {
  const actionSource = readFileSync(actionPath, "utf8");
  const simulationSource = readFileSync(simulationPath, "utf8");
  const packageJson = readFileSync(packageJsonPath, "utf8");
  const combinedSource = `${actionSource}\n${simulationSource}`;
  const blockedTokens = [
    ["pup", "peteer"].join(""),
    ["chromium", ".launch"].join(""),
    ["browserType", ".launch"].join(""),
    ["launchPersistent", "Context"].join(""),
    ["new", "Page"].join(""),
    ["page", ".goto"].join(""),
    ["page", ".click"].join(""),
    ["page", ".fill"].join(""),
    ["query", "Selector"].join(""),
    ["query", "SelectorAll"].join(""),
    ["document", "."].join(""),
    ["window", "."].join(""),
    ["fetch", "("].join(""),
    ["sup", "abase"].join(""),
    ["pro", "vider"].join(""),
    ["scan", "ner"].join(""),
    ["market", "-loop"].join(""),
    ["/", "api", "/"].join(""),
    ["SERVICE", "_ROLE"].join(""),
  ];

  for (const token of blockedTokens) {
    expect(combinedSource).not.toContain(token);
  }

  expect(packageJson).not.toContain(
    "final-live-execute-attempt-explicit-invocation",
  );
});
