export const SYMBOL_METADATA_LOGO_REFRESH_INTERVAL_DAYS = 30;
export const SYMBOL_METADATA_MAX_BATCH_SIZE = 50;

const symbolPattern = /^[A-Z0-9][A-Z0-9.:-]{0,15}$/;

export type SymbolMetadata = {
  symbol: string;
  companyName: string | null;
  exchange: string | null;
  logoUrl: string | null;
  logoSource: string | null;
  logoUpdatedAt: string | null;
};

export type SymbolMetadataRow = {
  symbol?: unknown;
  company_name?: unknown;
  companyName?: unknown;
  exchange?: unknown;
  logo_url?: unknown;
  logoUrl?: unknown;
  logo_source?: unknown;
  logoSource?: unknown;
  logo_updated_at?: unknown;
  logoUpdatedAt?: unknown;
};

function nonEmptyString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeSymbol(value: unknown) {
  const rawValue = nonEmptyString(value);

  if (!rawValue) {
    return null;
  }

  const normalized = rawValue.replace(/^\$/, "").toUpperCase();
  return symbolPattern.test(normalized) ? normalized : null;
}

export function dedupeSymbols(
  values: readonly unknown[],
  max = SYMBOL_METADATA_MAX_BATCH_SIZE,
) {
  const symbols: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const symbol = normalizeSymbol(value);

    if (!symbol || seen.has(symbol)) {
      continue;
    }

    seen.add(symbol);
    symbols.push(symbol);

    if (symbols.length >= max) {
      break;
    }
  }

  return symbols;
}

export function normalizeLogoUrl(value: unknown) {
  const rawValue = nonEmptyString(value);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = new URL(rawValue);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function symbolMetadataFromRow(row: SymbolMetadataRow) {
  const symbol = normalizeSymbol(row.symbol);

  if (!symbol) {
    return null;
  }

  return {
    symbol,
    companyName: nonEmptyString(row.company_name) ?? nonEmptyString(row.companyName),
    exchange: nonEmptyString(row.exchange),
    logoUrl: normalizeLogoUrl(row.logo_url ?? row.logoUrl),
    logoSource: nonEmptyString(row.logo_source) ?? nonEmptyString(row.logoSource),
    logoUpdatedAt:
      nonEmptyString(row.logo_updated_at) ?? nonEmptyString(row.logoUpdatedAt),
  } satisfies SymbolMetadata;
}

export function isSymbolMetadataStale(
  metadata: Pick<SymbolMetadata, "logoUpdatedAt"> | null | undefined,
  now = new Date(),
  maxAgeDays = SYMBOL_METADATA_LOGO_REFRESH_INTERVAL_DAYS,
) {
  if (!metadata?.logoUpdatedAt) {
    return true;
  }

  const updatedAt = new Date(metadata.logoUpdatedAt);

  if (Number.isNaN(updatedAt.getTime())) {
    return true;
  }

  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  return now.getTime() - updatedAt.getTime() > maxAgeMs;
}
