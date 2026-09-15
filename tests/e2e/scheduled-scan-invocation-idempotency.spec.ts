import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  buildScheduledScanInvocationFingerprint,
  scheduledScanSlotStartedAt,
} from "@/lib/scheduled-scan-invocation";

const root = resolve(__dirname, "../..");

test.describe("scheduled scan invocation idempotency", () => {
  test("maps duplicate deliveries in one quarter-hour to one durable claim key", () => {
    const firstDelivery = new Date("2026-09-15T15:45:06.568Z");
    const duplicateDelivery = new Date("2026-09-15T15:45:21.557Z");
    const nextSlot = new Date("2026-09-15T16:00:00.000Z");

    expect(scheduledScanSlotStartedAt(firstDelivery).toISOString()).toBe(
      "2026-09-15T15:45:00.000Z",
    );
    expect(buildScheduledScanInvocationFingerprint(duplicateDelivery)).toBe(
      buildScheduledScanInvocationFingerprint(firstDelivery),
    );
    expect(buildScheduledScanInvocationFingerprint(nextSlot)).not.toBe(
      buildScheduledScanInvocationFingerprint(firstDelivery),
    );
  });

  test("claims before reading the automation secret and fails closed on claim ambiguity", async () => {
    const scheduledFunction = await readFile(
      resolve(root, "netlify/functions/scheduled-scan.ts"),
      "utf8",
    );

    expect(scheduledFunction).toContain("resolution=ignore-duplicates,return=representation");
    expect(scheduledFunction).toContain("Duplicate scheduled slot skipped");
    expect(scheduledFunction).toContain("Scheduled scan claim unavailable");
    expect(scheduledFunction).toContain("Durable invocation claim response was ambiguous");
    expect(scheduledFunction).toContain('return new Response(null, { status: 204 })');
    expect(scheduledFunction.indexOf("const invocationClaim = await claimScheduledScanInvocation(")).toBeLessThan(
      scheduledFunction.indexOf("const automationSecret = process.env.AUTOMATION_SECRET"),
    );
    expect(scheduledFunction.indexOf('if (invocationClaim === "duplicate")')).toBeLessThan(
      scheduledFunction.indexOf("const automationSecret = process.env.AUTOMATION_SECRET"),
    );
  });
});
