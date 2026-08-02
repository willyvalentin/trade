import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1,
  MARKET_CONTEXT_TRADE_M1_BINDING_ADAPTER_V2,
  bindMarketContextTradePreparationToM1V2,
} from "../../lib/market-context-intelligence-lab/trade-to-candle-m1-binding-v2";
import {
  MARKET_CONTEXT_TRADE_TO_CANDLE_FIXTURES_V2,
  fixtureUnixNsV2,
  marketContextSectorBreadthFixtureV2,
  marketContextTradeM1BindingMetadataFixtureV2,
  marketContextTradeManifestFixtureV2,
  marketContextTradePreparationFixtureV2,
  marketContextTradeRecordFixtureV2,
  rehashMarketContextTradeInputV2,
} from "../../lib/market-context-intelligence-lab/trade-to-candle-preparation-fixtures-v2";
import {
  MARKET_CONTEXT_SECTOR_ETF_BREADTH_V2,
  MARKET_CONTEXT_TRADE_MAX_INT64,
  MARKET_CONTEXT_TRADE_MAX_LATENESS_NS,
  MARKET_CONTEXT_TRADE_MAX_UINT32,
  MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1,
  MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2,
  MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2,
  MARKET_CONTEXT_TRADE_UNDEF_PRICE,
  MARKET_CONTEXT_TRADE_UNDEF_TIMESTAMP,
  MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2,
  deriveMarketContextSectorEtfBreadthV2,
  prepareMarketContextTradesToCandlesV2,
  stableMarketContextTradePreparationJsonV2,
  type MarketContextTradePreparationResultV2,
  type MarketContextTradeRecordV2,
} from "../../lib/market-context-intelligence-lab/trade-to-candle-preparation-v2";

const repositoryRoot = resolve(process.cwd());

test.describe.configure({ timeout: 60_000 });

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function prepared(result: MarketContextTradePreparationResultV2) {
  expect(result.status).toBe("prepared");
  if (result.status !== "prepared") {
    throw new Error(`expected_prepared:${result.error_codes.join(",")}`);
  }
  return result;
}

function withRecords(
  records: MarketContextTradeRecordV2[],
  options: {
    asOfUnixNs?: string;
    symbols?: string[];
    sessions?: ReturnType<
      typeof marketContextTradeManifestFixtureV2
    >["session_calendar"]["artifact"]["sessions"];
  } = {},
) {
  return rehashMarketContextTradeInputV2({
    manifest: marketContextTradeManifestFixtureV2(options),
    records,
  });
}

test("v2 versions are explicit and the watermark remains empirically unvalidated", () => {
  expect(MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2).toBe(
    "market_context_historical_trade_to_candle_preparation_v2",
  );
  expect(MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2).toBe(
    "market_context_historical_trade_to_candle_policy_2026_07_27_v2",
  );
  expect(MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1).toBe(
    "market_context_historical_trade_nanosecond_timestamp_v1",
  );
  expect(MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2).toBe(
    "market_context_historical_trade_watermark_2s_nanosecond_v2",
  );
  expect(MARKET_CONTEXT_TRADE_MAX_LATENESS_NS).toBe("2000000000");
  expect(MARKET_CONTEXT_TRADE_TO_CANDLE_FIXTURES_V2).toBe(
    "market_context_historical_trade_to_candle_synthetic_fixtures_v2",
  );
  const input = marketContextTradePreparationFixtureV2();
  expect(input.manifest.watermark.evidence_status).toBe(
    "empirically_unvalidated",
  );
});

