import type { HistoricalBackfillDryRunPipelineSummary } from "@/lib/historical-backfill-dry-run-pipeline";
import type {
  HistoricalBackfillFetchPlanSummary,
} from "@/lib/historical-backfill-fetch-planner";
import type { HistoricalCandleStorageReadinessSummary } from "@/lib/historical-candle-storage-readiness";

export type HistoricalBackfillExecutionReadinessStatus =
  | "blocked"
  | "not_ready"
  | "ready_for_manual_review"
  | "ready_for_first_tiny_fetch_later";

export type HistoricalBackfillExecutionReadinessSignal =
  | boolean
  | "unknown";

export type HistoricalBackfillExecutionReadinessInput = {
  storage_readiness?: HistoricalCandleStorageReadinessSummary | null;
  dry_run_pipeline?: HistoricalBackfillDryRunPipelineSummary | null;
  fetch_plan?: HistoricalBackfillFetchPlanSummary | null;
  provider_env_present?: HistoricalBackfillExecutionReadinessSignal | null;
};

export type HistoricalBackfillExecutionReadinessSummary = {
  advisory_only: true;
  readiness_status: HistoricalBackfillExecutionReadinessStatus;
  prerequisites: {
    migration_file_exists: HistoricalBackfillExecutionReadinessSignal;
    migration_applied: HistoricalBackfillExecutionReadinessSignal;
    historical_candles_table_detected: HistoricalBackfillExecutionReadinessSignal;
    historical_candle_fetch_runs_table_detected:
      HistoricalBackfillExecutionReadinessSignal;
    unique_key_detected: HistoricalBackfillExecutionReadinessSignal;
    indexes_detected: HistoricalBackfillExecutionReadinessSignal;
    rls_enabled: HistoricalBackfillExecutionReadinessSignal;
    client_writes_allowed: HistoricalBackfillExecutionReadinessSignal;
    client_reads_allowed: HistoricalBackfillExecutionReadinessSignal;
    dry_run_pipeline_ready: boolean;
    request_contract_ready: boolean;
    response_parser_ready: boolean;
    persistence_plan_ready: boolean;
    provider_env_present: HistoricalBackfillExecutionReadinessSignal;
    provider_budget_policy_present: boolean;
    lookahead_safety_present: boolean;
    manual_approval_required: true;
  };
  first_fetch_candidate_plan: {
    enabled: false;
    dry_run_only: true;
    provider: "twelve_data";
    max_tickers: number;
    max_trading_days: number;
    interval: "5min";
    selected_candidate_tickers: string[];
    reason: string;
  };
  blockers: string[];
  warnings: string[];
  readiness_gates: {
    migration_gate_passed: boolean;
    provider_gate_passed: boolean;
    dry_run_gate_passed: boolean;
    budget_gate_passed: boolean;
    lookahead_gate_passed: boolean;
    manual_approval_gate_passed: false;
  };
  safety: {
    advisory_only: true;
    provider_fetch_added: false;
    historical_fetch_added: false;
    candles_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_manual_review: true;
  };
  recommended_next_steps: string[];
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
};

