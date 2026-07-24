import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { FirstFillOnlyPocApprovalStateInput } from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type { FirstFillOnlyPocDryRunDecisionInput } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { buildFirstFillOnlyPocExecutionDryRunAdapterDecision } from "../../lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton";
import {
  buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision,
  firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary,
  type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest,
} from "../../lib/first-real-avanza-fill-only-poc-live-fill-only-invocation-attempt-wrapper";
import { buildFirstFillOnlyPocManualRunSetupDecision } from "../../lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const simulationPath = join(
  repoRoot,
  "tests/e2e/first-real-avanza-fill-only-poc-live-fill-only-invocation-attempt-dry-run-simulation.spec.ts",
);
const wrapperPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-live-fill-only-invocation-attempt-wrapper.ts",
);
const now = "2026-06-30T19:05:00.000Z";

function approval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-30T18:00:00.000Z",
      ends_at: "2026-06-30T20:00:00.000Z",
      evaluated_at: now,
    },
    operator_present: true,
    max_amount_cap_sek: 1000,
    scope: {
      buy_only: true,
      order_type: "limit",
      sizing_mode: "amount",
      stop_point: "before_granska_kop",
      review_click_allowed: false,
      review_click_requested: false,
      final_confirm_allowed: false,
      final_confirm_requested: false,
      credentials_or_2fa_handling_allowed: false,
      unattended_run_allowed: false,
    },
    acknowledgements: {
      no_final_confirm: true,
      no_review_click_first_poc: true,
      no_credentials_or_2fa_handling: true,
      no_unattended_run: true,
      account_human_verified: true,
      instrument_human_verified: true,
      kill_switch_cancel_plan: true,
      evidence_plan: true,
    },
  };

  return {
    ...base,
    ...overrides,
    approval_window: {
      ...base.approval_window,
      ...overrides.approval_window,
    },
    scope: {
      ...base.scope,
      ...overrides.scope,
    },
    acknowledgements: {
      ...base.acknowledgements,
      ...overrides.acknowledgements,
    },
  };
}

function payload(
  overrides: Partial<SemiAutoAvanzaAgentPayload> = {},
): SemiAutoAvanzaAgentPayload {
  return {
    ...buildSemiAutoRecommendationBuyPayload(
      {
        recommendation_id: "rec-first-fill-only-attempt-dry-run-001",
        recommendation_fingerprint:
          "first-fill-only-attempt-dry-run-fp-001",
        ticker: "GME",
        quantity: 2,
        order_type: "limit",
        entry_price: 21.98,
        limit_price: 21.98,
        stop_price: 20,
        target_price: 25,
        created_at: "2026-06-30T18:10:00.000Z",
        expires_at: "2026-06-30T19:50:00.000Z",
        stale_after: "2026-06-30T19:45:00.000Z",
        broker_target_label: "First fill-only attempt dry-run fixture",
      },
      { now },
    ).payload,
    ...overrides,
  };
}

type SafeRequestOverrides = Partial<
  Omit<
    FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest,
    | "approval_snapshot"
    | "payload_snapshot"
    | "selector_readiness_snapshot"
    | "operator_approval_snapshot"
    | "manual_run_setup_decision_snapshot"
    | "execution_dry_run_decision_snapshot"
  >
> & {
  approval_snapshot?: Partial<FirstFillOnlyPocApprovalStateInput> | null;
  dry_run?: {
    static_payload?: Partial<FirstFillOnlyPocDryRunDecisionInput["static_payload"]>;
    selector_readiness?: Partial<
      FirstFillOnlyPocDryRunDecisionInput["selector_readiness"]
    >;
    operator_approval?: Partial<
      FirstFillOnlyPocDryRunDecisionInput["operator_approval"]
    >;
  };
};

