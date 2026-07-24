import {
  buildFirstRealAvanzaFillOnlyPocImplementationStubDecision,
  firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags,
  type FirstRealAvanzaFillOnlyPocImplementationStubDecision,
} from "@/lib/first-real-avanza-fill-only-poc-implementation-stub";
import {
  evaluateFirstFillOnlyPocApprovalState,
  type FirstFillOnlyPocApprovalState,
  type FirstFillOnlyPocApprovalStateInput,
} from "@/lib/first-real-avanza-fill-only-poc-approval-state-contract";
import {
  buildFirstFillOnlyPocDryRunDecision,
  firstFillOnlyPocEvidenceRequirements,
  type FirstFillOnlyPocDryRunDecision,
  type FirstFillOnlyPocOperatorApprovalSnapshot,
  type FirstFillOnlyPocSelectorReadinessSnapshot,
  type FirstFillOnlyPocStaticDryRunPayload,
} from "@/lib/first-real-avanza-fill-only-poc-dry-run-harness";
import {
  buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision,
  gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
  gatedRealAvanzaFillOnlyAdapterSkeletonPlannedSequence,
  type GatedRealAvanzaFillOnlyAdapterSkeletonDecision,
  type GatedRealAvanzaFillOnlyAdapterSkeletonEvidencePlanSnapshot,
  type GatedRealAvanzaFillOnlyAdapterSkeletonOperatorSetupSnapshot,
} from "@/lib/gated-real-avanza-fill-only-adapter-skeleton";
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

export type FirstRealAvanzaFillOnlyPocManualRunSetupAdapterStatus =
  | "disabled"
  | "blocked"
  | "ready_for_fill_only_manual_setup"
  | "failed_safety";

export type FirstRealAvanzaFillOnlyPocManualRunSetupCapabilityFlags = {
  can_access_avanza: false;
  can_launch_browser: false;
  can_query_dom: false;
  can_fill_fields: false;
  can_click_review: false;
  can_click_final_confirm: false;
  can_submit_order: false;
};

export type FirstRealAvanzaFillOnlyPocOperatorSetupEvidenceSnapshot =
  GatedRealAvanzaFillOnlyAdapterSkeletonOperatorSetupSnapshot & {
    setup_decision?: "operator_setup_ready_for_manual_run_setup" | string | null;
    account_verified?: boolean | null;
    instrument_verified?: boolean | null;
  };

export type FirstRealAvanzaFillOnlyPocManualRunSetupEvidencePlan =
  GatedRealAvanzaFillOnlyAdapterSkeletonEvidencePlanSnapshot & {
    screenshot_redaction_acknowledged?: boolean | null;
  };

export type FirstRealAvanzaFillOnlyPocManualRunSetupRequestedActions = {
  review_click_requested?: boolean | null;
  final_confirm_requested?: boolean | null;
  order_submit_requested?: boolean | null;
};

