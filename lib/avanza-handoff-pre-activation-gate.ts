import type {
  AvanzaBridgeReadinessSummary,
} from "@/lib/avanza-bridge-readiness-checklist";
import type {
  AvanzaHandoffSafetyBoundarySummary,
} from "@/lib/avanza-handoff-safety-boundary-summary";
import type {
  AvanzaHandoffPreviewSourceModeModel,
} from "@/lib/avanza-handoff-preview-source-mode";
import type {
  AvanzaSelectedRecommendationHandoffContract,
  AvanzaSelectedRecommendationHandoffEligibilitySummary,
} from "@/lib/avanza-selected-recommendation-handoff-contract";

export type AvanzaHandoffPreActivationGateStatus =
  | "locked"
  | "blocked"
  | "advisory_only"
  | "candidate_for_dev_enablement";

export type AvanzaHandoffPreActivationGateSeverity =
  | "neutral"
  | "warning"
  | "danger"
  | "success";

export type AvanzaHandoffPreActivationGate = {
  advisories: string[];
  blockers: string[];
  gateStatus: AvanzaHandoffPreActivationGateStatus;
  label: string;
  reasons: string[];
  requiredNextSteps: string[];
  severity: AvanzaHandoffPreActivationGateSeverity;
};

export type AvanzaHandoffPreActivationSourceModeInput =
  Omit<
    AvanzaHandoffPreviewSourceModeModel,
    | "activeMode"
    | "bridgeCallsAllowed"
    | "executionAllowed"
    | "realSelectedRecommendationStateAllowed"
    | "selectedRecommendationWiring"
    | "tradeUiLocalhostFetchAllowed"
  > & {
    activeMode:
      | AvanzaHandoffPreviewSourceModeModel["activeMode"]
      | "future_dev_only_candidate";
    bridgeCallsAllowed: boolean;
    executionAllowed: boolean;
    realSelectedRecommendationStateAllowed: boolean;
    selectedRecommendationWiring: "disabled" | "future" | "future_dev_only";
    tradeUiLocalhostFetchAllowed: boolean;
  };

export type BuildAvanzaHandoffPreActivationGateInput = {
  contract: AvanzaSelectedRecommendationHandoffContract;
  eligibilitySummary: AvanzaSelectedRecommendationHandoffEligibilitySummary;
  readinessSummary: AvanzaBridgeReadinessSummary;
  safetyBoundarySummary: AvanzaHandoffSafetyBoundarySummary;
  sourceMode: AvanzaHandoffPreActivationSourceModeInput;
};

function itemLabels(
  contract: AvanzaSelectedRecommendationHandoffContract,
  status: "blocked" | "advisory",
) {
  return contract.items
    .filter((item) => item.status === status)
    .map((item) => item.label);
}

export function buildAvanzaHandoffPreActivationGate({
  contract,
  eligibilitySummary,
  readinessSummary,
  safetyBoundarySummary,
  sourceMode,
}: BuildAvanzaHandoffPreActivationGateInput): AvanzaHandoffPreActivationGate {
  const reasons: string[] = [];
  const blockers = itemLabels(contract, "blocked");
  const advisories = itemLabels(contract, "advisory");

  if (sourceMode.activeMode === "static_fixture") {
    reasons.push("Static fixture source");
  }

  if (
    sourceMode.selectedRecommendationWiring === "disabled" ||
    sourceMode.selectedRecommendationWiring === "future"
  ) {
    reasons.push("Selected recommendation wiring disabled");
  }

  if (!sourceMode.realSelectedRecommendationStateAllowed) {
    reasons.push("Real selected recommendation state is not allowed");
  }

  if (!sourceMode.bridgeCallsAllowed) {
    reasons.push("Bridge calls are not allowed");
  }

  if (!sourceMode.tradeUiLocalhostFetchAllowed) {
    reasons.push("Trade UI local status fetch is not allowed");
  }

  if (!sourceMode.executionAllowed) {
    reasons.push("Execution is not allowed");
  }

  if (contract.previewOnly) {
    reasons.push("Preview-only contract");
  }

  if (contract.totalReadStatus === "unresolved_advisory") {
    advisories.push("Total-read unresolved/advisory");
  }

  if (eligibilitySummary.status === "advisory_gaps") {
    advisories.push("Eligibility summary has advisory gaps");
  }

  if (readinessSummary.status !== "ready_for_read_only_observation") {
    advisories.push(`Read-only readiness is ${readinessSummary.status}`);
  }

  for (const boundary of safetyBoundarySummary.boundaries) {
    if (boundary.status === "advisory") {
      advisories.push(boundary.label);
    }
  }

  const uniqueReasons = [...new Set(reasons)];
  const uniqueBlockers = [...new Set(blockers)];
  const uniqueAdvisories = [...new Set(advisories)];
  const requiredNextSteps = [
    "Keep preview-only UI disabled",
    "Add separate dev-only enablement design before any active handoff",
    "Keep total-read unresolved/advisory outside execution readiness",
    "Keep manual Avanza review as the boundary",
  ];

  if (uniqueReasons.length > 0) {
    return {
      advisories: uniqueAdvisories,
      blockers: uniqueBlockers,
      gateStatus: "locked",
      label: "Pre-activation gate: Locked",
      reasons: uniqueReasons,
      requiredNextSteps,
      severity: "neutral",
    };
  }

  if (uniqueBlockers.length > 0) {
    return {
      advisories: uniqueAdvisories,
      blockers: uniqueBlockers,
      gateStatus: "blocked",
      label: "Pre-activation gate: Blocked",
      reasons: ["Selected recommendation contract has blocked items"],
      requiredNextSteps,
      severity: "danger",
    };
  }

  if (uniqueAdvisories.length > 0) {
    return {
      advisories: uniqueAdvisories,
      blockers: uniqueBlockers,
      gateStatus: "advisory_only",
      label: "Pre-activation gate: Advisory only",
      reasons: ["Only advisory issues remain; this is not production readiness"],
      requiredNextSteps,
      severity: "warning",
    };
  }

  return {
    advisories: uniqueAdvisories,
    blockers: uniqueBlockers,
    gateStatus: "candidate_for_dev_enablement",
    label: "Pre-activation gate: Candidate for dev enablement",
    reasons: ["Future dev-only candidate; not production ready"],
    requiredNextSteps,
    severity: "success",
  };
}
