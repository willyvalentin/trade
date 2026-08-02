import { createHash } from "node:crypto";

import {
  MARKET_CONTEXT_SECTOR_ETF_SYMBOLS_V2,
  MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_V2,
  MARKET_CONTEXT_TRADE_MAX_LATENESS_NS,
  MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2,
  MARKET_CONTEXT_TRADE_SESSION_POLICY_V2,
  MARKET_CONTEXT_TRADE_TIEBREAK_POLICY_V2,
  MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2,
  MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2,
  computeMarketContextSectorSourceDigestV2,
  computeMarketContextTradeRawRecordsDigestV2,
  computeMarketContextTradeRecordDigestV2,
  computeMarketContextXnysCalendarDigestV2,
  stableMarketContextTradePreparationJsonV2,
  type MarketContextSectorEtfBreadthInputV2,
  type MarketContextTradePreparationManifestV2,
  type MarketContextTradeRawPayloadV2,
  type MarketContextTradeRecordV2,
  type MarketContextTradeSessionV2,
} from "./trade-to-candle-preparation-v2";
import {
  MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1,
  MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_TARGET_V1,
  MARKET_CONTEXT_HISTORICAL_DATASET_TARGET_V1,
  MARKET_CONTEXT_TRADE_M1_BINDING_ADAPTER_V2,
  type MarketContextTradeM1BindingMetadataV2,
} from "./trade-to-candle-m1-binding-v2";

export const MARKET_CONTEXT_TRADE_TO_CANDLE_FIXTURES_V2 =
  "market_context_historical_trade_to_candle_synthetic_fixtures_v2" as const;

const nsPerMs = BigInt("1000000");

