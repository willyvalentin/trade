export type FirstFillOnlyPocApprovalDecision =
  | "not_approved_yet"
  | "approved_for_stub_only"
  | "approved_for_first_fill_only_poc"
  | "deferred_pending_operator_setup"
  | "blocked_by_safety_condition"
  | "cancelled_by_operator";

export type FirstFillOnlyPocApprovalBlockedReason =
  | "explicit_user_approval_missing"
  | "approval_window_missing"
  | "approval_window_outside_current_time"
  | "operator_not_present"
  | "cap_missing"
  | "cap_exceeds_policy"
  | "scope_not_buy_only"
  | "order_type_not_limit"
  | "sizing_mode_not_amount_based"
  | "stop_point_not_before_review"
  | "review_click_allowed_or_requested"
  | "final_confirm_allowed_or_requested"
  | "credentials_or_2fa_handling_allowed"
  | "unattended_run_allowed"
  | "account_not_human_verified"
  | "instrument_not_human_verified"
  | "kill_switch_cancel_plan_missing"
  | "evidence_plan_missing";

export type FirstFillOnlyPocApprovalStateInput = {
  requested_decision?: FirstFillOnlyPocApprovalDecision | null;
  explicit_user_approval?: boolean | null;
  approval_window?: {
    starts_at?: string | null;
    ends_at?: string | null;
    evaluated_at?: string | null;
  } | null;
  operator_present?: boolean | null;
  max_amount_cap_sek?: number | null;
  scope?: {
    buy_only?: boolean | null;
    order_type?: "limit" | "avancerad" | string | null;
    sizing_mode?: "amount" | "quantity" | string | null;
    quantity_mode_explicitly_allowed?: boolean | null;
    stop_point?: "before_granska_kop" | string | null;
    review_click_allowed?: boolean | null;
    review_click_requested?: boolean | null;
    final_confirm_allowed?: boolean | null;
    final_confirm_requested?: boolean | null;
    credentials_or_2fa_handling_allowed?: boolean | null;
    unattended_run_allowed?: boolean | null;
  } | null;
  acknowledgements?: {
    no_final_confirm?: boolean | null;
    no_review_click_first_poc?: boolean | null;
    no_credentials_or_2fa_handling?: boolean | null;
    no_unattended_run?: boolean | null;
    account_human_verified?: boolean | null;
    instrument_human_verified?: boolean | null;
    kill_switch_cancel_plan?: boolean | null;
    evidence_plan?: boolean | null;
  } | null;
};

export type FirstFillOnlyPocApprovalState = {
  status: FirstFillOnlyPocApprovalDecision;
  real_dry_run_approved: boolean;
  stub_only_approved: boolean;
  default_state: "not_approved_yet";
  blocking_reasons: readonly FirstFillOnlyPocApprovalBlockedReason[];
  max_amount_cap_sek: number | null;
};

export const firstFillOnlyPocApprovalDecisionStatuses = [
  "not_approved_yet",
  "approved_for_stub_only",
  "approved_for_first_fill_only_poc",
  "deferred_pending_operator_setup",
  "blocked_by_safety_condition",
  "cancelled_by_operator",
] as const satisfies readonly FirstFillOnlyPocApprovalDecision[];

