export const AVANZA_SESSION_DETECTION_CONTRACT_VERSION =
  "avanza_session_detection_v1" as const;

export type AvanzaSessionDetectionStatus =
  | "unavailable"
  | "browser_not_connected"
  | "avanza_not_visible"
  | "login_required"
  | "ready_for_search_only"
  | "blocked"
  | "failed";

export type AvanzaSessionDetectionLoginState =
  | "unknown"
  | "logged_in"
  | "logged_out"
  | "login_challenge";

export type AvanzaSessionDetectionLanguage = "sv" | "en" | "unknown";

export type AvanzaSessionDetectionPageContext =
  | "unknown"
  | "login"
  | "app_shell"
  | "instrument_page"
  | "order_page"
  | "confirmation_modal";

export type AvanzaSessionDetectionMarketContext =
  | "unknown"
  | "open"
  | "closed"
  | "pre_market"
  | "after_hours";

export type AvanzaSessionDetectionHostClass = "unknown" | "avanza" | "other";

export type AvanzaSessionDetectionContext = {
  browserConnected?: boolean;
  avanzaVisible?: boolean;
  loginState?: AvanzaSessionDetectionLoginState;
  language?: AvanzaSessionDetectionLanguage;
  pageContext?: AvanzaSessionDetectionPageContext;
  marketContext?: AvanzaSessionDetectionMarketContext;
  sanitizedTitle?: string;
  sanitizedHostClass?: AvanzaSessionDetectionHostClass;
  sensitiveDataDetected?: boolean;
  metadata?: Record<string, unknown>;
};

export type AvanzaSessionDetectionResult = {
  ok: boolean;
  status: AvanzaSessionDetectionStatus;
  checkedAt: string;
  context: AvanzaSessionDetectionContext;
  blockers: string[];
  warnings: string[];
  errors: string[];
  labels: string[];
  metadata?: Record<string, unknown>;
};

export type CreateAvanzaSessionDetectionResultInput = {
  status?: AvanzaSessionDetectionStatus;
  checkedAt?: string;
  context?: AvanzaSessionDetectionContext;
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  labels?: string[];
  metadata?: Record<string, unknown>;
};

const BASE_SAFETY_LABELS = [
  "Session detection only",
  "No browser actions",
  "No broker submission",
  "No order preparation",
  "Local diagnostics only",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string" && item.trim() !== "",
  );
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter((value) => value.trim() !== ""))];
}

function normalizeContext(
  context: AvanzaSessionDetectionContext | undefined,
): AvanzaSessionDetectionContext {
  return {
    browserConnected: context?.browserConnected,
    avanzaVisible: context?.avanzaVisible,
    loginState: context?.loginState ?? "unknown",
    language: context?.language ?? "unknown",
    pageContext: context?.pageContext ?? "unknown",
    marketContext: context?.marketContext ?? "unknown",
    sanitizedTitle: optionalString(context?.sanitizedTitle),
    sanitizedHostClass: context?.sanitizedHostClass ?? "unknown",
    sensitiveDataDetected: context?.sensitiveDataDetected ?? false,
    metadata: isRecord(context?.metadata) ? context.metadata : undefined,
  };
}

function createResultFromEvaluation(input: {
  status: AvanzaSessionDetectionStatus;
  context: AvanzaSessionDetectionContext;
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  checkedAt?: string;
  metadata?: Record<string, unknown>;
}): AvanzaSessionDetectionResult {
  const statusLabels: Record<AvanzaSessionDetectionStatus, string[]> = {
    unavailable: ["Session detection unavailable"],
    browser_not_connected: ["Browser not connected"],
    avanza_not_visible: ["Avanza not visible"],
    login_required: ["Login required"],
    ready_for_search_only: ["Ready for search-only"],
    blocked: ["Session detection blocked"],
    failed: ["Session detection failed"],
  };

  return {
    ok: input.status === "ready_for_search_only",
    status: input.status,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    context: input.context,
    blockers: input.blockers ?? [],
    warnings: input.warnings ?? [],
    errors: input.errors ?? [],
    labels: uniqueStrings([
      ...BASE_SAFETY_LABELS,
      ...statusLabels[input.status],
    ]),
    metadata: {
      ...(input.metadata ?? {}),
      contractVersion: AVANZA_SESSION_DETECTION_CONTRACT_VERSION,
      targetEnvironment: "avanza_broker",
      sessionDetectionOnly: true,
      noBrowserActions: true,
      noBrokerSubmission: true,
      noFinalConfirm: true,
      noOrderPreparation: true,
    },
  };
}

