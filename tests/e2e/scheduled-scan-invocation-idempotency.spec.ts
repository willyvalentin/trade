import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION,
  buildScheduledScanInvocationFingerprint,
  buildScheduledScanInvocationFingerprintForSlot,
  default as scheduledScanHandler,
  parseScheduledScanBuildDeploymentIdentity,
  scheduledScanPreflightEventEvidence,
  scheduledScanProbePreflightAdmission,
  scheduledScanSlotIdentity,
  scheduledScanSlotStartedAt,
  scheduledScanRuntimeConfigurationFromEnvironment,
} from "../../netlify/functions/scheduled-scan";

const root = resolve(__dirname, "../..");
const productionDeployId = "6ab1797d8ee5580008985f39";
const productionCommit = "1f51d3ffcd392ab3491a966a4ba34ab93fab78cb";
const productionSiteId = "2b582e03-ac97-4371-8051-558d9980fb94";
const packagedBuildIdentity = (() => {
  try {
    return parseScheduledScanBuildDeploymentIdentity(
      JSON.parse(
        readFileSync(
          resolve(
            root,
            "netlify/.generated/scheduled-scan-deployment-identity.json",
          ),
          "utf8",
        ),
      ),
    );
  } catch {
    return null;
  }
})();
const handlerProductionDeployId =
  packagedBuildIdentity?.deploy_id ?? productionDeployId;

