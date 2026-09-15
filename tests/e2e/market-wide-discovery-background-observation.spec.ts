import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

import type { MarketWideDiscoveryResult } from "@/lib/market-wide-discovery";

const ownerUserId = "7d2e0f9a-43db-4f62-9a78-aec2ae34c6d0";
const executionFingerprint = "scheduled_scan_attempt_20260915_1843";

function discoveryResult(): MarketWideDiscoveryResult {
  return {
    summary: {} as MarketWideDiscoveryResult["summary"],
    dynamic_movers: {} as MarketWideDiscoveryResult["dynamic_movers"],
  };
}

async function loadObservationRuntime() {
  const directory = mkdtempSync(
    resolve(tmpdir(), "ture-market-wide-observation-"),
  );
  const output = resolve(directory, "market-wide-observation.cjs");
  buildSync({
    entryPoints: [
      resolve(
        process.cwd(),
        "lib/market-wide-discovery-background-observation.ts",
      ),
    ],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
    conditions: ["react-server"],
  });
  const runtimeModule = (await import(pathToFileURL(output).href)) as {
    observeMarketWideDiscoveryBetweenPublicationWindows: (input: {
      scheduled: boolean;
      marketOpen: boolean;
      outsideOfficialPublicationWindow: boolean;
      scanWindow: string;
      selectedBudget: number;
      ownerUserId: string;
      executionFingerprint: string;
      previousAttempt?: { attempted_at: string; outcome: string } | null;
      discover?: (input: Record<string, unknown>) => Promise<MarketWideDiscoveryResult>;
    }) => Promise<{ status: string; blocker: string | null }>;
  };

  return {
    observe: runtimeModule.observeMarketWideDiscoveryBetweenPublicationWindows,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

test("open-market observation calls only bounded discovery between publication windows", async () => {
  const calls: Array<Record<string, unknown>> = [];
  const runtime = await loadObservationRuntime();

  try {
    const result = await runtime.observe({
      scheduled: true,
      marketOpen: true,
      outsideOfficialPublicationWindow: true,
      scanWindow: "afternoon",
      selectedBudget: 25,
      ownerUserId,
      executionFingerprint,
      previousAttempt: {
        attempted_at: "2026-09-15T18:15:00.000Z",
        outcome: "available",
      },
      discover: async (input) => {
        calls.push(input);
        return discoveryResult();
      },
    });

    expect(result.status).toBe("observed");
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      scanWindow: "afternoon",
      selectedBudget: 25,
      ownerUserId,
      executionFingerprint,
      previousAttempt: {
        attempted_at: "2026-09-15T18:15:00.000Z",
        outcome: "available",
      },
    });
    expect(calls[0]).not.toHaveProperty("runtimeEnabled");
    expect(calls[0]).not.toHaveProperty("fetchMarketMovers");
  } finally {
    runtime.dispose();
  }
});

test("official, closed, and diagnostic paths cannot start background observation", async () => {
  let calls = 0;
  const runtime = await loadObservationRuntime();
  const discover = async () => {
    calls += 1;
    return discoveryResult();
  };

  try {
    const official = await runtime.observe({
      scheduled: true,
      marketOpen: true,
      outsideOfficialPublicationWindow: false,
      scanWindow: "midday",
      selectedBudget: 25,
      ownerUserId,
      executionFingerprint,
      discover,
    });
    const closed = await runtime.observe({
      scheduled: true,
      marketOpen: false,
      outsideOfficialPublicationWindow: true,
      scanWindow: "afternoon",
      selectedBudget: 25,
      ownerUserId,
      executionFingerprint,
      discover,
    });
    const diagnostic = await runtime.observe({
      scheduled: false,
      marketOpen: true,
      outsideOfficialPublicationWindow: true,
      scanWindow: "afternoon",
      selectedBudget: 25,
      ownerUserId,
      executionFingerprint,
      discover,
    });

    expect(calls).toBe(0);
    expect(official).toMatchObject({
      status: "not_eligible",
      blocker: "official_publication_window",
    });
    expect(closed).toMatchObject({
      status: "not_eligible",
      blocker: "market_not_open",
    });
    expect(diagnostic).toMatchObject({
      status: "not_eligible",
      blocker: "not_scheduled",
    });
  } finally {
    runtime.dispose();
  }
});
