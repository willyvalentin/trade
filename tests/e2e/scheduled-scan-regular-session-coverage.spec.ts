import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { scheduledScanRegularSessionCron } from "@/lib/scheduled-scan-regular-session-coverage";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function isScheduledUtcSlot(timestamp: string) {
  const [minuteExpression, hourExpression] =
    scheduledScanRegularSessionCron.split(" ");
  const [firstHour, lastHour] = hourExpression.split("-").map(Number);
  const date = new Date(timestamp);

  return (
    minuteExpression === "*/15" &&
    date.getUTCMinutes() % 15 === 0 &&
    date.getUTCHours() >= firstHour &&
    date.getUTCHours() <= lastHour
  );
}

test("scheduled scans cover US regular-session slots across daylight and standard time", () => {
  expect(scheduledScanRegularSessionCron).toBe("*/15 13-20 * * 1-5");

  for (const timestamp of [
    "2026-07-01T13:30:00.000Z", // 09:30 EDT open
    "2026-07-01T19:45:00.000Z", // final full 15-minute EDT slot
    "2026-12-01T14:30:00.000Z", // 09:30 EST open
    "2026-12-01T20:45:00.000Z", // final full 15-minute EST slot
  ]) {
    expect(isScheduledUtcSlot(timestamp), timestamp).toBe(true);
  }

  expect(isScheduledUtcSlot("2026-12-01T21:00:00.000Z")).toBe(false);
  expect(read("netlify/functions/scheduled-scan.ts")).toContain(
    "schedule: scheduledScanRegularSessionCron",
  );
  expect(read("app/trade-app.tsx")).toContain(
    "scheduled_scan_cron: scheduledScanRegularSessionCron",
  );
});
