import type { FirstFillOnlyPocApprovalStateInput } from "@/lib/first-real-avanza-fill-only-poc-approval-state-contract";
import {
  buildFirstFillOnlyPocDryRunDecision,
  firstFillOnlyPocEvidenceRequirements,
  type FirstFillOnlyPocDryRunDecision,
  type FirstFillOnlyPocOperatorApprovalSnapshot,
  type FirstFillOnlyPocSelectorReadinessSnapshot,
  type FirstFillOnlyPocStaticDryRunPayload,
} from "@/lib/first-real-avanza-fill-only-poc-dry-run-harness";
import {
  buildFirstFillOnlyPocExecutionDryRunAdapterDecision,
  firstRealAvanzaFillOnlyPocExecutionDryRunHardForbiddenSelectors,
  type FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterDecision,
  type FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest,
} from "@/lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton";
import {
  buildFirstRealAvanzaFillOnlyPocImplementationStubDecision,
  type FirstRealAvanzaFillOnlyPocImplementationStubDecision,
} from "@/lib/first-real-avanza-fill-only-poc-implementation-stub";
import {
  buildFirstFillOnlyPocManualRunSetupDecision,
  type FirstRealAvanzaFillOnlyPocManualRunSetupDecision,
  type FirstRealAvanzaFillOnlyPocManualRunSetupEvidencePlan,
  type FirstRealAvanzaFillOnlyPocManualRunSetupRequestedActions,
  type FirstRealAvanzaFillOnlyPocOperatorSetupEvidenceSnapshot,
} from "@/lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import {
  buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision,
  gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
  type GatedRealAvanzaFillOnlyAdapterSkeletonDecision,
} from "@/lib/gated-real-avanza-fill-only-adapter-skeleton";
import {
  evaluateRealAvanzaFillOnlyGuard,
  evaluateSelectorPolicyForFirstFillOnlyPoc,
  getForbiddenFinalSelectors,
  type RealAvanzaFillOnlyGuardDecision,
  type RealAvanzaFillOnlySelectorPolicy,
} from "@/lib/real-avanza-fill-only-guard";
import { findRealAvanzaSelectorMappingEntry } from "@/lib/real-avanza-selector-mapping-contract";

export type FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonStatus =
  | "disabled"
  | "blocked"
  | "ready_for_real_browser_adapter_setup"
  | "failed_safety";

export type FirstRealAvanzaFillOnlyPocRealBrowserAdapterSafetyGateDecision =
  | "real_browser_adapter_safety_gate_ready"
  | string;

export type FirstRealAvanzaFillOnlyPocRealBrowserCapabilityFlags = {
  can_launch_browser: false;
  can_attach_to_browser: false;
  can_access_avanza: false;
  can_query_dom: false;
  can_read_session_storage: false;
  can_read_cookies: false;
};

export type FirstRealAvanzaFillOnlyPocRealBrowserExecutionCapabilityFlags = {
  can_fill_fields: false;
  can_click_review: false;
  can_click_final_confirm: false;
  can_submit_order: false;
  can_place_order: false;
};

export type FirstRealAvanzaFillOnlyPocRealBrowserAdapterEvidencePlan =
  FirstRealAvanzaFillOnlyPocManualRunSetupEvidencePlan & {
    real_browser_skeleton_evidence_acknowledged?: boolean | null;
  };

export type FirstRealAvanzaFillOnlyPocRealBrowserAdapterRequestedActions =
  FirstRealAvanzaFillOnlyPocManualRunSetupRequestedActions & {
    credential_or_session_handling_requested?: boolean | null;
    browser_launch_requested?: boolean | null;
    avanza_access_requested?: boolean | null;
    dom_query_requested?: boolean | null;
    field_fill_requested?: boolean | null;
    sell_requested?: boolean | null;
    stop_loss_requested?: boolean | null;
    glidande_requested?: boolean | null;
    account_change_requested?: boolean | null;
    side_switch_requested?: boolean | null;
    steppers_requested?: boolean | null;
    select_all_account_requested?: boolean | null;
  };

