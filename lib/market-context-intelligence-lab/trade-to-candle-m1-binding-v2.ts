import { createHash } from "node:crypto";

import {
  MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1,
  MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2,
  formatMarketContextUnixNsAsIsoV2,
  stableMarketContextTradePreparationJsonV2,
  type MarketContextTradePreparationSuccessV2,
} from "./trade-to-candle-preparation-v2";

export const MARKET_CONTEXT_TRADE_M1_BINDING_ADAPTER_V2 =
  "market_context_historical_trade_m1_binding_adapter_v2" as const;
export const MARKET_CONTEXT_HISTORICAL_DATASET_TARGET_V1 =
  "market_context_historical_dataset_v1" as const;
export const MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_TARGET_V1 =
  "market_context_historical_dataset_normalizer_v1" as const;
export const MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1 =
  "market_context_historical_dataset_nanosecond_extension_v1" as const;

const sha256Pattern = /^[0-9a-f]{64}$/;
const unsignedInteger = /^(0|[1-9][0-9]*)$/;
const maxUint64 = BigInt("18446744073709551615");

export type MarketContextTradeM1BindingMetadataV2 = {
  adapter_version: typeof MARKET_CONTEXT_TRADE_M1_BINDING_ADAPTER_V2;
  target_contract_version:
    typeof MARKET_CONTEXT_HISTORICAL_DATASET_TARGET_V1;
  target_normalizer_version:
    typeof MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_TARGET_V1;
  required_receiver_extension:
    typeof MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1;
  dataset: {
    dataset_id: string;
    dataset_version: string;
    provider: string;
    provider_product: string;
    provider_build: string;
    provider_revision: string;
    schema: "trades";
    schema_version: string;
  };
  decision: {
    decision_id: string;
    ticker: string;
    decision_timestamp_unix_ns: string;
  };
  source: {
    provenance_status: "documented";
    provenance_description: string;
    source_reference: string;
    usage_rights_status: "documented_permitted";
    usage_rights_basis: string;
    internal_research_and_replay_allowed: true;
  };
  acquisition: {
    timestamp_unix_ns: string;
    method: "operator_supplied_local_files" | "licensed_export";
  };
  date_range: {
    start: string;
    end: string;
    basis: "observation_utc_date";
  };
  candle_policy: {
    interval: "1min";
    timezone: "UTC";
    session_calendar_policy: string;
  };
  timestamp_policy: {
    representation:
      typeof MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1;
    observation_timestamp: "unix_nanoseconds_required";
    provider_source_timestamp: "unix_nanoseconds_required";
    received_timestamp: "unix_nanoseconds_required";
  };
  universe: {
    tickers: string[];
    benchmark_symbols: string[];
    breadth_source_id: string;
    expected_breadth_constituents: number;
  };
  symbol_contexts: Array<{
    symbol: string;
    domain: "benchmark" | "sector" | "industry";
    context_id: string;
  }>;
  calendar: {
    artifact_id: string;
    artifact_version: string;
    artifact_sha256: string;
    exchange: "XNYS";
    timezone: "America/New_York";
  };
  corporate_actions: {
    policy_version: string;
    policy_documented: true;
    split_policy: string;
    dividend_policy: string;
    adjustment_state: "raw" | "split_adjusted" | "total_return_adjusted";
    point_in_time_attested: true;
  };
  quality: {
    expected_rows_by_domain: {
      benchmark: number;
      breadth: number;
      sector: number;
      industry: number;
    };
    minimum_coverage_by_domain: {
      benchmark: number;
      breadth: number;
      sector: number;
      industry: number;
    };
    missingness_policy: string;
    duplicate_policy: "reject";
    out_of_order_policy: "sort_and_report";
  };
  point_in_time: {
    attested: true;
    attestation: string;
    future_observation_policy: "reject";
    future_provider_source_policy: "reject";
    received_after_decision_policy: "reject";
  };
  sensitive_identifiers: {
    policy: "reject";
    sanitized: true;
    sanitization_attestation: string;
  };
  raw_files: Array<{
    file_id: string;
    media_type: "application/x-ndjson";
    bytes: number;
    sha256: string;
  }>;
  immutable_raw_digest: string;
  raw_record_lineage: Array<{
    raw_record_id: string;
    raw_record_sha256: string;
    file_id: string;
    source_line: number;
  }>;
  supplemental_breadth_rows: Array<{
    row_id: string;
    observation_timestamp_unix_ns: string;
    provider_source_timestamp_unix_ns: string;
    received_timestamp_unix_ns: string;
    context_id: string;
    expected_constituents: number;
    observed_constituents: number;
    advancing_fraction: number;
    above_short_average_fraction: number;
    source_digest: string;
  }>;
};

