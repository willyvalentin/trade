import {
  buildFirstFillOnlyPocFinalLiveFillOnlyInvocationDecision,
  firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationAbortConditions,
  firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationEvidenceRequirements,
  firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationPhases,
  type FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision,
  type FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationFillTargets,
  type FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationRequest,
} from "@/lib/first-real-avanza-fill-only-poc-final-live-fill-only-invocation-wrapper";
import {
  firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
  firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
  firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
} from "@/lib/first-real-avanza-fill-only-poc-real-browser-adapter-skeleton";

export type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptStatus =
  | "disabled"
  | "blocked"
  | "ready_for_live_fill_only_attempt"
  | "attempt_plan_created"
  | "failed_safety";

export type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptPhase = {
  key:
    | "verify_run_attempt_gate"
    | "verify_final_operator_go"
    | "verify_final_invocation_wrapper_ready"
    | "verify_final_harness_ready"
    | "verify_final_pre_run_evidence"
    | "verify_operator_presence"
    | "verify_manual_login_confirmed"
    | "verify_account_confirmed"
    | "verify_instrument_confirmed"
    | "verify_visible_order_form_state"
    | "verify_buy_side"
    | "verify_advanced_limit_order_type"
    | "prepare_amount_field_fill"
    | "prepare_price_field_fill"
    | "read_total_amount"
    | "verify_cap_after_total_parse"
    | "capture_stop_before_review_evidence"
    | "stop_before_review";
  label: string;
  mode:
    | "gate_check"
    | "manual_confirmation"
    | "metadata_only"
    | "future_fill_plan_metadata"
    | "future_read_plan_metadata"
    | "evidence_capture"
    | "hard_stop";
  selector: string | null;
};

export type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerAllowedMethod =
  | "verifyVisibleOrderFormState"
  | "fillAmountField"
  | "fillPriceField"
  | "readTotalAmount"
  | "captureEvidence"
  | "stopBeforeReview";

export type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerForbiddenMethod =
  | "clickReview"
  | "clickConfirm"
  | "submit"
  | "placeOrder"
  | "readCookies"
  | "readSessionStorage"
  | "handleCredentials";

export type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptCapabilities =
  {
    can_launch_browser: false;
    can_access_avanza_without_user_session: false;
    can_handle_credentials: false;
    can_read_session_data: false;
    can_click_review: false;
    can_click_final_confirm: false;
    can_submit_order: false;
    can_place_order: false;
    can_mutate_trades_or_pnl: false;
    can_prepare_attempt_plan: boolean;
    can_execute_runner_methods_in_this_action: false;
  };

export type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary =
  {
    mode:
      "metadata_only_allowed_method_names_no_runner_invocation_no_browser_control";
    allowed_method_names: readonly FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerAllowedMethod[];
    forbidden_method_names: readonly FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerForbiddenMethod[];
    runner_invoked_in_this_action: false;
    browser_launch_allowed: false;
    credential_or_session_access_allowed: false;
    review_or_confirm_or_submit_allowed: false;
  };

export type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision = {
  status: FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptStatus;
  live_fill_only_invocation_attempt_enabled: boolean;
  ready_for_live_fill_only_attempt: boolean;
  attempt_plan_created: boolean;
  ready_status_meaning:
    "ready_for_live_fill_only_attempt_means_wrapper_ready_under_locked_scope_no_avanza_run_performed_no_review_final_or_submit_authorized";
  attempt_plan_meaning:
    "attempt_plan_created_means_metadata_plan_only_no_browser_launch_no_field_fill_no_review_final_or_submit";
  blocked_reasons: readonly string[];
  blockers: readonly string[];
  final_live_fill_only_invocation_decision:
    | FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision
    | null;
  attempt_phases: readonly FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptPhase[];
  final_invocation_phases: FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision["invocation_phases"];
  field_fill_plan: FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationFillTargets;
  runner_boundary: FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary;
  hard_forbidden_selectors: readonly string[];
  blocked_review_selectors: readonly string[];
  abort_conditions: readonly string[];
  evidence_requirements: readonly string[];
  blocked_actions: readonly string[];
  capability_flags: FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptCapabilities;
  stop_point: "before_review_button";
  result_notes: readonly string[];
  safety_confirmations: {
    disabled_by_default: true;
    explicit_trigger_only: true;
    no_live_avanza_run_this_action: true;
    no_browser_launch_or_control_this_action: true;
    no_real_avanza_access_this_action: true;
    no_credential_bankid_2fa_or_session_handling: true;
    no_review_click: true;
    no_review_modal: true;
    no_final_confirm: true;
    no_submit_or_order_placement: true;
    no_sell_stop_loss_or_glidande: true;
    cap_not_above_1000_sek: true;
    amount_based_buy_limit_only: true;
    no_database_write: true;
    no_scan_route_or_audit_writer_client_invocation: true;
    no_trade_stats_or_pnl_mutation: true;
  };
};

