export type AvanzaHeadlessExecutionArchitectureCheckpointStatus =
  | "ready_for_review"
  | "ready_for_local_dev_bridge_design"
  | "blocked_for_real_execution"
  | "blocked_for_production"
  | "incomplete"
  | "unknown";

export type AvanzaHeadlessExecutionArchitectureLayer =
  | "headless_contract"
  | "contract_selector"
  | "agent_plan_builder"
  | "session_state_machine"
  | "orchestration_pipeline"
  | "login_smoke_scaffold"
  | "order_smoke_scaffold"
  | "local_dev_order_executor"
  | "settlement_reconciliation"
  | "settings_passive_readiness"
  | "trade_card_visual_readiness"
  | "safety_guard"
  | "unknown";

export type AvanzaHeadlessExecutionActivationGateStatus =
  | "locked"
  | "modeled"
  | "ready_for_manual_review"
  | "ready_for_local_dev_only"
  | "forbidden"
  | "unknown";

export type AvanzaHeadlessExecutionArchitectureLayerState =
  | "ready"
  | "modeled"
  | "fixture_only"
  | "local_dev_only"
  | "blocked"
  | "forbidden"
  | "missing"
  | "unknown";

export type AvanzaHeadlessExecutionArchitectureLayerStatus = {
  layer: AvanzaHeadlessExecutionArchitectureLayer;
  status: AvanzaHeadlessExecutionArchitectureLayerState;
  label: string;
  summary: string;
  evidence: string[];
  warnings: string[];
  blockedReasons: string[];
  visibleInUi: false;
  invokesRuntimeBehavior: false;
};

export type AvanzaHeadlessExecutionActivationGate = {
  gateId: string;
  status: AvanzaHeadlessExecutionActivationGateStatus;
  label: string;
  purpose: string;
  requiredBefore: string[];
  currentlyAllows: string[];
  currentlyBlocks: string[];
  unlockRequires: string[];
  forbiddenActions: string[];
};

