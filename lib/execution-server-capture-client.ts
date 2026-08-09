import type {
  ExecutionServerCaptureRequest,
  ExecutionServerCaptureResponse,
} from "@/lib/execution-server-capture-contract";

export type PostExecutionServerCaptureRequestOptions = {
  timeoutMs?: number | null;
};

export type PostExecutionServerCaptureRequestResult = {
  ok: boolean;
  statusCode: number | null;
  response?: ExecutionServerCaptureResponse;
  errors: string[];
  warnings: string[];
  completedAt: string;
};

const defaultEndpoint = "/api/execution/capture" as const;
const defaultTimeoutMs = 10_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parseCaptureResponse(
  value: unknown,
): ExecutionServerCaptureResponse | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (
    typeof value.version !== "string" ||
    typeof value.receivedAt !== "string" ||
    typeof value.status !== "string" ||
    typeof value.message !== "string"
  ) {
    return undefined;
  }

  return {
    version: value.version as ExecutionServerCaptureResponse["version"],
    receivedAt: value.receivedAt,
    status: value.status as ExecutionServerCaptureResponse["status"],
    idempotencyKey:
      typeof value.idempotencyKey === "string" ? value.idempotencyKey : null,
    ...(typeof value.captureStatus === "string"
      ? {
          captureStatus:
            value.captureStatus as ExecutionServerCaptureResponse["captureStatus"],
        }
      : {}),
    ...(isRecord(value.record)
      ? { record: value.record as ExecutionServerCaptureResponse["record"] }
      : {}),
    errors: stringArray(value.errors),
    warnings: stringArray(value.warnings),
    message: value.message,
  };
}

function timeoutMsFromOptions(
  options: PostExecutionServerCaptureRequestOptions,
) {
  return typeof options.timeoutMs === "number" &&
    Number.isFinite(options.timeoutMs) &&
    options.timeoutMs > 0
    ? options.timeoutMs
    : defaultTimeoutMs;
}

function selectCaptureEndpoint(value: unknown): typeof defaultEndpoint | undefined {
  // Do not coerce, parse, decode, normalize, or inspect a non-string value.
  if (typeof value !== "string") {
    return undefined;
  }

  return value === defaultEndpoint ? defaultEndpoint : undefined;
}

export async function postExecutionServerCaptureRequest(
  request: ExecutionServerCaptureRequest,
  options: PostExecutionServerCaptureRequestOptions = {},
): Promise<PostExecutionServerCaptureRequestResult> {
  const completedAt = () => new Date().toISOString();
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    timeoutMsFromOptions(options),
  );

  try {
    const endpoint = selectCaptureEndpoint(defaultEndpoint);

    if (!endpoint) {
      return {
        ok: false,
        statusCode: null,
        errors: ["Execution capture request rejected an unsupported endpoint."],
        warnings: [],
        completedAt: completedAt(),
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    let json: unknown;

    try {
      json = await response.json();
    } catch {
      return {
        ok: false,
        statusCode: response.status,
        errors: ["Execution capture response was not valid JSON."],
        warnings: [],
        completedAt: completedAt(),
      };
    }

    const parsed = parseCaptureResponse(json);

    if (!parsed) {
      return {
        ok: false,
        statusCode: response.status,
        errors: ["Execution capture response did not match the contract shape."],
        warnings: [],
        completedAt: completedAt(),
      };
    }

    return {
      ok: response.ok && parsed.status !== "invalid" && parsed.status !== "failed",
      statusCode: response.status,
      response: parsed,
      errors: stringArray(parsed.errors),
      warnings: stringArray(parsed.warnings),
      completedAt: completedAt(),
    };
  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === "AbortError";

    return {
      ok: false,
      statusCode: null,
      errors: [
        isAbort
          ? "Execution capture request timed out."
          : "Execution capture request failed before a response was received.",
      ],
      warnings: [],
      completedAt: completedAt(),
    };
  } finally {
    window.clearTimeout(timeout);
  }
}