test("sub-millisecond event and receive ordering are lossless", () => {
  const result = prepared(
    prepareMarketContextTradesToCandlesV2(
      marketContextTradePreparationFixtureV2(),
    ),
  );
  expect(result.candles).toHaveLength(1);
  expect(result.candles[0]).toMatchObject({
    open_scaled_1e9: "600000000000",
    high_scaled_1e9: "602000000000",
    low_scaled_1e9: "600000000000",
    close_scaled_1e9: "601000000000",
    volume_uint64: "60",
    first_ts_event_unix_ns: fixtureUnixNsV2(
      "2026-03-09T13:30:00.100Z",
      BigInt(1),
    ),
    last_ts_event_unix_ns: fixtureUnixNsV2(
      "2026-03-09T13:30:00.100Z",
      BigInt(3),
    ),
    first_ts_recv_unix_ns: fixtureUnixNsV2(
      "2026-03-09T13:30:00.200Z",
      BigInt(1),
    ),
    last_ts_recv_unix_ns: fixtureUnixNsV2(
      "2026-03-09T13:30:00.200Z",
      BigInt(3),
    ),
  });
  expect(
    result.candles[0]?.lineage.map(
      (line) => line.ts_event_unix_ns,
    ),
  ).toEqual([
    fixtureUnixNsV2("2026-03-09T13:30:00.100Z", BigInt(1)),
    fixtureUnixNsV2("2026-03-09T13:30:00.100Z", BigInt(2)),
    fixtureUnixNsV2("2026-03-09T13:30:00.100Z", BigInt(3)),
  ]);
});

test("same event nanosecond uses zero sequence plus globally unique tie-break", () => {
  const timestamp = fixtureUnixNsV2(
    "2026-03-09T13:30:15.000Z",
    BigInt(123),
  );
  const input = withRecords([
    marketContextTradeRecordFixtureV2("tie-z", 0, {
      ts_event_unix_ns: timestamp,
      tie_break_id: "z",
      price_scaled_1e9: "603000000000",
    }),
    marketContextTradeRecordFixtureV2("tie-a", 1, {
      ts_event_unix_ns: timestamp,
      tie_break_id: "a",
      price_scaled_1e9: "600000000000",
    }),
    marketContextTradeRecordFixtureV2("tie-m", 2, {
      ts_event_unix_ns: timestamp,
      tie_break_id: "m",
      price_scaled_1e9: "601000000000",
    }),
  ]);
  const result = prepared(prepareMarketContextTradesToCandlesV2(input));
  expect(result.candles[0]).toMatchObject({
    open_scaled_1e9: "600000000000",
    close_scaled_1e9: "603000000000",
  });
  expect(
    result.candles[0]?.lineage.map((line) => line.tie_break_id),
  ).toEqual(["a", "m", "z"]);
});

test("reused tie-break identity rejects the whole dataset", () => {
  const input = marketContextTradePreparationFixtureV2();
  input.records[1]!.tie_break_id = input.records[0]!.tie_break_id;
  rehashMarketContextTradeInputV2(input);
  const result = prepareMarketContextTradesToCandlesV2(input);
  expect(result.status).toBe("rejected");
  if (result.status === "rejected") {
    expect(result.diagnostics.tie_break_collisions).toBe(1);
    expect(
      result.error_codes.some((code) =>
        code.startsWith("tie_break_identity_reused:"),
      ),
    ).toBe(true);
    expect(result.candles).toEqual([]);
  }
});

test("watermark boundary is nanosecond exact at minus, equal, and plus one", () => {
  const watermark = BigInt(
    fixtureUnixNsV2("2026-03-09T13:31:02.000Z"),
  );
  const input = withRecords([
    marketContextTradeRecordFixtureV2("wm-minus", 0, {
      ts_event_unix_ns: fixtureUnixNsV2(
        "2026-03-09T13:30:30.000Z",
      ),
      ts_recv_unix_ns: (watermark - BigInt(1)).toString(),
      tie_break_id: "wm-minus",
    }),
    marketContextTradeRecordFixtureV2("wm-equal", 1, {
      ts_event_unix_ns: fixtureUnixNsV2(
        "2026-03-09T13:30:31.000Z",
      ),
      ts_recv_unix_ns: watermark.toString(),
      tie_break_id: "wm-equal",
    }),
    marketContextTradeRecordFixtureV2("wm-plus", 2, {
      ts_event_unix_ns: fixtureUnixNsV2(
        "2026-03-09T13:30:32.000Z",
      ),
      ts_recv_unix_ns: (watermark + BigInt(1)).toString(),
      tie_break_id: "wm-plus",
    }),
  ]);
  const result = prepared(prepareMarketContextTradesToCandlesV2(input));
  expect(result.candles[0]).toMatchObject({
    eligible_trade_count: 2,
    excluded_trade_count: 1,
    excluded_reason_codes: ["late_receive_after_watermark"],
  });
  expect(result.diagnostics.late_receive_records).toBe(1);
});

