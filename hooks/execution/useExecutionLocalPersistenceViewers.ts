"use client";

import { useEffect, useMemo, useState } from "react";

import {
  clearDevMockBrokerResults,
  readDevMockBrokerResultStoreResult,
  type DevMockBrokerResultStoreReadResult,
  type StoredDevMockBrokerExecutionResult,
} from "@/lib/dev-mock-broker-result-store";
import {
  clearExecutionAuditEvents,
  readExecutionEventLog,
  type ExecutionAuditEvent,
  type ExecutionEventLogReadResult,
} from "@/lib/execution-event-log";
import {
  clearExecutionRecords,
  readExecutionRecordStoreResult,
  type ExecutionRecordStoreReadResult,
  type StoredExecutionRecord,
} from "@/lib/execution-record-store";
import {
  clearSemiAutoAgentLocalDevFlowEvents,
  readSemiAutoAgentLocalDevFlowEvents,
  type SemiAutoAgentLocalDevFlowEvent,
  type SemiAutoAgentLocalDevFlowReadResult,
} from "@/lib/semi-auto-agent-local-dev-flow-store";

export type ExecutionLocalPersistenceViewers = {
  executionEventLog: ExecutionEventLogReadResult;
  executionEventLogMessage: string;
  latestExecutionAuditEvents: ExecutionAuditEvent[];
  latestExecutionAuditTimestamp: string | null;
  executionRecordStore: ExecutionRecordStoreReadResult;
  executionRecordStoreMessage: string;
  latestExecutionRecords: StoredExecutionRecord[];
  latestExecutionRecordTimestamp: string | null;
  devMockBrokerResultStore: DevMockBrokerResultStoreReadResult;
  devMockBrokerResultStoreMessage: string;
  latestDevMockBrokerResults: StoredDevMockBrokerExecutionResult[];
  latestDevMockBrokerResultTimestamp: string | null;
  semiAutoAgentLocalDevFlowStore: SemiAutoAgentLocalDevFlowReadResult;
  semiAutoAgentLocalDevFlowStoreMessage: string;
  latestSemiAutoAgentLocalDevFlowEvents: SemiAutoAgentLocalDevFlowEvent[];
  latestSemiAutoAgentLocalDevFlowTimestamp: string | null;
  refreshExecutionEventLog: () => void;
  clearExecutionEventLog: () => void;
  refreshExecutionRecords: () => void;
  clearLocalExecutionRecords: () => void;
  refreshDevMockBrokerResults: () => void;
  clearLocalDevMockBrokerResults: () => void;
  refreshSemiAutoAgentLocalDevFlowEvents: () => void;
  clearSemiAutoAgentLocalDevFlowHistory: () => void;
  refreshAfterDevMockBrokerCapture: () => void;
};

function readExecutionEventLogForViewers(): ExecutionEventLogReadResult {
  return readExecutionEventLog();
}

function readExecutionRecordsForViewers(): ExecutionRecordStoreReadResult {
  return readExecutionRecordStoreResult();
}

function readDevMockBrokerResultsForViewers(): DevMockBrokerResultStoreReadResult {
  return readDevMockBrokerResultStoreResult();
}

function readSemiAutoAgentLocalDevFlowForViewers(): SemiAutoAgentLocalDevFlowReadResult {
  return readSemiAutoAgentLocalDevFlowEvents();
}

