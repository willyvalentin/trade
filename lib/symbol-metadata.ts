import "server-only";

import { normalizeUnknownError } from "@/lib/error-logging";
import {
  SYMBOL_METADATA_LOGO_REFRESH_INTERVAL_DAYS,
  SYMBOL_METADATA_MAX_BATCH_SIZE,
  dedupeSymbols,
  isSymbolMetadataStale,
  normalizeLogoUrl,
  normalizeSymbol,
  symbolMetadataFromRow,
  type SymbolMetadata,
  type SymbolMetadataRow,
} from "@/lib/symbol-metadata-core";
import {
  getServerSupabaseClient,
  getServerSupabaseReadClient,
} from "@/lib/supabase-server";

const symbolMetadataSelect =
  "symbol,company_name,exchange,logo_url,logo_source,logo_updated_at";
const finnhubLogoSource = "finnhub";

type ProviderSymbolMetadata = SymbolMetadata & {
  providerPayload: unknown;
};

type FinnhubProfileResponse = {
  name?: unknown;
  exchange?: unknown;
  logo?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export async function fetchFinnhubSymbolMetadata(symbol: string) {
  const normalizedSymbol = normalizeSymbol(symbol);
  const apiKey = process.env.FINNHUB_API_KEY?.trim();

  if (!normalizedSymbol || !apiKey) {
    return null;
  }

  try {
    const url = new URL("https://finnhub.io/api/v1/stock/profile2");
    url.searchParams.set("symbol", normalizedSymbol);
    url.searchParams.set("token", apiKey);

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      next: {
        revalidate: SYMBOL_METADATA_LOGO_REFRESH_INTERVAL_DAYS * 24 * 60 * 60,
      },
    });

    if (!response.ok) {
      console.warn("[symbol-metadata] finnhub_profile_request_failed", {
        symbol: normalizedSymbol,
        status: response.status,
      });
      return null;
    }

    const payload = (await response.json()) as FinnhubProfileResponse;
    const companyName = text(payload.name);
    const exchange = text(payload.exchange);
    const logoUrl = normalizeLogoUrl(payload.logo);

    if (!logoUrl && !companyName && !exchange) {
      return null;
    }

    return {
      symbol: normalizedSymbol,
      companyName,
      exchange,
      logoUrl,
      logoSource: finnhubLogoSource,
      logoUpdatedAt: new Date().toISOString(),
      providerPayload: payload,
    } satisfies ProviderSymbolMetadata;
  } catch (error) {
    console.warn("[symbol-metadata] finnhub_profile_request_error", {
      symbol: normalizedSymbol,
      error: normalizeUnknownError(error),
    });
    return null;
  }
}

export async function getCachedSymbolMetadata(symbols: readonly unknown[]) {
  const normalizedSymbols = dedupeSymbols(symbols);
  const metadataBySymbol = new Map<string, SymbolMetadata>();

  if (normalizedSymbols.length === 0) {
    return metadataBySymbol;
  }

  const { client, unavailable_reason } = getServerSupabaseReadClient();

  if (!client) {
    console.info("[symbol-metadata] supabase_read_unavailable", {
      unavailable_reason,
    });
    return metadataBySymbol;
  }

  try {
    const result = await client
      .from("symbol_metadata")
      .select(symbolMetadataSelect)
      .in("symbol", normalizedSymbols);

    if (result.error) {
      console.warn("[symbol-metadata] cache_read_failed", {
        error: normalizeUnknownError(result.error),
      });
      return metadataBySymbol;
    }

    for (const row of (result.data ?? []) as SymbolMetadataRow[]) {
      const metadata = symbolMetadataFromRow(row);

      if (metadata) {
        metadataBySymbol.set(metadata.symbol, metadata);
      }
    }
  } catch (error) {
    console.warn("[symbol-metadata] cache_read_error", {
      error: normalizeUnknownError(error),
    });
  }

  return metadataBySymbol;
}

async function upsertSymbolMetadata(metadata: ProviderSymbolMetadata) {
  const { client, unavailable_reason } = getServerSupabaseClient();

  if (!client) {
    console.info("[symbol-metadata] supabase_write_unavailable", {
      unavailable_reason,
    });
    return;
  }

  try {
    const result = await client.from("symbol_metadata").upsert(
      {
        symbol: metadata.symbol,
        company_name: metadata.companyName,
        exchange: metadata.exchange,
        logo_url: metadata.logoUrl,
        logo_source: metadata.logoSource,
        provider_payload: metadata.providerPayload,
        logo_updated_at: metadata.logoUpdatedAt,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "symbol",
      },
    );

    if (result.error) {
      console.warn("[symbol-metadata] cache_upsert_failed", {
        symbol: metadata.symbol,
        error: normalizeUnknownError(result.error),
      });
    }
  } catch (error) {
    console.warn("[symbol-metadata] cache_upsert_error", {
      symbol: metadata.symbol,
      error: normalizeUnknownError(error),
    });
  }
}

export async function refreshSymbolMetadata(symbol: unknown) {
  const normalizedSymbol = normalizeSymbol(symbol);

  if (!normalizedSymbol) {
    return null;
  }

  const providerMetadata = await fetchFinnhubSymbolMetadata(normalizedSymbol);

  if (!providerMetadata) {
    return null;
  }

  await upsertSymbolMetadata(providerMetadata);

  return {
    symbol: providerMetadata.symbol,
    companyName: providerMetadata.companyName,
    exchange: providerMetadata.exchange,
    logoUrl: providerMetadata.logoUrl,
    logoSource: providerMetadata.logoSource,
    logoUpdatedAt: providerMetadata.logoUpdatedAt,
  } satisfies SymbolMetadata;
}

export async function ensureSymbolMetadata(
  symbols: readonly unknown[],
  options: {
    maxBatchSize?: number;
    maxRefreshes?: number;
    refreshStale?: boolean;
  } = {},
) {
  const normalizedSymbols = dedupeSymbols(
    symbols,
    options.maxBatchSize ?? SYMBOL_METADATA_MAX_BATCH_SIZE,
  );
  const metadataBySymbol = await getCachedSymbolMetadata(normalizedSymbols);
  const shouldRefresh = options.refreshStale ?? true;

  if (!shouldRefresh || !process.env.FINNHUB_API_KEY?.trim()) {
    return metadataBySymbol;
  }

  const maxRefreshes = Math.max(0, options.maxRefreshes ?? 10);
  let refreshedCount = 0;

  for (const symbol of normalizedSymbols) {
    if (refreshedCount >= maxRefreshes) {
      break;
    }

    const cachedMetadata = metadataBySymbol.get(symbol);

    if (cachedMetadata && !isSymbolMetadataStale(cachedMetadata)) {
      continue;
    }

    refreshedCount += 1;
    const refreshedMetadata = await refreshSymbolMetadata(symbol);

    if (refreshedMetadata) {
      metadataBySymbol.set(symbol, refreshedMetadata);
    }
  }

  return metadataBySymbol;
}
