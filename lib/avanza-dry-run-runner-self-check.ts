import {
  type BrowserRunnerCapabilityValidationOptions,
  type BrowserRunnerCapabilityValidationResult,
  type BrowserRunnerExecutionCapability,
  validateBrowserRunnerCapability,
} from "@/lib/browser-runner-capability-gate";

export const AVANZA_DRY_RUN_RUNNER_SELF_CHECK_VERSION =
  "avanza_dry_run_runner_self_check_v1" as const;

export type AvanzaDryRunRunnerSelfCheckStatus =
  | "unavailable"
  | "available_mock_only"
  | "available_dry_run_only"
  | "blocked"
  | "failed";

export type AvanzaDryRunRunnerSelfCheckInput = {
  runnerId: string;
  runnerName: string;
  version: string;
  capability?: BrowserRunnerExecutionCapability;
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

export type AvanzaDryRunRunnerSelfCheckOptions = Pick<
  BrowserRunnerCapabilityValidationOptions,
  | "allowAvanzaDryRun"
  | "allowMockBrowserExecution"
  | "allowBrokerSubmission"
  | "allowAutomaticMode"
>;

export type AvanzaDryRunRunnerSelfCheckResult = {
  ok: boolean;
  status: AvanzaDryRunRunnerSelfCheckStatus;
  checkedAt: string;
  runnerId: string;
  runnerName: string;
  version: string;
  capabilityValidation: BrowserRunnerCapabilityValidationResult;
  readinessLabels: string[];
  blockers: string[];
  warnings: string[];
  errors: string[];
  metadata?: Record<string, unknown>;
};

function createBlockedCapabilityValidation(
  errors: string[],
  warnings: string[] = [],
): BrowserRunnerCapabilityValidationResult {
  return {
    ok: false,
    blocked: true,
    errors,
    warnings,
    safetyLevel: "unknown_blocked",
    canRunMockBrowserActions: false,
    canRunAvanzaDryRun: false,
    canSubmitBrokerOrder: false,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function cleanString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function createUnavailableAvanzaDryRunRunnerSelfCheck(
  input: Partial<AvanzaDryRunRunnerSelfCheckInput> = {},
): AvanzaDryRunRunnerSelfCheckResult {
  const checkedAt = input.checkedAt ?? nowIso();
  const blocker = "No Avanza dry-run runner is installed/available.";
  const capabilityValidation = createBlockedCapabilityValidation([blocker]);

  return {
    ok: false,
    status: "unavailable",
    checkedAt,
    runnerId: cleanString(input.runnerId, "avanza_dry_run_runner_unavailable"),
    runnerName: cleanString(input.runnerName, "Avanza Dry-Run Runner"),
    version: cleanString(input.version, AVANZA_DRY_RUN_RUNNER_SELF_CHECK_VERSION),
    capabilityValidation,
    readinessLabels: [
      "Runner unavailable",
      "No Avanza automation",
      "No broker submission",
      "Final confirm disabled",
    ],
    blockers: [blocker],
    warnings: [],
    errors: [blocker],
    metadata: {
      ...(input.metadata ?? {}),
      selfCheckVersion: AVANZA_DRY_RUN_RUNNER_SELF_CHECK_VERSION,
      runnerImplemented: false,
      noBrowserControl: true,
    },
  };
}

export function evaluateAvanzaDryRunRunnerSelfCheck(
  input: AvanzaDryRunRunnerSelfCheckInput,
  options: AvanzaDryRunRunnerSelfCheckOptions = {},
): AvanzaDryRunRunnerSelfCheckResult {
  const checkedAt = input.checkedAt ?? nowIso();

  if (!input.capability) {
    return createUnavailableAvanzaDryRunRunnerSelfCheck({
      ...input,
      checkedAt,
    });
  }

  try {
    const capabilityValidation = validateBrowserRunnerCapability(
      input.capability,
      {
        allowAvanzaDryRun: options.allowAvanzaDryRun ?? false,
        allowMockBrowserExecution: options.allowMockBrowserExecution ?? true,
        allowBrokerSubmission: options.allowBrokerSubmission ?? false,
        allowAutomaticMode: options.allowAutomaticMode ?? false,
      },
    );
    const readinessLabels: string[] = [];
    const blockers = [...capabilityValidation.errors];
    const warnings = [...capabilityValidation.warnings];
    const errors = [...capabilityValidation.errors];
    let status: AvanzaDryRunRunnerSelfCheckStatus = "blocked";
    let ok = false;

    if (
      capabilityValidation.ok &&
      capabilityValidation.safetyLevel === "safe_mock_only"
    ) {
      status = "available_mock_only";
      ok = true;
      readinessLabels.push(
        "Mock-only browser diagnostics",
        "Cannot run Avanza dry-run",
        "No broker submission",
        "Final confirm disabled",
      );
      warnings.push(
        "Mock-only runner is available for mock diagnostics but cannot run Avanza dry-run.",
      );
    } else if (
      capabilityValidation.ok &&
      capabilityValidation.safetyLevel === "dry_run_only" &&
      capabilityValidation.canRunAvanzaDryRun
    ) {
      status = "available_dry_run_only";
      ok = true;
      readinessLabels.push(
        "Avanza dry-run capable",
        "No broker submission",
        "Final confirm disabled",
        "Semi-auto only",
      );
    } else if (capabilityValidation.blocked) {
      status = "blocked";
      readinessLabels.push(
        "Runner blocked",
        "No broker submission",
        "Final confirm disabled",
      );
    } else {
      status = "failed";
      const failure =
        "Runner self-check could not classify this capability safely.";
      blockers.push(failure);
      errors.push(failure);
      readinessLabels.push("Runner self-check failed");
    }

    return {
      ok,
      status,
      checkedAt,
      runnerId: input.runnerId,
      runnerName: input.runnerName,
      version: input.version,
      capabilityValidation,
      readinessLabels,
      blockers,
      warnings,
      errors,
      metadata: {
        ...(input.metadata ?? {}),
        selfCheckVersion: AVANZA_DRY_RUN_RUNNER_SELF_CHECK_VERSION,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Runner self-check failed unexpectedly.";
    const capabilityValidation = createBlockedCapabilityValidation([message]);

    return {
      ok: false,
      status: "failed",
      checkedAt,
      runnerId: input.runnerId,
      runnerName: input.runnerName,
      version: input.version,
      capabilityValidation,
      readinessLabels: ["Runner self-check failed"],
      blockers: [message],
      warnings: [],
      errors: [message],
      metadata: {
        ...(input.metadata ?? {}),
        selfCheckVersion: AVANZA_DRY_RUN_RUNNER_SELF_CHECK_VERSION,
      },
    };
  }
}

export function summarizeAvanzaDryRunRunnerSelfCheck(
  result: AvanzaDryRunRunnerSelfCheckResult,
) {
  return [
    result.status,
    result.ok ? "ready" : "not-ready",
    result.capabilityValidation.safetyLevel,
    result.capabilityValidation.canRunAvanzaDryRun
      ? "avanza-dry-run"
      : "no-avanza-dry-run",
    result.capabilityValidation.canSubmitBrokerOrder
      ? "broker-submit"
      : "no-broker-submit",
  ].join(" / ");
}

export function getAvanzaDryRunRunnerSelfCheckLabels(
  result: AvanzaDryRunRunnerSelfCheckResult,
) {
  return [...result.readinessLabels];
}
