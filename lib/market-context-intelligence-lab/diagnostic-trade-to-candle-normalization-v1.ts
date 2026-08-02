import { createHash } from "node:crypto";

import {
  MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1,
  MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1,
  MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS,
  MARKET_CONTEXT_M5F_COMBINED_CALENDAR_DIGEST,
  MARKET_CONTEXT_M5F_RAW_FILE_DIGEST_ROOT,
  MARKET_CONTEXT_M5F_SESSION_DATES,
} from "./diagnostic-all-reported-trades-candle-policy-v1";

export const MARKET_CONTEXT_DIAGNOSTIC_TRADE_TO_CANDLE_NORMALIZATION_V1 =
  "market_context_diagnostic_trade_to_candle_normalization_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CANDLE_SCHEMA_V1 =
  "market_context_diagnostic_all_reported_trades_1m_candle_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_RECORD_DISPOSITION_SCHEMA_V1 =
  "market_context_diagnostic_raw_record_disposition_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_GAP_COVERAGE_SCHEMA_V1 =
  "market_context_diagnostic_gap_coverage_report_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_DUPLICATE_IMPACT_SCHEMA_V1 =
  "market_context_diagnostic_duplicate_impact_report_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_SECTOR_BREADTH_SCHEMA_V1 =
  "market_context_diagnostic_eleven_sector_etf_breadth_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_DUPLICATE_POLICY_V1 =
  "include_each_unique_raw_identity_no_deduplication_v1" as const;

export const MARKET_CONTEXT_M5G_EVIDENCE_DIGEST =
  "aba25a4bdc5f1844678b40172e0f7caede1c4dae94625981ef2eae05b6c5dfd4";
export const MARKET_CONTEXT_M5F_RECORD_COUNT = 2_420_049 as const;
export const MARKET_CONTEXT_M5F_FILE_COUNT = 20 as const;
export const MARKET_CONTEXT_M5F_SYMBOL_COUNT = 13 as const;

export const MARKET_CONTEXT_DIAGNOSTIC_SYMBOLS = [
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

export const MARKET_CONTEXT_DIAGNOSTIC_SECTOR_ETFS = [
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

export type MarketContextDiagnosticNormalizationPreflightV1 = {
  normalization_version:
    typeof MARKET_CONTEXT_DIAGNOSTIC_TRADE_TO_CANDLE_NORMALIZATION_V1;
  policy_version:
    typeof MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1;
  namespace: typeof MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1;
  source: {
    dataset: "EQUS.MINI";
    schema: "trades";
    encoding: "dbn";
    compression: "zstd";
    publisher_id: 95;
  };
  evidence: {
    m5g_evidence_digest: string;
    raw_file_digest_root: string;
    calendar_digest: string;
    raw_file_count: number;
    raw_record_count: number;
    session_count: number;
    symbol_count: number;
  };
  admitted_inventory: {
    actions: Record<string, number>;
    flags: Record<string, number>;
    unknown_action_count: number;
    unknown_flag_bit_count: number;
    negative_receive_lag_count: number;
    scope_deviation_count: number;
    undefined_or_sentinel_count: number;
  };
  calendar: {
    exchange: "XNYS";
    session_dates: string[];
    all_regular_core_sessions: boolean;
  };
  duplicate_handling: {
    policy: typeof MARKET_CONTEXT_DIAGNOSTIC_DUPLICATE_POLICY_V1;
    exact_duplicate_record_count: number;
    silent_deduplication_allowed: false;
    stable_identity:
      "source_file_sha256_plus_zero_based_record_ordinal";
    stable_identity_collision_count: number;
  };
  decoder: {
    package: "databento-dbn";
    version: "0.63.0";
    native_build_sha256: string;
    module_sha256: string;
  };
  output: {
    destination_outside_git: boolean;
    destination_filevault_encrypted: boolean;
    directory_mode: "0700";
    file_mode: "0600";
  };
  claims: {
    diagnostic_all_reported_trades: true;
    official_ohlcv_claimed: false;
    canonical_performance_eligible: false;
    sale_condition_semantics_available: false;
    raw_unadjusted: true;
    corporate_actions_applied: false;
    watermark_identity:
      typeof MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1;
    watermark_value_ns: typeof MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS;
    watermark_status: "empirically_unvalidated";
    live_ranking_effect: false;
  };
};

export type MarketContextDiagnosticNormalizationPreflightResultV1 = {
  status: "diagnostic_normalization_ready" | "not_ready" | "conflicting";
  reason_codes: string[];
  normalization_version:
    typeof MARKET_CONTEXT_DIAGNOSTIC_TRADE_TO_CANDLE_NORMALIZATION_V1;
  duplicate_treatment:
    typeof MARKET_CONTEXT_DIAGNOSTIC_DUPLICATE_POLICY_V1;
  records_expected: typeof MARKET_CONTEXT_M5F_RECORD_COUNT;
  normalization_authorized: boolean;
  replay_authorized: false;
  canonical_binding_ready: false;
  live_ranking_effect: false;
  input_immutable_required: true;
  result_digest: string;
};

function stable(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stable);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stable(child)]),
    );
  }
  return value;
}

