const SELF_CHECK_VERSION = "avanza_dry_run_runner_self_check_v1";
const CAPABILITY_GATE_VERSION = "browser_runner_capability_gate_v1";
const CONTRACT_VERSION = "avanza_localhost_bridge_v1";

function now() {
  return new Date().toISOString();
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function numberFromInput(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function getAvanzaDryRunRunnerSkeletonCapability(
  checkedAt = now(),
) {
  return {
    runnerId: "avanza_dry_run_runner_skeleton",
    runnerName: "Avanza Dry-Run Runner Skeleton",
    targetEnvironment: "avanza_broker",
    supportsBrowserExecution: true,
    supportsBrokerSubmission: false,
    supportsFinalConfirmClick: false,
    mockOnly: false,
    devOnly: true,
    automaticModeCapable: false,
    createdAt: checkedAt,
    metadata: {
      capabilityGateVersion: CAPABILITY_GATE_VERSION,
      targetEnvironment: "avanza_broker",
      dryRunOnly: true,
      skeletonOnly: true,
      noBrowserControl: true,
      noBrowserActionsExecuted: true,
      noAvanzaAutomation: true,
      noAvanzaSelectors: true,
      noAvanzaUrls: true,
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
      source: "avanza_dry_run_runner_skeleton",
    },
  };
}

export function getAvanzaDryRunRunnerSkeletonSelfCheck(
  checkedAt = now(),
) {
  const capability = getAvanzaDryRunRunnerSkeletonCapability(checkedAt);

  return {
    ok: true,
    status: "available_dry_run_only",
    checkedAt,
    runnerId: capability.runnerId,
    runnerName: capability.runnerName,
    version: SELF_CHECK_VERSION,
    capabilityValidation: {
      ok: true,
      blocked: false,
      errors: [],
      warnings: [
        "Avanza dry-run runner skeleton only. No browser control is implemented.",
        "Avanza dry-run capability is dry-run only: no broker submission, no final confirmation, and no broker result.",
      ],
      safetyLevel: "dry_run_only",
      canRunMockBrowserActions: false,
      canRunAvanzaDryRun: true,
      canSubmitBrokerOrder: false,
    },
    readinessLabels: [
      "Avanza dry-run capable",
      "Skeleton only",
      "No browser control",
      "No broker submission",
      "Final confirm disabled",
      "Semi-auto only",
    ],
    blockers: [],
    warnings: [
      "Avanza dry-run runner skeleton is installed for contract testing only.",
      "No browser control is implemented.",
      "No browser actions will be executed.",
      "No broker submission is possible.",
    ],
    errors: [],
    metadata: {
      selfCheckVersion: SELF_CHECK_VERSION,
      skeletonOnly: true,
      dryRunOnly: true,
      noBrowserControl: true,
      noBrowserActionsExecuted: true,
      noAvanzaAutomation: true,
      noAvanzaSelectors: true,
      noAvanzaUrls: true,
      supportsBrokerSubmission: false,
      supportsFinalConfirmClick: false,
      automaticModeCapable: false,
    },
  };
}

function validateDryRunOrderInput(input) {
  const errors = [];
  const warnings = [];

  if (!isObject(input)) {
    return {
      ok: false,
      errors: ["Avanza dry-run request must be an object."],
      warnings,
    };
  }

  const instrument = isObject(input.instrument) ? input.instrument : null;
  const ticker = stringValue(instrument?.ticker);
  const quantity = numberFromInput(input.quantity);
  const price = numberFromInput(input.price);
  const orderMode = stringValue(input.orderMode) ?? "advanced";
  const stopPolicy = stringValue(input.stopPolicy) ?? "stop_at_confirmation_modal";

  if (input.action !== "buy" && input.action !== "sell") {
    errors.push("Avanza dry-run action must be buy or sell.");
  }

  if (!ticker) {
    errors.push("Instrument ticker is required.");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.push("Avanza dry-run quantity must be a positive integer.");
  }

  if (price === null || price <= 0) {
    errors.push("Avanza dry-run price must be a positive finite number.");
  }

  if (orderMode !== "advanced") {
    errors.push("Avanza dry-run order mode must be advanced.");
  }

  if (
    stopPolicy !== "stop_at_confirmation_modal" &&
    stopPolicy !== "stop_before_review"
  ) {
    errors.push(
      "Avanza dry-run stop policy must stop before review or at confirmation modal.",
    );
  }

  if (isObject(input.metadata)) {
    if (input.metadata.allowFinalSubmit === true) {
      errors.push("Avanza dry-run request metadata must not allow final submit.");
    }

    if (input.metadata.supportsBrokerSubmission === true) {
      errors.push(
        "Avanza dry-run request metadata must not support broker submission.",
      );
    }

    if (input.metadata.supportsFinalConfirmClick === true) {
      errors.push(
        "Avanza dry-run request metadata must not support final-confirm clicks.",
      );
    }

    if (input.metadata.automaticModeCapable === true) {
      errors.push(
        "Avanza dry-run request metadata must not enable automatic mode.",
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export function runAvanzaDryRunRunnerSkeleton(request) {
  const receivedAt = now();
  const requestId =
    stringValue(request?.requestId) ?? "avanza_dry_run_skeleton_request";
  const dryRunRequestValidation = validateDryRunOrderInput(
    request?.dryRunOrderInput,
  );
  const selfCheck = getAvanzaDryRunRunnerSkeletonSelfCheck(receivedAt);

  if (!dryRunRequestValidation.ok) {
    return {
      statusCode: 400,
      body: {
        version: CONTRACT_VERSION,
        ok: false,
        status: "blocked",
        bridgeVersion: CONTRACT_VERSION,
        requestId,
        receivedAt,
        completedAt: now(),
        dryRunRequestValidation,
        capabilityValidation: selfCheck.capabilityValidation,
        selfCheck,
        diagnostics: null,
        message:
          "Avanza dry-run runner skeleton blocked the request before any browser action.",
        errors: dryRunRequestValidation.errors,
        warnings: [
          ...dryRunRequestValidation.warnings,
          "Avanza dry-run runner skeleton only.",
          "No browser actions were executed.",
          "No broker submission was performed.",
        ],
        metadata: {
          skeletonOnly: true,
          dryRunOnly: true,
          no_browser_actions_executed: true,
          no_browser_control: true,
          no_avanza_session: true,
          no_broker_submission: true,
          no_broker_result_created: true,
        },
      },
    };
  }

  return {
    statusCode: 200,
    body: {
      version: CONTRACT_VERSION,
      ok: true,
      status: "accepted_stub",
      bridgeVersion: CONTRACT_VERSION,
      requestId,
      receivedAt,
      completedAt: now(),
      dryRunRequestValidation,
      capabilityValidation: selfCheck.capabilityValidation,
      selfCheck,
      diagnostics: null,
      message:
        "Avanza dry-run runner skeleton accepted the request as a non-executing stub. No browser action occurred.",
      errors: [],
      warnings: [
        "Avanza dry-run runner skeleton only.",
        "No browser actions were executed.",
        "No browser control is implemented.",
        "No broker submission was performed.",
      ],
      metadata: {
        skeletonOnly: true,
        dryRunOnly: true,
        no_browser_actions_executed: true,
        no_browser_control: true,
        no_avanza_session: true,
        no_broker_submission: true,
        no_broker_result_created: true,
      },
    },
  };
}
