import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

async function loadControlRuntime() {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-basic-free-capability-probe-"));
  const output = resolve(directory, "basic-free-capability-probe.cjs");
  buildSync({
    entryPoints: [
      resolve(process.cwd(), "lib/basic-free-catalog-capability-probe-control.ts"),
    ],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
  });
  const runtimeModule = (await import(pathToFileURL(output).href)) as {
    buildBasicFreeCatalogCapabilityProbeControl: (input: {
      env: Record<string, string | undefined>;
      tradingDate: string;
    }) => Record<string, unknown>;
  };
  return {
    build: runtimeModule.buildBasicFreeCatalogCapabilityProbeControl,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

test("capability probe is disabled by default and has no configurable request size", async () => {
  const runtime = await loadControlRuntime();
  try {
    expect(
      runtime.build({
        env: {
          TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE: "2026-09-18",
          TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_OUTPUT_SIZE: "9999",
        },
        tradingDate: "2026-09-18",
      }),
    ).toMatchObject({
      status: "disabled",
      catalog_only_enforced: false,
      capability_probe_may_proceed: false,
      requested_output_size: 100,
      maximum_provider_credits: 1,
    });
  } finally {
    runtime.dispose();
  }
});

test("an enabled probe fails closed unless its exact New York date is valid", async () => {
  const runtime = await loadControlRuntime();
  try {
    const enabled = { TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED: "true" };
    expect(runtime.build({ env: enabled, tradingDate: "2026-09-18" })).toMatchObject({
      status: "target_date_missing",
      catalog_only_enforced: true,
      capability_probe_may_proceed: false,
    });
    expect(
      runtime.build({
        env: {
          ...enabled,
          TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE: "2026-09-31",
        },
        tradingDate: "2026-09-18",
      }),
    ).toMatchObject({
      status: "target_date_invalid",
      catalog_only_enforced: true,
      capability_probe_may_proceed: false,
    });
    expect(
      runtime.build({
        env: {
          ...enabled,
          TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE: "2026-09-18",
        },
        tradingDate: "2026-09-19",
      }),
    ).toMatchObject({
      status: "outside_target_date",
      catalog_only_enforced: true,
      capability_probe_may_proceed: false,
    });
  } finally {
    runtime.dispose();
  }
});

test("the single fixed probe can proceed only on its configured date", async () => {
  const runtime = await loadControlRuntime();
  try {
    expect(
      runtime.build({
        env: {
          TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED: "true",
          TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE: "2026-09-18",
        },
        tradingDate: "2026-09-18",
      }),
    ).toMatchObject({
      status: "ready",
      catalog_only_enforced: true,
      capability_probe_may_proceed: true,
      requested_output_size: 100,
      maximum_provider_credits: 1,
    });
  } finally {
    runtime.dispose();
  }
});
