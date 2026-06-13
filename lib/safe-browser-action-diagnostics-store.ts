import type {
  SafeBrowserActionExecutionDiagnostics,
  SafeBrowserActionExecutionMode,
  SafeBrowserActionExecutionStep,
  SafeBrowserActionExecutionStepStatus,
} from "@/lib/safe-browser-action-diagnostics";

export const SAFE_BROWSER_ACTION_DIAGNOSTICS_STORAGE_KEY =
  "ture_safe_browser_action_diagnostics_v1";
export const MAX_STORED_SAFE_BROWSER_ACTION_DIAGNOSTICS = 500;

export type StoredSafeBrowserActionExecutionDiagnostics =
  SafeBrowserActionExecutionDiagnostics;

export type SafeBrowserActionDiagnosticsStoreReadResult = {
  diagnostics: StoredSafeBrowserActionExecutionDiagnostics[];
  discardedCount: number;
  storageAvailable: boolean;
  error: string | null;
};

const actionKinds = ["click", "fill", "read", "wait_for", "select", "stop"];
const modes: SafeBrowserActionExecutionMode[] = [
  "semi_automatic",
  "automatic",
  "mixed",
];
const stepStatuses: SafeBrowserActionExecutionStepStatus[] = [
  "validated",
  "executed",
  "blocked",
  "skipped",
  "failed",
];

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function validTimestamp(value: unknown): string | null {
  const timestamp = optionalString(value);

  return timestamp && Number.isFinite(Date.parse(timestamp)) ? timestamp : null;
}

function finiteNonNegativeNumber(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    Number.isInteger(value)
    ? value
    : null;
}

function optionalRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : undefined;
}

function normalizeStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeSafeBrowserActionExecutionStep(
  value: unknown,
): SafeBrowserActionExecutionStep | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Partial<SafeBrowserActionExecutionStep>;
  const actionId = optionalString(candidate.actionId);
  const targetDescription = optionalString(candidate.targetDescription);
  const startedAt = validTimestamp(candidate.startedAt);
  const completedAt = validTimestamp(candidate.completedAt);
  const errors = normalizeStringArray(candidate.errors);
  const warnings = normalizeStringArray(candidate.warnings);
  const kind = actionKinds.includes(candidate.kind as string)
    ? candidate.kind
    : null;
  const status = stepStatuses.includes(
    candidate.status as SafeBrowserActionExecutionStepStatus,
  )
    ? candidate.status
    : null;

  if (
    !actionId ||
    !kind ||
    !targetDescription ||
    !status ||
    typeof candidate.validationOk !== "boolean" ||
    typeof candidate.blocked !== "boolean" ||
    typeof candidate.message !== "string" ||
    !startedAt ||
    !completedAt ||
    !errors ||
    !warnings
  ) {
    return null;
  }

  return {
    actionId,
    kind,
    targetDescription,
    targetTestId: optionalString(candidate.targetTestId) ?? undefined,
    status,
    validationOk: candidate.validationOk,
    blocked: candidate.blocked,
    message: candidate.message,
    startedAt,
    completedAt,
    errors,
    warnings,
    metadata: optionalRecord(candidate.metadata),
  };
}

function normalizeSafeBrowserActionExecutionDiagnostics(
  value: unknown,
): StoredSafeBrowserActionExecutionDiagnostics | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Partial<SafeBrowserActionExecutionDiagnostics>;
  const diagnosticsId = optionalString(candidate.diagnosticsId);
  const createdAt = validTimestamp(candidate.createdAt);
  const completedAt = validTimestamp(candidate.completedAt);
  const mode = modes.includes(candidate.mode as SafeBrowserActionExecutionMode)
    ? candidate.mode
    : null;
  const runnerName = optionalString(candidate.runnerName);
  const validatedCount = finiteNonNegativeNumber(candidate.validatedCount);
  const executedCount = finiteNonNegativeNumber(candidate.executedCount);
  const blockedCount = finiteNonNegativeNumber(candidate.blockedCount);
  const skippedCount = finiteNonNegativeNumber(candidate.skippedCount);
  const failedCount = finiteNonNegativeNumber(candidate.failedCount);
  const steps = Array.isArray(candidate.steps)
    ? candidate.steps
        .map(normalizeSafeBrowserActionExecutionStep)
        .filter((step): step is SafeBrowserActionExecutionStep => Boolean(step))
    : null;
  const errors = normalizeStringArray(candidate.errors);
  const warnings = normalizeStringArray(candidate.warnings);

  if (
    !diagnosticsId ||
    !createdAt ||
    !completedAt ||
    !mode ||
    !runnerName ||
    typeof candidate.supportsRealBrowserExecution !== "boolean" ||
    typeof candidate.ok !== "boolean" ||
    typeof candidate.blocked !== "boolean" ||
    typeof candidate.finalConfirmBlocked !== "boolean" ||
    !steps ||
    validatedCount === null ||
    executedCount === null ||
    blockedCount === null ||
    skippedCount === null ||
    failedCount === null ||
    !errors ||
    !warnings
  ) {
    return null;
  }

  return {
    diagnosticsId,
    createdAt,
    completedAt,
    mode,
    runnerName,
    supportsRealBrowserExecution: candidate.supportsRealBrowserExecution,
    ok: candidate.ok,
    blocked: candidate.blocked,
    finalConfirmBlocked: candidate.finalConfirmBlocked,
    steps,
    validatedCount,
    executedCount,
    blockedCount,
    skippedCount,
    failedCount,
    errors,
    warnings,
    metadata: optionalRecord(candidate.metadata),
  };
}

