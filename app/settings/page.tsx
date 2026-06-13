"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  browserAgentPrototypePlanJson,
  buildBrowserAgentPrototypePlan,
  type BrowserAgentPrototypePlan,
} from "@/lib/browser-agent-prototype-plan";
import {
  AVANZA_VERIFICATION_NOTES_STORAGE_KEY,
  avanzaVerificationNotesJson,
  createDefaultAvanzaVerificationNotesState,
  normalizeAvanzaVerificationNotesState,
  validateAvanzaVerificationNotes,
  type AvanzaFieldVerificationNote,
  type AvanzaVerificationCriticality,
  type AvanzaVerificationNoteSource,
  type AvanzaVerificationNoteStatus,
  type AvanzaVerificationNotesState,
  type AvanzaVerificationNotesValidation,
} from "@/lib/avanza-field-verification-notes";
import {
  getIntradayScanWindow,
  getIntradayScanWindowLabel,
  type IntradayScanWindow,
} from "@/lib/intraday-scan-window";
import {
  defaultBrokerCostModel,
  readBrokerCostModelFromStorage,
  writeBrokerCostModelToStorage,
  type BrokerCostModel,
} from "@/lib/broker-costs";
import {
  createDefaultRiskControlsSettings,
  normalizeRiskControlsSettings,
  riskControlsSettingsJson,
  RISK_CONTROLS_STORAGE_KEY,
  type RiskControlsMode,
  type RiskControlsPositionSizeMode,
  type RiskControlsPositionSizingMode,
  type RiskControlsSettings,
} from "@/lib/risk-controls";
import {
  buildDataModeClaritySummary,
  dataModeClaritySummaryJson,
} from "@/lib/data-mode-clarity";
import {
  DEFAULT_EXECUTION_MODE,
  EXECUTION_MODE_STORAGE_KEY,
  getExecutionAuthorityForMode,
  getExecutionTriggerPriority,
  isAutomaticExecutionModeFeatureEnabled,
  isExecutionDevToolsEnabled,
  normalizeExecutionMode,
  type ExecutionAction,
  type ExecutionIntent,
  type ExecutionMode,
  type ExecutionTriggerType,
} from "@/lib/execution";
import {
  appendExecutionAuditEvent,
  clearExecutionAuditEvents,
  createExecutionAuditEvent,
  readExecutionEventLog,
  type ExecutionAuditEvent,
  type ExecutionEventLogReadResult,
} from "@/lib/execution-event-log";
import {
  appendExecutionRecord,
  clearExecutionRecords,
  readExecutionRecordStoreResult,
  type ExecutionRecordStoreReadResult,
  type StoredExecutionRecord,
} from "@/lib/execution-record-store";
import {
  buildTureExecutionRecord,
} from "@/lib/broker-execution-capture";
import {
  buildAvanzaAgentProgressEvent,
} from "@/lib/avanza-agent-adapter";
import {
  clearAvanzaAgentRuns,
  readAvanzaAgentRunStoreResult,
  type AvanzaAgentRunStoreReadResult,
  type StoredAvanzaAgentRun,
} from "@/lib/avanza-agent-run-store";
import {
  createExecutionLifecycleSnapshot,
  transitionExecutionLifecycle,
} from "@/lib/execution-state-machine";
import {
  clearDevMockBrokerResults,
  readDevMockBrokerResultStoreResult,
  type DevMockBrokerResultStoreReadResult,
  type StoredDevMockBrokerExecutionResult,
} from "@/lib/dev-mock-broker-result-store";
import {
  clearSafeBrowserActionDiagnostics,
  readSafeBrowserActionDiagnosticsStoreResult,
  type SafeBrowserActionDiagnosticsStoreReadResult,
  type StoredSafeBrowserActionExecutionDiagnostics,
} from "@/lib/safe-browser-action-diagnostics-store";
import {
  classifyDiagnosticsCapability,
  summarizeBrowserRunnerCapabilityValidation,
  validateBrowserRunnerCapability,
} from "@/lib/browser-runner-capability-gate";
import {
  buildDevMockCaptureDuplicateKey,
  convertDevMockBrokerResultToBrokerExecutionResult,
  findLocalExecutionRecordsForDevMockCapture,
  isDevMockCaptureDuplicateKeyCertain,
} from "@/lib/dev-mock-to-broker-execution-result";
import {
  buildExecutionServerCaptureRequest,
  validateExecutionServerCaptureRequest,
} from "@/lib/execution-server-capture-contract";
import {
  postExecutionServerCaptureRequest,
} from "@/lib/execution-server-capture-client";
import {
  EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
  type ExecutionAuditPersistenceResponse,
  type PersistExecutionAgentProgressEventRequest,
  type PersistExecutionAgentRunRequest,
  type PersistExecutionLifecycleEventRequest,
} from "@/lib/execution-audit-persistence-contract";
import {
  postPersistExecutionAgentProgressEventRequest,
  postPersistExecutionAgentRunRequest,
  postPersistExecutionLifecycleEventRequest,
  type PostExecutionAuditPersistenceRequestResult,
} from "@/lib/execution-audit-persistence-client";
import {
  getAvanzaAgentBridgeStatusDisplayLabel,
  getAvanzaAgentBridgeTransportDisplayLabel,
  isRealAvanzaAgentBridge,
  type AvanzaAgentBridge,
  type AvanzaAgentBridgeHealth,
  type AvanzaAgentBridgeTransport,
} from "@/lib/avanza-agent-bridge";
import {
  createAvanzaAgentBridgeFromConfig,
  type AvanzaAgentBridgeFactoryResult,
} from "@/lib/avanza-agent-bridge-factory";
import {
  AVANZA_AGENT_BRIDGE_CONFIG_STORAGE_KEY,
  avanzaAgentBridgeTransportOptions,
  clearAvanzaAgentBridgeConfig,
  createDefaultAvanzaAgentBridgeConfig,
  normalizeAvanzaAgentBridgeTransport,
  readAvanzaAgentBridgeConfig,
  writeAvanzaAgentBridgeConfig,
  type AvanzaAgentBridgeConfig,
  type AvanzaAgentBridgeTransportOption,
} from "@/lib/avanza-agent-bridge-config";
import {
  DEFAULT_LOCALHOST_BRIDGE_BASE_URL,
} from "@/lib/avanza-localhost-bridge-contract";
import {
  checkLocalhostBridgeHealth,
  type LocalhostBridgeClientHealthCheckResult,
} from "@/lib/avanza-localhost-bridge-client";
import { supabase } from "@/lib/supabase";
import { normalizeUnknownError } from "@/lib/error-logging";

type UserSettingsRow = {
  id: string | number;
  created_at: string | null;
  updated_at: string | null;
  portfolio_size: number | string | null;
  risk_per_trade_percent: number | string | null;
  max_recommendations_per_session: number | string | null;
  max_open_positions: number | string | null;
  preferred_timeframe: string | null;
  long_only: boolean | null;
};

type SettingsForm = {
  portfolioSize: string;
  riskPerTradePercent: string;
  maxRecommendationsPerSession: string;
  maxOpenPositions: string;
  preferredTimeframe: string;
  longOnly: boolean;
  brokerCostsEnabled: boolean;
  brokerCostBroker: BrokerCostModel["broker"];
  commissionMode: BrokerCostModel["commission_mode"];
  entryFixedCommission: string;
  exitFixedCommission: string;
  commissionPercent: string;
  minimumCommission: string;
  fxFeePercent: string;
  estimatedUsdSekRate: string;
  includeEntryCommission: boolean;
  includeEstimatedExitCommission: boolean;
  includeFxFee: boolean;
};

type ScheduledScanRun = {
  id: string | number;
  created_at: string | null;
  scan_date: string | null;
  session_type: string | null;
  status: string | null;
  recommendations_created: number | string | null;
  message: string | null;
};

type MarketStatus = {
  isOpenDay: boolean;
  reason: string;
  date: string;
  dayType: "trading_day" | "weekend" | "holiday" | "early_close" | "unknown";
  marketOpenTime: string | null;
  marketCloseTime: string | null;
  provider: string;
  fromCache: boolean;
};

type AgentAdapterDiagnosticsEntry = {
  event: ExecutionAuditEvent;
  progressEventId: string | null;
  requestId: string | null;
  progressType: string | null;
  mappedLifecycleEventType: string | null;
};

type ExecutionSandboxSmokeChecklistStatus = "not_tested" | "pass" | "fail";

type ExecutionSandboxSmokeChecklistItemDefinition = {
  id: string;
  label: string;
};

type ExecutionSandboxSmokeChecklistState = {
  statuses: Record<string, ExecutionSandboxSmokeChecklistStatus>;
  lastUpdated: string | null;
  storageAvailable: boolean;
  error: string | null;
};

const emptyForm: SettingsForm = {
  portfolioSize: "",
  riskPerTradePercent: "",
  maxRecommendationsPerSession: "",
  maxOpenPositions: "",
  preferredTimeframe: "",
  longOnly: true,
  brokerCostsEnabled: defaultBrokerCostModel.enabled,
  brokerCostBroker: defaultBrokerCostModel.broker,
  commissionMode: defaultBrokerCostModel.commission_mode,
  entryFixedCommission: String(defaultBrokerCostModel.entry_fixed_commission),
  exitFixedCommission: String(defaultBrokerCostModel.exit_fixed_commission),
  commissionPercent: String(defaultBrokerCostModel.commission_percent),
  minimumCommission: String(defaultBrokerCostModel.minimum_commission),
  fxFeePercent: String(defaultBrokerCostModel.fx_fee_percent),
  estimatedUsdSekRate: String(defaultBrokerCostModel.estimated_usd_sek_rate ?? ""),
  includeEntryCommission: defaultBrokerCostModel.include_entry_commission,
  includeEstimatedExitCommission:
    defaultBrokerCostModel.include_estimated_exit_commission,
  includeFxFee: defaultBrokerCostModel.include_fx_fee,
};

const defaultSettingsRow = {
  portfolio_size: 100000,
  risk_per_trade_percent: 0.5,
  max_recommendations_per_session: 5,
  max_open_positions: 5,
  preferred_timeframe: "Intraday / day trade",
  long_only: true,
};

const EXECUTION_SANDBOX_SMOKE_CHECKLIST_STORAGE_KEY =
  "ture_execution_sandbox_smoke_checklist_v1";

const executionSandboxSmokeChecklistItems: ExecutionSandboxSmokeChecklistItemDefinition[] =
  [
    {
      id: "dev_tools_flag_enabled",
      label: "Dev tools flag is enabled.",
    },
    {
      id: "execution_mode_setting_visible",
      label: "Execution Mode setting is visible.",
    },
    {
      id: "semi_automatic_selectable",
      label: "Semi-automatic mode can be selected.",
    },
    {
      id: "automatic_mode_gated",
      label:
        "Automatic mode remains gated unless NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=true.",
    },
    {
      id: "live_card_execution_status",
      label:
        "A real/non-demo Live Day Trade at target or stop shows execution status.",
    },
    {
      id: "view_handoff_opens_modal",
      label: "View handoff opens the preview modal.",
    },
    {
      id: "modal_shows_intent_safety_authority",
      label: "Handoff preview shows intent, safety checks, and authority.",
    },
    {
      id: "agent_request_validates",
      label: "Future agent request preview validates successfully.",
    },
    {
      id: "bridge_envelope_validates",
      label: "Bridge request envelope preview validates successfully.",
    },
    {
      id: "sandbox_qa_expected_status",
      label:
        "Execution Sandbox QA panel shows ready or expected blocked/incomplete status.",
    },
    {
      id: "prepare_runs_bridge_noop",
      label:
        "Prepare in Avanza runs bridge-backed diagnostics runner when dev tools are enabled.",
    },
    {
      id: "noop_runner_no_broker_result",
      label: "Diagnostics runner result clearly shows no broker result.",
    },
    {
      id: "agent_progress_stub_events",
      label: "Agent progress stub can add local progress events.",
    },
    {
      id: "broker_capture_stub_record",
      label: "Broker result capture stub can create a local stub record.",
    },
    {
      id: "event_log_shows_events",
      label: "Execution Event Log viewer shows new local events.",
    },
    {
      id: "agent_adapter_diagnostics_progress",
      label: "Agent Adapter Diagnostics shows progress stub events.",
    },
    {
      id: "agent_runs_viewer_noop_runs",
      label: "Avanza Agent Runs viewer shows diagnostics runner runs.",
    },
    {
      id: "execution_records_viewer_stub_records",
      label: "Execution Records viewer shows stub capture records.",
    },
    {
      id: "clearing_diagnostics_scoped",
      label:
        "Clearing diagnostics only clears the intended local storage keys.",
    },
    {
      id: "dev_tools_disabled_hidden",
      label: "With dev tools disabled, dev-only sections are hidden/disabled.",
    },
  ];

function toForm(row: UserSettingsRow): SettingsForm {
  const brokerCostModel = readBrokerCostModelFromStorage();

  return {
    portfolioSize: String(row.portfolio_size ?? ""),
    riskPerTradePercent: String(row.risk_per_trade_percent ?? ""),
    maxRecommendationsPerSession: String(
      row.max_recommendations_per_session ?? "",
    ),
    maxOpenPositions: String(row.max_open_positions ?? ""),
    preferredTimeframe: row.preferred_timeframe ?? "",
    longOnly: row.long_only ?? true,
    brokerCostsEnabled: brokerCostModel.enabled,
    brokerCostBroker: brokerCostModel.broker,
    commissionMode: brokerCostModel.commission_mode,
    entryFixedCommission: String(brokerCostModel.entry_fixed_commission),
    exitFixedCommission: String(brokerCostModel.exit_fixed_commission),
    commissionPercent: String(brokerCostModel.commission_percent),
    minimumCommission: String(brokerCostModel.minimum_commission),
    fxFeePercent: String(brokerCostModel.fx_fee_percent),
    estimatedUsdSekRate: String(brokerCostModel.estimated_usd_sek_rate ?? ""),
    includeEntryCommission: brokerCostModel.include_entry_commission,
    includeEstimatedExitCommission:
      brokerCostModel.include_estimated_exit_commission,
    includeFxFee: brokerCostModel.include_fx_fee,
  };
}

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateSettings(form: SettingsForm) {
  const portfolioSize = parseNumber(form.portfolioSize);
  const riskPerTradePercent = parseNumber(form.riskPerTradePercent);
  const maxRecommendationsPerSession = parseNumber(
    form.maxRecommendationsPerSession,
  );
  const maxOpenPositions = parseNumber(form.maxOpenPositions);
  const entryFixedCommission = parseNumber(form.entryFixedCommission);
  const exitFixedCommission = parseNumber(form.exitFixedCommission);
  const commissionPercent = parseNumber(form.commissionPercent);
  const minimumCommission = parseNumber(form.minimumCommission);
  const fxFeePercent = parseNumber(form.fxFeePercent);
  const estimatedUsdSekRate = parseNumber(form.estimatedUsdSekRate);

  if (portfolioSize === null || portfolioSize <= 0) {
    return "Portfolio size must be greater than 0.";
  }

  if (
    riskPerTradePercent === null ||
    riskPerTradePercent <= 0 ||
    riskPerTradePercent > 5
  ) {
    return "Risk per trade must be greater than 0 and no more than 5%.";
  }

  if (
    maxRecommendationsPerSession === null ||
    maxRecommendationsPerSession < 1 ||
    maxRecommendationsPerSession > 10
  ) {
    return "Max recommendations per session must be between 1 and 10.";
  }

  if (
    maxOpenPositions === null ||
    maxOpenPositions < 1 ||
    maxOpenPositions > 20
  ) {
    return "Max open positions must be between 1 and 20.";
  }

  if (!form.preferredTimeframe.trim()) {
    return "Preferred timeframe cannot be empty.";
  }

  if (
    entryFixedCommission === null ||
    exitFixedCommission === null ||
    commissionPercent === null ||
    minimumCommission === null ||
    fxFeePercent === null
  ) {
    return "Broker cost fields must be valid numbers.";
  }

  if (
    entryFixedCommission < 0 ||
    exitFixedCommission < 0 ||
    commissionPercent < 0 ||
    minimumCommission < 0 ||
    fxFeePercent < 0
  ) {
    return "Broker cost fields cannot be negative.";
  }

  if (form.brokerCostsEnabled && (estimatedUsdSekRate === null || estimatedUsdSekRate <= 0)) {
    return "Estimated USD/SEK rate must be greater than 0 when broker cost estimates are enabled.";
  }

  return null;
}

async function fetchFirstSettingsRow() {
  return supabase
    .from("user_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
}

async function createDefaultSettingsRow() {
  return supabase
    .from("user_settings")
    .insert(defaultSettingsRow)
    .select("*")
    .single();
}

async function fetchRecentScheduledScanRuns() {
  return supabase
    .from("scheduled_scan_runs")
    .select(
      "id,created_at,scan_date,session_type,status,recommendations_created,message",
    )
    .order("created_at", { ascending: false })
    .limit(20);
}

async function fetchMarketStatusForUi() {
  try {
    const response = await fetch("/api/market-calendar/status", {
      cache: "no-store",
    });
    const result = (await response.json().catch(() => null)) as {
      market_status?: MarketStatus;
      error?: string;
    } | null;

    if (!response.ok) {
      throw new Error(result?.error || "Could not load market calendar status.");
    }

    return {
      marketStatus: result?.market_status ?? null,
      error: "",
    };
  } catch (error) {
    console.error("[settings] market_status_error", {
      source: "/api/market-calendar/status",
      error: normalizeUnknownError(error),
    });

    return {
      marketStatus: null,
      error: "Market calendar status is unavailable right now.",
    };
  }
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function shortExecutionAuditId(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

function executionAuditValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function executionAuditMetadataString(
  event: ExecutionAuditEvent,
  key: string,
) {
  const value = event.metadata?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function buildAgentAdapterDiagnosticsEntries(
  events: readonly ExecutionAuditEvent[],
): AgentAdapterDiagnosticsEntry[] {
  const entriesByProgressId = new Map<string, AgentAdapterDiagnosticsEntry>();

  for (const event of events) {
    const progressEventId = executionAuditMetadataString(
      event,
      "agent_progress_event_id",
    );
    const requestId = executionAuditMetadataString(event, "agent_request_id");
    const progressType = executionAuditMetadataString(
      event,
      "agent_progress_type",
    );
    const mappedLifecycleEventType = executionAuditMetadataString(
      event,
      "mapped_lifecycle_event_type",
    );
    const hasAgentProgressMetadata =
      Boolean(progressEventId) || Boolean(requestId) || Boolean(progressType);

    if (event.type !== "agent_progress_stub" && !hasAgentProgressMetadata) {
      continue;
    }

    const entry: AgentAdapterDiagnosticsEntry = {
      event,
      progressEventId,
      requestId,
      progressType,
      mappedLifecycleEventType,
    };
    const dedupeKey = progressEventId ?? event.eventId;
    const current = entriesByProgressId.get(dedupeKey);

    if (!current || event.type === "agent_progress_stub") {
      entriesByProgressId.set(dedupeKey, entry);
    }
  }

  return [...entriesByProgressId.values()].sort(
    (a, b) => Date.parse(b.event.createdAt) - Date.parse(a.event.createdAt),
  );
}

function readExecutionEventLogForSettings(): ExecutionEventLogReadResult {
  return readExecutionEventLog();
}

function readExecutionRecordsForSettings(): ExecutionRecordStoreReadResult {
  return readExecutionRecordStoreResult();
}

function readAvanzaAgentRunsForSettings(): AvanzaAgentRunStoreReadResult {
  return readAvanzaAgentRunStoreResult();
}

function readDevMockBrokerResultsForSettings(): DevMockBrokerResultStoreReadResult {
  return readDevMockBrokerResultStoreResult();
}

function readSafeBrowserActionDiagnosticsForSettings(): SafeBrowserActionDiagnosticsStoreReadResult {
  return readSafeBrowserActionDiagnosticsStoreResult();
}

function isExecutionSandboxSmokeChecklistStatus(
  value: unknown,
): value is ExecutionSandboxSmokeChecklistStatus {
  return value === "not_tested" || value === "pass" || value === "fail";
}

function createDefaultExecutionSandboxSmokeChecklistState(
  options: Partial<Pick<ExecutionSandboxSmokeChecklistState, "error">> = {},
): ExecutionSandboxSmokeChecklistState {
  return {
    statuses: {},
    lastUpdated: null,
    storageAvailable: typeof window !== "undefined",
    error: options.error ?? null,
  };
}

function normalizeExecutionSandboxSmokeChecklistState(
  value: unknown,
  storageAvailable = typeof window !== "undefined",
): ExecutionSandboxSmokeChecklistState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {
      ...createDefaultExecutionSandboxSmokeChecklistState(),
      storageAvailable,
    };
  }

  const record = value as Record<string, unknown>;
  const rawStatuses =
    typeof record.statuses === "object" &&
    record.statuses !== null &&
    !Array.isArray(record.statuses)
      ? (record.statuses as Record<string, unknown>)
      : {};
  const allowedIds = new Set(
    executionSandboxSmokeChecklistItems.map((item) => item.id),
  );
  const statuses: Record<string, ExecutionSandboxSmokeChecklistStatus> = {};

  for (const [id, status] of Object.entries(rawStatuses)) {
    if (allowedIds.has(id) && isExecutionSandboxSmokeChecklistStatus(status)) {
      statuses[id] = status;
    }
  }

  const lastUpdated =
    typeof record.lastUpdated === "string" &&
    Number.isFinite(Date.parse(record.lastUpdated))
      ? record.lastUpdated
      : null;

  return {
    statuses,
    lastUpdated,
    storageAvailable,
    error: null,
  };
}

function readExecutionSandboxSmokeChecklistState(): ExecutionSandboxSmokeChecklistState {
  if (typeof window === "undefined") {
    return createDefaultExecutionSandboxSmokeChecklistState();
  }

  try {
    const stored = window.localStorage.getItem(
      EXECUTION_SANDBOX_SMOKE_CHECKLIST_STORAGE_KEY,
    );

    return stored
      ? normalizeExecutionSandboxSmokeChecklistState(JSON.parse(stored), true)
      : createDefaultExecutionSandboxSmokeChecklistState();
  } catch (error) {
    const normalizedError = normalizeUnknownError(error);

    return createDefaultExecutionSandboxSmokeChecklistState({
      error: normalizedError.message,
    });
  }
}

function writeExecutionSandboxSmokeChecklistState(
  state: ExecutionSandboxSmokeChecklistState,
) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(
      EXECUTION_SANDBOX_SMOKE_CHECKLIST_STORAGE_KEY,
      JSON.stringify({
        statuses: state.statuses,
        lastUpdated: state.lastUpdated,
      }),
    );

    return true;
  } catch {
    return false;
  }
}