function safeSimulationInput(
  overrides: SafeRequestOverrides = {},
): FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest {
  const {
    approval_snapshot: approvalOverride,
    dry_run: dryRunOverride,
    ...requestOverrides
  } = overrides;
  const approvalSnapshot =
    approvalOverride === null ? null : approval(approvalOverride);
  const staticPayload = {
    payload: payload(dryRunOverride?.static_payload?.payload ?? {}),
    order_form: "avancerad",
    requested_action: "fill_only",
    max_amount_cap_sek: 1000,
    currency: "SEK",
    order_type: "limit",
    side: "buy",
    ...dryRunOverride?.static_payload,
  } satisfies FirstFillOnlyPocDryRunDecisionInput["static_payload"];
  const selectorReadiness = {
    available_selector_keys: getRequiredFirstFillOnlySelectorKeys(),
    requested_selectors: [],
    sizing_mode: "amount",
    total_amount_selector_available: true,
    total_amount_text: "438,05 SEK",
    generated_selector_strategy_used: false,
    validation_errors: [],
    review_click_requested: false,
    ...dryRunOverride?.selector_readiness,
  } satisfies FirstFillOnlyPocDryRunDecisionInput["selector_readiness"];
  const operatorApproval = {
    approval_decision: "approved_for_first_fill_only_poc",
    account_human_verified: true,
    instrument_human_verified: true,
    price_currency_human_verified: true,
    ...dryRunOverride?.operator_approval,
  } satisfies FirstFillOnlyPocDryRunDecisionInput["operator_approval"];
  const operatorSetup = {
    setup_decision: "operator_setup_ready_for_manual_run_setup",
    operator_present: true,
    manual_login_ready: true,
    avanza_page_opened_by_operator: true,
    credentials_or_2fa_handled_by_operator: true,
    kill_switch_cancel_plan_ready: true,
    account_verified: true,
    instrument_verified: true,
  } as const;
  const evidencePlan = {
    evidence_plan_acknowledged: true,
    screenshot_redaction_acknowledged: true,
    real_browser_skeleton_evidence_acknowledged: true,
    pre_run_visible_state_evidence_planned: true,
    intended_values_evidence_planned: true,
    selector_plan_evidence_planned: true,
    stop_before_review_evidence_planned: true,
    no_review_modal_evidence_planned: true,
    no_final_or_submit_evidence_planned: true,
    planned_artifacts: [
      "fresh_final_pre_run_evidence",
      "pre_run_visible_state",
      "selector_plan",
      "stop_before_review",
      "no_review_modal",
      "no_final_or_submit",
    ],
  } as const;
  const requestedActions = {
    review_click_requested: false,
    review_modal_requested: false,
    final_confirm_requested: false,
    order_submit_requested: false,
    order_placement_requested: false,
    credential_or_session_handling_requested: false,
    browser_launch_requested: false,
    avanza_access_requested: false,
    dom_query_requested: false,
    field_fill_requested: false,
    sell_requested: false,
    stop_loss_requested: false,
    glidande_requested: false,
    account_change_requested: false,
    side_switch_requested: false,
    steppers_requested: false,
    select_all_account_requested: false,
    browser_unattended_run_requested: false,
  } as const;
  const manualDecision = buildFirstFillOnlyPocManualRunSetupDecision({
    manual_run_setup_adapter_enabled: true,
    approval_snapshot: approvalSnapshot,
    operator_setup_evidence_snapshot: operatorSetup,
    payload_snapshot: staticPayload,
    selector_readiness_snapshot: selectorReadiness,
    operator_approval_snapshot: operatorApproval,
    intended_amount_sek: 427.26,
    intended_price: 21.98,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    requested_actions: requestedActions,
  });
  const executionDecision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision({
    execution_dry_run_adapter_enabled: true,
    manual_run_setup_decision_snapshot: manualDecision,
    approval_snapshot: approvalSnapshot,
    operator_setup_snapshot: operatorSetup,
    payload_snapshot: staticPayload,
    selector_readiness_snapshot: selectorReadiness,
    operator_approval_snapshot: operatorApproval,
    intended_amount_sek: 427.26,
    intended_price: 21.98,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    requested_actions: requestedActions,
  });

  return {
    live_fill_only_invocation_attempt_enabled: true,
    live_invocation_run_attempt_gate_decision_snapshot:
      "live_invocation_run_attempt_gate_ready",
    final_operator_go_snapshot: "final_operator_go",
    final_live_fill_only_invocation_enabled: true,
    final_pre_live_review_decision_snapshot:
      "final_pre_live_run_review_ready",
    final_real_browser_fill_only_run_harness_enabled: true,
    final_harness_gate_decision_snapshot:
      "final_real_browser_run_harness_gate_ready",
    final_pre_run_evidence_snapshot: "final_pre_run_evidence_ready",
    real_browser_fill_only_run_adapter_enabled: true,
    run_gate_decision_snapshot: "real_browser_fill_only_run_gate_ready",
    real_browser_run_approval_snapshot:
      "real_browser_run_approved_for_fill_only",
    real_browser_adapter_safety_gate_decision:
      "real_browser_adapter_safety_gate_ready",
    manual_avanza_login_confirmed: true,
    account_verification_confirmed: true,
    instrument_verification_confirmed: true,
    real_browser_adapter_enabled: true,
    manual_run_setup_decision_snapshot: manualDecision,
    execution_dry_run_decision_snapshot: executionDecision,
    approval_snapshot: approvalSnapshot,
    operator_setup_snapshot: operatorSetup,
    operator_setup_evidence_snapshot: operatorSetup,
    payload_snapshot: staticPayload,
    selector_readiness_snapshot: selectorReadiness,
    operator_approval_snapshot: operatorApproval,
    intended_amount_sek: 427.26,
    intended_price: 21.98,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    manual_setup_evidence_plan_snapshot: evidencePlan,
    operator_presence_confirmed: true,
    requested_actions: requestedActions,
    ...requestOverrides,
  };
}

