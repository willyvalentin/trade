import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import type {
  MarketBreadthInput,
  MarketContextMetricPoint,
  MarketContextProviderMetadata,
  MarketSectorBenchmarkInput,
  SectorHorizonInput,
} from "../lib/market-context-intelligence-lab/contract-v1";
import {
  buildMarketContextDiagnosticReplayScheduleV1,
  diagnosticReplaySha256V1,
  MARKET_CONTEXT_DIAGNOSTIC_METRIC_DERIVATION_V1,
  MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_REPLAY_DATASET_ID,
  MARKET_CONTEXT_DIAGNOSTIC_REPLAY_MARKERS,
  MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1,
  stableDiagnosticReplayJsonV1,
  type MarketContextDiagnosticDecisionScheduleEntryV1,
  type MarketContextDiagnosticReplayCalendarSessionV1,
} from "../lib/market-context-intelligence-lab/diagnostic-replay-schedule-v1";
import type {
  MarketContextIntelligenceV2Input,
} from "../lib/market-context-intelligence-lab/contract-v2";
import type {
  MarketContextProducerVersionMetadata,
} from "../lib/market-context-intelligence-lab/shadow-canonical-bridge-v1";
import {
  runMarketContextShadowReplayV1,
  sealMarketContextShadowReplayV1Input,
  stableMarketContextShadowReplayJsonV1,
  type MarketContextShadowReplayDecisionOutputV1,
} from "../lib/market-context-intelligence-lab/shadow-replay-v1";

const EXPECTED_NORMALIZED_DATASET_DIGEST =
  "72fd0912e079be176a81748a01cad630dda3dc62322987ee3307e3e0e55b6d8c";
const EXPECTED_OUTPUT_TREE_DIGEST =
  "b76048092197c9a18ecfeff8b851a50e60a60142a9bfa4b82b6d5c6269d1fc1e";
const EXPECTED_LINEAGE_DIGEST =
  "fa874fd4747d16f9e1a03ef22ed4e9fa3be2491d767087372805992ab0ba3d5c";
const EXPECTED_MANIFEST_DIGEST =
  "d709a32280c7fb054f5b01141349418f1ff610d61147813866068a64d500a922";
const EXPECTED_RAW_ROOT =
  "7b9d1bdc9e9f75df2424f31da1e194a80f7ec875a34f38cd8782e6a72c09ac51";
const EXPECTED_NORMALIZATION_VERSION =
  "market_context_diagnostic_trade_to_candle_normalization_v1";
const EXPECTED_M5G_EVIDENCE_DIGEST =
  "aba25a4bdc5f1844678b40172e0f7caede1c4dae94625981ef2eae05b6c5dfd4";
const EXPECTED_CANDLE_COUNT = 100_280;
const EXPECTED_GAP_COUNT = 1_120;
const EXPECTED_ARTIFACT_COUNT = 303;
const MINUTE_NS = BigInt("60000000000");
const WATERMARK_NS = BigInt("2000000000");
const PRICE_SCALE = 1_000_000_000;

const SYMBOLS = [
  "QQQ",
  "SPY",
  "XLB",
  "XLC",
  "XLE",
  "XLF",
  "XLI",
  "XLK",
  "XLP",
  "XLRE",
  "XLU",
  "XLV",
  "XLY",
] as const;

const SECTORS = [
  ["materials", "XLB"],
  ["communication_services", "XLC"],
  ["energy", "XLE"],
  ["financials", "XLF"],
  ["industrials", "XLI"],
  ["technology", "XLK"],
  ["consumer_staples", "XLP"],
  ["real_estate", "XLRE"],
  ["utilities", "XLU"],
  ["health_care", "XLV"],
  ["consumer_discretionary", "XLY"],
] as const;

type CandleRow =
  | {
      type: "gap";
      bucket_identity: string;
      bucket_start_unix_ns: string;
      bucket_end_unix_ns: string;
      reason_code: string;
      forward_filled: false;
      interpolated: false;
    }
  | {
      type: "candle";
      bucket_identity: string;
      bucket_start_unix_ns: string;
      bucket_end_unix_ns: string;
      finalization_watermark_unix_ns: string;
      open_price_scaled: string;
      high_price_scaled: string;
      low_price_scaled: string;
      close_price_scaled: string;
      volume: string;
      trade_count: number;
      first_ts_event_unix_ns: string;
      last_ts_event_unix_ns: string;
      first_ts_recv_unix_ns: string;
      last_ts_recv_unix_ns: string;
      records_after_provisional_watermark: number;
    };

type CandlePartition = {
  schema_version: string;
  normalizer_version: string;
  namespace: string;
  partition: {
    session_date: string;
    symbol: string;
    row_count: number;
  };
  markers: Record<string, unknown>;
  rows: CandleRow[];
};

type BreadthRow = {
  bucket_start_unix_ns: string;
  bucket_end_unix_ns: string;
  advancing_sector_etfs: number;
  declining_sector_etfs: number;
  unchanged_sector_etfs: number;
  comparable_sector_etfs: number;
  unavailable_sector_etfs: number;
  declared_sector_etf_count: 11;
  not_full_market_breadth: true;
};

type BreadthPartition = {
  schema_version: string;
  normalizer_version: string;
  session_date: string;
  sector_etfs: string[];
  not_full_market_breadth: true;
  rows: BreadthRow[];
};

type NormalizedManifest = {
  schema_version: string;
  normalizer_version: string;
  namespace: string;
  markers: Record<string, unknown>;
  source: {
    combined_raw_file_digest_root: string;
    raw_file_count: number;
    raw_record_count: number;
    core_included_record_count: number;
    raw_files_unchanged: boolean;
  };
  policy: {
    m5g_evidence_digest: string;
    calendar_digest: string;
    duplicate_policy: string;
    watermark_identity: string;
    watermark_value_ns: string;
    watermark_status: string;
  };
  partitions: {
    candle_partition_count: number;
    breadth_partition_count: number;
    record_disposition_partition_count: number;
    candle_count: number;
    gap_count: number;
    not_full_market_breadth: true;
  };
  lineage: {
    raw_to_record_disposition_root_sha256: string;
    record_disposition_count: number;
    lineage_gap_count: number;
  };
  artifact_inventory_excluding_manifest: Array<{
    relative_path: string;
    size_bytes: number;
    sha256: string;
  }>;
  normalized_dataset_digest: string;
  authorization: {
    replay_authorized: false;
    canonical_binding_ready: false;
    live_ranking_effect: false;
  };
};

