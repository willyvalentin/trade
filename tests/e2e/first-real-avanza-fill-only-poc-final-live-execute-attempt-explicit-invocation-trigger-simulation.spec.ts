import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerPhrase,
  runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput,
} from "../../lib/first-real-avanza-fill-only-poc-final-live-execute-attempt-explicit-invocation-trigger";
import type { FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner } from "../../lib/first-real-avanza-fill-only-poc-final-live-execute-attempt-wrapper";

const repoRoot = process.cwd();
const triggerPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-final-live-execute-attempt-explicit-invocation-trigger.ts",
);
const simulationPath = join(
  repoRoot,
  "tests/e2e/first-real-avanza-fill-only-poc-final-live-execute-attempt-explicit-invocation-trigger-simulation.spec.ts",
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
  overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput> = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput {
  return {
    final_live_execute_attempt_explicit_invocation_trigger_enabled: true,
    operatorExplicitlyRequestedFinalLiveExecuteAttemptTrigger: true,
    exact_trigger_phrase:
      firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerPhrase,
    operator_present: true,
    final_live_execute_attempt_explicit_invocation_final_gate_snapshot:
      "final_live_execute_attempt_explicit_invocation_final_gate_ready",
    final_live_execute_attempt_explicit_invocation_preflight_confirmation_snapshot:
      "final_live_execute_attempt_explicit_invocation_preflight_confirmation_ready",
    final_live_execute_attempt_explicit_invocation_preflight_checklist_snapshot:
      "final_live_execute_attempt_explicit_invocation_preflight_checklist_ready",
    explicit_invocation_simulation_snapshot:
      "first_real_avanza_fill_only_poc_final_live_execute_attempt_explicit_invocation_simulation_added",
    explicit_invocation_action_snapshot:
      "first_real_avanza_fill_only_poc_final_live_execute_attempt_explicit_invocation_action_added",
    final_explicit_invocation_preflight_confirmation_fresh: true,
    final_explicit_invocation_preflight_confirmation_scope_matches: true,
    final_live_execute_attempt_execution_gate_snapshot:
      "final_live_execute_attempt_execution_gate_ready",
    final_live_execute_attempt_checklist_confirmation_snapshot:
      "final_live_execute_attempt_checklist_confirmation_ready",
    final_live_execute_attempt_checklist_snapshot:
      "final_live_execute_attempt_checklist_ready",
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
    ui_route_provider_scanner_package_trigger_requested: false,
    review_or_final_or_submit_capability_requested: false,
    ...overrides,
  };
}

function fakeRunner(
  calls: string[],
  options: Partial<Record<keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner, boolean>> & {
    observedTotalAmountSek?: number | null;
  } = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner {
  const record = (
    method: keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner,
  ) => {
    calls.push(method);

    return {
      ok: options[method] ?? true,
      evidence_id: `trigger-simulation-${method}`,
      observed_total_amount_sek:
        method === "readTotalAmount"
          ? Object.prototype.hasOwnProperty.call(
              options,
              "observedTotalAmountSek",
            )
            ? (options.observedTotalAmountSek ?? null)
            : 438.05
          : null,
      note: "local-no-op-explicit-invocation-trigger-simulation",
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

function expectBlocksBeforeRunner(
  overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput>,
  reason: string,
) {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput({ ...overrides, runner: fakeRunner(calls) }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_blocked",
  );
  expect(result.blocked_reasons).toContain(reason);
  expect(result.runner_calls).toEqual([]);
  expect(calls).toEqual([]);
  expect(
    result.final_live_execute_attempt_explicit_invocation_trigger_plan_created,
  ).toBe(false);
}

test("disabled simulation returns final_live_execute_attempt_explicit_invocation_trigger_disabled", () => {
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger();

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_disabled",
  );
  expect(result.runner_calls).toEqual([]);
});

test("exact trigger phrase with no runner returns ready status without execution", () => {
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput(),
    );

  expect(result.status).toBe(
    "ready_for_final_live_execute_attempt_explicit_invocation_trigger",
  );
  expect(result.ready_status_meaning).toBe(
    "ready_for_final_live_execute_attempt_explicit_invocation_trigger_does_not_mean_execution_occurred",
  );
  expect(result.action_status).toBeNull();
  expect(result.runner_calls).toEqual([]);
});

test("exact trigger phrase with fake no-op runner creates stop-before-review trigger plan only", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput({ runner: fakeRunner(calls) }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_plan_created",
  );
  expect(result.action_status).toBe(
    "final_live_execute_attempt_explicit_invocation_plan_created",
  );
  expect(result.plan_created_meaning).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_plan_created_does_not_mean_order_placement",
  );
  expect(calls).toEqual([...approvedSequence]);
  expect(result.runner_calls.map((call) => call.method)).toEqual([
    ...approvedSequence,
  ]);
  expect(result.runner_calls.at(-1)?.method).toBe("stopBeforeReview");
  expect(result.plan.stop_point).toBe("before_granska_kop");
});

test("fake no-op runner exposes no review final submit or order placement methods", () => {
  const runner = fakeRunner([]);

  for (const method of forbiddenRunnerMethods) {
    expect(method in runner).toBe(false);
  }

  expect(Object.keys(runner)).toEqual([...approvedSequence]);
});

test.describe("pre-action trigger gate simulation", () => {
  const cases: {
    name: string;
    overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput>;
    reason: string;
  }[] = [
    {
      name: "missing explicit operator trigger",
      overrides: {
        operatorExplicitlyRequestedFinalLiveExecuteAttemptTrigger: false,
      },
      reason: "operator_explicit_trigger:not_ready",
    },
    {
      name: "missing exact trigger phrase",
      overrides: { exact_trigger_phrase: null },
      reason: "exact_trigger_phrase:missing_or_mismatched",
    },
    {
      name: "mismatched exact trigger phrase",
      overrides: { exact_trigger_phrase: "FINAL LIVE EXECUTE ATTEMPT" },
      reason: "exact_trigger_phrase:missing_or_mismatched",
    },
    {
      name: "altered exact trigger phrase",
      overrides: {
        exact_trigger_phrase:
          firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerPhrase.replace(
            "without order placement",
            "with order placement",
          ),
      },
      reason: "exact_trigger_phrase:missing_or_mismatched",
    },
    {
      name: "missing operator presence",
      overrides: { operator_present: false },
      reason: "operator_presence:not_confirmed",
    },
    {
      name: "missing final explicit invocation final gate",
      overrides: {
        final_live_execute_attempt_explicit_invocation_final_gate_snapshot:
          "missing",
      },
      reason:
        "final_live_execute_attempt_explicit_invocation_final_gate:not_ready",
    },
    {
      name: "missing final explicit invocation preflight confirmation",
      overrides: {
        final_live_execute_attempt_explicit_invocation_preflight_confirmation_snapshot:
          "missing",
      },
      reason:
        "final_live_execute_attempt_explicit_invocation_preflight_confirmation:not_ready",
    },
    {
      name: "missing final explicit invocation preflight checklist",
      overrides: {
        final_live_execute_attempt_explicit_invocation_preflight_checklist_snapshot:
          "missing",
      },
      reason:
        "final_live_execute_attempt_explicit_invocation_preflight_checklist:not_ready",
    },
    {
      name: "missing explicit invocation simulation result",
      overrides: { explicit_invocation_simulation_snapshot: "missing" },
      reason: "explicit_invocation_simulation:not_ready",
    },
    {
      name: "missing explicit invocation action result",
      overrides: { explicit_invocation_action_snapshot: "missing" },
      reason: "explicit_invocation_action:not_ready",
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
      overrides: { final_live_invocation_execute_checklist_snapshot: "missing" },
      reason: "final_live_invocation_execute_checklist:not_ready",
    },
    {
      name: "missing live invocation execution gate",
      overrides: { live_invocation_execution_gate_snapshot: "missing" },
      reason: "live_invocation_execution_gate:not_ready",
    },
    {
      name: "missing immediate pre invocation confirmation",
      overrides: { immediate_pre_invocation_confirmation_snapshot: "missing" },
      reason: "immediate_pre_invocation_confirmation:not_ready",
    },
    {
      name: "missing final operator go",
      overrides: { final_operator_go_snapshot: "missing" },
      reason: "final_operator_go:not_ready",
    },
    {
      name: "missing final pre run evidence",
      overrides: { final_pre_run_evidence_snapshot: "missing" },
      reason: "final_pre_run_evidence:not_ready",
    },
    {
      name: "missing live invocation run attempt gate",
      overrides: { live_invocation_run_attempt_gate_snapshot: "missing" },
      reason: "live_invocation_run_attempt_gate:not_ready",
    },
    {
      name: "stale final explicit invocation preflight confirmation",
      overrides: { final_explicit_invocation_preflight_confirmation_fresh: false },
      reason:
        "final_explicit_invocation_preflight_confirmation:freshness_missing_or_stale",
    },
    {
      name: "scoped final explicit invocation preflight confirmation mismatch",
      overrides: {
        final_explicit_invocation_preflight_confirmation_scope_matches: false,
      },
      reason:
        "final_explicit_invocation_preflight_confirmation:scope_mismatch",
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
      overrides: { expected_order_mode: "Market" },
      reason: "order_mode:not_avancerad_limit",
    },
    {
      name: "amount mismatch",
      overrides: { expected_amount_sek: 999 },
      reason: "amount:mismatch",
    },
    {
      name: "price mismatch",
      overrides: { expected_price_usd: 99 },
      reason: "price:mismatch",
    },
    {
      name: "cap missing",
      overrides: { cap_sek: null },
      reason: "cap:invalid_or_above_1000",
    },
    {
      name: "cap above 1000",
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
      name: "final confirm visibility unknown",
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
      name: "sell behavior requested",
      overrides: { sell_stop_loss_or_glidande_requested: true },
      reason: "sell_stop_loss_or_glidande:requested",
    },
    {
      name: "automatic or unattended mode requested",
      overrides: { automatic_or_unattended_mode_requested: true },
      reason: "automatic_or_unattended_mode:requested",
    },
    {
      name: "UI route provider scanner package trigger requested",
      overrides: { ui_route_provider_scanner_package_trigger_requested: true },
      reason: "ui_route_provider_scanner_package_trigger:requested",
    },
    {
      name: "review final or submit capability requested",
      overrides: { review_or_final_or_submit_capability_requested: true },
      reason: "review_or_final_or_submit_capability:requested",
    },
    {
      name: "uncertainty present",
      overrides: { uncertainty_present: true },
      reason: "uncertainty:present",
    },
  ];

  for (const item of cases) {
    test(`${item.name} blocks before action and runner calls`, () => {
      expectBlocksBeforeRunner(item.overrides, item.reason);
    });
  }
});

test("runner-reported visible-state mismatch aborts after visible-state check only", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput({
        runner: fakeRunner(calls, { verifyVisibleOrderFormState: false }),
      }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_aborted",
  );
  expect(result.action_status).toBe(
    "final_live_execute_attempt_explicit_invocation_aborted",
  );
  expect(result.blocked_reasons).toContain("runner:visible_state_mismatch");
  expect(calls).toEqual(["verifyVisibleOrderFormState"]);
});

