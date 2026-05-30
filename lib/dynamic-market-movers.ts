import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import type { RiskControlsSettings } from "@/lib/risk-controls";

export type DynamicMarketMoversSource =
  | "top_gainer"
  | "top_loser"
  | "top_volume"
  | "premarket_mover"
  | "relative_volume"
  | "high_volatility"
  | "intraday_momentum"
  | "unknown_dynamic";

export type DynamicMarketMoversStatus =
  | "available"
  | "partial"
  | "provider_unavailable"
  | "stale"
  | "empty"
  | "disabled"
  | "unknown";

export type DynamicMarketMover = {
  ticker: string;
  company_name: string | null;
  source: DynamicMarketMoversSource;
  source_rank: number | null;
  score: number | null;
  percent_change: number | null;
  volume: number | null;
  relative_volume: number | null;
  price: number | null;
  sector: string | null;
  category_hint: string | null;
  fetched_at: string | null;
  provider: string | null;
  tradable: boolean;
  context_only: boolean;
  stale: boolean;
  warnings: string[];
};

export type DynamicMarketMoversWarning = {
  warning_id: string;
  severity: "info" | "warning" | "blocked";
  message: string;
};

export type DynamicMarketMoversProviderResult = {
  provider: string;
  status: "available" | "partial" | "unavailable" | "error";
  fetched_at?: string | Date | null;
  movers?: Array<Partial<DynamicMarketMover> & { ticker?: string | null }>;
  error?: string | null;
  warnings?: string[];
};

export type DynamicMarketMoversSummary = {
  summary_version: "1.0";
  summary_kind: "dynamic_market_movers";
  generated_at: string;
  status: DynamicMarketMoversStatus;
  provider: string | null;
  source: "provider_adapter" | "not_connected";
  scan_window: IntradayScanWindow | "unknown";
  fetched_count: number;
  selected_count: number;
  deduped_count: number;
  stale_count: number;
  unknown_source_count: number;
  blocked_count: number;
  allowed_filtered_count: number;
  context_only_skipped_count: number;
  budget_limit: number;
  source_breakdown: Record<DynamicMarketMoversSource, number>;
  selected_tickers: string[];
  last_updated_at: string | null;
  warnings: DynamicMarketMoversWarning[];
  gaps: string[];
};

export type DynamicMarketMoversSelection = {
  summary: DynamicMarketMoversSummary;
  fetched_movers: DynamicMarketMover[];
  selected_movers: DynamicMarketMover[];
};

export type DynamicMarketMoversSelectionInput = {
  scanWindow?: IntradayScanWindow | "unknown" | null;
  providerResult?: DynamicMarketMoversProviderResult | null;
  riskControlsSettings?: Pick<
    RiskControlsSettings,
    "allowed_tickers" | "blocked_tickers"
  > | null;
  existingTickers?: string[];
  selectedBudget?: number;
  dynamicBudgetShare?: number;
  maxDynamicTickers?: number;
  now?: Date;
};

const defaultDynamicBudgetShare = 0.4;
const defaultMaxDynamicTickers = 20;
const staleAfterMinutes = 30;

