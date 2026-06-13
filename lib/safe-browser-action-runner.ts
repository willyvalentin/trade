import {
  type SafeBrowserAction,
  type SafeBrowserActionValidationResult,
  validateSafeBrowserAction,
} from "./safe-browser-action-contract";

export type SafeBrowserActionExecutionStatus =
  | "pending"
  | "validated"
  | "blocked"
  | "skipped"
  | "executed"
  | "failed";

export type SafeBrowserActionExecutionResult = {
  actionId: string;
  status: SafeBrowserActionExecutionStatus;
  validation: SafeBrowserActionValidationResult;
  message: string;
  startedAt: string;
  completedAt: string;
  metadata?: Record<string, unknown>;
};

export type SafeBrowserActionRunnerResult = {
  ok: boolean;
  startedAt: string;
  completedAt: string;
  results: SafeBrowserActionExecutionResult[];
  blockedCount: number;
  executedCount: number;
  failedCount: number;
  warnings: string[];
  errors: string[];
};

export type SafeBrowserActionRunnerOptions = {
  stopOnBlocked?: boolean;
  stopOnFailed?: boolean;
  metadata?: Record<string, unknown>;
};

export type SafeBrowserActionRunner = {
  runnerId: string;
  name: string;
  version: string;
  supportsRealBrowserExecution: boolean;
  runActions(
    actions: SafeBrowserAction[],
    options?: SafeBrowserActionRunnerOptions,
  ): Promise<SafeBrowserActionRunnerResult>;
};

type NoopSafeBrowserActionRunnerOptions = {
  runnerId?: string;
  name?: string;
  version?: string;
};

function createSkippedValidationResult(): SafeBrowserActionValidationResult {
  return {
    ok: true,
    blocked: false,
    errors: [],
    warnings: ["Action skipped because an earlier action stopped the runner."],
    matchedDenylistTerms: [],
    riskLevel: "low",
  };
}

function createRunnerResult(params: {
  startedAt: string;
  completedAt: string;
  results: SafeBrowserActionExecutionResult[];
  warnings: string[];
  errors: string[];
}): SafeBrowserActionRunnerResult {
  const blockedCount = params.results.filter(
    (result) => result.status === "blocked",
  ).length;
  const executedCount = params.results.filter(
    (result) => result.status === "executed",
  ).length;
  const failedCount = params.results.filter(
    (result) => result.status === "failed",
  ).length;

  return {
    ok: blockedCount === 0 && failedCount === 0 && params.errors.length === 0,
    startedAt: params.startedAt,
    completedAt: params.completedAt,
    results: params.results,
    blockedCount,
    executedCount,
    failedCount,
    warnings: params.warnings,
    errors: params.errors,
  };
}

export function createNoopSafeBrowserActionRunner(
  options?: NoopSafeBrowserActionRunnerOptions,
): SafeBrowserActionRunner {
  return {
    runnerId: options?.runnerId ?? "safe_browser_action_noop_runner",
    name: options?.name ?? "Safe Browser Action No-op Runner",
    version: options?.version ?? "safe_browser_action_noop_v1",
    supportsRealBrowserExecution: false,
    async runActions(actions, runOptions) {
      const startedAt = new Date().toISOString();
      const stopOnBlocked = runOptions?.stopOnBlocked ?? true;
      const results: SafeBrowserActionExecutionResult[] = [];
      const warnings: string[] = [];
      const errors: string[] = [];
      let shouldSkip = false;

      for (const action of actions) {
        const actionStartedAt = new Date().toISOString();

        if (shouldSkip) {
          const validation = createSkippedValidationResult();
          warnings.push(...validation.warnings);
          results.push({
            actionId: action.actionId,
            status: "skipped",
            validation,
            message:
              "Action skipped by no-op safe browser action runner after an earlier blocked action.",
            startedAt: actionStartedAt,
            completedAt: new Date().toISOString(),
            metadata: runOptions?.metadata,
          });
          continue;
        }

        const validation = validateSafeBrowserAction(action);
        warnings.push(...validation.warnings);

        if (validation.blocked) {
          errors.push(...validation.errors);
          results.push({
            actionId: action.actionId,
            status: "blocked",
            validation,
            message:
              "Action blocked by safe browser action validation. No browser action occurred.",
            startedAt: actionStartedAt,
            completedAt: new Date().toISOString(),
            metadata: runOptions?.metadata,
          });

          if (stopOnBlocked) {
            shouldSkip = true;
          }

          continue;
        }

        results.push({
          actionId: action.actionId,
          status: "validated",
          validation,
          message:
            "Action validated by no-op safe browser action runner. No browser action occurred.",
          startedAt: actionStartedAt,
          completedAt: new Date().toISOString(),
          metadata: runOptions?.metadata,
        });
      }

      return createRunnerResult({
        startedAt,
        completedAt: new Date().toISOString(),
        results,
        warnings,
        errors,
      });
    },
  };
}

export async function runSafeBrowserActions(
  actions: SafeBrowserAction[],
  runner?: SafeBrowserActionRunner | null,
  options?: SafeBrowserActionRunnerOptions,
): Promise<SafeBrowserActionRunnerResult> {
  const startedAt = new Date().toISOString();

  if (!runner) {
    return createRunnerResult({
      startedAt,
      completedAt: new Date().toISOString(),
      results: [],
      warnings: [],
      errors: ["Safe browser action runner is required."],
    });
  }

  try {
    return await runner.runActions(actions, options);
  } catch (error) {
    return createRunnerResult({
      startedAt,
      completedAt: new Date().toISOString(),
      results: [],
      warnings: [],
      errors: [
        error instanceof Error
          ? error.message
          : "Safe browser action runner failed unexpectedly.",
      ],
    });
  }
}

export function summarizeSafeBrowserActionRunnerResult(
  result: SafeBrowserActionRunnerResult,
) {
  return [
    `ok=${String(result.ok)}`,
    `validated=${
      result.results.filter((item) => item.status === "validated").length
    }`,
    `blocked=${result.blockedCount}`,
    `skipped=${
      result.results.filter((item) => item.status === "skipped").length
    }`,
    `executed=${result.executedCount}`,
    `failed=${result.failedCount}`,
  ].join(" ");
}
