import type { AgentFormMappingPreview } from "@/lib/agent-form-mapping-preview";
import type { AgentHardStopContract } from "@/lib/agent-hard-stop-contract";
import type { AgentReadinessResult } from "@/lib/agent-readiness";
import type { AvanzaFieldVerificationReport } from "@/lib/avanza-field-verification";
import type { BrokerOrderStatus } from "@/lib/broker-execution-metadata";
import type { TradeExecutionPayload } from "@/lib/execution-payload";
import type { MarketSessionEvaluation } from "@/lib/market-session";
import type { PositionSizingResult } from "@/lib/position-sizing";
import type { RiskControlsEvaluation } from "@/lib/risk-controls";
import type { TradePlanQualityResult } from "@/lib/trade-plan-quality";

export type AddTradePreflightStatus =
  | "ready"
  | "needs_review"
  | "blocked"
  | "incomplete";

export type AddTradePreflightCheckStatus =
  | "pass"
  | "warning"
  | "blocked"
  | "incomplete"
  | "not_applicable";

export type AddTradePreflightSource =
  | "market_session"
  | "risk_controls"
  | "position_sizing"
  | "trade_plan_quality"
  | "execution_payload"
  | "agent_hard_stops"
  | "agent_readiness"
  | "form_mapping"
  | "avanza_verification"
  | "broker_fill_confirmation";

export type AddTradePreflightCheck = {
  check_id: string;
  label: string;
  status: AddTradePreflightCheckStatus;
  message: string;
  source: AddTradePreflightSource;
};

export type AddTradePreflightBlocker = {
  blocker_id: string;
  message: string;
  source: AddTradePreflightSource;
};

export type AddTradePreflightWarning = {
  warning_id: string;
  message: string;
  source: AddTradePreflightSource;
};

export type AddTradePreflightNextAction = {
  label: string;
  description: string;
};

export type AddTradePreflightSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "add_trade_preflight_summary";
  created_at: string;
  status: AddTradePreflightStatus;
  primary_message: string;
  next_action: AddTradePreflightNextAction;
  checks: AddTradePreflightCheck[];
  blockers: AddTradePreflightBlocker[];
  warnings: AddTradePreflightWarning[];
  sources: AddTradePreflightSource[];
};

export type BuildAddTradePreflightSummaryInput = {
  marketSession: MarketSessionEvaluation | null;
  riskControls: RiskControlsEvaluation | null;
  positionSizing: PositionSizingResult | null;
  tradePlanQuality: TradePlanQualityResult | null;
  executionPayload: TradeExecutionPayload | null;
  payloadExpired?: boolean;
  hardStopContract: AgentHardStopContract | null;
  agentReadiness: AgentReadinessResult | null;
  formMappingPreview: AgentFormMappingPreview | null;
  avanzaFieldVerification: AvanzaFieldVerificationReport | null;
  brokerOrderStatus?: BrokerOrderStatus | null;
  brokerFillReady?: boolean;
  manualBrokerConfirmed?: boolean;
  brokerPlanMatches?: boolean;
  brokerFillBlockMessage?: string | null;
  now?: Date;
};

export function buildAddTradePreflightSummary(
  input: BuildAddTradePreflightSummaryInput,
): AddTradePreflightSummary {
  const now = input.now ?? new Date();
  const checks: AddTradePreflightCheck[] = [];
  const blockers: AddTradePreflightBlocker[] = [];
  const warnings: AddTradePreflightWarning[] = [];

  checks.push(buildMarketSessionCheck(input.marketSession, warnings));
  checks.push(buildTradePlanCheck(input.tradePlanQuality, blockers, warnings));
  checks.push(buildPositionSizingCheck(input.positionSizing, blockers, warnings));
  checks.push(buildRiskControlsCheck(input.riskControls, blockers, warnings));
  checks.push(buildExecutionPayloadCheck(input, blockers, warnings));
  checks.push(buildHardStopsCheck(input.hardStopContract, blockers, warnings));
  checks.push(buildReadinessCheck(input.agentReadiness, warnings));
  checks.push(buildFormMappingCheck(input.formMappingPreview, warnings));
  checks.push(buildAvanzaVerificationCheck(input.avanzaFieldVerification, warnings));
  checks.push(buildBrokerFillCheck(input, warnings));

  const status = getOverallStatus(checks, blockers, warnings);
  const nextAction = getNextAction(status);

  return {
    summary_id: [
      "add-trade-preflight",
      input.executionPayload?.payload_id ?? "no-payload",
      status,
      blockers.length,
      warnings.length,
    ].join("-"),
    summary_version: "1.0",
    summary_kind: "add_trade_preflight_summary",
    created_at: now.toISOString(),
    status,
    primary_message: getPrimaryMessage(status),
    next_action: nextAction,
    checks,
    blockers,
    warnings,
    sources: Array.from(new Set(checks.map((check) => check.source))),
  };
}

