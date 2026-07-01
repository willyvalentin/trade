import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildFirstFillOnlyPocLiveInvocationExecuteDecision,
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

const allowedRunnerMethods = [
  "verifyVisibleOrderFormState",
  "fillAmountField",
  "fillPriceField",
  "readTotalAmount",
  "captureEvidence",
  "stopBeforeReview",
];

const forbiddenRunnerNames = [
  "clickReview",
  "clickConfirm",
  "submit",
  "placeOrder",
  "readCookies",
  "readSessionStorage",
  "handleCredentials",
  "switchAccount",
  "switchSide",
];

function readyHarnessDecision(
  overrides: Partial<FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision> = {},
): FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision {
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
    ...overrides,
  } as FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision;
}

function readyFinalDecision(
  overrides: Partial<FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision> = {},
): FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision {
  const harness = readyHarnessDecision();

  return {
    status: "ready_for_live_fill_only_invocation",
    ready_for_live_fill_only_invocation: true,
    blocked_reasons: [],
    blockers: [],
    final_harness_decision: harness,
    gated_real_browser_fill_only_run_decision: {
      status: "ready_for_fill_only_browser_run",
      approval_snapshot: {
        approval_state: "real_browser_run_approved_for_fill_only",
      },
    },
    invocation_phases: [],
    field_fill_plan: harness.field_fill_plan,
    ...overrides,
  } as FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision;
}

