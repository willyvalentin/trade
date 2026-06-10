import type {
  AvanzaAgentProgressEvent,
  AvanzaAgentRequest,
  AvanzaAgentRequestVersion,
  AvanzaAgentResult,
  AvanzaAgentResultStatus,
} from "@/lib/avanza-agent-adapter";
import type { AvanzaExecutionHandoffStatus } from "@/lib/avanza-execution-handoff";
import type { ExecutionAction, ExecutionMode } from "@/lib/execution";
import type { AvanzaAgentRunner } from "@/lib/avanza-agent-runner";

export type StoredAvanzaAgentRunRequestSummary = {
  requestId: string;
  version: AvanzaAgentRequestVersion;
  createdAt: string;
  requireManualFinalConfirmation: boolean;
  allowAutomaticFinalSubmit: boolean;
  handoffStatus?: AvanzaExecutionHandoffStatus;
};

export type StoredAvanzaAgentRunResultSummary = {
  requestId: string;
  createdAt: string;
  status: AvanzaAgentResultStatus;
  error?: string;
  rawSummary?: string;
  brokerResultPresent: boolean;
  progressEvents: Array<{
    eventId: string;
    createdAt: string;
    type: string;
    message: string;
  }>;
};

export type StoredAvanzaAgentRun = {
  runId: string;
  createdAt: string;
  updatedAt: string;
  requestId: string;
  requestVersion: AvanzaAgentRequestVersion;
  runnerId?: string;
  runnerName?: string;
  runnerVersion?: string;
  broker: "avanza";
  mode: ExecutionMode | null;
  action: ExecutionAction | null;
  ticker: string | null;
  quantity: number | null;
  intentId?: string;
  positionId?: string;
  recommendationId?: string;
  handoffStatus?: AvanzaExecutionHandoffStatus;
  requireManualFinalConfirmation: boolean;
  allowAutomaticFinalSubmit: boolean;
  resultStatus: AvanzaAgentResultStatus;
  resultError?: string;
  brokerResultPresent: boolean;
  progressEventCount: number;
  progressEventTypes: string[];
  rawSummary?: string;
  request?: StoredAvanzaAgentRunRequestSummary;
  result?: StoredAvanzaAgentRunResultSummary;
  metadata?: Record<string, unknown>;
};

export type AvanzaAgentRunStoreReadResult = {
  runs: StoredAvanzaAgentRun[];
  discardedCount: number;
  storageAvailable: boolean;
  error: string | null;
};

export type CreateStoredAvanzaAgentRunInput = {
  request: AvanzaAgentRequest;
  result: AvanzaAgentResult;
  runner?: Pick<
    AvanzaAgentRunner,
    "runnerId" | "name" | "version" | "supportsRealBrokerAutomation"
  > | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  runId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export const AVANZA_AGENT_RUN_STORE_KEY = "ture_avanza_agent_runs_v1";
export const MAX_STORED_AVANZA_AGENT_RUNS = 1000;

const resultStatuses: AvanzaAgentResultStatus[] = [
  "not_started",
  "in_progress",
  "waiting_for_manual_confirmation",
  "submitted",
  "filled",
  "partially_filled",
  "rejected",
  "cancelled",
  "failed",
  "unknown",
];

const handoffStatuses: AvanzaExecutionHandoffStatus[] = [
  "ready",
  "blocked",
  "invalid_intent",
];

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value.trim().replace(",", "."));

  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTimestamp(value: unknown): string | null {
  const timestamp = optionalString(value);

  return timestamp && Number.isFinite(Date.parse(timestamp)) ? timestamp : null;
}

function normalizeTimestampWithFallback(value: unknown): string {
  return normalizeTimestamp(value) ?? new Date().toISOString();
}

function normalizeMode(value: unknown): ExecutionMode | null {
  return value === "semi_automatic" || value === "automatic" ? value : null;
}

function normalizeAction(value: unknown): ExecutionAction | null {
  return value === "buy" || value === "sell" ? value : null;
}

function normalizeResultStatus(value: unknown): AvanzaAgentResultStatus | null {
  return resultStatuses.includes(value as AvanzaAgentResultStatus)
    ? (value as AvanzaAgentResultStatus)
    : null;
}

function normalizeHandoffStatus(
  value: unknown,
): AvanzaExecutionHandoffStatus | undefined {
  return handoffStatuses.includes(value as AvanzaExecutionHandoffStatus)
    ? (value as AvanzaExecutionHandoffStatus)
    : undefined;
}

function optionalObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : undefined;
}

