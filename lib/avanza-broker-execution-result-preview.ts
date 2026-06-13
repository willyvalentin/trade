import type {
  AvanzaBrokerConfirmationCaptureResult,
  AvanzaBrokerConfirmationOrderStatus,
} from "./avanza-broker-confirmation-capture-contract";
import {
  evaluateAvanzaBrokerExecutionResultEligibility,
  type AvanzaBrokerExecutionResultEligibilityOptions,
  type AvanzaBrokerExecutionResultEligibilityResult,
} from "./avanza-broker-execution-result-eligibility";

export const AVANZA_BROKER_EXECUTION_RESULT_PREVIEW_VERSION =
  "avanza_broker_execution_result_preview_v1" as const;

export type AvanzaBrokerExecutionResultPreviewStatus =
  | "preview_available"
  | "not_eligible"
  | "partial_only"
  | "duplicate_risk"
  | "blocked"
  | "failed";

export type AvanzaBrokerExecutionResultPreviewField = {
  field: string;
  value: string | number | boolean | null;
  source: string;
  required: boolean;
  warning?: string;
};

export type AvanzaBrokerExecutionResultPreviewShape = {
  broker: "avanza";
  action: "buy" | "sell";
  ticker: string;
  instrumentName?: string;
  market?: string;
  currency?: string;
  instrumentType?: string;
  quantity: number;
  price: number;
  fees?: number;
  totalAmount?: number;
  timestamp?: string;
  brokerOrderId?: string;
  orderStatus: AvanzaBrokerConfirmationOrderStatus;
  sourceCaptureFingerprint: string;
  sourceRequestId?: string;
  sourceCaptureId?: string;
  warnings: string[];
  metadata: {
    version: typeof AVANZA_BROKER_EXECUTION_RESULT_PREVIEW_VERSION;
    previewOnly: true;
    notBrokerExecutionResult: true;
    noExecutionRecord: true;
    noSupabaseWrite: true;
    noTradeMutation: true;
    eligibilityStatus: AvanzaBrokerExecutionResultEligibilityResult["status"];
    captureStatus: AvanzaBrokerConfirmationCaptureResult["status"];
    orderStatus: AvanzaBrokerConfirmationOrderStatus;
    source: "avanza_broker_confirmation_capture";
    metadata?: Record<string, unknown>;
  };
};

export type AvanzaBrokerExecutionResultPreviewInput = {
  captureResult: AvanzaBrokerConfirmationCaptureResult;
  eligibilityResult?: AvanzaBrokerExecutionResultEligibilityResult;
  existingFingerprints?: string[];
  options?: AvanzaBrokerExecutionResultEligibilityOptions;
  metadata?: Record<string, unknown>;
};

export type AvanzaBrokerExecutionResultPreviewResult = {
  ok: boolean;
  status: AvanzaBrokerExecutionResultPreviewStatus;
  checkedAt: string;
  preview?: AvanzaBrokerExecutionResultPreviewShape;
  eligibility: AvanzaBrokerExecutionResultEligibilityResult;
  fields: AvanzaBrokerExecutionResultPreviewField[];
  blockers: string[];
  warnings: string[];
  errors: string[];
  labels: string[];
  metadata: {
    version: typeof AVANZA_BROKER_EXECUTION_RESULT_PREVIEW_VERSION;
    previewOnly: true;
    notBrokerExecutionResult: true;
    noExecutionRecord: true;
    noSupabaseWrite: true;
    noTradeMutation: true;
    source: "avanza_broker_execution_result_preview";
    metadata?: Record<string, unknown>;
  };
};

const PREVIEW_LABELS = [
  "BrokerExecutionResult preview only",
  "Not a real BrokerExecutionResult",
  "No execution record",
  "No Supabase write",
  "No trade mutation",
] as const;

