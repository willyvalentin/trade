import type { AgentDryRunResult } from "@/lib/agent-dry-run";
import type { AgentReadinessResult } from "@/lib/agent-readiness";
import type {
  BrokerOrderPreviewCapture,
  BrokerOrderStatus,
} from "@/lib/broker-execution-metadata";
import type { TradeExecutionPayload } from "@/lib/execution-payload";
import { normalizeSetupType } from "@/lib/setup-types";

export type HandoffIntegrityStatus = "passed" | "warning" | "failed";

export type HandoffIntegrityIssueSeverity = "info" | "warning" | "failed";

export type HandoffIntegrityIssue = {
  code: string;
  severity: HandoffIntegrityIssueSeverity;
  label: string;
  description: string;
};

export type HandoffIntegrityResult = {
  status: HandoffIntegrityStatus;
  score: number;
  label: string;
  summary: string;
  issues: HandoffIntegrityIssue[];
  can_create_live_trade: boolean;
  checked_at: string;
};

export type HandoffIntegritySnapshot = {
  status: HandoffIntegrityStatus;
  score: number;
  checked_at: string;
  issue_codes: string[];
  warning_codes: string[];
  failed_codes: string[];
};

export type CheckHandoffIntegrityInput = {
  payload?: TradeExecutionPayload | null;
  handoffSessionId?: string | null;
  recommendationId?: string | null;
  ticker?: string | null;
  plannedEntry?: number | null;
  plannedShares?: number | null;
  plannedStop?: number | null;
  plannedTarget?: number | null;
  brokerOrderStatus?: BrokerOrderStatus | string | null;
  actualFillPrice?: number | null;
  actualShares?: number | null;
  manualBrokerConfirmed?: boolean;
  brokerPlanMatches?: boolean;
  brokerOrderPreview?: BrokerOrderPreviewCapture | null;
  agentReadiness?: AgentReadinessResult | null;
  dryRunResult?: AgentDryRunResult | null;
  validationStatus?: string | null;
  intradayConfirmation?: string | null;
  now?: Date;
};

function issue(
  code: string,
  severity: HandoffIntegrityIssueSeverity,
  label: string,
  description: string,
): HandoffIntegrityIssue {
  return { code, severity, label, description };
}

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function secondsUntilExpiry(payload: TradeExecutionPayload, now: Date) {
  const expiresAt = new Date(payload.expires_at).getTime();

  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  return Math.ceil((expiresAt - now.getTime()) / 1000);
}

function normalizeTicker(value: string | null | undefined) {
  return value?.trim().toUpperCase() || null;
}

function finalize(
  issues: HandoffIntegrityIssue[],
  checkedAt: string,
): HandoffIntegrityResult {
  const failedIssues = issues.filter((item) => item.severity === "failed");
  const warningIssues = issues.filter((item) => item.severity === "warning");
  const infoIssues = issues.filter((item) => item.severity === "info");
  let score =
    100 -
    failedIssues.length * 25 -
    warningIssues.length * 8 -
    infoIssues.length * 1;

  if (failedIssues.length > 0) {
    score = Math.max(0, Math.min(score, 40));

    return {
      status: "failed",
      score,
      label: "Failed",
      summary:
        "Handoff session integrity failed. Fix required session or broker-fill issues before creating a Live Day Trade.",
      issues,
      can_create_live_trade: false,
      checked_at: checkedAt,
    };
  }

  if (warningIssues.length > 0 || score < 80) {
    score = Math.max(50, Math.min(score, 79));

    return {
      status: "warning",
      score,
      label: "Warning",
      summary:
        "Handoff session is internally consistent, but review warnings before creating the Live Day Trade.",
      issues,
      can_create_live_trade: true,
      checked_at: checkedAt,
    };
  }

  return {
    status: "passed",
    score: Math.min(100, Math.max(80, score)),
    label: "Passed",
    summary:
      "Handoff session is internally consistent. Broker confirmation remains manual.",
    issues,
    can_create_live_trade: true,
    checked_at: checkedAt,
  };
}