export type MarketContextTradeM1BoundCandleV2 = {
  row_type: "candle";
  decision_id: string;
  ticker: string;
  decision_timestamp_unix_ns: string;
  decision_timestamp_iso_utc: string;
  provider: string;
  provider_product: string;
  provider_build: string;
  provider_revision: string;
  domain: "benchmark" | "sector" | "industry";
  context_id: string;
  symbol: string;
  interval: "1min";
  observation_timestamp_unix_ns: string;
  observation_timestamp_iso_utc: string;
  provider_source_timestamp_unix_ns: string;
  provider_source_timestamp_iso_utc: string;
  received_timestamp_unix_ns: string;
  received_timestamp_iso_utc: string;
  open_scaled_1e9: string;
  high_scaled_1e9: string;
  low_scaled_1e9: string;
  close_scaled_1e9: string;
  volume_uint64: string;
  adjustment_state:
    MarketContextTradeM1BindingMetadataV2["corporate_actions"]["adjustment_state"];
  lineage: Array<{
    raw_record_id: string;
    raw_record_sha256: string;
    file_id: string;
    source_line: number;
  }>;
};

export type MarketContextTradeM1BoundBreadthV2 = {
  row_type: "breadth";
  decision_id: string;
  ticker: string;
  decision_timestamp_unix_ns: string;
  provider: string;
  domain: "breadth";
  context_id: string;
  observation_timestamp_unix_ns: string;
  provider_source_timestamp_unix_ns: string;
  received_timestamp_unix_ns: string;
  expected_constituents: number;
  observed_constituents: number;
  advancing_fraction: number;
  above_short_average_fraction: number;
  source_digest: string;
};

export type MarketContextTradeM1BindingResultV2 =
  | {
      status: "bindable";
      adapter_version:
        typeof MARKET_CONTEXT_TRADE_M1_BINDING_ADAPTER_V2;
      target_contract_version:
        typeof MARKET_CONTEXT_HISTORICAL_DATASET_TARGET_V1;
      target_normalizer_version:
        typeof MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_TARGET_V1;
      required_receiver_extension:
        typeof MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1;
      timestamp_version:
        typeof MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1;
      receiver_note:
        "lossless_nanosecond_extension_required_before_native_ingestion";
      metadata: MarketContextTradeM1BindingMetadataV2;
      candle_rows: MarketContextTradeM1BoundCandleV2[];
      breadth_rows: MarketContextTradeM1BoundBreadthV2[];
      coverage_by_domain: {
        benchmark: number;
        breadth: number;
        sector: number;
        industry: number;
      };
      normalized_digest: string;
      metadata_inferred: false;
      canonical_binding_performed: false;
      shadow_only: true;
      live_ranking_effect: false;
    }
  | {
      status: "not_bindable";
      adapter_version:
        typeof MARKET_CONTEXT_TRADE_M1_BINDING_ADAPTER_V2;
      error_codes: string[];
      metadata_inferred: false;
      canonical_binding_performed: false;
      shadow_only: true;
      live_ranking_effect: false;
    };

function identifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
}

function parseNs(value: unknown) {
  if (
    typeof value !== "string" ||
    !unsignedInteger.test(value)
  ) {
    return null;
  }
  try {
    const parsed = BigInt(value);
    return parsed < maxUint64 ? parsed : null;
  } catch {
    return null;
  }
}

