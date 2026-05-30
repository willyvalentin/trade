import type {
  RecommendationIntakeQualityReason,
  RecommendationIntakeQualityResult,
} from "@/lib/recommendation-intake-quality";
import type { ScanPipelineObservabilitySummary } from "@/lib/scan-pipeline-observability";

export type RecommendationEmptyStateStatus =
  | "has_recommendations"
  | "no_high_quality_setups"
  | "market_not_ideal"
  | "data_unavailable"
  | "scan_degraded"
  | "risk_controls_blocking"
  | "demo_empty"
  | "unknown";

export type RecommendationEmptyStateSeverity =
  | "info"
  | "warning"
  | "critical";

export type RecommendationEmptyStateReason = {
  reason_id: string;
  label: string;
  message: string;
  severity: RecommendationEmptyStateSeverity;
  source:
    | "visible_recommendations"
    | "intake_quality"
    | "scan_observability"
    | "market_session"
    | "risk_controls"
    | "demo"
    | "unknown";
  count?: number;
};

export type RecommendationEmptyStateAction = {
  action_id: string;
  label: string;
  message: string;
  priority: "primary" | "secondary";
};

export type RecommendationEmptyStateSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "recommendation_empty_state";
  generated_at: string;
  status: RecommendationEmptyStateStatus;
  severity: RecommendationEmptyStateSeverity;
  show_dominant_empty_state: boolean;
  show_supporting_empty_state: boolean;
  visible_recommendation_count: number;
  accepted_recommendation_count: number;
  intake_counts: ScanPipelineObservabilitySummary["intake_counts"];
  title: string;
  body: string;
  primary_reason: RecommendationEmptyStateReason;
  supporting_reasons: RecommendationEmptyStateReason[];
  market_session_note: string | null;
  data_freshness_note: string | null;
  risk_controls_note: string | null;
  suggested_actions: RecommendationEmptyStateAction[];
  summary: string;
};

export type RecommendationEmptyStateInput = {
  visible_recommendations: Array<{
    id?: string | null;
    ticker?: string | null;
    is_demo?: boolean | null;
  }>;
  intake_results: RecommendationIntakeQualityResult[];
  observability_summary: ScanPipelineObservabilitySummary;
  market_session?: {
    phase?: string | null;
    risk_level?: string | null;
    market_is_open?: boolean | null;
    next_recommended_action?: string | null;
  } | null;
  risk_controls?: {
    enabled?: boolean | null;
    mode?: string | null;
    status?: string | null;
    blocked_tickers?: string[] | null;
    allowed_tickers?: string[] | null;
  } | null;
  demo_mode?: boolean | null;
  has_refresh_control?: boolean | null;
  now?: Date | string | null;
};

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function reason(
  reason_id: string,
  label: string,
  message: string,
  severity: RecommendationEmptyStateSeverity,
  source: RecommendationEmptyStateReason["source"],
  count?: number,
): RecommendationEmptyStateReason {
  return {
    reason_id,
    label,
    message,
    severity,
    source,
    count,
  };
}

function action(
  action_id: string,
  label: string,
  message: string,
  priority: RecommendationEmptyStateAction["priority"] = "secondary",
): RecommendationEmptyStateAction {
  return { action_id, label, message, priority };
}

function marketPhaseLabel(value: string | null | undefined) {
  if (!value) return "unknown";
  return value.replaceAll("_", " ");
}

function hasReasonSource(
  results: RecommendationIntakeQualityResult[],
  source: RecommendationIntakeQualityReason["source"],
) {
  return results.some((result) =>
    result.top_reasons.some((item) => item.source === source),
  );
}

function hasReasonId(
  results: RecommendationIntakeQualityResult[],
  fragments: string[],
) {
  return results.some((result) =>
    result.top_reasons.some((item) =>
      fragments.some((fragment) => item.reason_id.includes(fragment)),
    ),
  );
}

function firstKnownReason(
  observabilitySummary: ScanPipelineObservabilitySummary,
) {
  const first = observabilitySummary.top_reasons[0];

  if (!first) {
    return null;
  }

  return reason(
    first.reason_id,
    first.label,
    first.message,
    "warning",
    "intake_quality",
    first.count,
  );
}

