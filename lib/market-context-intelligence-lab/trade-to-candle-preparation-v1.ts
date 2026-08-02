import { createHash } from "node:crypto";

import { requireMarketContextExplicitInstant } from "./explicit-instant-v1";

export const MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION =
  "market_context_historical_trade_to_candle_preparation_v1" as const;

export const MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION =
  "market_context_historical_trade_to_candle_policy_2026_07_27_v1" as const;

export const MARKET_CONTEXT_TRADE_WATERMARK_POLICY_VERSION =
  "market_context_historical_trade_watermark_2s_v1" as const;

export const MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_VERSION =
  "market_context_historical_trade_eligibility_strict_v1" as const;

export const MARKET_CONTEXT_TRADE_SESSION_POLICY_VERSION =
  "market_context_xnys_explicit_session_calendar_v1" as const;

export const MARKET_CONTEXT_TRADE_CANONICALIZATION_VERSION =
  "market_context_historical_trade_canonical_json_v1" as const;

export const MARKET_CONTEXT_SECTOR_ETF_BREADTH_VERSION =
  "market_context_sector_etf_breadth_v1" as const;

export const MARKET_CONTEXT_TRADE_MAX_LATENESS_MS = 2_000 as const;

export const MARKET_CONTEXT_SECTOR_ETF_SYMBOLS = [
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

const FLAG_LAST = 1 << 7;
const FLAG_TOP_OF_BOOK = 1 << 6;
const FLAG_SNAPSHOT = 1 << 5;
const FLAG_MARKET_BY_PRICE = 1 << 4;
const FLAG_BAD_RECEIVE_TIMESTAMP = 1 << 3;
const FLAG_MAYBE_BAD_BOOK = 1 << 2;
const FLAG_PUBLISHER_SPECIFIC = 1 << 1;
const FLAG_RESERVED_SAFE_TO_IGNORE = 1;

const allowedFlagMask = FLAG_LAST | FLAG_RESERVED_SAFE_TO_IGNORE;
const rejectedDataQualityFlagMask =
  FLAG_BAD_RECEIVE_TIMESTAMP | FLAG_MAYBE_BAD_BOOK;
const unsupportedFlagMask =
  FLAG_TOP_OF_BOOK |
  FLAG_SNAPSHOT |
  FLAG_MARKET_BY_PRICE |
  FLAG_PUBLISHER_SPECIFIC;
const oneMinuteMs = 60_000;
const sha256Pattern = /^[0-9a-f]{64}$/;

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type MarketContextTradeRawPayloadV1 = {
  provider: string;
  dataset_id: string;
  dataset_version: string;
  schema: "trades";
  schema_version: string;
  symbol: string;
  event_timestamp: string;
  receive_timestamp: string;
  price: number;
  size: number;
  sequence: number;
  tie_break_id: string;
  source_position: number;
  action: string;
  flags: number;
  conditions: string[];
  raw_record_id: string;
};

export type MarketContextTradeRecordV1 =
  MarketContextTradeRawPayloadV1 & {
    raw_record_sha256: string;
  };

export type MarketContextTradeSessionV1 = {
  session_id: string;
  session_date: string;
  session_type: "regular" | "half_day";
  exchange_timezone: "America/New_York";
  open_timestamp: string;
  close_timestamp: string;
};

export type MarketContextTradePreparationManifestV1 = {
  contract_version:
    typeof MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION;
  preparation_policy_version:
    typeof MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION;
  dataset: {
    provider: string;
    dataset_id: string;
    dataset_version: string;
    schema: "trades";
    schema_version: string;
  };
  symbols: string[];
  preparation_as_of_timestamp: string;
  watermark: {
    policy_version:
      typeof MARKET_CONTEXT_TRADE_WATERMARK_POLICY_VERSION;
    max_lateness_ms: typeof MARKET_CONTEXT_TRADE_MAX_LATENESS_MS;
    late_trade_policy: "exclude_and_count";
    unfinalized_bucket_policy: "omit_and_report_gap";
  };
  eligibility: {
    policy_version:
      typeof MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_VERSION;
    required_action: "T";
    allowed_flags_mask: number;
    rejected_data_quality_flags_mask: number;
    unsupported_flags_mask: number;
    conditions_policy: "empty_only_fail_closed";
    invalid_numeric_policy: "reject_dataset";
    duplicate_policy: "reject_dataset";
    unsupported_action_policy: "reject_dataset";
  };
  session_calendar: {
    policy_version:
      typeof MARKET_CONTEXT_TRADE_SESSION_POLICY_VERSION;
    calendar_version: string;
    exchange_timezone: "America/New_York";
    sessions: MarketContextTradeSessionV1[];
    outside_session_policy: "exclude_and_count";
    missing_minute_policy: "preserve_gap_no_forward_fill";
  };
  corporate_actions: {
    policy_version: string;
    adjustment_state: "raw" | "split_adjusted" | "total_return_adjusted";
    split_policy: string;
    dividend_policy: string;
    point_in_time_attested: boolean;
  };
  immutable_raw_records_digest: string;
};

export type MarketContextPreparedCandleV1 = {
  contract_version:
    typeof MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION;
  preparation_policy_version:
    typeof MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION;
  provider: string;
  dataset_id: string;
  dataset_version: string;
  schema_version: string;
  symbol: string;
  session_id: string;
  session_date: string;
  session_type: "regular" | "half_day";
  interval: "1min";
  bucket_start_timestamp: string;
  bucket_end_timestamp: string;
  watermark_timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  first_event_timestamp: string;
  last_event_timestamp: string;
  first_receive_timestamp: string;
  last_receive_timestamp: string;
  provider_source_timestamp: string;
  received_timestamp: string;
  eligible_trade_count: number;
  excluded_trade_count: number;
  excluded_reason_codes: string[];
  adjustment_state:
    MarketContextTradePreparationManifestV1["corporate_actions"]["adjustment_state"];
  source_record_digest: string;
  lineage: Array<{
    raw_record_id: string;
    raw_record_sha256: string;
    source_position: number;
    sequence: number;
    tie_break_id: string;
  }>;
};

export type MarketContextTradeGapV1 = {
  symbol: string;
  session_id: string;
  session_date: string;
  bucket_start_timestamp: string;
  bucket_end_timestamp: string;
  reason_code:
    | "missing_minute_no_eligible_trade"
    | "bucket_not_finalized_as_of_cutoff";
  forward_filled: false;
};

export type MarketContextTradePreparationDiagnosticsV1 = {
  records_received: number;
  records_eligible: number;
  records_excluded: number;
  excluded_by_reason: Array<{
    reason_code: string;
    count: number;
  }>;
  duplicate_records: number;
  out_of_order_records: number;
  late_receive_records: number;
  outside_session_records: number;
  unsupported_action_records: number;
  unsupported_condition_records: number;
  rejected_flag_records: number;
  invalid_numeric_records: number;
  future_event_records: number;
  future_receive_records: number;
  tampered_raw_records: number;
  candles_emitted: number;
  gaps_preserved: number;
  unfinalized_buckets: number;
};

type PreparedTrade = MarketContextTradeRecordV1 & {
  eventCanonical: string;
  eventMs: number;
  receiveCanonical: string;
  receiveMs: number;
  session: MarketContextTradeSessionV1;
  sessionOpenMs: number;
  sessionCloseMs: number;
  bucketStartMs: number;
  bucketEndMs: number;
  watermarkMs: number;
};

export type MarketContextTradePreparationSuccessV1 = {
  status: "prepared";
  contract_version:
    typeof MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION;
  policy_versions: {
    preparation:
      typeof MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION;
    watermark:
      typeof MARKET_CONTEXT_TRADE_WATERMARK_POLICY_VERSION;
    eligibility:
      typeof MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_VERSION;
    session:
      typeof MARKET_CONTEXT_TRADE_SESSION_POLICY_VERSION;
    canonicalization:
      typeof MARKET_CONTEXT_TRADE_CANONICALIZATION_VERSION;
  };
  preparation_as_of_timestamp: string;
  candles: MarketContextPreparedCandleV1[];
  gaps: MarketContextTradeGapV1[];
  diagnostics: MarketContextTradePreparationDiagnosticsV1;
  digests: {
    immutable_raw_records_digest: string;
    immutable_normalized_candles_digest: string;
  };
  raw_to_candle_lineage: Array<{
    candle_identity: string;
    source_record_digest: string;
    raw_record_ids: string[];
  }>;
  raw_record_dispositions: Array<{
    raw_record_id: string;
    raw_record_sha256: string;
    source_position: number;
    disposition: "included_in_candle" | "excluded";
    candle_identity: string | null;
    reason_codes: string[];
  }>;
  input_immutable: true;
  shadow_only: true;
  live_ranking_effect: false;
  replay_output_created: false;
  performance_metrics_computed: false;
  external_activity: {
    provider_traffic: false;
    internet_download: false;
    database_access: false;
    persistence: false;
  };
};

export type MarketContextTradePreparationFailureV1 = {
  status: "rejected";
  contract_version:
    typeof MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION;
  error_codes: string[];
  diagnostics: MarketContextTradePreparationDiagnosticsV1;
  raw_digest_verified: boolean;
  candles: [];
  gaps: [];
  input_immutable: true;
  shadow_only: true;
  live_ranking_effect: false;
  replay_output_created: false;
  performance_metrics_computed: false;
  external_activity: {
    provider_traffic: false;
    internet_download: false;
    database_access: false;
    persistence: false;
  };
};

export type MarketContextTradePreparationResultV1 =
  | MarketContextTradePreparationSuccessV1
  | MarketContextTradePreparationFailureV1;

export type MarketContextSectorEtfBreadthInputV1 = {
  timestamp: string;
  source_candles_digest: string;
  sectors: Array<{
    symbol: (typeof MARKET_CONTEXT_SECTOR_ETF_SYMBOLS)[number];
    current_close: number;
    previous_close: number;
    short_average: number;
    candle_digest: string;
  }>;
};

export type MarketContextSectorEtfBreadthResultV1 =
  | {
      status: "measured";
      version: typeof MARKET_CONTEXT_SECTOR_ETF_BREADTH_VERSION;
      timestamp: string;
      breadth_identity: "declared_eleven_sector_etf_participation";
      expected_constituents: 11;
      observed_constituents: 11;
      coverage: 1;
      advancing_fraction: number;
      above_short_average_fraction: number;
      not_full_market_breadth: true;
      reason_codes: [
        "SECTOR_ETF_BREADTH_ONLY",
        "NOT_FULL_MARKET_BREADTH",
      ];
      source_candles_digest: string;
      normalized_digest: string;
    }
  | {
      status: "rejected";
      version: typeof MARKET_CONTEXT_SECTOR_ETF_BREADTH_VERSION;
      error_codes: string[];
      not_full_market_breadth: true;
    };

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJsonValue(value: unknown): JsonValue {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error(
      "market_context_trade_to_candle_non_finite_json_value",
    );
  }
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalJsonValue);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, child]) => [key, canonicalJsonValue(child)]),
    );
  }
  throw new Error("market_context_trade_to_candle_non_json_value");
}