const maxPolicyCapSek = 1000;

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizeLower(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function parseTime(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const time = Date.parse(value);

  return Number.isFinite(time) ? time : null;
}

function isWithinWindow(input: FirstFillOnlyPocApprovalStateInput): boolean {
  const startsAt = parseTime(input.approval_window?.starts_at);
  const endsAt = parseTime(input.approval_window?.ends_at);
  const evaluatedAt = parseTime(input.approval_window?.evaluated_at);

  if (startsAt === null || endsAt === null || evaluatedAt === null) {
    return false;
  }

  return evaluatedAt >= startsAt && evaluatedAt <= endsAt;
}

function uniqueReasons(
  reasons: readonly FirstFillOnlyPocApprovalBlockedReason[],
): FirstFillOnlyPocApprovalBlockedReason[] {
  return [...new Set(reasons)];
}

export function evaluateFirstFillOnlyPocApprovalState(
  input: FirstFillOnlyPocApprovalStateInput = {},
): FirstFillOnlyPocApprovalState {
  const requestedDecision = input.requested_decision ?? "not_approved_yet";
  const cap = input.max_amount_cap_sek ?? null;

  if (requestedDecision === "approved_for_stub_only") {
    return {
      status: "approved_for_stub_only",
      real_dry_run_approved: false,
      stub_only_approved: true,
      default_state: "not_approved_yet",
      blocking_reasons: [],
      max_amount_cap_sek: cap,
    };
  }

  if (requestedDecision === "deferred_pending_operator_setup") {
    return {
      status: "deferred_pending_operator_setup",
      real_dry_run_approved: false,
      stub_only_approved: false,
      default_state: "not_approved_yet",
      blocking_reasons: [],
      max_amount_cap_sek: cap,
    };
  }

  if (
    requestedDecision === "blocked_by_safety_condition" ||
    requestedDecision === "cancelled_by_operator"
  ) {
    return {
      status: requestedDecision,
      real_dry_run_approved: false,
      stub_only_approved: false,
      default_state: "not_approved_yet",
      blocking_reasons: [],
      max_amount_cap_sek: cap,
    };
  }

  if (requestedDecision !== "approved_for_first_fill_only_poc") {
    return {
      status: "not_approved_yet",
      real_dry_run_approved: false,
      stub_only_approved: false,
      default_state: "not_approved_yet",
      blocking_reasons: ["explicit_user_approval_missing"],
      max_amount_cap_sek: cap,
    };
  }

  const reasons: FirstFillOnlyPocApprovalBlockedReason[] = [];
  const scope = input.scope ?? {};
  const acknowledgements = input.acknowledgements ?? {};

  if (input.explicit_user_approval !== true) {
    reasons.push("explicit_user_approval_missing");
  }

  if (!input.approval_window) {
    reasons.push("approval_window_missing");
  } else if (!isWithinWindow(input)) {
    reasons.push("approval_window_outside_current_time");
  }

  if (input.operator_present !== true) {
    reasons.push("operator_not_present");
  }

  if (!isPositiveFiniteNumber(cap)) {
    reasons.push("cap_missing");
  } else if (cap > maxPolicyCapSek) {
    reasons.push("cap_exceeds_policy");
  }

  if (scope.buy_only !== true) {
    reasons.push("scope_not_buy_only");
  }

  if (!["limit", "avancerad"].includes(normalizeLower(scope.order_type))) {
    reasons.push("order_type_not_limit");
  }

  if (
    normalizeLower(scope.sizing_mode) !== "amount" &&
    scope.quantity_mode_explicitly_allowed !== true
  ) {
    reasons.push("sizing_mode_not_amount_based");
  }

  if (scope.stop_point !== "before_granska_kop") {
    reasons.push("stop_point_not_before_review");
  }

  if (
    scope.review_click_allowed === true ||
    scope.review_click_requested === true ||
    acknowledgements.no_review_click_first_poc !== true
  ) {
    reasons.push("review_click_allowed_or_requested");
  }

  if (
    scope.final_confirm_allowed === true ||
    scope.final_confirm_requested === true ||
    acknowledgements.no_final_confirm !== true
  ) {
    reasons.push("final_confirm_allowed_or_requested");
  }

  if (
    scope.credentials_or_2fa_handling_allowed === true ||
    acknowledgements.no_credentials_or_2fa_handling !== true
  ) {
    reasons.push("credentials_or_2fa_handling_allowed");
  }

  if (
    scope.unattended_run_allowed === true ||
    acknowledgements.no_unattended_run !== true
  ) {
    reasons.push("unattended_run_allowed");
  }

  if (acknowledgements.account_human_verified !== true) {
    reasons.push("account_not_human_verified");
  }

  if (acknowledgements.instrument_human_verified !== true) {
    reasons.push("instrument_not_human_verified");
  }

  if (acknowledgements.kill_switch_cancel_plan !== true) {
    reasons.push("kill_switch_cancel_plan_missing");
  }

  if (acknowledgements.evidence_plan !== true) {
    reasons.push("evidence_plan_missing");
  }

  const blockingReasons = uniqueReasons(reasons);

  return {
    status:
      blockingReasons.length === 0
        ? "approved_for_first_fill_only_poc"
        : "blocked_by_safety_condition",
    real_dry_run_approved: blockingReasons.length === 0,
    stub_only_approved: false,
    default_state: "not_approved_yet",
    blocking_reasons: blockingReasons,
    max_amount_cap_sek: cap,
  };
}
