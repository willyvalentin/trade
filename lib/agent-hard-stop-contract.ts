import type { AgentDryRunResult } from "@/lib/agent-dry-run";
import type { AgentReadinessResult } from "@/lib/agent-readiness";
import type { TradeExecutionPayload } from "@/lib/execution-payload";
import type { HandoffIntegrityResult } from "@/lib/handoff-integrity";

export type AgentHardStopId =
  | "missing_execution_payload"
  | "expired_payload"
  | "missing_payload_id"
  | "missing_payload_fingerprint"
  | "missing_handoff_session_id"
  | "stale_payload"
  | "broker_not_avanza"
  | "broker_mode_not_prepare_only"
  | "order_intent_not_prepare_only"
  | "missing_submit_guard"
  | "missing_human_confirmation_requirement"
  | "missing_ticker"
  | "missing_side"
  | "missing_quantity"
  | "missing_entry_price"
  | "missing_stop_price"
  | "missing_target_price"
  | "unknown_required_field"
  | "agent_readiness_blocked"
  | "handoff_integrity_failed"
  | "agent_dry_run_failed"
  | "credentials_required_or_detected"
  | "unknown_broker_ui_state"
  | "unsafe_to_continue";

export type AgentHardStopSeverity = "info" | "warning" | "critical";

export type AgentHardStopStatus =
  | "passed"
  | "warning"
  | "failed"
  | "not_applicable"
  | "unknown";

export type AgentHardStopCategory =
  | "payload"
  | "session"
  | "broker"
  | "order_fields"
  | "validation"
  | "readiness"
  | "integrity"
  | "dry_run"
  | "freshness"
  | "human_confirmation"
  | "security"
  | "unknown_state";

export type AgentHardStopOverallStatus = "ready" | "warning" | "blocked";

export type AgentHardStopRule = {
  id: AgentHardStopId;
  label: string;
  description: string;
  category: AgentHardStopCategory;
  severity: AgentHardStopSeverity;
  blocks_agent: boolean;
  blocks_mark_ready: boolean;
  blocks_live_trade_creation: boolean;
  remediation: string;
  source: string;
};

export type AgentHardStopEvaluation = AgentHardStopRule & {
  status: AgentHardStopStatus;
  message: string;
  evaluated_at: string;
};

export type AgentHardStopContract = {
  contract_version: "1.0";
  evaluated_at: string;
  overall_status: AgentHardStopOverallStatus;
  can_mark_ready_for_agent: boolean;
  can_prepare_broker_form: boolean;
  can_create_live_trade: boolean;
  failed_count: number;
  warning_count: number;
  unknown_count: number;
  rules: AgentHardStopEvaluation[];
  top_blockers: AgentHardStopEvaluation[];
  top_warnings: AgentHardStopEvaluation[];
  machine_summary: {
    top_blocker_ids: AgentHardStopId[];
    top_warning_ids: AgentHardStopId[];
    failed_rule_ids: AgentHardStopId[];
    warning_rule_ids: AgentHardStopId[];
    unknown_rule_ids: AgentHardStopId[];
  };
  human_summary: string;
};

export type AgentHardStopContractMetadataSnapshot = {
  contract_version: AgentHardStopContract["contract_version"];
  overall_status: AgentHardStopOverallStatus;
  failed_count: number;
  warning_count: number;
  unknown_count: number;
  evaluated_at: string;
  top_blocker_ids: AgentHardStopId[];
  top_warning_ids: AgentHardStopId[];
};

export type EvaluateAgentHardStopContractInput = {
  payload?: TradeExecutionPayload | null;
  agentReadiness?: AgentReadinessResult | null;
  dryRunResult?: AgentDryRunResult | null;
  handoffIntegrity?: HandoffIntegrityResult | null;
  validationStatus?: string | null;
  intradayConfirmation?: string | null;
  brokerExecutionMode?: "prepare_only" | string | null;
  brokerUiState?: "not_applicable" | "known_safe" | "unknown" | "unsafe" | null;
  credentialsRequiredOrDetected?: boolean | null;
  unsafeToContinue?: boolean | null;
  liveTradeCreationRelevant?: boolean;
  existingCanCreateLiveTrade?: boolean | null;
  now?: Date;
};

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

