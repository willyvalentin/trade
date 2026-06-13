export const AVANZA_DRY_RUN_REQUEST_CONTRACT_VERSION =
  "avanza_dry_run_request_v1" as const;

export const DEFAULT_AVANZA_DRY_RUN_ORDER_MODE = "advanced" as const;
export const DEFAULT_AVANZA_DRY_RUN_STOP_POLICY =
  "stop_at_confirmation_modal" as const;
export const DEFAULT_AVANZA_DRY_RUN_ACCOUNT_POLICY =
  "require_manual_review" as const;

export type AvanzaDryRunAction = "buy" | "sell";

export type AvanzaDryRunOrderMode = "advanced";

export type AvanzaDryRunAccountPolicy =
  | "use_current_default"
  | "require_manual_review"
  | "require_exact_match";

export type AvanzaDryRunStopPolicy =
  | "stop_at_confirmation_modal"
  | "stop_before_review";

export type AvanzaDryRunInstrumentIdentity = {
  ticker: string;
  name?: string;
  market?: string;
  currency?: string;
  instrumentType?: string;
};

export type AvanzaDryRunOrderInput = {
  action: AvanzaDryRunAction;
  instrument: AvanzaDryRunInstrumentIdentity;
  quantity: number;
  price: number;
  orderMode: AvanzaDryRunOrderMode;
  accountPolicy: AvanzaDryRunAccountPolicy;
  expectedAccountLabel?: string;
  stopPolicy: AvanzaDryRunStopPolicy;
  sourceRecommendationId?: string;
  executionIntentId?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type CreateAvanzaDryRunOrderInput = Omit<
  AvanzaDryRunOrderInput,
  "orderMode" | "accountPolicy" | "stopPolicy" | "createdAt"
> &
  Partial<
    Pick<
      AvanzaDryRunOrderInput,
      "orderMode" | "accountPolicy" | "stopPolicy" | "createdAt"
    >
  >;

export type AvanzaDryRunRequestValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  normalized?: AvanzaDryRunOrderInput;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberFromInput(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function isAvanzaDryRunAction(value: unknown): value is AvanzaDryRunAction {
  return value === "buy" || value === "sell";
}

function isAvanzaDryRunOrderMode(
  value: unknown,
): value is AvanzaDryRunOrderMode {
  return value === "advanced";
}

function isAvanzaDryRunAccountPolicy(
  value: unknown,
): value is AvanzaDryRunAccountPolicy {
  return (
    value === "use_current_default" ||
    value === "require_manual_review" ||
    value === "require_exact_match"
  );
}

function isAvanzaDryRunStopPolicy(
  value: unknown,
): value is AvanzaDryRunStopPolicy {
  return value === "stop_at_confirmation_modal" || value === "stop_before_review";
}

function normalizeInstrument(
  input: unknown,
  errors: string[],
  warnings: string[],
): AvanzaDryRunInstrumentIdentity | null {
  if (!isRecord(input)) {
    errors.push("Instrument identity is required.");
    return null;
  }

  const ticker = optionalString(input.ticker);

  if (!ticker) {
    errors.push("Instrument ticker is required.");
  }

  const currency = optionalString(input.currency);
  const market = optionalString(input.market);

  if (!currency) {
    warnings.push("Instrument currency is missing and must be verified manually.");
  }

  if (!market) {
    warnings.push("Instrument market is missing and must be verified manually.");
  }

  if (!ticker) {
    return null;
  }

  return {
    ticker,
    name: optionalString(input.name),
    market,
    currency,
    instrumentType: optionalString(input.instrumentType),
  };
}

function validateUnsafeMetadata(metadata: unknown, errors: string[]) {
  if (!isRecord(metadata)) {
    return;
  }

  if (metadata.allowFinalSubmit === true) {
    errors.push("Avanza dry-run request metadata must not allow final submit.");
  }

  if (metadata.supportsBrokerSubmission === true) {
    errors.push(
      "Avanza dry-run request metadata must not support broker submission.",
    );
  }

  if (metadata.supportsFinalConfirmClick === true) {
    errors.push(
      "Avanza dry-run request metadata must not support final-confirm clicks.",
    );
  }

  if (metadata.automaticModeCapable === true) {
    errors.push(
      "Avanza dry-run request metadata must not enable automatic mode.",
    );
  }
}

export function createAvanzaDryRunOrderInput(
  input: CreateAvanzaDryRunOrderInput,
): AvanzaDryRunOrderInput {
  return {
    ...input,
    instrument: {
      ...input.instrument,
      ticker: input.instrument.ticker.trim(),
      name: optionalString(input.instrument.name),
      market: optionalString(input.instrument.market),
      currency: optionalString(input.instrument.currency),
      instrumentType: optionalString(input.instrument.instrumentType),
    },
    orderMode: input.orderMode ?? DEFAULT_AVANZA_DRY_RUN_ORDER_MODE,
    accountPolicy:
      input.accountPolicy ?? DEFAULT_AVANZA_DRY_RUN_ACCOUNT_POLICY,
    stopPolicy: input.stopPolicy ?? DEFAULT_AVANZA_DRY_RUN_STOP_POLICY,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function validateAvanzaDryRunOrderInput(
  input: unknown,
): AvanzaDryRunRequestValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(input)) {
    return {
      ok: false,
      errors: ["Avanza dry-run request must be an object."],
      warnings,
    };
  }

  const action = input.action;
  const orderMode = input.orderMode ?? DEFAULT_AVANZA_DRY_RUN_ORDER_MODE;
  const accountPolicy =
    input.accountPolicy ?? DEFAULT_AVANZA_DRY_RUN_ACCOUNT_POLICY;
  const stopPolicy = input.stopPolicy ?? DEFAULT_AVANZA_DRY_RUN_STOP_POLICY;
  const quantity = numberFromInput(input.quantity);
  const price = numberFromInput(input.price);
  const instrument = normalizeInstrument(input.instrument, errors, warnings);

  if (!isAvanzaDryRunAction(action)) {
    errors.push("Avanza dry-run action must be buy or sell.");
  }

  if (!isAvanzaDryRunOrderMode(orderMode)) {
    errors.push("Avanza dry-run order mode must be advanced.");
  }

  if (!isAvanzaDryRunStopPolicy(stopPolicy)) {
    errors.push(
      "Avanza dry-run stop policy must stop before review or at confirmation modal.",
    );
  }

  if (!isAvanzaDryRunAccountPolicy(accountPolicy)) {
    errors.push("Avanza dry-run account policy is unsupported.");
  }

  if (quantity === null || quantity <= 0 || !Number.isInteger(quantity)) {
    errors.push("Avanza dry-run quantity must be a positive integer.");
  }

  if (price === null || price <= 0) {
    errors.push("Avanza dry-run price must be a positive finite number.");
  }

  if (
    accountPolicy === "require_exact_match" &&
    !optionalString(input.expectedAccountLabel)
  ) {
    errors.push(
      "Avanza dry-run account policy require_exact_match requires expectedAccountLabel.",
    );
  }

  validateUnsafeMetadata(input.metadata, errors);

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      warnings,
    };
  }

  const normalized: AvanzaDryRunOrderInput = {
    action: action as AvanzaDryRunAction,
    instrument: instrument as AvanzaDryRunInstrumentIdentity,
    quantity: quantity as number,
    price: price as number,
    orderMode: orderMode as AvanzaDryRunOrderMode,
    accountPolicy: accountPolicy as AvanzaDryRunAccountPolicy,
    expectedAccountLabel: optionalString(input.expectedAccountLabel),
    stopPolicy: stopPolicy as AvanzaDryRunStopPolicy,
    sourceRecommendationId: optionalString(input.sourceRecommendationId),
    executionIntentId: optionalString(input.executionIntentId),
    createdAt: optionalString(input.createdAt) ?? new Date().toISOString(),
    metadata: isRecord(input.metadata) ? input.metadata : undefined,
  };

  return {
    ok: true,
    errors,
    warnings,
    normalized,
  };
}

export function summarizeAvanzaDryRunOrderInput(
  input: AvanzaDryRunOrderInput,
) {
  const action = input.action.toUpperCase();
  const ticker = input.instrument.ticker;
  const stop =
    input.stopPolicy === "stop_before_review"
      ? "Stop before review"
      : "Stop at confirmation modal";

  return `${action} ${ticker} ${input.quantity} @ ${input.price} / Advanced / ${stop} / No broker submission`;
}

export function isAvanzaDryRunSubmitBlocked() {
  return true;
}

export function getAvanzaDryRunSafetyLabels(
  input: Pick<AvanzaDryRunOrderInput, "stopPolicy" | "orderMode">,
) {
  return [
    "Avanza dry-run only",
    input.orderMode === "advanced" ? "Advanced order mode" : "Unsupported mode",
    input.stopPolicy === "stop_before_review"
      ? "Stop before review"
      : "Stop at confirmation modal",
    "No broker submission",
    "No final confirmation",
    "No broker result",
  ];
}
