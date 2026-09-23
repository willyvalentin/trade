import { expect, test } from "@playwright/test";

import {
  admissibleRecentIntradayVolumeRatio,
  calculateIntradayIndicators,
  intradayIndicatorsFromUnknown,
  volumeTrendFromRecentVolumeRatio,
  withAdmissibleCandidateRecentVolume,
} from "../../lib/intraday-indicators";
import type { IntradayCandle } from "../../lib/market-data";
import { getNewYorkRegularSessionWindow } from "../../lib/intraday-scan-window";

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
  const observedAtSeconds = observed.recentVolumeBarClosedAtSeconds!;
  expect(admissibleRecentIntradayVolumeRatio(observed, false, observedAtSeconds)).toBe(2);
  expect(admissibleRecentIntradayVolumeRatio(observed, false, observedAtSeconds + 5 * 60)).toBe(2);
  expect(admissibleRecentIntradayVolumeRatio(observed, false, observedAtSeconds + 5 * 60 + 1)).toBeNull();
  expect(admissibleRecentIntradayVolumeRatio(observed, true)).toBeNull();
  expect(admissibleRecentIntradayVolumeRatio(observed, null)).toBeNull();
  expect(admissibleRecentIntradayVolumeRatio(observed, undefined)).toBeNull();
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

test("candidate consumers cannot reuse an expired, stale, or legacy flat volume ratio", () => {
  const indicators = observedIndicators([
    ...Array(12).fill(100),
    ...Array(12).fill(200),
  ]);
  const observedAtSeconds = indicators.recentVolumeBarClosedAtSeconds! + 60;
  const candidate = {
    recent_volume_ratio: 9.9,
    intraday_indicators: indicators,
    intraday_indicator_stale: false,
  };

  const current = withAdmissibleCandidateRecentVolume(candidate, observedAtSeconds);
  expect(current.recent_volume_ratio).toBe(2);
  expect(current.intraday_indicators?.volumeTrend).toBe("expanding");
  expect(candidate.recent_volume_ratio).toBe(9.9);

  const expired = withAdmissibleCandidateRecentVolume(
    candidate,
    observedAtSeconds + 5 * 60,
  );
  expect(expired.recent_volume_ratio).toBeUndefined();
  expect(expired.intraday_indicators?.recentVolumeRatio).toBeNull();
  expect(expired.intraday_indicators?.volumeTrend).toBe("unknown");

  const stale = withAdmissibleCandidateRecentVolume(
    { ...candidate, intraday_indicator_stale: true },
    observedAtSeconds,
  );
  expect(stale.recent_volume_ratio).toBeUndefined();
  expect(stale.intraday_indicators?.volumeTrend).toBe("unknown");

  const legacy = withAdmissibleCandidateRecentVolume(
    {
      ...candidate,
      intraday_indicators: {
        ...indicators,
        recentVolumeBarClosedAtSeconds: null,
      },
    },
    observedAtSeconds,
  );
  expect(legacy.recent_volume_ratio).toBeUndefined();
  expect(legacy.intraday_indicators?.volumeTrend).toBe("unknown");
});

test("intraday fetch window follows New York daylight and standard time", () => {
  expect(getNewYorkRegularSessionWindow(new Date("2026-09-23T12:00:00Z")))
    .toEqual({
      start: new Date("2026-09-23T13:30:00Z"),
      end: new Date("2026-09-23T20:00:00Z"),
    });
  expect(getNewYorkRegularSessionWindow(new Date("2026-12-23T12:00:00Z")))
    .toEqual({
      start: new Date("2026-12-23T14:30:00Z"),
      end: new Date("2026-12-23T21:00:00Z"),
    });
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

test("old provider bars cannot become fresh volume evidence through a new fetch", () => {
  const volumes = [...Array(12).fill(100), ...Array(12).fill(200)];
  const lastBarClose = candles(volumes).at(-1)!.timestamp + 5 * 60;
  const oldProviderBars = observedIndicators(volumes, lastBarClose + 20 * 60);

  expect(oldProviderBars.recentVolumeRatio).toBeNull();
  expect(oldProviderBars.volumeTrend).toBe("unknown");
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

test("legacy or contradictory cache trend cannot masquerade as observed volume", () => {
  expect(
    intradayIndicatorsFromUnknown({ volumeTrend: "expanding" }),
  ).toMatchObject({ recentVolumeRatio: null, volumeTrend: "unknown" });
  expect(
    intradayIndicatorsFromUnknown({
      recentVolumeRatio: 1.2,
      volumeTrend: "contracting",
    }),
  ).toMatchObject({ recentVolumeRatio: null, volumeTrend: "unknown" });
  expect(
    intradayIndicatorsFromUnknown({
      recentVolumeRatio: 1.2,
      recentVolumeBarClosedAtSeconds: Date.now() / 1000 - 60,
      recentVolumeIntervalSeconds: 5 * 60,
      volumeTrend: "contracting",
    }),
  ).toMatchObject({ recentVolumeRatio: 1.2, volumeTrend: "expanding" });
  expect(
    intradayIndicatorsFromUnknown({
      recentVolumeRatio: 1.2,
      recentVolumeBarClosedAtSeconds: Date.now() / 1000 - 10 * 60,
      recentVolumeIntervalSeconds: 5 * 60,
      volumeTrend: "expanding",
    }),
  ).toMatchObject({ recentVolumeRatio: null, volumeTrend: "unknown" });
  expect(
    intradayIndicatorsFromUnknown({
      recentVolumeRatio: Number.NaN,
      volumeTrend: "expanding",
    }),
  ).toMatchObject({ recentVolumeRatio: null, volumeTrend: "unknown" });
});

test("missing cached indicator values remain unavailable rather than zero", () => {
  expect(
    intradayIndicatorsFromUnknown({
      vwap: null,
      latestPrice: "",
      recentHigh: false,
      momentumPercent: "1.5",
      latestVolume: null,
      averageVolume: "250",
    }),
  ).toMatchObject({
    vwap: null,
    latestPrice: null,
    recentHigh: null,
    momentumPercent: 1.5,
    latestVolume: null,
    averageVolume: 250,
  });
});
