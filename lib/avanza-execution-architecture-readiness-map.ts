export type AvanzaExecutionArchitectureArea =
  | "login"
  | "credential_security"
  | "settings_ui"
  | "instrument_search"
  | "order_ticket"
  | "pre_submit_handoff"
  | "settlement_reconciliation"
  | "local_dev_execution"
  | "trade_ui_integration"
  | "api_route_integration"
  | "safety_governance"
  | "unknown";

export type AvanzaExecutionArchitectureReadinessStatus =
  | "complete_model_only"
  | "ready_for_dry_run"
  | "ready_for_mock"
  | "ready_for_local_dev_binding"
  | "waiting_for_local_dev_binding"
  | "waiting_for_ui_integration"
  | "blocked"
  | "forbidden"
  | "not_started"
  | "unknown";

export type AvanzaExecutionArchitectureRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type AvanzaExecutionArchitectureReadinessItem = {
  itemId: string;
  area: AvanzaExecutionArchitectureArea;
  label: string;
  status: AvanzaExecutionArchitectureReadinessStatus;
  summary: string;
  completedArtifacts: string[];
  missingArtifacts: string[];
  blockers: string[];
  warnings: string[];
  riskLevel: AvanzaExecutionArchitectureRiskLevel;
  nextRecommendedAction?: string;
  canProceedToLocalDev: boolean;
  canProceedToTradeUi: boolean;
  canProceedToApiRoute: boolean;
  canProceedToProduction: boolean;
};

export type AvanzaExecutionArchitectureSafetyBoundary = {
  boundaryId: string;
  label: string;
  required: boolean;
  enforcedInDocs: boolean;
  enforcedInTests: boolean;
  status: "enforced" | "partially_enforced" | "missing" | "unknown";
  notes: string;
};

export type AvanzaExecutionArchitectureNextAction = {
  actionId: string;
  title: string;
  priority: "immediate" | "next" | "later";
  area: AvanzaExecutionArchitectureArea;
  rationale: string;
  shouldDoBeforeRealExecution: boolean;
  shouldDoBeforeTradeUiIntegration: boolean;
  forbiddenUntilComplete?: string[];
};