function withFixedDate<T>(timestamp: string, callback: () => T) {
  const OriginalDate = globalThis.Date;
  const fixedTimestamp = new OriginalDate(timestamp).getTime();

  class FixedDate extends OriginalDate {
    constructor(value?: string | number | Date) {
      const resolvedTimestamp =
        value === undefined
          ? fixedTimestamp
          : value instanceof OriginalDate
            ? value.getTime()
            : typeof value === "number"
              ? value
              : new OriginalDate(value).getTime();
      super(resolvedTimestamp);
    }

    static now() {
      return fixedTimestamp;
    }
  }

  globalThis.Date = FixedDate as DateConstructor;
  try {
    return callback();
  } finally {
    globalThis.Date = OriginalDate;
  }
}

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

  test("admits only a time-bound scheduled event and rejects a manual-style late delivery", () => {
    expect(
      scheduledScanPreflightEventEvidence({
        nextRun: "2026-09-21T19:15:00.000Z",
        deliveryTime: new Date("2026-09-21T19:02:03.000Z"),
      }),
    ).toMatchObject({
      status: "time_bound_scheduled_event",
      scheduled_slot_started_at_utc: "2026-09-21T19:00:00.000Z",
      delivery_delay_milliseconds: 123_000,
    });

    expect(
      scheduledScanPreflightEventEvidence({
        nextRun: "2026-09-21T19:15:00.000Z",
        deliveryTime: new Date("2026-09-21T19:10:00.000Z"),
      }).status,
    ).toBe("delivery_outside_slot_grace");
    expect(
      scheduledScanPreflightEventEvidence({
        nextRun: "2026-09-21T19:14:59.000Z",
        deliveryTime: new Date("2026-09-21T19:00:01.000Z"),
      }).status,
    ).toBe("next_run_not_slot_aligned");
  });

  test("uses an exact production build identity when scheduled runtime context omits deploy metadata", () => {
    const buildIdentity = parseScheduledScanBuildDeploymentIdentity({
      schema_version: SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION,
      deploy_id: productionDeployId,
      deploy_context: "production",
      commit_ref: productionCommit,
      site_id: productionSiteId,
    });
    const eventEvidence = scheduledScanPreflightEventEvidence({
      nextRun: "2026-09-21T19:15:00.000Z",
      deliveryTime: new Date("2026-09-21T19:00:48.000Z"),
    });

    expect(buildIdentity).not.toBeNull();
    expect(
      scheduledScanProbePreflightAdmission({
        contextIdentity: {
          deploy_id: null,
          deploy_context: null,
          deploy_published: null,
        },
        buildIdentity,
        runtimeSiteId: productionSiteId,
        eventEvidence,
        configuredProbeSlotUtc: "2026-09-21T19:00:00.000Z",
        configuredProbeDate: "2026-09-21",
      }),
    ).toMatchObject({
      status: "admitted_build_identity_fallback",
      admitted: true,
      identity_source: "build_identity_fallback",
      deployment_identity: {
        deploy_id: productionDeployId,
        commit_ref: productionCommit,
        site_id: productionSiteId,
        deploy_published: null,
        publication_evidence:
          "scheduled_event_requires_external_deploy_readback",
      },
    });

    expect(
      scheduledScanProbePreflightAdmission({
        contextIdentity: {
          deploy_id: null,
          deploy_context: "deploy-preview",
          deploy_published: null,
        },
        buildIdentity,
        runtimeSiteId: productionSiteId,
        eventEvidence,
        configuredProbeSlotUtc: "2026-09-21T19:00:00.000Z",
        configuredProbeDate: "2026-09-21",
      }).status,
    ).toBe("deployment_identity_conflict");
    expect(
      scheduledScanProbePreflightAdmission({
        contextIdentity: {
          deploy_id: null,
          deploy_context: null,
          deploy_published: null,
        },
        buildIdentity,
        runtimeSiteId: "11111111-1111-4111-8111-111111111111",
        eventEvidence,
        configuredProbeSlotUtc: "2026-09-21T19:00:00.000Z",
        configuredProbeDate: "2026-09-21",
      }).status,
    ).toBe("build_identity_site_mismatch");
    expect(
      scheduledScanProbePreflightAdmission({
        contextIdentity: {
          deploy_id: null,
          deploy_context: null,
          deploy_published: null,
        },
        buildIdentity: null,
        runtimeSiteId: productionSiteId,
        eventEvidence,
        configuredProbeSlotUtc: "2026-09-21T19:00:00.000Z",
        configuredProbeDate: "2026-09-21",
      }).status,
    ).toBe("deployment_identity_unavailable");
    expect(
      scheduledScanProbePreflightAdmission({
        contextIdentity: {
          deploy_id: "111111111111111111111111",
          deploy_context: "production",
          deploy_published: true,
        },
        buildIdentity,
        runtimeSiteId: productionSiteId,
        eventEvidence,
        configuredProbeSlotUtc: "2026-09-21T19:00:00.000Z",
        configuredProbeDate: "2026-09-21",
      }).status,
    ).toBe("deployment_identity_conflict");
    expect(
      scheduledScanProbePreflightAdmission({
        contextIdentity: {
          deploy_id: null,
          deploy_context: null,
          deploy_published: null,
        },
        buildIdentity,
        runtimeSiteId: productionSiteId,
        eventEvidence,
        configuredProbeSlotUtc: "2026-09-21T19:15:00.000Z",
        configuredProbeDate: "2026-09-21",
      }).status,
    ).toBe("probe_slot_mismatch");
    expect(
      scheduledScanProbePreflightAdmission({
        contextIdentity: {
          deploy_id: null,
          deploy_context: null,
          deploy_published: null,
        },
        buildIdentity,
        runtimeSiteId: productionSiteId,
        eventEvidence,
        configuredProbeSlotUtc: null,
        configuredProbeDate: "2026-09-21",
      }).status,
    ).toBe("probe_slot_unavailable");

    expect(
      scheduledScanProbePreflightAdmission({
        contextIdentity: {
          deploy_id: null,
          deploy_context: null,
          deploy_published: null,
        },
        buildIdentity,
        runtimeSiteId: productionSiteId,
        eventEvidence,
        configuredProbeSlotUtc: "2026-09-21T19:00:00.000Z",
        configuredProbeDate: null,
      }).status,
    ).toBe("probe_date_unavailable");
    expect(
      scheduledScanProbePreflightAdmission({
        contextIdentity: {
          deploy_id: null,
          deploy_context: null,
          deploy_published: null,
        },
        buildIdentity,
        runtimeSiteId: productionSiteId,
        eventEvidence,
        configuredProbeSlotUtc: "2026-09-21T19:00:00.000Z",
        configuredProbeDate: "2026-09-20",
      }).status,
    ).toBe("probe_date_mismatch");

    const crossUtcDateEvent = scheduledScanPreflightEventEvidence({
      nextRun: "2026-09-22T01:15:00.000Z",
      deliveryTime: new Date("2026-09-22T01:00:48.000Z"),
    });
    expect(
      scheduledScanProbePreflightAdmission({
        contextIdentity: {
          deploy_id: null,
          deploy_context: null,
          deploy_published: null,
        },
        buildIdentity,
        runtimeSiteId: productionSiteId,
        eventEvidence: crossUtcDateEvent,
        configuredProbeSlotUtc: "2026-09-22T01:00:00.000Z",
        configuredProbeDate: "2026-09-21",
      }).status,
    ).toBe("admitted_build_identity_fallback");
  });

  test("rejects malformed or non-production build identities", () => {
    const baseIdentity = {
      schema_version: SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION,
      deploy_id: productionDeployId,
      deploy_context: "production",
      commit_ref: productionCommit,
      site_id: productionSiteId,
    };

    expect(parseScheduledScanBuildDeploymentIdentity(baseIdentity)).not.toBeNull();
    expect(
      parseScheduledScanBuildDeploymentIdentity({
        ...baseIdentity,
        deploy_context: "deploy-preview",
      }),
    ).toBeNull();
    expect(
      parseScheduledScanBuildDeploymentIdentity({
        ...baseIdentity,
        commit_ref: "not-a-commit",
      }),
    ).toBeNull();
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
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_SLOT_UTC:
                  "2026-09-21T13:15:00.000Z",
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
        basic_free_catalog_capability_probe_slot_utc:
          "2026-09-21T13:15:00.000Z",
      });
      expect(
        scheduledScanRuntimeConfigurationFromEnvironment({
          get(key: string) {
            return key === "TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE"
              ? "2026-09-31"
              : undefined;
          },
        }).basic_free_catalog_capability_probe_date,
      ).toBeNull();

      const response = await withFixedDate(
        "2026-09-21T13:15:48.000Z",
        () =>
          scheduledScanHandler(
            new Request("https://scheduled.example", {
              method: "POST",
              body: JSON.stringify({ next_run: "2026-09-21T13:30:00.000Z" }),
            }),
            {
              deploy: {
                id: handlerProductionDeployId,
                context: "production",
                published: true,
              },
            } as Parameters<typeof scheduledScanHandler>[1],
          ),
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
            basic_free_catalog_capability_probe_slot_utc:
              "2026-09-21T13:15:00.000Z",
          },
          netlify_deploy: {
            deploy_id: handlerProductionDeployId,
            deploy_context: "production",
            deploy_published: true,
          },
          probe_preflight_admission: {
            status: "admitted_runtime_context",
            admitted: true,
            identity_source: "runtime_context",
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
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE: "2026-09-21",
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_SLOT_UTC:
                  "2026-09-21T13:15:00.000Z",
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

      const response = await withFixedDate(
        "2026-09-21T13:15:48.000Z",
        () =>
          scheduledScanHandler(
            new Request("https://scheduled.example", {
              method: "POST",
              body: JSON.stringify({ next_run: "2026-09-21T13:30:00.000Z" }),
            }),
            {
              deploy: {
                id: handlerProductionDeployId,
                context: "production",
                published: true,
              },
            } as Parameters<typeof scheduledScanHandler>[1],
          ),
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

  test("keeps every non-target probe slot inert before the database and route", async () => {
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
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_SLOT_UTC:
                  "2026-09-21T13:30:00.000Z",
              }[key];
            },
          },
        },
      });
      globalThis.fetch = async () => {
        requests += 1;
        return new Response("unexpected", { status: 500 });
      };

      const response = await withFixedDate(
        "2026-09-21T13:15:48.000Z",
        () =>
          scheduledScanHandler(
            new Request("https://scheduled.example", {
              method: "POST",
              body: JSON.stringify({ next_run: "2026-09-21T13:30:00.000Z" }),
            }),
            {
              deploy: {
                id: handlerProductionDeployId,
                context: "production",
                published: true,
              },
            } as Parameters<typeof scheduledScanHandler>[1],
          ),
      );

      expect(response.status).toBe(204);
      expect(requests).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalNetlify) Object.defineProperty(globalThis, "Netlify", originalNetlify);
      else Reflect.deleteProperty(globalThis, "Netlify");
    }
  });

  test("keeps a probe slot with the wrong New York date inert before the database and route", async () => {
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
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE: "2026-09-20",
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_SLOT_UTC:
                  "2026-09-21T13:15:00.000Z",
              }[key];
            },
          },
        },
      });
      globalThis.fetch = async () => {
        requests += 1;
        return new Response("unexpected", { status: 500 });
      };

      const response = await withFixedDate(
        "2026-09-21T13:15:48.000Z",
        () =>
          scheduledScanHandler(
            new Request("https://scheduled.example", {
              method: "POST",
              body: JSON.stringify({ next_run: "2026-09-21T13:30:00.000Z" }),
            }),
            {
              deploy: {
                id: handlerProductionDeployId,
                context: "production",
                published: true,
              },
            } as Parameters<typeof scheduledScanHandler>[1],
          ),
      );

      expect(response.status).toBe(204);
      expect(requests).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalNetlify) Object.defineProperty(globalThis, "Netlify", originalNetlify);
      else Reflect.deleteProperty(globalThis, "Netlify");
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
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE: "2026-09-21",
                TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_SLOT_UTC:
                  "2026-09-21T13:15:00.000Z",
              }[key];
            },
          },
        },
      });
      globalThis.fetch = async () => {
        requests += 1;
        return new Response("unexpected", { status: 500 });
      };

      const response = await withFixedDate(
        "2026-09-21T13:15:48.000Z",
        () =>
          scheduledScanHandler(
            new Request("https://scheduled.example", {
              method: "POST",
              body: JSON.stringify({ next_run: "2026-09-21T13:30:00.000Z" }),
            }),
            {
              deploy: {
                id: "111111111111111111111111",
                context: "deploy-preview",
                published: true,
              },
            } as Parameters<typeof scheduledScanHandler>[1],
          ),
      );

      expect(response.status).toBe(503);
      expect(await response.text()).toBe(
        "Scheduled scan preflight admission unavailable",
      );
      expect(requests).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalNetlify) Object.defineProperty(globalThis, "Netlify", originalNetlify);
      else Reflect.deleteProperty(globalThis, "Netlify");
    }
  });
});
