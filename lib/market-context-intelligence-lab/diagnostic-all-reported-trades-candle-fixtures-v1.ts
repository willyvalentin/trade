import {
  MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1,
  MARKET_CONTEXT_DIAGNOSTIC_LINEAGE_POLICY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_NORMALIZATION_GATE_V1,
  MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1,
  MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS,
  MARKET_CONTEXT_M5F_COMBINED_CALENDAR_DIGEST,
  MARKET_CONTEXT_M5F_EVIDENCE_DIGEST,
  MARKET_CONTEXT_M5F_RAW_FILE_DIGEST_ROOT,
  MARKET_CONTEXT_M5F_REPORT_DIGEST,
  MARKET_CONTEXT_M5F_SESSION_DATES,
  MARKET_CONTEXT_SALE_CONDITION_GAP_DECISION_V1,
  type MarketContextDiagnosticCandlePolicyInputV1,
} from "./diagnostic-all-reported-trades-candle-policy-v1";

export const MARKET_CONTEXT_ACTION_667M5G_SYNTHETIC_FIXTURES_V1 =
  "market_context_action_667m5g_synthetic_fixtures_v1" as const;

export function marketContextDiagnosticCandlePolicyFixtureV1():
  MarketContextDiagnosticCandlePolicyInputV1 {
  return {
    policy_version:
      MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1,
    decision_version:
      MARKET_CONTEXT_SALE_CONDITION_GAP_DECISION_V1,
    gate_version: MARKET_CONTEXT_DIAGNOSTIC_NORMALIZATION_GATE_V1,
    source: {
      provider: "Databento",
      dataset: "EQUS.MINI",
      schema: "trades",
      publisher_id: 95,
      encoding: "dbn",
      compression: "zstd",
    },
    evidence: {
      m5f_evidence_digest: MARKET_CONTEXT_M5F_EVIDENCE_DIGEST,
      m5f_report_digest: MARKET_CONTEXT_M5F_REPORT_DIGEST,
      raw_file_digest_root:
        MARKET_CONTEXT_M5F_RAW_FILE_DIGEST_ROOT,
      file_count: 20,
      session_count: 20,
      record_count: 2_420_049,
    },
    calendar: {
      exchange: "XNYS",
      combined_calendar_digest:
        MARKET_CONTEXT_M5F_COMBINED_CALENDAR_DIGEST,
      session_dates: [...MARKET_CONTEXT_M5F_SESSION_DATES],
      missing_or_unknown_session_count: 0,
    },
    observed_inventory: {
      actions: { T: 2_420_049 },
      flags: { "0": 597_734, "128": 1_822_315 },
      unknown_action_count: 0,
      unknown_flag_bit_count: 0,
      publisher_specific_unresolved_count: 0,
      bad_receive_timestamp_flag_count: 0,
      negative_receive_lag_count: 0,
      undefined_timestamp_count: 0,
    },
    sale_conditions: {
      semantics_available: false,
      mapping_status: "not_available",
      mapping_version: null,
    },
    point_in_time: {
      as_of_unix_ns: "1784937600000000000",
      maximum_ts_event_unix_ns: "1784929930675509383",
      maximum_ts_recv_unix_ns: "1784929930675543982",
      event_after_as_of_count: 0,
      receive_after_as_of_count: 0,
    },
    lineage: {
      policy_version: MARKET_CONTEXT_DIAGNOSTIC_LINEAGE_POLICY_V1,
      source_file_identity: "compressed_file_sha256",
      record_identity:
        "source_file_sha256_plus_zero_based_record_ordinal",
      record_identity_complete: true,
      record_identity_collision_count: 0,
      bucket_identity:
        "symbol_plus_session_date_plus_bucket_start_unix_ns",
      ts_event_preserved_as_unix_ns: true,
      ts_recv_preserved_as_unix_ns: true,
    },
    candle_shape: {
      interval: "1min",
      bucket_time_basis: "exchange_event_time",
      ordering:
        "ts_event_then_source_file_sha256_then_zero_based_record_ordinal",
      no_forward_fill: true,
      explicit_gaps: true,
      partial_bucket_policy: "omit_until_provisional_watermark",
    },
    watermark: {
      identity:
        MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1,
      value_ns: MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS,
      status: "empirically_unvalidated",
      twenty_session_receive_lag_gate_passed: true,
      records_after_candle_end_plus_watermark: 0,
      provider_certified: false,
      production_ready: false,
    },
    adjustment: {
      state: "raw_unadjusted",
      corporate_actions_available: false,
      corporate_actions_included: false,
      adjustment_inferred: false,
    },
    requested_claims: {
      provider_official_or_eligibility_filtered: false,
      official_ohlcv_claimed: false,
      canonical_performance_eligible: false,
      live_ranking_effect: false,
    },
    retention: {
      namespace: MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1,
      purpose: "offline_diagnostic_only",
      canonical_export_allowed: false,
      live_export_allowed: false,
    },
  };
}
