import {
  firstFillOnlyPocEvidenceRequirements,
} from "@/lib/first-real-avanza-fill-only-poc-dry-run-harness";
import type { FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterDecision } from "@/lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton";
import type {
  FirstRealAvanzaFillOnlyPocManualRunSetupDecision,
  FirstRealAvanzaFillOnlyPocManualRunSetupEvidencePlan,
  FirstRealAvanzaFillOnlyPocManualRunSetupRequestedActions,
} from "@/lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import type { GatedRealAvanzaFillOnlyAdapterSkeletonDecision } from "@/lib/gated-real-avanza-fill-only-adapter-skeleton";
import type { FirstRealAvanzaFillOnlyPocImplementationStubDecision } from "@/lib/first-real-avanza-fill-only-poc-implementation-stub";
import {
  buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision,
  firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
  firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
  firstRealAvanzaFillOnlyPocRealBrowserEvidenceRequirements,
  firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
  type FirstRealAvanzaFillOnlyPocRealBrowserAdapterEvidencePlan,
  type FirstRealAvanzaFillOnlyPocRealBrowserAdapterRequestedActions,
  type FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonDecision,
  type FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
  type FirstRealAvanzaFillOnlyPocRealBrowserFieldMetadata,
} from "@/lib/first-real-avanza-fill-only-poc-real-browser-adapter-skeleton";
import type {
  RealAvanzaFillOnlyGuardDecision,
  RealAvanzaFillOnlySelectorPolicy,
} from "@/lib/real-avanza-fill-only-guard";
import { findRealAvanzaSelectorMappingEntry } from "@/lib/real-avanza-selector-mapping-contract";

export type FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunStatus =
  | "disabled"
  | "blocked"
  | "ready_for_fill_only_browser_run"
  | "failed_safety";

export type FirstRealAvanzaFillOnlyPocRealBrowserFillOnlyRunGateDecision =
  | "real_browser_fill_only_run_gate_ready"
  | string;

export type FirstRealAvanzaFillOnlyPocRealBrowserRunApprovalState =
  | "real_browser_run_approved_for_fill_only"
  | string;

export type FirstRealAvanzaFillOnlyPocGatedRealBrowserRunRequestedActions =
  FirstRealAvanzaFillOnlyPocRealBrowserAdapterRequestedActions & {
    review_modal_requested?: boolean | null;
    order_placement_requested?: boolean | null;
    browser_unattended_run_requested?: boolean | null;
  };

export type FirstRealAvanzaFillOnlyPocGatedRealBrowserRunEvidencePlan =
  FirstRealAvanzaFillOnlyPocRealBrowserAdapterEvidencePlan & {
    pre_run_visible_state_evidence_planned?: boolean | null;
    intended_values_evidence_planned?: boolean | null;
    selector_plan_evidence_planned?: boolean | null;
    stop_before_review_evidence_planned?: boolean | null;
    no_review_modal_evidence_planned?: boolean | null;
    no_final_or_submit_evidence_planned?: boolean | null;
  };

export type FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunRequest =
  Omit<
    FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
    "evidence_plan" | "requested_actions"
  > & {
    real_browser_fill_only_run_adapter_enabled?: boolean | null;
    run_gate_decision_snapshot?:
      | FirstRealAvanzaFillOnlyPocRealBrowserFillOnlyRunGateDecision
      | null;
    real_browser_run_approval_snapshot?:
      | FirstRealAvanzaFillOnlyPocRealBrowserRunApprovalState
      | null;
    manual_avanza_login_confirmed?: boolean | null;
    account_verification_confirmed?: boolean | null;
    instrument_verification_confirmed?: boolean | null;
    evidence_plan?:
      | FirstRealAvanzaFillOnlyPocGatedRealBrowserRunEvidencePlan
      | null;
    requested_actions?:
      | FirstRealAvanzaFillOnlyPocGatedRealBrowserRunRequestedActions
      | null;
  };

export type FirstRealAvanzaFillOnlyPocGatedRealBrowserRunPhase = {
  key:
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
    | "capture_evidence"
    | "stop_before_review";
  label: string;
  mode:
    | "manual_confirmation"
    | "metadata_only"
    | "future_fill_plan_metadata"
    | "future_read_plan_metadata"
    | "hard_stop";
  selector: string | null;
};

export type FirstRealAvanzaFillOnlyPocGatedRealBrowserRunCapabilityFlags = {
  can_launch_browser: false;
  can_access_avanza_without_user_session: false;
  can_handle_credentials: false;
  can_read_session_data: false;
  can_click_review: false;
  can_click_final_confirm: false;
  can_submit_order: false;
  can_place_order: false;
  can_prepare_field_fill_plan: boolean;
  can_execute_field_fill: false;
};

