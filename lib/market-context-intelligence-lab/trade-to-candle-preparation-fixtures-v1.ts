import { createHash } from "node:crypto";

import {
  MARKET_CONTEXT_SECTOR_ETF_SYMBOLS,
  MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_VERSION,
  MARKET_CONTEXT_TRADE_MAX_LATENESS_MS,
  MARKET_CONTEXT_TRADE_SESSION_POLICY_VERSION,
  MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION,
  MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION,
  MARKET_CONTEXT_TRADE_WATERMARK_POLICY_VERSION,
  computeMarketContextSectorEtfSourceDigestV1,
  computeMarketContextTradeRawRecordsDigestV1,
  computeMarketContextTradeRecordDigestV1,
  type MarketContextSectorEtfBreadthInputV1,
  type MarketContextTradePreparationManifestV1,
  type MarketContextTradeRawPayloadV1,
  type MarketContextTradeRecordV1,
  type MarketContextTradeSessionV1,
} from "./trade-to-candle-preparation-v1";

export const MARKET_CONTEXT_TRADE_TO_CANDLE_FIXTURE_VERSION =
  "market_context_historical_trade_to_candle_synthetic_fixtures_v1" as const;

export type MarketContextTradeToCandleGoldenFixtureV1 = {
  id: string;
  input: {
    manifest: MarketContextTradePreparationManifestV1;
    records: MarketContextTradeRecordV1[];
  };
  expected_status: "prepared" | "rejected";
  expected_error_codes: string[];
  expected_candles: number;
};

type FixtureOptions = {
  sessions?: MarketContextTradeSessionV1[];
  symbols?: string[];
  asOf?: string;
};

const defaultSession: MarketContextTradeSessionV1 = {
  session_id: "XNYS-2026-03-09-regular",
  session_date: "2026-03-09",
  session_type: "regular",
  exchange_timezone: "America/New_York",
  open_timestamp: "2026-03-09T13:30:00.000Z",
  close_timestamp: "2026-03-09T13:31:00.000Z",
};

function baseManifest(
  options: FixtureOptions = {},
): MarketContextTradePreparationManifestV1 {
  return {
    contract_version:
      MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION,
    preparation_policy_version:
      MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION,
    dataset: {
      provider: "synthetic_databento_schema_fixture",
      dataset_id: "EQUS.MINI",
      dataset_version: "synthetic_eq_us_mini_fixture_2026_07_27",
      schema: "trades",
      schema_version: "databento_dbn_trades_schema_v1_fixture",
    },
    symbols: options.symbols ?? ["SPY"],
    preparation_as_of_timestamp:
      options.asOf ?? "2026-03-09T13:32:05.000Z",
    watermark: {
      policy_version:
        MARKET_CONTEXT_TRADE_WATERMARK_POLICY_VERSION,
      max_lateness_ms: MARKET_CONTEXT_TRADE_MAX_LATENESS_MS,
      late_trade_policy: "exclude_and_count",
      unfinalized_bucket_policy: "omit_and_report_gap",
    },
    eligibility: {
      policy_version:
        MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_VERSION,
      required_action: "T",
      allowed_flags_mask: 129,
      rejected_data_quality_flags_mask: 12,
      unsupported_flags_mask: 114,
      conditions_policy: "empty_only_fail_closed",
      invalid_numeric_policy: "reject_dataset",
      duplicate_policy: "reject_dataset",
      unsupported_action_policy: "reject_dataset",
    },
    session_calendar: {
      policy_version:
        MARKET_CONTEXT_TRADE_SESSION_POLICY_VERSION,
      calendar_version: "synthetic_xnys_calendar_2026_v1",
      exchange_timezone: "America/New_York",
      sessions: options.sessions ?? [defaultSession],
      outside_session_policy: "exclude_and_count",
      missing_minute_policy: "preserve_gap_no_forward_fill",
    },
    corporate_actions: {
      policy_version: "synthetic_raw_corporate_action_policy_v1",
      adjustment_state: "raw",
      split_policy:
        "no_adjustment_synthetic_fixture_requires_point_in_time_events_before_real_use",
      dividend_policy:
        "no_adjustment_synthetic_fixture_requires_point_in_time_events_before_real_use",
      point_in_time_attested: true,
    },
    immutable_raw_records_digest: "",
  };
}

