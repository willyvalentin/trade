import { createHash } from "node:crypto";

export const MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1 =
  "market_context_diagnostic_all_reported_trades_candle_policy_v1" as const;
export const MARKET_CONTEXT_SALE_CONDITION_GAP_DECISION_V1 =
  "market_context_sale_condition_gap_decision_2026_07_28_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_NORMALIZATION_GATE_V1 =
  "market_context_diagnostic_normalization_gate_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1 =
  "shadow.diagnostic.all_reported_trades.candles.v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1 =
  "market_context_provisional_diagnostic_watermark_2s_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_LINEAGE_POLICY_V1 =
  "market_context_diagnostic_raw_record_bucket_lineage_v1" as const;

export const MARKET_CONTEXT_M5F_EVIDENCE_DIGEST =
  "169ea4defec513ea2c661f14408974ab5632be106d4727911a8e1ddc5cd282db";
export const MARKET_CONTEXT_M5F_REPORT_DIGEST =
  "f89ba8123f48c0553e3aa03a361edde1c5f593c8a953d44e385983ca7dc5abe4";
export const MARKET_CONTEXT_M5F_RAW_FILE_DIGEST_ROOT =
  "7b9d1bdc9e9f75df2424f31da1e194a80f7ec875a34f38cd8782e6a72c09ac51";
export const MARKET_CONTEXT_M5F_COMBINED_CALENDAR_DIGEST =
  "1858e43c4e1992cb68c840209e0c2f5a098ab3a01798b85ab3b3bbef587df109";
export const MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS =
  "2000000000" as const;

const sha256Pattern = /^[0-9a-f]{64}$/;
const canonicalUnsignedInteger = /^(0|[1-9][0-9]*)$/;

export const MARKET_CONTEXT_M5F_SESSION_DATES = [
  "2026-06-26",
  "2026-06-29",
  "2026-06-30",
  "2026-07-01",
  "2026-07-02",
  "2026-07-06",
  "2026-07-07",
  "2026-07-08",
  "2026-07-09",
  "2026-07-10",
  "2026-07-13",
  "2026-07-14",
  "2026-07-15",
  "2026-07-16",
  "2026-07-17",
  "2026-07-20",
  "2026-07-21",
  "2026-07-22",
  "2026-07-23",
  "2026-07-24",
] as const;

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type MarketContextDiagnosticCandlePolicyInputV1 = {
  policy_version:
    typeof MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1;
  decision_version:
    typeof MARKET_CONTEXT_SALE_CONDITION_GAP_DECISION_V1;
  gate_version:
    typeof MARKET_CONTEXT_DIAGNOSTIC_NORMALIZATION_GATE_V1;
  source: {
    provider: "Databento";
    dataset: "EQUS.MINI";
    schema: "trades";
    publisher_id: 95;
    encoding: "dbn";
    compression: "zstd";
  };
  evidence: {
    m5f_evidence_digest: string;
    m5f_report_digest: string;
    raw_file_digest_root: string;
    file_count: number;
    session_count: number;
    record_count: number;
  };
  calendar: {
    exchange: "XNYS";
    combined_calendar_digest: string;
    session_dates: string[];
    missing_or_unknown_session_count: number;
  };
  observed_inventory: {
    actions: Record<string, number>;
    flags: Record<string, number>;
    unknown_action_count: number;
    unknown_flag_bit_count: number;
    publisher_specific_unresolved_count: number;
    bad_receive_timestamp_flag_count: number;
    negative_receive_lag_count: number;
    undefined_timestamp_count: number;
  };
  sale_conditions: {
    semantics_available: boolean;
    mapping_status:
      | "not_available"
      | "available_mapping_not_frozen"
      | "frozen_versioned_mapping";
    mapping_version: string | null;
  };
  point_in_time: {
    as_of_unix_ns: string;
    maximum_ts_event_unix_ns: string;
    maximum_ts_recv_unix_ns: string;
    event_after_as_of_count: number;
    receive_after_as_of_count: number;
  };
  lineage: {
    policy_version:
      typeof MARKET_CONTEXT_DIAGNOSTIC_LINEAGE_POLICY_V1;
    source_file_identity: "compressed_file_sha256";
    record_identity:
      "source_file_sha256_plus_zero_based_record_ordinal";
    record_identity_complete: boolean;
    record_identity_collision_count: number;
    bucket_identity:
      "symbol_plus_session_date_plus_bucket_start_unix_ns";
    ts_event_preserved_as_unix_ns: boolean;
    ts_recv_preserved_as_unix_ns: boolean;
  };
  candle_shape: {
    interval: "1min";
    bucket_time_basis: "exchange_event_time";
    ordering:
      "ts_event_then_source_file_sha256_then_zero_based_record_ordinal";
    no_forward_fill: true;
    explicit_gaps: true;
    partial_bucket_policy: "omit_until_provisional_watermark";
  };
  watermark: {
    identity:
      typeof MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1;
    value_ns: typeof MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS;
    status: "empirically_unvalidated";
    twenty_session_receive_lag_gate_passed: true;
    records_after_candle_end_plus_watermark: 0;
    provider_certified: false;
    production_ready: false;
  };
  adjustment: {
    state: "raw_unadjusted";
    corporate_actions_available: false;
    corporate_actions_included: false;
    adjustment_inferred: false;
  };
  requested_claims: {
    provider_official_or_eligibility_filtered: false;
    official_ohlcv_claimed: false;
    canonical_performance_eligible: false;
    live_ranking_effect: false;
  };
  retention: {
    namespace:
      typeof MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1;
    purpose: "offline_diagnostic_only";
    canonical_export_allowed: false;
    live_export_allowed: false;
  };
};

