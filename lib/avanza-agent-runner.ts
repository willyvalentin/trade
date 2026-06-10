import {
  buildAvanzaAgentProgressEvent,
  buildAvanzaAgentResult,
  validateAvanzaAgentRequest,
  type AvanzaAgentProgressEvent,
  type AvanzaAgentProgressEventType,
  type AvanzaAgentRequest,
  type AvanzaAgentResult,
  type AvanzaAgentResultStatus,
} from "@/lib/avanza-agent-adapter";
import type { ExecutionMode } from "@/lib/execution";

export type AvanzaAgentProgressCallback = (
  event: AvanzaAgentProgressEvent,
) => void | Promise<void>;

export type AvanzaAgentRunnerContext = {
  runnerId: string;
  createdAt: string;
  mode: ExecutionMode | null;
  dryRun: boolean;
  broker: "avanza";
  metadata?: Record<string, unknown>;
};

export type AvanzaAgentRunnerRunOptions = {
  onProgress?: AvanzaAgentProgressCallback;
  signal?: AbortSignal;
  metadata?: Record<string, unknown>;
};

export type AvanzaAgentRunnerRunResult = AvanzaAgentResult;

export type AvanzaAgentRunner = {
  runnerId: string;
  name: string;
  version: string;
  supportsRealBrokerAutomation: boolean;
  run: (
    request: AvanzaAgentRequest,
    options?: AvanzaAgentRunnerRunOptions,
  ) => Promise<AvanzaAgentRunnerRunResult>;
};

