import type { FirstFillOnlyPocApprovalStateInput } from "@/lib/first-real-avanza-fill-only-poc-approval-state-contract";
import {
  type FirstFillOnlyPocOperatorApprovalSnapshot,
  type FirstFillOnlyPocSelectorReadinessSnapshot,
  type FirstFillOnlyPocStaticDryRunPayload,
} from "@/lib/first-real-avanza-fill-only-poc-dry-run-harness";
import {
  buildFirstFillOnlyPocManualRunSetupDecision,
  firstRealAvanzaFillOnlyPocManualRunSetupCapabilityFlags,
  firstRealAvanzaFillOnlyPocManualRunSetupEvidenceRequirements,
  type FirstRealAvanzaFillOnlyPocManualRunSetupDecision,
  type FirstRealAvanzaFillOnlyPocManualRunSetupEvidencePlan,
  type FirstRealAvanzaFillOnlyPocManualRunSetupRequestedActions,
  type FirstRealAvanzaFillOnlyPocOperatorSetupEvidenceSnapshot,
} from "@/lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import {
  buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision,
  gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
  gatedRealAvanzaFillOnlyAdapterSkeletonHardForbiddenSelectors,
  type GatedRealAvanzaFillOnlyAdapterSkeletonDecision,
} from "@/lib/gated-real-avanza-fill-only-adapter-skeleton";
import {
  buildFirstRealAvanzaFillOnlyPocImplementationStubDecision,
  type FirstRealAvanzaFillOnlyPocImplementationStubDecision,
} from "@/lib/first-real-avanza-fill-only-poc-implementation-stub";
import {
  buildFirstFillOnlyPocDryRunDecision,
  type FirstFillOnlyPocDryRunDecision,
} from "@/lib/first-real-avanza-fill-only-poc-dry-run-harness";
import {
  evaluateRealAvanzaFillOnlyGuard,
  evaluateSelectorPolicyForFirstFillOnlyPoc,
  getForbiddenFinalSelectors,
  type RealAvanzaFillOnlyGuardDecision,
  type RealAvanzaFillOnlySelectorPolicy,
} from "@/lib/real-avanza-fill-only-guard";
import {
  findRealAvanzaSelectorMappingEntry,
} from "@/lib/real-avanza-selector-mapping-contract";

export type FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterSkeletonStatus =
  | "disabled"
  | "blocked"
  | "ready_for_execution_dry_run_setup"
  | "failed_safety";

export type FirstRealAvanzaFillOnlyPocExecutionDryRunCapabilityFlags = {
  can_access_avanza: false;
  can_launch_browser: false;
  can_query_dom: false;
  can_fill_fields: false;
  can_click_review: false;
  can_click_final_confirm: false;
  can_submit_order: false;
};

export type FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest = {
  execution_dry_run_adapter_enabled?: boolean | null;
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
  evidence_plan?: FirstRealAvanzaFillOnlyPocManualRunSetupEvidencePlan | null;
  requested_actions?: FirstRealAvanzaFillOnlyPocManualRunSetupRequestedActions | null;
};

export type FirstRealAvanzaFillOnlyPocExecutionDryRunStep = {
  key:
    | "verify_operator_browser_state"
    | "verify_instrument"
    | "verify_account"
    | "verify_buy_side"
    | "verify_limit_avancerad"
    | "prepare_amount_fill_instruction"
    | "prepare_price_fill_instruction"
    | "prepare_total_read_instruction"
    | "stop_before_review";
  label: string;
  selector: string | null;
  value: string | number | null;
  mode:
    | "manual_verify"
    | "future_separate_run_metadata"
    | "read_only_metadata"
    | "hard_stop";
};

