import type { BrokerOrderStatus } from "@/lib/broker-execution-metadata";
import type { BrokerExitStatus } from "@/lib/broker-exit-confirmation";
import type { MockBrokerFillConfirmation } from "@/lib/mock-broker-dry-run";

export type MockBrokerFillImportSide = "BUY" | "SELL";
export type MockBrokerFillImportStatus =
  | "ready"
  | "needs_review"
  | "blocked"
  | "invalid";

export type MockBrokerFillImportFieldMapping = {
  target_field: string;
  value: string | number | boolean | null;
  source_path: string;
  status: "mapped" | "missing" | "not_applicable";
};

export type MockBrokerFillImportBlocker = {
  id: string;
  label: string;
  message: string;
};

export type MockBrokerFillImportWarning = {
  id: string;
  label: string;
  message: string;
};

export type MockBrokerFillImportResult = {
  side: MockBrokerFillImportSide;
  status: MockBrokerFillImportStatus;
  fill: MockBrokerFillConfirmation | null;
  field_mappings: MockBrokerFillImportFieldMapping[];
  blockers: MockBrokerFillImportBlocker[];
  warnings: MockBrokerFillImportWarning[];
  next_action: string;
};

export type BuyBrokerFillImportMapping = {
  brokerOrderStatus: BrokerOrderStatus;
  actualFillPrice: string;
  actualShares: string;
  brokerReferenceNote: string;
  manualMockConfirmation: boolean;
  brokerPlanMatches: boolean;
  previewCommission: string;
  previewFxFee: string;
};

export type SellBrokerExitImportMapping = {
  exitStatus: BrokerExitStatus;
  actualExitPrice: string;
  actualSoldShares: string;
  brokerReferenceNote: string;
  manualMockConfirmation: boolean;
  brokerOrderMatchesTradePlan: boolean;
  exitCommission: string;
  exitFxFee: string;
};

export function parseMockBrokerFillConfirmationJson(
  rawJson: string,
): MockBrokerFillImportResult {
  const trimmed = rawJson.trim();

  if (!trimmed) {
    return invalidResult("BUY", "missing_json", "Missing JSON", "Paste mock fill confirmation JSON.");
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const fill = normalizeMockBrokerFillConfirmation(parsed);
    const side = fill?.side ?? "BUY";

    if (!fill) {
      return invalidResult(
        side,
        "invalid_mock_fill_shape",
        "Invalid mock fill shape",
        "The JSON does not look like a mock broker fill confirmation.",
      );
    }

    return {
      side,
      status: "needs_review",
      fill,
      field_mappings: buildFieldMappings(fill, side),
      blockers: [],
      warnings: [
        warning(
          "not_validated_against_ture_context",
          "Not validated against Ture context",
          "Validate this mock fill against the current Ture ticker and quantity before importing.",
        ),
      ],
      next_action: "Validate the mock fill against the current Ture trade.",
    };
  } catch {
    return invalidResult("BUY", "invalid_json", "Invalid JSON", "Paste valid mock fill confirmation JSON.");
  }
}

export function validateMockBrokerFillForTureBuy(input: {
  rawJson: string;
  expectedTicker: string;
  plannedQuantity: number | null;
}): MockBrokerFillImportResult {
  const parsed = parseMockBrokerFillConfirmationJson(input.rawJson);
  return validateMockBrokerFill(parsed, {
    expectedSide: "BUY",
    expectedTicker: input.expectedTicker,
    maxShares: input.plannedQuantity,
    maxSharesLabel: "planned quantity",
  });
}

export function validateMockBrokerFillForTureSell(input: {
  rawJson: string;
  expectedTicker: string;
  openPositionSize: number | null;
}): MockBrokerFillImportResult {
  const parsed = parseMockBrokerFillConfirmationJson(input.rawJson);
  return validateMockBrokerFill(parsed, {
    expectedSide: "SELL",
    expectedTicker: input.expectedTicker,
    maxShares: input.openPositionSize,
    maxSharesLabel: "open position size",
  });
}

export function mapMockFillToBrokerFillConfirmation(
  fill: MockBrokerFillConfirmation,
): BuyBrokerFillImportMapping {
  return {
    brokerOrderStatus: fill.status,
    actualFillPrice: String(fill.actual_price),
    actualShares: String(fill.actual_shares),
    brokerReferenceNote: buildMockReferenceNote(fill, "MOCK BUY FILL"),
    manualMockConfirmation: true,
    brokerPlanMatches: true,
    previewCommission: optionalNumberString((fill as unknown as Record<string, unknown>).commission),
    previewFxFee: optionalNumberString((fill as unknown as Record<string, unknown>).fx_fee),
  };
}