export type MarketContextDiagnosticNormalizationGateStatusV1 =
  | "diagnostic_normalization_ready"
  | "not_ready"
  | "conflicting";

export type MarketContextDiagnosticNormalizationGateResultV1 = {
  status: MarketContextDiagnosticNormalizationGateStatusV1;
  policy_version:
    typeof MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1;
  decision_version:
    typeof MARKET_CONTEXT_SALE_CONDITION_GAP_DECISION_V1;
  gate_version:
    typeof MARKET_CONTEXT_DIAGNOSTIC_NORMALIZATION_GATE_V1;
  reason_codes: string[];
  usage_classes: {
    provider_official_or_eligibility_filtered_candles: {
      allowed: false;
      classification: "not_ready";
      blocker: "sale_condition_or_eligibility_evidence_required";
    };
    diagnostic_all_reported_trades_candles: {
      allowed: boolean;
      classification:
        | "diagnostic_normalization_ready"
        | "not_ready"
        | "conflicting";
      claim: "diagnostic_all_reported_trades_not_official_ohlcv";
    };
    canonical_performance_or_evaluation_candles: {
      allowed: false;
      classification: "not_ready";
      blocker: "canonical_eligibility_and_adjustment_evidence_required";
    };
    live_ranking_inputs: {
      allowed: false;
      classification: "not_ready";
      blocker: "live_use_forbidden";
    };
  };
  output_contract: {
    namespace:
      typeof MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1;
    interval: "1min";
    source_trade_semantics: "all_reported_trade_records";
    official_ohlcv_claimed: false;
    canonical_performance_eligible: false;
    raw_unadjusted: true;
    corporate_actions_included: false;
    no_forward_fill: true;
    explicit_gaps: true;
    raw_record_bucket_lineage_required: true;
    nanosecond_event_and_receive_time_required: true;
    candles_emitted_by_gate: 0;
  };
  watermark: {
    identity:
      typeof MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1;
    value_ns: typeof MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS;
    status: "empirically_unvalidated";
    twenty_session_receive_lag_gate_passed: boolean;
    sale_condition_gap_resolved: false;
    provider_certified: false;
    production_ready: false;
    threshold_changed: false;
  };
  official_ohlcv_claim_prevented: true;
  sale_condition_gap_classification:
    "diagnostic_only_with_explicit_non_official_semantics";
  input_immutable: true;
  metadata_inferred: false;
  normalization_performed: false;
  normalization_authorized: false;
  replay_authorized: false;
  canonical_binding_ready: false;
  shadow_only: true;
  live_ranking_effect: false;
  decision_digest: string;
};

function stableValue(value: unknown): JsonValue {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value as null | boolean | number | string;
  }
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableValue(child)]),
    );
  }
  return String(value);
}