export function buildDynamicMarketMoversSelection(
  input: DynamicMarketMoversSelectionInput = {},
): DynamicMarketMoversSelection {
  const now = input.now ?? new Date();
  const scanWindow = normalizeScanWindow(input.scanWindow);
  const selectedBudget =
    typeof input.selectedBudget === "number" && Number.isFinite(input.selectedBudget)
      ? Math.max(0, Math.round(input.selectedBudget))
      : 50;
  const dynamicBudgetShare =
    typeof input.dynamicBudgetShare === "number" &&
    Number.isFinite(input.dynamicBudgetShare)
      ? Math.min(Math.max(input.dynamicBudgetShare, 0), 1)
      : defaultDynamicBudgetShare;
  const budgetLimit = Math.min(
    Math.max(0, Math.round(selectedBudget * dynamicBudgetShare)),
    input.maxDynamicTickers ?? defaultMaxDynamicTickers,
  );
  const providerResult = input.providerResult ?? null;
  const allowedTickers = normalizeTickerSet(
    input.riskControlsSettings?.allowed_tickers ?? [],
  );
  const blockedTickers = normalizeTickerSet(
    input.riskControlsSettings?.blocked_tickers ?? [],
  );
  const existingTickers = normalizeTickerSet(input.existingTickers ?? []);

  if (!providerResult) {
    const summary = buildSummary({
      now,
      scanWindow,
      status: "provider_unavailable",
      provider: null,
      fetchedMovers: [],
      selectedMovers: [],
      dedupedCount: 0,
      blockedCount: 0,
      allowedFilteredCount: 0,
      contextOnlySkippedCount: 0,
      budgetLimit,
      warnings: [
        warning(
          "dynamic_provider_not_connected",
          "info",
          "No dynamic market movers provider is connected yet; using the structured scanner universe only.",
        ),
      ],
      gaps: [
        "No top gainers/losers/volume provider adapter is available in the current market-data utilities.",
      ],
      source: "not_connected",
    });

    return {
      summary,
      fetched_movers: [],
      selected_movers: [],
    };
  }

  const fetchedMovers = normalizeProviderMovers(providerResult, now);
  const selectedMovers: DynamicMarketMover[] = [];
  const seen = new Set<string>();
  let dedupedCount = 0;
  let blockedCount = 0;
  let allowedFilteredCount = 0;
  let contextOnlySkippedCount = 0;

  for (const mover of rankMoversForWindow(fetchedMovers, scanWindow)) {
    if (seen.has(mover.ticker) || existingTickers.has(mover.ticker)) {
      dedupedCount += 1;
      continue;
    }

    seen.add(mover.ticker);

    if (mover.context_only || !mover.tradable) {
      contextOnlySkippedCount += 1;
      continue;
    }

    if (blockedTickers.has(mover.ticker)) {
      blockedCount += 1;
      continue;
    }

    if (allowedTickers.size > 0 && !allowedTickers.has(mover.ticker)) {
      allowedFilteredCount += 1;
      continue;
    }

    selectedMovers.push(mover);

    if (selectedMovers.length >= budgetLimit) {
      break;
    }
  }

  const summary = buildSummary({
    now,
    scanWindow,
    status: determineStatus(providerResult, fetchedMovers, selectedMovers),
    provider: providerResult.provider,
    fetchedMovers,
    selectedMovers,
    dedupedCount,
    blockedCount,
    allowedFilteredCount,
    contextOnlySkippedCount,
    budgetLimit,
    warnings: buildWarnings({
      providerResult,
      fetchedMovers,
      selectedMovers,
      dedupedCount,
      blockedCount,
      allowedFilteredCount,
      contextOnlySkippedCount,
    }),
    gaps: buildGaps(providerResult, fetchedMovers, selectedMovers),
    source: "provider_adapter",
  });

  return {
    summary,
    fetched_movers: fetchedMovers,
    selected_movers: selectedMovers,
  };
}

export function dynamicMarketMoversSummaryJson(
  summary: DynamicMarketMoversSummary,
) {
  return JSON.stringify(summary, null, 2);
}

function normalizeProviderMovers(
  providerResult: DynamicMarketMoversProviderResult,
  now: Date,
) {
  return (providerResult.movers ?? [])
    .map((mover, index) => normalizeMover(mover, providerResult, index, now))
    .filter((mover): mover is DynamicMarketMover => mover !== null);
}

function normalizeMover(
  mover: Partial<DynamicMarketMover> & { ticker?: string | null },
  providerResult: DynamicMarketMoversProviderResult,
  index: number,
  now: Date,
): DynamicMarketMover | null {
  const ticker = normalizeTicker(mover.ticker);

  if (!ticker) {
    return null;
  }

  const fetchedAt = toIso(mover.fetched_at) ?? toIso(providerResult.fetched_at);
  const source = normalizeSource(mover.source);
  const stale = isStale(fetchedAt, now);

  return {
    ticker,
    company_name: textOrNull(mover.company_name),
    source,
    source_rank: finiteNumber(mover.source_rank) ?? index + 1,
    score: finiteNumber(mover.score),
    percent_change: finiteNumber(mover.percent_change),
    volume: finiteNumber(mover.volume),
    relative_volume: finiteNumber(mover.relative_volume),
    price: finiteNumber(mover.price),
    sector: textOrNull(mover.sector),
    category_hint: textOrNull(mover.category_hint),
    fetched_at: fetchedAt,
    provider: textOrNull(mover.provider) ?? providerResult.provider,
    tradable: mover.tradable === undefined ? true : mover.tradable === true,
    context_only: mover.context_only === true,
    stale,
    warnings: Array.isArray(mover.warnings)
      ? mover.warnings.filter((item): item is string => typeof item === "string")
      : [],
  };
}