function fraction(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

function nonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function fail(errors: Set<string>): MarketContextTradeM1BindingResultV2 {
  return {
    status: "not_bindable",
    adapter_version: MARKET_CONTEXT_TRADE_M1_BINDING_ADAPTER_V2,
    error_codes: [...errors].sort((left, right) =>
      left.localeCompare(right),
    ),
    metadata_inferred: false,
    canonical_binding_performed: false,
    shadow_only: true,
    live_ranking_effect: false,
  };
}

function validateMetadata(
  metadata: MarketContextTradeM1BindingMetadataV2,
  prepared: MarketContextTradePreparationSuccessV2,
  errors: Set<string>,
) {
  const recomputedNormalizedDigest = sha256(
    stableMarketContextTradePreparationJsonV2({
      candles: prepared.candles,
      gaps: prepared.gaps,
      pending_buckets: prepared.pending_buckets,
      raw_record_dispositions: prepared.raw_record_dispositions,
      preparation_policy_version:
        prepared.policy_versions?.preparation,
      calendar_artifact_sha256:
        prepared.calendar_artifact?.artifact_sha256,
      corporate_actions: prepared.corporate_actions,
    }),
  );
  if (
    prepared.policy_versions?.timestamp !==
      MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1 ||
    !sha256Pattern.test(
      prepared.digests?.immutable_raw_records_digest ?? "",
    ) ||
    !sha256Pattern.test(
      prepared.digests?.immutable_normalized_candles_digest ?? "",
    ) ||
    prepared.digests.immutable_normalized_candles_digest !==
      recomputedNormalizedDigest ||
    prepared.shadow_only !== true ||
    prepared.live_ranking_effect !== false ||
    prepared.replay_output_created !== false
  ) {
    errors.add("binding_prepared_result_integrity_invalid");
  }
  for (const candle of prepared.candles ?? []) {
    if (
      candle.lineage.length === 0 ||
      sha256(
        stableMarketContextTradePreparationJsonV2(candle.lineage),
      ) !== candle.source_record_digest
    ) {
      errors.add("binding_candle_lineage_digest_invalid");
    }
  }
  if (
    metadata?.adapter_version !==
      MARKET_CONTEXT_TRADE_M1_BINDING_ADAPTER_V2 ||
    metadata?.target_contract_version !==
      MARKET_CONTEXT_HISTORICAL_DATASET_TARGET_V1 ||
    metadata?.target_normalizer_version !==
      MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_TARGET_V1 ||
    metadata?.required_receiver_extension !==
      MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1
  ) {
    errors.add("binding_version_metadata_invalid");
  }
  const first = prepared.candles[0];
  const dataset = metadata?.dataset;
  if (
    !first ||
    !identifier(dataset?.dataset_id) ||
    !identifier(dataset?.dataset_version) ||
    !identifier(dataset?.provider) ||
    !identifier(dataset?.provider_product) ||
    !identifier(dataset?.provider_build) ||
    !identifier(dataset?.provider_revision) ||
    dataset?.schema !== "trades" ||
    !identifier(dataset?.schema_version) ||
    dataset.dataset_id !== first.dataset_id ||
    dataset.dataset_version !== first.dataset_version ||
    dataset.provider !== first.provider ||
    dataset.provider_product !== first.provider_product ||
    dataset.provider_build !== first.provider_build ||
    dataset.provider_revision !== first.provider_revision ||
    dataset.schema_version !== first.schema_version
  ) {
    errors.add("binding_dataset_metadata_missing_or_mismatch");
  }
  const decisionNs = parseNs(
    metadata?.decision?.decision_timestamp_unix_ns,
  );
  if (
    !identifier(metadata?.decision?.decision_id) ||
    !identifier(metadata?.decision?.ticker) ||
    decisionNs === null ||
    metadata.decision.decision_timestamp_unix_ns !==
      prepared.preparation_as_of_unix_ns
  ) {
    errors.add("binding_decision_metadata_missing_or_mismatch");
  }
  if (
    metadata?.source?.provenance_status !== "documented" ||
    !identifier(metadata?.source?.provenance_description) ||
    !identifier(metadata?.source?.source_reference) ||
    metadata?.source?.usage_rights_status !==
      "documented_permitted" ||
    !identifier(metadata?.source?.usage_rights_basis) ||
    metadata?.source?.internal_research_and_replay_allowed !== true
  ) {
    errors.add("binding_provenance_or_usage_rights_invalid");
  }
  if (
    parseNs(metadata?.acquisition?.timestamp_unix_ns) === null ||
    (metadata?.acquisition?.method !==
      "operator_supplied_local_files" &&
      metadata?.acquisition?.method !== "licensed_export")
  ) {
    errors.add("binding_acquisition_metadata_invalid");
  }
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(metadata?.date_range?.start ?? "") ||
    !/^\d{4}-\d{2}-\d{2}$/.test(metadata?.date_range?.end ?? "") ||
    metadata.date_range.start > metadata.date_range.end ||
    metadata.date_range.basis !== "observation_utc_date"
  ) {
    errors.add("binding_date_range_invalid");
  }
  if (
    metadata?.candle_policy?.interval !== "1min" ||
    metadata?.candle_policy?.timezone !== "UTC" ||
    !identifier(
      metadata?.candle_policy?.session_calendar_policy,
    ) ||
    metadata?.timestamp_policy?.representation !==
      MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1 ||
    metadata?.timestamp_policy?.observation_timestamp !==
      "unix_nanoseconds_required" ||
    metadata?.timestamp_policy?.provider_source_timestamp !==
      "unix_nanoseconds_required" ||
    metadata?.timestamp_policy?.received_timestamp !==
      "unix_nanoseconds_required"
  ) {
    errors.add("binding_candle_or_timestamp_policy_invalid");
  }
  if (
    !Array.isArray(metadata?.universe?.tickers) ||
    !metadata.universe.tickers.includes("SPY") ||
    !metadata.universe.tickers.includes("QQQ") ||
    !Array.isArray(metadata.universe.benchmark_symbols) ||
    !metadata.universe.benchmark_symbols.includes("SPY") ||
    !metadata.universe.benchmark_symbols.includes("QQQ") ||
    !identifier(metadata.universe.breadth_source_id) ||
    !nonNegativeInteger(
      metadata.universe.expected_breadth_constituents,
    ) ||
    metadata.universe.expected_breadth_constituents === 0
  ) {
    errors.add("binding_universe_metadata_invalid");
  }
  const symbolContexts = new Map<string, {
    domain: "benchmark" | "sector" | "industry";
    context_id: string;
  }>();
  for (const context of metadata?.symbol_contexts ?? []) {
    if (
      !identifier(context?.symbol) ||
      !["benchmark", "sector", "industry"].includes(
        context?.domain,
      ) ||
      !identifier(context?.context_id) ||
      symbolContexts.has(context.symbol)
    ) {
      errors.add("binding_symbol_context_invalid_or_duplicate");
      continue;
    }
    symbolContexts.set(context.symbol, {
      domain: context.domain,
      context_id: context.context_id,
    });
  }
  for (const candle of prepared.candles) {
    if (!symbolContexts.has(candle.symbol)) {
      errors.add(`binding_symbol_context_missing:${candle.symbol}`);
    }
  }
  if (
    !identifier(metadata?.calendar?.artifact_id) ||
    !identifier(metadata?.calendar?.artifact_version) ||
    !sha256Pattern.test(metadata?.calendar?.artifact_sha256 ?? "") ||
    metadata.calendar.artifact_sha256 !==
      prepared.calendar_artifact.artifact_sha256 ||
    metadata.calendar.artifact_id !==
      prepared.calendar_artifact.artifact_id ||
    metadata.calendar.artifact_version !==
      prepared.calendar_artifact.artifact_version ||
    metadata.calendar.exchange !== "XNYS" ||
    metadata.calendar.timezone !== "America/New_York"
  ) {
    errors.add("binding_calendar_metadata_invalid_or_mismatch");
  }
  if (
    !identifier(metadata?.corporate_actions?.policy_version) ||
    metadata?.corporate_actions?.policy_documented !== true ||
    !identifier(metadata?.corporate_actions?.split_policy) ||
    !identifier(metadata?.corporate_actions?.dividend_policy) ||
    metadata?.corporate_actions?.point_in_time_attested !== true ||
    !["raw", "split_adjusted", "total_return_adjusted"].includes(
      metadata?.corporate_actions?.adjustment_state,
    ) ||
    prepared.candles.some(
      (candle) =>
        candle.adjustment_state !==
        metadata.corporate_actions.adjustment_state,
    ) ||
    metadata.corporate_actions.policy_version !==
      prepared.corporate_actions.policy_version ||
    metadata.corporate_actions.split_policy !==
      prepared.corporate_actions.split_policy ||
    metadata.corporate_actions.dividend_policy !==
      prepared.corporate_actions.dividend_policy ||
    metadata.corporate_actions.adjustment_state !==
      prepared.corporate_actions.adjustment_state
  ) {
    errors.add("binding_corporate_action_metadata_invalid");
  }
  const domains = [
    "benchmark",
    "breadth",
    "sector",
    "industry",
  ] as const;
  for (const domain of domains) {
    if (
      !nonNegativeInteger(
        metadata?.quality?.expected_rows_by_domain?.[domain],
      ) ||
      !fraction(
        metadata?.quality?.minimum_coverage_by_domain?.[domain],
      )
    ) {
      errors.add(`binding_quality_policy_invalid:${domain}`);
    }
  }
  if (
    !identifier(metadata?.quality?.missingness_policy) ||
    metadata?.quality?.duplicate_policy !== "reject" ||
    metadata?.quality?.out_of_order_policy !== "sort_and_report"
  ) {
    errors.add("binding_quality_policy_invalid");
  }
  if (
    metadata?.point_in_time?.attested !== true ||
    !identifier(metadata?.point_in_time?.attestation) ||
    metadata?.point_in_time?.future_observation_policy !== "reject" ||
    metadata?.point_in_time?.future_provider_source_policy !==
      "reject" ||
    metadata?.point_in_time?.received_after_decision_policy !==
      "reject"
  ) {
    errors.add("binding_point_in_time_metadata_invalid");
  }
  if (
    metadata?.sensitive_identifiers?.policy !== "reject" ||
    metadata?.sensitive_identifiers?.sanitized !== true ||
    !identifier(
      metadata?.sensitive_identifiers?.sanitization_attestation,
    )
  ) {
    errors.add("binding_sensitive_identifier_metadata_invalid");
  }
  const rawFiles = new Set<string>();
  for (const file of metadata?.raw_files ?? []) {
    if (
      !identifier(file?.file_id) ||
      file?.media_type !== "application/x-ndjson" ||
      !nonNegativeInteger(file?.bytes) ||
      file.bytes === 0 ||
      !sha256Pattern.test(file?.sha256 ?? "") ||
      rawFiles.has(file.file_id)
    ) {
      errors.add("binding_raw_file_metadata_invalid");
    }
    if (identifier(file?.file_id)) rawFiles.add(file.file_id);
  }
  if (rawFiles.size === 0) errors.add("binding_raw_files_missing");
  const computedRawDigest = sha256(
    stableMarketContextTradePreparationJsonV2(
      [...(metadata?.raw_files ?? [])].sort((left, right) =>
        left.file_id.localeCompare(right.file_id),
      ),
    ),
  );
  if (
    !sha256Pattern.test(metadata?.immutable_raw_digest ?? "") ||
    metadata.immutable_raw_digest !== computedRawDigest
  ) {
    errors.add("binding_immutable_raw_digest_invalid");
  }
  const expectedRecords = new Map(
    prepared.raw_record_dispositions.map((record) => [
      record.raw_record_id,
      record.raw_record_sha256,
    ]),
  );
  const lineageIds = new Set<string>();
  for (const line of metadata?.raw_record_lineage ?? []) {
    if (
      !identifier(line?.raw_record_id) ||
      !sha256Pattern.test(line?.raw_record_sha256 ?? "") ||
      !rawFiles.has(line?.file_id) ||
      !Number.isSafeInteger(line?.source_line) ||
      line.source_line <= 0 ||
      lineageIds.has(line.raw_record_id) ||
      expectedRecords.get(line.raw_record_id) !==
        line.raw_record_sha256
    ) {
      errors.add("binding_raw_record_lineage_invalid");
    }
    if (identifier(line?.raw_record_id)) {
      lineageIds.add(line.raw_record_id);
    }
  }
  if (
    lineageIds.size !== expectedRecords.size ||
    [...expectedRecords.keys()].some((id) => !lineageIds.has(id))
  ) {
    errors.add("binding_raw_record_lineage_incomplete");
  }
  for (const row of metadata?.supplemental_breadth_rows ?? []) {
    const observation = parseNs(row?.observation_timestamp_unix_ns);
    const providerSource = parseNs(
      row?.provider_source_timestamp_unix_ns,
    );
    const received = parseNs(row?.received_timestamp_unix_ns);
    if (
      !identifier(row?.row_id) ||
      observation === null ||
      providerSource === null ||
      received === null ||
      (decisionNs !== null &&
        (observation !== null && observation > decisionNs ||
          providerSource !== null && providerSource > decisionNs ||
          received !== null && received > decisionNs)) ||
      !identifier(row?.context_id) ||
      !nonNegativeInteger(row?.expected_constituents) ||
      row.expected_constituents === 0 ||
      !nonNegativeInteger(row?.observed_constituents) ||
      row.observed_constituents > row.expected_constituents ||
      !fraction(row?.advancing_fraction) ||
      !fraction(row?.above_short_average_fraction) ||
      !sha256Pattern.test(row?.source_digest ?? "")
    ) {
      errors.add("binding_breadth_row_invalid");
    }
  }
  if (
    metadata?.supplemental_breadth_rows?.length !==
      metadata?.quality?.expected_rows_by_domain?.breadth
  ) {
    errors.add("binding_breadth_rows_incomplete");
  }
  return symbolContexts;
}

