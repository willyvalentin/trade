import {
  createEchoAvanzaAgentBridge,
  createNoopAvanzaAgentBridge,
  getAvanzaAgentBridgeTransportDisplayLabel,
  type AvanzaAgentBridge,
  type AvanzaAgentBridgeTransport,
} from "@/lib/avanza-agent-bridge";
import {
  createAvanzaAgentBridgeRunner,
  type AvanzaAgentBridgeRunnerOptions,
} from "@/lib/avanza-agent-bridge-runner";
import type { AvanzaAgentRunner } from "@/lib/avanza-agent-runner";
import { isExecutionDevToolsEnabled } from "@/lib/execution";

export type AvanzaAgentBridgeFactoryInput = {
  selectedTransport?: AvanzaAgentBridgeTransport | string | null;
  metadata?: Record<string, unknown> | null;
  allowEchoBridge?: boolean;
};

export type AvanzaAgentBridgeFactoryResult = {
  bridge: AvanzaAgentBridge;
  selectedTransport: AvanzaAgentBridgeTransport;
  resolvedTransport: AvanzaAgentBridgeTransport;
  fallbackUsed: boolean;
  reason: string;
  warnings: string[];
};

export type AvanzaAgentBridgeRunnerFactoryResult =
  AvanzaAgentBridgeFactoryResult & {
    runner: AvanzaAgentRunner;
  };

const recognizedBridgeTransports: readonly AvanzaAgentBridgeTransport[] = [
  "none",
  "echo",
  "local_process",
  "browser_extension",
  "websocket",
  "http",
  "native_messaging",
];

function normalizeMetadata(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, unknown> | undefined {
  return metadata ? { ...metadata } : undefined;
}

function isRecognizedAvanzaAgentBridgeTransport(
  value: unknown,
): value is AvanzaAgentBridgeTransport {
  return recognizedBridgeTransports.includes(
    value as AvanzaAgentBridgeTransport,
  );
}

export function normalizeAvanzaAgentBridgeTransport(
  value: AvanzaAgentBridgeTransport | string | null | undefined,
): AvanzaAgentBridgeTransport {
  return isRecognizedAvanzaAgentBridgeTransport(value) ? value : "none";
}

export function createAvanzaAgentBridgeFromConfig(
  input: AvanzaAgentBridgeFactoryInput = {},
): AvanzaAgentBridgeFactoryResult {
  const warnings: string[] = [];
  const rawTransport = input.selectedTransport;
  const selectedTransport = normalizeAvanzaAgentBridgeTransport(rawTransport);
  const echoBridgeEnabled =
    input.allowEchoBridge === true || isExecutionDevToolsEnabled();
  const selectedTransportWasRecognized =
    rawTransport !== null &&
    typeof rawTransport !== "undefined" &&
    isRecognizedAvanzaAgentBridgeTransport(rawTransport);
  const resolvedTransport: AvanzaAgentBridgeTransport =
    selectedTransport === "echo" && echoBridgeEnabled ? "echo" : "none";
  const metadata = {
    ...(normalizeMetadata(input.metadata) ?? {}),
    selected_transport: selectedTransport,
    resolved_transport: resolvedTransport,
    no_real_transport_connected: true,
    no_browser_automation: true,
    no_broker_order_prepared: true,
    no_broker_order_submitted: true,
  };

  let fallbackUsed = false;
  let reason =
    resolvedTransport === "echo"
      ? "Echo bridge selected for local diagnostics only."
      : "Transport none selected; using no-op Avanza agent bridge.";

  if (
    !selectedTransportWasRecognized &&
    rawTransport !== null &&
    typeof rawTransport !== "undefined"
  ) {
    fallbackUsed = true;
    reason = `Transport ${String(rawTransport)} is not recognized in this build; using no-op bridge.`;
    warnings.push(reason);
  } else if (selectedTransport === "echo" && !echoBridgeEnabled) {
    fallbackUsed = true;
    reason =
      "Echo bridge is available only when execution dev tools are enabled; using no-op bridge.";
    warnings.push(reason);
  } else if (selectedTransport !== "none" && selectedTransport !== "echo") {
    fallbackUsed = true;
    reason = `Transport ${getAvanzaAgentBridgeTransportDisplayLabel(
      selectedTransport,
    )} is not implemented in this build; using no-op bridge.`;
    warnings.push(reason);
  } else if (rawTransport === null || typeof rawTransport === "undefined") {
    reason = "No bridge transport was provided; using no-op Avanza agent bridge.";
  }

  return {
    bridge:
      resolvedTransport === "echo"
        ? createEchoAvanzaAgentBridge({
            metadata: {
              ...metadata,
              fallback_used: fallbackUsed,
              factory_reason: reason,
            },
          })
        : createNoopAvanzaAgentBridge({
            metadata: {
              ...metadata,
              fallback_used: fallbackUsed,
              factory_reason: reason,
            },
          }),
    selectedTransport,
    resolvedTransport,
    fallbackUsed,
    reason,
    warnings,
  };
}

export function createAvanzaAgentBridgeRunnerFromConfig(
  input: AvanzaAgentBridgeFactoryInput & AvanzaAgentBridgeRunnerOptions = {},
): AvanzaAgentBridgeRunnerFactoryResult {
  const factoryResult = createAvanzaAgentBridgeFromConfig(input);
  const runner = createAvanzaAgentBridgeRunner(factoryResult.bridge, {
    runnerId: input.runnerId,
    name: input.name,
    version: input.version,
    allowUnavailableBridgeSend: input.allowUnavailableBridgeSend,
    metadata: {
      ...(normalizeMetadata(input.metadata) ?? {}),
      selected_transport: factoryResult.selectedTransport,
      resolved_transport: factoryResult.resolvedTransport,
      fallback_used: factoryResult.fallbackUsed,
      factory_reason: factoryResult.reason,
    },
  });

  return {
    ...factoryResult,
    runner,
  };
}