function rankMoversForWindow(
  movers: DynamicMarketMover[],
  scanWindow: IntradayScanWindow | "unknown",
) {
  return [...movers].sort((first, second) => {
    const sourceDifference =
      sourcePriority(second.source, scanWindow) - sourcePriority(first.source, scanWindow);

    if (sourceDifference !== 0) return sourceDifference;

    const freshnessDifference = Number(first.stale) - Number(second.stale);

    if (freshnessDifference !== 0) return freshnessDifference;

    const scoreDifference = (second.score ?? 0) - (first.score ?? 0);

    if (scoreDifference !== 0) return scoreDifference;

    return (first.source_rank ?? 999) - (second.source_rank ?? 999);
  });
}

function sourcePriority(
  source: DynamicMarketMoversSource,
  scanWindow: IntradayScanWindow | "unknown",
) {
  const morning =
    scanWindow === "pre_market" ||
    scanWindow === "opening" ||
    scanWindow === "morning_momentum";
  const powerHour = scanWindow === "afternoon" || scanWindow === "power_hour";

  if (morning && source === "premarket_mover") return 90;
  if ((morning || powerHour) && source === "relative_volume") return 82;
  if ((morning || powerHour) && source === "intraday_momentum") return 80;
  if (source === "top_volume") return 74;
  if (source === "top_gainer") return 70;
  if (source === "high_volatility") return 66;
  if (source === "top_loser") return 56;
  return 40;
}

function buildSummary({
  now,
  scanWindow,
  status,
  provider,
  fetchedMovers,
  selectedMovers,
  dedupedCount,
  blockedCount,
  allowedFilteredCount,
  contextOnlySkippedCount,
  budgetLimit,
  warnings,
  gaps,
  source,
}: {
  now: Date;
  scanWindow: IntradayScanWindow | "unknown";
  status: DynamicMarketMoversStatus;
  provider: string | null;
  fetchedMovers: DynamicMarketMover[];
  selectedMovers: DynamicMarketMover[];
  dedupedCount: number;
  blockedCount: number;
  allowedFilteredCount: number;
  contextOnlySkippedCount: number;
  budgetLimit: number;
  warnings: DynamicMarketMoversWarning[];
  gaps: string[];
  source: DynamicMarketMoversSummary["source"];
}): DynamicMarketMoversSummary {
  return {
    summary_version: "1.0",
    summary_kind: "dynamic_market_movers",
    generated_at: now.toISOString(),
    status,
    provider,
    source,
    scan_window: scanWindow,
    fetched_count: fetchedMovers.length,
    selected_count: selectedMovers.length,
    deduped_count: dedupedCount,
    stale_count: fetchedMovers.filter((mover) => mover.stale).length,
    unknown_source_count: fetchedMovers.filter(
      (mover) => mover.source === "unknown_dynamic",
    ).length,
    blocked_count: blockedCount,
    allowed_filtered_count: allowedFilteredCount,
    context_only_skipped_count: contextOnlySkippedCount,
    budget_limit: budgetLimit,
    source_breakdown: buildSourceBreakdown(selectedMovers),
    selected_tickers: selectedMovers.map((mover) => mover.ticker),
    last_updated_at: latestIso(fetchedMovers.map((mover) => mover.fetched_at)),
    warnings,
    gaps,
  };
}

function determineStatus(
  providerResult: DynamicMarketMoversProviderResult,
  fetchedMovers: DynamicMarketMover[],
  selectedMovers: DynamicMarketMover[],
): DynamicMarketMoversStatus {
  if (
    providerResult.status === "unavailable" ||
    providerResult.status === "error"
  ) {
    return "provider_unavailable";
  }

  if (fetchedMovers.length === 0) return "empty";
  if (fetchedMovers.every((mover) => mover.stale)) return "stale";
  if (selectedMovers.length === 0) return "partial";
  if (providerResult.status === "partial") return "partial";
  return "available";
}