export type CreateNoopAvanzaAgentRunnerOptions = {
  runnerId?: string | null;
  name?: string | null;
  version?: string | null;
  createdAt?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type CreateLocalProgressOnlyAvanzaAgentRunnerOptions =
  CreateNoopAvanzaAgentRunnerOptions & {
    sequence?: readonly AvanzaAgentProgressEventType[] | null;
    resultStatus?: Extract<AvanzaAgentResultStatus, "failed" | "unknown"> | null;
  };

function optionalString(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeTimestamp(value: string | null | undefined) {
  const timestamp = optionalString(value);

  return timestamp && Number.isFinite(Date.parse(timestamp))
    ? timestamp
    : new Date().toISOString();
}

function sanitizeIdPart(value: string | null | undefined) {
  return value?.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function createRunnerId(createdAt: string, random = Math.random()) {
  const suffix = Math.floor(Math.abs(random) * 0xffffff)
    .toString(36)
    .padStart(4, "0")
    .slice(0, 6);

  return [
    "avanza_agent_runner",
    sanitizeIdPart(createdAt),
    suffix,
  ].join("_");
}

function normalizeMetadata(
  metadata: Record<string, unknown> | null | undefined,
) {
  return metadata ? { ...metadata } : undefined;
}

function getRequestId(request: Partial<AvanzaAgentRequest> | null | undefined) {
  return optionalString(request?.requestId) ?? "unknown_request";
}

function buildRunnerContext(
  runner: Pick<AvanzaAgentRunner, "runnerId">,
  request: Partial<AvanzaAgentRequest>,
  options: AvanzaAgentRunnerRunOptions | undefined,
  createdAt: string,
  dryRun = true,
): AvanzaAgentRunnerContext {
  return {
    runnerId: runner.runnerId,
    createdAt,
    mode: request.mode ?? null,
    dryRun,
    broker: "avanza",
    ...(normalizeMetadata(options?.metadata)
      ? { metadata: normalizeMetadata(options?.metadata) }
      : {}),
  };
}

async function emitProgressEvent(
  event: AvanzaAgentProgressEvent,
  progressEvents: AvanzaAgentProgressEvent[],
  onProgress: AvanzaAgentProgressCallback | undefined,
) {
  progressEvents.push(event);

  if (onProgress) {
    await onProgress(event);
  }
}

function createRunnerProgressEvent(
  request: Partial<AvanzaAgentRequest>,
  type: AvanzaAgentProgressEventType,
  message: string,
  context: AvanzaAgentRunnerContext,
  metadata?: Record<string, unknown>,
) {
  return buildAvanzaAgentProgressEvent({
    requestId: getRequestId(request),
    createdAt: new Date().toISOString(),
    type,
    message,
    metadata: {
      runner_id: context.runnerId,
      dry_run: context.dryRun,
      broker: context.broker,
      no_browser_automation: true,
      no_broker_order_prepared: true,
      no_broker_order_submitted: true,
      ...(context.metadata ?? {}),
      ...(metadata ?? {}),
    },
  });
}

function buildFailedRunnerResult(
  request: Partial<AvanzaAgentRequest> | null | undefined,
  progressEvents: readonly AvanzaAgentProgressEvent[],
  error: string,
  status: Extract<AvanzaAgentResultStatus, "failed" | "cancelled"> = "failed",
) {
  return buildAvanzaAgentResult({
    requestId: getRequestId(request),
    status,
    progressEvents,
    error,
    rawSummary:
      "No Avanza browser agent is connected. No broker page was opened, no order form was prepared, and no order was submitted.",
  });
}

async function runNoopSequence(
  runner: Pick<AvanzaAgentRunner, "runnerId">,
  request: AvanzaAgentRequest,
  options: AvanzaAgentRunnerRunOptions | undefined,
  sequence: readonly AvanzaAgentProgressEventType[],
  finalStatus: Extract<AvanzaAgentResultStatus, "failed" | "unknown">,
): Promise<AvanzaAgentResult> {
  const progressEvents: AvanzaAgentProgressEvent[] = [];
  const validation = validateAvanzaAgentRequest(request);
  const createdAt = new Date().toISOString();
  const context = buildRunnerContext(runner, request, options, createdAt);

  try {
    if (options?.signal?.aborted) {
      const cancelledEvent = createRunnerProgressEvent(
        request,
        "agent_cancelled",
        "No-op Avanza agent runner was cancelled before it started. No broker action occurred.",
        context,
      );
      await emitProgressEvent(cancelledEvent, progressEvents, options?.onProgress);

      return buildFailedRunnerResult(
        request,
        progressEvents,
        "No-op Avanza agent runner was cancelled before it started.",
        "cancelled",
      );
    }

    const startedEvent = createRunnerProgressEvent(
      request,
      "agent_started",
      "No-op Avanza agent runner started locally. No browser automation is connected.",
      context,
      {
        validation_ok: validation.ok,
        validation_error_count: validation.errors.length,
        validation_warning_count: validation.warnings.length,
      },
    );
    await emitProgressEvent(startedEvent, progressEvents, options?.onProgress);

    if (!validation.ok) {
      const failedEvent = createRunnerProgressEvent(
        request,
        "agent_failed",
        "No-op Avanza agent runner rejected an invalid request. No broker action occurred.",
        context,
        {
          validation_errors: [...validation.errors],
          validation_warnings: [...validation.warnings],
        },
      );
      await emitProgressEvent(failedEvent, progressEvents, options?.onProgress);

      return buildFailedRunnerResult(
        request,
        progressEvents,
        `Invalid Avanza agent request: ${validation.errors.join(" ")}`,
      );
    }

    for (const type of sequence) {
      if (options?.signal?.aborted) {
        const cancelledEvent = createRunnerProgressEvent(
          request,
          "agent_cancelled",
          "No-op Avanza agent runner was cancelled. No broker action occurred.",
          context,
        );
        await emitProgressEvent(
          cancelledEvent,
          progressEvents,
          options?.onProgress,
        );

        return buildFailedRunnerResult(
          request,
          progressEvents,
          "No-op Avanza agent runner was cancelled.",
          "cancelled",
        );
      }

      const progressEvent = createRunnerProgressEvent(
        request,
        type,
        `${type} emitted by local progress-only runner. No broker action occurred.`,
        context,
      );
      await emitProgressEvent(progressEvent, progressEvents, options?.onProgress);
    }

    const failedEvent = createRunnerProgressEvent(
      request,
      "agent_failed",
      "No-op Avanza agent runner stopped because no real broker runner is connected.",
      context,
      {
        no_real_broker_runner_connected: true,
      },
    );
    await emitProgressEvent(failedEvent, progressEvents, options?.onProgress);

    return buildAvanzaAgentResult({
      requestId: request.requestId,
      status: finalStatus,
      progressEvents,
      error:
        "No-op Avanza agent runner cannot prepare or submit broker orders. No broker action occurred.",
      rawSummary:
        "Interface stub only. No Avanza page was opened, no browser automation ran, and no broker confirmation was created.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No-op Avanza agent runner failed unexpectedly.";

    return buildFailedRunnerResult(
      request,
      progressEvents,
      `No-op Avanza agent runner stopped safely: ${message}`,
    );
  }
}

export function createNoopAvanzaAgentRunner(
  options: CreateNoopAvanzaAgentRunnerOptions = {},
): AvanzaAgentRunner {
  const createdAt = normalizeTimestamp(options.createdAt);
  const runnerId = optionalString(options.runnerId) ?? createRunnerId(createdAt);

  return {
    runnerId,
    name: optionalString(options.name) ?? "No-op Avanza Agent Runner",
    version: optionalString(options.version) ?? "avanza_agent_runner_noop_v1",
    supportsRealBrokerAutomation: false,
    run: (request, runOptions) =>
      runNoopSequence(
        { runnerId },
        request,
        {
          ...runOptions,
          metadata: {
            ...(normalizeMetadata(options.metadata) ?? {}),
            ...(normalizeMetadata(runOptions?.metadata) ?? {}),
          },
        },
        [],
        "failed",
      ),
  };
}

export function createLocalProgressOnlyAvanzaAgentRunner(
  options: CreateLocalProgressOnlyAvanzaAgentRunnerOptions = {},
): AvanzaAgentRunner {
  const createdAt = normalizeTimestamp(options.createdAt);
  const runnerId = optionalString(options.runnerId) ?? createRunnerId(createdAt);
  const name =
    optionalString(options.name) ?? "Local Progress-only Avanza Agent Runner";
  const version =
    optionalString(options.version) ??
    "avanza_agent_runner_local_progress_only_v1";
  const sequence = [...(options.sequence ?? [])];
  const resultStatus = options.resultStatus ?? "unknown";

  return {
    runnerId,
    name,
    version,
    supportsRealBrokerAutomation: false,
    run: (request, runOptions) =>
      runNoopSequence(
        { runnerId },
        request,
        {
          ...runOptions,
          metadata: {
            ...(normalizeMetadata(options.metadata) ?? {}),
            ...(normalizeMetadata(runOptions?.metadata) ?? {}),
            local_progress_only: true,
          },
        },
        sequence,
        resultStatus,
      ),
  };
}

export async function runAvanzaAgentRequest(
  request: AvanzaAgentRequest,
  runner: AvanzaAgentRunner,
  options: AvanzaAgentRunnerRunOptions = {},
): Promise<AvanzaAgentRunnerRunResult> {
  const validation = validateAvanzaAgentRequest(request);

  if (!validation.ok) {
    return buildFailedRunnerResult(
      request,
      [],
      `Invalid Avanza agent request: ${validation.errors.join(" ")}`,
    );
  }

  if (options.signal?.aborted) {
    return buildFailedRunnerResult(
      request,
      [],
      "Avanza agent runner request was cancelled before runner execution.",
      "cancelled",
    );
  }

  try {
    return await runner.run(request, options);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Avanza agent runner failed unexpectedly.";

    return buildFailedRunnerResult(
      request,
      [],
      `Avanza agent runner stopped safely: ${message}`,
    );
  }
}

export function isRealBrokerAutomationRunner(runner: AvanzaAgentRunner) {
  return runner.supportsRealBrokerAutomation === true;
}
