import { createHash } from "node:crypto";

import {
  MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1,
  type MarketContextTradeM1BindingResultV2,
} from "./trade-to-candle-m1-binding-v2";
import {
  MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1,
  MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2,
  stableMarketContextTradePreparationJsonV2,
  type MarketContextTradePreparationSuccessV2,
} from "./trade-to-candle-preparation-v2";

export const MARKET_CONTEXT_HISTORICAL_DATASET_NS_RECEIVER_V1 =
  "market_context_historical_dataset_nanosecond_receiver_v1" as const;
export const MARKET_CONTEXT_HISTORICAL_DATASET_NS_CANONICAL_JSON_V1 =
  "market_context_historical_dataset_nanosecond_canonical_json_v1" as const;
export const MARKET_CONTEXT_DBN_EXTRACTION_LINEAGE_V1 =
  "market_context_databento_dbn_extraction_lineage_v1" as const;

const sha256Pattern = /^[0-9a-f]{64}$/;
const canonicalUnsignedInteger = /^(0|[1-9][0-9]*)$/;
const maxUint64 = BigInt("18446744073709551615");

type BindableResult = Extract<
  MarketContextTradeM1BindingResultV2,
  { status: "bindable" }
>;

export type MarketContextHistoricalNanosecondReceiverMetadataV1 = {
  receiver_version:
    typeof MARKET_CONTEXT_HISTORICAL_DATASET_NS_RECEIVER_V1;
  extension_version:
    typeof MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1;
  canonicalization_version:
    typeof MARKET_CONTEXT_HISTORICAL_DATASET_NS_CANONICAL_JSON_V1;
  provider_revision: {
    provider_build: string;
    encoder_build: string;
    dataset_revision: string;
    revision_evidence_reference: string;
    revision_evidence_sha256: string;
  };
  stable_tiebreak_evidence: {
    status: "documented_stable";
    policy_reference: string;
    evidence_sha256: string;
  };
  license_reference: {
    status: "written_confirmed";
    reference_id: string;
    evidence_sha256: string;
  };
  publisher_semantics: {
    publisher_id: 95;
    required_action: "T";
    allowed_flags_mask: 129;
    conditions_policy: "empty_only_fail_closed";
    unknown_action_policy: "reject";
    unknown_flag_policy: "reject";
    unknown_sale_condition_policy: "reject";
  };
  source_files: Array<{
    source_file_id: string;
    media_type: "application/vnd.databento.dbn";
    compression: "zstd";
    compressed_bytes: number;
    compressed_sha256: string;
    uncompressed_bytes: number;
    uncompressed_sha256: string;
  }>;
  extraction_lineage: Array<{
    normalized_file_id: string;
    source_file_id: string;
    extraction_policy_version:
      typeof MARKET_CONTEXT_DBN_EXTRACTION_LINEAGE_V1;
    decoder_build: string;
    lineage_sha256: string;
  }>;
};

type SourceLineageV1 = {
  raw_record_id: string;
  raw_record_sha256: string;
  source_position: number;
  sequence_uint32: number;
  tie_break_id: string;
  ts_event_unix_ns: string;
  ts_recv_unix_ns: string;
  normalized_file_id: string;
  normalized_file_sha256: string;
  source_file_id: string;
  source_file_compressed_sha256: string;
  source_file_uncompressed_sha256: string;
  source_line: number;
};

export type MarketContextHistoricalNanosecondRowV1 =
  | (BindableResult["candle_rows"][number] & {
      source_lineage: SourceLineageV1[];
    })
  | (BindableResult["breadth_rows"][number] & {
      source_lineage: {
        source_digest: string;
      };
    });

type DomainCoverageV1 = {
  expected_rows: number;
  observed_rows: number;
  coverage: number;
  first_observation_unix_ns: string | null;
  last_observation_unix_ns: string | null;
  first_provider_source_unix_ns: string | null;
  last_provider_source_unix_ns: string | null;
  first_received_unix_ns: string | null;
  last_received_unix_ns: string | null;
  rows_digest: string;
};

