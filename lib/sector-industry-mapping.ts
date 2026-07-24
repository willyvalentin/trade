export type TureSector =
  | "technology"
  | "financials"
  | "energy"
  | "healthcare"
  | "consumer_discretionary"
  | "communication_services"
  | "industrials"
  | "crypto_linked"
  | "unknown";

export type TureIndustry =
  | "consumer_electronics"
  | "software"
  | "semiconductors"
  | "ai_infrastructure"
  | "data_analytics_ai"
  | "banks"
  | "investment_banking"
  | "oil_gas"
  | "pharmaceuticals"
  | "managed_care"
  | "ev"
  | "apparel"
  | "entertainment"
  | "machinery"
  | "crypto_exchange"
  | "bitcoin_treasury"
  | "internet_platforms"
  | "streaming"
  | "ecommerce"
  | "payments"
  | "aerospace"
  | "retail"
  | "restaurants"
  | "consumer_staples"
  | "etf_sector_context"
  | "unknown";

export type TureTickerSectorMappingConfidence = "low" | "medium" | "high";

export type TureTickerSectorMappingSource =
  | "static_core_universe"
  | "static_extended_universe"
  | "unknown";

export type TureTickerSectorProfile = {
  ticker: string;
  sector: TureSector;
  industry: TureIndustry;
  sector_group: TureSector;
  mapping_confidence: TureTickerSectorMappingConfidence;
  mapping_source: TureTickerSectorMappingSource;
  reason_codes: string[];
  caution_flags: string[];
  advisory_only: true;
};

export type TureSectorIndustryLabelInput = {
  ticker?: string | null;
};

type StaticTickerMapping = {
  sector: TureSector;
  industry: TureIndustry;
};

const coreUniverseMappings: Record<string, StaticTickerMapping> = {
  AAPL: { sector: "technology", industry: "consumer_electronics" },
  MSFT: { sector: "technology", industry: "software" },
  AMD: { sector: "technology", industry: "semiconductors" },
  TSLA: { sector: "consumer_discretionary", industry: "ev" },
  JPM: { sector: "financials", industry: "banks" },
  BAC: { sector: "financials", industry: "banks" },
  XOM: { sector: "energy", industry: "oil_gas" },
  CVX: { sector: "energy", industry: "oil_gas" },
  LLY: { sector: "healthcare", industry: "pharmaceuticals" },
  UNH: { sector: "healthcare", industry: "managed_care" },
  CAT: { sector: "industrials", industry: "machinery" },
  CRM: { sector: "technology", industry: "software" },
  COIN: { sector: "crypto_linked", industry: "crypto_exchange" },
  PLTR: { sector: "technology", industry: "data_analytics_ai" },
  SMCI: { sector: "technology", industry: "ai_infrastructure" },
  DKNG: { sector: "consumer_discretionary", industry: "entertainment" },
  NKE: { sector: "consumer_discretionary", industry: "apparel" },
  DIS: { sector: "communication_services", industry: "entertainment" },
  INTC: { sector: "technology", industry: "semiconductors" },
  MSTR: { sector: "crypto_linked", industry: "bitcoin_treasury" },
  NVDA: { sector: "technology", industry: "semiconductors" },
  GS: { sector: "financials", industry: "investment_banking" },
  MS: { sector: "financials", industry: "investment_banking" },
  OXY: { sector: "energy", industry: "oil_gas" },
  PFE: { sector: "healthcare", industry: "pharmaceuticals" },
};

const extendedUniverseMappings: Record<string, StaticTickerMapping> = {
  META: { sector: "communication_services", industry: "internet_platforms" },
  AMZN: { sector: "consumer_discretionary", industry: "ecommerce" },
  GOOGL: { sector: "communication_services", industry: "internet_platforms" },
  NFLX: { sector: "communication_services", industry: "streaming" },
  AVGO: { sector: "technology", industry: "semiconductors" },
  SHOP: { sector: "technology", industry: "software" },
  UBER: { sector: "industrials", industry: "software" },
  COST: { sector: "consumer_discretionary", industry: "retail" },
  ORCL: { sector: "technology", industry: "software" },
  ADBE: { sector: "technology", industry: "software" },
  QCOM: { sector: "technology", industry: "semiconductors" },
  BA: { sector: "industrials", industry: "aerospace" },
  GE: { sector: "industrials", industry: "aerospace" },
  HD: { sector: "consumer_discretionary", industry: "retail" },
  MCD: { sector: "consumer_discretionary", industry: "restaurants" },
  WMT: { sector: "consumer_discretionary", industry: "consumer_staples" },
  PEP: { sector: "consumer_discretionary", industry: "consumer_staples" },
  ABBV: { sector: "healthcare", industry: "pharmaceuticals" },
  MRK: { sector: "healthcare", industry: "pharmaceuticals" },
  V: { sector: "financials", industry: "payments" },
  MA: { sector: "financials", industry: "payments" },
  XLK: { sector: "technology", industry: "etf_sector_context" },
  XLF: { sector: "financials", industry: "etf_sector_context" },
  XLE: { sector: "energy", industry: "etf_sector_context" },
  SMH: { sector: "technology", industry: "semiconductors" },
  SOXX: { sector: "technology", industry: "semiconductors" },
};

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : "UNKNOWN";
}

function profileFromMapping(input: {
  ticker: string;
  mapping: StaticTickerMapping;
  source: Exclude<TureTickerSectorMappingSource, "unknown">;
}): TureTickerSectorProfile {
  return {
    ticker: input.ticker,
    sector: input.mapping.sector,
    industry: input.mapping.industry,
    sector_group: input.mapping.sector,
    mapping_confidence: input.source === "static_core_universe" ? "high" : "medium",
    mapping_source: input.source,
    reason_codes: [`${input.source}_match`],
    caution_flags: [],
    advisory_only: true,
  };
}

export function getTickerSectorProfile(
  tickerInput: string | null | undefined,
): TureTickerSectorProfile {
  const ticker = normalizeTicker(tickerInput);
  const coreMapping = coreUniverseMappings[ticker];

  if (coreMapping) {
    return profileFromMapping({
      ticker,
      mapping: coreMapping,
      source: "static_core_universe",
    });
  }

  const extendedMapping = extendedUniverseMappings[ticker];

  if (extendedMapping) {
    return profileFromMapping({
      ticker,
      mapping: extendedMapping,
      source: "static_extended_universe",
    });
  }

  return {
    ticker,
    sector: "unknown",
    industry: "unknown",
    sector_group: "unknown",
    mapping_confidence: "low",
    mapping_source: "unknown",
    reason_codes:
      ticker === "UNKNOWN"
        ? ["unknown_ticker_sector_mapping", "missing_ticker"]
        : ["unknown_ticker_sector_mapping"],
    caution_flags: ["sector_industry_mapping_missing"],
    advisory_only: true,
  };
}

export function buildSectorIndustryLabel(
  input: TureSectorIndustryLabelInput,
): TureTickerSectorProfile {
  return getTickerSectorProfile(input.ticker);
}
