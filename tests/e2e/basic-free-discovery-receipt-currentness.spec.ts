import { expect, test } from "@playwright/test";

import { basicFreeDiscoveryReceiptCurrentness } from "@/lib/basic-free-discovery-receipt-currentness";

test("a same-day Basic Free receipt is labelled as a current-day reference only", () => {
  expect(
    basicFreeDiscoveryReceiptCurrentness({
      receiptAvailable: true,
      receiptTradingDate: "2026-09-18",
      currentTradingDate: "2026-09-18",
    }),
  ).toEqual({
    state: "current_trading_day",
    receipt_trading_date: "2026-09-18",
  });
});

test("an earlier Basic Free receipt is never presented as current-market information", () => {
  expect(
    basicFreeDiscoveryReceiptCurrentness({
      receiptAvailable: true,
      receiptTradingDate: "2026-09-17",
      currentTradingDate: "2026-09-18",
    }),
  ).toEqual({
    state: "historical_reference",
    receipt_trading_date: "2026-09-17",
  });
});

test("a missing or invalid receipt date fails closed into an undated reference state", () => {
  expect(
    basicFreeDiscoveryReceiptCurrentness({
      receiptAvailable: true,
      receiptTradingDate: null,
      currentTradingDate: "2026-09-18",
    }),
  ).toEqual({
    state: "undated_reference",
    receipt_trading_date: null,
  });
  expect(
    basicFreeDiscoveryReceiptCurrentness({
      receiptAvailable: true,
      receiptTradingDate: "2026-02-30",
      currentTradingDate: "2026-09-18",
    }),
  ).toEqual({
    state: "undated_reference",
    receipt_trading_date: null,
  });
  expect(
    basicFreeDiscoveryReceiptCurrentness({
      receiptAvailable: false,
      receiptTradingDate: "2026-09-18",
      currentTradingDate: "2026-09-18",
    }),
  ).toEqual({
    state: "unavailable",
    receipt_trading_date: null,
  });
});
