import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MARKET_CONTEXT_SECTOR_ETF_BREADTH_VERSION,
  MARKET_CONTEXT_SECTOR_ETF_SYMBOLS,
  MARKET_CONTEXT_TRADE_CANONICALIZATION_VERSION,
  MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_VERSION,
  MARKET_CONTEXT_TRADE_MAX_LATENESS_MS,
  MARKET_CONTEXT_TRADE_OFFICIAL_SCHEMA_EVIDENCE_V1,
  MARKET_CONTEXT_TRADE_SESSION_POLICY_VERSION,
  MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION,
  MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION,
  MARKET_CONTEXT_TRADE_WATERMARK_POLICY_VERSION,
  deriveMarketContextSectorEtfBreadthV1,
  prepareMarketContextTradesToCandlesV1,
  stableMarketContextTradePreparationJsonV1,
  type MarketContextTradePreparationResultV1,
} from "../../lib/market-context-intelligence-lab/trade-to-candle-preparation-v1";
import {
  MARKET_CONTEXT_TRADE_TO_CANDLE_FIXTURE_VERSION,
  marketContextElevenSectorBreadthFixtureV1,
  marketContextTradeToCandleFixtureV1,
  marketContextTradeToCandleGoldenFixturesV1,
} from "../../lib/market-context-intelligence-lab/trade-to-candle-preparation-fixtures-v1";

const repositoryRoot = resolve(process.cwd());

test.describe.configure({ timeout: 60_000 });

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function runFixture(id: string) {
  const golden = marketContextTradeToCandleFixtureV1(id);
  return {
    golden,
    result: prepareMarketContextTradesToCandlesV1(golden.input),
  };
}

function expectPrepared(
  result: MarketContextTradePreparationResultV1,
) {
  expect(result.status).toBe("prepared");
  if (result.status !== "prepared") {
    throw new Error(
      `expected_prepared:${result.error_codes.join(",")}`,
    );
  }
  return result;
}

test("all synthetic fixtures return their declared fail-closed status", () => {
  expect(MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION).toBe(
    "market_context_historical_trade_to_candle_preparation_v1",
  );
  expect(MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION).toBe(
    "market_context_historical_trade_to_candle_policy_2026_07_27_v1",
  );
  expect(MARKET_CONTEXT_TRADE_WATERMARK_POLICY_VERSION).toBe(
    "market_context_historical_trade_watermark_2s_v1",
  );
  expect(MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_VERSION).toBe(
    "market_context_historical_trade_eligibility_strict_v1",
  );
  expect(MARKET_CONTEXT_TRADE_SESSION_POLICY_VERSION).toBe(
    "market_context_xnys_explicit_session_calendar_v1",
  );
  expect(MARKET_CONTEXT_TRADE_CANONICALIZATION_VERSION).toBe(
    "market_context_historical_trade_canonical_json_v1",
  );
  expect(MARKET_CONTEXT_TRADE_TO_CANDLE_FIXTURE_VERSION).toBe(
    "market_context_historical_trade_to_candle_synthetic_fixtures_v1",
  );
  expect(marketContextTradeToCandleGoldenFixturesV1).toHaveLength(18);

  for (const fixture of marketContextTradeToCandleGoldenFixturesV1) {
    const result = prepareMarketContextTradesToCandlesV1(
      structuredClone(fixture.input),
    );
    expect(result.status, fixture.id).toBe(fixture.expected_status);
    expect(result.candles, fixture.id).toHaveLength(
      fixture.expected_candles,
    );
    if (result.status === "rejected") {
      expect(result.error_codes, fixture.id).toEqual(
        expect.arrayContaining(fixture.expected_error_codes),
      );
    }
    expect(result.replay_output_created).toBe(false);
    expect(result.performance_metrics_computed).toBe(false);
    expect(result.shadow_only).toBe(true);
    expect(result.live_ranking_effect).toBe(false);
    expect(result.external_activity).toEqual({
      provider_traffic: false,
      internet_download: false,
      database_access: false,
      persistence: false,
    });
  }
});

