import type { FirstFillOnlyPocApprovalStateInput } from "@/lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type {
  FirstFillOnlyPocDryRunDecision,
  FirstFillOnlyPocOperatorApprovalSnapshot,
  FirstFillOnlyPocSelectorReadinessSnapshot,
  FirstFillOnlyPocStaticDryRunPayload,
} from "@/lib/first-real-avanza-fill-only-poc-dry-run-harness";
import type { FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterDecision } from "@/lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton";
import {
  buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision,
  firstRealAvanzaFillOnlyPocFinalRealBrowserRunAbortConditions,
  firstRealAvanzaFillOnlyPocFinalRealBrowserRunEvidenceRequirements,
  type FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision,
  type FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessRequest,
} from "@/lib/first-real-avanza-fill-only-poc-final-real-browser-fill-only-run-harness";
import type { FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunDecision } from "@/lib/first-real-avanza-fill-only-poc-gated-real-browser-fill-only-run-adapter";
import type { FirstRealAvanzaFillOnlyPocImplementationStubDecision } from "@/lib/first-real-avanza-fill-only-poc-implementation-stub";
import type {
  FirstRealAvanzaFillOnlyPocManualRunSetupDecision,
  FirstRealAvanzaFillOnlyPocManualRunSetupEvidencePlan,
  FirstRealAvanzaFillOnlyPocOperatorSetupEvidenceSnapshot,
} from "@/lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import {
  firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
  firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
  firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
  type FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonDecision,
  type FirstRealAvanzaFillOnlyPocRealBrowserFieldMetadata,
} from "@/lib/first-real-avanza-fill-only-poc-real-browser-adapter-skeleton";
import type { GatedRealAvanzaFillOnlyAdapterSkeletonDecision } from "@/lib/gated-real-avanza-fill-only-adapter-skeleton";
import type {
  RealAvanzaFillOnlyGuardDecision,
  RealAvanzaFillOnlySelectorPolicy,
} from "@/lib/real-avanza-fill-only-guard";
import { findRealAvanzaSelectorMappingEntry } from "@/lib/real-avanza-selector-mapping-contract";

export type FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationStatus =
  | "disabled"
  | "blocked"
  | "ready_for_live_fill_only_invocation"
  | "failed_safety";

export type FirstRealAvanzaFillOnlyPocFinalPreLiveReviewDecision =
  | "final_pre_live_run_review_ready"
  | string;

export type FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationRequest =
  FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessRequest & {
    final_live_fill_only_invocation_enabled?: boolean | null;
    final_pre_live_review_decision_snapshot?:
      | FirstRealAvanzaFillOnlyPocFinalPreLiveReviewDecision
      | null;
    final_harness_decision_snapshot?:
      | FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision
      | "ready_for_final_fill_only_run"
      | string
      | null;
    dry_run_decision_snapshot?: FirstFillOnlyPocDryRunDecision | null;
    operator_setup_evidence_snapshot?:
      | FirstRealAvanzaFillOnlyPocOperatorSetupEvidenceSnapshot
      | null;
    manual_setup_evidence_plan_snapshot?:
      | FirstRealAvanzaFillOnlyPocManualRunSetupEvidencePlan
      | null;
    payload_snapshot?: FirstFillOnlyPocStaticDryRunPayload | null;
    selector_readiness_snapshot?: FirstFillOnlyPocSelectorReadinessSnapshot | null;
    operator_approval_snapshot?: FirstFillOnlyPocOperatorApprovalSnapshot | null;
    approval_snapshot?: FirstFillOnlyPocApprovalStateInput | null;
  };

export type FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationPhase = {
  key:
    | "verify_final_pre_live_review"
    | "verify_final_harness_ready"
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

export type FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationCapabilities =
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
    can_prepare_field_fill_plan: boolean;
    can_execute_field_fill: false;
  };

export type FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationFillTargets =
  {
    amount: FirstRealAvanzaFillOnlyPocRealBrowserFieldMetadata["amount"];
    price: FirstRealAvanzaFillOnlyPocRealBrowserFieldMetadata["price"];
    total: FirstRealAvanzaFillOnlyPocRealBrowserFieldMetadata["total"];
    mode: "metadata_only_no_browser_execution";
  };

