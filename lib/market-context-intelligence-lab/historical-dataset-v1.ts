import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";

import {
  requireMarketContextExplicitInstant,
} from "./explicit-instant-v1";

export const MARKET_CONTEXT_HISTORICAL_DATASET_VERSION =
  "market_context_historical_dataset_v1" as const;

export const MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_VERSION =
  "market_context_historical_dataset_normalizer_v1" as const;

export const MARKET_CONTEXT_HISTORICAL_DATASET_CANONICAL_JSON_VERSION =
  "market_context_historical_dataset_canonical_json_v1" as const;

export type MarketContextHistoricalDatasetRawFileV1 = {
  file_id: string;
  media_type: "application/x-ndjson";
  bytes: number;
  sha256: string;
};

export type MarketContextHistoricalDatasetSourceManifestV1 = {
  contract_version: typeof MARKET_CONTEXT_HISTORICAL_DATASET_VERSION;
  identity: {
    dataset_id: string;
    dataset_version: string;
  };
  source: {
    provider: string;
    provenance: {
      status: "documented" | "incomplete" | "unknown";
      description: string;
      source_reference: string;
    };
    usage_rights: {
      status: "documented_permitted" | "unknown" | "forbidden";
      basis: string;
      internal_research_and_replay_allowed: boolean;
    };
  };
  acquisition: {
    timestamp: string;
    method:
      | "operator_supplied_local_files"
      | "licensed_export"
      | "repository_synthetic_fixture";
  };
  normalizer_version:
    typeof MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_VERSION;
  date_range: {
    start: string;
    end: string;
    basis: "observation_utc_date";
  };
  universe: {
    tickers: string[];
    benchmark_symbols: string[];
    breadth: {
      required: true;
      source_id: string;
      expected_constituents: number;
    };
    contexts: Array<{
      level: "sector" | "industry";
      context_id: string;
      benchmark_symbol: string;
    }>;
  };
  candle: {
    interval: "1min" | "5min" | "15min" | "30min" | "1h" | "1day";
    timezone: string;
    session_calendar_policy: string;
  };
  timestamp_policy: {
    observation_timestamp: "explicit_instant_required";
    provider_source_timestamp: "explicit_instant_required";
    received_timestamp:
      | "required"
      | "documented_absence_allowed";
    received_timestamp_absence_reason: string | null;
  };
  corporate_actions: {
    policy_documented: boolean;
    split_policy: string;
    dividend_policy: string;
    adjustment_state:
      | "raw"
      | "split_adjusted"
      | "total_return_adjusted";
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
    attested: boolean;
    attestation: string;
    future_observation_policy: "reject";
    future_provider_source_policy: "reject";
    received_after_decision_policy: "reject";
  };
  sensitive_identifiers: {
    policy: "reject";
    sanitized: boolean;
    sanitization_attestation: string;
  };
  raw_files: MarketContextHistoricalDatasetRawFileV1[];
  immutable_raw_digest: string;
};

export type MarketContextHistoricalDatasetExplicitFileV1 = {
  file_id: string;
  path: string;
};

type CommonRawRow = {
  decision_id: string;
  ticker: string;
  decision_timestamp: string;
  provider: string;
  observation_timestamp: string;
  provider_source_timestamp: string | null;
  received_timestamp: string | null;
  received_timestamp_absence_reason: string | null;
};

export type MarketContextHistoricalDatasetCandleRowV1 = CommonRawRow & {
  row_type: "candle";
  domain: "benchmark" | "sector" | "industry";
  context_id: string;
  symbol: string;
  interval: MarketContextHistoricalDatasetSourceManifestV1["candle"]["interval"];
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustment_state:
    MarketContextHistoricalDatasetSourceManifestV1["corporate_actions"]["adjustment_state"];
};

export type MarketContextHistoricalDatasetBreadthRowV1 = CommonRawRow & {
  row_type: "breadth";
  domain: "breadth";
  context_id: string;
  expected_constituents: number;
  observed_constituents: number;
  advancing_fraction: number;
  above_short_average_fraction: number;
};

export type MarketContextHistoricalDatasetNormalizedRowV1 =
  | (MarketContextHistoricalDatasetCandleRowV1 & {
      lineage: {
        file_id: string;
        source_line: number;
        raw_row_sha256: string;
      };
    })
  | (MarketContextHistoricalDatasetBreadthRowV1 & {
      lineage: {
        file_id: string;
        source_line: number;
        raw_row_sha256: string;
      };
    });

export type MarketContextHistoricalDatasetDiagnosticsV1 = {
  rows_read: number;
  rows_normalized: number;
  duplicate_rows: number;
  out_of_order_rows: number;
  gap_count: number;
  missing_intervals: number;
  future_observations: number;
  future_provider_source_timestamps: number;
  received_after_decision: number;
  sensitive_identifier_rows: number;
  coverage_by_domain: {
    benchmark: number;
    breadth: number;
    sector: number;
    industry: number;
  };
  observed_rows_by_domain: {
    benchmark: number;
    breadth: number;
    sector: number;
    industry: number;
  };
  unique_decisions: number;
  unique_tickers: number;
};