test("normal candle preserves deterministic OHLCV timestamps and lineage", () => {
  const result = expectPrepared(
    runFixture("normal_one_minute_candle").result,
  );
  expect(result.candles).toHaveLength(1);
  expect(result.candles[0]).toMatchObject({
    symbol: "SPY",
    interval: "1min",
    bucket_start_timestamp: "2026-03-09T13:30:00.000Z",
    bucket_end_timestamp: "2026-03-09T13:31:00.000Z",
    watermark_timestamp: "2026-03-09T13:31:02.000Z",
    open: 600,
    high: 602,
    low: 599,
    close: 601,
    volume: 100,
    eligible_trade_count: 4,
    excluded_trade_count: 0,
    adjustment_state: "raw",
  });
  expect(result.candles[0]?.first_event_timestamp).toBe(
    "2026-03-09T13:30:00.100Z",
  );
  expect(result.candles[0]?.last_event_timestamp).toBe(
    "2026-03-09T13:30:00.103Z",
  );
  expect(result.candles[0]?.first_receive_timestamp).toBe(
    "2026-03-09T13:30:00.500Z",
  );
  expect(result.candles[0]?.last_receive_timestamp).toBe(
    "2026-03-09T13:30:00.503Z",
  );
  expect(result.candles[0]?.source_record_digest).toMatch(
    /^[0-9a-f]{64}$/,
  );
  expect(result.candles[0]?.lineage).toHaveLength(4);
  expect(result.raw_to_candle_lineage).toEqual([
    {
      candle_identity:
        "synthetic_databento_schema_fixture:EQUS.MINI:SPY:XNYS-2026-03-09-regular:2026-03-09T13:30:00.000Z",
      source_record_digest:
        result.candles[0]?.source_record_digest,
      raw_record_ids: [
        "normal-1",
        "normal-2",
        "normal-3",
        "normal-4",
      ],
    },
  ]);
  expect(result.raw_record_dispositions).toHaveLength(4);
  expect(
    result.raw_record_dispositions.every(
      (record) =>
        record.disposition === "included_in_candle" &&
        record.candle_identity !== null &&
        record.reason_codes.length === 0,
    ),
  ).toBe(true);
  expect(result.digests).toMatchObject({
    immutable_raw_records_digest: expect.stringMatching(
      /^[0-9a-f]{64}$/,
    ),
    immutable_normalized_candles_digest: expect.stringMatching(
      /^[0-9a-f]{64}$/,
    ),
  });
});

test("same event timestamps use sequence then required tie-break identity", () => {
  const result = expectPrepared(
    runFixture("same_timestamp_stable_tie_break").result,
  );
  expect(result.candles[0]).toMatchObject({
    open: 600,
    high: 603,
    low: 600,
    close: 603,
    eligible_trade_count: 3,
  });
  expect(
    result.candles[0]?.lineage.map((record) => record.tie_break_id),
  ).toEqual(["a", "m", "z"]);
});

test("provider source order is diagnosed while event-time order drives candle", () => {
  const result = expectPrepared(
    runFixture("out_of_order_provider_stream").result,
  );
  expect(result.diagnostics.out_of_order_records).toBe(1);
  expect(result.candles[0]).toMatchObject({
    open: 600,
    close: 603,
    high: 603,
    low: 600,
  });
});

test("duplicates, corrections, cancels, and invalid numbers fail closed", () => {
  const duplicate = runFixture("duplicate_record").result;
  expect(duplicate.status).toBe("rejected");
  if (duplicate.status === "rejected") {
    expect(duplicate.diagnostics.duplicate_records).toBeGreaterThan(0);
    expect(duplicate.error_codes).toEqual(
      expect.arrayContaining([
        "duplicate_raw_record_id",
        "duplicate_trade_identity",
        "source_position_invalid_or_duplicate",
      ]),
    );
  }

  const unsupported =
    runFixture("unsupported_correction_cancel").result;
  expect(unsupported.status).toBe("rejected");
  if (unsupported.status === "rejected") {
    expect(unsupported.diagnostics.unsupported_action_records).toBe(2);
    expect(unsupported.error_codes).toEqual(
      expect.arrayContaining([
        "unsupported_action:cancel-action",
        "unsupported_action:modify-correction-action",
      ]),
    );
  }

  const invalid = runFixture("invalid_price_and_size").result;
  expect(invalid.status).toBe("rejected");
  if (invalid.status === "rejected") {
    expect(invalid.diagnostics.invalid_numeric_records).toBe(2);
  }
});

