import type { AgentReadinessResult } from "@/lib/agent-readiness";
import type { BrokerOrderPreviewCapture } from "@/lib/broker-execution-metadata";
import type { TradeExecutionPayload } from "@/lib/execution-payload";
import { normalizeSetupType } from "@/lib/setup-types";

export type AgentDryRunStatus = "dry_run_passed" | "dry_run_failed";

export type AgentDryRunStepStatus = "passed" | "warning" | "failed" | "info";

export type AgentDryRunStep = {
  id: string;
  label: string;
  status: AgentDryRunStepStatus;
  description: string;
};

export type AgentDryRunField = {
  field: string;
  value: string | number | null;
  source: "execution_payload" | "derived" | "manual_review_required";
  warning?: string;
};

export type AgentDryRunResult = {
  status: AgentDryRunStatus;
  passed: boolean;
  summary: string;
  steps: AgentDryRunStep[];
  fields_to_prepare: AgentDryRunField[];
  hard_stops: AgentDryRunStep[];
  generated_at: string;
};

export type RunAgentDryRunInput = {
  payload?: TradeExecutionPayload | null;
  agentReadiness?: AgentReadinessResult | null;
  validationStatus?: string | null;
  intradayConfirmation?: string | null;
  brokerOrderPreview?: BrokerOrderPreviewCapture | null;
  buyingPowerStatus?: BrokerOrderPreviewCapture["buying_power_status"] | null;
  now?: Date;
};

