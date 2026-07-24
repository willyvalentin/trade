export type HistoricalCandleStorageVerificationStatus = "yes" | "no" | "unknown";

export type HistoricalCandleStorageReadinessInput = {
  migration_draft_reviewed?: boolean | null;
  migration_detection?: {
    historical_candles_table_detected?: boolean | null;
    historical_candle_fetch_runs_table_detected?: boolean | null;
    expected_unique_key_detected?: boolean | null;
    expected_indexes_detected?: boolean | null;
    rls_enabled_detected?: boolean | null;
    client_write_policies_detected?: boolean | null;
    client_read_policies_detected?: boolean | null;
    schema_readback_attempted?: boolean | null;
    schema_readback_status?: "ok" | "partial" | "blocked" | "unavailable" | null;
    schema_readback_missing_items?: string[] | null;
    schema_readback_warnings?: string[] | null;
    detection_source?: string | null;
    checked_at?: string | null;
    error_message?: string | null;
  } | null;
};

export type HistoricalCandleStorageReadinessSummary = {
  advisory_only: true;
  proposed_schema: {
    primary_table: "historical_candles";
    fetch_runs_table: "historical_candle_fetch_runs";
    provider: "twelve_data";
    candle_contract_version: "v1";
  };
  historical_candles_table: {
    required_columns: string[];
    optional_columns: string[];
    proposed_unique_key: string[];
    proposed_indexes: string[];
    dedupe_required: true;
    reuse_before_fetch: true;
  };
  historical_candle_fetch_runs_table: {
    required_columns: string[];
    proposed_indexes: string[];
    purpose: string;
  };
  retention_policy: {
    ttl_policy_required: true;
    default_retention_days: number | null;
    intraday_retention_days_recommended: number | null;
    daily_retention_days_recommended: number | null;
    manual_review_required: true;
    deletion_blocked_when_referenced_by_synthetic_outcomes: true;
  };
  rls_and_access: {
    service_role_write_only: true;
    user_read_required: false;
    diagnostics_read_allowed: true;
    public_client_write_allowed: false;
    public_client_read_allowed: false;
    raw_provider_payload_ui_exposure_allowed: false;
  };
  lookahead_safety: {
    stored_candles_can_include_future_relative_to_replay: true;
    replay_signal_generation_must_filter_to_analysis_cutoff: true;
    outcome_evaluation_can_use_after_cutoff: true;
    sample_origin_must_be_tagged: true;
  };
  migration_readiness: {
    migration_file_present: true;
    migration_applied: HistoricalCandleStorageVerificationStatus;
    historical_candles_table_detected: HistoricalCandleStorageVerificationStatus;
    historical_candle_fetch_runs_table_detected: HistoricalCandleStorageVerificationStatus;
    expected_unique_key_detected: HistoricalCandleStorageVerificationStatus;
    expected_indexes_detected: HistoricalCandleStorageVerificationStatus;
    rls_enabled_detected: HistoricalCandleStorageVerificationStatus;
    client_write_policies_detected: HistoricalCandleStorageVerificationStatus;
    client_read_policies_detected: HistoricalCandleStorageVerificationStatus;
    client_writes_allowed: HistoricalCandleStorageVerificationStatus;
    client_reads_allowed: HistoricalCandleStorageVerificationStatus;
    schema_readback_attempted: boolean;
    schema_readback_status: "ok" | "partial" | "blocked" | "unavailable";
    schema_readback_missing_items: string[];
    schema_readback_warnings: string[];
    service_role_internal_access_expected: true;
    detection_source: string;
    checked_at: string | null;
    error_message: string | null;
    ready_to_write_migration: boolean;
    ready_to_apply_migration: boolean;
    ready_to_fetch_historical_data: false;
    ready_to_persist_candles: false;
    ready_to_use_for_backfill: false;
    ready_to_use_for_scanner: false;
  };
  safety: {
    advisory_only: true;
    migration_applied: HistoricalCandleStorageVerificationStatus;
    provider_fetch_added: false;
    historical_fetch_added: false;
    candles_persisted: false;
    synthetic_outcomes_persisted: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_manual_review: true;
  };
  recommended_next_steps: string[];
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
};

const historicalCandlesRequiredColumns = [
  "id",
  "provider",
  "ticker",
  "interval",
  "timestamp",
  "trading_day",
  "session",
  "timezone",
  "open",
  "high",
  "low",
  "close",
  "volume",
  "adjusted",
  "source",
  "cache_key",
  "created_at",
  "updated_at",
];

const historicalCandlesOptionalColumns = [
  "provider_request_id",
  "fetch_run_id",
  "raw_payload",
  "metadata",
  "quality_flags",
  "validation_status",
  "duplicate_of_id",
];