export type MarketContextHistoricalDatasetManifestV1 =
  MarketContextHistoricalDatasetSourceManifestV1 & {
    immutable_normalized_digest: string;
    lineage: {
      raw_to_normalized: Array<{
        file_id: string;
        raw_sha256: string;
        raw_bytes: number;
        normalized_rows: number;
      }>;
    };
  };

export type MarketContextHistoricalDatasetNormalizationSuccessV1 = {
  status: "admissible";
  contract_version: typeof MARKET_CONTEXT_HISTORICAL_DATASET_VERSION;
  canonicalization_version:
    typeof MARKET_CONTEXT_HISTORICAL_DATASET_CANONICAL_JSON_VERSION;
  manifest: MarketContextHistoricalDatasetManifestV1;
  normalized_rows: MarketContextHistoricalDatasetNormalizedRowV1[];
  diagnostics: MarketContextHistoricalDatasetDiagnosticsV1;
  raw_integrity: {
    verified: true;
    raw_bytes_unchanged: true;
  };
  external_activity: {
    provider_traffic: false;
    internet_download: false;
    database_access: false;
    persistence: false;
  };
  replay_output_created: false;
};

export type MarketContextHistoricalDatasetNormalizationFailureV1 = {
  status: "rejected";
  contract_version: typeof MARKET_CONTEXT_HISTORICAL_DATASET_VERSION;
  error_codes: string[];
  diagnostics: MarketContextHistoricalDatasetDiagnosticsV1;
  raw_integrity: {
    verified: boolean;
    raw_bytes_unchanged: boolean;
  };
  external_activity: {
    provider_traffic: false;
    internet_download: false;
    database_access: false;
    persistence: false;
  };
  replay_output_created: false;
};

export type MarketContextHistoricalDatasetNormalizationResultV1 =
  | MarketContextHistoricalDatasetNormalizationSuccessV1
  | MarketContextHistoricalDatasetNormalizationFailureV1;

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

type ParsedRow = {
  row: Record<string, unknown>;
  file_id: string;
  source_line: number;
  raw_row_sha256: string;
  source_sequence: number;
};

const commonRowFields = new Set([
  "row_type",
  "domain",
  "decision_id",
  "ticker",
  "decision_timestamp",
  "provider",
  "observation_timestamp",
  "provider_source_timestamp",
  "received_timestamp",
  "received_timestamp_absence_reason",
  "context_id",
]);

const candleRowFields = new Set([
  ...commonRowFields,
  "symbol",
  "interval",
  "open",
  "high",
  "low",
  "close",
  "volume",
  "adjustment_state",
]);

const breadthRowFields = new Set([
  ...commonRowFields,
  "expected_constituents",
  "observed_constituents",
  "advancing_fraction",
  "above_short_average_fraction",
]);

const operationalIdentifierField =
  /(^|_)(fetch_run_id|run_id|request_id|trace_id|span_id|account_id|user_id|recommendation_id|source_row_id|job_id)($|_)/i;
const credentialField =
  /(^|_)(api_key|access_token|refresh_token|password|secret|authorization|service_role|private_key)($|_)/i;
const credentialValue =
  /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/;