export type FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest = {
  manual_run_setup_adapter_enabled?: boolean | null;
  approval_snapshot?: FirstFillOnlyPocApprovalStateInput | null;
  operator_setup_evidence_snapshot?:
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

export type FirstRealAvanzaFillOnlyPocManualRunSetupInstruction = {
  key:
    | "verify_instrument"
    | "verify_account"
    | "verify_buy_side"
    | "verify_limit_avancerad"
    | "planned_fill_amount"
    | "planned_fill_price"
    | "read_total_amount"
    | "stop_before_review";
  label: string;
  value: string | number | null;
  selector: string | null;
  mode: "manual_verify" | "future_separate_run_metadata" | "hard_stop";
};

export type FirstRealAvanzaFillOnlyPocManualRunSetupDecision = {
  status: FirstRealAvanzaFillOnlyPocManualRunSetupAdapterStatus;
  manual_run_setup_adapter_enabled: boolean;
  ready_for_fill_only_manual_setup: boolean;
  blocked_reasons: readonly string[];
  blockers: readonly string[];
  capability_flags: FirstRealAvanzaFillOnlyPocManualRunSetupCapabilityFlags;
  approval_state: FirstFillOnlyPocApprovalState | null;
  skeleton_decision: GatedRealAvanzaFillOnlyAdapterSkeletonDecision | null;
  implementation_stub_decision:
    | FirstRealAvanzaFillOnlyPocImplementationStubDecision
    | null;
  dry_run_decision: FirstFillOnlyPocDryRunDecision | null;
  guard_decision: RealAvanzaFillOnlyGuardDecision | null;
  selector_policy: RealAvanzaFillOnlySelectorPolicy | null;
  planned_instructions: readonly FirstRealAvanzaFillOnlyPocManualRunSetupInstruction[];
  forbidden_selectors: readonly string[];
  forbidden_actions: typeof gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions;
  evidence_requirements: readonly string[];
  redaction_warning: string;
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

export const firstRealAvanzaFillOnlyPocManualRunSetupCapabilityFlags = {
  ...firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags,
} as const satisfies FirstRealAvanzaFillOnlyPocManualRunSetupCapabilityFlags;

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

export const firstRealAvanzaFillOnlyPocManualRunSetupBaseInstructions = [
  {
    key: "verify_instrument",
    label: "Verify instrument manually",
    value: null,
    selector: selectorForKey("instrument_market_info_panel"),
    mode: "manual_verify",
  },
  {
    key: "verify_account",
    label: "Verify account manually",
    value: null,
    selector: selectorForKey("account_selector_collapsed"),
    mode: "manual_verify",
  },
  {
    key: "verify_buy_side",
    label: "Verify buy side manually",
    value: "buy",
    selector: selectorForKey("side_switch_buy_state"),
    mode: "manual_verify",
  },
  {
    key: "verify_limit_avancerad",
    label: "Verify Limit/Avancerad manually",
    value: "limit",
    selector: selectorForKey("order_type_limit_checked"),
    mode: "manual_verify",
  },
  {
    key: "planned_fill_amount",
    label: "Future separate-run amount value",
    value: null,
    selector: selectorForKey("amount_input"),
    mode: "future_separate_run_metadata",
  },
  {
    key: "planned_fill_price",
    label: "Future separate-run price value",
    value: null,
    selector: selectorForKey("price_input"),
    mode: "future_separate_run_metadata",
  },
  {
    key: "read_total_amount",
    label: "Read total amount manually",
    value: null,
    selector: selectorForKey("total_amount"),
    mode: "manual_verify",
  },
  {
    key: "stop_before_review",
    label: "Stop before review",
    value: "before_review_button",
    selector: selectorForKey("review_buy_button"),
    mode: "hard_stop",
  },
] as const satisfies readonly FirstRealAvanzaFillOnlyPocManualRunSetupInstruction[];

export const firstRealAvanzaFillOnlyPocManualRunSetupEvidenceRequirements =
  uniqueStrings([
    ...firstFillOnlyPocEvidenceRequirements,
    "operator_setup_screenshot",
    "account_verification_note",
    "instrument_verification_note",
    "manual_run_setup_decision_output",
    "screenshot_redaction_statement",
  ]);

export const firstRealAvanzaFillOnlyPocManualRunSetupRedactionWarning =
  "Screenshots may contain business, account, position, balance, or order-form details and must be redacted before sharing outside the local evidence trail.";

function plannedInstructions(
  input: FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest,
): readonly FirstRealAvanzaFillOnlyPocManualRunSetupInstruction[] {
  return firstRealAvanzaFillOnlyPocManualRunSetupBaseInstructions.map((step) => {
    if (step.key === "planned_fill_amount") {
      return { ...step, value: input.intended_amount_sek ?? null };
    }

    if (step.key === "planned_fill_price") {
      return { ...step, value: input.intended_price ?? null };
    }

    return step;
  });
}

function missingSnapshotReasons(
  input: FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest,
): string[] {
  const reasons: string[] = [];

  if (!input.approval_snapshot) {
    reasons.push("approval_snapshot_missing");
  }

  if (!input.operator_setup_evidence_snapshot) {
    reasons.push("operator_setup_evidence_missing");
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

function operatorSetupReasons(
  snapshot:
    | FirstRealAvanzaFillOnlyPocOperatorSetupEvidenceSnapshot
    | null
    | undefined,
): string[] {
  const reasons: string[] = [];

  if (!snapshot) {
    return ["operator_setup_evidence_missing"];
  }

  if (snapshot.setup_decision !== "operator_setup_ready_for_manual_run_setup") {
    reasons.push("operator_setup:not_ready_for_manual_run_setup");
  }

  if (snapshot.operator_present !== true) {
    reasons.push("operator_setup:operator_not_present");
  }

  if (snapshot.manual_login_ready !== true) {
    reasons.push("operator_setup:manual_login_not_ready");
  }

  if (snapshot.avanza_page_opened_by_operator !== true) {
    reasons.push("operator_setup:manual_page_not_opened");
  }

  if (snapshot.credentials_or_2fa_handled_by_operator !== true) {
    reasons.push("operator_setup:credentials_or_2fa_operator_control_missing");
  }

  if (snapshot.kill_switch_cancel_plan_ready !== true) {
    reasons.push("operator_setup:kill_switch_cancel_plan_missing");
  }

  if (snapshot.account_verified !== true) {
    reasons.push("operator_setup:account_not_verified");
  }

  if (snapshot.instrument_verified !== true) {
    reasons.push("operator_setup:instrument_not_verified");
  }

  return reasons;
}

function directSafetyReasons(
  input: FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest,
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

  if (input.evidence_plan?.evidence_plan_acknowledged !== true) {
    reasons.push("evidence_plan:not_acknowledged");
  }

  if (input.evidence_plan?.screenshot_redaction_acknowledged !== true) {
    reasons.push("evidence_plan:screenshot_redaction_not_acknowledged");
  }

  return reasons;
}

function disabledDecision(
  input: FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest,
): FirstRealAvanzaFillOnlyPocManualRunSetupDecision {
  return {
    status: "disabled",
    manual_run_setup_adapter_enabled: false,
    ready_for_fill_only_manual_setup: false,
    blocked_reasons: ["manual_run_setup_adapter_disabled"],
    blockers: ["manual_run_setup_adapter_disabled"],
    capability_flags: firstRealAvanzaFillOnlyPocManualRunSetupCapabilityFlags,
    approval_state: null,
    skeleton_decision: null,
    implementation_stub_decision: null,
    dry_run_decision: null,
    guard_decision: null,
    selector_policy: null,
    planned_instructions: plannedInstructions(input),
    forbidden_selectors: getForbiddenFinalSelectors(),
    forbidden_actions: gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
    evidence_requirements:
      firstRealAvanzaFillOnlyPocManualRunSetupEvidenceRequirements,
    redaction_warning: firstRealAvanzaFillOnlyPocManualRunSetupRedactionWarning,
    stop_point: "before_review_button",
    safety_confirmations: safetyConfirmations,
  };
}

export function buildFirstFillOnlyPocManualRunSetupDecision(
  input: FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest = {},
): FirstRealAvanzaFillOnlyPocManualRunSetupDecision {
  const enabled = input.manual_run_setup_adapter_enabled === true;

  if (!enabled) {
    return disabledDecision(input);
  }

  const approvalState = evaluateFirstFillOnlyPocApprovalState(
    input.approval_snapshot ?? {},
  );
  const snapshotReasons = missingSnapshotReasons(input);
  const operatorReasons = operatorSetupReasons(
    input.operator_setup_evidence_snapshot,
  );
  const directReasons = directSafetyReasons(input);
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
  const skeletonDecision = buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision({
    adapter_skeleton_enabled: true,
    approval_snapshot: input.approval_snapshot ?? null,
    payload_snapshot: input.payload_snapshot ?? null,
    selector_readiness_snapshot: input.selector_readiness_snapshot ?? null,
    operator_approval_snapshot: input.operator_approval_snapshot ?? null,
    operator_setup_snapshot: input.operator_setup_evidence_snapshot ?? null,
    evidence_plan_snapshot: input.evidence_plan ?? null,
  });
  const approvalReasons =
    approvalState.real_dry_run_approved === true
      ? []
      : [
          `approval:${approvalState.status}`,
          ...approvalState.blocking_reasons.map(
            (reason) => `approval:${reason}`,
          ),
        ];
  const skeletonReasons =
    skeletonDecision.status === "ready_for_manual_run_setup"
      ? []
      : [
          `skeleton:${skeletonDecision.status}`,
          ...skeletonDecision.blocked_reasons.map(
            (reason) => `skeleton:${reason}`,
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
    ...operatorReasons,
    ...directReasons,
    ...selectorReasons,
    ...approvalReasons,
    ...skeletonReasons,
    ...stubReasons,
    ...harnessReasons,
    ...guardReasons,
  ]);
  const safetyReasonPattern =
    /(review|final|submit|automatic|agent_submit|forbidden|generated|selector_policy:forbidden)/;
  const failedSafety =
    blockedReasons.some((reason) => safetyReasonPattern.test(reason)) ||
    skeletonDecision.status === "failed_safety" ||
    implementationStubDecision?.status === "failed_safety" ||
    dryRunDecision?.status === "failed_safety";
  const status: FirstRealAvanzaFillOnlyPocManualRunSetupAdapterStatus =
    blockedReasons.length === 0
      ? "ready_for_fill_only_manual_setup"
      : failedSafety
        ? "failed_safety"
        : "blocked";
  const forbiddenSelectors = uniqueStrings([
    ...getForbiddenFinalSelectors(),
    ...skeletonDecision.hard_forbidden_selectors,
    ...selectorPolicy.blocked_first_poc_selectors,
  ]);

  return {
    status,
    manual_run_setup_adapter_enabled: true,
    ready_for_fill_only_manual_setup:
      status === "ready_for_fill_only_manual_setup",
    blocked_reasons: blockedReasons,
    blockers: blockedReasons,
    capability_flags: firstRealAvanzaFillOnlyPocManualRunSetupCapabilityFlags,
    approval_state: approvalState,
    skeleton_decision: skeletonDecision,
    implementation_stub_decision: implementationStubDecision,
    dry_run_decision: dryRunDecision,
    guard_decision: guardDecision,
    selector_policy: selectorPolicy,
    planned_instructions: plannedInstructions(input),
    forbidden_selectors: forbiddenSelectors,
    forbidden_actions: gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
    evidence_requirements: uniqueStrings([
      ...firstRealAvanzaFillOnlyPocManualRunSetupEvidenceRequirements,
      ...(input.evidence_plan?.planned_artifacts ?? []),
    ]),
    redaction_warning: firstRealAvanzaFillOnlyPocManualRunSetupRedactionWarning,
    stop_point: "before_review_button",
    safety_confirmations: safetyConfirmations,
  };
}

export const buildFirstFillOnlyPocManualRunSetupAdapterDecision =
  buildFirstFillOnlyPocManualRunSetupDecision;

export const firstRealAvanzaFillOnlyPocManualRunSetupPlannedSequence =
  gatedRealAvanzaFillOnlyAdapterSkeletonPlannedSequence;