function rule(
  id: AgentHardStopId,
  label: string,
  description: string,
  category: AgentHardStopCategory,
  severity: AgentHardStopSeverity,
  options: {
    blocksAgent?: boolean;
    blocksMarkReady?: boolean;
    blocksLiveTradeCreation?: boolean;
    remediation: string;
    source: string;
  },
): AgentHardStopRule {
  return {
    id,
    label,
    description,
    category,
    severity,
    blocks_agent: options.blocksAgent ?? severity === "critical",
    blocks_mark_ready: options.blocksMarkReady ?? severity === "critical",
    blocks_live_trade_creation:
      options.blocksLiveTradeCreation ?? severity === "critical",
    remediation: options.remediation,
    source: options.source,
  };
}

function evaluate(
  baseRule: AgentHardStopRule,
  status: AgentHardStopStatus,
  message: string,
  evaluatedAt: string,
): AgentHardStopEvaluation {
  return {
    ...baseRule,
    status,
    message,
    evaluated_at: evaluatedAt,
  };
}

function isBlockingStatus(status: AgentHardStopStatus) {
  return status === "failed" || status === "unknown";
}

function ruleBlocks(
  item: AgentHardStopEvaluation,
  field: "blocks_agent" | "blocks_mark_ready" | "blocks_live_trade_creation",
) {
  return isBlockingStatus(item.status) && item[field];
}

