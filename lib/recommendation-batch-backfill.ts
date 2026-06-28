export const RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE = 10;
export const RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP = 100;

export type RecommendationBatchBackfillChunkFetchResult<Row> = {
  data?: readonly Row[] | null;
  error?: unknown | null;
};

export type RecommendationBatchBackfillChunkFetch<Row> = (
  fingerprints: readonly string[],
  chunkIndex: number,
) => Promise<RecommendationBatchBackfillChunkFetchResult<Row>>;

export type RecommendationBatchBackfillResult<Row> = {
  ok: boolean;
  requestedFingerprintCount: number;
  cappedFingerprintCount: number;
  fingerprintsCapped: boolean;
  chunkSize: number;
  cap: number;
  chunks: string[][];
  rows: Row[];
  error: unknown | null;
};

function toPositiveInteger(value: number, fallback: number) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export function buildRecommendationBatchBackfillChunks(
  fingerprints: readonly string[],
  options: {
    chunkSize?: number;
    cap?: number;
  } = {},
) {
  const chunkSize = toPositiveInteger(
    options.chunkSize ?? RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE,
    RECOMMENDATION_BATCH_BACKFILL_CHUNK_SIZE,
  );
  const cap = toPositiveInteger(
    options.cap ?? RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP,
    RECOMMENDATION_BATCH_BACKFILL_FINGERPRINT_CAP,
  );
  const normalizedFingerprints = Array.from(
    new Set(
      fingerprints
        .map((fingerprint) => fingerprint.trim())
        .filter((fingerprint) => fingerprint.length > 0),
    ),
  );
  const cappedFingerprints = normalizedFingerprints.slice(0, cap);
  const chunks: string[][] = [];

  for (let index = 0; index < cappedFingerprints.length; index += chunkSize) {
    chunks.push(cappedFingerprints.slice(index, index + chunkSize));
  }

  return {
    requestedFingerprintCount: normalizedFingerprints.length,
    cappedFingerprintCount: cappedFingerprints.length,
    fingerprintsCapped: normalizedFingerprints.length > cappedFingerprints.length,
    chunkSize,
    cap,
    chunks,
  };
}

export async function fetchChunkedRecommendationBatchBackfillRows<Row>(
  fingerprints: readonly string[],
  fetchChunk: RecommendationBatchBackfillChunkFetch<Row>,
  options: {
    chunkSize?: number;
    cap?: number;
  } = {},
): Promise<RecommendationBatchBackfillResult<Row>> {
  const plan = buildRecommendationBatchBackfillChunks(fingerprints, options);
  const rows: Row[] = [];

  for (let chunkIndex = 0; chunkIndex < plan.chunks.length; chunkIndex += 1) {
    const result = await fetchChunk(plan.chunks[chunkIndex], chunkIndex);

    if (result.error) {
      return {
        ...plan,
        ok: false,
        rows: [],
        error: result.error,
      };
    }

    rows.push(...(result.data ?? []));
  }

  return {
    ...plan,
    ok: true,
    rows,
    error: null,
  };
}
