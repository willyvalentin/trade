import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  executeFirstTinyHistoricalFetchApprovedNoPersistAttempt,
} from "../../lib/first-tiny-historical-fetch-approved-no-persist-attempt";
import {
  buildHistoricalCandleStorageReadback,
  historicalCandleStorageReadbackToDetection,
} from "../../lib/historical-candle-storage-readback";

const runbookPath = join(
  process.cwd(),
  "docs/first-tiny-historical-fetch-approved-provider-call-verification.md",
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

function approvedEnv() {
  return {
    TWELVE_DATA_API_KEY: "test-twelve-data-key",
    TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED: "true",
    TURE_FIRST_TINY_HISTORICAL_FETCH_OPERATOR_LABEL: "operator",
    TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVAL_REFERENCE: "approval-ref-1",
    TURE_FIRST_TINY_HISTORICAL_FETCH_TICKER: "COIN",
    TURE_FIRST_TINY_HISTORICAL_FETCH_MAX_REQUESTS: "1",
    TURE_FIRST_TINY_HISTORICAL_FETCH_ESTIMATED_CREDITS: "1",
    TURE_FIRST_TINY_HISTORICAL_FETCH_PERSIST_ALLOWED: "false",
    TURE_FIRST_TINY_HISTORICAL_FETCH_REPLAY_ALLOWED: "false",
    TURE_FIRST_TINY_HISTORICAL_FETCH_SCANNER_EFFECT_ALLOWED: "false",
  };
}

function providerResponse() {
  return {
    meta: {
      symbol: "COIN",
      interval: "5min",
      exchange_timezone: "America/New_York",
      exchange: "NASDAQ",
    },
    values: [
      {
        datetime: "2026-07-08 09:30:00",
        open: "220.10",
        high: "221.50",
        low: "219.80",
        close: "221.00",
        volume: "1000",
      },
      {
        datetime: "2026-07-08 09:35:00",
        open: "221.00",
        high: "222.00",
        low: "220.90",
        close: "221.40",
        volume: "1200",
      },
    ],
    status: "ok",
  };
}

function expectNoPersistence(
  result: Awaited<
    ReturnType<typeof executeFirstTinyHistoricalFetchApprovedNoPersistAttempt>
  >,
) {
  expect(result.provider_result.raw_response_persisted).toBe(false);
  expect(result.persistence_plan.candles_persisted).toBe(false);
  expect(result.persistence_plan.fetch_run_persisted).toBe(false);
  expect(result.safety.synthetic_outcomes_persisted).toBe(false);
  expect(result.safety.replay_executed).toBe(false);
  expect(result.safety.scanner_behavior_changed).toBe(false);
  expect(result.safety.live_ranking_changed).toBe(false);
  expect(result.provider_result.api_key_included_in_diagnostics).toBe(false);
}

test("runbook exists and summarizes current approved scope", () => {
  const runbook = readRunbook();

  expect(runbook).toContain(
    "First Tiny Historical Fetch Approved Provider Call Verification",
  );
  expect(runbook).toContain("Provider: Twelve Data");
  expect(runbook).toContain("Endpoint: `time_series`");
  expect(runbook).toContain("Ticker: `COIN`");
  expect(runbook).toContain("Interval: `5min`");
  expect(runbook).toContain("Request count: `1`");
  expect(runbook).toContain("Estimated credits: `1`");
});

test("runbook lists required approval env vars", () => {
  const runbook = readRunbook();

  expect(runbook).toContain("TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED=true");
  expect(runbook).toContain(
    "TURE_FIRST_TINY_HISTORICAL_FETCH_OPERATOR_LABEL=<safe_label>",
  );
  expect(runbook).toContain(
    "TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVAL_REFERENCE=<safe_reference>",
  );
  expect(runbook).toContain("TURE_FIRST_TINY_HISTORICAL_FETCH_TICKER=COIN");
  expect(runbook).toContain(
    "TURE_FIRST_TINY_HISTORICAL_FETCH_MAX_REQUESTS=1",
  );
  expect(runbook).toContain(
    "TURE_FIRST_TINY_HISTORICAL_FETCH_ESTIMATED_CREDITS=1",
  );
  expect(runbook).toContain(
    "TURE_FIRST_TINY_HISTORICAL_FETCH_PERSIST_ALLOWED=false",
  );
  expect(runbook).toContain(
    "TURE_FIRST_TINY_HISTORICAL_FETCH_REPLAY_ALLOWED=false",
  );
  expect(runbook).toContain(
    "TURE_FIRST_TINY_HISTORICAL_FETCH_SCANNER_EFFECT_ALLOWED=false",
  );
});

test("runbook includes exact production curl command", () => {
  const runbook = readRunbook();

  expect(runbook).toContain("cd /Users/willysimonsson/Dev/trade");
  expect(runbook).toContain("source .env.local");
  expect(runbook).toContain(
    "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch",
  );
  expect(runbook).toContain(
    '-H "x-automation-secret: ${AUTOMATION_SECRET}"',
  );
  expect(runbook).toContain("--data '{\"execute_provider_call\":true}'");
});

test("runbook states no persist no replay and no scanner effect", () => {
  const runbook = readRunbook();

  expect(runbook).toContain("Persist candles: no");
  expect(runbook).toContain("Persist fetch runs: no");
  expect(runbook).toContain("Persist raw response: no");
  expect(runbook).toContain("Synthetic outcomes: no");
  expect(runbook).toContain("Replay/backfill: no");
  expect(runbook).toContain("Scanner effect: no");
  expect(runbook).toContain("Live ranking effect: no");
});

test("runbook documents cache hit and provider outcomes", () => {
  const runbook = readRunbook();

  expect(runbook).toContain("cache_hit_skipped_provider");
  expect(runbook).toContain("provider_call_completed_no_persist");
  expect(runbook).toContain("provider_call_failed_no_persist");
  expect(runbook).toContain("not_approved");
  expect(runbook).toContain("blocked");
  expect(runbook).toContain("API key");
  expect(runbook).toContain("must not be exposed");
});

test("approved mocked cache miss completes provider path with no persistence", async () => {
  let calls = 0;
  const result = await executeFirstTinyHistoricalFetchApprovedNoPersistAttempt({
    execute_provider_call: true,
    env: approvedEnv(),
    storage_detection: storageDetection(),
    cache_lookup: () => ({ available: true, hit: false }),
    provider_call: (scope) => {
      calls += 1;
      expect(scope.provider).toBe("twelve_data");
      expect(scope.endpoint).toBe("time_series");
      expect(scope.ticker).toBe("COIN");
      expect(scope.interval).toBe("5min");
      expect(scope.request_count).toBe(1);
      expect(scope.estimated_credits).toBe(1);
      return {
        ok: true,
        http_status: 200,
        response: providerResponse(),
      };
    },
  });

  expect(calls).toBe(1);
  expect(result.execution_status).toBe("provider_call_completed_no_persist");
  expect(result.provider_call_executed).toBe(true);
  expect(result.provider_result.call_attempted).toBe(true);
  expect(result.provider_result.call_succeeded).toBe(true);
  expect(result.parser_result.parse_attempted).toBe(true);
  expect(result.parser_result.valid_candles).toBe(2);
  expect(result.persistence_plan.persistence_planned).toBe(true);
  expectNoPersistence(result);
});

test("provider failure returns failed no-persist result", async () => {
  const result = await executeFirstTinyHistoricalFetchApprovedNoPersistAttempt({
    execute_provider_call: true,
    env: approvedEnv(),
    storage_detection: storageDetection(),
    cache_lookup: () => ({ available: true, hit: false }),
    provider_call: () => ({
      ok: false,
      http_status: 429,
      response: { status: "error", message: "rate limit" },
      error_type: "provider_error_response",
    }),
  });

  expect(result.execution_status).toBe("provider_call_failed_no_persist");
  expect(result.provider_call_executed).toBe(true);
  expect(result.provider_result.call_attempted).toBe(true);
  expect(result.provider_result.call_succeeded).toBe(false);
  expect(result.provider_result.provider_error_type).toBe(
    "provider_error_response",
  );
  expect(result.parser_result.parse_attempted).toBe(false);
  expectNoPersistence(result);
});

test("cache hit skips provider with no persistence", async () => {
  const result = await executeFirstTinyHistoricalFetchApprovedNoPersistAttempt({
    execute_provider_call: true,
    env: approvedEnv(),
    storage_detection: storageDetection(),
    cache_lookup: () => ({
      available: true,
      hit: true,
      source: "historical_candles",
    }),
    provider_call: () => {
      throw new Error("provider should not be called on cache hit");
    },
  });

  expect(result.execution_status).toBe("cache_hit_skipped_provider");
  expect(result.provider_call_executed).toBe(false);
  expect(result.provider_result.call_attempted).toBe(false);
  expect(result.cache_preflight.provider_skipped_due_cache_hit).toBe(true);
  expectNoPersistence(result);
});
