import type {
  AvanzaDisabledLocalDevInvocationAdapterContract,
} from "./avanza-disabled-local-dev-invocation-adapter-contract";
import type {
  AvanzaDisabledInvocationAdapterPayloadValidationReport,
} from "./avanza-disabled-invocation-adapter-payload-validator";
import type {
  AvanzaLocalDevBridgeReadinessCheckpoint,
} from "./avanza-local-dev-bridge-readiness-checkpoint";
import type {
  AvanzaManualLocalDevInvocationApprovalRunbook,
} from "./avanza-manual-local-dev-invocation-approval-runbook";

export type AvanzaInvocationAdapterDesignCheckpointStatus =
  | "ready_for_design_review"
  | "ready_for_disabled_adapter_review"
  | "blocked_missing_adapter_contract"
  | "blocked_missing_payload_validator"
  | "blocked_payload_invalid"
  | "blocked_runtime_requested"
  | "blocked_invocation_boundary_locked"
  | "blocked_for_real_execution"
  | "blocked_for_production"
  | "unknown";

export type AvanzaInvocationAdapterDesignLayer =
  | "manual_approval_runbook"
  | "bridge_readiness_checkpoint"
  | "disabled_adapter_contract"
  | "payload_validator"
  | "safe_payload_shape"
  | "invocation_boundary"
  | "smoke_runner_layer"
  | "terminal_script_layer"
  | "browser_automation_layer"
  | "credential_layer"
  | "trade_ui_layer"
  | "api_route_layer"
  | "supabase_write_layer"
  | "production_layer"
  | "unknown";

export type AvanzaInvocationAdapterDesignGateStatus =
  | "ready_for_review"
  | "design_only"
  | "locked"
  | "blocked"
  | "forbidden"
  | "unknown";

export type AvanzaInvocationAdapterDesignLayerState =
  | "ready"
  | "modeled"
  | "design_only"
  | "validation_passed"
  | "validation_failed"
  | "locked"
  | "blocked"
  | "forbidden"
  | "missing"
  | "unknown";

export type AvanzaInvocationAdapterDesignLayerStatus = {
  layer: AvanzaInvocationAdapterDesignLayer;
  status: AvanzaInvocationAdapterDesignLayerState;
  label: string;
  summary: string;
  evidence: string[];
  invokesRuntimeBehavior: false;
  visibleInUi: false;
  warnings: string[];
  blockedReasons: string[];
};

export type AvanzaInvocationAdapterDesignGate = {
  gateId: string;
  status: AvanzaInvocationAdapterDesignGateStatus;
  label: string;
  purpose: string;
  currentlyAllows: string[];
  currentlyBlocks: string[];
  unlockRequires: string[];
  forbiddenActions: string[];
};

