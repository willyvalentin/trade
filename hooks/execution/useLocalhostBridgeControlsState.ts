"use client";

import { useState } from "react";

import {
  type AvanzaAgentAdapterValidationResult,
  type AvanzaAgentRequest,
} from "@/lib/avanza-agent-adapter";
import {
  type AvanzaAgentBridgeEnvelope,
  type AvanzaAgentBridgeEnvelopeValidationResult,
} from "@/lib/avanza-agent-bridge";
import { createAvanzaAgentBridgeFromConfig } from "@/lib/avanza-agent-bridge-factory";
import { readAvanzaAgentBridgeConfig } from "@/lib/avanza-agent-bridge-config";
import {
  appendAvanzaAgentRun,
  createStoredAvanzaAgentRun,
} from "@/lib/avanza-agent-run-store";
import type { AvanzaExecutionHandoff } from "@/lib/avanza-execution-handoff";
import {
  cancelLocalhostBridgeRun,
  checkLocalhostBridgeRunnerSelfCheck,
  runLocalhostBridgeAvanzaDryRunStub,
  runLocalhostBridgeDryRun,
  type LocalhostBridgeClientAvanzaDryRunStubResult,
  type LocalhostBridgeClientCancelResult,
  type LocalhostBridgeClientRunResult,
  type LocalhostBridgeClientRunnerSelfCheckResult,
} from "@/lib/avanza-localhost-bridge-client";
import type { ExecutionIntent } from "@/lib/execution";
import type { ExecutionLifecycleSnapshot } from "@/lib/execution-state-machine";
import {
  appendExecutionAuditEvents,
  createExecutionAuditEvent,
} from "@/lib/execution-event-log";
import type { ExecutionIntentToAvanzaDryRunResult } from "@/lib/execution-intent-to-avanza-dry-run";
import { appendSafeBrowserActionDiagnostics } from "@/lib/safe-browser-action-diagnostics-store";

export type UseLocalhostBridgeControlsStateInput = {
  avanzaAgentBridgeEnvelope: AvanzaAgentBridgeEnvelope | null;
  avanzaAgentBridgeEnvelopeValidation:
    | AvanzaAgentBridgeEnvelopeValidationResult
    | null;
  avanzaAgentRequest: AvanzaAgentRequest | null;
  avanzaAgentRequestValidation: AvanzaAgentAdapterValidationResult | null;
  avanzaDryRunRequestPreview: ExecutionIntentToAvanzaDryRunResult | null;
  executionDevToolsEnabled: boolean;
  localLifecycle: ExecutionLifecycleSnapshot;
  selectedHandoff: AvanzaExecutionHandoff | null;
  selectedIntent: ExecutionIntent | null;
  setAgentRunStoreMessage: (message: string) => void;
};

function getLocalhostMockPageBaseUrl(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const url = new URL(window.location.origin);

    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
    ) {
      return url.origin;
    }
  } catch {
    return undefined;
  }

  return "http://localhost:3000";
}