function coverage(observed: number, expected: number) {
  return expected === 0
    ? observed === 0 ? 1 : 0
    : Number((observed / expected).toFixed(6));
}

export function bindMarketContextTradePreparationToM1V2(
  input: unknown,
): MarketContextTradeM1BindingResultV2 {
  const errors = new Set<string>();
  try {
    const value = input as {
      prepared: MarketContextTradePreparationSuccessV2;
      metadata: MarketContextTradeM1BindingMetadataV2;
    };
    if (
      !value?.prepared ||
      value.prepared.status !== "prepared" ||
      value.prepared.contract_version !==
        MARKET_CONTEXT_TRADE_TO_CANDLE_PREPARATION_V2
    ) {
      errors.add("binding_requires_prepared_v2_result");
      return fail(errors);
    }
    const metadata = value.metadata;
    const contexts = validateMetadata(
      metadata,
      value.prepared,
      errors,
    );
    if (errors.size > 0) return fail(errors);

    const lineage = new Map(
      metadata.raw_record_lineage.map((line) => [
        line.raw_record_id,
        line,
      ]),
    );
    const decisionNs = BigInt(
      metadata.decision.decision_timestamp_unix_ns,
    );
    const candleRows: MarketContextTradeM1BoundCandleV2[] =
      value.prepared.candles.map((candle) => {
        const context = contexts.get(candle.symbol)!;
        if (
          BigInt(candle.last_ts_event_unix_ns) > decisionNs ||
          BigInt(candle.last_ts_recv_unix_ns) > decisionNs
        ) {
          throw new Error("binding_future_candle");
        }
        return {
          row_type: "candle",
          decision_id: metadata.decision.decision_id,
          ticker: metadata.decision.ticker,
          decision_timestamp_unix_ns:
            metadata.decision.decision_timestamp_unix_ns,
          decision_timestamp_iso_utc:
            formatMarketContextUnixNsAsIsoV2(decisionNs),
          provider: metadata.dataset.provider,
          provider_product: metadata.dataset.provider_product,
          provider_build: metadata.dataset.provider_build,
          provider_revision: metadata.dataset.provider_revision,
          domain: context.domain,
          context_id: context.context_id,
          symbol: candle.symbol,
          interval: "1min",
          observation_timestamp_unix_ns:
            candle.bucket_start_unix_ns,
          observation_timestamp_iso_utc: candle.bucket_start_iso_utc,
          provider_source_timestamp_unix_ns:
            candle.last_ts_event_unix_ns,
          provider_source_timestamp_iso_utc:
            formatMarketContextUnixNsAsIsoV2(
              BigInt(candle.last_ts_event_unix_ns),
            ),
          received_timestamp_unix_ns:
            candle.last_ts_recv_unix_ns,
          received_timestamp_iso_utc:
            formatMarketContextUnixNsAsIsoV2(
              BigInt(candle.last_ts_recv_unix_ns),
            ),
          open_scaled_1e9: candle.open_scaled_1e9,
          high_scaled_1e9: candle.high_scaled_1e9,
          low_scaled_1e9: candle.low_scaled_1e9,
          close_scaled_1e9: candle.close_scaled_1e9,
          volume_uint64: candle.volume_uint64,
          adjustment_state: candle.adjustment_state,
          lineage: candle.lineage.map((line) => {
            const source = lineage.get(line.raw_record_id)!;
            return {
              raw_record_id: source.raw_record_id,
              raw_record_sha256: source.raw_record_sha256,
              file_id: source.file_id,
              source_line: source.source_line,
            };
          }),
        };
      });
    const breadthRows: MarketContextTradeM1BoundBreadthV2[] =
      metadata.supplemental_breadth_rows.map((row) => ({
        row_type: "breadth",
        decision_id: metadata.decision.decision_id,
        ticker: metadata.decision.ticker,
        decision_timestamp_unix_ns:
          metadata.decision.decision_timestamp_unix_ns,
        provider: metadata.dataset.provider,
        domain: "breadth",
        context_id: row.context_id,
        observation_timestamp_unix_ns:
          row.observation_timestamp_unix_ns,
        provider_source_timestamp_unix_ns:
          row.provider_source_timestamp_unix_ns,
        received_timestamp_unix_ns: row.received_timestamp_unix_ns,
        expected_constituents: row.expected_constituents,
        observed_constituents: row.observed_constituents,
        advancing_fraction: row.advancing_fraction,
        above_short_average_fraction:
          row.above_short_average_fraction,
        source_digest: row.source_digest,
      }));
    const observed = {
      benchmark: candleRows.filter(
        (row) => row.domain === "benchmark",
      ).length,
      breadth: breadthRows.length,
      sector: candleRows.filter((row) => row.domain === "sector")
        .length,
      industry: candleRows.filter((row) => row.domain === "industry")
        .length,
    };
    const expected = metadata.quality.expected_rows_by_domain;
    const coverageByDomain = {
      benchmark: coverage(observed.benchmark, expected.benchmark),
      breadth: coverage(observed.breadth, expected.breadth),
      sector: coverage(observed.sector, expected.sector),
      industry: coverage(observed.industry, expected.industry),
    };
    for (
      const domain of [
        "benchmark",
        "breadth",
        "sector",
        "industry",
      ] as const
    ) {
      if (
        coverageByDomain[domain] <
        metadata.quality.minimum_coverage_by_domain[domain]
      ) {
        errors.add(`binding_coverage_below_minimum:${domain}`);
      }
    }
    if (errors.size > 0) return fail(errors);
    const core = {
      adapter_version: MARKET_CONTEXT_TRADE_M1_BINDING_ADAPTER_V2,
      target_contract_version:
        MARKET_CONTEXT_HISTORICAL_DATASET_TARGET_V1,
      target_normalizer_version:
        MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_TARGET_V1,
      required_receiver_extension:
        MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1,
      timestamp_version: MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1,
      receiver_note:
        "lossless_nanosecond_extension_required_before_native_ingestion" as const,
      metadata,
      candle_rows: candleRows,
      breadth_rows: breadthRows,
      coverage_by_domain: coverageByDomain,
      metadata_inferred: false as const,
      canonical_binding_performed: false as const,
      shadow_only: true as const,
      live_ranking_effect: false as const,
    };
    return {
      status: "bindable",
      ...core,
      normalized_digest: createHash("sha256")
        .update(stableMarketContextTradePreparationJsonV2(core))
        .digest("hex"),
    };
  } catch {
    errors.add("binding_malformed_runtime_input");
    return fail(errors);
  }
}
