import { createHash } from "node:crypto";

export const MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2 =
  "market_context_historical_trade_to_candle_preparation_v2" as const;
export const MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2 =
  "market_context_historical_trade_to_candle_policy_2026_07_27_v2" as const;
export const MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1 =
  "market_context_historical_trade_nanosecond_timestamp_v1" as const;
export const MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2 =
  "market_context_historical_trade_watermark_2s_nanosecond_v2" as const;
export const MARKET_CONTEXT_TRADE_TIEBREAK_POLICY_V2 =
  "market_context_historical_trade_global_unique_tiebreak_v2" as const;
export const MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_V2 =
  "market_context_historical_trade_eligibility_provider_bounds_v2" as const;
export const MARKET_CONTEXT_TRADE_SESSION_POLICY_V2 =
  "market_context_xnys_immutable_calendar_artifact_v2" as const;
export const MARKET_CONTEXT_TRADE_CANONICAL_JSON_V2 =
  "market_context_historical_trade_canonical_json_v2" as const;
export const MARKET_CONTEXT_SECTOR_ETF_BREADTH_V2 =
  "market_context_sector_etf_breadth_v2" as const;

export const MARKET_CONTEXT_TRADE_MAX_LATENESS_NS =
  "2000000000" as const;
export const MARKET_CONTEXT_TRADE_MAX_UINT32 = 4_294_967_295;
export const MARKET_CONTEXT_TRADE_MAX_INT64 =
  BigInt("9223372036854775807");
export const MARKET_CONTEXT_TRADE_MIN_INT64 =
  BigInt("-9223372036854775808");
const maxUint64 = BigInt("18446744073709551615");
export const MARKET_CONTEXT_TRADE_UNDEF_PRICE =
  MARKET_CONTEXT_TRADE_MAX_INT64;
export const MARKET_CONTEXT_TRADE_UNDEF_TIMESTAMP = maxUint64;
const nsPerMillisecond = BigInt("1000000");
const nsPerSecond = BigInt("1000000000");
const nsPerMinute = BigInt("60") * nsPerSecond;
const sha256Pattern = /^[0-9a-f]{64}$/;
const canonicalUnsignedInteger = /^(0|[1-9][0-9]*)$/;
const canonicalSignedInteger = /^(0|-?[1-9][0-9]*)$/;