test("NaN and Infinity reject without producing a partial candle", () => {
  for (const nonFinite of [Number.NaN, Number.POSITIVE_INFINITY]) {
    const fixture = marketContextTradeToCandleFixtureV1(
      "normal_one_minute_candle",
    );
    fixture.input.records[0]!.price = nonFinite;
    const result = prepareMarketContextTradesToCandlesV1(fixture.input);
    expect(result.status).toBe("rejected");
    expect(result.candles).toEqual([]);
    if (result.status === "rejected") {
      expect(result.error_codes).toEqual(
        expect.arrayContaining([
          "record_non_canonical_value:normal-1",
          "invalid_price_or_size:normal-1",
          "raw_record_digest_mismatch:normal-1",
        ]),
      );
    }
  }
});

test("late receive is excluded by the frozen two-second watermark", () => {
  expect(MARKET_CONTEXT_TRADE_MAX_LATENESS_MS).toBe(2_000);
  const result = expectPrepared(
    runFixture("late_receive_excluded").result,
  );
  expect(result.candles[0]).toMatchObject({
    eligible_trade_count: 1,
    excluded_trade_count: 1,
    excluded_reason_codes: ["late_receive_after_watermark"],
  });
  expect(result.diagnostics).toMatchObject({
    records_eligible: 1,
    records_excluded: 1,
    late_receive_records: 1,
  });
  expect(result.diagnostics.excluded_by_reason).toEqual([
    {
      reason_code: "late_receive_after_watermark",
      count: 1,
    },
  ]);
  expect(result.raw_record_dispositions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        raw_record_id: "on-time",
        disposition: "included_in_candle",
        reason_codes: [],
      }),
      expect.objectContaining({
        raw_record_id: "late-receive",
        disposition: "excluded",
        candle_identity: null,
        reason_codes: ["late_receive_after_watermark"],
      }),
    ]),
  );
});

test("a bucket is never emitted before its watermark finalizes", () => {
  const result = expectPrepared(
    runFixture("unfinalized_bucket_at_cutoff").result,
  );
  expect(result.candles).toEqual([]);
  expect(result.gaps).toEqual([
    expect.objectContaining({
      bucket_start_timestamp: "2026-03-09T13:30:00.000Z",
      reason_code: "bucket_not_finalized_as_of_cutoff",
      forward_filled: false,
    }),
  ]);
  expect(result.diagnostics).toMatchObject({
    records_eligible: 0,
    records_excluded: 1,
    unfinalized_buckets: 1,
  });
  expect(result.raw_record_dispositions).toEqual([
    expect.objectContaining({
      raw_record_id: "unfinalized",
      disposition: "excluded",
      reason_codes: ["bucket_not_finalized_as_of_cutoff"],
    }),
  ]);
});

test("session filter excludes pre/post records and preserves half-day boundary", () => {
  const regular = expectPrepared(
    runFixture("pre_and_post_market_excluded").result,
  );
  expect(regular.candles).toHaveLength(1);
  expect(regular.diagnostics.outside_session_records).toBe(2);
  expect(
    regular.raw_record_dispositions.filter(
      (record) => record.disposition === "excluded",
    ),
  ).toEqual([
    expect.objectContaining({
      raw_record_id: "pre-market",
      reason_codes: ["outside_declared_session"],
    }),
    expect.objectContaining({
      raw_record_id: "post-market",
      reason_codes: ["outside_declared_session"],
    }),
  ]);

  const halfDay = expectPrepared(
    runFixture("half_day_close_boundary").result,
  );
  expect(halfDay.candles[0]).toMatchObject({
    session_type: "half_day",
    bucket_start_timestamp: "2026-11-27T17:59:00.000Z",
  });
  expect(halfDay.diagnostics.outside_session_records).toBe(1);
  expect(halfDay.gaps).toHaveLength(209);
  expect(
    halfDay.gaps.every((gap) => gap.forward_filled === false),
  ).toBe(true);
});

test("explicit UTC sessions make DST boundaries deterministic", () => {
  const result = expectPrepared(
    runFixture("dst_explicit_session_offsets").result,
  );
  expect(
    result.candles.map((candle) => ({
      session: candle.session_id,
      bucket: candle.bucket_start_timestamp,
    })),
  ).toEqual([
    {
      session: "XNYS-2026-03-06-pre-dst",
      bucket: "2026-03-06T14:30:00.000Z",
    },
    {
      session: "XNYS-2026-03-09-post-dst",
      bucket: "2026-03-09T13:30:00.000Z",
    },
  ]);
});

