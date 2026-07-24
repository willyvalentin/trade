import {
  buildFirstTinyHistoricalReplayDryRunResultVerification,
  type FirstTinyHistoricalReplayDryRunResultVerificationSummary,
} from "@/lib/first-tiny-historical-replay-dry-run-result-verification";
import {
  buildFirstTinyHistoricalReplaySignalPackageDiscoveryPlan,
  type FirstTinyHistoricalReplaySignalPackageDiscoveryPlanSummary,
} from "@/lib/first-tiny-historical-replay-signal-package-discovery-plan";

export const firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker =
  "action_303_first_tiny_replay_signal_package_discovery_readback";

export type FirstTinyHistoricalReplaySignalPackageDiscoveryStatus =
  | "not_run"
  | "no_candidates_found"
  | "candidates_found_none_compatible"
  | "compatible_signal_package_found"
  | "readback_unavailable"
  | "blocked_schema_unknown";

export type FirstTinyReplaySignalPackageSourceType =
  | "recommendation_row"
  | "recommendation_snapshot";

export type FirstTinyReplaySignalPackageCandidate = {
  candidate_id: string;
  source_type: FirstTinyReplaySignalPackageSourceType;
  source_row_id: string | null;
  ticker: string | null;
  trading_day: string | null;
  generated_at: string | null;
  analysis_cutoff: string | null;
  direction: "long" | "short" | null;
  entry: number | null;
  stop: number | null;
  target: number | null;
  confidence_or_tier: string | number | null;
  setup_label: string | null;
  source_metadata_present: boolean;
  missing_required_fields: string[];
  compatibility_reasons: string[];
  compatible: boolean;
};

export type FirstTinyReplaySignalPackageDiscoverySupabaseClient = {
  from: (table: string) => {
    select?: (columns?: string) => unknown;
    eq?: (column: string, value: unknown) => unknown;
    gte?: (column: string, value: string) => unknown;
    lte?: (column: string, value: string) => unknown;
    lt?: (column: string, value: string) => unknown;
    order?: (column: string, options?: Record<string, unknown>) => unknown;
    limit?: (count: number) => unknown;
  };
};

export type FirstTinyHistoricalReplaySignalPackageDiscoveryReadbackInput = {
  replay_result_verification?: FirstTinyHistoricalReplayDryRunResultVerificationSummary | null;
  discovery_plan?: FirstTinyHistoricalReplaySignalPackageDiscoveryPlanSummary | null;
  supabase_client?: FirstTinyReplaySignalPackageDiscoverySupabaseClient | null;
  execute_readback?: boolean | null;
  readback_unavailable_reason?: string | null;
};

export type FirstTinyHistoricalReplaySignalPackageDiscoveryReadbackSummary = {
  readback_marker: typeof firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker;
  discovery_status: FirstTinyHistoricalReplaySignalPackageDiscoveryStatus;
  source_verification: "first_tiny_replay_dry_run_input_verified_no_signal_package";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  readback_attempted: boolean;
  recommendation_rows_checked: number;
  recommendation_snapshots_checked: number;
  candidates_found: number;
  compatible_candidates: number;
  best_candidate_available: boolean;
  signal_package_available_now: boolean;
  signal_package_created_now: false;
  replay_executed: false;
  synthetic_outcomes_persisted: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  provider_call_executed: false;
  provider_call_attempted: false;
  candles_persisted: false;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  recommendation_rows_mutated: false;
  supabase_write_executed: false;
  scanner_universe_changed: false;
  thresholds_changed: false;
  outcome_evaluation_persistence_changed: false;
  learning_acceleration_changed: false;
  add_trade_affected: false;
  broker_execution_affected: false;
  risk_changed: false;
  ranking_change_allowed_now: false;
  scanner_use_allowed_now: false;
  synthetic_outcome_persistence_allowed_now: false;
  candidate_discovery_sources: string[];
  candidates: FirstTinyReplaySignalPackageCandidate[];
  top_missing_fields_or_reasons: string[];
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
};