export const MARKET_CONTEXT_SECTOR_ETF_SYMBOLS_V2 = [
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
const rejectedQualityFlagMask =
  FLAG_BAD_RECEIVE_TIMESTAMP | FLAG_MAYBE_BAD_BOOK;
const unsupportedFlagMask =
  FLAG_TOP_OF_BOOK |
  FLAG_SNAPSHOT |
  FLAG_MARKET_BY_PRICE |
  FLAG_PUBLISHER_SPECIFIC;

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type MarketContextTradeRawPayloadV2 = {
  provider: string;
  provider_product: string;
  provider_build: string;
  provider_revision: string;
  dataset_id: string;
  dataset_version: string;
  schema: "trades";
  schema_version: string;
  symbol: string;
  ts_event_unix_ns: string;
  ts_recv_unix_ns: string;
  price_scaled_1e9: string;
  size_uint32: number;
  sequence_uint32: number;
  tie_break_id: string;
  source_position: number;
  action: string;
  flags_uint8: number;
  conditions: string[];
  raw_record_id: string;
};

export type MarketContextTradeRecordV2 =
  MarketContextTradeRawPayloadV2 & {
    raw_record_sha256: string;
  };

export type MarketContextTradeSessionV2 = {
  session_id: string;
  session_date: string;
  session_type: "regular" | "half_day";
  exchange_timezone: "America/New_York";
  open_unix_ns: string;
  close_unix_ns: string;
};

export type MarketContextXnysCalendarArtifactV2 = {
  artifact_id: string;
  artifact_version: string;
  exchange: "XNYS";
  exchange_timezone: "America/New_York";
  sessions: MarketContextTradeSessionV2[];
  artifact_sha256: string;
};

export type MarketContextTradePreparationManifestV2 = {
  contract_version: typeof MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2;
  preparation_policy_version:
    typeof MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2;
  dataset: {
    provider: string;
    provider_product: string;
    provider_build: string;
    provider_revision: string;
    dataset_id: string;
    dataset_version: string;
    schema: "trades";
    schema_version: string;
  };
  symbols: string[];
  preparation_as_of_unix_ns: string;
  watermark: {
    policy_version: typeof MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2;
    max_lateness_ns: typeof MARKET_CONTEXT_TRADE_MAX_LATENESS_NS;
    evidence_status: "empirically_unvalidated";
    late_trade_policy: "exclude_and_count";
    unfinalized_bucket_policy: "pending_not_gap";
  };
  tiebreak: {
    policy_version: typeof MARKET_CONTEXT_TRADE_TIEBREAK_POLICY_V2;
    identity_scope: "global_dataset";
    uniqueness: "required";
    missing_or_conflicting_policy: "reject_dataset";
  };
  eligibility: {
    policy_version:
      typeof MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_V2;
    required_action: "T";
    allowed_flags_mask: number;
    rejected_data_quality_flags_mask: number;
    unsupported_flags_mask: number;
    conditions_policy: "empty_only_fail_closed";
    numeric_policy: "provider_bounds_fail_closed";
    duplicate_policy: "reject_dataset";
  };
  session_calendar: {
    policy_version: typeof MARKET_CONTEXT_TRADE_SESSION_POLICY_V2;
    artifact: MarketContextXnysCalendarArtifactV2;
    outside_session_policy: "exclude_and_count";
    finalized_missing_minute_policy: "preserve_gap_no_forward_fill";
    future_session_minute_policy: "omit_not_observable";
  };
  corporate_actions: {
    policy_version: string;
    adjustment_state: "raw" | "split_adjusted" | "total_return_adjusted";
    split_policy: string;
    dividend_policy: string;
    point_in_time_attested: true;
  };
  immutable_raw_records_digest: string;
};

export type MarketContextPreparedCandleV2 = {
  contract_version: typeof MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2;
  preparation_policy_version:
    typeof MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2;
  provider: string;
  provider_product: string;
  provider_build: string;
  provider_revision: string;
  dataset_id: string;
  dataset_version: string;
  schema_version: string;
  symbol: string;
  session_id: string;
  session_date: string;
  session_type: "regular" | "half_day";
  interval: "1min";
  bucket_start_unix_ns: string;
  bucket_end_unix_ns: string;
  watermark_unix_ns: string;
  bucket_start_iso_utc: string;
  bucket_end_iso_utc: string;
  open_scaled_1e9: string;
  high_scaled_1e9: string;
  low_scaled_1e9: string;
  close_scaled_1e9: string;
  volume_uint64: string;
  first_ts_event_unix_ns: string;
  last_ts_event_unix_ns: string;
  first_ts_recv_unix_ns: string;
  last_ts_recv_unix_ns: string;
  eligible_trade_count: number;
  excluded_trade_count: number;
  excluded_reason_codes: string[];
  adjustment_state:
    MarketContextTradePreparationManifestV2["corporate_actions"]["adjustment_state"];
  source_record_digest: string;
  lineage: Array<{
    raw_record_id: string;
    raw_record_sha256: string;
    source_position: number;
    sequence_uint32: number;
    tie_break_id: string;
    ts_event_unix_ns: string;
    ts_recv_unix_ns: string;
  }>;
};

export type MarketContextTradeGapV2 = {
  symbol: string;
  session_id: string;
  session_date: string;
  bucket_start_unix_ns: string;
  bucket_end_unix_ns: string;
  reason_code:
    | "missing_minute_no_eligible_trade"
    | "late_only_bucket_no_eligible_trade";
  observable_and_finalized: true;
  forward_filled: false;
};

export type MarketContextPendingBucketV2 = {
  symbol: string;
  session_id: string;
  bucket_start_unix_ns: string;
  bucket_end_unix_ns: string;
  watermark_unix_ns: string;
  reason_code: "bucket_not_finalized_as_of_cutoff";
  reported_as_historical_gap: false;
};

export type MarketContextTradeDiagnosticsV2 = {
  records_received: number;
  records_eligible: number;
  records_excluded: number;
  duplicate_records: number;
  tie_break_collisions: number;
  out_of_order_records: number;
  late_receive_records: number;
  outside_session_records: number;
  unsupported_records: number;
  invalid_records: number;
  future_event_records: number;
  future_receive_records: number;
  tampered_records: number;
  candles_emitted: number;
  finalized_gaps: number;
  pending_buckets: number;
  excluded_by_reason: Array<{ reason_code: string; count: number }>;
};

type SharedResult = {
  contract_version: typeof MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2;
  shadow_only: true;
  live_ranking_effect: false;
  replay_output_created: false;
  external_activity: {
    provider_traffic: false;
    internet_download: false;
    database_access: false;
    persistence: false;
  };
};

export type MarketContextTradePreparationSuccessV2 = SharedResult & {
  status: "prepared";
  policy_versions: {
    preparation: typeof MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2;
    timestamp: typeof MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1;
    watermark: typeof MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2;
    tiebreak: typeof MARKET_CONTEXT_TRADE_TIEBREAK_POLICY_V2;
    eligibility: typeof MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_V2;
    session: typeof MARKET_CONTEXT_TRADE_SESSION_POLICY_V2;
    canonicalization: typeof MARKET_CONTEXT_TRADE_CANONICAL_JSON_V2;
  };
  preparation_as_of_unix_ns: string;
  calendar_artifact: {
    artifact_id: string;
    artifact_version: string;
    artifact_sha256: string;
  };
  corporate_actions:
    MarketContextTradePreparationManifestV2["corporate_actions"];
  candles: MarketContextPreparedCandleV2[];
  gaps: MarketContextTradeGapV2[];
  pending_buckets: MarketContextPendingBucketV2[];
  diagnostics: MarketContextTradeDiagnosticsV2;
  raw_record_dispositions: Array<{
    raw_record_id: string;
    raw_record_sha256: string;
    source_position: number;
    disposition: "included_in_candle" | "excluded" | "pending";
    candle_identity: string | null;
    reason_codes: string[];
  }>;
  digests: {
    immutable_raw_records_digest: string;
    immutable_normalized_candles_digest: string;
  };
  input_immutable: true;
};

export type MarketContextTradePreparationFailureV2 = SharedResult & {
  status: "rejected";
  error_codes: string[];
  diagnostics: MarketContextTradeDiagnosticsV2;
  candles: [];
  gaps: [];
  pending_buckets: [];
  input_immutable: true;
};

export type MarketContextTradePreparationResultV2 =
  | MarketContextTradePreparationSuccessV2
  | MarketContextTradePreparationFailureV2;

export type MarketContextSectorEtfBreadthInputV2 = {
  timestamp_unix_ns: string;
  source_candles_digest: string;
  sectors: Array<{
    symbol: (typeof MARKET_CONTEXT_SECTOR_ETF_SYMBOLS_V2)[number];
    current_close_scaled_1e9: string;
    previous_close_scaled_1e9: string;
    short_average_scaled_1e9: string;
    candle_digest: string;
  }>;
};

export type MarketContextSectorEtfBreadthResultV2 =
  | {
      status: "measured";
      version: typeof MARKET_CONTEXT_SECTOR_ETF_BREADTH_V2;
      timestamp_unix_ns: string;
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
      version: typeof MARKET_CONTEXT_SECTOR_ETF_BREADTH_V2;
      error_codes: string[];
      not_full_market_breadth: true;
    };

type ParsedSession = {
  value: MarketContextTradeSessionV2;
  open: bigint;
  close: bigint;
};

type ParsedTrade = MarketContextTradeRecordV2 & {
  event: bigint;
  receive: bigint;
  price: bigint;
  session: ParsedSession;
  bucketStart: bigint;
  bucketEnd: bigint;
  watermark: bigint;
};

const externalActivity = {
  provider_traffic: false,
  internet_download: false,
  database_access: false,
  persistence: false,
} as const;

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJsonValue(value: unknown): JsonValue {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error("non_finite_json_value");
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
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalJsonValue(child)]),
    );
  }
  throw new Error("non_json_value");
}

