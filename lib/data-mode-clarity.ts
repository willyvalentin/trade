export type DataMode =
  | "demo"
  | "mock_broker"
  | "local_dev"
  | "real_market_data"
  | "stale_market_data"
  | "manual_broker_record"
  | "supabase_record"
  | "future_agent_package"
  | "unknown";

export type DataSourceKind =
  | "demo"
  | "mock_broker"
  | "local_storage"
  | "supabase"
  | "market_data"
  | "manual_broker"
  | "agent_package"
  | "unknown";

export type DataFreshnessStatus =
  | "fresh"
  | "stale"
  | "expired"
  | "unknown"
  | "not_applicable";

export type ExecutionRealityStatus =
  | "not_executable"
  | "demo_only"
  | "mock_only"
  | "manual_only"
  | "human_confirmed_required"
  | "agent_read_only"
  | "unknown";

export type DataModeBadgeTone =
  | "neutral"
  | "info"
  | "positive"
  | "warning"
  | "danger";

export type DataModeBadge = {
  badge_id: string;
  label: string;
  tone: DataModeBadgeTone;
  message: string;
};

export type DataModeWarning = {
  warning_id: string;
  label: string;
  message: string;
  severity: "info" | "warning" | "critical";
  surface_id: string;
};

export type DataModeSurface = {
  surface_id: string;
  label: string;
  mode: DataMode;
  source_kind: DataSourceKind;
  freshness_status: DataFreshnessStatus;
  execution_reality: ExecutionRealityStatus;
  badges: DataModeBadge[];
  warnings: DataModeWarning[];
  summary: string;
};

export type DataModeClaritySummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "data_mode_clarity";
  generated_at: string;
  environment: "development" | "production" | "test" | "unknown";
  overall_mode: DataMode;
  execution_reality: ExecutionRealityStatus;
  has_demo_data: boolean;
  has_mock_broker_data: boolean;
  has_stale_market_data: boolean;
  has_unknown_sources: boolean;
  counts: {
    recommendations_total: number;
    recommendations_demo: number;
    active_positions_total: number;
    active_positions_demo: number;
    closed_positions_total: number;
    closed_positions_demo: number;
    closed_positions_with_broker_metadata: number;
    mock_broker_records: number;
    future_agent_packages: number;
  };
  global_badges: DataModeBadge[];
  surfaces: DataModeSurface[];
  warnings: DataModeWarning[];
  critical_copy: string[];
  summary: string;
};

