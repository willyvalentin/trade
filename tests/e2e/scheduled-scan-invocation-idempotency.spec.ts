import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  buildScheduledScanInvocationFingerprint,
  buildScheduledScanInvocationFingerprintForSlot,
  default as scheduledScanHandler,
  scheduledScanSlotIdentity,
  scheduledScanSlotStartedAt,
  scheduledScanRuntimeConfigurationFromEnvironment,
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

  test("records an inert deploy-bound preflight when only the Basic Free probe is armed", async () => {
    const originalNetlify = Object.getOwnPropertyDescriptor(globalThis, "Netlify");
    const originalFetch = globalThis.fetch;
    const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const requests: Array<{ url: string; init: RequestInit | undefined }> = [];

    try {
      Object.defineProperty(globalThis, "Netlify", {
        configurable: true,
        value: {
          env: {
            get(key: string) {
              return {
                TURE_DISABLE_SCHEDULED_FUNCTIONS: "true",
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED: "true",
                TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "false",
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE: "2026-09-21",
              }[key];
            },
          },
        },
      });
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";
      globalThis.fetch = async (input, init) => {
        requests.push({ url: String(input), init });
        return new Response(JSON.stringify([{ id: "claimed" }]), { status: 201 });
      };

      expect(
        scheduledScanRuntimeConfigurationFromEnvironment(
          (globalThis as typeof globalThis & { Netlify: { env: { get(key: string): string | undefined } } }).Netlify.env,
        ),
      ).toEqual({
        scheduled_functions_disabled: true,
        basic_free_catalog_capability_probe_enabled: true,
        basic_free_catalog_observation_one_shot_enabled: false,
        basic_free_catalog_capability_probe_date: "2026-09-21",
      });

      const response = await scheduledScanHandler(
        new Request("https://scheduled.example", {
          method: "POST",
          body: JSON.stringify({ next_run: "2026-09-21T13:30:00.000Z" }),
        }),
        {
          deploy: { id: "deploy-preflight", context: "production", published: true },
        } as Parameters<typeof scheduledScanHandler>[1],
      );

      expect(response.status).toBe(204);
      expect(requests).toHaveLength(1);
      expect(requests[0]?.url).toContain("/rest/v1/scheduled_scan_attempts");
      expect(JSON.parse(String(requests[0]?.init?.body))).toMatchObject({
        source: "netlify_scheduled_function",
        mode: "scheduled",
        outcome: "skipped",
        allowed: false,
        skip_reason: "scheduled_execution_disabled_probe_preflight",
        payload_json: {
          execution_boundary: "scheduler_disabled_basic_free_catalog_probe_preflight",
          runtime_configuration: {
            scheduled_functions_disabled: true,
            basic_free_catalog_capability_probe_enabled: true,
            basic_free_catalog_observation_one_shot_enabled: false,
            basic_free_catalog_capability_probe_date: "2026-09-21",
          },
          netlify_deploy: {
            deploy_id: "deploy-preflight",
            deploy_context: "production",
            deploy_published: true,
          },
        },
      });
    } finally {
      globalThis.fetch = originalFetch;
      if (originalNetlify) Object.defineProperty(globalThis, "Netlify", originalNetlify);
      else Reflect.deleteProperty(globalThis, "Netlify");
      if (originalSupabaseUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      else process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
      if (originalSupabaseKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseKey;
    }
  });

  test("fails closed without loading the scan route when an armed-probe preflight claim cannot persist", async () => {
    const originalNetlify = Object.getOwnPropertyDescriptor(globalThis, "Netlify");
    const originalFetch = globalThis.fetch;
    const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let requests = 0;

    try {
      Object.defineProperty(globalThis, "Netlify", {
        configurable: true,
        value: {
          env: {
            get(key: string) {
              return {
                TURE_DISABLE_SCHEDULED_FUNCTIONS: "true",
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED: "true",
              }[key];
            },
          },
        },
      });
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";
      globalThis.fetch = async () => {
        requests += 1;
        return new Response("unavailable", { status: 503 });
      };

      const response = await scheduledScanHandler(
        new Request("https://scheduled.example", { method: "POST" }),
        { deploy: { id: "deploy-preflight", context: "production", published: true } } as Parameters<typeof scheduledScanHandler>[1],
      );

      expect(response.status).toBe(503);
      expect(await response.text()).toBe("Scheduled scan claim unavailable");
      expect(requests).toBe(1);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalNetlify) Object.defineProperty(globalThis, "Netlify", originalNetlify);
      else Reflect.deleteProperty(globalThis, "Netlify");
      if (originalSupabaseUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      else process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
      if (originalSupabaseKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      else process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseKey;
    }
  });

  test("rejects an armed-probe preflight before any database or route call when the deploy identity is not published production", async () => {
    const originalNetlify = Object.getOwnPropertyDescriptor(globalThis, "Netlify");
    const originalFetch = globalThis.fetch;
    let requests = 0;

    try {
      Object.defineProperty(globalThis, "Netlify", {
        configurable: true,
        value: {
          env: {
            get(key: string) {
              return {
                TURE_DISABLE_SCHEDULED_FUNCTIONS: "true",
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED: "true",
              }[key];
            },
          },
        },
      });
      globalThis.fetch = async () => {
        requests += 1;
        return new Response("unexpected", { status: 500 });
      };

      const response = await scheduledScanHandler(
        new Request("https://scheduled.example", { method: "POST" }),
        { deploy: { id: "deploy-preview", context: "deploy-preview", published: true } } as Parameters<typeof scheduledScanHandler>[1],
      );

      expect(response.status).toBe(503);
      expect(await response.text()).toBe(
        "Scheduled scan preflight deployment identity unavailable",
      );
      expect(requests).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalNetlify) Object.defineProperty(globalThis, "Netlify", originalNetlify);
      else Reflect.deleteProperty(globalThis, "Netlify");
    }
  });
});
