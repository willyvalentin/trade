import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger,
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
const packageJsonPath = join(repoRoot, "package.json");

const approvedSequence = [
  "verifyVisibleOrderFormState",
  "fillAmountField",
  "fillPriceField",
  "readTotalAmount",
  "captureEvidence",
  "stopBeforeReview",
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
  observedTotalAmountSek = 438.05,
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner {
  const record = (
    method: keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner,
  ) => {
    calls.push(method);

    return {
      ok: true,
      evidence_id: `trigger-${method}`,
      observed_total_amount_sek:
        method === "readTotalAmount" ? observedTotalAmountSek : null,
      note: "local-no-op-explicit-invocation-trigger",
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
  overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput>,
  reason: string,
) {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput({ ...overrides, runner: fakeRunner(calls) }),
    );

  expect(result.status).toMatch(
    /final_live_execute_attempt_explicit_invocation_trigger_(blocked|aborted)/,
  );
  expect(result.blocked_reasons).toContain(reason);
  expect(
    result.final_live_execute_attempt_explicit_invocation_trigger_plan_created,
  ).toBe(false);
  expect(calls).toEqual([]);
  expect(result.runner_calls).toEqual([]);
}

test("build helper keeps the trigger disabled by default", () => {
  expect(
    buildFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(),
  ).toMatchObject({
    final_live_execute_attempt_explicit_invocation_trigger_enabled: false,
  });
});

test("disabled trigger returns final_live_execute_attempt_explicit_invocation_trigger_disabled", () => {
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger();

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_disabled",
  );
  expect(result.runner_calls).toEqual([]);
  expect(result.blocked_reasons).toEqual([
    "final_live_execute_attempt_explicit_invocation_trigger_disabled",
  ]);
});

test("no-runner path returns ready_for_final_live_execute_attempt_explicit_invocation_trigger without action execution", () => {
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput(),
    );

  expect(result.status).toBe(
    "ready_for_final_live_execute_attempt_explicit_invocation_trigger",
  );
  expect(result.action_status).toBeNull();
  expect(result.runner_calls).toEqual([]);
  expect(result.ready_status_meaning).toBe(
    "ready_for_final_live_execute_attempt_explicit_invocation_trigger_does_not_mean_execution_occurred",
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

test("fake no-op runner path returns final_live_execute_attempt_explicit_invocation_trigger_plan_created with exact sequence", () => {
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
  expect(result.allowed_runner_methods).toEqual(approvedSequence);
});

test("trigger stops before Granska kop and exposes no final action capability", () => {
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput(),
    );

  expect(result.plan.stop_point).toBe("before_granska_kop");
  expect(result.safety_confirmations).toMatchObject({
    no_review_click: true,
    no_final_confirm: true,
    no_submit_or_order_placement: true,
    no_credentials_or_session_handling: true,
    stop_before_granska_kop: true,
    not_wired_to_external_trigger_or_scripts: true,
  });
});

test.describe("blocks before action and runner calls for missing gates and unsafe inputs", () => {
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
      overrides: { exact_trigger_phrase: "wrong phrase" },
      reason: "exact_trigger_phrase:missing_or_mismatched",
    },
    {
      name: "missing operator presence",
      overrides: { operator_present: false },
      reason: "operator_presence:not_confirmed",
    },
    {
      name: "missing explicit invocation final gate",
      overrides: {
        final_live_execute_attempt_explicit_invocation_final_gate_snapshot:
          "missing",
      },
      reason:
        "final_live_execute_attempt_explicit_invocation_final_gate:not_ready",
    },
    {
      name: "missing explicit invocation preflight confirmation",
      overrides: {
        final_live_execute_attempt_explicit_invocation_preflight_confirmation_snapshot:
          "missing",
      },
      reason:
        "final_live_execute_attempt_explicit_invocation_preflight_confirmation:not_ready",
    },
    {
      name: "missing explicit invocation preflight checklist",
      overrides: {
        final_live_execute_attempt_explicit_invocation_preflight_checklist_snapshot:
          "missing",
      },
      reason:
        "final_live_execute_attempt_explicit_invocation_preflight_checklist:not_ready",
    },
    {
      name: "missing explicit invocation simulation",
      overrides: { explicit_invocation_simulation_snapshot: "missing" },
      reason: "explicit_invocation_simulation:not_ready",
    },
    {
      name: "missing explicit invocation action",
      overrides: { explicit_invocation_action_snapshot: "missing" },
      reason: "explicit_invocation_action:not_ready",
    },
    {
      name: "stale explicit invocation confirmation",
      overrides: {
        final_explicit_invocation_preflight_confirmation_fresh: false,
      },
      reason:
        "final_explicit_invocation_preflight_confirmation:freshness_missing_or_stale",
    },
    {
      name: "mismatched explicit invocation confirmation scope",
      overrides: {
        final_explicit_invocation_preflight_confirmation_scope_matches: false,
      },
      reason: "final_explicit_invocation_preflight_confirmation:scope_mismatch",
    },
    {
      name: "missing final execution gate",
      overrides: { final_live_execute_attempt_execution_gate_snapshot: "missing" },
      reason: "final_live_execute_attempt_execution_gate:not_ready",
    },
    {
      name: "missing final checklist confirmation",
      overrides: {
        final_live_execute_attempt_checklist_confirmation_snapshot: "missing",
      },
      reason: "final_live_execute_attempt_checklist_confirmation:not_ready",
    },
    {
      name: "missing final checklist",
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
      overrides: { expected_order_mode: "Stop Loss" },
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
      name: "final confirm visible",
      overrides: { final_confirm_visible: true },
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
      name: "submit requested",
      overrides: { submit_or_order_placement_requested: true },
      reason: "submit_or_order_placement:requested",
    },
    {
      name: "credential handling requested",
      overrides: { credential_or_session_handling_requested: true },
      reason: "credential_or_session_handling:requested",
    },
    {
      name: "cookie or storage handling requested",
      overrides: { cookie_or_storage_handling_requested: true },
      reason: "cookie_or_storage_handling:requested",
    },
    {
      name: "sell or protective order requested",
      overrides: { sell_stop_loss_or_glidande_requested: true },
      reason: "sell_stop_loss_or_glidande:requested",
    },
    {
      name: "automatic or unattended requested",
      overrides: { automatic_or_unattended_mode_requested: true },
      reason: "automatic_or_unattended_mode:requested",
    },
    {
      name: "external trigger wiring requested",
      overrides: { ui_route_provider_scanner_package_trigger_requested: true },
      reason: "ui_route_provider_scanner_package_trigger:requested",
    },
    {
      name: "review or final capability requested",
      overrides: { review_or_final_or_submit_capability_requested: true },
      reason: "review_or_final_or_submit_capability:requested",
    },
    {
      name: "unsupported runner method requested",
      overrides: { unsupported_runner_method_requested: true },
      reason: "unsupported_runner_method:requested",
    },
    {
      name: "uncertainty present",
      overrides: { uncertainty_present: true },
      reason: "uncertainty:present",
    },
  ];

  for (const scenario of cases) {
    test(`blocks on ${scenario.name}`, () => {
      expectBlockedBeforeRunner(scenario.overrides, scenario.reason);
    });
  }
});