test("malformed runtime inputs return deterministic rejection without throwing", () => {
  const malformed: unknown[] = [
    null,
    {},
    { manifest: null, records: [] },
    { manifest: {}, records: "not-an-array" },
  ];
  for (const value of malformed) {
    expect(() =>
      prepareMarketContextTradesToCandlesV2(value),
    ).not.toThrow();
    const first = prepareMarketContextTradesToCandlesV2(value);
    const second = prepareMarketContextTradesToCandlesV2(value);
    expect(first).toEqual(second);
    expect(first.status).toBe("rejected");
  }

  const missingTie = marketContextTradePreparationFixtureV2();
  delete (missingTie.records[0] as Partial<MarketContextTradeRecordV2>)
    .tie_break_id;
  expect(() =>
    prepareMarketContextTradesToCandlesV2(missingTie),
  ).not.toThrow();
  expect(
    prepareMarketContextTradesToCandlesV2(missingTie).status,
  ).toBe("rejected");
});

test("mid-session as-of emits only finalized observable gaps", () => {
  const asOf = fixtureUnixNsV2("2026-03-09T13:32:02.000Z");
  const input = withRecords(
    [
      marketContextTradeRecordFixtureV2("first-minute", 0, {
        ts_event_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:30.000Z",
        ),
        ts_recv_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:30.100Z",
        ),
      }),
    ],
    { asOfUnixNs: asOf },
  );
  const result = prepared(prepareMarketContextTradesToCandlesV2(input));
  expect(result.candles).toHaveLength(1);
  expect(result.gaps).toEqual([
    expect.objectContaining({
      bucket_start_unix_ns: fixtureUnixNsV2(
        "2026-03-09T13:31:00.000Z",
      ),
      reason_code: "missing_minute_no_eligible_trade",
      observable_and_finalized: true,
    }),
  ]);
  expect(result.pending_buckets).toEqual([]);
  expect(
    result.gaps.some(
      (gap) => BigInt(gap.bucket_end_unix_ns) > BigInt(asOf),
    ),
  ).toBe(false);
});

