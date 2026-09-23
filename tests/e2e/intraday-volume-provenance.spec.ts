import { expect, test } from "@playwright/test";

import {
  admissibleRecentIntradayVolumeRatio,
  calculateIntradayIndicators,
  volumeTrendFromRecentVolumeRatio,
} from "../../lib/intraday-indicators";
import type { IntradayCandle } from "../../lib/market-data";

function candles(volumes: number[], intervalMinutes = 5): IntradayCandle[] {
  return volumes.map((volume, index) => ({
    timestamp: Date.UTC(2026, 8, 23, 13, 30 + index * intervalMinutes) / 1000,
    open: 100,
    high: 101,
    low: 99,
    close: 100,
    volume,
  }));
}

function observedIndicators(
  volumes: number[],
  observedAtSeconds?: number,
  interval: "5min" | "15min" = "5min",
) {
  const intervalSeconds = interval === "5min" ? 5 * 60 : 15 * 60;
  const bars = candles(volumes, intervalSeconds / 60);
  return calculateIntradayIndicators(
    bars,
    {
      interval,
      observedAtSeconds:
        observedAtSeconds ?? bars[bars.length - 1].timestamp + intervalSeconds,
    },
  );
}

test("recent intraday volume compares two complete same-session windows", () => {
  const observed = observedIndicators([
    ...Array(12).fill(100),
    ...Array(12).fill(200),
  ]);

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
  const earlySession = observedIndicators([
    ...Array(11).fill(100),
    ...Array(12).fill(200),
  ]);
  const missingVolume = observedIndicators([
    ...Array(12).fill(100),
    ...Array(11).fill(200),
    0,
  ]);
  const hiddenGap = observedIndicators([
    ...Array(12).fill(100),
    0,
    ...Array(12).fill(200),
  ]);

  expect(earlySession.recentVolumeRatio).toBeNull();
  expect(earlySession.volumeTrend).toBe("unknown");
  expect(missingVolume.recentVolumeRatio).toBeNull();
  expect(missingVolume.volumeTrend).toBe("unknown");
  expect(hiddenGap.recentVolumeRatio).toBeNull();
  expect(hiddenGap.volumeTrend).toBe("unknown");
});

test("a rounded borderline ratio does not become a false expansion", () => {
  const nearThreshold = observedIndicators([
    ...Array(12).fill(10_000),
    ...Array(12).fill(11_499),
  ]);

  expect(nearThreshold.recentVolumeRatio).toBeCloseTo(1.1499);
  expect(nearThreshold.volumeTrend).toBe("flat");
});

test("an open bar cannot complete or distort the volume windows", () => {
  const volumes = [...Array(12).fill(100), ...Array(12).fill(200)];
  const openingTime = candles(volumes).at(-1)!.timestamp;
  const incomplete = observedIndicators(volumes, openingTime + 60);
  const openSpike = observedIndicators([...volumes, 99_999], openingTime + 6 * 60);

  expect(incomplete.recentVolumeRatio).toBeNull();
  expect(incomplete.volumeTrend).toBe("unknown");
  expect(openSpike.recentVolumeRatio).toBe(2);
  expect(openSpike.volumeTrend).toBe("expanding");
});

test("a 15-minute volume window waits for its final bar to close", () => {
  const volumes = [...Array(12).fill(100), ...Array(12).fill(200)];
  const finalOpen = candles(volumes, 15).at(-1)!.timestamp;

  expect(
    observedIndicators(volumes, finalOpen + 14 * 60, "15min")
      .recentVolumeRatio,
  ).toBeNull();
  expect(
    observedIndicators(volumes, finalOpen + 15 * 60, "15min")
      .recentVolumeRatio,
  ).toBe(2);
});
