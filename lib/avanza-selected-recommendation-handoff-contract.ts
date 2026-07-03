import type {
  AvanzaBridgeReadinessSummary,
} from "@/lib/avanza-bridge-readiness-checklist";
import {
  mapTureRecommendationToAvanzaHandoffInput,
  type TureRecommendationHandoffSource,
} from "@/lib/avanza-ture-recommendation-handoff-mapper";

export type AvanzaSelectedRecommendationHandoffContractStatus =
  | "preview_ready"
  | "blocked"
  | "advisory_only";

export type AvanzaSelectedRecommendationHandoffContractItemStatus =
  | "ready"
  | "blocked"
  | "advisory";

export type AvanzaSelectedRecommendationHandoffContractItem = {
  detail?: string;
  id: string;
  label: string;
  status: AvanzaSelectedRecommendationHandoffContractItemStatus;
};

export type AvanzaSelectedRecommendationHandoffContract = {
  accountLabelConfigured: boolean;
  items: AvanzaSelectedRecommendationHandoffContractItem[];
  orderMode: "Avancerad/Limit";
  previewOnly: true;
  readinessSummaryAvailable: boolean;
  selectedRecommendationId: string | null;
  status: AvanzaSelectedRecommendationHandoffContractStatus;
  totalReadStatus: "unresolved_advisory";
};

export type AvanzaSelectedRecommendationHandoffEligibilitySummaryStatus =
  | "preview_ready"
  | "blocked"
  | "advisory_gaps"
  | "not_enabled"
  | "unknown";

export type AvanzaSelectedRecommendationHandoffEligibilitySummarySeverity =
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export type AvanzaSelectedRecommendationHandoffEligibilitySummary = {
  advisoryCount: number;
  blockedCount: number;
  label: string;
  readyCount: number;
  severity: AvanzaSelectedRecommendationHandoffEligibilitySummarySeverity;
  shortCopy: string;
  status: AvanzaSelectedRecommendationHandoffEligibilitySummaryStatus;
  unknownCount: number;
};

export type BuildAvanzaSelectedRecommendationHandoffContractInput = {
  accountDisplayName?: string | null;
  orderMode?: "Avancerad/Limit" | string | null;
  readinessSummary?: AvanzaBridgeReadinessSummary | null;
  selectedRecommendation?: TureRecommendationHandoffSource | null;
};

function isReady(item: AvanzaSelectedRecommendationHandoffContractItem) {
  return item.status === "ready";
}