test("immutable calendar carries DST and half-day boundaries explicitly", () => {
  const sessions = [
    {
      session_id: "XNYS-2026-03-06-pre-dst",
      session_date: "2026-03-06",
      session_type: "regular" as const,
      exchange_timezone: "America/New_York" as const,
      open_unix_ns: fixtureUnixNsV2(
        "2026-03-06T14:30:00.000Z",
      ),
      close_unix_ns: fixtureUnixNsV2(
        "2026-03-06T14:31:00.000Z",
      ),
    },
    {
      session_id: "XNYS-2026-03-09-post-dst",
      session_date: "2026-03-09",
      session_type: "regular" as const,
      exchange_timezone: "America/New_York" as const,
      open_unix_ns: fixtureUnixNsV2(
        "2026-03-09T13:30:00.000Z",
      ),
      close_unix_ns: fixtureUnixNsV2(
        "2026-03-09T13:31:00.000Z",
      ),
    },
    {
      session_id: "XNYS-2026-11-27-half-day",
      session_date: "2026-11-27",
      session_type: "half_day" as const,
      exchange_timezone: "America/New_York" as const,
      open_unix_ns: fixtureUnixNsV2(
        "2026-11-27T14:30:00.000Z",
      ),
      close_unix_ns: fixtureUnixNsV2(
        "2026-11-27T18:00:00.000Z",
      ),
    },
  ];
  const input = withRecords(
    [
      marketContextTradeRecordFixtureV2("pre-dst", 0, {
        ts_event_unix_ns: fixtureUnixNsV2(
          "2026-03-06T14:30:15.000Z",
        ),
        ts_recv_unix_ns: fixtureUnixNsV2(
          "2026-03-06T14:30:15.100Z",
        ),
      }),
      marketContextTradeRecordFixtureV2("post-dst", 1, {
        ts_event_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:15.000Z",
        ),
        ts_recv_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:15.100Z",
        ),
      }),
      marketContextTradeRecordFixtureV2("half-day", 2, {
        ts_event_unix_ns: fixtureUnixNsV2(
          "2026-11-27T17:59:59.999Z",
          BigInt("999999"),
        ),
        ts_recv_unix_ns: fixtureUnixNsV2(
          "2026-11-27T18:00:00.100Z",
        ),
      }),
    ],
    {
      sessions,
      asOfUnixNs: fixtureUnixNsV2(
        "2026-11-27T18:01:03.000Z",
      ),
    },
  );
  const result = prepared(prepareMarketContextTradesToCandlesV2(input));
  expect(
    result.candles.map((candle) => ({
      session: candle.session_id,
      bucket: candle.bucket_start_iso_utc,
    })),
  ).toEqual([
    {
      session: "XNYS-2026-03-06-pre-dst",
      bucket: "2026-03-06T14:30:00.000000000Z",
    },
    {
      session: "XNYS-2026-03-09-post-dst",
      bucket: "2026-03-09T13:30:00.000000000Z",
    },
    {
      session: "XNYS-2026-11-27-half-day",
      bucket: "2026-11-27T17:59:00.000000000Z",
    },
  ]);
});

test("observed unfinalized bucket is pending and never a historical gap", () => {
  const input = withRecords(
    [
      marketContextTradeRecordFixtureV2("pending", 0, {
        ts_event_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:30.000Z",
        ),
        ts_recv_unix_ns: fixtureUnixNsV2(
          "2026-03-09T13:30:30.100Z",
        ),
      }),
    ],
    {
      asOfUnixNs: fixtureUnixNsV2(
        "2026-03-09T13:31:01.999Z",
        BigInt("999999"),
      ),
    },
  );
  const result = prepared(prepareMarketContextTradesToCandlesV2(input));
  expect(result.candles).toEqual([]);
  expect(result.gaps).toEqual([]);
  expect(result.pending_buckets).toEqual([
    expect.objectContaining({
      reason_code: "bucket_not_finalized_as_of_cutoff",
      reported_as_historical_gap: false,
    }),
  ]);
});

test("late-only bucket is distinct from ordinary missing gap", () => {
  const input = withRecords([
    marketContextTradeRecordFixtureV2("late-only", 0, {
      ts_event_unix_ns: fixtureUnixNsV2(
        "2026-03-09T13:30:30.000Z",
      ),
      ts_recv_unix_ns: fixtureUnixNsV2(
        "2026-03-09T13:31:02.000Z",
        BigInt(1),
      ),
    }),
  ]);
  const result = prepared(prepareMarketContextTradesToCandlesV2(input));
  expect(result.candles).toEqual([]);
  expect(result.gaps[0]).toMatchObject({
    reason_code: "late_only_bucket_no_eligible_trade",
    observable_and_finalized: true,
    forward_filled: false,
  });
});

