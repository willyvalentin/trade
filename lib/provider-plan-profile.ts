export type ProviderPlanProfileMode =
  | "free"
  | "grow"
  | "pro"
  | "custom"
  | "unknown";

export type ProviderPlanProfileSource =
  | "server_env"
  | "public_env"
  | "custom_env"
  | "fallback_free_safe";

export type ProviderPlanProfile = {
  mode: ProviderPlanProfileMode;
  effective_mode: Exclude<ProviderPlanProfileMode, "unknown">;
  source: ProviderPlanProfileSource;
  server_plan_mode: ProviderPlanProfileMode;
  public_plan_mode: ProviderPlanProfileMode;
  plan_mode_mismatch: boolean;
  profile_scan_ticker_cap: number;
  profile_outcome_candle_requests_per_run: number;
  profile_background_scan_cadence_minutes: number;
  profile_scheduled_skip_openai: boolean;
  profile_scheduled_timeout_ms: number;
  provider_budget_warning_threshold: number;
  profile_notes: string[];
  profile_warnings: string[];
  overrides: {
    scan_ticker_cap: number | null;
    outcome_candle_requests_per_run: number | null;
    background_scan_cadence_minutes: number | null;
    scheduled_skip_openai: boolean | null;
    scheduled_timeout_ms: number | null;
  };
};

export type ProviderPlanProfileEnv = Record<string, string | undefined>;

const freeSafeProfile = {
  scanTickerCap: 10,
  outcomeCandleRequestsPerRun: 4,
  backgroundScanCadenceMinutes: 15,
  scheduledSkipOpenAi: true,
  scheduledTimeoutMs: 23_000,
  warningThreshold: 0.8,
  notes: ["Free-safe provider profile. Small scans, reused candles, OpenAI skipped."],
};

const profileDefaults: Record<
  Exclude<ProviderPlanProfileMode, "custom" | "unknown">,
  typeof freeSafeProfile
> = {
  free: freeSafeProfile,
  grow: {
    scanTickerCap: 25,
    outcomeCandleRequestsPerRun: 25,
    backgroundScanCadenceMinutes: 10,
    scheduledSkipOpenAi: true,
    scheduledTimeoutMs: 23_000,
    warningThreshold: 0.75,
    notes: ["Grow-ready profile. Wider scans and outcome reuse stay provider-budget aware."],
  },
  pro: {
    scanTickerCap: 50,
    outcomeCandleRequestsPerRun: 50,
    backgroundScanCadenceMinutes: 5,
    scheduledSkipOpenAi: true,
    scheduledTimeoutMs: 25_000,
    warningThreshold: 0.75,
    notes: ["Pro-ready profile. Broad scan/readback budgets, OpenAI remains opt-in."],
  },
};

function normalizePlanMode(value: string | undefined): ProviderPlanProfileMode {
  const normalized = value?.trim().toLowerCase() ?? "";

  if (
    normalized === "free" ||
    normalized === "grow" ||
    normalized === "pro" ||
    normalized === "custom"
  ) {
    return normalized;
  }

  return "unknown";
}

function readFiniteInteger(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function readBoolean(value: string | undefined) {
  if (value === undefined) return null;
  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;

  return null;
}

function positive(value: number | null, fallback: number) {
  return value !== null ? Math.max(1, value) : fallback;
}

function timeout(value: number | null, fallback: number) {
  return value !== null ? Math.max(5_000, Math.min(25_000, value)) : fallback;
}

export function buildProviderPlanProfile(
  env: ProviderPlanProfileEnv = process.env,
): ProviderPlanProfile {
  const serverPlanMode = normalizePlanMode(
    env.TWELVE_DATA_PLAN_MODE ?? env.PROVIDER_PLAN_MODE,
  );
  const publicPlanMode = normalizePlanMode(
    env.NEXT_PUBLIC_TWELVE_DATA_PLAN_MODE ?? env.NEXT_PUBLIC_PROVIDER_PLAN_MODE,
  );
  const selectedMode =
    serverPlanMode !== "unknown" ? serverPlanMode : publicPlanMode;
  const effectiveMode = selectedMode === "unknown" ? "free" : selectedMode;
  const fallbackDefaults =
    effectiveMode === "custom" ? freeSafeProfile : profileDefaults[effectiveMode];

  const scanOverride = readFiniteInteger(env.TURE_PROVIDER_MAX_SCAN_TICKERS);
  const outcomeOverride = readFiniteInteger(
    env.TURE_PROVIDER_OUTCOME_CANDLE_REQUESTS_PER_RUN,
  );
  const cadenceOverride = readFiniteInteger(
    env.TURE_PROVIDER_BACKGROUND_SCAN_CADENCE_MINUTES,
  );
  const skipOpenAiOverride = readBoolean(env.TURE_SCHEDULED_SCAN_SKIP_OPENAI);
  const timeoutOverride = readFiniteInteger(env.TURE_SCHEDULED_SCAN_TIMEOUT_MS);
  const warnings: string[] = [];

  if (effectiveMode === "custom") {
    if (scanOverride === null) {
      warnings.push("Custom profile is missing TURE_PROVIDER_MAX_SCAN_TICKERS.");
    }
    if (outcomeOverride === null) {
      warnings.push(
        "Custom profile is missing TURE_PROVIDER_OUTCOME_CANDLE_REQUESTS_PER_RUN.",
      );
    }
    if (cadenceOverride === null) {
      warnings.push(
        "Custom profile is missing TURE_PROVIDER_BACKGROUND_SCAN_CADENCE_MINUTES.",
      );
    }
  }

  const source: ProviderPlanProfileSource =
    effectiveMode === "custom"
      ? "custom_env"
      : serverPlanMode !== "unknown"
        ? "server_env"
        : publicPlanMode !== "unknown"
          ? "public_env"
          : "fallback_free_safe";

  return {
    mode: selectedMode,
    effective_mode: effectiveMode,
    source,
    server_plan_mode: serverPlanMode,
    public_plan_mode: publicPlanMode,
    plan_mode_mismatch:
      serverPlanMode !== "unknown" &&
      publicPlanMode !== "unknown" &&
      serverPlanMode !== publicPlanMode,
    profile_scan_ticker_cap: positive(
      effectiveMode === "custom" ? scanOverride : null,
      fallbackDefaults.scanTickerCap,
    ),
    profile_outcome_candle_requests_per_run: positive(
      effectiveMode === "custom" ? outcomeOverride : null,
      fallbackDefaults.outcomeCandleRequestsPerRun,
    ),
    profile_background_scan_cadence_minutes: positive(
      effectiveMode === "custom" ? cadenceOverride : null,
      fallbackDefaults.backgroundScanCadenceMinutes,
    ),
    profile_scheduled_skip_openai:
      skipOpenAiOverride ?? fallbackDefaults.scheduledSkipOpenAi,
    profile_scheduled_timeout_ms: timeout(
      effectiveMode === "custom" ? timeoutOverride : timeoutOverride,
      fallbackDefaults.scheduledTimeoutMs,
    ),
    provider_budget_warning_threshold: fallbackDefaults.warningThreshold,
    profile_notes: fallbackDefaults.notes,
    profile_warnings: warnings,
    overrides: {
      scan_ticker_cap: scanOverride,
      outcome_candle_requests_per_run: outcomeOverride,
      background_scan_cadence_minutes: cadenceOverride,
      scheduled_skip_openai: skipOpenAiOverride,
      scheduled_timeout_ms: timeoutOverride,
    },
  };
}

export function normalizeProviderPlanProfileMode(
  value: string | undefined,
): ProviderPlanProfileMode {
  return normalizePlanMode(value);
}
