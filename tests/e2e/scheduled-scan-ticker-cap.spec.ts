import { expect, test } from "@playwright/test";

import { resolveScheduledScanTickerCap } from "@/lib/scheduled-scan-ticker-cap";

test("Basic Free cannot exceed its eight-credit scan cap through an override", () => {
  expect(
    resolveScheduledScanTickerCap({
      requestedCap: 50,
      profileCap: 8,
      planMode: "free",
    }),
  ).toEqual({
    effective_cap: 8,
    plan_cap_applied: true,
  });
});

test("Basic Free may request a smaller scan without masking the request", () => {
  expect(
    resolveScheduledScanTickerCap({
      requestedCap: 3,
      profileCap: 8,
      planMode: "free",
    }),
  ).toEqual({
    effective_cap: 3,
    plan_cap_applied: false,
  });
});

test("paid plan profiles retain their explicitly requested bounded cap", () => {
  expect(
    resolveScheduledScanTickerCap({
      requestedCap: 50,
      profileCap: 25,
      planMode: "grow",
    }),
  ).toEqual({
    effective_cap: 50,
    plan_cap_applied: false,
  });
});
