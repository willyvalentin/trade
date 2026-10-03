import { expect, test } from "@playwright/test";
import { originalOutcomeSourceWindow } from "@/lib/original-outcome-source-window";

test("bounded original recovery spans a weekend without changing the original date", () => {
  expect(originalOutcomeSourceWindow(new Date("2026-10-05T17:30:20Z"))).toEqual({
    policy_version: "trailing_seven_ny_dates_v1", from_trading_date: "2026-09-29", through_trading_date: "2026-10-05",
    ordering: "oldest_original_first", older_sources: "outside_bounded_recovery_not_proven_complete",
  });
});
test("original recovery uses New York dates, including year and DST boundaries", () => {
  expect(originalOutcomeSourceWindow(new Date("2026-01-01T03:00:00Z"))).toMatchObject({
    from_trading_date: "2025-12-25", through_trading_date: "2025-12-31",
  });
  expect(originalOutcomeSourceWindow(new Date("2026-11-02T05:01:00Z"))).toMatchObject({
    from_trading_date: "2026-10-27", through_trading_date: "2026-11-02",
  });
  expect(originalOutcomeSourceWindow(new Date(NaN))).toBeNull();
});
