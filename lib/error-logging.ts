export type NormalizedUnknownError = {
  message: string;
  name?: string;
  stack?: string;
  cause?: NormalizedUnknownError;
  code?: string;
  details?: unknown;
  hint?: string;
  status?: number;
  statusCode?: number;
  properties?: Record<string, unknown>;
  thrownValue?: unknown;
  type?: string;
};

function stringProperty(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function numberProperty(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function objectType(value: object) {
  return Object.prototype.toString.call(value).replace(/^\[object |\]$/g, "");
}

export function normalizeUnknownError(error: unknown): NormalizedUnknownError {
  if (error instanceof Error) {
    return {
      message: error.message || "Unknown error",
      name: error.name,
      stack: error.stack,
      cause:
        "cause" in error && error.cause !== undefined
          ? normalizeUnknownError(error.cause)
          : undefined,
    };
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    const message =
      stringProperty(record, "message") ??
      stringProperty(record, "error") ??
      "Unknown non-Error object thrown";
    const properties = Object.fromEntries(
      Object.entries(record).filter(
        ([key]) =>
          ![
            "message",
            "name",
            "stack",
            "cause",
            "code",
            "details",
            "hint",
            "status",
            "statusCode",
          ].includes(key),
      ),
    );

    return {
      message,
      name: stringProperty(record, "name"),
      stack: stringProperty(record, "stack"),
      cause:
        "cause" in record && record.cause !== undefined
          ? normalizeUnknownError(record.cause)
          : undefined,
      code: stringProperty(record, "code"),
      details: record.details,
      hint: stringProperty(record, "hint"),
      status: numberProperty(record, "status"),
      statusCode: numberProperty(record, "statusCode"),
      properties: Object.keys(properties).length > 0 ? properties : undefined,
      type: objectType(error),
    };
  }

  return {
    message:
      typeof error === "string" && error.trim().length > 0
        ? error
        : "Unknown non-Error value thrown",
    thrownValue: error,
    type: typeof error,
  };
}