export function fixtureUnixNsV2(
  isoWithExplicitOffset: string,
  additionalNanoseconds = BigInt(0),
) {
  return (
    BigInt(Date.parse(isoWithExplicitOffset)) * nsPerMs +
    additionalNanoseconds
  ).toString();
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

const regularSession: MarketContextTradeSessionV2 = {
  session_id: "XNYS-2026-03-09-regular",
  session_date: "2026-03-09",
  session_type: "regular",
  exchange_timezone: "America/New_York",
  open_unix_ns: fixtureUnixNsV2("2026-03-09T13:30:00.000Z"),
  close_unix_ns: fixtureUnixNsV2("2026-03-09T13:33:00.000Z"),
};

function calendar(sessions: MarketContextTradeSessionV2[] = [
  regularSession,
]) {
  const unsigned = {
    artifact_id: "synthetic-xnys-calendar-artifact",
    artifact_version: "synthetic_xnys_2026_v2",
    exchange: "XNYS" as const,
    exchange_timezone: "America/New_York" as const,
    sessions,
  };
  return {
    ...unsigned,
    artifact_sha256:
      computeMarketContextXnysCalendarDigestV2(unsigned),
  };
}

export function marketContextTradeManifestFixtureV2(
  options: {
    symbols?: string[];
    sessions?: MarketContextTradeSessionV2[];
    asOfUnixNs?: string;
  } = {},
): MarketContextTradePreparationManifestV2 {
  return {
    contract_version: MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2,
    preparation_policy_version:
      MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2,
    dataset: {
      provider: "synthetic_databento_schema_fixture",
      provider_product: "synthetic_EQUS_MINI",
      provider_build: "synthetic_build_2026_07_27",
      provider_revision: "synthetic_revision_1",
      dataset_id: "EQUS.MINI",
      dataset_version: "synthetic_eq_us_mini_fixture_v2",
      schema: "trades",
      schema_version: "synthetic_dbn_trades_schema_v2",
    },
    symbols: options.symbols ?? ["SPY"],
    preparation_as_of_unix_ns:
      options.asOfUnixNs ??
      fixtureUnixNsV2("2026-03-09T13:33:05.000Z"),
    watermark: {
      policy_version: MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2,
      max_lateness_ns: MARKET_CONTEXT_TRADE_MAX_LATENESS_NS,
      evidence_status: "empirically_unvalidated",
      late_trade_policy: "exclude_and_count",
      unfinalized_bucket_policy: "pending_not_gap",
    },
    tiebreak: {
      policy_version: MARKET_CONTEXT_TRADE_TIEBREAK_POLICY_V2,
      identity_scope: "global_dataset",
      uniqueness: "required",
      missing_or_conflicting_policy: "reject_dataset",
    },
    eligibility: {
      policy_version: MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_V2,
      required_action: "T",
      allowed_flags_mask: 129,
      rejected_data_quality_flags_mask: 12,
      unsupported_flags_mask: 114,
      conditions_policy: "empty_only_fail_closed",
      numeric_policy: "provider_bounds_fail_closed",
      duplicate_policy: "reject_dataset",
    },
    session_calendar: {
      policy_version: MARKET_CONTEXT_TRADE_SESSION_POLICY_V2,
      artifact: calendar(options.sessions),
      outside_session_policy: "exclude_and_count",
      finalized_missing_minute_policy:
        "preserve_gap_no_forward_fill",
      future_session_minute_policy: "omit_not_observable",
    },
    corporate_actions: {
      policy_version: "synthetic_corporate_action_policy_v2",
      adjustment_state: "raw",
      split_policy: "synthetic_raw_split_policy",
      dividend_policy: "synthetic_raw_dividend_policy",
      point_in_time_attested: true,
    },
    immutable_raw_records_digest: "",
  };
}

function rawPayload(
  id: string,
  sourcePosition: number,
  overrides: Partial<MarketContextTradeRawPayloadV2> = {},
): MarketContextTradeRawPayloadV2 {
  return {
    provider: "synthetic_databento_schema_fixture",
    provider_product: "synthetic_EQUS_MINI",
    provider_build: "synthetic_build_2026_07_27",
    provider_revision: "synthetic_revision_1",
    dataset_id: "EQUS.MINI",
    dataset_version: "synthetic_eq_us_mini_fixture_v2",
    schema: "trades",
    schema_version: "synthetic_dbn_trades_schema_v2",
    symbol: "SPY",
    ts_event_unix_ns: fixtureUnixNsV2(
      "2026-03-09T13:30:00.100Z",
      BigInt(sourcePosition + 1),
    ),
    ts_recv_unix_ns: fixtureUnixNsV2(
      "2026-03-09T13:30:00.200Z",
      BigInt(sourcePosition + 1),
    ),
    price_scaled_1e9: (
      BigInt("600000000000") +
      BigInt(sourcePosition) * BigInt("1000000000")
    ).toString(),
    size_uint32: 10 + sourcePosition,
    sequence_uint32: 0,
    tie_break_id: `global-tie-${id}`,
    source_position: sourcePosition,
    action: "T",
    flags_uint8: 128,
    conditions: [],
    raw_record_id: id,
    ...overrides,
  };
}

export function marketContextTradeRecordFixtureV2(
  id: string,
  sourcePosition: number,
  overrides: Partial<MarketContextTradeRawPayloadV2> = {},
): MarketContextTradeRecordV2 {
  const raw = rawPayload(id, sourcePosition, overrides);
  return {
    ...raw,
    raw_record_sha256: computeMarketContextTradeRecordDigestV2(raw),
  };
}

export function rehashMarketContextTradeInputV2(input: {
  manifest: MarketContextTradePreparationManifestV2;
  records: MarketContextTradeRecordV2[];
}) {
  for (const record of input.records) {
    const raw = { ...record } as Partial<MarketContextTradeRecordV2>;
    delete raw.raw_record_sha256;
    record.raw_record_sha256 =
      computeMarketContextTradeRecordDigestV2(
        raw as MarketContextTradeRawPayloadV2,
      );
  }
  input.manifest.immutable_raw_records_digest =
    computeMarketContextTradeRawRecordsDigestV2(input.records);
  return input;
}

export function marketContextTradePreparationFixtureV2() {
  return rehashMarketContextTradeInputV2({
    manifest: marketContextTradeManifestFixtureV2(),
    records: [
      marketContextTradeRecordFixtureV2("nano-3", 2, {
        ts_event_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:00.100Z",
          BigInt(3),
        ),
        ts_recv_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:00.200Z",
          BigInt(3),
        ),
        price_scaled_1e9: "601000000000",
        size_uint32: 30,
        tie_break_id: "global-tie-c",
      }),
      marketContextTradeRecordFixtureV2("nano-1", 0, {
        ts_event_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:00.100Z",
          BigInt(1),
        ),
        ts_recv_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:00.200Z",
          BigInt(1),
        ),
        price_scaled_1e9: "600000000000",
        size_uint32: 10,
        tie_break_id: "global-tie-a",
      }),
      marketContextTradeRecordFixtureV2("nano-2", 1, {
        ts_event_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:00.100Z",
          BigInt(2),
        ),
        ts_recv_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:00.200Z",
          BigInt(2),
        ),
        price_scaled_1e9: "602000000000",
        size_uint32: 20,
        tie_break_id: "global-tie-b",
      }),
    ],
  });
}