export function addTradePreflightSummaryJson(
  summary: AddTradePreflightSummary,
): string {
  return JSON.stringify(summary, null, 2);
}

function buildMarketSessionCheck(
  evaluation: MarketSessionEvaluation | null,
  warnings: AddTradePreflightWarning[],
): AddTradePreflightCheck {
  if (!evaluation) {
    warnings.push(warning("market_session_missing", "Market session is unavailable.", "market_session"));
    return check("market_session", "Market Session", "incomplete", "Market session is unavailable.", "market_session");
  }

  if (evaluation.risk_level === "high" || evaluation.risk_level === "critical") {
    const message = `Market session risk is ${evaluation.risk_level}.`;
    warnings.push(warning("market_session_high_risk", message, "market_session"));
    return check("market_session", "Market Session", "warning", message, "market_session");
  }

  if (evaluation.warnings.length > 0 || evaluation.risk_level === "medium") {
    const message = evaluation.warnings[0]?.message ?? "Market session needs review.";
    warnings.push(warning("market_session_review", message, "market_session"));
    return check("market_session", "Market Session", "warning", message, "market_session");
  }

  return check("market_session", "Market Session", "pass", "Market session is acceptable.", "market_session");
}

function buildTradePlanCheck(
  result: TradePlanQualityResult | null,
  blockers: AddTradePreflightBlocker[],
  warnings: AddTradePreflightWarning[],
): AddTradePreflightCheck {
  if (!result) {
    return check("trade_plan", "Trade Plan", "incomplete", "Trade Plan Quality is unavailable.", "trade_plan_quality");
  }

  if (result.blocks_create_live_trade || result.status === "blocked") {
    const message = result.blockers[0]?.message ?? "Trade Plan Quality is blocked.";
    blockers.push(blocker("trade_plan_blocked", message, "trade_plan_quality"));
    return check("trade_plan", "Trade Plan", "blocked", message, "trade_plan_quality");
  }

  if (result.status === "incomplete") {
    return check("trade_plan", "Trade Plan", "incomplete", "Trade Plan Quality is incomplete.", "trade_plan_quality");
  }

  if (result.status === "warning" || result.warnings.length > 0) {
    const message = result.warnings[0]?.message ?? "Trade Plan Quality needs review.";
    warnings.push(warning("trade_plan_warning", message, "trade_plan_quality"));
    return check("trade_plan", "Trade Plan", "warning", message, "trade_plan_quality");
  }

  return check("trade_plan", "Trade Plan", "pass", `Trade plan quality is ${result.status}.`, "trade_plan_quality");
}

function buildPositionSizingCheck(
  result: PositionSizingResult | null,
  blockers: AddTradePreflightBlocker[],
  warnings: AddTradePreflightWarning[],
): AddTradePreflightCheck {
  if (!result) {
    return check("position_sizing", "Position Sizing", "incomplete", "Position sizing is unavailable.", "position_sizing");
  }

  if (result.blocks_create_live_trade) {
    const message = result.blockers[0]?.message ?? "Position sizing blocks trade creation.";
    blockers.push(blocker("position_sizing_blocked", message, "position_sizing"));
    return check("position_sizing", "Position Sizing", "blocked", message, "position_sizing");
  }

  if (result.status === "incomplete") {
    return check("position_sizing", "Position Sizing", "incomplete", "Position sizing is incomplete or manual.", "position_sizing");
  }

  if (result.status === "warning" || result.warnings.length > 0) {
    const message = result.warnings[0]?.message ?? "Position sizing needs review.";
    warnings.push(warning("position_sizing_warning", message, "position_sizing"));
    return check("position_sizing", "Position Sizing", "warning", message, "position_sizing");
  }

  return check("position_sizing", "Position Sizing", "pass", "Position sizing is acceptable.", "position_sizing");
}

