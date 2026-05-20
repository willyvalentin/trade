import type { BrokerOrderPreviewCapture } from "@/lib/broker-execution-metadata";
import type { TradeExecutionPayload } from "@/lib/execution-payload";
import { normalizeSetupType } from "@/lib/setup-types";

export type AgentReadinessStatus = "ready" | "warning" | "blocked";

export type AgentReadinessIssueSeverity = "info" | "warning" | "blocked";

export type AgentReadinessIssue = {
  code: string;
  severity: AgentReadinessIssueSeverity;
  label: string;
  description: string;
};

export type AgentReadinessResult = {
  status: AgentReadinessStatus;
  score: number;
  label: string;
  summary: string;
  issues: AgentReadinessIssue[];
  can_mark_ready_for_agent: boolean;
};

export type CalculateAgentReadinessInput = {
  payload?: TradeExecutionPayload | null;
  now?: Date;
  brokerOrderPreview?: BrokerOrderPreviewCapture | null;
};

function issue(
  code: string,
  severity: AgentReadinessIssueSeverity,
  label: string,
  description: string,
): AgentReadinessIssue {
  return { code, severity, label, description };
}

function isPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function secondsUntilExpiry(payload: TradeExecutionPayload, now: Date) {
  const expiresAt = new Date(payload.expires_at).getTime();

  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  return Math.ceil((expiresAt - now.getTime()) / 1000);
}

function finalizeReadiness(issues: AgentReadinessIssue[]): AgentReadinessResult {
  const blockedIssues = issues.filter((item) => item.severity === "blocked");
  const warningIssues = issues.filter((item) => item.severity === "warning");
  const infoIssues = issues.filter((item) => item.severity === "info");
  let score =
    100 -
    blockedIssues.length * 25 -
    warningIssues.length * 8 -
    infoIssues.length * 1;

  if (blockedIssues.length > 0) {
    score = Math.max(0, Math.min(score, 40));

    return {
      status: "blocked",
      score,
      label: "Blocked",
      summary:
        "Payload cannot be used for agent handoff. Revalidate or fix required fields.",
      issues,
      can_mark_ready_for_agent: false,
    };
  }

  if (warningIssues.length > 0 || score < 80) {
    score = Math.max(50, Math.min(score, 79));

    return {
      status: "warning",
      score,
      label: "Warning",
      summary:
        "Payload is usable for preparation but requires extra manual review.",
      issues,
      can_mark_ready_for_agent: true,
    };
  }

  return {
    status: "ready",
    score: Math.min(100, Math.max(80, score)),
    label: "Ready",
    summary:
      "Payload is fresh, complete, and prepare-only. Manual final confirmation is required.",
    issues,
    can_mark_ready_for_agent: true,
  };
}

