import type { AvanzaAgentBridgeTransport } from "@/lib/avanza-agent-bridge";

export type AvanzaAgentBridgeConfig = {
  selectedTransport: AvanzaAgentBridgeTransport;
  updatedAt: string | null;
  storageAvailable: boolean;
  error: string | null;
};

export type AvanzaAgentBridgeTransportOption = {
  transport: AvanzaAgentBridgeTransport;
  enabled: boolean;
  note: string;
};

export const AVANZA_AGENT_BRIDGE_CONFIG_STORAGE_KEY =
  "ture_avanza_agent_bridge_config_v1";

export const avanzaAgentBridgeTransportOptions: AvanzaAgentBridgeTransportOption[] =
  [
    {
      transport: "none",
      enabled: true,
      note: "Active local no-transport mode.",
    },
    {
      transport: "echo",
      enabled: true,
      note: "Echo bridge - Dev only. Tests bridge request/result plumbing. Does not connect to Avanza.",
    },
    {
      transport: "local_process",
      enabled: false,
      note: "Future local process bridge.",
    },
    {
      transport: "browser_extension",
      enabled: false,
      note: "Future browser extension bridge.",
    },
    {
      transport: "websocket",
      enabled: false,
      note: "Future WebSocket bridge.",
    },
    {
      transport: "http",
      enabled: false,
      note: "Future HTTP bridge.",
    },
    {
      transport: "native_messaging",
      enabled: false,
      note: "Future native messaging bridge.",
    },
  ];

function normalizedErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown localStorage error.";
}

export function normalizeAvanzaAgentBridgeTransport(
  value: unknown,
): AvanzaAgentBridgeTransport {
  return value === "echo" ? "echo" : "none";
}

export function createDefaultAvanzaAgentBridgeConfig(
  options: Partial<Pick<AvanzaAgentBridgeConfig, "error">> = {},
): AvanzaAgentBridgeConfig {
  return {
    selectedTransport: "none",
    updatedAt: null,
    storageAvailable: typeof window !== "undefined",
    error: options.error ?? null,
  };
}

export function normalizeAvanzaAgentBridgeConfig(
  value: unknown,
  storageAvailable = typeof window !== "undefined",
): AvanzaAgentBridgeConfig {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {
      ...createDefaultAvanzaAgentBridgeConfig(),
      storageAvailable,
    };
  }

  const record = value as Record<string, unknown>;
  const updatedAt =
    typeof record.updatedAt === "string" &&
    Number.isFinite(Date.parse(record.updatedAt))
      ? record.updatedAt
      : null;

  return {
    selectedTransport: normalizeAvanzaAgentBridgeTransport(
      record.selectedTransport,
    ),
    updatedAt,
    storageAvailable,
    error: null,
  };
}

export function readAvanzaAgentBridgeConfig(): AvanzaAgentBridgeConfig {
  if (typeof window === "undefined") {
    return createDefaultAvanzaAgentBridgeConfig();
  }

  try {
    const stored = window.localStorage.getItem(
      AVANZA_AGENT_BRIDGE_CONFIG_STORAGE_KEY,
    );

    return stored
      ? normalizeAvanzaAgentBridgeConfig(JSON.parse(stored), true)
      : createDefaultAvanzaAgentBridgeConfig();
  } catch (error) {
    return createDefaultAvanzaAgentBridgeConfig({
      error: normalizedErrorMessage(error),
    });
  }
}

export function writeAvanzaAgentBridgeConfig(config: AvanzaAgentBridgeConfig) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(
      AVANZA_AGENT_BRIDGE_CONFIG_STORAGE_KEY,
      JSON.stringify({
        selectedTransport: normalizeAvanzaAgentBridgeTransport(
          config.selectedTransport,
        ),
        updatedAt: config.updatedAt,
      }),
    );

    return true;
  } catch {
    return false;
  }
}

export function clearAvanzaAgentBridgeConfig() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.removeItem(AVANZA_AGENT_BRIDGE_CONFIG_STORAGE_KEY);

    return true;
  } catch {
    return false;
  }
}
