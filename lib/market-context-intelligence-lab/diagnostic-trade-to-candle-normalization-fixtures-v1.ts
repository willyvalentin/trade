import {
  evaluateDiagnosticNormalizationPreflightV1,
  MARKET_CONTEXT_DIAGNOSTIC_DUPLICATE_POLICY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_TRADE_TO_CANDLE_NORMALIZATION_V1,
  MARKET_CONTEXT_M5G_EVIDENCE_DIGEST,
  MARKET_CONTEXT_M5F_FILE_COUNT,
  MARKET_CONTEXT_M5F_RECORD_COUNT,
  MARKET_CONTEXT_M5F_SYMBOL_COUNT,
  type MarketContextDiagnosticNormalizationPreflightV1,
} from "./diagnostic-trade-to-candle-normalization-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1,
  MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1,
  MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS,
  MARKET_CONTEXT_M5F_COMBINED_CALENDAR_DIGEST,
  MARKET_CONTEXT_M5F_RAW_FILE_DIGEST_ROOT,
  MARKET_CONTEXT_M5F_SESSION_DATES,
} from "./diagnostic-all-reported-trades-candle-policy-v1";

export const MARKET_CONTEXT_ACTION_667M5H_SYNTHETIC_FIXTURES_V1 =
  "market_context_action_667m5h_synthetic_fixtures_v1" as const;

export function diagnosticNormalizationPreflightFixtureV1(): MarketContextDiagnosticNormalizationPreflightV1 {
  return {
    normalization_version:
      MARKET_CONTEXT_DIAGNOSTIC_TRADE_TO_CANDLE_NORMALIZATION_V1,
    policy_version:
      MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1,
    namespace: MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1,
    source: {
      dataset: "EQUS.MINI",
      schema: "trades",
      encoding: "dbn",
      compression: "zstd",
      publisher_id: 95,
    },
    evidence: {
      m5g_evidence_digest: MARKET_CONTEXT_M5G_EVIDENCE_DIGEST,
      raw_file_digest_root:
        MARKET_CONTEXT_M5F_RAW_FILE_DIGEST_ROOT,
      calendar_digest: MARKET_CONTEXT_M5F_COMBINED_CALENDAR_DIGEST,
      raw_file_count: MARKET_CONTEXT_M5F_FILE_COUNT,
      raw_record_count: MARKET_CONTEXT_M5F_RECORD_COUNT,
      session_count: 20,
      symbol_count: MARKET_CONTEXT_M5F_SYMBOL_COUNT,
    },
    admitted_inventory: {
      actions: { T: MARKET_CONTEXT_M5F_RECORD_COUNT },
      flags: { "0": 597_734, "128": 1_822_315 },
      unknown_action_count: 0,
      unknown_flag_bit_count: 0,
      negative_receive_lag_count: 0,
      scope_deviation_count: 0,
      undefined_or_sentinel_count: 0,
    },
    calendar: {
      exchange: "XNYS",
      session_dates: [...MARKET_CONTEXT_M5F_SESSION_DATES],
      all_regular_core_sessions: true,
    },
    duplicate_handling: {
      policy: MARKET_CONTEXT_DIAGNOSTIC_DUPLICATE_POLICY_V1,
      exact_duplicate_record_count: 3_399,
      silent_deduplication_allowed: false,
      stable_identity:
        "source_file_sha256_plus_zero_based_record_ordinal",
      stable_identity_collision_count: 0,
    },
    decoder: {
      package: "databento-dbn",
      version: "0.63.0",
      native_build_sha256:
        "b7c8a753b737730a44c8d57263dca4f59a6c7a7679675469159dd0edc3a508db",
      module_sha256:
        "5bdc9146c2a6b4059389d7ca4e47bde1e243b8110db9e70d6d9d813a0a11b13f",
    },
    output: {
      destination_outside_git: true,
      destination_filevault_encrypted: true,
      directory_mode: "0700",
      file_mode: "0600",
    },
    claims: {
      diagnostic_all_reported_trades: true,
      official_ohlcv_claimed: false,
      canonical_performance_eligible: false,
      sale_condition_semantics_available: false,
      raw_unadjusted: true,
      corporate_actions_applied: false,
      watermark_identity:
        MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1,
      watermark_value_ns: MARKET_CONTEXT_DIAGNOSTIC_WATERMARK_NS,
      watermark_status: "empirically_unvalidated",
      live_ranking_effect: false,
    },
  };
}

export function diagnosticNormalizationExpectedResultV1() {
  return evaluateDiagnosticNormalizationPreflightV1(
    diagnosticNormalizationPreflightFixtureV1(),
  );
}
