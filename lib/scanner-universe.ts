import type { IntradayScanWindow } from "@/lib/intraday-scan-window";
import type { RiskControlsSettings } from "@/lib/risk-controls";
import type { ScannerCandidate } from "@/lib/scanner";
import {
  buildDynamicMarketMoversSelection,
  type DynamicMarketMover,
  type DynamicMarketMoversSelection,
  type DynamicMarketMoversSource,
  type DynamicMarketMoversSummary,
} from "@/lib/dynamic-market-movers";

export type ScannerUniverseCategory =
  | "mega_cap"
  | "large_cap_tech"
  | "ai_semis"
  | "high_beta_momentum"
  | "crypto_related"
  | "financials"
  | "consumer_discretionary"
  | "industrials"
  | "healthcare"
  | "energy"
  | "etf_index"
  | "watchlist"
  | "experimental";

export type ScannerUniverseTier = "mega" | "large" | "mid" | "speculative";
export type ScannerUniverseVolatilityTier =
  | "low"
  | "medium"
  | "high"
  | "very_high";
export type ScannerUniverseSource =
  | "expanded_static_v1"
  | "market_context"
  | "watchlist_seed"
  | DynamicMarketMoversSource;

export type ScannerUniverseSelectionSource =
  | "base_universe"
  | DynamicMarketMoversSource;

export type ScannerUniverseTicker = {
  ticker: string;
  company_name: string;
  category: ScannerUniverseCategory;
  sector: string;
  liquidity_tier: ScannerUniverseTier;
  volatility_tier: ScannerUniverseVolatilityTier;
  beta_momentum_label: string | null;
  tags: string[];
  enabled: boolean;
  tradable: boolean;
  source: ScannerUniverseSource;
  selection_source: ScannerUniverseSelectionSource;
  dynamic_sources: DynamicMarketMoversSource[];
  risk_flag?: string | null;
};

export type ScannerUniverseWarning = {
  warning_id: string;
  severity: "info" | "warning" | "blocked";
  message: string;
};

export type ScannerUniverseCategoryCoverage = {
  category: ScannerUniverseCategory;
  total_count: number;
  enabled_count: number;
  tradable_count: number;
  selected_count: number;
  context_only_count: number;
};

export type ScannerUniverseLiquidityCoverage = {
  liquidity_tier: ScannerUniverseTier;
  total_count: number;
  selected_count: number;
};

export type ScannerUniverseScanBudget = {
  default_tickers_per_window: number;
  max_tickers_per_window: number;
  requested_tickers: number | null;
  effective_tickers: number;
  selected_tickers: number;
  usage_percent: number;
};

export type ScannerUniverseCoverageSummary = {
  summary_version: "1.0";
  summary_kind: "scanner_universe_coverage";
  generated_at: string;
  scan_window: IntradayScanWindow | "unknown";
  source: "expanded_static_v1";
  total_universe_size: number;
  enabled_tickers: number;
  tradable_tickers: number;
  context_only_tickers: number;
  selected_tickers: number;
  selected_tradable_tickers: number;
  selected_context_only_tickers: number;
  selected_ticker_symbols: string[];
  context_ticker_symbols: string[];
  category_breakdown: ScannerUniverseCategoryCoverage[];
  liquidity_breakdown: ScannerUniverseLiquidityCoverage[];
  scan_budget: ScannerUniverseScanBudget;
  risk_controls: {
    allowed_tickers_configured: number;
    blocked_tickers_configured: number;
    allowed_tickers_matched: number;
    blocked_tickers_removed: number;
  };
  dynamic_movers: DynamicMarketMoversSummary | null;
  dynamic_mover_selected_count: number;
  dynamic_mover_source_breakdown: Record<DynamicMarketMoversSource, number>;
  warnings: ScannerUniverseWarning[];
  notes: string[];
};

export type ScannerUniverseSelection = {
  scan_window: IntradayScanWindow | "unknown";
  selected_tickers: ScannerUniverseTicker[];
  context_tickers: ScannerUniverseTicker[];
  coverage_summary: ScannerUniverseCoverageSummary;
};

type ScannerUniverseSelectionInput = {
  scanWindow?: IntradayScanWindow | "unknown" | null;
  requestedScanBudget?: number | null;
  riskControlsSettings?: Pick<
    RiskControlsSettings,
    "allowed_tickers" | "blocked_tickers"
  > | null;
  dynamicMovers?: DynamicMarketMoversSelection | null;
  now?: Date;
};

export const scannerUniverseDefaultScanBudget = 50;
export const scannerUniverseMaxScanBudget = 100;