export function useExecutionLocalPersistenceViewers(): ExecutionLocalPersistenceViewers {
  const [executionEventLog, setExecutionEventLog] =
    useState<ExecutionEventLogReadResult>(() => readExecutionEventLogForViewers());
  const [executionEventLogMessage, setExecutionEventLogMessage] = useState("");
  const [executionRecordStore, setExecutionRecordStore] =
    useState<ExecutionRecordStoreReadResult>(() =>
      readExecutionRecordsForViewers(),
    );
  const [executionRecordStoreMessage, setExecutionRecordStoreMessage] =
    useState("");
  const [devMockBrokerResultStore, setDevMockBrokerResultStore] =
    useState<DevMockBrokerResultStoreReadResult>(() =>
      readDevMockBrokerResultsForViewers(),
    );
  const [
    devMockBrokerResultStoreMessage,
    setDevMockBrokerResultStoreMessage,
  ] = useState("");
  const [
    semiAutoAgentLocalDevFlowStore,
    setSemiAutoAgentLocalDevFlowStore,
  ] = useState<SemiAutoAgentLocalDevFlowReadResult>(() =>
    readSemiAutoAgentLocalDevFlowForViewers(),
  );
  const [
    semiAutoAgentLocalDevFlowStoreMessage,
    setSemiAutoAgentLocalDevFlowStoreMessage,
  ] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExecutionEventLog(readExecutionEventLogForViewers());
      setExecutionRecordStore(readExecutionRecordsForViewers());
      setDevMockBrokerResultStore(readDevMockBrokerResultsForViewers());
      setSemiAutoAgentLocalDevFlowStore(
        readSemiAutoAgentLocalDevFlowForViewers(),
      );
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const latestExecutionAuditEvents = useMemo(
    () =>
      [...executionEventLog.events]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 50),
    [executionEventLog.events],
  );
  const latestExecutionAuditTimestamp =
    latestExecutionAuditEvents[0]?.createdAt ?? null;
  const latestExecutionRecords = useMemo(
    () =>
      [...executionRecordStore.records]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 50),
    [executionRecordStore.records],
  );
  const latestExecutionRecordTimestamp =
    latestExecutionRecords[0]?.createdAt ?? null;
  const latestDevMockBrokerResults = useMemo(
    () =>
      [...devMockBrokerResultStore.results]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 50),
    [devMockBrokerResultStore.results],
  );
  const latestDevMockBrokerResultTimestamp =
    latestDevMockBrokerResults[0]?.createdAt ?? null;
  const latestSemiAutoAgentLocalDevFlowEvents = useMemo(
    () =>
      [...semiAutoAgentLocalDevFlowStore.items]
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, 25),
    [semiAutoAgentLocalDevFlowStore.items],
  );
  const latestSemiAutoAgentLocalDevFlowTimestamp =
    latestSemiAutoAgentLocalDevFlowEvents[0]?.created_at ?? null;

  function refreshExecutionEventLog() {
    setExecutionEventLog(readExecutionEventLogForViewers());
    setExecutionEventLogMessage("Execution event log refreshed.");
  }

  function clearExecutionEventLog() {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        "Clear the local execution event log in this browser? This does not affect trades or broker state.",
      );

    if (!confirmed) {
      return;
    }

    const cleared = clearExecutionAuditEvents();
    setExecutionEventLog(readExecutionEventLogForViewers());
    setExecutionEventLogMessage(
      cleared
        ? "Local execution event log cleared."
        : "Could not clear the local execution event log.",
    );
  }

  function refreshExecutionRecords() {
    setExecutionRecordStore(readExecutionRecordsForViewers());
    setExecutionRecordStoreMessage("Execution records refreshed.");
  }

  function clearLocalExecutionRecords() {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        "Clear local execution records in this browser? This does not affect trades, broker state, History, or Statistics.",
      );

    if (!confirmed) {
      return;
    }

    const cleared = clearExecutionRecords();
    setExecutionRecordStore(readExecutionRecordsForViewers());
    setExecutionRecordStoreMessage(
      cleared
        ? "Local execution records cleared."
        : "Could not clear local execution records.",
    );
  }

  function refreshDevMockBrokerResults() {
    setDevMockBrokerResultStore(readDevMockBrokerResultsForViewers());
    setDevMockBrokerResultStoreMessage("Dev mock broker results refreshed.");
  }

  function clearLocalDevMockBrokerResults() {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        "Clear local dev mock broker results in this browser? This only removes the mock diagnostics key and does not affect trades, broker state, History, or Statistics.",
      );

    if (!confirmed) {
      return;
    }

    const cleared = clearDevMockBrokerResults();
    setDevMockBrokerResultStore(readDevMockBrokerResultsForViewers());
    setDevMockBrokerResultStoreMessage(
      cleared
        ? "Local dev mock broker results cleared."
        : "Could not clear local dev mock broker results.",
    );
  }

  function refreshSemiAutoAgentLocalDevFlowEvents() {
    setSemiAutoAgentLocalDevFlowStore(readSemiAutoAgentLocalDevFlowForViewers());
    setSemiAutoAgentLocalDevFlowStoreMessage(
      "Semi-auto local dev flow history refreshed.",
    );
  }

  function clearSemiAutoAgentLocalDevFlowHistory() {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        "Clear semi-auto local dev flow history in this browser? This only removes local dev history and does not affect Supabase, audit records, broker state, trades, History, or Statistics.",
      );

    if (!confirmed) {
      return;
    }

    const cleared = clearSemiAutoAgentLocalDevFlowEvents();
    setSemiAutoAgentLocalDevFlowStore(readSemiAutoAgentLocalDevFlowForViewers());
    setSemiAutoAgentLocalDevFlowStoreMessage(
      cleared
        ? "Semi-auto local dev flow history cleared."
        : "Could not clear semi-auto local dev flow history.",
    );
  }

  function refreshAfterDevMockBrokerCapture() {
    setExecutionRecordStore(readExecutionRecordsForViewers());
    setExecutionEventLog(readExecutionEventLogForViewers());
  }

  return {
    executionEventLog,
    executionEventLogMessage,
    latestExecutionAuditEvents,
    latestExecutionAuditTimestamp,
    executionRecordStore,
    executionRecordStoreMessage,
    latestExecutionRecords,
    latestExecutionRecordTimestamp,
    devMockBrokerResultStore,
    devMockBrokerResultStoreMessage,
    latestDevMockBrokerResults,
    latestDevMockBrokerResultTimestamp,
    semiAutoAgentLocalDevFlowStore,
    semiAutoAgentLocalDevFlowStoreMessage,
    latestSemiAutoAgentLocalDevFlowEvents,
    latestSemiAutoAgentLocalDevFlowTimestamp,
    refreshExecutionEventLog,
    clearExecutionEventLog,
    refreshExecutionRecords,
    clearLocalExecutionRecords,
    refreshDevMockBrokerResults,
    clearLocalDevMockBrokerResults,
    refreshSemiAutoAgentLocalDevFlowEvents,
    clearSemiAutoAgentLocalDevFlowHistory,
    refreshAfterDevMockBrokerCapture,
  };
}