function sanitizeIdPart(value: string | null | undefined): string {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function createRunId(
  requestId: string,
  createdAt: string,
  random = Math.random(),
): string {
  const suffix = Math.floor(Math.abs(random) * 0xffffff)
    .toString(36)
    .padStart(4, "0")
    .slice(0, 6);

  return [
    "avanza_agent_run",
    sanitizeIdPart(requestId),
    sanitizeIdPart(createdAt),
    suffix,
  ].join("_");
}

function requestTradingPackage(request: AvanzaAgentRequest) {
  return request.handoff?.intent?.trading_package ?? null;
}

function progressEventTypes(events: readonly AvanzaAgentProgressEvent[]) {
  return Array.from(new Set(events.map((event) => event.type)));
}

function compactProgressEvents(events: readonly AvanzaAgentProgressEvent[]) {
  return events.slice(-50).map((event) => ({
    eventId: event.eventId,
    createdAt: event.createdAt,
    type: event.type,
    message: event.message,
  }));
}

function compactRequestSummary(
  request: AvanzaAgentRequest,
): StoredAvanzaAgentRunRequestSummary {
  return {
    requestId: request.requestId,
    version: request.version,
    createdAt: request.createdAt,
    requireManualFinalConfirmation: request.requireManualFinalConfirmation,
    allowAutomaticFinalSubmit: request.allowAutomaticFinalSubmit,
    ...(request.handoff?.status
      ? { handoffStatus: request.handoff.status }
      : {}),
  };
}

function compactResultSummary(
  result: AvanzaAgentResult,
): StoredAvanzaAgentRunResultSummary {
  return {
    requestId: result.requestId,
    createdAt: result.createdAt,
    status: result.status,
    brokerResultPresent: Boolean(result.brokerResult),
    progressEvents: compactProgressEvents(result.progressEvents),
    ...(result.error ? { error: result.error } : {}),
    ...(result.rawSummary ? { rawSummary: result.rawSummary } : {}),
  };
}

export function createStoredAvanzaAgentRun(
  input: CreateStoredAvanzaAgentRunInput,
): StoredAvanzaAgentRun {
  const createdAt = normalizeTimestampWithFallback(input.createdAt);
  const updatedAt = normalizeTimestampWithFallback(
    input.updatedAt ?? input.result.createdAt ?? createdAt,
  );
  const request = input.request;
  const result = input.result;
  const tradingPackage = requestTradingPackage(request);
  const intent = request.handoff?.intent ?? null;
  const runId =
    optionalString(input.runId) ?? createRunId(request.requestId, createdAt);

  return {
    runId,
    createdAt,
    updatedAt,
    requestId: request.requestId,
    requestVersion: request.version,
    ...(input.runner?.runnerId ? { runnerId: input.runner.runnerId } : {}),
    ...(input.runner?.name ? { runnerName: input.runner.name } : {}),
    ...(input.runner?.version ? { runnerVersion: input.runner.version } : {}),
    broker: "avanza",
    mode: request.mode,
    action: request.action,
    ticker: tradingPackage?.ticker ?? null,
    quantity:
      typeof tradingPackage?.quantity === "number" &&
      Number.isFinite(tradingPackage.quantity)
        ? tradingPackage.quantity
        : null,
    ...(intent?.intent_id ? { intentId: intent.intent_id } : {}),
    ...(tradingPackage?.live_position_id
      ? { positionId: tradingPackage.live_position_id }
      : {}),
    ...(tradingPackage?.recommendation_id
      ? { recommendationId: tradingPackage.recommendation_id }
      : {}),
    ...(request.handoff?.status
      ? { handoffStatus: request.handoff.status }
      : {}),
    requireManualFinalConfirmation: request.requireManualFinalConfirmation,
    allowAutomaticFinalSubmit: request.allowAutomaticFinalSubmit,
    resultStatus: result.status,
    ...(result.error ? { resultError: result.error } : {}),
    brokerResultPresent: Boolean(result.brokerResult),
    progressEventCount: result.progressEvents.length,
    progressEventTypes: progressEventTypes(result.progressEvents),
    ...(result.rawSummary ? { rawSummary: result.rawSummary } : {}),
    request: compactRequestSummary(request),
    result: compactResultSummary(result),
    metadata: {
      local_diagnostics_only: true,
      not_broker_confirmation: true,
      no_broker_order_created: true,
      ...(input.runner
        ? {
            runner_supports_real_broker_automation:
              input.runner.supportsRealBrokerAutomation,
          }
        : {}),
      ...(input.metadata ?? {}),
    },
  };
}

function normalizeProgressEventTypes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(optionalString)
    .filter((item): item is string => Boolean(item));
}