function buildRiskControlsCheck(
  evaluation: RiskControlsEvaluation | null,
  blockers: AddTradePreflightBlocker[],
  warnings: AddTradePreflightWarning[],
): AddTradePreflightCheck {
  if (!evaluation) {
    return check("risk_controls", "Risk Controls", "incomplete", "Risk controls are unavailable.", "risk_controls");
  }

  if (evaluation.blocks_new_trade) {
    const message = evaluation.blockers[0]?.message ?? "Strict risk controls block new trade creation.";
    blockers.push(blocker("risk_controls_blocked", message, "risk_controls"));
    return check("risk_controls", "Risk Controls", "blocked", message, "risk_controls");
  }

  if (evaluation.status === "warning" || evaluation.warnings.length > 0) {
    const message = evaluation.warnings[0]?.message ?? "Risk controls need review.";
    warnings.push(warning("risk_controls_warning", message, "risk_controls"));
    return check("risk_controls", "Risk Controls", "warning", message, "risk_controls");
  }

  if (evaluation.status === "disabled") {
    return check("risk_controls", "Risk Controls", "not_applicable", "Risk controls are disabled.", "risk_controls");
  }

  return check("risk_controls", "Risk Controls", "pass", "Risk controls allow this plan.", "risk_controls");
}

function buildExecutionPayloadCheck(
  input: BuildAddTradePreflightSummaryInput,
  blockers: AddTradePreflightBlocker[],
  warnings: AddTradePreflightWarning[],
): AddTradePreflightCheck {
  if (!input.executionPayload) {
    return check("execution_payload", "Execution Payload", "incomplete", "Execution payload is unavailable.", "execution_payload");
  }

  if (input.payloadExpired) {
    const message = "Execution payload is expired.";
    blockers.push(blocker("execution_payload_expired", message, "execution_payload"));
    return check("execution_payload", "Execution Payload", "blocked", message, "execution_payload");
  }

  if (
    input.executionPayload.validation_status === "warning" ||
    input.executionPayload.validation_status === "unavailable"
  ) {
    const message = `Execution payload validation is ${input.executionPayload.validation_status}.`;
    warnings.push(warning("execution_payload_warning", message, "execution_payload"));
    return check("execution_payload", "Execution Payload", "warning", message, "execution_payload");
  }

  return check("execution_payload", "Execution Payload", "pass", "Execution payload is fresh.", "execution_payload");
}

function buildHardStopsCheck(
  contract: AgentHardStopContract | null,
  blockers: AddTradePreflightBlocker[],
  warnings: AddTradePreflightWarning[],
): AddTradePreflightCheck {
  if (!contract) {
    return check("agent_hard_stops", "Agent Hard Stops", "incomplete", "Hard stop contract is unavailable.", "agent_hard_stops");
  }

  if (contract.overall_status === "blocked" || !contract.can_create_live_trade) {
    const message = contract.top_blockers[0]?.message ?? "Agent hard stops are blocked.";
    blockers.push(blocker("agent_hard_stops_blocked", message, "agent_hard_stops"));
    return check("agent_hard_stops", "Agent Hard Stops", "blocked", message, "agent_hard_stops");
  }

  if (contract.overall_status === "warning" || contract.warning_count > 0 || contract.unknown_count > 0) {
    const message = contract.top_warnings[0]?.message ?? "Agent hard stops need review.";
    warnings.push(warning("agent_hard_stops_warning", message, "agent_hard_stops"));
    return check("agent_hard_stops", "Agent Hard Stops", "warning", message, "agent_hard_stops");
  }

  return check("agent_hard_stops", "Agent Hard Stops", "pass", "Hard stops are clear.", "agent_hard_stops");
}

function buildReadinessCheck(
  readiness: AgentReadinessResult | null,
  warnings: AddTradePreflightWarning[],
): AddTradePreflightCheck {
  if (!readiness) {
    return check("agent_readiness", "Agent Readiness", "incomplete", "Agent readiness is unavailable.", "agent_readiness");
  }

  if (readiness.status === "blocked") {
    warnings.push(warning("agent_readiness_blocked", readiness.summary, "agent_readiness"));
    return check("agent_readiness", "Agent Readiness", "warning", readiness.summary, "agent_readiness");
  }

  if (readiness.status === "warning") {
    warnings.push(warning("agent_readiness_warning", readiness.summary, "agent_readiness"));
    return check("agent_readiness", "Agent Readiness", "warning", readiness.summary, "agent_readiness");
  }

  return check("agent_readiness", "Agent Readiness", "pass", readiness.summary, "agent_readiness");
}

function buildFormMappingCheck(
  preview: AgentFormMappingPreview | null,
  warnings: AddTradePreflightWarning[],
): AddTradePreflightCheck {
  if (!preview) {
    return check("form_mapping", "Form Mapping", "incomplete", "Form mapping preview is unavailable.", "form_mapping");
  }

  if (preview.overall_status === "blocked") {
    const message = preview.blocking_reasons[0] ?? "Form mapping is blocked for future agent use.";
    warnings.push(warning("form_mapping_blocked", message, "form_mapping"));
    return check("form_mapping", "Form Mapping", "warning", message, "form_mapping");
  }

  if (preview.overall_status === "warning" || preview.warning_reasons.length > 0) {
    const message = preview.warning_reasons[0] ?? "Form mapping needs review.";
    warnings.push(warning("form_mapping_warning", message, "form_mapping"));
    return check("form_mapping", "Form Mapping", "warning", message, "form_mapping");
  }

  return check("form_mapping", "Form Mapping", "pass", "Form mapping preview is ready.", "form_mapping");
}

