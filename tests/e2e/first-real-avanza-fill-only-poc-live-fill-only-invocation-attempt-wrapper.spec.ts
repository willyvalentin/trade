import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { FirstFillOnlyPocApprovalStateInput } from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type { FirstFillOnlyPocDryRunDecisionInput } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { buildFirstFillOnlyPocExecutionDryRunAdapterDecision } from "../../lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton";
import {
  buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision,
  firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptEvidenceRequirements,
  firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptPhases,
  firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary,
  type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest,
} from "../../lib/first-real-avanza-fill-only-poc-live-fill-only-invocation-attempt-wrapper";
import { buildFirstFillOnlyPocManualRunSetupDecision } from "../../lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const wrapperPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-live-fill-only-invocation-attempt-wrapper.ts",
);
const now = "2026-06-30T18:45:00.000Z";

const allFalseHardCapabilities = {
  can_launch_browser: false,
  can_access_avanza_without_user_session: false,
  can_handle_credentials: false,
  can_read_session_data: false,
  can_click_review: false,
  can_click_final_confirm: false,
  can_submit_order: false,
  can_place_order: false,
  can_mutate_trades_or_pnl: false,
  can_execute_runner_methods_in_this_action: false,
} as const;

function approval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-30T18:00:00.000Z",
      ends_at: "2026-06-30T19:00:00.000Z",
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
        recommendation_id: "rec-first-fill-only-attempt-wrapper-001",
        recommendation_fingerprint: "first-fill-only-attempt-wrapper-fp-001",
        ticker: "GME",
        quantity: 2,
        order_type: "limit",
        entry_price: 21.98,
        limit_price: 21.98,
        stop_price: 20,
        target_price: 25,
        created_at: "2026-06-30T18:10:00.000Z",
        expires_at: "2026-06-30T18:50:00.000Z",
        stale_after: "2026-06-30T18:45:00.000Z",
        broker_target_label: "First fill-only attempt wrapper fixture",
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

function safeRequest(
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

test.describe("first fill-only POC live invocation attempt wrapper", () => {
  test("wrapper defaults to disabled", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision();

    expect(decision.status).toBe("disabled");
    expect(decision.live_fill_only_invocation_attempt_enabled).toBe(false);
    expect(decision.attempt_plan_created).toBe(false);
    expect(decision.blocked_reasons).toContain(
      "live_fill_only_invocation_attempt_disabled",
    );
  });

  test("disabled result keeps all live execution capabilities false", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision();

    expect(decision.capability_flags).toMatchObject(allFalseHardCapabilities);
    expect(decision.capability_flags.can_prepare_attempt_plan).toBe(false);
  });

  test("enabled without run attempt gate blocks", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
        safeRequest({
          live_invocation_run_attempt_gate_decision_snapshot: "deferred",
        }),
      );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "live_invocation_run_attempt_gate:not_ready",
    );
  });

  test("enabled without final operator GO blocks", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
        safeRequest({ final_operator_go_snapshot: "no_go" }),
      );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("final_operator_go:not_ready");
  });

  test("enabled without final invocation wrapper readiness blocks", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
        safeRequest({ final_pre_live_review_decision_snapshot: "deferred" }),
      );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "final_live_invocation_wrapper:blocked",
    );
  });

  test("enabled without final harness readiness blocks", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
        safeRequest({ final_harness_gate_decision_snapshot: "not_ready" }),
      );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("final_harness:blocked");
  });

  test("enabled without final pre-run evidence blocks", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
        safeRequest({ final_pre_run_evidence_snapshot: "deferred" }),
      );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "final_pre_run_evidence:not_ready",
    );
  });

  test("cap above 1000 SEK fails safety", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
        safeRequest({
          cap_sek: 1001,
          dry_run: { static_payload: { max_amount_cap_sek: 1001 } },
        }),
      );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain(
      "final_live_invocation_wrapper:final_harness:gated_real_browser_fill_only_run:cap_exceeds_policy",
    );
  });

  test("review, final confirm, submit, credential/session, sell, Stop Loss, and Glidande requests fail safety", () => {
    for (const requested_actions of [
      { review_click_requested: true },
      { final_confirm_requested: true },
      { order_placement_requested: true },
      { credential_or_session_handling_requested: true },
      { sell_requested: true },
      { stop_loss_requested: true },
      { glidande_requested: true },
    ]) {
      const decision =
        buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
          safeRequest({ requested_actions }),
        );

      expect(decision.status).toBe("failed_safety");
      expect(decision.attempt_plan_created).toBe(false);
    }
  });

  test("safe input creates attempt plan without running Avanza", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(safeRequest());

    expect(decision.status).toBe("attempt_plan_created");
    expect(decision.ready_for_live_fill_only_attempt).toBe(true);
    expect(decision.attempt_plan_created).toBe(true);
    expect(decision.blocked_reasons).toEqual([]);
    expect(decision.ready_status_meaning).toBe(
      "ready_for_live_fill_only_attempt_means_wrapper_ready_under_locked_scope_no_avanza_run_performed_no_review_final_or_submit_authorized",
    );
    expect(decision.attempt_plan_meaning).toBe(
      "attempt_plan_created_means_metadata_plan_only_no_browser_launch_no_field_fill_no_review_final_or_submit",
    );
  });

  test("attempt plan keeps all hard live execution capabilities false", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(safeRequest());

    expect(decision.capability_flags).toMatchObject(allFalseHardCapabilities);
    expect(decision.capability_flags.can_prepare_attempt_plan).toBe(true);
  });

  test("attempt plan exposes exactly the live attempt phases", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(safeRequest());

    expect(decision.attempt_phases.map((phase) => phase.key)).toEqual(
      firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptPhases.map(
        (phase) => phase.key,
      ),
    );
  });

  test("attempt plan exposes runner boundary as metadata only", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(safeRequest());

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

  test("attempt plan exposes metadata-only field-fill plan", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(safeRequest());

    expect(decision.field_fill_plan).toMatchObject({
      amount: { value: 427.26, mode: "metadata_only_no_fill" },
      price: { value: 21.98, mode: "metadata_only_no_fill" },
      total: { value: null, mode: "metadata_only_no_read" },
      mode: "metadata_only_no_browser_execution",
    });
  });

  test("attempt plan exposes evidence requirements and stop-before-review boundary", () => {
    const decision =
      buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(safeRequest());

    expect(decision.evidence_requirements).toEqual(
      firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptEvidenceRequirements,
    );
    expect(decision.evidence_requirements).toEqual(
      expect.arrayContaining([
        "pre_attempt_visible_order_form_evidence",
        "intended_amount_and_price_values",
        "selector_plan",
        "filled_field_evidence_only_if_future_invocation_fills_fields",
        "stop_before_review_evidence",
        "no_review_modal_evidence",
        "no_final_or_submit_evidence",
      ]),
    );
    expect(decision.stop_point).toBe("before_review_button");
  });

  test("production attempt wrapper code does not import live browser, database, route, provider, or audit writer code", () => {
    const source = readFileSync(wrapperPath, "utf8");
    const forbidden = [
      "puppeteer",
      "chromium",
      "document.",
      "window.",
      "fetch(",
      "process.env",
      "@supabase",
      "createClient",
      ".from(",
      ".insert(",
      "SERVICE_ROLE",
      "service-role",
      "/api/",
      "provider",
      "run-scan",
      "audit-writer",
      ".click(",
      ".locator(",
      ".goto(",
      "avanza.se",
    ];

    for (const token of forbidden) {
      expect(source).not.toContain(token);
    }
  });
});
