export type AvanzaSharpSemiAutoExecutionPhaseStatus =
  | "phase_complete"
  | "ready_for_roadmap_review"
  | "ready_for_manual_local_dev_test_planning"
  | "ready_for_additional_model_only_design"
  | "blocked_for_runtime"
  | "blocked_for_production"
  | "unknown";

export type AvanzaSharpSemiAutoExecutionPhaseLayer =
  | "headless_contract_chain"
  | "orchestration_pipeline"
  | "session_lifecycle"
  | "architecture_checkpoint"
  | "local_dev_bridge_contract"
  | "activation_checklist"
  | "disabled_bridge_runner"
  | "model_only_bridge_dry_run"
  | "invocation_boundary_checkpoint"
  | "manual_invocation_approval_runbook"
  | "disabled_invocation_adapter_contract"
  | "payload_validator"
  | "invocation_adapter_design_checkpoint"
  | "smoke_scaffold"
  | "trade_ui"
  | "api_route"
  | "browser_automation"
  | "credential_access"
  | "settlement"
  | "production"
  | "unknown";

export type AvanzaSharpSemiAutoExecutionNextWorkstream =
  | "manual_local_dev_test_runbook"
  | "additional_model_only_validation"
  | "disabled_invocation_adapter_shape_review"
  | "model_only_adapter_validator_review"
  | "settlement_model_checkpoint"
  | "safety_audit"
  | "runtime_invocation_forbidden"
  | "production_forbidden"
  | "unknown";

export type AvanzaSharpSemiAutoExecutionPhaseLayerState =
  | "complete"
  | "modeled"
  | "model_only"
  | "disabled_only"
  | "locked"
  | "forbidden"
  | "blocked"
  | "unknown";

export type AvanzaSharpSemiAutoExecutionPhaseLayerStatus = {
  layer: AvanzaSharpSemiAutoExecutionPhaseLayer;
  status: AvanzaSharpSemiAutoExecutionPhaseLayerState;
  label: string;
  summary: string;
  evidence: string[];
  visibleInUi: false;
  invokesRuntimeBehavior: false;
  warnings: string[];
  blockedReasons: string[];
};

export type AvanzaSharpSemiAutoExecutionRoadmapItem = {
  workstream: AvanzaSharpSemiAutoExecutionNextWorkstream;
  label: string;
  summary: string;
  allowed: boolean;
  requiresSeparateApproval: boolean;
  opensRuntime: false;
  touchesTradeUi: boolean;
  touchesApiRoute: boolean;
  invokesBrowserAutomation: boolean;
  accessesCredentials: boolean;
  riskLevel: "low" | "medium" | "high" | "forbidden" | "unknown";
  recommendedOrder: number;
  blockedReason?: string;
  forbiddenActions: string[];
};

