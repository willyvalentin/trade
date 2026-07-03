import type { AvanzaLocalBridgeStatusSummary } from "@/lib/avanza-local-bridge-status";

export type AvanzaBridgeReadinessChecklistStatus =
  | "ready"
  | "blocked"
  | "advisory"
  | "unknown";

export type AvanzaBridgeReadinessChecklistItem = {
  detail?: string;
  id: string;
  label: string;
  status: AvanzaBridgeReadinessChecklistStatus;
};

export type AvanzaBridgeReadinessSummaryStatus =
  | "ready_for_read_only_observation"
  | "blocked"
  | "advisory_only"
  | "unknown";

export type AvanzaBridgeReadinessSummarySeverity =
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export type AvanzaBridgeReadinessSummary = {
  advisory_count: number;
  blocked_count: number;
  label: string;
  ready_count: number;
  severity: AvanzaBridgeReadinessSummarySeverity;
  shortCopy: string;
  status: AvanzaBridgeReadinessSummaryStatus;
  unknown_count: number;
};

export type AvanzaBridgeReadinessEvidenceInput = {
  accountVerified?: boolean | string | null;
  instrumentVerified?: boolean | string | null;
  orderFormVisible?: boolean | null;
  totalReadStatus?: "unresolved_advisory" | "verified" | "not_checked" | null;
};

export type AvanzaBridgeReadinessMilestoneInput = {
  coreFillAndStopProven?: boolean | null;
  stoppedBeforeReview?: boolean | null;
  totalReadStatus?: "unresolved_advisory" | null;
};

export type AvanzaBridgeReadinessRefreshMetadataInput = {
  endpointSummary: {
    health: "available" | "unavailable" | "unknown";
    preflight: "ready" | "blocked" | "unknown";
    selfCheck: "available" | "unavailable" | "unknown";
  };
};

export type BuildAvanzaBridgeReadinessChecklistInput = {
  evidence?: AvanzaBridgeReadinessEvidenceInput | null;
  featureEnabled: boolean;
  milestone?: AvanzaBridgeReadinessMilestoneInput | null;
  refreshMetadata: AvanzaBridgeReadinessRefreshMetadataInput;
  status: AvanzaLocalBridgeStatusSummary;
};

function verifiedValue(value: boolean | string | null | undefined) {
  if (typeof value === "boolean") {
    return value;
  }

  return typeof value === "string" && value.trim().length > 0;
}

function evidenceState({
  featureEnabled,
  preflightBlocked,
  preflightReady,
  verified,
}: {
  featureEnabled: boolean;
  preflightBlocked: boolean;
  preflightReady: boolean;
  verified: boolean;
}): AvanzaBridgeReadinessChecklistStatus {
  if (!featureEnabled) {
    return "unknown";
  }

  if (preflightReady && verified) {
    return "ready";
  }

  if (preflightBlocked) {
    return "blocked";
  }

  return "unknown";
}

const requiredReadOnlyObservationItemIds = new Set([
  "read_only_feature_flag_enabled",
  "local_bridge_reachable",
  "health_endpoint_available",
  "self_check_endpoint_available",
  "avanza_page_observed",
  "order_form_visible",
  "account_verified",
  "instrument_verified",
  "buy_side_verified",
  "advanced_limit_mode_verified",
  "stop_before_review_boundary_documented",
]);

export function summarizeAvanzaBridgeReadinessChecklist(
  items: AvanzaBridgeReadinessChecklistItem[],
): AvanzaBridgeReadinessSummary {
  const counts = items.reduce(
    (accumulator, item) => {
      if (item.status === "ready") {
        accumulator.ready_count += 1;
      } else if (item.status === "blocked") {
        accumulator.blocked_count += 1;
      } else if (item.status === "advisory") {
        accumulator.advisory_count += 1;
      } else {
        accumulator.unknown_count += 1;
      }

      return accumulator;
    },
    {
      advisory_count: 0,
      blocked_count: 0,
      ready_count: 0,
      unknown_count: 0,
    },
  );
  const requiredItems = items.filter((item) =>
    requiredReadOnlyObservationItemIds.has(item.id),
  );
  const requiredItemsReady =
    requiredItems.length === requiredReadOnlyObservationItemIds.size &&
    requiredItems.every((item) => item.status === "ready");
  const requiredItemsBlocked = requiredItems.some(
    (item) => item.status === "blocked",
  );

  if (requiredItemsBlocked) {
    return {
      ...counts,
      label: "Read-only readiness blocked",
      severity: "danger",
      shortCopy:
        "A required bridge, preflight, or visible order-form check is blocked.",
      status: "blocked",
    };
  }

  if (requiredItemsReady) {
    return {
      ...counts,
      label: "Ready for read-only observation",
      severity: "warning",
      shortCopy:
        "Bridge and visible order-form checks are ready for read-only observation. Total-read remains advisory and this is not execution readiness.",
      status: "ready_for_read_only_observation",
    };
  }

  if (
    items.length > 0 &&
    counts.advisory_count > 0 &&
    counts.blocked_count === 0 &&
    counts.unknown_count === 0
  ) {
    return {
      ...counts,
      label: "Advisory only",
      severity: "warning",
      shortCopy:
        "Only advisory items remain, but this summary is still read-only observation context.",
      status: "advisory_only",
    };
  }

  return {
    ...counts,
    label: "Read-only readiness unknown",
    severity: "neutral",
    shortCopy:
      "There is not enough read-only bridge status data to summarize readiness.",
    status: "unknown",
  };
}