export type FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest = {
  real_browser_adapter_enabled?: boolean | null;
  real_browser_adapter_safety_gate_decision?:
    | FirstRealAvanzaFillOnlyPocRealBrowserAdapterSafetyGateDecision
    | null;
  execution_dry_run_decision_snapshot?:
    | FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterDecision
    | null;
  manual_run_setup_decision_snapshot?:
    | FirstRealAvanzaFillOnlyPocManualRunSetupDecision
    | null;
  approval_snapshot?: FirstFillOnlyPocApprovalStateInput | null;
  operator_setup_snapshot?:
    | FirstRealAvanzaFillOnlyPocOperatorSetupEvidenceSnapshot
    | null;
  payload_snapshot?: FirstFillOnlyPocStaticDryRunPayload | null;
  selector_readiness_snapshot?: FirstFillOnlyPocSelectorReadinessSnapshot | null;
  operator_approval_snapshot?: FirstFillOnlyPocOperatorApprovalSnapshot | null;
  intended_amount_sek?: number | null;
  intended_price?: number | null;
  cap_sek?: number | null;
  evidence_plan?: FirstRealAvanzaFillOnlyPocRealBrowserAdapterEvidencePlan | null;
  operator_presence_confirmed?: boolean | null;
  requested_actions?:
    | FirstRealAvanzaFillOnlyPocRealBrowserAdapterRequestedActions
    | null;
};

export type FirstRealAvanzaFillOnlyPocPlannedBrowserCheck = {
  key:
    | "browser_manually_opened_by_operator"
    | "avanza_manually_logged_in_by_operator"
    | "operator_verifies_account"
    | "operator_verifies_instrument"
    | "verify_buy_side"
    | "verify_limit_avancerad"
    | "prepare_amount_field_metadata"
    | "prepare_price_field_metadata"
    | "prepare_total_read_metadata"
    | "stop_before_review";
  label: string;
  selector: string | null;
  value: string | number | null;
  mode:
    | "manual_operator_confirmation"
    | "future_metadata_only"
    | "read_metadata_only"
    | "hard_stop";
};

export type FirstRealAvanzaFillOnlyPocRealBrowserFieldMetadata = {
  amount: {
    selector: string;
    value: number | null;
    mode: "metadata_only_no_fill";
  };
  price: {
    selector: string;
    value: number | null;
    mode: "metadata_only_no_fill";
  };
  total: {
    selector: string;
    value: null;
    mode: "metadata_only_no_read";
  };
};