export type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest =
  FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationRequest & {
    live_fill_only_invocation_attempt_enabled?: boolean | null;
    live_invocation_run_attempt_gate_decision_snapshot?:
      | "live_invocation_run_attempt_gate_ready"
      | string
      | null;
    final_operator_go_snapshot?: "final_operator_go" | string | null;
    final_live_fill_only_invocation_decision_snapshot?:
      | FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision
      | "ready_for_live_fill_only_invocation"
      | string
      | null;
  };

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function toAttemptPhases(): FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptPhase[] {
  return [
    {
      key: "verify_run_attempt_gate",
      label: "Verify live invocation run attempt gate",
      mode: "gate_check",
      selector: null,
    },
    {
      key: "verify_final_operator_go",
      label: "Verify final operator GO",
      mode: "gate_check",
      selector: null,
    },
    {
      key: "verify_final_invocation_wrapper_ready",
      label: "Verify final live invocation wrapper readiness",
      mode: "gate_check",
      selector: null,
    },
    {
      key: "verify_final_harness_ready",
      label: "Verify final real browser fill-only harness readiness",
      mode: "gate_check",
      selector: null,
    },
    {
      key: "verify_final_pre_run_evidence",
      label: "Verify final pre-run evidence",
      mode: "gate_check",
      selector: null,
    },
    ...firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationPhases.filter(
      (phase) =>
        ![
          "verify_final_pre_live_review",
          "verify_final_harness_ready",
          "verify_final_pre_run_evidence",
          "verify_run_approval",
        ].includes(phase.key),
    ).map((phase) => ({
      key: phase.key,
      label: phase.label,
      mode: phase.mode,
      selector: phase.selector,
    })) as FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptPhase[],
  ];
}

export const firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptPhases =
  toAttemptPhases();

export const firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary =
  {
    mode: "metadata_only_allowed_method_names_no_runner_invocation_no_browser_control",
    allowed_method_names: [
      "verifyVisibleOrderFormState",
      "fillAmountField",
      "fillPriceField",
      "readTotalAmount",
      "captureEvidence",
      "stopBeforeReview",
    ],
    forbidden_method_names: [
      "clickReview",
      "clickConfirm",
      "submit",
      "placeOrder",
      "readCookies",
      "readSessionStorage",
      "handleCredentials",
    ],
    runner_invoked_in_this_action: false,
    browser_launch_allowed: false,
    credential_or_session_access_allowed: false,
    review_or_confirm_or_submit_allowed: false,
  } as const satisfies FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary;

export const firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptAbortConditions =
  uniqueStrings([
    "live_invocation_attempt_wrapper_disabled",
    "run_attempt_gate_not_ready",
    "final_operator_go_not_ready",
    "final_invocation_wrapper_not_ready",
    "final_harness_not_ready",
    "final_pre_run_evidence_not_ready",
    "operator_presence_not_confirmed",
    "manual_login_not_confirmed",
    "account_not_confirmed",
    "instrument_not_confirmed",
    "visible_order_form_state_unverified",
    "wrong_side",
    "wrong_order_type",
    "cap_exceeded",
    "review_requested_or_targeted",
    "final_confirm_requested_or_targeted",
    "submit_or_order_placement_requested",
    "credential_or_session_handling_requested",
    "sell_stop_loss_or_glidande_requested",
    "any_uncertainty",
    ...firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationAbortConditions,
  ]);

