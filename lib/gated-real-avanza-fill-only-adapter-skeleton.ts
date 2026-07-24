import {
  buildFirstRealAvanzaFillOnlyPocImplementationStubDecision,
  firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags,
  type FirstRealAvanzaFillOnlyPocImplementationStubDecision,
} from "@/lib/first-real-avanza-fill-only-poc-implementation-stub";
import type { FirstFillOnlyPocApprovalStateInput } from "@/lib/first-real-avanza-fill-only-poc-approval-state-contract";
import {
  firstFillOnlyPocEvidenceRequirements,
  type FirstFillOnlyPocDryRunDecisionInput,
  type FirstFillOnlyPocOperatorApprovalSnapshot,
  type FirstFillOnlyPocSelectorReadinessSnapshot,
  type FirstFillOnlyPocStaticDryRunPayload,
} from "@/lib/first-real-avanza-fill-only-poc-dry-run-harness";
import {
  evaluateSelectorPolicyForFirstFillOnlyPoc,
  getForbiddenFinalSelectors,
} from "@/lib/real-avanza-fill-only-guard";
import {
  findRealAvanzaSelectorMappingEntry,
} from "@/lib/real-avanza-selector-mapping-contract";

export type GatedRealAvanzaFillOnlyAdapterSkeletonStatus =
  | "disabled"
  | "blocked"
  | "ready_for_manual_run_setup"
  | "failed_safety";

export type GatedRealAvanzaFillOnlyAdapterSkeletonCapabilityFlags = {
  can_access_avanza: false;
  can_launch_browser: false;
  can_query_dom: false;
  can_fill_fields: false;
  can_click_review: false;
  can_click_final_confirm: false;
  can_submit_order: false;
};

export type GatedRealAvanzaFillOnlyAdapterSkeletonOperatorSetupSnapshot = {
  operator_present?: boolean | null;
  manual_login_ready?: boolean | null;
  avanza_page_opened_by_operator?: boolean | null;
  credentials_or_2fa_handled_by_operator?: boolean | null;
  kill_switch_cancel_plan_ready?: boolean | null;
};

export type GatedRealAvanzaFillOnlyAdapterSkeletonEvidencePlanSnapshot = {
  evidence_plan_acknowledged?: boolean | null;
  planned_artifacts?: readonly string[] | null;
};

export type GatedRealAvanzaFillOnlyAdapterSkeletonRequest = {
  adapter_skeleton_enabled?: boolean | null;
  approval_snapshot?: FirstFillOnlyPocApprovalStateInput | null;
  payload_snapshot?: FirstFillOnlyPocStaticDryRunPayload | null;
  selector_readiness_snapshot?: FirstFillOnlyPocSelectorReadinessSnapshot | null;
  operator_approval_snapshot?: FirstFillOnlyPocOperatorApprovalSnapshot | null;
  operator_setup_snapshot?: GatedRealAvanzaFillOnlyAdapterSkeletonOperatorSetupSnapshot | null;
  evidence_plan_snapshot?: GatedRealAvanzaFillOnlyAdapterSkeletonEvidencePlanSnapshot | null;
};

export type GatedRealAvanzaFillOnlyAdapterSkeletonSequenceStep = {
  key:
    | "verify_instrument"
    | "verify_account"
    | "verify_buy_side"
    | "verify_limit_avancerad"
    | "fill_amount"
    | "fill_price"
    | "read_total_amount"
    | "stop_before_review";
  label: string;
  selector: string | null;
  mode: "read_only" | "future_fill_metadata" | "hard_stop";
};

export type GatedRealAvanzaFillOnlyAdapterSkeletonForbiddenAction = {
  key:
    | "review_click"
    | "final_confirm"
    | "sell"
    | "stop_loss"
    | "glidande"
    | "account_change"
    | "side_switch"
    | "steppers"
    | "select_all_account";
  label: string;
  selectors: readonly string[];
  blocked: true;
};

export type GatedRealAvanzaFillOnlyAdapterSkeletonDecision = {
  status: GatedRealAvanzaFillOnlyAdapterSkeletonStatus;
  adapter_skeleton_enabled: boolean;
  ready_for_manual_run_setup: boolean;
  blocked_reasons: readonly string[];
  capability_flags: GatedRealAvanzaFillOnlyAdapterSkeletonCapabilityFlags;
  implementation_stub_decision: FirstRealAvanzaFillOnlyPocImplementationStubDecision | null;
  planned_sequence: readonly GatedRealAvanzaFillOnlyAdapterSkeletonSequenceStep[];
  planned_selectors: readonly string[];
  hard_forbidden_selectors: readonly string[];
  forbidden_actions: readonly GatedRealAvanzaFillOnlyAdapterSkeletonForbiddenAction[];
  blockers: readonly string[];
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
  };
};