test("runner-reported total parse failure aborts before evidence and stop", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput({
        runner: fakeRunner(calls, { observedTotalAmountSek: null }),
      }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_aborted",
  );
  expect(result.blocked_reasons).toContain("runner:total_parse_failure");
  expect(calls).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
  ]);
});

test("runner-reported cap breach aborts before evidence and stop", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput({
        runner: fakeRunner(calls, { observedTotalAmountSek: 1000.01 }),
      }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_aborted",
  );
  expect(result.blocked_reasons).toContain("runner:total_above_cap");
  expect(calls).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
  ]);
});

test("evidence capture failure aborts before stopBeforeReview completion", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput({
        runner: fakeRunner(calls, { captureEvidence: false }),
      }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_aborted",
  );
  expect(result.blocked_reasons).toContain("runner:evidence_capture_failed");
  expect(calls).toEqual([
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
    "captureEvidence",
  ]);
});

test("trigger plan is never created when stopBeforeReview is not reached successfully", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput({
        runner: fakeRunner(calls, { stopBeforeReview: false }),
      }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_aborted",
  );
  expect(result.blocked_reasons).toContain("runner:stop_before_review_failed");
  expect(
    result.final_live_execute_attempt_explicit_invocation_trigger_plan_created,
  ).toBe(false);
  expect(calls).toEqual([...approvedSequence]);
});

