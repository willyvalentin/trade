import {
  MOCK_ORDER_PAGE_AGENT_SELECTORS,
  type MockOrderPageFieldKey,
  type MockOrderPageFieldSelector,
  type MockOrderPageFillPlan,
  validateMockOrderPageFillPlan,
} from "./mock-order-page-agent-contract";
import {
  createSafeBrowserAction,
  type SafeBrowserAction,
  type SafeBrowserActionMode,
  type SafeBrowserActionValidationResult,
  validateSafeBrowserAction,
} from "./safe-browser-action-contract";

export type MockOrderSafeActionPlanValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  actionResults: Array<{
    actionId: string;
    validation: SafeBrowserActionValidationResult;
  }>;
};

export type MockOrderSafeActionPlan = {
  planId: string;
  createdAt: string;
  mode: SafeBrowserActionMode;
  fillPlan: MockOrderPageFillPlan;
  actions: SafeBrowserAction[];
  validation: MockOrderSafeActionPlanValidationResult;
  errors: string[];
  warnings: string[];
};

export type MockOrderSafeActionPlanBuildOptions = {
  includeReviewClick?: boolean;
  includeConfirmationRead?: boolean;
  mode?: SafeBrowserActionMode;
  metadata?: Record<string, unknown>;
};

const SELECT_FIELD_KEYS = new Set<MockOrderPageFieldKey>([
  "action",
  "orderType",
  "mode",
  "orderMode",
]);

const READ_ONLY_FIELD_KEYS = new Set<MockOrderPageFieldKey>([
  "requireManualFinalConfirmation",
  "allowAutomaticFinalSubmit",
]);

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function readPlanValue(plan: MockOrderPageFillPlan, fieldKey: MockOrderPageFieldKey) {
  return (
    plan.values.find((item) => item.fieldKey === fieldKey)?.value.trim() ?? ""
  );
}

function getPlanId(fillPlan: MockOrderPageFillPlan) {
  return safeId(
    [
      "mock_order_safe_action_plan",
      fillPlan.requestId || "request_missing",
      fillPlan.intentId || "intent_missing",
    ].join("_"),
  );
}

function getTargetFromSelector(
  selector: MockOrderPageFieldSelector,
  options?: {
    description?: string;
    riskLevel?: "low" | "medium" | "high" | "critical";
    role?: string;
    label?: string;
    text?: string;
  },
) {
  return {
    label: options?.label,
    role: options?.role,
    testId: selector.testId,
    text: options?.text,
    description:
      options?.description ||
      `${selector.description ?? selector.fieldKey} data-agent-field=${selector.dataAgentField}`,
    riskLevel: options?.riskLevel,
  };
}

function createPlanAction(input: {
  planId: string;
  index: number;
  kind: SafeBrowserAction["kind"];
  mode: SafeBrowserActionMode;
  target: SafeBrowserAction["target"];
  value?: SafeBrowserAction["value"];
  reason: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}) {
  return createSafeBrowserAction({
    actionId: `${input.planId}_action_${String(input.index).padStart(2, "0")}_${input.kind}`,
    kind: input.kind,
    mode: input.mode,
    target: input.target,
    value: input.value,
    reason: input.reason,
    createdAt: input.createdAt,
    metadata: input.metadata,
  });
}

function createFieldAction(input: {
  planId: string;
  index: number;
  mode: SafeBrowserActionMode;
  fieldKey: MockOrderPageFieldKey;
  selector: MockOrderPageFieldSelector;
  value: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}) {
  const isReadOnly = READ_ONLY_FIELD_KEYS.has(input.fieldKey);
  const kind = isReadOnly
    ? "read"
    : SELECT_FIELD_KEYS.has(input.fieldKey)
      ? "select"
      : "fill";

  return createPlanAction({
    planId: input.planId,
    index: input.index,
    kind,
    mode: input.mode,
    target: getTargetFromSelector(input.selector, {
      label: `Mock order ${input.fieldKey}`,
      role: isReadOnly ? "status" : kind === "select" ? "combobox" : "textbox",
      riskLevel: isReadOnly ? "high" : "medium",
      description: `${isReadOnly ? "Read/verify" : "Apply"} mock order field ${input.fieldKey} via ${input.selector.testId}.`,
    }),
    value: input.value,
    reason: isReadOnly
      ? `Read mock order ${input.fieldKey}; do not click final confirmation.`
      : `Apply mock order ${input.fieldKey} from MockOrderPageFillPlan.`,
    createdAt: input.createdAt,
    metadata: input.metadata,
  });
}