function payload(
  id: string,
  sourcePosition: number,
  overrides: Partial<MarketContextTradeRawPayloadV1> = {},
): MarketContextTradeRawPayloadV1 {
  return {
    provider: "synthetic_databento_schema_fixture",
    dataset_id: "EQUS.MINI",
    dataset_version: "synthetic_eq_us_mini_fixture_2026_07_27",
    schema: "trades",
    schema_version: "databento_dbn_trades_schema_v1_fixture",
    symbol: "SPY",
    event_timestamp: `2026-03-09T13:30:00.${String(
      100 + sourcePosition,
    ).padStart(3, "0")}Z`,
    receive_timestamp: `2026-03-09T13:30:00.${String(
      500 + sourcePosition,
    ).padStart(3, "0")}Z`,
    price: 600 + sourcePosition,
    size: 10 + sourcePosition,
    sequence: 0,
    tie_break_id: `tie-${id}`,
    source_position: sourcePosition,
    action: "T",
    flags: 128,
    conditions: [],
    raw_record_id: id,
    ...overrides,
  };
}

function record(
  id: string,
  sourcePosition: number,
  overrides: Partial<MarketContextTradeRawPayloadV1> = {},
) {
  const raw = payload(id, sourcePosition, overrides);
  return {
    ...raw,
    raw_record_sha256:
      computeMarketContextTradeRecordDigestV1(raw),
  } satisfies MarketContextTradeRecordV1;
}

function finalize(
  manifest: MarketContextTradePreparationManifestV1,
  records: MarketContextTradeRecordV1[],
) {
  return {
    manifest: {
      ...manifest,
      immutable_raw_records_digest:
        computeMarketContextTradeRawRecordsDigestV1(records),
    },
    records,
  };
}

function fixture(
  id: string,
  records: MarketContextTradeRecordV1[],
  expected: {
    status?: "prepared" | "rejected";
    errors?: string[];
    candles?: number;
  } = {},
  options: FixtureOptions = {},
): MarketContextTradeToCandleGoldenFixtureV1 {
  return {
    id,
    input: finalize(baseManifest(options), records),
    expected_status: expected.status ?? "prepared",
    expected_error_codes: expected.errors ?? [],
    expected_candles: expected.candles ?? 1,
  };
}

const normalRecords = [
  record("normal-1", 0, { price: 600, size: 10 }),
  record("normal-2", 1, { price: 602, size: 20 }),
  record("normal-3", 2, { price: 599, size: 30 }),
  record("normal-4", 3, { price: 601, size: 40 }),
];

const sameTimestampRecords = [
  record("same-z", 0, {
    event_timestamp: "2026-03-09T13:30:15.000Z",
    tie_break_id: "z",
    price: 603,
  }),
  record("same-a", 1, {
    event_timestamp: "2026-03-09T13:30:15.000Z",
    tie_break_id: "a",
    price: 600,
  }),
  record("same-m", 2, {
    event_timestamp: "2026-03-09T13:30:15.000Z",
    tie_break_id: "m",
    price: 601,
  }),
];

const outOfOrderRecords = [
  record("order-late-event", 0, {
    event_timestamp: "2026-03-09T13:30:30.000Z",
    price: 603,
  }),
  record("order-early-event", 1, {
    event_timestamp: "2026-03-09T13:30:10.000Z",
    price: 600,
  }),
  record("order-middle-event", 2, {
    event_timestamp: "2026-03-09T13:30:20.000Z",
    price: 601,
  }),
];

const duplicateRecord = record("duplicate", 0);

const lateReceiveRecords = [
  record("on-time", 0, {
    event_timestamp: "2026-03-09T13:30:10.000Z",
    receive_timestamp: "2026-03-09T13:30:10.500Z",
  }),
  record("late-receive", 1, {
    event_timestamp: "2026-03-09T13:30:30.000Z",
    receive_timestamp: "2026-03-09T13:31:03.000Z",
  }),
];

const unfinalizedRecords = [
  record("unfinalized", 0, {
    event_timestamp: "2026-03-09T13:30:30.000Z",
    receive_timestamp: "2026-03-09T13:30:30.500Z",
  }),
];

const unsupportedActionRecords = [
  record("cancel-action", 0, { action: "C" }),
  record("modify-correction-action", 1, { action: "M" }),
];

const invalidNumericRecords = [
  record("invalid-price", 0, { price: 0 }),
  record("invalid-size", 1, { size: 0 }),
];

