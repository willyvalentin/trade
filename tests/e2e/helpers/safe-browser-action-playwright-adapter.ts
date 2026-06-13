import { expect, type Locator, type Page } from "@playwright/test";
import {
  MOCK_ORDER_PAGE_AGENT_SELECTORS,
  type MockOrderPageFieldSelector,
  type MockOrderPageSelectorKey,
} from "../../../lib/mock-order-page-agent-contract";
import {
  type MockOrderSafeActionPlan,
} from "../../../lib/mock-order-safe-action-plan";
import {
  createSafeBrowserActionExecutionDiagnostics,
  type SafeBrowserActionExecutionDiagnostics,
  type SafeBrowserActionExecutionMode,
  type SafeBrowserActionExecutionStep,
  type SafeBrowserActionExecutionStepStatus,
} from "../../../lib/safe-browser-action-diagnostics";
import {
  type SafeBrowserAction,
  type SafeBrowserActionValidationResult,
  isFinalConfirmLikeTarget,
  validateSafeBrowserAction,
} from "../../../lib/safe-browser-action-contract";

export type SafeBrowserActionPlaywrightAdapterResult = {
  ok: boolean;
  actionsExecuted: number;
  blockedActionId?: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  diagnostics: SafeBrowserActionExecutionDiagnostics;
};

export type SafeBrowserActionPlaywrightAdapterOptions = {
  stopOnBlocked?: boolean;
};

const selectorEntries = Object.entries(MOCK_ORDER_PAGE_AGENT_SELECTORS) as Array<
  [MockOrderPageSelectorKey, (typeof MOCK_ORDER_PAGE_AGENT_SELECTORS)[MockOrderPageSelectorKey]]
>;

const selectorsByTestId: Map<string, MockOrderPageFieldSelector> = new Map(
  selectorEntries.map(([, selector]) => [selector.testId, selector]),
);

const selectTestIds: Set<string> = new Set([
  MOCK_ORDER_PAGE_AGENT_SELECTORS.action.testId,
  MOCK_ORDER_PAGE_AGENT_SELECTORS.orderType.testId,
  MOCK_ORDER_PAGE_AGENT_SELECTORS.mode.testId,
  MOCK_ORDER_PAGE_AGENT_SELECTORS.orderMode.testId,
]);

function getActionTargetText(action: SafeBrowserAction) {
  return [
    action.target.label,
    action.target.text,
    action.target.description,
    action.target.testId,
  ]
    .filter((item): item is string => typeof item === "string")
    .join(" ");
}

function getActionTargetDescription(action: SafeBrowserAction) {
  return (
    action.target.description ||
    action.target.label ||
    action.target.text ||
    action.target.testId ||
    action.kind
  );
}

function deriveDiagnosticsMode(
  actions: SafeBrowserAction[],
): SafeBrowserActionExecutionMode {
  const modes = new Set(actions.map((action) => action.mode));

  if (modes.size === 1) {
    return actions[0]?.mode ?? "semi_automatic";
  }

  return "mixed";
}

function hasUnsafeExternalTargetMetadata(action: SafeBrowserAction) {
  return /\bhttps?:\/\/|\bwww\.|avanza\.(se|com)\b/i.test(
    getActionTargetText(action),
  );
}

function getMockLocator(page: Page, action: SafeBrowserAction): Locator | null {
  const testId = action.target.testId;

  if (!testId) {
    return null;
  }

  const selector = selectorsByTestId.get(testId);

  if (!selector) {
    return null;
  }

  return page.locator(
    `[data-testid="${selector.testId}"][data-agent-field="${selector.dataAgentField}"]`,
  );
}

async function readElementValue(locator: Locator) {
  const tagName = await locator.evaluate((element) =>
    element.tagName.toLowerCase(),
  );

  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return locator.inputValue();
  }

  return locator.textContent();
}

async function fillOrSelect(locator: Locator, value: string, forceSelect = false) {
  const tagName = await locator.evaluate((element) =>
    element.tagName.toLowerCase(),
  );

  if (forceSelect || tagName === "select") {
    await locator.selectOption(value);
    return;
  }

  await locator.fill(value);
}

function createExecutionStep(params: {
  action: SafeBrowserAction;
  status: SafeBrowserActionExecutionStepStatus;
  validation: SafeBrowserActionValidationResult;
  message: string;
  startedAt: string;
  completedAt?: string;
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, unknown>;
}): SafeBrowserActionExecutionStep {
  return {
    actionId: params.action.actionId,
    kind: params.action.kind,
    targetDescription: getActionTargetDescription(params.action),
    targetTestId: params.action.target.testId,
    status: params.status,
    validationOk: params.validation.ok,
    blocked: params.validation.blocked || params.status === "blocked",
    message: params.message,
    startedAt: params.startedAt,
    completedAt: params.completedAt ?? new Date().toISOString(),
    errors: params.errors ?? params.validation.errors,
    warnings: params.warnings ?? params.validation.warnings,
    metadata: params.metadata,
  };
}