export function useLocalhostBridgeControlsState({
  avanzaAgentBridgeEnvelope,
  avanzaAgentBridgeEnvelopeValidation,
  avanzaAgentRequest,
  avanzaAgentRequestValidation,
  avanzaDryRunRequestPreview,
  executionDevToolsEnabled,
  localLifecycle,
  selectedHandoff,
  selectedIntent,
  setAgentRunStoreMessage,
}: UseLocalhostBridgeControlsStateInput) {
  const [localhostBridgeRunResult, setLocalhostBridgeRunResult] =
    useState<LocalhostBridgeClientRunResult | null>(null);
  const [isLocalhostBridgeRunRunning, setIsLocalhostBridgeRunRunning] =
    useState(false);
  const [localhostBridgeRunMessage, setLocalhostBridgeRunMessage] =
    useState("");
  const [
    localhostBridgeSelfCheckResult,
    setLocalhostBridgeSelfCheckResult,
  ] = useState<LocalhostBridgeClientRunnerSelfCheckResult | null>(null);
  const [
    isLocalhostBridgeSelfCheckRunning,
    setIsLocalhostBridgeSelfCheckRunning,
  ] = useState(false);
  const [localhostBridgeSelfCheckMessage, setLocalhostBridgeSelfCheckMessage] =
    useState("");
  const [
    localhostDryRunBridgeStubResult,
    setLocalhostDryRunBridgeStubResult,
  ] = useState<LocalhostBridgeClientAvanzaDryRunStubResult | null>(null);
  const [
    isLocalhostDryRunBridgeStubRunning,
    setIsLocalhostDryRunBridgeStubRunning,
  ] = useState(false);
  const [
    localhostDryRunBridgeStubMessage,
    setLocalhostDryRunBridgeStubMessage,
  ] = useState("");
  const [localhostMockAgentRunResult, setLocalhostMockAgentRunResult] =
    useState<LocalhostBridgeClientRunResult | null>(null);
  const [isLocalhostMockAgentRunRunning, setIsLocalhostMockAgentRunRunning] =
    useState(false);
  const [localhostMockAgentRunMessage, setLocalhostMockAgentRunMessage] =
    useState("");
  const [localhostBridgeCancelResult, setLocalhostBridgeCancelResult] =
    useState<LocalhostBridgeClientCancelResult | null>(null);
  const [isLocalhostBridgeCancelRunning, setIsLocalhostBridgeCancelRunning] =
    useState(false);
  const [localhostBridgeCancelMessage, setLocalhostBridgeCancelMessage] =
    useState("");

  const canRunLocalhostBridgeDryRun =
    executionDevToolsEnabled &&
    Boolean(avanzaAgentRequest) &&
    Boolean(avanzaAgentBridgeEnvelope) &&
    avanzaAgentRequestValidation?.ok === true &&
    avanzaAgentBridgeEnvelopeValidation?.ok === true &&
    !isLocalhostBridgeRunRunning;
  const canCheckLocalhostBridgeSelfCheck =
    executionDevToolsEnabled && !isLocalhostBridgeSelfCheckRunning;
  const canTestLocalhostDryRunBridgeStub =
    executionDevToolsEnabled &&
    avanzaDryRunRequestPreview?.ok === true &&
    Boolean(avanzaDryRunRequestPreview.request) &&
    !isLocalhostDryRunBridgeStubRunning;
  const canRunLocalhostMockAgent =
    executionDevToolsEnabled &&
    Boolean(avanzaAgentRequest) &&
    Boolean(avanzaAgentBridgeEnvelope) &&
    avanzaAgentRequestValidation?.ok === true &&
    avanzaAgentBridgeEnvelopeValidation?.ok === true &&
    !isLocalhostBridgeRunRunning &&
    !isLocalhostMockAgentRunRunning;
  const localhostBridgeCancelRequestId =
    localhostBridgeRunResult?.response?.requestId ??
    localhostBridgeRunResult?.result?.requestId ??
    avanzaAgentRequest?.requestId ??
    null;
  const canCancelLocalhostBridgeRun =
    executionDevToolsEnabled &&
    Boolean(localhostBridgeCancelRequestId) &&
    !isLocalhostBridgeCancelRunning;

  async function checkLocalhostBridgeSelfCheck() {
    setLocalhostBridgeSelfCheckMessage("");
    setLocalhostBridgeSelfCheckResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostBridgeSelfCheckMessage(
        "Localhost runner self-check is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    setIsLocalhostBridgeSelfCheckRunning(true);

    try {
      const selfCheckResult = await checkLocalhostBridgeRunnerSelfCheck();

      setLocalhostBridgeSelfCheckResult(selfCheckResult);
      setLocalhostBridgeSelfCheckMessage(
        selfCheckResult.ok
          ? "Localhost runner self-check completed. This is readiness metadata only; no browser or Avanza action occurred."
          : "Localhost runner self-check finished safely with errors. No browser or Avanza action occurred.",
      );
    } catch (error) {
      setLocalhostBridgeSelfCheckMessage(
        error instanceof Error
          ? `Localhost runner self-check failed safely: ${error.message}`
          : "Localhost runner self-check failed safely. No browser or Avanza action occurred.",
      );
    } finally {
      setIsLocalhostBridgeSelfCheckRunning(false);
    }
  }

  async function testLocalhostDryRunBridgeStub() {
    setLocalhostDryRunBridgeStubMessage("");
    setLocalhostDryRunBridgeStubResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostDryRunBridgeStubMessage(
        "Dry-run bridge response preview is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    if (!avanzaDryRunRequestPreview?.ok || !avanzaDryRunRequestPreview.request) {
      setLocalhostDryRunBridgeStubMessage(
        "Unavailable: invalid dry-run request.",
      );
      return;
    }

    if (!selectedIntent) {
      setLocalhostDryRunBridgeStubMessage(
        "Dry-run bridge response preview requires a selected execution intent.",
      );
      return;
    }

    setIsLocalhostDryRunBridgeStubRunning(true);

    try {
      const stubResult = await runLocalhostBridgeAvanzaDryRunStub({
        dryRunOrderInput: avanzaDryRunRequestPreview.request,
        requestId: `localhost_dry_run_bridge_stub_${selectedIntent.intent_id}`,
        capabilityValidationOptions: {
          allowAvanzaDryRun: true,
          allowBrokerSubmission: false,
          allowAutomaticMode: false,
        },
        metadata: {
          source: "execution_handoff_preview_modal",
          read_only_response_preview: true,
          stub_only: true,
          no_browser_actions_requested: true,
          no_avanza_session: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      });

      setLocalhostDryRunBridgeStubResult(stubResult);
      setLocalhostDryRunBridgeStubMessage(
        stubResult.ok
          ? "Dry-run bridge stub response normalized. No browser actions or broker submission occurred."
          : "Dry-run bridge stub response finished safely with errors or blockers. No browser actions or broker submission occurred.",
      );
    } catch (error) {
      setLocalhostDryRunBridgeStubMessage(
        error instanceof Error
          ? `Dry-run bridge stub check failed safely: ${error.message}`
          : "Dry-run bridge stub check failed safely. No browser actions or broker submission occurred.",
      );
    } finally {
      setIsLocalhostDryRunBridgeStubRunning(false);
    }
  }

  async function runLocalhostBridgeEcho() {
    setLocalhostBridgeRunMessage("");
    setLocalhostBridgeRunResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostBridgeRunMessage(
        "Localhost bridge echo is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    if (!avanzaAgentRequest || !avanzaAgentBridgeEnvelope) {
      setLocalhostBridgeRunMessage(
        "Localhost bridge echo requires a ready future-agent request and bridge envelope.",
      );
      return;
    }

    if (
      avanzaAgentRequestValidation?.ok !== true ||
      avanzaAgentBridgeEnvelopeValidation?.ok !== true
    ) {
      setLocalhostBridgeRunMessage(
        "Localhost bridge echo is blocked until request and envelope validation pass.",
      );
      return;
    }

    if (!selectedIntent || !selectedHandoff) {
      setLocalhostBridgeRunMessage(
        "Localhost bridge echo requires selected execution handoff context.",
      );
      return;
    }

    setIsLocalhostBridgeRunRunning(true);

    try {
      const bridgeConfig = readAvanzaAgentBridgeConfig();
      const factoryResult = createAvanzaAgentBridgeFromConfig({
        selectedTransport: bridgeConfig.selectedTransport,
        metadata: {
          source: "localhost_bridge_echo_button",
          runner_path: "localhost_bridge_stub",
          dry_run: true,
          local_diagnostics_only: true,
          no_browser_automation: true,
          no_order_prepared: true,
          no_order_submitted: true,
          no_broker_result_created: true,
        },
      });
      const runResult = await runLocalhostBridgeDryRun({
        envelope: avanzaAgentBridgeEnvelope,
        request: avanzaAgentRequest,
        metadata: {
          source: "execution_handoff_preview_modal",
          runner_path: "localhost_bridge_stub",
          selected_transport: factoryResult.selectedTransport,
          resolved_transport: factoryResult.resolvedTransport,
          dry_run: true,
          local_diagnostics_only: true,
          no_avanza_session: true,
          no_browser_automation: true,
          no_order_prepared: true,
          no_order_submitted: true,
          no_broker_result_created: true,
        },
      });

      setLocalhostBridgeRunResult(runResult);

      appendExecutionAuditEvents([
        createExecutionAuditEvent({
          type: "localhost_bridge_run_stub",
          createdAt: runResult.completedAt,
          lifecycleId: localLifecycle.lifecycleId,
          intentId: selectedIntent.intent_id,
          recommendationId: selectedIntent.trading_package.recommendation_id,
          positionId: selectedIntent.trading_package.live_position_id,
          ticker: selectedIntent.trading_package.ticker,
          action: selectedIntent.action,
          mode: selectedIntent.mode,
          triggerType: selectedIntent.trigger_type,
          broker: "avanza",
          handoffVersion: selectedHandoff.version,
          handoffStatus: selectedHandoff.status,
          message:
            "Dev-only localhost bridge echo run completed locally. No Avanza session opened, no browser automation ran, no order was prepared or submitted, and no broker result was created.",
          metadata: {
            stub_only: true,
            localhost_bridge_stub: true,
            dry_run: true,
            reachable: runResult.reachable,
            ok: runResult.ok,
            status_code: runResult.statusCode,
            accepted: runResult.response?.accepted ?? false,
            base_url: runResult.baseUrl,
            selected_transport: factoryResult.selectedTransport,
            resolved_transport: factoryResult.resolvedTransport,
            broker_result_present: Boolean(runResult.result?.brokerResult),
            progress_event_count: runResult.result?.progressEvents.length ?? 0,
            no_avanza_session: true,
            no_browser_automation: true,
            no_order_prepared: true,
            no_order_submitted: true,
            no_broker_result_created: true,
          },
        }),
      ]);

      if (runResult.result) {
        const storedRun = createStoredAvanzaAgentRun({
          request: avanzaAgentRequest,
          result: runResult.result,
          runner: {
            runnerId: "localhost_bridge_stub",
            name: "Localhost Bridge Stub",
            version: "avanza_localhost_bridge_v1",
            supportsRealBrokerAutomation: false,
          },
          metadata: {
            source: "execution_handoff_preview_modal",
            runner_path: "localhost_bridge_stub",
            selected_transport: factoryResult.selectedTransport,
            resolved_transport: factoryResult.resolvedTransport,
            dry_run: true,
            local_diagnostics_only: true,
            no_avanza_session: true,
            no_browser_automation: true,
            no_order_prepared: true,
            no_order_submitted: true,
            no_broker_result_created: true,
          },
        });
        const stored = appendAvanzaAgentRun(storedRun);

        setAgentRunStoreMessage(
          stored
            ? "Localhost bridge echo run saved as local agent-run diagnostics. It is not a broker confirmation."
            : "Localhost bridge echo returned a result, but the local diagnostics run could not be saved.",
        );
      }

      setLocalhostBridgeRunMessage(
        runResult.ok
          ? "Localhost bridge echo completed. No Avanza session opened and no broker result was created."
          : "Localhost bridge echo finished safely with errors. No broker action occurred.",
      );
    } catch (error) {
      setLocalhostBridgeRunMessage(
        error instanceof Error
          ? `Localhost bridge echo failed safely: ${error.message}`
          : "Localhost bridge echo failed safely. No broker action occurred.",
      );
    } finally {
      setIsLocalhostBridgeRunRunning(false);
    }
  }

  async function runLocalhostMockAgent() {
    setLocalhostMockAgentRunMessage("");
    setLocalhostMockAgentRunResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostMockAgentRunMessage(
        "Localhost mock agent is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    if (!avanzaAgentRequest || !avanzaAgentBridgeEnvelope) {
      setLocalhostMockAgentRunMessage(
        "Localhost mock agent requires a ready future-agent request and bridge envelope.",
      );
      return;
    }

    if (
      avanzaAgentRequestValidation?.ok !== true ||
      avanzaAgentBridgeEnvelopeValidation?.ok !== true
    ) {
      setLocalhostMockAgentRunMessage(
        "Localhost mock agent is blocked until request and envelope validation pass.",
      );
      return;
    }

    if (!selectedIntent || !selectedHandoff) {
      setLocalhostMockAgentRunMessage(
        "Localhost mock agent requires selected execution handoff context.",
      );
      return;
    }

    setIsLocalhostMockAgentRunRunning(true);

    try {
      const bridgeConfig = readAvanzaAgentBridgeConfig();
      const factoryResult = createAvanzaAgentBridgeFromConfig({
        selectedTransport: bridgeConfig.selectedTransport,
        metadata: {
          source: "localhost_mock_agent_button",
          runner_path: "localhost_mock_agent_run",
          dry_run: true,
          local_diagnostics_only: true,
          local_mock_page_review_only: true,
          no_avanza_session: true,
          no_real_broker_automation: true,
          no_order_submitted: true,
          no_broker_result_created: true,
        },
      });
      const runResult = await runLocalhostBridgeDryRun({
        envelope: avanzaAgentBridgeEnvelope,
        request: avanzaAgentRequest,
        enableMockAgentRun: true,
        mockPageBaseUrl: getLocalhostMockPageBaseUrl(),
        metadata: {
          source: "execution_handoff_preview_modal",
          runner_path: "localhost_mock_agent_run",
          selected_transport: factoryResult.selectedTransport,
          resolved_transport: factoryResult.resolvedTransport,
          dry_run: true,
          local_diagnostics_only: true,
          local_mock_page_review_only: true,
          no_avanza_session: true,
          no_real_broker_automation: true,
          no_order_submitted: true,
          no_broker_result_created: true,
        },
      });

      setLocalhostMockAgentRunResult(runResult);
      const safeActionDiagnosticsStored =
        runResult.response?.safeActionDiagnostics
          ? appendSafeBrowserActionDiagnostics(
              runResult.response.safeActionDiagnostics,
            )
          : false;

      appendExecutionAuditEvents([
        createExecutionAuditEvent({
          type: "localhost_mock_agent_run_stub",
          createdAt: runResult.completedAt,
          lifecycleId: localLifecycle.lifecycleId,
          intentId: selectedIntent.intent_id,
          recommendationId: selectedIntent.trading_package.recommendation_id,
          positionId: selectedIntent.trading_package.live_position_id,
          ticker: selectedIntent.trading_package.ticker,
          action: selectedIntent.action,
          mode: selectedIntent.mode,
          triggerType: selectedIntent.trigger_type,
          broker: "avanza",
          handoffVersion: selectedHandoff.version,
          handoffStatus: selectedHandoff.status,
          message:
            "Dev-only localhost mock agent run completed against the local mock broker page only. No Avanza session opened, no real broker page was automated, no submit was clicked, and no broker result was created.",
          metadata: {
            stub_only: true,
            localhost_bridge_stub: true,
            path: "localhost_mock_agent_run",
            dry_run: true,
            reachable: runResult.reachable,
            ok: runResult.ok,
            status_code: runResult.statusCode,
            accepted: runResult.response?.accepted ?? false,
            base_url: runResult.baseUrl,
            selected_transport: factoryResult.selectedTransport,
            resolved_transport: factoryResult.resolvedTransport,
            mockAgentRunAttempted:
              runResult.response?.mockAgentRunAttempted ?? false,
            mockAgentRunOk: runResult.response?.mockAgentRunOk ?? false,
            mockAgentRunErrors: runResult.response?.mockAgentRunErrors ?? [],
            brokerResultPresent: Boolean(runResult.result?.brokerResult),
            progress_event_count: runResult.result?.progressEvents.length ?? 0,
            no_avanza_session: true,
            no_real_broker_automation: true,
            no_order_submitted: true,
            no_broker_result_created: true,
          },
        }),
      ]);

      if (runResult.result) {
        const storedRun = createStoredAvanzaAgentRun({
          request: avanzaAgentRequest,
          result: runResult.result,
          runner: {
            runnerId: "localhost_mock_agent_run",
            name: "Localhost Mock Agent Run",
            version: "avanza_localhost_bridge_v1",
            supportsRealBrokerAutomation: false,
          },
          metadata: {
            source: "execution_handoff_preview_modal",
            path: "localhost_mock_agent_run",
            selected_transport: factoryResult.selectedTransport,
            resolved_transport: factoryResult.resolvedTransport,
            dry_run: true,
            local_diagnostics_only: true,
            local_mock_page_review_only: true,
            mockAgentRunAttempted:
              runResult.response?.mockAgentRunAttempted ?? false,
            mockAgentRunOk: runResult.response?.mockAgentRunOk ?? false,
            mockAgentRunErrors: runResult.response?.mockAgentRunErrors ?? [],
            brokerResultPresent: Boolean(runResult.result.brokerResult),
            no_avanza_session: true,
            no_real_broker_automation: true,
            no_order_submitted: true,
            no_broker_result_created: true,
          },
        });
        const stored = appendAvanzaAgentRun(storedRun);

        setAgentRunStoreMessage(
          stored
            ? "Localhost mock agent run saved as local agent-run diagnostics. It is not a broker confirmation."
            : "Localhost mock agent returned a result, but the local diagnostics run could not be saved.",
        );
      }

      setLocalhostMockAgentRunMessage(
        runResult.ok
          ? safeActionDiagnosticsStored
            ? "Localhost mock agent completed. It reviewed only the local mock page, saved safe action diagnostics locally, and did not create a broker result."
            : "Localhost mock agent completed. It reviewed only the local mock page and did not create a broker result."
          : safeActionDiagnosticsStored
            ? "Localhost mock agent finished safely with errors. Safe action diagnostics were saved locally. No broker action occurred."
            : "Localhost mock agent finished safely with errors. No broker action occurred.",
      );
    } catch (error) {
      setLocalhostMockAgentRunMessage(
        error instanceof Error
          ? `Localhost mock agent failed safely: ${error.message}`
          : "Localhost mock agent failed safely. No broker action occurred.",
      );
    } finally {
      setIsLocalhostMockAgentRunRunning(false);
    }
  }

  async function cancelLocalhostBridgeEcho() {
    setLocalhostBridgeCancelMessage("");
    setLocalhostBridgeCancelResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostBridgeCancelMessage(
        "Localhost bridge cancel is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    if (!localhostBridgeCancelRequestId) {
      setLocalhostBridgeCancelMessage(
        "No localhost bridge request id is available to cancel.",
      );
      return;
    }

    if (!selectedIntent || !selectedHandoff) {
      setLocalhostBridgeCancelMessage(
        "Localhost bridge cancel requires selected execution handoff context.",
      );
      return;
    }

    setIsLocalhostBridgeCancelRunning(true);

    try {
      const cancelResult = await cancelLocalhostBridgeRun({
        requestId: localhostBridgeCancelRequestId,
        reason:
          "Manual dev-only cancel contract test from Execution Handoff Preview Modal.",
      });

      setLocalhostBridgeCancelResult(cancelResult);
      appendExecutionAuditEvents([
        createExecutionAuditEvent({
          type: "localhost_bridge_cancel_stub",
          createdAt: cancelResult.completedAt,
          lifecycleId: localLifecycle.lifecycleId,
          intentId: selectedIntent.intent_id,
          recommendationId: selectedIntent.trading_package.recommendation_id,
          positionId: selectedIntent.trading_package.live_position_id,
          ticker: selectedIntent.trading_package.ticker,
          action: selectedIntent.action,
          mode: selectedIntent.mode,
          triggerType: selectedIntent.trigger_type,
          broker: "avanza",
          handoffVersion: selectedHandoff.version,
          handoffStatus: selectedHandoff.status,
          message:
            "Dev-only localhost bridge cancel acknowledged locally. No Avanza session, browser automation, broker action, broker order, or trade state was cancelled.",
          metadata: {
            stub_only: true,
            localhost_bridge_stub: true,
            request_id: localhostBridgeCancelRequestId,
            reachable: cancelResult.reachable,
            ok: cancelResult.ok,
            status_code: cancelResult.statusCode,
            cancelled: cancelResult.cancelled ?? false,
            base_url: cancelResult.baseUrl,
            no_avanza_session: true,
            no_browser_automation: true,
            no_order_cancelled: true,
            no_broker_result_created: true,
          },
        }),
      ]);

      setLocalhostBridgeCancelMessage(
        cancelResult.ok
          ? "Localhost bridge cancel acknowledged by the stub. No broker or Avanza action was cancelled."
          : "Localhost bridge cancel finished safely with errors. No broker action occurred.",
      );
    } catch (error) {
      setLocalhostBridgeCancelMessage(
        error instanceof Error
          ? `Localhost bridge cancel failed safely: ${error.message}`
          : "Localhost bridge cancel failed safely. No broker action occurred.",
      );
    } finally {
      setIsLocalhostBridgeCancelRunning(false);
    }
  }

  return {
    canCancelLocalhostBridgeRun,
    canCheckLocalhostBridgeSelfCheck,
    canRunLocalhostBridgeDryRun,
    canRunLocalhostMockAgent,
    canTestLocalhostDryRunBridgeStub,
    cancelLocalhostBridgeEcho,
    checkLocalhostBridgeSelfCheck,
    isLocalhostBridgeCancelRunning,
    isLocalhostBridgeRunRunning,
    isLocalhostBridgeSelfCheckRunning,
    isLocalhostDryRunBridgeStubRunning,
    isLocalhostMockAgentRunRunning,
    localhostBridgeCancelMessage,
    localhostBridgeCancelResult,
    localhostBridgeCancelRequestId,
    localhostBridgeRunMessage,
    localhostBridgeRunResult,
    localhostBridgeSelfCheckMessage,
    localhostBridgeSelfCheckResult,
    localhostDryRunBridgeStubMessage,
    localhostDryRunBridgeStubResult,
    localhostMockAgentRunMessage,
    localhostMockAgentRunResult,
    runLocalhostBridgeEcho,
    runLocalhostMockAgent,
    testLocalhostDryRunBridgeStub,
  };
}