export function marketContextSectorBreadthFixtureV2(): MarketContextSectorEtfBreadthInputV2 {
  const sectors = MARKET_CONTEXT_SECTOR_ETF_SYMBOLS_V2.map(
    (sector, index) => ({
      symbol: sector,
      current_close_scaled_1e9:
        index < 7 ? "101000000000" : "99000000000",
      previous_close_scaled_1e9: "100000000000",
      short_average_scaled_1e9:
        index < 6 ? "100000000000" : "102000000000",
      candle_digest: sha256(`synthetic-v2-candle:${sector}`),
    }),
  );
  return {
    timestamp_unix_ns: fixtureUnixNsV2(
      "2026-03-09T13:31:00.000Z",
    ),
    source_candles_digest:
      computeMarketContextSectorSourceDigestV2(sectors),
    sectors,
  };
}

export function marketContextTradeM1BindingMetadataFixtureV2(
  prepared: {
    preparation_as_of_unix_ns: string;
    calendar_artifact: {
      artifact_id: string;
      artifact_version: string;
      artifact_sha256: string;
    };
    corporate_actions: {
      policy_version: string;
      adjustment_state: "raw" | "split_adjusted" | "total_return_adjusted";
      split_policy: string;
      dividend_policy: string;
      point_in_time_attested: true;
    };
    candles: Array<{
      symbol: string;
      provider: string;
      provider_product: string;
      provider_build: string;
      provider_revision: string;
      dataset_id: string;
      dataset_version: string;
      schema_version: string;
      adjustment_state: "raw" | "split_adjusted" | "total_return_adjusted";
    }>;
    raw_record_dispositions: Array<{
      raw_record_id: string;
      raw_record_sha256: string;
    }>;
  },
): MarketContextTradeM1BindingMetadataV2 {
  const first = prepared.candles[0]!;
  const rawFileId = "synthetic-trades.ndjson";
  return {
    adapter_version: MARKET_CONTEXT_TRADE_M1_BINDING_ADAPTER_V2,
    target_contract_version:
      MARKET_CONTEXT_HISTORICAL_DATASET_TARGET_V1,
    target_normalizer_version:
      MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_TARGET_V1,
    required_receiver_extension:
      MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1,
    dataset: {
      dataset_id: first.dataset_id,
      dataset_version: first.dataset_version,
      provider: first.provider,
      provider_product: first.provider_product,
      provider_build: first.provider_build,
      provider_revision: first.provider_revision,
      schema: "trades",
      schema_version: first.schema_version,
    },
    decision: {
      decision_id: "synthetic-decision-v2",
      ticker: "SPY",
      decision_timestamp_unix_ns:
        prepared.preparation_as_of_unix_ns,
    },
    source: {
      provenance_status: "documented",
      provenance_description: "synthetic fixture only",
      source_reference: "repository:action-667m2c",
      usage_rights_status: "documented_permitted",
      usage_rights_basis: "repository synthetic fixture",
      internal_research_and_replay_allowed: true,
    },
    acquisition: {
      timestamp_unix_ns: fixtureUnixNsV2(
        "2026-07-27T00:00:00.000Z",
      ),
      method: "operator_supplied_local_files",
    },
    date_range: {
      start: "2026-03-09",
      end: "2026-03-09",
      basis: "observation_utc_date",
    },
    candle_policy: {
      interval: "1min",
      timezone: "UTC",
      session_calendar_policy:
        "market_context_xnys_immutable_calendar_artifact_v2",
    },
    timestamp_policy: {
      representation:
        "market_context_historical_trade_nanosecond_timestamp_v1",
      observation_timestamp: "unix_nanoseconds_required",
      provider_source_timestamp: "unix_nanoseconds_required",
      received_timestamp: "unix_nanoseconds_required",
    },
    universe: {
      tickers: ["SPY", "QQQ"],
      benchmark_symbols: ["SPY", "QQQ"],
      breadth_source_id: "synthetic-eleven-sector-etf-breadth",
      expected_breadth_constituents: 11,
    },
    symbol_contexts: [
      {
        symbol: "SPY",
        domain: "benchmark",
        context_id: "benchmark:SPY",
      },
    ],
    calendar: {
      artifact_id: prepared.calendar_artifact.artifact_id,
      artifact_version: prepared.calendar_artifact.artifact_version,
      artifact_sha256: prepared.calendar_artifact.artifact_sha256,
      exchange: "XNYS",
      timezone: "America/New_York",
    },
    corporate_actions: {
      policy_version: prepared.corporate_actions.policy_version,
      policy_documented: true,
      split_policy: prepared.corporate_actions.split_policy,
      dividend_policy: prepared.corporate_actions.dividend_policy,
      adjustment_state: first.adjustment_state,
      point_in_time_attested: true,
    },
    quality: {
      expected_rows_by_domain: {
        benchmark: prepared.candles.length,
        breadth: 1,
        sector: 0,
        industry: 0,
      },
      minimum_coverage_by_domain: {
        benchmark: 1,
        breadth: 1,
        sector: 1,
        industry: 1,
      },
      missingness_policy: "preserve_finalized_gaps_no_forward_fill",
      duplicate_policy: "reject",
      out_of_order_policy: "sort_and_report",
    },
    point_in_time: {
      attested: true,
      attestation: "synthetic point-in-time fixture",
      future_observation_policy: "reject",
      future_provider_source_policy: "reject",
      received_after_decision_policy: "reject",
    },
    sensitive_identifiers: {
      policy: "reject",
      sanitized: true,
      sanitization_attestation: "synthetic identifiers only",
    },
    raw_files: [
      {
        file_id: rawFileId,
        media_type: "application/x-ndjson",
        bytes: 1024,
        sha256: sha256("synthetic raw file bytes v2"),
      },
    ],
    immutable_raw_digest: sha256(
      stableMarketContextTradePreparationJsonV2([
        {
          file_id: rawFileId,
          media_type: "application/x-ndjson",
          bytes: 1024,
          sha256: sha256("synthetic raw file bytes v2"),
        },
      ]),
    ),
    raw_record_lineage: prepared.raw_record_dispositions.map(
      (record, index) => ({
        raw_record_id: record.raw_record_id,
        raw_record_sha256: record.raw_record_sha256,
        file_id: rawFileId,
        source_line: index + 1,
      }),
    ),
    supplemental_breadth_rows: [
      {
        row_id: "synthetic-breadth-row",
        observation_timestamp_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:31:00.000Z",
        ),
        provider_source_timestamp_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:59.999Z",
          BigInt("999999"),
        ),
        received_timestamp_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:31:00.100Z",
        ),
        context_id: "breadth:eleven-sector-etfs",
        expected_constituents: 11,
        observed_constituents: 11,
        advancing_fraction: 0.636364,
        above_short_average_fraction: 0.545455,
        source_digest: sha256("synthetic breadth lineage v2"),
      },
    ],
  };
}