function resetExecutionSandboxSmokeChecklistStorage() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.removeItem(
      EXECUTION_SANDBOX_SMOKE_CHECKLIST_STORAGE_KEY,
    );

    return true;
  } catch {
    return false;
  }
}

function formatExecutionRecordNumber(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 4,
  }).format(value);
}

function executionRecordTriggerType(record: StoredExecutionRecord) {
  return record.intent?.trigger_type ?? null;
}

function executionRecordRawBrokerSummary(record: StoredExecutionRecord) {
  const brokerResult = record.brokerResult as
    | (Record<string, unknown> & { rawBrokerSummary?: unknown })
    | null;

  return typeof brokerResult?.rawBrokerSummary === "string"
    ? brokerResult.rawBrokerSummary
    : null;
}

function sanitizeDevMockCaptureIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function createDevMockCaptureIntentId(
  result: StoredDevMockBrokerExecutionResult,
) {
  return [
    "dev_mock_capture_intent",
    sanitizeDevMockCaptureIdPart(result.requestId),
    sanitizeDevMockCaptureIdPart(result.orderId),
    sanitizeDevMockCaptureIdPart(result.createdAt),
  ].join("_");
}

function buildDevMockCaptureIntent(
  result: StoredDevMockBrokerExecutionResult,
  createdAt: string,
): ExecutionIntent | null {
  const action = result.action === "buy" || result.action === "sell"
    ? (result.action as ExecutionAction)
    : null;
  const quantity =
    typeof result.quantity === "number" && Number.isFinite(result.quantity)
      ? result.quantity
      : null;

  if (!action || !result.ticker.trim() || quantity === null || quantity <= 0) {
    return null;
  }

  const mode = DEFAULT_EXECUTION_MODE;
  const triggerType: ExecutionTriggerType =
    action === "sell" ? "manual_exit_requested" : "manual_entry_requested";
  const intendedPrice = result.requestedPrice ?? result.executedPrice ?? null;

  return {
    intent_version: "1.0",
    intent_id: result.intentId ?? createDevMockCaptureIntentId(result),
    created_at: createdAt,
    mode,
    authority: getExecutionAuthorityForMode(mode),
    action,
    trigger_type: triggerType,
    trigger_priority: getExecutionTriggerPriority(triggerType),
    broker_hint: "AVANZA",
    source: "manual",
    trading_package: {
      package_version: "1.0",
      recommendation_id: result.recommendationId ?? null,
      live_position_id: result.positionId ?? null,
      ticker: result.ticker,
      market: "US",
      quantity,
      order_type: "market",
      limit_price: intendedPrice,
      stop_loss: null,
      target_price: null,
      expires_at: null,
      payload_id: result.requestId ?? null,
      payload_fingerprint: null,
    },
    safety_warnings: [
      "DEV MOCK CAPTURE - local diagnostics only. Not a real Avanza execution.",
      "Does not update trades, Supabase, History, or Statistics.",
    ],
    broker_result: null,
  };
}

type DevMockCaptureUiResult = {
  ok: boolean;
  message: string;
  recordId?: string;
  captureStatus?: string;
  brokerStatus?: string | null;
  errors: string[];
  warnings: string[];
};

type DevMockServerCaptureStubUiResult = {
  ok: boolean;
  message: string;
  statusCode: number | null;
  responseStatus?: string;
  idempotencyKey?: string | null;
  completedAt: string;
  errors: string[];
  warnings: string[];
};

type ExecutionAuditPersistenceStubUiResult = {
  ok: boolean;
  label: string;
  statusCode: number | null;
  response?: ExecutionAuditPersistenceResponse;
  errors: string[];
  warnings: string[];
  completedAt: string;
};

function buildSamplePersistExecutionLifecycleEventRequest(): PersistExecutionLifecycleEventRequest {
  const snapshot = createExecutionLifecycleSnapshot({
    lifecycleId: "settings_audit_lifecycle_stub",
    createdAt: "2026-06-10T09:10:00.000Z",
    mode: DEFAULT_EXECUTION_MODE,
    action: "buy",
    triggerType: "manual_entry_requested",
    intentId: "settings_audit_intent",
    recommendationId: "settings_audit_recommendation",
  });
  const transition = transitionExecutionLifecycle(snapshot, "create_intent", {
    eventId: "settings_audit_lifecycle_event",
    createdAt: "2026-06-10T09:10:01.000Z",
    intentId: "settings_audit_intent",
    message: "Settings audit persistence stub test only.",
  });

  if (!transition.ok) {
    throw new Error(transition.error);
  }

  return {
    version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
    submittedAt: new Date().toISOString(),
    sourceEnvironment: "local_dev",
    isMock: true,
    isDev: true,
    event: transition.event,
    metadata: {
      path: "settings_execution_audit_lifecycle_stub",
      no_supabase_write_expected: true,
      no_trade_mutation_expected: true,
    },
  };
}

function buildSamplePersistExecutionAgentRunRequest(): PersistExecutionAgentRunRequest {
  const run: StoredAvanzaAgentRun = {
    runId: "settings_audit_agent_run",
    createdAt: "2026-06-10T09:11:00.000Z",
    updatedAt: "2026-06-10T09:11:10.000Z",
    requestId: "settings_audit_agent_request",
    requestVersion: "avanza_agent_request_v1",
    runnerId: "settings_audit_runner",
    runnerName: "Settings audit stub runner",
    runnerVersion: "dev",
    broker: "avanza",
    mode: DEFAULT_EXECUTION_MODE,
    action: "buy",
    ticker: "QA.AUDIT",
    quantity: 1,
    intentId: "settings_audit_intent",
    recommendationId: "settings_audit_recommendation",
    requireManualFinalConfirmation: true,
    allowAutomaticFinalSubmit: false,
    resultStatus: "waiting_for_manual_confirmation",
    brokerResultPresent: false,
    progressEventCount: 1,
    progressEventTypes: ["agent_started"],
    metadata: {
      path: "settings_execution_audit_agent_run_stub",
      no_supabase_write_expected: true,
      no_trade_mutation_expected: true,
    },
  };

  return {
    version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
    submittedAt: new Date().toISOString(),
    sourceEnvironment: "local_dev",
    isMock: true,
    isDev: true,
    run,
    metadata: {
      path: "settings_execution_audit_agent_run_stub",
      no_supabase_write_expected: true,
      no_trade_mutation_expected: true,
    },
  };
}

function buildSamplePersistExecutionAgentProgressEventRequest(): PersistExecutionAgentProgressEventRequest {
  const progressEvent = buildAvanzaAgentProgressEvent({
    eventId: "settings_audit_agent_progress_event",
    requestId: "settings_audit_agent_request",
    createdAt: "2026-06-10T09:12:00.000Z",
    type: "agent_started",
    message: "Settings audit persistence progress stub test only.",
  });

  return {
    version: EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION,
    submittedAt: new Date().toISOString(),
    sourceEnvironment: "local_dev",
    isMock: true,
    isDev: true,
    agentRunId: "settings_audit_agent_run",
    progressEvent,
    metadata: {
      path: "settings_execution_audit_progress_stub",
      no_supabase_write_expected: true,
      no_trade_mutation_expected: true,
    },
  };
}

function formatSessionType(value: string | null) {
  if (value === "morning") {
    return "Early session";
  }

  if (value === "midday") {
    return "Later session";
  }

  return value ?? "Unknown";
}

function getScanWindowFromRunMessage(message: string | null) {
  const match = message?.match(/scan_window=([a-z_]+)/);
  const value = match?.[1] as IntradayScanWindow | undefined;

  if (
    value === "pre_market" ||
    value === "opening" ||
    value === "morning_momentum" ||
    value === "midday" ||
    value === "afternoon" ||
    value === "power_hour" ||
    value === "closed"
  ) {
    return getIntradayScanWindowLabel(value);
  }

  return "Not recorded";
}

function logBrowserAgentPrototypePlanEvent(
  type:
    | "browser_agent_prototype_plan_generated"
    | "browser_agent_prototype_plan_copied",
  plan: BrowserAgentPrototypePlan,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    );
    const events = Array.isArray(current) ? current : [];

    events.push({
      type,
      timestamp: new Date().toISOString(),
      plan_id: plan.plan_id,
      plan_version: plan.plan_version,
      plan_kind: plan.plan_kind,
      overall_readiness_status: plan.overall_readiness_status,
      current_phase_id: plan.current_phase_id,
      next_recommended_action: plan.next_recommended_action,
      required_dom_block_count: plan.required_dom_blocks.length,
      hard_stop_count: plan.hard_stops.length,
      human_checkpoint_count: plan.human_checkpoints.length,
      forbidden_action_count: plan.forbidden_actions.length,
    });

    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify(events.slice(-200)),
    );
  } catch {
    // Settings audit events are diagnostic only and must never block settings UI.
  }
}

function readAvanzaVerificationNotesState() {
  if (typeof window === "undefined") {
    return createDefaultAvanzaVerificationNotesState();
  }

  try {
    const stored = window.localStorage.getItem(
      AVANZA_VERIFICATION_NOTES_STORAGE_KEY,
    );

    return stored
      ? normalizeAvanzaVerificationNotesState(JSON.parse(stored))
      : createDefaultAvanzaVerificationNotesState();
  } catch {
    return createDefaultAvanzaVerificationNotesState();
  }
}

function readRiskControlsSettings() {
  if (typeof window === "undefined") {
    return createDefaultRiskControlsSettings();
  }

  try {
    const stored = window.localStorage.getItem(RISK_CONTROLS_STORAGE_KEY);

    return stored
      ? normalizeRiskControlsSettings(JSON.parse(stored))
      : createDefaultRiskControlsSettings();
  } catch {
    return createDefaultRiskControlsSettings();
  }
}

function writeRiskControlsSettings(settings: RiskControlsSettings) {
  window.localStorage.setItem(
    RISK_CONTROLS_STORAGE_KEY,
    riskControlsSettingsJson(settings),
  );
}

function readExecutionModePreference(): ExecutionMode {
  if (typeof window === "undefined") {
    return DEFAULT_EXECUTION_MODE;
  }

  try {
    return normalizeExecutionMode(
      window.localStorage.getItem(EXECUTION_MODE_STORAGE_KEY),
      {
        automaticEnabled: isAutomaticExecutionModeFeatureEnabled(),
      },
    );
  } catch {
    return DEFAULT_EXECUTION_MODE;
  }
}

function writeExecutionModePreference(mode: ExecutionMode) {
  window.localStorage.setItem(EXECUTION_MODE_STORAGE_KEY, mode);
}

function logRiskControlsSettingsEvent(
  type: "risk_controls_saved" | "risk_controls_reset",
  settings: RiskControlsSettings,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    );
    const events = Array.isArray(current) ? current : [];

    events.push({
      type,
      timestamp: new Date().toISOString(),
      source: "settings_risk_controls",
      storage_key: RISK_CONTROLS_STORAGE_KEY,
      enabled: settings.enabled,
      mode: settings.mode,
      max_risk_per_trade_amount: settings.max_risk_per_trade_amount,
      max_risk_per_trade_percent: settings.max_risk_per_trade_percent,
      account_size: settings.account_size,
      default_risk_amount_per_trade: settings.default_risk_amount_per_trade,
      default_risk_percent_per_trade: settings.default_risk_percent_per_trade,
      max_position_value: settings.max_position_value,
      position_sizing_mode: settings.position_sizing_mode,
      max_daily_loss_amount: settings.max_daily_loss_amount,
      max_daily_loss_r: settings.max_daily_loss_r,
      max_trades_per_day: settings.max_trades_per_day,
      max_open_positions: settings.max_open_positions,
    });

    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify(events.slice(-200)),
    );
  } catch {
    // Local risk-control audit must never block Settings.
  }
}

function writeAvanzaVerificationNotesState(
  state: AvanzaVerificationNotesState,
) {
  window.localStorage.setItem(
    AVANZA_VERIFICATION_NOTES_STORAGE_KEY,
    avanzaVerificationNotesJson(state),
  );
}

function logAvanzaVerificationNotesEvent(
  type:
    | "avanza_verification_notes_saved"
    | "avanza_verification_notes_reset"
    | "avanza_verification_notes_imported"
    | "avanza_verification_notes_exported",
  validation: AvanzaVerificationNotesValidation,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = JSON.parse(
      window.localStorage.getItem("trade-management-events") ?? "[]",
    );
    const events = Array.isArray(current) ? current : [];

    events.push({
      type,
      timestamp: new Date().toISOString(),
      source: "settings_manual_avanza_verification_notes",
      storage_key: AVANZA_VERIFICATION_NOTES_STORAGE_KEY,
      status: validation.status,
      verified_critical_fields_count:
        validation.summary.verified_critical_fields_count,
      missing_critical_fields_count:
        validation.summary.missing_critical_fields_count,
      mismatch_count: validation.summary.mismatch_count,
      needs_review_count: validation.summary.needs_review_count,
      can_future_agent_prepare_buy_form:
        validation.summary.can_future_agent_prepare_buy_form,
      can_future_agent_prepare_sell_form:
        validation.summary.can_future_agent_prepare_sell_form,
      can_future_agent_submit_order:
        validation.summary.can_future_agent_submit_order,
      human_final_confirmation_required:
        validation.summary.human_final_confirmation_required,
    });

    window.localStorage.setItem(
      "trade-management-events",
      JSON.stringify(events.slice(-200)),
    );
  } catch {
    // Local verification notes audit must never block settings.
  }
}