test("existing action and wrapper abort result propagates through trigger abort status", () => {
  const calls: string[] = [];
  const runnerWithForbiddenMethod = {
    ...fakeRunner(calls),
    clickReview: () => ({
      ok: false,
      evidence_id: null,
      observed_total_amount_sek: null,
      note: "must-not-exist",
    }),
  } as FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner & {
    clickReview: () => unknown;
  };

  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput({ runner: runnerWithForbiddenMethod }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_aborted",
  );
  expect(result.action_status).toBe(
    "final_live_execute_attempt_explicit_invocation_aborted",
  );
  expect(result.blocked_reasons).toContain("unsupported_runner_method:present");
  expect(calls).toEqual([]);
});

test("trigger source remains isolated from UI routes providers scanners browsers DOM and Supabase", () => {
  const triggerSource = readFileSync(triggerPath, "utf8");
  const simulationSource = readFileSync(simulationPath, "utf8");
  const triggerImportLines = triggerSource
    .split("\n")
    .filter((line) => line.startsWith("import "))
    .join("\n");
  const simulationImportLines = simulationSource
    .split("\n")
    .filter((line) => line.startsWith("import "))
    .join("\n");
  const executableDependencySource = `${triggerImportLines}\n${simulationImportLines}`;

  expect(executableDependencySource).not.toMatch(/from ["']playwright["']/);
  expect(executableDependencySource).not.toMatch(/from ["']puppeteer["']/);
  expect(executableDependencySource).not.toMatch(/chromium|firefox|webkit|launch\(/);
  expect(executableDependencySource).not.toMatch(/page\.(goto|click|fill|locator)/);
  expect(executableDependencySource).not.toMatch(/querySelector|querySelectorAll/);
  expect(executableDependencySource).not.toMatch(/document\.|window\./);
  expect(executableDependencySource).not.toMatch(/fetch\(|XMLHttpRequest/);
  expect(executableDependencySource).not.toMatch(
    /supabase|SERVICE_ROLE|NEXT_PUBLIC_.*SERVICE/i,
  );
  expect(executableDependencySource).not.toMatch(
    /market-loop|scanner|provider|\/api\//,
  );
  expect(executableDependencySource).not.toMatch(/tradeStats|pnl|profitAndLoss/);
});

test("package scripts are not wired to trigger a live broker browser or Avanza run", () => {
  const packageJson = readFileSync(packageJsonPath, "utf8");
  const parsed = JSON.parse(packageJson) as { scripts?: Record<string, string> };
  const scripts = Object.values(parsed.scripts ?? {}).join("\n");

  expect(scripts).not.toContain(
    "first-real-avanza-fill-only-poc-final-live-execute-attempt-explicit-invocation-trigger",
  );
  expect(scripts).not.toMatch(/avanza.*(live|run|execute)/i);
  expect(scripts).not.toMatch(/browser.*(live|run|execute)/i);
});