export type DataModeClarityInput = {
  environment?: "development" | "production" | "test" | string | null;
  demo_mode_enabled?: boolean | null;
  recommendations?: {
    total?: number | null;
    demo?: number | null;
    expired?: number | null;
    stale?: number | null;
    unknown_source?: number | null;
  } | null;
  scan_observability?: {
    status?: "healthy" | "degraded" | "stale" | "incomplete" | "unknown" | string | null;
    data_age_minutes?: number | null;
    unknown_metrics?: string[] | null;
  } | null;
  active_positions?: {
    total?: number | null;
    demo?: number | null;
    stale_updates?: number | null;
    with_broker_metadata?: number | null;
    unknown_source?: number | null;
  } | null;
  closed_positions?: {
    total?: number | null;
    demo?: number | null;
    with_broker_metadata?: number | null;
    mock_broker_records?: number | null;
    unknown_source?: number | null;
  } | null;
  future_agent_packages?: {
    available?: boolean | null;
    count?: number | null;
  } | null;
  mock_broker_tools_enabled?: boolean | null;
  supabase_connected?: boolean | null;
  now?: Date | string | null;
};

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function count(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

function badge(
  badge_id: string,
  label: string,
  tone: DataModeBadgeTone,
  message: string,
): DataModeBadge {
  return { badge_id, label, tone, message };
}

function warning(
  surface_id: string,
  warning_id: string,
  label: string,
  message: string,
  severity: DataModeWarning["severity"] = "warning",
): DataModeWarning {
  return { surface_id, warning_id, label, message, severity };
}

export function dataModeBadgeForMode(mode: DataMode): DataModeBadge {
  if (mode === "demo") {
    return badge(
      "demo",
      "DEMO",
      "warning",
      "Demo recommendations and trades are local test data, not real trade signals.",
    );
  }

  if (mode === "mock_broker") {
    return badge(
      "mock_broker",
      "MOCK",
      "warning",
      "Mock broker fills are test data.",
    );
  }

  if (mode === "local_dev") {
    return badge(
      "local_dev",
      "LOCAL DEV",
      "info",
      "Local development data may include demos, mock tools, and local-only events.",
    );
  }

  if (mode === "real_market_data") {
    return badge(
      "real_market_data",
      "REAL MARKET DATA",
      "positive",
      "Real market data does not mean automated execution.",
    );
  }

  if (mode === "stale_market_data") {
    return badge(
      "stale_market_data",
      "STALE DATA",
      "warning",
      "Market data or scan context may be stale.",
    );
  }

  if (mode === "manual_broker_record") {
    return badge(
      "manual_broker_record",
      "MANUAL AVANZA",
      "positive",
      "Avanza KÖP/SÄLJ is always human-confirmed.",
    );
  }

  if (mode === "supabase_record") {
    return badge(
      "supabase_record",
      "SUPABASE RECORD",
      "info",
      "This is an app record stored in Supabase, not proof of broker automation.",
    );
  }

  if (mode === "future_agent_package") {
    return badge(
      "future_agent_package",
      "AGENT PACKAGE ONLY",
      "info",
      "Agent packages are read/prepare-only unless a future policy explicitly allows more.",
    );
  }

  return badge(
    "unknown",
    "UNKNOWN SOURCE",
    "neutral",
    "Source could not be determined from available metadata.",
  );
}

export function dataModeBadgeForExecutionReality(
  status: ExecutionRealityStatus,
): DataModeBadge {
  if (status === "not_executable") {
    return badge(
      "not_executable",
      "NOT EXECUTABLE",
      "neutral",
      "This surface cannot execute broker actions.",
    );
  }

  if (status === "demo_only") {
    return badge("demo_only", "DEMO ONLY", "warning", "Demo flow uses test data only.");
  }

  if (status === "mock_only") {
    return badge("mock_only", "MOCK ONLY", "warning", "Mock fills are test data.");
  }

  if (status === "manual_only") {
    return badge(
      "manual_only",
      "MANUAL ONLY",
      "positive",
      "Trading actions are manually performed and confirmed by the user.",
    );
  }

  if (status === "human_confirmed_required") {
    return badge(
      "human_confirmed_required",
      "HUMAN CONFIRMATION REQUIRED",
      "warning",
      "Avanza KÖP/SÄLJ is always human-confirmed.",
    );
  }

  if (status === "agent_read_only") {
    return badge(
      "agent_read_only",
      "NOT AUTOMATED",
      "info",
      "Future-agent package is read/prepare-only and cannot submit orders.",
    );
  }

  return badge(
    "execution_unknown",
    "EXECUTION UNKNOWN",
    "neutral",
    "Execution reality could not be determined from available metadata.",
  );
}

function buildSurface({
  surface_id,
  label,
  mode,
  source_kind,
  freshness_status,
  execution_reality,
  extra_badges = [],
  warnings = [],
  summary,
}: {
  surface_id: string;
  label: string;
  mode: DataMode;
  source_kind: DataSourceKind;
  freshness_status: DataFreshnessStatus;
  execution_reality: ExecutionRealityStatus;
  extra_badges?: DataModeBadge[];
  warnings?: DataModeWarning[];
  summary: string;
}): DataModeSurface {
  const badges = [
    dataModeBadgeForMode(mode),
    dataModeBadgeForExecutionReality(execution_reality),
    ...extra_badges,
  ].filter(
    (item, index, list) =>
      list.findIndex((candidate) => candidate.badge_id === item.badge_id) ===
      index,
  );

  return {
    surface_id,
    label,
    mode,
    source_kind,
    freshness_status,
    execution_reality,
    badges,
    warnings,
    summary,
  };
}

function scanFreshnessStatus(
  input: DataModeClarityInput,
): DataFreshnessStatus {
  if (input.scan_observability?.status === "stale") {
    return "stale";
  }

  const age = input.scan_observability?.data_age_minutes;
  if (typeof age === "number" && Number.isFinite(age)) {
    return age > 45 ? "stale" : "fresh";
  }

  return "unknown";
}

function buildSurfaces(input: DataModeClarityInput): DataModeSurface[] {
  const recommendationsTotal = count(input.recommendations?.total);
  const recommendationsDemo = count(input.recommendations?.demo);
  const activePositionsTotal = count(input.active_positions?.total);
  const activePositionsDemo = count(input.active_positions?.demo);
  const closedPositionsTotal = count(input.closed_positions?.total);
  const closedPositionsDemo = count(input.closed_positions?.demo);
  const closedWithMetadata = count(input.closed_positions?.with_broker_metadata);
  const mockBrokerRecords = count(input.closed_positions?.mock_broker_records);
  const futureAgentPackages = count(input.future_agent_packages?.count);
  const freshness = scanFreshnessStatus(input);
  const scanIsStale = freshness === "stale";
  const surfaces: DataModeSurface[] = [];

  surfaces.push(
    buildSurface({
      surface_id: "recommendations",
      label: "Recommendations",
      mode:
        recommendationsTotal === 0
          ? "unknown"
          : recommendationsDemo === recommendationsTotal
            ? "demo"
            : scanIsStale
              ? "stale_market_data"
              : input.supabase_connected
                ? "supabase_record"
                : "unknown",
      source_kind:
        recommendationsTotal === 0
          ? "unknown"
          : recommendationsDemo === recommendationsTotal
            ? "demo"
            : input.supabase_connected
              ? "supabase"
              : "unknown",
      freshness_status: recommendationsTotal === 0 ? "unknown" : freshness,
      execution_reality:
        recommendationsDemo === recommendationsTotal && recommendationsTotal > 0
          ? "demo_only"
          : "human_confirmed_required",
      extra_badges: [
        scanIsStale ? dataModeBadgeForMode("stale_market_data") : null,
        recommendationsTotal > recommendationsDemo && !scanIsStale
          ? dataModeBadgeForMode("real_market_data")
          : null,
      ].filter((item): item is DataModeBadge => item !== null),
      warnings: [
        recommendationsDemo > 0
          ? warning(
              "recommendations",
              "demo_recommendations_present",
              "Demo recommendations present",
              "Demo recommendations are not real trade signals.",
              "warning",
            )
          : null,
        scanIsStale
          ? warning(
              "recommendations",
              "stale_recommendation_context",
              "Stale recommendation context",
              "Recommendation context includes stale market-data or scan signals.",
              "warning",
            )
          : null,
      ].filter((item): item is DataModeWarning => item !== null),
      summary:
        recommendationsTotal === 0
          ? "No recommendation source can be inferred because no visible recommendations exist."
          : "Recommendation records are advisory. Real market data does not mean automated execution.",
    }),
  );

  surfaces.push(
    buildSurface({
      surface_id: "add_trade_buy_handoff",
      label: "ADD TRADE / Buy Handoff",
      mode: "future_agent_package",
      source_kind: "agent_package",
      freshness_status: "not_applicable",
      execution_reality: "human_confirmed_required",
      extra_badges: [
        dataModeBadgeForExecutionReality("agent_read_only"),
        dataModeBadgeForMode("manual_broker_record"),
      ],
      summary:
        "Buy handoff packages can prepare/review details only. Ture does not send broker orders.",
    }),
  );

  surfaces.push(
    buildSurface({
      surface_id: "mock_broker_tools",
      label: "Mock Broker Tools",
      mode: input.mock_broker_tools_enabled ? "mock_broker" : "unknown",
      source_kind: input.mock_broker_tools_enabled ? "mock_broker" : "unknown",
      freshness_status: "not_applicable",
      execution_reality: input.mock_broker_tools_enabled ? "mock_only" : "unknown",
      warnings: input.mock_broker_tools_enabled
        ? [
            warning(
              "mock_broker_tools",
              "mock_broker_test_data",
              "Mock broker test data",
              "Mock broker fills are test data.",
              "warning",
            ),
          ]
        : [],
      summary: input.mock_broker_tools_enabled
        ? "Mock broker imports populate local Ture fields for testing only."
        : "Mock broker tool availability could not be determined.",
    }),
  );

  surfaces.push(
    buildSurface({
      surface_id: "live_day_trades",
      label: "Live Day Trades",
      mode:
        activePositionsTotal === 0
          ? "unknown"
          : activePositionsDemo === activePositionsTotal
            ? "demo"
            : "manual_broker_record",
      source_kind:
        activePositionsTotal === 0
          ? "unknown"
          : activePositionsDemo === activePositionsTotal
            ? "local_storage"
            : "manual_broker",
      freshness_status:
        count(input.active_positions?.stale_updates) > 0 ? "stale" : "unknown",
      execution_reality:
        activePositionsDemo === activePositionsTotal && activePositionsTotal > 0
          ? "demo_only"
          : "manual_only",
      extra_badges:
        activePositionsTotal > 0 && activePositionsDemo < activePositionsTotal
          ? [dataModeBadgeForMode("supabase_record")]
          : [],
      summary:
        "Live Day Trade records represent Ture state after user-entered or human-confirmed broker information.",
    }),
  );

  surfaces.push(
    buildSurface({
      surface_id: "sell_handoff_and_exit_capture",
      label: "Sell Handoff / Exit Capture",
      mode: "future_agent_package",
      source_kind: "agent_package",
      freshness_status: "not_applicable",
      execution_reality: "human_confirmed_required",
      extra_badges: [
        dataModeBadgeForExecutionReality("agent_read_only"),
        dataModeBadgeForMode("manual_broker_record"),
      ],
      summary:
        "Sell handoff packages can prepare/review details only. Avanza SALJ is always human-confirmed.",
    }),
  );

  surfaces.push(
    buildSurface({
      surface_id: "history_and_statistics",
      label: "History / Statistics",
      mode:
        closedPositionsTotal === 0
          ? "unknown"
          : closedPositionsDemo === closedPositionsTotal
            ? "demo"
            : mockBrokerRecords > 0
              ? "mock_broker"
              : closedWithMetadata > 0
                ? "manual_broker_record"
                : "supabase_record",
      source_kind:
        closedPositionsTotal === 0
          ? "unknown"
          : closedPositionsDemo === closedPositionsTotal
            ? "local_storage"
            : "supabase",
      freshness_status: "not_applicable",
      execution_reality:
        closedPositionsDemo === closedPositionsTotal && closedPositionsTotal > 0
          ? "demo_only"
          : mockBrokerRecords > 0
            ? "mock_only"
            : "manual_only",
      extra_badges:
        closedPositionsTotal > 0 && closedPositionsDemo < closedPositionsTotal
          ? [dataModeBadgeForMode("supabase_record")]
          : [],
      warnings: [
        mockBrokerRecords > 0
          ? warning(
              "history_and_statistics",
              "mock_records_in_history",
              "Mock records included",
              "Some history/statistics records include mock broker test data.",
              "warning",
            )
          : null,
      ].filter((item): item is DataModeWarning => item !== null),
      summary:
        "History and Statistics summarize stored Ture records; they do not prove broker automation occurred.",
    }),
  );

  if (futureAgentPackages > 0 || input.future_agent_packages?.available) {
    surfaces.push(
      buildSurface({
        surface_id: "future_agent_packages",
        label: "Future Agent Packages",
        mode: "future_agent_package",
        source_kind: "agent_package",
        freshness_status: "not_applicable",
        execution_reality: "agent_read_only",
        summary:
          "Agent packages are read/prepare-only unless a future policy explicitly allows more.",
      }),
    );
  }

  return surfaces;
}

function chooseOverallMode(surfaces: DataModeSurface[]): DataMode {
  if (surfaces.some((surface) => surface.mode === "demo")) return "demo";
  if (surfaces.some((surface) => surface.mode === "mock_broker")) {
    return "mock_broker";
  }
  if (surfaces.some((surface) => surface.mode === "stale_market_data")) {
    return "stale_market_data";
  }
  if (surfaces.some((surface) => surface.mode === "manual_broker_record")) {
    return "manual_broker_record";
  }
  if (surfaces.some((surface) => surface.mode === "supabase_record")) {
    return "supabase_record";
  }
  if (surfaces.some((surface) => surface.mode === "future_agent_package")) {
    return "future_agent_package";
  }
  return "unknown";
}

function chooseExecutionReality(surfaces: DataModeSurface[]): ExecutionRealityStatus {
  if (surfaces.some((surface) => surface.execution_reality === "human_confirmed_required")) {
    return "human_confirmed_required";
  }
  if (surfaces.some((surface) => surface.execution_reality === "manual_only")) {
    return "manual_only";
  }
  if (surfaces.some((surface) => surface.execution_reality === "mock_only")) {
    return "mock_only";
  }
  if (surfaces.some((surface) => surface.execution_reality === "demo_only")) {
    return "demo_only";
  }
  if (surfaces.some((surface) => surface.execution_reality === "agent_read_only")) {
    return "agent_read_only";
  }
  return "unknown";
}

export function buildDataModeClaritySummary(
  input: DataModeClarityInput,
): DataModeClaritySummary {
  const generatedAt = (toDate(input.now) ?? new Date()).toISOString();
  const environment =
    input.environment === "development" ||
    input.environment === "production" ||
    input.environment === "test"
      ? input.environment
      : "unknown";
  const surfaces = buildSurfaces(input);
  const warnings = surfaces.flatMap((surface) => surface.warnings);
  const overallMode = chooseOverallMode(surfaces);
  const executionReality = chooseExecutionReality(surfaces);
  const recommendationsDemo = count(input.recommendations?.demo);
  const activePositionsDemo = count(input.active_positions?.demo);
  const closedPositionsDemo = count(input.closed_positions?.demo);
  const mockBrokerRecords = count(input.closed_positions?.mock_broker_records);
  const hasDemoData =
    recommendationsDemo > 0 || activePositionsDemo > 0 || closedPositionsDemo > 0;
  const hasMockBrokerData = input.mock_broker_tools_enabled === true || mockBrokerRecords > 0;
  const hasStaleMarketData =
    scanFreshnessStatus(input) === "stale" ||
    surfaces.some((surface) => surface.freshness_status === "stale");
  const hasUnknownSources =
    surfaces.some((surface) => surface.source_kind === "unknown") ||
    count(input.recommendations?.unknown_source) > 0 ||
    count(input.active_positions?.unknown_source) > 0 ||
    count(input.closed_positions?.unknown_source) > 0;
  const globalBadges = [
    environment === "development" ? dataModeBadgeForMode("local_dev") : null,
    hasDemoData ? dataModeBadgeForMode("demo") : null,
    hasMockBrokerData ? dataModeBadgeForMode("mock_broker") : null,
    hasStaleMarketData ? dataModeBadgeForMode("stale_market_data") : null,
    surfaces.some((surface) =>
      surface.badges.some((badge) => badge.badge_id === "real_market_data"),
    )
      ? dataModeBadgeForMode("real_market_data")
      : null,
    dataModeBadgeForExecutionReality(executionReality),
    dataModeBadgeForMode(overallMode),
  ].filter((item): item is DataModeBadge => item !== null)
    .filter(
      (item, index, list) =>
        list.findIndex((candidate) => candidate.badge_id === item.badge_id) ===
        index,
    )
    .slice(0, 5);

  return {
    summary_id: `data-mode-clarity-${generatedAt}`,
    summary_version: "1.0",
    summary_kind: "data_mode_clarity",
    generated_at: generatedAt,
    environment,
    overall_mode: overallMode,
    execution_reality: executionReality,
    has_demo_data: hasDemoData,
    has_mock_broker_data: hasMockBrokerData,
    has_stale_market_data: hasStaleMarketData,
    has_unknown_sources: hasUnknownSources,
    counts: {
      recommendations_total: count(input.recommendations?.total),
      recommendations_demo: recommendationsDemo,
      active_positions_total: count(input.active_positions?.total),
      active_positions_demo: activePositionsDemo,
      closed_positions_total: count(input.closed_positions?.total),
      closed_positions_demo: closedPositionsDemo,
      closed_positions_with_broker_metadata: count(
        input.closed_positions?.with_broker_metadata,
      ),
      mock_broker_records: mockBrokerRecords,
      future_agent_packages: count(input.future_agent_packages?.count),
    },
    global_badges: globalBadges,
    surfaces,
    warnings,
    critical_copy: [
      "Ture does not send broker orders.",
      "Avanza KÖP/SÄLJ is always human-confirmed.",
      "Mock broker fills are test data.",
      "Demo recommendations are not real trade signals.",
      "Real market data does not mean automated execution.",
      "Agent packages are read/prepare-only unless a future policy explicitly allows more.",
    ],
    summary:
      "Data-mode clarity is inferred from available local, Supabase, demo, mock, market-data, and handoff metadata. Unknown sources stay unknown.",
  };
}

export function dataModeClaritySummaryJson(summary: DataModeClaritySummary) {
  return JSON.stringify(summary, null, 2);
}