type LoadedDataset = {
  manifest: NormalizedManifest;
  sessions: MarketContextDiagnosticReplayCalendarSessionV1[];
  candles: Map<string, Map<string, CandlePartition>>;
  breadth: Map<string, BreadthPartition>;
  normalizedTreeDigest: string;
};

type DailyBar = {
  sessionDate: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type DiagnosticDecisionAudit = {
  decision_id: string;
  decision_timestamp: string;
  current_session_finalized_minute_count: number;
  current_session_observed_candle_count: number;
  current_session_gap_count: number;
  benchmark_gap_count: number;
  sector_gap_count: number;
  current_session_future_candles_excluded: number;
  current_session_future_gaps_excluded: number;
  later_session_rows_excluded: number;
  prior_session_count: number;
  current_full_day_aggregation_used: false;
  future_input_points_passed_to_core: 0;
  provider_timestamp_after_decision_count: 0;
  record_finalization_violation_count: 0;
  maximum_provider_source_unix_ns: string;
  maximum_provider_received_unix_ns: string;
  diagnostic_reason_codes: string[];
};

type DiagnosticDecisionResult = {
  schedule: MarketContextDiagnosticDecisionScheduleEntryV1;
  adapter_audit: DiagnosticDecisionAudit;
  evaluation: MarketContextShadowReplayDecisionOutputV1;
  markers: typeof MARKET_CONTEXT_DIAGNOSTIC_REPLAY_MARKERS;
};

function sha256Bytes(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function sha256File(path: string) {
  return sha256Bytes(readFileSync(path));
}

function canonicalBytes(value: unknown) {
  return `${stableDiagnosticReplayJsonV1(value)}\n`;
}

function isWithin(child: string, parent: string) {
  const childPath = resolve(child);
  const parentPath = resolve(parent);
  return childPath.startsWith(`${parentPath}${sep}`);
}

function listFiles(root: string) {
  const files: string[] = [];
  function walk(directory: string) {
    for (const name of readdirSync(directory).sort((a, b) =>
      a.localeCompare(b),
    )) {
      const path = join(directory, name);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) {
        throw new Error(`diagnostic_replay_symlink_rejected:${path}`);
      }
      if (stat.isDirectory()) walk(path);
      else if (stat.isFile()) files.push(path);
    }
  }
  walk(root);
  return files;
}

function treeInventory(root: string) {
  return listFiles(root)
    .map((path) => ({
      relative_path: relative(root, path).split(sep).join("/"),
      size_bytes: statSync(path).size,
      sha256: sha256File(path),
    }))
    .sort((first, second) =>
      first.relative_path.localeCompare(second.relative_path),
    );
}

function writeCanonicalJson(path: string, value: unknown) {
  if (existsSync(path)) {
    throw new Error(`diagnostic_replay_output_exists:${path}`);
  }
  const payload = canonicalBytes(value);
  writeFileSync(path, payload, { encoding: "utf8", mode: 0o600 });
  chmodSync(path, 0o600);
  return {
    path,
    relative_path: "",
    size_bytes: Buffer.byteLength(payload),
    sha256: sha256Bytes(payload),
  };
}

function mkdirPrivate(path: string) {
  mkdirSync(path, { recursive: true, mode: 0o700 });
  chmodSync(path, 0o700);
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function unixNsToIso(value: bigint) {
  return new Date(Number(value / BigInt(1_000_000))).toISOString();
}

function round(value: number, digits = 6) {
  return Number(value.toFixed(digits));
}

function mean(values: number[]) {
  return values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentChange(current: number, previous: number) {
  return previous === 0 ? null : round((current / previous - 1) * 100);
}

function trendSlopePct(values: number[]) {
  if (values.length < 2) return null;
  const xMean = (values.length - 1) / 2;
  const yMean = mean(values);
  if (yMean === null || yMean === 0) return null;
  let numerator = 0;
  let denominator = 0;
  values.forEach((value, index) => {
    numerator += (index - xMean) * (value - yMean);
    denominator += (index - xMean) ** 2;
  });
  return denominator === 0
    ? null
    : round(((numerator / denominator) / yMean) * 100);
}

function realizedVolatilityPct(values: number[]) {
  if (values.length < 3) return null;
  const returns = values.slice(1).map((value, index) =>
    value / (values[index] ?? value) - 1,
  );
  const average = mean(returns);
  if (average === null || returns.length < 2) return null;
  const variance =
    returns.reduce(
      (sum, value) => sum + (value - average) ** 2,
      0,
    ) /
    (returns.length - 1);
  return round(Math.sqrt(variance) * Math.sqrt(returns.length) * 100);
}

function candlePrice(value: string) {
  return Number(value) / PRICE_SCALE;
}

function observedRows(rows: CandleRow[], count: number) {
  return rows
    .slice(0, count)
    .filter(
      (row): row is Extract<CandleRow, { type: "candle" }> =>
        row.type === "candle",
    );
}

function metricFromCandles(
  rows: Extract<CandleRow, { type: "candle" }>[],
): MarketContextMetricPoint | null {
  const first = rows[0];
  const last = rows.at(-1);
  if (!first || !last) return null;
  const closes = rows.map((row) =>
    candlePrice(row.close_price_scaled),
  );
  const shortValues = closes.slice(-20);
  const longValues = closes.slice(-50);
  const momentumBase =
    closes[Math.max(0, closes.length - 21)] ?? closes[0];
  const high = Math.max(
    ...rows.map((row) => candlePrice(row.high_price_scaled)),
  );
  const low = Math.min(
    ...rows.map((row) => candlePrice(row.low_price_scaled)),
  );
  const open = candlePrice(first.open_price_scaled);
  const close = candlePrice(last.close_price_scaled);
  return {
    timestamp: unixNsToIso(BigInt(last.bucket_end_unix_ns)),
    close,
    return_pct: percentChange(close, open),
    moving_average_short: round(mean(shortValues) ?? close),
    moving_average_long: round(mean(longValues) ?? close),
    momentum_pct: percentChange(close, momentumBase),
    trend_slope_pct: trendSlopePct(shortValues),
    realized_volatility_pct: realizedVolatilityPct(closes),
    range_pct: low === 0 ? null : round((high / low - 1) * 100),
  };
}

function metricFromDailyBars(
  bars: DailyBar[],
): MarketContextMetricPoint | null {
  const window = bars.slice(-10);
  const first = window[0];
  const last = window.at(-1);
  if (!first || !last) return null;
  const closes = window.map((bar) => bar.close);
  const short = closes.slice(-5);
  const momentumBase =
    closes[Math.max(0, closes.length - 6)] ?? closes[0];
  const high = Math.max(...window.map((bar) => bar.high));
  const low = Math.min(...window.map((bar) => bar.low));
  return {
    timestamp: last.timestamp,
    close: last.close,
    return_pct: percentChange(last.close, first.open),
    moving_average_short: round(mean(short) ?? last.close),
    moving_average_long: round(mean(closes) ?? last.close),
    momentum_pct: percentChange(last.close, momentumBase),
    trend_slope_pct: trendSlopePct(short),
    realized_volatility_pct: realizedVolatilityPct(closes),
    range_pct: low === 0 ? null : round((high / low - 1) * 100),
  };
}

function dailyBar(
  sessionDate: string,
  partition: CandlePartition,
): DailyBar {
  const rows = partition.rows.filter(
    (row): row is Extract<CandleRow, { type: "candle" }> =>
      row.type === "candle",
  );
  const first = rows[0];
  const last = rows.at(-1);
  if (!first || !last) {
    throw new Error(
      `diagnostic_replay_empty_daily_partition:${sessionDate}:${partition.partition.symbol}`,
    );
  }
  return {
    sessionDate,
    timestamp: unixNsToIso(BigInt(last.bucket_end_unix_ns)),
    open: candlePrice(first.open_price_scaled),
    high: Math.max(
      ...rows.map((row) => candlePrice(row.high_price_scaled)),
    ),
    low: Math.min(
      ...rows.map((row) => candlePrice(row.low_price_scaled)),
    ),
    close: candlePrice(last.close_price_scaled),
  };
}

function providerMetadata(
  provider: string,
  rows: Extract<CandleRow, { type: "candle" }>[],
  expectedPoints: number,
): {
  metadata: MarketContextProviderMetadata;
  maxSourceNs: bigint;
  maxReceivedNs: bigint;
} {
  const last = rows.at(-1);
  if (!last) {
    return {
      metadata: {
        provider,
        source_timestamp: null,
        received_timestamp: null,
        expected_points: expectedPoints,
        observed_points: 0,
        missing_points: expectedPoints,
        coverage: 0,
      },
      maxSourceNs: BigInt(0),
      maxReceivedNs: BigInt(0),
    };
  }
  const maxSourceNs = rows.reduce(
    (maximum, row) =>
      BigInt(row.last_ts_event_unix_ns) > maximum
        ? BigInt(row.last_ts_event_unix_ns)
        : maximum,
    BigInt(0),
  );
  const maxReceivedNs = rows.reduce(
    (maximum, row) =>
      BigInt(row.last_ts_recv_unix_ns) > maximum
        ? BigInt(row.last_ts_recv_unix_ns)
        : maximum,
    BigInt(0),
  );
  return {
    metadata: {
      provider,
      source_timestamp: unixNsToIso(maxSourceNs),
      received_timestamp: unixNsToIso(maxReceivedNs),
      expected_points: expectedPoints,
      observed_points: rows.length,
      missing_points: expectedPoints - rows.length,
      coverage: round(rows.length / expectedPoints),
    },
    maxSourceNs,
    maxReceivedNs,
  };
}

function validateMarkers(markers: Record<string, unknown>) {
  const expected = {
    canonical_performance_eligible: false,
    corporate_actions_applied: false,
    diagnostic_all_reported_trades: true,
    live_ranking_effect: false,
    official_ohlcv_claimed: false,
    raw_unadjusted: true,
    sale_condition_semantics_available: false,
    watermark_status: "empirically_unvalidated",
  };
  if (
    stableDiagnosticReplayJsonV1(markers) !==
    stableDiagnosticReplayJsonV1(expected)
  ) {
    throw new Error("diagnostic_replay_normalized_marker_drift");
  }
}

function calendarSessions(repo: string) {
  const paths = [
    join(
      repo,
      "docs/evidence/market-context-xnys-calibration-calendar-2026-v1.json",
    ),
    join(
      repo,
      "docs/evidence/market-context-xnys-acquisition-calendar-2026-v1.json",
    ),
  ];
  const sessions = paths.flatMap((path) => {
    const value = readJson<{
      canonical_json_material: {
        sessions: MarketContextDiagnosticReplayCalendarSessionV1[];
      };
    }>(path);
    return value.canonical_json_material.sessions;
  });
  return sessions.sort((first, second) =>
    first.date.localeCompare(second.date),
  );
}

function preflightNormalizedDataset(
  repo: string,
  inputRoot: string,
  inputOrder: "canonical" | "reverse",
): LoadedDataset {
  const manifestPath = join(inputRoot, "normalized-dataset-manifest.json");
  const manifest = readJson<NormalizedManifest>(manifestPath);
  if (
    sha256File(manifestPath) !== EXPECTED_MANIFEST_DIGEST ||
    manifest.normalized_dataset_digest !==
      EXPECTED_NORMALIZED_DATASET_DIGEST ||
    manifest.lineage.raw_to_record_disposition_root_sha256 !==
      EXPECTED_LINEAGE_DIGEST ||
    manifest.source.combined_raw_file_digest_root !== EXPECTED_RAW_ROOT ||
    manifest.normalizer_version !== EXPECTED_NORMALIZATION_VERSION ||
    manifest.policy.m5g_evidence_digest !== EXPECTED_M5G_EVIDENCE_DIGEST ||
    manifest.policy.watermark_status !== "empirically_unvalidated" ||
    manifest.partitions.candle_count !== EXPECTED_CANDLE_COUNT ||
    manifest.partitions.gap_count !== EXPECTED_GAP_COUNT ||
    manifest.partitions.candle_partition_count !== 260 ||
    manifest.partitions.breadth_partition_count !== 20 ||
    manifest.partitions.record_disposition_partition_count !== 20 ||
    manifest.partitions.not_full_market_breadth !== true ||
    manifest.authorization.replay_authorized !== false ||
    manifest.authorization.canonical_binding_ready !== false ||
    manifest.authorization.live_ranking_effect !== false
  ) {
    throw new Error("diagnostic_replay_normalized_manifest_drift");
  }
  validateMarkers(manifest.markers);
  const inventory = [...manifest.artifact_inventory_excluding_manifest].sort(
    (first, second) =>
      first.relative_path.localeCompare(second.relative_path),
  );
  for (const item of inventory) {
    const path = join(inputRoot, item.relative_path);
    if (
      !existsSync(path) ||
      statSync(path).size !== item.size_bytes ||
      sha256File(path) !== item.sha256
    ) {
      throw new Error(
        `diagnostic_replay_normalized_artifact_drift:${item.relative_path}`,
      );
    }
  }
  if (
    diagnosticReplaySha256V1(inventory) !==
    EXPECTED_NORMALIZED_DATASET_DIGEST
  ) {
    throw new Error("diagnostic_replay_normalized_dataset_digest_drift");
  }
  const completeInventory = treeInventory(inputRoot);
  if (
    completeInventory.length !== EXPECTED_ARTIFACT_COUNT ||
    diagnosticReplaySha256V1(completeInventory) !==
      EXPECTED_OUTPUT_TREE_DIGEST
  ) {
    throw new Error("diagnostic_replay_normalized_tree_digest_drift");
  }

  const sessions = calendarSessions(repo);
  const candleFiles = inventory
    .filter((item) => item.relative_path.startsWith("candles/"))
    .map((item) => item.relative_path);
  const breadthFiles = inventory
    .filter((item) => item.relative_path.startsWith("breadth/"))
    .map((item) => item.relative_path);
  if (inputOrder === "reverse") {
    candleFiles.reverse();
    breadthFiles.reverse();
  }
  const candles = new Map<string, Map<string, CandlePartition>>();
  let candleCount = 0;
  let gapCount = 0;
  for (const relativePath of candleFiles) {
    const partition = readJson<CandlePartition>(
      join(inputRoot, relativePath),
    );
    validateMarkers(partition.markers);
    if (
      partition.normalizer_version !== EXPECTED_NORMALIZATION_VERSION ||
      partition.rows.length !== 390 ||
      !SYMBOLS.includes(
        partition.partition.symbol as typeof SYMBOLS[number],
      )
    ) {
      throw new Error(
        `diagnostic_replay_candle_partition_drift:${relativePath}`,
      );
    }
    candleCount += partition.rows.filter(
      (row) => row.type === "candle",
    ).length;
    gapCount += partition.rows.filter(
      (row) => row.type === "gap",
    ).length;
    const bySymbol =
      candles.get(partition.partition.session_date) ??
      new Map<string, CandlePartition>();
    if (bySymbol.has(partition.partition.symbol)) {
      throw new Error(
        `diagnostic_replay_duplicate_candle_partition:${relativePath}`,
      );
    }
    bySymbol.set(partition.partition.symbol, partition);
    candles.set(partition.partition.session_date, bySymbol);
  }
  const breadth = new Map<string, BreadthPartition>();
  for (const relativePath of breadthFiles) {
    const partition = readJson<BreadthPartition>(
      join(inputRoot, relativePath),
    );
    if (
      partition.not_full_market_breadth !== true ||
      partition.sector_etfs.length !== 11 ||
      new Set(partition.sector_etfs).size !== 11 ||
      partition.rows.length !== 390
    ) {
      throw new Error(
        `diagnostic_replay_breadth_partition_drift:${relativePath}`,
      );
    }
    breadth.set(partition.session_date, partition);
  }
  if (
    candleCount !== EXPECTED_CANDLE_COUNT ||
    gapCount !== EXPECTED_GAP_COUNT ||
    candles.size !== 20 ||
    breadth.size !== 20 ||
    [...candles.values()].some((value) => value.size !== 13)
  ) {
    throw new Error("diagnostic_replay_normalized_scope_reconciliation_failed");
  }
  return {
    manifest,
    sessions,
    candles,
    breadth,
    normalizedTreeDigest: EXPECTED_OUTPUT_TREE_DIGEST,
  };
}

function buildDailyBars(dataset: LoadedDataset) {
  const result = new Map<string, DailyBar[]>();
  for (const symbol of SYMBOLS) {
    const bars = dataset.sessions.map((session) => {
      const partition = dataset.candles
        .get(session.date)
        ?.get(symbol);
      if (!partition) {
        throw new Error(
          `diagnostic_replay_missing_partition:${session.date}:${symbol}`,
        );
      }
      return dailyBar(session.date, partition);
    });
    result.set(symbol, bars);
  }
  return result;
}

function sectorPoint(
  timestamp: string,
  sectorMetric: MarketContextMetricPoint | null,
  spyMetric: MarketContextMetricPoint | null,
): SectorHorizonInput[] {
  if (!sectorMetric || !spyMetric) return [];
  return [
    {
      timestamp,
      return_pct: sectorMetric.return_pct,
      spy_return_pct: spyMetric.return_pct,
      relative_return_vs_spy_pct:
        sectorMetric.return_pct === null ||
        spyMetric.return_pct === null
          ? null
          : round(sectorMetric.return_pct - spyMetric.return_pct),
      trend_slope_pct: sectorMetric.trend_slope_pct,
      realized_volatility_pct:
        sectorMetric.realized_volatility_pct,
    },
  ];
}

function buildDecisionInput(
  dataset: LoadedDataset,
  dailyBars: Map<string, DailyBar[]>,
  schedule: MarketContextDiagnosticDecisionScheduleEntryV1,
): {
  input: MarketContextIntelligenceV2Input;
  audit: DiagnosticDecisionAudit;
} {
  const sessionIndex = dataset.sessions.findIndex(
    (session) => session.date === schedule.session_date,
  );
  if (sessionIndex < 0) {
    throw new Error(
      `diagnostic_replay_schedule_session_missing:${schedule.session_date}`,
    );
  }
  const decisionNs = BigInt(schedule.decision_unix_ns);
  const bySymbol = dataset.candles.get(schedule.session_date);
  const breadthPartition = dataset.breadth.get(schedule.session_date);
  if (!bySymbol || !breadthPartition) {
    throw new Error(
      `diagnostic_replay_current_session_data_missing:${schedule.session_date}`,
    );
  }
  const currentObserved = new Map<
    string,
    Extract<CandleRow, { type: "candle" }>[]
  >();
  let currentGapCount = 0;
  let currentObservedCount = 0;
  let futureCandleCount = 0;
  let futureGapCount = 0;
  let benchmarkGapCount = 0;
  let sectorGapCount = 0;
  let maxSourceNs = BigInt(0);
  let maxReceivedNs = BigInt(0);

  for (const symbol of SYMBOLS) {
    const partition = bySymbol.get(symbol);
    if (!partition) {
      throw new Error(
        `diagnostic_replay_symbol_partition_missing:${schedule.session_date}:${symbol}`,
      );
    }
    const eligibleRows = partition.rows.slice(
      0,
      schedule.finalized_minute_count,
    );
    const futureRows = partition.rows.slice(
      schedule.finalized_minute_count,
    );
    const observed = observedRows(
      partition.rows,
      schedule.finalized_minute_count,
    );
    currentObserved.set(symbol, observed);
    const gaps = eligibleRows.filter((row) => row.type === "gap").length;
    currentGapCount += gaps;
    currentObservedCount += observed.length;
    futureCandleCount += futureRows.filter(
      (row) => row.type === "candle",
    ).length;
    futureGapCount += futureRows.filter(
      (row) => row.type === "gap",
    ).length;
    if (symbol === "SPY" || symbol === "QQQ") {
      benchmarkGapCount += gaps;
    } else {
      sectorGapCount += gaps;
    }
    for (const row of observed) {
      const finalization = BigInt(
        row.finalization_watermark_unix_ns,
      );
      const source = BigInt(row.last_ts_event_unix_ns);
      const received = BigInt(row.last_ts_recv_unix_ns);
      if (
        finalization > decisionNs ||
        source > decisionNs ||
        received > decisionNs ||
        row.records_after_provisional_watermark !== 0
      ) {
        throw new Error(
          `diagnostic_replay_point_in_time_violation:${schedule.decision_id}:${row.bucket_identity}`,
        );
      }
      if (source > maxSourceNs) maxSourceNs = source;
      if (received > maxReceivedNs) maxReceivedNs = received;
    }
  }
  const expectedDecisionNs =
    BigInt(
      dataset.sessions[sessionIndex]?.open_unix_ns ??
        "0",
    ) +
    BigInt(schedule.finalized_minute_count) * MINUTE_NS +
    WATERMARK_NS;
  if (expectedDecisionNs !== decisionNs) {
    throw new Error(
      `diagnostic_replay_schedule_watermark_drift:${schedule.decision_id}`,
    );
  }

  const benchmarks = (["SPY", "QQQ"] as const).map((symbol) => {
    const rows = currentObserved.get(symbol) ?? [];
    const intraday = metricFromCandles(rows);
    const priorBars = (dailyBars.get(symbol) ?? []).slice(0, sessionIndex);
    const multiDay = metricFromDailyBars(priorBars);
    const provider = providerMetadata(
      "databento_eq_us_mini_diagnostic_all_reported_trades",
      rows,
      schedule.finalized_minute_count,
    );
    return {
      symbol,
      intraday: intraday ? [intraday] : [],
      multi_day: multiDay ? [multiDay] : [],
      provider: provider.metadata,
    };
  });
  const spyIntraday = benchmarks.find(
    (benchmark) => benchmark.symbol === "SPY",
  )?.intraday[0] ?? null;
  const spyMultiDay = benchmarks.find(
    (benchmark) => benchmark.symbol === "SPY",
  )?.multi_day[0] ?? null;

  const sectors: MarketSectorBenchmarkInput[] = SECTORS.map(
    ([sectorId, symbol]) => {
      const rows = currentObserved.get(symbol) ?? [];
      const shortMetric = metricFromCandles(rows);
      const priorBars = (dailyBars.get(symbol) ?? []).slice(
        0,
        sessionIndex,
      );
      const mediumMetric = metricFromDailyBars(priorBars);
      const provider = providerMetadata(
        "databento_eq_us_mini_diagnostic_all_reported_trades",
        rows,
        schedule.finalized_minute_count,
      );
      return {
        context_level: "sector",
        sector_id: sectorId,
        industry_id: null,
        benchmark_symbol: symbol,
        short_horizon: sectorPoint(
          shortMetric?.timestamp ?? schedule.decision_timestamp,
          shortMetric,
          spyIntraday,
        ),
        medium_horizon: sectorPoint(
          mediumMetric?.timestamp ?? schedule.decision_timestamp,
          mediumMetric,
          spyMultiDay,
        ),
        provider: provider.metadata,
      };
    },
  );

  const breadthRow =
    breadthPartition.rows[schedule.finalized_minute_count - 1];
  if (
    !breadthRow ||
    BigInt(breadthRow.bucket_end_unix_ns) + WATERMARK_NS !==
      decisionNs ||
    breadthRow.not_full_market_breadth !== true ||
    breadthRow.declared_sector_etf_count !== 11
  ) {
    throw new Error(
      `diagnostic_replay_breadth_schedule_drift:${schedule.decision_id}`,
    );
  }
  let aboveShort = 0;
  let aboveShortObserved = 0;
  const sectorProviderRows: Extract<
    CandleRow,
    { type: "candle" }
  >[] = [];
  for (const [, symbol] of SECTORS) {
    const rows = currentObserved.get(symbol) ?? [];
    const last = rows.at(-1);
    const closes = rows
      .slice(-20)
      .map((row) => candlePrice(row.close_price_scaled));
    if (last && closes.length > 0) {
      aboveShortObserved += 1;
      sectorProviderRows.push(last);
      const average = mean(closes);
      if (
        average !== null &&
        candlePrice(last.close_price_scaled) > average
      ) {
        aboveShort += 1;
      }
    }
  }
  const observedBreadth = Math.min(
    breadthRow.comparable_sector_etfs,
    aboveShortObserved,
  );
  const breadthProvider = providerMetadata(
    "diagnostic_eleven_sector_etfs_not_full_market_breadth",
    sectorProviderRows,
    11,
  );
  const breadth: MarketBreadthInput = {
    timestamp: unixNsToIso(BigInt(breadthRow.bucket_end_unix_ns)),
    advancing_fraction:
      breadthRow.comparable_sector_etfs === 0
        ? null
        : round(
            breadthRow.advancing_sector_etfs /
              breadthRow.comparable_sector_etfs,
          ),
    above_short_average_fraction:
      aboveShortObserved === 0
        ? null
        : round(aboveShort / aboveShortObserved),
    expected_constituents: 11,
    observed_constituents: observedBreadth,
    coverage: round(observedBreadth / 11),
    provider: {
      ...breadthProvider.metadata,
      observed_points: observedBreadth,
      missing_points: 11 - observedBreadth,
      coverage: round(observedBreadth / 11),
    },
  };

  const input: MarketContextIntelligenceV2Input = {
    decision_timestamp: schedule.decision_timestamp,
    benchmarks,
    breadth,
    sectors,
    sector_universe: {
      expected_sector_ids: SECTORS.map(([sectorId]) => sectorId),
    },
  };
  for (const provider of [
    ...benchmarks.map((benchmark) => benchmark.provider),
    breadth.provider,
    ...sectors.map((sector) => sector.provider),
  ]) {
    for (const value of [
      provider.source_timestamp,
      provider.received_timestamp ?? null,
    ]) {
      if (value && Date.parse(value) > Date.parse(schedule.decision_timestamp)) {
        throw new Error(
          `diagnostic_replay_provider_timestamp_after_decision:${schedule.decision_id}`,
        );
      }
    }
  }

  const diagnosticReasonCodes = [
    "diagnostic_all_reported_trades_not_official_ohlcv",
    "diagnostic_breadth_not_full_market_breadth",
    "diagnostic_watermark_empirically_unvalidated",
  ];
  if (currentGapCount > 0) {
    diagnosticReasonCodes.push("diagnostic_explicit_candle_gaps_present");
  }
  if (sessionIndex === 0) {
    diagnosticReasonCodes.push(
      "diagnostic_prior_session_history_unavailable",
    );
  }

  return {
    input,
    audit: {
      decision_id: schedule.decision_id,
      decision_timestamp: schedule.decision_timestamp,
      current_session_finalized_minute_count:
        schedule.finalized_minute_count,
      current_session_observed_candle_count: currentObservedCount,
      current_session_gap_count: currentGapCount,
      benchmark_gap_count: benchmarkGapCount,
      sector_gap_count: sectorGapCount,
      current_session_future_candles_excluded: futureCandleCount,
      current_session_future_gaps_excluded: futureGapCount,
      later_session_rows_excluded:
        (dataset.sessions.length - sessionIndex - 1) * 13 * 390,
      prior_session_count: sessionIndex,
      current_full_day_aggregation_used: false,
      future_input_points_passed_to_core: 0,
      provider_timestamp_after_decision_count: 0,
      record_finalization_violation_count: 0,
      maximum_provider_source_unix_ns: maxSourceNs.toString(),
      maximum_provider_received_unix_ns: maxReceivedNs.toString(),
      diagnostic_reason_codes: diagnosticReasonCodes.sort((a, b) =>
        a.localeCompare(b),
      ),
    },
  };
}

function increment(
  target: Record<string, number>,
  key: string,
  amount = 1,
) {
  target[key] = (target[key] ?? 0) + amount;
}

function aggregateDiagnostics(decisions: DiagnosticDecisionResult[]) {
  const regimeDistribution: Record<string, number> = {};
  const decisionStatus: Record<string, number> = {
    sufficient: 0,
    insufficient: 0,
    conflicting: 0,
  };
  const dimensions: Record<string, Record<string, number>> = {
    trend_state: {},
    risk_state: {},
    volatility_state: {},
    breadth_state: {},
    spy_qqq_agreement: {},
    intraday_context: {},
    multi_day_context: {},
    data_quality_state: {},
  };
  const evidenceStrength: Record<string, number> = {};
  const reasonCodes: Record<string, number> = {};
  const sectorClassifications: Record<string, number> = {};
  let rankableSectorContexts = 0;
  let notRankableSectorContexts = 0;
  let parityAgreement = 0;
  let providerGapDecisions = 0;
  let decisionsWithGaps = 0;
  let eligibleGaps = 0;
  let futureCandlesExcluded = 0;
  let futureGapsExcluded = 0;
  let laterSessionRowsExcluded = 0;

  for (const decision of decisions) {
    const evaluation = decision.evaluation.v2_evaluation;
    increment(regimeDistribution, evaluation.classification);
    if (evaluation.classification === "insufficient_data") {
      decisionStatus.insufficient += 1;
    } else if (evaluation.classification === "conflicting_context") {
      decisionStatus.conflicting += 1;
    } else {
      decisionStatus.sufficient += 1;
    }
    for (const [dimension, value] of Object.entries(
      evaluation.dimensions,
    )) {
      increment(dimensions[dimension] ?? {}, value);
    }
    increment(evidenceStrength, evaluation.evidence_strength);
    for (const code of [
      ...evaluation.reason_codes,
      ...decision.adapter_audit.diagnostic_reason_codes,
    ]) {
      increment(reasonCodes, code);
    }
    if (
      evaluation.dimensions.data_quality_state === "provider_gap"
    ) {
      providerGapDecisions += 1;
    }
    for (const sector of evaluation.sector_context) {
      increment(sectorClassifications, sector.classification);
      if (sector.rank_status === "ranked") {
        rankableSectorContexts += 1;
      } else {
        notRankableSectorContexts += 1;
      }
    }
    if (decision.evaluation.classification_comparison.agreement) {
      parityAgreement += 1;
    }
    if (decision.adapter_audit.current_session_gap_count > 0) {
      decisionsWithGaps += 1;
    }
    eligibleGaps += decision.adapter_audit.current_session_gap_count;
    futureCandlesExcluded +=
      decision.adapter_audit.current_session_future_candles_excluded;
    futureGapsExcluded +=
      decision.adapter_audit.current_session_future_gaps_excluded;
    laterSessionRowsExcluded +=
      decision.adapter_audit.later_session_rows_excluded;
  }
  return {
    decision_count: decisions.length,
    regime_distribution: regimeDistribution,
    decision_status: decisionStatus,
    dimensions,
    evidence_strength_distribution: evidenceStrength,
    provider_gap_decision_count: providerGapDecisions,
    sector_contexts: {
      total: decisions.length * 11,
      rankable: rankableSectorContexts,
      not_rankable: notRankableSectorContexts,
      classification_counts: sectorClassifications,
      strong_count: sectorClassifications.strong ?? 0,
      weak_count: sectorClassifications.weak ?? 0,
      insufficient_count:
        sectorClassifications.insufficient_data ?? 0,
    },
    v1_v2_classification_parity: {
      agreement_count: parityAgreement,
      change_count: decisions.length - parityAgreement,
      agreement_fraction: round(parityAgreement / decisions.length),
    },
    point_in_time: {
      future_input_points_passed_to_core: 0,
      record_finalization_violation_count: 0,
      provider_timestamp_after_decision_count: 0,
      current_session_future_candles_excluded:
        futureCandlesExcluded,
      current_session_future_gaps_excluded: futureGapsExcluded,
      later_session_rows_excluded: laterSessionRowsExcluded,
      current_full_day_aggregation_use_count: 0,
    },
    gap_effects: {
      decisions_with_eligible_gaps: decisionsWithGaps,
      eligible_gap_rows: eligibleGaps,
    },
    reason_code_frequencies: reasonCodes,
    calibrated_probability: false,
    recommendation_confidence_mapping: "not_performed",
    canonical_outcomes_joined: false,
    performance_metrics_computed: [],
    prohibited_metrics: [
      "win_rate",
      "expectancy",
      "precision_at_k",
      "pnl",
    ],
  };
}

function sessionSummary(
  sessionDate: string,
  decisions: DiagnosticDecisionResult[],
) {
  const selected = decisions.filter(
    (decision) => decision.schedule.session_date === sessionDate,
  );
  return {
    session_date: sessionDate,
    decision_count: selected.length,
    decisions: selected.map((decision) => ({
      decision_id: decision.schedule.decision_id,
      decision_timestamp: decision.schedule.decision_timestamp,
      v1_classification:
        decision.evaluation.v1_evaluation.classification,
      v2_classification:
        decision.evaluation.v2_evaluation.classification,
      parity: decision.evaluation.classification_comparison.agreement,
      dimensions: decision.evaluation.v2_evaluation.dimensions,
      evidence_strength:
        decision.evaluation.v2_evaluation.evidence_strength,
      gap_count: decision.adapter_audit.current_session_gap_count,
      ranked_sector_count:
        decision.evaluation.v2_evaluation.sector_context.filter(
          (sector) => sector.rank_status === "ranked",
        ).length,
      not_rankable_sector_count:
        decision.evaluation.v2_evaluation.sector_context.filter(
          (sector) => sector.rank_status === "not_rankable",
        ).length,
      reason_codes: [
        ...decision.evaluation.v2_evaluation.reason_codes,
        ...decision.adapter_audit.diagnostic_reason_codes,
      ].sort((a, b) => a.localeCompare(b)),
    })),
  };
}

function producerVersions(): MarketContextProducerVersionMetadata {
  return {
    engine_version: MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1,
    scoring_version: "not_applicable_no_scoring",
    ranking_version: "diagnostic_sector_context_only_no_live_ranking",
    setup_taxonomy_version: "not_applicable_market_context_only",
    confidence_contract_version:
      "ordinal_evidence_strength_not_probability_v1",
    evaluator_version: "market_context_intelligence_v2",
    provider_contract_version:
      "eq_us_mini_diagnostic_all_reported_trades_offline_v1",
    git_commit: "becee774a270e078fbd8bb55a01d7a59b2205599",
    build_identity: "action-667m5i-local-diagnostic-replay",
  };
}

function runDiagnosticReplay(
  repo: string,
  inputRoot: string,
  outputRoot: string,
  allowedOutputRoot: string,
  inputOrder: "canonical" | "reverse",
) {
  if (existsSync(outputRoot)) {
    throw new Error("diagnostic_replay_output_root_exists");
  }
  if (
    !isWithin(outputRoot, allowedOutputRoot) ||
    isWithin(outputRoot, repo)
  ) {
    throw new Error("diagnostic_replay_output_boundary_invalid");
  }
  const dataset = preflightNormalizedDataset(
    repo,
    inputRoot,
    inputOrder,
  );
  const schedule = buildMarketContextDiagnosticReplayScheduleV1(
    dataset.sessions,
  );
  if (schedule.length !== 60) {
    throw new Error("diagnostic_replay_schedule_not_sixty");
  }
  const dailyBars = buildDailyBars(dataset);
  const prepared = schedule.map((entry) => ({
    schedule: entry,
    ...buildDecisionInput(dataset, dailyBars, entry),
  }));
  if (inputOrder === "reverse") prepared.reverse();
  const replayInput = sealMarketContextShadowReplayV1Input({
    replay_id: "action_667m5i_real_diagnostic_shadow_replay",
    dataset: {
      identity: {
        dataset_id: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_DATASET_ID,
        dataset_version:
          "normalized_dataset_72fd0912_diagnostic_replay_input_v1",
        source_kind: "offline_point_in_time",
      },
      decisions: prepared.map((decision) => ({
        decision_id: decision.schedule.decision_id,
        ticker: "MARKET_CONTEXT",
        session_label: decision.schedule.session_date,
        context_input: decision.input,
      })),
    },
    producer_versions: producerVersions(),
  });
  const replayInputFingerprint =
    stableMarketContextShadowReplayJsonV1(replayInput);
  const core = runMarketContextShadowReplayV1(replayInput);
  if (
    stableMarketContextShadowReplayJsonV1(replayInput) !==
    replayInputFingerprint ||
    core.decisions.length !== 60 ||
    core.canonical_binding_ready !== false ||
    core.shadow_only !== true ||
    core.live_ranking_effect !== false ||
    core.performance_claims.status !== "not_computed"
  ) {
    throw new Error("diagnostic_replay_core_contract_violation");
  }
  const auditById = new Map(
    prepared.map((decision) => [
      decision.schedule.decision_id,
      decision,
    ]),
  );
  const decisions: DiagnosticDecisionResult[] = core.decisions.map(
    (evaluation) => {
      const preparedDecision = auditById.get(
        evaluation.replay_identity.decision_id,
      );
      if (!preparedDecision) {
        throw new Error(
          `diagnostic_replay_audit_missing:${evaluation.replay_identity.decision_id}`,
        );
      }
      if (
        evaluation.leakage_control.replay_boundary
          .future_observations_excluded !== 0 ||
        evaluation.leakage_control.replay_boundary
          .future_provider_source_timestamps_excluded !== 0 ||
        evaluation.v1_evaluation.reason_codes.includes(
          "future_points_excluded",
        ) ||
        evaluation.v2_evaluation.reason_codes.includes(
          "future_points_excluded",
        ) ||
        evaluation.v2_evaluation.confidence
          .calibrated_probability !== false
      ) {
        throw new Error(
          `diagnostic_replay_core_leakage_or_probability_violation:${evaluation.replay_identity.decision_id}`,
        );
      }
      return {
        schedule: preparedDecision.schedule,
        adapter_audit: preparedDecision.audit,
        evaluation,
        markers: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_MARKERS,
      };
    },
  );
  const aggregate = aggregateDiagnostics(decisions);
  if (
    aggregate.point_in_time.future_input_points_passed_to_core !== 0 ||
    aggregate.point_in_time.record_finalization_violation_count !== 0 ||
    aggregate.point_in_time.provider_timestamp_after_decision_count !==
      0
  ) {
    throw new Error("diagnostic_replay_point_in_time_audit_failed");
  }

  mkdirPrivate(outputRoot);
  const decisionRoot = join(outputRoot, "decisions");
  const sessionRoot = join(outputRoot, "sessions");
  mkdirPrivate(decisionRoot);
  mkdirPrivate(sessionRoot);
  writeCanonicalJson(join(outputRoot, "decision-schedule.json"), {
    schedule_version: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1,
    decision_count: schedule.length,
    decisions: schedule,
  });
  for (const decision of decisions) {
    const directory = join(
      decisionRoot,
      decision.schedule.session_date,
    );
    mkdirPrivate(directory);
    writeCanonicalJson(
      join(directory, `${decision.schedule.slot_id}.json`),
      decision,
    );
  }
  for (const session of dataset.sessions) {
    writeCanonicalJson(
      join(sessionRoot, `${session.date}.json`),
      sessionSummary(session.date, decisions),
    );
  }
  writeCanonicalJson(join(outputRoot, "aggregate-diagnostics.json"), {
    replay_version: MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1,
    metric_derivation_version:
      MARKET_CONTEXT_DIAGNOSTIC_METRIC_DERIVATION_V1,
    schedule_version: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1,
    normalized_dataset_digest:
      EXPECTED_NORMALIZED_DATASET_DIGEST,
    normalized_output_tree_digest: EXPECTED_OUTPUT_TREE_DIGEST,
    markers: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_MARKERS,
    diagnostics: aggregate,
    regime_transitions:
      core.diagnostics.classification_transition_matrix,
    v1_v2_matrix: core.diagnostics.version_comparison_matrix,
    core_replay_diagnostics: core.diagnostics,
  });
  writeCanonicalJson(
    join(outputRoot, "inactive-bridge-export.json"),
    core.bridge_export,
  );
  const nonManifestInventory = treeInventory(outputRoot);
  const replayDatasetDigest = diagnosticReplaySha256V1(
    nonManifestInventory,
  );
  const manifest = {
    manifest_version:
      "market_context_real_diagnostic_replay_manifest_v1",
    replay_version: MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1,
    replay_contract_version: core.replay_contract_version,
    metric_derivation_version:
      MARKET_CONTEXT_DIAGNOSTIC_METRIC_DERIVATION_V1,
    schedule_version: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1,
    markers: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_MARKERS,
    normalized_input: {
      dataset_digest: EXPECTED_NORMALIZED_DATASET_DIGEST,
      output_tree_digest: EXPECTED_OUTPUT_TREE_DIGEST,
      lineage_digest: EXPECTED_LINEAGE_DIGEST,
      manifest_digest: EXPECTED_MANIFEST_DIGEST,
      raw_root: EXPECTED_RAW_ROOT,
      normalized_artifact_count: EXPECTED_ARTIFACT_COUNT,
    },
    replay_input_dataset_digest: core.replay_identity.dataset_digest,
    replay_canonical_input_digest:
      core.reproducibility.canonical_input_digest,
    replay_core_evidence_digest:
      core.reproducibility.replay_evidence_digest,
    replay_dataset_digest: replayDatasetDigest,
    decision_count: decisions.length,
    session_count: dataset.sessions.length,
    artifact_inventory_excluding_manifest: nonManifestInventory,
    point_in_time_safety: {
      passed: true,
      future_input_points_passed_to_core: 0,
      provider_timestamp_after_decision_count: 0,
      record_finalization_violation_count: 0,
      current_full_day_aggregation_use_count: 0,
    },
    claims: {
      performance_claims_computed: false,
      model_training_performed: false,
      canonical_binding_ready: false,
      live_ranking_effect: false,
    },
  };
  const manifestArtifact = writeCanonicalJson(
    join(outputRoot, "replay-manifest.json"),
    manifest,
  );
  const completeInventory = treeInventory(outputRoot);
  const outputTreeDigest = diagnosticReplaySha256V1(
    completeInventory,
  );
  return {
    replay_version: MARKET_CONTEXT_DIAGNOSTIC_REAL_REPLAY_V1,
    schedule_version: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_SCHEDULE_V1,
    decision_count: decisions.length,
    session_count: dataset.sessions.length,
    artifact_count: completeInventory.length,
    total_output_bytes: completeInventory.reduce(
      (sum, item) => sum + item.size_bytes,
      0,
    ),
    replay_dataset_digest: replayDatasetDigest,
    replay_output_tree_digest: outputTreeDigest,
    replay_manifest_sha256: manifestArtifact.sha256,
    replay_input_dataset_digest: core.replay_identity.dataset_digest,
    replay_canonical_input_digest:
      core.reproducibility.canonical_input_digest,
    replay_core_evidence_digest:
      core.reproducibility.replay_evidence_digest,
    aggregate,
    markers: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_MARKERS,
    point_in_time_safety_passed: true,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  };
}

function parseArguments() {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const key = process.argv[index];
    const value = process.argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error("diagnostic_replay_invalid_cli_arguments");
    }
    values.set(key.slice(2), value);
  }
  function required(key: string) {
    const value = values.get(key);
    if (!value) throw new Error(`diagnostic_replay_missing_argument:${key}`);
    return value;
  }
  const inputOrder = required("input-order");
  if (inputOrder !== "canonical" && inputOrder !== "reverse") {
    throw new Error("diagnostic_replay_invalid_input_order");
  }
  return {
    repo: required("repo"),
    inputRoot: required("input-root"),
    outputRoot: required("output-root"),
    allowedOutputRoot: required("allowed-output-root"),
    resultPath: required("result-path"),
    inputOrder,
  } as const;
}

function main() {
  try {
    const args = parseArguments();
    const result = runDiagnosticReplay(
      args.repo,
      args.inputRoot,
      args.outputRoot,
      args.allowedOutputRoot,
      args.inputOrder,
    );
    mkdirPrivate(resolve(args.resultPath, ".."));
    writeCanonicalJson(args.resultPath, {
      status: "completed",
      result,
    });
    process.stdout.write(
      `${JSON.stringify({
        status: "completed",
        decision_count: result.decision_count,
        replay_dataset_digest: result.replay_dataset_digest,
        replay_output_tree_digest: result.replay_output_tree_digest,
      })}\n`,
    );
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({
        status: "rejected",
        error_type:
          error instanceof Error ? error.name : "UnknownError",
        error_code:
          error instanceof Error ? error.message : String(error),
      })}\n`,
    );
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
