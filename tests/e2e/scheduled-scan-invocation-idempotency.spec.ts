import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  buildScheduledScanInvocationFingerprint,
  buildScheduledScanInvocationFingerprintForSlot,
  scheduledScanSlotIdentity,
  scheduledScanSlotStartedAt,
} from "../../netlify/functions/scheduled-scan";

const root = resolve(__dirname, "../..");

test.describe("scheduled scan invocation idempotency", () => {
  test("maps duplicate deliveries in one quarter-hour to one durable claim key", () => {
    const firstDelivery = new Date("2026-09-16T15:00:14.493Z");
    const duplicateDelivery = new Date("2026-09-16T15:00:38.069Z");
    const nextSlot = new Date("2026-09-16T15:15:00.000Z");

    expect(scheduledScanSlotStartedAt(firstDelivery).toISOString()).toBe(
      "2026-09-16T15:00:00.000Z",
    );
    expect(buildScheduledScanInvocationFingerprint(firstDelivery)).toBe(
      "scheduled_scan_attempt_fha3bx",
    );
    expect(buildScheduledScanInvocationFingerprint(duplicateDelivery)).toBe(
      buildScheduledScanInvocationFingerprint(firstDelivery),
    );
    expect(buildScheduledScanInvocationFingerprint(firstDelivery)).not.toBe(
      "scheduled_scan_attempt_11gtqfm",
    );
    expect(buildScheduledScanInvocationFingerprint(duplicateDelivery)).not.toBe(
      "scheduled_scan_attempt_kow4oj",
    );
    expect(buildScheduledScanInvocationFingerprint(nextSlot)).not.toBe(
      buildScheduledScanInvocationFingerprint(firstDelivery),
    );
  });

  test("derives the current slot from Netlify's following next_run timestamp across delayed duplicate deliveries", () => {
    const firstDelivery = new Date("2026-09-16T18:00:14.231Z");
    const delayedDuplicate = new Date("2026-09-16T18:00:35.535Z");
    const nextRun = "2026-09-16T18:15:00.000Z";

    const firstIdentity = scheduledScanSlotIdentity({
      nextRun,
      deliveryTime: firstDelivery,
    });
    const duplicateIdentity = scheduledScanSlotIdentity({
      nextRun,
      deliveryTime: delayedDuplicate,
    });

    expect(firstIdentity).toEqual({
      scheduledSlot: new Date("2026-09-16T18:00:00.000Z"),
      source: "netlify_event_next_run",
    });
    expect(duplicateIdentity).toEqual(firstIdentity);
    expect(
      buildScheduledScanInvocationFingerprintForSlot(firstIdentity.scheduledSlot),
    ).toBe(
      buildScheduledScanInvocationFingerprintForSlot(
        duplicateIdentity.scheduledSlot,
      ),
    );
    expect(
      buildScheduledScanInvocationFingerprintForSlot(firstIdentity.scheduledSlot),
    ).toBe(buildScheduledScanInvocationFingerprint(firstDelivery));
  });

  test("does not claim the following quarter-hour when a live delivery carries next_run", () => {
    const identity = scheduledScanSlotIdentity({
      nextRun: "2026-09-16T19:30:00.000Z",
      deliveryTime: new Date("2026-09-16T19:15:19.596Z"),
    });

    expect(identity).toEqual({
      scheduledSlot: new Date("2026-09-16T19:15:00.000Z"),
      source: "netlify_event_next_run",
    });
  });

  test("fails closed to the established quarter-hour key when next_run is missing or invalid", () => {
    const deliveryTime = new Date("2026-09-16T18:00:35.535Z");

    for (const nextRun of [null, "", "not-a-date", 123]) {
      const identity = scheduledScanSlotIdentity({ nextRun, deliveryTime });

      expect(identity.source).toBe("delivery_quarter_hour_fallback");
      expect(identity.scheduledSlot.toISOString()).toBe(
        "2026-09-16T18:00:00.000Z",
      );
      expect(
        buildScheduledScanInvocationFingerprintForSlot(identity.scheduledSlot),
      ).toBe(buildScheduledScanInvocationFingerprint(deliveryTime));
    }
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
    expect(scheduledFunction).toContain("Keep the identity calculation in the scheduled-function entrypoint");
    expect(scheduledFunction).toContain("netlify_event_next_run");
    expect(scheduledFunction).toContain("delivery_quarter_hour_fallback");
    expect(scheduledFunction).toContain("request.clone().json()");
    expect(scheduledFunction).not.toContain("../../lib/scheduled-scan-invocation");
    expect(scheduledFunction).toContain('return new Response(null, { status: 204 })');
    expect(scheduledFunction.indexOf("const invocationClaim = await claimScheduledScanInvocation(")).toBeLessThan(
      scheduledFunction.indexOf("const automationSecret = process.env.AUTOMATION_SECRET"),
    );
    expect(scheduledFunction.indexOf('if (invocationClaim === "duplicate")')).toBeLessThan(
      scheduledFunction.indexOf("const automationSecret = process.env.AUTOMATION_SECRET"),
    );
  });
});