export function stableMarketContextTradePreparationJsonV1(
  value: unknown,
) {
  return JSON.stringify(canonicalJsonValue(value));
}

export function computeMarketContextTradeRecordDigestV1(
  payload: MarketContextTradeRawPayloadV1,
) {
  return sha256(stableMarketContextTradePreparationJsonV1(payload));
}

export function computeMarketContextTradeRawRecordsDigestV1(
  records: MarketContextTradeRecordV1[],
) {
  return sha256(
    stableMarketContextTradePreparationJsonV1(
      records
        .map((record) => ({
          raw_record_id: record.raw_record_id,
          raw_record_sha256: record.raw_record_sha256,
          source_position: record.source_position,
        }))
        .sort(
          (first, second) =>
            first.source_position - second.source_position ||
            first.raw_record_id.localeCompare(second.raw_record_id),
        ),
    ),
  );
}

export function computeMarketContextSectorEtfSourceDigestV1(
  sectors: MarketContextSectorEtfBreadthInputV1["sectors"],
) {
  return sha256(
    stableMarketContextTradePreparationJsonV1(
      sectors
        .map((sector) => ({
          symbol: sector.symbol,
          candle_digest: sector.candle_digest,
        }))
        .sort((first, second) =>
          first.symbol.localeCompare(second.symbol),
        ),
    ),
  );
}

function identifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
}

function symbol(value: unknown): value is string {
  return (
    identifier(value) &&
    /^[A-Z][A-Z0-9.+-]*$/.test(value)
  );
}

function explicitInstant(value: unknown) {
  try {
    return requireMarketContextExplicitInstant(
      value,
      "trade_to_candle_timestamp",
    );
  } catch {
    return null;
  }
}

function validDate(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function emptyDiagnostics(): MarketContextTradePreparationDiagnosticsV1 {
  return {
    records_received: 0,
    records_eligible: 0,
    records_excluded: 0,
    excluded_by_reason: [],
    duplicate_records: 0,
    out_of_order_records: 0,
    late_receive_records: 0,
    outside_session_records: 0,
    unsupported_action_records: 0,
    unsupported_condition_records: 0,
    rejected_flag_records: 0,
    invalid_numeric_records: 0,
    future_event_records: 0,
    future_receive_records: 0,
    tampered_raw_records: 0,
    candles_emitted: 0,
    gaps_preserved: 0,
    unfinalized_buckets: 0,
  };
}

const externalActivity = {
  provider_traffic: false,
  internet_download: false,
  database_access: false,
  persistence: false,
} as const;

function rejected(
  errors: Set<string>,
  diagnostics: MarketContextTradePreparationDiagnosticsV1,
  rawDigestVerified: boolean,
): MarketContextTradePreparationFailureV1 {
  return {
    status: "rejected",
    contract_version:
      MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION,
    error_codes: Array.from(errors).sort((first, second) =>
      first.localeCompare(second),
    ),
    diagnostics,
    raw_digest_verified: rawDigestVerified,
    candles: [],
    gaps: [],
    input_immutable: true,
    shadow_only: true,
    live_ranking_effect: false,
    replay_output_created: false,
    performance_metrics_computed: false,
    external_activity: externalActivity,
  };
}

type ParsedSession = {
  value: MarketContextTradeSessionV1;
  openMs: number;
  closeMs: number;
};

function validateManifest(
  manifest: MarketContextTradePreparationManifestV1,
  errors: Set<string>,
) {
  if (
    manifest.contract_version !==
      MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION ||
    manifest.preparation_policy_version !==
      MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION
  ) {
    errors.add("preparation_contract_or_policy_version_invalid");
  }
  if (
    !identifier(manifest.dataset?.provider) ||
    !identifier(manifest.dataset?.dataset_id) ||
    !identifier(manifest.dataset?.dataset_version) ||
    manifest.dataset?.schema !== "trades" ||
    !identifier(manifest.dataset?.schema_version)
  ) {
    errors.add("dataset_identity_invalid");
  }
  if (
    !Array.isArray(manifest.symbols) ||
    manifest.symbols.length === 0 ||
    manifest.symbols.some((value) => !symbol(value)) ||
    new Set(manifest.symbols).size !== manifest.symbols.length
  ) {
    errors.add("symbol_universe_invalid");
  }
  const asOf = explicitInstant(manifest.preparation_as_of_timestamp);
  if (!asOf) errors.add("preparation_as_of_timestamp_invalid");
  if (
    manifest.watermark?.policy_version !==
      MARKET_CONTEXT_TRADE_WATERMARK_POLICY_VERSION ||
    manifest.watermark?.max_lateness_ms !==
      MARKET_CONTEXT_TRADE_MAX_LATENESS_MS ||
    manifest.watermark?.late_trade_policy !== "exclude_and_count" ||
    manifest.watermark?.unfinalized_bucket_policy !==
      "omit_and_report_gap"
  ) {
    errors.add("watermark_policy_invalid");
  }
  if (
    manifest.eligibility?.policy_version !==
      MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_VERSION ||
    manifest.eligibility?.required_action !== "T" ||
    manifest.eligibility?.allowed_flags_mask !== allowedFlagMask ||
    manifest.eligibility?.rejected_data_quality_flags_mask !==
      rejectedDataQualityFlagMask ||
    manifest.eligibility?.unsupported_flags_mask !==
      unsupportedFlagMask ||
    manifest.eligibility?.conditions_policy !==
      "empty_only_fail_closed" ||
    manifest.eligibility?.invalid_numeric_policy !==
      "reject_dataset" ||
    manifest.eligibility?.duplicate_policy !== "reject_dataset" ||
    manifest.eligibility?.unsupported_action_policy !==
      "reject_dataset"
  ) {
    errors.add("eligibility_policy_invalid");
  }
  if (
    manifest.session_calendar?.policy_version !==
      MARKET_CONTEXT_TRADE_SESSION_POLICY_VERSION ||
    !identifier(manifest.session_calendar?.calendar_version) ||
    manifest.session_calendar?.exchange_timezone !==
      "America/New_York" ||
    manifest.session_calendar?.outside_session_policy !==
      "exclude_and_count" ||
    manifest.session_calendar?.missing_minute_policy !==
      "preserve_gap_no_forward_fill" ||
    !Array.isArray(manifest.session_calendar?.sessions) ||
    manifest.session_calendar.sessions.length === 0
  ) {
    errors.add("session_calendar_policy_invalid");
  }
  if (
    !identifier(manifest.corporate_actions?.policy_version) ||
    !identifier(manifest.corporate_actions?.split_policy) ||
    !identifier(manifest.corporate_actions?.dividend_policy) ||
    manifest.corporate_actions?.point_in_time_attested !== true ||
    !["raw", "split_adjusted", "total_return_adjusted"].includes(
      manifest.corporate_actions?.adjustment_state,
    )
  ) {
    errors.add("corporate_action_policy_invalid");
  }
  if (
    !sha256Pattern.test(manifest.immutable_raw_records_digest ?? "")
  ) {
    errors.add("immutable_raw_records_digest_invalid");
  }
  return asOf;
}

function parseSessions(
  manifest: MarketContextTradePreparationManifestV1,
  errors: Set<string>,
) {
  const parsed: ParsedSession[] = [];
  const ids = new Set<string>();
  for (const session of manifest.session_calendar?.sessions ?? []) {
    const open = explicitInstant(session.open_timestamp);
    const close = explicitInstant(session.close_timestamp);
    const valid =
      identifier(session.session_id) &&
      validDate(session.session_date) &&
      (session.session_type === "regular" ||
        session.session_type === "half_day") &&
      session.exchange_timezone === "America/New_York" &&
      open !== null &&
      close !== null &&
      open.epoch_milliseconds < close.epoch_milliseconds &&
      open.epoch_milliseconds % oneMinuteMs === 0 &&
      close.epoch_milliseconds % oneMinuteMs === 0 &&
      close.epoch_milliseconds - open.epoch_milliseconds <=
        24 * 60 * oneMinuteMs &&
      !ids.has(session.session_id);
    if (!valid || !open || !close) {
      errors.add("session_calendar_entry_invalid");
      continue;
    }
    ids.add(session.session_id);
    parsed.push({
      value: {
        ...session,
        open_timestamp: open.canonical_timestamp,
        close_timestamp: close.canonical_timestamp,
      },
      openMs: open.epoch_milliseconds,
      closeMs: close.epoch_milliseconds,
    });
  }
  parsed.sort(
    (first, second) =>
      first.openMs - second.openMs ||
      first.value.session_id.localeCompare(second.value.session_id),
  );
  for (let index = 1; index < parsed.length; index += 1) {
    if (parsed[index]!.openMs < parsed[index - 1]!.closeMs) {
      errors.add("session_calendar_overlap");
    }
  }
  return parsed;
}

function rawPayload(record: MarketContextTradeRecordV1) {
  return {
    provider: record.provider,
    dataset_id: record.dataset_id,
    dataset_version: record.dataset_version,
    schema: record.schema,
    schema_version: record.schema_version,
    symbol: record.symbol,
    event_timestamp: record.event_timestamp,
    receive_timestamp: record.receive_timestamp,
    price: record.price,
    size: record.size,
    sequence: record.sequence,
    tie_break_id: record.tie_break_id,
    source_position: record.source_position,
    action: record.action,
    flags: record.flags,
    conditions: record.conditions,
    raw_record_id: record.raw_record_id,
  } satisfies MarketContextTradeRawPayloadV1;
}

function tradeIdentity(record: MarketContextTradeRecordV1) {
  return stableMarketContextTradePreparationJsonV1({
    provider: record.provider,
    dataset_id: record.dataset_id,
    dataset_version: record.dataset_version,
    schema: record.schema,
    schema_version: record.schema_version,
    symbol: record.symbol,
    event_timestamp: record.event_timestamp,
    receive_timestamp: record.receive_timestamp,
    price: record.price,
    size: record.size,
    sequence: record.sequence,
    tie_break_id: record.tie_break_id,
    action: record.action,
    flags: record.flags,
    conditions: record.conditions,
  });
}

function preparedTradeOrder(first: PreparedTrade, second: PreparedTrade) {
  return (
    first.eventMs - second.eventMs ||
    first.sequence - second.sequence ||
    first.tie_break_id.localeCompare(second.tie_break_id) ||
    first.raw_record_id.localeCompare(second.raw_record_id)
  );
}

function addExcludedReason(
  counts: Map<string, number>,
  reasonCode: string,
) {
  counts.set(reasonCode, (counts.get(reasonCode) ?? 0) + 1);
}

function candleIdentity(candle: MarketContextPreparedCandleV1) {
  return [
    candle.provider,
    candle.dataset_id,
    candle.symbol,
    candle.session_id,
    candle.bucket_start_timestamp,
  ].join(":");
}

export function prepareMarketContextTradesToCandlesV1(input: {
  manifest: MarketContextTradePreparationManifestV1;
  records: MarketContextTradeRecordV1[];
}): MarketContextTradePreparationResultV1 {
  const errors = new Set<string>();
  const diagnostics = emptyDiagnostics();
  const manifest = input.manifest;
  const records = Array.isArray(input.records) ? input.records : [];
  diagnostics.records_received = records.length;

  const asOf = validateManifest(manifest, errors);
  const sessions = parseSessions(manifest, errors);
  const computedRawDigest = computeMarketContextTradeRawRecordsDigestV1(
    records,
  );
  const rawDigestVerified =
    computedRawDigest === manifest.immutable_raw_records_digest;
  if (!rawDigestVerified) {
    errors.add("immutable_raw_records_digest_mismatch");
  }

  const rawIds = new Set<string>();
  const sourcePositions = new Set<number>();
  const economicIdentities = new Set<string>();
  const preparedCandidates: Array<
    Omit<PreparedTrade, "session" | "sessionOpenMs" | "sessionCloseMs" |
      "bucketStartMs" | "bucketEndMs" | "watermarkMs">
  > = [];

  for (const record of records) {
    const recordId = identifier(record.raw_record_id)
      ? record.raw_record_id
      : "invalid_record_identity";
    if (
      !identifier(record.raw_record_id) ||
      !identifier(record.tie_break_id) ||
      !symbol(record.symbol)
    ) {
      errors.add("record_identity_invalid");
    }
    if (
      record.provider !== manifest.dataset.provider ||
      record.dataset_id !== manifest.dataset.dataset_id ||
      record.dataset_version !== manifest.dataset.dataset_version ||
      record.schema !== manifest.dataset.schema ||
      record.schema_version !== manifest.dataset.schema_version ||
      !manifest.symbols.includes(record.symbol)
    ) {
      errors.add(`record_dataset_or_symbol_mismatch:${recordId}`);
    }
    if (rawIds.has(record.raw_record_id)) {
      diagnostics.duplicate_records += 1;
      errors.add("duplicate_raw_record_id");
    }
    rawIds.add(record.raw_record_id);
    if (
      !Number.isInteger(record.source_position) ||
      record.source_position < 0 ||
      sourcePositions.has(record.source_position)
    ) {
      if (sourcePositions.has(record.source_position)) {
        diagnostics.duplicate_records += 1;
      }
      errors.add("source_position_invalid_or_duplicate");
    }
    sourcePositions.add(record.source_position);

    let identity: string | null = null;
    try {
      identity = tradeIdentity(record);
    } catch {
      errors.add(`record_non_canonical_value:${recordId}`);
    }
    if (identity && economicIdentities.has(identity)) {
      diagnostics.duplicate_records += 1;
      errors.add("duplicate_trade_identity");
    }
    if (identity) economicIdentities.add(identity);

    let computedRecordDigest: string | null = null;
    try {
      computedRecordDigest =
        computeMarketContextTradeRecordDigestV1(rawPayload(record));
    } catch {
      errors.add(`record_non_canonical_value:${recordId}`);
    }
    if (
      !sha256Pattern.test(record.raw_record_sha256 ?? "") ||
      computedRecordDigest !== record.raw_record_sha256
    ) {
      diagnostics.tampered_raw_records += 1;
      errors.add(`raw_record_digest_mismatch:${recordId}`);
    }

    const event = explicitInstant(record.event_timestamp);
    const receive = explicitInstant(record.receive_timestamp);
    if (!event || !receive) {
      errors.add(`record_explicit_timestamp_invalid:${recordId}`);
      continue;
    }
    if (asOf && event.epoch_milliseconds > asOf.epoch_milliseconds) {
      diagnostics.future_event_records += 1;
      errors.add(`future_event_timestamp:${recordId}`);
    }
    if (asOf && receive.epoch_milliseconds > asOf.epoch_milliseconds) {
      diagnostics.future_receive_records += 1;
      errors.add(`future_receive_timestamp:${recordId}`);
    }
    if (
      typeof record.price !== "number" ||
      !Number.isFinite(record.price) ||
      record.price <= 0 ||
      !Number.isInteger(record.size) ||
      record.size <= 0 ||
      !Number.isSafeInteger(record.size)
    ) {
      diagnostics.invalid_numeric_records += 1;
      errors.add(`invalid_price_or_size:${recordId}`);
    }
    if (
      !Number.isInteger(record.sequence) ||
      record.sequence < 0 ||
      record.sequence > 0xffff_ffff
    ) {
      errors.add(`invalid_sequence:${recordId}`);
    }
    if (
      !Number.isInteger(record.flags) ||
      record.flags < 0 ||
      record.flags > 0xff
    ) {
      diagnostics.rejected_flag_records += 1;
      errors.add(`invalid_flags:${recordId}`);
    } else {
      const dataQualityFlags =
        record.flags & rejectedDataQualityFlagMask;
      const unsupportedFlags = record.flags & unsupportedFlagMask;
      const unknownFlags =
        record.flags &
        ~(allowedFlagMask |
          rejectedDataQualityFlagMask |
          unsupportedFlagMask);
      if (dataQualityFlags !== 0) {
        diagnostics.rejected_flag_records += 1;
        errors.add(`rejected_data_quality_flags:${recordId}`);
      }
      if (unsupportedFlags !== 0 || unknownFlags !== 0) {
        diagnostics.rejected_flag_records += 1;
        errors.add(`unsupported_flags:${recordId}`);
      }
    }
    if (record.action !== "T") {
      diagnostics.unsupported_action_records += 1;
      errors.add(`unsupported_action:${recordId}`);
    }
    if (
      !Array.isArray(record.conditions) ||
      record.conditions.length > 0
    ) {
      diagnostics.unsupported_condition_records += 1;
      errors.add(`unsupported_trade_conditions:${recordId}`);
    }
    preparedCandidates.push({
      ...record,
      eventCanonical: event.canonical_timestamp,
      eventMs: event.epoch_milliseconds,
      receiveCanonical: receive.canonical_timestamp,
      receiveMs: receive.epoch_milliseconds,
    });
  }

  const providerOrder = [...preparedCandidates].sort(
    (first, second) =>
      first.source_position - second.source_position ||
      first.raw_record_id.localeCompare(second.raw_record_id),
  );
  for (let index = 1; index < providerOrder.length; index += 1) {
    const first = providerOrder[index - 1]!;
    const second = providerOrder[index]!;
    if (
      first.eventMs > second.eventMs ||
      (first.eventMs === second.eventMs &&
        (first.sequence > second.sequence ||
          (first.sequence === second.sequence &&
            first.tie_break_id.localeCompare(second.tie_break_id) > 0)))
    ) {
      diagnostics.out_of_order_records += 1;
    }
  }

  if (errors.size > 0 || !asOf) {
    return rejected(errors, diagnostics, rawDigestVerified);
  }

  const excludedCounts = new Map<string, number>();
  const excludedByBucket = new Map<string, Map<string, number>>();
  const excludedRecordReasons = new Map<string, string[]>();
  const eligible: PreparedTrade[] = [];
  const unfinalizedKeys = new Set<string>();

  for (const trade of preparedCandidates) {
    const parsedSession = sessions.find(
      (candidate) =>
        trade.eventMs >= candidate.openMs &&
        trade.eventMs < candidate.closeMs,
    );
    if (!parsedSession) {
      diagnostics.records_excluded += 1;
      diagnostics.outside_session_records += 1;
      addExcludedReason(excludedCounts, "outside_declared_session");
      excludedRecordReasons.set(trade.raw_record_id, [
        "outside_declared_session",
      ]);
      continue;
    }
    const bucketStartMs =
      Math.floor(trade.eventMs / oneMinuteMs) * oneMinuteMs;
    const bucketEndMs = bucketStartMs + oneMinuteMs;
    const watermarkMs =
      bucketEndMs + MARKET_CONTEXT_TRADE_MAX_LATENESS_MS;
    const bucketKey = [
      trade.symbol,
      parsedSession.value.session_id,
      bucketStartMs,
    ].join("|");
    if (watermarkMs > asOf.epoch_milliseconds) {
      diagnostics.records_excluded += 1;
      unfinalizedKeys.add(bucketKey);
      addExcludedReason(
        excludedCounts,
        "bucket_not_finalized_as_of_cutoff",
      );
      excludedRecordReasons.set(trade.raw_record_id, [
        "bucket_not_finalized_as_of_cutoff",
      ]);
      continue;
    }
    if (trade.receiveMs > watermarkMs) {
      diagnostics.records_excluded += 1;
      diagnostics.late_receive_records += 1;
      addExcludedReason(excludedCounts, "late_receive_after_watermark");
      const bucketReasons =
        excludedByBucket.get(bucketKey) ?? new Map<string, number>();
      addExcludedReason(
        bucketReasons,
        "late_receive_after_watermark",
      );
      excludedByBucket.set(bucketKey, bucketReasons);
      excludedRecordReasons.set(trade.raw_record_id, [
        "late_receive_after_watermark",
      ]);
      continue;
    }
    eligible.push({
      ...trade,
      session: parsedSession.value,
      sessionOpenMs: parsedSession.openMs,
      sessionCloseMs: parsedSession.closeMs,
      bucketStartMs,
      bucketEndMs,
      watermarkMs,
    });
  }

  diagnostics.unfinalized_buckets = unfinalizedKeys.size;
  eligible.sort(preparedTradeOrder);
  diagnostics.records_eligible = eligible.length;
  const groups = new Map<string, PreparedTrade[]>();
  for (const trade of eligible) {
    const key = [
      trade.symbol,
      trade.session.session_id,
      trade.bucketStartMs,
    ].join("|");
    const group = groups.get(key) ?? [];
    group.push(trade);
    groups.set(key, group);
  }

  const candles = Array.from(groups.entries()).map(([key, group]) => {
    group.sort(preparedTradeOrder);
    const first = group[0]!;
    const last = group[group.length - 1]!;
    const receiveOrdered = [...group].sort(
      (left, right) =>
        left.receiveMs - right.receiveMs ||
        preparedTradeOrder(left, right),
    );
    const bucketReasons = excludedByBucket.get(key) ??
      new Map<string, number>();
    const excludedReasonCodes = Array.from(bucketReasons.keys()).sort(
      (left, right) => left.localeCompare(right),
    );
    const excludedCount = Array.from(bucketReasons.values()).reduce(
      (total, value) => total + value,
      0,
    );
    const lineage = group.map((trade) => ({
      raw_record_id: trade.raw_record_id,
      raw_record_sha256: trade.raw_record_sha256,
      source_position: trade.source_position,
      sequence: trade.sequence,
      tie_break_id: trade.tie_break_id,
    }));
    const sourceRecordDigest = sha256(
      stableMarketContextTradePreparationJsonV1(lineage),
    );
    return {
      contract_version:
        MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION,
      preparation_policy_version:
        MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION,
      provider: manifest.dataset.provider,
      dataset_id: manifest.dataset.dataset_id,
      dataset_version: manifest.dataset.dataset_version,
      schema_version: manifest.dataset.schema_version,
      symbol: first.symbol,
      session_id: first.session.session_id,
      session_date: first.session.session_date,
      session_type: first.session.session_type,
      interval: "1min" as const,
      bucket_start_timestamp: new Date(
        first.bucketStartMs,
      ).toISOString(),
      bucket_end_timestamp: new Date(first.bucketEndMs).toISOString(),
      watermark_timestamp: new Date(first.watermarkMs).toISOString(),
      open: first.price,
      high: Math.max(...group.map((trade) => trade.price)),
      low: Math.min(...group.map((trade) => trade.price)),
      close: last.price,
      volume: group.reduce((total, trade) => total + trade.size, 0),
      first_event_timestamp: first.eventCanonical,
      last_event_timestamp: last.eventCanonical,
      first_receive_timestamp: receiveOrdered[0]!.receiveCanonical,
      last_receive_timestamp:
        receiveOrdered[receiveOrdered.length - 1]!.receiveCanonical,
      provider_source_timestamp: last.eventCanonical,
      received_timestamp:
        receiveOrdered[receiveOrdered.length - 1]!.receiveCanonical,
      eligible_trade_count: group.length,
      excluded_trade_count: excludedCount,
      excluded_reason_codes: excludedReasonCodes,
      adjustment_state: manifest.corporate_actions.adjustment_state,
      source_record_digest: sourceRecordDigest,
      lineage,
    } satisfies MarketContextPreparedCandleV1;
  });
  candles.sort(
    (first, second) =>
      first.bucket_start_timestamp.localeCompare(
        second.bucket_start_timestamp,
      ) ||
      first.symbol.localeCompare(second.symbol) ||
      first.session_id.localeCompare(second.session_id),
  );

  const candleKeys = new Set(
    candles.map((candle) =>
      [
        candle.symbol,
        candle.session_id,
        Date.parse(candle.bucket_start_timestamp),
      ].join("|"),
    ),
  );
  const gaps: MarketContextTradeGapV1[] = [];
  const symbols = [...manifest.symbols].sort((first, second) =>
    first.localeCompare(second),
  );
  for (const parsedSession of sessions) {
    for (const expectedSymbol of symbols) {
      for (
        let bucketStartMs = parsedSession.openMs;
        bucketStartMs < parsedSession.closeMs;
        bucketStartMs += oneMinuteMs
      ) {
        const key = [
          expectedSymbol,
          parsedSession.value.session_id,
          bucketStartMs,
        ].join("|");
        if (candleKeys.has(key)) continue;
        gaps.push({
          symbol: expectedSymbol,
          session_id: parsedSession.value.session_id,
          session_date: parsedSession.value.session_date,
          bucket_start_timestamp: new Date(bucketStartMs).toISOString(),
          bucket_end_timestamp: new Date(
            bucketStartMs + oneMinuteMs,
          ).toISOString(),
          reason_code: unfinalizedKeys.has(key)
            ? "bucket_not_finalized_as_of_cutoff"
            : "missing_minute_no_eligible_trade",
          forward_filled: false,
        });
      }
    }
  }
  gaps.sort(
    (first, second) =>
      first.bucket_start_timestamp.localeCompare(
        second.bucket_start_timestamp,
      ) ||
      first.symbol.localeCompare(second.symbol) ||
      first.session_id.localeCompare(second.session_id),
  );

  diagnostics.candles_emitted = candles.length;
  diagnostics.gaps_preserved = gaps.length;
  diagnostics.excluded_by_reason = Array.from(excludedCounts.entries())
    .map(([reason_code, count]) => ({ reason_code, count }))
    .sort((first, second) =>
      first.reason_code.localeCompare(second.reason_code),
    );

  const rawToCandleLineage = candles.map((candle) => ({
    candle_identity: candleIdentity(candle),
    source_record_digest: candle.source_record_digest,
    raw_record_ids: candle.lineage.map(
      (record) => record.raw_record_id,
    ),
  }));
  const candleByRawRecordId = new Map<string, string>();
  for (const candle of candles) {
    const identity = candleIdentity(candle);
    for (const record of candle.lineage) {
      candleByRawRecordId.set(record.raw_record_id, identity);
    }
  }
  const rawRecordDispositions = records
    .map((record) => {
      const identity = candleByRawRecordId.get(record.raw_record_id);
      const reasons = excludedRecordReasons.get(record.raw_record_id) ?? [];
      return {
        raw_record_id: record.raw_record_id,
        raw_record_sha256: record.raw_record_sha256,
        source_position: record.source_position,
        disposition: identity
          ? ("included_in_candle" as const)
          : ("excluded" as const),
        candle_identity: identity ?? null,
        reason_codes: [...reasons].sort((first, second) =>
          first.localeCompare(second),
        ),
      };
    })
    .sort(
      (first, second) =>
        first.source_position - second.source_position ||
        first.raw_record_id.localeCompare(second.raw_record_id),
    );
  const normalizedCandlesDigest = sha256(
    stableMarketContextTradePreparationJsonV1({
      candles,
      gaps,
      raw_record_dispositions: rawRecordDispositions,
      preparation_policy_version:
        MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION,
      watermark_policy_version:
        MARKET_CONTEXT_TRADE_WATERMARK_POLICY_VERSION,
      session_calendar_version:
        manifest.session_calendar.calendar_version,
      corporate_action_policy_version:
        manifest.corporate_actions.policy_version,
    }),
  );

  return {
    status: "prepared",
    contract_version:
      MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_VERSION,
    policy_versions: {
      preparation: MARKET_CONTEXT_TRADE_TO_CANDLE_POLICY_VERSION,
      watermark: MARKET_CONTEXT_TRADE_WATERMARK_POLICY_VERSION,
      eligibility: MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_VERSION,
      session: MARKET_CONTEXT_TRADE_SESSION_POLICY_VERSION,
      canonicalization:
        MARKET_CONTEXT_TRADE_CANONICALIZATION_VERSION,
    },
    preparation_as_of_timestamp: asOf.canonical_timestamp,
    candles,
    gaps,
    diagnostics,
    digests: {
      immutable_raw_records_digest: computedRawDigest,
      immutable_normalized_candles_digest: normalizedCandlesDigest,
    },
    raw_to_candle_lineage: rawToCandleLineage,
    raw_record_dispositions: rawRecordDispositions,
    input_immutable: true,
    shadow_only: true,
    live_ranking_effect: false,
    replay_output_created: false,
    performance_metrics_computed: false,
    external_activity: externalActivity,
  };
}

function roundFraction(value: number) {
  return Number(value.toFixed(6));
}

export function deriveMarketContextSectorEtfBreadthV1(
  input: MarketContextSectorEtfBreadthInputV1,
): MarketContextSectorEtfBreadthResultV1 {
  const errors = new Set<string>();
  const timestamp = explicitInstant(input.timestamp);
  if (!timestamp) errors.add("breadth_timestamp_invalid");
  if (
    !Array.isArray(input.sectors) ||
    input.sectors.length !== MARKET_CONTEXT_SECTOR_ETF_SYMBOLS.length
  ) {
    errors.add("sector_universe_incomplete");
  }
  const expected = new Set<string>(MARKET_CONTEXT_SECTOR_ETF_SYMBOLS);
  const observed = new Set<string>();
  for (const sector of input.sectors ?? []) {
    if (!expected.has(sector.symbol) || observed.has(sector.symbol)) {
      errors.add("sector_universe_invalid_or_duplicate");
    }
    observed.add(sector.symbol);
    if (
      !Number.isFinite(sector.current_close) ||
      sector.current_close <= 0 ||
      !Number.isFinite(sector.previous_close) ||
      sector.previous_close <= 0 ||
      !Number.isFinite(sector.short_average) ||
      sector.short_average <= 0 ||
      !sha256Pattern.test(sector.candle_digest)
    ) {
      errors.add("sector_breadth_numeric_or_digest_invalid");
    }
  }
  if (
    MARKET_CONTEXT_SECTOR_ETF_SYMBOLS.some(
      (sector) => !observed.has(sector),
    )
  ) {
    errors.add("sector_universe_incomplete");
  }
  const computedSourceDigest =
    computeMarketContextSectorEtfSourceDigestV1(input.sectors ?? []);
  if (
    !sha256Pattern.test(input.source_candles_digest ?? "") ||
    computedSourceDigest !== input.source_candles_digest
  ) {
    errors.add("sector_source_candles_digest_mismatch");
  }
  if (errors.size > 0 || !timestamp) {
    return {
      status: "rejected",
      version: MARKET_CONTEXT_SECTOR_ETF_BREADTH_VERSION,
      error_codes: Array.from(errors).sort((first, second) =>
        first.localeCompare(second),
      ),
      not_full_market_breadth: true,
    };
  }
  const sorted = [...input.sectors].sort((first, second) =>
    first.symbol.localeCompare(second.symbol),
  );
  const advancing = sorted.filter(
    (sector) => sector.current_close > sector.previous_close,
  ).length;
  const aboveShortAverage = sorted.filter(
    (sector) => sector.current_close > sector.short_average,
  ).length;
  const core = {
    version: MARKET_CONTEXT_SECTOR_ETF_BREADTH_VERSION,
    timestamp: timestamp.canonical_timestamp,
    breadth_identity:
      "declared_eleven_sector_etf_participation" as const,
    expected_constituents: 11 as const,
    observed_constituents: 11 as const,
    coverage: 1 as const,
    advancing_fraction: roundFraction(advancing / 11),
    above_short_average_fraction: roundFraction(
      aboveShortAverage / 11,
    ),
    not_full_market_breadth: true as const,
    reason_codes: [
      "SECTOR_ETF_BREADTH_ONLY",
      "NOT_FULL_MARKET_BREADTH",
    ] as [
      "SECTOR_ETF_BREADTH_ONLY",
      "NOT_FULL_MARKET_BREADTH",
    ],
    source_candles_digest: computedSourceDigest,
  };
  return {
    status: "measured",
    ...core,
    normalized_digest: sha256(
      stableMarketContextTradePreparationJsonV1(core),
    ),
  };
}

export const MARKET_CONTEXT_TRADE_OFFICIAL_SCHEMA_EVIDENCE_V1 = {
  evidence_version:
    "market_context_trade_official_schema_evidence_v1",
  provider: "Databento",
  reviewed_dataset: "EQUS.MINI",
  reviewed_schema: "trades",
  facts: {
    event_timestamp_field: "ts_event",
    receive_timestamp_field: "ts_recv",
    price_type: "int64_scaled_1e9",
    size_type: "uint32",
    sequence_type: "uint32",
    trades_action: "T",
    equs_mini_sequence_semantics: "always_zero",
    tie_break_identity_required_by_contract: true,
    flags_are_bit_field: true,
    bad_receive_timestamp_flag_rejected: true,
    maybe_bad_book_flag_rejected: true,
    publisher_specific_flag_fail_closed: true,
    sale_conditions_available_in_reviewed_schema: false,
  },
  official_urls: [
    "https://databento.com/docs/schemas-and-data-formats/trades",
    "https://databento.com/docs/standards-and-conventions/common-fields-enums-types",
    "https://databento.com/docs/venues-and-datasets/equs-mini",
  ],
  authenticated_provider_calls: 0,
} as const;
