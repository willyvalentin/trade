import {
  buildFirstFillOnlyPocGatedRealBrowserFillOnlyRunDecision,
  firstRealAvanzaFillOnlyPocGatedRealBrowserRunAbortConditions,
  firstRealAvanzaFillOnlyPocGatedRealBrowserRunEvidenceRequirements,
  type FirstRealAvanzaFillOnlyPocGatedRealBrowserFieldFillPlan,
  type FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunDecision,
  type FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunRequest,
} from "@/lib/first-real-avanza-fill-only-poc-gated-real-browser-fill-only-run-adapter";
import {
  firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
  firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
  firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
} from "@/lib/first-real-avanza-fill-only-poc-real-browser-adapter-skeleton";
import { findRealAvanzaSelectorMappingEntry } from "@/lib/real-avanza-selector-mapping-contract";

export type FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessStatus =
  | "disabled"
  | "blocked"
  | "ready_for_final_fill_only_run"
  | "failed_safety";

export type FirstRealAvanzaFillOnlyPocFinalRealBrowserRunHarnessGateDecision =
  | "final_real_browser_run_harness_gate_ready"
  | string;

export type FirstRealAvanzaFillOnlyPocFinalPreRunEvidenceDecision =
  | "final_pre_run_evidence_ready"
  | string;

export type FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessRequest =
  FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunRequest & {
    final_real_browser_fill_only_run_harness_enabled?: boolean | null;
    final_harness_gate_decision_snapshot?:
      | FirstRealAvanzaFillOnlyPocFinalRealBrowserRunHarnessGateDecision
      | null;
    final_pre_run_evidence_snapshot?:
      | FirstRealAvanzaFillOnlyPocFinalPreRunEvidenceDecision
      | null;
  };

