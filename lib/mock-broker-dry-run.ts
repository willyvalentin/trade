export type MockBrokerOrderSide = "BUY" | "SELL";

export type MockBrokerOrderStatus =
  | "draft"
  | "prepared"
  | "waiting_for_manual_confirmation"
  | "manually_confirmed"
  | "filled"
  | "cancelled"
  | "blocked";

export type MockBrokerOrderFormState = {
  ticker: string;
  instrument_name: string;
  side: MockBrokerOrderSide;
  quantity: string;
  price_type: "limit_reference" | "market_reference" | "review_required";
  price_reference: string;
  currency: string;
  broker: "MOCK_BROKER";
  stop_before_final_confirmation: boolean;
  handoff_session_id: string;
  payload_id: string;
  payload_fingerprint: string;
  source_kind: string;
};

export type MockBrokerFillConfirmation = {
  confirmation_id: string;
  confirmation_version: "1.0";
  source: "mock_broker_dry_run";
  broker: "MOCK_BROKER";
  status: "filled" | "partially_filled";
  side: MockBrokerOrderSide;
  ticker: string;
  actual_price: number;
  actual_shares: number;
  requested_shares: number;
  broker_reference: string;
  confirmed_at: string;
  manually_confirmed_mock_order: true;
  no_real_broker_order_submitted: true;
  avanza_not_contacted: true;
  human_final_avanza_confirmation_required_in_real_flow: true;
  handoff_session_id: string | null;
  payload_id: string | null;
  payload_fingerprint: string | null;
};

export type MockBrokerDryRunBlocker = {
  id: string;
  label: string;
  message: string;
};

export type MockBrokerDryRunWarning = {
  id: string;
  label: string;
  message: string;
};

export type MockBrokerDryRunValidation = {
  status: "ready" | "warning" | "blocked" | "draft";
  can_prepare_order: boolean;
  can_wait_for_manual_confirmation: boolean;
  can_generate_fill: boolean;
  blockers: MockBrokerDryRunBlocker[];
  warnings: MockBrokerDryRunWarning[];
  next_action: string;
};

export type MockBrokerDryRunSession = {
  session_id: string;
  session_version: "1.0";
  created_at: string;
  mode: "local_mock_only";
  status: MockBrokerOrderStatus;
  handoff_json_loaded: boolean;
  form_state: MockBrokerOrderFormState;
  validation: MockBrokerDryRunValidation;
  fill_confirmation: MockBrokerFillConfirmation | null;
  safety: {
    mock_only: true;
    avanza_not_contacted: true;
    no_real_order_submission: true;
    no_credentials: true;
    no_browser_agent_runtime: true;
    final_avanza_confirmation_human_only: true;
  };
};

export type ParseMockBrokerHandoffJsonResult = {
  parsed: unknown | null;
  form_state: MockBrokerOrderFormState;
  validation: MockBrokerDryRunValidation;
  parse_error: string | null;
};

const emptyFormState: MockBrokerOrderFormState = {
  ticker: "",
  instrument_name: "",
  side: "BUY",
  quantity: "",
  price_type: "limit_reference",
  price_reference: "",
  currency: "USD",
  broker: "MOCK_BROKER",
  stop_before_final_confirmation: true,
  handoff_session_id: "",
  payload_id: "",
  payload_fingerprint: "",
  source_kind: "manual_mock_form",
};

export function createMockBrokerOrderFormState(
  overrides: Partial<MockBrokerOrderFormState> = {},
): MockBrokerOrderFormState {
  return {
    ...emptyFormState,
    ...overrides,
    broker: "MOCK_BROKER",
  };
}