export const firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptEvidenceRequirements =
  uniqueStrings([
    "pre_attempt_visible_order_form_evidence",
    "intended_amount_and_price_values",
    "selector_plan",
    "filled_field_evidence_only_if_future_invocation_fills_fields",
    "stop_before_review_evidence",
    "no_review_modal_evidence",
    "no_final_or_submit_evidence",
    ...firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationEvidenceRequirements,
  ]);

const safetyConfirmations = {
  disabled_by_default: true,
  explicit_trigger_only: true,
  no_live_avanza_run_this_action: true,
  no_browser_launch_or_control_this_action: true,
  no_real_avanza_access_this_action: true,
  no_credential_bankid_2fa_or_session_handling: true,
  no_review_click: true,
  no_review_modal: true,
  no_final_confirm: true,
  no_submit_or_order_placement: true,
  no_sell_stop_loss_or_glidande: true,
  cap_not_above_1000_sek: true,
  amount_based_buy_limit_only: true,
  no_database_write: true,
  no_scan_route_or_audit_writer_client_invocation: true,
  no_trade_stats_or_pnl_mutation: true,
} as const;

const resultNotes = [
  "this_attempt_wrapper_addition_does_not_run_avanza",
  "attempt_plan_created_does_not_fill_fields",
  "attempt_plan_created_does_not_open_review_or_confirmation",
  "ready_for_live_fill_only_attempt_requires_explicit_future_operator_invocation",
  "wrapper_must_stop_before_review",
] as const;

function capabilityFlags(
  canPrepareAttemptPlan: boolean,
): FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptCapabilities {
  return {
    can_launch_browser: false,
    can_access_avanza_without_user_session: false,
    can_handle_credentials: false,
    can_read_session_data: false,
    can_click_review: false,
    can_click_final_confirm: false,
    can_submit_order: false,
    can_place_order: false,
    can_mutate_trades_or_pnl: false,
    can_prepare_attempt_plan: canPrepareAttemptPlan,
    can_execute_runner_methods_in_this_action: false,
  };
}

function emptyFieldFillPlan(
  input: FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest,
): FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationFillTargets {
  const finalDecision = buildFirstFillOnlyPocFinalLiveFillOnlyInvocationDecision({
    ...input,
    final_live_fill_only_invocation_enabled: true,
  });

  return finalDecision.field_fill_plan;
}

function disabledDecision(
  input: FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest,
): FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision {
  return {
    status: "disabled",
    live_fill_only_invocation_attempt_enabled: false,
    ready_for_live_fill_only_attempt: false,
    attempt_plan_created: false,
    ready_status_meaning:
      "ready_for_live_fill_only_attempt_means_wrapper_ready_under_locked_scope_no_avanza_run_performed_no_review_final_or_submit_authorized",
    attempt_plan_meaning:
      "attempt_plan_created_means_metadata_plan_only_no_browser_launch_no_field_fill_no_review_final_or_submit",
    blocked_reasons: ["live_fill_only_invocation_attempt_disabled"],
    blockers: ["live_fill_only_invocation_attempt_disabled"],
    final_live_fill_only_invocation_decision: null,
    attempt_phases: firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptPhases,
    final_invocation_phases:
      firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationPhases,
    field_fill_plan: emptyFieldFillPlan(input),
    runner_boundary:
      firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary,
    hard_forbidden_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
    blocked_review_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
    abort_conditions:
      firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptAbortConditions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptEvidenceRequirements,
    blocked_actions: firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
    capability_flags: capabilityFlags(false),
    stop_point: "before_review_button",
    result_notes: resultNotes,
    safety_confirmations: safetyConfirmations,
  };
}