function chooseStatus({
  visibleCount,
  acceptedCount,
  input,
  hasRiskControlBlock,
}: {
  visibleCount: number;
  acceptedCount: number;
  input: RecommendationEmptyStateInput;
  hasRiskControlBlock: boolean;
}): RecommendationEmptyStateStatus {
  const observabilityStatus = input.observability_summary.status;
  const marketPhase = input.market_session?.phase ?? null;
  const isDemoEmpty = input.demo_mode === true && visibleCount === 0;

  if (visibleCount > 0 && acceptedCount > 0) {
    return "has_recommendations";
  }

  if (isDemoEmpty) {
    return "demo_empty";
  }

  if (hasRiskControlBlock) {
    return "risk_controls_blocking";
  }

  if (
    marketPhase === "closed" ||
    marketPhase === "pre_market" ||
    marketPhase === "after_hours" ||
    marketPhase === "closing_soon" ||
    marketPhase === "holiday" ||
    input.market_session?.risk_level === "high" ||
    input.market_session?.risk_level === "critical"
  ) {
    return "market_not_ideal";
  }

  if (
    observabilityStatus === "stale" ||
    input.observability_summary.stale_candidate_count > 0 ||
    input.observability_summary.unknown_metrics.length > 0
  ) {
    return "data_unavailable";
  }

  if (observabilityStatus === "degraded" || observabilityStatus === "incomplete") {
    return "scan_degraded";
  }

  if (visibleCount === 0 || acceptedCount === 0) {
    return "no_high_quality_setups";
  }

  return "unknown";
}

function titleForStatus(status: RecommendationEmptyStateStatus) {
  if (status === "market_not_ideal") return "Ture is staying selective";
  if (status === "data_unavailable") return "Data is not clean enough right now";
  if (status === "scan_degraded") return "Scanner context needs review";
  if (status === "risk_controls_blocking") return "Risk controls are blocking setups";
  if (status === "demo_empty") return "Demo recommendations are empty";
  if (status === "unknown") return "No clear recommendation state yet";
  return "No high-quality setups right now";
}

function bodyForStatus(status: RecommendationEmptyStateStatus) {
  if (status === "demo_empty") {
    return "Demo mode is available, but no local demo recommendation is currently visible.";
  }

  if (status === "data_unavailable") {
    return "Ture did not find enough fresh, coherent source data to present a high-quality setup.";
  }

  if (status === "scan_degraded") {
    return "Ture found scan or intake signals that need review before treating candidates as clean setups.";
  }

  if (status === "market_not_ideal") {
    return "Ture is avoiding pressure to trade while the current market session is less suitable for fresh intraday entries.";
  }

  if (status === "risk_controls_blocking") {
    return "Ture is respecting local risk controls instead of forcing a trade idea through.";
  }

  return "Ture did not find a setup that currently passes the quality and data-coherence checks. This protects the process from forcing low-quality trades.";
}

function primaryReasonForStatus(
  status: RecommendationEmptyStateStatus,
  input: RecommendationEmptyStateInput,
  acceptedCount: number,
  knownReason: RecommendationEmptyStateReason | null,
) {
  if (status === "demo_empty") {
    return reason(
      "demo_mode_empty",
      "Demo mode empty",
      "No local demo recommendation is currently active.",
      "info",
      "demo",
    );
  }

  if (status === "market_not_ideal") {
    return reason(
      "market_session_not_ideal",
      "Market session not ideal",
      `Current session is ${marketPhaseLabel(
        input.market_session?.phase,
      )} with ${input.market_session?.risk_level ?? "unknown"} risk.`,
      input.market_session?.risk_level === "critical" ? "critical" : "warning",
      "market_session",
    );
  }

  if (status === "data_unavailable") {
    return reason(
      "source_data_unavailable",
      "Source data needs confirmation",
      input.observability_summary.stale_candidate_count > 0
        ? "One or more candidates have stale market-data indicators."
        : "Some scan or source metrics are unavailable, so Ture is not filling the gap with guesses.",
      "warning",
      "scan_observability",
    );
  }

  if (status === "scan_degraded") {
    return reason(
      "scan_pipeline_degraded",
      "Scan pipeline degraded",
      input.observability_summary.summary,
      "warning",
      "scan_observability",
    );
  }

  if (status === "risk_controls_blocking") {
    return reason(
      "risk_controls_blocking",
      "Risk controls blocking candidates",
      "One or more candidates were blocked or flagged by local risk-control context.",
      "warning",
      "risk_controls",
    );
  }

  if (acceptedCount === 0 && input.intake_results.length > 0) {
    return (
      knownReason ??
      reason(
        "no_accepted_setups",
        "No accepted setups",
        "Candidates exist, but none passed the accepted intake-quality threshold.",
        "info",
        "intake_quality",
      )
    );
  }

  return reason(
    "no_visible_recommendations",
    "No visible recommendations",
    "There are no current, non-expired recommendation cards in the visible list.",
    "info",
    "visible_recommendations",
  );
}

