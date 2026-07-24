import {
  buildAvanzaHeadlessAgentPlan,
  type AvanzaHeadlessAgentPlan,
  type AvanzaHeadlessAgentPlanCustomerType,
} from "./avanza-headless-agent-plan-builder";
import type {
  AvanzaHeadlessExecutionContract,
  AvanzaHeadlessExecutionContractInput,
  AvanzaHeadlessExecutionContractIntent,
  AvanzaHeadlessExecutionContractSide,
  AvanzaHeadlessExecutionContractSource,
} from "./avanza-headless-execution-data-contract";
import {
  selectNextAvanzaHeadlessExecutionContract,
  type AvanzaHeadlessExecutionContractSelectorMode,
  type AvanzaHeadlessExecutionContractSelectorResult,
} from "./avanza-headless-execution-contract-selector";
import {
  reduceAvanzaHeadlessExecutionSessionEvents,
  type AvanzaHeadlessExecutionSession,
  type AvanzaHeadlessExecutionSessionEvent,
} from "./avanza-headless-execution-session-state-machine";

export type AvanzaHeadlessExecutionOrchestrationStatus =
  | "ready_orchestration"
  | "no_candidates"
  | "all_candidates_blocked"
  | "selector_blocked"
  | "plan_blocked"
  | "session_blocked"
  | "blocked"
  | "unknown";

export type AvanzaHeadlessExecutionOrchestrationStage =
  | "build_contracts"
  | "select_contract"
  | "build_plan"
  | "create_session"
  | "attach_plan_to_session"
  | "advance_to_plan_ready"
  | "blocked"
  | "complete_model_run";

export type AvanzaHeadlessExecutionOrchestrationMode =
  | "semi_auto"
  | "review_only"
  | "automatic_forbidden";

export type AvanzaHeadlessExecutionOrchestrationStageStatus =
  | "completed"
  | "skipped"
  | "blocked"
  | "failed"
  | "unknown";

export type AvanzaHeadlessExecutionOrchestrationNextStep =
  | "plan_login_if_needed"
  | "plan_instrument_search"
  | "wait_for_manual_review"
  | "blocked";

export type AvanzaHeadlessExecutionOrchestrationInput = {
  orchestrationId?: string;
  recommendations?: readonly (
    | AvanzaHeadlessExecutionContractInput
    | AvanzaHeadlessExecutionContract
  )[];
  livePositions?: readonly (
    | AvanzaHeadlessExecutionContractInput
    | AvanzaHeadlessExecutionContract
  )[];
  profileReady?: boolean;
  loginKnown?: boolean;
  customerType?: AvanzaHeadlessAgentPlanCustomerType;
  mode?: AvanzaHeadlessExecutionOrchestrationMode;
  allowEntries?: boolean;
  allowExits?: boolean;
  maxCandidates?: number;
  now?: string;
  advanceBeyondPlanReady?: boolean;
  forcePlanBlocked?: boolean;
  forceSessionBlocked?: boolean;
};

export type AvanzaHeadlessExecutionOrchestrationStageResult = {
  stage: AvanzaHeadlessExecutionOrchestrationStage;
  status: AvanzaHeadlessExecutionOrchestrationStageStatus;
  label: string;
  reason: string;
  safeSummary: string;
  warnings: string[];
  blockedReasons: string[];
};