const historicalCandlesUniqueKey = [
  "provider",
  "ticker",
  "interval",
  "timestamp",
  "adjusted",
];

const historicalCandlesIndexes = [
  "ticker_interval_timestamp",
  "provider_ticker_trading_day",
  "interval_timestamp",
  "fetch_run_id",
  "validation_status",
];

const fetchRunsRequiredColumns = [
  "id",
  "provider",
  "request_type",
  "ticker_count",
  "candle_count",
  "interval",
  "trading_day_start",
  "trading_day_end",
  "requested_at",
  "completed_at",
  "status",
  "error_type",
  "provider_credits_estimated",
  "provider_credits_used",
  "cache_hits",
  "cache_misses",
  "created_at",
  "metadata",
];

const fetchRunsIndexes = [
  "provider_requested_at",
  "provider_status_requested_at",
  "interval_trading_day_start",
  "status_completed_at",
];

function statusFromBoolean(
  value: boolean | null | undefined,
): HistoricalCandleStorageVerificationStatus {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "unknown";
}

function allKnownYes(
  values: HistoricalCandleStorageVerificationStatus[],
): HistoricalCandleStorageVerificationStatus {
  if (values.every((value) => value === "yes")) return "yes";
  if (values.some((value) => value === "no")) return "no";
  return "unknown";
}