export type FirstRealAvanzaFillOnlyPocFinalRealBrowserRunPhase = {
  key:
    | "verify_final_harness_gate"
    | "verify_run_approval"
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

export type FirstRealAvanzaFillOnlyPocFinalRealBrowserRunCapabilityFlags = {
  can_launch_browser: false;
  can_access_avanza_without_user_session: false;
  can_handle_credentials: false;
  can_read_session_data: false;
  can_click_review: false;
  can_click_final_confirm: false;
  can_submit_order: false;
  can_place_order: false;
  can_mutate_trades_or_pnl: false;
  can_prepare_field_fill_plan: boolean;
  can_execute_field_fill: false;
};

export type FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision =
  {
    status: FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessStatus;
    final_real_browser_fill_only_run_harness_enabled: boolean;
    ready_for_final_fill_only_run: boolean;
    ready_status_meaning:
      "ready_for_future_separately_invoked_fill_only_run_no_avanza_run_performed_no_review_or_submit_authorized";
    blocked_reasons: readonly string[];
    blockers: readonly string[];
    gated_real_browser_fill_only_run_decision:
      | FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunDecision
      | null;
    planned_phases: readonly FirstRealAvanzaFillOnlyPocFinalRealBrowserRunPhase[];
    field_fill_plan: FirstRealAvanzaFillOnlyPocGatedRealBrowserFieldFillPlan;
    hard_forbidden_selectors: readonly string[];
    blocked_review_selectors: readonly string[];
    abort_conditions: readonly string[];
    evidence_requirements: readonly string[];
    blocked_actions: readonly string[];
    capability_flags: FirstRealAvanzaFillOnlyPocFinalRealBrowserRunCapabilityFlags;
    stop_point: "before_review_button";
    result_notes: readonly string[];
    safety_confirmations: {
      disabled_by_default: true;
      explicit_trigger_only: true;
      no_live_avanza_run_this_action: true;
      no_browser_launch_or_control_this_action: true;
      no_dom_query_this_action: true;
      no_actual_field_fill_this_action: true;
      no_review_click: true;
      no_review_modal: true;
      no_final_confirm: true;
      no_order_flow_completion: true;
      no_credentials_or_session_handling: true;
      no_unattended_operation: true;
      no_sell_stop_loss_or_glidande: true;
      no_database_write: true;
      no_route_or_scan_invocation: true;
      no_trade_stats_or_pnl_mutation: true;
    };
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

export const firstRealAvanzaFillOnlyPocFinalRealBrowserRunPlannedPhases = [
  {
    key: "verify_final_harness_gate",
    label: "Verify final real browser run harness gate",
    mode: "gate_check",
    selector: null,
  },
  {
    key: "verify_run_approval",
    label: "Verify fill-only run approval and run gate",
    mode: "gate_check",
    selector: null,
  },
  {
    key: "verify_final_pre_run_evidence",
    label: "Verify fresh final pre-run evidence",
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
    label: "Verify Avanza was manually opened and logged in by the operator",
    mode: "manual_confirmation",
    selector: null,
  },
  {
    key: "verify_account_confirmed",
    label: "Verify manually confirmed account",
    mode: "manual_confirmation",
    selector: selectorForKey("account_selector_collapsed"),
  },
  {
    key: "verify_instrument_confirmed",
    label: "Verify manually confirmed instrument",
    mode: "manual_confirmation",
    selector: selectorForKey("instrument_market_info_panel"),
  },
  {
    key: "verify_visible_order_form_state",
    label: "Verify visible order form state",
    mode: "metadata_only",
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
    label: "Prepare amount field fill metadata",
    mode: "future_fill_plan_metadata",
    selector: selectorForKey("amount_input"),
  },
  {
    key: "prepare_price_field_fill",
    label: "Prepare price field fill metadata",
    mode: "future_fill_plan_metadata",
    selector: selectorForKey("price_input"),
  },
  {
    key: "read_total_amount",
    label: "Prepare total amount read metadata",
    mode: "future_read_plan_metadata",
    selector: selectorForKey("total_amount"),
  },
  {
    key: "verify_cap_after_total_parse",
    label: "Verify parsed total stays at or below cap",
    mode: "metadata_only",
    selector: selectorForKey("total_amount"),
  },
  {
    key: "capture_stop_before_review_evidence",
    label: "Capture stop-before-review evidence",
    mode: "evidence_capture",
    selector: null,
  },
  {
    key: "stop_before_review",
    label: "Stop before review",
    mode: "hard_stop",
    selector: selectorForKey("review_buy_button"),
  },
] as const satisfies readonly FirstRealAvanzaFillOnlyPocFinalRealBrowserRunPhase[];

export const firstRealAvanzaFillOnlyPocFinalRealBrowserRunAbortConditions =
  uniqueStrings([
    "user_absent",
    "browser_or_session_not_manually_prepared",
    "account_mismatch",
    "instrument_mismatch",
    "wrong_side",
    "wrong_order_type",
    "amount_mismatch",
    "price_mismatch",
    "total_parse_failure",
    "cap_exceeded",
    "validation_errors",
    "modal_open",
    "final_confirm_visible_or_targeted",
    "review_click_targeted_or_requested",
    "submit_or_order_placement_requested",
    "credential_or_session_access_requested",
    "cookie_local_storage_or_session_storage_access_requested",
    "any_uncertainty",
    ...firstRealAvanzaFillOnlyPocGatedRealBrowserRunAbortConditions,
  ]);

export const firstRealAvanzaFillOnlyPocFinalRealBrowserRunEvidenceRequirements =
  uniqueStrings([
    ...firstRealAvanzaFillOnlyPocGatedRealBrowserRunEvidenceRequirements,
    "fresh_final_pre_run_evidence",
    "final_harness_gate_decision",
    "filled_field_evidence_only_after_future_explicit_run",
    "stop_before_review_evidence",
    "no_review_modal_evidence",
    "no_final_or_submit_evidence",
  ]);

const safetyConfirmations = {
  disabled_by_default: true,
  explicit_trigger_only: true,
  no_live_avanza_run_this_action: true,
  no_browser_launch_or_control_this_action: true,
  no_dom_query_this_action: true,
  no_actual_field_fill_this_action: true,
  no_review_click: true,
  no_review_modal: true,
  no_final_confirm: true,
  no_order_flow_completion: true,
  no_credentials_or_session_handling: true,
  no_unattended_operation: true,
  no_sell_stop_loss_or_glidande: true,
  no_database_write: true,
  no_route_or_scan_invocation: true,
  no_trade_stats_or_pnl_mutation: true,
} as const;

const resultNotes = [
  "this_harness_addition_does_not_run_avanza",
  "live_run_still_requires_a_separate_explicit_invocation_step",
  "harness_must_abort_before_review",
  "ready_status_does_not_authorize_review_final_or_submit",
] as const;

function capabilityFlags(
  canPrepareFieldFillPlan: boolean,
): FirstRealAvanzaFillOnlyPocFinalRealBrowserRunCapabilityFlags {
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
    can_prepare_field_fill_plan: canPrepareFieldFillPlan,
    can_execute_field_fill: false,
  };
}

function defaultFieldFillPlan(
  input: FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessRequest,
): FirstRealAvanzaFillOnlyPocGatedRealBrowserFieldFillPlan {
  return {
    amount: {
      selector: selectorForKey("amount_input"),
      value: input.intended_amount_sek ?? null,
      mode: "metadata_only_no_fill",
    },
    price: {
      selector: selectorForKey("price_input"),
      value: input.intended_price ?? null,
      mode: "metadata_only_no_fill",
    },
    total: {
      selector: selectorForKey("total_amount"),
      value: null,
      mode: "metadata_only_no_read",
    },
    mode: "metadata_only_no_browser_execution",
  };
}

function disabledDecision(
  input: FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessRequest,
): FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision {
  return {
    status: "disabled",
    final_real_browser_fill_only_run_harness_enabled: false,
    ready_for_final_fill_only_run: false,
    ready_status_meaning:
      "ready_for_future_separately_invoked_fill_only_run_no_avanza_run_performed_no_review_or_submit_authorized",
    blocked_reasons: ["final_real_browser_fill_only_run_harness_disabled"],
    blockers: ["final_real_browser_fill_only_run_harness_disabled"],
    gated_real_browser_fill_only_run_decision: null,
    planned_phases: firstRealAvanzaFillOnlyPocFinalRealBrowserRunPlannedPhases,
    field_fill_plan: defaultFieldFillPlan(input),
    hard_forbidden_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
    blocked_review_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
    abort_conditions:
      firstRealAvanzaFillOnlyPocFinalRealBrowserRunAbortConditions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocFinalRealBrowserRunEvidenceRequirements,
    blocked_actions: firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
    capability_flags: capabilityFlags(false),
    stop_point: "before_review_button",
    result_notes: resultNotes,
    safety_confirmations: safetyConfirmations,
  };
}

function directBlockers(
  input: FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessRequest,
): string[] {
  const reasons: string[] = [];

  if (
    input.final_harness_gate_decision_snapshot !==
    "final_real_browser_run_harness_gate_ready"
  ) {
    reasons.push("final_harness_gate:not_ready");
  }

  if (input.final_pre_run_evidence_snapshot !== "final_pre_run_evidence_ready") {
    reasons.push("final_pre_run_evidence:not_ready");
  }

  return reasons;
}

function statusFromBlockers(
  blockers: readonly string[],
): FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessStatus {
  if (blockers.length === 0) {
    return "ready_for_final_fill_only_run";
  }

  const failedSafety = blockers.some(
    (reason) =>
      !reason.startsWith("final_harness_gate:") &&
      !reason.startsWith("final_pre_run_evidence:") &&
      /(review|final|submit|placement|credential|session|browser_launch|avanza_access|dom_query|field_fill|sell|stop_loss|glidande|unattended|forbidden|generated|selector_policy:forbidden)/.test(
        reason,
      ),
  );

  return failedSafety ? "failed_safety" : "blocked";
}

export function buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision(
  input: FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessRequest = {},
): FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision {
  if (input.final_real_browser_fill_only_run_harness_enabled !== true) {
    return disabledDecision(input);
  }

  const gatedDecision = buildFirstFillOnlyPocGatedRealBrowserFillOnlyRunDecision(
    {
      ...input,
      real_browser_fill_only_run_adapter_enabled:
        input.real_browser_fill_only_run_adapter_enabled ?? true,
    },
  );
  const blockers = uniqueStrings([
    ...directBlockers(input),
    ...(gatedDecision.status === "ready_for_fill_only_browser_run"
      ? []
      : [
          `gated_real_browser_fill_only_run:${gatedDecision.status}`,
          ...gatedDecision.blocked_reasons.map(
            (reason) => `gated_real_browser_fill_only_run:${reason}`,
          ),
        ]),
  ]);
  const status = statusFromBlockers(blockers);

  return {
    status,
    final_real_browser_fill_only_run_harness_enabled: true,
    ready_for_final_fill_only_run: status === "ready_for_final_fill_only_run",
    ready_status_meaning:
      "ready_for_future_separately_invoked_fill_only_run_no_avanza_run_performed_no_review_or_submit_authorized",
    blocked_reasons: blockers,
    blockers,
    gated_real_browser_fill_only_run_decision: gatedDecision,
    planned_phases: firstRealAvanzaFillOnlyPocFinalRealBrowserRunPlannedPhases,
    field_fill_plan: gatedDecision.field_fill_plan,
    hard_forbidden_selectors: gatedDecision.hard_forbidden_selectors,
    blocked_review_selectors: gatedDecision.blocked_review_selectors,
    abort_conditions:
      firstRealAvanzaFillOnlyPocFinalRealBrowserRunAbortConditions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocFinalRealBrowserRunEvidenceRequirements,
    blocked_actions: gatedDecision.blocked_actions,
    capability_flags: capabilityFlags(status === "ready_for_final_fill_only_run"),
    stop_point: "before_review_button",
    result_notes: resultNotes,
    safety_confirmations: safetyConfirmations,
  };
}
