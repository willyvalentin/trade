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
