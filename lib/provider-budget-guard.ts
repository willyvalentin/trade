import type { DynamicMarketMoversSummary } from "@/lib/dynamic-market-movers";
import type { RecommendationOutcomeHorizon } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationServingCadenceSummary } from "@/lib/recommendation-serving-cadence";
import type { ScanLogEntry } from "@/lib/scan-logs";
import type { ScannerUniverseCoverageSummary } from "@/lib/scanner-universe";

export type ProviderBudgetPlanMode = "free" | "grow" | "pro" | "custom" | "unknown";

export type ProviderBudgetStatus =
  | "within_budget"
  | "approaching_limit"
  | "over_budget"
  | "rate_limited"
  | "provider_unavailable"
  | "budget_unknown"
  | "disabled"
  | "unknown";

export type ProviderBudgetUsageEstimate = {
  estimate_id: string;
  label: string;
  calls_per_window: number;
  calls_per_day: number;
  assumptions: string[];
};

export type ProviderBudgetWarning = {
  warning_id: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type ProviderBudgetLimitSignal = {
  signal_id: string;
  status:
    | "rate_limited"
    | "timeout"
    | "provider_unavailable"
    | "missing_api_key"
    | "invalid_api_key"
    | "stale_response"
    | "unknown_provider_error"
    | "none";
  provider: string | null;
  source: string;
  message: string;
  observed_at: string | null;
};

export type ProviderBudgetNextAction = {
  action_id: string;
  priority: "critical" | "high" | "medium" | "low" | "watch";
  label: string;
  message: string;
};

export type ProviderBudgetGuardSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "provider_budget_guard";
  generated_at: string;
  plan_mode: ProviderBudgetPlanMode;
  status: ProviderBudgetStatus;
  status_message: string;
  selected_tickers_per_window: number;
  configured_scan_budget: number | null;
  safe_selected_ticker_cap: number | null;
  estimates: {
    scan_candidate_generation: ProviderBudgetUsageEstimate;
    outcome_evaluation: ProviderBudgetUsageEstimate;
    daily_schedule: ProviderBudgetUsageEstimate;
  };
  totals: {
    estimated_calls_per_window: number;
    estimated_calls_per_day: number;
    estimated_outcome_calls: number;
    official_scan_windows_per_day: number;
    background_scans_per_day: number;
  };
  budget_limits: {
    daily_soft_limit: number | null;
    window_soft_limit: number | null;
    source: "internal_conservative_default" | "custom_env" | "unknown";
  };
  dynamic_movers: {
    status: string;
    provider: string | null;
    estimated_calls_per_window: number;
  };
  outcome_evaluation: {
    pending_snapshots: number;
    horizons: RecommendationOutcomeHorizon[];
    estimated_calls: number;
  };
  latest_limit_signal: ProviderBudgetLimitSignal;
  warnings: ProviderBudgetWarning[];
  next_action: ProviderBudgetNextAction;
  copy: {
    conservative_estimates: string;
    broad_scanning: string;
    rate_limits: string;
    plan_boundary: string;
  };
};

export type ProviderBudgetGuardInput = {
  plan_mode?: ProviderBudgetPlanMode | string | null;
  scanner_universe: ScannerUniverseCoverageSummary;
  dynamic_movers?: DynamicMarketMoversSummary | null;
  serving_cadence?: RecommendationServingCadenceSummary | null;
  scan_logs?: ScanLogEntry[];
  latest_automation_scan?: ScanLogEntry | null;
  outcome_evaluation?: {
    pending_snapshots?: number | null;
    horizons?: Array<RecommendationOutcomeHorizon | string> | null;
  } | null;
  provider_env?: {
    twelve_data_configured?: boolean | null;
  } | null;
  custom_limits?: {
    daily_soft_limit?: number | null;
    window_soft_limit?: number | null;
    safe_selected_ticker_cap?: number | null;
  } | null;
  schedule?: {
    official_scan_windows_per_day?: number | null;
    background_scans_per_day?: number | null;
  } | null;
  now?: Date | string | null;
};

const officialScanWindowsPerDay = 3;
const quoteCallsPerTicker = 1;
const candleCallsPerTicker = 1;
const indicatorCallsPerTicker = 0;
const dynamicProviderCallsPerWindow = 1;

