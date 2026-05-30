import type { AgentDryRunResult } from "@/lib/agent-dry-run";
import type { AgentHandoffCommand } from "@/lib/agent-handoff-command";
import type { AgentHardStopContract } from "@/lib/agent-hard-stop-contract";
import type { AgentFormMappingPreview } from "@/lib/agent-form-mapping-preview";
import type { AgentReadinessResult } from "@/lib/agent-readiness";
import type { BrokerOrderStatus } from "@/lib/broker-execution-metadata";
import type { TradeExecutionPayload } from "@/lib/execution-payload";

export type BuyOrderHandoffStatus = "ready" | "warning" | "blocked" | "pending";

export type BuyOrderHandoffStep = {
  id:
    | "setup_validated"
    | "execution_payload_generated"
    | "hard_stops_checked"
    | "agent_command_ready"
    | "form_mapping_preview_ready"
    | "broker_form_prepared"
    | "manual_avanza_confirmation_required"
    | "broker_fill_captured"
    | "ready_to_create_live_day_trade";
  label: string;
  status: BuyOrderHandoffStatus;
  description: string;
};

export type BuyOrderHandoffProgress = {
  overall_status: BuyOrderHandoffStatus;
  steps: BuyOrderHandoffStep[];
  next_action_label: string;
  next_action_description: string;
  can_mark_ready_for_agent: boolean;
  can_create_live_trade: boolean;
};

export type BuildBuyOrderHandoffProgressInput = {
  validationStatus?: "valid" | "warning" | "blocked" | "unavailable" | string | null;
  validationBlocked?: boolean | null;
  executionPayload?: TradeExecutionPayload | null;
  payloadExpired?: boolean | null;
  hardStopContract?: AgentHardStopContract | null;
  agentHandoffCommand?: AgentHandoffCommand | null;
  formMappingPreview?: AgentFormMappingPreview | null;
  readinessResult?: AgentReadinessResult | null;
  dryRunResult?: AgentDryRunResult | null;
  brokerFormPrepared?: boolean | null;
  manualBrokerConfirmed?: boolean | null;
  brokerPlanMatches?: boolean | null;
  brokerOrderStatus?: BrokerOrderStatus | string | null;
  brokerFillReady?: boolean | null;
  brokerFillBlockMessage?: string | null;
  canCreateLiveTrade?: boolean | null;
};

function fromReadyWarningBlocked(
  status: "ready" | "warning" | "blocked" | undefined,
): BuyOrderHandoffStatus {
  return status ?? "pending";
}

function step(
  id: BuyOrderHandoffStep["id"],
  label: string,
  status: BuyOrderHandoffStatus,
  description: string,
): BuyOrderHandoffStep {
  return { id, label, status, description };
}

function isFilledStatus(value: BuildBuyOrderHandoffProgressInput["brokerOrderStatus"]) {
  return value === "filled" || value === "partially_filled";
}