function createAdapterResult(params: {
  actions: SafeBrowserAction[];
  steps: SafeBrowserActionExecutionStep[];
  actionsExecuted: number;
  errors: string[];
  warnings: string[];
  blockedActionId?: string;
  metadata?: Record<string, unknown>;
}): SafeBrowserActionPlaywrightAdapterResult {
  const completedAt = new Date().toISOString();
  const diagnostics = createSafeBrowserActionExecutionDiagnostics({
    completedAt,
    mode: deriveDiagnosticsMode(params.actions),
    runnerName: "Playwright Mock Safe Browser Action Adapter",
    supportsRealBrowserExecution: true,
    steps: params.steps,
    errors: params.errors,
    warnings: params.warnings,
    metadata: params.metadata,
  });

  return {
    ok: diagnostics.ok,
    actionsExecuted: params.actionsExecuted,
    blockedActionId: params.blockedActionId,
    errors: diagnostics.errors,
    warnings: diagnostics.warnings,
    completedAt,
    diagnostics,
  };
}

function blockResult(
  params: {
    actions: SafeBrowserAction[];
    action: SafeBrowserAction;
    validation: SafeBrowserActionValidationResult;
    errors: string[];
    warnings: string[];
    steps: SafeBrowserActionExecutionStep[];
    actionsExecuted: number;
    message: string;
    startedAt: string;
    finalConfirmBlocked?: boolean;
  },
): SafeBrowserActionPlaywrightAdapterResult {
  return createAdapterResult({
    actions: params.actions,
    actionsExecuted: params.actionsExecuted,
    blockedActionId: params.action.actionId,
    errors: params.errors,
    warnings: params.warnings,
    steps: [
      ...params.steps,
      createExecutionStep({
        action: params.action,
        status: "blocked",
        validation: params.validation,
        message: params.message,
        startedAt: params.startedAt,
        errors: params.errors,
        warnings: params.validation.warnings,
        metadata: {
          finalConfirmBlocked: params.finalConfirmBlocked === true,
        },
      }),
    ],
  });
}

async function executeReadLikeAction(page: Page, action: SafeBrowserAction) {
  if (
    action.target.label === "Open mock confirmation page" ||
    action.target.text === "Open mock confirmation page"
  ) {
    const link = page.getByRole("link", {
      name: "Open mock confirmation page",
    });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      /\/mock-broker\/confirmation/,
    );
    return;
  }

  const locator = getMockLocator(page, action);

  if (!locator) {
    throw new Error(
      `Read action ${action.actionId} does not target a known mock test id.`,
    );
  }

  await expect(locator).toBeVisible();

  if (action.target.testId === MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled.testId) {
    await expect(locator).toBeDisabled();
    return;
  }

  if (
    action.value !== undefined &&
    action.value !== null &&
    String(action.value).trim()
  ) {
    const currentValue = (await readElementValue(locator))?.trim() ?? "";
    expect(currentValue).toContain(String(action.value));
  }
}

