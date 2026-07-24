import { expect, test } from "@playwright/test";

import {
  buildHistoricalCandleStorageReadback,
  historicalCandleStorageReadbackToDetection,
} from "../../lib/historical-candle-storage-readback";
import { buildHistoricalBackfillDryRunPipeline } from "../../lib/historical-backfill-dry-run-pipeline";
import { buildHistoricalBackfillExecutionReadiness } from "../../lib/historical-backfill-execution-readiness";
import { buildHistoricalCandleStorageReadiness } from "../../lib/historical-candle-storage-readiness";

const checkedAt = "2026-07-09T15:00:00.000Z";

function passingReadback() {
  return buildHistoricalCandleStorageReadback({
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
    detection_source: "mock_catalog_readback",
    checked_at: checkedAt,
  });
}

function storageReadinessFromPassingReadback() {
  return buildHistoricalCandleStorageReadiness({
    migration_detection: historicalCandleStorageReadbackToDetection(
      passingReadback(),
    ),
  });
}

test("empty unavailable readback does not throw", () => {
  const readback = buildHistoricalCandleStorageReadback();

  expect(readback.advisory_only).toBe(true);
  expect(readback.readback_attempted).toBe(false);
  expect(readback.readback_status).toBe("unavailable");
  expect(readback.migration_applied).toBe("unknown");
  expect(readback.historical_candles_table_detected).toBe("unknown");
  expect(readback.safety.read_only).toBe(true);
});

test("readback ok maps table presence and migration to yes", () => {
  const readback = passingReadback();
  const detection = historicalCandleStorageReadbackToDetection(readback);
  const readiness = buildHistoricalCandleStorageReadiness({
    migration_detection: detection,
  });

  expect(readback.readback_status).toBe("ok");
  expect(readback.migration_applied).toBe(true);
  expect(readback.historical_candles_table_detected).toBe(true);
  expect(readback.historical_candle_fetch_runs_table_detected).toBe(true);
  expect(readiness.migration_readiness.migration_applied).toBe("yes");
  expect(readiness.migration_readiness.schema_readback_attempted).toBe(true);
  expect(readiness.migration_readiness.schema_readback_status).toBe("ok");
});

test("missing table maps to no and blocker", () => {
  const readback = buildHistoricalCandleStorageReadback({
    readback_attempted: true,
    migration_versions: ["20260709000000"],
    tables: ["historical_candles"],
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
  });

  expect(readback.readback_status).toBe("blocked");
  expect(readback.historical_candle_fetch_runs_table_detected).toBe(false);
  expect(readback.missing_items).toContain(
    "historical_candle_fetch_runs_table",
  );
});

test("unique key detected maps to yes and missing unique key maps to no", () => {
  expect(passingReadback().unique_key_detected).toBe(true);

  const readback = buildHistoricalCandleStorageReadback({
    readback_attempted: true,
    migration_versions: ["20260709000000"],
    tables: ["historical_candles", "historical_candle_fetch_runs"],
    unique_constraint_columns: ["provider", "ticker"],
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
  });

  expect(readback.unique_key_detected).toBe(false);
  expect(readback.missing_items).toContain("historical_candles_unique_key");
});

test("RLS true on both maps yes and any false blocks", () => {
  expect(passingReadback().rls_enabled).toBe(true);

  const readback = buildHistoricalCandleStorageReadback({
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
      historical_candle_fetch_runs: false,
    },
    policies: [],
    client_grants: [],
  });

  expect(readback.readback_status).toBe("blocked");
  expect(readback.rls_enabled).toBe(false);
  expect(readback.missing_items).toContain("historical_candle_rls");
});

test("zero policies maps client reads and writes allowed to no", () => {
  const readback = passingReadback();

  expect(readback.client_reads_allowed).toBe(false);
  expect(readback.client_writes_allowed).toBe(false);
});

test("safety flags remain false", () => {
  const readback = passingReadback();

  expect(readback.safety.provider_fetch_added).toBe(false);
  expect(readback.safety.historical_fetch_added).toBe(false);
  expect(readback.safety.candles_persisted).toBe(false);
  expect(readback.safety.fetch_run_persisted).toBe(false);
  expect(readback.safety.synthetic_outcomes_persisted).toBe(false);
  expect(readback.safety.replay_executed).toBe(false);
  expect(readback.safety.scanner_behavior_changed).toBe(false);
  expect(readback.safety.live_ranking_changed).toBe(false);
});

test("execution readiness moves to manual review only when schema readback passes", () => {
  const storageReadiness = storageReadinessFromPassingReadback();
  const pipeline = buildHistoricalBackfillDryRunPipeline({
    storage_readiness: storageReadiness,
    fetch_plan_input: {
      visible_recent_tickers: ["AAPL", "PLTR"],
      static_universe_tickers: ["AAPL", "PLTR"],
      migration_applied: true,
    },
  });
  const readiness = buildHistoricalBackfillExecutionReadiness({
    storage_readiness: storageReadiness,
    dry_run_pipeline: pipeline,
    provider_env_present: true,
  });

  expect(readiness.readiness_status).toBe("ready_for_manual_review");
  expect(readiness.blockers).not.toContain(
    "apply_or_verify_historical_candle_storage_migration",
  );
  expect(readiness.readiness_gates.manual_approval_gate_passed).toBe(false);
  expect(readiness.first_fetch_candidate_plan.enabled).toBe(false);
  expect(readiness.safety.provider_fetch_added).toBe(false);
  expect(readiness.safety.candles_persisted).toBe(false);
  expect(readiness.safety.replay_executed).toBe(false);
  expect(readiness.safety.scanner_behavior_changed).toBe(false);
});
