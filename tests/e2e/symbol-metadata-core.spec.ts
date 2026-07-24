import { expect, test } from "@playwright/test";

import {
  dedupeSymbols,
  isSymbolMetadataStale,
  normalizeLogoUrl,
  normalizeSymbol,
  symbolMetadataFromRow,
} from "../../lib/symbol-metadata-core";

test.describe("symbol metadata core helpers", () => {
  test("normalizes and dedupes ticker symbols", () => {
    expect(normalizeSymbol(" aapl ")).toBe("AAPL");
    expect(normalizeSymbol("$msft")).toBe("MSFT");
    expect(normalizeSymbol("BRK.B")).toBe("BRK.B");
    expect(normalizeSymbol("bad symbol")).toBeNull();
    expect(normalizeSymbol("")).toBeNull();

    expect(dedupeSymbols(["aapl", "AAPL", "$msft", "bad symbol"], 5)).toEqual([
      "AAPL",
      "MSFT",
    ]);
    expect(dedupeSymbols(["a", "b", "c"], 2)).toEqual(["A", "B"]);
  });

  test("only accepts HTTPS logo URLs", () => {
    expect(normalizeLogoUrl("https://static.example.com/logo.png")).toBe(
      "https://static.example.com/logo.png",
    );
    expect(normalizeLogoUrl("http://static.example.com/logo.png")).toBeNull();
    expect(normalizeLogoUrl("/logo.png")).toBeNull();
    expect(normalizeLogoUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeLogoUrl("not a url")).toBeNull();
  });

  test("normalizes database and API rows safely", () => {
    expect(
      symbolMetadataFromRow({
        symbol: "nvda",
        company_name: "NVIDIA Corporation",
        exchange: "NASDAQ",
        logo_url: "https://static.example.com/nvda.svg",
        logo_source: "finnhub",
        logo_updated_at: "2026-07-02T10:00:00.000Z",
      }),
    ).toEqual({
      symbol: "NVDA",
      companyName: "NVIDIA Corporation",
      exchange: "NASDAQ",
      logoUrl: "https://static.example.com/nvda.svg",
      logoSource: "finnhub",
      logoUpdatedAt: "2026-07-02T10:00:00.000Z",
    });

    expect(
      symbolMetadataFromRow({
        symbol: "NVDA",
        logo_url: "http://static.example.com/nvda.svg",
      })?.logoUrl,
    ).toBeNull();
    expect(symbolMetadataFromRow({ symbol: "bad symbol" })).toBeNull();
  });

  test("treats missing, invalid, and old logo timestamps as stale", () => {
    const now = new Date("2026-07-02T12:00:00.000Z");

    expect(isSymbolMetadataStale(null, now)).toBe(true);
    expect(isSymbolMetadataStale({ logoUpdatedAt: null }, now)).toBe(true);
    expect(isSymbolMetadataStale({ logoUpdatedAt: "not a date" }, now)).toBe(true);
    expect(
      isSymbolMetadataStale(
        { logoUpdatedAt: "2026-07-01T12:00:00.000Z" },
        now,
        30,
      ),
    ).toBe(false);
    expect(
      isSymbolMetadataStale(
        { logoUpdatedAt: "2026-05-01T12:00:00.000Z" },
        now,
        30,
      ),
    ).toBe(true);
  });
});
