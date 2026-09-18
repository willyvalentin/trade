import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

async function loadControlRuntime() {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-basic-free-one-shot-"));
  const output = resolve(directory, "basic-free-one-shot.cjs");
  buildSync({
    entryPoints: [
      resolve(process.cwd(), "lib/basic-free-catalog-one-shot-control.ts"),
    ],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
  });
  const runtimeModule = (await import(pathToFileURL(output).href)) as {
    buildBasicFreeCatalogOneShotControl: (input: {
      env: Record<string, string | undefined>;
      tradingDate: string;
    }) => Record<string, unknown>;
  };
  return {
    build: runtimeModule.buildBasicFreeCatalogOneShotControl,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

test("one-shot control is disabled unless explicitly enabled", async () => {
  const runtime = await loadControlRuntime();
  try {
    expect(
      runtime.build({
        env: { TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_DATE: "2026-09-17" },
        tradingDate: "2026-09-17",
      }),
    ).toMatchObject({
      status: "disabled",
      catalog_only_enforced: false,
      catalog_observation_may_proceed: false,
    });
  } finally {
    runtime.dispose();
  }
});

test("enabled one-shot fails closed for missing, invalid, or stale dates", async () => {
  const runtime = await loadControlRuntime();
  try {
    const enabled = { TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "true" };

    expect(runtime.build({ env: enabled, tradingDate: "2026-09-17" })).toMatchObject({
      status: "target_date_missing",
      catalog_only_enforced: true,
      catalog_observation_may_proceed: false,
    });
    expect(
      runtime.build({
        env: {
          ...enabled,
          TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_DATE: "2026-09-31",
        },
        tradingDate: "2026-09-17",
      }),
    ).toMatchObject({
      status: "target_date_invalid",
      catalog_only_enforced: true,
      catalog_observation_may_proceed: false,
    });
    expect(
      runtime.build({
        env: {
          ...enabled,
          TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_DATE: "2026-09-17",
        },
        tradingDate: "2026-09-18",
      }),
    ).toMatchObject({
      status: "outside_target_date",
      catalog_only_enforced: true,
      catalog_observation_may_proceed: false,
    });
  } finally {
    runtime.dispose();
  }
});

test("enabled one-shot permits only its exact New York trading date", async () => {
  const runtime = await loadControlRuntime();
  try {
    expect(
      runtime.build({
        env: {
          TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "true",
          TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_DATE: "2026-09-17",
        },
        tradingDate: "2026-09-17",
      }),
    ).toMatchObject({
      status: "ready",
      catalog_only_enforced: true,
      catalog_observation_may_proceed: true,
      target_trading_date: "2026-09-17",
      evaluated_trading_date: "2026-09-17",
    });
  } finally {
    runtime.dispose();
  }
});
