import {
  buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision,
  firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptAbortConditions,
  firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptEvidenceRequirements,
  firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary,
  type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision,
  type FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest,
} from "@/lib/first-real-avanza-fill-only-poc-live-fill-only-invocation-attempt-wrapper";
import type { FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision } from "@/lib/first-real-avanza-fill-only-poc-final-live-fill-only-invocation-wrapper";
import type { FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision } from "@/lib/first-real-avanza-fill-only-poc-final-real-browser-fill-only-run-harness";
import type { FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunDecision } from "@/lib/first-real-avanza-fill-only-poc-gated-real-browser-fill-only-run-adapter";
import {
  firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
  firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
  firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
} from "@/lib/first-real-avanza-fill-only-poc-real-browser-adapter-skeleton";
import { findRealAvanzaSelectorMappingEntry } from "@/lib/real-avanza-selector-mapping-contract";

export type FirstRealAvanzaFillOnlyPocLiveInvocationExecuteStatus =
  | "disabled"
  | "blocked"
  | "ready_for_live_invocation_execute"
  | "execute_plan_created"
  | "failed_safety";

export type FirstRealAvanzaFillOnlyPocLiveInvocationExecutePhase = {
  key:
    | "verify_execution_gate"
    | "verify_run_attempt_gate"
    | "verify_final_operator_go"
    | "verify_immediate_pre_invocation_confirmation"
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
    | "capture_filled_fields_or_plan_evidence"
    | "capture_stop_before_review_evidence"
    | "stop_before_review";
  label: string;
  mode:
    | "gate_check"
    | "manual_confirmation"
    | "runner_visible_state_verification"
    | "runner_field_fill"
    | "runner_total_read"
    | "runner_evidence_capture"
    | "runner_hard_stop"
    | "metadata_only"
    | "future_fill_plan_metadata"
    | "future_read_plan_metadata"
    | "evidence_capture"
    | "hard_stop";
  selector: string | null;
};

export type FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerResult = {
  ok: boolean;
  evidence_id?: string | null;
  observed_total_amount_sek?: number | null;
  note?: string | null;
};

export type FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunner = {
  verifyVisibleOrderFormState: () => FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerResult;
  fillAmountField: (
    amountSek: number,
  ) => FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerResult;
  fillPriceField: (
    priceUsd: number,
  ) => FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerResult;
  readTotalAmount: () => FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerResult;
  captureEvidence: (
    label: string,
  ) => FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerResult;
  stopBeforeReview: () => FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerResult;
};

export type FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerCall =
  {
    method: keyof FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunner;
    ok: boolean;
    evidence_id: string | null;
    observed_total_amount_sek: number | null;
    note: string | null;
  };

export type FirstRealAvanzaFillOnlyPocLiveInvocationExecuteCapabilities =
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
    can_execute_allowed_runner_methods: boolean;
  };

export type FirstRealAvanzaFillOnlyPocLiveInvocationExecutePlan = {
  mode: "fill_only_stop_before_review";
  amount: { selector: string; value: number };
  price: { selector: string; value: number };
  total: { selector: string; cap_sek: number };
  stop_point: "before_review_button";
  evidence_plan: readonly string[];
  phases: readonly FirstRealAvanzaFillOnlyPocLiveInvocationExecutePhase[];
};