const target = {
  ticker: "AAPL",
  interval: "5min",
  trading_day: "2026-07-08",
  day_start_utc: "2026-07-08T00:00:00.000Z",
  day_end_utc: "2026-07-09T00:00:00.000Z",
  candle_window_start_utc: "2026-07-08T13:45:00.000Z",
  candle_window_end_utc: "2026-07-08T19:45:00.000Z",
} as const;

const noEffectFields = {
  signal_package_created_now: false,
  replay_executed: false,
  synthetic_outcomes_persisted: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  provider_call_executed: false,
  provider_call_attempted: false,
  candles_persisted: false,
  raw_response_persisted: false,
  fetch_run_persisted: false,
  recommendation_rows_mutated: false,
  supabase_write_executed: false,
  scanner_universe_changed: false,
  thresholds_changed: false,
  outcome_evaluation_persistence_changed: false,
  learning_acceleration_changed: false,
  add_trade_affected: false,
  broker_execution_affected: false,
  risk_changed: false,
  ranking_change_allowed_now: false,
  scanner_use_allowed_now: false,
  synthetic_outcome_persistence_allowed_now: false,
} as const;

function baseSummary(
  overrides: Partial<FirstTinyHistoricalReplaySignalPackageDiscoveryReadbackSummary> = {},
): FirstTinyHistoricalReplaySignalPackageDiscoveryReadbackSummary {
  return {
    readback_marker: firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
    discovery_status: "not_run",
    source_verification:
      "first_tiny_replay_dry_run_input_verified_no_signal_package",
    ticker: target.ticker,
    interval: target.interval,
    trading_day: target.trading_day,
    readback_attempted: false,
    recommendation_rows_checked: 0,
    recommendation_snapshots_checked: 0,
    candidates_found: 0,
    compatible_candidates: 0,
    best_candidate_available: false,
    signal_package_available_now: false,
    ...noEffectFields,
    candidate_discovery_sources: [
      "recommendations",
      "recommendation_snapshots",
    ],
    candidates: [],
    top_missing_fields_or_reasons: [],
    blockers: [],
    warnings: [],
    recommended_next_steps: [
      "run_signal_package_discovery_readback_route",
      "keep_synthetic_outcomes_scanner_and_ranking_disabled",
    ],
    ...overrides,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function nestedValue(value: unknown, paths: string[][]): unknown {
  for (const path of paths) {
    let current: unknown = value;
    let found = true;
    for (const part of path) {
      const record = asRecord(current);
      if (!(part in record)) {
        found = false;
        break;
      }
      current = record[part];
    }
    if (found && current !== undefined && current !== null && current !== "") {
      return current;
    }
  }
  return null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeDirection(value: unknown): "long" | "short" | null {
  const normalized = text(value)?.toLowerCase();
  if (normalized === "long" || normalized === "buy" || normalized === "bullish") {
    return "long";
  }
  if (
    normalized === "short" ||
    normalized === "sell" ||
    normalized === "bearish"
  ) {
    return "short";
  }
  return null;
}

function tradingDayFromTimestamp(value: string | null): string | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toISOString().slice(0, 10);
}

function sourceMetadataPresent(row: Record<string, unknown>) {
  const payload = asRecord(row.payload_json);
  return Boolean(
    text(row.created_at) ||
      text(row.recommended_at) ||
      text(row.generated_at) ||
      Object.keys(payload).length > 0,
  );
}

function extractCandidate(
  row: Record<string, unknown>,
  sourceType: FirstTinyReplaySignalPackageSourceType,
): FirstTinyReplaySignalPackageCandidate {
  const payload = asRecord(row.payload_json);
  const id = text(row.id) ?? text(row.snapshot_fingerprint) ?? "unknown";
  const generatedAt =
    text(row.recommended_at) ??
    text(row.generated_at) ??
    text(row.created_at) ??
    text(nestedValue(payload, [["recommended_at"], ["generated_at"], ["created_at"]]));
  const analysisCutoff =
    text(row.analysis_cutoff) ??
    text(nestedValue(payload, [["analysis_cutoff"], ["metadata", "analysis_cutoff"]])) ??
    generatedAt;
  const ticker =
    text(row.ticker) ??
    text(nestedValue(payload, [["ticker"], ["symbol"], ["metadata", "ticker"]]));
  const direction =
    normalizeDirection(row.direction) ??
    normalizeDirection(nestedValue(payload, [["direction"], ["side"], ["metadata", "direction"]]));
  const entry =
    numberValue(row.entry) ??
    numberValue(row.entry_low) ??
    numberValue(nestedValue(payload, [["entry"], ["entry_price"], ["entry_low"], ["plan", "entry"]]));
  const stop =
    numberValue(row.stop) ??
    numberValue(row.stop_loss) ??
    numberValue(nestedValue(payload, [["stop"], ["stop_loss"], ["plan", "stop"]]));
  const targetPrice =
    numberValue(row.target) ??
    numberValue(row.target_1) ??
    numberValue(row.target_2) ??
    numberValue(nestedValue(payload, [["target"], ["target_1"], ["plan", "target"]]));
  const tradingDay =
    text(row.trading_day) ??
    text(nestedValue(payload, [["trading_day"], ["metadata", "trading_day"]])) ??
    tradingDayFromTimestamp(generatedAt);

  return validateCandidate({
    candidate_id: `${sourceType}:${id}`,
    source_type: sourceType,
    source_row_id: id,
    ticker,
    trading_day: tradingDay,
    generated_at: generatedAt,
    analysis_cutoff: analysisCutoff,
    direction,
    entry,
    stop,
    target: targetPrice,
    confidence_or_tier:
      text(row.confidence) ??
      numberValue(row.confidence) ??
      numberValue(row.score) ??
      text(nestedValue(payload, [["confidence"], ["tier"], ["metadata", "tier"]])),
    setup_label:
      text(row.setup_type) ??
      text(nestedValue(payload, [["setup_label"], ["setup_type"], ["metadata", "setup_label"]])),
    source_metadata_present: sourceMetadataPresent(row),
    missing_required_fields: [],
    compatibility_reasons: [],
    compatible: false,
  });
}

function validRiskGeometry(
  direction: "long" | "short" | null,
  entry: number | null,
  stop: number | null,
  targetPrice: number | null,
) {
  if (direction === "long" && entry !== null && stop !== null && targetPrice !== null) {
    return entry > stop && targetPrice > entry;
  }
  if (
    direction === "short" &&
    entry !== null &&
    stop !== null &&
    targetPrice !== null
  ) {
    return entry < stop && targetPrice < entry;
  }
  return false;
}

function validateCandidate(
  candidate: FirstTinyReplaySignalPackageCandidate,
): FirstTinyReplaySignalPackageCandidate {
  const missing: string[] = [];
  const reasons: string[] = [];

  if (candidate.ticker !== target.ticker) missing.push("ticker");
  if (candidate.trading_day !== target.trading_day) missing.push("trading_day");
  if (!candidate.generated_at && !candidate.analysis_cutoff) {
    missing.push("analysis_cutoff_or_generated_at");
  }
  if (!candidate.direction) missing.push("direction");
  if (candidate.entry === null) missing.push("entry");
  if (candidate.stop === null) missing.push("stop");
  if (candidate.target === null) missing.push("target");

  const cutoff = candidate.analysis_cutoff ?? candidate.generated_at;
  if (cutoff) {
    const cutoffTime = Date.parse(cutoff);
    const windowEnd = Date.parse(target.candle_window_end_utc);
    if (!Number.isFinite(cutoffTime)) {
      reasons.push("invalid_analysis_cutoff_timestamp");
    } else if (cutoffTime > windowEnd) {
      reasons.push("future_candle_leakage_risk");
    }
  }

  if (
    candidate.direction &&
    candidate.entry !== null &&
    candidate.stop !== null &&
    candidate.target !== null &&
    !validRiskGeometry(
      candidate.direction,
      candidate.entry,
      candidate.stop,
      candidate.target,
    )
  ) {
    reasons.push("invalid_entry_stop_target_geometry");
  }

  const compatible = missing.length === 0 && reasons.length === 0;

  return {
    ...candidate,
    missing_required_fields: missing,
    compatibility_reasons: compatible ? ["compatible"] : reasons,
    compatible,
  };
}

async function executeRead(query: unknown): Promise<{
  data: Record<string, unknown>[];
  error: unknown;
}> {
  const result = await (query as PromiseLike<{
    data?: unknown;
    error?: unknown;
  }>);
  return {
    data: Array.isArray(result?.data)
      ? (result.data as Record<string, unknown>[])
      : [],
    error: result?.error ?? null,
  };
}

type QueryMethod = (...args: unknown[]) => unknown;

function isQueryMethod(value: unknown): value is QueryMethod {
  return typeof value === "function";
}

function callQueryMethod(
  query: unknown,
  method: string,
  args: unknown[],
): unknown {
  const record = asRecord(query);
  const candidate = record[method];
  return isQueryMethod(candidate) ? Reflect.apply(candidate, query, args) : query;
}

async function readTable(
  client: FirstTinyReplaySignalPackageDiscoverySupabaseClient,
  table: "recommendations" | "recommendation_snapshots",
) {
  let query: unknown = client.from(table).select?.("*") ?? client.from(table);
  query = callQueryMethod(query, "eq", ["ticker", target.ticker]);
  query = callQueryMethod(query, "gte", [
    "created_at",
    target.day_start_utc,
  ]);
  query = callQueryMethod(query, "lt", ["created_at", target.day_end_utc]);
  query = callQueryMethod(query, "lte", ["created_at", target.day_end_utc]);
  query = callQueryMethod(query, "order", [
    "created_at",
    { ascending: true },
  ]);
  query = callQueryMethod(query, "limit", [50]);

  return executeRead(query);
}

function summarizeReasons(candidates: FirstTinyReplaySignalPackageCandidate[]) {
  const counts = new Map<string, number>();
  for (const candidate of candidates) {
    const reasons = [
      ...candidate.missing_required_fields.map((field) => `missing_${field}`),
      ...candidate.compatibility_reasons.filter(
        (reason) => reason !== "compatible",
      ),
    ];
    for (const reason of reasons) {
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([reason, count]) => `${reason}:${count}`)
    .slice(0, 8);
}

export function buildFirstTinyHistoricalReplaySignalPackageDiscoveryReadback(
  input: FirstTinyHistoricalReplaySignalPackageDiscoveryReadbackInput = {},
): FirstTinyHistoricalReplaySignalPackageDiscoveryReadbackSummary {
  const replayResult =
    input.replay_result_verification ??
    buildFirstTinyHistoricalReplayDryRunResultVerification();
  const discoveryPlan =
    input.discovery_plan ??
    buildFirstTinyHistoricalReplaySignalPackageDiscoveryPlan();

  return baseSummary({
    discovery_status: "not_run",
    source_verification: replayResult.conclusion,
    candidate_discovery_sources: [...discoveryPlan.candidate_discovery_sources],
    readback_attempted: false,
    blockers: ["explicit_route_readback_required"],
  });
}

export async function runFirstTinyHistoricalReplaySignalPackageDiscoveryReadback(
  input: FirstTinyHistoricalReplaySignalPackageDiscoveryReadbackInput = {},
): Promise<FirstTinyHistoricalReplaySignalPackageDiscoveryReadbackSummary> {
  const replayResult =
    input.replay_result_verification ??
    buildFirstTinyHistoricalReplayDryRunResultVerification();
  const discoveryPlan =
    input.discovery_plan ??
    buildFirstTinyHistoricalReplaySignalPackageDiscoveryPlan();
  const candidateDiscoverySources = [
    ...discoveryPlan.candidate_discovery_sources,
  ];

  if (input.execute_readback !== true) {
    return buildFirstTinyHistoricalReplaySignalPackageDiscoveryReadback(input);
  }

  if (!input.supabase_client) {
    return baseSummary({
      discovery_status: "readback_unavailable",
      source_verification: replayResult.conclusion,
      candidate_discovery_sources: candidateDiscoverySources,
      readback_attempted: false,
      blockers: [
        input.readback_unavailable_reason ?? "supabase_service_role_unavailable",
      ],
      recommended_next_steps: [
        "verify_supabase_service_role_read_env",
        "keep_synthetic_outcomes_scanner_and_ranking_disabled",
      ],
    });
  }

  const warnings: string[] = [];
  const allCandidates: FirstTinyReplaySignalPackageCandidate[] = [];
  let recommendationRows: Record<string, unknown>[] = [];
  let recommendationSnapshots: Record<string, unknown>[] = [];

  try {
    const result = await readTable(input.supabase_client, "recommendations");
    if (result.error) {
      warnings.push("recommendations_read_failed");
    } else {
      recommendationRows = result.data;
      allCandidates.push(
        ...result.data.map((row) => extractCandidate(row, "recommendation_row")),
      );
    }
  } catch {
    warnings.push("recommendations_read_failed");
  }

  try {
    const result = await readTable(
      input.supabase_client,
      "recommendation_snapshots",
    );
    if (result.error) {
      warnings.push("recommendation_snapshots_read_failed");
    } else {
      recommendationSnapshots = result.data;
      allCandidates.push(
        ...result.data.map((row) =>
          extractCandidate(row, "recommendation_snapshot"),
        ),
      );
    }
  } catch {
    warnings.push("recommendation_snapshots_read_failed");
  }

  if (
    warnings.includes("recommendations_read_failed") &&
    warnings.includes("recommendation_snapshots_read_failed")
  ) {
    return baseSummary({
      discovery_status: "blocked_schema_unknown",
      source_verification: replayResult.conclusion,
      candidate_discovery_sources: candidateDiscoverySources,
      readback_attempted: true,
      warnings,
      blockers: ["signal_package_readback_schema_unknown"],
      recommended_next_steps: [
        "inspect_recommendation_signal_source_schema",
        "create_static_manual_signal_package_plan",
        "keep_synthetic_outcomes_scanner_and_ranking_disabled",
      ],
    });
  }

  const compatibleCandidates = allCandidates.filter(
    (candidate) => candidate.compatible,
  );
  const topReasons = summarizeReasons(allCandidates);
  const status =
    allCandidates.length === 0
      ? "no_candidates_found"
      : compatibleCandidates.length > 0
        ? "compatible_signal_package_found"
        : "candidates_found_none_compatible";

  return baseSummary({
    discovery_status: status,
    source_verification: replayResult.conclusion,
    candidate_discovery_sources: candidateDiscoverySources,
    readback_attempted: true,
    recommendation_rows_checked: recommendationRows.length,
    recommendation_snapshots_checked: recommendationSnapshots.length,
    candidates_found: allCandidates.length,
    compatible_candidates: compatibleCandidates.length,
    best_candidate_available: compatibleCandidates.length > 0,
    signal_package_available_now: compatibleCandidates.length > 0,
    candidates: allCandidates.slice(0, 20),
    top_missing_fields_or_reasons: topReasons,
    blockers:
      compatibleCandidates.length > 0
        ? []
        : allCandidates.length === 0
          ? ["no_compatible_signal_package_found", "no_candidates_found"]
          : ["no_compatible_signal_package_found", ...(topReasons.length ? topReasons : ["missing_entry_stop_target"])],
    warnings,
    recommended_next_steps:
      compatibleCandidates.length > 0
        ? [
            "review_signal_package_before_replay",
            "keep_synthetic_outcomes_scanner_and_ranking_disabled",
          ]
        : [
            "create_static_manual_signal_package_plan",
            "keep_synthetic_outcomes_scanner_and_ranking_disabled",
          ],
  });
}