function normalizeRequestSummary(
  value: unknown,
): StoredAvanzaAgentRunRequestSummary | undefined {
  const object = optionalObject(value);

  if (!object) {
    return undefined;
  }

  const requestId = optionalString(object.requestId);
  const version = object.version;
  const createdAt = normalizeTimestamp(object.createdAt);
  const requireManualFinalConfirmation = optionalBoolean(
    object.requireManualFinalConfirmation,
  );
  const allowAutomaticFinalSubmit = optionalBoolean(
    object.allowAutomaticFinalSubmit,
  );

  if (
    !requestId ||
    version !== "avanza_agent_request_v1" ||
    !createdAt ||
    requireManualFinalConfirmation === null ||
    allowAutomaticFinalSubmit === null
  ) {
    return undefined;
  }

  return {
    requestId,
    version,
    createdAt,
    requireManualFinalConfirmation,
    allowAutomaticFinalSubmit,
    ...(normalizeHandoffStatus(object.handoffStatus)
      ? { handoffStatus: normalizeHandoffStatus(object.handoffStatus) }
      : {}),
  };
}

function normalizeResultSummary(
  value: unknown,
): StoredAvanzaAgentRunResultSummary | undefined {
  const object = optionalObject(value);

  if (!object) {
    return undefined;
  }

  const requestId = optionalString(object.requestId);
  const createdAt = normalizeTimestamp(object.createdAt);
  const status = normalizeResultStatus(object.status);
  const progressEvents = Array.isArray(object.progressEvents)
    ? object.progressEvents
        .map((event) => {
          const eventObject = optionalObject(event);
          const eventId = optionalString(eventObject?.eventId);
          const eventCreatedAt = normalizeTimestamp(eventObject?.createdAt);
          const type = optionalString(eventObject?.type);
          const message = optionalString(eventObject?.message);

          return eventId && eventCreatedAt && type && message
            ? {
                eventId,
                createdAt: eventCreatedAt,
                type,
                message,
              }
            : null;
        })
        .filter(
          (
            event,
          ): event is StoredAvanzaAgentRunResultSummary["progressEvents"][number] =>
            Boolean(event),
        )
    : [];

  if (!requestId || !createdAt || !status) {
    return undefined;
  }

  const error = optionalString(object.error);
  const rawSummary = optionalString(object.rawSummary);

  return {
    requestId,
    createdAt,
    status,
    brokerResultPresent: Boolean(object.brokerResultPresent),
    progressEvents,
    ...(error ? { error } : {}),
    ...(rawSummary ? { rawSummary } : {}),
  };
}

