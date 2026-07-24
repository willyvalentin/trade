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

const docsPath = join(
  process.cwd(),
  "docs/first-tiny-historical-fetch-auth-diagnostics.md",
);
const evaluatedAt = "2026-07-09T15:00:00.000Z";

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

async function withRouteEnv<T>(
  env: {
    automationSecret?: string | null;
    twelveDataApiKey?: string | null;
  },
  callback: () => Promise<T>,
) {
  const previousAutomationSecret = process.env.AUTOMATION_SECRET;
  const previousTwelveDataApiKey = process.env.TWELVE_DATA_API_KEY;

  if (env.automationSecret === null || env.automationSecret === undefined) {
    delete process.env.AUTOMATION_SECRET;
  } else {
    process.env.AUTOMATION_SECRET = env.automationSecret;
  }
  if (env.twelveDataApiKey === null || env.twelveDataApiKey === undefined) {
    delete process.env.TWELVE_DATA_API_KEY;
  } else {
    process.env.TWELVE_DATA_API_KEY = env.twelveDataApiKey;
  }

  try {
    return await callback();
  } finally {
    if (previousAutomationSecret === undefined) {
      delete process.env.AUTOMATION_SECRET;
    } else {
      process.env.AUTOMATION_SECRET = previousAutomationSecret;
    }
    if (previousTwelveDataApiKey === undefined) {
      delete process.env.TWELVE_DATA_API_KEY;
    } else {
      process.env.TWELVE_DATA_API_KEY = previousTwelveDataApiKey;
    }
  }
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

test("runbook documents safe production auth diagnostics curl", () => {
  const runbook = readFileSync(docsPath, "utf8");

  expect(runbook).toContain("First Tiny Historical Fetch Auth Diagnostics");
  expect(runbook).toContain("cd /Users/willysimonsson/Dev/trade");
  expect(runbook).toContain("source .env.local");
  expect(runbook).toContain(
    "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch",
  );
  expect(runbook).toContain(
    '-H "x-automation-secret: ${AUTOMATION_SECRET}"',
  );
  expect(runbook).toContain("--data '{\"auth_check_only\":true}'");
  expect(runbook).not.toContain("test-automation-secret");
});

test("missing header returns unauthorized with safe diagnostics", async () => {
  const secret = "a".repeat(64);
  const response = await withRouteEnv(
    { automationSecret: secret, twelveDataApiKey: "test-twelve-key" },
    () => routePost({ body: { auth_check_only: true } }),
  );
  const body = await response.json();
  const serialized = JSON.stringify(body);

  expect(response.status).toBe(401);
  expect(body.error).toBe("Unauthorized.");
  expect(body.auth_diagnostics.env_name_used).toBe("AUTOMATION_SECRET");
  expect(body.auth_diagnostics.server_secret_present).toBe(true);
  expect(body.auth_diagnostics.server_secret_length).toBe(64);
  expect(body.auth_diagnostics.header_name_used).toBe("x-automation-secret");
  expect(body.auth_diagnostics.header_present).toBe(false);
  expect(body.auth_diagnostics.header_length).toBe(0);
  expect(body.auth_diagnostics.header_matches).toBe(false);
  expect(body.auth_diagnostics.trimmed_header_matches).toBe(false);
  expect(body.auth_diagnostics.runtime).toBe("server");
  expect(body.auth_diagnostics.diagnostics_safe).toBe(true);
  expect(body.provider_call_executed).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(serialized).not.toContain(secret);
  expect(serialized).not.toContain("test-twelve-key");
});

test("missing server secret returns unauthorized with safe diagnostics", async () => {
  const header = "b".repeat(64);
  const response = await withRouteEnv(
    { automationSecret: null, twelveDataApiKey: "test-twelve-key" },
    () => routePost({ secret: header, body: { auth_check_only: true } }),
  );
  const body = await response.json();
  const serialized = JSON.stringify(body);

  expect(response.status).toBe(401);
  expect(body.auth_diagnostics.server_secret_present).toBe(false);
  expect(body.auth_diagnostics.server_secret_length).toBe(0);
  expect(body.auth_diagnostics.header_present).toBe(true);
  expect(body.auth_diagnostics.header_length).toBe(64);
  expect(body.auth_diagnostics.header_matches).toBe(false);
  expect(body.auth_diagnostics.trimmed_header_matches).toBe(false);
  expect(body.provider_call_executed).toBe(false);
  expect(serialized).not.toContain(header);
  expect(serialized).not.toContain("test-twelve-key");
});

test("mismatched header returns lengths without exposing values", async () => {
  const secret = "c".repeat(64);
  const header = "d".repeat(63);
  const response = await withRouteEnv(
    { automationSecret: secret, twelveDataApiKey: "test-twelve-key" },
    () => routePost({ secret: header, body: { auth_check_only: true } }),
  );
  const body = await response.json();
  const serialized = JSON.stringify(body);

  expect(response.status).toBe(401);
  expect(body.auth_diagnostics.server_secret_length).toBe(64);
  expect(body.auth_diagnostics.header_present).toBe(true);
  expect(body.auth_diagnostics.header_length).toBe(63);
  expect(body.auth_diagnostics.header_matches).toBe(false);
  expect(body.auth_diagnostics.trimmed_header_matches).toBe(false);
  expect(body.provider_call_executed).toBe(false);
  expect(serialized).not.toContain(secret);
  expect(serialized).not.toContain(header);
  expect(serialized).not.toContain("test-twelve-key");
});

test("matching header auth_check_only returns ok and no runtime effects", async () => {
  const secret = "e".repeat(64);
  const response = await withRouteEnv(
    { automationSecret: secret, twelveDataApiKey: "test-twelve-key" },
    () => routePost({ secret, body: { auth_check_only: true } }),
  );
  const body = await response.json();
  const serialized = JSON.stringify(body);

  expect(response.status).toBe(200);
  expect(body.ok).toBe(true);
  expect(body.auth_check_only).toBe(true);
  expect(body.auth_diagnostics.server_secret_present).toBe(true);
  expect(body.auth_diagnostics.server_secret_length).toBe(64);
  expect(body.auth_diagnostics.header_present).toBe(true);
  expect(body.auth_diagnostics.header_length).toBe(64);
  expect(body.auth_diagnostics.header_matches).toBe(true);
  expect(body.auth_diagnostics.trimmed_header_matches).toBe(true);
  expect(body.auth_diagnostics.diagnostics_safe).toBe(true);
  expect(body.provider_call_executed).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.raw_response_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(body.live_ranking_changed).toBe(false);
  expect(serialized).not.toContain(secret);
  expect(serialized).not.toContain("test-twelve-key");
});

test("normal missing execute_provider_call behavior is preserved", async () => {
  const secret = "f".repeat(64);
  const response = await withRouteEnv(
    { automationSecret: secret, twelveDataApiKey: "test-twelve-key" },
    () => routePost({ secret, body: {} }),
  );
  const body = await response.json();

  expect(response.status).toBe(400);
  expect(body.error).toBe("execute_provider_call_true_required");
  expect(body.provider_call_executed).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
});

test("normal no-approval behavior remains not approved with no provider work", async () => {
  const result = await executeFirstTinyHistoricalFetchApprovedNoPersistAttempt({
    execute_provider_call: true,
    env: {
      TWELVE_DATA_API_KEY: "test-twelve-key",
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
  expect(result.persistence_plan.candles_persisted).toBe(false);
  expect(result.persistence_plan.fetch_run_persisted).toBe(false);
  expect(result.safety.replay_executed).toBe(false);
  expect(result.safety.scanner_behavior_changed).toBe(false);
  expect(result.safety.live_ranking_changed).toBe(false);
});
