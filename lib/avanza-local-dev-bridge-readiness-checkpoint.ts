import type {
  AvanzaDisabledLocalDevBridgeRunnerReport,
} from "./avanza-disabled-local-dev-bridge-runner";
import type {
  AvanzaHeadlessExecutionArchitectureCheckpoint,
} from "./avanza-headless-execution-architecture-checkpoint";
import type {
  AvanzaLocalDevBridgeActivationChecklist,
} from "./avanza-local-dev-bridge-activation-checklist";
import type {
  AvanzaLocalDevBridgeContract,
} from "./avanza-local-dev-bridge-contract";
import type {
  AvanzaModelOnlyLocalDevBridgeDryRunReport,
} from "./avanza-model-only-local-dev-bridge-dry-runner";

export type AvanzaLocalDevBridgeReadinessCheckpointStatus =
  | "ready_for_review"
  | "ready_for_disabled_runner_design"
  | "ready_for_model_only_boundary_review"
  | "blocked_at_invocation_boundary"
  | "blocked_for_runtime_invocation"
  | "blocked_for_real_execution"
  | "blocked_for_production"
  | "unknown";

export type AvanzaLocalDevBridgeReadinessLayer =
  | "bridge_contract"
  | "activation_checklist"
  | "disabled_runner_skeleton"
  | "model_only_dry_runner"
  | "invocation_boundary"
  | "smoke_runner_layer"
  | "terminal_script_layer"
  | "browser_automation_layer"
  | "credential_access_layer"
  | "trade_ui_layer"
  | "api_route_layer"
  | "settlement_layer"
  | "production_layer"
  | "unknown";

export type AvanzaLocalDevBridgeInvocationBoundaryStatus =
  | "reached_model_only"
  | "hard_stop"
  | "locked"
  | "forbidden"
  | "unknown";

export type AvanzaLocalDevBridgeReadinessLayerState =
  | "ready"
  | "modeled"
  | "dry_run_only"
  | "disabled_only"
  | "locked"
  | "blocked"
  | "forbidden"
  | "missing"
  | "unknown";

export type AvanzaLocalDevBridgeReadinessLayerStatus = {
  layer: AvanzaLocalDevBridgeReadinessLayer;
  status: AvanzaLocalDevBridgeReadinessLayerState;
  label: string;
  summary: string;
  evidence: string[];
  invokesRuntimeBehavior: false;
  visibleInUi: false;
  warnings: string[];
  blockedReasons: string[];
};

export type AvanzaLocalDevBridgeInvocationBoundary = {
  status: AvanzaLocalDevBridgeInvocationBoundaryStatus;
  label: string;
  summary: string;
  reachedBy: string[];
  stopReason: string;
  canCrossNow: false;
  crossingRequires: string[];
  crossingForbiddenActions: string[];
};

