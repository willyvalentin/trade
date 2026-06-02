import type { IntradayScanWindow } from "@/lib/intraday-scan-window";

export type ActiveScanTraceStage =
  | "route_received"
  | "provider_env"
  | "universe"
  | "market_data_fetch"
  | "raw_candidates"
  | "ranking"
  | "openai"
  | "persistence"
  | "final";

export type ActiveScanTraceStageStatus =
  | "not_reached"
  | "started"
  | "completed"
  | "skipped"
  | "failed";

export type ActiveScanTrace = {
  trace_id: string;
  generated_at: string;
  route_received_at: string | null;
  scheduled_function_fired_at_utc: string | null;
  interpreted_ny_time: string | null;
  market_status: string | null;
  market_session: string | null;
  scan_window: IntradayScanWindow | "unknown";
  orchestration_decision: string | null;
  should_scan_now: boolean | null;
  skip_reason: string | null;
  last_stage_reached: ActiveScanTraceStage;
  stages: Record<ActiveScanTraceStage, ActiveScanTraceStageStatus>;
  provider_env: {
    twelve_data_key_present: boolean;
    openai_key_present: boolean;
    polygon_key_present: boolean;
    supabase_service_role_present: boolean;
  };
  universe: {
    total_enabled: number | null;
    selected_tickers_count: number | null;
    selected_tickers_sample: string[];
    scan_budget: number | null;
  };
  market_data_fetch: {
    attempted_tickers: number;
    quote_success_count: number;
    quote_error_count: number;
    candle_success_count: number;
    candle_error_count: number;
    stale_count: number;
    empty_response_count: number;
    latest_provider_error_type: string | null;
  };
  raw_candidates: {
    raw_candidate_count: number;
    structurally_valid_count: number;
    invalid_price_plan_count: number;
    missing_required_fields_count: number;
    top_rejection_reasons: string[];
  };
  ranking: {
    ranking_attempted: boolean;
    ranked_count: number;
    selected_count: number;
    top_score: number | null;
    average_score: number | null;
    top_penalties: string[];
  };
  openai: {
    openai_attempted: boolean;
    input_candidate_count: number;
    output_recommendation_count: number;
    parser_rejected_count: number;
    openai_error_type: string | null;
  };
  persistence: {
    scan_run_persisted: boolean;
    batch_persisted: boolean;
    snapshots_persisted_count: number;
    persistence_error_type: string | null;
  };
  final: {
    decision: string | null;
    status: string | null;
    candidates_generated: number;
    recommendations_served: number;
    recommendations_created: number;
    ranked_candidates_count: number;
    recommendations_published_count: number;
    strong_count: number;
    valid_count: number;
    experimental_count: number;
    ranked_candidates_not_published_reason: string | null;
    strong_threshold: number | null;
    publishable_threshold: number | null;
    deterministic_fallback_used: boolean;
    batch_fingerprint: string | null;
    scan_run_fingerprint: string | null;
    zero_candidate_reason: string | null;
  };
};

export type ActiveScanTraceRecorder = {
  trace: ActiveScanTrace;
  markStage: (
    stage: ActiveScanTraceStage,
    status?: ActiveScanTraceStageStatus,
  ) => void;
  update: (patch: Partial<ActiveScanTrace>) => void;
  updateProviderEnv: () => void;
  updateUniverse: (patch: Partial<ActiveScanTrace["universe"]>) => void;
  updateMarketDataFetch: (
    patch: Partial<ActiveScanTrace["market_data_fetch"]>,
  ) => void;
  incrementMarketDataFetch: (
    patch: Partial<ActiveScanTrace["market_data_fetch"]>,
  ) => void;
  updateRawCandidates: (
    patch: Partial<ActiveScanTrace["raw_candidates"]>,
  ) => void;
  updateRanking: (patch: Partial<ActiveScanTrace["ranking"]>) => void;
  updateOpenAi: (patch: Partial<ActiveScanTrace["openai"]>) => void;
  updatePersistence: (patch: Partial<ActiveScanTrace["persistence"]>) => void;
  updateFinal: (patch: Partial<ActiveScanTrace["final"]>) => void;
};