export type FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonDecision = {
  status: FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonStatus;
  real_browser_adapter_enabled: boolean;
  ready_for_real_browser_adapter_setup: boolean;
  blocked_reasons: readonly string[];
  blockers: readonly string[];
  browser_capability_flags: FirstRealAvanzaFillOnlyPocRealBrowserCapabilityFlags;
  execution_capability_flags: FirstRealAvanzaFillOnlyPocRealBrowserExecutionCapabilityFlags;
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
  planned_browser_checks: readonly FirstRealAvanzaFillOnlyPocPlannedBrowserCheck[];
  planned_field_metadata: FirstRealAvanzaFillOnlyPocRealBrowserFieldMetadata;
  hard_forbidden_selectors: readonly string[];
  blocked_review_selectors: readonly string[];
  forbidden_actions: typeof gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions;
  blocked_actions: readonly string[];
  evidence_requirements: readonly string[];
  stop_point: "before_review_button";
  ready_status_meaning:
    "metadata_ready_only_no_browser_access_no_dom_no_fill_no_click_no_submit";
  safety_confirmations: {
    disabled_by_default: true;
    non_executing: true;
    no_real_avanza_access: true;
    no_browser_launch: true;
    no_browser_attach: true;
    no_dom_query: true;
    no_field_fill: true;
    no_review_click: true;
    no_final_confirm: true;
    no_order_submit: true;
    no_order_placement: true;
    no_broker_behavior: true;
    no_database_write: true;
    no_external_invocation: true;
    no_credential_or_session_handling: true;
  };
};

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizeLower(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function selectorForKey(key: string): string {
  const entry = findRealAvanzaSelectorMappingEntry(key);

  if (!entry) {
    throw new Error(`Missing real Avanza selector mapping entry: ${key}`);
  }

  return entry.selector;
}

export const firstRealAvanzaFillOnlyPocRealBrowserCapabilityFlags = {
  can_launch_browser: false,
  can_attach_to_browser: false,
  can_access_avanza: false,
  can_query_dom: false,
  can_read_session_storage: false,
  can_read_cookies: false,
} as const satisfies FirstRealAvanzaFillOnlyPocRealBrowserCapabilityFlags;

export const firstRealAvanzaFillOnlyPocRealBrowserExecutionCapabilityFlags = {
  can_fill_fields: false,
  can_click_review: false,
  can_click_final_confirm: false,
  can_submit_order: false,
  can_place_order: false,
} as const satisfies FirstRealAvanzaFillOnlyPocRealBrowserExecutionCapabilityFlags;

const safetyConfirmations = {
  disabled_by_default: true,
  non_executing: true,
  no_real_avanza_access: true,
  no_browser_launch: true,
  no_browser_attach: true,
  no_dom_query: true,
  no_field_fill: true,
  no_review_click: true,
  no_final_confirm: true,
  no_order_submit: true,
  no_order_placement: true,
  no_broker_behavior: true,
  no_database_write: true,
  no_external_invocation: true,
  no_credential_or_session_handling: true,
} as const;

export const firstRealAvanzaFillOnlyPocRealBrowserBlockedActions = [
  "browser_launch",
  "browser_attach",
  "avanza_access",
  "dom_query",
  "field_fill",
  "review_click",
  "final_confirm",
  "submit",
  "sell",
  "stop_loss",
  "glidande",
  "account_change",
  "side_switch",
  "steppers",
  "select_all_account",
  "credential_or_2fa_handling",
  "session_cookie_or_local_storage_reading",
] as const;

export const firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors = [
  selectorForKey("review_buy_button"),
  selectorForKey("review_sell_button"),
] as const;

export const firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors =
  uniqueStrings([
    ...getForbiddenFinalSelectors(),
    ...firstRealAvanzaFillOnlyPocExecutionDryRunHardForbiddenSelectors,
    'button[data-e2e="confirmOrderButton"]',
    'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
    'button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]',
  ]);

export const firstRealAvanzaFillOnlyPocRealBrowserEvidenceRequirements =
  uniqueStrings([
    ...firstFillOnlyPocEvidenceRequirements,
    "real_browser_adapter_safety_gate_decision",
    "execution_dry_run_adapter_decision_output",
    "manual_run_setup_decision_output",
    "operator_setup_evidence",
    "selector_mapping_contract_snapshot",
    "real_browser_skeleton_decision_output",
    "future_disabled_adapter_design_notes",
    "no_browser_access_statement",
    "no_dom_query_statement",
    "no_fill_click_submit_statement",
  ]);

function plannedFieldMetadata(
  input: FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
): FirstRealAvanzaFillOnlyPocRealBrowserFieldMetadata {
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
  };
}

function plannedBrowserChecks(
  input: FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
): readonly FirstRealAvanzaFillOnlyPocPlannedBrowserCheck[] {
  return [
    {
      key: "browser_manually_opened_by_operator",
      label: "Operator manually opens the browser in a future approved action",
      selector: null,
      value: "operator_manual_browser_only",
      mode: "manual_operator_confirmation",
    },
    {
      key: "avanza_manually_logged_in_by_operator",
      label: "Operator manually logs in to Avanza in a future approved action",
      selector: null,
      value: "operator_manual_login_only",
      mode: "manual_operator_confirmation",
    },
    {
      key: "operator_verifies_account",
      label: "Operator verifies account",
      selector: selectorForKey("account_selector_collapsed"),
      value: "manual_account_verification_required",
      mode: "manual_operator_confirmation",
    },
    {
      key: "operator_verifies_instrument",
      label: "Operator verifies instrument",
      selector: selectorForKey("instrument_market_info_panel"),
      value: "manual_instrument_verification_required",
      mode: "manual_operator_confirmation",
    },
    {
      key: "verify_buy_side",
      label: "Verify buy side metadata",
      selector: selectorForKey("side_switch_buy_state"),
      value: "buy",
      mode: "future_metadata_only",
    },
    {
      key: "verify_limit_avancerad",
      label: "Verify Limit/Avancerad metadata",
      selector: selectorForKey("order_type_limit_checked"),
      value: "limit",
      mode: "future_metadata_only",
    },
    {
      key: "prepare_amount_field_metadata",
      label: "Prepare amount field metadata only",
      selector: selectorForKey("amount_input"),
      value: input.intended_amount_sek ?? null,
      mode: "future_metadata_only",
    },
    {
      key: "prepare_price_field_metadata",
      label: "Prepare price field metadata only",
      selector: selectorForKey("price_input"),
      value: input.intended_price ?? null,
      mode: "future_metadata_only",
    },
    {
      key: "prepare_total_read_metadata",
      label: "Prepare total read metadata only",
      selector: selectorForKey("total_amount"),
      value: null,
      mode: "read_metadata_only",
    },
    {
      key: "stop_before_review",
      label: "Stop before review",
      selector: selectorForKey("review_buy_button"),
      value: "before_review_button",
      mode: "hard_stop",
    },
  ];
}