function buildAvanzaVerificationCheck(
  report: AvanzaFieldVerificationReport | null,
  warnings: AddTradePreflightWarning[],
): AddTradePreflightCheck {
  if (!report) {
    return check("avanza_verification", "Avanza Verification", "incomplete", "Avanza verification report is unavailable.", "avanza_verification");
  }

  if (!report.can_future_agent_prepare_form || report.overall_status !== "ready") {
    const message =
      report.blockers[0]?.message ??
      report.warnings[0]?.message ??
      "Avanza field verification is not ready for future prepare-only agent use.";
    warnings.push(warning("avanza_verification_review", message, "avanza_verification"));
    return check("avanza_verification", "Avanza Verification", "warning", message, "avanza_verification");
  }

  return check("avanza_verification", "Avanza Verification", "pass", "Avanza prepare-only verification is ready.", "avanza_verification");
}

function buildBrokerFillCheck(
  input: BuildAddTradePreflightSummaryInput,
  warnings: AddTradePreflightWarning[],
): AddTradePreflightCheck {
  if (input.brokerFillReady) {
    return check("broker_fill_confirmation", "Broker Fill Confirmation", "pass", "Broker fill is captured.", "broker_fill_confirmation");
  }

  if (input.brokerOrderStatus === "submitted_not_filled") {
    return check("broker_fill_confirmation", "Broker Fill Confirmation", "incomplete", "Broker fill has not been captured yet.", "broker_fill_confirmation");
  }

  if (!input.manualBrokerConfirmed || !input.brokerPlanMatches) {
    return check("broker_fill_confirmation", "Broker Fill Confirmation", "incomplete", "Manual broker confirmation is still required.", "broker_fill_confirmation");
  }

  const message = input.brokerFillBlockMessage ?? "Broker fill confirmation needs review.";
  warnings.push(warning("broker_fill_review", message, "broker_fill_confirmation"));
  return check("broker_fill_confirmation", "Broker Fill Confirmation", "warning", message, "broker_fill_confirmation");
}

function getOverallStatus(
  checks: AddTradePreflightCheck[],
  blockers: AddTradePreflightBlocker[],
  warnings: AddTradePreflightWarning[],
): AddTradePreflightStatus {
  if (blockers.length > 0) {
    return "blocked";
  }

  if (checks.some((checkItem) => checkItem.status === "incomplete")) {
    return "incomplete";
  }

  if (warnings.length > 0 || checks.some((checkItem) => checkItem.status === "warning")) {
    return "needs_review";
  }

  return "ready";
}

function getPrimaryMessage(status: AddTradePreflightStatus) {
  if (status === "ready") {
    return "Preflight is ready. Continue through manual broker confirmation and fill capture.";
  }

  if (status === "needs_review") {
    return "Preflight has warnings. Review them before continuing.";
  }

  if (status === "blocked") {
    return "Preflight has blockers that must be resolved before creating a Live Day Trade.";
  }

  return "Preflight is incomplete. Complete missing trade data before continuing.";
}

function getNextAction(status: AddTradePreflightStatus): AddTradePreflightNextAction {
  if (status === "ready") {
    return {
      label: "Continue to broker fill",
      description:
        "Review broker fill after manual confirmation, then create Live Day Trade.",
    };
  }

  if (status === "needs_review") {
    return {
      label: "Review warnings",
      description: "Review warnings before continuing.",
    };
  }

  if (status === "blocked") {
    return {
      label: "Resolve blockers",
      description: "Resolve blockers before creating Live Day Trade.",
    };
  }

  return {
    label: "Complete missing data",
    description: "Complete missing trade data before continuing.",
  };
}

function check(
  check_id: string,
  label: string,
  status: AddTradePreflightCheckStatus,
  message: string,
  source: AddTradePreflightSource,
): AddTradePreflightCheck {
  return { check_id, label, status, message, source };
}

function blocker(
  blocker_id: string,
  message: string,
  source: AddTradePreflightSource,
): AddTradePreflightBlocker {
  return { blocker_id, message, source };
}

function warning(
  warning_id: string,
  message: string,
  source: AddTradePreflightSource,
): AddTradePreflightWarning {
  return { warning_id, message, source };
}