export function validateMockOrderSafeActionPlan(
  plan: Pick<MockOrderSafeActionPlan, "fillPlan" | "actions">,
): MockOrderSafeActionPlanValidationResult {
  const fillPlanValidation = validateMockOrderPageFillPlan(plan.fillPlan);
  const actionResults = plan.actions.map((action) => ({
    actionId: action.actionId,
    validation: validateSafeBrowserAction(action),
  }));
  const errors = [
    ...fillPlanValidation.errors,
    ...actionResults.flatMap((result) =>
      result.validation.blocked
        ? result.validation.errors.map(
            (error) => `${result.actionId}: ${error}`,
          )
        : [],
    ),
  ];
  const warnings = [
    ...fillPlanValidation.warnings,
    ...actionResults.flatMap((result) => result.validation.warnings),
  ];

  return {
    ok:
      fillPlanValidation.ok &&
      actionResults.every((result) => result.validation.ok),
    errors,
    warnings,
    actionResults,
  };
}

export function buildMockOrderSafeActionPlan(
  fillPlan: MockOrderPageFillPlan,
  options?: MockOrderSafeActionPlanBuildOptions,
): MockOrderSafeActionPlan {
  const createdAt = new Date().toISOString();
  const planId = getPlanId(fillPlan);
  const mode = options?.mode ?? "semi_automatic";
  const includeReviewClick = options?.includeReviewClick ?? true;
  const includeConfirmationRead = options?.includeConfirmationRead ?? true;
  const metadata = {
    source: "mock_order_safe_action_plan",
    targetPath: fillPlan.targetPath,
    requestId: fillPlan.requestId,
    intentId: fillPlan.intentId,
    ...(options?.metadata ?? {}),
  };
  const actions: SafeBrowserAction[] = [];
  let index = 1;

  actions.push(
    createPlanAction({
      planId,
      index: index++,
      kind: "read",
      mode,
      target: getTargetFromSelector(MOCK_ORDER_PAGE_AGENT_SELECTORS.ticker, {
        role: "document",
        riskLevel: "low",
        description:
          "Read mock order page ready state before applying the safe action plan.",
      }),
      reason: "Verify local mock order page target is ready.",
      createdAt,
      metadata,
    }),
  );

  actions.push(
    createPlanAction({
      planId,
      index: index++,
      kind: "read",
      mode,
      target: getTargetFromSelector(MOCK_ORDER_PAGE_AGENT_SELECTORS.orderMode, {
        role: "status",
        riskLevel: "low",
        description: "Read/verify mock order mode is Advanced only.",
      }),
      value: readPlanValue(fillPlan, "orderMode"),
      reason: "Verify mock order mode is Advanced before fill/review.",
      createdAt,
      metadata,
    }),
  );

  for (const value of fillPlan.values) {
    const trimmedValue = value.value.trim();

    if (!trimmedValue) {
      continue;
    }

    actions.push(
      createFieldAction({
        planId,
        index: index++,
        mode,
        fieldKey: value.fieldKey,
        selector: value.selector,
        value: trimmedValue,
        createdAt,
        metadata,
      }),
    );
  }

  if (includeReviewClick) {
    const reviewLabel =
      readPlanValue(fillPlan, "reviewButtonLabel") || "Review mock order";
    actions.push(
      createPlanAction({
        planId,
        index: index++,
        kind: "click",
        mode,
        target: getTargetFromSelector(MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButton, {
          label: reviewLabel,
          role: "button",
          riskLevel: "medium",
          description:
            "Click local Review mock order button only. This does not submit an order.",
        }),
        value: reviewLabel,
        reason: "Click local mock review button after validated mock fill actions.",
        createdAt,
        metadata,
      }),
    );
  }

  if (includeConfirmationRead) {
    actions.push(
      createPlanAction({
        planId,
        index: index++,
        kind: "read",
        mode,
        target: {
          label: "Open mock confirmation page",
          role: "link",
          text: "Open mock confirmation page",
          description:
            "Read local mock confirmation link/review panel availability. Do not open automatically.",
          riskLevel: "low",
        },
        value: "mock_confirmation_link_available",
        reason:
          "Verify local mock confirmation link is available after review without opening it.",
        createdAt,
        metadata,
      }),
    );
  }

  actions.push(
    createPlanAction({
      planId,
      index: index++,
      kind: "read",
      mode,
      target: getTargetFromSelector(MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled, {
        role: "button",
        riskLevel: "critical",
        description:
          "Read disabled final submit placeholder. This must remain disabled and must not be clicked.",
      }),
      value: "disabled",
      reason: "Verify local mock final submit remains disabled/read-only.",
      createdAt,
      metadata,
    }),
  );

  const validation = validateMockOrderSafeActionPlan({
    fillPlan,
    actions,
  });

  return {
    planId,
    createdAt,
    mode,
    fillPlan,
    actions,
    validation,
    errors: validation.errors,
    warnings: validation.warnings,
  };
}

export function summarizeMockOrderSafeActionPlan(
  plan: Pick<MockOrderSafeActionPlan, "planId" | "actions" | "validation">,
) {
  return [
    `planId=${plan.planId}`,
    `actions=${plan.actions.length}`,
    `ok=${String(plan.validation.ok)}`,
    `errors=${plan.validation.errors.length}`,
    `warnings=${plan.validation.warnings.length}`,
  ].join(" ");
}