export function calculateAgentReadiness({
  payload,
  now = new Date(),
  brokerOrderPreview,
}: CalculateAgentReadinessInput): AgentReadinessResult {
  const issues: AgentReadinessIssue[] = [];

  if (!payload) {
    return finalizeReadiness([
      issue(
        "payload_missing",
        "blocked",
        "Payload missing",
        "No execution payload is available for agent handoff.",
      ),
    ]);
  }

  const secondsLeft = secondsUntilExpiry(payload, now);

  if (secondsLeft === null) {
    issues.push(
      issue(
        "payload_expiry_invalid",
        "blocked",
        "Expiry unavailable",
        "Payload expiry could not be verified.",
      ),
    );
  } else if (secondsLeft <= 0) {
    issues.push(
      issue(
        "payload_expired",
        "blocked",
        "Payload expired",
        "Reopen ADD TRADE and run validation again before agent handoff.",
      ),
    );
  } else if (secondsLeft < 60) {
    issues.push(
      issue(
        "payload_expires_soon",
        "warning",
        "Payload expires soon",
        "Less than one minute remains before the payload becomes stale.",
      ),
    );
  }

  if (payload.order_intent !== "prepare_only") {
    issues.push(
      issue(
        "order_intent_not_prepare_only",
        "blocked",
        "Order intent is unsafe",
        "Agent handoff requires a prepare-only payload.",
      ),
    );
  }

  if (payload.do_not_submit_order !== true) {
    issues.push(
      issue(
        "do_not_submit_order_missing",
        "blocked",
        "Submit guard missing",
        "Payload must explicitly tell the agent not to submit orders.",
      ),
    );
  }

  if (payload.requires_manual_confirmation !== true) {
    issues.push(
      issue(
        "manual_confirmation_missing",
        "blocked",
        "Manual confirmation missing",
        "Payload must require manual final confirmation.",
      ),
    );
  }

  if (payload.broker_hint !== "AVANZA") {
    issues.push(
      issue(
        "broker_hint_invalid",
        "blocked",
        "Broker mismatch",
        "Only AVANZA handoff payloads are supported.",
      ),
    );
  }

  if (!payload.payload_fingerprint) {
    issues.push(
      issue(
        "payload_fingerprint_missing",
        "blocked",
        "Fingerprint missing",
        "Payload fingerprint is required for handoff review.",
      ),
    );
  }

  if (!payload.ticker || payload.ticker === "UNKNOWN") {
    issues.push(
      issue(
        "ticker_missing",
        "blocked",
        "Ticker missing",
        "The agent cannot prepare an order without a ticker.",
      ),
    );
  }

  if (!isPositiveNumber(payload.shares)) {
    issues.push(
      issue(
        "shares_invalid",
        "blocked",
        "Shares invalid",
        "Share count must be greater than zero.",
      ),
    );
  }

  if (!isPositiveNumber(payload.limit_price)) {
    issues.push(
      issue(
        "limit_price_invalid",
        "blocked",
        "Limit price invalid",
        "Limit price must be greater than zero.",
      ),
    );
  }

  if (!isPositiveNumber(payload.stop_loss)) {
    issues.push(
      issue(
        "stop_loss_invalid",
        "blocked",
        "Stop loss invalid",
        "Stop loss must be present and greater than zero.",
      ),
    );
  } else if (
    payload.direction === "long" &&
    isPositiveNumber(payload.limit_price) &&
    payload.stop_loss >= payload.limit_price
  ) {
    issues.push(
      issue(
        "stop_loss_above_limit",
        "blocked",
        "Stop loss invalid",
        "Stop loss must be below limit price for a long trade.",
      ),
    );
  }

  if ((payload.validation_status as string) === "blocked") {
    issues.push(
      issue(
        "validation_blocked",
        "blocked",
        "Validation blocked",
        "ADD TRADE validation blocked this setup.",
      ),
    );
  } else if (
    payload.validation_status === "warning" ||
    payload.validation_status === "unavailable"
  ) {
    issues.push(
      issue(
        `validation_${payload.validation_status}`,
        "warning",
        "Validation needs review",
        "ADD TRADE validation is not fully clean.",
      ),
    );
  }

  if (payload.intraday_confirmation === "weak") {
    issues.push(
      issue(
        "intraday_confirmation_weak",
        "blocked",
        "Intraday confirmation weak",
        "Weak intraday confirmation is not ready for agent handoff.",
      ),
    );
  } else if (
    payload.intraday_confirmation === "mixed" ||
    payload.intraday_confirmation === "unknown"
  ) {
    issues.push(
      issue(
        `intraday_confirmation_${payload.intraday_confirmation}`,
        "warning",
        "Intraday confirmation needs review",
        "Manual review is needed before using the payload for handoff.",
      ),
    );
  }

  if (!isPositiveNumber(payload.target_price)) {
    issues.push(
      issue(
        "target_price_missing",
        "warning",
        "Target missing",
        "Target price is unavailable, so reward context is incomplete.",
      ),
    );
  }

  if (normalizeSetupType(payload.setup_type) === "UNKNOWN") {
    issues.push(
      issue(
        "setup_type_unknown",
        "warning",
        "Setup type unknown",
        "Strategy classification is missing or unclear.",
      ),
    );
  }

  if (!payload.broker_cost_estimate) {
    issues.push(
      issue(
        "broker_cost_estimate_missing",
        "warning",
        "Cost estimate missing",
        "Broker cost estimate is unavailable for this payload.",
      ),
    );
  } else if (!payload.broker_cost_estimate.enabled) {
    issues.push(
      issue(
        "broker_cost_estimate_disabled",
        "warning",
        "Cost estimate disabled",
        "Broker cost estimates are disabled in Settings.",
      ),
    );
  } else if (payload.broker_cost_estimate.warnings.length > 0) {
    issues.push(
      issue(
        "broker_cost_estimate_warning",
        "warning",
        "Cost estimate warning",
        payload.broker_cost_estimate.warnings[0] ??
          "Broker cost estimate needs manual review.",
      ),
    );
  }

  if (brokerOrderPreview) {
    if (brokerOrderPreview.buying_power_status === "insufficient") {
      issues.push(
        issue(
          "buying_power_insufficient",
          "blocked",
          "Buying power insufficient",
          "Avanza preview indicates insufficient buying power.",
        ),
      );
    } else if (
      brokerOrderPreview.buying_power_status === "warning" ||
      brokerOrderPreview.buying_power_status === "unknown"
    ) {
      issues.push(
        issue(
          `buying_power_${brokerOrderPreview.buying_power_status}`,
          "warning",
          "Buying power needs review",
          "Buying power status should be manually verified in Avanza.",
        ),
      );
    }

    if (brokerOrderPreview.warning_type !== "none") {
      issues.push(
        issue(
          `broker_preview_${brokerOrderPreview.warning_type}`,
          "warning",
          "Broker preview warning",
          "Avanza preview warning was manually recorded.",
        ),
      );
    }
  }

  return finalizeReadiness(issues);
}