test("provider numeric boundaries are exact and overflow rejects", () => {
  const boundary = withRecords([
    marketContextTradeRecordFixtureV2("numeric-max", 0, {
      price_scaled_1e9: (
        MARKET_CONTEXT_TRADE_MAX_INT64 - BigInt(1)
      ).toString(),
      size_uint32: MARKET_CONTEXT_TRADE_MAX_UINT32,
      sequence_uint32: MARKET_CONTEXT_TRADE_MAX_UINT32,
    }),
  ]);
  const accepted = prepared(
    prepareMarketContextTradesToCandlesV2(boundary),
  );
  expect(accepted.candles[0]).toMatchObject({
    open_scaled_1e9: (
      MARKET_CONTEXT_TRADE_MAX_INT64 - BigInt(1)
    ).toString(),
    volume_uint64: MARKET_CONTEXT_TRADE_MAX_UINT32.toString(),
  });

  const invalidCases = [
    {
      price_scaled_1e9: (
        MARKET_CONTEXT_TRADE_MAX_INT64 + BigInt(1)
      ).toString(),
    },
    { price_scaled_1e9: MARKET_CONTEXT_TRADE_UNDEF_PRICE.toString() },
    { price_scaled_1e9: "0" },
    { price_scaled_1e9: "-1" },
    { size_uint32: MARKET_CONTEXT_TRADE_MAX_UINT32 + 1 },
    { sequence_uint32: MARKET_CONTEXT_TRADE_MAX_UINT32 + 1 },
  ];
  for (const mutation of invalidCases) {
    const input = marketContextTradePreparationFixtureV2();
    Object.assign(input.records[0]!, mutation);
    rehashMarketContextTradeInputV2(input);
    expect(
      prepareMarketContextTradesToCandlesV2(input).status,
    ).toBe("rejected");
  }

  const undefinedTimestamp = marketContextTradePreparationFixtureV2();
  undefinedTimestamp.records[0]!.ts_event_unix_ns =
    MARKET_CONTEXT_TRADE_UNDEF_TIMESTAMP.toString();
  rehashMarketContextTradeInputV2(undefinedTimestamp);
  expect(
    prepareMarketContextTradesToCandlesV2(undefinedTimestamp).status,
  ).toBe("rejected");
});

test("calendar artifact tampering rejects before aggregation", () => {
  const input = marketContextTradePreparationFixtureV2();
  input.manifest.session_calendar.artifact.sessions[0]!.close_unix_ns =
    fixtureUnixNsV2("2026-03-09T13:34:00.000Z");
  const result = prepareMarketContextTradesToCandlesV2(input);
  expect(result.status).toBe("rejected");
  if (result.status === "rejected") {
    expect(result.error_codes).toContain(
      "session_calendar_artifact_digest_mismatch",
    );
  }
});

test("input array order is deterministic and input remains immutable", () => {
  const firstInput = marketContextTradePreparationFixtureV2();
  const secondInput = structuredClone(firstInput);
  secondInput.records.reverse();
  const before = stableMarketContextTradePreparationJsonV2(firstInput);
  const first = prepareMarketContextTradesToCandlesV2(firstInput);
  const second = prepareMarketContextTradesToCandlesV2(secondInput);
  expect(stableMarketContextTradePreparationJsonV2(first)).toBe(
    stableMarketContextTradePreparationJsonV2(second),
  );
  expect(stableMarketContextTradePreparationJsonV2(firstInput)).toBe(
    before,
  );
});

test("duplicates, tampering, future timestamps, actions, flags, and conditions reject", () => {
  const duplicate = marketContextTradePreparationFixtureV2();
  duplicate.records.push(structuredClone(duplicate.records[0]!));
  duplicate.manifest.immutable_raw_records_digest =
    "0".repeat(64);
  expect(
    prepareMarketContextTradesToCandlesV2(duplicate).status,
  ).toBe("rejected");

  const tampered = marketContextTradePreparationFixtureV2();
  tampered.records[0]!.price_scaled_1e9 = "999000000000";
  expect(
    prepareMarketContextTradesToCandlesV2(tampered).status,
  ).toBe("rejected");

  for (const mutation of [
    {
      ts_event_unix_ns: (
        BigInt(tampered.manifest.preparation_as_of_unix_ns) +
        BigInt(1)
      ).toString(),
    },
    {
      ts_recv_unix_ns: (
        BigInt(tampered.manifest.preparation_as_of_unix_ns) +
        BigInt(1)
      ).toString(),
    },
    { action: "C" },
    { flags_uint8: 8 },
    { conditions: ["unmapped"] },
  ]) {
    const input = marketContextTradePreparationFixtureV2();
    Object.assign(input.records[0]!, mutation);
    rehashMarketContextTradeInputV2(input);
    expect(
      prepareMarketContextTradesToCandlesV2(input).status,
    ).toBe("rejected");
  }
});

