import type { BrokerExecutionMetadata } from "@/lib/broker-execution-metadata";
import type { ExecutionQualityMetrics } from "@/lib/execution-quality";
import type { ExecutionTimelineEvent } from "@/lib/execution-timeline";
import type { HandoffQualityResult } from "@/lib/handoff-quality";
import type { HandoffReplayResult } from "@/lib/handoff-session-replay";

export type ExecutionImprovementPriority = "high" | "medium" | "low";

export type ExecutionImprovementCategory =
  | "handoff_safety"
  | "broker_confirmation"
  | "execution_quality"
  | "costs"
  | "timing"
  | "audit_trail"
  | "discipline";

export type ExecutionImprovementSuggestion = {
  code: string;
  priority: ExecutionImprovementPriority;
  category: ExecutionImprovementCategory;
  title: string;
  description: string;
  suggested_action: string;
};

export type ExecutionImprovementResult = {
  summary: string;
  suggestions: ExecutionImprovementSuggestion[];
  generated_at: string;
};

export type BuildExecutionImprovementSuggestionsInput = {
  brokerExecutionMetadata?: BrokerExecutionMetadata | null;
  handoffQuality?: HandoffQualityResult | null;
  executionQualityMetrics?: ExecutionQualityMetrics | null;
  handoffReplay?: HandoffReplayResult | null;
  timelineEvents?: ExecutionTimelineEvent[];
  eodSafetyStatus?: { status?: string | null; severity?: string | null } | null;
  generatedAt?: string;
};

const priorityRank: Record<ExecutionImprovementPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function suggestion(
  code: string,
  priority: ExecutionImprovementPriority,
  category: ExecutionImprovementCategory,
  title: string,
  description: string,
  suggestedAction: string,
): ExecutionImprovementSuggestion {
  return {
    code,
    priority,
    category,
    title,
    description,
    suggested_action: suggestedAction,
  };
}

function latestEvent(
  timelineEvents: ExecutionTimelineEvent[],
  type: ExecutionTimelineEvent["type"],
) {
  return [...timelineEvents].reverse().find((event) => event.type === type) ?? null;
}

function materialFillDifference(metadata: BrokerExecutionMetadata) {
  if (
    metadata.planned_entry_price === null ||
    metadata.actual_fill_price === null ||
    metadata.planned_entry_price <= 0
  ) {
    return false;
  }

  return (
    Math.abs(metadata.actual_fill_price - metadata.planned_entry_price) /
      metadata.planned_entry_price >
    0.0015
  );
}

function materialPreviewCostDifference(metadata: BrokerExecutionMetadata) {
  const preview = metadata.broker_order_preview?.preview_total_estimated_cost;
  const estimate = metadata.broker_cost_estimate?.total_estimated_trading_cost;

  if (
    preview === null ||
    preview === undefined ||
    estimate === null ||
    estimate === undefined ||
    estimate <= 0
  ) {
    return false;
  }

  return Math.abs(preview - estimate) / estimate > 0.15;
}

function materiallyReducedNetR(metadata: BrokerExecutionMetadata) {
  const grossR = metadata.broker_cost_estimate?.estimated_gross_r;
  const netR = metadata.broker_cost_estimate?.estimated_net_r;

  if (
    grossR === null ||
    grossR === undefined ||
    netR === null ||
    netR === undefined ||
    grossR <= 0
  ) {
    return false;
  }

  return grossR - netR >= 0.25 || netR / grossR < 0.8;
}