export function parseMockBrokerHandoffJson(
  rawJson: string,
): ParseMockBrokerHandoffJsonResult {
  const trimmed = rawJson.trim();

  if (!trimmed) {
    const formState = createMockBrokerOrderFormState();
    return {
      parsed: null,
      form_state: formState,
      validation: validateMockBrokerOrderForm(formState, { handoffLoaded: false }),
      parse_error: null,
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const formState = createMockBrokerOrderFormState(extractFormState(parsed));
    return {
      parsed,
      form_state: formState,
      validation: validateMockBrokerOrderForm(formState, {
        handoffLoaded: true,
        source: parsed,
      }),
      parse_error: null,
    };
  } catch {
    const formState = createMockBrokerOrderFormState();
    return {
      parsed: null,
      form_state: formState,
      validation: {
        status: "blocked",
        can_prepare_order: false,
        can_wait_for_manual_confirmation: false,
        can_generate_fill: false,
        blockers: [
          {
            id: "invalid_json",
            label: "Invalid JSON",
            message: "Paste a valid Ture handoff JSON object before preparing the mock order.",
          },
        ],
        warnings: [],
        next_action: "Paste valid Ture handoff JSON.",
      },
      parse_error: "Invalid JSON.",
    };
  }
}

export function buildMockBrokerDryRunSession(input: {
  formState: MockBrokerOrderFormState;
  status?: MockBrokerOrderStatus;
  fillConfirmation?: MockBrokerFillConfirmation | null;
  handoffLoaded?: boolean;
  createdAt?: string;
  source?: unknown;
}): MockBrokerDryRunSession {
  const createdAt = normalizeIsoTimestamp(input.createdAt);
  const validation = validateMockBrokerOrderForm(input.formState, {
    handoffLoaded: input.handoffLoaded ?? false,
    source: input.source,
  });
  const status = validation.status === "blocked" ? "blocked" : input.status ?? "draft";

  return {
    session_id: createMockBrokerSessionId(createdAt),
    session_version: "1.0",
    created_at: createdAt,
    mode: "local_mock_only",
    status,
    handoff_json_loaded: input.handoffLoaded ?? false,
    form_state: input.formState,
    validation,
    fill_confirmation: input.fillConfirmation ?? null,
    safety: {
      mock_only: true,
      avanza_not_contacted: true,
      no_real_order_submission: true,
      no_credentials: true,
      no_browser_agent_runtime: true,
      final_avanza_confirmation_human_only: true,
    },
  };
}

export function validateMockBrokerOrderForm(
  formState: MockBrokerOrderFormState,
  context: {
    handoffLoaded?: boolean;
    source?: unknown;
    requirePrepared?: boolean;
  } = {},
): MockBrokerDryRunValidation {
  const blockers: MockBrokerDryRunBlocker[] = [];
  const warnings: MockBrokerDryRunWarning[] = [];
  const quantity = positiveNumber(formState.quantity);
  const price = positiveNumber(formState.price_reference);
  const sourceBroker = extractString(context.source, [
    "broker",
    "broker_hint",
    "form_fields.broker",
  ]);
  const sourceStatus = extractString(context.source, ["status", "overall_status"]);

  if (!context.handoffLoaded) {
    warnings.push({
      id: "handoff_json_not_loaded",
      label: "Handoff JSON not loaded",
      message: "You can still type a mock form manually, but Phase 1 expects Ture handoff JSON.",
    });
  }

  if (!formState.ticker.trim()) {
    blockers.push(blocker("missing_ticker", "Missing ticker", "Ticker is required."));
  }

  if (!quantity || quantity <= 0) {
    blockers.push(
      blocker("invalid_quantity", "Invalid quantity", "Quantity must be greater than 0."),
    );
  }

  if (!price || price <= 0) {
    blockers.push(
      blocker("invalid_price", "Invalid price", "Reference price must be greater than 0."),
    );
  }

  if (formState.broker !== "MOCK_BROKER") {
    blockers.push(
      blocker(
        "broker_not_mock",
        "Broker is not MOCK_BROKER",
        "The dry run harness can only prepare mock broker orders.",
      ),
    );
  }

  if (!formState.stop_before_final_confirmation) {
    blockers.push(
      blocker(
        "missing_stop_guard",
        "Missing stop-before-final-confirmation guard",
        "The mock flow must stop before final confirmation and require a manual mock click.",
      ),
    );
  }

  if (sourceBroker && sourceBroker !== "AVANZA" && sourceBroker !== "MOCK_BROKER") {
    blockers.push(
      blocker(
        "source_broker_not_dry_run_compatible",
        "Source broker is not dry-run compatible",
        "Only AVANZA-origin Ture handoff JSON or MOCK_BROKER JSON is accepted in mock mode.",
      ),
    );
  }

  if (sourceBroker === "AVANZA") {
    warnings.push({
      id: "avanza_source_mock_override",
      label: "Avanza source mapped to mock",
      message:
        "The handoff package references AVANZA, but this page overrides execution to MOCK_BROKER only.",
    });
  }

  if (sourceStatus === "blocked") {
    blockers.push(
      blocker(
        "source_status_blocked",
        "Source status is blocked",
        "The pasted handoff or hard stop contract reports blocked status.",
      ),
    );
  }

  if (hasFailedCriticalHardStop(context.source)) {
    blockers.push(
      blocker(
        "critical_hard_stop_failed",
        "Critical hard stop failed",
        "A critical hard stop in the pasted JSON failed. Do not prepare the mock form.",
      ),
    );
  }

  if (context.requirePrepared && blockers.length > 0) {
    blockers.push(
      blocker(
        "manual_confirmation_blocked",
        "Manual mock confirmation blocked",
        "Resolve blockers before manually confirming the mock order.",
      ),
    );
  }

  if (formState.price_type === "review_required") {
    warnings.push({
      id: "price_type_review_required",
      label: "Price type requires review",
      message: "The handoff JSON did not provide a precise price type.",
    });
  }

  if (warnings.length === 0 && blockers.length === 0) {
    return {
      status: "ready",
      can_prepare_order: true,
      can_wait_for_manual_confirmation: true,
      can_generate_fill: true,
      blockers,
      warnings,
      next_action: "Prepare the mock order, then manually confirm the mock fill.",
    };
  }

  if (blockers.length > 0) {
    return {
      status: "blocked",
      can_prepare_order: false,
      can_wait_for_manual_confirmation: false,
      can_generate_fill: false,
      blockers,
      warnings,
      next_action: "Resolve blockers before mock preparation.",
    };
  }

  return {
    status: context.handoffLoaded ? "warning" : "draft",
    can_prepare_order: true,
    can_wait_for_manual_confirmation: true,
    can_generate_fill: true,
    blockers,
    warnings,
    next_action:
      "Review warnings, then prepare the mock order if this is intentional.",
  };
}

export function buildMockBrokerFillConfirmation(input: {
  formState: MockBrokerOrderFormState;
  filledShares?: string | number | null;
  actualPrice?: string | number | null;
  now?: Date;
}): MockBrokerFillConfirmation {
  const now = input.now ?? new Date();
  const requestedShares = positiveNumber(input.formState.quantity) ?? 0;
  const actualShares = positiveNumber(input.filledShares) ?? requestedShares;
  const actualPrice =
    positiveNumber(input.actualPrice) ??
    positiveNumber(input.formState.price_reference) ??
    0;
  const safeTicker = input.formState.ticker.trim().toUpperCase() || "UNKNOWN";
  const status = actualShares < requestedShares ? "partially_filled" : "filled";

  return {
    confirmation_id: `mock-fill-${safeTicker}-${now.getTime()}`,
    confirmation_version: "1.0",
    source: "mock_broker_dry_run",
    broker: "MOCK_BROKER",
    status,
    side: input.formState.side,
    ticker: safeTicker,
    actual_price: roundMoney(actualPrice),
    actual_shares: roundShares(actualShares),
    requested_shares: roundShares(requestedShares),
    broker_reference: `MOCK-${safeTicker}-${now.getTime()}`,
    confirmed_at: now.toISOString(),
    manually_confirmed_mock_order: true,
    no_real_broker_order_submitted: true,
    avanza_not_contacted: true,
    human_final_avanza_confirmation_required_in_real_flow: true,
    handoff_session_id: input.formState.handoff_session_id || null,
    payload_id: input.formState.payload_id || null,
    payload_fingerprint: input.formState.payload_fingerprint || null,
  };
}

export function mockBrokerFillConfirmationJson(
  confirmation: MockBrokerFillConfirmation,
): string {
  return JSON.stringify(confirmation, null, 2);
}

function extractFormState(source: unknown): Partial<MockBrokerOrderFormState> {
  const side = extractSide(source);
  const ticker = firstString(
    extractString(source, ["ticker"]),
    extractString(source, ["instrument.ticker_symbol"]),
    extractString(source, ["instrument.ticker"]),
    extractString(source, ["exit_context.ticker"]),
    extractString(source, ["source_context.ticker"]),
    extractString(source, ["form_fields.ticker_symbol"]),
    extractString(source, ["form_fields.instrument_search"]),
  );
  const instrumentName = firstString(
    extractString(source, ["company_name"]),
    extractString(source, ["instrument.company_name"]),
    extractString(source, ["exit_context.company_name"]),
    extractString(source, ["form_fields.company_name"]),
  );
  const quantity = firstNumber(
    extractNumber(source, ["shares"]),
    extractNumber(source, ["order_intent.quantity"]),
    extractNumber(source, ["order_intent.quantity_to_sell"]),
    extractNumber(source, ["form_fields.quantity"]),
  );
  const priceReference = firstNumber(
    extractNumber(source, ["limit_price"]),
    extractNumber(source, ["entry_price"]),
    extractNumber(source, ["latest_price"]),
    extractNumber(source, ["order_intent.limit_price"]),
    extractNumber(source, ["order_intent.price_reference"]),
    extractNumber(source, ["order_intent.estimated_entry_price"]),
    extractNumber(source, ["form_fields.limit_price"]),
    extractNumber(source, ["form_fields.price_reference"]),
    extractNumber(source, ["form_fields.estimated_entry_price"]),
    extractNumber(source, ["position_snapshot.current_price"]),
  );
  const priceType = normalizePriceType(
    firstString(
      extractString(source, ["order_type"]),
      extractString(source, ["order_intent.order_type"]),
      extractString(source, ["form_fields.price_type"]),
    ),
  );

  return {
    ticker: ticker ? ticker.trim().toUpperCase() : "",
    instrument_name: instrumentName ?? "",
    side,
    quantity: quantity === null ? "" : String(quantity),
    price_type: priceType,
    price_reference: priceReference === null ? "" : String(priceReference),
    currency:
      firstString(
        extractString(source, ["currency"]),
        extractString(source, ["order_intent.currency"]),
        extractString(source, ["form_fields.currency"]),
        extractString(source, ["instrument.currency"]),
      ) ?? "USD",
    handoff_session_id: extractString(source, ["handoff_session_id"]) ?? "",
    payload_id: extractString(source, ["payload_id"]) ?? "",
    payload_fingerprint: extractString(source, ["payload_fingerprint"]) ?? "",
    source_kind: getSourceKind(source),
  };
}

function extractSide(source: unknown): MockBrokerOrderSide {
  const value = firstString(
    extractString(source, ["order_intent.side"]),
    extractString(source, ["form_fields.order_side"]),
    extractString(source, ["form_fields.side"]),
  );

  if (value?.toUpperCase() === "SELL") {
    return "SELL";
  }

  if (
    extractString(source, ["payload_kind"]) === "exit_execution" ||
    extractString(source, ["command_kind"]) === "sell_handoff_command"
  ) {
    return "SELL";
  }

  return "BUY";
}

function getSourceKind(source: unknown) {
  return (
    firstString(
      extractString(source, ["payload_kind"]),
      extractString(source, ["command_kind"]),
      extractString(source, ["preview_kind"]),
      extractString(source, ["contract_kind"]),
      extractString(source, ["task"]),
      extractString(source, ["generated_from"]),
      extractString(source, ["source"]),
    ) ?? "ture_handoff_json"
  );
}

function normalizePriceType(
  value: string | null,
): MockBrokerOrderFormState["price_type"] {
  if (value === "market_reference") {
    return "market_reference";
  }

  if (value === "limit_reference" || value === "limit") {
    return "limit_reference";
  }

  return "review_required";
}

function extractString(source: unknown, paths: string[]) {
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function extractNumber(source: unknown, paths: string[]) {
  for (const path of paths) {
    const value = readPath(source, path);
    const parsed = positiveNumber(value);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

function readPath(source: unknown, path: string): unknown {
  if (!source || typeof source !== "object") {
    return null;
  }

  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") {
      return null;
    }

    return (current as Record<string, unknown>)[key] ?? null;
  }, source);
}

function firstString(...values: Array<string | null>) {
  return values.find((value) => value !== null) ?? null;
}

function firstNumber(...values: Array<number | null>) {
  return values.find((value) => value !== null) ?? null;
}

function positiveNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function hasFailedCriticalHardStop(source: unknown) {
  if (!source || typeof source !== "object") {
    return false;
  }

  const rules =
    readPath(source, "rules") ??
    readPath(source, "hard_stop_rules") ??
    readPath(source, "evaluations");

  if (!Array.isArray(rules)) {
    return false;
  }

  return rules.some((rule) => {
    if (!rule || typeof rule !== "object") {
      return false;
    }

    const record = rule as Record<string, unknown>;
    const status = String(record.status ?? "");
    const severity = String(record.severity ?? "");
    const blocksAgent =
      record.blocks_agent === true ||
      record.blocks_mark_ready === true ||
      record.blocks_sell_handoff === true;

    return (
      (status === "failed" || status === "blocked") &&
      (severity === "critical" || blocksAgent)
    );
  });
}

function blocker(
  id: string,
  label: string,
  message: string,
): MockBrokerDryRunBlocker {
  return { id, label, message };
}

function createMockBrokerSessionId(createdAt: string) {
  return `mock-broker-session-${createdAt.replace(/[^0-9A-Za-z]+/g, "-")}`;
}

function normalizeIsoTimestamp(value: string | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function roundShares(value: number) {
  return Number(value.toFixed(4));
}