export function mapMockFillToBrokerExitConfirmation(
  fill: MockBrokerFillConfirmation,
): SellBrokerExitImportMapping {
  return {
    exitStatus: fill.status,
    actualExitPrice: String(fill.actual_price),
    actualSoldShares: String(fill.actual_shares),
    brokerReferenceNote: buildMockReferenceNote(fill, "MOCK SELL EXIT"),
    manualMockConfirmation: true,
    brokerOrderMatchesTradePlan: true,
    exitCommission: optionalNumberString((fill as unknown as Record<string, unknown>).exit_commission),
    exitFxFee: optionalNumberString((fill as unknown as Record<string, unknown>).exit_fx_fee),
  };
}

function validateMockBrokerFill(
  parsed: MockBrokerFillImportResult,
  context: {
    expectedSide: MockBrokerFillImportSide;
    expectedTicker: string;
    maxShares: number | null;
    maxSharesLabel: string;
  },
): MockBrokerFillImportResult {
  if (!parsed.fill) {
    return parsed;
  }

  const fill = parsed.fill;
  const blockers: MockBrokerFillImportBlocker[] = [];
  const warnings: MockBrokerFillImportWarning[] = [];

  if (fill.source !== "mock_broker_dry_run") {
    blockers.push(
      blocker(
        "source_not_mock_broker_dry_run",
        "Source is not mock broker dry run",
        "Only local mock broker fill JSON can be imported here.",
      ),
    );
  }

  if (fill.broker !== "MOCK_BROKER") {
    blockers.push(
      blocker(
        "broker_not_mock_broker",
        "Broker is not MOCK_BROKER",
        "Mock import only accepts MOCK_BROKER confirmations.",
      ),
    );
  }

  if (fill.no_real_broker_order_submitted !== true) {
    blockers.push(
      blocker(
        "missing_no_real_order_flag",
        "Missing no-real-order flag",
        "Mock fill JSON must explicitly state that no real broker order was submitted.",
      ),
    );
  }

  if (fill.manually_confirmed_mock_order !== true) {
    blockers.push(
      blocker(
        "missing_manual_mock_confirmation",
        "Missing manual mock confirmation",
        "The mock confirmation must have been manually clicked in the local mock broker.",
      ),
    );
  }

  if (fill.status !== "filled" && fill.status !== "partially_filled") {
    blockers.push(
      blocker(
        "status_not_filled",
        "Status is not filled",
        "Mock fill status must be filled or partially_filled.",
      ),
    );
  }

  if (fill.side !== context.expectedSide) {
    blockers.push(
      blocker(
        "side_mismatch",
        "Side mismatch",
        `Expected ${context.expectedSide}, received ${fill.side}.`,
      ),
    );
  }

  if (normalizeTicker(fill.ticker) !== normalizeTicker(context.expectedTicker)) {
    blockers.push(
      blocker(
        "ticker_mismatch",
        "Ticker mismatch",
        `Expected ${context.expectedTicker}, received ${fill.ticker}.`,
      ),
    );
  }

  if (!Number.isFinite(fill.actual_price) || fill.actual_price <= 0) {
    blockers.push(
      blocker("invalid_price", "Invalid price", "Actual mock fill price must be greater than zero."),
    );
  }

  if (!Number.isFinite(fill.actual_shares) || fill.actual_shares <= 0) {
    blockers.push(
      blocker("invalid_shares", "Invalid shares", "Actual mock shares must be greater than zero."),
    );
  }

  if (!fill.broker_reference?.trim()) {
    warnings.push(
      warning(
        "missing_broker_reference",
        "Missing broker reference",
        "Mock import can continue, but a mock reference/note is recommended.",
      ),
    );
  }

  if (
    context.maxShares !== null &&
    Number.isFinite(context.maxShares) &&
    fill.actual_shares > context.maxShares
  ) {
    blockers.push(
      blocker(
        "shares_exceed_ture_quantity",
        "Shares exceed Ture quantity",
        `Mock shares cannot exceed ${context.maxSharesLabel}.`,
      ),
    );
  }

  if (
    context.maxShares !== null &&
    Number.isFinite(context.maxShares) &&
    fill.actual_shares < context.maxShares
  ) {
    warnings.push(
      warning(
        "partial_mock_fill",
        "Partial mock fill",
        "Partial mock fills are importable, but require human review before creating or closing in Ture.",
      ),
    );
  }

  if (fill.avanza_not_contacted !== true) {
    warnings.push(
      warning(
        "missing_avanza_not_contacted_flag",
        "Missing Avanza-not-contacted flag",
        "The import remains mock-only, but the JSON should state that Avanza was not contacted.",
      ),
    );
  }

  const status =
    blockers.length > 0
      ? "blocked"
      : warnings.length > 0
        ? "needs_review"
        : "ready";

  return {
    side: context.expectedSide,
    status,
    fill,
    field_mappings: buildFieldMappings(fill, context.expectedSide),
    blockers,
    warnings,
    next_action:
      status === "blocked"
        ? "Resolve blockers before importing mock fill data."
        : status === "needs_review"
          ? "Review warnings, then import if this mock fill matches the Ture trade."
          : "Import mock fill data into the existing Ture confirmation fields.",
  };
}