function hasValue(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

export function buildAvanzaSelectedRecommendationHandoffContract({
  accountDisplayName,
  orderMode,
  readinessSummary,
  selectedRecommendation,
}: BuildAvanzaSelectedRecommendationHandoffContractInput): AvanzaSelectedRecommendationHandoffContract {
  const mappedInput =
    selectedRecommendation && readinessSummary
      ? mapTureRecommendationToAvanzaHandoffInput(selectedRecommendation, {
          accountDisplayName,
          orderMode,
          readinessSummary,
        })
      : null;
  const selectedRecommendationId = mappedInput?.recommendationId ?? null;
  const accountLabelConfigured = hasValue(accountDisplayName);
  const readinessSummaryAvailable = readinessSummary != null;
  const orderModeReady = (orderMode ?? "Avancerad/Limit") === "Avancerad/Limit";
  const items: AvanzaSelectedRecommendationHandoffContractItem[] = [
    {
      id: "selected_recommendation_present",
      label: "Selected recommendation present",
      status: selectedRecommendation ? "ready" : "blocked",
    },
    {
      id: "selected_recommendation_id_present",
      label: "Selected recommendation id present",
      status: selectedRecommendationId ? "ready" : "blocked",
    },
    {
      id: "ticker_present",
      label: "Ticker present",
      status: mappedInput?.ticker ? "ready" : "blocked",
    },
    {
      id: "buy_side_only",
      label: "Buy side only",
      status: mappedInput?.side === "buy" ? "ready" : "blocked",
    },
    {
      id: "quantity_or_position_size_present",
      label: "Quantity or position size present",
      status: mappedInput?.quantity ? "ready" : "advisory",
      detail: mappedInput?.quantity
        ? undefined
        : "Quantity can remain an advisory preview gap.",
    },
    {
      id: "entry_or_limit_price_present",
      label: "Entry or limit price present",
      status: mappedInput?.limitPrice ? "ready" : "advisory",
      detail: mappedInput?.limitPrice
        ? undefined
        : "Limit price can remain an advisory preview gap.",
    },
    {
      id: "readiness_summary_available",
      label: "Readiness summary available",
      status: readinessSummaryAvailable ? "ready" : "blocked",
    },
    {
      id: "account_label_configured",
      label: "Account label configured",
      status: accountLabelConfigured ? "ready" : "blocked",
    },
    {
      id: "advanced_limit_mode",
      label: "Order mode Avancerad/Limit",
      status: orderModeReady ? "ready" : "blocked",
    },
    {
      id: "total_read_unresolved_advisory",
      label: "Total-read unresolved/advisory",
      status: "advisory",
    },
    {
      id: "preview_only_not_enabled",
      label: "Preview-only until explicitly enabled",
      status: "advisory",
    },
  ];
  const hasBlockedItems = items.some((item) => item.status === "blocked");
  const hasReadyCore =
    isReady(items[0]) &&
    isReady(items[1]) &&
    isReady(items[2]) &&
    isReady(items[3]) &&
    isReady(items[6]) &&
    isReady(items[7]) &&
    isReady(items[8]);

  return {
    accountLabelConfigured,
    items,
    orderMode: "Avancerad/Limit",
    previewOnly: true,
    readinessSummaryAvailable,
    selectedRecommendationId,
    status: hasBlockedItems
      ? "blocked"
      : hasReadyCore
        ? "preview_ready"
        : "advisory_only",
    totalReadStatus: "unresolved_advisory",
  };
}

export function summarizeAvanzaSelectedRecommendationHandoffContract(
  contract: AvanzaSelectedRecommendationHandoffContract,
): AvanzaSelectedRecommendationHandoffEligibilitySummary {
  const readyCount = contract.items.filter((item) => item.status === "ready").length;
  const blockedCount = contract.items.filter(
    (item) => item.status === "blocked",
  ).length;
  const advisoryCount = contract.items.filter(
    (item) => item.status === "advisory",
  ).length;
  const unknownCount = 0;
  const advisoryGapIds = new Set([
    "quantity_or_position_size_present",
    "entry_or_limit_price_present",
  ]);
  const hasAdvisoryGaps = contract.items.some(
    (item) => advisoryGapIds.has(item.id) && item.status === "advisory",
  );

  if (contract.items.length === 0) {
    return {
      advisoryCount,
      blockedCount,
      label: "Handoff eligibility unknown",
      readyCount,
      severity: "neutral",
      shortCopy:
        "Preview-only eligibility is unknown. This is not execution-ready and no order placement is enabled.",
      status: "unknown",
      unknownCount: 1,
    };
  }

  if (blockedCount > 0) {
    return {
      advisoryCount,
      blockedCount,
      label: "Handoff preview blocked",
      readyCount,
      severity: "danger",
      shortCopy:
        "Required selected-recommendation inputs are blocked. Preview-only remains not enabled, not execution-ready, and no order placement is possible.",
      status: "blocked",
      unknownCount,
    };
  }

  if (!contract.previewOnly) {
    return {
      advisoryCount,
      blockedCount,
      label: "Handoff not enabled",
      readyCount,
      severity: "neutral",
      shortCopy:
        "The handoff package is not enabled for execution. This summary is preview-only and no order placement is possible.",
      status: "not_enabled",
      unknownCount,
    };
  }

  if (hasAdvisoryGaps) {
    return {
      advisoryCount,
      blockedCount,
      label: "Handoff preview has advisory gaps",
      readyCount,
      severity: "warning",
      shortCopy:
        "Quantity or price still needs confirmation. Preview-only remains not enabled, not execution-ready, and no order placement is possible.",
      status: "advisory_gaps",
      unknownCount,
    };
  }

  return {
    advisoryCount,
    blockedCount,
    label: "Handoff preview ready",
    readyCount,
    severity: "warning",
    shortCopy:
      "Static selected-recommendation package is ready for preview only. It is not enabled, not execution-ready, and no order placement is possible.",
    status: "preview_ready",
    unknownCount,
  };
}