export function evaluateAvanzaSessionDetectionContext(
  context: unknown,
): AvanzaSessionDetectionResult {
  if (!isRecord(context)) {
    return createResultFromEvaluation({
      status: "failed",
      context: normalizeContext(undefined),
      blockers: ["Session detection context must be an object."],
      errors: ["Session detection context must be an object."],
    });
  }

  const normalized = normalizeContext(context as AvanzaSessionDetectionContext);

  if (normalized.browserConnected === false) {
    return createResultFromEvaluation({
      status: "browser_not_connected",
      context: normalized,
      blockers: ["Browser connection is not available."],
      errors: ["Browser connection is not available."],
    });
  }

  if (normalized.sensitiveDataDetected === true) {
    return createResultFromEvaluation({
      status: "blocked",
      context: normalized,
      blockers: ["Sensitive data was detected and must be redacted."],
      errors: ["Sensitive data was detected and must be redacted."],
    });
  }

  if (normalized.pageContext === "confirmation_modal") {
    return createResultFromEvaluation({
      status: "blocked",
      context: normalized,
      blockers: [
        "Confirmation modal context is outside session-detection-only scope.",
      ],
      errors: [
        "Confirmation modal context is outside session-detection-only scope.",
      ],
    });
  }

  if (normalized.pageContext === "order_page") {
    return createResultFromEvaluation({
      status: "blocked",
      context: normalized,
      blockers: ["Order page context is outside session-detection-only scope."],
      errors: ["Order page context is outside session-detection-only scope."],
    });
  }

  if (
    normalized.avanzaVisible === false ||
    normalized.sanitizedHostClass === "other"
  ) {
    return createResultFromEvaluation({
      status: "avanza_not_visible",
      context: normalized,
      blockers: ["Avanza UI is not visible in the watched browser context."],
      errors: ["Avanza UI is not visible in the watched browser context."],
    });
  }

  if (
    normalized.loginState === "logged_out" ||
    normalized.loginState === "login_challenge" ||
    normalized.pageContext === "login"
  ) {
    return createResultFromEvaluation({
      status: "login_required",
      context: normalized,
      blockers: ["Avanza login is required before search-only readiness."],
      warnings: ["User must complete login manually."],
    });
  }

  if (
    normalized.loginState === "logged_in" &&
    normalized.avanzaVisible === true &&
    (normalized.pageContext === "app_shell" ||
      normalized.pageContext === "instrument_page" ||
      normalized.pageContext === "unknown")
  ) {
    return createResultFromEvaluation({
      status: "ready_for_search_only",
      context: normalized,
      warnings:
        normalized.pageContext === "instrument_page"
          ? [
              "Instrument page is visible; future search-only phase must avoid order preparation.",
            ]
          : [],
    });
  }

  return createResultFromEvaluation({
    status: "unavailable",
    context: normalized,
    blockers: [
      "Session detection context is incomplete or cannot be classified safely.",
    ],
    warnings: [
      "Session detection needs browser, Avanza visibility, and login-state context.",
    ],
  });
}

export function createAvanzaSessionDetectionResult(
  input: CreateAvanzaSessionDetectionResultInput = {},
): AvanzaSessionDetectionResult {
  if (!input.status) {
    const evaluated = evaluateAvanzaSessionDetectionContext(input.context ?? {});

    return {
      ...evaluated,
      checkedAt: input.checkedAt ?? evaluated.checkedAt,
      blockers: uniqueStrings([
        ...evaluated.blockers,
        ...normalizeStringArray(input.blockers),
      ]),
      warnings: uniqueStrings([
        ...evaluated.warnings,
        ...normalizeStringArray(input.warnings),
      ]),
      errors: uniqueStrings([
        ...evaluated.errors,
        ...normalizeStringArray(input.errors),
      ]),
      labels: uniqueStrings([
        ...evaluated.labels,
        ...normalizeStringArray(input.labels),
      ]),
      metadata: {
        ...(evaluated.metadata ?? {}),
        ...(input.metadata ?? {}),
      },
    };
  }

  return createResultFromEvaluation({
    status: input.status,
    checkedAt: input.checkedAt,
    context: normalizeContext(input.context),
    blockers: normalizeStringArray(input.blockers),
    warnings: normalizeStringArray(input.warnings),
    errors: normalizeStringArray(input.errors),
    metadata: input.metadata,
  });
}

export function summarizeAvanzaSessionDetectionResult(
  result: AvanzaSessionDetectionResult,
) {
  switch (result.status) {
    case "browser_not_connected":
      return "Browser not connected.";
    case "avanza_not_visible":
      return "Avanza is not visible in the watched browser.";
    case "login_required":
      return "Avanza visible but login required.";
    case "ready_for_search_only":
      return "Session appears ready for search-only. No browser actions were executed.";
    case "blocked":
      return result.blockers.length > 0
        ? `Blocked: ${result.blockers[0]}`
        : "Blocked: session detection cannot proceed safely.";
    case "failed":
      return result.errors.length > 0
        ? `Failed: ${result.errors[0]}`
        : "Session detection failed.";
    case "unavailable":
    default:
      return "Session detection unavailable.";
  }
}

export function getAvanzaSessionDetectionSafetyLabels(
  result: AvanzaSessionDetectionResult,
) {
  return uniqueStrings([...BASE_SAFETY_LABELS, ...result.labels]);
}

export function isAvanzaSessionReadyForSearchOnly(
  result: AvanzaSessionDetectionResult,
) {
  return result.ok && result.status === "ready_for_search_only";
}