test("missing minutes remain explicit gaps and are never forward-filled", () => {
  const result = expectPrepared(
    runFixture("missing_minute_preserved_as_gap").result,
  );
  expect(result.candles).toHaveLength(2);
  expect(result.gaps).toEqual([
    {
      symbol: "SPY",
      session_id: "XNYS-2026-03-09-regular",
      session_date: "2026-03-09",
      bucket_start_timestamp: "2026-03-09T13:31:00.000Z",
      bucket_end_timestamp: "2026-03-09T13:32:00.000Z",
      reason_code: "missing_minute_no_eligible_trade",
      forward_filled: false,
    },
  ]);
});

test("future event/receive timestamps and raw digest tampering reject", () => {
  const future =
    runFixture("future_event_and_receive_rejected").result;
  expect(future.status).toBe("rejected");
  if (future.status === "rejected") {
    expect(future.diagnostics).toMatchObject({
      future_event_records: 1,
      future_receive_records: 1,
    });
    expect(future.candles).toEqual([]);
  }

  const tampered =
    runFixture("tampered_raw_record_digest").result;
  expect(tampered.status).toBe("rejected");
  if (tampered.status === "rejected") {
    expect(tampered.diagnostics.tampered_raw_records).toBe(1);
    expect(tampered.error_codes).toContain(
      "raw_record_digest_mismatch:tampered",
    );
  }
});

test("naive event and receive timestamps are rejected", () => {
  for (const field of [
    "event_timestamp",
    "receive_timestamp",
  ] as const) {
    const fixture = marketContextTradeToCandleFixtureV1(
      "normal_one_minute_candle",
    );
    fixture.input.records[0]![field] = "2026-03-09T13:30:00";
    const result = prepareMarketContextTradesToCandlesV1(fixture.input);
    expect(result.status).toBe("rejected");
    if (result.status === "rejected") {
      expect(result.error_codes).toContain(
        "record_explicit_timestamp_invalid:normal-1",
      );
    }
  }
});

test("unsupported quality flags and unmapped conditions fail closed", () => {
  const result =
    runFixture("unsupported_flags_and_conditions").result;
  expect(result.status).toBe("rejected");
  if (result.status === "rejected") {
    expect(result.diagnostics).toMatchObject({
      rejected_flag_records: 2,
      unsupported_condition_records: 1,
    });
    expect(result.error_codes).toEqual(
      expect.arrayContaining([
        "rejected_data_quality_flags:bad-receive-flag",
        "unsupported_flags:publisher-specific-flag",
        "unsupported_trade_conditions:unsupported-condition",
      ]),
    );
  }
});

test("input object and array order do not affect byte output", () => {
  const fixture = marketContextTradeToCandleFixtureV1(
    "input_array_order_determinism",
  );
  const snapshot = structuredClone(fixture.input);
  const forward = prepareMarketContextTradesToCandlesV1(fixture.input);
  const reversed = prepareMarketContextTradesToCandlesV1({
    manifest: structuredClone(fixture.input.manifest),
    records: structuredClone(fixture.input.records).reverse(),
  });
  expect(fixture.input).toEqual(snapshot);
  expect(
    stableMarketContextTradePreparationJsonV1(reversed),
  ).toBe(stableMarketContextTradePreparationJsonV1(forward));
});

test("SPY, QQQ, and all eleven sectors prepare independently in parallel", () => {
  const result = expectPrepared(
    runFixture("spy_qqq_and_sector_parallel_preparation").result,
  );
  expect(result.candles).toHaveLength(13);
  expect(result.gaps).toEqual([]);
  expect(result.candles.map((candle) => candle.symbol).sort()).toEqual(
    ["SPY", "QQQ", ...MARKET_CONTEXT_SECTOR_ETF_SYMBOLS].sort(),
  );
  expect(
    new Set(
      result.candles.map((candle) => candle.source_record_digest),
    ).size,
  ).toBe(13);
});