export function buildBuyOrderHandoffProgress({
  validationStatus,
  validationBlocked,
  executionPayload,
  payloadExpired,
  hardStopContract,
  agentHandoffCommand,
  formMappingPreview,
  readinessResult,
  dryRunResult,
  brokerFormPrepared,
  manualBrokerConfirmed,
  brokerPlanMatches,
  brokerOrderStatus,
  brokerFillReady,
  brokerFillBlockMessage,
  canCreateLiveTrade,
}: BuildBuyOrderHandoffProgressInput): BuyOrderHandoffProgress {
  const setupStatus: BuyOrderHandoffStatus =
    validationBlocked || validationStatus === "blocked"
      ? "blocked"
      : validationStatus === "warning" || validationStatus === "unavailable"
        ? "warning"
        : validationStatus === "valid"
          ? "ready"
          : "pending";
  const payloadStatus: BuyOrderHandoffStatus = !executionPayload
    ? "pending"
    : payloadExpired
      ? "blocked"
      : executionPayload.safety_warnings.length > 0
        ? "warning"
        : "ready";
  const hardStopStatus = fromReadyWarningBlocked(hardStopContract?.overall_status);
  const commandStatus = fromReadyWarningBlocked(agentHandoffCommand?.status);
  const formMappingStatus = fromReadyWarningBlocked(formMappingPreview?.overall_status);
  const canPrepareBrokerForm =
    hardStopContract?.can_prepare_broker_form === true &&
    formMappingPreview?.can_prepare_form !== false;
  const brokerFormStatus: BuyOrderHandoffStatus = brokerFormPrepared
    ? "ready"
    : hardStopStatus === "blocked" || commandStatus === "blocked"
      ? "blocked"
      : canPrepareBrokerForm || executionPayload?.handoff_status === "ready_for_agent"
        ? "pending"
        : "pending";
  const manualConfirmationStatus: BuyOrderHandoffStatus = manualBrokerConfirmed
    ? "ready"
    : brokerFormPrepared
      ? "pending"
      : hardStopStatus === "blocked" || commandStatus === "blocked"
        ? "blocked"
        : "pending";
  const brokerFillStatus: BuyOrderHandoffStatus =
    brokerOrderStatus === "submitted_not_filled"
      ? "blocked"
      : brokerFillReady && brokerOrderStatus === "partially_filled"
        ? "warning"
        : brokerFillReady && isFilledStatus(brokerOrderStatus)
          ? "ready"
          : brokerFillBlockMessage
            ? "pending"
            : "pending";
  const readyToCreateStatus: BuyOrderHandoffStatus = canCreateLiveTrade
    ? "ready"
    : brokerOrderStatus === "submitted_not_filled" || payloadExpired
      ? "blocked"
      : brokerFillStatus === "warning"
        ? "warning"
        : "pending";
  const steps: BuyOrderHandoffStep[] = [
    step(
      "setup_validated",
      "Setup validated",
      setupStatus,
      setupStatus === "ready"
        ? "ADD TRADE validation passed."
        : setupStatus === "warning"
          ? "Validation allows review, but manual attention is required."
          : setupStatus === "blocked"
            ? "Validation or freshness blocks the handoff."
            : "Run ADD TRADE validation before preparing the order.",
    ),
    step(
      "execution_payload_generated",
      "Execution payload generated",
      payloadStatus,
      payloadStatus === "ready"
        ? "Prepare-only execution payload is available."
        : payloadStatus === "warning"
          ? "Payload exists with safety warnings to review."
          : payloadStatus === "blocked"
            ? "Payload is expired or unavailable for use."
            : "Generate the execution payload from ADD TRADE.",
    ),
    step(
      "hard_stops_checked",
      "Hard stops checked",
      hardStopStatus,
      hardStopContract
        ? hardStopContract.human_summary
        : "Hard stop contract has not been evaluated yet.",
    ),
    step(
      "agent_command_ready",
      "Agent command ready",
      commandStatus,
      agentHandoffCommand
        ? "Agent handoff command is generated for prepare-only use."
        : "Agent command has not been generated yet.",
    ),
    step(
      "form_mapping_preview_ready",
      "Form mapping preview ready",
      formMappingStatus,
      formMappingPreview
        ? "Avanza form mapping preview is available for review."
        : "Form mapping preview has not been generated yet.",
    ),
    step(
      "broker_form_prepared",
      "Broker form prepared / pending",
      brokerFormStatus,
      brokerFormPrepared
        ? "Broker form prepared; final Avanza confirmation is still required."
        : "Prepare the Avanza order form and stop before final confirmation.",
    ),
    step(
      "manual_avanza_confirmation_required",
      "Manual Avanza confirmation required",
      manualConfirmationStatus,
      manualBrokerConfirmed
        ? "You marked the final Avanza confirmation as manually completed."
        : "You must manually click KÖP in Avanza. The app cannot do this.",
    ),
    step(
      "broker_fill_captured",
      "Broker fill captured",
      brokerFillStatus,
      brokerFillReady
        ? brokerOrderStatus === "partially_filled"
          ? "Partial fill captured; Live Day Trade will use filled shares."
          : "Broker fill price and shares are captured."
        : brokerFillBlockMessage || "Record the actual broker fill from Avanza.",
    ),
    step(
      "ready_to_create_live_day_trade",
      "Ready to create Live Day Trade",
      readyToCreateStatus,
      canCreateLiveTrade
        ? "Existing creation gates are satisfied."
        : "Complete the broker confirmation and fill capture before creation.",
    ),
  ];
  const canMarkReadyForAgent =
    !payloadExpired &&
    hardStopContract?.can_mark_ready_for_agent === true &&
    agentHandoffCommand?.status !== "blocked";
  const hardStopBlocked =
    setupStatus === "blocked" ||
    payloadStatus === "blocked" ||
    hardStopStatus === "blocked" ||
    commandStatus === "blocked" ||
    formMappingStatus === "blocked";
  const nextAction = (() => {
    if (hardStopBlocked) {
      return {
        label: "Resolve blocked hard stops",
        description: "Resolve blocked hard stops before agent handoff.",
      };
    }

    if (!executionPayload) {
      return {
        label: "Prepare buy order",
        description: "Validate setup and generate the buy order payload.",
      };
    }

    if (!agentHandoffCommand || !formMappingPreview) {
      return {
        label: "Review handoff package",
        description: "Review buy order handoff package.",
      };
    }

    if (executionPayload.handoff_status !== "ready_for_agent" && canMarkReadyForAgent) {
      return {
        label: "Mark ready for agent",
        description: "Mark buy order ready for agent.",
      };
    }

    if (!brokerFormPrepared) {
      return {
        label: "Prepare Avanza form",
        description: "Prepare the Avanza form, then stop before final confirmation.",
      };
    }

    if (!manualBrokerConfirmed) {
      return {
        label: "Manual KÖP required",
        description:
          "After manually confirming KÖP in Avanza, record the broker fill.",
      };
    }

    if (brokerPlanMatches === false) {
      return {
        label: "Review broker plan match",
        description: "Confirm the Avanza order matches the Trade plan before creation.",
      };
    }

    if (brokerOrderStatus === "submitted_not_filled") {
      return {
        label: "Wait for broker fill",
        description:
          "Wait for a filled or partially filled broker order before creating a Live Day Trade.",
      };
    }

    if (!brokerFillReady) {
      return {
        label: "Record broker fill",
        description: "Record actual fill price and shares from Avanza.",
      };
    }

    if (canCreateLiveTrade) {
      return {
        label: "Create Live Day Trade",
        description: "Broker fill captured. Create Live Day Trade.",
      };
    }

    return {
      label: "Review creation gates",
      description: "Review remaining ADD TRADE gates before creating the Live Day Trade.",
    };
  })();
  const hasBlocked = steps.some((item) => item.status === "blocked");
  const hasWarning = steps.some((item) => item.status === "warning");
  const hasPending = steps.some((item) => item.status === "pending");
  const overall_status: BuyOrderHandoffStatus = hasBlocked
    ? "blocked"
    : hasWarning
      ? "warning"
      : hasPending
        ? "pending"
        : "ready";

  void readinessResult;
  void dryRunResult;

  return {
    overall_status,
    steps,
    next_action_label: nextAction.label,
    next_action_description: nextAction.description,
    can_mark_ready_for_agent: canMarkReadyForAgent,
    can_create_live_trade: canCreateLiveTrade === true,
  };
}