export type AvanzaHeadlessExecutionArchitectureSafetyFlags = {
  checkpointOnly: true;
  headlessOnly: true;
  visibleInUi: false;
  canStartHandoff: false;
  canPrepareOrderNow: false;
  canRunSmokeTestFromUi: false;
  canCallApiRoute: false;
  canFetch: false;
  canPoll: false;
  canUseBrowserAutomationNow: false;
  canAccessCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canExecute: false;
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

export type AvanzaHeadlessExecutionArchitectureCheckpointInput = {
  checkpointId?: string;
  now?: string;
  status?: AvanzaHeadlessExecutionArchitectureCheckpointStatus;
  localDevBridgeGateStatus?: AvanzaHeadlessExecutionActivationGateStatus;
  includeIncompleteLayer?: boolean;
};

export type AvanzaHeadlessExecutionArchitectureCheckpoint = {
  checkpointId: string;
  createdAt: string;
  status: AvanzaHeadlessExecutionArchitectureCheckpointStatus;
  label: string;
  summary: string;
  layers: AvanzaHeadlessExecutionArchitectureLayerStatus[];
  activationGates: AvanzaHeadlessExecutionActivationGate[];
  readyCapabilities: string[];
  blockedCapabilities: string[];
  nextRecommendedAction: string;
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaHeadlessExecutionArchitectureSafetyFlags;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

export const avanzaHeadlessExecutionArchitectureSafetyFlags:
  AvanzaHeadlessExecutionArchitectureSafetyFlags = {
    checkpointOnly: true,
    headlessOnly: true,
    visibleInUi: false,
    canStartHandoff: false,
    canPrepareOrderNow: false,
    canRunSmokeTestFromUi: false,
    canCallApiRoute: false,
    canFetch: false,
    canPoll: false,
    canUseBrowserAutomationNow: false,
    canAccessCredentials: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canExecute: false,
    canSubmitOrder: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canWriteSupabase: false,
    canClaimProductionReady: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };

function layer(
  layerName: AvanzaHeadlessExecutionArchitectureLayer,
  status: AvanzaHeadlessExecutionArchitectureLayerState,
  label: string,
  summary: string,
  evidence: string[],
  warnings: string[] = [],
  blockedReasons: string[] = [],
): AvanzaHeadlessExecutionArchitectureLayerStatus {
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
  status: AvanzaHeadlessExecutionActivationGateStatus,
  label: string,
  purpose: string,
  requiredBefore: string[],
  currentlyAllows: string[],
  currentlyBlocks: string[],
  unlockRequires: string[],
  forbiddenActions: string[],
): AvanzaHeadlessExecutionActivationGate {
  return {
    currentlyAllows,
    currentlyBlocks,
    forbiddenActions,
    gateId,
    label,
    purpose,
    requiredBefore,
    status,
    unlockRequires,
  };
}

function statusDetails(status: AvanzaHeadlessExecutionArchitectureCheckpointStatus) {
  if (status === "ready_for_review") {
    return {
      label: "Headless execution architecture ready for review",
      nextRecommendedAction:
        "Review the checkpoint and keep all activation gates locked before any local-dev bridge design.",
    };
  }
  if (status === "ready_for_local_dev_bridge_design") {
    return {
      label: "Ready for local-dev bridge design review",
      nextRecommendedAction:
        "Design a local-dev bridge separately, with manual approval before any browser or API runtime is opened.",
    };
  }
  if (status === "blocked_for_real_execution") {
    return {
      label: "Blocked for real execution",
      nextRecommendedAction:
        "Do not run real execution; resolve activation gates and manual review requirements first.",
    };
  }
  if (status === "blocked_for_production") {
    return {
      label: "Blocked for production",
      nextRecommendedAction:
        "Do not claim production readiness; keep this as model/dev-QA only.",
    };
  }
  if (status === "incomplete") {
    return {
      label: "Architecture checkpoint incomplete",
      nextRecommendedAction:
        "Fill missing layer evidence before discussing any activation gate.",
    };
  }

  return {
    label: "Architecture checkpoint unknown",
    nextRecommendedAction:
      "Treat unknown checkpoint state as blocked until reviewed.",
  };
}

function buildLayers(includeIncompleteLayer: boolean) {
  const layers = [
    layer(
      "headless_contract",
      "ready",
      "Contract layer ready",
      "Headless execution data contract is modeled and agent-readable.",
      ["lib/avanza-headless-execution-data-contract.ts"],
    ),
    layer(
      "contract_selector",
      "ready",
      "Selector layer ready",
      "Selector can choose the next UI-hidden headless contract.",
      ["lib/avanza-headless-execution-contract-selector.ts"],
    ),
    layer(
      "agent_plan_builder",
      "ready",
      "Plan builder layer ready",
      "Plan builder converts a selected contract into an agent-readable plan.",
      ["lib/avanza-headless-agent-plan-builder.ts"],
    ),
    layer(
      "session_state_machine",
      "ready",
      "Session state machine ready",
      "Session lifecycle can initialize and model plan-ready states.",
      ["lib/avanza-headless-execution-session-state-machine.ts"],
    ),
    layer(
      "orchestration_pipeline",
      "ready",
      "Orchestration pipeline ready",
      "Contract-to-selector-to-plan-to-session orchestration is modeled.",
      ["lib/avanza-headless-execution-orchestration-pipeline.ts"],
    ),
    layer(
      "login_smoke_scaffold",
      "local_dev_only",
      "Login smoke scaffold local-dev only",
      "Terminal-only login smoke scaffold exists but is not invoked here.",
      ["scripts/avanza-login-smoke-test.local.ts"],
    ),
    layer(
      "order_smoke_scaffold",
      "local_dev_only",
      "Order smoke scaffold local-dev only",
      "Terminal-only order smoke scaffold exists but is not invoked here.",
      ["scripts/avanza-order-chain-smoke-test.local.ts"],
    ),
    layer(
      "local_dev_order_executor",
      "modeled",
      "Local-dev order executor modeled",
      "Order/search local-dev executor and bindings exist but are not invoked.",
      [
        "lib/avanza-instrument-to-order-local-dev-executor.ts",
        "lib/avanza-local-playwright-order-page-action-binding.ts",
      ],
    ),
    layer(
      "settlement_reconciliation",
      "fixture_only",
      "Settlement reconciliation model/mock-only",
      "Settlement stack is available as model/mock-only and has no write access.",
      [
        "lib/avanza-settlement-reconciliation-dry-run-executor.ts",
        "lib/avanza-settlement-reconciliation-mock-executor.ts",
      ],
    ),
    layer(
      "settings_passive_readiness",
      "ready",
      "Settings passive readiness ready",
      "Settings readiness panel is passive and does not activate execution.",
      ["components/execution/AvanzaSettingsPassiveExecutionReadinessPanel.tsx"],
    ),
    layer(
      "trade_card_visual_readiness",
      "fixture_only",
      "Trade card visual readiness default-off",
      "Trade card readiness badge remains default-off and passive.",
      ["app/trade-app.tsx"],
      ["Feature flags remain false by default."],
    ),
    layer(
      "safety_guard",
      "ready",
      "Safety guard ready",
      "UI and route safety guard coverage scans for active behavior.",
      ["tests/e2e/avanza-bridge-ui-safety-guard.spec.ts"],
    ),
  ];

  if (!includeIncompleteLayer) return layers;

  return [
    ...layers,
    layer(
      "unknown",
      "missing",
      "Incomplete future bridge evidence",
      "Future local-dev bridge implementation evidence is intentionally missing.",
      [],
      [],
      ["Local-dev bridge is not implemented or opened by this checkpoint."],
    ),
  ];
}

function buildGates(
  localDevBridgeGateStatus: AvanzaHeadlessExecutionActivationGateStatus,
) {
  return [
    gate(
      "ui_simplicity_gate",
      "locked",
      "UI simplicity gate",
      "Protects the intentionally minimal Ture UI.",
      ["Any visible execution UI"],
      ["Fixture/model-only dev QA visibility"],
      ["Visible Trade UI execution controls"],
      ["Separate UI design review and explicit approval"],
      ["Adding active handoff controls without approval"],
    ),
    gate(
      "trade_ui_execution_gate",
      "locked",
      "Trade UI execution gate locked",
      "Blocks active execution wiring in Trade UI.",
      ["Any Trade UI execution behavior"],
      ["Passive/default-off metadata only"],
      ["Handoff, prepare, buy/sell CTA, runtime execution"],
      ["Explicit Trade UI execution plan and approval"],
      ["Activating handoff from default Trade UI"],
    ),
    gate(
      "api_route_execution_gate",
      "locked",
      "API route execution gate locked",
      "Blocks API route execution activation.",
      ["Any enabled API route execution bridge"],
      ["Disabled route stubs and model-only contracts"],
      ["API route calls, fetch, polling, order execution"],
      ["Explicit local-only API activation plan and approval"],
      ["Calling disabled API route from Trade UI"],
    ),
    gate(
      "local_dev_bridge_gate",
      localDevBridgeGateStatus,
      "Local-dev bridge gate not open",
      "Allows future bridge design review only; no runtime bridge is open.",
      ["Any local-dev bridge implementation or runtime run"],
      ["Manual review of bridge design"],
      ["Browser runtime bridge, API bridge, smoke execution"],
      ["Separate approved local-dev bridge task"],
      ["Running browser/API bridge without approval"],
    ),
    gate(
      "browser_automation_gate",
      "locked",
      "Browser automation gate locked",
      "Blocks browser automation until an explicit local-dev bridge task.",
      ["Any browser launch, connect, navigation, form fill, or click"],
      ["Static model and fixture review"],
      ["Browser automation now"],
      ["Explicit local-dev bridge and operator runbook approval"],
      ["Automating Avanza without approved local-dev gate"],
    ),
    gate(
      "credential_access_gate",
      "locked",
      "Credential access gate locked",
      "Blocks credential access; only secure provider design may be considered later.",
      ["Any credential resolution or material access"],
      ["Credential provider contracts with hidden values"],
      ["Credential exposure, logging, env reads, secret reads"],
      ["Secure provider implementation plan and manual approval"],
      ["Logging or exposing credentials"],
    ),
    gate(
      "cookie_session_gate",
      "forbidden",
      "Cookies/session forbidden",
      "Forbids cookie or session export/handling.",
      ["Any browser session handling"],
      ["No cookie/session access"],
      ["Cookie reads, session export, storage scraping"],
      ["No unlock planned"],
      ["Cookie/session export"],
    ),
    gate(
      "bankid_gate",
      "forbidden",
      "BankID automation forbidden",
      "BankID is manual-only for the user and forbidden for automation.",
      ["Any BankID/MFA interaction"],
      ["Manual user action only"],
      ["BankID automation or bypass"],
      ["No automation unlock planned"],
      ["Automating or bypassing BankID"],
    ),
    gate(
      "order_submit_gate",
      "forbidden",
      "Order submit forbidden",
      "Forbids order submission by agent.",
      ["Any broker order submission"],
      ["Review-ready modeling only"],
      ["Order submission"],
      ["No submit unlock in semi-auto scope"],
      ["Submitting orders by agent"],
    ),
    gate(
      "final_kop_salj_gate",
      "forbidden",
      "Final KOP/SALJ human-only",
      "Forbids final buy/sell confirmation clicks by agent.",
      ["Any final broker confirmation"],
      ["User manual final click only"],
      ["Final KOP/SALJ click by agent"],
      ["No agent final-click unlock planned"],
      ["Agent final KOP/SALJ click"],
    ),
    gate(
      "supabase_execution_write_gate",
      "locked",
      "Supabase writes locked",
      "Blocks Supabase execution writes in this phase.",
      ["Any execution record write"],
      ["Read-only/model-only reports"],
      ["Supabase execution write"],
      ["Separate persistence design and approval"],
      ["Writing execution records"],
    ),
    gate(
      "settlement_reconciliation_write_gate",
      "locked",
      "Settlement writes locked",
      "Blocks settlement reconciliation writes.",
      ["Any settlement reconciliation write"],
      ["Model/mock settlement reconciliation only"],
      ["Settlement write, reconciliation mutation"],
      ["Separate settlement write plan and approval"],
      ["Writing settlement reconciliation"],
    ),
    gate(
      "production_readiness_gate",
      "forbidden",
      "Production readiness blocked",
      "Blocks production readiness claims.",
      ["Any production readiness claim"],
      ["Model/dev-QA review"],
      ["Production activation"],
      ["Separate production readiness program"],
      ["Claiming production readiness"],
    ),
  ];
}

export function buildAvanzaHeadlessExecutionArchitectureCheckpoint(
  input: AvanzaHeadlessExecutionArchitectureCheckpointInput = {},
): AvanzaHeadlessExecutionArchitectureCheckpoint {
  const createdAt = input.now?.trim() || defaultCreatedAt;
  const status = input.status ?? "ready_for_review";
  const details = statusDetails(status);
  const layers = buildLayers(input.includeIncompleteLayer === true);
  const activationGates = buildGates(
    input.localDevBridgeGateStatus ?? "ready_for_manual_review",
  );
  const blockedReasons = [
    ...(status === "blocked_for_real_execution"
      ? ["Real execution is blocked until activation gates are explicitly opened."]
      : []),
    ...(status === "blocked_for_production"
      ? ["Production readiness is blocked."]
      : []),
    ...(status === "incomplete"
      ? ["Checkpoint contains incomplete layer evidence."]
      : []),
  ];

  return {
    activationGates,
    blockedCapabilities: [
      "active Trade UI execution",
      "enabled API route execution",
      "browser automation now",
      "credential access",
      "cookies/session handling",
      "BankID automation",
      "order submission",
      "final KOP/SALJ click by agent",
      "Supabase execution write",
      "settlement reconciliation write",
      "production readiness",
    ],
    blockedReasons,
    checkpointId:
      input.checkpointId?.trim() || `headless-architecture-checkpoint-${createdAt}`,
    createdAt,
    label: details.label,
    layers,
    nextRecommendedAction: details.nextRecommendedAction,
    readyCapabilities: [
      "headless contract review",
      "selector review",
      "plan builder review",
      "session state-machine review",
      "orchestration pipeline review",
      "local-dev bridge design discussion",
      "passive Settings readiness review",
      "default-off Trade card readiness review",
      "safety guard review",
    ],
    safetyFlags: avanzaHeadlessExecutionArchitectureSafetyFlags,
    status,
    summary:
      "Full under-surface agent brain loop is checkpointed: contract -> selector -> plan -> session -> orchestration. Next work must pass through activation gates.",
    warnings: [
      "Checkpoint is fixture/model only.",
      "UI remains visually simple.",
      "Local-dev bridge gate is not open.",
      "Trade UI execution gate is locked.",
      "API route execution gate is locked.",
      "Browser automation gate is locked.",
      "Credential access gate is locked.",
      "Cookies/session remain forbidden.",
      "BankID automation remains forbidden/manual-action only.",
      "Order submission remains forbidden.",
      "Final KOP/SALJ remains human-only.",
      "Supabase writes remain locked.",
      "Production readiness remains blocked.",
    ],
  };
}