test("breadth remains exactly eleven-sector and not full market breadth", () => {
  expect(MARKET_CONTEXT_SECTOR_ETF_BREADTH_V2).toBe(
    "market_context_sector_etf_breadth_v2",
  );
  const input = marketContextSectorBreadthFixtureV2();
  const result = deriveMarketContextSectorEtfBreadthV2(input);
  expect(result).toMatchObject({
    status: "measured",
    expected_constituents: 11,
    observed_constituents: 11,
    not_full_market_breadth: true,
    reason_codes: [
      "SECTOR_ETF_BREADTH_ONLY",
      "NOT_FULL_MARKET_BREADTH",
    ],
  });
  const incomplete = structuredClone(input);
  incomplete.sectors.pop();
  expect(
    deriveMarketContextSectorEtfBreadthV2(incomplete).status,
  ).toBe("rejected");
});

test("lossless M.1 adapter requires extension and preserves nanoseconds", () => {
  const result = prepared(
    prepareMarketContextTradesToCandlesV2(
      marketContextTradePreparationFixtureV2(),
    ),
  );
  const metadata = marketContextTradeM1BindingMetadataFixtureV2(result);
  const binding = bindMarketContextTradePreparationToM1V2({
    prepared: result,
    metadata,
  });
  expect(binding.status).toBe("bindable");
  if (binding.status === "bindable") {
    expect(binding.adapter_version).toBe(
      MARKET_CONTEXT_TRADE_M1_BINDING_ADAPTER_V2,
    );
    expect(binding.required_receiver_extension).toBe(
      MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1,
    );
    expect(binding.metadata_inferred).toBe(false);
    expect(binding.canonical_binding_performed).toBe(false);
    expect(binding.candle_rows[0]).toMatchObject({
      provider_product: "synthetic_EQUS_MINI",
      provider_build: "synthetic_build_2026_07_27",
      provider_revision: "synthetic_revision_1",
      domain: "benchmark",
      context_id: "benchmark:SPY",
    });
    expect(
      binding.candle_rows[0]?.provider_source_timestamp_unix_ns,
    ).toBe(result.candles[0]?.last_ts_event_unix_ns);
    expect(binding.normalized_digest).toMatch(/^[0-9a-f]{64}$/);
  }
});

test("missing M.1 metadata always returns not_bindable without inference", () => {
  const result = prepared(
    prepareMarketContextTradesToCandlesV2(
      marketContextTradePreparationFixtureV2(),
    ),
  );
  const mutations: Array<
    (metadata: ReturnType<
      typeof marketContextTradeM1BindingMetadataFixtureV2
    >) => void
  > = [
    (metadata) => {
      (
        metadata as Partial<typeof metadata>
      ).target_normalizer_version = undefined;
    },
    (metadata) => {
      (
        metadata.dataset as Partial<typeof metadata.dataset>
      ).provider_revision = undefined;
    },
    (metadata) => {
      (
        metadata.decision as Partial<typeof metadata.decision>
      ).decision_id = undefined;
    },
    (metadata) => {
      metadata.source.usage_rights_basis = "";
    },
    (metadata) => {
      (
        metadata.acquisition as Partial<typeof metadata.acquisition>
      ).timestamp_unix_ns = undefined;
    },
    (metadata) => {
      metadata.symbol_contexts = [];
    },
    (metadata) => {
      metadata.raw_files = [];
    },
    (metadata) => {
      metadata.raw_record_lineage = [];
    },
    (metadata) => {
      metadata.quality.missingness_policy = "";
    },
    (metadata) => {
      metadata.candle_policy.session_calendar_policy = "";
    },
    (metadata) => {
      metadata.immutable_raw_digest = "0".repeat(64);
    },
    (metadata) => {
      metadata.corporate_actions.split_policy = "";
    },
    (metadata) => {
      metadata.calendar.artifact_sha256 = "0".repeat(64);
    },
  ];
  for (const mutate of mutations) {
    const metadata =
      marketContextTradeM1BindingMetadataFixtureV2(result);
    mutate(metadata);
    const binding = bindMarketContextTradePreparationToM1V2({
      prepared: result,
      metadata,
    });
    expect(binding.status).toBe("not_bindable");
    expect(binding.metadata_inferred).toBe(false);
    expect(binding.canonical_binding_performed).toBe(false);
  }
});