export type FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision = {
  status: FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationStatus;
  final_live_fill_only_invocation_enabled: boolean;
  ready_for_live_fill_only_invocation: boolean;
  ready_status_meaning:
    "ready_for_future_operator_invoked_fill_only_attempt_under_locked_scope_no_avanza_run_performed_no_review_final_or_submit_authorized";
  blocked_reasons: readonly string[];
  blockers: readonly string[];
  final_harness_decision:
    | FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision
    | null;
  gated_real_browser_fill_only_run_decision:
    | FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunDecision
    | null;
  real_browser_adapter_skeleton_decision:
    | FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonDecision
    | null;
  execution_dry_run_decision:
    | FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterDecision
    | null;
  manual_run_setup_decision:
    | FirstRealAvanzaFillOnlyPocManualRunSetupDecision
    | null;
  gated_skeleton_decision: GatedRealAvanzaFillOnlyAdapterSkeletonDecision | null;
  implementation_stub_decision:
    | FirstRealAvanzaFillOnlyPocImplementationStubDecision
    | null;
  dry_run_decision: FirstFillOnlyPocDryRunDecision | null;
  guard_decision: RealAvanzaFillOnlyGuardDecision | null;
  selector_policy: RealAvanzaFillOnlySelectorPolicy | null;
  invocation_phases: readonly FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationPhase[];
  field_fill_plan:
    FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationFillTargets;
  hard_forbidden_selectors: readonly string[];
  blocked_review_selectors: readonly string[];
  abort_conditions: readonly string[];
  evidence_requirements: readonly string[];
  blocked_actions: readonly string[];
  capability_flags: FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationCapabilities;
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

export const firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationPhases = [
  {
    key: "verify_final_pre_live_review",
    label: "Verify final pre-live review decision",
    mode: "gate_check",
    selector: null,
  },
  {
    key: "verify_final_harness_ready",
    label: "Verify final fill-only harness readiness",
    mode: "gate_check",
    selector: null,
  },
  {
    key: "verify_run_approval",
    label: "Verify run approval and run gate",
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
] as const satisfies readonly FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationPhase[];

export const firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationAbortConditions =
  uniqueStrings([
    "ui_mismatch",
    "wrong_account",
    "wrong_instrument",
    "wrong_side",
    "wrong_order_type",
    "modal_open",
    "final_button_visible_or_targeted",
    "total_parse_failure",
    "cap_exceeded",
    "review_requested_or_targeted",
    "final_confirm_requested_or_targeted",
    "submit_or_order_placement_requested",
    "credential_or_session_handling_requested",
    "sell_stop_loss_or_glidande_requested",
    "unattended_operation_requested",
    "any_uncertainty",
    ...firstRealAvanzaFillOnlyPocFinalRealBrowserRunAbortConditions,
  ]);

export const firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationEvidenceRequirements =
  uniqueStrings([
    ...firstRealAvanzaFillOnlyPocFinalRealBrowserRunEvidenceRequirements,
    "pre_run_visible_state_evidence",
    "intended_amount_and_price",
    "selector_plan",
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
  "this_wrapper_addition_does_not_run_avanza",
  "live_run_still_requires_a_separate_operator_invocation",
  "wrapper_must_abort_before_review",
  "ready_status_does_not_authorize_review_final_or_submit",
] as const;

function capabilityFlags(
  canPrepareFieldFillPlan: boolean,
): FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationCapabilities {
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
  input: FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationRequest,
): FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationFillTargets {
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

function emptyNestedDecisions() {
  return {
    gated_real_browser_fill_only_run_decision: null,
    real_browser_adapter_skeleton_decision: null,
    execution_dry_run_decision: null,
    manual_run_setup_decision: null,
    gated_skeleton_decision: null,
    implementation_stub_decision: null,
    dry_run_decision: null,
    guard_decision: null,
    selector_policy: null,
  };
}

function disabledDecision(
  input: FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationRequest,
): FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision {
  return {
    status: "disabled",
    final_live_fill_only_invocation_enabled: false,
    ready_for_live_fill_only_invocation: false,
    ready_status_meaning:
      "ready_for_future_operator_invoked_fill_only_attempt_under_locked_scope_no_avanza_run_performed_no_review_final_or_submit_authorized",
    blocked_reasons: ["final_live_fill_only_invocation_disabled"],
    blockers: ["final_live_fill_only_invocation_disabled"],
    final_harness_decision: null,
    ...emptyNestedDecisions(),
    invocation_phases:
      firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationPhases,
    field_fill_plan: defaultFieldFillPlan(input),
    hard_forbidden_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
    blocked_review_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
    abort_conditions:
      firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationAbortConditions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationEvidenceRequirements,
    blocked_actions: firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
    capability_flags: capabilityFlags(false),
    stop_point: "before_review_button",
    result_notes: resultNotes,
    safety_confirmations: safetyConfirmations,
  };
}

function directBlockers(
  input: FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationRequest,
): string[] {
  const reasons: string[] = [];

  if (
    input.final_pre_live_review_decision_snapshot !==
    "final_pre_live_run_review_ready"
  ) {
    reasons.push("final_pre_live_review:not_ready");
  }

  return reasons;
}

function resolveHarnessDecision(
  input: FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationRequest,
): FirstRealAvanzaFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision {
  const snapshot = input.final_harness_decision_snapshot;

  if (snapshot && typeof snapshot === "object") {
    return snapshot;
  }

  return buildFirstFillOnlyPocFinalRealBrowserFillOnlyRunHarnessDecision({
    ...input,
    final_real_browser_fill_only_run_harness_enabled:
      input.final_real_browser_fill_only_run_harness_enabled ?? true,
  });
}

function statusFromBlockers(
  blockers: readonly string[],
): FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationStatus {
  if (blockers.length === 0) {
    return "ready_for_live_fill_only_invocation";
  }

  const failedSafety = blockers.some((reason) =>
    /(review_click|review_modal|review_requested|final_confirm|final_submit|submit|placement|credential|session|browser_launch|avanza_access|dom_query|field_fill|sell|stop_loss|glidande|unattended|forbidden|generated|selector_policy:forbidden)/.test(
      reason,
    ),
  );

  return failedSafety ? "failed_safety" : "blocked";
}

export function buildFirstFillOnlyPocFinalLiveFillOnlyInvocationDecision(
  input: FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationRequest = {},
): FirstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationDecision {
  if (input.final_live_fill_only_invocation_enabled !== true) {
    return disabledDecision(input);
  }

  const harnessDecision = resolveHarnessDecision(input);
  const harnessBlockers =
    harnessDecision.status === "ready_for_final_fill_only_run"
      ? []
      : [
          `final_harness:${harnessDecision.status}`,
          ...harnessDecision.blocked_reasons.map(
            (reason) => `final_harness:${reason}`,
          ),
        ];
  const blockers = uniqueStrings([...directBlockers(input), ...harnessBlockers]);
  const status = statusFromBlockers(blockers);
  const gatedDecision =
    harnessDecision.gated_real_browser_fill_only_run_decision;
  const realBrowserDecision =
    gatedDecision?.real_browser_adapter_skeleton_decision ?? null;

  return {
    status,
    final_live_fill_only_invocation_enabled: true,
    ready_for_live_fill_only_invocation:
      status === "ready_for_live_fill_only_invocation",
    ready_status_meaning:
      "ready_for_future_operator_invoked_fill_only_attempt_under_locked_scope_no_avanza_run_performed_no_review_final_or_submit_authorized",
    blocked_reasons: blockers,
    blockers,
    final_harness_decision: harnessDecision,
    gated_real_browser_fill_only_run_decision: gatedDecision,
    real_browser_adapter_skeleton_decision: realBrowserDecision,
    execution_dry_run_decision: gatedDecision?.execution_dry_run_decision ?? null,
    manual_run_setup_decision: gatedDecision?.manual_run_setup_decision ?? null,
    gated_skeleton_decision: gatedDecision?.gated_skeleton_decision ?? null,
    implementation_stub_decision:
      gatedDecision?.implementation_stub_decision ?? null,
    dry_run_decision: realBrowserDecision?.dry_run_decision ?? null,
    guard_decision: gatedDecision?.guard_decision ?? null,
    selector_policy: gatedDecision?.selector_policy ?? null,
    invocation_phases:
      firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationPhases,
    field_fill_plan: harnessDecision.field_fill_plan,
    hard_forbidden_selectors: harnessDecision.hard_forbidden_selectors,
    blocked_review_selectors: harnessDecision.blocked_review_selectors,
    abort_conditions:
      firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationAbortConditions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocFinalLiveFillOnlyInvocationEvidenceRequirements,
    blocked_actions: harnessDecision.blocked_actions,
    capability_flags: capabilityFlags(
      status === "ready_for_live_fill_only_invocation",
    ),
    stop_point: "before_review_button",
    result_notes: resultNotes,
    safety_confirmations: safetyConfirmations,
  };
}