test("eleven-sector breadth is separate, complete, and explicitly limited", () => {
  expect(MARKET_CONTEXT_SECTOR_ETF_BREADTH_VERSION).toBe(
    "market_context_sector_etf_breadth_v1",
  );
  const input = marketContextElevenSectorBreadthFixtureV1();
  const result = deriveMarketContextSectorEtfBreadthV1(input);
  expect(result).toMatchObject({
    status: "measured",
    breadth_identity: "declared_eleven_sector_etf_participation",
    expected_constituents: 11,
    observed_constituents: 11,
    coverage: 1,
    advancing_fraction: 0.636364,
    above_short_average_fraction: 0.545455,
    not_full_market_breadth: true,
    reason_codes: [
      "SECTOR_ETF_BREADTH_ONLY",
      "NOT_FULL_MARKET_BREADTH",
    ],
  });
  if (result.status === "measured") {
    expect(result.normalized_digest).toMatch(/^[0-9a-f]{64}$/);
  }

  const incomplete = structuredClone(input);
  incomplete.sectors.pop();
  const rejected = deriveMarketContextSectorEtfBreadthV1(incomplete);
  expect(rejected.status).toBe("rejected");
  if (rejected.status === "rejected") {
    expect(rejected.error_codes).toContain(
      "sector_universe_incomplete",
    );
  }
});

test("sector breadth is byte-deterministic under input permutations", () => {
  const forward = marketContextElevenSectorBreadthFixtureV1();
  const reversed = structuredClone(forward);
  reversed.sectors.reverse();
  const first = deriveMarketContextSectorEtfBreadthV1(forward);
  const second = deriveMarketContextSectorEtfBreadthV1(reversed);
  expect(
    stableMarketContextTradePreparationJsonV1(second),
  ).toBe(stableMarketContextTradePreparationJsonV1(first));
});

test("fixed cross-process preparation digest", () => {
  const result = runFixture("cross_timezone_equivalence").result;
  const digest = sha256(
    stableMarketContextTradePreparationJsonV1(result),
  );
  expect(result.status).toBe("prepared");
  expect(digest).toMatch(/^[0-9a-f]{64}$/);
  console.log(`ACTION_667M2A_TZ_DIGEST=${digest}`);
});

test("UTC, Stockholm, and New York child processes are byte-identical", () => {
  const timezones = [
    "UTC",
    "Europe/Stockholm",
    "America/New_York",
  ];
  const digests = timezones.map((timezone) => {
    const child = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "playwright",
        "test",
        "tests/e2e/action-667m2a-trade-to-candle-preparation.spec.ts",
        "--grep",
        "fixed cross-process preparation digest",
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
    const match = child.stdout.match(
      /ACTION_667M2A_TZ_DIGEST=([a-f0-9]{64})/,
    );
    expect(match?.[1]).toMatch(/^[0-9a-f]{64}$/);
    return match?.[1];
  });
  expect(new Set(digests).size).toBe(1);
});

test("official schema evidence is public, explicit, and unauthenticated", () => {
  expect(MARKET_CONTEXT_TRADE_OFFICIAL_SCHEMA_EVIDENCE_V1).toEqual(
    expect.objectContaining({
      provider: "Databento",
      reviewed_dataset: "EQUS.MINI",
      reviewed_schema: "trades",
      facts: expect.objectContaining({
        event_timestamp_field: "ts_event",
        receive_timestamp_field: "ts_recv",
        sequence_type: "uint32",
        trades_action: "T",
        equs_mini_sequence_semantics: "always_zero",
        tie_break_identity_required_by_contract: true,
        sale_conditions_available_in_reviewed_schema: false,
      }),
      authenticated_provider_calls: 0,
    }),
  );
  expect(
    MARKET_CONTEXT_TRADE_OFFICIAL_SCHEMA_EVIDENCE_V1.official_urls,
  ).toHaveLength(3);
});

test("preparation modules have no provider, replay, database, or live imports", () => {
  const paths = [
    "lib/market-context-intelligence-lab/trade-to-candle-preparation-v1.ts",
    "lib/market-context-intelligence-lab/trade-to-candle-preparation-fixtures-v1.ts",
  ];
  const imports = paths.flatMap((path) =>
    Array.from(
      readFileSync(resolve(repositoryRoot, path), "utf8").matchAll(
        /from\s+["']([^"']+)["']/g,
      ),
    ).map((match) => match[1] ?? ""),
  );
  expect(
    imports.some((source) =>
      /supabase|provider-client|collector|scanner|recommendation|shadow-replay|app\/api/.test(
        source,
      ),
    ),
  ).toBe(false);
  expect(imports).toEqual(
    expect.arrayContaining([
      "node:crypto",
      "./explicit-instant-v1",
      "./trade-to-candle-preparation-v1",
    ]),
  );
});
