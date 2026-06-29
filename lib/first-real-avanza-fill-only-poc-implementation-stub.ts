import {
  evaluateFirstFillOnlyPocApprovalState,
  type FirstFillOnlyPocApprovalState,
  type FirstFillOnlyPocApprovalStateInput,
} from "@/lib/first-real-avanza-fill-only-poc-approval-state-contract";
import {
  buildFirstFillOnlyPocDryRunDecision,
  firstFillOnlyPocEvidenceRequirements,
  type FirstFillOnlyPocDryRunDecision,
  type FirstFillOnlyPocDryRunDecisionInput,
} from "@/lib/first-real-avanza-fill-only-poc-dry-run-harness";
import {
  findRealAvanzaSelectorMappingEntry,
  realAvanzaSelectorMapping,
} from "@/lib/real-avanza-selector-mapping-contract";

export type FirstRealAvanzaFillOnlyPocImplementationStubStatus =
  | "not_approved"
  | "stub_ready"
  | "blocked"
  | "failed_safety";

export type FirstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags = {
  can_access_avanza: false;
  can_launch_browser: false;
  can_query_dom: false;
  can_fill_fields: false;
  can_click_review: false;
  can_click_final_confirm: false;
  can_submit_order: false;
};

export type FirstRealAvanzaFillOnlyPocPlannedFutureFieldTargets = {
  amount: string;
  price: string;
  total: string;
  instrument_summary: string;
  side_buy_verification: string;
  order_type_limit_verification: string;
};

export type FirstRealAvanzaFillOnlyPocBlockedSelectors = {
  review_buy_button: string;
  review_sell_button: string;
};

export type FirstRealAvanzaFillOnlyPocImplementationStubInput = {
  approval: FirstFillOnlyPocApprovalStateInput;
  dry_run: FirstFillOnlyPocDryRunDecisionInput;
};

export type FirstRealAvanzaFillOnlyPocImplementationStubDecision = {
  status: FirstRealAvanzaFillOnlyPocImplementationStubStatus;
  stub_ready: boolean;
  blocked_reasons: readonly string[];
  approval_state: FirstFillOnlyPocApprovalState;
  dry_run_decision: FirstFillOnlyPocDryRunDecision;
  capability_flags: FirstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags;
  planned_future_field_targets: FirstRealAvanzaFillOnlyPocPlannedFutureFieldTargets;
  forbidden_final_selectors: readonly string[];
  blocked_first_poc_selectors: FirstRealAvanzaFillOnlyPocBlockedSelectors;
  stop_point: "before_review_button";
  evidence_requirements: readonly string[];
};

const selectorKeys = {
  amount: "amount_input",
  price: "price_input",
  total: "total_amount",
  instrument_summary: "instrument_market_info_panel",
  side_buy_verification: "side_switch_buy_state",
  order_type_limit_verification: "order_type_limit_checked",
  review_buy_button: "review_buy_button",
  review_sell_button: "review_sell_button",
} as const;

export const firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags = {
  can_access_avanza: false,
  can_launch_browser: false,
  can_query_dom: false,
  can_fill_fields: false,
  can_click_review: false,
  can_click_final_confirm: false,
  can_submit_order: false,
} as const satisfies FirstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags;

function selectorForKey(key: string): string {
  const entry = findRealAvanzaSelectorMappingEntry(key);

  if (!entry) {
    throw new Error(`Missing real Avanza selector mapping entry: ${key}`);
  }

  return entry.selector;
}

export const firstRealAvanzaFillOnlyPocPlannedFutureFieldTargets = {
  amount: selectorForKey(selectorKeys.amount),
  price: selectorForKey(selectorKeys.price),
  total: selectorForKey(selectorKeys.total),
  instrument_summary: selectorForKey(selectorKeys.instrument_summary),
  side_buy_verification: selectorForKey(selectorKeys.side_buy_verification),
  order_type_limit_verification: selectorForKey(
    selectorKeys.order_type_limit_verification,
  ),
} as const satisfies FirstRealAvanzaFillOnlyPocPlannedFutureFieldTargets;

export const firstRealAvanzaFillOnlyPocBlockedSelectors = {
  review_buy_button: selectorForKey(selectorKeys.review_buy_button),
  review_sell_button: selectorForKey(selectorKeys.review_sell_button),
} as const satisfies FirstRealAvanzaFillOnlyPocBlockedSelectors;

export const firstRealAvanzaFillOnlyPocForbiddenFinalSelectors =
  realAvanzaSelectorMapping
    .filter((entry) => entry.hardStop === true)
    .map((entry) => entry.selector);

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function statusFromReasons(
  approvalState: FirstFillOnlyPocApprovalState,
  dryRunDecision: FirstFillOnlyPocDryRunDecision,
  reasons: readonly string[],
): FirstRealAvanzaFillOnlyPocImplementationStubStatus {
  if (reasons.length === 0) {
    return "stub_ready";
  }

  if (
    approvalState.status === "not_approved_yet" ||
    dryRunDecision.status === "not_approved" ||
    reasons.includes("approval:explicit_user_approval_missing")
  ) {
    return "not_approved";
  }

  if (
    dryRunDecision.status === "failed_safety" ||
    reasons.some((reason) => reason.includes("review") || reason.includes("final"))
  ) {
    return "failed_safety";
  }

  return "blocked";
}

export function buildFirstRealAvanzaFillOnlyPocImplementationStubDecision(
  input: FirstRealAvanzaFillOnlyPocImplementationStubInput,
): FirstRealAvanzaFillOnlyPocImplementationStubDecision {
  const approvalState = evaluateFirstFillOnlyPocApprovalState(input.approval);
  const dryRunDecision = buildFirstFillOnlyPocDryRunDecision({
    ...input.dry_run,
    operator_approval: {
      ...input.dry_run.operator_approval,
      approval_decision: approvalState.status,
    },
  });
  const reasons: string[] = [];

  if (!approvalState.real_dry_run_approved) {
    reasons.push(`approval:${approvalState.status}`);
    reasons.push(
      ...approvalState.blocking_reasons.map((reason) => `approval:${reason}`),
    );
  }

  if (dryRunDecision.status !== "approved_for_stub_only") {
    reasons.push(`dry_run:${dryRunDecision.status}`);
    reasons.push(
      ...dryRunDecision.blocked_reasons.map((reason) => `dry_run:${reason}`),
    );
  }

  const blockedReasons = uniqueStrings(reasons);
  const status = statusFromReasons(approvalState, dryRunDecision, blockedReasons);

  return {
    status,
    stub_ready: status === "stub_ready",
    blocked_reasons: blockedReasons,
    approval_state: approvalState,
    dry_run_decision: dryRunDecision,
    capability_flags: firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags,
    planned_future_field_targets:
      firstRealAvanzaFillOnlyPocPlannedFutureFieldTargets,
    forbidden_final_selectors:
      firstRealAvanzaFillOnlyPocForbiddenFinalSelectors,
    blocked_first_poc_selectors: firstRealAvanzaFillOnlyPocBlockedSelectors,
    stop_point: "before_review_button",
    evidence_requirements: firstFillOnlyPocEvidenceRequirements,
  };
}