function missingSnapshotReasons(
  input: FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
): string[] {
  const reasons: string[] = [];

  if (!input.real_browser_adapter_safety_gate_decision) {
    reasons.push("real_browser_adapter_safety_gate_missing");
  }

  if (!input.execution_dry_run_decision_snapshot) {
    reasons.push("execution_dry_run_decision_missing");
  }

  if (!input.manual_run_setup_decision_snapshot) {
    reasons.push("manual_run_setup_decision_missing");
  }

  if (!input.approval_snapshot) {
    reasons.push("approval_snapshot_missing");
  }

  if (!input.operator_setup_snapshot) {
    reasons.push("operator_setup_snapshot_missing");
  }

  if (!input.payload_snapshot) {
    reasons.push("payload_snapshot_missing");
  }

  if (!input.selector_readiness_snapshot) {
    reasons.push("selector_readiness_snapshot_missing");
  }

  if (!input.operator_approval_snapshot) {
    reasons.push("operator_approval_snapshot_missing");
  }

  return reasons;
}

function directSafetyReasons(
  input: FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
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
  const authority = payload?.payload?.authority as
    | Record<string, unknown>
    | null
    | undefined;

  if (
    input.real_browser_adapter_safety_gate_decision !==
    "real_browser_adapter_safety_gate_ready"
  ) {
    reasons.push("real_browser_adapter_safety_gate_not_ready");
  }

  if (input.execution_dry_run_decision_snapshot?.status !== "ready_for_execution_dry_run_setup") {
    reasons.push(
      input.execution_dry_run_decision_snapshot
        ? `execution_dry_run:${input.execution_dry_run_decision_snapshot.status}`
        : "execution_dry_run:not_built",
    );
  }

  if (input.manual_run_setup_decision_snapshot?.status !== "ready_for_fill_only_manual_setup") {
    reasons.push(
      input.manual_run_setup_decision_snapshot
        ? `manual_run_setup:${input.manual_run_setup_decision_snapshot.status}`
        : "manual_run_setup:not_built",
    );
  }

  if (input.operator_presence_confirmed !== true) {
    reasons.push("operator_presence:not_confirmed");
  }

  if (input.operator_setup_snapshot?.setup_decision !== "operator_setup_ready_for_manual_run_setup") {
    reasons.push("operator_setup:not_ready_for_manual_run_setup");
  }

  if (input.operator_setup_snapshot?.operator_present !== true) {
    reasons.push("operator_setup:operator_not_present");
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

  if (authority?.automatic_submit_allowed === true) {
    reasons.push("automatic_submit_forbidden");
  }

  if (authority?.agent_can_submit_order === true) {
    reasons.push("agent_submit_forbidden");
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

  if (action?.final_confirm_requested === true) {
    reasons.push("final_confirm_requested");
  }

  if (action?.order_submit_requested === true) {
    reasons.push("order_submit_requested");
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
    reasons.push("field_fill_requested");
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

  if (action?.account_change_requested === true) {
    reasons.push("account_change_requested");
  }

  if (action?.side_switch_requested === true) {
    reasons.push("side_switch_requested");
  }

  if (action?.steppers_requested === true) {
    reasons.push("steppers_requested");
  }

  if (action?.select_all_account_requested === true) {
    reasons.push("select_all_account_requested");
  }

  if (input.evidence_plan?.evidence_plan_acknowledged !== true) {
    reasons.push("evidence_plan:not_acknowledged");
  }

  if (input.evidence_plan?.screenshot_redaction_acknowledged !== true) {
    reasons.push("evidence_plan:screenshot_redaction_not_acknowledged");
  }

  if (input.evidence_plan?.real_browser_skeleton_evidence_acknowledged !== true) {
    reasons.push("evidence_plan:real_browser_skeleton_not_acknowledged");
  }

  return reasons;
}

function disabledDecision(
  input: FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
): FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonDecision {
  return {
    status: "disabled",
    real_browser_adapter_enabled: false,
    ready_for_real_browser_adapter_setup: false,
    blocked_reasons: ["real_browser_adapter_disabled"],
    blockers: ["real_browser_adapter_disabled"],
    browser_capability_flags:
      firstRealAvanzaFillOnlyPocRealBrowserCapabilityFlags,
    execution_capability_flags:
      firstRealAvanzaFillOnlyPocRealBrowserExecutionCapabilityFlags,
    execution_dry_run_decision: null,
    manual_run_setup_decision: null,
    gated_skeleton_decision: null,
    implementation_stub_decision: null,
    dry_run_decision: null,
    guard_decision: null,
    selector_policy: null,
    planned_browser_checks: plannedBrowserChecks(input),
    planned_field_metadata: plannedFieldMetadata(input),
    hard_forbidden_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
    blocked_review_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
    forbidden_actions: gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
    blocked_actions: firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocRealBrowserEvidenceRequirements,
    stop_point: "before_review_button",
    ready_status_meaning:
      "metadata_ready_only_no_browser_access_no_dom_no_fill_no_click_no_submit",
    safety_confirmations: safetyConfirmations,
  };
}

function buildExecutionDryRunDecisionFromInput(
  input: FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
): FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterDecision | null {
  if (input.execution_dry_run_decision_snapshot) {
    return input.execution_dry_run_decision_snapshot;
  }

  if (
    !input.manual_run_setup_decision_snapshot ||
    !input.approval_snapshot ||
    !input.operator_setup_snapshot ||
    !input.payload_snapshot ||
    !input.selector_readiness_snapshot ||
    !input.operator_approval_snapshot
  ) {
    return null;
  }

  return buildFirstFillOnlyPocExecutionDryRunAdapterDecision({
    execution_dry_run_adapter_enabled: true,
    manual_run_setup_decision_snapshot: input.manual_run_setup_decision_snapshot,
    approval_snapshot: input.approval_snapshot,
    operator_setup_snapshot: input.operator_setup_snapshot,
    payload_snapshot: input.payload_snapshot,
    selector_readiness_snapshot: input.selector_readiness_snapshot,
    operator_approval_snapshot: input.operator_approval_snapshot,
    intended_amount_sek: input.intended_amount_sek,
    intended_price: input.intended_price,
    cap_sek: input.cap_sek,
    evidence_plan: input.evidence_plan,
    requested_actions: input.requested_actions,
  } satisfies FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest);
}

function buildManualRunSetupDecisionFromInput(
  input: FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
): FirstRealAvanzaFillOnlyPocManualRunSetupDecision | null {
  if (input.manual_run_setup_decision_snapshot) {
    return input.manual_run_setup_decision_snapshot;
  }

  if (
    !input.approval_snapshot ||
    !input.operator_setup_snapshot ||
    !input.payload_snapshot ||
    !input.selector_readiness_snapshot ||
    !input.operator_approval_snapshot
  ) {
    return null;
  }

  return buildFirstFillOnlyPocManualRunSetupDecision({
    manual_run_setup_adapter_enabled: true,
    approval_snapshot: input.approval_snapshot,
    operator_setup_evidence_snapshot: input.operator_setup_snapshot,
    payload_snapshot: input.payload_snapshot,
    selector_readiness_snapshot: input.selector_readiness_snapshot,
    operator_approval_snapshot: input.operator_approval_snapshot,
    intended_amount_sek: input.intended_amount_sek,
    intended_price: input.intended_price,
    cap_sek: input.cap_sek,
    evidence_plan: input.evidence_plan,
    requested_actions: input.requested_actions,
  });
}

export function buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
  input: FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest = {},
): FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonDecision {
  if (input.real_browser_adapter_enabled !== true) {
    return disabledDecision(input);
  }

  const manualRunSetupDecision = buildManualRunSetupDecisionFromInput(input);
  const executionDryRunDecision = buildExecutionDryRunDecisionFromInput({
    ...input,
    manual_run_setup_decision_snapshot: manualRunSetupDecision,
  });
  const snapshotReasons = missingSnapshotReasons(input);
  const directReasons = directSafetyReasons({
    ...input,
    manual_run_setup_decision_snapshot: manualRunSetupDecision,
    execution_dry_run_decision_snapshot: executionDryRunDecision,
  });
  const selectorPolicy = evaluateSelectorPolicyForFirstFillOnlyPoc({
    available_selector_keys:
      input.selector_readiness_snapshot?.available_selector_keys,
    requested_selectors: input.selector_readiness_snapshot?.requested_selectors,
    sizing_mode: input.selector_readiness_snapshot?.sizing_mode,
  });
  const selectorReasons =
    selectorPolicy.status === "ready"
      ? []
      : [
          "selector_policy:not_ready",
          ...selectorPolicy.missing_required_selector_keys.map(
            (key) => `selector_policy:missing:${key}`,
          ),
          ...selectorPolicy.forbidden_selectors_present.map(
            (selector) => `selector_policy:forbidden:${selector}`,
          ),
          ...selectorPolicy.rejected_generated_selectors.map(
            (selector) => `selector_policy:generated:${selector}`,
          ),
        ];
  const canBuildRuntimeSafeDecisions = Boolean(
    input.approval_snapshot &&
      input.operator_setup_snapshot &&
      input.payload_snapshot &&
      input.selector_readiness_snapshot &&
      input.operator_approval_snapshot,
  );
  const dryRunDecision = canBuildRuntimeSafeDecisions
    ? buildFirstFillOnlyPocDryRunDecision({
        static_payload: input.payload_snapshot as FirstFillOnlyPocStaticDryRunPayload,
        selector_readiness:
          input.selector_readiness_snapshot as FirstFillOnlyPocSelectorReadinessSnapshot,
        operator_approval:
          input.operator_approval_snapshot as FirstFillOnlyPocOperatorApprovalSnapshot,
      })
    : null;
  const guardDecision = input.payload_snapshot
    ? evaluateRealAvanzaFillOnlyGuard({
        payload: input.payload_snapshot.payload,
        order_form: input.payload_snapshot.order_form,
        max_amount_cap_sek:
          input.cap_sek ?? input.payload_snapshot.max_amount_cap_sek,
        explicit_total_amount_sek:
          dryRunDecision?.parsed_total_amount_sek ?? input.intended_amount_sek,
        currency: input.payload_snapshot.currency,
        fx_to_sek_rate: input.payload_snapshot.fx_to_sek_rate,
        requested_action: input.payload_snapshot.requested_action,
      })
    : null;
  const implementationStubDecision =
    input.approval_snapshot && canBuildRuntimeSafeDecisions
      ? buildFirstRealAvanzaFillOnlyPocImplementationStubDecision({
          approval: input.approval_snapshot,
          dry_run: {
            static_payload: input.payload_snapshot as FirstFillOnlyPocStaticDryRunPayload,
            selector_readiness:
              input.selector_readiness_snapshot as FirstFillOnlyPocSelectorReadinessSnapshot,
            operator_approval:
              input.operator_approval_snapshot as FirstFillOnlyPocOperatorApprovalSnapshot,
          },
        })
      : null;
  const gatedSkeletonDecision = buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision({
    adapter_skeleton_enabled: true,
    approval_snapshot: input.approval_snapshot ?? null,
    payload_snapshot: input.payload_snapshot ?? null,
    selector_readiness_snapshot: input.selector_readiness_snapshot ?? null,
    operator_approval_snapshot: input.operator_approval_snapshot ?? null,
    operator_setup_snapshot: input.operator_setup_snapshot ?? null,
    evidence_plan_snapshot: input.evidence_plan ?? null,
  });
  const manualReasons =
    manualRunSetupDecision?.status === "ready_for_fill_only_manual_setup"
      ? []
      : manualRunSetupDecision
        ? [
            `manual_run_setup:${manualRunSetupDecision.status}`,
            ...manualRunSetupDecision.blocked_reasons.map(
              (reason) => `manual_run_setup:${reason}`,
            ),
          ]
        : ["manual_run_setup:not_built"];
  const executionReasons =
    executionDryRunDecision?.status === "ready_for_execution_dry_run_setup"
      ? []
      : executionDryRunDecision
        ? [
            `execution_dry_run:${executionDryRunDecision.status}`,
            ...executionDryRunDecision.blocked_reasons.map(
              (reason) => `execution_dry_run:${reason}`,
            ),
          ]
        : ["execution_dry_run:not_built"];
  const skeletonReasons =
    gatedSkeletonDecision.status === "ready_for_manual_run_setup"
      ? []
      : [
          `gated_skeleton:${gatedSkeletonDecision.status}`,
          ...gatedSkeletonDecision.blocked_reasons.map(
            (reason) => `gated_skeleton:${reason}`,
          ),
        ];
  const stubReasons =
    implementationStubDecision?.status === "stub_ready"
      ? []
      : implementationStubDecision
        ? [
            `implementation_stub:${implementationStubDecision.status}`,
            ...implementationStubDecision.blocked_reasons.map(
              (reason) => `implementation_stub:${reason}`,
            ),
          ]
        : ["implementation_stub:not_built"];
  const harnessReasons =
    dryRunDecision?.status === "approved_for_stub_only"
      ? []
      : dryRunDecision
        ? [
            `dry_run:${dryRunDecision.status}`,
            ...dryRunDecision.blocked_reasons.map(
              (reason) => `dry_run:${reason}`,
            ),
          ]
        : ["dry_run:not_built"];
  const guardReasons =
    guardDecision?.status === "approved_for_fill_only_poc"
      ? []
      : guardDecision
        ? [
            `fill_only_guard:${guardDecision.status}`,
            ...guardDecision.blocking_reasons.map(
              (reason) => `fill_only_guard:${reason}`,
            ),
          ]
        : ["fill_only_guard:not_built"];
  const blockedReasons = uniqueStrings([
    ...snapshotReasons,
    ...directReasons,
    ...selectorReasons,
    ...manualReasons,
    ...executionReasons,
    ...skeletonReasons,
    ...stubReasons,
    ...harnessReasons,
    ...guardReasons,
  ]);
  const safetyReasonPattern =
    /(review|final|submit|automatic|agent_submit|credential|session|browser_launch|avanza_access|dom_query|field_fill|sell|stop_loss|glidande|account_change|side_switch|steppers|select_all|forbidden|generated|selector_policy:forbidden)/;
  const failedSafety =
    blockedReasons.some((reason) => safetyReasonPattern.test(reason)) ||
    manualRunSetupDecision?.status === "failed_safety" ||
    executionDryRunDecision?.status === "failed_safety" ||
    gatedSkeletonDecision.status === "failed_safety" ||
    implementationStubDecision?.status === "failed_safety" ||
    dryRunDecision?.status === "failed_safety";
  const status: FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonStatus =
    blockedReasons.length === 0
      ? "ready_for_real_browser_adapter_setup"
      : failedSafety
        ? "failed_safety"
        : "blocked";

  return {
    status,
    real_browser_adapter_enabled: true,
    ready_for_real_browser_adapter_setup:
      status === "ready_for_real_browser_adapter_setup",
    blocked_reasons: blockedReasons,
    blockers: blockedReasons,
    browser_capability_flags:
      firstRealAvanzaFillOnlyPocRealBrowserCapabilityFlags,
    execution_capability_flags:
      firstRealAvanzaFillOnlyPocRealBrowserExecutionCapabilityFlags,
    execution_dry_run_decision: executionDryRunDecision,
    manual_run_setup_decision: manualRunSetupDecision,
    gated_skeleton_decision: gatedSkeletonDecision,
    implementation_stub_decision: implementationStubDecision,
    dry_run_decision: dryRunDecision,
    guard_decision: guardDecision,
    selector_policy: selectorPolicy,
    planned_browser_checks: plannedBrowserChecks(input),
    planned_field_metadata: plannedFieldMetadata(input),
    hard_forbidden_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserHardForbiddenSelectors,
    blocked_review_selectors:
      firstRealAvanzaFillOnlyPocRealBrowserBlockedReviewSelectors,
    forbidden_actions: gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
    blocked_actions: firstRealAvanzaFillOnlyPocRealBrowserBlockedActions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocRealBrowserEvidenceRequirements,
    stop_point: "before_review_button",
    ready_status_meaning:
      "metadata_ready_only_no_browser_access_no_dom_no_fill_no_click_no_submit",
    safety_confirmations: safetyConfirmations,
  };
}
