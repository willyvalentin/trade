import { expect, test } from "@playwright/test";

import { canObserveBackgroundDiscoveryBetweenPublicationWindows } from "../../lib/background-discovery-observation-gate";

test("admits only scheduled reference observations between official publication windows", () => {
  for (const scanWindow of [
    "opening",
    "morning_momentum",
    "afternoon",
  ] as const) {
    expect(
      canObserveBackgroundDiscoveryBetweenPublicationWindows({
        scheduled: true,
        marketOpen: true,
        scheduledGateWindow: "outside_window",
        scanWindow,
      }),
    ).toBe(true);
  }
});

test("keeps diagnostic, closed, official-window and unobservable routes fail closed", () => {
  const admittedInput = {
    scheduled: true,
    marketOpen: true,
    scheduledGateWindow: "outside_window",
    scanWindow: "opening" as const,
  };

  expect(
    canObserveBackgroundDiscoveryBetweenPublicationWindows({
      ...admittedInput,
      scheduled: false,
    }),
  ).toBe(false);
  expect(
    canObserveBackgroundDiscoveryBetweenPublicationWindows({
      ...admittedInput,
      marketOpen: false,
    }),
  ).toBe(false);
  expect(
    canObserveBackgroundDiscoveryBetweenPublicationWindows({
      ...admittedInput,
      scheduledGateWindow: "morning",
    }),
  ).toBe(false);
  expect(
    canObserveBackgroundDiscoveryBetweenPublicationWindows({
      ...admittedInput,
      scanWindow: "closed",
    }),
  ).toBe(false);
});

test("admits a ready catalog-only one-shot in every supported open-market scan window", () => {
  for (const [scheduledGateWindow, scanWindow] of [
    ["opening", "opening"],
    ["morning", "morning_momentum"],
    ["midday", "midday"],
    ["outside_window", "afternoon"],
    ["power_hour", "power_hour"],
  ] as const) {
    expect(
      canObserveBackgroundDiscoveryBetweenPublicationWindows({
        scheduled: true,
        marketOpen: true,
        scheduledGateWindow,
        scanWindow,
        catalogOnlyOneShotReady: true,
      }),
    ).toBe(true);
  }

  expect(
    canObserveBackgroundDiscoveryBetweenPublicationWindows({
      scheduled: true,
      marketOpen: true,
      scheduledGateWindow: "closed",
      scanWindow: "opening",
      catalogOnlyOneShotReady: true,
    }),
  ).toBe(false);
  expect(
    canObserveBackgroundDiscoveryBetweenPublicationWindows({
      scheduled: true,
      marketOpen: true,
      scheduledGateWindow: "morning",
      scanWindow: "morning_momentum",
      catalogOnlyOneShotReady: false,
    }),
  ).toBe(false);
});