export function buildHistoricalCandleStorageReadiness(
  input: HistoricalCandleStorageReadinessInput = {},
): HistoricalCandleStorageReadinessSummary {
  const historicalCandlesDetected = statusFromBoolean(
    input.migration_detection?.historical_candles_table_detected,
  );
  const fetchRunsDetected = statusFromBoolean(
    input.migration_detection?.historical_candle_fetch_runs_table_detected,
  );
  const uniqueKeyDetected = statusFromBoolean(
    input.migration_detection?.expected_unique_key_detected,
  );
  const indexesDetected = statusFromBoolean(
    input.migration_detection?.expected_indexes_detected,
  );
  const rlsEnabledDetected = statusFromBoolean(
    input.migration_detection?.rls_enabled_detected,
  );
  const clientWritePoliciesDetected = statusFromBoolean(
    input.migration_detection?.client_write_policies_detected,
  );
  const clientReadPoliciesDetected = statusFromBoolean(
    input.migration_detection?.client_read_policies_detected,
  );
  const migrationApplied = allKnownYes([
    historicalCandlesDetected,
    fetchRunsDetected,
  ]);
  const clientWritesAllowed =
    clientWritePoliciesDetected === "yes"
      ? "yes"
      : clientWritePoliciesDetected === "no"
        ? "no"
        : "unknown";
  const clientReadsAllowed =
    clientReadPoliciesDetected === "yes"
      ? "yes"
      : clientReadPoliciesDetected === "no"
        ? "no"
        : "unknown";
  const detectionSource =
    input.migration_detection?.detection_source?.trim() || "not_checked";
  const detectionError =
    input.migration_detection?.error_message?.trim() || null;
  const schemaReadbackAttempted =
    input.migration_detection?.schema_readback_attempted === true;
  const schemaReadbackStatus =
    input.migration_detection?.schema_readback_status ?? "unavailable";
  const schemaReadbackMissingItems =
    input.migration_detection?.schema_readback_missing_items ?? [];
  const schemaReadbackWarnings =
    input.migration_detection?.schema_readback_warnings ?? [];
  const metadataGaps: string[] = [];
  const cautionFlags = [
    "provider_fetch_not_enabled",
    "candle_persistence_not_enabled",
    "manual_review_required_before_retention_actions",
  ];
  const reasonCodes = ["historical_candle_storage_migration_schema_only"];

  if (!input.migration_draft_reviewed) {
    metadataGaps.push("migration_draft_review_status_missing");
  }
  if (detectionSource === "not_checked") {
    metadataGaps.push("migration_detection_not_checked");
  }
  if (!schemaReadbackAttempted) {
    metadataGaps.push("schema_readback_not_attempted");
  }
  if (schemaReadbackStatus === "blocked") {
    cautionFlags.push("schema_readback_blocked");
  }
  if (schemaReadbackStatus === "unavailable") {
    cautionFlags.push("schema_readback_unavailable");
  }
  if (schemaReadbackStatus === "partial") {
    cautionFlags.push("schema_readback_partial");
  }
  for (const missingItem of schemaReadbackMissingItems) {
    reasonCodes.push(`schema_readback_missing_${missingItem}`);
  }
  for (const warning of schemaReadbackWarnings) {
    if (warning.trim()) cautionFlags.push(warning.trim());
  }
  if (historicalCandlesDetected !== "yes") {
    reasonCodes.push("historical_candles_table_not_detected");
  }
  if (fetchRunsDetected !== "yes") {
    reasonCodes.push("historical_candle_fetch_runs_table_not_detected");
  }
  if (uniqueKeyDetected !== "yes") {
    reasonCodes.push("historical_candle_unique_key_not_verified");
  }
  if (indexesDetected !== "yes") {
    reasonCodes.push("historical_candle_indexes_not_verified");
  }
  if (rlsEnabledDetected !== "yes") {
    reasonCodes.push("historical_candle_rls_not_verified");
  }
  if (migrationApplied !== "yes") {
    cautionFlags.push("migration_not_detected_as_applied");
  }
  if (clientWritesAllowed !== "no") {
    cautionFlags.push("client_write_policy_status_requires_review");
  }
  if (clientReadsAllowed !== "no") {
    cautionFlags.push("client_read_policy_status_requires_review");
  }
  if (detectionError) {
    cautionFlags.push("migration_detection_error");
  }

  return {
    advisory_only: true,
    proposed_schema: {
      primary_table: "historical_candles",
      fetch_runs_table: "historical_candle_fetch_runs",
      provider: "twelve_data",
      candle_contract_version: "v1",
    },
    historical_candles_table: {
      required_columns: historicalCandlesRequiredColumns,
      optional_columns: historicalCandlesOptionalColumns,
      proposed_unique_key: historicalCandlesUniqueKey,
      proposed_indexes: historicalCandlesIndexes,
      dedupe_required: true,
      reuse_before_fetch: true,
    },
    historical_candle_fetch_runs_table: {
      required_columns: fetchRunsRequiredColumns,
      proposed_indexes: fetchRunsIndexes,
      purpose:
        "Audit historical candle cache planning, cache hits, provider credits, and skipped/error fetch attempts before persistence is enabled.",
    },
    retention_policy: {
      ttl_policy_required: true,
      default_retention_days: null,
      intraday_retention_days_recommended: 90,
      daily_retention_days_recommended: 730,
      manual_review_required: true,
      deletion_blocked_when_referenced_by_synthetic_outcomes: true,
    },
    rls_and_access: {
      service_role_write_only: true,
      user_read_required: false,
      diagnostics_read_allowed: true,
      public_client_write_allowed: false,
      public_client_read_allowed: false,
      raw_provider_payload_ui_exposure_allowed: false,
    },
    lookahead_safety: {
      stored_candles_can_include_future_relative_to_replay: true,
      replay_signal_generation_must_filter_to_analysis_cutoff: true,
      outcome_evaluation_can_use_after_cutoff: true,
      sample_origin_must_be_tagged: true,
    },
    migration_readiness: {
      migration_file_present: true,
      migration_applied: migrationApplied,
      historical_candles_table_detected: historicalCandlesDetected,
      historical_candle_fetch_runs_table_detected: fetchRunsDetected,
      expected_unique_key_detected: uniqueKeyDetected,
      expected_indexes_detected: indexesDetected,
      rls_enabled_detected: rlsEnabledDetected,
      client_write_policies_detected: clientWritePoliciesDetected,
        client_read_policies_detected: clientReadPoliciesDetected,
        client_writes_allowed: clientWritesAllowed,
        client_reads_allowed: clientReadsAllowed,
        schema_readback_attempted: schemaReadbackAttempted,
        schema_readback_status: schemaReadbackStatus,
        schema_readback_missing_items: schemaReadbackMissingItems,
        schema_readback_warnings: schemaReadbackWarnings,
        service_role_internal_access_expected: true,
      detection_source: detectionSource,
      checked_at: input.migration_detection?.checked_at?.trim() || null,
      error_message: detectionError,
      ready_to_write_migration: true,
      ready_to_apply_migration: migrationApplied !== "yes",
      ready_to_fetch_historical_data: false,
      ready_to_persist_candles: false,
      ready_to_use_for_backfill: false,
      ready_to_use_for_scanner: false,
    },
    safety: {
      advisory_only: true,
      migration_applied: migrationApplied,
      provider_fetch_added: false,
      historical_fetch_added: false,
      candles_persisted: false,
      synthetic_outcomes_persisted: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
    recommended_next_steps: [
      "review_historical_candle_storage_migration",
      "apply_migration_in_target_supabase_environment",
      "verify_tables_indexes_constraints_and_rls",
      "feed_safe_schema_readback_into_market_diagnostics",
      "review_rls_service_role_only_write_policy",
      "define_retention_ttl_and_compression_policy",
      "generate_database_types_only_after_migration_apply",
    ],
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    metadata_gaps: metadataGaps,
  };
}

export function historicalCandleStorageReadinessJson(
  summary: HistoricalCandleStorageReadinessSummary,
) {
  return JSON.stringify(summary, null, 2);
}