export type AvanzaSharpSemiAutoExecutionPhaseSafetyFlags = {
  checkpointOnly: true;
  roadmapOnly: true;
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

export type AvanzaSharpSemiAutoExecutionPhaseCheckpointInput = {
  checkpointId?: string;
  includeRoadmap?: boolean;
  now?: string;
  roadmapReviewRequested?: boolean;
  runtimeRequested?: boolean;
  productionRequested?: boolean;
  preferredNextWorkstream?: AvanzaSharpSemiAutoExecutionNextWorkstream;
};

export type AvanzaSharpSemiAutoExecutionPhaseCheckpoint = {
  checkpointId: string;
  createdAt: string;
  status: AvanzaSharpSemiAutoExecutionPhaseStatus;
  label: string;
  summary: string;
  completedLayers: AvanzaSharpSemiAutoExecutionPhaseLayerStatus[];
  modelOnlyLayers: AvanzaSharpSemiAutoExecutionPhaseLayerStatus[];
  lockedLayers: AvanzaSharpSemiAutoExecutionPhaseLayerStatus[];
  forbiddenCapabilities: string[];
  allowedNextWorkstreams: AvanzaSharpSemiAutoExecutionNextWorkstream[];
  forbiddenNextWorkstreams: AvanzaSharpSemiAutoExecutionNextWorkstream[];
  notRecommendedNextSteps: string[];
  roadmap: AvanzaSharpSemiAutoExecutionRoadmapItem[];
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaSharpSemiAutoExecutionPhaseSafetyFlags;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

const forbiddenCapabilities = [
  "runtime_invocation",
  "smoke_runner_invocation",
  "terminal_script_invocation",
  "browser_automation",
  "credential_access",
  "read_cookies",
  "export_session",
  "automate_bankid",
  "api_route_activation",
  "trade_ui_execution",
  "order_submission",
  "click_final_buy",
  "click_final_sell",
  "write_supabase_execution",
  "claim_production_ready",
] as const;

const notRecommendedNextSteps = [
  "adding more visual Trade UI elements",
  "enabling readiness badge by default",
  "wiring active handoff",
  "wiring prepare button",
  "adding API route activation",
  "invoking smoke scripts",
  "using browser automation",
  "storing credentials",
  "reading cookies/session",
] as const;

const allowedNextWorkstreams: AvanzaSharpSemiAutoExecutionNextWorkstream[] = [
  "manual_local_dev_test_runbook",
  "additional_model_only_validation",
  "disabled_invocation_adapter_shape_review",
  "model_only_adapter_validator_review",
  "settlement_model_checkpoint",
  "safety_audit",
];

const forbiddenNextWorkstreams: AvanzaSharpSemiAutoExecutionNextWorkstream[] = [
  "runtime_invocation_forbidden",
  "production_forbidden",
];

function safetyFlags(): AvanzaSharpSemiAutoExecutionPhaseSafetyFlags {
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
    finalHumanClickRequired: true,
    gateLocked: true,
    headlessOnly: true,
    roadmapOnly: true,
    userMustConfirm: true,
    visibleInUi: false,
  };
}

function layer(
  layerName: AvanzaSharpSemiAutoExecutionPhaseLayer,
  status: AvanzaSharpSemiAutoExecutionPhaseLayerState,
  label: string,
  summary: string,
  evidence: string[],
  warnings: string[] = [],
  blockedReasons: string[] = [],
): AvanzaSharpSemiAutoExecutionPhaseLayerStatus {
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

function roadmapItem(
  workstream: AvanzaSharpSemiAutoExecutionNextWorkstream,
  label: string,
  summary: string,
  allowed: boolean,
  riskLevel: AvanzaSharpSemiAutoExecutionRoadmapItem["riskLevel"],
  recommendedOrder: number,
  blockedReason?: string,
): AvanzaSharpSemiAutoExecutionRoadmapItem {
  const forbidden = !allowed;

  return {
    accessesCredentials: forbidden,
    allowed,
    blockedReason,
    forbiddenActions: [...forbiddenCapabilities],
    invokesBrowserAutomation: forbidden,
    label,
    opensRuntime: false,
    recommendedOrder,
    requiresSeparateApproval: !allowed || riskLevel !== "low",
    riskLevel,
    summary,
    touchesApiRoute: forbidden,
    touchesTradeUi: forbidden,
    workstream,
  };
}

function statusDetails(status: AvanzaSharpSemiAutoExecutionPhaseStatus) {
  if (status === "phase_complete") {
    return {
      label: "Sharp Semi Auto Execution phase complete",
      summary:
        "The current headless/local-dev/invocation design phase is checkpointed and complete; runtime remains locked.",
    };
  }
  if (status === "ready_for_roadmap_review") {
    return {
      label: "Ready for roadmap review",
      summary:
        "The phase can be reviewed as a roadmap-only checkpoint without opening runtime gates.",
    };
  }
  if (status === "ready_for_manual_local_dev_test_planning") {
    return {
      label: "Ready for manual local-dev test planning",
      summary:
        "Manual local-dev test runbook planning is allowed, but smoke runners remain uninvoked.",
    };
  }
  if (status === "ready_for_additional_model_only_design") {
    return {
      label: "Ready for additional model-only design",
      summary:
        "Additional model-only validation can continue under the same locked execution gates.",
    };
  }
  if (status === "blocked_for_runtime") {
    return {
      label: "Blocked for runtime",
      summary: "Runtime invocation is outside this checkpoint and remains blocked.",
    };
  }
  if (status === "blocked_for_production") {
    return {
      label: "Blocked for production",
      summary: "Production readiness is outside this checkpoint and remains blocked.",
    };
  }

  return {
    label: "Unknown Sharp Semi Auto Execution phase checkpoint",
    summary: "Unknown phase inputs remain locked.",
  };
}

function buildRoadmap(includeRoadmap: boolean) {
  if (!includeRoadmap) return [];

  return [
    roadmapItem(
      "manual_local_dev_test_runbook",
      "Manual local-dev test runbook",
      "Allowed as planning or operator documentation only; it must not invoke smoke runners here.",
      true,
      "low",
      1,
    ),
    roadmapItem(
      "additional_model_only_validation",
      "Additional model-only validation",
      "Allowed for pure contracts, fixtures, harnesses, and safety scans.",
      true,
      "low",
      2,
    ),
    roadmapItem(
      "disabled_invocation_adapter_shape_review",
      "Disabled invocation adapter shape review",
      "Allowed for disabled adapter shape and payload review only.",
      true,
      "low",
      3,
    ),
    roadmapItem(
      "model_only_adapter_validator_review",
      "Model-only adapter validator review",
      "Allowed for validation reports that reject sensitive payloads and keep runtime locked.",
      true,
      "low",
      4,
    ),
    roadmapItem(
      "settlement_model_checkpoint",
      "Settlement model checkpoint",
      "Allowed for post-trade model review without Avanza navigation or writes.",
      true,
      "low",
      5,
    ),
    roadmapItem(
      "safety_audit",
      "Safety audit",
      "Allowed to confirm no runtime, credentials, API calls, Trade UI execution, or production gate opened.",
      true,
      "low",
      6,
    ),
    roadmapItem(
      "runtime_invocation_forbidden",
      "Runtime invocation forbidden",
      "Forbidden until a separate approval explicitly opens runtime and invocation boundaries.",
      false,
      "forbidden",
      99,
      "Runtime invocation is not approved by this checkpoint.",
    ),
    roadmapItem(
      "production_forbidden",
      "Production forbidden",
      "Forbidden until a separate production safety program exists.",
      false,
      "forbidden",
      100,
      "Production readiness is blocked.",
    ),
  ];
}

export function buildAvanzaSharpSemiAutoExecutionPhaseCheckpoint(
  input: AvanzaSharpSemiAutoExecutionPhaseCheckpointInput = {},
): AvanzaSharpSemiAutoExecutionPhaseCheckpoint {
  const checkpointId =
    input.checkpointId ?? "avanza-sharp-semi-auto-execution-phase-checkpoint";
  const createdAt = input.now ?? defaultCreatedAt;
  const warnings: string[] = [
    "Allowed next workstreams are separated; future work must pick one explicit workstream.",
    "UI remains visually simple; visual Trade UI expansion is not recommended.",
  ];
  const blockedReasons: string[] = [];
  let status: AvanzaSharpSemiAutoExecutionPhaseStatus = "phase_complete";

  if (input.runtimeRequested) {
    status = "blocked_for_runtime";
    blockedReasons.push("Runtime invocation was requested, but the runtime gate remains locked.");
  } else if (input.productionRequested) {
    status = "blocked_for_production";
    blockedReasons.push("Production readiness was requested, but production remains blocked.");
  } else if (input.preferredNextWorkstream === "manual_local_dev_test_runbook") {
    status = "ready_for_manual_local_dev_test_planning";
  } else if (
    input.preferredNextWorkstream === "additional_model_only_validation" ||
    input.preferredNextWorkstream === "disabled_invocation_adapter_shape_review" ||
    input.preferredNextWorkstream === "model_only_adapter_validator_review" ||
    input.preferredNextWorkstream === "settlement_model_checkpoint" ||
    input.preferredNextWorkstream === "safety_audit"
  ) {
    status = "ready_for_additional_model_only_design";
  } else if (input.roadmapReviewRequested) {
    status = "ready_for_roadmap_review";
  }

  const details = statusDetails(status);
  const completedLayers = [
    layer(
      "headless_contract_chain",
      "complete",
      "Headless chain complete",
      "Headless contract, selector, plan, session, orchestration, and architecture checkpoint are complete.",
      [
        "lib/avanza-headless-execution-data-contract.ts",
        "lib/avanza-headless-execution-contract-selector.ts",
        "lib/avanza-headless-agent-plan-builder.ts",
        "lib/avanza-headless-execution-session-state-machine.ts",
      ],
    ),
    layer(
      "orchestration_pipeline",
      "model_only",
      "Orchestration complete",
      "The orchestration pipeline is complete as a model-only layer.",
      ["lib/avanza-headless-execution-orchestration-pipeline.ts"],
    ),
    layer(
      "session_lifecycle",
      "model_only",
      "Session lifecycle complete",
      "The session lifecycle is modeled and remains non-executing.",
      ["lib/avanza-headless-execution-session-state-machine.ts"],
    ),
    layer(
      "architecture_checkpoint",
      "complete",
      "Architecture checkpoint complete",
      "The headless architecture checkpoint is complete and keeps gates locked.",
      ["lib/avanza-headless-execution-architecture-checkpoint.ts"],
    ),
    layer(
      "invocation_adapter_design_checkpoint",
      "complete",
      "Invocation adapter design checkpointed",
      "The invocation adapter design checkpoint validates design review only.",
      ["lib/avanza-invocation-adapter-design-checkpoint.ts"],
    ),
  ];
  const modelOnlyLayers = [
    layer(
      "local_dev_bridge_contract",
      "model_only",
      "Local-dev bridge contract",
      "The bridge contract is model-only and cannot invoke the bridge.",
      ["lib/avanza-local-dev-bridge-contract.ts"],
    ),
    layer(
      "activation_checklist",
      "model_only",
      "Activation checklist",
      "The activation checklist is model-only and does not unlock runtime.",
      ["lib/avanza-local-dev-bridge-activation-checklist.ts"],
    ),
    layer(
      "disabled_bridge_runner",
      "disabled_only",
      "Disabled bridge runner",
      "The runner skeleton is disabled-only and cannot execute.",
      ["lib/avanza-disabled-local-dev-bridge-runner.ts"],
    ),
    layer(
      "model_only_bridge_dry_run",
      "model_only",
      "Model-only bridge dry run",
      "The dry-runner models the invocation boundary without crossing it.",
      ["lib/avanza-model-only-local-dev-bridge-dry-runner.ts"],
    ),
    layer(
      "invocation_boundary_checkpoint",
      "model_only",
      "Invocation boundary checkpoint",
      "The bridge readiness checkpoint reaches model-only review; runtime remains locked.",
      ["lib/avanza-local-dev-bridge-readiness-checkpoint.ts"],
    ),
    layer(
      "manual_invocation_approval_runbook",
      "model_only",
      "Manual invocation approval runbook",
      "Manual approval is modeled for design only.",
      ["lib/avanza-manual-local-dev-invocation-approval-runbook.ts"],
    ),
    layer(
      "disabled_invocation_adapter_contract",
      "model_only",
      "Disabled invocation adapter contract",
      "The disabled adapter contract is ready for shape review only.",
      ["lib/avanza-disabled-local-dev-invocation-adapter-contract.ts"],
    ),
    layer(
      "payload_validator",
      "model_only",
      "Payload validator",
      "The payload validator accepts safe design-review payloads and rejects sensitive payloads.",
      ["lib/avanza-disabled-invocation-adapter-payload-validator.ts"],
    ),
    layer(
      "settlement",
      "model_only",
      "Settlement model",
      "Settlement and reconciliation are modeled and locked from writes.",
      ["lib/avanza-settlement-reconciliation-mapping.ts"],
    ),
  ];
  const lockedLayers = [
    layer(
      "smoke_scaffold",
      "locked",
      "Smoke scaffold locked",
      "Local-dev smoke scaffolds exist but remain uninvoked.",
      ["local-dev login smoke scaffold", "local-dev order smoke scaffold"],
      ["Smoke runner invocation remains locked."],
    ),
    layer(
      "trade_ui",
      "locked",
      "Trade UI execution locked",
      "Trade UI execution stays locked and visually unchanged.",
      ["app/trade-app.tsx"],
    ),
    layer(
      "api_route",
      "locked",
      "API route activation locked",
      "Disabled API route remains disabled and is not called.",
      ["disabled local-only API route boundary"],
    ),
    layer(
      "browser_automation",
      "locked",
      "Browser automation locked",
      "Browser automation is unavailable in this checkpoint.",
      [],
    ),
    layer(
      "credential_access",
      "locked",
      "Credential access locked",
      "Credential, cookies, session, and BankID automation access remain forbidden.",
      [],
    ),
    layer(
      "production",
      "blocked",
      "Production readiness blocked",
      "The stack is not production ready.",
      [],
      [],
      ["Production readiness remains blocked."],
    ),
  ];

  return {
    allowedNextWorkstreams,
    blockedReasons,
    checkpointId,
    completedLayers,
    createdAt,
    forbiddenCapabilities: [...forbiddenCapabilities],
    forbiddenNextWorkstreams,
    label: details.label,
    lockedLayers,
    modelOnlyLayers,
    notRecommendedNextSteps: [...notRecommendedNextSteps],
    roadmap: buildRoadmap(input.includeRoadmap ?? true),
    safetyFlags: safetyFlags(),
    status,
    summary: details.summary,
    warnings,
  };
}