export type FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterDecision = {
  status: FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterSkeletonStatus;
  execution_dry_run_adapter_enabled: boolean;
  ready_for_execution_dry_run_setup: boolean;
  blocked_reasons: readonly string[];
  blockers: readonly string[];
  capability_flags: FirstRealAvanzaFillOnlyPocExecutionDryRunCapabilityFlags;
  manual_run_setup_decision: FirstRealAvanzaFillOnlyPocManualRunSetupDecision | null;
  gated_skeleton_decision: GatedRealAvanzaFillOnlyAdapterSkeletonDecision | null;
  implementation_stub_decision:
    | FirstRealAvanzaFillOnlyPocImplementationStubDecision
    | null;
  dry_run_decision: FirstFillOnlyPocDryRunDecision | null;
  guard_decision: RealAvanzaFillOnlyGuardDecision | null;
  selector_policy: RealAvanzaFillOnlySelectorPolicy | null;
  planned_dry_run_steps: readonly FirstRealAvanzaFillOnlyPocExecutionDryRunStep[];
  hard_forbidden_selectors: readonly string[];
  blocked_review_selectors: readonly string[];
  blocked_actions: typeof gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions;
  evidence_requirements: readonly string[];
  stop_point: "before_review_button";
  safety_confirmations: {
    disabled_by_default: true;
    non_executing: true;
    no_real_avanza_access: true;
    no_browser_launch: true;
    no_dom_query: true;
    no_field_fill: true;
    no_review_click: true;
    no_final_confirm: true;
    no_order_submit: true;
    no_broker_behavior: true;
    no_database_write: true;
    no_external_invocation: true;
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

export const firstRealAvanzaFillOnlyPocExecutionDryRunCapabilityFlags = {
  ...firstRealAvanzaFillOnlyPocManualRunSetupCapabilityFlags,
} as const satisfies FirstRealAvanzaFillOnlyPocExecutionDryRunCapabilityFlags;

const safetyConfirmations = {
  disabled_by_default: true,
  non_executing: true,
  no_real_avanza_access: true,
  no_browser_launch: true,
  no_dom_query: true,
  no_field_fill: true,
  no_review_click: true,
  no_final_confirm: true,
  no_order_submit: true,
  no_broker_behavior: true,
  no_database_write: true,
  no_external_invocation: true,
} as const;

export const firstRealAvanzaFillOnlyPocExecutionDryRunPlannedSteps = [
  {
    key: "verify_operator_browser_state",
    label: "Verify operator-controlled browser state manually",
    selector: null,
    value: "operator_controlled_browser_required",
    mode: "manual_verify",
  },
  {
    key: "verify_instrument",
    label: "Verify instrument manually",
    selector: selectorForKey("instrument_market_info_panel"),
    value: null,
    mode: "manual_verify",
  },
  {
    key: "verify_account",
    label: "Verify account manually",
    selector: selectorForKey("account_selector_collapsed"),
    value: null,
    mode: "manual_verify",
  },
  {
    key: "verify_buy_side",
    label: "Verify buy side manually",
    selector: selectorForKey("side_switch_buy_state"),
    value: "buy",
    mode: "manual_verify",
  },
  {
    key: "verify_limit_avancerad",
    label: "Verify Limit/Avancerad manually",
    selector: selectorForKey("order_type_limit_checked"),
    value: "limit",
    mode: "manual_verify",
  },
  {
    key: "prepare_amount_fill_instruction",
    label: "Prepare future separate-run amount instruction",
    selector: selectorForKey("amount_input"),
    value: null,
    mode: "future_separate_run_metadata",
  },
  {
    key: "prepare_price_fill_instruction",
    label: "Prepare future separate-run price instruction",
    selector: selectorForKey("price_input"),
    value: null,
    mode: "future_separate_run_metadata",
  },
  {
    key: "prepare_total_read_instruction",
    label: "Prepare future separate-run total read instruction",
    selector: selectorForKey("total_amount"),
    value: null,
    mode: "read_only_metadata",
  },
  {
    key: "stop_before_review",
    label: "Stop before review",
    selector: selectorForKey("review_buy_button"),
    value: "before_review_button",
    mode: "hard_stop",
  },
] as const satisfies readonly FirstRealAvanzaFillOnlyPocExecutionDryRunStep[];

export const firstRealAvanzaFillOnlyPocExecutionDryRunBlockedReviewSelectors = [
  selectorForKey("review_buy_button"),
  selectorForKey("review_sell_button"),
] as const;

export const firstRealAvanzaFillOnlyPocExecutionDryRunHardForbiddenSelectors =
  uniqueStrings([
    ...getForbiddenFinalSelectors(),
    ...gatedRealAvanzaFillOnlyAdapterSkeletonHardForbiddenSelectors,
  ]);

export const firstRealAvanzaFillOnlyPocExecutionDryRunEvidenceRequirements =
  uniqueStrings([
    ...firstRealAvanzaFillOnlyPocManualRunSetupEvidenceRequirements,
    "execution_dry_run_skeleton_decision_output",
    "future_execution_dry_run_setup_notes",
    "operator_browser_state_verification_note",
  ]);

function plannedDryRunSteps(
  input: FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest,
): readonly FirstRealAvanzaFillOnlyPocExecutionDryRunStep[] {
  return firstRealAvanzaFillOnlyPocExecutionDryRunPlannedSteps.map((step) => {
    if (step.key === "prepare_amount_fill_instruction") {
      return { ...step, value: input.intended_amount_sek ?? null };
    }

    if (step.key === "prepare_price_fill_instruction") {
      return { ...step, value: input.intended_price ?? null };
    }

    return step;
  });
}

function missingSnapshotReasons(
  input: FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest,
): string[] {
  const reasons: string[] = [];

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
  input: FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest,
): string[] {
  const reasons: string[] = [];
  const payload = input.payload_snapshot;
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
    input.requested_actions?.review_click_requested === true ||
    input.selector_readiness_snapshot?.review_click_requested === true
  ) {
    reasons.push("review_click_requested");
  }

  if (input.requested_actions?.final_confirm_requested === true) {
    reasons.push("final_confirm_requested");
  }

  if (input.requested_actions?.order_submit_requested === true) {
    reasons.push("order_submit_requested");
  }

  if (input.evidence_plan?.evidence_plan_acknowledged !== true) {
    reasons.push("evidence_plan:not_acknowledged");
  }

  if (input.evidence_plan?.screenshot_redaction_acknowledged !== true) {
    reasons.push("evidence_plan:screenshot_redaction_not_acknowledged");
  }

  return reasons;
}

function disabledDecision(
  input: FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest,
): FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterDecision {
  return {
    status: "disabled",
    execution_dry_run_adapter_enabled: false,
    ready_for_execution_dry_run_setup: false,
    blocked_reasons: ["execution_dry_run_adapter_disabled"],
    blockers: ["execution_dry_run_adapter_disabled"],
    capability_flags: firstRealAvanzaFillOnlyPocExecutionDryRunCapabilityFlags,
    manual_run_setup_decision: null,
    gated_skeleton_decision: null,
    implementation_stub_decision: null,
    dry_run_decision: null,
    guard_decision: null,
    selector_policy: null,
    planned_dry_run_steps: plannedDryRunSteps(input),
    hard_forbidden_selectors:
      firstRealAvanzaFillOnlyPocExecutionDryRunHardForbiddenSelectors,
    blocked_review_selectors:
      firstRealAvanzaFillOnlyPocExecutionDryRunBlockedReviewSelectors,
    blocked_actions: gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocExecutionDryRunEvidenceRequirements,
    stop_point: "before_review_button",
    safety_confirmations: safetyConfirmations,
  };
}

function buildManualSetupDecisionFromInput(
  input: FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest,
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

export function buildFirstFillOnlyPocExecutionDryRunAdapterDecision(
  input: FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterRequest = {},
): FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterDecision {
  if (input.execution_dry_run_adapter_enabled !== true) {
    return disabledDecision(input);
  }

  const manualSetupDecision = buildManualSetupDecisionFromInput(input);
  const snapshotReasons = missingSnapshotReasons(input);
  const directReasons = directSafetyReasons(input);
  const manualSetupReasons =
    manualSetupDecision?.status === "ready_for_fill_only_manual_setup"
      ? []
      : manualSetupDecision
        ? [
            `manual_run_setup:${manualSetupDecision.status}`,
            ...manualSetupDecision.blocked_reasons.map(
              (reason) => `manual_run_setup:${reason}`,
            ),
          ]
        : ["manual_run_setup:not_built"];
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
    ...manualSetupReasons,
    ...selectorReasons,
    ...skeletonReasons,
    ...stubReasons,
    ...harnessReasons,
    ...guardReasons,
  ]);
  const safetyReasonPattern =
    /(review|final|submit|automatic|agent_submit|forbidden|generated|selector_policy:forbidden)/;
  const failedSafety =
    blockedReasons.some((reason) => safetyReasonPattern.test(reason)) ||
    manualSetupDecision?.status === "failed_safety" ||
    gatedSkeletonDecision.status === "failed_safety" ||
    implementationStubDecision?.status === "failed_safety" ||
    dryRunDecision?.status === "failed_safety";
  const status: FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterSkeletonStatus =
    blockedReasons.length === 0
      ? "ready_for_execution_dry_run_setup"
      : failedSafety
        ? "failed_safety"
        : "blocked";

  return {
    status,
    execution_dry_run_adapter_enabled: true,
    ready_for_execution_dry_run_setup:
      status === "ready_for_execution_dry_run_setup",
    blocked_reasons: blockedReasons,
    blockers: blockedReasons,
    capability_flags: firstRealAvanzaFillOnlyPocExecutionDryRunCapabilityFlags,
    manual_run_setup_decision: manualSetupDecision,
    gated_skeleton_decision: gatedSkeletonDecision,
    implementation_stub_decision: implementationStubDecision,
    dry_run_decision: dryRunDecision,
    guard_decision: guardDecision,
    selector_policy: selectorPolicy,
    planned_dry_run_steps: plannedDryRunSteps(input),
    hard_forbidden_selectors:
      firstRealAvanzaFillOnlyPocExecutionDryRunHardForbiddenSelectors,
    blocked_review_selectors:
      firstRealAvanzaFillOnlyPocExecutionDryRunBlockedReviewSelectors,
    blocked_actions: gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
    evidence_requirements: uniqueStrings([
      ...firstRealAvanzaFillOnlyPocExecutionDryRunEvidenceRequirements,
      ...(input.evidence_plan?.planned_artifacts ?? []),
    ]),
    stop_point: "before_review_button",
    safety_confirmations: safetyConfirmations,
  };
}

export const buildFirstRealAvanzaFillOnlyPocExecutionDryRunAdapterSkeletonDecision =
  buildFirstFillOnlyPocExecutionDryRunAdapterDecision;