test("M.1 coverage below declared minimum is not bindable", () => {
  const result = prepared(
    prepareMarketContextTradesToCandlesV2(
      marketContextTradePreparationFixtureV2(),
    ),
  );
  const metadata = marketContextTradeM1BindingMetadataFixtureV2(result);
  metadata.quality.expected_rows_by_domain.benchmark = 2;
  const binding = bindMarketContextTradePreparationToM1V2({
    prepared: result,
    metadata,
  });
  expect(binding.status).toBe("not_bindable");
  if (binding.status === "not_bindable") {
    expect(binding.error_codes).toContain(
      "binding_coverage_below_minimum:benchmark",
    );
  }
});

test("tampered prepared output cannot be bound to M.1", () => {
  const result = prepared(
    prepareMarketContextTradesToCandlesV2(
      marketContextTradePreparationFixtureV2(),
    ),
  );
  const metadata = marketContextTradeM1BindingMetadataFixtureV2(result);
  result.candles[0]!.close_scaled_1e9 = "999000000000";
  const binding = bindMarketContextTradePreparationToM1V2({
    prepared: result,
    metadata,
  });
  expect(binding.status).toBe("not_bindable");
  if (binding.status === "not_bindable") {
    expect(binding.error_codes).toContain(
      "binding_prepared_result_integrity_invalid",
    );
  }
});

test("fixed v2 cross-process digest", () => {
  const result = prepareMarketContextTradesToCandlesV2(
    marketContextTradePreparationFixtureV2(),
  );
  const digest = sha256(
    stableMarketContextTradePreparationJsonV2(result),
  );
  expect(result.status).toBe("prepared");
  console.log(`ACTION_667M2C_TZ_DIGEST=${digest}`);
});

test("UTC, Stockholm, and New York processes are byte-identical", () => {
  const digests = [
    "UTC",
    "Europe/Stockholm",
    "America/New_York",
  ].map((timezone) => {
    const child = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "playwright",
        "test",
        "tests/e2e/action-667m2c-nanosecond-trade-preparation.spec.ts",
        "--grep",
        "fixed v2 cross-process digest",
        "--reporter=line",
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
      },
    );
    expect(child.status, child.stderr).toBe(0);
    return child.stdout.match(
      /ACTION_667M2C_TZ_DIGEST=([a-f0-9]{64})/,
    )?.[1];
  });
  expect(new Set(digests).size).toBe(1);
});

test("v2 modules contain no provider, database, replay, or live imports", () => {
  const files = [
    "lib/market-context-intelligence-lab/trade-to-candle-preparation-v2.ts",
    "lib/market-context-intelligence-lab/trade-to-candle-m1-binding-v2.ts",
    "lib/market-context-intelligence-lab/trade-to-candle-preparation-fixtures-v2.ts",
  ];
  const imports = files.flatMap((path) =>
    Array.from(
      readFileSync(resolve(repositoryRoot, path), "utf8").matchAll(
        /from\s+["']([^"']+)["']/g,
      ),
    ).map((match) => match[1] ?? ""),
  );
  expect(
    imports.some((source) =>
      /databento|supabase|provider-client|collector|scanner|recommendation|shadow-replay|app\/api/.test(
        source,
      ),
    ),
  ).toBe(false);
});