export const scannerUniverseTickers = [
  ticker("AAPL", "Apple Inc.", "mega_cap", "Information Technology", "mega", "medium", "liquid mega-cap", ["liquid", "index_weight"]),
  ticker("MSFT", "Microsoft Corporation", "mega_cap", "Information Technology", "mega", "medium", "liquid mega-cap", ["liquid", "ai", "index_weight"]),
  ticker("NVDA", "NVIDIA Corporation", "mega_cap", "Information Technology", "mega", "high", "AI momentum leader", ["liquid", "ai", "semiconductor", "momentum"]),
  ticker("AMZN", "Amazon.com, Inc.", "mega_cap", "Consumer Discretionary", "mega", "medium", "liquid mega-cap", ["liquid", "consumer", "cloud"]),
  ticker("META", "Meta Platforms, Inc.", "mega_cap", "Communication Services", "mega", "medium", "liquid mega-cap", ["liquid", "ai", "advertising"]),
  ticker("GOOGL", "Alphabet Inc.", "mega_cap", "Communication Services", "mega", "medium", "liquid mega-cap", ["liquid", "ai", "advertising"]),
  ticker("NFLX", "Netflix, Inc.", "mega_cap", "Communication Services", "large", "medium", "liquid growth leader", ["liquid", "consumer", "momentum"]),
  ticker("AVGO", "Broadcom Inc.", "mega_cap", "Information Technology", "mega", "medium", "semiconductor mega-cap", ["liquid", "ai", "semiconductor"]),
  ticker("ORCL", "Oracle Corporation", "large_cap_tech", "Information Technology", "large", "medium", "enterprise software", ["liquid", "cloud", "software"]),
  ticker("CRM", "Salesforce, Inc.", "large_cap_tech", "Information Technology", "large", "medium", "enterprise software", ["liquid", "software"]),
  ticker("ADBE", "Adobe Inc.", "large_cap_tech", "Information Technology", "large", "medium", "enterprise software", ["liquid", "software"]),
  ticker("NOW", "ServiceNow, Inc.", "large_cap_tech", "Information Technology", "large", "medium", "software momentum", ["liquid", "software", "momentum"]),
  ticker("INTU", "Intuit Inc.", "large_cap_tech", "Information Technology", "large", "medium", "software compounder", ["liquid", "software"]),
  ticker("ANET", "Arista Networks, Inc.", "large_cap_tech", "Information Technology", "large", "high", "AI networking momentum", ["liquid", "ai", "networking"]),
  ticker("IBM", "International Business Machines Corporation", "large_cap_tech", "Information Technology", "large", "low", "defensive tech", ["liquid", "software"]),
  ticker("AMD", "Advanced Micro Devices, Inc.", "ai_semis", "Information Technology", "large", "high", "AI semiconductor momentum", ["liquid", "ai", "semiconductor", "momentum"]),
  ticker("INTC", "Intel Corporation", "ai_semis", "Information Technology", "large", "high", "semiconductor turnaround", ["liquid", "semiconductor"]),
  ticker("QCOM", "QUALCOMM Incorporated", "ai_semis", "Information Technology", "large", "medium", "semiconductor large-cap", ["liquid", "semiconductor"]),
  ticker("MU", "Micron Technology, Inc.", "ai_semis", "Information Technology", "large", "high", "memory cycle momentum", ["liquid", "semiconductor", "momentum"]),
  ticker("ARM", "Arm Holdings plc", "ai_semis", "Information Technology", "large", "high", "AI semiconductor momentum", ["ai", "semiconductor", "momentum"]),
  ticker("TSM", "Taiwan Semiconductor Manufacturing Company Limited", "ai_semis", "Information Technology", "mega", "medium", "AI foundry leader", ["liquid", "ai", "semiconductor"]),
  ticker("ASML", "ASML Holding N.V.", "ai_semis", "Information Technology", "large", "medium", "semiconductor equipment", ["liquid", "semiconductor"]),
  ticker("LRCX", "Lam Research Corporation", "ai_semis", "Information Technology", "large", "medium", "semiconductor equipment", ["liquid", "semiconductor"]),
  ticker("KLAC", "KLA Corporation", "ai_semis", "Information Technology", "large", "medium", "semiconductor equipment", ["liquid", "semiconductor"]),
  ticker("AMAT", "Applied Materials, Inc.", "ai_semis", "Information Technology", "large", "medium", "semiconductor equipment", ["liquid", "semiconductor"]),
  ticker("MRVL", "Marvell Technology, Inc.", "ai_semis", "Information Technology", "large", "high", "AI networking semiconductor", ["liquid", "ai", "semiconductor", "momentum"]),
  ticker("TSLA", "Tesla, Inc.", "high_beta_momentum", "Consumer Discretionary", "mega", "very_high", "high-beta momentum", ["liquid", "momentum", "high_beta"]),
  ticker("PLTR", "Palantir Technologies Inc.", "high_beta_momentum", "Information Technology", "large", "very_high", "AI momentum", ["liquid", "ai", "momentum", "high_beta"]),
  ticker("SMCI", "Super Micro Computer, Inc.", "high_beta_momentum", "Information Technology", "mid", "very_high", "AI infrastructure momentum", ["ai", "momentum", "high_beta"]),
  ticker("RDDT", "Reddit, Inc.", "high_beta_momentum", "Communication Services", "mid", "very_high", "recent-issue momentum", ["momentum", "high_beta", "experimental"]),
  ticker("HOOD", "Robinhood Markets, Inc.", "high_beta_momentum", "Financials", "mid", "very_high", "retail trading momentum", ["liquid", "momentum", "high_beta"]),
  ticker("SOFI", "SoFi Technologies, Inc.", "high_beta_momentum", "Financials", "mid", "very_high", "fintech momentum", ["liquid", "momentum", "high_beta"]),
  ticker("RIVN", "Rivian Automotive, Inc.", "high_beta_momentum", "Consumer Discretionary", "mid", "very_high", "EV high beta", ["liquid", "ev", "high_beta"]),
  ticker("LCID", "Lucid Group, Inc.", "high_beta_momentum", "Consumer Discretionary", "speculative", "very_high", "EV speculative beta", ["ev", "high_beta"], "speculative liquidity/risk"),
  ticker("UBER", "Uber Technologies, Inc.", "high_beta_momentum", "Industrials", "large", "medium", "large-cap mobility momentum", ["liquid", "momentum"]),
  ticker("DASH", "DoorDash, Inc.", "high_beta_momentum", "Consumer Discretionary", "large", "high", "consumer internet momentum", ["liquid", "momentum"]),
  ticker("SHOP", "Shopify Inc.", "high_beta_momentum", "Information Technology", "large", "high", "commerce software momentum", ["liquid", "software", "momentum"]),
  ticker("SNOW", "Snowflake Inc.", "high_beta_momentum", "Information Technology", "large", "high", "software high beta", ["liquid", "software", "high_beta"]),
  ticker("NET", "Cloudflare, Inc.", "high_beta_momentum", "Information Technology", "mid", "high", "software high beta", ["software", "momentum", "high_beta"]),
  ticker("DDOG", "Datadog, Inc.", "high_beta_momentum", "Information Technology", "large", "high", "software high beta", ["liquid", "software", "high_beta"]),
  ticker("CRWD", "CrowdStrike Holdings, Inc.", "high_beta_momentum", "Information Technology", "large", "high", "cybersecurity momentum", ["liquid", "software", "momentum"]),
  ticker("PANW", "Palo Alto Networks, Inc.", "high_beta_momentum", "Information Technology", "large", "medium", "cybersecurity large-cap", ["liquid", "software"]),
  ticker("COIN", "Coinbase Global, Inc.", "crypto_related", "Financials", "large", "very_high", "crypto beta", ["liquid", "crypto", "momentum", "high_beta"]),
  ticker("MSTR", "Strategy Incorporated", "crypto_related", "Information Technology", "large", "very_high", "bitcoin treasury beta", ["liquid", "crypto", "momentum", "high_beta"]),
  ticker("MARA", "MARA Holdings, Inc.", "crypto_related", "Information Technology", "mid", "very_high", "bitcoin miner beta", ["crypto", "high_beta", "experimental"]),
  ticker("RIOT", "Riot Platforms, Inc.", "crypto_related", "Information Technology", "mid", "very_high", "bitcoin miner beta", ["crypto", "high_beta", "experimental"]),
  ticker("JPM", "JPMorgan Chase & Co.", "financials", "Financials", "mega", "medium", "money-center bank", ["liquid", "financials"]),
  ticker("BAC", "Bank of America Corporation", "financials", "Financials", "large", "medium", "money-center bank", ["liquid", "financials"]),
  ticker("GS", "The Goldman Sachs Group, Inc.", "financials", "Financials", "large", "medium", "investment bank", ["liquid", "financials"]),
  ticker("MS", "Morgan Stanley", "financials", "Financials", "large", "medium", "investment bank", ["liquid", "financials"]),
  ticker("C", "Citigroup Inc.", "financials", "Financials", "large", "medium", "money-center bank", ["liquid", "financials"]),
  ticker("WFC", "Wells Fargo & Company", "financials", "Financials", "large", "medium", "money-center bank", ["liquid", "financials"]),
  ticker("V", "Visa Inc.", "financials", "Financials", "mega", "low", "payments compounder", ["liquid", "financials"]),
  ticker("MA", "Mastercard Incorporated", "financials", "Financials", "large", "low", "payments compounder", ["liquid", "financials"]),
  ticker("AXP", "American Express Company", "financials", "Financials", "large", "medium", "payments/credit", ["liquid", "financials"]),
  ticker("PYPL", "PayPal Holdings, Inc.", "financials", "Financials", "large", "high", "fintech turnaround", ["liquid", "financials", "high_beta"]),
  ticker("SQ", "Block, Inc.", "financials", "Financials", "large", "high", "fintech high beta", ["liquid", "financials", "high_beta"]),
  ticker("DIS", "The Walt Disney Company", "consumer_discretionary", "Communication Services", "large", "medium", "consumer/media", ["liquid", "consumer"]),
  ticker("NKE", "NIKE, Inc.", "consumer_discretionary", "Consumer Discretionary", "large", "medium", "consumer brand", ["liquid", "consumer"]),
  ticker("SBUX", "Starbucks Corporation", "consumer_discretionary", "Consumer Discretionary", "large", "medium", "consumer brand", ["liquid", "consumer"]),
  ticker("MCD", "McDonald's Corporation", "consumer_discretionary", "Consumer Discretionary", "large", "low", "consumer defensive growth", ["liquid", "consumer"]),
  ticker("COST", "Costco Wholesale Corporation", "consumer_discretionary", "Consumer Staples", "large", "low", "defensive retail", ["liquid", "consumer"]),
  ticker("WMT", "Walmart Inc.", "consumer_discretionary", "Consumer Staples", "large", "low", "defensive retail", ["liquid", "consumer"]),
  ticker("TGT", "Target Corporation", "consumer_discretionary", "Consumer Staples", "large", "medium", "retail beta", ["liquid", "consumer"]),
  ticker("HD", "The Home Depot, Inc.", "consumer_discretionary", "Consumer Discretionary", "large", "medium", "housing retail", ["liquid", "consumer"]),
  ticker("LOW", "Lowe's Companies, Inc.", "consumer_discretionary", "Consumer Discretionary", "large", "medium", "housing retail", ["liquid", "consumer"]),
  ticker("LULU", "Lululemon Athletica Inc.", "consumer_discretionary", "Consumer Discretionary", "large", "high", "consumer growth", ["liquid", "consumer", "momentum"]),
  ticker("CAT", "Caterpillar Inc.", "industrials", "Industrials", "large", "medium", "industrial cyclical", ["liquid", "industrials"]),
  ticker("DE", "Deere & Company", "industrials", "Industrials", "large", "medium", "industrial cyclical", ["liquid", "industrials"]),
  ticker("GE", "GE Aerospace", "industrials", "Industrials", "large", "medium", "aerospace momentum", ["liquid", "industrials"]),
  ticker("BA", "The Boeing Company", "industrials", "Industrials", "large", "high", "aerospace high beta", ["liquid", "industrials", "high_beta"]),
  ticker("RTX", "RTX Corporation", "industrials", "Industrials", "large", "low", "defense/aerospace", ["liquid", "industrials"]),
  ticker("HON", "Honeywell International Inc.", "industrials", "Industrials", "large", "low", "industrial quality", ["liquid", "industrials"]),
  ticker("UNP", "Union Pacific Corporation", "industrials", "Industrials", "large", "low", "transport quality", ["liquid", "industrials"]),
  ticker("XOM", "Exxon Mobil Corporation", "energy", "Energy", "mega", "medium", "energy mega-cap", ["liquid", "energy"]),
  ticker("CVX", "Chevron Corporation", "energy", "Energy", "large", "medium", "energy large-cap", ["liquid", "energy"]),
  ticker("SLB", "Schlumberger Limited", "energy", "Energy", "large", "high", "oil services beta", ["liquid", "energy", "high_beta"]),
  ticker("COP", "ConocoPhillips", "energy", "Energy", "large", "medium", "energy large-cap", ["liquid", "energy"]),
  ticker("OXY", "Occidental Petroleum Corporation", "energy", "Energy", "large", "high", "energy beta", ["liquid", "energy", "high_beta"]),
  ticker("UNH", "UnitedHealth Group Incorporated", "healthcare", "Health Care", "large", "medium", "managed care large-cap", ["liquid", "healthcare"]),
  ticker("LLY", "Eli Lilly and Company", "healthcare", "Health Care", "mega", "medium", "healthcare momentum", ["liquid", "healthcare", "momentum"]),
  ticker("NVO", "Novo Nordisk A/S", "healthcare", "Health Care", "mega", "medium", "healthcare momentum", ["liquid", "healthcare", "momentum"]),
  ticker("PFE", "Pfizer Inc.", "healthcare", "Health Care", "large", "medium", "defensive healthcare", ["liquid", "healthcare"]),
  ticker("JNJ", "Johnson & Johnson", "healthcare", "Health Care", "large", "low", "defensive healthcare", ["liquid", "healthcare"]),
  ticker("ABBV", "AbbVie Inc.", "healthcare", "Health Care", "large", "low", "defensive healthcare", ["liquid", "healthcare"]),
  ticker("MRK", "Merck & Co., Inc.", "healthcare", "Health Care", "large", "low", "defensive healthcare", ["liquid", "healthcare"]),
  ticker("TMO", "Thermo Fisher Scientific Inc.", "healthcare", "Health Care", "large", "medium", "life sciences", ["liquid", "healthcare"]),
  ticker("SPY", "SPDR S&P 500 ETF Trust", "etf_index", "ETF", "mega", "low", "market context", ["context", "index"], null, false, "market_context"),
  ticker("QQQ", "Invesco QQQ Trust", "etf_index", "ETF", "mega", "medium", "market context", ["context", "index", "tech"], null, false, "market_context"),
  ticker("IWM", "iShares Russell 2000 ETF", "etf_index", "ETF", "mega", "medium", "market context", ["context", "index", "small_caps"], null, false, "market_context"),
  ticker("DIA", "SPDR Dow Jones Industrial Average ETF Trust", "etf_index", "ETF", "large", "low", "market context", ["context", "index"], null, false, "market_context"),
  ticker("XLK", "Technology Select Sector SPDR Fund", "etf_index", "ETF", "large", "medium", "sector context", ["context", "sector", "tech"], null, false, "market_context"),
  ticker("XLF", "Financial Select Sector SPDR Fund", "etf_index", "ETF", "large", "medium", "sector context", ["context", "sector", "financials"], null, false, "market_context"),
  ticker("XLE", "Energy Select Sector SPDR Fund", "etf_index", "ETF", "large", "medium", "sector context", ["context", "sector", "energy"], null, false, "market_context"),
  ticker("SMH", "VanEck Semiconductor ETF", "etf_index", "ETF", "large", "high", "semiconductor context", ["context", "sector", "semiconductor"], null, false, "market_context"),
  ticker("SOXX", "iShares Semiconductor ETF", "etf_index", "ETF", "large", "high", "semiconductor context", ["context", "sector", "semiconductor"], null, false, "market_context"),
  ticker("ARKK", "ARK Innovation ETF", "etf_index", "ETF", "large", "high", "growth context", ["context", "growth", "high_beta"], null, false, "market_context"),
  ticker("DKNG", "DraftKings Inc.", "watchlist", "Consumer Discretionary", "mid", "high", "watchlist momentum", ["watchlist", "momentum", "high_beta"], null, true, "watchlist_seed"),
  ticker("ROKU", "Roku, Inc.", "watchlist", "Communication Services", "mid", "very_high", "watchlist high beta", ["watchlist", "high_beta"], null, true, "watchlist_seed"),
  ticker("BABA", "Alibaba Group Holding Limited", "watchlist", "Consumer Discretionary", "large", "high", "ADR momentum", ["watchlist", "adr", "high_beta"], "ADR/geopolitical headline risk", true, "watchlist_seed"),
  ticker("SE", "Sea Limited", "watchlist", "Consumer Discretionary", "large", "high", "ADR momentum", ["watchlist", "adr", "high_beta"], "ADR/geopolitical headline risk", true, "watchlist_seed"),
  ticker("RKLB", "Rocket Lab USA, Inc.", "experimental", "Industrials", "speculative", "very_high", "space speculative beta", ["experimental", "high_beta"], "speculative liquidity/risk"),
  ticker("ASTS", "AST SpaceMobile, Inc.", "experimental", "Communication Services", "speculative", "very_high", "space speculative beta", ["experimental", "high_beta"], "speculative liquidity/risk"),
  ticker("IONQ", "IonQ, Inc.", "experimental", "Information Technology", "speculative", "very_high", "quantum speculative beta", ["experimental", "high_beta"], "speculative liquidity/risk"),
  ticker("BBAI", "BigBear.ai Holdings, Inc.", "experimental", "Information Technology", "speculative", "very_high", "AI speculative beta", ["experimental", "ai", "high_beta"], "speculative liquidity/risk"),
] satisfies ScannerUniverseTicker[];