const prePostRecords = [
  record("pre-market", 0, {
    event_timestamp: "2026-03-09T13:29:59.000Z",
    receive_timestamp: "2026-03-09T13:29:59.500Z",
  }),
  record("regular-session", 1, {
    event_timestamp: "2026-03-09T13:30:15.000Z",
    receive_timestamp: "2026-03-09T13:30:15.500Z",
  }),
  record("post-market", 2, {
    event_timestamp: "2026-03-09T13:31:00.000Z",
    receive_timestamp: "2026-03-09T13:31:00.500Z",
  }),
];

const dstSessions: MarketContextTradeSessionV1[] = [
  {
    session_id: "XNYS-2026-03-06-pre-dst",
    session_date: "2026-03-06",
    session_type: "regular",
    exchange_timezone: "America/New_York",
    open_timestamp: "2026-03-06T14:30:00.000Z",
    close_timestamp: "2026-03-06T14:31:00.000Z",
  },
  {
    session_id: "XNYS-2026-03-09-post-dst",
    session_date: "2026-03-09",
    session_type: "regular",
    exchange_timezone: "America/New_York",
    open_timestamp: "2026-03-09T13:30:00.000Z",
    close_timestamp: "2026-03-09T13:31:00.000Z",
  },
];

const dstRecords = [
  record("pre-dst", 0, {
    event_timestamp: "2026-03-06T14:30:15.000Z",
    receive_timestamp: "2026-03-06T14:30:15.500Z",
  }),
  record("post-dst", 1, {
    event_timestamp: "2026-03-09T13:30:15.000Z",
    receive_timestamp: "2026-03-09T13:30:15.500Z",
  }),
];

const halfDaySession: MarketContextTradeSessionV1 = {
  session_id: "XNYS-2026-11-27-half-day",
  session_date: "2026-11-27",
  session_type: "half_day",
  exchange_timezone: "America/New_York",
  open_timestamp: "2026-11-27T14:30:00.000Z",
  close_timestamp: "2026-11-27T18:00:00.000Z",
};

const halfDayRecords = [
  record("half-day-last-minute", 0, {
    event_timestamp: "2026-11-27T17:59:30.000Z",
    receive_timestamp: "2026-11-27T17:59:30.500Z",
  }),
  record("half-day-after-close", 1, {
    event_timestamp: "2026-11-27T18:00:00.000Z",
    receive_timestamp: "2026-11-27T18:00:00.500Z",
  }),
];

const missingMinuteSession: MarketContextTradeSessionV1 = {
  ...defaultSession,
  close_timestamp: "2026-03-09T13:33:00.000Z",
};

const missingMinuteRecords = [
  record("minute-30", 0, {
    event_timestamp: "2026-03-09T13:30:15.000Z",
    receive_timestamp: "2026-03-09T13:30:15.500Z",
  }),
  record("minute-32", 1, {
    event_timestamp: "2026-03-09T13:32:15.000Z",
    receive_timestamp: "2026-03-09T13:32:15.500Z",
  }),
];

const futureSession: MarketContextTradeSessionV1 = {
  ...defaultSession,
  close_timestamp: "2026-03-09T13:35:00.000Z",
};

const futureRecords = [
  record("future-event", 0, {
    event_timestamp: "2026-03-09T13:33:00.000Z",
    receive_timestamp: "2026-03-09T13:31:00.000Z",
  }),
  record("future-receive", 1, {
    event_timestamp: "2026-03-09T13:31:00.000Z",
    receive_timestamp: "2026-03-09T13:34:00.000Z",
  }),
];

const tamperedRecord = record("tampered", 0);
tamperedRecord.price = 999;

const unsupportedFlagConditionRecords = [
  record("bad-receive-flag", 0, { flags: 8 }),
  record("publisher-specific-flag", 1, { flags: 2 }),
  record("unsupported-condition", 2, {
    conditions: ["provider_native_condition_not_mapped"],
  }),
];

const parallelSymbols = [
  "SPY",
  "QQQ",
  ...MARKET_CONTEXT_SECTOR_ETF_SYMBOLS,
];
const parallelRecords = parallelSymbols.map((ticker, index) =>
  record(`parallel-${ticker}`, index, {
    symbol: ticker,
    tie_break_id: `parallel-${ticker}`,
    event_timestamp: "2026-03-09T13:30:15.000Z",
    receive_timestamp: `2026-03-09T13:30:15.${String(
      100 + index,
    ).padStart(3, "0")}Z`,
    price: 100 + index,
  }),
);

