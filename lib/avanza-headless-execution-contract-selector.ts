import {
  buildAvanzaHeadlessExecutionContract,
  type AvanzaHeadlessExecutionContract,
  type AvanzaHeadlessExecutionContractInput,
  type AvanzaHeadlessExecutionContractIntent,
  type AvanzaHeadlessExecutionContractSource,
} from "./avanza-headless-execution-data-contract";

export type AvanzaHeadlessExecutionContractSelectorStatus =
  | "selected"
  | "no_candidates"
  | "all_candidates_blocked"
  | "blocked"
  | "unknown";

export type AvanzaHeadlessExecutionContractCandidateStatus =
  | "eligible"
  | "blocked"
  | "incomplete"
  | "unsafe"
  | "unknown";

export type AvanzaHeadlessExecutionContractSelectionReason =
  | "stop_loss_exit_priority"
  | "target_exit_priority"
  | "exit_over_entry"
  | "entry_buy_ready"
  | "highest_confidence"
  | "best_reward_risk"
  | "newest_candidate"
  | "blocked_candidates_only"
  | "no_valid_candidates"
  | "unknown";

export type AvanzaHeadlessExecutionContractSelectorMode =
  | "semi_auto"
  | "automatic_forbidden"
  | "review_only";

export type AvanzaHeadlessExecutionContractSelectorInput = {
  recommendations?: readonly (
    | AvanzaHeadlessExecutionContractInput
    | AvanzaHeadlessExecutionContract
  )[];
  livePositions?: readonly (
    | AvanzaHeadlessExecutionContractInput
    | AvanzaHeadlessExecutionContract
  )[];
  now?: string;
  maxCandidates?: number;
  profileReady?: boolean;
  mode?: AvanzaHeadlessExecutionContractSelectorMode;
  allowEntries?: boolean;
  allowExits?: boolean;
};