function readSafeBrowserActionDiagnosticsStore(): SafeBrowserActionDiagnosticsStoreReadResult {
  const storage = getStorage();

  if (!storage) {
    return {
      diagnostics: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    };
  }

  try {
    const parsed = JSON.parse(
      storage.getItem(SAFE_BROWSER_ACTION_DIAGNOSTICS_STORAGE_KEY) ?? "[]",
    );
    const rawDiagnostics = Array.isArray(parsed) ? parsed : [];
    const diagnostics = rawDiagnostics
      .map(normalizeSafeBrowserActionExecutionDiagnostics)
      .filter(
        (
          item,
        ): item is StoredSafeBrowserActionExecutionDiagnostics =>
          Boolean(item),
      );

    return {
      diagnostics,
      discardedCount: rawDiagnostics.length - diagnostics.length,
      storageAvailable: true,
      error: null,
    };
  } catch (error) {
    return {
      diagnostics: [],
      discardedCount: 0,
      storageAvailable: true,
      error:
        error instanceof Error
          ? error.message
          : "Malformed safe browser action diagnostics store.",
    };
  }
}

function writeSafeBrowserActionDiagnostics(
  diagnostics: readonly StoredSafeBrowserActionExecutionDiagnostics[],
): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      SAFE_BROWSER_ACTION_DIAGNOSTICS_STORAGE_KEY,
      JSON.stringify(
        diagnostics.slice(-MAX_STORED_SAFE_BROWSER_ACTION_DIAGNOSTICS),
      ),
    );
    return true;
  } catch {
    return false;
  }
}

export function readSafeBrowserActionDiagnostics(): StoredSafeBrowserActionExecutionDiagnostics[] {
  return readSafeBrowserActionDiagnosticsStore().diagnostics;
}

export function readSafeBrowserActionDiagnosticsStoreResult(): SafeBrowserActionDiagnosticsStoreReadResult {
  return readSafeBrowserActionDiagnosticsStore();
}

export function appendSafeBrowserActionDiagnostics(
  diagnostics: StoredSafeBrowserActionExecutionDiagnostics,
): boolean {
  return appendSafeBrowserActionDiagnosticsBatch([diagnostics]);
}

export function appendSafeBrowserActionDiagnosticsBatch(
  diagnostics: readonly StoredSafeBrowserActionExecutionDiagnostics[],
): boolean {
  const currentDiagnostics = readSafeBrowserActionDiagnostics();
  const validDiagnostics = diagnostics
    .map(normalizeSafeBrowserActionExecutionDiagnostics)
    .filter(
      (
        item,
      ): item is StoredSafeBrowserActionExecutionDiagnostics =>
        Boolean(item),
    );

  if (validDiagnostics.length === 0) {
    return false;
  }

  return writeSafeBrowserActionDiagnostics([
    ...currentDiagnostics,
    ...validDiagnostics,
  ]);
}

export function clearSafeBrowserActionDiagnostics(): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(SAFE_BROWSER_ACTION_DIAGNOSTICS_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getSafeBrowserActionDiagnosticsById(diagnosticsId: string) {
  const normalizedId = optionalString(diagnosticsId);

  if (!normalizedId) {
    return null;
  }

  return (
    readSafeBrowserActionDiagnostics().find(
      (diagnostics) => diagnostics.diagnosticsId === normalizedId,
    ) ?? null
  );
}

export function getSafeBrowserActionDiagnosticsByMode(
  mode: SafeBrowserActionExecutionMode,
) {
  return readSafeBrowserActionDiagnostics().filter(
    (diagnostics) => diagnostics.mode === mode,
  );
}

export function getSafeBrowserActionDiagnosticsWithFinalConfirmBlocked() {
  return readSafeBrowserActionDiagnostics().filter(
    (diagnostics) => diagnostics.finalConfirmBlocked,
  );
}
