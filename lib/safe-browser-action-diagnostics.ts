import {
  type SafeBrowserActionKind,
  type SafeBrowserActionMode,
} from "./safe-browser-action-contract";

export type SafeBrowserActionExecutionStepStatus =
  | "validated"
  | "executed"
  | "blocked"
  | "skipped"
  | "failed";

export type SafeBrowserActionExecutionStep = {
  actionId: string;
  kind: SafeBrowserActionKind;
  targetDescription: string;
  targetTestId?: string;
  status: SafeBrowserActionExecutionStepStatus;
  validationOk: boolean;
  blocked: boolean;
  message: string;
  startedAt: string;
  completedAt: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type SafeBrowserActionExecutionMode = SafeBrowserActionMode | "mixed";

export type SafeBrowserActionExecutionDiagnostics = {
  diagnosticsId: string;
  createdAt: string;
  completedAt: string;
  mode: SafeBrowserActionExecutionMode;
  runnerName: string;
  supportsRealBrowserExecution: boolean;
  ok: boolean;
  blocked: boolean;
  finalConfirmBlocked: boolean;
  steps: SafeBrowserActionExecutionStep[];
  validatedCount: number;
  executedCount: number;
  blockedCount: number;
  skippedCount: number;
  failedCount: number;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type CreateSafeBrowserActionExecutionDiagnosticsInput = {
  diagnosticsId?: string;
  createdAt?: string;
  completedAt?: string;
  mode: SafeBrowserActionExecutionMode;
  runnerName: string;
  supportsRealBrowserExecution: boolean;
  steps: SafeBrowserActionExecutionStep[];
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, unknown>;
};

function createDiagnosticsId() {
  return `safe_browser_action_diagnostics_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function getStepMetadataBoolean(
  step: SafeBrowserActionExecutionStep,
  key: string,
) {
  return step.metadata?.[key] === true;
}

export function createSafeBrowserActionExecutionDiagnostics(
  input: CreateSafeBrowserActionExecutionDiagnosticsInput,
): SafeBrowserActionExecutionDiagnostics {
  const validatedCount = input.steps.filter(
    (step) => step.status === "validated",
  ).length;
  const executedCount = input.steps.filter(
    (step) => step.status === "executed",
  ).length;
  const blockedCount = input.steps.filter(
    (step) => step.status === "blocked",
  ).length;
  const skippedCount = input.steps.filter(
    (step) => step.status === "skipped",
  ).length;
  const failedCount = input.steps.filter(
    (step) => step.status === "failed",
  ).length;
  const errors =
    input.errors ??
    input.steps.flatMap((step) => step.errors).filter(Boolean);
  const warnings =
    input.warnings ??
    input.steps.flatMap((step) => step.warnings).filter(Boolean);
  const finalConfirmBlocked = input.steps.some((step) =>
    getStepMetadataBoolean(step, "finalConfirmBlocked"),
  );
  const blocked = blockedCount > 0;

  return {
    diagnosticsId: input.diagnosticsId ?? createDiagnosticsId(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    completedAt: input.completedAt ?? new Date().toISOString(),
    mode: input.mode,
    runnerName: input.runnerName,
    supportsRealBrowserExecution: input.supportsRealBrowserExecution,
    ok: !blocked && failedCount === 0 && errors.length === 0,
    blocked,
    finalConfirmBlocked,
    steps: input.steps,
    validatedCount,
    executedCount,
    blockedCount,
    skippedCount,
    failedCount,
    errors,
    warnings,
    metadata: input.metadata,
  };
}

export function hasFinalConfirmBlocked(
  diagnostics: Pick<SafeBrowserActionExecutionDiagnostics, "finalConfirmBlocked">,
) {
  return diagnostics.finalConfirmBlocked;
}

export function summarizeSafeBrowserActionExecutionDiagnostics(
  diagnostics: SafeBrowserActionExecutionDiagnostics,
) {
  return [
    `ok=${String(diagnostics.ok)}`,
    `runner=${diagnostics.runnerName}`,
    `mode=${diagnostics.mode}`,
    `executed=${diagnostics.executedCount}`,
    `blocked=${diagnostics.blockedCount}`,
    `failed=${diagnostics.failedCount}`,
    `finalConfirmBlocked=${String(diagnostics.finalConfirmBlocked)}`,
  ].join(" ");
}