test.describe("first fill-only POC live invocation attempt dry-run simulation", () => {
  test("positive local simulation creates an attempt plan with all hard stops intact", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
        safeSimulationInput(),
      );

    expect(["ready_for_live_fill_only_attempt", "attempt_plan_created"]).toContain(
      decision.status,
    );
    expect(decision.ready_for_live_fill_only_attempt).toBe(true);
    expect(decision.attempt_plan_created).toBe(true);
    expect(decision.blocked_reasons).toEqual([]);
    expect(decision.final_live_fill_only_invocation_decision?.status).toBe(
      "ready_for_live_fill_only_invocation",
    );
    expect(
      decision.final_live_fill_only_invocation_decision?.final_harness_decision
        ?.status,
    ).toBe("ready_for_final_fill_only_run");
  });

  test("positive simulation exposes phases, metadata-only field plan, evidence, and abort conditions", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
        safeSimulationInput(),
      );

    expect(decision.attempt_phases.map((phase) => phase.key)).toEqual([
      "verify_run_attempt_gate",
      "verify_final_operator_go",
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
      "capture_stop_before_review_evidence",
      "stop_before_review",
    ]);
    expect(decision.field_fill_plan).toMatchObject({
      amount: { value: 427.26, mode: "metadata_only_no_fill" },
      price: { value: 21.98, mode: "metadata_only_no_fill" },
      total: { value: null, mode: "metadata_only_no_read" },
      mode: "metadata_only_no_browser_execution",
    });
    expect(decision.evidence_requirements).toEqual(
      expect.arrayContaining([
        "pre_attempt_visible_order_form_evidence",
        "intended_amount_and_price_values",
        "selector_plan",
        "stop_before_review_evidence",
        "no_review_modal_evidence",
        "no_final_or_submit_evidence",
      ]),
    );
    expect(decision.abort_conditions).toEqual(
      expect.arrayContaining([
        "run_attempt_gate_not_ready",
        "final_operator_go_not_ready",
        "final_invocation_wrapper_not_ready",
        "cap_exceeded",
        "review_requested_or_targeted",
        "submit_or_order_placement_requested",
        "credential_or_session_handling_requested",
      ]),
    );
  });

  test("positive simulation cannot review, confirm, submit, handle sessions, or mutate trades", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
        safeSimulationInput(),
      );

    expect(decision.capability_flags.can_click_review).toBe(false);
    expect(decision.capability_flags.can_click_final_confirm).toBe(false);
    expect(decision.capability_flags.can_submit_order).toBe(false);
    expect(decision.capability_flags.can_place_order).toBe(false);
    expect(decision.capability_flags.can_handle_credentials).toBe(false);
    expect(decision.capability_flags.can_read_session_data).toBe(false);
    expect(decision.capability_flags.can_mutate_trades_or_pnl).toBe(false);
    expect(decision.capability_flags.can_launch_browser).toBe(false);
    expect(decision.capability_flags.can_access_avanza_without_user_session).toBe(
      false,
    );
    expect(decision.capability_flags.can_execute_runner_methods_in_this_action).toBe(
      false,
    );
  });

  test("runner boundary is local metadata only and has no review, final, submit, place-order, or session method", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
        safeSimulationInput(),
      );

    expect(decision.runner_boundary).toEqual(
      firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary,
    );
    expect(decision.runner_boundary.allowed_method_names).toEqual([
      "verifyVisibleOrderFormState",
      "fillAmountField",
      "fillPriceField",
      "readTotalAmount",
      "captureEvidence",
      "stopBeforeReview",
    ]);
    expect(decision.runner_boundary.forbidden_method_names).toEqual([
      "clickReview",
      "clickConfirm",
      "submit",
      "placeOrder",
      "readCookies",
      "readSessionStorage",
      "handleCredentials",
    ]);
    expect(decision.runner_boundary.runner_invoked_in_this_action).toBe(false);
  });

  test("negative dry-run scenarios block or fail safety before any attempt plan", () => {
    const cases: Array<{
      name: string;
      overrides: SafeRequestOverrides;
      expectedStatus?: "disabled" | "blocked" | "failed_safety";
    }> = [
      {
        name: "wrapper disabled",
        overrides: { live_fill_only_invocation_attempt_enabled: false },
        expectedStatus: "disabled",
      },
      {
        name: "run gate not ready",
        overrides: {
          live_invocation_run_attempt_gate_decision_snapshot: "not_ready",
        },
      },
      {
        name: "final GO missing",
        overrides: { final_operator_go_snapshot: "missing" },
      },
      {
        name: "final wrapper not ready",
        overrides: { final_pre_live_review_decision_snapshot: "missing" },
      },
      {
        name: "final harness not ready",
        overrides: { final_harness_gate_decision_snapshot: "missing" },
      },
      {
        name: "approval missing",
        overrides: { real_browser_run_approval_snapshot: "missing" },
      },
      {
        name: "final pre-run evidence missing",
        overrides: { final_pre_run_evidence_snapshot: "missing" },
      },
      {
        name: "operator absent",
        overrides: { operator_presence_confirmed: false },
      },
      {
        name: "manual login not confirmed",
        overrides: { manual_avanza_login_confirmed: false },
      },
      {
        name: "account not verified",
        overrides: { account_verification_confirmed: false },
      },
      {
        name: "instrument not verified",
        overrides: { instrument_verification_confirmed: false },
      },
      {
        name: "cap above 1000",
        overrides: {
          cap_sek: 1001,
          dry_run: { static_payload: { max_amount_cap_sek: 1001 } },
        },
        expectedStatus: "failed_safety",
      },
      {
        name: "wrong side",
        overrides: {
          dry_run: {
            static_payload: {
              side: "sell",
              payload: payload({ side: "sell" }),
            },
          },
        },
        expectedStatus: "failed_safety",
      },
      {
        name: "wrong order type",
        overrides: {
          dry_run: {
            static_payload: {
              order_type: "market",
              payload: payload({ order_type: "market" }),
            },
          },
        },
      },
      {
        name: "review requested",
        overrides: { requested_actions: { review_click_requested: true } },
        expectedStatus: "failed_safety",
      },
      {
        name: "final confirm requested",
        overrides: { requested_actions: { final_confirm_requested: true } },
        expectedStatus: "failed_safety",
      },
      {
        name: "submit/order placement requested",
        overrides: { requested_actions: { order_placement_requested: true } },
        expectedStatus: "failed_safety",
      },
      {
        name: "credential/session requested",
        overrides: {
          requested_actions: {
            credential_or_session_handling_requested: true,
          },
        },
        expectedStatus: "failed_safety",
      },
      {
        name: "sell requested",
        overrides: { requested_actions: { sell_requested: true } },
        expectedStatus: "failed_safety",
      },
      {
        name: "Stop Loss requested",
        overrides: { requested_actions: { stop_loss_requested: true } },
        expectedStatus: "failed_safety",
      },
      {
        name: "Glidande requested",
        overrides: { requested_actions: { glidande_requested: true } },
        expectedStatus: "failed_safety",
      },
    ];

    for (const scenario of cases) {
      const decision =
        buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
          safeSimulationInput(scenario.overrides),
        );

      expect(
        decision.status,
        `scenario should block: ${scenario.name}`,
      ).toBe(scenario.expectedStatus ?? "blocked");
      expect(decision.attempt_plan_created).toBe(false);
      expect(decision.ready_for_live_fill_only_attempt).toBe(false);
      expect(decision.blocked_reasons.length).toBeGreaterThan(0);
    }
  });

  test("simulation and wrapper sources do not add executable browser, Avanza, DOM, network, Supabase, route, or submit code", () => {
    const source = [
      readFileSync(simulationPath, "utf8"),
      readFileSync(wrapperPath, "utf8"),
    ].join("\n");
    const forbidden = [
      "puppe" + "teer",
      "chromium" + ".launch",
      "document" + ".",
      "window" + ".",
      "fetch" + "(",
      "process" + ".env",
      "@supa" + "base",
      "create" + "Client",
      ".from" + "(",
      ".insert" + "(",
      "SERVICE" + "_ROLE",
      "service" + "-role",
      "/" + "api/",
      "run-" + "scan",
      "audit-" + "writer",
      ".click" + "(",
      ".locator" + "(",
      ".goto" + "(",
      "avanza" + ".se",
      "Bekr" + "äfta",
      "Bek" + "rafta",
    ];

    for (const token of forbidden) {
      expect(source).not.toContain(token);
    }
  });
});