function selectorForKey(key: string): string {
  const entry = findRealAvanzaSelectorMappingEntry(key);

  if (!entry) {
    throw new Error(`Missing real Avanza selector mapping entry: ${key}`);
  }

  return entry.selector;
}

export const gatedRealAvanzaFillOnlyAdapterSkeletonCapabilityFlags = {
  ...firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags,
} as const satisfies GatedRealAvanzaFillOnlyAdapterSkeletonCapabilityFlags;

export const gatedRealAvanzaFillOnlyAdapterSkeletonPlannedSequence = [
  {
    key: "verify_instrument",
    label: "Verify intended instrument",
    selector: selectorForKey("instrument_market_info_panel"),
    mode: "read_only",
  },
  {
    key: "verify_account",
    label: "Verify intended account",
    selector: selectorForKey("account_selector_collapsed"),
    mode: "read_only",
  },
  {
    key: "verify_buy_side",
    label: "Verify buy side",
    selector: selectorForKey("side_switch_buy_state"),
    mode: "read_only",
  },
  {
    key: "verify_limit_avancerad",
    label: "Verify Limit/Avancerad order type",
    selector: selectorForKey("order_type_limit_checked"),
    mode: "read_only",
  },
  {
    key: "fill_amount",
    label: "Future gated metadata for amount fill",
    selector: selectorForKey("amount_input"),
    mode: "future_fill_metadata",
  },
  {
    key: "fill_price",
    label: "Future gated metadata for price fill",
    selector: selectorForKey("price_input"),
    mode: "future_fill_metadata",
  },
  {
    key: "read_total_amount",
    label: "Read total amount for cap proof",
    selector: selectorForKey("total_amount"),
    mode: "read_only",
  },
  {
    key: "stop_before_review",
    label: "Stop before review",
    selector: selectorForKey("review_buy_button"),
    mode: "hard_stop",
  },
] as const satisfies readonly GatedRealAvanzaFillOnlyAdapterSkeletonSequenceStep[];

export const gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions = [
  {
    key: "review_click",
    label: "Review click / Granska köp",
    selectors: [
      selectorForKey("review_buy_button"),
      selectorForKey("review_sell_button"),
    ],
    blocked: true,
  },
  {
    key: "final_confirm",
    label: "Final confirm / Bekräfta köp or Bekräfta sälj",
    selectors: getForbiddenFinalSelectors(),
    blocked: true,
  },
  {
    key: "sell",
    label: "Sell side",
    selectors: [selectorForKey("side_switch_sell_state")],
    blocked: true,
  },
  {
    key: "stop_loss",
    label: "Stop Loss order type",
    selectors: [selectorForKey("order_type_stop_loss")],
    blocked: true,
  },
  {
    key: "glidande",
    label: "Glidande order type",
    selectors: [selectorForKey("order_type_glidande")],
    blocked: true,
  },
  {
    key: "account_change",
    label: "Account change",
    selectors: [
      selectorForKey("account_selector_collapsed"),
      selectorForKey("account_selected_option"),
    ],
    blocked: true,
  },
  {
    key: "side_switch",
    label: "Side switch",
    selectors: [
      selectorForKey("side_switch_buy_state"),
      selectorForKey("side_switch_sell_state"),
    ],
    blocked: true,
  },
  {
    key: "steppers",
    label: "Amount, quantity, or price steppers",
    selectors: [
      'button[aria-label*="öka"]',
      'button[aria-label*="minska"]',
      'button[data-e2e*="step"]',
    ],
    blocked: true,
  },
  {
    key: "select_all_account",
    label: "Välj alla på kontot",
    selectors: ['button:has-text("Välj alla på kontot")'],
    blocked: true,
  },
] as const satisfies readonly GatedRealAvanzaFillOnlyAdapterSkeletonForbiddenAction[];