function resolveFinalLiveDecision(
  input: FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest,
): FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision {
  const snapshot = input.final_live_fill_only_invocation_decision_snapshot;

  if (snapshot && typeof snapshot === "object") {
    return snapshot;
  }

  return buildFirstFillOnlyPocFinalLiveFillOnlyInvocationDecision({
    ...input,
    final_live_fill_only_invocation_enabled:
      input.final_live_fill_only_invocation_enabled ?? true,
  });
}

function directBlockers(
  input: FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest,
  finalDecision: FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision,
): string[] {
  const reasons: string[] = [];

  if (
    input.live_invocation_run_attempt_gate_decision_snapshot !==
    "live_invocation_run_attempt_gate_ready"
  ) {
    reasons.push("live_invocation_run_attempt_gate:not_ready");
  }

  if (input.final_operator_go_snapshot !== "final_operator_go") {
    reasons.push("final_operator_go:not_ready");
  }

  if (finalDecision.status !== "ready_for_live_fill_only_invocation") {
    reasons.push(`final_live_invocation_wrapper:${finalDecision.status}`);
  }

  const finalHarnessStatus = finalDecision.final_harness_decision?.status;

  if (finalHarnessStatus !== "ready_for_final_fill_only_run") {
    reasons.push(`final_harness:${finalHarnessStatus ?? "missing"}`);
  }

  if (input.final_pre_run_evidence_snapshot !== "final_pre_run_evidence_ready") {
    reasons.push("final_pre_run_evidence:not_ready");
  }

  return reasons;
}

function statusFromBlockers(
  blockers: readonly string[],
): FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptStatus {
  if (blockers.length === 0) {
    return "attempt_plan_created";
  }

  const failedSafety = blockers.some((reason) =>
    /(review_click|review_modal|review_requested|final_confirm|submit|placement|credential|session|browser_launch|avanza_access|dom_query|field_fill|sell|stop_loss|glidande|unattended|forbidden|cap_exceeds|cap_exceeded|selector_policy:forbidden)/.test(
      reason,
    ),
  );

  return failedSafety ? "failed_safety" : "blocked";
}

export function buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision(
  input: FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest = {},
): FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision {
  if (input.live_fill_only_invocation_attempt_enabled !== true) {
    return disabledDecision(input);
  }

  const finalDecision = resolveFinalLiveDecision(input);
  const finalDecisionBlockers =
    finalDecision.status === "ready_for_live_fill_only_invocation"
      ? []
      : finalDecision.blocked_reasons.map(
          (reason) => `final_live_invocation_wrapper:${reason}`,
        );
  const blockers = uniqueStrings([
    ...directBlockers(input, finalDecision),
    ...finalDecisionBlockers,
  ]);
  const status = statusFromBlockers(blockers);
  const attemptPlanCreated = status === "attempt_plan_created";

  return {
    status,
    live_fill_only_invocation_attempt_enabled: true,
    ready_for_live_fill_only_attempt: attemptPlanCreated,
    attempt_plan_created: attemptPlanCreated,
    ready_status_meaning:
      "ready_for_live_fill_only_attempt_means_wrapper_ready_under_locked_scope_no_avanza_run_performed_no_review_final_or_submit_authorized",
    attempt_plan_meaning:
      "attempt_plan_created_means_metadata_plan_only_no_browser_launch_no_field_fill_no_review_final_or_submit",
    blocked_reasons: blockers,
    blockers,
    final_live_fill_only_invocation_decision: finalDecision,
    attempt_phases: firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptPhases,
    final_invocation_phases: finalDecision.invocation_phases,
    field_fill_plan: finalDecision.field_fill_plan,
    runner_boundary:
      firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary,
    hard_forbidden_selectors: finalDecision.hard_forbidden_selectors,
    blocked_review_selectors: finalDecision.blocked_review_selectors,
    abort_conditions:
      firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptAbortConditions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptEvidenceRequirements,
    blocked_actions: finalDecision.blocked_actions,
    capability_flags: capabilityFlags(attemptPlanCreated),
    stop_point: "before_review_button",
    result_notes: resultNotes,
    safety_confirmations: safetyConfirmations,
  };
}
