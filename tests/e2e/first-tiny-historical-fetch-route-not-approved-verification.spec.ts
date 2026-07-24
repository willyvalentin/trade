import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { POST } from "../../app/api/historical-backfill/first-tiny-fetch/route";
import {
  executeFirstTinyHistoricalFetchApprovedNoPersistAttempt,
} from "../../lib/first-tiny-historical-fetch-approved-no-persist-attempt";
import {
  buildHistoricalCandleStorageReadback,
  historicalCandleStorageReadbackToDetection,
} from "../../lib/historical-candle-storage-readback";

const runbookPath = join(
  process.cwd(),
  "docs/first-tiny-historical-fetch-route-not-approved-verification.md",
);
const evaluatedAt = "2026-07-09T15:00:00.000Z";

function readRunbook() {
  return readFileSync(runbookPath, "utf8");
}

function storageDetection() {
  return historicalCandleStorageReadbackToDetection(
    buildHistoricalCandleStorageReadback({
      readback_attempted: true,
      migration_versions: ["20260709000000"],
      tables: ["historical_candles", "historical_candle_fetch_runs"],
      unique_constraint_columns: [
        "provider",
        "ticker",
        "interval",
        "timestamp",
        "adjusted",
      ],
      indexes: [
        "historical_candles_ticker_interval_timestamp_idx",
        "historical_candles_provider_ticker_trading_day_idx",
        "historical_candles_interval_timestamp_idx",
        "historical_candles_fetch_run_id_idx",
        "historical_candles_validation_status_idx",
        "historical_candle_fetch_runs_provider_requested_at_idx",
        "historical_candle_fetch_runs_status_idx",
        "historical_candle_fetch_runs_interval_trading_day_range_idx",
      ],
      rls_enabled_by_table: {
        historical_candles: true,
        historical_candle_fetch_runs: true,
      },
      policies: [],
      client_grants: [],
      checked_at: evaluatedAt,
    }),
  );
}

async function routePost(input: {
  secret?: string | null;
  body?: unknown;
}) {
  const headers = new Headers({ "content-type": "application/json" });
  if (input.secret !== undefined && input.secret !== null) {
    headers.set("x-automation-secret", input.secret);
  }

  return POST(
    new Request("http://localhost/api/historical-backfill/first-tiny-fetch", {
      method: "POST",
      headers,
      body: JSON.stringify(input.body ?? {}),
    }),
  );
}

async function withAutomationSecret<T>(callback: () => Promise<T>) {
  const previous = process.env.AUTOMATION_SECRET;
  process.env.AUTOMATION_SECRET = "test-automation-secret";
  try {
    return await callback();
  } finally {
    if (previous === undefined) {
      delete process.env.AUTOMATION_SECRET;
    } else {
      process.env.AUTOMATION_SECRET = previous;
    }
  }
}

test("runbook exists and includes production curl setup", () => {
  const runbook = readRunbook();

  expect(runbook).toContain(
    "First Tiny Historical Fetch Route Not-Approved Verification",
  );
  expect(runbook).toContain("cd /Users/willysimonsson/Dev/trade");
  expect(runbook).toContain("source .env.local");
  expect(runbook).toContain(
    "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch",
  );
  expect(runbook).toContain(
    '-H "x-automation-secret: ${AUTOMATION_SECRET}"',
  );
  expect(runbook).not.toContain("test-automation-secret");
});

test("runbook includes missing-secret verification", () => {
  const runbook = readRunbook();

  expect(runbook).toContain("Missing Automation Secret Should Fail");
  expect(runbook).toContain("Unauthorized.");
  expect(runbook).toContain("--data '{\"execute_provider_call\":true}'");
});

test("runbook includes missing execute-provider-call verification", () => {
  const runbook = readRunbook();

  expect(runbook).toContain("Missing `execute_provider_call: true` Should Fail");
  expect(runbook).toContain("execute_provider_call_true_required");
  expect(runbook).toContain("--data '{}'");
});

test("runbook includes scope override rejection verification", () => {
  const runbook = readRunbook();

  expect(runbook).toContain("Scope Override Attempt Should Fail");
  expect(runbook).toContain("arbitrary_scope_override_rejected");
  expect(runbook).toContain(
    "--data '{\"execute_provider_call\":true,\"ticker\":\"AAPL\"}'",
  );
});

test("runbook includes authenticated not-approved production curl", () => {
  const runbook = readRunbook();

  expect(runbook).toContain("Authenticated Default Without Approval Signal");
  expect(runbook).toContain("execution_status` is `not_approved");
  expect(runbook).toContain("provider_result.call_attempted` is false");
  expect(runbook).toContain("provider_result.api_key_included_in_diagnostics");
});

test("route rejects missing automation secret", async () => {
  const response = await withAutomationSecret(() =>
    routePost({ body: { execute_provider_call: true } }),
  );
  const body = await response.json();

  expect(response.status).toBe(401);
  expect(body.error).toBe("Unauthorized.");
});

test("route rejects missing execute_provider_call true", async () => {
  const response = await withAutomationSecret(() =>
    routePost({
      secret: "test-automation-secret",
      body: {},
    }),
  );
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(body.error).toBe("execute_provider_call_true_required");
  expect(body.provider_call_executed).toBe(false);
  expect(body.candles_persisted).toBe(false);
});

test("route rejects request-supplied scope overrides", async () => {
  const response = await withAutomationSecret(() =>
    routePost({
      secret: "test-automation-secret",
      body: { execute_provider_call: true, provider: "polygon" },
    }),
  );
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(body.error).toBe("arbitrary_scope_override_rejected");
  expect(body.provider_call_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
});

test("default helper without approval returns not approved and no provider call", async () => {
  const result = await executeFirstTinyHistoricalFetchApprovedNoPersistAttempt({
    execute_provider_call: true,
    env: {
      TWELVE_DATA_API_KEY: "test-twelve-data-key",
    },
    storage_detection: storageDetection(),
    cache_lookup: () => {
      throw new Error("cache lookup should not happen without approval");
    },
    provider_call: () => {
      throw new Error("provider call should not happen without approval");
    },
  });

  expect(result.execution_status).toBe("not_approved");
  expect(result.provider_call_executed).toBe(false);
  expect(result.provider_result.call_attempted).toBe(false);
  expect(result.provider_result.call_succeeded).toBe(false);
  expect(result.provider_result.raw_response_received).toBe(false);
  expect(result.provider_result.raw_response_persisted).toBe(false);
  expect(result.provider_result.api_key_included_in_diagnostics).toBe(false);
  expect(result.persistence_plan.candles_persisted).toBe(false);
  expect(result.persistence_plan.fetch_run_persisted).toBe(false);
  expect(result.safety.synthetic_outcomes_persisted).toBe(false);
  expect(result.safety.replay_executed).toBe(false);
  expect(result.safety.scanner_behavior_changed).toBe(false);
  expect(result.safety.live_ranking_changed).toBe(false);
});