const uuidValue =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJsonValue(value: unknown): JsonValue {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error(
      "market_context_historical_dataset_v1_non_finite_json_value",
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
  throw new Error("market_context_historical_dataset_v1_non_json_value");
}

export function stableMarketContextHistoricalDatasetJsonV1(value: unknown) {
  return JSON.stringify(canonicalJsonValue(value));
}

function identifier(value: unknown) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function fraction(value: unknown): value is number {
  return finiteNumber(value) && value >= 0 && value <= 1;
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

function intervalMilliseconds(
  interval: MarketContextHistoricalDatasetSourceManifestV1["candle"]["interval"],
) {
  return {
    "1min": 60_000,
    "5min": 300_000,
    "15min": 900_000,
    "30min": 1_800_000,
    "1h": 3_600_000,
    "1day": 86_400_000,
  }[interval];
}

function emptyDiagnostics(): MarketContextHistoricalDatasetDiagnosticsV1 {
  return {
    rows_read: 0,
    rows_normalized: 0,
    duplicate_rows: 0,
    out_of_order_rows: 0,
    gap_count: 0,
    missing_intervals: 0,
    future_observations: 0,
    future_provider_source_timestamps: 0,
    received_after_decision: 0,
    sensitive_identifier_rows: 0,
    coverage_by_domain: {
      benchmark: 0,
      breadth: 0,
      sector: 0,
      industry: 0,
    },
    observed_rows_by_domain: {
      benchmark: 0,
      breadth: 0,
      sector: 0,
      industry: 0,
    },
    unique_decisions: 0,
    unique_tickers: 0,
  };
}

function failure(
  errors: Set<string>,
  diagnostics: MarketContextHistoricalDatasetDiagnosticsV1,
  rawIntegrity: {
    verified: boolean;
    raw_bytes_unchanged: boolean;
  },
): MarketContextHistoricalDatasetNormalizationFailureV1 {
  return {
    status: "rejected",
    contract_version: MARKET_CONTEXT_HISTORICAL_DATASET_VERSION,
    error_codes: Array.from(errors).sort((first, second) =>
      first.localeCompare(second),
    ),
    diagnostics,
    raw_integrity: rawIntegrity,
    external_activity: {
      provider_traffic: false,
      internet_download: false,
      database_access: false,
      persistence: false,
    },
    replay_output_created: false,
  };
}

export function buildMarketContextHistoricalRawFileDescriptorV1(
  fileId: string,
  rawBytes: string | Uint8Array,
): MarketContextHistoricalDatasetRawFileV1 {
  if (!identifier(fileId)) {
    throw new Error(
      "market_context_historical_dataset_v1_invalid_file_id",
    );
  }
  const bytes =
    typeof rawBytes === "string"
      ? Buffer.from(rawBytes, "utf8")
      : Buffer.from(rawBytes);
  return {
    file_id: fileId,
    media_type: "application/x-ndjson",
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
  };
}

export function computeMarketContextHistoricalRawDigestV1(
  rawFiles: MarketContextHistoricalDatasetRawFileV1[],
) {
  const normalized = rawFiles
    .map((file) => ({ ...file }))
    .sort((first, second) => first.file_id.localeCompare(second.file_id));
  return sha256(stableMarketContextHistoricalDatasetJsonV1(normalized));
}

function validateManifest(
  manifest: MarketContextHistoricalDatasetSourceManifestV1,
  errors: Set<string>,
) {
  if (
    manifest.contract_version !==
    MARKET_CONTEXT_HISTORICAL_DATASET_VERSION
  ) {
    errors.add("dataset_contract_version_invalid");
  }
  if (
    manifest.normalizer_version !==
    MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_VERSION
  ) {
    errors.add("normalizer_version_invalid");
  }
  if (
    !identifier(manifest.identity?.dataset_id) ||
    !identifier(manifest.identity?.dataset_version)
  ) {
    errors.add("dataset_identity_invalid");
  }
  if (
    !identifier(manifest.source?.provider) ||
    manifest.source?.provenance?.status !== "documented" ||
    !identifier(manifest.source?.provenance?.description) ||
    !identifier(manifest.source?.provenance?.source_reference)
  ) {
    errors.add("provenance_incomplete");
  }
  if (
    manifest.source?.usage_rights?.status !== "documented_permitted" ||
    manifest.source?.usage_rights?.internal_research_and_replay_allowed !==
      true ||
    !identifier(manifest.source?.usage_rights?.basis)
  ) {
    errors.add("usage_rights_not_documented_permitted");
  }
  try {
    requireMarketContextExplicitInstant(
      manifest.acquisition?.timestamp,
      "acquisition.timestamp",
    );
  } catch {
    errors.add("acquisition_timestamp_invalid");
  }
  if (
    manifest.acquisition?.method !== "operator_supplied_local_files" &&
    manifest.acquisition?.method !== "licensed_export" &&
    manifest.acquisition?.method !== "repository_synthetic_fixture"
  ) {
    errors.add("acquisition_method_invalid");
  }
  if (
    !validDate(manifest.date_range?.start) ||
    !validDate(manifest.date_range?.end) ||
    manifest.date_range?.start > manifest.date_range?.end ||
    manifest.date_range?.basis !== "observation_utc_date"
  ) {
    errors.add("date_range_invalid");
  }
  if (
    !Array.isArray(manifest.universe?.tickers) ||
    manifest.universe.tickers.length === 0 ||
    manifest.universe.tickers.some((ticker) => !identifier(ticker))
  ) {
    errors.add("ticker_universe_invalid");
  }
  const benchmarks = new Set(manifest.universe?.benchmark_symbols ?? []);
  if (!benchmarks.has("SPY") || !benchmarks.has("QQQ")) {
    errors.add("required_benchmarks_missing");
  }
  if (
    manifest.universe?.breadth?.required !== true ||
    !identifier(manifest.universe?.breadth?.source_id) ||
    !Number.isInteger(
      manifest.universe?.breadth?.expected_constituents,
    ) ||
    manifest.universe.breadth.expected_constituents <= 0
  ) {
    errors.add("breadth_declaration_invalid");
  }
  if (
    !Array.isArray(manifest.universe?.contexts) ||
    manifest.universe.contexts.length === 0 ||
    manifest.universe.contexts.some(
      (context) =>
        (context.level !== "sector" && context.level !== "industry") ||
        !identifier(context.context_id) ||
        !identifier(context.benchmark_symbol),
    )
  ) {
    errors.add("context_universe_invalid");
  }
  if (
    !identifier(manifest.candle?.timezone) ||
    !identifier(manifest.candle?.session_calendar_policy) ||
    !intervalMilliseconds(manifest.candle?.interval)
  ) {
    errors.add("candle_policy_invalid");
  }
  if (
    manifest.timestamp_policy?.observation_timestamp !==
      "explicit_instant_required" ||
    manifest.timestamp_policy?.provider_source_timestamp !==
      "explicit_instant_required" ||
    (manifest.timestamp_policy?.received_timestamp !== "required" &&
      manifest.timestamp_policy?.received_timestamp !==
        "documented_absence_allowed") ||
    (manifest.timestamp_policy?.received_timestamp ===
      "documented_absence_allowed" &&
      !identifier(
        manifest.timestamp_policy.received_timestamp_absence_reason,
      ))
  ) {
    errors.add("timestamp_policy_invalid");
  }
  if (
    manifest.corporate_actions?.policy_documented !== true ||
    !identifier(manifest.corporate_actions?.split_policy) ||
    !identifier(manifest.corporate_actions?.dividend_policy)
  ) {
    errors.add("corporate_action_policy_missing");
  }
  const domains = [
    "benchmark",
    "breadth",
    "sector",
    "industry",
  ] as const;
  for (const domain of domains) {
    const expected =
      manifest.quality?.expected_rows_by_domain?.[domain];
    const minimum =
      manifest.quality?.minimum_coverage_by_domain?.[domain];
    if (
      !Number.isInteger(expected) ||
      expected < 0 ||
      !fraction(minimum)
    ) {
      errors.add(`quality_policy_invalid:${domain}`);
    }
  }
  if (
    !identifier(manifest.quality?.missingness_policy) ||
    manifest.quality?.duplicate_policy !== "reject" ||
    manifest.quality?.out_of_order_policy !== "sort_and_report"
  ) {
    errors.add("quality_policy_invalid");
  }
  if (
    manifest.point_in_time?.attested !== true ||
    !identifier(manifest.point_in_time?.attestation) ||
    manifest.point_in_time?.future_observation_policy !== "reject" ||
    manifest.point_in_time?.future_provider_source_policy !== "reject" ||
    manifest.point_in_time?.received_after_decision_policy !== "reject"
  ) {
    errors.add("point_in_time_attestation_invalid");
  }
  if (
    manifest.sensitive_identifiers?.policy !== "reject" ||
    manifest.sensitive_identifiers?.sanitized !== true ||
    !identifier(
      manifest.sensitive_identifiers?.sanitization_attestation,
    )
  ) {
    errors.add("sensitive_identifier_policy_invalid");
  }
  if (
    !Array.isArray(manifest.raw_files) ||
    manifest.raw_files.length === 0 ||
    !/^[0-9a-f]{64}$/.test(manifest.immutable_raw_digest ?? "")
  ) {
    errors.add("raw_file_manifest_invalid");
  } else if (
    new Set(manifest.raw_files.map((file) => file.file_id)).size !==
      manifest.raw_files.length ||
    manifest.raw_files.some(
      (file) =>
        !identifier(file.file_id) ||
        file.media_type !== "application/x-ndjson" ||
        !Number.isInteger(file.bytes) ||
        file.bytes <= 0 ||
        !/^[0-9a-f]{64}$/.test(file.sha256),
    )
  ) {
    errors.add("raw_file_manifest_invalid");
  }
}

function sensitiveValue(value: unknown): boolean {
  if (typeof value === "string") {
    return credentialValue.test(value) || uuidValue.test(value);
  }
  if (Array.isArray(value)) return value.some(sensitiveValue);
  if (value && typeof value === "object") {
    return Object.entries(value).some(
      ([key, child]) =>
        operationalIdentifierField.test(key) ||
        credentialField.test(key) ||
        sensitiveValue(child),
    );
  }
  return false;
}

function explicitInstant(
  value: unknown,
  field: string,
  errors: Set<string>,
) {
  try {
    return requireMarketContextExplicitInstant(
      value,
      field,
    ).canonical_timestamp;
  } catch {
    errors.add(`invalid_explicit_instant:${field}`);
    return null;
  }
}

function normalizeParsedRow(
  parsed: ParsedRow,
  manifest: MarketContextHistoricalDatasetSourceManifestV1,
  errors: Set<string>,
  diagnostics: MarketContextHistoricalDatasetDiagnosticsV1,
): MarketContextHistoricalDatasetNormalizedRowV1 | null {
  const raw = parsed.row;
  if (sensitiveValue(raw)) {
    diagnostics.sensitive_identifier_rows += 1;
    errors.add("production_or_operational_identifier_detected");
  }
  const allowed =
    raw.row_type === "candle" ? candleRowFields : breadthRowFields;
  if (Object.keys(raw).some((field) => !allowed.has(field))) {
    errors.add("row_contains_unknown_or_forbidden_field");
  }
  if (
    !identifier(raw.decision_id) ||
    !identifier(raw.ticker) ||
    !identifier(raw.provider) ||
    !identifier(raw.context_id) ||
    !manifest.universe.tickers.includes(String(raw.ticker)) ||
    raw.provider !== manifest.source.provider
  ) {
    errors.add("row_identity_invalid");
    return null;
  }

  const decisionTimestamp = explicitInstant(
    raw.decision_timestamp,
    "row.decision_timestamp",
    errors,
  );
  const observationTimestamp = explicitInstant(
    raw.observation_timestamp,
    "row.observation_timestamp",
    errors,
  );
  const providerSourceTimestamp =
    raw.provider_source_timestamp === null ||
    raw.provider_source_timestamp === undefined
      ? null
      : explicitInstant(
          raw.provider_source_timestamp,
          "row.provider_source_timestamp",
          errors,
        );
  const receivedTimestamp =
    raw.received_timestamp === null ||
    raw.received_timestamp === undefined
      ? null
      : explicitInstant(
          raw.received_timestamp,
          "row.received_timestamp",
          errors,
        );
  if (providerSourceTimestamp === null) {
    errors.add("provider_source_timestamp_missing");
  }
  if (
    receivedTimestamp === null &&
    (manifest.timestamp_policy.received_timestamp === "required" ||
      !identifier(raw.received_timestamp_absence_reason) ||
      raw.received_timestamp_absence_reason !==
        manifest.timestamp_policy.received_timestamp_absence_reason)
  ) {
    errors.add("received_timestamp_missing_without_documented_absence");
  }
  if (
    receivedTimestamp !== null &&
    raw.received_timestamp_absence_reason !== null &&
    raw.received_timestamp_absence_reason !== undefined
  ) {
    errors.add("received_timestamp_absence_reason_contradictory");
  }
  if (
    decisionTimestamp === null ||
    observationTimestamp === null ||
    providerSourceTimestamp === null
  ) {
    return null;
  }

  const decisionMs = Date.parse(decisionTimestamp);
  if (Date.parse(observationTimestamp) > decisionMs) {
    diagnostics.future_observations += 1;
    errors.add("future_observation_leakage");
  }
  if (Date.parse(providerSourceTimestamp) > decisionMs) {
    diagnostics.future_provider_source_timestamps += 1;
    errors.add("future_provider_source_leakage");
  }
  if (
    receivedTimestamp !== null &&
    Date.parse(receivedTimestamp) > decisionMs
  ) {
    diagnostics.received_after_decision += 1;
    errors.add("received_after_decision_leakage");
  }
  if (
    receivedTimestamp !== null &&
    Date.parse(receivedTimestamp) <
      Date.parse(providerSourceTimestamp)
  ) {
    errors.add("received_before_provider_source");
  }
  const observationDate = observationTimestamp.slice(0, 10);
  if (
    observationDate < manifest.date_range.start ||
    observationDate > manifest.date_range.end
  ) {
    errors.add("observation_outside_declared_date_range");
  }

  const common = {
    decision_id: String(raw.decision_id),
    ticker: String(raw.ticker),
    decision_timestamp: decisionTimestamp,
    provider: String(raw.provider),
    observation_timestamp: observationTimestamp,
    provider_source_timestamp: providerSourceTimestamp,
    received_timestamp: receivedTimestamp,
    received_timestamp_absence_reason:
      receivedTimestamp === null
        ? String(raw.received_timestamp_absence_reason)
        : null,
    context_id: String(raw.context_id),
    lineage: {
      file_id: parsed.file_id,
      source_line: parsed.source_line,
      raw_row_sha256: parsed.raw_row_sha256,
    },
  };

  if (raw.row_type === "breadth" && raw.domain === "breadth") {
    if (
      raw.context_id !== manifest.universe.breadth.source_id ||
      !Number.isInteger(raw.expected_constituents) ||
      Number(raw.expected_constituents) <= 0 ||
      !Number.isInteger(raw.observed_constituents) ||
      Number(raw.observed_constituents) < 0 ||
      Number(raw.observed_constituents) >
        Number(raw.expected_constituents) ||
      !fraction(raw.advancing_fraction) ||
      !fraction(raw.above_short_average_fraction)
    ) {
      errors.add("breadth_row_invalid");
      return null;
    }
    return {
      ...common,
      row_type: "breadth",
      domain: "breadth",
      expected_constituents: Number(raw.expected_constituents),
      observed_constituents: Number(raw.observed_constituents),
      advancing_fraction: raw.advancing_fraction,
      above_short_average_fraction:
        raw.above_short_average_fraction,
    };
  }

  if (
    raw.row_type !== "candle" ||
    (raw.domain !== "benchmark" &&
      raw.domain !== "sector" &&
      raw.domain !== "industry") ||
    !identifier(raw.symbol) ||
    raw.interval !== manifest.candle.interval ||
    raw.adjustment_state !==
      manifest.corporate_actions.adjustment_state ||
    !finiteNumber(raw.open) ||
    !finiteNumber(raw.high) ||
    !finiteNumber(raw.low) ||
    !finiteNumber(raw.close) ||
    !finiteNumber(raw.volume) ||
    raw.volume < 0 ||
    raw.high < raw.low ||
    raw.high < raw.open ||
    raw.high < raw.close ||
    raw.low > raw.open ||
    raw.low > raw.close
  ) {
    errors.add("candle_row_invalid");
    return null;
  }
  const symbol = String(raw.symbol);
  if (
    raw.domain === "benchmark" &&
    !manifest.universe.benchmark_symbols.includes(symbol)
  ) {
    errors.add("benchmark_symbol_not_declared");
  }
  if (raw.domain === "sector" || raw.domain === "industry") {
    const declared = manifest.universe.contexts.some(
      (context) =>
        context.level === raw.domain &&
        context.context_id === String(raw.context_id) &&
        context.benchmark_symbol === symbol,
    );
    if (!declared) errors.add("context_row_not_declared");
  }
  return {
    ...common,
    row_type: "candle",
    domain: raw.domain,
    symbol,
    interval: manifest.candle.interval,
    open: raw.open,
    high: raw.high,
    low: raw.low,
    close: raw.close,
    volume: raw.volume,
    adjustment_state: manifest.corporate_actions.adjustment_state,
  };
}

function rowSortKey(row: MarketContextHistoricalDatasetNormalizedRowV1) {
  return [
    row.decision_timestamp,
    row.decision_id,
    row.ticker,
    row.domain,
    row.context_id,
    row.row_type === "candle" ? row.symbol : "",
    row.observation_timestamp,
    stableMarketContextHistoricalDatasetJsonV1(row),
  ].join("|");
}

function populateDiagnostics(
  normalizedRows: MarketContextHistoricalDatasetNormalizedRowV1[],
  parsedRows: ParsedRow[],
  manifest: MarketContextHistoricalDatasetSourceManifestV1,
  diagnostics: MarketContextHistoricalDatasetDiagnosticsV1,
  errors: Set<string>,
) {
  const sourceSequence = new Map(
    parsedRows.map((parsed) => [
      `${parsed.file_id}|${parsed.source_line}`,
      parsed.source_sequence,
    ]),
  );
  const groups = new Map<
    string,
    MarketContextHistoricalDatasetNormalizedRowV1[]
  >();
  const duplicateKeys = new Map<string, number>();
  for (const row of normalizedRows) {
    diagnostics.observed_rows_by_domain[row.domain] += 1;
    const symbol = row.row_type === "candle" ? row.symbol : "";
    const key = [
      row.decision_id,
      row.domain,
      row.context_id,
      symbol,
      row.observation_timestamp,
    ].join("|");
    duplicateKeys.set(key, (duplicateKeys.get(key) ?? 0) + 1);
    const groupKey = [
      row.decision_id,
      row.domain,
      row.context_id,
      symbol,
    ].join("|");
    const group = groups.get(groupKey) ?? [];
    group.push(row);
    groups.set(groupKey, group);
  }
  diagnostics.duplicate_rows = Array.from(duplicateKeys.values()).reduce(
    (sum, count) => sum + Math.max(0, count - 1),
    0,
  );
  if (diagnostics.duplicate_rows > 0) {
    errors.add("duplicate_rows_rejected");
  }
  const intervalMs = intervalMilliseconds(manifest.candle.interval);
  for (const group of groups.values()) {
    const sourceOrdered = [...group].sort((first, second) => {
      const firstSequence =
        sourceSequence.get(
          `${first.lineage.file_id}|${first.lineage.source_line}`,
        ) ?? 0;
      const secondSequence =
        sourceSequence.get(
          `${second.lineage.file_id}|${second.lineage.source_line}`,
        ) ?? 0;
      return firstSequence - secondSequence;
    });
    for (let index = 1; index < sourceOrdered.length; index += 1) {
      const previous = sourceOrdered[index - 1];
      const current = sourceOrdered[index];
      if (
        previous &&
        current &&
        current.observation_timestamp < previous.observation_timestamp
      ) {
        diagnostics.out_of_order_rows += 1;
      }
    }
    if (group[0]?.row_type !== "candle") continue;
    const timeOrdered = [...group].sort((first, second) =>
      first.observation_timestamp.localeCompare(
        second.observation_timestamp,
      ),
    );
    for (let index = 1; index < timeOrdered.length; index += 1) {
      const previous = timeOrdered[index - 1];
      const current = timeOrdered[index];
      if (!previous || !current) continue;
      const difference =
        Date.parse(current.observation_timestamp) -
        Date.parse(previous.observation_timestamp);
      if (difference > intervalMs) {
        diagnostics.gap_count += 1;
        diagnostics.missing_intervals +=
          Math.floor(difference / intervalMs) - 1;
      }
    }
  }
  const domains = [
    "benchmark",
    "breadth",
    "sector",
    "industry",
  ] as const;
  for (const domain of domains) {
    const expected =
      manifest.quality.expected_rows_by_domain[domain];
    const observed = diagnostics.observed_rows_by_domain[domain];
    const coverage =
      expected === 0 ? (observed === 0 ? 1 : 0) : observed / expected;
    diagnostics.coverage_by_domain[domain] = Number(
      Math.min(1, coverage).toFixed(6),
    );
    if (
      coverage <
      manifest.quality.minimum_coverage_by_domain[domain]
    ) {
      errors.add(`coverage_below_minimum:${domain}`);
    }
  }

  const decisions = new Map<
    string,
    MarketContextHistoricalDatasetNormalizedRowV1[]
  >();
  for (const row of normalizedRows) {
    const decisionRows = decisions.get(row.decision_id) ?? [];
    decisionRows.push(row);
    decisions.set(row.decision_id, decisionRows);
  }
  for (const [decisionId, decisionRows] of decisions) {
    for (const symbol of ["SPY", "QQQ"]) {
      if (
        !decisionRows.some(
          (row) =>
            row.row_type === "candle" &&
            row.domain === "benchmark" &&
            row.symbol === symbol,
        )
      ) {
        errors.add(`decision_required_benchmark_missing:${decisionId}:${symbol}`);
      }
    }
    if (!decisionRows.some((row) => row.domain === "breadth")) {
      errors.add(`decision_breadth_missing:${decisionId}`);
    }
    for (const context of manifest.universe.contexts) {
      if (
        !decisionRows.some(
          (row) =>
            row.row_type === "candle" &&
            row.domain === context.level &&
            row.context_id === context.context_id &&
            row.symbol === context.benchmark_symbol,
        )
      ) {
        errors.add(
          `decision_context_missing:${decisionId}:${context.level}:${context.context_id}`,
        );
      }
    }
  }
  diagnostics.unique_decisions = decisions.size;
  const observedTickers = new Set(
    normalizedRows.map((row) => row.ticker),
  );
  diagnostics.unique_tickers = observedTickers.size;
  for (const ticker of manifest.universe.tickers) {
    if (!observedTickers.has(ticker)) {
      errors.add(`declared_ticker_missing:${ticker}`);
    }
  }
}

function parseRawFiles(
  explicitFiles: MarketContextHistoricalDatasetExplicitFileV1[],
  manifest: MarketContextHistoricalDatasetSourceManifestV1,
  errors: Set<string>,
) {
  const parsedRows: ParsedRow[] = [];
  const rawBefore = new Map<string, Buffer>();
  const actualDescriptors: MarketContextHistoricalDatasetRawFileV1[] = [];
  const explicitById = new Map<string, string>();
  let sourceSequence = 0;

  for (const explicit of explicitFiles) {
    if (
      !identifier(explicit.file_id) ||
      !identifier(explicit.path) ||
      explicitById.has(explicit.file_id)
    ) {
      errors.add("explicit_file_mapping_invalid");
      continue;
    }
    explicitById.set(explicit.file_id, explicit.path);
  }
  const declaredIds = new Set(
    (manifest.raw_files ?? []).map((file) => file.file_id),
  );
  if (
    explicitById.size !== declaredIds.size ||
    Array.from(explicitById.keys()).some(
      (fileId) => !declaredIds.has(fileId),
    )
  ) {
    errors.add("explicit_file_set_mismatch");
  }

  for (const declared of manifest.raw_files ?? []) {
    const path = explicitById.get(declared.file_id);
    if (!path) continue;
    try {
      if (!statSync(path).isFile()) {
        errors.add(`explicit_input_not_file:${declared.file_id}`);
        continue;
      }
      const bytes = readFileSync(path);
      rawBefore.set(declared.file_id, bytes);
      const actual =
        buildMarketContextHistoricalRawFileDescriptorV1(
          declared.file_id,
          bytes,
        );
      actualDescriptors.push(actual);
      if (
        declared.media_type !== "application/x-ndjson" ||
        actual.sha256 !== declared.sha256 ||
        actual.bytes !== declared.bytes
      ) {
        errors.add(`raw_file_digest_mismatch:${declared.file_id}`);
      }
      const text = bytes.toString("utf8");
      const lines = text.split(/\r?\n/);
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        if (!line?.trim()) continue;
        sourceSequence += 1;
        try {
          const value = JSON.parse(line);
          if (
            value === null ||
            Array.isArray(value) ||
            typeof value !== "object"
          ) {
            errors.add(`raw_row_not_object:${declared.file_id}:${index + 1}`);
            continue;
          }
          parsedRows.push({
            row: value as Record<string, unknown>,
            file_id: declared.file_id,
            source_line: index + 1,
            raw_row_sha256: sha256(line),
            source_sequence: sourceSequence,
          });
        } catch {
          errors.add(`raw_row_json_invalid:${declared.file_id}:${index + 1}`);
        }
      }
    } catch {
      errors.add(`explicit_input_unreadable:${declared.file_id}`);
    }
  }
  const computedRawDigest =
    computeMarketContextHistoricalRawDigestV1(actualDescriptors);
  if (computedRawDigest !== manifest.immutable_raw_digest) {
    errors.add("immutable_raw_digest_mismatch");
  }
  let rawBytesUnchanged = true;
  for (const [fileId, before] of rawBefore) {
    const path = explicitById.get(fileId);
    if (!path) continue;
    try {
      const after = readFileSync(path);
      if (!before.equals(after)) rawBytesUnchanged = false;
    } catch {
      rawBytesUnchanged = false;
    }
  }
  if (!rawBytesUnchanged) errors.add("raw_bytes_changed_during_normalization");
  return {
    parsedRows,
    actualDescriptors,
    rawBytesUnchanged,
  };
}

export function normalizeMarketContextHistoricalDatasetFilesV1(input: {
  manifest_path: string;
  data_files: MarketContextHistoricalDatasetExplicitFileV1[];
}): MarketContextHistoricalDatasetNormalizationResultV1 {
  const errors = new Set<string>();
  const diagnostics = emptyDiagnostics();
  let manifest: MarketContextHistoricalDatasetSourceManifestV1;
  try {
    if (!statSync(input.manifest_path).isFile()) {
      errors.add("manifest_path_not_file");
      return failure(errors, diagnostics, {
        verified: false,
        raw_bytes_unchanged: true,
      });
    }
    manifest = JSON.parse(
      readFileSync(input.manifest_path, "utf8"),
    ) as MarketContextHistoricalDatasetSourceManifestV1;
  } catch {
    errors.add("manifest_unreadable_or_invalid_json");
    return failure(errors, diagnostics, {
      verified: false,
      raw_bytes_unchanged: true,
    });
  }

  validateManifest(manifest, errors);
  if (errors.size > 0) {
    return failure(errors, diagnostics, {
      verified: false,
      raw_bytes_unchanged: true,
    });
  }
  if (
    !Array.isArray(manifest.raw_files) ||
    manifest.raw_files.length === 0
  ) {
    return failure(errors, diagnostics, {
      verified: false,
      raw_bytes_unchanged: true,
    });
  }
  const parsed = parseRawFiles(input.data_files, manifest, errors);
  diagnostics.rows_read = parsed.parsedRows.length;
  const normalizedRows = parsed.parsedRows
    .map((row) =>
      normalizeParsedRow(row, manifest, errors, diagnostics),
    )
    .filter(
      (
        row,
      ): row is MarketContextHistoricalDatasetNormalizedRowV1 =>
        row !== null,
    );
  normalizedRows.sort((first, second) =>
    rowSortKey(first).localeCompare(rowSortKey(second)),
  );
  diagnostics.rows_normalized = normalizedRows.length;
  populateDiagnostics(
    normalizedRows,
    parsed.parsedRows,
    manifest,
    diagnostics,
    errors,
  );

  if (errors.size > 0) {
    return failure(errors, diagnostics, {
      verified:
        !errors.has("immutable_raw_digest_mismatch") &&
        !Array.from(errors).some((error) =>
          error.startsWith("raw_file_digest_mismatch:"),
        ),
      raw_bytes_unchanged: parsed.rawBytesUnchanged,
    });
  }

  const lineage = {
    raw_to_normalized: parsed.actualDescriptors
      .map((file) => ({
        file_id: file.file_id,
        raw_sha256: file.sha256,
        raw_bytes: file.bytes,
        normalized_rows: normalizedRows.filter(
          (row) => row.lineage.file_id === file.file_id,
        ).length,
      }))
      .sort((first, second) =>
        first.file_id.localeCompare(second.file_id),
      ),
  };
  const manifestWithoutNormalizedDigest = {
    ...manifest,
    raw_files: manifest.raw_files
      .map((file) => ({ ...file }))
      .sort((first, second) =>
        first.file_id.localeCompare(second.file_id),
      ),
    lineage,
  };
  const immutableNormalizedDigest = sha256(
    stableMarketContextHistoricalDatasetJsonV1({
      manifest: manifestWithoutNormalizedDigest,
      normalized_rows: normalizedRows,
    }),
  );
  return {
    status: "admissible",
    contract_version: MARKET_CONTEXT_HISTORICAL_DATASET_VERSION,
    canonicalization_version:
      MARKET_CONTEXT_HISTORICAL_DATASET_CANONICAL_JSON_VERSION,
    manifest: {
      ...manifestWithoutNormalizedDigest,
      immutable_normalized_digest: immutableNormalizedDigest,
    },
    normalized_rows: normalizedRows,
    diagnostics,
    raw_integrity: {
      verified: true,
      raw_bytes_unchanged: true,
    },
    external_activity: {
      provider_traffic: false,
      internet_download: false,
      database_access: false,
      persistence: false,
    },
    replay_output_created: false,
  };
}
