import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

const sourceAttempt = {
  utc_timestamp: "2026-09-16T15:30:17.000Z",
  trading_date: "2026-09-16",
  intraday_scan_window: "morning_momentum",
};

function validReceipt() {
  return {
    guard_version: "basic_free_scheduled_scan_credit_guard_v1",
    contract_version: "basic_free_discovery_credit_reservation_v1",
    scope: "normal_scheduled_scan",
    status: "provider_execution_allowed",
    provider_execution_allowed: true,
    trading_date: "2026-09-16",
    minute_bucket: "2026-09-16T15:30:00.000Z",
    requested_credits: 8,
    declared_daily_credit_budget: 800,
    declared_per_minute_credit_budget: 8,
    daily_reserved_credits: 8,
    daily_remaining_credits: 792,
    minute_reserved_credits: 8,
    minute_remaining_credits: 0,
    idempotent: false,
    finalization_status: "finalized",
    finalization_proven: true,
    safe_blocker: null,
  };
}

async function loadRuntime() {
  const directory = mkdtempSync(resolve(tmpdir(), "ture-basic-free-scan-readback-"));
  const output = resolve(directory, "basic-free-scheduled-scan-credit-readback.cjs");
  buildSync({
    entryPoints: [
      resolve(
        process.cwd(),
        "lib/basic-free-scheduled-scan-credit-readback.ts",
      ),
    ],
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
  });
  const runtimeModule = (await import(pathToFileURL(output).href)) as {
    basicFreeScheduledScanCreditReadbackFromUnknown: (
      value: unknown,
      source?: Record<string, unknown>,
    ) => Record<string, unknown>;
    basicFreeScheduledScanCreditReadbackFromScheduledAttempt: (
      attempt: Record<string, unknown>,
    ) => Record<string, unknown>;
  };
  return {
    ...runtimeModule,
    dispose() {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

test("normal Basic Free scan credit receipt exposes only a complete versioned budget guard", async () => {
  const runtime = await loadRuntime();
  try {
    expect(
      runtime.basicFreeScheduledScanCreditReadbackFromUnknown(validReceipt(), {
        observed_at: sourceAttempt.utc_timestamp,
        trading_date: sourceAttempt.trading_date,
        window: sourceAttempt.intraday_scan_window,
      }),
    ).toMatchObject({
      status: "available",
      reservation: {
        status: "provider_execution_allowed",
        provider_execution_allowed: true,
        requested_credits: 8,
        daily_reserved_credits: 8,
        minute_remaining_credits: 0,
        finalization_status: "finalized",
        finalization_proven: true,
      },
      reason_codes: [],
    });
  } finally {
    runtime.dispose();
  }
});

test("blocked reservation is readable, while malformed, mismatched, and untrusted payloads fail closed", async () => {
  const runtime = await loadRuntime();
  try {
    const blocked = {
      ...validReceipt(),
      status: "per_minute_credit_limit_reached",
      provider_execution_allowed: false,
      finalization_status: "not_started",
      finalization_proven: null,
      safe_blocker: "per_minute_credit_limit_reached",
    };
    const invalidRequestedCredits = {
      ...validReceipt(),
      requested_credits: 7,
    };
    const unprovenFinalization = {
      ...validReceipt(),
      finalization_status: "invalid_transition",
      finalization_proven: false,
      safe_blocker: "invalid_transition",
    };
    const untrustedBlocker = {
      ...validReceipt(),
      safe_blocker: "untrusted_sensitive_detail",
    };

    expect(
      runtime.basicFreeScheduledScanCreditReadbackFromScheduledAttempt({
        ...sourceAttempt,
        payload_json: {
          basic_free_scheduled_scan_credit_reservation: blocked,
        },
      }),
    ).toMatchObject({
      status: "available",
      reservation: {
        status: "per_minute_credit_limit_reached",
        provider_execution_allowed: false,
        safe_blocker: "per_minute_credit_limit_reached",
      },
      reason_codes: ["per_minute_credit_limit_reached"],
    });

    expect(
      runtime.basicFreeScheduledScanCreditReadbackFromScheduledAttempt({
        ...sourceAttempt,
        payload_json: {
          basic_free_scheduled_scan_credit_reservation: unprovenFinalization,
        },
      }),
    ).toMatchObject({
      status: "available",
      reservation: {
        status: "provider_execution_allowed",
        finalization_status: "invalid_transition",
        finalization_proven: false,
        safe_blocker: "invalid_transition",
      },
    });

    for (const receipt of [
      invalidRequestedCredits,
      untrustedBlocker,
      { ...validReceipt(), trading_date: "2026-09-15" },
      { ...validReceipt(), guard_version: "unknown" },
    ]) {
      expect(
        runtime.basicFreeScheduledScanCreditReadbackFromScheduledAttempt({
          ...sourceAttempt,
          payload_json: {
            basic_free_scheduled_scan_credit_reservation: receipt,
          },
        }),
      ).toMatchObject({
        status: "unavailable",
        reason_codes: [
          "basic_free_scheduled_scan_credit_receipt_missing_or_invalid",
        ],
      });
    }
  } finally {
    runtime.dispose();
  }
});

test("the app selects the latest valid guard receipt and labels its decision boundary", () => {
  const app = read("app/trade-app.tsx");

  expect(app).toContain(
    "basicFreeScheduledScanCreditReadbackFromScheduledAttempt",
  );
  expect(app).toContain("latestBasicFreeScheduledScanCreditReadback");
  expect(app).toContain("<BasicFreeScheduledScanCreditReceiptPanel");
  expect(app).toContain("Basic Free Normal Scan Guard");
  expect(app).toContain("not a provider-response, discovery-coverage, candidate,");
  expect(app).toContain("Provider-response and candidate facts must be read");
});