export type AvanzaExecutionArchitectureSafetyFlags = {
  mapOnly: true;
  canExecuteAvanzaActions: false;
  canNavigateAvanza: false;
  canFillOrderFields: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canSubmitOrder: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canExposeCredentials: false;
  canWriteSupabase: false;
  canWireTradeUi: false;
  canWireApiRoute: false;
  canClaimProductionReady: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaExecutionArchitectureReadinessMap = {
  mapId: string;
  createdAt: string;
  status: "architecture_checkpoint_model_only";
  label: string;
  summary: string;
  items: AvanzaExecutionArchitectureReadinessItem[];
  safetyBoundaries: AvanzaExecutionArchitectureSafetyBoundary[];
  nextActions: AvanzaExecutionArchitectureNextAction[];
  globalBlockers: string[];
  globalWarnings: string[];
  productionReadiness:
    | "not_ready"
    | "local_dev_only"
    | "future_review_required";
  safetyFlags: AvanzaExecutionArchitectureSafetyFlags;
};

export type AvanzaExecutionArchitectureReadinessMapInput = {
  mapId?: string;
  createdAt?: string;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";

const safetyFlags: AvanzaExecutionArchitectureSafetyFlags = {
  mapOnly: true,
  canExecuteAvanzaActions: false,
  canNavigateAvanza: false,
  canFillOrderFields: false,
  canClickFinalBuy: false,
  canClickFinalSell: false,
  canSubmitOrder: false,
  canReadCookies: false,
  canExportSession: false,
  canAutomateBankId: false,
  canExposeCredentials: false,
  canWriteSupabase: false,
  canWireTradeUi: false,
  canWireApiRoute: false,
  canClaimProductionReady: false,
  userMustConfirm: true,
  finalHumanClickRequired: true,
  controlsEnabled: false,
  gateLocked: true,
};

function item(
  itemId: string,
  area: AvanzaExecutionArchitectureArea,
  label: string,
  status: AvanzaExecutionArchitectureReadinessStatus,
  summary: string,
  options: {
    completedArtifacts?: string[];
    missingArtifacts?: string[];
    blockers?: string[];
    warnings?: string[];
    riskLevel?: AvanzaExecutionArchitectureRiskLevel;
    nextRecommendedAction?: string;
    canProceedToLocalDev?: boolean;
    canProceedToTradeUi?: boolean;
    canProceedToApiRoute?: boolean;
    canProceedToProduction?: boolean;
  } = {},
): AvanzaExecutionArchitectureReadinessItem {
  return {
    itemId,
    area,
    label,
    status,
    summary,
    completedArtifacts: options.completedArtifacts ?? [],
    missingArtifacts: options.missingArtifacts ?? [],
    blockers: options.blockers ?? [],
    warnings: options.warnings ?? [],
    riskLevel: options.riskLevel ?? "medium",
    nextRecommendedAction: options.nextRecommendedAction,
    canProceedToLocalDev: options.canProceedToLocalDev === true,
    canProceedToTradeUi: options.canProceedToTradeUi === true,
    canProceedToApiRoute: options.canProceedToApiRoute === true,
    canProceedToProduction: options.canProceedToProduction === true,
  };
}

function boundary(
  boundaryId: string,
  label: string,
  notes: string,
): AvanzaExecutionArchitectureSafetyBoundary {
  return {
    boundaryId,
    label,
    required: true,
    enforcedInDocs: true,
    enforcedInTests: true,
    status: "enforced",
    notes,
  };
}

function nextAction(
  actionId: string,
  title: string,
  priority: AvanzaExecutionArchitectureNextAction["priority"],
  area: AvanzaExecutionArchitectureArea,
  rationale: string,
  forbiddenUntilComplete: string[],
): AvanzaExecutionArchitectureNextAction {
  return {
    actionId,
    title,
    priority,
    area,
    rationale,
    shouldDoBeforeRealExecution: true,
    shouldDoBeforeTradeUiIntegration: true,
    forbiddenUntilComplete,
  };
}

export function buildAvanzaExecutionArchitectureReadinessMap(
  input: AvanzaExecutionArchitectureReadinessMapInput = {},
): AvanzaExecutionArchitectureReadinessMap {
  const items = [
    item(
      "login_stack_readiness",
      "login",
      "Login stack readiness item",
      "ready_for_local_dev_binding",
      "Login stack is model/mock/local-dev scaffold mature, but not production-ready.",
      {
        completedArtifacts: [
          "Avanza real-world login signal pack",
          "login route planner",
          "login action contract",
          "login dry-run executor",
          "login mock page executor",
          "login local-dev executor contract",
          "credential bundle executor",
          "isolated smoke test model/runner",
          "terminal-only hard-gated smoke script scaffold",
        ],
        missingArtifacts: ["real order-chain local-dev smoke coverage"],
        warnings: ["Local-dev login scaffolds do not imply production readiness."],
        riskLevel: "high",
        nextRecommendedAction: "Local-dev order chain smoke test harness",
        canProceedToLocalDev: true,
      },
    ),
    item(
      "credential_security_readiness",
      "credential_security",
      "Credential security readiness item",
      "complete_model_only",
      "Credential provider contracts and resolution bridge are modeled without exposing secrets.",
      {
        completedArtifacts: [
          "macOS Keychain credential provider contract",
          "credential resolution bridge",
          "credential-safe reports",
        ],
        blockers: ["No raw credential material may be returned to UI or docs."],
        riskLevel: "critical",
      },
    ),
    item(
      "settings_ui_readiness",
      "settings_ui",
      "Settings UI readiness item",
      "complete_model_only",
      "Ture Settings Avanza profile UI scaffold is passive and credential-safe.",
      {
        completedArtifacts: ["Ture Settings Avanza profile UI scaffold"],
        missingArtifacts: ["production persistence review"],
        riskLevel: "medium",
      },
    ),
    item(
      "instrument_search_readiness",
      "instrument_search",
      "Instrument search readiness item",
      "waiting_for_local_dev_binding",
      "Instrument search signal, route, and action contracts are modeled but not bound to real local-dev page actions.",
      {
        completedArtifacts: [
          "instrument search signal pack",
          "instrument search route contract",
          "instrument search action contract",
        ],
        missingArtifacts: ["real local-dev order/search page action binding contract"],
        riskLevel: "high",
        nextRecommendedAction: "Real local-dev order/search page action binding contract",
      },
    ),
    item(
      "order_ticket_readiness",
      "order_ticket",
      "Order ticket readiness item",
      "ready_for_mock",
      "BUY/SELL order ticket field/action contracts are model mature, with no real fill or submit behavior.",
      {
        completedArtifacts: [
          "BUY/SELL order ticket field contract",
          "BUY/SELL order ticket action contract",
        ],
        missingArtifacts: ["real local-dev order field binding"],
        riskLevel: "high",
      },
    ),
    item(
      "pre_submit_handoff_readiness",
      "pre_submit_handoff",
      "Pre-submit handoff readiness item",
      "ready_for_mock",
      "Instrument-to-order chain is model/dry-run/mock mature and still stops before final human action.",
      {
        completedArtifacts: [
          "instrument search to order ticket handoff chain",
          "instrument-to-order dry-run executor",
          "instrument-to-order mock executor",
        ],
        missingArtifacts: ["local-dev order chain smoke test harness"],
        riskLevel: "high",
        nextRecommendedAction: "Local-dev order chain smoke test harness",
      },
    ),
    item(
      "settlement_reconciliation_readiness",
      "settlement_reconciliation",
      "Settlement reconciliation readiness item",
      "ready_for_mock",
      "Settlement stack is model/dry-run/mock mature, but has no real document read, OCR, extraction, or write.",
      {
        completedArtifacts: [
          "settlement note signal pack",
          "settlement note route/action contract",
          "settlement extraction schema",
          "settlement reconciliation mapping",
          "settlement reconciliation dry-run executor",
          "settlement reconciliation mock executor",
        ],
        missingArtifacts: ["settlement local-dev document/signal binding plan"],
        blockers: ["No real settlement document reading or reconciliation write."],
        riskLevel: "high",
        nextRecommendedAction:
          "Settlement local-dev signal/document binding plan, not OCR yet",
      },
    ),
    item(
      "local_dev_execution_readiness",
      "local_dev_execution",
      "Local-dev execution readiness item",
      "waiting_for_local_dev_binding",
      "Local-dev foundations exist, but real order/search binding and smoke tests remain future gates.",
      {
        completedArtifacts: [
          "local browser runtime adapter foundation",
          "local Playwright browser adapter",
          "local Playwright page action binding",
          "login smoke runner scaffolds",
        ],
        missingArtifacts: [
          "real local-dev order/search page action binding contract",
          "local-dev order chain smoke test harness",
        ],
        riskLevel: "critical",
        nextRecommendedAction: "Real local-dev order/search page action binding contract",
      },
    ),
    item(
      "trade_ui_integration_waiting",
      "trade_ui_integration",
      "Trade UI integration waiting item",
      "waiting_for_ui_integration",
      "Trade UI execution integration is not wired and must wait for local-dev binding evidence.",
      {
        missingArtifacts: ["passive Trade UI handoff preview integration"],
        blockers: ["app/trade-app.tsx must remain default-safe."],
        riskLevel: "critical",
        nextRecommendedAction: "Ture Trade UI passive handoff preview integration",
      },
    ),
    item(
      "api_route_integration_forbidden",
      "api_route_integration",
      "API route integration forbidden item",
      "forbidden",
      "API route integration remains forbidden/not started in this checkpoint.",
      {
        missingArtifacts: ["guarded active local bridge/API route review"],
        blockers: ["Disabled API route remains disabled."],
        riskLevel: "critical",
        nextRecommendedAction: "Later: guarded active local bridge/API route review",
      },
    ),
    item(
      "safety_governance_readiness",
      "safety_governance",
      "Safety governance readiness item",
      "complete_model_only",
      "Safety boundaries are documented, fixture-visible, and test-scanned.",
      {
        completedArtifacts: [
          "final human click boundary",
          "BankID forbidden boundary",
          "credential exposure forbidden boundary",
          "cookies/session forbidden boundary",
          "disabled API route boundary",
        ],
        riskLevel: "critical",
      },
    ),
    item(
      "production_not_ready",
      "safety_governance",
      "Production not ready",
      "blocked",
      "Production readiness is explicitly not claimed.",
      {
        blockers: ["Real local-dev evidence and separate production review are missing."],
        riskLevel: "critical",
      },
    ),
  ];

  const safetyBoundaries = [
    boundary(
      "final_kop_salj_forbidden_boundary",
      "final KÖP/SÄLJ forbidden boundary",
      "Agent must never click final KÖP/SÄLJ; final human click required.",
    ),
    boundary(
      "bankid_forbidden_boundary",
      "BankID forbidden boundary",
      "BankID automation and bypass remain forbidden.",
    ),
    boundary(
      "credential_exposure_forbidden_boundary",
      "credential exposure forbidden boundary",
      "No raw credential exposure in UI, reports, docs, or logs.",
    ),
    boundary(
      "cookies_session_forbidden_boundary",
      "cookies/session forbidden boundary",
      "No cookie/session export or handling from this architecture checkpoint.",
    ),
    boundary(
      "disabled_api_route_boundary",
      "disabled API route boundary",
      "Disabled API route remains disabled; no API route wiring in this checkpoint.",
    ),
  ];

  const nextActions = [
    nextAction(
      "next_real_local_dev_order_search_page_action_binding",
      "Real local-dev order/search page action binding contract",
      "immediate",
      "local_dev_execution",
      "Order/search page action binding should prove local-dev behavior before any Trade UI active wiring.",
      ["Trade UI active integration", "API route integration", "production readiness"],
    ),
    nextAction(
      "next_local_dev_order_chain_smoke_test_harness",
      "Local-dev order chain smoke test harness",
      "next",
      "pre_submit_handoff",
      "A smoke harness should validate the local-dev order chain while still stopping before final KÖP/SÄLJ.",
      ["Trade UI active integration", "API route integration"],
    ),
    nextAction(
      "next_settlement_local_dev_signal_document_binding_plan",
      "Settlement local-dev signal/document binding plan, not OCR yet",
      "next",
      "settlement_reconciliation",
      "Settlement exact PnL needs controlled signal/document planning before document reads, OCR, extraction, or writes.",
      ["OCR", "value extraction", "reconciliation writes"],
    ),
    nextAction(
      "next_passive_trade_ui_handoff_preview_integration",
      "Ture Trade UI passive handoff preview integration",
      "later",
      "trade_ui_integration",
      "Passive preview can come after local-dev binding evidence and must not enable execution.",
      ["active Trade UI execution", "API route integration"],
    ),
    nextAction(
      "next_guarded_active_bridge_api_route_review",
      "Later: guarded active local bridge/API route review",
      "later",
      "api_route_integration",
      "Active local bridge/API route work requires a separate review after local-dev proof and UI safety gates.",
      ["production readiness"],
    ),
  ];

  return {
    mapId: input.mapId ?? "sharp-semi-auto-execution-architecture-readiness-map",
    createdAt: input.createdAt ?? defaultCreatedAt,
    status: "architecture_checkpoint_model_only",
    label: "Sharp Semi Auto Execution Architecture Readiness Map",
    summary:
      "Current architecture is mature at model/mock level, but real local-dev binding and UI/API integration remain separate future gates.",
    items,
    safetyBoundaries,
    nextActions,
    globalBlockers: [
      "No real Avanza execution is allowed from this checkpoint.",
      "No Trade UI execution wiring is allowed from this checkpoint.",
      "No API route integration is allowed from this checkpoint.",
      "Production readiness is not claimed.",
    ],
    globalWarnings: [
      "Semi-auto remains default.",
      "Final KÖP/SÄLJ remains human-only.",
      "Settlement reconciliation is required later for exact PnL.",
      "Local-dev bindings should come before Trade UI active integration.",
    ],
    productionReadiness: "not_ready",
    safetyFlags,
  };
}
