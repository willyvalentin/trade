import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { build } from "esbuild";

const now = new Date("2026-09-17T15:00:00.000Z");

type Readiness = Record<string, unknown> & { blockers: string[] };

async function loadReadinessRuntime() {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-basic-free-readiness-"));
  const output = resolve(directory, "basic-free-readiness.cjs");
  await build({
    entryPoints: [
      resolve(process.cwd(), "lib/basic-free-catalog-observation-readiness.ts"),
    ],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
    plugins: [
      {
        name: "server-only-test-stub",
        setup(build) {
          build.onResolve({ filter: /^server-only$/ }, () => ({
            path: "server-only",
            namespace: "test-stub",
          }));
          build.onLoad({ filter: /.*/, namespace: "test-stub" }, () => ({
            contents: "",
          }));
        },
      },
    ],
  });
  const runtimeModule = (await import(pathToFileURL(output).href)) as {
    buildBasicFreeCatalogObservationReadiness: (input: {
      env: Record<string, string | undefined>;
      now: Date;
    }) => Readiness;
  };

  return {
    build: runtimeModule.buildBasicFreeCatalogObservationReadiness,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

test("Basic Free observation readiness fails closed by default without granting request authority", async () => {
  const runtime = await loadReadinessRuntime();
  try {
    const readiness = runtime.build({ env: {}, now });

    expect(readiness).toMatchObject({
      status: "blocked",
      admission: {
        status: "disabled",
        runtime_enabled: false,
        reason_codes: ["runtime_disabled"],
      },
      one_shot_control: {
        status: "disabled",
        catalog_observation_may_proceed: false,
      },
      provider_request_authority: "not_granted_by_readiness",
    });
    expect(readiness.blockers).toEqual([
      "runtime_disabled",
      "basic_free_catalog_one_shot_disabled",
    ]);
  } finally {
    runtime.dispose();
  }
});

test("Basic Free readiness reports an exact contained configuration without claiming provider authority", async () => {
  const runtime = await loadReadinessRuntime();
  try {
    const readiness = runtime.build({
      now,
      env: {
      TWELVE_DATA_PLAN_MODE: "free",
      TURE_BASIC_FREE_CATALOG_OBSERVATION_ENABLED: "true",
      TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "800",
      TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8",
      TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "true",
      TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_DATE: "2026-09-17",
      },
    });

    expect(readiness).toMatchObject({
    status: "contained_ready",
    evaluated_trading_date: "2026-09-17",
    admission: {
      status: "ready",
      plan_eligibility: "configured_basic_free",
      declared_daily_credit_budget: 800,
      declared_per_minute_credit_budget: 8,
    },
    one_shot_control: {
      status: "ready",
      catalog_only_enforced: true,
      catalog_observation_may_proceed: true,
    },
    blockers: [],
    provider_request_authority: "not_granted_by_readiness",
    });
  } finally {
    runtime.dispose();
  }
});

test("Basic Free readiness rejects an excessive declared budget even with an exact one-shot date", async () => {
  const runtime = await loadReadinessRuntime();
  try {
    const readiness = runtime.build({
      now,
      env: {
      TWELVE_DATA_PLAN_MODE: "free",
      TURE_BASIC_FREE_CATALOG_OBSERVATION_ENABLED: "true",
      TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET: "801",
      TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET: "8",
      TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED: "true",
      TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_DATE: "2026-09-17",
      },
    });

    expect(readiness).toMatchObject({
    status: "blocked",
    admission: {
      status: "budget_invalid",
      reason_codes: ["daily_credit_budget_invalid"],
    },
    one_shot_control: { status: "ready" },
    });
    expect(readiness.blockers).toEqual(["daily_credit_budget_invalid"]);
  } finally {
    runtime.dispose();
  }
});