export function stableDiagnosticNormalizationJsonV1(value: unknown) {
  return JSON.stringify(stable(value));
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(stableDiagnosticNormalizationJsonV1(value))
    .digest("hex");
}

function sameInventory(
  actual: Record<string, number> | undefined,
  expected: Record<string, number>,
) {
  return (
    actual !== undefined &&
    stableDiagnosticNormalizationJsonV1(actual) ===
      stableDiagnosticNormalizationJsonV1(expected)
  );
}

export function evaluateDiagnosticNormalizationPreflightV1(
  input: MarketContextDiagnosticNormalizationPreflightV1,
): MarketContextDiagnosticNormalizationPreflightResultV1 {
  const value = input as Partial<
    MarketContextDiagnosticNormalizationPreflightV1
  >;
  const blocking = new Set<string>();
  const conflicts = new Set<string>();

  if (
    value?.normalization_version !==
      MARKET_CONTEXT_DIAGNOSTIC_TRADE_TO_CANDLE_NORMALIZATION_V1 ||
    value?.policy_version !==
      MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1 ||
    value?.namespace !== MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1
  ) {
    blocking.add("normalization_policy_or_namespace_invalid");
  }
  if (
    value?.source?.dataset !== "EQUS.MINI" ||
    value?.source?.schema !== "trades" ||
    value?.source?.encoding !== "dbn" ||
    value?.source?.compression !== "zstd" ||
    value?.source?.publisher_id !== 95
  ) {
    blocking.add("source_scope_drift");
  }
  if (
    value?.evidence?.m5g_evidence_digest !==
      MARKET_CONTEXT_M5G_EVIDENCE_DIGEST ||
    value?.evidence?.raw_file_digest_root !==
      MARKET_CONTEXT_M5F_RAW_FILE_DIGEST_ROOT ||
    value?.evidence?.calendar_digest !==
      MARKET_CONTEXT_M5F_COMBINED_CALENDAR_DIGEST ||
    value?.evidence?.raw_file_count !==
      MARKET_CONTEXT_M5F_FILE_COUNT ||
    value?.evidence?.raw_record_count !==
      MARKET_CONTEXT_M5F_RECORD_COUNT ||
    value?.evidence?.session_count !== 20 ||
    value?.evidence?.symbol_count !==
      MARKET_CONTEXT_M5F_SYMBOL_COUNT
  ) {
    blocking.add("raw_policy_calendar_or_scope_digest_drift");
  }
  if (
    !sameInventory(value?.admitted_inventory?.actions, {
      T: MARKET_CONTEXT_M5F_RECORD_COUNT,
    }) ||
    !sameInventory(value?.admitted_inventory?.flags, {
      "0": 597_734,
      "128": 1_822_315,
    }) ||
    value?.admitted_inventory?.unknown_action_count !== 0 ||
    value?.admitted_inventory?.unknown_flag_bit_count !== 0
  ) {
    blocking.add("unknown_or_drifted_action_or_flag_inventory");
  }
  if (
    value?.admitted_inventory?.negative_receive_lag_count !== 0 ||
    value?.admitted_inventory?.scope_deviation_count !== 0 ||
    value?.admitted_inventory?.undefined_or_sentinel_count !== 0
  ) {
    blocking.add("timestamp_scope_or_sentinel_admission_failed");
  }
  if (
    value?.calendar?.exchange !== "XNYS" ||
    value?.calendar?.all_regular_core_sessions !== true ||
    stableDiagnosticNormalizationJsonV1(
      value?.calendar?.session_dates,
    ) !==
      stableDiagnosticNormalizationJsonV1(
        MARKET_CONTEXT_M5F_SESSION_DATES,
      )
  ) {
    blocking.add("session_calendar_drift");
  }
  if (
    value?.duplicate_handling?.policy !==
      MARKET_CONTEXT_DIAGNOSTIC_DUPLICATE_POLICY_V1 ||
    value?.duplicate_handling?.exact_duplicate_record_count !==
      3_399 ||
    value?.duplicate_handling?.silent_deduplication_allowed !==
      false ||
    value?.duplicate_handling?.stable_identity !==
      "source_file_sha256_plus_zero_based_record_ordinal" ||
    value?.duplicate_handling?.stable_identity_collision_count !==
      0
  ) {
    blocking.add("duplicate_policy_or_stable_identity_invalid");
  }
  if (
    value?.decoder?.package !== "databento-dbn" ||
    value?.decoder?.version !== "0.63.0" ||
    !/^[a-f0-9]{64}$/.test(
      value?.decoder?.native_build_sha256 ?? "",
    ) ||
    !/^[a-f0-9]{64}$/.test(value?.decoder?.module_sha256 ?? "")
  ) {
    blocking.add("decoder_provenance_invalid");
  }
  if (
    value?.output?.destination_outside_git !== true ||
    value?.output?.destination_filevault_encrypted !== true ||
    value?.output?.directory_mode !== "0700" ||
    value?.output?.file_mode !== "0600"
  ) {
    blocking.add("encrypted_output_boundary_invalid");
  }
  const claims = value?.claims;
  if (
    claims?.diagnostic_all_reported_trades !== true ||
    claims?.sale_condition_semantics_available !== false ||
    claims?.raw_unadjusted !== true ||
    claims?.watermark_identity !==
      MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1 ||
    claims?.watermark_value_ns !==
      MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS ||
    claims?.watermark_status !== "empirically_unvalidated"
  ) {
    blocking.add("diagnostic_claim_or_watermark_invalid");
  }
  if (
    claims?.official_ohlcv_claimed !== false ||
    claims?.canonical_performance_eligible !== false ||
    claims?.corporate_actions_applied !== false ||
    claims?.live_ranking_effect !== false
  ) {
    conflicts.add("official_canonical_adjusted_or_live_claim_forbidden");
  }

  const reasonCodes = [
    ...Array.from(conflicts),
    ...Array.from(blocking),
  ].sort();
  const status: MarketContextDiagnosticNormalizationPreflightResultV1["status"] =
    conflicts.size > 0
      ? "conflicting"
      : blocking.size > 0
        ? "not_ready"
        : "diagnostic_normalization_ready";
  const material = {
    status,
    reason_codes: reasonCodes,
    normalization_version:
      MARKET_CONTEXT_DIAGNOSTIC_TRADE_TO_CANDLE_NORMALIZATION_V1,
    duplicate_treatment:
      MARKET_CONTEXT_DIAGNOSTIC_DUPLICATE_POLICY_V1,
    records_expected: MARKET_CONTEXT_M5F_RECORD_COUNT,
    normalization_authorized: status ===
      "diagnostic_normalization_ready",
    replay_authorized: false as const,
    canonical_binding_ready: false as const,
    live_ranking_effect: false as const,
    input_immutable_required: true as const,
  };

  return {
    ...material,
    result_digest: digest(material),
  };
}