export type AvanzaHeadlessExecutionContractSelectorSafetyFlags = {
  selectorOnly: true;
  headlessOnly: true;
  visibleInUi: false;
  canStartHandoff: false;
  canPrepareOrder: false;
  canRunSmokeTestFromUi: false;
  canCallApiRoute: false;
  canFetch: false;
  canPoll: false;
  canUseBrowserAutomation: false;
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

export type AvanzaHeadlessExecutionContractCandidate = {
  candidateId: string;
  source: AvanzaHeadlessExecutionContractSource;
  intent: AvanzaHeadlessExecutionContractIntent;
  contract: AvanzaHeadlessExecutionContract;
  status: AvanzaHeadlessExecutionContractCandidateStatus;
  priority: number;
  priorityReason: AvanzaHeadlessExecutionContractSelectionReason;
  blockers: string[];
  warnings: string[];
  sortableConfidence?: number;
  sortableRewardRisk?: number;
  createdAt?: string;
};

export type AvanzaHeadlessExecutionContractSelectorResult = {
  selectorId: string;
  createdAt: string;
  status: AvanzaHeadlessExecutionContractSelectorStatus;
  label: string;
  reason: string;
  selectedCandidate?: AvanzaHeadlessExecutionContractCandidate;
  candidates: AvanzaHeadlessExecutionContractCandidate[];
  eligibleCount: number;
  blockedCount: number;
  entryCount: number;
  exitCount: number;
  stopLossExitCount: number;
  targetExitCount: number;
  warnings: string[];
  blockedReasons: string[];
  agentReadableSummary: string;
  safetyFlags: AvanzaHeadlessExecutionContractSelectorSafetyFlags;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";

export const avanzaHeadlessExecutionContractSelectorSafetyFlags:
  AvanzaHeadlessExecutionContractSelectorSafetyFlags = {
    selectorOnly: true,
    headlessOnly: true,
    visibleInUi: false,
    canStartHandoff: false,
    canPrepareOrder: false,
    canRunSmokeTestFromUi: false,
    canCallApiRoute: false,
    canFetch: false,
    canPoll: false,
    canUseBrowserAutomation: false,
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

function isBuiltContract(
  value: AvanzaHeadlessExecutionContractInput | AvanzaHeadlessExecutionContract,
): value is AvanzaHeadlessExecutionContract {
  return (
    typeof value === "object" &&
    value !== null &&
    "contractId" in value &&
    "status" in value &&
    "auditMetadata" in value &&
    "safetyFlags" in value
  );
}

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function normalizeContract(
  input: AvanzaHeadlessExecutionContractInput | AvanzaHeadlessExecutionContract,
  defaults: AvanzaHeadlessExecutionContractInput,
) {
  if (isBuiltContract(input)) return input;

  return buildAvanzaHeadlessExecutionContract({
    ...defaults,
    ...input,
  });
}

function hasUnsafeSafetyFlags(contract: AvanzaHeadlessExecutionContract) {
  return (
    contract.safetyFlags.visibleInUi ||
    contract.safetyFlags.canStartHandoff ||
    contract.safetyFlags.canPrepareOrder ||
    contract.safetyFlags.canRunSmokeTestFromUi ||
    contract.safetyFlags.canCallApiRoute ||
    contract.safetyFlags.canFetch ||
    contract.safetyFlags.canPoll ||
    contract.safetyFlags.canUseBrowserAutomation ||
    contract.safetyFlags.canAccessCredentials ||
    contract.safetyFlags.canReadCookies ||
    contract.safetyFlags.canExportSession ||
    contract.safetyFlags.canAutomateBankId ||
    contract.safetyFlags.canSubmitOrder ||
    contract.safetyFlags.canClickFinalBuy ||
    contract.safetyFlags.canClickFinalSell ||
    contract.safetyFlags.canWriteSupabase ||
    contract.safetyFlags.canClaimProductionReady ||
    contract.safetyFlags.controlsEnabled ||
    !contract.safetyFlags.gateLocked ||
    !contract.safetyFlags.userMustConfirm ||
    !contract.safetyFlags.finalHumanClickRequired
  );
}

function exitKind(contract: AvanzaHeadlessExecutionContract) {
  if (contract.intent !== "exit_sell") return "none";
  const limitPrice = positiveNumber(contract.limitPrice);
  const stopLoss = positiveNumber(contract.stopLoss);
  const targetPrice = positiveNumber(contract.targetPrice);
  const text = [...contract.warnings, ...contract.blockers]
    .join(" ")
    .toLowerCase();

  if (text.includes("stop-loss") || text.includes("stop loss")) return "stop_loss";
  if (text.includes("target")) return "target";
  if (limitPrice && stopLoss && limitPrice <= stopLoss) return "stop_loss";
  if (limitPrice && targetPrice && limitPrice >= targetPrice) return "target";

  return "exit";
}

function priorityForContract(contract: AvanzaHeadlessExecutionContract) {
  const kind = exitKind(contract);

  if (kind === "stop_loss") {
    return { priority: 500, reason: "stop_loss_exit_priority" as const };
  }
  if (kind === "target") {
    return { priority: 400, reason: "target_exit_priority" as const };
  }
  if (contract.intent === "exit_sell") {
    return { priority: 300, reason: "exit_over_entry" as const };
  }
  if (contract.intent === "entry_buy") {
    return { priority: 100, reason: "entry_buy_ready" as const };
  }

  return { priority: 0, reason: "unknown" as const };
}

function candidateStatusForContract(
  contract: AvanzaHeadlessExecutionContract,
  mode: AvanzaHeadlessExecutionContractSelectorMode,
  allowEntries: boolean,
  allowExits: boolean,
): {
  status: AvanzaHeadlessExecutionContractCandidateStatus;
  blockers: string[];
} {
  const blockers = [...contract.blockers];

  if (mode === "automatic_forbidden") {
    blockers.push("Automatic execution mode is forbidden.");
  }
  if (!allowEntries && contract.intent === "entry_buy") {
    blockers.push("Entry BUY candidates are disabled for this selector run.");
  }
  if (!allowExits && contract.intent === "exit_sell") {
    blockers.push("Exit SELL candidates are disabled for this selector run.");
  }
  if (hasUnsafeSafetyFlags(contract)) {
    blockers.push("Candidate contains unsafe safety flags.");
    return { blockers, status: "unsafe" };
  }
  if (contract.orderType === "market_forbidden") {
    blockers.push("Market order candidate is blocked.");
    return { blockers, status: "unsafe" };
  }
  if (
    contract.status === "missing_ticker" ||
    contract.status === "missing_side" ||
    contract.status === "missing_quantity" ||
    contract.status === "missing_limit_price" ||
    contract.status === "incomplete_trade_package" ||
    contract.status === "unknown"
  ) {
    blockers.push(...contract.missingFields.map((field) => `Missing ${field}.`));
    return { blockers, status: "incomplete" };
  }
  if (contract.status === "blocked" || blockers.length > 0) {
    return { blockers, status: "blocked" };
  }
  if (!contract.canBeUsedByAgentLater) {
    blockers.push("Contract cannot be used by a future agent.");
    return { blockers, status: "blocked" };
  }
  if (contract.status === "ready_headless" || contract.status === "local_dev_only") {
    return { blockers, status: "eligible" };
  }

  return { blockers, status: "unknown" };
}

function buildCandidate(
  contract: AvanzaHeadlessExecutionContract,
  index: number,
  mode: AvanzaHeadlessExecutionContractSelectorMode,
  allowEntries: boolean,
  allowExits: boolean,
): AvanzaHeadlessExecutionContractCandidate {
  const priority = priorityForContract(contract);
  const status = candidateStatusForContract(contract, mode, allowEntries, allowExits);

  return {
    blockers: status.blockers,
    candidateId: `candidate-${index + 1}-${contract.contractId}`,
    contract,
    createdAt: contract.createdAt,
    intent: contract.intent,
    priority: status.status === "eligible" ? priority.priority : 0,
    priorityReason: status.status === "eligible" ? priority.reason : "unknown",
    sortableConfidence: positiveNumber(contract.confidence),
    sortableRewardRisk: positiveNumber(contract.rewardRisk),
    source: contract.source,
    status: status.status,
    warnings: contract.warnings,
  };
}

function sortCandidates(
  left: AvanzaHeadlessExecutionContractCandidate,
  right: AvanzaHeadlessExecutionContractCandidate,
) {
  if (right.priority !== left.priority) return right.priority - left.priority;
  if ((right.sortableConfidence ?? 0) !== (left.sortableConfidence ?? 0)) {
    return (right.sortableConfidence ?? 0) - (left.sortableConfidence ?? 0);
  }
  if ((right.sortableRewardRisk ?? 0) !== (left.sortableRewardRisk ?? 0)) {
    return (right.sortableRewardRisk ?? 0) - (left.sortableRewardRisk ?? 0);
  }

  return (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
}

function selectionReasonForTieBreak(
  selected: AvanzaHeadlessExecutionContractCandidate,
  eligible: readonly AvanzaHeadlessExecutionContractCandidate[],
) {
  if (
    selected.priorityReason === "entry_buy_ready" &&
    eligible.filter((candidate) => candidate.intent === "entry_buy").length > 1
  ) {
    const confidences = eligible
      .map((candidate) => candidate.sortableConfidence ?? 0)
      .sort((left, right) => right - left);
    const maxConfidence = confidences[0] ?? 0;
    const secondConfidence = confidences[1] ?? 0;
    if (
      (selected.sortableConfidence ?? 0) === maxConfidence &&
      maxConfidence > secondConfidence
    ) {
      return "highest_confidence" as const;
    }
    const rewardRisks = eligible
      .map((candidate) => candidate.sortableRewardRisk ?? 0)
      .sort((left, right) => right - left);
    const maxRewardRisk = rewardRisks[0] ?? 0;
    const secondRewardRisk = rewardRisks[1] ?? 0;
    if (
      (selected.sortableRewardRisk ?? 0) === maxRewardRisk &&
      maxRewardRisk > secondRewardRisk
    ) {
      return "best_reward_risk" as const;
    }

    return "newest_candidate" as const;
  }

  return selected.priorityReason;
}

function resultDetails(status: AvanzaHeadlessExecutionContractSelectorStatus) {
  if (status === "selected") {
    return {
      label: "Headless execution contract selected",
      reason: "A UI-hidden candidate is available for future agent consideration.",
    };
  }
  if (status === "no_candidates") {
    return {
      label: "No headless execution candidates",
      reason: "No recommendation or live-position contracts were provided.",
    };
  }
  if (status === "all_candidates_blocked") {
    return {
      label: "All headless execution candidates blocked",
      reason: "Candidates exist, but none are eligible for future agent consideration.",
    };
  }
  if (status === "blocked") {
    return {
      label: "Headless selector blocked",
      reason: "Selector mode or safety gates block selection.",
    };
  }

  return {
    label: "Headless selector unknown",
    reason: "Selector input could not be classified.",
  };
}

export function selectNextAvanzaHeadlessExecutionContract(
  input: AvanzaHeadlessExecutionContractSelectorInput = {},
): AvanzaHeadlessExecutionContractSelectorResult {
  const createdAt = input.now?.trim() || defaultCreatedAt;
  const mode = input.mode ?? "semi_auto";
  const allowEntries = input.allowEntries !== false;
  const allowExits = input.allowExits !== false;
  const profileReady = input.profileReady === true;
  const maxCandidates =
    typeof input.maxCandidates === "number" && input.maxCandidates > 0
      ? Math.floor(input.maxCandidates)
      : undefined;

  const recommendationContracts = (input.recommendations ?? []).map((item) =>
    normalizeContract(item, {
      intent: "entry_buy",
      orderType: "limit",
      profileReady,
      source: "recommendation",
      now: createdAt,
    }),
  );
  const livePositionContracts = (input.livePositions ?? []).map((item) =>
    normalizeContract(item, {
      intent: "exit_sell",
      orderType: "limit",
      profileReady,
      source: "live_position",
      now: createdAt,
    }),
  );
  const contracts = [...recommendationContracts, ...livePositionContracts].slice(
    0,
    maxCandidates,
  );
  const candidates = contracts.map((contract, index) =>
    buildCandidate(contract, index, mode, allowEntries, allowExits),
  );
  const eligibleCandidates = candidates
    .filter((candidate) => candidate.status === "eligible")
    .sort(sortCandidates);
  const selectedCandidate = eligibleCandidates[0];
  const selectionReason = selectedCandidate
    ? selectionReasonForTieBreak(selectedCandidate, eligibleCandidates)
    : undefined;
  const status: AvanzaHeadlessExecutionContractSelectorStatus =
    mode === "automatic_forbidden"
      ? "blocked"
      : candidates.length === 0
        ? "no_candidates"
        : selectedCandidate
          ? "selected"
          : "all_candidates_blocked";
  const details = resultDetails(status);
  const blockedReasons = candidates.flatMap((candidate) => candidate.blockers);
  const warnings = [
    ...candidates.flatMap((candidate) => candidate.warnings),
    "Selector is headless and UI-hidden.",
    "Final KÖP/SÄLJ remains human-only.",
  ];

  return {
    agentReadableSummary: selectedCandidate
      ? `Selected ${selectedCandidate.contract.contractId} because ${selectionReason}. This is headless only and cannot start handoff or prepare an order.`
      : "No eligible headless execution contract selected. This selector remains headless only.",
    blockedCount: candidates.filter((candidate) => candidate.status !== "eligible")
      .length,
    blockedReasons,
    candidates,
    createdAt,
    eligibleCount: eligibleCandidates.length,
    entryCount: candidates.filter((candidate) => candidate.intent === "entry_buy")
      .length,
    exitCount: candidates.filter((candidate) => candidate.intent === "exit_sell")
      .length,
    label: details.label,
    reason: details.reason,
    safetyFlags: avanzaHeadlessExecutionContractSelectorSafetyFlags,
    selectedCandidate: selectedCandidate
      ? {
          ...selectedCandidate,
          priorityReason: selectionReason ?? selectedCandidate.priorityReason,
        }
      : undefined,
    selectorId: `selector-${createdAt}`,
    status,
    stopLossExitCount: candidates.filter(
      (candidate) => exitKind(candidate.contract) === "stop_loss",
    ).length,
    targetExitCount: candidates.filter(
      (candidate) => exitKind(candidate.contract) === "target",
    ).length,
    warnings,
  };
}