export async function executeSafeBrowserActionsOnMockPage(
  page: Page,
  actions: SafeBrowserAction[],
  options?: SafeBrowserActionPlaywrightAdapterOptions,
): Promise<SafeBrowserActionPlaywrightAdapterResult> {
  const stopOnBlocked = options?.stopOnBlocked ?? true;
  const warnings: string[] = [];
  const errors: string[] = [];
  const steps: SafeBrowserActionExecutionStep[] = [];
  let actionsExecuted = 0;

  for (const action of actions) {
    const actionStartedAt = new Date().toISOString();
    const validation = validateSafeBrowserAction(action);
    warnings.push(...validation.warnings);

    if (validation.blocked) {
      errors.push(...validation.errors);
      return blockResult({
        actions,
        action,
        validation,
        errors,
        warnings,
        steps,
        actionsExecuted,
        message:
          "Action blocked by safe browser action validation before Playwright execution.",
        startedAt: actionStartedAt,
        finalConfirmBlocked: validation.matchedDenylistTerms.length > 0,
      });
    }

    if (hasUnsafeExternalTargetMetadata(action)) {
      const blockErrors = [
        "Safe browser action targets must not include external or Avanza URL metadata.",
      ];
      errors.push(...blockErrors);
      return blockResult({
        actions,
        action,
        validation,
        errors,
        warnings,
        actionsExecuted,
        steps,
        message:
          "Action blocked because mock adapter targets must stay local to the mock page.",
        startedAt: actionStartedAt,
      });
    }

    if (
      isFinalConfirmLikeTarget(action.target) &&
      action.kind !== "read" &&
      action.kind !== "wait_for" &&
      action.kind !== "stop"
    ) {
      const blockErrors = [
        "Final-confirm-like targets are read-only in the mock Playwright adapter.",
      ];
      errors.push(...blockErrors);
      return blockResult({
        actions,
        action,
        validation,
        errors,
        warnings,
        actionsExecuted,
        steps,
        message:
          "Action blocked because final-confirm-like targets cannot be executed.",
        startedAt: actionStartedAt,
        finalConfirmBlocked: true,
      });
    }

    if (
      action.target.testId === MOCK_ORDER_PAGE_AGENT_SELECTORS.submitDisabled.testId &&
      action.kind !== "read" &&
      action.kind !== "wait_for" &&
      action.kind !== "stop"
    ) {
      const blockErrors = [
        "The disabled mock submit target must never be clicked or modified.",
      ];
      errors.push(...blockErrors);
      return blockResult({
        actions,
        action,
        validation,
        errors,
        warnings,
        actionsExecuted,
        steps,
        message:
          "Action blocked because the disabled mock submit target is read-only.",
        startedAt: actionStartedAt,
      });
    }

    try {
      if (action.kind === "stop") {
        steps.push(
          createExecutionStep({
            action,
            status: "executed",
            validation,
            message:
              "Stop action reached by mock Playwright adapter. No unsafe action occurred.",
            startedAt: actionStartedAt,
          }),
        );
        actionsExecuted += 1;
        break;
      }

      if (action.kind === "read" || action.kind === "wait_for") {
        await executeReadLikeAction(page, action);
        actionsExecuted += 1;
        steps.push(
          createExecutionStep({
            action,
            status: "executed",
            validation,
            message: "Read-like action verified on the mock page.",
            startedAt: actionStartedAt,
          }),
        );
        continue;
      }

      const locator = getMockLocator(page, action);

      if (!locator) {
        const blockErrors = [
          `Action ${action.actionId} does not target a known mock test id.`,
        ];
        errors.push(...blockErrors);
        return blockResult({
          actions,
          action,
          validation,
          errors,
          warnings,
          actionsExecuted,
          steps,
          message:
            "Action blocked because the target is not in the mock selector contract.",
          startedAt: actionStartedAt,
        });
      }

      if (action.kind === "fill") {
        await fillOrSelect(locator, String(action.value ?? ""));
        actionsExecuted += 1;
        steps.push(
          createExecutionStep({
            action,
            status: "executed",
            validation,
            message: "Fill action executed on a known mock field.",
            startedAt: actionStartedAt,
          }),
        );
        continue;
      }

      if (action.kind === "select") {
        await fillOrSelect(
          locator,
          String(action.value ?? ""),
          selectTestIds.has(action.target.testId ?? ""),
        );
        actionsExecuted += 1;
        steps.push(
          createExecutionStep({
            action,
            status: "executed",
            validation,
            message: "Select action executed on a known mock field.",
            startedAt: actionStartedAt,
          }),
        );
        continue;
      }

      if (action.kind === "click") {
        if (action.target.testId !== MOCK_ORDER_PAGE_AGENT_SELECTORS.reviewButton.testId) {
          const blockErrors = [
            "Only the local mock review button may be clicked by this adapter.",
          ];
          errors.push(...blockErrors);
          return blockResult({
            actions,
            action,
            validation,
            errors,
            warnings,
            actionsExecuted,
            steps,
            message:
              "Action blocked because only the mock review button is clickable.",
            startedAt: actionStartedAt,
          });
        }

        await locator.click();
        actionsExecuted += 1;
        steps.push(
          createExecutionStep({
            action,
            status: "executed",
            validation,
            message: "Mock review button clicked.",
            startedAt: actionStartedAt,
          }),
        );
        continue;
      }

      const blockErrors = [`Unsupported safe browser action kind: ${action.kind}.`];
      errors.push(...blockErrors);
      return blockResult({
        actions,
        action,
        validation,
        errors,
        warnings,
        actionsExecuted,
        steps,
        message: "Action blocked because the adapter does not support this kind.",
        startedAt: actionStartedAt,
      });
    } catch (error) {
      const failureErrors = [
        error instanceof Error
          ? error.message
          : "Safe browser action Playwright adapter failed.",
      ];
      errors.push(...failureErrors);
      steps.push(
        createExecutionStep({
          action,
          status: "failed",
          validation,
          message: "Playwright mock adapter failed while executing the action.",
          startedAt: actionStartedAt,
          errors: failureErrors,
        }),
      );

      if (stopOnBlocked) {
        return createAdapterResult({
          actions,
          steps,
          actionsExecuted,
          errors,
          warnings,
          blockedActionId: action.actionId,
        });
      }
    }
  }

  return createAdapterResult({
    actions,
    actionsExecuted,
    steps,
    errors,
    warnings,
  });
}

export async function executeMockOrderSafeActionPlan(
  page: Page,
  plan: MockOrderSafeActionPlan,
  options?: SafeBrowserActionPlaywrightAdapterOptions,
) {
  if (!plan.validation.ok) {
    const completedAt = new Date().toISOString();
    const diagnostics = createSafeBrowserActionExecutionDiagnostics({
      completedAt,
      mode: plan.mode,
      runnerName: "Playwright Mock Safe Browser Action Adapter",
      supportsRealBrowserExecution: true,
      steps: [],
      errors: plan.validation.errors,
      warnings: plan.validation.warnings,
    });

    return {
      ok: false,
      actionsExecuted: 0,
      errors: plan.validation.errors,
      warnings: plan.validation.warnings,
      completedAt,
      diagnostics,
    } satisfies SafeBrowserActionPlaywrightAdapterResult;
  }

  return executeSafeBrowserActionsOnMockPage(page, plan.actions, options);
}
