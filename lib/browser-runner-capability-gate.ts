import type { SafeBrowserActionExecutionDiagnostics } from "@/lib/safe-browser-action-diagnostics";

export const BROWSER_RUNNER_CAPABILITY_GATE_VERSION =
  "browser_runner_capability_gate_v1" as const;

export type BrowserRunnerTargetEnvironment =
  | "mock_order_page"
  | "avanza_broker"
  | "unknown";

export type BrowserRunnerCapabilitySafetyLevel =
  | "safe_mock_only"
  | "dry_run_only"
  | "real_broker_blocked"
  | "unknown_blocked";

export type BrowserRunnerExecutionCapability = {
  runnerId: string;
  runnerName: string;
  targetEnvironment: BrowserRunnerTargetEnvironment;
  supportsBrowserExecution: boolean;
  supportsBrokerSubmission: boolean;
  supportsFinalConfirmClick: boolean;
  mockOnly: boolean;
  devOnly: boolean;
  automaticModeCapable: boolean;
  createdAt?: string;
  metadata?: Record<string, unknown>;
};

export type BrowserRunnerCapabilityValidationOptions = {
  allowMockBrowserExecution?: boolean;
  allowAvanzaDryRun?: boolean;
  allowBrokerSubmission?: boolean;
  allowAutomaticMode?: boolean;
};

export type BrowserRunnerCapabilityValidationResult = {
  ok: boolean;
  blocked: boolean;
  errors: string[];
  warnings: string[];
  safetyLevel: BrowserRunnerCapabilitySafetyLevel;
  canRunMockBrowserActions: boolean;
  canRunAvanzaDryRun: boolean;
  canSubmitBrokerOrder: boolean;
};

type MockOnlyBrowserRunnerCapabilityInput = Partial<
  Pick<
    BrowserRunnerExecutionCapability,
    "runnerId" | "runnerName" | "createdAt" | "metadata"
  >
>;

type AvanzaDryRunBrowserRunnerCapabilityInput = Partial<
  Pick<
    BrowserRunnerExecutionCapability,
    "runnerId" | "runnerName" | "createdAt" | "metadata"
  >
>;

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isBrowserRunnerTargetEnvironment(
  value: unknown,
): value is BrowserRunnerTargetEnvironment {
  return (
    value === "mock_order_page" ||
    value === "avanza_broker" ||
    value === "unknown"
  );
}

function booleanFromMetadata(
  metadata: Record<string, unknown> | undefined,
  key: string,
) {
  return metadata?.[key] === true;
}

export function createMockOnlyBrowserRunnerCapability(
  input: MockOnlyBrowserRunnerCapabilityInput = {},
): BrowserRunnerExecutionCapability {
  return {
    runnerId: input.runnerId ?? "mock_order_page_browser_runner",
    runnerName: input.runnerName ?? "Mock Order Page Browser Runner",
    targetEnvironment: "mock_order_page",
    supportsBrowserExecution: true,
    supportsBrokerSubmission: false,
    supportsFinalConfirmClick: false,
    mockOnly: true,
    devOnly: true,
    automaticModeCapable: false,
    createdAt: input.createdAt,
    metadata: {
      ...(input.metadata ?? {}),
      capabilityGateVersion: BROWSER_RUNNER_CAPABILITY_GATE_VERSION,
      mockOnly: true,
      targetEnvironment: "mock_order_page",
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
    },
  };
}

export function createAvanzaDryRunBrowserRunnerCapability(
  input: AvanzaDryRunBrowserRunnerCapabilityInput = {},
): BrowserRunnerExecutionCapability {
  return {
    runnerId: input.runnerId ?? "avanza_dry_run_browser_runner",
    runnerName: input.runnerName ?? "Avanza Dry-Run Browser Runner",
    targetEnvironment: "avanza_broker",
    supportsBrowserExecution: true,
    supportsBrokerSubmission: false,
    supportsFinalConfirmClick: false,
    mockOnly: false,
    devOnly: true,
    automaticModeCapable: false,
    createdAt: input.createdAt,
    metadata: {
      ...(input.metadata ?? {}),
      capabilityGateVersion: BROWSER_RUNNER_CAPABILITY_GATE_VERSION,
      dryRunOnly: true,
      mockOnly: false,
      devOnly: true,
      targetEnvironment: "avanza_broker",
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
    },
  };
}