export const gatedRealAvanzaFillOnlyAdapterSkeletonHardForbiddenSelectors = [
  ...getForbiddenFinalSelectors(),
  ...gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions.flatMap(
    (action) => action.selectors,
  ),
];

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
} as const;

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function missingSnapshotReasons(
  input: GatedRealAvanzaFillOnlyAdapterSkeletonRequest,
): string[] {
  const reasons: string[] = [];

  if (!input.approval_snapshot) {
    reasons.push("approval_snapshot_missing");
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

  if (input.operator_setup_snapshot?.operator_present !== true) {
    reasons.push("operator_setup:operator_not_present");
  }

  if (input.operator_setup_snapshot?.manual_login_ready !== true) {
    reasons.push("operator_setup:manual_login_not_ready");
  }

  if (
    input.operator_setup_snapshot?.credentials_or_2fa_handled_by_operator !==
    true
  ) {
    reasons.push("operator_setup:credentials_or_2fa_operator_control_missing");
  }

  if (input.operator_setup_snapshot?.kill_switch_cancel_plan_ready !== true) {
    reasons.push("operator_setup:kill_switch_cancel_plan_missing");
  }

  if (input.evidence_plan_snapshot?.evidence_plan_acknowledged !== true) {
    reasons.push("evidence_plan:not_acknowledged");
  }

  return reasons;
}

export function buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision(
  input: GatedRealAvanzaFillOnlyAdapterSkeletonRequest = {},
): GatedRealAvanzaFillOnlyAdapterSkeletonDecision {
  const enabled = input.adapter_skeleton_enabled === true;
  const plannedSelectors = uniqueStrings(
    gatedRealAvanzaFillOnlyAdapterSkeletonPlannedSequence
      .map((step) => step.selector)
      .filter((selector): selector is string => selector !== null),
  );
  const hardForbiddenSelectors = uniqueStrings(
    gatedRealAvanzaFillOnlyAdapterSkeletonHardForbiddenSelectors,
  );
  const evidenceRequirements = uniqueStrings([
    ...firstFillOnlyPocEvidenceRequirements,
    ...(input.evidence_plan_snapshot?.planned_artifacts ?? []),
  ]);

  if (!enabled) {
    return {
      status: "disabled",
      adapter_skeleton_enabled: false,
      ready_for_manual_run_setup: false,
      blocked_reasons: ["adapter_skeleton_disabled"],
      capability_flags: gatedRealAvanzaFillOnlyAdapterSkeletonCapabilityFlags,
      implementation_stub_decision: null,
      planned_sequence: gatedRealAvanzaFillOnlyAdapterSkeletonPlannedSequence,
      planned_selectors: plannedSelectors,
      hard_forbidden_selectors: hardForbiddenSelectors,
      forbidden_actions: gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
      blockers: ["adapter_skeleton_disabled"],
      evidence_requirements: evidenceRequirements,
      stop_point: "before_review_button",
      safety_confirmations: safetyConfirmations,
    };
  }

  const snapshotReasons = missingSnapshotReasons(input);
  const selectorPolicy = evaluateSelectorPolicyForFirstFillOnlyPoc({
    available_selector_keys:
      input.selector_readiness_snapshot?.available_selector_keys,
    requested_selectors: input.selector_readiness_snapshot?.requested_selectors,
    sizing_mode: input.selector_readiness_snapshot?.sizing_mode,
  });
  const selectorPolicyReasons =
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
  const canBuildStub = Boolean(
    input.approval_snapshot &&
      input.payload_snapshot &&
      input.selector_readiness_snapshot &&
      input.operator_approval_snapshot,
  );
  const dryRunInput: FirstFillOnlyPocDryRunDecisionInput | null = canBuildStub
    ? {
        static_payload: input.payload_snapshot as FirstFillOnlyPocStaticDryRunPayload,
        selector_readiness:
          input.selector_readiness_snapshot as FirstFillOnlyPocSelectorReadinessSnapshot,
        operator_approval:
          input.operator_approval_snapshot as FirstFillOnlyPocOperatorApprovalSnapshot,
      }
    : null;
  const implementationStubDecision = dryRunInput
    ? buildFirstRealAvanzaFillOnlyPocImplementationStubDecision({
        approval: input.approval_snapshot ?? {},
        dry_run: dryRunInput,
      })
    : null;
  const stubReasons =
    implementationStubDecision && implementationStubDecision.status !== "stub_ready"
      ? [
          `implementation_stub:${implementationStubDecision.status}`,
          ...implementationStubDecision.blocked_reasons.map(
            (reason) => `implementation_stub:${reason}`,
          ),
        ]
      : [];
  const blockedReasons = uniqueStrings([
    ...snapshotReasons,
    ...selectorPolicyReasons,
    ...stubReasons,
  ]);
  const failedSafety =
    implementationStubDecision?.status === "failed_safety" ||
    selectorPolicy.forbidden_selectors_present.length > 0 ||
    selectorPolicy.generated_selector_strategy_rejected;
  const status: GatedRealAvanzaFillOnlyAdapterSkeletonStatus =
    blockedReasons.length === 0
      ? "ready_for_manual_run_setup"
      : failedSafety
        ? "failed_safety"
        : "blocked";

  return {
    status,
    adapter_skeleton_enabled: true,
    ready_for_manual_run_setup: status === "ready_for_manual_run_setup",
    blocked_reasons: blockedReasons,
    capability_flags: gatedRealAvanzaFillOnlyAdapterSkeletonCapabilityFlags,
    implementation_stub_decision: implementationStubDecision,
    planned_sequence: gatedRealAvanzaFillOnlyAdapterSkeletonPlannedSequence,
    planned_selectors: plannedSelectors,
    hard_forbidden_selectors: hardForbiddenSelectors,
    forbidden_actions: gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
    blockers: blockedReasons,
    evidence_requirements: evidenceRequirements,
    stop_point: "before_review_button",
    safety_confirmations: safetyConfirmations,
  };
}
