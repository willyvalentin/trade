import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const executionFingerprint = "scheduled_scan_attempt_20260915_1843";

async function loadObservationRuntime() {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-basic-free-observation-"));
  const output = resolve(directory, "basic-free-observation.cjs");
  buildSync({
    entryPoints: [
      resolve(
        process.cwd(),
        "lib/basic-free-discovery-background-observation.ts",
      ),
    ],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
    conditions: ["react-server"],
  });
  const runtimeModule = (await import(pathToFileURL(output).href)) as {
    observeBasicFreeDiscoveryBetweenPublicationWindows: (input: {
      scheduled: boolean;
      marketOpen: boolean;
      outsideOfficialPublicationWindow: boolean;
      catalogOnlyOneShotReady?: boolean;
      scanWindow: string;
      ownerUserId: string;
      executionFingerprint: string;
      previousAttempt?: Record<string, unknown> | null;
      observe?: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
    }) => Promise<{ status: string; blocker: string | null }>;
  };
  return {
    observe: runtimeModule.observeBasicFreeDiscoveryBetweenPublicationWindows,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

test("Basic Free observation is scheduled-only and retains its reference-only boundary", async () => {
  const calls: Array<Record<string, unknown>> = [];
  const runtime = await loadObservationRuntime();
  try {
    const result = await runtime.observe({
      scheduled: true,
      marketOpen: true,
      outsideOfficialPublicationWindow: true,
      scanWindow: "afternoon",
      ownerUserId,
      executionFingerprint,
      previousAttempt: {
        attempted_at: "2026-09-15T15:30:00.000Z",
        trading_date: "2026-09-15",
        outcome: "available",
      },
      observe: async (input) => {
        calls.push(input);
        return { summary: {} };
      },
    });

    expect(result).toMatchObject({ status: "observed", blocker: null });
    expect(calls).toEqual([
      {
        scanWindow: "afternoon",
        ownerUserId,
        executionFingerprint,
        previousAttempt: {
          attempted_at: "2026-09-15T15:30:00.000Z",
          trading_date: "2026-09-15",
          outcome: "available",
        },
        signal: undefined,
      },
    ]);

    const official = await runtime.observe({
      scheduled: true,
      marketOpen: true,
      outsideOfficialPublicationWindow: false,
      scanWindow: "opening",
      ownerUserId,
      executionFingerprint,
      observe: async () => {
        throw new Error("official window must not observe catalog");
      },
    });
    expect(official).toEqual({
      status: "not_eligible",
      blocker: "official_publication_window",
      discovery: null,
    });

    const catalogOnlyOfficial = await runtime.observe({
      scheduled: true,
      marketOpen: true,
      outsideOfficialPublicationWindow: false,
      catalogOnlyOneShotReady: true,
      scanWindow: "midday",
      ownerUserId,
      executionFingerprint,
      observe: async (input) => {
        calls.push(input);
        return { summary: {} };
      },
    });
    expect(catalogOnlyOfficial).toMatchObject({
      status: "observed",
      blocker: null,
    });
    expect(calls).toHaveLength(2);
    expect(calls[1]).toMatchObject({ scanWindow: "midday" });
  } finally {
    runtime.dispose();
  }
});