export function selectScannerUniverse(
  input: ScannerUniverseSelectionInput = {},
): ScannerUniverseSelection {
  const scanWindow = normalizeScanWindow(input.scanWindow);
  const budget = buildScanBudget(input.requestedScanBudget);
  const now = input.now ?? new Date();
  const allowedTickers = normalizeTickerSet(
    input.riskControlsSettings?.allowed_tickers ?? [],
  );
  const blockedTickers = normalizeTickerSet(
    input.riskControlsSettings?.blocked_tickers ?? [],
  );
  const dynamicMovers =
    input.dynamicMovers ??
    buildDynamicMarketMoversSelection({
      scanWindow,
      riskControlsSettings: input.riskControlsSettings,
      selectedBudget: isActiveSelectionWindow(scanWindow)
        ? budget.effective_tickers
        : 0,
      now,
    });
  const activeWindow = isActiveSelectionWindow(scanWindow);
  const dynamicTickers = activeWindow
    ? dynamicMovers.selected_movers.map(dynamicMoverToUniverseTicker)
    : [];
  const dynamicTickerSymbols = new Set(
    dynamicTickers.map((item) => item.ticker),
  );
  const enabledUniverse = scannerUniverseTickers.filter((item) => item.enabled);
  const contextTickers = enabledUniverse.filter((item) => !item.tradable);
  const eligibleTradable = activeWindow
    ? enabledUniverse.filter((item) => {
        if (!item.tradable) return false;
        if (blockedTickers.has(item.ticker)) return false;
        if (dynamicTickerSymbols.has(item.ticker)) return false;
        if (allowedTickers.size > 0 && !allowedTickers.has(item.ticker)) {
          return false;
        }
        return true;
      })
    : [];
  const baseBudget = Math.max(0, budget.effective_tickers - dynamicTickers.length);
  const baseTickers = selectBalancedTickers(
    eligibleTradable,
    baseBudget,
    getWeightedCategories(scanWindow),
  );
  const selectedTickers = [...dynamicTickers, ...baseTickers].slice(
    0,
    budget.effective_tickers,
  );
  const coverageSummary = buildCoverageSummary({
    scanWindow,
    selectedTickers,
    contextTickers,
    scanBudget: {
      ...budget,
      selected_tickers: selectedTickers.length,
      usage_percent: percent(selectedTickers.length, budget.effective_tickers),
    },
    allowedTickers,
    blockedTickers,
    dynamicMovers,
    now,
  });

  return {
    scan_window: scanWindow,
    selected_tickers: selectedTickers,
    context_tickers: contextTickers,
    coverage_summary: coverageSummary,
  };
}