function buildSupportingReasons(input: RecommendationEmptyStateInput) {
  const results = input.intake_results;
  const observability = input.observability_summary;
  const reasons: RecommendationEmptyStateReason[] = [];

  if (observability.intake_counts.needs_review > 0) {
    reasons.push(
      reason(
        "only_needs_review_setups",
        "Needs-review setups",
        `${observability.intake_counts.needs_review} candidate${
          observability.intake_counts.needs_review === 1 ? "" : "s"
        } need more review before qualifying as high quality.`,
        "warning",
        "intake_quality",
        observability.intake_counts.needs_review,
      ),
    );
  }

  if (observability.intake_counts.rejected > 0) {
    reasons.push(
      reason(
        "rejected_trade_plans",
        "Rejected trade plans",
        `${observability.intake_counts.rejected} candidate${
          observability.intake_counts.rejected === 1 ? "" : "s"
        } failed intake checks for structure, plan quality, or data coherence.`,
        "warning",
        "intake_quality",
        observability.intake_counts.rejected,
      ),
    );
  }

  if (observability.intake_counts.incomplete > 0) {
    reasons.push(
      reason(
        "incomplete_trade_plans",
        "Incomplete trade plans",
        `${observability.intake_counts.incomplete} candidate${
          observability.intake_counts.incomplete === 1 ? "" : "s"
        } are missing required context.`,
        "warning",
        "intake_quality",
        observability.intake_counts.incomplete,
      ),
    );
  }

  if (observability.stale_candidate_count > 0 || hasReasonSource(results, "market_data")) {
    reasons.push(
      reason(
        "stale_or_incomplete_market_data",
        "Market data not fresh enough",
        "Freshness and market-data coherence need confirmation before relying on a setup.",
        "warning",
        "scan_observability",
        observability.stale_candidate_count || undefined,
      ),
    );
  }

  if (hasReasonId(results, ["reason", "rationale", "catalyst"])) {
    reasons.push(
      reason(
        "weak_or_incomplete_rationale",
        "Rationale needs work",
        "One or more candidates lacked strong rationale or catalyst detail.",
        "warning",
        "intake_quality",
      ),
    );
  }

  if (hasReasonId(results, ["risk_reward", "price_plan", "stop", "target"])) {
    reasons.push(
      reason(
        "poor_risk_reward_or_plan",
        "Trade plan quality",
        "One or more candidates had a weak or incomplete entry, stop, target, or risk/reward structure.",
        "warning",
        "intake_quality",
      ),
    );
  }

  if (observability.duplicate_ticker_count > 0 || hasReasonSource(results, "existing_recommendations")) {
    reasons.push(
      reason(
        "duplicate_or_noisy_candidates",
        "Duplicate or noisy candidates",
        "Duplicate ticker/setup signals were reduced instead of being treated as independent opportunities.",
        "info",
        "intake_quality",
        observability.duplicate_ticker_count || undefined,
      ),
    );
  }

  if (hasReasonSource(results, "risk_controls")) {
    reasons.push(
      reason(
        "risk_controls_flagged_candidates",
        "Risk controls flagged candidates",
        "Local risk-control context flagged one or more candidates.",
        "warning",
        "risk_controls",
      ),
    );
  }

  if (observability.status === "degraded" || observability.status === "incomplete") {
    reasons.push(
      reason(
        "scan_observability_not_clean",
        "Scan observability not clean",
        observability.summary,
        "warning",
        "scan_observability",
      ),
    );
  }

  if (observability.unknown_metrics.length > 0) {
    reasons.push(
      reason(
        "unknown_scan_metrics",
        "Unknown scan metrics",
        `${observability.unknown_metrics.slice(0, 2).join(", ")} ${
          observability.unknown_metrics.length > 2 ? "and more " : ""
        }not available.`,
        "info",
        "scan_observability",
        observability.unknown_metrics.length,
      ),
    );
  }

  return reasons;
}