export function buildAvanzaBridgeReadinessChecklist({
  evidence,
  featureEnabled,
  milestone,
  refreshMetadata,
  status,
}: BuildAvanzaBridgeReadinessChecklistInput): AvanzaBridgeReadinessChecklistItem[] {
  const preflightBlocked =
    status.status === "preflight_blocked" ||
    refreshMetadata.endpointSummary.preflight === "blocked";
  const preflightReady = status.preflightReady;
  const observedState = !featureEnabled
    ? "unknown"
    : preflightReady
      ? "ready"
      : preflightBlocked
        ? "blocked"
        : "unknown";
  const healthState = !featureEnabled
    ? "unknown"
    : refreshMetadata.endpointSummary.health === "available"
      ? "ready"
      : refreshMetadata.endpointSummary.health === "unavailable"
        ? "blocked"
        : "unknown";
  const selfCheckState = !featureEnabled
    ? "unknown"
    : refreshMetadata.endpointSummary.selfCheck === "available"
      ? "ready"
      : refreshMetadata.endpointSummary.selfCheck === "unavailable"
        ? "blocked"
        : "unknown";
  const localBridgeState = !featureEnabled
    ? "unknown"
    : status.bridgeAvailable
      ? "ready"
      : status.status === "unavailable" || status.status === "not_configured"
        ? "blocked"
        : "unknown";

  return [
    {
      id: "read_only_feature_flag_enabled",
      label: "Read-only feature flag enabled",
      status: featureEnabled ? "ready" : "blocked",
    },
    {
      id: "local_bridge_reachable",
      label: "Local bridge reachable",
      status: localBridgeState,
    },
    {
      id: "health_endpoint_available",
      label: "Health endpoint available",
      status: healthState,
    },
    {
      id: "self_check_endpoint_available",
      label: "Self-check endpoint available",
      status: selfCheckState,
    },
    {
      id: "avanza_page_observed",
      label: "Avanza page observed",
      status: observedState,
    },
    {
      id: "order_form_visible",
      label: "Order form visible",
      status: evidenceState({
        featureEnabled,
        preflightBlocked,
        preflightReady,
        verified: evidence?.orderFormVisible === true,
      }),
    },
    {
      id: "account_verified",
      label: "Account verified",
      status: evidenceState({
        featureEnabled,
        preflightBlocked,
        preflightReady,
        verified: verifiedValue(evidence?.accountVerified),
      }),
    },
    {
      id: "instrument_verified",
      label: "Instrument verified",
      status: evidenceState({
        featureEnabled,
        preflightBlocked,
        preflightReady,
        verified: verifiedValue(evidence?.instrumentVerified),
      }),
    },
    {
      id: "buy_side_verified",
      label: "Buy side verified",
      status: observedState,
    },
    {
      id: "advanced_limit_mode_verified",
      label: "Advanced/Limit mode verified",
      status: observedState,
    },
    {
      detail: "Documented boundary: Ture stops before the Avanza review step.",
      id: "stop_before_review_boundary_documented",
      label: "Stop-before-review boundary documented",
      status:
        milestone?.coreFillAndStopProven && milestone.stoppedBeforeReview
          ? "ready"
          : "unknown",
    },
    {
      detail: "Actual order-total read remains unresolved and advisory only.",
      id: "total_read_unresolved_advisory",
      label: "Total-read unresolved/advisory",
      status: "advisory",
    },
  ];
}

export function buildAvanzaBridgeReadinessSummary(
  input: BuildAvanzaBridgeReadinessChecklistInput,
): AvanzaBridgeReadinessSummary {
  return summarizeAvanzaBridgeReadinessChecklist(
    buildAvanzaBridgeReadinessChecklist(input),
  );
}
