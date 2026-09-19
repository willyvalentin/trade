import { expect, test } from "@playwright/test";

import {
  buildMarketWideSymbolMaster,
  marketWideSymbolMasterPolicyVersion,
} from "@/lib/market-wide-symbol-master";

const fetchedAt = "2026-09-15T14:00:00.000Z";

function completeCatalog(response: unknown) {
  const records =
    typeof response === "object" &&
    response !== null &&
    Array.isArray((response as { data?: unknown }).data)
      ? (response as { data: unknown[] }).data
      : null;
  const totalPages = records && records.length > 1 ? 2 : 1;
  const firstPageRecordCount =
    totalPages === 2 ? Math.ceil((records?.length ?? 0) / 2) : records?.length ?? 0;
  const pages =
    records === null
      ? []
      : Array.from({ length: totalPages }, (_, index) => ({
          page_number: index + 1,
          provider_catalog_count: records.length,
          provider_snapshot_id: "twelve-data-catalog-snapshot-2026-09-15T14:00:00.000Z",
          response: {
            data: records.slice(
              index * firstPageRecordCount,
              (index + 1) * firstPageRecordCount,
            ),
          },
        }));

  return buildMarketWideSymbolMaster({
    provider: "twelve_data",
    fetched_at: fetchedAt,
    response,
    provider_catalog_count: records?.length ?? null,
    pages,
    pagination: {
      first_page: 1,
      last_page: totalPages,
      pages_fetched: totalPages,
      total_pages: totalPages,
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
      coverage: {
        provider_catalog_count: 4,
        observed_record_count: 4,
        observed_record_count_matches_denominator: true,
      },
      page_lineage: {
        source: "page_responses",
        observed_page_count: 2,
        observed_page_numbers: [1, 2],
        page_responses_valid: true,
        denominator_consistent: true,
        contiguous_from_first_page: true,
      },
      snapshot_lineage: {
        source: "page_responses",
        observed_page_snapshot_count: 2,
        all_page_snapshot_ids_observed: true,
        consistent_across_pages: true,
        provider_snapshot_id:
          "twelve-data-catalog-snapshot-2026-09-15T14:00:00.000Z",
      },
    });
    expect(result.eligible_entries).toEqual([
      expect.objectContaining({
        symbol: "AAPL",
        provider_access: "Global",
        source_page_number: 1,
        source_page_record_index: 0,
        source_record_index: 0,
      }),
      expect.objectContaining({
        symbol: "BRK.B",
        mic_code: "XNAS",
        source_page_number: 1,
        source_page_record_index: 1,
        source_record_index: 1,
      }),
    ]);
  });

  test("fails closed when pagination cannot prove catalog completeness", () => {
    const result = buildMarketWideSymbolMaster({
      provider: "twelve_data",
      fetched_at: fetchedAt,
      response: { data: [stock("AAPL")] },
      provider_catalog_count: 1,
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
      blockers: expect.arrayContaining(["catalog_collection_not_complete"]),
    });
  });

  test("does not treat aggregate counters as raw pagination evidence", () => {
    const result = buildMarketWideSymbolMaster({
      provider: "twelve_data",
      fetched_at: fetchedAt,
      response: { data: [stock("AAPL"), stock("MSFT")] },
      provider_catalog_count: 2,
      pagination: {
        first_page: 1,
        last_page: 2,
        pages_fetched: 2,
        total_pages: 2,
        has_next_page: false,
      },
    });

    expect(result.summary).toMatchObject({
      status: "partial",
      collection_complete: false,
      discovery_feed_allowed: false,
      page_lineage: {
        source: "aggregate_response",
        page_responses_valid: false,
        contiguous_from_first_page: false,
      },
      blockers: expect.arrayContaining(["catalog_page_lineage_missing"]),
    });
  });

  test("fails closed for duplicate or denominator-conflicting raw page lineage", () => {
    const duplicatePage = buildMarketWideSymbolMaster({
      provider: "twelve_data",
      fetched_at: fetchedAt,
      provider_catalog_count: 2,
      pages: [
        {
          page_number: 1,
          provider_catalog_count: 2,
          response: { data: [stock("AAPL")] },
        },
        {
          page_number: 1,
          provider_catalog_count: 2,
          response: { data: [stock("MSFT")] },
        },
      ],
      pagination: {
        first_page: 1,
        last_page: 2,
        pages_fetched: 2,
        total_pages: 2,
        has_next_page: false,
      },
    });
    const conflictingDenominator = buildMarketWideSymbolMaster({
      provider: "twelve_data",
      fetched_at: fetchedAt,
      provider_catalog_count: 2,
      pages: [
        {
          page_number: 1,
          provider_catalog_count: 2,
          response: { data: [stock("AAPL")] },
        },
        {
          page_number: 2,
          provider_catalog_count: 3,
          response: { data: [stock("MSFT")] },
        },
      ],
      pagination: {
        first_page: 1,
        last_page: 2,
        pages_fetched: 2,
        total_pages: 2,
        has_next_page: false,
      },
    });

    expect(duplicatePage.summary).toMatchObject({
      collection_complete: false,
      discovery_feed_allowed: false,
      page_lineage: { contiguous_from_first_page: false },
      blockers: expect.arrayContaining(["catalog_page_lineage_not_contiguous"]),
    });
    expect(conflictingDenominator.summary).toMatchObject({
      collection_complete: false,
      discovery_feed_allowed: false,
      page_lineage: { denominator_consistent: false },
      blockers: expect.arrayContaining(["catalog_page_denominator_inconsistent"]),
    });
  });

  test("requires one provider-reported source snapshot identity across every page", () => {
    const missingIdentity = buildMarketWideSymbolMaster({
      provider: "twelve_data",
      fetched_at: fetchedAt,
      provider_catalog_count: 2,
      pages: [
        {
          page_number: 1,
          provider_catalog_count: 2,
          response: { data: [stock("AAPL")] },
        },
        {
          page_number: 2,
          provider_catalog_count: 2,
          response: { data: [stock("MSFT")] },
        },
      ],
      pagination: {
        first_page: 1,
        last_page: 2,
        pages_fetched: 2,
        total_pages: 2,
        has_next_page: false,
      },
    });
    const mixedIdentity = buildMarketWideSymbolMaster({
      provider: "twelve_data",
      fetched_at: fetchedAt,
      provider_catalog_count: 2,
      pages: [
        {
          page_number: 1,
          provider_catalog_count: 2,
          provider_snapshot_id: "provider-snapshot-a",
          response: { data: [stock("AAPL")] },
        },
        {
          page_number: 2,
          provider_catalog_count: 2,
          provider_snapshot_id: "provider-snapshot-b",
          response: { data: [stock("MSFT")] },
        },
      ],
      pagination: {
        first_page: 1,
        last_page: 2,
        pages_fetched: 2,
        total_pages: 2,
        has_next_page: false,
      },
    });

    expect(missingIdentity.summary).toMatchObject({
      status: "partial",
      collection_complete: false,
      discovery_feed_allowed: false,
      snapshot_lineage: {
        observed_page_snapshot_count: 0,
        all_page_snapshot_ids_observed: false,
        consistent_across_pages: false,
        provider_snapshot_id: null,
      },
      blockers: expect.arrayContaining(["catalog_page_snapshot_identity_missing"]),
    });
    expect(mixedIdentity.summary).toMatchObject({
      status: "partial",
      collection_complete: false,
      discovery_feed_allowed: false,
      snapshot_lineage: {
        observed_page_snapshot_count: 2,
        all_page_snapshot_ids_observed: true,
        consistent_across_pages: false,
        provider_snapshot_id: null,
      },
      blockers: expect.arrayContaining([
        "catalog_page_snapshot_identity_inconsistent",
      ]),
    });
  });

  test("fails closed for a malformed supplied page instead of throwing or using an aggregate fallback", () => {
    const result = buildMarketWideSymbolMaster({
      provider: "twelve_data",
      fetched_at: fetchedAt,
      response: { data: [stock("AAPL")] },
      provider_catalog_count: 1,
      pages: [null] as unknown as Array<{
        page_number: unknown;
        provider_catalog_count: unknown;
        response: unknown;
      }>,
      pagination: {
        first_page: 1,
        last_page: 1,
        pages_fetched: 1,
        total_pages: 1,
        has_next_page: false,
      },
    });

    expect(result.summary).toMatchObject({
      status: "invalid",
      collection_complete: false,
      discovery_feed_allowed: false,
      total_source_records: 0,
      page_lineage: {
        source: "page_responses",
        page_responses_valid: false,
      },
      blockers: expect.arrayContaining([
        "catalog_response_data_missing",
        "catalog_page_lineage_invalid",
      ]),
    });
  });

  test("fails closed when the provider does not supply a catalog denominator", () => {
    const result = buildMarketWideSymbolMaster({
      provider: "twelve_data",
      fetched_at: fetchedAt,
      response: { data: [stock("AAPL")] },
      pagination: {
        first_page: 1,
        last_page: 1,
        pages_fetched: 1,
        total_pages: 1,
        has_next_page: false,
      },
    });

    expect(result.summary).toMatchObject({
      status: "partial",
      collection_complete: false,
      discovery_feed_allowed: false,
      coverage: {
        provider_catalog_count: null,
        observed_record_count: 1,
        observed_record_count_matches_denominator: false,
      },
      blockers: expect.arrayContaining([
        "catalog_coverage_denominator_missing",
        "catalog_collection_not_complete",
      ]),
    });
  });

  test("fails closed when collected records do not match the provider denominator", () => {
    const result = buildMarketWideSymbolMaster({
      provider: "twelve_data",
      fetched_at: fetchedAt,
      response: { data: [stock("AAPL"), stock("MSFT")] },
      provider_catalog_count: 3,
      pagination: {
        first_page: 1,
        last_page: 1,
        pages_fetched: 1,
        total_pages: 1,
        has_next_page: false,
      },
    });

    expect(result.summary).toMatchObject({
      status: "partial",
      collection_complete: false,
      discovery_feed_allowed: false,
      coverage: {
        provider_catalog_count: 3,
        observed_record_count: 2,
        observed_record_count_matches_denominator: false,
      },
      blockers: expect.arrayContaining([
        "catalog_coverage_denominator_mismatch",
        "catalog_collection_not_complete",
      ]),
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