function buildSuggestedActions(
  status: RecommendationEmptyStateStatus,
  input: RecommendationEmptyStateInput,
  hasRiskControlBlock: boolean,
) {
  const actions: RecommendationEmptyStateAction[] = [];

  if (input.observability_summary.status !== "healthy") {
    actions.push(
      action(
        "review_scan_diagnostics",
        "Review scan diagnostics",
        "Open the scan diagnostics panel for source, freshness, and intake details.",
        "primary",
      ),
    );
  }

  actions.push(
    action(
      "check_market_status",
      "Check Market status",
      "Confirm the current market session and calendar state before looking for entries.",
      actions.length === 0 ? "primary" : "secondary",
    ),
  );

  if (input.has_refresh_control) {
    actions.push(
      action(
        "refresh_scan",
        "Refresh scan",
        "Use the existing Recommendations refresh control to rerun or reload the scan.",
      ),
    );
  }

  const phase = input.market_session?.phase;
  if (
    status === "market_not_ideal" ||
    phase === "closed" ||
    phase === "pre_market" ||
    phase === "after_hours"
  ) {
    actions.push(
      action(
        "wait_for_regular_session",
        "Wait for regular session",
        "Let the regular intraday window reopen before forcing a new idea.",
      ),
    );
  }

  if (hasRiskControlBlock || input.risk_controls?.enabled) {
    actions.push(
      action(
        "review_risk_controls",
        "Review risk controls",
        "Check allowed tickers, blocked tickers, and local risk-control mode.",
      ),
    );
  }

  if (input.demo_mode) {
    actions.push(
      action(
        "use_demo_recommendation",
        "Use demo recommendation",
        "Create a local demo recommendation if you want to test the workflow.",
      ),
    );
  }

  return actions.slice(0, 5);
}

export function buildRecommendationEmptyStateSummary(
  input: RecommendationEmptyStateInput,
): RecommendationEmptyStateSummary {
  const generatedAt = (toDate(input.now) ?? new Date()).toISOString();
  const visibleCount = input.visible_recommendations.length;
  const acceptedCount = input.observability_summary.intake_counts.accepted;
  const hasRiskControlBlock = hasReasonSource(input.intake_results, "risk_controls");
  const knownReason = firstKnownReason(input.observability_summary);
  const status = chooseStatus({
    visibleCount,
    acceptedCount,
    input,
    hasRiskControlBlock,
  });
  const showDominantEmptyState = visibleCount === 0;
  const showSupportingEmptyState = visibleCount > 0 && acceptedCount === 0;
  const supportingReasons = buildSupportingReasons(input)
    .filter((item, index, list) =>
      list.findIndex((candidate) => candidate.reason_id === item.reason_id) === index,
    )
    .slice(0, 4);
  const primaryReason = primaryReasonForStatus(
    status,
    input,
    acceptedCount,
    knownReason,
  );
  const marketSessionNote = input.market_session
    ? input.market_session.next_recommended_action ??
      `Current session: ${marketPhaseLabel(input.market_session.phase)} / ${
        input.market_session.risk_level ?? "unknown"
      } risk.`
    : null;
  const dataFreshnessNote =
    input.observability_summary.run_context.data_age_minutes === null
      ? "Data freshness is unknown from available scan metrics."
      : `Latest observable scan/recommendation data is ${input.observability_summary.run_context.data_age_minutes}m old.`;
  const riskControlsNote = input.risk_controls?.enabled
    ? `Risk controls are enabled in ${input.risk_controls.mode ?? "unknown"} mode.`
    : input.risk_controls
      ? "Risk controls are available but not enabled."
      : null;
  const suggestedActions = buildSuggestedActions(
    status,
    input,
    hasRiskControlBlock,
  );

  return {
    summary_id: `recommendation-empty-state-${generatedAt}`,
    summary_version: "1.0",
    summary_kind: "recommendation_empty_state",
    generated_at: generatedAt,
    status,
    severity:
      primaryReason.severity === "critical"
        ? "critical"
        : supportingReasons.some((item) => item.severity === "warning")
          ? "warning"
          : "info",
    show_dominant_empty_state: showDominantEmptyState,
    show_supporting_empty_state: showSupportingEmptyState,
    visible_recommendation_count: visibleCount,
    accepted_recommendation_count: acceptedCount,
    intake_counts: input.observability_summary.intake_counts,
    title: titleForStatus(status),
    body: `${bodyForStatus(
      status,
    )} Quality checks validate structure and data coherence, not profit certainty.`,
    primary_reason: primaryReason,
    supporting_reasons: supportingReasons,
    market_session_note: marketSessionNote,
    data_freshness_note: dataFreshnessNote,
    risk_controls_note: riskControlsNote,
    suggested_actions: suggestedActions,
    summary:
      status === "has_recommendations"
        ? "Accepted recommendation cards are visible."
        : `${titleForStatus(status)} ${primaryReason.message}`,
  };
}

export function recommendationEmptyStateSummaryJson(
  summary: RecommendationEmptyStateSummary,
) {
  return JSON.stringify(summary, null, 2);
}
