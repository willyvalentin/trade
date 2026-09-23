import { expect, test } from "@playwright/test";

import {
  admissibleRecentIntradayVolumeRatio,
  calculateIntradayIndicators,
  volumeTrendFromRecentVolumeRatio,
} from "../../lib/intraday-indicators";
import type { IntradayCandle } from "../../lib/market-data";

function candles(volumes: number[]): IntradayCandle[] {
  return volumes.map((volume, index) => ({
    timestamp: Date.UTC(2026, 8, 23, 13, 30 + index * 5) / 1000,
    open: 100,
    high: 101,
    low: 99,
    close: 100,
    volume,
  }));
}

test("recent intraday volume compares two complete same-session windows", () => {
  const observed = calculateIntradayIndicators(
    candles([...Array(12).fill(100), ...Array(12).fill(200)]),
  );

  expect(observed.recentVolumeRatio).toBe(2);
  expect(observed.volumeTrend).toBe("expanding");
  expect(admissibleRecentIntradayVolumeRatio(observed, false)).toBe(2);
  expect(admissibleRecentIntradayVolumeRatio(observed, true)).toBeNull();
  expect(admissibleRecentIntradayVolumeRatio({}, false)).toBeNull();
  expect(
    admissibleRecentIntradayVolumeRatio(
      { recentVolumeRatio: Number.NaN },
      false,
    ),
  ).toBeNull();
  expect(volumeTrendFromRecentVolumeRatio(null)).toBe("unknown");
  expect(volumeTrendFromRecentVolumeRatio(2)).toBe("expanding");
});

test("an incomplete intraday denominator stays unavailable", () => {
  const earlySession = calculateIntradayIndicators(
    candles([...Array(11).fill(100), ...Array(12).fill(200)]),
  );
  const missingVolume = calculateIntradayIndicators(
    candles([...Array(12).fill(100), ...Array(11).fill(200), 0]),
  );
  const hiddenGap = calculateIntradayIndicators(
    candles([...Array(12).fill(100), 0, ...Array(12).fill(200)]),
  );

  expect(earlySession.recentVolumeRatio).toBeNull();
  expect(earlySession.volumeTrend).toBe("unknown");
  expect(missingVolume.recentVolumeRatio).toBeNull();
  expect(missingVolume.volumeTrend).toBe("unknown");
  expect(hiddenGap.recentVolumeRatio).toBeNull();
  expect(hiddenGap.volumeTrend).toBe("unknown");
});

test("a rounded borderline ratio does not become a false expansion", () => {
  const nearThreshold = calculateIntradayIndicators(
    candles([...Array(12).fill(10_000), ...Array(12).fill(11_499)]),
  );

  expect(nearThreshold.recentVolumeRatio).toBeCloseTo(1.1499);
  expect(nearThreshold.volumeTrend).toBe("flat");
});