export type FirstRealAvanzaFillOnlyPocLiveInvocationExecuteDecision = {
  status: FirstRealAvanzaFillOnlyPocLiveInvocationExecuteStatus;
  live_invocation_execute_wrapper_enabled: boolean;
  ready_for_live_invocation_execute: boolean;
  execute_plan_created: boolean;
  ready_status_meaning:
    "ready_for_live_invocation_execute_means_all_gates_passed_no_runner_called_when_runner_omitted_no_review_final_or_submit_authorized";
  execute_plan_meaning:
    "execute_plan_created_means_allowed_runner_boundary_completed_fill_only_stop_before_review_no_review_final_or_submit";
  blocked_reasons: readonly string[];
  blockers: readonly string[];
  live_fill_only_invocation_attempt_decision:
    | FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision
    | null;
  final_live_fill_only_invocation_decision:
    | FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision
    | null;
  final_harness_decision:
    | FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision
    | null;
  gated_real_browser_fill_only_run_decision:
    | FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunDecision
    | null;
  execution_phases: readonly FirstRealAvanzaFillOnlyPocLiveInvocationExecutePhase[];
  execute_plan: FirstRealAvanzaFillOnlyPocLiveInvocationExecutePlan | null;
  runner_calls: readonly FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerCall[];
  runner_boundary: typeof firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary;
  hard_forbidden_selectors: readonly string[];
  blocked_review_selectors: readonly string[];
  abort_conditions: readonly string[];
  evidence_requirements: readonly string[];
  blocked_actions: readonly string[];
  capability_flags: FirstRealAvanzaFillOnlyPocLiveInvocationExecuteCapabilities;
  stop_point: "before_review_button";
  result_notes: readonly string[];
  safety_confirmations: {
    disabled_by_default: true;
    explicit_trigger_only: true;
    no_live_avanza_run_during_validation: true;
    no_browser_launch_or_control_during_validation: true;
    dependency_injected_runner_only: true;
    no_browser_automation_package_import: true;
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

export type FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRequest =
  FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRequest & {
    live_invocation_execute_wrapper_enabled?: boolean | null;
    execution_plan_explicitly_requested?: boolean | null;
    live_invocation_execution_gate_decision_snapshot?:
      | "live_invocation_execution_gate_ready"
      | string
      | null;
    live_invocation_run_attempt_gate_decision_snapshot?:
      | "live_invocation_run_attempt_gate_ready"
      | string
      | null;
    final_operator_go_snapshot?: "final_operator_go" | string | null;
    immediate_pre_invocation_confirmation_snapshot?:
      | "immediate_pre_invocation_confirmation_ready"
      | string
      | null;
    live_fill_only_invocation_attempt_decision_snapshot?:
      | FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision
      | "ready_for_live_fill_only_attempt"
      | string
      | null;
    final_live_invocation_attempt_decision_snapshot?:
      | FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision
      | "ready_for_live_fill_only_invocation"
      | string
      | null;
    final_harness_decision_snapshot?:
      | FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision
      | "ready_for_final_fill_only_run"
      | string
      | null;
    operator_present?: boolean | null;
    runner?: FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunner | null;
  };

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function selectorForKey(key: string): string {
  const entry = findRealAvanzaSelectorMappingEntry(key);

  if (!entry) {
    throw new Error(`Missing real Avanza selector mapping entry: ${key}`);
  }

  return entry.selector;
}

function numberInput(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export const firstRealAvanzaFillOnlyPocLiveInvocationExecutePhases = [
  {
    key: "verify_execution_gate",
    label: "Verify live invocation execution gate",
    mode: "gate_check",
    selector: null,
  },
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
    key: "verify_immediate_pre_invocation_confirmation",
    label: "Verify immediate pre-invocation confirmation",
    mode: "gate_check",
    selector: null,
  },
  {
    key: "verify_final_invocation_wrapper_ready",
    label: "Verify final invocation wrapper readiness",
    mode: "gate_check",
    selector: null,
  },
  {
    key: "verify_final_harness_ready",
    label: "Verify final harness readiness",
    mode: "gate_check",
    selector: null,
  },
  {
    key: "verify_final_pre_run_evidence",
    label: "Verify final pre-run evidence",
    mode: "gate_check",
    selector: null,
  },
  {
    key: "verify_operator_presence",
    label: "Verify operator presence",
    mode: "manual_confirmation",
    selector: null,
  },
  {
    key: "verify_manual_login_confirmed",
    label: "Verify manual Avanza login confirmation",
    mode: "manual_confirmation",
    selector: null,
  },
  {
    key: "verify_account_confirmed",
    label: "Verify account confirmation",
    mode: "manual_confirmation",
    selector: selectorForKey("account_selector_collapsed"),
  },
  {
    key: "verify_instrument_confirmed",
    label: "Verify instrument confirmation",
    mode: "manual_confirmation",
    selector: selectorForKey("instrument_market_info_panel"),
  },
  {
    key: "verify_visible_order_form_state",
    label: "Verify visible order-form state",
    mode: "runner_visible_state_verification",
    selector: selectorForKey("order_type_active_indicator"),
  },
  {
    key: "verify_buy_side",
    label: "Verify buy side",
    mode: "metadata_only",
    selector: selectorForKey("side_switch_buy_state"),
  },
  {
    key: "verify_advanced_limit_order_type",
    label: "Verify Avancerad/Limit order type",
    mode: "metadata_only",
    selector: selectorForKey("order_type_limit_checked"),
  },
  {
    key: "prepare_amount_field_fill",
    label: "Fill approved amount field",
    mode: "runner_field_fill",
    selector: selectorForKey("amount_input"),
  },
  {
    key: "prepare_price_field_fill",
    label: "Fill approved price field",
    mode: "runner_field_fill",
    selector: selectorForKey("price_input"),
  },
  {
    key: "read_total_amount",
    label: "Read total amount",
    mode: "runner_total_read",
    selector: selectorForKey("total_amount"),
  },
  {
    key: "verify_cap_after_total_parse",
    label: "Verify parsed total stays at or below cap",
    mode: "metadata_only",
    selector: selectorForKey("total_amount"),
  },
  {
    key: "capture_filled_fields_or_plan_evidence",
    label: "Capture filled fields or plan evidence",
    mode: "runner_evidence_capture",
    selector: null,
  },
  {
    key: "capture_stop_before_review_evidence",
    label: "Capture stop-before-review evidence",
    mode: "runner_evidence_capture",
    selector: null,
  },
  {
    key: "stop_before_review",
    label: "Stop before review",
    mode: "runner_hard_stop",
    selector: selectorForKey("review_buy_button"),
  },
] as const satisfies readonly FirstRealAvanzaFillOnlyPocLiveInvocationExecutePhase[];

export const firstRealAvanzaFillOnlyPocLiveInvocationExecuteAbortConditions =
  uniqueStrings([
    "live_invocation_execute_wrapper_disabled",
    "execution_gate_not_ready",
    "run_attempt_gate_not_ready",
    "final_operator_go_not_ready",
    "immediate_pre_invocation_confirmation_not_ready",
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
    "runner_failure",
    "review_requested_or_targeted",
    "final_confirm_requested_or_targeted",
    "submit_or_order_placement_requested",
    "credential_or_session_handling_requested",
    "sell_stop_loss_or_glidande_requested",
    "any_uncertainty",
    ...firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptAbortConditions,
  ]);

export const firstRealAvanzaFillOnlyPocLiveInvocationExecuteEvidenceRequirements =
  uniqueStrings([
    "pre_execute_visible_order_form_evidence",
    "filled_amount_and_price_evidence",
    "total_amount_read_evidence",
    "stop_before_review_evidence",
    "no_review_modal_evidence",
    "no_final_or_submit_evidence",
    ...firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptEvidenceRequirements,
  ]);

const safetyConfirmations = {
  disabled_by_default: true,
  explicit_trigger_only: true,
  no_live_avanza_run_during_validation: true,
  no_browser_launch_or_control_during_validation: true,
  dependency_injected_runner_only: true,
  no_browser_automation_package_import: true,
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
  "execute_wrapper_is_disabled_by_default",
  "runner_is_dependency_injected_only",
  "runner_is_not_called_unless_all_gates_pass_and_execution_plan_explicitly_requested",
  "runner_omitted_returns_ready_with_complete_execute_plan",
  "execute_plan_must_stop_before_review",
  "execute_plan_never_clicks_review_final_or_submit",
] as const;

function capabilityFlags(
  canExecuteAllowedRunnerMethods: boolean,
): FirstRealAvanzaFillOnlyPocLiveInvocationExecuteCapabilities {
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
    can_execute_allowed_runner_methods: canExecuteAllowedRunnerMethods,
  };
}

function buildExecutePlan(
  input: FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRequest,
): FirstRealAvanzaFillOnlyPocLiveInvocationExecutePlan | null {
  if (!numberInput(input.intended_amount_sek) || !numberInput(input.intended_price)) {
    return null;
  }

  return {
    mode: "fill_only_stop_before_review",
    amount: {
      selector: selectorForKey("amount_input"),
      value: input.intended_amount_sek,
    },
    price: {
      selector: selectorForKey("price_input"),
      value: input.intended_price,
    },
    total: {
      selector: selectorForKey("total_amount"),
      cap_sek: input.cap_sek ?? 1000,
    },
    stop_point: "before_review_button",
    evidence_plan:
      firstRealAvanzaFillOnlyPocLiveInvocationExecuteEvidenceRequirements,
    phases: firstRealAvanzaFillOnlyPocLiveInvocationExecutePhases,
  };
}

function disabledDecision(
  input: FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRequest,
): FirstRealAvanzaFillOnlyPocLiveInvocationExecuteDecision {
  return {
    status: "disabled",
    live_invocation_execute_wrapper_enabled: false,
    ready_for_live_invocation_execute: false,
    execute_plan_created: false,
    ready_status_meaning:
      "ready_for_live_invocation_execute_means_all_gates_passed_no_runner_called_when_runner_omitted_no_review_final_or_submit_authorized",
    execute_plan_meaning:
      "execute_plan_created_means_allowed_runner_boundary_completed_fill_only_stop_before_review_no_review_final_or_submit",
    blocked_reasons: ["live_invocation_execute_wrapper_disabled"],
    blockers: ["live_invocation_execute_wrapper_disabled"],
    live_fill_only_invocation_attempt_decision: null,
    final_live_fill_only_invocation_decision: null,
    final_harness_decision: null,
    gated_real_browser_fill_only_run_decision: null,
    execution_phases: firstRealAvanzaFillOnlyPocLiveInvocationExecutePhases,
    execute_plan: buildExecutePlan(input),
    runner_calls: [],
    runner_boundary:
      firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary,
    hard_forbidden_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
    blocked_review_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
    abort_conditions:
      firstRealAvanzaFillOnlyPocLiveInvocationExecuteAbortConditions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocLiveInvocationExecuteEvidenceRequirements,
    blocked_actions: firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
    capability_flags: capabilityFlags(false),
    stop_point: "before_review_button",
    result_notes: resultNotes,
    safety_confirmations: safetyConfirmations,
  };
}

function resolveAttemptDecision(
  input: FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRequest,
): FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision {
  const snapshot = input.live_fill_only_invocation_attempt_decision_snapshot;

  if (snapshot && typeof snapshot === "object") {
    return snapshot;
  }

  return buildFirstFillOnlyPocLiveFillOnlyInvocationAttemptDecision({
    ...input,
    live_fill_only_invocation_attempt_enabled:
      input.live_fill_only_invocation_attempt_enabled ?? true,
  });
}

function directBlockers(
  input: FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRequest,
  attemptDecision: FirstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptDecision,
): string[] {
  const reasons: string[] = [];

  if (
    input.live_invocation_execution_gate_decision_snapshot !==
    "live_invocation_execution_gate_ready"
  ) {
    reasons.push("live_invocation_execution_gate:not_ready");
  }

  if (
    input.live_invocation_run_attempt_gate_decision_snapshot !==
    "live_invocation_run_attempt_gate_ready"
  ) {
    reasons.push("live_invocation_run_attempt_gate:not_ready");
  }

  if (input.final_operator_go_snapshot !== "final_operator_go") {
    reasons.push("final_operator_go:not_ready");
  }

  if (
    input.immediate_pre_invocation_confirmation_snapshot !==
    "immediate_pre_invocation_confirmation_ready"
  ) {
    reasons.push("immediate_pre_invocation_confirmation:not_ready");
  }

  if (attemptDecision.status !== "attempt_plan_created") {
    reasons.push(`live_invocation_attempt:${attemptDecision.status}`);
  }

  const finalDecision = attemptDecision.final_live_fill_only_invocation_decision;

  if (finalDecision?.status !== "ready_for_live_fill_only_invocation") {
    reasons.push(
      `final_live_invocation_wrapper:${finalDecision?.status ?? "missing"}`,
    );
  }

  const finalHarnessDecision = finalDecision?.final_harness_decision;

  if (finalHarnessDecision?.status !== "ready_for_final_fill_only_run") {
    reasons.push(`final_harness:${finalHarnessDecision?.status ?? "missing"}`);
  }

  if (input.final_pre_run_evidence_snapshot !== "final_pre_run_evidence_ready") {
    reasons.push("final_pre_run_evidence:not_ready");
  }

  if (input.operator_present !== true) {
    reasons.push("operator_presence:not_confirmed");
  }

  if (input.manual_avanza_login_confirmed !== true) {
    reasons.push("manual_login:not_confirmed");
  }

  if (input.account_verification_confirmed !== true) {
    reasons.push("account:not_confirmed");
  }

  if (input.instrument_verification_confirmed !== true) {
    reasons.push("instrument:not_confirmed");
  }

  if (!numberInput(input.intended_amount_sek)) {
    reasons.push("intended_amount:not_valid");
  }

  if (!numberInput(input.intended_price)) {
    reasons.push("intended_price:not_valid");
  }

  if (!numberInput(input.cap_sek) || input.cap_sek > 1000) {
    reasons.push("cap_exceeded");
  }

  return reasons;
}

function statusFromBlockers(
  blockers: readonly string[],
): FirstRealAvanzaFillOnlyPocLiveInvocationExecuteStatus {
  if (blockers.length === 0) {
    return "ready_for_live_invocation_execute";
  }

  const failedSafety = blockers.some((reason) =>
    /(review_click|review_modal|review_requested|final_confirm|submit|placement|credential|session|browser_launch|avanza_access|dom_query|field_fill|sell|stop_loss|glidande|unattended|forbidden|cap_exceeds|cap_exceeded|selector_policy:forbidden|runner_failure)/.test(
      reason,
    ),
  );

  return failedSafety ? "failed_safety" : "blocked";
}

function normalizeRunnerResult(
  method: keyof FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunner,
  result: FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerResult,
): FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerCall {
  return {
    method,
    ok: result.ok,
    evidence_id: result.evidence_id ?? null,
    observed_total_amount_sek: result.observed_total_amount_sek ?? null,
    note: result.note ?? null,
  };
}

function runInjectedRunner(
  runner: FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunner,
  input: FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRequest,
): FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunnerCall[] {
  const calls = [
    normalizeRunnerResult(
      "verifyVisibleOrderFormState",
      runner.verifyVisibleOrderFormState(),
    ),
    normalizeRunnerResult("fillAmountField", runner.fillAmountField(input.intended_amount_sek ?? 0)),
    normalizeRunnerResult("fillPriceField", runner.fillPriceField(input.intended_price ?? 0)),
    normalizeRunnerResult("readTotalAmount", runner.readTotalAmount()),
    normalizeRunnerResult("captureEvidence", runner.captureEvidence("filled_fields")),
    normalizeRunnerResult("captureEvidence", runner.captureEvidence("stop_before_review")),
    normalizeRunnerResult("stopBeforeReview", runner.stopBeforeReview()),
  ];

  return calls;
}

export function buildFirstFillOnlyPocLiveInvocationExecuteDecision(
  input: FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRequest = {},
): FirstRealAvanzaFillOnlyPocLiveInvocationExecuteDecision {
  if (input.live_invocation_execute_wrapper_enabled !== true) {
    return disabledDecision(input);
  }

  const attemptDecision = resolveAttemptDecision(input);
  const attemptBlockers =
    attemptDecision.status === "attempt_plan_created"
      ? []
      : attemptDecision.blocked_reasons.map(
          (reason) => `live_invocation_attempt:${reason}`,
        );
  const blockers = uniqueStrings([
    ...directBlockers(input, attemptDecision),
    ...attemptBlockers,
  ]);
  const baseStatus = statusFromBlockers(blockers);
  const runnerCanExecute =
    baseStatus === "ready_for_live_invocation_execute" &&
    input.execution_plan_explicitly_requested === true &&
    input.runner;
  const runnerCalls = runnerCanExecute
    ? runInjectedRunner(input.runner as FirstRealAvanzaFillOnlyPocLiveInvocationExecuteRunner, input)
    : [];
  const runnerFailures = runnerCalls
    .filter((call) => !call.ok)
    .map((call) => `runner_failure:${call.method}`);
  const allBlockers = uniqueStrings([...blockers, ...runnerFailures]);
  const status =
    runnerFailures.length > 0
      ? "failed_safety"
      : runnerCalls.length > 0
        ? "execute_plan_created"
        : baseStatus;
  const readyForExecute = status === "ready_for_live_invocation_execute";
  const executePlanCreated = status === "execute_plan_created";
  const finalDecision =
    attemptDecision.final_live_fill_only_invocation_decision ?? null;
  const finalHarnessDecision = finalDecision?.final_harness_decision ?? null;

  return {
    status,
    live_invocation_execute_wrapper_enabled: true,
    ready_for_live_invocation_execute: readyForExecute,
    execute_plan_created: executePlanCreated,
    ready_status_meaning:
      "ready_for_live_invocation_execute_means_all_gates_passed_no_runner_called_when_runner_omitted_no_review_final_or_submit_authorized",
    execute_plan_meaning:
      "execute_plan_created_means_allowed_runner_boundary_completed_fill_only_stop_before_review_no_review_final_or_submit",
    blocked_reasons: allBlockers,
    blockers: allBlockers,
    live_fill_only_invocation_attempt_decision: attemptDecision,
    final_live_fill_only_invocation_decision: finalDecision,
    final_harness_decision: finalHarnessDecision,
    gated_real_browser_fill_only_run_decision:
      finalDecision?.gated_real_browser_fill_only_run_decision ?? null,
    execution_phases: firstRealAvanzaFillOnlyPocLiveInvocationExecutePhases,
    execute_plan: buildExecutePlan(input),
    runner_calls: runnerCalls,
    runner_boundary:
      firstRealAvanzaFillOnlyPocLiveFillOnlyInvocationAttemptRunnerBoundary,
    hard_forbidden_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
    blocked_review_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
    abort_conditions:
      firstRealAvanzaFillOnlyPocLiveInvocationExecuteAbortConditions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocLiveInvocationExecuteEvidenceRequirements,
    blocked_actions: firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
    capability_flags: capabilityFlags(executePlanCreated),
    stop_point: "before_review_button",
    result_notes: resultNotes,
    safety_confirmations: safetyConfirmations,
  };
}