export function scannerUniverseSelectionToBaseCandidates(
  selection: ScannerUniverseSelection,
): ScannerCandidate[] {
  return selection.selected_tickers.map(scannerUniverseTickerToBaseCandidate);
}

export function scannerUniverseCoverageSummaryJson(
  summary: ScannerUniverseCoverageSummary,
) {
  return JSON.stringify(summary, null, 2);
}

function ticker(
  tickerSymbol: string,
  companyName: string,
  category: ScannerUniverseCategory,
  sector: string,
  liquidityTier: ScannerUniverseTier,
  volatilityTier: ScannerUniverseVolatilityTier,
  betaMomentumLabel: string | null,
  tags: string[],
  riskFlag: string | null = null,
  tradable = true,
  source: ScannerUniverseSource = "expanded_static_v1",
): ScannerUniverseTicker {
  return {
    ticker: tickerSymbol,
    company_name: companyName,
    category,
    sector,
    liquidity_tier: liquidityTier,
    volatility_tier: volatilityTier,
    beta_momentum_label: betaMomentumLabel,
    tags,
    enabled: true,
    tradable,
    source,
    selection_source: "base_universe",
    dynamic_sources: [],
    risk_flag: riskFlag,
  };
}

function dynamicMoverToUniverseTicker(
  mover: DynamicMarketMover,
): ScannerUniverseTicker {
  const category = categoryForDynamicMover(mover);

  return {
    ticker: mover.ticker,
    company_name: mover.company_name ?? mover.ticker,
    category,
    sector: mover.sector ?? sectorForDynamicCategory(category),
    liquidity_tier: "mid",
    volatility_tier:
      mover.source === "high_volatility" ||
      mover.source === "intraday_momentum" ||
      mover.source === "premarket_mover"
        ? "high"
        : "medium",
    beta_momentum_label: mover.source.replaceAll("_", " "),
    tags: ["dynamic_mover", mover.source],
    enabled: true,
    tradable: mover.tradable && !mover.context_only,
    source: mover.source,
    selection_source: mover.source,
    dynamic_sources: [mover.source],
    risk_flag: mover.warnings[0] ?? null,
  };
}

