import {
  buildAvanzaAgentResult,
  validateAvanzaAgentRequest,
  type AvanzaAgentRequest,
  type AvanzaAgentResult,
} from "@/lib/avanza-agent-adapter";
import {
  createNoopAvanzaAgentBridge,
  isRealAvanzaAgentBridge,
  type AvanzaAgentBridge,
  type AvanzaAgentBridgeHealth,
  type CreateNoopAvanzaAgentBridgeOptions,
} from "@/lib/avanza-agent-bridge";
import type {
  AvanzaAgentProgressCallback,
  AvanzaAgentRunner,
  AvanzaAgentRunnerRunOptions,
} from "@/lib/avanza-agent-runner";

export type AvanzaAgentBridgeRunnerOptions = {
  runnerId?: string | null;
  name?: string | null;
  version?: string | null;
  metadata?: Record<string, unknown> | null;
  allowUnavailableBridgeSend?: boolean;
};

export type CreateNoopAvanzaAgentBridgeRunnerOptions =
  CreateNoopAvanzaAgentBridgeOptions &
    AvanzaAgentBridgeRunnerOptions & {
      bridgeName?: string | null;
      bridgeVersion?: string | null;
    };

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function sanitizeIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function normalizeMetadata(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, unknown> | undefined {
  return metadata ? { ...metadata } : undefined;
}

function getRequestId(request: Partial<AvanzaAgentRequest> | null | undefined) {
  return optionalString(request?.requestId) ?? "unknown_request";
}

function isBridgeHealthRunnable(health: AvanzaAgentBridgeHealth) {
  return health.status === "available" || health.status === "connected";
}

function buildFailedBridgeRunnerResult(
  request: Partial<AvanzaAgentRequest> | null | undefined,
  error: string,
  rawSummary =
    "Bridge runner adapter did not call a broker, open Avanza, create a transport connection, or submit an order.",
): AvanzaAgentResult {
  return buildAvanzaAgentResult({
    requestId: getRequestId(request),
    status: "failed",
    progressEvents: [],
    error,
    rawSummary,
  });
}

function mergeMetadata(
  bridge: AvanzaAgentBridge,
  runnerId: string,
  baseMetadata: Record<string, unknown> | undefined,
  runMetadata: Record<string, unknown> | undefined,
) {
  return {
    ...(baseMetadata ?? {}),
    ...(runMetadata ?? {}),
    runner_id: runnerId,
    runner_adapter: "avanza_agent_bridge_runner",
    bridge_id: bridge.bridgeId,
    bridge_name: bridge.name,
    bridge_transport: bridge.transport,
    bridge_supports_real_broker_automation: bridge.supportsRealBrokerAutomation,
    no_browser_automation_added_by_adapter: true,
    no_broker_order_created_by_adapter: true,
  };
}

export function createAvanzaAgentBridgeRunner(
  bridge: AvanzaAgentBridge,
  options: AvanzaAgentBridgeRunnerOptions = {},
): AvanzaAgentRunner {
  const runnerId =
    optionalString(options.runnerId) ??
    `avanza_agent_bridge_runner_${sanitizeIdPart(bridge.bridgeId)}`;
  const name =
    optionalString(options.name) ?? `Bridge-backed Runner (${bridge.name})`;
  const version =
    optionalString(options.version) ?? "avanza_agent_bridge_runner_v1";
  const baseMetadata = normalizeMetadata(options.metadata);
  const allowUnavailableBridgeSend =
    options.allowUnavailableBridgeSend === true;

  return {
    runnerId,
    name,
    version,
    supportsRealBrokerAutomation: bridge.supportsRealBrokerAutomation,
    run: async (
      request: AvanzaAgentRequest,
      runOptions: AvanzaAgentRunnerRunOptions = {},
    ) => {
      const validation = validateAvanzaAgentRequest(request);

      if (!validation.ok) {
        return buildFailedBridgeRunnerResult(
          request,
          `Invalid Avanza agent request: ${validation.errors.join(" ")}`,
        );
      }

      if (runOptions.signal?.aborted) {
        return buildFailedBridgeRunnerResult(
          request,
          "Avanza agent bridge runner request was cancelled before bridge health check. No broker action occurred.",
        );
      }

      let health: AvanzaAgentBridgeHealth;

      try {
        health = await bridge.getHealth();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Avanza agent bridge health check failed unexpectedly.";

        return buildFailedBridgeRunnerResult(
          request,
          `Avanza agent bridge runner stopped safely before send: ${message}`,
        );
      }

      if (!allowUnavailableBridgeSend && !isBridgeHealthRunnable(health)) {
        return buildFailedBridgeRunnerResult(
          request,
          `Avanza agent bridge is ${health.status}: ${health.message} No broker action occurred.`,
          "Bridge health was not runnable. The adapter did not call sendRequest, open Avanza, create transport traffic, or submit an order.",
        );
      }

      if (runOptions.signal?.aborted) {
        return buildFailedBridgeRunnerResult(
          request,
          "Avanza agent bridge runner request was cancelled before bridge send. No broker action occurred.",
        );
      }

      try {
        return await bridge.sendRequest(request, {
          onProgress: runOptions.onProgress as
            | AvanzaAgentProgressCallback
            | undefined,
          signal: runOptions.signal,
          metadata: mergeMetadata(
            bridge,
            runnerId,
            baseMetadata,
            normalizeMetadata(runOptions.metadata),
          ),
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Avanza agent bridge send failed unexpectedly.";

        return buildFailedBridgeRunnerResult(
          request,
          `Avanza agent bridge runner stopped safely during send: ${message}`,
        );
      }
    },
  };
}

export function createNoopAvanzaAgentBridgeRunner(
  options: CreateNoopAvanzaAgentBridgeRunnerOptions = {},
): AvanzaAgentRunner {
  const bridge = createNoopAvanzaAgentBridge({
    bridgeId: options.bridgeId,
    name: options.bridgeName ?? options.name ?? "No-op Avanza Agent Bridge",
    version: options.bridgeVersion ?? options.version,
    createdAt: options.createdAt,
    metadata: options.metadata,
  });

  return createAvanzaAgentBridgeRunner(bridge, {
    runnerId: options.runnerId,
    name: options.name ?? "No-op Bridge-backed Avanza Agent Runner",
    version: options.version,
    metadata: options.metadata,
    allowUnavailableBridgeSend: options.allowUnavailableBridgeSend,
  });
}

export function runAvanzaAgentRequestViaBridge(
  request: AvanzaAgentRequest,
  bridge: AvanzaAgentBridge,
  options: AvanzaAgentRunnerRunOptions & AvanzaAgentBridgeRunnerOptions = {},
): Promise<AvanzaAgentResult> {
  const runner = createAvanzaAgentBridgeRunner(bridge, options);

  return runner.run(request, options);
}

export function isRealAvanzaAgentBridgeRunner(runner: AvanzaAgentRunner) {
  return runner.supportsRealBrokerAutomation === true;
}

export function isRealAvanzaAgentBridgeBackedRunner(
  bridge: AvanzaAgentBridge,
) {
  return isRealAvanzaAgentBridge(bridge);
}