function uniqueStrings(values: readonly string[]) {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function numberFromInput(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value.replace(/\s/g, "").replace(",", "."));

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function createField(input: AvanzaBrokerExecutionResultPreviewField) {
  return input;
}

function createBaseMetadata(metadata?: Record<string, unknown>) {
  return {
    version: AVANZA_BROKER_EXECUTION_RESULT_PREVIEW_VERSION,
    previewOnly: true as const,
    notBrokerExecutionResult: true as const,
    noExecutionRecord: true as const,
    noSupabaseWrite: true as const,
    noTradeMutation: true as const,
    source: "avanza_broker_execution_result_preview" as const,
    ...(metadata ? { metadata: { ...metadata } } : {}),
  };
}

function mapEligibilityStatus(
  status: AvanzaBrokerExecutionResultEligibilityResult["status"],
): AvanzaBrokerExecutionResultPreviewStatus {
  switch (status) {
    case "eligible":
      return "preview_available";
    case "partial_only":
      return "partial_only";
    case "duplicate_risk":
      return "duplicate_risk";
    case "blocked":
      return "blocked";
    case "failed":
      return "failed";
    case "not_eligible":
    default:
      return "not_eligible";
  }
}

function getSourceRequestId(
  captureResult: AvanzaBrokerConfirmationCaptureResult,
  metadata?: Record<string, unknown>,
) {
  const source = metadata?.sourceRequestId ?? captureResult.metadata?.requestId;

  return optionalText(source);
}

function getSourceCaptureId(
  captureResult: AvanzaBrokerConfirmationCaptureResult,
  metadata?: Record<string, unknown>,
) {
  const source = metadata?.sourceCaptureId ?? captureResult.metadata?.captureId;

  return optionalText(source);
}

function createResult(input: {
  status: AvanzaBrokerExecutionResultPreviewStatus;
  checkedAt: string;
  eligibility: AvanzaBrokerExecutionResultEligibilityResult;
  preview?: AvanzaBrokerExecutionResultPreviewShape;
  fields?: AvanzaBrokerExecutionResultPreviewField[];
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  metadata?: Record<string, unknown>;
}): AvanzaBrokerExecutionResultPreviewResult {
  const blockers = uniqueStrings(input.blockers ?? []);
  const errors = uniqueStrings(input.errors ?? blockers);
  const warnings = uniqueStrings(input.warnings ?? []);

  return {
    ok: input.status === "preview_available",
    status: input.status,
    checkedAt: input.checkedAt,
    preview: input.preview,
    eligibility: input.eligibility,
    fields: input.fields ?? [],
    blockers,
    warnings,
    errors,
    labels: [...PREVIEW_LABELS],
    metadata: createBaseMetadata(input.metadata),
  };
}

export function buildAvanzaBrokerExecutionResultPreview(
  input: AvanzaBrokerExecutionResultPreviewInput,
): AvanzaBrokerExecutionResultPreviewResult {
  const checkedAt = new Date().toISOString();
  const eligibility =
    input.eligibilityResult ??
    evaluateAvanzaBrokerExecutionResultEligibility({
      captureResult: input.captureResult,
      existingFingerprints: input.existingFingerprints,
      options: input.options,
    });
  const metadata = input.metadata;

  if (!eligibility.ok || eligibility.status !== "eligible") {
    return createResult({
      status: mapEligibilityStatus(eligibility.status),
      checkedAt,
      eligibility,
      blockers:
        eligibility.blockers.length > 0
          ? eligibility.blockers
          : ["Capture evidence is not eligible for preview conversion."],
      warnings: eligibility.warnings,
      errors: eligibility.errors,
      metadata,
    });
  }

  const captureResult = input.captureResult;
  const readback = captureResult.brokerConfirmationReadback;
  const blockers: string[] = [];
  const warnings = [...eligibility.warnings];
  const fields: AvanzaBrokerExecutionResultPreviewField[] = [];

  if (!readback) {
    return createResult({
      status: "blocked",
      checkedAt,
      eligibility,
      blockers: ["Broker confirmation readback is missing."],
      metadata,
    });
  }

  const action = readback.action === "buy" || readback.action === "sell"
    ? readback.action
    : null;
  const ticker = optionalText(readback.ticker);
  const quantity = numberFromInput(readback.quantityValue);
  const price = numberFromInput(readback.priceValue);
  const fees = numberFromInput(readback.fees);
  const totalAmount = numberFromInput(readback.totalAmount);
  const timestamp = optionalText(readback.timestamp);
  const brokerOrderId = optionalText(readback.orderIdSanitized);
  const instrumentName = optionalText(readback.name);
  const market = optionalText(readback.market);
  const currency = optionalText(readback.currency);
  const instrumentType = optionalText(readback.instrumentType);
  const sourceRequestId = getSourceRequestId(captureResult, metadata);
  const sourceCaptureId = getSourceCaptureId(captureResult, metadata);

  fields.push(
    createField({
      field: "broker",
      value: "avanza",
      source: "constant",
      required: true,
    }),
  );

  fields.push(
    createField({
      field: "action",
      value: action,
      source: "brokerConfirmationReadback.action",
      required: true,
      warning: action ? undefined : "Action is missing or unsupported.",
    }),
    createField({
      field: "ticker",
      value: ticker ?? null,
      source: "brokerConfirmationReadback.ticker",
      required: true,
      warning: ticker ? undefined : "Ticker is missing.",
    }),
    createField({
      field: "quantity",
      value: quantity,
      source: "brokerConfirmationReadback.quantityValue",
      required: true,
      warning:
        quantity !== null && quantity > 0
          ? undefined
          : "Quantity is missing or invalid.",
    }),
    createField({
      field: "price",
      value: price,
      source: "brokerConfirmationReadback.priceValue",
      required: true,
      warning:
        price !== null && price > 0
          ? undefined
          : "Price is missing or invalid.",
    }),
    createField({
      field: "timestamp",
      value: timestamp ?? null,
      source: "brokerConfirmationReadback.timestamp",
      required: true,
      warning: timestamp ? undefined : "Broker timestamp is missing.",
    }),
    createField({
      field: "brokerOrderId",
      value: brokerOrderId ?? null,
      source: "brokerConfirmationReadback.orderIdSanitized",
      required: true,
      warning: brokerOrderId ? undefined : "Broker order id is missing.",
    }),
    createField({
      field: "fees",
      value: fees,
      source: "brokerConfirmationReadback.fees",
      required: false,
      warning: fees === null ? "Broker fees/courtage are missing." : undefined,
    }),
    createField({
      field: "totalAmount",
      value: totalAmount,
      source: "brokerConfirmationReadback.totalAmount",
      required: false,
      warning:
        totalAmount === null ? "Broker total amount is missing." : undefined,
    }),
    createField({
      field: "sourceCaptureFingerprint",
      value: eligibility.evidenceFingerprint,
      source: "eligibility.evidenceFingerprint",
      required: true,
    }),
  );

  if (!action) {
    blockers.push("Broker confirmation action is missing or unsupported.");
  }

  if (!ticker) {
    blockers.push("Broker confirmation ticker is missing.");
  }

  if (quantity === null || quantity <= 0) {
    blockers.push("Broker confirmation quantity is missing or invalid.");
  }

  if (price === null || price <= 0) {
    blockers.push("Broker confirmation price is missing or invalid.");
  }

  if (!timestamp) {
    warnings.push("Broker confirmation timestamp is missing.");
  }

  if (!brokerOrderId) {
    warnings.push("Broker confirmation order id is missing.");
  }

  if (fees === null) {
    warnings.push("Broker fees/courtage are missing.");
  }

  if (totalAmount === null) {
    warnings.push("Broker total amount is missing.");
  }

  const fieldWarnings = fields
    .map((field) => field.warning)
    .filter((warning): warning is string => typeof warning === "string");

  if (blockers.length > 0) {
    return createResult({
      status: "blocked",
      checkedAt,
      eligibility,
      fields,
      blockers,
      warnings: [...warnings, ...fieldWarnings],
      metadata,
    });
  }

  const previewWarnings = uniqueStrings([...warnings, ...fieldWarnings]);
  const preview: AvanzaBrokerExecutionResultPreviewShape = {
    broker: "avanza",
    action: action as "buy" | "sell",
    ticker: ticker as string,
    ...(instrumentName ? { instrumentName } : {}),
    ...(market ? { market } : {}),
    ...(currency ? { currency } : {}),
    ...(instrumentType ? { instrumentType } : {}),
    quantity: quantity as number,
    price: price as number,
    ...(fees !== null ? { fees } : {}),
    ...(totalAmount !== null ? { totalAmount } : {}),
    ...(timestamp ? { timestamp } : {}),
    ...(brokerOrderId ? { brokerOrderId } : {}),
    orderStatus: captureResult.orderStatus,
    sourceCaptureFingerprint: eligibility.evidenceFingerprint,
    ...(sourceRequestId ? { sourceRequestId } : {}),
    ...(sourceCaptureId ? { sourceCaptureId } : {}),
    warnings: previewWarnings,
    metadata: {
      version: AVANZA_BROKER_EXECUTION_RESULT_PREVIEW_VERSION,
      previewOnly: true,
      notBrokerExecutionResult: true,
      noExecutionRecord: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      eligibilityStatus: eligibility.status,
      captureStatus: captureResult.status,
      orderStatus: captureResult.orderStatus,
      source: "avanza_broker_confirmation_capture",
      ...(metadata ? { metadata: { ...metadata } } : {}),
    },
  };

  return createResult({
    status: "preview_available",
    checkedAt,
    eligibility,
    preview,
    fields,
    warnings: previewWarnings,
    metadata,
  });
}

export function summarizeAvanzaBrokerExecutionResultPreview(
  result: AvanzaBrokerExecutionResultPreviewResult,
) {
  switch (result.status) {
    case "preview_available":
      return "BrokerExecutionResult preview available. No real BrokerExecutionResult was created.";
    case "partial_only":
      return "Preview blocked: capture is partial only. No real BrokerExecutionResult was created.";
    case "duplicate_risk":
      return "Preview blocked: duplicate evidence fingerprint. No real BrokerExecutionResult was created.";
    case "blocked":
      return `Preview blocked: ${
        result.blockers[0] ?? "mapping checks failed"
      }. No real BrokerExecutionResult was created.`;
    case "failed":
      return "Preview failed. No real BrokerExecutionResult was created.";
    case "not_eligible":
    default:
      return "Preview unavailable: not eligible. No real BrokerExecutionResult was created.";
  }
}

export function getAvanzaBrokerExecutionResultPreviewLabels(
  result: AvanzaBrokerExecutionResultPreviewResult,
) {
  return [...result.labels];
}

export function isAvanzaBrokerExecutionResultPreviewAvailable(
  result: AvanzaBrokerExecutionResultPreviewResult,
) {
  return result.ok && result.status === "preview_available" && !!result.preview;
}
