export const marketWideSymbolMasterPolicyVersion =
  "us_equity_symbol_master_contract_v2" as const;

export type MarketWideSymbolMasterStatus =
  | "complete"
  | "partial"
  | "invalid";

export type MarketWideSymbolMasterRejectionReason =
  | "missing_symbol"
  | "invalid_symbol"
  | "missing_name"
  | "not_us_equity"
  | "not_common_stock"
  | "not_usd"
  | "missing_exchange"
  | "missing_mic_code"
  | "duplicate_symbol";

export type MarketWideSymbolMasterPagination = {
  first_page: number | null;
  last_page: number | null;
  pages_fetched: number | null;
  total_pages: number | null;
  has_next_page: boolean | null;
};

export type MarketWideSymbolMasterInput = {
  provider: "twelve_data";
  fetched_at: Date | string | null | undefined;
  response: unknown;
  provider_catalog_count?: unknown;
  pagination?: Partial<MarketWideSymbolMasterPagination> | null;
};

export type MarketWideSymbolMasterEntry = {
  symbol: string;
  name: string;
  currency: "USD";
  exchange: string;
  mic_code: string;
  country: "United States";
  instrument_type: "Common Stock";
  provider_access: string | null;
  source_record_index: number;
};

export type MarketWideSymbolMasterRejection = {
  source_record_index: number;
  symbol: string | null;
  reasons: MarketWideSymbolMasterRejectionReason[];
};

export type MarketWideSymbolMasterSummary = {
  summary_version: "2.0";
  summary_kind: "market_wide_symbol_master";
  policy_version: typeof marketWideSymbolMasterPolicyVersion;
  provider: "twelve_data";
  fetched_at: string | null;
  coverage: {
    provider_catalog_count: number | null;
    observed_record_count: number;
    observed_record_count_matches_denominator: boolean;
  };
  status: MarketWideSymbolMasterStatus;
  collection_complete: boolean;
  discovery_feed_allowed: boolean;
  total_source_records: number;
  eligible_record_count: number;
  rejected_record_count: number;
  rejected_by_reason: Record<MarketWideSymbolMasterRejectionReason, number>;
  pagination: MarketWideSymbolMasterPagination;
  blockers: string[];
  gaps: string[];
};

export type MarketWideSymbolMasterResult = {
  summary: MarketWideSymbolMasterSummary;
  eligible_entries: MarketWideSymbolMasterEntry[];
  rejected_entries: MarketWideSymbolMasterRejection[];
};

type SymbolMasterProviderRecord = {
  symbol?: unknown;
  name?: unknown;
  currency?: unknown;
  exchange?: unknown;
  mic_code?: unknown;
  country?: unknown;
  type?: unknown;
  access?: unknown;
};

const rejectionReasons: MarketWideSymbolMasterRejectionReason[] = [
  "missing_symbol",
  "invalid_symbol",
  "missing_name",
  "not_us_equity",
  "not_common_stock",
  "not_usd",
  "missing_exchange",
  "missing_mic_code",
  "duplicate_symbol",
];

// Twelve Data symbols can contain class separators such as BRK.B. This is an
// identifier sanity check, not a claim that the identifier is tradeable.
const validSymbol = /^[A-Z0-9][A-Z0-9._-]{0,19}$/;

export function buildMarketWideSymbolMaster(
  input: MarketWideSymbolMasterInput,
): MarketWideSymbolMasterResult {
  const fetchedAt = toIso(input.fetched_at);
  const pagination = normalizePagination(input.pagination);
  const sourceRecords = responseRecords(input.response);
  const records = sourceRecords ?? [];
  const providerCatalogCount = nonNegativeInteger(input.provider_catalog_count);
  const observedRecordCountMatchesDenominator =
    providerCatalogCount !== null &&
    sourceRecords !== null &&
    providerCatalogCount === records.length;
  const rejections: MarketWideSymbolMasterRejection[] = [];
  const eligibleEntries: MarketWideSymbolMasterEntry[] = [];
  const symbolCounts = new Map<string, number>();

  for (const rawRecord of records) {
    const record = isRecord(rawRecord) ? (rawRecord as SymbolMasterProviderRecord) : {};
    const symbol = normalizeSymbol(record.symbol);

    if (symbol) symbolCounts.set(symbol, (symbolCounts.get(symbol) ?? 0) + 1);
  }

  for (const [index, rawRecord] of records.entries()) {
    const record = isRecord(rawRecord) ? (rawRecord as SymbolMasterProviderRecord) : {};
    const symbol = normalizeSymbol(record.symbol);
    const reasons = entryRejectionReasons(record, symbol);

    if (symbol && (symbolCounts.get(symbol) ?? 0) > 1) {
      reasons.push("duplicate_symbol");
    }

    if (reasons.length > 0) {
      rejections.push({
        source_record_index: index,
        symbol,
        reasons,
      });
      continue;
    }

    eligibleEntries.push({
      symbol: symbol!,
      name: normalizedText(record.name)!,
      currency: "USD",
      exchange: normalizedText(record.exchange)!,
      mic_code: normalizedText(record.mic_code)!,
      country: "United States",
      instrument_type: "Common Stock",
      provider_access: normalizedText(record.access),
      source_record_index: index,
    });
  }

  const collectionComplete = isCompleteCollection({
    pagination,
    fetchedAt,
    records: sourceRecords,
    observedRecordCountMatchesDenominator,
  });
  const status = collectionStatus({
    records: sourceRecords,
    fetchedAt,
    collectionComplete,
  });
  const blockers: string[] = [];
  const gaps: string[] = [];

  if (!fetchedAt) blockers.push("catalog_fetched_at_invalid");
  if (!sourceRecords) blockers.push("catalog_response_data_missing");
  if (providerCatalogCount === null) {
    blockers.push("catalog_coverage_denominator_missing");
    gaps.push(
      "A complete symbol catalog requires the provider's scoped record-count denominator.",
    );
  } else if (sourceRecords && !observedRecordCountMatchesDenominator) {
    blockers.push("catalog_coverage_denominator_mismatch");
    gaps.push(
      "Collected raw catalog records do not match the provider's scoped record-count denominator.",
    );
  }
  if (status !== "complete") {
    blockers.push("catalog_collection_not_complete");
    gaps.push(
      "A partial or invalid symbol catalog must not expand the discovery universe.",
    );
  }

  if (eligibleEntries.length === 0 && sourceRecords) {
    blockers.push("catalog_has_no_eligible_us_common_stock_entries");
  }

  const rejectedByReason = Object.fromEntries(
    rejectionReasons.map((reason) => [reason, 0]),
  ) as Record<MarketWideSymbolMasterRejectionReason, number>;

  for (const rejection of rejections) {
    for (const reason of rejection.reasons) rejectedByReason[reason] += 1;
  }

  return {
    summary: {
      summary_version: "2.0",
      summary_kind: "market_wide_symbol_master",
      policy_version: marketWideSymbolMasterPolicyVersion,
      provider: input.provider,
      fetched_at: fetchedAt,
      coverage: {
        provider_catalog_count: providerCatalogCount,
        observed_record_count: records.length,
        observed_record_count_matches_denominator:
          observedRecordCountMatchesDenominator,
      },
      status,
      collection_complete: collectionComplete,
      discovery_feed_allowed:
        status === "complete" && eligibleEntries.length > 0,
      total_source_records: records.length,
      eligible_record_count: eligibleEntries.length,
      rejected_record_count: rejections.length,
      rejected_by_reason: rejectedByReason,
      pagination,
      blockers,
      gaps,
    },
    eligible_entries: eligibleEntries,
    rejected_entries: rejections.sort(
      (left, right) => left.source_record_index - right.source_record_index,
    ),
  };
}

