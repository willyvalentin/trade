import type { SemiAutoAvanzaAgentPayload } from "@/lib/semi-auto-agent-payload-contract";
import type { FirstFillOnlyPocApprovalDecision } from "@/lib/first-real-avanza-fill-only-poc-approval-state-contract";
import {
  evaluateRealAvanzaFillOnlyGuard,
  evaluateSelectorPolicyForFirstFillOnlyPoc,
  getForbiddenFinalSelectors,
  isGeneratedSelectorStrategyRejected,
  isSelectorBlockedForFirstPoc,
  isSelectorForbiddenFinalAction,
  type RealAvanzaFillOnlySelectorSizingMode,
} from "@/lib/real-avanza-fill-only-guard";

export type FirstFillOnlyPocDryRunStatus =
  | "not_approved"
  | "approved_for_stub_only"
  | "blocked"
  | "failed_safety";

export type FirstFillOnlyPocDryRunBlockedReason =
  | "approval_missing"
  | "approval_deferred"
  | "approval_blocked"
  | "approval_cancelled"
  | "cap_missing"
  | "cap_exceeds_policy"
  | "selector_readiness_missing"
  | "total_amount_selector_missing"
  | "total_amount_unparseable"
  | "total_amount_exceeds_cap"
  | "account_not_human_verified"
  | "instrument_not_human_verified"
  | "price_currency_not_human_verified"
  | "side_not_buy"
  | "order_type_not_limit"
  | "validation_errors_present"
  | "review_click_requested"
  | "final_selector_targeted"
  | "generated_selector_strategy_used"
  | "real_action_flag_requested"
  | "fill_only_guard_blocked"
  | string;

export type FirstFillOnlyPocStaticDryRunPayload = {
  payload: Partial<SemiAutoAvanzaAgentPayload> | null | undefined;
  order_form: "avancerad" | "stop_loss" | "glidande" | string;
  requested_action?: "fill_only" | "final_submit" | string | null;
  max_amount_cap_sek?: number | null;
  currency?: string | null;
  fx_to_sek_rate?: number | null;
  order_type?: "limit" | "avancerad" | string | null;
  side?: "buy" | "sell" | string | null;
};

export type FirstFillOnlyPocSelectorReadinessSnapshot = {
  available_selector_keys?: readonly string[] | null;
  requested_selectors?: readonly string[] | null;
  sizing_mode?: RealAvanzaFillOnlySelectorSizingMode | null;
  total_amount_selector_available: boolean;
  total_amount_text?: string | null;
  generated_selector_strategy_used?: boolean;
  validation_errors?: readonly string[] | null;
  review_click_requested?: boolean;
};

export type FirstFillOnlyPocOperatorApprovalSnapshot = {
  approval_decision: FirstFillOnlyPocApprovalDecision;
  account_human_verified: boolean;
  instrument_human_verified: boolean;
  price_currency_human_verified: boolean;
};

export type FirstFillOnlyPocRealActionFlags = {
  real_avanza_access: false;
  browser_automation: false;
  dom_querying: false;
  field_filling: false;
  clicking: false;
  submit: false;
  review_click_allowed: false;
  final_confirm_allowed: false;
};

export type FirstFillOnlyPocDryRunDecisionInput = {
  static_payload: FirstFillOnlyPocStaticDryRunPayload;
  selector_readiness: FirstFillOnlyPocSelectorReadinessSnapshot;
  operator_approval: FirstFillOnlyPocOperatorApprovalSnapshot;
};

export type FirstFillOnlyPocDryRunDecision = {
  status: FirstFillOnlyPocDryRunStatus;
  approved_for_stub_only: boolean;
  blocked_reasons: readonly FirstFillOnlyPocDryRunBlockedReason[];
  parsed_total_amount_sek: number | null;
  max_amount_cap_sek: number | null;
  evidence_requirements: readonly string[];
  forbidden_selectors: readonly string[];
  real_action_flags: FirstFillOnlyPocRealActionFlags;
  guard_status: ReturnType<typeof evaluateRealAvanzaFillOnlyGuard>["status"];
  selector_policy_status: ReturnType<
    typeof evaluateSelectorPolicyForFirstFillOnlyPoc
  >["status"];
};