test("runner total above cap aborts through the existing explicit invocation action", () => {
  const calls: string[] = [];
  const result =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
      safeInput({ runner: fakeRunner(calls, 1000.01) }),
    );

  expect(result.status).toBe(
    "final_live_execute_attempt_explicit_invocation_trigger_aborted",
  );
  expect(result.action_status).toBe(
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

test("trigger source imports only the explicit invocation action and wrapper types without external wiring", () => {
  const source = readFileSync(triggerPath, "utf8");
  const packageJson = readFileSync(packageJsonPath, "utf8");
  const blockedTokens = [
    ["play", "wright"].join(""),
    ["pup", "peteer"].join(""),
    ["chromium", ".launch"].join(""),
    ["browserType", ".launch"].join(""),
    ["new", "Page"].join(""),
    ["page", ".goto"].join(""),
    ["page", ".click"].join(""),
    ["page", ".fill"].join(""),
    ["query", "Selector"].join(""),
    ["document", "."].join(""),
    ["window", "."].join(""),
    ["fetch", "("].join(""),
    ["sup", "abase"].join(""),
    ["market", "-loop"].join(""),
    ["/", "api", "/"].join(""),
    ["SERVICE", "_ROLE"].join(""),
  ];
  const forbiddenMethodTokens = [
    ["click", "Review"].join(""),
    ["click", "Granska"].join(""),
    ["click", "Confirm"].join(""),
    ["submit", "Order"].join(""),
    ["place", "Order"].join(""),
    ["confirm", "Order"].join(""),
    ["open", "Review", "Modal"].join(""),
  ];

  expect(source).toContain(
    "first-real-avanza-fill-only-poc-final-live-execute-attempt-explicit-invocation-action",
  );

  for (const token of [...blockedTokens, ...forbiddenMethodTokens]) {
    expect(source).not.toContain(token);
  }

  expect(packageJson).not.toContain(
    "final-live-execute-attempt-explicit-invocation-trigger",
  );
});