function normalizeMockBrokerFillConfirmation(
  value: unknown,
): MockBrokerFillConfirmation | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const side = raw.side === "SELL" ? "SELL" : raw.side === "BUY" ? "BUY" : null;
  const status =
    raw.status === "filled" || raw.status === "partially_filled"
      ? raw.status
      : null;
  const actualPrice = finitePositiveNumber(raw.actual_price);
  const actualShares = finitePositiveNumber(raw.actual_shares);

  if (!side || !status || actualPrice === null || actualShares === null) {
    return null;
  }

  return {
    confirmation_id: nullableString(raw.confirmation_id) ?? "mock-fill-import",
    confirmation_version: "1.0",
    source:
      raw.source === "mock_broker_dry_run"
        ? "mock_broker_dry_run"
        : null,
    broker:
      raw.broker === "MOCK_BROKER"
        ? "MOCK_BROKER"
        : null,
    status,
    side,
    ticker: nullableString(raw.ticker) ?? "",
    actual_price: actualPrice,
    actual_shares: actualShares,
    requested_shares: finitePositiveNumber(raw.requested_shares) ?? actualShares,
    broker_reference: nullableString(raw.broker_reference) ?? "",
    confirmed_at: nullableString(raw.confirmed_at) ?? new Date().toISOString(),
    manually_confirmed_mock_order: raw.manually_confirmed_mock_order === true,
    no_real_broker_order_submitted: raw.no_real_broker_order_submitted === true,
    avanza_not_contacted: raw.avanza_not_contacted === true,
    human_final_avanza_confirmation_required_in_real_flow:
      raw.human_final_avanza_confirmation_required_in_real_flow === true,
    handoff_session_id: nullableString(raw.handoff_session_id),
    payload_id: nullableString(raw.payload_id),
    payload_fingerprint: nullableString(raw.payload_fingerprint),
  } as MockBrokerFillConfirmation;
}

function buildFieldMappings(
  fill: MockBrokerFillConfirmation,
  side: MockBrokerFillImportSide,
): MockBrokerFillImportFieldMapping[] {
  const priceTarget =
    side === "BUY" ? "actual_fill_price" : "actual_exit_price";
  const sharesTarget =
    side === "BUY" ? "actual_filled_shares" : "actual_sold_shares";
  const statusTarget = side === "BUY" ? "broker_order_status" : "exit_status";
  const confirmationTarget =
    side === "BUY"
      ? "manual_mock_buy_confirmation"
      : "manual_mock_sell_confirmation";
  const matchTarget =
    side === "BUY"
      ? "mock_order_matches_ture_trade_plan"
      : "mock_order_matches_ture_position";

  return [
    mapping(statusTarget, fill.status, "status"),
    mapping(priceTarget, fill.actual_price, "actual_price"),
    mapping(sharesTarget, fill.actual_shares, "actual_shares"),
    mapping("broker_reference_note", fill.broker_reference, "broker_reference"),
    mapping(confirmationTarget, true, "manually_confirmed_mock_order"),
    mapping(matchTarget, true, "ticker/side/share validation"),
  ];
}

function mapping(
  target_field: string,
  value: string | number | boolean | null,
  source_path: string,
): MockBrokerFillImportFieldMapping {
  return {
    target_field,
    value,
    source_path,
    status: value === null || value === "" ? "missing" : "mapped",
  };
}

function invalidResult(
  side: MockBrokerFillImportSide,
  id: string,
  label: string,
  message: string,
): MockBrokerFillImportResult {
  return {
    side,
    status: "invalid",
    fill: null,
    field_mappings: [],
    blockers: [blocker(id, label, message)],
    warnings: [],
    next_action: message,
  };
}

function buildMockReferenceNote(
  fill: MockBrokerFillConfirmation,
  prefix: string,
) {
  return [
    `${prefix} - no real broker order submitted`,
    `Reference: ${fill.broker_reference || "MOCK"}`,
    `Confirmed: ${fill.confirmed_at}`,
    "Manual confirmation was performed in the local mock broker only, not Avanza.",
  ].join("\n");
}

function optionalNumberString(value: unknown) {
  const parsed = finitePositiveNumber(value);
  return parsed === null ? "" : String(parsed);
}

function finitePositiveNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeTicker(value: string) {
  return value.trim().toUpperCase();
}

function blocker(
  id: string,
  label: string,
  message: string,
): MockBrokerFillImportBlocker {
  return { id, label, message };
}

function warning(
  id: string,
  label: string,
  message: string,
): MockBrokerFillImportWarning {
  return { id, label, message };
}
