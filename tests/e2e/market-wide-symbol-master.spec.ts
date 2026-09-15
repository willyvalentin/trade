import { expect, test } from "@playwright/test";

import {
  buildMarketWideSymbolMaster,
  marketWideSymbolMasterPolicyVersion,
} from "@/lib/market-wide-symbol-master";

const fetchedAt = "2026-09-15T14:00:00.000Z";

function completeCatalog(response: unknown) {
  return buildMarketWideSymbolMaster({
    provider: "twelve_data",
    fetched_at: fetchedAt,
    response,
    pagination: {
      first_page: 1,
      last_page: 2,
      pages_fetched: 2,
      total_pages: 2,
      has_next_page: false,
    },
  });
}

function stock(symbol: string, overrides: Record<string, unknown> = {}) {
  return {
    symbol,
    name: `${symbol} Corporation`,
    currency: "USD",
    exchange: "NASDAQ",
    mic_code: "XNAS",
    country: "United States",
    type: "Common Stock",
    access: "Global",
    ...overrides,
  };
}

test.describe("market-wide symbol master contract", () => {
  test("admits only a documented, complete US common-stock catalog", () => {
    const result = completeCatalog({
      data: [
        stock("AAPL"),
        stock("BRK.B", { name: "Berkshire Hathaway Inc. Class B" }),
        stock("SPY", { type: "ETF" }),
        stock("NESN", { country: "Switzerland", currency: "CHF" }),
      ],
    });

    expect(result.summary).toMatchObject({
      policy_version: marketWideSymbolMasterPolicyVersion,
      status: "complete",
      collection_complete: true,
      discovery_feed_allowed: true,
      total_source_records: 4,
      eligible_record_count: 2,
      rejected_record_count: 2,
      rejected_by_reason: {
        not_common_stock: 1,
        not_us_equity: 1,
        not_usd: 1,
      },
    });
    expect(result.eligible_entries).toEqual([
      expect.objectContaining({ symbol: "AAPL", provider_access: "Global" }),
      expect.objectContaining({ symbol: "BRK.B", mic_code: "XNAS" }),
    ]);
  });

  test("fails closed when pagination cannot prove catalog completeness", () => {
    const result = buildMarketWideSymbolMaster({
      provider: "twelve_data",
      fetched_at: fetchedAt,
      response: { data: [stock("AAPL")] },
      pagination: {
        first_page: 1,
        last_page: 1,
        pages_fetched: 1,
        total_pages: 2,
        has_next_page: true,
      },
    });

    expect(result.summary).toMatchObject({
      status: "partial",
      collection_complete: false,
      discovery_feed_allowed: false,
      eligible_record_count: 1,
      blockers: ["catalog_collection_not_complete"],
    });
  });

  test("does not let malformed records or conflicting symbols through", () => {
    const result = completeCatalog({
      data: [
        stock("AAPL"),
        stock("AAPL", { mic_code: "XNYS" }),
        stock(" "),
        stock("TOO/LONG"),
        stock("MSFT", { name: "" }),
        stock("NVDA", { exchange: "" }),
      ],
    });

    expect(result.summary).toMatchObject({
      status: "complete",
      discovery_feed_allowed: false,
      eligible_record_count: 0,
      rejected_record_count: 6,
      rejected_by_reason: {
        duplicate_symbol: 2,
        missing_symbol: 1,
        invalid_symbol: 1,
        missing_name: 1,
        missing_exchange: 1,
      },
      blockers: ["catalog_has_no_eligible_us_common_stock_entries"],
    });
    expect(result.rejected_entries).toEqual([
      expect.objectContaining({ source_record_index: 0, reasons: ["duplicate_symbol"] }),
      expect.objectContaining({ source_record_index: 1, reasons: ["duplicate_symbol"] }),
      expect.objectContaining({ source_record_index: 2, reasons: ["missing_symbol"] }),
      expect.objectContaining({ source_record_index: 3, reasons: ["invalid_symbol"] }),
      expect.objectContaining({ source_record_index: 4, reasons: ["missing_name"] }),
      expect.objectContaining({ source_record_index: 5, reasons: ["missing_exchange"] }),
    ]);
  });

  test("rejects an otherwise eligible ticker when any raw catalog row conflicts", () => {
    const result = completeCatalog({
      data: [
        stock("DUPE"),
        stock("DUPE", {
          country: "Canada",
          currency: "CAD",
          type: "ETF",
        }),
      ],
    });

    expect(result.summary).toMatchObject({
      status: "complete",
      eligible_record_count: 0,
      rejected_by_reason: {
        duplicate_symbol: 2,
        not_us_equity: 1,
        not_common_stock: 1,
        not_usd: 1,
      },
    });
    expect(result.rejected_entries).toEqual([
      expect.objectContaining({
        source_record_index: 0,
        reasons: ["duplicate_symbol"],
      }),
      expect.objectContaining({
        source_record_index: 1,
        reasons: expect.arrayContaining([
          "duplicate_symbol",
          "not_us_equity",
          "not_common_stock",
          "not_usd",
        ]),
      }),
    ]);
  });

  test("treats missing response data or invalid collection time as invalid", () => {
    const result = buildMarketWideSymbolMaster({
      provider: "twelve_data",
      fetched_at: "not-a-date",
      response: { values: [stock("AAPL")] },
    });

    expect(result.summary).toMatchObject({
      status: "invalid",
      discovery_feed_allowed: false,
      total_source_records: 0,
      blockers: expect.arrayContaining([
        "catalog_fetched_at_invalid",
        "catalog_response_data_missing",
        "catalog_collection_not_complete",
      ]),
    });
  });
});