export function toHandoffIntegritySnapshot(
  result: HandoffIntegrityResult,
): HandoffIntegritySnapshot {
  return {
    status: result.status,
    score: result.score,
    checked_at: result.checked_at,
    issue_codes: result.issues.map((item) => item.code),
    warning_codes: result.issues
      .filter((item) => item.severity === "warning")
      .map((item) => item.code),
    failed_codes: result.issues
      .filter((item) => item.severity === "failed")
      .map((item) => item.code),
  };
}

export function checkHandoffIntegrity({
  payload,
  handoffSessionId,
  recommendationId,
  ticker,
  plannedEntry,
  plannedShares,
  plannedStop,
  plannedTarget,
  brokerOrderStatus,
  actualFillPrice,
  actualShares,
  manualBrokerConfirmed,
  brokerPlanMatches,
  brokerOrderPreview,
  agentReadiness,
  dryRunResult,
  validationStatus,
  intradayConfirmation,
  now = new Date(),
}: CheckHandoffIntegrityInput): HandoffIntegrityResult {
  const checkedAt = now.toISOString();
  const issues: HandoffIntegrityIssue[] = [];

  if (!payload) {
    return finalize(
      [
        issue(
          "payload_missing",
          "failed",
          "Payload missing",
          "No execution payload exists for this handoff session.",
        ),
      ],
      checkedAt,
    );
  }

  const sessionId = handoffSessionId?.trim() || null;
  const payloadSessionId = payload.handoff_session_id?.trim() || null;
  const plannedEntryValue = positiveNumber(plannedEntry ?? payload.limit_price);
  const plannedSharesValue = positiveNumber(plannedShares ?? payload.shares);
  const plannedStopValue = positiveNumber(plannedStop ?? payload.stop_loss);
  const actualFillValue = positiveNumber(actualFillPrice);
  const actualSharesValue = positiveNumber(actualShares);
  const effectiveValidationStatus = validationStatus ?? payload.validation_status;
  const effectiveIntradayConfirmation =
    intradayConfirmation ?? payload.intraday_confirmation;
  const modalTicker = normalizeTicker(ticker);
  const payloadTicker = normalizeTicker(payload.ticker);
  const modalRecommendationId = recommendationId?.trim() || null;
  const secondsLeft = secondsUntilExpiry(payload, now);

  if (!sessionId) {
    issues.push(
      issue(
        "handoff_session_missing",
        "failed",
        "Session missing",
        "Modal handoff session id is missing.",
      ),
    );
  }

  if (!payloadSessionId) {
    issues.push(
      issue(
        "payload_handoff_session_missing",
        "failed",
        "Payload session missing",
        "Execution payload does not include a handoff session id.",
      ),
    );
  } else if (sessionId && payloadSessionId !== sessionId) {
    issues.push(
      issue(
        "handoff_session_mismatch",
        "failed",
        "Session mismatch",
        "Modal handoff session id does not match the execution payload.",
      ),
    );
  }

  if (secondsLeft === null || secondsLeft <= 0) {
    issues.push(
      issue(
        "payload_expired",
        "failed",
        "Payload expired",
        "Execution payload is expired or expiry could not be verified.",
      ),
    );
  }

  if (!payload.payload_fingerprint) {
    issues.push(
      issue(
        "payload_fingerprint_missing",
        "failed",
        "Fingerprint missing",
        "Execution payload fingerprint is missing.",
      ),
    );
  }

  if (
    modalRecommendationId &&
    payload.recommendation_id &&
    payload.recommendation_id !== modalRecommendationId
  ) {
    issues.push(
      issue(
        "recommendation_id_mismatch",
        "failed",
        "Recommendation mismatch",
        "Payload recommendation id does not match the active recommendation.",
      ),
    );
  }

  if (payload.order_intent !== "prepare_only") {
    issues.push(
      issue(
        "order_intent_not_prepare_only",
        "failed",
        "Order intent unsafe",
        "Execution payload must be prepare-only.",
      ),
    );
  }

  if (payload.do_not_submit_order !== true) {
    issues.push(
      issue(
        "submit_guard_missing",
        "failed",
        "Submit guard missing",
        "Execution payload must explicitly forbid order submission.",
      ),
    );
  }

  if (payload.requires_manual_confirmation !== true) {
    issues.push(
      issue(
        "manual_confirmation_flag_missing",
        "failed",
        "Manual confirmation missing",
        "Execution payload must require manual final confirmation.",
      ),
    );
  }

  if (payload.broker_hint !== "AVANZA") {
    issues.push(
      issue(
        "broker_hint_invalid",
        "failed",
        "Broker invalid",
        "Only AVANZA handoff payloads are supported.",
      ),
    );
  }

  if (!modalTicker || !payloadTicker) {
    issues.push(
      issue(
        "ticker_missing",
        "failed",
        "Ticker missing",
        "Ticker is missing from modal or payload.",
      ),
    );
  } else if (modalTicker !== payloadTicker) {
    issues.push(
      issue(
        "ticker_mismatch",
        "failed",
        "Ticker mismatch",
        "Payload ticker does not match the recommendation ticker.",
      ),
    );
  }

  if (!plannedSharesValue) {
    issues.push(
      issue(
        "planned_shares_invalid",
        "failed",
        "Planned shares invalid",
        "Planned shares must be greater than zero.",
      ),
    );
  }

  if (!actualSharesValue) {
    issues.push(
      issue(
        "actual_shares_invalid",
        "failed",
        "Actual shares invalid",
        "Actual broker shares must be greater than zero.",
      ),
    );
  }

  if (!actualFillValue) {
    issues.push(
      issue(
        "actual_fill_invalid",
        "failed",
        "Actual fill invalid",
        "Actual broker fill price must be greater than zero.",
      ),
    );
  }

  if (!plannedEntryValue) {
    issues.push(
      issue(
        "planned_entry_invalid",
        "failed",
        "Planned entry invalid",
        "Planned entry or limit price must be greater than zero.",
      ),
    );
  }

  if (!plannedStopValue) {
    issues.push(
      issue(
        "stop_loss_invalid",
        "failed",
        "Stop invalid",
        "Stop loss must be present and greater than zero.",
      ),
    );
  } else {
    if (plannedEntryValue && plannedStopValue >= plannedEntryValue) {
      issues.push(
        issue(
          "stop_above_planned_entry",
          "failed",
          "Stop above planned entry",
          "Stop loss must be below planned entry for a long trade.",
        ),
      );
    }

    if (actualFillValue && plannedStopValue >= actualFillValue) {
      issues.push(
        issue(
          "stop_above_actual_fill",
          "failed",
          "Stop above actual fill",
          "Stop loss must be below actual fill for a long trade.",
        ),
      );
    }
  }

  if (brokerOrderStatus === "submitted_not_filled") {
    issues.push(
      issue(
        "broker_order_not_filled",
        "failed",
        "Broker order not filled",
        "Do not create a Live Day Trade until the broker order is filled.",
      ),
    );
  }

  if (!manualBrokerConfirmed) {
    issues.push(
      issue(
        "manual_broker_confirmation_missing",
        "failed",
        "Manual confirmation missing",
        "Manual Avanza confirmation checkbox is not checked.",
      ),
    );
  }

  if (!brokerPlanMatches) {
    issues.push(
      issue(
        "broker_plan_match_missing",
        "failed",
        "Plan match missing",
        "Broker order matches Trade plan checkbox is not checked.",
      ),
    );
  }

  if (agentReadiness?.status === "blocked") {
    issues.push(
      issue(
        "agent_readiness_blocked",
        "failed",
        "Readiness blocked",
        "Agent readiness is blocked.",
      ),
    );
  }

  if (dryRunResult?.status === "dry_run_failed") {
    issues.push(
      issue(
        "dry_run_failed",
        "failed",
        "Dry run failed",
        "Pre-agent dry run failed.",
      ),
    );
  }

  if (effectiveValidationStatus === "blocked") {
    issues.push(
      issue(
        "validation_blocked",
        "failed",
        "Validation blocked",
        "ADD TRADE validation is blocked.",
      ),
    );
  }

  if (effectiveIntradayConfirmation === "weak") {
    issues.push(
      issue(
        "intraday_confirmation_weak",
        "failed",
        "Intraday weak",
        "Intraday confirmation is weak.",
      ),
    );
  }

  if (!agentReadiness) {
    issues.push(
      issue(
        "agent_readiness_missing",
        "warning",
        "Readiness missing",
        "Agent readiness result is unavailable.",
      ),
    );
  } else if (agentReadiness.status === "warning") {
    issues.push(
      issue(
        "agent_readiness_warning",
        "warning",
        "Readiness warning",
        "Agent readiness has warnings.",
      ),
    );
  }

  if (!dryRunResult) {
    issues.push(
      issue(
        "dry_run_missing",
        "warning",
        "Dry run missing",
        "Pre-agent dry run has not been completed for this handoff.",
      ),
    );
  }

  if (
    effectiveValidationStatus === "warning" ||
    effectiveValidationStatus === "unavailable"
  ) {
    issues.push(
      issue(
        `validation_${effectiveValidationStatus}`,
        "warning",
        "Validation warning",
        "ADD TRADE validation is warning or unavailable.",
      ),
    );
  }

  if (
    effectiveIntradayConfirmation === "mixed" ||
    effectiveIntradayConfirmation === "unknown"
  ) {
    issues.push(
      issue(
        `intraday_${effectiveIntradayConfirmation}`,
        "warning",
        "Intraday needs review",
        "Intraday confirmation is mixed or unknown.",
      ),
    );
  }

  if (!positiveNumber(plannedTarget ?? payload.target_price)) {
    issues.push(
      issue(
        "target_missing",
        "warning",
        "Target missing",
        "Target price is unavailable.",
      ),
    );
  }

  if (normalizeSetupType(payload.setup_type) === "UNKNOWN") {
    issues.push(
      issue(
        "setup_type_unknown",
        "warning",
        "Setup unknown",
        "Setup type is unknown.",
      ),
    );
  }

  if (plannedEntryValue && actualFillValue) {
    const fillDifferencePercent =
      Math.abs(actualFillValue - plannedEntryValue) / plannedEntryValue;

    if (fillDifferencePercent > 0.0015) {
      issues.push(
        issue(
          "actual_fill_differs_from_plan",
          "warning",
          "Fill differs from plan",
          "Actual fill differs from planned entry by more than 0.15%.",
        ),
      );
    }
  }

  if (plannedSharesValue && actualSharesValue && plannedSharesValue !== actualSharesValue) {
    issues.push(
      issue(
        "actual_shares_differ_from_plan",
        "warning",
        "Shares differ from plan",
        "Actual shares differ from planned shares.",
      ),
    );
  }

  if (plannedEntryValue && plannedSharesValue && actualFillValue && actualSharesValue) {
    const plannedPositionValue = plannedEntryValue * plannedSharesValue;
    const actualPositionValue = actualFillValue * actualSharesValue;
    const positionDifferencePercent =
      Math.abs(actualPositionValue - plannedPositionValue) / plannedPositionValue;

    if (positionDifferencePercent > 0.01) {
      issues.push(
        issue(
          "position_value_differs_from_plan",
          "warning",
          "Position value differs",
          "Actual position value differs from planned value by more than 1%.",
        ),
      );
    }
  }

  if (brokerOrderPreview?.warning_type && brokerOrderPreview.warning_type !== "none") {
    issues.push(
      issue(
        "broker_preview_warning",
        "warning",
        "Broker preview warning",
        "Manual broker preview includes a warning.",
      ),
    );
  }

  if (
    brokerOrderPreview?.buying_power_status === "warning" ||
    brokerOrderPreview?.buying_power_status === "unknown"
  ) {
    issues.push(
      issue(
        `buying_power_${brokerOrderPreview.buying_power_status}`,
        "warning",
        "Buying power needs review",
        "Buying power status should be manually verified.",
      ),
    );
  }

  if (!payload.broker_cost_estimate || !payload.broker_cost_estimate.enabled) {
    issues.push(
      issue(
        "broker_cost_estimate_missing",
        "warning",
        "Cost estimate missing",
        "Broker cost estimate is missing or disabled.",
      ),
    );
  }

  return finalize(issues, checkedAt);
}