function categoryForDynamicMover(
  mover: DynamicMarketMover,
): ScannerUniverseCategory {
  const hint = mover.category_hint?.trim().toLowerCase().replace(/\s+/g, "_");

  if (allCategories.includes(hint as ScannerUniverseCategory)) {
    return hint as ScannerUniverseCategory;
  }

  if (mover.source === "top_volume") return "mega_cap";
  if (mover.source === "top_loser") return "high_beta_momentum";
  if (
    mover.source === "premarket_mover" ||
    mover.source === "relative_volume" ||
    mover.source === "high_volatility" ||
    mover.source === "intraday_momentum"
  ) {
    return "high_beta_momentum";
  }

  return "watchlist";
}

function sectorForDynamicCategory(category: ScannerUniverseCategory) {
  if (category === "financials") return "Financials";
  if (category === "consumer_discretionary") return "Consumer Discretionary";
  if (category === "industrials") return "Industrials";
  if (category === "healthcare") return "Health Care";
  if (category === "energy") return "Energy";
  if (category === "etf_index") return "ETF";
  return "Dynamic Movers";
}

function scannerUniverseTickerToBaseCandidate(
  item: ScannerUniverseTicker,
): ScannerCandidate {
  return {
    ticker: item.ticker,
    company_name: item.company_name,
    sector: item.sector,
    mock_current_price: 0,
    mock_trend: [
      "Structured scanner universe candidate.",
      `Category ${item.category.replaceAll("_", " ")}.`,
      item.selection_source !== "base_universe"
        ? `Dynamic source ${item.selection_source.replaceAll("_", " ")}.`
        : "",
      item.beta_momentum_label ? `Profile ${item.beta_momentum_label}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    mock_volume_context: [
      `Liquidity tier ${item.liquidity_tier}.`,
      `Volatility tier ${item.volatility_tier}.`,
    ].join(" "),
    mock_support: 0,
    mock_resistance: 0,
    mock_news_context: [
      "Scanner universe metadata only; no live headlines used.",
      item.risk_flag ? `Risk flag: ${item.risk_flag}.` : "",
    ]
      .filter(Boolean)
      .join(" "),
  };
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

function buildScanBudget(requestedScanBudget: number | null | undefined) {
  const requested =
    typeof requestedScanBudget === "number" && Number.isFinite(requestedScanBudget)
      ? Math.round(requestedScanBudget)
      : null;
  const effective =
    requested === null
      ? scannerUniverseDefaultScanBudget
      : Math.min(Math.max(requested, 0), scannerUniverseMaxScanBudget);

  return {
    default_tickers_per_window: scannerUniverseDefaultScanBudget,
    max_tickers_per_window: scannerUniverseMaxScanBudget,
    requested_tickers: requested,
    effective_tickers: effective,
    selected_tickers: 0,
    usage_percent: 0,
  } satisfies ScannerUniverseScanBudget;
}

function normalizeTickerSet(values: string[]) {
  return new Set(
    values
      .map((value) => value.trim().toUpperCase())
      .filter((value) => value.length > 0),
  );
}

function isActiveSelectionWindow(window: IntradayScanWindow | "unknown") {
  return (
    window === "pre_market" ||
    window === "opening" ||
    window === "morning_momentum" ||
    window === "midday" ||
    window === "afternoon" ||
    window === "power_hour"
  );
}

function getWeightedCategories(
  window: IntradayScanWindow | "unknown",
): ScannerUniverseCategory[] {
  if (
    window === "pre_market" ||
    window === "opening" ||
    window === "morning_momentum"
  ) {
    return [
      "high_beta_momentum",
      "ai_semis",
      "crypto_related",
      "mega_cap",
      "large_cap_tech",
      "high_beta_momentum",
      "ai_semis",
      "consumer_discretionary",
      "financials",
      "industrials",
      "energy",
      "healthcare",
      "watchlist",
      "experimental",
    ];
  }

  if (window === "midday") {
    return [
      "mega_cap",
      "large_cap_tech",
      "financials",
      "consumer_discretionary",
      "healthcare",
      "industrials",
      "ai_semis",
      "high_beta_momentum",
      "energy",
      "crypto_related",
      "watchlist",
      "experimental",
    ];
  }

  if (window === "afternoon" || window === "power_hour") {
    return [
      "high_beta_momentum",
      "crypto_related",
      "ai_semis",
      "mega_cap",
      "large_cap_tech",
      "consumer_discretionary",
      "industrials",
      "financials",
      "energy",
      "healthcare",
      "watchlist",
      "experimental",
    ];
  }

  return [
    "mega_cap",
    "large_cap_tech",
    "ai_semis",
    "high_beta_momentum",
    "financials",
    "consumer_discretionary",
    "industrials",
    "healthcare",
    "energy",
    "crypto_related",
    "watchlist",
    "experimental",
  ];
}

function selectBalancedTickers(
  eligibleTradable: ScannerUniverseTicker[],
  budget: number,
  weightedCategories: ScannerUniverseCategory[],
) {
  if (budget <= 0) return [];

  const buckets = new Map<ScannerUniverseCategory, ScannerUniverseTicker[]>();
  const selected: ScannerUniverseTicker[] = [];
  const selectedSymbols = new Set<string>();
  const cursorByCategory = new Map<ScannerUniverseCategory, number>();

  for (const item of eligibleTradable) {
    const bucket = buckets.get(item.category) ?? [];
    bucket.push(item);
    buckets.set(item.category, bucket);
  }

  let madeProgress = true;

  while (selected.length < budget && madeProgress) {
    madeProgress = false;

    for (const category of weightedCategories) {
      const bucket = buckets.get(category) ?? [];
      let cursor = cursorByCategory.get(category) ?? 0;

      while (bucket[cursor] && selectedSymbols.has(bucket[cursor].ticker)) {
        cursor += 1;
      }

      const nextTicker = bucket[cursor];

      if (!nextTicker) {
        cursorByCategory.set(category, cursor);
        continue;
      }

      selected.push(nextTicker);
      selectedSymbols.add(nextTicker.ticker);
      cursorByCategory.set(category, cursor + 1);
      madeProgress = true;

      if (selected.length >= budget) {
        break;
      }
    }
  }

  return selected;
}

function buildCoverageSummary({
  scanWindow,
  selectedTickers,
  contextTickers,
  scanBudget,
  allowedTickers,
  blockedTickers,
  dynamicMovers,
  now,
}: {
  scanWindow: IntradayScanWindow | "unknown";
  selectedTickers: ScannerUniverseTicker[];
  contextTickers: ScannerUniverseTicker[];
  scanBudget: ScannerUniverseScanBudget;
  allowedTickers: Set<string>;
  blockedTickers: Set<string>;
  dynamicMovers: DynamicMarketMoversSelection;
  now: Date;
}): ScannerUniverseCoverageSummary {
  const enabledTickers = scannerUniverseTickers.filter((item) => item.enabled);
  const tradableTickers = enabledTickers.filter((item) => item.tradable);
  const blockedTickersRemoved = tradableTickers.filter((item) =>
    blockedTickers.has(item.ticker),
  ).length;
  const allowedTickersMatched =
    allowedTickers.size === 0
      ? 0
      : tradableTickers.filter((item) => allowedTickers.has(item.ticker)).length;
  const categoryBreakdown = buildCategoryBreakdown(selectedTickers);
  const warnings = buildWarnings({
    scanWindow,
    selectedTickers,
    tradableTickers,
    categoryBreakdown,
    scanBudget,
    dynamicMovers,
  });

  return {
    summary_version: "1.0",
    summary_kind: "scanner_universe_coverage",
    generated_at: now.toISOString(),
    scan_window: scanWindow,
    source: "expanded_static_v1",
    total_universe_size: scannerUniverseTickers.length,
    enabled_tickers: enabledTickers.length,
    tradable_tickers: tradableTickers.length,
    context_only_tickers: contextTickers.length,
    selected_tickers: selectedTickers.length,
    selected_tradable_tickers: selectedTickers.filter((item) => item.tradable).length,
    selected_context_only_tickers: selectedTickers.filter((item) => !item.tradable)
      .length,
    selected_ticker_symbols: selectedTickers.map((item) => item.ticker),
    context_ticker_symbols: contextTickers.map((item) => item.ticker),
    category_breakdown: categoryBreakdown,
    liquidity_breakdown: buildLiquidityBreakdown(selectedTickers),
    scan_budget: scanBudget,
    risk_controls: {
      allowed_tickers_configured: allowedTickers.size,
      blocked_tickers_configured: blockedTickers.size,
      allowed_tickers_matched: allowedTickersMatched,
      blocked_tickers_removed: blockedTickersRemoved,
    },
    dynamic_movers: dynamicMovers.summary,
    dynamic_mover_selected_count: selectedTickers.filter(
      (item) => item.selection_source !== "base_universe",
    ).length,
    dynamic_mover_source_breakdown: dynamicMovers.summary.source_breakdown,
    warnings,
    notes: [
      dynamicMovers.summary.status === "provider_unavailable"
        ? "Dynamic movers provider is not connected; using structured universe fallback."
        : "Dynamic movers can contribute to the scan pool inside the same scan budget.",
      "ETF symbols are context-only and excluded from tradable candidate selection.",
      "Selection expands the scan funnel but does not force recommendations or trades.",
    ],
  };
}

function buildCategoryBreakdown(selectedTickers: ScannerUniverseTicker[]) {
  const selectedByCategory = countBy(selectedTickers, (item) => item.category);

  return allCategories.map((category) => {
    const universeItems = scannerUniverseTickers.filter(
      (item) => item.category === category,
    );
    const enabledItems = universeItems.filter((item) => item.enabled);

    return {
      category,
      total_count: universeItems.length,
      enabled_count: enabledItems.length,
      tradable_count: enabledItems.filter((item) => item.tradable).length,
      selected_count: selectedByCategory[category] ?? 0,
      context_only_count: enabledItems.filter((item) => !item.tradable).length,
    } satisfies ScannerUniverseCategoryCoverage;
  });
}

function buildLiquidityBreakdown(selectedTickers: ScannerUniverseTicker[]) {
  const selectedByLiquidity = countBy(
    selectedTickers,
    (item) => item.liquidity_tier,
  );

  return allLiquidityTiers.map((liquidityTier) => ({
    liquidity_tier: liquidityTier,
    total_count: scannerUniverseTickers.filter(
      (item) => item.liquidity_tier === liquidityTier,
    ).length,
    selected_count: selectedByLiquidity[liquidityTier] ?? 0,
  }));
}

function buildWarnings({
  scanWindow,
  selectedTickers,
  tradableTickers,
  categoryBreakdown,
  scanBudget,
  dynamicMovers,
}: {
  scanWindow: IntradayScanWindow | "unknown";
  selectedTickers: ScannerUniverseTicker[];
  tradableTickers: ScannerUniverseTicker[];
  categoryBreakdown: ScannerUniverseCategoryCoverage[];
  scanBudget: ScannerUniverseScanBudget;
  dynamicMovers: DynamicMarketMoversSelection;
}) {
  const warnings: ScannerUniverseWarning[] = [];
  const activeWindow = isActiveSelectionWindow(scanWindow);
  const largestSelectedCategory = categoryBreakdown.reduce(
    (largest, item) =>
      item.selected_count > largest.selected_count ? item : largest,
    categoryBreakdown[0],
  );

  if (tradableTickers.length < scannerUniverseDefaultScanBudget) {
    warnings.push({
      warning_id: "universe_below_default_budget",
      severity: "warning",
      message:
        "Enabled tradable universe is smaller than the default scan budget.",
    });
  }

  if (activeWindow && selectedTickers.length === 0) {
    warnings.push({
      warning_id: "no_tickers_selected_for_active_window",
      severity: "blocked",
      message: "No tickers were selected for an active scan window.",
    });
  }

  if (
    selectedTickers.length > 0 &&
    largestSelectedCategory &&
    largestSelectedCategory.selected_count / selectedTickers.length > 0.4
  ) {
    warnings.push({
      warning_id: "category_concentration",
      severity: "info",
      message: `Selected universe is concentrated in ${largestSelectedCategory.category.replaceAll(
        "_",
        " ",
      )}.`,
    });
  }

  if (selectedTickers.some((item) => !item.tradable)) {
    warnings.push({
      warning_id: "context_symbol_in_tradable_selection",
      severity: "warning",
      message: "A context-only symbol was included in tradable scanner output.",
    });
  }

  if (
    scanBudget.requested_tickers !== null &&
    scanBudget.requested_tickers > scanBudget.max_tickers_per_window
  ) {
    warnings.push({
      warning_id: "requested_budget_above_cap",
      severity: "info",
      message: "Requested scan budget was capped to protect provider rate limits.",
    });
  }

  if (selectedTickers.length > scanBudget.max_tickers_per_window) {
    warnings.push({
      warning_id: "selected_above_provider_budget",
      severity: "warning",
      message: "Selected ticker count exceeds the provider budget cap.",
    });
  }

  for (const warning of dynamicMovers.summary.warnings.slice(0, 4)) {
    warnings.push({
      warning_id: `dynamic_movers:${warning.warning_id}`,
      severity: warning.severity,
      message: warning.message,
    });
  }

  return warnings;
}

function countBy<T, K extends string>(
  values: T[],
  getKey: (value: T) => K,
): Partial<Record<K, number>> {
  const counts: Partial<Record<K, number>> = {};

  for (const value of values) {
    const key = getKey(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

function percent(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

const allCategories: ScannerUniverseCategory[] = [
  "mega_cap",
  "large_cap_tech",
  "ai_semis",
  "high_beta_momentum",
  "crypto_related",
  "financials",
  "consumer_discretionary",
  "industrials",
  "healthcare",
  "energy",
  "etf_index",
  "watchlist",
  "experimental",
];

const allLiquidityTiers: ScannerUniverseTier[] = [
  "mega",
  "large",
  "mid",
  "speculative",
];