const conservativePlanLimits: Record<
  Exclude<ProviderBudgetPlanMode, "custom" | "unknown">,
  { daily: number; window: number; cap: number | null }
> = {
  free: { daily: 400, window: 120, cap: 35 },
  grow: { daily: 2500, window: 450, cap: 75 },
  pro: { daily: 10000, window: 1200, cap: null },
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

function normalizePlanMode(value: ProviderBudgetGuardInput["plan_mode"]) {
  if (
    value === "free" ||
    value === "grow" ||
    value === "pro" ||
    value === "custom" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

function count(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

function optionalCount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null;
}

function warning(
  warning_id: string,
  severity: ProviderBudgetWarning["severity"],
  message: string,
): ProviderBudgetWarning {
  return { warning_id, severity, message };
}

function estimate(
  estimate_id: string,
  label: string,
  callsPerWindow: number,
  callsPerDay: number,
  assumptions: string[],
): ProviderBudgetUsageEstimate {
  return {
    estimate_id,
    label,
    calls_per_window: callsPerWindow,
    calls_per_day: callsPerDay,
    assumptions,
  };
}

function normalizeHorizon(value: string): RecommendationOutcomeHorizon | null {
  if (
    value === "15m" ||
    value === "30m" ||
    value === "60m" ||
    value === "eod" ||
    value === "next_open"
  ) {
    return value;
  }

  return null;
}

function normalizeHorizons(
  values: Array<RecommendationOutcomeHorizon | string> | null | undefined,
): RecommendationOutcomeHorizon[] {
  const horizons = (values ?? ["15m", "30m", "60m"])
    .map((value) => normalizeHorizon(String(value)))
    .filter((value): value is RecommendationOutcomeHorizon => value !== null);

  return horizons.length > 0
    ? Array.from(new Set(horizons))
    : (["15m", "30m", "60m"] satisfies RecommendationOutcomeHorizon[]);
}

function messageMatches(message: string, patterns: string[]) {
  const normalized = message.toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern));
}

function signalFromLog(log: ScanLogEntry | null | undefined): ProviderBudgetLimitSignal {
  if (!log) {
    return {
      signal_id: "no_provider_limit_signal",
      status: "none",
      provider: null,
      source: "scan_logs",
      message: "No provider rate-limit or availability signal is present.",
      observed_at: null,
    };
  }

  const message = log.message ?? "";
  const provider =
    log.real_scanner_candidate_generation?.provider_source ??
    log.real_scanner_candidate_generation?.provider_source ??
    (log.indicator_source ? "twelve_data" : null);

  if (
    log.result === "provider_rate_limited" ||
    messageMatches(message, ["rate limit", "too many request", "quota"])
  ) {
    return {
      signal_id: `rate_limited:${log.id ?? log.created_at}`,
      status: "rate_limited",
      provider,
      source: "scan_logs",
      message: message || "Provider rate limit was observed.",
      observed_at: log.created_at ?? null,
    };
  }

  if (messageMatches(message, ["timeout", "timed out", "aborted"])) {
    return {
      signal_id: `timeout:${log.id ?? log.created_at}`,
      status: "timeout",
      provider,
      source: "scan_logs",
      message: message || "Provider timeout was observed.",
      observed_at: log.created_at ?? null,
    };
  }

  if (messageMatches(message, ["missing", "api key"])) {
    return {
      signal_id: `missing_api_key:${log.id ?? log.created_at}`,
      status: "missing_api_key",
      provider,
      source: "scan_logs",
      message: message || "Provider API key is missing.",
      observed_at: log.created_at ?? null,
    };
  }

  if (messageMatches(message, ["invalid api key", "unauthorized", "forbidden"])) {
    return {
      signal_id: `invalid_api_key:${log.id ?? log.created_at}`,
      status: "invalid_api_key",
      provider,
      source: "scan_logs",
      message: message || "Provider API key appears invalid.",
      observed_at: log.created_at ?? null,
    };
  }

  if (log.indicator_stale === true || messageMatches(message, ["stale"])) {
    return {
      signal_id: `stale_response:${log.id ?? log.created_at}`,
      status: "stale_response",
      provider,
      source: "scan_logs",
      message: message || "Provider response was stale.",
      observed_at: log.created_at ?? null,
    };
  }

  if (
    log.result === "provider_error" ||
    messageMatches(message, ["provider", "market data"])
  ) {
    return {
      signal_id: `provider_unavailable:${log.id ?? log.created_at}`,
      status: "provider_unavailable",
      provider,
      source: "scan_logs",
      message: message || "Provider error was observed.",
      observed_at: log.created_at ?? null,
    };
  }

  return {
    signal_id: "no_provider_limit_signal",
    status: "none",
    provider,
    source: "scan_logs",
    message: "No provider rate-limit or availability signal is present.",
    observed_at: log.created_at ?? null,
  };
}

function latestProviderSignal(input: ProviderBudgetGuardInput) {
  const candidates = [
    input.latest_automation_scan,
    ...(input.scan_logs ?? []),
  ]
    .map(signalFromLog)
    .filter((signal) => signal.status !== "none");

  return candidates[0] ?? signalFromLog(input.latest_automation_scan);
}

function limitsFor(input: {
  planMode: ProviderBudgetPlanMode;
  customLimits?: ProviderBudgetGuardInput["custom_limits"];
}) {
  const customDaily = optionalCount(input.customLimits?.daily_soft_limit);
  const customWindow = optionalCount(input.customLimits?.window_soft_limit);
  const customCap = optionalCount(input.customLimits?.safe_selected_ticker_cap);

  if (
    input.planMode === "custom" ||
    customDaily !== null ||
    customWindow !== null ||
    customCap !== null
  ) {
    return {
      daily: customDaily,
      window: customWindow,
      cap: customCap,
      source: "custom_env" as const,
    };
  }

  if (
    input.planMode === "free" ||
    input.planMode === "grow" ||
    input.planMode === "pro"
  ) {
    return {
      daily: conservativePlanLimits[input.planMode].daily,
      window: conservativePlanLimits[input.planMode].window,
      cap: conservativePlanLimits[input.planMode].cap,
      source: "internal_conservative_default" as const,
    };
  }

  return {
    daily: null,
    window: null,
    cap: null,
    source: "unknown" as const,
  };
}

function determineStatus(input: {
  providerConfigured: boolean | null | undefined;
  signal: ProviderBudgetLimitSignal;
  planMode: ProviderBudgetPlanMode;
  dailyLimit: number | null;
  windowLimit: number | null;
  estimatedDaily: number;
  estimatedWindow: number;
}) {
  if (input.providerConfigured === false) {
    return "disabled" as const;
  }

  if (input.signal.status === "rate_limited") {
    return "rate_limited" as const;
  }

  if (
    input.signal.status === "provider_unavailable" ||
    input.signal.status === "timeout" ||
    input.signal.status === "missing_api_key" ||
    input.signal.status === "invalid_api_key"
  ) {
    return "provider_unavailable" as const;
  }

  if (input.planMode === "unknown" || (!input.dailyLimit && !input.windowLimit)) {
    return "budget_unknown" as const;
  }

  if (
    (input.dailyLimit !== null && input.estimatedDaily > input.dailyLimit) ||
    (input.windowLimit !== null && input.estimatedWindow > input.windowLimit)
  ) {
    return "over_budget" as const;
  }

  if (
    (input.dailyLimit !== null && input.estimatedDaily >= input.dailyLimit * 0.8) ||
    (input.windowLimit !== null && input.estimatedWindow >= input.windowLimit * 0.8)
  ) {
    return "approaching_limit" as const;
  }

  return "within_budget" as const;
}

function statusMessage(status: ProviderBudgetStatus) {
  if (status === "within_budget") {
    return "Estimated provider usage is inside the current conservative budget guard.";
  }

  if (status === "approaching_limit") {
    return "Estimated provider usage is approaching the conservative budget guard.";
  }

  if (status === "over_budget") {
    return "Estimated provider usage exceeds the conservative budget guard.";
  }

  if (status === "rate_limited") {
    return "A provider rate-limit signal was observed recently.";
  }

  if (status === "provider_unavailable") {
    return "Provider availability needs review before broad live scanning.";
  }

  if (status === "budget_unknown") {
    return "Provider plan or custom budget is unknown, so estimates are warning-only.";
  }

  if (status === "disabled") {
    return "Provider budget guard is disabled because provider configuration is not available.";
  }

  return "Provider budget status is unknown.";
}

function buildNextAction(input: {
  status: ProviderBudgetStatus;
  planMode: ProviderBudgetPlanMode;
  selectedTickers: number;
  safeCap: number | null;
  latestSignal: ProviderBudgetLimitSignal;
}): ProviderBudgetNextAction {
  if (input.status === "rate_limited") {
    return {
      action_id: "pause_after_rate_limit",
      priority: "critical",
      label: "Pause broad scans",
      message:
        "Wait for provider capacity to recover, then restart with a lower scan budget.",
    };
  }

  if (input.status === "provider_unavailable") {
    return {
      action_id: "review_provider_error",
      priority: "high",
      label: "Review provider availability",
      message: input.latestSignal.message,
    };
  }

  if (input.safeCap !== null && input.selectedTickers > input.safeCap) {
    return {
      action_id: "reduce_scan_budget",
      priority: "high",
      label: "Reduce scan budget",
      message: `Selected tickers exceed the conservative cap of ${input.safeCap}; lower the scanner budget before live windows.`,
    };
  }

  if (input.status === "over_budget") {
    return {
      action_id: "lower_daily_call_estimate",
      priority: "high",
      label: "Lower estimated calls",
      message:
        "Reduce selected tickers, reduce background scan frequency, or configure a custom provider budget.",
    };
  }

  if (input.status === "approaching_limit") {
    return {
      action_id: "watch_budget_headroom",
      priority: "medium",
      label: "Watch budget headroom",
      message:
        "Current estimates are close to the guardrail; monitor provider errors during live windows.",
    };
  }

  if (input.planMode === "unknown") {
    return {
      action_id: "configure_provider_plan_mode",
      priority: "medium",
      label: "Set provider plan mode",
      message:
        "Set a non-secret public plan hint or custom soft budget so Ture can report firmer budget risk.",
    };
  }

  return {
    action_id: "monitor_provider_budget",
    priority: "watch",
    label: "Monitor provider budget",
    message:
      "Keep scanning within the conservative estimate and watch for rate-limit signals.",
  };
}

export function buildProviderBudgetGuardSummary(
  input: ProviderBudgetGuardInput,
): ProviderBudgetGuardSummary {
  const now = toDate(input.now) ?? new Date();
  const planMode = normalizePlanMode(input.plan_mode);
  const selectedTickers = count(input.scanner_universe.selected_tickers);
  const configuredScanBudget =
    optionalCount(input.scanner_universe.scan_budget.requested_tickers) ??
    optionalCount(input.scanner_universe.scan_budget.effective_tickers);
  const officialWindows =
    optionalCount(input.schedule?.official_scan_windows_per_day) ??
    officialScanWindowsPerDay;
  const backgroundScans = count(input.schedule?.background_scans_per_day);
  const scheduledScansPerDay = officialWindows + backgroundScans;
  const dynamicCalls =
    input.dynamic_movers && input.dynamic_movers.status !== "disabled"
      ? dynamicProviderCallsPerWindow
      : 0;
  const perTickerCalls =
    quoteCallsPerTicker + candleCallsPerTicker + indicatorCallsPerTicker;
  const scanCallsPerWindow = selectedTickers * perTickerCalls + dynamicCalls;
  const scanCallsPerDay = scanCallsPerWindow * scheduledScansPerDay;
  const horizons = normalizeHorizons(input.outcome_evaluation?.horizons);
  const pendingSnapshots = count(input.outcome_evaluation?.pending_snapshots);
  const outcomeCalls = pendingSnapshots * horizons.length;
  const estimatedWindow = scanCallsPerWindow;
  const estimatedDaily = scanCallsPerDay + outcomeCalls;
  const limits = limitsFor({
    planMode,
    customLimits: input.custom_limits,
  });
  const latestSignal = latestProviderSignal(input);
  const status = determineStatus({
    providerConfigured: input.provider_env?.twelve_data_configured,
    signal: latestSignal,
    planMode,
    dailyLimit: limits.daily,
    windowLimit: limits.window,
    estimatedDaily,
    estimatedWindow,
  });
  const warnings: ProviderBudgetWarning[] = [];

  if (planMode === "unknown") {
    warnings.push(
      warning(
        "plan_mode_unknown",
        "warning",
        "Provider plan mode is unknown; budget estimates are warning-only.",
      ),
    );
  }

  if (limits.cap !== null && selectedTickers > limits.cap) {
    warnings.push(
      warning(
        "selected_tickers_above_safe_cap",
        "warning",
        `Selected ticker count ${selectedTickers} exceeds conservative cap ${limits.cap}.`,
      ),
    );
  }

  if (status === "over_budget") {
    warnings.push(
      warning(
        "estimated_usage_over_budget",
        "critical",
        "Estimated provider calls exceed the configured or conservative soft budget.",
      ),
    );
  }

  if (status === "approaching_limit") {
    warnings.push(
      warning(
        "estimated_usage_approaching_budget",
        "warning",
        "Estimated provider calls are approaching the configured or conservative soft budget.",
      ),
    );
  }

  if (latestSignal.status !== "none") {
    warnings.push(
      warning(
        `provider_signal_${latestSignal.status}`,
        latestSignal.status === "rate_limited" ? "critical" : "warning",
        latestSignal.message,
      ),
    );
  }

  if (input.dynamic_movers?.status === "provider_unavailable") {
    warnings.push(
      warning(
        "dynamic_movers_provider_unavailable",
        "info",
        "Dynamic movers provider is unavailable; static scanner universe carries the scan.",
      ),
    );
  }

  const nextAction = buildNextAction({
    status,
    planMode,
    selectedTickers,
    safeCap: limits.cap,
    latestSignal,
  });

  return {
    summary_id: `provider_budget_guard_${now.toISOString()}`,
    summary_version: "1.0",
    summary_kind: "provider_budget_guard",
    generated_at: now.toISOString(),
    plan_mode: planMode,
    status,
    status_message: statusMessage(status),
    selected_tickers_per_window: selectedTickers,
    configured_scan_budget: configuredScanBudget,
    safe_selected_ticker_cap: limits.cap,
    estimates: {
      scan_candidate_generation: estimate(
        "scan_candidate_generation",
        "Scan candidate generation",
        scanCallsPerWindow,
        scanCallsPerDay,
        [
          `${selectedTickers} selected tickers per active window.`,
          `${quoteCallsPerTicker} quote call and ${candleCallsPerTicker} candle call per ticker.`,
          dynamicCalls > 0
            ? "Dynamic movers provider adds a small per-window call estimate."
            : "Dynamic movers provider is not connected or adds no provider calls.",
        ],
      ),
      outcome_evaluation: estimate(
        "outcome_evaluation",
        "Outcome evaluation",
        outcomeCalls,
        outcomeCalls,
        [
          `${pendingSnapshots} pending snapshots.`,
          `${horizons.length} horizons per snapshot: ${horizons.join(", ")}.`,
        ],
      ),
      daily_schedule: estimate(
        "daily_schedule",
        "Daily schedule",
        estimatedWindow,
        estimatedDaily,
        [
          `${officialWindows} official scan windows per day.`,
          `${backgroundScans} background scans per day included in this estimate.`,
          "Provider budget estimates are conservative and diagnostic.",
        ],
      ),
    },
    totals: {
      estimated_calls_per_window: estimatedWindow,
      estimated_calls_per_day: estimatedDaily,
      estimated_outcome_calls: outcomeCalls,
      official_scan_windows_per_day: officialWindows,
      background_scans_per_day: backgroundScans,
    },
    budget_limits: {
      daily_soft_limit: limits.daily,
      window_soft_limit: limits.window,
      source: limits.source,
    },
    dynamic_movers: {
      status: input.dynamic_movers?.status ?? "unknown",
      provider: input.dynamic_movers?.provider ?? null,
      estimated_calls_per_window: dynamicCalls,
    },
    outcome_evaluation: {
      pending_snapshots: pendingSnapshots,
      horizons,
      estimated_calls: outcomeCalls,
    },
    latest_limit_signal: latestSignal,
    warnings,
    next_action: nextAction,
    copy: {
      conservative_estimates: "Provider budget estimates are conservative.",
      broad_scanning: "Ture should scan broadly, but within provider limits.",
      rate_limits: "Rate-limit events reduce scan reliability.",
      plan_boundary: "Upgrade plan alone does not mean unlimited scanning.",
    },
  };
}

export function providerBudgetGuardSummaryJson(
  summary: ProviderBudgetGuardSummary,
) {
  return JSON.stringify(summary, null, 2);
}