export type MarketContextHistoricalNanosecondReceiverResultV1 =
  | {
      status: "received";
      receiver_version:
        typeof MARKET_CONTEXT_HISTORICAL_DATASET_NS_RECEIVER_V1;
      target_contract_version: "market_context_historical_dataset_v1";
      extension_version:
        typeof MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1;
      timestamp_version:
        typeof MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1;
      canonicalization_version:
        typeof MARKET_CONTEXT_HISTORICAL_DATASET_NS_CANONICAL_JSON_V1;
      manifest: {
        provider_revision:
          MarketContextHistoricalNanosecondReceiverMetadataV1["provider_revision"];
        stable_tiebreak_evidence:
          MarketContextHistoricalNanosecondReceiverMetadataV1["stable_tiebreak_evidence"];
        license_reference:
          MarketContextHistoricalNanosecondReceiverMetadataV1["license_reference"];
        publisher_semantics:
          MarketContextHistoricalNanosecondReceiverMetadataV1["publisher_semantics"];
        source_files:
          MarketContextHistoricalNanosecondReceiverMetadataV1["source_files"];
        extraction_lineage:
          MarketContextHistoricalNanosecondReceiverMetadataV1["extraction_lineage"];
        normalized_raw_files:
          BindableResult["metadata"]["raw_files"];
        watermark: {
          policy_version:
            typeof MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2;
          evidence_status: "empirically_unvalidated";
          calibrated: false;
        };
      };
      normalized_rows: MarketContextHistoricalNanosecondRowV1[];
      coverage: {
        benchmark: DomainCoverageV1;
        breadth: DomainCoverageV1;
        sector: DomainCoverageV1;
        industry: DomainCoverageV1;
      };
      digests: {
        upstream_binding_digest: string;
        raw_lineage_digest: string;
        normalized_rows_digest: string;
        coverage_digest: string;
        receiver_digest: string;
      };
      input_immutable: true;
      metadata_inferred: false;
      m1_extension_materialized: true;
      canonical_binding_performed: false;
      replay_performed: false;
      shadow_only: true;
      live_ranking_effect: false;
    }
  | {
      status: "not_bindable";
      receiver_version:
        typeof MARKET_CONTEXT_HISTORICAL_DATASET_NS_RECEIVER_V1;
      error_codes: string[];
      input_immutable: true;
      metadata_inferred: false;
      m1_extension_materialized: false;
      canonical_binding_performed: false;
      replay_performed: false;
      shadow_only: true;
      live_ranking_effect: false;
    };

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function identifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
}

function validSha256(value: unknown): value is string {
  return typeof value === "string" && sha256Pattern.test(value);
}

function validPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function parseNs(value: unknown) {
  if (
    typeof value !== "string" ||
    !canonicalUnsignedInteger.test(value)
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

function fail(
  errors: Set<string>,
): MarketContextHistoricalNanosecondReceiverResultV1 {
  return {
    status: "not_bindable",
    receiver_version:
      MARKET_CONTEXT_HISTORICAL_DATASET_NS_RECEIVER_V1,
    error_codes: [...errors].sort((left, right) =>
      left.localeCompare(right),
    ),
    input_immutable: true,
    metadata_inferred: false,
    m1_extension_materialized: false,
    canonical_binding_performed: false,
    replay_performed: false,
    shadow_only: true,
    live_ranking_effect: false,
  };
}

function verifyUpstreamBinding(bound: BindableResult) {
  const core = { ...bound } as Partial<BindableResult>;
  delete core.status;
  delete core.normalized_digest;
  return (
    sha256(stableMarketContextTradePreparationJsonV2(core)) ===
    bound.normalized_digest
  );
}

function validatePreparedSource(
  prepared: MarketContextTradePreparationSuccessV2,
  bound: BindableResult,
  errors: Set<string>,
) {
  const normalizedDigest = sha256(
    stableMarketContextTradePreparationJsonV2({
      candles: prepared?.candles,
      gaps: prepared?.gaps,
      pending_buckets: prepared?.pending_buckets,
      raw_record_dispositions: prepared?.raw_record_dispositions,
      preparation_policy_version:
        prepared?.policy_versions?.preparation,
      calendar_artifact_sha256:
        prepared?.calendar_artifact?.artifact_sha256,
      corporate_actions: prepared?.corporate_actions,
    }),
  );
  if (
    prepared?.status !== "prepared" ||
    prepared?.policy_versions?.timestamp !==
      MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1 ||
    prepared?.digests?.immutable_normalized_candles_digest !==
      normalizedDigest
  ) {
    errors.add("receiver_prepared_m2c_integrity_invalid");
    return new Map<string, MarketContextTradePreparationSuccessV2[
      "candles"
    ][number]>();
  }
  const preparedCandles = new Map(
    prepared.candles.map((candle) => [
      `${candle.symbol}\u0000${candle.bucket_start_unix_ns}`,
      candle,
    ]),
  );
  for (const row of bound.candle_rows) {
    const candle = preparedCandles.get(
      `${row.symbol}\u0000${row.observation_timestamp_unix_ns}`,
    );
    if (
      !candle ||
      row.provider_source_timestamp_unix_ns !==
        candle.last_ts_event_unix_ns ||
      row.received_timestamp_unix_ns !==
        candle.last_ts_recv_unix_ns ||
      stableMarketContextTradePreparationJsonV2(row.lineage) !==
        stableMarketContextTradePreparationJsonV2(
          candle.lineage.map((line) => {
            const boundLine = row.lineage.find(
              (candidate) =>
                candidate.raw_record_id === line.raw_record_id,
            );
            return {
              raw_record_id: line.raw_record_id,
              raw_record_sha256: line.raw_record_sha256,
              file_id: boundLine?.file_id,
              source_line: boundLine?.source_line,
            };
          }),
        )
    ) {
      errors.add("receiver_prepared_m2c_binding_mismatch");
    }
  }
  return preparedCandles;
}

function validateMetadata(
  bound: BindableResult,
  metadata: MarketContextHistoricalNanosecondReceiverMetadataV1,
  errors: Set<string>,
) {
  if (
    metadata?.receiver_version !==
      MARKET_CONTEXT_HISTORICAL_DATASET_NS_RECEIVER_V1 ||
    metadata?.extension_version !==
      MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1 ||
    metadata?.canonicalization_version !==
      MARKET_CONTEXT_HISTORICAL_DATASET_NS_CANONICAL_JSON_V1 ||
    bound.required_receiver_extension !==
      MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1 ||
    !verifyUpstreamBinding(bound)
  ) {
    errors.add("receiver_version_or_upstream_binding_invalid");
  }

  const revision = metadata?.provider_revision;
  if (
    !identifier(revision?.provider_build) ||
    !identifier(revision?.encoder_build) ||
    !identifier(revision?.dataset_revision) ||
    !identifier(revision?.revision_evidence_reference) ||
    !validSha256(revision?.revision_evidence_sha256) ||
    revision.provider_build !==
      bound.metadata.dataset.provider_build ||
    revision.dataset_revision !==
      bound.metadata.dataset.provider_revision
  ) {
    errors.add("receiver_provider_encoder_or_dataset_revision_invalid");
  }

  const tiebreak = metadata?.stable_tiebreak_evidence;
  if (
    tiebreak?.status !== "documented_stable" ||
    !identifier(tiebreak?.policy_reference) ||
    !validSha256(tiebreak?.evidence_sha256)
  ) {
    errors.add("receiver_stable_tiebreak_evidence_missing");
  }

  const license = metadata?.license_reference;
  if (
    license?.status !== "written_confirmed" ||
    !identifier(license?.reference_id) ||
    !validSha256(license?.evidence_sha256)
  ) {
    errors.add("receiver_written_license_reference_missing");
  }

  const semantics = metadata?.publisher_semantics;
  if (
    semantics?.publisher_id !== 95 ||
    semantics?.required_action !== "T" ||
    semantics?.allowed_flags_mask !== 129 ||
    semantics?.conditions_policy !== "empty_only_fail_closed" ||
    semantics?.unknown_action_policy !== "reject" ||
    semantics?.unknown_flag_policy !== "reject" ||
    semantics?.unknown_sale_condition_policy !== "reject"
  ) {
    errors.add("receiver_publisher_semantics_not_fail_closed");
  }

  const sourceFiles = new Map<string, {
    compressed_sha256: string;
    uncompressed_sha256: string;
  }>();
  for (const file of metadata?.source_files ?? []) {
    if (
      !identifier(file?.source_file_id) ||
      file?.media_type !== "application/vnd.databento.dbn" ||
      file?.compression !== "zstd" ||
      !validPositiveInteger(file?.compressed_bytes) ||
      !validSha256(file?.compressed_sha256) ||
      !validPositiveInteger(file?.uncompressed_bytes) ||
      !validSha256(file?.uncompressed_sha256) ||
      sourceFiles.has(file.source_file_id)
    ) {
      errors.add("receiver_source_file_metadata_invalid");
      continue;
    }
    sourceFiles.set(file.source_file_id, {
      compressed_sha256: file.compressed_sha256,
      uncompressed_sha256: file.uncompressed_sha256,
    });
  }
  if (sourceFiles.size === 0) {
    errors.add("receiver_source_files_missing");
  }

  const normalizedFiles = new Map(
    bound.metadata.raw_files.map((file) => [file.file_id, file]),
  );
  const coveredNormalizedFiles = new Set<string>();
  const coveredSourceFiles = new Set<string>();
  for (const line of metadata?.extraction_lineage ?? []) {
    const core = {
      normalized_file_id: line?.normalized_file_id,
      source_file_id: line?.source_file_id,
      extraction_policy_version: line?.extraction_policy_version,
      decoder_build: line?.decoder_build,
    };
    if (
      !identifier(line?.normalized_file_id) ||
      !normalizedFiles.has(line.normalized_file_id) ||
      !identifier(line?.source_file_id) ||
      !sourceFiles.has(line.source_file_id) ||
      line?.extraction_policy_version !==
        MARKET_CONTEXT_DBN_EXTRACTION_LINEAGE_V1 ||
      !identifier(line?.decoder_build) ||
      !validSha256(line?.lineage_sha256) ||
      line.lineage_sha256 !==
        sha256(stableMarketContextTradePreparationJsonV2(core)) ||
      coveredNormalizedFiles.has(line.normalized_file_id)
    ) {
      errors.add("receiver_extraction_lineage_invalid");
      continue;
    }
    coveredNormalizedFiles.add(line.normalized_file_id);
    coveredSourceFiles.add(line.source_file_id);
  }
  if (
    coveredNormalizedFiles.size !== normalizedFiles.size ||
    coveredSourceFiles.size !== sourceFiles.size
  ) {
    errors.add("receiver_extraction_lineage_incomplete");
  }
  return { normalizedFiles, sourceFiles, metadata };
}

function rowOrder(
  left: MarketContextHistoricalNanosecondRowV1,
  right: MarketContextHistoricalNanosecondRowV1,
) {
  const observation =
    BigInt(left.observation_timestamp_unix_ns) -
    BigInt(right.observation_timestamp_unix_ns);
  if (observation !== BigInt(0)) return observation < 0 ? -1 : 1;
  if (left.row_type !== right.row_type) {
    return left.row_type.localeCompare(right.row_type);
  }
  const leftSymbol = left.row_type === "candle" ? left.symbol : "";
  const rightSymbol = right.row_type === "candle" ? right.symbol : "";
  return leftSymbol.localeCompare(rightSymbol);
}

function domainCoverage(
  rows: MarketContextHistoricalNanosecondRowV1[],
  expectedRows: number,
): DomainCoverageV1 {
  const sorted = [...rows].sort(rowOrder);
  const timestamps = (
    key:
      | "observation_timestamp_unix_ns"
      | "provider_source_timestamp_unix_ns"
      | "received_timestamp_unix_ns",
  ) =>
    sorted.flatMap((row) => {
      if (row.row_type === "breadth") return [row[key]];
      if (key === "provider_source_timestamp_unix_ns") {
        return row.source_lineage.map(
          (line) => line.ts_event_unix_ns,
        );
      }
      if (key === "received_timestamp_unix_ns") {
        return row.source_lineage.map(
          (line) => line.ts_recv_unix_ns,
        );
      }
      return [row[key]];
    }).sort((left, right) => {
      const difference = BigInt(left) - BigInt(right);
      return difference < BigInt(0)
        ? -1
        : difference > BigInt(0) ? 1 : 0;
    });
  const observation = timestamps("observation_timestamp_unix_ns");
  const providerSource = timestamps("provider_source_timestamp_unix_ns");
  const received = timestamps("received_timestamp_unix_ns");
  return {
    expected_rows: expectedRows,
    observed_rows: sorted.length,
    coverage:
      expectedRows === 0
        ? sorted.length === 0 ? 1 : 0
        : Number((sorted.length / expectedRows).toFixed(6)),
    first_observation_unix_ns: observation[0] ?? null,
    last_observation_unix_ns: observation.at(-1) ?? null,
    first_provider_source_unix_ns: providerSource[0] ?? null,
    last_provider_source_unix_ns: providerSource.at(-1) ?? null,
    first_received_unix_ns: received[0] ?? null,
    last_received_unix_ns: received.at(-1) ?? null,
    rows_digest: sha256(
      stableMarketContextTradePreparationJsonV2(sorted),
    ),
  };
}

export function receiveMarketContextHistoricalNanosecondsV1(
  input: unknown,
): MarketContextHistoricalNanosecondReceiverResultV1 {
  const errors = new Set<string>();
  try {
    const value = input as {
      prepared: MarketContextTradePreparationSuccessV2;
      bound: MarketContextTradeM1BindingResultV2;
      metadata: MarketContextHistoricalNanosecondReceiverMetadataV1;
    };
    const before = stableMarketContextTradePreparationJsonV2(value);
    if (value?.bound?.status !== "bindable") {
      errors.add("receiver_requires_bindable_m2c_m1_adapter_result");
      return fail(errors);
    }
    const bound = value.bound;
    const preparedCandles = validatePreparedSource(
      value.prepared,
      bound,
      errors,
    );
    const validated = validateMetadata(
      bound,
      value.metadata,
      errors,
    );
    if (errors.size > 0) return fail(errors);

    const extractionByNormalizedFile = new Map(
      value.metadata.extraction_lineage.map((line) => [
        line.normalized_file_id,
        line,
      ]),
    );
    const sourceFiles = new Map(
      value.metadata.source_files.map((file) => [
        file.source_file_id,
        file,
      ]),
    );
    const normalizedFiles = validated.normalizedFiles;

    const candleRows: MarketContextHistoricalNanosecondRowV1[] =
      bound.candle_rows.map((row) => ({
        ...row,
        source_lineage: row.lineage.map((line) => {
          const preparedCandle = preparedCandles.get(
            `${row.symbol}\u0000${row.observation_timestamp_unix_ns}`,
          )!;
          const preparedLine = preparedCandle.lineage.find(
            (candidate) =>
              candidate.raw_record_id === line.raw_record_id,
          )!;
          const normalizedFile = normalizedFiles.get(line.file_id)!;
          const extraction = extractionByNormalizedFile.get(
            line.file_id,
          )!;
          const sourceFile = sourceFiles.get(
            extraction.source_file_id,
          )!;
          return {
            raw_record_id: line.raw_record_id,
            raw_record_sha256: line.raw_record_sha256,
            source_position: preparedLine.source_position,
            sequence_uint32: preparedLine.sequence_uint32,
            tie_break_id: preparedLine.tie_break_id,
            ts_event_unix_ns: preparedLine.ts_event_unix_ns,
            ts_recv_unix_ns: preparedLine.ts_recv_unix_ns,
            normalized_file_id: line.file_id,
            normalized_file_sha256: normalizedFile.sha256,
            source_file_id: sourceFile.source_file_id,
            source_file_compressed_sha256:
              sourceFile.compressed_sha256,
            source_file_uncompressed_sha256:
              sourceFile.uncompressed_sha256,
            source_line: line.source_line,
          };
        }),
      }));
    const breadthRows: MarketContextHistoricalNanosecondRowV1[] =
      bound.breadth_rows.map((row) => ({
        ...row,
        source_lineage: {
          source_digest: row.source_digest,
        },
      }));
    const normalizedRows = [...candleRows, ...breadthRows].sort(
      rowOrder,
    );

    for (const row of normalizedRows) {
      if (
        parseNs(row.observation_timestamp_unix_ns) === null ||
        parseNs(row.provider_source_timestamp_unix_ns) === null ||
        parseNs(row.received_timestamp_unix_ns) === null
      ) {
        errors.add("receiver_noncanonical_nanosecond_timestamp");
      }
    }
    if (errors.size > 0) return fail(errors);

    const expected = bound.metadata.quality.expected_rows_by_domain;
    const coverage = {
      benchmark: domainCoverage(
        normalizedRows.filter(
          (row) =>
            row.row_type === "candle" &&
            row.domain === "benchmark",
        ),
        expected.benchmark,
      ),
      breadth: domainCoverage(
        normalizedRows.filter((row) => row.row_type === "breadth"),
        expected.breadth,
      ),
      sector: domainCoverage(
        normalizedRows.filter(
          (row) =>
            row.row_type === "candle" &&
            row.domain === "sector",
        ),
        expected.sector,
      ),
      industry: domainCoverage(
        normalizedRows.filter(
          (row) =>
            row.row_type === "candle" &&
            row.domain === "industry",
        ),
        expected.industry,
      ),
    };
    const manifest = {
      provider_revision: value.metadata.provider_revision,
      stable_tiebreak_evidence:
        value.metadata.stable_tiebreak_evidence,
      license_reference: value.metadata.license_reference,
      publisher_semantics: value.metadata.publisher_semantics,
      source_files: [...value.metadata.source_files].sort(
        (left, right) =>
          left.source_file_id.localeCompare(right.source_file_id),
      ),
      extraction_lineage: [...value.metadata.extraction_lineage].sort(
        (left, right) =>
          left.normalized_file_id.localeCompare(
            right.normalized_file_id,
          ),
      ),
      normalized_raw_files: [...bound.metadata.raw_files].sort(
        (left, right) =>
          left.file_id.localeCompare(right.file_id),
      ),
      watermark: {
        policy_version: MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2,
        evidence_status: "empirically_unvalidated" as const,
        calibrated: false as const,
      },
    };
    const rawLineage = normalizedRows.flatMap((row) =>
      row.row_type === "candle" ? row.source_lineage : [],
    );
    const digestsWithoutReceiver = {
      upstream_binding_digest: bound.normalized_digest,
      raw_lineage_digest: sha256(
        stableMarketContextTradePreparationJsonV2(rawLineage),
      ),
      normalized_rows_digest: sha256(
        stableMarketContextTradePreparationJsonV2(normalizedRows),
      ),
      coverage_digest: sha256(
        stableMarketContextTradePreparationJsonV2(coverage),
      ),
    };
    const core = {
      receiver_version:
        MARKET_CONTEXT_HISTORICAL_DATASET_NS_RECEIVER_V1,
      target_contract_version:
        "market_context_historical_dataset_v1" as const,
      extension_version:
        MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1,
      timestamp_version:
        MARKET_CONTEXT_TRADE_NANOSECOND_TIMESTAMP_V1,
      canonicalization_version:
        MARKET_CONTEXT_HISTORICAL_DATASET_NS_CANONICAL_JSON_V1,
      manifest,
      normalized_rows: normalizedRows,
      coverage,
      digests: digestsWithoutReceiver,
      input_immutable: true as const,
      metadata_inferred: false as const,
      m1_extension_materialized: true as const,
      canonical_binding_performed: false as const,
      replay_performed: false as const,
      shadow_only: true as const,
      live_ranking_effect: false as const,
    };
    if (stableMarketContextTradePreparationJsonV2(value) !== before) {
      errors.add("receiver_input_mutated");
      return fail(errors);
    }
    return {
      status: "received",
      ...core,
      digests: {
        ...digestsWithoutReceiver,
        receiver_digest: sha256(
          stableMarketContextTradePreparationJsonV2(core),
        ),
      },
    };
  } catch {
    errors.add("receiver_malformed_runtime_input");
    return fail(errors);
  }
}