function normalizeStoredAvanzaAgentRun(
  value: unknown,
): StoredAvanzaAgentRun | null {
  const candidate = optionalObject(value);

  if (!candidate) {
    return null;
  }

  const runId = optionalString(candidate.runId);
  const createdAt = normalizeTimestamp(candidate.createdAt);
  const updatedAt = normalizeTimestamp(candidate.updatedAt);
  const requestId = optionalString(candidate.requestId);
  const resultStatus = normalizeResultStatus(candidate.resultStatus);
  const runnerId = optionalString(candidate.runnerId);
  const runnerName = optionalString(candidate.runnerName);
  const runnerVersion = optionalString(candidate.runnerVersion);
  const intentId = optionalString(candidate.intentId);
  const positionId = optionalString(candidate.positionId);
  const recommendationId = optionalString(candidate.recommendationId);
  const handoffStatus = normalizeHandoffStatus(candidate.handoffStatus);
  const resultError = optionalString(candidate.resultError);
  const rawSummary = optionalString(candidate.rawSummary);
  const requestSummary = normalizeRequestSummary(candidate.request);
  const resultSummary = normalizeResultSummary(candidate.result);
  const metadata = optionalObject(candidate.metadata);

  if (
    !runId ||
    !createdAt ||
    !updatedAt ||
    !requestId ||
    candidate.requestVersion !== "avanza_agent_request_v1" ||
    candidate.broker !== "avanza" ||
    !resultStatus
  ) {
    return null;
  }

  return {
    runId,
    createdAt,
    updatedAt,
    requestId,
    requestVersion: "avanza_agent_request_v1",
    ...(runnerId ? { runnerId } : {}),
    ...(runnerName ? { runnerName } : {}),
    ...(runnerVersion ? { runnerVersion } : {}),
    broker: "avanza",
    mode: normalizeMode(candidate.mode),
    action: normalizeAction(candidate.action),
    ticker: optionalString(candidate.ticker),
    quantity: finiteNumber(candidate.quantity),
    ...(intentId ? { intentId } : {}),
    ...(positionId ? { positionId } : {}),
    ...(recommendationId ? { recommendationId } : {}),
    ...(handoffStatus ? { handoffStatus } : {}),
    requireManualFinalConfirmation: Boolean(
      candidate.requireManualFinalConfirmation,
    ),
    allowAutomaticFinalSubmit: Boolean(candidate.allowAutomaticFinalSubmit),
    resultStatus,
    ...(resultError ? { resultError } : {}),
    brokerResultPresent: Boolean(candidate.brokerResultPresent),
    progressEventCount: finiteNumber(candidate.progressEventCount) ?? 0,
    progressEventTypes: normalizeProgressEventTypes(
      candidate.progressEventTypes,
    ),
    ...(rawSummary ? { rawSummary } : {}),
    ...(requestSummary ? { request: requestSummary } : {}),
    ...(resultSummary ? { result: resultSummary } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

function readAvanzaAgentRunStore(): AvanzaAgentRunStoreReadResult {
  const storage = getStorage();

  if (!storage) {
    return {
      runs: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    };
  }

  try {
    const parsed = JSON.parse(
      storage.getItem(AVANZA_AGENT_RUN_STORE_KEY) ?? "[]",
    );
    const rawRuns = Array.isArray(parsed) ? parsed : [];
    const runs = rawRuns
      .map(normalizeStoredAvanzaAgentRun)
      .filter((run): run is StoredAvanzaAgentRun => Boolean(run));

    return {
      runs,
      discardedCount: rawRuns.length - runs.length,
      storageAvailable: true,
      error: null,
    };
  } catch (error) {
    return {
      runs: [],
      discardedCount: 0,
      storageAvailable: true,
      error:
        error instanceof Error
          ? error.message
          : "Malformed Avanza agent run store.",
    };
  }
}

function writeAvanzaAgentRuns(runs: StoredAvanzaAgentRun[]): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      AVANZA_AGENT_RUN_STORE_KEY,
      JSON.stringify(runs.slice(-MAX_STORED_AVANZA_AGENT_RUNS)),
    );
    return true;
  } catch {
    return false;
  }
}

export function readAvanzaAgentRuns(): StoredAvanzaAgentRun[] {
  return readAvanzaAgentRunStore().runs;
}

export function readAvanzaAgentRunStoreResult(): AvanzaAgentRunStoreReadResult {
  return readAvanzaAgentRunStore();
}

export function appendAvanzaAgentRun(run: StoredAvanzaAgentRun): boolean {
  return appendAvanzaAgentRuns([run]);
}

export function appendAvanzaAgentRuns(
  runs: readonly StoredAvanzaAgentRun[],
): boolean {
  const currentRuns = readAvanzaAgentRuns();
  const validRuns = runs
    .map(normalizeStoredAvanzaAgentRun)
    .filter((run): run is StoredAvanzaAgentRun => Boolean(run));

  if (validRuns.length === 0) {
    return false;
  }

  return writeAvanzaAgentRuns([...currentRuns, ...validRuns]);
}

export function clearAvanzaAgentRuns(): boolean {
  return writeAvanzaAgentRuns([]);
}

export function getAvanzaAgentRunsForRequest(requestId: string) {
  const normalizedRequestId = optionalString(requestId);

  if (!normalizedRequestId) {
    return [];
  }

  return readAvanzaAgentRuns().filter(
    (run) => run.requestId === normalizedRequestId,
  );
}

export function getAvanzaAgentRunsForIntent(intentId: string) {
  const normalizedIntentId = optionalString(intentId);

  if (!normalizedIntentId) {
    return [];
  }

  return readAvanzaAgentRuns().filter(
    (run) => run.intentId === normalizedIntentId,
  );
}

export function getAvanzaAgentRunsForPosition(positionId: string) {
  const normalizedPositionId = optionalString(positionId);

  if (!normalizedPositionId) {
    return [];
  }

  return readAvanzaAgentRuns().filter(
    (run) => run.positionId === normalizedPositionId,
  );
}

export function getAvanzaAgentRunsForRecommendation(recommendationId: string) {
  const normalizedRecommendationId = optionalString(recommendationId);

  if (!normalizedRecommendationId) {
    return [];
  }

  return readAvanzaAgentRuns().filter(
    (run) => run.recommendationId === normalizedRecommendationId,
  );
}
