import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { build } from "esbuild";

test("scheduled generation cannot spend unreserved dynamic-mover quote credits", async () => {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-scheduled-movers-"));
  const output = resolve(directory, "dynamic-movers.cjs");
  const priorEnabled = process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED;
  const priorKey = process.env.TWELVE_DATA_API_KEY;
  const quoteCounter = globalThis as typeof globalThis & {
    __tureMoverQuoteCalls?: number;
  };

  try {
    await build({
      entryPoints: [resolve(process.cwd(), "lib/dynamic-movers-discovery.ts")],
      outfile: output,
      bundle: true,
      platform: "node",
      format: "cjs",
      conditions: ["react-server"],
      plugins: [
        {
          name: "no-provider-test-double",
          setup(builder) {
            builder.onResolve(
              { filter: /^@\/lib\/market-data$/ },
              () => ({ path: "market-data", namespace: "test-double" }),
            );
            builder.onLoad(
              { filter: /^market-data$/, namespace: "test-double" },
              () => ({
                contents: `export async function getQuote() {
                  globalThis.__tureMoverQuoteCalls += 1;
                  return {
                    current_price: 102, open: 100, previous_close: 99,
                    high: 103, low: 98, percent_change: 3, volume: 1000000
                  };
                }`,
                loader: "js",
              }),
            );
          },
        },
      ],
    });

    const runtime = (await import(pathToFileURL(output).href)) as {
      discoverDynamicMoversDiagnostics: (input: {
        source: "manual" | "scheduled";
        candidates: Array<{ ticker: string }>;
      }) => Promise<{
        discovery_enabled: boolean;
        provider_attempted: string | null;
        provider_error_type: string;
        returned_count: number;
      }>;
    };
    quoteCounter.__tureMoverQuoteCalls = 0;
    process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED = "true";
    process.env.TWELVE_DATA_API_KEY = "test-only-never-used";

    const scheduled = await runtime.discoverDynamicMoversDiagnostics({
      source: "scheduled",
      candidates: [{ ticker: "AAPL" }, { ticker: "MSFT" }],
    });
    expect(scheduled).toMatchObject({
      discovery_enabled: false,
      provider_attempted: null,
      provider_error_type: "disabled",
      returned_count: 0,
    });
    expect(quoteCounter.__tureMoverQuoteCalls).toBe(0);

    const manual = await runtime.discoverDynamicMoversDiagnostics({
      source: "manual",
      candidates: [{ ticker: "AAPL" }],
    });
    expect(manual).toMatchObject({
      discovery_enabled: true,
      provider_attempted: "twelve_data",
      returned_count: 1,
    });
    expect(quoteCounter.__tureMoverQuoteCalls).toBe(1);

    const generator = readFileSync(
      resolve(process.cwd(), "lib/recommendation-generator.ts"),
      "utf8",
    );
    expect(generator).toMatch(
      /discoverDynamicMoversDiagnostics\(\{\s*source,\s*candidates: scannerBaseCandidates/,
    );
  } finally {
    if (priorEnabled === undefined) {
      delete process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED;
    } else {
      process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED = priorEnabled;
    }
    if (priorKey === undefined) {
      delete process.env.TWELVE_DATA_API_KEY;
    } else {
      process.env.TWELVE_DATA_API_KEY = priorKey;
    }
    delete quoteCounter.__tureMoverQuoteCalls;
    rmSync(directory, { recursive: true, force: true });
  }
});