function responseRecords(response: unknown): unknown[] | null {
  if (Array.isArray(response)) return response;
  if (!isRecord(response) || !Array.isArray(response.data)) return null;
  return response.data;
}

function entryRejectionReasons(
  record: SymbolMasterProviderRecord,
  symbol: string | null,
): MarketWideSymbolMasterRejectionReason[] {
  const reasons: MarketWideSymbolMasterRejectionReason[] = [];

  if (!symbol) {
    reasons.push(
      normalizedText(record.symbol) ? "invalid_symbol" : "missing_symbol",
    );
  }
  if (!normalizedText(record.name)) reasons.push("missing_name");
  if (!isUnitedStates(record.country)) reasons.push("not_us_equity");
  if (!isCommonStock(record.type)) reasons.push("not_common_stock");
  if (normalizedText(record.currency)?.toUpperCase() !== "USD") {
    reasons.push("not_usd");
  }
  if (!normalizedText(record.exchange)) reasons.push("missing_exchange");
  if (!normalizedText(record.mic_code)) reasons.push("missing_mic_code");

  return reasons;
}

function normalizePagination(
  pagination: MarketWideSymbolMasterInput["pagination"],
): MarketWideSymbolMasterPagination {
  return {
    first_page: pageNumber(pagination?.first_page),
    last_page: pageNumber(pagination?.last_page),
    pages_fetched: pageNumber(pagination?.pages_fetched),
    total_pages: pageNumber(pagination?.total_pages),
    has_next_page:
      typeof pagination?.has_next_page === "boolean"
        ? pagination.has_next_page
        : null,
  };
}

function isCompleteCollection({
  pagination,
  fetchedAt,
  records,
  observedRecordCountMatchesDenominator,
}: {
  pagination: MarketWideSymbolMasterPagination;
  fetchedAt: string | null;
  records: unknown[] | null;
  observedRecordCountMatchesDenominator: boolean;
}) {
  if (!fetchedAt || !records || records.length === 0) return false;

  return (
    observedRecordCountMatchesDenominator &&
    pagination.first_page === 1 &&
    pagination.last_page !== null &&
    pagination.pages_fetched !== null &&
    pagination.total_pages !== null &&
    pagination.has_next_page === false &&
    pagination.last_page === pagination.total_pages &&
    pagination.pages_fetched === pagination.total_pages
  );
}

function collectionStatus({
  records,
  fetchedAt,
  collectionComplete,
}: {
  records: unknown[] | null;
  fetchedAt: string | null;
  collectionComplete: boolean;
}): MarketWideSymbolMasterStatus {
  if (!records || !fetchedAt) return "invalid";
  return collectionComplete ? "complete" : "partial";
}

function normalizeSymbol(value: unknown) {
  const normalized = normalizedText(value)?.toUpperCase() ?? null;
  return normalized && validSymbol.test(normalized) ? normalized : null;
}

function normalizedText(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function isUnitedStates(value: unknown) {
  const normalized = normalizedText(value)?.toLowerCase();
  return (
    normalized === "united states" || normalized === "us" || normalized === "usa"
  );
}

function isCommonStock(value: unknown) {
  return normalizedText(value)?.toLowerCase() === "common stock";
}

function pageNumber(value: unknown) {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    Number.isSafeInteger(value) &&
    value > 0
    ? value
    : null;
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
    ? value
    : null;
}

function toIso(value: Date | string | null | undefined) {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" && value.trim().length > 0
        ? new Date(value)
        : null;

  return date && Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