export type AvanzaLocalDevBridgeReadinessSafetyFlags = {
  checkpointOnly: true;
  headlessOnly: true;
  visibleInUi: false;
  canCrossInvocationBoundaryNow: false;
  canOpenLocalDevBridgeGate: false;
  canInvokeSmokeRunnerNow: false;
  canRunTerminalScriptNow: false;
  canUseBrowserAutomationNow: false;
  canStartHandoff: false;
  canPrepareOrderNow: false;
  canRunSmokeTestFromUi: false;
  canCallApiRoute: false;
  canFetch: false;
  canPoll: false;
  canAccessCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canSubmitOrder: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canWriteSupabase: false;
  canClaimProductionReady: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaLocalDevBridgeReadinessCheckpointInput = {
  checkpointId?: string;
  bridgeContract?: AvanzaLocalDevBridgeContract;
  activationChecklist?: AvanzaLocalDevBridgeActivationChecklist;
  disabledRunnerReport?: AvanzaDisabledLocalDevBridgeRunnerReport;
  dryRunReport?: AvanzaModelOnlyLocalDevBridgeDryRunReport;
  architectureCheckpoint?: AvanzaHeadlessExecutionArchitectureCheckpoint;
  operatorReviewed?: boolean;
  safetyReviewed?: boolean;
  now?: string;
};

export type AvanzaLocalDevBridgeReadinessCheckpoint = {
  checkpointId: string;
  createdAt: string;
  status: AvanzaLocalDevBridgeReadinessCheckpointStatus;
  label: string;
  summary: string;
  layers: AvanzaLocalDevBridgeReadinessLayerStatus[];
  invocationBoundary: AvanzaLocalDevBridgeInvocationBoundary;
  completedCapabilities: string[];
  simulatedCapabilities: string[];
  blockedCapabilities: string[];
  forbiddenCapabilities: string[];
  nextAllowedDesignStep: string;
  nextForbiddenSteps: string[];
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaLocalDevBridgeReadinessSafetyFlags;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

export const avanzaLocalDevBridgeReadinessCheckpointSafetyFlags:
  AvanzaLocalDevBridgeReadinessSafetyFlags = {
    canAccessCredentials: false,
    canAutomateBankId: false,
    canCallApiRoute: false,
    canClaimProductionReady: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canCrossInvocationBoundaryNow: false,
    canExportSession: false,
    canFetch: false,
    canInvokeSmokeRunnerNow: false,
    canOpenLocalDevBridgeGate: false,
    canPoll: false,
    canPrepareOrderNow: false,
    canReadCookies: false,
    canRunSmokeTestFromUi: false,
    canRunTerminalScriptNow: false,
    canStartHandoff: false,
    canSubmitOrder: false,
    canUseBrowserAutomationNow: false,
    canWriteSupabase: false,
    checkpointOnly: true,
    controlsEnabled: false,
    finalHumanClickRequired: true,
    gateLocked: true,
    headlessOnly: true,
    userMustConfirm: true,
    visibleInUi: false,
  };

const crossingRequires = [
  "separate future disabled invocation adapter design",
  "manual review checkpoint",
  "model-only smoke request adapter design",
  "explicit local-dev runtime approval in a later task",
  "no credential logging",
  "no cookie/session export",
  "BankID manual-action only",
  "final KOP/SALJ human-only",
] as const;

const nextForbiddenSteps = [
  "real Avanza run",
  "order submission",
  "agent final click",
  "cookie/session export",
  "BankID automation",
  "credential logging",
  "Supabase execution write",
  "Trade UI active handoff",
  "API route activation",
] as const;

const forbiddenCapabilities = [
  "smoke runner invocation blocked",
  "terminal script invocation blocked",
  "browser automation locked",
  "credential access locked",
  "cookies/session forbidden",
  "BankID automation forbidden/manual-only",
  "order submission forbidden",
  "final KOP/SALJ human-only",
  "Supabase writes locked",
  "Trade UI execution locked",
  "API route activation locked",
  "production readiness blocked",
] as const;

function layer(
  layerName: AvanzaLocalDevBridgeReadinessLayer,
  status: AvanzaLocalDevBridgeReadinessLayerState,
  label: string,
  summary: string,
  evidence: string[],
  warnings: string[] = [],
  blockedReasons: string[] = [],
): AvanzaLocalDevBridgeReadinessLayerStatus {
  return {
    blockedReasons,
    evidence,
    invokesRuntimeBehavior: false,
    label,
    layer: layerName,
    status,
    summary,
    visibleInUi: false,
    warnings,
  };
}

function dryRunReachedBoundary(report?: AvanzaModelOnlyLocalDevBridgeDryRunReport) {
  return Boolean(
    report?.status === "model_dry_run_ready" &&
      report.stopReason === "dry_run_completed_to_invocation_boundary",
  );
}

function hasUnsafeInput(input: AvanzaLocalDevBridgeReadinessCheckpointInput) {
  const flagSets = [
    input.bridgeContract?.safetyFlags,
    input.activationChecklist?.safetyFlags,
    input.disabledRunnerReport?.safetyFlags,
    input.dryRunReport?.safetyFlags,
    input.architectureCheckpoint?.safetyFlags,
  ];

  return flagSets.some((flags) =>
    Boolean(
      flags &&
        (flags.visibleInUi ||
          flags.canCallApiRoute ||
          flags.canFetch ||
          flags.canPoll ||
          flags.canAccessCredentials ||
          flags.canReadCookies ||
          flags.canExportSession ||
          flags.canAutomateBankId ||
          flags.canSubmitOrder ||
          flags.canClickFinalBuy ||
          flags.canClickFinalSell ||
          flags.canWriteSupabase ||
          flags.canClaimProductionReady ||
          flags.controlsEnabled ||
          !flags.gateLocked),
    ),
  );
}

function statusDetails(status: AvanzaLocalDevBridgeReadinessCheckpointStatus) {
  if (status === "ready_for_model_only_boundary_review") {
    return {
      label: "Ready for model-only invocation boundary review",
      summary:
        "The bridge stack can be reviewed at the model-only invocation boundary, but cannot cross into runtime invocation.",
    };
  }
  if (status === "blocked_at_invocation_boundary") {
    return {
      label: "Blocked at invocation boundary",
      summary:
        "The bridge stack reaches the model-only boundary and hard-stops before runtime.",
    };
  }
  if (status === "ready_for_disabled_runner_design") {
    return {
      label: "Ready for disabled runner design review",
      summary:
        "The bridge contract and checklist can feed disabled runner design only.",
    };
  }
  if (status === "ready_for_review") {
    return {
      label: "Ready for manual bridge readiness review",
      summary:
        "Some under-surface layers are modeled and ready for manual review only.",
    };
  }
  if (status === "blocked_for_runtime_invocation") {
    return {
      label: "Blocked for runtime invocation",
      summary:
        "Runtime invocation remains blocked by locked bridge and smoke-runner gates.",
    };
  }
  if (status === "blocked_for_real_execution") {
    return {
      label: "Blocked for real execution",
      summary: "Real Avanza execution remains forbidden.",
    };
  }
  if (status === "blocked_for_production") {
    return {
      label: "Blocked for production",
      summary: "Production readiness is blocked.",
    };
  }

  return {
    label: "Unknown bridge readiness checkpoint",
    summary: "Unknown or missing inputs are treated as locked.",
  };
}

function buildInvocationBoundary(
  input: AvanzaLocalDevBridgeReadinessCheckpointInput,
): AvanzaLocalDevBridgeInvocationBoundary {
  const reached = dryRunReachedBoundary(input.dryRunReport);

  return {
    canCrossNow: false,
    crossingForbiddenActions: [...nextForbiddenSteps],
    crossingRequires: [...crossingRequires],
    label: reached
      ? "Invocation boundary reached model-only"
      : "Invocation boundary locked",
    reachedBy: reached
      ? [
          "bridge contract",
          "activation checklist",
          "disabled runner skeleton",
          "model-only dry runner",
        ]
      : [],
    status: reached ? "reached_model_only" : "locked",
    stopReason: reached
      ? "dry_run_completed_to_invocation_boundary"
      : "model-only dry-run boundary not reached",
    summary: reached
      ? "The model-only dry run reaches the invocation boundary and cannot cross invocation boundary now."
      : "The invocation boundary remains locked until the dry-run reaches it in model-only form.",
  };
}

function buildLayers(
  input: AvanzaLocalDevBridgeReadinessCheckpointInput,
): AvanzaLocalDevBridgeReadinessLayerStatus[] {
  return [
    layer(
      "bridge_contract",
      input.bridgeContract?.status === "draft_ready" ? "ready" : "missing",
      "Bridge contract ready",
      "Local-dev bridge contract is modeled under the surface.",
      input.bridgeContract ? [input.bridgeContract.bridgeContractId] : [],
      [],
      input.bridgeContract ? [] : ["Bridge contract missing."],
    ),
    layer(
      "activation_checklist",
      input.activationChecklist?.status === "approved_for_disabled_runner_design"
        ? "ready"
        : input.activationChecklist
          ? "modeled"
          : "missing",
      "Activation checklist ready",
      "Activation checklist is modeled for disabled runner design review only.",
      input.activationChecklist ? [input.activationChecklist.checklistId] : [],
      [],
      input.activationChecklist ? [] : ["Activation checklist missing."],
    ),
    layer(
      "disabled_runner_skeleton",
      input.disabledRunnerReport?.status === "ready_disabled_report"
        ? "disabled_only"
        : input.disabledRunnerReport
          ? "blocked"
          : "missing",
      "Disabled runner skeleton ready",
      "Disabled local-dev bridge runner skeleton is report-only and cannot invoke runtime.",
      input.disabledRunnerReport ? [input.disabledRunnerReport.runnerId] : [],
      [],
      input.disabledRunnerReport ? [] : ["Disabled runner report missing."],
    ),
    layer(
      "model_only_dry_runner",
      input.dryRunReport?.status === "model_dry_run_ready"
        ? "dry_run_only"
        : input.dryRunReport
          ? "blocked"
          : "missing",
      "Model-only dry-run ready",
      "Model-only dry-run runner simulates the bridge path to the boundary.",
      input.dryRunReport ? [input.dryRunReport.dryRunId] : [],
      [],
      input.dryRunReport ? [] : ["Model-only dry-run report missing."],
    ),
    layer(
      "invocation_boundary",
      dryRunReachedBoundary(input.dryRunReport) ? "locked" : "missing",
      "Invocation boundary reached model-only",
      "Execution hard-stops at the invocation boundary and cannot cross now.",
      dryRunReachedBoundary(input.dryRunReport)
        ? ["dry_run_completed_to_invocation_boundary"]
        : [],
      ["Cannot cross invocation boundary now."],
      [],
    ),
    layer(
      "smoke_runner_layer",
      "forbidden",
      "Smoke runner invocation blocked",
      "Smoke runner invocation remains blocked.",
      [],
    ),
    layer(
      "terminal_script_layer",
      "forbidden",
      "Terminal script invocation blocked",
      "Terminal scripts remain blocked and are not imported.",
      [],
    ),
    layer(
      "browser_automation_layer",
      "locked",
      "Browser automation locked",
      "Browser automation gate remains locked.",
      [],
    ),
    layer(
      "credential_access_layer",
      "locked",
      "Credential access locked",
      "Credential access remains locked.",
      [],
    ),
    layer(
      "trade_ui_layer",
      "locked",
      "Trade UI execution locked",
      "No visible Trade UI execution changes are added.",
      [],
    ),
    layer(
      "api_route_layer",
      "locked",
      "API route activation locked",
      "No API route activation or API route call is allowed.",
      [],
    ),
    layer(
      "settlement_layer",
      "modeled",
      "Settlement layer modeled only",
      "Settlement remains model-only and cannot write Supabase.",
      [],
    ),
    layer(
      "production_layer",
      "blocked",
      "Production readiness blocked",
      "This checkpoint cannot claim production readiness.",
      [],
    ),
  ];
}

export function buildAvanzaLocalDevBridgeReadinessCheckpoint(
  input: AvanzaLocalDevBridgeReadinessCheckpointInput = {},
): AvanzaLocalDevBridgeReadinessCheckpoint {
  const checkpointId =
    input.checkpointId ?? "avanza-local-dev-bridge-readiness-checkpoint";
  const createdAt = input.now ?? defaultCreatedAt;
  const blockedReasons: string[] = [];

  let status: AvanzaLocalDevBridgeReadinessCheckpointStatus = "ready_for_review";

  if (hasUnsafeInput(input)) {
    status = "blocked_for_runtime_invocation";
    blockedReasons.push("A supplied input exposes a forbidden runtime capability.");
  } else if (input.architectureCheckpoint?.status === "blocked_for_production") {
    status = "blocked_for_production";
    blockedReasons.push("Architecture checkpoint blocks production readiness.");
  } else if (input.architectureCheckpoint?.status === "blocked_for_real_execution") {
    status = "blocked_for_real_execution";
    blockedReasons.push("Architecture checkpoint blocks real execution.");
  } else if (dryRunReachedBoundary(input.dryRunReport)) {
    status =
      input.operatorReviewed === true && input.safetyReviewed === true
        ? "ready_for_model_only_boundary_review"
        : "blocked_at_invocation_boundary";
    blockedReasons.push("Cannot cross invocation boundary now.");
  } else if (input.dryRunReport?.status === "blocked_smoke_invocation_forbidden") {
    status = "blocked_for_runtime_invocation";
    blockedReasons.push("Smoke runner invocation remains blocked.");
  } else if (input.disabledRunnerReport?.status === "ready_disabled_report") {
    status = "ready_for_disabled_runner_design";
    blockedReasons.push("Model-only boundary dry-run is not complete.");
  } else if (
    !input.bridgeContract &&
    !input.activationChecklist &&
    !input.disabledRunnerReport &&
    !input.dryRunReport
  ) {
    status = "unknown";
    blockedReasons.push("Bridge readiness inputs are missing.");
  } else {
    blockedReasons.push("Bridge stack is not ready to review at the boundary.");
  }

  const details = statusDetails(status);

  return {
    blockedCapabilities: [
      "cannot cross invocation boundary now",
      "smoke runner invocation blocked",
      "terminal script invocation blocked",
      "browser automation locked",
      "credential access locked",
      "Trade UI execution locked",
      "API route activation locked",
    ],
    blockedReasons,
    checkpointId,
    completedCapabilities: [
      "bridge contract modeled",
      "activation checklist modeled",
      "disabled runner skeleton modeled",
      "model-only dry-run modeled",
    ],
    createdAt,
    forbiddenCapabilities: [...forbiddenCapabilities],
    invocationBoundary: buildInvocationBoundary(input),
    label: details.label,
    layers: buildLayers(input),
    nextAllowedDesignStep:
      status === "ready_for_model_only_boundary_review"
        ? "manual review checkpoint or model-only smoke request adapter"
        : "disabled invocation adapter design",
    nextForbiddenSteps: [...nextForbiddenSteps],
    safetyFlags: avanzaLocalDevBridgeReadinessCheckpointSafetyFlags,
    simulatedCapabilities: [
      "bridge request candidate review",
      "activation checklist review",
      "disabled runner report review",
      "model-only bridge run to invocation boundary",
    ],
    status,
    summary: details.summary,
    warnings: [
      "Checkpoint reaches invocation boundary only.",
      "It must never claim runtime invocation readiness.",
      "Future work must explicitly decide the next allowed design step.",
      "Runtime remains locked.",
    ],
  };
}