export function validateBrowserRunnerCapability(
  capability: BrowserRunnerExecutionCapability,
  options: BrowserRunnerCapabilityValidationOptions = {},
): BrowserRunnerCapabilityValidationResult {
  const allowMockBrowserExecution = options.allowMockBrowserExecution ?? true;
  const allowAvanzaDryRun = options.allowAvanzaDryRun ?? false;
  const allowBrokerSubmission = options.allowBrokerSubmission ?? false;
  const allowAutomaticMode = options.allowAutomaticMode ?? false;
  const errors: string[] = [];
  const warnings: string[] = [];
  let safetyLevel: BrowserRunnerCapabilitySafetyLevel = "unknown_blocked";

  if (capability.targetEnvironment === "mock_order_page") {
    safetyLevel = "safe_mock_only";

    if (!allowMockBrowserExecution) {
      errors.push("Mock browser execution is not allowed by this gate.");
    }

    if (!capability.mockOnly) {
      errors.push("Mock order page runner capability must be marked mockOnly.");
    }

    if (!capability.devOnly) {
      errors.push("Mock order page runner capability must be marked devOnly.");
    }
  } else if (capability.targetEnvironment === "avanza_broker") {
    safetyLevel = allowAvanzaDryRun ? "dry_run_only" : "real_broker_blocked";

    if (!allowAvanzaDryRun) {
      errors.push("Avanza broker browser capability is blocked by default.");
    } else {
      warnings.push(
        "Avanza dry-run capability is dry-run only: no broker submission, no final confirmation, and no broker result.",
      );

      if (!capability.supportsBrowserExecution) {
        errors.push(
          "Avanza dry-run capability must support browser execution to be classified as dry-run.",
        );
      }

      if (capability.mockOnly) {
        errors.push("Avanza dry-run capability must not be marked mockOnly.");
      }
    }
  } else {
    safetyLevel = "unknown_blocked";
    errors.push("Unknown browser runner target environment is blocked.");
  }

  if (capability.supportsBrokerSubmission && !allowBrokerSubmission) {
    safetyLevel = "real_broker_blocked";
    errors.push("Broker submission capability is blocked by default.");
  }

  if (
    capability.targetEnvironment === "avanza_broker" &&
    capability.supportsBrokerSubmission
  ) {
    safetyLevel = "real_broker_blocked";
    errors.push("Avanza dry-run capability must not support broker submission.");
  }

  if (capability.supportsFinalConfirmClick) {
    if (!allowBrokerSubmission || !allowAutomaticMode) {
      safetyLevel = "real_broker_blocked";
      errors.push(
        "Final-confirm click capability is blocked unless future broker submission and automatic-mode gates explicitly allow it.",
      );
    }
  }

  if (
    capability.targetEnvironment === "avanza_broker" &&
    capability.supportsFinalConfirmClick
  ) {
    safetyLevel = "real_broker_blocked";
    errors.push(
      "Avanza dry-run capability must not support final-confirm clicks.",
    );
  }

  if (capability.automaticModeCapable && !allowAutomaticMode) {
    if (capability.targetEnvironment === "avanza_broker") {
      safetyLevel = "real_broker_blocked";
    }
    errors.push("Automatic-mode browser capability is blocked by default.");
  } else if (capability.automaticModeCapable && allowAutomaticMode) {
    warnings.push(
      "Automatic-mode browser capability was explicitly allowed, but it is outside the first Avanza dry-run scope.",
    );
  }

  if (
    capability.targetEnvironment === "mock_order_page" &&
    capability.supportsBrokerSubmission
  ) {
    errors.push("Mock order page runner must not support broker submission.");
  }

  if (
    capability.targetEnvironment === "mock_order_page" &&
    capability.supportsFinalConfirmClick
  ) {
    errors.push("Mock order page runner must not support final confirm clicks.");
  }

  const blocked = errors.length > 0;

  return {
    ok: !blocked,
    blocked,
    errors,
    warnings,
    safetyLevel,
    canRunMockBrowserActions:
      !blocked &&
      allowMockBrowserExecution &&
      capability.targetEnvironment === "mock_order_page" &&
      capability.mockOnly &&
      !capability.supportsBrokerSubmission &&
      !capability.supportsFinalConfirmClick,
    canRunAvanzaDryRun:
      !blocked &&
      allowAvanzaDryRun &&
      capability.targetEnvironment === "avanza_broker" &&
      capability.supportsBrowserExecution &&
      !capability.mockOnly &&
      !capability.supportsBrokerSubmission &&
      !capability.supportsFinalConfirmClick &&
      !capability.automaticModeCapable,
    canSubmitBrokerOrder:
      !blocked &&
      allowBrokerSubmission &&
      capability.supportsBrokerSubmission &&
      capability.supportsFinalConfirmClick &&
      allowAutomaticMode,
  };
}

export function summarizeBrowserRunnerCapabilityValidation(
  result: BrowserRunnerCapabilityValidationResult,
) {
  return [
    result.safetyLevel,
    result.ok ? "allowed" : "blocked",
    result.canRunMockBrowserActions ? "mock-browser-actions" : null,
    result.canRunAvanzaDryRun ? "avanza-dry-run" : null,
    result.canSubmitBrokerOrder ? "broker-submit" : "no-broker-submit",
  ]
    .filter((item): item is string => Boolean(item))
    .join(" / ");
}

export function classifyDiagnosticsCapability(
  diagnostics: SafeBrowserActionExecutionDiagnostics,
): BrowserRunnerExecutionCapability {
  const metadata = diagnostics.metadata;
  const metadataTargetEnvironment = optionalString(
    metadata?.targetEnvironment,
  );
  const targetEnvironment = isBrowserRunnerTargetEnvironment(
    metadataTargetEnvironment,
  )
    ? metadataTargetEnvironment
    : metadata?.mockOnly === true
      ? "mock_order_page"
      : "unknown";
  const mockOnly =
    metadata?.mockOnly === true || targetEnvironment === "mock_order_page";
  const dryRunOnly =
    metadata?.dryRunOnly === true && targetEnvironment === "avanza_broker";

  return {
    runnerId: optionalString(metadata?.runnerId) ?? diagnostics.diagnosticsId,
    runnerName: diagnostics.runnerName,
    targetEnvironment,
    supportsBrowserExecution: diagnostics.supportsRealBrowserExecution,
    supportsBrokerSubmission: booleanFromMetadata(
      metadata,
      "supportsBrokerSubmission",
    ),
    supportsFinalConfirmClick: booleanFromMetadata(
      metadata,
      "supportsFinalConfirmClick",
    ),
    mockOnly,
    devOnly: metadata?.devOnly === true || mockOnly || dryRunOnly,
    automaticModeCapable:
      diagnostics.mode === "automatic" ||
      booleanFromMetadata(metadata, "automaticModeCapable"),
    createdAt: diagnostics.createdAt,
    metadata: {
      ...(metadata ?? {}),
      capabilityGateVersion:
        optionalString(metadata?.capabilityGateVersion) ??
        BROWSER_RUNNER_CAPABILITY_GATE_VERSION,
    },
  };
}