export function stableMarketContextDiagnosticCandlePolicyJsonV1(
  value: unknown,
) {
  return JSON.stringify(stableValue(value));
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function validDigest(value: unknown): value is string {
  return typeof value === "string" && sha256Pattern.test(value);
}

function parseNs(value: unknown) {
  if (
    typeof value !== "string" ||
    !canonicalUnsignedInteger.test(value)
  ) {
    return null;
  }
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function exactInventory(
  value: unknown,
  expected: Record<string, number>,
) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    Object.keys(record).sort().join("\u0000") ===
      Object.keys(expected).sort().join("\u0000") &&
    Object.entries(expected).every(
      ([key, count]) => record[key] === count,
    )
  );
}

export function evaluateMarketContextDiagnosticCandlePolicyV1(
  input: MarketContextDiagnosticCandlePolicyInputV1,
): MarketContextDiagnosticNormalizationGateResultV1 {
  const snapshot = stableMarketContextDiagnosticCandlePolicyJsonV1(
    input,
  );
  const value = input as Partial<
    MarketContextDiagnosticCandlePolicyInputV1
  >;
  const blocking = new Set<string>();
  const conflicts = new Set<string>();

  if (
    value?.policy_version !==
      MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1 ||
    value?.decision_version !==
      MARKET_CONTEXT_SALE_CONDITION_GAP_DECISION_V1 ||
    value?.gate_version !==
      MARKET_CONTEXT_DIAGNOSTIC_NORMALIZATION_GATE_V1
  ) {
    blocking.add("diagnostic_policy_or_gate_version_invalid");
  }
  if (
    value?.source?.provider !== "Databento" ||
    value?.source?.dataset !== "EQUS.MINI" ||
    value?.source?.schema !== "trades" ||
    value?.source?.encoding !== "dbn" ||
    value?.source?.compression !== "zstd"
  ) {
    blocking.add("source_dataset_or_schema_scope_invalid");
  }
  if (value?.source?.publisher_id !== 95) {
    blocking.add("publisher_drift");
  }
  if (
    !validDigest(value?.evidence?.m5f_evidence_digest) ||
    value?.evidence?.m5f_evidence_digest !==
      MARKET_CONTEXT_M5F_EVIDENCE_DIGEST ||
    !validDigest(value?.evidence?.m5f_report_digest) ||
    value?.evidence?.m5f_report_digest !==
      MARKET_CONTEXT_M5F_REPORT_DIGEST
  ) {
    blocking.add("m5f_evidence_binding_invalid");
  }
  if (
    !validDigest(value?.evidence?.raw_file_digest_root) ||
    value?.evidence?.raw_file_digest_root !==
      MARKET_CONTEXT_M5F_RAW_FILE_DIGEST_ROOT
  ) {
    blocking.add("raw_digest_drift");
  }
  if (
    value?.evidence?.file_count !== 20 ||
    value?.evidence?.session_count !== 20 ||
    value?.evidence?.record_count !== 2_420_049
  ) {
    blocking.add("twenty_session_record_scope_invalid");
  }
  const sessionDates = value?.calendar?.session_dates;
  if (
    value?.calendar?.exchange !== "XNYS" ||
    value?.calendar?.combined_calendar_digest !==
      MARKET_CONTEXT_M5F_COMBINED_CALENDAR_DIGEST ||
    !Array.isArray(sessionDates) ||
    sessionDates.length !== MARKET_CONTEXT_M5F_SESSION_DATES.length ||
    sessionDates.some(
      (session, index) =>
        session !== MARKET_CONTEXT_M5F_SESSION_DATES[index],
    ) ||
    value?.calendar?.missing_or_unknown_session_count !== 0
  ) {
    blocking.add("session_calendar_missing_or_invalid");
  }
  if (
    !exactInventory(value?.observed_inventory?.actions, {
      T: 2_420_049,
    }) ||
    value?.observed_inventory?.unknown_action_count !== 0
  ) {
    blocking.add("unknown_or_unsupported_action");
  }
  if (
    !exactInventory(value?.observed_inventory?.flags, {
      "0": 597_734,
      "128": 1_822_315,
    }) ||
    value?.observed_inventory?.unknown_flag_bit_count !== 0 ||
    value?.observed_inventory
      ?.publisher_specific_unresolved_count !== 0 ||
    value?.observed_inventory
      ?.bad_receive_timestamp_flag_count !== 0
  ) {
    blocking.add("unknown_or_unsafe_flag");
  }
  if (
    value?.observed_inventory?.negative_receive_lag_count !== 0
  ) {
    blocking.add("negative_receive_lag");
  }
  if (value?.observed_inventory?.undefined_timestamp_count !== 0) {
    blocking.add("undefined_timestamp");
  }
  if (
    value?.sale_conditions?.semantics_available !== false ||
    value?.sale_conditions?.mapping_status !== "not_available" ||
    value?.sale_conditions?.mapping_version !== null
  ) {
    if (
      value?.sale_conditions?.semantics_available === true &&
      value?.sale_conditions?.mapping_status !==
        "frozen_versioned_mapping"
    ) {
      conflicts.add(
        "sale_condition_data_present_without_frozen_mapping",
      );
    } else {
      blocking.add(
        "sale_condition_semantics_changed_requires_new_policy_version",
      );
    }
  }
  const asOf = parseNs(value?.point_in_time?.as_of_unix_ns);
  const maxEvent = parseNs(
    value?.point_in_time?.maximum_ts_event_unix_ns,
  );
  const maxReceive = parseNs(
    value?.point_in_time?.maximum_ts_recv_unix_ns,
  );
  if (
    asOf === null ||
    maxEvent === null ||
    maxReceive === null ||
    maxEvent > asOf ||
    maxReceive > asOf ||
    value?.point_in_time?.event_after_as_of_count !== 0 ||
    value?.point_in_time?.receive_after_as_of_count !== 0
  ) {
    blocking.add("point_in_time_as_of_violation");
  }
  if (
    value?.lineage?.policy_version !==
      MARKET_CONTEXT_DIAGNOSTIC_LINEAGE_POLICY_V1 ||
    value?.lineage?.source_file_identity !==
      "compressed_file_sha256" ||
    value?.lineage?.record_identity !==
      "source_file_sha256_plus_zero_based_record_ordinal" ||
    value?.lineage?.record_identity_complete !== true ||
    value?.lineage?.record_identity_collision_count !== 0 ||
    value?.lineage?.bucket_identity !==
      "symbol_plus_session_date_plus_bucket_start_unix_ns" ||
    value?.lineage?.ts_event_preserved_as_unix_ns !== true ||
    value?.lineage?.ts_recv_preserved_as_unix_ns !== true
  ) {
    blocking.add("raw_record_bucket_lineage_or_tiebreak_missing");
  }
  if (
    value?.candle_shape?.interval !== "1min" ||
    value?.candle_shape?.bucket_time_basis !==
      "exchange_event_time" ||
    value?.candle_shape?.ordering !==
      "ts_event_then_source_file_sha256_then_zero_based_record_ordinal" ||
    value?.candle_shape?.no_forward_fill !== true ||
    value?.candle_shape?.explicit_gaps !== true ||
    value?.candle_shape?.partial_bucket_policy !==
      "omit_until_provisional_watermark"
  ) {
    blocking.add("diagnostic_bucket_policy_invalid");
  }
  if (
    value?.watermark?.identity !==
      MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1 ||
    value?.watermark?.value_ns !==
      MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS ||
    value?.watermark?.status !== "empirically_unvalidated" ||
    value?.watermark
      ?.twenty_session_receive_lag_gate_passed !== true ||
    value?.watermark
      ?.records_after_candle_end_plus_watermark !== 0 ||
    value?.watermark?.provider_certified !== false ||
    value?.watermark?.production_ready !== false
  ) {
    blocking.add("provisional_diagnostic_watermark_invalid");
  }
  if (
    value?.adjustment?.state !== "raw_unadjusted" ||
    value?.adjustment?.corporate_actions_available !== false ||
    value?.adjustment?.corporate_actions_included !== false
  ) {
    blocking.add("corporate_action_or_adjustment_boundary_invalid");
  }
  const adjustmentInferred = (
    value?.adjustment as
      | { adjustment_inferred?: unknown }
      | undefined
  )?.adjustment_inferred;
  if (adjustmentInferred === true) {
    conflicts.add("corporate_action_or_adjustment_inference_attempted");
  } else if (adjustmentInferred !== false) {
    blocking.add("adjustment_inference_attestation_missing");
  }
  const requestedClaims = value?.requested_claims as
    | Record<string, unknown>
    | undefined;
  const claimValues: unknown[] = [
    requestedClaims?.provider_official_or_eligibility_filtered,
    requestedClaims?.official_ohlcv_claimed,
    requestedClaims?.canonical_performance_eligible,
    requestedClaims?.live_ranking_effect,
  ];
  if (claimValues.some((claim) => claim === true)) {
    conflicts.add("diagnostic_output_mislabeling_attempted");
  } else if (claimValues.some((claim) => claim !== false)) {
    blocking.add("required_negative_claim_attestation_missing");
  }
  if (
    value?.retention?.namespace !==
      MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1 ||
    value?.retention?.purpose !== "offline_diagnostic_only" ||
    value?.retention?.canonical_export_allowed !== false ||
    value?.retention?.live_export_allowed !== false
  ) {
    blocking.add("diagnostic_namespace_or_retention_invalid");
  }

  const status: MarketContextDiagnosticNormalizationGateStatusV1 =
    conflicts.size > 0
      ? "conflicting"
      : blocking.size > 0
        ? "not_ready"
        : "diagnostic_normalization_ready";
  const reasonCodes = [...conflicts, ...blocking].sort((left, right) =>
    left.localeCompare(right),
  );
  const core = {
    status,
    policy_version:
      MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1,
    decision_version:
      MARKET_CONTEXT_SALE_CONDITION_GAP_DECISION_V1,
    gate_version: MARKET_CONTEXT_DIAGNOSTIC_NORMALIZATION_GATE_V1,
    reason_codes: reasonCodes,
    usage_classes: {
      provider_official_or_eligibility_filtered_candles: {
        allowed: false as const,
        classification: "not_ready" as const,
        blocker:
          "sale_condition_or_eligibility_evidence_required" as const,
      },
      diagnostic_all_reported_trades_candles: {
        allowed: status === "diagnostic_normalization_ready",
        classification: status,
        claim:
          "diagnostic_all_reported_trades_not_official_ohlcv" as const,
      },
      canonical_performance_or_evaluation_candles: {
        allowed: false as const,
        classification: "not_ready" as const,
        blocker:
          "canonical_eligibility_and_adjustment_evidence_required" as const,
      },
      live_ranking_inputs: {
        allowed: false as const,
        classification: "not_ready" as const,
        blocker: "live_use_forbidden" as const,
      },
    },
    output_contract: {
      namespace: MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1,
      interval: "1min" as const,
      source_trade_semantics:
        "all_reported_trade_records" as const,
      official_ohlcv_claimed: false as const,
      canonical_performance_eligible: false as const,
      raw_unadjusted: true as const,
      corporate_actions_included: false as const,
      no_forward_fill: true as const,
      explicit_gaps: true as const,
      raw_record_bucket_lineage_required: true as const,
      nanosecond_event_and_receive_time_required: true as const,
      candles_emitted_by_gate: 0 as const,
    },
    watermark: {
      identity:
        MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1,
      value_ns: MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS,
      status: "empirically_unvalidated" as const,
      twenty_session_receive_lag_gate_passed:
        value?.watermark?.twenty_session_receive_lag_gate_passed ===
        true,
      sale_condition_gap_resolved: false as const,
      provider_certified: false as const,
      production_ready: false as const,
      threshold_changed: false as const,
    },
    official_ohlcv_claim_prevented: true as const,
    sale_condition_gap_classification:
      "diagnostic_only_with_explicit_non_official_semantics" as const,
    input_immutable: true as const,
    metadata_inferred: false as const,
    normalization_performed: false as const,
    normalization_authorized: false as const,
    replay_authorized: false as const,
    canonical_binding_ready: false as const,
    shadow_only: true as const,
    live_ranking_effect: false as const,
  };
  if (
    stableMarketContextDiagnosticCandlePolicyJsonV1(input) !==
    snapshot
  ) {
    throw new Error("diagnostic_policy_input_mutated");
  }
  return {
    ...core,
    decision_digest: sha256(
      stableMarketContextDiagnosticCandlePolicyJsonV1(core),
    ),
  };
}
