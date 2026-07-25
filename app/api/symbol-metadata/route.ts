import { NextResponse } from "next/server";

import { normalizeUnknownError } from "@/lib/error-logging";
import {
  SYMBOL_METADATA_MAX_BATCH_SIZE,
  dedupeSymbols,
  type SymbolMetadata,
} from "@/lib/symbol-metadata-core";
import { ensureSymbolMetadata } from "@/lib/symbol-metadata";
import {
  applicationSessionUnauthorizedResponse,
  applicationMutationForbiddenResponse,
  requireApplicationSession,
} from "@/lib/server/application-session";

export const dynamic = "force-dynamic";

function getRequestSymbols(body: unknown) {
  if (!body || typeof body !== "object" || !("symbols" in body)) {
    return [];
  }

  const symbols = (body as { symbols?: unknown }).symbols;
  return Array.isArray(symbols) ? symbols : [];
}

function serializeMetadata(metadata: SymbolMetadata) {
  return {
    symbol: metadata.symbol,
    companyName: metadata.companyName,
    exchange: metadata.exchange,
    logoUrl: metadata.logoUrl,
    logoSource: metadata.logoSource,
    logoUpdatedAt: metadata.logoUpdatedAt,
  };
}

export async function POST(request: Request) {
  const session = await requireApplicationSession();
  if (!session) return applicationSessionUnauthorizedResponse();
  const originError = applicationMutationForbiddenResponse(request);
  if (originError) return originError;

  let body: unknown = null;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const symbols = dedupeSymbols(
    getRequestSymbols(body),
    SYMBOL_METADATA_MAX_BATCH_SIZE,
  );
  const refresh =
    body && typeof body === "object" && "refresh" in body
      ? (body as { refresh?: unknown }).refresh !== false
      : true;

  if (symbols.length === 0) {
    return NextResponse.json({
      symbols,
      metadata: [],
    });
  }

  try {
    const metadataBySymbol = await ensureSymbolMetadata(symbols, {
      refreshStale: refresh,
      maxRefreshes: 10,
    });
    const metadata = symbols
      .map((symbol) => metadataBySymbol.get(symbol))
      .filter((metadata): metadata is SymbolMetadata => Boolean(metadata))
      .map(serializeMetadata);

    return NextResponse.json({
      symbols,
      metadata,
    });
  } catch (error) {
    console.warn("[symbol-metadata] route_error", {
      error: normalizeUnknownError(error),
    });

    return NextResponse.json({
      symbols,
      metadata: [],
    });
  }
}