function buildWarnings({
  providerResult,
  fetchedMovers,
  selectedMovers,
  dedupedCount,
  blockedCount,
  allowedFilteredCount,
  contextOnlySkippedCount,
}: {
  providerResult: DynamicMarketMoversProviderResult;
  fetchedMovers: DynamicMarketMover[];
  selectedMovers: DynamicMarketMover[];
  dedupedCount: number;
  blockedCount: number;
  allowedFilteredCount: number;
  contextOnlySkippedCount: number;
}) {
  const warnings: DynamicMarketMoversWarning[] = [];

  if (providerResult.status === "unavailable" || providerResult.status === "error") {
    warnings.push(
      warning(
        "provider_unavailable",
        "warning",
        providerResult.error || "Dynamic market movers provider is unavailable.",
      ),
    );
  }

  if (fetchedMovers.length === 0 && providerResult.status !== "unavailable") {
    warnings.push(
      warning("no_movers_fetched", "info", "Dynamic mover provider returned no movers."),
    );
  }

  if (fetchedMovers.length > 0 && selectedMovers.length === 0) {
    warnings.push(
      warning(
        "no_movers_selected",
        "info",
        "Dynamic movers were fetched but none survived dedupe, context, or risk-control filters.",
      ),
    );
  }

  if (dedupedCount > 0) {
    warnings.push(
      warning(
        "deduped_dynamic_movers",
        "info",
        `${dedupedCount} dynamic movers were already present in the structured universe selection.`,
      ),
    );
  }

  if (blockedCount > 0 || allowedFilteredCount > 0) {
    warnings.push(
      warning(
        "risk_controls_filtered_movers",
        "info",
        `${blockedCount + allowedFilteredCount} dynamic movers were filtered by risk controls.`,
      ),
    );
  }

  if (contextOnlySkippedCount > 0) {
    warnings.push(
      warning(
        "context_only_movers_skipped",
        "info",
        `${contextOnlySkippedCount} context-only movers were excluded from tradable scan output.`,
      ),
    );
  }

  for (const message of providerResult.warnings ?? []) {
    warnings.push(warning(`provider:${stableHash(message)}`, "info", message));
  }

  return warnings;
}

function buildGaps(
  providerResult: DynamicMarketMoversProviderResult,
  fetchedMovers: DynamicMarketMover[],
  selectedMovers: DynamicMarketMover[],
) {
  const gaps: string[] = [];

  if (providerResult.status === "unavailable" || providerResult.status === "error") {
    gaps.push("Dynamic market movers provider did not return usable data.");
  }

  if (fetchedMovers.length === 0) {
    gaps.push("No top gainers/losers/volume movers were available.");
  }

  if (fetchedMovers.length > 0 && selectedMovers.length === 0) {
    gaps.push("Dynamic movers were unavailable after dedupe and guardrail filters.");
  }

  return gaps;
}

function buildSourceBreakdown(movers: DynamicMarketMover[]) {
  const breakdown = dynamicMoverSources.reduce(
    (accumulator, source) => ({
      ...accumulator,
      [source]: 0,
    }),
    {} as Record<DynamicMarketMoversSource, number>,
  );

  for (const mover of movers) {
    breakdown[mover.source] += 1;
  }

  return breakdown;
}

function warning(
  warning_id: string,
  severity: DynamicMarketMoversWarning["severity"],
  message: string,
): DynamicMarketMoversWarning {
  return { warning_id, severity, message };
}

function normalizeScanWindow(value: IntradayScanWindow | "unknown" | null | undefined) {
  if (
    value === "pre_market" ||
    value === "opening" ||
    value === "morning_momentum" ||
    value === "midday" ||
    value === "afternoon" ||
    value === "power_hour" ||
    value === "closed"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeSource(value: unknown): DynamicMarketMoversSource {
  return dynamicMoverSources.includes(value as DynamicMarketMoversSource)
    ? (value as DynamicMarketMoversSource)
    : "unknown_dynamic";
}

function normalizeTicker(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim().toUpperCase()
    : null;
}

function normalizeTickerSet(values: string[]) {
  return new Set(
    values
      .map((value) => value.trim().toUpperCase())
      .filter((value) => value.length > 0),
  );
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toIso(value: string | Date | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }

  return null;
}

function latestIso(values: Array<string | null>) {
  const latest = values
    .map((value) => (value ? new Date(value).getTime() : Number.NaN))
    .filter(Number.isFinite)
    .sort((first, second) => second - first)[0];

  return Number.isFinite(latest) ? new Date(latest).toISOString() : null;
}

function isStale(fetchedAt: string | null, now: Date) {
  if (!fetchedAt) return true;

  const timestamp = new Date(fetchedAt).getTime();

  if (!Number.isFinite(timestamp)) return true;

  return now.getTime() - timestamp > staleAfterMinutes * 60 * 1000;
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

const dynamicMoverSources: DynamicMarketMoversSource[] = [
  "top_gainer",
  "top_loser",
  "top_volume",
  "premarket_mover",
  "relative_volume",
  "high_volatility",
  "intraday_momentum",
  "unknown_dynamic",
];