export const firstFillOnlyPocRealActionFlags = {
  real_avanza_access: false,
  browser_automation: false,
  dom_querying: false,
  field_filling: false,
  clicking: false,
  submit: false,
  review_click_allowed: false,
  final_confirm_allowed: false,
} as const satisfies FirstFillOnlyPocRealActionFlags;

export const firstFillOnlyPocEvidenceRequirements = [
  "before_screenshot",
  "after_fill_screenshot",
  "guard_decision_output",
  "cap_decision_output",
  "selector_policy_output",
  "visible_amount",
  "visible_price",
  "visible_total",
  "visible_buy_side",
  "visible_avancerad_limit",
  "no_review_click_statement",
  "no_modal_opened_statement",
  "no_final_click_statement",
  "no_order_placed_statement",
  "warnings_validation_notes",
] as const;

const maxPolicyCapSek = 1000;

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function normalizeLower(value: string | null | undefined): string {
  return normalizeText(value).toLowerCase();
}

function parseSekTotal(value: string | null | undefined): number | null {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const lower = text.toLowerCase();

  if (!lower.includes("sek") && !lower.includes("kr")) {
    return null;
  }

  const match = text.match(/-?\d[\d\s.,]*/);

  if (!match) {
    return null;
  }

  const compact = match[0].replace(/\s/g, "");
  const decimalNormalized =
    compact.includes(",") && compact.lastIndexOf(",") > compact.lastIndexOf(".")
      ? compact.replace(/\./g, "").replace(",", ".")
      : compact.replace(/,/g, "");
  const amount = Number(decimalNormalized);

  return isPositiveFiniteNumber(amount) ? Number(amount.toFixed(2)) : null;
}

function uniqueReasons(
  reasons: readonly FirstFillOnlyPocDryRunBlockedReason[],
): FirstFillOnlyPocDryRunBlockedReason[] {
  return [...new Set(reasons)];
}

function approvalBlocks(
  decision: FirstFillOnlyPocApprovalDecision,
): FirstFillOnlyPocDryRunBlockedReason[] {
  if (decision === "not_approved_yet") {
    return ["approval_missing"];
  }

  if (decision === "deferred_pending_operator_setup") {
    return ["approval_deferred"];
  }

  if (decision === "blocked_by_safety_condition") {
    return ["approval_blocked"];
  }

  if (decision === "cancelled_by_operator") {
    return ["approval_cancelled"];
  }

  return [];
}

function hasFinalSelector(selectors: readonly string[]): boolean {
  return selectors.some((selector) => isSelectorForbiddenFinalAction(selector));
}

function hasBlockedReviewSelector(selectors: readonly string[]): boolean {
  return selectors.some(
    (selector) =>
      isSelectorBlockedForFirstPoc(selector) &&
      selector.includes('data-e2e="orderButton"'),
  );
}