function readyAttemptDecision(
  overrides: Partial<FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision> = {},
): FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision {
  return {
    status: "attempt_plan_created",
    ready_for_live_fill_only_attempt: true,
    attempt_plan_created: true,
    blocked_reasons: [],
    blockers: [],
    final_live_fill_only_invocation_decision: readyFinalDecision(),
    ...overrides,
  } as FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision;
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

function fakeNoOpRunner(
  calls: string[],
): FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunner {
  const ok = (method: string) => {
    calls.push(method);

    return {
      ok: true,
      evidence_id: `simulation-${method}`,
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

function blockedAttempt(
  reason: string,
  status: "blocked" | "failed_safety" = "blocked",
): FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision {
  return readyAttemptDecision({
    status,
    ready_for_live_fill_only_attempt: false,
    attempt_plan_created: false,
    blocked_reasons: [reason],
    blockers: [reason],
  });
}

test("simulation reaches ready_for_live_invocation_execute without a runner", () => {
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
  expect(decision.execution_phases.map((phase) => phase.key)).toContain(
    "stop_before_review",
  );
  expect(decision.evidence_requirements).toEqual(
    expect.arrayContaining([
      "pre_execute_visible_order_form_evidence",
      "filled_amount_and_price_evidence",
      "total_amount_read_evidence",
      "stop_before_review_evidence",
      "no_review_modal_evidence",
      "no_final_or_submit_evidence",
    ]),
  );
  expect(decision.abort_conditions).toEqual(
    expect.arrayContaining([
      "review_requested_or_targeted",
      "final_confirm_requested_or_targeted",
      "submit_or_order_placement_requested",
      "credential_or_session_handling_requested",
      "sell_stop_loss_or_glidande_requested",
    ]),
  );
});

test("simulation reaches execute_plan_created with a local fake runner only", () => {
  const calls: string[] = [];
  const decision = buildFirstFillOnlyPocLiveInvocationExecuteDecision(
    safeRequest({
      execution_plan_explicitly_requested: true,
      runner: fakeNoOpRunner(calls),
    }),
  );

  expect(decision.status).toBe("execute_plan_created");
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
  expect(decision.runner_boundary.allowed_method_names).toEqual(
    allowedRunnerMethods,
  );
  expect(decision.runner_boundary.forbidden_method_names).toEqual(
    expect.arrayContaining([
      "clickReview",
      "clickConfirm",
      "submit",
      "placeOrder",
      "readCookies",
      "readSessionStorage",
      "handleCredentials",
    ]),
  );
});

test("positive simulation keeps all hard capabilities disabled", () => {
  const decision = buildFirstFillOnlyPocLiveInvocationExecuteDecision(
    safeRequest(),
  );

  expect(decision.capability_flags).toMatchObject({
    can_launch_browser: false,
    can_access_avanza_without_user_session: false,
    can_handle_credentials: false,
    can_read_session_data: false,
    can_click_review: false,
    can_click_final_confirm: false,
    can_submit_order: false,
    can_place_order: false,
    can_mutate_trades_or_pnl: false,
  });
  expect(decision.safety_confirmations).toMatchObject({
    no_live_avanza_run_during_validation: true,
    no_browser_launch_or_control_during_validation: true,
    no_credential_bankid_2fa_or_session_handling: true,
    no_review_click: true,
    no_final_confirm: true,
    no_submit_or_order_placement: true,
    no_database_write: true,
    no_scan_route_or_audit_writer_client_invocation: true,
    no_trade_stats_or_pnl_mutation: true,
  });
});

test.describe("negative live invocation execute simulation gates", () => {
  const blockedCases: {
    name: string;
    overrides: Partial<FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRequest>;
    expectedReason: string;
    expectedStatus?: "blocked" | "failed_safety";
  }[] = [
    {
      name: "execution gate not ready",
      overrides: {
        live_invocation_execution_gate_decision_snapshot:
          "live_invocation_execution_gate_deferred",
      },
      expectedReason: "live_invocation_execution_gate:not_ready",
    },
    {
      name: "run attempt gate not ready",
      overrides: {
        live_invocation_run_attempt_gate_decision_snapshot:
          "live_invocation_run_attempt_gate_deferred",
      },
      expectedReason: "live_invocation_run_attempt_gate:not_ready",
    },
    {
      name: "final operator GO missing",
      overrides: { final_operator_go_snapshot: "final_operator_go_deferred" },
      expectedReason: "final_operator_go:not_ready",
    },
    {
      name: "immediate confirmation missing",
      overrides: {
        immediate_pre_invocation_confirmation_snapshot:
          "immediate_pre_invocation_confirmation_deferred",
      },
      expectedReason: "immediate_pre_invocation_confirmation:not_ready",
    },
    {
      name: "final live invocation wrapper not ready",
      overrides: {
        live_fill_only_invocation_attempt_decision_snapshot:
          readyAttemptDecision({
            final_live_fill_only_invocation_decision: readyFinalDecision({
              status: "blocked",
              ready_for_live_fill_only_invocation: false,
              blocked_reasons: ["final_pre_live_review:not_ready"],
              blockers: ["final_pre_live_review:not_ready"],
            }),
          }),
      },
      expectedReason: "final_live_invocation_wrapper:blocked",
    },
    {
      name: "final harness not ready",
      overrides: {
        live_fill_only_invocation_attempt_decision_snapshot:
          readyAttemptDecision({
            final_live_fill_only_invocation_decision: readyFinalDecision({
              final_harness_decision: readyHarnessDecision({
                status: "blocked",
                ready_for_final_fill_only_run: false,
                blocked_reasons: ["final_harness:not_ready"],
                blockers: ["final_harness:not_ready"],
              }),
            }),
          }),
      },
      expectedReason: "final_harness:blocked",
    },
    {
      name: "approval state missing",
      overrides: {
        live_fill_only_invocation_attempt_decision_snapshot: blockedAttempt(
          "final_live_invocation_wrapper:run_approval:not_ready",
        ),
      },
      expectedReason:
        "live_invocation_attempt:final_live_invocation_wrapper:run_approval:not_ready",
    },
    {
      name: "final pre-run evidence not ready",
      overrides: { final_pre_run_evidence_snapshot: "missing" },
      expectedReason: "final_pre_run_evidence:not_ready",
    },
    {
      name: "operator absent",
      overrides: { operator_present: false },
      expectedReason: "operator_presence:not_confirmed",
    },
    {
      name: "manual login not confirmed",
      overrides: { manual_avanza_login_confirmed: false },
      expectedReason: "manual_login:not_confirmed",
    },
    {
      name: "account not verified",
      overrides: { account_verification_confirmed: false },
      expectedReason: "account:not_confirmed",
    },
    {
      name: "instrument not verified",
      overrides: { instrument_verification_confirmed: false },
      expectedReason: "instrument:not_confirmed",
    },
    {
      name: "cap above locked limit",
      overrides: { cap_sek: 1000.01 },
      expectedReason: "cap_exceeded",
      expectedStatus: "failed_safety",
    },
    {
      name: "wrong side",
      overrides: {
        live_fill_only_invocation_attempt_decision_snapshot: blockedAttempt(
          "final_live_invocation_wrapper:wrong_side",
        ),
      },
      expectedReason: "live_invocation_attempt:final_live_invocation_wrapper:wrong_side",
    },
    {
      name: "wrong order type",
      overrides: {
        live_fill_only_invocation_attempt_decision_snapshot: blockedAttempt(
          "final_live_invocation_wrapper:wrong_order_type",
        ),
      },
      expectedReason:
        "live_invocation_attempt:final_live_invocation_wrapper:wrong_order_type",
    },
    {
      name: "review requested",
      overrides: {
        live_fill_only_invocation_attempt_decision_snapshot: blockedAttempt(
          "review_requested_or_targeted",
          "failed_safety",
        ),
      },
      expectedReason: "live_invocation_attempt:review_requested_or_targeted",
      expectedStatus: "failed_safety",
    },
    {
      name: "final confirm requested",
      overrides: {
        live_fill_only_invocation_attempt_decision_snapshot: blockedAttempt(
          "final_confirm_requested_or_targeted",
          "failed_safety",
        ),
      },
      expectedReason:
        "live_invocation_attempt:final_confirm_requested_or_targeted",
      expectedStatus: "failed_safety",
    },
    {
      name: "submit or order placement requested",
      overrides: {
        live_fill_only_invocation_attempt_decision_snapshot: blockedAttempt(
          "submit_or_order_placement_requested",
          "failed_safety",
        ),
      },
      expectedReason:
        "live_invocation_attempt:submit_or_order_placement_requested",
      expectedStatus: "failed_safety",
    },
    {
      name: "credential or session handling requested",
      overrides: {
        live_fill_only_invocation_attempt_decision_snapshot: blockedAttempt(
          "credential_or_session_handling_requested",
          "failed_safety",
        ),
      },
      expectedReason:
        "live_invocation_attempt:credential_or_session_handling_requested",
      expectedStatus: "failed_safety",
    },
    {
      name: "sell requested",
      overrides: {
        live_fill_only_invocation_attempt_decision_snapshot: blockedAttempt(
          "sell_stop_loss_or_glidande_requested",
          "failed_safety",
        ),
      },
      expectedReason:
        "live_invocation_attempt:sell_stop_loss_or_glidande_requested",
      expectedStatus: "failed_safety",
    },
  ];

  test("disabled wrapper remains disabled", () => {
    const decision = buildFirstFillOnlyPocLiveInvocationExecuteDecision();

    expect(decision.status).toBe("disabled");
    expect(decision.runner_calls).toEqual([]);
  });

  for (const blockedCase of blockedCases) {
    test(`blocks ${blockedCase.name}`, () => {
      const decision = buildFirstFillOnlyPocLiveInvocationExecuteDecision(
        safeRequest(blockedCase.overrides),
      );

      expect(decision.status).toBe(blockedCase.expectedStatus ?? "blocked");
      expect(decision.blocked_reasons).toContain(blockedCase.expectedReason);
      expect(decision.runner_calls).toEqual([]);
    });
  }
});

test("production wrapper source has no live browser, Avanza, DOM, route, Supabase, service-role, or forbidden runner capability", () => {
  const source = readFileSync(wrapperPath, "utf8");

  expect(source).not.toMatch(/from ['"]@playwright\/test/);
  expect(source).not.toMatch(/playwright|puppeteer|chromium\.launch/);
  expect(source).not.toMatch(/\.goto\(|\.locator\(|document\.querySelector/);
  expect(source).not.toMatch(/fetch\(|supabase|SERVICE_ROLE|process\.env/);
  expect(source).not.toMatch(/run-scan|audit\/writer|provider/);

  for (const method of forbiddenRunnerNames) {
    expect(source).not.toMatch(new RegExp(`${method}\\s*[:(]`));
  }
});