export function evaluateAgentHardStopContract({
  payload,
  agentReadiness,
  dryRunResult,
  handoffIntegrity,
  brokerExecutionMode = "prepare_only",
  brokerUiState = "not_applicable",
  credentialsRequiredOrDetected = false,
  unsafeToContinue = false,
  liveTradeCreationRelevant = false,
  existingCanCreateLiveTrade = null,
  now = new Date(),
}: EvaluateAgentHardStopContractInput): AgentHardStopContract {
  const evaluatedAt = now.toISOString();
  const secondsLeft = payload ? secondsUntilExpiry(payload, now) : null;
  const payloadFresh = secondsLeft !== null && secondsLeft > 0;
  const tickerPresent = Boolean(payload?.ticker && payload.ticker !== "UNKNOWN");
  const sidePresent = payload?.direction === "long";
  const quantityPresent = positiveNumber(payload?.shares) !== null;
  const entryPresent = positiveNumber(payload?.entry_price) !== null;
  const stopPresent = positiveNumber(payload?.stop_loss) !== null;
  const targetPresent = positiveNumber(payload?.target_price) !== null;
  const requiredFieldMissing =
    !payload?.payload_id ||
    !payload?.payload_fingerprint ||
    !payload?.handoff_session_id ||
    !payload?.expires_at ||
    !tickerPresent ||
    !sidePresent ||
    !quantityPresent ||
    !entryPresent ||
    !stopPresent ||
    !targetPresent;

  const rules: AgentHardStopEvaluation[] = [
    evaluate(
      rule(
        "missing_execution_payload",
        "Execution payload available",
        "A machine-readable execution payload must exist before any agent handoff.",
        "payload",
        "critical",
        {
          remediation: "Reopen ADD TRADE and regenerate the execution payload.",
          source: "execution_payload",
        },
      ),
      payload ? "passed" : "failed",
      payload
        ? "Execution payload is available."
        : "No execution payload is available.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "expired_payload",
        "Payload is fresh",
        "Expired or unverifiable payloads must not be used for agent preparation.",
        "freshness",
        "critical",
        {
          remediation: "Reopen ADD TRADE and run validation again.",
          source: "execution_payload.expires_at",
        },
      ),
      payload && payloadFresh ? "passed" : "failed",
      payload && payloadFresh
        ? "Payload expiry is valid and still in the future."
        : "Payload is expired or expiry could not be verified.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_payload_id",
        "Payload id present",
        "A payload id is required for audit and handoff replay.",
        "payload",
        "critical",
        {
          remediation: "Regenerate the execution payload.",
          source: "execution_payload.payload_id",
        },
      ),
      payload?.payload_id ? "passed" : "failed",
      payload?.payload_id ? "Payload id is present." : "Payload id is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_payload_fingerprint",
        "Payload fingerprint present",
        "Payload fingerprint is required to detect mismatches during review.",
        "payload",
        "critical",
        {
          remediation: "Regenerate the execution payload.",
          source: "execution_payload.payload_fingerprint",
        },
      ),
      payload?.payload_fingerprint ? "passed" : "failed",
      payload?.payload_fingerprint
        ? "Payload fingerprint is present."
        : "Payload fingerprint is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_handoff_session_id",
        "Handoff session present",
        "A handoff session id is required to connect payload, preparation, and fill review.",
        "session",
        "critical",
        {
          remediation: "Regenerate the handoff session from ADD TRADE.",
          source: "execution_payload.handoff_session_id",
        },
      ),
      payload?.handoff_session_id ? "passed" : "failed",
      payload?.handoff_session_id
        ? "Handoff session id is present."
        : "Handoff session id is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "stale_payload",
        "Payload has freshness buffer",
        "Payloads close to expiry require extra caution before handoff.",
        "freshness",
        "warning",
        {
          blocksAgent: false,
          blocksMarkReady: false,
          blocksLiveTradeCreation: false,
          remediation: "Regenerate the payload if there is any delay or uncertainty.",
          source: "execution_payload.expires_at",
        },
      ),
      secondsLeft === null
        ? "unknown"
        : secondsLeft > 0 && secondsLeft < 60
          ? "warning"
          : "passed",
      secondsLeft === null
        ? "Payload freshness buffer could not be evaluated."
        : secondsLeft > 0 && secondsLeft < 60
          ? "Payload has less than one minute before expiry."
          : "Payload has enough freshness buffer.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "broker_not_avanza",
        "Broker is Avanza",
        "Only AVANZA handoff contracts are supported.",
        "broker",
        "critical",
        {
          remediation: "Use an AVANZA execution payload.",
          source: "execution_payload.broker_hint",
        },
      ),
      payload?.broker_hint === "AVANZA" ? "passed" : "failed",
      payload?.broker_hint === "AVANZA"
        ? "Broker hint is AVANZA."
        : "Only AVANZA command handoffs are supported.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "broker_mode_not_prepare_only",
        "Broker mode is prepare-only",
        "The command contract must allow preparation only, never autonomous broker execution.",
        "broker",
        "critical",
        {
          remediation: "Use broker_execution_mode prepare_only.",
          source: "agent_handoff_command.broker_execution_mode",
        },
      ),
      brokerExecutionMode === "prepare_only" ? "passed" : "failed",
      brokerExecutionMode === "prepare_only"
        ? "Broker execution mode is prepare-only."
        : "Broker execution mode is not prepare-only.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "order_intent_not_prepare_only",
        "Order intent is prepare-only",
        "Execution payload must be prepare-only.",
        "broker",
        "critical",
        {
          remediation: "Regenerate a prepare-only payload.",
          source: "execution_payload.order_intent",
        },
      ),
      payload?.order_intent === "prepare_only" ? "passed" : "failed",
      payload?.order_intent === "prepare_only"
        ? "Payload order intent is prepare-only."
        : "Payload order intent is not prepare-only.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_submit_guard",
        "Submit guard present",
        "Payload must explicitly forbid order submission.",
        "broker",
        "critical",
        {
          remediation: "Regenerate a payload with do_not_submit_order=true.",
          source: "execution_payload.do_not_submit_order",
        },
      ),
      payload?.do_not_submit_order === true ? "passed" : "failed",
      payload?.do_not_submit_order === true
        ? "Payload explicitly forbids order submission."
        : "Payload does not explicitly forbid order submission.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_human_confirmation_requirement",
        "Human confirmation required",
        "Human final confirmation in Avanza must be required.",
        "human_confirmation",
        "critical",
        {
          remediation:
            "Regenerate a payload that requires manual final broker confirmation.",
          source:
            "execution_payload.requires_manual_confirmation + human_final_confirmation_required",
        },
      ),
      payload?.requires_manual_confirmation === true &&
        payload?.human_final_confirmation_required === true
        ? "passed"
        : "failed",
      payload?.requires_manual_confirmation === true &&
        payload?.human_final_confirmation_required === true
        ? "Payload requires human final confirmation."
        : "Payload does not require human final confirmation.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_ticker",
        "Ticker present",
        "Ticker/symbol is required to prepare the broker form.",
        "order_fields",
        "critical",
        {
          remediation: "Regenerate the payload with a known ticker.",
          source: "execution_payload.ticker",
        },
      ),
      tickerPresent ? "passed" : "failed",
      tickerPresent ? "Ticker is present." : "Ticker/symbol is missing.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_side",
        "Side present",
        "Order side must be known and supported before form preparation.",
        "order_fields",
        "critical",
        {
          remediation: "Use a supported long/buy payload.",
          source: "execution_payload.direction",
        },
      ),
      sidePresent ? "passed" : "failed",
      sidePresent
        ? "Side is available and maps to buy for the long setup."
        : "Side/direction is missing or unsupported.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_quantity",
        "Quantity present",
        "Share quantity must be known and greater than zero.",
        "order_fields",
        "critical",
        {
          remediation: "Regenerate position sizing and payload.",
          source: "execution_payload.shares",
        },
      ),
      quantityPresent ? "passed" : "failed",
      quantityPresent
        ? "Quantity is greater than zero."
        : "Quantity/shares is missing or invalid.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_entry_price",
        "Entry price present",
        "Estimated entry price must be known and greater than zero.",
        "order_fields",
        "critical",
        {
          remediation: "Regenerate ADD TRADE validation and payload.",
          source: "execution_payload.entry_price",
        },
      ),
      entryPresent ? "passed" : "failed",
      entryPresent
        ? "Estimated entry price is greater than zero."
        : "Estimated/planned entry price is missing or invalid.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_stop_price",
        "Stop price present",
        "Stop reference must be known and greater than zero.",
        "order_fields",
        "critical",
        {
          remediation: "Regenerate the setup with a valid stop.",
          source: "execution_payload.stop_loss",
        },
      ),
      stopPresent ? "passed" : "failed",
      stopPresent
        ? "Stop loss reference is greater than zero."
        : "Stop price is missing or invalid.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "missing_target_price",
        "Target price present",
        "Target reference must be known before agent handoff.",
        "order_fields",
        "critical",
        {
          remediation: "Regenerate or review the recommendation target.",
          source: "execution_payload.target_price",
        },
      ),
      targetPresent ? "passed" : "failed",
      targetPresent
        ? "Target price reference is greater than zero."
        : "Target price is missing or invalid.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "unknown_required_field",
        "Required fields known",
        "Unknown required fields must block handoff.",
        "unknown_state",
        "critical",
        {
          remediation: "Regenerate the payload and resolve missing fields.",
          source: "agent_hard_stop_contract.required_fields",
        },
      ),
      requiredFieldMissing ? "failed" : "passed",
      requiredFieldMissing
        ? "One or more required command fields are missing or unknown."
        : "All required command fields are known.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "agent_readiness_blocked",
        "Readiness not blocked",
        "Agent readiness must not be blocked.",
        "readiness",
        "critical",
        {
          remediation: "Resolve Agent Readiness issues before handoff.",
          source: "agent_readiness.status",
        },
      ),
      agentReadiness
        ? agentReadiness.status === "blocked"
          ? "failed"
          : agentReadiness.status === "warning"
            ? "warning"
            : "passed"
        : "warning",
      agentReadiness
        ? agentReadiness.status === "blocked"
          ? "Agent readiness is blocked."
          : agentReadiness.status === "warning"
            ? "Agent readiness has warnings that require manual review."
            : "Agent readiness is ready."
        : "Agent readiness result is unavailable.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "handoff_integrity_failed",
        "Handoff integrity not failed",
        "Handoff integrity must not be failed.",
        "integrity",
        "critical",
        {
          remediation: "Resolve handoff integrity issues before proceeding.",
          source: "handoff_integrity.status",
        },
      ),
      handoffIntegrity
        ? handoffIntegrity.status === "failed"
          ? "failed"
          : handoffIntegrity.status === "warning"
            ? "warning"
            : "passed"
        : "warning",
      handoffIntegrity
        ? handoffIntegrity.status === "failed"
          ? "Handoff integrity failed."
          : handoffIntegrity.status === "warning"
            ? "Handoff integrity has warnings."
            : "Handoff integrity passed."
        : "Handoff integrity result is unavailable.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "agent_dry_run_failed",
        "Pre-agent dry run not failed",
        "Pre-agent dry run must not be failed.",
        "dry_run",
        "critical",
        {
          remediation: "Run or resolve the pre-agent dry run before handoff.",
          source: "agent_dry_run.status",
        },
      ),
      dryRunResult
        ? dryRunResult.status === "dry_run_failed"
          ? "failed"
          : "passed"
        : "warning",
      dryRunResult
        ? dryRunResult.status === "dry_run_failed"
          ? "Pre-agent dry run failed."
          : "Pre-agent dry run passed."
        : "Pre-agent dry run has not been run.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "credentials_required_or_detected",
        "No credential handling",
        "The handoff contract must not include or require broker credentials.",
        "security",
        "critical",
        {
          remediation: "Remove any credential handling and stop the handoff.",
          source: "agent_hard_stop_contract.security",
        },
      ),
      credentialsRequiredOrDetected ? "failed" : "passed",
      credentialsRequiredOrDetected
        ? "Credential handling was required or detected."
        : "No credentials are included or required by this contract.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "unknown_broker_ui_state",
        "Broker UI state known",
        "A future browser-agent must stop if the broker UI state is unknown.",
        "unknown_state",
        "critical",
        {
          remediation: "Stop and ask the human to review the broker UI state.",
          source: "future_browser_agent.broker_ui_state",
        },
      ),
      brokerUiState === "not_applicable"
        ? "not_applicable"
        : brokerUiState === "known_safe"
          ? "passed"
          : brokerUiState === "unsafe"
            ? "failed"
            : "unknown",
      brokerUiState === "not_applicable"
        ? "Broker UI state is not evaluated because Trade does not control a browser."
        : brokerUiState === "known_safe"
          ? "Broker UI state is known safe."
          : brokerUiState === "unsafe"
            ? "Broker UI state is unsafe."
            : "Broker UI state is unknown.",
      evaluatedAt,
    ),
    evaluate(
      rule(
        "unsafe_to_continue",
        "Safe to continue",
        "Any explicit unsafe state must stop agent handoff.",
        "unknown_state",
        "critical",
        {
          remediation: "Stop the handoff and require manual review.",
          source: "agent_hard_stop_contract.safety",
        },
      ),
      unsafeToContinue ? "failed" : "passed",
      unsafeToContinue
        ? "An unsafe-to-continue state was detected."
        : "No explicit unsafe-to-continue state is present.",
      evaluatedAt,
    ),
  ];

  const failedRules = rules.filter((item) => item.status === "failed");
  const warningRules = rules.filter((item) => item.status === "warning");
  const unknownRules = rules.filter((item) => item.status === "unknown");
  const blockingRules = rules.filter(
    (item) => ruleBlocks(item, "blocks_agent") || ruleBlocks(item, "blocks_mark_ready"),
  );
  const topBlockers = blockingRules.slice(0, 5);
  const topWarnings = [...warningRules, ...unknownRules].slice(0, 5);
  const canMarkReadyForAgent = !rules.some((item) =>
    ruleBlocks(item, "blocks_mark_ready"),
  );
  const canPrepareBrokerForm = !rules.some((item) =>
    ruleBlocks(item, "blocks_agent"),
  );
  const contractAllowsLiveTrade = !rules.some((item) =>
    ruleBlocks(item, "blocks_live_trade_creation"),
  );
  const canCreateLiveTrade = liveTradeCreationRelevant
    ? Boolean(existingCanCreateLiveTrade) && contractAllowsLiveTrade
    : contractAllowsLiveTrade;
  const overallStatus: AgentHardStopOverallStatus =
    blockingRules.length > 0
      ? "blocked"
      : warningRules.length > 0 || unknownRules.length > 0
        ? "warning"
        : "ready";

  return {
    contract_version: "1.0",
    evaluated_at: evaluatedAt,
    overall_status: overallStatus,
    can_mark_ready_for_agent: canMarkReadyForAgent,
    can_prepare_broker_form: canPrepareBrokerForm,
    can_create_live_trade: canCreateLiveTrade,
    failed_count: failedRules.length,
    warning_count: warningRules.length,
    unknown_count: unknownRules.length,
    rules,
    top_blockers: topBlockers,
    top_warnings: topWarnings,
    machine_summary: {
      top_blocker_ids: topBlockers.map((item) => item.id),
      top_warning_ids: topWarnings.map((item) => item.id),
      failed_rule_ids: failedRules.map((item) => item.id),
      warning_rule_ids: warningRules.map((item) => item.id),
      unknown_rule_ids: unknownRules.map((item) => item.id),
    },
    human_summary:
      overallStatus === "blocked"
        ? "Agent handoff is blocked until critical hard stops are resolved."
        : overallStatus === "warning"
          ? "Agent handoff is possible only with manual review of warnings or unknown states."
          : "Agent hard stop contract is ready. Human final broker confirmation remains required.",
  };
}

export function toAgentHardStopContractMetadataSnapshot(
  contract: AgentHardStopContract,
): AgentHardStopContractMetadataSnapshot {
  return {
    contract_version: contract.contract_version,
    overall_status: contract.overall_status,
    failed_count: contract.failed_count,
    warning_count: contract.warning_count,
    unknown_count: contract.unknown_count,
    evaluated_at: contract.evaluated_at,
    top_blocker_ids: contract.machine_summary.top_blocker_ids,
    top_warning_ids: contract.machine_summary.top_warning_ids,
  };
}