export type FirstRealAvanzaFillOnlyPocGatedRealBrowserFieldFillPlan = {
  amount: FirstRealAvanzaFillOnlyPocRealBrowserFieldMetadata["amount"];
  price: FirstRealAvanzaFillOnlyPocRealBrowserFieldMetadata["price"];
  total: FirstRealAvanzaFillOnlyPocRealBrowserFieldMetadata["total"];
  mode: "metadata_only_no_browser_execution";
};

export type FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunDecision = {
  status: FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunStatus;
  real_browser_fill_only_run_adapter_enabled: boolean;
  ready_for_fill_only_browser_run: boolean;
  ready_status_meaning:
    "ready_for_future_separately_approved_invocation_no_run_performed";
  blocked_reasons: readonly string[];
  blockers: readonly string[];
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
  guard_decision: RealAvanzaFillOnlyGuardDecision | null;
  selector_policy: RealAvanzaFillOnlySelectorPolicy | null;
  planned_phases: readonly FirstRealAvanzaFillOnlyPocGatedRealBrowserRunPhase[];
  field_fill_plan: FirstRealAvanzaFillOnlyPocGatedRealBrowserFieldFillPlan;
  hard_forbidden_selectors: readonly string[];
  blocked_review_selectors: readonly string[];
  abort_conditions: readonly string[];
  evidence_requirements: readonly string[];
  blocked_actions: readonly string[];
  capability_flags: FirstRealAvanzaFillOnlyPocGatedRealBrowserRunCapabilityFlags;
  stop_point: "before_review_button";
  safety_confirmations: {
    disabled_by_default: true;
    no_actual_browser_run_this_action: true;
    no_avanza_access_this_action: true;
    no_browser_automation_this_action: true;
    no_dom_query_this_action: true;
    no_credentials_or_session_handling: true;
    no_review_click: true;
    no_review_modal: true;
    no_final_confirm: true;
    no_submit_or_order_placement: true;
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

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizeLower(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export const firstRealAvanzaFillOnlyPocGatedRealBrowserRunPlannedPhases = [
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
    key: "capture_evidence",
    label: "Capture required evidence package",
    mode: "manual_confirmation",
    selector: null,
  },
  {
    key: "stop_before_review",
    label: "Stop before review",
    mode: "hard_stop",
    selector: selectorForKey("review_buy_button"),
  },
] as const satisfies readonly FirstRealAvanzaFillOnlyPocGatedRealBrowserRunPhase[];

export const firstRealAvanzaFillOnlyPocGatedRealBrowserRunAbortConditions = [
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
] as const;

export const firstRealAvanzaFillOnlyPocGatedRealBrowserRunEvidenceRequirements =
  uniqueStrings([
    ...firstFillOnlyPocEvidenceRequirements,
    ...firstRealAvanzaFillOnlyPocRealBrowserEvidenceRequirements,
    "pre_run_visible_state_evidence",
    "amount_and_price_intended_values",
    "selector_plan",
    "stop_before_review_evidence",
    "no_review_modal_evidence",
    "no_final_or_submit_evidence",
  ]);

const safetyConfirmations = {
  disabled_by_default: true,
  no_actual_browser_run_this_action: true,
  no_avanza_access_this_action: true,
  no_browser_automation_this_action: true,
  no_dom_query_this_action: true,
  no_credentials_or_session_handling: true,
  no_review_click: true,
  no_review_modal: true,
  no_final_confirm: true,
  no_submit_or_order_placement: true,
  no_unattended_operation: true,
  no_sell_stop_loss_or_glidande: true,
  no_database_write: true,
  no_route_or_scan_invocation: true,
  no_trade_stats_or_pnl_mutation: true,
} as const;

function capabilityFlags(
  canPrepareFieldFillPlan: boolean,
): FirstRealAvanzaFillOnlyPocGatedRealBrowserRunCapabilityFlags {
  return {
    can_launch_browser: false,
    can_access_avanza_without_user_session: false,
    can_handle_credentials: false,
    can_read_session_data: false,
    can_click_review: false,
    can_click_final_confirm: false,
    can_submit_order: false,
    can_place_order: false,
    can_prepare_field_fill_plan: canPrepareFieldFillPlan,
    can_execute_field_fill: false,
  };
}

function defaultFieldFillPlan(
  input: FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunRequest,
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

function missingDirectReasons(
  input: FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunRequest,
): string[] {
  const reasons: string[] = [];
  const payload = input.payload_snapshot;
  const action = input.requested_actions;
  const side =
    normalizeLower(payload?.side) || normalizeLower(payload?.payload?.side);
  const orderType =
    normalizeLower(payload?.order_type) ||
    normalizeLower(payload?.payload?.order_type);
  const requestedAction = normalizeLower(payload?.requested_action);
  const cap = input.cap_sek ?? payload?.max_amount_cap_sek ?? null;

  if (
    input.run_gate_decision_snapshot !== "real_browser_fill_only_run_gate_ready"
  ) {
    reasons.push("run_gate:not_ready");
  }

  if (
    input.real_browser_run_approval_snapshot !==
    "real_browser_run_approved_for_fill_only"
  ) {
    reasons.push("real_browser_run_approval:not_approved_for_fill_only");
  }

  if (input.operator_presence_confirmed !== true) {
    reasons.push("operator_presence:not_confirmed");
  }

  if (input.manual_avanza_login_confirmed !== true) {
    reasons.push("manual_avanza_login:not_confirmed");
  }

  if (input.account_verification_confirmed !== true) {
    reasons.push("account_verification:not_confirmed");
  }

  if (input.instrument_verification_confirmed !== true) {
    reasons.push("instrument_verification:not_confirmed");
  }

  if (!isPositiveFiniteNumber(input.intended_amount_sek)) {
    reasons.push("intended_amount_missing");
  }

  if (!isPositiveFiniteNumber(input.intended_price)) {
    reasons.push("intended_price_missing");
  }

  if (!isPositiveFiniteNumber(cap)) {
    reasons.push("cap_missing");
  } else if (cap > 1000) {
    reasons.push("cap_exceeds_policy");
  }

  if (side !== "buy") {
    reasons.push("side_not_buy");
  }

  if (!["limit", "avancerad"].includes(orderType)) {
    reasons.push("order_type_not_limit_or_avancerad");
  }

  if (requestedAction === "final_submit") {
    reasons.push("final_submit_action_forbidden");
  }

  if (
    action?.review_click_requested === true ||
    input.selector_readiness_snapshot?.review_click_requested === true
  ) {
    reasons.push("review_click_requested");
  }

  if (action?.review_modal_requested === true) {
    reasons.push("review_modal_requested");
  }

  if (action?.final_confirm_requested === true) {
    reasons.push("final_confirm_requested");
  }

  if (
    action?.order_submit_requested === true ||
    action?.order_placement_requested === true
  ) {
    reasons.push("order_submit_or_placement_requested");
  }

  if (action?.credential_or_session_handling_requested === true) {
    reasons.push("credential_or_session_handling_requested");
  }

  if (action?.browser_launch_requested === true) {
    reasons.push("browser_launch_requested");
  }

  if (action?.avanza_access_requested === true) {
    reasons.push("avanza_access_requested");
  }

  if (action?.dom_query_requested === true) {
    reasons.push("dom_query_requested");
  }

  if (action?.field_fill_requested === true) {
    reasons.push("field_fill_requested_by_current_action");
  }

  if (action?.sell_requested === true) {
    reasons.push("sell_requested");
  }

  if (action?.stop_loss_requested === true) {
    reasons.push("stop_loss_requested");
  }

  if (action?.glidande_requested === true) {
    reasons.push("glidande_requested");
  }

  if (action?.browser_unattended_run_requested === true) {
    reasons.push("unattended_run_requested");
  }

  if (input.evidence_plan?.pre_run_visible_state_evidence_planned !== true) {
    reasons.push("evidence:pre_run_visible_state_missing");
  }

  if (input.evidence_plan?.intended_values_evidence_planned !== true) {
    reasons.push("evidence:intended_values_missing");
  }

  if (input.evidence_plan?.selector_plan_evidence_planned !== true) {
    reasons.push("evidence:selector_plan_missing");
  }

  if (input.evidence_plan?.stop_before_review_evidence_planned !== true) {
    reasons.push("evidence:stop_before_review_missing");
  }

  if (input.evidence_plan?.no_review_modal_evidence_planned !== true) {
    reasons.push("evidence:no_review_modal_missing");
  }

  if (input.evidence_plan?.no_final_or_submit_evidence_planned !== true) {
    reasons.push("evidence:no_final_or_submit_missing");
  }

  return reasons;
}

function buildSkeletonDecision(
  input: FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunRequest,
): FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonDecision {
  return buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision({
    ...input,
    real_browser_adapter_enabled: input.real_browser_adapter_enabled ?? true,
    evidence_plan:
      input.evidence_plan as FirstRealAvanzaFillOnlyPocManualRunSetupEvidencePlan,
    requested_actions:
      input.requested_actions as FirstRealAvanzaFillOnlyPocManualRunSetupRequestedActions,
  });
}

function disabledDecision(
  input: FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunRequest,
): FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunDecision {
  return {
    status: "disabled",
    real_browser_fill_only_run_adapter_enabled: false,
    ready_for_fill_only_browser_run: false,
    ready_status_meaning:
      "ready_for_future_separately_approved_invocation_no_run_performed",
    blocked_reasons: ["real_browser_fill_only_run_adapter_disabled"],
    blockers: ["real_browser_fill_only_run_adapter_disabled"],
    real_browser_adapter_skeleton_decision: null,
    execution_dry_run_decision: null,
    manual_run_setup_decision: null,
    gated_skeleton_decision: null,
    implementation_stub_decision: null,
    guard_decision: null,
    selector_policy: null,
    planned_phases: firstRealAvanzaFillOnlyPocGatedRealBrowserRunPlannedPhases,
    field_fill_plan: defaultFieldFillPlan(input),
    hard_forbidden_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
    blocked_review_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
    abort_conditions:
      firstRealAvanzaFillOnlyPocGatedRealBrowserRunAbortConditions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocGatedRealBrowserRunEvidenceRequirements,
    blocked_actions: firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
    capability_flags: capabilityFlags(false),
    stop_point: "before_review_button",
    safety_confirmations: safetyConfirmations,
  };
}

export function buildFirstFillOnlyPocGatedRealBrowserFillOnlyRunDecision(
  input: FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunRequest = {},
): FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunDecision {
  if (input.real_browser_fill_only_run_adapter_enabled !== true) {
    return disabledDecision(input);
  }

  const skeletonDecision = buildSkeletonDecision(input);
  const directReasons = missingDirectReasons(input);
  const skeletonReasons =
    skeletonDecision.status === "ready_for_real_browser_adapter_setup"
      ? []
      : [
          `real_browser_adapter_skeleton:${skeletonDecision.status}`,
          ...skeletonDecision.blocked_reasons.map(
            (reason) => `real_browser_adapter_skeleton:${reason}`,
          ),
        ];
  const blockedReasons = uniqueStrings([...directReasons, ...skeletonReasons]);
  const safetyReasonPattern =
    /(review|final|submit|placement|credential|session|browser_launch|avanza_access|dom_query|field_fill|sell|stop_loss|glidande|unattended|forbidden|generated|selector_policy:forbidden)/;
  const failedSafety =
    skeletonDecision.status === "failed_safety" ||
    blockedReasons.some((reason) => safetyReasonPattern.test(reason));
  const status: FirstRealAvanzaFillOnlyPocGatedRealBrowserFillOnlyRunStatus =
    blockedReasons.length === 0
      ? "ready_for_fill_only_browser_run"
      : failedSafety
        ? "failed_safety"
        : "blocked";

  return {
    status,
    real_browser_fill_only_run_adapter_enabled: true,
    ready_for_fill_only_browser_run:
      status === "ready_for_fill_only_browser_run",
    ready_status_meaning:
      "ready_for_future_separately_approved_invocation_no_run_performed",
    blocked_reasons: blockedReasons,
    blockers: blockedReasons,
    real_browser_adapter_skeleton_decision: skeletonDecision,
    execution_dry_run_decision: skeletonDecision.execution_dry_run_decision,
    manual_run_setup_decision: skeletonDecision.manual_run_setup_decision,
    gated_skeleton_decision: skeletonDecision.gated_skeleton_decision,
    implementation_stub_decision:
      skeletonDecision.implementation_stub_decision,
    guard_decision: skeletonDecision.guard_decision,
    selector_policy: skeletonDecision.selector_policy,
    planned_phases: firstRealAvanzaFillOnlyPocGatedRealBrowserRunPlannedPhases,
    field_fill_plan: {
      ...skeletonDecision.planned_field_metadata,
      mode: "metadata_only_no_browser_execution",
    },
    hard_forbidden_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
    blocked_review_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
    abort_conditions:
      firstRealAvanzaFillOnlyPocGatedRealBrowserRunAbortConditions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocGatedRealBrowserRunEvidenceRequirements,
    blocked_actions: firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
    capability_flags: capabilityFlags(
      status === "ready_for_fill_only_browser_run",
    ),
    stop_point: "before_review_button",
    safety_confirmations: safetyConfirmations,
  };
}