export function buildExecutionImprovementSuggestions({
  brokerExecutionMetadata,
  handoffQuality,
  executionQualityMetrics,
  handoffReplay,
  timelineEvents = [],
  eodSafetyStatus,
  generatedAt = new Date().toISOString(),
}: BuildExecutionImprovementSuggestionsInput): ExecutionImprovementResult {
  const suggestionsByCode = new Map<string, ExecutionImprovementSuggestion>();

  function add(item: ExecutionImprovementSuggestion) {
    const existing = suggestionsByCode.get(item.code);

    if (!existing || priorityRank[item.priority] < priorityRank[existing.priority]) {
      suggestionsByCode.set(item.code, item);
    }
  }

  const dryRunEvent = latestEvent(timelineEvents, "agent_dry_run_completed");
  const dryRunPassed = dryRunEvent?.metadata?.dry_run_passed;
  const preview = brokerExecutionMetadata?.broker_order_preview;
  const integrity = brokerExecutionMetadata?.handoff_integrity;

  if (!dryRunEvent) {
    add(
      suggestion(
        "dry_run_missing",
        "medium",
        "handoff_safety",
        "Run the pre-agent dry run before broker confirmation",
        "No pre-agent dry run event was found for this handoff.",
        "Use RUN PRE-AGENT DRY RUN before marking the handoff ready.",
      ),
    );
  } else if (dryRunPassed === false) {
    add(
      suggestion(
        "dry_run_failed",
        "high",
        "handoff_safety",
        "Do not proceed after a failed dry run",
        "The pre-agent dry run failed during the handoff.",
        "Fix failed dry-run issues before preparing the broker order.",
      ),
    );
  }

  if (!integrity) {
    add(
      suggestion(
        "integrity_missing",
        "medium",
        "audit_trail",
        "Capture integrity check before creating the live trade",
        "No persisted handoff integrity snapshot was found.",
        "Run the ADD TRADE flow through the integrity check before creating the Live Day Trade.",
      ),
    );
  } else if (integrity.status === "failed") {
    add(
      suggestion(
        "integrity_failed",
        "high",
        "handoff_safety",
        "Resolve failed handoff integrity before trading",
        "The handoff integrity check failed.",
        "Fix failed integrity issues before broker confirmation or Live Day Trade creation.",
      ),
    );
  } else if (integrity.status === "warning") {
    add(
      suggestion(
        "integrity_warning",
        "medium",
        "handoff_safety",
        "Review integrity warnings before broker confirmation",
        "The handoff integrity check completed with warnings.",
        "Review warning codes before confirming the broker order.",
      ),
    );
  }

  if (!preview) {
    add(
      suggestion(
        "broker_preview_missing",
        "medium",
        "broker_confirmation",
        "Capture broker preview before final confirmation",
        "No manual Avanza preview capture was recorded.",
        "Record Avanza preview cost, buying power, and warnings before final broker confirmation.",
      ),
    );
  } else {
    if (preview.warning_type !== "none") {
      const highPriority =
        preview.warning_type === "buying_power_warning" ||
        preview.warning_type === "instrument_warning";
      add(
        suggestion(
          `broker_preview_${preview.warning_type}`,
          highPriority ? "high" : "medium",
          "broker_confirmation",
          "Resolve broker warning before confirming in Avanza",
          "The manually captured Avanza preview included a warning.",
          "Do not confirm in Avanza until the warning is understood and intentionally accepted.",
        ),
      );
    }

    if (preview.buying_power_status === "insufficient") {
      add(
        suggestion(
          "buying_power_insufficient",
          "high",
          "broker_confirmation",
          "Do not confirm if buying power is insufficient",
          "Buying power was recorded as insufficient.",
          "Resolve buying power before confirming any broker order.",
        ),
      );
    } else if (
      preview.buying_power_status === "warning" ||
      preview.buying_power_status === "unknown"
    ) {
      add(
        suggestion(
          `buying_power_${preview.buying_power_status}`,
          "medium",
          "broker_confirmation",
          "Verify buying power before confirmation",
          "Buying power was warning or unknown in the broker preview capture.",
          "Verify available buying power in Avanza before final confirmation.",
        ),
      );
    }
  }

  if (executionQualityMetrics?.quality_rating === "poor") {
    add(
      suggestion(
        "execution_quality_poor",
        "high",
        "execution_quality",
        "Improve fill quality",
        "Execution quality was rated poor.",
        "Review whether entries are being chased or filled too far from the plan.",
      ),
    );
  }

  if (
    executionQualityMetrics?.slippage_percent !== null &&
    executionQualityMetrics?.slippage_percent !== undefined &&
    executionQualityMetrics.slippage_percent > 0.15
  ) {
    add(
      suggestion(
        "slippage_above_threshold",
        executionQualityMetrics.slippage_percent > 0.3 ? "high" : "medium",
        "execution_quality",
        "Avoid chasing far above planned entry",
        "Entry slippage was worse than 0.15%.",
        "Use the planned limit and skip setups that move too far before broker confirmation.",
      ),
    );
  }

  if (brokerExecutionMetadata) {
    if (materialFillDifference(brokerExecutionMetadata)) {
      add(
        suggestion(
          "actual_fill_differs_from_plan",
          "medium",
          "execution_quality",
          "Re-check limit price discipline",
          "Actual fill differed materially from planned entry.",
          "Verify the limit price against the Trade plan before confirming in Avanza.",
        ),
      );
    }

    if (
      brokerExecutionMetadata.actual_shares !== null &&
      brokerExecutionMetadata.planned_shares !== null &&
      brokerExecutionMetadata.actual_shares !== brokerExecutionMetadata.planned_shares
    ) {
      add(
        suggestion(
          "actual_shares_differ_from_plan",
          brokerExecutionMetadata.broker_order_status === "partially_filled"
            ? "medium"
            : "low",
          "execution_quality",
          "Confirm share quantity matches the plan",
          "Actual shares differed from planned shares.",
          "Confirm share quantity in the broker preview before final confirmation.",
        ),
      );
    }

    if (brokerExecutionMetadata.broker_order_status === "partially_filled") {
      add(
        suggestion(
          "partial_fill_handling",
          "medium",
          "execution_quality",
          "Review partial-fill handling",
          "The broker order was partially filled.",
          "Track only filled shares and review whether the remaining order should be canceled manually.",
        ),
      );
    }

    if (!brokerExecutionMetadata.broker_cost_estimate?.enabled) {
      add(
        suggestion(
          "broker_cost_estimate_disabled",
          "low",
          "costs",
          "Enable broker cost estimate",
          "Broker cost estimates were missing or disabled.",
          "Enable broker cost estimates in Settings to compare gross vs estimated net quality.",
        ),
      );
    }

    if (materiallyReducedNetR(brokerExecutionMetadata)) {
      add(
        suggestion(
          "net_r_reduced_by_costs",
          "medium",
          "costs",
          "Check net R after estimated costs",
          "Estimated broker costs materially reduced the reward-to-risk estimate.",
          "Prefer setups where estimated net R remains attractive after costs.",
        ),
      );
    }

    if (materialPreviewCostDifference(brokerExecutionMetadata)) {
      add(
        suggestion(
          "preview_cost_differs_from_estimate",
          "medium",
          "costs",
          "Compare Avanza preview with Trade estimate",
          "Avanza preview cost materially differed from Trade's estimate.",
          "Adjust broker cost settings or manually verify fees before confirmation.",
        ),
      );
    }

    if (!brokerExecutionMetadata.handoff_session_id) {
      add(
        suggestion(
          "handoff_session_missing",
          "low",
          "audit_trail",
          "Older trade lacks handoff session id",
          "This trade has no handoff session id tying the audit trail together.",
          "Use the current ADD TRADE flow so future trades have session-level audit continuity.",
        ),
      );
    }
  }

  if (handoffReplay?.overall_status === "partial") {
    add(
      suggestion(
        "handoff_replay_partial",
        "low",
        "audit_trail",
        "Keep the handoff in one browser session when possible",
        "The replay is partial, often because local audit events are unavailable.",
        "Run validation, dry run, preview capture, and create action in one browser session when practical.",
      ),
    );
  } else if (handoffReplay?.overall_status === "failed") {
    add(
      suggestion(
        "handoff_replay_failed",
        "high",
        "audit_trail",
        "Review failed replay events",
        "The handoff replay includes a failed dry run or integrity step.",
        "Review the replay before treating the execution process as repeatable.",
      ),
    );
  }

  if (handoffQuality?.rating === "poor") {
    add(
      suggestion(
        "handoff_quality_poor",
        "high",
        "discipline",
        "Improve handoff process quality",
        "The handoff quality score was poor.",
        "Address the highest-impact handoff quality factors before repeating this process.",
      ),
    );
  }

  const payloadGenerated = latestEvent(timelineEvents, "execution_payload_generated");
  const brokerConfirmed = latestEvent(
    timelineEvents,
    "broker_manual_confirmation_checked",
  );

  if (payloadGenerated && brokerConfirmed) {
    const generatedAt = new Date(payloadGenerated.timestamp).getTime();
    const confirmedAt = new Date(brokerConfirmed.timestamp).getTime();

    if (
      Number.isFinite(generatedAt) &&
      Number.isFinite(confirmedAt) &&
      confirmedAt - generatedAt > 3 * 60 * 1000
    ) {
      add(
        suggestion(
          "handoff_delay_long",
          "medium",
          "timing",
          "Reduce delay between validation and broker confirmation",
          "Broker confirmation happened more than three minutes after payload generation.",
          "Reopen ADD TRADE and regenerate a fresh payload when the handoff becomes stale.",
        ),
      );
    }
  }

  if (
    eodSafetyStatus?.status === "overnight_risk" ||
    eodSafetyStatus?.status === "review_required"
  ) {
    add(
      suggestion(
        "eod_day_trade_risk",
        "high",
        "discipline",
        "Close day trades before market close",
        "EOD safety indicated review or overnight risk for a day trade.",
        "Close day trades in the broker before market close, then close the Trade record.",
      ),
    );
  }

  const suggestions = Array.from(suggestionsByCode.values()).sort(
    (first, second) =>
      priorityRank[first.priority] - priorityRank[second.priority] ||
      first.code.localeCompare(second.code),
  );
  const highCount = suggestions.filter((item) => item.priority === "high").length;

  return {
    summary:
      suggestions.length === 0
        ? "No major execution improvement suggestions."
        : `${suggestions.length} improvement suggestion${
            suggestions.length === 1 ? "" : "s"
          } found, including ${highCount} high priority.`,
    suggestions,
    generated_at: generatedAt,
  };
}