export const marketContextTradeToCandleGoldenFixturesV1: MarketContextTradeToCandleGoldenFixtureV1[] =
  [
    fixture("normal_one_minute_candle", normalRecords),
    fixture("same_timestamp_stable_tie_break", sameTimestampRecords),
    fixture("out_of_order_provider_stream", outOfOrderRecords),
    fixture(
      "duplicate_record",
      [duplicateRecord, duplicateRecord],
      {
        status: "rejected",
        errors: [
          "duplicate_raw_record_id",
          "duplicate_trade_identity",
          "source_position_invalid_or_duplicate",
        ],
        candles: 0,
      },
    ),
    fixture("late_receive_excluded", lateReceiveRecords),
    fixture(
      "unfinalized_bucket_at_cutoff",
      unfinalizedRecords,
      { candles: 0 },
      { asOf: "2026-03-09T13:31:01.000Z" },
    ),
    fixture(
      "unsupported_correction_cancel",
      unsupportedActionRecords,
      {
        status: "rejected",
        errors: [
          "unsupported_action:cancel-action",
          "unsupported_action:modify-correction-action",
        ],
        candles: 0,
      },
    ),
    fixture(
      "invalid_price_and_size",
      invalidNumericRecords,
      {
        status: "rejected",
        errors: [
          "invalid_price_or_size:invalid-price",
          "invalid_price_or_size:invalid-size",
        ],
        candles: 0,
      },
    ),
    fixture("pre_and_post_market_excluded", prePostRecords),
    fixture(
      "dst_explicit_session_offsets",
      dstRecords,
      { candles: 2 },
      {
        sessions: dstSessions,
        asOf: "2026-03-09T13:32:05.000Z",
      },
    ),
    fixture(
      "half_day_close_boundary",
      halfDayRecords,
      { candles: 1 },
      {
        sessions: [halfDaySession],
        asOf: "2026-11-27T18:01:05.000Z",
      },
    ),
    fixture(
      "missing_minute_preserved_as_gap",
      missingMinuteRecords,
      { candles: 2 },
      {
        sessions: [missingMinuteSession],
        asOf: "2026-03-09T13:34:05.000Z",
      },
    ),
    fixture(
      "future_event_and_receive_rejected",
      futureRecords,
      {
        status: "rejected",
        errors: [
          "future_event_timestamp:future-event",
          "future_receive_timestamp:future-receive",
        ],
        candles: 0,
      },
      {
        sessions: [futureSession],
        asOf: "2026-03-09T13:32:00.000Z",
      },
    ),
    fixture(
      "tampered_raw_record_digest",
      [tamperedRecord],
      {
        status: "rejected",
        errors: ["raw_record_digest_mismatch:tampered"],
        candles: 0,
      },
    ),
    fixture("input_array_order_determinism", normalRecords),
    fixture("cross_timezone_equivalence", normalRecords),
    fixture(
      "spy_qqq_and_sector_parallel_preparation",
      parallelRecords,
      { candles: 13 },
      { symbols: parallelSymbols },
    ),
    fixture(
      "unsupported_flags_and_conditions",
      unsupportedFlagConditionRecords,
      {
        status: "rejected",
        errors: [
          "rejected_data_quality_flags:bad-receive-flag",
          "unsupported_flags:publisher-specific-flag",
          "unsupported_trade_conditions:unsupported-condition",
        ],
        candles: 0,
      },
    ),
  ];

export function marketContextTradeToCandleFixtureV1(id: string) {
  const found = marketContextTradeToCandleGoldenFixturesV1.find(
    (candidate) => candidate.id === id,
  );
  if (!found) throw new Error(`unknown_trade_to_candle_fixture:${id}`);
  return structuredClone(found);
}

function fixtureDigest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function marketContextElevenSectorBreadthFixtureV1(): MarketContextSectorEtfBreadthInputV1 {
  const sectors = MARKET_CONTEXT_SECTOR_ETF_SYMBOLS.map(
    (ticker, index) => ({
      symbol: ticker,
      current_close: index < 7 ? 101 : 99,
      previous_close: 100,
      short_average: index < 6 ? 100 : 102,
      candle_digest: fixtureDigest(`synthetic-candle:${ticker}`),
    }),
  );
  return {
    timestamp: "2026-03-09T13:31:00.000Z",
    source_candles_digest:
      computeMarketContextSectorEtfSourceDigestV1(sectors),
    sectors,
  };
}