export function createActiveScanTrace({
  routeReceivedAt,
  scheduledFunctionFiredAtUtc,
  scanWindow,
}: {
  routeReceivedAt: string;
  scheduledFunctionFiredAtUtc?: string | null;
  scanWindow?: IntradayScanWindow | "unknown";
}): ActiveScanTraceRecorder {
  const trace: ActiveScanTrace = {
    trace_id: `active_scan_${routeReceivedAt}_${Math.random()
      .toString(36)
      .slice(2, 10)}`,
    generated_at: routeReceivedAt,
    route_received_at: routeReceivedAt,
    scheduled_function_fired_at_utc: scheduledFunctionFiredAtUtc ?? null,
    interpreted_ny_time: null,
    market_status: null,
    market_session: null,
    scan_window: scanWindow ?? "unknown",
    orchestration_decision: null,
    should_scan_now: null,
    skip_reason: null,
    last_stage_reached: "route_received",
    stages: {
      route_received: "completed",
      provider_env: "not_reached",
      universe: "not_reached",
      market_data_fetch: "not_reached",
      raw_candidates: "not_reached",
      ranking: "not_reached",
      openai: "not_reached",
      persistence: "not_reached",
      final: "not_reached",
    },
    provider_env: providerEnvSnapshot(),
    universe: {
      total_enabled: null,
      selected_tickers_count: null,
      selected_tickers_sample: [],
      scan_budget: null,
    },
    market_data_fetch: {
      attempted_tickers: 0,
      quote_success_count: 0,
      quote_error_count: 0,
      candle_success_count: 0,
      candle_error_count: 0,
      stale_count: 0,
      empty_response_count: 0,
      latest_provider_error_type: null,
    },
    raw_candidates: {
      raw_candidate_count: 0,
      structurally_valid_count: 0,
      invalid_price_plan_count: 0,
      missing_required_fields_count: 0,
      top_rejection_reasons: [],
    },
    ranking: {
      ranking_attempted: false,
      ranked_count: 0,
      selected_count: 0,
      top_score: null,
      average_score: null,
      top_penalties: [],
    },
    openai: {
      openai_attempted: false,
      input_candidate_count: 0,
      output_recommendation_count: 0,
      parser_rejected_count: 0,
      openai_error_type: null,
    },
    persistence: {
      scan_run_persisted: false,
      batch_persisted: false,
      snapshots_persisted_count: 0,
      persistence_error_type: null,
    },
    final: {
      decision: null,
      status: null,
      candidates_generated: 0,
      recommendations_served: 0,
      recommendations_created: 0,
      ranked_candidates_count: 0,
      recommendations_published_count: 0,
      strong_count: 0,
      valid_count: 0,
      experimental_count: 0,
      ranked_candidates_not_published_reason: null,
      strong_threshold: null,
      publishable_threshold: null,
      deterministic_fallback_used: false,
      batch_fingerprint: null,
      scan_run_fingerprint: null,
      zero_candidate_reason: null,
    },
  };

  function safely(action: () => void) {
    try {
      action();
    } catch (error) {
      console.error("[active-scan-trace] update_error", {
        error: error instanceof Error ? error.message : "Unknown trace error.",
      });
    }
  }

  return {
    trace,
    markStage(stage, status = "completed") {
      safely(() => {
        trace.last_stage_reached = stage;
        trace.stages[stage] = status;
      });
    },
    update(patch) {
      safely(() => {
        Object.assign(trace, patch);
      });
    },
    updateProviderEnv() {
      safely(() => {
        trace.provider_env = providerEnvSnapshot();
      });
    },
    updateUniverse(patch) {
      safely(() => {
        trace.universe = { ...trace.universe, ...patch };
      });
    },
    updateMarketDataFetch(patch) {
      safely(() => {
        trace.market_data_fetch = { ...trace.market_data_fetch, ...patch };
      });
    },
    incrementMarketDataFetch(patch) {
      safely(() => {
        for (const [key, value] of Object.entries(patch)) {
          if (typeof value !== "number") continue;

          const metric = key as keyof ActiveScanTrace["market_data_fetch"];
          const current = trace.market_data_fetch[metric];

          if (typeof current === "number") {
            (trace.market_data_fetch[metric] as number) = current + value;
          }
        }

        if (typeof patch.latest_provider_error_type === "string") {
          trace.market_data_fetch.latest_provider_error_type =
            patch.latest_provider_error_type;
        }
      });
    },
    updateRawCandidates(patch) {
      safely(() => {
        trace.raw_candidates = { ...trace.raw_candidates, ...patch };
      });
    },
    updateRanking(patch) {
      safely(() => {
        trace.ranking = { ...trace.ranking, ...patch };
      });
    },
    updateOpenAi(patch) {
      safely(() => {
        trace.openai = { ...trace.openai, ...patch };
      });
    },
    updatePersistence(patch) {
      safely(() => {
        trace.persistence = { ...trace.persistence, ...patch };
      });
    },
    updateFinal(patch) {
      safely(() => {
        trace.final = { ...trace.final, ...patch };
      });
    },
  };
}

export function providerEnvSnapshot(): ActiveScanTrace["provider_env"] {
  return {
    twelve_data_key_present: Boolean(process.env.TWELVE_DATA_API_KEY),
    openai_key_present: Boolean(process.env.OPENAI_API_KEY),
    polygon_key_present: Boolean(process.env.POLYGON_API_KEY),
    supabase_service_role_present: Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE ||
        process.env.SUPABASE_SERVICE_ROLE_SECRET,
    ),
  };
}

export function errorType(value: unknown) {
  if (value instanceof Error && value.name && value.name !== "Error") {
    return value.name;
  }

  if (value instanceof Error && value.message) {
    return value.message.split(":")[0]?.slice(0, 80) || "error";
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim().slice(0, 80);
  }

  return "unknown_error";
}

export function zeroCandidateReason(trace: ActiveScanTrace) {
  if (trace.skip_reason) return trace.skip_reason;
  if (!trace.provider_env.twelve_data_key_present) return "twelve_data_key_missing";
  if (!trace.provider_env.openai_key_present) return "openai_key_missing";
  if ((trace.universe.selected_tickers_count ?? 0) === 0) return "empty_universe";
  if (
    trace.raw_candidates.raw_candidate_count === 0 &&
    trace.market_data_fetch.attempted_tickers > 0
  ) {
    if (
      trace.market_data_fetch.candle_success_count === 0 &&
      trace.market_data_fetch.quote_success_count === 0
    ) {
      return trace.market_data_fetch.latest_provider_error_type
        ? `provider_fetch_failed:${trace.market_data_fetch.latest_provider_error_type}`
        : "provider_fetch_returned_no_usable_data";
    }
  }
  if (trace.raw_candidates.raw_candidate_count === 0) return "no_raw_candidates";
  if (trace.raw_candidates.structurally_valid_count === 0) {
    return "no_structurally_valid_candidates";
  }
  if (trace.ranking.ranking_attempted && trace.ranking.selected_count === 0) {
    return "ranking_selected_zero_candidates";
  }
  if (trace.openai.openai_attempted && trace.openai.output_recommendation_count === 0) {
    return trace.openai.openai_error_type
      ? `openai_failed:${trace.openai.openai_error_type}`
      : "openai_returned_no_recommendations";
  }

  return "scan_completed_without_recommendations";
}