export function stableMarketContextTradePreparationJsonV2(
  value: unknown,
) {
  return JSON.stringify(canonicalJsonValue(value));
}

function identifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
}

function symbol(value: unknown): value is string {
  return identifier(value) && /^[A-Z][A-Z0-9.+-]*$/.test(value);
}

function parseUint64Ns(value: unknown) {
  if (
    typeof value !== "string" ||
    !canonicalUnsignedInteger.test(value)
  ) {
    return null;
  }
  try {
    const parsed = BigInt(value);
    return parsed < MARKET_CONTEXT_TRADE_UNDEF_TIMESTAMP
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function parsePrice(value: unknown) {
  if (
    typeof value !== "string" ||
    !canonicalSignedInteger.test(value)
  ) {
    return null;
  }
  try {
    const parsed = BigInt(value);
    return parsed > BigInt(0) &&
        parsed < MARKET_CONTEXT_TRADE_UNDEF_PRICE
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function validUint32(value: unknown): value is number {
  return (
    Number.isInteger(value) &&
    Number(value) >= 0 &&
    Number(value) <= MARKET_CONTEXT_TRADE_MAX_UINT32
  );
}

export function formatMarketContextUnixNsAsIsoV2(value: bigint) {
  const milliseconds = value / nsPerMillisecond;
  const fraction = (value % nsPerSecond)
    .toString()
    .padStart(9, "0");
  const iso = new Date(Number(milliseconds)).toISOString();
  return iso.replace(/\.[0-9]{3}Z$/, `.${fraction}Z`);
}

function emptyDiagnostics(): MarketContextTradeDiagnosticsV2 {
  return {
    records_received: 0,
    records_eligible: 0,
    records_excluded: 0,
    duplicate_records: 0,
    tie_break_collisions: 0,
    out_of_order_records: 0,
    late_receive_records: 0,
    outside_session_records: 0,
    unsupported_records: 0,
    invalid_records: 0,
    future_event_records: 0,
    future_receive_records: 0,
    tampered_records: 0,
    candles_emitted: 0,
    finalized_gaps: 0,
    pending_buckets: 0,
    excluded_by_reason: [],
  };
}

function failure(
  errors: Set<string>,
  diagnostics: MarketContextTradeDiagnosticsV2,
): MarketContextTradePreparationFailureV2 {
  return {
    status: "rejected",
    contract_version: MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2,
    error_codes: [...errors].sort((left, right) =>
      left.localeCompare(right),
    ),
    diagnostics,
    candles: [],
    gaps: [],
    pending_buckets: [],
    input_immutable: true,
    shadow_only: true,
    live_ranking_effect: false,
    replay_output_created: false,
    external_activity: externalActivity,
  };
}

function rawPayload(
  record: MarketContextTradeRecordV2,
): MarketContextTradeRawPayloadV2 {
  return {
    provider: record.provider,
    provider_product: record.provider_product,
    provider_build: record.provider_build,
    provider_revision: record.provider_revision,
    dataset_id: record.dataset_id,
    dataset_version: record.dataset_version,
    schema: record.schema,
    schema_version: record.schema_version,
    symbol: record.symbol,
    ts_event_unix_ns: record.ts_event_unix_ns,
    ts_recv_unix_ns: record.ts_recv_unix_ns,
    price_scaled_1e9: record.price_scaled_1e9,
    size_uint32: record.size_uint32,
    sequence_uint32: record.sequence_uint32,
    tie_break_id: record.tie_break_id,
    source_position: record.source_position,
    action: record.action,
    flags_uint8: record.flags_uint8,
    conditions: record.conditions,
    raw_record_id: record.raw_record_id,
  };
}

export function computeMarketContextTradeRecordDigestV2(
  payload: MarketContextTradeRawPayloadV2,
) {
  return sha256(stableMarketContextTradePreparationJsonV2(payload));
}

export function computeMarketContextTradeRawRecordsDigestV2(
  records: MarketContextTradeRecordV2[],
) {
  return sha256(
    stableMarketContextTradePreparationJsonV2(
      records
        .map((record) => ({
          raw_record_id: record.raw_record_id,
          raw_record_sha256: record.raw_record_sha256,
          source_position: record.source_position,
        }))
        .sort(
          (left, right) =>
            left.source_position - right.source_position ||
            left.raw_record_id.localeCompare(right.raw_record_id),
        ),
    ),
  );
}

export function computeMarketContextXnysCalendarDigestV2(
  artifact: Omit<MarketContextXnysCalendarArtifactV2, "artifact_sha256">,
) {
  return sha256(stableMarketContextTradePreparationJsonV2(artifact));
}

export function computeMarketContextSectorSourceDigestV2(
  sectors: MarketContextSectorEtfBreadthInputV2["sectors"],
) {
  return sha256(
    stableMarketContextTradePreparationJsonV2(
      sectors
        .map((sector) => ({
          symbol: sector.symbol,
          candle_digest: sector.candle_digest,
        }))
        .sort((left, right) =>
          left.symbol.localeCompare(right.symbol),
        ),
    ),
  );
}

function validateManifest(
  manifest: MarketContextTradePreparationManifestV2,
  errors: Set<string>,
) {
  if (
    manifest?.contract_version !==
      MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2 ||
    manifest?.preparation_policy_version !==
      MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2
  ) {
    errors.add("contract_or_preparation_policy_invalid");
  }
  const dataset = manifest?.dataset;
  if (
    !identifier(dataset?.provider) ||
    !identifier(dataset?.provider_product) ||
    !identifier(dataset?.provider_build) ||
    !identifier(dataset?.provider_revision) ||
    !identifier(dataset?.dataset_id) ||
    !identifier(dataset?.dataset_version) ||
    dataset?.schema !== "trades" ||
    !identifier(dataset?.schema_version)
  ) {
    errors.add("dataset_provenance_invalid");
  }
  if (
    !Array.isArray(manifest?.symbols) ||
    manifest.symbols.length === 0 ||
    manifest.symbols.some((value) => !symbol(value)) ||
    new Set(manifest.symbols).size !== manifest.symbols.length
  ) {
    errors.add("symbol_universe_invalid");
  }
  const asOf = parseUint64Ns(manifest?.preparation_as_of_unix_ns);
  if (asOf === null) errors.add("preparation_as_of_invalid");
  if (
    manifest?.watermark?.policy_version !==
      MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2 ||
    manifest?.watermark?.max_lateness_ns !==
      MARKET_CONTEXT_TRADE_MAX_LATENESS_NS ||
    manifest?.watermark?.evidence_status !==
      "empirically_unvalidated" ||
    manifest?.watermark?.late_trade_policy !== "exclude_and_count" ||
    manifest?.watermark?.unfinalized_bucket_policy !==
      "pending_not_gap"
  ) {
    errors.add("watermark_policy_invalid");
  }
  if (
    manifest?.tiebreak?.policy_version !==
      MARKET_CONTEXT_TRADE_TIEBREAK_POLICY_V2 ||
    manifest?.tiebreak?.identity_scope !== "global_dataset" ||
    manifest?.tiebreak?.uniqueness !== "required" ||
    manifest?.tiebreak?.missing_or_conflicting_policy !==
      "reject_dataset"
  ) {
    errors.add("tiebreak_policy_invalid");
  }
  if (
    manifest?.eligibility?.policy_version !==
      MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_V2 ||
    manifest?.eligibility?.required_action !== "T" ||
    manifest?.eligibility?.allowed_flags_mask !== allowedFlagMask ||
    manifest?.eligibility?.rejected_data_quality_flags_mask !==
      rejectedQualityFlagMask ||
    manifest?.eligibility?.unsupported_flags_mask !==
      unsupportedFlagMask ||
    manifest?.eligibility?.conditions_policy !==
      "empty_only_fail_closed" ||
    manifest?.eligibility?.numeric_policy !==
      "provider_bounds_fail_closed" ||
    manifest?.eligibility?.duplicate_policy !== "reject_dataset"
  ) {
    errors.add("eligibility_policy_invalid");
  }
  const calendar = manifest?.session_calendar?.artifact;
  if (
    manifest?.session_calendar?.policy_version !==
      MARKET_CONTEXT_TRADE_SESSION_POLICY_V2 ||
    manifest?.session_calendar?.outside_session_policy !==
      "exclude_and_count" ||
    manifest?.session_calendar?.finalized_missing_minute_policy !==
      "preserve_gap_no_forward_fill" ||
    manifest?.session_calendar?.future_session_minute_policy !==
      "omit_not_observable" ||
    !identifier(calendar?.artifact_id) ||
    !identifier(calendar?.artifact_version) ||
    calendar?.exchange !== "XNYS" ||
    calendar?.exchange_timezone !== "America/New_York" ||
    !Array.isArray(calendar?.sessions) ||
    calendar.sessions.length === 0 ||
    !sha256Pattern.test(calendar?.artifact_sha256 ?? "")
  ) {
    errors.add("session_calendar_policy_invalid");
  } else {
    const unsigned = {
      artifact_id: calendar.artifact_id,
      artifact_version: calendar.artifact_version,
      exchange: calendar.exchange,
      exchange_timezone: calendar.exchange_timezone,
      sessions: calendar.sessions,
    };
    if (
      computeMarketContextXnysCalendarDigestV2(unsigned) !==
        calendar.artifact_sha256
    ) {
      errors.add("session_calendar_artifact_digest_mismatch");
    }
  }
  if (
    !identifier(manifest?.corporate_actions?.policy_version) ||
    !identifier(manifest?.corporate_actions?.split_policy) ||
    !identifier(manifest?.corporate_actions?.dividend_policy) ||
    manifest?.corporate_actions?.point_in_time_attested !== true ||
    !["raw", "split_adjusted", "total_return_adjusted"].includes(
      manifest?.corporate_actions?.adjustment_state,
    )
  ) {
    errors.add("corporate_action_policy_invalid");
  }
  if (
    !sha256Pattern.test(
      manifest?.immutable_raw_records_digest ?? "",
    )
  ) {
    errors.add("immutable_raw_records_digest_invalid");
  }
  return asOf;
}

function parseSessions(
  manifest: MarketContextTradePreparationManifestV2,
  errors: Set<string>,
) {
  const parsed: ParsedSession[] = [];
  const ids = new Set<string>();
  for (
    const session of manifest?.session_calendar?.artifact?.sessions ??
      []
  ) {
    const open = parseUint64Ns(session?.open_unix_ns);
    const close = parseUint64Ns(session?.close_unix_ns);
    const valid =
      identifier(session?.session_id) &&
      /^\d{4}-\d{2}-\d{2}$/.test(session?.session_date ?? "") &&
      (session?.session_type === "regular" ||
        session?.session_type === "half_day") &&
      session?.exchange_timezone === "America/New_York" &&
      open !== null &&
      close !== null &&
      open < close &&
      open % nsPerMinute === BigInt(0) &&
      close % nsPerMinute === BigInt(0) &&
      !ids.has(session.session_id);
    if (!valid || open === null || close === null) {
      errors.add("session_calendar_entry_invalid");
      continue;
    }
    ids.add(session.session_id);
    parsed.push({ value: session, open, close });
  }
  parsed.sort(
    (left, right) =>
      (left.open < right.open ? -1 : left.open > right.open ? 1 : 0) ||
      left.value.session_id.localeCompare(right.value.session_id),
  );
  for (let index = 1; index < parsed.length; index += 1) {
    if (parsed[index]!.open < parsed[index - 1]!.close) {
      errors.add("session_calendar_overlap");
    }
  }
  return parsed;
}

function tradeOrder(left: ParsedTrade, right: ParsedTrade) {
  if (left.event !== right.event) return left.event < right.event ? -1 : 1;
  if (left.sequence_uint32 !== right.sequence_uint32) {
    return left.sequence_uint32 - right.sequence_uint32;
  }
  const tie = left.tie_break_id.localeCompare(right.tie_break_id);
  if (tie !== 0) return tie;
  return left.raw_record_id.localeCompare(right.raw_record_id);
}

function addCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function candleIdentity(candle: MarketContextPreparedCandleV2) {
  return [
    candle.provider,
    candle.dataset_id,
    candle.symbol,
    candle.session_id,
    candle.bucket_start_unix_ns,
  ].join(":");
}

function prepareInternal(
  input: {
    manifest: MarketContextTradePreparationManifestV2;
    records: MarketContextTradeRecordV2[];
  },
): MarketContextTradePreparationResultV2 {
  const errors = new Set<string>();
  const diagnostics = emptyDiagnostics();
  if (
    !input ||
    typeof input !== "object" ||
    !input.manifest ||
    !Array.isArray(input.records)
  ) {
    errors.add("malformed_runtime_input");
    return failure(errors, diagnostics);
  }
  const { manifest, records } = input;
  diagnostics.records_received = records.length;
  const asOf = validateManifest(manifest, errors);
  const sessions = parseSessions(manifest, errors);

  let computedRawDigest = "";
  try {
    computedRawDigest =
      computeMarketContextTradeRawRecordsDigestV2(records);
  } catch {
    errors.add("malformed_runtime_input");
  }
  if (computedRawDigest !== manifest.immutable_raw_records_digest) {
    errors.add("immutable_raw_records_digest_mismatch");
  }

  const rawIds = new Set<string>();
  const sourcePositions = new Set<number>();
  const tieBreakIds = new Set<string>();
  const parsedCandidates: Array<
    Omit<
      ParsedTrade,
      "session" | "bucketStart" | "bucketEnd" | "watermark"
    >
  > = [];

  for (let index = 0; index < records.length; index += 1) {
    const candidate = records[index] as
      | MarketContextTradeRecordV2
      | undefined;
    if (!candidate || typeof candidate !== "object") {
      diagnostics.invalid_records += 1;
      errors.add(`malformed_record:${index}`);
      continue;
    }
    const id = identifier(candidate.raw_record_id)
      ? candidate.raw_record_id
      : `invalid_record_${index}`;
    if (
      !identifier(candidate.raw_record_id) ||
      !identifier(candidate.tie_break_id) ||
      !symbol(candidate.symbol)
    ) {
      diagnostics.invalid_records += 1;
      errors.add(`record_identity_invalid:${id}`);
    }
    if (rawIds.has(candidate.raw_record_id)) {
      diagnostics.duplicate_records += 1;
      errors.add("duplicate_raw_record_id");
    }
    rawIds.add(candidate.raw_record_id);
    if (
      !Number.isSafeInteger(candidate.source_position) ||
      candidate.source_position < 0 ||
      sourcePositions.has(candidate.source_position)
    ) {
      diagnostics.duplicate_records += 1;
      errors.add("source_position_invalid_or_duplicate");
    }
    sourcePositions.add(candidate.source_position);
    if (
      identifier(candidate.tie_break_id) &&
      tieBreakIds.has(candidate.tie_break_id)
    ) {
      diagnostics.tie_break_collisions += 1;
      errors.add(`tie_break_identity_reused:${candidate.tie_break_id}`);
    }
    if (identifier(candidate.tie_break_id)) {
      tieBreakIds.add(candidate.tie_break_id);
    }

    const dataset = manifest.dataset;
    if (
      candidate.provider !== dataset.provider ||
      candidate.provider_product !== dataset.provider_product ||
      candidate.provider_build !== dataset.provider_build ||
      candidate.provider_revision !== dataset.provider_revision ||
      candidate.dataset_id !== dataset.dataset_id ||
      candidate.dataset_version !== dataset.dataset_version ||
      candidate.schema !== dataset.schema ||
      candidate.schema_version !== dataset.schema_version ||
      !manifest.symbols.includes(candidate.symbol)
    ) {
      errors.add(`record_dataset_or_symbol_mismatch:${id}`);
    }

    let digest = "";
    try {
      digest = computeMarketContextTradeRecordDigestV2(
        rawPayload(candidate),
      );
    } catch {
      errors.add(`malformed_record:${id}`);
    }
    if (
      !sha256Pattern.test(candidate.raw_record_sha256 ?? "") ||
      candidate.raw_record_sha256 !== digest
    ) {
      diagnostics.tampered_records += 1;
      errors.add(`raw_record_digest_mismatch:${id}`);
    }

    const event = parseUint64Ns(candidate.ts_event_unix_ns);
    const receive = parseUint64Ns(candidate.ts_recv_unix_ns);
    const price = parsePrice(candidate.price_scaled_1e9);
    if (event === null || receive === null) {
      diagnostics.invalid_records += 1;
      errors.add(`nanosecond_timestamp_invalid:${id}`);
    }
    if (price === null) {
      diagnostics.invalid_records += 1;
      errors.add(`scaled_price_invalid:${id}`);
    }
    if (
      !validUint32(candidate.size_uint32) ||
      candidate.size_uint32 === 0
    ) {
      diagnostics.invalid_records += 1;
      errors.add(`size_uint32_invalid:${id}`);
    }
    if (!validUint32(candidate.sequence_uint32)) {
      diagnostics.invalid_records += 1;
      errors.add(`sequence_uint32_invalid:${id}`);
    }
    if (
      !validUint32(candidate.flags_uint8) ||
      candidate.flags_uint8 > 0xff
    ) {
      diagnostics.invalid_records += 1;
      errors.add(`flags_uint8_invalid:${id}`);
    } else {
      if (
        (candidate.flags_uint8 & rejectedQualityFlagMask) !== 0
      ) {
        diagnostics.unsupported_records += 1;
        errors.add(`rejected_data_quality_flags:${id}`);
      }
      if (
        (candidate.flags_uint8 & unsupportedFlagMask) !== 0 ||
        (candidate.flags_uint8 &
          ~(
            allowedFlagMask |
            rejectedQualityFlagMask |
            unsupportedFlagMask
          )) !==
          0
      ) {
        diagnostics.unsupported_records += 1;
        errors.add(`unsupported_flags:${id}`);
      }
    }
    if (candidate.action !== "T") {
      diagnostics.unsupported_records += 1;
      errors.add(`unsupported_action:${id}`);
    }
    if (
      !Array.isArray(candidate.conditions) ||
      candidate.conditions.length !== 0
    ) {
      diagnostics.unsupported_records += 1;
      errors.add(`unsupported_conditions:${id}`);
    }
    if (asOf !== null && event !== null && event > asOf) {
      diagnostics.future_event_records += 1;
      errors.add(`future_event_timestamp:${id}`);
    }
    if (asOf !== null && receive !== null && receive > asOf) {
      diagnostics.future_receive_records += 1;
      errors.add(`future_receive_timestamp:${id}`);
    }
    if (
      event !== null &&
      receive !== null &&
      price !== null &&
      validUint32(candidate.size_uint32) &&
      candidate.size_uint32 > 0 &&
      validUint32(candidate.sequence_uint32) &&
      identifier(candidate.tie_break_id)
    ) {
      parsedCandidates.push({
        ...candidate,
        event,
        receive,
        price,
      });
    }
  }

  const providerOrder = [...parsedCandidates].sort(
    (left, right) =>
      left.source_position - right.source_position ||
      left.raw_record_id.localeCompare(right.raw_record_id),
  );
  for (let index = 1; index < providerOrder.length; index += 1) {
    const left = providerOrder[index - 1]!;
    const right = providerOrder[index]!;
    if (
      left.event > right.event ||
      (left.event === right.event &&
        (left.sequence_uint32 > right.sequence_uint32 ||
          (left.sequence_uint32 === right.sequence_uint32 &&
            left.tie_break_id.localeCompare(right.tie_break_id) > 0)))
    ) {
      diagnostics.out_of_order_records += 1;
    }
  }
  if (errors.size > 0 || asOf === null) {
    return failure(errors, diagnostics);
  }

  const eligible: ParsedTrade[] = [];
  const excludedCounts = new Map<string, number>();
  const recordReasons = new Map<
    string,
    { disposition: "excluded" | "pending"; reasons: string[] }
  >();
  const excludedByBucket = new Map<string, Map<string, number>>();
  const pendingByKey = new Map<string, MarketContextPendingBucketV2>();
  const lateOnlyKeys = new Set<string>();

  for (const trade of parsedCandidates) {
    const session = sessions.find(
      (value) =>
        trade.event >= value.open && trade.event < value.close,
    );
    if (!session) {
      diagnostics.records_excluded += 1;
      diagnostics.outside_session_records += 1;
      addCount(excludedCounts, "outside_declared_session");
      recordReasons.set(trade.raw_record_id, {
        disposition: "excluded",
        reasons: ["outside_declared_session"],
      });
      continue;
    }
    const bucketStart = (trade.event / nsPerMinute) * nsPerMinute;
    const bucketEnd = bucketStart + nsPerMinute;
    const watermark =
      bucketEnd + BigInt(MARKET_CONTEXT_TRADE_MAX_LATENESS_NS);
    const key = [
      trade.symbol,
      session.value.session_id,
      bucketStart.toString(),
    ].join("|");
    if (watermark > asOf) {
      diagnostics.records_excluded += 1;
      recordReasons.set(trade.raw_record_id, {
        disposition: "pending",
        reasons: ["bucket_not_finalized_as_of_cutoff"],
      });
      pendingByKey.set(key, {
        symbol: trade.symbol,
        session_id: session.value.session_id,
        bucket_start_unix_ns: bucketStart.toString(),
        bucket_end_unix_ns: bucketEnd.toString(),
        watermark_unix_ns: watermark.toString(),
        reason_code: "bucket_not_finalized_as_of_cutoff",
        reported_as_historical_gap: false,
      });
      continue;
    }
    if (trade.receive > watermark) {
      diagnostics.records_excluded += 1;
      diagnostics.late_receive_records += 1;
      addCount(excludedCounts, "late_receive_after_watermark");
      recordReasons.set(trade.raw_record_id, {
        disposition: "excluded",
        reasons: ["late_receive_after_watermark"],
      });
      const byReason = excludedByBucket.get(key) ??
        new Map<string, number>();
      addCount(byReason, "late_receive_after_watermark");
      excludedByBucket.set(key, byReason);
      lateOnlyKeys.add(key);
      continue;
    }
    eligible.push({
      ...trade,
      session,
      bucketStart,
      bucketEnd,
      watermark,
    });
  }

  eligible.sort(tradeOrder);
  diagnostics.records_eligible = eligible.length;
  const groups = new Map<string, ParsedTrade[]>();
  for (const trade of eligible) {
    const key = [
      trade.symbol,
      trade.session.value.session_id,
      trade.bucketStart.toString(),
    ].join("|");
    const group = groups.get(key) ?? [];
    group.push(trade);
    groups.set(key, group);
    lateOnlyKeys.delete(key);
  }

  const candles = [...groups.entries()].map(([key, group]) => {
    group.sort(tradeOrder);
    const first = group[0]!;
    const last = group[group.length - 1]!;
    let high = first.price;
    let low = first.price;
    let volume = BigInt(0);
    let firstReceive = first.receive;
    let lastReceive = first.receive;
    for (const trade of group) {
      if (trade.price > high) high = trade.price;
      if (trade.price < low) low = trade.price;
      volume += BigInt(trade.size_uint32);
      if (trade.receive < firstReceive) firstReceive = trade.receive;
      if (trade.receive > lastReceive) lastReceive = trade.receive;
    }
    const excluded = excludedByBucket.get(key) ??
      new Map<string, number>();
    const lineage = group.map((trade) => ({
      raw_record_id: trade.raw_record_id,
      raw_record_sha256: trade.raw_record_sha256,
      source_position: trade.source_position,
      sequence_uint32: trade.sequence_uint32,
      tie_break_id: trade.tie_break_id,
      ts_event_unix_ns: trade.ts_event_unix_ns,
      ts_recv_unix_ns: trade.ts_recv_unix_ns,
    }));
    return {
      contract_version: MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2,
      preparation_policy_version:
        MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2,
      provider: manifest.dataset.provider,
      provider_product: manifest.dataset.provider_product,
      provider_build: manifest.dataset.provider_build,
      provider_revision: manifest.dataset.provider_revision,
      dataset_id: manifest.dataset.dataset_id,
      dataset_version: manifest.dataset.dataset_version,
      schema_version: manifest.dataset.schema_version,
      symbol: first.symbol,
      session_id: first.session.value.session_id,
      session_date: first.session.value.session_date,
      session_type: first.session.value.session_type,
      interval: "1min" as const,
      bucket_start_unix_ns: first.bucketStart.toString(),
      bucket_end_unix_ns: first.bucketEnd.toString(),
      watermark_unix_ns: first.watermark.toString(),
      bucket_start_iso_utc:
        formatMarketContextUnixNsAsIsoV2(first.bucketStart),
      bucket_end_iso_utc:
        formatMarketContextUnixNsAsIsoV2(first.bucketEnd),
      open_scaled_1e9: first.price.toString(),
      high_scaled_1e9: high.toString(),
      low_scaled_1e9: low.toString(),
      close_scaled_1e9: last.price.toString(),
      volume_uint64: volume.toString(),
      first_ts_event_unix_ns: first.event.toString(),
      last_ts_event_unix_ns: last.event.toString(),
      first_ts_recv_unix_ns: firstReceive.toString(),
      last_ts_recv_unix_ns: lastReceive.toString(),
      eligible_trade_count: group.length,
      excluded_trade_count: [...excluded.values()].reduce(
        (total, count) => total + count,
        0,
      ),
      excluded_reason_codes: [...excluded.keys()].sort(),
      adjustment_state: manifest.corporate_actions.adjustment_state,
      source_record_digest: sha256(
        stableMarketContextTradePreparationJsonV2(lineage),
      ),
      lineage,
    } satisfies MarketContextPreparedCandleV2;
  });
  candles.sort(
    (left, right) =>
      (BigInt(left.bucket_start_unix_ns) <
        BigInt(right.bucket_start_unix_ns)
        ? -1
        : BigInt(left.bucket_start_unix_ns) >
            BigInt(right.bucket_start_unix_ns)
        ? 1
        : 0) ||
      left.symbol.localeCompare(right.symbol) ||
      left.session_id.localeCompare(right.session_id),
  );

  const candleKeys = new Set(
    candles.map((candle) =>
      [
        candle.symbol,
        candle.session_id,
        candle.bucket_start_unix_ns,
      ].join("|"),
    ),
  );
  const gaps: MarketContextTradeGapV2[] = [];
  const sortedSymbols = [...manifest.symbols].sort();
  for (const session of sessions) {
    for (const currentSymbol of sortedSymbols) {
      for (
        let bucket = session.open;
        bucket < session.close;
        bucket += nsPerMinute
      ) {
        const end = bucket + nsPerMinute;
        const watermark =
          end + BigInt(MARKET_CONTEXT_TRADE_MAX_LATENESS_NS);
        if (watermark > asOf) continue;
        const key = [
          currentSymbol,
          session.value.session_id,
          bucket.toString(),
        ].join("|");
        if (candleKeys.has(key)) continue;
        gaps.push({
          symbol: currentSymbol,
          session_id: session.value.session_id,
          session_date: session.value.session_date,
          bucket_start_unix_ns: bucket.toString(),
          bucket_end_unix_ns: end.toString(),
          reason_code: lateOnlyKeys.has(key)
            ? "late_only_bucket_no_eligible_trade"
            : "missing_minute_no_eligible_trade",
          observable_and_finalized: true,
          forward_filled: false,
        });
      }
    }
  }
  gaps.sort(
    (left, right) =>
      (BigInt(left.bucket_start_unix_ns) <
        BigInt(right.bucket_start_unix_ns)
        ? -1
        : BigInt(left.bucket_start_unix_ns) >
            BigInt(right.bucket_start_unix_ns)
        ? 1
        : 0) ||
      left.symbol.localeCompare(right.symbol) ||
      left.session_id.localeCompare(right.session_id),
  );
  const pendingBuckets = [...pendingByKey.values()].sort(
    (left, right) =>
      (BigInt(left.bucket_start_unix_ns) <
        BigInt(right.bucket_start_unix_ns)
        ? -1
        : BigInt(left.bucket_start_unix_ns) >
            BigInt(right.bucket_start_unix_ns)
        ? 1
        : 0) || left.symbol.localeCompare(right.symbol),
  );
  diagnostics.candles_emitted = candles.length;
  diagnostics.finalized_gaps = gaps.length;
  diagnostics.pending_buckets = pendingBuckets.length;
  diagnostics.excluded_by_reason = [...excludedCounts.entries()]
    .map(([reason_code, count]) => ({ reason_code, count }))
    .sort((left, right) =>
      left.reason_code.localeCompare(right.reason_code),
    );

  const candleByRecord = new Map<string, string>();
  for (const candle of candles) {
    const identity = candleIdentity(candle);
    for (const line of candle.lineage) {
      candleByRecord.set(line.raw_record_id, identity);
    }
  }
  const dispositions = records
    .map((record) => {
      const candle = candleByRecord.get(record.raw_record_id);
      const excluded = recordReasons.get(record.raw_record_id);
      return {
        raw_record_id: record.raw_record_id,
        raw_record_sha256: record.raw_record_sha256,
        source_position: record.source_position,
        disposition: candle
          ? ("included_in_candle" as const)
          : (excluded?.disposition ?? "excluded"),
        candle_identity: candle ?? null,
        reason_codes: [...(excluded?.reasons ?? [])].sort(),
      };
    })
    .sort(
      (left, right) =>
        left.source_position - right.source_position ||
        left.raw_record_id.localeCompare(right.raw_record_id),
    );
  const normalizedDigest = sha256(
    stableMarketContextTradePreparationJsonV2({
      candles,
      gaps,
      pending_buckets: pendingBuckets,
      raw_record_dispositions: dispositions,
      preparation_policy_version:
        MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2,
      calendar_artifact_sha256:
        manifest.session_calendar.artifact.artifact_sha256,
      corporate_actions: manifest.corporate_actions,
    }),
  );
  return {
    status: "prepared",
    contract_version: MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2,
    policy_versions: {
      preparation: MARKET_CONTEXT_TRADE_PREPARATION_POLICY_V2,
      timestamp: MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1,
      watermark: MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2,
      tiebreak: MARKET_CONTEXT_TRADE_TIEBREAK_POLICY_V2,
      eligibility: MARKET_CONTEXT_TRADE_ELIGIBILITY_POLICY_V2,
      session: MARKET_CONTEXT_TRADE_SESSION_POLICY_V2,
      canonicalization: MARKET_CONTEXT_TRADE_CANONICAL_JSON_V2,
    },
    preparation_as_of_unix_ns: asOf.toString(),
    calendar_artifact: {
      artifact_id:
        manifest.session_calendar.artifact.artifact_id,
      artifact_version:
        manifest.session_calendar.artifact.artifact_version,
      artifact_sha256:
        manifest.session_calendar.artifact.artifact_sha256,
    },
    corporate_actions: manifest.corporate_actions,
    candles,
    gaps,
    pending_buckets: pendingBuckets,
    diagnostics,
    raw_record_dispositions: dispositions,
    digests: {
      immutable_raw_records_digest: computedRawDigest,
      immutable_normalized_candles_digest: normalizedDigest,
    },
    input_immutable: true,
    shadow_only: true,
    live_ranking_effect: false,
    replay_output_created: false,
    external_activity: externalActivity,
  };
}

export function prepareMarketContextTradesToCandlesV2(
  input: unknown,
): MarketContextTradePreparationResultV2 {
  const diagnostics = emptyDiagnostics();
  try {
    return prepareInternal(
      input as {
        manifest: MarketContextTradePreparationManifestV2;
        records: MarketContextTradeRecordV2[];
      },
    );
  } catch {
    return failure(new Set(["malformed_runtime_input"]), diagnostics);
  }
}

function positiveScaledValue(value: unknown) {
  return parsePrice(value);
}

export function deriveMarketContextSectorEtfBreadthV2(
  input: unknown,
): MarketContextSectorEtfBreadthResultV2 {
  const errors = new Set<string>();
  try {
    const value = input as MarketContextSectorEtfBreadthInputV2;
    const timestamp = parseUint64Ns(value?.timestamp_unix_ns);
    if (timestamp === null) errors.add("breadth_timestamp_invalid");
    if (
      !Array.isArray(value?.sectors) ||
      value.sectors.length !==
        MARKET_CONTEXT_SECTOR_ETF_SYMBOLS_V2.length
    ) {
      errors.add("sector_universe_incomplete");
    }
    const expected = new Set<string>(
      MARKET_CONTEXT_SECTOR_ETF_SYMBOLS_V2,
    );
    const observed = new Set<string>();
    for (const sector of value?.sectors ?? []) {
      if (
        !expected.has(sector?.symbol) ||
        observed.has(sector?.symbol)
      ) {
        errors.add("sector_universe_invalid_or_duplicate");
      }
      observed.add(sector?.symbol);
      if (
        positiveScaledValue(sector?.current_close_scaled_1e9) ===
          null ||
        positiveScaledValue(sector?.previous_close_scaled_1e9) ===
          null ||
        positiveScaledValue(sector?.short_average_scaled_1e9) ===
          null ||
        !sha256Pattern.test(sector?.candle_digest ?? "")
      ) {
        errors.add("sector_value_or_digest_invalid");
      }
    }
    if (
      MARKET_CONTEXT_SECTOR_ETF_SYMBOLS_V2.some(
        (sector) => !observed.has(sector),
      )
    ) {
      errors.add("sector_universe_incomplete");
    }
    const sourceDigest = computeMarketContextSectorSourceDigestV2(
      value?.sectors ?? [],
    );
    if (
      !sha256Pattern.test(value?.source_candles_digest ?? "") ||
      sourceDigest !== value.source_candles_digest
    ) {
      errors.add("sector_source_candles_digest_mismatch");
    }
    if (errors.size > 0 || timestamp === null) {
      return {
        status: "rejected",
        version: MARKET_CONTEXT_SECTOR_ETF_BREADTH_V2,
        error_codes: [...errors].sort(),
        not_full_market_breadth: true,
      };
    }
    const sorted = [...value.sectors].sort((left, right) =>
      left.symbol.localeCompare(right.symbol),
    );
    const advancing = sorted.filter(
      (sector) =>
        BigInt(sector.current_close_scaled_1e9) >
        BigInt(sector.previous_close_scaled_1e9),
    ).length;
    const above = sorted.filter(
      (sector) =>
        BigInt(sector.current_close_scaled_1e9) >
        BigInt(sector.short_average_scaled_1e9),
    ).length;
    const core = {
      version: MARKET_CONTEXT_SECTOR_ETF_BREADTH_V2,
      timestamp_unix_ns: timestamp.toString(),
      breadth_identity:
        "declared_eleven_sector_etf_participation" as const,
      expected_constituents: 11 as const,
      observed_constituents: 11 as const,
      coverage: 1 as const,
      advancing_fraction: Number((advancing / 11).toFixed(6)),
      above_short_average_fraction: Number((above / 11).toFixed(6)),
      not_full_market_breadth: true as const,
      reason_codes: [
        "SECTOR_ETF_BREADTH_ONLY",
        "NOT_FULL_MARKET_BREADTH",
      ] as [
        "SECTOR_ETF_BREADTH_ONLY",
        "NOT_FULL_MARKET_BREADTH",
      ],
      source_candles_digest: sourceDigest,
    };
    return {
      status: "measured",
      ...core,
      normalized_digest: sha256(
        stableMarketContextTradePreparationJsonV2(core),
      ),
    };
  } catch {
    return {
      status: "rejected",
      version: MARKET_CONTEXT_SECTOR_ETF_BREADTH_V2,
      error_codes: ["malformed_runtime_input"],
      not_full_market_breadth: true,
    };
  }
}