function signalFromStorage(
  value: "yes" | "no" | "unknown" | boolean | null | undefined,
): HistoricalBackfillExecutionReadinessSignal {
  if (value === true || value === "yes") return true;
  if (value === false || value === "no") return false;
  return "unknown";
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function selectedTickers(input: HistoricalBackfillExecutionReadinessInput) {
  const tickers =
    input.fetch_plan?.ticker_selection.selected_tickers ??
    input.dry_run_pipeline?.fetch_plan_summary.selected_tickers ??
    [];
  const seen = new Set<string>();

  return tickers
    .map((ticker) => ticker.trim().toUpperCase())
    .filter((ticker) => {
      if (!ticker || ticker === "UNKNOWN" || seen.has(ticker)) return false;
      seen.add(ticker);
      return true;
    })
    .slice(0, 3);
}

function providerSignal(
  value: HistoricalBackfillExecutionReadinessInput["provider_env_present"],
): HistoricalBackfillExecutionReadinessSignal {
  if (value === true || value === false || value === "unknown") return value;
  return "unknown";
}

export function buildHistoricalBackfillExecutionReadiness(
  input: HistoricalBackfillExecutionReadinessInput = {},
): HistoricalBackfillExecutionReadinessSummary {
  const storage = input.storage_readiness ?? null;
  const pipeline = input.dry_run_pipeline ?? null;
  const providerEnvPresent = providerSignal(input.provider_env_present);
  const migrationFileExists = signalFromStorage(
    storage?.migration_readiness.migration_file_present,
  );
  const migrationApplied = signalFromStorage(
    storage?.migration_readiness.migration_applied,
  );
  const historicalCandlesTableDetected = signalFromStorage(
    storage?.migration_readiness.historical_candles_table_detected,
  );
  const fetchRunsTableDetected = signalFromStorage(
    storage?.migration_readiness.historical_candle_fetch_runs_table_detected,
  );
  const uniqueKeyDetected = signalFromStorage(
    storage?.migration_readiness.expected_unique_key_detected,
  );
  const indexesDetected = signalFromStorage(
    storage?.migration_readiness.expected_indexes_detected,
  );
  const rlsEnabled = signalFromStorage(
    storage?.migration_readiness.rls_enabled_detected,
  );
  const clientWritesAllowed = signalFromStorage(
    storage?.migration_readiness.client_writes_allowed,
  );
  const clientReadsAllowed = signalFromStorage(
    storage?.migration_readiness.client_reads_allowed,
  );
  const dryRunPipelineReady = pipeline?.pipeline_status === "ready";
  const requestContractReady =
    (pipeline?.request_contract_summary.requests_planned ?? 0) > 0 &&
    (pipeline?.request_contract_summary.invalid_requests ?? 1) === 0;
  const responseParserReady =
    (pipeline?.parser_summary.normalized_candles ?? 0) > 0 &&
    (pipeline?.parser_summary.valid_candles ?? 0) > 0;
  const persistencePlanReady =
    pipeline?.pipeline_steps.persistence_plan_built === true &&
    (pipeline?.persistence_summary.planned_invalid_rejections ?? 1) === 0;
  const providerBudgetPolicyPresent =
    input.fetch_plan?.budget_policy.background_backfill_priority === "low" ||
    pipeline?.components.fetch_plan.budget_policy.background_backfill_priority ===
      "low";
  const lookaheadSafetyPresent =
    input.fetch_plan?.lookahead_safety.analysis_cutoff_required === true ||
    pipeline?.components.fetch_plan.lookahead_safety.analysis_cutoff_required ===
      true;
  const blockers: string[] = [];
  const warnings: string[] = [];
  const reasonCodes = ["historical_backfill_execution_readiness_advisory_only"];
  const cautionFlags = [
    "advisory_only",
    "first_fetch_disabled",
    "manual_approval_required",
  ];
  const metadataGaps: string[] = [];

  if (
    migrationFileExists !== true ||
    migrationApplied !== true ||
    historicalCandlesTableDetected !== true ||
    fetchRunsTableDetected !== true ||
    uniqueKeyDetected !== true ||
    indexesDetected !== true ||
    rlsEnabled !== true ||
    clientWritesAllowed !== false ||
    clientReadsAllowed !== false
  ) {
    pushUnique(blockers, "apply_or_verify_historical_candle_storage_migration");
    pushUnique(reasonCodes, "historical_candle_storage_migration_not_verified");
  }
  if (migrationFileExists === "unknown") {
    pushUnique(metadataGaps, "migration_file_detection_unknown");
  }
  if (migrationApplied === "unknown") {
    pushUnique(metadataGaps, "migration_applied_detection_unknown");
  }
  if (historicalCandlesTableDetected === "unknown") {
    pushUnique(metadataGaps, "historical_candles_table_detection_unknown");
  }
  if (fetchRunsTableDetected === "unknown") {
    pushUnique(
      metadataGaps,
      "historical_candle_fetch_runs_table_detection_unknown",
    );
  }
  if (uniqueKeyDetected === "unknown") {
    pushUnique(metadataGaps, "historical_candles_unique_key_detection_unknown");
  }
  if (indexesDetected === "unknown") {
    pushUnique(metadataGaps, "historical_candle_indexes_detection_unknown");
  }
  if (rlsEnabled === "unknown") {
    pushUnique(metadataGaps, "historical_candle_rls_detection_unknown");
  }
  if (clientWritesAllowed === "unknown") {
    pushUnique(metadataGaps, "client_write_policy_detection_unknown");
  }
  if (clientReadsAllowed === "unknown") {
    pushUnique(metadataGaps, "client_read_policy_detection_unknown");
  }
  if (!pipeline) {
    pushUnique(blockers, "historical_backfill_dry_run_pipeline_missing");
    pushUnique(metadataGaps, "dry_run_pipeline_missing");
  } else if (!dryRunPipelineReady) {
    pushUnique(blockers, "historical_backfill_dry_run_pipeline_not_ready");
  }
  if (!requestContractReady) {
    pushUnique(blockers, "historical_backfill_request_contract_not_ready");
  }
  if (!responseParserReady) {
    pushUnique(blockers, "historical_backfill_response_parser_not_ready");
  }
  if (!persistencePlanReady) {
    pushUnique(blockers, "historical_candle_persistence_plan_not_ready");
  }
  if (providerEnvPresent !== true) {
    pushUnique(warnings, "provider_env_not_verified_for_future_fetch");
    pushUnique(reasonCodes, "provider_env_not_verified");
    if (providerEnvPresent === "unknown") {
      pushUnique(metadataGaps, "provider_env_detection_unknown");
    }
  }
  if (!providerBudgetPolicyPresent) {
    pushUnique(blockers, "provider_budget_policy_missing");
  }
  if (!lookaheadSafetyPresent) {
    pushUnique(blockers, "lookahead_safety_missing");
  }

  const migrationGatePassed =
    migrationFileExists === true &&
    migrationApplied === true &&
    historicalCandlesTableDetected === true &&
    fetchRunsTableDetected === true &&
    uniqueKeyDetected === true &&
    indexesDetected === true &&
    rlsEnabled === true &&
    clientWritesAllowed === false &&
    clientReadsAllowed === false;
  const providerGatePassed = providerEnvPresent === true;
  const dryRunGatePassed =
    dryRunPipelineReady &&
    requestContractReady &&
    responseParserReady &&
    persistencePlanReady;
  const budgetGatePassed = providerBudgetPolicyPresent;
  const lookaheadGatePassed = lookaheadSafetyPresent;
  let readinessStatus: HistoricalBackfillExecutionReadinessStatus = "blocked";

  if (blockers.length > 0) {
    readinessStatus = "blocked";
  } else if (
    !migrationGatePassed ||
    !dryRunGatePassed ||
    !budgetGatePassed ||
    !lookaheadGatePassed
  ) {
    readinessStatus = "not_ready";
  } else if (!providerGatePassed) {
    readinessStatus = "ready_for_manual_review";
  } else {
    readinessStatus = "ready_for_manual_review";
  }

  const tickers = selectedTickers(input);

  return {
    advisory_only: true,
    readiness_status: readinessStatus,
    prerequisites: {
      migration_file_exists: migrationFileExists,
      migration_applied: migrationApplied,
      historical_candles_table_detected: historicalCandlesTableDetected,
      historical_candle_fetch_runs_table_detected: fetchRunsTableDetected,
      unique_key_detected: uniqueKeyDetected,
      indexes_detected: indexesDetected,
      rls_enabled: rlsEnabled,
      client_writes_allowed: clientWritesAllowed,
      client_reads_allowed: clientReadsAllowed,
      dry_run_pipeline_ready: dryRunPipelineReady,
      request_contract_ready: requestContractReady,
      response_parser_ready: responseParserReady,
      persistence_plan_ready: persistencePlanReady,
      provider_env_present: providerEnvPresent,
      provider_budget_policy_present: providerBudgetPolicyPresent,
      lookahead_safety_present: lookaheadSafetyPresent,
      manual_approval_required: true,
    },
    first_fetch_candidate_plan: {
      enabled: false,
      dry_run_only: true,
      provider: "twelve_data",
      max_tickers: Math.max(1, Math.min(3, tickers.length || 1)),
      max_trading_days: 1,
      interval: "5min",
      selected_candidate_tickers: tickers,
      reason:
        "informational_first_tiny_fetch_plan_disabled_until_manual_approval",
    },
    blockers,
    warnings,
    readiness_gates: {
      migration_gate_passed: migrationGatePassed,
      provider_gate_passed: providerGatePassed,
      dry_run_gate_passed: dryRunGatePassed,
      budget_gate_passed: budgetGatePassed,
      lookahead_gate_passed: lookaheadGatePassed,
      manual_approval_gate_passed: false,
    },
    safety: {
      advisory_only: true,
      provider_fetch_added: false,
      historical_fetch_added: false,
      candles_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
    recommended_next_steps: [
      ...(migrationGatePassed
        ? []
        : ["apply_migration_and_rerun_diagnostics"]),
      ...(dryRunGatePassed
        ? []
        : ["fix_historical_backfill_dry_run_pipeline_before_fetch_review"]),
      ...(providerGatePassed
        ? []
        : ["verify_twelve_data_server_env_before_manual_fetch_review"]),
      "review_first_tiny_fetch_plan_with_manual_approval",
      "keep_provider_fetch_persistence_replay_and_scanner_effects_disabled",
    ],
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    metadata_gaps: metadataGaps,
  };
}