export type AvanzaInvocationAdapterDesignSafetyFlags = {
  checkpointOnly: true;
  designReviewOnly: true;
  headlessOnly: true;
  visibleInUi: false;
  canApproveRuntimeInvocation: false;
  canCrossInvocationBoundaryNow: false;
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
  canCarryCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canCarrySessionTokens: false;
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

export type AvanzaInvocationAdapterDesignCheckpointInput = {
  checkpointId?: string;
  approvalRunbook?: AvanzaManualLocalDevInvocationApprovalRunbook;
  bridgeReadinessCheckpoint?: AvanzaLocalDevBridgeReadinessCheckpoint;
  adapterContract?: AvanzaDisabledLocalDevInvocationAdapterContract;
  payloadValidationReport?: AvanzaDisabledInvocationAdapterPayloadValidationReport;
  designReviewed?: boolean;
  payloadReviewed?: boolean;
  runtimeRequested?: boolean;
  realRunRequested?: boolean;
  productionRequested?: boolean;
  now?: string;
};

export type AvanzaInvocationAdapterDesignCheckpoint = {
  checkpointId: string;
  createdAt: string;
  status: AvanzaInvocationAdapterDesignCheckpointStatus;
  label: string;
  summary: string;
  layers: AvanzaInvocationAdapterDesignLayerStatus[];
  gates: AvanzaInvocationAdapterDesignGate[];
  readyForDesignReview: boolean;
  readyForRuntime: false;
  readyForRealRun: false;
  readyForProduction: false;
  validatedPayloadSummary: string[];
  rejectedPayloadSummary: string[];
  nextAllowedDesignStep:
    | "disabled_adapter_shape_review"
    | "model_only_adapter_validator_review"
    | "manual_design_review";
  nextForbiddenSteps: string[];
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaInvocationAdapterDesignSafetyFlags;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

const nextForbiddenSteps = [
  "invoke_smoke_runner",
  "import_terminal_script",
  "start_browser_automation",
  "access_credentials",
  "read_cookies",
  "export_session",
  "automate_bankid",
  "submit_order",
  "click_final_buy",
  "click_final_sell",
  "write_supabase_execution",
  "activate_trade_ui_execution",
  "activate_api_route_execution",
  "claim_production_ready",
] as const;

const runtimeForbiddenActions = [
  "smoke runner invocation",
  "terminal script invocation",
  "browser automation",
  "credential access",
  "cookies/session access",
  "BankID automation",
  "order submission",
  "final KOP/SALJ agent click",
  "Supabase execution write",
  "Trade UI execution",
  "API route activation",
  "production readiness claim",
] as const;

function safetyFlags(): AvanzaInvocationAdapterDesignSafetyFlags {
  return {
    canAccessCredentials: false,
    canApproveRuntimeInvocation: false,
    canAutomateBankId: false,
    canCallApiRoute: false,
    canCarryCredentials: false,
    canCarrySessionTokens: false,
    canClaimProductionReady: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canCrossInvocationBoundaryNow: false,
    canExportSession: false,
    canFetch: false,
    canInvokeSmokeRunnerNow: false,
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
    designReviewOnly: true,
    finalHumanClickRequired: true,
    gateLocked: true,
    headlessOnly: true,
    userMustConfirm: true,
    visibleInUi: false,
  };
}

function layer(
  layerName: AvanzaInvocationAdapterDesignLayer,
  status: AvanzaInvocationAdapterDesignLayerState,
  label: string,
  summary: string,
  evidence: string[] = [],
  warnings: string[] = [],
  blockedReasons: string[] = [],
): AvanzaInvocationAdapterDesignLayerStatus {
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

function gate(
  gateId: string,
  status: AvanzaInvocationAdapterDesignGateStatus,
  label: string,
  purpose: string,
  currentlyAllows: string[],
  currentlyBlocks: string[],
  unlockRequires: string[],
): AvanzaInvocationAdapterDesignGate {
  return {
    currentlyAllows,
    currentlyBlocks,
    forbiddenActions: [...runtimeForbiddenActions],
    gateId,
    label,
    purpose,
    status,
    unlockRequires,
  };
}

function statusDetails(status: AvanzaInvocationAdapterDesignCheckpointStatus) {
  if (status === "ready_for_design_review") {
    return {
      label: "Ready for invocation adapter design review",
      summary:
        "Disabled adapter contract and payload validator are checkpointed for design review only; runtime remains locked.",
    };
  }
  if (status === "ready_for_disabled_adapter_review") {
    return {
      label: "Ready for disabled adapter review",
      summary:
        "The adapter design stack is present, but final design or payload review is still pending.",
    };
  }
  if (status === "blocked_missing_adapter_contract") {
    return {
      label: "Blocked: missing adapter contract",
      summary: "A disabled invocation adapter contract is required.",
    };
  }
  if (status === "blocked_missing_payload_validator") {
    return {
      label: "Blocked: missing payload validator",
      summary: "A payload validation report is required before design review.",
    };
  }
  if (status === "blocked_payload_invalid") {
    return {
      label: "Blocked: payload invalid",
      summary: "Payload validation did not pass design-review safety checks.",
    };
  }
  if (status === "blocked_runtime_requested") {
    return {
      label: "Blocked: runtime requested",
      summary: "Runtime invocation cannot be approved by this checkpoint.",
    };
  }
  if (status === "blocked_invocation_boundary_locked") {
    return {
      label: "Blocked: invocation boundary locked",
      summary:
        "The bridge readiness checkpoint has not advanced to model-only boundary review.",
    };
  }
  if (status === "blocked_for_real_execution") {
    return {
      label: "Blocked: real execution requested",
      summary: "Real Avanza execution remains forbidden.",
    };
  }
  if (status === "blocked_for_production") {
    return {
      label: "Blocked: production requested",
      summary: "Production readiness remains forbidden.",
    };
  }

  return {
    label: "Unknown invocation adapter design checkpoint",
    summary: "Unknown checkpoint inputs remain locked.",
  };
}

function hasUnsafeRuntimeInput(
  input: AvanzaInvocationAdapterDesignCheckpointInput,
) {
  const flagSets = [
    input.approvalRunbook?.safetyFlags,
    input.bridgeReadinessCheckpoint?.safetyFlags,
    input.adapterContract?.safetyFlags,
    input.payloadValidationReport?.safetyFlags,
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

export function buildAvanzaInvocationAdapterDesignCheckpoint(
  input: AvanzaInvocationAdapterDesignCheckpointInput = {},
): AvanzaInvocationAdapterDesignCheckpoint {
  const checkpointId =
    input.checkpointId ?? "avanza-invocation-adapter-design-checkpoint";
  const createdAt = input.now ?? defaultCreatedAt;
  const adapterReady =
    input.adapterContract?.status === "disabled_contract_ready";
  const payloadValid =
    input.payloadValidationReport?.status === "valid_for_design_review";
  const bridgeReady =
    input.bridgeReadinessCheckpoint?.status ===
    "ready_for_model_only_boundary_review";
  const approvalReady = Boolean(
    input.approvalRunbook?.status === "approved_for_invocation_adapter_design" ||
      input.approvalRunbook?.status === "ready_for_manual_review",
  );
  const unsafeRuntimeInput = hasUnsafeRuntimeInput(input);
  const blockedReasons: string[] = [];
  const warnings: string[] = [];

  let status: AvanzaInvocationAdapterDesignCheckpointStatus =
    "ready_for_design_review";

  if (!input.adapterContract) {
    status = "blocked_missing_adapter_contract";
    blockedReasons.push("Disabled adapter contract missing.");
  } else if (!input.payloadValidationReport) {
    status = "blocked_missing_payload_validator";
    blockedReasons.push("Payload validator report missing.");
  } else if (!payloadValid) {
    status = "blocked_payload_invalid";
    blockedReasons.push("Payload validator did not return valid_for_design_review.");
  } else if (input.runtimeRequested || unsafeRuntimeInput) {
    status = "blocked_runtime_requested";
    blockedReasons.push("Runtime invocation requested or unsafe capability detected.");
  } else if (input.realRunRequested) {
    status = "blocked_for_real_execution";
    blockedReasons.push("Real-run request is forbidden.");
  } else if (input.productionRequested) {
    status = "blocked_for_production";
    blockedReasons.push("Production readiness request is forbidden.");
  } else if (!bridgeReady) {
    status = "blocked_invocation_boundary_locked";
    blockedReasons.push("Bridge readiness checkpoint has not reached model-only boundary review.");
  } else if (
    !approvalReady ||
    !adapterReady ||
    !input.designReviewed ||
    !input.payloadReviewed
  ) {
    status = "ready_for_disabled_adapter_review";
    warnings.push("Ready for disabled adapter review only; design review is incomplete.");
  } else {
    warnings.push("Ready for design review only; runtime remains locked.");
  }

  const details = statusDetails(status);
  const readyForDesignReview = status === "ready_for_design_review";
  const adapterBlockedReason = !input.adapterContract
    ? ["Disabled adapter contract missing."]
    : adapterReady
      ? []
      : ["Disabled adapter contract is not disabled_contract_ready."];
  const payloadBlockedReason = !input.payloadValidationReport
    ? ["Payload validator report missing."]
    : payloadValid
      ? []
      : ["Payload validator report is not valid_for_design_review."];

  return {
    blockedReasons,
    checkpointId,
    createdAt,
    gates: [
      gate(
        "design-review-gate",
        readyForDesignReview ? "ready_for_review" : "design_only",
        "Design review gate",
        "Allows only disabled adapter design review.",
        readyForDesignReview
          ? ["disabled_adapter_shape_review", "model_only_adapter_validator_review"]
          : ["manual_design_review"],
        ["runtime invocation", "real execution", "production readiness"],
        ["complete manual review", "valid payload validator report"],
      ),
      gate(
        "runtime-invocation-gate",
        "locked",
        "Runtime invocation gate",
        "Keeps runtime invocation unavailable.",
        [],
        ["invoke_smoke_runner", "import_terminal_script", "start_browser_automation"],
        ["separate future runtime approval", "manual terminal confirmation"],
      ),
      gate(
        "sensitive-payload-gate",
        payloadValid ? "ready_for_review" : "blocked",
        "Sensitive payload gate",
        "Rejects credentials, cookies, sessions, account IDs, and order IDs.",
        payloadValid ? ["safe payload shape review"] : [],
        ["sensitive payload", "unredacted evidence"],
        ["redacted summaries only"],
      ),
      gate(
        "production-gate",
        "forbidden",
        "Production readiness gate",
        "Blocks any production readiness claim.",
        [],
        ["claim_production_ready"],
        ["separate future production safety program"],
      ),
    ],
    label: details.label,
    layers: [
      layer(
        "manual_approval_runbook",
        input.approvalRunbook ? "design_only" : "missing",
        "Manual approval runbook",
        input.approvalRunbook
          ? "Design-only approval can be modeled."
          : "Manual approval runbook is missing.",
        input.approvalRunbook ? [input.approvalRunbook.runbookId] : [],
        [],
        input.approvalRunbook ? [] : ["Manual approval runbook missing."],
      ),
      layer(
        "bridge_readiness_checkpoint",
        bridgeReady ? "ready" : input.bridgeReadinessCheckpoint ? "locked" : "missing",
        "Bridge readiness checkpoint",
        bridgeReady
          ? "Bridge readiness is ready for model-only boundary review."
          : "Bridge readiness has not opened runtime.",
        input.bridgeReadinessCheckpoint
          ? [input.bridgeReadinessCheckpoint.checkpointId]
          : [],
        bridgeReady ? [] : ["Invocation boundary remains locked."],
        input.bridgeReadinessCheckpoint ? [] : ["Bridge readiness checkpoint missing."],
      ),
      layer(
        "disabled_adapter_contract",
        adapterReady ? "modeled" : input.adapterContract ? "blocked" : "missing",
        "Disabled adapter contract",
        adapterReady
          ? "Disabled adapter contract reviewed for design shape."
          : "Disabled adapter contract is unavailable or blocked.",
        input.adapterContract ? [input.adapterContract.adapterContractId] : [],
        [],
        adapterBlockedReason,
      ),
      layer(
        "payload_validator",
        payloadValid
          ? "validation_passed"
          : input.payloadValidationReport
            ? "validation_failed"
            : "missing",
        "Payload validator",
        payloadValid
          ? "Payload validator reviewed and valid for design review."
          : "Payload validator is missing or failed.",
        input.payloadValidationReport
          ? [input.payloadValidationReport.validationId]
          : [],
        [],
        payloadBlockedReason,
      ),
      layer(
        "safe_payload_shape",
        payloadValid ? "validation_passed" : "validation_failed",
        "Safe payload shape",
        payloadValid
          ? "Safe payload shape validated."
          : "Safe payload shape is not valid for design review.",
        input.payloadValidationReport?.allowedPayloadSummary ?? [],
        [],
        payloadBlockedReason,
      ),
      layer(
        "invocation_boundary",
        "locked",
        "Invocation boundary",
        "Invocation boundary remains locked and cannot be crossed now.",
      ),
      layer(
        "smoke_runner_layer",
        "locked",
        "Smoke runner layer",
        "Smoke runner invocation remains locked.",
      ),
      layer(
        "terminal_script_layer",
        "locked",
        "Terminal script layer",
        "Terminal script invocation remains locked.",
      ),
      layer(
        "browser_automation_layer",
        "locked",
        "Browser automation layer",
        "Browser automation remains locked.",
      ),
      layer(
        "credential_layer",
        "forbidden",
        "Credential layer",
        "Credential access is locked and cookies/session are forbidden.",
      ),
      layer(
        "trade_ui_layer",
        "locked",
        "Trade UI layer",
        "Trade UI execution remains locked and visually unchanged.",
      ),
      layer(
        "api_route_layer",
        "locked",
        "API route layer",
        "API route activation remains locked.",
      ),
      layer(
        "supabase_write_layer",
        "locked",
        "Supabase write layer",
        "Supabase execution writes remain locked.",
      ),
      layer(
        "production_layer",
        "forbidden",
        "Production layer",
        "Production readiness remains blocked.",
      ),
    ],
    nextAllowedDesignStep: readyForDesignReview
      ? "disabled_adapter_shape_review"
      : payloadValid
        ? "model_only_adapter_validator_review"
        : "manual_design_review",
    nextForbiddenSteps: [...nextForbiddenSteps],
    readyForDesignReview,
    readyForProduction: false,
    readyForRealRun: false,
    readyForRuntime: false,
    rejectedPayloadSummary:
      input.payloadValidationReport?.forbiddenPayloadDetected.map(String) ?? [],
    safetyFlags: safetyFlags(),
    status,
    summary: details.summary,
    validatedPayloadSummary:
      input.payloadValidationReport?.allowedPayloadSummary ?? [],
    warnings,
  };
}