export default function SettingsPage() {
  const [settingsId, setSettingsId] = useState<UserSettingsRow["id"] | null>(
    null,
  );
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [automationRuns, setAutomationRuns] = useState<ScheduledScanRun[]>([]);
  const [isLoadingAutomationRuns, setIsLoadingAutomationRuns] = useState(true);
  const [automationMessage, setAutomationMessage] = useState("");
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [marketStatusMessage, setMarketStatusMessage] = useState("");
  const [browserAgentPlanCreatedAt] = useState(() => new Date().toISOString());
  const [browserAgentPlanCopyStatus, setBrowserAgentPlanCopyStatus] =
    useState("");
  const [avanzaNotesState, setAvanzaNotesState] = useState(() =>
    readAvanzaVerificationNotesState(),
  );
  const [avanzaNotesMessage, setAvanzaNotesMessage] = useState("");
  const [avanzaNotesImportJson, setAvanzaNotesImportJson] = useState("");
  const [riskControlsSettings, setRiskControlsSettings] = useState(() =>
    readRiskControlsSettings(),
  );
  const [riskControlsMessage, setRiskControlsMessage] = useState("");
  const [executionMode, setExecutionMode] = useState<ExecutionMode>(() =>
    readExecutionModePreference(),
  );
  const [executionModeMessage, setExecutionModeMessage] = useState("");
  const [executionEventLog, setExecutionEventLog] =
    useState<ExecutionEventLogReadResult>(() => readExecutionEventLogForSettings());
  const [executionEventLogMessage, setExecutionEventLogMessage] = useState("");
  const [executionRecordStore, setExecutionRecordStore] =
    useState<ExecutionRecordStoreReadResult>(() =>
      readExecutionRecordsForSettings(),
    );
  const [executionRecordStoreMessage, setExecutionRecordStoreMessage] =
    useState("");
  const [avanzaAgentRunStore, setAvanzaAgentRunStore] =
    useState<AvanzaAgentRunStoreReadResult>(() =>
      readAvanzaAgentRunsForSettings(),
    );
  const [avanzaAgentRunStoreMessage, setAvanzaAgentRunStoreMessage] =
    useState("");
  const [devMockBrokerResultStore, setDevMockBrokerResultStore] =
    useState<DevMockBrokerResultStoreReadResult>(() =>
      readDevMockBrokerResultsForSettings(),
    );
  const [
    devMockBrokerResultStoreMessage,
    setDevMockBrokerResultStoreMessage,
  ] = useState("");
  const [
    safeBrowserActionDiagnosticsStore,
    setSafeBrowserActionDiagnosticsStore,
  ] = useState<SafeBrowserActionDiagnosticsStoreReadResult>(() =>
    readSafeBrowserActionDiagnosticsForSettings(),
  );
  const [
    safeBrowserActionDiagnosticsMessage,
    setSafeBrowserActionDiagnosticsMessage,
  ] = useState("");
  const [avanzaAgentBridgeHealth, setAvanzaAgentBridgeHealth] =
    useState<AvanzaAgentBridgeHealth | null>(null);
  const [isCheckingAvanzaAgentBridge, setIsCheckingAvanzaAgentBridge] =
    useState(false);
  const [avanzaAgentBridgeMessage, setAvanzaAgentBridgeMessage] = useState("");
  const [localhostBridgeHealthCheck, setLocalhostBridgeHealthCheck] =
    useState<LocalhostBridgeClientHealthCheckResult | null>(null);
  const [isCheckingLocalhostBridge, setIsCheckingLocalhostBridge] =
    useState(false);
  const [avanzaAgentBridgeConfig, setAvanzaAgentBridgeConfig] =
    useState<AvanzaAgentBridgeConfig>(() => readAvanzaAgentBridgeConfig());
  const [avanzaAgentBridgeConfigMessage, setAvanzaAgentBridgeConfigMessage] =
    useState("");
  const [executionSandboxSmokeChecklist, setExecutionSandboxSmokeChecklist] =
    useState<ExecutionSandboxSmokeChecklistState>(() =>
      readExecutionSandboxSmokeChecklistState(),
    );
  const [
    executionSandboxSmokeChecklistMessage,
    setExecutionSandboxSmokeChecklistMessage,
  ] = useState("");
  const browserAgentPlanGeneratedRef = useRef(false);
  const avanzaAgentBridgeFactoryResult = useMemo(
    () =>
      createAvanzaAgentBridgeFromConfig({
        selectedTransport: avanzaAgentBridgeConfig.selectedTransport,
        metadata: {
          source: "settings_bridge_health_diagnostics",
          no_real_transport_connected: true,
          no_broker_order_prepared: true,
          no_broker_order_submitted: true,
        },
      }),
    [avanzaAgentBridgeConfig.selectedTransport],
  );
  const avanzaAgentBridge = avanzaAgentBridgeFactoryResult.bridge;
  const browserAgentPlan = useMemo(
    () =>
      buildBrowserAgentPrototypePlan({
        createdAt: browserAgentPlanCreatedAt,
      }),
    [browserAgentPlanCreatedAt],
  );
  const browserAgentPlanJson = useMemo(
    () => browserAgentPrototypePlanJson(browserAgentPlan),
    [browserAgentPlan],
  );
  const avanzaNotesValidation = useMemo(
    () => validateAvanzaVerificationNotes(avanzaNotesState),
    [avanzaNotesState],
  );
  const automaticExecutionEnabled = isAutomaticExecutionModeFeatureEnabled();
  const executionDevToolsEnabled = isExecutionDevToolsEnabled();
  const executionAuthority = useMemo(
    () => getExecutionAuthorityForMode(executionMode),
    [executionMode],
  );
  const latestExecutionAuditEvents = useMemo(
    () =>
      [...executionEventLog.events]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 50),
    [executionEventLog.events],
  );
  const latestExecutionAuditTimestamp =
    latestExecutionAuditEvents[0]?.createdAt ?? null;
  const agentAdapterDiagnosticsEntries = useMemo(
    () => buildAgentAdapterDiagnosticsEntries(executionEventLog.events),
    [executionEventLog.events],
  );
  const latestAgentAdapterDiagnosticsEntries =
    agentAdapterDiagnosticsEntries.slice(0, 50);
  const latestAgentAdapterDiagnosticsTimestamp =
    latestAgentAdapterDiagnosticsEntries[0]?.event.createdAt ?? null;
  const uniqueAgentAdapterRequestCount = useMemo(
    () =>
      new Set(
        agentAdapterDiagnosticsEntries
          .map((entry) => entry.requestId)
          .filter((requestId): requestId is string => Boolean(requestId)),
      ).size,
    [agentAdapterDiagnosticsEntries],
  );
  const uniqueAgentAdapterIntentCount = useMemo(
    () =>
      new Set(
        agentAdapterDiagnosticsEntries
          .map((entry) => entry.event.intentId)
          .filter((intentId): intentId is string => Boolean(intentId)),
      ).size,
    [agentAdapterDiagnosticsEntries],
  );
  const latestExecutionRecords = useMemo(
    () =>
      [...executionRecordStore.records]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 50),
    [executionRecordStore.records],
  );
  const latestExecutionRecordTimestamp =
    latestExecutionRecords[0]?.createdAt ?? null;
  const latestAvanzaAgentRuns = useMemo(
    () =>
      [...avanzaAgentRunStore.runs]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 50),
    [avanzaAgentRunStore.runs],
  );
  const latestAvanzaAgentRunTimestamp =
    latestAvanzaAgentRuns[0]?.createdAt ?? null;
  const latestDevMockBrokerResults = useMemo(
    () =>
      [...devMockBrokerResultStore.results]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 50),
    [devMockBrokerResultStore.results],
  );
  const latestDevMockBrokerResultTimestamp =
    latestDevMockBrokerResults[0]?.createdAt ?? null;
  const latestSafeBrowserActionDiagnostics = useMemo(
    () =>
      [...safeBrowserActionDiagnosticsStore.diagnostics]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 50),
    [safeBrowserActionDiagnosticsStore.diagnostics],
  );
  const latestSafeBrowserActionDiagnosticsTimestamp =
    latestSafeBrowserActionDiagnostics[0]?.createdAt ?? null;
  const safeBrowserActionFinalConfirmBlockedCount = useMemo(
    () =>
      safeBrowserActionDiagnosticsStore.diagnostics.filter(
        (diagnostics) => diagnostics.finalConfirmBlocked,
      ).length,
    [safeBrowserActionDiagnosticsStore.diagnostics],
  );
  const avanzaNotesJson = useMemo(
    () => avanzaVerificationNotesJson(avanzaNotesState),
    [avanzaNotesState],
  );
  const riskControlsJson = useMemo(
    () => riskControlsSettingsJson(riskControlsSettings),
    [riskControlsSettings],
  );

  async function loadSettings() {
    setIsLoading(true);
    setMessage("");
    setSuccessMessage("");

    const { data, error } = await fetchFirstSettingsRow();

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    let settingsRow = data as UserSettingsRow | null;

    if (!settingsRow) {
      const { data: newSettingsRow, error: insertError } =
        await createDefaultSettingsRow();

      if (insertError) {
        setMessage(
          `Settings row was missing, and the default row could not be created: ${insertError.message}`,
        );
        setIsLoading(false);
        return;
      }

      settingsRow = newSettingsRow as UserSettingsRow | null;
    }

    if (!settingsRow) {
      setMessage("Settings could not be loaded because no settings row exists.");
      setIsLoading(false);
      return;
    }

    setSettingsId(settingsRow.id);
    setForm(toForm(settingsRow));
    setIsLoading(false);
  }

  async function loadAutomationRuns() {
    setIsLoadingAutomationRuns(true);
    setAutomationMessage("");

    const [{ data, error }, marketStatusResult] = await Promise.all([
      fetchRecentScheduledScanRuns(),
      fetchMarketStatusForUi(),
    ]);

    if (error) {
      setAutomationMessage(error.message);
      setAutomationRuns([]);
    } else {
      setAutomationRuns((data ?? []) as ScheduledScanRun[]);
    }

    setMarketStatus(marketStatusResult.marketStatus);
    setMarketStatusMessage(marketStatusResult.error);
    setIsLoadingAutomationRuns(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setExecutionEventLog(readExecutionEventLogForSettings());
      setExecutionRecordStore(readExecutionRecordsForSettings());
      setAvanzaAgentRunStore(readAvanzaAgentRunsForSettings());
      setDevMockBrokerResultStore(readDevMockBrokerResultsForSettings());
      setSafeBrowserActionDiagnosticsStore(
        readSafeBrowserActionDiagnosticsForSettings(),
      );
      setAvanzaAgentBridgeConfig(readAvanzaAgentBridgeConfig());
      setExecutionSandboxSmokeChecklist(
        readExecutionSandboxSmokeChecklistState(),
      );
      loadSettings();
      loadAutomationRuns();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (browserAgentPlanGeneratedRef.current) {
      return;
    }

    browserAgentPlanGeneratedRef.current = true;
    logBrowserAgentPrototypePlanEvent(
      "browser_agent_prototype_plan_generated",
      browserAgentPlan,
    );
  }, [browserAgentPlan]);

  function updateField(field: keyof SettingsForm, value: string | boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setMessage("");
    setSuccessMessage("");
  }

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

  function refreshExecutionEventLog() {
    setExecutionEventLog(readExecutionEventLogForSettings());
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
    setExecutionEventLog(readExecutionEventLogForSettings());
    setExecutionEventLogMessage(
      cleared
        ? "Local execution event log cleared."
        : "Could not clear the local execution event log.",
    );
  }

  function refreshExecutionRecords() {
    setExecutionRecordStore(readExecutionRecordsForSettings());
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
    setExecutionRecordStore(readExecutionRecordsForSettings());
    setExecutionRecordStoreMessage(
      cleared
        ? "Local execution records cleared."
        : "Could not clear local execution records.",
    );
  }

  function refreshAvanzaAgentRuns() {
    setAvanzaAgentRunStore(readAvanzaAgentRunsForSettings());
    setAvanzaAgentRunStoreMessage("Avanza agent runs refreshed.");
  }

  function refreshDevMockBrokerResults() {
    setDevMockBrokerResultStore(readDevMockBrokerResultsForSettings());
    setDevMockBrokerResultStoreMessage("Dev mock broker results refreshed.");
  }

  function refreshSafeBrowserActionDiagnostics() {
    setSafeBrowserActionDiagnosticsStore(
      readSafeBrowserActionDiagnosticsForSettings(),
    );
    setSafeBrowserActionDiagnosticsMessage(
      "Safe browser action diagnostics refreshed.",
    );
  }

  async function checkAvanzaAgentBridgeHealth(
    options: { quiet?: boolean } = {},
  ) {
    setIsCheckingAvanzaAgentBridge(true);

    if (!options.quiet) {
      setAvanzaAgentBridgeMessage("");
    }

    try {
      const health = await avanzaAgentBridge.getHealth();
      setAvanzaAgentBridgeHealth(health);
      setAvanzaAgentBridgeMessage(
        options.quiet ? "" : "Avanza agent bridge health checked.",
      );
    } catch (error) {
      const normalizedError = normalizeUnknownError(error);

      setAvanzaAgentBridgeHealth(null);
      setAvanzaAgentBridgeMessage(
        `Avanza agent bridge health check failed safely: ${normalizedError.message}`,
      );
    } finally {
      setIsCheckingAvanzaAgentBridge(false);
    }
  }

  async function checkLocalhostBridgeStubHealth() {
    setIsCheckingLocalhostBridge(true);

    try {
      const result = await checkLocalhostBridgeHealth();

      setLocalhostBridgeHealthCheck(result);
    } finally {
      setIsCheckingLocalhostBridge(false);
    }
  }

  function updateAvanzaAgentBridgeTransport(
    transport: AvanzaAgentBridgeTransport,
  ) {
    const normalizedTransport = normalizeAvanzaAgentBridgeTransport(transport);
    const nextConfig: AvanzaAgentBridgeConfig = {
      selectedTransport: normalizedTransport,
      updatedAt: new Date().toISOString(),
      storageAvailable: typeof window !== "undefined",
      error: null,
    };
    const saved = writeAvanzaAgentBridgeConfig(nextConfig);

    setAvanzaAgentBridgeConfig(nextConfig);
    setAvanzaAgentBridgeConfigMessage(
      saved
        ? `Avanza agent bridge configuration saved locally. ${getAvanzaAgentBridgeTransportDisplayLabel(
            normalizedTransport,
          )} is selected for local diagnostics only.`
        : "Bridge configuration updated in memory, but localStorage could not be written.",
    );
  }

  function resetAvanzaAgentBridgeConfig() {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        "Reset the local Avanza agent bridge configuration? This clears only the bridge config key and does not affect diagnostics, trades, or broker state.",
      );

    if (!confirmed) {
      return;
    }

    const cleared = clearAvanzaAgentBridgeConfig();

    setAvanzaAgentBridgeConfig(createDefaultAvanzaAgentBridgeConfig());
    setAvanzaAgentBridgeConfigMessage(
      cleared
        ? "Avanza agent bridge configuration reset to no transport."
        : "Bridge configuration reset in memory, but localStorage could not be cleared.",
    );
  }

  function updateExecutionSandboxSmokeChecklistStatus(
    itemId: string,
    status: ExecutionSandboxSmokeChecklistStatus,
  ) {
    const nextState: ExecutionSandboxSmokeChecklistState = {
      ...executionSandboxSmokeChecklist,
      statuses: {
        ...executionSandboxSmokeChecklist.statuses,
        [itemId]: status,
      },
      lastUpdated: new Date().toISOString(),
      storageAvailable: typeof window !== "undefined",
      error: null,
    };
    const saved = writeExecutionSandboxSmokeChecklistState(nextState);

    setExecutionSandboxSmokeChecklist(nextState);
    setExecutionSandboxSmokeChecklistMessage(
      saved
        ? "Execution sandbox smoke checklist updated locally."
        : "Checklist updated in memory, but localStorage could not be written.",
    );
  }

  function resetExecutionSandboxSmokeChecklist() {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        "Reset the local execution sandbox smoke checklist? This clears only the checklist key and does not affect diagnostics, trades, or broker state.",
      );

    if (!confirmed) {
      return;
    }

    const reset = resetExecutionSandboxSmokeChecklistStorage();

    setExecutionSandboxSmokeChecklist(
      createDefaultExecutionSandboxSmokeChecklistState(),
    );
    setExecutionSandboxSmokeChecklistMessage(
      reset
        ? "Execution sandbox smoke checklist reset."
        : "Checklist reset in memory, but localStorage could not be cleared.",
    );
  }

  function clearLocalAvanzaAgentRuns() {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        "Clear local Avanza agent runs in this browser? This only removes local diagnostics and does not affect trades or broker state.",
      );

    if (!confirmed) {
      return;
    }

    const cleared = clearAvanzaAgentRuns();
    setAvanzaAgentRunStore(readAvanzaAgentRunsForSettings());
    setAvanzaAgentRunStoreMessage(
      cleared
        ? "Local Avanza agent runs cleared."
        : "Could not clear local Avanza agent runs.",
    );
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
    setDevMockBrokerResultStore(readDevMockBrokerResultsForSettings());
    setDevMockBrokerResultStoreMessage(
      cleared
        ? "Local dev mock broker results cleared."
        : "Could not clear local dev mock broker results.",
    );
  }

  function clearLocalSafeBrowserActionDiagnostics() {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        "Clear local safe browser action diagnostics in this browser? This only removes the safe-action diagnostics key and does not affect broker results, execution records, trades, or Supabase.",
      );

    if (!confirmed) {
      return;
    }

    const cleared = clearSafeBrowserActionDiagnostics();
    setSafeBrowserActionDiagnosticsStore(
      readSafeBrowserActionDiagnosticsForSettings(),
    );
    setSafeBrowserActionDiagnosticsMessage(
      cleared
        ? "Safe browser action diagnostics cleared."
        : "Could not clear safe browser action diagnostics.",
    );
  }

  function refreshAfterDevMockBrokerCapture() {
    setExecutionRecordStore(readExecutionRecordsForSettings());
    setExecutionEventLog(readExecutionEventLogForSettings());
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (settingsId === null) {
      setMessage(
        "Settings cannot be saved because no settings row is loaded. Refresh the page to create the default settings row.",
      );
      return;
    }

    const validationError = validateSettings(form);

    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSaving(true);
    setMessage("");
    setSuccessMessage("");

    const { data, error } = await supabase
      .from("user_settings")
      .update({
        portfolio_size: Number(form.portfolioSize),
        risk_per_trade_percent: Number(form.riskPerTradePercent),
        max_recommendations_per_session: Number(
          form.maxRecommendationsPerSession,
        ),
        max_open_positions: Number(form.maxOpenPositions),
        preferred_timeframe: form.preferredTimeframe.trim(),
        long_only: form.longOnly,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settingsId)
      .select("*")
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    if (!data) {
      setMessage(
        "Settings could not be saved because the settings row no longer exists. Refresh the page to recreate it.",
      );
      setSettingsId(null);
      setIsSaving(false);
      return;
    }

    const settingsRow = data as UserSettingsRow;
    writeBrokerCostModelToStorage({
      enabled: form.brokerCostsEnabled,
      broker: form.brokerCostBroker,
      market: "US",
      account_currency: "SEK",
      trade_currency: "USD",
      commission_mode: form.commissionMode,
      entry_fixed_commission: Number(form.entryFixedCommission),
      exit_fixed_commission: Number(form.exitFixedCommission),
      commission_percent: Number(form.commissionPercent),
      minimum_commission: Number(form.minimumCommission),
      fx_fee_percent: Number(form.fxFeePercent),
      estimated_usd_sek_rate: Number(form.estimatedUsdSekRate),
      include_entry_commission: form.includeEntryCommission,
      include_estimated_exit_commission: form.includeEstimatedExitCommission,
      include_fx_fee: form.includeFxFee,
      notes: "Broker costs are estimates. Always verify actual fees in Avanza.",
    });
    setSettingsId(settingsRow.id);
    setForm(toForm(settingsRow));
    setSuccessMessage("Settings saved.");
    setIsSaving(false);
  }

  async function copyBrowserAgentPlanJson() {
    try {
      await navigator.clipboard.writeText(browserAgentPlanJson);
      logBrowserAgentPrototypePlanEvent(
        "browser_agent_prototype_plan_copied",
        browserAgentPlan,
      );
      setBrowserAgentPlanCopyStatus("Browser agent plan JSON copied.");
    } catch {
      setBrowserAgentPlanCopyStatus("Copy failed. Open the JSON details and copy manually.");
    }
  }

  function updateAvanzaVerificationNote(
    noteId: string,
    patch: Partial<AvanzaFieldVerificationNote>,
  ) {
    setAvanzaNotesState((current) => {
      const updatedAt = new Date().toISOString();

      return {
        ...current,
        updated_at: updatedAt,
        notes: current.notes.map((note) =>
          note.note_id === noteId
            ? {
                ...note,
                ...patch,
                criticality:
                  note.criticality === "forbidden_final_confirmation"
                    ? "forbidden_final_confirmation"
                    : (patch.criticality ?? note.criticality),
                updated_at: updatedAt,
              }
            : note,
        ),
      };
    });
    setAvanzaNotesMessage("");
  }

  function saveAvanzaVerificationNotes() {
    const nextState = {
      ...avanzaNotesState,
      updated_at: new Date().toISOString(),
    };
    const nextValidation = validateAvanzaVerificationNotes(nextState);

    try {
      writeAvanzaVerificationNotesState(nextState);
      setAvanzaNotesState(nextState);
      logAvanzaVerificationNotesEvent(
        "avanza_verification_notes_saved",
        nextValidation,
      );
      setAvanzaNotesMessage("Manual Avanza verification notes saved locally.");
    } catch {
      setAvanzaNotesMessage("Could not save Avanza verification notes locally.");
    }
  }

  function resetAvanzaVerificationNotes() {
    const nextState = createDefaultAvanzaVerificationNotesState();
    const nextValidation = validateAvanzaVerificationNotes(nextState);

    try {
      writeAvanzaVerificationNotesState(nextState);
      setAvanzaNotesState(nextState);
      setAvanzaNotesImportJson("");
      logAvanzaVerificationNotesEvent(
        "avanza_verification_notes_reset",
        nextValidation,
      );
      setAvanzaNotesMessage("Manual Avanza verification notes reset locally.");
    } catch {
      setAvanzaNotesMessage("Could not reset Avanza verification notes locally.");
    }
  }

  async function copyAvanzaVerificationNotesJson() {
    try {
      await navigator.clipboard.writeText(avanzaNotesJson);
      logAvanzaVerificationNotesEvent(
        "avanza_verification_notes_exported",
        avanzaNotesValidation,
      );
      setAvanzaNotesMessage("Avanza verification notes JSON copied.");
    } catch {
      setAvanzaNotesMessage("Copy failed. Open the JSON details and copy manually.");
    }
  }

  function importAvanzaVerificationNotesJson() {
    try {
      const nextState = normalizeAvanzaVerificationNotesState(
        JSON.parse(avanzaNotesImportJson),
      );
      const nextValidation = validateAvanzaVerificationNotes(nextState);
      writeAvanzaVerificationNotesState(nextState);
      setAvanzaNotesState(nextState);
      logAvanzaVerificationNotesEvent(
        "avanza_verification_notes_imported",
        nextValidation,
      );
      setAvanzaNotesMessage("Avanza verification notes imported locally.");
    } catch {
      setAvanzaNotesMessage("Import failed. Paste valid Avanza notes JSON.");
    }
  }

  function updateRiskControlsSettings(
    patch: Partial<RiskControlsSettings>,
  ) {
    setRiskControlsSettings((current) => ({
      ...current,
      ...patch,
      updated_at: new Date().toISOString(),
    }));
    setRiskControlsMessage("");
  }

  function updateRiskControlsNumber(
    key: keyof Pick<
      RiskControlsSettings,
      | "max_risk_per_trade_amount"
      | "max_risk_per_trade_percent"
      | "account_size"
      | "default_risk_amount_per_trade"
      | "default_risk_percent_per_trade"
      | "max_position_value"
      | "max_daily_loss_amount"
      | "max_daily_loss_r"
      | "max_trades_per_day"
      | "max_open_positions"
      | "cooldown_after_loss_minutes"
    >,
    value: string,
  ) {
    const parsed = Number(value);
    updateRiskControlsSettings({
      [key]: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
    } as Partial<RiskControlsSettings>);
  }

  function updateRiskControlsTickers(
    key: "allowed_tickers" | "blocked_tickers",
    value: string,
  ) {
    updateRiskControlsSettings({
      [key]: value
        .split(",")
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean),
    });
  }

  function saveRiskControlsSettings() {
    const nextSettings = normalizeRiskControlsSettings({
      ...riskControlsSettings,
      updated_at: new Date().toISOString(),
    });

    try {
      writeRiskControlsSettings(nextSettings);
      setRiskControlsSettings(nextSettings);
      logRiskControlsSettingsEvent("risk_controls_saved", nextSettings);
      setRiskControlsMessage("Risk controls saved locally.");
    } catch {
      setRiskControlsMessage("Could not save risk controls locally.");
    }
  }

  function resetRiskControlsSettings() {
    const nextSettings = createDefaultRiskControlsSettings();

    try {
      writeRiskControlsSettings(nextSettings);
      setRiskControlsSettings(nextSettings);
      logRiskControlsSettingsEvent("risk_controls_reset", nextSettings);
      setRiskControlsMessage("Risk controls reset to defaults.");
    } catch {
      setRiskControlsMessage("Could not reset risk controls locally.");
    }
  }

  async function copyRiskControlsSettingsJson() {
    try {
      await navigator.clipboard.writeText(riskControlsJson);
      setRiskControlsMessage("Risk controls JSON copied.");
    } catch {
      setRiskControlsMessage("Copy failed. Open JSON details and copy manually.");
    }
  }

  const dataModeClaritySummary = buildDataModeClaritySummary({
    environment: process.env.NODE_ENV,
    demo_mode_enabled:
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_ENABLE_DEMO_TRADING_FLOW === "true",
    future_agent_packages: {
      available: true,
      count: 1,
    },
    mock_broker_tools_enabled:
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_ENABLE_DEMO_TRADING_FLOW === "true",
    supabase_connected: true,
    now: browserAgentPlanCreatedAt,
  });

  return (
    <main className="min-h-screen bg-[#060707] text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>Private app</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span>Risk controls</span>
            </div>
            <div>
              <h1 className="font-mono text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Settings
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Personal trading limits for intraday recommendation flow and risk.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white"
          >
            Back to Trade
          </Link>
        </header>

        {message && (
          <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            {message}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg border border-[#00db94]/25 bg-[#00db94]/10 p-4 text-sm leading-6 text-emerald-100">
            {successMessage}
          </div>
        )}

        <section className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-4 text-sm leading-6 text-zinc-300">
          <div className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
            Data / execution reality
          </div>
          <p className="mt-2">
            Risk controls and agent specs are configuration and read/prepare-only
            safety contracts. Ture does not send broker orders, handle
            credentials, control Avanza, or automate KÖP/SÄLJ.
          </p>
          <div
            id="trade-data-mode-clarity-json"
            data-agent-readable="true"
            className="sr-only"
            suppressHydrationWarning
          >
            {dataModeClaritySummaryJson(dataModeClaritySummary)}
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
            <h2 className="font-mono text-lg font-semibold text-white">
              Loading settings
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Trade is reading your user_settings row.
            </p>
          </div>
        ) : (
          <form
            onSubmit={saveSettings}
            className="bg-surface-subtle rounded-lg border border-white/10 p-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <SettingsField label="Portfolio Size">
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.portfolioSize}
                  onChange={(event) =>
                    updateField("portfolioSize", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Risk Per Trade %">
                <input
                  required
                  type="number"
                  min="0.01"
                  max="5"
                  step="0.01"
                  value={form.riskPerTradePercent}
                  onChange={(event) =>
                    updateField("riskPerTradePercent", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Max Recommendations Per Session">
                <input
                  required
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={form.maxRecommendationsPerSession}
                  onChange={(event) =>
                    updateField(
                      "maxRecommendationsPerSession",
                      event.target.value,
                    )
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Max Open Positions">
                <input
                  required
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  value={form.maxOpenPositions}
                  onChange={(event) =>
                    updateField("maxOpenPositions", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <SettingsField label="Preferred Timeframe">
                <input
                  required
                  type="text"
                  value={form.preferredTimeframe}
                  onChange={(event) =>
                    updateField("preferredTimeframe", event.target.value)
                  }
                  className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                />
              </SettingsField>

              <div className="rounded-md border border-white/10 bg-black/25 p-4">
                <div className="flex min-h-12 items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                      Long Only
                    </div>
                    <div className="mt-1 text-sm text-zinc-300">
                      {form.longOnly ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                  <label className="relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full border border-white/10 bg-zinc-800 transition has-[:checked]:border-[#00db94]/40 has-[:checked]:bg-[#00db94]/25">
                    <input
                      type="checkbox"
                      checked={form.longOnly}
                      onChange={(event) =>
                        updateField("longOnly", event.target.checked)
                      }
                      className="peer sr-only"
                    />
                    <span className="ml-1 h-5 w-5 rounded-full bg-zinc-500 transition peer-checked:translate-x-5 peer-checked:bg-emerald-200" />
                  </label>
                </div>
              </div>
            </div>

            <section className="mt-6 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cyan-100">
                    Broker Cost Model
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Broker costs are estimates. Always verify actual fees in
                    Avanza.
                  </p>
                </div>
                <label className="relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full border border-white/10 bg-zinc-800 transition has-[:checked]:border-[#00db94]/40 has-[:checked]:bg-[#00db94]/25">
                  <input
                    type="checkbox"
                    checked={form.brokerCostsEnabled}
                    onChange={(event) =>
                      updateField("brokerCostsEnabled", event.target.checked)
                    }
                    className="peer sr-only"
                  />
                  <span className="ml-1 h-5 w-5 rounded-full bg-zinc-500 transition peer-checked:translate-x-5 peer-checked:bg-emerald-200" />
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SettingsField label="Broker">
                  <select
                    value={form.brokerCostBroker}
                    onChange={(event) =>
                      updateField(
                        "brokerCostBroker",
                        event.target.value as BrokerCostModel["broker"],
                      )
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  >
                    <option value="AVANZA">Avanza</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </SettingsField>

                <SettingsField label="Commission Mode">
                  <select
                    value={form.commissionMode}
                    onChange={(event) =>
                      updateField(
                        "commissionMode",
                        event.target.value as BrokerCostModel["commission_mode"],
                      )
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed_plus_percentage">
                      Fixed + percentage
                    </option>
                  </select>
                </SettingsField>

                <SettingsField label="Entry Fixed Commission SEK">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.entryFixedCommission}
                    onChange={(event) =>
                      updateField("entryFixedCommission", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>

                <SettingsField label="Exit Fixed Commission SEK">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.exitFixedCommission}
                    onChange={(event) =>
                      updateField("exitFixedCommission", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>

                <SettingsField label="Commission Percent">
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.commissionPercent}
                    onChange={(event) =>
                      updateField("commissionPercent", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>

                <SettingsField label="Minimum Commission SEK">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minimumCommission}
                    onChange={(event) =>
                      updateField("minimumCommission", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>

                <SettingsField label="FX Fee Percent">
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.fxFeePercent}
                    onChange={(event) =>
                      updateField("fxFeePercent", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>

                <SettingsField label="Estimated USD/SEK Rate">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estimatedUsdSekRate}
                    onChange={(event) =>
                      updateField("estimatedUsdSekRate", event.target.value)
                    }
                    className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-emerald-300"
                  />
                </SettingsField>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <SettingsToggle
                  label="Include entry commission"
                  checked={form.includeEntryCommission}
                  onChange={(checked) =>
                    updateField("includeEntryCommission", checked)
                  }
                />
                <SettingsToggle
                  label="Include estimated exit commission"
                  checked={form.includeEstimatedExitCommission}
                  onChange={(checked) =>
                    updateField("includeEstimatedExitCommission", checked)
                  }
                />
                <SettingsToggle
                  label="Include FX fee"
                  checked={form.includeFxFee}
                  onChange={(checked) => updateField("includeFxFee", checked)}
                />
              </div>
            </section>

            <section className="mt-6 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.035] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-emerald-100">
                    Execution Mode
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Choose how Ture labels future Avanza handoffs. This build
                    is read-only: no broker connection, order preparation, or
                    KÖP/SÄLJ submission is implemented.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-black/25 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                  {executionMode === "automatic" ? "Automatic" : "Semi-auto"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={executionMode === "semi_automatic"}
                  onClick={() => updateExecutionModePreference("semi_automatic")}
                  className={`rounded-md border p-4 text-left transition ${
                    executionMode === "semi_automatic"
                      ? "border-emerald-300/45 bg-emerald-300/10"
                      : "border-white/10 bg-black/25 hover:border-white/25"
                  }`}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-white">
                      Semi-automatic
                    </span>
                    <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                      Default
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                      Recommended
                    </span>
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-zinc-400">
                    Ture may prepare Avanza order details in the future, but the
                    user must manually press final KÖP/SÄLJ.
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={executionMode === "automatic"}
                  disabled={!automaticExecutionEnabled}
                  onClick={() => updateExecutionModePreference("automatic")}
                  className={`rounded-md border p-4 text-left transition ${
                    executionMode === "automatic"
                      ? "border-amber-300/45 bg-amber-300/10"
                      : "border-white/10 bg-black/25 hover:border-white/25"
                  } ${
                    automaticExecutionEnabled
                      ? ""
                      : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-white">
                      Automatic
                    </span>
                    <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
                      Advanced
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                      Experimental
                    </span>
                    {!automaticExecutionEnabled && (
                      <span className="rounded-full border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                        Locked
                      </span>
                    )}
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-zinc-400">
                    Ture may later be allowed to submit final KÖP/SÄLJ
                    automatically when safety checks pass.
                  </span>
                </button>
              </div>

              <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
                <div className="rounded-md border border-white/10 bg-black/25 p-3">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Authority
                  </div>
                  <div className="mt-1 text-zinc-200">
                    {executionAuthority.final_confirmation_actor === "agent"
                      ? "Agent final confirmation"
                      : "Human final confirmation"}
                  </div>
                </div>
                <div className="rounded-md border border-white/10 bg-black/25 p-3">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Prepare Order
                  </div>
                  <div className="mt-1 text-zinc-200">
                    {executionAuthority.can_prepare_broker_form ? "Allowed" : "Blocked"}
                  </div>
                </div>
                <div className="rounded-md border border-white/10 bg-black/25 p-3">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Final Submit
                  </div>
                  <div className="mt-1 text-zinc-200">
                    {executionAuthority.allowFinalSubmit ? "Allowed by mode" : "Manual only"}
                  </div>
                </div>
              </div>

              {!automaticExecutionEnabled && (
                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  Automatic mode is visible for planning, but locked unless
                  NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION is set to true.
                </p>
              )}

              {executionModeMessage && (
                <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
                  {executionModeMessage}
                </p>
              )}
            </section>

            {executionDevToolsEnabled ? (
              <>
                <ExecutionSandboxSmokeChecklistPanel
                  state={executionSandboxSmokeChecklist}
                  items={executionSandboxSmokeChecklistItems}
                  bridgeFactoryResult={avanzaAgentBridgeFactoryResult}
                  message={executionSandboxSmokeChecklistMessage}
                  onUpdateStatus={updateExecutionSandboxSmokeChecklistStatus}
                  onReset={resetExecutionSandboxSmokeChecklist}
                />

                <AvanzaAgentBridgeConfigPanel
                  config={avanzaAgentBridgeConfig}
                  options={avanzaAgentBridgeTransportOptions}
                  message={avanzaAgentBridgeConfigMessage}
                  onSelectTransport={updateAvanzaAgentBridgeTransport}
                  onReset={resetAvanzaAgentBridgeConfig}
                />

                <AvanzaAgentBridgeDiagnosticsPanel
                  bridge={avanzaAgentBridge}
                  factoryResult={avanzaAgentBridgeFactoryResult}
                  health={avanzaAgentBridgeHealth}
                  isChecking={isCheckingAvanzaAgentBridge}
                  message={avanzaAgentBridgeMessage}
                  localhostHealthCheck={localhostBridgeHealthCheck}
                  isCheckingLocalhost={isCheckingLocalhostBridge}
                  onCheckHealth={() => void checkAvanzaAgentBridgeHealth()}
                  onCheckLocalhostHealth={() =>
                    void checkLocalhostBridgeStubHealth()
                  }
                />

                <ExecutionEventLogPanel
                  readResult={executionEventLog}
                  visibleEvents={latestExecutionAuditEvents}
                  latestTimestamp={latestExecutionAuditTimestamp}
                  message={executionEventLogMessage}
                  onRefresh={refreshExecutionEventLog}
                  onClear={clearExecutionEventLog}
                />

                <ExecutionAuditPersistenceStubsPanel />

                <AgentAdapterDiagnosticsPanel
                  readResult={executionEventLog}
                  entries={latestAgentAdapterDiagnosticsEntries}
                  totalCount={agentAdapterDiagnosticsEntries.length}
                  latestTimestamp={latestAgentAdapterDiagnosticsTimestamp}
                  uniqueRequestCount={uniqueAgentAdapterRequestCount}
                  uniqueIntentCount={uniqueAgentAdapterIntentCount}
                  message={executionEventLogMessage}
                  onRefresh={refreshExecutionEventLog}
                />

                <SafeBrowserActionDiagnosticsPanel
                  readResult={safeBrowserActionDiagnosticsStore}
                  visibleDiagnostics={latestSafeBrowserActionDiagnostics}
                  latestTimestamp={latestSafeBrowserActionDiagnosticsTimestamp}
                  finalConfirmBlockedCount={
                    safeBrowserActionFinalConfirmBlockedCount
                  }
                  message={safeBrowserActionDiagnosticsMessage}
                  onRefresh={refreshSafeBrowserActionDiagnostics}
                  onClear={clearLocalSafeBrowserActionDiagnostics}
                />

                <AvanzaAgentRunsPanel
                  readResult={avanzaAgentRunStore}
                  visibleRuns={latestAvanzaAgentRuns}
                  latestTimestamp={latestAvanzaAgentRunTimestamp}
                  message={avanzaAgentRunStoreMessage}
                  onRefresh={refreshAvanzaAgentRuns}
                  onClear={clearLocalAvanzaAgentRuns}
                />

                <DevMockBrokerResultsPanel
                  readResult={devMockBrokerResultStore}
                  visibleResults={latestDevMockBrokerResults}
                  latestTimestamp={latestDevMockBrokerResultTimestamp}
                  executionRecords={executionRecordStore.records}
                  message={devMockBrokerResultStoreMessage}
                  onRefresh={refreshDevMockBrokerResults}
                  onClear={clearLocalDevMockBrokerResults}
                  onCaptureComplete={refreshAfterDevMockBrokerCapture}
                />

                <ExecutionRecordsPanel
                  readResult={executionRecordStore}
                  visibleRecords={latestExecutionRecords}
                  latestTimestamp={latestExecutionRecordTimestamp}
                  message={executionRecordStoreMessage}
                  onRefresh={refreshExecutionRecords}
                  onClear={clearLocalExecutionRecords}
                />
              </>
            ) : (
              <section className="mt-6 rounded-lg border border-white/10 bg-black/25 p-4">
                <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-zinc-200">
                  Execution Dev Tools
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Execution dev tools are disabled in this build.
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Enable NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true for local
                  diagnostics.
                </p>
              </section>
            )}

            <RiskControlsSettingsPanel
              settings={riskControlsSettings}
              settingsJson={riskControlsJson}
              message={riskControlsMessage}
              onUpdate={updateRiskControlsSettings}
              onUpdateNumber={updateRiskControlsNumber}
              onUpdateTickers={updateRiskControlsTickers}
              onSave={saveRiskControlsSettings}
              onReset={resetRiskControlsSettings}
              onCopyJson={copyRiskControlsSettingsJson}
            />

            <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-zinc-500">
                These controls are saved for future intraday trading logic.
              </p>
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-11 rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        )}

        <AutomationStatusPanel
          automationRuns={automationRuns}
          isLoading={isLoadingAutomationRuns}
          message={automationMessage}
          marketStatus={marketStatus}
          marketStatusMessage={marketStatusMessage}
          onRefresh={loadAutomationRuns}
        />

        <BrowserAgentPrototypePlanPanel
          plan={browserAgentPlan}
          planJson={browserAgentPlanJson}
          copyStatus={browserAgentPlanCopyStatus}
          onCopy={copyBrowserAgentPlanJson}
        />

        <AvanzaVerificationNotesPanel
          state={avanzaNotesState}
          validation={avanzaNotesValidation}
          notesJson={avanzaNotesJson}
          message={avanzaNotesMessage}
          importJson={avanzaNotesImportJson}
          onImportJsonChange={setAvanzaNotesImportJson}
          onUpdateNote={updateAvanzaVerificationNote}
          onSave={saveAvanzaVerificationNotes}
          onReset={resetAvanzaVerificationNotes}
          onCopyJson={copyAvanzaVerificationNotesJson}
          onImportJson={importAvanzaVerificationNotesJson}
        />
      </div>
    </main>
  );
}

function SettingsField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-md border border-white/10 bg-black/25 p-4">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function executionSandboxSmokeChecklistStatusLabel(
  status: ExecutionSandboxSmokeChecklistStatus,
) {
  if (status === "pass") {
    return "Pass";
  }

  if (status === "fail") {
    return "Fail";
  }

  return "Not tested";
}

function executionSandboxSmokeChecklistStatusTone(
  status: ExecutionSandboxSmokeChecklistStatus,
) {
  if (status === "pass") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "fail") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.04] text-zinc-400";
}

function ExecutionSandboxSmokeChecklistPanel({
  state,
  items,
  bridgeFactoryResult,
  message,
  onUpdateStatus,
  onReset,
}: {
  state: ExecutionSandboxSmokeChecklistState;
  items: ExecutionSandboxSmokeChecklistItemDefinition[];
  bridgeFactoryResult: AvanzaAgentBridgeFactoryResult;
  message: string;
  onUpdateStatus: (
    itemId: string,
    status: ExecutionSandboxSmokeChecklistStatus,
  ) => void;
  onReset: () => void;
}) {
  const counts = items.reduce(
    (summary, item) => {
      const status = state.statuses[item.id] ?? "not_tested";

      summary[status] += 1;
      return summary;
    },
    { not_tested: 0, pass: 0, fail: 0 },
  );

  return (
    <section className="mt-6 rounded-lg border border-lime-300/15 bg-lime-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-lime-100">
            Execution Sandbox Smoke Test
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Local manual checklist for the execution sandbox. It does not run
            Avanza, send bridge traffic, execute trades, create broker results,
            mutate trade state, or write to Supabase.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="w-fit rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40"
        >
          Reset checklist
        </button>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-5">
        <AuditDetail label="Total" value={items.length} />
        <AuditDetail label="Pass" value={counts.pass} />
        <AuditDetail label="Fail" value={counts.fail} />
        <AuditDetail label="Not Tested" value={counts.not_tested} />
        <AuditDetail label="Last Updated" value={formatDateTime(state.lastUpdated)} />
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Stored locally in this browser under{" "}
        {EXECUTION_SANDBOX_SMOKE_CHECKLIST_STORAGE_KEY}. Status changes create
        no audit events and do not clear any diagnostics.
      </p>

      {state.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Checklist storage could not be parsed safely: {state.error}
        </p>
      )}

      {!state.storageAvailable && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          localStorage is unavailable. Checklist changes can only live in
          memory for this render.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-lime-100">
              Bridge Config / Factory Status
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Read-only summary for manual QA. This does not auto-mark checklist
              items, check bridge health, send bridge requests, or contact
              Avanza.
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${
              bridgeFactoryResult.fallbackUsed
                ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
            }`}
          >
            {bridgeFactoryResult.fallbackUsed ? "Fallback" : "No-op"}
          </span>
        </div>

        <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
          <AuditDetail
            label="Selected"
            value={getAvanzaAgentBridgeTransportDisplayLabel(
              bridgeFactoryResult.selectedTransport,
            )}
          />
          <AuditDetail
            label="Resolved"
            value={getAvanzaAgentBridgeTransportDisplayLabel(
              bridgeFactoryResult.resolvedTransport,
            )}
          />
          <AuditDetail label="Fallback" value={bridgeFactoryResult.fallbackUsed} />
          <AuditDetail label="Reason" value={bridgeFactoryResult.reason} />
        </div>

        {bridgeFactoryResult.warnings.length > 0 && (
          <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
              Factory warnings
            </p>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
              {bridgeFactoryResult.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item, index) => {
          const currentStatus = state.statuses[item.id] ?? "not_tested";

          return (
            <article
              key={item.id}
              className="rounded-md border border-white/10 bg-black/20 p-3"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${executionSandboxSmokeChecklistStatusTone(
                        currentStatus,
                      )}`}
                    >
                      {executionSandboxSmokeChecklistStatusLabel(currentStatus)}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                      Check {index + 1}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {item.label}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["not_tested", "pass", "fail"] as const).map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => onUpdateStatus(item.id, status)}
                      className={`rounded-full border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                        currentStatus === status
                          ? executionSandboxSmokeChecklistStatusTone(status)
                          : "border-white/10 bg-black/25 text-zinc-400 hover:border-lime-300/30 hover:text-lime-100"
                      }`}
                    >
                      {executionSandboxSmokeChecklistStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AvanzaAgentBridgeConfigPanel({
  config,
  options,
  message,
  onSelectTransport,
  onReset,
}: {
  config: AvanzaAgentBridgeConfig;
  options: AvanzaAgentBridgeTransportOption[];
  message: string;
  onSelectTransport: (transport: AvanzaAgentBridgeTransport) => void;
  onReset: () => void;
}) {
  return (
    <section className="mt-6 rounded-lg border border-indigo-300/15 bg-indigo-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-indigo-100">
            Avanza Agent Bridge Configuration
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Local dev-only configuration for the future external Avanza agent
            bridge. No transport is connected in this build, and no host, port,
            token, credential, or Avanza login fields are available.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="w-fit rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40"
        >
          Reset configuration
        </button>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
        <AuditDetail
          label="Selected Transport"
          value={getAvanzaAgentBridgeTransportDisplayLabel(
            config.selectedTransport,
          )}
        />
        <AuditDetail label="Last Updated" value={formatDateTime(config.updatedAt)} />
        <AuditDetail
          label="Storage"
          value={config.storageAvailable ? "Local browser" : "Unavailable"}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Stored locally in this browser under {AVANZA_AGENT_BRIDGE_CONFIG_STORAGE_KEY}.
        No bridge and Echo bridge are selectable for local diagnostics right
        now. Future transports are shown for planning only.
      </p>

      {config.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Bridge configuration could not be parsed safely: {config.error}
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const selected = option.transport === config.selectedTransport;

          return (
            <button
              type="button"
              key={option.transport}
              disabled={!option.enabled}
              onClick={() => onSelectTransport(option.transport)}
              className={`rounded-md border p-3 text-left transition ${
                selected
                  ? "border-indigo-300/35 bg-indigo-300/10"
                  : "border-white/10 bg-black/20 hover:border-indigo-300/25"
              } disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.025] disabled:opacity-70`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-200">
                  {getAvanzaAgentBridgeTransportDisplayLabel(option.transport)}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${
                    option.enabled
                      ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                      : "border-amber-300/25 bg-amber-300/10 text-amber-100"
                  }`}
                >
                  {option.enabled ? (selected ? "Current" : "Available") : "Future"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-400">
                {option.note}
              </p>
              {!option.enabled && (
                <p className="mt-2 text-xs leading-5 text-zinc-600">
                  Disabled in this build. No transport settings are exposed.
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AvanzaAgentBridgeDiagnosticsPanel({
  bridge,
  factoryResult,
  health,
  isChecking,
  message,
  localhostHealthCheck,
  isCheckingLocalhost,
  onCheckHealth,
  onCheckLocalhostHealth,
}: {
  bridge: AvanzaAgentBridge;
  factoryResult: AvanzaAgentBridgeFactoryResult;
  health: AvanzaAgentBridgeHealth | null;
  isChecking: boolean;
  message: string;
  localhostHealthCheck: LocalhostBridgeClientHealthCheckResult | null;
  isCheckingLocalhost: boolean;
  onCheckHealth: () => void;
  onCheckLocalhostHealth: () => void;
}) {
  const capabilities = health?.capabilities;
  const localhostHealth = localhostHealthCheck?.response;
  const localhostCapabilities = localhostHealth?.capabilities;

  return (
    <section className="mt-6 rounded-lg border border-amber-300/15 bg-amber-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-amber-100">
            Avanza Agent Bridge
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Diagnostics for the future external Avanza agent bridge. No broker
            agent is connected in this build, no Avanza session will open, and
            no broker order can be created from this bridge.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCheckHealth}
            disabled={isChecking}
            className="w-fit rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-amber-300/30 hover:text-amber-100 disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            {isChecking ? "Checking..." : "Check bridge health"}
          </button>
          <button
            type="button"
            onClick={onCheckLocalhostHealth}
            disabled={isCheckingLocalhost}
            className="w-fit rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100 transition hover:border-sky-200/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            {isCheckingLocalhost ? "Checking localhost..." : "Check localhost stub"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Bridge
          </div>
          <div className="mt-1 text-zinc-200">{bridge.name}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Transport
          </div>
          <div className="mt-1 text-zinc-200">
            {getAvanzaAgentBridgeTransportDisplayLabel(
              health?.transport ?? bridge.transport,
            )}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Status
          </div>
          <div className="mt-1 text-zinc-200">
            {health
              ? getAvanzaAgentBridgeStatusDisplayLabel(health.status)
              : "Not checked"}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <AuditDetail
          label="Selected Transport"
          value={getAvanzaAgentBridgeTransportDisplayLabel(
            factoryResult.selectedTransport,
          )}
        />
        <AuditDetail
          label="Resolved Transport"
          value={getAvanzaAgentBridgeTransportDisplayLabel(
            factoryResult.resolvedTransport,
          )}
        />
        <AuditDetail label="Factory Fallback" value={factoryResult.fallbackUsed} />
        <AuditDetail label="Factory Reason" value={factoryResult.reason} />
        <AuditDetail
          label="Real Automation"
          value={bridge.supportsRealBrokerAutomation}
        />
        <AuditDetail label="Real Bridge" value={isRealAvanzaAgentBridge(bridge)} />
        <AuditDetail
          label="Checked At"
          value={health ? formatDateTime(health.checkedAt) : null}
        />
        <AuditDetail
          label="Health Message"
          value={health?.message ?? "Health has not been checked yet."}
        />
      </div>

      {capabilities && (
        <>
          <div className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Capabilities
          </div>
          <div className="mt-2 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
            <AuditDetail
              label="Progress Events"
              value={capabilities.supportsProgressEvents}
            />
            <AuditDetail
              label="Cancellation"
              value={capabilities.supportsCancellation}
            />
            <AuditDetail
              label="Automatic Submit"
              value={capabilities.supportsAutomaticSubmit}
            />
            <AuditDetail
              label="Manual Wait"
              value={capabilities.supportsManualConfirmationWait}
            />
            <AuditDetail
              label="Broker Result Return"
              value={capabilities.supportsBrokerResultReturn}
            />
            <AuditDetail
              label="Real Broker Automation"
              value={capabilities.supportsRealBrokerAutomation}
            />
            <AuditDetail
              label="Max Concurrent Runs"
              value={capabilities.maxConcurrentRuns}
            />
            <AuditDetail label="Version" value={capabilities.version} />
          </div>
        </>
      )}

      {factoryResult.warnings.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
            Factory Warnings
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
            {factoryResult.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        This panel creates the bridge through the bridge factory and calls only
        the resulting health method. It does not send bridge requests, create
        audit events, write storage, or contact Avanza.
      </p>

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 rounded-md border border-sky-300/15 bg-sky-300/[0.04] p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100">
              Localhost Stub Health
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Health check only. Does not run bridge requests or execute
              orders. Start the stub with{" "}
              <span className="font-mono text-zinc-300">
                npm run bridge:localhost
              </span>
              .
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${
              localhostHealthCheck?.ok
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                : localhostHealthCheck
                  ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                  : "border-white/10 bg-white/[0.04] text-zinc-500"
            }`}
          >
            {localhostHealthCheck?.ok
              ? "Healthy"
              : localhostHealthCheck
                ? "Unavailable"
                : "Not checked"}
          </span>
        </div>

        <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
          <AuditDetail
            label="Reachable"
            value={localhostHealthCheck?.reachable ?? null}
          />
          <AuditDetail label="Valid" value={localhostHealthCheck?.ok ?? null} />
          <AuditDetail
            label="Status Code"
            value={localhostHealthCheck?.statusCode ?? null}
          />
          <AuditDetail
            label="Base URL"
            value={localhostHealthCheck?.baseUrl ?? DEFAULT_LOCALHOST_BRIDGE_BASE_URL}
          />
          <AuditDetail
            label="Checked At"
            value={
              localhostHealthCheck
                ? formatDateTime(localhostHealthCheck.checkedAt)
                : null
            }
          />
          <AuditDetail
            label="Bridge Status"
            value={
              localhostHealth
                ? getAvanzaAgentBridgeStatusDisplayLabel(
                    localhostHealth.bridgeStatus,
                  )
                : null
            }
          />
          <AuditDetail label="Message" value={localhostHealth?.message ?? null} />
          <AuditDetail
            label="Real Automation"
            value={localhostCapabilities?.supportsRealBrokerAutomation ?? null}
          />
        </div>

        {localhostHealthCheck && !localhostHealthCheck.reachable && (
          <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
            Localhost bridge server not reachable. Start with{" "}
            <span className="font-mono">npm run bridge:localhost</span>.
          </p>
        )}

        {localhostHealthCheck?.errors.length ? (
          <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
              Localhost health errors
            </p>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
              {localhostHealthCheck.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {localhostHealthCheck?.warnings.length ? (
          <div className="mt-3 rounded-md border border-sky-300/15 bg-black/15 p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100">
              Localhost health warnings
            </p>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
              {localhostHealthCheck.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ExecutionEventLogPanel({
  readResult,
  visibleEvents,
  latestTimestamp,
  message,
  onRefresh,
  onClear,
}: {
  readResult: ExecutionEventLogReadResult;
  visibleEvents: ExecutionAuditEvent[];
  latestTimestamp: string | null;
  message: string;
  onRefresh: () => void;
  onClear: () => void;
}) {
  const hasEvents = readResult.events.length > 0;

  return (
    <section className="mt-6 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cyan-100">
            Execution Event Log
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Local browser audit data for execution handoff diagnostics. No
            broker orders are executed from this log.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-cyan-300/30 hover:text-cyan-100"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!readResult.storageAvailable}
            className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            Clear execution event log
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Total Events
          </div>
          <div className="mt-1 text-zinc-200">{readResult.events.length}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Latest Event
          </div>
          <div className="mt-1 text-zinc-200">
            {formatDateTime(latestTimestamp)}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Storage
          </div>
          <div className="mt-1 text-zinc-200">
            {readResult.storageAvailable ? "Local browser" : "Unavailable"}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Stored locally in this browser. Refresh reads the current local log;
        clear removes only execution audit events.
      </p>

      {readResult.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Event log could not be parsed safely: {readResult.error}
        </p>
      )}

      {readResult.discardedCount > 0 && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Ignored {readResult.discardedCount} malformed execution audit event
          {readResult.discardedCount === 1 ? "" : "s"}.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {!hasEvents ? (
          <div className="rounded-md border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-500">
            No execution audit events are stored in this browser yet.
          </div>
        ) : (
          visibleEvents.map((event) => (
            <ExecutionEventLogRow event={event} key={event.eventId} />
          ))
        )}
      </div>
    </section>
  );
}

function ExecutionEventLogRow({ event }: { event: ExecutionAuditEvent }) {
  const status = event.handoffStatus ?? event.brokerStatus;

  return (
    <article className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              {event.type}
            </span>
            {status && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                {status}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {event.message ?? "Execution audit event recorded locally."}
          </p>
        </div>
        <time className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {formatDateTime(event.createdAt)}
        </time>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <AuditDetail label="Ticker" value={event.ticker} />
        <AuditDetail label="Action" value={event.action} />
        <AuditDetail label="Mode" value={event.mode} />
        <AuditDetail label="Trigger" value={event.triggerType} />
        <AuditDetail
          label="Intent"
          value={shortExecutionAuditId(event.intentId)}
        />
        <AuditDetail
          label="Position"
          value={shortExecutionAuditId(event.positionId)}
        />
        <AuditDetail
          label="Recommendation"
          value={shortExecutionAuditId(event.recommendationId)}
        />
        <AuditDetail label="Broker" value={event.broker} />
      </div>

      {event.metadata && (
        <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
          <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
            Metadata
          </summary>
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
            {JSON.stringify(event.metadata, null, 2)}
          </pre>
        </details>
      )}
    </article>
  );
}

function executionAuditPersistenceUiResult(
  label: string,
  result: PostExecutionAuditPersistenceRequestResult,
): ExecutionAuditPersistenceStubUiResult {
  return {
    ok: result.ok,
    label,
    statusCode: result.statusCode,
    response: result.response,
    errors: result.errors,
    warnings: result.warnings,
    completedAt: result.completedAt,
  };
}

function ExecutionAuditPersistenceStubsPanel() {
  const [result, setResult] =
    useState<ExecutionAuditPersistenceStubUiResult | null>(null);
  const [pendingStub, setPendingStub] = useState<
    "lifecycle" | "agent_run" | "progress" | null
  >(null);

  async function runLifecycleEventStub() {
    setPendingStub("lifecycle");

    try {
      const postResult = await postPersistExecutionLifecycleEventRequest(
        buildSamplePersistExecutionLifecycleEventRequest(),
      );

      setResult(
        executionAuditPersistenceUiResult(
          "Lifecycle event audit stub",
          postResult,
        ),
      );
    } finally {
      setPendingStub(null);
    }
  }

  async function runAgentRunStub() {
    setPendingStub("agent_run");

    try {
      const postResult = await postPersistExecutionAgentRunRequest(
        buildSamplePersistExecutionAgentRunRequest(),
      );

      setResult(
        executionAuditPersistenceUiResult(
          "Agent run audit stub",
          postResult,
        ),
      );
    } finally {
      setPendingStub(null);
    }
  }

  async function runAgentProgressStub() {
    setPendingStub("progress");

    try {
      const postResult =
        await postPersistExecutionAgentProgressEventRequest(
          buildSamplePersistExecutionAgentProgressEventRequest(),
        );

      setResult(
        executionAuditPersistenceUiResult(
          "Agent progress audit stub",
          postResult,
        ),
      );
    } finally {
      setPendingStub(null);
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-emerald-100">
            Execution Audit API Stubs
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Dev-only route validation. No Supabase write. These buttons POST
            local_dev mock audit payloads to the route stubs and display the
            accepted, rejected, or disabled response.
          </p>
        </div>
        <span className="w-fit rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-100">
          No persistence
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void runLifecycleEventStub()}
          disabled={pendingStub !== null}
          className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-emerald-300/30 hover:text-emerald-100 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
        >
          {pendingStub === "lifecycle"
            ? "Testing lifecycle stub"
            : "Test lifecycle event audit stub"}
        </button>
        <button
          type="button"
          onClick={() => void runAgentRunStub()}
          disabled={pendingStub !== null}
          className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-emerald-300/30 hover:text-emerald-100 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
        >
          {pendingStub === "agent_run"
            ? "Testing agent run stub"
            : "Test agent run audit stub"}
        </button>
        <button
          type="button"
          onClick={() => void runAgentProgressStub()}
          disabled={pendingStub !== null}
          className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-emerald-300/30 hover:text-emerald-100 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
        >
          {pendingStub === "progress"
            ? "Testing progress stub"
            : "Test agent progress audit stub"}
        </button>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        No localStorage write, execution record, audit event, trade update,
        History update, Statistics update, broker execution, or Avanza
        automation is performed by these UI tests.
      </p>

      {result && (
        <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3 text-xs leading-5 text-zinc-300">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">
                {result.label}
              </p>
              <p className="mt-2 font-semibold text-zinc-100">
                {result.response?.message ??
                  (result.ok
                    ? "Execution audit persistence stub accepted the request."
                    : "Execution audit persistence stub request failed.")}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${
                result.ok
                  ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                  : "border-amber-300/25 bg-amber-300/10 text-amber-100"
              }`}
            >
              {result.ok ? "Accepted" : "Not accepted"}
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <AuditDetail label="Stub OK" value={result.ok} />
            <AuditDetail label="HTTP" value={result.statusCode ?? "—"} />
            <AuditDetail
              label="Status"
              value={result.response?.status ?? "—"}
            />
            <AuditDetail
              label="Completed"
              value={formatDateTime(result.completedAt)}
            />
            <AuditDetail label="Stub Id" value={result.response?.id ?? "—"} />
            <AuditDetail
              label="Received"
              value={formatDateTime(result.response?.receivedAt ?? null)}
            />
          </div>

          {result.errors.length > 0 && (
            <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.08] p-3 text-rose-100">
              {result.errors.join(" ")}
            </p>
          )}
          {result.warnings.length > 0 && (
            <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-amber-100">
              {result.warnings.join(" ")}
            </p>
          )}

          <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
            <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
              Response JSON
            </summary>
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
              {JSON.stringify(result.response ?? result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
}

function AgentAdapterDiagnosticsPanel({
  readResult,
  entries,
  totalCount,
  latestTimestamp,
  uniqueRequestCount,
  uniqueIntentCount,
  message,
  onRefresh,
}: {
  readResult: ExecutionEventLogReadResult;
  entries: AgentAdapterDiagnosticsEntry[];
  totalCount: number;
  latestTimestamp: string | null;
  uniqueRequestCount: number;
  uniqueIntentCount: number;
  message: string;
  onRefresh: () => void;
}) {
  const hasEntries = totalCount > 0;

  return (
    <section className="mt-6 rounded-lg border border-sky-300/15 bg-sky-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-sky-100">
            Agent Adapter Diagnostics
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Local dev-only view of future Avanza agent progress events. No
            broker agent is connected, and this viewer cannot create broker
            orders or broker results.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="w-fit rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-sky-300/30 hover:text-sky-100"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-4">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Progress Events
          </div>
          <div className="mt-1 text-zinc-200">{totalCount}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Latest Event
          </div>
          <div className="mt-1 text-zinc-200">
            {formatDateTime(latestTimestamp)}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Requests
          </div>
          <div className="mt-1 text-zinc-200">{uniqueRequestCount}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Intents
          </div>
          <div className="mt-1 text-zinc-200">{uniqueIntentCount}</div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Reads only local execution audit events with agent-progress metadata.
        Use the Execution Event Log section to clear the underlying local log.
      </p>

      {readResult.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Event log could not be parsed safely: {readResult.error}
        </p>
      )}

      {readResult.discardedCount > 0 && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Ignored {readResult.discardedCount} malformed execution audit event
          {readResult.discardedCount === 1 ? "" : "s"}.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {!hasEntries ? (
          <div className="rounded-md border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-500">
            No local agent progress stub events are stored in this browser yet.
          </div>
        ) : (
          entries.map((entry) => (
            <AgentAdapterDiagnosticsRow
              entry={entry}
              key={entry.progressEventId ?? entry.event.eventId}
            />
          ))
        )}
      </div>
    </section>
  );
}

function AgentAdapterDiagnosticsRow({
  entry,
}: {
  entry: AgentAdapterDiagnosticsEntry;
}) {
  const { event } = entry;

  return (
    <article className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100">
              {entry.progressType ?? event.type}
            </span>
            {entry.mappedLifecycleEventType && (
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
                {entry.mappedLifecycleEventType}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {event.message ??
              "Local dev-only agent adapter progress event recorded."}
          </p>
        </div>
        <time className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {formatDateTime(event.createdAt)}
        </time>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <AuditDetail
          label="Request"
          value={shortExecutionAuditId(entry.requestId)}
        />
        <AuditDetail
          label="Progress"
          value={shortExecutionAuditId(entry.progressEventId)}
        />
        <AuditDetail
          label="Lifecycle"
          value={entry.mappedLifecycleEventType}
        />
        <AuditDetail label="Ticker" value={event.ticker} />
        <AuditDetail label="Action" value={event.action} />
        <AuditDetail label="Mode" value={event.mode} />
        <AuditDetail
          label="Intent"
          value={shortExecutionAuditId(event.intentId)}
        />
        <AuditDetail
          label="Position"
          value={shortExecutionAuditId(event.positionId)}
        />
      </div>

      {event.metadata && (
        <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
          <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
            Agent metadata
          </summary>
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
            {JSON.stringify(event.metadata, null, 2)}
          </pre>
        </details>
      )}
    </article>
  );
}

function SafeBrowserActionDiagnosticsPanel({
  readResult,
  visibleDiagnostics,
  latestTimestamp,
  finalConfirmBlockedCount,
  message,
  onRefresh,
  onClear,
}: {
  readResult: SafeBrowserActionDiagnosticsStoreReadResult;
  visibleDiagnostics: StoredSafeBrowserActionExecutionDiagnostics[];
  latestTimestamp: string | null;
  finalConfirmBlockedCount: number;
  message: string;
  onRefresh: () => void;
  onClear: () => void;
}) {
  const hasDiagnostics = readResult.diagnostics.length > 0;

  return (
    <section className="mt-6 rounded-lg border border-teal-300/15 bg-teal-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-teal-100">
            Safe Browser Action Diagnostics
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Local diagnostics for mock/future browser action runs. Not broker
            results. Not order execution.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-teal-300/30 hover:text-teal-100"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!readResult.storageAvailable}
            className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            Clear diagnostics
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-4">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Total Diagnostics
          </div>
          <div className="mt-1 text-zinc-200">
            {readResult.diagnostics.length}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Latest Diagnostic
          </div>
          <div className="mt-1 text-zinc-200">
            {formatDateTime(latestTimestamp)}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Final-confirm Blocked
          </div>
          <div className="mt-1 text-zinc-200">
            {finalConfirmBlockedCount}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Storage
          </div>
          <div className="mt-1 text-zinc-200">
            {readResult.storageAvailable ? "Local browser" : "Unavailable"}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Refresh reads only the safe browser action diagnostics key; clear
        removes only that diagnostics key and does not affect broker results,
        execution records, trades, or Supabase.
      </p>

      {readResult.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Safe browser action diagnostics could not be parsed safely:{" "}
          {readResult.error}
        </p>
      )}

      {readResult.discardedCount > 0 && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Ignored {readResult.discardedCount} malformed safe browser action
          diagnostic{readResult.discardedCount === 1 ? "" : "s"}.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {!hasDiagnostics ? (
          <div className="rounded-md border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-500">
            No local safe browser action diagnostics are stored in this browser
            yet.
          </div>
        ) : (
          visibleDiagnostics.map((diagnostics) => (
            <SafeBrowserActionDiagnosticsRow
              diagnostics={diagnostics}
              key={diagnostics.diagnosticsId}
            />
          ))
        )}
      </div>
    </section>
  );
}

function SafeBrowserActionDiagnosticsRow({
  diagnostics,
}: {
  diagnostics: StoredSafeBrowserActionExecutionDiagnostics;
}) {
  const capability = classifyDiagnosticsCapability(diagnostics);
  const allowAvanzaDryRun =
    capability.targetEnvironment === "avanza_broker" &&
    capability.metadata?.dryRunOnly === true;
  const capabilityValidation = validateBrowserRunnerCapability(capability, {
    allowAvanzaDryRun,
  });
  const capabilitySummary =
    summarizeBrowserRunnerCapabilityValidation(capabilityValidation);
  const isMockOnlySafe =
    capabilityValidation.safetyLevel === "safe_mock_only" &&
    capabilityValidation.ok;
  const isAvanzaDryRun =
    capabilityValidation.safetyLevel === "dry_run_only" &&
    capabilityValidation.ok &&
    capabilityValidation.canRunAvanzaDryRun;
  const capabilityLabel = isMockOnlySafe
    ? "Mock-only browser diagnostics"
    : isAvanzaDryRun
      ? "Avanza dry-run diagnostics"
      : capabilityValidation.safetyLevel;

  return (
    <article className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
                diagnostics.ok
                  ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                  : "border-rose-300/25 bg-rose-300/10 text-rose-100"
              }`}
            >
              {diagnostics.ok ? "OK" : "Blocked or failed"}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              {diagnostics.mode}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
                isMockOnlySafe || isAvanzaDryRun
                  ? "border-teal-300/25 bg-teal-300/10 text-teal-100"
                  : "border-amber-300/25 bg-amber-300/10 text-amber-100"
              }`}
            >
              {capabilityLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              No broker submission
            </span>
            {diagnostics.finalConfirmBlocked && (
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
                Final confirm blocked
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {diagnostics.runnerName}
          </p>
        </div>
        <time className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {formatDateTime(diagnostics.createdAt)}
        </time>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <AuditDetail
          label="Diagnostic"
          value={shortExecutionAuditId(diagnostics.diagnosticsId)}
        />
        <AuditDetail label="Mode" value={diagnostics.mode} />
        <AuditDetail label="OK" value={diagnostics.ok} />
        <AuditDetail label="Blocked" value={diagnostics.blocked} />
        <AuditDetail
          label="Final Confirm Blocked"
          value={diagnostics.finalConfirmBlocked}
        />
        <AuditDetail
          label="Real Browser Support"
          value={diagnostics.supportsRealBrowserExecution}
        />
        <AuditDetail
          label="Capability Safety"
          value={capabilityValidation.safetyLevel}
        />
        <AuditDetail
          label="Target Environment"
          value={capability.targetEnvironment}
        />
        <AuditDetail
          label="Broker Submission"
          value={
            capability.supportsBrokerSubmission
              ? "Supported"
              : "No broker submission"
          }
        />
        <AuditDetail
          label="Final Confirm"
          value={
            capability.supportsFinalConfirmClick
              ? "Click capable"
              : "Final confirm disabled"
          }
        />
        <AuditDetail label="Executed" value={diagnostics.executedCount} />
        <AuditDetail label="Blocked Count" value={diagnostics.blockedCount} />
        <AuditDetail label="Failed" value={diagnostics.failedCount} />
        <AuditDetail label="Skipped" value={diagnostics.skippedCount} />
        <AuditDetail label="Errors" value={diagnostics.errors.length} />
        <AuditDetail label="Warnings" value={diagnostics.warnings.length} />
      </div>

      <p
        className={`mt-3 rounded-md border p-3 text-xs leading-5 ${
          capabilityValidation.ok
            ? "border-teal-300/15 bg-teal-300/[0.06] text-teal-100"
            : "border-amber-300/20 bg-amber-300/[0.06] text-amber-100"
        }`}
      >
        Capability gate: {capabilitySummary}.{" "}
        {isMockOnlySafe
          ? "Mock browser execution is classified separately from broker execution."
          : isAvanzaDryRun
            ? "Avanza dry-run diagnostics are non-submitting and must remain separate from broker execution."
            : "This diagnostics item is blocked or unknown by default and must not be treated as broker execution."}
      </p>

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          Safe action steps
        </summary>
        <div className="mt-3 space-y-2">
          {diagnostics.steps.length === 0 ? (
            <p className="text-xs leading-5 text-zinc-500">
              No steps were recorded.
            </p>
          ) : (
            diagnostics.steps.map((step) => (
              <div
                className="rounded-md border border-white/10 bg-black/20 p-2 text-xs leading-5 text-zinc-400"
                key={step.actionId}
              >
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-teal-100">
                    {step.status}
                  </span>
                  <span>{step.kind}</span>
                  <span>{step.targetDescription}</span>
                  {step.targetTestId && (
                    <span className="font-mono text-zinc-500">
                      {step.targetTestId}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-zinc-500">{step.message}</p>
                {(step.errors.length > 0 || step.warnings.length > 0) && (
                  <p className="mt-1 text-zinc-500">
                    Errors: {step.errors.length}; Warnings:{" "}
                    {step.warnings.length}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
          {JSON.stringify(
            {
              metadata: diagnostics.metadata,
              errors: diagnostics.errors,
              warnings: diagnostics.warnings,
              diagnostics,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </article>
  );
}

function AvanzaAgentRunsPanel({
  readResult,
  visibleRuns,
  latestTimestamp,
  message,
  onRefresh,
  onClear,
}: {
  readResult: AvanzaAgentRunStoreReadResult;
  visibleRuns: StoredAvanzaAgentRun[];
  latestTimestamp: string | null;
  message: string;
  onRefresh: () => void;
  onClear: () => void;
}) {
  const hasRuns = readResult.runs.length > 0;

  return (
    <section className="mt-6 rounded-lg border border-violet-300/15 bg-violet-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-violet-100">
            Avanza Agent Runs
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Stored locally in this browser. These are diagnostics for
            future/no-op agent runs and are not broker confirmations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-violet-300/30 hover:text-violet-100"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!readResult.storageAvailable}
            className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            Clear Avanza agent runs
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Total Runs
          </div>
          <div className="mt-1 text-zinc-200">{readResult.runs.length}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Latest Run
          </div>
          <div className="mt-1 text-zinc-200">
            {formatDateTime(latestTimestamp)}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Storage
          </div>
          <div className="mt-1 text-zinc-200">
            {readResult.storageAvailable ? "Local browser" : "Unavailable"}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Refresh reads the local no-op/future agent run store; clear removes only
        the Avanza agent runs storage key.
      </p>

      {readResult.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Avanza agent runs could not be parsed safely: {readResult.error}
        </p>
      )}

      {readResult.discardedCount > 0 && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Ignored {readResult.discardedCount} malformed Avanza agent run
          {readResult.discardedCount === 1 ? "" : "s"}.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {!hasRuns ? (
          <div className="rounded-md border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-500">
            No local Avanza agent runs are stored in this browser yet.
          </div>
        ) : (
          visibleRuns.map((run) => (
            <AvanzaAgentRunRow key={run.runId} run={run} />
          ))
        )}
      </div>
    </section>
  );
}

function getAvanzaAgentRunMetadataString(
  run: StoredAvanzaAgentRun,
  key: string,
): string | undefined {
  const value = run.metadata?.[key];

  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function AvanzaAgentRunRow({ run }: { run: StoredAvanzaAgentRun }) {
  const selectedTransport = getAvanzaAgentRunMetadataString(
    run,
    "bridge_factory_selected_transport",
  );
  const resolvedTransport = getAvanzaAgentRunMetadataString(
    run,
    "bridge_factory_resolved_transport",
  );

  return (
    <article className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-violet-100">
              {run.resultStatus}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              {run.brokerResultPresent ? "Broker result present" : "No broker result"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {run.resultError ??
              "Local Avanza agent run diagnostic stored without broker confirmation."}
          </p>
        </div>
        <time className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {formatDateTime(run.createdAt)}
        </time>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <AuditDetail label="Broker" value={run.broker} />
        <AuditDetail label="Mode" value={run.mode} />
        <AuditDetail label="Action" value={run.action} />
        <AuditDetail label="Ticker" value={run.ticker} />
        <AuditDetail
          label="Quantity"
          value={formatExecutionRecordNumber(run.quantity)}
        />
        <AuditDetail
          label="Request"
          value={shortExecutionAuditId(run.requestId)}
        />
        <AuditDetail label="Intent" value={shortExecutionAuditId(run.intentId)} />
        <AuditDetail
          label="Position"
          value={shortExecutionAuditId(run.positionId)}
        />
        <AuditDetail
          label="Recommendation"
          value={shortExecutionAuditId(run.recommendationId)}
        />
        <AuditDetail label="Runner" value={run.runnerName} />
        <AuditDetail
          label="Progress Events"
          value={run.progressEventCount}
        />
        <AuditDetail
          label="Broker Result"
          value={run.brokerResultPresent ? "Present" : "Absent"}
        />
        <AuditDetail
          label="Selected Bridge"
          value={selectedTransport ?? "—"}
        />
        <AuditDetail
          label="Resolved Bridge"
          value={resolvedTransport ?? "—"}
        />
      </div>

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          Agent run details
        </summary>
        <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2">
          <AuditDetail
            label="Progress Types"
            value={
              run.progressEventTypes.length > 0
                ? run.progressEventTypes.join(", ")
                : "—"
            }
          />
          <AuditDetail label="Raw Summary" value={run.rawSummary} />
          <AuditDetail label="Run" value={shortExecutionAuditId(run.runId)} />
          <AuditDetail label="Runner Version" value={run.runnerVersion} />
        </div>
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
          {JSON.stringify(
            {
              request: run.request,
              result: run.result,
              metadata: run.metadata,
            },
            null,
            2,
          )}
        </pre>
      </details>
    </article>
  );
}

function DevMockBrokerResultsPanel({
  readResult,
  visibleResults,
  latestTimestamp,
  executionRecords,
  message,
  onRefresh,
  onClear,
  onCaptureComplete,
}: {
  readResult: DevMockBrokerResultStoreReadResult;
  visibleResults: StoredDevMockBrokerExecutionResult[];
  latestTimestamp: string | null;
  executionRecords: StoredExecutionRecord[];
  message: string;
  onRefresh: () => void;
  onClear: () => void;
  onCaptureComplete: () => void;
}) {
  const hasResults = readResult.results.length > 0;

  return (
    <section className="mt-6 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cyan-100">
            Dev Mock Broker Results
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Local mock results parsed from mock confirmation pages. Not real
            BrokerExecutionResult. Not broker confirmations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-cyan-300/30 hover:text-cyan-100"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!readResult.storageAvailable}
            className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            Clear dev mock results
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Total Results
          </div>
          <div className="mt-1 text-zinc-200">{readResult.results.length}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Latest Result
          </div>
          <div className="mt-1 text-zinc-200">
            {formatDateTime(latestTimestamp)}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Storage
          </div>
          <div className="mt-1 text-zinc-200">
            {readResult.storageAvailable ? "Local browser" : "Unavailable"}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Refresh reads only the dev mock broker result key; clear removes only
        that mock diagnostics key and does not affect execution records.
      </p>

      {readResult.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Dev mock broker results could not be parsed safely: {readResult.error}
        </p>
      )}

      {readResult.discardedCount > 0 && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Ignored {readResult.discardedCount} malformed dev mock broker result
          {readResult.discardedCount === 1 ? "" : "s"}.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {!hasResults ? (
          <div className="rounded-md border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-500">
            No local dev mock broker results are stored in this browser yet.
          </div>
        ) : (
          visibleResults.map((result) => (
            <DevMockBrokerResultRow
              key={`${result.createdAt}_${result.requestId ?? result.orderId ?? result.ticker}`}
              result={result}
              executionRecords={executionRecords}
              onCaptureComplete={onCaptureComplete}
            />
          ))
        )}
      </div>
    </section>
  );
}

function DevMockBrokerResultRow({
  result,
  executionRecords,
  onCaptureComplete,
}: {
  result: StoredDevMockBrokerExecutionResult;
  executionRecords: StoredExecutionRecord[];
  onCaptureComplete: () => void;
}) {
  const [captureResult, setCaptureResult] =
    useState<DevMockCaptureUiResult | null>(null);
  const [serverCaptureStubResult, setServerCaptureStubResult] =
    useState<DevMockServerCaptureStubUiResult | null>(null);
  const [serverCaptureStubPending, setServerCaptureStubPending] =
    useState(false);
  const brokerResultPreview =
    convertDevMockBrokerResultToBrokerExecutionResult(result);
  const duplicateKey = buildDevMockCaptureDuplicateKey(result);
  const duplicateKeyCertain = isDevMockCaptureDuplicateKeyCertain(result);
  const existingCaptureRecords = useMemo(
    () =>
      findLocalExecutionRecordsForDevMockCapture(result, executionRecords),
    [executionRecords, result],
  );
  const hasExistingCertainCapture =
    duplicateKeyCertain && existingCaptureRecords.length > 0;
  const captureBlocked = hasExistingCertainCapture || captureResult?.ok === true;

  function captureMockResultLocally() {
    if (hasExistingCertainCapture) {
      setCaptureResult({
        ok: false,
        message: "This mock result already has a local capture record.",
        recordId: existingCaptureRecords[0]?.recordId,
        captureStatus: existingCaptureRecords[0]?.captureStatus,
        brokerStatus: existingCaptureRecords[0]?.brokerStatus,
        errors: [],
        warnings: [
          "Duplicate guard checks localStorage only. No Supabase upsert or broker order dedupe was performed.",
        ],
      });
      return;
    }

    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        "Capture this dev mock result as another local diagnostic execution record? This does not update trades, Supabase, History, or Statistics.",
      );

    if (!confirmed) {
      return;
    }

    const createdAt = new Date().toISOString();
    const conversion = convertDevMockBrokerResultToBrokerExecutionResult(
      result,
      {
        convertedAt: createdAt,
        mode: DEFAULT_EXECUTION_MODE,
      },
    );
    const intent = buildDevMockCaptureIntent(result, createdAt);
    const warnings = [...conversion.warnings];
    const errors = [...conversion.errors];

    if (!conversion.ok || !conversion.brokerResult) {
      setCaptureResult({
        ok: false,
        message: "Dev mock capture was not created because conversion failed.",
        errors,
        warnings,
      });
      return;
    }

    if (!intent) {
      setCaptureResult({
        ok: false,
        message: "Dev mock capture was not created because intent data is incomplete.",
        errors: [
          ...errors,
          "Dev mock capture intent requires buy/sell action, ticker, and positive quantity.",
        ],
        warnings,
      });
      return;
    }

    const capture = buildTureExecutionRecord(
      intent,
      conversion.brokerResult,
      {
        createdAt,
        recordId: [
          "dev_mock_capture",
          sanitizeDevMockCaptureIdPart(result.requestId),
          sanitizeDevMockCaptureIdPart(result.orderId),
          sanitizeDevMockCaptureIdPart(createdAt),
        ].join("_"),
      },
    );
    const captureErrors = [
      ...capture.intentErrors,
      ...capture.resultErrors,
      ...capture.mismatchReasons,
    ];
    const saved = appendExecutionRecord({
      ...capture.record,
      reason: `DEV MOCK CAPTURE - local diagnostics only. Not a real Avanza execution. ${capture.reason}`,
    });
    const auditSaved = appendExecutionAuditEvent(
      createExecutionAuditEvent({
        type: "dev_mock_broker_capture_stub",
        createdAt,
        intentId: capture.record.intentId,
        recommendationId: capture.record.recommendationId,
        positionId: capture.record.positionId,
        ticker: capture.record.ticker,
        action: capture.record.action,
        mode: capture.record.mode,
        triggerType: intent.trigger_type,
        broker: "avanza",
        brokerStatus: capture.record.brokerStatus,
        message:
          "DEV MOCK CAPTURE - local TureExecutionRecord created from mock result. Not real broker execution. No Supabase/trade update.",
        metadata: {
          local_diagnostics_only: true,
          not_real_broker_execution: true,
          no_supabase_write: true,
          no_trade_mutation: true,
          no_history_statistics_update: true,
          mock_result_source: result.source,
          mock_result_status: result.status,
          mock_order_id: result.orderId ?? null,
          mock_request_id: result.requestId ?? null,
          duplicate_key: duplicateKey,
          capture_status: capture.captureStatus,
          record_id: capture.record.recordId,
          append_record_ok: saved,
        },
      }),
    );

    setCaptureResult({
      ok: saved,
      message: saved
        ? "DEV MOCK CAPTURE - local execution record created. Not real broker execution."
        : "Dev mock capture record could not be stored locally.",
      recordId: capture.record.recordId,
      captureStatus: capture.captureStatus,
      brokerStatus: capture.record.brokerStatus,
      errors: saved ? captureErrors : [...captureErrors, "Local record append failed."],
      warnings: [
        ...warnings,
        auditSaved
          ? "Local audit event appended."
          : "Local audit event could not be appended.",
        "This may create another local diagnostic record if clicked again.",
      ],
    });
    onCaptureComplete();
  }

  async function testServerCaptureStub() {
    const createdAt = new Date().toISOString();
    const conversion = convertDevMockBrokerResultToBrokerExecutionResult(
      result,
      {
        convertedAt: createdAt,
        mode: DEFAULT_EXECUTION_MODE,
      },
    );
    const intent = buildDevMockCaptureIntent(result, createdAt);
    const errors = [...conversion.errors];
    const warnings = [...conversion.warnings];

    if (!conversion.ok || !conversion.brokerResult) {
      setServerCaptureStubResult({
        ok: false,
        message:
          "Server capture stub test was not sent because conversion failed.",
        statusCode: null,
        completedAt: createdAt,
        errors,
        warnings,
      });
      return;
    }

    if (!intent) {
      setServerCaptureStubResult({
        ok: false,
        message:
          "Server capture stub test was not sent because intent data is incomplete.",
        statusCode: null,
        completedAt: createdAt,
        errors: [
          ...errors,
          "Server capture stub test requires buy/sell action, ticker, and positive quantity.",
        ],
        warnings,
      });
      return;
    }

    const captureRequest = buildExecutionServerCaptureRequest({
      environment: "local_dev",
      source: "mock",
      isMock: true,
      isDev: true,
      submittedAt: createdAt,
      intent,
      brokerResult: conversion.brokerResult,
      authoritySnapshot: intent.authority,
      safetyChecks: intent.authority.required_safety_checks,
      metadata: {
        path: "settings_dev_mock_broker_result_server_capture_stub",
        local_diagnostics_only: true,
        no_supabase_write_expected: true,
        no_trade_mutation_expected: true,
        no_execution_record_expected: true,
        mock_result_source: result.source,
        mock_result_status: result.status,
        mock_order_id: result.orderId ?? null,
        mock_request_id: result.requestId ?? null,
        duplicate_key: duplicateKey,
      },
    });
    const localValidation =
      validateExecutionServerCaptureRequest(captureRequest);

    if (!localValidation.ok) {
      setServerCaptureStubResult({
        ok: false,
        message:
          "Server capture stub test was not sent because local validation failed.",
        statusCode: null,
        idempotencyKey: localValidation.idempotencyKey,
        completedAt: createdAt,
        errors: localValidation.errors,
        warnings: [...warnings, ...localValidation.warnings],
      });
      return;
    }

    setServerCaptureStubPending(true);

    try {
      const postResult = await postExecutionServerCaptureRequest(captureRequest);

      setServerCaptureStubResult({
        ok: postResult.ok,
        message:
          postResult.response?.message ??
          (postResult.ok
            ? "Server capture stub accepted the request."
            : "Server capture stub request failed."),
        statusCode: postResult.statusCode,
        responseStatus: postResult.response?.status,
        idempotencyKey:
          postResult.response?.idempotencyKey ?? captureRequest.idempotencyKey,
        completedAt: postResult.completedAt,
        errors: postResult.errors,
        warnings: postResult.warnings,
      });
    } finally {
      setServerCaptureStubPending(false);
    }
  }

  return (
    <article className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
              {result.status}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
              {result.isMock ? "Mock result" : "Not mock"}
            </span>
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              Not BrokerExecutionResult
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {result.message ??
              "Dev mock broker result stored without real broker confirmation."}
          </p>
        </div>
        <time className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {formatDateTime(result.createdAt)}
        </time>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <AuditDetail label="Status" value={result.status} />
        <AuditDetail label="Ticker" value={result.ticker} />
        <AuditDetail label="Action" value={result.action} />
        <AuditDetail
          label="Quantity"
          value={formatExecutionRecordNumber(result.quantity)}
        />
        <AuditDetail
          label="Requested"
          value={formatExecutionRecordNumber(result.requestedPrice)}
        />
        <AuditDetail
          label="Executed"
          value={formatExecutionRecordNumber(result.executedPrice)}
        />
        <AuditDetail label="Order" value={result.orderId} />
        <AuditDetail
          label="Request"
          value={shortExecutionAuditId(result.requestId)}
        />
        <AuditDetail label="Intent" value={shortExecutionAuditId(result.intentId)} />
        <AuditDetail
          label="Position"
          value={shortExecutionAuditId(result.positionId)}
        />
        <AuditDetail
          label="Recommendation"
          value={shortExecutionAuditId(result.recommendationId)}
        />
        <AuditDetail label="Source" value={result.source} />
        <AuditDetail label="isMock" value={result.isMock} />
        <AuditDetail label="Errors" value={result.errors.length} />
        <AuditDetail label="Warnings" value={result.warnings.length} />
      </div>

      <div className="mt-3 rounded-md border border-emerald-300/15 bg-emerald-300/[0.045] p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100">
              Server capture route stub
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Dev-only route validation. No Supabase write. No trade update. No
              local execution record is created by this test.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void testServerCaptureStub()}
            disabled={!brokerResultPreview.ok || serverCaptureStubPending}
            className="w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            {serverCaptureStubPending
              ? "Testing capture stub"
              : "Test server capture stub"}
          </button>
        </div>
        {serverCaptureStubResult && (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-xs leading-5 text-zinc-300">
            <p className="font-semibold text-zinc-100">
              {serverCaptureStubResult.message}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <AuditDetail
                label="Stub OK"
                value={serverCaptureStubResult.ok}
              />
              <AuditDetail
                label="HTTP"
                value={serverCaptureStubResult.statusCode ?? "—"}
              />
              <AuditDetail
                label="Response"
                value={serverCaptureStubResult.responseStatus ?? "—"}
              />
              <AuditDetail
                label="Completed"
                value={formatDateTime(serverCaptureStubResult.completedAt)}
              />
            </div>
            <AuditDetail
              label="Idempotency"
              value={serverCaptureStubResult.idempotencyKey ?? "—"}
            />
            {serverCaptureStubResult.errors.length > 0 && (
              <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.08] p-3 text-rose-100">
                {serverCaptureStubResult.errors.join(" ")}
              </p>
            )}
            {serverCaptureStubResult.warnings.length > 0 && (
              <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-amber-100">
                {serverCaptureStubResult.warnings.join(" ")}
              </p>
            )}
            <p className="mt-3 text-zinc-500">
              Route stub validation only. No Supabase write, execution record,
              trade update, History update, or Statistics update was created.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 rounded-md border border-cyan-300/15 bg-cyan-300/[0.045] p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
              Local capture test
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Creates a local TureExecutionRecord from dev mock data only. Does
              not update trades or Supabase. Duplicate guard checks localStorage
              only and is not broker order dedupe.
            </p>
          </div>
          <button
            type="button"
            onClick={captureMockResultLocally}
            disabled={!brokerResultPreview.ok || captureBlocked}
            className="w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            {captureBlocked ? "Captured locally" : "Capture mock result locally"}
          </button>
        </div>
        {hasExistingCertainCapture && (
          <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.08] p-3 text-xs leading-5 text-amber-100">
            This mock result already has a local capture record. Duplicate guard
            checks localStorage only and does not write Supabase or dedupe real
            broker orders.
          </p>
        )}
        {!duplicateKeyCertain && (
          <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
            Duplicate detection has limited identity for this mock result because
            order, request, and intent ids are missing. Capture remains manual.
          </p>
        )}
        {captureResult && (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-xs leading-5 text-zinc-300">
            <p className="font-semibold text-zinc-100">{captureResult.message}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <AuditDetail label="Captured" value={captureResult.ok} />
              <AuditDetail label="Record" value={captureResult.recordId} />
              <AuditDetail
                label="Capture Status"
                value={captureResult.captureStatus}
              />
              <AuditDetail label="Broker Status" value={captureResult.brokerStatus} />
            </div>
            {captureResult.errors.length > 0 && (
              <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.08] p-3 text-rose-100">
                {captureResult.errors.join(" ")}
              </p>
            )}
            {captureResult.warnings.length > 0 && (
              <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-amber-100">
                {captureResult.warnings.join(" ")}
              </p>
            )}
            <p className="mt-3 text-zinc-500">
              View in Execution Records diagnostics. No real broker
              confirmation, Supabase write, trade update, History update, or
              Statistics update was created.
            </p>
          </div>
        )}
      </div>

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          Dev mock result details
        </summary>
        <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2">
          <AuditDetail
            label="Warnings"
            value={
              result.warnings.length > 0 ? result.warnings.join("; ") : "—"
            }
          />
          <AuditDetail
            label="Errors"
            value={result.errors.length > 0 ? result.errors.join("; ") : "—"}
          />
        </div>
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
          {JSON.stringify(
            {
              rawPayload: result.rawPayload,
              result,
            },
            null,
            2,
          )}
        </pre>
      </details>

      <details className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.04] p-3">
        <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
          BrokerExecutionResult preview
        </summary>
        <p className="mt-3 text-xs leading-5 text-amber-100">
          Preview only - not saved, not real, not TureExecutionRecord.
        </p>
        <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
          <AuditDetail label="Preview OK" value={brokerResultPreview.ok} />
          <AuditDetail label="Source" value={brokerResultPreview.source} />
          <AuditDetail
            label="Mock Conversion"
            value={brokerResultPreview.isMockConversion}
          />
          <AuditDetail
            label="Converted"
            value={formatDateTime(brokerResultPreview.convertedAt)}
          />
          <AuditDetail
            label="Broker"
            value={brokerResultPreview.brokerResult?.broker ?? "—"}
          />
          <AuditDetail
            label="Status"
            value={brokerResultPreview.brokerResult?.status ?? "—"}
          />
          <AuditDetail
            label="Ticker"
            value={brokerResultPreview.brokerResult?.ticker ?? "—"}
          />
          <AuditDetail
            label="Quantity"
            value={formatExecutionRecordNumber(
              brokerResultPreview.brokerResult?.quantity,
            )}
          />
          <AuditDetail
            label="Order"
            value={brokerResultPreview.brokerResult?.broker_order_id ?? "—"}
          />
          <AuditDetail
            label="Raw Summary"
            value={brokerResultPreview.brokerResult?.rawBrokerSummary ?? "—"}
          />
        </div>
        {brokerResultPreview.warnings.length > 0 && (
          <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
            {brokerResultPreview.warnings.join(" ")}
          </p>
        )}
        {brokerResultPreview.errors.length > 0 && (
          <p className="mt-3 rounded-md border border-rose-300/20 bg-rose-300/[0.08] p-3 text-xs leading-5 text-rose-100">
            {brokerResultPreview.errors.join(" ")}
          </p>
        )}
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
          {JSON.stringify(brokerResultPreview, null, 2)}
        </pre>
      </details>
    </article>
  );
}

function AuditDetail({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.025] p-2">
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </div>
      <div className="mt-1 break-words text-zinc-300">
        {executionAuditValue(value)}
      </div>
    </div>
  );
}

function ExecutionRecordsPanel({
  readResult,
  visibleRecords,
  latestTimestamp,
  message,
  onRefresh,
  onClear,
}: {
  readResult: ExecutionRecordStoreReadResult;
  visibleRecords: StoredExecutionRecord[];
  latestTimestamp: string | null;
  message: string;
  onRefresh: () => void;
  onClear: () => void;
}) {
  const hasRecords = readResult.records.length > 0;

  return (
    <section className="mt-6 rounded-lg border border-fuchsia-300/15 bg-fuchsia-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-fuchsia-100">
            Execution Records
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Stored locally in this browser. Stub/dev records are not proof of
            real broker execution and do not affect History, Statistics, or live
            trades.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-white/10 bg-black/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-fuchsia-300/30 hover:text-fuchsia-100"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={!readResult.storageAvailable}
            className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.035] disabled:text-zinc-600"
          >
            Clear execution records
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm leading-6 text-zinc-400 md:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Total Records
          </div>
          <div className="mt-1 text-zinc-200">{readResult.records.length}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Latest Record
          </div>
          <div className="mt-1 text-zinc-200">
            {formatDateTime(latestTimestamp)}
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Storage
          </div>
          <div className="mt-1 text-zinc-200">
            {readResult.storageAvailable ? "Local browser" : "Unavailable"}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Refresh reads the current local records store; clear removes only the
        local execution records key.
      </p>

      {readResult.error && (
        <p className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/[0.08] p-3 text-sm leading-6 text-amber-100">
          Execution records could not be parsed safely: {readResult.error}
        </p>
      )}

      {readResult.discardedCount > 0 && (
        <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
          Ignored {readResult.discardedCount} malformed execution record
          {readResult.discardedCount === 1 ? "" : "s"}.
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
          {message}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {!hasRecords ? (
          <div className="rounded-md border border-dashed border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-500">
            No local execution records are stored in this browser yet.
          </div>
        ) : (
          visibleRecords.map((record) => (
            <ExecutionRecordRow key={record.recordId} record={record} />
          ))
        )}
      </div>
    </section>
  );
}

function ExecutionRecordRow({ record }: { record: StoredExecutionRecord }) {
  const triggerType = executionRecordTriggerType(record);
  const rawBrokerSummary = executionRecordRawBrokerSummary(record);

  return (
    <article className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-fuchsia-100">
              {record.captureStatus}
            </span>
            {record.brokerStatus && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                {record.brokerStatus}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {record.reason}
          </p>
        </div>
        <time className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          {formatDateTime(record.createdAt)}
        </time>
      </div>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
        <AuditDetail label="Ticker" value={record.ticker} />
        <AuditDetail label="Action" value={record.action} />
        <AuditDetail label="Mode" value={record.mode} />
        <AuditDetail label="Trigger" value={triggerType} />
        <AuditDetail label="Quantity" value={formatExecutionRecordNumber(record.quantity)} />
        <AuditDetail
          label="Requested"
          value={formatExecutionRecordNumber(record.requestedPrice)}
        />
        <AuditDetail
          label="Executed"
          value={formatExecutionRecordNumber(record.executedPrice)}
        />
        <AuditDetail label="Order" value={record.orderId} />
        <AuditDetail label="Intent" value={shortExecutionAuditId(record.intentId)} />
        <AuditDetail
          label="Position"
          value={shortExecutionAuditId(record.positionId)}
        />
        <AuditDetail
          label="Recommendation"
          value={shortExecutionAuditId(record.recommendationId)}
        />
        <AuditDetail label="Record" value={shortExecutionAuditId(record.recordId)} />
      </div>

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          Broker result / record JSON
        </summary>
        {rawBrokerSummary && (
          <p className="mt-3 rounded-md border border-amber-300/15 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100">
            {rawBrokerSummary}
          </p>
        )}
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-zinc-400">
          {JSON.stringify(record, null, 2)}
        </pre>
      </details>
    </article>
  );
}

function RiskControlsSettingsPanel({
  settings,
  settingsJson,
  message,
  onUpdate,
  onUpdateNumber,
  onUpdateTickers,
  onSave,
  onReset,
  onCopyJson,
}: {
  settings: RiskControlsSettings;
  settingsJson: string;
  message: string;
  onUpdate: (patch: Partial<RiskControlsSettings>) => void;
  onUpdateNumber: (
    key: keyof Pick<
      RiskControlsSettings,
      | "max_risk_per_trade_amount"
      | "max_risk_per_trade_percent"
      | "account_size"
      | "default_risk_amount_per_trade"
      | "default_risk_percent_per_trade"
      | "max_position_value"
      | "max_daily_loss_amount"
      | "max_daily_loss_r"
      | "max_trades_per_day"
      | "max_open_positions"
      | "cooldown_after_loss_minutes"
    >,
    value: string,
  ) => void;
  onUpdateTickers: (
    key: "allowed_tickers" | "blocked_tickers",
    value: string,
  ) => void;
  onSave: () => void;
  onReset: () => void;
  onCopyJson: () => void;
}) {
  return (
    <section className="mt-6 rounded-lg border border-amber-300/15 bg-amber-300/[0.035] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-amber-100">
            Risk Controls
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Local Ture-layer limits for warning and strict trade creation gates.
            They do not control brokers, submit orders, or block closing trades.
          </p>
        </div>
        <SettingsToggle
          label={settings.enabled ? "Enabled" : "Disabled"}
          checked={settings.enabled}
          onChange={(checked) => onUpdate({ enabled: checked })}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SettingsField label="Mode">
          <select
            value={settings.mode}
            onChange={(event) =>
              onUpdate({ mode: event.target.value as RiskControlsMode })
            }
            className="mt-2 min-h-12 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-amber-300"
          >
            <option value="demo">Demo - warnings only</option>
            <option value="real_prep">Real prep - manual review</option>
            <option value="strict">Strict - block new trade creation</option>
          </select>
        </SettingsField>

        <SettingsField label="Default Position Size Mode">
          <select
            value={settings.default_position_size_mode}
            onChange={(event) =>
              onUpdate({
                default_position_size_mode: event.target
                  .value as RiskControlsPositionSizeMode,
              })
            }
            className="mt-2 min-h-12 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-amber-300"
          >
            <option value="manual">Manual</option>
            <option value="risk_based">Risk based</option>
          </select>
        </SettingsField>

        <SettingsField label="Position Sizing Mode">
          <select
            value={settings.position_sizing_mode}
            onChange={(event) =>
              onUpdate({
                position_sizing_mode: event.target
                  .value as RiskControlsPositionSizingMode,
              })
            }
            className="mt-2 min-h-12 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none transition focus:border-amber-300"
          >
            <option value="manual">Manual</option>
            <option value="risk_controls">Risk controls</option>
            <option value="fixed_risk_amount">Fixed risk amount</option>
            <option value="fixed_risk_percent">Fixed risk percent</option>
            <option value="max_affordable">Max affordable</option>
          </select>
        </SettingsField>

        {[
          ["Max Risk Per Trade Amount", "max_risk_per_trade_amount"],
          ["Max Risk Per Trade %", "max_risk_per_trade_percent"],
          ["Account Size", "account_size"],
          ["Default Risk Amount / Trade", "default_risk_amount_per_trade"],
          ["Default Risk % / Trade", "default_risk_percent_per_trade"],
          ["Max Position Value", "max_position_value"],
          ["Max Daily Loss Amount", "max_daily_loss_amount"],
          ["Max Daily Loss R", "max_daily_loss_r"],
          ["Max Trades Per Day", "max_trades_per_day"],
          ["Max Open Positions", "max_open_positions"],
        ].map(([label, key]) => (
          <SettingsField key={key} label={label}>
            <input
              type="number"
              min="0"
              step={key.includes("trades") || key.includes("positions") ? "1" : "0.01"}
              value={
                settings[key as keyof RiskControlsSettings] === null
                  ? ""
                  : String(settings[key as keyof RiskControlsSettings])
              }
              onChange={(event) =>
                onUpdateNumber(
                  key as Parameters<typeof onUpdateNumber>[0],
                  event.target.value,
                )
              }
              placeholder="Optional"
              className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-300"
            />
          </SettingsField>
        ))}

        <SettingsField label="Allowed Tickers">
          <input
            value={settings.allowed_tickers.join(", ")}
            onChange={(event) =>
              onUpdateTickers("allowed_tickers", event.target.value)
            }
            placeholder="Optional comma-separated list"
            className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-300"
          />
        </SettingsField>

        <SettingsField label="Blocked Tickers">
          <input
            value={settings.blocked_tickers.join(", ")}
            onChange={(event) =>
              onUpdateTickers("blocked_tickers", event.target.value)
            }
            placeholder="Optional comma-separated list"
            className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-300"
          />
        </SettingsField>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <SettingsToggle
          label="Require manual review for real mode"
          checked={settings.require_manual_review_for_real_mode}
          onChange={(checked) =>
            onUpdate({ require_manual_review_for_real_mode: checked })
          }
        />
        <SettingsToggle
          label="Block new trades after daily stop"
          checked={settings.block_new_trades_after_daily_stop}
          onChange={(checked) =>
            onUpdate({ block_new_trades_after_daily_stop: checked })
          }
        />
        <SettingsToggle
          label="Cooldown after loss"
          checked={settings.cooldown_after_loss_enabled}
          onChange={(checked) =>
            onUpdate({ cooldown_after_loss_enabled: checked })
          }
        />
        <SettingsField label="Cooldown Minutes">
          <input
            type="number"
            min="1"
            step="1"
            value={settings.cooldown_after_loss_minutes ?? ""}
            onChange={(event) =>
              onUpdateNumber("cooldown_after_loss_minutes", event.target.value)
            }
            placeholder="Optional"
            className="mt-2 min-h-12 w-full rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-300"
          />
        </SettingsField>
      </div>

      <SettingsField label="Notes">
        <textarea
          value={settings.notes ?? ""}
          onChange={(event) => onUpdate({ notes: event.target.value || null })}
          rows={3}
          className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-amber-300"
        />
      </SettingsField>

      <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-4 text-sm leading-6 text-zinc-400">
        Strict mode can block new Live Day Trade creation when limits are
        breached. Closing or selling an existing trade is never blocked by risk
        controls.
      </div>

      <div
        id="trade-risk-controls-settings-json"
        data-agent-readable="true"
        className="sr-only"
      >
        {settingsJson}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onSave}
          className="min-h-11 cursor-pointer rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-amber-100"
        >
          Save Risk Controls
        </button>
        <button
          type="button"
          onClick={onCopyJson}
          className="min-h-11 cursor-pointer rounded-full border border-amber-200/20 bg-amber-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-100/40 hover:text-white"
        >
          Copy JSON
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 cursor-pointer rounded-full border border-rose-200/20 bg-rose-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-100/40 hover:text-white"
        >
          Reset
        </button>
      </div>

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          View risk controls JSON
        </summary>
        <pre className="mt-4 max-h-80 overflow-auto rounded-md border border-white/10 bg-black/40 p-4 text-xs leading-5 text-zinc-300">
          {settingsJson}
        </pre>
      </details>

      {message && (
        <div className="mt-4 rounded-md border border-[#00db94]/20 bg-[#00db94]/10 p-3 text-sm text-emerald-100">
          {message}
        </div>
      )}
    </section>
  );
}

function SettingsToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-white/10 bg-black/25 px-4 py-3">
      <span className="text-sm text-zinc-300">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-[#00db94]"
      />
    </label>
  );
}

function BrowserAgentPrototypePlanPanel({
  plan,
  planJson,
  copyStatus,
  onCopy,
}: {
  plan: BrowserAgentPrototypePlan;
  planJson: string;
  copyStatus: string;
  onCopy: () => void;
}) {
  const currentPhase = plan.phases.find(
    (phase) => phase.phase_id === plan.current_phase_id,
  );
  const majorBlockers = plan.hard_stops.slice(0, 6);
  const visibleHumanCheckpoints = plan.human_checkpoints.slice(0, 5);
  const visibleForbiddenActions = plan.forbidden_actions.slice(0, 6);

  return (
    <section className="bg-surface-subtle rounded-lg border border-cyan-300/15 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
            Developer / Safety Spec
          </div>
          <h2 className="mt-2 font-mono text-2xl font-semibold tracking-normal text-white">
            Browser Agent Prototype Plan v2
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Read-only future-agent plan. Real broker execution stays human-only;
            no browser agent runtime, Avanza automation, credentials, or order
            submission is enabled.
          </p>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="min-h-11 cursor-pointer rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-100/40 hover:text-white"
        >
          Copy Browser Agent Plan JSON
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <PlanMetric
          label="Readiness"
          value={formatPlanValue(plan.overall_readiness_status)}
        />
        <PlanMetric
          label="Current phase"
          value={currentPhase?.title ?? plan.current_phase_label}
        />
        <PlanMetric
          label="DOM contracts"
          value={String(plan.required_dom_blocks.length)}
        />
        <PlanMetric
          label="Real broker agent"
          value={plan.can_run_real_broker_agent ? "Enabled" : "Disabled"}
        />
      </div>

      <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Next Recommended Action
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-200">
          {plan.next_recommended_action}
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-100">
          Avanza is not ready yet: {plan.why_avanza_is_not_ready_yet}
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-zinc-500">
            Local/dev mock only. This harness does not connect to Avanza.
          </p>
          <Link
            href="/mock-broker"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-100/40 hover:text-white"
          >
            Open Mock Broker Dry Run Harness
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <PlanList
          title="Major hard stops"
          items={majorBlockers.map((stop) => stop.label)}
        />
        <PlanList
          title="Human checkpoints"
          items={visibleHumanCheckpoints.map((checkpoint) => checkpoint.label)}
        />
        <PlanList
          title="Forbidden actions"
          items={visibleForbiddenActions.map((action) => action.label)}
        />
      </div>

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          View phases and required DOM blocks
        </summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Phases
            </h3>
            <div className="mt-3 space-y-3">
              {plan.phases.map((phase) => (
                <div
                  key={phase.phase_id}
                  className="rounded-md border border-white/10 bg-white/[0.025] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-mono text-xs font-semibold text-white">
                      Phase {phase.phase_number}: {phase.title}
                    </div>
                    <StatusPill status={formatPlanValue(phase.status)} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {phase.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Required DOM Blocks
            </h3>
            <div className="mt-3 max-h-96 overflow-auto rounded-md border border-white/10 bg-black/30 p-3">
              <ul className="space-y-2 text-xs leading-5 text-zinc-300">
                {plan.required_dom_blocks.map((block) => (
                  <li key={block.dom_id}>
                    <span className="font-mono text-cyan-100">
                      {block.dom_id}
                    </span>
                    <span className="text-zinc-500"> - {block.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </details>

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          View browser agent plan JSON
        </summary>
        <pre
          className="mt-4 max-h-96 overflow-auto rounded-md border border-white/10 bg-black/40 p-4 text-xs leading-5 text-zinc-300"
          suppressHydrationWarning
        >
          {planJson}
        </pre>
      </details>

      <div
        id="trade-browser-agent-prototype-plan-json"
        data-agent-readable="true"
        className="sr-only"
        suppressHydrationWarning
      >
        {planJson}
      </div>

      {copyStatus && (
        <div className="mt-4 rounded-md border border-[#00db94]/20 bg-[#00db94]/10 p-3 text-sm text-emerald-100">
          {copyStatus}
        </div>
      )}
    </section>
  );
}

function AvanzaVerificationNotesPanel({
  state,
  validation,
  notesJson,
  message,
  importJson,
  onImportJsonChange,
  onUpdateNote,
  onSave,
  onReset,
  onCopyJson,
  onImportJson,
}: {
  state: AvanzaVerificationNotesState;
  validation: AvanzaVerificationNotesValidation;
  notesJson: string;
  message: string;
  importJson: string;
  onImportJsonChange: (value: string) => void;
  onUpdateNote: (
    noteId: string,
    patch: Partial<AvanzaFieldVerificationNote>,
  ) => void;
  onSave: () => void;
  onReset: () => void;
  onCopyJson: () => void;
  onImportJson: () => void;
}) {
  const buyNotes = state.notes.filter((note) => note.side === "BUY");
  const sellNotes = state.notes.filter((note) => note.side === "SELL");

  return (
    <section className="bg-surface-subtle rounded-lg border border-violet-300/15 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-200">
            Manual Verification
          </div>
          <h2 className="mt-2 font-mono text-2xl font-semibold tracking-normal text-white">
            Manual Avanza Field Verification Notes
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Local notes for real Avanza labels, steps, selector notes, and
            screenshot references. These notes now feed runtime Avanza Field
            Verification Reports for prepare-only readiness; they do not control
            Avanza and never permit order submission.
          </p>
        </div>

        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${verificationNotesStatusTone(
            validation.status,
          )}`}
        >
          {formatPlanValue(validation.status)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <PlanMetric
          label="Verified critical"
          value={String(validation.summary.verified_critical_fields_count)}
        />
        <PlanMetric
          label="Missing critical"
          value={String(validation.summary.missing_critical_fields_count)}
        />
        <PlanMetric
          label="Mismatches"
          value={String(validation.summary.mismatch_count)}
        />
        <PlanMetric
          label="Can submit order"
          value={validation.summary.can_future_agent_submit_order ? "Yes" : "No"}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <PlanMetric
          label="Future buy prepare"
          value={
            validation.summary.can_future_agent_prepare_buy_form
              ? "Ready"
              : "Blocked"
          }
        />
        <PlanMetric
          label="Future sell prepare"
          value={
            validation.summary.can_future_agent_prepare_sell_form
              ? "Ready"
              : "Blocked"
          }
        />
      </div>

      <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/[0.055] p-4 text-sm leading-6 text-amber-100">
        Verified final KÖP/SÄLJ button notes only document the stop boundary.
        They do not mean an agent may click them. Final Avanza confirmation
        remains human-only.
      </div>

      <div className="mt-4 rounded-md border border-cyan-300/15 bg-cyan-300/[0.045] p-4 text-sm leading-6 text-cyan-100/90">
        Runtime reports can use verified BUY/SELL critical notes to show
        prepare-only readiness. Order submission remains impossible in Ture and
        can_future_agent_submit_order stays false.
      </div>

      {(validation.blockers.length > 0 || validation.warnings.length > 0) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <PlanList
            title="Blockers"
            items={validation.blockers.map((blocker) => blocker.message)}
          />
          <PlanList
            title="Warnings"
            items={validation.warnings.map((warning) => warning.message)}
          />
        </div>
      )}

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4" open>
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          BUY verification notes
        </summary>
        <AvanzaVerificationNotesTable
          notes={buyNotes}
          onUpdateNote={onUpdateNote}
        />
      </details>

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          SELL verification notes
        </summary>
        <AvanzaVerificationNotesTable
          notes={sellNotes}
          onUpdateNote={onUpdateNote}
        />
      </details>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onSave}
          className="min-h-11 cursor-pointer rounded-full bg-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-violet-100"
        >
          Save Notes Locally
        </button>
        <button
          type="button"
          onClick={onCopyJson}
          className="min-h-11 cursor-pointer rounded-full border border-violet-200/20 bg-violet-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-violet-100 transition hover:border-violet-100/40 hover:text-white"
        >
          Export / Copy JSON
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 cursor-pointer rounded-full border border-rose-200/20 bg-rose-200/[0.06] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-100/40 hover:text-white"
        >
          Reset Defaults
        </button>
      </div>

      <details className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
          Import / export verification notes JSON
        </summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Import JSON
              </span>
              <textarea
                value={importJson}
                onChange={(event) => onImportJsonChange(event.target.value)}
                rows={10}
                className="mt-2 w-full rounded-md border border-white/10 bg-black/35 p-3 font-mono text-xs leading-5 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-200/50"
                placeholder="Paste exported Avanza verification notes JSON..."
              />
            </label>
            <button
              type="button"
              onClick={onImportJson}
              className="mt-3 min-h-10 cursor-pointer rounded-md border border-violet-300/30 bg-violet-300/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100 transition hover:border-violet-200/70"
            >
              Import JSON
            </button>
          </div>
          <div>
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Current JSON
            </div>
            <pre
              className="mt-2 max-h-80 overflow-auto rounded-md border border-white/10 bg-black/40 p-4 text-xs leading-5 text-zinc-300"
              suppressHydrationWarning
            >
              {notesJson}
            </pre>
          </div>
        </div>
      </details>

      <div className="mt-4 rounded-md border border-white/10 bg-black/25 p-4">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Storage
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Saved locally under{" "}
          <span className="font-mono text-zinc-200">
            {AVANZA_VERIFICATION_NOTES_STORAGE_KEY}
          </span>
          . No DB persistence is used.
        </p>
      </div>

      {message && (
        <div className="mt-4 rounded-md border border-[#00db94]/20 bg-[#00db94]/10 p-3 text-sm text-emerald-100">
          {message}
        </div>
      )}
    </section>
  );
}

function AvanzaVerificationNotesTable({
  notes,
  onUpdateNote,
}: {
  notes: AvanzaFieldVerificationNote[];
  onUpdateNote: (
    noteId: string,
    patch: Partial<AvanzaFieldVerificationNote>,
  ) => void;
}) {
  return (
    <div className="mt-4 space-y-4">
      {notes.map((note) => (
        <div
          key={note.note_id}
          className="rounded-md border border-white/10 bg-black/25 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-sm font-semibold text-white">
                {note.display_label}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {note.expected_generic_label}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${verificationCriticalityTone(
                note.criticality,
              )}`}
            >
              {formatPlanValue(note.criticality)}
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Status
              </span>
              <select
                value={note.status}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    status: event.target.value as AvanzaVerificationNoteStatus,
                  })
                }
                className="mt-2 min-h-11 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-violet-200/50"
              >
                <option value="unverified">Unverified</option>
                <option value="verified">Verified</option>
                <option value="mismatch">Mismatch</option>
                <option value="needs_review">Needs review</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Criticality
              </span>
              <select
                value={note.criticality}
                disabled={note.criticality === "forbidden_final_confirmation"}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    criticality: event.target.value as AvanzaVerificationCriticality,
                  })
                }
                className="mt-2 min-h-11 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-violet-200/50 disabled:cursor-not-allowed disabled:text-zinc-500"
              >
                <option value="critical">Critical</option>
                <option value="important">Important</option>
                <option value="optional">Optional</option>
                <option value="forbidden_final_confirmation">
                  Forbidden final confirmation
                </option>
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Actual Avanza label
              </span>
              <input
                value={note.actual_avanza_label}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    actual_avanza_label: event.target.value,
                  })
                }
                className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-violet-200/50"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Selector / data-testid note
              </span>
              <input
                value={note.selector_or_data_testid_note}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    selector_or_data_testid_note: event.target.value,
                  })
                }
                placeholder="Manual note only; do not invent selectors"
                className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-200/50"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Source
              </span>
              <select
                value={note.source}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    source: event.target.value as AvanzaVerificationNoteSource,
                  })
                }
                className="mt-2 min-h-11 w-full cursor-pointer rounded-md border border-white/10 bg-black/30 px-3 font-mono text-sm text-white outline-none focus:border-violet-200/50"
              >
                <option value="user_note">User note</option>
                <option value="manual_observation">Manual observation</option>
                <option value="screenshot_reference">Screenshot reference</option>
                <option value="dom_inspection">DOM inspection note</option>
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Screenshot reference
              </span>
              <input
                value={note.screenshot_reference}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    screenshot_reference: event.target.value,
                  })
                }
                className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-violet-200/50"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Verified date
              </span>
              <input
                value={note.verified_at}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    verified_at: event.target.value,
                  })
                }
                placeholder="YYYY-MM-DD"
                className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-200/50"
              />
            </label>

            <label className="block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Verified by
              </span>
              <input
                value={note.verified_by}
                onChange={(event) =>
                  onUpdateNote(note.note_id, {
                    verified_by: event.target.value,
                  })
                }
                className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-violet-200/50"
              />
            </label>
          </div>

          <label className="mt-3 block">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Notes
            </span>
            <textarea
              value={note.notes}
              onChange={(event) =>
                onUpdateNote(note.note_id, { notes: event.target.value })
              }
              rows={2}
              className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-violet-200/50"
            />
          </label>

          {note.criticality === "forbidden_final_confirmation" && (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm leading-6 text-amber-100">
              Verification here only documents the final button. It never gives
              an agent permission to click KÖP/SÄLJ.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function verificationNotesStatusTone(
  status: AvanzaVerificationNotesValidation["status"],
) {
  if (status === "ready") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "needs_review") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "blocked") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function verificationCriticalityTone(criticality: AvanzaVerificationCriticality) {
  if (criticality === "critical") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (criticality === "forbidden_final_confirmation") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (criticality === "important") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  return "border-white/10 bg-white/[0.035] text-zinc-400";
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </div>
      <div className="mt-2 break-words font-mono text-sm text-white">
        {value || "Not available"}
      </div>
    </div>
  );
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-4">
      <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
        {items.length > 0 ? (
          items.map((item) => <li key={item}>{item}</li>)
        ) : (
          <li>Not available</li>
        )}
      </ul>
    </div>
  );
}

function formatPlanValue(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function AutomationStatusPanel({
  automationRuns,
  isLoading,
  message,
  marketStatus,
  marketStatusMessage,
  onRefresh,
}: {
  automationRuns: ScheduledScanRun[];
  isLoading: boolean;
  message: string;
  marketStatus: MarketStatus | null;
  marketStatusMessage: string;
  onRefresh: () => void;
}) {
  const lastAutomationRun = automationRuns[0] ?? null;
  const currentWindow = getIntradayScanWindow(new Date());

  return (
    <section className="bg-surface-subtle rounded-lg border border-white/10 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Automation
          </div>
          <h2 className="mt-2 font-mono text-2xl font-semibold tracking-normal text-white">
            Automation Status
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Scheduled scans are triggered by Netlify every 15 minutes on
            weekdays. Trade checks the market calendar and only generates day
            trade recommendations inside active intraday windows.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="min-h-11 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
        >
          {isLoading ? "Refreshing..." : "Refresh Status"}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <MarketCalendarStatusCard
          marketStatus={marketStatus}
          isLoading={isLoading}
          message={marketStatusMessage}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-black/25 p-4">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Current intraday window
            </div>
            <div className="mt-2 font-mono text-sm text-white">
              {getIntradayScanWindowLabel(currentWindow)}
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-black/25 p-4">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Active day trading hours
            </div>
            <div className="mt-2 font-mono text-sm text-white">
              09:30&ndash;16:00 New York time
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="mt-5 rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="mt-5 rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-6 text-center">
          <h3 className="font-mono text-base font-semibold text-white">
            Loading automation status
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Trade is reading recent scheduled_scan_runs rows.
          </p>
        </div>
      ) : automationRuns.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-6 text-center text-sm leading-6 text-zinc-400">
          No automated scans have run yet.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <AutomationInfoCard
            title="Current Window"
            details={[
              ["Window", getIntradayScanWindowLabel(currentWindow)],
              ["Market", getMarketStatusLabel(marketStatus)],
            ]}
          />
          <AutomationInfoCard
            title="Last Scan"
            details={[
              ["Window", getScanWindowFromRunMessage(lastAutomationRun?.message ?? null)],
              ["Legacy session", formatSessionType(lastAutomationRun?.session_type ?? null)],
            ]}
          />
          <AutomationRunCard
            title="Latest Result"
            run={lastAutomationRun}
          />
        </div>
      )}
    </section>
  );
}

function AutomationInfoCard({
  title,
  details,
}: {
  title: string;
  details: [string, string][];
}) {
  return (
    <article className="rounded-md border border-white/10 bg-black/25 p-4">
      <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {title}
      </h3>
      <dl className="mt-4 space-y-3 text-sm">
        {details.map(([label, value]) => (
          <AutomationDetail key={label} label={label} value={value} />
        ))}
      </dl>
    </article>
  );
}

function AutomationRunCard({
  title,
  run,
}: {
  title: string;
  run: ScheduledScanRun | null;
}) {
  return (
    <article className="rounded-md border border-white/10 bg-black/25 p-4">
      <div className="flex min-h-8 items-start justify-between gap-3">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {title}
        </h3>
        {run && <StatusPill status={run.status} />}
      </div>

      {run ? (
        <dl className="mt-4 space-y-3 text-sm">
          <AutomationDetail
            label="Legacy session"
            value={formatSessionType(run.session_type)}
          />
          <AutomationDetail
            label="Scan window"
            value={getScanWindowFromRunMessage(run.message)}
          />
          <AutomationDetail
            label="Recommendations created"
            value={String(run.recommendations_created ?? 0)}
          />
          <AutomationDetail label="Status" value={run.status ?? "Unknown"} />
          <AutomationDetail
            label="Message"
            value={run.message?.trim() || "No message recorded"}
          />
          <AutomationDetail
            label="Created at"
            value={formatDateTime(run.created_at)}
          />
        </dl>
      ) : (
        <p className="mt-4 text-sm leading-6 text-zinc-500">
          No run has been recorded for this scan type yet.
        </p>
      )}
    </article>
  );
}

function getMarketStatusLabel(marketStatus: MarketStatus | null) {
  if (!marketStatus) {
    return "Unknown";
  }

  if (marketStatus.dayType === "early_close") {
    return "Early close";
  }

  if (marketStatus.dayType === "unknown") {
    return "Unknown";
  }

  return marketStatus.isOpenDay ? "Open" : "Closed";
}

function getMarketStatusBadgeStatus(
  marketStatus: MarketStatus | null,
  isLoading: boolean,
) {
  if (isLoading) {
    return "Loading";
  }

  if (!marketStatus) {
    return "Unknown";
  }

  if (marketStatus.dayType === "unknown") {
    return "Provider unavailable";
  }

  return marketStatus.isOpenDay ? "completed" : "Closed";
}

function MarketCalendarStatusCard({
  marketStatus,
  isLoading,
  message,
}: {
  marketStatus: MarketStatus | null;
  isLoading: boolean;
  message: string;
}) {
  const statusValue = isLoading
    ? "Loading"
    : getMarketStatusLabel(marketStatus);
  const providerValue = isLoading
    ? "Loading"
    : marketStatus?.provider ?? "Unavailable";
  const cacheValue = isLoading
    ? "Loading"
    : marketStatus
      ? marketStatus.fromCache
        ? "Fresh cache"
        : "Live provider or fallback"
      : "Unavailable";
  const reasonValue = isLoading
    ? "Loading market calendar status..."
    : marketStatus?.reason || message || "No market calendar result yet";

  return (
    <div className="rounded-md border border-white/10 bg-black/25 p-4">
      <div className="flex min-h-8 items-start justify-between gap-3">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Market Calendar
        </div>
        <StatusPill status={getMarketStatusBadgeStatus(marketStatus, isLoading)} />
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <AutomationDetail label="Status" value={statusValue} />
        <AutomationDetail label="Provider" value={providerValue} />
        <AutomationDetail label="Cache" value={cacheValue} />
        <AutomationDetail label="Reason" value={reasonValue} />
      </dl>
    </div>
  );
}

function AutomationDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </dt>
      <dd className="mt-1 break-words text-zinc-200">{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const isCompleted = status === "completed";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${
        isCompleted
          ? "border-[#00db94]/30 bg-[#00db94]/10 text-emerald-100"
          : "border-amber-300/30 bg-amber-300/10 text-amber-100"
      }`}
    >
      {status ?? "Unknown"}
    </span>
  );
}