export function buildFirstFillOnlyPocDryRunDecision(
  input: FirstFillOnlyPocDryRunDecisionInput,
): FirstFillOnlyPocDryRunDecision {
  const requestedSelectors = input.selector_readiness.requested_selectors ?? [];
  const cap = input.static_payload.max_amount_cap_sek ?? null;
  const parsedTotal = parseSekTotal(input.selector_readiness.total_amount_text);
  const selectorPolicy = evaluateSelectorPolicyForFirstFillOnlyPoc({
    available_selector_keys: input.selector_readiness.available_selector_keys,
    requested_selectors: requestedSelectors,
    sizing_mode: input.selector_readiness.sizing_mode,
  });
  const guardDecision = evaluateRealAvanzaFillOnlyGuard({
    payload: input.static_payload.payload,
    order_form: input.static_payload.order_form,
    max_amount_cap_sek: cap,
    explicit_total_amount_sek: parsedTotal,
    currency: input.static_payload.currency ?? "SEK",
    fx_to_sek_rate: input.static_payload.fx_to_sek_rate,
    requested_action: input.static_payload.requested_action,
  });
  const reasons: FirstFillOnlyPocDryRunBlockedReason[] = [
    ...approvalBlocks(input.operator_approval.approval_decision),
  ];

  if (!isPositiveFiniteNumber(cap)) {
    reasons.push("cap_missing");
  } else if (cap > maxPolicyCapSek) {
    reasons.push("cap_exceeds_policy");
  }

  if (selectorPolicy.status !== "ready") {
    reasons.push("selector_readiness_missing");
  }

  if (!input.selector_readiness.total_amount_selector_available) {
    reasons.push("total_amount_selector_missing");
  }

  if (parsedTotal === null) {
    reasons.push("total_amount_unparseable");
  } else if (isPositiveFiniteNumber(cap) && parsedTotal > cap) {
    reasons.push("total_amount_exceeds_cap");
  }

  if (!input.operator_approval.account_human_verified) {
    reasons.push("account_not_human_verified");
  }

  if (!input.operator_approval.instrument_human_verified) {
    reasons.push("instrument_not_human_verified");
  }

  if (!input.operator_approval.price_currency_human_verified) {
    reasons.push("price_currency_not_human_verified");
  }

  const payloadSide = normalizeLower(input.static_payload.payload?.side);
  const inputSide = normalizeLower(input.static_payload.side);

  if ((inputSide || payloadSide) !== "buy") {
    reasons.push("side_not_buy");
  }

  const payloadOrderType = normalizeLower(input.static_payload.payload?.order_type);
  const inputOrderType = normalizeLower(input.static_payload.order_type);

  if (!["limit", "avancerad"].includes(inputOrderType || payloadOrderType)) {
    reasons.push("order_type_not_limit");
  }

  if ((input.selector_readiness.validation_errors ?? []).length > 0) {
    reasons.push("validation_errors_present");
  }

  if (
    input.selector_readiness.review_click_requested === true ||
    hasBlockedReviewSelector(requestedSelectors)
  ) {
    reasons.push("review_click_requested");
  }

  if (hasFinalSelector(requestedSelectors)) {
    reasons.push("final_selector_targeted");
  }

  if (
    input.selector_readiness.generated_selector_strategy_used === true ||
    requestedSelectors.some((selector) => isGeneratedSelectorStrategyRejected(selector))
  ) {
    reasons.push("generated_selector_strategy_used");
  }

  if (
    Object.values(firstFillOnlyPocRealActionFlags).some((flag) => flag !== false)
  ) {
    reasons.push("real_action_flag_requested");
  }

  if (guardDecision.status === "blocked") {
    reasons.push(
      ...guardDecision.blocking_reasons.map(
        (reason) => `fill_only_guard:${reason}` as const,
      ),
      "fill_only_guard_blocked",
    );
  }

  const blockedReasons = uniqueReasons(reasons);
  const safetyReasons = new Set<FirstFillOnlyPocDryRunBlockedReason>([
    "review_click_requested",
    "final_selector_targeted",
    "generated_selector_strategy_used",
    "real_action_flag_requested",
  ]);
  const status: FirstFillOnlyPocDryRunStatus =
    blockedReasons.length === 0
      ? "approved_for_stub_only"
      : blockedReasons.includes("approval_missing")
        ? "not_approved"
        : blockedReasons.some((reason) => safetyReasons.has(reason))
          ? "failed_safety"
          : "blocked";

  return {
    status,
    approved_for_stub_only: status === "approved_for_stub_only",
    blocked_reasons: blockedReasons,
    parsed_total_amount_sek: parsedTotal,
    max_amount_cap_sek: cap,
    evidence_requirements: firstFillOnlyPocEvidenceRequirements,
    forbidden_selectors: getForbiddenFinalSelectors(),
    real_action_flags: firstFillOnlyPocRealActionFlags,
    guard_status: guardDecision.status,
    selector_policy_status: selectorPolicy.status,
  };
}