export type AvanzaHeadlessExecutionOrchestrationSafetyFlags = {
  orchestrationOnly: true;
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

export type AvanzaHeadlessExecutionOrchestrationReport = {
  orchestrationId: string;
  createdAt: string;
  status: AvanzaHeadlessExecutionOrchestrationStatus;
  label: string;
  reason: string;
  mode: AvanzaHeadlessExecutionOrchestrationMode;
  selectedContractId?: string;
  selectedSource?: AvanzaHeadlessExecutionContractSource;
  selectedIntent?: AvanzaHeadlessExecutionContractIntent;
  selectedTicker?: string;
  selectedSide?: AvanzaHeadlessExecutionContractSide;
  selectedQuantity?: number;
  selectedLimitPrice?: number;
  selectorResult?: AvanzaHeadlessExecutionContractSelectorResult;
  plan?: AvanzaHeadlessAgentPlan;
  session?: AvanzaHeadlessExecutionSession;
  stages: AvanzaHeadlessExecutionOrchestrationStageResult[];
  agentReadableSummary: string;
  nextTheoreticalAgentStep: AvanzaHeadlessExecutionOrchestrationNextStep;
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaHeadlessExecutionOrchestrationSafetyFlags;
};

const defaultCreatedAt = "2026-07-07T12:00:00.000Z";

export const avanzaHeadlessExecutionOrchestrationSafetyFlags:
  AvanzaHeadlessExecutionOrchestrationSafetyFlags = {
    orchestrationOnly: true,
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

function stageResult(
  stage: AvanzaHeadlessExecutionOrchestrationStage,
  status: AvanzaHeadlessExecutionOrchestrationStageStatus,
  label: string,
  reason: string,
  safeSummary: string,
  warnings: readonly string[] = [],
  blockedReasons: readonly string[] = [],
): AvanzaHeadlessExecutionOrchestrationStageResult {
  return {
    blockedReasons: [...blockedReasons],
    label,
    reason,
    safeSummary,
    stage,
    status,
    warnings: [...warnings],
  };
}

function modeForSelector(
  mode: AvanzaHeadlessExecutionOrchestrationMode,
): AvanzaHeadlessExecutionContractSelectorMode {
  return mode;
}

function statusDetails(status: AvanzaHeadlessExecutionOrchestrationStatus) {
  if (status === "ready_orchestration") {
    return {
      label: "Headless execution orchestration ready",
      reason:
        "Contract-to-selector-to-plan-to-session lifecycle is modeled without execution.",
    };
  }
  if (status === "no_candidates") {
    return {
      label: "No orchestration candidates",
      reason: "No recommendation or live-position inputs were available.",
    };
  }
  if (status === "all_candidates_blocked") {
    return {
      label: "All orchestration candidates blocked",
      reason: "Candidates were available, but none were eligible.",
    };
  }
  if (status === "selector_blocked") {
    return {
      label: "Selector blocked orchestration",
      reason: "Selector safety gates prevented a selected contract.",
    };
  }
  if (status === "plan_blocked") {
    return {
      label: "Plan blocked orchestration",
      reason: "The selected contract could not become a ready headless plan.",
    };
  }
  if (status === "session_blocked") {
    return {
      label: "Session blocked orchestration",
      reason: "The session state machine blocked or rejected lifecycle setup.",
    };
  }
  if (status === "blocked") {
    return {
      label: "Headless orchestration blocked",
      reason: "Safety gates blocked the orchestration run.",
    };
  }

  return {
    label: "Headless orchestration unknown",
    reason: "The orchestration pipeline could not classify the input.",
  };
}

function statusForSelector(
  selectorResult: AvanzaHeadlessExecutionContractSelectorResult,
): AvanzaHeadlessExecutionOrchestrationStatus | undefined {
  if (selectorResult.status === "no_candidates") return "no_candidates";
  if (selectorResult.status === "all_candidates_blocked") {
    return "all_candidates_blocked";
  }
  if (selectorResult.status === "blocked") return "selector_blocked";
  if (selectorResult.status !== "selected") return "unknown";

  return undefined;
}

function nextStepForPlan(
  plan: AvanzaHeadlessAgentPlan,
): AvanzaHeadlessExecutionOrchestrationNextStep {
  if (plan.status !== "ready_plan") return "blocked";
  if (!plan.loginKnown) return "plan_login_if_needed";

  return "plan_instrument_search";
}

function sessionEventsForPlan(
  plan: AvanzaHeadlessAgentPlan,
): AvanzaHeadlessExecutionSessionEvent[] {
  const events: AvanzaHeadlessExecutionSessionEvent[] = [
    {
      actor: "system",
      reason: "Headless orchestration session created.",
      type: "create_session",
      userVisible: false,
    },
    {
      actor: "system",
      reason: "Selected contract validated by orchestration pipeline.",
      type: "validate_contract",
      userVisible: false,
    },
    {
      actor: "system",
      reason: "Headless agent plan attached to orchestration session.",
      type: "attach_plan",
      userVisible: false,
    },
  ];

  if (!plan.loginKnown) {
    events.push({
      actor: "system",
      reason: "Login requirement is modeled; no credential access occurs.",
      type: "require_login",
      userVisible: false,
    });
  } else {
    events.push({
      actor: "system",
      reason: "Login readiness is modeled; no browser automation occurs.",
      type: "mark_login_ready",
      userVisible: false,
    });
  }

  return events;
}

function reportForBlockedStage(input: {
  blockedReasons: readonly string[];
  createdAt: string;
  mode: AvanzaHeadlessExecutionOrchestrationMode;
  orchestrationId: string;
  plan?: AvanzaHeadlessAgentPlan;
  selectorResult?: AvanzaHeadlessExecutionContractSelectorResult;
  stages: readonly AvanzaHeadlessExecutionOrchestrationStageResult[];
  status: AvanzaHeadlessExecutionOrchestrationStatus;
  warnings: readonly string[];
}): AvanzaHeadlessExecutionOrchestrationReport {
  const details = statusDetails(input.status);

  return {
    agentReadableSummary:
      "Headless orchestration did not produce a ready session. No execution, API, browser, credential, order, final click, or Supabase behavior is allowed.",
    blockedReasons: [...input.blockedReasons],
    createdAt: input.createdAt,
    label: details.label,
    mode: input.mode,
    nextTheoreticalAgentStep: "blocked",
    orchestrationId: input.orchestrationId,
    plan: input.plan,
    reason: details.reason,
    safetyFlags: avanzaHeadlessExecutionOrchestrationSafetyFlags,
    selectorResult: input.selectorResult,
    stages: [...input.stages],
    status: input.status,
    warnings: [...input.warnings],
  };
}

export function runAvanzaHeadlessExecutionOrchestrationPipeline(
  input: AvanzaHeadlessExecutionOrchestrationInput = {},
): AvanzaHeadlessExecutionOrchestrationReport {
  const createdAt = input.now?.trim() || defaultCreatedAt;
  const mode = input.mode ?? "semi_auto";
  const orchestrationId =
    input.orchestrationId?.trim() || `headless-orchestration-${createdAt}`;
  const profileReady = input.profileReady === true;
  const loginKnown = input.loginKnown === true;
  const stages: AvanzaHeadlessExecutionOrchestrationStageResult[] = [];
  const warnings = [
    "Orchestration pipeline is headless and UI-hidden.",
    "Contract-to-selector-to-plan-to-session modeled only.",
    "Final KÖP/SÄLJ remains human-only.",
    "Agent final click is forbidden.",
    "BankID automation and bypass remain forbidden.",
    "No browser automation now, API call, fetch, polling, credential access, order submission, or Supabase write.",
  ];

  stages.push(
    stageResult(
      "build_contracts",
      "completed",
      "Build headless contracts",
      "Recommendation and live-position inputs are normalized by the selector contract builder.",
      "Contract inputs remain explicit and UI-hidden.",
      [],
      [],
    ),
  );

  const selectorResult = selectNextAvanzaHeadlessExecutionContract({
    allowEntries: input.allowEntries,
    allowExits: input.allowExits,
    livePositions: input.livePositions,
    maxCandidates: input.maxCandidates,
    mode: modeForSelector(mode),
    now: createdAt,
    profileReady,
    recommendations: input.recommendations,
  });

  const selectorStatus = statusForSelector(selectorResult);
  stages.push(
    stageResult(
      "select_contract",
      selectorStatus ? "blocked" : "completed",
      selectorResult.label,
      selectorResult.reason,
      selectorResult.agentReadableSummary,
      selectorResult.warnings,
      selectorResult.blockedReasons,
    ),
  );

  if (selectorStatus) {
    return reportForBlockedStage({
      blockedReasons: selectorResult.blockedReasons,
      createdAt,
      mode,
      orchestrationId,
      selectorResult,
      stages,
      status: selectorStatus,
      warnings: [...warnings, ...selectorResult.warnings],
    });
  }

  const selectedContract = selectorResult.selectedCandidate?.contract;
  const plan = buildAvanzaHeadlessAgentPlan({
    customerType: input.customerType ?? "unknown",
    loginKnown,
    mode: modeForSelector(mode),
    now: createdAt,
    profileReady,
    selectorResult,
    selectedContract,
  });

  const planBlocked = input.forcePlanBlocked === true || plan.status !== "ready_plan";
  stages.push(
    stageResult(
      "build_plan",
      planBlocked ? "blocked" : "completed",
      plan.label,
      plan.reason,
      plan.agentReadableSummary,
      plan.warnings,
      plan.blockedReasons,
    ),
  );

  if (planBlocked) {
    return {
      ...reportForBlockedStage({
        blockedReasons: [
          ...plan.blockedReasons,
          ...(input.forcePlanBlocked
            ? ["Fixture forced plan_blocked orchestration state."]
            : []),
        ],
        createdAt,
        mode,
        orchestrationId,
        plan,
        selectorResult,
        stages,
        status: "plan_blocked",
        warnings: [...warnings, ...plan.warnings],
      }),
      selectedContractId: selectedContract?.contractId,
      selectedIntent: selectedContract?.intent,
      selectedLimitPrice: selectedContract?.limitPrice,
      selectedQuantity: selectedContract?.quantity,
      selectedSide: selectedContract?.side,
      selectedSource: selectedContract?.source,
      selectedTicker: selectedContract?.ticker,
    };
  }

  stages.push(
    stageResult(
      "create_session",
      "completed",
      "Create headless execution session",
      "Session is initialized by the state machine only.",
      "No browser, API, credential, or order behavior is invoked.",
    ),
  );

  const sessionResult = reduceAvanzaHeadlessExecutionSessionEvents(
    sessionEventsForPlan(plan),
    {
      mode: modeForSelector(mode),
      now: createdAt,
      plan,
      sessionId: `session-${orchestrationId}`,
    },
  );
  const sessionBlocked =
    input.forceSessionBlocked === true ||
    sessionResult.status === "blocked" ||
    !sessionResult.accepted;

  stages.push(
    stageResult(
      "attach_plan_to_session",
      sessionBlocked ? "blocked" : "completed",
      "Attach plan to session lifecycle",
      sessionResult.reason,
      `Session status is ${sessionResult.session.status}.`,
      sessionResult.warnings,
      sessionResult.blockedReasons,
    ),
  );
  stages.push(
    stageResult(
      "advance_to_plan_ready",
      sessionBlocked ? "blocked" : "completed",
      "Advance to plan-ready lifecycle",
      "The default pipeline stops at plan_ready, login_required, or login_ready.",
      `Session initialized to ${sessionResult.session.status}.`,
      sessionResult.warnings,
      sessionResult.blockedReasons,
    ),
  );

  if (sessionBlocked) {
    return {
      ...reportForBlockedStage({
        blockedReasons: [
          ...sessionResult.blockedReasons,
          ...(input.forceSessionBlocked
            ? ["Fixture forced session_blocked orchestration state."]
            : []),
        ],
        createdAt,
        mode,
        orchestrationId,
        plan,
        selectorResult,
        stages,
        status: "session_blocked",
        warnings: [...warnings, ...sessionResult.warnings],
      }),
      selectedContractId: selectedContract?.contractId,
      selectedIntent: selectedContract?.intent,
      selectedLimitPrice: selectedContract?.limitPrice,
      selectedQuantity: selectedContract?.quantity,
      selectedSide: selectedContract?.side,
      selectedSource: selectedContract?.source,
      selectedTicker: selectedContract?.ticker,
      session: sessionResult.session,
    };
  }

  stages.push(
    stageResult(
      "complete_model_run",
      "completed",
      "Complete model-only orchestration run",
      "Pipeline reached the initialized headless session lifecycle state.",
      "Future agent session behavior is modeled without visual UI or active broker behavior.",
    ),
  );

  const details = statusDetails("ready_orchestration");
  const nextTheoreticalAgentStep = nextStepForPlan(plan);

  return {
    agentReadableSummary: `Headless orchestration selected ${selectedContract?.contractId} and created ${sessionResult.session.sessionId}. Next theoretical agent step: ${nextTheoreticalAgentStep}. This is UI-hidden and non-executing.`,
    blockedReasons: [],
    createdAt,
    label: details.label,
    mode,
    nextTheoreticalAgentStep,
    orchestrationId,
    plan,
    reason: details.reason,
    safetyFlags: avanzaHeadlessExecutionOrchestrationSafetyFlags,
    selectedContractId: selectedContract?.contractId,
    selectedIntent: selectedContract?.intent,
    selectedLimitPrice: selectedContract?.limitPrice,
    selectedQuantity: selectedContract?.quantity,
    selectedSide: selectedContract?.side,
    selectedSource: selectedContract?.source,
    selectedTicker: selectedContract?.ticker,
    selectorResult,
    session: sessionResult.session,
    stages,
    status: "ready_orchestration",
    warnings: [...warnings, ...selectorResult.warnings, ...plan.warnings],
  };
}