function step(
  id: string,
  label: string,
  status: AgentDryRunStepStatus,
  description: string,
): AgentDryRunStep {
  return { id, label, status, description };
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

function addCheck(
  steps: AgentDryRunStep[],
  passed: boolean,
  id: string,
  label: string,
  passedDescription: string,
  failedDescription: string,
) {
  steps.push(
    step(
      id,
      label,
      passed ? "passed" : "failed",
      passed ? passedDescription : failedDescription,
    ),
  );
}

function addWarning(
  steps: AgentDryRunStep[],
  condition: boolean,
  id: string,
  label: string,
  description: string,
) {
  if (condition) {
    steps.push(step(id, label, "warning", description));
  }
}

function buildFields(payload: TradeExecutionPayload): AgentDryRunField[] {
  return [
    {
      field: "broker",
      value: payload.broker_hint,
      source: "execution_payload",
    },
    {
      field: "side/direction",
      value: payload.direction === "long" ? "buy / long" : payload.direction,
      source: "derived",
    },
    {
      field: "ticker/symbol",
      value: payload.ticker || null,
      source: "execution_payload",
    },
    {
      field: "shares/quantity",
      value: payload.shares,
      source: "execution_payload",
    },
    {
      field: "order type",
      value: payload.order_type,
      source: "execution_payload",
    },
    {
      field: "limit price",
      value: payload.limit_price,
      source: "execution_payload",
    },
    {
      field: "stop loss reference",
      value: payload.stop_loss,
      source: "manual_review_required",
      warning: "Stop remains a Trade plan reference; verify handling in Avanza.",
    },
    {
      field: "target price reference",
      value: payload.target_price,
      source: "manual_review_required",
      warning:
        payload.target_price === null
          ? "Target is missing and requires manual review."
          : "Target remains a Trade plan reference.",
    },
    {
      field: "estimated position value",
      value: payload.position_value,
      source: "derived",
    },
    {
      field: "max loss at stop",
      value: payload.max_loss_at_stop,
      source: "derived",
    },
    {
      field: "payload id",
      value: payload.payload_id,
      source: "execution_payload",
    },
    {
      field: "payload fingerprint",
      value: payload.payload_fingerprint || null,
      source: "execution_payload",
    },
    {
      field: "expiry",
      value: payload.expires_at,
      source: "execution_payload",
    },
    {
      field: "manual confirmation required",
      value: payload.requires_manual_confirmation ? "yes" : "no",
      source: "execution_payload",
    },
  ];
}

export function runAgentDryRun({
  payload,
  agentReadiness,
  validationStatus,
  intradayConfirmation,
  brokerOrderPreview,
  buyingPowerStatus,
  now = new Date(),
}: RunAgentDryRunInput): AgentDryRunResult {
  const generatedAt = now.toISOString();
  const steps: AgentDryRunStep[] = [];

  if (!payload) {
    const payloadMissing = step(
      "payload_missing",
      "Payload exists",
      "failed",
      "No execution payload is available for dry run.",
    );

    return {
      status: "dry_run_failed",
      passed: false,
      summary:
        "Dry run failed. No execution payload is available for simulation.",
      steps: [payloadMissing],
      fields_to_prepare: [],
      hard_stops: [payloadMissing],
      generated_at: generatedAt,
    };
  }

  const secondsLeft = secondsUntilExpiry(payload, now);
  const effectiveValidationStatus = validationStatus ?? payload.validation_status;
  const effectiveIntradayConfirmation =
    intradayConfirmation ?? payload.intraday_confirmation;
  const effectiveBuyingPowerStatus =
    buyingPowerStatus ?? brokerOrderPreview?.buying_power_status ?? null;

  addCheck(
    steps,
    agentReadiness?.status !== "blocked",
    "agent_readiness_not_blocked",
    "Agent readiness not blocked",
    "Agent readiness allows a dry-run handoff simulation.",
    "Agent readiness is blocked, so a future agent must not proceed.",
  );
  addCheck(
    steps,
    secondsLeft !== null && secondsLeft > 0,
    "payload_fresh",
    "Payload fresh",
    "Payload is not expired.",
    "Payload is expired or expiry could not be verified.",
  );
  addCheck(
    steps,
    payload.order_intent === "prepare_only",
    "prepare_only",
    "Prepare-only intent",
    "Payload is marked prepare-only.",
    "Payload is not marked prepare-only.",
  );
  addCheck(
    steps,
    payload.do_not_submit_order === true,
    "do_not_submit_order",
    "Do-not-submit guard",
    "Payload explicitly forbids order submission.",
    "Payload does not explicitly forbid order submission.",
  );
  addCheck(
    steps,
    payload.requires_manual_confirmation === true,
    "manual_confirmation_required",
    "Manual confirmation required",
    "Payload requires manual final confirmation.",
    "Payload does not require manual final confirmation.",
  );
  addCheck(
    steps,
    payload.broker_hint === "AVANZA",
    "broker_avanza",
    "Broker is Avanza",
    "Payload broker hint is AVANZA.",
    "Payload broker hint is not AVANZA.",
  );
  addCheck(
    steps,
    Boolean(payload.ticker && payload.ticker !== "UNKNOWN"),
    "ticker_present",
    "Ticker present",
    "Ticker is available for form preparation.",
    "Ticker is missing.",
  );
  addCheck(
    steps,
    isPositiveNumber(payload.shares),
    "shares_valid",
    "Shares valid",
    "Share count is greater than zero.",
    "Share count is missing or invalid.",
  );
  addCheck(
    steps,
    isPositiveNumber(payload.limit_price),
    "limit_price_valid",
    "Limit price valid",
    "Limit price is greater than zero.",
    "Limit price is missing or invalid.",
  );
  addCheck(
    steps,
    isPositiveNumber(payload.stop_loss),
    "stop_loss_valid",
    "Stop loss valid",
    "Stop loss is present and greater than zero.",
    "Stop loss is missing or invalid.",
  );
  addCheck(
    steps,
    !(
      payload.direction === "long" &&
      isPositiveNumber(payload.stop_loss) &&
      isPositiveNumber(payload.limit_price) &&
      payload.stop_loss >= payload.limit_price
    ),
    "stop_below_limit_for_long",
    "Stop below limit",
    "Stop loss is below limit price for the long setup.",
    "Stop loss must be below limit price for a long setup.",
  );
  addCheck(
    steps,
    effectiveBuyingPowerStatus !== "insufficient",
    "buying_power_not_insufficient",
    "Buying power not insufficient",
    "No insufficient buying power status is recorded.",
    "Buying power is marked insufficient.",
  );
  addCheck(
    steps,
    effectiveValidationStatus !== "blocked",
    "validation_not_blocked",
    "Validation not blocked",
    "ADD TRADE validation is not blocked.",
    "ADD TRADE validation is blocked.",
  );
  addCheck(
    steps,
    effectiveIntradayConfirmation !== "weak",
    "intraday_not_weak",
    "Intraday confirmation not weak",
    "Intraday confirmation is not weak.",
    "Intraday confirmation is weak.",
  );

  addWarning(
    steps,
    agentReadiness?.status === "warning",
    "readiness_warning",
    "Readiness warning",
    "Agent readiness has warnings that require manual review.",
  );
  addWarning(
    steps,
    effectiveValidationStatus === "warning" ||
      effectiveValidationStatus === "unavailable",
    "validation_warning",
    "Validation warning",
    "ADD TRADE validation is warning or unavailable.",
  );
  addWarning(
    steps,
    effectiveIntradayConfirmation === "mixed" ||
      effectiveIntradayConfirmation === "unknown",
    "intraday_confirmation_warning",
    "Intraday confirmation warning",
    "Intraday confirmation is mixed or unknown.",
  );
  addWarning(
    steps,
    !isPositiveNumber(payload.target_price),
    "target_price_missing",
    "Target missing",
    "Target price is missing and requires manual review.",
  );
  addWarning(
    steps,
    normalizeSetupType(payload.setup_type) === "UNKNOWN",
    "setup_type_unknown",
    "Setup type unknown",
    "Setup classification is unknown.",
  );
  addWarning(
    steps,
    !payload.broker_cost_estimate || !payload.broker_cost_estimate.enabled,
    "broker_cost_estimate_unavailable",
    "Cost estimate unavailable",
    "Broker cost estimate is missing or disabled.",
  );
  addWarning(
    steps,
    Boolean(payload.broker_cost_estimate?.warnings.length),
    "broker_cost_estimate_warning",
    "Cost estimate warning",
    payload.broker_cost_estimate?.warnings[0] ??
      "Broker cost estimate requires manual review.",
  );
  addWarning(
    steps,
    brokerOrderPreview !== null &&
      brokerOrderPreview !== undefined &&
      brokerOrderPreview.warning_type !== "none",
    "broker_preview_warning",
    "Broker preview warning",
    "A manually captured Avanza preview warning is present.",
  );
  addWarning(
    steps,
    effectiveBuyingPowerStatus === "warning" ||
      effectiveBuyingPowerStatus === "unknown",
    "buying_power_review",
    "Buying power needs review",
    "Buying power status should be manually verified.",
  );
  addWarning(
    steps,
    secondsLeft !== null && secondsLeft > 0 && secondsLeft < 60,
    "payload_expires_soon",
    "Payload expires soon",
    "Payload has less than one minute before expiry.",
  );

  steps.push(
    step(
      "simulation_only",
      "Simulation only",
      "info",
      "No browser opens, no Avanza form is controlled, and no order is submitted.",
    ),
  );

  const hardStops = steps.filter((item) => item.status === "failed");
  const passed = hardStops.length === 0;

  return {
    status: passed ? "dry_run_passed" : "dry_run_failed",
    passed,
    summary: passed
      ? "Dry run passed. A future agent would have enough safe payload context to prepare the form, then stop before final confirmation."
      : "Dry run failed. A future agent must stop before preparing the form.",
    steps,
    fields_to_prepare: buildFields(payload),
    hard_stops: hardStops,
    generated_at: generatedAt,
  };
}
