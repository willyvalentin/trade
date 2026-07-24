"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getExecutionAuthorityForMode,
  isAutomaticExecutionModeFeatureEnabled,
  type ExecutionAuthority,
  type ExecutionMode,
} from "@/lib/execution";
import {
  getBrowserExecutionSettingsStorage,
  readExecutionModePreference as readStoredExecutionModePreference,
  writeExecutionModePreference as writeStoredExecutionModePreference,
} from "@/lib/execution-settings-persistence-helpers";

export type ExecutionSettingsState = {
  automaticExecutionEnabled: boolean;
  executionAuthority: ExecutionAuthority;
  executionMode: ExecutionMode;
  executionModeMessage: string;
  updateExecutionModePreference: (nextMode: ExecutionMode) => void;
};

function readExecutionModePreference(): ExecutionMode {
  return readStoredExecutionModePreference(getBrowserExecutionSettingsStorage(), {
    automaticEnabled: isAutomaticExecutionModeFeatureEnabled(),
  }).mode;
}

function writeExecutionModePreference(mode: ExecutionMode) {
  const result = writeStoredExecutionModePreference(
    getBrowserExecutionSettingsStorage(),
    mode,
  );

  if (!result.written) {
    throw new Error(result.error ?? "Execution mode storage unavailable.");
  }
}

export function useExecutionSettingsState(): ExecutionSettingsState {
  const automaticExecutionEnabled = isAutomaticExecutionModeFeatureEnabled();
  const [executionMode, setExecutionMode] = useState<ExecutionMode>(() =>
    readExecutionModePreference(),
  );
  const [executionModeMessage, setExecutionModeMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExecutionMode(readExecutionModePreference());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const executionAuthority = useMemo(
    () => getExecutionAuthorityForMode(executionMode),
    [executionMode],
  );

  function updateExecutionModePreference(nextMode: ExecutionMode) {
    if (nextMode === "automatic" && !automaticExecutionEnabled) {
      setExecutionModeMessage(
        "Automatic mode is locked. Set NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=true to enable the advanced opt-in.",
      );
      return;
    }

    try {
      writeExecutionModePreference(nextMode);
      setExecutionMode(nextMode);
      setExecutionModeMessage(
        nextMode === "automatic"
          ? "Automatic execution mode saved locally. Broker automation is still not connected in this build."
          : "Semi-automatic execution mode saved locally.",
      );
    } catch {
      setExecutionModeMessage("Could not save execution mode locally.");
    }
  }

  return {
    automaticExecutionEnabled,
    executionAuthority,
    executionMode,
    executionModeMessage,
    updateExecutionModePreference,
  };
}
